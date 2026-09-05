/*
 * Curated local conversation corpus.
 * No request is made by this file: every branch is deliberately bundled for offline use.
 */
const OFFLINE_APP_CONTENT = {
  "zh-th": {
    ui: {
      eyebrow: "本地情景对话",
      title: "不连网，也能<br><em>把话接下去</em>",
      subtitle: "8 个高频场景、分支回应和场合反馈在本机匹配；离线文字始终可用，语音识别取决于设备是否提供对应本地语言包。",
      badge: "本地引擎 · 可断网",
      proofScenes: "实战场景", proofBranches: "精品分支", proofNetwork: "对话流量",
      sceneEyebrow: "先挑一个现场", sceneHeading: "你现在在哪儿？", reset: "重来",
      engineNote: "所有回应均在本机匹配 · 无上传", typing: "本地角色正在接话",
      inputLabel: "输入你的泰语回答", inputPlaceholder: "也可以输入泰语、中文意图或罗马音…",
      voiceChecking: "正在检查本地语音", voiceAlways: "选句和打字始终可离线使用",
      voiceReady: "本地泰语识别已就绪", voiceReadyNote: "语音只在这台设备处理，不发送到云端",
      voicePackNeeded: "需要泰语离线识别包", voicePackNote: "首次安装识别语言包需要联网，装好后可断网识别",
      voiceUnavailable: "此设备暂无本地泰语识别", voiceFallback: "可继续用离线选句、打字和跟读回放",
      installVoice: "装泰语识别包", startVoice: "点一下说", listening: "正在听…",
      record: "跟读录音", stopRecord: "停止录音", recordNote: "最长 60 秒，只在当前页面本机回放；离开或刷新即清除",
      online: "在线", offline: "已断网", truth: "断网时可使用文字情景、选句和本机录音回放；语音转文字仅在设备明确支持对应本地语言包时启用。",
      noMatch: "本地引擎还没匹配到这个说法。不会瞎编答案，请从关键词或推荐句再试一次。",
      riskPrefix: "风险识别", safePrefix: "场合反馈", nextScene: "下一场景", tryAgain: "换种说法",
      installApp: "安装离线版到手机", installAction: "安装", installManual: "查看方法",
      offlineReady: "核心离线已就绪", offlineReadyCopy: "文字、课程和核心语音已缓存；语音识别仍取决于设备能力",
      offlinePreparing: "正在准备基础离线", offlinePreparingCopy: "首次打开正在缓存应用壳，请保持页面开启",
      offlineShellProgress: "正在缓存基础应用", offlineShellPaused: "基础应用缓存未完整，联网后自动续传", offlineShellRetry: "继续缓存基础应用", offlineShellRetrying: "正在继续缓存基础应用",
      offlineBaseReady: "基础离线可用", offlineBaseReadyCopy: "文字、课程和录音回放可断网；核心语音将后台续传",
      offlineAudioProgress: "核心语音下载中", offlineAudioPaused: "核心语音未完整，联网后自动续传",
      offlineAudioRetry: "继续下载核心语音", offlineAudioRetrying: "正在继续下载核心语音", offlineAudioNeedNetwork: "请联网后继续下载核心语音",
      offlineCoreReady: "核心离线已就绪", offlineCoreReadyCopy: "文字、课程和核心语音已缓存；语音识别仍取决于设备本地能力",
      offlineUnavailable: "离线缓存暂不可用", offlineUnavailableCopy: "请通过 HTTPS 打开；在线文字与本机录音回放仍可使用",
      offlineFileReady: "iOS 离线版可用", offlineFileReadyCopy: "文字、课程、核心语音和本机录音回放可离线；语音识别取决于设备"
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
          { level: 2, target: "ขอน้ำเปล่าหนึ่งขวดตอนนี้ค่ะ", roman: "khɔ̌ɔ náam-plàao nʉ̀ng khùat tɔɔn-níi khâ", meaning: "现在请给我一瓶矿泉水。", keywords: ["ขอน้ำเปล่า","ตอนนี้ค่ะ","现在请给我","矿泉水"], risk: false, tip: "先说需求和时间，直接但仍保留礼貌句尾。", next: { target: "เอาน้ำเปล่าใช่ไหมคะ", roman: "ao náam-plàao châi mái khá", meaning: "是要矿泉水吗？（店员在确认）" } },
          { level: 1, target: "ขอน้ำหนึ่งขวดค่ะ ถ้าตอนนี้ไม่สะดวก ฉันรอได้", roman: "khɔ̌ɔ náam nʉ̀ng khùat khâ, thâa tɔɔn-níi mâi sà-dùak, chǎn rɔɔ dâi", meaning: "请给我一瓶水；如果现在不方便，我可以等。", keywords: ["ขอน้ำหนึ่งขวด","ไม่สะดวก","ฉันรอได้","一瓶水","我可以等"], risk: false, tip: "先说明需求，再给对方缓冲空间；适合用来降低现场压力。", next: { target: "ได้ค่ะ กรุณารอสักครู่นะคะ", roman: "dâi khâ, kà-rú-naa rɔɔ sàk-khrûu ná khá", meaning: "好的，请稍等。" } }
        ],
        fallback: { target: "ขอโทษนะคะ ฟังไม่ทัน ลองพูดอีกครั้งได้ไหมคะ", roman: "khɔ̌ɔ-thôot ná khá, fang mâi than, lɔɔng phûut ìik khráng dâi mái khá", meaning: "不好意思，我没听清，可以再说一次吗？" }
      },
      {
        id: "restaurant", icon: "餐", category: "daily", title: "餐厅点菜", place: "街角餐厅 · 午饭时间", avatar: "餐",
        goal: "还没决定时，请店员再给一点看菜单的时间",
        opening: { target: "พร้อมสั่งอาหารหรือยังคะ", roman: "phrɔ́ɔm sàng aa-hǎan rʉ̌ʉ yang khá", meaning: "准备好点菜了吗？" },
        options: [
          { level: 5, target: "ยังตัดสินใจไม่ได้ครับ รบกวนขอเวลาดูเมนูอีกสักครู่ได้ไหมครับ", roman: "yang tàt-sǐn-jai mâi dâi khráp, róp-kuan khɔ̌ɔ wee-laa duu mee-nuu ìik sàk-khrûu dâi mái khráp", meaning: "还没决定，劳驾再给我一点时间看菜单，可以吗？", keywords: ["ยังตัดสินใจไม่ได้","ขอเวลาดูเมนู","อีกสักครู่","还没决定","看菜单"], tip: "说明状态、提出请求并给对方选择空间，属于正式而周全的说法。", next: { target: "ได้เลยค่ะ พร้อมแล้วเรียกได้นะคะ", roman: "dâi loei khâ, phrɔ́ɔm lɛ́ɛo rîak dâi ná khá", meaning: "可以，准备好后叫我。" } },
          { level: 4, target: "ยังไม่พร้อมครับ ขอเวลาดูเมนูอีกสักครู่นะครับ", roman: "yang mâi phrɔ́ɔm khráp, khɔ̌ɔ wee-laa duu mee-nuu ìik sàk-khrûu ná khráp", meaning: "还没准备好，请再给我一点时间看菜单。", keywords: ["ยังไม่พร้อมครับ","ขอเวลาดูเมนู","อีกสักครู่","还没准备好"], tip: "简短、自然并保留礼貌句尾，是日常餐厅的默认说法。", next: { target: "ได้ค่ะ พร้อมแล้วเรียกได้นะคะ", roman: "dâi khâ, phrɔ́ɔm lɛ́ɛo rîak dâi ná khá", meaning: "好的，准备好后叫我。" } },
          { level: 3, target: "ขอเวลาแป๊บนึงนะ", roman: "khɔ̌ɔ wee-laa pɛ́p nʉng ná", meaning: "再给我一小会儿哈。", keywords: ["ขอเวลา","แป๊บนึงนะ","等一下","kho wela"], tip: "轻松熟人口语；对陌生服务员加ครับ/ค่ะ会更稳，正式场合可把แป๊บนึง换成อีกสักครู่。", next: { target: "ได้เลยค่ะ พร้อมแล้วเรียกได้นะคะ", roman: "dâi loei khâ, phrɔ́ɔm lɛ́ɛo rîak dâi ná khá", meaning: "好的，准备好后叫我。" } },
          { level: 2, target: "ยังไม่พร้อมค่ะ พร้อมแล้วจะเรียกนะคะ", roman: "yang mâi phrɔ́ɔm khâ, phrɔ́ɔm lɛ́ɛo jà rîak ná khá", meaning: "还没准备好，准备好后会叫您。", keywords: ["ยังไม่พร้อมค่ะ","พร้อมแล้วจะเรียก","还没准备好","准备好后会叫"], risk: false, tip: "直接说明当前状态和下一步，不把压力转给服务员。", next: { target: "ได้ค่ะ พร้อมแล้วเรียกได้เลยค่ะ", roman: "dâi khâ, phrɔ́ɔm lɛ́ɛo rîak dâi ləəi khâ", meaning: "好的，准备好后叫我就行。" } },
          { level: 1, target: "ขอเวลาตัดสินใจอีกนิดนะคะ กรุณารอสักครู่", roman: "khɔ̌ɔ wee-laa tàt-sǐn-jai ìik nít ná khá, kà-rú-naa rɔɔ sàk-khrûu", meaning: "请再给我一点时间决定，请稍等。", keywords: ["ขอเวลา","ตัดสินใจ","กรุณารอสักครู่","一点时间","请稍等"], risk: false, tip: "用完整请求暂停催促，同时保持沟通继续。", next: { target: "ได้ค่ะ เรียกเมื่อพร้อมนะคะ", roman: "dâi khâ, rîak mʉ̂a phrɔ́ɔm ná khá", meaning: "好的，准备好时请叫我。" } }
        ],
        fallback: { target: "ขอโทษค่ะ ต้องการสั่งเมนูไหนคะ", roman: "khɔ̌ɔ-thôot khâ, tɔ̂ng-kaan sàng mee-nuu nǎi khá", meaning: "不好意思，您想点哪一道？" }
      },
      {
        id: "taxi", icon: "车", category: "travel", title: "打车去 Asok", place: "曼谷出租车 · 刚上车", avatar: "车",
        goal: "说清去 BTS Asok，并要求按计价器收费",
        opening: { target: "ไปไหนครับ", roman: "pai nǎi khráp", meaning: "去哪里？" },
        options: [
          { level: 5, target: "รบกวนไปส่งที่บีทีเอสอโศก แล้วช่วยเปิดมิเตอร์ให้ด้วยได้ไหมครับ", roman: "róp-kuan pai sòng thîi bii-thii-èet à-sòok, lɛ́ɛo chûai pə̀ət mí-tə̂ə hâi dûai dâi mái khráp", meaning: "劳驾送我到 BTS Asok，并帮我打表，可以吗？", keywords: ["บีทีเอสอโศก","เปิดมิเตอร์","打表","BTS Asok"], tip: "信息完整且礼貌，适合上车时一次说清。", next: { target: "ได้ครับ ขึ้นทางด่วนไหมครับ", roman: "dâi khráp, khʉ̂n thaang-dùan mái khráp", meaning: "可以，要走高速吗？" } },
          { level: 4, target: "ไปบีทีเอสอโศกครับ รบกวนเปิดมิเตอร์ด้วยนะครับ", roman: "pai bii-thii-èet à-sòok khráp, róp-kuan pə̀ət mí-tə̂ə dûai ná khráp", meaning: "去 BTS Asok，麻烦打表。", keywords: ["ไปบีทีเอสอโศก","เปิดมิเตอร์","去Asok","open meter"], tip: "出租车场景默认首选；清楚地标比只报酒店中文名可靠。", next: { target: "ได้ครับ ขึ้นทางด่วนไหมครับ", roman: "dâi khráp, khʉ̂n thaang-dùan mái khráp", meaning: "好的，要走高速吗？" } },
          { level: 3, target: "ไปอโศก เปิดมิเตอร์ด้วยนะ", roman: "pai à-sòok, pə̀ət mí-tə̂ə dûai ná", meaning: "去 Asok，记得打表哈。", keywords: ["ไปอโศก","เปิดมิเตอร์ด้วยนะ","去Asok","打表"], tip: "省略正式客套、用นะ软化，像熟人随口说；面对陌生司机默认选 S4。", next: { target: "ได้ครับ ขึ้นทางด่วนไหมครับ", roman: "dâi khráp, khʉ̂n thaang-dùan mái khráp", meaning: "好的，要走高速吗？" } },
          { level: 2, target: "ไปอโศกครับ ช่วยเปิดมิเตอร์ด้วย", roman: "pai à-sòok khráp, chûai pə̀ət mí-tə̂ə dûai", meaning: "去 Asok，请打表。", keywords: ["ไปอโศกครับ","ช่วยเปิดมิเตอร์","去Asok","请打表"], risk: false, tip: "目的地和要求放在前面，直接清楚，同时保留基本礼貌。", next: { target: "ครับ จะเปิดมิเตอร์ให้", roman: "khráp, jà pə̀ət mí-tə̂ə hâi", meaning: "好，会打表。" } },
          { level: 1, target: "กรุณาเปิดมิเตอร์ค่ะ ถ้าไม่สะดวก ฉันขอยกเลิกการเดินทาง", roman: "kà-rú-naa pə̀ət mí-tə̂ə khâ, thâa mâi sà-dùak, chǎn khɔ̌ɔ yók-lə̂ək gaan-dəən-thaang", meaning: "请打表；如果不方便，我会取消行程。", keywords: ["เปิดมิเตอร์","ไม่สะดวก","ยกเลิกการเดินทาง","打表","取消行程"], risk: false, tip: "明确底线和下一步，不指责司机，也不给冲突继续升级。", next: { target: "ได้ครับ ผมจะเปิดมิเตอร์ให้", roman: "dâi khráp, phǒm jà pə̀ət mí-tə̂ə hâi", meaning: "好的，我会打表。" } }
        ],
        fallback: { target: "ขอชื่อสถานที่หรือเปิดแผนที่ให้ดูได้ไหมครับ", roman: "khɔ̌ɔ chʉ̂ʉ sà-thǎan-thîi rʉ̌ʉ pə̀ət phɛ̌ɛn-thîi hâi duu dâi mái khráp", meaning: "可以告诉我地点名称，或者打开地图给我看吗？" }
      },
      {
        id: "hotel", icon: "住", category: "travel", title: "酒店办理入住", place: "酒店前台 · 14:10", avatar: "住",
        goal: "报出预订姓名，请前台查询订单",
        opening: { target: "สวัสดีค่ะ เช็กอินใช่ไหมคะ", roman: "sà-wàt-dii khâ, chék-in châi mái khá", meaning: "您好，是来办理入住吗？" },
        options: [
          { level: 5, target: "ใช่ครับ จองไว้ในชื่อหลี่ รบกวนช่วยตรวจสอบให้หน่อยได้ไหมครับ", roman: "châi khráp, jɔɔng wái nai chʉ̂ʉ lìi, róp-kuan chûai trùat-sɔ̀ɔp hâi nɔ̀i dâi mái khráp", meaning: "是的，预订姓名是李，劳驾帮我查一下可以吗？", keywords: ["จองไว้ในชื่อหลี่","ตรวจสอบ","预订姓名","check in"], tip: "专业稳妥，适合高档酒店或处理订单异常。", next: { target: "พบการจองแล้วค่ะ ขอดูพาสปอร์ตด้วยนะคะ", roman: "phóp gaan-jɔɔng lɛ́ɛo khâ, khɔ̌ɔ duu phâat-sà-pɔ̀ɔt dûai ná khá", meaning: "查到预订了，请出示护照。" } },
          { level: 4, target: "จองไว้ในชื่อหลี่ครับ มาเช็กอินครับ", roman: "jɔɔng wái nai chʉ̂ʉ lìi khráp, maa chék-in khráp", meaning: "预订姓名是李，我来办理入住。", keywords: ["จองไว้","ชื่อหลี่","เช็กอิน","姓李"], tip: "简洁自然。把护照和订单页面提前准备好会更快。", next: { target: "ห้องพร้อมแล้วค่ะ ขอพาสปอร์ตด้วยค่ะ", roman: "hɔ̂ng phrɔ́ɔm lɛ́ɛo khâ, khɔ̌ɔ phâat-sà-pɔ̀ɔt dûai khâ", meaning: "房间准备好了，请出示护照。" } },
          { level: 3, target: "จองชื่อหลี่นะ ช่วยเช็กให้หน่อย", roman: "jɔɔng chʉ̂ʉ lìi ná, chûai chék hâi nɔ̀i", meaning: "订在李名下，帮我查一下哈。", keywords: ["จองชื่อหลี่","ช่วยเช็กให้หน่อย","姓李","帮我查"], tip: "用นะ和หน่อย软化，但省略正式礼貌句尾；只适合熟人式交流，酒店前台默认选 S4。", next: { target: "พบการจองแล้วค่ะ ขอพาสปอร์ตด้วยค่ะ", roman: "phóp gaan-jɔɔng lɛ́ɛo khâ, khɔ̌ɔ phâat-sà-pɔ̀ɔt dûai khâ", meaning: "查到预订了，请出示护照。" } },
          { level: 2, target: "ชื่อหลี่ครับ จองไว้แล้ว มาเช็กอิน", roman: "chʉ̂ʉ lìi khráp, jɔɔng wái lɛ́ɛo, maa chék-in", meaning: "姓李，已经预订，来办理入住。", keywords: ["ชื่อหลี่ครับ","จองไว้แล้ว","มาเช็กอิน","姓李","办理入住"], risk: false, tip: "用短句一次给齐姓名、预订和目的，直接但不失礼。", next: { target: "ขอพาสปอร์ตกับเลขการจองด้วยค่ะ", roman: "khɔ̌ɔ phâat-sà-pɔ̀ɔt kàp lêek gaan-jɔɔng dûai khâ", meaning: "请提供护照和预订号。" } },
          { level: 1, target: "จองชื่อหลี่ค่ะ นี่คือเอกสาร กรุณาช่วยตรวจอีกครั้ง", roman: "jɔɔng chʉ̂ʉ lìi khâ, nîi khʉʉ èek-kà-sǎan, kà-rú-naa chûai trùat ìik khráng", meaning: "订在李名下，这是证件，请再核对一次。", keywords: ["จองชื่อหลี่","นี่คือเอกสาร","ตรวจอีกครั้ง","李名下","再核对一次"], risk: false, tip: "把核验信息一次给全，并用“再查一次”解决分歧。", next: { target: "ได้ค่ะ ขอเวลาตรวจสอบสักครู่นะคะ", roman: "dâi khâ, khɔ̌ɔ wee-laa trùat-sɔ̀ɔp sàk-khrûu ná khá", meaning: "好的，请给我一点时间核对。" } }
        ],
        fallback: { target: "มีเลขการจองไหมคะ", roman: "mii lêek gaan-jɔɔng mái khá", meaning: "有预订号吗？" }
      },
      {
        id: "market", icon: "价", category: "daily", title: "市场礼貌讲价", place: "周末市场 · 服装摊", avatar: "价",
        goal: "询问买两件能否按 600 泰铢成交",
        opening: { target: "ตัวนี้สามร้อยห้าสิบบาทค่ะ สนใจไหมคะ", roman: "tua níi sǎam-rɔ́ɔi hâa-sìp bàat khâ, sǒn-jai mái khá", meaning: "这个 350 泰铢，感兴趣吗？" },
        options: [
          { level: 5, target: "ถ้าซื้อสองชิ้น ไม่ทราบว่าหกร้อยบาทได้ไหมครับ", roman: "thâa sʉ́ʉ sɔ̌ɔng chín, mâi sâap wâa hòk-rɔ́ɔi bàat dâi mái khráp", meaning: "如果买两件，请问 600 泰铢可以吗？", keywords: ["ซื้อสองชิ้น","หกร้อยบาท","买两件","600泰铢"], tip: "给出数量和具体价格，并给摊主留出回应空间，正式而不失自然。", next: { target: "ถ้าสองชิ้น ลดเหลือหกร้อยได้ค่ะ", roman: "thâa sɔ̌ɔng chín, lót lʉ̌a hòk-rɔ́ɔi dâi khâ", meaning: "买两件的话，可以降到 600。" } },
          { level: 4, target: "ถ้าเอาสองชิ้น หกร้อยได้ไหมครับ", roman: "thâa ao sɔ̌ɔng chín, hòk-rɔ́ɔi dâi mái khráp", meaning: "如果拿两件，600 可以吗？", keywords: ["สองชิ้น","หกร้อย","两件六百","hok roi"], tip: "直接但有礼貌句尾，是市场里的自然说法。", next: { target: "ได้ค่ะ หกร้อยพอดี", roman: "dâi khâ, hòk-rɔ́ɔi phɔɔ-dii", meaning: "可以，正好 600。" } },
          { level: 3, target: "สองชิ้นหกร้อยได้ไหม", roman: "sɔ̌ɔng chín hòk-rɔ́ɔi dâi mái", meaning: "两件 600 可以吗？", keywords: ["สองชิ้น","หกร้อยได้ไหม","两件六百","hok roi"], tip: "随口且没有礼貌词尾，适合熟摊或轻松关系；面对陌生摊主默认补ครับ/ค่ะ。", next: { target: "ได้ค่ะ หกร้อยพอดี", roman: "dâi khâ, hòk-rɔ́ɔi phɔɔ-dii", meaning: "可以，正好 600。" } },
          { level: 2, target: "สองชิ้นหกร้อยได้ไหมครับ", roman: "sɔ̌ɔng chín hòk-rɔ́ɔi dâi mái khráp", meaning: "两件 600，可以吗？", keywords: ["สองชิ้นหกร้อย","ได้ไหมครับ","两件六百","可以吗"], risk: false, tip: "价格直接、问题明确，同时给对方拒绝或还价的空间。", next: { target: "ราคานี้ไม่ได้ค่ะ ลองคุยกันอีกได้นะคะ", roman: "raa-khaa níi mâi dâi khâ, lɔɔng khui kan ìik dâi ná khá", meaning: "这个价格不行，还可以再商量。" } },
          { level: 1, target: "ราคานี้ฉันรับไม่ได้ค่ะ ถ้าลดไม่ได้ ฉันขอไม่ซื้อ", roman: "raa-khaa níi chǎn ráp mâi dâi khâ, thâa lót mâi dâi, chǎn khɔ̌ɔ mâi sʉ́ʉ", meaning: "这个价格我不能接受；如果不能降价，我就不买了。", keywords: ["รับไม่ได้","ลดไม่ได้","ไม่ซื้อ","不能接受","不买了"], risk: false, tip: "直接说明预算边界，再平静退出交易。", next: { target: "เข้าใจค่ะ ราคาต่ำกว่านี้ไม่ได้จริง ๆ", roman: "khâo-jai khâ, raa-khaa tàm kwàa níi mâi dâi jing-jing", meaning: "理解，这个价格确实不能再低了。" } }
        ],
        fallback: { target: "ต้องการกี่ชิ้นคะ", roman: "tɔ̂ng-kaan kìi chín khá", meaning: "您想要几件？" }
      },
      {
        id: "work", icon: "工", category: "work", title: "职场汇报进度", place: "曼谷办公室 · 周五 15:30", avatar: "工",
        goal: "说明尚未完成，并承诺五点前提交",
        opening: { target: "รายงานวันนี้เสร็จไหมครับ", roman: "raai-ngaan wan-níi sèt mái khráp", meaning: "今天的报告完成了吗？" },
        options: [
          { level: 5, target: "ยังไม่เรียบร้อยทั้งหมดครับ ตอนนี้เสร็จประมาณแปดสิบเปอร์เซ็นต์ ผมจะส่งฉบับสมบูรณ์ให้ก่อนห้าโมงครับ", roman: "yang mâi rîap-rɔ́ɔi tháng-mòt khráp, tɔɔn-níi sèt prà-maan pɛ̀ɛt-sìp pəə-sen, phǒm jà sòng chà-bàp sǒm-buun hâi kɔ̀ɔn hâa moong khráp", meaning: "还没全部完成，目前约 80%，我会在五点前提交完整版。", keywords: ["แปดสิบเปอร์เซ็นต์","ส่งฉบับสมบูรณ์","ก่อนห้าโมง","80%","提交完整版","五点前"], tip: "透明说明进度并承诺交付时间，是专业、可执行的汇报。", next: { target: "ได้ครับ ส่งก่อนห้าโมง แล้วแจ้งผมอีกทีนะครับ", roman: "dâi khráp, sòng kɔ̀ɔn hâa moong, lɛ́ɛo jɛ̂ɛng phǒm ìik thii ná khráp", meaning: "可以，五点前发，之后再通知我。" } },
          { level: 4, target: "ยังไม่เสร็จครับ ผมจะส่งให้ก่อนห้าโมงครับ", roman: "yang mâi sèt khráp, phǒm jà sòng hâi kɔ̀ɔn hâa moong khráp", meaning: "还没完成，我会在五点前提交。", keywords: ["ยังไม่เสร็จครับ","ส่งให้ก่อนห้าโมง","还没完成","五点前提交"], tip: "如实说明状态并明确承诺提交时间，简短、自然、礼貌。", next: { target: "ได้ครับ ส่งก่อนห้าโมงนะครับ", roman: "dâi khráp, sòng kɔ̀ɔn hâa moong ná khráp", meaning: "可以，请五点前提交。" } },
          { level: 3, target: "ยังไม่เสร็จ เดี๋ยวส่งให้ก่อนห้าโมงนะ", roman: "yang mâi sèt, dǐao sòng hâi kɔ̀ɔn hâa moong ná", meaning: "还没完成，五点前发给你哈。", keywords: ["ยังไม่เสร็จ","ส่งให้ก่อนห้าโมงนะ","还没完成","五点前发"], tip: "状态和提交时间都完整，但省略正式礼貌句尾，适合熟悉的同级同事；对主管默认选 S4/S5。", next: { target: "โอเค ส่งมาก่อนห้าโมงนะ", roman: "oo-khee, sòng maa kɔ̀ɔn hâa moong ná", meaning: "好，五点前发来。" } },
          { level: 2, target: "ยังไม่เสร็จครับ จะส่งให้ก่อนห้าโมง", roman: "yang mâi sèt khráp, jà sòng hâi kɔ̀ɔn hâa moong", meaning: "还没完成，会在五点前发。", keywords: ["ยังไม่เสร็จครับ","ส่งให้ก่อนห้าโมง","还没完成","五点前会发"], risk: false, tip: "直接报告状态和明确交付时间，不把焦虑转成对人的攻击。", next: { target: "ได้ครับ กรุณาส่งตามเวลาที่ตกลงกัน", roman: "dâi khráp, kà-rú-naa sòng taam wee-laa thîi tòk-long kan", meaning: "好的，请按约定时间提交。" } },
          { level: 1, target: "ฉันจะส่งก่อนห้าโมงค่ะ หากมีการเปลี่ยนแปลงจะแจ้งทันที", roman: "chǎn jà sòng kɔ̀ɔn hâa moong khâ, hàak mii gaan plìan-plɛɛng jà jɛ̂ɛng than-thii", meaning: "我会在五点前提交；如有变化会立即说明。", keywords: ["ก่อนห้าโมง","เปลี่ยนแปลง","แจ้งทันที","五点前","立即说明"], risk: false, tip: "给出明确时间和异常处理方式，让工作分歧回到事实。", next: { target: "รับทราบครับ ถ้ามีปัญหาแจ้งได้เลย", roman: "ráp-sâap khráp, thâa mii pan-hǎa jɛ̂ɛng dâi ləəi", meaning: "收到，有问题请及时告诉我。" } }
        ],
        fallback: { target: "ช่วยบอกความคืบหน้ากับเวลาที่จะส่งได้ไหมครับ", roman: "chûai bɔ̀ɔk khwaam-khʉ̂ʉp-nâa kàp wee-laa thîi jà sòng dâi mái khráp", meaning: "可以说明进度和预计提交时间吗？" }
      },
      {
        id: "friends", icon: "友", category: "friend", title: "认识新朋友", place: "语言交换活动 · 19:00", avatar: "友",
        goal: "介绍自己，并询问对方姓名",
        opening: { target: "มาคนเดียวเหรอ", roman: "maa khon diao rə̌ə", meaning: "一个人来的吗？" },
        options: [
          { level: 5, target: "ใช่ครับ ยินดีที่ได้รู้จักครับ ผมชื่ออาไท ไม่ทราบว่าคุณชื่ออะไรครับ", roman: "châi khráp, yin-dii thîi dâi rúu-jàk khráp, phǒm chʉ̂ʉ aa-thai, mâi sâap wâa khun chʉ̂ʉ à-rai khráp", meaning: "是的，很高兴认识你，我叫阿泰，请问怎么称呼你？", keywords: ["ยินดีที่ได้รู้จัก","ผมชื่ออาไท","ไม่ทราบว่าคุณชื่ออะไร","很高兴认识你","请问姓名"], tip: "自我介绍完整，并用ไม่ทราบว่า给询问留出空间；适合正式交流活动。", next: { target: "ชื่อมินต์ค่ะ ยินดีที่ได้รู้จักนะคะ", roman: "chʉ̂ʉ min khâ, yin-dii thîi dâi rúu-jàk ná khá", meaning: "我叫 Mint，很高兴认识你。" } },
          { level: 4, target: "สวัสดีครับ ผมชื่ออาไทครับ คุณชื่ออะไรครับ", roman: "sà-wàt-dii khráp, phǒm chʉ̂ʉ aa-thai khráp, khun chʉ̂ʉ à-rai khráp", meaning: "你好，我叫阿泰，你叫什么名字？", keywords: ["ผมชื่ออาไท","คุณชื่ออะไรครับ","我叫阿泰","你叫什么"], tip: "直接、自然并保留礼貌句尾，适合第一次见面的同龄人。", next: { target: "ชื่อมินต์ค่ะ ยินดีที่ได้รู้จัก", roman: "chʉ̂ʉ min khâ, yin-dii thîi dâi rúu-jàk", meaning: "我叫 Mint，很高兴认识你。" } },
          { level: 3, target: "หวัดดี เราอาไท เธอชื่ออะไร", roman: "wàt-dii, rao aa-thai, thəə chʉ̂ʉ à-rai", meaning: "嗨，我是阿泰，你叫什么？", keywords: ["หวัดดี","เราอาไท","เธอชื่ออะไร","嗨","你叫什么"], tip: "省略正式客套，เธอ只适合同龄熟人或已建立轻松关系的人。", next: { target: "เรามินต์ ยินดีที่ได้รู้จักนะ", roman: "rao min, yin-dii thîi dâi rúu-jàk ná", meaning: "我是 Mint，很高兴认识你。" } },
          { level: 2, target: "ฉันอาไท เธอชื่ออะไร", roman: "chǎn aa-thai, thəə chʉ̂ʉ à-rai", meaning: "我是阿泰。你叫什么？", keywords: ["ฉันอาไท","เธอชื่ออะไร","我是阿泰","你叫什么"], risk: false, tip: "短句直接完成介绍和提问，不催促对方回答。", next: { target: "ฉันชื่อมิ้นต์ ยินดีที่ได้รู้จักค่ะ", roman: "chǎn chʉ̂ʉ mín, yin-dii thîi dâi rúu-jàk khâ", meaning: "我叫 Mint，很高兴认识你。" } },
          { level: 1, target: "ฉันชื่ออาไทค่ะ ถ้าไม่สะดวกคุยตอนนี้ ไว้คุยกันทีหลังนะคะ", roman: "chǎn chʉ̂ʉ aa-thai khâ, thâa mâi sà-dùak khui tɔɔn-níi, wái khui kan thii-lǎng ná khá", meaning: "我叫阿泰；如果现在不方便聊，我们以后再聊。", keywords: ["ฉันชื่ออาไท","ไม่สะดวกคุย","ทีหลัง","我叫阿泰","以后再聊"], risk: false, tip: "自我介绍后给彼此退出空间，避免勉强继续交流。", next: { target: "ยินดีที่ได้รู้จักค่ะ ไว้คุยกันใหม่นะคะ", roman: "yin-dii thîi dâi rúu-jàk khâ, wái khui kan mài ná khá", meaning: "很高兴认识你，下次再聊。" } }
        ],
        fallback: { target: "เมื่อกี้ว่าอะไรนะ พูดอีกทีได้ไหม", roman: "mʉ̂a-kîi wâa à-rai ná, phûut ìik thii dâi mái", meaning: "刚才说什么？可以再说一次吗？" }
      },
      {
        id: "emergency", icon: "急", category: "risk", title: "紧急求助", place: "Asok 站前 · 医疗紧急", avatar: "急",
        goal: "用最短路径说清症状、地点和需要的帮助",
        opening: { target: "มีอะไรให้ช่วยไหมครับ", roman: "mii à-rai hâi chûai mái khráp", meaning: "有什么需要帮忙吗？" },
        options: [
          { level: 5, target: "เพื่อนหายใจไม่ออก อยู่หน้าสถานีอโศก รบกวนช่วยโทร 1669 เรียกรถพยาบาลให้หน่อยครับ", roman: "phʉ̂an hǎai-jai mâi ɔ̀ɔk, yùu nâa sà-thǎa-nii à-sòok, róp-kuan chûai thoo nʉ̀ng-hòk-hòk-kâao rîak rót-phá-yaa-baan hâi nɔ̀i khráp", meaning: "朋友无法呼吸，我们在 Asok 站前，劳驾拨打 1669 叫救护车。", keywords: ["หายใจไม่ออก","สถานีอโศก","โทร 1669","รถพยาบาล","无法呼吸","救护车"], tip: "症状、地点、号码和需求完整；紧急场合信息清楚比堆敬语更重要。", next: { target: "รับทราบครับ จะโทร 1669 ตอนนี้เลย ผู้ป่วยรู้สึกตัวไหมครับ", roman: "ráp-sâap khráp, jà thoo nʉ̀ng-hòk-hòk-kâao tɔɔn-níi loei, phûu-pùai rúu-sʉ̀k-tua mái khráp", meaning: "明白，马上拨 1669。病人有意识吗？" } },
          { level: 4, target: "มีคนหายใจไม่ออก อยู่หน้าสถานีอโศก ช่วยโทร 1669 ให้หน่อยครับ", roman: "mii khon hǎai-jai mâi ɔ̀ɔk, yùu nâa sà-thǎa-nii à-sòok, chûai thoo nʉ̀ng-hòk-hòk-kâao hâi nɔ̀i khráp", meaning: "有人无法呼吸，在 Asok 站前，请帮忙拨打 1669。", keywords: ["หายใจไม่ออก","สถานีอโศก","โทร 1669","无法呼吸","Asok"], tip: "症状、地点和求助动作完整；紧急场合不必为了显得正式而加长句子。", next: { target: "ได้ครับ โทรแล้ว ผู้ป่วยรู้สึกตัวไหมครับ", roman: "dâi khráp, thoo lɛ́ɛo, phûu-pùai rúu-sʉ̀k-tua mái khráp", meaning: "已拨打。病人有意识吗？" } },
          { level: 3, target: "มีคนหายใจไม่ออก อยู่หน้าอโศก ช่วยโทร 1669 ที", roman: "mii khon hǎai-jai mâi ɔ̀ɔk, yùu nâa à-sòok, chûai thoo nʉ̀ng-hòk-hòk-kâao thii", meaning: "有人无法呼吸，在 Asok 站前，帮忙打 1669。", keywords: ["หายใจไม่ออก","หน้าอโศก","โทร 1669","无法呼吸","Asok"], tip: "省略礼貌句尾但信息完整；在眼前的真实急救中，这种直接表达完全合理。", next: { target: "โทรแล้ว ผู้ป่วยรู้สึกตัวไหม", roman: "thoo lɛ́ɛo, phûu-pùai rúu-sʉ̀k-tua mái", meaning: "已拨打，病人有意识吗？" } },
          { level: 2, target: "คนหายใจไม่ออก หน้าอโศก โทร 1669 เดี๋ยวนี้", roman: "khon hǎai-jai mâi ɔ̀ɔk, nâa à-sòok, thoo nʉ̀ng-hòk-hòk-kâao dǐao-níi", meaning: "有人无法呼吸，在 Asok 站前，现在就打 1669。", keywords: ["หายใจไม่ออก","หน้าอโศก","โทร 1669 เดี๋ยวนี้","无法呼吸","现在就打"], risk: false, registerOverride: { risk: false, isRisk: false, riskLevel: "context-safe", recommended: true, followMode: "practice", goalPriority: "life-safety", contextLabelZh: "紧急直接（合理）", contextLabelTh: "ตรงเพราะเหตุฉุกเฉิน (เหมาะสม)", warningZh: "", warningTh: "" }, tip: "救命信息完整；真实急救中，“现在就打 1669”是合理的明确指令。这里保留 S2 只表示语气最直接，不代表高风险或不安全。", next: { target: "โทรแล้วครับ ผู้ป่วยรู้สึกตัวไหมครับ", roman: "thoo lɛ́ɛo khráp, phûu-pùai rúu-sʉ̀k-tua mái khráp", meaning: "已拨打。病人有意识吗？" } },
          { level: 1, target: "มีคนหายใจไม่ออกหน้าอโศก กรุณาโทร 1669 ตอนนี้ค่ะ", roman: "mii khon hǎai-jai mâi ɔ̀ɔk nâa à-sòok, kà-rú-naa thoo nʉ̀ng-hòk-hòk-kâao tɔɔn-níi khâ", meaning: "Asok 站前有人无法呼吸，请现在拨打 1669。", keywords: ["หายใจไม่ออก","หน้าอโศก","โทร 1669","ตอนนี้","无法呼吸","现在拨打"], risk: false, tip: "急救中先说症状、地点和行动，直接但不攻击任何人。", next: { target: "โทรแล้วครับ กรุณาบอกว่าผู้ป่วยรู้สึกตัวไหม", roman: "thoo lɛ́ɛo khráp, kà-rú-naa bɔ̀ɔk wâa phûu-pùai rúu-sʉ̀k-tua mái", meaning: "已拨打，请说明病人是否有意识。" } }
        ],
        fallback: { target: "ใจเย็น ๆ นะครับ บอกก่อนว่าเกิดอะไรขึ้น และอยู่ตรงไหน", roman: "jai yen-yen ná khráp, bɔ̀ɔk kɔ̀ɔn wâa kə̀ət à-rai khʉ̂n, lɛ́ yùu trong nǎi", meaning: "先冷静，告诉我发生了什么，以及你在哪里。" },
        safety: "训练提示：泰国院前医疗急救为 1669；真实情况请立即联系当地急救并服从调度员指引。"
      }
    ]
  },
  "th-zh": {
    ui: {
      eyebrow: "บทสนทนาในเครื่อง",
      title: "ไม่ใช้อินเทอร์เน็ต<br><em>ก็คุยต่อได้</em>",
      subtitle: "จับคู่ 8 สถานการณ์จริง ประโยคตอบกลับ และคำเตือนเรื่องกาลเทศะในเครื่อง ข้อความใช้แบบออฟไลน์ได้ ส่วนการรู้จำเสียงขึ้นอยู่กับชุดภาษาภายในอุปกรณ์",
      badge: "เอนจินในเครื่อง · ออฟไลน์", proofScenes: "สถานการณ์", proofBranches: "ทางเลือกคุณภาพ", proofNetwork: "ดาต้าสนทนา",
      sceneEyebrow: "เลือกสถานการณ์ก่อน", sceneHeading: "ตอนนี้คุณอยู่ที่ไหน?", reset: "เริ่มใหม่",
      engineNote: "จับคู่คำตอบในเครื่อง · ไม่อัปโหลด", typing: "คู่สนทนาในเครื่องกำลังตอบ",
      inputLabel: "พิมพ์คำตอบภาษาจีน", inputPlaceholder: "พิมพ์ภาษาจีน พินอิน หรือความหมายไทยก็ได้…",
      voiceChecking: "กำลังตรวจเสียงออฟไลน์", voiceAlways: "เลือกประโยคและพิมพ์ได้ออฟไลน์เสมอ",
      voiceReady: "รู้จำเสียงจีนในเครื่องพร้อม", voiceReadyNote: "ประมวลผลเสียงบนเครื่องนี้เท่านั้น ไม่ส่งขึ้นคลาวด์",
      voicePackNeeded: "ต้องมีชุดรู้จำภาษาจีนออฟไลน์", voicePackNote: "ติดตั้งชุดภาษาสำหรับการรู้จำครั้งแรกต้องใช้อินเทอร์เน็ต หลังจากนั้นจึงรู้จำแบบออฟไลน์ได้",
      voiceUnavailable: "เครื่องนี้ยังไม่รองรับเสียงจีนออฟไลน์", voiceFallback: "ยังเลือกประโยค พิมพ์ และอัดเสียงฟังเองได้",
      installVoice: "ติดตั้งชุดรู้จำจีน", startVoice: "แตะแล้วพูด", listening: "กำลังฟัง…",
      record: "อัดเสียงตาม", stopRecord: "หยุดอัด", recordNote: "สูงสุด 60 วินาที ฟังย้อนหลังในหน้านี้เท่านั้น ออกจากหน้าหรือรีเฟรชแล้วจะลบ",
      online: "ออนไลน์", offline: "ออฟไลน์แล้ว", truth: "เมื่อออฟไลน์ยังใช้สถานการณ์ข้อความ เลือกประโยค และฟังเสียงอัดในเครื่องได้ การแปลงเสียงเป็นข้อความเปิดเฉพาะเมื่ออุปกรณ์รองรับชุดภาษาภายในเครื่อง",
      noMatch: "เอนจินในเครื่องยังจับความหมายไม่ได้ ระบบจะไม่แต่งคำตอบเอง ลองใช้คำสำคัญหรือเลือกประโยคแนะนำ",
      riskPrefix: "ฟังไว้ป้องกันตัว", safePrefix: "กาลเทศะ", nextScene: "ฉากถัดไป", tryAgain: "ลองอีกแบบ",
      installApp: "ติดตั้งเวอร์ชันออฟไลน์", installAction: "ติดตั้ง", installManual: "ดูวิธี",
      offlineReady: "ออฟไลน์หลักพร้อมแล้ว", offlineReadyCopy: "บันทึกข้อความ บทเรียน และเสียงหลักแล้ว การรู้จำเสียงยังขึ้นอยู่กับอุปกรณ์",
      offlinePreparing: "กำลังเตรียมออฟไลน์พื้นฐาน", offlinePreparingCopy: "กำลังบันทึกตัวแอปครั้งแรก โปรดเปิดหน้านี้ไว้",
      offlineShellProgress: "กำลังบันทึกตัวแอป", offlineShellPaused: "บันทึกตัวแอปยังไม่ครบ จะทำต่อเมื่อออนไลน์", offlineShellRetry: "บันทึกตัวแอปต่อ", offlineShellRetrying: "กำลังบันทึกตัวแอปต่อ",
      offlineBaseReady: "ออฟไลน์พื้นฐานพร้อม", offlineBaseReadyCopy: "ข้อความ บทเรียน และเสียงอัดย้อนหลังใช้ได้ออฟไลน์ ส่วนเสียงหลักจะดาวน์โหลดต่อเบื้องหลัง",
      offlineAudioProgress: "กำลังดาวน์โหลดเสียงหลัก", offlineAudioPaused: "เสียงหลักยังไม่ครบ จะดาวน์โหลดต่อเมื่อออนไลน์",
      offlineAudioRetry: "ดาวน์โหลดเสียงหลักต่อ", offlineAudioRetrying: "กำลังดาวน์โหลดเสียงหลักต่อ", offlineAudioNeedNetwork: "โปรดเชื่อมต่ออินเทอร์เน็ตเพื่อดาวน์โหลดเสียงหลักต่อ",
      offlineCoreReady: "ออฟไลน์หลักพร้อมแล้ว", offlineCoreReadyCopy: "บันทึกข้อความ บทเรียน และเสียงหลักแล้ว การรู้จำเสียงยังขึ้นอยู่กับความสามารถในเครื่อง",
      offlineUnavailable: "แคชออฟไลน์ยังใช้ไม่ได้", offlineUnavailableCopy: "โปรดเปิดผ่าน HTTPS; ยังใช้ข้อความออนไลน์และฟังเสียงอัดในเครื่องได้",
      offlineFileReady: "แอป iOS ออฟไลน์พร้อมใช้", offlineFileReadyCopy: "ข้อความ บทเรียน เสียงหลัก และเสียงอัดย้อนหลังใช้ได้ออฟไลน์ การรู้จำเสียงขึ้นอยู่กับอุปกรณ์"
    },
    scenarios: [
      {
        id: "convenience", icon: "袋", category: "daily", title: "ร้านสะดวกซื้อ", place: "ร้านสะดวกซื้อ · จุดชำระเงิน", avatar: "店", goal: "ปฏิเสธถุงอย่างสุภาพ",
        opening: { target: "您好，需要袋子吗？", roman: "Nín hǎo, xūyào dàizi ma?", meaning: "สวัสดีครับ/ค่ะ ต้องการถุงไหม?" },
        options: [
          { level: 5, target: "不用了，谢谢您。我自己带了袋子。", roman: "Bú yòng le, xièxie nín. Wǒ zìjǐ dài le dàizi.", meaning: "ไม่รับแล้ว ขอบคุณครับ/ค่ะ พอดีนำถุงมาเอง", keywords: ["不用了","谢谢您","自己带","bu yong","ถุงมาเอง"], tip: "สุภาพมาก เหมาะกับผู้ใหญ่ แต่เรียบร้อยกว่าที่จำเป็นเล็กน้อย", next: { target: "好的，一共十二块五。请问您怎么支付？", roman: "Hǎo de, yígòng shí'èr kuài wǔ. Qǐngwèn nín zěnme zhīfù?", meaning: "ได้เลย รวม 12.5 หยวน ไม่ทราบว่าจะชำระแบบไหน?" } },
          { level: 4, target: "不用了，谢谢。", roman: "Bú yòng le, xièxie.", meaning: "ไม่รับแล้วครับ/ค่ะ ขอบคุณ", keywords: ["不用了","谢谢","bu yong","ไม่รับ"], tip: "สั้น สุภาพ และเป็นธรรมชาติที่สุดในร้านทั่วไป", next: { target: "好的，一共十二块五。微信还是支付宝？", roman: "Hǎo de, yígòng shí'èr kuài wǔ. Wēixìn háishi Zhīfùbǎo?", meaning: "รวม 12.5 หยวน จะจ่าย WeChat หรือ Alipay?" } },
          { level: 3, target: "不用啦，我有袋子。", roman: "Bú yòng la, wǒ yǒu dàizi.", meaning: "ไม่ต้องหรอก ฉันมีถุงแล้ว", keywords: ["不用啦","我有袋子","bu yong la","มีถุง"], tip: "啦 ทำให้น้ำเสียงกันเอง ใช้ได้แต่ไม่จำเป็นกับพนักงานที่ไม่รู้จัก", next: { target: "好嘞，一共十二块五。", roman: "Hǎo lei, yígòng shí'èr kuài wǔ.", meaning: "ได้เลย รวม 12.5 หยวน" } },
          { level: 2, target: "不用袋子，谢谢。", roman: "Bú yòng dàizi, xièxie.", meaning: "ไม่รับถุง ขอบคุณ", keywords: ["不用袋子","谢谢","bu yong daizi","ไม่รับถุง"], risk: false, tip: "บอกความต้องการตรง ๆ แล้วปิดท้ายด้วยคำขอบคุณ", next: { target: "行，一共十二块五。", roman: "Xíng, yígòng shí'èr kuài wǔ.", meaning: "โอเค รวม 12.5 หยวน" } },
          { level: 1, target: "我不需要了，谢谢，请不用继续介绍。", roman: "Wǒ bù xūyào le, xièxie, qǐng bú yòng jìxù jièshào.", meaning: "ฉันไม่ต้องการแล้ว ขอบคุณ กรุณาไม่ต้องแนะนำต่อ", keywords: ["不需要了","不用继续介绍","bu xuyao","ไม่ต้องแนะนำต่อ"], risk: false, tip: "ปฏิเสธให้ชัด แล้วปิดบทสนทนาอย่างสุภาพ", next: { target: "好的，祝您购物愉快。", roman: "Hǎo de, zhù nín gòuwù yúkuài.", meaning: "ได้ค่ะ ขอให้ช้อปปิ้งอย่างมีความสุข" } }
        ],
        fallback: { target: "不好意思，我没听清。您需要袋子吗？", roman: "Bù hǎoyìsi, wǒ méi tīng qīng. Nín xūyào dàizi ma?", meaning: "ขอโทษครับ/ค่ะ ฟังไม่ชัด ตกลงรับถุงไหม?" }
      },
      {
        id: "restaurant", icon: "餐", category: "daily", title: "ร้านอาหาร", place: "ร้านอาหาร · จุดต้อนรับ", avatar: "餐", goal: "บอกจำนวนคนและขอที่นั่งริมหน้าต่าง",
        opening: { target: "您好，请问几位？", roman: "Nín hǎo, qǐngwèn jǐ wèi?", meaning: "สวัสดีครับ/ค่ะ มากันกี่ท่าน?" },
        options: [
          { level: 5, target: "您好，我们两位。麻烦安排一个靠窗、安静一点的位置，可以吗？", roman: "Nín hǎo, wǒmen liǎng wèi. Máfan ānpái yí ge kàochuāng, ānjìng yìdiǎn de wèizhi, kěyǐ ma?", meaning: "เรามาสองคน รบกวนจัดที่นั่งริมหน้าต่างที่เงียบหน่อยได้ไหม?", keywords: ["我们两位","麻烦安排","靠窗","安静一点","liang wei","ริมหน้าต่าง"], tip: "位 เป็นลักษณนามสุภาพ และประโยคนี้บอกทั้งจำนวนคนกับความต้องการอย่างครบถ้วน", next: { target: "可以的。里面靠窗的位置比较安静。", roman: "Kěyǐ de. Lǐmiàn kàochuāng de wèizhi bǐjiào ānjìng.", meaning: "ได้ครับ/ค่ะ ที่ริมหน้าต่างด้านในค่อนข้างเงียบ" } },
          { level: 4, target: "两位，谢谢。有靠窗的位置吗？", roman: "Liǎng wèi, xièxie. Yǒu kàochuāng de wèizhi ma?", meaning: "สองท่าน ขอบคุณ มีที่นั่งริมหน้าต่างไหม?", keywords: ["两位","谢谢","靠窗","liang wei","ริมหน้าต่าง"], tip: "สั้นพอดีและสุภาพ ใช้ได้แทบทุกร้าน", next: { target: "有的，这边请。", roman: "Yǒu de, zhèbiān qǐng.", meaning: "มีครับ/ค่ะ เชิญทางนี้" } },
          { level: 3, target: "我们俩，靠窗坐行吗？", roman: "Wǒmen liǎ, kàochuāng zuò xíng ma?", meaning: "เราสองคน นั่งริมหน้าต่างได้ไหม?", keywords: ["我们俩","靠窗坐","行吗","women lia"], tip: "俩 เป็นภาษาพูดธรรมชาติในร้านทั่วไป แต่ไม่เหมาะกับงานทางการ", next: { target: "可以，跟我来吧。", roman: "Kěyǐ, gēn wǒ lái ba.", meaning: "ได้ครับ/ค่ะ ตามมาเลย" } },
          { level: 2, target: "两个人，想坐靠窗的位置。", roman: "Liǎng ge rén, xiǎng zuò kàochuāng de wèizi.", meaning: "สองคน อยากนั่งริมหน้าต่าง", keywords: ["两个人","想坐靠窗","xiang zuo kaochuang"], risk: false, tip: "บอกจำนวนคนและความต้องการให้ชัด โดยไม่ออกคำสั่ง", next: { target: "靠窗现在没有，要等。", roman: "Kàochuāng xiànzài méiyǒu, yào děng.", meaning: "ตอนนี้ที่ริมหน้าต่างไม่มี ต้องรอ" } },
          { level: 1, target: "两个人；如果没有靠窗的位置，普通座位也可以。", roman: "Liǎng ge rén; rúguǒ méiyǒu kàochuāng de wèizi, pǔtōng zuòwèi yě kěyǐ.", meaning: "สองคน ถ้าไม่มีที่ริมหน้าต่าง ที่นั่งทั่วไปก็ได้", keywords: ["两个人","靠窗的位置","普通座位也可以","liang ge ren","ที่นั่งทั่วไป"], risk: false, tip: "บอกความต้องการหลักและทางเลือกสำรอง ช่วยลดแรงกดดันหน้าร้าน", next: { target: "好的，现在给您安排普通座位。", roman: "Hǎo de, xiànzài gěi nín ānpái pǔtōng zuòwèi.", meaning: "ได้ค่ะ จะจัดที่นั่งทั่วไปให้ตอนนี้" } }
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
          { level: 2, target: "去虹桥，我六点前要到，请注意安全。", roman: "Qù Hóngqiáo, wǒ liù diǎn qián yào dào, qǐng zhùyì ānquán.", meaning: "ไปหงเฉียว ต้องถึงก่อนหกโมง กรุณาขับอย่างปลอดภัย", keywords: ["去虹桥","六点前要到","请注意安全","liu dian qian"], risk: false, tip: "บอกปลายทางและกำหนดเวลาโดยไม่กดดันให้ขับเร็วเกินปลอดภัย", next: { target: "现在堵车，我会尽量按时安全到达。", roman: "Xiànzài dǔchē, wǒ huì jǐnliàng ànshí ānquán dàodá.", meaning: "ตอนนี้รถติด ผมจะพยายามไปถึงตรงเวลาอย่างปลอดภัย" } },
          { level: 1, target: "去虹桥，请按导航走；如果路线有变化，请先告诉我。", roman: "Qù Hóngqiáo, qǐng àn dǎoháng zǒu; rúguǒ lùxiàn yǒu biànhuà, qǐng xiān gàosu wǒ.", meaning: "ไปหงเฉียว กรุณาตามระบบนำทาง หากเส้นทางเปลี่ยน กรุณาบอกฉันก่อน", keywords: ["去虹桥","按导航走","路线有变化","先告诉我","ตามระบบนำทาง"], risk: false, tip: "กำหนดเส้นทางและเงื่อนไขให้ชัด โดยไม่กล่าวหาคนขับ", next: { target: "好的，路线变化前我会先说明。", roman: "Hǎo de, lùxiàn biànhuà qián wǒ huì xiān shuōmíng.", meaning: "ได้ครับ หากเส้นทางเปลี่ยนจะแจ้งก่อน" } }
        ],
        fallback: { target: "请告诉我具体的目的地。", roman: "Qǐng gàosu wǒ jùtǐ de mùdìdì.", meaning: "กรุณาบอกจุดหมายให้ชัดเจนครับ" }
      },
      {
        id: "hotel", icon: "住", category: "travel", title: "เช็กอินโรงแรม", place: "โรงแรม · เคาน์เตอร์ต้อนรับ", avatar: "住", goal: "แจ้งว่ามีการจองและยื่นหนังสือเดินทาง",
        opening: { target: "您好，请问您有预订吗？", roman: "Nín hǎo, qǐngwèn nín yǒu yùdìng ma?", meaning: "สวัสดีครับ/ค่ะ จองไว้ไหม?" },
        options: [
          { level: 5, target: "您好，我有预订，名字是米娜。这是我的护照，麻烦您帮我查一下。", roman: "Nín hǎo, wǒ yǒu yùdìng, míngzi shì Mǐnà. Zhè shì wǒ de hùzhào, máfan nín bāng wǒ chá yíxià.", meaning: "จองไว้ในชื่อมีนา นี่คือหนังสือเดินทาง รบกวนช่วยตรวจสอบ", keywords: ["我有预订","名字是米娜","护照","麻烦您","huzhao"], tip: "ชื่อจองควรตรงกับหนังสือเดินทาง ประโยคนี้ข้อมูลครบและมืออาชีพ", next: { target: "好的，米娜女士。预订两晚，请您稍等。", roman: "Hǎo de, Mǐnà nǚshì. Yùdìng liǎng wǎn, qǐng nín shāo děng.", meaning: "พบรายการจองสองคืน กรุณารอสักครู่" } },
          { level: 4, target: "有的，预订人是米娜。这是护照，谢谢。", roman: "Yǒu de, yùdìng rén shì Mǐnà. Zhè shì hùzhào, xièxie.", meaning: "จองไว้ ชื่อผู้จองคือมีนา นี่หนังสือเดินทาง ขอบคุณ", keywords: ["预订人","米娜","这是护照","yuding ren"], tip: "กระชับ สุภาพ และให้ข้อมูลครบ เหมาะกับโรงแรมทั่วไป", next: { target: "找到了。请问您住几晚？", roman: "Zhǎo dào le. Qǐngwèn nín zhù jǐ wǎn?", meaning: "พบรายการแล้ว พักกี่คืน?" } },
          { level: 3, target: "有，米娜订的，护照给你。", roman: "Yǒu, Mǐnà dìng de, hùzhào gěi nǐ.", meaning: "มี มีนาเป็นคนจอง หนังสือเดินทางให้คุณ", keywords: ["米娜订的","护照给你","mina ding de","huzhao"], tip: "ข้อมูลครบและเป็นภาษาพูด แต่ที่เคาน์เตอร์โรงแรมควรเติมคำขอบคุณเพื่อให้สุภาพขึ้น", next: { target: "好的，我帮您查一下。", roman: "Hǎo de, wǒ bāng nín chá yíxià.", meaning: "ได้ครับ/ค่ะ จะตรวจสอบให้" } },
          { level: 2, target: "有预订，名字是米娜，护照在这儿。", roman: "Yǒu yùdìng, míngzi shì Mǐnà, hùzhào zài zhèr.", meaning: "มีการจอง ชื่อมีนา หนังสือเดินทางอยู่นี่", keywords: ["有预订","名字是米娜","护照在这儿","youding","Mina"], risk: false, tip: "ให้ข้อมูลสำคัญครบและตรง โดยไม่สั่งพนักงาน", next: { target: "好的，请稍等。", roman: "Hǎo de, qǐng shāo děng.", meaning: "ได้ กรุณารอสักครู่" } },
          { level: 1, target: "订在米娜名下，护照在这里，请再核对一次。", roman: "Dìng zài Mǐnà míngxià, hùzhào zài zhèlǐ, qǐng zài héduì yí cì.", meaning: "จองในชื่อมีนา หนังสือเดินทางอยู่นี่ กรุณาตรวจอีกครั้ง", keywords: ["米娜名下","护照在这里","再核对一次","Mina","ตรวจอีกครั้ง"], risk: false, tip: "ให้ข้อมูลที่ต้องใช้ครบ แล้วขอให้ตรวจซ้ำอย่างตรงไปตรงมา", next: { target: "好的，请稍等，我再核对一次。", roman: "Hǎo de, qǐng shāoděng, wǒ zài héduì yí cì.", meaning: "ได้ค่ะ กรุณารอสักครู่ จะตรวจอีกครั้ง" } }
        ],
        fallback: { target: "请问预订人的姓名是？", roman: "Qǐngwèn yùdìng rén de xìngmíng shì?", meaning: "ขอทราบชื่อผู้จองครับ/ค่ะ" }
      },
      {
        id: "market", icon: "价", category: "daily", title: "ตลาดและการต่อราคา", place: "ตลาด · ร้านผ้าพันคอ", avatar: "价", goal: "ขอซื้อผ้าพันคอราคา 100 หยวนโดยไม่กล่าวหาว่าร้านโกง",
        opening: { target: "这条围巾一百二，喜欢可以试试。", roman: "Zhè tiáo wéijīn yì bǎi èr, xǐhuan kěyǐ shìshi.", meaning: "ผ้าพันคอผืนนี้ 120 หยวน ถ้าชอบลองได้" },
        options: [
          { level: 5, target: "挺好看的。请问一百元可以吗？", roman: "Tǐng hǎokàn de. Qǐngwèn yì bǎi yuán kěyǐ ma?", meaning: "สวยดี ขอราคา 100 หยวนได้ไหม?", keywords: ["挺好看的","请问","一百元可以吗","qingwen","100 หยวน"], tip: "เริ่มจากชมสินค้า แล้วค่อยเสนอราคาที่ชัดเจนอย่างสุภาพ โดยเปิดโอกาสให้ผู้ขายปฏิเสธได้", next: { target: "一百零五可以吗？", roman: "Yì bǎi líng wǔ kěyǐ ma?", meaning: "105 หยวนได้ไหม?" } },
          { level: 4, target: "我挺喜欢的，一百可以吗？", roman: "Wǒ tǐng xǐhuan de, yì bǎi kěyǐ ma?", meaning: "ฉันชอบนะ 100 หยวนได้ไหม?", keywords: ["挺喜欢","一百可以吗","yi bai","100 หยวน"], tip: "ตรง เป็นมิตร และมีรูปคำถาม เหมาะกับตลาดหรือร้านที่ต่อรองได้", next: { target: "可以，给您包起来。", roman: "Kěyǐ, gěi nín bāo qǐlai.", meaning: "ได้ จะห่อให้" } },
          { level: 3, target: "老板，一百行吗？行我就拿。", roman: "Lǎobǎn, yì bǎi xíng ma? Xíng wǒ jiù ná.", meaning: "เถ้าแก่ 100 หยวนได้ไหม? ถ้าได้เอาเลย", keywords: ["老板","一百行吗","我就拿","laoban","100 หยวน"], tip: "老板 และ 行吗 เป็นภาษาพูดกันเอง เหมาะกับร้านที่ต่อรองได้", next: { target: "行，一百卖你。", roman: "Xíng, yì bǎi mài nǐ.", meaning: "ได้ ขายให้ 100 หยวน" } },
          { level: 2, target: "价格超出预算，一百可以吗？", roman: "Jiàgé chāochū yùsuàn, yì bǎi kěyǐ ma?", meaning: "ราคาเกินงบ 100 หยวนได้ไหม?", keywords: ["超出预算","一百可以吗","yibai keyi ma","เกินงบ"], risk: false, tip: "บอกงบตรง ๆ และเปิดทางให้อีกฝ่ายตอบหรือเสนอราคาใหม่", next: { target: "一百可以，就按这个价格吧。", roman: "Yì bǎi kěyǐ, jiù àn zhège jiàgé ba.", meaning: "100 ได้ ตกลงตามราคานี้" } },
          { level: 1, target: "一百元是我的预算；如果不合适，我先不买了。", roman: "Yì bǎi yuán shì wǒ de yùsuàn; rúguǒ bù héshì, wǒ xiān bù mǎi le.", meaning: "งบของฉันคือ 100 หยวน ถ้าไม่เหมาะ ฉันยังไม่ซื้อ", keywords: ["一百元","我的预算","先不买了","yi bai yuan","ยังไม่ซื้อ"], risk: false, tip: "บอกงบและทางออกอย่างชัดเจน โดยไม่กล่าวหาร้านค้า", next: { target: "明白，这个价格暂时不能卖。", roman: "Míngbai, zhège jiàgé zànshí bù néng mài.", meaning: "เข้าใจค่ะ ราคานี้ยังขายไม่ได้" } }
        ],
        fallback: { target: "您想出多少钱？", roman: "Nín xiǎng chū duōshao qián?", meaning: "คุณต้องการเสนอราคาเท่าไร?" }
      },
      {
        id: "work", icon: "工", category: "work", title: "คุยงานกับหัวหน้า", place: "ที่ทำงาน · กำหนดส่งวันนี้", avatar: "工", goal: "รับงานพร้อมยืนยันเวลาและลำดับสำคัญ",
        opening: { target: "这个方案今天下午能改完吗？", roman: "Zhège fāng'àn jīntiān xiàwǔ néng gǎi wán ma?", meaning: "แผนงานนี้แก้ให้เสร็จบ่ายวันนี้ได้ไหม?" },
        options: [
          { level: 5, target: "可以。我会在下午四点前完成修改，并把重点变化整理好发给您。", roman: "Kěyǐ. Wǒ huì zài xiàwǔ sì diǎn qián wánchéng xiūgǎi, bìng bǎ zhòngdiǎn biànhuà zhěnglǐ hǎo fā gěi nín.", meaning: "ได้ จะปรับเสร็จก่อนสี่โมงและสรุปจุดเปลี่ยนส่งให้", keywords: ["四点前","完成修改","重点变化","si dian qian"], tip: "เวลาชัดและสิ่งส่งมอบชัด ฟังเป็นมืออาชีพ", next: { target: "好，那请你四点前发我，重点变化单独标出来。", roman: "Hǎo, nà qǐng nǐ sì diǎn qián fā wǒ, zhòngdiǎn biànhuà dāndú biāo chūlai.", meaning: "ดี ส่งก่อนสี่โมงและทำเครื่องหมายจุดสำคัญ" } },
          { level: 4, target: "可以，下午四点前给您。需要我优先改哪一部分吗？", roman: "Kěyǐ, xiàwǔ sì diǎn qián gěi nín. Xūyào wǒ yōuxiān gǎi nǎ yí bùfen ma?", meaning: "ได้ จะส่งก่อนสี่โมง ต้องการให้แก้ส่วนไหนก่อน?", keywords: ["四点前给您","优先改","youxian gai","ส่วนไหนก่อน"], tip: "ถามลำดับความสำคัญช่วยลดการแก้ผิดจุดและแสดงความรับผิดชอบ", next: { target: "先改数据部分，其他的你看着调整。", roman: "Xiān gǎi shùjù bùfen, qítā de nǐ kànzhe tiáozhěng.", meaning: "แก้ส่วนข้อมูลก่อน ส่วนอื่นปรับตามเหมาะสม" } },
          { level: 3, target: "行，我下午四点前改完发你。", roman: "Xíng, wǒ xiàwǔ sì diǎn qián gǎi wán fā nǐ.", meaning: "โอเค ฉันจะแก้เสร็จและส่งให้ก่อนสี่โมง", keywords: ["四点前","改完发你","si dian qian"], tip: "รับงานและให้เวลาแน่นอน เป็นภาษาพูดกับเพื่อนร่วมงานที่สนิท", next: { target: "行，有问题及时告诉我。", roman: "Xíng, yǒu wèntí jíshí gàosu wǒ.", meaning: "โอเค ถ้ามีปัญหาให้บอกทันที" } },
          { level: 2, target: "收到，四点前发给您。", roman: "Shōudào, sì diǎn qián fā gěi nín.", meaning: "รับทราบ จะส่งให้ก่อนสี่โมง", keywords: ["收到","四点前发给您","shoudao","si dian qian"], risk: false, tip: "ยืนยันงานและเวลาให้ชัด กระชับ และยังให้เกียรติ", next: { target: "好的，请按时提交。", roman: "Hǎo de, qǐng ànshí tíjiāo.", meaning: "ได้ กรุณาส่งตรงเวลา" } },
          { level: 1, target: "我会在四点前发给你；如果有变化，我会提前说明。", roman: "Wǒ huì zài sì diǎn qián fā gěi nǐ; rúguǒ yǒu biànhuà, wǒ huì tíqián shuōmíng.", meaning: "ฉันจะส่งให้ก่อนสี่โมง หากมีการเปลี่ยนแปลงจะแจ้งล่วงหน้า", keywords: ["四点前","发给你","提前说明","si dian qian","แจ้งล่วงหน้า"], risk: false, tip: "ยืนยันเวลาและวิธีแจ้งความเปลี่ยนแปลง ทำให้การคุยกลับมาที่งาน", next: { target: "好，有变化请及时告诉我。", roman: "Hǎo, yǒu biànhuà qǐng jíshí gàosu wǒ.", meaning: "ได้ หากมีการเปลี่ยนแปลงกรุณาแจ้งทันที" } }
        ],
        fallback: { target: "你预计几点能完成？", roman: "Nǐ yùjì jǐ diǎn néng wánchéng?", meaning: "คุณคาดว่าจะทำเสร็จกี่โมง?" }
      },
      {
        id: "friends", icon: "友", category: "friend", title: "ทำความรู้จักเพื่อนใหม่", place: "กิจกรรมแลกเปลี่ยนภาษา", avatar: "友", goal: "แนะนำตัวและชวนคุยต่ออย่างธรรมชาติ",
        opening: { target: "你也是第一次来这个活动吗？", roman: "Nǐ yě shì dì-yī cì lái zhège huódòng ma?", meaning: "คุณก็มางานนี้ครั้งแรกเหมือนกันเหรอ?" },
        options: [
          { level: 5, target: "是的，这是我第一次参加。很高兴认识你，我叫敏，请问怎么称呼你？", roman: "Shì de, zhè shì wǒ dì-yī cì cānjiā. Hěn gāoxìng rènshi nǐ, wǒ jiào Mǐn, qǐngwèn zěnme chēnghu nǐ?", meaning: "ใช่ ครั้งแรก ยินดีที่รู้จัก ฉันชื่อหมิ่น ควรเรียกคุณว่าอะไร?", keywords: ["第一次参加","很高兴认识你","我叫敏","怎么称呼"], tip: "สุภาพมากและปลอดภัย แต่อาจทางการนิดหนึ่งกับคนวัยเดียวกัน", next: { target: "我姓李，叫我小李就好。很高兴认识你。", roman: "Wǒ xìng Lǐ, jiào wǒ Xiǎo Lǐ jiù hǎo. Hěn gāoxìng rènshi nǐ.", meaning: "ฉันแซ่หลี่ เรียกเสี่ยวหลี่ก็ได้ ยินดีที่รู้จัก" } },
          { level: 4, target: "对，我第一次来。我叫敏，你叫什么？", roman: "Duì, wǒ dì-yī cì lái. Wǒ jiào Mǐn, nǐ jiào shénme?", meaning: "ใช่ ฉันมาครั้งแรก ฉันชื่อหมิ่น คุณชื่ออะไร?", keywords: ["第一次来","我叫敏","你叫什么","wo jiao min"], tip: "ถามชื่อกลับอย่างสั้นและธรรมชาติ ทำให้คุยต่อได้", next: { target: "我叫小李。要不要一起看看活动表？", roman: "Wǒ jiào Xiǎo Lǐ. Yào bu yào yìqǐ kànkan huódòngbiǎo?", meaning: "ฉันชื่อเสี่ยวหลี่ ไปดูตารางกิจกรรมด้วยกันไหม?" } },
          { level: 3, target: "对啊，第一次。叫我敏就行，你叫什么？", roman: "Duì a, dì-yī cì. Jiào wǒ Mǐn jiù xíng, nǐ jiào shénme?", meaning: "ใช่ ครั้งแรก เรียกฉันว่าหมิ่นก็พอ คุณชื่ออะไร?", keywords: ["对啊","叫我敏就行","你叫什么"], tip: "就行 ทำให้น้ำเสียงสบาย เหมาะกับเพื่อนวัยเดียวกัน", next: { target: "我小李。走，一起去领名牌吧。", roman: "Wǒ Xiǎo Lǐ. Zǒu, yìqǐ qù lǐng míngpái ba.", meaning: "ฉันเสี่ยวหลี่ ไปเอาป้ายชื่อด้วยกัน" } },
          { level: 2, target: "嗯，第一次。我叫敏，你叫什么？", roman: "Ńg, dì-yī cì. Wǒ jiào Mǐn, nǐ jiào shénme?", meaning: "อืม ครั้งแรก ฉันชื่อหมิ่น คุณชื่ออะไร?", keywords: ["第一次","我叫敏","你叫什么","wo jiao min"], risk: false, tip: "ตอบและถามกลับอย่างตรงไปตรงมา โดยไม่เร่งให้อีกฝ่ายเปิดเผยข้อมูล", next: { target: "我叫小李，很高兴认识你。", roman: "Wǒ jiào Xiǎo Lǐ, hěn gāoxìng rènshi nǐ.", meaning: "ฉันชื่อเสี่ยวหลี่ ยินดีที่ได้รู้จัก" } },
          { level: 1, target: "我叫敏；如果现在不方便聊天，我们下次再聊。", roman: "Wǒ jiào Mǐn; rúguǒ xiànzài bù fāngbiàn liáotiān, wǒmen xià cì zài liáo.", meaning: "ฉันชื่อหมิ่น ถ้าตอนนี้ไม่สะดวกคุย ไว้คุยกันครั้งหน้า", keywords: ["我叫敏","不方便聊天","下次再聊","wo jiao min","ครั้งหน้า"], risk: false, tip: "แนะนำตัวและเว้นทางออกให้ทั้งสองฝ่าย ไม่ฝืนบทสนทนา", next: { target: "好，很高兴认识你，下次再聊。", roman: "Hǎo, hěn gāoxìng rènshi nǐ, xià cì zài liáo.", meaning: "ได้ ยินดีที่ได้รู้จัก ไว้คุยกันครั้งหน้า" } }
        ],
        fallback: { target: "没听清。你叫什么名字？", roman: "Méi tīng qīng. Nǐ jiào shénme míngzi?", meaning: "ฟังไม่ชัด คุณชื่ออะไร?" }
      },
      {
        id: "emergency", icon: "急", category: "risk", title: "ขอความช่วยเหลือฉุกเฉิน", place: "ประเทศจีน · โทร 120", avatar: "急", goal: "บอกอาการ สติ และที่อยู่ให้ครบ",
        opening: { target: "120急救中心，请问发生了什么？", roman: "Yāo-èrlíng jíjiù zhōngxīn, qǐngwèn fāshēng le shénme?", meaning: "ศูนย์ฉุกเฉิน 120 เกิดเหตุอะไรขึ้น?" },
        options: [
          { level: 5, target: "您好，有人呼吸困难，现在意识清醒。我们在南京东路一百号一楼大厅，请派救护车。", roman: "Nín hǎo, yǒu rén hūxī kùnnan, xiànzài yìshi qīngxǐng. Wǒmen zài Nánjīng Dōnglù yì bǎi hào yì lóu dàtīng, qǐng pài jiùhùchē.", meaning: "มีคนหายใจลำบาก ยังรู้สึกตัว อยู่ล็อบบี้ชั้นหนึ่ง เลขที่ 100 ถนนหนานจิงตะวันออก กรุณาส่งรถพยาบาล", keywords: ["呼吸困难","意识清醒","南京东路一百号","救护车","huxi kunnan"], tip: "เรียง อาการ → สติ → ที่อยู่ → สิ่งที่ต้องการ ชัดเจนกว่าคำสุภาพยาว ๆ", next: { target: "好的，救护车正在出发。患者现在能正常说话吗？", roman: "Hǎo de, jiùhùchē zhèngzài chūfā. Huànzhě xiànzài néng zhèngcháng shuōhuà ma?", meaning: "รถพยาบาลกำลังออก ผู้ป่วยยังพูดได้ตามปกติไหม?" } },
          { level: 4, target: "这里有人呼吸困难，意识清醒。地址是南京东路一百号一楼大厅。", roman: "Zhèlǐ yǒu rén hūxī kùnnan, yìshi qīngxǐng. Dìzhǐ shì Nánjīng Dōnglù yì bǎi hào yì lóu dàtīng.", meaning: "มีคนหายใจลำบาก ยังรู้สึกตัว ที่อยู่ล็อบบี้ชั้นหนึ่ง เลขที่ 100 ถนนหนานจิงตะวันออก", keywords: ["呼吸困难","意识清醒","地址是","一楼大厅"], tip: "กระชับและมีข้อมูลสำคัญครบ เหมาะที่สุดเมื่อทุกวินาทีมีค่า", next: { target: "收到，已经派车。请保持电话畅通。", roman: "Shōudào, yǐjīng pài chē. Qǐng bǎochí diànhuà chàngtōng.", meaning: "รับทราบ ส่งรถแล้ว กรุณาให้โทรศัพท์ติดต่อได้" } },
          { level: 3, target: "这边有人呼吸困难，还清醒，在南京东路一百号一楼大厅，麻烦快点来。", roman: "Zhèbiān yǒu rén hūxī kùnnan, hái qīngxǐng, zài Nánjīng Dōnglù yì bǎi hào yì lóu dàtīng, máfan kuài diǎn lái.", meaning: "มีคนหายใจลำบาก ยังรู้สึกตัว อยู่ล็อบบี้ชั้นหนึ่ง เลขที่ 100 ถนนหนานจิงตะวันออก รบกวนมาเร็ว", keywords: ["呼吸困难","还清醒","南京东路一百号","一楼大厅","快点来"], tip: "เป็นภาษาพูดที่ข้อมูลครบ ทั้งอาการ สติ ที่อยู่ และคำขอให้ส่งความช่วยเหลือ", next: { target: "已经派车。患者现在能说话吗？", roman: "Yǐjīng pài chē. Huànzhě xiànzài néng shuōhuà ma?", meaning: "ส่งรถแล้ว ตอนนี้ผู้ป่วยยังพูดได้ไหม?" } },
          { level: 2, target: "有人呼吸困难，还清醒，在南京东路一百号一楼大厅。赶紧派车！", roman: "Yǒu rén hūxī kùnnan, hái qīngxǐng, zài Nánjīng Dōnglù yì bǎi hào yì lóu dàtīng. Gǎnjǐn pài chē!", meaning: "มีคนหายใจลำบาก ยังรู้สึกตัว อยู่ล็อบบี้ชั้นหนึ่ง เลขที่ 100 ถนนหนานจิงตะวันออก รีบส่งรถ!", keywords: ["呼吸困难","还清醒","南京东路一百号","一楼大厅","赶紧派车"], risk: false, registerOverride: { risk: false, isRisk: false, riskLevel: "context-safe", recommended: true, followMode: "practice", goalPriority: "life-safety", contextLabelZh: "紧急直接（合理）", contextLabelTh: "ตรงเพราะเหตุฉุกเฉิน (เหมาะสม)", warningZh: "", warningTh: "" }, tip: "ข้อมูลฉุกเฉินครบถ้วน ในเหตุจริง “赶紧派车” เป็นคำสั่งที่ตรงและเหมาะสม ระดับ S2 ในที่นี้บอกเพียงว่าน้ำเสียงตรงที่สุด ไม่ได้หมายความว่าไร้มารยาทหรือไม่ปลอดภัย", next: { target: "已经派车，请保持电话畅通。", roman: "Yǐjīng pài chē, qǐng bǎochí diànhuà chàngtōng.", meaning: "ส่งรถแล้ว กรุณาให้โทรศัพท์ติดต่อได้" } },
          { level: 1, target: "有人呼吸困难，还清醒，在南京东路一百号一楼大厅。请立即派车。", roman: "Yǒu rén hūxī kùnnan, hái qīngxǐng, zài Nánjīng Dōnglù yì bǎi hào yì lóu dàtīng. Qǐng lìjí pài chē.", meaning: "มีคนหายใจลำบาก ยังรู้สึกตัว อยู่ล็อบบี้ชั้นหนึ่ง เลขที่ 100 ถนนหนานจิงตะวันออก กรุณาส่งรถทันที", keywords: ["呼吸困难","还清醒","南京东路一百号","一楼大厅","立即派车","ส่งรถทันที"], risk: false, tip: "ให้ข้อมูลช่วยชีวิตครบและขอความช่วยเหลือทันที โดยไม่เสียเวลากับความขัดแย้ง", next: { target: "已经派车，请保持电话畅通并回答调度问题。", roman: "Yǐjīng pài chē, qǐng bǎochí diànhuà chàngtōng bìng huídá diàodù wèntí.", meaning: "ส่งรถแล้ว กรุณาให้โทรศัพท์ติดต่อได้และตอบคำถามของศูนย์" } }
        ],
        fallback: { target: "请慢一点，先告诉我具体地址。", roman: "Qǐng màn yìdiǎn, xiān gàosu wǒ jùtǐ dìzhǐ.", meaning: "พูดช้าลง ก่อนอื่นบอกที่อยู่ที่แน่นอน" },
        safety: "เนื้อหานี้ใช้ฝึกภาษาเท่านั้น เมื่อเกิดเหตุจริงให้โทรหมายเลขฉุกเฉินของพื้นที่ทันที"
      }
    ]
  }
};

/*
 * V13 语域一致性契约：同一 scenario 的五个选项保留同一核心意图，
 * 只改变场合、关系距离和沟通策略。所有选项均可安全练习。
 */
const OFFLINE_REGISTER_AUDIT = {
  version: "offline-register-v13.0-20260904",
  framework: "HUILAISHI_REGISTER_GUIDE",
  nativeSpeakerSignoff: "pending",
  levels: {
    5: { grade: "S5", followMode: "practice", riskLevel: "safe" },
    4: { grade: "S4", followMode: "practice", riskLevel: "safe" },
    3: { grade: "S3", followMode: "practice-with-context", riskLevel: "situational" },
    2: { grade: "S2", followMode: "practice-with-context", riskLevel: "situational" },
    1: { grade: "S1", followMode: "practice", riskLevel: "safe" }
  }
};

/*
 * Learner-side S5/S4 lines need an explicit speaker form.  NPC replies keep the
 * identity authored by each scene; these forms only change the sentence the
 * learner is invited to say.  Both forms remain native-review pending.
 */
const OFFLINE_THAI_SPEAKER_FORMS = {
  "convenience:S5": { target: "รบกวนขอน้ำเปล่าหนึ่งขวดได้ไหมคะ", roman: "róp-kuan khɔ̌ɔ náam-plàao nʉ̀ng khùat dâi mái khá" },
  "convenience:S4": { target: "ขอน้ำเปล่าหนึ่งขวดค่ะ", roman: "khɔ̌ɔ náam-plàao nʉ̀ng khùat khâ" },
  "restaurant:S5": { target: "ยังตัดสินใจไม่ได้ค่ะ รบกวนขอเวลาดูเมนูอีกสักครู่ได้ไหมคะ", roman: "yang tàt-sǐn-jai mâi dâi khâ, róp-kuan khɔ̌ɔ wee-laa duu mee-nuu ìik sàk-khrûu dâi mái khá" },
  "restaurant:S4": { target: "ยังไม่พร้อมค่ะ ขอเวลาดูเมนูอีกสักครู่นะคะ", roman: "yang mâi phrɔ́ɔm khâ, khɔ̌ɔ wee-laa duu mee-nuu ìik sàk-khrûu ná khá" },
  "taxi:S5": { target: "รบกวนไปส่งที่บีทีเอสอโศก แล้วช่วยเปิดมิเตอร์ให้ด้วยได้ไหมคะ", roman: "róp-kuan pai sòng thîi bii-thii-èet à-sòok, lɛ́ɛo chûai pə̀ət mí-tə̂ə hâi dûai dâi mái khá" },
  "taxi:S4": { target: "ไปบีทีเอสอโศกค่ะ รบกวนเปิดมิเตอร์ด้วยนะคะ", roman: "pai bii-thii-èet à-sòok khâ, róp-kuan pə̀ət mí-tə̂ə dûai ná khá" },
  "hotel:S5": { target: "ใช่ค่ะ จองไว้ในชื่อหลี่ รบกวนช่วยตรวจสอบให้หน่อยได้ไหมคะ", roman: "châi khâ, jɔɔng wái nai chʉ̂ʉ lìi, róp-kuan chûai trùat-sɔ̀ɔp hâi nɔ̀i dâi mái khá" },
  "hotel:S4": { target: "จองไว้ในชื่อหลี่ค่ะ มาเช็กอินค่ะ", roman: "jɔɔng wái nai chʉ̂ʉ lìi khâ, maa chék-in khâ" },
  "market:S5": { target: "ถ้าซื้อสองชิ้น ไม่ทราบว่าหกร้อยบาทได้ไหมคะ", roman: "thâa sʉ́ʉ sɔ̌ɔng chín, mâi sâap wâa hòk-rɔ́ɔi bàat dâi mái khá" },
  "market:S4": { target: "ถ้าเอาสองชิ้น หกร้อยได้ไหมคะ", roman: "thâa ao sɔ̌ɔng chín, hòk-rɔ́ɔi dâi mái khá" },
  "work:S5": { target: "ยังไม่เรียบร้อยทั้งหมดค่ะ ตอนนี้เสร็จประมาณแปดสิบเปอร์เซ็นต์ ดิฉันจะส่งฉบับสมบูรณ์ให้ก่อนห้าโมงค่ะ", roman: "yang mâi rîap-rɔ́ɔi tháng-mòt khâ, tɔɔn-níi sèt prà-maan pɛ̀ɛt-sìp pəə-sen, dì-chǎn jà sòng chà-bàp sǒm-buun hâi kɔ̀ɔn hâa moong khâ" },
  "work:S4": { target: "ยังไม่เสร็จค่ะ ฉันจะส่งให้ก่อนห้าโมงค่ะ", roman: "yang mâi sèt khâ, chǎn jà sòng hâi kɔ̀ɔn hâa moong khâ" },
  "friends:S5": { target: "ใช่ค่ะ ยินดีที่ได้รู้จักค่ะ ดิฉันชื่ออาไท ไม่ทราบว่าคุณชื่ออะไรคะ", roman: "châi khâ, yin-dii thîi dâi rúu-jàk khâ, dì-chǎn chʉ̂ʉ aa-thai, mâi sâap wâa khun chʉ̂ʉ à-rai khá" },
  "friends:S4": { target: "สวัสดีค่ะ ฉันชื่ออาไทค่ะ คุณชื่ออะไรคะ", roman: "sà-wàt-dii khâ, chǎn chʉ̂ʉ aa-thai khâ, khun chʉ̂ʉ à-rai khá" },
  "emergency:S5": { target: "เพื่อนหายใจไม่ออก อยู่หน้าสถานีอโศก รบกวนช่วยโทร 1669 เรียกรถพยาบาลให้หน่อยค่ะ", roman: "phʉ̂an hǎai-jai mâi ɔ̀ɔk, yùu nâa sà-thǎa-nii à-sòok, róp-kuan chûai thoo nʉ̀ng-hòk-hòk-kâao rîak rót-phá-yaa-baan hâi nɔ̀i khâ" },
  "emergency:S4": { target: "มีคนหายใจไม่ออก อยู่หน้าสถานีอโศก ช่วยโทร 1669 ให้หน่อยค่ะ", roman: "mii khon hǎai-jai mâi ɔ̀ɔk, yùu nâa sà-thǎa-nii à-sòok, chûai thoo nʉ̀ng-hòk-hòk-kâao hâi nɔ̀i khâ" }
};

Object.entries(OFFLINE_APP_CONTENT).forEach(([direction, dataset]) => {
  dataset.registerAudit = OFFLINE_REGISTER_AUDIT;
  dataset.scenarios.forEach((scenario) => {
    scenario.meaningId = `dialog:${direction}:${scenario.id}:intent-v11`;
    scenario.options.forEach((option) => {
      const level = OFFLINE_REGISTER_AUDIT.levels[option.level];
      const registerOverride = option.registerOverride || {};
      option.grade = level.grade;
      option.meaningId = scenario.meaningId;
      option.followMode = registerOverride.followMode || level.followMode;
      option.riskLevel = registerOverride.riskLevel || level.riskLevel;
      if (typeof registerOverride.risk === "boolean") option.risk = registerOverride.risk;
      if (typeof registerOverride.isRisk === "boolean") option.isRisk = registerOverride.isRisk;
      if (typeof registerOverride.recommended === "boolean") option.recommended = registerOverride.recommended;
      if (registerOverride.goalPriority) option.goalPriority = registerOverride.goalPriority;
      if (registerOverride.contextLabelZh) option.contextLabelZh = registerOverride.contextLabelZh;
      if (registerOverride.contextLabelTh) option.contextLabelTh = registerOverride.contextLabelTh;
      if (typeof registerOverride.warningZh === "string") option.warningZh = registerOverride.warningZh;
      if (typeof registerOverride.warningTh === "string") option.warningTh = registerOverride.warningTh;
      option.nativeReview = option.level === 1;
      option.nativeReviewReason = option.level === 1
        ? "母语教师终审：确认冲突降级表达的自然度、地区差异、关系限制与罗马音。"
        : "";
      if (direction === "zh-th" && (option.level === 5 || option.level === 4)) {
        const female = OFFLINE_THAI_SPEAKER_FORMS[`${scenario.id}:S${option.level}`];
        if (female) {
          option.speakerForms = {
            female: { ...female, profile: "female", contentReviewStatus: "native-review-pending" },
            male: { target: option.target, roman: option.roman, profile: "male", contentReviewStatus: "native-review-pending" }
          };
          option.speakerFormStatus = "female-and-male-native-review-pending";
        }
      }
    });
  });
});

window.OFFLINE_APP_CONTENT = OFFLINE_APP_CONTENT;
window.HUILAISHI_OFFLINE_REGISTER_AUDIT = OFFLINE_REGISTER_AUDIT;
