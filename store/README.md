# 萨瓦迪卡商店提交包

此目录只服务 Google Play / App Store 原生商店版。网页测试版和三星直装版继续使用各自的发布流程。

## 已由代码保证

- Android 使用 `com.huilaishi.app`、target/compile API 36，并可构建签名 AAB 候选包。
- iOS 使用 `com.huilaishi.app`、iOS 15+，CI 固定 Xcode 26 / iOS 26 SDK。
- 商店包物理移除未具备平台级举报和封禁闭环的真人 WebRTC 邀请房；同机对战、AI 体验、闯关和打怪保留。
- Android 关闭应用备份；隐私、条款和支持页面可从应用内访问并随离线包安装。
- `npm run validate:store` 检查代码级条件；`npm run validate:store:strict` 在人工门禁未完成时拒绝生产提交。

## 仍必须由项目方完成

依次填写 `compliance/` 中四个 JSON 文件：

1. `publisher.json`：与两个开发者账号一致的运营主体和支持邮箱。
2. `voice-rights.json`：成年录音者授权或可证明商用再分发的合成声音凭据。
3. `language-review.json`：中泰母语教师终审人和报告。
4. `device-qa.json`：三星 A57、另一台 Android 及至少一台真 iPhone 的完整测试记录。

四项全部完成后把相应 `status` 改为文档约定值，再运行严格门禁。严禁仅为“通过脚本”而虚填。

## 提交顺序

1. 先跑内部测试候选 AAB 和 iOS Simulator。
2. 完成真实设备测试、词库终审和声音权利归档。
3. 运行 `npm run validate:store:strict`。
4. Google Play 先内部/封闭测试；Apple 先 TestFlight。
5. 用 `listing/`、`questionnaires/` 和 `review-notes.md` 填写控制台。
6. 通过测试反馈后才提交生产审核。
