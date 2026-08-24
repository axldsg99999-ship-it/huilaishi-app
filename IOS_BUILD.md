# iPhone / iPad 构建与 TestFlight 门槛

本仓库现在有两条苹果端路径，状态必须分开描述：

1. **Safari PWA：现在可用。** iPhone/iPad 用 Safari 打开部署地址，选择“分享/更多 → 添加到主屏幕 → 作为网页 App 打开 → 添加”。这不需要 Apple Developer 账号，也不是 App Store 包。
2. **原生 Capacitor iOS：工程与构建链已完成。** GitHub Actions 能在没有任何 Apple 凭证时生成工程并完成无签名 iOS Simulator 编译；它证明代码可编译，但产物只能用于模拟器，**不是 IPA，也不能装到真机**。

只有完成本页“签名与上传凭证”后，受保护的工作流才会生成 App Store Connect 签名归档并上传供 TestFlight 处理。上传不会自动发布到 App Store，也不会自动开放外部测试。

## 当前官方基线（2026-08-24 核验）

- [Capacitor 8 iOS 文档](https://capacitorjs.com/docs/ios)要求 iOS 15+ 和 Xcode 26+；项目固定使用 `@capacitor/* 8.5.0`、部署目标 iOS 15。
- [Apple 的当前提交要求](https://developer.apple.com/news/upcoming-requirements/)规定，自 2026-04-28 起上传到 App Store Connect 的 iOS/iPadOS 应用必须由 Xcode 26+ 和 iOS/iPadOS 26 SDK+ 构建。
- CI 固定使用 GitHub 官方 `macos-26` 镜像和 `/Applications/Xcode_26.6.app`，并在构建前再次检查 Xcode 与 SDK 主版本，避免 `macos-latest` 漂移。
- [Apple 分发文档](https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-releases)明确：TestFlight 或 App Store 真机分发需要加入 Apple Developer Program。

## 工程内容

`scripts/configure-ios.mjs` 每次从已通过门禁的网页源码确定性生成原生资源，不提交容易过期的 `ios/` 生成目录。生成包包含：

- 双向课程、游戏与正式训练词库；
- 696 条核心课程/界面音频；
- 中→泰和泰→中 L1 词头音频各 500 条，共 1,000 条；
- 原生 iOS 启动页、1024×1024 品牌图标；
- 麦克风与语音识别用途说明；
- `PrivacyInfo.xcprivacy` 最小诚实声明：不追踪、无跟踪域、当前未声明 required-reason API。

L2–L6 大声音包不塞入原生安装包，避免应用膨胀；完整分级声包继续由 HTTPS/PWA 按需安装。文字词库与游戏不受此限制。

## 本地 Mac 构建

需要 macOS、Node 22+、Xcode 26+：

```bash
npm run check
npm install --no-save --package-lock=false \
  @capacitor/core@8.5.0 @capacitor/cli@8.5.0 @capacitor/ios@8.5.0
node scripts/configure-ios.mjs stage
./node_modules/.bin/cap add ios
node scripts/configure-ios.mjs configure
xcodebuild -project ios/App/App.xcodeproj -scheme App \
  -configuration Debug -destination 'generic/platform=iOS Simulator' \
  -derivedDataPath ios-build/DerivedData CODE_SIGNING_ALLOWED=NO build
```

要在 Xcode 中查看或连接自己的测试机，运行 `npx cap open ios`。真机运行仍需要在 Signing & Capabilities 中选择有效 Apple Developer Team。

## 签名与上传凭证

原生标识固定为 `com.huilaishi.app`。开始签名流程前，需要由项目所有者在 Apple 后台完成：

1. 加入 Apple Developer Program，并接受当前协议；
2. 在 Certificates, Identifiers & Profiles 注册显式 App ID `com.huilaishi.app`；
3. 在 App Store Connect 创建与该 Bundle ID 对应的 iOS App 记录；
4. 创建包含私钥的 Apple Distribution 证书（导出为密码保护的 `.p12`）；
5. 为 `com.huilaishi.app` 创建 App Store Connect provisioning profile；
6. 创建有权上传构建的 App Store Connect API key，并妥善保存只可下载一次的 `.p8` 私钥。

在 GitHub 的受保护 `app-store-connect` Environment 中配置全部八个 secrets：

| Secret | 内容 |
| --- | --- |
| `APPLE_TEAM_ID` | 10 位开发团队 ID |
| `APPLE_CERTIFICATE_BASE64` | `.p12` 的 Base64 |
| `APPLE_CERTIFICATE_PASSWORD` | `.p12` 密码 |
| `APPLE_CERTIFICATE_SHA256` | 分发证书 SHA-256 指纹，CI 会强校验 |
| `APPLE_PROVISIONING_PROFILE_BASE64` | App Store Connect `.mobileprovision` 的 Base64 |
| `APP_STORE_CONNECT_API_KEY_ID` | 10 位 API Key ID |
| `APP_STORE_CONNECT_ISSUER_ID` | API Issuer ID |
| `APP_STORE_CONNECT_API_PRIVATE_KEY_BASE64` | `AuthKey_*.p8` 的 Base64 |

不要把证书、密码、profile 或 `.p8` 提交到仓库、issue、构建日志或聊天。工作流缺少任意一项都会停止，不会降级为伪签名包；证书指纹、profile 的 Team/Bundle ID 和过期时间也会在归档前核对。

## 运行工作流

- 普通 push/PR 会运行 **Unsigned iOS Simulator verification**。上传的 ZIP 文件名和随附 README 都明确标为 simulator-only。
- 只有在 `main` 分支手动运行 **iOS build and guarded TestFlight upload**，并把 `upload_to_testflight` 设为 `true`，才会进入受保护的 `app-store-connect` Environment。
- 工作流成功上传后，构建仍需等待 Apple 处理；外部 TestFlight 还可能需要 Beta App Review。App Store 发布必须另行完成元数据、隐私问卷、年龄分级、截图、审核说明和 App Review，工作流不会替用户点击发布。

## 上传前仍要人工复核

`PrivacyInfo.xcprivacy` 只反映当前仓库没有原生 Preferences/Filesystem 等 required-reason 插件，也没有跟踪 SDK。每次加入插件或原生代码后，都必须在 Xcode Organizer 检查归档的 Privacy Report，并按 [Apple 隐私清单要求](https://developer.apple.com/documentation/bundleresources/privacy_manifest_files)复核 required-reason API；不要为了过门禁随便填理由代码。

同时还要：

- 在真机验证麦克风授权、录音回放、前后台切换和低存储场景；
- 由项目方完成中泰母语教师终审，当前自动门禁不等于语言内容批准；
- 根据实际 TestFlight/App Store 行为填写 App Privacy（尤其是用户主动发给语伴的文字/语音）；
- 补齐声音正式商业生成与再分发凭证，或替换为权利链完整的资产；
- 提供 App Store 截图、支持网址、隐私政策网址、审核账号/说明（如适用）与新的年龄分级答案。

在这些项目和 Apple 凭证齐全前，只能准确说“PWA 可安装、原生工程已可构建”，不能说“苹果 IPA 可下载”或“已经上架”。
