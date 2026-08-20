/* 会来事 V7 · S5—S1 双向语气训练包
 * “素质等级”只评价一句话在具体关系与场合中的社会效果，不评价说话者本人。
 * 五档边界被写进 LEVELS 元数据，界面、游戏和校验脚本应共用这一份定义。
 * S2 允许生硬命令、催促或挖苦，但不得出现粗口或人格攻击；S1 才包含明确粗口/辱骂。
 * S1/S2 只用于听懂冲突、影视与反诈场景；不收录针对受保护群体的仇恨词。
 */
(function () {
  "use strict";

  const LEVELS = {
    S5: {
      rank: 5, labelZh: "正式体面", labelTh: "สุภาพเป็นทางการ", risk: "safe", recommended: true,
      boundaryZh: "有尊称、缓冲或给对方选择空间；适合陌生人、长辈、职场和正式服务场景。",
      boundaryTh: "มีคำให้เกียรติ คำเกริ่น หรือเปิดทางให้อีกฝ่ายเลือก เหมาะกับคนแปลกหน้า ผู้ใหญ่ ที่ทำงาน และงานบริการทางการ",
      audienceZh: "陌生人 / 长辈 / 职场 / 正式服务",
      audienceTh: "คนแปลกหน้า / ผู้ใหญ่ / ที่ทำงาน / งานบริการทางการ",
      followMode: "practice"
    },
    S4: {
      rank: 4, labelZh: "日常礼貌", labelTh: "สุภาพในชีวิตประจำวัน", risk: "safe", recommended: true,
      boundaryZh: "表达直接但保留请、谢谢或泰语礼貌句尾；是大多数日常场合的默认选择。",
      boundaryTh: "พูดตรงประเด็นแต่ยังมีคำขอ คำขอบคุณ หรือคำลงท้ายสุภาพ เป็นตัวเลือกหลักในชีวิตประจำวัน",
      audienceZh: "普通服务 / 同事 / 不太熟的人",
      audienceTh: "งานบริการทั่วไป / เพื่อนร่วมงาน / คนที่ยังไม่สนิท",
      followMode: "practice"
    },
    S3: {
      rank: 3, labelZh: "熟人随口", labelTh: "กันเองกับคนสนิท", risk: "situational", recommended: true,
      boundaryZh: "省略正式客套，但不命令、不挖苦、不贬低人；只适合熟人或平辈。",
      boundaryTh: "ลดคำทางการลง แต่ไม่สั่ง ไม่ประชด และไม่ดูถูก เหมาะกับเพื่อนหรือคนระดับเดียวกัน",
      audienceZh: "朋友 / 熟人 / 平辈",
      audienceTh: "เพื่อน / คนสนิท / คนระดับเดียวกัน",
      followMode: "practice-with-context"
    },
    S2: {
      rank: 2, labelZh: "冲硬冒犯", labelTh: "ห้วนและเสี่ยงลบหลู่", risk: "high", recommended: false,
      boundaryZh: "生硬命令、催促、指责或挖苦；没有粗口和人格辱骂，但陌生人仍会明显感到被冒犯。",
      boundaryTh: "เป็นคำสั่ง การเร่ง การตำหนิ หรือการประชดแบบห้วน ๆ ไม่มีคำหยาบหรือการด่าตัวบุคคล แต่ยังทำให้คนแปลกหน้ารู้สึกถูกลบหลู่ได้ชัดเจน",
      audienceZh: "只做语气识别，不建议跟说",
      audienceTh: "ใช้ฝึกแยกแยะน้ำเสียง ไม่แนะนำให้พูดตาม",
      followMode: "recognition-only"
    },
    S1: {
      rank: 1, labelZh: "粗口辱骂", labelTh: "หยาบคายและด่าตรง ๆ", risk: "extreme", recommended: false,
      boundaryZh: "出现粗口、粗鲁代词、驱赶或人格攻击；只用于听懂冲突与影视台词，绝不对真人使用。",
      boundaryTh: "มีคำหยาบ สรรพนามหยาบ การไล่ หรือการด่าตัวบุคคล ใช้เพื่อฟังให้รู้ทันในเหตุขัดแย้งหรือสื่อเท่านั้น ห้ามใช้กับคนจริง",
      audienceZh: "冲突识别 / 影视理解 / 反诈防坑",
      audienceTh: "แยกแยะเหตุขัดแย้ง / เข้าใจสื่อ / รู้ทันการหลอกลวง",
      followMode: "recognition-only",
      delivery: {
        persona: "soft-cute-girl-contrast",
        directionZh: "软、甜、清楚、像可爱女生随口说；不吼、不凶、不故意演狠。内容仍然极其冒犯。",
        directionTh: "เสียงผู้หญิงน่ารัก นุ่ม หวาน และชัดเจน เหมือนพูดลอย ๆ ไม่ตะคอก ไม่ดุดัน แต่เนื้อหายังหยาบคายรุนแรง",
        angry: false,
        contrast: true
      }
    }
  };

  const NOTES = Object.fromEntries(Object.entries(LEVELS).map(([grade, level]) => [grade, [
    `${level.boundaryZh}${level.recommended ? "" : " 仅建议用于识别。"}${grade === "S1" ? " 可爱女声不会降低冒犯性。" : ""}`,
    `${level.boundaryTh}${level.recommended ? "" : " แนะนำให้เรียนไว้เพื่อแยกแยะเท่านั้น"}${grade === "S1" ? " เสียงน่ารักไม่ได้ทำให้ความหยาบคายลดลง" : ""}`
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

  const AUDIT = {
    version: "register-v7.0-20260820",
    translationPair: "manual-bilingual-equivalence-audit",
    thaiRegister: "editorial-naturalness-audit",
    nativeSpeakerSignoff: "not-claimed"
  };

  window.HUILAISHI_REGISTER_LEVELS = LEVELS;
  window.HUILAISHI_REGISTER_PACK = RAW.map(([id, cat, intentZh, intentTh, contextZh, contextTh, rows]) => ({
    id,
    cat,
    intentZh,
    intentTh,
    contextZh,
    contextTh,
    meaningId: `register:${id}`,
    audit: AUDIT,
    variants: rows.map(([grade, zh, py, th, ro, noteZh, noteTh]) => {
      const level = LEVELS[grade];
      return {
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
        warningZh: level.recommended ? "" : (grade === "S1" ? "极高冒犯风险：仅用于识别，禁止对真人使用。" : "高冒犯风险：仅用于识别，不建议跟说。"),
        warningTh: level.recommended ? "" : (grade === "S1" ? "เสี่ยงลบหลู่อย่างรุนแรง ใช้เพื่อแยกแยะเท่านั้น ห้ามใช้กับคนจริง" : "เสี่ยงลบหลู่ ใช้เพื่อแยกแยะเท่านั้น ไม่แนะนำให้พูดตาม"),
        audit: AUDIT
      };
    })
  }));
})();
