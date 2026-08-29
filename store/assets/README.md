# 商店视觉素材

这些素材直接由当前应用界面生成，不使用虚构界面或尚未上线的功能。

## 文件

- `apple-1320x2868/`：6 张 iPhone 6.9 英寸竖屏候选截图，1320 × 2868。
- `google-phone/`：6 张 Google Play 手机竖屏候选截图，1080 × 1920。
- `google-feature-graphic-1024x500.png`：Google Play 宣传横幅，1024 × 500。
- `source/google-feature-graphic.html`：横幅的可复现 HTML/CSS 源文件，只引用仓库内已使用的图标和怪物素材。

截图覆盖主页、词汇、发音课、游戏大厅、打怪和同机对战。商店提交前，在母语教师终审和正式声音包替换完成后重新生成一遍，确保截图文字与最终二进制完全一致。

运行 `node --test tests/store-assets.test.mjs` 可检查数量和像素尺寸。

