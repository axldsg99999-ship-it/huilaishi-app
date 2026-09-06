/* 会来事 V6 · L4–L6 扩展词库（每级 250 条）
 * 读音约定：中文使用带声调拼音；泰语使用统一、便于中文母语者跟读的 RTGS 风格转写。
 * 原始行以 | 分隔：cat|pos|zh|py|th|ro|sentencePattern:objectKey
 * 例句由“语义句型 + 专属语境”组合生成，运行时每条均展开为完整 14 字段对象。
 */
(function () {
  "use strict";

  const cap = value => value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

  const OBJECTS = {
    handover: ["交接遗漏明显减少", "jiāojiē yílòu míngxiǎn jiǎnshǎo", "ข้อผิดพลาดในการส่งมอบงานลดลงอย่างเห็นได้ชัด", "kho phitphlat nai kan song mop ngan lot long yang hen dai chat"],
    attendance: ["参会人员提前准备", "cānhuì rényuán tíqián zhǔnbèi", "ผู้เข้าร่วมเตรียมตัวล่วงหน้า", "phukhao ruam triam tua luangna"],
    focus: ["讨论聚焦关键问题", "tǎolùn jùjiāo guānjiàn wèntí", "การหารือมุ่งที่ประเด็นสำคัญ", "kan harue mung thi praden samkhan"],
    action: ["会后行动落实", "huìhòu xíngdòng luòshí", "การลงมือทำหลังประชุมเกิดขึ้นจริง", "kan longmue tham lang prachum koet khuen ching"],
    ownership: ["责任归属清楚", "zérèn guīshǔ qīngchu", "ความรับผิดชอบชัดเจน", "khwam rapphitchop chatchen"],
    approval: ["审批过程可追踪", "shěnpī guòchéng kě zhuīzōng", "กระบวนการอนุมัติตรวจสอบย้อนหลังได้", "krabuan kan anumat truatsop yonlang dai"],
    archive: ["资料日后容易查找", "zīliào rìhòu róngyì cházhǎo", "ค้นหาเอกสารภายหลังได้ง่าย", "khonha ekasan phailang dai ngai"],
    version: ["团队使用正确版本", "tuánduì shǐyòng zhèngquè bǎnběn", "ทีมใช้ฉบับที่ถูกต้อง", "thim chai chabap thi thuktong"],
    trace: ["修改过程有据可查", "xiūgǎi guòchéng yǒujù kěchá", "ตรวจสอบประวัติการแก้ไขได้", "truatsop prawat kan kaekhai dai"],
    access: ["敏感资料不被误传", "mǐngǎn zīliào bú bèi wùchuán", "ข้อมูลอ่อนไหวไม่ถูกส่งต่อผิดคน", "khomun onwai mai thuk songto phit khon"],
    receipt: ["双方确认已经收件", "shuāngfāng quèrèn yǐjīng shōujiàn", "ทั้งสองฝ่ายยืนยันว่าได้รับเอกสารแล้ว", "thang song fai yuenyan wa dai rap ekasan laeo"],
    finance: ["财务处理符合流程", "cáiwù chǔlǐ fúhé liúchéng", "การเงินดำเนินการตามขั้นตอน", "kanngoen damnoenkan tam khanton"],
    stock: ["库存数量保持准确", "kùcún shùliàng bǎochí zhǔnquè", "จำนวนสินค้าคงคลังถูกต้อง", "chamnuan sinkha khongkhlang thuktong"],
    batch: ["产品来源可以追溯", "chǎnpǐn láiyuán kěyǐ zhuīsù", "ตรวจสอบย้อนกลับแหล่งที่มาของสินค้าได้", "truatsop yonklap laeng thima khong sinkha dai"],
    expiry: ["使用人员能够识别产品有效期限", "shǐyòng rényuán nénggòu shíbié chǎnpǐn yǒuxiào qīxiàn", "ผู้ใช้งานระบุอายุการใช้งานของผลิตภัณฑ์ได้", "phuchai ngan rabu ayu kan chai ngan khong phalitthaphan dai"],
    operation: ["使用人员按步骤操作", "shǐyòng rényuán àn bùzhòu cāozuò", "ผู้ใช้งานปฏิบัติตามขั้นตอน", "phuchai ngan patibat tam khanton"],
    service: ["服务请求及时处理", "fúwù qǐngqiú jíshí chǔlǐ", "คำขอบริการได้รับการจัดการทันเวลา", "kham kho borikan dai rap kan chatkan than wela"],
    escalation: ["严重问题迅速升级", "yánzhòng wèntí xùnsù shēngjí", "ปัญหาร้ายแรงถูกยกระดับอย่างรวดเร็ว", "panha raeng thuk yokradap yang ruatreo"],
    continuity: ["突发事件发生时关键业务仍能运行", "tūfā shìjiàn fāshēng shí guānjiàn yèwù réng néng yùnxíng", "งานสำคัญยังดำเนินได้เมื่อเกิดเหตุไม่คาดคิด", "ngan samkhan yang damnoen dai muea koet het mai khatkhit"],
    schedule: ["值班安排没有空缺", "zhíbān ānpái méiyǒu kòngquē", "ตารางเวรไม่มีช่วงว่าง", "tarang wen mai mi chuang wang"],
    scope: ["项目边界得到控制", "xiàngmù biānjiè dédào kòngzhì", "ขอบเขตโครงการอยู่ภายใต้การควบคุม", "khopkhet khrongkan yu phaitai kan khuapkhum"],
    milestone: ["团队掌握阶段成果", "tuánduì zhǎngwò jiēduàn chéngguǒ", "ทีมเห็นผลลัพธ์ของแต่ละระยะ", "thim hen phonlap khong tae la raya"],
    dependency: ["前后任务衔接顺畅", "qiánhòu rènwu xiánjiē shùnchàng", "งานก่อนหลังเชื่อมต่อกันราบรื่น", "ngan kon lang chueamto kan rapruen"],
    risk: ["潜在损失控制在可接受范围", "qiánzài sǔnshī kòngzhì zài kě jiēshòu fànwéi", "ควบคุมความเสียหายที่อาจเกิดให้อยู่ในระดับยอมรับได้", "khuapkhum khwam sia hai thi at koet hai yu nai radap yomrap dai"],
    resource: ["人员和设备配置合理", "rényuán hé shèbèi pèizhì hélǐ", "จัดคนและอุปกรณ์ได้เหมาะสม", "chat khon lae uppakon dai mosom"],
    estimate: ["负责人制定现实计划", "fùzérén zhìdìng xiànshí jìhuà", "ผู้รับผิดชอบวางแผนที่ทำได้จริง", "phurapphitchop wangphaen thi tham dai ching"],
    deviation: ["团队及时采取纠正措施", "tuánduì jíshí cǎiqǔ jiūzhèng cuòshī", "ทีมแก้ไขความคลาดเคลื่อนได้ทันเวลา", "thim kaekhai khwam khlatkhluen dai than wela"],
    change: ["项目变动经过正式确认", "xiàngmù biàndòng jīngguò zhèngshì quèrèn", "การเปลี่ยนแปลงโครงการได้รับการยืนยันอย่างเป็นทางการ", "kan plianplaeng khrongkan dai rap kan yuenyan yang pen thangkan"],
    decision: ["后来者理解当时取舍", "hòuláizhě lǐjiě dāngshí qǔshě", "ผู้มารับช่วงเข้าใจเหตุผลของการตัดสินใจ", "phu ma rap chuang khaochai hetphon khong kan tatsinchai"],
    rootcause: ["同类故障不再发生", "tónglèi gùzhàng bú zài fāshēng", "ปัญหาแบบเดิมไม่เกิดซ้ำ", "panha baep doem mai koet sam"],
    learning: ["下一轮工作少走弯路", "xià yì lún gōngzuò shǎo zǒu wānlù", "งานรอบถัดไปหลีกเลี่ยงข้อผิดพลาดเดิม", "ngan rop thatpai likliang kho phitphlat doem"],
    launch: ["新功能稳定交付用户", "xīn gōngnéng wěndìng jiāofù yònghù", "ส่งมอบฟังก์ชันใหม่ให้ผู้ใช้อย่างเสถียร", "song mop fangchan mai hai phuchai yang sathian"],
    rollback: ["发布失败后迅速恢复", "fābù shībài hòu xùnsù huīfù", "กู้ระบบกลับได้เร็วเมื่อเผยแพร่ล้มเหลว", "ku rabop klap dai reo muea phoeiphae lomleo"],
    compatibility: ["不同设备正常运行", "bùtóng shèbèi zhèngcháng yùnxíng", "อุปกรณ์ต่างชนิดใช้งานได้ปกติ", "uppakon tang chanit chai ngan dai pokkati"],
    inspection: ["交付结果符合约定", "jiāofù jiéguǒ fúhé yuēdìng", "ผลงานที่ส่งมอบตรงตามข้อตกลง", "phonngan thi song mop trong tam khotoklong"],
    maintenance: ["设备寿命得到延长", "shèbèi shòumìng dédào yáncháng", "ยืดอายุการใช้งานอุปกรณ์", "yuet ayu kan chai ngan uppakon"],
    outage: ["用户提前做好安排", "yònghù tíqián zuòhǎo ānpái", "ผู้ใช้เตรียมแผนล่วงหน้า", "phuchai triam phaen luangna"],
    account: ["离职人员无法继续访问", "lízhí rényuán wúfǎ jìxù fǎngwèn", "ผู้พ้นสภาพเข้าถึงระบบต่อไม่ได้", "phu phon saphap khaothueng rabop to mai dai"],
    customer: ["销售提供更合适的方案", "xiāoshòu tígōng gèng héshì de fāng'àn", "ฝ่ายขายเสนอทางเลือกที่เหมาะกว่า", "fai khai sanoe thanglueak thi mo kwa"],
    conversion: ["市场活动产生实际订单", "shìchǎng huódòng chǎnshēng shíjì dìngdān", "กิจกรรมการตลาดสร้างคำสั่งซื้อจริง", "kitchakam kantalat sang khamsang sue ching"],
    retention: ["老客户愿意继续购买", "lǎo kèhù yuànyì jìxù gòumǎi", "ลูกค้าเดิมยินดีกลับมาซื้ออีก", "lukkha doem yindi klap ma sue ik"],
    complaint: ["客户知道去哪里反映", "kèhù zhīdào qù nǎli fǎnyìng", "ลูกค้ารู้ช่องทางแจ้งปัญหา", "lukkha ru chongthang chaeng panha"],
    refund: ["客户掌握款项状态", "kèhù zhǎngwò kuǎnxiàng zhuàngtài", "ลูกค้าติดตามสถานะเงินคืนได้", "lukkha tittam sathana ngoen khuen dai"],
    delivery: ["收件人掌握配送进度", "shōujiànrén zhǎngwò pèisòng jìndù", "ผู้รับติดตามความคืบหน้าการจัดส่งได้", "phu rap tittam khwam khuepna kan chatsong dai"],
    damage: ["售后快速判断责任", "shòuhòu kuàisù pànduàn zérèn", "ฝ่ายหลังการขายระบุความรับผิดได้เร็ว", "fai lang kan khai rabu khwam rapphit dai reo"],
    payment: ["买卖双方按约结算", "mǎimài shuāngfāng àn yuē jiésuàn", "ผู้ซื้อและผู้ขายชำระตามข้อตกลง", "phu sue lae phu khai chamra tam khotoklong"],
    overdue: ["财务及时催收欠款", "cáiwù jíshí cuīshōu qiànkuǎn", "ฝ่ายการเงินติดตามหนี้ค้างชำระทันเวลา", "fai kanngoen tittam ni khang chamra than wela"],
    tax: ["发票资料填写准确", "fāpiào zīliào tiánxiě zhǔnquè", "กรอกข้อมูลใบกำกับภาษีถูกต้อง", "krok khomun bai kamkap phasi thuktong"],
    credit: ["交易风险得到控制", "jiāoyì fēngxiǎn dédào kòngzhì", "ควบคุมความเสี่ยงจากธุรกรรม", "khuapkhum khwam siang chak thurakam"],
    hiring: ["招聘目标更加明确", "zhāopìn mùbiāo gèngjiā míngquè", "เป้าหมายการสรรหาชัดเจนขึ้น", "paomai kan sanha chatchen khuen"],
    onboarding: ["新员工顺利开始工作", "xīn yuángōng shùnlì kāishǐ gōngzuò", "พนักงานใหม่เริ่มงานได้ราบรื่น", "phanakngan mai roem ngan dai rapruen"],
    labor: ["雇佣双方权责清楚", "gùyōng shuāngfāng quánzé qīngchu", "สิทธิและหน้าที่ของคู่จ้างชัดเจน", "sitthi lae nathi khong khu chang chatchen"],
    attendance2: ["考勤异常及时修正", "kǎoqín yìcháng jíshí xiūzhèng", "แก้ไขข้อมูลเวลาทำงานที่ผิดปกติทันเวลา", "kaekhai khomun wela thamngan thi phitpokkati than wela"],
    leave: ["员工合理安排休息", "yuángōng hélǐ ānpái xiūxi", "พนักงานจัดเวลาพักได้เหมาะสม", "phanakngan chat wela phak dai mosom"],
    payroll: ["员工核对收入明细", "yuángōng héduì shōurù míngxì", "พนักงานตรวจสอบรายละเอียดรายได้", "phanakngan truatsop raila-iat raidai"],
    taxWithholding: ["员工可以核对个人所得税扣缴明细", "yuángōng kěyǐ héduì gèrén suǒdéshuì kòujiǎo míngxì", "พนักงานตรวจสอบรายละเอียดการหักภาษีเงินได้บุคคลธรรมดาได้", "phanakngan truatsop raila-iat kan hak phasi ngoendai bukkhon thammada dai"],
    performance: ["主管给出具体辅导", "zhǔguǎn gěichū jùtǐ fǔdǎo", "หัวหน้าให้คำแนะนำที่ชัดเจน", "huana hai khamnaenam thi chatchen"],
    growth: ["员工看见发展方向", "yuángōng kànjiàn fāzhǎn fāngxiàng", "พนักงานเห็นทิศทางการเติบโต", "phanakngan hen thitthang kan toepto"],
    proof: ["办事机构核实任职经历", "bànshì jīgòu héshí rènzhí jīnglì", "หน่วยงานตรวจสอบประวัติการทำงาน", "nuai ngan truatsop prawat kan thamngan"],
    housing: ["租住双方减少争议", "zūzhù shuāngfāng jiǎnshǎo zhēngyì", "ผู้เช่าและผู้ให้เช่าลดข้อโต้แย้ง", "phu chao lae phu hai chao lot kho toyaeng"],
    utility: ["住户核对实际用量", "zhùhù héduì shíjì yòngliàng", "ผู้อยู่อาศัยตรวจสอบปริมาณใช้จริง", "phu yu asai truatsop pariman chai ching"],
    visitor: ["楼内人员更加安全", "lóunèi rényuán gèngjiā ānquán", "คนในอาคารปลอดภัยยิ่งขึ้น", "khon nai akhan plotphai ying khuen"],
    repair: ["维修人员准确定位故障", "wéixiū rényuán zhǔnquè dìngwèi gùzhàng", "ช่างระบุตำแหน่งปัญหาได้แม่นยำ", "chang rabu tamnaeng panha dai maenyam"],
    parcel: ["住户灵活领取包裹", "zhùhù línghuó lǐngqǔ bāoguǒ", "ผู้อยู่อาศัยรับพัสดุได้ยืดหยุ่น", "phu yu asai rap phatsadu dai yuetyun"],
    security: ["账号不易被冒用", "zhànghào bú yì bèi màoyòng", "บัญชีถูกสวมรอยได้ยาก", "banchi thuk suamroi dai yak"],
    remote: ["异地同事共同解决问题", "yìdì tóngshì gòngtóng jiějué wèntí", "เพื่อนร่วมงานต่างสถานที่แก้ปัญหาร่วมกัน", "phuean ruam ngan tang sathanti kae panha ruam kan"],
    meeting2: ["线上会议少受干扰", "xiànshàng huìyì shǎo shòu gānrǎo", "การประชุมออนไลน์ถูกรบกวนน้อยลง", "kan prachum onlai thuk ropkuan noi long"],
    email: ["收件人理解邮件关系", "shōujiànrén lǐjiě yóujiàn guānxì", "ผู้รับเข้าใจบทบาทในอีเมล", "phu rap khaochai botbat nai imel"],
    file: ["大型资料更便于传输", "dàxíng zīliào gèng biànyú chuánshū", "ส่งไฟล์ขนาดใหญ่ได้สะดวกขึ้น", "song fai khanat yai dai saduak khuen"],
    storage: ["重要资料正常同步", "zhòngyào zīliào zhèngcháng tóngbù", "ข้อมูลสำคัญซิงก์ได้ตามปกติ", "khomun samkhan sing dai tam pokkati"],
    network: ["视频通话保持流畅", "shìpín tōnghuà bǎochí liúchàng", "วิดีโอคอลทำงานได้ลื่นไหล", "widio khon thamngan dai luenlai"],
    telecom: ["出国期间保持联网", "chūguó qījiān bǎochí liánwǎng", "เชื่อมต่ออินเทอร์เน็ตได้ระหว่างอยู่ต่างประเทศ", "chueamto intoenet dai rawang yu tang prathet"],
    wallet: ["日常小额付款更方便", "rìcháng xiǎo'é fùkuǎn gèng fāngbiàn", "ชำระเงินจำนวนเล็กน้อยได้สะดวกขึ้น", "chamra ngoen chamnuan lek noi dai saduak khuen"],
    transaction: ["用户发现异常扣款", "yònghù fāxiàn yìcháng kòukuǎn", "ผู้ใช้พบรายการหักเงินผิดปกติ", "phuchai phop raikan hak ngoen phitpokkati"],
    subscription: ["用户避免不必要收费", "yònghù bìmiǎn bú bìyào shōufèi", "ผู้ใช้หลีกเลี่ยงค่าบริการที่ไม่จำเป็น", "phuchai likliang kha borikan thi mai champen"],
    identity: ["平台确认本人操作", "píngtái quèrèn běnrén cāozuò", "แพลตฟอร์มยืนยันว่าเจ้าตัวเป็นผู้ทำรายการ", "phaetfom yuenyan wa chaotua pen phu tham raikan"],
    support: ["复杂问题转给专员", "fùzá wèntí zhuǎn gěi zhuānyuán", "ส่งต่อปัญหาซับซ้อนให้เจ้าหน้าที่", "songto panha sapsong hai chaonathi"],
    satisfaction: ["服务团队找到改进点", "fúwù tuánduì zhǎodào gǎijìndiǎn", "ทีมบริการพบจุดที่ควรปรับปรุง", "thim borikan phop chut thi khuan prapprung"],
    queue: ["顾客合理安排等待时间", "gùkè hélǐ ānpái děngdài shíjiān", "ลูกค้าวางแผนเวลารอได้เหมาะสม", "lukkha wangphaen wela ro dai mosom"],
    notice: ["来访者提前了解变化", "láifǎngzhě tíqián liǎojiě biànhuà", "ผู้มาติดต่อทราบการเปลี่ยนแปลงล่วงหน้า", "phu ma titto sap kan plianplaeng luangna"],
    deal: ["双方找到可成交条件", "shuāngfāng zhǎodào kě chéngjiāo tiáojiàn", "ทั้งสองฝ่ายพบเงื่อนไขที่ตกลงกันได้", "thang song fai phop ngueankhai thi toklong kan dai"],
    obligation: ["合作各方履行约定义务", "hézuò gèfāng lǚxíng yuēdìng yìwù", "ทุกฝ่ายปฏิบัติตามหน้าที่ที่ตกลงไว้", "thuk fai patibat tam nathi thi toklong wai"],
    earlyDelivery: ["各方提前确认收货条件并调整后续安排", "gèfāng tíqián quèrèn shōuhuò tiáojiàn bìng tiáozhěng hòuxù ānpái", "ทุกฝ่ายยืนยันเงื่อนไขการรับมอบและปรับแผนถัดไปล่วงหน้า", "thuk fai yuenyan ngueankhai kan rap mop lae prap phaen thatpai luangna"],
    legal: ["合同具有明确法律效力", "hétong jùyǒu míngquè fǎlǜ xiàolì", "สัญญามีผลทางกฎหมายชัดเจน", "sanya mi phon thang kotmai chatchen"],
    terms: ["合作条件容易理解", "hézuò tiáojiàn róngyì lǐjiě", "เข้าใจเงื่อนไขความร่วมมือได้ง่าย", "khaochai ngueankhai khwam ruammue dai ngai"],
    flexibility: ["谈判保留调整余地", "tánpàn bǎoliú tiáozhěng yúdì", "การเจรจายังมีพื้นที่ให้ปรับเปลี่ยน", "kan cheracha yang mi phuenthi hai prap plian"],
    enforce: ["协议能够实际执行", "xiéyì nénggòu shíjì zhíxíng", "ข้อตกลงนำไปปฏิบัติได้จริง", "khotoklong nam pai patibat dai ching"],
    dispute: ["双方妥善处理合同争端", "shuāngfāng tuǒshàn chǔlǐ hétong zhēngduān", "ทั้งสองฝ่ายจัดการข้อพิพาทตามสัญญาอย่างเหมาะสม", "thang song fai chatkan kho phiphat tam sanya yang mosom"],
    pilot: ["团队先验证方案效果", "tuánduì xiān yànzhèng fāng'àn xiàoguǒ", "ทีมทดสอบผลของแนวทางก่อน", "thim thotsop phon khong naeo thang kon"],
    channel: ["产品通过合适渠道销售", "chǎnpǐn tōngguò héshì qúdào xiāoshòu", "สินค้าจำหน่ายผ่านช่องทางที่เหมาะสม", "sinkha chamnai phan chongthang thi mosom"],
    license: ["知识成果得到合法使用", "zhīshi chéngguǒ dédào héfǎ shǐyòng", "ผลงานทางปัญญาถูกใช้อย่างถูกกฎหมาย", "phonngan thang panya thuk chai yang thuk kotmai"],
    negotiate: ["谈判代表掌握可接受边界", "tánpàn dàibiǎo zhǎngwò kě jiēshòu biānjiè", "ผู้เจรจารู้ขอบเขตที่ยอมรับได้", "phu cheracha ru khopkhet thi yomrap dai"],
    fallback: ["首选方案失败后仍可推进", "shǒuxuǎn fāng'àn shībài hòu réng kě tuījìn", "ยังดำเนินงานต่อได้เมื่อทางเลือกแรกไม่สำเร็จ", "yang damnoen ngan to dai muea thanglueak raek mai samret"],
    evidence2: ["口头讨论留下可靠依据", "kǒutóu tǎolùn liúxià kěkào yījù", "การหารือด้วยวาจามีหลักฐานน่าเชื่อถือ", "kan harue duai wacha mi lakthan na chueathue"],
    accuracy: ["公众获得准确资讯", "gōngzhòng huòdé zhǔnquè zīxùn", "สาธารณชนได้รับข้อมูลข่าวสารที่ถูกต้อง", "satharanachon dai rap khomun khaosan thi thuktong"],
    credibility: ["媒体内容保持可信", "méitǐ nèiróng bǎochí kěxìn", "เนื้อหาสื่อยังคงน่าเชื่อถือ", "nueaha sue yangkhong na chueathue"],
    rapidnews: ["重要消息及时传达", "zhòngyào xiāoxi jíshí chuándá", "ข่าวสำคัญถูกสื่อสารทันเวลา", "khao samkhan thuk suesan than wela"],
    context: ["读者理解事件来龙去脉", "dúzhě lǐjiě shìjiàn láilóng qùmài", "ผู้อ่านเข้าใจที่มาและบริบทของเหตุการณ์", "phu an khaochai thima lae boribot khong hetkan"],
    sourcing: ["报道内容可以核实", "bàodào nèiróng kěyǐ héshí", "ตรวจสอบเนื้อหาข่าวได้", "truatsop nueaha khao dai"],
    audience: ["内容触达合适人群", "nèiróng chùdá héshì rénqún", "เนื้อหาเข้าถึงกลุ่มคนที่เหมาะสม", "nueaha khaothueng klum khon thi mosom"],
    engagement: ["受众主动参与内容互动", "shòuzhòng zhǔdòng cānyù nèiróng hùdòng", "ผู้ชมมีส่วนร่วมกับเนื้อหาอย่างกระตือรือร้น", "phu chom mi suan ruam kap nueaha yang kratuerueron"],
    sentiment: ["团队及时发现公众情绪变化", "tuánduì jíshí fāxiàn gōngzhòng qíngxù biànhuà", "ทีมพบการเปลี่ยนแปลงของอารมณ์สาธารณะทันเวลา", "thim phop kan plianplaeng khong arom satharana than wela"],
    crisis: ["组织在危机中保持信任", "zǔzhī zài wēijī zhōng bǎochí xìnrèn", "องค์กรรักษาความไว้วางใจในภาวะวิกฤต", "ongkon raksa khwam waiwangchai nai phawa wikrit"],
    consistency: ["不同发言保持一致", "bùtóng fāyán bǎochí yízhì", "ถ้อยแถลงจากหลายฝ่ายสอดคล้องกัน", "thoithalaeng chak lai fai sotkhlong kan"],
    editorial: ["内容符合发布要求", "nèiróng fúhé fābù yāoqiú", "เนื้อหาตรงตามข้อกำหนดการเผยแพร่", "nueaha trong tam kho kamnot kan phoeiphae"],
    production: ["制作团队按计划完成内容", "zhìzuò tuánduì àn jìhuà wánchéng nèiróng", "ทีมผลิตเนื้อหาเสร็จตามแผน", "thim phalit nueaha set tam phaen"],
    mediaRights: ["创作者权益受到保障", "chuàngzuòzhě quányì shòudào bǎozhàng", "สิทธิของผู้สร้างสรรค์ได้รับการคุ้มครอง", "sitthi khong phu sangsan dai rap kan khumkhrong"],
    correction: ["错误信息得到公开修正", "cuòwù xìnxī dédào gōngkāi xiūzhèng", "ข้อมูลผิดได้รับการแก้ไขอย่างเปิดเผย", "khomun phit dai rap kan kaekhai yang poetphoei"],
    segmentation: ["营销资源投向合适群体", "yíngxiāo zīyuán tóuxiàng héshì qúntǐ", "ทรัพยากรการตลาดมุ่งไปยังกลุ่มที่เหมาะสม", "sapphayakon kantalat mung pai yang klum thi mosom"],
    insight: ["团队理解真实消费行为", "tuánduì lǐjiě zhēnshí xiāofèi xíngwéi", "ทีมเข้าใจพฤติกรรมผู้บริโภคจริง", "thim khaochai pharuetikam phuboriphok ching"],
    purchase2: ["产品回应顾客真实需要", "chǎnpǐn huíyìng gùkè zhēnshí xūyào", "ผลิตภัณฑ์ตอบโจทย์ความต้องการจริงของลูกค้า", "phalitthaphan top chot khwam tongkan ching khong lukkha"],
    positioning: ["消费者清楚品牌独特价值", "xiāofèizhě qīngchu pǐnpái dútè jiàzhí", "ผู้บริโภคเข้าใจคุณค่าเฉพาะของแบรนด์", "phuboriphok khaochai khunkha chapho khong braen"],
    competition2: ["企业看清市场对手动向", "qǐyè kànqīng shìchǎng duìshǒu dòngxiàng", "ธุรกิจเห็นความเคลื่อนไหวของคู่แข่งชัดเจน", "thurakit hen khwam khlueanwai khong khukhaeng chatchen"],
    growth2: ["业务找到可持续增长来源", "yèwù zhǎodào kě chíxù zēngzhǎng láiyuán", "ธุรกิจพบแหล่งเติบโตที่ต่อเนื่อง", "thurakit phop laeng toepto thi tonueang"],
    acquisition: ["企业控制新增客户投入", "qǐyè kòngzhì xīnzēng kèhù tóurù", "ธุรกิจควบคุมเงินลงทุนเพื่อหาลูกค้าใหม่", "thurakit khuapkhum ngoen longthun phuea ha lukkha mai"],
    customerValue: ["企业评估长期客户贡献", "qǐyè pínggū chángqī kèhù gòngxiàn", "ธุรกิจประเมินคุณค่าระยะยาวของลูกค้า", "thurakit pramoen khunkha raya yao khong lukkha"],
    profit: ["经营活动产生合理回报", "jīngyíng huódòng chǎnshēng hélǐ huíbào", "การดำเนินธุรกิจสร้างผลตอบแทนที่เหมาะสม", "kan damnoen thurakit sang phon topthaen thi mosom"],
    cash: ["企业按时支付日常开支", "qǐyè ànshí zhīfù rìcháng kāizhī", "ธุรกิจจ่ายค่าใช้จ่ายประจำได้ตรงเวลา", "thurakit chai kha chai chai pracham dai trong wela"],
    efficiency2: ["资源投入产生更多产出", "zīyuán tóurù chǎnshēng gèng duō chǎnchū", "ทรัพยากรที่ลงไปสร้างผลผลิตมากขึ้น", "sapphayakon thi long pai sang phonphalit mak khuen"],
    supply2: ["供应网络面对变化仍能运作", "gōngyìng wǎngluò miànduì biànhuà réng néng yùnzuò", "เครือข่ายอุปทานยังทำงานได้เมื่อเกิดความเปลี่ยนแปลง", "khrueakhai uppathan yang thamngan dai muea koet khwam plianplaeng"],
    capacity: ["团队按承诺完成服务", "tuánduì àn chéngnuò wánchéng fúwù", "ทีมให้บริการได้ตามที่รับปาก", "thim hai borikan dai tam thi rap pak"],
    metric: ["管理者判断业务状态", "guǎnlǐzhě pànduàn yèwù zhuàngtài", "ผู้บริหารประเมินสถานะธุรกิจ", "phuborihan pramoen sathana thurakit"],
    sample: ["分析结果具有代表性", "fēnxī jiéguǒ jùyǒu dàibiǎoxìng", "ผลวิเคราะห์เป็นตัวแทนของกลุ่มได้", "phon wikhro pen tuathaen khong klum dai"],
    uncertainty: ["读者正确理解估计结果", "dúzhě zhèngquè lǐjiě gūjì jiéguǒ", "ผู้อ่านเข้าใจผลประมาณอย่างถูกต้อง", "phu an khaochai phon praman yang thuktong"],
    causality: ["研究者避免错误归因", "yánjiūzhě bìmiǎn cuòwù guīyīn", "นักวิจัยหลีกเลี่ยงการสรุปเหตุผิด", "nakwichai likliang kan sarup het phit"],
    anomaly: ["数据问题尽早被发现", "shùjù wèntí jǐnzǎo bèi fāxiàn", "พบปัญหาข้อมูลได้ตั้งแต่เนิ่น ๆ", "phop panha khomun dai tangtae noen noen"],
    visualization: ["复杂数据更容易理解", "fùzá shùjù gèng róngyì lǐjiě", "เข้าใจข้อมูลซับซ้อนได้ง่ายขึ้น", "khaochai khomun sapsong dai ngai khuen"],
    businessTrend: ["管理层看出增长变化", "guǎnlǐcéng kànchū zēngzhǎng biànhuà", "ฝ่ายบริหารเห็นความเปลี่ยนแปลงของการเติบโต", "fai borihan hen khwam plianplaeng khong kan toepto"],
    churn: ["产品团队及时挽回用户", "chǎnpǐn tuánduì jíshí wǎnhuí yònghù", "ทีมผลิตภัณฑ์รักษาผู้ใช้ไว้ได้ทันเวลา", "thim phalitthaphan raksa phuchai wai dai than wela"],
    governance: ["组织权力受到适当约束", "zǔzhī quánlì shòudào shìdàng yuēshù", "อำนาจในองค์กรถูกกำกับอย่างเหมาะสม", "amnat nai ongkon thuk kamkap yang mosom"],
    conflictInterest: ["个人利益不干扰公正判断", "gèrén lìyì bù gānrǎo gōngzhèng pànduàn", "ผลประโยชน์ส่วนตัวไม่รบกวนการตัดสินอย่างเป็นธรรม", "phonprayot suantua mai ropkuan kan tatsin yang pen tham"],
    compliance: ["业务符合适用法规", "yèwù fúhé shìyòng fǎguī", "ธุรกิจสอดคล้องกับกฎหมายที่เกี่ยวข้อง", "thurakit sotkhlong kap kotmai thi kiaokhong"],
    control2: ["关键操作得到相互制衡", "guānjiàn cāozuò dédào xiānghù zhìhéng", "ขั้นตอนสำคัญมีการถ่วงดุลกัน", "khanton samkhan mi kan thuangdun kan"],
    exposure: ["管理层看清可能损失", "guǎnlǐcéng kànqīng kěnéng sǔnshī", "ฝ่ายบริหารเห็นความเสียหายที่อาจเกิดชัดเจน", "fai borihan hen khwam sia hai thi at koet chatchen"],
    ethics: ["工作人员作出正当选择", "gōngzuò rényuán zuòchū zhèngdàng xuǎnzé", "ผู้ปฏิบัติงานเลือกทำสิ่งที่เหมาะควร", "phu patibat ngan lueak tham sing thi mokhuan"],
    whistle: ["内部问题获得安全通报", "nèibù wèntí huòdé ānquán tōngbào", "ปัญหาภายในถูกแจ้งอย่างปลอดภัย", "panha phainai thuk chaeng yang plotphai"],
    investigation: ["调查结论建立在完整事实之上", "diàochá jiélùn jiànlì zài wánzhěng shìshí zhīshàng", "ข้อสรุปการสอบสวนตั้งอยู่บนข้อเท็จจริงครบถ้วน", "kho sarup kan sopsuan tang yu bon khothetching khropthuan"],
    remediation: ["发现的问题得到持续修正", "fāxiàn de wèntí dédào chíxù xiūzhèng", "ปัญหาที่พบได้รับการแก้ไขอย่างต่อเนื่อง", "panha thi phop dai rap kan kaekhai yang tonueang"],
    independence: ["评估不受单一利益左右", "pínggū bú shòu dānyī lìyì zuǒyòu", "การประเมินไม่ถูกครอบงำด้วยผลประโยชน์ฝ่ายเดียว", "kan pramoen mai thuk khropngam duai phonprayot fai diao"],
    argument: ["论点得到充分支撑", "lùndiǎn dédào chōngfèn zhīchēng", "ข้อโต้แย้งได้รับการสนับสนุนเพียงพอ", "kho toyaeng dai rap kan sanapsanun phiangpho"],
    assumption: ["分析者看见推理起点", "fēnxīzhě kànjiàn tuīlǐ qǐdiǎn", "ผู้วิเคราะห์เห็นจุดตั้งต้นของเหตุผล", "phu wikhro hen chut tangton khong hetphon"],
    tradeoff: ["决策者比较不同选择后果", "juécèzhě bǐjiào bùtóng xuǎnzé hòuguǒ", "ผู้ตัดสินใจเปรียบเทียบผลของทางเลือกต่าง ๆ", "phu tatsinchai priapthiap phon khong thanglueak tang tang"],
    scenario: ["团队为多种未来做准备", "tuánduì wèi duōzhǒng wèilái zuò zhǔnbèi", "ทีมเตรียมพร้อมสำหรับอนาคตหลายแบบ", "thim triam phrom samrap anakhot lai baep"],
    stakeholder: ["受影响群体的意见进入决策过程", "shòu yǐngxiǎng qúntǐ de yìjiàn jìnrù juécè guòchéng", "ความเห็นของกลุ่มที่ได้รับผลกระทบเข้าสู่กระบวนการตัดสินใจ", "khwam hen khong klum thi dai rap phonkathop khaosu krabuan kan tatsinchai"],
    transparency2: ["公众理解决定如何形成", "gōngzhòng lǐjiě juédìng rúhé xíngchéng", "สาธารณชนเข้าใจว่าการตัดสินใจเกิดขึ้นอย่างไร", "satharanachon khaochai wa kan tatsinchai koet khuen yangrai"],
    implied: ["听者理解没有明说的意思", "tīngzhě lǐjiě méiyǒu míngshuō de yìsi", "ผู้ฟังเข้าใจความหมายที่ไม่ได้พูดตรง ๆ", "phu fang khaochai khwammai thi mai dai phut trong trong"],
    misunderstanding: ["双方减少理解偏差", "shuāngfāng jiǎnshǎo lǐjiě piānchā", "ทั้งสองฝ่ายลดความคลาดเคลื่อนในการเข้าใจ", "thang song fai lot khwam khlatkhluen nai kan khaochai"],
    bias2: ["判断更接近完整事实", "pànduàn gèng jiējìn wánzhěng shìshí", "การตัดสินใกล้เคียงข้อเท็จจริงครบถ้วนขึ้น", "kan tatsin klaikhiang khothetching khropthuan khuen"],
    emotion: ["对话不被即时情绪控制", "duìhuà bú bèi jíshí qíngxù kòngzhì", "การสนทนาไม่ถูกควบคุมด้วยอารมณ์ชั่ววูบ", "kan sonthana mai thuk khuapkhum duai arom chuawup"],
    trust2: ["合作关系更加稳固", "hézuò guānxì gèngjiā wěngù", "ความสัมพันธ์ในการร่วมมือมั่นคงขึ้น", "khwam samphan nai kan ruammue mankhong khuen"],
    psychological: ["成员敢于提出问题", "chéngyuán gǎnyú tíchū wèntí", "สมาชิกกล้าตั้งคำถาม", "samachik kla tang khamtham"],
    boundary: ["人际互动保持舒适", "rénjì hùdòng bǎochí shūshì", "การปฏิสัมพันธ์ยังคงสบายใจ", "kan patisamphan yangkhong sabaichai"],
    empathy2: ["对方感到被理解", "duìfāng gǎndào bèi lǐjiě", "อีกฝ่ายรู้สึกว่าได้รับความเข้าใจ", "ik fai rusuek wa dai rap khwam khaochai"],
    listening: ["说话者完整表达想法", "shuōhuàzhě wánzhěng biǎodá xiǎngfǎ", "ผู้พูดถ่ายทอดความคิดได้ครบถ้วน", "phu phut thaithot khwamkhit dai khropthuan"],
    questioning: ["对话获得更具体信息", "duìhuà huòdé gèng jùtǐ xìnxī", "การสนทนาได้ข้อมูลที่เจาะจงขึ้น", "kan sonthana dai khomun thi chochong khuen"],
    confirmation2: ["双方确认理解一致", "shuāngfāng quèrèn lǐjiě yízhì", "ทั้งสองฝ่ายยืนยันว่าเข้าใจตรงกัน", "thang song fai yuenyan wa khaochai trong kan"],
    constructive: ["不同观点推动方案完善", "bùtóng guāndiǎn tuīdòng fāng'àn wánshàn", "มุมมองที่แตกต่างกันผลักดันให้แนวทางสมบูรณ์ขึ้น", "mum mong thi taek tang kan phlakdan hai naeo thang sombun khuen"],
    deescalate: ["紧张对话恢复理性", "jǐnzhāng duìhuà huīfù lǐxìng", "บทสนทนาตึงเครียดกลับมามีเหตุผล", "bot sonthana tuengkriat klap ma mi hetphon"],
    mediation: ["冲突双方重新开始沟通", "chōngtū shuāngfāng chóngxīn kāishǐ gōutōng", "คู่ขัดแย้งกลับมาเริ่มสื่อสารกันใหม่", "khu khatyaeng klap ma roem suesan kan mai"],
    commonGround: ["合作建立在共同点上", "hézuò jiànlì zài gòngtóngdiǎn shàng", "ความร่วมมือตั้งอยู่บนจุดร่วม", "khwam ruammue tang yu bon chut ruam"],
    interests: ["谈判回应各方真正关切", "tánpàn huíyìng gèfāng zhēnzhèng guānqiè", "การเจรจาตอบข้อกังวลจริงของทุกฝ่าย", "kan cheracha top kho kangwon ching khong thuk fai"],
    hierarchy: ["沟通方式符合组织文化", "gōutōng fāngshì fúhé zǔzhī wénhuà", "รูปแบบการสื่อสารสอดคล้องกับวัฒนธรรมองค์กร", "rupbaep kan suesan sotkhlong kap watthanatham ongkon"],
    reciprocity: ["人际关系保持相互尊重", "rénjì guānxì bǎochí xiānghù zūnzhòng", "ความสัมพันธ์รักษาการเคารพซึ่งกันและกัน", "khwam samphan raksa kan khaorop sueng kan lae kan"],
    tact: ["敏感意见更容易被接受", "mǐngǎn yìjiàn gèng róngyì bèi jiēshòu", "ความเห็นละเอียดอ่อนถูกรับฟังได้ง่ายขึ้น", "khwam hen la-iat on thuk rap fang dai ngai khuen"],
    feedback2: ["接收者知道如何改进", "jiēshōuzhě zhīdào rúhé gǎijìn", "ผู้รับรู้ว่าจะปรับปรุงอย่างไร", "phu rap ru wa cha prapprung yangrai"],
    commitment2: ["讨论结果转化为实际行动", "tǎolùn jiéguǒ zhuǎnhuà wéi shíjì xíngdòng", "ผลการหารือเปลี่ยนเป็นการลงมือทำจริง", "phon kan harue plian pen kan longmue tham ching"],
    fiscal: ["政府长期维持财政稳健", "zhèngfǔ chángqī wéichí cáizhèng wěnjiàn", "รัฐบาลรักษาเสถียรภาพการคลังระยะยาว", "ratthaban raksa sathianraphap kan khlang raya yao"],
    publicBudget: ["财政资金将用于哪些公共项目", "cáizhèng zījīn jiāng yòng yú nǎxiē gōnggòng xiàngmù", "งบประมาณจะถูกใช้กับโครงการสาธารณะใดบ้าง", "ngoppraman cha thuk chai kap khrongkan satharana dai bang"],
    taxJustice: ["不同收入群体合理分担", "bùtóng shōurù qúntǐ hélǐ fēndān", "กลุ่มรายได้ต่างกันร่วมรับภาระอย่างเหมาะสม", "klum raidai tang kan ruam rap phara yang mosom"],
    welfare: ["基本服务覆盖更多居民", "jīběn fúwù fùgài gèng duō jūmín", "บริการพื้นฐานครอบคลุมประชาชนมากขึ้น", "borikan phuenthan khropkhlum prachachon mak khuen"],
    localGov: ["社区根据本地需要行动", "shèqū gēnjù běndì xūyào xíngdòng", "ชุมชนดำเนินการตามความต้องการท้องถิ่น", "chumchon damnoenkan tam khwam tongkan thongthin"],
    ruleLaw: ["权力按照公开规则运行", "quánlì ànzhào gōngkāi guīzé yùnxíng", "อำนาจดำเนินไปตามกติกาที่เปิดเผย", "amnat damnoen pai tam katika thi poetphoei"],
    justice: ["当事人的合法权益得到保障", "dāngshìrén de héfǎ quányì dédào bǎozhàng", "สิทธิชอบด้วยกฎหมายของคู่กรณีได้รับการคุ้มครอง", "sitthi chop duai kotmai khong khukorani dai rap kan khumkhrong"],
    civilRights: ["公众安全表达不同意见", "gōngzhòng ānquán biǎodá bùtóng yìjiàn", "ประชาชนแสดงความเห็นต่างได้อย่างปลอดภัย", "prachachon sadaeng khwam hen tang dai yang plotphai"],
    accountability: ["公共机构对决定负责", "gōnggòng jīgòu duì juédìng fùzé", "หน่วยงานสาธารณะรับผิดชอบต่อการตัดสินใจ", "nuai ngan satharana rapphitchop to kan tatsinchai"],
    policy: ["公共措施产生预期效果", "gōnggòng cuòshī chǎnshēng yùqī xiàoguǒ", "มาตรการสาธารณะเกิดผลตามที่คาด", "mattrakan satharana koet phon tam thi khat"],
    participation: ["居民共同决定社区事务", "jūmín gòngtóng juédìng shèqū shìwù", "ประชาชนร่วมตัดสินใจเรื่องของชุมชน", "prachachon ruam tatsinchai rueang khong chumchon"],
    socialCapital: ["陌生人之间也能有效合作", "mòshēngrén zhījiān yě néng yǒuxiào hézuò", "คนที่ไม่รู้จักกันก็ร่วมมือได้อย่างมีประสิทธิผล", "khon thi mai ruchak kan ko ruammue dai yang mi prasitthiphon"],
    inequality: ["发展成果更公平地分配", "fāzhǎn chéngguǒ gèng gōngpíng de fēnpèi", "ผลจากการพัฒนาถูกแบ่งอย่างเป็นธรรมขึ้น", "phon chak kan phatthana thuk baeng yang pen tham khuen"],
    migration: ["城市服务回应人口变化", "chéngshì fúwù huíyìng rénkǒu biànhuà", "บริการเมืองตอบรับการเปลี่ยนแปลงของประชากร", "borikan mueang top rap kan plianplaeng khong prachakon"],
    laborRights: ["劳动者获得公平待遇", "láodòngzhě huòdé gōngpíng dàiyù", "แรงงานได้รับการปฏิบัติอย่างเป็นธรรม", "raengngan dai rap kan patibat yang pen tham"],
    minimumWageFloor: ["劳动收入具有法定最低标准", "láodòng shōurù jùyǒu fǎdìng zuìdī biāozhǔn", "รายได้จากแรงงานมีเกณฑ์ขั้นต่ำตามกฎหมาย", "raidai chak raengngan mi ken khan tam tam kotmai"],
    platformWork: ["新型就业受到基本保障", "xīnxíng jiùyè shòudào jīběn bǎozhàng", "การจ้างงานรูปแบบใหม่ได้รับหลักประกันพื้นฐาน", "kan chang ngan rupbaep mai dai rap lakprakan phuenthan"],
    mobility: ["出身不再决定人生机会", "chūshēn bú zài juédìng rénshēng jīhuì", "ชาติกำเนิดไม่กำหนดโอกาสชีวิตอีกต่อไป", "chatkamnoet mai kamnot okat chiwit ik topai"],
    inclusion: ["边缘群体平等参与社会", "biānyuán qúntǐ píngděng cānyù shèhuì", "กลุ่มชายขอบมีส่วนร่วมในสังคมอย่างเท่าเทียม", "klum chai khop mi suan ruam nai sangkhom yang thaothiam"],
    heritage: ["后代仍能接触文化根源", "hòudài réng néng jiēchù wénhuà gēnyuán", "คนรุ่นหลังยังเข้าถึงรากวัฒนธรรมได้", "khon run lang yang khaothueng rak watthanatham dai"],
    oralHistory: ["普通人的经历被保存", "pǔtōngrén de jīnglì bèi bǎocún", "ประสบการณ์ของคนทั่วไปได้รับการเก็บรักษา", "prasopkan khong khon thuapai dai rap kan kep raksa"],
    localKnowledge: ["社区经验参与解决实际问题", "shèqū jīngyàn cānyù jiějué shíjì wèntí", "ประสบการณ์ชุมชนถูกนำมาแก้ปัญหาจริง", "prasopkan chumchon thuk nam ma kae panha ching"],
    symbolism: ["人们理解仪式背后含义", "rénmen lǐjiě yíshì bèihòu hányì", "ผู้คนเข้าใจความหมายเบื้องหลังพิธีกรรม", "phukhon khaochai khwammai bueanglang phithikam"],
    identity2: ["群体确认自己属于哪里", "qúntǐ quèrèn zìjǐ shǔyú nǎli", "กลุ่มคนยืนยันว่าตนเองเป็นส่วนหนึ่งของที่ใด", "klum khon yuenyan wa ton eng pen suan nueng khong thi dai"],
    adaptation: ["跨国生活减少文化不适", "kuàguó shēnghuó jiǎnshǎo wénhuà búshì", "การใช้ชีวิตข้ามประเทศลดความไม่คุ้นทางวัฒนธรรม", "kan chai chiwit kham prathet lot khwam mai khun thang watthanatham"],
    exchange: ["不同文化相互学习", "bùtóng wénhuà xiānghù xuéxí", "วัฒนธรรมต่างกันเรียนรู้ซึ่งกันและกัน", "watthanatham tang kan rianru sueng kan lae kan"],
    localization: ["外来内容符合本地语境", "wàilái nèiróng fúhé běndì yǔjìng", "เนื้อหาจากภายนอกเข้ากับบริบทท้องถิ่น", "nueaha chak phainok khaokap boribot thongthin"],
    representation: ["媒体呈现群体真实样貌", "méitǐ chéngxiàn qúntǐ zhēnshí yàngmào", "สื่อนำเสนอภาพกลุ่มคนตามความเป็นจริง", "sue nam sanoe phap klum khon tam khwam pen ching"],
    creative: ["传统资源转化为当代价值", "chuántǒng zīyuán zhuǎnhuà wéi dāngdài jiàzhí", "ทุนวัฒนธรรมเปลี่ยนเป็นคุณค่าร่วมสมัย", "thun watthanatham plian pen khunkha ruamsamai"],
    craft: ["手艺人的知识继续传承", "shǒuyìrén de zhīshi jìxù chuánchéng", "ความรู้ของช่างฝีมือได้รับการสืบทอด", "khwamru khong chang fimeu dai rap kan suepthot"],
    faith: ["不同信念和平共处", "bùtóng xìnniàn hépíng gòngchǔ", "ความเชื่อต่างกันอยู่ร่วมกันอย่างสันติ", "khwam chuea tang kan yu ruam kan yang santi"],
    minority: ["少数群体的声音被听见", "shǎoshù qúntǐ de shēngyīn bèi tīngjiàn", "เสียงของกลุ่มส่วนน้อยได้รับการรับฟัง", "siang khong klum suannoi dai rap kan rapfang"],
    languageTransmission: ["年轻一代继续使用祖辈语言", "niánqīng yídài jìxù shǐyòng zǔbèi yǔyán", "คนรุ่นใหม่ยังใช้ภาษาของบรรพบุรุษ", "khon run mai yang chai phasa khong banphaburut"],
    bilingual: ["学习者同时掌握两种语言", "xuéxízhě tóngshí zhǎngwò liǎng zhǒng yǔyán", "ผู้เรียนใช้สองภาษาได้ควบคู่กัน", "phurian chai song phasa dai khu khanan kan"],
    codeSwitch: ["说话者适应不同交际对象", "shuōhuàzhě shìyìng bùtóng jiāojì duìxiàng", "ผู้พูดปรับตัวตามคู่สนทนาที่ต่างกัน", "phu phut prap tua tam khu sonthana thi tang kan"],
    politeness2: ["跨文化对话减少冒犯", "kuà wénhuà duìhuà jiǎnshǎo màofàn", "บทสนทนาข้ามวัฒนธรรมลดการล่วงเกิน", "bot sonthana kham watthanatham lot kan luangkoen"],
    contextCulture: ["交际者正确解读表达方式", "jiāojìzhě zhèngquè jiědú biǎodá fāngshì", "ผู้สื่อสารตีความรูปแบบการแสดงออกได้ถูกต้อง", "phu suesan tikhwam rupbaep kan sadaeng ok dai thuktong"],
    critical: ["人们区分事实与主张", "rénmen qūfēn shìshí yǔ zhǔzhāng", "ผู้คนแยกข้อเท็จจริงออกจากข้อกล่าวอ้าง", "phukhon yaek khothetching ok chak kho klao-ang"],
    fallacy: ["错误推理可能正在误导讨论", "cuòwù tuīlǐ kěnéng zhèngzài wùdǎo tǎolùn", "เหตุผลวิบัติอาจกำลังชี้นำการหารือผิดทาง", "hetphon wibat at kamlang chinam kan harue phit thang"],
    sourceQuality: ["读者判断信息可靠程度", "dúzhě pànduàn xìnxī kěkào chéngdù", "ผู้อ่านประเมินระดับความน่าเชื่อถือของข้อมูล", "phu an pramoen radap khwam na chueathue khong khomun"],
    reproducibility: ["其他研究者检验研究结果", "qítā yánjiūzhě jiǎnyàn yánjiū jiéguǒ", "นักวิจัยคนอื่นตรวจสอบผลการวิจัยได้", "nakwichai khon uen truatsop phon kan wichai dai"],
    researchEthics: ["参与者权益免受研究伤害", "cānyùzhě quányì miǎn shòu yánjiū shānghài", "สิทธิของผู้เข้าร่วมได้รับการคุ้มครองจากอันตรายในการวิจัย", "sitthi khong phu khao ruam dai rap kan khumkhrong chak antarai nai kan wichai"],
    extrapolation: ["结论不超出证据范围", "jiélùn bù chāochū zhèngjù fànwéi", "ข้อสรุปไม่เกินขอบเขตหลักฐาน", "kho sarup mai koen khopkhet lakthan"],
    rhetoric: ["语言正在引导听众的理解方式", "yǔyán zhèngzài yǐndǎo tīngzhòng de lǐjiě fāngshì", "ภาษากำลังชี้นำวิธีทำความเข้าใจของผู้ฟัง", "phasa kamlang chinam withi tham khwam khaochai khong phu fang"],
    agenda: ["公共讨论关注特定问题", "gōnggòng tǎolùn guānzhù tèdìng wèntí", "การถกเถียงสาธารณะสนใจประเด็นบางอย่าง", "kan thokthiang satharana sonchai praden bang yang"],
    echo: ["用户接触更广泛观点", "yònghù jiēchù gèng guǎngfàn guāndiǎn", "ผู้ใช้ได้พบมุมมองที่หลากหลายขึ้น", "phuchai dai phop mum mong thi laklai khuen"],
    polarization: ["群体意见不走向极端", "qúntǐ yìjiàn bù zǒuxiàng jíduān", "ความเห็นของกลุ่มไม่เคลื่อนไปสุดขั้ว", "khwam hen khong klum mai khluean pai sutkhua"],
    attention: ["用户主动管理信息摄入", "yònghù zhǔdòng guǎnlǐ xìnxī shèrù", "ผู้ใช้จัดการการรับข้อมูลอย่างตั้งใจ", "phuchai chatkan kan rap khomun yang tangchai"],
    manipulation: ["公众识别被操控的内容", "gōngzhòng shíbié bèi cāokòng de nèiróng", "สาธารณชนแยกแยะเนื้อหาที่ถูกชักจูง", "satharanachon yaekyae nueaha thi thuk chakchung"],
    digitalTrail: ["个人了解线上行为记录", "gèrén liǎojiě xiànshàng xíngwéi jìlù", "บุคคลเข้าใจร่องรอยพฤติกรรมออนไลน์", "bukkhon khaochai rongroi pharuetikam onlai"],
    dataRights: ["个人能够控制自身数据", "gèrén nénggòu kòngzhì zìshēn shùjù", "บุคคลควบคุมข้อมูลของตนได้", "bukkhon khuapkhum khomun khong ton dai"],
    algorithm: ["自动系统接受公众检查", "zìdòng xìtǒng jiēshòu gōngzhòng jiǎnchá", "ระบบอัตโนมัติเปิดรับการตรวจสอบจากสาธารณะ", "rabop attanomat poet rap kan truatsop chak satharana"],
    humanControl: ["重大自动决定保留人工判断", "zhòngdà zìdòng juédìng bǎoliú réngōng pànduàn", "การตัดสินใจอัตโนมัติที่สำคัญยังมีมนุษย์กำกับ", "kan tatsinchai attanomat thi samkhan yang mi manut kamkap"],
    platform: ["线上服务承担相应公共责任", "xiànshàng fúwù chéngdān xiāngyìng gōnggòng zérèn", "บริการออนไลน์รับผิดชอบต่อสาธารณะตามสมควร", "borikan onlai rapphitchop to satharana tam somkhuan"],
    innovation: ["新技术在安全边界内发展", "xīn jìshù zài ānquán biānjiè nèi fāzhǎn", "เทคโนโลยีใหม่พัฒนาภายในขอบเขตปลอดภัย", "theknoloyi mai phatthana phainai khopkhet plotphai"],
    climateJustice: ["气候行动兼顾受影响群体", "qìhòu xíngdòng jiāngù shòu yǐngxiǎng qúntǐ", "การรับมือภูมิอากาศคำนึงถึงกลุ่มที่ได้รับผลกระทบ", "kan rapmue phumiakat khamnueng thueng klum thi dai rap phonkathop"],
    carbon: ["组织准确管理温室气体影响", "zǔzhī zhǔnquè guǎnlǐ wēnshì qìtǐ yǐngxiǎng", "องค์กรจัดการผลกระทบก๊าซเรือนกระจกอย่างแม่นยำ", "ongkon chatkan phonkathop kat ruean krachok yang maenyam"],
    circular: ["材料在经济系统中循环使用", "cáiliào zài jīngjì xìtǒng zhōng xúnhuán shǐyòng", "วัสดุหมุนเวียนใช้ซ้ำในระบบเศรษฐกิจ", "watsadu munwian chai sam nai rabop setthakit"],
    ecosystem: ["开发活动避免破坏自然系统", "kāifā huódòng bìmiǎn pòhuài zìrán xìtǒng", "กิจกรรมพัฒนาหลีกเลี่ยงการทำลายระบบธรรมชาติ", "kitchakam phatthana likliang kan thamlai rabop thammachat"],
    transition: ["受影响劳动者获得新机会", "shòu yǐngxiǎng láodòngzhě huòdé xīn jīhuì", "แรงงานที่ได้รับผลกระทบมีโอกาสใหม่", "raengngan thi dai rap phonkathop mi okat mai"],
    basicSecurity: ["居民稳定获得基本生活资源", "jūmín wěndìng huòdé jīběn shēnghuó zīyuán", "ประชาชนเข้าถึงทรัพยากรพื้นฐานอย่างมั่นคง", "prachachon khaothueng sapphayakon phuenthan yang mankhong"],
    healthEquity: ["不同群体公平获得健康服务", "bùtóng qúntǐ gōngpíng huòdé jiànkāng fúwù", "กลุ่มต่าง ๆ เข้าถึงบริการสุขภาพอย่างเท่าเทียม", "klum tang tang khaothueng borikan sukkhaphap yang thaothiam"],
    care: ["照护劳动被社会看见", "zhàohù láodòng bèi shèhuì kànjiàn", "งานดูแลได้รับการมองเห็นจากสังคม", "ngan dulae dai rap kan monghen chak sangkhom"],
    aging: ["城市环境适合不同年龄居民", "chéngshì huánjìng shìhé bùtóng niánlíng jūmín", "สภาพเมืองเหมาะกับประชาชนทุกวัย", "saphap mueang mokap prachachon thuk wai"],
    accessibility: ["更多人独立使用产品服务", "gèng duō rén dúlì shǐyòng chǎnpǐn fúwù", "ผู้คนจำนวนมากขึ้นใช้สินค้าและบริการได้ด้วยตนเอง", "phukhon chamnuan mak khuen chai sinkha lae borikan dai duai ton eng"],
    actualAttendance: ["实际出席人员得到确认", "shíjì chūxí rényuán dédào quèrèn", "ยืนยันรายชื่อผู้เข้าร่วมจริงได้", "yuenyan raichue phu khao ruam ching dai"],
    accessLog: ["访问人员和时间被完整保存", "fǎngwèn rényuán hé shíjiān bèi wánzhěng bǎocún", "เก็บชื่อผู้เข้าถึงและเวลาไว้อย่างครบถ้วน", "kep chue phu khaothueng lae wela wai yang khropthuan"],
    accessLevel: ["不同资料采用相应保护措施", "bùtóng zīliào cǎiyòng xiāngyìng bǎohù cuòshī", "ข้อมูลแต่ละระดับได้รับมาตรการคุ้มครองที่เหมาะสม", "khomun tae la radap dai rap mattrakan khumkhrong thi mosom"],
    purchaseDetails: ["采购品项、数量和价格被准确登记", "cǎigòu pǐnxiàng, shùliàng hé jiàgé bèi zhǔnquè dēngjì", "บันทึกรายการ จำนวน และราคาจัดซื้ออย่างถูกต้อง", "banthuek raikan chamnuan lae rakha chatsue yang thuktong"],
    qualityReview: ["质量问题可以回溯复查", "zhìliàng wèntí kěyǐ huísù fùchá", "ย้อนตรวจสอบปัญหาคุณภาพได้", "yon truatsop panha khunnaphap dai"],
    resourceGap2: ["人员或设备仍有不足", "rényuán huò shèbèi réng yǒu bùzú", "กำลังคนหรืออุปกรณ์ยังไม่เพียงพอ", "kamlang khon rue uppakon yang mai phiangpho"],
    scheduleLag: ["实际进度已经偏离原计划", "shíjì jìndù yǐjīng piānlí yuán jìhuà", "ความคืบหน้าจริงเบี่ยงจากแผนเดิมแล้ว", "khwam khuepna ching biang chak phaen doem laeo"],
    budgetGap: ["实际成本已经偏离预算", "shíjì chéngběn yǐjīng piānlí yùsuàn", "ต้นทุนจริงคลาดจากงบประมาณแล้ว", "tonthun ching khlat chak ngoppraman laeo"],
    recoveryMetric: ["系统恢复速度可以被衡量", "xìtǒng huīfù sùdù kěyǐ bèi héngliáng", "วัดความเร็วในการกู้ระบบได้", "wat khwam reo nai kan ku rabop dai"],
    purchaseIntent: ["顾客已经表现出较强购买意愿", "gùkè yǐjīng biǎoxiàn chū jiàoqiáng gòumǎi yìyuàn", "ลูกค้าแสดงความตั้งใจซื้อค่อนข้างสูง", "lukkha sadaeng khwam tangchai sue khonkhang sung"],
    complaintHandling: ["投诉内容和处理结果被完整保存", "tóusù nèiróng hé chǔlǐ jiéguǒ bèi wánzhěng bǎocún", "เก็บรายละเอียดข้อร้องเรียนและผลการจัดการไว้อย่างครบถ้วน", "kep raila-iat kho rongrian lae phon kan chatkan wai yang khropthuan"],
    correctDelivery: ["包裹送到正确人员和地点", "bāoguǒ sòngdào zhèngquè rényuán hé dìdiǎn", "พัสดุส่งถึงบุคคลและสถานที่ที่ถูกต้อง", "phatsadu song thueng bukkhon lae sathanti thi thuktong"],
    completeOrder: ["客户收到准确完整的商品", "kèhù shōudào zhǔnquè wánzhěng de shāngpǐn", "ลูกค้าได้รับสินค้าถูกต้องและครบถ้วน", "lukkha dai rap sinkha thuktong lae khropthuan"],
    compensation: ["高价值包裹受损后得到合理赔偿", "gāo jiàzhí bāoguǒ shòusǔn hòu dédào hélǐ péicháng", "พัสดุมูลค่าสูงได้รับค่าชดเชยที่เหมาะสมเมื่อเสียหาย", "phatsadu munkha sung dai rap kha chotchoei thi mosom muea sia hai"],
    accountOwner: ["收款主体身份明确", "shōukuǎn zhǔtǐ shēnfèn míngquè", "ระบุตัวตนของผู้รับเงินได้ชัดเจน", "rabu tuaton khong phu rap ngoen dai chatchen"],
    workTime: ["员工上下班时间被准确登记", "yuángōng shàngxiàbān shíjiān bèi zhǔnquè dēngjì", "บันทึกเวลาเข้าออกงานของพนักงานอย่างถูกต้อง", "banthuek wela khao ok ngan khong phanakngan yang thuktong"],
    clockError: ["考勤记录需要进一步核对", "kǎoqín jìlù xūyào jìnyíbù héduì", "ข้อมูลเวลาทำงานต้องตรวจสอบเพิ่มเติม", "khomun wela thamngan tong truatsop phoemtoem"],
    teamBond: ["团队成员更愿意相互协作", "tuánduì chéngyuán gèng yuànyì xiānghù xiézuò", "สมาชิกทีมเต็มใจร่วมมือกันมากขึ้น", "samachik thim temchai ruammue kan mak khuen"],
    staffRetention: ["员工更愿意长期留任", "yuángōng gèng yuànyì chángqī liúrèn", "พนักงานเต็มใจทำงานต่อในระยะยาว", "phanakngan temchai thamngan to nai raya yao"],
    parking: ["住户知道车辆应停放的位置", "zhùhù zhīdào chēliàng yīng tíngfàng de wèizhi", "ผู้อยู่อาศัยรู้ตำแหน่งที่ควรจอดรถ", "phu yu asai ru tamnaeng thi khuan chot rot"],
    outagePlan: ["住户提前调整日常安排", "zhùhù tíqián tiáozhěng rìcháng ānpái", "ผู้อยู่อาศัยปรับแผนประจำวันล่วงหน้า", "phu yu asai prap phaen pracham wan luangna"],
    homeVisit: ["家政人员按预约时间上门", "jiāzhèng rényuán àn yùyuē shíjiān shàngmén", "พนักงานแม่บ้านมาตามเวลานัด", "phanakngan maeban ma tam wela nat"],
    movingEase: ["搬家过程更加省力", "bānjiā guòchéng gèngjiā shěnglì", "การย้ายบ้านใช้แรงน้อยลง", "kan yai ban chai raeng noi long"],
    lostItem: ["失主更快找回物品", "shīzhǔ gèng kuài zhǎohuí wùpǐn", "เจ้าของตามหาสิ่งของคืนได้เร็วขึ้น", "chaokhong tam ha singkhong khuen dai reo khuen"],
    joinMeeting: ["参会者顺利进入线上会议", "cānhuìzhě shùnlì jìnrù xiànshàng huìyì", "ผู้เข้าร่วมเข้าสู่การประชุมออนไลน์ได้ราบรื่น", "phu khao ruam khaosu kan prachum onlai dai rapruen"],
    senderIdentity: ["收件人知道发件人的身份和职位", "shōujiànrén zhīdào fājiànrén de shēnfèn hé zhíwèi", "ผู้รับทราบตัวตนและตำแหน่งของผู้ส่ง", "phu rap sap tuaton lae tamnaeng khong phu song"],
    massDelivery: ["同一通知同时送达多人", "tóng yí tōngzhī tóngshí sòngdá duō rén", "ประกาศเดียวส่งถึงหลายคนพร้อมกัน", "prakat diao song thueng lai khon phrom kan"],
    recipientPrivacy: ["收件人地址不向其他人公开", "shōujiànrén dìzhǐ bú xiàng qítā rén gōngkāi", "ที่อยู่อีเมลของผู้รับไม่เปิดเผยต่อผู้อื่น", "thi yu imel khong phu rap mai poetphoei to phu uen"],
    inboxFocus: ["收件人快速找到重要邮件", "shōujiànrén kuàisù zhǎodào zhòngyào yóujiàn", "ผู้รับค้นหาอีเมลสำคัญได้รวดเร็ว", "phu rap khonha imel samkhan dai ruatreo"],
    fileSecurity: ["文件内容只向授权人员开放", "wénjiàn nèiróng zhǐ xiàng shòuquán rényuán kāifàng", "เนื้อหาไฟล์เปิดให้เฉพาะผู้ได้รับสิทธิ์", "nueaha fai poet hai chapho phu dai rap sit"],
    networkQuality2: ["当前网络连接质量得到判断", "dāngqián wǎngluò liánjiē zhìliàng dédào pànduàn", "ประเมินคุณภาพการเชื่อมต่อเครือข่ายปัจจุบันได้", "pramoen khunnaphap kan chueamto khrueakhai patchuban dai"],
    dataBalance: ["套餐剩余流量是否足够", "tàocān shèngyú liúliàng shìfǒu zúgòu", "ดาต้าที่เหลือในแพ็กเกจเพียงพอหรือไม่", "data thi luea nai phaekket phiangpho rue mai"],
    insufficientFunds: ["当前余额无法完成付款", "dāngqián yú'é wúfǎ wánchéng fùkuǎn", "ยอดเงินปัจจุบันไม่พอชำระรายการ", "yot ngoen patchuban mai pho chamra raikan"],
    failedPayment: ["本次交易没有完成", "běncì jiāoyì méiyǒu wánchéng", "ธุรกรรมครั้งนี้ยังไม่สำเร็จ", "thurakam khrang ni yang mai samret"],
    ontimePayment: ["用户按时完成付款", "yònghù ànshí wánchéng fùkuǎn", "ผู้ใช้ชำระเงินได้ตรงเวลา", "phuchai chamra ngoen dai trong wela"],
    sourceProtection: ["编辑部核实内容，同时保护消息来源", "biānjíbù héshí nèiróng, tóngshí bǎohù xiāoxi láiyuán", "กองบรรณาธิการตรวจสอบเนื้อหาพร้อมคุ้มครองแหล่งข่าว", "kong bannathikan truatsop nueaha phrom khumkhrong laeng khao"],
    audienceReach: ["内容被更多目标受众看见", "nèiróng bèi gèng duō mùbiāo shòuzhòng kànjiàn", "กลุ่มเป้าหมายเห็นเนื้อหามากขึ้น", "klum paomai hen nueaha mak khuen"],
    activeReading: ["内容实际触达了多少读者", "nèiróng shíjì chùdá le duōshao dúzhě", "เนื้อหาเข้าถึงผู้อ่านจริงจำนวนเท่าใด", "nueaha khaothueng phu an ching chamnuan thaodai"],
    subtitleAccess: ["不同语言的观众都能理解内容", "bùtóng yǔyán de guānzhòng dōu néng lǐjiě nèiróng", "ผู้ชมต่างภาษาล้วนเข้าใจเนื้อหาได้", "phu chom tang phasa luan khaochai nueaha dai"],
    buyingReason: ["团队理解顾客为什么购买", "tuánduì lǐjiě gùkè wèishénme gòumǎi", "ทีมเข้าใจว่าทำไมลูกค้าจึงซื้อ", "thim khaochai wa thammai lukkha chueng sue"],
    painImprovement: ["团队找到最需要改进的环节", "tuánduì zhǎodào zuì xūyào gǎijìn de huánjié", "ทีมพบขั้นตอนที่ต้องปรับปรุงมากที่สุด", "thim phop khanton thi tong prapprung mak thi sut"],
    marketEntry: ["新企业进入市场的难度", "xīn qǐyè jìnrù shìchǎng de nándù", "ระดับความยากที่ธุรกิจใหม่จะเข้าสู่ตลาด", "radap khwam yak thi thurakit mai cha khaosu talat"],
    orderValue: ["每笔订单的平均消费金额", "měi bǐ dìngdān de píngjūn xiāofèi jīné", "ยอดใช้จ่ายเฉลี่ยต่อคำสั่งซื้อ", "yot chai chai chalia to khamsang sue"],
    breakEven: ["收入何时能够覆盖全部成本", "shōurù héshí nénggòu fùgài quánbù chéngběn", "รายได้จะครอบคลุมต้นทุนทั้งหมดเมื่อใด", "raidai cha khropkhlum tonthun thangmot mueadai"],
    inventorySpeed: ["库存转化为销售的速度", "kùcún zhuǎnhuà wéi xiāoshòu de sùdù", "ความเร็วที่สินค้าคงคลังเปลี่ยนเป็นยอดขาย", "khwam reo thi sinkha khongkhlang plian pen yot khai"],
    businessTrend2: ["业务增长正在发生变化", "yèwù zēngzhǎng zhèngzài fāshēng biànhuà", "การเติบโตของธุรกิจกำลังเปลี่ยนแปลง", "kan toepto khong thurakit kamlang plianplaeng"],
    correlationOnly: ["两个变量一起变化，但未必互为因果", "liǎng ge biànliàng yìqǐ biànhuà, dàn wèibì hùwéi yīnguǒ", "ตัวแปรสองตัวเปลี่ยนไปด้วยกัน แต่ไม่จำเป็นต้องเป็นเหตุผลกัน", "tuaprae song tua plian pai duai kan tae mai champen tong pen hetphon kan"],
    seasonalPattern: ["业务数据随季节周期起伏", "yèwù shùjù suí jìjié zhōuqī qǐfú", "ข้อมูลธุรกิจขึ้นลงตามรอบฤดูกาล", "khomun thurakit khuen long tam rop ruedukan"],
    churnSignal: ["部分用户正在停止使用产品", "bùfen yònghù zhèngzài tíngzhǐ shǐyòng chǎnpǐn", "ผู้ใช้บางส่วนกำลังเลิกใช้ผลิตภัณฑ์", "phuchai bang suan kamlang loek chai phalitthaphan"],
    retentionShape: ["不同时间段的用户留存变化清楚呈现", "bùtóng shíjiānduàn de yònghù liúcún biànhuà qīngchu chéngxiàn", "การเปลี่ยนแปลงการคงอยู่ของผู้ใช้ในแต่ละช่วงเวลาปรากฏอย่างชัดเจน", "kan plianplaeng kan khong yu khong phuchai nai tae la chuang wela prakot yang chatchen"],
    relatedConflict: ["交易双方可能存在利益关联", "jiāoyì shuāngfāng kěnéng cúnzài lìyì guānlián", "คู่ธุรกรรมอาจมีผลประโยชน์เกี่ยวโยงกัน", "khu thurakam at mi phonprayot kiaoyong kan"],
    acceptedRisk: ["组织愿意接受的风险水平得到界定", "zǔzhī yuànyì jiēshòu de fēngxiǎn shuǐpíng dédào jièdìng", "กำหนดระดับความเสี่ยงที่องค์กรยอมรับได้", "kamnot radap khwam siang thi ongkon yomrap dai"],
    reasoningStart: ["推理的起点得到明确呈现", "tuīlǐ de qǐdiǎn dédào míngquè chéngxiàn", "จุดตั้งต้นของการให้เหตุผลถูกนำเสนอชัดเจน", "chut tangton khong kan hai hetphon thuk nam sanoe chatchen"],
    expertBasis: ["决策获得专业知识支持", "juécè huòdé zhuānyè zhīshi zhīchí", "การตัดสินใจได้รับการสนับสนุนจากความรู้เฉพาะทาง", "kan tatsinchai dai rap kan sanapsanun chak khwamru chapho thang"],
    biasRisk: ["判断可能忽略与原有看法相反的信息", "pànduàn kěnéng hūlüè yǔ yuányǒu kànfǎ xiāngfǎn de xìnxī", "การตัดสินอาจมองข้ามข้อมูลที่ขัดกับความเห็นเดิม", "kan tatsin at mongkham khomun thi khat kap khwam hen doem"],
    hierarchyInfluence: ["组织层级正在影响沟通方式", "zǔzhī céngjí zhèngzài yǐngxiǎng gōutōng fāngshì", "ลำดับชั้นองค์กรกำลังมีผลต่อรูปแบบการสื่อสาร", "lamdap chan ongkon kamlang mi phon to rupbaep kan suesan"],
    policyMeasure: ["政策实际效果得到客观衡量", "zhèngcè shíjì xiàoguǒ dédào kèguān héngliáng", "วัดผลจริงของนโยบายอย่างเป็นกลางได้", "wat phon ching khong nayobai yang pen klang dai"],
    pilotLearning: ["政策在全面实施前先接受检验", "zhèngcè zài quánmiàn shíshī qián xiān jiēshòu jiǎnyàn", "นโยบายได้รับการทดสอบก่อนดำเนินการเต็มรูปแบบ", "nayobai dai rap kan thotsop kon damnoenkan tem rupbaep"],
    sharedSpace: ["居民拥有交流和共同活动的场所", "jūmín yǒngyǒu jiāoliú hé gòngtóng huódòng de chǎngsuǒ", "ประชาชนมีสถานที่พบปะและทำกิจกรรมร่วมกัน", "prachachon mi sathanti phoppa lae tham kitchakam ruam kan"],
    unfairDistribution: ["城乡获得的发展机会仍不均等", "chéngxiāng huòdé de fāzhǎn jīhuì réng bù jūnděng", "โอกาสพัฒนาระหว่างเมืองกับชนบทยังไม่เท่าเทียม", "okat phatthana rawang mueang kap chonnabot yang mai thaothiam"],
    brainDrain2: ["本地专业人才正在减少", "běndì zhuānyè réncái zhèngzài jiǎnshǎo", "บุคลากรวิชาชีพในท้องถิ่นกำลังลดลง", "bukhlakon wichachip nai thongthin kamlang lot long"],
    gigChange: ["就业形式变得更灵活，也更不稳定", "jiùyè xíngshì biàn de gèng línghuó, yě gèng bù wěndìng", "รูปแบบงานยืดหยุ่นขึ้นแต่ก็ไม่มั่นคงขึ้น", "rupbaep ngan yuetyun khuen tae ko mai mankhong khuen"],
    middleClassRole: ["社会结构和消费能力正在变化", "shèhuì jiégòu hé xiāofèi nénglì zhèngzài biànhuà", "โครงสร้างสังคมและกำลังซื้อกำลังเปลี่ยนแปลง", "khrongsang sangkhom lae kamlang sue kamlang plianplaeng"],
    vulnerableReality: ["部分群体仍难以平等参与社会", "bùfen qúntǐ réng nányǐ píngděng cānyù shèhuì", "บางกลุ่มยังเข้าร่วมสังคมอย่างเท่าเทียมได้ยาก", "bang klum yang khao ruam sangkhom yang thaothiam dai yak"],
    culturalMeaning: ["特定符号正在传达群体文化含义", "tèdìng fúhào zhèngzài chuándá qúntǐ wénhuà hányì", "สัญลักษณ์บางอย่างกำลังสื่อความหมายทางวัฒนธรรมของกลุ่ม", "sanyalak bang yang kamlang sue khwammai thang watthanatham khong klum"],
    subcultureDiversity: ["社会中的身份和生活方式更加多样", "shèhuì zhōng de shēnfèn hé shēnghuó fāngshì gèngjiā duōyàng", "อัตลักษณ์และวิถีชีวิตในสังคมหลากหลายขึ้น", "attalak lae withi chiwit nai sangkhom laklai khuen"],
    faithInLife: ["信仰正在具体影响日常生活", "xìnyǎng zhèngzài jùtǐ yǐngxiǎng rìcháng shēnghuó", "ความเชื่อกำลังส่งผลต่อชีวิตประจำวันอย่างเป็นรูปธรรม", "khwam chuea kamlang song phon to chiwit pracham wan yang pen ruptham"],
    digitalLiteracy2: ["个人更清楚地管理线上行为记录", "gèrén gèng qīngchu de guǎnlǐ xiànshàng xíngwéi jìlù", "บุคคลจัดการร่องรอยพฤติกรรมออนไลน์ได้ชัดเจนขึ้น", "bukkhon chatkan rongroi pharuetikam onlai dai chatchen khuen"],
    emotionalSpread: ["情绪正在不同用户之间快速扩散", "qíngxù zhèngzài bùtóng yònghù zhījiān kuàisù kuòsàn", "อารมณ์กำลังแพร่เร็วระหว่างผู้ใช้", "arom kamlang phrae reo rawang phuchai"],
    deepfakeRisk: ["影像或声音可能经过人工合成", "yǐngxiàng huò shēngyīn kěnéng jīngguò réngōng héchéng", "ภาพหรือเสียงอาจถูกสังเคราะห์ขึ้น", "phap rue siang at thuk sangkhro khuen"],
    trailReality: ["线上行为会留下可追踪记录", "xiànshàng xíngwéi huì liúxià kě zhuīzōng jìlù", "พฤติกรรมออนไลน์ทิ้งร่องรอยที่ติดตามได้", "pharuetikam onlai thing rongroi thi tittam dai"],
    informedAccess: ["公众能够获得与自身权益有关的信息", "gōngzhòng nénggòu huòdé yǔ zìshēn quányì yǒuguān de xìnxī", "ประชาชนเข้าถึงข้อมูลที่เกี่ยวกับสิทธิของตนได้", "prachachon khaothueng khomun thi kiao kap sitthi khong ton dai"],
    eraseData: ["个人可以要求删除不再必要的数据", "gèrén kěyǐ yāoqiú shānchú bú zài bìyào de shùjù", "บุคคลขอให้ลบข้อมูลที่ไม่จำเป็นแล้วได้", "bukkhon kho hai lop khomun thi mai champen laeo dai"],
    unfairAutomation: ["自动结果可能对某些群体不公平", "zìdòng jiéguǒ kěnéng duì mǒuxiē qúntǐ bù gōngpíng", "ผลอัตโนมัติอาจไม่เป็นธรรมต่อบางกลุ่ม", "phon attanomat at mai pen tham to bang klum"],
    autoAccountability: ["自动决定造成后果时有明确负责人", "zìdòng juédìng zàochéng hòuguǒ shí yǒu míngquè fùzérén", "เมื่อการตัดสินใจอัตโนมัติเกิดผลกระทบจะมีผู้รับผิดชอบชัดเจน", "muea kan tatsinchai attanomat koet phonkathop cha mi phu rapphitchop chatchen"],
    neutralityQuestion: ["技术设计也可能包含价值选择", "jìshù shèjì yě kěnéng bāohán jiàzhí xuǎnzé", "การออกแบบเทคโนโลยีก็อาจมีการเลือกเชิงคุณค่า", "kan okbaep theknoloyi ko at mi kan lueak choeng khunkha"],
    techCompetition: ["市场竞争和创新空间受到限制", "shìchǎng jìngzhēng hé chuàngxīn kōngjiān shòudào xiànzhì", "การแข่งขันและพื้นที่นวัตกรรมในตลาดถูกจำกัด", "kan khaengkhan lae phuenthi nawattakam nai talat thuk chamkat"],
    greenCapital: ["资金流向环境影响较小的项目", "zījīn liúxiàng huánjìng yǐngxiǎng jiào xiǎo de xiàngmù", "เงินทุนไหลไปสู่โครงการที่กระทบสิ่งแวดล้อมน้อยกว่า", "ngoen thun lai pai su khrongkan thi krathop singwaetlom noi kwa"],
    resourceUse2: ["单位产出消耗的资源更少", "dānwèi chǎnchū xiāohào de zīyuán gèng shǎo", "ผลผลิตหนึ่งหน่วยใช้ทรัพยากรน้อยลง", "phonphalit nueng nuai chai sapphayakon noi long"],
    greenPurchase: ["采购优先选择环境负担较低的产品", "cǎigòu yōuxiān xuǎnzé huánjìng fùdān jiào dī de chǎnpǐn", "การจัดซื้อให้ความสำคัญกับสินค้าที่มีภาระต่อสิ่งแวดล้อมต่ำกว่า", "kan chatsue hai khwam samkhan kap sinkha thi mi phara to singwaetlom tam kwa"],
    sustainableSupply: ["供应环节同时兼顾环境和劳动标准", "gōngyìng huánjié tóngshí jiāngù huánjìng hé láodòng biāozhǔn", "ขั้นตอนอุปทานคำนึงถึงทั้งสิ่งแวดล้อมและมาตรฐานแรงงาน", "khanton uppathan khamnueng thueng thang singwaetlom lae mattrathan raengngan"],
    naturalValue: ["生态系统的经济与社会价值被看见", "shēngtài xìtǒng de jīngjì yǔ shèhuì jiàzhí bèi kànjiàn", "มองเห็นคุณค่าทางเศรษฐกิจและสังคมของระบบนิเวศ", "monghen khunkha thang setthakit lae sangkhom khong rabop niwet"],
    impactBefore: ["开发前先识别可能的环境损害", "kāifā qián xiān shíbié kěnéng de huánjìng sǔnhài", "ระบุความเสียหายต่อสิ่งแวดล้อมที่อาจเกิดก่อนพัฒนา", "rabu khwam sia hai to singwaetlom thi at koet kon phatthana"],
    socialImpact2: ["受影响群体和分配后果得到识别", "shòu yǐngxiǎng qúntǐ hé fēnpèi hòuguǒ dédào shíbié", "ระบุกลุ่มที่ได้รับผลกระทบและผลด้านการกระจาย", "rabu klum thi dai rap phonkathop lae phon dan kan krachai"],
    demographicGain: ["适龄劳动人口为经济增长提供动力", "shìlíng láodòng rénkǒu wèi jīngjì zēngzhǎng tígōng dònglì", "ประชากรวัยแรงงานช่วยขับเคลื่อนการเติบโตทางเศรษฐกิจ", "prachakon wai raengngan chuai khapkhluean kan toepto thang setthakit"],
    prospectNurture: ["销售有机会进一步培育购买需求", "xiāoshòu yǒu jīhuì jìnyíbù péiyù gòumǎi xūqiú", "ฝ่ายขายมีโอกาสพัฒนาความต้องการซื้อเพิ่มเติม", "fai khai mi okat phatthana khwam tongkan sue phoemtoem"],
    housingFund: ["员工获得长期住房储蓄支持", "yuángōng huòdé chángqī zhùfáng chǔxù zhīchí", "พนักงานได้รับการสนับสนุนเงินออมเพื่อที่อยู่อาศัยระยะยาว", "phanakngan dai rap kan sanapsanun ngoen om phuea thi yu asai raya yao"],
    applicationProof: ["申请方获得可信的能力证明", "shēnqǐngfāng huòdé kěxìn de nénglì zhèngmíng", "ผู้สมัครได้รับหลักฐานความสามารถที่น่าเชื่อถือ", "phusamak dai rap lakthan khwam samat thi na chueathue"],
    ecosystemRepair: ["生态损失得到合理补偿与修复", "shēngtài sǔnshī dédào hélǐ bǔcháng yǔ xiūfù", "ความเสียหายต่อระบบนิเวศได้รับการชดเชยและฟื้นฟูอย่างเหมาะสม", "khwam sia hai to rabop niwet dai rap kan chotchoei lae fuenfu yang mosom"],
    energyMix: ["能源系统减少对高碳来源的依赖", "néngyuán xìtǒng jiǎnshǎo duì gāotàn láiyuán de yīlài", "ระบบพลังงานลดการพึ่งพาแหล่งคาร์บอนสูง", "rabop phalangngan lot kan phuengpha laeng khabon sung"],
    exitRules: ["各方知道何时以及如何结束合作", "gèfāng zhīdào héshí yǐjí rúhé jiéshù hézuò", "ทุกฝ่ายรู้ว่าจะยุติความร่วมมือเมื่อใดและอย่างไร", "thuk fai ru wa cha yuti khwam ruammue mueadai lae yangrai"],
    warrantyCoverage: ["交付后的质量责任范围清楚", "jiāofù hòu de zhìliàng zérèn fànwéi qīngchu", "ขอบเขตความรับผิดด้านคุณภาพหลังส่งมอบชัดเจน", "khopkhet khwam rapphit dan khunnaphap lang song mop chatchen"],
    negotiationFocus: ["谈判先处理影响最大的议题", "tánpàn xiān chǔlǐ yǐngxiǎng zuì dà de yìtí", "การเจรจาจัดการประเด็นที่มีผลมากที่สุดก่อน", "kan cheracha chatkan praden thi mi phon mak thi sut kon"],
    laborProtection: ["员工依法获得基本保障", "yuángōng yīfǎ huòdé jīběn bǎozhàng", "พนักงานได้รับหลักประกันพื้นฐานตามกฎหมาย", "phanakngan dai rap lakprakan phuenthan tam kotmai"],
    criticalPath2: ["少数关键任务正在决定整体工期", "shǎoshù guānjiàn rènwu zhèngzài juédìng zhěngtǐ gōngqī", "งานสำคัญบางงานกำลังกำหนดระยะเวลาโครงการทั้งหมด", "ngan samkhan bang ngan kamlang kamnot raya wela khrongkan thangmot"],
    funnelStage: ["客户在不同销售阶段的转化情况得到呈现", "kèhù zài bùtóng xiāoshòu jiēduàn de zhuǎnhuà qíngkuàng dédào chéngxiàn", "การเปลี่ยนผ่านของลูกค้าในแต่ละขั้นการขายปรากฏให้เห็น", "kan plian phan khong lukkha nai tae la khan kan khai prakot hai hen"],
    activeProductUse: ["有多少用户正在持续使用产品", "yǒu duōshao yònghù zhèngzài chíxù shǐyòng chǎnpǐn", "มีผู้ใช้จำนวนเท่าใดที่ยังใช้ผลิตภัณฑ์ต่อเนื่อง", "mi phuchai chamnuan thaodai thi yang chai phalitthaphan tonueang"],
    auditFollow: ["调查人员能够沿线索核实事实", "diàochá rényuán nénggòu yán xiànsuǒ héshí shìshí", "ผู้สอบสวนติดตามร่องรอยเพื่อตรวจสอบข้อเท็จจริงได้", "phu sopsuan tittam rongroi phuea truatsop khothetching dai"],
    sensitivityResult: ["关键假设变化会怎样影响结果", "guānjiàn jiǎshè biànhuà huì zěnyàng yǐngxiǎng jiéguǒ", "การเปลี่ยนสมมติฐานสำคัญจะกระทบผลลัพธ์อย่างไร", "kan plian sommutithan samkhan cha krathop phonlap yangrai"],
    dealPotential: ["客户需求可能转化为实际交易", "kèhù xūqiú kěnéng zhuǎnhuà wéi shíjì jiāoyì", "ความต้องการลูกค้าอาจเปลี่ยนเป็นธุรกรรมจริง", "khwam tongkan lukkha at plian pen thurakam ching"],
    damageCheck: ["包装状况和运输责任需要进一步核查", "bāozhuāng zhuàngkuàng hé yùnshū zérèn xūyào jìnyíbù héchá", "สภาพบรรจุภัณฑ์และความรับผิดในการขนส่งต้องตรวจสอบเพิ่ม", "saphap banchuphan lae khwam rapphit nai kan khonsong tong truatsop phoem"],
    overdueFact: ["款项在约定日期后仍未到账", "kuǎnxiàng zài yuēdìng rìqī hòu réng wèi dàozhàng", "เงินยังไม่เข้าบัญชีหลังพ้นวันที่ตกลง", "ngoen yang mai khao banchi lang phon wanthi toklong"],
    temporaryChange: ["原有安排已经暂时改变", "yuányǒu ānpái yǐjīng zànshí gǎibiàn", "กำหนดการเดิมเปลี่ยนไปชั่วคราว", "kamnotkan doem plian pai chuakhrao"],
    cooperationIntent: ["双方已经表达继续洽谈的意愿", "shuāngfāng yǐjīng biǎodá jìxù qiàtán de yìyuàn", "ทั้งสองฝ่ายแสดงความตั้งใจจะหารือต่อ", "thang song fai sadaeng khwam tangchai cha harue to"],
    timelyDelivery: ["收件人在约定时间收到商品", "shōujiànrén zài yuēdìng shíjiān shōudào shāngpǐn", "ผู้รับได้รับสินค้าตามเวลาที่ตกลง", "phu rap dai rap sinkha tam wela thi toklong"],
    majorReview: ["重要决定经过更高层级或集体审议", "zhòngyào juédìng jīngguò gèng gāo céngjí huò jítǐ shěnyì", "การตัดสินใจสำคัญผ่านการพิจารณาระดับสูงขึ้นหรือแบบคณะ", "kan tatsinchai samkhan phan kan phicharana radap sung khuen rue baep khana"],
    awayNotice: ["发件人知道回复可能延迟以及替代联系人", "fājiànrén zhīdào huífù kěnéng yánchí yǐjí tìdài liánxìrén", "ผู้ส่งทราบว่าคำตอบอาจล่าช้าและรู้ผู้ติดต่อแทน", "phu song sap wa khamtop at lacha lae ru phu titto thaen"],
    pendingTaskDetails: ["待处理事项、负责人和期限被清楚列出", "dài chǔlǐ shìxiàng, fùzérén hé qīxiàn bèi qīngchu lièchū", "ระบุงานที่รอดำเนินการ ผู้รับผิดชอบ และกำหนดเวลาไว้อย่างชัดเจน", "rabu ngan thi ro damnoenkan phu rapphitchop lae kamnot wela wai yang chatchen"],
    inboundDetails: ["入库品项、数量和时间被准确登记", "rùkù pǐnxiàng, shùliàng hé shíjiān bèi zhǔnquè dēngjì", "บันทึกรายการ จำนวน และเวลารับสินค้าเข้าคลังอย่างถูกต้อง", "banthuek raikan chamnuan lae wela rap sinkha khao khlang yang thuktong"],
    outboundDetails: ["出库品项、数量和领取人被准确登记", "chūkù pǐnxiàng, shùliàng hé lǐngqǔrén bèi zhǔnquè dēngjì", "บันทึกรายการ จำนวน และผู้รับสินค้าออกจากคลังอย่างถูกต้อง", "banthuek raikan chamnuan lae phu rap sinkha ok chak khlang yang thuktong"],
    decisionDetails: ["决定内容、理由和责任人被完整写明", "juédìng nèiróng, lǐyóu hé zérènrén bèi wánzhěng xiěmíng", "บันทึกเนื้อหาการตัดสินใจ เหตุผล และผู้รับผิดชอบไว้อย่างครบถ้วน", "banthuek nueaha kan tatsinchai hetphon lae phu rapphitchop wai yang khropthuan"],
    transactionDetails: ["金额、时间与收款方被完整保存", "jīné, shíjiān yǔ shōukuǎnfāng bèi wánzhěng bǎocún", "เก็บจำนวนเงิน เวลา และผู้รับเงินไว้อย่างครบถ้วน", "kep chamnuan ngoen wela lae phu rap ngoen wai yang khropthuan"],
    remediationDetails: ["问题、整改措施与完成情况被完整说明", "wèntí, zhěnggǎi cuòshī yǔ wánchéng qíngkuàng bèi wánzhěng shuōmíng", "อธิบายปัญหา มาตรการแก้ไข และสถานะการดำเนินงานไว้อย่างครบถ้วน", "athibai panha mattrakan kaekhai lae sathana kan damnoen ngan wai yang khropthuan"],
    sourceFarmRisk: ["内容往往为追求流量而批量生产，质量难以保证", "nèiróng wǎngwǎng wèi zhuīqiú liúliàng ér pīliàng shēngchǎn, zhìliàng nányǐ bǎozhèng", "เนื้อหามักถูกผลิตจำนวนมากเพื่อเรียกยอดเข้าชม จึงรับประกันคุณภาพได้ยาก", "nueaha mak thuk phalit chamnuan mak phuea riak yot khaochom chueng rapprakan khunnaphap dai yak"],
    carbonPriceResult: ["排放成本被纳入经营决策", "páifàng chéngběn bèi nàrù jīngyíng juécè", "ต้นทุนการปล่อยก๊าซถูกนำมาพิจารณาในการตัดสินใจทางธุรกิจ", "tonthun kan ploi kat thuk nam ma phicharana nai kan tatsinchai thang thurakit"]
  };

  const PATTERNS = {
    improve: (h, o) => [`通过${h.zh}，有助于${o[0]}。`, `Tōngguò ${h.py}, yǒuzhù yú ${o[1]}.`, `${h.th}ช่วยให้${o[2]}`, `${cap(h.ro)} chuai hai ${o[3]}`],
    reduce: (h, o) => [`采用${h.zh}，有助于${o[0]}。`, `Cǎiyòng ${h.py}, yǒuzhù yú ${o[1]}.`, `${h.th}ช่วยให้${o[2]}`, `${cap(h.ro)} chuai hai ${o[3]}`],
    prevent: (h, o) => [`妥善运用${h.zh}，有助于${o[0]}。`, `Tuǒshàn yùnyòng ${h.py}, yǒuzhù yú ${o[1]}.`, `${h.th}ช่วยให้${o[2]}`, `${cap(h.ro)} chuai hai ${o[3]}`],
    ensure: (h, o) => [`在${h.zh}相关工作中，需要确保${o[0]}。`, `Zài ${h.py} xiāngguān gōngzuò zhōng, xūyào quèbǎo ${o[1]}.`, `ในการดำเนินงานเกี่ยวกับ${h.th} ต้องตรวจให้แน่ใจว่า${o[2]}`, `Nai kan damnoen ngan kiaokap ${h.ro}, tong truat hai nae chai wa ${o[3]}`],
    support: (h, o) => [`${h.zh}有助于${o[0]}。`, `${cap(h.py)} yǒuzhù yú ${o[1]}.`, `${h.th}ช่วยให้${o[2]}`, `${cap(h.ro)} chuai hai ${o[3]}`],
    require: (h, o) => [`涉及${h.zh}时，必须确保${o[0]}。`, `Shèjí ${h.py} shí, bìxū quèbǎo ${o[1]}.`, `เมื่อเกี่ยวข้องกับ${h.th} ต้องตรวจให้แน่ใจว่า${o[2]}`, `Muea kiaokhong kap ${h.ro}, tong truat hai nae chai wa ${o[3]}`],
    reveal: (h, o) => [`从${h.zh}可以看出：${o[0]}。`, `Cóng ${h.py} kěyǐ kànchū: ${o[1]}.`, `จาก${h.th}เห็นได้ว่า${o[2]}`, `Chak ${h.ro} hen dai wa ${o[3]}`],
    affect: (h, o) => [`考察${h.zh}时，还需要关注它与以下结果的关系：${o[0]}。`, `Kǎochá ${h.py} shí, hái xūyào guānzhù tā yǔ yǐxià jiéguǒ de guānxì: ${o[1]}.`, `เมื่อพิจารณา${h.th} ควรพิจารณาความสัมพันธ์กับผลลัพธ์นี้ด้วย: ${o[2]}`, `Muea phicharana ${h.ro}, khuan phicharana khwam samphan kap phonlap ni duai: ${o[3]}`],
    enable: (h, o) => [`${h.zh}有助于${o[0]}。`, `${cap(h.py)} yǒuzhù yú ${o[1]}.`, `${h.th}ช่วยให้${o[2]}`, `${cap(h.ro)} chuai hai ${o[3]}`],
    protect: (h, o) => [`${h.zh}得到充分保护时，${o[0]}。`, `${cap(h.py)} dédào chōngfèn bǎohù shí, ${o[1]}.`, `เมื่อ${h.th}ได้รับการคุ้มครองอย่างเหมาะสม ${o[2]}`, `Muea ${h.ro} dai rap kan khumkhrong yang mosom, ${o[3]}`],
    strengthen: (h, o) => [`重视${h.zh}，有助于${o[0]}。`, `Zhòngshì ${h.py}, yǒuzhù yú ${o[1]}.`, `การให้ความสำคัญกับ${h.th}ช่วยให้${o[2]}`, `Kan hai khwam samkhan kap ${h.ro} chuai hai ${o[3]}`],
    record: (h, o) => [`查阅${h.zh}，可以确认：${o[0]}。`, `Cháyuè ${h.py}, kěyǐ quèrèn: ${o[1]}.`, `การตรวจดู${h.th}ช่วยยืนยันว่า${o[2]}`, `Kan truatdu ${h.ro} chuai yuenyan wa ${o[3]}`],
    clarify: (h, o) => [`${h.zh}需要说明清楚，以便${o[0]}。`, `${cap(h.py)} xūyào shuōmíng qīngchu, yǐbiàn ${o[1]}.`, `ควรอธิบาย${h.th}ให้ชัด เพื่อให้${o[2]}`, `Khuan athibai ${h.ro} hai chat, phuea hai ${o[3]}`],
    track: (h, o) => [`借助${h.zh}，可以持续跟进以下情况：${o[0]}。`, `Jièzhù ${h.py}, kěyǐ chíxù gēnjìn yǐxià qíngkuàng: ${o[1]}.`, `ใช้${h.th}ติดตามสถานการณ์ต่อไปนี้: ${o[2]}`, `Chai ${h.ro} tittam sathanakan topai ni: ${o[3]}`],
    resolve: (h, o) => [`通过${h.zh}，${o[0]}。`, `Tōngguò ${h.py}, ${o[1]}.`, `ด้วย${h.th} ${o[2]}`, `Duai ${h.ro}, ${o[3]}`],
    guide: (h, o) => [`${h.zh}可为相关工作提供参考，有助于${o[0]}。`, `${cap(h.py)} kě wèi xiāngguān gōngzuò tígōng cānkǎo, yǒuzhù yú ${o[1]}.`, `${h.th}ใช้เป็นแนวทางประกอบงาน ช่วยให้${o[2]}`, `${cap(h.ro)} chai pen naeo thang prakop ngan, chuai hai ${o[3]}`],
    confirm: (h, o) => [`核对${h.zh}可以确认：${o[0]}。`, `Héduì ${h.py} kěyǐ quèrèn: ${o[1]}.`, `การตรวจสอบ${h.th}ช่วยยืนยันว่า${o[2]}`, `Kan truatsop ${h.ro} chuai yuenyan wa ${o[3]}`],
    signal: (h, o) => [`出现“${h.zh}”时，应注意：${o[0]}。`, `Chūxiàn “${h.py}” shí, yīng zhùyì: ${o[1]}.`, `เมื่อพบ${h.th} ควรสังเกตว่า${o[2]}`, `Muea phop ${h.ro}, khuan sangket wa ${o[3]}`],
    define: (h, o) => [`${h.zh}意味着${o[0]}。`, `${cap(h.py)} yìwèizhe ${o[1]}.`, `${h.th}หมายความว่า${o[2]}`, `${cap(h.ro)} maikhwam wa ${o[3]}`],
    use: (h, o) => [`我们使用${h.zh}，目的是让${o[0]}。`, `Wǒmen shǐyòng ${h.py}, mùdì shì ràng ${o[1]}.`, `เราใช้${h.th}เพื่อให้${o[2]}`, `Rao chai ${h.ro} phuea hai ${o[3]}`],
    mind: (h, o) => [`讨论${h.zh}时，要特别注意：${o[0]}。`, `Tǎolùn ${h.py} shí, yào tèbié zhùyì: ${o[1]}.`, `เมื่อหารือเรื่อง${h.th} ควรระวังว่า${o[2]}`, `Muea harue rueang ${h.ro}, khuan rawang wa ${o[3]}`],
    utter: h => [`${h.zh}。`, `${cap(h.py)}.`, `${h.th}`, `${cap(h.ro)}.`],
    question: h => [`${h.zh}？`, `${cap(h.py)}?`, `${h.th}`, `${cap(h.ro)}?`],
    engage: (h, o) => [`让${h.zh}参与后，${o[0]}。`, `Ràng ${h.py} cānyù hòu, ${o[1]}.`, `เมื่อเปิดให้${h.th}มีส่วนร่วม ${o[2]}`, `Muea poet hai ${h.ro} mi suan ruam, ${o[3]}`],
    configure: (h, o) => [`设置${h.zh}后，${o[0]}。`, `Shèzhì ${h.py} hòu, ${o[1]}.`, `เมื่อตั้งค่า${h.th} ${o[2]}`, `Muea tangkha ${h.ro}, ${o[3]}`]
  };

  const NOTES = {
    work: ["工作流程与职场沟通用语。", "ใช้ในขั้นตอนงานและการสื่อสารในที่ทำงาน"],
    daily: ["日常生活与办事用语。", "ใช้ในชีวิตประจำวันและการติดต่อบริการ"],
    shopping: ["交易、付款与售后用语。", "ใช้ในการซื้อขาย การชำระเงิน และบริการหลังการขาย"],
    travel: ["出行、配送与位置相关用语。", "ใช้เกี่ยวกับการเดินทาง การจัดส่ง และสถานที่"],
    social: ["人际互动与社会沟通用语。", "ใช้ในการปฏิสัมพันธ์และการสื่อสารทางสังคม"],
    study: ["学习、研究与知识表达用语。", "ใช้ในการเรียน การวิจัย และการอธิบายความรู้"],
    health: ["健康、照护与安全相关用语。", "ใช้เกี่ยวกับสุขภาพ การดูแล และความปลอดภัย"],
    emergency: ["风险处理与紧急应对用语。", "ใช้ในการจัดการความเสี่ยงและเหตุฉุกเฉิน"],
    culture: ["文化、公共议题与高级表达。", "ใช้เกี่ยวกับวัฒนธรรม ประเด็นสาธารณะ และการสื่อสารขั้นสูง"],
    people: ["人物、角色与关系相关用语。", "ใช้เรียกบุคคล บทบาท และความสัมพันธ์"],
    time: ["时间安排与进度相关用语。", "ใช้เกี่ยวกับเวลา กำหนดการ และความคืบหน้า"],
    food: ["饮食与餐饮沟通用语。", "ใช้ในการสื่อสารเรื่องอาหารและร้านอาหาร"]
  };

  function parse(block) {
    return block.trim().split(/\r?\n/).filter(Boolean).map((line, index) => {
      const parts = line.split("|");
      if (parts.length !== 7) throw new Error(`Expansion row ${index + 1} has ${parts.length} fields`);
      const [cat, pos, zh, py, th, ro, sentence] = parts;
      const [pattern, objectKey] = sentence.split(":");
      if (!PATTERNS[pattern] || !OBJECTS[objectKey]) throw new Error(`Unknown sentence recipe: ${sentence}`);
      return { cat, pos, zh, py, th, ro, pattern, objectKey };
    });
  }

  function expand(rows, level) {
    return rows.map((row, index) => {
      const [exZh, exPy, exTh, exRo] = PATTERNS[row.pattern](row, OBJECTS[row.objectKey]);
      const [noteZh, noteTh] = NOTES[row.cat] || NOTES.work;
      return {
        id: `x${level}-${String(index + 1).padStart(3, "0")}`,
        level,
        cat: row.cat,
        pos: row.pos,
        zh: row.zh,
        py: row.py,
        th: row.th,
        ro: row.ro,
        exZh,
        exPy,
        exTh,
        exRo,
        noteZh,
        noteTh
      };
    });
  }

  // Data blocks are appended below in three audited 250-entry sections.

  const L4 = parse(`
work|n|交接清单|jiāojiē qīngdān|แบบตรวจสอบการส่งต่องาน|baep truatsop kan songto ngan|prevent:handover
work|n|会议召集|huìyì zhàojí|การเรียกประชุม|kan riak prachum|ensure:attendance
work|n|参会名单|cānhuì míngdān|รายชื่อผู้เข้าร่วมประชุม|raichue phu khao ruam prachum|confirm:actualAttendance
work|n|会前资料|huìqián zīliào|เอกสารเตรียมประชุม|ekasan triam prachum|support:focus
work|n|讨论事项|tǎolùn shìxiàng|รายการหัวข้อหารือ|raikan huakho harue|guide:focus
work|n|行动项|xíngdòngxiàng|รายการงานที่ต้องดำเนินการ|raikan ngan thi tong damnoenkan|track:action
work|n|待办任务池|dàibàn rènwu chí|กลุ่มงานรอดำเนินการ|klum ngan ro damnoenkan|record:pendingTaskDetails
work|n|责任分工|zérèn fēngōng|การแบ่งหน้าที่รับผิดชอบ|kan baeng nathi rapphitchop|clarify:ownership
work|n|工作交接|gōngzuò jiāojiē|การส่งต่องาน|kan songto ngan|ensure:handover
work|n|审批节点|shěnpī jiédiǎn|จุดตรวจอนุมัติ|chut truat anumat|track:approval
work|n|授权范围|shòuquán fànwéi|ขอบเขตการมอบอำนาจ|khopkhet kan mop amnat|clarify:ownership
work|n|归档编号|guīdàng biānhào|เลขที่จัดเก็บเอกสาร|lekthi chatkep ekasan|support:archive
work|n|文件命名|wénjiàn mìngmíng|หลักการตั้งชื่อไฟล์|lakkan tang chue fai|enable:archive
work|n|版本记录|bǎnběn jìlù|บันทึกฉบับเอกสาร|banthuek chabap ekasan|ensure:version
work|n|修订痕迹|xiūdìng hénjì|ร่องรอยการแก้ไข|rongroi kan kaekhai|reveal:trace
work|n|共享目录|gòngxiǎng mùlù|โฟลเดอร์ใช้ร่วมกัน|fondo chai ruam kan|support:archive
work|n|访问记录|fǎngwèn jìlù|ประวัติการเข้าถึง|prawat kan khaothueng|record:accessLog
work|n|保密等级|bǎomì děngjí|ระดับชั้นความลับ|radap chan khwam lap|clarify:accessLevel
work|n|原始签署件|yuánshǐ qiānshǔjiàn|เอกสารลงนามต้นฉบับ|ekasan longnam tonchabap|confirm:receipt
work|n|副本|fùběn|สำเนา|samna|support:archive
work|n|盖章件|gàizhāngjiàn|เอกสารประทับตรา|ekasan prathap tra|confirm:approval
work|n|签收单|qiānshōudān|ใบรับมอบเอกสาร|bai rap mop ekasan|record:receipt
work|n|验收单|yànshōudān|ใบตรวจรับงาน|bai truat rap ngan|confirm:inspection
work|n|对账单|duìzhàngdān|ใบแจ้งยอดบัญชี|bai chaeng yot banchi|clarify:finance
work|n|付款申请|fùkuǎn shēnqǐng|คำขออนุมัติจ่ายเงิน|kham kho anumat chai ngoen|ensure:finance
work|n|报销凭证|bàoxiāo píngzhèng|หลักฐานเบิกค่าใช้จ่าย|lakthan boek kha chai chai|support:finance
work|n|差旅报销|chāilǚ bàoxiāo|การเบิกค่าเดินทางธุรกิจ|kan boek kha doen thang thurakit|ensure:finance
work|n|采购申请|cǎigòu shēnqǐng|คำขอจัดซื้อ|kham kho chatsue|track:approval
work|n|采购单|cǎigòudān|ใบสั่งซื้อ|bai sang sue|record:purchaseDetails
work|n|入库单|rùkùdān|ใบรับสินค้าเข้าคลัง|bai rap sinkha khao khlang|record:inboundDetails
work|n|出库单|chūkùdān|ใบจ่ายสินค้าออกคลัง|bai chai sinkha ok khlang|record:outboundDetails
work|n|领用记录|lǐngyòng jìlù|บันทึกการเบิกใช้วัสดุ|banthuek kan boek chai watsadu|track:stock
work|n|盘点表|pándiǎnbiǎo|แบบตรวจนับสต็อก|baep truat nap satok|ensure:stock
work|n|物料编码|wùliào biānmǎ|รหัสวัสดุ|rahat watsadu|support:stock
work|n|产品批次|chǎnpǐn pīcì|ล็อตการผลิตสินค้า|lot kan phalit sinkha|track:batch
work|n|出厂日期|chūchǎng rìqī|วันที่สินค้าออกจากโรงงาน|wanthi sinkha ok chak rongngan|confirm:batch
work|n|保质期限|bǎozhì qīxiàn|อายุการเก็บรักษา|ayu kan kep raksa|guide:expiry
work|n|序列号|xùlièhào|หมายเลขประจำเครื่อง|mailek pracham khrueang|track:batch
work|n|商品条码|shāngpǐn tiáomǎ|บาร์โค้ดประจำสินค้า|ba khot pracham sinkha|enable:stock
work|n|留样|liúyàng|ตัวอย่างเก็บอ้างอิง|tuayang kep ang-ing|support:qualityReview
work|n|样机|yàngjī|เครื่องสาธิตต้นแบบ|khrueang sathit tonbaep|support:operation
work|n|操作手册|cāozuò shǒucè|คู่มือปฏิบัติงาน|khumue patibat ngan|guide:operation
work|n|常见问题单|chángjiàn wèntídān|เอกสารคำถามพบบ่อย|ekasan khamtham phop boi|guide:service
work|n|服务工单|fúwù gōngdān|ใบงานบริการ|bai ngan borikan|track:service
time|n|处理时限|chǔlǐ shíxiàn|กรอบเวลาจัดการ|krop wela chatkan|ensure:service
time|n|响应时间|xiǎngyìng shíjiān|ระยะเวลาตอบสนอง|raya wela topsanong|affect:service
work|n|升级路径|shēngjí lùjìng|เส้นทางยกระดับปัญหา|senthang yokradap panha|guide:escalation
work|n|值班表|zhíbānbiǎo|ตารางผู้ปฏิบัติงานเวร|tarang phu patibat ngan wen|ensure:schedule
people|n|联系人名单|liánxìrén míngdān|บัญชีรายชื่อผู้ประสานงาน|banchi raichue phu prasan ngan|support:service
people|n|应急联络对象|yìngjí liánluò duìxiàng|ผู้ติดต่อยามฉุกเฉิน|phu titto yam chukchoen|support:continuity
work|n|项目章程|xiàngmù zhāngchéng|กฎบัตรโครงการ|kotbat khrongkan|guide:scope
work|n|项目范围|xiàngmù fànwéi|กรอบขอบเขตโครงการ|krop khopkhet khrongkan|clarify:scope
work|n|需求清单|xūqiú qīngdān|บัญชีความต้องการงาน|banchi khwam tongkan ngan|clarify:scope
work|n|验收标准|yànshōu biāozhǔn|เกณฑ์ตรวจรับผลงาน|ken truat rap phonngan|guide:inspection
work|n|里程碑|lǐchéngbēi|หมุดหมายโครงการ|mutmai khrongkan|track:milestone
work|n|关键路径|guānjiàn lùjìng|เส้นทางวิกฤตของโครงการ|senthang wikrit khong khrongkan|reveal:criticalPath2
work|n|依赖关系|yīlài guānxì|ความเชื่อมโยงระหว่างงาน|khwam chueamyong rawang ngan|clarify:dependency
work|n|风险清单|fēngxiǎn qīngdān|บัญชีรายการความเสี่ยง|banchi raikan khwam siang|track:risk
work|n|风险预案|fēngxiǎn yù'àn|แผนรองรับความเสี่ยง|phaen rongrap khwam siang|reduce:risk
emergency|n|应急方案|yìngjí fāng'àn|แนวทางรับเหตุเร่งด่วน|naeo thang rap het rengduan|support:continuity
work|n|资源缺口|zīyuán quēkǒu|ช่องว่างด้านทรัพยากร|chongwang dan sapphayakon|reveal:resourceGap2
work|n|人员配置|rényuán pèizhì|การจัดสรรกำลังคน|kan chatsan kamlang khon|ensure:resource
work|n|工时估算|gōngshí gūsuàn|การประมาณชั่วโมงทำงาน|kan praman chuamong thamngan|support:estimate
work|n|成本估算|chéngběn gūsuàn|การประมาณต้นทุนงาน|kan praman tonthun ngan|support:estimate
work|n|进度偏差|jìndù piānchā|ความคลาดเคลื่อนของกำหนดงาน|khwam khlatkhluen khong kamnot ngan|signal:scheduleLag
work|n|成本偏差|chéngběn piānchā|ความคลาดเคลื่อนของต้นทุน|khwam khlatkhluen khong tonthun|signal:budgetGap
work|n|变更申请|biàngēng shēnqǐng|คำร้องขอเปลี่ยนแปลง|kham rong kho plianplaeng|ensure:change
work|n|变更记录|biàngēng jìlù|บันทึกความเปลี่ยนแปลง|banthuek khwam plianplaeng|track:change
work|n|决策记录|juécè jìlù|บันทึกเหตุผลการตัดสินใจ|banthuek hetphon kan tatsinchai|record:decisionDetails
work|n|问题清单|wèntí qīngdān|บัญชีประเด็นติดขัด|banchi praden titkhat|track:deviation
work|n|根本原因|gēnběn yuányīn|สาเหตุรากเหง้า|sahet rakngao|clarify:rootcause
work|n|临时措施|línshí cuòshī|มาตรการแก้ไขชั่วคราว|mattrakan kaekhai chuakhrao|support:continuity
work|n|永久措施|yǒngjiǔ cuòshī|มาตรการแก้ไขถาวร|mattrakan kaekhai thawon|ensure:rootcause
work|n|复盘会议|fùpán huìyì|ประชุมทบทวนหลังจบงาน|prachum thopthuan lang chop ngan|support:learning
work|n|经验教训|jīngyàn jiàoxùn|บทเรียนจากประสบการณ์|botrian chak prasopkan|guide:learning
work|n|最佳实践|zuìjiā shíjiàn|แนวปฏิบัติที่เป็นเลิศ|naeo patibat thi pen loet|guide:learning
work|n|试运行|shìyùnxíng|การเดินระบบทดลอง|kan doen rabop thotlong|reduce:launch
work|n|正式上线|zhèngshì shàngxiàn|การเปิดใช้งานจริง|kan poet chai ngan ching|ensure:launch
work|n|灰度发布|huīdù fābù|การทยอยปล่อยระบบ|kan thayoi ploi rabop|reduce:launch
work|n|回滚方案|huígǔn fāng'àn|แผนย้อนกลับระบบ|phaen yonklap rabop|support:rollback
work|n|兼容性测试|jiānróngxìng cèshì|การทดสอบความเข้ากันได้|kan thotsop khwam khaokan dai|ensure:compatibility
work|n|用户验收|yònghù yànshōu|การตรวจรับโดยผู้ใช้|kan truat rap doi phuchai|confirm:inspection
work|n|内部评审|nèibù píngshěn|การทบทวนภายในองค์กร|kan thopthuan phainai ongkon|improve:inspection
work|n|外部审计|wàibù shěnjì|การตรวจสอบจากภายนอก|kan truatsop chak phainok|ensure:compliance
work|n|质量抽检|zhìliàng chōujiǎn|การสุ่มตรวจคุณภาพ|kan sum truat khunnaphap|confirm:inspection
work|n|现场检查|xiànchǎng jiǎnchá|การตรวจหน้างาน|kan truat na ngan|ensure:inspection
work|n|安全巡检|ānquán xúnjiǎn|การตรวจความปลอดภัยตามรอบ|kan truat khwam plotphai tam rop|reduce:risk
work|n|设备保养|shèbèi bǎoyǎng|การบำรุงรักษาอุปกรณ์|kan bamrung raksa uppakon|improve:maintenance
work|n|预防性维护|yùfángxìng wéihù|การบำรุงรักษาเชิงป้องกัน|kan bamrung raksa choeng pongkan|improve:maintenance
work|n|故障排查|gùzhàng páichá|การไล่ตรวจหาข้อขัดข้อง|kan lai truat ha kho khatkhong|resolve:rootcause
work|n|零件更换|língjiàn gēnghuàn|การเปลี่ยนชิ้นส่วน|kan plian chinsuan|improve:maintenance
time|n|停机时间|tíngjī shíjiān|ช่วงเวลาหยุดเครื่อง|chuang wela yut khrueang|affect:continuity
work|n|服务中断|fúwù zhōngduàn|การหยุดชะงักของบริการ|kan yut chak khong borikan|affect:service
time|n|恢复时间|huīfù shíjiān|เวลาที่ใช้กู้คืน|wela thi chai ku khuen|signal:recoveryMetric
work|n|业务连续性|yèwù liánxùxìng|ความต่อเนื่องทางธุรกิจ|khwam tonueang thang thurakit|ensure:continuity
emergency|n|灾备演练|zāibèi yǎnliàn|การซ้อมกู้ระบบภัยพิบัติ|kan som ku rabop phai phibat|strengthen:continuity
work|n|权限复核|quánxiàn fùhé|การทบทวนสิทธิ์เข้าถึง|kan thopthuan sit khaothueng|ensure:access
work|n|密码重置|mìmǎ chóngzhì|การตั้งรหัสผ่านใหม่|kan tang rahat phan mai|ensure:security
work|n|账号停用|zhànghào tíngyòng|การระงับบัญชีผู้ใช้|kan rangap banchi phuchai|ensure:account
work|n|离职交接|lízhí jiāojiē|การส่งมอบงานก่อนลาออก|kan song mop ngan kon la-ok|prevent:handover
work|n|客户画像|kèhù huàxiàng|ภาพจำลองลูกค้าเป้าหมาย|phap chamlong lukkha paomai|support:customer
people|n|潜在客户|qiánzài kèhù|ลูกค้าที่มีศักยภาพ|lukkha thi mi sakkayaphap|signal:prospectNurture
people|n|意向客户|yìxiàng kèhù|ลูกค้าที่แสดงความสนใจ|lukkha thi sadaeng khwam sonchai|signal:purchaseIntent
people|n|成交客户|chéngjiāo kèhù|ลูกค้าที่ปิดการขายแล้ว|lukkha thi pit kan khai laeo|reveal:conversion
work|n|客户线索|kèhù xiànsuǒ|ข้อมูลลูกค้ามุ่งหวัง|khomun lukkha mungwang|track:conversion
work|n|商机|shāngjī|โอกาสทางการขาย|okat thang kan khai|signal:dealPotential
work|n|销售漏斗|xiāoshòu lòudǒu|กรวยกระบวนการขาย|kruai krabuan kan khai|reveal:funnelStage
work|n|转化率|zhuǎnhuàlǜ|อัตราเปลี่ยนเป็นลูกค้า|attra plian pen lukkha|signal:conversion
work|n|复购率|fùgòulǜ|อัตราการซื้อซ้ำ|attra kan sue sam|reveal:retention
work|n|客户留存|kèhù liúcún|การรักษาฐานลูกค้า|kan raksa than lukkha|strengthen:retention
work|n|售后保障|shòuhòu bǎozhàng|การรับประกันหลังการขาย|kan rapprakan lang kan khai|support:retention
work|n|服务承诺|fúwù chéngnuò|คำมั่นด้านการบริการ|kham man dan kan borikan|strengthen:retention
work|n|服务范围|fúwù fànwéi|ขอบเขตงานบริการ|khopkhet ngan borikan|clarify:service
work|n|处理进度|chǔlǐ jìndù|ความคืบหน้าการดำเนินเรื่อง|khwam khuepna kan damnoen rueang|track:service
work|n|投诉渠道|tóusù qúdào|ช่องทางรับเรื่องร้องเรียน|chongthang rap rueang rongrian|guide:complaint
work|n|投诉记录|tóusù jìlù|บันทึกข้อร้องเรียน|banthuek kho rongrian|record:complaintHandling
shopping|n|退款申请|tuìkuǎn shēnqǐng|คำร้องขอคืนเงิน|kham rong kho khuen ngoen|track:refund
shopping|n|退款进度|tuìkuǎn jìndù|สถานะดำเนินการคืนเงิน|sathana damnoenkan khuen ngoen|reveal:refund
shopping|n|换货申请|huànhuò shēnqǐng|คำขอเปลี่ยนสินค้า|kham kho plian sinkha|track:service
travel|n|物流单号|wùliú dānhào|หมายเลขติดตามพัสดุ|mailek tittam phatsadu|track:delivery
travel|n|配送地址|pèisòng dìzhǐ|ที่อยู่สำหรับจัดส่ง|thi yu samrap chatsong|clarify:correctDelivery
people|n|收货人|shōuhuòrén|ผู้รับสินค้า|phu rap sinkha|clarify:correctDelivery
time|n|发货时间|fāhuò shíjiān|เวลาส่งสินค้าออก|wela song sinkha ok|track:delivery
time|n|到货时间|dàohuò shíjiān|เวลาสินค้ามาถึง|wela sinkha ma thueng|enable:delivery
travel|n|签收状态|qiānshōu zhuàngtài|สถานะการรับพัสดุ|sathana kan rap phatsadu|confirm:receipt
travel|n|配送延误|pèisòng yánwù|ความล่าช้าในการจัดส่ง|khwam lacha nai kan chatsong|affect:timelyDelivery
shopping|n|破损件|pòsǔnjiàn|สินค้าที่ชำรุดระหว่างส่ง|sinkha thi chamrut rawang song|signal:damageCheck
shopping|n|漏发|lòufā|การส่งสินค้าไม่ครบ|kan song sinkha mai khrop|affect:completeOrder
shopping|n|错发|cuòfā|การส่งสินค้าผิดรายการ|kan song sinkha phit raikan|affect:completeOrder
shopping|n|补发|bǔfā|การจัดส่งสินค้าทดแทน|kan chatsong sinkha thotthaen|resolve:completeOrder
shopping|n|运费|yùnfèi|ค่าขนส่งสินค้า|kha khonsong sinkha|affect:payment
shopping|n|包装费|bāozhuāngfèi|ค่าบรรจุหีบห่อ|kha banchu hipho|affect:payment
shopping|n|保价|bǎojià|บริการประกันมูลค่าพัสดุ|borikan prakan munkha phatsadu|ensure:compensation
shopping|n|到付|dàofù|การชำระเงินปลายทาง|kan chamra ngoen plaithang|enable:payment
shopping|n|预付款|yùfùkuǎn|เงินชำระล่วงหน้า|ngoen chamra luangna|confirm:payment
shopping|n|尾款|wěikuǎn|ยอดชำระส่วนที่เหลือ|yot chamra suan thi luea|ensure:payment
shopping|n|分期付款|fēnqī fùkuǎn|การผ่อนชำระเป็นงวด|kan phon chamra pen nguat|enable:payment
time|n|付款期限|fùkuǎn qīxiàn|กำหนดเส้นตายชำระเงิน|kamnot sen tai chamra ngoen|guide:payment
shopping|n|逾期款|yúqīkuǎn|ยอดค้างชำระเกินกำหนด|yot khang chamra koen kamnot|signal:overdueFact
work|n|开票信息|kāipiào xìnxī|ข้อมูลออกใบกำกับภาษี|khomun ok bai kamkap phasi|ensure:tax
work|n|纳税人识别号|nàshuìrén shíbiéhào|รหัสประจำตัวผู้เสียภาษี|rahat pracham tua phu sia phasi|confirm:tax
shopping|n|含税价|hánshuìjià|ราคารวมภาษี|rakha ruam phasi|clarify:payment
shopping|n|未税价|wèishuìjià|ราคาก่อนภาษี|rakha kon phasi|clarify:payment
time|n|结算周期|jiésuàn zhōuqī|รอบการชำระบัญชี|rop kan chamra banchi|guide:finance
work|n|信用额度|xìnyòng édù|วงเงินเครดิต|wongngoen khredit|support:credit
shopping|n|付款方式|fùkuǎn fāngshì|รูปแบบการชำระเงิน|rupbaep kan chamra ngoen|clarify:payment
work|n|对公账户|duìgōng zhànghù|บัญชีธนาคารของนิติบุคคล|banchi thanakhan khong nitibukkhon|confirm:accountOwner
shopping|n|收款码|shōukuǎnmǎ|รหัสรับชำระเงิน|rahat rap chamra ngoen|enable:wallet
work|n|汇款凭证|huìkuǎn píngzhèng|หลักฐานการโอนเงิน|lakthan kan on ngoen|confirm:payment
work|n|财务对账|cáiwù duìzhàng|การกระทบยอดทางการเงิน|kan krathop yot thang kanngoen|ensure:finance
work|n|岗位编制|gǎngwèi biānzhì|กรอบอัตรากำลังตำแหน่ง|krop attra kamlang tamnaeng|guide:hiring
work|n|用人需求|yòngrén xūqiú|ความต้องการกำลังคน|khwam tongkan kamlang khon|clarify:hiring
work|n|招聘渠道|zhāopìn qúdào|ช่องทางสรรหาบุคลากร|chongthang sanha bukhlakon|support:hiring
work|n|入职材料|rùzhí cáiliào|เอกสารเริ่มงาน|ekasan roem ngan|ensure:onboarding
work|n|员工手册|yuángōng shǒucè|คู่มือพนักงาน|khumue phanakngan|guide:onboarding
work|n|雇佣协议|gùyōng xiéyì|ข้อตกลงการว่าจ้าง|khotoklong kan wa chang|clarify:labor
work|n|保密协议|bǎomì xiéyì|ข้อตกลงรักษาความลับ|khotoklong raksa khwam lap|ensure:access
work|n|竞业限制|jìngyè xiànzhì|ข้อจำกัดการแข่งขันหลังสิ้นสุดการจ้างงาน|kho chamkat kan khaengkhan lang sinsut kan chang ngan|clarify:labor
work|n|考勤记录|kǎoqín jìlù|บันทึกเวลาเข้าออกงาน|banthuek wela khao ok ngan|record:workTime
work|n|打卡异常|dǎkǎ yìcháng|ความผิดปกติของการลงเวลา|khwam phitpokkati khong kan long wela|signal:clockError
work|n|补休安排|bǔxiū ānpái|การจัดวันหยุดชดเชย|kan chat wan yut chotchoei|enable:leave
work|n|年假余额|niánjià yú'é|วันลาพักร้อนคงเหลือ|wan la phakron khongluea|clarify:leave
work|n|病假单|bìngjiàdān|ใบลาป่วย|bai la puai|confirm:leave
work|n|加班申请|jiābān shēnqǐng|คำขอทำงานล่วงเวลา|kham kho thamngan luang wela|track:approval
work|n|排班表|páibānbiǎo|ตารางจัดกะทำงาน|tarang chat ka thamngan|guide:schedule
work|n|薪资单|xīnzīdān|ใบแจ้งค่าจ้าง|bai chaeng kha chang|clarify:payroll
work|n|社保|shèbǎo|ประกันสังคมภาคบังคับ|prakan sangkhom phak bangkhap|ensure:laborProtection
work|n|公积金|gōngjījīn|กองทุนสะสมเพื่อที่อยู่อาศัย|kongthun sasom phuea thi yu asai|support:housingFund
work|n|个税|gèshuì|ภาษีเงินได้บุคคลธรรมดา|phasi ngoendai bukkhon thammada|clarify:taxWithholding
work|n|绩效目标|jìxiào mùbiāo|เป้าหมายผลการปฏิบัติงาน|paomai phon kan patibat ngan|guide:performance
work|n|绩效面谈|jìxiào miàntán|การสนทนาประเมินผลงาน|kan sonthana pramoen phonngan|support:performance
work|n|改进计划|gǎijìn jìhuà|แผนพัฒนาผลงาน|phaen phatthana phonngan|guide:performance
work|n|晋升通道|jìnshēng tōngdào|เส้นทางความก้าวหน้า|senthang khwam kaona|clarify:growth
work|n|调薪申请|tiáoxīn shēnqǐng|คำขอปรับเงินเดือน|kham kho prap ngoenduean|track:approval
work|n|内部转岗|nèibù zhuǎngǎng|การย้ายตำแหน่งภายใน|kan yai tamnaeng phainai|support:growth
work|n|继任计划|jìrèn jìhuà|แผนผู้สืบทอดตำแหน่ง|phaen phu suepthot tamnaeng|ensure:continuity
work|n|人才梯队|réncái tīdùi|กลุ่มบุคลากรสำรองตามลำดับ|klum bukhlakon samrong tam lamdap|strengthen:continuity
social|n|团建活动|tuánjiàn huódòng|กิจกรรมสร้างความสัมพันธ์ในทีม|kitchakam sang khwam samphan nai thim|strengthen:teamBond
work|n|员工关怀|yuángōng guānhuái|การดูแลความเป็นอยู่พนักงาน|kan dulae khwam pen yu phanakngan|strengthen:staffRetention
work|n|离职证明|lízhí zhèngmíng|หนังสือรับรองการพ้นงาน|nangsue raprong kan phon ngan|confirm:proof
work|n|工作证明|gōngzuò zhèngmíng|หนังสือรับรองการทำงาน|nangsue raprong kan thamngan|confirm:proof
work|n|推荐信|tuījiànxìn|จดหมายรับรองความสามารถ|chotmai raprong khwam samat|support:applicationProof
work|n|背景调查|bèijǐng diàochá|การตรวจสอบประวัติผู้สมัคร|kan truatsop prawat phusamak|confirm:proof
people|n|紧急联络人|jǐnjí liánluòrén|บุคคลติดต่อฉุกเฉิน|bukkhon titto chukchoen|support:continuity
daily|n|租赁合同|zūlìn hétong|สัญญาเช่าทรัพย์สิน|sanya chao sapsin|clarify:housing
daily|n|物业费|wùyèfèi|ค่าส่วนกลางอาคาร|kha suanklang akhan|affect:housing
daily|n|租金收据|zūjīn shōujù|ใบรับค่าเช่า|bai rap kha chao|confirm:housing
daily|n|水表读数|shuǐbiǎo dúshù|ตัวเลขมาตรวัดน้ำ|tualek mat wat nam|confirm:utility
daily|n|电表读数|diànbiǎo dúshù|ตัวเลขมาตรวัดไฟ|tualek mat wat fai|confirm:utility
daily|n|门锁密码|ménsuǒ mìmǎ|รหัสล็อกประตู|rahat lok pratu|protect:visitor
daily|n|访客登记|fǎngkè dēngjì|การลงทะเบียนผู้มาติดต่อ|kan longthabian phu ma titto|ensure:visitor
daily|n|车位|chēwèi|ช่องจอดรถ|chong chot rot|clarify:parking
daily|n|维修请求单|wéixiū qǐngqiúdān|แบบคำขอซ่อมบำรุง|baep kham kho som bamrung|track:repair
daily|n|停水通知|tíngshuǐ tōngzhī|ประกาศงดจ่ายน้ำ|prakat ngot chai nam|enable:outagePlan
daily|n|停电通知|tíngdiàn tōngzhī|ประกาศงดจ่ายไฟ|prakat ngot chai fai|enable:outagePlan
daily|n|网络报修|wǎngluò bàoxiū|การแจ้งซ่อมอินเทอร์เน็ต|kan chaeng som intoenet|resolve:repair
daily|n|家政预约|jiāzhèng yùyuē|การนัดบริการแม่บ้าน|kan nat borikan maeban|enable:homeVisit
daily|n|搬运服务|bānyùn fúwù|บริการขนย้ายของ|borikan khon yai khong|support:movingEase
daily|n|智能取件柜|zhìnéng qǔjiànguì|ตู้รับพัสดุอัจฉริยะ|tu rap phatsadu atchariya|enable:parcel
daily|n|失物招领|shīwù zhāolǐng|ศูนย์ของหายได้คืน|sun khong hai dai khuen|resolve:lostItem
work|n|多因素验证|duō yīnsù yànzhèng|การยืนยันตัวตนหลายปัจจัย|kan yuenyan tuaton lai patchai|ensure:security
work|n|生物识别|shēngwù shíbié|การพิสูจน์ตัวตนด้วยชีวมิติ|kan phisut tuaton duai chiwamiti|strengthen:security
work|n|指纹解锁|zhǐwén jiěsuǒ|การปลดล็อกด้วยลายนิ้วมือ|kan plot lok duai lainio mue|enable:security
work|n|人脸识别|rénliǎn shíbié|การรู้จำใบหน้า|kan rucham baina|confirm:identity
work|n|共享演示画面|gòngxiǎng yǎnshì huàmiàn|การแบ่งปันภาพนำเสนอ|kan baengpan phap nam sanoe|support:remote
work|n|远程协助|yuǎnchéng xiézhù|การช่วยเหลือจากระยะไกล|kan chuailuea chak raya klai|resolve:remote
work|n|视频会议链接|shìpín huìyì liànjiē|ลิงก์เข้าประชุมวิดีโอ|ling khao prachum widio|enable:joinMeeting
work|n|静音模式|jìngyīn móshì|โหมดปิดเสียง|mot pit siang|reduce:meeting2
work|n|消息免打扰|xiāoxi miǎn dǎrǎo|โหมดไม่รบกวนข้อความ|mot mai ropkuan khokhwam|reduce:meeting2
work|n|离席自动回复|líxí zìdòng huífù|ข้อความตอบกลับอัตโนมัติเมื่อไม่อยู่|khokhwam topklap attanomat muea mai yu|enable:awayNotice
work|n|邮件签名|yóujiàn qiānmíng|ลายเซ็นท้ายอีเมล|laisen thai imel|ensure:senderIdentity
work|n|群发邮件|qúnfā yóujiàn|อีเมลส่งถึงหลายคน|imel song thueng lai khon|enable:massDelivery
people|n|抄送人|chāosòngrén|ผู้รับสำเนาอีเมล|phu rap samna imel|clarify:email
people|n|密送人|mìsòngrén|ผู้รับสำเนาลับอีเมล|phu rap samna lap imel|configure:recipientPrivacy
work|n|已读回执|yǐdú huízhí|ใบตอบรับการเปิดอ่าน|bai top rap kan poet an|confirm:receipt
work|n|垃圾邮件|lājī yóujiàn|อีเมลไม่พึงประสงค์|imel mai phueng prasong|affect:inboxFocus
work|n|文件压缩|wénjiàn yāsuō|การบีบอัดไฟล์|kan bip at fai|enable:file
work|n|解压密码|jiěyā mìmǎ|รหัสผ่านแตกไฟล์|rahat phan taek fai|ensure:fileSecurity
work|n|文件扩展名|wénjiàn kuòzhǎnmíng|นามสกุลไฟล์|namsakun fai|affect:compatibility
work|n|文件容量|wénjiàn róngliàng|ขนาดไฟล์|khanat fai|affect:file
work|n|存储空间|cúnchǔ kōngjiān|พื้นที่จัดเก็บข้อมูล|phuenthi chatkep khomun|ensure:storage
work|n|同步状态|tóngbù zhuàngtài|สถานะการซิงก์ข้อมูล|sathana kan sing khomun|signal:storage
work|n|通信时延|tōngxìn shíyán|ความล่าช้าในการสื่อสาร|khwam lacha nai kan suesan|affect:network
work|n|信号强度|xìnhào qiángdù|ระดับความแรงสัญญาณ|radap khwam raeng sanyan|signal:networkQuality2
work|n|数据用量|shùjù yòngliàng|ปริมาณการใช้ดาต้า|pariman kan chai data|track:dataBalance
work|n|套餐续费|tàocān xùfèi|การต่ออายุแพ็กเกจ|kan to ayu phaekket|ensure:telecom
travel|n|漫游服务|mànyóu fúwù|บริการโรมมิงต่างประเทศ|borikan romming tang prathet|enable:telecom
shopping|n|电子钱包|diànzǐ qiánbāo|กระเป๋าเงินดิจิทัล|krapao ngoen dichithan|enable:wallet
shopping|n|交易记录|jiāoyì jìlù|ประวัติรายการธุรกรรม|prawat raikan thurakam|record:transactionDetails
shopping|phrase|余额不足|yú'é bùzú|ยอดเงินคงเหลือไม่พอ|yot ngoen khongluea mai pho|signal:insufficientFunds
shopping|phrase|支付失败|zhīfù shībài|การชำระเงินไม่สำเร็จ|kan chamra ngoen mai samret|signal:failedPayment
shopping|n|重复扣款|chóngfù kòukuǎn|การหักเงินซ้ำรายการ|kan hak ngoen sam raikan|signal:transaction
shopping|n|退款到账|tuìkuǎn dàozhàng|เงินคืนเข้าบัญชีแล้ว|ngoen khuen khao banchi laeo|confirm:refund
shopping|n|账单提醒|zhàngdān tíxǐng|การเตือนใบเรียกเก็บเงิน|kan tuean bai riak kep ngoen|ensure:ontimePayment
time|n|到期提醒|dàoqī tíxǐng|การแจ้งเตือนก่อนครบกำหนด|kan chaeng tuean kon khrop kamnot|prevent:expiry
shopping|n|自动续订|zìdòng xùdìng|การต่อสมาชิกอัตโนมัติ|kan to samachik attanomat|affect:subscription
shopping|n|取消订阅|qǔxiāo dìngyuè|การยกเลิกการสมัครสมาชิก|kan yokloek kan samak samachik|prevent:subscription
work|n|身份验证|shēnfèn yànzhèng|การตรวจยืนยันอัตลักษณ์|kan truat yuenyan attalak|ensure:identity
work|n|实名认证|shímíng rènzhèng|การยืนยันชื่อจริง|kan yuenyan chue ching|confirm:identity
work|n|客服热线|kèfú rèxiàn|สายด่วนดูแลลูกค้า|sai duan dulae lukkha|support:support
people|n|人工客服|réngōng kèfú|เจ้าหน้าที่บริการลูกค้าโดยตรง|chaonathi borikan lukkha doi trong|support:support
work|n|在线客服|zàixiàn kèfú|เจ้าหน้าที่บริการทางออนไลน์|chaonathi borikan thang onlai|support:service
work|n|服务评价|fúwù píngjià|การให้คะแนนงานบริการ|kan hai khanaen ngan borikan|reveal:satisfaction
work|n|满意度调查|mǎnyìdù diàochá|แบบสำรวจความพึงพอใจ|baep samruat khwam phuengphochai|support:satisfaction
time|n|预约时段|yùyuē shíduàn|ช่วงเวลาที่นัดไว้|chuang wela thi nat wai|enable:queue
daily|n|叫号序列|jiàohào xùliè|ลำดับหมายเลขเรียกคิว|lamdap mailek riak khiu|guide:queue
time|n|对外服务时段|duìwài fúwù shíduàn|ช่วงเวลาเปิดให้บริการ|chuang wela poet hai borikan|clarify:queue
time|n|节假日安排|jiéjiàrì ānpái|ตารางวันหยุดเทศกาล|tarang wan yut thetsakan|enable:notice
work|n|临时调整|línshí tiáozhěng|การปรับเปลี่ยนเฉพาะหน้า|kan prap plian chaphona|signal:temporaryChange
social|n|温馨提示|wēnxīn tíshì|ข้อความแจ้งเตือนอย่างเป็นมิตร|khokhwam chaeng tuean yang pen mit|ensure:notice
  `);

  const L5 = parse(`
work|n|议价空间|yìjià kōngjiān|ขอบเขตในการต่อรองราคา|khopkhet nai kan torong rakha|enable:deal
time|n|报价有效期|bàojià yǒuxiàoqī|ระยะเวลาที่ใบเสนอราคามีผล|raya wela thi bai sanoe rakha mi phon|guide:deal
work|n|最低起订量|zuìdī qǐdìngliàng|จำนวนสั่งซื้อขั้นต่ำ|chamnuan sang sue khan tam|affect:deal
time|n|交付周期|jiāofù zhōuqī|รอบระยะเวลาส่งมอบ|rop raya wela song mop|clarify:obligation
work|n|付款条件|fùkuǎn tiáojiàn|เงื่อนไขด้านการชำระเงิน|ngueankhai dan kan chamra ngoen|clarify:terms
work|n|违约责任|wéiyuē zérèn|ความรับผิดเมื่อผิดสัญญา|khwam rapphit muea phit sanya|clarify:obligation
work|n|赔偿条款|péicháng tiáokuǎn|ข้อกำหนดการชดใช้ค่าเสียหาย|kho kamnot kan chotchai kha sia hai|clarify:legal
work|n|不可抗力|bùkě kànglì|เหตุสุดวิสัย|het sutwisai|clarify:legal
work|n|保密条款|bǎomì tiáokuǎn|ข้อสัญญารักษาความลับ|kho sanya raksa khwam lap|ensure:access
work|n|排他协议|páitā xiéyì|ข้อตกลงให้สิทธิแต่ผู้เดียว|khotoklong hai sit tae phu diao|affect:channel
work|n|框架协议|kuàngjià xiéyì|ข้อตกลงกรอบความร่วมมือ|khotoklong krop khwam ruammue|guide:terms
work|n|补充协议|bǔchōng xiéyì|ข้อตกลงเพิ่มเติม|khotoklong phoemtoem|clarify:terms
work|n|合作意向书|hézuò yìxiàngshū|หนังสือแสดงเจตนาร่วมมือ|nangsue sadaeng chetana ruammue|signal:cooperationIntent
work|n|谅解备忘录|liàngjiě bèiwànglù|บันทึกความเข้าใจร่วมกัน|banthuek khwam khaochai ruam kan|clarify:terms
work|n|商务条款|shāngwù tiáokuǎn|ข้อกำหนดทางพาณิชย์|kho kamnot thang phanitcha|clarify:terms
work|n|技术条款|jìshù tiáokuǎn|ข้อกำหนดทางเทคนิค|kho kamnot thang theknik|guide:enforce
work|n|服务等级协议|fúwù děngjí xiéyì|ข้อตกลงระดับการให้บริการ|khotoklong radap kan hai borikan|ensure:obligation
work|n|试点项目|shìdiǎn xiàngmù|โครงการนำร่อง|khrongkan namrong|support:pilot
work|n|独家代理|dújiā dàilǐ|ตัวแทนจำหน่ายแต่เพียงผู้เดียว|tuathaen chamnai tae phiang phu diao|affect:channel
work|n|区域代理|qūyù dàilǐ|ตัวแทนประจำเขตพื้นที่|tuathaen pracham khet phuenthi|support:channel
work|n|分销权|fēnxiāoquán|สิทธิในการกระจายสินค้า|sit nai kan krachai sinkha|enable:channel
work|n|定价权|dìngjiàquán|อำนาจกำหนดราคา|amnat kamnot rakha|affect:deal
work|n|知识产权归属|zhīshi chǎnquán guīshǔ|ความเป็นเจ้าของทรัพย์สินทางปัญญา|khwam pen chaokhong sapsin thang panya|clarify:license
work|n|授权许可|shòuquán xǔkě|ใบอนุญาตให้ใช้สิทธิ|bai anuyat hai chai sit|confirm:license
time|n|使用期限|shǐyòng qīxiàn|ระยะเวลาอนุญาตให้ใช้|raya wela anuyat hai chai|guide:license
work|n|续约条件|xùyuē tiáojiàn|เงื่อนไขการต่อสัญญา|ngueankhai kan to sanya|clarify:obligation
work|n|终止条件|zhōngzhǐ tiáojiàn|เงื่อนไขการยุติสัญญา|ngueankhai kan yuti sanya|clarify:legal
work|n|退出机制|tuìchū jīzhì|กลไกการถอนตัว|konkai kan thon tua|clarify:exitRules
work|n|争议解决|zhēngyì jiějué|กระบวนการระงับข้อพิพาท|krabuan kan rangap kho phiphat|guide:dispute
work|n|仲裁|zhòngcái|การอนุญาโตตุลาการ|kan anuyatotulakan|resolve:dispute
work|n|诉讼|sùsòng|การดำเนินคดี|kan damnoen khadi|affect:dispute
work|n|管辖法院|guǎnxiá fǎyuàn|ศาลที่มีเขตอำนาจ|san thi mi khet amnat|clarify:legal
work|n|履约保证金|lǚyuē bǎozhèngjīn|หลักประกันการปฏิบัติตามสัญญา|lakprakan kan patibat tam sanya|ensure:obligation
time|n|质量保证期|zhìliàng bǎozhèngqī|ระยะเวลารับประกันคุณภาพ|raya wela rapprakan khunnaphap|clarify:warrantyCoverage
work|n|交付验收|jiāofù yànshōu|การตรวจรับสิ่งส่งมอบ|kan truat rap sing song mop|confirm:obligation
work|n|延期交付|yánqī jiāofù|การส่งมอบล่าช้ากว่ากำหนด|kan song mop lacha kwa kamnot|affect:obligation
work|n|提前交付|tíqián jiāofù|การส่งมอบก่อนกำหนด|kan song mop kon kamnot|clarify:earlyDelivery
work|n|分批交付|fēnpī jiāofù|การทยอยส่งมอบเป็นชุด|kan thayoi song mop pen chut|enable:obligation
work|n|最终报价|zuìzhōng bàojià|ข้อเสนอราคาครั้งสุดท้าย|khosanoe rakha khrang sutthai|signal:deal
work|n|还价|huánjià|ข้อเสนอต่อรองกลับ|khosanoe torong klap|enable:deal
work|n|让步空间|ràngbù kōngjiān|ขอบเขตที่ยอมผ่อนปรน|khopkhet thi yom phonpron|enable:flexibility
work|n|利益交换|lìyì jiāohuàn|การแลกเปลี่ยนผลประโยชน์|kan laekplian phonprayot|support:deal
work|n|谈判底线|tánpàn dǐxiàn|เส้นขั้นต่ำในการเจรจา|sen khan tam nai kan cheracha|clarify:negotiate
work|n|双赢方案|shuāngyíng fāng'àn|ทางออกที่ได้ประโยชน์ทั้งคู่|thang ok thi dai prayot thang khu|support:deal
work|n|备选方案|bèixuǎn fāng'àn|แผนทางเลือกสำรอง|phaen thanglueak samrong|support:fallback
work|n|优先选项|yōuxiān xuǎnxiàng|ตัวเลือกอันดับแรก|tualueak andap raek|guide:deal
work|n|议题排序|yìtí páixù|การจัดลำดับหัวข้อเจรจา|kan chat lamdap huakho cheracha|guide:negotiationFocus
work|n|条件置换|tiáojiàn zhìhuàn|การแลกเงื่อนไขกัน|kan laek ngueankhai kan|enable:flexibility
work|n|口头约定|kǒutóu yuēdìng|ข้อตกลงด้วยวาจา|khotoklong duai wacha|require:evidence2
work|n|书面确认|shūmiàn quèrèn|การยืนยันเป็นลายลักษณ์อักษร|kan yuenyan pen lai lak akson|ensure:evidence2
social|n|新闻稿|xīnwéngǎo|ข่าวประชาสัมพันธ์|khao prachasamphan|support:rapidnews
social|n|媒体通报|méitǐ tōngbào|การชี้แจงต่อสื่อมวลชน|kan chichaeng to suemuanchon|ensure:consistency
social|n|记者会|jìzhěhuì|งานแถลงข่าว|ngan thalaeng khao|enable:rapidnews
social|n|采访提纲|cǎifǎng tígāng|โครงคำถามสัมภาษณ์|khrong khamtham samphat|guide:context
people|n|受访者|shòufǎngzhě|บุคคลผู้ให้สัมภาษณ์|bukkhon phu hai samphat|support:context
people|n|发言人|fāyánrén|โฆษก|khok|ensure:consistency
social|n|官方声明|guānfāng shēngmíng|แถลงการณ์อย่างเป็นทางการ|thalaengkan yang pen thangkan|confirm:rapidnews
social|n|公开信|gōngkāixìn|จดหมายเปิดผนึก|chotmai poet phanuek|enable:audience
social|n|事实核查|shìshí héchá|การตรวจสอบข้อเท็จจริง|kan truatsop khothetching|ensure:accuracy
social|n|信息更正|xìnxī gēngzhèng|ประกาศแก้ข้อมูลข่าวสาร|prakat kae khomun khaosan|support:correction
social|n|来源匿名|láiyuán nìmíng|การปกปิดชื่อแหล่งข่าว|kan pokpit chue laeng khao|ensure:sourceProtection
social|n|独家报道|dújiā bàodào|รายงานข่าวเฉพาะสำนัก|raingan khao chapho samnak|strengthen:audienceReach
social|n|深度报道|shēndù bàodào|รายงานข่าวเชิงลึก|raingan khao choeng luek|support:context
social|n|跟踪报道|gēnzōng bàodào|รายงานข่าวต่อเนื่อง|raingan khao tonueang|track:rapidnews
social|n|突发新闻|tūfā xīnwén|ข่าวด่วน|khao duan|ensure:rapidnews
social|n|新闻标题|xīnwén biāotí|พาดหัวข่าว|phat hua khao|affect:audience
social|n|导语|dǎoyǔ|วรรคนำข่าว|wak nam khao|clarify:context
social|n|正文|zhèngwén|เนื้อหาหลักของบทความ|nueaha lak khong botkhwam|support:context
social|n|图片说明|túpiàn shuōmíng|คำบรรยายใต้ภาพ|kham banyai tai phap|clarify:context
social|n|引用来源|yǐnyòng láiyuán|แหล่งอ้างอิงที่ยกมา|laeng ang-ing thi yok ma|confirm:sourcing
social|n|数据图表|shùjù túbiǎo|แผนภูมิประกอบข้อมูล|phaenphum prakop khomun|support:visualization
social|n|传播渠道|chuánbō qúdào|ช่องทางเผยแพร่สาร|chongthang phoeiphae san|enable:audience
people|n|目标受众|mùbiāo shòuzhòng|กลุ่มผู้รับสารเป้าหมาย|klum phu rap san paomai|configure:audience
social|n|阅读量|yuèdúliàng|จำนวนครั้งที่เปิดอ่าน|chamnuan khrang thi poet an|signal:activeReading
social|n|点击率|diǎnjīlǜ|อัตราการคลิกเนื้อหา|attra kan khlik nueaha|reveal:engagement
social|n|完播率|wánbōlǜ|อัตราการรับชมจนจบ|attra kan rapchom chon chop|reveal:engagement
social|n|互动率|hùdònglǜ|อัตราการมีส่วนร่วม|attra kan mi suan ruam|signal:engagement
social|n|转发率|zhuǎnfālǜ|อัตราการส่งต่อเนื้อหา|attra kan songto nueaha|reveal:engagement
social|n|话题热度|huàtí rèdù|ระดับความสนใจต่อประเด็น|radap khwam sonchai to praden|signal:sentiment
social|n|舆情监测|yúqíng jiāncè|การติดตามกระแสความคิดเห็น|kan tittam krasae khwam khithen|track:sentiment
social|n|负面舆情|fùmiàn yúqíng|กระแสความเห็นเชิงลบ|krasae khwam hen choeng lop|affect:credibility
social|n|危机沟通|wēijī gōutōng|การสื่อสารในภาวะวิกฤต|kan suesan nai phawa wikrit|ensure:crisis
social|n|回应口径|huíyìng kǒujìng|กรอบถ้อยคำสำหรับตอบชี้แจง|krop thoikham samrap top chichaeng|ensure:consistency
social|n|核心信息|héxīn xìnxī|สารหลักที่ต้องการสื่อ|san lak thi tongkan sue|clarify:audience
social|n|关键信息点|guānjiàn xìnxīdiǎn|ประเด็นสารสำคัญ|praden san samkhan|guide:audience
social|n|内容审核|nèiróng shěnhé|การตรวจทานเนื้อหาก่อนเผยแพร่|kan truatthan nueaha kon phoeiphae|ensure:editorial
social|n|编辑规范|biānjí guīfàn|แนวปฏิบัติด้านบรรณาธิการ|naeo patibat dan bannathikan|guide:editorial
social|n|发布计划|fābù jìhuà|แผนการเผยแพร่เนื้อหา|phaen kan phoeiphae nueaha|ensure:production
social|n|内容日历|nèiróng rìlì|ปฏิทินเนื้อหา|patithin nueaha|guide:production
social|n|选题策划|xuǎntí cèhuà|การวางแผนหัวข้อเนื้อหา|kan wangphaen huakho nueaha|support:audience
social|n|脚本大纲|jiǎoběn dàgāng|โครงร่างบทดำเนินเรื่อง|khrongrang bot damnoen rueang|guide:production
social|n|画面素材|huàmiàn sùcái|วัตถุดิบภาพสำหรับผลิตสื่อ|watthudip phap samrap phalit sue|support:production
social|n|配音稿|pèiyīnggǎo|ต้นฉบับสำหรับพากย์เสียง|tonchabap samrap phak siang|guide:production
social|n|字幕文件|zìmù wénjiàn|ไฟล์คำบรรยาย|fai kham banyai|support:subtitleAccess
social|n|多语版本|duōyǔ bǎnběn|ฉบับหลายภาษา|chabap lai phasa|enable:audience
social|n|版权授权书|bǎnquán shòuquánshū|หนังสืออนุญาตใช้ลิขสิทธิ์|nangsue anuyat chai likkhasit|confirm:mediaRights
social|n|署名权|shǔmíngquán|สิทธิในการระบุชื่อผู้สร้าง|sit nai kan rabu chue phu sang|protect:mediaRights
social|n|肖像权|xiàoxiàngquán|สิทธิในภาพบุคคล|sit nai phap bukkhon|protect:mediaRights
social|v|撤稿|chègǎo|ถอนเนื้อหาที่เผยแพร่|thon nueaha thi phoeiphae|support:correction
social|n|勘误|kānwù|ประกาศแก้คำผิด|prakat kae kham phit|ensure:correction
work|n|市场细分|shìchǎng xìfēn|การแบ่งส่วนตลาด|kan baeng suan talat|guide:segmentation
work|n|用户分层|yònghù fēncéng|การแบ่งระดับกลุ่มผู้ใช้|kan baeng radap klum phuchai|support:segmentation
work|n|消费者洞察|xiāofèizhě dòngchá|ข้อมูลเชิงลึกผู้บริโภค|khomun choeng luek phuboriphok|clarify:insight
work|n|购买动机|gòumǎi dòngjī|แรงจูงใจในการซื้อ|raeng chungchai nai kan sue|reveal:buyingReason
work|n|使用场景|shǐyòng chǎngjǐng|บริบทการใช้งาน|boribot kan chai ngan|clarify:purchase2
work|n|痛点|tòngdiǎn|ปัญหาหลักของผู้ใช้|panha lak khong phuchai|reveal:painImprovement
work|n|价值主张|jiàzhí zhǔzhāng|ข้อเสนอคุณค่าหลัก|khosanoe khunkha lak|clarify:positioning
work|n|品牌定位|pǐnpái dìngwèi|การวางตำแหน่งแบรนด์|kan wang tamnaeng braen|ensure:positioning
work|n|品牌认知|pǐnpái rènzhī|การรับรู้ต่อแบรนด์|kan rapru to braen|reveal:positioning
work|n|品牌忠诚度|pǐnpái zhōngchéngdù|ระดับความภักดีต่อแบรนด์|radap khwam phakdi to braen|strengthen:retention
work|n|竞争格局|jìngzhēng géjú|โครงสร้างการแข่งขัน|khrongsang kan khaengkhan|reveal:competition2
work|n|竞品分析|jìngpǐn fēnxī|การวิเคราะห์สินค้าคู่แข่ง|kan wikhro sinkha khukhaeng|support:competition2
work|n|差异化优势|chāyìhuà yōushì|ข้อได้เปรียบที่แตกต่าง|kho dai priap thi taektang|strengthen:positioning
work|n|进入壁垒|jìnrù bìlěi|อุปสรรคในการเข้าสู่ตลาด|upasak nai kan khaosu talat|signal:marketEntry
work|n|增长空间|zēngzhǎng kōngjiān|ศักยภาพในการเติบโต|sakkayaphap nai kan toepto|signal:growth2
work|n|获客成本|huòkè chéngběn|ต้นทุนการได้ลูกค้าใหม่|tonthun kan dai lukkha mai|affect:acquisition
work|n|客户终身价值|kèhù zhōngshēn jiàzhí|มูลค่าตลอดอายุลูกค้า|munkha talot ayu lukkha|reveal:customerValue
work|n|客单价|kèdānjià|มูลค่าเฉลี่ยต่อคำสั่งซื้อ|munkha chalia to khamsang sue|signal:orderValue
work|n|投资回报率|tóuzī huíbàolǜ|อัตราผลตอบแทนจากการลงทุน|attra phon topthaen chak kan longthun|reveal:profit
work|n|盈亏平衡点|yíngkuī pínghéngdiǎn|จุดคุ้มทุน|chut khum thun|clarify:breakEven
work|n|现金流|xiànjīnliú|กระแสเงินสดของกิจการ|krasae ngoen sot khong kitjakan|ensure:cash
work|n|毛利率|máolìlǜ|อัตรากำไรขั้นต้น|attra kamrai khan ton|signal:profit
work|n|净利率|jìnglìlǜ|อัตรากำไรสุทธิ|attra kamrai sutthi|signal:profit
work|n|固定成本|gùdìng chéngběn|ต้นทุนคงที่|tonthun khongthi|affect:profit
work|n|可变成本|kěbiàn chéngběn|ต้นทุนผันแปร|tonthun phanprae|affect:profit
work|n|规模效应|guīmó xiàoyìng|ผลได้จากขนาดการผลิต|phon dai chak khanat kan phalit|improve:efficiency2
work|n|供应链韧性|gōngyìngliàn rènxìng|ความยืดหยุ่นและฟื้นตัวของห่วงโซ่อุปทาน|khwam yuetyun lae fuen tua khong huangso uppathan|strengthen:supply2
work|n|库存周转率|kùcún zhōuzhuǎnlǜ|อัตราหมุนเวียนสินค้าคงคลัง|attra munwian sinkha khongkhlang|signal:inventorySpeed
work|n|交付能力|jiāofù nénglì|ขีดความสามารถส่งมอบ|khit khwam samat song mop|ensure:capacity
work|n|服务能力|fúwù nénglì|ขีดความสามารถให้บริการ|khit khwam samat hai borikan|affect:capacity
work|n|运营指标|yùnyíng zhǐbiāo|ตัวชี้วัดการดำเนินงาน|tuachiwat kan damnoen ngan|support:metric
work|n|核心指标|héxīn zhǐbiāo|ตัวชี้วัดหลัก|tuachiwat lak|guide:metric
work|n|领先指标|lǐngxiān zhǐbiāo|ตัวชี้วัดนำ|tuachiwat nam|signal:businessTrend2
work|n|滞后指标|zhìhòu zhǐbiāo|ตัวชี้วัดตามหลัง|tuachiwat tamlang|reveal:businessTrend2
work|n|数据口径|shùjù kǒujìng|นิยามการนับข้อมูล|niyam kan nap khomun|clarify:metric
study|n|样本量|yàngběnliàng|ขนาดกลุ่มตัวอย่าง|khanat klum tuayang|affect:sample
study|n|误差范围|wùchā fànwéi|ช่วงค่าคลาดเคลื่อน|chuang kha khlatkhluen|clarify:uncertainty
study|n|置信区间|zhìxìn qūjiān|ช่วงความเชื่อมั่นทางสถิติ|chuang khwam chueaman thang sathiti|clarify:uncertainty
study|n|相关关系|xiāngguān guānxì|ความสัมพันธ์เชิงสหสัมพันธ์|khwam samphan choeng sahasamphan|signal:correlationOnly
study|n|因果关系|yīnguǒ guānxì|ความสัมพันธ์เชิงเหตุและผล|khwam samphan choeng het lae phon|clarify:causality
study|n|异常值|yìchángzhí|ค่าผิดปกติในชุดข้อมูล|kha phitpokkati nai chut khomun|signal:anomaly
study|n|数据清洗|shùjù qīngxǐ|การทำความสะอาดข้อมูล|kan tham khwam sa-at khomun|reduce:anomaly
study|n|数据可视化|shùjù kěshìhuà|การนำเสนอข้อมูลด้วยภาพ|kan nam sanoe khomun duai phap|enable:visualization
study|n|趋势线|qūshìxiàn|เส้นแสดงแนวโน้ม|sen sadaeng naeo nom|reveal:businessTrend2
work|n|同比增长|tóngbǐ zēngzhǎng|การเติบโตเทียบช่วงเดียวกันปีก่อน|kan toepto thiap chuang diaokan pi kon|signal:businessTrend2
work|n|环比增长|huánbǐ zēngzhǎng|การเติบโตเทียบงวดก่อนหน้า|kan toepto thiap nguat kon na|signal:businessTrend2
work|n|季节波动|jìjié bōdòng|ความผันผวนตามฤดูกาล|khwam phanphuan tam ruedukan|signal:seasonalPattern
work|n|用户流失率|yònghù liúshīlǜ|อัตราการสูญเสียผู้ใช้|attra kan sunsia phuchai|signal:churnSignal
people|n|活跃用户|huóyuè yònghù|ผู้ใช้งานที่ยังใช้งานอยู่|phuchai ngan thi yang chai ngan yu|reveal:activeProductUse
work|n|留存曲线|liúcún qūxiàn|เส้นโค้งการคงอยู่ของผู้ใช้|sen khong kan khong yu khong phuchai|reveal:retentionShape
work|n|权责边界|quánzé biānjiè|ขอบเขตอำนาจและความรับผิดชอบ|khopkhet amnat lae khwam rapphitchop|clarify:governance
work|n|利益冲突|lìyì chōngtū|ความขัดแย้งทางผลประโยชน์|khwam khatyaeng thang phonprayot|clarify:conflictInterest
work|n|关联交易|guānlián jiāoyì|ธุรกรรมกับบุคคลที่เกี่ยวโยง|thurakam kap bukkhon thi kiaoyong|reveal:relatedConflict
work|n|合规审查|hégé shěnchá|การทบทวนการปฏิบัติตามกฎ|kan thopthuan kan patibat tam kot|ensure:compliance
work|n|法务意见|fǎwù yìjiàn|ความเห็นฝ่ายกฎหมาย|khwam hen fai kotmai|support:legal
work|n|审计线索|shěnjì xiànsuǒ|ร่องรอยสำหรับการตรวจสอบบัญชี|rongroi samrap kan truatsop banchi|reveal:auditFollow
work|n|内部控制|nèibù kòngzhì|ระบบควบคุมภายใน|rabop khuapkhum phainai|strengthen:control2
work|n|职责分离|zhízé fēnlí|การแยกหน้าที่สำคัญ|kan yaek nathi samkhan|ensure:control2
work|n|授权审批|shòuquán shěnpī|การอนุมัติตามอำนาจมอบหมาย|kan anumat tam amnat mopmai|ensure:governance
work|n|风险敞口|fēngxiǎn chǎngkǒu|ขนาดความเสี่ยงที่เปิดรับ|khanat khwam siang thi poet rap|reveal:exposure
work|n|风险偏好|fēngxiǎn piānhào|ระดับความเสี่ยงที่องค์กรเลือก|radap khwam siang thi ongkon lueak|guide:acceptedRisk
work|n|风险容忍度|fēngxiǎn róngrěndù|ขีดความทนต่อความเสี่ยง|khit khwam thon to khwam siang|clarify:exposure
work|n|重大事项|zhòngdà shìxiàng|เรื่องสำคัญที่มีนัยสำคัญ|rueang samkhan thi mi naisamkhan|require:majorReview
work|n|例外情况|lìwài qíngkuàng|กรณียกเว้นจากแนวปฏิบัติ|korani yokwen chak naeo patibat|require:governance
work|n|特批|tèpī|การอนุมัติเป็นกรณีพิเศษ|kan anumat pen korani phiset|require:governance
work|n|豁免|huòmiǎn|การยกเว้นข้อบังคับ|kan yokwen kho bangkhap|affect:compliance
work|n|监管要求|jiānguǎn yāoqiú|ข้อกำหนดจากหน่วยกำกับ|kho kamnot chak nuai kamkap|guide:compliance
work|n|行业准则|hángyè zhǔnzé|หลักปฏิบัติประจำอุตสาหกรรม|lak patibat pracham utsahakam|guide:ethics
work|n|道德规范|dàodé guīfàn|หลักจริยธรรม|lak chariyatham|guide:ethics
work|n|举报渠道|jǔbào qúdào|ช่องทางแจ้งเบาะแสภายใน|chongthang chaeng bosae phainai|enable:whistle
people|n|举报人保护|jǔbàorén bǎohù|การคุ้มครองผู้แจ้งเบาะแส|kan khumkhrong phu chaeng bosae|ensure:whistle
work|n|调查程序|diàochá chéngxù|ขั้นตอนการสอบข้อเท็จจริง|khanton kan sop khothetching|guide:investigation
work|n|证据保全|zhèngjù bǎoquán|การเก็บรักษาพยานหลักฐาน|kan kep raksa phayan lakthan|ensure:investigation
work|n|事实认定|shìshí rèndìng|การวินิจฉัยข้อเท็จจริง|kan winitchai khothetching|confirm:investigation
work|n|责任追究|zérèn zhuījiū|การเอาผิดผู้รับผิดชอบ|kan ao phit phu rapphitchop|ensure:governance
time|n|整改期限|zhěnggǎi qīxiàn|เส้นตายการแก้ไขข้อบกพร่อง|sen tai kan kaekhai kho bokphrong|guide:remediation
work|n|整改报告|zhěnggǎi bàogào|รายงานผลการแก้ไขข้อบกพร่อง|raingan phon kan kaekhai kho bokphrong|record:remediationDetails
work|n|闭环管理|bìhuán guǎnlǐ|การบริหารติดตามจนปิดเรื่อง|kan borihan tittam chon pit rueang|ensure:remediation
work|n|复核意见|fùhé yìjiàn|ความเห็นจากการตรวจทานซ้ำ|khwam hen chak kan truatthan sam|support:independence
work|n|独立意见|dúlì yìjiàn|ความเห็นที่เป็นอิสระ|khwam hen thi pen itsara|strengthen:independence
work|n|少数意见|shǎoshù yìjiàn|ความเห็นของฝ่ายส่วนน้อย|khwam hen khong fai suannoi|support:independence
study|n|反方论点|fǎnfāng lùndiǎn|ข้อโต้แย้งของฝ่ายคัดค้าน|kho toyaeng khong fai khatkhan|strengthen:argument
study|n|支持论据|zhīchí lùnjù|หลักฐานสนับสนุนข้อเสนอ|lakthan sanapsanun khosanoe|ensure:argument
study|n|反驳|fǎnbó|การโต้กลับด้วยเหตุผล|kan toklap duai hetphon|strengthen:argument
study|n|论证结构|lùnzhèng jiégòu|โครงสร้างการให้เหตุผล|khrongsang kan hai hetphon|guide:argument
study|n|前提条件|qiántí tiáojiàn|เงื่อนไขตั้งต้น|ngueankhai tangton|clarify:reasoningStart
study|n|隐含假设|yǐnhán jiǎshè|สมมติฐานที่ซ่อนอยู่|sommutithan thi son yu|reveal:reasoningStart
work|n|利弊分析|lìbì fēnxī|การวิเคราะห์ข้อดีข้อเสีย|kan wikhro khodi khosia|support:tradeoff
work|n|情景分析|qíngjǐng fēnxī|การวิเคราะห์สถานการณ์จำลอง|kan wikhro sathanakan chamlong|support:scenario
work|n|敏感性分析|mǐngǎnxìng fēnxī|การวิเคราะห์ความไวต่อปัจจัย|kan wikhro khwam wai to patchai|reveal:sensitivityResult
work|n|压力测试|yālì cèshì|การทดสอบภายใต้ภาวะกดดัน|kan thotsop phaitai phawa kotdan|support:scenario
emergency|n|极端情形|jíduān qíngxíng|สถานการณ์สุดขั้ว|sathanakan sutkhua|require:scenario
work|n|概率判断|gàilǜ pànduàn|การประเมินความน่าจะเป็น|kan pramoen khwam na cha pen|clarify:uncertainty
people|n|专家意见|zhuānjiā yìjiàn|ความเห็นจากผู้เชี่ยวชาญ|khwam hen chak phuchiao chan|support:expertBasis
people|n|利益相关方|lìyì xiāngguānfāng|ผู้มีส่วนได้ส่วนเสีย|phu mi suan dai suan sia|engage:stakeholder
culture|n|公众咨询|gōngzhòng zīxún|กระบวนการรับฟังความคิดเห็นสาธารณะ|krabuan kan rapfang khwam khithen satharana|support:stakeholder
culture|n|书面征求意见|shūmiàn zhēngqiú yìjiàn|การขอความเห็นเป็นลายลักษณ์อักษร|kan kho khwam hen pen lai lak akson|ensure:stakeholder
culture|n|听证会|tīngzhènghuì|เวทีรับฟังความคิดเห็นอย่างเป็นทางการ|wethi rapfang khwam khithen yang pen thangkan|enable:stakeholder
work|n|决策依据|juécè yījù|หลักประกอบการตัดสินใจ|lak prakop kan tatsinchai|clarify:decision
work|n|决策透明度|juécè tòumíngdù|ระดับความโปร่งใสของการตัดสินใจ|radap khwam prongsai khong kan tatsinchai|strengthen:transparency2
social|n|话外音|huàwàiyīn|ความหมายแฝงนอกถ้อยคำ|khwammai faeng nok thoikham|reveal:implied
social|n|言外之意|yánwài zhīyì|นัยที่ไม่ได้กล่าวตรง ๆ|nai thi mai dai klao trong trong|clarify:implied
social|n|弦外之音|xiánwài zhīyīn|ความหมายโดยนัยจากน้ำเสียง|khwammai doi nai chak namsiang|reveal:implied
social|n|潜台词|qiántáicí|ข้อความแฝงเบื้องหลัง|khokhwam faeng bueanglang|clarify:implied
social|n|语用习惯|yǔyòng xíguàn|ธรรมเนียมการใช้ภาษาในบริบท|thamnian kan chai phasa nai boribot|affect:misunderstanding
social|n|沟通障碍|gōutōng zhàng'ài|อุปสรรคด้านการสื่อสาร|upasak dan kan suesan|affect:misunderstanding
social|n|信息差|xìnxīchā|ช่องว่างของข้อมูลระหว่างฝ่าย|chongwang khong khomun rawang fai|affect:misunderstanding
social|n|认知偏差|rènzhī piānchā|อคติทางความคิด|akhati thang khwamkhit|affect:bias2
social|n|确认偏误|quèrèn piānwù|อคติเลือกเชื่อข้อมูลที่ตรงใจ|akhati lueak chuea khomun thi trongchai|reveal:biasRisk
social|n|刻板印象|kèbǎn yìnxiàng|ภาพเหมารวมตายตัว|phap maoruam taitua|affect:bias2
social|n|情绪反应|qíngxù fǎnyìng|ปฏิกิริยาทางอารมณ์|patikiriya thang arom|affect:emotion
social|n|防御心理|fángyù xīnlǐ|สภาวะตั้งรับทางใจ|saphawa tangrap thang chai|affect:listening
social|n|信任基础|xìnrèn jīchǔ|รากฐานความไว้วางใจ|rakthan khwam waiwangchai|strengthen:trust2
social|n|心理安全感|xīnlǐ ānquángǎn|ความปลอดภัยทางจิตใจ|khwam plotphai thang chitchai|ensure:psychological
social|n|边界感|biānjiègǎn|ความตระหนักเรื่องขอบเขตส่วนตัว|khwam tranak rueang khopkhet suantua|protect:boundary
social|n|分寸感|fēncùngǎn|ความรู้กาลเทศะและความพอดี|khwam ru kalathesa lae khwam phodi|strengthen:boundary
social|n|共情回应|gòngqíng huíyìng|การตอบกลับอย่างเข้าอกเข้าใจ|kan topklap yang khao-ok khaochai|ensure:empathy2
social|n|积极倾听|jījí qīngtīng|การฟังอย่างตั้งใจและมีส่วนร่วม|kan fang yang tangchai lae mi suan ruam|ensure:listening
social|n|开放式提问|kāifàngshì tíwèn|คำถามปลายเปิด|khamtham plai poet|enable:questioning
social|n|封闭式提问|fēngbìshì tíwèn|คำถามปลายปิด|khamtham plai pit|enable:confirmation2
social|n|追问|zhuīwèn|การถามเจาะต่อเนื่อง|kan tham cho to nueang|enable:questioning
social|n|复述确认|fùshù quèrèn|การทวนความเพื่อยืนยัน|kan thuan khwam phuea yuenyan|ensure:confirmation2
social|n|总结确认|zǒngjié quèrèn|การสรุปทวนข้อตกลง|kan sarup thuan khotoklong|ensure:commitment2
social|n|观点碰撞|guāndiǎn pèngzhuàng|การแลกเปลี่ยนมุมมองอย่างเข้มข้น|kan laekplian mum mong yang khemkhon|strengthen:constructive
social|n|建设性批评|jiànshèxìng pīpíng|คำวิจารณ์เชิงสร้างสรรค์|kham wichan choeng sangsan|improve:feedback2
social|n|非暴力沟通|fēibàolì gōutōng|การสื่อสารโดยไม่ใช้ความรุนแรง|kan suesan doi mai chai khwam runraeng|ensure:empathy2
social|n|冲突升级|chōngtū shēngjí|การยกระดับความขัดแย้ง|kan yokradap khwam khatyaeng|affect:deescalate
social|n|冲突降温|chōngtū jiàngwēn|การลดความร้อนแรงของข้อขัดแย้ง|kan lot khwam ronraeng khong kho khatyaeng|support:deescalate
people|n|调解人|tiáojiěrén|ผู้ไกล่เกลี่ยข้อพิพาท|phu klaiklia kho phiphat|support:mediation
social|n|中立立场|zhōnglì lìchǎng|จุดยืนเป็นกลาง|chutyuen pen klang|strengthen:mediation
social|n|共同目标|gòngtóng mùbiāo|เป้าหมายที่มีร่วมกัน|paomai thi mi ruam kan|strengthen:commonGround
social|n|最小共识|zuìxiǎo gòngshí|จุดเห็นพ้องขั้นต่ำ|chut henphong khan tam|support:commonGround
social|n|利益诉求|lìyì sùqiú|ข้อเรียกร้องด้านผลประโยชน์|kho riakrong dan phonprayot|clarify:interests
social|n|情感需求|qínggǎn xūqiú|ความต้องการด้านความรู้สึก|khwam tongkan dan khwam rusuek|clarify:interests
social|n|现实约束|xiànshí yuēshù|ข้อจำกัดในทางปฏิบัติจริง|kho chamkat nai thang patibat ching|affect:tradeoff
culture|n|权力距离|quánlì jùlí|ระยะห่างเชิงอำนาจ|raya hang choeng amnat|affect:hierarchy
culture|n|等级观念|děngjí guānniàn|ค่านิยมเรื่องลำดับชั้น|khaniyom rueang lamdap chan|reveal:hierarchyInfluence
culture|n|人情往来|rénqíng wǎnglái|การรักษาน้ำใจระหว่างคน|kan raksa namchai rawang khon|strengthen:reciprocity
culture|n|礼尚往来|lǐ shàng wǎnglái|ธรรมเนียมตอบแทนไมตรี|thamnian topthaen maitri|strengthen:reciprocity
social|n|委婉表达|wěiwǎn biǎodá|การสื่อความอย่างอ้อมค้อมสุภาพ|kan sue khwam yang omkhom suphap|enable:tact
social|phrase|留有余地|liúyǒu yúdì|เว้นพื้นที่เผื่อปรับเปลี่ยน|wen phuenthi phuea prap plian|support:flexibility
social|n|当面沟通|dāngmiàn gōutōng|การพูดคุยต่อหน้า|kan phutkhui tona|support:confirmation2
social|n|私下沟通|sīxià gōutōng|การพูดคุยเป็นการส่วนตัว|kan phutkhui penkan suantua|protect:boundary
work|n|正式反馈|zhèngshì fǎnkuì|ข้อเสนอแนะอย่างเป็นทางการ|khosanoenae yang pen thangkan|enable:feedback2
work|n|即时反馈|jíshí fǎnkuì|ข้อเสนอแนะทันที|khosanoenae thanthi|enable:feedback2
work|n|具体反馈|jùtǐ fǎnkuì|ข้อเสนอแนะที่เจาะจง|khosanoenae thi chochong|clarify:feedback2
work|n|正向反馈|zhèngxiàng fǎnkuì|ข้อเสนอแนะเชิงบวก|khosanoenae choeng buak|strengthen:trust2
work|n|纠正性反馈|jiūzhèngxìng fǎnkuì|ข้อเสนอแนะเพื่อแก้ไข|khosanoenae phuea kaekhai|improve:feedback2
social|n|跟进问题|gēnjìn wèntí|คำถามติดตาม|khamtham tittam|track:commitment2
social|n|行动承诺|xíngdòng chéngnuò|คำมั่นว่าจะลงมือทำ|kham man wa cha longmue tham|ensure:commitment2
  `);

  const L6 = parse(`
culture|n|公共预算|gōnggòng yùsuàn|งบประมาณภาครัฐ|ngoppraman phak rat|reveal:publicBudget
culture|n|财政赤字|cáizhèng chìzì|ภาวะขาดดุลการคลัง|phawa khatdun kan khlang|affect:fiscal
culture|n|公共债务|gōnggòng zhàiwù|หนี้สาธารณะ|ni satharana|affect:fiscal
culture|n|税收公平|shuìshōu gōngpíng|ความเป็นธรรมทางภาษี|khwam pen tham thang phasi|ensure:taxJustice
culture|n|累进税制|lěijìn shuìzhì|ระบบภาษีอัตราก้าวหน้า|rabop phasi attra kaona|support:taxJustice
culture|n|福利政策|fúlì zhèngcè|นโยบายสวัสดิการ|nayobai sawatdikan|support:welfare
culture|n|普惠服务|pǔhuì fúwù|บริการที่ทุกคนเข้าถึงได้|borikan thi thuk khon khaothueng dai|ensure:welfare
culture|n|基层治理|jīcéng zhìlǐ|การบริหารระดับฐานราก|kan borihan radap thanrak|support:localGov
culture|n|地方自治|dìfāng zìzhì|การปกครองตนเองของท้องถิ่น|kan pokkhrong ton eng khong thongthin|enable:localGov
culture|n|行政透明|xíngzhèng tòumíng|ความโปร่งใสในการบริหารราชการ|khwam prongsai nai kan borihan ratchakan|strengthen:accountability
culture|n|司法独立|sīfǎ dúlì|ความเป็นอิสระของตุลาการ|khwam pen itsara khong tulakan|protect:justice
culture|n|法治精神|fǎzhì jīngshén|จิตสำนึกด้านหลักนิติธรรม|chitsamnuek dan lak nititham|strengthen:ruleLaw
culture|n|程序正义|chéngxù zhèngyì|ความยุติธรรมเชิงกระบวนการ|khwam yutitham choeng krabuan kan|ensure:justice
culture|n|无罪推定|wúzuì tuīdìng|หลักสันนิษฐานว่าเป็นผู้บริสุทธิ์|lak sannitthan wa pen phu borisut|protect:justice
culture|n|言论空间|yánlùn kōngjiān|พื้นที่แสดงความคิดเห็น|phuenthi sadaeng khwam khithen|enable:civilRights
culture|n|新闻自由|xīnwén zìyóu|เสรีภาพของสื่อข่าว|seriphap khong sue khao|protect:civilRights
culture|n|结社自由|jiéshè zìyóu|เสรีภาพในการรวมกลุ่ม|seriphap nai kan ruam klum|protect:civilRights
culture|n|公众监督|gōngzhòng jiāndū|การตรวจสอบโดยประชาชน|kan truatsop doi prachachon|strengthen:accountability
culture|n|问责机制|wènzé jīzhì|กลไกความรับผิดรับชอบ|konkai khwam rapphit rapchop|ensure:accountability
culture|n|权力制衡|quánlì zhìhéng|การถ่วงดุลอำนาจ|kan thuangdun amnat|strengthen:ruleLaw
culture|n|政策执行力|zhèngcè zhíxínglì|ขีดความสามารถขับเคลื่อนนโยบาย|khit khwam samat khapkhluean nayobai|affect:policy
culture|n|政策评估|zhèngcè pínggū|การประเมินผลนโยบาย|kan pramoen phon nayobai|confirm:policyMeasure
culture|n|政策试点|zhèngcè shìdiǎn|การทดลองนโยบายนำร่อง|kan thotlong nayobai namrong|support:pilotLearning
culture|n|政策反馈|zhèngcè fǎnkuì|ข้อสะท้อนกลับต่อนโยบาย|kho sathon klap to nayobai|improve:policy
culture|n|社会协商|shèhuì xiéshāng|การปรึกษาหารือทางสังคม|kan prueksa harue thang sangkhom|support:participation
culture|n|公民素养|gōngmín sùyǎng|ความรู้และทักษะความเป็นพลเมือง|khwamru lae thaksa khwam pen phonlamueang|strengthen:participation
culture|n|公共参与|gōnggòng cānyù|การมีส่วนร่วมสาธารณะ|kan mi suan ruam satharana|enable:participation
culture|n|社区自治|shèqū zìzhì|การจัดการตนเองของชุมชน|kan chatkan ton eng khong chumchon|strengthen:localGov
culture|n|社会资本|shèhuì zīběn|ทุนทางสังคม|thun thang sangkhom|strengthen:socialCapital
culture|n|信任网络|xìnrèn wǎngluò|เครือข่ายความไว้วางใจ|khrueakhai khwam waiwangchai|support:socialCapital
culture|n|公共空间|gōnggòng kōngjiān|พื้นที่สาธารณะ|phuenthi satharana|enable:sharedSpace
culture|n|城乡差距|chéngxiāng chājù|ความเหลื่อมล้ำระหว่างเมืองกับชนบท|khwam lueamlam rawang mueang kap chonnabot|reveal:unfairDistribution
culture|n|区域发展|qūyù fāzhǎn|การพัฒนาระดับภูมิภาค|kan phatthana radap phumiphak|support:inequality
culture|n|人口流动|rénkǒu liúdòng|การเคลื่อนย้ายประชากร|kan khluean yai prachakon|affect:migration
culture|n|人才外流|réncái wàiliú|การไหลออกของบุคลากรฝีมือ|kan lai ok khong bukhlakon fimeu|signal:brainDrain2
culture|n|劳动权益|láodòng quányì|สิทธิและผลประโยชน์ของแรงงาน|sitthi lae phonprayot khong raengngan|protect:laborRights
culture|n|最低工资|zuìdī gōngzī|อัตราค่าจ้างขั้นต่ำ|attra kha chang khan tam|define:minimumWageFloor
culture|n|非正规就业|fēizhèngguī jiùyè|การจ้างงานนอกระบบ|kan chang ngan nok rabop|require:platformWork
culture|n|平台用工|píngtái yònggōng|การจ้างแรงงานผ่านแพลตฟอร์ม|kan chang raengngan phan phaetfom|affect:platformWork
culture|n|零工经济|línggōng jīngjì|เศรษฐกิจงานรับจ้างเป็นครั้ง|setthakit ngan rap chang pen khrang|reveal:gigChange
health|n|职业安全|zhíyè ānquán|ความปลอดภัยในการประกอบอาชีพ|khwam plotphai nai kan prakop achip|protect:laborRights
culture|n|社会流动|shèhuì liúdòng|การเลื่อนสถานะทางสังคม|kan luean sathana thang sangkhom|strengthen:mobility
culture|n|机会平等|jīhuì píngděng|ความเสมอภาคด้านโอกาส|khwam samoep hak dan okat|ensure:mobility
culture|n|代际流动|dàijì liúdòng|การขยับฐานะข้ามรุ่น|kan khayap thana kham run|reveal:mobility
culture|n|财富集中|cáifù jízhōng|การกระจุกตัวของความมั่งคั่ง|kan krachuk tua khong khwam mangkhang|affect:inequality
people|n|中产阶层|zhōngchǎn jiēcéng|ชนชั้นกลาง|chonchan klang|reveal:middleClassRole
culture|n|弱势处境|ruòshì chǔjìng|ภาวะเสียเปรียบของกลุ่มเปราะบาง|phawa sia priap khong klum pro bang|reveal:vulnerableReality
culture|n|社会排斥|shèhuì páichì|การกีดกันออกจากสังคม|kan kitkan ok chak sangkhom|affect:inclusion
culture|n|社会融合|shèhuì rónghé|การบูรณาการทางสังคม|kan buranakan thang sangkhom|strengthen:inclusion
culture|n|文化遗产|wénhuà yíchǎn|มรดกทางวัฒนธรรม|moradok thang watthanatham|protect:heritage
culture|n|非物质文化遗产|fēiwùzhì wénhuà yíchǎn|มรดกภูมิปัญญาทางวัฒนธรรม|moradok phumpanya thang watthanatham|protect:heritage
culture|n|口述历史|kǒushù lìshǐ|ประวัติศาสตร์บอกเล่า|prawattisat boklao|record:oralHistory
culture|n|集体记忆|jítǐ jìyì|ความทรงจำร่วมของกลุ่ม|khwam songcham ruam khong klum|strengthen:oralHistory
culture|n|历史叙事|lìshǐ xùshì|เรื่องเล่าทางประวัติศาสตร์|rueanglao thang prawattisat|affect:identity2
culture|n|地方知识|dìfāng zhīshi|องค์ความรู้ท้องถิ่น|ong khwamru thongthin|support:localKnowledge
culture|n|民间智慧|mínjiān zhìhuì|ภูมิปัญญาชาวบ้าน|phumpanya chaoban|strengthen:localKnowledge
culture|n|社区传统|shèqū chuántǒng|ขนบประจำชุมชน|khanop pracham chumchon|strengthen:heritage
culture|n|仪式感|yíshìgǎn|บรรยากาศและความรู้สึกแบบพิธีการ|banyakat lae khwam rusuek baep phithikan|strengthen:symbolism
culture|n|象征意义|xiàngzhēng yìyì|ความหมายเชิงสัญลักษณ์|khwammai choeng sanyalak|clarify:symbolism
culture|n|文化符号|wénhuà fúhào|สัญลักษณ์แทนวัฒนธรรม|sanyalak thaen watthanatham|reveal:culturalMeaning
culture|n|文化认同|wénhuà rèntóng|อัตลักษณ์ร่วมทางวัฒนธรรม|attalak ruam thang watthanatham|strengthen:identity2
culture|n|族群认同|zúqún rèntóng|อัตลักษณ์ทางชาติพันธุ์|attalak thang chatphan|strengthen:identity2
culture|n|国家认同|guójiā rèntóng|ความรู้สึกเป็นส่วนหนึ่งของชาติ|khwam rusuek pen suan nueng khong chat|strengthen:identity2
culture|n|多重身份|duōchóng shēnfèn|อัตลักษณ์หลายชั้น|attalak lai chan|reveal:identity2
culture|n|文化适应|wénhuà shìyìng|การปรับตัวทางวัฒนธรรม|kan prap tua thang watthanatham|support:adaptation
culture|n|文化冲击|wénhuà chōngjī|ภาวะช็อกจากความต่างทางวัฒนธรรม|phawa chok chak khwam tang thang watthanatham|affect:adaptation
culture|n|文化交流|wénhuà jiāoliú|การแลกเปลี่ยนวัฒนธรรม|kan laekplian watthanatham|strengthen:exchange
culture|n|跨文化沟通|kuà wénhuà gōutōng|การสื่อสารข้ามวัฒนธรรม|kan suesan kham watthanatham|support:exchange
culture|n|文化翻译|wénhuà fānyì|การถ่ายทอดความหมายข้ามวัฒนธรรม|kan thaithot khwammai kham watthanatham|support:localization
culture|n|本土化|běntǔhuà|การปรับให้เข้ากับท้องถิ่น|kan prap hai khaokap thongthin|ensure:localization
culture|n|全球化|quánqiúhuà|กระบวนการโลกาภิวัตน์|krabuan kan lokaphiwat|affect:exchange
culture|n|混合文化|hùnhé wénhuà|วัฒนธรรมลูกผสม|watthanatham lukphasom|reveal:exchange
culture|n|文化再现|wénhuà zàixiàn|การนำเสนอภาพแทนวัฒนธรรม|kan nam sanoe phap thaen watthanatham|affect:representation
culture|n|主流文化|zhǔliú wénhuà|วัฒนธรรมกระแสหลัก|watthanatham krasae lak|affect:representation
culture|n|亚文化|yàwénhuà|วัฒนธรรมกลุ่มย่อย|watthanatham klum yoi|reveal:subcultureDiversity
culture|n|文化产业|wénhuà chǎnyè|อุตสาหกรรมวัฒนธรรม|utsahakam watthanatham|support:creative
culture|n|创意经济|chuàngyì jīngjì|เศรษฐกิจสร้างสรรค์|setthakit sangsan|support:creative
culture|n|手工技艺|shǒugōng jìyì|ทักษะงานหัตถกรรม|thaksa ngan hatthakam|protect:craft
culture|n|民间艺术|mínjiān yìshù|ศิลปะพื้นบ้าน|sinlapa phuenban|strengthen:heritage
culture|n|传统工艺|chuántǒng gōngyì|งานช่างแบบดั้งเดิม|ngan chang baep dangdoem|protect:craft
food|n|饮食文化|yǐnshí wénhuà|วัฒนธรรมการกิน|watthanatham kan kin|reveal:identity2
culture|n|宗教实践|zōngjiào shíjiàn|การปฏิบัติทางศาสนา|kan patibat thang satsana|reveal:faithInLife
culture|n|世俗化|shìsúhuà|กระบวนการทำให้เป็นเรื่องทางโลก|krabuan kan tham hai pen rueang thang lok|affect:faith
culture|n|信仰自由|xìnyǎng zìyóu|เสรีภาพในการนับถือศาสนาหรือความเชื่อ|seriphap nai kan napthue satsana rue khwam chuea|protect:faith
culture|n|族群关系|zúqún guānxì|ความสัมพันธ์ระหว่างชาติพันธุ์|khwam samphan rawang chatphan|affect:inclusion
people|n|少数群体|shǎoshù qúntǐ|กลุ่มชนส่วนน้อย|klum chon suannoi|protect:minority
people|n|原住民|yuánzhùmín|ชนพื้นเมืองดั้งเดิม|chon phuenmueang dangdoem|protect:heritage
culture|n|语言传承|yǔyán chuánchéng|การสืบทอดภาษา|kan suepthot phasa|support:languageTransmission
culture|n|濒危语言|bīnwēi yǔyán|ภาษาที่เสี่ยงสูญหาย|phasa thi siang sunhai|strengthen:languageTransmission
study|n|双语教育|shuāngyǔ jiàoyù|การศึกษาสองภาษา|kan sueksa song phasa|support:bilingual
culture|n|语言政策|yǔyán zhèngcè|นโยบายด้านภาษา|nayobai dan phasa|affect:languageTransmission
culture|n|语言身份|yǔyán shēnfèn|อัตลักษณ์ที่ผูกกับภาษา|attalak thi phuk kap phasa|reveal:identity2
culture|n|语码转换|yǔmǎ zhuǎnhuàn|การสลับรหัสภาษา|kan salap rahat phasa|enable:codeSwitch
culture|n|敬称体系|jìngchēng tǐxì|ระบบคำเรียกเชิงยกย่อง|rabop kham riak choeng yokyong|guide:politeness2
culture|n|亲属称谓|qīnshǔ chēngwèi|คำเรียกเครือญาติ|kham riak khrueayat|reveal:identity2
culture|n|礼貌策略|lǐmào cèlüè|กลวิธีแสดงความสุภาพ|konwithi sadaeng khwam suphap|enable:politeness2
culture|n|高语境文化|gāo yǔjìng wénhuà|วัฒนธรรมบริบทสูง|watthanatham boribot sung|affect:contextCulture
culture|n|低语境文化|dī yǔjìng wénhuà|วัฒนธรรมบริบทต่ำ|watthanatham boribot tam|affect:contextCulture
study|n|批判性思维|pīpànxìng sīwéi|การคิดเชิงวิพากษ์|kan khit choeng wiphak|strengthen:critical
study|n|媒体素养|méitǐ sùyǎng|ความรู้เท่าทันสื่อ|khwam ru thaothan sue|strengthen:critical
study|n|信息素养|xìnxī sùyǎng|ความรู้เท่าทันสารสนเทศ|khwam ru thaothan sarasonthet|strengthen:sourceQuality
study|n|数字素养|shùzì sùyǎng|ทักษะรู้เท่าทันดิจิทัล|thaksa ru thaothan dichithan|strengthen:digitalLiteracy2
study|n|论点|lùndiǎn|ประเด็นโต้แย้งหลัก|praden toyaeng lak|clarify:argument
study|n|论据|lùnjù|เหตุผลและหลักฐานประกอบ|hetphon lae lakthan prakop|ensure:argument
study|n|推理链|tuīlǐliàn|ห่วงโซ่การให้เหตุผล|huangso kan hai hetphon|reveal:reasoningStart
study|n|逻辑漏洞|luójí lòudòng|ช่องโหว่ทางตรรกะ|chongwo thang takka|signal:fallacy
study|n|偷换概念|tōuhuàn gàiniàn|การเปลี่ยนความหมายของแนวคิดกลางคัน|kan plian khwammai khong naeokhit klang khan|signal:fallacy
study|phrase|以偏概全|yǐ piān gài quán|การเหมารวมจากข้อมูลเพียงส่วนเดียว|kan maoruam chak khomun phiang suan diao|affect:critical
study|n|因果倒置|yīnguǒ dàozhì|การสลับเหตุและผล|kan salap het lae phon|signal:fallacy
study|n|虚假两难|xūjiǎ liǎngnán|ทางเลือกสองขั้วลวง|thanglueak song khua luang|signal:fallacy
study|n|诉诸权威|sùzhū quánwēi|การอ้างอำนาจหรือผู้เชี่ยวชาญแทนเหตุผล|kan ang amnat rue phuchiao chan thaen hetphon|affect:critical
study|n|诉诸情感|sùzhū qínggǎn|การใช้อารมณ์แทนเหตุผล|kan chai arom thaen hetphon|affect:critical
study|n|人身攻击|rénshēn gōngjī|การโจมตีตัวบุคคล|kan chomti tua bukkhon|affect:constructive
study|n|稻草人论证|dàocǎorén lùnzhèng|การบิดข้อโต้แย้งให้โต้ได้ง่าย|kan bit kho toyaeng hai to dai ngai|signal:fallacy
study|n|幸存者偏差|xìngcúnzhě piānchā|อคติจากผู้รอดชีวิต|akhati chak phu rot chiwit|affect:sample
study|n|选择性呈现|xuǎnzéxìng chéngxiàn|การนำเสนอข้อมูลแบบเลือกข้าง|kan nam sanoe khomun baep lueak khang|affect:sourceQuality
study|n|证据等级|zhèngjù děngjí|ลำดับความน่าเชื่อถือของหลักฐาน|lamdap khwam na chueathue khong lakthan|guide:sourceQuality
study|n|一手资料|yìshǒu zīliào|ข้อมูลปฐมภูมิ|khomun pathomphum|strengthen:sourceQuality
study|n|二手资料|èrshǒu zīliào|ข้อมูลทุติยภูมิ|khomun thutiyaphum|require:sourceQuality
study|n|同行评审|tóngháng píngshěn|การประเมินโดยผู้ทรงคุณวุฒิสาขาเดียวกัน|kan pramoen doi phu song khunnawut sakha diaokan|strengthen:reproducibility
study|n|可重复性|kě chóngfùxìng|ความสามารถทำซ้ำได้|khwam samat tham sam dai|ensure:reproducibility
study|n|可证伪性|kě zhèngwěixìng|ความสามารถถูกพิสูจน์ว่าเป็นเท็จ|khwam samat thuk phisut wa pen thet|strengthen:critical
study|n|研究伦理|yánjiū lúnlǐ|จริยธรรมการวิจัย|chariyatham kan wichai|ensure:researchEthics
study|n|知情同意|zhīqíng tóngyì|ความยินยอมหลังรับข้อมูลครบถ้วน|khwam yinyom lang rap khomun khropthuan|ensure:researchEthics
study|n|样本偏差|yàngběn piānchā|ความเอนเอียงของกลุ่มตัวอย่าง|khwam en-iang khong klum tuayang|affect:sample
study|n|利益披露|lìyì pīlù|การเปิดเผยผลประโยชน์เกี่ยวข้อง|kan poetphoei phonprayot kiaokhong|ensure:conflictInterest
study|n|方法透明|fāngfǎ tòumíng|ความโปร่งใสด้านวิธีศึกษา|khwam prongsai dan withi sueksa|ensure:reproducibility
study|n|数据完整性|shùjù wánzhěngxìng|ความครบถ้วนสมบูรณ์ของข้อมูล|khwam khropthuan sombun khong khomun|ensure:sourceQuality
study|n|结论外推|jiélùn wàituī|การขยายข้อสรุปไปนอกกลุ่มศึกษา|kan khayai kho sarup pai nok klum sueksa|mind:extrapolation
study|n|适用范围|shìyòng fànwéi|ขอบเขตที่นำผลไปใช้ได้|khopkhet thi nam phon pai chai dai|clarify:extrapolation
study|n|反例|fǎnlì|ตัวอย่างหักล้าง|tuayang haklang|strengthen:critical
study|n|类比|lèibǐ|การเปรียบเทียบเชิงอุปมา|kan priapthiap choeng upama|support:rhetoric
study|n|隐喻|yǐnyù|อุปลักษณ์|uppalak|affect:rhetoric
study|n|修辞|xiūcí|กลวิธีวาทศิลป์|konwithi wathasin|reveal:rhetoric
social|n|叙事框架|xùshì kuàngjià|กรอบการเล่าเรื่อง|krop kan lao rueang|affect:rhetoric
culture|n|话语权|huàyǔquán|อำนาจในการกำหนดวาทกรรม|amnat nai kan kamnot wathakam|affect:agenda
social|n|议程设置|yìchéng shèzhì|การกำหนดวาระสาธารณะ|kan kamnot wara satharana|affect:agenda
social|n|框架效应|kuàngjià xiàoyìng|ผลจากกรอบการนำเสนอ|phon chak krop kan nam sanoe|affect:rhetoric
social|n|回音室效应|huíyīnshì xiàoyìng|ปรากฏการณ์ห้องเสียงสะท้อน|prakotkan hong siang sathon|affect:echo
social|n|信息茧房|xìnxī jiǎnfáng|ภาวะรังไหมข้อมูล|phawa rangmai khomun|affect:echo
social|n|群体极化|qúntǐ jíhuà|การแบ่งขั้วรุนแรงในกลุ่ม|kan baeng khua runraeng nai klum|affect:polarization
social|n|从众效应|cóngzhòng xiàoyìng|ผลจากการคล้อยตามกลุ่ม|phon chak kan khloitam klum|affect:bias2
study|n|认知负荷|rènzhī fùhè|ภาระทางการรับรู้|phara thang kan rapru|affect:attention
social|n|注意力经济|zhùyìlì jīngjì|เศรษฐกิจแย่งชิงความสนใจ|setthakit yaengching khwam sonchai|affect:attention
social|n|情绪传播|qíngxù chuánbō|การแพร่กระจายอารมณ์|kan phrae krachai arom|signal:emotionalSpread
social|n|舆论操纵|yúlùn cāozòng|การชักใยความคิดเห็นสาธารณะ|kan chak-yai khwam khithen satharana|affect:manipulation
social|n|深度伪造|shēndù wèizào|สื่อปลอมเชิงลึก|sue plom choeng luek|signal:deepfakeRisk
social|n|算法推荐|suànfǎ tuījiàn|ระบบแนะนำด้วยอัลกอริทึม|rabop naenam duai ankorit huem|affect:echo
social|n|内容农场|nèiróng nóngchǎng|แหล่งผลิตเนื้อหาปริมาณมากคุณภาพต่ำ|laeng phalit nueaha pariman mak khunnaphap tam|mind:sourceFarmRisk
social|n|点击诱饵|diǎnjī yòu'ěr|พาดหัวล่อให้คลิก|phat hua lo hai khlik|affect:credibility
social|n|数字足迹|shùzì zújì|ร่องรอยดิจิทัล|rongroi dichithan|reveal:trailReality
culture|n|数据主权|shùjù zhǔquán|อธิปไตยเหนือข้อมูล|athippatai nuea khomun|strengthen:dataRights
culture|n|知情权|zhīqíngquán|สิทธิที่จะได้รับรู้ข้อมูล|sit thi cha dai rapru khomun|protect:informedAccess
culture|n|被遗忘权|bèi yíwàngquán|สิทธิที่จะถูกลืม|sit thi cha thuk luem|protect:eraseData
culture|n|隐私设计|yǐnsī shèjì|การออกแบบที่คำนึงถึงความเป็นส่วนตัว|kan okbaep thi khamnueng thueng khwam pen suantua|ensure:dataRights
culture|n|算法透明|suànfǎ tòumíng|ความโปร่งใสของอัลกอริทึม|khwam prongsai khong ankorit huem|strengthen:algorithm
culture|n|算法歧视|suànfǎ qíshì|การเลือกปฏิบัติจากอัลกอริทึม|kan lueak patibat chak ankorit huem|signal:unfairAutomation
culture|n|自动化决策|zìdònghuà juécè|การตัดสินใจโดยระบบอัตโนมัติ|kan tatsinchai doi rabop attanomat|require:humanControl
culture|n|人工监督|réngōng jiāndū|การกำกับตรวจสอบโดยมนุษย์|kan kamkap truatsop doi manut|ensure:humanControl
culture|n|责任归属|zérèn guīshǔ|การระบุผู้รับผิดเมื่อเกิดผลกระทบ|kan rabu phu rapphit muea koet phonkathop|clarify:autoAccountability
culture|n|技术中立|jìshù zhōnglì|แนวคิดว่าเทคโนโลยีเป็นกลาง|naeokhit wa theknoloyi pen klang|mind:neutralityQuestion
culture|n|数字权利|shùzì quánlì|สิทธิของบุคคลในโลกดิจิทัล|sitthi khong bukkhon nai lok dichithan|protect:dataRights
culture|n|网络治理|wǎngluò zhìlǐ|การกำกับดูแลโลกออนไลน์|kan kamkap dulae lok onlai|strengthen:platform
culture|n|平台责任|píngtái zérèn|ความรับผิดชอบของแพลตฟอร์ม|khwam rapphitchop khong phaetfom|ensure:platform
culture|n|内容治理|nèiróng zhìlǐ|การกำกับดูแลเนื้อหาออนไลน์|kan kamkap dulae nueaha onlai|support:platform
work|n|开源许可|kāiyuán xǔkě|สัญญาอนุญาตโอเพนซอร์ส|sanya anuyat open sot|guide:license
culture|n|技术垄断|jìshù lǒngduàn|การผูกขาดเทคโนโลยี|kan phuk khat theknoloyi|signal:techCompetition
culture|n|创新监管|chuàngxīn jiānguǎn|การกำกับนวัตกรรม|kan kamkap nawattakam|support:innovation
culture|n|预防原则|yùfáng yuánzé|หลักป้องกันไว้ก่อน|lak pongkan wai kon|guide:innovation
culture|n|环境正义|huánjìng zhèngyì|ความยุติธรรมด้านสิ่งแวดล้อม|khwam yutitham dan singwaetlom|ensure:climateJustice
culture|n|气候正义|qìhòu zhèngyì|ความยุติธรรมด้านภูมิอากาศ|khwam yutitham dan phumiakat|strengthen:climateJustice
culture|n|代际公平|dàijì gōngpíng|ความเป็นธรรมระหว่างรุ่น|khwam pen tham rawang run|ensure:climateJustice
culture|phrase|共同但有区别的责任|gòngtóng dàn yǒu qūbié de zérèn|ความรับผิดชอบร่วมแต่แตกต่างกัน|khwam rapphitchop ruam tae taektang kan|clarify:climateJustice
work|n|绿色金融|lǜsè jīnróng|การเงินสีเขียว|kanngoen si khiao|support:greenCapital
culture|n|碳足迹|tàn zújì|รอยเท้าคาร์บอน|roithao khabon|track:carbon
culture|n|碳中和|tàn zhōnghé|ความเป็นกลางทางคาร์บอน|khwam pen klang thang khabon|support:carbon
culture|n|净零排放|jìnglíng páifàng|การปล่อยสุทธิเป็นศูนย์|kan ploi sutthi pen sun|ensure:carbon
culture|n|碳定价|tàn dìngjià|การกำหนดราคาคาร์บอน|kan kamnot rakha khabon|support:carbonPriceResult
culture|n|排放权交易|páifàngquán jiāoyì|การซื้อขายสิทธิปล่อยก๊าซเรือนกระจก|kan sue khai sit ploi kat ruean krachok|enable:carbon
culture|n|循环经济|xúnhuán jīngjì|เศรษฐกิจหมุนเวียน|setthakit munwian|support:circular
culture|n|资源效率|zīyuán xiàolǜ|ประสิทธิภาพการใช้ทรัพยากร|prasitthiphap kan chai sapphayakon|improve:resourceUse2
work|n|绿色采购|lǜsè cǎigòu|การจัดซื้อที่เป็นมิตรต่อสิ่งแวดล้อม|kan chatsue thi pen mit to singwaetlom|support:greenPurchase
work|n|可持续供应链|kě chíxù gōngyìngliàn|ห่วงโซ่อุปทานที่ยั่งยืน|huangso uppathan thi yangyuen|strengthen:sustainableSupply
culture|n|生态补偿|shēngtài bǔcháng|การชดเชยด้านระบบนิเวศ|kan chotchoei dan rabop niwet|support:ecosystemRepair
culture|n|生境保护|shēngjìng bǎohù|การคุ้มครองถิ่นที่อยู่อาศัยธรรมชาติ|kan khumkhrong thin thi yu asai thammachat|ensure:ecosystem
culture|n|自然资本|zìrán zīběn|ทุนธรรมชาติ|thun thammachat|strengthen:naturalValue
culture|n|环境影响评估|huánjìng yǐngxiǎng pínggū|การประเมินผลกระทบสิ่งแวดล้อม|kan pramoen phonkathop singwaetlom|ensure:impactBefore
culture|n|社会影响评估|shèhuì yǐngxiǎng pínggū|การประเมินผลกระทบทางสังคม|kan pramoen phonkathop thang sangkhom|ensure:socialImpact2
culture|n|公平转型|gōngpíng zhuǎnxíng|การเปลี่ยนผ่านอย่างเป็นธรรม|kan plian phan yang pen tham|ensure:transition
culture|n|能源转型|néngyuán zhuǎnxíng|การเปลี่ยนผ่านด้านพลังงาน|kan plian phan dan phalangngan|support:energyMix
culture|n|粮食安全|liángshí ānquán|ความมั่นคงทางอาหาร|khwam mankhong thang ahan|ensure:basicSecurity
culture|n|水安全|shuǐ ānquán|ความมั่นคงด้านน้ำ|khwam mankhong dan nam|ensure:basicSecurity
health|n|公共卫生|gōnggòng wèishēng|การสาธารณสุข|kan satharanasuk|strengthen:healthEquity
health|n|健康公平|jiànkāng gōngpíng|ความเป็นธรรมด้านสุขภาพ|khwam pen tham dan sukkhaphap|ensure:healthEquity
culture|n|照护经济|zhàohù jīngjì|เศรษฐกิจงานดูแล|setthakit ngan dulae|reveal:care
culture|n|无偿照护|wúcháng zhàohù|งานดูแลที่ไม่ได้รับค่าตอบแทน|ngan dulae thi mai dai rap kha topthaen|reveal:care
culture|n|人口红利|rénkǒu hónglì|ผลได้ทางเศรษฐกิจจากโครงสร้างประชากร|phon dai thang setthakit chak khrongsang prachakon|support:demographicGain
culture|n|老年友好|lǎonián yǒuhǎo|ความเป็นมิตรต่อผู้สูงอายุ|khwam pen mit to phu sung ayu|support:aging
culture|n|无障碍设计|wúzhàng'ài shèjì|การออกแบบที่เข้าถึงได้ไร้อุปสรรค|kan okbaep thi khaothueng dai rai upasak|enable:accessibility
culture|n|通用设计|tōngyòng shèjì|การออกแบบเพื่อคนทุกกลุ่ม|kan okbaep phuea khon thuk klum|strengthen:accessibility
culture|phrase|据现有证据判断，这个解释更合理|jù xiànyǒu zhèngjù pànduàn, zhège jiěshì gèng hélǐ|เมื่อพิจารณาจากหลักฐานที่มี คำอธิบายนี้สมเหตุสมผลกว่า|muea phicharana chak lakthan thi mi kham athibai ni somhet somphon kwa|utter:accuracy
culture|phrase|现有资料尚不足以下结论|xiànyǒu zīliào shàng bùzú yǐ xià jiélùn|ข้อมูลที่มีอยู่ยังไม่เพียงพอให้สรุป|khomun thi mi yu yang mai phiangpho hai sarup|utter:accuracy
culture|phrase|有必要区分这两个概念|yǒu bìyào qūfēn zhè liǎng ge gàiniàn|จำเป็นต้องแยกแนวคิดสองอย่างนี้ออกจากกัน|champen tong yaek naeokhit song yang ni ok chak kan|utter:accuracy
culture|phrase|我们需要先界定讨论范围|wǒmen xūyào xiān jièdìng tǎolùn fànwéi|เราต้องกำหนดขอบเขตการหารือก่อน|rao tong kamnot khopkhet kan harue kon|utter:accuracy
culture|phrase|这只是一个初步判断|zhè zhǐshì yí ge chūbù pànduàn|นี่เป็นเพียงข้อประเมินเบื้องต้น|ni pen phiang kho pramoen bueangton|utter:accuracy
culture|phrase|目前不能排除另一种可能|mùqián bùnéng páichú lìng yì zhǒng kěnéng|ขณะนี้ยังตัดความเป็นไปได้อีกแบบหนึ่งทิ้งไม่ได้|khana ni yang tat khwam pen pai dai ik baep nueng thing mai dai|utter:accuracy
culture|phrase|这个说法缺乏事实依据|zhège shuōfǎ quēfá shìshí yījù|คำกล่าวนี้ขาดหลักฐานข้อเท็จจริง|kham klao ni khat lakthan khothetching|utter:accuracy
culture|phrase|这个例子不具代表性|zhège lìzi bú jù dàibiǎoxìng|ตัวอย่างนี้ไม่สามารถเป็นตัวแทนได้|tuayang ni mai samat pen tuathaen dai|utter:accuracy
culture|phrase|相关关系不等于因果关系|xiāngguān guānxì bù děngyú yīnguǒ guānxì|ความสัมพันธ์เชิงสหสัมพันธ์ไม่เท่ากับความสัมพันธ์เชิงเหตุและผล|khwam samphan choeng sahasamphan mai thao kap khwam samphan choeng het lae phon|utter:accuracy
culture|phrase|这项结论应当谨慎解读|zhè xiàng jiélùn yīngdāng jǐnshèn jiědú|ข้อสรุปนี้ควรตีความอย่างระมัดระวัง|kho sarup ni khuan tikhwam yang ramatrawang|utter:accuracy
culture|phrase|这些数据可能存在偏差|zhèxiē shùjù kěnéng cúnzài piānchā|ข้อมูลเหล่านี้อาจมีความเอนเอียง|khomun lao ni at mi khwam en-iang|utter:accuracy
culture|phrase|请说明这条信息的来源|qǐng shuōmíng zhè tiáo xìnxī de láiyuán|กรุณาระบุแหล่งที่มาของข้อมูลนี้|karuna rabu laeng thima khong khomun ni|utter:accuracy
culture|phrase|请具体定义这个概念|qǐng jùtǐ dìngyì zhège gàiniàn|กรุณาให้นิยามแนวคิดนี้อย่างเจาะจง|karuna hai niyam naeokhit ni yang chochong|utter:accuracy
culture|phrase|你的前提条件是什么|nǐ de qiántí tiáojiàn shì shénme|เงื่อนไขตั้งต้นของคุณคืออะไร|ngueankhai tangton khong khun khue arai|utter:accuracy
culture|phrase|这个推论是如何成立的|zhège tuīlùn shì rúhé chénglì de|ข้ออนุมานนี้ได้มาอย่างไร|kho anuman ni dai ma yangrai|utter:accuracy
culture|phrase|有没有支持相反结论的证据|yǒu méiyǒu zhīchí xiāngfǎn jiélùn de zhèngjù|มีหลักฐานที่สนับสนุนข้อสรุปตรงกันข้ามหรือไม่|mi lakthan thi sanapsanun kho sarup trongkan kham rue mai|utter:accuracy
culture|phrase|我们先核实基本事实|wǒmen xiān héshí jīběn shìshí|เราตรวจสอบข้อเท็จจริงพื้นฐานก่อน|rao truatsop khothetching phuenthan kon|utter:accuracy
culture|phrase|先把价值判断放在一边|xiān bǎ jiàzhí pànduàn fàng zài yìbiān|พักการตัดสินเชิงคุณค่าไว้ก่อน|phak kan tatsin choeng khunkha wai kon|utter:accuracy
culture|phrase|我们不妨换一个角度|wǒmen bùfáng huàn yí ge jiǎodù|เราลองเปลี่ยนมุมมองกันดู|rao long plian mum mong kan du|utter:accuracy
culture|phrase|这件事涉及多个层面|zhè jiàn shì shèjí duō ge céngmiàn|เรื่องนี้เกี่ยวข้องกับหลายมิติ|rueang ni kiaokhong kap lai miti|utter:accuracy
culture|phrase|短期效果和长期效果不同|duǎnqī xiàoguǒ hé chángqī xiàoguǒ bùtóng|ผลระยะสั้นกับผลระยะยาวแตกต่างกัน|phon raya san kap phon raya yao taektang kan|utter:accuracy
culture|phrase|个体经验不能代表整体|gètǐ jīngyàn bùnéng dàibiǎo zhěngtǐ|ประสบการณ์ของคนคนเดียวเป็นตัวแทนภาพรวมไม่ได้|prasopkan khong khon khon diao pen tuathaen phapruam mai dai|utter:accuracy
culture|phrase|需要听取受影响者的意见|xūyào tīngqǔ shòu yǐngxiǎngzhě de yìjiàn|จำเป็นต้องรับฟังความเห็นของผู้ได้รับผลกระทบ|champen tong rapfang khwam hen khong phu dai rap phonkathop|utter:accuracy
culture|phrase|不能忽略实际执行成本|bùnéng hūlüè shíjì zhíxíng chéngběn|มองข้ามต้นทุนในการปฏิบัติจริงไม่ได้|mongkham tonthun nai kan patibat ching mai dai|utter:accuracy
culture|phrase|政策目标和执行手段要匹配|zhèngcè mùbiāo hé zhíxíng shǒuduàn yào pǐpèi|เป้าหมายนโยบายกับวิธีดำเนินการต้องสอดคล้องกัน|paomai nayobai kap withi damnoenkan tong sotkhlong kan|utter:accuracy
culture|phrase|规则应当对所有人一视同仁|guīzé yīngdāng duì suǒyǒu rén yíshì tóngrén|กติกาควรใช้กับทุกคนอย่างเสมอหน้า|katika khuan chai kap thuk khon yang samoena|utter:accuracy
culture|phrase|程序本身也同样重要|chéngxù běnshēn yě tóngyàng zhòngyào|ตัวกระบวนการเองก็สำคัญเช่นกัน|tua krabuan kan eng ko samkhan chen kan|utter:accuracy
culture|phrase|提高透明度有助于建立信任|tígāo tòumíngdù yǒuzhù yú jiànlì xìnrèn|การเพิ่มความโปร่งใสช่วยสร้างความไว้วางใจ|kan phoem khwam prongsai chuai sang khwam waiwangchai|utter:accuracy
culture|phrase|权利同时伴随着责任|quánlì tóngshí bànsuízhe zérèn|สิทธิมาพร้อมกับความรับผิดชอบ|sitthi ma phrom kap khwam rapphitchop|utter:accuracy
culture|phrase|自由需要合理边界|zìyóu xūyào hélǐ biānjiè|เสรีภาพต้องมีขอบเขตที่สมเหตุสมผล|seriphap tong mi khopkhet thi somhet somphon|utter:accuracy
culture|phrase|尊重差异不等于放弃原则|zūnzhòng chāyì bù děngyú fàngqì yuánzé|การเคารพความต่างไม่ได้แปลว่าละทิ้งหลักการ|kan khaorop khwam tang mai dai plae wa lathing lakkan|utter:accuracy
culture|phrase|达成共识不代表完全一致|dáchéng gòngshí bù dàibiǎo wánquán yízhì|การได้ข้อเห็นพ้องไม่ได้หมายความว่าเหมือนกันทั้งหมด|kan dai kho henphong mai dai maikhwam wa muean kan thangmot|utter:accuracy
culture|phrase|作出妥协不等于认输|zuòchū tuǒxié bù děngyú rènshū|การประนีประนอมไม่ได้เท่ากับยอมแพ้|kan pranipranom mai dai thaokap yom phae|utter:accuracy
culture|phrase|批评应当针对问题本身|pīpíng yīngdāng zhēnduì wèntí běnshēn|คำวิจารณ์ควรมุ่งที่ตัวปัญหา|kham wichan khuan mung thi tua panha|utter:accuracy
culture|phrase|有效对话需要共同的事实基础|yǒuxiào duìhuà xūyào gòngtóng de shìshí jīchǔ|การสนทนาที่ได้ผลต้องมีฐานข้อเท็จจริงร่วมกัน|kan sonthana thi dai phon tong mi than khothetching ruam kan|utter:accuracy
culture|phrase|情绪可以理解，但不能代替证据|qíngxù kěyǐ lǐjiě, dàn bùnéng dàitì zhèngjù|ความรู้สึกเข้าใจได้ แต่ใช้แทนหลักฐานไม่ได้|khwam rusuek khaochai dai tae chai thaen lakthan mai dai|utter:accuracy
culture|phrase|先澄清我们的分歧在哪里|xiān chéngqīng wǒmen de fēnqí zài nǎli|มาชี้แจงก่อนว่าเราเห็นต่างกันตรงไหน|ma chichaeng kon wa rao hen tang kan trong nai|utter:accuracy
culture|phrase|这个风险最终由谁承担|zhège fēngxiǎn zuìzhōng yóu shuí chéngdān|ท้ายที่สุดใครเป็นผู้รับความเสี่ยงนี้|thai thisut khrai pen phu rap khwam siang ni|question:accuracy
culture|phrase|谁会从这项安排中受益|shuí huì cóng zhè xiàng ānpái zhōng shòuyì|ใครจะได้รับประโยชน์จากการจัดการนี้|khrai cha dai rap prayot chak kan chatkan ni|question:accuracy
culture|phrase|哪些人可能被遗漏|nǎxiē rén kěnéng bèi yílòu|มีใครบ้างที่อาจถูกมองข้าม|mi khrai bang thi at thuk mongkham|question:accuracy
culture|phrase|有没有成本更低的替代方案|yǒu méiyǒu chéngběn gèng dī de tìdài fāng'àn|มีทางเลือกอื่นที่ต้นทุนต่ำกว่านี้หรือไม่|mi thanglueak uen thi tonthun tam kwa ni rue mai|utter:accuracy
culture|phrase|我们该如何衡量实际效果|wǒmen gāi rúhé héngliáng shíjì xiàoguǒ|เราควรวัดผลที่เกิดขึ้นจริงอย่างไร|rao khuan wat phon thi koet khuen ching yangrai|utter:accuracy
culture|phrase|如果结果不理想该怎么办|rúguǒ jiéguǒ bù lǐxiǎng gāi zěnme bàn|ถ้าผลออกมาไม่ดีเท่าที่หวังควรทำอย่างไร|tha phon ok ma mai di thao thi wang khuan tham yangrai|question:accuracy
culture|phrase|项目应当设置明确的退出机制|xiàngmù yīngdāng shèzhì míngquè de tuìchū jīzhì|โครงการควรมีกลไกถอนตัวที่ชัดเจน|khrongkan khuan mi konkai thon tua thi chatchen|utter:accuracy
culture|phrase|这项决定可以接受复核吗|zhè xiàng juédìng kěyǐ jiēshòu fùhé ma|การตัดสินใจนี้เปิดให้ทบทวนได้หรือไม่|kan tatsinchai ni poet hai thopthuan dai rue mai|question:accuracy
culture|phrase|相关信息是否对所有人公开|xiāngguān xìnxī shìfǒu duì suǒyǒu rén gōngkāi|ข้อมูลที่เกี่ยวข้องเปิดเผยต่อทุกคนหรือไม่|khomun thi kiaokhong poetphoei to thuk khon rue mai|question:accuracy
culture|phrase|报告需要保留少数意见|bàogào xūyào bǎoliú shǎoshù yìjiàn|รายงานต้องเก็บความเห็นของฝ่ายส่วนน้อยไว้|raingan tong kep khwam hen khong fai suannoi wai|utter:accuracy
culture|phrase|让我们明确下一步行动|ràng wǒmen míngquè xià yí bù xíngdòng|เรามาระบุการลงมือทำขั้นต่อไปให้ชัดเจน|rao ma rabu kan longmue tham khan topai hai chatchen|utter:accuracy
culture|phrase|我们可以先在小范围内试行|wǒmen kěyǐ xiān zài xiǎo fànwéi nèi shìxíng|เราสามารถทดลองใช้ในวงจำกัดก่อนได้|rao samat thotlong chai nai wong chamkat kon dai|utter:accuracy
culture|phrase|最终结论有待进一步验证|zuìzhōng jiélùn yǒudài jìnyíbù yànzhèng|ข้อสรุปสุดท้ายยังต้องตรวจสอบเพิ่มเติม|kho sarup sutthai yang tong truatsop phoemtoem|utter:accuracy
  `);

  window.HUILAISHI_VOCAB_EXPANSION_L46 = [
    ...expand(L4, 4),
    ...expand(L5, 5),
    ...expand(L6, 6)
  ];
})();
