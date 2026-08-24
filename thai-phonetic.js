/* 会来事 V7 · 泰语中文近音辅助层
 *
 * 设计原则：
 * 1. 泰文与罗马音永远是主显示；中文近音只帮助中国初学者开口，不冒充准确发音。
 * 2. 常用语采用人工词典（含带调实用罗马音与声调提示）；其余内容依据现有 ro 字段生成低置信近音。
 * 3. RTGS 本身不记录声调和元音长短。若原记录没有调号，本文件会明确返回 toneCoverage: "none"，绝不猜调。
 * 4. 同一 API 覆盖 3000 词、3000 条例句、20 组“一句五说”和中文→泰语离线对话。
 */
(function () {
  "use strict";

  const VERSION = "thai-phonetic-v1.1-20260822";
  const LABEL_ZH = "中文近音 · 仅助记";
  const LABEL_TH = "เสียงใกล้เคียงภาษาจีน · ช่วยจำเท่านั้น";
  const DISCLAIMER_ZH = "中文近音会丢失泰语声调、长短音和部分辅音差别；请以泰文、带调罗马音和清晰音频为主，重要表达再向泰语母语者核对。";
  const DISCLAIMER_TH = "คำอ่านใกล้เคียงภาษาจีนไม่แทนวรรณยุกต์ ความยาวสระ หรือเสียงพยัญชนะไทย โปรดยึดตัวอักษรไทย คำอ่านมีวรรณยุกต์ และเสียงที่ชัดเจนเป็นหลัก และตรวจสอบสำนวนสำคัญกับเจ้าของภาษาอีกครั้ง";
  const NO_TONE_ZH = "原罗马音未标声调；请跟清晰音频并向泰语母语者核对，不要按汉字声调硬读。";
  const INCOMPLETE_TONE_ZH = "罗马音只有部分音节标出声调；未标部分不可按中平调推断，请跟清晰音频并等待母语复核。";
  const HARD_INVALID_EXAMPLE_ZH = /^(?:我想(?:给|介绍)|地址是|我需要(?:症状|价格)|这里很(?:快|咸)|他是我的(?:警察|女人|妈妈|姐姐|妹妹|妻子)|这是今天)[。！？.!?]*$/u;

  function stripExamplePunctuation(value) {
    return String(value || "").trim().replace(/[。！？.!?]+$/u, "").trim();
  }

  /*
   * This is deliberately a presentation gate, not a claim that the remaining
   * examples are linguistically approved. It only withholds examples that are
   * provably incomplete or that repeat the headword without a real sentence.
   */
  function classifyVocabularyExample(record) {
    const codes = [];
    const required = ["exZh", "exPy", "exTh", "exRo"];
    if (required.some(field => !String(record?.[field] || "").trim())) codes.push("fields-missing");
    if (
      stripExamplePunctuation(record?.exZh) === stripExamplePunctuation(record?.zh)
      || stripExamplePunctuation(record?.exTh) === stripExamplePunctuation(record?.th)
    ) codes.push("headword-only");
    if (HARD_INVALID_EXAMPLE_ZH.test(String(record?.exZh || "").trim())) codes.push("template-incomplete");
    const uniqueCodes = [...new Set(codes)];
    return {
      status: uniqueCodes.length ? "blocked-editorial-review" : "editorial-draft-native-review-pending",
      codes: uniqueCodes,
      nativeReviewed: false,
      reasonZh: uniqueCodes.length
        ? "例句未通过最低完整性门禁，已停止展示和跟读；等待编辑修订与母语教师终审。"
        : "例句为编辑草稿，仍待母语教师终审。",
      reasonTh: uniqueCodes.length
        ? "ตัวอย่างไม่ผ่านเกณฑ์ความสมบูรณ์ขั้นต่ำ จึงงดแสดงและงดฝึกพูดจนกว่าจะแก้ไขและให้เจ้าของภาษาตรวจ"
        : "ตัวอย่างเป็นฉบับร่างและยังรอเจ้าของภาษาตรวจ"
    };
  }

  const curated = (zhHint, romanTone, toneHintZh) => ({ zhHint, romanTone, toneHintZh });
  const CURATED = Object.freeze({
    "สวัสดี": curated("萨-瓦-迪", "sà-wàt-dii", "萨(低) · 瓦(低) · 迪(中平)"),
    "สวัสดีค่ะ": curated("萨-瓦-迪-卡", "sà-wàt-dii khâ", "萨(低) · 瓦(低) · 迪(中平) · 卡(降)"),
    "สวัสดีครับ": curated("萨-瓦-迪-卡普", "sà-wàt-dii khráp", "萨(低) · 瓦(低) · 迪(中平) · 卡普(高)"),
    "สวัสดีค่ะ รับอะไรดีคะ": curated("萨-瓦-迪-卡 · 拉普-阿莱-迪-卡", "sà-wàt-dii khâ · ráp à-rai dii khá", "先柔和问候；末尾卡读高调，表示提问"),
    "รับอะไรดีคะ": curated("拉普-阿莱-迪-卡", "ráp à-rai dii khá", "拉普(高) · 阿莱(低-平) · 迪(平) · 卡(高)"),
    "รอแป๊บหนึ่งนะ": curated("洛-拜普-能-纳", "rɔɔ pɛ́p nʉ̀ng ná", "洛(平) · 拜普(高) · 能(低) · 纳(高)"),
    "รบกวนขอน้ำเปล่าหนึ่งขวดได้ไหมครับ": curated("洛普-关 · 扣-南-布劳 · 能-库阿特 · 戴-买-卡普", "róp-kuan khɔ̌ɔ náam-plàao nʉ̀ng khùat dâi mái khráp", "按四个意群慢读；买、卡普读高调"),
    "ขอน้ำเปล่าหนึ่งขวดครับ": curated("扣-南-布劳 · 能-库阿特-卡普", "khɔ̌ɔ náam-plàao nʉ̀ng khùat khráp", "扣(升) · 南(高) · 布劳(低) · 能/库阿特(低) · 卡普(高)"),
    "เอาน้ำเปล่าขวดนึงนะ": curated("奥-南-布劳 · 库阿特-能-纳", "ao náam-plàao khùat nʉng ná", "奥(平) · 南(高) · 布劳/库阿特(低) · 纳(高)"),
    "เอาน้ำขวดนึงดิ": curated("奥-南 · 库阿特-能-迪", "ao náam khùat nʉng dì", "奥(平) · 南(高) · 库阿特/迪(低)"),
    "มึง เอาน้ำมาให้กูเดี๋ยวนี้สิวะ": curated("蒙 · 奥-南-玛-海-古 · 迪奥-尼-西-瓦", "mʉng · ao náam maa hâi kuu · dǐao níi sì wá", "分三段轻声听辨；不要把中文汉字声调套进泰语"),
    "มึงเอาน้ำมาให้กูเดี๋ยวนี้สิวะ": curated("蒙 · 奥-南-玛-海-古 · 迪奥-尼-西-瓦", "mʉng · ao náam maa hâi kuu · dǐao níi sì wá", "分三段轻声听辨；不要把中文汉字声调套进泰语"),
    "ช่วยพูดช้า ๆ หน่อยได้ไหมครับ": curated("处艾-普特-查-查 · 诺伊-戴-买-卡普", "chûai phûut châa-châa nɔ̀i dâi mái khráp", "处艾/普特读降调；买、卡普读高调"),
    "ห้องน้ำอยู่ไหนครับ": curated("洪-南 · 尤-奈-卡普", "hɔ̂ng-náam yùu-nǎi khráp", "洪(降) · 南(高) · 尤(低) · 奈(升) · 卡普(高)"),
    "ไปกินข้าวกันไหม": curated("拜-金-考-甘-买", "pai kin khâao kan mái", "考(降) · 买(高)，其余保持平稳"),
    "เดี๋ยวเจอกันนะ": curated("迪奥-哲-甘-纳", "dǐao jəə kan ná", "迪奥(升) · 纳(高)"),
    "เอาจริงดิ": curated("奥-京-迪", "ao jing dì", "奥/京平稳，迪读低调"),
    "มึงจะเอาไงวะ": curated("蒙-甲-奥-奈-瓦", "mʉng jà ao ngai wá", "甲读低调，瓦读高调；仅用于识别挑衅语气"),
    "ขอบคุณ": curated("扩-坤", "khɔ̀ɔp-khun", "扩(低) · 坤(中平)"),
    "ขอบคุณค่ะ": curated("扩-坤-卡", "khɔ̀ɔp-khun khâ", "扩(低) · 坤(中平) · 卡(降)"),
    "ขอบคุณครับ": curated("扩-坤-卡普", "khɔ̀ɔp-khun khráp", "扩(低) · 坤(中平) · 卡普(高)"),
    "ขอโทษ": curated("扣-托", "khɔ̌ɔ-thôot", "扣(升) · 托(降)"),
    "ขอโทษค่ะ": curated("扣-托-卡", "khɔ̌ɔ-thôot khâ", "扣(升) · 托(降) · 卡(降)"),
    "ขอโทษครับ": curated("扣-托-卡普", "khɔ̌ɔ-thôot khráp", "扣(升) · 托(降) · 卡普(高)"),
    "ไม่เป็นไร": curated("麦-奔-莱", "mâi-pen-rai", "麦(降) · 奔(中平) · 莱(中平)"),
    "ลาก่อน": curated("拉-滚", "laa-kɔ̀ɔn", "拉(中平) · 滚(低)"),
    "ใช่": curated("柴", "châi", "柴(降)"),
    "ไม่ใช่": curated("麦-柴", "mâi-châi", "麦(降) · 柴(降)"),
    "ได้": curated("戴", "dâi", "戴(降)"),
    "ไม่ได้": curated("麦-戴", "mâi-dâi", "麦(降) · 戴(降)"),
    "ได้ไหม": curated("戴-买", "dâi mái", "戴(降) · 买(高)"),
    "เท่าไหร่": curated("套-莱", "thâo-rài", "套(降) · 莱(低)"),
    "ห้องน้ำ": curated("洪-南", "hɔ̂ng-náam", "洪(降) · 南(高)"),
    "น้ำ": curated("南", "náam", "南(高)"),
    "อร่อย": curated("阿-罗伊", "à-rɔ̀i", "阿(低) · 罗伊(低)"),
    "เผ็ด": curated("派特", "phèt", "派特(低)"),
    "ไม่เผ็ด": curated("麦-派特", "mâi-phèt", "麦(降) · 派特(低)"),
    "ราคา": curated("拉-卡", "raa-khaa", "拉(中平) · 卡(中平)"),
    "แพง": curated("潘", "phɛɛng", "潘(中平)"),
    "ลดได้ไหม": curated("洛特-戴-买", "lót dâi mái", "洛特(高) · 戴(降) · 买(高)"),
    "คุณ": curated("坤", "khun", "坤(中平)"),
    "ฉัน": curated("禅", "chǎn", "禅(升)"),
    "ผม": curated("彭", "phǒm", "彭(升)"),
    "ครับ": curated("卡普", "khráp", "卡普(高)"),
    "ค่ะ": curated("卡", "khâ", "卡(降)"),
    "คะ": curated("卡", "khá", "卡(高)"),
    "ไป": curated("拜", "pai", "拜(中平)"),
    "มา": curated("玛", "maa", "玛(中平)"),
    "กิน": curated("金", "kin", "金(中平)"),
    "ดื่ม": curated("德姆", "dʉ̀ʉm", "德姆(低)"),
    "พูด": curated("普特", "phûut", "普特(降)"),
    "ฟัง": curated("方", "fang", "方(中平)"),
    "ช่วย": curated("处艾", "chûai", "处艾(降)"),
    "ขอ": curated("扣", "khɔ̌ɔ", "扣(升)"),
    "เร็ว": curated("雷奥", "reo", "雷奥(中平)"),
    "ช้า": curated("查", "cháa", "查(高)"),
    "ที่ไหน": curated("替-奈", "thîi-nǎi", "替(降) · 奈(升)"),
    "นี่": curated("尼", "nîi", "尼(降)"),
    "นั่น": curated("南", "nân", "南(降)"),
    "มี": curated("米", "mii", "米(中平)"),
    "ไม่มี": curated("麦-米", "mâi-mii", "麦(降) · 米(中平)"),
    "เอา": curated("奥", "ao", "奥(中平)"),
    "อยาก": curated("雅克", "yàak", "雅克(低)"),
    "ต้องการ": curated("东-干", "tɔ̂ng-kaan", "东(降) · 干(中平)"),
    "หนึ่ง": curated("能", "nʉ̀ng", "能(低)"),
    "สอง": curated("宋", "sɔ̌ɔng", "宋(升)"),
    "สาม": curated("萨姆", "sǎam", "萨姆(升)"),
    "สี่": curated("西", "sìi", "西(低)"),
    "ห้า": curated("哈", "hâa", "哈(降)"),
    "หก": curated("霍克", "hòk", "霍克(低)"),
    "เจ็ด": curated("杰特", "jèt", "杰特(低)"),
    "แปด": curated("拜特", "pɛ̀ɛt", "拜特(低)"),
    "เก้า": curated("告", "kâao", "告(降)"),
    "สิบ": curated("西普", "sìp", "西普(低)"),
    "ร้อย": curated("罗伊", "rɔ́ɔi", "罗伊(高)")
  });

  // 高频罗马音词典。命中此表只能说明“近似字形经过人工选择”，不代表已补齐声调。
  const SYLLABLE_ZH = Object.freeze({
    sawatdi: "萨瓦迪", sawatdii: "萨瓦迪", sa: "萨", wat: "瓦", di: "迪", dii: "迪",
    kha: "卡", khrap: "卡普", khrab: "卡普", khun: "坤", khop: "扩", kho: "扣", thot: "托",
    mai: "麦", pen: "奔", rai: "莱", la: "拉", kon: "滚", chai: "柴", dai: "戴", thao: "套",
    hong: "洪", nam: "南", aroi: "阿罗伊", phet: "派特", rakha: "拉卡", phaeng: "潘", lot: "洛特",
    chan: "禅", phom: "彭", pai: "拜", ma: "玛", kin: "金", duem: "德姆", phut: "普特", fang: "方",
    chuai: "处艾", reo: "雷奥", cha: "查", thi: "替", nai: "奈", ni: "尼", nan: "南", mi: "米",
    ao: "奥", yak: "雅克", tongkan: "东干", nueng: "能", song: "宋", sam: "萨姆", si: "西", ha: "哈",
    hok: "霍克", chet: "杰特", paet: "拜特", kao: "告", sip: "西普", roi: "罗伊", an: "安", kan: "甘",
    ue: "厄", ong: "翁", ai: "艾", i: "伊", pha: "帕", thang: "汤", at: "阿特", wan: "万", rot: "洛特",
    chao: "朝", om: "翁", fai: "发艾", nang: "囊", phu: "普", khrueang: "克良", ngan: "甘", to: "多",
    khao: "考", uek: "厄", kham: "坎", ngoen: "恩", ya: "雅", in: "因", truat: "端", khai: "凯",
    bat: "巴特", na: "纳", khong: "空", khon: "昆", doen: "德恩", phak: "帕克", tua: "图阿", rap: "拉普",
    tham: "探", bai: "拜", pra: "巴拉", bin: "宾", wela: "威拉", wi: "威", tang: "当", prakan: "巴拉干",
    tit: "迪特", yang: "扬", chut: "促", thai: "泰", chue: "车", ban: "班", poet: "伯特", ruea: "勒阿",
    wat: "瓦特", yai: "雅伊", et: "艾特", un: "温", phan: "潘", rian: "连", uan: "完", khuen: "肯",
    prathet: "巴拉泰特", en: "恩", thak: "塔克", rak: "拉克", khwam: "宽", phuean: "朋", krapao: "格拉包",
    non: "农", hai: "海", kai: "盖", khanat: "卡纳特", prachum: "巴拉春", muea: "莫阿", rup: "鲁普",
    doi: "多伊", phaet: "派特", rabop: "拉博普", khrong: "空", fan: "方", thong: "通", lueat: "勒阿特",
    phlae: "普莱", tom: "东", lom: "隆", chang: "昌", tu: "杜", kep: "给普", lok: "洛克", ran: "兰",
    borikan: "波里干", khiu: "丘", chae: "切", chaeng: "昌", ok: "奥克", kunchae: "坤切", klap: "格拉普",
    yu: "优", nom: "农", chot: "卓特", talat: "达拉", lek: "莱克", bori: "波里", puai: "布艾",
    phayaban: "帕雅班", phanak: "帕纳克", thin: "婷", thiao: "提奥", raingan: "莱安", choen: "陈",
    pati: "巴迪", khit: "克伊特", phop: "普欧普", akan: "阿干", ayu: "阿尤", marayat: "玛拉亚特",
    mue: "莫", nuea: "讷阿", rue: "勒", thoe: "特", loei: "勒伊", diao: "迪奥", ik: "伊克",
    sak: "萨克", khru: "库", rao: "劳", duai: "杜艾", loek: "勒克", set: "塞特", koen: "根",
    man: "曼", antarai: "安达莱", sue: "色", thuk: "图克", ro: "洛", eng: "恩", wa: "瓦", siwa: "西瓦",
    mueng: "蒙", mueang: "芒", ku: "古", kuu: "古", ngoo: "诺", sueak: "色阿克", hua: "华", hup: "胡普",
    phuak: "普瓦克", ying: "英", dek: "德克", khrop: "克罗普", khrua: "克鲁阿", pho: "颇", mae: "麦",
    phi: "披", sao: "萨奥", nong: "农", phan: "潘", raya: "拉雅", nak: "纳克", mo: "莫", tamruat: "丹-鲁阿特",
    khaek: "凯克", pratu: "巴拉-杜", thorasap: "托-拉-萨普", suea: "色阿", rong: "龙", tuen: "德恩", yuen: "云",
    supermaket: "苏-珀-玛-给特", internet: "因-特-内特", buffet: "布-费", homstay: "洪-斯代", email: "伊-梅尔", imel: "伊-梅尔",
    khlinik: "克里-尼克", lif: "利夫", shopping: "肖-拼", bonus: "波-纳斯", sapsorn: "萨普-颂", braen: "布兰",
    stroboeri: "斯卓-伯-里", dinsor: "丁-索", check: "切克", program: "普罗-格兰", profail: "普罗-法伊", websai: "韦布-赛",
    webkhaem: "韦布-凯姆", atm: "诶-提-艾姆", blok: "布洛克", fri: "弗里", aenkohol: "安-高-霍", xiao: "肖",
    dark: "达克", doisarn: "多伊-萨恩", banthad: "班-塔特", wetch: "韦特", gra: "格拉",
    phuut: "普特", thii: "替", khrang: "克朗", iik: "伊克", oeoe: "额", keng: "更", maak: "玛克", mang: "芒",
    khoo: "扣", phai: "派", roo: "洛", paep: "拜普",
    mak: "玛克", khuan: "宽", tong: "东", kap: "嘎普", karuna: "嘎-噜-纳", chak: "甲克", rueang: "勒昂",
    samkhan: "萨姆-坎", phicharana: "披-甲-拉-纳", damnoen: "丹-嫩", kamlang: "甘-朗", khue: "科", tam: "丹",
    khaochai: "考-柴", hen: "很", laeo: "莱奥", nae: "奈", khomun: "扩-蒙", chat: "甲特", phon: "彭", lae: "莱",
    ruam: "鲁阿姆", samphan: "萨姆-潘", phuea: "普厄", ru: "鲁", noi: "诺伊", kiaokap: "给奥-嘎普",
    sinkha: "辛-卡", yuenyan: "云-延", truatsop: "端-索普", klum: "格鲁姆", phonlap: "彭-拉普", wai: "外",
    ton: "东", sangkhom: "桑-空", athibai: "阿-提-拜", watthanatham: "瓦塔纳探", thueng: "腾", sai: "赛",
    suan: "算", naeo: "奈奥", trong: "德龙", rawang: "拉-旺", harue: "哈-勒", mosom: "莫-宋", ahan: "阿-韩",
    dan: "丹", long: "隆", ngai: "奈", lang: "朗", prakop: "巴拉-果普", nueaha: "讷阿-哈", siang: "西昂",
    khrongkan: "空-甘", baep: "拜普", kamnot: "甘-诺特", praden: "巴拉-登", raksa: "拉克-萨", patibat: "巴迪-巴特",
    sang: "桑", chamra: "占-拉", lukkha: "卢克-卡", thamngan: "探-甘", bukkhon: "布克-昆", tittam: "迪特-丹",
    phasa: "帕-萨", lai: "莱", sap: "萨普", choeng: "称", plianplaeng: "布连-布朗", plian: "布连",
    sangket: "桑-给特", panha: "班-哈", ching: "京", koet: "格特", phuchai: "普-柴", boi: "波伊",
    radap: "拉-达普", ekasan: "埃-嘎-散"
  });

  const ONSETS = Object.freeze({
    str: "斯特拉", khr: "克", phr: "普拉", khw: "夸", phl: "普拉", thr: "塔拉", chr: "差拉", khl: "克拉",
    kh: "卡", ph: "帕", th: "塔", ch: "差", ng: "昂", kr: "格拉", kl: "格拉", pr: "巴拉", pl: "巴拉", tr: "达拉", br: "布拉", bl: "布拉", dr: "德拉", kw: "瓜",
    b: "巴", c: "克", d: "达", f: "发", g: "嘎", h: "哈", j: "加", k: "嘎", l: "拉", m: "马", n: "纳", p: "巴", r: "拉", s: "萨", t: "达", v: "瓦", w: "瓦", x: "西", y: "雅", z: "扎", "": ""
  });
  const RHYMES = Object.freeze({
    aa: "啊", a: "阿", ai: "艾", ao: "奥", am: "安", an: "安", ang: "昂", at: "阿特", ap: "阿普", ak: "阿克",
    ii: "伊", i: "伊", ia: "呀", iao: "瑶", ian: "烟", iang: "央", in: "因", ing: "英", it: "伊特", ip: "伊普", iu: "优",
    uu: "乌", u: "乌", ua: "瓦", uak: "瓦克", uan: "万", uang: "汪", uat: "瓦特", uam: "万", uai: "歪",
    ue: "厄", uea: "厄阿", uek: "厄克", uen: "恩", ueng: "鞥", uet: "厄特", ui: "威",
    ee: "诶", e: "诶", ek: "艾克", em: "诶姆", en: "恩", eng: "鞥", et: "艾特", ep: "诶普", eo: "诶奥",
    oo: "欧", o: "欧", oi: "奥伊", on: "翁", ong: "翁", ot: "奥特", op: "奥普",
    ae: "艾", aek: "艾克", aem: "艾姆", aen: "安", aeng: "昂", aet: "艾特", oe: "厄", oen: "恩", oei: "诶", "": ""
  });
  const LETTER_ZH = Object.freeze({ a: "阿", b: "布", c: "克", d: "德", e: "诶", f: "夫", g: "格", h: "赫", i: "伊", j: "杰", k: "克", l: "勒", m: "姆", n: "恩", o: "欧", p: "普", q: "库", r: "勒", s: "斯", t: "特", u: "乌", v: "维", w: "乌", x: "克", y: "伊", z: "兹" });

  const TONES = Object.freeze({
    "\u0300": { code: "low", symbol: "↓", zh: "低" },
    "\u0302": { code: "falling", symbol: "↘", zh: "降" },
    "\u0301": { code: "high", symbol: "↑", zh: "高" },
    "\u030c": { code: "rising", symbol: "↗", zh: "升" }
  });

  function normalizeThai(value) {
    return String(value || "").trim().replace(/[.!?。！？]+$/u, "").replace(/\s+/gu, " ");
  }

  function romanTokens(value) {
    return String(value || "").match(/[\p{L}\p{M}ɯʉəɛɔ]+/gu) || [];
  }

  function stripRoman(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/gu, "")
      .toLowerCase()
      .replace(/ɯ/gu, "ue")
      .replace(/ʉ/gu, "ue")
      .replace(/ə/gu, "oe")
      .replace(/ɛ/gu, "ae")
      .replace(/ɔ/gu, "o")
      .replace(/[^a-z]/gu, "");
  }

  function toneOf(token, treatUnmarkedAsMid) {
    const decomposed = String(token || "").normalize("NFD");
    for (const mark of Object.keys(TONES)) if (decomposed.includes(mark)) return TONES[mark];
    return treatUnmarkedAsMid ? { code: "mid", symbol: "→", zh: "中平" } : null;
  }

  function buildToneHint(roman, forceToneScheme = false) {
    const tokens = romanTokens(roman);
    if (!tokens.length) return { coverage: "none", hintZh: NO_TONE_ZH, pattern: [], marked: 0, total: 0 };
    const markedTones = tokens.map(token => toneOf(token, false));
    const marked = markedTones.filter(Boolean).length;
    if (!forceToneScheme && marked === 0) return { coverage: "none", hintZh: NO_TONE_ZH, pattern: [], marked: 0, total: tokens.length };
    const pattern = tokens.map(token => {
      const tone = toneOf(token, forceToneScheme);
      return tone
        ? { syllable: stripRoman(token), tone: tone.code, symbol: tone.symbol, labelZh: tone.zh }
        : { syllable: stripRoman(token), tone: "unknown", symbol: "?", labelZh: "未标" };
    });
    const coverage = forceToneScheme || marked === tokens.length ? "full" : "partial";
    return {
      coverage,
      hintZh: coverage === "partial" ? INCOMPLETE_TONE_ZH : pattern.map(item => `${item.syllable}${item.symbol}${item.labelZh}`).join(" · "),
      pattern,
      marked: forceToneScheme ? tokens.length : marked,
      total: tokens.length
    };
  }

  const ROMAN_ONSETS = Object.keys(ONSETS).filter(Boolean).sort((a, b) => b.length - a.length);
  const ROMAN_VOWELS = ["ueai", "uea", "uai", "iao", "uang", "iang", "ue", "ua", "ia", "ae", "ai", "ao", "eo", "oe", "oi", "iu", "ui", "aa", "ee", "ii", "oo", "uu", "a", "e", "i", "o", "u"];
  const ROMAN_CODAS = ["ng", "m", "n", "p", "t", "k", "w", "y"];
  const ROMAN_CODA_ZH = Object.freeze({ ng: "昂", m: "姆", n: "恩", p: "普", t: "特", k: "克", w: "乌", y: "伊" });

  function romanOnsetAt(value, index) {
    for (const onset of ROMAN_ONSETS) {
      if (!value.startsWith(onset, index)) continue;
      const after = index + onset.length;
      if (ROMAN_VOWELS.some(vowel => value.startsWith(vowel, after))) return onset;
    }
    return ROMAN_VOWELS.some(vowel => value.startsWith(vowel, index)) ? "" : null;
  }

  function romanVowelAt(value, index) {
    return ROMAN_VOWELS.find(vowel => value.startsWith(vowel, index)) || null;
  }

  // Many source rows use compact RTGS such as `haichai` or `thorasap` without
  // syllable separators. Split those into pronounceable chunks before making
  // a Chinese memory aid; never fall back to spelling every Latin letter.
  function syllabifyRoman(value) {
    const plain = stripRoman(value);
    if (!plain) return [];
    const result = [];
    let cursor = 0;
    while (cursor < plain.length) {
      const onset = romanOnsetAt(plain, cursor);
      if (onset == null) return [plain];
      const vowelStart = cursor + onset.length;
      const vowel = romanVowelAt(plain, vowelStart);
      if (!vowel) return [plain];
      let end = vowelStart + vowel.length;
      if (end < plain.length && romanOnsetAt(plain, end) == null) {
        const coda = ROMAN_CODAS.find(candidate => {
          if (!plain.startsWith(candidate, end)) return false;
          const after = end + candidate.length;
          return after === plain.length || romanOnsetAt(plain, after) != null;
        });
        if (coda) end += coda.length;
      }
      if (end <= cursor) return [plain];
      result.push(plain.slice(cursor, end));
      cursor = end;
    }
    return result;
  }

  function approximateSyllable(plain) {
    if (SYLLABLE_ZH[plain]) return SYLLABLE_ZH[plain];
    const onset = ROMAN_ONSETS.find(candidate => plain.startsWith(candidate)) || "";
    const rhyme = plain.slice(onset.length);
    if (RHYMES[rhyme] != null) return `${ONSETS[onset]}${RHYMES[rhyme]}` || "阿";
    const vowel = romanVowelAt(rhyme, 0);
    const coda = vowel ? rhyme.slice(vowel.length) : "";
    if (vowel && (coda === "" || ROMAN_CODA_ZH[coda])) {
      return `${ONSETS[onset]}${RHYMES[vowel] || "阿"}${ROMAN_CODA_ZH[coda] || ""}` || "阿";
    }
    return "近音待核";
  }

  function fallbackToken(token) {
    const plain = stripRoman(token);
    if (!plain) return "近音待核";
    if (SYLLABLE_ZH[plain]) return SYLLABLE_ZH[plain];
    const syllables = syllabifyRoman(plain);
    const mapped = syllables.map(approximateSyllable);
    return mapped.every(item => item !== "近音待核") ? mapped.join("-") : "近音待核";
  }

  function make(thai, roman) {
    const thaiText = normalizeThai(thai);
    const sourceRoman = String(roman || "").trim();
    const exact = CURATED[thaiText];
    const workingRoman = exact?.romanTone || sourceRoman;
    const tokens = romanTokens(workingRoman);
    const tokenHints = tokens.map(token => {
      const key = stripRoman(token);
      return { roman: token, normalized: key, zh: SYLLABLE_ZH[key] || fallbackToken(token), dictionary: Boolean(SYLLABLE_ZH[key]) };
    });
    const tone = buildToneHint(workingRoman, Boolean(exact));
    const allDictionary = tokenHints.length > 0 && tokenHints.every(item => item.dictionary);
    const quality = exact ? "curated-core" : (allDictionary ? "dictionary-assisted" : "generated-approximate");
    const sourceType = exact ? "human-curated-mnemonic" : (allDictionary ? "dictionary-assisted-automatic" : "algorithmic-approximation");
    const zhHint = exact?.zhHint || tokenHints.map(item => item.zh).join("-") || "近音待核";
    return {
      version: VERSION,
      thai: String(thai || ""),
      roman: sourceRoman,
      romanTone: workingRoman,
      zhHint,
      toneHintZh: exact?.toneHintZh || tone.hintZh,
      tonePattern: tone.pattern,
      toneCoverage: tone.coverage,
      toneMarkedSyllables: tone.marked,
      toneSyllables: tone.total,
      quality,
      sourceType,
      reviewed: false,
      editorialReviewed: quality === "curated-core",
      nativeReviewed: false,
      nativeReviewStatus: "pending",
      reviewScope: quality === "curated-core" ? "editorial-mnemonic-only" : "automatic-unreviewed",
      commercialStandardApproved: false,
      primary: "thai-and-tone-roman",
      labelZh: LABEL_ZH,
      labelTh: LABEL_TH,
      disclaimerZh: DISCLAIMER_ZH,
      disclaimerTh: DISCLAIMER_TH
    };
  }

  function enrichRecord(record, thaiKey = "th", romanKey = "ro", outputKey = "thReading") {
    if (!record || typeof record !== "object" || !/[\u0e00-\u0e7f]/u.test(String(record[thaiKey] || ""))) return record;
    const reading = make(record[thaiKey], record[romanKey]);
    record[outputKey] = reading;
    record[`${outputKey}ZhHint`] = reading.zhHint;
    record[`${outputKey}ToneZh`] = reading.toneHintZh;
    if (!record.contentReviewStatus) record.contentReviewStatus = "native-review-pending";
    return record;
  }

  function wordSources() {
    return [
      ...(window.HUILAISHI_VOCAB_L12 || []),
      ...(window.HUILAISHI_VOCAB_L34 || []),
      ...(window.HUILAISHI_VOCAB_L56 || []),
      ...(window.HUILAISHI_VOCAB_EXPANSION_L13 || []),
      ...(window.HUILAISHI_VOCAB_EXPANSION_L46 || [])
    ];
  }

  function attachRegisterMeta(option) {
    const grade = option?.grade || option?.code || (Number.isInteger(option?.level) ? `S${option.level}` : "");
    const level = window.HUILAISHI_REGISTER_LEVELS?.[grade];
    if (!level) return option;
    const registerOverride = option.registerOverride || {};
    const hasOverride = (key) => Object.prototype.hasOwnProperty.call(registerOverride, key);
    option.grade = grade;
    option.isRisk = hasOverride("isRisk") ? registerOverride.isRisk : grade === "S1" || grade === "S2";
    // Product mode cards already use `risk` for their localized display label
    // (for example “放心说”). Preserve that copy while keeping boolean risk
    // metadata on conversation/register records that do not define a label.
    if (hasOverride("risk")) option.risk = registerOverride.risk;
    else if (typeof option.risk !== "string") option.risk = option.isRisk;
    option.riskLevel = registerOverride.riskLevel || level.risk;
    option.outputAllowed = hasOverride("outputAllowed") ? registerOverride.outputAllowed : level.outputAllowed;
    if (hasOverride("recommended")) option.recommended = registerOverride.recommended;
    else if (typeof option.recommended !== "boolean") delete option.recommended;
    option.followMode = registerOverride.followMode || level.followMode;
    option.labelZh = registerOverride.contextLabelZh || level.labelZh;
    option.labelTh = registerOverride.contextLabelTh || level.labelTh;
    option.boundaryZh = level.boundaryZh;
    option.boundaryTh = level.boundaryTh;
    option.delivery = level.delivery || null;
    option.warningZh = hasOverride("warningZh") ? registerOverride.warningZh : (level.outputAllowed ? "" : (grade === "S1" ? "极高冒犯风险：成年角色反差音仅用于识别，不是标准发音示范；禁止跟读或对真人使用。" : "高冒犯风险：仅限引导的边界演练，并同步学习 S4 降级句。"));
    option.warningTh = hasOverride("warningTh") ? registerOverride.warningTh : (level.outputAllowed ? "" : (grade === "S1" ? "เสี่ยงลบหลู่อย่างรุนแรง เสียงตัวละครผู้ใหญ่มีไว้เพื่อแยกแยะและไม่ใช่ต้นแบบการออกเสียง ห้ามพูดตามหรือใช้กับคนจริง" : "เสี่ยงลบหลู่ ฝึกพูดได้เฉพาะแบบฝึกตั้งขอบเขต และต้องเรียนประโยค S4 ควบคู่กัน"));
    if (registerOverride.goalPriority) option.goalPriority = registerOverride.goalPriority;
    if (registerOverride.contextLabelZh) option.contextLabelZh = registerOverride.contextLabelZh;
    if (registerOverride.contextLabelTh) option.contextLabelTh = registerOverride.contextLabelTh;
    return option;
  }

  function walkThaiConversation(value, seen = new WeakSet()) {
    if (!value || typeof value !== "object" || seen.has(value)) return 0;
    seen.add(value);
    let count = 0;
    if (/[\u0e00-\u0e7f]/u.test(String(value.target || "")) && String(value.roman || "").trim()) {
      value.thReading = make(value.target, value.roman);
      count += 1;
    }
    attachRegisterMeta(value);
    for (const child of Object.values(value)) count += walkThaiConversation(child, seen);
    return count;
  }

  function enrichProduct(product) {
    if (!product || typeof product !== "object") return { thaiLines: 0, registerOptions: 0 };
    let thaiLines = 0;
    let registerOptions = 0;
    for (const direction of Object.values(product)) {
      for (const mode of direction?.modes || []) {
        attachRegisterMeta(mode);
        registerOptions += 1;
        if (/[\u0e00-\u0e7f]/u.test(String(mode.target || ""))) {
          mode.thReading = make(mode.target, mode.roman);
          thaiLines += 1;
        }
      }
      for (const phrase of direction?.phrases || []) {
        attachRegisterMeta(phrase);
        registerOptions += 1;
        if (/[\u0e00-\u0e7f]/u.test(String(phrase.target || ""))) {
          phrase.thReading = make(phrase.target, phrase.roman);
          thaiLines += 1;
        }
      }
    }
    return { thaiLines, registerOptions };
  }

  function enrichAll() {
    const words = wordSources();
    for (const word of words) {
      enrichRecord(word, "th", "ro", "thReading");
      enrichRecord(word, "exTh", "exRo", "exThReading");
      const exampleAssessment = classifyVocabularyExample(word);
      word.exampleDisplayStatus = exampleAssessment.status;
      word.exampleQualityIssues = exampleAssessment.codes;
      word.exampleReviewStatus = "native-review-pending";
      word.exampleQualityReasonZh = exampleAssessment.reasonZh;
      word.exampleQualityReasonTh = exampleAssessment.reasonTh;
    }
    const variants = (window.HUILAISHI_REGISTER_PACK || []).flatMap(pack => pack.variants || []);
    for (const variant of variants) {
      enrichRecord(variant, "th", "ro", "thReading");
      for (const form of Object.values(variant.speakerForms || {})) enrichRecord(form, "th", "ro", "thReading");
      attachRegisterMeta(variant);
    }
    const offlineThaiLines = walkThaiConversation(window.OFFLINE_APP_CONTENT || {});
    return {
      words: words.length,
      wordReadings: words.filter(word => word.thReading).length,
      exampleReadings: words.filter(word => word.exThReading).length,
      registerReadings: variants.filter(variant => variant.thReading).length,
      offlineThaiLines
    };
  }

  const API = {
    version: VERSION,
    labelZh: LABEL_ZH,
    labelTh: LABEL_TH,
    disclaimerZh: DISCLAIMER_ZH,
    disclaimerTh: DISCLAIMER_TH,
    reviewPolicy: Object.freeze({
      automaticChecksAreNativeApproval: false,
      nativeReviewStatus: "pending",
      commercialStandardApproved: false
    }),
    curatedCount: Object.keys(CURATED).length,
    classifyVocabularyExample,
    make,
    enrichRecord,
    enrichProduct,
    enrichAll,
    attachRegisterMeta
  };
  window.HUILAISHI_THAI_PHONETIC = API;
  API.stats = enrichAll();
})();
