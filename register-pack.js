/* 会来事 V11 · S5—S1 双向语气训练包
 * “素质等级”只评价一句话在具体关系与场合中的社会效果，不评价说话者本人。
 * 五档边界被写进 LEVELS 元数据，界面、游戏和校验脚本应共用这一份定义。
 * S2 允许生硬命令、催促或挖苦，但不得出现粗口或人格攻击；S1 才包含明确粗口/辱骂。
 * S2 允许在引导下做边界对比跟说并同步学习 S4 改写；S1 只做冲突识别，禁止跟读。
 * 两档都不收录针对受保护群体的仇恨词。
 */
(function () {
  "use strict";

  const LEVELS = {
    S5: {
      rank: 5, labelZh: "正式体面", labelTh: "สุภาพเป็นทางการ", risk: "safe", recommended: true,
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
      rank: 4, labelZh: "日常礼貌", labelTh: "สุภาพในชีวิตประจำวัน", risk: "safe", recommended: true,
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
      rank: 3, labelZh: "熟人随口", labelTh: "กันเองกับคนสนิท", risk: "situational", recommended: true,
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
      rank: 2, labelZh: "冲硬冒犯", labelTh: "ห้วนและเสี่ยงลบหลู่", risk: "high", recommended: false,
      purposeZh: "识别命令、不耐烦和挖苦，并学会把它降级成不伤人的边界表达。",
      purposeTh: "แยกแยะคำสั่ง ความรำคาญ และคำประชด พร้อมฝึกปรับให้เป็นการตั้งขอบเขตที่ไม่ทำร้ายผู้อื่น",
      boundaryZh: "生硬命令、催促、指责或挖苦；没有粗口和人格辱骂，但陌生人仍会明显感到被冒犯。",
      boundaryTh: "เป็นคำสั่ง การเร่ง การตำหนิ หรือการประชดแบบห้วน ๆ ไม่มีคำหยาบหรือการด่าตัวบุคคล แต่ยังทำให้คนแปลกหน้ารู้สึกถูกลบหลู่ได้ชัดเจน",
      audienceZh: "熟人边界冲突 / 戏剧练习 / 同步学习 S4 降级句",
      audienceTh: "ข้อขัดแย้งเรื่องขอบเขตกับคนสนิท / ฝึกบทบาท / เรียนประโยค S4 ควบคู่กัน",
      useWhenZh: ["识别边界冲突", "听懂对方的不耐烦", "练习改写成 S4"],
      useWhenTh: ["แยกแยะเหตุขัดแย้งเรื่องขอบเขต", "ฟังความไม่พอใจให้ออก", "ฝึกปรับประโยคเป็น S4"],
      tabooZh: ["不得出现粗口", "不得攻击智力、外貌、身份或人格", "不建议对真人照说"],
      tabooTh: ["ห้ามมีคำหยาบ", "ห้ามโจมตีสติปัญญา รูปลักษณ์ อัตลักษณ์ หรือตัวบุคคล", "ไม่แนะนำให้พูดตามกับคนจริง"],
      firstTaskZh: "对比跟说三句冲硬边界话，并把其中一句改写成 S4。",
      firstTaskTh: "ฝึกพูดประโยคตั้งขอบเขตแบบห้วนสามประโยคโดยเทียบกับ S4 แล้วปรับหนึ่งประโยคให้เป็น S4",
      followMode: "guided-boundary-output"
    },
    S1: {
      rank: 1, labelZh: "粗口辱骂", labelTh: "หยาบคายและด่าตรง ๆ", risk: "extreme", recommended: false,
      purposeZh: "只训练听懂粗口、粗鲁人称和人格攻击，并能立刻选择安全退出或降级回应。",
      purposeTh: "ฝึกเพื่อฟังคำหยาบ สรรพนามหยาบ และการด่าตัวบุคคลให้เข้าใจ แล้วเลือกถอนตัวหรือตอบเพื่อลดความขัดแย้ง",
      boundaryZh: "出现粗口、粗鲁代词、驱赶或人格攻击；只用于听懂冲突与影视台词，绝不对真人使用。",
      boundaryTh: "มีคำหยาบ สรรพนามหยาบ การไล่ หรือการด่าตัวบุคคล ใช้เพื่อฟังให้รู้ทันในเหตุขัดแย้งหรือสื่อเท่านั้น ห้ามใช้กับคนจริง",
      audienceZh: "冲突识别 / 影视理解 / 反诈防坑",
      audienceTh: "แยกแยะเหตุขัดแย้ง / เข้าใจสื่อ / รู้ทันการหลอกลวง",
      useWhenZh: ["影视与直播理解", "遭遇冲突时识别危险", "识别后改用 S4 回应或退出"],
      useWhenTh: ["เข้าใจภาษาในสื่อหรือไลฟ์", "ประเมินความเสี่ยงเมื่อเกิดการปะทะ", "ตอบแบบ S4 หรือถอนตัวหลังฟังออก"],
      tabooZh: ["禁止跟读任务", "禁止对真人使用", "不以可爱声音弱化风险", "不收录仇恨或受保护群体攻击"],
      tabooTh: ["ห้ามทำเป็นแบบฝึกพูดตาม", "ห้ามใช้กับคนจริง", "เสียงน่ารักไม่ได้ลดความรุนแรง", "ไม่รวมคำเกลียดชังกลุ่มที่ได้รับการคุ้มครอง"],
      firstTaskZh: "听懂一句粗口，指出攻击点，再选择一条 S4 化解回应。",
      firstTaskTh: "ฟังประโยคหยาบ ระบุจุดที่เป็นการด่า แล้วเลือกคำตอบ S4 เพื่อลดความขัดแย้ง",
      followMode: "recognition-only",
      delivery: {
        persona: "adult-soft-cute-role-contrast",
        directionZh: "成年女性角色音：软、甜、清楚、像可爱角色随口说；不吼、不凶、不故意演狠。它不是标准发音示范，内容仍然极其冒犯。",
        directionTh: "เสียงตัวละครผู้หญิงผู้ใหญ่ นุ่ม หวาน น่ารัก และชัดเจน ไม่ตะคอกหรือดุดัน เสียงนี้ไม่ใช่ต้นแบบการออกเสียง และเนื้อหายังหยาบคายรุนแรง",
        angry: false,
        contrast: true
      }
    }
  };

  const NOTES = Object.fromEntries(Object.entries(LEVELS).map(([grade, level]) => [grade, [
    `${level.boundaryZh}${grade === "S2" ? " 仅在引导的边界演练中对比跟说，并同步学习 S4 降级句。" : ""}${grade === "S1" ? " 仅建议用于识别；成年角色软萌声线不是标准发音示范，也不会降低冒犯性。" : ""}`,
    `${level.boundaryTh}${grade === "S2" ? " ฝึกพูดเปรียบเทียบได้เฉพาะแบบฝึกตั้งขอบเขต และต้องเรียนประโยค S4 ควบคู่กัน" : ""}${grade === "S1" ? " ใช้เพื่อแยกแยะเท่านั้น เสียงตัวละครผู้ใหญ่แบบน่ารักไม่ใช่ต้นแบบการออกเสียงและไม่ได้ทำให้ความหยาบคายลดลง" : ""}`
  ]]));

  // Variant row: [grade, Chinese, pinyin, Thai, Thai romanization, optional Chinese note, optional Thai note]
  const RAW = [
    ["repeat","social","请对方再说一遍","ขอให้อีกฝ่ายพูดซ้ำ","没听清对方的话","ฟังอีกฝ่ายไม่ชัด",[
      ["S5","劳驾，您可以再说一遍吗？","láojià, nín kěyǐ zài shuō yí biàn ma?","รบกวนช่วยพูดอีกครั้งได้ไหมคะ","ropkuan chuai phut ik khrang dai mai kha"],
      ["S4","麻烦再说一遍，可以吗？","máfan zài shuō yí biàn, kěyǐ ma?","ช่วยพูดอีกครั้งได้ไหมคะ","chuai phut ik khrang dai mai kha"],
      ["S3","再说一遍呗。","zài shuō yí biàn bei.","พูดอีกทีได้ไหม","phut ik thi dai mai"],
      ["S2","再说一遍，说清楚点儿。","zài shuō yí biàn, shuō qīngchu diǎnr.","พูดใหม่อีกทีให้ชัด ๆ หน่อยดิ","phut mai ik thi hai chat chat noi di"],
      ["S1","你他妈再说一遍，说清楚点！","nǐ tā mā zài shuō yí biàn, shuō qīngchu diǎn!","มึงพูดใหม่อีกทีให้รู้เรื่องหน่อยสิวะ!","mueng phut mai ik thi hai ru rueang noi si wa!"]
    ]],
    ["make-way","travel","请人让路","ขอทาง","通道被挡住","มีคนขวางทาง",[
      ["S5","不好意思，能请您让一下吗？","bù hǎoyìsi, néng qǐng nín ràng yíxià ma?","ขอโทษค่ะ รบกวนขอทางหน่อยนะคะ","kho thot kha, ropkuan kho thang noi na kha"],
      ["S4","麻烦让一下，谢谢。","máfan ràng yíxià, xièxie.","ขอทางหน่อยค่ะ ขอบคุณค่ะ","kho thang noi kha, khopkhun kha"],
      ["S3","借过一下。","jièguò yíxià.","ขอทางหน่อย","kho thang noi"],
      ["S2","让开点儿。","ràngkāi diǎnr.","หลบไปหน่อย","lop pai noi"],
      ["S1","滚开，别他妈挡路！","gǔnkāi, bié tā mā dǎnglù!","ไสหัวไป อย่ามาขวางทางกู!","sai hua pai, ya ma khwang thang ku!"]
    ]],
    ["hurry","daily","请对方快一点","ขอให้อีกฝ่ายเร็วขึ้น","时间很紧","เวลากระชั้น",[
      ["S5","时间有些紧，方便稍微快一点吗？","shíjiān yǒuxiē jǐn, fāngbiàn shāowēi kuài yìdiǎn ma?","เวลาค่อนข้างกระชั้น รบกวนช่วยรีบอีกนิดได้ไหมคะ","wela khonkhang krachan, ropkuan chuai rip ik nit dai mai kha"],
      ["S4","麻烦快一点，谢谢。","máfan kuài yìdiǎn, xièxie.","ช่วยรีบหน่อยได้ไหมคะ ขอบคุณค่ะ","chuai rip noi dai mai kha, khopkhun kha"],
      ["S3","快点儿吧。","kuài diǎnr ba.","เร็วหน่อยนะ","reo noi na"],
      ["S2","磨蹭什么，快点！","móceng shénme, kuài diǎn!","มัวชักช้าอะไรอยู่ เร็วเข้า!","mua chakcha arai yu, reo khao!"],
      ["S1","你他妈快点，磨蹭个屁！","nǐ tā mā kuài diǎn, móceng ge pì!","มึงรีบหน่อยสิวะ มัวชักช้าห่าอะไรอยู่!","mueng rip noi si wa, mua chakcha ha arai yu!"]
    ]],
    ["quiet","social","请对方小声","ขอให้อีกฝ่ายเบาเสียง","公共空间太吵","สถานที่สาธารณะเสียงดัง",[
      ["S5","不好意思，可以稍微小声一点吗？","bù hǎoyìsi, kěyǐ shāowēi xiǎoshēng yìdiǎn ma?","ขอโทษค่ะ รบกวนเบาเสียงลงหน่อยได้ไหมคะ","kho thot kha, ropkuan bao siang long noi dai mai kha"],
      ["S4","麻烦小声一点。","máfan xiǎoshēng yìdiǎn.","ช่วยเบาเสียงหน่อยค่ะ","chuai bao siang noi kha"],
      ["S3","小声点儿。","xiǎoshēng diǎnr.","เบาเสียงหน่อย","bao siang noi"],
      ["S2","太吵了，小声点。","tài chǎo le, xiǎoshēng diǎn.","เสียงดังเกินไป เบาเสียงหน่อย","siang dang koen pai, bao siang noi"],
      ["S1","闭嘴！他妈的吵死了，烦死了！","bìzuǐ! tā mā de chǎo sǐ le, fán sǐ le!","หุบปาก! เสียงดังฉิบหาย น่ารำคาญโว้ย!","hup pak! siang dang chip hai, na ramkhan woi!"]
    ]],
    ["boundaries","social","拒绝别人干涉","ปฏิเสธการก้าวก่าย","别人过度打听私事","อีกฝ่ายก้าวก่ายเรื่องส่วนตัว",[
      ["S5","谢谢关心，这件事我想自己处理。","xièxie guānxīn, zhè jiàn shì wǒ xiǎng zìjǐ chǔlǐ.","ขอบคุณที่เป็นห่วงนะคะ เรื่องนี้ดิฉันขอจัดการเองค่ะ","khopkhun thi pen huang na kha, rueang ni dichan kho chatkan eng kha"],
      ["S4","这件事我自己处理就好。","zhè jiàn shì wǒ zìjǐ chǔlǐ jiù hǎo.","เรื่องนี้ฉันจัดการเองได้ค่ะ","rueang ni chan chatkan eng dai kha"],
      ["S3","这事我自己来吧。","zhè shì wǒ zìjǐ lái ba.","เรื่องนี้ฉันจัดการเองนะ","rueang ni chan chatkan eng na"],
      ["S2","别管我的事。","bié guǎn wǒ de shì.","อย่ามายุ่งเรื่องของฉัน","ya ma yung rueang khong chan"],
      ["S1","关你屁事，少他妈多管闲事！","guān nǐ pì shì, shǎo tā mā duō guǎn xiánshì!","เสือกอะไรด้วย อย่ามายุ่งเรื่องของกู!","sueak arai duai, ya ma yung rueang khong ku!"]
    ]],
    ["leave-alone","social","请对方离开","ขอให้อีกฝ่ายออกไป","想暂时独处","อยากอยู่คนเดียวชั่วคราว",[
      ["S5","抱歉，我现在想一个人待一会儿。","bàoqiàn, wǒ xiànzài xiǎng yí ge rén dāi yíhuìr.","ขอโทษค่ะ ตอนนี้ดิฉันขออยู่คนเดียวสักพักนะคะ","kho thot kha, ton ni dichan kho yu khon diao sak phak na kha"],
      ["S4","能让我安静一会儿吗？","néng ràng wǒ ānjìng yíhuìr ma?","ขออยู่เงียบ ๆ คนเดียวสักครู่ได้ไหมคะ","kho yu ngiap ngiap khon diao sak khru dai mai kha"],
      ["S3","让我自己待会儿吧。","ràng wǒ zìjǐ dāi huìr ba.","ขออยู่คนเดียวแป๊บนะ","kho yu khon diao paep na"],
      ["S2","走开，别烦我。","zǒukāi, bié fán wǒ.","ไปไกล ๆ หน่อย อย่ามากวน","pai klai klai noi, ya ma kuan"],
      ["S1","滚！别他妈来烦我！","gǔn! bié tā mā lái fán wǒ!","ไสหัวไป! อย่ามาเสือกยุ่งกับกู!","sai hua pai! ya ma sueak yung kap ku!"]
    ]],
    ["mistake","work","指出错误","ชี้ข้อผิดพลาด","共同检查一处问题","ตรวจปัญหาร่วมกัน",[
      ["S5","这里似乎有个问题，我们一起确认一下好吗？","zhèlǐ sìhū yǒu ge wèntí, wǒmen yìqǐ quèrèn yíxià hǎo ma?","ตรงนี้ดูเหมือนจะมีปัญหา เรามาช่วยกันตรวจสอบอีกครั้งดีไหมคะ","trong ni du muean cha mi panha, rao ma chuai kan truatsop ik khrang di mai kha"],
      ["S4","这里可能做错了，请再检查一下。","zhèlǐ kěnéng zuò cuò le, qǐng zài jiǎnchá yíxià.","ตรงนี้อาจผิด ช่วยตรวจอีกครั้งนะคะ","trong ni at phit, chuai truat ik khrang na kha"],
      ["S3","这里好像弄错了。","zhèlǐ hǎoxiàng nòng cuò le.","ตรงนี้เหมือนจะผิดนะ","trong ni muean cha phit na"],
      ["S2","这里做错了，重新检查。","zhèlǐ zuò cuò le, chóngxīn jiǎnchá.","ตรงนี้ทำผิด ตรวจใหม่","trong ni tham phit, truat mai"],
      ["S1","你是不是傻，这都能做错？","nǐ shì bu shì shǎ, zhè dōu néng zuò cuò?","มึงโง่หรือไง แค่นี้ยังทำผิด!","mueng ngo rue ngai, khae ni yang tham phit!"]
    ]],
    ["decline","social","拒绝邀请","ปฏิเสธคำชวน","无法参加活动","ไปร่วมกิจกรรมไม่ได้",[
      ["S5","谢谢邀请，不过这次我恐怕没办法参加。","xièxie yāoqǐng, búguò zhè cì wǒ kǒngpà méi bànfǎ cānjiā.","ขอบคุณที่ชวนนะคะ แต่ครั้งนี้ดิฉันคงไปร่วมไม่ได้ค่ะ","khopkhun thi chuan na kha, tae khrang ni dichan khong pai ruam mai dai kha"],
      ["S4","不好意思，这次我去不了。","bù hǎoyìsi, zhè cì wǒ qù bu liǎo.","ขอโทษค่ะ ครั้งนี้ฉันไปไม่ได้ค่ะ","kho thot kha, khrang ni chan pai mai dai kha"],
      ["S3","这次不去了，下次吧。","zhè cì bú qù le, xià cì ba.","ครั้งนี้ไม่ไปนะ ไว้คราวหน้า","khrang ni mai pai na, wai khrao na"],
      ["S2","不去，别再问了。","bú qù, bié zài wèn le.","ไม่ไป เลิกถามสักที","mai pai, loek tham sak thi"],
      ["S1","他妈的，烦不烦？说了不去，滚！","tā mā de, fán bu fán? shuō le bú qù, gǔn!","แม่งน่ารำคาญ บอกว่าไม่ไปก็ไม่ไป ไสหัวไป!","maeng na ramkhan, bok wa mai pai ko mai pai, sai hua pai!"]
    ]],
    ["wait","work","请对方等待","ขอให้อีกฝ่ายรอ","正在处理事情","กำลังจัดการเรื่องหนึ่ง",[
      ["S5","劳驾，请稍等片刻，我马上处理。","láojià, qǐng shāo děng piànkè, wǒ mǎshàng chǔlǐ.","รบกวนรอสักครู่นะคะ ดิฉันจะรีบจัดการให้ค่ะ","ropkuan ro sak khru na kha, dichan cha rip chatkan hai kha"],
      ["S4","请稍等一下。","qǐng shāo děng yíxià.","รอสักครู่นะคะ","ro sak khru na kha"],
      ["S3","等我一下。","děng wǒ yíxià.","รอแป๊บนะ","ro paep na"],
      ["S2","等着，别催。","děngzhe, bié cuī.","รอไปก่อน อย่าเร่ง","ro pai kon, ya reng"],
      ["S1","催个屁，给我等着！","cuī ge pì, gěi wǒ děngzhe!","จะเร่งห่าอะไร รอไปสิวะ!","cha reng ha arai, ro pai si wa!"]
    ]],
    ["repay","shopping","催还借款","ทวงเงินที่ยืม","借款逾期未还","เงินยืมยังไม่ได้คืน",[
      ["S5","方便的话，请问您预计什么时候还款？","fāngbiàn de huà, qǐngwèn nín yùjì shénme shíhou huánkuǎn?","หากสะดวก ไม่ทราบว่าคาดว่าจะคืนเงินได้ประมาณเมื่อไรคะ","hak saduak, mai sap wa khat wa cha khuen ngoen dai praman muearai kha"],
      ["S4","请问什么时候可以还钱？","qǐngwèn shénme shíhou kěyǐ huán qián?","ขอถามหน่อยนะคะว่าจะคืนเงินเมื่อไร","kho tham noi na kha wa cha khuen ngoen muearai"],
      ["S3","钱什么时候还我？","qián shénme shíhou huán wǒ?","เมื่อไรจะคืนเงินให้ฉัน","muearai cha khuen ngoen hai chan"],
      ["S2","赶紧把钱还我。","gǎnjǐn bǎ qián huán wǒ.","รีบคืนเงินมาได้แล้ว","rip khuen ngoen ma dai laeo"],
      ["S1","欠钱不还，你他妈要不要脸？","qiàn qián bù huán, nǐ tā mā yào bu yào liǎn?","ติดหนี้แล้วไม่คืน มึงหน้าด้านฉิบหาย!","tit ni laeo mai khuen, mueng na dan chip hai!"]
    ]],
    ["dont-touch","daily","制止别人碰物品","ห้ามแตะของ","私人物品被碰","มีคนแตะของส่วนตัว",[
      ["S5","不好意思，请不要碰我的东西。","bù hǎoyìsi, qǐng bú yào pèng wǒ de dōngxi.","ขอโทษค่ะ กรุณาอย่าแตะต้องสิ่งของของดิฉันนะคะ","kho thot kha, karuna ya tae tong singkhong khong dichan na kha"],
      ["S4","麻烦别动我的东西。","máfan bié dòng wǒ de dōngxi.","ช่วยอย่าแตะของฉันนะคะ","chuai ya tae khong chan na kha"],
      ["S3","别动我的东西啊。","bié dòng wǒ de dōngxi a.","อย่าแตะของฉันนะ","ya tae khong chan na"],
      ["S2","手拿开，别乱碰。","shǒu nákāi, bié luàn pèng.","เอามือออกไป อย่ามาแตะมั่ว ๆ","ao mue ok pai, ya ma tae mua mua"],
      ["S1","把你的脏手拿开，别他妈乱碰！","bǎ nǐ de zāng shǒu nákāi, bié tā mā luàn pèng!","เอามือสกปรกของมึงออกไป อย่ามาเสือกแตะของกู!","ao mue sokkaprok khong mueng ok pai, ya ma sueak tae khong ku!"]
    ]],
    ["too-expensive","shopping","认为价格太高","เห็นว่าราคาแพงเกินไป","与卖家谈价格","ต่อรองราคากับผู้ขาย",[
      ["S5","这个价格超出预算，方便再优惠一些吗？","zhè ge jiàgé chāochū yùsuàn, fāngbiàn zài yōuhuì yìxiē ma?","ราคานี้เกินงบไปหน่อย พอจะลดให้อีกได้ไหมคะ","rakha ni koen ngop pai noi, pho cha lot hai ik dai mai kha"],
      ["S4","有点贵，可以便宜一点吗？","yǒudiǎn guì, kěyǐ piányi yìdiǎn ma?","แพงไปนิด ลดได้ไหมคะ","phaeng pai nit, lot dai mai kha"],
      ["S3","有点贵，便宜点儿吧。","yǒudiǎn guì, piányi diǎnr ba.","แพงไปหน่อย ลดให้หน่อยสิ","phaeng pai noi, lot hai noi si"],
      ["S2","太贵了，这个价我不买。","tài guì le, zhège jià wǒ bù mǎi.","แพงเกิน ราคานี้ฉันไม่ซื้อ","phaeng koen, rakha ni chan mai sue"],
      ["S1","卖这么贵，你他妈抢钱啊？","mài zhème guì, nǐ tā mā qiǎng qián a?","มึงขายแพงฉิบหาย จะปล้นกันหรือไงวะ!","mueng khai phaeng chip hai, cha plon kan rue ngai wa!"]
    ]],
    ["late","social","指出对方迟到","บอกว่าอีกฝ่ายมาสาย","等了对方很久","รออีกฝ่ายมานาน",[
      ["S5","我等了一段时间，希望下次能提前告知。","wǒ děng le yí duàn shíjiān, xīwàng xià cì néng tíqián gàozhī.","ดิฉันรอมาสักพักแล้ว ครั้งหน้ารบกวนแจ้งล่วงหน้าด้วยนะคะ","dichan ro ma sak phak laeo, khrang na ropkuan chaeng luangna duai na kha"],
      ["S4","你迟到了，下次请提前说一声。","nǐ chídào le, xià cì qǐng tíqián shuō yì shēng.","คุณมาสายนะคะ ครั้งหน้าช่วยบอกล่วงหน้าด้วยค่ะ","khun ma sai na kha, khrang na chuai bok luangna duai kha"],
      ["S3","你怎么才来？","nǐ zěnme cái lái?","ทำไมเพิ่งมา","thammai phoeng ma"],
      ["S2","又迟到了，别再让我等。","yòu chídào le, bié zài ràng wǒ děng.","มาสายอีกแล้ว อย่าให้ฉันต้องรออีก","ma sai ik laeo, ya hai chan tong ro ik"],
      ["S1","你他妈又迟到，真他妈不靠谱！","nǐ tā mā yòu chídào, zhēn tā mā bù kàopǔ!","มึงมาสายอีกแล้ว แม่งโคตรไม่น่าไว้ใจ!","mueng ma sai ik laeo, maeng khot mai na wai chai!"]
    ]],
    ["drive-slower","travel","请司机慢一点","ขอให้คนขับช้าลง","车速让人不安","ความเร็วทำให้กังวล",[
      ["S5","请注意安全，能稍微慢一点吗？","qǐng zhùyì ānquán, néng shāowēi màn yìdiǎn ma?","ช่วยขับอย่างระมัดระวังและช้าลงหน่อยได้ไหมคะ","chuai khap yang ramatrawang lae cha long noi dai mai kha"],
      ["S4","麻烦开慢一点。","máfan kāi màn yìdiǎn.","ช่วยขับช้าลงหน่อยค่ะ","chuai khap cha long noi kha"],
      ["S3","慢点开啊。","màn diǎn kāi a.","ขับช้าหน่อย","khap cha noi"],
      ["S2","开慢点，太危险了！","kāi màn diǎn, tài wēixiǎn le!","ขับช้าลงหน่อย มันอันตราย!","khap cha long noi, man antarai!"],
      ["S1","你他妈会不会开车，蠢死了！","nǐ tā mā huì bu huì kāichē, chǔn sǐ le!","มึงขับรถเป็นไหมวะ โง่ฉิบหาย!","mueng khap rot pen mai wa, ngo chip hai!"]
    ]],
    ["queue","shopping","制止插队","ห้ามแซงคิว","有人插到队伍前面","มีคนแซงคิว",[
      ["S5","不好意思，这里需要排队，队尾在那边。","bù hǎoyìsi, zhèlǐ xūyào páiduì, duìwěi zài nàbian.","ขอโทษค่ะ ตรงนี้ต้องต่อคิว ปลายแถวอยู่ทางนั้นค่ะ","kho thot kha, trong ni tong to khio, plai thaeo yu thang nan kha"],
      ["S4","麻烦排一下队，谢谢。","máfan pái yíxià duì, xièxie.","ช่วยต่อคิวด้วยนะคะ ขอบคุณค่ะ","chuai to khio duai na kha, khopkhun kha"],
      ["S3","去后面排队吧。","qù hòumiàn páiduì ba.","ไปต่อแถวข้างหลังนะ","pai to thaeo khang lang na"],
      ["S2","别插队，后面去。","bié chāduì, hòumiàn qù.","อย่าแซงคิว ไปต่อข้างหลัง","ya saeng khio, pai to khang lang"],
      ["S1","插什么队？滚后面去！","chā shénme duì? gǔn hòumiàn qù!","จะแซงคิวทำไมวะ ไสหัวไปต่อข้างหลัง!","cha saeng khio thammai wa, sai hua pai to khang lang!"]
    ]],
    ["disagree","work","表达不同意见","แสดงความเห็นต่าง","讨论中意见不同","ความเห็นไม่ตรงกันระหว่างหารือ",[
      ["S5","我理解你的看法，不过我有不同意见。","wǒ lǐjiě nǐ de kànfǎ, búguò wǒ yǒu bùtóng yìjiàn.","ดิฉันเข้าใจมุมมองของคุณ แต่ดิฉันมีความเห็นต่างค่ะ","dichan khaochai mummong khong khun, tae dichan mi khwamhen tang kha"],
      ["S4","我不太同意，我们再讨论一下吧。","wǒ bú tài tóngyì, wǒmen zài tǎolùn yíxià ba.","ฉันไม่ค่อยเห็นด้วย ลองคุยกันอีกทีนะคะ","chan mai khoi hen duai, long khui kan ik thi na kha"],
      ["S3","我觉得不是这样。","wǒ juéde bú shì zhèyàng.","ฉันว่าไม่ใช่แบบนั้นนะ","chan wa mai chai baep nan na"],
      ["S2","这说法不对，别再说了。","zhè shuōfǎ bú duì, bié zài shuō le.","ที่พูดมานี่ไม่ถูก เลิกพูดได้แล้ว","thi phut ma ni mai thuk, loek phut dai laeo"],
      ["S1","你懂个屁，别他妈瞎说！","nǐ dǒng ge pì, bié tā mā xiāshuō!","มึงรู้อะไรบ้างวะ อย่าเสือกพูดมั่ว!","mueng ru arai bang wa, ya sueak phut mua!"]
    ]],
    ["clean-up","daily","请对方收拾","ขอให้อีกฝ่ายเก็บของ","使用后留下杂物","ทิ้งของรกหลังใช้งาน",[
      ["S5","麻烦您用完后整理一下，谢谢。","máfan nín yòng wán hòu zhěnglǐ yíxià, xièxie.","รบกวนเก็บให้เรียบร้อยหลังใช้ด้วยนะคะ ขอบคุณค่ะ","ropkuan kep hai riaproi lang chai duai na kha, khopkhun kha"],
      ["S4","用完请收拾一下。","yòng wán qǐng shōushi yíxià.","ใช้เสร็จแล้วช่วยเก็บด้วยนะคะ","chai set laeo chuai kep duai na kha"],
      ["S3","用完记得收一下。","yòng wán jìde shōu yíxià.","ใช้แล้วเก็บด้วยนะ","chai laeo kep duai na"],
      ["S2","自己弄的，自己收拾。","zìjǐ nòng de, zìjǐ shōushi.","ทำเลอะเองก็เก็บเอง","tham loe eng ko kep eng"],
      ["S1","你他妈弄得跟猪窝一样，赶紧收拾！","nǐ tā mā nòng de gēn zhūwō yíyàng, gǎnjǐn shōushi!","มึงทำรกฉิบหาย เหมือนคอกหมูเลย รีบเก็บเดี๋ยวนี้!","mueng tham rok chip hai, muean khok mu loei, rip kep diao ni!"]
    ]],
    ["stop-messaging","social","请对方停止发消息","ขอให้อีกฝ่ายหยุดส่งข้อความ","暂时不想继续聊天","ยังไม่อยากคุยต่อ",[
      ["S5","谢谢联系，不过我暂时不方便继续聊天。","xièxie liánxì, búguò wǒ zànshí bù fāngbiàn jìxù liáotiān.","ขอบคุณที่ติดต่อมานะคะ แต่ตอนนี้ดิฉันไม่สะดวกคุยต่อค่ะ","khopkhun thi titto ma na kha, tae ton ni dichan mai saduak khui to kha"],
      ["S4","我现在不方便，请晚点再联系。","wǒ xiànzài bù fāngbiàn, qǐng wǎndiǎn zài liánxì.","ตอนนี้ฉันไม่สะดวก ไว้ค่อยติดต่อมาใหม่นะคะ","ton ni chan mai saduak, wai khoi titto ma mai na kha"],
      ["S3","先别发了，晚点聊。","xiān bié fā le, wǎndiǎn liáo.","ยังไม่ต้องส่งมานะ ไว้ค่อยคุย","yang mai tong song ma na, wai khoi khui"],
      ["S2","别再给我发消息了。","bié zài gěi wǒ fā xiāoxi le.","เลิกส่งข้อความมาหาฉันได้แล้ว","loek song khokhwam ma ha chan dai laeo"],
      ["S1","别他妈再发消息骚扰我，滚！","bié tā mā zài fā xiāoxi sāorǎo wǒ, gǔn!","อย่าเสือกส่งข้อความมากวนกูอีก ไสหัวไป!","ya sueak song khokhwam ma kuan ku ik, sai hua pai!"]
    ]],
    ["apology","social","要求对方道歉","ขอให้อีกฝ่ายขอโทษ","对方的行为造成影响","การกระทำของอีกฝ่ายส่งผลกระทบ",[
      ["S5","这件事让我受到影响，我希望能得到一个正式的道歉。","zhè jiàn shì ràng wǒ shòudào yǐngxiǎng, wǒ xīwàng néng dédào yí ge zhèngshì de dàoqiàn.","เรื่องนี้ส่งผลกระทบต่อดิฉัน ดิฉันอยากได้รับคำขอโทษอย่างเป็นทางการค่ะ","rueang ni song phonkrathop to dichan, dichan yak dai rap kham kho thot yang pen thangkan kha"],
      ["S4","这件事，希望你能向我道歉。","zhè jiàn shì, xīwàng nǐ néng xiàng wǒ dàoqiàn.","เรื่องนี้ฉันอยากให้คุณขอโทษนะคะ","rueang ni chan yak hai khun kho thot na kha"],
      ["S3","你得跟我说声对不起吧。","nǐ děi gēn wǒ shuō shēng duìbuqǐ ba.","ขอโทษฉันสักคำก็ดีนะ","kho thot chan sak kham ko di na"],
      ["S2","做错了还不道歉？","zuò cuò le hái bú dàoqiàn?","ทำผิดแล้วยังไม่ขอโทษอีกเหรอ","tham phit laeo yang mai kho thot ik roe"],
      ["S1","做错了还装不知道？赶紧他妈道歉！","zuò cuò le hái zhuāng bù zhīdào? gǎnjǐn tā mā dàoqiàn!","ทำผิดแล้วยังทำเป็นไม่รู้เรื่อง รีบขอโทษกูเดี๋ยวนี้สิวะ!","tham phit laeo yang tham pen mai ru rueang, rip kho thot ku diao ni si wa!"]
    ]],
    ["calm-down","social","让争吵暂停","หยุดการทะเลาะ","双方情绪激动","ทั้งสองฝ่ายกำลังอารมณ์ร้อน",[
      ["S5","我们都先冷静一下，晚些时候再谈好吗？","wǒmen dōu xiān lěngjìng yíxià, wǎnxiē shíhou zài tán hǎo ma?","เราสองคนใจเย็นกันก่อน แล้วค่อยกลับมาคุยกันได้ไหมคะ","rao song khon chai yen kan kon, laeo khoi klap ma khui kan dai mai kha"],
      ["S4","先冷静一下，我们等会儿再说。","xiān lěngjìng yíxià, wǒmen děnghuìr zài shuō.","ใจเย็นก่อนนะคะ แล้วค่อยคุยกัน","chai yen kon na kha, laeo khoi khui kan"],
      ["S3","先别吵了，冷静一下。","xiān bié chǎo le, lěngjìng yíxià.","หยุดเถียงก่อน ใจเย็น ๆ","yut thiang kon, chai yen yen"],
      ["S2","够了，别吵了。","gòu le, bié chǎo le.","พอได้แล้ว เลิกเถียงสักที","pho dai laeo, loek thiang sak thi"],
      ["S1","都他妈闭嘴，吵个屁！","dōu tā mā bìzuǐ, chǎo ge pì!","หุบปากกันให้หมด จะเถียงห่าอะไรกันวะ!","hup pak kan hai mot, cha thiang ha arai kan wa!"]
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
      "close", "peer", "overdue", "S3", "双方很熟且已逾期，可直接询问时间，但不需要挖苦或辱骂。", "เมื่อสนิทกันและเลยกำหนดแล้ว ถามเวลาได้ตรง ๆ โดยไม่ประชดหรือด่า"
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
      id: "route-s2-boundary-recognition", sceneId: "boundary-conflict",
      titleZh: "边界冲突：听懂冲硬，再降一级", titleTh: "ความขัดแย้งเรื่องขอบเขต: ฟังคำห้วนให้ออกแล้วปรับให้นุ่มลง",
      goalZh: "识别三种冲硬边界话，并对照 S4 改写。",
      goalTh: "แยกแยะประโยคตั้งขอบเขตแบบห้วนสามแบบ แล้วเทียบกับฉบับ S4",
      safetyZh: "可做对比跟说，但只用于熟人边界演练；S2 没有粗口或人格攻击，并始终给出 S4 降级句。",
      safetyTh: "ฝึกพูดเปรียบเทียบได้เฉพาะบทบาทเรื่องขอบเขตกับคนสนิท S2 ไม่มีคำหยาบหรือการด่าตัวบุคคล และมีประโยค S4 ให้ปรับลงเสมอ",
      steps: [
        ["protect-property", "dont-touch", "有人正在碰你的私人物品。", "มีคนกำลังแตะของส่วนตัวของคุณ"],
        ["stop-interference", "boundaries", "对方反复干涉你的私事。", "อีกฝ่ายก้าวก่ายเรื่องส่วนตัวซ้ำ ๆ"],
        ["stop-messages", "stop-messaging", "你已经说过暂时不想继续聊天。", "คุณบอกแล้วว่ายังไม่อยากคุยต่อ"]
      ]
    },
    S1: {
      id: "route-s1-recognize-and-defuse", sceneId: "conflict-recognition",
      titleZh: "粗口识别：听懂攻击，安全化解", titleTh: "รู้ทันคำหยาบ: ฟังจุดโจมตีให้ออกและลดความขัดแย้ง",
      goalZh: "听懂粗口或人格攻击，指出风险词，再选择 S4 化解句。",
      goalTh: "ฟังคำหยาบหรือการด่าตัวบุคคล ระบุคำเสี่ยง แล้วเลือกประโยค S4 เพื่อลดความขัดแย้ง",
      safetyZh: "禁止跟读、禁止对真人使用；成年角色软萌声线不是标准发音示范，也不会降低冒犯性。",
      safetyTh: "ห้ามพูดตามและห้ามใช้กับคนจริง เสียงตัวละครผู้ใหญ่แบบน่ารักไม่ใช่ต้นแบบการออกเสียงและไม่ได้ลดความรุนแรง",
      steps: [
        ["recognize-command", "repeat", "冲突中有人用粗口逼对方把话再说一遍。", "ระหว่างมีปากเสียง มีคนใช้คำหยาบบังคับให้อีกฝ่ายพูดซ้ำ"],
        ["recognize-insult", "mistake", "有人把工作错误升级成对智力的辱骂。", "มีคนเปลี่ยนจากการชี้ข้อผิดพลาดเป็นการด่าสติปัญญา"],
        ["recognize-degrading-comparison", "clean-up", "有人用粗口和贬低性比喻催别人收拾。", "มีคนใช้คำหยาบและคำเปรียบเทียบดูถูกเพื่อสั่งให้เก็บของ"]
      ]
    }
  };

  const AUDIT = {
    version: "register-v12.1-20260822",
    translationPair: "manual-bilingual-equivalence-audit",
    thaiRegister: "editorial-audit-pending-native-signoff",
    nativeSpeakerSignoff: "pending",
    romanToneSignoff: "pending",
    contentStatus: "editorial-draft-native-review-pending",
    scope: "20 intents x 5 grades; contextual recommendation; two-language meaning equivalence; S2/S1 boundary"
  };

  const SPEAKER_FORM_POLICY = {
    version: "thai-speaker-forms-v1-20260822",
    appliesToGrades: ["S5", "S4"],
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
        risk: grade === "S1" || grade === "S2",
        riskLevel: level.risk,
        recommended: level.recommended,
        followMode: level.followMode,
        delivery: level.delivery || null,
        warningZh: level.recommended ? "" : (grade === "S1" ? "极高冒犯风险：成年角色反差音仅用于识别，不是标准发音示范；禁止跟读或对真人使用。" : "高冒犯风险：仅限引导的边界演练，并同步学习 S4 降级句。"),
        warningTh: level.recommended ? "" : (grade === "S1" ? "เสี่ยงลบหลู่อย่างรุนแรง เสียงตัวละครผู้ใหญ่มีไว้เพื่อแยกแยะและไม่ใช่ต้นแบบการออกเสียง ห้ามพูดตามหรือใช้กับคนจริง" : "เสี่ยงลบหลู่ ฝึกพูดได้เฉพาะแบบฝึกตั้งขอบเขต และต้องเรียนประโยค S4 ควบคู่กัน"),
        nativeReview: grade === "S1" || (grade === "S2" && /ดิ|วะ|โว้ย|สิวะ|ห่า|เสือก|ไสหัว|มึง|กู/.test(th)),
        nativeReviewReason: grade === "S1"
          ? "高风险泰语：请母语教师终审粗口强度、地区差异、性别/关系适用性与罗马音。"
          : (grade === "S2" ? "口语语气词可能因关系和地区改变冒犯强度，请母语教师终审。" : ""),
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
        const safe = getVariant(intentId, "S4", speakerProfile);
        return {
          id,
          index: index + 1,
          intentId,
          meaningId: `register:${intentId}`,
          activity: key === "S1" ? "listen-identify-defuse" : (key === "S2" ? "listen-compare-speak" : "guided-response"),
          npc: { zh: npcZh, th: npcTh },
          answer: asLine(selected),
          answerRole: key === "S1" ? "recognition-source" : "learner-response",
          safeAnswer: key === "S1" || key === "S2" ? asLine(safe) : null,
          feedbackZh: key === "S1"
            ? `${selected.warningZh} 先识别攻击点，再选择下方 S4 化解句。`
            : (key === "S2" ? `${selected.noteZh} 对照 S4 改写，保留边界、去掉冲硬。` : selected.noteZh),
          feedbackTh: key === "S1"
            ? `${selected.warningTh} ให้ระบุจุดที่เป็นการด่า แล้วเลือกประโยค S4 ด้านล่าง`
            : (key === "S2" ? `${selected.noteTh} เทียบกับ S4 โดยคงขอบเขตไว้แต่ลดความห้วน` : selected.noteTh),
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
    version: "register-guide-v12.1-20260822",
    defaultGrade: "S4",
    order: ["S5", "S4", "S3", "S2", "S1"],
    introZh: "先选关系和场合，再选语气。档位评价表达的社会效果，不评价学习者本人。",
    introTh: "เลือกความสัมพันธ์และสถานการณ์ก่อน แล้วจึงเลือกระดับภาษา ระดับนี้ประเมินผลของถ้อยคำ ไม่ได้ตัดสินตัวผู้เรียน",
    classificationPolicy: {
      contextRequired: true,
      noContextResult: "insufficient-context-no-unique-grade",
      safeRecommendationGrades: ["S5", "S4", "S3"],
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
        ? { allowSpeak: false, allowed: ["meaning-match", "risk-spot", "safe-rewrite"], blocked: ["repeat-after-me"] }
        : (grade === "S2"
          ? { allowSpeak: true, allowed: ["tone-compare", "boundary-roleplay", "safe-rewrite"], requireSafeRewrite: true }
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
