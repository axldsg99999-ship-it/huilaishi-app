/* V116: direction-specific story and deterministic expedition choices.
   No timers, storage, networking or pronunciation claims in this model. */
(function () {
  "use strict";
  const freeze = value => { if (value && typeof value === "object") { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
  const journeys = freeze({
    "zh-th": {
      country: "thailand", hero: "chinese", partner: "thai",
      art: "./assets/game/thailand-riverside-v116.webp",
      title: "风从暹罗来", subtitle: "散页之城 · 泰国篇", location: "河畔校园",
      intro: "交换生的第一天，风把迎新手册吹散了。和泰国搭档一起，找回藏在街巷里的声音。",
      quest: "找回迎新手册，点亮河畔舞台。",
      restored: "河畔舞台重新开演了。你们找回了第一章的声音。",
      stations: ["食堂外的小摊", "嘟嘟车停靠点", "河边候船亭", "校园失物处", "迎新教室", "河畔纸灯舞台"],
      notes: ["从水、米饭和吃饭开始，找回摊主的订单。", "弄清去、来、回，追上带走手册的嘟嘟车。", "分清今天、明天和昨天，找到约定的日期。", "认出包、书和笔，找回搭档的随身物品。", "认识朋友、老师和学生，找到迎新活动的同伴。", "用前面见过的词，唤醒守着舞台的纸灯兽。"],
      forkTitle: "放学后，走哪条路？",
      routes: [
        { id: "supply", title: "去小摊帮忙", story: "帮摊主收好被风吹乱的摊位，带一份补给出发。", effect: "立即恢复 18 HP；下一战守势受伤再减 20%", icon: "bowl" },
        { id: "edge", title: "沿河追纸页", story: "沿着河岸抄近路，抢在纸怪架盾前赶到。", effect: "下一战破盾效率 +50%；每次合击额外 +6 伤害", icon: "kite" },
        { id: "echo", title: "和搭档练合拍", story: "在候船亭对一遍暗号，带着默契进入下一战。", effect: "合击充能 +1；下一战每题多 0.5 秒", icon: "voice" }
      ]
    },
    "th-zh": {
      country: "china", hero: "thai", partner: "chinese",
      art: "./assets/game/china-riverside-v116.webp",
      title: "เสียงจากเมืองจีน", subtitle: "เมืองหน้ากระดาษ · เส้นทางจีน", location: "ตรอกข้างมหาวิทยาลัย",
      intro: "วันแรกของนักเรียนแลกเปลี่ยน คู่มือต้อนรับปลิวหายไป ตามหาเสียงในตรอกกับคู่หูชาวจีนกันเถอะ",
      quest: "ตามหาคู่มือต้อนรับ แล้วเปิดเวทีริมคลองอีกครั้ง",
      restored: "เวทีริมคลองกลับมาเปิดแล้ว คุณทั้งคู่หาเสียงของบทแรกเจอแล้ว",
      stations: ["ร้านอาหารข้างมหาวิทยาลัย", "ทางแยกหน้าประตู", "ป้ายกิจกรรมริมคลอง", "จุดรับของหาย", "ห้องปฐมนิเทศ", "เวทีโคมกระดาษริมคลอง"],
      notes: ["เริ่มจากน้ำ ข้าว และกิน เพื่อหาใบสั่งอาหารของร้าน", "แยกคำว่าไป มา และกลับ แล้วตามหน้ากระดาษที่หายไป", "แยกวันนี้ พรุ่งนี้ และเมื่อวาน เพื่อหาวันนัด", "รู้จักกระเป๋า หนังสือ และปากกา แล้วหาของให้คู่หู", "รู้จักเพื่อน ครู และนักเรียน เพื่อหาทีมงานต้อนรับ", "ใช้คำที่เคยเจอเพื่อปลุกอสูรโคมกระดาษที่เฝ้าเวที"],
      forkTitle: "เลิกเรียนแล้ว ไปทางไหนดี?",
      routes: [
        { id: "supply", title: "ช่วยที่ร้านอาหาร", story: "ช่วยเจ้าของร้านเก็บของที่ถูกลมพัด แล้วรับเสบียงก่อนออกเดินทาง", effect: "ฟื้น 18 HP ทันที; ด่านถัดไปท่าตั้งรับลดความเสียหายอีก 20%", icon: "bowl" },
        { id: "edge", title: "ตามกระดาษริมคลอง", story: "วิ่งลัดข้างสะพาน ไปให้ทันก่อนมอนสเตอร์ตั้งโล่", effect: "ด่านถัดไปทำลายโล่เพิ่ม 50%; ท่าคู่เพิ่มดาเมจอีก 6", icon: "kite" },
        { id: "echo", title: "ซ้อมกับคู่หู", story: "ซ้อมสัญญาณด้วยกันข้างประตูวงกลม แล้วเข้าด่านอย่างพร้อมเพรียง", effect: "ชาร์จท่าคู่ +1; ด่านถัดไปแต่ละข้อเพิ่มเวลา 0.5 วิ", icon: "voice" }
      ]
    }
  });
  function journey(dir) { return journeys[dir === "th-zh" ? "th-zh" : "zh-th"]; }
  function normalizeRoutes(value, index) {
    const result = {};
    for (const stage of [2, 4]) if (stage <= index && ["supply", "edge", "echo"].includes(value?.[stage])) result[stage] = value[stage];
    return result;
  }
  function needsChoice(run) { return Boolean(run?.monsterMode === "story" && run.campaignLevel === 1 && [2, 4].includes(run.monsterIndex) && run.stageRound === 0 && !run.campusRoutes?.[run.monsterIndex]); }
  function activeRoute(run) { return run?.monsterMode === "story" && run.campaignLevel === 1 ? run.campusRoutes?.[run.monsterIndex] || null : null; }
  function routeEffects(run) {
    const route = activeRoute(run);
    return { shieldMultiplier: route === "edge" ? 1.5 : 1, burstBonus: route === "edge" ? 6 : 0, guardMultiplier: route === "supply" ? .8 : 1, turnBonus: route === "echo" ? 500 : 0 };
  }
  function chooseRoute(run, id) {
    if (!needsChoice(run) || !journey(run.direction).routes.some(route => route.id === id)) return false;
    run.campusRoutes = { ...normalizeRoutes(run.campusRoutes, run.monsterIndex), [run.monsterIndex]: id };
    if (id === "supply") run.playerHp = Math.min(run.playerMaxHp, run.playerHp + 18);
    if (id === "echo") run.burstCharge = Math.min(3, (Number(run.burstCharge) || 0) + 1);
    return true;
  }
  function bossPhase(monster, hp, maxHp) { return monster?.id === "lantern" && maxHp > 0 && hp / maxHp <= .5 ? 2 : 1; }
  // The shield costs attack power; enhanced shield breaking must not inflate body damage.
  function shieldHit(rawDamage, shield, multiplier = 1) {
    const raw = Math.max(0, Math.floor(Number(rawDamage) || 0));
    const ratio = Math.max(1, Math.min(1.5, Number(multiplier) || 1));
    const absorbed = Math.min(Math.max(0, Number(shield) || 0), Math.floor(raw * ratio));
    return { absorbed, damage: Math.max(0, raw - Math.ceil(absorbed / ratio)) };
  }
  globalThis.HUILAISHI_CAMPUS_ADVENTURE = freeze({ version: 1, reviewStatus: "native-review-pending", journeys, journey, normalizeRoutes, needsChoice, activeRoute, routeEffects, chooseRoute, bossPhase, shieldHit });
})();
