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
    brand: "泰会来事",
    mark: "ท",
    directionLabel: "中文 → ไทย",
    setup: {
      tag: "泰语语境训练场 · BETA",
      eyebrow: "同一句泰语 · 五种说法",
      title: "你今天想<br><em>多有素质？</em>",
      lede: "选的是说话的语域，不是给你贴标签。<br>从见老板到混江湖，都能学。",
      signA: "พูดให้เป็น",
      signB: "曼谷 · 01",
      picker: "我的开局人设",
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
        code: "S2", short: "痞气", name: "街头痞气", desc: "死党互损 · 强口语", risk: "容易显冲",
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
      partnerEyebrow: "今晚的互助搭子", partnerHeading: "一句换一句", partnerStreak: "互助 3 天",
      vibeEyebrow: "王牌玩法", vibeHeading: "一句五说", vibeInfo: "只评价说法", currentMode: "当前人设", intent: "你想说：“请给我一瓶水”", reaction: "店员反应", consoleSafe: "有素质", consoleTitle: "素质调音台", consoleRisk: "放飞",
      routeEyebrow: "学习地图", routeTitle: "曼谷生存线", routeDetails: "全部 12 站", routeStops: ["落地","便利店","咖啡店","出租车"],
      skillNote: "你不是在背词，你在练判断", skills: ["礼貌表达","自然口语","街头听力","场景判断"],
      battleEyebrow: "10 秒一局", battleTitle: "场合判断战", battleSubtitle: "泰语说对只是 50 分，场合对才是真本事。", battleBadge: "突然袭击", personLabel: "人物", leagueLabel: "本周敢说榜", leagueValue: "青铜巷口 · 第 12 名",
      passTitle: "双人同机 · 传手机局", passCopy: "一个学泰语，一个学中文，轮流出题",
      libraryEyebrow: "已收录 40+ 句", libraryTitle: "人设话术库", librarySubtitle: "先选场合，再选你想呈现的气质。", filters: ["全部","日常","旅行","职场","朋友","高风险"],
      profileName: "阿泰同学", levelLabel: "学习段位：", level: "开口不怂", modePrefix: "常用人设 · ", abilityTitle: "语气能力谱", abilityWeek: "本周 +18", achievements: ["连续天数","开口次数","句卡收藏"],
      switchDirection: "切换学习方向", changeMode: "切换默认人设", method: "我们的“素质”原则", methodAction: "查看", prototype: "产品概念原型 · 内容需由泰语母语教师终审",
      nav: ["学习","对话","游戏","词库","我的"],
      missionFlowAria: "本课流程", missionFlow: ["先听懂","选分寸","开口说"], missionStart: "开始练 3 句",
      modeEyebrow: "素质档位", modeTitle: "选今天的人设", modeNote: "评价的是表达场合，不评价你这个人。", confirmMode: "用这个人设",
      lessonScene: "便利店 · 第 1 关", listen: "听店员说", check: "检查答案", next: "继续", reward: "领取战利品", wrongPrefix: "这句意思或场合不太对。",
      routeToast: "下一站「咖啡店别社死」将在完成本课后解锁",
      modeToast: "默认人设已切换为",
      lessonComplete: "通关！获得「便利店不社死」句卡 +30",
      playToast: "正在播放泰语", noVoice: "设备未安装泰语音色，使用系统语音",
      infoEyebrow: "设计原则", infoTitle: "“素质”到底是什么？", infoConfirm: "明白了"
    },
    warning: {
      title: "混人局，真能惹事",
      copy: "这里的内容用于<strong>听懂、防坑和剧情识别</strong>。S1 会故意使用可爱女生声线制造反差，但话本身仍可能造成严重冒犯。",
      label: "高危词示例", words: "กู · มึง · วะ · แม่ง", note: "只在极熟朋友或冲突语境中出现",
      accept: "我知道风险，继续选择", decline: "算了，做个体面人"
    },
    principles: [
      ["是语域，不是人格","同一句话对老板和对死党，本来就不该一样。"],
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
      kicker: "面对面双人模式", title: "把手机交给你的泰国朋友", copy: "你答泰语，TA 判定；下一题换 TA 答中文。题面交接时会自动遮住答案。", playerA: "中国玩家", roleA: "学泰语", playerB: "ผู้เล่นไทย", roleB: "เรียนจีน", start: "开始 3 题体验局", cancel: "稍后再玩", handoffTitle: "请把手机交给泰国玩家", handoffCopy: "答案已经遮住。交接完成后，由 TA 为你的泰语判定自然度。", reveal: "我拿好了，揭开第 1 题", toast: "双人局开始：第 1 题由中国玩家回答泰语"
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
      { level: 4, category: "travel", label: "旅行 · 万能", target: "ช่วยพูดช้า ๆ หน่อยได้ไหมครับ", roman: "chûai phûut châa-châa nɔ̀i dâi mái", meaning: "可以说慢一点吗？" },
      { level: 4, category: "travel", label: "旅行 · 问路", target: "ห้องน้ำอยู่ไหนครับ", roman: "hông-náam yùu nǎi", meaning: "洗手间在哪里？" },
      { level: 3, category: "friend", label: "朋友 · 约饭", target: "ไปกินข้าวกันไหม", roman: "pai kin khâao kan mái", meaning: "一起去吃饭吗？" },
      { level: 3, category: "friend", label: "朋友 · 告别", target: "เดี๋ยวเจอกันนะ", roman: "dǐao jəə kan ná", meaning: "待会儿见。" },
      { level: 2, category: "friend", label: "死党 · 惊讶", target: "เอาจริงดิ", roman: "ao jing dì", meaning: "真的假的？" },
      { level: 2, category: "risk", label: "挖苦语气", target: "เออ เก่งมากมั้ง", roman: "əə kèng mâak máng", meaning: "行，你可真厉害啊。（挖苦）" },
      { level: 1, category: "risk", label: "听懂保命", target: "มึงจะเอาไงวะ", roman: "mʉng jà ao ngai wá", meaning: "你想怎样？（强烈挑衅）" },
      { level: 5, category: "travel", label: "正式 · 求助", target: "ขออภัยครับ ช่วยพูดอีกครั้งได้ไหมครับ", roman: "khɔ̌ɔ à-phai, chûai phûut ìik khráng dâi mái", meaning: "抱歉，可以再说一次吗？" }
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
    brand: "พูดจีนให้เป็น",
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
      partnerEyebrow: "คู่ฝึกช่วยกันคืนนี้", partnerHeading: "แลกกันคนละประโยค", partnerStreak: "ช่วยกัน 3 วัน",
      vibeEyebrow: "โหมดเด็ด", vibeHeading: "ประโยคเดียว 5 สไตล์", vibeInfo: "ประเมินแค่สำนวน", currentMode: "โทนปัจจุบัน", intent: "คุณอยากพูดว่า “ขอน้ำหนึ่งขวด”", reaction: "ปฏิกิริยาของพนักงาน", consoleSafe: "สุภาพ", consoleTitle: "ตัวปรับระดับภาษา", consoleRisk: "แรง",
      routeEyebrow: "แผนที่การเรียน", routeTitle: "เส้นทางเอาตัวรอดในจีน", routeDetails: "ทั้งหมด 12 สถานี", routeStops: ["ลงจอด","ร้านสะดวกซื้อ","คาเฟ่","แท็กซี่"],
      skillNote: "คุณไม่ได้แค่ท่องศัพท์ แต่กำลังฝึกเลือกคำให้ถูกกาลเทศะ", skills: ["ภาษาสุภาพ","ภาษาธรรมชาติ","ฟังภาษาถนน","เลือกตามสถานการณ์"],
      battleEyebrow: "รอบละ 10 วินาที", battleTitle: "ดวลเลือกภาษาให้ถูกกาลเทศะ", battleSubtitle: "พูดจีนถูกได้ 50 คะแนน เลือกให้ถูกสถานการณ์ถึงจะเก่งจริง", battleBadge: "โจทย์ฉุกเฉิน", personLabel: "คู่สนทนา", leagueLabel: "อันดับกล้าพูดสัปดาห์นี้", leagueValue: "ตรอกทองแดง · อันดับ 12",
      passTitle: "สองคนเครื่องเดียว · ส่งมือถือ", passCopy: "คนหนึ่งเรียนไทย อีกคนเรียนจีน ผลัดกันออกโจทย์",
      libraryEyebrow: "รวมแล้ว 40+ ประโยค", libraryTitle: "คลังประโยคตามโทน", librarySubtitle: "เลือกสถานการณ์ก่อน แล้วค่อยเลือกอารมณ์ภาษา", filters: ["ทั้งหมด","ชีวิตประจำวัน","ท่องเที่ยว","ที่ทำงาน","เพื่อน","เสี่ยงสูง"],
      profileName: "Mint", levelLabel: "ระดับการเรียน：", level: "กล้าพูดแล้ว", modePrefix: "โทนประจำ · ", abilityTitle: "แผนภูมิทักษะภาษา", abilityWeek: "สัปดาห์นี้ +18", achievements: ["เรียนต่อเนื่อง","ครั้งที่พูด","การ์ดประโยค"],
      switchDirection: "สลับเส้นทางการเรียน", changeMode: "เปลี่ยนโทนเริ่มต้น", method: "หลักการเรื่องระดับภาษา", methodAction: "ดู", prototype: "ต้นแบบแนวคิด · เนื้อหาจีนควรตรวจโดยเจ้าของภาษา",
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
      copy: "เนื้อหาโหมดนี้มีไว้เพื่อ<strong>ฟังให้รู้ทัน เอาตัวรอด และเข้าใจฉากขัดแย้ง</strong> ระดับ S1 ตั้งใจใช้เสียงผู้หญิงน่ารักเพื่อสร้างความตัดกัน แต่คำพูดยังหยาบและอาจทำให้เกิดเรื่องได้",
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
      kicker: "โหมดสองคนต่อหน้า", title: "ส่งมือถือให้เพื่อนชาวจีน", copy: "คุณตอบภาษาจีน ให้เพื่อนตัดสิน; ข้อถัดไปเพื่อนตอบไทย ระบบจะซ่อนคำตอบระหว่างส่งมือถือ", playerA: "ผู้เล่นไทย", roleA: "เรียนจีน", playerB: "中国玩家", roleB: "学泰语", start: "เริ่มเกมทดลอง 3 ข้อ", cancel: "ไว้เล่นทีหลัง", handoffTitle: "ส่งมือถือให้ผู้เล่นชาวจีน", handoffCopy: "ระบบซ่อนคำตอบแล้ว เมื่อส่งเสร็จให้เพื่อนตัดสินความเป็นธรรมชาติของภาษาจีนคุณ", reveal: "รับมือถือแล้ว เปิดข้อ 1", toast: "เริ่มโหมดสองคน: ข้อ 1 ผู้เล่นไทยตอบภาษาจีน"
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
        answers: [{ text: "麻烦给我拿一瓶水，谢谢。", sub: "Máfan gěi wǒ ná yì píng shuǐ, xièxie.", correct: true, target: true },{ text: "水在哪儿？", sub: "Shuǐ zài nǎr?", correct: false, target: true },{ text: "赶紧给我拿瓶水来！", sub: "Gǎnjǐn gěi wǒ ná píng shuǐ lái!", correct: false, target: true }],
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
let pendingMode = 1;
let previousMode = 1;
let riskAccepted = false;
let riskSelectionSource = "sheet";
let lessonStep = 0;
let selectedAnswer = null;
let checked = false;
let passState = 0;
let toastTimer;
let partnerReplyTimer;
let liveReplyTimer;
let liveScenarioIndex = 0;
let lastNpcLine = null;
let localRecognition = null;
let localSpeechCapability = "checking";
let mediaRecorder = null;
let mediaStream = null;
let recordedChunks = [];
let recordedUrl = null;
let deferredInstallPrompt = null;
let alaiAudio = null;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const text = (selector, value) => { const el = $(selector); if (el) el.textContent = value; };
const html = (selector, value) => { const el = $(selector); if (el) el.innerHTML = value; };

function config() {
  return product[currentDirection];
}

function offlineConfig() {
  return window.OFFLINE_APP_CONTENT?.[currentDirection];
}

function onboardingKey(direction = currentDirection) {
  return `huilaishi-onboarded-${direction}`;
}

function pulseHaptic() {
  try { navigator.vibrate?.(10); } catch (_) { /* optional device affordance */ }
}

function selectDirection(direction, withHaptic = true) {
  pendingDirection = direction;
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

function showDirection() {
  closeSheets();
  $("#direction-screen").classList.remove("hidden");
  $("#onboarding").classList.add("hidden");
  $("#main-app").classList.add("hidden");
  $("#lesson").classList.add("hidden");
  pendingDirection = currentDirection;
  selectDirection(pendingDirection);
}

function showOnboarding() {
  $("#direction-screen").classList.add("hidden");
  $("#main-app").classList.add("hidden");
  $("#lesson").classList.add("hidden");
  $("#onboarding").classList.remove("hidden");
  pendingMode = currentMode;
  renderModeList();
}

function showMain() {
  $("#direction-screen").classList.add("hidden");
  $("#onboarding").classList.add("hidden");
  $("#lesson").classList.add("hidden");
  $("#main-app").classList.remove("hidden");
}

function applyDirection(direction, persist = true) {
  localRecognition?.abort?.();
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
  $("#vibe-slider").setAttribute("aria-label", isChineseUi ? "选择素质档位" : "เลือกระดับโทนภาษา");
  $(".bottom-nav").setAttribute("aria-label", isChineseUi ? "主导航" : "เมนูหลัก");
  $("#close-lesson").setAttribute("aria-label", isChineseUi ? "关闭课程" : "ปิดบทเรียน");
  $$('[data-close-sheet]').forEach(button => button.setAttribute("aria-label", isChineseUi ? "关闭" : "ปิด"));
  if (persist) localStorage.setItem("learningDirection", direction);

  const storedModeValue = localStorage.getItem(`thai-vibe-mode-${direction}`);
  const storedMode = Number(storedModeValue);
  currentMode = storedModeValue !== null && Number.isInteger(storedMode) && storedMode >= 0 && storedMode < 5 ? storedMode : 1;
  pendingMode = currentMode;
  riskAccepted = false;

  text("#setup-mark", data.mark);
  text("#setup-tag", data.setup.tag);
  text("#setup-eyebrow", data.setup.eyebrow);
  html("#onboarding-title", data.setup.title);
  html("#setup-lede", data.setup.lede);
  text("#setup-sign-a", data.setup.signA);
  text("#setup-sign-b", data.setup.signB);
  text("#setup-scale-safe", isChineseUi ? "稳妥体面" : "สุภาพและปลอดภัย");
  text("#setup-scale-note", isChineseUi ? "越往下，语气越冲、使用范围越窄" : "ยิ่งลงไป คำยิ่งแรงและใช้ได้ในวงแคบลง");
  text("#setup-scale-risk", isChineseUi ? "高风险" : "เสี่ยงสูง");
  text("#setup-current-label", isChineseUi ? "当前说法" : "ประโยคปัจจุบัน");
  $("#setup-mode-list").setAttribute("aria-label", isChineseUi ? "选择说话语气" : "เลือกระดับโทนภาษา");
  text("#mode-picker-label", data.setup.picker);
  text("#start-app-label", data.setup.start);
  text("#peek-home", data.setup.peek);

  text("#app-logo-mark", data.mark);
  text("#app-brand-name", data.brand);
  text("#header-direction-text", data.directionLabel);
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
  text("#vibe-eyebrow", data.ui.vibeEyebrow);
  text("#vibe-heading", data.ui.vibeHeading);
  text("#vibe-info", data.ui.vibeInfo);
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
  ["all","daily","travel","work","friend","risk"].forEach((key, i) => text(`#filter-${key}`, data.ui.filters[i]));
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
  text("#alai-voice-title", currentDirection === "zh-th" ? "阿来声线" : "เสียง A-Lai");
  text("#alai-voice-copy", currentDirection === "zh-th" ? "聪明、松弛、有点坏笑 · 本地播放" : "ฉลาด เป็นกันเอง แอบขี้เล่น · เล่นในเครื่อง");
  text("#alai-voice-action", currentDirection === "zh-th" ? "试听" : "ลองฟัง");
  text("#sugarblade-voice-title", currentDirection === "zh-th" ? "糖刀声线" : "เสียง Sugar Blade");
  text("#sugarblade-voice-copy", currentDirection === "zh-th" ? "S1 专属 · 软萌女生轻声说脏话" : "เฉพาะ S1 · เสียงผู้หญิงนุ่มน่ารักพูดคำแรงเบา ๆ");
  text("#sugarblade-voice-action", currentDirection === "zh-th" ? "试听反差" : "ลองฟังความตัดกัน");
  text("#prototype-note", data.ui.prototype);
  ["home","live","battle","library","profile"].forEach((key, i) => text(`#nav-${key}`, data.ui.nav[i]));
  text("#mode-sheet-eyebrow", data.ui.modeEyebrow);
  text("#mode-sheet-title", data.ui.modeTitle);
  text("#mode-sheet-note", data.ui.modeNote);
  text("#confirm-mode", data.ui.confirmMode);
  text("#lesson-scene-label", data.ui.lessonScene);
  text("#speak-npc-label", data.ui.listen);
  text("#info-eyebrow", data.ui.infoEyebrow);
  text("#info-title", data.ui.infoTitle);
  text("#info-confirm", data.ui.infoConfirm);

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
}

function renderVibeTicks() {
  $("#vibe-ticks").innerHTML = config().modes.map((mode, index) => `<button data-index="${index}" data-speak-text="${escapeHtml(mode.target)}" data-speak-lang="${config().targetLang}" ${index === 4 ? 'data-speech-policy="native"' : ""} aria-label="${mode.name}"><span>${mode.code}</span><small>${mode.short}</small></button>`).join("");
}

function applyMode(index, persist = true) {
  currentMode = index;
  const data = config();
  const mode = data.modes[index];
  const reading = currentDirection === "zh-th"
    ? (mode.thReading || window.HUILAISHI_THAI_PHONETIC?.make(mode.target, mode.roman))
    : null;
  const color = sharedColors[index];
  document.documentElement.style.setProperty("--accent", color.color);
  document.documentElement.style.setProperty("--accent-soft", color.soft);
  document.documentElement.style.setProperty("--accent-ink", color.ink);
  document.documentElement.style.setProperty("--safe-width", `${color.safe}%`);
  document.documentElement.style.setProperty("--risk", color.safeColor);
  text("#vibe-badge", mode.code);
  text("#vibe-name", mode.name);
  text("#vibe-thai", mode.target);
  $("#vibe-thai").lang = data.targetHtmlLang;
  text("#vibe-roman", reading?.romanTone || mode.roman);
  const mnemonic = $("#vibe-mnemonic");
  mnemonic.classList.toggle("hidden", !reading?.zhHint);
  $(".thai-phonetic-label", mnemonic).textContent = reading?.labelZh || "中文近音 · 仅助记";
  $(".thai-phonetic-value", mnemonic).textContent = reading?.zhHint || "";
  mnemonic.title = reading?.disclaimerZh || "";
  text("#vibe-cn", mode.meaning);
  text("#reaction-copy", mode.reaction);
  text("#reaction-face", mode.face);
  text("#selected-mode-label", mode.name);
  $("#vibe-card").classList.toggle("sugarblade", index === 4);
  $("#sugarblade-badge").classList.toggle("hidden", index !== 4);
  text("#sugarblade-badge", currentDirection === "zh-th" ? "♡ 软萌甜嗓 · 低素质台词" : "♡ เสียงนุ่มน่ารัก · คำพูดแรง");
  $("#selected-dot").style.background = color.color;
  text("#onboarding-sample", `“${mode.target}”`);
  $("#onboarding-sample").lang = data.targetHtmlLang;
  text("#profile-mode", `${data.ui.modePrefix}${mode.name}`);
  text("#settings-mode", mode.name);
  text("#lesson-mode-chip", mode.name);
  $("#vibe-slider").value = index + 1;
  $("#context-row").innerHTML = mode.contexts.map(([value, bad]) => `<span class="${bad ? "bad" : ""}">${value}</span>`).join("");
  $$("#vibe-ticks button").forEach((button, i) => button.classList.toggle("active", i === index));
  if (persist) localStorage.setItem(`thai-vibe-mode-${currentDirection}`, String(index));
  if (persist && index === 4) playSugarBladeVoice("mode");
}

function renderModeList() {
  $("#mode-list").innerHTML = config().modes.map((mode, index) => `
    <button class="mode-option ${index === pendingMode ? "selected" : ""}" data-mode="${index}" data-speak-text="${escapeHtml(mode.target)}" data-speak-lang="${config().targetLang}" ${index === 4 ? 'data-speech-policy="native"' : ""} style="--mode-color:${sharedColors[index].color}">
      <span class="option-code">${mode.code}</span>
      <span class="option-copy"><strong>${mode.name}</strong><small>${mode.desc}</small></span>
      <span class="risk-chip">${mode.risk}</span>
    </button>`).join("");

  const setupList = $("#setup-mode-list");
  if (setupList) {
    setupList.innerHTML = config().modes.map((mode, index) => `
      <button class="setup-mode-option ${index === pendingMode ? "selected" : ""}" data-setup-mode="${index}" data-speak-text="${escapeHtml(mode.target)}" data-speak-lang="${config().targetLang}" ${index === 4 ? 'data-speech-policy="native"' : ""} aria-pressed="${index === pendingMode}" style="--mode-color:${sharedColors[index].color}">
        <span class="setup-option-code">${mode.code}</span>
        <span class="setup-option-copy"><strong>${mode.name}</strong><small>${index === 4 ? (currentDirection === "zh-th" ? "可爱女声反差 · 粗口只为识别" : "เสียงผู้หญิงน่ารักตัดกับคำแรง · ฟังเพื่อรู้ทัน") : mode.desc}</small></span>
        <span class="setup-option-risk">${mode.risk}</span>
        <span class="setup-option-check"><svg><use href="#i-check"></use></svg></span>
      </button>`).join("");
  }
}

function updateRiskAcceptLabel(source) {
  const zh = currentDirection === "zh-th";
  text("#accept-risk", source === "setup"
    ? (zh ? "我明白风险，使用 S1 并开始" : "เข้าใจแล้ว ใช้ S1 และเริ่ม")
    : (zh ? "我明白风险，切换到 S1" : "เข้าใจแล้ว เปลี่ยนเป็น S1"));
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
  if (source === "setup") applyMode(index, false);
  renderModeList();
}

function renderPartner() {
  const data = config().partner;
  const done = localStorage.getItem(`partner-relay-${currentDirection}`) === "done";
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
  localStorage.setItem(`partner-relay-${currentDirection}`, "done");
  closeSheets();
  renderPartner();
  showToast(config().partner.rewardTitle);
}

function renderBattle() {
  const data = config();
  text("#boss-avatar", data.battle.avatar);
  text("#battle-person", data.battle.person);
  text("#battle-question", data.battle.question);
  $("#battle-options").innerHTML = data.battle.options.map((option, i) => {
    const reading = chinesePhonetic(option);
    const roman = reading?.romanTone || option.roman || "";
    return `<button data-battle="${i}" data-correct="${option.correct}"><span>${String.fromCharCode(65 + i)}</span><b lang="${data.targetHtmlLang}">${escapeHtml(option.target)}</b><small>${roman ? `${escapeHtml(roman)} · ` : ""}${escapeHtml(option.meaning)}</small>${phoneticMarkup(option)}</button>`;
  }).join("");
  $("#battle-feedback").classList.add("hidden");
  $("#battle-feedback").textContent = "";
}

function chooseBattle(index) {
  if ($("#battle-options .correct")) return;
  const data = config();
  const option = data.battle.options[index];
  const button = $(`[data-battle="${index}"]`);
  button.classList.add(option.correct ? "correct" : "wrong");
  if (!option.correct) {
    const correctIndex = data.battle.options.findIndex(item => item.correct);
    $(`[data-battle="${correctIndex}"]`).classList.add("correct");
  }
  text("#battle-feedback", option.correct ? data.battle.correct : data.battle.wrong);
  $("#battle-feedback").classList.remove("hidden");
  pulseHaptic();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function chinesePhonetic(line) {
  if (currentDirection !== "zh-th" || !line || !/[\u0e00-\u0e7f]/u.test(String(line.target || ""))) return null;
  return line.thReading || window.HUILAISHI_THAI_PHONETIC?.make(line.target, line.roman);
}

function phoneticMarkup(line) {
  const reading = chinesePhonetic(line);
  if (!reading?.zhHint) return "";
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
        thReading: option.thReading || null
      });
    });
  });
  data._offlineMerged = true;
}

function renderLive() {
  const local = offlineConfig();
  if (!local) return;
  const ui = local.ui;
  const savedIndex = Number(localStorage.getItem(`offline-scene-${currentDirection}`));
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
  localStorage.setItem(`offline-scene-${currentDirection}`, String(index));
  $$("#scenario-strip .scenario-chip").forEach((button, i) => {
    button.classList.toggle("active", i === index);
    button.setAttribute("aria-pressed", String(i === index));
  });
  text("#conversation-avatar", scene.avatar);
  text("#conversation-place", scene.place);
  text("#conversation-title", scene.title);
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
  $("#quick-replies").innerHTML = scene.options.map((option, index) => {
    const status = option.risk
      ? (currentDirection === "zh-th" ? "听懂防坑" : "ฟังรู้ทัน")
      : option.level === desiredLevel
        ? (currentDirection === "zh-th" ? "当前档" : "โทนนี้")
        : `S${option.level}`;
    const reading = chinesePhonetic(option);
    return `<button class="quick-reply" data-live-option="${index}" data-risk="${Boolean(option.risk)}">
      <span>S${option.level}</span>
      <div><b lang="${config().targetHtmlLang}">${escapeHtml(option.target)}</b><small>${escapeHtml(reading?.romanTone || option.roman)} · ${escapeHtml(option.meaning)}</small>${phoneticMarkup(option)}</div>
      <span class="reply-level">${status}</span>
    </button>`;
  }).join("");
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
  feedback.textContent = `${option.risk ? ui.riskPrefix : ui.safePrefix} · S${option.level} — ${option.tip}`;
  feedback.classList.remove("hidden");
}

function sendLiveOption(option, typedValue = "") {
  const scene = offlineConfig().scenarios[liveScenarioIndex];
  const userLine = typedValue
    ? { target: typedValue, roman: `${currentDirection === "zh-th" ? "本地匹配" : "จับคู่ในเครื่อง"} → ${option.target}`, meaning: option.meaning }
    : option;
  clearTimeout(liveReplyTimer);
  appendLiveMessage("user", userLine, { level: `S${option.level}` });
  showCoachFeedback(option);
  $("#quick-replies").innerHTML = "";
  $("#conversation-typing").classList.remove("hidden");
  liveReplyTimer = setTimeout(() => {
    $("#conversation-typing").classList.add("hidden");
    appendLiveMessage("npc", option.next, { level: scene.safety || scene.goal });
    lastNpcLine = option.next;
    renderLiveActions();
    const key = `offline-turns-${currentDirection}`;
    localStorage.setItem(key, String(Number(localStorage.getItem(key) || 0) + 1));
    pulseHaptic();
  }, 520);
}

function normalizeForMatch(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[\s\p{P}\p{S}]+/gu, "");
}

function matchLiveOption(value) {
  const scene = offlineConfig().scenarios[liveScenarioIndex];
  const input = normalizeForMatch(value);
  if (!input) return null;
  let best = null;
  let bestScore = 0;
  scene.options.forEach(option => {
    const target = normalizeForMatch(option.target);
    let score = target === input ? 20 : 0;
    option.keywords.forEach(keyword => {
      const normalizedKeyword = normalizeForMatch(keyword);
      if (normalizedKeyword && (input.includes(normalizedKeyword) || (input.length > 3 && normalizedKeyword.includes(input)))) score += 3;
    });
    if (option.risk && score > 0) score += 1;
    if (option.level === 5 - currentMode) score += .1;
    if (score > bestScore) { best = option; bestScore = score; }
  });
  return bestScore >= 3 ? best : null;
}

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
  const matched = matchLiveOption(input);
  if (matched) sendLiveOption(matched, input);
  else sendLiveFallback(input);
}

function handleLiveAction(action) {
  if (action === "retry") startLiveScenario(liveScenarioIndex, false);
  if (action === "next") startLiveScenario((liveScenarioIndex + 1) % offlineConfig().scenarios.length, true);
}

function updateNetworkStatus() {
  const ui = offlineConfig()?.ui;
  if (!ui) return;
  const online = navigator.onLine;
  text("#network-status", online ? ui.online : ui.offline);
  $("#network-badge").classList.toggle("is-offline", !online);
}

function renderPhrases(filter = "all") {
  const data = config();
  const list = filter === "all" ? data.phrases : data.phrases.filter(item => item.category === filter);
  $("#phrase-list").innerHTML = list.map(item => {
    const color = sharedColors[5 - item.level].color;
    const reading = chinesePhonetic(item);
    return `<article class="phrase-card">
      <div role="button" tabindex="0" data-tap-speak data-speak-text="${escapeHtml(item.target)}" data-speak-lang="${data.targetLang}"><div class="phrase-top"><span class="phrase-level" style="background:${color}">S${item.level}</span><span class="phrase-category">${escapeHtml(item.label)}</span></div><h3 lang="${data.targetHtmlLang}">${escapeHtml(item.target)}</h3><p><b>${escapeHtml(reading?.romanTone || item.roman)}</b><br>${escapeHtml(item.meaning)}</p>${phoneticMarkup(item)}</div>
      <button class="phrase-audio" data-phrase="${encodeURIComponent(item.target)}" aria-label="${currentDirection === "zh-th" ? "播放" : "ฟังเสียง"}"><svg><use href="#i-volume"></use></svg></button>
    </article>`;
  }).join("");
}

function resetFilters() {
  $$("#library-filters button").forEach((button, i) => button.classList.toggle("active", i === 0));
}

function startLesson() {
  lessonStep = 0;
  selectedAnswer = null;
  checked = false;
  text("#heart-count", "3");
  $("#main-app").classList.add("hidden");
  $("#lesson").classList.remove("hidden");
  renderLessonStep();
}

function renderLessonStep() {
  const data = config();
  const step = data.lessons[lessonStep];
  $("#lesson-progress").style.width = `${((lessonStep + 1) / data.lessons.length) * 100}%`;
  text("#lesson-step-label", step.label);
  text("#lesson-question", step.question);
  text("#lesson-hint", step.hint);
  const npcLine = { target: step.npc, roman: step.npcRoman || "" };
  const npcReading = chinesePhonetic(npcLine);
  $("#npc-bubble").innerHTML = `<span class="npc-main-line" lang="${data.targetHtmlLang}">${escapeHtml(step.npc)}</span>${npcReading ? `<small>${escapeHtml(npcReading.romanTone || step.npcRoman)}</small>${phoneticMarkup(npcLine)}` : ""}`;
  $("#npc-bubble").lang = data.targetHtmlLang;
  $("#answer-list").innerHTML = step.answers.map((answer, i) => `<button data-answer="${i}"><span>${String.fromCharCode(65 + i)}</span><div><b ${answer.target ? `lang="${data.targetHtmlLang}"` : ""}>${answer.text}</b><small>${answer.sub}</small></div></button>`).join("");
  $("#lesson-feedback").classList.add("hidden");
  text("#lesson-next", data.ui.check);
  $("#lesson-next").disabled = true;
  selectedAnswer = null;
  checked = false;
}

function selectLessonAnswer(index) {
  if (checked) return;
  selectedAnswer = index;
  $$("#answer-list button").forEach((button, i) => button.classList.toggle("selected", i === index));
  $("#lesson-next").disabled = false;
}

function checkOrContinueLesson() {
  if (selectedAnswer === null) return;
  const data = config();
  const step = data.lessons[lessonStep];
  if (!checked) {
    checked = true;
    const correctIndex = step.answers.findIndex(answer => answer.correct);
    $$("#answer-list button").forEach((button, i) => {
      button.classList.remove("selected");
      if (i === correctIndex) button.classList.add("correct");
      if (i === selectedAnswer && i !== correctIndex) button.classList.add("wrong");
    });
    const correct = step.answers[selectedAnswer].correct;
    const feedback = $("#lesson-feedback");
    feedback.textContent = correct ? step.feedback : `${data.ui.wrongPrefix}${step.feedback}`;
    feedback.style.background = correct ? "#edffd9" : "#fff0f1";
    feedback.style.color = correct ? "#3c6d1c" : "#a93240";
    feedback.classList.remove("hidden");
    text("#lesson-next", lessonStep === data.lessons.length - 1 ? data.ui.reward : data.ui.next);
    if (!correct) text("#heart-count", String(Math.max(1, Number($("#heart-count").textContent) - 1)));
    playAlaiVoice(correct ? "correct" : "retry");
    pulseHaptic();
    return;
  }
  if (lessonStep < data.lessons.length - 1) {
    lessonStep += 1;
    renderLessonStep();
    $(".lesson-body").scrollTo({ top: 0, behavior: "smooth" });
  } else {
    showMain();
    navigate("home");
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

function openSheet(id) {
  $("#modal-backdrop").classList.remove("hidden");
  $$(".bottom-sheet").forEach(sheet => sheet.classList.add("hidden"));
  $(`#${id}`).classList.remove("hidden");
  if (id === "mode-sheet") {
    pendingMode = currentMode;
    renderModeList();
  }
  if (id === "pass-sheet") renderPassSheet();
}

function closeSheets() {
  clearTimeout(partnerReplyTimer);
  $("#modal-backdrop").classList.add("hidden");
  $$(".bottom-sheet").forEach(sheet => sheet.classList.add("hidden"));
}

function navigate(view) {
  showMain();
  $$(".view").forEach(section => section.classList.toggle("active", section.id === `view-${view}`));
  $$(".bottom-nav button").forEach(button => button.classList.toggle("active", button.dataset.nav === view));
  $("#app-scroll").scrollTo({ top: 0, behavior: "smooth" });
  if (view === "live") {
    renderLive();
    prepareLocalSpeech();
  }
  if (view === "library") window.VocabUI?.render?.();
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

function speakText(value, lang = config().targetLang, rate = .76) {
  stopAlaiVoice();
  if (window.HUILAISHI_SPEECH?.speak) {
    const thai = String(lang || "").toLowerCase().startsWith("th");
    const requested = Number(rate) || (thai ? .84 : .9);
    const clearRate = requested <= .7 ? (thai ? .74 : .76) : Math.max(thai ? .82 : .86, requested);
    return window.HUILAISHI_SPEECH.speak(value, { lang, rate: clearRate, mode: requested <= .7 ? "slow" : "normal" });
  }
  if (!("speechSynthesis" in window)) return showToast(currentDirection === "zh-th" ? "当前浏览器没有语音功能" : "เบราว์เซอร์นี้ไม่รองรับเสียงพูด");
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(value);
  utterance.lang = lang;
  utterance.rate = rate;
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
    showToast(currentDirection === "zh-th" ? "首次安装语音包需要先联网" : "การติดตั้งชุดเสียงครั้งแรกต้องออนไลน์");
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
      showToast(currentDirection === "zh-th" ? "本地语音包安装完成" : "ติดตั้งชุดเสียงในเครื่องแล้ว");
    } else {
      setLocalSpeechUi("pack");
      showToast(ui.voicePackNote);
    }
  } catch (_) {
    setLocalSpeechUi("pack");
    showToast(currentDirection === "zh-th" ? "语言包安装失败，可继续用选句和打字" : "ติดตั้งไม่สำเร็จ ยังเลือกประโยคและพิมพ์ได้");
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

async function togglePracticeRecording() {
  const ui = offlineConfig().ui;
  const recordButton = $("#record-practice");
  if (mediaRecorder?.state === "recording") {
    mediaRecorder.stop();
    return;
  }
  if (!window.MediaRecorder || !navigator.mediaDevices?.getUserMedia) {
    showToast(currentDirection === "zh-th" ? "录音需要 HTTPS 或已安装的 App；选句和打字仍可离线" : "การอัดเสียงต้องใช้ HTTPS หรือแอปที่ติดตั้งแล้ว แต่ยังพิมพ์ออฟไลน์ได้");
    return;
  }
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(mediaStream);
    mediaRecorder.addEventListener("dataavailable", event => { if (event.data.size) recordedChunks.push(event.data); });
    mediaRecorder.addEventListener("stop", () => {
      mediaStream?.getTracks().forEach(track => track.stop());
      mediaStream = null;
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
      const blob = new Blob(recordedChunks, { type: mediaRecorder.mimeType || "audio/webm" });
      recordedUrl = URL.createObjectURL(blob);
      $("#record-playback").src = recordedUrl;
      $("#record-playback").classList.remove("hidden");
      recordButton.classList.remove("recording");
      text("#record-label", ui.record);
      showToast(currentDirection === "zh-th" ? "录好了，听听自己和原句的差别" : "อัดแล้ว ลองฟังเทียบกับประโยคต้นฉบับ");
    });
    mediaRecorder.start();
    recordButton.classList.add("recording");
    text("#record-label", ui.stopRecord);
    showToast(currentDirection === "zh-th" ? "正在本机录音，不上传" : "กำลังอัดในเครื่อง ไม่อัปโหลด");
  } catch (_) {
    mediaStream?.getTracks().forEach(track => track.stop());
    mediaStream = null;
    showToast(currentDirection === "zh-th" ? "没有获得麦克风权限，可继续用选句和打字" : "ไม่ได้รับสิทธิ์ไมโครโฟน ยังเลือกประโยคและพิมพ์ได้");
  }
}

function updateInstallUi() {
  const ui = offlineConfig()?.ui;
  if (!ui) return;
  const standalone = window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
  text("#install-app-label", ui.installApp);
  text("#install-app-action", standalone
    ? (currentDirection === "zh-th" ? "已安装" : "ติดตั้งแล้ว")
    : deferredInstallPrompt ? ui.installAction : ui.installManual);
  text("#offline-capability-title", ui.offlineReady);
  text("#offline-capability-copy", ui.offlineReadyCopy);
}

async function installPwa() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    updateInstallUi();
    return;
  }
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const message = currentDirection === "zh-th"
    ? isIOS
      ? "iPhone：Safari 点分享，再选“添加到主屏幕”"
      : "安装需 HTTPS：部署后用 Chrome 菜单选择“安装应用”；当前局域网地址用于预览"
    : isIOS
      ? "iPhone: แตะแชร์ใน Safari แล้วเลือก “เพิ่มไปยังหน้าจอโฮม”"
      : "การติดตั้งต้องใช้ HTTPS หลังเผยแพร่ให้เลือก “ติดตั้งแอป” ในเมนู Chrome; ลิงก์ Wi‑Fi นี้ใช้พรีวิว";
  showToast(message);
}

function setupPwa() {
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
  if (!window.SINGLE_FILE_BUILD && "serviceWorker" in navigator && window.isSecureContext && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register("./service-worker.js", { updateViaCache: "none" }).catch(() => {
      text("#offline-capability-copy", currentDirection === "zh-th" ? "离线缓存未启用；请确认通过 HTTPS 或 localhost 打开" : "แคชออฟไลน์ยังไม่ทำงาน โปรดเปิดผ่าน HTTPS หรือ localhost");
    });
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
    if (card) selectDirection(card.dataset.direction);
  });
  $("#direction-continue").addEventListener("click", () => {
    if (!pendingDirection) return;
    applyDirection(pendingDirection);
    if (localStorage.getItem(onboardingKey()) === "1") navigate("home");
    else showOnboarding();
  });
  $("#back-to-direction").addEventListener("click", showDirection);
  $("#header-direction").addEventListener("click", showDirection);
  $("#switch-direction").addEventListener("click", showDirection);

  $("#open-mode-picker").addEventListener("click", () => openSheet("mode-sheet"));
  $("#change-mode").addEventListener("click", () => openSheet("mode-sheet"));
  $("#mode-list").addEventListener("click", event => {
    const button = event.target.closest(".mode-option");
    if (button) selectPendingMode(Number(button.dataset.mode), "sheet");
  });
  $("#setup-mode-list").addEventListener("click", event => {
    const button = event.target.closest(".setup-mode-option");
    if (button) selectPendingMode(Number(button.dataset.setupMode), "setup");
  });
  $("#confirm-mode").addEventListener("click", () => {
    applyMode(pendingMode);
    closeSheets();
    showToast(`${config().ui.modeToast}「${config().modes[currentMode].name}」`);
  });
  $("#accept-risk").addEventListener("click", () => {
    riskAccepted = true;
    closeSheets();
    pendingMode = 4;
    applyMode(4);
    renderModeList();
    if (riskSelectionSource === "setup") {
      localStorage.setItem(onboardingKey(), "1");
      navigate("home");
    } else {
      showToast(`${config().ui.modeToast}「${config().modes[currentMode].name}」`);
    }
  });
  $("#modal-backdrop").addEventListener("click", closeSheets);
  $$('[data-close-sheet]').forEach(button => button.addEventListener("click", () => { pendingMode = previousMode; closeSheets(); }));
  $("#show-method").addEventListener("click", () => openSheet("info-sheet"));

  $("#start-app").addEventListener("click", () => { applyMode(pendingMode); localStorage.setItem(onboardingKey(), "1"); playAlaiVoice("intro"); navigate("home"); });
  $("#peek-home").addEventListener("click", () => { localStorage.setItem(onboardingKey(), "1"); playAlaiVoice("intro"); navigate("home"); });
  $("#reset-onboarding").addEventListener("click", showOnboarding);
  $$('[data-nav]').forEach(button => button.addEventListener("click", () => navigate(button.dataset.nav)));

  $("#vibe-slider").addEventListener("input", event => {
    const index = Number(event.target.value) - 1;
    if (index === 4 && !riskAccepted) {
      event.target.value = currentMode + 1;
      previousMode = currentMode;
      riskSelectionSource = "slider";
      updateRiskAcceptLabel("slider");
      openSheet("warning-sheet");
      return;
    }
    applyMode(index);
  });
  $("#vibe-ticks").addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button) return;
    const index = Number(button.dataset.index);
    if (index === 4 && !riskAccepted) {
      previousMode = currentMode;
      riskSelectionSource = "slider";
      updateRiskAcceptLabel("slider");
      openSheet("warning-sheet");
      playAlaiVoice("risk");
      return;
    }
    applyMode(index);
  });
  $("#speak-vibe").addEventListener("click", () => currentMode === 4 ? playSugarBladeVoice("mode") : speakText(config().modes[currentMode].target));
  $("#speak-vibe-slow").addEventListener("click", () => currentMode === 4 ? playSugarBladeVoice("mode", .88) : speakText(config().modes[currentMode].target, config().targetLang, .64));

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
  $("#close-lesson").addEventListener("click", showMain);
  $("#speak-npc").addEventListener("click", () => speakText(config().lessons[lessonStep].npc));
  $("#answer-list").addEventListener("click", event => {
    const button = event.target.closest("button");
    if (button) selectLessonAnswer(Number(button.dataset.answer));
  });
  $("#lesson-next").addEventListener("click", checkOrContinueLesson);

  $("#route-details").addEventListener("click", () => showToast(config().ui.routeToast));
  $("#library-filters").addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button) return;
    $$("#library-filters button").forEach(item => item.classList.toggle("active", item === button));
    renderPhrases(button.dataset.filter);
  });
  $("#phrase-list").addEventListener("click", event => {
    const button = event.target.closest(".phrase-audio");
    if (button) speakText(decodeURIComponent(button.dataset.phrase));
  });
  $("#battle-options").addEventListener("click", event => {
    const button = event.target.closest("button");
    if (button) chooseBattle(Number(button.dataset.battle));
  });
  $("#pass-phone").addEventListener("click", () => openSheet("pass-sheet"));
  $("#start-pass").addEventListener("click", advancePassMode);

  $("#scenario-strip").addEventListener("click", event => {
    const button = event.target.closest("[data-scene]");
    if (button) startLiveScenario(Number(button.dataset.scene));
  });
  $("#live-reset").addEventListener("click", () => startLiveScenario(liveScenarioIndex, false));
  $("#conversation-listen").addEventListener("click", () => {
    if (lastNpcLine) speakText(lastNpcLine.target, config().targetLang, .78);
  });
  $("#quick-replies").addEventListener("click", event => {
    const optionButton = event.target.closest("[data-live-option]");
    if (optionButton) {
      const option = offlineConfig().scenarios[liveScenarioIndex].options[Number(optionButton.dataset.liveOption)];
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
  $("#preview-alai-voice").addEventListener("click", () => playAlaiVoice("intro"));
  $("#preview-sugarblade-voice").addEventListener("click", () => playSugarBladeVoice("mode"));
  window.addEventListener("online", updateNetworkStatus);
  window.addEventListener("offline", updateNetworkStatus);
}

function init() {
  bindEvents();
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
  const storedDirection = localStorage.getItem("learningDirection");
  currentDirection = product[storedDirection] ? storedDirection : "zh-th";
  applyDirection(currentDirection, false);
  if (product[storedDirection]) selectDirection(storedDirection, false);
  else {
    pendingDirection = null;
    $$(".direction-card").forEach(card => card.classList.remove("selected"));
    $("#direction-continue").disabled = true;
  }
  if (product[storedDirection] && localStorage.getItem(onboardingKey()) === "1") navigate("home");
  else {
    $("#direction-screen").classList.remove("hidden");
    $("#onboarding").classList.add("hidden");
    $("#main-app").classList.add("hidden");
  }
  setupPwa();
}

document.addEventListener("DOMContentLoaded", init);
