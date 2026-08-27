# 萨瓦迪卡·真实语伴后端骨架

这个目录是面向 GitHub Pages 静态前端的可部署后端，不会把本地 AI 体验搭子伪装成真人。它提供两条相互独立的路径：

1. `supabase/`：有账号、可中央匹配的生产骨架。
2. `p2p/`：无账号、无中央匹配的手动邀请 WebRTC 传输层。

## 已完成的现状审计

- 现有应用是纯静态 PWA，没有 npm 运行时、服务器 API 或数据库。
- 现有“互助搭子”由 `app.js` 里的本地定时器回复，页面已标注“AI 体验搭子”。
- 工作环境中未找到 Supabase、Firebase、Cloudflare、Postgres、Neon、Vercel 或 Netlify 相关环境变量。
- 仓库中未找到 `.env`、Supabase/Firebase/Wrangler 配置或已绑定项目。
- 本机没有 Supabase CLI、Docker、PostgreSQL CLI 或 Deno，因此这一轮只能做静态校验，不能声称已上线或已完成 RLS 集成测试。

审计过程只检查了变量名是否存在，没有读取或输出任何密钥值。

## Supabase 架构

```text
GitHub Pages
  ├─ Auth（邮箱/手机/SSO，禁止匿名匹配）
  ├─ RPC（匹配、发消息、互改、举报、拉黑）
  ├─ Realtime（消息变更 + 私有频道打字状态）
  └─ Edge Function（签发短时语音上传票据）
                │
                ▼
      Postgres + RLS + 私有 Storage
```

数据模型覆盖：资料、反向语种匹配队列、在线心跳、双人会话、文字/语音消息元数据、互改、已读、拉黑、举报和服务端限流桶。

### 为什么静态前端可以安全直连

- 浏览器只持有 publishable/anon key，该 key 本来就是公开的。
- 所有数据表启用并强制 RLS；客户端没有消息、匹配、互改、举报或在线表的直写权限。
- 有副作用的写入只通过 `security definer` RPC，每次重新检查 `auth.uid()`、会话成员、拉黑状态和限流。
- 语音桶为私有桶，没有给登录用户开放直接上传权限。只有 Edge Function 使用服务端密钥签发限定到单一对象路径、禁止覆盖的上传票据。Supabase 当前的 signed upload token 固定有效期为 2 小时，详见 <https://supabase.com/docs/reference/javascript/file-buckets-createsigneduploadurl>。
- service-role key 只能作为 Edge Function secret，不得出现在 `config.example.js`、静态 JS、GitHub Actions 产物或浏览器日志中。

## 部署步骤

前置条件：创建 Supabase 项目，安装 Supabase CLI，配好邮箱/手机/SSO 中至少一种登录方式和 CAPTCHA。匹配 RPC 会拒绝匿名 JWT，并且只接受已完成资料、自我确认 18+ 的账号。

```bash
supabase --workdir backend login
supabase --workdir backend link --project-ref YOUR_PROJECT_REF
supabase --workdir backend db push

# 先复制 supabase/functions/.env.example 为不入库的 .env，再设置远程 secrets
supabase --workdir backend secrets set --env-file supabase/functions/.env
supabase --workdir backend functions deploy voice-upload-ticket --no-verify-jwt
```

`--no-verify-jwt` 不是公开端点：函数会用 `auth.getUser()` 向 Auth 服务器重新验证 bearer token。这样同时兼容 Supabase 新签名密钥。

在 Dashboard 启用 `pg_cron` 后，每分钟运行一次短期数据清理：

```sql
select cron.schedule(
  'huilaishi-partner-cleanup',
  '* * * * *',
  $$select private.cleanup_partner_ephemera();$$
);
```

最后把 `config.example.js` 复制到前端的 `partner-config.js`，填入项目 URL 和公开 key，在完成集成测试前保持 `enabled: false`。

## 前端接入契约

### 1. 登录与资料

1. 用 Supabase Auth 邮箱 OTP、手机 OTP 或 SSO 登录，不用匿名账号做真人匹配。
2. 通过 `get_my_profile()` 读取自己的完整资料；直接更新自己的 `profiles` 允许字段：`display_name`、`avatar_path`、`native_language`、`learning_language`、`proficiency`、`is_adult`、`onboarding_complete`。会话对方只能读取昵称、头像路径和语言水平等非敏感列。
3. 只有 RPC 返回 `matched` 且取得真实 `partner_id` 后，UI 才能显示“真人已连接”。`waiting`、超时、掉线或未配置都不能生成假头像、假正在输入或假回复。

### 2. 匹配与 presence

```js
const deviceId = localStorage.partnerDeviceId ||= crypto.randomUUID();
const { data, error } = await supabase.rpc("find_partner", {
  p_device_id: deviceId,
});
// data[0].match_status: "waiting" | "matched"
```

- 等待时订阅自己的 `match_queue` 行，或以有上限的退避轮询重试 `find_partner`。
- 前台每 20 秒调用 `heartbeat_presence(deviceId, 'online', conversationId)`；页面隐藏发 `away`，退出发 `offline`。
- 队列超过 90 秒、对方心跳超过 90 秒，都必须在 UI 中显示为离线。
- 输入状态只用私有 Realtime 频道 `conversation:<uuid>` 的 broadcast/presence，不当成可信消息。持久消息以 `messages` 表为准。

### 3. 文字、互改和已读

```js
await supabase.rpc("send_text_message", {
  p_conversation_id: conversationId,
  p_text: text,
  p_client_nonce: crypto.randomUUID(),
  p_reply_to_id: null,
});

await supabase.rpc("submit_correction", {
  p_source_message_id: sourceMessageId,
  p_corrected_text: correctedText,
  p_note: note || null,
  p_client_nonce: crypto.randomUUID(),
});

await supabase.rpc("mark_conversation_read", {
  p_conversation_id: conversationId,
});
```

`client_nonce` 必须在本地发送队列中保留，重试时复用原 UUID，才能获得幂等效果。

### 4. 语音留言

1. 录音完成后确认 Blob 不超过 5 MiB/120 秒。
2. 带当前 access token 调用 `voice-upload-ticket` Edge Function，传入 `conversationId`、`mimeType`、`durationMs`、`sizeBytes`、`clientNonce`。
3. 使用 Storage SDK 的 `uploadToSignedUrl(objectPath, token, blob)` 上传。
4. 上传成功后调用 `finalize_voice_message`；只有这一步成功后才向聊天列表插入消息。
5. 播放时为私有对象生成短时 signed download URL，不持久化该 URL。

### 5. 拉黑与举报

- `block_user` 会立即关闭两人的活跃会话并中止当前匹配。
- `submit_report` 可关联会话和具体消息，默认 `p_also_block: true`。
- 举报内容只对举报者和 JWT `app_metadata.role = moderator` 的审核员可见。该角色只能由服务端/Dashboard 设置。
- 前端看到 `conversation_blocked`、`account_not_active` 或 RLS 拒绝后必须立即停止发送，不进行本地伪成功。

## 无账号手动邀请 P2P

`p2p/manual-peer.js` 是可直接被 HTTPS 页面以 ES module 导入的传输层。它不需要 Supabase 账号，也不会自动找陌生人。

主持人：

```js
import { ManualPeerSession } from "./backend/p2p/manual-peer.js";

const session = new ManualPeerSession();
const { offerCode, verificationCode } = await session.createOffer();
// 把 offerCode 通过信任的聊天工具发给对方。
await session.acceptAnswer(answerCodeFromFriend);
```

受邀者：

```js
const { session, answerCode, verificationCode } =
  await ManualPeerSession.acceptOffer(offerCodeFromFriend);
// 把 answerCode 发回主持人。
```

双方应通过另一条可信通道口头核对同一个 `verificationCode`。连接后可用：

```js
session.sendText("你好", { language: "zh" });
session.sendCorrection(sourceMessageId, "您好", { note: "更礼貌" });
await session.sendVoice(recordedBlob, { durationMs: 2400, language: "th" });

session.addEventListener("text", ({ detail }) => renderText(detail));
session.addEventListener("correction", ({ detail }) => renderCorrection(detail));
session.addEventListener("voice", ({ detail }) => playBlob(detail.blob));
session.addEventListener("state", ({ detail }) => renderConnectionState(detail.state));
```

语音以 12 KiB 分块发送，校验顺序、总块数和字节数；30 秒未收完会丢弃。连接每 15 秒心跳，45 秒无对端活动或断线宽限超时会结束。`blockPeer()` 只对当次会话有效；`exportIncident()` 只会生成本地证据 JSON，不会假装成已提交中央举报。

限制必须在 UI 中明示：

- 没有中央匹配、账号身份、服务端聊天记录、持久拉黑或平台举报。
- WebRTC 数据通道本身加密，但手动邀请码若被替换仍可受中间人攻击，所以必须核对验证码。
- 邀请码可包含 ICE 网络信息，只发给信任的人。默认使用 Cloudflare 公开 STUN，STUN 提供方会看到双方 IP；同一局域网可传 `iceServers: []` 禁用它。
- STUN 不是 TURN。对称 NAT、校园/公司防火墙下直连可能失败。真正高可用需要服务端临时签发 TURN 凭据，不能把长期 TURN 账密写进静态 JS。Cloudflare 官方的 STUN/TURN 端口与临时凭据方案见 <https://developers.cloudflare.com/realtime/turn/> 和 <https://developers.cloudflare.com/realtime/turn/generate-credentials/> 。
- 所有消息默认只在内存中，刷新即消失。录音权限与 Blob 生成由 UI 层处理，传输层不会自动打开麦克风。

## 上线前的阻断项

1. **缺少 Supabase 项目与凭据**：中央匹配目前不可上线，`enabled` 必须保持 `false`。
2. **缺少前端集成**：本任务按要求没有修改 `app.js/index.html/styles.css`；必须后续接入状态机、登录页、聊天列表和安全操作。P2P 传输层已可导入，但当前主应用还没有入口。
3. **缺少真机双账号/RLS 测试**：必须覆盖 A/B/非成员/审核员四种身份和拉黑后竞态。
4. **缺少审核运营**：数据库可收集举报，但仍需值班人员、响应 SLA、证据保留和封禁流程。
5. **缺少合规文本**：需隐私政策、用户协议、账号/数据删除、语音保留期和中泰跨境数据评估。
6. **需要 TURN 才能做高连通率 P2P**：当前无账号模式只有 STUN，无法保证所有移动网络可连。
7. **需要孤儿语音清理作业**：用户取得上传票据后可能未完成 finalize；应每日由 service role 删除 24 小时前且未被 `messages` 引用的对象。

在上述条件完成前，可以将这些文件称为“可部署后端骨架”，不能称为“真人语伴已上线”。
