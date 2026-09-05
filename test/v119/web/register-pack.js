/* 萨瓦迪卡 V110 · S5—S1 双向场景表达训练包
 * “场景语气”描述一句话在具体关系与场合中的社会效果，不评价说话者本人。
 * 五档边界被写进 LEVELS 元数据，界面、游戏和校验脚本应共用这一份定义。
 * S2 训练不含侮辱的直接表达；S1 训练稳住局面、明确边界、退出冲突和寻求帮助。
 * 全部五档均不得出现攻击、仇恨或针对真人的羞辱性内容。
 */
(function () {
  "use strict";

  const LEVELS = {
    S5: {
      rank: 5, labelZh: "正式得体", labelTh: "สุภาพเป็นทางการ", risk: "safe", outputAllowed: true,
      purposeZh: "学会在正式关系里把需求、理由和选择空间说完整。",
      purposeTh: "ฝึกสื่อสารความต้องการ เหตุผล และทางเลือกให้ครบในความสัมพันธ์แบบเป็นทางการ",
      boundaryZh: "有尊称、缓冲或给对方选择空间；适合陌生人、长辈、职场和正式服务场景。",
      boundaryTh: "มีคำให้เกียรติ คำเกริ่น หรือเปิดทางให้อีกฝ่ายเลือก เหมาะกับคนแปลกหน้า ผู้ใหญ่ ที่ทำงาน และงานบริการทางการ",
      audienceZh: "陌生人 / 长辈 / 职场 / 正式服务",
      audienceTh: "คนแปลกหน้า / ผู้ใหญ่ / ที่ทำงาน / งานบริการทางการ",
      useWhenZh: ["正式协商", "向长辈或客户提出请求", "处理投诉与分歧"],
      useWhenTh: ["การเจรจาอย่างเป็นทางการ", "ขอความร่วมมือจากผู้ใหญ่หรือลูกค้า", "จัดการข้อร้องเรียนหรือความเห็นต่าง"],
      tabooZh: ["不要堆砌敬语到不自然", "紧急时优先把关键信息说清"],
      tabooTh: ["ไม่ควรใส่คำสุภาพซ้ำจนไม่เป็นธรรมชาติ", "เหตุฉุกเฉินต้องบอกข้อมูลสำคัญก่อน"],
      firstTaskZh: "完成一次正式协商：说明预算，再礼貌询问是否可调整。",
      firstTaskTh: "ฝึกเจรจาอย่างเป็นทางการ: แจ้งงบประมาณแล้วถามอย่างสุภาพว่าสามารถปรับได้หรือไม่",
      followMode: "practice"
    },
    S4: {
      rank: 4, labelZh: "自然日常", labelTh: "สุภาพในชีวิตประจำวัน", risk: "safe", outputAllowed: true,
      purposeZh: "掌握旅行和生活里最自然、最不费力的礼貌表达。",
      purposeTh: "ใช้ภาษาสุภาพที่เป็นธรรมชาติและไม่เป็นทางการเกินไปในชีวิตประจำวันและการเดินทาง",
      boundaryZh: "表达直接但保留请、谢谢或泰语礼貌句尾；是大多数日常场合的默认选择。",
      boundaryTh: "พูดตรงประเด็นแต่ยังมีคำขอ คำขอบคุณ หรือคำลงท้ายสุภาพ เป็นตัวเลือกหลักในชีวิตประจำวัน",
      audienceZh: "普通服务 / 同事 / 不太熟的人",
      audienceTh: "งานบริการทั่วไป / เพื่อนร่วมงาน / คนที่ยังไม่สนิท",
      useWhenZh: ["便利店与餐厅", "打车与酒店", "普通同事沟通"],
      useWhenTh: ["ร้านสะดวกซื้อและร้านอาหาร", "แท็กซี่และโรงแรม", "คุยกับเพื่อนร่วมงานทั่วไป"],
      tabooZh: ["不要省掉关键礼貌句尾", "不要把自然礼貌说成公文腔"],
      tabooTh: ["อย่าตัดคำลงท้ายสุภาพในจุดสำคัญ", "ไม่ต้องใช้ภาษาราชการในบทสนทนาทั่วไป"],
      firstTaskZh: "在便利店完成点单、补充要求和礼貌结束。",
      firstTaskTh: "สั่งของ ระบุรายละเอียด และจบบทสนทนาอย่างสุภาพในร้านสะดวกซื้อ",
      followMode: "practice"
    },
    S3: {
      rank: 3, labelZh: "熟人随口", labelTh: "กันเองกับคนสนิท", risk: "situational", outputAllowed: true,
      purposeZh: "听懂并使用熟人之间自然、省略客套但不伤人的说法。",
      purposeTh: "เข้าใจและใช้ภาษากันเองกับคนสนิท โดยลดพิธีการแต่ไม่ทำร้ายความรู้สึก",
      boundaryZh: "省略正式客套，但不命令、不挖苦、不贬低人；只适合熟人或平辈。",
      boundaryTh: "ลดคำทางการลง แต่ไม่สั่ง ไม่ประชด และไม่ดูถูก เหมาะกับเพื่อนหรือคนระดับเดียวกัน",
      audienceZh: "朋友 / 熟人 / 平辈",
      audienceTh: "เพื่อน / คนสนิท / คนระดับเดียวกัน",
      useWhenZh: ["朋友闲聊", "熟店员或熟同事", "平辈之间的轻松邀请"],
      useWhenTh: ["คุยเล่นกับเพื่อน", "คุยกับพนักงานหรือเพื่อนร่วมงานที่สนิท", "ชวนเพื่อนวัยเดียวกันแบบสบาย ๆ"],
      tabooZh: ["不要拿熟人口吻对陌生人", "随口不等于命令或挖苦"],
      tabooTh: ["อย่าใช้ภาษาสนิทกับคนแปลกหน้า", "ความกันเองไม่ใช่การสั่งหรือประชด"],
      firstTaskZh: "和新认识的同龄人自然介绍自己并接一个轻松问题。",
      firstTaskTh: "แนะนำตัวกับคนวัยเดียวกันและชวนคุยต่อด้วยคำถามสบาย ๆ",
      followMode: "practice-with-context"
    },
    S2: {
      rank: 2, labelZh: "直接表达", labelTh: "พูดตรง", risk: "situational", outputAllowed: true,
      purposeZh: "在时间紧或需要设界限时，把需求直接说清，同时尊重对方。",
      purposeTh: "พูดความต้องการให้ชัดเมื่อเวลาจำกัดหรือต้องตั้งขอบเขต โดยยังให้เกียรติอีกฝ่าย",
      boundaryZh: "句子简短、重点靠前，可以坚定，但不挖苦、不贬低、不攻击任何人。",
      boundaryTh: "ประโยคสั้นและบอกประเด็นก่อน พูดหนักแน่นได้ แต่ไม่ประชด ไม่ดูถูก และไม่โจมตีใคร",
      audienceZh: "紧急沟通 / 明确要求 / 设定边界",
      audienceTh: "การสื่อสารเร่งด่วน / บอกความต้องการให้ชัด / ตั้งขอบเขต",
      useWhenZh: ["时间紧需要直说", "明确拒绝或停止", "提醒规则与安全"],
      useWhenTh: ["เวลาจำกัดและต้องพูดตรง", "ปฏิเสธหรือขอให้หยุดอย่างชัดเจน", "เตือนกติกาและความปลอดภัย"],
      tabooZh: ["不攻击对方的人格或能力", "不使用羞辱性比喻", "能说明原因时尽量说清"],
      tabooTh: ["ไม่โจมตีตัวบุคคลหรือความสามารถ", "ไม่ใช้คำเปรียบเทียบที่ทำให้อับอาย", "หากบอกเหตุผลได้ควรพูดให้ชัด"],
      firstTaskZh: "练习三句简短直接的边界表达，并确认对方能听懂下一步。",
      firstTaskTh: "ฝึกประโยคตั้งขอบเขตที่สั้นและตรงสามประโยค พร้อมยืนยันว่าอีกฝ่ายเข้าใจขั้นตอนถัดไป",
      followMode: "practice-with-context"
    },
    S1: {
      rank: 1, labelZh: "冲突降级", labelTh: "คลี่คลายความขัดแย้ง", risk: "safe", outputAllowed: true,
      purposeZh: "在气氛紧张时稳住局面，明确边界，必要时结束对话或寻求帮助。",
      purposeTh: "ช่วยให้สถานการณ์ตึงเครียดสงบลง ตั้งขอบเขตให้ชัด และยุติการสนทนาหรือขอความช่วยเหลือเมื่อจำเป็น",
      boundaryZh: "只练安全回应：描述事实、说明感受、提出下一步；不复述或模仿任何攻击性说法。",
      boundaryTh: "ฝึกเฉพาะคำตอบที่ปลอดภัย: บอกข้อเท็จจริง ความรู้สึก และขั้นตอนถัดไป โดยไม่ทวนหรือเลียนแบบคำพูดโจมตี",
      audienceZh: "冲突降级 / 安全退出 / 明确边界 / 寻求帮助",
      audienceTh: "ลดความขัดแย้ง / ถอนตัวอย่างปลอดภัย / ตั้งขอบเขต / ขอความช่วยเหลือ",
      useWhenZh: ["对话开始失控", "需要坚定停止某个行为", "需要退出或请第三方协助"],
      useWhenTh: ["การสนทนาเริ่มควบคุมไม่ได้", "ต้องขอให้หยุดพฤติกรรมอย่างหนักแน่น", "ต้องถอนตัวหรือขอคนอื่นช่วย"],
      tabooZh: ["不重复攻击性原句", "不刺激或羞辱对方", "有人身危险时优先离开并求助"],
      tabooTh: ["ไม่ทวนคำพูดโจมตี", "ไม่ยั่วยุหรือทำให้อีกฝ่ายอับอาย", "หากเสี่ยงอันตรายให้ถอนตัวและขอความช่วยเหลือก่อน"],
      firstTaskZh: "练习一句暂停冲突、一句明确边界和一句安全退出。",
      firstTaskTh: "ฝึกหนึ่งประโยคเพื่อหยุดความขัดแย้ง หนึ่งประโยคตั้งขอบเขต และหนึ่งประโยคถอนตัวอย่างปลอดภัย",
      followMode: "practice"
    }
  };

  const NOTES = Object.fromEntries(Object.entries(LEVELS).map(([grade, level]) => [grade, [
    level.boundaryZh,
    level.boundaryTh
  ]]));

  // Variant row: [grade, Chinese, pinyin, Thai, Thai romanization, optional Chinese note, optional Thai note]
  const RAW = [
    ["repeat","social","请对方再说一遍","ขอให้อีกฝ่ายพูดซ้ำ","没听清对方的话","ฟังอีกฝ่ายไม่ชัด",[
      ["S5","劳驾，您可以再说一遍吗？","láojià, nín kěyǐ zài shuō yí biàn ma?","รบกวนช่วยพูดอีกครั้งได้ไหมคะ","ropkuan chuai phut ik khrang dai mai kha"],
      ["S4","麻烦再说一遍，可以吗？","máfan zài shuō yí biàn, kěyǐ ma?","ช่วยพูดอีกครั้งได้ไหมคะ","chuai phut ik khrang dai mai kha"],
      ["S3","再说一遍呗。","zài shuō yí biàn bei.","พูดอีกทีได้ไหม","phut ik thi dai mai"],
      ["S2","请再说一遍，把重点说清楚。","qǐng zài shuō yí biàn, bǎ zhòngdiǎn shuō qīngchu.","ช่วยพูดอีกครั้งและบอกประเด็นให้ชัดหน่อย","chuai phut ik khrang lae bok praden hai chat noi"],
      ["S1","我没听清，请再说一遍，我们慢慢沟通。","wǒ méi tīng qīng, qǐng zài shuō yí biàn, wǒmen mànmàn gōutōng.","ฉันฟังไม่ชัด ช่วยพูดอีกครั้งนะคะ เราค่อย ๆ คุยกัน","chan fang mai chat, chuai phut ik khrang na kha, rao khoi khoi khui kan"]
    ]],
    ["make-way","travel","请人让路","ขอทาง","通道被挡住","มีคนขวางทาง",[
      ["S5","不好意思，能请您让一下吗？","bù hǎoyìsi, néng qǐng nín ràng yíxià ma?","ขอโทษค่ะ รบกวนขอทางหน่อยนะคะ","kho thot kha, ropkuan kho thang noi na kha"],
      ["S4","麻烦让一下，谢谢。","máfan ràng yíxià, xièxie.","ขอทางหน่อยค่ะ ขอบคุณค่ะ","kho thang noi kha, khopkhun kha"],
      ["S3","借过一下。","jièguò yíxià.","ขอทางหน่อย","kho thang noi"],
      ["S2","请让一下，我要过去。","qǐng ràng yíxià, wǒ yào guòqù.","ขอทางหน่อย ต้องผ่านไป","kho thang noi, tong phan pai"],
      ["S1","这里需要通行，请往旁边让一下。","zhèlǐ xūyào tōngxíng, qǐng wǎng pángbiān ràng yíxià.","ตรงนี้ต้องใช้ทาง กรุณาหลบไปด้านข้างหน่อยค่ะ","trong ni tong chai thang, karuna lop pai dan khang noi kha"]
    ]],
    ["hurry","daily","请对方快一点","ขอให้อีกฝ่ายเร็วขึ้น","时间很紧","เวลากระชั้น",[
      ["S5","时间有些紧，方便稍微快一点吗？","shíjiān yǒuxiē jǐn, fāngbiàn shāowēi kuài yìdiǎn ma?","เวลาค่อนข้างกระชั้น รบกวนช่วยรีบอีกนิดได้ไหมคะ","wela khonkhang krachan, ropkuan chuai rip ik nit dai mai kha"],
      ["S4","麻烦快一点，谢谢。","máfan kuài yìdiǎn, xièxie.","ช่วยรีบหน่อยได้ไหมคะ ขอบคุณค่ะ","chuai rip noi dai mai kha, khopkhun kha"],
      ["S3","快点儿吧。","kuài diǎnr ba.","เร็วหน่อยนะ","reo noi na"],
      ["S2","时间很紧，请快一点。","shíjiān hěn jǐn, qǐng kuài yìdiǎn.","เวลาเหลือน้อย ช่วยเร็วขึ้นหน่อย","wela luea noi, chuai reo khuen noi"],
      ["S1","时间很紧，请现在开始处理。","shíjiān hěn jǐn, qǐng xiànzài kāishǐ chǔlǐ.","เวลาจำกัด กรุณาเริ่มดำเนินการตอนนี้ค่ะ","wela chamkat, karuna roem damnoenkan ton ni kha"]
    ]],
    ["quiet","social","请对方小声","ขอให้อีกฝ่ายเบาเสียง","公共空间太吵","สถานที่สาธารณะเสียงดัง",[
      ["S5","不好意思，可以稍微小声一点吗？","bù hǎoyìsi, kěyǐ shāowēi xiǎoshēng yìdiǎn ma?","ขอโทษค่ะ รบกวนเบาเสียงลงหน่อยได้ไหมคะ","kho thot kha, ropkuan bao siang long noi dai mai kha"],
      ["S4","麻烦小声一点。","máfan xiǎoshēng yìdiǎn.","ช่วยเบาเสียงหน่อยค่ะ","chuai bao siang noi kha"],
      ["S3","小声点儿。","xiǎoshēng diǎnr.","เบาเสียงหน่อย","bao siang noi"],
      ["S2","声音太大了，请小声一点。","shēngyīn tài dà le, qǐng xiǎoshēng yìdiǎn.","เสียงดังเกินไป ช่วยเบาลงหน่อย","siang dang koen pai, chuai bao long noi"],
      ["S1","这里是公共空间，请降低音量。","zhèlǐ shì gōnggòng kōngjiān, qǐng jiàngdī yīnliàng.","ที่นี่เป็นพื้นที่สาธารณะ กรุณาลดเสียงลงค่ะ","thi ni pen phuenthi satharana, karuna lot siang long kha"]
    ]],
    ["boundaries","social","拒绝别人干涉","ปฏิเสธการก้าวก่าย","别人过度打听私事","อีกฝ่ายก้าวก่ายเรื่องส่วนตัว",[
      ["S5","谢谢关心，这件事我想自己处理。","xièxie guānxīn, zhè jiàn shì wǒ xiǎng zìjǐ chǔlǐ.","ขอบคุณที่เป็นห่วงนะคะ เรื่องนี้ดิฉันขอจัดการเองค่ะ","khopkhun thi pen huang na kha, rueang ni dichan kho chatkan eng kha"],
      ["S4","这件事我自己处理就好。","zhè jiàn shì wǒ zìjǐ chǔlǐ jiù hǎo.","เรื่องนี้ฉันจัดการเองได้ค่ะ","rueang ni chan chatkan eng dai kha"],
      ["S3","这事我自己来吧。","zhè shì wǒ zìjǐ lái ba.","เรื่องนี้ฉันจัดการเองนะ","rueang ni chan chatkan eng na"],
      ["S2","这件事我自己处理，请先不要介入。","zhè jiàn shì wǒ zìjǐ chǔlǐ, qǐng xiān bú yào jièrù.","เรื่องนี้ฉันจะจัดการเอง ขออย่าเพิ่งเข้ามาเกี่ยว","rueang ni chan cha chatkan eng, kho ya phoeng khao ma kiao"],
      ["S1","这是我的私事，请不要继续干涉。","zhè shì wǒ de sīshì, qǐng bú yào jìxù gānshè.","นี่เป็นเรื่องส่วนตัวของฉัน กรุณาอย่าก้าวก่ายต่อค่ะ","ni pen rueang suantua khong chan, karuna ya kaokai to kha"]
    ]],
    ["leave-alone","social","请对方离开","ขอให้อีกฝ่ายออกไป","想暂时独处","อยากอยู่คนเดียวชั่วคราว",[
      ["S5","抱歉，我现在想一个人待一会儿。","bàoqiàn, wǒ xiànzài xiǎng yí ge rén dāi yíhuìr.","ขอโทษค่ะ ตอนนี้ดิฉันขออยู่คนเดียวสักพักนะคะ","kho thot kha, ton ni dichan kho yu khon diao sak phak na kha"],
      ["S4","能让我安静一会儿吗？","néng ràng wǒ ānjìng yíhuìr ma?","ขออยู่เงียบ ๆ คนเดียวสักครู่ได้ไหมคะ","kho yu ngiap ngiap khon diao sak khru dai mai kha"],
      ["S3","让我自己待会儿吧。","ràng wǒ zìjǐ dāi huìr ba.","ขออยู่คนเดียวแป๊บนะ","kho yu khon diao paep na"],
      ["S2","我现在需要独处，请给我一点空间。","wǒ xiànzài xūyào dúchǔ, qǐng gěi wǒ yìdiǎn kōngjiān.","ตอนนี้ขออยู่คนเดียว กรุณาให้พื้นที่ฉันหน่อย","ton ni kho yu khon diao, karuna hai phuenthi chan noi"],
      ["S1","我需要暂停这段对话，请先让我离开。","wǒ xūyào zàntíng zhè duàn duìhuà, qǐng xiān ràng wǒ líkāi.","ฉันขอหยุดการสนทนานี้ก่อน กรุณาให้ฉันออกไปค่ะ","chan kho yut kan sonthana ni kon, karuna hai chan ok pai kha"]
    ]],
    ["mistake","work","指出错误","ชี้ข้อผิดพลาด","共同检查一处问题","ตรวจปัญหาร่วมกัน",[
      ["S5","这里似乎有个问题，我们一起确认一下好吗？","zhèlǐ sìhū yǒu ge wèntí, wǒmen yìqǐ quèrèn yíxià hǎo ma?","ตรงนี้ดูเหมือนจะมีปัญหา เรามาช่วยกันตรวจสอบอีกครั้งดีไหมคะ","trong ni du muean cha mi panha, rao ma chuai kan truatsop ik khrang di mai kha"],
      ["S4","这里可能做错了，请再检查一下。","zhèlǐ kěnéng zuò cuò le, qǐng zài jiǎnchá yíxià.","ตรงนี้อาจผิด ช่วยตรวจอีกครั้งนะคะ","trong ni at phit, chuai truat ik khrang na kha"],
      ["S3","这里好像弄错了。","zhèlǐ hǎoxiàng nòng cuò le.","ตรงนี้เหมือนจะผิดนะ","trong ni muean cha phit na"],
      ["S2","这里有错误，请重新检查。","zhèlǐ yǒu cuòwù, qǐng chóngxīn jiǎnchá.","ตรงนี้มีข้อผิดพลาด ช่วยตรวจใหม่","trong ni mi kho phit phlat, chuai truat mai"],
      ["S1","请只说具体问题，不要针对个人。","qǐng zhǐ shuō jùtǐ wèntí, bú yào zhēnduì gèrén.","กรุณาพูดถึงปัญหาให้ชัดเจน และอย่าพาดพิงตัวบุคคลค่ะ","karuna phut thueng panha hai chatchen, lae ya phatphing tua bukkhon kha"]
    ]],
    ["decline","social","拒绝邀请","ปฏิเสธคำชวน","无法参加活动","ไปร่วมกิจกรรมไม่ได้",[
      ["S5","谢谢邀请，不过这次我恐怕没办法参加。","xièxie yāoqǐng, búguò zhè cì wǒ kǒngpà méi bànfǎ cānjiā.","ขอบคุณที่ชวนนะคะ แต่ครั้งนี้ดิฉันคงไปร่วมไม่ได้ค่ะ","khopkhun thi chuan na kha, tae khrang ni dichan khong pai ruam mai dai kha"],
      ["S4","不好意思，这次我去不了。","bù hǎoyìsi, zhè cì wǒ qù bu liǎo.","ขอโทษค่ะ ครั้งนี้ฉันไปไม่ได้ค่ะ","kho thot kha, khrang ni chan pai mai dai kha"],
      ["S3","这次不去了，下次吧。","zhè cì bú qù le, xià cì ba.","ครั้งนี้ไม่ไปนะ ไว้คราวหน้า","khrang ni mai pai na, wai khrao na"],
      ["S2","我不参加了，请不用再问。","wǒ bù cānjiā le, qǐng bú yòng zài wèn.","ฉันไม่เข้าร่วมแล้ว ไม่ต้องถามซ้ำ","chan mai khao ruam laeo, mai tong tham sam"],
      ["S1","我已经拒绝了，请不要继续施压。","wǒ yǐjīng jùjué le, qǐng bú yào jìxù shīyā.","ฉันปฏิเสธแล้ว กรุณาอย่ากดดันต่อค่ะ","chan patiset laeo, karuna ya kotdan to kha"]
    ]],
    ["wait","work","请对方等待","ขอให้อีกฝ่ายรอ","正在处理事情","กำลังจัดการเรื่องหนึ่ง",[
      ["S5","劳驾，请稍等片刻，我马上处理。","láojià, qǐng shāo děng piànkè, wǒ mǎshàng chǔlǐ.","รบกวนรอสักครู่นะคะ ดิฉันจะรีบจัดการให้ค่ะ","ropkuan ro sak khru na kha, dichan cha rip chatkan hai kha"],
      ["S4","请稍等一下。","qǐng shāo děng yíxià.","รอสักครู่นะคะ","ro sak khru na kha"],
      ["S3","等我一下。","děng wǒ yíxià.","รอแป๊บนะ","ro paep na"],
      ["S2","请先等一下，我处理完会回复。","qǐng xiān děng yíxià, wǒ chǔlǐ wán huì huífù.","กรุณารอก่อน ฉันจะตอบเมื่อจัดการเสร็จ","karuna ro kon, chan cha top muea chatkan set"],
      ["S1","我需要时间处理，请不要反复催促。","wǒ xūyào shíjiān chǔlǐ, qǐng bú yào fǎnfù cuīcù.","ฉันต้องใช้เวลาจัดการ กรุณาอย่าเร่งซ้ำค่ะ","chan tong chai wela chatkan, karuna ya reng sam kha"]
    ]],
    ["repay","shopping","催还借款","ทวงเงินที่ยืม","借款逾期未还","เงินยืมยังไม่ได้คืน",[
      ["S5","方便的话，请问您预计什么时候还款？","fāngbiàn de huà, qǐngwèn nín yùjì shénme shíhou huánkuǎn?","หากสะดวก ไม่ทราบว่าคาดว่าจะคืนเงินได้ประมาณเมื่อไรคะ","hak saduak, mai sap wa khat wa cha khuen ngoen dai praman muearai kha"],
      ["S4","请问什么时候可以还钱？","qǐngwèn shénme shíhou kěyǐ huán qián?","ขอถามหน่อยนะคะว่าจะคืนเงินเมื่อไร","kho tham noi na kha wa cha khuen ngoen muearai"],
      ["S3","钱什么时候还我？","qián shénme shíhou huán wǒ?","เมื่อไรจะคืนเงินให้ฉัน","muearai cha khuen ngoen hai chan"],
      ["S2","请按约定时间还款。","qǐng àn yuēdìng shíjiān huánkuǎn.","กรุณาคืนเงินตามเวลาที่ตกลงกัน","karuna khuen ngoen tam wela thi toklong kan"],
      ["S1","请按约定还款；如果有困难，请给出明确日期。","qǐng àn yuēdìng huánkuǎn; rúguǒ yǒu kùnnan, qǐng gěichū míngquè rìqī.","กรุณาคืนเงินตามที่ตกลง หากมีปัญหาโปรดแจ้งวันที่ชัดเจนค่ะ","karuna khuen ngoen tam thi toklong, hak mi panha prot chaeng wanthi chatchen kha"]
    ]],
    ["dont-touch","daily","制止别人碰物品","ห้ามแตะของ","私人物品被碰","มีคนแตะของส่วนตัว",[
      ["S5","不好意思，请不要碰我的东西。","bù hǎoyìsi, qǐng bú yào pèng wǒ de dōngxi.","ขอโทษค่ะ กรุณาอย่าแตะต้องสิ่งของของดิฉันนะคะ","kho thot kha, karuna ya tae tong singkhong khong dichan na kha"],
      ["S4","麻烦别动我的东西。","máfan bié dòng wǒ de dōngxi.","ช่วยอย่าแตะของฉันนะคะ","chuai ya tae khong chan na kha"],
      ["S3","别动我的东西啊。","bié dòng wǒ de dōngxi a.","อย่าแตะของฉันนะ","ya tae khong chan na"],
      ["S2","请不要碰，这是我的物品。","qǐng bú yào pèng, zhè shì wǒ de wùpǐn.","กรุณาอย่าแตะ นี่เป็นของของฉัน","karuna ya tae, ni pen khong khong chan"],
      ["S1","请立刻停止触碰我的物品。","qǐng lìkè tíngzhǐ chùpèng wǒ de wùpǐn.","กรุณาหยุดแตะของของฉันทันทีค่ะ","karuna yut tae khong khong chan thanthi kha"]
    ]],
    ["too-expensive","shopping","认为价格太高","เห็นว่าราคาแพงเกินไป","与卖家谈价格","ต่อรองราคากับผู้ขาย",[
      ["S5","这个价格超出预算，方便再优惠一些吗？","zhè ge jiàgé chāochū yùsuàn, fāngbiàn zài yōuhuì yìxiē ma?","ราคานี้เกินงบไปหน่อย พอจะลดให้อีกได้ไหมคะ","rakha ni koen ngop pai noi, pho cha lot hai ik dai mai kha"],
      ["S4","有点贵，可以便宜一点吗？","yǒudiǎn guì, kěyǐ piányi yìdiǎn ma?","แพงไปนิด ลดได้ไหมคะ","phaeng pai nit, lot dai mai kha"],
      ["S3","有点贵，便宜点儿吧。","yǒudiǎn guì, piányi diǎnr ba.","แพงไปหน่อย ลดให้หน่อยสิ","phaeng pai noi, lot hai noi si"],
      ["S2","这个价格超出预算，我先不买。","zhège jiàgé chāochū yùsuàn, wǒ xiān bù mǎi.","ราคานี้เกินงบ ฉันขอไม่ซื้อ","rakha ni koen ngop, chan kho mai sue"],
      ["S1","这个价格我不能接受，我先不买了。","zhège jiàgé wǒ bù néng jiēshòu, wǒ xiān bù mǎi le.","ฉันรับราคานี้ไม่ได้ จึงขอไม่ซื้อค่ะ","chan rap rakha ni mai dai, chueng kho mai sue kha"]
    ]],
    ["late","social","指出对方迟到","บอกว่าอีกฝ่ายมาสาย","等了对方很久","รออีกฝ่ายมานาน",[
      ["S5","我等了一段时间，希望下次能提前告知。","wǒ děng le yí duàn shíjiān, xīwàng xià cì néng tíqián gàozhī.","ดิฉันรอมาสักพักแล้ว ครั้งหน้ารบกวนแจ้งล่วงหน้าด้วยนะคะ","dichan ro ma sak phak laeo, khrang na ropkuan chaeng luangna duai na kha"],
      ["S4","你迟到了，下次请提前说一声。","nǐ chídào le, xià cì qǐng tíqián shuō yì shēng.","คุณมาสายนะคะ ครั้งหน้าช่วยบอกล่วงหน้าด้วยค่ะ","khun ma sai na kha, khrang na chuai bok luangna duai kha"],
      ["S3","你怎么才来？","nǐ zěnme cái lái?","ทำไมเพิ่งมา","thammai phoeng ma"],
      ["S2","你迟到了；下次请提前通知。","nǐ chídào le; xiàcì qǐng tíqián tōngzhī.","คุณมาสาย ครั้งหน้ากรุณาแจ้งล่วงหน้า","khun ma sai, khrang na karuna chaeng luang na"],
      ["S1","你迟到了，我们需要重新确认时间安排。","nǐ chídào le, wǒmen xūyào chóngxīn quèrèn shíjiān ānpái.","คุณมาสาย เราต้องยืนยันกำหนดเวลาใหม่ค่ะ","khun ma sai, rao tong yuenyan kamnot wela mai kha"]
    ]],
    ["drive-slower","travel","请司机慢一点","ขอให้คนขับช้าลง","车速让人不安","ความเร็วทำให้กังวล",[
      ["S5","请注意安全，能稍微慢一点吗？","qǐng zhùyì ānquán, néng shāowēi màn yìdiǎn ma?","ช่วยขับอย่างระมัดระวังและช้าลงหน่อยได้ไหมคะ","chuai khap yang ramatrawang lae cha long noi dai mai kha"],
      ["S4","麻烦开慢一点。","máfan kāi màn yìdiǎn.","ช่วยขับช้าลงหน่อยค่ะ","chuai khap cha long noi kha"],
      ["S3","慢点开啊。","màn diǎn kāi a.","ขับช้าหน่อย","khap cha noi"],
      ["S2","请开慢一点，现在不安全。","qǐng kāi màn yìdiǎn, xiànzài bù ānquán.","กรุณาขับช้าลง ตอนนี้ไม่ปลอดภัย","karuna khap cha long, ton ni mai plotphai"],
      ["S1","请马上减速，我感觉不安全。","qǐng mǎshàng jiǎnsù, wǒ gǎnjué bù ānquán.","กรุณาลดความเร็วทันที ฉันรู้สึกไม่ปลอดภัยค่ะ","karuna lot khwamreo thanthi, chan rusuek mai plotphai kha"]
    ]],
    ["queue","shopping","制止插队","ห้ามแซงคิว","有人插到队伍前面","มีคนแซงคิว",[
      ["S5","不好意思，这里需要排队，队尾在那边。","bù hǎoyìsi, zhèlǐ xūyào páiduì, duìwěi zài nàbian.","ขอโทษค่ะ ตรงนี้ต้องต่อคิว ปลายแถวอยู่ทางนั้นค่ะ","kho thot kha, trong ni tong to khio, plai thaeo yu thang nan kha"],
      ["S4","麻烦排一下队，谢谢。","máfan pái yíxià duì, xièxie.","ช่วยต่อคิวด้วยนะคะ ขอบคุณค่ะ","chuai to khio duai na kha, khopkhun kha"],
      ["S3","去后面排队吧。","qù hòumiàn páiduì ba.","ไปต่อแถวข้างหลังนะ","pai to thaeo khang lang na"],
      ["S2","请不要插队，队尾在后面。","qǐng bú yào chāduì, duìwěi zài hòumiàn.","กรุณาอย่าแซงคิว ท้ายแถวอยู่ด้านหลัง","karuna ya saeng khio, thai thaeo yu dan lang"],
      ["S1","请不要插队，队尾在后面。","qǐng bú yào chāduì, duìwěi zài hòumiàn.","กรุณาอย่าแซงคิว ปลายแถวอยู่ด้านหลังค่ะ","karuna ya saeng khio, plai thaeo yu dan lang kha"]
    ]],
    ["disagree","work","表达不同意见","แสดงความเห็นต่าง","讨论中意见不同","ความเห็นไม่ตรงกันระหว่างหารือ",[
      ["S5","我理解你的看法，不过我有不同意见。","wǒ lǐjiě nǐ de kànfǎ, búguò wǒ yǒu bùtóng yìjiàn.","ดิฉันเข้าใจมุมมองของคุณ แต่ดิฉันมีความเห็นต่างค่ะ","dichan khaochai mummong khong khun, tae dichan mi khwamhen tang kha"],
      ["S4","我不太同意，我们再讨论一下吧。","wǒ bú tài tóngyì, wǒmen zài tǎolùn yíxià ba.","ฉันไม่ค่อยเห็นด้วย ลองคุยกันอีกทีนะคะ","chan mai khoi hen duai, long khui kan ik thi na kha"],
      ["S3","我觉得不是这样。","wǒ juéde bú shì zhèyàng.","ฉันว่าไม่ใช่แบบนั้นนะ","chan wa mai chai baep nan na"],
      ["S2","我不同意这点，请先听完我的理由。","wǒ bù tóngyì zhè diǎn, qǐng xiān tīng wán wǒ de lǐyóu.","ฉันไม่เห็นด้วยกับข้อนี้ กรุณาฟังเหตุผลของฉันให้จบก่อน","chan mai hen duai kap kho ni, karuna fang hetphon khong chan hai chop kon"],
      ["S1","我不同意，我们先停止争论，核对事实。","wǒ bù tóngyì, wǒmen xiān tíngzhǐ zhēnglùn, héduì shìshí.","ฉันไม่เห็นด้วย เราหยุดโต้เถียงก่อนแล้วตรวจสอบข้อเท็จจริงค่ะ","chan mai hen duai, rao yut totthiang kon laeo truat sop khothetsaching kha"]
    ]],
    ["clean-up","daily","请对方收拾","ขอให้อีกฝ่ายเก็บของ","使用后留下杂物","ทิ้งของรกหลังใช้งาน",[
      ["S5","麻烦您用完后整理一下，谢谢。","máfan nín yòng wán hòu zhěnglǐ yíxià, xièxie.","รบกวนเก็บให้เรียบร้อยหลังใช้ด้วยนะคะ ขอบคุณค่ะ","ropkuan kep hai riaproi lang chai duai na kha, khopkhun kha"],
      ["S4","用完请收拾一下。","yòng wán qǐng shōushi yíxià.","ใช้เสร็จแล้วช่วยเก็บด้วยนะคะ","chai set laeo chuai kep duai na kha"],
      ["S3","用完记得收一下。","yòng wán jìde shōu yíxià.","ใช้แล้วเก็บด้วยนะ","chai laeo kep duai na"],
      ["S2","请把你用过的地方整理好。","qǐng bǎ nǐ yòngguo de dìfang zhěnglǐ hǎo.","กรุณาเก็บพื้นที่ที่คุณใช้ให้เรียบร้อย","karuna kep phuenthi thi khun chai hai riap roi"],
      ["S1","请把使用过的东西整理好，再离开。","qǐng bǎ shǐyòng guò de dōngxi zhěnglǐ hǎo, zài líkāi.","กรุณาเก็บของที่ใช้ให้เรียบร้อยก่อนออกไปค่ะ","karuna kep khong thi chai hai riaproi kon ok pai kha"]
    ]],
    ["stop-messaging","social","请对方停止发消息","ขอให้อีกฝ่ายหยุดส่งข้อความ","暂时不想继续聊天","ยังไม่อยากคุยต่อ",[
      ["S5","谢谢联系，不过我暂时不方便继续聊天。","xièxie liánxì, búguò wǒ zànshí bù fāngbiàn jìxù liáotiān.","ขอบคุณที่ติดต่อมานะคะ แต่ตอนนี้ดิฉันไม่สะดวกคุยต่อค่ะ","khopkhun thi titto ma na kha, tae ton ni dichan mai saduak khui to kha"],
      ["S4","我现在不方便，请晚点再联系。","wǒ xiànzài bù fāngbiàn, qǐng wǎndiǎn zài liánxì.","ตอนนี้ฉันไม่สะดวก ไว้ค่อยติดต่อมาใหม่นะคะ","ton ni chan mai saduak, wai khoi titto ma mai na kha"],
      ["S3","先别发了，晚点聊。","xiān bié fā le, wǎndiǎn liáo.","ยังไม่ต้องส่งมานะ ไว้ค่อยคุย","yang mai tong song ma na, wai khoi khui"],
      ["S2","请暂时不要再联系我。","qǐng zànshí bú yào zài liánxì wǒ.","กรุณาหยุดติดต่อฉันชั่วคราว","karuna yut titto chan chua khrao"],
      ["S1","请停止联系我；如果继续，我会屏蔽。","qǐng tíngzhǐ liánxì wǒ; rúguǒ jìxù, wǒ huì píngbì.","กรุณาหยุดติดต่อฉัน หากยังติดต่ออีกฉันจะบล็อกค่ะ","karuna yut titto chan, hak yang titto ik chan cha blok kha"]
    ]],
    ["apology","social","要求对方道歉","ขอให้อีกฝ่ายขอโทษ","对方的行为造成影响","การกระทำของอีกฝ่ายส่งผลกระทบ",[
      ["S5","这件事让我受到影响，我希望能得到一个正式的道歉。","zhè jiàn shì ràng wǒ shòudào yǐngxiǎng, wǒ xīwàng néng dédào yí ge zhèngshì de dàoqiàn.","เรื่องนี้ส่งผลกระทบต่อดิฉัน ดิฉันอยากได้รับคำขอโทษอย่างเป็นทางการค่ะ","rueang ni song phonkrathop to dichan, dichan yak dai rap kham kho thot yang pen thangkan kha"],
      ["S4","这件事，希望你能向我道歉。","zhè jiàn shì, xīwàng nǐ néng xiàng wǒ dàoqiàn.","เรื่องนี้ฉันอยากให้คุณขอโทษนะคะ","rueang ni chan yak hai khun kho thot na kha"],
      ["S3","你得跟我说声对不起吧。","nǐ děi gēn wǒ shuō shēng duìbuqǐ ba.","ขอโทษฉันสักคำก็ดีนะ","kho thot chan sak kham ko di na"],
      ["S2","这件事影响了我，请认真道歉。","zhè jiàn shì yǐngxiǎng le wǒ, qǐng rènzhēn dàoqiàn.","เรื่องนี้กระทบฉัน กรุณาขอโทษอย่างจริงใจ","rueang ni krathop chan, karuna kho thot yang ching chai"],
      ["S1","这件事影响到我，请明确道歉并说明如何改正。","zhè jiàn shì yǐngxiǎng dào wǒ, qǐng míngquè dàoqiàn bìng shuōmíng rúhé gǎizhèng.","เรื่องนี้ส่งผลกระทบต่อฉัน กรุณาขอโทษให้ชัดเจนและบอกวิธีแก้ไขค่ะ","rueang ni songphon krathop to chan, karuna kho thot hai chatchen lae bok withi kaekhai kha"]
    ]],
    ["calm-down","social","让争吵暂停","หยุดการทะเลาะ","双方情绪激动","ทั้งสองฝ่ายกำลังอารมณ์ร้อน",[
      ["S5","我们都先冷静一下，晚些时候再谈好吗？","wǒmen dōu xiān lěngjìng yíxià, wǎnxiē shíhou zài tán hǎo ma?","เราสองคนใจเย็นกันก่อน แล้วค่อยกลับมาคุยกันได้ไหมคะ","rao song khon chai yen kan kon, laeo khoi klap ma khui kan dai mai kha"],
      ["S4","先冷静一下，我们等会儿再说。","xiān lěngjìng yíxià, wǒmen děnghuìr zài shuō.","ใจเย็นก่อนนะคะ แล้วค่อยคุยกัน","chai yen kon na kha, laeo khoi khui kan"],
      ["S3","先别吵了，冷静一下。","xiān bié chǎo le, lěngjìng yíxià.","หยุดเถียงก่อน ใจเย็น ๆ","yut thiang kon, chai yen yen"],
      ["S2","我们先停止争论，冷静后再谈。","wǒmen xiān tíngzhǐ zhēnglùn, lěngjìng hòu zài tán.","เราหยุดโต้เถียงก่อน แล้วค่อยคุยกันเมื่อใจเย็นลง","rao yut to thiang kon, laeo khoi khui kan muea chai yen long"],
      ["S1","我们先暂停，等双方冷静后再谈。","wǒmen xiān zàntíng, děng shuāngfāng lěngjìng hòu zài tán.","เราหยุดก่อน แล้วค่อยคุยกันเมื่อทั้งสองฝ่ายใจเย็นค่ะ","rao yut kon, laeo khoi khui kan muea thang song fai chai yen kha"]
    ]]
  ];

  /*
   * A register recommendation is only meaningful after the relationship and
   * setting are fixed. These scenarios are deliberately narrow: changing the
   * listener or setting can change the best answer even when the intent stays
   * the same. `recommendedGrade` is therefore a contextual recommendation,
   * never a claim that one grade is universally "better".
   */
  function scenario(settingZh, settingTh, relationshipZh, relationshipTh, familiarity, powerDistance, urgency, recommendedGrade, recommendedWhyZh, recommendedWhyTh) {
    return {
      settingZh, settingTh, relationshipZh, relationshipTh,
      familiarity, powerDistance, urgency, recommendedGrade,
      recommendedWhyZh, recommendedWhyTh,
      contextRequired: true,
      reviewStatus: "editorial-draft-native-review-pending"
    };
  }

  const SCENARIOS = {
    repeat: scenario(
      "便利店柜台", "เคาน์เตอร์ร้านสะดวกซื้อ", "第一次见面的顾客 → 店员", "ลูกค้า → พนักงานที่เพิ่งพบกัน",
      "strangers", "service-peer", "normal", "S4", "日常服务中简短请求并保留礼貌句尾最自然。", "งานบริการทั่วไปควรขอสั้น ๆ และคงคำลงท้ายสุภาพ"
    ),
    "make-way": scenario(
      "拥挤的地铁通道", "ทางเดินรถไฟฟ้าที่แออัด", "陌生乘客 → 陌生乘客", "ผู้โดยสารที่ไม่รู้จักกัน",
      "strangers", "peer", "normal", "S4", "对陌生人直接说明需求并道谢，清楚且不过度正式。", "บอกความต้องการตรง ๆ พร้อมขอบคุณ เหมาะกับคนแปลกหน้าโดยไม่เป็นทางการเกินไป"
    ),
    hurry: scenario(
      "外带餐厅取餐口", "จุดรับอาหารกลับบ้าน", "顾客 → 第一次见面的店员", "ลูกค้า → พนักงานที่เพิ่งพบกัน",
      "strangers", "service-peer", "time-sensitive", "S4", "时间紧也应保留请求形式，S4 比命令更稳妥。", "แม้รีบก็ควรคงรูปประโยคขอร้อง ระดับ S4 ปลอดภัยกว่าคำสั่ง"
    ),
    quiet: scenario(
      "医院候诊区", "พื้นที่รอในโรงพยาบาล", "候诊者 → 陌生候诊者", "ผู้รอรับบริการที่ไม่รู้จักกัน",
      "strangers", "peer", "normal", "S4", "公共空间面对陌生人，礼貌而明确的提醒最合适。", "ในพื้นที่สาธารณะควรเตือนคนแปลกหน้าอย่างสุภาพและชัดเจน"
    ),
    boundaries: scenario(
      "办公室茶水间", "มุมพักในสำนักงาน", "不太熟的同事 → 同事", "เพื่อนร่วมงานที่ยังไม่สนิทกัน",
      "acquaintances", "peer", "normal", "S4", "需要清楚设边界，但不必升级成正式交涉或冲突。", "ควรตั้งขอบเขตให้ชัดโดยไม่ยกระดับเป็นการเจรจาทางการหรือการปะทะ"
    ),
    "leave-alone": scenario(
      "合租住处", "ที่พักร่วมกัน", "关系很近的朋友 → 朋友", "เพื่อนสนิท → เพื่อนสนิท",
      "close", "peer", "normal", "S3", "熟人之间可省去正式客套，但仍要表达完整边界。", "เพื่อนสนิทลดพิธีการได้ แต่ยังต้องบอกขอบเขตให้ครบ"
    ),
    mistake: scenario(
      "共同检查工作文档", "ตรวจเอกสารงานร่วมกัน", "同级同事 → 同级同事", "เพื่อนร่วมงานระดับเดียวกัน",
      "colleagues", "peer", "normal", "S4", "先指出问题再请对方复查，适合同级协作。", "ชี้ปัญหาแล้วขอให้ตรวจอีกครั้ง เหมาะกับการทำงานร่วมกันระดับเดียวกัน"
    ),
    decline: scenario(
      "朋友群聊中的周末邀约", "คำชวนสุดสัปดาห์ในแชตกลุ่มเพื่อน", "关系很近的朋友 → 朋友", "เพื่อนสนิท → เพื่อนสนิท",
      "close", "peer", "normal", "S3", "朋友间自然说明这次不去即可，不必使用公文式客套。", "กับเพื่อนสนิทบอกตามธรรมชาติว่าไปครั้งนี้ไม่ได้ก็พอ ไม่ต้องเป็นทางการ"
    ),
    wait: scenario(
      "公司接待处的正式业务办理", "จุดต้อนรับบริษัทสำหรับธุรกิจทางการ", "接待人员 → 首次来访的客户", "เจ้าหน้าที่ต้อนรับ → ลูกค้าที่มาเป็นครั้งแรก",
      "formal", "service-provider-to-client", "normal", "S5", "正式客户关系中说明正在处理并承诺跟进，比只说“等一下”更完整。", "กับลูกค้าในงานทางการควรบอกว่ากำลังดำเนินการและจะติดตาม ไม่ใช่เพียงบอกให้รอ"
    ),
    repay: scenario(
      "私人聊天", "แชตส่วนตัว", "借过钱的亲近朋友 → 朋友", "เพื่อนสนิทผู้ให้ยืม → เพื่อนผู้ยืม",
      "close", "peer", "overdue", "S3", "双方很熟且已逾期，可直接询问时间，但不需要挖苦或针对对方。", "เมื่อสนิทกันและเลยกำหนดแล้ว ถามเวลาได้ตรง ๆ โดยไม่ประชดหรือโจมตีอีกฝ่าย"
    ),
    "dont-touch": scenario(
      "共享办公区", "พื้นที่ทำงานร่วมกัน", "不太熟的同事 → 同事", "เพื่อนร่วมงานที่ยังไม่สนิทกัน",
      "acquaintances", "peer", "immediate-boundary", "S4", "要立即制止，但面对不熟同事仍应保留礼貌边界。", "ควรหยุดทันที แต่กับเพื่อนร่วมงานที่ยังไม่สนิทยังควรรักษาความสุภาพ"
    ),
    "too-expensive": scenario(
      "可以议价的市场摊位", "แผงตลาดที่ต่อรองราคาได้", "第一次见面的顾客 → 摊主", "ลูกค้าที่เพิ่งพบกัน → พ่อค้าแม่ค้า",
      "strangers", "service-peer", "normal", "S4", "市场可以直接议价，保留请求形式即可，不必过度正式。", "ในตลาดต่อราคาได้ตรง ๆ เพียงคงรูปประโยคขอร้อง ไม่ต้องเป็นทางการเกินไป"
    ),
    late: scenario(
      "朋友约好的咖啡店", "ร้านกาแฟที่นัดกันไว้", "关系很近的朋友 → 迟到的朋友", "เพื่อนสนิท → เพื่อนที่มาสาย",
      "close", "peer", "late", "S3", "熟人场景可以随口追问，但不把迟到升级成人格攻击。", "กับเพื่อนสนิทถามตรง ๆ แบบกันเองได้ แต่ไม่ควรเปลี่ยนเป็นการด่าตัวบุคคล"
    ),
    "drive-slower": scenario(
      "正在行驶的出租车", "บนรถแท็กซี่ที่กำลังวิ่ง", "乘客 → 第一次见面的司机", "ผู้โดยสาร → คนขับที่เพิ่งพบกัน",
      "strangers", "service-peer", "safety-urgent", "S4", "安全诉求要短而清楚，同时保留基本礼貌。", "คำขอเรื่องความปลอดภัยควรสั้นและชัด พร้อมคงความสุภาพพื้นฐาน"
    ),
    queue: scenario(
      "医院挂号队伍", "แถวลงทะเบียนโรงพยาบาล", "排队者 → 陌生插队者", "ผู้ต่อแถว → คนแปลกหน้าที่แซงคิว",
      "strangers", "peer", "immediate-boundary", "S4", "对陌生人说明规则和队尾位置，比驱赶更安全。", "บอกกติกาและตำแหน่งท้ายแถวแก่คนแปลกหน้า ปลอดภัยกว่าการไล่"
    ),
    disagree: scenario(
      "有客户参加的正式方案会", "ประชุมแผนงานอย่างเป็นทางการที่มีลูกค้า", "项目负责人 → 客户代表", "หัวหน้าโครงการ → ตัวแทนลูกค้า",
      "formal", "provider-to-client", "normal", "S5", "正式分歧要先承接对方观点，再提出不同意见。", "เมื่อเห็นต่างในงานทางการควรรับฟังมุมมองอีกฝ่ายก่อนเสนอความเห็นที่ต่าง"
    ),
    "clean-up": scenario(
      "合租房公共客厅", "ห้องนั่งเล่นส่วนกลางของที่พักร่วม", "关系很近的室友 → 室友", "เพื่อนร่วมห้องที่สนิทกัน",
      "close", "peer", "normal", "S3", "熟悉的室友之间可直接提醒，重点是不挖苦、不贬低。", "เพื่อนร่วมห้องที่สนิทกันเตือนได้ตรง ๆ โดยไม่ประชดหรือดูถูก"
    ),
    "stop-messaging": scenario(
      "下班后的私人消息", "ข้อความส่วนตัวหลังเลิกงาน", "不太熟的同事 → 同事", "เพื่อนร่วมงานที่ยังไม่สนิทกัน",
      "acquaintances", "peer", "repeated-contact", "S4", "清楚说明现在不方便并给出之后联系的选择，边界更完整。", "บอกให้ชัดว่าตอนนี้ไม่สะดวกและเปิดทางให้ติดต่อภายหลัง ทำให้ขอบเขตครบถ้วน"
    ),
    apology: scenario(
      "酒店前台处理正式投诉", "เคาน์เตอร์โรงแรมระหว่างจัดการข้อร้องเรียน", "住客 → 值班经理", "ผู้เข้าพัก → ผู้จัดการเวร",
      "formal", "customer-to-manager", "normal", "S5", "正式投诉中说明影响并提出具体诉求，比直接逼问更有效。", "ในการร้องเรียนทางการควรอธิบายผลกระทบและขอสิ่งที่ต้องการอย่างชัดเจน"
    ),
    "calm-down": scenario(
      "朋友群内争执", "การโต้เถียงในกลุ่มเพื่อน", "共同好友 → 两位亲近朋友", "เพื่อนร่วมกลุ่ม → เพื่อนสนิทสองคน",
      "close", "peer", "heated", "S3", "熟人之间可用自然口吻叫停，但不使用命令式羞辱。", "ในกลุ่มเพื่อนใช้ภาษากันเองเพื่อหยุดเหตุได้ โดยไม่ออกคำสั่งแบบดูหมิ่น"
    )
  };

  /*
   * 首课路线只引用 RAW 里的同档表达，避免首页、课程和游戏各自维护一套语域。
   * UI 应按 currentMode 调 getRoute("S5"..."S1")；不得再使用固定 S4/S3 课程数组。
   */
  const ROUTE_SPECS = {
    S5: {
      id: "route-s5-formal-negotiation", sceneId: "formal-negotiation",
      titleZh: "正式协商：把分寸说完整", titleTh: "เจรจาอย่างเป็นทางการ: สื่อสารให้ครบและให้เกียรติ",
      goalZh: "用理由、缓冲和选择空间完成三次正式协商。",
      goalTh: "ใช้เหตุผล คำเกริ่น และทางเลือกในการเจรจาอย่างเป็นทางการสามครั้ง",
      safetyZh: "正式不等于堆砌敬语；先把事实和请求说清。",
      safetyTh: "ภาษาทางการไม่ใช่การใส่คำสุภาพซ้ำ ๆ ควรบอกข้อเท็จจริงและคำขอให้ชัดก่อน",
      steps: [
        ["budget", "too-expensive", "这件商品超过预算，你想询问能否优惠。", "สินค้าชิ้นนี้เกินงบ คุณต้องการถามว่าสามารถลดราคาได้ไหม"],
        ["different-view", "disagree", "对方坚持原方案，你需要表达不同意见。", "อีกฝ่ายยืนยันแผนเดิม คุณต้องการแสดงความเห็นต่าง"],
        ["ask-to-wait", "wait", "结果还在处理中，你需要请对方稍等。", "ผลยังอยู่ระหว่างดำเนินการ คุณต้องขอให้อีกฝ่ายรอสักครู่"]
      ]
    },
    S4: {
      id: "route-s4-everyday-service", sceneId: "everyday-service",
      titleZh: "日常服务：自然礼貌三连", titleTh: "บริการในชีวิตประจำวัน: สุภาพอย่างเป็นธรรมชาติ",
      goalZh: "在高频服务场景里，用短而完整的礼貌句解决问题。",
      goalTh: "แก้สถานการณ์บริการที่พบบ่อยด้วยประโยคสุภาพที่สั้นแต่ครบ",
      safetyZh: "这是陌生人场景的默认档；泰语别漏ครับ/ค่ะ。",
      safetyTh: "เป็นระดับเริ่มต้นสำหรับคุยกับคนแปลกหน้า ภาษาไทยไม่ควรลืมครับ/ค่ะ",
      steps: [
        ["repeat-clearly", "repeat", "店员说得太快，你没有听清。", "พนักงานพูดเร็วเกินไป คุณฟังไม่ชัด"],
        ["make-way-politely", "make-way", "通道被挡住，你需要通过。", "มีคนขวางทางเดิน คุณต้องการผ่าน"],
        ["lower-volume", "quiet", "公共空间太吵，你想请对方小声一点。", "สถานที่สาธารณะเสียงดัง คุณต้องการขอให้อีกฝ่ายเบาเสียง"]
      ]
    },
    S3: {
      id: "route-s3-friend-talk", sceneId: "friend-talk",
      titleZh: "朋友互动：随口但不伤人", titleTh: "คุยกับเพื่อน: กันเองแต่ไม่ทำร้ายกัน",
      goalZh: "练习拒绝、提醒和暂时独处三种熟人口吻。",
      goalTh: "ฝึกปฏิเสธ เตือน และขออยู่คนเดียวด้วยภาษาของคนสนิท",
      safetyZh: "只对熟人或平辈使用；随口不等于挖苦。",
      safetyTh: "ใช้กับเพื่อนหรือคนระดับเดียวกันเท่านั้น ความกันเองไม่ใช่การประชด",
      steps: [
        ["decline-friend", "decline", "朋友约你出门，但你这次不能参加。", "เพื่อนชวนออกไปข้างนอก แต่ครั้งนี้คุณไปไม่ได้"],
        ["late-friend", "late", "朋友迟到了，你想随口问一句。", "เพื่อนมาสาย คุณอยากถามแบบกันเอง"],
        ["pause-chat", "leave-alone", "你现在想自己待一会儿。", "ตอนนี้คุณอยากอยู่คนเดียวสักพัก"]
      ]
    },
    S2: {
      id: "route-s2-direct-boundary", sceneId: "direct-boundary",
      titleZh: "直接表达：短句也能尊重人", titleTh: "พูดตรง: ประโยคสั้นก็ยังให้เกียรติได้",
      goalZh: "练习三种直接边界表达，把需求和下一步说清楚。",
      goalTh: "ฝึกประโยคตั้งขอบเขตแบบตรงสามแบบ โดยบอกความต้องการและขั้นตอนถัดไปให้ชัด",
      safetyZh: "全部内容可安全练习；坚定不等于攻击，句子不包含羞辱或贬低。",
      safetyTh: "ทุกประโยคฝึกพูดได้อย่างปลอดภัย ความหนักแน่นไม่ใช่การโจมตี และไม่มีถ้อยคำทำให้อับอายหรือดูถูก",
      steps: [
        ["protect-property", "dont-touch", "有人正在碰你的私人物品。", "มีคนกำลังแตะของส่วนตัวของคุณ"],
        ["stop-interference", "boundaries", "对方反复干涉你的私事。", "อีกฝ่ายก้าวก่ายเรื่องส่วนตัวซ้ำ ๆ"],
        ["stop-messages", "stop-messaging", "你已经说过暂时不想继续聊天。", "คุณบอกแล้วว่ายังไม่อยากคุยต่อ"]
      ]
    },
    S1: {
      id: "route-s1-conflict-deescalation", sceneId: "conflict-deescalation",
      titleZh: "冲突降级：稳住、设界限、再退出", titleTh: "คลี่คลายความขัดแย้ง: ตั้งสติ ตั้งขอบเขต แล้วถอนตัว",
      goalZh: "练习暂停争论、保护个人边界和安全结束对话。",
      goalTh: "ฝึกหยุดการโต้เถียง ปกป้องขอบเขตส่วนตัว และยุติการสนทนาอย่างปลอดภัย",
      safetyZh: "只提供可直接使用的安全回应，不展示、不复述任何侮辱性台词。",
      safetyTh: "มีเฉพาะคำตอบที่นำไปใช้ได้อย่างปลอดภัย โดยไม่แสดงหรือทวนถ้อยคำที่ทำให้อับอาย",
      steps: [
        ["pause-argument", "calm-down", "对话越来越激动，你决定先暂停。", "การสนทนาตึงเครียดขึ้น คุณจึงตัดสินใจหยุดก่อน"],
        ["protect-boundary", "dont-touch", "有人反复触碰你的私人物品。", "มีคนแตะของส่วนตัวของคุณซ้ำ ๆ"],
        ["leave-safely", "leave-alone", "继续交谈已经没有帮助，你需要安全离开。", "การคุยต่อไม่ช่วยให้ดีขึ้น คุณจึงต้องถอนตัวอย่างปลอดภัย"]
      ]
    }
  };

  const AUDIT = {
    version: "register-v13.0-20260904",
    translationPair: "manual-bilingual-equivalence-audit",
    thaiRegister: "editorial-audit-pending-native-signoff",
    nativeSpeakerSignoff: "pending",
    romanToneSignoff: "pending",
    contentStatus: "editorial-draft-native-review-pending",
    scope: "20 intents x 5 routes; contextual recommendation; two-language meaning equivalence; insult-free direct and de-escalation training"
  };

  const SPEAKER_FORM_POLICY = {
    version: "thai-speaker-forms-v1-20260822",
    appliesToGrades: ["S5", "S4", "S1"],
    availableProfiles: ["female", "male"],
    sourceProfile: "female",
    nativeSpeakerSignoff: "pending",
    explanationZh: "泰语礼貌句尾和第一人称会随说话者表达方式变化。安全档同时提供女性ค่ะ/คะ/ดิฉัน/ฉัน与男性ครับ/ผม数据；两套均待母语教师终审。",
    explanationTh: "คำลงท้ายสุภาพและสรรพนามบุรุษที่หนึ่งในภาษาไทยเปลี่ยนตามรูปแบบการระบุตัวของผู้พูด ระดับปลอดภัยมีทั้งรูปผู้หญิงและผู้ชาย และทั้งสองแบบยังรอเจ้าของภาษาตรวจ"
  };

  function maleThaiForm(value) {
    return String(value || "")
      .replace(/ดิฉัน/gu, "ผม")
      .replace(/ฉัน/gu, "ผม")
      .replace(/(?:ค่ะ|คะ)/gu, "ครับ");
  }

  function maleRomanForm(value) {
    return String(value || "")
      .replace(/\bdichan\b/giu, "phom")
      .replace(/\bchan\b/giu, "phom")
      .replace(/\bkha\b/giu, "khrap");
  }

  function buildSpeakerForms(grade, th, ro) {
    if (!SPEAKER_FORM_POLICY.appliesToGrades.includes(grade)) return null;
    const common = {
      contentReviewStatus: "native-review-pending",
      romanToneStatus: "pending-native-review",
      romanToneReviewed: false,
      nativeReviewed: false
    };
    return {
      female: { ...common, profile: "female", th, ro },
      male: { ...common, profile: "male", th: maleThaiForm(th), ro: maleRomanForm(ro) }
    };
  }

  window.HUILAISHI_REGISTER_LEVELS = LEVELS;
  const PACK = RAW.map(([id, cat, intentZh, intentTh, contextZh, contextTh, rows]) => {
    const decisionContext = SCENARIOS[id] || null;
    const contextComplete = Boolean(
      decisionContext?.settingZh && decisionContext?.settingTh
      && decisionContext?.relationshipZh && decisionContext?.relationshipTh
      && LEVELS[decisionContext?.recommendedGrade]
    );
    const recommendedGrade = contextComplete ? decisionContext.recommendedGrade : null;
    return {
      id,
      cat,
      intentZh,
      intentTh,
      contextZh,
      contextTh,
      decisionContext,
      contextComplete,
      uniqueGradeJudgment: contextComplete,
      recommendedGrade,
      recommendedVariantId: recommendedGrade ? `register:${id}:${recommendedGrade}` : null,
      recommendedWhyZh: decisionContext?.recommendedWhyZh || "",
      recommendedWhyTh: decisionContext?.recommendedWhyTh || "",
      meaningId: `register:${id}`,
      audit: AUDIT,
      speakerFormPolicy: SPEAKER_FORM_POLICY,
      variants: rows.map(([grade, zh, py, th, ro, noteZh, noteTh]) => {
      const level = LEVELS[grade];
      const hasToneMarks = /[àèìòùâêîôûáéíóúǎěǐǒǔɛ̀ɛ̂ɛ́ɛ̌ɔ̀ɔ̂ɔ́ɔ̌ʉ̀ʉ̂ʉ́ʉ̌]/iu.test(ro);
      const speakerForms = buildSpeakerForms(grade, th, ro);
      return {
        id: `register:${id}:${grade}`,
        grade,
        zh,
        py,
        th,
        ro,
        meaningId: `register:${id}`,
        labelZh: level.labelZh,
        labelTh: level.labelTh,
        boundaryZh: level.boundaryZh,
        boundaryTh: level.boundaryTh,
        audienceZh: level.audienceZh,
        audienceTh: level.audienceTh,
        noteZh: noteZh || NOTES[grade][0],
        noteTh: noteTh || NOTES[grade][1],
        risk: !level.outputAllowed,
        riskLevel: level.risk,
        recommended: grade === recommendedGrade,
        outputAllowed: level.outputAllowed,
        followMode: level.followMode,
        delivery: level.delivery || null,
        warningZh: "",
        warningTh: "",
        nativeReview: grade === "S1" || grade === "S2",
        nativeReviewReason: grade === "S1"
          ? "冲突降级表达：请母语教师终审自然度、边界清晰度、性别形式与罗马音。"
          : (grade === "S2" ? "直接表达可能因关系和地区改变语气强度，请母语教师终审。" : ""),
        contentReviewStatus: "native-review-pending",
        romanToneStatus: hasToneMarks ? "editorial-unverified" : "pending-native-review",
        romanToneReviewed: false,
        speakerForms,
        speakerFormStatus: speakerForms ? "female-and-male-native-review-pending" : "not-applicable",
        audit: AUDIT
      };
      })
    };
  });

  function normalizedGrade(grade) {
    const key = String(grade || "").toUpperCase();
    return LEVELS[key] ? key : "S4";
  }

  function selectSpeakerForm(variant, speakerProfile = "source") {
    if (!variant || speakerProfile === "source" || !variant.speakerForms) return variant;
    const profile = String(speakerProfile || "").toLowerCase();
    const selected = variant.speakerForms[profile];
    if (!selected) return variant;
    return {
      ...variant,
      th: selected.th,
      ro: selected.ro,
      thReading: selected.thReading || null,
      speakerProfile: profile,
      sourceVariantId: variant.id,
      contentReviewStatus: selected.contentReviewStatus,
      romanToneStatus: selected.romanToneStatus,
      romanToneReviewed: selected.romanToneReviewed
    };
  }

  function getVariant(intentId, grade, speakerProfile = "source") {
    const item = PACK.find((entry) => entry.id === intentId);
    const variant = item ? item.variants.find((candidate) => candidate.grade === normalizedGrade(grade)) || null : null;
    return selectSpeakerForm(variant, speakerProfile);
  }

  function asLine(variant) {
    if (!variant) return null;
    return { zh: variant.zh, py: variant.py, th: variant.th, ro: variant.ro };
  }

  function buildRoute(grade, speakerProfile = "source") {
    const key = normalizedGrade(grade);
    const spec = ROUTE_SPECS[key];
    return {
      id: spec.id,
      grade: key,
      sceneId: spec.sceneId,
      titleZh: spec.titleZh,
      titleTh: spec.titleTh,
      goalZh: spec.goalZh,
      goalTh: spec.goalTh,
      safetyZh: spec.safetyZh,
      safetyTh: spec.safetyTh,
      followMode: LEVELS[key].followMode,
      steps: spec.steps.map(([id, intentId, npcZh, npcTh], index) => {
        const selected = getVariant(intentId, key, speakerProfile);
        return {
          id,
          index: index + 1,
          intentId,
          meaningId: `register:${intentId}`,
          activity: key === "S1" ? "guided-deescalation" : (key === "S2" ? "guided-direct-response" : "guided-response"),
          npc: { zh: npcZh, th: npcTh },
          answer: asLine(selected),
          answerRole: "learner-response",
          safeAnswer: null,
          feedbackZh: key === "S1"
            ? `${selected.noteZh} 先稳住局面，再明确边界或安全退出。`
            : (key === "S2" ? `${selected.noteZh} 保留重点，同时确认没有针对个人。` : selected.noteZh),
          feedbackTh: key === "S1"
            ? `${selected.noteTh} ตั้งสติก่อน แล้วบอกขอบเขตหรือถอนตัวอย่างปลอดภัย`
            : (key === "S2" ? `${selected.noteTh} คงประเด็นสำคัญไว้และตรวจว่าไม่ได้พาดพิงตัวบุคคล` : selected.noteTh),
          followMode: LEVELS[key].followMode,
          nativeReview: selected.nativeReview
        };
      })
    };
  }

  function getPracticePool(grade, category = "", speakerProfile = "source") {
    const key = normalizedGrade(grade);
    return PACK
      .filter((entry) => !category || entry.cat === category)
      .map((entry) => ({
        id: entry.id,
        cat: entry.cat,
        grade: key,
        intentZh: entry.intentZh,
        intentTh: entry.intentTh,
        contextZh: entry.contextZh,
        contextTh: entry.contextTh,
        decisionContext: entry.decisionContext,
        contextComplete: entry.contextComplete,
        recommendedGrade: entry.recommendedGrade,
        recommendedVariantId: entry.recommendedVariantId,
        recommendedWhyZh: entry.recommendedWhyZh,
        recommendedWhyTh: entry.recommendedWhyTh,
        meaningId: entry.meaningId,
        variant: selectSpeakerForm(entry.variants.find((item) => item.grade === key), speakerProfile)
      }));
  }

  const GUIDE = {
    version: "register-guide-v13.0-20260904",
    defaultGrade: "S4",
    order: ["S5", "S4", "S3", "S2", "S1"],
    introZh: "先看关系和场合，再选择场景语气。档位描述说法和社会效果，不评价学习者本人。",
    introTh: "เลือกความสัมพันธ์และสถานการณ์ก่อน แล้วจึงเลือกระดับภาษา ระดับนี้ประเมินผลของถ้อยคำ ไม่ได้ตัดสินตัวผู้เรียน",
    classificationPolicy: {
      contextRequired: true,
      noContextResult: "insufficient-context-no-unique-grade",
      safeRecommendationGrades: ["S5", "S4", "S3", "S2", "S1"],
      explanationZh: "缺少人物关系或具体场景时，只能描述语言特征，不判唯一合适档位。",
      explanationTh: "หากไม่มีความสัมพันธ์ของผู้พูดและสถานการณ์ จะอธิบายได้เพียงลักษณะภาษา แต่ไม่ตัดสินระดับที่เหมาะสมเพียงระดับเดียว"
    },
    speakerFormPolicy: SPEAKER_FORM_POLICY,
    scenarios: SCENARIOS,
    levels: Object.fromEntries(Object.keys(LEVELS).map((grade) => [grade, {
      ...LEVELS[grade],
      route: buildRoute(grade),
      practicePool: getPracticePool(grade),
      gamePolicy: grade === "S1"
        ? { allowSpeak: true, allowed: ["meaning-match", "deescalation-roleplay", "safe-exit"] }
        : (grade === "S2"
          ? { allowSpeak: true, allowed: ["tone-compare", "direct-roleplay", "clarity-check"] }
          : { allowSpeak: true, allowed: ["meaning-match", "listen-pick", "guided-response"] })
    }])),
    getLevel: (grade) => LEVELS[normalizedGrade(grade)],
    getRoute: (grade, speakerProfile = "source") => buildRoute(grade, speakerProfile),
    getVariant,
    getVariantForSpeaker: (intentId, grade, speakerProfile) => getVariant(intentId, grade, speakerProfile),
    getPracticePool
  };

  window.HUILAISHI_REGISTER_PACK = PACK;
  window.HUILAISHI_REGISTER_GUIDE = GUIDE;
})();
