# 萨瓦迪卡 V12 · 开源技术决策

更新时间：2026-08-22

筛选条件：许可证可商用、能离线、适配移动网页与 iPhone、不把安装包拖垮、不会把实验结果冒充母语认证。

## 已集成

| 组件 | 固定版本 | 许可 | 用途 | 产品边界 |
|---|---:|---|---|---|
| [Driver.js](https://github.com/nilbuild/driver.js) | 1.8.0 | MIT | 按学习方向、当前语域和课程场景生成首次引导 | 本地 vendor，不用 CDN；S1 使用独立安全引导 |
| [canvas-confetti](https://github.com/catdad/canvas-confetti) | 1.9.4 | ISC | 仅在有效新纪录或高分结算时给游戏反馈 | 尊重 `prefers-reduced-motion`，不替代文字反馈 |
| [Pitchy](https://github.com/ianprime0509/pitchy) | 4.1.0 | MIT | 在设备本地提取固定学习示范音与用户录音的 F0 轨迹 | 只显示归一化后的相对音高走势，不进入总分，不声称能独立判断中文或泰语词汇声调 |
| [fft.js](https://github.com/indutny/fft.js) | 4.0.4 | MIT | Pitchy 的固定依赖 | 已合并进本地浏览器 bundle |

精确哈希、npm integrity 与许可证全文见 `vendor/THIRD_PARTY_NOTICES.md` 和 `vendor/licenses/`。

## 下一阶段适合做成可删除增强包

| 组件 | 许可状态 | 体积 / 平台 | 决策 |
|---|---|---|---|
| [sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx) | 运行时 Apache-2.0；每个模型另审 | WASM、iOS、Android；泰语 int8 ASR 约 154MB | 适合可选离线识别包，不进入主 PWA。先完成模型权重与训练数据许可审计 |
| [Silero VAD](https://github.com/snakers4/silero-vad) | MIT | ONNX 约 2MB；可配合 WASM | 适合自动截掉静音、拒绝过短录音；下一阶段接入 |
| [whisper.cpp](https://github.com/ggml-org/whisper.cpp) | MIT | tiny 多语种约 75MiB，内存约 273MB | 适合未来自由对话包；不适合默认塞进 iPhone PWA |
| [PyThaiNLP](https://github.com/PyThaiNLP/pythainlp) | 代码 Apache-2.0；语料逐项审计 | Python 构建工具 | 只在构建期为 3000 词预生成音节、IPA/G2P 与质检候选，不在手机运行 |
| [`Intl.Segmenter("th")`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter) | 浏览器内置 | 零新增体积 | 继续用于泰语分段与高亮；固定词库保留预生成边界兜底 |

## 暂不采用

- Piper：当前维护分支为 GPL-3.0，泰语声音与各模型权利不够清晰，不适合直接嵌入当前产品。
- Shepherd：最新版采用 AGPL / 商业双许可，当前商业分发条件不合适。
- Howler.js：能统一播放层，但不会让音色更自然；替换现有双音轨播放逻辑收益低、回归风险高。
- Phaser：对当前 DOM 学习游戏过重，并会增加移动端无障碍与包体成本。
- 开源泰语 TTS：目前没有同时满足“泰语标准、软萌自然、浏览器/iPhone 离线、许可清晰”的成熟方案，因此 V12 不用另一套机器音替换现有声音。当前高频内容使用固定神经语音学习示范音，不是真人录音；后续应逐步替换为经过中泰母语教师终审的真人标准录音。角色萌音与标准学习音继续分轨。

## 不可越过的质量边界

1. 3000 词的翻译、读音、中文近音和语域不能在浏览器里临时猜；必须预生成、自动交叉校验并保留审核状态。
2. 音高轨迹、ASR 命中率和节奏只能组成“设备练习反馈”，不能写成“母语认证”。
3. S1/S2 内容不能从字幕或网络俚语自动生成；必须保持核心语义一致，分别记录使用场景、攻击对象、粗俗度、风险提示和母语审核状态。
4. “可爱音色”与“低素质措辞”是两个字段；禁止为了可爱直接机械升调，因为这会破坏泰语辨义声调。
5. 中文及泰语母语教师的逐句终审、签字与上线批准由项目方组织并负责；代码中的 `pending` 状态、自动 QA、设备转写和相对音高镜只能帮助筛查，不能替代终审。
