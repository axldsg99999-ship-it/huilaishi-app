const sharedColors = [
  { color: "#595cff", soft: "#ececff", ink: "#fff", safe: 96, safeColor: "#37a66f" },
  { color: "#26c7b8", soft: "#e2faf7", ink: "#123630", safe: 84, safeColor: "#37a66f" },
  { color: "#8aae32", soft: "#f0f8dc", ink: "#22310d", safe: 62, safeColor: "#d49c1b" },
  { color: "#ff9f2f", soft: "#fff0d9", ink: "#3f2608", safe: 35, safeColor: "#e4862d" },
  { color: "#ff5967", soft: "#ffeaec", ink: "#fff", safe: 10, safeColor: "#ff5967" }
];

const product = {
  "zh-th": {
    key: "zh-th",
    interfaceLang: "zh-CN",
    targetLang: "th-TH",
    targetHtmlLang: "th",
    brand: "萨瓦迪卡",
    mark: "ส",
    directionLabel: "中文 → ไทย",
    setup: {
      tag: "泰语语境训练场 · BETA",
      eyebrow: "同一句泰语 · 五种说法",
      title: "你今天想<br><em>多有素质？</em>",
      lede: "选的是一句话的分寸，不是给你贴标签。<br>从见老板到熟人互怼，都能学。",
      signA: "พูดให้เป็น",
      signB: "曼谷 · 01",
      picker: "我的开局表达档位",
      start: "就这样，开口闯关",
      peek: "先随便看看"
    },
    modes: [
      {
        code: "S5", short: "体面", name: "体面王者", desc: "正式 · 长辈 · 客户", risk: "几乎安全",
        target: "รบกวนขอน้ำเปล่าหนึ่งขวดได้ไหมครับ", roman: "róp-kuan khɔ̌ɔ náam-plàao nʉ̀ng khùat dâi mái khráp", meaning: "劳驾，可以给我一瓶水吗？",
        contexts: [["老板 ✓",0],["长辈 ✓",0],["陌生人 ✓",0]], reaction: "礼貌拉满，有点正式", face: "☺"
      },
      {
        code: "S4", short: "懂事", name: "懂事局", desc: "自然礼貌 · 万能开局", risk: "放心说",
        target: "ขอน้ำเปล่าหนึ่งขวดครับ", roman: "khɔ̌ɔ náam-plàao nʉ̀ng khùat khráp", meaning: "请给我一瓶水。",
        contexts: [["店员 ✓",0],["陌生人 ✓",0],["朋友 ✓",0]], reaction: "自然，放心说", face: "☺"
      },
      {
        code: "S3", short: "熟人", name: "熟人局", desc: "朋友 · 同学 · 松弛口语", risk: "看关系",
        target: "เอาน้ำเปล่าขวดนึงนะ", roman: "ao náam-plàao khùat nʉng ná", meaning: "来瓶水哈。",
        contexts: [["朋友 ✓",0],["熟店员 △",0],["长辈 ✕",1]], reaction: "熟人才自然", face: "◡"
      },
      {
        code: "S2", short: "冲硬", name: "冲硬边界", desc: "命令 · 催促 · 挖苦", risk: "高冒犯",
        target: "เอาน้ำขวดนึงดิ", roman: "ao náam khùat nʉng dì", meaning: "拿瓶水呗。",
        contexts: [["死党 △",0],["店员 ✕",1],["老板 ✕",1]], reaction: "店员愣了一下", face: "⌐"
      },
      {
        code: "S1", short: "混人", name: "混人局", desc: "甜嗓狠话 · 只为识别", risk: "高危反差",
        target: "มึง เอาน้ำมาให้กูเดี๋ยวนี้สิวะ!", roman: "mʉng ao náam maa hâi kuu dǐao níi sì wá!", meaning: "你他妈现在就把水拿来！（极度冒犯）",
        contexts: [["剧情识别",1],["陌生人 ✕",1],["长辈 ✕",1]], reaction: "声音很甜，内容很危险", face: "♡!"
      }
    ],
    ui: {
      weather: "今日泰语", greeting: "萨瓦迪卡，阿泰！", avatar: "泰",
      missionLabel: "今日剧情", chapter: "第 1 章 · 01", missionTitle: "便利店<br>别社死", missionCopy: "店员正在等你开口——<br>买瓶水能有多难？", time: "4 分钟", count: "3 句", npc: "店员 NPC", shopWord: "น้ำ",
      partnerEyebrow: "今晚的互助搭子", partnerHeading: "一句换一句", partnerStreak: "双向互改",
      vibeEyebrow: "王牌玩法", vibeHeading: "一句五说", vibeInfo: "只评价说法", currentMode: "当前表达档位", intent: "你想说：“请给我一瓶水”", reaction: "店员反应", consoleSafe: "适用更广", consoleTitle: "说话分寸调音台", consoleRisk: "风险更高",
      routeEyebrow: "学习地图", routeTitle: "曼谷生存线", routeDetails: "全部 12 站", routeStops: ["落地","便利店","咖啡店","出租车"],
      skillNote: "你不是在背词，你在练判断", skills: ["礼貌表达","自然口语","街头听力","场景判断"],
      battleEyebrow: "场景语气挑战", battleTitle: "场合判断战", battleSubtitle: "泰语说对只是 50 分，场合对才是真本事。", battleBadge: "突然袭击", personLabel: "人物", leagueLabel: "游戏本机最佳", leagueValue: "还没有战绩",
      passTitle: "双人对战 · 4 种玩法", passCopy: "开口格斗、均衡、闪电、语气擂台；说对就攻击",
      libraryEyebrow: "已收录 40+ 句", libraryTitle: "场景话术库", librarySubtitle: "先选关系和场合，再选择合适的说话分寸。", filters: ["全部","日常","旅行","职场","朋友","高风险"],
      profileName: "阿泰同学", levelLabel: "学习段位：", level: "尚未测评", modePrefix: "常用表达档位 · ", abilityTitle: "真实练习记录", abilityWeek: "本机累计 0 次", achievements: ["完成路线","有效练习","掌握词汇"],
      switchDirection: "切换学习方向", changeMode: "切换表达档位", method: "我们的“说话分寸”原则", methodAction: "查看", prototype: "内容状态 · 泰语母语教师终审待完成",
      nav: ["学习","对话","游戏","词库","我的"],
      missionFlowAria: "本课流程", missionFlow: ["先听懂","选分寸","开口说"], missionStart: "开始练 3 句",
      modeEyebrow: "表达档位", modeTitle: "选今天要练的说话分寸", modeNote: "评价的是表达场合，不评价你这个人。", confirmMode: "使用这个表达档位",
      lessonScene: "便利店 · 第 1 关", listen: "听店员说", check: "检查答案", next: "继续", reward: "领取战利品", wrongPrefix: "这句意思或场合不太对。",
      routeToast: "下一站「咖啡店别社死」将在完成本课后解锁",
      modeToast: "表达档位已切换为",
      lessonComplete: "通关！获得「便利店不社死」句卡 +30",
      playToast: "正在播放泰语", noVoice: "设备未安装泰语音色，使用系统语音",
      infoEyebrow: "设计原则", infoTitle: "“素质”到底是什么？", infoConfirm: "明白了"
    },
    warning: {
      title: "混人局，真能惹事",
      copy: "这里的内容用于<strong>听懂、防坑和剧情识别</strong>。S1 使用成年女声的软萌角色方向制造反差，但话本身仍可能造成严重冒犯。",
      label: "高危词示例", words: "กู · มึง · วะ · แม่ง", note: "只用于识别风险；禁止对真人使用",
      accept: "我知道风险，继续选择", decline: "换回安全表达"
    },
    principles: [
      ["是说话分寸，不是人格","同一句话对老板和对死党，本来就不该一样。"],
      ["低档位不是低水平","粗口以听懂、防坑、影视理解为主，不鼓励攻击别人。"],
      ["真正升级的是判断力","能随人物、关系、场合切换，才叫“泰语会来事”。"]
    ],
    partner: {
      name: "Mint", location: "曼谷", char: "ม", userChar: "泰", role: "AI 体验搭子 · 正在学中文", asks: "她来求助",
      line: "“老板，这个多少？”", lineNote: "听得懂，但好像在问老板本人多少钱 😅", audioLang: "zh-CN", audioText: "老板，这个多少？",
      cta: "帮她改得更自然", unlock: "你回一条中文建议，她会解锁你的泰语反馈", targetNode: "ท",
      sheetKicker: "30 秒互助接力 · AI 体验搭子", sheetTitle: "帮 Mint 说得更自然", time: "今天 20:14", original: "老板，这个多少？", originalNote: "我这样说自然吗？", typing: "正在等你的建议",
      choices: [
        { text: "老板，这个多少钱？", sub: "自然、完整，市场里常听到", correct: true },
        { text: "老板卖多少钱？", sub: "听起来像要把老板卖掉", correct: false },
        { text: "这个几钱？", sub: "不自然的直译", correct: false }
      ],
      reply: "原来要加一个“钱”！ขอบคุณนะ ✨", replyNote: "回礼：你的泰语很自然，句尾ครับ发得再短一点会更地道。",
      rewardTitle: "接力完成 · +15 互助值", rewardCopy: "Mint 的泰语反馈已经解锁", finish: "收下回礼",
      doneCta: "今晚接力已完成", doneUnlock: "你的建议帮 Mint 避开了一次中文社死"
    },
    pass: {
      kicker: "面对面双人对战", title: "抢麦说词，说对就攻击", copy: "推荐开口格斗：两人抢说同一个目标词；也可选择均衡、闪电或语气擂台。", playerA: "玩家 A", roleA: "抢麦答题", playerB: "玩家 B", roleB: "抢麦答题", start: "选择玩法，开始对战", cancel: "稍后再玩", handoffTitle: "准备抢麦", handoffCopy: "先点自己的抢麦键，再立刻说出答案。", reveal: "开始第 1 词", toast: "双人对战已打开"
    },
    battle: {
      avatar: "บ", person: "第一次见面的老板", question: "你想请他“再说一遍”，哪句最稳？",
      options: [
        { target: "พูดอีกทีดิ", roman: "phûut ìik thii dì", meaning: "再说遍呗", correct: false },
        { target: "ช่วยพูดอีกครั้งได้ไหมครับ", roman: "chûai phûut ìik khráng dâi mái khráp", meaning: "可以请您再说一次吗？", correct: true },
        { target: "พูดใหม่", roman: "phûut mài", meaning: "重说。", correct: false }
      ],
      correct: "判断漂亮！对第一次见面的老板，用 ช่วย…ได้ไหมครับ 既自然又得体。+12 场景判断",
      wrong: "意思接近，但语气会翻车。老板场合应使用带 ช่วย…ได้ไหมครับ 的请求句。"
    },
    phrases: [
      { level: 4, category: "travel", label: "旅行 · 万能", target: "ช่วยพูดช้า ๆ หน่อยได้ไหมครับ", roman: "chûai phûut châa-châa nɔ̀i dâi mái khráp", meaning: "可以说慢一点吗？" },
      { level: 4, category: "travel", label: "旅行 · 问路", target: "ห้องน้ำอยู่ไหนครับ", roman: "hông-náam yùu nǎi khráp", meaning: "洗手间在哪里？" },
      { level: 3, category: "friend", label: "朋友 · 约饭", target: "ไปกินข้าวกันไหม", roman: "pai kin khâao kan mái", meaning: "一起去吃饭吗？" },
      { level: 3, category: "friend", label: "朋友 · 告别", target: "เดี๋ยวเจอกันนะ", roman: "dǐao jəə kan ná", meaning: "待会儿见。" },
      { level: 2, category: "friend", label: "死党 · 惊讶", target: "เอาจริงดิ", roman: "ao jing dì", meaning: "真的假的？" },
      { level: 2, category: "risk", label: "挖苦语气", target: "เออ เก่งมากมั้ง", roman: "əə kèng mâak máng", meaning: "行，你可真厉害啊。（挖苦）" },
      { level: 1, category: "risk", label: "听懂保命", target: "มึงจะเอาไงวะ", roman: "mʉng jà ao ngai wá", meaning: "你想怎样？（强烈挑衅）" },
      { level: 5, category: "travel", label: "正式 · 求助", target: "ขออภัยครับ ช่วยพูดอีกครั้งได้ไหมครับ", roman: "khɔ̌ɔ à-phai khráp, chûai phûut ìik khráng dâi mái khráp", meaning: "抱歉，可以再说一次吗？" }
    ],
    lessons: [
      {
        label: "先听，再判断", question: "店员说了什么？", hint: "不用逐字翻译，抓住她在问你要什么。", npc: "สวัสดีค่ะ รับอะไรดีคะ", npcRoman: "sà-wàt-dii khâ, ráp à-rai dii khá",
        answers: [{ text: "你好，想要点什么？", sub: "礼貌服务用语", correct: true },{ text: "你从哪里来？", sub: "在问地点", correct: false },{ text: "今天打烊了。", sub: "在说营业时间", correct: false }],
        feedback: "听懂了！“รับอะไรดีคะ” 是店员常用的礼貌问法：想要点什么？"
      },
      {
        label: "轮到你开口", question: "对第一次见的店员说：请给我一瓶水。", hint: "意思要对，场合也要稳。", npc: "รับอะไรดีคะ", npcRoman: "ráp à-rai dii khá",
        answers: [{ text: "ขอน้ำเปล่าหนึ่งขวดครับ", sub: "请给我一瓶水。", correct: true, target: true },{ text: "เอาน้ำมาดิวะ", sub: "把水拿来啊。（很冲）", correct: false, target: true },{ text: "น้ำอยู่ไหน", sub: "水在哪里？", correct: false, target: true }],
        feedback: "漂亮！ขอ + 东西 + ครับ/ค่ะ，是商店里自然又礼貌的开局。"
      },
      {
        label: "一句五说", question: "死党说话太慢，你可以怎么催？", hint: "这次人物关系变了：非常熟的同龄朋友。", npc: "รอแป๊บนึงนะ", npcRoman: "rɔɔ pɛ́p nʉ̀ng ná",
        answers: [{ text: "เร็ว ๆ ดิ", sub: "快点呗。（熟人口语）", correct: true, target: true },{ text: "กรุณาเร็วขึ้น", sub: "请加快。（过于书面）", correct: false, target: true },{ text: "ขออภัยครับ", sub: "抱歉。", correct: false, target: true }],
        feedback: "会来事！ดิ 有催促感，只适合熟人。换成老板，这句就容易翻车。"
      }
    ]
  },

  "th-zh": {
    key: "th-zh",
    interfaceLang: "th",
    targetLang: "zh-CN",
    targetHtmlLang: "zh-CN",
    brand: "萨瓦迪卡",
    mark: "中",
    directionLabel: "ไทย → 中文",
    setup: {
      tag: "สนามฝึกภาษาจีน · BETA",
      eyebrow: "ประโยคจีนเดียวกัน · พูดได้ 5 แบบ",
      title: "วันนี้อยากใช้ภาษา<br><em>ระดับไหน?</em>",
      lede: "เราให้คุณเลือกระดับภาษา ไม่ได้ตัดสินนิสัย<br>ตั้งแต่คุยกับเจ้านาย จนถึงฟังภาษาข้างถนนให้ทัน",
      signA: "中文要会说",
      signB: "上海 · 01",
      picker: "โทนเริ่มต้นของฉัน",
      start: "เลือกแบบนี้ แล้วไปตะลุยด่านกัน",
      peek: "ขอดูก่อน"
    },
    modes: [
      {
        code: "S5", short: "สุภาพ+", name: "สุภาพมืออาชีพ", desc: "ผู้ใหญ่ · ลูกค้า · ทางการ", risk: "ปลอดภัยมาก",
        target: "不好意思，麻烦您帮我拿一瓶水，可以吗？", roman: "Bù hǎoyìsi, máfan nín bāng wǒ ná yì píng shuǐ, kěyǐ ma?", meaning: "ขอโทษที่รบกวน ช่วยหยิบน้ำให้หนึ่งขวดได้ไหมครับ/คะ",
        contexts: [["เจ้านาย ✓",0],["ผู้ใหญ่ ✓",0],["คนแปลกหน้า ✓",0]], reaction: "สุภาพมาก แต่ออกทางการนิดหนึ่ง", face: "☺"
      },
      {
        code: "S4", short: "สุภาพ", name: "สุภาพกำลังดี", desc: "ธรรมชาติ · ใช้ได้ทุกวัน", risk: "พูดได้สบาย",
        target: "麻烦给我拿一瓶水，谢谢。", roman: "Máfan gěi wǒ ná yì píng shuǐ, xièxie.", meaning: "รบกวนหยิบน้ำให้หนึ่งขวด ขอบคุณครับ/ค่ะ",
        contexts: [["พนักงาน ✓",0],["คนแปลกหน้า ✓",0],["เพื่อน ✓",0]], reaction: "เป็นธรรมชาติ ใช้ได้สบาย", face: "☺"
      },
      {
        code: "S3", short: "กันเอง", name: "โหมดคนกันเอง", desc: "เพื่อน · คนคุ้นเคย", risk: "ดูความสนิท",
        target: "给我来瓶水吧。", roman: "Gěi wǒ lái píng shuǐ ba.", meaning: "เอาน้ำให้สักขวดนะ",
        contexts: [["เพื่อน ✓",0],["ร้านที่คุ้น △",0],["ผู้ใหญ่ ✕",1]], reaction: "ฟังสบายเมื่อพูดกับคนสนิท", face: "◡"
      },
      {
        code: "S2", short: "ภาษาห้วน", name: "ภาษาห้วน", desc: "คำสั่งสั้น · ฟังรู้ทัน", risk: "ฟังแข็ง",
        target: "给我拿瓶水。", roman: "Gěi wǒ ná píng shuǐ.", meaning: "เอาน้ำให้ขวดหนึ่ง",
        contexts: [["เพื่อนสนิท △",0],["พนักงาน ✕",1],["เจ้านาย ✕",1]], reaction: "พนักงานชะงัก เพราะเหมือนถูกสั่ง", face: "⌐"
      },
      {
        code: "S1", short: "หาเรื่อง", name: "ภาษาหาเรื่อง", desc: "เสียงหวานแต่คำแรง · ฟังให้รู้ทัน", risk: "หวานแต่เสี่ยง",
        target: "你他妈赶紧给我拿瓶水来！", roman: "Nǐ tā mā gǎnjǐn gěi wǒ ná píng shuǐ lái!", meaning: "มึงรีบเอาน้ำมาให้กูเดี๋ยวนี้! (หยาบคายมาก)",
        contexts: [["ฟังเพื่อเอาตัวรอด",1],["คนแปลกหน้า ✕",1],["ผู้ใหญ่ ✕",1]], reaction: "เสียงน่ารัก แต่คำพูดอันตรายมาก", face: "♡!"
      }
    ],
    ui: {
      weather: "13 ส.ค. · เซี่ยงไฮ้ 31°", greeting: "你好 มินต์!", avatar: "中",
      missionLabel: "ภารกิจวันนี้", chapter: "บทที่ 1 · 01", missionTitle: "เข้าร้าน<br>ไม่หน้าแตก", missionCopy: "พนักงานรอให้คุณเริ่มพูด—<br>แค่ซื้อน้ำขวดเดียว ยากแค่ไหนเชียว?", time: "4 นาที", count: "3 ประโยค", npc: "พนักงาน NPC", shopWord: "水",
      partnerEyebrow: "คู่ฝึกช่วยกันคืนนี้", partnerHeading: "แลกกันคนละประโยค", partnerStreak: "ช่วยกันแก้สองทาง",
      vibeEyebrow: "โหมดเด็ด", vibeHeading: "ประโยคเดียว 5 สไตล์", vibeInfo: "ประเมินแค่สำนวน", currentMode: "โทนปัจจุบัน", intent: "คุณอยากพูดว่า “ขอน้ำหนึ่งขวด”", reaction: "ปฏิกิริยาของพนักงาน", consoleSafe: "สุภาพ", consoleTitle: "ตัวปรับระดับภาษา", consoleRisk: "แรง",
      routeEyebrow: "แผนที่การเรียน", routeTitle: "เส้นทางเอาตัวรอดในจีน", routeDetails: "ทั้งหมด 12 สถานี", routeStops: ["ลงจอด","ร้านสะดวกซื้อ","คาเฟ่","แท็กซี่"],
      skillNote: "คุณไม่ได้แค่ท่องศัพท์ แต่กำลังฝึกเลือกคำให้ถูกกาลเทศะ", skills: ["ภาษาสุภาพ","ภาษาธรรมชาติ","ฟังภาษาถนน","เลือกตามสถานการณ์"],
      battleEyebrow: "ฝึกเลือกโทนตามสถานการณ์", battleTitle: "ดวลเลือกภาษาให้ถูกกาลเทศะ", battleSubtitle: "พูดจีนถูกได้ 50 คะแนน เลือกให้ถูกสถานการณ์ถึงจะเก่งจริง", battleBadge: "โจทย์ฉุกเฉิน", personLabel: "คู่สนทนา", leagueLabel: "สถิติเกมดีที่สุดในเครื่อง", leagueValue: "ยังไม่มีสถิติ",
      passTitle: "ดวลสองคน · 4 รูปแบบ", passCopy: "ดวลพูด สมดุล สายฟ้า และระดับภาษา พูดถูกแล้วโจมตี",
      libraryEyebrow: "รวมแล้ว 40+ ประโยค", libraryTitle: "คลังประโยคตามโทน", librarySubtitle: "เลือกสถานการณ์ก่อน แล้วค่อยเลือกอารมณ์ภาษา", filters: ["ทั้งหมด","ชีวิตประจำวัน","ท่องเที่ยว","ที่ทำงาน","เพื่อน","เสี่ยงสูง"],
      profileName: "Mint", levelLabel: "ระดับการเรียน：", level: "ยังไม่ได้ประเมิน", modePrefix: "โทนประจำ · ", abilityTitle: "บันทึกการฝึกจริง", abilityWeek: "สะสมในเครื่อง 0 ครั้ง", achievements: ["เส้นทางที่จบ","การฝึกที่ทำ","คำที่จำได้"],
      switchDirection: "สลับเส้นทางการเรียน", changeMode: "เปลี่ยนโทนเริ่มต้น", method: "หลักการเรื่องระดับภาษา", methodAction: "ดู", prototype: "สถานะเนื้อหา · รอเจ้าของภาษาตรวจรอบสุดท้าย",
      nav: ["เรียน","สนทนา","เกม","คำศัพท์","ฉัน"],
      missionFlowAria: "ขั้นตอนบทเรียน", missionFlow: ["ฟังให้เข้าใจ","เลือกให้เหมาะ","พูดออกมา"], missionStart: "เริ่มฝึก 3 ประโยค",
      modeEyebrow: "ระดับโทนภาษา", modeTitle: "เลือกโทนของวันนี้", modeNote: "เราประเมินความเหมาะสมของสำนวน ไม่ได้ตัดสินตัวคุณ", confirmMode: "ใช้โทนนี้",
      lessonScene: "ร้านสะดวกซื้อ · ด่าน 1", listen: "ฟังพนักงาน", check: "ตรวจคำตอบ", next: "ต่อไป", reward: "รับรางวัล", wrongPrefix: "ความหมายหรือระดับภาษายังไม่ตรงสถานการณ์ ",
      routeToast: "สถานีถัดไป “คาเฟ่แบบไม่หน้าแตก” จะปลดล็อกหลังจบบทนี้",
      modeToast: "เปลี่ยนโทนเริ่มต้นเป็น",
      lessonComplete: "ผ่านด่าน! ได้การ์ด “เข้าร้านสะดวกซื้อแบบไม่หน้าแตก” +30",
      playToast: "กำลังเล่นเสียงภาษาจีน", noVoice: "อุปกรณ์ไม่มีเสียงภาษาจีน จึงใช้เสียงระบบ",
      infoEyebrow: "หลักการออกแบบ", infoTitle: "“ระดับภาษา” คืออะไร?", infoConfirm: "เข้าใจแล้ว"
    },
    warning: {
      title: "โหมดหาเรื่อง อาจมีเรื่องจริง",
      copy: "เนื้อหาโหมดนี้มีไว้เพื่อ<strong>ฟังให้รู้ทัน เอาตัวรอด และเข้าใจฉากขัดแย้ง</strong> ระดับ S1 ใช้ทิศทางเสียงผู้หญิงผู้ใหญ่ที่นุ่มน่ารักเพื่อสร้างความตัดกัน แต่คำพูดยังหยาบและอาจทำให้เกิดเรื่องได้",
      label: "คำเสี่ยงสูง", words: "赶紧 · 滚 · 闭嘴", note: "เรียนเพื่อเข้าใจ ไม่แนะนำให้พูดตาม",
      accept: "เข้าใจความเสี่ยง เลือกต่อ", decline: "ขอกลับไปใช้ภาษาสุภาพ"
    },
    principles: [
      ["เป็นระดับภาษา ไม่ใช่นิสัย","ประโยคเดียวกันไม่ควรพูดกับเจ้านายและเพื่อนสนิทแบบเดียวกัน"],
      ["โหมดแรงไม่ใช่ระดับเรียนต่ำ","คำหยาบมีไว้ฟังให้รู้ทันและเข้าใจสื่อ ไม่ได้ชวนให้โจมตีคนอื่น"],
      ["สิ่งที่พัฒนาคือการตัดสินใจ","เลือกคำให้เหมาะกับคน ความสัมพันธ์ และสถานการณ์—นี่แหละคือพูดจีนให้เป็น"]
    ],
    partner: {
      name: "Leo", location: "上海", char: "林", userChar: "中", role: "AI คู่ฝึกทดลอง · กำลังเรียนไทย", asks: "เขามาขอความช่วยเหลือ",
      line: "“อันนี้เท่าไร?”", lineNote: "เข้าใจได้ แต่เติมอีกนิดจะสุภาพและเป็นธรรมชาติกว่า", audioLang: "th-TH", audioText: "อันนี้เท่าไร",
      cta: "ช่วย Leo ปรับให้เป็นธรรมชาติ", unlock: "ช่วยเขาหนึ่งประโยค แล้วปลดล็อกคำแนะนำภาษาจีนของคุณ", targetNode: "中",
      sheetKicker: "ภารกิจช่วยกัน 30 วินาที · AI คู่ฝึกทดลอง", sheetTitle: "ช่วย Leo พูดไทยให้เป็น", time: "วันนี้ 20:14", original: "อันนี้เท่าไร?", originalNote: "พูดแบบนี้ธรรมชาติไหม?", typing: "กำลังรอคำแนะนำจากคุณ",
      choices: [
        { text: "อันนี้ราคาเท่าไหร่ครับ", sub: "สุภาพและเป็นธรรมชาติ", correct: true },
        { text: "เอาราคา", sub: "สั้นและฟังเหมือนคำสั่ง", correct: false },
        { text: "คุณกี่บาท", sub: "กลายเป็นถามราคาของคน", correct: false }
      ],
      reply: "懂了！要加“ราคา”和“ครับ” ✨", replyNote: "ของตอบแทน: ภาษาจีนของคุณออกเสียง “水 shuǐ” ถูกโทนแล้ว จังหวะสั้นลงอีกนิดจะเป๊ะ",
      rewardTitle: "ต่อประโยคสำเร็จ · +15 คะแนนช่วยกัน", rewardCopy: "ปลดล็อกคำแนะนำภาษาจีนจาก Leo แล้ว", finish: "รับของตอบแทน",
      doneCta: "ช่วยกันคืนนี้สำเร็จแล้ว", doneUnlock: "คำแนะนำของคุณช่วย Leo ไม่ให้พูดไทยแบบห้วน ๆ"
    },
    pass: {
      kicker: "ดวลสองคนต่อหน้า", title: "แย่งไมค์ พูดถูกแล้วโจมตี", copy: "แนะนำโหมดดวลพูด ทั้งสองคนแย่งพูดคำเดียวกัน หรือเลือกโหมดสมดุล สายฟ้า และระดับภาษาได้", playerA: "ผู้เล่น A", roleA: "แย่งตอบ", playerB: "ผู้เล่น B", roleB: "แย่งตอบ", start: "เลือกรูปแบบแล้วเริ่มดวล", cancel: "ไว้เล่นทีหลัง", handoffTitle: "เตรียมแย่งไมค์", handoffCopy: "แตะปุ่มของตัวเองก่อน แล้วพูดคำตอบทันที", reveal: "เริ่มคำที่ 1", toast: "เปิดเกมดวลสองคนแล้ว"
    },
    battle: {
      avatar: "老", person: "เจ้านายที่เพิ่งเจอกันครั้งแรก", question: "ถ้าต้องการขอให้เขา “พูดอีกครั้ง” ประโยคไหนปลอดภัยที่สุด?",
      options: [
        { target: "再说一遍呗。", roman: "Zài shuō yí biàn bei.", meaning: "พูดอีกรอบสิ — กันเองเกินไป", correct: false },
        { target: "不好意思，麻烦您再说一遍，可以吗？", roman: "Bù hǎoyìsi, máfan nín zài shuō yí biàn, kěyǐ ma?", meaning: "ขอให้พูดอีกครั้งอย่างสุภาพ", correct: true },
        { target: "重说。", roman: "Chóng shuō.", meaning: "พูดใหม่ — ฟังเหมือนคำสั่ง", correct: false }
      ],
      correct: "ดีมาก! กับเจ้านายที่เพิ่งพบ ใช้ 您 + 麻烦 + 可以吗 ปลอดภัยที่สุด +12 การเลือกตามสถานการณ์",
      wrong: "ความหมายใกล้เคียง แต่โทนอาจพัง เลือกประโยคที่มี 您 + 麻烦 + 可以吗 จะสุภาพที่สุด"
    },
    phrases: [
      { level: 4, category: "travel", label: "ท่องเที่ยว · ใช้บ่อย", target: "请说慢一点，可以吗？", roman: "Qǐng shuō màn yìdiǎn, kěyǐ ma?", meaning: "ช่วยพูดช้าลงหน่อยได้ไหม?" },
      { level: 4, category: "travel", label: "ท่องเที่ยว · ถามทาง", target: "洗手间在哪里？", roman: "Xǐshǒujiān zài nǎlǐ?", meaning: "ห้องน้ำอยู่ที่ไหน?" },
      { level: 3, category: "friend", label: "เพื่อน · ชวนกิน", target: "一起去吃饭吗？", roman: "Yìqǐ qù chīfàn ma?", meaning: "ไปกินข้าวด้วยกันไหม?" },
      { level: 3, category: "friend", label: "เพื่อน · บอกลา", target: "待会儿见。", roman: "Dāihuìr jiàn.", meaning: "เจอกันอีกเดี๋ยว" },
      { level: 2, category: "friend", label: "เพื่อนสนิท · ตกใจ", target: "真的假的？", roman: "Zhēn de jiǎ de?", meaning: "จริงหรือเปล่า?" },
      { level: 2, category: "risk", label: "น้ำเสียงประชด", target: "行，你可真厉害啊。", roman: "Xíng, nǐ kě zhēn lìhai a.", meaning: "เออ เก่งมากมั้ง — ประชดและฟังแข็ง" },
      { level: 1, category: "risk", label: "ฟังเพื่อเอาตัวรอด", target: "你他妈想怎样？", roman: "Nǐ tā mā xiǎng zěnyàng?", meaning: "มึงจะเอาไงวะ — หยาบและท้าทายมาก" },
      { level: 5, category: "travel", label: "ทางการ · ขอความช่วยเหลือ", target: "不好意思，可以再说一次吗？", roman: "Bù hǎoyìsi, kěyǐ zài shuō yí cì ma?", meaning: "ขอโทษครับ/ค่ะ พูดอีกครั้งได้ไหม?" }
    ],
    lessons: [
      {
        label: "ฟังก่อน แล้วค่อยตัดสิน", question: "พนักงานกำลังถามอะไร?", hint: "ไม่ต้องแปลทุกคำ จับใจความว่าเขาต้องการรู้อะไร", npc: "您好，想买点什么？",
        answers: [{ text: "คุณอยากซื้ออะไร?", sub: "คำถามสุภาพในร้าน", correct: true },{ text: "คุณมาจากที่ไหน?", sub: "กำลังถามสถานที่", correct: false },{ text: "วันนี้ร้านปิดแล้ว", sub: "กำลังบอกเวลาปิด", correct: false }],
        feedback: "“想买点什么？” แปลว่า “อยากซื้ออะไร” เป็นประโยคสุภาพที่พนักงานใช้ถามลูกค้า"
      },
      {
        label: "ถึงตาคุณพูด", question: "กับพนักงานที่เพิ่งเจอ ประโยคไหนสุภาพและเป็นธรรมชาติที่สุด?", hint: "ความหมายต้องถูก และระดับภาษาต้องเข้ากับสถานการณ์", npc: "您好，想买点什么？",
        answers: [{ text: "麻烦给我拿一瓶水，谢谢。", sub: "Máfan gěi wǒ ná yì píng shuǐ, xièxie.", correct: true, target: true },{ text: "矿泉水在哪里？", sub: "Kuàngquánshuǐ zài nǎli?", correct: false, target: true },{ text: "赶紧给我拿瓶水来！", sub: "Gǎnjǐn gěi wǒ ná píng shuǐ lái!", correct: false, target: true }],
        feedback: "麻烦 ทำให้คำขอฟังสุภาพ และ 谢谢 ใช้ปิดท้ายได้อย่างเป็นธรรมชาติ"
      },
      {
        label: "ปิดท้ายตอนจ่ายเงิน", question: "ถ้าไม่รับถุง ควรตอบอย่างไร?", hint: "ปฏิเสธให้นุ่มนวล แล้วปิดท้ายอย่างเป็นธรรมชาติ", npc: "要袋子吗？",
        answers: [{ text: "不用了，谢谢。", sub: "Bú yòng le, xièxie.", correct: true, target: true },{ text: "不要！", sub: "Bú yào! — ฟังแข็ง", correct: false, target: true },{ text: "没有袋子。", sub: "Méiyǒu dàizi. — ความหมายไม่ตรง", correct: false, target: true }],
        feedback: "不用了 เป็นการปฏิเสธอย่างนุ่มนวล เติม 谢谢 แล้วจะฟังสุภาพเป็นธรรมชาติ"
      }
    ]
  }
};

window.HUILAISHI_THAI_PHONETIC?.enrichProduct(product);

let currentDirection = "zh-th";
let pendingDirection = null;
let currentMode = 1;
let previewMode = 1;
let pendingMode = 1;
let onboardingPreviewAcknowledged = false;
let previousMode = 1;
let riskAccepted = false;
let riskSelectionSource = "sheet";
let lessonStep = 0;
let selectedAnswer = null;
let checked = false;
let lessonNeedsRetry = false;
let lessonVoiceGate = null;
let passState = 0;
let toastTimer;
let partnerReplyTimer;
let liveReplyTimer;
let liveScenarioIndex = 0;
let liveCompareExpanded = false;
let lastNpcLine = null;
let localRecognition = null;
let localSpeechCapability = "checking";
let mediaRecorder = null;
let mediaStream = null;
let recordedChunks = [];
let recordedUrl = null;
let practiceRecordingTimer = null;
let practiceRecordingSession = 0;
let discardPracticeRecording = false;
let practiceRecordingPending = false;
let deferredInstallPrompt = null;
const OFFLINE_CACHE_VERSION = "huilaishi-offline-v60";
const CORE_AUDIO_CONSENT_KEY = "huilaishi-core-audio-consent-v1";
const THAI_SPEAKER_PROFILE_KEY = "huilaishi-thai-speaker-profile-v1";
const SPEECH_PACE_KEY = "huilaishi-speech-pace-v1";
let thaiSpeakerProfile = "female";
let speechPace = "clear";
let offlineCacheState = "preparing";
let offlineCacheDetail = {};
let serviceWorkerRegistration = null;
let coreAudioRequested = false;
let coreAudioAttemptedThisLoad = false;
let coreAudioUserStartedThisLoad = false;
let coreAudioMeteredOverrideThisLoad = false;
let coreAudioClearConfirmTimer = 0;
let shellPreparationRequested = false;
let shellPreparationAttemptedThisLoad = false;
let alaiAudio = null;
let sheetLastFocus = null;
let sheetBackgroundState = [];
let onboardingStage = "select";
let onboardingIsFirstRun = true;
let currentBattleQuiz = null;
let localDataClearInProgress = false;
let localBattleInitialized = false;
let localBattleOpen = false;
let localBattleHistoryPushed = false;
let localBattleClosingFromHistory = false;
const APP_HISTORY_STATE_KEY = "huilaishiAppRoute";
const APP_HISTORY_SESSION_KEY = "huilaishi-app-route-v1";
const APP_HISTORY_DEPTH_KEY = "huilaishiAppDepth";
const APP_MAIN_VIEWS = new Set(["home", "live", "battle", "library", "profile"]);
const APP_ROUTES = new Set(["direction", "onboarding-select", "onboarding-confirm", "lesson", ...APP_MAIN_VIEWS]);
let activeAppRoute = null;
let restoringAppRoute = false;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const text = (selector, value) => { const el = $(selector); if (el) el.textContent = value; };
const html = (selector, value) => { const el = $(selector); if (el) el.innerHTML = value; };

function normalizeAppRoute(value) {
  return APP_ROUTES.has(String(value || "")) ? String(value) : null;
}

function readSessionAppRoute() {
  try { return normalizeAppRoute(globalThis.sessionStorage?.getItem(APP_HISTORY_SESSION_KEY)); }
  catch (_) { return null; }
}

function rememberAppRoute(route, mode = "push") {
  const normalized = normalizeAppRoute(route);
  if (!normalized) return false;
  activeAppRoute = normalized;
  try { globalThis.sessionStorage?.setItem(APP_HISTORY_SESSION_KEY, normalized); } catch (_) {}
  if (restoringAppRoute || mode === "none") return true;
  const previousState = history.state && typeof history.state === "object" ? history.state : {};
  const currentDepth = Math.max(0, Number(previousState[APP_HISTORY_DEPTH_KEY]) || 0);
  const resetToRoot = mode === "root";
  const state = {
    ...previousState,
    [APP_HISTORY_STATE_KEY]: normalized,
    [APP_HISTORY_DEPTH_KEY]: resetToRoot ? 0 : (mode === "push" && previousState[APP_HISTORY_STATE_KEY] !== normalized ? currentDepth + 1 : currentDepth)
  };
  delete state.huilaishiLocalBattle;
  try {
    if (mode === "replace" || resetToRoot || history.state?.[APP_HISTORY_STATE_KEY] === normalized) history.replaceState(state, "", location.href);
    else history.pushState(state, "", location.href);
  } catch (_) { return false; }
  return true;
}

function returnToPreviousAppRoute(fallback = "home") {
  const depth = Math.max(0, Number(history.state?.[APP_HISTORY_DEPTH_KEY]) || 0);
  if (depth > 0) {
    try { history.back(); return; } catch (_) {}
  }
  const restored = restoreApplicationRoute(fallback);
  rememberAppRoute(restored, "replace");
}

function shouldRestoreSessionRoute() {
  try { return performance.getEntriesByType?.("navigation")?.[0]?.type === "reload"; }
  catch (_) { return false; }
}

// SAFE_STORAGE_START
// Some Android in-app browsers expose localStorage but throw SecurityError as
// soon as it is read. Keep the first-run and lesson paths usable by falling
// back to memory for the lifetime of the current page.
function createSafeStorage(resolveStorage = () => globalThis.localStorage) {
  const memory = new Map();
  let nativeStorage = null;

  try {
    nativeStorage = resolveStorage();
    const probe = `__huilaishi_storage_probe_${Date.now()}__`;
    nativeStorage.setItem(probe, "1");
    nativeStorage.removeItem(probe);
  } catch (_) {
    nativeStorage = null;
  }

  const nativeKeys = () => {
    if (!nativeStorage) return [];
    try {
      return Array.from({ length: Math.max(0, Number(nativeStorage.length) || 0) }, (_, index) => nativeStorage.key(index))
        .filter(key => key !== null)
        .map(String);
    } catch (_) {
      nativeStorage = null;
      return [];
    }
  };
  const keys = () => [...new Set([...nativeKeys(), ...memory.keys()])];

  return Object.freeze({
    getItem(key) {
      const normalized = String(key);
      if (memory.has(normalized)) return memory.get(normalized);
      if (!nativeStorage) return null;
      try { return nativeStorage.getItem(normalized); }
      catch (_) { nativeStorage = null; return memory.get(normalized) ?? null; }
    },
    setItem(key, value) {
      const normalized = String(key);
      const normalizedValue = String(value);
      memory.set(normalized, normalizedValue);
      if (!nativeStorage) return;
      try { nativeStorage.setItem(normalized, normalizedValue); }
      catch (_) { nativeStorage = null; }
    },
    removeItem(key) {
      const normalized = String(key);
      memory.delete(normalized);
      if (!nativeStorage) return;
      try { nativeStorage.removeItem(normalized); }
      catch (_) { nativeStorage = null; }
    },
    key(index) { return keys()[Number(index)] ?? null; },
    get length() { return keys().length; },
    get persistent() { return Boolean(nativeStorage); }
  });
}

const safeStorage = createSafeStorage();
globalThis.HUILAISHI_STORAGE = safeStorage;
// SAFE_STORAGE_END

// LOCAL_DATA_POLICY_START
// Keep this policy explicit: this app may share an origin with unrelated projects.
const HUILAISHI_LOCAL_DATA_EXACT_KEYS = Object.freeze([
  "learningDirection",
  "huilaishi-core-audio-consent-v1",
  "huilaishi-thai-speaker-profile-v1",
  "huilaishi-speech-pace-v1",
  "huilaishi-partner-adult",
  "huilaishi-battle-mode-v1",
  "huilaishi-battle-records-v1"
]);
const HUILAISHI_LOCAL_DATA_PREFIXES = Object.freeze([
  "huilaishi-onboarded-",
  "huilaishi-vocab-",
  "huilaishi-arcade-stats-",
  "huilaishi-guide-v12:",
  "huilaishi-pronunciation-best:",
  "thai-vibe-mode-",
  "register-route-complete-",
  "register-battle-index-",
  "partner-relay-",
  "offline-scene-",
  "offline-turns-"
]);

function isHuilaishiLocalDataKey(value) {
  const key = String(value ?? "");
  return HUILAISHI_LOCAL_DATA_EXACT_KEYS.includes(key)
    || HUILAISHI_LOCAL_DATA_PREFIXES.some(prefix => key.startsWith(prefix));
}

function huilaishiStorageKeys(storage) {
  const keys = [];
  let length = 0;
  try { length = Math.max(0, Number(storage?.length) || 0); } catch (_) { return keys; }
  for (let index = 0; index < length; index += 1) {
    try {
      const key = storage.key(index);
      if (key !== null && isHuilaishiLocalDataKey(key)) keys.push(String(key));
    } catch (_) { /* one unreadable entry must not widen the export/delete scope */ }
  }
  return [...new Set(keys)].sort();
}

function collectHuilaishiLocalData(storage) {
  const values = {};
  const unreadableKeys = [];
  for (const key of huilaishiStorageKeys(storage)) {
    try { values[key] = storage.getItem(key); }
    catch (_) { unreadableKeys.push(key); }
  }
  return { values, unreadableKeys };
}

function clearHuilaishiLocalData(storage) {
  const keys = huilaishiStorageKeys(storage);
  const removedKeys = [];
  const failedKeys = [];
  for (const key of keys) {
    try {
      storage.removeItem(key);
      if (storage.getItem(key) === null) removedKeys.push(key);
      else failedKeys.push(key);
    } catch (_) { failedKeys.push(key); }
  }
  return { attemptedKeys: keys, removedKeys, failedKeys };
}

function localDirectionStats(values, direction) {
  const grades = ["S5", "S4", "S3", "S2", "S1"];
  const number = key => {
    const parsed = Number(values[key] || 0);
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
  };
  const json = (key, fallback) => {
    try { return JSON.parse(values[key]) ?? fallback; } catch (_) { return fallback; }
  };
  const arcade = json(`huilaishi-arcade-stats-${direction}`, {});
  const arcadePlays = Object.values(arcade && typeof arcade === "object" && !Array.isArray(arcade) ? arcade : {})
    .reduce((sum, item) => sum + Math.max(0, Number(item?.plays) || 0), 0);
  const known = json(`huilaishi-vocab-known-${direction}`, []);
  const directionKeyCount = Object.keys(values).filter(key => key.includes(direction)).length;
  return {
    storedKeyCount: directionKeyCount,
    completedRegisterRoutes: grades.filter(grade => values[`register-route-complete-${direction}-${grade}`] === "1").length,
    registerBattleAttempts: grades.reduce((sum, grade) => sum + number(`register-battle-index-${direction}-${grade}`), 0),
    offlineDialogueTurns: number(`offline-turns-${direction}`),
    knownVocabulary: Array.isArray(known) ? new Set(known.map(String)).size : 0,
    arcadePlays: Math.floor(arcadePlays)
  };
}

function buildHuilaishiLocalDataExport(storage, options = {}) {
  const { values, unreadableKeys } = collectHuilaishiLocalData(storage);
  const activeDirection = values.learningDirection === "th-zh" ? "th-zh" : values.learningDirection === "zh-th" ? "zh-th" : null;
  return {
    format: "huilaishi-local-learning-data",
    schemaVersion: 1,
    appVersion: String(options.appVersion || "12.6.0"),
    exportedAt: new Date(options.now || Date.now()).toISOString(),
    activeDirection,
    directionStats: {
      "zh-th": localDirectionStats(values, "zh-th"),
      "th-zh": localDirectionStats(values, "th-zh")
    },
    unreadableKeyCount: unreadableKeys.length,
    localStorage: values
  };
}

if (typeof window !== "undefined") {
  window.HUILAISHI_LOCAL_DATA_POLICY = Object.freeze({
    exactKeys: HUILAISHI_LOCAL_DATA_EXACT_KEYS,
    prefixes: HUILAISHI_LOCAL_DATA_PREFIXES,
    ownsKey: isHuilaishiLocalDataKey,
    collect: collectHuilaishiLocalData,
    clear: clearHuilaishiLocalData,
    buildExport: buildHuilaishiLocalDataExport
  });
}
// LOCAL_DATA_POLICY_END

function config() {
  return product[currentDirection];
}

function gradeForMode(index = currentMode) {
  return `S${5 - Math.max(0, Math.min(4, Number(index) || 0))}`;
}

function registerGuide() {
  return window.HUILAISHI_REGISTER_GUIDE || null;
}

function registerLevel(index = currentMode) {
  const grade = gradeForMode(index);
  const guide = registerGuide();
  return guide?.levels?.[grade] || guide?.getLevel?.(grade) || null;
}

function speakerProfileForGrade(grade) {
  const normalized = String(grade).toUpperCase();
  return currentDirection === "zh-th" && (normalized === "S5" || normalized === "S4")
    ? thaiSpeakerProfile
    : "source";
}

function registerRoute(index = currentMode) {
  const grade = gradeForMode(index);
  const guide = registerGuide();
  const route = guide?.getRoute?.(grade, speakerProfileForGrade(grade)) || registerLevel(index)?.route || null;
  if (!route || grade !== "S1" || !guide?.getVariant) return route;
  return {
    ...route,
    steps: route.steps.map(step => {
      const safe = guide.getVariant(step.intentId, "S4", speakerProfileForGrade("S4"));
      return safe ? { ...step, safeAnswer: { zh: safe.zh, py: safe.py, th: safe.th, ro: safe.ro } } : step;
    })
  };
}

const REGISTER_COMPARISON_INTENT_ID = "repeat";

function registerComparison() {
  const entry = (window.HUILAISHI_REGISTER_PACK || []).find(item => item.id === REGISTER_COMPARISON_INTENT_ID) || null;
  const scenario = registerGuide()?.scenarios?.[REGISTER_COMPARISON_INTENT_ID] || null;
  return {
    intent: interfaceValue(entry, "intentZh", "intentTh") || (currentDirection === "zh-th" ? "请对方再说一遍" : "ขอให้อีกฝ่ายพูดซ้ำ"),
    setting: interfaceValue(scenario, "settingZh", "settingTh") || "",
    relationship: interfaceValue(scenario, "relationshipZh", "relationshipTh") || "",
    context: interfaceValue(entry, "contextZh", "contextTh") || ""
  };
}

function interfaceValue(value, zhKey, thKey) {
  return currentDirection === "zh-th" ? value?.[zhKey] : value?.[thKey];
}

function answerForDirection(answer) {
  if (!answer) return { target: "", reading: "", meaning: "" };
  return currentDirection === "zh-th"
    ? { target: answer.th || "", reading: answer.ro || "", meaning: answer.zh || "", thReading: answer.thReading || null }
    : { target: answer.zh || "", reading: answer.py || "", meaning: answer.th || "" };
}

function registerName(index = currentMode) {
  const level = registerLevel(index);
  return interfaceValue(level, "labelZh", "labelTh") || config().modes[index]?.name || gradeForMode(index);
}

function registerPurpose(index = currentMode) {
  const level = registerLevel(index);
  return interfaceValue(level, "purposeZh", "purposeTh") || config().modes[index]?.desc || "";
}

function registerAudience(index = currentMode) {
  const level = registerLevel(index);
  return interfaceValue(level, "audienceZh", "audienceTh") || config().modes[index]?.contexts?.map(item => item[0]).join(" / ") || "";
}

function registerUseWhen(index = currentMode) {
  const level = registerLevel(index);
  return interfaceValue(level, "useWhenZh", "useWhenTh") || [];
}

function registerTaboos(index = currentMode) {
  const level = registerLevel(index);
  return interfaceValue(level, "tabooZh", "tabooTh") || [];
}

function firstRouteAnswer(index = currentMode) {
  return answerForDirection(registerRoute(index)?.steps?.[0]?.answer) || {};
}

function offlineConfig() {
  return window.OFFLINE_APP_CONTENT?.[currentDirection];
}

function offlineOptionForSpeaker(option) {
  if (!option || currentDirection !== "zh-th") return option;
  const grade = `S${Number(option.level) || 0}`;
  const profile = speakerProfileForGrade(grade);
  const selected = option.speakerForms?.[profile];
  return selected ? { ...option, ...selected, speakerProfile: profile } : option;
}

function onboardingKey(direction = currentDirection) {
  return `huilaishi-onboarded-${direction}`;
}

function pulseHaptic() {
  try { navigator.vibrate?.(10); } catch (_) { /* optional device affordance */ }
}

function selectDirection(direction, withHaptic = true) {
  pendingDirection = direction;
  $("#direction-data-status")?.classList.add("hidden");
  $$(".direction-card").forEach(card => {
    const selected = card.dataset.direction === direction;
    card.classList.toggle("selected", selected);
    card.setAttribute("aria-pressed", String(selected));
  });
  const cta = direction === "zh-th" ? "开始学泰语 · เริ่มเรียนไทย" : "เริ่มเรียนภาษาจีน · 开始学中文";
  text("#direction-cta", cta);
  $("#direction-continue").dataset.speakText = direction === "zh-th" ? "开始学泰语" : "เริ่มเรียนภาษาจีน";
  $("#direction-continue").dataset.speakLang = direction === "zh-th" ? "zh-CN" : "th-TH";
  $("#direction-continue").disabled = false;
  if (withHaptic) pulseHaptic();
}

function enterSelectedDirection(direction = pendingDirection) {
  if (!product[direction]) return;
  selectDirection(direction);
  applyDirection(direction);
  // Direction and register are settings inside the home menu, not gates in
  // front of it. Replacing the picker keeps Home as the app's stable root.
  navigate("home", { history: "replace" });
  showToast(direction === "zh-th" ? "已切换：中国人学泰语" : "เปลี่ยนแล้ว: คนไทยเรียนภาษาจีน");
}

function showDirection(options = {}) {
  stopPracticeRecording({ discard: true, reason: "direction" });
  stopLocalRecognition();
  closeSheets();
  $("#direction-screen").classList.remove("hidden");
  $("#onboarding").classList.add("hidden");
  $("#main-app").classList.add("hidden");
  $("#lesson").classList.add("hidden");
  pendingDirection = currentDirection;
  $("#close-direction").classList.remove("hidden");
  selectDirection(pendingDirection, false);
  rememberAppRoute("direction", options.history || "push");
}

function setOnboardingStage(stage, focus = true, historyMode = "push") {
  onboardingStage = stage === "confirm" ? "confirm" : "select";
  const selecting = onboardingStage === "select";
  $("#onboarding-select-step").classList.toggle("hidden", !selecting);
  $("#onboarding-confirm-step").classList.toggle("hidden", selecting);
  text("#setup-step-number", selecting ? "02" : "03");
  text("#setup-tag", currentDirection === "zh-th"
    ? (selecting ? "选择表达档位" : "确认表达档位")
    : (selecting ? "เลือกระดับภาษา" : "ยืนยันระดับภาษา"));
  if (!selecting) renderOnboardingConfirmation();
  rememberAppRoute(selecting ? "onboarding-select" : "onboarding-confirm", historyMode);
  if (!focus) return;
  requestAnimationFrame(() => {
    const container = $("#onboarding");
    if (container) container.scrollTop = 0;
    const target = selecting
      ? $(`#setup-mode-list [data-setup-mode="${pendingMode}"]`)
      : $("#onboarding-confirm-step h1");
    if (target && !target.matches("button, [href], input, select, textarea, [tabindex]")) target.tabIndex = -1;
    try { target?.focus?.({ preventScroll: true }); }
    catch (_) { target?.focus?.(); }
  });
}

function showOnboarding(options = {}) {
  stopPracticeRecording({ discard: true, reason: "onboarding" });
  stopLocalRecognition();
  $("#direction-screen").classList.add("hidden");
  $("#main-app").classList.add("hidden");
  $("#lesson").classList.add("hidden");
  $("#onboarding").classList.remove("hidden");
  pendingMode = currentMode;
  onboardingPreviewAcknowledged = false;
  onboardingIsFirstRun = safeStorage.getItem(onboardingKey()) !== "1";
  renderModeList();
  updateOnboardingPreviewAction();
  setOnboardingStage("select", false, options.history || "push");
  requestAnimationFrame(() => { $("#onboarding").scrollTop = 0; });
}

function showMain() {
  stopPracticeRecording({ discard: true, reason: "main" });
  stopLocalRecognition();
  $("#direction-screen").classList.add("hidden");
  $("#onboarding").classList.add("hidden");
  $("#lesson").classList.add("hidden");
  $("#main-app").classList.remove("hidden");
  renderLocalProgress();
}

function readProgressJson(key, fallback) {
  try {
    const value = JSON.parse(safeStorage.getItem(key));
    return value ?? fallback;
  } catch (_) {
    return fallback;
  }
}

function readProgressNumber(key) {
  try {
    const value = Number(safeStorage.getItem(key) || 0);
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
  } catch (_) {
    return 0;
  }
}

function renderLocalProgress() {
  const grades = ["S5", "S4", "S3", "S2", "S1"];
  const completed = grades.map(grade => {
    try { return safeStorage.getItem(`register-route-complete-${currentDirection}-${grade}`) === "1" ? 1 : 0; }
    catch (_) { return 0; }
  });
  const battles = grades.map(grade => readProgressNumber(`register-battle-index-${currentDirection}-${grade}`));
  const offlineTurns = readProgressNumber(`offline-turns-${currentDirection}`);
  const stats = readProgressJson(`huilaishi-arcade-stats-${currentDirection}`, {});
  const gameIds = ["voice", "match", "audio", "speed", "tone", "polish", "grade-lock", "scene-listen", "register-shift"];
  const nonnegative = value => {
    const number = Number(value);
    return Number.isFinite(number) ? Math.max(0, number) : 0;
  };
  const gameBest = gameIds.map(id => nonnegative(stats?.[id]?.best));
  const gamePlays = gameIds.map(id => nonnegative(stats?.[id]?.plays));
  const totalBest = Math.round(gameBest.reduce((sum, value) => sum + value, 0));
  const totalGamePlays = Math.round(gamePlays.reduce((sum, value) => sum + value, 0));
  const knownValue = readProgressJson(`huilaishi-vocab-known-${currentDirection}`, []);
  const knownCount = Array.isArray(knownValue) ? new Set(knownValue).size : 0;
  const routeCount = completed.reduce((sum, value) => sum + value, 0);
  const battleCount = battles.reduce((sum, value) => sum + value, 0);
  const effectivePractice = routeCount + battleCount + offlineTurns + totalGamePlays;
  const isFreshProfile = effectivePractice === 0 && knownCount === 0;
  const abilities = [
    battles[0] + battles[1] + (completed[0] + completed[1]) * 3,
    battles[2] + completed[2] * 3,
    battles[3] + battles[4] + (completed[3] + completed[4]) * 3,
    battleCount + offlineTurns + gamePlays.slice(3).reduce((sum, value) => sum + value, 0)
  ].map(value => Math.max(0, Math.round(value)));

  $$(".skill-grid > div").forEach((node, index) => {
    const value = abilities[index] || 0;
    const number = node.querySelector("b");
    if (number) number.textContent = isFreshProfile ? "—" : String(value);
  });
  $$(".ability-row").forEach((node, index) => {
    const value = abilities[index] || 0;
    const fill = node.querySelector("i b");
    const number = node.querySelector("strong");
    if (fill) fill.style.width = `${Math.min(100, value * 10)}%`;
    if (number) number.textContent = isFreshProfile ? "—" : String(value);
    node.setAttribute("aria-label", currentDirection === "zh-th"
      ? `${config().ui.skills[index]}，本机记录 ${value} 次`
      : `${config().ui.skills[index]} บันทึกในเครื่อง ${value} ครั้ง`);
  });

  const levelPoints = effectivePractice + Math.floor(knownCount / 10);
  const thresholds = [0, 1, 5, 15, 30, 60, 100];
  let localLevel = 0;
  thresholds.forEach((threshold, index) => { if (levelPoints >= threshold) localLevel = index; });
  const levelNames = currentDirection === "zh-th"
    ? ["等待第一次练习", "刚刚开口", "会选分寸", "场景上手", "档位熟练", "随场合切换", "双语会来事"]
    : ["รอการฝึกครั้งแรก", "เริ่มพูดแล้ว", "เริ่มเลือกคำเป็น", "เริ่มรับมือสถานการณ์", "ใช้ระดับภาษาได้คล่อง", "ปรับตามกาลเทศะได้", "สื่อสารสองภาษาเป็น"];
  text("#profile-level", levelNames[localLevel]);
  text(".profile-avatar em", `Lv. ${localLevel}`);
  text("#ability-title", currentDirection === "zh-th" ? "真实练习记录" : "บันทึกการฝึกจริง");
  text("#ability-week", isFreshProfile
    ? (currentDirection === "zh-th" ? "完成首个任务后开始记录" : "เริ่มบันทึกหลังจบภารกิจแรก")
    : (currentDirection === "zh-th" ? `本机累计 ${effectivePractice} 次` : `สะสมในเครื่อง ${effectivePractice} ครั้ง`));

  const achievementValues = [routeCount, effectivePractice, knownCount];
  const achievementLabels = currentDirection === "zh-th"
    ? ["完成路线", "有效练习", "掌握词汇"]
    : ["เส้นทางที่จบ", "การฝึกที่ทำ", "คำที่จำได้"];
  $$(".achievement-row > div").forEach((node, index) => {
    const number = node.querySelector("span");
    if (number) number.textContent = isFreshProfile ? "—" : String(achievementValues[index] || 0);
    text(`#achievement-${index}`, achievementLabels[index]);
  });

  text("#league-label", currentDirection === "zh-th" ? "游戏本机最佳" : "สถิติเกมดีที่สุดในเครื่อง");
  text("#league-value", totalBest > 0
    ? (currentDirection === "zh-th" ? `${totalBest.toLocaleString()} 分 · ${totalGamePlays} 局` : `${totalBest.toLocaleString()} คะแนน · ${totalGamePlays} เกม`)
    : (currentDirection === "zh-th" ? "还没有战绩" : "ยังไม่มีสถิติ"));
  const bestGame = Math.max(...gameBest, 0);
  const bars = $$(".league-bars i");
  bars.forEach((bar, index) => {
    const height = bestGame > 0 ? 5 + Math.round((gameBest[index] / bestGame) * 25) : 4;
    bar.style.height = `${height}px`;
    bar.style.opacity = gameBest[index] > 0 ? "1" : ".28";
  });
  const chart = $(".league-bars");
  if (chart) {
    chart.setAttribute("role", "img");
    chart.setAttribute("aria-label", currentDirection === "zh-th"
      ? `九个游戏的本机最佳分：${gameBest.join("、")}`
      : `คะแนนดีที่สุดของเก้าเกมในเครื่อง: ${gameBest.join(", ")}`);
  }
}

function renderAboutDisclosure() {
  const isZh = currentDirection === "zh-th";
  const items = isZh ? [
    ["声音来源", "当前学习示范音、导航音和角色样音均为合成声音，不是原创真人录音；尚待母语教师终审，角色设定原创，但声音模型并非本团队自研。"],
    ["语言审核", "结构校验不能替代母语教师判断；泰语发音、声调和例句仍处于母语教师终审待完成状态。"],
    ["商业发布", "声音商用再分发凭据与第三方许可归档尚待补齐，完成前不应宣传为已完成商业授权。"],
    ["评分边界", "发音评分是设备端辅助反馈，不是语音学认证，也不能替代真人教师。"]
  ] : [
    ["แหล่งที่มาของเสียง", "เสียงตัวอย่างเพื่อเรียน เสียงนำทาง และเสียงตัวละครในขณะนี้เป็นเสียงสังเคราะห์ ไม่ใช่เสียงคนจริงที่สร้างขึ้นใหม่ และยังรอครูเจ้าของภาษาตรวจรอบสุดท้าย ตัวละครเป็นงานออกแบบต้นฉบับ แต่โมเดลเสียงไม่ได้พัฒนาเอง"],
    ["การตรวจภาษา", "การตรวจโครงสร้างแทนครูเจ้าของภาษาไม่ได้ การออกเสียง วรรณยุกต์ และประโยคภาษาไทยยังรอการตรวจขั้นสุดท้ายจากครูเจ้าของภาษา"],
    ["การเผยแพร่เชิงพาณิชย์", "หลักฐานสิทธิ์เผยแพร่เสียงเชิงพาณิชย์และเอกสารใบอนุญาตของบุคคลที่สามยังจัดเก็บไม่ครบ จึงไม่ควรโฆษณาว่าได้รับสิทธิ์เชิงพาณิชย์ครบแล้ว"],
    ["ขอบเขตการให้คะแนน", "คะแนนการออกเสียงเป็นเพียงฟีดแบ็กช่วยฝึกจากอุปกรณ์ ไม่ใช่การรับรองทางสัทศาสตร์และไม่แทนครูจริง"]
  ];
  text("#about-sheet-eyebrow", isZh ? "TRANSPARENCY · 透明披露" : "TRANSPARENCY · คำชี้แจง");
  text("#about-sheet-title", isZh ? "内容与声音说明" : "คำชี้แจงเนื้อหาและเสียง");
  $("#about-disclosures").innerHTML = items.map(([title, copy]) => `<article><b>${escapeHtml(title)}</b><p>${escapeHtml(copy)}</p></article>`).join("");
  text("#about-privacy-link", isZh ? "隐私说明" : "นโยบายความเป็นส่วนตัว");
  text("#about-safety-link", isZh ? "内容安全说明" : "คำอธิบายความปลอดภัยของเนื้อหา");
  text("#about-voice-link", isZh ? "声音来源记录" : "บันทึกที่มาของเสียง");
  text("#about-confirm", isZh ? "我已了解" : "รับทราบแล้ว");
  const standaloneFile = Boolean(window.SINGLE_FILE_BUILD) || location.protocol === "file:";
  $("#about-policy-links").classList.toggle("hidden", standaloneFile);
  $("#about-single-file-note").classList.toggle("hidden", !standaloneFile);
  text("#about-single-file-note", isZh
    ? "当前是单文件离线版；关键披露已完整写在本页，联网政策文档入口已隐藏。"
    : "ขณะนี้เป็นไฟล์ออฟไลน์ไฟล์เดียว คำชี้แจงสำคัญอยู่ในหน้านี้ครบแล้ว และซ่อนลิงก์เอกสารออนไลน์ไว้");
}

function renderLocalDataManagementUi() {
  const isZh = currentDirection === "zh-th";
  const navigationLanguage = isZh ? "zh-CN" : "th-TH";
  text("#local-data-heading", isZh ? "本机数据管理" : "จัดการข้อมูลในเครื่อง");
  text("#local-data-note", isZh
    ? "导出文件只包含本应用的学习键、版本、时间和方向统计，不包含麦克风录音。"
    : "ไฟล์ส่งออกมีเฉพาะคีย์การเรียน เวอร์ชัน เวลา และสถิติแยกตามเส้นทางของแอปนี้ ไม่รวมเสียงไมโครโฟน");
  text("#export-learning-data-label", isZh ? "导出学习数据" : "ส่งออกข้อมูลการเรียน");
  text("#export-learning-data-action", isZh ? "下载 JSON" : "ดาวน์โหลด JSON");
  text("#clear-learning-data-label", isZh ? "清除本机学习数据" : "ล้างข้อมูลการเรียนในเครื่อง");
  text("#clear-learning-data-action", isZh ? "谨慎操作" : "โปรดระวัง");
  $("#export-learning-data").dataset.speakText = isZh ? "导出学习数据" : "ส่งออกข้อมูลการเรียน";
  $("#export-learning-data").dataset.speakLang = navigationLanguage;
  $("#clear-learning-data").dataset.speakText = isZh ? "清除本机学习数据" : "ล้างข้อมูลการเรียนในเครื่อง";
  $("#clear-learning-data").dataset.speakLang = navigationLanguage;
  text("#data-clear-sheet-eyebrow", isZh ? "LOCAL DATA · 本机数据" : "LOCAL DATA · ข้อมูลในเครื่อง");
  text("#data-clear-sheet-title", isZh ? "确认清除学习数据？" : "ยืนยันล้างข้อมูลการเรียน?");
  text("#data-clear-sheet-copy", isZh
    ? "这会清除两种学习方向的进度、词库标记、游戏成绩和本应用偏好，并尝试删除已下载的分级声包与核心语音。"
    : "ระบบจะล้างความคืบหน้าของทั้งสองเส้นทาง เครื่องหมายคำศัพท์ คะแนนเกม และการตั้งค่าของแอป พร้อมพยายามลบชุดเสียงตามระดับและเสียงหลักที่ดาวน์โหลดไว้");
  text("#data-clear-scope span", isZh
    ? "只删除“萨瓦迪卡”明确登记的本地键，不会清除同一网站下其他项目的数据，也不会读取或导出麦克风录音。"
    : "ลบเฉพาะคีย์ในเครื่องที่แอป “萨瓦迪卡” ระบุไว้ชัดเจน ไม่แตะข้อมูลของโครงการอื่นในเว็บไซต์เดียวกัน และไม่อ่านหรือส่งออกเสียงไมโครโฟน");
  text("#confirm-clear-learning-data", isZh ? "确认清除" : "ยืนยันล้างข้อมูล");
  text("#cancel-clear-learning-data", isZh ? "取消，保留数据" : "ยกเลิกและเก็บข้อมูลไว้");
  $("#confirm-clear-learning-data").dataset.speakText = isZh ? "确认清除" : "ยืนยันล้างข้อมูล";
  $("#confirm-clear-learning-data").dataset.speakLang = navigationLanguage;
  $("#cancel-clear-learning-data").dataset.speakText = isZh ? "取消，保留数据" : "ยกเลิกและเก็บข้อมูลไว้";
  $("#cancel-clear-learning-data").dataset.speakLang = navigationLanguage;
  $("#cancel-clear-learning-data").setAttribute("aria-label", isZh ? "取消并保留学习数据" : "ยกเลิกและเก็บข้อมูลการเรียนไว้");
  $("#data-clear-sheet [data-close-sheet]").setAttribute("aria-label", isZh ? "关闭清除确认" : "ปิดหน้าต่างยืนยันการล้างข้อมูล");
}

function readThaiSpeakerProfile() {
  try {
    const value = safeStorage.getItem(THAI_SPEAKER_PROFILE_KEY);
    return value === "male" ? "male" : "female";
  } catch (_) { return "female"; }
}

function renderThaiSpeakerProfile() {
  const isZh = currentDirection === "zh-th";
  const setting = $(".speaker-form-setting");
  setting.classList.toggle("hidden", !isZh);
  setting.setAttribute("aria-hidden", String(!isZh));
  text("#speaker-form-label", isZh ? "泰语说话者形式" : "รูปแบบผู้พูดภาษาไทย");
  text("#speaker-form-note", isZh
    ? "仅影响 S5/S4 安全礼貌句；男句式暂无固定男声，播放时使用设备备用音。S3/S2 按原句，S1 角色音不变"
    : "มีผลเฉพาะประโยคสุภาพปลอดภัย S5/S4 รูปประโยคผู้ชายยังไม่มีเสียงผู้ชายแบบคงที่ จึงใช้เสียงสำรองของอุปกรณ์ ส่วน S3/S2 และ S1 ไม่เปลี่ยน");
  text("#speaker-female-label", isZh ? "女性" : "ผู้หญิง");
  text("#speaker-male-label", isZh ? "男性句式" : "รูปประโยคผู้ชาย");
  text("#speaker-male-note", isZh ? "ครับ / ผม · 设备备用音" : "ครับ / ผม · เสียงสำรองของอุปกรณ์");
  $$("[data-speaker-profile]").forEach(button => {
    const selected = button.dataset.speakerProfile === thaiSpeakerProfile;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
    button.disabled = !isZh;
  });
}

function selectThaiSpeakerProfile(profile) {
  const next = profile === "male" ? "male" : "female";
  if (next === thaiSpeakerProfile) return;
  thaiSpeakerProfile = next;
  safeStorage.setItem(THAI_SPEAKER_PROFILE_KEY, next);
  renderThaiSpeakerProfile();
  renderModeList();
  applyMode(currentMode, false);
  if (onboardingStage === "confirm") renderOnboardingConfirmation();
  window.ArcadeUI?.onSpeakerProfileChange?.();
  showToast(currentDirection === "zh-th"
    ? `已切换为泰语${next === "male" ? "男性ครับ/ผม" : "女性ค่ะ/ดิฉัน"}形式`
    : `เปลี่ยนเป็นรูปแบบผู้พูด${next === "male" ? "ชาย ครับ/ผม" : "หญิง ค่ะ/ดิฉัน"}แล้ว`);
}

function readSpeechPace() {
  const value = safeStorage.getItem(SPEECH_PACE_KEY);
  return ["natural", "clear", "slow"].includes(value) ? value : "clear";
}

function renderSpeechPace() {
  const isZh = currentDirection === "zh-th";
  text("#speech-pace-label", isZh ? "听音清晰度" : "ความชัดของเสียง");
  text("#speech-pace-note", isZh
    ? "调整普通示范音的速度，不改变音高；慢听按钮和听力题保留各自训练速度。"
    : "ปรับความเร็วของเสียงตัวอย่างทั่วไปโดยไม่เปลี่ยนระดับเสียง ปุ่มฟังช้าและโจทย์ฟังยังใช้ความเร็วฝึกของตนเอง");
  const labels = isZh
    ? { natural: "自然", clear: "清晰", slow: "慢听" }
    : { natural: "ธรรมชาติ", clear: "ชัดเจน", slow: "ฟังช้า" };
  Object.entries(labels).forEach(([pace, label]) => text(`#speech-pace-${pace}`, label));
  $$("[data-speech-pace]").forEach(button => {
    const selected = button.dataset.speechPace === speechPace;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
    button.setAttribute("aria-label", `${labels[button.dataset.speechPace]} ${button.querySelector("small")?.textContent || ""}`.trim());
  });
  window.HUILAISHI_SPEECH?.setPace?.(speechPace);
}

function selectSpeechPace(value, sourceButton) {
  speechPace = ["natural", "clear", "slow"].includes(value) ? value : "clear";
  safeStorage.setItem(SPEECH_PACE_KEY, speechPace);
  renderSpeechPace();
  pulseHaptic();
  const isZh = currentDirection === "zh-th";
  const labels = isZh
    ? { natural: "自然", clear: "清晰", slow: "慢听" }
    : { natural: "ธรรมชาติ", clear: "ชัดเจน", slow: "ฟังช้า" };
  showToast(isZh ? `普通示范音已切换为「${labels[speechPace]}」` : `เปลี่ยนเสียงตัวอย่างเป็น “${labels[speechPace]}” แล้ว`);
  const sample = isZh ? "สวัสดีค่ะ" : "你好";
  const lang = isZh ? "th-TH" : "zh-CN";
  window.HUILAISHI_SPEECH?.speak?.(sample, { lang, track: "standard", element: sourceButton });
}

function applyDirection(direction, persist = true) {
  stopPracticeRecording({ discard: true, reason: "direction-change" });
  stopLocalRecognition();
  currentDirection = direction;
  const data = config();
  mergeOfflinePhrases(data);
  document.documentElement.lang = data.interfaceLang;
  document.body.classList.toggle("dir-th-zh", direction === "th-zh");
  const isChineseUi = direction === "zh-th";
  document.title = isChineseUi ? `${data.brand} · 中泰双向语言学习` : `${data.brand} · แอปเรียนจีน–ไทยสองทาง`;
  $("#main-app").setAttribute("aria-label", data.brand);
  $("#lesson").setAttribute("aria-label", data.ui.lessonScene);
  $("#start-lesson").setAttribute("aria-label", data.ui.missionStart);
  $("#home-avatar").setAttribute("aria-label", data.ui.nav[4]);
  $("#reset-onboarding").setAttribute("aria-label", isChineseUi ? "重新选择语气档位" : "เลือกระดับโทนภาษาใหม่");
  $(".logo-button").setAttribute("aria-label", data.ui.nav[0]);
  $("#back-to-direction").setAttribute("aria-label", isChineseUi ? "返回选择学习方向" : "กลับไปเลือกเส้นทางการเรียน");
  $("#partner-audio").setAttribute("aria-label", isChineseUi ? "播放搭子语音" : "ฟังเสียงคู่ฝึก");
  $("#speak-vibe").setAttribute("aria-label", isChineseUi ? "播放当前句子" : "ฟังประโยคปัจจุบัน");
  $("#speak-vibe-slow").setAttribute("aria-label", isChineseUi ? "清晰慢听当前句子" : "ฟังประโยคนี้ช้าแบบชัดเจน");
  text("#speak-vibe-slow", isChineseUi ? "慢听" : "ฟังช้า");
  $("#vibe-slider").setAttribute("aria-label", isChineseUi ? "选择表达档位" : "เลือกระดับโทนภาษา");
  $(".bottom-nav").setAttribute("aria-label", isChineseUi ? "主导航" : "เมนูหลัก");
  $("#close-lesson").setAttribute("aria-label", isChineseUi ? "关闭课程" : "ปิดบทเรียน");
  $$('[data-close-sheet]').forEach(button => button.setAttribute("aria-label", isChineseUi ? "关闭" : "ปิด"));
  if (persist) safeStorage.setItem("learningDirection", direction);

  const storedModeValue = safeStorage.getItem(`thai-vibe-mode-${direction}`);
  const storedMode = Number(storedModeValue);
  currentMode = storedModeValue !== null && Number.isInteger(storedMode) && storedMode >= 0 && storedMode < 5 ? storedMode : 1;
  pendingMode = currentMode;
  riskAccepted = false;

  text("#setup-mark", data.mark);
  text("#setup-eyebrow", isChineseUi ? "同一个意思 · 五种说话分寸" : "ความหมายเดียว · 5 ระดับภาษา");
  html("#onboarding-title", isChineseUi ? "先选你要练的<br><em>说话分寸</em>" : "เลือกระดับภาษา<br><em>ที่อยากฝึกก่อน</em>");
  html("#setup-lede", isChineseUi
    ? "这里评价的是表达和场合，不是评价你这个人。选完先看示例，再开始对应任务。"
    : "เราประเมินสำนวนและสถานการณ์ ไม่ได้ตัดสินตัวคุณ เลือกแล้วดูตัวอย่างก่อนเริ่มภารกิจที่ตรงระดับ");
  text("#setup-scale-safe", isChineseUi ? "稳妥体面" : "สุภาพและปลอดภัย");
  text("#setup-scale-note", isChineseUi ? "越往下，使用范围越窄" : "ยิ่งลงไป ยิ่งใช้ได้ในวงแคบ");
  text("#setup-scale-risk", isChineseUi ? "只听不说" : "ฟังเท่านั้น");
  $("#setup-mode-list").setAttribute("aria-label", isChineseUi ? "选择说话语气" : "เลือกระดับโทนภาษา");
  text("#mode-picker-label", data.setup.picker);
  text("#start-app-label", isChineseUi ? "看这个档位怎么说" : "ดูตัวอย่างระดับนี้");
  $("#start-app").dataset.speakText = isChineseUi ? "看这个档位怎么说" : "ดูตัวอย่างระดับนี้";
  $("#peek-home").dataset.speakText = data.setup.peek;
  text("#peek-home", data.setup.peek);
  text("#confirm-eyebrow", isChineseUi ? "确认你的表达档位" : "ยืนยันระดับภาษาที่จะเรียน");
  text("#confirm-use-title", isChineseUi ? "适合这样用" : "เหมาะสำหรับ");
  text("#confirm-boundary-title", isChineseUi ? "学习边界" : "ขอบเขตการเรียน");
  text("#confirm-task-kicker", isChineseUi ? "接下来 · 第 1 个任务" : "ถัดไป · ภารกิจแรก");
  text("#confirm-back-mode", isChineseUi ? "返回重选" : "กลับไปเลือกใหม่");
  text("#home-register-kicker", isChineseUi ? "今天练什么 · 表达档位" : "วันนี้ฝึกอะไร · ระดับภาษา");
  text("#home-change-mode-label", isChineseUi ? "切换" : "เปลี่ยน");
  text("#home-register-use-label", isChineseUi ? "适合" : "เหมาะกับ");
  text("#home-standard-voice", isChineseUi ? "清晰示范音 · 跟读用" : "เสียงตัวอย่างชัดเจน · ใช้ฝึกพูดตาม");
  text("#home-role-voice", isChineseUi ? "角色演绎 · 勿作标准发音" : "เสียงตัวละคร · ไม่ใช่เสียงมาตรฐาน");
  text("#main-menu-kicker", isChineseUi ? "MAIN MENU · 主菜单" : "MAIN MENU · เมนูหลัก");
  text("#main-menu-title", isChineseUi ? "今天想先练什么？" : "วันนี้อยากฝึกอะไรก่อน?");
  text("#main-menu-subtitle", isChineseUi ? "直接选功能；学习方向和表达档位随时可改。" : "เลือกฟังก์ชันได้เลย เปลี่ยนเส้นทางและระดับภาษาได้ทุกเมื่อ");
  text("#main-menu-ready-label", isChineseUi ? "离线可用" : "ใช้แบบออฟไลน์ได้");
  text("#main-menu-direction-label", isChineseUi ? "学习方向" : "เส้นทางการเรียน");
  text("#main-menu-direction-value", data.directionLabel);
  text("#main-menu-mode-label", isChineseUi ? "表达档位" : "ระดับภาษา");
  $(".home-main-menu-settings").setAttribute("aria-label", isChineseUi ? "当前学习设置" : "การตั้งค่าการเรียนปัจจุบัน");
  $(".home-main-menu-grid").setAttribute("aria-label", isChineseUi ? "主菜单功能" : "ฟังก์ชันเมนูหลัก");
  const menuCopy = isChineseUi
    ? [["开口闯关", "读准才解锁"], ["词汇与发音", "词库 · 音标课"], ["离线对话", "8 个真实场景"], ["游戏与对战", "9 游戏 · 抢麦格斗"]]
    : [["ด่านพูด", "พูดชัดจึงปลดล็อก"], ["คำศัพท์และเสียง", "คลังคำ · บทเรียนเสียง"], ["บทสนทนาออฟไลน์", "8 สถานการณ์จริง"], ["เกมและดวล", "9 เกม · ดวลแย่งไมค์"]];
  ["lesson", "library", "live", "battle"].forEach((key, index) => {
    text(`#main-menu-${key}-title`, menuCopy[index][0]);
    text(`#main-menu-${key}-copy`, menuCopy[index][1]);
  });
  const menuSpeech = isChineseUi
    ? [["#main-menu-direction", "切换学习方向"], ["#main-menu-mode", "切换表达档位"], ["#main-menu-lesson", "开始今日课程"]]
    : [["#main-menu-direction", "เปลี่ยนเส้นทางการเรียน"], ["#main-menu-mode", "เปลี่ยนระดับภาษา"], ["#main-menu-lesson", "เริ่มบทเรียนวันนี้"]];
  menuSpeech.forEach(([selector, value]) => {
    $(selector).dataset.speakText = value;
    $(selector).dataset.speakLang = data.interfaceLang;
  });

  text("#app-logo-mark", data.mark);
  text("#app-brand-name", data.brand);
  text("#header-direction-text", data.directionLabel);
  const navigationLanguage = data.interfaceLang;
  $("#header-direction").dataset.speakText = data.ui.switchDirection;
  $("#header-direction").dataset.speakLang = navigationLanguage;
  $("#close-direction").dataset.speakText = isChineseUi ? "返回上一页" : "กลับหน้าก่อน";
  $("#close-direction").dataset.speakLang = navigationLanguage;
  $("#close-direction").setAttribute("aria-label", isChineseUi ? "返回上一页" : "กลับหน้าก่อน");
  const now = new Date();
  const localDate = new Intl.DateTimeFormat(isChineseUi ? "zh-CN" : "th-TH", { month: "short", day: "numeric" }).format(now);
  text("#home-weather", isChineseUi ? `${localDate} · 今日泰语` : `${localDate} · ฝึกภาษาจีนวันนี้`);
  text("#home-greeting", data.ui.greeting);
  text("#home-avatar", data.ui.avatar);
  text("#mission-label", data.ui.missionLabel);
  text("#mission-chapter", data.ui.chapter);
  html("#mission-title", data.ui.missionTitle);
  html("#mission-copy", data.ui.missionCopy);
  text("#mission-time", data.ui.time);
  text("#mission-count", data.ui.count);
  text("#mission-npc", data.ui.npc);
  text("#shop-word", data.ui.shopWord);
  $(".mission-flow").setAttribute("aria-label", data.ui.missionFlowAria);
  $$(".mission-flow span").forEach((node, index) => { node.textContent = data.ui.missionFlow[index]; });
  text("#start-lesson span", data.ui.missionStart);
  text("#partner-eyebrow", data.ui.partnerEyebrow);
  text("#partner-heading", data.ui.partnerHeading);
  text("#partner-streak", data.ui.partnerStreak);
  text("#vibe-eyebrow", isChineseUi ? "当前表达档位示例" : "ตัวอย่างระดับปัจจุบัน");
  text("#vibe-heading", isChineseUi ? "这一档怎么说" : "ระดับนี้พูดอย่างไร");
  text("#vibe-info", isChineseUi ? "随档位更新" : "เปลี่ยนตามระดับ");
  text("#current-mode-label", data.ui.currentMode);
  text("#intent-label", data.ui.intent);
  text("#reaction-label", data.ui.reaction);
  text("#console-safe", data.ui.consoleSafe);
  text("#console-title", data.ui.consoleTitle);
  text("#console-risk", data.ui.consoleRisk);
  text("#route-eyebrow", data.ui.routeEyebrow);
  text("#route-title", data.ui.routeTitle);
  text("#route-details", data.ui.routeDetails);
  data.ui.routeStops.forEach((value, i) => text(`#route-stop-${i}`, value));
  text("#skill-note", data.ui.skillNote);
  data.ui.skills.forEach((value, i) => { text(`#skill-${i}`, value); text(`#ability-${i}`, value); });
  text("#battle-eyebrow", data.ui.battleEyebrow);
  text("#battle-title", data.ui.battleTitle);
  text("#battle-subtitle", data.ui.battleSubtitle);
  text("#battle-badge", data.ui.battleBadge);
  text("#battle-person-label", data.ui.personLabel);
  text("#league-label", data.ui.leagueLabel);
  text("#league-value", data.ui.leagueValue);
  text("#pass-phone-title", data.ui.passTitle);
  text("#pass-phone-copy", data.ui.passCopy);
  text("#library-eyebrow", currentDirection === "zh-th" ? `已收录 ${data.phrases.length} 句` : `รวมแล้ว ${data.phrases.length} ประโยค`);
  text("#library-title", data.ui.libraryTitle);
  text("#library-subtitle", data.ui.librarySubtitle);
  const registerFilters = isChineseUi
    ? ["全部", "日常", "旅行", "职场", "社交", "购物"]
    : ["ทั้งหมด", "ชีวิตประจำวัน", "ท่องเที่ยว", "ที่ทำงาน", "สังคม", "ช้อปปิ้ง"];
  ["all","daily","travel","work","social","shopping"].forEach((key, i) => text(`#filter-${key}`, registerFilters[i]));
  text("#profile-avatar-char", data.ui.avatar);
  text("#profile-name", data.ui.profileName);
  html("#profile-level-label", `${data.ui.levelLabel}<strong id="profile-level">${data.ui.level}</strong>`);
  text("#ability-title", data.ui.abilityTitle);
  text("#ability-week", data.ui.abilityWeek);
  data.ui.achievements.forEach((value, i) => text(`#achievement-${i}`, value));
  text("#switch-direction-label", data.ui.switchDirection);
  text("#settings-direction", data.directionLabel);
  text("#change-mode-label", data.ui.changeMode);
  text("#method-label", data.ui.method);
  text("#method-action", data.ui.methodAction);
  $("#start-app").dataset.speakLang = navigationLanguage;
  $("#peek-home").dataset.speakLang = navigationLanguage;
  $("#switch-direction").dataset.speakText = data.ui.switchDirection;
  $("#switch-direction").dataset.speakLang = navigationLanguage;
  $("#change-mode").dataset.speakText = isChineseUi ? "切换表达档位" : "เปลี่ยนระดับภาษาเริ่มต้น";
  $("#change-mode").dataset.speakLang = navigationLanguage;
  $("#show-method").dataset.speakText = isChineseUi ? "查看表达档位说明" : "ดูคำอธิบายระดับภาษา";
  $("#show-method").dataset.speakLang = navigationLanguage;
  $("#install-app").dataset.speakText = isChineseUi ? "查看安装方法" : "ดูวิธีติดตั้ง";
  $("#install-app").dataset.speakLang = navigationLanguage;
  text("#alai-voice-title", currentDirection === "zh-th" ? "阿来声线" : "เสียง A-Lai");
  text("#alai-voice-copy", currentDirection === "zh-th" ? "合成导航样音 · 非原创声库 · 本地播放" : "เสียงนำทางสังเคราะห์ · ไม่ใช่คลังเสียงที่สร้างเอง · เล่นในเครื่อง");
  text("#alai-voice-action", currentDirection === "zh-th" ? "试听" : "ลองฟัง");
  text("#sugarblade-voice-title", currentDirection === "zh-th" ? "糖刀 · 软萌角色样音" : "Sugar Blade · ตัวอย่างเสียงตัวละครน่ารัก");
  text("#sugarblade-voice-copy", currentDirection === "zh-th" ? "S1 成年女声方向 · 合成样音，非原创真人录音" : "แนวเสียงผู้หญิงผู้ใหญ่ S1 · ตัวอย่างสังเคราะห์ ไม่ใช่เสียงคนจริงที่สร้างเอง");
  text("#sugarblade-voice-action", currentDirection === "zh-th" ? "试听反差" : "ลองฟังความตัดกัน");
  text("#prototype-note", data.ui.prototype);
  ["home","live","battle","library","profile"].forEach((key, i) => text(`#nav-${key}`, data.ui.nav[i]));
  text("#mode-sheet-eyebrow", data.ui.modeEyebrow);
  text("#mode-sheet-title", data.ui.modeTitle);
  text("#mode-sheet-note", data.ui.modeNote);
  text("#confirm-mode", data.ui.confirmMode);
  text("#lesson-scene-label", data.ui.lessonScene);
  text("#speak-npc-label", data.ui.listen);
  text("#lesson-scroll-hint", isChineseUi ? "↓ 上滑查看全部 3 个答案" : "↓ เลื่อนขึ้นเพื่อดูคำตอบทั้ง 3 ข้อ");
  text("#info-eyebrow", data.ui.infoEyebrow);
  text("#info-title", data.ui.infoTitle);
  text("#info-confirm", data.ui.infoConfirm);
  text("#about-label", isChineseUi ? "关于内容与声音" : "เกี่ยวกับเนื้อหาและเสียง");
  text("#about-action", isChineseUi ? "查看披露" : "ดูคำชี้แจง");
  $("#show-about").dataset.speakText = isChineseUi ? "查看内容与声音披露" : "ดูคำชี้แจงเรื่องเนื้อหาและเสียง";
  $("#show-about").dataset.speakLang = navigationLanguage;
  renderAboutDisclosure();
  renderLocalDataManagementUi();
  renderThaiSpeakerProfile();
  renderSpeechPace();

  text("#warning-title", data.warning.title);
  html("#warning-copy", data.warning.copy);
  text("#warning-example-label", data.warning.label);
  text("#warning-words", data.warning.words);
  $("#warning-words").lang = data.targetHtmlLang;
  text("#warning-example-note", data.warning.note);
  text("#accept-risk", data.warning.accept);
  text("#decline-risk", data.warning.decline);
  $("#principle-list").innerHTML = data.principles.map((item, i) => `<div><span>0${i + 1}</span><p><strong>${item[0]}</strong>${item[1]}</p></div>`).join("");

  renderVibeTicks();
  renderModeList();
  applyMode(currentMode, false);
  renderPartner();
  renderBattle();
  renderPhrases("all");
  resetFilters();
  renderPassSheet();
  renderLive();
  updateInstallUi();
  prepareLocalSpeech();
  window.VocabUI?.onDirectionChange?.();
  window.ArcadeUI?.onDirectionChange?.();
  window.PronunciationCourse?.onDirectionChange?.(direction);
  renderLocalProgress();
}

function renderVibeTicks() {
  $("#vibe-ticks").innerHTML = config().modes.map((mode, index) => {
    const example = comparisonExample(index);
    return `<button data-index="${index}" data-speak-text="${escapeHtml(example.target)}" data-speak-lang="${config().targetLang}" ${index === 4 ? 'data-speech-policy="native" data-speech-track="character"' : 'data-speech-track="standard"'} aria-label="${escapeHtml(`${mode.code} ${registerName(index)}`)}" aria-pressed="${index === currentMode}"><span>${mode.code}</span><small>${escapeHtml(registerName(index))}</small></button>`;
  }).join("");
}

function comparisonExample(index = currentMode) {
  const grade = gradeForMode(index);
  const variant = registerGuide()?.getVariant?.(REGISTER_COMPARISON_INTENT_ID, grade, speakerProfileForGrade(grade));
  const answer = answerForDirection(variant);
  if (answer.target) return answer;
  const fallback = config().modes[index];
  return { target: fallback?.target || "", reading: fallback?.roman || "", meaning: fallback?.meaning || "" };
}

function renderOnboardingModePreview(index = pendingMode) {
  const preview = $("#setup-tone-preview");
  if (!preview) return;
  const grade = gradeForMode(index);
  const level = registerLevel(index);
  const sample = comparisonExample(index);
  const comparison = registerComparison();
  const isZh = currentDirection === "zh-th";
  const isRecognition = level?.followMode === "recognition-only";
  const reading = isZh
    ? window.HUILAISHI_THAI_PHONETIC?.make(sample.target, sample.reading)
    : null;
  const boundary = registerTaboos(index)[0]
    || interfaceValue(level, "boundaryZh", "boundaryTh")
    || registerAudience(index);
  const contextEffect = isZh
    ? [
        "这个陌生服务场景里很稳妥。",
        "这个陌生服务场景里的推荐说法。",
        "对陌生店员会显得太随便；这里只做对比，实际优先 S4。",
        "在这个场景会明显冒犯；只练边界判断，并同步看 S4 改写。",
        "在这个场景风险极高；只听懂、避开并选择 S4 安全回应。"
      ][index]
    : [
        "เหมาะและปลอดภัยมากในสถานการณ์บริการกับคนไม่รู้จัก",
        "เป็นระดับที่แนะนำในสถานการณ์บริการกับคนไม่รู้จัก",
        "กันเองเกินไปสำหรับพนักงานที่ไม่รู้จัก ใช้เพื่อเปรียบเทียบและควรเลือก S4",
        "ฟังดูไม่ให้เกียรติในสถานการณ์นี้ ฝึกแยกแยะพร้อมดูคำปรับเป็น S4",
        "เสี่ยงสูงมากในสถานการณ์นี้ ใช้เพื่อฟังให้รู้ทันและเลือกคำตอบ S4 เท่านั้น"
      ][index];
  const color = sharedColors[index];

  preview.style.setProperty("--preview-color", color.color);
  preview.classList.toggle("is-risk", index >= 3);
  text("#setup-preview-grade", grade);
  text("#setup-preview-kicker", isZh ? "当前试听" : "ตัวอย่างระดับนี้");
  text("#setup-preview-name", registerName(index));
  text("#setup-preview-intent-label", isZh ? "同一意图" : "เจตนาเดียวกัน");
  text("#setup-preview-intent", comparison.intent);
  text("#setup-preview-context", [comparison.setting, comparison.relationship].filter(Boolean).join(" · "));
  text("#setup-preview-target", sample.target);
  $("#setup-preview-target").lang = config().targetHtmlLang;
  text("#setup-preview-reading", reading?.romanTone || sample.reading);
  text("#setup-preview-meaning", sample.meaning);
  text("#setup-preview-boundary", [contextEffect, boundary].filter(Boolean).join(" "));

  const mnemonic = $("#setup-preview-mnemonic");
  mnemonic.classList.toggle("hidden", !reading?.zhHint);
  $(".thai-phonetic-label", mnemonic).textContent = reading?.labelZh || "中文近音 · 仅助记";
  $(".thai-phonetic-value", mnemonic).textContent = reading?.zhHint || "";
  mnemonic.title = reading?.disclaimerZh || "";

  const voiceKind = $("#setup-preview-voice-kind");
  text("#setup-preview-voice-kind", isRecognition
    ? (isZh ? "角色演绎 · 禁止跟读" : "เสียงตัวละคร · ห้ามพูดตาม")
    : (isZh ? "学习示范音" : "เสียงตัวอย่างเพื่อเรียน"));
  voiceKind.classList.toggle("role", isRecognition);
  voiceKind.classList.toggle("standard", !isRecognition);
  $("#setup-preview-play").dataset.speechTrack = isRecognition ? "character" : "standard";
  $("#setup-preview-play").setAttribute("aria-label", isRecognition
    ? (isZh ? "播放角色演绎，勿作标准发音" : "ฟังเสียงตัวละคร ไม่ใช่เสียงมาตรฐาน")
    : (isZh ? "播放学习示范音" : "ฟังเสียงตัวอย่างเพื่อเรียน"));
  text("#setup-preview-slow", isZh ? "慢听" : "ฟังช้า");
}

function updateOnboardingPreviewAction() {
  const isZh = currentDirection === "zh-th";
  const copy = onboardingPreviewAcknowledged
    ? (isZh ? `确认 ${gradeForMode(pendingMode)}，继续` : `ยืนยัน ${gradeForMode(pendingMode)} แล้วไปต่อ`)
    : (isZh ? "先看完整试听" : "ดูตัวอย่างให้ครบก่อน");
  text("#start-app-label", copy);
  $("#start-app").dataset.speakText = copy;
}

function revealOnboardingPreview() {
  onboardingPreviewAcknowledged = true;
  updateOnboardingPreviewAction();
  const preview = $("#setup-tone-preview");
  const behavior = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ? "auto" : "smooth";
  requestAnimationFrame(() => {
    preview?.scrollIntoView?.({ behavior, block: "start" });
    if (preview) preview.tabIndex = -1;
    setTimeout(() => {
      try { preview?.focus?.({ preventScroll: true }); }
      catch (_) { preview?.focus?.(); }
    }, behavior === "smooth" ? 280 : 0);
  });
}

function renderOnboardingConfirmation() {
  const index = pendingMode;
  const grade = gradeForMode(index);
  const level = registerLevel(index);
  const route = registerRoute(index);
  const sample = comparisonExample(index);
  const isZh = currentDirection === "zh-th";
  const isRecognition = level?.followMode === "recognition-only";
  const uses = registerUseWhen(index).slice(0, 3);
  const taboos = registerTaboos(index);
  text("#confirm-grade", grade);
  text("#confirm-mode-name", registerName(index));
  text("#confirm-purpose", registerPurpose(index));
  $("#confirm-use-list").innerHTML = (uses.length ? uses : [registerAudience(index)]).map(item => `<li>${escapeHtml(item)}</li>`).join("");
  text("#confirm-boundary-copy", taboos[0] || interfaceValue(level, "boundaryZh", "boundaryTh") || "");
  text("#confirm-voice-kind", isRecognition
    ? (isZh ? "角色演绎 · 勿作标准发音" : "เสียงตัวละคร · ไม่ใช่เสียงมาตรฐาน")
    : (isZh ? "学习示范音" : "เสียงตัวอย่างเพื่อเรียน"));
  $("#confirm-voice-kind").classList.toggle("role", isRecognition);
  $("#confirm-voice-kind").classList.toggle("standard", !isRecognition);
  text("#confirm-voice-note", isRecognition
    ? (isZh ? "软萌角色音只用于识别风险台词，禁止跟读" : "เสียงตัวละครน่ารักใช้เพื่อรู้ทันคำเสี่ยง ห้ามพูดตาม")
    : (isZh ? "用于听清、跟读与发音判断" : "ใช้ฟังให้ชัด ฝึกพูดตาม และตรวจการออกเสียง"));
  const play = $("#confirm-play");
  play.dataset.speechTrack = isRecognition ? "character" : "standard";
  play.dataset.speechPolicy = "native";
  $("#confirm-play-slow").dataset.speechPolicy = "native";
  play.setAttribute("aria-label", isRecognition
    ? (isZh ? "播放角色演绎，勿作标准发音" : "ฟังเสียงตัวละคร ไม่ใช่เสียงมาตรฐาน")
    : (isZh ? "播放学习示范音" : "ฟังเสียงตัวอย่างเพื่อเรียน"));
  text("#confirm-play-slow", isZh ? "慢听" : "ฟังช้า");
  text("#confirm-target", sample.target);
  $("#confirm-target").lang = config().targetHtmlLang;
  text("#confirm-reading", sample.reading);
  text("#confirm-meaning", sample.meaning);
  text("#confirm-task-title", interfaceValue(route, "titleZh", "titleTh") || interfaceValue(level, "firstTaskZh", "firstTaskTh") || "");
  text("#confirm-task-copy", interfaceValue(level, "firstTaskZh", "firstTaskTh") || interfaceValue(route, "goalZh", "goalTh") || "");
  text("#confirm-start-label", onboardingIsFirstRun
    ? (isZh ? "开始第 1 个任务" : "เริ่มภารกิจแรก")
    : (isZh ? "保存并开始本档任务" : "บันทึกแล้วเริ่มภารกิจระดับนี้"));
}

function missionFlowForMode(index = currentMode) {
  const followMode = registerLevel(index)?.followMode;
  if (followMode === "recognition-only") return currentDirection === "zh-th"
    ? ["听懂攻击", "找出风险", "选择 S4 化解"]
    : ["ฟังคำโจมตี", "หาจุดเสี่ยง", "เลือก S4 ลดความขัดแย้ง"];
  if (followMode === "guided-boundary-output") return currentDirection === "zh-th"
    ? ["听懂冲硬", "对比 S4", "守住边界"]
    : ["ฟังคำห้วน", "เทียบ S4", "รักษาขอบเขต"];
  return currentDirection === "zh-th"
    ? ["理解场景", "选择本档", "听清再说"]
    : ["เข้าใจฉาก", "เลือกระดับนี้", "ฟังชัดแล้วพูด"];
}

function renderRegisterHome() {
  const grade = gradeForMode();
  const level = registerLevel();
  const route = registerRoute();
  const isZh = currentDirection === "zh-th";
  const isRecognition = level?.followMode === "recognition-only";
  const complete = safeStorage.getItem(`register-route-complete-${currentDirection}-${grade}`) === "1";
  text("#home-register-grade", grade);
  text("#home-register-name", registerName());
  text("#home-register-purpose", registerPurpose());
  text("#home-register-use", registerAudience());
  $("#home-role-voice").classList.toggle("hidden", !isRecognition);
  text("#mission-label", complete
    ? (isZh ? "已完成 · 可以复习" : "เรียนแล้ว · ทบทวนได้")
    : (isZh ? "第 1 个任务" : "ภารกิจแรก"));
  text("#mission-chapter", `${grade} · 01 / 03`);
  text("#mission-title", interfaceValue(route, "titleZh", "titleTh") || interfaceValue(level, "firstTaskZh", "firstTaskTh") || config().ui.missionTitle.replace(/<br>/g, " "));
  text("#mission-copy", interfaceValue(route, "goalZh", "goalTh") || interfaceValue(level, "firstTaskZh", "firstTaskTh") || "");
  text("#mission-time", isZh ? "约 4 分钟" : "ประมาณ 4 นาที");
  text("#mission-count", isZh ? `${route?.steps?.length || 3} 个场景` : `${route?.steps?.length || 3} สถานการณ์`);
  text("#mission-npc", isRecognition ? (isZh ? "只听不跟读" : "ฟังเท่านั้น") : (isZh ? "对应当前档" : "ตรงกับระดับนี้"));
  const flow = missionFlowForMode();
  $$(".mission-flow span").forEach((node, i) => { node.textContent = flow[i] || ""; });
  text("#start-lesson span", complete
    ? (isZh ? `复习 ${grade} 任务` : `ทบทวนภารกิจ ${grade}`)
    : isRecognition
      ? (isZh ? "开始安全识别" : "เริ่มฝึกรู้ทันอย่างปลอดภัย")
      : (isZh ? `开始 ${grade} 首课` : `เริ่มบทแรก ${grade}`));
  $("#start-lesson").setAttribute("aria-label", $("#start-lesson span").textContent);
}

function variantAnswer(intentId, grade, fallback = null) {
  return registerGuide()?.getVariant?.(intentId, grade, speakerProfileForGrade(grade)) || fallback;
}

function lessonAnswerCard(variant, grade, correct = false, note = "") {
  const answer = answerForDirection(variant);
  const label = registerName(Math.max(0, Math.min(4, 5 - Number(String(grade).slice(1))))) || grade;
  return {
    text: answer.target,
    sub: [answer.reading, note || `${grade} · ${label}`].filter(Boolean).join(" · "),
    reading: answer.reading,
    thReading: answer.thReading || null,
    grade,
    correct,
    target: true
  };
}

function rotateLessonAnswers(items, index) {
  const correct = items[0];
  const others = items.slice(1);
  const position = Math.max(0, Number(index || 1) - 1) % Math.max(1, items.length);
  const result = [...others];
  result.splice(position, 0, correct);
  return result;
}

function curriculumLessons() {
  const grade = gradeForMode();
  const level = registerLevel();
  const route = registerRoute();
  if (!route?.steps?.length) return config().lessons;
  const isZh = currentDirection === "zh-th";
  const isRecognition = level?.followMode === "recognition-only";
  const isBoundary = level?.followMode === "guided-boundary-output";
  const comparisonGrades = {
    S5: ["S4", "S3"],
    S4: ["S5", "S3"],
    S3: ["S4", "S2"]
  };
  return route.steps.map(step => {
    const source = answerForDirection(step.answer);
    const safe = answerForDirection(step.safeAnswer || variantAnswer(step.intentId, "S4"));
    let answers;
    if (isRecognition) {
      const safeVariant = step.safeAnswer || variantAnswer(step.intentId, "S4");
      const roughGrade = "S2";
      const roughVariant = variantAnswer(step.intentId, roughGrade, step.answer);
      const extraGrade = "S3";
      const extraVariant = variantAnswer(step.intentId, extraGrade);
      answers = rotateLessonAnswers([
        lessonAnswerCard(safeVariant, "S4", true, isZh ? "保留边界，降低冲突" : "คงขอบเขตและลดความขัดแย้ง"),
        lessonAnswerCard(roughVariant, roughGrade, false, isZh ? "仍然冲硬" : "ยังห้วนและเสี่ยง"),
        lessonAnswerCard(extraVariant || step.answer, extraGrade, false, isZh ? "不符合当前化解目标" : "ไม่ตรงเป้าหมายการลดความขัดแย้ง")
      ], step.index);
    } else if (isBoundary) {
      answers = rotateLessonAnswers([
        lessonAnswerCard(step.answer, "S2", true, isZh ? "冲硬边界句 · 仅限引导演练" : "ประโยคขอบเขตแบบห้วน · ฝึกแบบมีคำแนะนำเท่านั้น"),
        lessonAnswerCard(step.safeAnswer || variantAnswer(step.intentId, "S4"), "S4", false, isZh ? "安全改写 · 稍后必须对比" : "ฉบับปลอดภัย · ต้องเปรียบเทียบต่อ"),
        lessonAnswerCard(variantAnswer(step.intentId, "S3"), "S3", false, isZh ? "熟人口吻，但不是本题的冲硬边界" : "กันเอง แต่ไม่ใช่ขอบเขตแบบห้วนของข้อนี้")
      ], step.index);
    } else {
      const alternatives = comparisonGrades[grade] || ["S4", "S3"];
      answers = rotateLessonAnswers([
        lessonAnswerCard(step.answer, grade, true),
        lessonAnswerCard(variantAnswer(step.intentId, alternatives[0]), alternatives[0], false),
        lessonAnswerCard(variantAnswer(step.intentId, alternatives[1]), alternatives[1], false)
      ], step.index);
    }
    const scenario = interfaceValue(step.npc, "zh", "th") || "";
    const question = isRecognition
      ? (isZh ? "听懂这句攻击后，哪句 S4 回应更安全？" : "เมื่อฟังคำโจมตีนี้ออก ประโยค S4 ใดปลอดภัยกว่า?")
      : isBoundary
        ? (isZh ? "哪句是有边界、但明显冲硬的 S2？" : "ประโยคใดเป็น S2 ที่ตั้งขอบเขตชัดแต่ฟังห้วน?")
        : (isZh ? `哪句符合 ${grade}「${registerName()}」？` : `ประโยคใดตรงกับ ${grade} “${registerName()}”?`);
    const feedback = interfaceValue(step, "feedbackZh", "feedbackTh") || interfaceValue(level, "boundaryZh", "boundaryTh") || "";
    return {
      activity: step.activity,
      label: isZh ? `场景 ${step.index} / ${route.steps.length}` : `สถานการณ์ ${step.index} / ${route.steps.length}`,
      question,
      hint: scenario,
      npc: isRecognition ? source.target : scenario,
      npcRoman: isRecognition ? source.reading : "",
      npcLang: isRecognition ? config().targetHtmlLang : config().interfaceLang,
      audioTarget: source.target,
      audioTrack: isRecognition ? "character" : "standard",
      audioLabel: isRecognition
        ? (isZh ? "角色演绎 · 勿作标准发音" : "เสียงตัวละคร · ไม่ใช่เสียงมาตรฐาน")
        : isBoundary
          ? (isZh ? "听 S2 边界句" : "ฟังประโยคขอบเขต S2")
          : (isZh ? "听学习示范音" : "ฟังเสียงตัวอย่างเพื่อเรียน"),
      answers,
      feedback: `${feedback}${safe.target ? `${isZh ? " 安全降级：" : " ลดระดับอย่างปลอดภัย: "}${safe.target}` : ""}`,
      comparePair: isBoundary && safe.target ? { source, safe } : null
    };
  });
}

function renderVibePreview(index = currentMode) {
  index = Math.max(0, Math.min(4, Number(index) || 0));
  previewMode = index;
  const data = config();
  const mode = data.modes[index];
  const level = registerLevel(index);
  const example = comparisonExample(index);
  const comparison = registerComparison();
  const reading = currentDirection === "zh-th"
    ? window.HUILAISHI_THAI_PHONETIC?.make(example.target, example.reading)
    : null;
  const color = sharedColors[index];
  [$("#vibe-card"), $("#vibe-console")].forEach(node => {
    node?.style.setProperty("--accent", color.color);
    node?.style.setProperty("--accent-soft", color.soft);
    node?.style.setProperty("--accent-ink", color.ink);
    node?.style.setProperty("--safe-width", `${color.safe}%`);
    node?.style.setProperty("--risk", color.safeColor);
  });
  text("#vibe-badge", mode.code);
  text("#vibe-name", registerName(index));
  text("#vibe-thai", example.target);
  $("#vibe-thai").lang = data.targetHtmlLang;
  text("#vibe-roman", reading?.romanTone || example.reading);
  const mnemonic = $("#vibe-mnemonic");
  mnemonic.classList.toggle("hidden", !reading?.zhHint);
  $(".thai-phonetic-label", mnemonic).textContent = reading?.labelZh || "中文近音 · 仅助记";
  $(".thai-phonetic-value", mnemonic).textContent = reading?.zhHint || "";
  mnemonic.title = reading?.disclaimerZh || "";
  text("#vibe-cn", example.meaning);
  text("#intent-label", `${currentDirection === "zh-th" ? "同一场景" : "สถานการณ์เดียวกัน"} · ${comparison.intent}${comparison.setting ? ` · ${comparison.setting}` : ""}`);
  text("#reaction-copy", interfaceValue(level, "boundaryZh", "boundaryTh") || mode.reaction);
  text("#reaction-face", mode.face);
  $("#vibe-card").classList.toggle("sugarblade", index === 4);
  $("#sugarblade-badge").classList.toggle("hidden", index !== 4);
  text("#sugarblade-badge", currentDirection === "zh-th" ? "角色演绎 · 勿作标准发音" : "เสียงตัวละคร · ไม่ใช่เสียงมาตรฐาน");
  $("#vibe-slider").value = index + 1;
  $("#vibe-slider").setAttribute("aria-valuetext", `${gradeForMode(index)} · ${registerName(index)}`);
  const comparisonContext = [comparison.setting, comparison.relationship, comparison.context].filter(Boolean);
  $("#context-row").innerHTML = comparisonContext.slice(0, 3).map(value => `<span class="${index >= 3 ? "bad" : ""}">${escapeHtml(value)}</span>`).join("");
  $$("#vibe-ticks button").forEach((button, i) => {
    const selected = i === index;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  $("#speak-vibe").dataset.speechTrack = index === 4 ? "character" : "standard";
  $("#speak-vibe-slow").dataset.speechTrack = index === 4 ? "character" : "standard";

  const commit = $("#vibe-preview-commit");
  const changed = index !== currentMode;
  commit?.classList.toggle("hidden", !changed);
  if (changed) {
    const grade = gradeForMode(index);
    text("#vibe-preview-status-label", currentDirection === "zh-th" ? "正在试听，课程尚未切换" : "กำลังฟังตัวอย่าง ยังไม่เปลี่ยนบทเรียน");
    text("#vibe-preview-status", `${grade} · ${registerName(index)}`);
    text("#commit-vibe-label", currentDirection === "zh-th" ? `切换整套课程到 ${grade}` : `เปลี่ยนบทเรียนทั้งหมดเป็น ${grade}`);
  }
}

function applyMode(index, persist = true) {
  index = Math.max(0, Math.min(4, Number(index) || 0));
  currentMode = index;
  previewMode = index;
  const data = config();
  const mode = data.modes[index];
  const color = sharedColors[index];
  document.documentElement.style.setProperty("--accent", color.color);
  document.documentElement.style.setProperty("--accent-soft", color.soft);
  document.documentElement.style.setProperty("--accent-ink", color.ink);
  document.documentElement.style.setProperty("--safe-width", `${color.safe}%`);
  document.documentElement.style.setProperty("--risk", color.safeColor);
  renderVibePreview(index);
  text("#selected-mode-label", registerName(index));
  $("#selected-dot").style.background = color.color;
  text("#profile-mode", `${data.ui.modePrefix}${mode.code} · ${registerName(index)}`);
  text("#settings-mode", `${mode.code} · ${registerName(index)}`);
  text("#main-menu-mode-value", `${mode.code} · ${registerName(index)}`);
  text("#lesson-mode-chip", `${mode.code} · ${registerName(index)}`);
  renderRegisterHome();
  renderBattle();
  resetFilters();
  renderPhrases("all");
  if (offlineConfig()?.scenarios?.[liveScenarioIndex]) renderQuickReplies();
  if (persist) safeStorage.setItem(`thai-vibe-mode-${currentDirection}`, String(index));
  window.ArcadeUI?.onModeChange?.(gradeForMode(index));
}

function renderModeList() {
  $("#mode-list").innerHTML = config().modes.map((mode, index) => `
    <button class="mode-option ${index === pendingMode ? "selected" : ""}" data-mode="${index}" data-speak-text="${escapeHtml(comparisonExample(index).target)}" data-speak-lang="${config().targetLang}" ${index === 4 ? 'data-speech-policy="native" data-speech-track="character"' : 'data-speech-track="standard"'} aria-pressed="${index === pendingMode}" style="--mode-color:${sharedColors[index].color}">
      <span class="option-code">${mode.code}</span>
      <span class="option-copy"><strong>${escapeHtml(registerName(index))}</strong><small>${escapeHtml(registerAudience(index))}</small></span>
      <span class="risk-chip">${mode.risk}</span>
    </button>`).join("");

  const setupList = $("#setup-mode-list");
  if (setupList) {
    setupList.innerHTML = config().modes.map((mode, index) => `
      <button class="setup-mode-option ${index === pendingMode ? "selected" : ""}" data-setup-mode="${index}" data-speak-text="${escapeHtml(comparisonExample(index).target)}" data-speak-lang="${config().targetLang}" ${index === 4 ? 'data-speech-policy="native" data-speech-track="character"' : 'data-speech-track="standard"'} aria-pressed="${index === pendingMode}" style="--mode-color:${sharedColors[index].color}">
        <span class="setup-option-code">${mode.code}</span>
        <span class="setup-option-copy"><strong>${escapeHtml(registerName(index))}</strong><small>${escapeHtml(registerAudience(index))}</small></span>
        <span class="setup-option-risk">${index === 4 ? (currentDirection === "zh-th" ? "仅识别" : "ฟังเท่านั้น") : escapeHtml(mode.risk)}</span>
        <span class="setup-option-check"><svg><use href="#i-check"></use></svg></span>
      </button>`).join("");
  }
  renderOnboardingModePreview(pendingMode);
}

function updateRiskAcceptLabel(source) {
  const zh = currentDirection === "zh-th";
  text("#accept-risk", source === "setup"
    ? (zh ? "我明白风险，查看 S1 识别示例" : "เข้าใจแล้ว ดูตัวอย่าง S1 เพื่อรู้ทัน")
    : source === "slider"
      ? (zh ? "我明白风险，只试听 S1" : "เข้าใจแล้ว ฟังตัวอย่าง S1 เท่านั้น")
    : (zh ? "我明白风险，切换到 S1" : "เข้าใจแล้ว เปลี่ยนเป็น S1"));
}

function previewPendingMode(index) {
  const color = sharedColors[index];
  document.documentElement.style.setProperty("--accent", color.color);
  document.documentElement.style.setProperty("--accent-soft", color.soft);
  document.documentElement.style.setProperty("--accent-ink", color.ink);
}

function selectPendingMode(index, source = "sheet") {
  if (index === 4 && !riskAccepted) {
    previousMode = pendingMode;
    riskSelectionSource = source;
    updateRiskAcceptLabel(source);
    closeSheets();
    openSheet("warning-sheet");
    playAlaiVoice("risk");
    return;
  }
  pendingMode = index;
  if (source === "setup") {
    previewPendingMode(index);
    onboardingPreviewAcknowledged = true;
  }
  renderModeList();
  if (source === "setup") updateOnboardingPreviewAction();
  requestAnimationFrame(() => {
    const selector = source === "setup" ? `[data-setup-mode="${index}"]` : `[data-mode="${index}"]`;
    if (source === "setup") {
      revealOnboardingPreview();
    } else {
      $(selector)?.focus?.();
    }
  });
}

function renderPartner() {
  const data = config().partner;
  const done = safeStorage.getItem(`partner-relay-${currentDirection}`) === "done";
  text("#partner-avatar-char", data.char);
  text("#partner-name", data.name);
  text("#partner-location", data.location);
  text("#partner-role", data.role);
  text("#partner-asks", data.asks);
  text("#partner-line", data.line);
  text("#partner-line-note", data.lineNote);
  text("#partner-cta-label", done ? data.doneCta : data.cta);
  text("#partner-unlock", done ? data.doneUnlock : data.unlock);
  $("#open-partner").dataset.speakText = data.audioText;
  $("#open-partner").dataset.speakLang = data.audioLang;
  text("#relay-source-node", currentDirection === "zh-th" ? "中" : "ท");
  text("#relay-target-node", data.targetNode);
  $("#open-partner").classList.toggle("relay-done", done);
  $("#relay-fill").style.width = done ? "100%" : "42%";
}

function openPartnerRelay() {
  const data = config().partner;
  clearTimeout(partnerReplyTimer);
  text("#sheet-partner-char", data.char);
  text("#partner-sheet-kicker", data.sheetKicker);
  text("#partner-sheet-title", data.sheetTitle);
  text("#chat-time", data.time);
  text("#chat-partner-char", data.char);
  text("#partner-original-line", data.original);
  text("#partner-original-note", data.originalNote);
  text("#typing-label", data.typing);
  text("#chat-user-char", data.userChar);
  text("#reply-partner-char", data.char);
  $("#user-chat").classList.add("hidden");
  $("#partner-reply").classList.add("hidden");
  $("#typing-row").classList.remove("hidden");
  $("#relay-reward").classList.add("hidden");
  $("#finish-relay").classList.add("hidden");
  $("#relay-choices").classList.remove("hidden");
  $("#relay-choices").innerHTML = data.choices.map((choice, i) => `<button class="relay-choice" data-relay="${i}"><span>${String.fromCharCode(65 + i)}</span><div><b>${choice.text}</b><small>${choice.sub}</small></div></button>`).join("");
  openSheet("partner-sheet");
}

function chooseRelay(index) {
  const data = config().partner;
  const choice = data.choices[index];
  const button = $(`[data-relay="${index}"]`);
  if (!button || button.classList.contains("correct")) return;
  if (!choice.correct) {
    button.classList.add("wrong");
    text("#typing-label", currentDirection === "zh-th" ? "差一点，再找一句更自然的" : "เกือบแล้ว ลองเลือกประโยคที่ธรรมชาติกว่า");
    pulseHaptic();
    return;
  }
  button.classList.add("correct");
  text("#user-chat-line", choice.text);
  $("#user-chat").classList.remove("hidden");
  $("#relay-choices").classList.add("hidden");
  text("#typing-label", currentDirection === "zh-th" ? `${data.name} 正在回复` : `${data.name} กำลังตอบกลับ`);
  partnerReplyTimer = setTimeout(() => {
    $("#typing-row").classList.add("hidden");
    text("#partner-reply-line", data.reply);
    text("#partner-reply-note", data.replyNote);
    $("#partner-reply").classList.remove("hidden");
    text("#relay-reward-title", data.rewardTitle);
    text("#relay-reward-copy", data.rewardCopy);
    $("#relay-reward").classList.remove("hidden");
    text("#finish-relay", data.finish);
    $("#finish-relay").classList.remove("hidden");
    pulseHaptic();
  }, 650);
}

function finishRelay() {
  safeStorage.setItem(`partner-relay-${currentDirection}`, "done");
  closeSheets();
  renderPartner();
  showToast(config().partner.rewardTitle);
}

function renderBattle() {
  const data = config();
  const guide = registerGuide();
  const grade = gradeForMode();
  const level = registerLevel();
  const pool = guide?.getPracticePool?.(grade, "", speakerProfileForGrade(grade)) || [];
  const sample = pool[(Number(safeStorage.getItem(`register-battle-index-${currentDirection}-${grade}`)) || 0) % Math.max(1, pool.length)] || null;
  if (!sample) {
    currentBattleQuiz = { options: data.battle.options, correct: data.battle.correct, wrong: data.battle.wrong, source: null };
    text("#boss-avatar", data.battle.avatar);
    text("#battle-person", data.battle.person);
    text("#battle-question", data.battle.question);
  } else {
    const isZh = currentDirection === "zh-th";
    const isRecognition = level?.gamePolicy?.allowSpeak === false;
    const requiresRewrite = Boolean(level?.gamePolicy?.requireSafeRewrite);
    const context = interfaceValue(sample, "contextZh", "contextTh") || interfaceValue(sample, "intentZh", "intentTh");
    const intentId = sample.id;
    const correctGrade = isRecognition || requiresRewrite ? "S4" : grade;
    const correctVariant = variantAnswer(intentId, correctGrade, sample.variant);
    const distractorGrades = isRecognition ? ["S2", "S3"] : requiresRewrite ? ["S2", "S3"] : ({ S5: ["S4", "S3"], S4: ["S5", "S3"], S3: ["S4", "S2"] }[grade] || ["S4", "S3"]);
    const options = rotateLessonAnswers([
      lessonAnswerCard(correctVariant, correctGrade, true),
      lessonAnswerCard(variantAnswer(intentId, distractorGrades[0]), distractorGrades[0], false),
      lessonAnswerCard(variantAnswer(intentId, distractorGrades[1]), distractorGrades[1], false)
    ], (pool.indexOf(sample) % 3) + 1);
    currentBattleQuiz = {
      options,
      source: isRecognition ? answerForDirection(sample.variant) : null,
      correct: isRecognition
        ? (isZh ? "判断正确：先识别攻击，再选择 S4 安全回应；不要跟读粗口。" : "ถูกต้อง: รู้ทันคำโจมตีก่อน แล้วเลือก S4 เพื่อลดความขัดแย้ง ห้ามพูดตามคำหยาบ")
        : requiresRewrite
          ? (isZh ? "改写正确：保留边界，同时用 S4 降低冲硬。" : "ปรับถูกแล้ว: ยังคงขอบเขตไว้และใช้ S4 ลดความห้วน")
          : (isZh ? `判断正确：这句符合 ${grade}「${registerName()}」。` : `ถูกต้อง: ประโยคนี้ตรงกับ ${grade} “${registerName()}”`),
      wrong: interfaceValue(level, "boundaryZh", "boundaryTh") || data.battle.wrong
    };
    text("#boss-avatar", grade.slice(1));
    text("#battle-person", context);
    text("#battle-question", isRecognition
      ? (isZh ? "听到攻击性说法后，哪句 S4 回应最安全？" : "เมื่อได้ยินคำโจมตี ประโยค S4 ใดปลอดภัยที่สุด?")
      : requiresRewrite
        ? (isZh ? "哪句 S4 改写能保留边界、降低冲硬？" : "ประโยค S4 ใดรักษาขอบเขตแต่ลดความห้วน?")
        : (isZh ? `哪句符合 ${grade}「${registerName()}」？` : `ประโยคใดตรงกับ ${grade} “${registerName()}”?`));
  }
  const source = currentBattleQuiz.source;
  $("#battle-source").classList.toggle("hidden", !source?.target);
  if (source?.target) {
    text("#battle-source-label", currentDirection === "zh-th" ? "角色演绎 · 勿作标准发音" : "เสียงตัวละคร · ไม่ใช่เสียงมาตรฐาน");
    text("#battle-source-line", source.target);
    $("#battle-source-line").lang = data.targetHtmlLang;
    $("#battle-source-audio").setAttribute("aria-label", currentDirection === "zh-th" ? "播放角色演绎，勿作标准发音" : "ฟังเสียงตัวละคร ไม่ใช่เสียงมาตรฐาน");
  }
  $("#battle-options").innerHTML = currentBattleQuiz.options.map((option, i) => {
    const target = typeof option.target === "string" ? option.target : option.text;
    const sub = option.meaning || option.sub || "";
    const line = { target, roman: option.roman || option.reading || "", thReading: option.thReading || null };
    return `<button data-battle="${i}" data-correct="${option.correct}" ${option.grade === "S1" ? 'data-speech-policy="none"' : ""}><span>${String.fromCharCode(65 + i)}</span><b lang="${data.targetHtmlLang}">${escapeHtml(target)}</b><small>${escapeHtml(sub)}</small>${phoneticMarkup(line)}</button>`;
  }).join("");
  $("#battle-feedback").classList.add("hidden");
  $("#battle-feedback").textContent = "";
}

function chooseBattle(index) {
  if ($("#battle-options .correct")) return;
  const option = currentBattleQuiz?.options?.[index];
  if (!option) return;
  const button = $(`[data-battle="${index}"]`);
  button.classList.add(option.correct ? "correct" : "wrong");
  if (!option.correct) {
    const correctIndex = currentBattleQuiz.options.findIndex(item => item.correct);
    $(`[data-battle="${correctIndex}"]`).classList.add("correct");
  }
  text("#battle-feedback", option.correct ? currentBattleQuiz.correct : currentBattleQuiz.wrong);
  $("#battle-feedback").classList.remove("hidden");
  if (option.correct) {
    const grade = gradeForMode();
    const key = `register-battle-index-${currentDirection}-${grade}`;
    safeStorage.setItem(key, String(Number(safeStorage.getItem(key) || 0) + 1));
  }
  pulseHaptic();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;")
    .replace(/'/gu, "&#039;");
}

function chinesePhonetic(line) {
  if (currentDirection !== "zh-th" || !line || !/[\u0e00-\u0e7f]/u.test(String(line.target || ""))) return null;
  return line.thReading || window.HUILAISHI_THAI_PHONETIC?.make(line.target, line.roman);
}

function phoneticMarkup(line) {
  const reading = chinesePhonetic(line);
  if (!reading?.zhHint || /近音待核|母语待审|算法近似/u.test(reading.zhHint)) return "";
  return `<span class="thai-phonetic-hint"><span class="thai-phonetic-label">${escapeHtml(reading.labelZh || "中文近音 · 仅助记")}</span><b class="thai-phonetic-value">${escapeHtml(reading.zhHint)}</b></span>`;
}

function mergeOfflinePhrases(data) {
  const local = window.OFFLINE_APP_CONTENT?.[data.key];
  if (!local || data._offlineMerged) return;
  const known = new Set(data.phrases.map(item => item.target));
  local.scenarios.forEach(scene => {
    scene.options.forEach(option => {
      if (known.has(option.target)) return;
      known.add(option.target);
      data.phrases.push({
        level: option.level,
        category: option.risk ? "risk" : scene.category,
        label: scene.title,
        target: option.target,
        roman: option.roman,
        meaning: option.meaning,
        thReading: option.thReading || null,
        speakerForms: option.speakerForms || null
      });
    });
  });
  data._offlineMerged = true;
}

function renderLive() {
  const local = offlineConfig();
  if (!local) return;
  const ui = local.ui;
  const savedIndex = Number(safeStorage.getItem(`offline-scene-${currentDirection}`));
  liveScenarioIndex = Number.isInteger(savedIndex) && savedIndex >= 0 && savedIndex < local.scenarios.length ? savedIndex : 0;
  const branchCount = local.scenarios.reduce((sum, scene) => sum + scene.options.length, 0);

  text("#live-offline-badge", ui.badge);
  text("#live-eyebrow", ui.eyebrow);
  html("#live-title", ui.title);
  text("#live-subtitle", ui.subtitle);
  text("#live-proof-scenes", ui.proofScenes);
  text("#live-proof-branches", ui.proofBranches);
  text("#live-proof-network", ui.proofNetwork);
  $(".live-proof span:nth-child(1) b").textContent = String(local.scenarios.length);
  $(".live-proof span:nth-child(2) b").textContent = String(branchCount);
  text("#scene-eyebrow", ui.sceneEyebrow);
  text("#scene-heading", ui.sceneHeading);
  text("#live-reset-label", ui.reset);
  text("#engine-note", ui.engineNote);
  text("#conversation-typing-label", ui.typing);
  text("#live-input-label", ui.inputLabel);
  $("#live-input").placeholder = ui.inputPlaceholder;
  $("#scenario-strip").setAttribute("aria-label", currentDirection === "zh-th" ? "离线对话场景" : "สถานการณ์สนทนาออฟไลน์");
  $("#conversation-listen").setAttribute("aria-label", currentDirection === "zh-th" ? "播放当前对话" : "ฟังประโยคปัจจุบัน");
  $("#live-send").setAttribute("aria-label", currentDirection === "zh-th" ? "发送" : "ส่ง");
  text("#record-label", ui.record);
  text("#record-note", ui.recordNote);
  text("#offline-truth", ui.truth);
  $("#offline-truth").insertAdjacentHTML("afterbegin", '<svg><use href="#i-shield"></use></svg>');
  renderScenarioStrip();
  startLiveScenario(liveScenarioIndex, false);
  updateNetworkStatus();
}

function renderScenarioStrip() {
  const local = offlineConfig();
  $("#scenario-strip").innerHTML = local.scenarios.map((scene, index) => `
    <button class="scenario-chip ${index === liveScenarioIndex ? "active" : ""}" data-scene="${index}" aria-pressed="${index === liveScenarioIndex}">
      <span>${escapeHtml(scene.icon)}</span><b>${escapeHtml(scene.title)}</b>
    </button>`).join("");
}

function startLiveScenario(index, announce = true) {
  const local = offlineConfig();
  const scene = local.scenarios[index];
  if (!scene) return;
  clearTimeout(liveReplyTimer);
  liveScenarioIndex = index;
  liveCompareExpanded = false;
  safeStorage.setItem(`offline-scene-${currentDirection}`, String(index));
  $$("#scenario-strip .scenario-chip").forEach((button, i) => {
    button.classList.toggle("active", i === index);
    button.setAttribute("aria-pressed", String(i === index));
  });
  text("#conversation-avatar", scene.avatar);
  text("#conversation-place", scene.place);
  text("#conversation-title", scene.title);
  text("#role-language-note", currentDirection === "zh-th"
    ? "人称引导｜个人页选择会改你要练的 S5/S4 学习者句式：男性常用 ผม / ครับ，女性常用 ดิฉัน / ฉัน 与 ค่ะ / คะ。NPC 角色仍按场景身份说话；两套句式均待母语教师终审。"
    : "คำแนะนำตัวตน｜ภาษาจีนไม่มีคำลงท้ายแบ่งเพศแบบ ครับ / ค่ะ เสียงผู้หญิงในแอปเป็นเพียงเสียงสาธิต ไม่ได้เปลี่ยนความหมาย ตัวตน หรือเพศของผู้พูด");
  $("#conversation-log").innerHTML = "";
  $("#coach-feedback").classList.add("hidden");
  $("#conversation-typing").classList.add("hidden");
  $("#live-input").value = "";
  appendLiveMessage("npc", scene.opening, { level: scene.goal });
  lastNpcLine = scene.opening;
  renderQuickReplies();
  if (announce) {
    showToast(currentDirection === "zh-th" ? `已切到「${scene.title}」` : `เปลี่ยนเป็น “${scene.title}” แล้ว`);
    pulseHaptic();
  }
}

function appendLiveMessage(role, line, meta = {}) {
  const data = config();
  const log = $("#conversation-log");
  const reading = chinesePhonetic(line);
  const secondary = [reading?.romanTone || line.roman, line.meaning].filter(Boolean).map(escapeHtml).join(" · ");
  const level = meta.level ? `<span class="level-tag">${escapeHtml(meta.level)}</span>` : "";
  log.insertAdjacentHTML("beforeend", `
    <div class="live-message ${role === "user" ? "user" : "npc"}">
      <div class="bubble"><p lang="${data.targetHtmlLang}">${escapeHtml(line.target)}</p>${secondary ? `<small>${secondary}</small>` : ""}${phoneticMarkup(line)}${level}</div>
    </div>`);
  log.scrollTop = log.scrollHeight;
}

function renderQuickReplies() {
  const local = offlineConfig();
  const scene = local.scenarios[liveScenarioIndex];
  const desiredLevel = 5 - currentMode;
  const safeOption = scene.options.find(option => option.level === 4 && !option.risk);
  const currentOption = scene.options.find(option => option.level === desiredLevel);
  const preferred = [currentOption, safeOption].filter((option, index, list) => option && list.indexOf(option) === index);
  const options = liveCompareExpanded ? scene.options : preferred;
  const rows = options.map(sourceOption => {
    const index = scene.options.indexOf(sourceOption);
    const option = offlineOptionForSpeaker(sourceOption);
    const contextStatus = currentDirection === "zh-th" ? option.contextLabelZh : option.contextLabelTh;
    const status = contextStatus || (option.risk
      ? (option.level === 1
        ? (currentDirection === "zh-th" ? "仅听懂" : "ฟังเท่านั้น")
        : (currentDirection === "zh-th" ? "边界演练" : "ฝึกตั้งขอบเขต"))
      : option.level === desiredLevel
        ? (currentDirection === "zh-th" ? "当前档" : "โทนนี้")
        : option.level === 4
          ? (currentOption?.goalPriority === "life-safety"
            ? (currentDirection === "zh-th" ? "S4 完整说明" : "S4 แบบข้อมูลครบ")
            : (currentDirection === "zh-th" ? "S4 安全版" : "S4 ปลอดภัย"))
          : (currentDirection === "zh-th" ? `S${option.level} 对比` : `เทียบ S${option.level}`));
    const reading = chinesePhonetic(option);
    if (option.level === 1) return `<div class="quick-reply recognition-source" data-risk="true">
      <span>S${option.level}</span>
      <div><b lang="${config().targetHtmlLang}">${escapeHtml(option.target)}</b><small>${escapeHtml(reading?.romanTone || option.roman)} · ${escapeHtml(option.meaning)}</small>${phoneticMarkup(option)}</div>
      <button class="reply-preview-audio" data-live-preview="${index}" data-speech-policy="native" data-speech-track="character" aria-label="${currentDirection === "zh-th" ? "角色演绎，勿作标准发音" : "เสียงตัวละคร ไม่ใช่เสียงมาตรฐาน"}"><svg><use href="#i-volume"></use></svg><span>${status}</span></button>
    </div>`;
    return `<button class="quick-reply" data-live-option="${index}" data-risk="${Boolean(option.risk)}">
      <span>S${option.level}</span>
      <div><b lang="${config().targetHtmlLang}">${escapeHtml(option.target)}</b><small>${escapeHtml(reading?.romanTone || option.roman)} · ${escapeHtml(option.meaning)}</small>${phoneticMarkup(option)}</div>
      <span class="reply-level">${status}</span>
    </button>`;
  });
  if (!liveCompareExpanded && scene.options.length > preferred.length) rows.push(`<button class="quick-reply compare-registers" data-live-action="compare" data-speech-track="navigation"><span>＋</span><div><b>${currentDirection === "zh-th" ? "对比其他语气" : "เปรียบเทียบระดับอื่น"}</b><small>${currentDirection === "zh-th" ? "展开同一意图的其余档位" : "ดูระดับอื่นของความหมายเดียวกัน"}</small></div><span class="reply-level">${scene.options.length - preferred.length}</span></button>`);
  $("#quick-replies").innerHTML = rows.join("");
}

function renderLiveActions() {
  const ui = offlineConfig().ui;
  $("#quick-replies").innerHTML = `
    <button class="quick-reply" data-live-action="retry"><span>↺</span><div><b>${escapeHtml(ui.tryAgain)}</b><small>${currentDirection === "zh-th" ? "比较同一现场的不同语气" : "เทียบหลายโทนในสถานการณ์เดิม"}</small></div><span class="reply-level">1/2</span></button>
    <button class="quick-reply" data-live-action="next"><span>→</span><div><b>${escapeHtml(ui.nextScene)}</b><small>${currentDirection === "zh-th" ? "继续下一段离线实战" : "ไปฝึกสถานการณ์ออฟไลน์ถัดไป"}</small></div><span class="reply-level">2/2</span></button>`;
}

function showCoachFeedback(option) {
  const ui = offlineConfig().ui;
  const feedback = $("#coach-feedback");
  feedback.classList.toggle("is-risk", Boolean(option.risk));
  const contextLabel = currentDirection === "zh-th" ? option.contextLabelZh : option.contextLabelTh;
  let copy = `${contextLabel || (option.risk ? ui.riskPrefix : ui.safePrefix)} · S${option.level} — ${option.tip}`;
  if (currentMode === 3 && option.level === 2 && option.risk) {
    const safe = offlineOptionForSpeaker(offlineConfig().scenarios[liveScenarioIndex].options.find(item => item.level === 4 && !item.risk));
    if (safe) copy += `${currentDirection === "zh-th" ? " · S4 安全改写：" : " · ปรับเป็น S4: "}${safe.target}`;
  }
  feedback.textContent = copy;
  feedback.classList.remove("hidden");
}

function sendLiveOption(option, typedValue = "", coachOverride = "") {
  const scene = offlineConfig().scenarios[liveScenarioIndex];
  const userLine = typedValue
    ? { target: typedValue, roman: `${currentDirection === "zh-th" ? "本地匹配" : "จับคู่ในเครื่อง"} → ${option.target}`, meaning: option.meaning }
    : option;
  clearTimeout(liveReplyTimer);
  appendLiveMessage("user", userLine, { level: `S${option.level}` });
  if (coachOverride) {
    const feedback = $("#coach-feedback");
    feedback.classList.add("is-risk");
    feedback.textContent = coachOverride;
    feedback.classList.remove("hidden");
  } else {
    showCoachFeedback(option);
  }
  $("#quick-replies").innerHTML = "";
  $("#conversation-typing").classList.remove("hidden");
  liveReplyTimer = setTimeout(() => {
    $("#conversation-typing").classList.add("hidden");
    appendLiveMessage("npc", option.next, { level: scene.safety || scene.goal });
    lastNpcLine = option.next;
    renderLiveActions();
    const key = `offline-turns-${currentDirection}`;
    safeStorage.setItem(key, String(Number(safeStorage.getItem(key) || 0) + 1));
    pulseHaptic();
  }, 520);
}

function normalizeForMatch(value) {
  return String(value || "")
    .normalize("NFD")
    // Strip Latin pronunciation accents, but keep Thai vowels/tone marks.
    // Removing every Unicode mark turns กู into ก and creates dangerous false matches.
    .replace(/[\u0300-\u036f]/gu, "")
    .toLowerCase()
    .replace(/[\s\p{P}\p{S}]+/gu, "");
}

function liveS1AttackMarkers(scene, direction) {
  const safeCorpus = (scene?.options || [])
    .filter(option => option.level !== 1)
    .flatMap(option => [option.target, option.meaning, ...(option.keywords || [])])
    .map(normalizeForMatch)
    .filter(Boolean);
  const s1Options = (scene?.options || [])
    .filter(option => option.level === 1)
  const s1Keywords = s1Options.flatMap(option => option.keywords || []);
  return [...new Set(s1Keywords
    .map(normalizeForMatch)
    .filter(Boolean))]
    .filter(marker => !safeCorpus.some(text => text.includes(marker)));
}

function hasS1AttackMarker(value, direction, scene) {
  const input = normalizeForMatch(value);
  return liveS1AttackMarkers(scene, direction).some(marker =>
    input.includes(marker) || (input.length >= 2 && marker.includes(input))
  );
}

function liveKeywordMatch(keyword, input) {
  if (keyword === input) return 3;
  if (input.includes(keyword)) return 2;
  if (input.length >= 4 && keyword.includes(input)) return 1;
  return 0;
}

function matchLiveOptionForScene(scene, value, direction, modeIndex) {
  const input = normalizeForMatch(value);
  if (!scene || !input) return null;
  const desiredLevel = 5 - modeIndex;
  // S1 is recognition-only. Ambiguous non-attack input therefore falls back
  // to the S4 safe line instead of inventing an insult the learner did not say.
  const preferredLevel = desiredLevel === 1 ? 4 : desiredLevel;
  const exactTarget = scene.options.find(option => normalizeForMatch(option.target) === input);
  if (exactTarget) return exactTarget;

  const s1Option = scene.options.find(option => option.level === 1);
  if (s1Option && hasS1AttackMarker(input, direction, scene)) return s1Option;

  const currentOption = scene.options.find(option => option.level === desiredLevel);
  if (currentOption?.goalPriority === "life-safety") {
    const currentKeywords = [...new Set((currentOption.keywords || []).map(normalizeForMatch).filter(Boolean))];
    if (currentKeywords.some(keyword => liveKeywordMatch(keyword, input) > 0)) return currentOption;
  }

  const candidates = [];
  scene.options.forEach((option, order) => {
    if (option.level === 1) return;
    const keywords = [...new Set((option.keywords || []).map(normalizeForMatch).filter(Boolean))];
    const matches = keywords
      .map(keyword => ({ keyword, type: liveKeywordMatch(keyword, input) }))
      .filter(match => match.type > 0)
      .sort((left, right) => right.type - left.type || right.keyword.length - left.keyword.length);
    if (!matches.length) return;
    candidates.push({
      option,
      order,
      rank: [
        matches[0].type,
        matches[0].keyword.length,
        option.level === preferredLevel ? 1 : 0,
      ]
    });
  });
  candidates.sort((left, right) => {
    for (let index = 0; index < left.rank.length; index += 1) {
      if (left.rank[index] !== right.rank[index]) return right.rank[index] - left.rank[index];
    }
    return left.order - right.order;
  });
  return candidates[0]?.option || null;
}

function matchLiveOption(value) {
  const scene = offlineConfig().scenarios[liveScenarioIndex];
  return offlineOptionForSpeaker(matchLiveOptionForScene(scene, value, currentDirection, currentMode));
}

window.HUILAISHI_LIVE_MATCHER = Object.freeze({
  match: matchLiveOptionForScene,
  normalize: normalizeForMatch,
  attackMarkers: liveS1AttackMarkers
});

function sendLiveFallback(value) {
  const local = offlineConfig();
  const scene = local.scenarios[liveScenarioIndex];
  appendLiveMessage("user", { target: value });
  const feedback = $("#coach-feedback");
  feedback.classList.remove("is-risk", "hidden");
  feedback.textContent = local.ui.noMatch;
  $("#quick-replies").innerHTML = "";
  $("#conversation-typing").classList.remove("hidden");
  clearTimeout(liveReplyTimer);
  liveReplyTimer = setTimeout(() => {
    $("#conversation-typing").classList.add("hidden");
    appendLiveMessage("npc", scene.fallback, { level: scene.goal });
    lastNpcLine = scene.fallback;
    renderLiveActions();
  }, 520);
}

function submitLiveInput(value = $("#live-input").value) {
  const input = String(value || "").trim();
  if (!input) return;
  $("#live-input").value = "";
  let matched = matchLiveOption(input);
  let coachOverride = "";
  if (matched?.level === 1) {
    const safe = offlineOptionForSpeaker(offlineConfig().scenarios[liveScenarioIndex].options.find(option => option.level === 4 && !option.risk));
    coachOverride = currentDirection === "zh-th"
      ? "识别到 S1 高风险表达：不发送原句，已改为 S4 安全回应。"
      : "ตรวจพบ S1 ที่เสี่ยงสูง ระบบจะไม่ส่งประโยคเดิมและเปลี่ยนเป็น S4 ที่ปลอดภัย";
    matched = safe || null;
  }
  if (matched) sendLiveOption(matched, matched.level === 4 && input !== matched.target ? "" : input, coachOverride);
  else sendLiveFallback(input);
}

function handleLiveAction(action) {
  if (action === "compare") {
    liveCompareExpanded = true;
    renderQuickReplies();
    return;
  }
  if (action === "retry") startLiveScenario(liveScenarioIndex, false);
  if (action === "next") startLiveScenario((liveScenarioIndex + 1) % offlineConfig().scenarios.length, true);
}

function updateNetworkStatus() {
  const ui = offlineConfig()?.ui;
  if (!ui) return;
  const online = navigator.onLine;
  text("#network-status", online ? ui.online : ui.offline);
  $("#network-badge").classList.toggle("is-offline", !online);
  $("#global-offline-chip")?.classList.toggle("hidden", online);
  text("#global-offline-text", currentDirection === "zh-th" ? "离线模式 · 可继续学习" : "โหมดออฟไลน์ · เรียนต่อได้");
}

function renderPhrases(filter = "all") {
  const data = config();
  const guide = registerGuide();
  const grade = gradeForMode();
  const level = registerLevel();
  const category = filter;
  const pool = guide?.getPracticePool?.(grade, category === "all" ? "" : category, speakerProfileForGrade(grade)) || [];
  const list = pool.length ? pool : data.phrases.map(sourceItem => {
    const item = offlineOptionForSpeaker(sourceItem);
    return {
      id: item.target,
      cat: item.category,
      grade: `S${item.level}`,
      intentZh: item.label,
      intentTh: item.label,
      contextZh: item.meaning,
      contextTh: item.meaning,
      variant: { zh: currentDirection === "th-zh" ? item.target : item.meaning, py: item.roman, th: currentDirection === "zh-th" ? item.target : item.meaning, ro: item.roman }
    };
  }).filter(item => filter === "all" || item.cat === category);
  text("#library-eyebrow", currentDirection === "zh-th" ? `${grade} · 同档 ${list.length} 句` : `${grade} · ${list.length} ประโยคระดับเดียวกัน`);
  text("#library-subtitle", currentDirection === "zh-th" ? "只显示当前表达档位；切换档位，整组内容一起切换。" : "แสดงเฉพาะระดับปัจจุบัน เปลี่ยนระดับแล้วเนื้อหาทั้งชุดจะเปลี่ยนตาม");
  $("#phrase-list").innerHTML = list.map(item => {
    const answer = answerForDirection(item.variant);
    const color = sharedColors[currentMode].color;
    const reading = chinesePhonetic({ target: answer.target, roman: answer.reading });
    const isRecognition = level?.gamePolicy?.allowSpeak === false;
    const requiresRewrite = Boolean(level?.gamePolicy?.requireSafeRewrite);
    const safe = (isRecognition || requiresRewrite) ? answerForDirection(variantAnswer(item.id, "S4")) : null;
    const intent = interfaceValue(item, "intentZh", "intentTh") || "";
    const context = interfaceValue(item, "contextZh", "contextTh") || answer.meaning;
    const tapAttrs = isRecognition ? "" : `role="button" tabindex="0" data-tap-speak data-speak-text="${escapeHtml(answer.target)}" data-speak-lang="${data.targetLang}" data-speech-track="standard"`;
    return `<article class="phrase-card">
      <div ${tapAttrs}><div class="phrase-top"><span class="phrase-level" style="background:${color}">${grade}</span><span class="phrase-category">${escapeHtml(intent)}</span></div><h3 lang="${data.targetHtmlLang}">${escapeHtml(answer.target)}</h3><p><b>${escapeHtml(reading?.romanTone || answer.reading)}</b><br>${escapeHtml(context)}</p>${phoneticMarkup({ target: answer.target, roman: answer.reading })}${safe?.target ? `<div class="phrase-safe-rewrite"><span>${currentDirection === "zh-th" ? "S4 安全改写" : "ปรับเป็น S4 อย่างปลอดภัย"}</span><b lang="${data.targetHtmlLang}">${escapeHtml(safe.target)}</b></div>` : ""}</div>
      <button class="phrase-audio" data-phrase="${encodeURIComponent(answer.target)}" data-track="${isRecognition ? "character" : "standard"}" data-speech-policy="native" data-speech-track="${isRecognition ? "character" : "standard"}" aria-label="${isRecognition ? (currentDirection === "zh-th" ? "角色演绎，勿作标准发音" : "เสียงตัวละคร ไม่ใช่เสียงมาตรฐาน") : (currentDirection === "zh-th" ? "播放学习示范音" : "ฟังเสียงตัวอย่างเพื่อเรียน")}"><svg><use href="#i-volume"></use></svg></button>
    </article>`;
  }).join("");
}

function resetFilters() {
  $$("#library-filters button").forEach((button, i) => {
    button.classList.toggle("active", i === 0);
    button.setAttribute("aria-pressed", String(i === 0));
  });
}

function startLesson(options = {}) {
  stopPracticeRecording({ discard: true, reason: "lesson" });
  stopLocalRecognition();
  window.PronunciationScorer?.cancelChallenge?.();
  lessonStep = 0;
  selectedAnswer = null;
  checked = false;
  lessonNeedsRetry = false;
  lessonVoiceGate = null;
  text("#heart-count", "3");
  $("#direction-screen").classList.add("hidden");
  $("#onboarding").classList.add("hidden");
  $("#main-app").classList.add("hidden");
  $("#lesson").classList.remove("hidden");
  $("#lesson").setAttribute("aria-label", interfaceValue(registerRoute(), "titleZh", "titleTh") || config().ui.lessonScene);
  renderLessonStep();
  document.dispatchEvent(new CustomEvent("huilaishi:lesson-start", {
    detail: { direction: currentDirection, grade: gradeForMode(), mode: registerName() }
  }));
  rememberAppRoute("lesson", options.history || "push");
  requestAnimationFrame(() => $("#close-lesson")?.focus?.());
}

function renderLessonStep() {
  window.PronunciationScorer?.cancelChallenge?.();
  const data = config();
  const lessons = curriculumLessons();
  const step = lessons[lessonStep];
  const route = registerRoute();
  $("#lesson-progress").style.width = `${((lessonStep + 1) / lessons.length) * 100}%`;
  text("#lesson-scene-label", `${interfaceValue(route, "titleZh", "titleTh") || data.ui.lessonScene} · ${lessonStep + 1}/${lessons.length}`);
  text("#lesson-mode-chip", `${gradeForMode()} · ${registerName()}`);
  text("#lesson-step-label", step.label);
  text("#lesson-question", step.question);
  text("#lesson-hint", step.hint);
  $("#npc-bubble").innerHTML = `<span class="npc-main-line" lang="${escapeHtml(step.npcLang || data.interfaceLang)}">${escapeHtml(step.npc)}</span>${step.npcRoman ? `<small>${escapeHtml(step.npcRoman)}</small>` : ""}${phoneticMarkup({ target: step.npc, roman: step.npcRoman })}`;
  $("#npc-bubble").lang = step.npcLang || data.interfaceLang;
  text("#speak-npc-label", step.audioLabel || data.ui.listen);
  $("#speak-npc").dataset.speechTrack = step.audioTrack || "standard";
  $("#speak-npc").classList.toggle("role-voice", step.audioTrack === "character");
  $("#answer-list").innerHTML = step.answers.map((answer, i) => {
    const speakLang = answer.target ? data.targetLang : data.interfaceLang;
    const speechAttrs = answer.grade === "S1"
      ? 'data-speech-policy="none"'
      : `data-speak-text="${escapeHtml(answer.text)}" data-speak-lang="${escapeHtml(speakLang)}" data-speech-track="standard"`;
    const audioIcon = answer.grade === "S1" ? "i-shield" : "i-volume";
    const optionCode = String.fromCharCode(65 + i);
    const listenLabel = answer.grade === "S1"
      ? (currentDirection === "zh-th" ? "S1 风险句不提供跟读" : "ประโยคเสี่ยง S1 ไม่มีแบบฝึกพูดตาม")
      : (currentDirection === "zh-th" ? `只试听选项 ${optionCode}` : `ฟังเฉพาะตัวเลือก ${optionCode}`);
    const listenAttrs = answer.grade === "S1" ? "disabled" : `${speechAttrs} data-speech-policy="native"`;
    return `<div class="answer-option"><button class="answer-select" type="button" data-answer="${i}" aria-pressed="false" ${speechAttrs}><span>${optionCode}</span><div><b ${answer.target ? `lang="${data.targetHtmlLang}"` : ""}>${escapeHtml(answer.text)}</b><small>${escapeHtml(answer.sub)}</small>${answer.target && answer.reading ? phoneticMarkup({ target: answer.text, roman: answer.reading }) : ""}</div></button><button class="answer-listen" type="button" data-answer-audio="${i}" ${listenAttrs} aria-label="${escapeHtml(listenLabel)}"><svg aria-hidden="true"><use href="#${audioIcon}"></use></svg></button></div>`;
  }).join("");
  $("#lesson-feedback").classList.add("hidden");
  text("#lesson-next", data.ui.check);
  $("#lesson-next").disabled = true;
  selectedAnswer = null;
  checked = false;
  lessonNeedsRetry = false;
  lessonVoiceGate = null;
}

function selectLessonAnswer(index) {
  if (checked) return;
  selectedAnswer = index;
  $$("#answer-list [data-answer]").forEach((button, i) => {
    const selected = i === index;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  $("#lesson-next").disabled = false;
}

const LESSON_VOICE_THRESHOLD = 78;

function lessonVoiceCopy() {
  return currentDirection === "zh-th" ? {
    kicker: "开口才算过关", title: "读准这句，打开下一关", note: "先听示范，再完整说一遍。设备听懂度达到 78 分即通过。",
    demo: "听标准音", start: "抢下这一关", listening: "正在听 · 完整说出目标句", checking: "正在判定…", score: "设备听懂度",
    pass: "命中！关卡已打开", retry: score => `本次 ${score} 分，再清楚一点`, heard: value => `设备听到：${value}`,
    localMissing: "本机没有离线识别包；可仅为本次允许系统语音服务联网判定。", allowNetwork: "允许本次联网判定",
    unsupported: "这台设备不能生成发音分。可以听示范并完成 3 次跟读，系统会标记为“未评分通过”。",
    practice: value => `完成跟读 ${value}/3`, manualPass: "已完成 3 次跟读 · 本次未生成发音分", next: "先完成开口闯关"
  } : {
    kicker: "พูดก่อนจึงผ่าน", title: "พูดประโยคนี้ให้ชัดเพื่อเปิดด่านต่อไป", note: "ฟังเสียงตัวอย่าง แล้วพูดให้ครบ ระบบต้องฟังเข้าใจอย่างน้อย 78 คะแนน",
    demo: "ฟังเสียงมาตรฐาน", start: "เริ่มท้าพูด", listening: "กำลังฟัง · พูดประโยคเป้าหมายให้ครบ", checking: "กำลังประเมิน…", score: "ความชัดที่อุปกรณ์ฟังได้",
    pass: "โดนเป้า! เปิดด่านถัดไปแล้ว", retry: score => `ครั้งนี้ ${score} คะแนน ลองพูดให้ชัดขึ้น`, heard: value => `อุปกรณ์ได้ยิน: ${value}`,
    localMissing: "เครื่องยังไม่มีชุดรู้จำแบบออฟไลน์ อนุญาตบริการเสียงของระบบออนไลน์เฉพาะครั้งนี้ได้", allowNetwork: "อนุญาตประเมินออนไลน์ครั้งนี้",
    unsupported: "อุปกรณ์นี้สร้างคะแนนการออกเสียงไม่ได้ ฟังตัวอย่างและพูดตาม 3 ครั้งเพื่อผ่านแบบ “ไม่มีคะแนน” ได้",
    practice: value => `พูดตามแล้ว ${value}/3`, manualPass: "พูดตามครบ 3 ครั้ง · รอบนี้ไม่มีคะแนนการออกเสียง", next: "พูดให้ผ่านก่อน"
  };
}

function lessonVoiceGateMarkup(answer) {
  const c = lessonVoiceCopy();
  const reading = answer.reading || answer.sub || "";
  return `<section class="lesson-voice-gate" data-lesson-voice-gate data-state="ready" aria-labelledby="lesson-voice-title">
    <div class="lesson-voice-head"><div><span>${escapeHtml(c.kicker)}</span><h3 id="lesson-voice-title">${escapeHtml(c.title)}</h3></div><b>${LESSON_VOICE_THRESHOLD}</b></div>
    <p class="lesson-voice-note">${escapeHtml(c.note)}</p>
    <div class="lesson-voice-target"><button type="button" data-lesson-voice="demo" aria-label="${escapeHtml(c.demo)}"><svg><use href="#i-volume"></use></svg></button><div><strong lang="${config().targetHtmlLang}">${escapeHtml(answer.text)}</strong>${reading ? `<small>${escapeHtml(reading)}</small>` : ""}</div></div>
    <div class="lesson-voice-meter" aria-label="${escapeHtml(c.score)}"><i style="width:0%"></i><b data-lesson-voice-score>--</b><span>/ 100</span></div>
    <p class="lesson-voice-status" data-lesson-voice-status role="status" aria-live="polite">${escapeHtml(c.note)}</p>
    <p class="lesson-voice-heard" data-lesson-voice-heard hidden></p>
    <div class="lesson-voice-actions"><button type="button" class="lesson-voice-start" data-lesson-voice="start"><span aria-hidden="true">●</span>${escapeHtml(c.start)}</button><button type="button" data-lesson-voice="network" hidden>${escapeHtml(c.allowNetwork)}</button><button type="button" data-lesson-voice="practice" hidden>${escapeHtml(c.practice(0))}</button></div>
  </section>`;
}

function mountLessonVoiceGate(feedback, answer) {
  lessonVoiceGate = {
    step: lessonStep,
    target: answer.text,
    reading: answer.reading || answer.sub || "",
    lang: config().targetLang,
    attempts: 0,
    practice: 0,
    running: false,
    passed: false
  };
  feedback.insertAdjacentHTML("beforeend", lessonVoiceGateMarkup(answer));
  $("#lesson-next").disabled = true;
  text("#lesson-next", lessonVoiceCopy().next);
}

function updateLessonVoiceResult(result = {}) {
  const gate = $("[data-lesson-voice-gate]");
  if (!gate) return;
  const score = Math.max(0, Math.min(100, Number(result.score) || 0));
  const meter = $(".lesson-voice-meter i", gate);
  const scoreNode = $("[data-lesson-voice-score]", gate);
  const heard = $("[data-lesson-voice-heard]", gate);
  if (meter) meter.style.width = `${score}%`;
  if (scoreNode) scoreNode.textContent = result.unscored ? "--" : String(score || 0);
  if (heard && result.transcript) {
    heard.hidden = false;
    heard.textContent = lessonVoiceCopy().heard(result.transcript);
  }
}

function passLessonVoiceGate(result = {}) {
  if (!lessonVoiceGate || lessonVoiceGate.step !== lessonStep) return;
  lessonVoiceGate.running = false;
  lessonVoiceGate.passed = true;
  const gate = $("[data-lesson-voice-gate]");
  gate?.setAttribute("data-state", "passed");
  updateLessonVoiceResult(result);
  text("[data-lesson-voice-status]", result.unscored ? lessonVoiceCopy().manualPass : lessonVoiceCopy().pass);
  const start = $("[data-lesson-voice='start']", gate);
  if (start) start.disabled = true;
  $("#lesson-next").disabled = false;
  text("#lesson-next", lessonStep === curriculumLessons().length - 1 ? config().ui.reward : config().ui.next);
  playAlaiVoice("level");
  pulseHaptic();
}

function exposeLessonVoiceFallback(message) {
  const gate = $("[data-lesson-voice-gate]");
  text("[data-lesson-voice-status]", message || lessonVoiceCopy().unsupported);
  const practice = $("[data-lesson-voice='practice']", gate);
  const start = $("[data-lesson-voice='start']", gate);
  if (practice) practice.hidden = false;
  if (start) start.disabled = false;
}

async function runLessonVoiceGate({ allowNetwork = false } = {}) {
  const gateState = lessonVoiceGate;
  if (!gateState || gateState.step !== lessonStep || gateState.running || gateState.passed) return;
  const scorer = window.PronunciationScorer;
  if (!scorer?.recognizeTarget) return exposeLessonVoiceFallback();
  gateState.running = true;
  const gate = $("[data-lesson-voice-gate]");
  gate?.setAttribute("data-state", "listening");
  const start = $("[data-lesson-voice='start']", gate);
  const network = $("[data-lesson-voice='network']", gate);
  if (start) start.disabled = true;
  if (network) network.hidden = true;
  text("[data-lesson-voice-status]", lessonVoiceCopy().listening);
  const result = await scorer.recognizeTarget({
    target: gateState.target,
    lang: gateState.lang,
    threshold: LESSON_VOICE_THRESHOLD,
    maxMs: 8000,
    allowNetwork,
    onInterim: interim => {
      if (lessonVoiceGate !== gateState || gateState.step !== lessonStep) return;
      updateLessonVoiceResult(interim);
      if (interim.transcript) text("[data-lesson-voice-status]", lessonVoiceCopy().checking);
    }
  });
  if (lessonVoiceGate !== gateState || gateState.step !== lessonStep) return;
  gateState.running = false;
  if (result.passed) return passLessonVoiceGate(result);
  gate?.setAttribute("data-state", "retry");
  updateLessonVoiceResult(result);
  if (["local-missing", "network-consent"].includes(result.status)) {
    text("[data-lesson-voice-status]", lessonVoiceCopy().localMissing);
    if (network) network.hidden = false;
  } else if (["none", "insecure", "start-failed", "not-allowed", "service-not-allowed"].includes(result.status)) {
    exposeLessonVoiceFallback();
  } else {
    gateState.attempts += 1;
    text("[data-lesson-voice-status]", lessonVoiceCopy().retry(result.score || 0));
  }
  if (start) start.disabled = false;
}

function completeLessonVoicePractice() {
  if (!lessonVoiceGate || lessonVoiceGate.passed || lessonVoiceGate.step !== lessonStep) return;
  lessonVoiceGate.practice += 1;
  const button = $("[data-lesson-voice='practice']");
  if (button) button.textContent = lessonVoiceCopy().practice(Math.min(3, lessonVoiceGate.practice));
  speakText(lessonVoiceGate.target, lessonVoiceGate.lang, .76, { track: "standard", element: button });
  if (lessonVoiceGate.practice >= 3) passLessonVoiceGate({ unscored: true });
}

function checkOrContinueLesson() {
  if (lessonNeedsRetry) {
    renderLessonStep();
    $(".lesson-body").scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  if (selectedAnswer === null) return;
  const data = config();
  const lessons = curriculumLessons();
  const step = lessons[lessonStep];
  if (!checked) {
    checked = true;
    const correctIndex = step.answers.findIndex(answer => answer.correct);
    $$("#answer-list [data-answer]").forEach((button, i) => {
      button.classList.remove("selected");
      button.setAttribute("aria-pressed", String(i === selectedAnswer));
      if (i === correctIndex) button.classList.add("correct");
      if (i === selectedAnswer && i !== correctIndex) button.classList.add("wrong");
    });
    const chosenAnswer = step.answers[selectedAnswer];
    const correctAnswer = step.answers[correctIndex];
    const correct = chosenAnswer.correct;
    const feedback = $("#lesson-feedback");
    const gradeLabel = grade => {
      const value = Number(String(grade || "").slice(1));
      return Number.isInteger(value) && value >= 1 && value <= 5
        ? `${grade} · ${registerName(5 - value)}`
        : "";
    };
    const chosenGrade = gradeLabel(chosenAnswer.grade);
    const correctGrade = gradeLabel(correctAnswer.grade);
    const gradeFeedback = chosenGrade
      ? (correct
        ? (currentDirection === "zh-th" ? `你选的是 ${chosenGrade}，和这个场景匹配。` : `คุณเลือก ${chosenGrade} ซึ่งตรงกับสถานการณ์นี้`)
        : (currentDirection === "zh-th" ? `你选的是 ${chosenGrade}；本场更合适的是 ${correctGrade}。` : `คุณเลือก ${chosenGrade}; สถานการณ์นี้เหมาะกับ ${correctGrade} มากกว่า`))
      : "";
    const feedbackCopy = `${gradeFeedback}${gradeFeedback ? " " : ""}${correct ? step.feedback : `${data.ui.wrongPrefix}${step.feedback}`}`;
    if (step.comparePair) {
      const isZh = currentDirection === "zh-th";
      feedback.innerHTML = `<p>${escapeHtml(feedbackCopy)}</p><div class="lesson-compare-actions">
        <button data-lesson-compare="source" data-speech-policy="native"><span>${isZh ? "引导跟说 S2" : "ฝึกพูด S2 แบบมีคำแนะนำ"}</span><small>${isZh ? "边界演练 · 有冒犯风险" : "ฝึกตั้งขอบเขต · มีความเสี่ยง"}</small></button>
        <button data-lesson-compare="safe" data-speech-policy="native"><span>${isZh ? "再说 S4 安全改写" : "พูดฉบับ S4 ที่ปลอดภัย"}</span><small>${escapeHtml(step.comparePair.safe.target)}</small></button>
      </div>`;
    } else {
      feedback.textContent = feedbackCopy;
    }
    feedback.style.background = correct ? "#edffd9" : "#fff0f1";
    feedback.style.color = correct ? "#3c6d1c" : "#a93240";
    feedback.classList.remove("hidden");
    text("#lesson-next", lessonStep === lessons.length - 1 ? data.ui.reward : data.ui.next);
    if (!correct) {
      lessonNeedsRetry = true;
      text("#lesson-next", currentDirection === "zh-th" ? "再选一次" : "เลือกใหม่อีกครั้ง");
      text("#heart-count", String(Math.max(1, Number($("#heart-count").textContent) - 1)));
    } else if (correctAnswer.target && correctAnswer.grade !== "S1") {
      mountLessonVoiceGate(feedback, correctAnswer);
    }
    playAlaiVoice(correct ? "correct" : "retry");
    pulseHaptic();
    return;
  }
  if (lessonVoiceGate && !lessonVoiceGate.passed) return;
  if (lessonStep < lessons.length - 1) {
    lessonStep += 1;
    renderLessonStep();
    $(".lesson-body").scrollTo({ top: 0, behavior: "smooth" });
  } else {
    safeStorage.setItem(`register-route-complete-${currentDirection}-${gradeForMode()}`, "1");
    renderRegisterHome();
    navigate("home", { history: "replace" });
    showToast(data.ui.lessonComplete);
    playAlaiVoice("level");
  }
}

function renderPassSheet() {
  const data = config().pass;
  passState = 0;
  text("#pass-kicker", data.kicker);
  text("#pass-title", data.title);
  text("#pass-copy", data.copy);
  text("#pass-player-a", data.playerA);
  text("#pass-player-a-role", data.roleA);
  text("#pass-player-b", data.playerB);
  text("#pass-player-b-role", data.roleB);
  text("#pass-player-a-icon", currentDirection === "zh-th" ? "中" : "ท");
  text("#pass-player-b-icon", currentDirection === "zh-th" ? "ท" : "中");
  text("#start-pass", data.start);
  text("#pass-cancel", data.cancel);
}

function advancePassMode() {
  const data = config().pass;
  if (passState === 0) {
    passState = 1;
    text("#pass-kicker", currentDirection === "zh-th" ? "答案已安全遮挡" : "ซ่อนคำตอบแล้ว");
    text("#pass-title", data.handoffTitle);
    text("#pass-copy", data.handoffCopy);
    text("#start-pass", data.reveal);
    pulseHaptic();
    return;
  }
  closeSheets();
  navigate("battle");
  renderBattle();
  showToast(data.toast);
}

function restoreLocalBattleUi() {
  const host = $("#local-battle-root");
  host?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("local-battle-open");
  restoreSheetBackgroundInert();
  const focusTarget = sheetLastFocus;
  sheetLastFocus = null;
  localBattleOpen = false;
  if (localBattleHistoryPushed && !localBattleClosingFromHistory) {
    localBattleHistoryPushed = false;
    try { history.back(); } catch (_) {}
  }
  if (focusTarget?.isConnected) requestAnimationFrame(() => focusTarget.focus?.());
}

function openLocalBattle() {
  closeSheets();
  const host = $("#local-battle-root");
  const battle = window.HUILAISHI_LOCAL_BATTLE;
  if (!host || !battle?.init) {
    showToast(currentDirection === "zh-th" ? "双人对战模块未能加载，请刷新后重试" : "โหลดเกมดวลสองคนไม่สำเร็จ โปรดลองรีเฟรช");
    return;
  }
  sheetLastFocus = document.activeElement;
  localBattleOpen = true;
  document.body.classList.add("local-battle-open");
  host.removeAttribute("aria-hidden");
  setSheetBackgroundInert(host);
  const battleOptions = {
    root: host,
    direction: currentDirection,
    grade: gradeForMode(),
    getDirection: () => currentDirection,
    getGrade: () => gradeForMode(),
    onClose: restoreLocalBattleUi,
    onFinish: () => { pulseHaptic(); }
  };
  try {
    if (localBattleInitialized) battle.open(battleOptions);
    else { battle.init(battleOptions); localBattleInitialized = true; }
    host.scrollTo?.({ top: 0, behavior: "auto" });
    if (!localBattleHistoryPushed) {
      try {
        history.pushState({ ...(history.state || {}), [APP_HISTORY_STATE_KEY]: activeAppRoute || "battle", huilaishiLocalBattle: true }, "", location.href);
        localBattleHistoryPushed = true;
      } catch (_) { localBattleHistoryPushed = false; }
    }
  } catch (_) {
    localBattleInitialized = false;
    try { battle.destroy?.(); } catch (_) {}
    restoreLocalBattleUi();
    showToast(currentDirection === "zh-th" ? "双人对战启动失败，请刷新后重试" : "เปิดเกมดวลสองคนไม่สำเร็จ โปรดลองรีเฟรช");
  }
}

function handleLocalBattlePopState() {
  if (!localBattleOpen) return;
  localBattleHistoryPushed = false;
  localBattleClosingFromHistory = true;
  try {
    const closed = window.HUILAISHI_LOCAL_BATTLE?.close?.();
    if (closed === false) {
      try {
        history.pushState({ ...(history.state || {}), [APP_HISTORY_STATE_KEY]: activeAppRoute || "battle", huilaishiLocalBattle: true }, "", location.href);
        localBattleHistoryPushed = true;
      } catch (_) { localBattleHistoryPushed = false; }
    }
  } finally { localBattleClosingFromHistory = false; }
}

function restoreApplicationRoute(route) {
  const normalized = normalizeAppRoute(route);
  const fallback = "home";
  const safeTarget = normalized || fallback;
  restoringAppRoute = true;
  try {
    closeSheets();
    if (safeTarget === "direction") showDirection({ history: "none" });
    else if (safeTarget === "onboarding-select" || safeTarget === "onboarding-confirm") {
      showOnboarding({ history: "none" });
      if (safeTarget === "onboarding-confirm") setOnboardingStage("confirm", false, "none");
    } else if (safeTarget === "lesson") startLesson({ history: "none" });
    else navigate(safeTarget, { history: "none" });
  } finally { restoringAppRoute = false; }
  activeAppRoute = safeTarget;
  try { globalThis.sessionStorage?.setItem(APP_HISTORY_SESSION_KEY, safeTarget); } catch (_) {}
  return safeTarget;
}

function handleApplicationPopState(event) {
  if (localBattleOpen) {
    handleLocalBattlePopState();
    return;
  }
  const visibleSheet = $$(".bottom-sheet").find(node => !node.classList.contains("hidden"));
  if (visibleSheet) {
    const routeToKeep = normalizeAppRoute(activeAppRoute) || "home";
    closeSheets();
    // Android's system Back and iOS Safari's edge-swipe must dismiss the
    // overlay first. The browser has already moved one entry when popstate
    // fires, so put the still-visible app route back on top of the stack.
    rememberAppRoute(routeToKeep, "push");
    return;
  }
  const restored = restoreApplicationRoute(event?.state?.[APP_HISTORY_STATE_KEY]);
  if (!event?.state?.[APP_HISTORY_STATE_KEY]) rememberAppRoute(restored, "replace");
}

function restoreSheetBackgroundInert() {
  sheetBackgroundState.forEach(({ node, inert, ariaHidden }) => {
    if (!node?.isConnected) return;
    node.inert = inert;
    if (ariaHidden === null) node.removeAttribute("aria-hidden");
    else node.setAttribute("aria-hidden", ariaHidden);
  });
  sheetBackgroundState = [];
}

function setSheetBackgroundInert(sheet) {
  restoreSheetBackgroundInert();
  const app = $("#app");
  const backdrop = $("#modal-backdrop");
  sheetBackgroundState = [...app.children].filter(node => node !== sheet && node !== backdrop).map(node => ({
    node,
    inert: Boolean(node.inert),
    ariaHidden: node.getAttribute("aria-hidden")
  }));
  sheetBackgroundState.forEach(({ node }) => {
    node.inert = true;
    node.setAttribute("aria-hidden", "true");
  });
}

function openSheet(id) {
  sheetLastFocus = document.activeElement;
  $("#modal-backdrop").classList.remove("hidden");
  $$(".bottom-sheet").forEach(sheet => sheet.classList.add("hidden"));
  const sheet = $(`#${id}`);
  sheet.classList.remove("hidden");
  setSheetBackgroundInert(sheet);
  if (id === "mode-sheet") {
    pendingMode = currentMode;
    renderModeList();
  }
  if (id === "pass-sheet") renderPassSheet();
  requestAnimationFrame(() => {
    const first = sheet.querySelector("[data-close-sheet], button:not(:disabled), input:not(:disabled), textarea:not(:disabled), [tabindex='0']");
    first?.focus?.();
  });
}

function closeSheets() {
  clearTimeout(partnerReplyTimer);
  const arcadeWasOpen = !$("#arcade-sheet")?.classList.contains("hidden");
  $("#modal-backdrop").classList.add("hidden");
  $$(".bottom-sheet").forEach(sheet => sheet.classList.add("hidden"));
  if (arcadeWasOpen) globalThis.ArcadeUI?.close?.();
  restoreSheetBackgroundInert();
  const focusTarget = sheetLastFocus;
  sheetLastFocus = null;
  if (focusTarget?.isConnected) requestAnimationFrame(() => focusTarget.focus?.());
}

function handleSheetKeydown(event) {
  const sheet = $$(".bottom-sheet").find(node => !node.classList.contains("hidden"));
  if (!sheet) return;
  if (event.key === "Escape") {
    event.preventDefault();
    if (sheet.id === "data-clear-sheet" && localDataClearInProgress) return;
    closeSheets();
    return;
  }
  if (event.key !== "Tab") return;
  const focusable = $$(`button:not(:disabled), a[href], input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex='0']`, sheet)
    .filter(node => node.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}

function navigate(view, options = {}) {
  if (!APP_MAIN_VIEWS.has(view)) view = "home";
  stopPracticeRecording({ discard: true, reason: "navigate" });
  stopLocalRecognition();
  showMain();
  $$(".view").forEach(section => section.classList.toggle("active", section.id === `view-${view}`));
  $$(".bottom-nav button").forEach(button => {
    const selected = button.dataset.nav === view;
    button.classList.toggle("active", selected);
    button.classList.toggle("tab-link-active", selected);
    if (selected) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  $("#app-scroll").scrollTo({ top: 0, behavior: "smooth" });
  if (view === "live") {
    renderLive();
    prepareLocalSpeech();
  }
  if (view === "library") window.VocabUI?.render?.();
  rememberAppRoute(view, options.history || "push");
}

function stopAlaiVoice() {
  if (!alaiAudio) return;
  alaiAudio.pause();
  alaiAudio.currentTime = 0;
  alaiAudio = null;
  $$(".voice-orb").forEach(orb => orb.classList.remove("playing"));
}

// Shared stop hook used by tap-to-speak, the arcade and pronunciation lessons.
window.stopAlaiVoice = stopAlaiVoice;

function playAlaiVoice(cue = "intro") {
  window.HUILAISHI_SPEECH?.stop?.();
  window.ArcadeUI?.stopVoice?.();
  window.PronunciationCourse?.stopAudio?.();
  stopAlaiVoice();
  const locale = currentDirection === "zh-th" ? "zh" : "th";
  const key = `${cue}-${locale}`;
  const source = window.ALAI_AUDIO?.[key] || `assets/audio/alai-${key}.mp3`;
  const audio = new Audio(source);
  alaiAudio = audio;
  audio.preload = "auto";
  audio.volume = cue === "intro" ? .92 : .84;
  audio.setAttribute("playsinline", "");
  const orb = $(".voice-orb");
  orb?.classList.add("playing");
  const clear = () => {
    if (alaiAudio === audio) alaiAudio = null;
    orb?.classList.remove("playing");
  };
  audio.addEventListener("ended", clear, { once: true });
  audio.addEventListener("error", clear, { once: true });
  const playback = audio.play();
  playback?.catch(clear);
  return playback;
}

function playSugarBladeVoice(cue = "mode", playbackRate = 1) {
  window.HUILAISHI_SPEECH?.stop?.();
  window.ArcadeUI?.stopVoice?.();
  window.PronunciationCourse?.stopAudio?.();
  stopAlaiVoice();
  const locale = currentDirection === "zh-th" ? "th" : "zh";
  const key = `${cue}-${locale}`;
  const source = window.SUGAR_AUDIO?.[key] || `assets/audio/sugarblade-${key}.mp3`;
  const audio = new Audio(source);
  alaiAudio = audio;
  audio.preload = "auto";
  audio.volume = .9;
  audio.playbackRate = playbackRate;
  if ("preservesPitch" in audio) audio.preservesPitch = true;
  if ("webkitPreservesPitch" in audio) audio.webkitPreservesPitch = true;
  audio.setAttribute("playsinline", "");
  const orb = $(".sugar-orb");
  orb?.classList.add("playing");
  const clear = () => { if (alaiAudio === audio) alaiAudio = null; orb?.classList.remove("playing"); };
  audio.addEventListener("ended", clear, { once: true });
  audio.addEventListener("error", clear, { once: true });
  const playback = audio.play();
  playback?.catch(clear);
  return playback;
}

function speakText(value, lang = config().targetLang, rate, options = {}) {
  stopAlaiVoice();
  const speechOptions = options.track === "character" && options.fallback === undefined
    ? { ...options, fallback: "none" }
    : options;
  if (window.HUILAISHI_SPEECH?.speak) {
    const thai = String(lang || "").toLowerCase().startsWith("th");
    const requested = Number(rate);
    const hasRequestedRate = Number.isFinite(requested);
    const slow = hasRequestedRate && requested <= .8;
    const engineOptions = { ...speechOptions, lang, mode: slow ? "slow" : "normal" };
    if (slow) engineOptions.rate = Math.max(thai ? .72 : .74, requested);
    return window.HUILAISHI_SPEECH.speak(value, engineOptions);
  }
  if (speechOptions.fallback === "none") {
    return showToast(currentDirection === "zh-th"
      ? "角色固定音频暂不可用，未改用设备机器声"
      : "เสียงตัวละครใช้ไม่ได้ และไม่ได้เปลี่ยนเป็นเสียงเครื่อง");
  }
  if (!("speechSynthesis" in window)) return showToast(currentDirection === "zh-th" ? "当前浏览器没有语音功能" : "เบราว์เซอร์นี้ไม่รองรับเสียงพูด");
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(value);
  utterance.lang = lang;
  const fallbackPace = { natural: 1, clear: .9, slow: .78 };
  utterance.rate = Number.isFinite(Number(rate)) ? Number(rate) : fallbackPace[speechPace];
  const voice = speechSynthesis.getVoices().find(item => item.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()));
  if (voice) utterance.voice = voice;
  speechSynthesis.speak(utterance);
  showToast(voice ? config().ui.playToast : config().ui.noVoice);
}

function setLocalSpeechUi(status) {
  const ui = offlineConfig()?.ui;
  if (!ui) return;
  localSpeechCapability = status;
  const installButton = $("#install-voice-pack");
  const voiceButton = $("#start-local-voice");
  installButton.classList.toggle("hidden", status !== "pack");
  voiceButton.disabled = status !== "ready";
  voiceButton.classList.toggle("listening", status === "listening");
  text("#voice-pack-label", ui.installVoice);

  if (status === "checking") {
    text("#voice-title", ui.voiceChecking);
    text("#voice-status", ui.voiceAlways);
    text("#voice-main-label", ui.startVoice);
  } else if (status === "ready") {
    text("#voice-title", ui.voiceReady);
    text("#voice-status", ui.voiceReadyNote);
    text("#voice-main-label", ui.startVoice);
  } else if (status === "listening") {
    text("#voice-title", ui.listening);
    text("#voice-status", ui.voiceReadyNote);
    text("#voice-main-label", ui.listening);
  } else if (status === "pack") {
    text("#voice-title", ui.voicePackNeeded);
    text("#voice-status", ui.voicePackNote);
    text("#voice-main-label", ui.startVoice);
  } else {
    text("#voice-title", ui.voiceUnavailable);
    text("#voice-status", ui.voiceFallback);
    text("#voice-main-label", ui.startVoice);
  }
}

function stopLocalRecognition() {
  const recognition = localRecognition;
  localRecognition = null;
  try { recognition?.abort?.(); } catch (_) { /* browser may already have ended it */ }
  if (localSpeechCapability === "listening") localSpeechCapability = "ready";
}

async function prepareLocalSpeech() {
  const routeAtStart = currentDirection;
  setLocalSpeechUi("checking");
  const SpeechRecognition = window.SpeechRecognition;
  if (!window.isSecureContext || !SpeechRecognition || typeof SpeechRecognition.available !== "function") {
    if (currentDirection === routeAtStart) setLocalSpeechUi("unavailable");
    return;
  }
  try {
    const probe = new SpeechRecognition();
    if (!("processLocally" in probe)) {
      setLocalSpeechUi("unavailable");
      return;
    }
    const result = await SpeechRecognition.available({ langs: [config().targetLang], processLocally: true });
    if (currentDirection !== routeAtStart) return;
    if (result === "available") setLocalSpeechUi("ready");
    else if (result === "downloadable" || result === "downloading") setLocalSpeechUi("pack");
    else setLocalSpeechUi("unavailable");
  } catch (_) {
    if (currentDirection === routeAtStart) setLocalSpeechUi("unavailable");
  }
}

async function installLocalVoicePack() {
  const ui = offlineConfig().ui;
  if (!navigator.onLine) {
    showToast(currentDirection === "zh-th" ? "首次安装离线识别包需要先联网" : "การติดตั้งชุดรู้จำออฟไลน์ครั้งแรกต้องออนไลน์");
    return;
  }
  const SpeechRecognition = window.SpeechRecognition;
  if (!SpeechRecognition || typeof SpeechRecognition.install !== "function") return setLocalSpeechUi("unavailable");
  setLocalSpeechUi("checking");
  text("#voice-status", currentDirection === "zh-th" ? "正在下载语言包，请保持页面打开…" : "กำลังดาวน์โหลดชุดภาษา โปรดเปิดหน้านี้ไว้…");
  try {
    const installed = await SpeechRecognition.install({ langs: [config().targetLang], processLocally: true });
    if (installed) {
      setLocalSpeechUi("ready");
      showToast(currentDirection === "zh-th" ? "本地识别包安装完成" : "ติดตั้งชุดรู้จำในเครื่องแล้ว");
    } else {
      setLocalSpeechUi("pack");
      showToast(ui.voicePackNote);
    }
  } catch (_) {
    setLocalSpeechUi("pack");
      showToast(currentDirection === "zh-th" ? "识别语言包安装失败，可继续用选句和打字" : "ติดตั้งชุดรู้จำไม่สำเร็จ ยังเลือกประโยคและพิมพ์ได้");
  }
}

function startLocalVoice() {
  if (localSpeechCapability !== "ready") return;
  const SpeechRecognition = window.SpeechRecognition;
  try {
    localRecognition?.abort?.();
    localRecognition = new SpeechRecognition();
    localRecognition.lang = config().targetLang;
    localRecognition.continuous = false;
    localRecognition.interimResults = false;
    localRecognition.maxAlternatives = 1;
    localRecognition.processLocally = true;
    localRecognition.onstart = () => setLocalSpeechUi("listening");
    localRecognition.onresult = event => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) {
        $("#live-input").value = transcript;
        submitLiveInput(transcript);
      }
    };
    localRecognition.onerror = event => {
      if (event.error === "language-not-supported") setLocalSpeechUi("pack");
      else setLocalSpeechUi("ready");
      showToast(currentDirection === "zh-th" ? "没有识别清楚，请再试一次或改用选句" : "ฟังไม่ชัด ลองอีกครั้งหรือเลือกประโยคแทน");
    };
    localRecognition.onend = () => {
      if (localSpeechCapability === "listening") setLocalSpeechUi("ready");
    };
    localRecognition.start();
  } catch (_) {
    setLocalSpeechUi("unavailable");
    showToast(offlineConfig().ui.voiceFallback);
  }
}

function clearPracticeRecordingTimer() {
  clearTimeout(practiceRecordingTimer);
  practiceRecordingTimer = null;
}

function clearRecordedPlayback() {
  const playback = $("#record-playback");
  if (playback) {
    try { playback.pause(); } catch (_) { /* no active playback */ }
    playback.removeAttribute("src");
    try { playback.load(); } catch (_) { /* detached audio element */ }
    playback.classList.add("hidden");
  }
  if (recordedUrl) URL.revokeObjectURL(recordedUrl);
  recordedUrl = null;
}

function resetPracticeRecordingUi() {
  const recordButton = $("#record-practice");
  recordButton?.classList.remove("recording");
  if (recordButton) recordButton.disabled = false;
  const label = offlineConfig()?.ui?.record;
  if (label) text("#record-label", label);
}

function stopPracticeRecording({ discard = false, reason = "user" } = {}) {
  clearPracticeRecordingTimer();
  practiceRecordingPending = false;
  const recorder = mediaRecorder;
  const stream = mediaStream;
  if (discard) {
    discardPracticeRecording = true;
    practiceRecordingSession += 1;
    recordedChunks = [];
    clearRecordedPlayback();
  }
  if (recorder) recorder._huilaishiStopReason = reason;
  try {
    if (recorder && recorder.state !== "inactive") recorder.stop();
  } catch (_) { /* tracks below are the final safety net */ }
  stream?.getTracks?.().forEach(track => {
    try { track.stop(); } catch (_) { /* already stopped */ }
  });
  if (mediaStream === stream) mediaStream = null;
  if (!recorder || recorder.state === "inactive") mediaRecorder = null;
  resetPracticeRecordingUi();
}

async function togglePracticeRecording() {
  const ui = offlineConfig().ui;
  const recordButton = $("#record-practice");
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    stopPracticeRecording({ reason: "user" });
    return;
  }
  if (practiceRecordingPending) return;
  if (!window.MediaRecorder || !navigator.mediaDevices?.getUserMedia) {
    showToast(currentDirection === "zh-th" ? "此设备不能在网页中录音；离线选句和打字仍可使用" : "อุปกรณ์นี้อัดเสียงผ่านเว็บไม่ได้ แต่ยังเลือกประโยคและพิมพ์ออฟไลน์ได้");
    return;
  }
  const session = ++practiceRecordingSession;
  practiceRecordingPending = true;
  recordButton.disabled = true;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    if (session !== practiceRecordingSession || document.visibilityState === "hidden") {
      stream.getTracks().forEach(track => track.stop());
      practiceRecordingPending = false;
      resetPracticeRecordingUi();
      return;
    }
    clearRecordedPlayback();
    discardPracticeRecording = false;
    const sessionChunks = [];
    recordedChunks = sessionChunks;
    const recorder = new MediaRecorder(stream);
    mediaStream = stream;
    mediaRecorder = recorder;
    recorder.addEventListener("dataavailable", event => { if (event.data.size) sessionChunks.push(event.data); });
    recorder.addEventListener("stop", () => {
      stream.getTracks().forEach(track => track.stop());
      if (mediaStream === stream) mediaStream = null;
      if (mediaRecorder === recorder) mediaRecorder = null;
      clearPracticeRecordingTimer();
      practiceRecordingPending = false;
      const stale = session !== practiceRecordingSession || discardPracticeRecording;
      if (stale || !sessionChunks.length) {
        if (recordedChunks === sessionChunks) recordedChunks = [];
        resetPracticeRecordingUi();
        return;
      }
      const blob = new Blob(sessionChunks, { type: recorder.mimeType || "audio/webm" });
      if (recordedChunks === sessionChunks) recordedChunks = [];
      clearRecordedPlayback();
      recordedUrl = URL.createObjectURL(blob);
      $("#record-playback").src = recordedUrl;
      $("#record-playback").classList.remove("hidden");
      resetPracticeRecordingUi();
      const timedOut = recorder._huilaishiStopReason === "timeout";
      showToast(currentDirection === "zh-th"
        ? (timedOut ? "已到 60 秒，录音自动停止；现在可以本机回放" : "录好了，听听自己和原句的差别")
        : (timedOut ? "ครบ 60 วินาที ระบบหยุดอัตโนมัติ ฟังย้อนหลังในเครื่องได้เลย" : "อัดแล้ว ลองฟังเทียบกับประโยคต้นฉบับ"));
    });
    recorder.addEventListener("error", () => stopPracticeRecording({ discard: true, reason: "error" }), { once: true });
    recorder.start();
    practiceRecordingPending = false;
    recordButton.disabled = false;
    recordButton.classList.add("recording");
    text("#record-label", ui.stopRecord);
    practiceRecordingTimer = setTimeout(() => stopPracticeRecording({ reason: "timeout" }), 60000);
    showToast(currentDirection === "zh-th" ? "正在本机录音，不上传；最长 60 秒" : "กำลังอัดในเครื่อง ไม่อัปโหลด สูงสุด 60 วินาที");
  } catch (_) {
    if (session !== practiceRecordingSession) return;
    practiceRecordingPending = false;
    recordButton.disabled = false;
    mediaStream?.getTracks().forEach(track => track.stop());
    mediaStream = null;
    mediaRecorder = null;
    resetPracticeRecordingUi();
    showToast(currentDirection === "zh-th" ? "没有获得麦克风权限，可继续用选句和打字" : "ไม่ได้รับสิทธิ์ไมโครโฟน ยังเลือกประโยคและพิมพ์ได้");
  }
}

function formatOfflineBytes(value) {
  const bytes = Math.max(0, Number(value) || 0);
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function readCoreAudioConsent() {
  try { return safeStorage.getItem(CORE_AUDIO_CONSENT_KEY) || "pending"; }
  catch (_) { return "pending"; }
}

function writeCoreAudioConsent(value) {
  safeStorage.setItem(CORE_AUDIO_CONSENT_KEY, value);
}

function networkCostState() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveData = Boolean(connection?.saveData);
  const cellular = String(connection?.type || "").toLowerCase() === "cellular";
  return { connection, saveData, cellular, constrained: saveData || cellular };
}

function renderOfflineAudioUi() {
  const panel = $("#offline-audio-panel");
  if (!panel) return;
  const isZh = currentDirection === "zh-th";
  const detail = offlineCacheDetail || {};
  const completed = Math.max(0, Number(detail.coreCompleted) || 0);
  const total = Math.max(0, Number(detail.coreTotal) || 696);
  const bytesCompleted = Math.max(0, Number(detail.bytesCompleted) || 0);
  const embedded = offlineCacheState === "file-ready";
  const unavailable = offlineCacheState === "unavailable";
  const fullReady = offlineCacheState === "ready" || embedded || Boolean(detail.fullReady);
  const paused = Boolean(detail.paused);
  const downloading = !fullReady && coreAudioRequested && !paused;
  const hasCachedAudio = fullReady || completed > 0 || bytesCompleted > 0;
  const consent = readCoreAudioConsent();
  const network = networkCostState();
  const progress = total ? `${Math.min(completed, total)}/${total}` : "0/696";
  const byteLabel = detail.bytesTotal ? `${formatOfflineBytes(bytesCompleted)}/${formatOfflineBytes(detail.bytesTotal)}` : "23.3 MB";

  text("#offline-audio-title", isZh ? "核心离线语音" : "เสียงหลักแบบออฟไลน์");
  text("#offline-audio-size", isZh ? "696 段 · 23.3 MB" : "696 คลิป · 23.3 MB");
  let state = isZh ? "未下载" : "ยังไม่ดาวน์โหลด";
  if (embedded) state = isZh ? "已内置" : "รวมไว้แล้ว";
  else if (unavailable) state = isZh ? "当前环境不可缓存" : "สภาพแวดล้อมนี้บันทึกไม่ได้";
  else if (fullReady) state = isZh ? "已就绪" : "พร้อมใช้";
  else if (downloading) state = isZh ? `下载中 ${progress}` : `กำลังดาวน์โหลด ${progress}`;
  else if (hasCachedAudio && paused) state = isZh ? `已暂停 ${progress}` : `หยุดชั่วคราว ${progress}`;
  else if (hasCachedAudio) state = isZh ? `可继续 ${progress}` : `ดาวน์โหลดต่อได้ ${progress}`;
  else if (consent === "declined") state = isZh ? "已暂缓" : "พักไว้ก่อน";
  text("#offline-audio-state", state);

  let note = isZh
    ? "不会自动下载。确认后才缓存到这台设备，并会尊重省流量与蜂窝网络设置。"
    : "ระบบจะไม่ดาวน์โหลดอัตโนมัติ ต้องยืนยันก่อนจึงบันทึกลงเครื่อง และเคารพโหมดประหยัดข้อมูลกับเครือข่ายมือถือ";
  if (embedded) note = isZh ? "核心语音已经写入当前单文件离线版，不需要再次缓存。" : "รวมเสียงหลักไว้ในไฟล์ออฟไลน์นี้แล้ว ไม่ต้องบันทึกซ้ำ";
  else if (unavailable) note = isZh ? "当前地址不支持安全的离线缓存；请使用 HTTPS 在线版或单文件离线版。" : "ที่อยู่นี้ไม่รองรับการบันทึกออฟไลน์อย่างปลอดภัย โปรดใช้เวอร์ชัน HTTPS หรือไฟล์ออฟไลน์";
  else if (fullReady) note = isZh ? "核心语音已保存在这台设备，可断网播放；你可以随时删除后重新下载。" : "บันทึกเสียงหลักไว้ในอุปกรณ์แล้ว เล่นแบบออฟไลน์ได้ และลบเพื่อดาวน์โหลดใหม่ได้ทุกเมื่อ";
  else if (downloading) note = isZh ? `正在缓存 ${byteLabel}。离开页面前可暂停，已完成部分会保留。` : `กำลังบันทึก ${byteLabel} หยุดชั่วคราวได้ก่อนออกจากหน้า และส่วนที่เสร็จแล้วจะยังอยู่`;
  else if (hasCachedAudio) note = isZh ? `已缓存 ${byteLabel}。只有你再次点击继续才会联网下载。` : `บันทึกแล้ว ${byteLabel} ระบบจะดาวน์โหลดต่อเมื่อคุณแตะดำเนินการต่อเท่านั้น`;
  else if (network.saveData) note = isZh ? "检测到省流量模式：不会后台下载；如仍要下载，请手动确认。" : "ตรวจพบโหมดประหยัดข้อมูล ระบบจะไม่ดาวน์โหลดเบื้องหลัง หากต้องการต่อโปรดยืนยันเอง";
  else if (network.cellular) note = isZh ? "检测到蜂窝网络：不会后台下载；如仍要使用流量下载，请手动确认。" : "ตรวจพบเครือข่ายมือถือ ระบบจะไม่ดาวน์โหลดเบื้องหลัง หากต้องการใช้ดาต้าโปรดยืนยันเอง";
  text("#offline-audio-note", note);

  const download = $("#core-audio-download");
  const pause = $("#core-audio-pause");
  const clear = $("#core-audio-clear");
  const decline = $("#core-audio-decline");
  download.classList.toggle("hidden", fullReady || unavailable || downloading);
  pause.classList.toggle("hidden", !downloading);
  clear.classList.toggle("hidden", !hasCachedAudio || embedded || unavailable);
  decline.classList.toggle("hidden", fullReady || unavailable || downloading || hasCachedAudio);
  text("#core-audio-download", hasCachedAudio
    ? (isZh ? "继续下载" : "ดาวน์โหลดต่อ")
    : network.constrained
      ? (isZh ? "仍用当前网络下载 23.3 MB" : "ยังดาวน์โหลดผ่านเครือข่ายนี้ 23.3 MB")
      : (isZh ? "同意并下载 23.3 MB" : "ยินยอมและดาวน์โหลด 23.3 MB"));
  text("#core-audio-pause", isZh ? "暂停" : "หยุดชั่วคราว");
  if (clear.dataset.confirm !== "1") text("#core-audio-clear", isZh ? "删除语音" : "ลบเสียง");
  text("#core-audio-decline", consent === "declined" ? (isZh ? "保持暂缓" : "พักไว้ต่อ") : (isZh ? "暂不下载" : "ยังไม่ดาวน์โหลด"));
}

function renderOfflineCacheUi() {
  const ui = offlineConfig()?.ui;
  if (!ui) return;
  const detail = offlineCacheDetail || {};
  const capability = $("#offline-capability");
  let title = ui.offlinePreparing;
  let copy = ui.offlinePreparingCopy;
  if (offlineCacheState === "ready") {
    title = ui.offlineCoreReady;
    copy = ui.offlineCoreReadyCopy;
  } else if (offlineCacheState === "base-ready") {
    title = ui.offlineBaseReady;
    if (detail.coreTotal && (coreAudioRequested || detail.coreCompleted || detail.bytesCompleted)) {
      const itemProgress = `${Math.min(detail.coreCompleted || 0, detail.coreTotal)}/${detail.coreTotal}`;
      const byteProgress = detail.bytesTotal
        ? `${formatOfflineBytes(detail.bytesCompleted)}/${formatOfflineBytes(detail.bytesTotal)}`
        : "";
      const activelyDownloading = coreAudioRequested && !detail.paused;
      copy = `${activelyDownloading ? ui.offlineAudioProgress : ui.offlineAudioPaused} · ${itemProgress}${byteProgress ? ` · ${byteProgress}` : ""}`;
    } else {
      copy = currentDirection === "zh-th"
        ? "文字、课程和录音回放可断网；核心语音须经你确认后下载"
        : "ข้อความ บทเรียน และเสียงอัดย้อนหลังใช้แบบออฟไลน์ได้ ส่วนเสียงหลักจะดาวน์โหลดเมื่อคุณยืนยันเท่านั้น";
    }
  } else if (offlineCacheState === "unavailable") {
    title = ui.offlineUnavailable;
    copy = ui.offlineUnavailableCopy;
  } else if (offlineCacheState === "file-ready") {
    title = ui.offlineFileReady;
    copy = ui.offlineFileReadyCopy;
  } else if (detail.phase === "shell" && detail.total) {
    copy = `${ui.offlineShellProgress} · ${detail.completed || 0}/${detail.total}`;
  } else if (detail.shellTotal) {
    copy = `${detail.shellFailed ? ui.offlineShellPaused : ui.offlineShellProgress} · ${detail.shellCompleted || 0}/${detail.shellTotal}`;
  }
  text("#offline-capability-title", title);
  text("#offline-capability-copy", copy);
  const shellRetryable = offlineCacheState === "preparing" && detail.shellTotal && detail.shellCompleted < detail.shellTotal;
  const retryable = shellRetryable;
  if (capability) {
    if (retryable) {
      capability.setAttribute("role", "button");
      capability.tabIndex = 0;
      capability.setAttribute("aria-label", shellRetryable ? ui.offlineShellRetry : ui.offlineAudioRetry);
      capability.title = shellRetryable ? ui.offlineShellRetry : ui.offlineAudioRetry;
    } else {
      capability.removeAttribute("role");
      capability.removeAttribute("tabindex");
      capability.removeAttribute("aria-label");
      capability.removeAttribute("title");
    }
  }
  renderOfflineAudioUi();
}

function setOfflineCacheState(state, detail = {}) {
  offlineCacheState = state;
  offlineCacheDetail = { ...detail };
  renderOfflineCacheUi();
}

function updateInstallUi() {
  const ui = offlineConfig()?.ui;
  if (!ui) return;
  const standalone = window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
  text("#install-app-label", ui.installApp);
  text("#install-app-action", standalone
    ? (currentDirection === "zh-th" ? "已安装" : "ติดตั้งแล้ว")
    : deferredInstallPrompt ? ui.installAction : ui.installManual);
  renderOfflineCacheUi();
}

function isAppleMobileDevice() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && Number(navigator.maxTouchPoints) > 1);
}

function isIosSafariBrowser() {
  if (!isAppleMobileDevice()) return false;
  return /safari/i.test(navigator.userAgent) && !/(?:crios|fxios|edgios|opios|duckduckgo)/i.test(navigator.userAgent);
}

function openIosInstallGuide() {
  const thai = currentDirection === "th-zh";
  const sheet = $("#ios-install-sheet");
  const steps = $$(".ios-install-steps span", sheet);
  text("#ios-install-title", thai ? "เพิ่ม萨瓦迪卡ไปยังหน้าจอโฮม" : "把萨瓦迪卡放到主屏幕");
  text("#ios-install-copy", thai
    ? "นี่ไม่ใช่แพ็กเกจ App Store เมื่อติดตั้งแล้วจะเปิดแยกเหมือนแอป และใช้ข้อความ เสียงที่บันทึกไว้ กับการฟังเสียงอัดย้อนหลังแบบออฟไลน์ได้"
    : "不是 App Store 包；装好后会像应用一样独立打开，文字、已缓存语音和录音回放可离线。");
  text("#ios-browser-warning", thai
    ? "ขณะนี้ไม่ได้เปิดใน Safari โปรดคัดลอกที่อยู่นี้ไปเปิดใน Safari แล้วทำตามขั้นตอนด้านล่าง"
    : "当前不是 Safari。请复制本页地址，在 Safari 打开后再按下面步骤操作。");
  const copies = thai
    ? ["ใน Safari แตะ “เพิ่มเติม” หรือ “แชร์” ด้านล่าง", "เลื่อนลงแล้วเลือก “เพิ่มไปยังหน้าจอโฮม”", "เปิด “เปิดเป็นเว็บแอป”", "แตะ “เพิ่ม” มุมขวาบน"]
    : ["在 Safari 底部点“更多”或“分享”", "向下找到“添加到主屏幕”", "打开“作为网页 App 打开”", "点右上角“添加”"];
  steps.forEach((node, index) => { node.textContent = copies[index]; });
  text("#copy-ios-install-link", thai ? "คัดลอกที่อยู่สำหรับ Safari" : "复制 Safari 地址");
  $("#ios-browser-warning").classList.toggle("hidden", isIosSafariBrowser());
  openSheet("ios-install-sheet");
}

async function copyIosInstallLink() {
  const url = new URL(location.href);
  url.searchParams.set("install", "ios");
  let copied = false;
  try {
    await navigator.clipboard.writeText(url.href);
    copied = true;
  } catch (_) {
    const field = document.createElement("textarea");
    field.value = url.href;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();
    try { copied = document.execCommand("copy"); } catch (_) { copied = false; }
    field.remove();
  }
  showToast(currentDirection === "zh-th"
    ? (copied ? "地址已复制，请粘贴到 Safari" : "复制失败，请长按浏览器地址栏复制")
    : (copied ? "คัดลอกแล้ว โปรดวางใน Safari" : "คัดลอกไม่ได้ โปรดคัดลอกจากแถบที่อยู่"));
}

async function installPwa() {
  if (window.HUILAISHI_NATIVE_IOS) {
    showToast(currentDirection === "zh-th" ? "当前已经是 iPhone / iPad 原生离线版" : "ขณะนี้เป็นแอป iPhone / iPad แบบออฟไลน์แล้ว");
    return;
  }
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    updateInstallUi();
    return;
  }
  const isIOS = isAppleMobileDevice();
  const isSingleFile = window.SINGLE_FILE_BUILD || location.protocol === "file:";
  if (isSingleFile) {
    showToast(currentDirection === "zh-th"
      ? (isIOS
        ? "iPhone 本地 HTML 可离线使用文字、核心语音和录音回放，但不能直接安装；请用 Safari 打开 HTTPS 地址再添加到主屏幕。语音识别取决于设备"
        : "此 HTML 可离线使用文字、核心语音和录音回放；要安装到主屏幕，请用 Chrome 打开 HTTPS 地址。语音识别取决于设备")
      : (isIOS
        ? "ไฟล์ HTML บน iPhone ใช้ข้อความ เสียงหลัก และฟังเสียงอัดแบบออฟไลน์ได้ แต่ติดตั้งตรง ๆ ไม่ได้ โปรดเปิด HTTPS ใน Safari แล้วเพิ่มไปหน้าจอโฮม การรู้จำเสียงขึ้นอยู่กับอุปกรณ์"
        : "ไฟล์นี้ใช้ข้อความ เสียงหลัก และฟังเสียงอัดแบบออฟไลน์ได้ หากต้องการติดตั้ง โปรดเปิด HTTPS ใน Chrome การรู้จำเสียงขึ้นอยู่กับอุปกรณ์"));
    return;
  }
  const secureWeb = location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1";
  if (isIOS && secureWeb) {
    openIosInstallGuide();
    return;
  }
  const message = currentDirection === "zh-th"
    ? isIOS
      ? "iPhone：Safari 点分享→添加到主屏幕；文字、缓存语音和录音回放可离线，语音识别依设备"
      : secureWeb
        ? "Android：打开 Chrome 菜单，选择“安装应用”或“添加到主屏幕”"
        : "安装需 HTTPS：当前局域网地址仅用于预览"
    : isIOS
      ? "iPhone: Safari → แชร์ → เพิ่มไปหน้าจอโฮม; ข้อความ เสียงที่บันทึกไว้ และเสียงอัดย้อนหลังใช้ออฟไลน์ได้ ส่วนการรู้จำเสียงขึ้นอยู่กับอุปกรณ์"
      : secureWeb
        ? "Android: เปิดเมนู Chrome แล้วเลือก “ติดตั้งแอป” หรือ “เพิ่มไปยังหน้าจอโฮม”"
        : "การติดตั้งต้องใช้ HTTPS; ลิงก์ Wi‑Fi นี้ใช้พรีวิวเท่านั้น";
  showToast(message);
}

function applyOfflineWorkerMessage(message) {
  if (!message || message.version !== OFFLINE_CACHE_VERSION) return false;
  if (!navigator.serviceWorker?.controller) {
    setOfflineCacheState("preparing", message);
    return false;
  }
  if (message.type === "OFFLINE_PROGRESS") {
    if (message.phase === "audio") {
      coreAudioRequested = true;
      setOfflineCacheState("base-ready", {
      coreCompleted: message.completed,
      coreTotal: message.total,
      bytesCompleted: message.bytesCompleted,
      bytesTotal: message.bytesTotal,
      failed: message.failed,
      paused: Boolean(message.paused)
      });
    } else {
      shellPreparationRequested = true;
      setOfflineCacheState("preparing", message);
    }
    return true;
  }
  if (message.type !== "OFFLINE_STATUS") return false;
  coreAudioRequested = false;
  shellPreparationRequested = false;
  if (message.fullReady && message.phase === "full-ready") setOfflineCacheState("ready", message);
  else if (message.baseReady) setOfflineCacheState("base-ready", message);
  else setOfflineCacheState("preparing", message);
  if (message.baseReady && !message.fullReady && coreAudioUserStartedThisLoad && !coreAudioAttemptedThisLoad && navigator.onLine) {
    setTimeout(() => startCoreAudioDownload(), 0);
  }
  return true;
}

function askServiceWorker(message, timeoutMs = 3000) {
  const controller = navigator.serviceWorker?.controller;
  if (!controller) return Promise.resolve(null);
  return new Promise(resolve => {
    const channel = new MessageChannel();
    const timeout = setTimeout(() => resolve(null), timeoutMs);
    channel.port1.onmessage = event => {
      clearTimeout(timeout);
      resolve(event.data || null);
    };
    try { controller.postMessage(message, [channel.port2]); }
    catch (_) { clearTimeout(timeout); resolve(null); }
  });
}

function startCoreAudioDownload(force = false) {
  const controller = navigator.serviceWorker?.controller;
  if (!controller || !navigator.onLine || !coreAudioUserStartedThisLoad || coreAudioRequested || (!force && coreAudioAttemptedThisLoad)) return;
  coreAudioRequested = true;
  coreAudioAttemptedThisLoad = true;
  setOfflineCacheState("base-ready", { ...offlineCacheDetail, paused: false });
  controller.postMessage({ type: force ? "RETRY_CORE_AUDIO" : "CACHE_CORE_AUDIO", version: OFFLINE_CACHE_VERSION });
}

function beginCoreAudioDownload() {
  if (!navigator.onLine) {
    showToast(currentDirection === "zh-th" ? "请联网后再下载核心语音" : "โปรดเชื่อมต่ออินเทอร์เน็ตก่อนดาวน์โหลดเสียงหลัก");
    return;
  }
  const network = networkCostState();
  writeCoreAudioConsent("accepted");
  coreAudioUserStartedThisLoad = true;
  coreAudioMeteredOverrideThisLoad = network.constrained;
  coreAudioRequested = false;
  coreAudioAttemptedThisLoad = false;
  startCoreAudioDownload(true);
  renderOfflineAudioUi();
  showToast(currentDirection === "zh-th"
    ? (network.constrained ? "已按你的确认使用当前网络下载，可随时暂停" : "已开始下载核心语音，可随时暂停")
    : (network.constrained ? "เริ่มดาวน์โหลดผ่านเครือข่ายปัจจุบันตามที่ยืนยันแล้ว หยุดได้ทุกเมื่อ" : "เริ่มดาวน์โหลดเสียงหลักแล้ว หยุดได้ทุกเมื่อ"));
}

async function pauseCoreAudioDownload({ quiet = false } = {}) {
  coreAudioUserStartedThisLoad = false;
  coreAudioRequested = false;
  if (!navigator.serviceWorker?.controller) {
    renderOfflineAudioUi();
    if (!quiet) showToast(currentDirection === "zh-th" ? "下载尚未开始" : "ยังไม่ได้เริ่มดาวน์โหลด");
    return;
  }
  const status = await askServiceWorker({ type: "PAUSE_CORE_AUDIO", version: OFFLINE_CACHE_VERSION }, 10000);
  if (status) applyOfflineWorkerMessage(status);
  else setOfflineCacheState("base-ready", { ...offlineCacheDetail, paused: true });
  if (!quiet) showToast(currentDirection === "zh-th" ? "核心语音已暂停，已下载部分会保留" : "หยุดเสียงหลักชั่วคราวแล้ว ส่วนที่ดาวน์โหลดเสร็จจะยังอยู่");
}

async function declineCoreAudioDownload() {
  writeCoreAudioConsent("declined");
  await pauseCoreAudioDownload({ quiet: true });
  renderOfflineAudioUi();
  showToast(currentDirection === "zh-th" ? "已暂缓下载；文字、课程和对话仍可离线使用" : "พักการดาวน์โหลดไว้ ข้อความ บทเรียน และบทสนทนายังใช้ออฟไลน์ได้");
}

async function clearCoreAudioDownload(event) {
  const button = event?.currentTarget || $("#core-audio-clear");
  if (button?.dataset.confirm !== "1") {
    clearTimeout(coreAudioClearConfirmTimer);
    button.dataset.confirm = "1";
    button.textContent = currentDirection === "zh-th" ? "再点一次确认删除" : "แตะอีกครั้งเพื่อยืนยันลบ";
    coreAudioClearConfirmTimer = setTimeout(() => {
      if (!button?.isConnected) return;
      delete button.dataset.confirm;
      renderOfflineAudioUi();
    }, 3200);
    return;
  }
  clearTimeout(coreAudioClearConfirmTimer);
  delete button.dataset.confirm;
  coreAudioUserStartedThisLoad = false;
  coreAudioRequested = false;
  writeCoreAudioConsent("declined");
  const status = await askServiceWorker({ type: "CLEAR_CORE_AUDIO", version: OFFLINE_CACHE_VERSION }, 15000);
  if (status) applyOfflineWorkerMessage(status);
  else setOfflineCacheState("base-ready", { ...offlineCacheDetail, coreCompleted: 0, bytesCompleted: 0, fullReady: false, paused: true });
  showToast(currentDirection === "zh-th" ? "核心语音已从这台设备删除，可随时重新下载" : "ลบเสียงหลักออกจากอุปกรณ์แล้ว ดาวน์โหลดใหม่ได้ทุกเมื่อ");
}

function downloadLearningData() {
  try {
    const payload = buildHuilaishiLocalDataExport(safeStorage, { appVersion: "12.6.0" });
    const serialized = `${JSON.stringify(payload, null, 2)}\n`;
    const source = URL.createObjectURL(new Blob([serialized], { type: "application/json;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = source;
    anchor.download = `huilaishi-learning-data-${payload.exportedAt.slice(0, 10)}.json`;
    anchor.rel = "noopener";
    anchor.hidden = true;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(source), 1000);
    showToast(currentDirection === "zh-th"
      ? `已导出 ${Object.keys(payload.localStorage).length} 项本机学习数据；不含麦克风录音`
      : `ส่งออกข้อมูลการเรียนในเครื่อง ${Object.keys(payload.localStorage).length} รายการแล้ว ไม่รวมเสียงไมโครโฟน`);
  } catch (_) {
    showToast(currentDirection === "zh-th"
      ? "浏览器未能生成下载文件；数据没有上传或离开本机"
      : "เบราว์เซอร์สร้างไฟล์ดาวน์โหลดไม่สำเร็จ ข้อมูลไม่ได้อัปโหลดหรือออกจากอุปกรณ์");
  }
}

function enterFreshDirectionSelection(resultMessage, hasWarning = false) {
  stopPracticeRecording({ discard: true, reason: "local-data-clear" });
  stopLocalRecognition();
  closeSheets();
  currentMode = 1;
  pendingMode = 1;
  previousMode = 1;
  riskAccepted = false;
  thaiSpeakerProfile = "female";
  speechPace = "clear";
  window.HUILAISHI_SPEECH?.setPace?.(speechPace);
  pendingDirection = null;
  $("#close-direction").classList.add("hidden");
  $("#direction-screen").classList.remove("hidden");
  $("#onboarding").classList.add("hidden");
  $("#main-app").classList.add("hidden");
  $("#lesson").classList.add("hidden");
  $$(".direction-card").forEach(card => {
    card.classList.remove("selected");
    card.setAttribute("aria-pressed", "false");
  });
  $("#direction-continue").disabled = true;
  text("#direction-cta", "请选择学习方向 · เลือกเส้นทางการเรียน");
  const status = $("#direction-data-status");
  status.textContent = resultMessage;
  status.classList.remove("hidden");
  status.classList.toggle("has-warning", hasWarning);
  requestAnimationFrame(() => status.focus());
}

async function confirmClearLearningData() {
  if (localDataClearInProgress) return;
  localDataClearInProgress = true;
  const isZh = currentDirection === "zh-th";
  const confirm = $("#confirm-clear-learning-data");
  const cancel = $("#cancel-clear-learning-data");
  const close = $("#data-clear-sheet [data-close-sheet]");
  const progress = $("#data-clear-status");
  confirm.disabled = true;
  cancel.disabled = true;
  close.disabled = true;
  confirm.setAttribute("aria-busy", "true");
  text("#confirm-clear-learning-data", isZh ? "正在清除…" : "กำลังล้าง…");
  progress.classList.remove("hidden");
  progress.textContent = isZh
    ? "正在清除已登记的学习键，并请求删除设备缓存…"
    : "กำลังล้างคีย์การเรียนที่ระบุไว้และส่งคำขอลบแคชในอุปกรณ์…";

  stopPracticeRecording({ discard: true, reason: "local-data-clear" });
  stopLocalRecognition();
  const voiceManager = window.HUILAISHI_VOICE_PACKS;
  const hasVoiceManager = typeof voiceManager?.deleteAll === "function";
  const hasCoreController = Boolean(navigator.serviceWorker?.controller);
  const singleFile = Boolean(window.SINGLE_FILE_BUILD) || location.protocol === "file:";
  const voiceTask = hasVoiceManager ? voiceManager.deleteAll() : Promise.resolve({ skipped: true });
  const coreTask = hasCoreController
    ? askServiceWorker({ type: "CLEAR_CORE_AUDIO", version: OFFLINE_CACHE_VERSION }, 15000)
    : Promise.resolve({ skipped: true });
  const [voiceOutcome, coreOutcome] = await Promise.allSettled([voiceTask, coreTask]);

  let storageReadable = true;
  try { void safeStorage.length; } catch (_) { storageReadable = false; }
  const localResult = storageReadable
    ? clearHuilaishiLocalData(safeStorage)
    : { attemptedKeys: [], removedKeys: [], failedKeys: ["localStorage"] };
  const voiceFailed = hasVoiceManager && voiceOutcome.status === "rejected";
  const coreAcknowledged = hasCoreController && coreOutcome.status === "fulfilled" && coreOutcome.value && !coreOutcome.value.skipped;
  const coreFailed = hasCoreController && !coreAcknowledged;
  if (coreAcknowledged) applyOfflineWorkerMessage(coreOutcome.value);
  window.VoicePackUI?.refresh?.();

  const issueZh = [];
  const issueTh = [];
  if (localResult.failedKeys.length) {
    issueZh.push(`${localResult.failedKeys.length} 个学习键清除失败`);
    issueTh.push(`ล้างคีย์การเรียนไม่สำเร็จ ${localResult.failedKeys.length} รายการ`);
  }
  if (voiceFailed) {
    issueZh.push("分级声包删除失败");
    issueTh.push("ลบชุดเสียงตามระดับไม่สำเร็จ");
  } else if (!hasVoiceManager) {
    issueZh.push("分级声包缓存状态未能确认");
    issueTh.push("ยังยืนยันสถานะแคชชุดเสียงตามระดับไม่ได้");
  }
  if (coreFailed) {
    issueZh.push("核心语音缓存未确认删除");
    issueTh.push("ยังยืนยันการลบแคชเสียงหลักไม่ได้");
  }
  const hasWarning = issueZh.length > 0;
  let resultMessage;
  if (hasWarning) {
    resultMessage = `已清除 ${localResult.removedKeys.length} 项本机学习数据；${issueZh.join("；")}。可选方向后到“我的”重试。 / ล้างข้อมูลการเรียนในเครื่องแล้ว ${localResult.removedKeys.length} รายการ; ${issueTh.join("; ")} เลือกเส้นทางแล้วลองใหม่ที่หน้า “ฉัน”`;
  } else {
    const cacheNoteZh = singleFile
      ? "单文件内置语音属于应用文件本身，不是可清除的设备缓存"
      : hasCoreController ? "已收到核心语音缓存清除确认" : "当前未发现受控的核心语音缓存";
    const cacheNoteTh = singleFile
      ? "เสียงที่ฝังในไฟล์เดี่ยวเป็นส่วนหนึ่งของไฟล์แอป ไม่ใช่แคชอุปกรณ์ที่ล้างได้"
      : hasCoreController ? "ได้รับการยืนยันล้างแคชเสียงหลักแล้ว" : "ไม่พบแคชเสียงหลักที่แอปควบคุมในขณะนี้";
    resultMessage = `已清除 ${localResult.removedKeys.length} 项本机学习数据与可管理的分级声包；${cacheNoteZh}。 / ล้างข้อมูลการเรียนในเครื่อง ${localResult.removedKeys.length} รายการและชุดเสียงที่จัดการได้แล้ว; ${cacheNoteTh}`;
  }
  localDataClearInProgress = false;
  confirm.removeAttribute("aria-busy");
  confirm.disabled = false;
  cancel.disabled = false;
  close.disabled = false;
  enterFreshDirectionSelection(resultMessage, hasWarning);
}

function handleNetworkCostChange() {
  const network = networkCostState();
  renderOfflineAudioUi();
  if (coreAudioRequested && network.constrained && !coreAudioMeteredOverrideThisLoad) {
    pauseCoreAudioDownload({ quiet: true });
    showToast(currentDirection === "zh-th" ? "检测到省流量或蜂窝网络，下载已暂停" : "ตรวจพบโหมดประหยัดข้อมูลหรือเครือข่ายมือถือ จึงหยุดดาวน์โหลดชั่วคราว");
  }
  if (!network.constrained) coreAudioMeteredOverrideThisLoad = false;
}

function startOfflineShellPreparation(force = false) {
  const controller = navigator.serviceWorker?.controller;
  if (!controller || !navigator.onLine || shellPreparationRequested || (!force && shellPreparationAttemptedThisLoad)) return;
  shellPreparationRequested = true;
  shellPreparationAttemptedThisLoad = true;
  controller.postMessage({ type: "PREPARE_OFFLINE_SHELL", version: OFFLINE_CACHE_VERSION });
}

function retryCoreAudioDownload() {
  const detail = offlineCacheDetail || {};
  if (offlineCacheState === "preparing" && detail.shellTotal && detail.shellCompleted < detail.shellTotal) {
    if (!navigator.onLine) {
      showToast(offlineConfig()?.ui?.offlineAudioNeedNetwork || "请联网后继续下载");
      return;
    }
    shellPreparationRequested = false;
    shellPreparationAttemptedThisLoad = false;
    startOfflineShellPreparation(true);
    showToast(offlineConfig()?.ui?.offlineShellRetrying || "正在继续缓存基础应用");
    return;
  }
}

async function requestOfflineStatus() {
  if (!navigator.serviceWorker?.controller) {
    setOfflineCacheState("preparing", {});
    return null;
  }
  const status = await askServiceWorker({ type: "GET_OFFLINE_STATUS", version: OFFLINE_CACHE_VERSION });
  if (!status || !applyOfflineWorkerMessage(status)) {
    setOfflineCacheState("preparing", {});
    return null;
  }
  if (!status.baseReady) startOfflineShellPreparation();
  return status;
}

async function setupPwa() {
  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    updateInstallUi();
  });
  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    updateInstallUi();
    showToast(currentDirection === "zh-th" ? "离线版已安装到桌面" : "ติดตั้งเวอร์ชันออฟไลน์แล้ว");
  });
  if (window.SINGLE_FILE_BUILD || location.protocol === "file:") {
    setOfflineCacheState("file-ready", {});
    return;
  }
  if (/(?:^|[?&])nosw=1(?:&|$)/.test(location.search)) {
    setOfflineCacheState("unavailable", {});
    return;
  }
  if (!("serviceWorker" in navigator) || !window.isSecureContext || !/^https?:$/.test(location.protocol)) {
    setOfflineCacheState("unavailable", {});
    return;
  }
  setOfflineCacheState("preparing", {});
  navigator.serviceWorker.addEventListener("message", event => applyOfflineWorkerMessage(event.data));
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    coreAudioRequested = false;
    coreAudioAttemptedThisLoad = false;
    shellPreparationRequested = false;
    shellPreparationAttemptedThisLoad = false;
    requestOfflineStatus();
  });
  try {
    serviceWorkerRegistration = await navigator.serviceWorker.register("./service-worker.js", { updateViaCache: "none" });
    await navigator.serviceWorker.ready;
    await requestOfflineStatus();
  } catch (_) {
    setOfflineCacheState("unavailable", {});
  }
}

function showToast(message) {
  clearTimeout(toastTimer);
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  toastTimer = setTimeout(() => toast.classList.add("hidden"), 2400);
}

function bindEvents() {
  $("#direction-cards").addEventListener("click", event => {
    const card = event.target.closest(".direction-card");
    if (card) enterSelectedDirection(card.dataset.direction);
  });
  $("#direction-continue").addEventListener("click", () => {
    enterSelectedDirection();
  });
  $("#back-to-direction").addEventListener("click", showDirection);
  $("#header-direction").addEventListener("click", showDirection);
  $("#switch-direction").addEventListener("click", showDirection);
  $("#close-direction").addEventListener("click", () => returnToPreviousAppRoute("home"));
  $("#main-menu-direction").addEventListener("click", showDirection);
  $("#main-menu-mode").addEventListener("click", () => openSheet("mode-sheet"));
  $("#main-menu-lesson").addEventListener("click", startLesson);

  $("#open-mode-picker").addEventListener("click", () => openSheet("mode-sheet"));
  $("#change-mode").addEventListener("click", () => openSheet("mode-sheet"));
  $("#mode-list").addEventListener("click", event => {
    const button = event.target.closest(".mode-option");
    if (button) {
      if (Number(button.dataset.mode) === 4 && !riskAccepted) event.stopPropagation();
      selectPendingMode(Number(button.dataset.mode), "sheet");
    }
  });
  $("#setup-mode-list").addEventListener("click", event => {
    const button = event.target.closest(".setup-mode-option");
    if (button) {
      if (Number(button.dataset.setupMode) === 4 && !riskAccepted) event.stopPropagation();
      selectPendingMode(Number(button.dataset.setupMode), "setup");
    }
  });
  $("#confirm-mode").addEventListener("click", () => {
    applyMode(pendingMode);
    closeSheets();
    showToast(`${config().ui.modeToast}「${registerName(currentMode)}」`);
  });
  $("#accept-risk").addEventListener("click", () => {
    riskAccepted = true;
    closeSheets();
    pendingMode = 4;
    if (riskSelectionSource === "setup") previewPendingMode(4);
    renderModeList();
    if (riskSelectionSource === "setup") {
      revealOnboardingPreview();
    } else if (riskSelectionSource === "slider") {
      renderVibePreview(4);
    } else {
      applyMode(4);
      showToast(`${config().ui.modeToast}「${registerName(currentMode)}」`);
    }
  });
  $("#modal-backdrop").addEventListener("click", () => {
    if (!localDataClearInProgress) closeSheets();
  });
  document.addEventListener("keydown", handleSheetKeydown);
  $$('[data-close-sheet]').forEach(button => button.addEventListener("click", () => { pendingMode = previousMode; closeSheets(); }));
  $("#show-method").addEventListener("click", () => openSheet("info-sheet"));
  $("#show-about").addEventListener("click", () => openSheet("about-sheet"));
  $("#export-learning-data").addEventListener("click", downloadLearningData);
  $("#clear-learning-data").addEventListener("click", () => {
    $("#data-clear-status").classList.add("hidden");
    $("#data-clear-status").textContent = "";
    $("#confirm-clear-learning-data").disabled = false;
    $("#cancel-clear-learning-data").disabled = false;
    $("#data-clear-sheet [data-close-sheet]").disabled = false;
    renderLocalDataManagementUi();
    openSheet("data-clear-sheet");
  });
  $("#confirm-clear-learning-data").addEventListener("click", confirmClearLearningData);
  $(".speaker-form-options").addEventListener("click", event => {
    const button = event.target.closest("[data-speaker-profile]");
    if (button) selectThaiSpeakerProfile(button.dataset.speakerProfile);
  });
  $(".speech-pace-options").addEventListener("click", event => {
    const button = event.target.closest("[data-speech-pace]");
    if (button) selectSpeechPace(button.dataset.speechPace, button);
  });

  $("#start-app").addEventListener("click", () => {
    if (!onboardingPreviewAcknowledged) {
      revealOnboardingPreview();
      return;
    }
    setOnboardingStage("confirm", true, onboardingIsFirstRun ? "replace" : "push");
  });
  $("#confirm-back-mode").addEventListener("click", () => setOnboardingStage("select"));
  $("#confirm-start-task").addEventListener("click", () => {
    applyMode(pendingMode);
    safeStorage.setItem(onboardingKey(), "1");
    // The first lesson should close back to the real home, never back into a
    // completed onboarding step. Put home directly underneath lesson in the
    // in-app history stack before the lesson creates its own entry.
    rememberAppRoute("home", "root");
    playAlaiVoice("intro");
    startLesson();
  });
  $("#confirm-play").addEventListener("click", event => {
    const example = comparisonExample(pendingMode);
    const track = registerLevel(pendingMode)?.followMode === "recognition-only" ? "character" : "standard";
    speakText(example.target, config().targetLang, .84, { track, element: event.currentTarget });
  });
  $("#confirm-play-slow").addEventListener("click", event => {
    const example = comparisonExample(pendingMode);
    const track = registerLevel(pendingMode)?.followMode === "recognition-only" ? "character" : "standard";
    speakText(example.target, config().targetLang, .64, { track, element: event.currentTarget });
  });
  $("#setup-preview-play").addEventListener("click", event => {
    const example = comparisonExample(pendingMode);
    const track = registerLevel(pendingMode)?.followMode === "recognition-only" ? "character" : "standard";
    speakText(example.target, config().targetLang, .84, { track, element: event.currentTarget });
  });
  $("#setup-preview-slow").addEventListener("click", event => {
    const example = comparisonExample(pendingMode);
    const track = registerLevel(pendingMode)?.followMode === "recognition-only" ? "character" : "standard";
    speakText(example.target, config().targetLang, .64, { track, element: event.currentTarget });
  });
  $("#peek-home").addEventListener("click", () => { safeStorage.setItem(onboardingKey(), "1"); playAlaiVoice("intro"); navigate("home"); });
  $("#reset-onboarding").addEventListener("click", showOnboarding);
  $("#home-change-mode").addEventListener("click", () => openSheet("mode-sheet"));
  $$('[data-nav]').forEach(button => button.addEventListener("click", () => navigate(button.dataset.nav)));

  $("#vibe-slider").addEventListener("input", event => {
    const index = Number(event.target.value) - 1;
    if (index === 4 && !riskAccepted) {
      event.target.value = previewMode + 1;
      previousMode = currentMode;
      riskSelectionSource = "slider";
      updateRiskAcceptLabel("slider");
      openSheet("warning-sheet");
      return;
    }
    renderVibePreview(index);
  });
  $("#vibe-ticks").addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button) return;
    const index = Number(button.dataset.index);
    if (index === 4 && !riskAccepted) {
      event.stopPropagation();
      previousMode = currentMode;
      riskSelectionSource = "slider";
      updateRiskAcceptLabel("slider");
      openSheet("warning-sheet");
      playAlaiVoice("risk");
      return;
    }
    renderVibePreview(index);
  });
  $("#commit-vibe-mode").addEventListener("click", () => {
    const selected = previewMode;
    applyMode(selected);
    showToast(currentDirection === "zh-th"
      ? `整套课程已切换为「${gradeForMode(selected)} · ${registerName(selected)}」`
      : `เปลี่ยนบทเรียนทั้งหมดเป็น「${gradeForMode(selected)} · ${registerName(selected)}」แล้ว`);
    const title = $("#vibe-name");
    if (title) title.tabIndex = -1;
    requestAnimationFrame(() => {
      try { title?.focus?.({ preventScroll: true }); }
      catch (_) { title?.focus?.(); }
    });
  });
  $("#speak-vibe").addEventListener("click", event => {
    const example = comparisonExample(previewMode);
    speakText(example.target, config().targetLang, .84, { track: previewMode === 4 ? "character" : "standard", element: event.currentTarget });
  });
  $("#speak-vibe-slow").addEventListener("click", event => {
    const example = comparisonExample(previewMode);
    speakText(example.target, config().targetLang, .64, { track: previewMode === 4 ? "character" : "standard", element: event.currentTarget });
  });

  $("#open-partner").addEventListener("click", event => {
    if (event.target.closest("#partner-audio, #partner-cta")) return;
    openPartnerRelay();
  });
  $("#partner-cta").addEventListener("click", openPartnerRelay);
  $("#partner-audio").addEventListener("click", event => {
    event.stopPropagation();
    const data = config().partner;
    speakText(data.audioText, data.audioLang);
  });
  $("#relay-choices").addEventListener("click", event => {
    const choice = event.target.closest(".relay-choice");
    if (choice) chooseRelay(Number(choice.dataset.relay));
  });
  $("#finish-relay").addEventListener("click", finishRelay);

  $("#start-lesson").addEventListener("click", startLesson);
  $("#route-convenience").addEventListener("click", startLesson);
  $("#close-lesson").addEventListener("click", () => {
    window.PronunciationScorer?.cancelChallenge?.();
    returnToPreviousAppRoute("home");
  });
  $("#speak-npc").addEventListener("click", event => {
    const step = curriculumLessons()[lessonStep];
    speakText(step.audioTarget || step.npc, config().targetLang, .82, { track: step.audioTrack || "standard", element: event.currentTarget });
  });
  $("#answer-list").addEventListener("click", event => {
    const audioButton = event.target.closest("[data-answer-audio]");
    if (audioButton) {
      event.stopPropagation();
      if (audioButton.disabled) return;
      const answer = curriculumLessons()[lessonStep]?.answers?.[Number(audioButton.dataset.answerAudio)];
      if (answer?.text) speakText(answer.text, answer.target ? config().targetLang : config().interfaceLang, .84, { track: "standard", element: audioButton });
      return;
    }
    const button = event.target.closest("button");
    if (button?.matches("[data-answer]")) selectLessonAnswer(Number(button.dataset.answer));
  });
  $("#lesson-next").addEventListener("click", checkOrContinueLesson);
  $("#lesson-feedback").addEventListener("click", event => {
    const voiceButton = event.target.closest("[data-lesson-voice]");
    if (voiceButton) {
      const action = voiceButton.dataset.lessonVoice;
      if (action === "demo" && lessonVoiceGate?.target) speakText(lessonVoiceGate.target, lessonVoiceGate.lang, .76, { track: "standard", element: voiceButton });
      if (action === "start") runLessonVoiceGate();
      if (action === "network") runLessonVoiceGate({ allowNetwork: true });
      if (action === "practice") completeLessonVoicePractice();
      return;
    }
    const compareButton = event.target.closest("[data-lesson-compare]");
    if (!compareButton) return;
    const pair = curriculumLessons()[lessonStep]?.comparePair;
    const line = compareButton.dataset.lessonCompare === "safe" ? pair?.safe : pair?.source;
    if (line?.target) speakText(line.target, config().targetLang, .82, { track: "standard", element: compareButton });
  });

  $("#route-details").addEventListener("click", () => showToast(config().ui.routeToast));
  $("#library-filters").addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button) return;
    $$("#library-filters button").forEach(item => {
      item.classList.toggle("active", item === button);
      item.setAttribute("aria-pressed", String(item === button));
    });
    renderPhrases(button.dataset.filter);
  });
  $("#phrase-list").addEventListener("click", event => {
    const button = event.target.closest(".phrase-audio");
    if (button) speakText(decodeURIComponent(button.dataset.phrase), config().targetLang, .84, { track: button.dataset.track || "standard", element: button });
  });
  $("#battle-options").addEventListener("click", event => {
    const button = event.target.closest("button");
    if (button) chooseBattle(Number(button.dataset.battle));
  });
  $("#battle-source-audio").addEventListener("click", event => {
    if (currentBattleQuiz?.source?.target) speakText(currentBattleQuiz.source.target, config().targetLang, .84, { track: "character", element: event.currentTarget });
  });
  $("#pass-phone").addEventListener("click", openLocalBattle);
  $("#start-pass").addEventListener("click", openLocalBattle);

  $("#scenario-strip").addEventListener("click", event => {
    const button = event.target.closest("[data-scene]");
    if (button) startLiveScenario(Number(button.dataset.scene));
  });
  $("#live-reset").addEventListener("click", () => startLiveScenario(liveScenarioIndex, false));
  $("#conversation-listen").addEventListener("click", () => {
    if (lastNpcLine) speakText(lastNpcLine.target, config().targetLang, .78);
  });
  $("#quick-replies").addEventListener("click", event => {
    const previewButton = event.target.closest("[data-live-preview]");
    if (previewButton) {
      const option = offlineOptionForSpeaker(offlineConfig().scenarios[liveScenarioIndex].options[Number(previewButton.dataset.livePreview)]);
      if (option) speakText(option.target, config().targetLang, .84, { track: "character", element: previewButton });
      return;
    }
    const optionButton = event.target.closest("[data-live-option]");
    if (optionButton) {
      const option = offlineOptionForSpeaker(offlineConfig().scenarios[liveScenarioIndex].options[Number(optionButton.dataset.liveOption)]);
      if (option) sendLiveOption(option);
      return;
    }
    const actionButton = event.target.closest("[data-live-action]");
    if (actionButton) handleLiveAction(actionButton.dataset.liveAction);
  });
  $("#live-send").addEventListener("click", () => submitLiveInput());
  $("#live-input").addEventListener("keydown", event => {
    if (event.key === "Enter") { event.preventDefault(); submitLiveInput(); }
  });
  $("#install-voice-pack").addEventListener("click", installLocalVoicePack);
  $("#start-local-voice").addEventListener("click", startLocalVoice);
  $("#record-practice").addEventListener("click", togglePracticeRecording);
  $("#install-app").addEventListener("click", installPwa);
  $("#copy-ios-install-link").addEventListener("click", copyIosInstallLink);
  $("#core-audio-download").addEventListener("click", beginCoreAudioDownload);
  $("#core-audio-pause").addEventListener("click", () => pauseCoreAudioDownload());
  $("#core-audio-clear").addEventListener("click", clearCoreAudioDownload);
  $("#core-audio-decline").addEventListener("click", declineCoreAudioDownload);
  $("#offline-capability").addEventListener("click", retryCoreAudioDownload);
  $("#offline-capability").addEventListener("keydown", event => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    retryCoreAudioDownload();
  });
  $("#preview-alai-voice").addEventListener("click", () => playAlaiVoice("intro"));
  $("#preview-sugarblade-voice").addEventListener("click", () => playSugarBladeVoice("mode"));
  window.addEventListener("online", () => {
    updateNetworkStatus();
    coreAudioRequested = false;
    coreAudioAttemptedThisLoad = false;
    shellPreparationRequested = false;
    shellPreparationAttemptedThisLoad = false;
    if (networkCostState().constrained && !coreAudioMeteredOverrideThisLoad) coreAudioUserStartedThisLoad = false;
    requestOfflineStatus();
  });
  window.addEventListener("offline", updateNetworkStatus);
  window.addEventListener("popstate", handleApplicationPopState);
  const connection = networkCostState().connection;
  connection?.addEventListener?.("change", handleNetworkCostChange);
  window.addEventListener("pagehide", () => {
    stopPracticeRecording({ discard: true, reason: "pagehide" });
    stopLocalRecognition();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "hidden") return;
    stopPracticeRecording({ discard: true, reason: "hidden" });
    stopLocalRecognition();
  });
}

function enforceTopLevelContext() {
  let framed = false;
  try { framed = window.top !== window.self; } catch (_) { framed = true; }
  if (!framed) return false;
  // The Samsung V60 recovery entry intentionally keeps the app inside its
  // same-origin stability frame. It already provides its own visible fallback,
  // so the generic "open in another browser" notice would reintroduce the
  // blank-tab path this mode exists to avoid.
  if (/(?:^|[?&])from=samsung-current(?:&|$)/.test(location.search)) return false;
  const guard = $("#frame-guard");
  // In-app Android browsers and QR scanners may legitimately embed the page.
  // Keep the app interactive; this is a small escape hatch, not a modal wall.
  $("#frame-guard-link").href = location.href;
  guard.setAttribute("role", "status");
  guard.removeAttribute("aria-modal");
  guard.classList.add("embedded-notice");
  guard.classList.remove("hidden");
  $("#app").addEventListener("pointerdown", () => guard.classList.add("hidden"), { once: true });
  return false;
}

function init() {
  enforceTopLevelContext();
  bindEvents();
  thaiSpeakerProfile = readThaiSpeakerProfile();
  speechPace = readSpeechPace();
  window.HUILAISHI_SPEECH?.setPace?.(speechPace);
  window.PronunciationCourse?.init?.({
    direction: () => currentDirection,
    mount: "#pronunciation-pane",
    launcher: false,
    speak: (value, lang, rate) => {
      stopAlaiVoice();
      const family = String(lang || "").toLowerCase().startsWith("th") ? "th" : "zh";
      const clearRate = Number(rate) <= .7 ? (family === "th" ? .74 : .76) : (family === "th" ? .84 : .9);
      return window.HUILAISHI_SPEECH?.speak?.(value, { lang, rate: clearRate }) || speakText(value, lang, clearRate);
    }
  });
  window.PronunciationScorer?.init?.({ root: "#pronunciation-pane" });
  const storedDirection = safeStorage.getItem("learningDirection");
  currentDirection = product[storedDirection] ? storedDirection : "zh-th";
  applyDirection(currentDirection, false);
  if (product[storedDirection]) selectDirection(storedDirection, false);
  else {
    pendingDirection = null;
    $$(".direction-card").forEach(card => card.classList.remove("selected"));
    $("#direction-continue").disabled = true;
  }
  const samsungStableEntry = /(?:^|[?&])from=samsung-current(?:&|$)/.test(location.search);
  // The recovery wrapper may inherit a stale history.state from the blank tab
  // that led to it. Always begin at the real main menu without touching saved
  // progress, direction, register grade, or statistics.
  const historyRoute = samsungStableEntry ? null : normalizeAppRoute(history.state?.[APP_HISTORY_STATE_KEY]);
  const reloadRoute = !samsungStableEntry && shouldRestoreSessionRoute() ? readSessionAppRoute() : null;
  const defaultRoute = "home";
  const requestedRoute = historyRoute || reloadRoute || defaultRoute;
  const restoredRoute = restoreApplicationRoute(requestedRoute);
  rememberAppRoute(restoredRoute, "replace");
  setupPwa();
  const installRequest = new URLSearchParams(location.search).get("install");
  const alreadyInstalled = window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
  if (installRequest === "ios" && isAppleMobileDevice() && !alreadyInstalled && /^https?:$/.test(location.protocol)) {
    setTimeout(openIosInstallGuide, 180);
  }
  document.documentElement.dataset.appReady = "true";
}

document.addEventListener("DOMContentLoaded", init);
