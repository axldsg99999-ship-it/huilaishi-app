# App Store App Privacy 建议答案

> 以当前 iOS 商店构建为准；提交时按 App Store Connect 最新定义复核。

## 建议选择

“Do you or your third-party partners collect data from this app?”：**No, we do not collect data from this app.**

依据：

- 无账号、广告、分析、开发者远程日志或云同步。
- 学习进度、收藏、成绩和昵称只保存在应用沙盒。
- 麦克风录音由用户主动开始，用于临时回放和本机练习反馈；开发者不接收。
- iOS 系统备份是否包含应用沙盒由用户自己的 Apple 设备备份设置控制，不是开发者运营的云服务。
- iOS 商店构建物理移除真人 WebRTC 邀请房。

## 语音识别复核点

如果正式 iOS 版启用 Apple Speech 或任何第三方云端识别 SDK，应先记录音频传输对象、保存期限和用途，再重新判断是否需要申报 Audio Data。当前 Web 层只在用户明确允许时尝试设备/系统提供的识别，开发者不接收音频。

## 隐私 URL

https://axldsg99999-ship-it.github.io/huilaishi-app/privacy.html

## PrivacyInfo.xcprivacy

- Tracking：false
- Tracking domains：空
- Collected data types：空
- Required reason APIs：当前空；每次升级 Capacitor 或新增原生依赖后重新扫描构建产物。
