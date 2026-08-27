(() => {
  "use strict";

  const COURSES = {
    "zh-th": {
      eyebrow: "泰语发音课 · 01",
      name: "泰语发音课",
      intro: "先听清，再开口。每课只解决一个发音动作。",
      unit: "课",
      lesson: "发音课",
      listen: "清晰示范",
      slow: "清晰慢听",
      chunks: "逐段听",
      examples: "先听差别",
      practice: "耳朵小测",
      next: "下一课",
      previous: "上一课",
      close: "关闭音标课",
      launcher: "音标课",
      correct: "听对了",
      wrong: "再听一次",
      review: "课程给出实用 IPA 与带调罗马音。中文近音只帮记忆，不能代替泰语原音；正式商用前仍需泰语母语教师逐条终审。",
      lessons: [
        {
          id: "th-tones", no: "01", title: "五个声调，不是五种情绪", focus: "中调 · 低调 · 降调 · 高调 · 升调",
          explain: "泰语声调能改变词义。先保持辅音和长元音 /aː/ 不变，只改变音高走向；不要用“重读”代替声调。",
          rule: "实用调号：ā 平稳中调 · à 低调 · â 高起下降 · á 高调 · ǎ 低起上升。",
          examples: [
            { text: "คา", ipa: "/kʰaː˧/", roman: "khaa", meaning: "卡住 · 中调" },
            { text: "ข่า", ipa: "/kʰaː˩/", roman: "khàa", meaning: "南姜 · 低调" },
            { text: "ค่า", ipa: "/kʰaː˥˩/", roman: "khâa", meaning: "价值 · 降调" },
            { text: "ค้า", ipa: "/kʰaː˦˥/", roman: "kháa", meaning: "经商 · 高调" },
            { text: "ขา", ipa: "/kʰaː˩˩˦/", roman: "khǎa", meaning: "腿 · 升调" }
          ],
          model: { text: "เขาปวดขาแต่ค่ารักษาไม่แพง", ipa: "/kʰǎw pùat̚ kʰǎː tɛ̀ː kʰâː rák̚.sǎː mâj pʰɛːŋ/", roman: "khǎo pùat khǎa, tɛ̀ɛ khâa rák-sǎa mâi phɛɛng", mnemonic: "ขา 升调；ค่า 降调。放进自然语境后仍要保留两条不同音高轨迹。", translation: "他的腿疼，但治疗费不贵。", chunks: ["เขาปวดขา", "แต่ค่ารักษา", "ไม่แพง"] },
          quiz: { prompt: "“价值”是哪一个？", options: ["คา · khaa", "ค่า · khâa", "ขา · khǎa"], answer: 1, why: "ค่า 是降调 khâa；结尾明显向下落。" }
        },
        {
          id: "th-vowels", no: "02", title: "元音长短会换词", focus: "短元音不是把长元音随便说快",
          explain: "长短是词的一部分。短元音要短而干净，长元音要真正拉开时值；比较时保持声母、尾音和声调尽量一致。",
          rule: "IPA 的 /ː/ 表示长元音。中文近音很难准确标出时长，所以必须跟原音对照。",
          examples: [
            { text: "เขา", ipa: "/kʰǎw/", roman: "khǎo", meaning: "他／山 · 较短" },
            { text: "ขาว", ipa: "/kʰǎːw/", roman: "khǎao", meaning: "白色 · 较长" },
            { text: "กัน", ipa: "/kan/", roman: "kan", meaning: "一起／彼此 · 短 a" },
            { text: "การ", ipa: "/kaːn/", roman: "kaan", meaning: "事情／行为 · 长 aa" }
          ],
          model: { text: "วันนี้เขาใส่เสื้อสีขาว", ipa: "/wan.níː kʰǎw sàj sɯ̂a sǐː kʰǎːw/", roman: "wan-níi khǎo sài sʉ̂a sǐi khǎao", mnemonic: "เขา 的 /aw/ 较短；สี 的 /iː/ 与 ขาว 的 /aːw/ 都要拉开时值。", translation: "今天他穿白色衣服。", chunks: ["วันนี้เขา", "ใส่เสื้อ", "สีขาว"] },
          quiz: { prompt: "哪一个是长元音“白色”？", options: ["เขา · khǎo", "ขาว · khǎao", "กัน · kan"], answer: 1, why: "ขาว 的 /aː/ 要拉长，不能说成 เขา。" }
        },
        {
          id: "th-aspiration", no: "03", title: "送气与不送气", focus: "กา /kaː/ ≠ คา /kʰaː/",
          explain: "把手放在嘴前：送气音会有清楚气流，不送气音只有较轻的爆破。汉语拼音 b/d/g 是不送气，p/t/k 是送气，可借这个动作理解。",
          rule: "IPA 上标 ʰ 表示送气。不要把不送气音误读成汉语浊音。",
          examples: [
            { text: "กา — คา", ipa: "/kaː — kʰaː/", roman: "kaa — khaa", meaning: "乌鸦 — 卡住" },
            { text: "ปา — พา", ipa: "/paː — pʰaː/", roman: "paa — phaa", meaning: "扔 — 带领" },
            { text: "ตา — ทา", ipa: "/taː — tʰaː/", roman: "taa — thaa", meaning: "眼睛／外公 — 涂抹" }
          ],
          model: { text: "ป้าพาเขาไปทาครีม", ipa: "/pâː pʰaː kʰǎw paj tʰaː kʰriːm/", roman: "pâa phaa khǎo pai thaa khriim", mnemonic: "ป้า、ไป 不送气；พา、เขา、ทา、ครีม 送气清楚，但不能额外塞入元音。", translation: "阿姨带他去涂面霜。", chunks: ["ป้าพาเขา", "ไปทาครีม"] },
          quiz: { prompt: "会吹动纸片的“带领”是？", options: ["ปา · paa", "พา · phaa", "ตา · taa"], answer: 1, why: "พา /pʰaː/ 有送气标记 ʰ。" }
        },
        {
          id: "th-finals", no: "04", title: "尾音要收住", focus: "-p̚ · -t̚ · -k̚ / -m · -n · -ŋ",
          explain: "泰语词尾 p、t、k 通常不释放：嘴型到位就停，不再喷出一个“坡／特／克”。鼻尾音 m、n、ŋ 的收口位置也会区分词义。",
          rule: "IPA 的 ̚ 表示不释放。-ŋ 就像中文“昂”的后鼻音，但前面不要自动加元音。",
          examples: [
            { text: "รับ — รัด — รัก", ipa: "/ráp̚ — rát̚ — rák̚/", roman: "ráp — rát — rák", meaning: "接收 — 勒紧 — 爱" },
            { text: "ลม — ลน — ลง", ipa: "/lom — lon — loŋ/", roman: "lom — lon — long", meaning: "风 — 慌忙 — 下去" }
          ],
          model: { text: "เธอรับรักฉันไหม", ipa: "/tʰɤː ráp̚ rák̚ tɕʰǎn máj/", roman: "thəə ráp rák chǎn mái", mnemonic: "รับ 用双唇 -p̚ 收住；รัก 用舌后 -k̚ 收住，两处都不释放。", translation: "你接受我的爱吗？（尾音操）", chunks: ["เธอ", "รับ", "รัก", "ฉันไหม"] },
          quiz: { prompt: "“爱”的尾音收在哪里？", options: ["双唇 -p̚", "齿龈 -t̚", "舌后 -k̚"], answer: 2, why: "รัก /rák̚/ 在舌后形成 k 的阻塞后直接停住。" }
        },
        {
          id: "th-classes", no: "05", title: "辅音组与隐含元音", focus: "辅音等级决定声调；连写不等于一个音节",
          explain: "泰语辅音分中、高、低三类，类别会和音节类型、声调符号共同决定声调。กร/กล/กว 可组成真辅音丛；有些连续辅音之间还要读出没有写明的短元音。",
          rule: "初学先整词跟读，不凭字面硬拼。例：ถนน 分成 ถะ-หนน /tʰà.nǒn/，不是一个超长辅音串。",
          examples: [
            { text: "กลาง", ipa: "/klaːŋ/", roman: "klaang", meaning: "中间 · 真辅音丛 kl-" },
            { text: "กว้าง", ipa: "/kwâːŋ/", roman: "kwâang", meaning: "宽 · 真辅音丛 kw-" },
            { text: "ถนน", ipa: "/tʰà.nǒn/", roman: "thà-nǒn", meaning: "道路 · 隐含短元音" },
            { text: "สบาย", ipa: "/sà.baːj/", roman: "sà-baai", meaning: "舒服 · 两音节" }
          ],
          model: { text: "ถนนเส้นนี้กว้างมาก", ipa: "/tʰà.nǒn sêːn níː kwâːŋ mâːk̚/", roman: "thà-nǒn sêen níi kwâang mâak", mnemonic: "ถนน 读两音节 /tʰà.nǒn/；กว้าง 保留 kw- 辅音丛。", translation: "这条路非常宽。", chunks: ["ถนนเส้นนี้", "กว้าง", "มาก"] },
          quiz: { prompt: "ถนน 应该分成几段？", options: ["ถนน 一口读完", "ถะ · หนน", "ถ · น · น"], answer: 1, why: "常用实读为 /tʰà.nǒn/，中间有隐含的短元音。" }
        },
        {
          id: "th-particles", no: "06", title: "ครับ、ค่ะ、คะ 要落对调", focus: "礼貌词也有清楚的辅音、尾音和声调",
          explain: "常见规范里，ครับ /kʰráp̚/ 多由男性说话者使用；ค่ะ /kʰâ/ 常用于女性陈述或回应；คะ /kʰá/ 常用于女性提问。实际使用也受身份与个人表达影响。",
          rule: "ค่ะ 是降调 khâ；คะ 是高调 khá。疑问助词 ไหม 在自然问句里常听作高调 mái；逐字拼读资料也可能标升调 mǎi。ครับ 的 r 可在自然口语中弱化，但入门阶段先清楚读全，尾 p 不释放。",
          examples: [
            { text: "สวัสดีครับ", ipa: "/sà.wàt.diː kʰráp̚/", roman: "sà-wàt-dii khráp", meaning: "您好（常见男性用法）" },
            { text: "สวัสดีค่ะ", ipa: "/sà.wàt.diː kʰâ/", roman: "sà-wàt-dii khâ", meaning: "您好（常见女性用法）" },
            { text: "ไปไหมคะ", ipa: "/paj máj kʰá/", roman: "pai mái khá", meaning: "去吗？（自然口语提问）" }
          ],
          model: { text: "คุณชื่ออะไรคะ", ipa: "/kʰun tɕʰɯ̂ː ʔà.raj kʰá/", roman: "khun chʉ̂ʉ à-rai khá", mnemonic: "问句末尾 คะ 必须读高调 /kʰá/，不要读成陈述用的降调 ค่ะ /kʰâ/。", translation: "您叫什么名字？", chunks: ["คุณชื่ออะไร", "คะ"] },
          quiz: { prompt: "女性礼貌提问常用哪一个？", options: ["ค่ะ · khâ", "คะ · khá", "ครับ · khráp"], answer: 1, why: "常见规范中，提问用高调 คะ /kʰá/；陈述用降调 ค่ะ /kʰâ/。" }
        },
        {
          id: "th-syllables", no: "07", title: "逐音节说清整句", focus: "先分段准确，再恢复自然节奏",
          explain: "先按意义和音节切开，确保声调、长短和尾音都存在；再把停顿逐渐缩短。慢读不是拖平每个音，也不是把句子拆成中文音节。",
          rule: "训练顺序：逐音节 → 意群慢听 → 整句清晰示范。先保证清楚，再逐步加速。",
          examples: [
            { text: "สวัสดีค่ะ", ipa: "/sà.wàt.diː.kʰâ/", roman: "sà-wàt-dii khâ", meaning: "萨-瓦(短促收 t)-迪(长)-卡(降)" },
            { text: "ขอโทษครับ", ipa: "/kʰɔ̌ː.tʰôːt̚.kʰráp̚/", roman: "khɔ̌ɔ-thôot khráp", meaning: "对不起（两个长元音、两个闭塞尾音）" },
            { text: "ไม่เป็นไรค่ะ", ipa: "/mâj.pen.raj.kʰâ/", roman: "mâi-pen-rai khâ", meaning: "没关系" }
          ],
          model: { text: "สวัสดีค่ะ ขอโทษนะคะ ไม่เป็นไรค่ะ", ipa: "/sà.wàt.diː.kʰâ | kʰɔ̌ː.tʰôːt̚.ná.kʰá | mâj.pen.raj.kʰâ/", roman: "sà-wàt-dii khâ | khɔ̌ɔ-thôot ná khá | mâi-pen-rai khâ", mnemonic: "萨-瓦-迪-卡｜考-托(降调收住)-那-卡(高)｜麦-奔-莱-卡(降)", translation: "您好。不好意思。没关系。", chunks: ["สวัสดีค่ะ", "ขอโทษนะคะ", "ไม่เป็นไรค่ะ"] },
          quiz: { prompt: "สวัสดีค่ะ 中哪个音节要明显拉长？", options: ["ส / sà", "ดี / dii", "ค่ะ / khâ"], answer: 1, why: "ดี 的 /iː/ 是长元音；วัส 的尾 t 要短促收住。" }
        }
      ]
    },
    "th-zh": {
      eyebrow: "MANDARIN SOUND LAB · 01",
      name: "ห้องเรียนการออกเสียงจีน",
      intro: "ฟังตำแหน่งลิ้นและวรรณยุกต์ให้ชัด แล้วค่อยเพิ่มความเร็ว",
      unit: "บท",
      lesson: "บทออกเสียง",
      listen: "ฟังปกติ",
      slow: "ฟังช้าแบบชัดเจน",
      chunks: "ฟังทีละช่วง",
      examples: "ฟังความต่าง",
      practice: "แบบฝึกหู",
      next: "บทถัดไป",
      previous: "บทก่อนหน้า",
      close: "ปิดบทออกเสียง",
      launcher: "ฝึกเสียง",
      correct: "ถูกแล้ว",
      wrong: "ฟังอีกครั้ง",
      review: "ใช้ IPA และพินอินเป็นหลัก คำช่วยจำเป็นเพียงตัวช่วยชั่วคราว เนื้อหาต้องผ่านการตรวจรอบสุดท้ายโดยครูเจ้าของภาษาจีนก่อนเผยแพร่เชิงพาณิชย์",
      lessons: [
        {
          id: "zh-initials-finals", no: "01", title: "พยัญชนะต้นและสระพินอิน", focus: "b/p · d/t · g/k และ a/o/e/i/u/ü",
          explain: "b d g ในพินอินเป็นเสียงไม่พ่นลม ส่วน p t k พ่นลมชัด ไม่ใช่คู่เสียงก้องแบบตัวสะกดอังกฤษ สระหนึ่งพยางค์ต้องออกครบและชัด",
          rule: "ยกมือหน้าปาก: p/t/k มีลมแรงกว่า b/d/g อย่างชัดเจน",
          examples: [
            { text: "八 — 怕", ipa: "/pa˥ — pʰa˥˩/", roman: "bā — pà", meaning: "แปด — กลัว" },
            { text: "到 — 套", ipa: "/tɑʊ̯˥˩ — tʰɑʊ̯˥˩/", roman: "dào — tào", meaning: "ถึง — ชุด/ปลอก" },
            { text: "哥 — 科", ipa: "/kɤ˥ — kʰɤ˥/", roman: "gē — kē", meaning: "พี่ชาย — วิชา" }
          ],
          model: { text: "爸爸怕太快", ipa: "/pa˥˩ pa pʰa˥˩ tʰaɪ̯˥˩ kʰuaɪ̯˥˩/", roman: "bàba pà tài kuài", translation: "พ่อกลัวว่าจะเร็วเกินไป", chunks: ["爸爸", "怕", "太快"] },
          quiz: { prompt: "ตัวใดต้องพ่นลมชัด?", options: ["b · d · g", "p · t · k", "m · n · l"], answer: 1, why: "p/t/k เป็นเสียงพ่นลมในระบบพินอิน" }
        },
        {
          id: "zh-tones", no: "02", title: "สี่เสียงและเสียงเบา", focus: "mā · má · mǎ · mà · ma",
          explain: "วรรณยุกต์จีนเปลี่ยนความหมายของพยางค์ เสียงเบาไม่มีระดับตายตัวและสั้นกว่า โดยระดับจริงขึ้นกับเสียงก่อนหน้า",
          rule: "ภาพจำ: เสียง 1 สูงราบ 55 · เสียง 2 ไต่ขึ้น 35 · เสียง 3 ต่ำแล้วขึ้น 214 (ในคำจริงมักไม่ขึ้นเต็ม) · เสียง 4 ตกแรง 51",
          examples: [
            { text: "妈", ipa: "/ma˥/", roman: "mā", meaning: "แม่ · เสียง 1" },
            { text: "麻", ipa: "/ma˧˥/", roman: "má", meaning: "ป่าน/ชา · เสียง 2" },
            { text: "马", ipa: "/ma˨˩˦/", roman: "mǎ", meaning: "ม้า · เสียง 3" },
            { text: "骂", ipa: "/ma˥˩/", roman: "mà", meaning: "ด่า · เสียง 4" },
            { text: "吗", ipa: "/ma/", roman: "ma", meaning: "ไหม · เสียงเบา" }
          ],
          model: { text: "妈妈想骑一匹马，可以吗？", ipa: "/ma˥ ma ɕjɑŋ˨˩˦ tɕʰi˧˥ i˥˩ pʰi˧˥ ma˨˩˦ | kʰɤ˧˥ i˨˩˦ ma/", roman: "māma xiǎng qí yì pǐ mǎ, kěyǐ ma?", translation: "แม่อยากขี่ม้าหนึ่งตัว ได้ไหม", chunks: ["妈妈想骑一匹马", "可以吗"] },
          quiz: { prompt: "mǎ เสียง 3 หมายถึงอะไร?", options: ["妈 แม่", "马 ม้า", "骂 ด่า"], answer: 1, why: "马 mǎ ใช้เสียง 3 ต่ำแล้วไต่ขึ้นเมื่อออกเดี่ยว ๆ" }
        },
        {
          id: "zh-jqx", no: "03", title: "j / q / x ไม่ใช่ จ / ช / ซ ตรง ๆ", focus: "ลิ้นด้านหน้าเข้าใกล้เพดานแข็ง; รูปปากขึ้นกับสระที่ตามมา",
          explain: "j กับ q มีตำแหน่งใกล้กัน แต่ q พ่นลม ส่วน x เป็นเสียงเสียดแทรกต่อเนื่อง ให้ปลายลิ้นอยู่หลังฟันล่าง ตัวพยัญชนะ j/q/x เองไม่ใช่คำสั่งให้ห่อปาก",
          rule: "เมื่อ j/q/x ตามด้วย i ให้ริมฝีปากไม่ห่อ; เมื่อเขียนตามด้วย u ตัว u แทนเสียง ü /y/ จึงห่อริมฝีปากเฉพาะตอนออกเสียงสระ แม้จุดสองจุดจะถูกละในการสะกด",
          examples: [
            { text: "鸡 — 七 — 西", ipa: "/tɕi˥ — tɕʰi˥ — ɕi˥/", roman: "jī — qī — xī", meaning: "ไก่ — เจ็ด — ตะวันตก" },
            { text: "句 — 去 — 旭", ipa: "/tɕy˥˩ — tɕʰy˥˩ — ɕy˥˩/", roman: "jù — qù — xù", meaning: "ประโยค — ไป — แสงรุ่ง" }
          ],
          model: { text: "星期几去？", ipa: "/ɕiŋ˥ tɕʰi˥ tɕi˨˩ tɕʰy˥˩/", roman: "xīngqī jǐ qù?", translation: "ไปวันอะไร", chunks: ["星期", "几", "去"] },
          quiz: { prompt: "เสียงใดพ่นลม?", options: ["j", "q", "x"], answer: 1, why: "q /tɕʰ/ มีลม ส่วน j /tɕ/ ไม่มีลม" }
        },
        {
          id: "zh-retroflex", no: "04", title: "zh / ch / sh / r กับ z / c / s", focus: "กลุ่มลิ้นงุ้มเทียบกับกลุ่มปลายลิ้นหน้า",
          explain: "zh/ch/sh/r ใช้ปลายลิ้นยกเข้าหาหลังปุ่มเหงือก ไม่ต้องงุ้มแรงเกินไป; z/c/s อยู่ด้านหน้าใกล้ฟันบน ch และ c พ่นลม",
          rule: "i ใน zhi/chi/shi/ri ไม่ใช่สระ /i/ แบบ 米 mǐ ให้เรียนทั้งพยางค์เป็นหน่วยเสียง",
          examples: [
            { text: "知 — 资", ipa: "/ʈʂɻ̩˥ — tsɹ̩˥/", roman: "zhī — zī", meaning: "รู้ — ทุน/ทรัพยากร" },
            { text: "吃 — 疵", ipa: "/ʈʂʰɻ̩˥ — tsʰɹ̩˥/", roman: "chī — cī", meaning: "กิน — ตำหนิ" },
            { text: "诗 — 丝", ipa: "/ʂɻ̩˥ — sɹ̩˥/", roman: "shī — sī", meaning: "บทกวี — ไหม" }
          ],
          model: { text: "草地上有十四只狮子", ipa: "/tsʰɑʊ̯˨˩ ti˥˩ ʂɑŋ˥˩ joʊ̯˨˩ ʂɻ̩˧˥ sɹ̩˥˩ ʈʂɻ̩˥ ʂɻ̩˥ tsɹ̩/", roman: "cǎodì shàng yǒu shísì zhī shīzi", translation: "บนสนามหญ้ามีสิงโตสิบสี่ตัว", chunks: ["草地上有", "十四只", "狮子"] },
          quiz: { prompt: "คำว่า 诗 shī ใช้ตำแหน่งใด?", options: ["ปลายลิ้นหน้าแบบ s", "ยกปลายลิ้นไปด้านหลังแบบ sh", "ริมฝีปากแบบ f"], answer: 1, why: "sh เป็นเสียงเสียดแทรกกลุ่มลิ้นงุ้ม" }
        },
        {
          id: "zh-umlaut", no: "05", title: "ü ต้องห่อปาก แต่ลิ้นยังอยู่หน้า", focus: "u /u/ ≠ ü /y/",
          explain: "ออกเสียง i ค้างไว้โดยไม่ขยับลิ้น แล้วห่อริมฝีปาก จะได้ ü หลัง j/q/x/y จุดถูกละในการเขียน แต่เสียงยังเป็น ü",
          rule: "nǚ และ lǜ ต้องเขียนจุด; yú, jù, qù, xū ไม่เขียนจุดตามกฎพินอิน",
          examples: [
            { text: "努 — 女", ipa: "/nu˨˩˦ — ny˨˩˦/", roman: "nǔ — nǚ", meaning: "พยายาม — ผู้หญิง" },
            { text: "路 — 绿", ipa: "/lu˥˩ — ly˥˩/", roman: "lù — lǜ", meaning: "ถนน — สีเขียว" },
            { text: "鱼", ipa: "/y˧˥/", roman: "yú", meaning: "ปลา · เขียนไร้จุด" }
          ],
          model: { text: "女儿去绿地", ipa: "/ny˨˩ ɑɻ˧˥ tɕʰy˥˩ ly˥˩ ti˥˩/", roman: "nǚ'ér qù lǜdì", translation: "ลูกสาวไปพื้นที่สีเขียว", chunks: ["女儿", "去", "绿地"] },
          quiz: { prompt: "qù 的 u ออกเสียงจริงเป็นอะไร?", options: ["/u/", "/y/ หรือ ü", "/o/"], answer: 1, why: "หลัง q ตัว ü ละจุดในการเขียน จึงเขียน qù" }
        },
        {
          id: "zh-sandhi", no: "06", title: "การเปลี่ยนเสียงในคำจริง", focus: "3+3 · 一 · 不",
          explain: "เมื่อเสียง 3 สองพยางค์ติดกัน พยางค์แรกอ่านคล้ายเสียง 2: 你好 ní hǎo. 一 เปลี่ยนตามเสียงถัดไป และ 不 เปลี่ยนเป็น bú หน้าเสียง 4",
          rule: "一: yí ก่อนเสียง 4; yì ก่อนเสียง 1/2/3. 不: bú ก่อนเสียง 4; กรณีอื่นคง bù โดยทั่วไป",
          examples: [
            { text: "你好", ipa: "/ni˧˥ xɑʊ̯˨˩˦/", roman: "ní hǎo (เขียน nǐ hǎo)", meaning: "สวัสดี · 3+3" },
            { text: "一个", ipa: "/i˧˥ kɤ/", roman: "yí ge", meaning: "หนึ่งอัน · 个 เดิมเป็นเสียง 4 แต่มักอ่านเบาในภาษาพูด" },
            { text: "一年", ipa: "/i˥˩ njɛn˧˥/", roman: "yì nián", meaning: "หนึ่งปี · 一 + เสียง 2" },
            { text: "不是", ipa: "/pu˧˥ ʂɻ̩˥˩/", roman: "bú shì", meaning: "ไม่ใช่ · 不 + เสียง 4" }
          ],
          model: { text: "你好，我不是一个人。", ipa: "/ni˧˥ xɑʊ̯˨˩˦ | wɔ˨˩ pu˧˥ ʂɻ̩˥˩ i˧˥ kɤ ʐən˧˥/", roman: "ní hǎo, wǒ bú shì yí ge rén.", translation: "สวัสดี ฉันไม่ได้อยู่คนเดียว", chunks: ["你好", "我不是", "一个人"] },
          quiz: { prompt: "不 ใน 不是 อ่านอย่างไร?", options: ["bù shì", "bú shì", "bū shì"], answer: 1, why: "不 เปลี่ยนเป็นเสียง 2 เมื่ออยู่หน้าเสียง 4" }
        },
        {
          id: "zh-phrasing", no: "07", title: "พูดเป็นช่วง ไม่กลืนพยางค์", focus: "ชัดทีละพยางค์ → รวมเป็นกลุ่มความหมาย",
          explain: "ภาษาจีนกลางรักษาโครงพยางค์ค่อนข้างชัด ฝึกช้าทีละช่วงก่อน แล้วลดช่วงหยุดลง อย่าเติมสระท้ายพยัญชนะต้นและอย่าทำทุกเสียง 3 ให้โค้งเต็มในประโยค",
          rule: "ลำดับฝึก: ทีละพยางค์ → ฟังช้าทีละช่วง → ฟังเต็มประโยคชัด ๆ แล้วค่อยเพิ่มความเร็ว",
          examples: [
            { text: "我想学中文", ipa: "/wɔ˧˥ ɕjɑŋ˨˩ ɕɥe˧˥ ʈʂʊŋ˥ wən˧˥/", roman: "wó xiǎng xué Zhōngwén (เขียน wǒ xiǎng)", meaning: "ฉันอยากเรียนภาษาจีน · 3+3" },
            { text: "请说慢一点", ipa: "/tɕʰiŋ˨˩ ʂwɔ˥ man˥˩ i˥˩ tjɛn˨˩˦/", roman: "qǐng shuō màn yìdiǎn", meaning: "กรุณาพูดช้าลงหน่อย" },
            { text: "我听不清楚", ipa: "/wɔ˨˩ tʰiŋ˥ pu tɕʰiŋ˥ ʈʂʰu/", roman: "wǒ tīng bu qīngchu", meaning: "ฉันฟังไม่ชัด" }
          ],
          model: { text: "我想学中文，请说慢一点。", ipa: "/wɔ˧˥ ɕjɑŋ˨˩ ɕɥe˧˥ ʈʂʊŋ˥ wən˧˥ | tɕʰiŋ˨˩ ʂwɔ˥ man˥˩ i˥˩ tjɛn˨˩˦/", roman: "wó xiǎng xué Zhōngwén (เขียน wǒ xiǎng), qǐng shuō màn yìdiǎn.", translation: "ฉันอยากเรียนภาษาจีน กรุณาพูดช้าลงหน่อย", chunks: ["我想学中文", "请说", "慢一点"] },
          quiz: { prompt: "วิธีฝึกที่ชัดที่สุดคือ?", options: ["เร่งความเร็วทันที", "แยกช่วงให้ถูกแล้วค่อยรวม", "ลากทุกพยางค์ให้ยาวเท่ากัน"], answer: 1, why: "เริ่มจากความแม่นยำของแต่ละช่วง แล้วจึงกลับสู่จังหวะธรรมชาติ" }
        }
      ]
    }
  };

  const state = {
    direction: "zh-th",
    index: 0,
    speak: null,
    directionGetter: null,
    host: null,
    root: null,
    launcher: null,
    inline: false,
    isOpen: false,
    lastFocus: null,
    listenersBound: false,
    audio: null,
    audioButton: null,
    audioRun: 0
  };

  const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char]));

  function currentCourse() { return COURSES[state.direction] || COURSES["zh-th"]; }
  function targetLang() { return state.direction === "zh-th" ? "th-TH" : "zh-CN"; }
  function uiLang() { return state.direction === "zh-th" ? "zh-CN" : "th-TH"; }
  function languageForText(text) {
    const value = String(text || "");
    const hasThai = /[\u0E00-\u0E7F]/.test(value);
    const hasHan = /[\u3400-\u9FFF]/.test(value);
    if (hasThai && !hasHan) return "th-TH";
    if (hasHan && !hasThai) return "zh-CN";
    return targetLang();
  }

  function stopAudio() {
    state.audioRun += 1;
    if (state.audio) {
      state.audio.pause();
      state.audio.currentTime = 0;
    }
    state.audio = null;
    state.audioButton?.classList.remove("is-playing");
    state.audioButton?.removeAttribute("aria-pressed");
    state.audioButton = null;
  }

  function playBundledAudio(key, button, playbackRate, fallbackText, fallbackLang, fallbackRate) {
    const source = globalThis.PRONUNCIATION_AUDIO?.[key];
    if (!source || typeof Audio !== "function") return false;
    window.HUILAISHI_SPEECH?.stop?.();
    window.stopAlaiVoice?.();
    window.ArcadeUI?.stopVoice?.();
    stopAudio();
    const runId = ++state.audioRun;
    const audio = new Audio(source);
    state.audio = audio;
    state.audioButton = button || null;
    audio.preload = "auto";
    audio.volume = .96;
    audio.playbackRate = Math.max(.84, Math.min(1, Number(playbackRate) || 1));
    if ("preservesPitch" in audio) audio.preservesPitch = true;
    if ("webkitPreservesPitch" in audio) audio.webkitPreservesPitch = true;
    audio.setAttribute("playsinline", "");
    button?.classList.add("is-playing");
    button?.setAttribute("aria-pressed", "true");
    const clear = () => {
      if (runId !== state.audioRun) return;
      state.audio = null;
      state.audioButton?.classList.remove("is-playing");
      state.audioButton?.removeAttribute("aria-pressed");
      state.audioButton = null;
    };
    audio.addEventListener("ended", clear, { once: true });
    audio.addEventListener("error", clear, { once: true });
    const playback = audio.play();
    playback?.catch?.(() => {
      if (runId !== state.audioRun) return;
      clear();
      speak(fallbackText, fallbackLang, fallbackRate);
    });
    return true;
  }

  function fallbackSpeak(text, lang, rate) {
    if (!text || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = Math.max(.5, Math.min(1, Number(rate) || .82));
    const voices = speechSynthesis.getVoices();
    const exact = voices.find(voice => voice.lang.toLowerCase() === lang.toLowerCase());
    const family = voices.find(voice => voice.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()));
    utterance.voice = exact || family || null;
    window.speechSynthesis.speak(utterance);
  }

  function speak(text, lang = targetLang(), rate = .82) {
    if (!text) return;
    try {
      const result = state.speak ? state.speak(text, lang, rate) : fallbackSpeak(text, lang, rate);
      if (result?.catch) result.catch(() => fallbackSpeak(text, lang, rate));
    } catch (_) { fallbackSpeak(text, lang, rate); }
  }

  function resolveDirection(next) {
    const candidate = typeof next === "string" ? next
      : (typeof state.directionGetter === "function" ? state.directionGetter() : globalThis.HUILAISHI_STORAGE?.getItem("learningDirection"));
    return COURSES[candidate] ? candidate : "zh-th";
  }

  function lessonMarkup(lesson, course) {
    const exampleRows = lesson.examples.map((item, index) => `
      <button class="pc-example" type="button" data-pc-action="speak" data-audio-key="${state.direction}__${lesson.id}__example-${index}" data-audio-rate="1" data-text="${escapeHtml(item.text)}" data-rate=".84" aria-label="${escapeHtml(course.listen)} ${escapeHtml(item.text)}">
        <span class="pc-example-index">${String(index + 1).padStart(2, "0")}</span>
        <span class="pc-example-word" lang="${state.direction === "zh-th" ? "th" : "zh-Hans"}">${escapeHtml(item.text)}</span>
        <span class="pc-example-sound"><b>${escapeHtml(item.ipa)}</b><small>${escapeHtml(item.roman)}</small></span>
        <span class="pc-example-meaning">${escapeHtml(item.meaning)}</span>
        <span class="pc-mini-play" aria-hidden="true">▶</span>
      </button>`).join("");
    const chunks = lesson.model.chunks.map((chunk, index) => `
      <button type="button" class="pc-chunk" data-pc-action="speak" data-audio-key="${state.direction}__${lesson.id}__chunk-${index}" data-audio-rate="1" data-text="${escapeHtml(chunk)}" data-rate=".70">
        <small>${String(index + 1).padStart(2, "0")}</small><span>${escapeHtml(chunk)}</span><i aria-hidden="true">▶</i>
      </button>`).join("");
    const mnemonic = state.direction === "zh-th" && lesson.model.mnemonic
      ? `<div class="pc-mnemonic"><span>中文近音 · 仅助记</span><b>${escapeHtml(lesson.model.mnemonic)}</b></div>` : "";
    const answers = lesson.quiz.options.map((option, index) => `<button type="button" class="pc-answer" data-pc-action="answer" data-answer="${index}" aria-pressed="false"><span>${String.fromCharCode(65 + index)}</span>${escapeHtml(option)}</button>`).join("");

    return `
      <article class="pc-lesson" aria-labelledby="pc-lesson-title">
        <div class="pc-lesson-heading">
          <p>${escapeHtml(course.lesson)} ${lesson.no} / ${String(course.lessons.length).padStart(2, "0")}</p>
          <h2 id="pc-lesson-title">${escapeHtml(lesson.title)}</h2>
          <strong>${escapeHtml(lesson.focus)}</strong>
        </div>
        <div class="pc-rule-grid">
          <p>${escapeHtml(lesson.explain)}</p>
          <aside><span>KEY</span>${escapeHtml(lesson.rule)}</aside>
        </div>
        <section class="pc-section" aria-labelledby="pc-examples-title">
          <div class="pc-section-title"><span id="pc-examples-title">${escapeHtml(course.examples)}</span><small>IPA · ${state.direction === "zh-th" ? "ROMAN" : "PINYIN"}</small></div>
          <div class="pc-examples">${exampleRows}</div>
        </section>
        <section class="pc-model">
          <div class="pc-model-top"><span>MODEL LINE</span><small>${escapeHtml(lesson.model.translation)}</small></div>
          <p class="pc-model-text" lang="${state.direction === "zh-th" ? "th" : "zh-Hans"}">${escapeHtml(lesson.model.text)}</p>
          <div class="pc-model-reading"><b>${escapeHtml(lesson.model.ipa)}</b><span>${escapeHtml(lesson.model.roman)}</span></div>
          ${mnemonic}
          <div class="pc-listen-row">
            <button type="button" data-pc-action="speak" data-audio-key="${state.direction}__${lesson.id}__model" data-audio-rate="1" data-text="${escapeHtml(lesson.model.text)}" data-rate=".84"><i aria-hidden="true">▶</i>${escapeHtml(course.listen)}</button>
            <button type="button" data-pc-action="speak" data-audio-key="${state.direction}__${lesson.id}__model" data-audio-rate=".88" data-text="${escapeHtml(lesson.model.text)}" data-rate=".70"><i aria-hidden="true">◌</i>${escapeHtml(course.slow)}</button>
          </div>
          <div class="pc-chunk-block"><p>${escapeHtml(course.chunks)}</p><div>${chunks}</div></div>
        </section>
        <section class="pc-quiz" aria-labelledby="pc-quiz-title">
          <div class="pc-section-title"><span id="pc-quiz-title">${escapeHtml(course.practice)}</span><small>01 QUESTION</small></div>
          <h3>${escapeHtml(lesson.quiz.prompt)}</h3>
          <div class="pc-answers">${answers}</div>
          <p class="pc-feedback" role="status" aria-live="polite"></p>
        </section>
      </article>`;
  }

  function shellMarkup() {
    const course = currentCourse();
    const lesson = course.lessons[state.index];
    const rail = course.lessons.map((item, index) => `
      <button type="button" data-pc-action="lesson" data-index="${index}" class="${index === state.index ? "active" : ""}" aria-current="${index === state.index ? "step" : "false"}">
        <span>${item.no}</span><b>${escapeHtml(item.title)}</b>
      </button>`).join("");
    return `
      <div class="pc-frame" role="${state.inline ? "region" : "dialog"}" ${state.inline ? "" : "aria-modal=\"true\""} aria-labelledby="pc-course-title">
        <header class="pc-header">
          <div class="pc-brand"><span aria-hidden="true">อ / 声</span><div><p>${escapeHtml(course.eyebrow)}</p><h1 id="pc-course-title">${escapeHtml(course.name)}</h1></div></div>
          <p class="pc-intro">${escapeHtml(course.intro)}</p>
          ${state.inline ? "" : `<button type="button" class="pc-close" data-pc-action="close" aria-label="${escapeHtml(course.close)}">×</button>`}
        </header>
        <div class="pc-body">
          <nav class="pc-rail" aria-label="${escapeHtml(course.name)}">${rail}</nav>
          <main class="pc-content">${lessonMarkup(lesson, course)}
            <div class="pc-course-nav">
              <button type="button" data-pc-action="previous" ${state.index === 0 ? "disabled" : ""}>← ${escapeHtml(course.previous)}</button>
              <span>${state.index + 1} / ${course.lessons.length}</span>
              <button type="button" data-pc-action="next" ${state.index === course.lessons.length - 1 ? "disabled" : ""}>${escapeHtml(course.next)} →</button>
            </div>
            <p class="pc-review-note"><b>${state.direction === "zh-th" ? "准确性说明" : "หมายเหตุความถูกต้อง"}</b>${escapeHtml(course.review)}</p>
          </main>
        </div>
      </div>`;
  }

  function render({ focusHeading = false } = {}) {
    if (!state.root) return;
    stopAudio();
    state.root.lang = state.direction === "zh-th" ? "zh-CN" : "th";
    state.root.innerHTML = shellMarkup();
    if (focusHeading) {
      const heading = state.root.querySelector("#pc-lesson-title");
      heading?.setAttribute("tabindex", "-1");
      heading?.focus({ preventScroll: true });
    }
  }

  function announceNavigation() {
    const lesson = currentCourse().lessons[state.index];
    speak(lesson.title, uiLang(), .86);
  }

  function handleClick(event) {
    const button = event.target.closest("[data-pc-action]");
    if (!button || !state.root?.contains(button)) return;
    const action = button.dataset.pcAction;
    if (action === "speak") {
      const text = button.dataset.text;
      const rate = Number(button.dataset.rate) || .82;
      if (!playBundledAudio(button.dataset.audioKey, button, button.dataset.audioRate, text, targetLang(), rate)) {
        speak(text, targetLang(), rate);
      }
      return;
    }
    if (action === "lesson") {
      state.index = Math.max(0, Math.min(currentCourse().lessons.length - 1, Number(button.dataset.index)));
      render({ focusHeading: true }); announceNavigation(); return;
    }
    if (action === "previous" || action === "next") {
      state.index += action === "next" ? 1 : -1;
      state.index = Math.max(0, Math.min(currentCourse().lessons.length - 1, state.index));
      render({ focusHeading: true }); announceNavigation(); return;
    }
    if (action === "answer") {
      const lesson = currentCourse().lessons[state.index];
      const selected = Number(button.dataset.answer);
      const feedback = state.root.querySelector(".pc-feedback");
      state.root.querySelectorAll(".pc-answer").forEach((item, index) => {
        item.disabled = true;
        item.setAttribute("aria-pressed", String(index === selected));
        item.classList.toggle("correct", index === lesson.quiz.answer);
        item.classList.toggle("wrong", index === selected && selected !== lesson.quiz.answer);
      });
      const ok = selected === lesson.quiz.answer;
      feedback.textContent = `${ok ? currentCourse().correct : currentCourse().wrong} · ${lesson.quiz.why}`;
      feedback.classList.toggle("ok", ok);
      const spokenOption = lesson.quiz.options[selected]?.split("·")[0]?.trim();
      const spokenText = spokenOption || (ok ? currentCourse().correct : currentCourse().wrong);
      speak(spokenText, languageForText(spokenText), .76);
      return;
    }
    if (action === "close") { speak(currentCourse().close, uiLang(), .88); close(); }
  }

  function handleKeydown(event) {
    if (!state.isOpen || state.inline) return;
    if (event.key === "Escape") close();
  }

  function open() {
    if (!state.root) return;
    state.lastFocus = document.activeElement;
    state.isOpen = true;
    state.root.hidden = false;
    state.root.classList.add("is-open");
    document.documentElement.classList.add("pc-modal-open");
    window.requestAnimationFrame(() => state.root.querySelector(".pc-close")?.focus());
    speak(currentCourse().name, uiLang(), .86);
  }

  function close() {
    if (!state.root || state.inline) return;
    state.isOpen = false;
    state.root.classList.remove("is-open");
    document.documentElement.classList.remove("pc-modal-open");
    window.setTimeout(() => { if (!state.isOpen) state.root.hidden = true; }, 220);
    state.lastFocus?.focus?.();
  }

  function init(options = {}) {
    destroy();
    state.speak = typeof options.speak === "function" ? options.speak : null;
    state.directionGetter = typeof options.direction === "function" ? options.direction : null;
    state.direction = resolveDirection(options.direction);
    state.index = 0;
    state.host = typeof options.mount === "string" ? document.querySelector(options.mount) : options.mount;
    state.inline = Boolean(state.host);
    if (!state.host) state.host = document.body;

    state.root = document.createElement("section");
    state.root.className = `pc-root ${state.inline ? "pc-inline" : "pc-overlay"}`;
    state.root.dataset.direction = state.direction;
    state.root.hidden = !state.inline;
    state.host.appendChild(state.root);
    state.root.addEventListener("click", handleClick);
    render();

    if (!state.inline && options.launcher !== false) {
      state.launcher = document.createElement("button");
      state.launcher.type = "button";
      state.launcher.className = "pc-launcher";
      state.launcher.innerHTML = `<span aria-hidden="true">อ</span><b>${escapeHtml(currentCourse().launcher)}</b>`;
      state.launcher.addEventListener("click", open);
      document.body.appendChild(state.launcher);
    }
    document.addEventListener("keydown", handleKeydown);
    state.listenersBound = true;
    if (state.inline) state.isOpen = true;
    return api;
  }

  function onDirectionChange(nextDirection) {
    const next = resolveDirection(nextDirection);
    if (next === state.direction && state.root) return;
    state.direction = next;
    state.index = 0;
    stopAudio();
    if (state.root) {
      state.root.dataset.direction = next;
      render();
    }
    if (state.launcher) state.launcher.innerHTML = `<span aria-hidden="true">${next === "zh-th" ? "อ" : "声"}</span><b>${escapeHtml(currentCourse().launcher)}</b>`;
  }

  function destroy() {
    stopAudio();
    state.root?.removeEventListener("click", handleClick);
    state.root?.remove();
    state.launcher?.remove();
    if (state.listenersBound) document.removeEventListener("keydown", handleKeydown);
    document.documentElement.classList.remove("pc-modal-open");
    state.root = null; state.launcher = null; state.host = null; state.isOpen = false; state.listenersBound = false;
  }

  const api = { init, open, close, destroy, onDirectionChange, stopAudio, data: COURSES };
  window.PronunciationCourse = api;
})();
