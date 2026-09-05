(function () {
  "use strict";

  const GRADES = ["S5", "S4", "S3", "S2", "S1"];
  const REGISTER_GAMES = new Set(["tone", "polish", "grade-lock", "scene-listen", "register-shift"]);
  const MONSTER_TURN_MS = 10000;
  const MONSTER_PLAYER_BASE_HP = 100;
  const MONSTER_BURST_EVERY = 3;
  const MONSTER_BURST_BASE_DAMAGE = 10;
  const MONSTER_COMBO_CAP = 8;
  const MONSTER_COMBO_STEP = .08;
  const MONSTER_POWER_STEP = .1;
  const MONSTER_GUARD_HP_STEP = 12;
  const MONSTER_TEMPO_STEP_MS = 500;
  const MONSTER_INPUT_GRACE_MS = 650;
  const MONSTER_CHAPTER_COUNT = 6;
  const MONSTERS_PER_CHAPTER = 6;
  const MONSTER_ARENA_ART = "./assets/game/battle-arena-campus-v2.webp";
  const CAMPUS_COURTYARD_ART = "./assets/game/campus-courtyard-v114.webp";
  const MONSTER_THAI_STRIKE_CUTIN = "./assets/game/voice-hero-thai-action-v3-strike.webp";
  const MONSTER_COLLAGE_VFX = Object.freeze({
    windup: "./assets/game/combat-collage-vfx-v1-windup.webp",
    contact: "./assets/game/combat-collage-vfx-v1-contact.webp",
    critical: "./assets/game/combat-collage-vfx-v1-critical.webp",
    recover: "./assets/game/combat-collage-vfx-v1-recover.webp"
  });
  const DEFAULT_MONSTER_HERO_ID = "chinese";
  const ORIENTATION_COPY = Object.freeze({
    zh: Object.freeze({ title: "横过来，战场更开阔", body: "课程保持竖屏；小游戏横屏时角色、题目和招式会同时看清。", dismiss: "继续竖屏", label: "旋转手机进入横屏游戏" }),
    th: Object.freeze({ title: "หมุนจอแนวนอน แล้วสนามจะกว้างขึ้น", body: "บทเรียนยังใช้แนวตั้ง ส่วนเกมแนวนอนจะแสดงตัวละคร โจทย์ และท่าโจมตีพร้อมกัน", dismiss: "เล่นแนวตั้งต่อ", label: "หมุนโทรศัพท์เพื่อเล่นแนวนอน" })
  });
  const MONSTER_STYLE_ORDER = Object.freeze(["rush", "steady", "guard"]);
  const MONSTER_STYLES = Object.freeze({
    rush: Object.freeze({ icon: "⚡", timeDelta: -2500, damageMultiplier: 1.45, incomingMultiplier: 1.35 }),
    steady: Object.freeze({ icon: "◆", timeDelta: 0, damageMultiplier: 1, incomingMultiplier: 1 }),
    guard: Object.freeze({ icon: "⬟", timeDelta: 1500, damageMultiplier: .8, incomingMultiplier: .5 })
  });
  const MONSTER_HERO_CONFIGS = Object.freeze([
    Object.freeze({ id: "chinese", art: "./assets/game/hero-chinese-v116-idle.webp", frames: Object.freeze({ idle: "./assets/game/hero-chinese-v116-idle.webp", run: "./assets/game/hero-chinese-v116-run.webp", windup: "./assets/game/hero-chinese-v116-windup.webp", strike: "./assets/game/hero-chinese-v116-strike.webp", recover: "./assets/game/hero-chinese-v116-recover.webp", hit: "./assets/game/hero-chinese-v116-hit.webp", dodge: "./assets/game/hero-chinese-v116-dodge.webp", victory: "./assets/game/hero-chinese-v116-victory.webp" }), accent: "#527589", damageMultiplier: 1, incomingMultiplier: 1, turnBonusMs: 500 }),
    Object.freeze({ id: "thai", art: "./assets/game/hero-thai-v116-idle.webp", frames: Object.freeze({ idle: "./assets/game/hero-thai-v116-idle.webp", run: "./assets/game/hero-thai-v116-run.webp", windup: "./assets/game/hero-thai-v116-windup.webp", strike: "./assets/game/hero-thai-v116-strike.webp", recover: "./assets/game/hero-thai-v116-recover.webp", hit: "./assets/game/hero-thai-v116-hit.webp", dodge: "./assets/game/hero-thai-v116-dodge.webp", victory: "./assets/game/hero-thai-v116-victory.webp" }), accent: "#b96351", damageMultiplier: 1, incomingMultiplier: 1, turnBonusMs: 500 })
  ]);
  const BINGO_LINES = Object.freeze([
    Object.freeze([0, 1, 2]), Object.freeze([3, 4, 5]), Object.freeze([6, 7, 8]),
    Object.freeze([0, 3, 6]), Object.freeze([1, 4, 7]), Object.freeze([2, 5, 8]),
    Object.freeze([0, 4, 8]), Object.freeze([2, 4, 6])
  ]);
  const MONSTER_CONFIGS = Object.freeze([
    Object.freeze({ id: "wok-crab", chapter: 1, motion: "skitter", zh: "锅铲蟹", th: "ปูกระทะคำศัพท์", hp: 68, art: "./assets/game/monster-wok-crab-action-v2-idle.webp", frames: Object.freeze({ idle: "./assets/game/monster-wok-crab-action-v2-idle.webp", windup: "./assets/game/monster-wok-crab-action-v2-windup.webp", strike: "./assets/game/monster-wok-crab-action-v2-strike.webp", hit: "./assets/game/monster-wok-crab-action-v2-hit.webp" }), color: "#9b684d", accent: "#e0a85f", scene: "#587479", ground: "#26383a", trait: "warmup", traitZh: "热锅：节奏稳定", traitTh: "กระทะร้อน: จังหวะคงที่", intentZh: "锅盖格挡 · 失误 -10 HP", intentTh: "ตั้งฝาหม้อรับ · พลาด -10 HP", counterDamage: 10, timeoutDamage: 12 }),
    Object.freeze({ id: "tuk-gecko", chapter: 1, motion: "spring", zh: "嘟嘟壁虎", th: "จิ้งจกตุ๊กตุ๊ก", hp: 74, art: "./assets/game/monster-tuk-gecko-action-v100-idle.webp", frames: Object.freeze({ idle: "./assets/game/monster-tuk-gecko-action-v100-idle.webp", windup: "./assets/game/monster-tuk-gecko-action-v100-windup.webp", strike: "./assets/game/monster-tuk-gecko-action-v100-strike.webp", hit: "./assets/game/monster-tuk-gecko-action-v100-hit.webp" }), color: "#526f89", accent: "#d98359", scene: "#506d74", ground: "#253438", trait: "haste", traitZh: "抢道：倒计时稍短", traitTh: "แซงทาง: เวลาสั้นลงเล็กน้อย", intentZh: "嘟嘟抢道 · 9.5 秒内回答", intentTh: "ตุ๊กตุ๊กแซงทาง · ตอบใน 9.5 วิ", turnMs: 9500, counterDamage: 10, timeoutDamage: 13 }),
    Object.freeze({ id: "umbrella-hornbill", chapter: 1, motion: "wing", zh: "伞翼犀鸟", th: "นกเงือกร่ม", hp: 80, art: "./assets/game/monster-umbrella-hornbill-action-v100-idle.webp", frames: Object.freeze({ idle: "./assets/game/monster-umbrella-hornbill-action-v100-idle.webp", windup: "./assets/game/monster-umbrella-hornbill-action-v100-windup.webp", strike: "./assets/game/monster-umbrella-hornbill-action-v100-strike.webp", hit: "./assets/game/monster-umbrella-hornbill-action-v100-hit.webp" }), color: "#566d76", accent: "#d5a13d", scene: "#52737a", ground: "#223337", trait: "shield", traitZh: "伞翼：先破 12 点护盾", traitTh: "ปีกร่ม: ทำลายโล่ 12 แต้มก่อน", intentZh: "撑伞盘旋 · 先破盾再伤本体", intentTh: "กางร่มวน · ทำลายโล่ก่อน", shield: 12, counterDamage: 11, timeoutDamage: 14 }),
    Object.freeze({ id: "backpack-buffalo", chapter: 1, motion: "heavy", zh: "书包水牛", th: "ควายกระเป๋า", hp: 86, art: "./assets/game/monster-backpack-buffalo-action-v100-idle.webp", frames: Object.freeze({ idle: "./assets/game/monster-backpack-buffalo-action-v100-idle.webp", windup: "./assets/game/monster-backpack-buffalo-action-v100-windup.webp", strike: "./assets/game/monster-backpack-buffalo-action-v100-strike.webp", hit: "./assets/game/monster-backpack-buffalo-action-v100-hit.webp" }), color: "#596778", accent: "#b78b58", scene: "#4d696e", ground: "#202f32", trait: "regen", traitZh: "补课：失误时恢复 4 生命", traitTh: "เรียนเสริม: ฟื้น 4 พลังเมื่อคุณพลาด", intentZh: "书包顶撞 · 失误反击并回血", intentTh: "พุ่งชนด้วยกระเป๋า · สวนกลับและฟื้นพลัง", regen: 4, counterDamage: 11, timeoutDamage: 15 }),
    Object.freeze({ id: "chalk-tokay", chapter: 1, motion: "spring", zh: "粉笔大壁虎", th: "ตุ๊กแกชอล์ก", hp: 94, art: "./assets/game/monster-chalk-tokay-elite-v103.webp", color: "#536f7e", accent: "#d8845d", scene: "#536f73", ground: "#243438", trait: "elite", traitZh: "精英技能：粉尘甲", traitTh: "สกิลชั้นยอด: เกราะฝุ่นชอล์ก", intentZh: "第 3 回合披甲 · 用速攻破甲", intentTh: "สร้างเกราะทุกเทิร์นที่ 3 · ใช้บุกเร็วเจาะเกราะ", counterDamage: 12, timeoutDamage: 16, elite: true, skill: Object.freeze({ id: "chalk-veil", every: 3, counterStyle: "rush", strongDamage: 1.28, weakDamage: .58, safeCounter: .86, riskCounter: 1.18, strongTimeDelta: 400, weakTimeDelta: -400, nameZh: "粉尘甲", nameTh: "เกราะฝุ่นชอล์ก", hintZh: "第 3 回合披上粉尘甲；速攻能破甲，其他招式伤害会被压低。", hintTh: "ทุกเทิร์นที่ 3 จะสร้างเกราะฝุ่น ใช้บุกเร็วเพื่อเจาะเกราะ มิฉะนั้นดาเมจจะลดลง" }) }),
    Object.freeze({ id: "lantern", chapter: 1, motion: "spring", zh: "纸灯兽", th: "อสูรโคมกระดาษ", hp: 100, art: "./assets/game/monster-paper-lantern-action-v100-idle.webp", frames: Object.freeze({ idle: "./assets/game/monster-paper-lantern-action-v100-idle.webp", windup: "./assets/game/monster-paper-lantern-action-v100-windup.webp", strike: "./assets/game/monster-paper-lantern-action-v100-strike.webp", hit: "./assets/game/monster-paper-lantern-action-v100-hit.webp" }), color: "#6f7661", accent: "#c98967", scene: "#557477", ground: "#253437", trait: "rhythm", traitZh: "灯拍：每 3 题出现破绽", traitTh: "จังหวะโคม: ทุก 3 ข้อเปิดช่องโหว่", intentZh: "灯影冲撞 · 第 3 题追加伤害", intentTh: "พุ่งชนเงาโคม · ข้อที่ 3 ดาเมจเพิ่ม", rhythmEvery: 3, rhythmBonus: 8, enrageAt: .5, enrageTurnMs: 8500, counterDamage: 12, timeoutDamage: 15, boss: true }),

    Object.freeze({ id: "laundry-frog", chapter: 2, motion: "spring", zh: "泡泡洗衣蛙", th: "กบซักผ้า", hp: 88, art: "./assets/game/monster-laundry-frog-v1.webp", color: "#557b78", accent: "#d4b56c", scene: "#55777a", ground: "#263638", trait: "regen", traitZh: "泡泡回洗：失误时恢复 5 生命", traitTh: "ฟองซักซ้ำ: ฟื้น 5 พลังเมื่อคุณพลาด", intentZh: "泡泡反弹 · 失误反击并回血", intentTh: "ฟองสะท้อน · สวนกลับและฟื้นพลัง", regen: 5, counterDamage: 11, timeoutDamage: 14 }),
    Object.freeze({ id: "alarm-rooster", chapter: 2, motion: "wing", zh: "闹钟公鸡", th: "ไก่นาฬิกาปลุก", hp: 95, art: "./assets/game/monster-alarm-rooster-v1.webp", color: "#9a5e50", accent: "#d39a43", scene: "#645f67", ground: "#292f32", trait: "haste", traitZh: "晨铃：倒计时缩短", traitTh: "กริ่งเช้า: เวลาสั้นลง", intentZh: "晨铃催答 · 9 秒内回答", intentTh: "กริ่งเช้าเร่งตอบ · ตอบใน 9 วิ", turnMs: 9000, counterDamage: 12, timeoutDamage: 15 }),
    Object.freeze({ id: "market-elephant", chapter: 2, motion: "heavy", zh: "早市小象", th: "ช้างตลาด", hp: 104, art: "./assets/game/monster-market-elephant-v1.webp", color: "#637684", accent: "#c69855", scene: "#5d7272", ground: "#273537", trait: "shield", traitZh: "菜篮甲：先破 18 点护盾", traitTh: "เกราะตะกร้า: ทำลายโล่ 18 แต้มก่อน", intentZh: "菜篮防线 · 先破盾再伤本体", intentTh: "แนวตะกร้า · ทำลายโล่ก่อน", shield: 18, counterDamage: 12, timeoutDamage: 16 }),
    Object.freeze({ id: "bus-lizard", chapter: 2, motion: "serpent", zh: "巴士蜥蜴", th: "กิ้งก่ารถเมล์", hp: 110, art: "./assets/game/monster-bus-lizard-v1.webp", color: "#586f65", accent: "#d39251", scene: "#4e6c70", ground: "#233234", trait: "rhythm", traitZh: "报站：每 3 题追加伤害", traitTh: "ประกาศป้าย: ทุก 3 ข้อได้ดาเมจเพิ่ม", intentZh: "甩尾报站 · 第 3 题出现破绽", intentTh: "สะบัดหางประกาศป้าย · ข้อที่ 3 เปิดช่อง", rhythmEvery: 3, rhythmBonus: 10, counterDamage: 13, timeoutDamage: 16 }),
    Object.freeze({ id: "mango-blob", chapter: 2, motion: "spring", zh: "芒果糯米团", th: "ก้อนข้าวเหนียวมะม่วง", hp: 118, art: "./assets/game/monster-mango-blob-elite-v103.webp", color: "#66755d", accent: "#e0a442", scene: "#5b706a", ground: "#263432", trait: "elite", traitZh: "精英技能：糯米陷阱", traitTh: "สกิลชั้นยอด: กับดักข้าวเหนียว", intentZh: "第 3 回合黏住节奏 · 用守势卸力", intentTh: "วางกับดักทุกเทิร์นที่ 3 · ใช้ตั้งรับลดแรงดึง", counterDamage: 14, timeoutDamage: 18, elite: true, skill: Object.freeze({ id: "sticky-trap", every: 3, counterStyle: "guard", strongDamage: 1.22, weakDamage: .7, safeCounter: .72, riskCounter: 1.38, strongTimeDelta: 700, weakTimeDelta: -900, nameZh: "糯米陷阱", nameTh: "กับดักข้าวเหนียว", hintZh: "第 3 回合会黏住出招节奏；守势可卸力，硬冲会缩短时间并加重反击。", hintTh: "ทุกเทิร์นที่ 3 จะตรึงจังหวะ ตั้งรับช่วยลดแรงดึง แต่ฝืนบุกจะเสียเวลาและโดนสวนแรงขึ้น" }) }),
    Object.freeze({ id: "lotus", chapter: 2, motion: "float", zh: "莲火兽", th: "อสูรเพลิงบัว", hp: 125, art: "./assets/game/monster-lotus-flame-v3.webp", color: "#a85f5c", accent: "#caa35f", scene: "#755f5b", ground: "#2e302d", trait: "regen", traitZh: "莲火回春：失误时恢复 8 生命", traitTh: "บัวไฟฟื้นตัว: ฟื้น 8 พลังเมื่อคุณพลาด", intentZh: "莲火反击 · 失误反击并自愈", intentTh: "บัวไฟสวนกลับ · สวนกลับและฟื้นพลัง", regen: 8, counterDamage: 13, timeoutDamage: 17, boss: true }),

    Object.freeze({ id: "passport-fox", chapter: 3, motion: "runner", zh: "护照狐", th: "จิ้งจอกพาสปอร์ต", hp: 108, art: "./assets/game/monster-passport-fox-v1.webp", color: "#8a674d", accent: "#c07a55", scene: "#506e73", ground: "#253438", trait: "shield", traitZh: "签证页：先破 14 点护盾", traitTh: "หน้าวีซ่า: ทำลายโล่ 14 แต้มก่อน", intentZh: "盖章闪避 · 先破护照盾", intentTh: "หลบพร้อมประทับตรา · ทำลายโล่พาสปอร์ตก่อน", shield: 14, counterDamage: 13, timeoutDamage: 17 }),
    Object.freeze({ id: "ferry-otter", chapter: 3, motion: "float", zh: "渡船水獭", th: "นากเรือข้ามฟาก", hp: 118, art: "./assets/game/monster-ferry-otter-v1.webp", color: "#5a7180", accent: "#b98554", scene: "#4b7078", ground: "#203439", trait: "haste", traitZh: "赶船：节拍忽快", traitTh: "รีบขึ้นเรือ: จังหวะเร็วขึ้น", intentZh: "船桨横扫 · 9 秒内回答", intentTh: "พายกวาด · ตอบใน 9 วิ", turnMs: 9000, counterDamage: 13, timeoutDamage: 17 }),
    Object.freeze({ id: "karaoke-myna", chapter: 3, motion: "wing", zh: "卡拉 OK 八哥", th: "นกเอี้ยงคาราโอเกะ", hp: 126, art: "./assets/game/monster-karaoke-myna-v1.webp", color: "#5e6478", accent: "#c56d58", scene: "#536676", ground: "#222f37", trait: "resonance", traitZh: "和声：每 2 题触发回响", traitTh: "ประสานเสียง: ก้องทุก 2 ข้อ", intentZh: "麦克风回响 · 命中加伤 / 失误追击", intentTh: "ไมค์ก้อง · ตอบถูกเพิ่มดาเมจ / พลาดโดนซ้ำ", resonanceEvery: 2, resonanceBonus: 6, resonanceDamage: 4, counterDamage: 13, timeoutDamage: 17 }),
    Object.freeze({ id: "station-macaque", chapter: 3, motion: "runner", zh: "站台猕猴", th: "ลิงแสมสถานี", hp: 136, art: "./assets/game/monster-station-macaque-v1.webp", color: "#6c645a", accent: "#bd7556", scene: "#576a70", ground: "#253337", trait: "enrage", traitZh: "末班车：半血后加速", traitTh: "ขบวนสุดท้าย: ครึ่งพลังแล้วเร็วขึ้น", intentZh: "信号灯突进 · 半血后倒计时缩短", intentTh: "พุ่งตามสัญญาณ · ครึ่งพลังแล้วเวลาสั้นลง", enrageAt: .5, enrageTurnMs: 8000, counterDamage: 14, timeoutDamage: 18 }),
    Object.freeze({ id: "ticket-kingfisher", chapter: 3, motion: "wing", zh: "车票翠鸟", th: "นกกะเต็นตั๋วรถ", hp: 143, art: "./assets/game/monster-ticket-kingfisher-elite-v103.webp", color: "#4f7188", accent: "#d47c4f", scene: "#506b75", ground: "#213238", trait: "elite", traitZh: "精英技能：检票闪避", traitTh: "สกิลชั้นยอด: พุ่งหลบตรวจตั๋ว", intentZh: "第 3 回合闪避速攻 · 用稳击截停", intentTh: "หลบการบุกเร็วทุกเทิร์นที่ 3 · ใช้บุกมั่นคงตัดทาง", counterDamage: 15, timeoutDamage: 19, elite: true, skill: Object.freeze({ id: "ticket-dash", every: 3, counterStyle: "steady", strongDamage: 1.25, weakDamage: .5, safeCounter: .84, riskCounter: 1.25, strongTimeDelta: 300, weakTimeDelta: -500, nameZh: "检票闪避", nameTh: "พุ่งหลบตรวจตั๋ว", hintZh: "第 3 回合会闪开速攻；稳击能预判路线，截停后获得额外伤害。", hintTh: "ทุกเทิร์นที่ 3 จะหลบการบุกเร็ว ใช้บุกมั่นคงเพื่ออ่านทางและหยุดการพุ่ง" }) }),
    Object.freeze({ id: "kite-naga", chapter: 3, motion: "serpent", zh: "风筝娜迦", th: "นาคว่าวสายลม", hp: 150, art: "./assets/game/monster-kite-naga-v4.webp", color: "#477f80", accent: "#c99f4c", scene: "#456d72", ground: "#1f3539", trait: "shield", traitZh: "风盾：先破 24 点护盾", traitTh: "โล่ลม: ทำลายโล่ 24 แต้มก่อน", intentZh: "风盾盘旋 · 先破盾再伤本体", intentTh: "โล่ลมหมุน · ทำลายโล่ก่อน", shield: 24, counterDamage: 14, timeoutDamage: 18, boss: true }),

    Object.freeze({ id: "stamp-buffalo", chapter: 4, motion: "heavy", zh: "公章水牛", th: "ควายตราประทับ", hp: 128, art: "./assets/game/monster-stamp-buffalo-v1.webp", color: "#755b53", accent: "#b56b53", scene: "#59676d", ground: "#292f31", trait: "heavy", traitZh: "重章：反击更重", traitTh: "ตราหนัก: สวนกลับแรงขึ้น", intentZh: "公章重砸 · 失误 -15 HP", intentTh: "ทุบตราหนัก · พลาด -15 HP", counterDamage: 15, timeoutDamage: 18 }),
    Object.freeze({ id: "printer-squid", chapter: 4, motion: "float", zh: "打印章鱼", th: "ปลาหมึกเครื่องพิมพ์", hp: 140, art: "./assets/game/monster-printer-squid-v1.webp", color: "#59616d", accent: "#bd805c", scene: "#536971", ground: "#222f34", trait: "regen", traitZh: "卡纸重印：失误时恢复 6 生命", traitTh: "กระดาษติดพิมพ์ซ้ำ: ฟื้น 6 พลังเมื่อคุณพลาด", intentZh: "纸带缠绕 · 失误反击并回血", intentTh: "ริบบิ้นกระดาษรัด · สวนกลับและฟื้นพลัง", regen: 6, counterDamage: 14, timeoutDamage: 18 }),
    Object.freeze({ id: "traffic-crane", chapter: 4, motion: "wing", zh: "交通纸鹤", th: "นกกระเรียนจราจร", hp: 150, art: "./assets/game/monster-traffic-crane-v1.webp", color: "#61727b", accent: "#cf8a45", scene: "#5c6d70", ground: "#253235", trait: "rhythm", traitZh: "信号拍：每 2 题追加伤害", traitTh: "จังหวะสัญญาณ: ทุก 2 ข้อได้ดาเมจเพิ่ม", intentZh: "路标俯冲 · 隔题出现破绽", intentTh: "โฉบด้วยป้ายทาง · เปิดช่องทุกสองข้อ", rhythmEvery: 2, rhythmBonus: 10, counterDamage: 15, timeoutDamage: 19 }),
    Object.freeze({ id: "monitor-rabbit", chapter: 4, motion: "spring", zh: "显示器兔", th: "กระต่ายจอภาพ", hp: 160, art: "./assets/game/monster-monitor-rabbit-v1.webp", color: "#5a6871", accent: "#7aa4a1", scene: "#4e6870", ground: "#223034", trait: "enrage", traitZh: "弹窗：半血后加速", traitTh: "ป๊อปอัป: ครึ่งพลังแล้วเร็วขึ้น", intentZh: "弹窗连跳 · 半血后只给 7.8 秒", intentTh: "ป๊อปอัปกระโดด · ครึ่งพลังแล้วเหลือ 7.8 วิ", enrageAt: .5, enrageTurnMs: 7800, counterDamage: 15, timeoutDamage: 19 }),
    Object.freeze({ id: "seal-panda", chapter: 4, motion: "heavy", zh: "印章熊猫", th: "แพนด้าตราประทับ", hp: 170, art: "./assets/game/monster-seal-panda-elite-v103.webp", color: "#5b6267", accent: "#c45243", scene: "#59676d", ground: "#242e31", trait: "elite", traitZh: "精英技能：红章封印", traitTh: "สกิลชั้นยอด: ผนึกตราแดง", intentZh: "第 3 回合盖下封印 · 用守势揭印", intentTh: "ประทับผนึกทุกเทิร์นที่ 3 · ใช้ตั้งรับเพื่อลบผนึก", counterDamage: 17, timeoutDamage: 21, elite: true, skill: Object.freeze({ id: "red-seal", every: 3, counterStyle: "guard", strongDamage: 1.2, weakDamage: .65, safeCounter: .72, riskCounter: 1.3, strongTimeDelta: 500, weakTimeDelta: -400, nameZh: "红章封印", nameTh: "ผนึกตราแดง", hintZh: "第 3 回合封住进攻路线；守势能揭掉封印，其他招式会被压制。", hintTh: "ทุกเทิร์นที่ 3 จะผนึกทางบุก ตั้งรับช่วยลบผนึก ส่วนท่าอื่นจะถูกกดดาเมจ" }) }),
    Object.freeze({ id: "thunder-elephant", chapter: 4, motion: "heavy", zh: "雷鼓象", th: "ช้างกลองสายฟ้า", hp: 175, art: "./assets/game/monster-thunder-elephant-v4.webp", color: "#526b7e", accent: "#d8aa47", scene: "#5f5d66", ground: "#232a2e", trait: "rhythm", traitZh: "鼓点：每 3 题触发额外伤害", traitTh: "จังหวะกลอง: ทุก 3 ข้อได้ดาเมจเพิ่ม", intentZh: "鼓点破绽 · 第 3 题追加伤害", intentTh: "ช่องโหว่ตามจังหวะ · ข้อที่ 3 ดาเมจเพิ่ม", turnMs: 9000, rhythmEvery: 3, rhythmBonus: 18, counterDamage: 15, timeoutDamage: 19, boss: true }),

    Object.freeze({ id: "debate-hornbill", chapter: 5, motion: "wing", zh: "辩论犀鸟", th: "นกเงือกนักโต้วาที", hp: 145, art: "./assets/game/monster-debate-hornbill-v1.webp", color: "#5d6470", accent: "#c88c4d", scene: "#53636b", ground: "#242e32", trait: "resonance", traitZh: "追问：每 3 题触发回响", traitTh: "ถามซ้ำ: ก้องทุก 3 ข้อ", intentZh: "论点回声 · 命中加伤 / 失误追问", intentTh: "เสียงสะท้อนข้อโต้แย้ง · ถูกเพิ่มดาเมจ / พลาดโดนถามซ้ำ", resonanceEvery: 3, resonanceBonus: 8, resonanceDamage: 5, counterDamage: 15, timeoutDamage: 19 }),
    Object.freeze({ id: "rumor-moth", chapter: 5, motion: "float", zh: "流言飞蛾", th: "ผีเสื้อกลางคืนข่าวลือ", hp: 158, art: "./assets/game/monster-rumor-moth-v1.webp", color: "#74656b", accent: "#c68b6d", scene: "#5d626a", ground: "#282d31", trait: "enrage", traitZh: "扩散：六成血后加速", traitTh: "แพร่ข่าว: ต่ำกว่า 60% แล้วเร็วขึ้น", intentZh: "流言扩散 · 六成血后倒计时缩短", intentTh: "ข่าวลือแพร่ · ต่ำกว่า 60% แล้วเวลาสั้นลง", enrageAt: .6, enrageTurnMs: 7600, counterDamage: 16, timeoutDamage: 20 }),
    Object.freeze({ id: "logic-pangolin", chapter: 5, motion: "heavy", zh: "逻辑穿山甲", th: "ลิ่นตรรกะ", hp: 172, art: "./assets/game/monster-logic-pangolin-v1.webp", color: "#676b68", accent: "#b8955d", scene: "#53666b", ground: "#242f32", trait: "shield", traitZh: "论证甲：先破 22 点护盾", traitTh: "เกราะเหตุผล: ทำลายโล่ 22 แต้มก่อน", intentZh: "卷甲反证 · 先拆逻辑盾", intentTh: "ม้วนเกราะโต้แย้ง · ทำลายโล่เหตุผลก่อน", shield: 22, counterDamage: 16, timeoutDamage: 20 }),
    Object.freeze({ id: "ink-peacock", chapter: 5, motion: "wing", zh: "墨迹孔雀", th: "นกยูงหมึก", hp: 184, art: "./assets/game/monster-ink-peacock-v1.webp", color: "#4f6870", accent: "#b56c55", scene: "#4d6268", ground: "#202c30", trait: "regen", traitZh: "改稿：失误时恢复 7 生命", traitTh: "แก้ต้นฉบับ: ฟื้น 7 พลังเมื่อคุณพลาด", intentZh: "墨羽改稿 · 失误反击并回血", intentTh: "ขนหมึกแก้稿 · สวนกลับและฟื้นพลัง", regen: 7, counterDamage: 16, timeoutDamage: 20 }),
    Object.freeze({ id: "debate-garuda", chapter: 5, motion: "wing", zh: "辩场迦楼罗", th: "ครุฑนักโต้วาที", hp: 195, art: "./assets/game/monster-debate-garuda-elite-v103.webp", color: "#665f57", accent: "#c6924f", scene: "#59616a", ground: "#252c30", trait: "elite", traitZh: "精英技能：反论回声", traitTh: "สกิลชั้นยอด: เสียงโต้กลับ", intentZh: "隔回合发动回声 · 用速攻打断", intentTh: "สะท้อนเสียงทุก 2 เทิร์น · ใช้บุกเร็วขัดจังหวะ", counterDamage: 18, timeoutDamage: 22, elite: true, skill: Object.freeze({ id: "rebuttal-echo", every: 2, counterStyle: "rush", strongDamage: 1.3, weakDamage: .68, safeCounter: .84, riskCounter: 1.25, strongTimeDelta: 250, weakTimeDelta: -650, heal: 8, nameZh: "反论回声", nameTh: "เสียงโต้กลับ", hintZh: "每 2 回合反弹迟疑的回答；速攻可打断，失误时它会借回声恢复生命。", hintTh: "ทุก 2 เทิร์นจะสะท้อนคำตอบที่ช้า ใช้บุกเร็วขัดจังหวะ และเมื่อพลาดมันจะฟื้นพลังจากเสียงก้อง" }) }),
    Object.freeze({ id: "ink-king", chapter: 5, motion: "wing", zh: "金翅墨王", th: "ราชาหมึกปีกทอง", hp: 205, art: "./assets/game/monster-ink-king-v3.webp", color: "#8c774c", accent: "#c7ae78", scene: "#404951", ground: "#181c1f", trait: "enrage", traitZh: "狂暴：半血后倒计时加速", traitTh: "คลั่ง: ครึ่งพลังแล้วเวลาสั้นลง", intentZh: "墨翼压场 · 半血后进入狂暴", intentTh: "ปีกหมึกกดสนาม · ครึ่งพลังแล้วคลั่ง", enrageAt: .5, enrageTurnMs: 7500, counterDamage: 17, timeoutDamage: 21, boss: true }),

    Object.freeze({ id: "puppet-macaque", chapter: 6, motion: "runner", zh: "提线猕猴", th: "ลิงแสมหุ่นเชิด", hp: 165, art: "./assets/game/monster-puppet-macaque-v1.webp", color: "#785a4e", accent: "#c57858", scene: "#52636a", ground: "#242d31", trait: "rhythm", traitZh: "牵线：每 2 题出现破绽", traitTh: "เชิดสาย: เปิดช่องทุก 2 ข้อ", intentZh: "扇影牵线 · 隔题追加伤害", intentTh: "เงาพัดเชิดสาย · เพิ่มดาเมจทุกสองข้อ", rhythmEvery: 2, rhythmBonus: 12, counterDamage: 16, timeoutDamage: 21 }),
    Object.freeze({ id: "porcelain-lion", chapter: 6, motion: "heavy", zh: "青花醒狮", th: "สิงโตเครื่องลายคราม", hp: 180, art: "./assets/game/monster-porcelain-lion-v1.webp", color: "#5b7184", accent: "#c29655", scene: "#526a73", ground: "#223036", trait: "shield", traitZh: "瓷甲：先破 28 点护盾", traitTh: "เกราะลายคราม: ทำลายโล่ 28 แต้มก่อน", intentZh: "瓷甲醒狮 · 先破盾再伤本体", intentTh: "สิงโตเกราะลายคราม · ทำลายโล่ก่อน", shield: 28, counterDamage: 17, timeoutDamage: 21 }),
    Object.freeze({ id: "archive-naga", chapter: 6, motion: "serpent", zh: "档案娜迦", th: "นาคหอจดหมายเหตุ", hp: 195, art: "./assets/game/monster-archive-naga-v1.webp", color: "#4e7775", accent: "#b88652", scene: "#4b6870", ground: "#203035", trait: "resonance", traitZh: "旧卷回声：每 2 题触发回响", traitTh: "เสียงม้วนเอกสาร: ก้องทุก 2 ข้อ", intentZh: "卷宗回响 · 命中加伤 / 失误追击", intentTh: "ม้วนเอกสารก้อง · ถูกเพิ่มดาเมจ / พลาดโดนซ้ำ", resonanceEvery: 2, resonanceBonus: 9, resonanceDamage: 7, counterDamage: 17, timeoutDamage: 22 }),
    Object.freeze({ id: "clock-bear", chapter: 6, motion: "clock", zh: "钟表棕熊", th: "หมีนาฬิกา", hp: 210, art: "./assets/game/monster-clock-bear-v1.webp", color: "#6d6256", accent: "#b58a50", scene: "#53646a", ground: "#232e31", trait: "enrage", traitZh: "赶点：七成血后加速", traitTh: "เร่งเวลา: ต่ำกว่า 70% แล้วเร็วขึ้น", intentZh: "双摆追时 · 七成血后只给 7.2 秒", intentTh: "ลูกตุ้มคู่ไล่เวลา · ต่ำกว่า 70% เหลือ 7.2 วิ", enrageAt: .7, enrageTurnMs: 7200, counterDamage: 18, timeoutDamage: 22 }),
    Object.freeze({ id: "moon-gate-naga", chapter: 6, motion: "serpent", zh: "月门娜迦", th: "นาคประตูจันทร์", hp: 225, art: "./assets/game/monster-moon-gate-naga-elite-v103.webp", color: "#4f7779", accent: "#cc7859", scene: "#4c626c", ground: "#202d32", trait: "elite", traitZh: "精英技能：阴阳换相", traitTh: "สกิลชั้นยอด: สลับขั้วจันทรา", intentZh: "每回合更换弱点 · 按预警切换招式", intentTh: "สลับจุดอ่อนทุกเทิร์น · เปลี่ยนท่าตามสัญญาณเตือน", counterDamage: 20, timeoutDamage: 24, elite: true, skill: Object.freeze({ id: "dual-phase", always: true, counterStyles: Object.freeze(["rush", "guard"]), strongDamage: 1.35, neutralDamage: .9, weakDamage: .65, safeCounter: .76, neutralCounter: 1.08, riskCounter: 1.32, strongTimeDelta: 350, weakTimeDelta: -550, nameZh: "阴阳换相", nameTh: "สลับขั้วจันทรา", hintZh: "每回合在速攻与守势弱点之间切换；看清预警再出招，稳击只能造成普通偏低伤害。", hintTh: "สลับจุดอ่อนระหว่างบุกเร็วกับตั้งรับทุกเทิร์น ดูสัญญาณก่อนเลือกท่า ส่วนบุกมั่นคงทำดาเมจได้เพียงระดับกลาง" }) }),
    Object.freeze({ id: "twin-bell", chapter: 6, motion: "heavy", zh: "双城钟兽", th: "อสูรระฆังคู่", hp: 240, art: "./assets/game/monster-twin-bell-v1.webp", color: "#756854", accent: "#b96f56", scene: "#46585d", ground: "#1c272a", trait: "resonance", traitZh: "双钟回响：每 2 题触发共振", traitTh: "ระฆังคู่ก้อง: สั่นพ้องทุก 2 ข้อ", intentZh: "双钟回响 · 命中 +10 / 失误追加 8", intentTh: "ระฆังคู่ก้อง · ตอบถูก +10 / พลาดเพิ่ม 8", resonanceEvery: 2, resonanceBonus: 10, resonanceDamage: 8, turnMs: 8500, counterDamage: 18, timeoutDamage: 22, boss: true, finalBoss: true })
  ]);
  const MONSTER_RALLY_ZONE_COUNT = 10;
  const MONSTERS_PER_RALLY_ZONE = 10;
  const RALLY_STYLE_NAMES = Object.freeze({
    rush: Object.freeze(["速攻", "บุกเร็ว"]),
    steady: Object.freeze(["稳击", "บุกมั่นคง"]),
    guard: Object.freeze(["守势", "ตั้งรับ"])
  });
  const MONSTER_RALLY_ZONES = Object.freeze([
    Object.freeze({ id: "market", level: 1, zh: "早市纸巷", th: "ตรอกตลาดเช้า", color: "#476f72", accent: "#d96f55", scene: "#42686d", ground: "#1e3033", families: Object.freeze([
      Object.freeze({ id: "wok-catfish", zh: "锅铲鲶", th: "ปลาดุกกระทะ", art: "./assets/game/monster-rally-market-wok-catfish-v104.webp", motion: "skitter", skillZh: "热锅横扫", skillTh: "กวาดกระทะร้อน" }),
      Object.freeze({ id: "chili-gecko", zh: "辣椒壁虎", th: "จิ้งจกพริก", art: "./assets/game/monster-rally-market-chili-gecko-v104.webp", motion: "spring", skillZh: "辣尾连闪", skillTh: "หางพริกวาบ" })
    ]), relics: Object.freeze([["paper-seal", "seal", "纸章", "ตรากระดาษ"], ["market-basket", "patch", "菜篮", "ตะกร้า"], ["brass-bell", "bell", "铜铃", "กระดิ่งทองเหลือง"], ["red-thread", "thread", "红线", "ด้ายแดง"], ["gold-leaf", "foil", "金箔", "ฟอยล์ทอง"]]) }),
    Object.freeze({ id: "river", level: 1, zh: "河岸码头", th: "ท่าน้ำริมคลอง", color: "#416c78", accent: "#cf8356", scene: "#3e6874", ground: "#1c3038", families: Object.freeze([
      Object.freeze({ id: "ferry-otter", zh: "船桨水獭", th: "นากพายเรือ", art: "./assets/game/monster-rally-river-ferry-otter-v104.webp", motion: "float", skillZh: "回桨水拍", skillTh: "คลื่นพายย้อน" }),
      Object.freeze({ id: "umbrella-croc", zh: "伞背鳄", th: "จระเข้ร่ม", art: "./assets/game/monster-rally-river-umbrella-croc-v104.webp", motion: "heavy", skillZh: "伞壳回旋", skillTh: "เกราะร่มหมุน" })
    ]), relics: Object.freeze([["ferry-ticket", "seal", "船票", "ตั๋วเรือ"], ["water-ripple", "patch", "水纹", "ลายคลื่น"], ["bamboo-oar", "bell", "竹桨", "พายไผ่"], ["blue-knot", "thread", "蓝结", "ปมสีคราม"], ["dock-bell", "foil", "渡铃", "ระฆังท่าน้ำ"]]) }),
    Object.freeze({ id: "campus", level: 2, zh: "校园运动场", th: "สนามมหาวิทยาลัย", color: "#4f6975", accent: "#d45f52", scene: "#4b626d", ground: "#222d34", families: Object.freeze([
      Object.freeze({ id: "sneaker-buffalo", zh: "球鞋水牛", th: "ควายรองเท้าผ้าใบ", art: "./assets/game/monster-rally-campus-sneaker-buffalo-v104.webp", motion: "runner", skillZh: "冲线踏步", skillTh: "พุ่งเข้าเส้นชัย" }),
      Object.freeze({ id: "whistle-hornbill", zh: "口哨犀鸟", th: "นกเงือกนกหวีด", art: "./assets/game/monster-rally-campus-whistle-hornbill-v104.webp", motion: "wing", skillZh: "裁判急鸣", skillTh: "นกหวีดกรรมการ" })
    ]), relics: Object.freeze([["school-crest", "seal", "校徽", "ตรามหาวิทยาลัย"], ["chalk-mark", "patch", "粉笔", "รอยชอล์ก"], ["match-ticket", "bell", "球票", "ตั๋วแข่ง"], ["red-whistle", "thread", "红哨", "นกหวีดแดง"], ["winner-medal", "foil", "奖章", "เหรียญรางวัล"]]) }),
    Object.freeze({ id: "library", level: 2, zh: "纸墨图书馆", th: "ห้องสมุดกระดาษหมึก", color: "#53666f", accent: "#b96c58", scene: "#4b5d65", ground: "#222b30", families: Object.freeze([
      Object.freeze({ id: "bookmark-pangolin", zh: "书签穿山甲", th: "ตัวนิ่มที่คั่นหนังสือ", art: "./assets/game/monster-rally-library-bookmark-pangolin-v104.webp", motion: "heavy", skillZh: "索引卷甲", skillTh: "เกราะดัชนี" }),
      Object.freeze({ id: "ink-moth", zh: "墨翼夜蛾", th: "ผีเสื้อกลางคืนหมึก", art: "./assets/game/monster-rally-library-ink-moth-v104.webp", motion: "wing", skillZh: "墨页遮光", skillTh: "หน้าหมึกบังแสง" })
    ]), relics: Object.freeze([["bookmark", "seal", "书签", "ที่คั่นหนังสือ"], ["ink-drop", "patch", "墨滴", "หยดหมึก"], ["loan-stamp", "bell", "借阅章", "ตรายืม"], ["index-ribbon", "thread", "索引带", "ริบบิ้นดัชนี"], ["reading-lamp", "foil", "夜读灯", "โคมอ่านหนังสือ"]]) }),
    Object.freeze({ id: "station", level: 3, zh: "换乘枢纽", th: "สถานีเปลี่ยนสาย", color: "#4b6d78", accent: "#ce7652", scene: "#47636c", ground: "#202d33", families: Object.freeze([
      Object.freeze({ id: "ticket-fox", zh: "车票狐", th: "จิ้งจอกตั๋วรถ", art: "./assets/game/monster-rally-station-ticket-fox-v104.webp", motion: "runner", skillZh: "检票突进", skillTh: "พุ่งตรวจตั๋ว" }),
      Object.freeze({ id: "signal-macaque", zh: "信号猕猴", th: "ลิงสัญญาณ", art: "./assets/game/monster-rally-station-signal-macaque-v104.webp", motion: "runner", skillZh: "双牌截停", skillTh: "ป้ายคู่หยุดทาง" })
    ]), relics: Object.freeze([["single-ticket", "seal", "单程票", "ตั๋วเที่ยวเดียว"], ["platform-sign", "patch", "站牌", "ป้ายชานชาลา"], ["signal-light", "bell", "信号灯", "ไฟสัญญาณ"], ["map-fold", "thread", "地图折", "แผนที่พับ"], ["last-bell", "foil", "末班钟", "ระฆังขบวนสุดท้าย"]]) }),
    Object.freeze({ id: "music", level: 3, zh: "校园音乐社", th: "ชมรมดนตรี", color: "#5b6171", accent: "#d36a58", scene: "#515968", ground: "#262a32", families: Object.freeze([
      Object.freeze({ id: "drum-elephant", zh: "鼓点小象", th: "ช้างจังหวะกลอง", art: "./assets/game/monster-rally-music-drum-elephant-v104.webp", motion: "heavy", skillZh: "三拍震场", skillTh: "สามจังหวะสะเทือน" }),
      Object.freeze({ id: "mic-myna", zh: "麦克风八哥", th: "นกเอี้ยงไมโครโฟน", art: "./assets/game/monster-rally-music-mic-myna-v104.webp", motion: "wing", skillZh: "返场回声", skillTh: "เสียงก้องอังกอร์" })
    ]), relics: Object.freeze([["beat-mark", "seal", "鼓点", "จังหวะกลอง"], ["cassette", "patch", "磁带", "เทปคาสเซ็ต"], ["clapper", "bell", "拍板", "ไม้ให้จังหวะ"], ["school-song", "thread", "校歌章", "ตราเพลงมหาวิทยาลัย"], ["encore-star", "foil", "返场星", "ดาวอังกอร์"]]) }),
    Object.freeze({ id: "lab", level: 4, zh: "纸电实验室", th: "ห้องทดลองวงจรกระดาษ", color: "#476c6b", accent: "#cb7954", scene: "#416261", ground: "#1e2e2e", families: Object.freeze([
      Object.freeze({ id: "circuit-rabbit", zh: "电路兔", th: "กระต่ายวงจร", art: "./assets/game/monster-rally-lab-circuit-rabbit-v104.webp", motion: "spring", skillZh: "短路弹跳", skillTh: "กระโดดลัดวงจร" }),
      Object.freeze({ id: "printer-squid", zh: "打印鱿", th: "ปลาหมึกเครื่องพิมพ์", art: "./assets/game/monster-rally-lab-printer-squid-v104.webp", motion: "float", skillZh: "纸带缠流", skillTh: "ริบบิ้นกระดาษพัน" })
    ]), relics: Object.freeze([["circuit", "seal", "电路", "วงจร"], ["beaker", "patch", "量杯", "บีกเกอร์"], ["test-paper", "bell", "试纸", "กระดาษทดสอบ"], ["gear", "thread", "齿轮", "เฟือง"], ["safety-mark", "foil", "安全章", "ตราความปลอดภัย"]]) }),
    Object.freeze({ id: "night", level: 4, zh: "夜市灯街", th: "ถนนโคมตลาดค่ำ", color: "#3e626c", accent: "#d26253", scene: "#354f59", ground: "#17262c", families: Object.freeze([
      Object.freeze({ id: "lantern-frog", zh: "灯肚蛙", th: "กบท้องโคม", art: "./assets/game/monster-rally-night-lantern-frog-v104.webp", motion: "spring", skillZh: "灯肚反弹", skillTh: "ท้องโคมสะท้อน" }),
      Object.freeze({ id: "neon-naga", zh: "灯牌娜迦", th: "นาคป้ายไฟ", art: "./assets/game/monster-rally-night-neon-naga-v104.webp", motion: "serpent", skillZh: "灯街盘旋", skillTh: "วนถนนโคม" })
    ]), relics: Object.freeze([["lantern-sign", "seal", "灯牌", "ป้ายโคม"], ["stall-ticket", "patch", "摊票", "ตั๋วแผงลอย"], ["skewer-bell", "bell", "串铃", "กระดิ่งไม้เสียบ"], ["rain-awning", "thread", "雨棚", "กันสาดฝน"], ["night-seal", "foil", "夜巡章", "ตราตรวจค่ำ"]]) }),
    Object.freeze({ id: "festival", level: 5, zh: "双城节庆场", th: "ลานเทศกาลสองเมือง", color: "#576270", accent: "#d66f56", scene: "#4a5563", ground: "#222831", families: Object.freeze([
      Object.freeze({ id: "kite-peacock", zh: "风筝孔雀", th: "นกยูงว่าว", art: "./assets/game/monster-rally-festival-kite-peacock-v104.webp", motion: "wing", skillZh: "风尾开屏", skillTh: "หางว่าวกาง" }),
      Object.freeze({ id: "mask-lion", zh: "纸面醒狮", th: "สิงโตหน้ากระดาษ", art: "./assets/game/monster-rally-festival-mask-lion-v104.webp", motion: "heavy", skillZh: "彩面震步", skillTh: "หน้าสีสะเทือนก้าว" })
    ]), relics: Object.freeze([["kite-knot", "seal", "风筝结", "ปมว่าว"], ["streamer", "patch", "彩带", "ริบบิ้นสี"], ["drumstick", "bell", "鼓槌", "ไม้กลอง"], ["flower-tag", "thread", "花签", "ป้ายดอกไม้"], ["winner-flag", "foil", "冠军旗", "ธงแชมป์"]]) }),
    Object.freeze({ id: "moon", level: 6, zh: "月门终局", th: "ด่านประตูจันทร์", color: "#394f5d", accent: "#cc6b58", scene: "#314651", ground: "#141f25", families: Object.freeze([
      Object.freeze({ id: "moon-garuda", zh: "月卷金翅", th: "ปักษาปีกทองจันทรา", art: "./assets/game/monster-rally-moon-garuda-v104.webp", motion: "wing", skillZh: "金羽压场", skillTh: "ปีกทองกดสนาม" }),
      Object.freeze({ id: "twin-bell-dragon", zh: "双铃纸龙", th: "มังกรกระดาษระฆังคู่", art: "./assets/game/monster-rally-moon-twin-bell-dragon-v104.webp", motion: "serpent", skillZh: "双铃换相", skillTh: "ระฆังคู่สลับขั้ว" })
    ]), relics: Object.freeze([["moon-seal", "seal", "月印", "ตราจันทร์"], ["twin-bell", "patch", "双铃", "ระฆังคู่"], ["gold-feather", "bell", "金羽", "ขนทอง"], ["fate-thread", "thread", "红绳", "ด้ายชะตาแดง"], ["final-crown", "foil", "终局冠", "มงกุฎด่านสุดท้าย"]]) })
  ]);

  function buildRallySkill(zoneIndex, familyIndex, relic, variantIndex, boss) {
    const styleId = MONSTER_STYLE_ORDER[(zoneIndex + familyIndex + variantIndex) % MONSTER_STYLE_ORDER.length];
    const every = boss ? 2 : variantIndex === 0 ? 4 : variantIndex === 3 ? 2 : 3;
    const family = MONSTER_RALLY_ZONES[zoneIndex].families[familyIndex];
    const styleNames = RALLY_STYLE_NAMES[styleId];
    const always = Boolean(boss && zoneIndex === MONSTER_RALLY_ZONE_COUNT - 1);
    return Object.freeze({
      id: `rally-${MONSTER_RALLY_ZONES[zoneIndex].id}-${family.id}-${relic[0]}`,
      every,
      always,
      counterStyle: styleId,
      counterStyles: always ? Object.freeze(["rush", "guard", "steady"]) : undefined,
      strongDamage: 1.2 + zoneIndex * .012 + (boss ? .08 : 0),
      neutralDamage: .88,
      weakDamage: Math.max(.5, .72 - zoneIndex * .012),
      safeCounter: .76,
      neutralCounter: 1.05,
      riskCounter: 1.18 + zoneIndex * .018 + (boss ? .08 : 0),
      strongTimeDelta: 250 + variantIndex * 70,
      weakTimeDelta: -(320 + zoneIndex * 30),
      heal: variantIndex === 4 ? 3 + zoneIndex : 0,
      nameZh: `${relic[2]}·${family.skillZh}`,
      nameTh: `${family.skillTh}·${relic[3]}`,
      hintZh: `${always ? "每回合更换弱点" : `每 ${every} 回合发动`}；看清纸片预警，用${styleNames[0]}克制，硬吃技能会缩时并加重反击。`,
      hintTh: `${always ? "สลับจุดอ่อนทุกเทิร์น" : `ทำงานทุก ${every} เทิร์น`} ดูสัญญาณกระดาษแล้วใช้${styleNames[1]}แก้ทาง มิฉะนั้นเวลาจะสั้นและโดนสวนแรงขึ้น`
    });
  }

  function buildRallyMonster(zone, zoneIndex, family, familyIndex, relic, variantIndex) {
    const localStage = familyIndex * 5 + variantIndex + 1;
    const rallyStage = zoneIndex * MONSTERS_PER_RALLY_ZONE + localStage;
    const elite = localStage === 5 || localStage === 9;
    const boss = localStage === MONSTERS_PER_RALLY_ZONE;
    const hp = Math.round((105 + rallyStage * 3.2 + zoneIndex * 5) * (elite ? 1.08 : 1) * (boss ? 1.2 : 1) / 5) * 5;
    const passive = variantIndex % 5;
    const config = {
      id: `rally-${zone.id}-${family.id}-${relic[0]}`,
      rally: true,
      rallyZone: zoneIndex + 1,
      rallyStage,
      localStage,
      chapter: zone.level,
      motion: family.motion,
      zh: `${relic[2]}${family.zh}`,
      th: `${family.th} ${relic[3]}`,
      hp,
      art: family.art,
      artVariant: variantIndex,
      relic: Object.freeze({ id: relic[0], kind: relic[1], zh: relic[2], th: relic[3] }),
      color: zone.color,
      accent: zone.accent,
      scene: zone.scene,
      ground: zone.ground,
      trait: boss ? "rally-boss" : elite ? "elite" : "rally-skill",
      traitZh: `${boss ? "区域 BOSS" : elite ? "巡游精英" : "主动技能"}：${relic[2]}·${family.skillZh}`,
      traitTh: `${boss ? "บอสประจำเขต" : elite ? "มอนสเตอร์ชั้นยอด" : "สกิลประจำตัว"}: ${family.skillTh} · ${relic[3]}`,
      intentZh: `技能预警 · 用克制招式打断 ${family.skillZh}`,
      intentTh: `สัญญาณสกิล · ใช้ท่าแก้ทางหยุด ${family.skillTh}`,
      turnMs: Math.max(7200, 10000 - zoneIndex * 170 - localStage * 35 - (boss ? 350 : 0)),
      counterDamage: 10 + Math.floor(rallyStage / 14) + (elite ? 1 : 0) + (boss ? 2 : 0),
      timeoutDamage: 13 + Math.floor(rallyStage / 13) + (elite ? 1 : 0) + (boss ? 2 : 0),
      elite,
      boss,
      skill: buildRallySkill(zoneIndex, familyIndex, relic, variantIndex, boss)
    };
    if (passive === 0) config.shield = 8 + zoneIndex * 3 + (boss ? 8 : 0);
    if (passive === 1) config.regen = 2 + Math.floor(zoneIndex / 2);
    if (passive === 2) { config.rhythmEvery = 3; config.rhythmBonus = 5 + zoneIndex; }
    if (passive === 3) { config.resonanceEvery = 2; config.resonanceBonus = 4 + Math.floor(zoneIndex / 2); config.resonanceDamage = 2 + Math.floor(zoneIndex / 3); }
    if (passive === 4) { config.enrageAt = .45; config.enrageTurnMs = Math.max(6500, config.turnMs - 900); }
    return Object.freeze(config);
  }

  const MONSTER_RALLY_CONFIGS = Object.freeze(MONSTER_RALLY_ZONES.flatMap((zone, zoneIndex) => zone.families.flatMap((family, familyIndex) => zone.relics.map((relic, variantIndex) => buildRallyMonster(zone, zoneIndex, family, familyIndex, relic, variantIndex)))));
  const ALL_MONSTER_CONFIGS = Object.freeze([...MONSTER_CONFIGS, ...MONSTER_RALLY_CONFIGS]);
  const MONSTER_ART_PRELOADS = new Map();
  let monsterSpriteSwapSequence = 0;
  const GAME_COLORS = {
    voice: "#ff6b7a", monster: "#f06474", match: "#b9ed55", audio: "#26c7b8", speed: "#ffb62f", tone: "#8d8fff",
    polish: "#ff5967", "grade-lock": "#67d8ff", "scene-listen": "#ff8ec7", "register-shift": "#f6d45c", memory: "#6f96b3", survival: "#ef745f",
    bingo: "#3d8968", reflex: "#e0a63b"
  };
  const COMMERCE_FREE_GAMES = new Set(["voice", "monster", "match", "audio"]);
  const canUseGame = id => globalThis.SawadeekaCommerce?.canAccess?.(`arcade:${id}`) !== false;
  const canUseFullMonsterRoute = () => globalThis.SawadeekaCommerce?.canAccess?.("monster-full") !== false;
  function requestPremium(feature) {
    globalThis.SawadeekaCommerce?.openPaywall?.(feature);
  }
  const POLICY_GAME_MAP = Object.freeze({
    "meaning-match": ["monster", "match", "memory", "survival", "reflex", "grade-lock"],
    "listen-pick": ["audio", "bingo", "scene-listen"],
    "guided-response": ["voice", "monster", "speed", "survival", "reflex", "grade-lock", "register-shift"],
    "tone-compare": ["tone", "grade-lock"],
    "boundary-roleplay": ["scene-listen"],
    "risk-spot": ["tone", "scene-listen", "grade-lock"],
    "safe-rewrite": ["polish", "register-shift"],
    "direct-roleplay": ["voice", "monster", "speed", "scene-listen", "register-shift"],
    "clarity-check": ["polish", "grade-lock", "tone"],
    "deescalation-roleplay": ["voice", "scene-listen", "register-shift"],
    "safe-exit": ["polish", "grade-lock", "tone"]
  });
  const COPY = {
    zh: {
      eyebrow: "单人闯关 · 14 种玩法", title: "挑一个弱项，开局练到会", subtitle: "当前档位的推荐排在最前；游戏答题会直接写回词库复习进度。", total: "最佳总分", showAll: "查看全部 14 种玩法", showLess: "收起其他玩法",
      learningBridgeTitle: level => `L${level} 学习进度`, learningSeen: "已练", learningDue: "待复习", learningWrong: "错词", learningMastered: "已掌握", learningReview: count => count ? `复习 ${count} 个错词` : "复习到期词", monsterCollection: (chapter, total) => `本章 ${chapter}/${MONSTERS_PER_CHAPTER} · 136 怪图鉴 ${total}/${ALL_MONSTER_CONFIGS.length}`, learningSaved: count => `本局 ${count} 次词汇判断已写回学习进度`,
      safety: "所有玩法只使用不伤人的表达；S2 练直接边界，S1 练冲突降级。", score: "分", ready: "准备开始", next: "下一题", finish: "看战绩", skipTransition: "轻触跳过",
      games: {
        voice: ["01 · 6 关", "开口破门", "设备识别成目标词即可击碎关门；失误可重试，不靠蒙选项。", "说"],
        monster: ["02 · 136 怪 · 双地图", "校园声斗赛", "36 关主线之外新增百怪巡游：10 区、100 只主动技能怪，成长、连击、词库与图鉴全部共用。", "打"],
        match: ["03 · 60 秒", "闪电配对", "连对 6 组双语词，越快分越高。", "配"],
        audio: ["04 · 8 题", "听音狙击", "只听声音锁定意思，训练真实反应。", "听"],
        speed: ["05 · 45 秒", "限时选义", "不停题，连击会把分数越推越高。", "快"],
        tone: ["06 · S5—S1", "分寸雷达", "判断一句话到底正式、随意还是冒犯。", "测"],
        polish: ["07 · 改写", "场景改写", "把同一个意思改成更适合当前关系与场合的表达。", "改"],
        "grade-lock": ["08 · 当前档", "档位锁定", "四句都在当前档，锁定与情境意思完全对应的一句。", "锁"],
        "scene-listen": ["09 · 听情境", "听声寻景", "听当前档位的一句话，找出对应意思与场景。", "寻"],
        "register-shift": ["10 · 换挡", "情境变档", "从当前档切到场景推荐档，意思保持不变。", "换"],
        memory: ["11 · 4 对", "记忆翻翻乐", "翻开纸片，把目标词和意思配成 4 对；连续命中会加分。", "翻"],
        survival: ["12 · 3 条命", "生存连答", "30 秒开局；答对续时，答错掉生命，坚持越久分越高。", "活"],
        bingo: ["13 · 连成 2 线", "听音宾果", "只听学习示范音，在九宫格盖住对应意思；先连成两条线获胜。", "宾"],
        reflex: ["14 · 25 秒", "真假快闪", "快速判断目标词和意思是否匹配；看准再拍，答错会扣时间。", "辨"]
      },
      gradePick: grade => `${grade} · 当前档位推荐`, gradeFocus: grade => `${grade} 重点`,
      best: "最佳", notPlayed: "未挑战", start: "开练", monsterCardProgress: count => `${count}/${ALL_MONSTER_CONFIGS.length}`, monsterCardProgressLabel: "已击败", round: (n, total) => `第 ${n}/${total} 题`, pairs: (n, total) => `已配对 ${n}/${total}`, time: n => `${n} 秒`,
      tapPair: "从两边各选一张，配出同一个意思", matchTarget: "泰语", matchMeaning: "中文意思", matchReadyTitle: "先看规则，再开始计时", matchReadyCopy: "两边各选一张，配出 6 组相同意思。开始后说明会收起，短屏不用边读规则边倒计时。", matchStart: "我准备好了，开始 60 秒", matchCountdown: n => `${n} 秒后开始`, listenPrompt: "先听声音，再锁定正确意思", listenHint: "点按钮可重复播放", playSentence: "播放当前句子", close: "关闭游戏",
      memoryPrompt: "记住纸片位置，把词和意思翻成一对", memoryPairs: (n, total) => `已找到 ${n}/${total} 对`, memoryMatch: "配对成功", memoryMiss: "位置记住了，再翻一张", memoryCard: n => `记忆纸片 ${n}`,
      survivalTitle: "三条命，能撑多久？", survivalCopy: "答对一题加 1.5 秒；答错失去一条命。计时开始后没有停顿。", survivalStart: "开始 30 秒生存战", survivalPrompt: "在时间耗尽前选出正确意思", survivalLives: n => `剩余 ${n} 条命`, survivalBonus: "+1.5 秒", survivalLost: "失去一条命",
      bingoTitle: "听见哪个，就盖哪个", bingoCopy: "九宫格里有 9 个意思。每轮先听学习示范音，再盖住对应纸片；先连成两条线获胜。", bingoStart: "开始听音宾果", bingoPrompt: "听声音，盖住对应意思", bingoLines: (n, total) => `已连成 ${n}/${total} 条`, bingoReplay: "再听一遍", bingoHit: "命中，纸章已盖", bingoMiss: "不是这个意思，再听一次", bingoWin: "BINGO！两条线完成",
      reflexTitle: "真假只给你一瞬间", reflexCopy: "目标词和下方意思相符就拍“匹配”，不相符就拍“不匹配”。答错会扣 1 秒。", reflexStart: "开始 25 秒快闪", reflexPrompt: "这组词义匹配吗？", reflexTrue: "匹配", reflexFalse: "不匹配", reflexCorrect: "判断正确", reflexWrong: "看反了 · 扣 1 秒",
      speedPrompt: "选出正确意思", tonePrompt: "结合人物关系与场景，这句话属于哪种场景语气？", polishPrompt: "同一个意思，哪句在这个关系与场合最合适？", sourceRisk: "待改写 · 关系与场景不匹配",
      correct: "判断正确", wrong: "再看一次", toneCorrect: grade => `正解是 ${grade}`, toneWrong: grade => `这句实际是 ${grade}`,
      polishCorrect: "选得合适", polishWrong: "这句不适合当前关系与场景", riskTag: "注意使用场景与人物关系",
      contextSetting: "场景", contextRelationship: "关系", contextMissing: "缺少关系或场景，不能判定唯一合适档位。",
      recommendation: (grade, why) => `本场景推荐 ${grade}：${why}`,
      audioLoading: "正在查找本机学习声包…", audioUnavailable: level => `L${level} 学习声包尚未安装，无法保证清晰示范音。`, audioFailed: "音频加载失败，请检查声包后重试。",
      installPack: level => `安装 L${level} 声包`, useText: "先用文字模式", textPrompt: "看词选出正确意思", textFallbackReady: "已切换为看词选义，本题仍可完成。",
      gradeLockPrompt: grade => `哪句用 ${grade} 档准确表达上面的意思？`, gradeLockCorrect: grade => `锁定 ${grade}`,
      sceneListenPrompt: grade => `先听 ${grade} 档表达，再选择它在说什么`, sceneListenHint: "点上方播放键可重复听；点下方情境即作答。", sceneCorrect: "情境命中",
      shiftPrompt: (from, to) => `从 ${from} 切到本场景推荐的 ${to}`, shiftCorrect: grade => `已切到 ${grade}`,
      voicePrompt: "看意思，直接说出目标词", voiceHint: "先听学习示范音，再点麦克风完整说出；设备最终转写匹配度达到 78 才破门。", voiceDemo: "听学习示范音", voiceStart: "开始说", voiceListening: "正在听…", voicePass: score => `识别命中 · 匹配度 ${score}`, voiceRetry: score => `匹配度 ${score} · 再清楚一点`, voiceNetwork: "允许本次联网识别", voiceLocalMissing: "本机没有离线识别包，可允许系统语音服务联网识别本次答案。", voiceUnavailable: "当前设备不能生成转写匹配度，请换 Chrome/Safari HTTPS 版完成本关。", voiceHeard: value => `设备转写：${value}`,
      monsterStage: (n, total) => `第 ${n}/${total} 战`, monsterPlayer: "你的 HP", monsterCrest: "勇气护符", monsterEnemy: "怪物 HP", monsterBoss: "BOSS HP", monsterPrompt: "说出目标词，发动攻击", monsterQuestionTag: "声音题", monsterSigil: "声", monsterRule: "识别命中越快，伤害越高", monsterPower: value => `预计 ${value} 伤害`, monsterReady: "先看对手招式，再选打法", monsterHear: "听目标词", monsterTime: value => `${value} 秒`, monsterChooseTimer: "选招",
      monsterVoice: "开口攻击", monsterVoiceHint: "转写匹配 + 速度 = 伤害", monsterListening: "正在听你说…", monsterJudging: value => value ? `设备转写：${value} · 正在核对` : "正在核对转写…", monsterVoicePass: score => `识别命中 · 匹配度 ${score}`, monsterVoiceFail: score => `匹配度 ${score} · 怪物反击`, monsterVoiceGradeLabel: "语音匹配", monsterVoiceGrades: { perfect: "高匹配", great: "匹配良好", pass: "识别命中" }, monsterVoiceGradeBonus: value => `语音匹配伤害 +${value}`, monsterNetwork: "允许本次联网识别", monsterFallback: "麦克风不可用时，可点下方意思继续战斗", monsterUnavailable: "这台设备暂时不能进行语音识别，请用下方文字招式继续。", monsterLocalMissing: "本机没有离线识别包；可允许系统语音服务仅联网识别这一次。", monsterFxOn: "战斗音效已开", monsterFxOff: "战斗音效已关",
      monsterReadyTitle: "选择路线，再进入多回合声斗", monsterReadyCopy: "主线保留 6 章 36 关；百怪巡游新增 10 区 100 只怪。每只怪都有主动技能和可见遗物，需要多次命中；过关升级、连击和强化按倍率逐层叠加，并写回词库。", monsterReadyRules: ["看技能预警选克制招", "每怪多次命中并叠连击", "过关升级并写回词库"], monsterReadyDetails: "玩法、成长与判定", monsterReadyOpponent: "本关对手", monsterStart: "进入当前关卡",
      monsterCampaignEyebrow: level => `校园声斗赛 · 第 ${level} 章`, monsterCampaignHook: "6 章 · 36 只怪 · 36 个独立关卡", monsterCampaignLoot: "首次击败新对手升级，过关可叠加强化", monsterStartHint: "从本章尚未击败的关卡继续", monsterJudgeNote: "设备按最终转写判定命中，不等于母语教师发音评分。", monsterCombo: "连击", monsterMomentum: "声势", monsterMomentumTiers: { calm: "热身", heat: "连击升温", fever: "全场沸腾" }, monsterChallenge: "前三秒说准，触发暴击", monsterEntryBoss: "BOSS 登场", monsterEntryElite: "精英技能启动", monsterEntryRival: "新对手入场", monsterElite: "精英", monsterImpactLabels: { hit: "命中", critical: "精准暴击", burst: "纸片必杀", shield: "破盾", down: "击破", counter: "怪物反击" }, monsterYou: "你", monsterRoute: "本章六关路线", monsterCampaignMap: "36 关校园地图", monsterChapter: level => `L${level} 章`, monsterChapterProgress: value => `${value}/${MONSTERS_PER_CHAPTER}`, monsterGlobalStage: value => `第 ${value}/${MONSTER_CONFIGS.length} 关`, monsterCombatLevel: value => `声斗 Lv.${value}`, monsterEnemyLevel: value => `关卡 Lv.${value}`, monsterLevelUp: value => `当前声斗 Lv.${value}`, monsterUpgradeRank: value => `强化 ${value} 级`, monsterComboDamage: value => `连击 ×${value.toFixed(2)}`, monsterDamageFormula: "（速度基础伤害 + 等级加成）× 连击 × 强化，再结算技能", monsterFirstMission: "第一回合", monsterFirstSteps: "看预警 → 选招 → 听题 → 开口", monsterLearningGain: "词库进度 +1", monsterLearningReview: "已加入错词复习", monsterCutInKicker: "声势突破", monsterCutInTitle: "声浪突进",
      monsterModeTitle: "选择狩猎路线", monsterModeStory: "主线 36", monsterModeStoryHint: "六章学习地图", monsterModeRally: "百怪巡游 100", monsterModeRallyHint: "十区技能挑战", monsterRallyMap: "百怪巡游十区地图", monsterRallyZone: value => `巡游 ${value} 区`, monsterRallyZoneProgress: value => `${value}/${MONSTERS_PER_RALLY_ZONE}`, monsterRallyStage: value => `第 ${value}/${MONSTER_RALLY_CONFIGS.length} 只`, monsterRallyEyebrow: value => `百怪巡游 · 第 ${value} 区`, monsterRallyHook: "十区百怪 · 主动技能巡游", monsterRallyLoot: "击败怪物永久点亮图鉴；每区强化可叠加到区末 BOSS", monsterRallyStartHint: "从本区尚未击败的怪物继续", monsterRallyRoute: "本区十怪路线", monsterRallyRewardStreak: value => `本区已过 ${value}/${MONSTERS_PER_RALLY_ZONE}`, monsterRallyVictory: "本区十怪全破！", monsterRallyVictoryCopy: "本区 10 只怪已全部完成，声斗等级、百怪图鉴和词库进度都已保存。", monsterTotalCollection: (story, rally) => `主线 ${story}/${MONSTER_CONFIGS.length} · 巡游 ${rally}/${MONSTER_RALLY_CONFIGS.length}`,
      monsterSkillTitle: "精英技能", monsterSkillActive: style => `本回合发动 · 用${style}克制`, monsterSkillCooldown: turns => `${turns} 回合后发动`, monsterSkillRecommended: style => `克制：${style}`, monsterSkillCounterBadge: "技能克制", monsterSkillCountered: (name, style) => `${style}克制 ${name}`, monsterSkillResisted: name => `${name} 抵抗了部分伤害`, monsterSkillPunished: name => `${name} 技能追击`,
      monsterHeroPick: "先选声斗搭档", monsterHeroPickHint: "开战前可随时切换；每个人的天赋都会真实影响攻防。", monsterHeroNames: { captain: "稳声社长", reporter: "抢麦记者", thai: "泰国节奏学姐" }, monsterHeroTraits: { captain: "稳声 · 每题 +0.5 秒", reporter: "抢答 · 攻击 ×1.12 / 受伤 ×1.08", thai: "护拍 · 受伤 ×0.78 / 攻击 ×0.94" },
      monsterArm: seconds => `听题 · 开始 ${seconds} 秒`, monsterArmHint: "可先换招；点下后才播放示范音并开始计时", monsterCueShort: "正在播放题音", monsterCuePlaying: "正在播放学习示范音；播放结束后才开始计时", monsterCueGrace: "题音结束 · 准备开口", monsterCueFailed: "题音暂不可用，计时未开始。可重试、下载语音包，或主动选择文字题。", monsterGo: "计时开始，点“开口攻击”说出目标词",
      monsterTextStart: "用文字题继续", monsterTextGo: "文字题计时开始 · 选择词义，或开口作答", monsterRetryCue: "重试题音",
      monsterTraits: { lantern: "灯拍：每 3 题出现破绽", lotus: "莲火回春：失误时恢复 8 生命", "kite-naga": "风盾：先击破 24 点护盾", "thunder-elephant": "鼓点：每 3 题触发额外伤害", "ink-king": "狂暴：半血后倒计时加速", "twin-bell": "双钟回响：每 2 题触发共振" },
      monsterIntentTitle: "怪物下一招", monsterIntents: { lantern: "灯影冲撞 · 第 3 题追加伤害", lotus: "莲火反击 · 失误反击并自愈", "kite-naga": "风盾盘旋 · 先破盾再伤本体", "thunder-elephant": "鼓点破绽 · 第 3 题追加伤害", "ink-king": "墨翼压场 · 半血后进入狂暴", "twin-bell": "双钟回响 · 命中 +10 / 失误追加 8" },
      monsterChooseStyle: "选一招开战", monsterChoosePower: "稳击就绪 · 准备好再听题", monsterStyleReady: name => `已选${name}；点“听题”后开始计时`, monsterStyleStats: (seconds, damage) => `${seconds} 秒 · 攻 ${damage}`,
      monsterStyles: { rush: ["速攻", "时限 -2.5 秒", "受伤 ×1.35"], steady: ["稳击", "时间与伤害均衡", "标准"], guard: ["守势", "时限 +1.5 秒", "受伤 ×0.5"] },
      monsterBurstCharge: (value, total) => `勇气必杀 ${value}/${total}`, monsterBurstReady: "点按装填必杀", monsterBurstArmed: value => `必杀已装填 +${value}`, monsterBurstDisarmed: "已收回必杀", monsterBurstLost: "必杀被反击打断", monsterBurst: value => `纸片必杀 +${value}`,
      monsterGuarded: value => `守势减伤 ${value}`, monsterRushPenalty: value => `速攻风险 +${value}`,
      monsterShield: value => `护盾 ${value}`, monsterShieldBreak: value => `护盾吸收 ${value}`, monsterRegen: value => `怪物回复 +${value}`, monsterRhythm: value => `节拍暴击 +${value}`, monsterEnraged: "怪物进入加速狂暴！", monsterResonance: value => `击破回响 +${value}`, monsterResonanceCounter: value => `回响追击 +${value}`, monsterHeroGuarded: value => `搭档减伤 ${value}`, monsterHeroRisk: value => `搭档风险 +${value}`, monsterHeroPower: value => `搭档天赋 +${value}`,
      monsterRewardTitle: "拿下！再叠一层强化", monsterRewardCopy: "首次击败新对手提升永久声斗等级；重复挑战仍可获得本轮强化。强化可叠加，续战时保留，远征结束后重置。", monsterRewards: { power: ["力量贴纸", "本次远征伤害倍率 +10%"], guard: ["体能绷带", "生命上限 +12，并恢复 18"], tempo: ["时间书签", "之后每题多 0.5 秒"] }, monsterRewardPick: "选择强化", monsterRewardHp: (value, max) => `远征体力 ${value}/${max}`, monsterRewardStreak: value => `本章进度 ${value}/${MONSTERS_PER_CHAPTER}`, monsterRewardNext: "下一关", monsterExitConfirm: "远征已保存到本机。退出后可继续，保留体力、怪物血量、连击和强化；尚未完成的题会重新开始。现在退出吗？",
      monsterResumeTitle: "你的远征还在", monsterResume: "继续远征", monsterResumeStats: (hp, max, ranks) => `体力 ${hp}/${max} · 已叠加 ${ranks} 层强化`, monsterResumeNote: "从最近结算的回合继续 · 仅保存在当前设备", monsterReplaceConfirm: "开启新远征将替换未完成远征的体力和强化；已解锁图鉴与词库进度保留。确定开启吗？", monsterStorageWarning: "当前无法持久保存。关闭页面后可能丢失本轮远征，请先检查浏览器存储空间。仍要退出吗？", monsterGrowthNote: "首次击败新对手才升级 · 主线与百怪共用等级", monsterSaveLocal: "回合已存本机", monsterSaveMemory: "仅暂存本页，关闭可能丢失",
      monsterHit: (damage, seconds, critical, comboMultiplier) => `${seconds} 秒 · ${critical ? "暴击" : "命中"} ${damage} 伤害${comboMultiplier > 1 ? ` · 连击 ×${comboMultiplier.toFixed(2)}` : ""}`, monsterCounter: damage => `答错！怪物反击 ${damage}`, monsterTimeout: damage => `超时！怪物反击 ${damage}`, monsterReveal: (target, meaning) => `正确答案：${target} · ${meaning}`, monsterDown: (name, bonus) => `${name} 被击败！奖励 ${bonus} 分`, monsterVictory: "本章六关全破！", monsterDefeat: "体力耗尽", monsterVictoryCopy: "这一学习章节的 6 个关卡已全部完成，声斗等级、图鉴和词库进度都已保存。", monsterDefeatCopy: "本局错词已自动进入复习队列，练熟后可从当前关卡继续。",
      currentRegister: grade => `当前 ${grade}`, targetRegister: grade => `目标 ${grade}`, tapToHear: "点右侧声音键试听，点句子作答", previewOption: letter => `试听选项 ${letter}`,
      grades: { S5: ["S5", "正式得体"], S4: ["S4", "自然日常"], S3: ["S3", "熟人随口"], S2: ["S2", "直接表达"], S1: ["S1", "冲突降级"] },
      monsterRoundKicker: "本回合结算", monsterRoundAttack: value => `总攻击 ${value}`, monsterRoundCounter: value => `承受 ${value} 伤害`, monsterRoundSpeedLevel: (speed, level) => `速度 ${speed} + 等级 ${level}`, monsterRoundFactor: (label, value) => `${label} ×${value}`, monsterRoundCombo: value => `连击 ×${value}`, monsterRoundUpgrade: value => `强化 ×${value}`, monsterRoundHero: value => `搭档 ×${value}`, monsterRoundSkill: value => `怪物技能 ×${value}`, monsterRoundShield: value => `护盾 -${value}`, monsterRoundBody: value => `本体 -${value}`, monsterRoundEnemyBase: value => `怪物基础 ${value}`, monsterRoundTime: (seconds, label) => `${seconds} 秒 · ${label}`, monsterRoundReasons: { timeout: "超时", voice: "转写未命中", choice: "词义未命中" }, monsterRoundVoice: score => `转写匹配 ${score}`, monsterRoundTap: "点屏幕可跳过",
      done: "本局完成", newBest: "刷新本机最佳！", keep: "再练一局，反应会更快。", statScore: "本局得分", statRight: "答对", statCombo: "最高连击", replay: "再来一局",
      noData: "语气训练包正在校验，稍后开放。", wordFallback: "词库加载中，请稍后再试。", answerLetters: ["A", "B", "C", "D", "E"]
    },
    th: {
      eyebrow: "ตะลุยเดี่ยว · 14 เกม", title: "เลือกจุดอ่อน แล้วฝึกให้คล่องในเกม", subtitle: "เกมที่แนะนำอยู่ก่อน และทุกคำตอบจะบันทึกกลับสู่ความคืบหน้าการทบทวนคำศัพท์", total: "คะแนนดีที่สุดรวม", showAll: "ดูเกมทั้งหมด 14 แบบ", showLess: "ย่อเกมอื่น",
      learningBridgeTitle: level => `ความคืบหน้า L${level}`, learningSeen: "ฝึกแล้ว", learningDue: "ถึงเวลาทบทวน", learningWrong: "คำที่พลาด", learningMastered: "จำได้แล้ว", learningReview: count => count ? `ทบทวนคำที่พลาด ${count} คำ` : "ทบทวนคำถึงกำหนด", monsterCollection: (chapter, total) => `บทนี้ ${chapter}/${MONSTERS_PER_CHAPTER} · สารานุกรม 136 ตัว ${total}/${ALL_MONSTER_CONFIGS.length}`, learningSaved: count => `บันทึกผลคำศัพท์ ${count} ครั้งกลับสู่ความคืบหน้าแล้ว`,
      safety: "ทุกเกมใช้ถ้อยคำที่ไม่ทำร้ายผู้อื่น: S2 ฝึกพูดตรงและตั้งขอบเขต ส่วน S1 ฝึกลดความขัดแย้ง", score: "แต้ม", ready: "พร้อมเริ่ม", next: "ข้อต่อไป", finish: "ดูผลงาน", skipTransition: "แตะเพื่อข้าม",
      games: {
        voice: ["01 · 6 ด่าน", "พูดพังประตู", "ระบบรู้จำเป็นคำเป้าหมายจึงพังประตูได้ ผิดแล้วลองใหม่ ไม่ต้องเดา", "พูด"],
        monster: ["02 · 136 ตัว · 2 แผนที่", "ศึกเสียงล่ามอนสเตอร์", "นอกจากเนื้อเรื่อง 36 ด่าน ยังมีทัวร์ร้อยมอนสเตอร์ 10 เขต ทุกตัวมีสกิล การเติบโต คอมโบ คำศัพท์ และสารานุกรมใช้ร่วมกัน", "ล่า"],
        match: ["03 · 60 วิ", "จับคู่สายฟ้า", "จับคู่คำสองภาษา 6 คู่ ยิ่งไวแต้มยิ่งสูง", "คู่"],
        audio: ["04 · 8 ข้อ", "ล็อกเป้าจากเสียง", "ฟังอย่างเดียวแล้วเลือกความหมาย ฝึกตอบสนองจริง", "ฟัง"],
        speed: ["05 · 45 วิ", "เลือกความหมายทันใจ", "คำถามต่อเนื่อง ยิ่งคอมโบสูงยิ่งได้แต้มมาก", "ไว"],
        tone: ["06 · S5—S1", "เรดาร์ระดับภาษา", "แยกว่าแต่ละประโยคสุภาพ กันเอง หรือหยาบคาย", "วัด"],
        polish: ["07 · ปรับคำ", "ปรับตามฉาก", "เปลี่ยนความหมายเดิมให้เหมาะกับความสัมพันธ์และสถานการณ์", "ปรับ"],
        "grade-lock": ["08 · ระดับที่เลือก", "ล็อกระดับภาษา", "ทั้งสี่ประโยคอยู่ในระดับปัจจุบัน เลือกประโยคที่ตรงกับความหมายและสถานการณ์", "ล็อก"],
        "scene-listen": ["09 · ฟังสถานการณ์", "ฟังเสียงหาฉาก", "ฟังหนึ่งประโยคในระดับปัจจุบัน แล้วเลือกความหมายและสถานการณ์ให้ตรง", "หา"],
        "register-shift": ["10 · เปลี่ยนระดับ", "เปลี่ยนเกียร์ภาษา", "เปลี่ยนจากระดับปัจจุบันไปเป็นระดับที่เหมาะกับสถานการณ์ โดยคงความหมายเดิม", "เปลี่ยน"],
        memory: ["11 · 4 คู่", "พลิกการ์ดจำคำ", "พลิกเศษกระดาษแล้วจับคู่คำเป้าหมายกับความหมายให้ครบ 4 คู่ ยิ่งต่อเนื่องยิ่งได้แต้ม", "พลิก"],
        survival: ["12 · 3 ชีวิต", "ตอบรอดเวลา", "เริ่มที่ 30 วินาที ตอบถูกได้เวลาเพิ่ม ตอบผิดเสียชีวิต อยู่ให้นานที่สุด", "รอด"],
        bingo: ["13 · ต่อ 2 เส้น", "บิงโกจากเสียง", "ฟังเสียงตัวอย่างแล้วปั๊มความหมายในตาราง 9 ช่อง ต่อให้ครบสองเส้นก่อน", "บิง"],
        reflex: ["14 · 25 วิ", "จริงหรือหลอก", "ตัดสินไวว่าคำกับความหมายตรงกันไหม ดูให้ชัด เพราะตอบผิดจะเสียเวลา", "แยก"]
      },
      gradePick: grade => `${grade} · แนะนำสำหรับระดับปัจจุบัน`, gradeFocus: grade => `เน้น ${grade}`,
      best: "ดีที่สุด", notPlayed: "ยังไม่เล่น", start: "เริ่ม", monsterCardProgress: count => `${count}/${ALL_MONSTER_CONFIGS.length}`, monsterCardProgressLabel: "ปราบแล้ว", round: (n, total) => `ข้อ ${n}/${total}`, pairs: (n, total) => `จับคู่แล้ว ${n}/${total}`, time: n => `${n} วิ`,
      tapPair: "เลือกฝั่งละหนึ่งใบให้มีความหมายตรงกัน", matchTarget: "ภาษาจีน", matchMeaning: "ความหมายภาษาไทย", matchReadyTitle: "อ่านกติกาก่อน แล้วค่อยเริ่มจับเวลา", matchReadyCopy: "เลือกฝั่งละหนึ่งใบให้ครบ 6 คู่ เมื่อเริ่มแล้วคำอธิบายจะหายไป เพื่อให้จอสั้นเห็นกระดานได้มากขึ้น", matchStart: "พร้อมแล้ว เริ่ม 60 วินาที", matchCountdown: n => `เริ่มใน ${n} วินาที`, listenPrompt: "ฟังก่อน แล้วเลือกความหมายที่ถูก", listenHint: "แตะปุ่มเพื่อฟังซ้ำ", playSentence: "ฟังประโยคนี้", close: "ปิดเกม",
      memoryPrompt: "จำตำแหน่ง แล้วพลิกคำกับความหมายให้เป็นคู่", memoryPairs: (n, total) => `พบแล้ว ${n}/${total} คู่`, memoryMatch: "จับคู่สำเร็จ", memoryMiss: "จำตำแหน่งไว้ แล้วลองอีกใบ", memoryCard: n => `แผ่นคำที่ ${n}`,
      survivalTitle: "สามชีวิต จะอยู่ได้นานแค่ไหน?", survivalCopy: "ตอบถูกเพิ่ม 1.5 วินาที ตอบผิดเสียหนึ่งชีวิต เมื่อเริ่มแล้วเวลาจะไม่หยุด", survivalStart: "เริ่มเอาตัวรอด 30 วินาที", survivalPrompt: "เลือกความหมายให้ถูกก่อนเวลาหมด", survivalLives: n => `เหลือ ${n} ชีวิต`, survivalBonus: "+1.5 วิ", survivalLost: "เสียหนึ่งชีวิต",
      bingoTitle: "ได้ยินคำไหน ปั๊มช่องนั้น", bingoCopy: "ตารางมีความหมาย 9 ช่อง ฟังเสียงตัวอย่างในแต่ละรอบ แล้วปั๊มกระดาษที่ตรงกัน ต่อให้ครบสองเส้นก่อน", bingoStart: "เริ่มบิงโกจากเสียง", bingoPrompt: "ฟังเสียง แล้วแตะความหมายที่ตรง", bingoLines: (n, total) => `ต่อแล้ว ${n}/${total} เส้น`, bingoReplay: "ฟังอีกครั้ง", bingoHit: "ถูกแล้ว ปั๊มตราเรียบร้อย", bingoMiss: "ความหมายยังไม่ตรง ลองฟังอีกครั้ง", bingoWin: "BINGO! ครบสองเส้นแล้ว",
      reflexTitle: "จริงหรือหลอก ตัดสินใจให้ไว", reflexCopy: "ถ้าคำเป้าหมายกับความหมายด้านล่างตรงกันให้แตะ “ตรงกัน” ถ้าไม่ตรงให้แตะ “ไม่ตรงกัน” ตอบผิดเสีย 1 วินาที", reflexStart: "เริ่มแฟลช 25 วินาที", reflexPrompt: "คำกับความหมายคู่นี้ตรงกันไหม?", reflexTrue: "ตรงกัน", reflexFalse: "ไม่ตรงกัน", reflexCorrect: "ตัดสินถูก", reflexWrong: "มองสลับ · เสีย 1 วินาที",
      speedPrompt: "เลือกความหมายที่ถูก", tonePrompt: "เมื่อดูความสัมพันธ์และสถานการณ์ ประโยคนี้แสดงระดับภาษาใด?", polishPrompt: "ความหมายเดิม ประโยคไหนเหมาะกับความสัมพันธ์และสถานการณ์นี้ที่สุด?", sourceRisk: "ก่อนปรับ · ยังไม่เข้ากับความสัมพันธ์และสถานการณ์",
      correct: "ถูกต้อง", wrong: "ลองดูอีกครั้ง", toneCorrect: grade => `คำตอบคือ ${grade}`, toneWrong: grade => `ประโยคนี้จริง ๆ คือ ${grade}`,
      polishCorrect: "เลือกได้เหมาะสม", polishWrong: "ประโยคนี้ไม่เหมาะกับความสัมพันธ์และสถานการณ์ปัจจุบัน", riskTag: "ควรดูสถานการณ์และความสัมพันธ์ก่อนใช้",
      contextSetting: "สถานการณ์", contextRelationship: "ความสัมพันธ์", contextMissing: "หากไม่มีความสัมพันธ์หรือสถานการณ์ จะตัดสินระดับที่เหมาะสมเพียงระดับเดียวไม่ได้",
      recommendation: (grade, why) => `สถานการณ์นี้แนะนำ ${grade}: ${why}`,
      audioLoading: "กำลังค้นหาชุดเสียงเพื่อเรียนในเครื่อง…", audioUnavailable: level => `ยังไม่ได้ติดตั้งชุดเสียงเพื่อเรียน L${level} จึงเปิดเสียงตัวอย่างชัดเจนไม่ได้`, audioFailed: "โหลดเสียงไม่สำเร็จ โปรดตรวจชุดเสียงแล้วลองอีกครั้ง",
      installPack: level => `ติดตั้งชุดเสียง L${level}`, useText: "ใช้โหมดข้อความก่อน", textPrompt: "ดูคำแล้วเลือกความหมายที่ถูก", textFallbackReady: "เปลี่ยนเป็นโหมดดูคำแล้ว ข้อนี้ยังเล่นต่อได้",
      gradeLockPrompt: grade => `ประโยคใดใช้ระดับ ${grade} และสื่อความหมายด้านบนได้ตรง?`, gradeLockCorrect: grade => `ล็อก ${grade} แล้ว`,
      sceneListenPrompt: grade => `ฟังสำนวนระดับ ${grade} แล้วเลือกว่ากำลังสื่ออะไร`, sceneListenHint: "แตะปุ่มเล่นด้านบนเพื่อฟังซ้ำ แล้วแตะสถานการณ์ด้านล่างเพื่อตอบ", sceneCorrect: "เลือกสถานการณ์ถูกแล้ว",
      shiftPrompt: (from, to) => `เปลี่ยนจาก ${from} ไปเป็น ${to} ที่เหมาะกับสถานการณ์นี้`, shiftCorrect: grade => `เปลี่ยนเป็น ${grade} แล้ว`,
      voicePrompt: "ดูความหมาย แล้วพูดคำเป้าหมาย", voiceHint: "ฟังเสียงตัวอย่างก่อน แตะไมค์แล้วพูดให้ครบ ความตรงของคำถอดเสียงสุดท้ายต้องถึง 78 จึงพังประตู", voiceDemo: "ฟังเสียงตัวอย่างเพื่อเรียน", voiceStart: "เริ่มพูด", voiceListening: "กำลังฟัง…", voicePass: score => `ระบบรู้จำตรง · ${score} คะแนน`, voiceRetry: score => `ตรง ${score} คะแนน · ลองให้ชัดขึ้น`, voiceNetwork: "อนุญาตรู้จำออนไลน์ครั้งนี้", voiceLocalMissing: "เครื่องไม่มีชุดรู้จำออฟไลน์ อนุญาตบริการเสียงของระบบออนไลน์เฉพาะครั้งนี้ได้", voiceUnavailable: "อุปกรณ์นี้สร้างคะแนนความตรงของคำถอดเสียงไม่ได้ โปรดใช้ Chrome/Safari ผ่าน HTTPS", voiceHeard: value => `คำถอดเสียง: ${value}`,
      monsterStage: (n, total) => `ตัวที่ ${n}/${total}`, monsterPlayer: "HP คุณ", monsterCrest: "ยันต์ใจกล้า", monsterEnemy: "HP มอนสเตอร์", monsterBoss: "HP บอส", monsterPrompt: "พูดคำเป้าหมายเพื่อโจมตี", monsterQuestionTag: "โจทย์เสียง", monsterSigil: "เสียง", monsterRule: "ยิ่งพูดถูกเร็ว ดาเมจยิ่งแรง", monsterPower: value => `คาดว่า ${value} ดาเมจ`, monsterReady: "ดูท่าคู่ต่อสู้ แล้วเลือกวิธีบุก", monsterHear: "ฟังคำเป้าหมาย", monsterTime: value => `${value} วิ`, monsterChooseTimer: "เลือกท่า",
      monsterVoice: "โจมตีด้วยเสียง", monsterVoiceHint: "คำถอดเสียงตรง + ความเร็ว = ดาเมจ", monsterListening: "กำลังฟังคุณพูด…", monsterJudging: value => value ? `คำถอดเสียง: ${value} · กำลังเทียบ` : "กำลังเทียบคำถอดเสียง…", monsterVoicePass: score => `ระบบรู้จำตรง · ${score} คะแนน`, monsterVoiceFail: score => `ตรง ${score} คะแนน · มอนสเตอร์สวนกลับ`, monsterVoiceGradeLabel: "ความตรงของคำถอดเสียง", monsterVoiceGrades: { perfect: "ตรงสูง", great: "ตรงดี", pass: "ระบบรู้จำตรง" }, monsterVoiceGradeBonus: value => `ดาเมจความตรง +${value}`, monsterNetwork: "อนุญาตรู้จำออนไลน์ครั้งนี้", monsterFallback: "ถ้าใช้ไมค์ไม่ได้ แตะความหมายด้านล่างเพื่อสู้ต่อ", monsterUnavailable: "อุปกรณ์นี้ยังใช้การรู้จำเสียงไม่ได้ ใช้ท่าคำศัพท์ด้านล่างต่อได้", monsterLocalMissing: "เครื่องไม่มีชุดรู้จำออฟไลน์ อนุญาตบริการเสียงของระบบออนไลน์เฉพาะครั้งนี้ได้", monsterFxOn: "เปิดเสียงต่อสู้", monsterFxOff: "ปิดเสียงต่อสู้",
      monsterReadyTitle: "เลือกเส้นทาง แล้วเข้าสู่ศึกเสียงหลายรอบ", monsterReadyCopy: "เนื้อเรื่องเดิมมี 6 บท 36 ด่าน และทัวร์ร้อยมอนสเตอร์เพิ่มอีก 10 เขต 100 ตัว ทุกตัวมีสกิลและของติดตัว ต้องโจมตีหลายครั้ง ต่อคอมโบ อัปเลเวล และบันทึกผลกลับคลังคำศัพท์", monsterReadyRules: ["ดูสัญญาณสกิลแล้วเลือกท่าแก้ทาง", "โจมตีหลายครั้งและต่อคอมโบ", "ผ่านด่านแล้วอัปเลเวลและบันทึกคำ"], monsterReadyDetails: "วิธีเล่น การเติบโต และเกณฑ์ตัดสิน", monsterReadyOpponent: "คู่ต่อสู้ด่านนี้", monsterStart: "เข้าสู่ด่านปัจจุบัน",
      monsterCampaignEyebrow: level => `ศึกเสียงในมหาวิทยาลัย · บท ${level}`, monsterCampaignHook: "6 บท · 36 ตัว · 36 ด่านแยกกัน", monsterCampaignLoot: "ชนะคู่ต่อสู้ใหม่เพื่ออัปเลเวล ผ่านด่านเพื่อสะสมพลังเสริม", monsterStartHint: "เล่นต่อจากด่านที่ยังไม่ผ่านในบทนี้", monsterJudgeNote: "ระบบตัดสินจากคำถอดเสียงสุดท้าย ไม่ใช่คะแนนการออกเสียงจากครูเจ้าของภาษา", monsterCombo: "คอมโบ", monsterMomentum: "พลังคอมโบ", monsterMomentumTiers: { calm: "อุ่นเครื่อง", heat: "คอมโบร้อนแรง", fever: "ทั้งสนามเดือด" }, monsterChallenge: "พูดถูกใน 3 วิ รับคริติคอล", monsterEntryBoss: "บอสปรากฏตัว", monsterEntryElite: "สกิลชั้นยอดเริ่มทำงาน", monsterEntryRival: "คู่ต่อสู้ใหม่", monsterElite: "ชั้นยอด", monsterImpactLabels: { hit: "โจมตีโดน", critical: "คริติคอลแม่นยำ", burst: "ท่าไม้ตายกระดาษ", shield: "ทำลายโล่", down: "ปราบสำเร็จ", counter: "มอนสเตอร์สวนกลับ" }, monsterYou: "คุณ", monsterRoute: "เส้นทาง 6 ด่านของบทนี้", monsterCampaignMap: "แผนที่มหาวิทยาลัย 36 ด่าน", monsterChapter: level => `บท L${level}`, monsterChapterProgress: value => `${value}/${MONSTERS_PER_CHAPTER}`, monsterGlobalStage: value => `ด่าน ${value}/${MONSTER_CONFIGS.length}`, monsterCombatLevel: value => `นักสู้ Lv.${value}`, monsterEnemyLevel: value => `ด่าน Lv.${value}`, monsterLevelUp: value => `ผ่านด่าน · นักสู้ Lv.${value}`, monsterUpgradeRank: value => `พลังเสริมระดับ ${value}`, monsterComboDamage: value => `คอมโบ ×${value.toFixed(2)}`, monsterDamageFormula: "(ดาเมจตามความเร็ว + โบนัสเลเวล) × คอมโบ × พลังเสริม แล้วคำนวณสกิล", monsterFirstMission: "รอบแรก", monsterFirstSteps: "ดูสัญญาณ → เลือกท่า → ฟัง → พูด", monsterLearningGain: "ความคืบหน้าคำศัพท์ +1", monsterLearningReview: "เพิ่มเข้าคิวคำที่พลาดแล้ว", monsterCutInKicker: "พลังเสียงทะลุขีด", monsterCutInTitle: "พุ่งคลื่นเสียง",
      monsterModeTitle: "เลือกเส้นทางล่า", monsterModeStory: "เนื้อเรื่อง 36", monsterModeStoryHint: "แผนที่เรียน 6 บท", monsterModeRally: "ทัวร์ร้อยตัว", monsterModeRallyHint: "10 เขตสกิล", monsterRallyMap: "แผนที่ทัวร์ร้อยมอนสเตอร์", monsterRallyZone: value => `เขตทัวร์ ${value}`, monsterRallyZoneProgress: value => `${value}/${MONSTERS_PER_RALLY_ZONE}`, monsterRallyStage: value => `ตัวที่ ${value}/${MONSTER_RALLY_CONFIGS.length}`, monsterRallyEyebrow: value => `ทัวร์ร้อยมอนสเตอร์ · เขต ${value}`, monsterRallyHook: "ทัวร์ 10 เขต · มอนสเตอร์มีสกิล", monsterRallyLoot: "ชนะแล้วปลดล็อกสารานุกรมถาวร พลังเสริมทบกันได้ถึงบอสท้ายเขต", monsterRallyStartHint: "เล่นต่อจากตัวที่ยังไม่ผ่านในเขตนี้", monsterRallyRoute: "เส้นทาง 10 ตัวของเขตนี้", monsterRallyRewardStreak: value => `ผ่านเขตนี้ ${value}/${MONSTERS_PER_RALLY_ZONE}`, monsterRallyVictory: "ผ่านครบสิบตัวของเขตนี้!", monsterRallyVictoryCopy: "ผ่านมอนสเตอร์ 10 ตัวของเขตนี้แล้ว เลเวล สารานุกรมร้อยตัว และความคืบหน้าคำศัพท์ถูกบันทึกไว้", monsterTotalCollection: (story, rally) => `เนื้อเรื่อง ${story}/${MONSTER_CONFIGS.length} · ทัวร์ ${rally}/${MONSTER_RALLY_CONFIGS.length}`,
      monsterSkillTitle: "สกิลชั้นยอด", monsterSkillActive: style => `ใช้เทิร์นนี้ · ใช้${style}แก้ทาง`, monsterSkillCooldown: turns => `ทำงานอีก ${turns} เทิร์น`, monsterSkillRecommended: style => `แก้ทาง: ${style}`, monsterSkillCounterBadge: "แก้ทางสกิล", monsterSkillCountered: (name, style) => `${style} แก้ทาง ${name}`, monsterSkillResisted: name => `${name} ลดดาเมจบางส่วน`, monsterSkillPunished: name => `${name} โจมตีซ้ำ`,
      monsterHeroPick: "เลือกคู่หูนักสู้เสียง", monsterHeroPickHint: "เปลี่ยนได้ก่อนเริ่ม และพรสวรรค์ของแต่ละคนมีผลต่อการบุกและรับจริง", monsterHeroNames: { captain: "หัวหน้าสายชัวร์", reporter: "นักข่าวสายไว", thai: "รุ่นพี่สายจังหวะ" }, monsterHeroTraits: { captain: "นิ่ง · เวลา +0.5 วิ", reporter: "ไว · โจมตี ×1.12 / รับ ×1.08", thai: "คุมจังหวะ · รับ ×0.78 / โจมตี ×0.94" },
      monsterArm: seconds => `ฟังโจทย์ · เริ่ม ${seconds} วิ`, monsterArmHint: "เปลี่ยนท่าได้ก่อน แตะปุ่มนี้แล้วจึงเล่นเสียงและเริ่มจับเวลา", monsterCueShort: "กำลังเล่นเสียงโจทย์", monsterCuePlaying: "กำลังเล่นเสียงตัวอย่างเพื่อเรียน จะเริ่มจับเวลาหลังเสียงจบ", monsterCueGrace: "เสียงจบแล้ว · เตรียมพูด", monsterCueFailed: "เสียงยังใช้ไม่ได้ ยังไม่เริ่มจับเวลา ลองใหม่ ดาวน์โหลดชุดเสียง หรือเลือกเล่นด้วยข้อความ", monsterGo: "เริ่มจับเวลาแล้ว แตะ “โจมตีด้วยเสียง” แล้วพูดคำเป้าหมาย",
      monsterTextStart: "เล่นด้วยข้อความ", monsterTextGo: "เริ่มโจทย์ข้อความ · เลือกความหมายหรือพูดคำตอบ", monsterRetryCue: "ลองเล่นเสียงอีกครั้ง",
      monsterTraits: { lantern: "จังหวะโคม: ทุก 3 ข้อเปิดช่องโหว่", lotus: "บัวไฟฟื้นตัว: ฟื้น 8 พลังเมื่อคุณพลาด", "kite-naga": "โล่ลม: ต้องทำลายโล่ 24 แต้มก่อน", "thunder-elephant": "จังหวะกลอง: ทุก 3 ข้อได้ดาเมจเพิ่ม", "ink-king": "คลั่ง: ครึ่งพลังแล้วเวลาสั้นลง", "twin-bell": "ระฆังคู่ก้อง: สั่นพ้องทุก 2 ข้อ" },
      monsterIntentTitle: "ท่าถัดไป", monsterIntents: { lantern: "พุ่งชนเงาโคม · ข้อที่ 3 ดาเมจเพิ่ม", lotus: "บัวไฟสวนกลับ · สวนกลับและฟื้นพลัง", "kite-naga": "โล่ลมหมุน · ทำลายโล่ก่อน", "thunder-elephant": "ช่องโหว่ตามจังหวะ · ข้อที่ 3 ดาเมจเพิ่ม", "ink-king": "ปีกหมึกกดสนาม · ครึ่งพลังแล้วคลั่ง", "twin-bell": "ระฆังคู่ก้อง · ตอบถูก +10 / พลาดเพิ่ม 8" },
      monsterChooseStyle: "เลือกท่าเพื่อเริ่ม", monsterChoosePower: "ท่าสมดุลพร้อม · ฟังเมื่อพร้อม", monsterStyleReady: name => `เลือก${name}แล้ว แตะ “ฟังโจทย์” เพื่อเริ่มเวลา`, monsterStyleStats: (seconds, damage) => `${seconds} วิ · โจมตี ${damage}`,
      monsterStyles: { rush: ["บุกเร็ว", "เวลาน้อยลง 2.5 วิ", "รับดาเมจ ×1.35"], steady: ["บุกมั่นคง", "เวลาและดาเมจสมดุล", "สมดุล"], guard: ["ตั้งรับ", "เวลาเพิ่ม 1.5 วิ", "รับดาเมจ ×0.5"] },
      monsterBurstCharge: (value, total) => `พลังใจ ${value}/${total}`, monsterBurstReady: "แตะเพื่อเตรียมท่าไม้ตาย", monsterBurstArmed: value => `เตรียมท่าไม้ตายแล้ว +${value}`, monsterBurstDisarmed: "เก็บท่าไม้ตายแล้ว", monsterBurstLost: "ท่าไม้ตายถูกขัดจังหวะ", monsterBurst: value => `ท่าไม้ตายกระดาษ +${value}`,
      monsterGuarded: value => `ตั้งรับลดดาเมจ ${value}`, monsterRushPenalty: value => `ความเสี่ยงบุกเร็ว +${value}`,
      monsterShield: value => `โล่ ${value}`, monsterShieldBreak: value => `โล่รับดาเมจ ${value}`, monsterRegen: value => `มอนสเตอร์ฟื้น +${value}`, monsterRhythm: value => `คริติคอลตามจังหวะ +${value}`, monsterEnraged: "มอนสเตอร์เข้าสู่โหมดคลั่งเร็ว!", monsterResonance: value => `เจาะเสียงสะท้อน +${value}`, monsterResonanceCounter: value => `เสียงก้องโจมตีเพิ่ม +${value}`, monsterHeroGuarded: value => `คู่หูลดดาเมจ ${value}`, monsterHeroRisk: value => `ความเสี่ยงจากคู่หู +${value}`, monsterHeroPower: value => `พรสวรรค์คู่หู +${value}`,
      monsterRewardTitle: "ชนะแล้ว! เพิ่มพลังอีกขั้น", monsterRewardCopy: "ชนะคู่ต่อสู้ใหม่ครั้งแรกเพื่อเพิ่มเลเวลถาวร เล่นซ้ำยังรับพลังเสริมรอบนี้ได้ พลังเสริมทบกันและเก็บไว้เมื่อเล่นต่อ แต่รีเซ็ตเมื่อจบการเดินทาง", monsterRewards: { power: ["สติกเกอร์พลัง", "ตัวคูณดาเมจรอบนี้ +10%"], guard: ["ผ้าพันแผลพลัง", "HP สูงสุด +12 และฟื้น 18"], tempo: ["ที่คั่นเวลา", "ทุกข้อมีเวลาเพิ่ม 0.5 วิ"] }, monsterRewardPick: "เลือกพลังเสริม", monsterRewardHp: (value, max) => `พลังเดินทาง ${value}/${max}`, monsterRewardStreak: value => `ความคืบหน้าบท ${value}/${MONSTERS_PER_CHAPTER}`, monsterRewardNext: "ด่านถัดไป", monsterExitConfirm: "บันทึกการเดินทางในเครื่องแล้ว กลับมาเล่นต่อได้โดยเก็บ HP ทั้งสองฝ่าย คอมโบ และพลังเสริม ข้อที่ยังไม่จบจะเริ่มใหม่ ต้องการออกหรือไม่?",
      monsterResumeTitle: "การเดินทางยังรอคุณอยู่", monsterResume: "เล่นต่อ", monsterResumeStats: (hp, max, ranks) => `HP ${hp}/${max} · พลังเสริม ${ranks} ขั้น`, monsterResumeNote: "ต่อจากรอบที่ตัดสินผลล่าสุด · เก็บเฉพาะเครื่องนี้", monsterReplaceConfirm: "เริ่มใหม่จะแทนที่ HP และพลังเสริมของการเดินทางที่ยังไม่จบ สารานุกรมและความคืบหน้าคำศัพท์ยังอยู่ ต้องการเริ่มใหม่หรือไม่?", monsterStorageWarning: "ขณะนี้บันทึกถาวรไม่ได้ หากปิดหน้าอาจสูญเสียการเดินทางรอบนี้ โปรดตรวจสอบพื้นที่เก็บข้อมูล ยังต้องการออกหรือไม่?", monsterGrowthNote: "เลเวลเพิ่มเมื่อชนะคู่ต่อสู้ใหม่ครั้งแรก · ทั้งสองโหมดใช้เลเวลร่วมกัน", monsterSaveLocal: "บันทึกรอบนี้ในเครื่องแล้ว", monsterSaveMemory: "เก็บชั่วคราว ปิดหน้าอาจสูญหาย",
      monsterHit: (damage, seconds, critical, comboMultiplier) => `${seconds} วิ · ${critical ? "คริติคอล" : "โจมตีโดน"} ${damage} ดาเมจ${comboMultiplier > 1 ? ` · คอมโบ ×${comboMultiplier.toFixed(2)}` : ""}`, monsterCounter: damage => `ตอบผิด! มอนสเตอร์สวนกลับ ${damage}`, monsterTimeout: damage => `หมดเวลา! มอนสเตอร์สวนกลับ ${damage}`, monsterReveal: (target, meaning) => `คำตอบที่ถูก: ${target} · ${meaning}`, monsterDown: (name, bonus) => `ปราบ ${name} แล้ว! โบนัส ${bonus} คะแนน`, monsterVictory: "ผ่านครบ 6 ด่านของบทนี้!", monsterDefeat: "พลังหมด", monsterVictoryCopy: "ผ่านครบ 6 ด่านของบทการเรียนนี้แล้ว เลเวลนักสู้ สารานุกรม และความคืบหน้าคำศัพท์ถูกบันทึกไว้", monsterDefeatCopy: "คำที่พลาดในรอบนี้เข้าสู่คิวทบทวนแล้ว ฝึกให้คล่องแล้วกลับมาเล่นต่อจากด่านเดิม",
      currentRegister: grade => `ระดับปัจจุบัน ${grade}`, targetRegister: grade => `ระดับเป้าหมาย ${grade}`, tapToHear: "แตะปุ่มเสียงด้านขวาเพื่อฟัง แล้วแตะประโยคเพื่อตอบ", previewOption: letter => `ฟังตัวเลือก ${letter}`,
      grades: { S5: ["S5", "สุภาพมาก"], S4: ["S4", "สุภาพ"], S3: ["S3", "กันเอง"], S2: ["S2", "พูดตรง"], S1: ["S1", "คลี่คลายความขัดแย้ง"] },
      monsterRoundKicker: "สรุปรอบ", monsterRoundAttack: value => `พลังโจมตีรวม ${value}`, monsterRoundCounter: value => `ได้รับ ${value} ดาเมจ`, monsterRoundSpeedLevel: (speed, level) => `ความเร็ว ${speed} + เลเวล ${level}`, monsterRoundFactor: (label, value) => `${label} ×${value}`, monsterRoundCombo: value => `คอมโบ ×${value}`, monsterRoundUpgrade: value => `พลังเสริม ×${value}`, monsterRoundHero: value => `คู่หู ×${value}`, monsterRoundSkill: value => `สกิลมอนสเตอร์ ×${value}`, monsterRoundShield: value => `โล่ -${value}`, monsterRoundBody: value => `HP มอนสเตอร์ -${value}`, monsterRoundEnemyBase: value => `ดาเมจมอนสเตอร์ ${value}`, monsterRoundTime: (seconds, label) => `${seconds} วิ · ${label}`, monsterRoundReasons: { timeout: "หมดเวลา", voice: "คำถอดเสียงไม่ตรง", choice: "เลือกความหมายไม่ตรง" }, monsterRoundVoice: score => `คำถอดเสียงตรง ${score}`, monsterRoundTap: "แตะจอเพื่อข้าม",
      done: "จบเกมแล้ว", newBest: "ทำสถิติใหม่ในเครื่อง!", keep: "เล่นอีกครั้งแล้วจะตอบได้ไวขึ้น", statScore: "คะแนนรอบนี้", statRight: "ตอบถูก", statCombo: "คอมโบสูงสุด", replay: "เล่นอีกครั้ง",
      noData: "ชุดฝึกระดับภาษากำลังตรวจสอบ แล้วจะเปิดให้เล่น", wordFallback: "กำลังโหลดคลังคำศัพท์ ลองใหม่อีกครั้ง", answerLetters: ["A", "B", "C", "D", "E"]
    }
  };

  let game = null;
  let timerId = 0;
  let activeTransition = null;
  let hallExpanded = false;
  const pendingIds = new Set();
  let voiceAudio = null;
  let wordAudioRequest = 0;
  let orientationHintDismissed = false;
  let monsterFxAudioContext = null;
  let monsterStatusObserver = null;

  const q = selector => document.querySelector(selector);
  const esc = value => String(value == null ? "" : value).replace(/&/gu, "&amp;").replace(/</gu, "&lt;").replace(/>/gu, "&gt;").replace(/"/gu, "&quot;").replace(/'/gu, "&#039;");
  const direction = () => document.body.classList.contains("dir-th-zh") ? "th-zh" : "zh-th";
  const locale = () => direction() === "zh-th" ? "zh" : "th";
  const copy = () => ({ ...COPY[locale()],
    monsterBurstReady: locale() === "zh" ? "发动双人合击" : "เตรียมท่าคู่หู",
    monsterBurstCharge: (value, total) => locale() === "zh" ? `搭档默契 ${value}/${total}` : `จังหวะคู่หู ${value}/${total}`,
    monsterBurstArmed: value => locale() === "zh" ? `合击就绪 +${value + campusEffects().burstBonus}` : `ท่าคู่พร้อม +${value + campusEffects().burstBonus}`,
    monsterBurst: value => locale() === "zh" ? `双人合击 +${value}` : `ท่าคู่หู +${value}`
  });
  const vibrate = pattern => { try { navigator.vibrate && navigator.vibrate(pattern); } catch (_) {} };
  const shouldReduceMotion = () => {
    try {
      if (globalThis.HUILAISHI_MOTION?.shouldReduce?.()) return true;
      return Boolean(globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
    } catch (_) { return false; }
  };

  const MONSTER_FX_STORAGE_KEY = "huilaishi-arcade-monster-fx";

  function isMonsterFxEnabled() {
    try { return globalThis.HUILAISHI_STORAGE?.getItem?.(MONSTER_FX_STORAGE_KEY) !== "off"; }
    catch (_) { return true; }
  }

  function syncMonsterFxToggle() {
    const button = q("[data-monster-fx-toggle]");
    if (!button) return;
    const enabled = isMonsterFxEnabled();
    const label = enabled ? copy().monsterFxOn : copy().monsterFxOff;
    button.classList.toggle("is-muted", !enabled);
    button.setAttribute("aria-pressed", String(enabled));
    button.setAttribute("aria-label", label);
    const value = button.querySelector("span");
    if (value) value.textContent = enabled ? "FX" : "FX ×";
  }

  function toggleMonsterFx() {
    const enabled = !isMonsterFxEnabled();
    try { globalThis.HUILAISHI_STORAGE?.setItem?.(MONSTER_FX_STORAGE_KEY, enabled ? "on" : "off"); } catch (_) {}
    syncMonsterFxToggle();
    if (enabled) playMonsterImpactSound("toggle");
    vibrate(enabled ? 9 : 5);
  }

  function emitMonsterImpactSound(context, kind) {
    const now = context.currentTime + .006;
    const critical = ["critical", "burst", "down"].includes(kind);
    const counter = kind === "counter";
    const toggle = kind === "toggle";
    const master = context.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(toggle ? .035 : critical ? .105 : .075, now + .008);
    master.gain.exponentialRampToValueAtTime(0.0001, now + (toggle ? .11 : critical ? .28 : .2));
    master.connect(context.destination);

    const thump = context.createOscillator();
    const thumpGain = context.createGain();
    thump.type = counter ? "sawtooth" : "triangle";
    thump.frequency.setValueAtTime(toggle ? 430 : counter ? 105 : critical ? 132 : 118, now);
    thump.frequency.exponentialRampToValueAtTime(toggle ? 620 : counter ? 48 : critical ? 54 : 62, now + (toggle ? .09 : .18));
    thumpGain.gain.setValueAtTime(toggle ? .42 : 1, now);
    thumpGain.gain.exponentialRampToValueAtTime(.0001, now + (toggle ? .1 : .2));
    thump.connect(thumpGain).connect(master);
    thump.start(now);
    thump.stop(now + (toggle ? .11 : .22));

    if (!toggle) {
      const length = Math.max(1, Math.floor(context.sampleRate * (critical ? .11 : .075)));
      const buffer = context.createBuffer(1, length, context.sampleRate);
      const samples = buffer.getChannelData(0);
      for (let index = 0; index < samples.length; index += 1) samples[index] = (Math.random() * 2 - 1) * (1 - index / samples.length);
      const snap = context.createBufferSource();
      const snapFilter = context.createBiquadFilter();
      const snapGain = context.createGain();
      snap.buffer = buffer;
      snapFilter.type = "bandpass";
      snapFilter.frequency.value = counter ? 420 : critical ? 1120 : 860;
      snapFilter.Q.value = .72;
      snapGain.gain.setValueAtTime(critical ? .85 : .62, now);
      snapGain.gain.exponentialRampToValueAtTime(.0001, now + (critical ? .13 : .09));
      snap.connect(snapFilter).connect(snapGain).connect(master);
      snap.start(now);
      snap.stop(now + (critical ? .13 : .09));
    }

    if (kind === "burst" || kind === "down") {
      const accent = context.createOscillator();
      const accentGain = context.createGain();
      accent.type = "sine";
      accent.frequency.setValueAtTime(kind === "down" ? 172 : 248, now + .045);
      accent.frequency.exponentialRampToValueAtTime(kind === "down" ? 62 : 116, now + .25);
      accentGain.gain.setValueAtTime(.0001, now);
      accentGain.gain.linearRampToValueAtTime(.62, now + .052);
      accentGain.gain.exponentialRampToValueAtTime(.0001, now + .27);
      accent.connect(accentGain).connect(master);
      accent.start(now);
      accent.stop(now + .28);
    }
  }

  function playMonsterImpactSound(kind = "hit") {
    if (!isMonsterFxEnabled()) return;
    try {
      const AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!AudioContext) return;
      monsterFxAudioContext ||= new AudioContext();
      const context = monsterFxAudioContext;
      const emit = () => emitMonsterImpactSound(context, kind);
      if (context.state === "suspended") context.resume().then(emit).catch(() => {});
      else emit();
    } catch (_) {}
  }

  function monsterActionPoses(actionFrame, counter = false, defeated = false) {
    let hero = "idle";
    let monster = defeated ? "hit" : "idle";
    if (actionFrame === "hero-windup") hero = "windup";
    else if (actionFrame === "hero-strike") hero = "strike";
    else if (actionFrame === "enemy-windup") monster = "windup";
    else if (actionFrame === "enemy-strike") monster = "strike";
    else if (actionFrame === "contact") {
      hero = counter ? "hit" : "strike";
      monster = counter ? "strike" : "hit";
    } else if (actionFrame === "recoil") {
      hero = counter ? "dodge" : "recover";
      monster = counter ? "idle" : "hit";
    } else if (actionFrame === "recover") hero = "recover";
    else if (actionFrame === "run") hero = "run";
    else if (actionFrame === "idle" && defeated && !counter) hero = "victory";
    return { hero, monster };
  }

  function setMonsterActionFrame(world, actionFrame) {
    if (!world) return;
    world.dataset.actionFrame = actionFrame;
    const hero = currentMonsterHero(world.dataset.monsterHero);
    const monster = ALL_MONSTER_CONFIGS.find(item => item.id === world.dataset.monsterId) || currentMonster();
    const poses = monsterActionPoses(actionFrame, world.dataset.impactKind === "counter", world.dataset.monsterState === "down");

    const applyPose = (selector, fallbackSelector, config, pose) => {
      const image = world.querySelector(selector);
      if (!image) return;
      // Every request cancels the preceding one, even when returning to the same idle image.
      const token = String(++monsterSpriteSwapSequence);
      image.dataset.spriteSwap = token;
      image._monsterPoseCleanup?.();
      const fallback = world.querySelector(fallbackSelector);
      const avatar = image.closest(".arcade-player-avatar,.arcade-monster-avatar");
      const loading = avatar?.getAttribute("data-sprite-loading") === "true";
      const previousSource = (loading ? fallback?.getAttribute("src") : image.getAttribute("src")) || config?.art || "";
      const previousPose = (loading ? fallback?.dataset.spritePose : image.dataset.spritePose) || "idle";
      const source = config?.frames?.[pose] || config?.frames?.idle || config?.art;
      const current = () => image.isConnected && image.dataset.spriteSwap === token;
      const restore = () => {
        if (!current()) return;
        image.setAttribute("src", previousSource);
        image.dataset.spritePose = previousPose;
        avatar?.removeAttribute("data-sprite-loading");
      };
      if (!source) { restore(); return; }
      if (image.getAttribute("src") === source && image.complete && image.naturalWidth > 0) {
        image.dataset.spritePose = pose;
        avatar?.removeAttribute("data-sprite-loading");
        if (fallback) { fallback.setAttribute("src", source); fallback.dataset.spritePose = pose; }
        return;
      }

      let staged = MONSTER_ART_PRELOADS.get(source);
      if (!staged || (staged.complete && !staged.naturalWidth)) {
        staged = new Image();
        staged.decoding = "async";
        staged.src = source;
        MONSTER_ART_PRELOADS.set(source, staged);
      }
      const commit = () => {
        if (!current()) return;
        if (fallback) {
          fallback.setAttribute("src", previousSource);
          fallback.dataset.spritePose = previousPose;
          avatar?.setAttribute("data-sprite-loading", "true");
        }
        let settled = false;
        const clean = () => {
          image.removeEventListener("load", onLoad);
          image.removeEventListener("error", onError);
        };
        const reveal = success => {
          if (settled) return;
          settled = true;
          clean();
          if (!current()) return;
          if (!success) { restore(); return; }
          const paint = () => {
            if (!current()) return;
            image.dataset.spritePose = pose;
            avatar?.removeAttribute("data-sprite-loading");
            if (fallback) { fallback.setAttribute("src", source); fallback.dataset.spritePose = pose; }
          };
          if (typeof globalThis.requestAnimationFrame === "function") globalThis.requestAnimationFrame(paint);
          else paint();
        };
        const onLoad = () => reveal(image.naturalWidth > 0);
        const onError = () => reveal(false);
        image._monsterPoseCleanup = clean;
        image.addEventListener("load", onLoad);
        image.addEventListener("error", onError);
        image.setAttribute("src", source);
        if (typeof image.decode === "function") image.decode().then(() => reveal(true)).catch(() => {
          if (image.complete && !image.naturalWidth) reveal(false);
        });
        else if (image.complete) reveal(image.naturalWidth > 0);
      };
      if (staged.complete && staged.naturalWidth > 0) commit();
      else {
        const stagedLoad = () => { stagedClean(); commit(); };
        const stagedError = () => { stagedClean(); restore(); };
        const stagedClean = () => {
          staged.removeEventListener("load", stagedLoad);
          staged.removeEventListener("error", stagedError);
        };
        image._monsterPoseCleanup = stagedClean;
        staged.addEventListener("load", stagedLoad);
        staged.addEventListener("error", stagedError);
      }
    };
    applyPose(".arcade-player-sprite", ".arcade-player-echo", hero, poses.hero);
    applyPose(".arcade-monster-sprite", ".arcade-monster-echo", monster, poses.monster);
  }

  function monsterImpactTimeline(counter = false, reduced = false) {
    if (reduced) return [[0, "contact"], [700, "idle"]];
    return [[0, counter ? "enemy-windup" : "hero-windup"],
      [130, counter ? "enemy-strike" : "hero-strike"], [290, "contact"],
      [400, "recoil"], [660, "recover"], [900, "idle"]];
  }

  function scheduleMonsterImpactFeedback(world, kind, pattern) {
    if (!world) return;
    const sequence = String(Number(world.dataset.impactSequence || 0) + 1);
    world.dataset.impactSequence = sequence;
    const reduced = shouldReduceMotion();
    const current = () => world.isConnected && q(".arcade-monster-world") === world && world.dataset.impactSequence === sequence;
    for (const [delay, frame] of monsterImpactTimeline(kind === "counter", reduced)) {
      const step = () => {
        if (!current()) return;
        delete world.dataset.hitStop;
        if (frame === "contact" && !reduced) world.dataset.hitStop = "true";
        setMonsterActionFrame(world, frame);
      };
      if (delay === 0) step(); else schedule(step, delay);
    }
    schedule(() => {
      if (!current()) return;
      playMonsterImpactSound(kind);
      vibrate(pattern);
    }, reduced ? 0 : 290);
  }

  function orientationCopy() { return ORIENTATION_COPY[locale()]; }

  function ensureArcadeOrientationHint() {
    const sheet = q("#arcade-sheet");
    if (!sheet) return null;
    let hint = q("#arcade-rotate-hint");
    if (!hint) {
      hint = document.createElement("div");
      hint.id = "arcade-rotate-hint";
      hint.className = "arcade-rotate-hint";
      hint.setAttribute("role", "status");
      hint.setAttribute("aria-live", "polite");
      hint.innerHTML = `<span class="arcade-rotate-phone" aria-hidden="true"><i></i></span><span class="arcade-rotate-copy"><b></b><small></small></span><button type="button" data-arcade-rotate-dismiss></button>`;
      sheet.append(hint);
      hint.querySelector("[data-arcade-rotate-dismiss]")?.addEventListener("click", () => {
        orientationHintDismissed = true;
        syncArcadeOrientationHint();
      });
    }
    const c = orientationCopy();
    hint.setAttribute("aria-label", c.label);
    hint.querySelector(".arcade-rotate-copy b").textContent = c.title;
    hint.querySelector(".arcade-rotate-copy small").textContent = c.body;
    hint.querySelector("[data-arcade-rotate-dismiss]").textContent = c.dismiss;
    return hint;
  }

  function syncArcadeOrientationHint() {
    const hint = q("#arcade-rotate-hint");
    const sheet = q("#arcade-sheet");
    if (!hint || !sheet) return;
    const portrait = Number(globalThis.innerHeight || 0) > Number(globalThis.innerWidth || 0);
    const compact = Math.min(Number(globalThis.innerWidth || 0), Number(globalThis.innerHeight || 0)) <= 700;
    const monsterReady = sheet.dataset.arcadePhase === "monster-ready";
    hint.hidden = !document.body?.classList?.contains?.("arcade-game-active") || !portrait || !compact || orientationHintDismissed || monsterReady;
    if (document.body?.classList?.contains?.("arcade-game-active")) resetArcadeViewportScroll();
  }

  function resetArcadeViewportScroll() {
    const shell = q(".phone-shell");
    if (!shell) return;
    shell.scrollTop = 0;
    shell.scrollLeft = 0;
  }

  function setGameOrientation(active) {
    document.body?.classList?.toggle?.("arcade-game-active", Boolean(active));
    resetArcadeViewportScroll();
    try { globalThis.HuilaishiNative?.setGameLandscape?.(Boolean(active)); } catch (_) {}
    try {
      const orientation = globalThis.screen?.orientation;
      if (active && typeof orientation?.lock === "function") {
        Promise.resolve(orientation.lock("landscape")).catch(() => {});
      } else if (!active && typeof orientation?.unlock === "function") {
        orientation.unlock();
      }
    } catch (_) {}
    globalThis.requestAnimationFrame?.(() => {
      resetArcadeViewportScroll();
      syncArcadeOrientationHint();
      globalThis.requestAnimationFrame?.(resetArcadeViewportScroll);
    });
  }

  function monsterComboMultiplier(streak = 0) {
    const combo = Math.min(MONSTER_COMBO_CAP, Math.max(0, Math.floor(Number(streak) || 0)));
    return Number((1 + combo * MONSTER_COMBO_STEP).toFixed(2));
  }

  function monsterPowerMultiplier(rank = 0) {
    return 1 + Math.max(0, Math.floor(Number(rank) || 0)) * MONSTER_POWER_STEP;
  }

  function monsterDamageParts(remainingMs, streak = 0, turnMs = MONSTER_TURN_MS, combatLevel = 1, powerRank = 0) {
    const safeTurnMs = Math.max(1000, Number(turnMs) || MONSTER_TURN_MS);
    const remainingRatio = Math.max(0, Math.min(1, (Number(remainingMs) || 0) / safeTurnMs));
    const speedDamage = 9 + Math.round(remainingRatio * 7);
    const levelDamage = Math.min(10, Math.max(0, Math.floor(((Number(combatLevel) || 1) - 1) * .36)));
    const comboMultiplier = monsterComboMultiplier(streak);
    const powerMultiplier = monsterPowerMultiplier(powerRank);
    const baseDamage = Math.max(1, Math.round((speedDamage + levelDamage) * comboMultiplier * powerMultiplier));
    return { speedDamage, levelDamage, comboMultiplier, powerMultiplier, baseDamage };
  }

  function monsterDamage(remainingMs, streak = 0, turnMs = MONSTER_TURN_MS, combatLevel = 1, powerRank = 0) {
    return monsterDamageParts(remainingMs, streak, turnMs, combatLevel, powerRank).baseDamage;
  }

  function countBingoLines(markedIndexes) {
    const marked = markedIndexes instanceof Set ? markedIndexes : new Set(markedIndexes || []);
    return BINGO_LINES.reduce((total, line) => total + (line.every(index => marked.has(index)) ? 1 : 0), 0);
  }

  function reflexPoints(reactionMs, streak = 0) {
    const elapsed = Math.max(0, Math.min(2500, Number(reactionMs) || 0));
    const speedBonus = Math.round((1 - elapsed / 2500) * 180);
    const comboBonus = Math.min(160, Math.max(0, Math.floor(Number(streak) || 0)) * 20);
    return 120 + speedBonus + comboBonus;
  }

  function activeRegisterGrade() {
    const guide = window.HUILAISHI_REGISTER_GUIDE;
    const fallback = GRADES.includes(guide?.defaultGrade) ? guide.defaultGrade : "S4";
    try {
      const raw = globalThis.HUILAISHI_STORAGE?.getItem(`thai-vibe-mode-${direction()}`);
      if (raw === null || raw === undefined || raw === "") return fallback;
      const saved = Number(raw);
      return Number.isInteger(saved) && saved >= 0 && saved < GRADES.length ? GRADES[saved] : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function activeGameLink() {
    const grade = activeRegisterGrade();
    const policy = window.HUILAISHI_REGISTER_GUIDE?.levels?.[grade]?.gamePolicy || {};
    const allowedGames = [...new Set((policy.allowed || []).flatMap(item => POLICY_GAME_MAP[item] || []))];
    let recommendedGame = "match";
    if (policy.requireSafeRewrite && allowedGames.includes("polish")) recommendedGame = "polish";
    else if (policy.allowSpeak === false && allowedGames.includes("tone")) recommendedGame = "tone";
    else if (allowedGames.includes("voice")) recommendedGame = "voice";
    else if (allowedGames.includes("audio")) recommendedGame = "audio";
    else if (allowedGames.length) [recommendedGame] = allowedGames;
    return { grade, policy, allowedGames, recommendedGame };
  }

  function celebrate({ isBest, score, streak }) {
    if (typeof globalThis.confetti !== "function" || score < 250 || (!isBest && score < 900)) return;
    if (shouldReduceMotion()) return;
    globalThis.confetti({
      particleCount: isBest ? 52 : 34,
      spread: 62,
      startVelocity: 27,
      decay: .92,
      gravity: .86,
      scalar: .76,
      drift: streak >= 5 ? .08 : 0,
      origin: { x: .5, y: .72 },
      colors: ["#b9ed55", "#26c7b8", "#ffb62f", "#8d8fff", "#ff5967"],
      disableForReducedMotion: true,
      useWorker: false
    });
  }

  function stopVoiceAudio() {
    if (!voiceAudio) return;
    voiceAudio.pause();
    voiceAudio.currentTime = 0;
    voiceAudio = null;
  }

  function shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function corpus() {
    return [
      ...(window.HUILAISHI_VOCAB_L12 || []),
      ...(window.HUILAISHI_VOCAB_L34 || []),
      ...(window.HUILAISHI_VOCAB_L56 || []),
      ...(window.HUILAISHI_VOCAB_EXPANSION_L13 || []),
      ...(window.HUILAISHI_VOCAB_EXPANSION_L46 || [])
    ].filter(item => item && item.id && item.zh && item.th);
  }

  function registerPacks() {
    const guide = window.HUILAISHI_REGISTER_GUIDE;
    let profile = "female";
    try { profile = globalThis.HUILAISHI_STORAGE?.getItem("huilaishi-thai-speaker-profile-v1") === "male" ? "male" : "female"; } catch (_) {}
    return (window.HUILAISHI_REGISTER_PACK || []).filter(pack => {
      const context = pack?.decisionContext;
      const contextComplete = Boolean(
        pack?.contextComplete && pack?.uniqueGradeJudgment
        && context?.settingZh && context?.settingTh
        && context?.relationshipZh && context?.relationshipTh
      );
      const recommendedExists = Boolean(pack?.recommendedVariantId && pack?.variants?.some(item => item.id === pack.recommendedVariantId));
      return contextComplete && recommendedExists && Array.isArray(pack.variants) && GRADES.every(grade => pack.variants.some(item => item.grade === grade));
    }).map(pack => ({
      ...pack,
      variants: pack.variants.map(variant => {
        const speakerProfile = locale() === "zh" && (variant.grade === "S5" || variant.grade === "S4")
          ? profile
          : "source";
        return guide?.getVariant?.(pack.id, variant.grade, speakerProfile) || variant;
      })
    }));
  }

  function gradePracticePacks(grade, packs = registerPacks()) {
    const byId = new Map(packs.map(pack => [pack.id, pack]));
    const rows = window.HUILAISHI_REGISTER_GUIDE?.levels?.[grade]?.practicePool || [];
    const prioritized = rows.map(row => byId.get(row.id)).filter(Boolean);
    const prioritizedIds = new Set(prioritized.map(pack => pack.id));
    return [...prioritized, ...packs.filter(pack => !prioritizedIds.has(pack.id))];
  }

  function contextView(pack) {
    const context = pack?.decisionContext;
    if (!context || !pack?.contextComplete) return null;
    const zh = locale() === "zh";
    const setting = zh ? context.settingZh : context.settingTh;
    const relationship = zh ? context.relationshipZh : context.relationshipTh;
    if (!setting || !relationship) return null;
    return {
      setting,
      relationship,
      why: zh ? pack.recommendedWhyZh : pack.recommendedWhyTh,
      recommendedGrade: pack.recommendedGrade
    };
  }

  function contextMarkup(pack) {
    const c = copy();
    const context = contextView(pack);
    if (!context) return `<div class="meaning-hint" role="note">${esc(c.contextMissing)}</div>`;
    return `<div class="meaning-hint" role="note"><b>${esc(c.contextSetting)}</b> · ${esc(context.setting)}<br><b>${esc(c.contextRelationship)}</b> · ${esc(context.relationship)}</div>`;
  }

  function activeLevel() {
    const saved = Number(globalThis.HUILAISHI_STORAGE?.getItem(`huilaishi-vocab-level-${direction()}`));
    return Number.isInteger(saved) && saved >= 1 && saved <= 6 ? saved : 1;
  }

  function wordView(word) {
    const zhToTh = direction() === "zh-th";
    return {
      id: word.id,
      level: Number(word.level),
      target: zhToTh ? word.th : word.zh,
      reading: zhToTh ? (word.thReading?.romanTone || word.ro) : word.py,
      phoneticHint: zhToTh ? (word.thReading?.zhHint || word.thReadingZhHint || "") : "",
      meaning: zhToTh ? word.zh : word.th,
      lang: zhToTh ? "th" : "zh-CN",
      voiceLang: zhToTh ? "th-TH" : "zh-CN"
    };
  }

  function wordVoiceOptions(word, kind = "word") {
    const family = direction() === "zh-th" ? "th" : "zh";
    return {
      voicePackLevel: Number(word?.level),
      direction: direction(),
      audioKey: `vocab:${word?.id || "unknown"}:${kind}:${family}`,
      track: "standard"
    };
  }

  function primeWordVoice(word) {
    const engine = window.HUILAISHI_SPEECH;
    if (!word || !engine?.prime) return;
    const view = wordView(word);
    void engine.prime(view.target, { ...wordVoiceOptions(word), lang: view.voiceLang });
  }

  function packView(variant) {
    const zhToTh = direction() === "zh-th";
    return {
      target: zhToTh ? variant.th : variant.zh,
      reading: zhToTh ? (variant.thReading?.romanTone || variant.ro) : variant.py,
      phoneticHint: zhToTh ? (variant.thReading?.zhHint || variant.thReadingZhHint || "") : "",
      meaning: zhToTh ? variant.zh : variant.th,
      note: locale() === "zh" ? variant.noteZh : variant.noteTh,
      lang: zhToTh ? "th" : "zh-CN",
      voiceLang: zhToTh ? "th-TH" : "zh-CN"
    };
  }

  function sceneView(pack) {
    const zh = locale() === "zh";
    return {
      intent: zh ? pack.intentZh : pack.intentTh,
      context: zh ? pack.contextZh : pack.contextTh,
      lang: zh ? "zh-CN" : "th"
    };
  }

  function choiceShortcutAttrs(index) {
    const letter = copy().answerLetters[index] || String(index + 1);
    return `aria-keyshortcuts="${esc(letter)} ${index + 1}"`;
  }

  function phoneticHintMarkup(value) {
    const hint = direction() === "zh-th" ? String(value || "").trim() : "";
    if (!hint || /近音待核|母语待审|算法近似/u.test(hint)) return "";
    return `<span class="thai-phonetic-hint"><small class="thai-phonetic-label">中文近音·仅助记</small><span class="thai-phonetic-value">${esc(hint)}</span></span>`;
  }

  function hasBundledWordVoice(word) {
    const view = wordView(word);
    const options = wordVoiceOptions(word);
    const request = {
      text: view.target,
      lang: view.voiceLang,
      track: "standard",
      key: options.audioKey
    };
    const installed = window.HUILAISHI_VOICE_PACKS?.resolveSync?.({
      text: view.target,
      lang: view.voiceLang,
      level: options.voicePackLevel,
      direction: options.direction,
      key: options.audioKey
    });
    return Boolean(
      window.HUILAISHI_STARTER_VOCAB_AUDIO?.lookup?.(request)
      || window.HUILAISHI_CUTE_AUDIO?.lookup?.(request)
      || installed
    );
  }

  function pickWords(count, options = {}) {
    const requestedLevel = Number(options.level);
    const level = Number.isInteger(requestedLevel) && requestedLevel >= 1 && requestedLevel <= 6 ? requestedLevel : activeLevel();
    let pool = corpus().filter(item => Number(item.level) === level);
    const audioIds = new Set(options.learningAudio ? pool.filter(hasBundledWordVoice).map(item => item.id) : []);
    const snapshot = learningSnapshot(level);
    const due = new Set(snapshot.dueIds || []);
    const wrong = new Set(snapshot.wrongIds || []);
    const unseen = new Set(snapshot.unseenIds || []);
    const ranked = [];
    const rankedIds = new Set();
    [
      pool.filter(item => due.has(item.id)),
      pool.filter(item => wrong.has(item.id)),
      pool.filter(item => unseen.has(item.id)),
      pool
    ].forEach(group => shuffle(group).sort((a, b) => Number(audioIds.has(b.id)) - Number(audioIds.has(a.id))).forEach(item => {
      if (!rankedIds.has(item.id)) { rankedIds.add(item.id); ranked.push(item); }
    }));
    const seenTarget = new Set();
    const seenMeaning = new Set();
    return ranked.filter(item => {
      const view = wordView(item);
      if (seenTarget.has(view.target) || seenMeaning.has(view.meaning)) return false;
      seenTarget.add(view.target); seenMeaning.add(view.meaning); return true;
    }).slice(0, count);
  }

  function statsKey() { return `huilaishi-arcade-stats-${direction()}`; }
  function readStats() {
    try {
      const value = JSON.parse(globalThis.HUILAISHI_STORAGE?.getItem(statsKey()));
      return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    } catch (_) { return {}; }
  }
  function writeStats(value) { try { globalThis.HUILAISHI_STORAGE?.setItem(statsKey(), JSON.stringify(value)); } catch (_) {} }

  function learningSnapshot(level = activeLevel()) {
    try {
      const snapshot = window.VocabUI?.getLearningSnapshot?.(level);
      if (snapshot) return snapshot;
    } catch (_) {}
    const normalizedLevel = Math.max(1, Math.min(6, Number(level) || 1));
    const words = corpus().filter(word => Number(word.level) === normalizedLevel);
    const read = name => {
      try { return JSON.parse(globalThis.HUILAISHI_STORAGE?.getItem(`huilaishi-vocab-${name}-${direction()}`) || (name === "srs" ? "{}" : "[]")); }
      catch (_) { return name === "srs" ? {} : []; }
    };
    const srs = read("srs");
    const known = new Set(read("known"));
    const wrong = new Set(read("wrong"));
    const now = Date.now();
    const dueIds = words.filter(word => srs[word.id]?.seen > 0 && Number(srs[word.id]?.due || 0) <= now).map(word => word.id);
    const wrongIds = words.filter(word => wrong.has(word.id)).map(word => word.id);
    const masteredIds = words.filter(word => known.has(word.id)).map(word => word.id);
    const unseenIds = words.filter(word => !srs[word.id]?.seen && !known.has(word.id)).map(word => word.id);
    return { level: normalizedLevel, total: words.length, seen: words.length - unseenIds.length, mastered: masteredIds.length, due: dueIds.length, wrong: wrongIds.length, unseen: unseenIds.length, dueIds, wrongIds, masteredIds, unseenIds };
  }

  function recordLearningResult(word, correct) {
    if (!word?.id) return null;
    let snapshot = null;
    try { snapshot = window.VocabUI?.recordPracticeResult?.(word.id, Boolean(correct), `arcade:${game?.type || "unknown"}`) || null; } catch (_) {}
    if (!snapshot) {
      const storage = globalThis.HUILAISHI_STORAGE;
      const suffix = direction();
      const read = (name, fallback) => {
        try { return JSON.parse(storage?.getItem(`huilaishi-vocab-${name}-${suffix}`)) ?? fallback; }
        catch (_) { return fallback; }
      };
      const write = (name, value) => { try { storage?.setItem(`huilaishi-vocab-${name}-${suffix}`, JSON.stringify(value)); } catch (_) {} };
      const srs = read("srs", {});
      const current = srs[word.id] || { box: 0, seen: 0, due: 0 };
      const box = correct ? Math.min(5, Number(current.box || 0) + 1) : 1;
      const days = [0, 1, 3, 7, 14, 30];
      srs[word.id] = { box, seen: Number(current.seen || 0) + 1, due: correct ? Date.now() + days[box] * 86400000 : Date.now() };
      write("srs", srs);
      const wrong = new Set(read("wrong", []));
      if (correct && box >= 2) wrong.delete(word.id); else if (!correct) wrong.add(word.id);
      write("wrong", [...wrong]);
      const known = new Set(read("known", []));
      if (correct && box >= 2) known.add(word.id); else if (!correct) known.delete(word.id);
      write("known", [...known]);
      snapshot = learningSnapshot(word.level);
    }
    if (game) {
      game.learningAttempts = Number(game.learningAttempts || 0) + 1;
      game.learningCorrectIds ||= new Set();
      game.learningWrongIds ||= new Set();
      if (correct) {
        game.learningCorrectIds.add(word.id);
        if (!snapshot?.wrongIds?.includes?.(word.id)) game.learningWrongIds.delete(word.id);
      } else {
        game.learningWrongIds.add(word.id);
      }
    }
    return snapshot;
  }

  function monsterCollectionKey() { return `huilaishi-monster-progress-${direction()}`; }

  function readMonsterCollection() {
    try {
      const value = JSON.parse(globalThis.HUILAISHI_STORAGE?.getItem(monsterCollectionKey()) || "{}");
      return value && typeof value === "object" && !Array.isArray(value) ? { version: 1, chapters: value.chapters && typeof value.chapters === "object" ? value.chapters : {} } : { version: 1, chapters: {} };
    } catch (_) { return { version: 1, chapters: {} }; }
  }

  function writeMonsterCollection(value) {
    try { globalThis.HUILAISHI_STORAGE?.setItem(monsterCollectionKey(), JSON.stringify(value)); } catch (_) {}
  }

  function monsterRallyCollectionKey() { return `huilaishi-monster-rally-progress-${direction()}`; }

  function readMonsterRallyCollection() {
    try {
      const value = JSON.parse(globalThis.HUILAISHI_STORAGE?.getItem(monsterRallyCollectionKey()) || "{}");
      return value && typeof value === "object" && !Array.isArray(value) ? { version: 1, zones: value.zones && typeof value.zones === "object" ? value.zones : {} } : { version: 1, zones: {} };
    } catch (_) { return { version: 1, zones: {} }; }
  }

  function writeMonsterRallyCollection(value) {
    try { globalThis.HUILAISHI_STORAGE?.setItem(monsterRallyCollectionKey(), JSON.stringify(value)); } catch (_) {}
  }

  function monsterCampaign(level = game?.campaignLevel || activeLevel()) {
    const normalizedLevel = Math.max(1, Math.min(MONSTER_CHAPTER_COUNT, Math.floor(Number(level) || 1)));
    return MONSTER_CONFIGS.filter(monster => monster.chapter === normalizedLevel);
  }

  function monsterRallyZone(zone = game?.rallyZone || 1) {
    const normalizedZone = Math.max(1, Math.min(MONSTER_RALLY_ZONE_COUNT, Math.floor(Number(zone) || 1)));
    return MONSTER_RALLY_CONFIGS.filter(monster => monster.rallyZone === normalizedZone);
  }

  function activeMonsterRoster() {
    return game?.monsterMode === "rally" ? monsterRallyZone(game?.rallyZone) : monsterCampaign(game?.campaignLevel);
  }

  function isCampusChapter() { return game?.monsterMode === "story" && game?.campaignLevel === 1; }

  function campusJourney() { return window.HUILAISHI_CAMPUS_ADVENTURE?.journey(direction()); }
  function campusSceneArt() { return window.HUILAISHI_WORLD_ATLAS?.sceneForRun(direction(), game || {})?.art || (isCampusChapter() ? window.HUILAISHI_CAMPUS_STORY?.scene(direction(), game.monsterIndex) : null) || campusJourney()?.art || CAMPUS_COURTYARD_ART; }
  function worldAtlasEntryMarkup() {
    if (!window.HUILAISHI_WORLD_ATLAS_UI) return "";
    const zh = locale() === "zh";
    return `<button type="button" class="world-atlas-entry" data-world-atlas data-speech-skip><span><b>${zh ? "去远一点 · 世界漫游" : "ออกไปไกลอีกนิด · สำรวจโลก"}</b><small>${zh ? "中泰36景 · 56种纸怪形象 · 地点小故事" : "36 ฉากจีน–ไทย · มอนสเตอร์ 56 แบบ · เรื่องราวสถานที่"}</small></span><i aria-hidden="true">↗</i></button>`;
  }
  function openWorldAtlas() {
    if (!game || game.type !== "monster" || game.timerActive || game.busy || q("#arcade-sheet")?.dataset.arcadePhase !== "monster-ready") return false;
    const zh = locale() === "zh", model = window.HUILAISHI_CAMPUS_CURRICULUM;
    const groups = Array.from({length:6}, (_,i) => ({
      title: `${zh ? "主线" : "เนื้อเรื่อง"} ${i+1} · ${model?.world?.areas?.[i]?.[zh ? "zh" : "th"] || (i+1)}`,
      lore: zh ? "散页带走了它熟悉的声音。它用自己的方式守护这片街区；读懂技能预兆，再选择招式。" : "หน้ากระดาษพาเสียงที่คุ้นเคยไป มันปกป้องถิ่นนี้ในแบบของตน อ่านสัญญาณสกิลแล้วเลือกท่า",
      items: MONSTER_CONFIGS.filter(m=>m.chapter===i+1).map(m=>({...m,name:monsterName(m),hint:monsterSkillHint(m)||monsterTraitText(m),lore:i===0 ? window.HUILAISHI_CAMPUS_STORY?.encounter(direction(), MONSTER_CONFIGS.indexOf(m))?.story : window.HUILAISHI_WORLD_ATLAS?.lore?.[m.id]?.[zh?"zh":"th"]}))
    }));
    MONSTER_RALLY_ZONES.forEach(zone=>groups.push({title:`${zh ? "巡游" : "ทัวร์"} · ${zone[zh?"zh":"th"]}`,lore:zh ? `它们住在${zone.zh}，把遗失的纸片和日常物品做成装备。不同装备会改变出招节奏；图鉴展示原型，巡游中遇见装备变体。` : `พวกมันอยู่ที่${zone.th} ใช้กระดาษกับของใช้ทำอุปกรณ์ อุปกรณ์เปลี่ยนจังหวะโจมตี สมุดแสดงต้นแบบ ส่วนทัวร์มีแบบติดอุปกรณ์`,items:zone.families.map(f=>({...f,name:f[zh?"zh":"th"],hint:f[zh?"skillZh":"skillTh"]}))}));
    stopVoiceAudio();
    return window.HUILAISHI_WORLD_ATLAS_UI?.open({stage:q("#arcade-stage"),sheet:q("#arcade-sheet"),dir:direction(),locale:locale(),chapter:game.campaignLevel,groups,onBack:()=>{q("#arcade-sheet").dataset.arcadePhase="monster-ready";renderMonsterReady("[data-world-atlas]");}});
  }
  function campusStoryEntry() { return isCampusChapter() ? window.HUILAISHI_CAMPUS_STORY?.encounter(direction(), game.monsterIndex) : null; }
  function campusNotebook() {
    try { return window.HUILAISHI_CAMPUS_STORY?.normalizeNotebook(JSON.parse(globalThis.HUILAISHI_STORAGE?.getItem(`huilaishi-campus-notebook-${direction()}`) || "[]")) || []; }
    catch (_) { return []; }
  }
  function campusNotebookMarkup() {
    const model = window.HUILAISHI_CAMPUS_STORY;
    if (!isCampusChapter() || !model) return "";
    const pages = campusNotebook(), zh = locale() === "zh";
    return `<section class="campus-notebook"><header><b>${zh ? "纸怪手记" : "บันทึกมอนสเตอร์กระดาษ"}</b><span>${pages.length}/6 ${zh ? "线索" : "เบาะแส"}</span></header><p>${esc(model.chapter(direction()).opening)}</p>${model.ids.map((id, index) => { const entry = model.encounter(direction(), index), monster = MONSTER_CONFIGS.find(item => item.id === id); return `<details><summary><img src="${esc(monster.art)}" alt="" loading="lazy"/><span><b>${esc(monsterName(monster))}</b><small>${esc(entry.role)}</small></span><i aria-hidden="true">${pages.includes(id) ? "✓" : "+"}</i></summary><p>${esc(entry.story)}</p><blockquote>${esc(entry.quote)}</blockquote><p class="campus-notebook-clue">${esc(pages.includes(id) ? entry.clue : (zh ? "在对应关卡听题前，点「环顾四周」寻找线索。" : "ก่อนฟังโจทย์ในด่านนี้ แตะสำรวจรอบตัวเพื่อหาเบาะแส"))}</p></details>`; }).join("")}</section>`;
  }
  function campusAftermathMarkup(ending = false) {
    const entry = campusStoryEntry(), model = window.HUILAISHI_CAMPUS_STORY;
    if (!entry || !model) return "";
    const zh = locale() === "zh", pages = campusNotebook();
    return `<aside class="campus-aftermath"><small>${zh ? (ending ? "首章终幕" : "找回一张声页") : (ending ? "ตอนจบของบทแรก" : "ได้หน้ากระดาษเสียงคืน")}</small><p>${esc(ending ? model.chapter(direction()).ending : entry.after)}</p>${ending ? `<p>${esc(pages.length === 6 ? model.chapter(direction()).secret : (zh ? `还藏着 ${6 - pages.length} 条线索。重访关卡、环顾四周，可以补全手记后记。` : `ยังมีเบาะแสอีก ${6 - pages.length} ชิ้น กลับไปสำรวจด่านเพื่อเติมตอนท้ายของบันทึก`))}</p>` : ""}</aside>`;
  }
  function renderCampusExplore() {
    const entry = campusStoryEntry();
    if (!entry || !game.expeditionStarted || game.timerActive || game.busy || game.answered || q("#arcade-sheet")?.dataset.arcadePhase !== "monster-playing") return false;
    stopVoiceAudio();
    q("#arcade-sheet").dataset.arcadePhase = "campus-explore";
    q("#arcade-sheet").scrollTop = 0;
    q("#arcade-timer").textContent = "—";
    const zh = locale() === "zh", partner = currentMonsterHero(game.monsterHeroId === "thai" ? "chinese" : "thai");
    const found = campusNotebook().includes(entry.id), byId = new Map(corpus().map(word => [word.id, word]));
    q("#arcade-stage").innerHTML = `<section class="campus-explore"><div class="campus-explore-scene" style="--journey-scene:url('${esc(entry.art)}')"><span class="campus-location">${esc(entry.act)}</span><img class="campus-explore-partner" src="${esc(partner.art)}" alt=""/><button type="button" class="campus-hotspot" data-campus-clue-open data-speech-skip aria-controls="campus-clue-panel" aria-expanded="false"><span aria-hidden="true">＋</span>${zh ? "查看纸页" : "ดูกระดาษ"}</button><blockquote>${esc(entry.quote)}</blockquote></div><div class="campus-explore-page"><header><span>${zh ? "不计时 · 可随时返回" : "ไม่จับเวลา · กลับได้ทุกเมื่อ"}</span><button type="button" data-campus-explore-back data-speech-skip>${zh ? "返回战斗 →" : "กลับไปต่อสู้ →"}</button></header><h3 tabindex="-1">${esc(entry.role)}</h3><p>${esc(entry.story)}</p><p class="campus-partner-note">${esc(zh ? "搭档：先别急着出招。听懂它想守护什么，也许能找到纸页的去向。" : "คู่หู: อย่าเพิ่งรีบออกท่า ลองฟังว่ามันอยากปกป้องอะไร อาจรู้ว่ากระดาษหายไปไหน")}</p><section id="campus-clue-panel" class="campus-clue-panel" hidden><h4>${esc(entry.question)}</h4><p>${zh ? "可以先听词。探索不扣血，也不增加战斗经验或词汇熟练度。" : "ฟังคำก่อนได้ การสำรวจไม่ลดพลังและไม่เพิ่มเลเวลต่อสู้หรือความชำนาญคำศัพท์"}</p><div class="campus-clue-options">${entry.choices.map(id => { const word = byId.get(id); if (!word) return ""; const view = wordView(word); return `<div><button type="button" data-campus-clue-answer="${id}" data-speech-skip><b lang="${view.lang}">${esc(view.target)}</b><small>${esc(view.reading)}</small></button><button type="button" data-campus-clue-listen="${id}" data-speech-skip aria-label="${esc((zh ? "听读：" : "ฟัง: ") + view.target)}"><svg aria-hidden="true"><use href="#i-volume"></use></svg></button></div>`; }).join("")}</div><div class="campus-clue-feedback" role="status" tabindex="-1">${found ? esc(entry.clue) : ""}</div></section><small>${zh ? "线索按学习方向保存在本机；重复查看不会重复领奖。" : "เบาะแสบันทึกแยกตามภาษาในเครื่อง ดูซ้ำได้โดยไม่รับรางวัลซ้ำ"}</small></div></section>`;
    q(".campus-explore h3")?.focus?.({ preventScroll: true });
    const monster = currentMonster();
    if (monster.frames?.windup && monster.frames?.strike) {
      q(".campus-partner-note")?.insertAdjacentHTML("afterend", `<div class="campus-monster-demo"><img src="${esc(monster.art)}" alt="${esc(monsterName(monster))}"/><div><b>${esc(monsterName(monster))}</b><p>${esc(monsterSkillHint(monster) || monsterTraitText(monster))}</p><button type="button" data-campus-observe data-speech-skip>${zh ? "观察出招 · 不扣血" : "ดูท่าโจมตี · ไม่ลดพลัง"}</button><small role="status" data-campus-observe-status>${zh ? "看清动作，再决定怎么应对。" : "ดูท่าให้ชัดก่อนเลือกวิธีรับมือ"}</small></div></div>`);
    }
    return true;
  }
  function observeCampusMonster() {
    if (q("#arcade-sheet")?.dataset.arcadePhase !== "campus-explore") return;
    const button=q("[data-campus-observe]"), area=q(".campus-monster-demo"), actor=area?.querySelector("img"), label=q("[data-campus-observe-status]");
    const monster=currentMonster(), frames=monster.frames, active=game, zh=locale()==="zh";
    if (!button || button.disabled || !actor || !frames?.windup || !frames?.strike) return;
    const show=(pose,caption)=>{
      if(game!==active || !area.isConnected || q("#arcade-sheet")?.dataset.arcadePhase!=="campus-explore")return;
      area.dataset.pose=pose;actor.src=frames[pose] || monster.art;label.textContent=caption;
      if(pose==="idle")button.disabled=false;
    };
    button.disabled=true;show("windup",zh ? "蓄力：留意它的预备动作。" : "ตั้งท่า: สังเกตการเตรียมโจมตี");
    schedule(()=>show("strike",zh ? "出招：这是它的攻击动作。" : "ออกท่า: นี่คือจังหวะโจมตี"),600);
    schedule(()=>show("idle",zh ? "回位：演示结束，没有扣血或增加分数。" : "กลับท่าเดิม: จบการสาธิต ไม่ลดพลังหรือเพิ่มคะแนน"),1300);
  }
  function returnFromCampusExplore() {
    if (q("#arcade-sheet")?.dataset.arcadePhase !== "campus-explore") return;
    const selectedStyle = game?.monsterStyle;
    stopVoiceAudio(); renderMonsterQuestion();
    if (selectedStyle) selectMonsterStyle(selectedStyle);
    q("[data-campus-explore]")?.focus?.({ preventScroll: true });
  }
  function chooseCampusClue(id) {
    if (q("#arcade-sheet")?.dataset.arcadePhase !== "campus-explore") return false;
    const model = window.HUILAISHI_CAMPUS_STORY, entry = campusStoryEntry();
    if (!model || !entry || !entry.choices.includes(id)) return false;
    const result = model.solve(direction(), game.monsterIndex, id, campusNotebook()), zh = locale() === "zh";
    const feedback = q(".campus-clue-feedback");
    if (!result.correct) { if (feedback) feedback.textContent = zh ? "这张还对不上。再听一次，留意任务里要找的东西。" : "ยังไม่ตรง ลองฟังอีกครั้งแล้วดูว่าสิ่งที่ตามหาคืออะไร"; return false; }
    let durable = globalThis.HUILAISHI_STORAGE?.persistent !== false;
    if (result.fresh) {
      try { globalThis.HUILAISHI_STORAGE?.setItem(`huilaishi-campus-notebook-${direction()}`, JSON.stringify(result.pages)); durable = campusNotebook().includes(entry.id) && globalThis.HUILAISHI_STORAGE?.persistent !== false; }
      catch (_) { durable = false; }
    }
    if (feedback) { feedback.textContent = `${entry.clue}${durable ? "" : (zh ? "（未能保存；请检查本机存储）" : " (บันทึกไม่ได้ โปรดตรวจสอบพื้นที่เก็บข้อมูล)")}`; feedback.focus?.({ preventScroll: true }); }
    return true;
  }
  function campusEffects() { return window.HUILAISHI_CAMPUS_ADVENTURE?.routeEffects(game) || { shieldMultiplier: 1, burstBonus: 0, guardMultiplier: 1, turnBonus: 0 }; }
  function campusBattleSceneMarkup() {
    const partner = currentMonsterHero(game.monsterHeroId === "thai" ? "chinese" : "thai");
    const journey = campusJourney(), route = journey?.routes.find(item=>item.id === window.HUILAISHI_CAMPUS_ADVENTURE?.activeRoute(game));
    const phase = window.HUILAISHI_CAMPUS_ADVENTURE?.bossPhase(currentMonster(), game.monsterHp, game.monsterMaxHp) || 1;
    return `<div class="campus-partner" aria-hidden="true"><img src="${esc(partner.frames.strike)}" alt=""/></div>${isCampusChapter() ? `<div class="campus-battle-caption">${esc(journey?.stations[game.monsterIndex] || "")}${route ? `<br><b title="${esc(route.effect)}">${esc(route.title)}</b>` : ""}${currentMonster().boss ? `<span class="campus-boss-phase">${locale() === "zh" ? "阶段" : "ช่วง"} ${phase}/2</span>` : ""}</div>` : ""}`;
  }
  function campusNeedsChoice() { return Boolean(window.HUILAISHI_CAMPUS_ADVENTURE?.needsChoice(game)); }

  function renderCampusFork() {
    const journey = campusJourney();
    if (!journey || !campusNeedsChoice()) return false;
    clearInterval(timerId); timerId = 0;
    game.timerActive = false; game.busy = false;
    q("#arcade-sheet").dataset.arcadePhase = "campus-fork";
    q("#arcade-sheet").scrollTop = 0;
    q("#arcade-timer").textContent = "—";
    q("#arcade-round").textContent = locale() === "zh" ? "岔路事件" : "เหตุการณ์ระหว่างทาง";
    const partner = currentMonsterHero(game.monsterHeroId === "thai" ? "chinese" : "thai");
    q("#arcade-stage").innerHTML = `<section class="campus-fork"><div class="campus-fork-scene" style="--journey-scene:url('${esc(campusSceneArt())}')"><img src="${esc(partner.art)}" alt=""/><span>${esc(journey.location)}</span></div><div class="campus-fork-page"><p class="campus-eyebrow">${esc(journey.subtitle)} · ${game.monsterIndex + 1}/6</p><h3 tabindex="-1">${esc(journey.forkTitle)}</h3><p>${locale() === "zh" ? "选一个事件。效果只作用于下一场战斗；不计时。" : "เลือกหนึ่งเหตุการณ์ ผลมีเฉพาะการต่อสู้ถัดไป ไม่จับเวลา"}</p><div class="campus-fork-options">${journey.routes.map((route, index) => `<button type="button" data-campus-route="${route.id}" data-speech-skip><span class="campus-choice-number">0${index + 1}</span><span><b>${esc(route.title)}</b><span>${esc(route.story)}</span><em>${esc(route.effect)}</em></span><i aria-hidden="true">↗</i></button>`).join("")}</div></div></section>`;
    q(".campus-fork h3")?.focus?.({ preventScroll: true });
    return true;
  }

  function chooseCampusRoute(id) {
    if (q("#arcade-sheet")?.dataset.arcadePhase !== "campus-fork" || !window.HUILAISHI_CAMPUS_ADVENTURE?.chooseRoute(game, id)) return;
    saveMonsterExpedition();
    renderMonsterQuestion();
  }

  function campusRouteMarkup() {
    if (!isCampusChapter()) return "";
    const snapshot = monsterCollectionSnapshot(1);
    const zh = locale() === "zh";
    return `<section class="campus-route" aria-labelledby="campus-route-title"><header><b id="campus-route-title">${zh ? "这一次，要走的六站" : "เส้นทางทั้งหกด่าน"}</b><span>${snapshot.chapterDefeated} / ${snapshot.chapterTotal}</span></header><ol>${monsterCampaign(1).map((opponent, index) => {
      const done = snapshot.chapterDefeatedIds.includes(opponent.id);
      const current = index === game.monsterIndex;
      const state = done ? (zh ? "已击败" : "ชนะแล้ว") : current ? (zh ? "下一战" : "ด่านถัดไป") : opponent.boss ? (zh ? "首章 BOSS" : "บอสบทแรก") : (zh ? `第 ${index + 1} 站` : `ด่าน ${index + 1}`);
      return `<li class="${done ? "is-cleared" : ""}${current ? " is-current" : ""}" ${current ? 'aria-current="step"' : ""}><small>${esc(state)}</small><img src="${esc(opponent.art)}" alt="" loading="lazy" decoding="async"><b>${esc(monsterName(opponent))}</b><span>${esc(zh ? opponent.traitZh : opponent.traitTh)}</span></li>`;
    }).join("")}</ol><p>${zh ? "击败新对手才升战斗等级；答题记录回到词库，错词继续复习。" : "ชนะคู่ต่อสู้ใหม่เพื่อเพิ่มเลเวล ผลคำตอบบันทึกในคลังคำศัพท์ และทบทวนคำที่ตอบผิด"}</p></section>`;
  }

  function monsterCollectionSnapshot(level = activeLevel()) {
    const collection = readMonsterCollection();
    const chapter = collection.chapters?.[String(level)] || {};
    const chapterDefeatedIds = Array.isArray(chapter.defeated) ? [...new Set(chapter.defeated.filter(id => monsterCampaign(level).some(monster => monster.id === id)))] : [];
    const defeatedIds = new Set();
    Object.entries(collection.chapters || {}).forEach(([chapterId, item]) => (Array.isArray(item?.defeated) ? item.defeated : []).forEach(id => {
      if (MONSTER_CONFIGS.some(monster => monster.id === id && monster.chapter === Number(chapterId))) defeatedIds.add(id);
    }));
    return { total: MONSTER_CONFIGS.length, defeated: defeatedIds.size, chapterDefeated: chapterDefeatedIds.length, chapterTotal: monsterCampaign(level).length, chapterDefeatedIds, chapterCleared: chapterDefeatedIds.length >= monsterCampaign(level).length };
  }

  function monsterRallyCollectionSnapshot(zone = 1) {
    const normalizedZone = Math.max(1, Math.min(MONSTER_RALLY_ZONE_COUNT, Number(zone) || 1));
    const collection = readMonsterRallyCollection();
    const zoneValue = collection.zones?.[String(normalizedZone)] || {};
    const roster = monsterRallyZone(normalizedZone);
    const zoneDefeatedIds = Array.isArray(zoneValue.defeated) ? [...new Set(zoneValue.defeated.filter(id => roster.some(monster => monster.id === id)))] : [];
    const defeatedIds = new Set();
    Object.entries(collection.zones || {}).forEach(([zoneId, item]) => (Array.isArray(item?.defeated) ? item.defeated : []).forEach(id => {
      if (MONSTER_RALLY_CONFIGS.some(monster => monster.id === id && monster.rallyZone === Number(zoneId))) defeatedIds.add(id);
    }));
    return { total: MONSTER_RALLY_CONFIGS.length, defeated: defeatedIds.size, zone: normalizedZone, zoneDefeated: zoneDefeatedIds.length, zoneTotal: roster.length, zoneDefeatedIds, zoneCleared: zoneDefeatedIds.length >= roster.length };
  }

  function allMonsterCollectionSnapshot(level = activeLevel()) {
    const story = monsterCollectionSnapshot(level);
    const rally = monsterRallyCollectionSnapshot(game?.rallyZone || 1);
    return { total: ALL_MONSTER_CONFIGS.length, defeated: story.defeated + rally.defeated, story, rally };
  }

  function recordRallyMonsterDefeat(monster) {
    if (!monster?.id || !monster.rally) return monsterRallyCollectionSnapshot(game?.rallyZone || 1);
    const collection = readMonsterRallyCollection();
    const zoneKey = String(monster.rallyZone || game?.rallyZone || 1);
    const zoneValue = collection.zones[zoneKey] && typeof collection.zones[zoneKey] === "object" ? collection.zones[zoneKey] : {};
    const defeated = new Set(Array.isArray(zoneValue.defeated) ? zoneValue.defeated : []);
    defeated.add(monster.id);
    const roster = monsterRallyZone(Number(zoneKey));
    collection.zones[zoneKey] = { defeated: [...defeated].filter(id => roster.some(item => item.id === id)), cleared: roster.every(item => defeated.has(item.id)), updatedAt: Date.now() };
    writeMonsterRallyCollection(collection);
    return monsterRallyCollectionSnapshot(Number(zoneKey));
  }

  function recordMonsterDefeat(monster) {
    if (monster?.rally) return recordRallyMonsterDefeat(monster);
    if (!monster?.id) return monsterCollectionSnapshot(game?.campaignLevel || activeLevel());
    const collection = readMonsterCollection();
    const chapterKey = String(monster.chapter || game?.campaignLevel || activeLevel());
    const chapter = collection.chapters[chapterKey] && typeof collection.chapters[chapterKey] === "object" ? collection.chapters[chapterKey] : {};
    const defeated = new Set(Array.isArray(chapter.defeated) ? chapter.defeated : []);
    defeated.add(monster.id);
    const campaign = monsterCampaign(Number(chapterKey));
    collection.chapters[chapterKey] = { defeated: [...defeated].filter(id => campaign.some(item => item.id === id)), cleared: campaign.every(item => defeated.has(item.id)), updatedAt: Date.now() };
    writeMonsterCollection(collection);
    return monsterCollectionSnapshot(Number(chapterKey));
  }

  function monsterGlobalStage(monster = currentMonster()) {
    if (monster?.rally) return Math.max(1, Number(monster.rallyStage) || 1);
    const index = MONSTER_CONFIGS.findIndex(item => item.id === monster?.id);
    return index >= 0 ? index + 1 : 1;
  }

  function monsterStageLabel(monster = currentMonster()) {
    if (monster?.rally) return copy().monsterRallyStage(monsterGlobalStage(monster));
    const chapter = Number(monster?.chapter) || 1, roster = monsterCampaign(chapter);
    const position = Math.max(1, roster.findIndex(item => item.id === monster?.id) + 1);
    return locale() === "zh" ? `第 ${chapter} 章 · ${position}/${roster.length} 关` : `บท ${chapter} · ด่าน ${position}/${roster.length}`;
  }

  function monsterScaledHp(monster = currentMonster()) {
    if (monster?.id === "lantern") return 250;
    const stage = monsterGlobalStage(monster);
    const endurance = monster?.rally ? 1.05 + Math.min(.18, Math.max(0, stage - 1) * .0018) : 1.32 + Math.min(.34, Math.max(0, stage - 1) * .01);
    const bossMultiplier = monster?.boss ? (monster.rally ? 1.1 : 1.18) : 1;
    const eliteMultiplier = monster?.elite ? (monster.rally ? 1.05 : 1.08) : 1;
    return Math.max(40, Math.round((Number(monster?.hp) || 60) * endurance * bossMultiplier * eliteMultiplier / 5) * 5);
  }

  function monsterScaledShield(monster = currentMonster()) {
    const shield = Math.max(0, Number(monster?.shield) || 0);
    const chapterScale = 1 + Math.max(0, (Number(monster?.chapter) || 1) - 1) * .08;
    return Math.round(shield * chapterScale);
  }

  function monsterPlayerMaxHp(combatLevel = game?.combatLevel || 1, guardRank = game?.rewardRanks?.guard || 0) {
    const chapterTier = Math.min(10, Math.max(0, Math.floor(((Number(combatLevel) || 1) - 1) / 10)));
    return MONSTER_PLAYER_BASE_HP + chapterTier * 10 + Math.max(0, Math.floor(Number(guardRank) || 0)) * MONSTER_GUARD_HP_STEP;
  }

  function monsterStartingCombatLevel(monster = currentMonster(), chapter = monster?.chapter || activeLevel()) {
    const storyDefeated = monsterCollectionSnapshot(chapter).defeated;
    const rallyDefeated = monsterRallyCollectionSnapshot(monster?.rallyZone || 1).defeated;
    return Math.max(1, Math.min(ALL_MONSTER_CONFIGS.length, storyDefeated + rallyDefeated + 1));
  }

  function monsterBurstDamage(combatLevel = game?.combatLevel || 1, powerRank = game?.rewardRanks?.power || 0) {
    const levelBonus = Math.min(6, Math.floor(Math.max(0, (Number(combatLevel) || 1) - 1) / 10) * 2);
    const upgradeBonus = Math.min(6, Math.max(0, Math.floor(Number(powerRank) || 0)) * 2);
    return MONSTER_BURST_BASE_DAMAGE + levelBonus + upgradeBonus;
  }

  // One resumable expedition per learning direction. Only settled round boundaries
  // are committed: microphone callbacks and animation frames never become saves.
  function monsterExpeditionKey(dir = direction()) { return `huilaishi-monster-expedition-${dir}`; }

  function normalizeMonsterExpedition(value, dir = direction()) {
    if (!value || value.version !== 1 || value.direction !== dir || !["story", "rally"].includes(value.monsterMode)) return null;
    if (!["battle", "reward", "victory", "defeat"].includes(value.runPhase)) return null;
    const int = (number, max = 1000000) => Number.isFinite(Number(number)) ? Math.max(0, Math.min(max, Math.floor(Number(number)))) : 0;
    const campaignLevel = int(value.campaignLevel, 6);
    const rallyZone = int(value.rallyZone, 10) || 1;
    if (!campaignLevel || (value.monsterMode === "rally" && MONSTER_RALLY_ZONES[rallyZone - 1].level !== campaignLevel)) return null;
    const roster = value.monsterMode === "rally" ? monsterRallyZone(rallyZone) : monsterCampaign(campaignLevel);
    const monsterIndex = roster.findIndex(item => item.id === value.monsterId);
    if (monsterIndex < 0) return null;
    const monster = roster[monsterIndex];
    const wordsById = new Map(corpus().filter(word => Number(word.level) === campaignLevel).map(word => [word.id, word]));
    const wordIds = [...new Set(Array.isArray(value.wordIds) ? value.wordIds : [])].filter(id => wordsById.has(id)).slice(0, 80);
    if (wordIds.length < 16) return null;
    const rewards = Array.isArray(value.rewards) ? value.rewards.filter(id => ["power", "guard", "tempo"].includes(id)).slice(0, monsterIndex) : [];
    const rewardRanks = { power: 0, guard: 0, tempo: 0 };
    rewards.forEach(id => { rewardRanks[id] += 1; });
    const combatLevel = monsterStartingCombatLevel(monster, campaignLevel);
    const playerMaxHp = monsterPlayerMaxHp(combatLevel, rewardRanks.guard);
    const playerHp = int(value.playerHp, playerMaxHp);
    const monsterMaxHp = monsterScaledHp(monster);
    const monsterHp = int(value.monsterHp, monsterMaxHp);
    if (value.runPhase === "battle" && (!playerHp || !monsterHp)) return null;
    if (value.runPhase === "reward" && (!playerHp || monsterHp || monsterIndex + 1 >= roster.length)) return null;
    if (value.runPhase === "victory" && (!playerHp || monsterHp || monsterIndex + 1 !== roster.length)) return null;
    if (value.runPhase === "defeat" && playerHp !== 0) return null;
    const validIds = ids => [...new Set(Array.isArray(ids) ? ids : [])].filter(id => wordsById.has(id));
    const answeredCount = int(value.answeredCount);
    const correct = int(value.correct, answeredCount);
    return {
      version: 1, direction: dir, updatedAt: int(value.updatedAt, Number.MAX_SAFE_INTEGER),
      monsterMode: value.monsterMode, campaignLevel, storyChapter: campaignLevel, rallyZone,
      monsterId: monster.id, monsterIndex, runPhase: value.runPhase,
      campusPreparedMonsterId: value.monsterMode === "story" && campaignLevel === 1 && value.campusPreparedMonsterId === monster.id ? monster.id : null,
      monsterHeroId: MONSTER_HERO_CONFIGS.some(hero => hero.id === value.monsterHeroId) ? value.monsterHeroId : (dir === "th-zh" ? "thai" : "chinese"),
      campusRoutes: value.monsterMode === "story" && campaignLevel === 1 ? window.HUILAISHI_CAMPUS_ADVENTURE?.normalizeRoutes(value.campusRoutes, monsterIndex) || {} : {},
      wordIds, combatLevel, playerMaxHp, playerHp, monsterMaxHp, monsterHp,
      monsterMaxShield: monsterScaledShield(monster), monsterShield: int(value.monsterShield, monsterScaledShield(monster)),
      rewards, rewardRanks, turnBonusMs: rewardRanks.tempo * MONSTER_TEMPO_STEP_MS,
      stageRound: int(value.stageRound), score: int(value.score), round: int(value.round),
      answeredCount, correct, streak: int(value.streak, correct), bestStreak: int(value.bestStreak, correct),
      burstCharge: int(value.burstCharge, MONSTER_BURST_EVERY), burstArmed: Boolean(value.burstArmed && int(value.burstCharge) >= MONSTER_BURST_EVERY),
      defeatedIds: [...new Set(Array.isArray(value.defeatedIds) ? value.defeatedIds : [])].filter(id => roster.some(item => item.id === id)),
      learningAttempts: int(value.learningAttempts, answeredCount), learningCorrectIds: validIds(value.learningCorrectIds), learningWrongIds: validIds(value.learningWrongIds)
    };
  }

  function readMonsterExpedition(dir = direction()) {
    try { return normalizeMonsterExpedition(JSON.parse(globalThis.HUILAISHI_STORAGE?.getItem(monsterExpeditionKey(dir)) || "null"), dir); }
    catch (_) { return null; }
  }

  function saveMonsterExpedition() {
    if (!game || game.type !== "monster" || !game.expeditionStarted || game.completed) return false;
    const snapshot = normalizeMonsterExpedition({
      ...game, version: 1, updatedAt: Date.now(), monsterId: currentMonster().id,
      wordIds: game.words.map(word => word.id), defeatedIds: [...game.defeatedIds],
      learningCorrectIds: [...game.learningCorrectIds], learningWrongIds: [...game.learningWrongIds]
    }, game.direction);
    if (!snapshot) { game.saveDurable = false; return false; }
    try {
      const storage = globalThis.HUILAISHI_STORAGE;
      const payload = JSON.stringify(snapshot);
      storage?.setItem(monsterExpeditionKey(game.direction), payload);
      game.saveDurable = storage?.persistent === true && storage.getItem(monsterExpeditionKey(game.direction)) === payload;
    } catch (_) { game.saveDurable = false; }
    return game.saveDurable;
  }

  function clearMonsterExpedition(dir = direction()) {
    try { globalThis.HUILAISHI_STORAGE?.setItem(monsterExpeditionKey(dir), "null"); } catch (_) {}
  }

  function syncMonsterCombatGrowth(monster = currentMonster()) {
    const previousMaxHp = game.playerMaxHp;
    game.combatLevel = monsterStartingCombatLevel(monster, game.campaignLevel);
    game.playerMaxHp = monsterPlayerMaxHp(game.combatLevel, game.rewardRanks?.guard || 0);
    game.playerHp = Math.min(game.playerMaxHp, game.playerHp + Math.max(0, game.playerMaxHp - previousMaxHp));
  }

  function monsterResumeMarkup() {
    const saved = readMonsterExpedition();
    if (!saved) return "";
    const c = copy();
    const monster = ALL_MONSTER_CONFIGS.find(item => item.id === saved.monsterId);
    const ranks = Object.values(saved.rewardRanks).reduce((sum, rank) => sum + rank, 0);
    const premium = saved.monsterMode === "rally" || Number(saved.campaignLevel) > 1;
    return `<aside class="arcade-expedition-note"><span class="arcade-expedition-stamp" aria-hidden="true">↳</span><div><b>${esc(c.monsterResumeTitle)}</b><p>${esc(monsterStageLabel(monster))} · ${esc(monsterName(monster))}</p><small>${esc(c.monsterResumeStats(saved.playerHp, saved.playerMaxHp, ranks))}</small><small>${esc(c.monsterResumeNote)}</small></div><button type="button" data-monster-resume ${premium ? 'data-premium-feature="monster-full"' : ""}>${esc(c.monsterResume)}</button></aside>`;
  }

  function resumeMonsterExpedition() {
    if (!game || game.type !== "monster" || q("#arcade-sheet")?.dataset.arcadePhase !== "monster-ready") return;
    const saved = readMonsterExpedition();
    if (!saved) return renderMonsterReady();
    if ((saved.monsterMode === "rally" || Number(saved.campaignLevel) > 1) && !canUseFullMonsterRoute()) {
      requestPremium("monster-full");
      return;
    }
    const wordsById = new Map(corpus().map(word => [word.id, word]));
    game = {
      ...game, ...saved, words: saved.wordIds.map(id => wordsById.get(id)),
      defeatedIds: new Set(saved.defeatedIds), monstersDefeated: saved.defeatedIds.length,
      learningCorrectIds: new Set(saved.learningCorrectIds), learningWrongIds: new Set(saved.learningWrongIds),
      expeditionStarted: true, monsterEntering: true, busy: false, answered: false, timerActive: false,
      completed: false, networkPermit: false
    };
    primeMonsterArt();
    setScore(game.score);
    if (saved.runPhase === "reward") return renderMonsterReward();
    if (["victory", "defeat"].includes(saved.runPhase)) return finishMonsterBattle(saved.runPhase === "victory");
    if (renderCampusFork()) return;
    renderMonsterQuestion();
  }

  function beginMonsterExpedition(prepare = false) {
    if (!game || game.type !== "monster" || q("#arcade-sheet")?.dataset.arcadePhase !== "monster-ready") return;
    if (readMonsterExpedition() && !globalThis.confirm?.(copy().monsterReplaceConfirm)) return;
    game.expeditionStarted = true;
    game.runPhase = "battle";
    saveMonsterExpedition();
    if (prepare && renderCampusPreparation()) return;
    if (renderCampusFork()) return;
    renderMonsterQuestion();
  }

  function monsterWorldMarkup() {
    const world = window.HUILAISHI_CAMPUS_CURRICULUM?.world;
    if (!world || !game || game.monsterMode !== "story") return "";
    const zh = locale() === "zh", area = world.areas[game.campaignLevel - 1];
    const collection = allMonsterCollectionSnapshot(game.campaignLevel);
    return `<section class="campus-world"><div class="campus-world-mission"><small>${esc(zh ? world.zh : world.th)} / ${String(game.campaignLevel).padStart(2,"0")}</small><b>${esc(zh ? area.zh : area.th)}</b><p>${esc(zh ? area.goalZh : area.goalTh)}</p></div><details class="campus-world-book"><summary>${zh ? "世界地图 · 36 主线关卡 + 100 巡游怪" : "แผนที่โลก · 36 ด่านหลัก + มอนสเตอร์ทัวร์ 100 ตัว"}</summary><p>${esc(zh ? world.originZh : world.originTh)}</p><p>${esc(zh ? world.goalZh : world.goalTh)}</p><ol>${world.areas.map((region, index) => { const progress = monsterCollectionSnapshot(index + 1); return `<li><button type="button" data-monster-chapter="${index + 1}" ${index ? 'data-premium-feature="monster-full"' : ''} ${index + 1 === game.campaignLevel ? 'aria-current="location"' : ''}><span>0${index + 1}</span><b>${esc(zh ? region.zh : region.th)}</b><small>${progress.chapterDefeated}/6</small></button></li>`; }).join("")}</ol><button type="button" data-monster-mode="rally" data-premium-feature="monster-full">${zh ? "进入百怪巡游 →" : "เข้าสู่ทัวร์ร้อยมอนสเตอร์ →"}</button><small>${esc(zh ? `当前收录：主线 ${collection.story.defeated}/36 · 巡游 ${collection.rally.defeated}/100。后续章节按现有解锁规则开放。` : `บันทึกแล้ว: ด่านหลัก ${collection.story.defeated}/36 · ทัวร์ ${collection.rally.defeated}/100 บทถัดไปใช้เงื่อนไขปลดล็อกเดิม`)}</small></details></section>`;
  }

  function campusLesson() {
    const lesson = isCampusChapter() ? window.HUILAISHI_CAMPUS_CURRICULUM?.encounter(corpus(), game.monsterIndex) : null;
    const journey = campusJourney();
    if (!lesson || !journey) return lesson;
    return { ...lesson, [locale() === "zh" ? "sceneZh" : "sceneTh"]: journey.notes[game.monsterIndex] };
  }

  function renderCampusPreparation() {
    const lesson = campusLesson();
    if (!lesson) return false;
    clearTimers();
    game.timerActive = false;
    game.campusPrep = { index: 0, checked: false, answered: false, missed: new Set() };
    q("#arcade-sheet").dataset.arcadePhase = "campus-preparation";
    q("#arcade-sheet").scrollTop = 0;
    q("#arcade-round").textContent = locale() === "zh" ? "课前手记 · 不计时" : "บันทึกก่อนเล่น · ไม่จับเวลา";
    q("#arcade-timer").textContent = "—";
    hideFeedback();
    const zh = locale() === "zh";
    q("#arcade-stage").innerHTML = `<section class="campus-prep" aria-labelledby="campus-prep-title">
      <figure class="campus-prep-art"><img src="${esc(campusSceneArt())}" alt="" decoding="async"><figcaption>${esc(zh ? "课后俱乐部 / 冒险手记" : "ชมรมหลังเลิกเรียน / บันทึกผจญภัย")}</figcaption></figure>
      <div class="campus-prep-page"><header><span class="campus-prep-stamp">${String(game.monsterIndex + 1).padStart(2, "0")} / 06</span><p>${zh ? "先认识，再出招" : "รู้จักคำก่อน แล้วค่อยออกท่า"}</p><h3 id="campus-prep-title">${esc(zh ? lesson.zh : lesson.th)}</h3><p>${esc(zh ? lesson.sceneZh : lesson.sceneTh)}</p></header>
      <div data-campus-notes>${lesson.preview.map((word, index) => { const view = wordView(word); return `<article class="campus-prep-word"><span class="campus-prep-number">0${index + 1}</span><div><b lang="${view.lang}">${esc(view.target)}</b>${direction() === "th-zh" || word.thReading?.toneCoverage === "full" ? `<small lang="${direction() === "th-zh" ? "zh-Latn" : "th-Latn"}">${esc(view.reading || "")}</small>` : ""}<p>${esc(view.meaning)}</p>${word.noteZh || word.noteTh ? `<small>${esc(zh ? word.noteZh : word.noteTh)}</small>` : ""}</div><button type="button" data-campus-listen="${esc(word.id)}" data-speech-skip aria-label="${esc(`${zh ? "听示范：" : "ฟังตัวอย่าง: "}${view.target}`)}"><svg aria-hidden="true"><use href="#i-volume"></use></svg></button></article>`; }).join("")}</div>
      <div class="campus-prep-check" data-campus-check-panel hidden></div>
      <p class="campus-prep-status" data-campus-status role="status" aria-live="polite">${zh ? "点喇叭听示范；先记意思，不抢时间。" : "แตะลำโพงเพื่อฟังตัวอย่าง จำความหมายก่อน ไม่ต้องรีบ"}</p>
      <button type="button" class="campus-prep-primary" data-campus-check data-speech-skip>${zh ? "做个不计时小测" : "ลองทดสอบแบบไม่จับเวลา"} <span aria-hidden="true">→</span></button>
      <button type="button" class="campus-prep-skip" data-campus-skip data-speech-skip>${zh ? "已经会了，直接挑战" : "รู้คำเหล่านี้แล้ว เริ่มต่อสู้เลย"}</button>
      <small class="campus-prep-note">${zh ? "预习不加战斗等级；小测只检查词义，不评发音。" : "การเตรียมตัวไม่เพิ่มเลเวลนักสู้ แบบทดสอบนี้วัดความหมาย ไม่ใช่การออกเสียง"}</small></div></section>`;
    globalThis.requestAnimationFrame?.(() => q("[data-campus-listen]")?.focus?.({ preventScroll: true }));
    return true;
  }

  async function playCampusWord(id) {
    if (!game || (!game.campusPrep && !game.completed)) return;
    const lesson = campusLesson();
    const word = corpus().find(item => item.id === id && (game.completed ? game.learningWrongIds?.has(id) || game.learningCorrectIds?.has(id) : lesson?.preview.some(item => item.id === id)));
    if (!word) return;
    const active = game;
    // Object token prevents late audio callbacks from changing a new panel.
    const token = {};
    active.campusAudioToken = token;
    stopVoiceAudio();
    window.HUILAISHI_SPEECH?.stop?.();
    active.current = word;
    const status = q("[data-campus-status]");
    const current = () => game === active && active.campusAudioToken === token && status?.isConnected;
    if (status) status.textContent = locale() === "zh" ? "正在播放示范…" : "กำลังเล่นเสียงตัวอย่าง…";
    await playWordVoice(word, {
      onEnd() { if (current()) status.textContent = locale() === "zh" ? "示范播放完毕，可再听一次。" : "เล่นจบแล้ว ฟังซ้ำได้"; },
      onError() { if (current()) status.textContent = locale() === "zh" ? "示范音暂不可用。可重试，或先做词义小测；不会扣分。" : "ยังเล่นเสียงไม่ได้ ลองอีกครั้งหรือทดสอบความหมายก่อนได้ โดยไม่เสียคะแนน"; }
    });
  }

  function renderCampusCheck() {
    const lesson = campusLesson();
    if (!lesson || !game.campusPrep || q("#arcade-sheet")?.dataset.arcadePhase !== "campus-preparation") return;
    clearTimers();
    game.campusAudioToken = null;
    const prep = game.campusPrep;
    prep.checked = true;
    prep.answered = false;
    const word = lesson.preview[prep.index];
    if (!word) return completeCampusPreparation();
    const view = wordView(word);
    prep.options = shuffle(lesson.preview);
    q("[data-campus-notes]").hidden = true;
    const panel = q("[data-campus-check-panel]");
    panel.hidden = false;
    panel.innerHTML = `<p>${locale() === "zh" ? "词义小测" : "ทดสอบความหมาย"} ${prep.index + 1} / 3</p><h4 lang="${view.lang}">${esc(view.target)}</h4><div>${prep.options.map(option => `<button type="button" data-campus-answer="${esc(option.id)}" data-speech-skip>${esc(wordView(option).meaning)}</button>`).join("")}</div>`;
    q("[data-campus-status]").textContent = locale() === "zh" ? "选出它的意思。答错可以重试，不扣血。" : "เลือกความหมาย ตอบผิดลองใหม่ได้ ไม่เสียพลัง";
    const button = q("[data-campus-check]");
    button.hidden = true;
    globalThis.requestAnimationFrame?.(() => q("[data-campus-answer]")?.focus?.({ preventScroll: true }));
  }

  function answerCampusCheck(id) {
    const lesson = campusLesson(), prep = game?.campusPrep;
    if (!lesson || !prep?.checked || prep.answered || !prep.options.some(word => word.id === id)) return;
    const correct = id === lesson.preview[prep.index].id;
    const status = q("[data-campus-status]");
    if (!correct) {
      prep.missed.add(lesson.preview[prep.index].id);
      const button = q(`[data-campus-answer="${id}"]`);
      if (button) { button.disabled = true; button.classList.add("is-missed"); }
      status.textContent = locale() === "zh" ? "还没选对，再想一想。这里只练习，不扣血。" : "ยังไม่ถูก ลองคิดอีกครั้ง ตรงนี้เป็นการฝึก ไม่เสียพลัง";
      return;
    }
    prep.answered = true;
    document.querySelectorAll("[data-campus-answer]").forEach(button => { button.disabled = true; if (button.dataset.campusAnswer === id) button.classList.add("is-correct"); });
    status.textContent = locale() === "zh" ? "对，就是这个意思。" : "ถูกต้อง นี่คือความหมายของคำนี้";
    const button = q("[data-campus-check]");
    button.hidden = false;
    button.textContent = prep.index === 2 ? (locale() === "zh" ? "准备好了，进入战斗 →" : "พร้อมแล้ว เริ่มต่อสู้ →") : (locale() === "zh" ? "下一词 →" : "คำถัดไป →");
    button.focus?.({ preventScroll: true });
  }

  function advanceCampusCheck() {
    const prep = game?.campusPrep;
    if (!prep) return;
    if (!prep.checked) return renderCampusCheck();
    if (!prep.answered) return;
    prep.index += 1;
    renderCampusCheck();
  }

  function completeCampusPreparation() {
    if (!game?.campusPrep || q("#arcade-sheet")?.dataset.arcadePhase !== "campus-preparation") return;
    clearTimers();
    game.campusAudioToken = null;
    game.campusPrep = null;
    game.campusPreparedMonsterId = currentMonster().id;
    // Preparation is exposure, not a successful independent recall or XP award.
    renderMonsterQuestion();
  }

  function campusLearningRecapMarkup() {
    if (!isCampusChapter() || !game?.learningAttempts) return "";
    const zh = locale() === "zh";
    const all = corpus();
    const wrong = all.filter(word => game.learningWrongIds?.has(word.id));
    const correct = new Set(game.learningCorrectIds || []);
    return `<aside class="campus-recap"><b>${zh ? "这趟冒险，用到了什么？" : "การผจญภัยครั้งนี้ได้ใช้คำไหนบ้าง?"}</b><p>${esc(zh ? `答对过 ${correct.size} 个不同词 · 仍需复习 ${wrong.length} 个` : `เคยตอบถูก ${correct.size} คำ · ยังต้องทบทวน ${wrong.length} คำ`)}</p>${wrong.length ? `<ul>${wrong.slice(0, 5).map(word => { const view = wordView(word); return `<li><b lang="${view.lang}">${esc(view.target)}</b><span>${esc(view.meaning)}</span></li>`; }).join("")}</ul>` : ""}<small>${zh ? "答对过不等于长期掌握；错词已进入复习队列。" : "ตอบถูกยังไม่เท่ากับจำได้ระยะยาว คำที่พลาดถูกเพิ่มในคิวทบทวนแล้ว"}</small></aside>`;
  }

  function schedule(callback, delay) {
    const id = setTimeout(() => { pendingIds.delete(id); callback(); }, delay);
    pendingIds.add(id);
    return id;
  }

  function cancelSkippableTransition() {
    const transition = activeTransition;
    if (!transition) return;
    activeTransition = null;
    clearTimeout(transition.timeoutId);
    pendingIds.delete(transition.timeoutId);
    q("#arcade-stage [data-arcade-transition]")?.remove?.();
  }

  function completeSkippableTransition() {
    const transition = activeTransition;
    if (!transition) return false;
    activeTransition = null;
    clearTimeout(transition.timeoutId);
    pendingIds.delete(transition.timeoutId);
    q("#arcade-stage [data-arcade-transition]")?.remove?.();
    transition.callback();
    return true;
  }

  function beginSkippableTransition(callback, delay, reducedDelay = 0) {
    cancelSkippableTransition();
    const requestedDuration = Math.max(0, Number(delay) || 0);
    const reduced = shouldReduceMotion();
    const duration = reduced ? Math.max(0, Number(reducedDelay) || 0) : requestedDuration;
    if (reduced && duration <= 0) {
      schedule(callback, 0);
      return;
    }
    const transition = { callback, timeoutId: 0, duration };
    activeTransition = transition;
    transition.timeoutId = schedule(() => {
      if (activeTransition === transition) completeSkippableTransition();
    }, duration);
  }

  function mountTransitionSkip() {
    const stage = q("#arcade-stage");
    if (!activeTransition || !stage || stage.querySelector?.("[data-arcade-transition]")) return;
    const duration = Math.max(1, Number(activeTransition.duration) || 1);
    const target = game?.type === "monster" ? stage.querySelector(".arcade-monster-battlefield") || stage : stage;
    target.insertAdjacentHTML?.("beforeend", `<button type="button" class="arcade-transition-skip" data-arcade-transition aria-label="${esc(copy().skipTransition)}" style="--arcade-transition-duration:${duration}ms"><span><b>${esc(copy().skipTransition)}</b><i aria-hidden="true"></i></span></button>`);
  }

  function orderedGameEntries(gameLink = activeGameLink(), c = copy()) {
    const entries = Object.entries(c.games);
    const recommended = entries.find(([id]) => id === gameLink.recommendedGame);
    return recommended ? [recommended, ...entries.filter(([id]) => id !== gameLink.recommendedGame)] : entries;
  }

  function renderHall() {
    const c = copy();
    const gameLink = activeGameLink();
    q("#arcade-eyebrow").textContent = c.eyebrow;
    q("#arcade-title").textContent = c.title;
    q("#arcade-subtitle").textContent = c.subtitle;
    q("#arcade-total-label").textContent = c.total;
    q("#arcade-safety").querySelector("span").textContent = c.safety;
    const stats = readStats();
    const total = Object.values(stats).reduce((sum, item) => sum + Number(item.best || 0), 0);
    q("#arcade-total-score").textContent = total.toLocaleString();
    const level = activeLevel();
    const learning = learningSnapshot(level);
    const collection = monsterCollectionSnapshot(level);
    const allCollection = allMonsterCollectionSnapshot(level);
    const bridge = q("#arcade-learning-bridge");
    if (bridge) {
      q("#arcade-learning-title").textContent = c.learningBridgeTitle(level);
      q("#arcade-monster-collection").textContent = c.monsterCollection(collection.chapterDefeated, allCollection.defeated);
      q("#arcade-learning-seen").textContent = Number(learning.seen || 0).toLocaleString();
      q("#arcade-learning-due").textContent = Number(learning.due || 0).toLocaleString();
      q("#arcade-learning-wrong").textContent = Number(learning.wrong || 0).toLocaleString();
      q("#arcade-learning-mastered").textContent = Number(learning.mastered || 0).toLocaleString();
      q("#arcade-learning-seen-label").textContent = c.learningSeen;
      q("#arcade-learning-due-label").textContent = c.learningDue;
      q("#arcade-learning-wrong-label").textContent = c.learningWrong;
      q("#arcade-learning-mastered-label").textContent = c.learningMastered;
      q("#arcade-review-learning").textContent = c.learningReview(Number(learning.wrong || 0));
      bridge.style.setProperty("--learning-progress", `${learning.total ? Math.round(Number(learning.seen || 0) / learning.total * 100) : 0}%`);
      bridge.dataset.chapterCleared = String(collection.chapterCleared);
    }
    const hasRegister = registerPacks().length > 0;
    q("#arcade-grid").innerHTML = orderedGameEntries(gameLink, c).map(([id, item]) => {
      const gradeLinked = REGISTER_GAMES.has(id);
      const locked = gradeLinked && !hasRegister;
      const recommended = id === gameLink.recommendedGame && !locked;
      const best = Number(stats[id]?.best || 0);
      const monsterProgress = id === "monster" ? Number(allCollection.defeated || 0) : 0;
      const hasCardProgress = best > 0 || monsterProgress > 0;
      const cardValue = best > 0 ? best.toLocaleString() : monsterProgress > 0 ? c.monsterCardProgress(monsterProgress) : c.start;
      const cardLabel = best > 0 ? c.best : monsterProgress > 0 ? c.monsterCardProgressLabel : c.notPlayed;
      const kicker = recommended ? `${item[0]} · ${c.gradePick(gameLink.grade)}` : (gradeLinked ? `${item[0]} · ${c.gradeFocus(gameLink.grade)}` : item[0]);
      return `<button class="arcade-card ${locked ? "locked" : ""} ${recommended ? "recommended" : ""}" data-game="${id}" ${COMMERCE_FREE_GAMES.has(id) ? "" : `data-premium-feature="arcade:${id}"`} data-current-grade="${gameLink.grade}" data-speak-text="${esc(item[1])}" data-speech-track="navigation" style="--game:${GAME_COLORS[id]}" ${locked ? "disabled" : ""}>
        <span class="arcade-game-icon">${esc(item[3])}</span>
        <span class="arcade-game-copy"><span>${esc(kicker)}</span><b>${esc(item[1])}</b><small>${esc(locked ? c.noData : item[2])}</small></span>
        <span class="arcade-card-score ${hasCardProgress ? "" : "is-empty"}"><b>${esc(cardValue)}</b><small>${esc(cardLabel)}</small></span>
      </button>`;
    }).join("");
    q("#arcade-review-learning").disabled = false;
    q("#arcade-expand").disabled = false;
    const visionCta = q("#battle-vision-cta");
    if (visionCta) {
      visionCta.disabled = false;
      visionCta.dataset.speakText = q("#battle-vision-cta-label")?.textContent || c.games.monster[1];
      visionCta.dataset.speakLang = direction() === "zh-th" ? "zh-CN" : "th-TH";
    }
    syncHallExpansion();
  }

  function openLearningReview() {
    const level = Number(game?.campaignLevel || activeLevel());
    const snapshot = learningSnapshot(level);
    const state = Number(snapshot.wrong || 0) > 0 ? "wrong" : "due";
    if (window.VocabUI?.openReview) return window.VocabUI.openReview({ level, state });
    try { globalThis.HUILAISHI_STORAGE?.setItem(`huilaishi-vocab-level-${direction()}`, String(level)); } catch (_) {}
    try { window.navigate?.("library"); } catch (_) {}
  }

  function syncHallExpansion() {
    const grid = q("#arcade-grid");
    const button = q("#arcade-expand");
    if (!grid || !button) return;
    grid.classList.toggle("is-expanded", hallExpanded);
    button.setAttribute("aria-expanded", String(hallExpanded));
    button.querySelector("span").textContent = hallExpanded ? copy().showLess : copy().showAll;
    button.dataset.speakText = hallExpanded ? copy().showLess : copy().showAll;
    button.dataset.speakLang = direction() === "zh-th" ? "zh-CN" : "th-TH";
  }

  function clearTimers() {
    cancelSkippableTransition();
    clearInterval(timerId); timerId = 0;
    monsterStatusObserver?.disconnect?.();
    monsterStatusObserver = null;
    wordAudioRequest += 1;
    pendingIds.forEach(id => clearTimeout(id)); pendingIds.clear();
    stopVoiceAudio();
    try { window.HUILAISHI_SPEECH?.stop?.(); } catch (_) {}
    try { window.PronunciationScorer?.cancelChallenge?.(); } catch (_) {}
  }

  function setSheetMeta(type) {
    const c = copy();
    const item = c.games[type];
    q("#arcade-sheet-kicker").textContent = item[0];
    q("#arcade-sheet-title").textContent = item[1];
    q("#arcade-score-label").textContent = c.score;
    q("#arcade-close").setAttribute("aria-label", c.close);
    q("#arcade-next").textContent = c.next;
    setScore(0);
    setProgress(0);
    q("#arcade-timer").textContent = "--";
    q("#arcade-round").textContent = c.ready;
    hideFeedback();
  }

  function openGame(type) {
    clearTimers();
    document.body?.classList?.remove?.("arcade-monster-active");
    game = null;
    if (!copy().games[type]) return;
    if (!canUseGame(type)) {
      requestPremium(`arcade:${type}`);
      return;
    }
    const gameLink = activeGameLink();
    const packs = gradePracticePacks(gameLink.grade);
    if (REGISTER_GAMES.has(type) && !packs.length) return;
    setSheetMeta(type);
    const sheet = q("#arcade-sheet");
    if (sheet) sheet.dataset.arcadeGame = type;
    if (typeof openSheet === "function") openSheet("arcade-sheet");
    else { q("#modal-backdrop").classList.remove("hidden"); q("#arcade-sheet").classList.remove("hidden"); }
    ensureArcadeOrientationHint();
    setGameOrientation(true);
    const base = { type, direction: direction(), grade: gameLink.grade, gamePolicy: gameLink.policy, score: 0, correct: 0, streak: 0, bestStreak: 0, answered: false, round: 0, startedAt: Date.now(), learningAttempts: 0, learningCorrectIds: new Set(), learningWrongIds: new Set() };
    if (type === "voice") startVoiceGate({ ...base, total: 6, words: pickWords(12, { learningAudio: true }) });
    if (type === "monster") startMonsterBattle({ ...base, words: pickWords(80, { learningAudio: true }) });
    if (type === "match") startMatch(base);
    if (type === "audio") startWordQuiz({ ...base, total: 8, words: pickWords(12, { learningAudio: true }) });
    if (type === "speed") startSpeed({ ...base, words: pickWords(80), seconds: 45 });
    if (type === "tone") { const items = buildToneItems(10, gameLink.grade, packs); startTone({ ...base, total: items.length, items }); }
    if (type === "polish") { const items = shuffle(packs).slice(0, 8); startPolish({ ...base, total: items.length, items }); }
    if (type === "grade-lock") { const items = buildGradeLockItems(8, gameLink.grade, packs); startGradeLock({ ...base, total: items.length, items }); }
    if (type === "scene-listen") { const items = buildSceneListenItems(8, gameLink.grade, packs); startSceneListen({ ...base, total: items.length, items }); }
    if (type === "register-shift") { const items = buildRegisterShiftItems(8, gameLink.grade, packs); startRegisterShift({ ...base, total: items.length, items }); }
    if (type === "memory") startMemory(base);
    if (type === "survival") startSurvival({ ...base, words: pickWords(80), seconds: 30 });
    if (type === "bingo") startBingo(base);
    if (type === "reflex") startReflex({ ...base, words: pickWords(80), seconds: 25 });
    vibrate(10);
  }

  function setScore(value) { q("#arcade-score").textContent = Math.max(0, Math.round(value)).toLocaleString(); }
  function setProgress(value) { q("#arcade-progress-fill").style.width = `${Math.max(0, Math.min(100, value))}%`; }
  function hideFeedback() { q("#arcade-feedback").className = "arcade-feedback hidden"; q("#arcade-feedback").innerHTML = ""; q("#arcade-next").classList.add("hidden"); }
  function showFeedback(title, body, risk) {
    const box = q("#arcade-feedback");
    box.className = `arcade-feedback${risk ? " risk" : ""}`;
    box.innerHTML = `<strong>${esc(title)}</strong>${esc(body)}`;
  }

  function setAudioStatus(message = "", isError = false, actions = {}) {
    const node = q("#arcade-audio-status");
    if (!node) return;
    node.replaceChildren();
    const label = document.createElement("span");
    label.textContent = message;
    node.append(label);
    if (actions.installLevel || actions.allowFallback) {
      const group = document.createElement("span");
      group.className = "arcade-audio-status-actions";
      if (actions.installLevel) {
        const install = document.createElement("button");
        install.type = "button";
        install.dataset.audioInstall = String(actions.installLevel);
        install.textContent = copy().installPack(actions.installLevel);
        group.append(install);
      }
      if (actions.allowFallback) {
        const fallback = document.createElement("button");
        fallback.type = "button";
        fallback.dataset.audioFallback = "1";
        fallback.textContent = copy().useText;
        group.append(fallback);
      }
      node.append(group);
    }
    node.dataset.state = isError ? "error" : (message ? "loading" : "ready");
  }

  function openVoicePackInstaller(level) {
    clearTimers();
    game = null;
    try { window.closeSheets?.(); } catch (_) {}
    try { window.navigate?.("profile"); } catch (_) {}
    if (!window.VoicePackUI?.open) {
      window.showToast?.(copy().audioUnavailable(level));
      return;
    }
    window.VoicePackUI.open();
    [120, 420, 900].forEach(delay => schedule(() => {
      const row = document.querySelector(`[data-pack-row="${direction()}-l${level}"]`);
      row?.scrollIntoView?.({ block: "center", behavior: "smooth" });
      row?.querySelector("button:not(:disabled)")?.focus?.({ preventScroll: true });
    }, delay));
  }

  function enableAudioFallback() {
    if (!game || !["audio", "bingo"].includes(game.type)) return;
    wordAudioRequest += 1;
    if (game.type === "audio") {
      game.audioFallback = true;
      renderWordQuestion();
      return;
    }
    game.bingoTextFallback = true;
    renderBingoBoard();
  }

  function speak(value, lang, options = {}) {
    if (!value) return;
    try {
      if (window.HUILAISHI_SPEECH?.speak) return window.HUILAISHI_SPEECH.speak(value, { ...options, lang, rate: .78 });
      if (typeof speakText === "function") return speakText(value, lang, .78, options);
      if (!window.speechSynthesis) return;
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(value); utterance.lang = lang; utterance.rate = .78; speechSynthesis.speak(utterance);
    } catch (_) {}
  }

  async function playWordVoice(word, playback = {}) {
    if (!word) return;
    const c = copy();
    const view = wordView(word);
    const options = wordVoiceOptions(word);
    const requestId = ++wordAudioRequest;
    setAudioStatus(c.audioLoading);
    try {
      const engine = window.HUILAISHI_SPEECH;
      if (!engine?.speak) throw new Error("speech-engine-unavailable");
      const catalogRequest = { text: view.target, lang: view.voiceLang, track: "standard", key: options.audioKey };
      const bundled = window.HUILAISHI_STARTER_VOCAB_AUDIO?.lookup?.(catalogRequest)
        || window.HUILAISHI_CUTE_AUDIO?.lookup?.(catalogRequest);
      if (bundled) {
        if (requestId !== wordAudioRequest || game?.current !== word) return;
        setAudioStatus();
        engine.speak(view.target, { ...options, lang: view.voiceLang, rate: .78, onEnd: playback.onEnd, onError: playback.onError });
        return true;
      }
      const manager = window.HUILAISHI_VOICE_PACKS;
      if (!manager) throw new Error("voice-pack-manager-unavailable");
      const request = { text: view.target, lang: view.voiceLang, level: options.voicePackLevel, direction: options.direction, key: options.audioKey };
      const source = manager.resolveSync?.(request) || await manager.resolve?.(request);
      if (requestId !== wordAudioRequest || game?.current !== word) return;
      if (!source) {
        setAudioStatus(c.audioUnavailable(view.level), true, { installLevel: view.level, allowFallback: true });
        try { playback.onError?.({ reason: "learning-audio-unavailable" }); } catch (_) {}
        return false;
      }
      setAudioStatus();
      engine.speak(view.target, { ...options, lang: view.voiceLang, rate: .78, onEnd: playback.onEnd, onError: playback.onError });
      return true;
    } catch (_) {
      if (requestId === wordAudioRequest && game?.current === word) setAudioStatus(c.audioFailed, true, { installLevel: view.level, allowFallback: true });
      try { playback.onError?.({ reason: "learning-audio-failed" }); } catch (_) {}
      return false;
    }
  }

  function playRegisterVariant(pack, variant) {
    if (!pack || !variant) return;
    const view = packView(variant);
    setAudioStatus();
    speak(view.target, view.voiceLang, { audioKey: `register:${pack.id}:${variant.grade}:${direction() === "zh-th" ? "th" : "zh"}`, track: "standard" });
  }

  function playRegisterVoice() {
    if (!game || !REGISTER_GAMES.has(game.type) || !game.current) return;
    const pack = game.current.pack;
    const variant = game.current.variant || game.current.source;
    playRegisterVariant(pack, variant);
  }

  function playRegisterOption(index) {
    if (!game || !["grade-lock", "register-shift"].includes(game.type)) return;
    const option = game.options?.[index];
    if (!option?.variant) return;
    playRegisterVariant(option.pack || game.current?.pack, option.variant);
  }

  function startMatch(base) {
    const words = pickWords(6);
    if (words.length < 6) return showEmpty();
    const pairs = words.map(word => {
      const view = wordView(word);
      return {
        target: { pair: view.id, side: "target", text: view.target, lang: view.lang },
        meaning: { pair: view.id, side: "meaning", text: view.meaning, lang: direction() === "zh-th" ? "zh-CN" : "th" }
      };
    });
    const tiles = [...shuffle(pairs.map(item => item.target)), ...shuffle(pairs.map(item => item.meaning))];
    game = { ...base, words, tiles, pairs: 0, selected: null, seconds: 60, phase: "ready", startedAt: 0, endsAt: 0 };
    renderMatchReady();
  }

  function renderMatchReady() {
    if (!game || game.type !== "match") return;
    const c = copy();
    const sheet = q("#arcade-sheet");
    if (sheet) sheet.dataset.arcadePhase = "match-ready";
    q("#arcade-round").textContent = c.ready;
    q("#arcade-timer").textContent = c.time(60);
    setProgress(0);
    q("#arcade-stage").innerHTML = `<div class="arcade-prompt match-ready" role="group" aria-labelledby="arcade-match-ready-title"><span class="game-chip">L${activeLevel()} · MATCH</span><h3 id="arcade-match-ready-title">${esc(c.matchReadyTitle)}</h3><p>${esc(c.tapPair)}</p><span class="meaning-hint">${esc(c.matchReadyCopy)}</span><button type="button" id="arcade-match-start" data-match-start>${esc(c.matchStart)}</button></div>`;
    globalThis.requestAnimationFrame?.(() => q("#arcade-match-start")?.focus?.({ preventScroll: true }));
  }

  function beginMatchCountdown() {
    if (!game || game.type !== "match" || game.phase !== "ready") return;
    game.phase = "countdown";
    let remaining = 3;
    const renderCountdown = () => {
      if (!game || game.type !== "match" || game.phase !== "countdown") return;
      q("#arcade-round").textContent = copy().matchCountdown(remaining);
      q("#arcade-timer").textContent = String(remaining);
      q("#arcade-stage").innerHTML = `<div class="arcade-prompt match-countdown" role="status" aria-live="assertive"><span class="game-chip">${esc(copy().matchCountdown(remaining))}</span><h3>${remaining}</h3></div>`;
      mountTransitionSkip();
    };
    const finishCountdown = () => {
      clearInterval(timerId); timerId = 0;
      startMatchTimer();
    };
    beginSkippableTransition(finishCountdown, 3000);
    renderCountdown();
    timerId = setInterval(() => {
      if (!game || game.type !== "match" || game.phase !== "countdown") return;
      remaining = Math.max(1, remaining - 1);
      renderCountdown();
    }, 1000);
  }

  function startMatchTimer() {
    if (!game || game.type !== "match" || game.phase !== "countdown") return;
    game.phase = "playing";
    game.startedAt = Date.now();
    game.endsAt = game.startedAt + 60_000;
    renderMatch();
    const updateTimer = () => {
      if (!game || game.type !== "match" || game.phase !== "playing") return;
      game.seconds = Math.max(0, Math.ceil((game.endsAt - Date.now()) / 1000));
      q("#arcade-timer").textContent = copy().time(game.seconds);
      setProgress((60 - game.seconds) / 60 * 100);
      if (game.seconds <= 0) finishGame();
    };
    updateTimer();
    timerId = setInterval(() => {
      updateTimer();
    }, 250);
  }

  function renderMatch() {
    const c = copy();
    const sheet = q("#arcade-sheet");
    if (sheet) sheet.dataset.arcadePhase = "match-playing";
    q("#arcade-round").textContent = c.pairs(game.pairs, 6);
    q("#arcade-timer").textContent = c.time(game.seconds);
    const column = (side, label) => `<div class="match-column"><span>${esc(label)}</span>${game.tiles.map((tile, index) => ({ tile, index })).filter(item => item.tile.side === side).map(({ tile, index }) => `<button class="match-tile" data-match-index="${index}" data-side="${tile.side}" lang="${tile.lang}">${esc(tile.text)}</button>`).join("")}</div>`;
    q("#arcade-stage").innerHTML = `<div class="match-board" role="group" aria-label="${esc(c.tapPair)}">${column("target", c.matchTarget)}${column("meaning", c.matchMeaning)}</div>`;
    try { sheet?.scrollTo?.({ top: 0, behavior: "auto" }); } catch (_) {}
    globalThis.requestAnimationFrame?.(() => q("#arcade-stage [data-match-index]")?.focus?.({ preventScroll: true }));
  }

  function chooseMatch(button) {
    if (!game || game.type !== "match" || game.phase !== "playing" || button.disabled) return;
    const index = Number(button.dataset.matchIndex);
    const tile = game.tiles[index];
    if (!game.selected) {
      game.selected = { index, tile, button }; button.classList.add("selected"); return;
    }
    const first = game.selected;
    if (first.index === index) { button.classList.remove("selected"); game.selected = null; return; }
    if (first.tile.side === tile.side) {
      first.button.classList.remove("selected"); game.selected = { index, tile, button }; button.classList.add("selected"); return;
    }
    if (first.tile.pair === tile.pair) {
      first.button.classList.remove("selected"); first.button.classList.add("matched"); button.classList.add("matched"); first.button.disabled = true; button.disabled = true;
      game.selected = null; game.pairs += 1; game.correct += 1; game.streak += 1; game.bestStreak = Math.max(game.bestStreak, game.streak); game.score += 120 + game.streak * 12; setScore(game.score);
      recordLearningResult(game.words.find(word => word.id === tile.pair), true);
      q("#arcade-round").textContent = copy().pairs(game.pairs, 6); vibrate(12);
      if (game.pairs === 6) { game.score += game.seconds * 20; setScore(game.score); schedule(finishGame, 350); }
    } else {
      first.button.classList.remove("selected"); first.button.classList.add("miss"); button.classList.add("miss"); game.selected = null; game.streak = 0; vibrate([18, 45, 18]);
      [first.tile.pair, tile.pair].filter((id, itemIndex, ids) => ids.indexOf(id) === itemIndex).forEach(id => recordLearningResult(game.words.find(word => word.id === id), false));
      schedule(() => { first.button.classList.remove("miss"); button.classList.remove("miss"); }, 320);
    }
  }

  function startMemory(base) {
    const words = pickWords(4);
    if (words.length < 4) return showEmpty();
    const cards = shuffle(words.flatMap(word => {
      const view = wordView(word);
      return [
        { pair: view.id, side: "target", text: view.target, lang: view.lang, word, revealed: false, matched: false },
        { pair: view.id, side: "meaning", text: view.meaning, lang: direction() === "zh-th" ? "zh-CN" : "th", word, revealed: false, matched: false }
      ];
    }));
    game = { ...base, words, cards, total: 4, pairs: 0, flips: 0, selected: null, busy: false };
    renderMemory();
  }

  function renderMemory() {
    if (!game || game.type !== "memory") return;
    hideFeedback();
    const c = copy();
    q("#arcade-round").textContent = c.memoryPairs(game.pairs, game.total);
    q("#arcade-timer").textContent = `${game.streak}×`;
    setProgress(game.pairs / game.total * 100);
    q("#arcade-stage").innerHTML = `<div class="arcade-memory-head"><span class="game-chip">L${activeLevel()} · MEMORY</span><h3>${esc(c.memoryPrompt)}</h3><p data-memory-status role="status" aria-live="polite">${esc(c.memoryPairs(game.pairs, game.total))}</p></div><div class="arcade-memory-board" role="grid">${game.cards.map((card, index) => `<button type="button" class="arcade-memory-card${card.revealed ? " is-revealed" : ""}${card.matched ? " is-matched" : ""}" data-memory-index="${index}" role="gridcell" aria-label="${esc(card.revealed || card.matched ? card.text : c.memoryCard(index + 1))}" aria-pressed="${card.revealed || card.matched ? "true" : "false"}" ${card.matched ? "disabled" : ""}><span class="arcade-memory-front" aria-hidden="true"><i>${String(index + 1).padStart(2, "0")}</i><b>?</b></span><span class="arcade-memory-back" lang="${card.lang}" aria-hidden="true"><small>${card.side === "target" ? (direction() === "zh-th" ? "TH" : "ZH") : (direction() === "zh-th" ? "ZH" : "TH")}</small><b>${esc(card.text)}</b></span></button>`).join("")}</div>`;
    globalThis.requestAnimationFrame?.(() => q("#arcade-stage [data-memory-index]:not(:disabled)")?.focus?.({ preventScroll: true }));
  }

  function chooseMemory(index) {
    if (!game || game.type !== "memory" || game.busy) return;
    const card = game.cards[index];
    const button = q(`[data-memory-index="${index}"]`);
    if (!card || !button || card.matched || card.revealed) return;
    card.revealed = true;
    button.classList.add("is-revealed");
    button.setAttribute("aria-pressed", "true");
    button.setAttribute("aria-label", card.text);
    if (card.side === "target") {
      game.current = card.word;
      void playWordVoice(card.word);
    }
    if (game.selected == null) {
      game.selected = index;
      vibrate(8);
      return;
    }
    const firstIndex = game.selected;
    const first = game.cards[firstIndex];
    const firstButton = q(`[data-memory-index="${firstIndex}"]`);
    game.selected = null;
    game.flips += 1;
    if (first?.pair === card.pair && first.side !== card.side) {
      first.matched = true;
      card.matched = true;
      firstButton?.classList.add("is-matched");
      button.classList.add("is-matched");
      if (firstButton) firstButton.disabled = true;
      button.disabled = true;
      game.pairs += 1;
      game.correct += 1;
      game.streak += 1;
      game.bestStreak = Math.max(game.bestStreak, game.streak);
      game.score += 150 + game.streak * 25;
      recordLearningResult(card.word, true);
      setScore(game.score);
      setProgress(game.pairs / game.total * 100);
      q("#arcade-round").textContent = copy().memoryPairs(game.pairs, game.total);
      q("#arcade-timer").textContent = `${game.streak}×`;
      const status = q("[data-memory-status]");
      if (status) status.textContent = `${copy().memoryMatch} · ${game.streak}×`;
      vibrate([10, 24, 12]);
      if (game.pairs >= game.total) schedule(finishGame, 520);
      return;
    }
    game.busy = true;
    game.streak = 0;
    [first?.word, card.word].filter((word, itemIndex, words) => word && words.findIndex(item => item?.id === word.id) === itemIndex).forEach(word => recordLearningResult(word, false));
    q("#arcade-timer").textContent = "0×";
    firstButton?.classList.add("is-miss");
    button.classList.add("is-miss");
    const status = q("[data-memory-status]");
    if (status) status.textContent = copy().memoryMiss;
    vibrate([16, 35, 16]);
    const active = game;
    schedule(() => {
      if (game !== active || game.type !== "memory") return;
      first.revealed = false;
      card.revealed = false;
      game.busy = false;
      renderMemory();
    }, 680);
  }

  function startSurvival(base) {
    if (base.words.length < 8) return showEmpty();
    game = { ...base, total: 0, lives: 3, maxLives: 3, phase: "ready", answerLock: false, endsAt: 0, remainingMs: 30000 };
    renderSurvivalReady();
  }

  function renderSurvivalReady() {
    if (!game || game.type !== "survival") return;
    hideFeedback();
    const c = copy();
    q("#arcade-round").textContent = c.ready;
    q("#arcade-timer").textContent = c.time(30);
    setProgress(100);
    q("#arcade-stage").innerHTML = `<section class="arcade-survival-ready"><span class="game-chip">SURVIVAL · 3 HP</span><div class="arcade-survival-heart" aria-hidden="true">♥</div><h3>${esc(c.survivalTitle)}</h3><p>${esc(c.survivalCopy)}</p><button type="button" data-survival-start>${esc(c.survivalStart)}</button></section>`;
    globalThis.requestAnimationFrame?.(() => q("[data-survival-start]")?.focus?.({ preventScroll: true }));
  }

  function beginSurvival() {
    if (!game || game.type !== "survival" || game.phase !== "ready") return;
    game.phase = "playing";
    game.startedAt = Date.now();
    game.endsAt = game.startedAt + 30000;
    renderSurvivalQuestion();
    clearInterval(timerId);
    timerId = setInterval(updateSurvivalTimer, 100);
    updateSurvivalTimer();
  }

  function updateSurvivalTimer() {
    if (!game || game.type !== "survival" || game.phase !== "playing") return;
    game.remainingMs = Math.max(0, game.endsAt - Date.now());
    const seconds = Math.ceil(game.remainingMs / 1000);
    q("#arcade-timer").textContent = copy().time(seconds);
    setProgress(Math.min(100, game.remainingMs / 30000 * 100));
    const timer = q("[data-survival-time]");
    if (timer) timer.textContent = seconds.toFixed(0);
    if (game.remainingMs <= 0) {
      game.total = Math.max(1, game.round);
      finishGame();
    }
  }

  function renderSurvivalQuestion() {
    if (!game || game.type !== "survival" || game.phase !== "playing") return;
    hideFeedback();
    game.answerLock = false;
    const c = copy();
    const word = game.words[game.round % game.words.length];
    const view = wordView(word);
    game.current = word;
    game.options = makeWordOptions(word);
    q("#arcade-round").textContent = `${game.round + 1} · ${game.streak}× COMBO`;
    q("#arcade-stage").innerHTML = `<div class="arcade-survival-hud"><span class="arcade-survival-lives" aria-label="${esc(c.survivalLives(game.lives))}">${Array.from({ length: game.maxLives }, (_, index) => `<i class="${index >= game.lives ? "is-lost" : ""}" aria-hidden="true">♥</i>`).join("")}</span><strong><b data-survival-time>${Math.ceil(game.remainingMs / 1000)}</b><small>SEC</small></strong></div><div class="arcade-prompt arcade-survival-prompt"><span class="game-chip">L${activeLevel()} · SURVIVAL</span><button type="button" class="arcade-survival-audio" data-survival-audio aria-label="${esc(c.monsterHear)}"><svg><use href="#i-volume"></use></svg></button><h3 lang="${view.lang}">${esc(view.target)}</h3><p>${esc(view.reading)}</p>${phoneticHintMarkup(view.phoneticHint)}<span class="meaning-hint">${esc(c.survivalPrompt)}</span><em data-survival-status role="status" aria-live="assertive">${esc(c.survivalLives(game.lives))}</em></div><div class="arcade-options arcade-survival-options">${game.options.map((option, index) => `<button type="button" class="arcade-option" data-survival-answer="${index}" ${choiceShortcutAttrs(index)}><span>${c.answerLetters[index]}</span><span class="arcade-option-copy"><b>${esc(option.view.meaning)}</b></span></button>`).join("")}</div>`;
    primeWordVoice(word);
  }

  function chooseSurvivalAnswer(index) {
    if (!game || game.type !== "survival" || game.phase !== "playing" || game.answerLock) return;
    const option = game.options[index];
    if (!option) return;
    game.answerLock = true;
    const correctIndex = game.options.findIndex(item => item.correct);
    const correct = Boolean(option.correct);
    recordLearningResult(game.current, correct);
    markButtons("#arcade-stage [data-survival-answer]", index, correctIndex);
    game.round += 1;
    if (correct) {
      game.correct += 1;
      game.streak += 1;
      game.bestStreak = Math.max(game.bestStreak, game.streak);
      game.score += 105 + game.streak * 18;
      game.endsAt += 1500;
      const status = q("[data-survival-status]");
      if (status) status.textContent = `${copy().correct} · ${copy().survivalBonus}`;
      vibrate(12);
    } else {
      game.lives = Math.max(0, game.lives - 1);
      game.streak = 0;
      const status = q("[data-survival-status]");
      if (status) status.textContent = `${copy().survivalLost} · ${copy().survivalLives(game.lives)}`;
      vibrate([18, 38, 18]);
    }
    setScore(game.score);
    if (game.lives <= 0) {
      game.total = Math.max(1, game.round);
      return schedule(finishGame, 520);
    }
    const active = game;
    schedule(() => {
      if (game !== active || game.type !== "survival" || game.phase !== "playing") return;
      renderSurvivalQuestion();
      updateSurvivalTimer();
    }, 420);
  }

  function startBingo(base) {
    const words = pickWords(9, { learningAudio: true });
    if (words.length < 9) return showEmpty();
    game = {
      ...base,
      words,
      board: shuffle(words),
      queue: shuffle(words),
      total: 9,
      attempts: 0,
      marked: new Set(),
      completedLines: new Set(),
      lines: 0,
      phase: "ready",
      answerLock: false,
      bingoTextFallback: false
    };
    renderBingoReady();
  }

  function renderBingoReady() {
    if (!game || game.type !== "bingo") return;
    hideFeedback();
    const c = copy();
    q("#arcade-round").textContent = c.ready;
    q("#arcade-timer").textContent = "2 LINE";
    setProgress(0);
    q("#arcade-stage").innerHTML = `<section class="arcade-bingo-ready"><span class="game-chip">AUDIO BINGO · 3×3</span><div class="arcade-bingo-ticket" aria-hidden="true"><i>ส</i><i>中</i><i>✓</i></div><h3>${esc(c.bingoTitle)}</h3><p>${esc(c.bingoCopy)}</p><button type="button" data-bingo-start>${esc(c.bingoStart)}</button></section>`;
    globalThis.requestAnimationFrame?.(() => q("[data-bingo-start]")?.focus?.({ preventScroll: true }));
  }

  function beginBingo() {
    if (!game || game.type !== "bingo" || game.phase !== "ready") return;
    game.phase = "playing";
    game.round = 0;
    nextBingoCall();
  }

  function nextBingoCall() {
    if (!game || game.type !== "bingo" || game.phase !== "playing") return;
    if (game.lines >= 2 || game.round >= game.queue.length) return finishGame();
    game.current = game.queue[game.round];
    game.answerLock = false;
    renderBingoBoard();
  }

  function renderBingoBoard() {
    if (!game || game.type !== "bingo" || game.phase !== "playing" || !game.current) return;
    hideFeedback();
    const c = copy();
    const view = wordView(game.current);
    const fallback = Boolean(game.bingoTextFallback);
    q("#arcade-round").textContent = c.bingoLines(game.lines, 2);
    q("#arcade-timer").textContent = `${game.streak}×`;
    setProgress(game.lines / 2 * 100);
    q("#arcade-stage").innerHTML = `<div class="arcade-bingo-head"><span class="game-chip">L${activeLevel()} · ${fallback ? "TEXT BINGO" : "AUDIO BINGO"}</span><button type="button" data-bingo-audio aria-label="${esc(c.bingoReplay)}"><svg><use href="#i-volume"></use></svg></button><div><h3 lang="${fallback ? view.lang : ""}">${fallback ? esc(view.target) : "♪ · ?"}</h3><p>${fallback ? esc(view.reading) : esc(c.bingoPrompt)}</p></div><small id="arcade-audio-status" role="status" aria-live="polite"></small><em data-bingo-status role="status" aria-live="assertive">${esc(c.bingoLines(game.lines, 2))}</em></div><div class="arcade-bingo-board" role="grid">${game.board.map((word, index) => { const cell = wordView(word); const marked = game.marked.has(index); const inLine = [...game.completedLines].some(lineIndex => BINGO_LINES[lineIndex].includes(index)); return `<button type="button" class="arcade-bingo-cell${marked ? " is-marked" : ""}${inLine ? " is-line" : ""}" data-bingo-index="${index}" role="gridcell" ${marked ? "disabled" : ""} ${choiceShortcutAttrs(index)}><i aria-hidden="true">${String(index + 1).padStart(2, "0")}</i><b>${esc(cell.meaning)}</b><span aria-hidden="true">✓</span></button>`; }).join("")}</div>`;
    primeWordVoice(game.current);
    if (fallback) setAudioStatus(copy().textFallbackReady, false, { installLevel: view.level });
    else schedule(() => { if (game?.type === "bingo" && game.current?.id === view.id) void playWordVoice(game.current); }, 120);
    globalThis.requestAnimationFrame?.(() => q("#arcade-stage [data-bingo-index]:not(:disabled)")?.focus?.({ preventScroll: true }));
  }

  function chooseBingo(index) {
    if (!game || game.type !== "bingo" || game.phase !== "playing" || game.answerLock || game.marked.has(index)) return;
    const selected = game.board[index];
    const button = q(`[data-bingo-index="${index}"]`);
    if (!selected || !button) return;
    game.attempts += 1;
    const correct = selected.id === game.current.id;
    const status = q("[data-bingo-status]");
    if (!correct) {
      recordLearningResult(game.current, false);
      game.streak = 0;
      q("#arcade-timer").textContent = "0×";
      button.classList.add("is-wrong");
      if (status) status.textContent = copy().bingoMiss;
      vibrate([16, 34, 16]);
      const active = game;
      schedule(() => {
        if (game !== active || game.type !== "bingo") return;
        button.classList.remove("is-wrong");
        void playWordVoice(game.current);
      }, 420);
      return;
    }
    game.answerLock = true;
    recordLearningResult(game.current, true);
    game.marked.add(index);
    game.round += 1;
    game.correct += 1;
    game.streak += 1;
    game.bestStreak = Math.max(game.bestStreak, game.streak);
    game.score += 150 + game.streak * 25;
    BINGO_LINES.forEach((line, lineIndex) => {
      if (line.every(cell => game.marked.has(cell)) && !game.completedLines.has(lineIndex)) {
        game.completedLines.add(lineIndex);
        game.score += 250;
      }
    });
    game.lines = game.completedLines.size;
    button.classList.add("is-marked");
    button.disabled = true;
    [...game.completedLines].forEach(lineIndex => BINGO_LINES[lineIndex].forEach(cell => q(`[data-bingo-index="${cell}"]`)?.classList.add("is-line")));
    q("#arcade-round").textContent = copy().bingoLines(game.lines, 2);
    q("#arcade-timer").textContent = `${game.streak}×`;
    setProgress(game.lines / 2 * 100);
    setScore(game.score);
    if (status) status.textContent = game.lines >= 2 ? copy().bingoWin : copy().bingoHit;
    vibrate(game.lines >= 2 ? [12, 28, 20, 34] : [10, 22, 12]);
    const active = game;
    beginSkippableTransition(() => {
      if (game !== active || game.type !== "bingo") return;
      if (game.lines >= 2 || game.round >= game.queue.length) return finishGame();
      nextBingoCall();
    }, game.lines >= 2 ? 780 : 460);
    mountTransitionSkip();
  }

  function startReflex(base) {
    if (base.words.length < 8) return showEmpty();
    game = { ...base, total: 0, attempts: 0, phase: "ready", answerLock: false, timeUp: false, endsAt: 0, remainingMs: base.seconds * 1000 };
    renderReflexReady();
  }

  function renderReflexReady() {
    if (!game || game.type !== "reflex") return;
    hideFeedback();
    const c = copy();
    q("#arcade-round").textContent = c.ready;
    q("#arcade-timer").textContent = c.time(game.seconds);
    setProgress(100);
    q("#arcade-stage").innerHTML = `<section class="arcade-reflex-ready"><span class="game-chip">TRUE / FALSE · 25 SEC</span><div class="arcade-reflex-burst" aria-hidden="true"><i>✓</i><b>?</b><i>✕</i></div><h3>${esc(c.reflexTitle)}</h3><p>${esc(c.reflexCopy)}</p><button type="button" data-reflex-start>${esc(c.reflexStart)}</button></section>`;
    globalThis.requestAnimationFrame?.(() => q("[data-reflex-start]")?.focus?.({ preventScroll: true }));
  }

  function beginReflex() {
    if (!game || game.type !== "reflex" || game.phase !== "ready") return;
    game.phase = "playing";
    game.startedAt = Date.now();
    game.endsAt = game.startedAt + game.seconds * 1000;
    renderReflexRound();
    clearInterval(timerId);
    timerId = setInterval(updateReflexTimer, 100);
    updateReflexTimer();
  }

  function finishReflex() {
    if (!game || game.type !== "reflex" || game.phase === "done") return;
    game.phase = "done";
    game.total = game.attempts;
    finishGame();
  }

  function updateReflexTimer() {
    if (!game || game.type !== "reflex" || game.phase !== "playing") return;
    game.remainingMs = Math.max(0, game.endsAt - Date.now());
    const seconds = Math.ceil(game.remainingMs / 1000);
    q("#arcade-timer").textContent = copy().time(seconds);
    setProgress(game.remainingMs / (game.seconds * 1000) * 100);
    const timer = q("[data-reflex-time]");
    if (timer) timer.textContent = String(seconds);
    if (game.remainingMs <= 0) {
      game.timeUp = true;
      if (!game.answerLock) finishReflex();
    }
  }

  function renderReflexRound() {
    if (!game || game.type !== "reflex" || game.phase !== "playing") return;
    hideFeedback();
    game.answerLock = false;
    game.timeUp = false;
    const c = copy();
    const word = game.words[game.round % game.words.length];
    const view = wordView(word);
    const truth = Math.random() >= .5;
    const distractor = shuffle(game.words.filter(item => item.id !== word.id && wordView(item).meaning !== view.meaning))[0];
    const shownMeaning = truth ? view.meaning : wordView(distractor).meaning;
    game.current = word;
    game.reflexTruth = truth;
    game.reflexMeaning = shownMeaning;
    game.cardStartedAt = Date.now();
    q("#arcade-round").textContent = `${game.round + 1} · ${game.streak}× COMBO`;
    q("#arcade-stage").innerHTML = `<div class="arcade-reflex-hud"><span>${esc(c.reflexPrompt)}</span><strong><b data-reflex-time>${Math.ceil(game.remainingMs / 1000)}</b><small>SEC</small></strong></div><div class="arcade-reflex-card" data-reflex-card><i aria-hidden="true">${String(game.round + 1).padStart(2, "0")}</i><span class="game-chip">L${activeLevel()} · SNAP</span><h3 lang="${view.lang}">${esc(view.target)}</h3><p>${esc(view.reading)}</p>${phoneticHintMarkup(view.phoneticHint)}<div class="arcade-reflex-divider"><span>↕</span></div><strong lang="${direction() === "zh-th" ? "zh-CN" : "th"}">${esc(shownMeaning)}</strong><em data-reflex-status role="status" aria-live="assertive">${esc(c.reflexPrompt)}</em></div><div class="arcade-reflex-actions"><button type="button" data-reflex-value="false"><i aria-hidden="true">✕</i><b>${esc(c.reflexFalse)}</b></button><button type="button" data-reflex-value="true"><i aria-hidden="true">✓</i><b>${esc(c.reflexTrue)}</b></button></div>`;
    globalThis.requestAnimationFrame?.(() => q("[data-reflex-value='true']")?.focus?.({ preventScroll: true }));
  }

  function chooseReflex(value) {
    if (!game || game.type !== "reflex" || game.phase !== "playing" || game.answerLock) return;
    game.answerLock = true;
    const choice = value === true || value === "true";
    const correct = choice === game.reflexTruth;
    recordLearningResult(game.current, correct);
    const reactionMs = Math.max(0, Date.now() - game.cardStartedAt);
    game.attempts += 1;
    game.round += 1;
    if (correct) {
      game.score += reflexPoints(reactionMs, game.streak);
      game.correct += 1;
      game.streak += 1;
      game.bestStreak = Math.max(game.bestStreak, game.streak);
    } else {
      game.streak = 0;
      game.endsAt -= 1000;
    }
    const card = q("[data-reflex-card]");
    if (card) card.dataset.result = correct ? "correct" : "wrong";
    const status = q("[data-reflex-status]");
    if (status) status.textContent = correct ? copy().reflexCorrect : copy().reflexWrong;
    [...document.querySelectorAll("[data-reflex-value]")].forEach(button => {
      button.disabled = true;
      const answer = button.dataset.reflexValue === String(game.reflexTruth);
      if (answer) button.classList.add("correct");
      if (button.dataset.reflexValue === String(choice) && !correct) button.classList.add("wrong");
    });
    setScore(game.score);
    updateReflexTimer();
    vibrate(correct ? 12 : [18, 38, 18]);
    const active = game;
    schedule(() => {
      if (game !== active || game.type !== "reflex") return;
      if (game.timeUp || game.remainingMs <= 0) return finishReflex();
      renderReflexRound();
    }, 390);
  }

  function startWordQuiz(base) {
    if (base.words.length < 8) return showEmpty();
    game = base;
    renderWordQuestion();
  }

  function makeWordOptions(word) {
    const correct = wordView(word);
    const distractors = shuffle(game.words.filter(item => item.id !== word.id && wordView(item).meaning !== correct.meaning)).slice(0, 3);
    return shuffle([{ word, view: correct, correct: true }, ...distractors.map(item => ({ word: item, view: wordView(item), correct: false }))]);
  }

  function renderWordQuestion() {
    hideFeedback(); game.answered = false;
    const c = copy();
    const word = game.words[game.round % game.words.length];
    const view = wordView(word); game.current = word; game.options = makeWordOptions(word);
    q("#arcade-round").textContent = c.round(game.round + 1, game.total);
    q("#arcade-timer").textContent = `${game.streak}×`;
    setProgress(game.round / game.total * 100);
    const fallback = Boolean(game.audioFallback);
    const prompt = fallback
      ? `<h3>${esc(c.textPrompt)}</h3><p lang="${view.lang}">${esc(view.target)}</p><span class="meaning-hint">${esc(view.reading)}</span>`
      : `<h3>${esc(c.listenPrompt)}</h3><button class="arcade-audio-orb" id="arcade-play-audio" aria-label="${esc(c.listenHint)}"><svg><use href="#i-volume"></use></svg></button><span class="meaning-hint">${esc(c.listenHint)}</span>`;
    q("#arcade-stage").innerHTML = `<div class="arcade-prompt"><span class="game-chip">L${activeLevel()} · ${fallback ? "TEXT" : "AUDIO"}</span>${prompt}<small id="arcade-audio-status" role="status" aria-live="polite"></small></div><div class="arcade-options">${game.options.map((option, index) => `<button class="arcade-option" data-answer="${index}"><span>${c.answerLetters[index]}</span><span class="arcade-option-copy"><b>${esc(option.view.meaning)}</b></span></button>`).join("")}</div>`;
    if (!fallback) primeWordVoice(word);
    if (fallback) setAudioStatus(c.textFallbackReady, false, { installLevel: view.level });
  }

  function startVoiceGate(base) {
    if (base.words.length < 6) return showEmpty();
    game = { ...base, words: base.words.slice(0, 6), voiceAttempts: 0, busy: false, networkPermit: false };
    renderVoiceGateQuestion();
  }

  function renderVoiceGateQuestion() {
    if (!game || game.type !== "voice") return;
    hideFeedback();
    game.answered = false;
    game.busy = false;
    game.voiceAttempts = 0;
    const c = copy();
    const word = game.words[game.round];
    const view = wordView(word);
    game.current = word;
    q("#arcade-round").textContent = c.round(game.round + 1, game.total);
    q("#arcade-timer").textContent = `${game.streak}×`;
    setProgress(game.round / game.total * 100);
    q("#arcade-stage").innerHTML = `<div class="arcade-prompt arcade-voice-gate" data-voice-gate-state="ready">
      <span class="game-chip">L${activeLevel()} · SPEAK TO UNLOCK</span>
      <div class="arcade-voice-door" aria-hidden="true"><i></i><b>${game.round + 1}</b><i></i></div>
      <h3>${esc(c.voicePrompt)}</h3>
      <p class="arcade-voice-meaning">${esc(view.meaning)}</p>
      ${phoneticHintMarkup(view.phoneticHint)}
      <span class="meaning-hint">${esc(c.voiceHint)}</span>
      <div class="arcade-voice-meter"><i style="width:0%"></i><b data-voice-score>--</b><span>/100</span></div>
      <p class="arcade-voice-status" data-voice-status role="status" aria-live="polite">${esc(c.voiceHint)}</p>
      <p class="arcade-voice-heard" data-voice-heard hidden></p>
      <div class="arcade-voice-actions"><button type="button" data-voice-demo><svg><use href="#i-volume"></use></svg>${esc(c.voiceDemo)}</button><button type="button" class="arcade-voice-mic" data-voice-start><span aria-hidden="true">●</span>${esc(c.voiceStart)}</button><button type="button" data-voice-network hidden>${esc(c.voiceNetwork)}</button></div>
    </div>`;
    primeWordVoice(word);
  }

  function updateVoiceGateResult(result = {}) {
    const score = Math.max(0, Math.min(100, Number(result.score) || 0));
    const meter = q(".arcade-voice-meter i");
    const scoreNode = q("[data-voice-score]");
    const heard = q("[data-voice-heard]");
    if (meter) meter.style.width = `${score}%`;
    if (scoreNode) scoreNode.textContent = String(score || 0);
    if (heard && result.transcript) { heard.hidden = false; heard.textContent = copy().voiceHeard(result.transcript); }
  }

  async function attemptVoiceGate(allowNetwork = false) {
    if (!game || game.type !== "voice" || game.busy || game.answered) return;
    const active = game;
    const round = game.round;
    const c = copy();
    const view = wordView(game.current);
    const scorer = window.PronunciationScorer;
    const gate = q(".arcade-voice-gate");
    const start = q("[data-voice-start]");
    const network = q("[data-voice-network]");
    if (!scorer?.recognizeTarget) {
      if (gate) gate.dataset.voiceGateState = "unavailable";
      q("[data-voice-status]").textContent = copy().voiceUnavailable;
      return;
    }
    active.busy = true;
    if (gate) gate.dataset.voiceGateState = "listening";
    if (start) start.disabled = true;
    if (network) network.hidden = true;
    q("[data-voice-status]").textContent = copy().voiceListening;
    let result;
    try { result = await scorer.recognizeTarget({
      target: view.target,
      lang: view.voiceLang,
      threshold: 78,
      maxMs: 7500,
      allowNetwork: allowNetwork || active.networkPermit,
      onInterim: interim => {
        if (game !== active || game.round !== round || !interim) return;
        updateVoiceGateResult(interim);
      }
    }); } catch (_) { result = { status: "start-failed", passed: false, unscored: true }; }
    if (game !== active || game.round !== round) return;
    active.busy = false;
    if (!result || typeof result !== "object") result = { status: "start-failed", passed: false, unscored: true };
    updateVoiceGateResult(result);
    if (result.passed) {
      active.answered = true;
      recordLearningResult(active.current, true);
      active.correct += 1;
      active.streak += 1;
      active.bestStreak = Math.max(active.bestStreak, active.streak);
      active.score += Math.max(70, 170 - active.voiceAttempts * 35) + active.streak * 15;
      setScore(active.score);
      if (gate) gate.dataset.voiceGateState = "passed";
      q("[data-voice-status]").textContent = c.voicePass(result.score);
      showFeedback(c.voicePass(result.score), `${view.target} · ${view.reading}${view.phoneticHint ? ` · 中文近音·仅助记：${view.phoneticHint}` : ""} · ${view.meaning}`, false);
      q("#arcade-next").textContent = active.round + 1 >= active.total ? c.finish : c.next;
      q("#arcade-next").classList.remove("hidden");
      vibrate([12, 32, 18]);
      celebrate({ isBest: false, score: active.score, streak: active.streak });
      return;
    }
    if (["local-missing", "network-consent"].includes(result.status)) {
      q("[data-voice-status]").textContent = c.voiceLocalMissing;
      if (network) network.hidden = false;
    } else if (result.status !== "result" && result.status !== "passed") {
      q("[data-voice-status]").textContent = c.voiceUnavailable;
      if (["no-speech", "timeout"].includes(result.status)) q("[data-voice-status]").textContent = locale() === "zh" ? "没有听清，这次不计分。准备好后再试一次。" : "ยังฟังไม่ชัด รอบนี้ไม่คิดคะแนน พร้อมแล้วลองอีกครั้ง";
      if (gate) gate.dataset.voiceGateState = "unavailable";
    } else {
      active.voiceAttempts += 1;
      active.streak = 0;
      recordLearningResult(active.current, false);
      q("[data-voice-status]").textContent = c.voiceRetry(result.score || 0);
      if (gate) gate.dataset.voiceGateState = "retry";
      vibrate([18, 45, 18]);
    }
    if (start) start.disabled = false;
  }

  function startSpeed(base) {
    if (base.words.length < 8) return showEmpty();
    game = { ...base, total: 0 };
    renderSpeedQuestion();
    timerId = setInterval(() => {
      if (!game || game.type !== "speed") return;
      game.seconds -= 1;
      q("#arcade-timer").textContent = copy().time(game.seconds);
      setProgress((45 - game.seconds) / 45 * 100);
      if (game.seconds <= 0) finishGame();
    }, 1000);
  }

  function renderSpeedQuestion() {
    hideFeedback(); game.answered = false;
    const c = copy();
    const word = game.words[game.round % game.words.length];
    const view = wordView(word); game.current = word; game.options = makeWordOptions(word);
    q("#arcade-round").textContent = `${game.round + 1} · ${game.streak}× COMBO`;
    q("#arcade-timer").textContent = c.time(game.seconds);
    q("#arcade-stage").innerHTML = `<div class="arcade-prompt"><span class="game-chip">L${activeLevel()} · SPEED</span><h3 lang="${view.lang}">${esc(view.target)}</h3><p>${esc(view.reading)}</p>${phoneticHintMarkup(view.phoneticHint)}<span class="meaning-hint">${esc(c.speedPrompt)}</span></div><div class="arcade-options">${game.options.map((option, index) => `<button class="arcade-option" data-answer="${index}"><span>${c.answerLetters[index]}</span><span class="arcade-option-copy"><b>${esc(option.view.meaning)}</b></span></button>`).join("")}</div>`;
  }

  function currentMonsterHero(heroId = game?.monsterHeroId || DEFAULT_MONSTER_HERO_ID) {
    return MONSTER_HERO_CONFIGS.find(hero => hero.id === heroId) || MONSTER_HERO_CONFIGS[0];
  }

  function defaultMonsterHeroId() {
    if (direction() === "zh-th") return "chinese";
    if (direction() === "th-zh") return "thai";
    return DEFAULT_MONSTER_HERO_ID;
  }

  function monsterHeroName(hero = currentMonsterHero()) {
    if (hero?.id === "chinese") return locale() === "zh" ? "阿澈 · 中国搭档" : "อาเช่อ · คู่หูชาวจีน";
    if (hero?.id === "thai") return locale() === "zh" ? "玛莉 · 泰国搭档" : "มะลิ · คู่หูชาวไทย";
    return copy().monsterHeroNames?.[hero?.id] || hero?.id || "";
  }

  function monsterHeroTraitText(hero = currentMonsterHero()) {
    if (["chinese", "thai"].includes(hero?.id)) return locale() === "zh" ? "双人默契 · 每题多 0.5 秒" : "จังหวะคู่หู · แต่ละข้อเพิ่ม 0.5 วิ";
    return copy().monsterHeroTraits?.[hero?.id] || "";
  }

  function monsterMomentumTier(streak = game?.streak || 0) {
    const value = Math.max(0, Number(streak) || 0);
    return value >= 5 ? "fever" : value >= 3 ? "heat" : "calm";
  }

  function monsterHeroDamage(baseDamage, hero = currentMonsterHero()) {
    return Math.max(1, Math.round(Math.max(0, Number(baseDamage) || 0) * (Number(hero?.damageMultiplier) || 1)));
  }

  function monsterHeroCounterDamage(baseDamage, hero = currentMonsterHero()) {
    return Math.max(1, Math.round(Math.max(0, Number(baseDamage) || 0) * (Number(hero?.incomingMultiplier) || 1)));
  }

  function currentMonster() {
    const roster = activeMonsterRoster();
    return roster[Math.max(0, Math.min(roster.length - 1, Number(game?.monsterIndex) || 0))] || MONSTER_CONFIGS[0];
  }

  function monsterIsEnraged(monster = currentMonster()) {
    return Boolean(monster?.enrageAt && game?.monsterMaxHp > 0 && game.monsterHp / game.monsterMaxHp <= monster.enrageAt);
  }

  function monsterStyleConfig(styleId = "steady") {
    return MONSTER_STYLES[MONSTER_STYLE_ORDER.includes(styleId) ? styleId : "steady"];
  }

  function monsterStyleDamage(baseDamage, styleId = "steady") {
    return Math.max(1, Math.round(Math.max(0, Number(baseDamage) || 0) * monsterStyleConfig(styleId).damageMultiplier));
  }

  function monsterStyleCounterDamage(baseDamage, styleId = "steady") {
    return Math.max(1, Math.round(Math.max(0, Number(baseDamage) || 0) * monsterStyleConfig(styleId).incomingMultiplier));
  }

  // Preview and settlement must share the same rounding and turn-specific modifiers.
  function monsterCounterDamageParts(timedOut = false, monster = currentMonster(), round = game?.stageRound || 0, styleId = game?.monsterStyle || "steady", hero = currentMonsterHero()) {
    const base = timedOut ? (Number(monster.timeoutDamage) || 16) : (Number(monster.counterDamage) || 12);
    const resonance = monster.resonanceEvery && (round + 1) % monster.resonanceEvery === 0 ? Number(monster.resonanceDamage) || 0 : 0;
    const mechanicCounterDamage = base + resonance;
    const styledCounterDamage = monsterStyleCounterDamage(mechanicCounterDamage, styleId);
    const skill = monsterSkillState(monster, round, styleId);
    const skillCounterDamage = Math.max(1, Math.round(styledCounterDamage * (skill?.counterMultiplier || 1)));
    const routeGuard = styleId === "guard" ? campusEffects().guardMultiplier : 1;
    const counterDamage = Math.max(1, Math.round(monsterHeroCounterDamage(skillCounterDamage, hero) * routeGuard));
    return { baseCounterDamage: base, resonanceDamage: resonance, mechanicCounterDamage, styledCounterDamage, skillCounterDamage, counterDamage };
  }

  function monsterRiskText(monster = currentMonster()) {
    const miss = monsterCounterDamageParts(false, monster).counterDamage;
    const timeout = monsterCounterDamageParts(true, monster).counterDamage;
    return locale() === "zh" ? `答错 −${miss} · 超时 −${timeout} HP` : `ตอบผิด −${miss} · หมดเวลา −${timeout} HP`;
  }

  function monsterSkillName(monster = currentMonster()) {
    if (monster?.id === "lantern") return locale() === "zh" ? "双拍灯舞" : "ระบำโคมสองจังหวะ";
    return locale() === "zh" ? monster?.skill?.nameZh : monster?.skill?.nameTh;
  }

  function monsterSkillHint(monster = currentMonster()) {
    if (monster?.id === "lantern") return locale() === "zh" ? "半血前每三回合稳击破招；半血后交替用守势、速攻应对。看本回合提示。" : "ก่อนครึ่งพลังใช้บุกมั่นคงแก้ทางทุกสามเทิร์น หลังครึ่งพลังสลับตั้งรับกับบุกเร็ว ดูคำแนะนำแต่ละเทิร์น";
    return locale() === "zh" ? monster?.skill?.hintZh : monster?.skill?.hintTh;
  }

  function monsterSkillState(monster = currentMonster(), round = game?.stageRound || 0, styleId = game?.monsterStyle || "steady") {
    if (monster?.id === "lantern") {
      const phase = window.HUILAISHI_CAMPUS_ADVENTURE?.bossPhase(monster, game?.monsterHp, game?.monsterMaxHp) || 1;
      const turn = Math.max(0, Math.floor(Number(round) || 0)) + 1;
      const active = phase === 2 || turn % 3 === 0;
      const recommendedStyle = phase === 2 ? (turn % 2 ? "guard" : "rush") : "steady";
      const countered = active && styleId === recommendedStyle;
      return { active, countered, neutral: false, turn, every: 3, turnsUntil: active ? 0 : 3 - turn % 3, recommendedStyle, selectedStyle: styleId, damageMultiplier: !active ? 1 : countered ? 1.16 : .72, counterMultiplier: !active ? 1 : countered ? .8 : 1.18, timeDelta: 0, heal: 0, phase, id: "lantern-duet" };
    }
    const skill = monster?.skill;
    if (!skill) return null;
    const safeRound = Math.max(0, Math.floor(Number(round) || 0));
    const turn = safeRound + 1;
    const every = Math.max(1, Math.floor(Number(skill.every) || 1));
    const active = Boolean(skill.always || turn % every === 0);
    const rotatingStyles = Array.isArray(skill.counterStyles) ? skill.counterStyles.filter(id => MONSTER_STYLE_ORDER.includes(id)) : [];
    const recommendedStyle = rotatingStyles.length
      ? rotatingStyles[safeRound % rotatingStyles.length]
      : MONSTER_STYLE_ORDER.includes(skill.counterStyle) ? skill.counterStyle : "steady";
    const selectedStyle = MONSTER_STYLE_ORDER.includes(styleId) ? styleId : "steady";
    const countered = active && selectedStyle === recommendedStyle;
    const neutral = active && !countered && selectedStyle === "steady" && Number.isFinite(Number(skill.neutralDamage));
    const damageMultiplier = !active ? 1 : countered
      ? Number(skill.strongDamage) || 1.2
      : neutral ? Number(skill.neutralDamage) || .9 : Number(skill.weakDamage) || .7;
    const counterMultiplier = !active ? 1 : countered
      ? Number(skill.safeCounter) || .85
      : neutral ? Number(skill.neutralCounter) || 1 : Number(skill.riskCounter) || 1.2;
    const timeDelta = !active ? 0 : countered
      ? Number(skill.strongTimeDelta) || 0
      : Number(skill.weakTimeDelta) || 0;
    const turnsUntil = active ? 0 : Math.max(1, every - (turn % every));
    return { active, countered, neutral, turn, every, turnsUntil, recommendedStyle, selectedStyle, damageMultiplier, counterMultiplier, timeDelta, heal: Math.max(0, Number(skill.heal) || 0), id: skill.id };
  }

  function monsterTurnDuration(monster = currentMonster(), styleId = game?.monsterStyle || "steady") {
    const base = monsterIsEnraged(monster) ? monster.enrageTurnMs : (monster?.turnMs || MONSTER_TURN_MS);
    const style = monsterStyleConfig(styleId);
    const skillTimeDelta = monsterSkillState(monster, game?.stageRound || 0, styleId)?.timeDelta || 0;
    const heroBonus = Math.max(0, Number(currentMonsterHero()?.turnBonusMs) || 0);
    return Math.max(5000, Number(base) + heroBonus + Math.max(0, Number(game?.turnBonusMs) || 0) + style.timeDelta + skillTimeDelta + campusEffects().turnBonus);
  }

  function monsterBurstBonus() {
    return game?.burstArmed ? monsterBurstDamage() + campusEffects().burstBonus : 0;
  }

  function monsterVoiceGrade(score = 0) {
    const value = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
    return value >= 94 ? "perfect" : value >= 86 ? "great" : "pass";
  }

  function monsterVoiceDamageBonus(answerMeta = {}) {
    if (!answerMeta.voice || !answerMeta.passed) return 0;
    const score = Math.max(0, Math.min(100, Math.round(Number(answerMeta.score) || 0)));
    return score >= 94 ? 6 : score >= 86 ? 4 : score >= 78 ? 2 : 0;
  }

  function monsterFactor(value = 1) {
    return Math.max(0, Number(value) || 0).toFixed(2);
  }

  function monsterRoundResultModel(data = {}) {
    const c = copy();
    const correct = Boolean(data.correct);
    const chips = [];
    if (correct) {
      chips.push(c.monsterRoundSpeedLevel(Number(data.speedDamage) || 0, Number(data.levelDamage) || 0));
      if (Number(data.comboMultiplier) > 1) chips.push(c.monsterRoundCombo(monsterFactor(data.comboMultiplier)));
      if (Number(data.powerMultiplier) > 1) chips.push(c.monsterRoundUpgrade(monsterFactor(data.powerMultiplier)));
      chips.push(c.monsterRoundFactor(c.monsterStyles?.[data.styleId]?.[0] || data.styleId || "", monsterFactor(data.styleMultiplier)));
      for (const bonus of Array.isArray(data.bonuses) ? data.bonuses : []) if (bonus) chips.push(String(bonus));
      if (Number(data.skillMultiplier) !== 1) chips.push(c.monsterRoundSkill(monsterFactor(data.skillMultiplier)));
      if (Number(data.heroMultiplier) !== 1) chips.push(c.monsterRoundHero(monsterFactor(data.heroMultiplier)));
      if (Number(data.shieldAbsorbed) > 0) chips.push(c.monsterRoundShield(Number(data.shieldAbsorbed)));
      if (Number(data.damage) > 0) chips.push(c.monsterRoundBody(Number(data.damage)));
      return {
        state: data.impactKind || "hit",
        kicker: c.monsterRoundKicker,
        title: c.monsterRoundAttack(Number(data.rawDamage) || 0),
        meta: c.monsterRoundTime(data.seconds || "0.0", c.monsterImpactLabels?.[data.impactKind] || c.monsterImpactLabels?.hit || ""),
        chips,
        detail: data.voiceScore ? c.monsterRoundVoice(Math.round(Number(data.voiceScore) || 0)) : "",
        learning: c.monsterLearningGain,
        tap: c.monsterRoundTap
      };
    }
    chips.push(c.monsterRoundEnemyBase(Number(data.baseCounterDamage) || 0));
    for (const effect of Array.isArray(data.effects) ? data.effects : []) if (effect) chips.push(String(effect));
    if (Number(data.styleMultiplier) !== 1) chips.push(c.monsterRoundFactor(c.monsterStyles?.[data.styleId]?.[0] || data.styleId || "", monsterFactor(data.styleMultiplier)));
    if (Number(data.skillMultiplier) !== 1) chips.push(c.monsterRoundSkill(monsterFactor(data.skillMultiplier)));
    if (Number(data.heroMultiplier) !== 1) chips.push(c.monsterRoundHero(monsterFactor(data.heroMultiplier)));
    const reason = data.timedOut ? "timeout" : data.voice ? "voice" : "choice";
    return {
      state: "counter",
      kicker: c.monsterRoundKicker,
      title: c.monsterRoundCounter(Number(data.counterDamage) || 0),
      meta: c.monsterRoundReasons?.[reason] || "",
      chips,
      detail: c.monsterReveal(data.target || "", data.meaning || ""),
      learning: c.monsterLearningReview,
      tap: c.monsterRoundTap
    };
  }

  function showMonsterRoundResult(model) {
    const card = q("[data-monster-round-result]");
    if (!card || !model) return;
    card.hidden = false;
    card.dataset.resultState = model.state || "hit";
    const set = (selector, value) => {
      const node = card.querySelector(selector);
      if (node) node.textContent = value || "";
    };
    set("[data-monster-round-kicker]", model.kicker);
    set("[data-monster-round-title]", model.title);
    set("[data-monster-round-meta]", model.meta);
    set("[data-monster-round-detail]", model.detail);
    set("[data-monster-round-learning]", model.learning);
    set("[data-monster-round-tap]", model.tap);
    const formula = card.querySelector("[data-monster-round-formula]");
    if (formula) formula.innerHTML = model.chips.map(value => `<span>${esc(value)}</span>`).join("");
  }

  function revealMonsterVoiceGrade(answerMeta = {}, bonus = 0) {
    if (!answerMeta.voice) return;
    const card = q("[data-monster-voice-grade]");
    if (!card) return;
    const score = Math.max(0, Math.min(100, Math.round(Number(answerMeta.score) || 0)));
    const grade = answerMeta.passed ? monsterVoiceGrade(score) : "retry";
    card.hidden = false;
    card.dataset.voiceGrade = grade;
    card.style.setProperty("--voice-score", `${score}%`);
    const gradeNode = card.querySelector("[data-monster-voice-grade-label]");
    const scoreNode = card.querySelector("[data-monster-voice-score]");
    const bonusNode = card.querySelector("[data-monster-voice-bonus]");
    if (gradeNode) gradeNode.textContent = answerMeta.passed ? (copy().monsterVoiceGrades?.[grade] || "") : copy().wrong;
    if (scoreNode) scoreNode.textContent = String(score);
    if (bonusNode) bonusNode.textContent = bonus > 0 ? copy().monsterVoiceGradeBonus(bonus) : "";
  }

  function monsterAttackDamage(remainingMs, styleId = game?.monsterStyle || "steady", turnMs = game?.turnMs || MONSTER_TURN_MS) {
    const monster = currentMonster();
    const rhythmBonus = game?.rhythmWindow ? Number(monster.rhythmBonus) || 0 : 0;
    const resonanceBonus = game?.resonanceWindow ? Number(monster.resonanceBonus) || 0 : 0;
    const baseDamage = monsterDamage(remainingMs, game?.streak || 0, turnMs, game?.combatLevel || 1, game?.rewardRanks?.power || 0);
    const preSkillDamage = monsterStyleDamage(baseDamage, styleId) + rhythmBonus + resonanceBonus + monsterBurstBonus();
    const skillMultiplier = monsterSkillState(monster, game?.stageRound || 0, styleId)?.damageMultiplier || 1;
    return monsterHeroDamage(Math.max(1, Math.round(preSkillDamage * skillMultiplier)));
  }

  function monsterTraitText(monster = currentMonster()) {
    const c = copy();
    if (monster?.trait === "shield" && game?.monsterShield > 0) return c.monsterShield(game.monsterShield);
    if (monster?.trait === "enrage" && monsterIsEnraged(monster)) return c.monsterEnraged;
    return c.monsterTraits?.[monster?.id] || (locale() === "zh" ? monster?.traitZh : monster?.traitTh) || "";
  }

  function monsterIntentText(monster = currentMonster()) {
    const c = copy();
    const base = c.monsterIntents?.[monster?.id] || (locale() === "zh" ? monster?.intentZh : monster?.intentTh) || monsterTraitText(monster);
    if (monster?.trait === "warmup") return locale() === "zh" ? "锅盖反击" : "สวนกลับด้วยฝาหม้อ";
    if (monster?.trait === "haste") {
      const seconds = (monsterTurnDuration(monster) / 1000).toFixed(1).replace(/\.0$/u, "");
      return locale() === "zh" ? `抢拍催答 · 当前 ${seconds} 秒` : `เร่งจังหวะ · ตอนนี้ ${seconds} วินาที`;
    }
    const skillState = monsterSkillState(monster);
    if (skillState) {
      const styleName = c.monsterStyles?.[skillState.recommendedStyle]?.[0] || skillState.recommendedStyle;
      return `${monsterSkillName(monster)} · ${skillState.active ? c.monsterSkillActive(styleName) : c.monsterSkillCooldown(skillState.turnsUntil)}`;
    }
    if (monster?.trait === "shield" && game?.monsterShield > 0) return `${base} · ${c.monsterShield(game.monsterShield)}`;
    if (monster?.trait === "rhythm" && monster.rhythmEvery) return `${base} · ${(game?.stageRound || 0) % monster.rhythmEvery + 1}/${monster.rhythmEvery}`;
    if (monster?.trait === "resonance" && monster.resonanceEvery) return `${base} · ${(game?.stageRound || 0) % monster.resonanceEvery + 1}/${monster.resonanceEvery}`;
    if (monster?.trait === "enrage" && monsterIsEnraged(monster)) return c.monsterEnraged;
    return base;
  }

  function monsterName(monster = currentMonster()) {
    return locale() === "zh" ? monster.zh : monster.th;
  }

  function monsterEncounterLevel(monster = currentMonster()) {
    return monster?.rally ? MONSTER_CONFIGS.length + monsterGlobalStage(monster) : monsterGlobalStage(monster);
  }

  function monsterRelicMarkup(monster = currentMonster()) {
    if (!monster?.rally || !monster.relic) return "";
    const relicName = locale() === "zh" ? monster.relic.zh : monster.relic.th;
    return `<span class="arcade-monster-rally-relic" data-relic-kind="${esc(monster.relic.kind)}" data-relic-variant="${Number(monster.artVariant) || 0}" aria-label="${esc(relicName)}"><i></i><b></b><em></em></span>`;
  }

  function monsterProgress() {
    if (!game || game.type !== "monster") return 0;
    const defeatedPart = game.monsterMaxHp > 0 ? 1 - game.monsterHp / game.monsterMaxHp : 0;
    const roster = activeMonsterRoster(), index = Math.max(0, roster.findIndex(item => item.id === currentMonster()?.id));
    return (index + Math.max(0, Math.min(1, defeatedPart))) / Math.max(1, roster.length) * 100;
  }

  function primeMonsterArt() {
    if (typeof Image !== "function") return;
    const heroArt = MONSTER_HERO_CONFIGS.flatMap(hero => [hero.art, ...Object.values(hero.frames || {})]);
    const monsterArt = activeMonsterRoster().flatMap(monster => [monster.art, ...Object.values(monster.frames || {})]);
    for (const src of [isCampusChapter() ? campusSceneArt() : MONSTER_ARENA_ART, ...Object.values(MONSTER_COLLAGE_VFX), ...heroArt, ...monsterArt]) {
      if (MONSTER_ART_PRELOADS.has(src)) continue;
      const image = new Image();
      image.decoding = "async";
      image.src = src;
      MONSTER_ART_PRELOADS.set(src, image);
    }
  }

  function monsterRouteMarkup(currentIndex = game?.monsterIndex || 0) {
    const c = copy();
    const campaign = activeMonsterRoster();
    const persisted = new Set(game?.monsterMode === "rally"
      ? monsterRallyCollectionSnapshot(game?.rallyZone || 1).zoneDefeatedIds
      : monsterCollectionSnapshot(game?.campaignLevel || activeLevel()).chapterDefeatedIds);
    (game?.defeatedIds || []).forEach?.(id => persisted.add(id));
    return `<div class="arcade-monster-route${game?.monsterMode === "rally" ? " is-rally" : ""}" role="img" aria-label="${esc(game?.monsterMode === "rally" ? c.monsterRallyRoute : c.monsterRoute)}">${campaign.map((monster, index) => {
      const cleared = persisted.has(monster.id) || index < currentIndex;
      const state = cleared ? " is-cleared" : index === currentIndex ? " is-current" : "";
      return `<i class="${state}${monster.elite ? " is-elite" : ""}${monster.boss ? " is-boss" : ""}" aria-hidden="true"><span>${cleared ? "✓" : index + 1}</span></i>`;
    }).join("")}</div>`;
  }

  function monsterModeSwitcherMarkup() {
    const c = copy();
    const mode = game?.monsterMode === "rally" ? "rally" : "story";
    const all = allMonsterCollectionSnapshot(game?.campaignLevel || activeLevel());
    return `<div class="arcade-monster-mode-switch"><div><b>${esc(c.monsterModeTitle)}</b><small>${esc(c.monsterTotalCollection(all.story.defeated, all.rally.defeated))}</small></div><div role="tablist" aria-label="${esc(c.monsterModeTitle)}"><button type="button" role="tab" data-monster-mode="story" aria-selected="${String(mode === "story")}" class="${mode === "story" ? "is-current" : ""}"><b>${esc(c.monsterModeStory)}</b><small>${esc(c.monsterModeStoryHint)}</small></button><button type="button" role="tab" data-monster-mode="rally" data-premium-feature="monster-full" aria-selected="${String(mode === "rally")}" class="${mode === "rally" ? "is-current" : ""}"><b>${esc(c.monsterModeRally)}</b><small>${esc(c.monsterModeRallyHint)}</small></button></div></div>`;
  }

  function monsterCampaignMapMarkup() {
    const c = copy();
    const activeChapter = Number(game?.campaignLevel) || activeLevel();
    return `<div class="arcade-monster-campaign-map"><div class="arcade-monster-campaign-map-head"><b>${esc(c.monsterCampaignMap)}</b><span>${esc(c.monsterGlobalStage(monsterGlobalStage()))}</span></div><div class="arcade-monster-chapters" role="radiogroup" aria-label="${esc(c.monsterCampaignMap)}">${Array.from({ length: MONSTER_CHAPTER_COUNT }, (_, index) => index + 1).map(chapter => {
      const snapshot = monsterCollectionSnapshot(chapter);
      const selected = chapter === activeChapter;
       return `<button type="button" role="radio" data-monster-chapter="${chapter}" ${chapter > 1 ? 'data-premium-feature="monster-full"' : ""} aria-checked="${String(selected)}" class="${selected ? "is-current" : ""}${snapshot.chapterCleared ? " is-cleared" : ""}"><span><b>${esc(c.monsterChapter(chapter))}</b><small>${esc(c.monsterChapterProgress(snapshot.chapterDefeated))}</small></span><i aria-hidden="true">${monsterCampaign(chapter).map((monster, monsterIndex) => `<u class="${snapshot.chapterDefeatedIds.includes(monster.id) ? "is-cleared" : ""}${monster.elite ? " is-elite" : ""}${monster.boss ? " is-boss" : ""}">${snapshot.chapterDefeatedIds.includes(monster.id) ? "✓" : monsterIndex + 1}</u>`).join("")}</i></button>`;
    }).join("")}</div></div>`;
  }

  function monsterRallyMapMarkup() {
    const c = copy();
    const activeZone = Math.max(1, Math.min(MONSTER_RALLY_ZONE_COUNT, Number(game?.rallyZone) || 1));
    return `<div class="arcade-monster-campaign-map arcade-monster-rally-map"><div class="arcade-monster-campaign-map-head"><b>${esc(c.monsterRallyMap)}</b><span>${esc(c.monsterRallyStage(monsterGlobalStage()))}</span></div><div class="arcade-monster-rally-zones" role="radiogroup" aria-label="${esc(c.monsterRallyMap)}">${MONSTER_RALLY_ZONES.map((zone, index) => {
      const zoneNumber = index + 1;
      const snapshot = monsterRallyCollectionSnapshot(zoneNumber);
      const selected = zoneNumber === activeZone;
      const roster = monsterRallyZone(zoneNumber);
      const zoneName = locale() === "zh" ? zone.zh : zone.th;
      return `<button type="button" role="radio" data-monster-rally-zone="${zoneNumber}" data-premium-feature="monster-full" aria-checked="${String(selected)}" class="${selected ? "is-current" : ""}${snapshot.zoneCleared ? " is-cleared" : ""}" style="--zone:${zone.color};--zone-accent:${zone.accent}"><img src="${esc(zone.families[0].art)}" alt="" draggable="false" decoding="async" loading="lazy" /><span><small>${esc(c.monsterRallyZone(zoneNumber))}</small><b>${esc(zoneName)}</b><em>${esc(c.monsterRallyZoneProgress(snapshot.zoneDefeated))}</em></span><i aria-hidden="true">${roster.map((monster, monsterIndex) => `<u class="${snapshot.zoneDefeatedIds.includes(monster.id) ? "is-cleared" : ""}${monster.elite ? " is-elite" : ""}${monster.boss ? " is-boss" : ""}">${snapshot.zoneDefeatedIds.includes(monster.id) ? "✓" : monsterIndex + 1}</u>`).join("")}</i></button>`;
    }).join("")}</div></div>`;
  }

  function activeMonsterMapMarkup() {
    return `${monsterModeSwitcherMarkup()}${game?.monsterMode === "rally" ? monsterRallyMapMarkup() : monsterCampaignMapMarkup()}`;
  }

  function resetMonsterRunForChapter(level = activeLevel()) {
    if (!game || game.type !== "monster") return false;
    game.expeditionStarted = false;
    const campaignLevel = Math.max(1, Math.min(MONSTER_CHAPTER_COUNT, Number(level) || 1));
    const campaign = monsterCampaign(campaignLevel);
    const defeated = new Set(monsterCollectionSnapshot(campaignLevel).chapterDefeatedIds);
    const firstUndefeated = campaign.findIndex(monster => !defeated.has(monster.id));
    const monsterIndex = firstUndefeated >= 0 ? firstUndefeated : 0;
    const monster = campaign[monsterIndex];
    const combatLevel = monsterStartingCombatLevel(monster, campaignLevel);
    const rewardRanks = { power: 0, guard: 0, tempo: 0 };
    game.monsterMode = "story";
    game.storyChapter = campaignLevel;
    const playerMaxHp = monsterPlayerMaxHp(combatLevel, rewardRanks.guard);
    game.campaignLevel = campaignLevel;
    game.words = pickWords(80, { learningAudio: true, level: campaignLevel });
    game.campusPreparedMonsterId = null;
    game.campusPrep = null;
    game.playerMaxHp = playerMaxHp;
    game.campusRoutes = {};
    game.playerHp = playerMaxHp;
    game.combatLevel = combatLevel;
    game.monsterIndex = monsterIndex;
    game.monsterHp = monsterScaledHp(monster);
    game.monsterMaxHp = game.monsterHp;
    game.answeredCount = 0;
    game.monstersDefeated = 0;
    game.defeatedIds = new Set();
    game.remainingMs = MONSTER_TURN_MS;
    game.turnMs = MONSTER_TURN_MS;
    game.stageRound = 0;
    game.monsterShield = monsterScaledShield(monster);
    game.monsterMaxShield = game.monsterShield;
    game.burstCharge = 0;
    game.burstArmed = false;
    game.monsterStyle = null;
    game.rewardRanks = rewardRanks;
    game.turnBonusMs = 0;
    game.rewards = [];
    game.timerActive = false;
    game.monsterVictory = false;
    game.monsterEntering = true;
    game.busy = false;
    game.score = 0;
    game.correct = 0;
    game.streak = 0;
    game.bestStreak = 0;
    game.round = 0;
    game.learningAttempts = 0;
    game.learningCorrectIds = new Set();
    game.learningWrongIds = new Set();
    return true;
  }

  function resetMonsterRunForRallyZone(zone = 1) {
    if (!game || game.type !== "monster") return false;
    game.expeditionStarted = false;
    game.campusRoutes = {};
    const rallyZone = Math.max(1, Math.min(MONSTER_RALLY_ZONE_COUNT, Number(zone) || 1));
    const zoneConfig = MONSTER_RALLY_ZONES[rallyZone - 1];
    const roster = monsterRallyZone(rallyZone);
    const defeated = new Set(monsterRallyCollectionSnapshot(rallyZone).zoneDefeatedIds);
    const firstUndefeated = roster.findIndex(monster => !defeated.has(monster.id));
    const monsterIndex = firstUndefeated >= 0 ? firstUndefeated : 0;
    const monster = roster[monsterIndex];
    const rewardRanks = { power: 0, guard: 0, tempo: 0 };
    game.monsterMode = "rally";
    game.rallyZone = rallyZone;
    game.campaignLevel = zoneConfig.level;
    const combatLevel = monsterStartingCombatLevel(monster, zoneConfig.level);
    const playerMaxHp = monsterPlayerMaxHp(combatLevel, rewardRanks.guard);
    game.words = pickWords(80, { learningAudio: true, level: zoneConfig.level });
    game.playerMaxHp = playerMaxHp;
    game.playerHp = playerMaxHp;
    game.combatLevel = combatLevel;
    game.monsterIndex = monsterIndex;
    game.monsterHp = monsterScaledHp(monster);
    game.monsterMaxHp = game.monsterHp;
    game.answeredCount = 0;
    game.monstersDefeated = 0;
    game.defeatedIds = new Set();
    game.remainingMs = MONSTER_TURN_MS;
    game.turnMs = MONSTER_TURN_MS;
    game.stageRound = 0;
    game.monsterShield = monsterScaledShield(monster);
    game.monsterMaxShield = game.monsterShield;
    game.burstCharge = 0;
    game.burstArmed = false;
    game.monsterStyle = null;
    game.rewardRanks = rewardRanks;
    game.turnBonusMs = 0;
    game.rewards = [];
    game.timerActive = false;
    game.monsterVictory = false;
    game.monsterEntering = true;
    game.busy = false;
    game.score = 0;
    game.correct = 0;
    game.streak = 0;
    game.bestStreak = 0;
    game.round = 0;
    game.learningAttempts = 0;
    game.learningCorrectIds = new Set();
    game.learningWrongIds = new Set();
    return true;
  }

  function chooseMonsterMode(mode) {
    if (!game || game.type !== "monster" || q("#arcade-sheet")?.dataset.arcadePhase !== "monster-ready") return;
    const nextMode = mode === "rally" ? "rally" : "story";
    if (nextMode === "rally" && !canUseFullMonsterRoute()) { requestPremium("monster-full"); return; }
    const reset = nextMode === "rally"
      ? resetMonsterRunForRallyZone(game.rallyZone || 1)
      : resetMonsterRunForChapter(game.storyChapter || activeLevel());
    if (!reset) return;
    primeMonsterArt();
    setScore(0);
    vibrate([8, 20, 8]);
    renderMonsterReady(`[data-monster-mode="${nextMode}"]`);
  }

  function chooseMonsterChapter(level) {
    if (!game || game.type !== "monster" || q("#arcade-sheet")?.dataset.arcadePhase !== "monster-ready") return;
    const chapter = Math.max(1, Math.min(MONSTER_CHAPTER_COUNT, Number(level) || 1));
    if (chapter > 1 && !canUseFullMonsterRoute()) { requestPremium("monster-full"); return; }
    if (!resetMonsterRunForChapter(chapter)) return;
    primeMonsterArt();
    setScore(0);
    vibrate(10);
    renderMonsterReady(`[data-monster-chapter="${chapter}"]`);
  }

  function chooseMonsterRallyZone(zone) {
    if (!game || game.type !== "monster" || q("#arcade-sheet")?.dataset.arcadePhase !== "monster-ready") return;
    const rallyZone = Math.max(1, Math.min(MONSTER_RALLY_ZONE_COUNT, Number(zone) || 1));
    if (!canUseFullMonsterRoute()) { requestPremium("monster-full"); return; }
    if (!resetMonsterRunForRallyZone(rallyZone)) return;
    primeMonsterArt();
    setScore(0);
    vibrate(10);
    renderMonsterReady(`[data-monster-rally-zone="${rallyZone}"]`);
  }

  function monsterHeroPickerMarkup() {
    const c = copy();
    const selected = currentMonsterHero();
    return `<div class="arcade-monster-hero-pick"><div class="arcade-monster-hero-pick-head"><b>${esc(c.monsterHeroPick)}</b><small>${esc(c.monsterHeroPickHint)}</small></div><div class="arcade-monster-hero-grid" role="radiogroup" aria-label="${esc(c.monsterHeroPick)}">${MONSTER_HERO_CONFIGS.map(hero => {
      const active = hero.id === selected.id;
      const name = monsterHeroName(hero);
      const trait = monsterHeroTraitText(hero);
      return `<button type="button" role="radio" data-monster-hero="${hero.id}" aria-checked="${String(active)}" class="${active ? "is-selected" : ""}" style="--hero-accent:${hero.accent}" aria-label="${esc(`${name} · ${trait}`)}"><span><img src="${esc(hero.art)}" alt="" draggable="false" decoding="async" /></span><b>${esc(name)}</b><small>${esc(trait)}</small></button>`;
    }).join("")}</div></div>`;
  }

  function startMonsterBattle(base) {
    if (base.words.length < 16) return showEmpty();
    const startingChapter = canUseFullMonsterRoute() ? activeLevel() : 1;
    game = {
      ...base,
      monsterMode: "story",
      storyChapter: startingChapter,
      rallyZone: 1,
      monsterHeroId: defaultMonsterHeroId(),
      networkPermit: false
    };
    if (!resetMonsterRunForChapter(startingChapter)) return showEmpty();
    primeMonsterArt();
    const sheet = q("#arcade-sheet");
    if (sheet) sheet.dataset.arcadePhase = "monster-ready";
    document.body?.classList?.add?.("arcade-monster-active");
    renderMonsterReady();
  }

  function renderMonsterReady(focusSelector = "[data-monster-start]") {
    if (!game || game.type !== "monster") return;
    clearInterval(timerId); timerId = 0;
    hideFeedback();
    const c = copy();
    const monster = currentMonster();
    const hero = currentMonsterHero();
    const isRally = Boolean(monster.rally);
    const campus = isCampusChapter();
    q("#arcade-sheet").dataset.campusChapter = String(campus);
    if (campus && campusJourney()) return renderCampusLobby(focusSelector);
    const mapsOpen = Boolean(q(".campus-route-details")?.open) || /data-monster-(chapter|mode|rally-zone)/u.test(focusSelector);
    const modeEyebrow = isRally ? c.monsterRallyEyebrow(game.rallyZone) : c.monsterCampaignEyebrow(game.campaignLevel);
    const modeHook = isRally ? c.monsterRallyHook : c.monsterCampaignHook;
    const modeLoot = isRally ? c.monsterRallyLoot : c.monsterCampaignLoot;
    const modeStartHint = isRally ? c.monsterRallyStartHint : c.monsterStartHint;
    const startButton = `<button type="button" data-monster-start><span><b>${esc(campus ? (locale() === "zh" ? "出发，挑战纸怪！" : "ออกเดินทาง ท้ามอนสเตอร์กระดาษ!") : c.monsterStart)}</b><small>${esc(modeStartHint)}</small></span><strong>→</strong></button>`;
    q("#arcade-sheet-kicker").textContent = campus ? (locale() === "zh" ? "第 1 章 · 六站冒险" : "บทที่ 1 · ผจญภัย 6 ด่าน") : c.games.monster[0];
    const turnSeconds = (monsterTurnDuration(monster) / 1000).toFixed(1).replace(/\.0$/u, "");
    q("#arcade-round").textContent = locale() === "zh" ? "战前准备" : "เตรียมต่อสู้";
    q("#arcade-timer").textContent = turnSeconds;
    setProgress(monsterProgress());
    q("#arcade-stage").innerHTML = `<section class="arcade-monster-ready arcade-monster-ready-v79${campus ? " campus-ready" : ""}" aria-labelledby="monster-ready-title">
      <div class="arcade-monster-ready-stage ${isRally ? "is-rally" : ""} ${monster.elite ? "is-elite" : ""} ${monster.boss ? "is-boss" : ""}" data-monster-id="${monster.id}" data-monster-mode="${isRally ? "rally" : "story"}" data-monster-motion="${monster.motion || "spring"}" data-monster-skill="${monster.skill?.id || "none"}" data-monster-relic="${monster.relic?.kind || "none"}" data-monster-variant="${Number(monster.artVariant) || 0}" data-monster-hero="${hero.id}" style="--monster:${monster.color};--monster-accent:${monster.accent};--monster-scene:${monster.scene};--monster-ground:${monster.ground};--hero-accent:${hero.accent}">
        <img class="arcade-monster-ready-arena" src="${esc(campusSceneArt())}" alt="" draggable="false" decoding="async" />
        <div class="arcade-monster-ready-light" aria-hidden="true"></div>
        ${monsterRouteMarkup(game.monsterIndex)}
        <div class="arcade-monster-ready-hero" aria-hidden="true"><img src="${esc(hero.art)}" alt="" draggable="false" decoding="async" /></div>
        <div class="arcade-monster-ready-enemy" aria-hidden="true"><img src="${esc(monster.art)}" alt="" draggable="false" decoding="async" />${monsterRelicMarkup(monster)}</div>
        <div class="arcade-monster-ready-versus"><small>${esc(modeEyebrow)}</small><b>${esc(campus ? (locale() === "zh" ? "校园集结" : "รวมพลที่โรงเรียน") : modeHook)}</b><span>${esc(monsterStageLabel(monster))} · ${esc(monsterName(monster))}</span></div>
      </div>
      <div class="arcade-monster-ready-brief">
        ${monsterResumeMarkup()}
        <div class="arcade-monster-ready-headline">
          <p class="arcade-monster-ready-loot"><i aria-hidden="true">✦</i>${esc(modeLoot)}</p>
          <h3 id="monster-ready-title">${esc(campus ? (locale() === "zh" ? "选好搭档，一起开打。" : "เลือกคู่หู แล้วไปลุยกัน") : c.monsterReadyTitle)}</h3>
          <p class="arcade-expedition-growth"><b>${esc(c.monsterCombatLevel(game.combatLevel))}</b><span>${esc(c.monsterGrowthNote)}</span></p>
          <p class="arcade-monster-ready-opponent"><span>${esc(c.monsterReadyOpponent)} · ${esc(c.monsterEnemyLevel(monsterEncounterLevel(monster)))}</span><b>${esc(monsterName(monster))} · ${monsterScaledHp(monster)} HP</b><em>${esc(monsterTraitText(monster))}</em></p>
        </div>
        ${worldAtlasEntryMarkup()}
        ${monsterHeroPickerMarkup()}
        ${monsterWorldMarkup()}
        ${campus ? `<button type="button" class="campus-optional-study" data-campus-study data-speech-skip>${locale() === "zh" ? "不熟悉词汇？先看本关手记（可选）" : "ยังไม่รู้คำศัพท์? อ่านบันทึกของด่านก่อน (เลือกได้)"}</button>` : ""}
        ${campus ? `${startButton}<div class="campus-battle-guide"><b>${locale() === "zh" ? "第一回合怎么打？" : "รอบแรกเล่นอย่างไร?"}</b><p>${locale() === "zh" ? "看敌人技能 → 选招式 → 听题后开口或选答案。听完才计时，答对越快伤害越高。" : "ดูสกิลศัตรู → เลือกท่า → ฟังแล้วพูดหรือเลือกคำตอบ เริ่มจับเวลาหลังฟังจบ ตอบถูกเร็วทำดาเมจมากขึ้น"}</p><small>${esc(c.monsterJudgeNote)}</small></div>${campusRouteMarkup()}<details class="campus-route-details" ${mapsOpen ? "open" : ""}><summary>${locale() === "zh" ? "换章节 / 百怪巡游" : "เปลี่ยนบท / ทัวร์ร้อยมอนสเตอร์"}</summary>${activeMonsterMapMarkup()}</details>` : activeMonsterMapMarkup()}
        <details class="arcade-monster-ready-details">
          <summary><span>${esc(c.monsterReadyDetails)}</span><b aria-hidden="true">＋</b></summary>
          <div class="arcade-monster-ready-copy">${esc(c.monsterReadyCopy)}</div>
          <div class="arcade-monster-ready-rules">${c.monsterReadyRules.map((rule, index) => `<span><i>${index + 1}</i><b>${esc(rule)}</b></span>`).join("")}</div>
          <small class="arcade-monster-judge-note">${esc(c.monsterJudgeNote)}</small>
        </details>
        ${campus ? "" : startButton}
      </div>
    </section>`;
    globalThis.requestAnimationFrame?.(() => q(focusSelector)?.focus?.({ preventScroll: true }));
  }

  function chooseMonsterHero(heroId) {
    if (!game || game.type !== "monster" || q("#arcade-sheet")?.dataset.arcadePhase !== "monster-ready") return;
    const hero = MONSTER_HERO_CONFIGS.find(item => item.id === heroId);
    if (!hero || hero.id === game.monsterHeroId) return;
    game.monsterHeroId = hero.id;
    vibrate(10);
    renderMonsterReady(`[data-monster-hero="${hero.id}"]`);
  }

  function renderCampusLobby(focusSelector) {
    const journey = campusJourney(), zh = locale() === "zh", hero = currentMonsterHero();
    const partner = currentMonsterHero(hero.id === "thai" ? "chinese" : "thai");
    const progress = monsterCollectionSnapshot(1), enemy = currentMonster();
    q("#arcade-sheet").dataset.arcadePhase = "monster-ready";
    q("#arcade-sheet-kicker").textContent = journey.subtitle;
    q("#arcade-round").textContent = journey.location;
    q("#arcade-timer").textContent = "—";
    setProgress(progress.chapterDefeated / 6 * 100);
    q("#arcade-stage").innerHTML = `<section class="campus-ready campus-lobby" data-restored="${progress.chapterCleared}" style="--journey-scene:url('${esc(journey.art)}')">
      <div class="campus-lobby-scene"><span class="campus-location">${esc(journey.location)}</span><div class="campus-lobby-title"><small>${esc(journey.subtitle)}</small><h3>${esc(journey.title)}</h3><p>${esc(progress.chapterCleared ? journey.restored : journey.intro)}</p></div><div class="campus-lobby-cast" aria-hidden="true"><img src="${esc(hero.art)}"/><img src="${esc(partner.art)}"/></div><span class="campus-scene-caption">${zh ? "一座城，两个人，一本还没写完的冒险手册。" : "หนึ่งเมือง สองคู่หู และบันทึกการผจญภัยที่ยังไม่จบ"}</span>${progress.chapterCleared ? '<div class="campus-restored-flags" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></div>' : ''}</div>
      <div class="campus-lobby-page"><header><span class="campus-eyebrow">${zh ? "下一站" : "จุดหมายถัดไป"} / 0${game.monsterIndex + 1}</span><h4>${esc(journey.stations[game.monsterIndex])}</h4><p>${esc(journey.notes[game.monsterIndex])}</p></header>
      <div class="campus-duo-select" role="radiogroup" aria-label="${zh ? "选择出战搭档" : "เลือกคู่หูออกต่อสู้"}">${MONSTER_HERO_CONFIGS.map(item=>`<button type="button" role="radio" aria-checked="${item.id === hero.id}" data-monster-hero="${item.id}" data-speech-skip><span>${item.id === hero.id ? "●" : "○"}</span><b>${esc(monsterHeroName(item))}</b><small>${item.id === hero.id ? (zh ? "本场出战" : "ออกต่อสู้") : (zh ? "点击换人" : "แตะเพื่อสลับ")}</small></button>`).join("")}</div>
      <p class="campus-duo-note">${zh ? "两人共享成长；未出战的搭档负责合击支援。" : "ทั้งคู่เติบโตด้วยกัน อีกคนจะช่วยด้วยท่าคู่หู"}</p>
      <div class="campus-lobby-opponent"><img src="${esc(enemy.art)}" alt=""/><span><small>${zh ? "本关对手" : "คู่ต่อสู้ด่านนี้"}</small><b>${esc(monsterName(enemy))}</b></span><strong>${monsterScaledHp(enemy)}<small> HP</small></strong></div>
      ${monsterResumeMarkup()}<button type="button" class="campus-depart" data-monster-start data-speech-skip><span><b>${zh ? "出发，找回散页" : "ออกตามหาหน้ากระดาษ"}</b><small>${zh ? "听懂 · 出招 · 和搭档一起闯关" : "ฟังให้เข้าใจ · ออกท่า · ผ่านด่านกับคู่หู"}</small></span><i aria-hidden="true">↗</i></button>
      ${worldAtlasEntryMarkup()}
      <button type="button" class="campus-study-link" data-campus-study data-speech-skip>${zh ? "先看本关词汇手记（可选）" : "อ่านบันทึกคำศัพท์ก่อน (เลือกได้)"} →</button>
      <details class="campus-instructions"><summary>${zh ? "第一次冒险？查看玩法" : "ผจญภัยครั้งแรก? ดูวิธีเล่น"}</summary><p>${zh ? "先选招式，再听题。听完才计时；可以开口，也可以选答案。正确回答积攒合击，击败对手后选择强化。第 3、5 站前会出现路线事件。" : "เลือกท่าแล้วฟังโจทย์ เริ่มจับเวลาหลังฟังจบ พูดหรือเลือกคำตอบก็ได้ ตอบถูกเพื่อชาร์จท่าคู่ ชนะแล้วเลือกพลังเสริม มีเหตุการณ์ทางเลือกก่อนด่าน 3 และ 5"}</p><small>${esc(copy().monsterJudgeNote)}</small></details>
      </div><div class="campus-lobby-map">${campusRouteMarkup()}${campusNotebookMarkup()}${monsterWorldMarkup()}</div></section>`;
    q(focusSelector)?.focus?.({ preventScroll: true });
  }

  function monsterSkillCardMarkup(monster = currentMonster()) {
    const state = monsterSkillState(monster);
    if (!state) return "";
    const c = copy();
    const styleName = c.monsterStyles?.[state.recommendedStyle]?.[0] || state.recommendedStyle;
    const status = state.active ? c.monsterSkillActive(styleName) : c.monsterSkillCooldown(state.turnsUntil);
    return `<aside class="arcade-monster-skill-card${state.active ? " is-active" : ""}${state.countered ? " is-countered" : ""}" data-monster-skill-card data-skill-state="${state.active ? "active" : "cooldown"}" aria-live="polite"><i aria-hidden="true">✦</i><span><small>${esc(c.monsterSkillTitle)} · ${esc(monsterSkillName(monster))}</small><b data-monster-skill-status>${esc(status)}</b><em>${esc(monsterSkillHint(monster))}</em></span><strong data-monster-skill-counter>${esc(c.monsterSkillRecommended(styleName))}</strong></aside>`;
  }

  function monsterStyleButtonsMarkup(monster = currentMonster()) {
    const c = copy();
    return MONSTER_STYLE_ORDER.map(styleId => {
      const style = monsterStyleConfig(styleId);
      const labels = c.monsterStyles?.[styleId] || [styleId, "", ""];
      const turnMs = monsterTurnDuration(monster, styleId);
      const seconds = (turnMs / 1000).toFixed(1).replace(/\.0$/u, "");
      const damage = monsterAttackDamage(turnMs, styleId, turnMs);
      const skillState = monsterSkillState(monster, game?.stageRound || 0, styleId);
      const recommended = Boolean(skillState?.active && skillState.recommendedStyle === styleId);
      const tag = recommended ? c.monsterSkillCounterBadge : labels[2];
      const aria = `${labels[0]} · ${c.monsterStyleStats(seconds, damage)} · ${labels[1]} · ${tag}`;
      return `<button type="button" class="${recommended ? "is-skill-counter" : ""}" data-monster-arm="${styleId}" data-monster-style="${styleId}" aria-label="${esc(aria)}" aria-pressed="false"><i aria-hidden="true">${esc(style.icon)}</i><span><b>${esc(labels[0])}</b><small data-monster-style-stats>${esc(c.monsterStyleStats(seconds, damage))}</small><em data-monster-style-tag>${esc(tag)}</em></span></button>`;
    }).join("");
  }

  function updateMonsterPlanningUi() {
    if (!game || game.type !== "monster") return;
    const c = copy();
    const intent = q("[data-monster-intent]");
    const threat = q("[data-monster-threat]");
    if (!game.answered) {
      if (intent) intent.textContent = monsterIntentText();
      if (threat) threat.textContent = monsterRiskText();
    }
    const command = q(".arcade-monster-command");
    const commandPhase = game.answered ? "result" : game.timerActive ? "attack" : game.busy ? "cue" : "plan";
    const explore = q("[data-campus-explore]");
    if (explore) explore.disabled = game.busy || game.timerActive || game.answered;
    if (command) command.dataset.commandPhase = commandPhase;
    const world = q(".arcade-monster-world");
    if (world) world.dataset.commandPhase = commandPhase;
    if (world) world.dataset.bossPhase = String(window.HUILAISHI_CAMPUS_ADVENTURE?.bossPhase(currentMonster(), game.monsterHp, game.monsterMaxHp) || 1);
    const burstReady = (Number(game.burstCharge) || 0) >= MONSTER_BURST_EVERY;
    const burstDamage = monsterBurstDamage();
    const burst = q("[data-monster-burst]");
    const burstLabel = game.burstArmed
      ? c.monsterBurstArmed(burstDamage)
      : burstReady ? c.monsterBurstReady : c.monsterBurstCharge(game.burstCharge, MONSTER_BURST_EVERY);
    if (burst) {
      burst.classList.toggle("is-ready", burstReady);
      burst.classList.toggle("is-armed", Boolean(game.burstArmed));
      burst.disabled = !burstReady || game.busy || game.timerActive || game.answered;
      burst.setAttribute("aria-pressed", String(Boolean(game.burstArmed)));
      burst.setAttribute("aria-label", burstLabel);
    }
    const burstValue = q("[data-monster-burst-label]");
    if (burstValue) burstValue.textContent = burstLabel;
    [...document.querySelectorAll("[data-monster-burst-pip]")].forEach((pip, index) => pip.classList.toggle("is-filled", index < game.burstCharge));
    [...document.querySelectorAll("[data-monster-style]")].forEach(button => {
      const styleId = button.dataset.monsterStyle;
      const labels = c.monsterStyles?.[styleId] || [styleId, "", ""];
      const turnMs = monsterTurnDuration(currentMonster(), styleId);
      const seconds = (turnMs / 1000).toFixed(1).replace(/\.0$/u, "");
      const damage = monsterAttackDamage(turnMs, styleId, turnMs);
      const stats = c.monsterStyleStats(seconds, damage);
      const skillState = monsterSkillState(currentMonster(), game.stageRound, styleId);
      const recommended = Boolean(skillState?.active && skillState.recommendedStyle === styleId);
      const tag = recommended ? c.monsterSkillCounterBadge : labels[2];
      const value = button.querySelector("[data-monster-style-stats]");
      if (value) value.textContent = stats;
      const tagValue = button.querySelector("[data-monster-style-tag]");
      if (tagValue) tagValue.textContent = tag;
      button.disabled = game.busy || game.timerActive || game.answered;
      button.classList.toggle("is-active", game.monsterStyle === styleId);
      button.classList.toggle("is-skill-counter", recommended);
      button.setAttribute("aria-pressed", String(game.monsterStyle === styleId));
      button.setAttribute("aria-label", `${labels[0]} · ${stats} · ${labels[1]} · ${tag}`);
    });
    const skillState = monsterSkillState(currentMonster(), game.stageRound, game.monsterStyle || "steady");
    const skillCard = q("[data-monster-skill-card]");
    if (skillCard && skillState) {
      const styleName = c.monsterStyles?.[skillState.recommendedStyle]?.[0] || skillState.recommendedStyle;
      skillCard.dataset.skillState = skillState.active ? "active" : "cooldown";
      skillCard.classList.toggle("is-active", skillState.active);
      skillCard.classList.toggle("is-countered", skillState.countered);
      const status = skillCard.querySelector("[data-monster-skill-status]");
      const counter = skillCard.querySelector("[data-monster-skill-counter]");
      if (status) status.textContent = skillState.active ? c.monsterSkillActive(styleName) : c.monsterSkillCooldown(skillState.turnsUntil);
      if (counter) counter.textContent = c.monsterSkillRecommended(styleName);
    }
    if (world && skillState) {
      world.dataset.skillState = skillState.active ? "active" : "cooldown";
      world.classList.toggle("is-skill-active", skillState.active);
      world.classList.toggle("is-skill-countered", Boolean(skillState.active && skillState.countered));
    }
    const voice = q("[data-monster-voice]");
    const voiceLabel = q("[data-monster-voice-label]");
    const voiceHint = q("[data-monster-voice-hint]");
    const seconds = (Math.max(1000, Number(game.turnMs) || MONSTER_TURN_MS) / 1000).toFixed(1).replace(/\.0$/u, "");
    const cueing = game.busy && !game.timerActive && !game.answered;
    if (voice) {
      voice.dataset.monsterAction = game.timerActive ? "attack" : cueing ? "cue" : "arm";
      voice.disabled = game.answered || cueing;
    }
    if (voiceLabel) voiceLabel.textContent = game.timerActive ? c.monsterVoice : cueing ? c.monsterCueShort : game.cueFailed ? c.monsterTextStart : c.monsterArm(seconds);
    if (voiceHint) voiceHint.textContent = game.timerActive ? c.monsterVoiceHint : cueing ? c.monsterCuePlaying : game.cueFailed ? c.monsterCueFailed : c.monsterArmHint;
  }

  function bindMonsterStatusMirror() {
    monsterStatusObserver?.disconnect?.();
    monsterStatusObserver = null;
    const source = q("[data-monster-status]");
    const target = q("[data-monster-command-status]");
    const world = q(".arcade-monster-world");
    if (!source || !target || !world || typeof MutationObserver !== "function") return;
    const sync = () => {
      target.textContent = source.textContent.trim();
      target.dataset.statusState = world.dataset.monsterState || "ready";
    };
    sync();
    monsterStatusObserver = new MutationObserver(sync);
    monsterStatusObserver.observe(source, { childList:true, characterData:true, subtree:true });
    monsterStatusObserver.observe(world, { attributes:true, attributeFilter:["data-monster-state"] });
  }

  function toggleMonsterBurst() {
    if (!game || game.type !== "monster" || game.busy || game.timerActive || game.answered || game.burstCharge < MONSTER_BURST_EVERY) return;
    game.burstArmed = !game.burstArmed;
    const world = q(".arcade-monster-world");
    if (world) world.classList.toggle("is-burst-armed", game.burstArmed);
    const status = q("[data-monster-status]");
    if (status) status.textContent = game.burstArmed ? copy().monsterBurstArmed(monsterBurstDamage()) : copy().monsterBurstDisarmed;
    updateMonsterPlanningUi();
    vibrate(game.burstArmed ? [12, 24, 20] : 8);
  }

  function selectMonsterStyle(styleId) {
    if (!game || game.type !== "monster" || !MONSTER_STYLE_ORDER.includes(styleId) || game.busy || game.timerActive || game.answered) return false;
    game.monsterStyle = styleId;
    game.turnMs = monsterTurnDuration(currentMonster(), styleId);
    game.remainingMs = game.turnMs;
    const world = q(".arcade-monster-world");
    if (world) world.dataset.playerStyle = styleId;
    const seconds = (game.turnMs / 1000).toFixed(1).replace(/\.0$/u, "");
    q("#arcade-timer").textContent = copy().monsterTime(seconds);
    const power = q("[data-monster-power]");
    if (power) power.textContent = copy().monsterPower(monsterAttackDamage(game.turnMs, styleId, game.turnMs));
    updateMonsterPlanningUi();
    const labels = copy().monsterStyles?.[styleId] || [styleId];
    const status = q("[data-monster-status]");
    if (status) status.textContent = game.cueFailed ? copy().monsterCueFailed : copy().monsterStyleReady(labels[0]);
    return true;
  }

  function updateMonsterHud() {
    if (!game || game.type !== "monster") return;
    const playerHp = Math.max(0, game.playerHp);
    const monsterHp = Math.max(0, game.monsterHp);
    const playerBar = q("[data-monster-player-bar]");
    const monsterBar = q("[data-monster-enemy-bar]");
    const playerValue = q("[data-monster-player-hp]");
    const monsterValue = q("[data-monster-enemy-hp]");
    const comboValues = [...document.querySelectorAll("[data-monster-combo]")];
    const momentumTierValue = q("[data-monster-momentum-tier]");
    const momentumBar = q("[data-monster-momentum-bar]");
    const traitValue = q("[data-monster-trait]");
    const intentValue = q("[data-monster-intent]");
    const damageFormulaValue = q("[data-monster-damage-formula]");
    const playerHealth = q(".arcade-monster-health.is-player");
    const monsterHealth = q(".arcade-monster-health.is-enemy");
    const world = q(".arcade-monster-world");
    const playerMaxHp = Math.max(1, Number(game.playerMaxHp) || monsterPlayerMaxHp());
    if (playerBar) playerBar.style.width = `${playerHp / playerMaxHp * 100}%`;
    if (monsterBar) monsterBar.style.width = `${game.monsterMaxHp > 0 ? monsterHp / game.monsterMaxHp * 100 : 0}%`;
    if (playerValue) playerValue.textContent = `${playerHp}/${playerMaxHp}`;
    if (monsterValue) monsterValue.textContent = `${monsterHp}/${game.monsterMaxHp}`;
    const streak = Math.max(0, Number(game.streak) || 0);
    const momentumTier = monsterMomentumTier(streak);
    comboValues.forEach(value => { value.textContent = String(streak); });
    if (momentumTierValue) momentumTierValue.textContent = copy().monsterMomentumTiers?.[momentumTier] || "";
    if (momentumBar) momentumBar.style.width = `${Math.min(100, streak * 20)}%`;
    if (traitValue) traitValue.textContent = monsterTraitText();
    if (intentValue) intentValue.textContent = monsterIntentText();
    if (damageFormulaValue) damageFormulaValue.textContent = `${copy().monsterComboDamage(monsterComboMultiplier(streak))} · ${copy().monsterUpgradeRank(Number(game.rewardRanks?.power) || 0)}`;
    if (playerHealth) playerHealth.setAttribute("aria-label", `${copy().monsterPlayer} ${playerHp}/${playerMaxHp} · ${copy().monsterCombatLevel(game.combatLevel)}`);
    if (monsterHealth) monsterHealth.setAttribute("aria-label", `${currentMonster().boss ? copy().monsterBoss : copy().monsterEnemy} ${monsterHp}/${game.monsterMaxHp}`);
    if (world) world.dataset.comboTier = momentumTier;
    syncMonsterFxToggle();
    updateMonsterPlanningUi();
    setProgress(monsterProgress());
  }

  function updateMonsterTimer() {
    if (!game || game.type !== "monster" || game.answered || !game.timerActive) return;
    game.remainingMs = Math.max(0, game.turnMs - (Date.now() - game.questionStartedAt));
    const seconds = (game.remainingMs / 1000).toFixed(1);
    const bar = q("[data-monster-time-bar]");
    if (bar) bar.style.width = `${game.remainingMs / game.turnMs * 100}%`;
    const power = q("[data-monster-power]");
    if (power) power.textContent = copy().monsterPower(monsterAttackDamage(game.remainingMs, game.monsterStyle, game.turnMs));
    const world = q(".arcade-monster-world");
    const urgent = game.remainingMs > 0 && game.remainingMs / game.turnMs <= .28;
    if (world && world.dataset.monsterState !== "listening") {
      world.classList.toggle("is-turn-urgent", urgent);
      if (urgent && world.dataset.monsterState === "ready") {
        world.dataset.monsterState = "warning";
        setMonsterActionFrame(world, "enemy-windup");
      } else if (!urgent && world.dataset.monsterState === "warning") {
        world.dataset.monsterState = "ready";
        setMonsterActionFrame(world, "idle");
      }
    }
    q("#arcade-timer").textContent = copy().monsterTime(seconds);
    if (game.remainingMs <= 0) settleMonsterAnswer(-1, true);
  }

  function renderMonsterQuestion() {
    if (!game || game.type !== "monster") return;
    if (renderCampusFork()) return;
    q("#arcade-sheet")?.style?.setProperty?.("--journey-scene", `url("${campusSceneArt()}")`);
    game.runPhase = "battle";
    saveMonsterExpedition();
    game.cueFailed = false;
    const scrollSheet = q("#arcade-sheet");
    if (scrollSheet) scrollSheet.scrollTop = 0;
    clearInterval(timerId); timerId = 0;
    hideFeedback();
    game.answered = false;
    game.busy = false;
    const c = copy();
    const monster = currentMonster();
    const hero = currentMonsterHero();
    game.monsterStyle = "steady";
    game.turnMs = monsterTurnDuration(monster, "steady");
    game.remainingMs = game.turnMs;
    game.timerActive = false;
    game.rhythmWindow = Boolean(monster.rhythmEvery && (game.stageRound + 1) % monster.rhythmEvery === 0);
    game.resonanceWindow = Boolean(monster.resonanceEvery && (game.stageRound + 1) % monster.resonanceEvery === 0);
    const skillState = monsterSkillState(monster, game.stageRound, game.monsterStyle);
    const monsterEntering = Boolean(game.monsterEntering);
    const firstTurn = game.answeredCount === 0 && game.stageRound === 0 && game.monstersDefeated === 0;
    const word = (isCampusChapter() && window.HUILAISHI_CAMPUS_CURRICULUM?.battleWord(corpus(), game.monsterIndex, game.stageRound)) || game.words[game.round % game.words.length];
    const view = wordView(word);
    game.current = word;
    game.options = makeWordOptions(word);
    game.questionStartedAt = 0;
    const sheet = q("#arcade-sheet");
    if (sheet) sheet.dataset.arcadePhase = "monster-playing";
    q("#arcade-round").textContent = monsterStageLabel(monster);
    const turnSeconds = (game.turnMs / 1000).toFixed(1).replace(/\.0$/u, "");
    q("#arcade-timer").textContent = c.monsterTime(turnSeconds);
    setProgress(monsterProgress());
    q("#arcade-stage").innerHTML = `<div class="arcade-monster-world is-clear-stage ${monster.rally ? "is-rally" : ""} ${monster.elite ? "is-elite" : ""} ${skillState?.active ? "is-skill-active" : ""} ${monster.boss ? "is-boss" : ""} ${monsterIsEnraged(monster) ? "is-enraged" : ""} ${game.rhythmWindow ? "is-rhythm-turn" : ""} ${game.resonanceWindow ? "is-resonance-turn" : ""} ${game.burstArmed ? "is-burst-armed" : ""}" data-monster-id="${monster.id}" data-monster-mode="${monster.rally ? "rally" : "story"}" data-monster-chapter="${monster.chapter}" data-monster-zone="${monster.rallyZone || 0}" data-monster-motion="${monster.motion || "spring"}" data-monster-skill="${monster.skill?.id || "none"}" data-monster-relic="${monster.relic?.kind || "none"}" data-monster-variant="${Number(monster.artVariant) || 0}" data-skill-state="${skillState?.active ? "active" : "cooldown"}" data-monster-hero="${hero.id}" data-monster-mechanic="${monster.trait || "none"}" data-player-style="${game.monsterStyle}" data-monster-state="${monsterEntering ? "enter" : "ready"}" data-action-frame="idle" data-combo-tier="${monsterMomentumTier()}" data-first-turn="${String(firstTurn)}" style="--monster:${monster.color};--monster-accent:${monster.accent};--monster-scene:${monster.scene};--monster-ground:${monster.ground};--hero-accent:${hero.accent}">
      <div class="arcade-monster-hud">
        <div class="arcade-monster-health is-player" aria-label="${esc(c.monsterPlayer)} ${game.playerHp}/${game.playerMaxHp}"><div class="arcade-player-tag"><b>${esc(monsterHeroName(hero))}</b><small>${esc(c.monsterCombo)} <em data-monster-combo>${Math.max(0, Number(game.streak) || 0)}</em></small></div><span><b>${esc(c.monsterCombatLevel(game.combatLevel))}</b><strong data-monster-player-hp>${game.playerHp}/${game.playerMaxHp}</strong></span><i><em data-monster-player-bar style="width:${game.playerHp / game.playerMaxHp * 100}%"></em></i></div>
        <div class="arcade-monster-health is-enemy" aria-label="${esc(c.monsterEnemy)} ${game.monsterHp}/${game.monsterMaxHp}"><div class="arcade-monster-name"><small>${esc(monster.boss ? `${c.monsterBoss} · ${monsterStageLabel(monster)}` : monster.elite ? `${c.monsterElite} · ${monsterStageLabel(monster)}` : monsterStageLabel(monster))}</small><b>${esc(monsterName(monster))}</b><em data-monster-trait>${esc(monsterTraitText(monster))}</em></div><span><b>${esc(c.monsterEnemyLevel(monsterEncounterLevel(monster)))}</b><strong data-monster-enemy-hp>${game.monsterHp}/${game.monsterMaxHp}</strong></span><i><em data-monster-enemy-bar style="width:${game.monsterMaxHp > 0 ? game.monsterHp / game.monsterMaxHp * 100 : 0}%"></em></i></div>
        <button type="button" class="arcade-monster-fx-toggle" data-monster-fx-toggle aria-pressed="${String(isMonsterFxEnabled())}" aria-label="${esc(isMonsterFxEnabled() ? c.monsterFxOn : c.monsterFxOff)}"><svg aria-hidden="true"><use href="#i-volume"></use></svg><span>${isMonsterFxEnabled() ? "FX" : "FX ×"}</span></button>
      </div>
      ${monsterRouteMarkup(game.monsterIndex)}
      <div class="arcade-monster-battlefield">
        ${campusBattleSceneMarkup()}
        <div class="arcade-monster-scenery" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="arcade-monster-stage-light" aria-hidden="true"></div>
        <div class="arcade-monster-entry" aria-hidden="true"><small>${esc(monster.boss ? c.monsterEntryBoss : monster.elite ? c.monsterEntryElite : c.monsterEntryRival)}</small><b>${esc(monsterName(monster))}</b><em>${esc(monsterTraitText(monster))}</em></div>
        <div class="arcade-monster-momentum" aria-hidden="true"><small>${esc(c.monsterMomentum)}</small><b><em data-monster-combo>${Math.max(0, Number(game.streak) || 0)}</em><span>×</span></b><strong data-monster-momentum-tier>${esc(c.monsterMomentumTiers?.[monsterMomentumTier()] || "")}</strong><i><u data-monster-momentum-bar style="width:${Math.min(100, Math.max(0, Number(game.streak) || 0) * 20)}%"></u></i></div>
        <div class="arcade-monster-challenge" aria-hidden="true"><i>✦</i><span>${esc(c.monsterChallenge)}</span></div>
        <div class="arcade-monster-fx" aria-hidden="true"><img class="arcade-monster-collage-fx is-windup" src="${esc(MONSTER_COLLAGE_VFX.windup)}" alt="" draggable="false" decoding="async" /><img class="arcade-monster-collage-fx is-contact" src="${esc(MONSTER_COLLAGE_VFX.contact)}" alt="" draggable="false" decoding="async" /><img class="arcade-monster-collage-fx is-critical" src="${esc(MONSTER_COLLAGE_VFX.critical)}" alt="" draggable="false" decoding="async" /><img class="arcade-monster-collage-fx is-recover" src="${esc(MONSTER_COLLAGE_VFX.recover)}" alt="" draggable="false" decoding="async" /><i class="arcade-monster-hit-flash"></i><i class="arcade-monster-sonic-ring ring-one"></i><i class="arcade-monster-sonic-ring ring-two"></i><span class="arcade-monster-speed-lines"><i></i><i></i><i></i><i></i><i></i></span><span class="arcade-monster-paper-burst"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span></div>
        ${hero.id === "thai" ? `<div class="arcade-monster-cut-in" aria-hidden="true"><img src="${esc(MONSTER_THAI_STRIKE_CUTIN)}" alt="" draggable="false" decoding="async" /><span><small>${esc(c.monsterCutInKicker)}</small><b>${esc(c.monsterCutInTitle)}</b></span></div>` : ""}
        <div class="arcade-player-avatar" aria-hidden="true"><span class="arcade-player-voice-ring"></span><img class="arcade-player-echo" src="${esc(hero.art)}" data-sprite-pose="idle" alt="" draggable="false" decoding="async" /><img class="arcade-player-sprite" src="${esc(hero.art)}" data-sprite-pose="idle" alt="" draggable="false" decoding="async" /></div>
        <div class="arcade-monster-versus" aria-hidden="true"><i></i><b>${esc(c.monsterSigil)}</b><i></i></div>
        <div class="arcade-monster-aura" aria-hidden="true"></div>
        <div class="arcade-monster-avatar" aria-hidden="true"><span class="arcade-monster-shadow"></span><img class="arcade-monster-echo" src="${esc(monster.art)}" data-sprite-pose="idle" alt="" draggable="false" decoding="async" /><img class="arcade-monster-sprite" src="${esc(monster.art)}" data-sprite-pose="idle" alt="" draggable="false" decoding="async" />${monsterRelicMarkup(monster)}<i class="arcade-monster-shard shard-one"></i><i class="arcade-monster-shard shard-two"></i><i class="arcade-monster-shard shard-three"></i></div>
        <div class="arcade-monster-strike" aria-hidden="true"><i></i><i></i><i></i></div>
        <strong class="arcade-monster-impact" data-monster-impact aria-hidden="true" hidden></strong>
      </div>
      <div class="arcade-monster-tactics">
        <div class="arcade-monster-intent"><small>${esc(c.monsterIntentTitle)}</small><b data-monster-intent>${esc(monsterIntentText(monster))}</b><span data-monster-threat>${esc(monsterRiskText(monster))}</span></div>
        <button type="button" class="arcade-monster-burst${game.burstCharge >= MONSTER_BURST_EVERY ? " is-ready" : ""}${game.burstArmed ? " is-armed" : ""}" data-monster-burst aria-pressed="${String(Boolean(game.burstArmed))}" ${game.burstCharge < MONSTER_BURST_EVERY ? "disabled" : ""}><span aria-hidden="true">${Array.from({ length: MONSTER_BURST_EVERY }, (_, index) => `<i data-monster-burst-pip class="${index < game.burstCharge ? "is-filled" : ""}"></i>`).join("")}</span><b data-monster-burst-label>${esc(game.burstArmed ? c.monsterBurstArmed(monsterBurstDamage()) : game.burstCharge >= MONSTER_BURST_EVERY ? c.monsterBurstReady : c.monsterBurstCharge(game.burstCharge, MONSTER_BURST_EVERY))}</b></button>
      </div>
      <div class="arcade-monster-time"><i><em data-monster-time-bar style="width:100%"></em></i><b><span>${esc(c.monsterRule)}<small data-monster-damage-formula>${esc(`${c.monsterComboDamage(monsterComboMultiplier(game.streak))} · ${c.monsterUpgradeRank(Number(game.rewardRanks?.power) || 0)}`)}</small></span><strong data-monster-power>${esc(c.monsterChoosePower)}</strong></b></div>
      <p class="arcade-monster-status" data-monster-status role="status" aria-live="assertive">${esc(c.monsterReady)}</p>
    </div>
    <div class="arcade-monster-command${firstTurn ? " is-first-turn" : ""}" data-command-phase="plan">
      <div class="arcade-monster-command-scroll">
      <div class="arcade-monster-voice-grade" data-monster-voice-grade aria-live="polite" hidden><small>${esc(c.monsterVoiceGradeLabel)}</small><b data-monster-voice-grade-label></b><strong data-monster-voice-score>0</strong><i aria-hidden="true"><em></em></i><span data-monster-voice-bonus></span></div>
      <div class="arcade-monster-learning-pulse" data-monster-learning aria-live="polite" hidden></div>
      ${firstTurn ? `<div class="arcade-monster-first-mission" aria-label="${esc(`${c.monsterFirstMission} · ${c.monsterFirstSteps}`)}"><i>01</i><span><b>${esc(c.monsterFirstMission)}</b><small>${esc(c.monsterFirstSteps)}</small></span></div>` : ""}
      <div class="arcade-monster-question"><span class="game-chip">L${game.campaignLevel} · ${esc(monsterStageLabel(monster))} · ${esc(c.monsterQuestionTag)}</span><div class="arcade-monster-word"><button type="button" data-monster-audio disabled aria-label="${esc(c.monsterHear)}"><svg><use href="#i-volume"></use></svg></button><div><h3 lang="${view.lang}">${esc(view.target)}</h3><p>${esc(view.reading)}</p></div></div>${phoneticHintMarkup(view.phoneticHint)}<span class="meaning-hint">${esc(c.monsterPrompt)}</span></div>
      ${monsterSkillCardMarkup(monster)}
      ${campusStoryEntry() ? `<button type="button" class="campus-explore-trigger" data-campus-explore data-speech-skip>${locale() === "zh" ? "环顾四周 · 怪物来历与线索" : "สำรวจรอบตัว · เรื่องราวและเบาะแส"}<span aria-hidden="true">↗</span></button>` : ""}
      <div class="arcade-monster-cue" role="group" aria-label="${esc(c.monsterChooseStyle)}">${monsterStyleButtonsMarkup(monster)}</div>
      </div>
      <div class="arcade-monster-controls">
      <article class="arcade-monster-round-result" data-monster-round-result aria-hidden="true" hidden><header><span><small data-monster-round-kicker></small><b data-monster-round-meta></b></span><strong data-monster-round-title></strong></header><div data-monster-round-formula></div><p data-monster-round-detail></p><footer><em data-monster-round-learning></em><small data-monster-round-tap></small></footer></article>
      <div class="arcade-monster-attack"><button type="button" data-monster-voice data-monster-action="arm"><span class="arcade-monster-wave" aria-hidden="true"><i></i><i></i><i></i><i></i></span><b data-monster-voice-label>${esc(c.monsterArm(turnSeconds))}</b><small data-monster-voice-hint>${esc(c.monsterArmHint)}</small></button><button type="button" data-monster-network hidden>${esc(c.monsterNetwork)}</button><p>${esc(c.monsterFallback)}</p></div>
      <div class="arcade-options arcade-monster-options">${game.options.map((option, index) => `<button type="button" class="arcade-option" data-monster-answer="${index}" disabled ${choiceShortcutAttrs(index)}><span>${c.answerLetters[index]}</span><span class="arcade-option-copy"><b>${esc(option.view.meaning)}</b></span></button>`).join("")}</div>
      <div class="arcade-monster-audio-recovery" data-monster-audio-recovery hidden><button type="button" data-monster-retry-cue>${esc(c.monsterRetryCue)}</button><button type="button" data-audio-install="${game.campaignLevel}">${esc(c.installPack(game.campaignLevel))}</button></div>
      <p class="arcade-monster-command-status" data-monster-command-status aria-hidden="true"></p>
      <small class="arcade-expedition-save" role="status">${esc(game.saveDurable ? c.monsterSaveLocal : c.monsterSaveMemory)}</small>
      </div>
    </div>`;
    updateMonsterPlanningUi();
    bindMonsterStatusMirror();
    primeWordVoice(word);
    if (monsterEntering) {
      game.monsterEntering = false;
      const enteringWorld = q(".arcade-monster-world");
      if (!shouldReduceMotion()) setMonsterActionFrame(enteringWorld, "run");
      const enteringIndex = game.monsterIndex;
      schedule(() => {
        if (!game || game.type !== "monster" || game.monsterIndex !== enteringIndex) return;
        const world = q(".arcade-monster-world");
        if (world?.dataset.monsterState === "enter") { world.dataset.monsterState = "ready"; setMonsterActionFrame(world, "idle"); }
      }, 760);
    }
    globalThis.requestAnimationFrame?.(() => q("#arcade-stage [data-monster-voice]")?.focus?.({ preventScroll: true }));
  }

  function startMonsterTimer(audioFailed = false) {
    if (!game || game.type !== "monster" || game.answered || game.timerActive) return;
    game.busy = false;
    game.timerActive = true;
    game.remainingMs = game.turnMs;
    game.questionStartedAt = Date.now();
    const cue = q(".arcade-monster-cue");
    if (cue) cue.hidden = true;
    setMonsterControlsDisabled(false);
    const world = q(".arcade-monster-world");
    if (world) world.dataset.monsterState = "ready";
    const status = q("[data-monster-status]");
    if (status) status.textContent = audioFailed ? copy().monsterTextGo : copy().monsterGo;
    if (audioFailed) {
      const tag = q(".arcade-monster-question .game-chip");
      if (tag) tag.textContent = `L${game.campaignLevel} · ${monsterStageLabel()} · ${locale() === "zh" ? "文字题" : "โจทย์ข้อความ"}`;
    }
    clearInterval(timerId);
    timerId = setInterval(updateMonsterTimer, 100);
    updateMonsterTimer();
    updateMonsterPlanningUi();
    q("[data-monster-voice]")?.focus?.({ preventScroll: true });
  }

  function beginMonsterTurn(styleId = "steady") {
    if (!game || game.type !== "monster" || game.answered || game.timerActive || game.busy) return;
    if (game.cueFailed) {
      game.cueFailed = false;
      const recovery = q("[data-monster-audio-recovery]");
      if (recovery) recovery.hidden = true;
      return startMonsterTimer(true);
    }
    if (!selectMonsterStyle(styleId)) return;
    const active = game;
    const round = game.round;
    game.busy = true;
    updateMonsterPlanningUi();
    const world = q(".arcade-monster-world");
    q(".arcade-monster-first-mission")?.classList.add("is-complete");
    if (world) world.dataset.monsterState = "cue";
    const status = q("[data-monster-status]");
    if (status) status.textContent = copy().monsterCuePlaying;
    let completed = false;
    const finish = audioFailed => {
      if (completed || game !== active || game.round !== round || game.answered) return;
      completed = true;
      if (audioFailed) {
        // Missing/blocked audio must not silently start a timed question.
        wordAudioRequest += 1;
        try { window.HUILAISHI_SPEECH?.stop?.(); } catch (_) {}
        game.busy = false;
        game.cueFailed = true;
        if (world) world.dataset.monsterState = "ready";
        if (status) status.textContent = copy().monsterCueFailed;
        const recovery = q("[data-monster-audio-recovery]");
        if (recovery) recovery.hidden = false;
        updateMonsterPlanningUi();
        return;
      }
      const graceMs = audioFailed ? 300 : MONSTER_INPUT_GRACE_MS;
      if (world) world.dataset.monsterState = "armed";
      if (status) status.textContent = audioFailed ? copy().monsterCueFailed : copy().monsterCueGrace;
      schedule(() => {
        if (game !== active || game.round !== round || game.answered) return;
        startMonsterTimer(Boolean(audioFailed));
      }, graceMs);
    };
    schedule(() => finish(true), 7000);
    void playWordVoice(game.current, { onEnd: () => finish(false), onError: () => finish(true) });
  }

  function setMonsterControlsDisabled(disabled) {
    [...document.querySelectorAll("#arcade-stage [data-monster-answer], #arcade-stage [data-monster-voice], #arcade-stage [data-monster-audio]")].forEach(button => {
      button.disabled = Boolean(disabled);
    });
  }

  function resumeMonsterTimer(remainingMs) {
    if (!game || game.type !== "monster" || game.answered) return;
    const safeRemaining = Math.max(250, Math.min(game.turnMs, Number(remainingMs) || 0));
    game.questionStartedAt = Date.now() - (game.turnMs - safeRemaining);
    game.remainingMs = safeRemaining;
    game.timerActive = true;
    clearInterval(timerId);
    timerId = setInterval(updateMonsterTimer, 100);
    updateMonsterTimer();
  }

  async function attemptMonsterVoice(allowNetwork = false) {
    if (!game || game.type !== "monster" || game.answered || game.busy || !game.timerActive) return;
    const active = game;
    const round = game.round;
    const scorer = window.PronunciationScorer;
    const c = copy();
    const view = wordView(game.current);
    const world = q(".arcade-monster-world");
    const status = q("[data-monster-status]");
    const voiceButton = q("[data-monster-voice]");
    const networkButton = q("[data-monster-network]");
    if (!scorer?.recognizeTarget) {
      if (status) status.textContent = c.monsterUnavailable;
      return;
    }
    game.busy = true;
    const remainingAtSpeechStart = Math.max(300, game.remainingMs);
    let speechStartedAt = 0;
    clearInterval(timerId); timerId = 0;
    setMonsterControlsDisabled(true);
    if (networkButton) networkButton.hidden = true;
    if (voiceButton) voiceButton.setAttribute("aria-busy", "true");
    if (world) world.dataset.monsterState = "listening";
    if (status) status.textContent = c.monsterListening;
    let result;
    try {
      result = await scorer.recognizeTarget({
      target: view.target,
      lang: view.voiceLang,
      threshold: 78,
      maxMs: 7000,
      allowNetwork: allowNetwork || active.networkPermit,
      onStatus: value => { if (value === "listening" && !speechStartedAt) speechStartedAt = Date.now(); },
      onInterim: interim => {
        if (game !== active || game.round !== round || game.answered || !interim) return;
        if (status) status.textContent = c.monsterJudging(interim.transcript || "");
      }
      });
    } catch (_) {
      // A native/plugin failure is not a wrong answer. Restore the same text
      // turn, and never let a late rejection revive an abandoned battle.
      result = { passed: false, status: "start-failed" };
    }
    if (!result || typeof result !== "object") result = { passed: false, status: "start-failed" };
    if (game !== active || game.round !== round || game.answered) return;
    game.busy = false;
    if (voiceButton) voiceButton.removeAttribute("aria-busy");
    const speechElapsed = speechStartedAt ? Math.min(2500, Math.max(450, Date.now() - speechStartedAt)) : 450;
    const judgedRemaining = Math.max(250, remainingAtSpeechStart - speechElapsed);
    if (result.passed) {
      game.questionStartedAt = Date.now() - (game.turnMs - judgedRemaining);
      game.remainingMs = judgedRemaining;
      const correctIndex = game.options.findIndex(item => item.correct);
      return settleMonsterAnswer(correctIndex, false, { voice: true, passed: true, score: result.score || 0 });
    }
    if (["local-missing", "network-consent"].includes(result.status)) {
      if (world) world.dataset.monsterState = "ready";
      if (status) status.textContent = c.monsterLocalMissing;
      if (networkButton) networkButton.hidden = false;
      setMonsterControlsDisabled(false);
      resumeMonsterTimer(judgedRemaining);
      return;
    }
    if (result.status !== "result" && result.status !== "passed") {
      if (world) world.dataset.monsterState = "ready";
      if (status) status.textContent = c.monsterUnavailable;
      setMonsterControlsDisabled(false);
      resumeMonsterTimer(judgedRemaining);
      return;
    }
    game.questionStartedAt = Date.now() - (game.turnMs - judgedRemaining);
    game.remainingMs = judgedRemaining;
    return settleMonsterAnswer(-1, false, { voice: true, passed: false, score: result.score || 0 });
  }

  function finishMonsterBattle(victory) {
    if (!game || game.type !== "monster" || game.completed) return;
    clearMonsterExpedition(game.direction);
    document.body?.classList?.remove?.("arcade-monster-active");
    game.monsterVictory = Boolean(victory);
    game.total = Math.max(1, game.answeredCount);
    if (victory) game.score += 500 + Math.max(0, game.playerHp) * 5;
    finishGame();
  }

  function settleMonsterAnswer(index, timedOut = false, answerMeta = {}) {
    if (!game || game.type !== "monster" || game.answered || !game.timerActive) return;
    const active = game;
    const option = index >= 0 ? game.options[index] : null;
    if (!timedOut && !option && !answerMeta.voice) return;
    game.answered = true;
    game.timerActive = false;
    clearInterval(timerId); timerId = 0;
    updateMonsterPlanningUi();
    game.remainingMs = Math.max(0, game.turnMs - (Date.now() - game.questionStartedAt));
    const correctIndex = game.options.findIndex(item => item.correct);
    const correct = !timedOut && (answerMeta.voice ? Boolean(answerMeta.passed) : Boolean(option?.correct));
    const view = wordView(game.current);
    const world = q(".arcade-monster-world");
    const status = q("[data-monster-status]");
    const impact = q("[data-monster-impact]");
    const monster = currentMonster();
    const turnRound = game.stageRound;
    const skillState = monsterSkillState(monster, turnRound, game.monsterStyle);
    markButtons("#arcade-stage [data-monster-answer]", timedOut ? -1 : index, correctIndex);
    game.answeredCount += 1;
    game.round += 1;
    game.stageRound += 1;
    recordLearningResult(game.current, correct);
    const learningPulse = q("[data-monster-learning]");
    if (learningPulse) {
      learningPulse.hidden = false;
      learningPulse.dataset.learningState = correct ? "gain" : "review";
      learningPulse.textContent = correct ? copy().monsterLearningGain : copy().monsterLearningReview;
      schedule(() => { if (learningPulse.isConnected) learningPulse.hidden = true; }, 900);
    }
    const voiceDamageBonus = monsterVoiceDamageBonus(answerMeta);
    revealMonsterVoiceGrade(answerMeta, voiceDamageBonus);

    if (correct) {
      const comboMultiplier = monsterComboMultiplier(game.streak);
      const rhythmBonus = game.rhythmWindow ? Number(monster.rhythmBonus) || 0 : 0;
      const resonanceBonus = game.resonanceWindow ? Number(monster.resonanceBonus) || 0 : 0;
      const burstBonus = monsterBurstBonus();
      const voiceChargeGain = answerMeta.voice && Number(answerMeta.score || 0) >= 94 ? 2 : 1;
      game.burstCharge = burstBonus ? 0 : Math.min(MONSTER_BURST_EVERY, (Number(game.burstCharge) || 0) + voiceChargeGain);
      game.burstArmed = false;
      const damageParts = monsterDamageParts(game.remainingMs, game.streak, game.turnMs, game.combatLevel, game.rewardRanks?.power);
      const baseDamage = damageParts.baseDamage;
      const preSkillDamage = monsterStyleDamage(baseDamage, game.monsterStyle) + rhythmBonus + resonanceBonus + burstBonus + voiceDamageBonus;
      const skillAdjustedDamage = Math.max(1, Math.round(preSkillDamage * (skillState?.damageMultiplier || 1)));
      const rawDamage = monsterHeroDamage(skillAdjustedDamage);
      const heroPowerBonus = Math.max(0, rawDamage - skillAdjustedDamage);
      const shieldHit = window.HUILAISHI_CAMPUS_ADVENTURE?.shieldHit(rawDamage, game.monsterShield, campusEffects().shieldMultiplier);
      const shieldAbsorbed = shieldHit?.absorbed ?? Math.min(Math.max(0, game.monsterShield || 0), rawDamage);
      game.monsterShield = Math.max(0, (game.monsterShield || 0) - shieldAbsorbed);
      const damage = shieldHit?.damage ?? Math.max(0, rawDamage - shieldAbsorbed);
      const seconds = ((game.turnMs - game.remainingMs) / 1000).toFixed(1);
      const critical = game.remainingMs >= game.turnMs * .72 || (answerMeta.voice && Number(answerMeta.score || 0) >= 94);
      game.correct += 1;
      game.streak += 1;
      game.bestStreak = Math.max(game.bestStreak, game.streak);
      game.monsterHp = Math.max(0, game.monsterHp - damage);
      game.score += rawDamage * 10;
      const defeated = game.monsterHp <= 0;
      let message = `${answerMeta.voice ? `${copy().monsterVoicePass(answerMeta.score || 0)} · ` : ""}${copy().monsterHit(damage, seconds, critical, comboMultiplier)}`;
      if (shieldAbsorbed > 0) message = `${message} · ${copy().monsterShieldBreak(shieldAbsorbed)}`;
      if (rhythmBonus > 0) message = `${message} · ${copy().monsterRhythm(rhythmBonus)}`;
      if (resonanceBonus > 0) message = `${message} · ${copy().monsterResonance(resonanceBonus)}`;
      if (burstBonus > 0) message = `${message} · ${copy().monsterBurst(burstBonus)}`;
      if (voiceDamageBonus > 0) message = `${message} · ${copy().monsterVoiceGradeBonus(voiceDamageBonus)}`;
      if (heroPowerBonus > 0) message = `${message} · ${copy().monsterHeroPower(heroPowerBonus)}`;
      if (skillState?.active) message = `${message} · ${skillState.countered ? copy().monsterSkillCountered(monsterSkillName(monster), copy().monsterStyles?.[skillState.recommendedStyle]?.[0] || skillState.recommendedStyle) : copy().monsterSkillResisted(monsterSkillName(monster))}`;
      if (defeated) {
        const bonus = 200 + game.monsterIndex * 100;
        game.score += bonus;
        game.monstersDefeated += 1;
        game.defeatedIds?.add?.(monster.id);
        recordMonsterDefeat(monster);
        syncMonsterCombatGrowth(monster);
        message = `${message} · ${copy().monsterDown(monsterName(), bonus)}`;
      }
      const impactKind = defeated ? "down" : burstBonus > 0 ? "burst" : shieldAbsorbed > 0 ? "shield" : critical ? "critical" : "hit";
      if (world) {
        world.dataset.monsterState = defeated ? "down" : (shieldAbsorbed > 0 ? "shield" : "hit");
        world.dataset.impactKind = impactKind;
        world.dataset.skillOutcome = skillState?.active ? (skillState.countered ? "countered" : "resisted") : "none";
        world.classList.toggle("is-burst", burstBonus > 0);
        world.classList.toggle("is-skill-countered", Boolean(skillState?.active && skillState.countered));
      }
      if (impact) {
        impact.hidden = false;
        impact.dataset.impactKind = impactKind;
        impact.dataset.impactLabel = copy().monsterImpactLabels?.[impactKind] || "";
        impact.textContent = shieldAbsorbed > 0 && damage === 0 ? `-${shieldAbsorbed} SHIELD` : `-${damage}${burstBonus ? " ✦" : ""}`;
      }
      if (status) status.textContent = message;
      showMonsterRoundResult(monsterRoundResultModel({
        correct: true,
        impactKind,
        rawDamage,
        damage,
        shieldAbsorbed,
        seconds,
        speedDamage: damageParts.speedDamage,
        levelDamage: damageParts.levelDamage,
        comboMultiplier: damageParts.comboMultiplier,
        powerMultiplier: damageParts.powerMultiplier,
        styleId: game.monsterStyle,
        styleMultiplier: monsterStyleConfig(game.monsterStyle).damageMultiplier,
        skillMultiplier: skillState?.damageMultiplier || 1,
        heroMultiplier: currentMonsterHero().damageMultiplier || 1,
        bonuses: [
          rhythmBonus > 0 ? copy().monsterRhythm(rhythmBonus) : "",
          resonanceBonus > 0 ? copy().monsterResonance(resonanceBonus) : "",
          burstBonus > 0 ? copy().monsterBurst(burstBonus) : "",
          voiceDamageBonus > 0 ? copy().monsterVoiceGradeBonus(voiceDamageBonus) : ""
        ],
        voiceScore: answerMeta.voice ? answerMeta.score || 0 : 0
      }));
      scheduleMonsterImpactFeedback(world, impactKind, impactKind === "down" ? [24, 12, 46, 18, 62] : impactKind === "burst" ? [20, 14, 40, 16, 52] : critical ? [16, 16, 34, 18, 42] : [12, 18, 26]);
    } else {
      const { baseCounterDamage, resonanceDamage, mechanicCounterDamage, styledCounterDamage, skillCounterDamage, counterDamage } = monsterCounterDamageParts(timedOut, monster, turnRound, game.monsterStyle);
      const styleEffect = styledCounterDamage < mechanicCounterDamage
        ? ` · ${copy().monsterGuarded(mechanicCounterDamage - styledCounterDamage)}`
        : styledCounterDamage > mechanicCounterDamage ? ` · ${copy().monsterRushPenalty(styledCounterDamage - mechanicCounterDamage)}` : "";
      const heroEffect = counterDamage < skillCounterDamage
        ? ` · ${copy().monsterHeroGuarded(skillCounterDamage - counterDamage)}`
        : counterDamage > skillCounterDamage ? ` · ${copy().monsterHeroRisk(counterDamage - skillCounterDamage)}` : "";
      const skillEffect = skillState?.active ? ` · ${copy().monsterSkillPunished(monsterSkillName(monster))}` : "";
      const burstLost = Boolean(game.burstArmed);
      game.playerHp = Math.max(0, game.playerHp - counterDamage);
      const beforeRegen = game.monsterHp;
      const regenAmount = Math.max(0, Number(monster.regen) || 0) + (skillState?.active ? skillState.heal : 0);
      if (regenAmount) game.monsterHp = Math.min(game.monsterMaxHp, game.monsterHp + regenAmount);
      const regenerated = game.monsterHp - beforeRegen;
      game.streak = 0;
      game.burstCharge = 0;
      game.burstArmed = false;
      if (world) {
        world.dataset.monsterState = "counter";
        world.dataset.impactKind = "counter";
        world.dataset.skillOutcome = skillState?.active ? "punished" : "none";
        world.classList.toggle("is-skill-countered", false);
      }
      if (impact) {
        impact.hidden = false;
        impact.dataset.impactKind = "counter";
        impact.dataset.impactLabel = copy().monsterImpactLabels?.counter || "";
        impact.textContent = `-${counterDamage} HP`;
      }
      if (status) status.textContent = `${timedOut ? copy().monsterTimeout(counterDamage) : answerMeta.voice ? copy().monsterVoiceFail(answerMeta.score || 0) : copy().monsterCounter(counterDamage)}${resonanceDamage > 0 ? ` · ${copy().monsterResonanceCounter(resonanceDamage)}` : ""}${skillEffect}${styleEffect}${heroEffect}${burstLost ? ` · ${copy().monsterBurstLost}` : ""}${regenerated > 0 ? ` · ${copy().monsterRegen(regenerated)}` : ""} · ${copy().monsterReveal(view.target, view.meaning)}`;
      showMonsterRoundResult(monsterRoundResultModel({
        correct: false,
        timedOut,
        voice: Boolean(answerMeta.voice),
        counterDamage,
        baseCounterDamage,
        styleId: game.monsterStyle,
        styleMultiplier: monsterStyleConfig(game.monsterStyle).incomingMultiplier,
        skillMultiplier: skillState?.counterMultiplier || 1,
        heroMultiplier: currentMonsterHero().incomingMultiplier || 1,
        target: view.target,
        meaning: view.meaning,
        effects: [
          resonanceDamage > 0 ? copy().monsterResonanceCounter(resonanceDamage) : "",
          burstLost ? copy().monsterBurstLost : "",
          regenerated > 0 ? copy().monsterRegen(regenerated) : ""
        ]
      }));
      scheduleMonsterImpactFeedback(world, "counter", skillState?.active ? [36, 26, 48, 22, 30] : [30, 32, 20]);
    }

    setScore(game.score);
    game.runPhase = game.playerHp <= 0 ? "defeat" : game.monsterHp <= 0
      ? (game.monsterIndex + 1 >= activeMonsterRoster().length ? "victory" : "reward") : "battle";
    saveMonsterExpedition();
    updateMonsterHud();
    const monsterWasDefeated = correct && game.monsterHp <= 0;
    const continueAfterImpact = () => {
      if (game !== active || game.type !== "monster") return;
      if (game.playerHp <= 0) return finishMonsterBattle(false);
      if (monsterWasDefeated) {
        if (game.monsterIndex + 1 >= activeMonsterRoster().length) return finishMonsterBattle(true);
        return renderMonsterReward();
      }
      renderMonsterQuestion();
    };
    const impactKind = world?.dataset?.impactKind || (correct ? "hit" : "counter");
    const impactDelay = !correct ? 2800 : monsterWasDefeated ? 2200 : ["critical", "burst"].includes(impactKind) ? 1700 : 1400;
    // Reduced motion removes movement, not the information that explains a score.
    beginSkippableTransition(continueAfterImpact, impactDelay, correct ? 700 : 2800);
    mountTransitionSkip();
  }

  function renderMonsterReward() {
    if (!game || game.type !== "monster") return;
    clearInterval(timerId); timerId = 0;
    hideFeedback();
    const c = copy();
    const defeated = currentMonster();
    const next = activeMonsterRoster()[game.monsterIndex + 1];
    const rewards = ["power", "guard", "tempo"];
    const sheet = q("#arcade-sheet");
    if (sheet) sheet.dataset.arcadePhase = "monster-reward";
    q("#arcade-round").textContent = c.monsterRewardPick;
    q("#arcade-timer").textContent = "★";
    setProgress(monsterProgress());
    const nextLevel = game.combatLevel;
    const rewardProgress = game.monsterMode === "rally" ? c.monsterRallyRewardStreak(game.monsterIndex + 1) : c.monsterRewardStreak(game.monsterIndex + 1);
    q("#arcade-stage").innerHTML = `<section class="arcade-monster-reward${defeated.rally ? " is-rally" : ""}" style="--monster:${defeated.color};--monster-accent:${defeated.accent}"><div class="arcade-monster-reward-mark"><img src="${esc(defeated.art)}" alt="" draggable="false" decoding="async">${monsterRelicMarkup(defeated)}<span>✓</span></div><p>${esc(monsterName(defeated))}</p><h3>${esc(c.monsterRewardTitle)}</h3><div class="arcade-monster-level-up"><i aria-hidden="true">↑</i><b>${esc(c.monsterLevelUp(nextLevel))}</b></div><small>${esc(c.monsterRewardCopy)}</small><div class="arcade-monster-reward-run"><span>${esc(c.monsterRewardHp(game.playerHp, game.playerMaxHp))}</span><span>${esc(rewardProgress)}</span></div>${next ? `<div class="arcade-monster-reward-next"><img src="${esc(next.art)}" alt="" draggable="false" decoding="async">${monsterRelicMarkup(next)}<span><small>${esc(`${c.monsterRewardNext} · ${monsterStageLabel(next)}`)}</small><b>${esc(monsterName(next))}</b><em>${esc(locale() === "zh" ? next.traitZh : next.traitTh)}</em></span></div>` : ""}<div class="arcade-monster-reward-grid">${rewards.map((reward, index) => { const item = c.monsterRewards[reward]; const rank = Number(game.rewardRanks?.[reward]) || 0; return `<button type="button" data-monster-reward="${reward}" style="--reward-index:${index}"><i aria-hidden="true">${["✦", "♥", "⌛"][index]}</i><b>${esc(item[0])}</b><span>${esc(item[1])}</span><em>${esc(c.monsterUpgradeRank(rank + 1))}</em></button>`; }).join("")}</div></section>`;
    q(".arcade-monster-reward-grid")?.insertAdjacentHTML?.("beforebegin", campusAftermathMarkup());
    globalThis.requestAnimationFrame?.(() => q("[data-monster-reward]")?.focus?.({ preventScroll: true }));
  }

  function chooseMonsterReward(reward) {
    if (q("#arcade-sheet")?.dataset.arcadePhase !== "monster-reward" || !claimMonsterReward(reward)) return;
    setScore(game.score);
    vibrate([10, 26, 14]);
    renderMonsterQuestion();
  }

  function claimMonsterReward(reward) {
    if (!game || game.type !== "monster" || game.runPhase !== "reward" || !["power", "guard", "tempo"].includes(reward)) return false;
    if (game.playerHp <= 0 || game.monsterHp > 0 || game.monsterIndex + 1 >= activeMonsterRoster().length) return false;
    // Consume before changing ranks or rendering, so double-taps cannot grant two rewards.
    game.runPhase = "battle";
    const previousMaxHp = Math.max(1, Number(game.playerMaxHp) || monsterPlayerMaxHp());
    game.rewardRanks ||= { power: 0, guard: 0, tempo: 0 };
    game.rewardRanks[reward] = Math.max(0, Number(game.rewardRanks[reward]) || 0) + 1;
    game.rewards.push(reward);
    game.monsterIndex += 1;
    const next = currentMonster();
    game.combatLevel = monsterStartingCombatLevel(next, game.campaignLevel);
    game.playerMaxHp = monsterPlayerMaxHp(game.combatLevel, game.rewardRanks.guard);
    const maxHpGain = Math.max(0, game.playerMaxHp - previousMaxHp);
    const recovery = reward === "guard" ? 18 : 6;
    game.playerHp = Math.min(game.playerMaxHp, game.playerHp + maxHpGain + recovery);
    game.turnBonusMs = game.rewardRanks.tempo * MONSTER_TEMPO_STEP_MS;
    game.monsterHp = monsterScaledHp(next);
    game.monsterMaxHp = game.monsterHp;
    game.monsterShield = monsterScaledShield(next);
    game.monsterMaxShield = game.monsterShield;
    game.stageRound = 0;
    game.monsterEntering = true;
    game.rhythmWindow = false;
    game.resonanceWindow = false;
    saveMonsterExpedition();
    return true;
  }

  function buildToneGradePlan(count, focusGrade) {
    const total = Math.max(0, Number(count) || 0);
    if (!total) return [];
    const normalizedFocus = GRADES.includes(focusGrade) ? focusGrade : "S4";
    const focusCount = Math.max(1, Math.ceil(total * .6));
    const comparisons = GRADES.filter(grade => grade !== normalizedFocus);
    const plan = Array.from({ length: focusCount }, () => normalizedFocus);
    for (let index = plan.length; index < total; index += 1) plan.push(comparisons[(index - focusCount) % comparisons.length]);
    return shuffle(plan);
  }

  function buildToneItems(count, focusGrade = activeRegisterGrade(), sourcePacks = gradePracticePacks(focusGrade)) {
    const packs = shuffle(sourcePacks);
    if (!packs.length) return [];
    return buildToneGradePlan(count, focusGrade).map((grade, index) => {
      const pack = packs[index % packs.length];
      return { pack, variant: pack.variants.find(item => item.grade === grade) };
    });
  }

  function startTone(base) { if (!base.items.length) return showEmpty("register"); game = base; renderToneQuestion(); }
  function renderToneQuestion() {
    hideFeedback(); game.answered = false;
    const c = copy(); const item = game.items[game.round]; const view = packView(item.variant); game.current = item;
    q("#arcade-round").textContent = c.round(game.round + 1, game.total); q("#arcade-timer").textContent = `${game.streak}×`; setProgress(game.round / game.total * 100);
    q("#arcade-stage").innerHTML = `<div class="arcade-prompt"><span class="game-chip">TONE RADAR · ${esc(c.gradeFocus(game.grade))} · ${esc(item.pack.cat || "SOCIAL")}</span>${contextMarkup(item.pack)}<button class="arcade-register-audio" data-register-audio aria-label="${esc(c.playSentence)}"><svg><use href="#i-volume"></use></svg></button><small id="arcade-audio-status" role="status" aria-live="polite"></small><h3 lang="${view.lang}">${esc(view.target)}</h3><p>${esc(view.reading)}</p>${phoneticHintMarkup(view.phoneticHint)}<span class="meaning-hint">${esc(view.meaning)}<br>${esc(c.tonePrompt)}</span><div class="tone-scale">${GRADES.map((grade, i) => `<i style="--tone:${["#37a66f","#26c7b8","#ffb62f","#ff7a59","#ff5967"][i]}"></i>`).join("")}</div></div><div class="arcade-options tone-grade-options">${GRADES.map((grade, index) => `<button class="arcade-option" data-grade="${grade}"><span>${grade}</span><small>${esc(c.grades[grade][1])}</small></button>`).join("")}</div>`;
  }

  function startPolish(base) { if (!base.items.length) return showEmpty("register"); game = base; renderPolishQuestion(); }
  function renderPolishQuestion() {
    hideFeedback(); game.answered = false;
    const c = copy(); const pack = game.items[game.round]; const sourceGrade = ["S2", "S1"].includes(game.grade) ? game.grade : (game.round % 2 ? "S2" : "S1"); const source = pack.variants.find(item => item.grade === sourceGrade); const sourceView = packView(source);
    const candidates = shuffle(["S5", "S4", "S3"].map(grade => ({ grade, variant: pack.variants.find(item => item.grade === grade) })));
    game.current = { pack, source, sourceGrade }; game.options = candidates;
    q("#arcade-round").textContent = c.round(game.round + 1, game.total); q("#arcade-timer").textContent = `${game.streak}×`; setProgress(game.round / game.total * 100);
    q("#arcade-stage").innerHTML = `<div class="arcade-prompt"><span class="game-chip">${esc(c.sourceRisk)}</span>${contextMarkup(pack)}<button class="arcade-register-audio" data-register-audio aria-label="${esc(c.playSentence)}"><svg><use href="#i-volume"></use></svg></button><small id="arcade-audio-status" role="status" aria-live="polite"></small><h3 lang="${sourceView.lang}">${esc(sourceView.target)}</h3><p>${esc(sourceView.reading)}</p>${phoneticHintMarkup(sourceView.phoneticHint)}<span class="meaning-hint">${esc(sourceView.meaning)}<br>${esc(c.polishPrompt)}</span></div><div class="arcade-options">${candidates.map((option, index) => { const view = packView(option.variant); return `<button class="arcade-option" data-polish="${index}"><span>${c.answerLetters[index]}</span><span class="arcade-option-copy"><b lang="${view.lang}">${esc(view.target)}</b><small>${esc(view.reading)}</small>${phoneticHintMarkup(view.phoneticHint)}</span></button>`; }).join("")}</div>`;
  }

  function buildGradeLockItems(count, focusGrade = activeRegisterGrade(), sourcePacks = gradePracticePacks(focusGrade)) {
    const packs = shuffle(sourcePacks).filter(pack => pack.variants.some(variant => variant.grade === focusGrade));
    return packs.slice(0, Math.max(0, Number(count) || 0)).map(pack => {
      const distractors = shuffle(packs.filter(candidate => candidate.id !== pack.id)).slice(0, 3);
      const optionPacks = [pack, ...distractors];
      return {
        pack,
        variant: pack.variants.find(candidate => candidate.grade === focusGrade),
        options: shuffle(optionPacks.map(candidate => ({
          pack: candidate,
          variant: candidate.variants.find(variant => variant.grade === focusGrade),
          correct: candidate.id === pack.id
        })))
      };
    }).filter(item => item.options.length >= 4 && item.options.every(option => option.variant));
  }

  function buildSceneListenItems(count, focusGrade = activeRegisterGrade(), sourcePacks = gradePracticePacks(focusGrade)) {
    const packs = shuffle(sourcePacks).filter(pack => pack.variants.some(variant => variant.grade === focusGrade));
    return packs.slice(0, Math.max(0, Number(count) || 0)).map(pack => {
      const distractors = shuffle(packs.filter(candidate => candidate.id !== pack.id)).slice(0, 3);
      return {
        pack,
        variant: pack.variants.find(candidate => candidate.grade === focusGrade),
        options: shuffle([{ pack, correct: true }, ...distractors.map(candidate => ({ pack: candidate, correct: false }))])
      };
    }).filter(item => item.options.length >= 4);
  }

  function buildRegisterShiftOptions(pack, focusGrade) {
    const target = pack.variants.find(variant => variant.id === pack.recommendedVariantId);
    const source = pack.variants.find(variant => variant.grade === focusGrade);
    if (!target || !source) return [];
    const safeGrades = ["S5", "S4", "S3"];
    const comparisonGrades = [focusGrade, ...safeGrades].filter((grade, index, rows) => rows.indexOf(grade) === index);
    const comparisons = comparisonGrades
      .map(grade => pack.variants.find(variant => variant.grade === grade))
      .filter(variant => variant && variant.id !== target.id && variant.id !== source.id);
    const variants = [target];
    if (source.id !== target.id) variants.push(source);
    variants.push(...shuffle(comparisons));
    return shuffle(variants.slice(0, 3).map(variant => ({ variant, correct: variant.id === target.id })));
  }

  function buildRegisterShiftItems(count, focusGrade = activeRegisterGrade(), sourcePacks = gradePracticePacks(focusGrade)) {
    const preferred = shuffle(sourcePacks).filter(pack => pack.recommendedGrade !== focusGrade);
    const fallback = shuffle(sourcePacks).filter(pack => pack.recommendedGrade === focusGrade);
    return [...preferred, ...fallback].map(pack => ({
      pack,
      source: pack.variants.find(variant => variant.grade === focusGrade),
      target: pack.variants.find(variant => variant.id === pack.recommendedVariantId),
      options: buildRegisterShiftOptions(pack, focusGrade)
    })).filter(item => item.source && item.target && item.options.length >= 3).slice(0, Math.max(0, Number(count) || 0));
  }

  function registerOptionMarkup(pack, option, index, dataName) {
    const c = copy();
    const view = packView(option.variant);
    const letter = c.answerLetters[index];
    const risk = ["S1", "S2"].includes(option.variant.grade) ? " risk-choice" : "";
    return `<div class="register-choice-row${risk}"><button type="button" class="arcade-option register-choice${risk}" data-${dataName}="${index}" ${choiceShortcutAttrs(index)}><span>${letter}</span><span class="arcade-option-copy"><b lang="${view.lang}">${esc(view.target)}</b><small>${esc(view.reading)}</small>${phoneticHintMarkup(view.phoneticHint)}</span></button><button type="button" class="register-option-audio${risk}" data-register-option-audio="${index}" data-speech-policy="native" aria-label="${esc(c.previewOption(letter))}" aria-keyshortcuts="Shift+${letter}"><svg aria-hidden="true"><use href="#i-volume"></use></svg></button></div>`;
  }

  function startGradeLock(base) {
    if (!base.items.length) return showEmpty("register");
    game = base;
    renderGradeLockQuestion();
  }

  function renderGradeLockQuestion() {
    hideFeedback(); game.answered = false;
    const c = copy(); const item = game.items[game.round]; const pack = item.pack; const variant = item.variant;
    if (!variant) return showEmpty("register");
    game.current = item; game.options = item.options;
    q("#arcade-round").textContent = c.round(game.round + 1, game.total); q("#arcade-timer").textContent = `${game.streak}×`; setProgress(game.round / game.total * 100);
    const scene = sceneView(pack);
    q("#arcade-stage").innerHTML = `<div class="arcade-prompt compact-register-prompt"><span class="game-chip">${esc(c.currentRegister(game.grade))}</span>${contextMarkup(pack)}<h3>${esc(c.gradeLockPrompt(game.grade))}</h3><p lang="${scene.lang}">${esc(scene.intent)}</p><span class="meaning-hint">${esc(scene.context)} · ${esc(c.tapToHear)}</span><small id="arcade-audio-status" role="status" aria-live="polite"></small></div><div class="arcade-options register-choice-options">${game.options.map((option, index) => registerOptionMarkup(option.pack, option, index, "grade-lock")).join("")}</div>`;
  }

  function startSceneListen(base) {
    if (!base.items.length) return showEmpty("register");
    game = base;
    renderSceneListenQuestion();
  }

  function renderSceneListenQuestion() {
    hideFeedback(); game.answered = false;
    const c = copy(); const item = game.items[game.round]; game.current = item; game.options = item.options;
    q("#arcade-round").textContent = c.round(game.round + 1, game.total); q("#arcade-timer").textContent = `${game.streak}×`; setProgress(game.round / game.total * 100);
    q("#arcade-stage").innerHTML = `<div class="arcade-prompt compact-register-prompt"><span class="game-chip">${esc(c.currentRegister(game.grade))} · LISTEN</span><h3>${esc(c.sceneListenPrompt(game.grade))}</h3><button class="arcade-audio-orb" data-register-audio aria-label="${esc(c.playSentence)}"><svg><use href="#i-volume"></use></svg></button><span class="meaning-hint">${esc(c.sceneListenHint)}</span><small id="arcade-audio-status" role="status" aria-live="polite"></small></div><div class="arcade-options scene-choice-options">${game.options.map((option, index) => { const scene = sceneView(option.pack); return `<button type="button" class="arcade-option scene-choice" data-scene-listen="${index}" ${choiceShortcutAttrs(index)}><span>${c.answerLetters[index]}</span><span class="arcade-option-copy"><b lang="${scene.lang}">${esc(scene.intent)}</b><small>${esc(scene.context)}</small></span></button>`; }).join("")}</div>`;
  }

  function startRegisterShift(base) {
    if (!base.items.length) return showEmpty("register");
    game = base;
    renderRegisterShiftQuestion();
  }

  function renderRegisterShiftQuestion() {
    hideFeedback(); game.answered = false;
    const c = copy(); const item = game.items[game.round]; const sourceView = packView(item.source); game.current = item; game.options = item.options;
    q("#arcade-round").textContent = c.round(game.round + 1, game.total); q("#arcade-timer").textContent = `${game.streak}×`; setProgress(game.round / game.total * 100);
    q("#arcade-stage").innerHTML = `<div class="arcade-prompt compact-register-prompt"><span class="game-chip">${esc(c.currentRegister(game.grade))} → ${esc(c.targetRegister(item.target.grade))}</span>${contextMarkup(item.pack)}<button class="arcade-register-audio" data-register-audio aria-label="${esc(c.playSentence)}"><svg><use href="#i-volume"></use></svg></button><small id="arcade-audio-status" role="status" aria-live="polite"></small><h3 lang="${sourceView.lang}">${esc(sourceView.target)}</h3><p>${esc(sourceView.reading)}</p>${phoneticHintMarkup(sourceView.phoneticHint)}<span class="meaning-hint">${esc(c.shiftPrompt(game.grade, item.target.grade))}<br>${esc(c.tapToHear)}</span></div><div class="arcade-options register-choice-options">${game.options.map((option, index) => registerOptionMarkup(item.pack, option, index, "register-shift")).join("")}</div>`;
  }

  function markButtons(selector, selected, correctIndex) {
    [...document.querySelectorAll(selector)].forEach((button, index) => {
      button.disabled = true;
      if (index === correctIndex) button.classList.add("correct");
      if (index === selected && selected !== correctIndex) button.classList.add("wrong");
    });
  }

  function chooseWordAnswer(index) {
    if (!game || game.answered || !["audio", "speed"].includes(game.type)) return;
    game.answered = true; const option = game.options[index]; const correctIndex = game.options.findIndex(item => item.correct); const correct = Boolean(option?.correct); const view = wordView(game.current);
    recordLearningResult(game.current, correct);
    markButtons("#arcade-stage [data-answer]", index, correctIndex);
    if (correct) { game.correct += 1; game.streak += 1; game.bestStreak = Math.max(game.bestStreak, game.streak); game.score += (game.type === "speed" ? 80 : 100) + game.streak * 12; vibrate(12); }
    else { game.streak = 0; vibrate([18,45,18]); }
    setScore(game.score);
    if (game.type === "speed") {
      game.round += 1; schedule(() => { if (game && game.type === "speed" && game.seconds > 0) renderSpeedQuestion(); }, 420); return;
    }
    showFeedback(correct ? copy().correct : copy().wrong, `${view.target} · ${view.reading}${view.phoneticHint ? ` · 中文近音·仅助记：${view.phoneticHint}` : ""} · ${view.meaning}`, false);
    q("#arcade-next").textContent = game.round + 1 >= game.total ? copy().finish : copy().next;
    q("#arcade-next").classList.remove("hidden");
  }

  function chooseTone(grade) {
    if (!game || game.type !== "tone" || game.answered) return;
    game.answered = true; const actual = game.current.variant.grade; const correct = grade === actual; const buttons = [...document.querySelectorAll("#arcade-stage [data-grade]")]; const selected = buttons.findIndex(button => button.dataset.grade === grade); const answer = buttons.findIndex(button => button.dataset.grade === actual);
    markButtons("#arcade-stage [data-grade]", selected, answer);
    if (correct) { game.correct += 1; game.streak += 1; game.bestStreak = Math.max(game.bestStreak, game.streak); game.score += 120 + game.streak * 14; vibrate(12); } else { game.streak = 0; vibrate([18,45,18]); }
    setScore(game.score); const variantView = packView(game.current.variant); const context = contextView(game.current.pack); const c = copy();
    const contextualRecommendation = context ? c.recommendation(context.recommendedGrade, context.why) : c.contextMissing;
    showFeedback(correct ? c.toneCorrect(actual) : c.toneWrong(actual), `${variantView.note || variantView.meaning}${["S1","S2"].includes(actual) ? ` · ${c.riskTag}` : ""} · ${contextualRecommendation}`, ["S1","S2"].includes(actual));
    q("#arcade-next").textContent = game.round + 1 >= game.total ? copy().finish : copy().next; q("#arcade-next").classList.remove("hidden");
  }

  function choosePolish(index) {
    if (!game || game.type !== "polish" || game.answered) return;
    game.answered = true; const option = game.options[index]; const recommendedId = game.current.pack.recommendedVariantId; const correctIndex = game.options.findIndex(item => item.variant?.id === recommendedId); const correct = option?.variant?.id === recommendedId; markButtons("#arcade-stage [data-polish]", index, correctIndex);
    if (correct) { game.correct += 1; game.streak += 1; game.bestStreak = Math.max(game.bestStreak, game.streak); game.score += 150 + game.streak * 15; vibrate(12); } else { game.streak = 0; vibrate([18,45,18]); }
    setScore(game.score); const best = packView(game.options[correctIndex].variant); const context = contextView(game.current.pack); const c = copy();
    showFeedback(correct ? c.polishCorrect : c.polishWrong, `${best.target} · ${best.reading} — ${context ? c.recommendation(context.recommendedGrade, context.why) : c.contextMissing}`, false);
    q("#arcade-next").textContent = game.round + 1 >= game.total ? copy().finish : copy().next; q("#arcade-next").classList.remove("hidden");
  }

  function chooseRegisterGameAnswer(type, index) {
    if (!game || game.type !== type || game.answered) return;
    const option = game.options[index];
    if (!option) return;
    game.answered = true;
    const selectors = {
      "grade-lock": "#arcade-stage [data-grade-lock]",
      "scene-listen": "#arcade-stage [data-scene-listen]",
      "register-shift": "#arcade-stage [data-register-shift]"
    };
    const correctIndex = game.options.findIndex(item => item.correct);
    const correct = Boolean(option.correct);
    markButtons(selectors[type], index, correctIndex);
    if (option.variant) playRegisterVariant(option.pack || game.current.pack, option.variant);
    if (correct) {
      game.correct += 1; game.streak += 1; game.bestStreak = Math.max(game.bestStreak, game.streak);
      game.score += (type === "register-shift" ? 160 : type === "scene-listen" ? 140 : 130) + game.streak * 14;
      vibrate(12);
    } else { game.streak = 0; vibrate([18,45,18]); }
    setScore(game.score);
    const c = copy();
    let title = correct ? c.correct : c.wrong;
    let body = "";
    let risk = false;
    if (type === "grade-lock") {
      const actual = game.current.variant; const view = packView(actual);
      title = correct ? c.gradeLockCorrect(actual.grade) : c.toneWrong(actual.grade);
      body = `${view.target} · ${view.reading} — ${view.note || view.meaning}${["S1", "S2"].includes(actual.grade) ? ` · ${c.riskTag}` : ""}`;
      risk = ["S1", "S2"].includes(actual.grade);
    }
    if (type === "scene-listen") {
      const item = game.current; const view = packView(item.variant); const context = contextView(item.pack);
      title = correct ? c.sceneCorrect : c.wrong;
      body = `${view.target} · ${view.reading} — ${view.meaning}${context ? ` · ${c.contextSetting}: ${context.setting} · ${c.contextRelationship}: ${context.relationship}` : ""}${["S1", "S2"].includes(item.variant.grade) ? ` · ${c.riskTag}` : ""}`;
      risk = ["S1", "S2"].includes(item.variant.grade);
    }
    if (type === "register-shift") {
      const item = game.current; const view = packView(item.target); const context = contextView(item.pack);
      title = correct ? c.shiftCorrect(item.target.grade) : c.polishWrong;
      body = `${view.target} · ${view.reading} — ${context ? c.recommendation(context.recommendedGrade, context.why) : c.contextMissing}`;
    }
    showFeedback(title, body, risk);
    q("#arcade-next").textContent = game.round + 1 >= game.total ? c.finish : c.next;
    q("#arcade-next").classList.remove("hidden");
  }

  function nextRound() {
    if (!game) return;
    game.round += 1;
    if (game.round >= game.total) return finishGame();
    if (game.type === "voice") renderVoiceGateQuestion();
    if (game.type === "audio") renderWordQuestion();
    if (game.type === "tone") renderToneQuestion();
    if (game.type === "polish") renderPolishQuestion();
    if (game.type === "grade-lock") renderGradeLockQuestion();
    if (game.type === "scene-listen") renderSceneListenQuestion();
    if (game.type === "register-shift") renderRegisterShiftQuestion();
  }

  function finishGame() {
    if (!game || game.completed) return; clearTimers();
    const c = copy(); const finished = game; const score = Math.max(0, Math.round(game.score)); const stats = readStats(); const previous = Number(stats[game.type]?.best || 0); const isBest = score > previous;
    finished.completed = true;
    if (finished.type === "monster") q("#arcade-sheet").dataset.arcadePhase = "monster-result";
    stats[game.type] = { best: Math.max(previous, score), plays: Number(stats[game.type]?.plays || 0) + 1, updatedAt: Date.now() }; writeStats(stats);
    const attempts = game.type === "match" ? 6
      : game.type === "memory" ? Math.max(1, game.pairs)
        : game.type === "bingo" ? Math.max(1, game.attempts)
          : game.type === "reflex" ? Math.max(0, game.attempts || 0)
            : ["speed", "survival"].includes(game.type) ? Math.max(1, game.attempts || 0, game.round, game.correct)
              : game.type === "monster" ? Math.max(1, game.answeredCount)
                : game.total;
    const monsterResult = game.type === "monster";
    const rallyResult = Boolean(monsterResult && finished.monsterMode === "rally");
    const resultTitle = monsterResult ? (finished.monsterVictory ? (rallyResult ? c.monsterRallyVictory : c.monsterVictory) : c.monsterDefeat) : c.done;
    const resultCopy = monsterResult ? (finished.monsterVictory ? (rallyResult ? c.monsterRallyVictoryCopy : c.monsterVictoryCopy) : c.monsterDefeatCopy) : (isBest ? c.newBest : c.keep);
    const resultMark = monsterResult ? (finished.monsterVictory ? "✓" : "↻") : (score >= 900 ? "S" : score >= 600 ? "A" : score >= 350 ? "B" : "C");
    const accuracy = Math.round(finished.correct / Math.max(1, attempts) * 100);
    const monsterCoach = monsterResult
      ? (locale() === "zh"
        ? `本局答对率 ${accuracy}% · ${accuracy >= 80 ? "词义与反应练得不错，再挑战更稳的连击。" : "先慢听易错词，再战时会更容易打出连击。"} 此结果不是发音标准度评分。`
        : `ตอบถูก ${accuracy}% · ${accuracy >= 80 ? "ฝึกความหมายและปฏิกิริยาได้ดี ลองรักษาคอมโบให้นิ่งขึ้น" : "ฟังคำที่พลาดแบบช้า ๆ แล้วกลับมาสร้างคอมโบอีกครั้ง"} ผลนี้ไม่ใช่คะแนนความถูกต้องของการออกเสียง`)
      : "";
    const resultLevel = Number(finished.campaignLevel || activeLevel());
    const resultLearning = learningSnapshot(resultLevel);
    const resultCollection = monsterCollectionSnapshot(resultLevel);
    const resultRallyCollection = monsterRallyCollectionSnapshot(finished.rallyZone || 1);
    const resultCampaign = monsterResult ? (rallyResult ? monsterRallyZone(finished.rallyZone || 1) : monsterCampaign(resultLevel)) : [];
    const defeatedChapter = new Set(rallyResult ? resultRallyCollection.zoneDefeatedIds : resultCollection.chapterDefeatedIds);
    const allCollection = allMonsterCollectionSnapshot(resultLevel);
    const monsterPath = monsterResult
      ? `<div class="arcade-monster-result-path${rallyResult ? " is-rally" : ""}" aria-label="${locale() === "zh" ? "怪物进度" : "ความคืบหน้ามอนสเตอร์"}">${resultCampaign.map((monster, index) => `<span class="${defeatedChapter.has(monster.id) ? "is-down" : ""}"><i>${defeatedChapter.has(monster.id) ? "✓" : index + 1}</i><b>${esc(monsterName(monster))}</b></span>`).join("")}</div><p class="arcade-result-coach">${esc(`${monsterCoach} · ${c.monsterTotalCollection(allCollection.story.defeated, allCollection.rally.defeated)}`)}</p>`
      : "";
    const learningPath = (finished.monsterVictory ? campusAftermathMarkup(true) : "") + campusLearningRecapMarkup() + (Number(finished.learningAttempts || 0) > 0
      ? `<div class="arcade-learning-result"><b>${esc(c.learningSaved(finished.learningAttempts))}</b><span>${esc(c.learningDue)} ${Number(resultLearning.due || 0)} · ${esc(c.learningWrong)} ${Number(resultLearning.wrong || 0)} · ${esc(c.learningMastered)} ${Number(resultLearning.mastered || 0)}</span></div>`
      : "");
    q("#arcade-round").textContent = resultTitle; q("#arcade-timer").textContent = "✓"; setProgress(100); setScore(score); hideFeedback();
    q("#arcade-stage").innerHTML = `<div class="arcade-result ${monsterResult ? "arcade-monster-result" : ""}"><div class="arcade-result-mark">${resultMark}</div><h3>${esc(resultTitle)}</h3><p>${esc(resultCopy)}</p>${monsterPath}${learningPath}<div class="arcade-result-stats"><span><b>${score.toLocaleString()}</b><small>${esc(c.statScore)}</small></span><span><b>${finished.correct}/${attempts}</b><small>${esc(c.statRight)}</small></span><span><b>${finished.bestStreak}×</b><small>${esc(c.statCombo)}</small></span></div><div class="arcade-result-actions"><button id="arcade-replay">${esc(c.replay)}</button>${Number(finished.learningAttempts || 0) > 0 ? `<button type="button" data-arcade-review>${esc(c.learningReview(Number(resultLearning.wrong || 0)))}</button>` : ""}${monsterResult ? `<button type="button" data-arcade-exit>${locale() === "zh" ? "回练习场" : "กลับสนามฝึก"}</button>` : ""}</div></div>`;
    celebrate({ isBest, score, streak: finished.bestStreak });
    renderHall(); vibrate([15,55,15]);
  }

  function showEmpty(kind = "words") {
    clearTimers(); game = null;
    const message = kind === "register" ? copy().noData : copy().wordFallback;
    q("#arcade-stage").innerHTML = `<div class="arcade-result"><div class="arcade-result-mark">…</div><h3>${esc(message)}</h3></div>`;
  }

  function closeGame() {
    clearTimers();
    document.body?.classList?.remove?.("arcade-monster-active");
    setGameOrientation(false);
    game = null;
    const sheet = q("#arcade-sheet");
    if (sheet) {
      delete sheet.dataset.arcadePhase;
      delete sheet.dataset.arcadeGame;
      delete sheet.dataset.campusChapter;
    }
    renderHall();
  }

  function pauseMonsterExpedition() {
    if (!game || game.type !== "monster" || !game.expeditionStarted || game.completed) return;
    clearTimers();
    // Replace the object to invalidate any recognition promise already in flight.
    const mode = game.monsterMode;
    const route = mode === "rally" ? game.rallyZone : game.campaignLevel;
    game = { ...game, timerActive: false, busy: false, answered: false };
    if (mode === "rally") resetMonsterRunForRallyZone(route); else resetMonsterRunForChapter(route);
    const sheet = q("#arcade-sheet");
    if (sheet) sheet.dataset.arcadePhase = "monster-ready";
    renderMonsterReady("[data-monster-resume]");
  }

  function requestClose() {
    const monsterRunInProgress = game?.type === "monster"
      && !game.completed
      && game.expeditionStarted;
    if (!monsterRunInProgress || typeof globalThis.confirm !== "function") return true;
    return globalThis.confirm(game.saveDurable ? copy().monsterExitConfirm : copy().monsterStorageWarning);
  }

  function handleCloseRequest(event) {
    if (!requestClose()) {
      event?.preventDefault?.();
      event?.stopImmediatePropagation?.();
      return false;
    }
    closeGame();
    return true;
  }

  function handleGameKeydown(event) {
    if (!game || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target?.closest?.("input, textarea, select, [contenteditable='true']")) return;
    const sheet = q("#arcade-sheet");
    if (!sheet || sheet.classList.contains("hidden")) return;
    if (sheet.dataset.arcadePhase === "campus-explore") return;
    if (sheet.dataset.arcadePhase === "world-atlas") return;
    const key = String(event.key || "").toUpperCase();
    const byLetter = copy().answerLetters.indexOf(key);
    const byNumber = /^[1-9]$/.test(key) ? Number(key) - 1 : -1;
    const index = byLetter >= 0 ? byLetter : byNumber;
    if (index >= 0) {
      if (event.shiftKey) {
        const previews = [...document.querySelectorAll("#arcade-stage [data-register-option-audio]")].filter(button => !button.disabled);
        if (previews[index]) { event.preventDefault(); previews[index].click(); }
        return;
      }
      const options = [...document.querySelectorAll("#arcade-stage [data-monster-answer], #arcade-stage [data-survival-answer], #arcade-stage [data-memory-index], #arcade-stage [data-bingo-index], #arcade-stage [data-reflex-value], #arcade-stage [data-answer], #arcade-stage [data-grade], #arcade-stage [data-polish], #arcade-stage [data-grade-lock], #arcade-stage [data-scene-listen], #arcade-stage [data-register-shift]")].filter(button => !button.disabled);
      if (options[index]) { event.preventDefault(); options[index].click(); }
      return;
    }
    if (key === "R") {
      const replay = q("#arcade-stage [data-register-audio], #arcade-stage #arcade-play-audio");
      if (replay) { event.preventDefault(); replay.click(); }
      return;
    }
    if (key === "N" && !q("#arcade-next")?.classList.contains("hidden")) {
      event.preventDefault(); q("#arcade-next").click();
    }
  }

  function bindEvents() {
    q("#arcade-grid").addEventListener("click", event => { const button = event.target.closest("[data-game]"); if (button && !button.disabled) openGame(button.dataset.game); });
    q("#battle-vision-cta")?.addEventListener("click", event => { if (!event.currentTarget.disabled) openGame("monster"); });
    q("#arcade-review-learning")?.addEventListener("click", openLearningReview);
    q("#arcade-expand")?.addEventListener("click", () => { hallExpanded = !hallExpanded; syncHallExpansion(); });
    q("#arcade-stage").addEventListener("click", event => {
      if (event.target.closest("[data-world-atlas]")) return openWorldAtlas();
      if (event.target.closest("[data-campus-explore]")) return renderCampusExplore();
      if (event.target.closest("[data-campus-explore-back]")) return returnFromCampusExplore();
      if (event.target.closest("[data-campus-observe]")) return observeCampusMonster();
      const clueOpen = event.target.closest("[data-campus-clue-open]");
      if (clueOpen && q("#arcade-sheet")?.dataset.arcadePhase === "campus-explore") {
        q("#campus-clue-panel").hidden = false; clueOpen.setAttribute("aria-expanded", "true");
        q("[data-campus-clue-answer]")?.focus?.({ preventScroll: false }); return;
      }
      const clueAnswer = event.target.closest("[data-campus-clue-answer]");
      if (clueAnswer) return chooseCampusClue(clueAnswer.dataset.campusClueAnswer);
      const clueListen = event.target.closest("[data-campus-clue-listen]");
      if (clueListen && q("#arcade-sheet")?.dataset.arcadePhase === "campus-explore") {
        const id = clueListen.dataset.campusClueListen;
        if (campusStoryEntry()?.choices.includes(id)) { const word = corpus().find(item => item.id === id); if (word) void playWordVoice(word); } return;
      }
      const transition = event.target.closest("[data-arcade-transition]");
      if (transition && completeSkippableTransition()) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      const monsterMode = event.target.closest("button[data-monster-mode]"); if (monsterMode) return chooseMonsterMode(monsterMode.dataset.monsterMode);
      const monsterChapter = event.target.closest("button[data-monster-chapter]"); if (monsterChapter) return chooseMonsterChapter(monsterChapter.dataset.monsterChapter);
      const monsterRallyZoneButton = event.target.closest("button[data-monster-rally-zone]"); if (monsterRallyZoneButton) return chooseMonsterRallyZone(monsterRallyZoneButton.dataset.monsterRallyZone);
      const monsterHero = event.target.closest("button[data-monster-hero]"); if (monsterHero) return chooseMonsterHero(monsterHero.dataset.monsterHero);
      const monsterResume = event.target.closest("[data-monster-resume]"); if (monsterResume) return resumeMonsterExpedition();
      const monsterStart = event.target.closest("[data-monster-start]"); if (monsterStart) return beginMonsterExpedition();
      const campusStudy = event.target.closest("[data-campus-study]"); if (campusStudy) return beginMonsterExpedition(true);
      const campusListen = event.target.closest("[data-campus-listen]"); if (campusListen) return playCampusWord(campusListen.dataset.campusListen);
      const campusCheck = event.target.closest("[data-campus-check]"); if (campusCheck) return advanceCampusCheck();
      const campusAnswer = event.target.closest("[data-campus-answer]"); if (campusAnswer) return answerCampusCheck(campusAnswer.dataset.campusAnswer);
      const campusSkip = event.target.closest("[data-campus-skip]"); if (campusSkip) return completeCampusPreparation();
      const campusRoute = event.target.closest("[data-campus-route]"); if (campusRoute) return chooseCampusRoute(campusRoute.dataset.campusRoute);
      const monsterFx = event.target.closest("[data-monster-fx-toggle]"); if (monsterFx) return toggleMonsterFx();
      const monsterBurst = event.target.closest("[data-monster-burst]"); if (monsterBurst) return toggleMonsterBurst();
      const monsterArm = event.target.closest("[data-monster-arm]"); if (monsterArm) return selectMonsterStyle(monsterArm.dataset.monsterArm);
      const matchStart = event.target.closest("[data-match-start]"); if (matchStart) return beginMatchCountdown();
      const match = event.target.closest("[data-match-index]"); if (match) return chooseMatch(match);
      const audio = event.target.closest("#arcade-play-audio"); if (audio && game?.current) { playWordVoice(game.current); return; }
      const voiceDemo = event.target.closest("[data-voice-demo]"); if (voiceDemo && game?.type === "voice" && game.current) { playWordVoice(game.current); return; }
      const voiceStart = event.target.closest("[data-voice-start]"); if (voiceStart) { attemptVoiceGate(false); return; }
      const voiceNetwork = event.target.closest("[data-voice-network]"); if (voiceNetwork) { if (game) game.networkPermit = true; attemptVoiceGate(true); return; }
      const monsterAudio = event.target.closest("[data-monster-audio]"); if (monsterAudio && game?.type === "monster" && game.current) { playWordVoice(game.current); return; }
      const retryCue = event.target.closest("[data-monster-retry-cue]");
      if (retryCue && game?.type === "monster" && game.cueFailed && !game.timerActive) {
        game.cueFailed = false;
        const recovery = q("[data-monster-audio-recovery]");
        if (recovery) recovery.hidden = true;
        return beginMonsterTurn(game.monsterStyle || "steady");
      }
      const monsterVoice = event.target.closest("[data-monster-voice]");
      if (monsterVoice) {
        if (game?.type === "monster" && !game.timerActive) return beginMonsterTurn(game.monsterStyle || "steady");
        attemptMonsterVoice(false);
        return;
      }
      const monsterNetwork = event.target.closest("[data-monster-network]"); if (monsterNetwork) { if (game) game.networkPermit = true; attemptMonsterVoice(true); return; }
      const monsterAnswer = event.target.closest("[data-monster-answer]"); if (monsterAnswer) return settleMonsterAnswer(Number(monsterAnswer.dataset.monsterAnswer));
      const monsterReward = event.target.closest("[data-monster-reward]"); if (monsterReward) return chooseMonsterReward(monsterReward.dataset.monsterReward);
      const memory = event.target.closest("[data-memory-index]"); if (memory) return chooseMemory(Number(memory.dataset.memoryIndex));
      const survivalStart = event.target.closest("[data-survival-start]"); if (survivalStart) return beginSurvival();
      const survivalAudio = event.target.closest("[data-survival-audio]"); if (survivalAudio && game?.type === "survival" && game.current) { playWordVoice(game.current); return; }
      const survivalAnswer = event.target.closest("[data-survival-answer]"); if (survivalAnswer) return chooseSurvivalAnswer(Number(survivalAnswer.dataset.survivalAnswer));
      const bingoStart = event.target.closest("[data-bingo-start]"); if (bingoStart) return beginBingo();
      const bingoAudio = event.target.closest("[data-bingo-audio]"); if (bingoAudio && game?.type === "bingo" && game.current) { playWordVoice(game.current); return; }
      const bingoAnswer = event.target.closest("[data-bingo-index]"); if (bingoAnswer) return chooseBingo(Number(bingoAnswer.dataset.bingoIndex));
      const reflexStart = event.target.closest("[data-reflex-start]"); if (reflexStart) return beginReflex();
      const reflexAnswer = event.target.closest("[data-reflex-value]"); if (reflexAnswer) return chooseReflex(reflexAnswer.dataset.reflexValue);
      const install = event.target.closest("[data-audio-install]"); if (install) { openVoicePackInstaller(Number(install.dataset.audioInstall)); return; }
      const fallback = event.target.closest("[data-audio-fallback]"); if (fallback) { enableAudioFallback(); return; }
      const registerAudio = event.target.closest("[data-register-audio]"); if (registerAudio) return playRegisterVoice();
      const registerOptionAudio = event.target.closest("[data-register-option-audio]"); if (registerOptionAudio) return playRegisterOption(Number(registerOptionAudio.dataset.registerOptionAudio));
      const answer = event.target.closest("[data-answer]"); if (answer) return chooseWordAnswer(Number(answer.dataset.answer));
      const grade = event.target.closest("[data-grade]"); if (grade) return chooseTone(grade.dataset.grade);
      const polish = event.target.closest("[data-polish]"); if (polish) return choosePolish(Number(polish.dataset.polish));
      const gradeLock = event.target.closest("[data-grade-lock]"); if (gradeLock) return chooseRegisterGameAnswer("grade-lock", Number(gradeLock.dataset.gradeLock));
      const sceneListen = event.target.closest("[data-scene-listen]"); if (sceneListen) return chooseRegisterGameAnswer("scene-listen", Number(sceneListen.dataset.sceneListen));
      const registerShift = event.target.closest("[data-register-shift]"); if (registerShift) return chooseRegisterGameAnswer("register-shift", Number(registerShift.dataset.registerShift));
      const replay = event.target.closest("#arcade-replay"); if (replay && game) return openGame(game.type);
      const review = event.target.closest("[data-arcade-review]"); if (review) return openLearningReview();
      const exit = event.target.closest("[data-arcade-exit]"); if (exit) return q("#arcade-close")?.click();
    });
    q("#arcade-next").addEventListener("click", nextRound);
    q("#arcade-close").addEventListener("click", handleCloseRequest);
    q("#modal-backdrop").addEventListener("click", handleCloseRequest);
    document.querySelector('[data-nav="battle"]')?.addEventListener("click", renderHall);
    document.addEventListener("keydown", handleGameKeydown);
    document.addEventListener("visibilitychange", () => { if (document.hidden) pauseMonsterExpedition(); });
    window.addEventListener?.("pagehide", pauseMonsterExpedition);
    document.addEventListener("sawadeeka:entitlement-change", () => {
      const premiumMonsterRoute = game?.type === "monster" && (game.monsterMode === "rally" || Number(game.campaignLevel) > 1);
      if (game && (!canUseGame(game.type) || (premiumMonsterRoute && !canUseFullMonsterRoute()))) {
        const gameSheetOpen = !q("#arcade-sheet")?.classList.contains("hidden");
        closeGame();
        if (gameSheetOpen) { try { window.closeSheets?.(); } catch (_) {} }
      } else renderHall();
    });
    window.addEventListener?.("storage", event => {
      if (event.key === `thai-vibe-mode-${direction()}`) renderHall();
    });
  }

  function init() {
    if (!q("#arcade-hall")) return;
    renderHall();
    bindEvents();
    ensureArcadeOrientationHint();
    setGameOrientation(false);
    globalThis.addEventListener?.("resize", syncArcadeOrientationHint, { passive: true });
    globalThis.addEventListener?.("orientationchange", syncArcadeOrientationHint, { passive: true });
  }
  window.ArcadeUI = {
    render: renderHall,
    close: closeGame,
    requestClose,
    openStoryChapter(level = 1) {
      openGame("monster");
      // Use the same chapter selector and entitlement gate as the game hall.
      if (game?.type !== "monster") return;
      if (game.campaignLevel !== level) chooseMonsterChapter(level);
    },
    stopVoice: stopVoiceAudio,
    getModeLinkState: activeGameLink,
    onModeChange() { closeGame(); renderHall(); },
    onDirectionChange() { closeGame(); renderHall(); },
    onSpeakerProfileChange() { closeGame(); renderHall(); }
  };
  if (globalThis.__HUILAISHI_TEST__) {
    window.__HUILAISHI_ARCADE_TEST__ = {
      activeRegisterGrade,
      activeGameLink,
      buildToneGradePlan,
      buildGradeLockItems,
      buildSceneListenItems,
      buildRegisterShiftItems,
      monsterDamage,
      monsterDamageParts,
      monsterRoundResultModel,
      monsterActionPoses,
      monsterImpactTimeline,
      setMonsterActionFrame,
      scheduleMonsterImpactFeedback,
      monsterComboMultiplier,
      monsterPowerMultiplier,
      monsterScaledHp,
      monsterPlayerMaxHp,
      monsterBurstDamage,
      monsterAttackDamage,
      defaultMonsterHeroId,
      campusEffects,
      campusNeedsChoice,
      chooseCampusRoute,
      renderCampusFork,
      monsterStartingCombatLevel,
      monsterCollectionSnapshot,
      campusRouteMarkup,
      campusLearningRecapMarkup,
      monsterWorldMarkup,
      openLearningReview,
      isCampusChapter,
      recordMonsterDefeat,
      normalizeMonsterExpedition,
      readMonsterExpedition,
      saveMonsterExpedition,
      clearMonsterExpedition,
      chooseMonsterReward,
      claimMonsterReward,
      recordLearningResult,
      pickWords,
      syncMonsterCombatGrowth,
      setGameForTest: value => { game = value; },
      getGameForTest: () => game,
      monsterGlobalStage,
      monsterStyleDamage,
      monsterStyleCounterDamage,
      monsterCounterDamageParts,
      monsterRiskText,
      monsterIntentText,
      monsterSkillState,
      monsterHeroDamage,
      monsterHeroCounterDamage,
      countBingoLines,
      reflexPoints,
      monsterStyles: () => MONSTER_STYLE_ORDER.map(id => ({ id, ...MONSTER_STYLES[id] })),
      monsterHeroConfigs: () => MONSTER_HERO_CONFIGS.map(item => ({ ...item })),
      monsterConfigs: () => MONSTER_CONFIGS.map(item => ({ ...item })),
      rallyMonsterConfigs: () => MONSTER_RALLY_CONFIGS.map(item => ({ ...item })),
      allMonsterConfigs: () => ALL_MONSTER_CONFIGS.map(item => ({ ...item })),
      rallyZones: () => MONSTER_RALLY_ZONES.map(item => ({ ...item })),
      monsterRallyCollectionSnapshot,
      registerOptionMarkup,
      orderedGameIds: () => orderedGameEntries().map(([id]) => id),
      gameIds: () => Object.keys(copy().games)
    };
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
