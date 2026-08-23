# 词库补全与母语终审流程

## 当前事实口径

- 正式产品当前包含 3,000 张训练卡、2,875 组独立中泰词对和 125 张复现训练卡。
- 125 张复现卡分布为 L3 85 张、L4 37 张、L5 3 张。
- 在候选词通过下述门禁以前，不得把“3,000 张训练卡”改称“3,000 个独立词对”。

## 候选数据来源

第一轮 125 条母语终审候选位于 `lexicon-review/first-pass-125.json`，SHA-256 为
`2E099D6308E43413FA211526DF0317453A578B8BC882B028A6EF4B9DAB744558`。每条都映射到一张复现卡并保存中、泰、英三条 OMW 2.0 来源记录；所有条目当前均为
`secondSourceConfirmed: false`、`nativeReviewed: false`、`importEligible: false`。它是审核队列，不是正式词库，也不进入应用运行时或离线单文件。

补词候选使用 Open Multilingual Wordnet 2.0 中共享的 Princeton WordNet 3.0 synset 作为概念索引。固定输入如下：

| 数据 | 固定版本 | 原始字节 | SHA-256 |
| --- | --- | ---: | --- |
| Chinese Open WordNet `wn-data-cmn.tab` | OMW 2.0 | 2,547,318 | `379FD2E41D3E1395F9F27CF23A39C6181849FFB4020C14A07ED2A4D4DD651122` |
| Thai WordNet `wn-data-tha.tab` | OMW 2.0 | 5,089,930 | `33445C39F9329130012E8013113023B42C630BBCBB61D49434D86BBDB2C710CF` |
| Princeton WordNet `wn-data-eng.tab` | OMW 2.0 | 5,843,130 | `D1409D88ADDCDB890B1606DD280B558CCA4258B1F33BD580D54ED949DAAD1EDE` |

完整许可文字位于：

- `vendor/licenses/chinese-open-wordnet-2.0.txt`
- `vendor/licenses/thai-wordnet-2.0.txt`
- `vendor/licenses/princeton-wordnet-3.0.txt`

同一 synset 只用于生成审核候选，不等于翻译已经正确。源数据中存在可证实的错配，因此不能把自动对齐结果直接上线。

## 正式导入门禁

每个候选必须同时满足：

1. 中文、泰文、词性和概念边界由第二个独立来源确认；禁止只经英语释义做中→英→泰机器拼接。
2. 中泰母语审核人分别确认词义、自然度、使用范围、量词或搭配；记录审核人、日期和版本。
3. 中文拼音与泰语转写分别记录来源。算法生成项必须标记 `generated`，不能标成标准发音或人工审核。
4. 例句单独审核；未通过时保持阻断，不得因为词头通过而自动放行。
5. 新词对、中文词头、泰文词头、synset 和卡片 ID 均通过字面与概念去重。
6. 对应音频重新生成、校验并登记商用凭据。在此之前，旧 ID 声音别名不得播放不同文字；运行时会回退到当前文字的设备声线。
7. 只有 `nativeReviewed: true`、`secondSourceConfirmed: true`、`audioTextMatched: true` 的记录才允许设为 `importEligible: true`。

建议先准备约 250 个候选，预留至少 50% 淘汰空间，最终录取 125 个。

运行 `npm run validate:lexicon-review` 可检查候选数量、复现卡映射、现库与批内字面去重、synset/POS 一致性、固定版本与文件哈希、许可证记录，以及所有导入阻断标志。这个自动门禁不能替代语义和自然度终审。

## 许可证与署名边界

Chinese Open WordNet、Thai WordNet 和 Princeton WordNet 的许可允许商业使用、修改和分发，但要求在所有副本及修改版中保留完整版权、许可和免责声明。不得在宣传中使用 NICT 或 Princeton 的名称作背书。使用这些开放数据不代表任何来源方批准了本应用或其语言质量。
