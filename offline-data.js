/*
 * Curated local conversation corpus.
 * No request is made by this file: every branch is deliberately bundled for offline use.
 */
const OFFLINE_APP_CONTENT = {
  "zh-th": {
    ui: {
      eyebrow: "OFFLINE REAL-TIME · 本地即时",
      title: "不连网，也能<br><em>把话接下去</em>",
      subtitle: "8 个高频场景、分支回应和场合反馈已经装进手机；这是本地情景引擎，不冒充生成式 AI。",
      badge: "本地引擎 · 可断网",
      proofScenes: "实战场景", proofBranches: "精品分支", proofNetwork: "对话流量",
      sceneEyebrow: "先挑一个现场", sceneHeading: "你现在在哪儿？", reset: "重来",
      engineNote: "所有回应均在本机匹配 · 无上传", typing: "本地角色正在接话",
      inputLabel: "输入你的泰语回答", inputPlaceholder: "也可以输入泰语、中文意图或罗马音…",
      voiceChecking: "正在检查本地语音", voiceAlways: "选句和打字始终可离线使用",
      voiceReady: "本地泰语识别已就绪", voiceReadyNote: "语音只在这台设备处理，不发送到云端",
      voicePackNeeded: "需要泰语离线语言包", voicePackNote: "首次安装语言包需要联网，装好后可断网识别",
      voiceUnavailable: "此设备暂无本地泰语识别", voiceFallback: "可继续用离线选句、打字和跟读回放",
      installVoice: "装泰语包", startVoice: "点一下说", listening: "正在听…",
      record: "跟读录音", stopRecord: "停止录音", recordNote: "录音只在当前页面回放，刷新即清除",
      online: "在线", offline: "已断网", truth: "离线对话不调用云端；语音识别仅在设备明确支持本地语言包时启用。",
      noMatch: "本地引擎还没匹配到这个说法。不会瞎编答案，请从关键词或推荐句再试一次。",
      riskPrefix: "风险识别", safePrefix: "场合反馈", nextScene: "下一场景", tryAgain: "换种说法",
      installApp: "安装离线版到手机", installAction: "安装", installManual: "查看方法",
      offlineReady: "离线内容已就绪", offlineReadyCopy: "40+ 句卡、课程与本地对话无需登录"
    },
    scenarios: [
      {
        id: "convenience", icon: "袋", category: "daily", title: "便利店买水", place: "曼谷便利店 · 08:20", avatar: "店",
        goal: "第一次见店员，自然买一瓶水",
        opening: { target: "สวัสดีค่ะ รับอะไรดีคะ", roman: "sà-wàt-dii khâ, ráp à-rai dii khá", meaning: "你好，想要点什么？" },
        options: [
          { level: 5, target: "รบกวนขอน้ำเปล่าหนึ่งขวดได้ไหมครับ", roman: "róp-kuan khɔ̌ɔ náam-plàao nʉ̀ng khùat dâi mái khráp", meaning: "劳驾，可以给我一瓶水吗？", keywords: ["รบกวน","ขอน้ำเปล่า","劳驾","一瓶水","nam plao"], tip: "很安全，但普通便利店里稍显正式。", next: { target: "ได้เลยค่ะ รับถุงไหมคะ", roman: "dâi loei khâ, ráp thǔng mái khá", meaning: "可以，需要袋子吗？" } },
          { level: 4, target: "ขอน้ำเปล่าหนึ่งขวดครับ", roman: "khɔ̌ɔ náam-plàao nʉ̀ng khùat khráp", meaning: "请给我一瓶水。", keywords: ["ขอน้ำเปล่า","น้ำเปล่าหนึ่งขวด","请给我一瓶水","kho nam plao"], tip: "短、自然、礼貌，是旅行默认首选。", next: { target: "ได้ค่ะ รับถุงไหมคะ", roman: "dâi khâ, ráp thǔng mái khá", meaning: "好的，需要袋子吗？" } },
          { level: 3, target: "เอาน้ำเปล่าขวดนึงนะ", roman: "ao náam-plàao khùat nʉng ná", meaning: "来瓶水哈。", keywords: ["เอาน้ำเปล่า","ขวดนึงนะ","来瓶水","ao nam plao"], tip: "省掉正式客套、用นะ软化，适合熟人或熟店员；对陌生店员默认选 S4。", next: { target: "ได้ค่ะ เอาเย็นไหมคะ", roman: "dâi khâ, ao yen mái khá", meaning: "好的，要冰的吗？" } },
          { level: 2, target: "เอาน้ำขวดนึงดิ", roman: "ao náam khùat nʉng dì", meaning: "拿瓶水呗。", keywords: ["เอาน้ำ","ขวดนึงดิ","拿瓶水","ao nam"], risk: true, tip: "ดิ 带催促感，只适合很熟的人；对店员会显得冲。", next: { target: "เอาน้ำเปล่าใช่ไหมคะ", roman: "ao náam-plàao châi mái khá", meaning: "是要矿泉水吗？（店员在确认）" } },
          { level: 1, target: "มึงเอาน้ำมาให้กูเดี๋ยวนี้สิวะ", roman: "mʉng ao náam maa hâi kuu dǐao-níi sì wá", meaning: "你他妈现在把水拿来。（粗口命令）", keywords: ["มึง","กู","เดี๋ยวนี้สิวะ","他妈","粗口"], risk: true, tip: "มึง/กู 是粗鲁人称，整句是明确辱骂式命令；只用于听懂冲突，禁止对真人使用。", next: { target: "ขอโทษนะคะ พูดดี ๆ หน่อยค่ะ", roman: "khɔ̌ɔ-thôot ná khá, phûut dii-dii nɔ̀i khâ", meaning: "不好意思，请好好说话。" } }
        ],
        fallback: { target: "ขอโทษนะคะ ฟังไม่ทัน ลองพูดอีกครั้งได้ไหมคะ", roman: "khɔ̌ɔ-thôot ná khá, fang mâi than, lɔɔng phûut ìik khráng dâi mái khá", meaning: "不好意思，我没听清，可以再说一次吗？" }
      },
      {
        id: "restaurant", icon: "餐", category: "daily", title: "餐厅点菜", place: "街角餐厅 · 午饭时间", avatar: "餐",
        goal: "点菜、争取思考时间，并说清忌口",
        opening: { target: "พร้อมสั่งอาหารหรือยังคะ", roman: "phrɔ́ɔm sàng aa-hǎan rʉ̌ʉ yang khá", meaning: "准备好点菜了吗？" },
        options: [
          { level: 5, target: "ยังเลือกไม่ได้ครับ รบกวนแนะนำเมนูที่ไม่เผ็ดได้ไหมครับ", roman: "yang lʉ̂ak mâi dâi khráp, róp-kuan nɛ́-nam mee-nuu thîi mâi phèt dâi mái khráp", meaning: "还没选好，劳驾推荐一道不辣的菜可以吗？", keywords: ["แนะนำเมนู","ไม่เผ็ด","推荐","不辣","nae nam menu"], tip: "รบกวน 让请求很体面，适合较正式餐厅。", next: { target: "ขอแนะนำข้าวผัดไก่ค่ะ ไม่เผ็ดเลย", roman: "khɔ̌ɔ nɛ́-nam khâao-phàt kài khâ, mâi phèt loei", meaning: "推荐鸡肉炒饭，完全不辣。" } },
          { level: 4, target: "ขอกะเพราไก่ไม่เผ็ดหนึ่งที่ครับ", roman: "khɔ̌ɔ kà-phrao kài mâi phèt nʉ̀ng thîi khráp", meaning: "请来一份不辣的鸡肉打抛饭。", keywords: ["กะเพราไก่","ไม่เผ็ด","一份","kaphrao kai"], tip: "自然完整。ไม่เผ็ด 表示不放辣椒，不代表没有其他刺激性调料。", next: { target: "ได้ค่ะ รับไข่ดาวเพิ่มไหมคะ", roman: "dâi khâ, ráp khài-daao phə̂əm mái khá", meaning: "好的，要加一颗煎蛋吗？" } },
          { level: 3, target: "ขอเวลาแป๊บนึงนะ", roman: "khɔ̌ɔ wee-laa pɛ́p nʉng ná", meaning: "再给我一小会儿哈。", keywords: ["ขอเวลา","แป๊บนึงนะ","等一下","kho wela"], tip: "轻松熟人口语；对陌生服务员加ครับ/ค่ะ会更稳，正式场合可把แป๊บนึง换成อีกสักครู่。", next: { target: "ได้เลยค่ะ พร้อมแล้วเรียกได้นะคะ", roman: "dâi loei khâ, phrɔ́ɔm lɛ́ɛo rîak dâi ná khá", meaning: "好的，准备好后叫我。" } },
          { level: 2, target: "ยังไม่พร้อม เดี๋ยวเรียก", roman: "yang mâi phrɔ́ɔm, dǐao rîak", meaning: "还没好，等下叫你。", keywords: ["ยังไม่พร้อม","เดี๋ยวเรียก","还没好","yang mai phrom"], risk: true, tip: "意思没错，但对陌生服务员显得生硬；补礼貌句尾就会柔和很多。", next: { target: "ได้ค่ะ", roman: "dâi khâ", meaning: "好的。（回应明显变冷）" } },
          { level: 1, target: "มึงรอไปก่อนสิวะ กูยังดูไม่เสร็จ", roman: "mʉng rɔɔ pai kɔ̀ɔn sì wá, kuu yang duu mâi sèt", meaning: "你他妈先等着，老子还没看完。（粗口）", keywords: ["มึง","กู","สิวะ","他妈","老子"], risk: true, tip: "มึง/กู 把普通等待要求变成粗口式命令；只用于影视或冲突识别，禁止对真人使用。", next: { target: "กรุณาพูดสุภาพด้วยค่ะ", roman: "kà-rú-naa phûut sù-phâap dûai khâ", meaning: "请礼貌说话。" } }
        ],
        fallback: { target: "ขอโทษค่ะ ต้องการสั่งเมนูไหนคะ", roman: "khɔ̌ɔ-thôot khâ, tɔ̂ng-kaan sàng mee-nuu nǎi khá", meaning: "不好意思，您想点哪一道？" }
      },
      {
        id: "taxi", icon: "车", category: "travel", title: "打车去 Asok", place: "曼谷出租车 · 刚上车", avatar: "车",
        goal: "说清目的地、打表和是否走高速",
        opening: { target: "ไปไหนครับ", roman: "pai nǎi khráp", meaning: "去哪里？" },
        options: [
          { level: 5, target: "รบกวนไปส่งที่บีทีเอสอโศก แล้วช่วยเปิดมิเตอร์ให้ด้วยได้ไหมครับ", roman: "róp-kuan pai sòng thîi bii-thii-èet à-sòok, lɛ́ɛo chûai pə̀ət mí-tə̂ə hâi dûai dâi mái khráp", meaning: "劳驾送我到 BTS Asok，并帮我打表，可以吗？", keywords: ["บีทีเอสอโศก","เปิดมิเตอร์","打表","BTS Asok"], tip: "信息完整且礼貌，适合上车时一次说清。", next: { target: "ได้ครับ ขึ้นทางด่วนไหมครับ", roman: "dâi khráp, khʉ̂n thaang-dùan mái khráp", meaning: "可以，要走高速吗？" } },
          { level: 4, target: "ไปบีทีเอสอโศกครับ รบกวนเปิดมิเตอร์ด้วยนะครับ", roman: "pai bii-thii-èet à-sòok khráp, róp-kuan pə̀ət mí-tə̂ə dûai ná khráp", meaning: "去 BTS Asok，麻烦打表。", keywords: ["ไปบีทีเอสอโศก","เปิดมิเตอร์","去Asok","open meter"], tip: "出租车场景默认首选；清楚地标比只报酒店中文名可靠。", next: { target: "ได้ครับ ขึ้นทางด่วนไหมครับ", roman: "dâi khráp, khʉ̂n thaang-dùan mái khráp", meaning: "好的，要走高速吗？" } },
          { level: 3, target: "ไม่ขึ้นทางด่วนนะ", roman: "mâi khʉ̂n thaang-dùan ná", meaning: "不走高速哈。", keywords: ["ไม่ขึ้นทางด่วน","不走高速","mai khuen"], tip: "熟人式短句，用นะ软化但没有礼貌词尾；对陌生司机默认加ครับ/ค่ะ。", next: { target: "ได้ครับ จะไปทางธรรมดา", roman: "dâi khráp, jà pai thaang tham-má-daa", meaning: "好的，走普通道路。" } },
          { level: 2, target: "ไปอโศก เร็ว ๆ หน่อย", roman: "pai à-sòok, reo-reo nɔ̀i", meaning: "去 Asok，快一点。", keywords: ["ไปอโศก","เร็ว ๆ","快点","reo reo"], risk: true, tip: "像在催司机，也可能带来安全压力；更好做法是说明几点前要到。", next: { target: "รถติดครับ เร็วกว่านี้ไม่ได้", roman: "rót tìt khráp, reo kwàa níi mâi dâi", meaning: "堵车，没法再快了。" } },
          { level: 1, target: "รีบขับสิวะ อย่าพากูอ้อม ไอ้โง่", roman: "rîip khàp sì wá, yàa phaa kuu ɔ̂ɔm, âi ngôo", meaning: "他妈的赶紧开，别带老子绕路，蠢货！", keywords: ["กู","ไอ้โง่","สิวะ","蠢货","老子"], risk: true, tip: "含粗鲁自称和直接辱骂司机，可能立即引发冲突；只用于识别，禁止对真人使用。", next: { target: "ถ้าไม่ไว้ใจ เชิญลงได้ครับ", roman: "thâa mâi wái-jai, chəən long dâi khráp", meaning: "如果不信任我，可以下车。" } }
        ],
        fallback: { target: "ขอชื่อสถานที่หรือเปิดแผนที่ให้ดูได้ไหมครับ", roman: "khɔ̌ɔ chʉ̂ʉ sà-thǎan-thîi rʉ̌ʉ pə̀ət phɛ̌ɛn-thîi hâi duu dâi mái khráp", meaning: "可以告诉我地点名称，或者打开地图给我看吗？" }
      },
      {
        id: "hotel", icon: "住", category: "travel", title: "酒店办理入住", place: "酒店前台 · 14:10", avatar: "住",
        goal: "报预订姓名，询问提前入住或寄存行李",
        opening: { target: "สวัสดีค่ะ เช็กอินใช่ไหมคะ", roman: "sà-wàt-dii khâ, chék-in châi mái khá", meaning: "您好，是来办理入住吗？" },
        options: [
          { level: 5, target: "ใช่ครับ จองไว้ในชื่อหลี่ รบกวนช่วยตรวจสอบให้หน่อยได้ไหมครับ", roman: "châi khráp, jɔɔng wái nai chʉ̂ʉ lìi, róp-kuan chûai trùat-sɔ̀ɔp hâi nɔ̀i dâi mái khráp", meaning: "是的，预订姓名是李，劳驾帮我查一下可以吗？", keywords: ["จองไว้ในชื่อหลี่","ตรวจสอบ","预订姓名","check in"], tip: "专业稳妥，适合高档酒店或处理订单异常。", next: { target: "พบการจองแล้วค่ะ ขอดูพาสปอร์ตด้วยนะคะ", roman: "phóp gaan-jɔɔng lɛ́ɛo khâ, khɔ̌ɔ duu phâat-sà-pɔ̀ɔt dûai ná khá", meaning: "查到预订了，请出示护照。" } },
          { level: 4, target: "จองไว้ในชื่อหลี่ครับ มาเช็กอินครับ", roman: "jɔɔng wái nai chʉ̂ʉ lìi khráp, maa chék-in khráp", meaning: "预订姓名是李，我来办理入住。", keywords: ["จองไว้","ชื่อหลี่","เช็กอิน","姓李"], tip: "简洁自然。把护照和订单页面提前准备好会更快。", next: { target: "ห้องพร้อมแล้วค่ะ ขอพาสปอร์ตด้วยค่ะ", roman: "hɔ̂ng phrɔ́ɔm lɛ́ɛo khâ, khɔ̌ɔ phâat-sà-pɔ̀ɔt dûai khâ", meaning: "房间准备好了，请出示护照。" } },
          { level: 3, target: "ตอนนี้เช็กอินก่อนเวลาได้ไหม", roman: "tɔɔn-níi chék-in kɔ̀ɔn wee-laa dâi mái", meaning: "现在能提前入住吗？", keywords: ["เช็กอินก่อนเวลา","提前入住","kon wela"], tip: "意思清楚但省略礼貌词尾，只适合熟人式交流；酒店前台默认使用 S4 或补ครับ/ค่ะ。", next: { target: "ห้องยังไม่พร้อมค่ะ แต่ฝากกระเป๋าไว้ก่อนได้นะคะ", roman: "hɔ̂ng yang mâi phrɔ́ɔm khâ, tɛ̀ɛ fàak grà-pǎo wái kɔ̀ɔn dâi ná khá", meaning: "房间还没准备好，不过可以先寄存行李。" } },
          { level: 2, target: "ชื่อหลี่ จองไว้แล้ว", roman: "chʉ̂ʉ lìi, jɔɔng wái lɛ́ɛo", meaning: "姓李，已经订了。", keywords: ["ชื่อหลี่","จองไว้แล้ว","姓李"], risk: true, tip: "能听懂，但像在丢信息；补 มาเช็กอินครับ 会完整很多。", next: { target: "ขอพาสปอร์ตกับเลขการจองด้วยค่ะ", roman: "khɔ̌ɔ phâat-sà-pɔ̀ɔt kàp lêek gaan-jɔɔng dûai khâ", meaning: "请提供护照和预订号。" } },
          { level: 1, target: "จองแล้ว มึงก็หาเองสิวะ โง่หรือไง", roman: "jɔɔng lɛ́ɛo, mʉng kɔ̂ hǎa eeng sì wá, ngôo rʉ̌ʉ ngai", meaning: "已经订了，你他妈自己找啊，蠢吗？", keywords: ["มึง","สิวะ","โง่","他妈","蠢"], risk: true, tip: "含粗鲁人称和能力辱骂，会让正常核验直接变成冲突；只用于识别，禁止对真人使用。", next: { target: "กรุณาแจ้งชื่อและแสดงเอกสารด้วยค่ะ", roman: "kà-rú-naa jɛ̂ɛng chʉ̂ʉ lɛ́ sà-dɛɛng èek-kà-sǎan dûai khâ", meaning: "请提供姓名和证件。" } }
        ],
        fallback: { target: "มีเลขการจองไหมคะ", roman: "mii lêek gaan-jɔɔng mái khá", meaning: "有预订号吗？" }
      },
      {
        id: "market", icon: "价", category: "daily", title: "市场礼貌讲价", place: "周末市场 · 服装摊", avatar: "价",
        goal: "询问多买优惠，不贬低商品",
        opening: { target: "ตัวนี้สามร้อยห้าสิบบาทค่ะ สนใจไหมคะ", roman: "tua níi sǎam-rɔ́ɔi hâa-sìp bàat khâ, sǒn-jai mái khá", meaning: "这个 350 泰铢，感兴趣吗？" },
        options: [
          { level: 5, target: "ถ้าซื้อสองชิ้น ไม่ทราบว่าพอจะลดราคาได้ไหมครับ", roman: "thâa sʉ́ʉ sɔ̌ɔng chín, mâi sâap wâa phɔɔ jà lót raa-khaa dâi mái khráp", meaning: "如果买两件，请问可以优惠一点吗？", keywords: ["ซื้อสองชิ้น","ลดราคา","买两件","lot rakha"], tip: "礼貌并给摊主留出回应空间，几乎不会冒犯。", next: { target: "ถ้าสองชิ้น ลดเหลือหกร้อยได้ค่ะ", roman: "thâa sɔ̌ɔng chín, lót lʉ̌a hòk-rɔ́ɔi dâi khâ", meaning: "买两件的话，可以降到 600。" } },
          { level: 4, target: "ถ้าเอาสองชิ้น หกร้อยได้ไหมครับ", roman: "thâa ao sɔ̌ɔng chín, hòk-rɔ́ɔi dâi mái khráp", meaning: "如果拿两件，600 可以吗？", keywords: ["สองชิ้น","หกร้อย","两件六百","hok roi"], tip: "直接但有礼貌句尾，是市场里的自然说法。", next: { target: "ได้ค่ะ หกร้อยพอดี", roman: "dâi khâ, hòk-rɔ́ɔi phɔɔ-dii", meaning: "可以，正好 600。" } },
          { level: 3, target: "ลดอีกนิดได้ไหม", roman: "lót ìik nít dâi mái", meaning: "能再便宜一点吗？", keywords: ["ลดอีกนิด","再便宜一点","lot ik nit"], tip: "随口且没有礼貌词尾，适合熟摊或轻松关系；面对陌生摊主默认补ครับ/ค่ะ。", next: { target: "ลดให้ได้อีกยี่สิบบาทค่ะ", roman: "lót hâi dâi ìik yîi-sìp bàat khâ", meaning: "可以再便宜 20 泰铢。" } },
          { level: 2, target: "แพงไป ลดหน่อย", roman: "phɛɛng pai, lót nɔ̀i", meaning: "太贵了，便宜点。", keywords: ["แพงไป","ลดหน่อย","太贵","phaeng pai"], risk: true, tip: "市场里能听到，但对陌生摊主略生硬；补礼貌句尾会好很多。", next: { target: "ลดได้นิดเดียวค่ะ", roman: "lót dâi nít-diao khâ", meaning: "只能便宜一点。" } },
          { level: 1, target: "โคตรแพง ไม่เอา", roman: "khôot phɛɛng, mâi ao", meaning: "贵得离谱，不要了。（粗鲁）", keywords: ["โคตรแพง","不买了","khot phaeng"], risk: true, tip: "โคตร 是粗俗强化；不买可说 ขอบคุณครับ ขอดูก่อน（谢谢，我再看看）。", next: { target: "ถ้าไม่สะดวกไม่เป็นไรค่ะ", roman: "thâa mâi sà-dùak mâi pen rai khâ", meaning: "如果不方便买也没关系。" } }
        ],
        fallback: { target: "ต้องการกี่ชิ้นคะ", roman: "tɔ̂ng-kaan kìi chín khá", meaning: "您想要几件？" }
      },
      {
        id: "work", icon: "工", category: "work", title: "职场汇报进度", place: "曼谷办公室 · 周五 15:30", avatar: "工",
        goal: "明确汇报完成度、时间和下一步",
        opening: { target: "รายงานวันนี้เสร็จไหมครับ", roman: "raai-ngaan wan-níi sèt mái khráp", meaning: "今天的报告完成了吗？" },
        options: [
          { level: 5, target: "ยังไม่เรียบร้อยทั้งหมดครับ ตอนนี้เสร็จประมาณแปดสิบเปอร์เซ็นต์ ขอส่งฉบับสมบูรณ์ก่อนห้าโมงได้ไหมครับ", roman: "yang mâi rîap-rɔ́ɔi tháng-mòt khráp, tɔɔn-níi sèt prà-maan pɛ̀ɛt-sìp pəə-sen, khɔ̌ɔ sòng chà-bàp sǒm-buun kɔ̀ɔn hâa moong dâi mái khráp", meaning: "还没全部完成，目前约 80%，可以五点前提交完整版吗？", keywords: ["แปดสิบเปอร์เซ็นต์","ก่อนห้าโมง","80%","五点前"], tip: "透明、可执行，是延期汇报的专业模板。", next: { target: "ได้ครับ ส่งก่อนห้าโมง แล้วแจ้งผมอีกทีนะครับ", roman: "dâi khráp, sòng kɔ̀ɔn hâa moong, lɛ́ɛo jɛ̂ɛng phǒm ìik thii ná khráp", meaning: "可以，五点前发，之后再通知我。" } },
          { level: 4, target: "เสร็จแล้วครับ เดี๋ยวส่งให้ตรวจนะครับ", roman: "sèt lɛ́ɛo khráp, dǐao sòng hâi trùat ná khráp", meaning: "完成了，我马上发给您检查。", keywords: ["เสร็จแล้ว","ส่งให้ตรวจ","完成了","set laeo"], tip: "自然清楚。เดี๋ยว 在这里是“马上”，说完要及时发。", next: { target: "ขอบคุณครับ ส่งทางอีเมลได้เลย", roman: "khɔ̀ɔp-khun khráp, sòng thaang ii-meeo dâi loei", meaning: "谢谢，直接通过邮件发来即可。" } },
          { level: 3, target: "เกือบเสร็จแล้ว ขอเวลาอีกชั่วโมงนะ", roman: "kʉ̀ap sèt lɛ́ɛo, khɔ̌ɔ wee-laa ìik chûa-moong ná", meaning: "快完成了，再给我一个小时哈。", keywords: ["เกือบเสร็จ","อีกชั่วโมงนะ","再给一小时"], tip: "适合熟悉的同级同事；对主管应使用 S4/S5，并给出明确提交时刻和风险。", next: { target: "โอเคครับ เสร็จแล้วส่งมาได้เลย", roman: "oo-khee khráp, sèt lɛ́ɛo sòng maa dâi loei", meaning: "好的，完成后直接发来。" } },
          { level: 2, target: "ยังอะ เดี๋ยวทำ", roman: "yang à, dǐao tham", meaning: "还没，等下做。", keywords: ["ยังอะ","เดี๋ยวทำ","还没","yang a"], risk: true, tip: "敷衍且没有任何可执行时间，即使跟熟同事也不专业。", next: { target: "ขอเวลาที่ชัดเจนด้วยครับ ว่าจะส่งได้เมื่อไร", roman: "khɔ̌ɔ wee-laa thîi chát-jeen dûai khráp, wâa jà sòng dâi mʉ̂a-rai", meaning: "请给一个明确时间，什么时候能提交？" } },
          { level: 1, target: "จะเร่งเหี้ยอะไรนักหนา มึงไม่เห็นหรือไงว่ากูยุ่งอยู่", roman: "jà rêng hîa à-rai nák-nǎa, mʉng mâi hěn rʉ̌ʉ ngai wâa kuu yûng yùu", meaning: "催他妈什么催，你没看见老子正忙吗？", keywords: ["เหี้ย","มึง","กู","他妈","老子"], risk: true, tip: "含明确粗口和粗鲁人称，是对主管的辱骂式顶撞；只用于冲突识别，禁止对真人使用。", next: { target: "นี่คือการคุยเรื่องงาน ไว้เราคุยกันเป็นการส่วนตัวครับ", roman: "nîi khʉʉ gaan khui rʉ̂ang ngaan, wái rao khui kan pen gaan sùan-tua khráp", meaning: "这是工作沟通，稍后我们单独谈。" } }
        ],
        fallback: { target: "ช่วยบอกความคืบหน้ากับเวลาที่จะส่งได้ไหมครับ", roman: "chûai bɔ̀ɔk khwaam-khʉ̂ʉp-nâa kàp wee-laa thîi jà sòng dâi mái khráp", meaning: "可以说明进度和预计提交时间吗？" }
      },
      {
        id: "friends", icon: "友", category: "friend", title: "认识新朋友", place: "语言交换活动 · 19:00", avatar: "友",
        goal: "自然自我介绍、延续话题并尊重边界",
        opening: { target: "มาคนเดียวเหรอ เราชื่อมินต์นะ", roman: "maa khon diao rə̌ə, rao chʉ̂ʉ min ná", meaning: "一个人来的吗？我叫 Mint。" },
        options: [
          { level: 5, target: "ใช่ครับ ยินดีที่ได้รู้จักครับ ผมชื่ออาไทครับ", roman: "châi khráp, yin-dii thîi dâi rúu-jàk khráp, phǒm chʉ̂ʉ aa-thai khráp", meaning: "是的，很高兴认识你，我叫阿泰。", keywords: ["ยินดีที่ได้รู้จัก","ชื่ออาไท","很高兴认识你"], tip: "很稳，但比对方稍正式；可以先礼貌再逐渐放松。", next: { target: "ยินดีที่ได้รู้จักเหมือนกัน มาจากจีนเหรอ", roman: "yin-dii thîi dâi rúu-jàk mʉ̌an-kan, maa jàak jiin rə̌ə", meaning: "我也很高兴认识你，是从中国来的吗？" } },
          { level: 4, target: "สวัสดี เราชื่ออาไท ยินดีที่ได้รู้จักนะ", roman: "sà-wàt-dii, rao chʉ̂ʉ aa-thai, yin-dii thîi dâi rúu-jàk ná", meaning: "你好，我叫阿泰，很高兴认识你。", keywords: ["เราชื่ออาไท","ยินดีที่ได้รู้จัก","我叫阿泰"], tip: "自然友好，适合同龄人第一次见面。", next: { target: "ยินดีที่ได้รู้จัก นั่งด้วยกันไหม", roman: "yin-dii thîi dâi rúu-jàk, nâng dûai-kan mái", meaning: "很高兴认识你，要一起坐吗？" } },
          { level: 3, target: "หวัดดี เราชื่ออาไท แถวนี้มีร้านอร่อยไหม", roman: "wàt-dii, rao chʉ̂ʉ aa-thai, thɛ̌ɛo níi mii ráan à-rɔ̀i mái", meaning: "嗨，我叫阿泰，这附近有好吃的店吗？", keywords: ["หวัดดี","ร้านอร่อย","附近好吃的","wat di"], tip: "轻松而有开放式话题，很适合同龄活动场合。", next: { target: "มีร้านก๋วยเตี๋ยวอร่อยมาก เดี๋ยวพาไปก็ได้", roman: "mii ráan kǔai-tǐao à-rɔ̀i mâak, dǐao phaa pai kɔ̂ɔ dâi", meaning: "有家面店特别好吃，我可以带你去。" } },
          { level: 2, target: "ชื่อมินต์เหรอ แล้วถามฉันทำไม", roman: "chʉ̂ʉ min rə̌ə, lɛ́ɛo thǎam chǎn tham-mai", meaning: "叫 Mint 是吧？那你问我干吗？", keywords: ["แล้วถามฉันทำไม","问我干吗","tham mai"], risk: true, tip: "没有粗口，但带防备和质问，会让初次聊天迅速变冷；只建议识别这种冲硬语气。", next: { target: "ไม่มีอะไรค่ะ แค่อยากทำความรู้จัก", roman: "mâi mii à-rai khâ, khɛ̂ɛ yàak tham khwaam rúu-jàk", meaning: "没什么，只是想认识一下。" } },
          { level: 1, target: "มีแฟนยังวะ หรือไม่มีใครเอา", roman: "mii fɛɛn yang wá, rʉ̌ʉ mâi mii khrai ao", meaning: "有对象没？还是根本没人要你？（人格羞辱）", keywords: ["ยังวะ","ไม่มีใครเอา","没人要","人格羞辱"], risk: true, tip: "先越界打听隐私，再用“没人要”攻击人格；只用于识别，禁止对真人使用。", next: { target: "กรุณาอย่าถามหรือพูดจาแบบนี้ค่ะ", roman: "kà-rú-naa yàa thǎam rʉ̌ʉ phûut-jaa bɛ̀ɛp níi khâ", meaning: "请不要这样提问或说话。" } }
        ],
        fallback: { target: "เมื่อกี้ว่าอะไรนะ พูดอีกทีได้ไหม", roman: "mʉ̂a-kîi wâa à-rai ná, phûut ìik thii dâi mái", meaning: "刚才说什么？可以再说一次吗？" }
      },
      {
        id: "emergency", icon: "急", category: "risk", title: "紧急求助", place: "Asok 站前 · 医疗紧急", avatar: "急",
        goal: "用最短路径说清症状、地点和需要的帮助",
        opening: { target: "มีอะไรให้ช่วยไหมครับ", roman: "mii à-rai hâi chûai mái khráp", meaning: "有什么需要帮忙吗？" },
        options: [
          { level: 5, target: "เพื่อนหายใจไม่ออก อยู่หน้าสถานีอโศก ช่วยเรียกรถพยาบาลให้หน่อยครับ", roman: "phʉ̂an hǎai-jai mâi ɔ̀ɔk, yùu nâa sà-thǎa-nii à-sòok, chûai rîak rót-phá-yaa-baan hâi nɔ̀i khráp", meaning: "朋友无法呼吸，我们在 Asok 站前，请帮忙叫救护车。", keywords: ["หายใจไม่ออก","สถานีอโศก","รถพยาบาล","无法呼吸","救护车"], tip: "症状、地点、需求完整；紧急场合信息清楚比堆敬语更重要。", next: { target: "รับทราบครับ จะโทร 1669 ตอนนี้เลย ผู้ป่วยรู้สึกตัวไหมครับ", roman: "ráp-sâap khráp, jà thoo nʉ̀ng-hòk-hòk-kâao tɔɔn-níi loei, phûu-pùai rúu-sʉ̀k-tua mái khráp", meaning: "明白，马上拨 1669。病人有意识吗？" } },
          { level: 4, target: "ช่วยด้วย! มีคนหมดสติ ช่วยโทร 1669 ให้หน่อยครับ", roman: "chûai dûai! mii khon mòt sà-tì, chûai thoo nʉ̀ng-hòk-hòk-kâao hâi nɔ̀i khráp", meaning: "救命！有人昏迷，请帮忙拨打 1669。", keywords: ["ช่วยด้วย","หมดสติ","1669","昏迷","救命"], tip: "短、明确、完全适合真实紧急情况。", next: { target: "ได้ครับ โทรแล้ว ตอนนี้คนป่วยหายใจอยู่ไหมครับ", roman: "dâi khráp, thoo lɛ́ɛo, tɔɔn-níi khon-pùai hǎai-jai yùu mái khráp", meaning: "已拨打。病人现在有呼吸吗？" } },
          { level: 3, target: "โทร 1669 ที ด่วน!", roman: "thoo nʉ̀ng-hòk-hòk-kâao thii, dùan", meaning: "快拨 1669，紧急！", keywords: ["โทร 1669","ด่วน","快拨1669","紧急"], tip: "虽然直接，但在眼前的医疗紧急中完全合理；接着要补症状和位置。", next: { target: "โทรแล้วครับ เกิดอะไรขึ้น และอยู่ตรงไหนครับ", roman: "thoo lɛ́ɛo khráp, kə̀ət à-rai khʉ̂n, lɛ́ yùu trong nǎi khráp", meaning: "已经拨打。发生了什么，你们在哪里？" } },
          { level: 2, target: "เร็ว ๆ สิ บอกให้โทร 1669 ไง!", roman: "reo-reo sì, bɔ̀ɔk hâi thoo nʉ̀ng-hòk-hòk-kâao ngai", meaning: "快点啊，都说了打 1669 了！", keywords: ["เร็ว ๆ สิ","บอกให้โทร","快点","都说了"], risk: true, tip: "没有粗口，但在急迫信息之外又加入责怪；真实急救应直接补充症状、意识和位置。", next: { target: "อยู่ที่ไหนครับ แล้วผู้ป่วยมีอาการอะไร", roman: "yùu thîi nǎi khráp, lɛ́ɛo phûu-pùai mii aa-gaan à-rai", meaning: "在哪里？病人有什么症状？" } },
          { level: 1, target: "รีบไสหัวมานี่เลย!", roman: "rîip sǎi-hǔa maa nîi loei", meaning: "赶紧滚过来！", keywords: ["ไสหัวมา","滚过来","sai hua"], risk: true, tip: "辱骂不提供任何救命信息，只会浪费时间；立刻改说症状和地点。", next: { target: "เพื่อช่วยผู้ป่วย กรุณาบอกสถานที่และอาการให้ชัดเจนครับ", roman: "phʉ̂a chûai phûu-pùai, kà-rú-naa bɔ̀ɔk sà-thǎan-thîi lɛ́ aa-gaan hâi chát-jeen khráp", meaning: "为了帮助病人，请清楚说明地点和症状。" } }
        ],
        fallback: { target: "ใจเย็น ๆ นะครับ บอกก่อนว่าเกิดอะไรขึ้น และอยู่ตรงไหน", roman: "jai yen-yen ná khráp, bɔ̀ɔk kɔ̀ɔn wâa kə̀ət à-rai khʉ̂n, lɛ́ yùu trong nǎi", meaning: "先冷静，告诉我发生了什么，以及你在哪里。" },
        safety: "训练提示：泰国院前医疗急救为 1669；真实情况请立即联系当地急救并服从调度员指引。"
      }
    ]
  },
  "th-zh": {
    ui: {
      eyebrow: "OFFLINE REAL-TIME · ตอบทันที",
      title: "ไม่ใช้อินเทอร์เน็ต<br><em>ก็คุยต่อได้</em>",
      subtitle: "บรรจุ 8 สถานการณ์จริง ประโยคตอบกลับ และคำเตือนเรื่องกาลเทศะไว้ในเครื่อง นี่คือเอนจินสถานการณ์ ไม่แอบอ้างว่าเป็น AI ออนไลน์",
      badge: "เอนจินในเครื่อง · ออฟไลน์", proofScenes: "สถานการณ์", proofBranches: "ทางเลือกคุณภาพ", proofNetwork: "ดาต้าสนทนา",
      sceneEyebrow: "เลือกสถานการณ์ก่อน", sceneHeading: "ตอนนี้คุณอยู่ที่ไหน?", reset: "เริ่มใหม่",
      engineNote: "จับคู่คำตอบในเครื่อง · ไม่อัปโหลด", typing: "คู่สนทนาในเครื่องกำลังตอบ",
      inputLabel: "พิมพ์คำตอบภาษาจีน", inputPlaceholder: "พิมพ์ภาษาจีน พินอิน หรือความหมายไทยก็ได้…",
      voiceChecking: "กำลังตรวจเสียงออฟไลน์", voiceAlways: "เลือกประโยคและพิมพ์ได้ออฟไลน์เสมอ",
      voiceReady: "รู้จำเสียงจีนในเครื่องพร้อม", voiceReadyNote: "ประมวลผลเสียงบนเครื่องนี้เท่านั้น ไม่ส่งขึ้นคลาวด์",
      voicePackNeeded: "ต้องมีชุดภาษาจีนออฟไลน์", voicePackNote: "ติดตั้งครั้งแรกต้องใช้อินเทอร์เน็ต หลังจากนั้นใช้แบบออฟไลน์ได้",
      voiceUnavailable: "เครื่องนี้ยังไม่รองรับเสียงจีนออฟไลน์", voiceFallback: "ยังเลือกประโยค พิมพ์ และอัดเสียงฟังเองได้",
      installVoice: "ติดตั้งชุดจีน", startVoice: "แตะแล้วพูด", listening: "กำลังฟัง…",
      record: "อัดเสียงตาม", stopRecord: "หยุดอัด", recordNote: "เสียงอยู่ในหน้านี้เท่านั้น รีเฟรชแล้วจะลบ",
      online: "ออนไลน์", offline: "ออฟไลน์แล้ว", truth: "บทสนทนาออฟไลน์ไม่เรียกคลาวด์ การรู้จำเสียงเปิดเฉพาะเมื่อเครื่องยืนยันว่ามีชุดภาษาในเครื่อง",
      noMatch: "เอนจินในเครื่องยังจับความหมายไม่ได้ ระบบจะไม่แต่งคำตอบเอง ลองใช้คำสำคัญหรือเลือกประโยคแนะนำ",
      riskPrefix: "ฟังไว้ป้องกันตัว", safePrefix: "กาลเทศะ", nextScene: "ฉากถัดไป", tryAgain: "ลองอีกแบบ",
      installApp: "ติดตั้งเวอร์ชันออฟไลน์", installAction: "ติดตั้ง", installManual: "ดูวิธี",
      offlineReady: "เนื้อหาออฟไลน์พร้อมแล้ว", offlineReadyCopy: "การ์ด 40+ ประโยค บทเรียน และบทสนทนาไม่ต้องล็อกอิน"
    },
    scenarios: [
      {
        id: "convenience", icon: "袋", category: "daily", title: "ร้านสะดวกซื้อ", place: "ร้านสะดวกซื้อ · จุดชำระเงิน", avatar: "店", goal: "ปฏิเสธถุงอย่างสุภาพ",
        opening: { target: "您好，需要袋子吗？", roman: "Nín hǎo, xūyào dàizi ma?", meaning: "สวัสดีครับ/ค่ะ ต้องการถุงไหม?" },
        options: [
          { level: 5, target: "不用了，谢谢您。我自己带了袋子。", roman: "Bú yòng le, xièxie nín. Wǒ zìjǐ dài le dàizi.", meaning: "ไม่รับแล้ว ขอบคุณครับ/ค่ะ พอดีนำถุงมาเอง", keywords: ["不用了","谢谢您","自己带","bu yong","ถุงมาเอง"], tip: "สุภาพมาก เหมาะกับผู้ใหญ่ แต่เรียบร้อยกว่าที่จำเป็นเล็กน้อย", next: { target: "好的，一共十二块五。请问您怎么支付？", roman: "Hǎo de, yígòng shí'èr kuài wǔ. Qǐngwèn nín zěnme zhīfù?", meaning: "ได้เลย รวม 12.5 หยวน ไม่ทราบว่าจะชำระแบบไหน?" } },
          { level: 4, target: "不用了，谢谢。", roman: "Bú yòng le, xièxie.", meaning: "ไม่รับแล้วครับ/ค่ะ ขอบคุณ", keywords: ["不用了","谢谢","bu yong","ไม่รับ"], tip: "สั้น สุภาพ และเป็นธรรมชาติที่สุดในร้านทั่วไป", next: { target: "好的，一共十二块五。微信还是支付宝？", roman: "Hǎo de, yígòng shí'èr kuài wǔ. Wēixìn háishi Zhīfùbǎo?", meaning: "รวม 12.5 หยวน จะจ่าย WeChat หรือ Alipay?" } },
          { level: 3, target: "不用啦，我有袋子。", roman: "Bú yòng la, wǒ yǒu dàizi.", meaning: "ไม่ต้องหรอก ฉันมีถุงแล้ว", keywords: ["不用啦","我有袋子","bu yong la","มีถุง"], tip: "啦 ทำให้น้ำเสียงกันเอง ใช้ได้แต่ไม่จำเป็นกับพนักงานที่ไม่รู้จัก", next: { target: "好嘞，一共十二块五。", roman: "Hǎo lei, yígòng shí'èr kuài wǔ.", meaning: "ได้เลย รวม 12.5 หยวน" } },
          { level: 2, target: "不用，别给我。", roman: "Bú yòng, bié gěi wǒ.", meaning: "ไม่ต้อง อย่าให้ฉัน", keywords: ["别给我","不用","bie gei wo","อย่าให้"], risk: true, tip: "别给我 เป็นคำสั่งตรง ฟังเหมือนกำลังรำคาญ", next: { target: "行，一共十二块五。", roman: "Xíng, yígòng shí'èr kuài wǔ.", meaning: "โอเค รวม 12.5 หยวน" } },
          { level: 1, target: "他妈的，说了不要，你烦不烦？", roman: "Tā mā de, shuō le bú yào, nǐ fán bu fán?", meaning: "แม่งเอ๊ย บอกว่าไม่เอาไง จะน่ารำคาญไปถึงไหน?", keywords: ["他妈的","烦不烦","ta ma de","แม่ง"], risk: true, tip: "มีคำสบถและตำหนิพนักงานโดยตรง ใช้เพื่อฟังให้รู้ทันเท่านั้น ห้ามพูดกับคนจริง", next: { target: "请您注意说话方式。", roman: "Qǐng nín zhùyì shuōhuà fāngshì.", meaning: "กรุณาระวังวิธีพูดด้วยครับ/ค่ะ" } }
        ],
        fallback: { target: "不好意思，我没听清。您需要袋子吗？", roman: "Bù hǎoyìsi, wǒ méi tīng qīng. Nín xūyào dàizi ma?", meaning: "ขอโทษครับ/ค่ะ ฟังไม่ชัด ตกลงรับถุงไหม?" }
      },
      {
        id: "restaurant", icon: "餐", category: "daily", title: "ร้านอาหาร", place: "ร้านอาหาร · จุดต้อนรับ", avatar: "餐", goal: "บอกจำนวนคนและขอที่นั่งริมหน้าต่าง",
        opening: { target: "您好，请问几位？", roman: "Nín hǎo, qǐngwèn jǐ wèi?", meaning: "สวัสดีครับ/ค่ะ มากันกี่ท่าน?" },
        options: [
          { level: 5, target: "您好，我们两位。麻烦安排一个安静一点的位置，可以吗？", roman: "Nín hǎo, wǒmen liǎng wèi. Máfan ānpái yí ge ānjìng yìdiǎn de wèizhi, kěyǐ ma?", meaning: "เรามาสองคน รบกวนจัดที่นั่งที่เงียบหน่อยได้ไหม?", keywords: ["我们两位","麻烦安排","安静一点","liang wei","ที่เงียบ"], tip: "位 เป็นลักษณนามสุภาพ เหมาะกับร้านทางการหรือเมื่อพาแขกมา", next: { target: "可以的。里面靠窗的位置比较安静。", roman: "Kěyǐ de. Lǐmiàn kàochuāng de wèizhi bǐjiào ānjìng.", meaning: "ได้ครับ/ค่ะ ที่ริมหน้าต่างด้านในค่อนข้างเงียบ" } },
          { level: 4, target: "两位，谢谢。有靠窗的位置吗？", roman: "Liǎng wèi, xièxie. Yǒu kàochuāng de wèizhi ma?", meaning: "สองท่าน ขอบคุณ มีที่นั่งริมหน้าต่างไหม?", keywords: ["两位","谢谢","靠窗","liang wei","ริมหน้าต่าง"], tip: "สั้นพอดีและสุภาพ ใช้ได้แทบทุกร้าน", next: { target: "有的，这边请。", roman: "Yǒu de, zhèbiān qǐng.", meaning: "มีครับ/ค่ะ เชิญทางนี้" } },
          { level: 3, target: "我们俩，靠窗坐行吗？", roman: "Wǒmen liǎ, kàochuāng zuò xíng ma?", meaning: "เราสองคน นั่งริมหน้าต่างได้ไหม?", keywords: ["我们俩","靠窗坐","行吗","women lia"], tip: "俩 เป็นภาษาพูดธรรมชาติในร้านทั่วไป แต่ไม่เหมาะกับงานทางการ", next: { target: "可以，跟我来吧。", roman: "Kěyǐ, gēn wǒ lái ba.", meaning: "ได้ครับ/ค่ะ ตามมาเลย" } },
          { level: 2, target: "两个人，给个靠窗的。", roman: "Liǎng ge rén, gěi ge kàochuāng de.", meaning: "สองคน เอาที่ริมหน้าต่างมาให้หน่อย", keywords: ["两个人","给个靠窗","gei ge kaochuang"], risk: true, tip: "ตัดคำสุภาพออกหมด จึงฟังเหมือนสั่งพนักงาน", next: { target: "靠窗现在没有，要等。", roman: "Kàochuāng xiànzài méiyǒu, yào děng.", meaning: "ตอนนี้ที่ริมหน้าต่างไม่มี ต้องรอ" } },
          { level: 1, target: "两个人，赶紧他妈给我找个位子，磨蹭什么？", roman: "Liǎng ge rén, gǎnjǐn tā mā gěi wǒ zhǎo ge wèizi, móceng shénme?", meaning: "สองคน รีบหาที่ให้ฉันเดี๋ยวนี้สิวะ จะชักช้าอะไร?", keywords: ["他妈","磨蹭什么","ta ma","สิวะ"], risk: true, tip: "มีคำสบถและการเร่งพนักงานแบบดูถูก ใช้เพื่อแยกแยะคำหยาบเท่านั้น ห้ามพูดตาม", next: { target: "请您耐心等待，不要催促。", roman: "Qǐng nín nàixīn děngdài, bú yào cuīcù.", meaning: "กรุณารออย่างใจเย็นและอย่าเร่งพนักงาน" } }
        ],
        fallback: { target: "不好意思，请问您几位？", roman: "Bù hǎoyìsi, qǐngwèn nín jǐ wèi?", meaning: "ขอโทษครับ/ค่ะ ขอทราบจำนวนคนอีกครั้ง" }
      },
      {
        id: "taxi", icon: "车", category: "travel", title: "เรียกรถและแท็กซี่", place: "ในรถ · เพิ่งขึ้นรถ", avatar: "车", goal: "บอกจุดหมายและคุยกับคนขับอย่างให้เกียรติ",
        opening: { target: "您好，请问去哪儿？", roman: "Nín hǎo, qǐngwèn qù nǎr?", meaning: "สวัสดีครับ/ค่ะ จะไปที่ไหน?" },
        options: [
          { level: 5, target: "您好，麻烦送我到上海虹桥火车站。如果方便的话，请按导航走。", roman: "Nín hǎo, máfan sòng wǒ dào Shànghǎi Hóngqiáo Huǒchēzhàn. Rúguǒ fāngbiàn de huà, qǐng àn dǎoháng zǒu.", meaning: "รบกวนไปส่งสถานีหงเฉียว หากสะดวกช่วยขับตามระบบนำทาง", keywords: ["麻烦送我","虹桥火车站","按导航走","hongqiao","นำทาง"], tip: "ขอให้ขับตามแผนที่ได้ แต่ใช้ 如果方便 หรือ 请 เพื่อไม่ให้ฟังเหมือนกล่าวหา", next: { target: "好的，我会按导航行驶，预计四十分钟左右到。", roman: "Hǎo de, wǒ huì àn dǎoháng xíngshǐ, yùjì sìshí fēnzhōng zuǒyòu dào.", meaning: "ได้ครับ จะขับตามระบบ คาดว่าประมาณ 40 นาที" } },
          { level: 4, target: "师傅，去上海虹桥火车站，麻烦您了。", roman: "Shīfu, qù Shànghǎi Hóngqiáo Huǒchēzhàn, máfan nín le.", meaning: "พี่คนขับ ไปสถานีรถไฟหงเฉียว รบกวนด้วย", keywords: ["师傅","虹桥火车站","麻烦您","shifu"], tip: "师傅 เป็นคำเรียกคนขับที่สุภาพและใช้แพร่หลาย", next: { target: "好嘞，系好安全带，我们出发。", roman: "Hǎo lei, jì hǎo ānquándài, wǒmen chūfā.", meaning: "ได้เลย คาดเข็มขัด แล้วออกเดินทางกัน" } },
          { level: 3, target: "师傅，去虹桥火车站，谢谢。", roman: "Shīfu, qù Hóngqiáo Huǒchēzhàn, xièxie.", meaning: "พี่คนขับ ไปสถานีรถไฟหงเฉียว ขอบคุณ", keywords: ["师傅","虹桥火车站","谢谢","shifu"], tip: "ภาษาพูดสั้น ๆ ที่ยังสุภาพและใช้จริงได้", next: { target: "没问题，大概四十分钟。", roman: "Méi wèntí, dàgài sìshí fēnzhōng.", meaning: "ไม่มีปัญหา ประมาณ 40 นาที" } },
          { level: 2, target: "去虹桥，开快点。", roman: "Qù Hóngqiáo, kāi kuài diǎn.", meaning: "ไปหงเฉียว ขับเร็วหน่อย", keywords: ["去虹桥","开快点","kai kuai dian","ขับเร็ว"], risk: true, tip: "เป็นคำสั่งและอาจกดดันให้ขับไม่ปลอดภัย ควรบอกเวลาที่ต้องถึงแทน", next: { target: "现在堵车，没法开太快。", roman: "Xiànzài dǔchē, méi fǎ kāi tài kuài.", meaning: "ตอนนี้รถติด ขับเร็วมากไม่ได้" } },
          { level: 1, target: "虹桥，赶紧开，别他妈给我绕路！", roman: "Hóngqiáo, gǎnjǐn kāi, bié tā mā gěi wǒ ràolù!", meaning: "ไปหงเฉียว รีบขับ แล้วอย่าพากูอ้อมทางนะโว้ย!", keywords: ["别他妈","赶紧开","ta ma","กู","โว้ย"], risk: true, tip: "มีคำสบถ คำสั่ง และข้อกล่าวหาคนขับ อาจก่อให้เกิดการทะเลาะทันที ใช้เพื่อแยกแยะเท่านั้น", next: { target: "请您尊重司机。不放心的话，可以取消订单。", roman: "Qǐng nín zūnzhòng sījī. Bù fàngxīn de huà, kěyǐ qǔxiāo dìngdān.", meaning: "กรุณาให้เกียรติคนขับ หากไม่ไว้ใจสามารถยกเลิกได้" } }
        ],
        fallback: { target: "请告诉我具体的目的地。", roman: "Qǐng gàosu wǒ jùtǐ de mùdìdì.", meaning: "กรุณาบอกจุดหมายให้ชัดเจนครับ" }
      },
      {
        id: "hotel", icon: "住", category: "travel", title: "เช็กอินโรงแรม", place: "โรงแรม · เคาน์เตอร์ต้อนรับ", avatar: "住", goal: "แจ้งว่ามีการจองและยื่นหนังสือเดินทาง",
        opening: { target: "您好，请问您有预订吗？", roman: "Nín hǎo, qǐngwèn nín yǒu yùdìng ma?", meaning: "สวัสดีครับ/ค่ะ จองไว้ไหม?" },
        options: [
          { level: 5, target: "您好，我有预订，名字是米娜。这是我的护照，麻烦您帮我查一下。", roman: "Nín hǎo, wǒ yǒu yùdìng, míngzi shì Mǐnà. Zhè shì wǒ de hùzhào, máfan nín bāng wǒ chá yíxià.", meaning: "จองไว้ในชื่อมีนา นี่คือหนังสือเดินทาง รบกวนช่วยตรวจสอบ", keywords: ["我有预订","名字是米娜","护照","麻烦您","huzhao"], tip: "ชื่อจองควรตรงกับหนังสือเดินทาง ประโยคนี้ข้อมูลครบและมืออาชีพ", next: { target: "好的，米娜女士。预订两晚，请您稍等。", roman: "Hǎo de, Mǐnà nǚshì. Yùdìng liǎng wǎn, qǐng nín shāo děng.", meaning: "พบรายการจองสองคืน กรุณารอสักครู่" } },
          { level: 4, target: "有的，预订人是米娜。这是护照，谢谢。", roman: "Yǒu de, yùdìng rén shì Mǐnà. Zhè shì hùzhào, xièxie.", meaning: "จองไว้ ชื่อผู้จองคือมีนา นี่หนังสือเดินทาง ขอบคุณ", keywords: ["预订人","米娜","这是护照","yuding ren"], tip: "กระชับ สุภาพ และให้ข้อมูลครบ เหมาะกับโรงแรมทั่วไป", next: { target: "找到了。请问您住几晚？", roman: "Zhǎo dào le. Qǐngwèn nín zhù jǐ wǎn?", meaning: "พบรายการแล้ว พักกี่คืน?" } },
          { level: 3, target: "有，米娜订的。这是护照。", roman: "Yǒu, Mǐnà dìng de. Zhè shì hùzhào.", meaning: "มี มีนาเป็นคนจอง นี่หนังสือเดินทาง", keywords: ["米娜订的","这是护照","mina ding de"], tip: "เข้าใจได้และเป็นภาษาพูด แต่เติมคำขอบคุณจะลื่นไหลกว่า", next: { target: "好的，我帮您查一下。", roman: "Hǎo de, wǒ bāng nín chá yíxià.", meaning: "ได้ครับ/ค่ะ จะตรวจสอบให้" } },
          { level: 2, target: "有，查一下米娜。", roman: "Yǒu, chá yíxià Mǐnà.", meaning: "มี เช็กชื่อมีนาหน่อย", keywords: ["查一下米娜","cha yixia mina"], risk: true, tip: "คำกริยาอยู่ต้นโดยไม่มี 请 หรือ 麻烦 จึงเหมือนสั่งงาน", next: { target: "请把护照给我。", roman: "Qǐng bǎ hùzhào gěi wǒ.", meaning: "กรุณาส่งหนังสือเดินทางให้" } },
          { level: 1, target: "当然订了，你不会自己查吗？", roman: "Dāngrán dìng le, nǐ bú huì zìjǐ chá ma?", meaning: "ก็จองแล้วสิ เช็กเองไม่เป็นหรือไง?", keywords: ["不会自己查吗","当然订了","bu hui ziji cha"], risk: true, tip: "ประชดความสามารถของพนักงาน อาจทำให้การบริการหยุดชะงัก", next: { target: "请您配合提供姓名和证件，否则无法办理入住。", roman: "Qǐng nín pèihé tígōng xìngmíng hé zhèngjiàn, fǒuzé wúfǎ bànlǐ rùzhù.", meaning: "กรุณาแจ้งชื่อและเอกสาร มิฉะนั้นเช็กอินไม่ได้" } }
        ],
        fallback: { target: "请问预订人的姓名是？", roman: "Qǐngwèn yùdìng rén de xìngmíng shì?", meaning: "ขอทราบชื่อผู้จองครับ/ค่ะ" }
      },
      {
        id: "market", icon: "价", category: "daily", title: "ตลาดและการต่อราคา", place: "ตลาด · ร้านผ้าพันคอ", avatar: "价", goal: "ขอลดราคาโดยไม่กล่าวหาว่าร้านโกง",
        opening: { target: "这条围巾一百二，喜欢可以试试。", roman: "Zhè tiáo wéijīn yì bǎi èr, xǐhuan kěyǐ shìshi.", meaning: "ผ้าพันคอผืนนี้ 120 หยวน ถ้าชอบลองได้" },
        options: [
          { level: 5, target: "挺好看的。请问价格还能优惠一点吗？", roman: "Tǐng hǎokàn de. Qǐngwèn jiàgé hái néng yōuhuì yìdiǎn ma?", meaning: "สวยดี ขอถามว่าราคาลดได้อีกเล็กน้อยไหม?", keywords: ["挺好看的","优惠一点","qingwen","ลดราคา"], tip: "优惠 ฟังสุภาพกว่า 便宜 เหมาะกับการต่อราคาแบบรักษาบรรยากาศ", next: { target: "可以给您算一百零五，您觉得怎么样？", roman: "Kěyǐ gěi nín suàn yì bǎi líng wǔ, nín juéde zěnmeyàng?", meaning: "ลดให้เหลือ 105 หยวน คิดว่าอย่างไร?" } },
          { level: 4, target: "我挺喜欢的，能便宜一点吗？", roman: "Wǒ tǐng xǐhuan de, néng piányi yìdiǎn ma?", meaning: "ฉันชอบนะ ลดให้อีกหน่อยได้ไหม?", keywords: ["挺喜欢","便宜一点","pianyi yidian","ลดหน่อย"], tip: "ตรง เป็นมิตร ใช้ได้ในตลาดหรือร้านที่ต่อรองได้", next: { target: "最低一百，行的话给您包起来。", roman: "Zuìdī yì bǎi, xíng de huà gěi nín bāo qǐlai.", meaning: "ต่ำสุด 100 หยวน ถ้าโอเคจะห่อให้" } },
          { level: 3, target: "老板，九十可以吗？可以我就拿。", roman: "Lǎobǎn, jiǔshí kěyǐ ma? Kěyǐ wǒ jiù ná.", meaning: "เถ้าแก่ 90 หยวนได้ไหม? ถ้าได้เอาเลย", keywords: ["老板","九十可以吗","我就拿","laoban"], tip: "老板 เรียกเจ้าของร้านได้อย่างกันเอง ใช้กับร้านที่ต่อรองได้", next: { target: "九十不行，一百怎么样？", roman: "Jiǔshí bù xíng, yì bǎi zěnmeyàng?", meaning: "90 ไม่ได้ 100 หยวนเป็นอย่างไร?" } },
          { level: 2, target: "太贵了，八十卖不卖？", roman: "Tài guì le, bāshí mài bu mài?", meaning: "แพงเกิน 80 ขายไหม?", keywords: ["太贵了","八十卖不卖","mai bu mai"], risk: true, tip: "卖不卖 ตรงและแข็ง ถ้ากดต่ำเกินร้านอาจหยุดคุย", next: { target: "八十不卖，最低一百。", roman: "Bāshí bú mài, zuìdī yì bǎi.", meaning: "80 ไม่ขาย ต่ำสุด 100" } },
          { level: 1, target: "这也敢卖一百二？坑谁呢？", roman: "Zhè yě gǎn mài yì bǎi èr? Kēng shéi ne?", meaning: "ของแบบนี้ยังกล้าขาย 120? คิดจะโกงใคร?", keywords: ["也敢卖","坑谁呢","keng shei","โกง"], risk: true, tip: "坑谁呢 กล่าวหาว่าโกง เป็นการดูถูก ไม่ใช่เทคนิคต่อราคา", next: { target: "您要是不喜欢可以不买，请别这样说。", roman: "Nín yàoshi bù xǐhuan kěyǐ bú mǎi, qǐng bié zhèyàng shuō.", meaning: "ถ้าไม่ชอบไม่ซื้อก็ได้ กรุณาอย่าพูดแบบนี้" } }
        ],
        fallback: { target: "您想出多少钱？", roman: "Nín xiǎng chū duōshao qián?", meaning: "คุณต้องการเสนอราคาเท่าไร?" }
      },
      {
        id: "work", icon: "工", category: "work", title: "คุยงานกับหัวหน้า", place: "ที่ทำงาน · กำหนดส่งวันนี้", avatar: "工", goal: "รับงานพร้อมยืนยันเวลาและลำดับสำคัญ",
        opening: { target: "这个方案今天下午能改完吗？", roman: "Zhège fāng'àn jīntiān xiàwǔ néng gǎi wán ma?", meaning: "แผนงานนี้แก้ให้เสร็จบ่ายวันนี้ได้ไหม?" },
        options: [
          { level: 5, target: "可以。我会在下午四点前完成修改，并把重点变化整理好发给您。", roman: "Kěyǐ. Wǒ huì zài xiàwǔ sì diǎn qián wánchéng xiūgǎi, bìng bǎ zhòngdiǎn biànhuà zhěnglǐ hǎo fā gěi nín.", meaning: "ได้ จะปรับเสร็จก่อนสี่โมงและสรุปจุดเปลี่ยนส่งให้", keywords: ["四点前","完成修改","重点变化","si dian qian"], tip: "เวลาชัดและสิ่งส่งมอบชัด ฟังเป็นมืออาชีพ", next: { target: "好，那请你四点前发我，重点变化单独标出来。", roman: "Hǎo, nà qǐng nǐ sì diǎn qián fā wǒ, zhòngdiǎn biànhuà dāndú biāo chūlai.", meaning: "ดี ส่งก่อนสี่โมงและทำเครื่องหมายจุดสำคัญ" } },
          { level: 4, target: "可以，下午四点前给您。需要我优先改哪一部分吗？", roman: "Kěyǐ, xiàwǔ sì diǎn qián gěi nín. Xūyào wǒ yōuxiān gǎi nǎ yí bùfen ma?", meaning: "ได้ จะส่งก่อนสี่โมง ต้องการให้แก้ส่วนไหนก่อน?", keywords: ["四点前给您","优先改","youxian gai","ส่วนไหนก่อน"], tip: "ถามลำดับความสำคัญช่วยลดการแก้ผิดจุดและแสดงความรับผิดชอบ", next: { target: "先改数据部分，其他的你看着调整。", roman: "Xiān gǎi shùjù bùfen, qítā de nǐ kànzhe tiáozhěng.", meaning: "แก้ส่วนข้อมูลก่อน ส่วนอื่นปรับตามเหมาะสม" } },
          { level: 3, target: "应该可以，我下午改完发你。", roman: "Yīnggāi kěyǐ, wǒ xiàwǔ gǎi wán fā nǐ.", meaning: "น่าจะได้ บ่ายนี้แก้เสร็จแล้วส่งให้", keywords: ["应该可以","改完发你","yinggai keyi"], tip: "应该可以 ฟังไม่มั่นใจ หากมีความเสี่ยงควรบอกสาเหตุหรือเวลายืนยัน", next: { target: "行，有问题及时告诉我。", roman: "Xíng, yǒu wèntí jíshí gàosu wǒ.", meaning: "โอเค ถ้ามีปัญหาให้บอกทันที" } },
          { level: 2, target: "知道了，下午给你。", roman: "Zhīdào le, xiàwǔ gěi nǐ.", meaning: "รู้แล้ว บ่ายนี้จะให้", keywords: ["知道了","下午给你","zhidao le"], risk: true, tip: "เวลาไม่แน่นอน และ 知道了 อาจฟังเหมือนรำคาญหัวหน้า", next: { target: "别只说知道了，告诉我几点能交。", roman: "Bié zhǐ shuō zhīdào le, gàosu wǒ jǐ diǎn néng jiāo.", meaning: "อย่าบอกแค่ว่ารู้แล้ว บอกว่าจะส่งกี่โมง" } },
          { level: 1, target: "催个屁，没看老子正忙吗？", roman: "Cuī ge pì, méi kàn lǎozi zhèng máng ma?", meaning: "จะเร่งห่าอะไร ไม่เห็นหรือว่ากูกำลังยุ่ง?", keywords: ["催个屁","老子","cui ge pi","ห่า","กู"], risk: true, tip: "มีคำหยาบและสรรพนามก้าวร้าว เป็นการด่ากลับหัวหน้าโดยตรง ใช้เพื่อแยกแยะเท่านั้น ห้ามพูดตาม", next: { target: "这是工作沟通，请你冷静一下。稍后我们单独谈。", roman: "Zhè shì gōngzuò gōutōng, qǐng nǐ lěngjìng yíxià. Shāohòu wǒmen dāndú tán.", meaning: "นี่เป็นการสื่อสารงาน กรุณาใจเย็น แล้วคุยกันส่วนตัว" } }
        ],
        fallback: { target: "你预计几点能完成？", roman: "Nǐ yùjì jǐ diǎn néng wánchéng?", meaning: "คุณคาดว่าจะทำเสร็จกี่โมง?" }
      },
      {
        id: "friends", icon: "友", category: "friend", title: "ทำความรู้จักเพื่อนใหม่", place: "กิจกรรมแลกเปลี่ยนภาษา", avatar: "友", goal: "แนะนำตัวและชวนคุยต่ออย่างธรรมชาติ",
        opening: { target: "你也是第一次来这个活动吗？", roman: "Nǐ yě shì dì-yī cì lái zhège huódòng ma?", meaning: "คุณก็มางานนี้ครั้งแรกเหมือนกันเหรอ?" },
        options: [
          { level: 5, target: "是的，这是我第一次参加。很高兴认识你，我叫敏，请问怎么称呼你？", roman: "Shì de, zhè shì wǒ dì-yī cì cānjiā. Hěn gāoxìng rènshi nǐ, wǒ jiào Mǐn, qǐngwèn zěnme chēnghu nǐ?", meaning: "ใช่ ครั้งแรก ยินดีที่รู้จัก ฉันชื่อหมิ่น ควรเรียกคุณว่าอะไร?", keywords: ["第一次参加","很高兴认识你","我叫敏","怎么称呼"], tip: "สุภาพมากและปลอดภัย แต่อาจทางการนิดหนึ่งกับคนวัยเดียวกัน", next: { target: "我姓李，叫我小李就好。很高兴认识你。", roman: "Wǒ xìng Lǐ, jiào wǒ Xiǎo Lǐ jiù hǎo. Hěn gāoxìng rènshi nǐ.", meaning: "ฉันแซ่หลี่ เรียกเสี่ยวหลี่ก็ได้ ยินดีที่รู้จัก" } },
          { level: 4, target: "对，我第一次来。我叫敏，你呢？", roman: "Duì, wǒ dì-yī cì lái. Wǒ jiào Mǐn, nǐ ne?", meaning: "ใช่ ฉันมาครั้งแรก ฉันชื่อหมิ่น แล้วคุณล่ะ?", keywords: ["第一次来","我叫敏","你呢","wo jiao min"], tip: "你呢 ส่งคำถามกลับอย่างสั้นและธรรมชาติ ทำให้คุยต่อได้", next: { target: "我叫小李。要不要一起看看活动表？", roman: "Wǒ jiào Xiǎo Lǐ. Yào bu yào yìqǐ kànkan huódòngbiǎo?", meaning: "ฉันชื่อเสี่ยวหลี่ ไปดูตารางกิจกรรมด้วยกันไหม?" } },
          { level: 3, target: "对啊，第一次。叫我敏就行，你呢？", roman: "Duì a, dì-yī cì. Jiào wǒ Mǐn jiù xíng, nǐ ne?", meaning: "ใช่ ครั้งแรก เรียกฉันว่าหมิ่นก็พอ แล้วคุณล่ะ?", keywords: ["对啊","叫我敏就行","你呢"], tip: "就行 ทำให้น้ำเสียงสบาย เหมาะกับเพื่อนวัยเดียวกัน", next: { target: "我小李。走，一起去领名牌吧。", roman: "Wǒ Xiǎo Lǐ. Zǒu, yìqǐ qù lǐng míngpái ba.", meaning: "ฉันเสี่ยวหลี่ ไปเอาป้ายชื่อด้วยกัน" } },
          { level: 2, target: "嗯，第一次。你问这个干吗？", roman: "Ńg, dì-yī cì. Nǐ wèn zhège gànmá?", meaning: "อืม ครั้งแรก ถามเรื่องนี้ทำไม?", keywords: ["问这个干吗","ganma","ถามทำไม"], risk: true, tip: "ฟังระแวงและตั้งการ์ด ทำให้อีกฝ่ายคิดว่าคุณไม่อยากคุย", next: { target: "没事，我就随便问问。", roman: "Méi shì, wǒ jiù suíbiàn wènwen.", meaning: "ไม่มีอะไร แค่ถามเฉย ๆ" } },
          { level: 1, target: "关你屁事，少他妈跟我套近乎。", roman: "Guān nǐ pì shì, shǎo tā mā gēn wǒ tào jìnhu.", meaning: "เสือกอะไรด้วย อย่ามาทำสนิทกับกูนะโว้ย", keywords: ["关你屁事","他妈","guan ni pi shi","เสือก","กู"], risk: true, tip: "มีคำหยาบและการไล่อย่างเป็นศัตรู บทสนทนาจะจบทันที ใช้เพื่อฟังให้รู้ทันเท่านั้น", next: { target: "好吧，那不打扰了。", roman: "Hǎo ba, nà bù dǎrǎo le.", meaning: "โอเค งั้นไม่รบกวนแล้ว" } }
        ],
        fallback: { target: "没听清。你叫什么名字？", roman: "Méi tīng qīng. Nǐ jiào shénme míngzi?", meaning: "ฟังไม่ชัด คุณชื่ออะไร?" }
      },
      {
        id: "emergency", icon: "急", category: "risk", title: "ขอความช่วยเหลือฉุกเฉิน", place: "ประเทศจีน · โทร 120", avatar: "急", goal: "บอกอาการ สติ และที่อยู่ให้ครบ",
        opening: { target: "120急救中心，请问发生了什么？", roman: "Yāo-èrlíng jíjiù zhōngxīn, qǐngwèn fāshēng le shénme?", meaning: "ศูนย์ฉุกเฉิน 120 เกิดเหตุอะไรขึ้น?" },
        options: [
          { level: 5, target: "您好，有人呼吸困难，现在意识清醒。我们在南京东路一百号一楼大厅，请派救护车。", roman: "Nín hǎo, yǒu rén hūxī kùnnan, xiànzài yìshi qīngxǐng. Wǒmen zài Nánjīng Dōnglù yì bǎi hào yì lóu dàtīng, qǐng pài jiùhùchē.", meaning: "มีคนหายใจลำบาก ยังรู้สึกตัว อยู่ล็อบบี้ชั้นหนึ่ง เลขที่ 100 ถนนหนานจิงตะวันออก กรุณาส่งรถพยาบาล", keywords: ["呼吸困难","意识清醒","南京东路一百号","救护车","huxi kunnan"], tip: "เรียง อาการ → สติ → ที่อยู่ → สิ่งที่ต้องการ ชัดเจนกว่าคำสุภาพยาว ๆ", next: { target: "好的，救护车正在出发。患者现在能正常说话吗？", roman: "Hǎo de, jiùhùchē zhèngzài chūfā. Huànzhě xiànzài néng zhèngcháng shuōhuà ma?", meaning: "รถพยาบาลกำลังออก ผู้ป่วยยังพูดได้ตามปกติไหม?" } },
          { level: 4, target: "这里有人呼吸困难，意识清醒。地址是南京东路一百号一楼大厅。", roman: "Zhèlǐ yǒu rén hūxī kùnnan, yìshi qīngxǐng. Dìzhǐ shì Nánjīng Dōnglù yì bǎi hào yì lóu dàtīng.", meaning: "มีคนหายใจลำบาก ยังรู้สึกตัว ที่อยู่ล็อบบี้ชั้นหนึ่ง เลขที่ 100 ถนนหนานจิงตะวันออก", keywords: ["呼吸困难","意识清醒","地址是","一楼大厅"], tip: "กระชับและมีข้อมูลสำคัญครบ เหมาะที่สุดเมื่อทุกวินาทีมีค่า", next: { target: "收到，已经派车。请保持电话畅通。", roman: "Shōudào, yǐjīng pài chē. Qǐng bǎochí diànhuà chàngtōng.", meaning: "รับทราบ ส่งรถแล้ว กรุณาให้โทรศัพท์ติดต่อได้" } },
          { level: 3, target: "这边有人喘不上气，在南京东路一百号一楼大厅，麻烦快点来。", roman: "Zhèbiān yǒu rén chuǎn bu shàng qì, zài Nánjīng Dōnglù yì bǎi hào yì lóu dàtīng, máfan kuài diǎn lái.", meaning: "มีคนหายใจไม่ออก อยู่ล็อบบี้ชั้นหนึ่ง เลขที่ 100 ถนนหนานจิงตะวันออก รบกวนมาเร็ว", keywords: ["喘不上气","南京东路","一楼大厅","快点来"], tip: "เป็นภาษาพูดที่เข้าใจง่าย ควรเพิ่มว่าผู้ป่วยรู้สึกตัวไหมถ้าทราบ", next: { target: "已经派车。患者现在能说话吗？", roman: "Yǐjīng pài chē. Huànzhě xiànzài néng shuōhuà ma?", meaning: "ส่งรถแล้ว ตอนนี้ผู้ป่วยยังพูดได้ไหม?" } },
          { level: 2, target: "快来！有人不行了，南京东路一百号！", roman: "Kuài lái! Yǒu rén bù xíng le, Nánjīng Dōnglù yì bǎi hào!", meaning: "รีบมา! มีคนไม่ไหวแล้ว เลขที่ 100 ถนนหนานจิงตะวันออก!", keywords: ["快来","有人不行了","南京东路一百号"], risk: true, tip: "ความรีบไม่ผิด แต่ 不行了 คลุมเครือและขาดชั้น จุดสังเกต กับสภาพผู้ป่วย", next: { target: "请说清楚具体楼层和患者是否清醒。", roman: "Qǐng shuō qīngchu jùtǐ lóucéng hé huànzhě shìfǒu qīngxǐng.", meaning: "กรุณาบอกชั้นและผู้ป่วยยังรู้สึกตัวหรือไม่" } },
          { level: 1, target: "有人快不行了！你们赶紧滚过来！", roman: "Yǒu rén kuài bù xíng le! Nǐmen gǎnjǐn gǔn guòlai!", meaning: "มีคนกำลังแย่! พวกคุณรีบไสหัวมานี่!", keywords: ["赶紧滚过来","滚过来","gun guolai"], risk: true, tip: "การด่าไม่ให้ข้อมูลช่วยผู้ป่วยและทำให้เสียเวลา ต้องบอกอาการกับที่อยู่แทน", next: { target: "为了救人，请马上说清地址和患者状态。", roman: "Wèile jiù rén, qǐng mǎshàng shuō qīng dìzhǐ hé huànzhě zhuàngtài.", meaning: "เพื่อช่วยผู้ป่วย โปรดบอกที่อยู่และอาการทันที" } }
        ],
        fallback: { target: "请慢一点，先告诉我具体地址。", roman: "Qǐng màn yìdiǎn, xiān gàosu wǒ jùtǐ dìzhǐ.", meaning: "พูดช้าลง ก่อนอื่นบอกที่อยู่ที่แน่นอน" },
        safety: "เนื้อหานี้ใช้ฝึกภาษาเท่านั้น เมื่อเกิดเหตุจริงให้โทรหมายเลขฉุกเฉินของพื้นที่ทันที"
      }
    ]
  }
};

window.OFFLINE_APP_CONTENT = OFFLINE_APP_CONTENT;
