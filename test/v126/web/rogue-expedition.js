/* A deterministic, offline-first first chapter. No timers, DOM, audio or network here. */
(function (root) {
  "use strict";
  const VERSION = 1;
  const DIRECTIONS = ["zh-th", "th-zh"];
  const ENEMIES = ["wok-crab", "tuk-gecko", "umbrella-hornbill", "backpack-buffalo", "chalk-tokay", "rumor-moth"];
  const RELICS = [
    ["red-thread", "连击红线", "ด้ายคอมโบ", "连击伤害上限 +6", "เพิ่มเพดานดาเมจคอมโบ 6", "combo"],
    ["echo-bell", "回声铜铃", "กระดิ่งเสียงก้อง", "每连续答对 3 次，追加 8 伤害", "ตอบถูกติดกัน 3 ครั้ง เพิ่มดาเมจ 8", "combo"],
    ["swift-note", "疾行纸签", "กระดาษว่องไว", "速攻基础伤害 +4", "ท่าบุกเร็วเพิ่มดาเมจพื้นฐาน 4", "combo"],
    ["steady-ink", "不褪墨迹", "หมึกไม่จาง", "失误后保留最多 2 层连击", "เมื่อตอบผิด คงคอมโบไว้ไม่เกิน 2", "combo"],
    ["brass-key", "黄铜钥匙", "กุญแจทองเหลือง", "破盾招式的破盾效率 +50%", "ท่าเจาะโล่ทำลายโล่เพิ่ม 50%", "pierce"],
    ["paper-edge", "折纸锋刃", "คมกระดาษ", "击破护盾时追加 8 伤害", "เมื่อทำลายโล่ เพิ่มดาเมจ 8", "pierce"],
    ["quiet-ear", "听风耳夹", "ต่างหูฟังลม", "无提示听辨答对，伤害 +6", "ฟังแล้วตอบถูกโดยไม่ดูคำ เพิ่มดาเมจ 6", "pierce"],
    ["blue-seal", "蓝印破阵", "ตราคราม", "击中怪物弱点时追加 6 伤害", "โจมตีตรงจุดอ่อน เพิ่มดาเมจ 6", "pierce"],
    ["lotus-fold", "莲叶纸盾", "โล่ใบบัว", "防守答对获得 5 护盾，上限 20", "ตอบถูกด้วยท่าตั้งรับ รับโล่ 5 สูงสุด 20", "guard"],
    ["return-stamp", "回响印章", "ตราสวนกลับ", "防守答对且受攻击时，反击 8 伤害", "ตั้งรับถูกแล้วถูกโจมตี สวนกลับ 8", "guard"],
    ["warm-tea", "保温茶壶", "กาชาอุ่น", "通过战斗后恢复 8 生命", "ชนะการต่อสู้ ฟื้นพลังชีวิต 8", "guard"],
    ["school-pin", "校徽别针", "เข็มกลัดโรงเรียน", "最大生命 +12，并立即恢复 12", "พลังชีวิตสูงสุด +12 และฟื้นทันที 12", "guard"]
  ].map(([id, zh, th, descZh, descTh, build]) => Object.freeze({ id, zh, th, descZh, descTh, build }));
  const finite = (v, min, max, fallback = min) => Number.isFinite(v) ? Math.max(min, Math.min(max, Math.floor(v))) : fallback;
  const clone = v => JSON.parse(JSON.stringify(v));
  function random(state) {
    state.rng = (Math.imul(state.rng >>> 0, 1664525) + 1013904223) >>> 0;
    return state.rng / 4294967296;
  }
  function shuffle(state, values) {
    const a = [...values];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(random(state) * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function level(meta) { return Math.min(10, 1 + Math.floor(Math.max(0, Number(meta?.xp) || 0) / 120)); }
  function empty(direction) {
    return { version: VERSION, direction: DIRECTIONS.includes(direction) ? direction : "zh-th", meta: { xp: 0, wins: 0, runs: 0, discoveries: [] }, run: null };
  }
  function route(seed,profileId='primer') {
    const p=root.HUILAISHI_ROGUE_WORLD?.profile(profileId);
    // New themed routes are additive: never reorder the monsters in existing saved routes.
    if(p?.direction){
      const rng={rng:seed>>>0},ordinary=shuffle(rng,p.monsterIds.filter(id=>!root.HUILAISHI_ROGUE_WORLD.enemy(id)?.elite&&!root.HUILAISHI_ROGUE_WORLD.enemy(id)?.boss));
      const make=(floor,slot,type,enemy=null)=>({id:`${floor}-${slot}`,floor,type,enemy});
      return [[make(0,0,"battle",ordinary[0])],[make(1,0,"battle",ordinary[1]),make(1,1,"event")],
        [make(2,0,"elite",p.elite),make(2,1,"battle",ordinary[2])],[make(3,0,"rest"),make(3,1,"shop")],
        [make(4,0,"battle",ordinary[3])],[make(5,0,"event"),make(5,1,"battle",ordinary[2])],
        [make(6,0,"elite",p.elite)],[make(7,0,"rest"),make(7,1,"shop")],[make(8,0,"boss",p.boss)]];
    }
    const custom=profileId!=='primer'&&p;
    const roster=custom?p.monsterIds.map(id=>root.HUILAISHI_ROGUE_WORLD.enemy(id)):[];
    const state = { rng: seed >>> 0 }, monsters = shuffle(state, custom?roster.filter(m=>!m.boss).map(m=>m.id):ENEMIES);
    while(monsters.length<6)monsters.push(monsters[monsters.length%Math.max(1,monsters.length)]||ENEMIES[0]);
    const boss=custom?shuffle(state,roster.filter(m=>m.boss).map(m=>m.id))[0]:'lantern';
    const make = (floor, slot, type, enemy) => ({ id: `${floor}-${slot}`, floor, type, enemy: enemy || null });
    return [
      [make(0, 0, "battle", monsters[0])],
      [make(1, 0, "battle", monsters[1]), make(1, 1, "event")],
      [make(2, 0, "elite", monsters[2]), make(2, 1, "battle", monsters[3])],
      [make(3, 0, "rest"), make(3, 1, "shop")],
      [make(4, 0, "battle", monsters[4]), make(4, 1, "battle", monsters[5])],
      [make(5, 0, "event"), make(5, 1, "battle", monsters[1])],
      [make(6, 0, "elite", monsters[5]), make(6, 1, "elite", monsters[2])],
      [make(7, 0, "rest"), make(7, 1, "shop")],
      [make(8, 0, "boss", boss)]
    ];
  }
  function start(state, seed, words, reviewIds = [], options = {}) {
    if (state.run && !["won", "lost"].includes(state.run.phase)) return false;
    const profile=options.profile||'primer',p=root.HUILAISHI_ROGUE_WORLD?.profile(profile);
    if(profile!=='primer'&&!p)return false;
    if(p?.direction&&p.direction!==state.direction)return false;
    const kind=options.kind==='sentences'?'sentences':'words';
    const allowed=profile==='primer'?null:new Set(root.HUILAISHI_ROGUE_WORLD.pool(profile,kind).map(w=>w.id));
    const candidates = [...new Set(words)].filter(id => /^[lxs][1-6]-\d{3}$/.test(id)&&(!allowed||allowed.has(id)));
    const due=[...new Set(reviewIds)].filter(id=>candidates.includes(id)).slice(0,6);
    const preferred=Array.isArray(options.preferredIds)?options.preferredIds:[];
    const shuffled=shuffle({rng:seed>>>0},candidates.filter(id=>!due.includes(id)));
    const pool=[...due,...shuffled.filter(id=>preferred.includes(id)),...shuffled.filter(id=>!preferred.includes(id))].slice(0,30);
    if (pool.length < 6) return false;
    state.meta.runs++;
    const hp = 100 + (level(state.meta) - 1) * 2;
    state.run = { id: `${seed >>> 0}-${state.meta.runs}`, seed: seed >>> 0, rng: seed >>> 0, phase: "map", floor: 0,
      hp, maxHp: hp, shield: 0, coins: 0, relics: [], visited: [], pool, review: reviewIds.filter(id => pool.includes(id)),
      taught: [], correctIds: [], wrongIds: [], answers: 0, correct: 0, combo: 0, bestCombo: 0, xp: 0, reward: [],
      node: null, enemy: null, question: null, feedback: null, pendingLearning: null,
      profile,kind,difficulty:p?.level||1 };
    return true;
  }
  function getNode(run) { return run && route(run.seed,run.profile)[run.floor]?.find(node => node.id === run.node) || null; }
  const has = (run, id) => run.relics.includes(id);
  function offers(run, count = 3) { return shuffle(run, RELICS.filter(r => !has(run, r.id)).map(r => r.id)).slice(0, count); }
  function enter(state, nodeId) {
    const r = state.run;
    if (!r || r.phase !== "map") return false;
    const node = route(r.seed,r.profile)[r.floor]?.find(n => n.id === nodeId);
    if (!node) return false;
    r.node = node.id; r.feedback = null;
    if (["rest", "shop", "event"].includes(node.type)) {
      r.phase = node.type; r.reward = node.type === "shop" ? offers(r) : []; return true;
    }
    const boss = node.type === "boss", elite = node.type === "elite";
    const maxHp = (boss ? 330 : (elite ? 145 : 104) + r.floor * 6)+(r.difficulty-1||0)*(boss?12:6);
    const config=root.HUILAISHI_ROGUE_WORLD?.enemy(node.enemy);
    const shield=r.profile!=='primer'&&config?Math.min(30,config.shield||0):node.enemy === "umbrella-hornbill" ? 22 : node.enemy === "wok-crab" ? 12 : 0;
    r.enemy = { id: node.enemy, hp: maxHp, maxHp, shield, turn: 0, phase: 1, boss };
    const special=root.XULONG_EXPEDITION_THEMES?.initial(node.enemy);
    if(special)r.enemy.special=special;
    const review=[...new Set([...r.wrongIds,...r.review])].filter(id=>!r.correctIds.includes(id)||r.wrongIds.includes(id));
    const priority = [...new Set([...review, ...shuffle(r, r.pool.filter(id => !r.taught.includes(id))), ...shuffle(r, r.pool)])];
    r.lesson = boss ? (r.taught.length >= 3 ? [...r.taught] : r.pool.slice(0, 3)) : priority.slice(0, 3);
    r.phase = "prepare"; r.question = null; r.combo = 0;
    return true;
  }
  function prepare(state) {
    const r = state.run;
    if (!r || r.phase !== "prepare") return false;
    r.taught = [...new Set([...r.taught, ...r.lesson])];
    r.phase = "battle"; question(r); return true;
  }
  function question(r) {
    const e = r.enemy, modes = ["read", "recall", "listen"];
    const mode = r.kind==='sentences'?'read':e.id === "rumor-moth" ? (e.turn % 2 ? "recall" : "read") : modes[e.turn % 3];
    const target = r.lesson[e.turn % r.lesson.length];
    const options = shuffle(r, [target, ...shuffle(r, r.taught.filter(id => id !== target)).slice(0, 3)]);
    r.question = { id: `${r.id}:${r.node}:${e.turn}`, target, options, mode, speedEligible: true };
    // Telegraph the actual upcoming action; shields are created only once per turn.
    if ((e.id === "wok-crab" || e.id === "chalk-tokay") && e.turn > 0 && e.turn % 3 === 0) e.shield = Math.max(e.shield, 12);
    if (!e.special && (e.boss||e.id === "lantern") && e.phase === 1 && e.turn % 3 === 0) e.shield = Math.max(e.shield, 14);
  }
  function intent(r) {
    const e = r?.enemy;
    if (!e) return null;
    const special=root.XULONG_EXPEDITION_THEMES?.intent(e);
    if(special)return special;
    if (e.shield > 0) return { kind: "shield", weak: "pierce", damage: 4 };
    const config=r.profile&&r.profile!=='primer'?root.HUILAISHI_ROGUE_WORLD?.enemy(e.id):null;
    if(config){
      const skill=config.skill,style=skill?.counterStyles?.[e.turn%skill.counterStyles.length]||skill?.counterStyle;
      if(skill&&(skill.always||(e.turn+1)%(skill.every||3)===0))return {kind:'skill',weak:style==='steady'?'pierce':style||'guard',damage:14,nameZh:skill.nameZh,nameTh:skill.nameTh};
      if((e.boss&&e.phase===2&&e.turn%2===0)||(['heavy','regen'].includes(config.trait)&&e.turn%2===1))return {kind:'charge',weak:'guard',damage:16};
      if(['haste','enrage'].includes(config.trait))return {kind:'rush',weak:'rush',damage:8};
      if(config.resonanceEvery)return {kind:'echo',weak:'pierce',damage:7};
    }
    if ((e.id === "backpack-buffalo" && e.turn % 2 === 1) || (e.id === "lantern" && e.phase === 2 && e.turn % 2 === 0)) return { kind: "charge", weak: "guard", damage: 16 };
    if (e.id === "tuk-gecko" || (e.id === "chalk-tokay" && e.turn % 3 === 2)) return { kind: "rush", weak: "rush", damage: 8 };
    if (e.id === "rumor-moth") return { kind: "confuse", weak: "guard", damage: 7 };
    if (e.id === "umbrella-hornbill") return { kind: "echo", weak: "pierce", damage: 6 };
    return { kind: "strike", weak: "rush", damage: 6 };
  }
  function earn(state, xp) { state.meta.xp = Math.min(120000, state.meta.xp + xp); state.run.xp += xp; }
  function answer(state, questionId, answerId, style, elapsedMs, assisted = false) {
    const r = state.run, q = r?.question;
    if (!r || r.phase !== "battle" || !q || q.id !== questionId || !q.options.includes(answerId) || !["rush", "pierce", "guard"].includes(style)) return false;
    const e = r.enemy, incoming = intent(r), correct = answerId === q.target;
    let damage = 0, blocked = 0, shieldDamage = 0, counter = 0, mechanicNotes=[];
    r.answers++;
    if (correct) {
      r.correct++; r.combo++; r.bestCombo = Math.max(r.bestCombo, r.combo);
      if (!r.correctIds.includes(q.target)) { r.correctIds.push(q.target); earn(state, 3); }
      r.wrongIds = r.wrongIds.filter(id => id !== q.target);
      const base = style === "rush" ? 24 : style === "pierce" ? 20 : 16;
      // Speed is a capped extra, never a prerequisite. Hidden/reloaded/hinted questions earn none.
      const speed = q.speedEligible && !assisted && Number.isFinite(elapsedMs) && elapsedMs >= 0 && elapsedMs < 4000 ? 4 : 0;
      damage = base + speed + Math.min(has(r, "red-thread") ? 12 : 6, (r.combo - 1) * 2);
      if (style === "rush" && has(r, "swift-note")) damage += 4;
      if (has(r, "echo-bell") && r.combo % 3 === 0) damage += 8;
      if (q.mode === "listen" && !assisted && has(r, "quiet-ear")) damage += 6;
      if (style === incoming.weak) damage += has(r, "blue-seal") ? 10 : 4;
      const multiplier = style === "pierce" ? (has(r, "brass-key") ? 3 : 2) : 1;
      shieldDamage = Math.min(e.shield, Math.floor(damage * multiplier));
      damage = Math.max(0, damage - Math.ceil(shieldDamage / multiplier));
      e.shield -= shieldDamage;
      if (shieldDamage > 0 && e.shield === 0 && has(r, "paper-edge")) damage += 8;
      if (style === "guard" && has(r, "lotus-fold")) r.shield = Math.min(20, r.shield + 5);
      if(e.special){
        const hit=root.XULONG_EXPEDITION_THEMES.strike(e,true,style,damage);
        damage=hit.damage;mechanicNotes=hit.notes;
      }
      e.hp = Math.max(0, e.hp - damage);
    } else {
      r.combo = has(r, "steady-ink") ? Math.min(2, r.combo) : 0;
      if (!r.wrongIds.includes(q.target)) r.wrongIds.push(q.target);
      const regen=r.profile&&r.profile!=='primer'?root.HUILAISHI_ROGUE_WORLD?.enemy(e.id)?.regen: e.id==='backpack-buffalo'?4:0;
      if (regen) e.hp = Math.min(e.maxHp, e.hp + Math.min(8,regen));
      if(e.special)root.XULONG_EXPEDITION_THEMES.strike(e,false,style,0);
    }
    if (e.hp > 0) {
      counter = correct ? (["charge","skill"].includes(incoming.kind) ? (incoming.kind==='skill'&&style===incoming.weak?2:incoming.damage) : 2) : incoming.damage + 7;
      if(e.special){
        counter=root.XULONG_EXPEDITION_THEMES.retaliation(e,incoming,correct,style);
        if(correct&&e.special.kind==="drum"&&incoming.weak==="guard"&&style==="guard")mechanicNotes.push("interrupted");
      }
      if (style === "guard") counter = Math.ceil(counter * .4);
      blocked = Math.min(r.shield, counter); r.shield -= blocked; counter -= blocked;
      r.hp = Math.max(0, r.hp - counter);
      if (correct && style === "guard" && has(r, "return-stamp")) { e.hp = Math.max(0, e.hp - 8); damage += 8; }
    }
    const phaseChanged = (e.boss||e.id === "lantern") && e.phase === 1 && e.hp > 0 && e.hp <= e.maxHp / 2;
    if (phaseChanged) { e.phase = 2; e.shield = 0;root.XULONG_EXPEDITION_THEMES?.phase(e); }
    r.feedback = { correct, word: q.target, damage, counter, blocked, shieldDamage, phaseChanged, defeated: e.hp === 0, assisted: Boolean(assisted), style, mechanicNotes };
    // Persist this phase before presenting rewards. The same question cannot be answered twice.
    r.pendingLearning = r.kind==='sentences'?null:{ id: q.id, word: q.target, correct };
    if(r.kind==='sentences'){
      state.meta.sentencePractice=finite((state.meta.sentencePractice||0)+1,0,1000000);
      if(correct)state.meta.sentenceCorrect=finite((state.meta.sentenceCorrect||0)+1,0,1000000);
    }
    r.phase = "feedback";
    return clone(r.feedback);
  }
  function addRelic(r, id) {
    if (!RELICS.some(x => x.id === id) || has(r, id)) return false;
    r.relics.push(id);
    if (id === "school-pin") { r.maxHp += 12; r.hp = Math.min(r.maxHp, r.hp + 12); }
    return true;
  }
  function advance(r) {
    if (!r.visited.includes(r.node)) r.visited.push(r.node);
    r.floor++; r.node = null; r.enemy = null; r.question = null; r.feedback = null; r.reward = []; r.phase = "map";
  }
  function next(state) {
    const r = state.run;
    if (!r || r.phase !== "feedback") return false;
    if (r.hp <= 0) { r.phase = "lost"; return true; }
    if (r.enemy.hp <= 0) {
      const node = getNode(r);
      if (!state.meta.discoveries.includes(r.enemy.id)) state.meta.discoveries.push(r.enemy.id);
      earn(state, node.type === "boss" ? 80 : node.type === "elite" ? 28 : 18);
      r.coins += node.type === "elite" ? 24 : 16;
      if (has(r, "warm-tea")) r.hp = Math.min(r.maxHp, r.hp + 8);
      if (node.type === "boss") { r.visited.push(r.node); r.phase = "won"; state.meta.wins++; return true; }
      r.reward = offers(r); r.phase = "reward";
      if (!r.reward.length) advance(r);
    } else { r.enemy.turn++; r.phase = "battle"; question(r); }
    return true;
  }
  function chooseReward(state, id) {
    const r = state.run;
    if (!r || r.phase !== "reward" || !r.reward.includes(id) || !addRelic(r, id)) return false;
    advance(r); return true;
  }
  function roomAction(state, action) {
    const r = state.run;
    if (!r) return false;
    if (r.phase === "rest") {
      if (action !== "heal" && action !== "supply") return false;
      if (action === "heal") r.hp = Math.min(r.maxHp, r.hp + 30); else r.coins += 24;
    } else if (r.phase === "event") {
      if (action === "help") { r.hp = Math.min(r.maxHp, r.hp + 12); r.coins += 10; }
      else if (action === "risk" && r.hp > 10) { r.hp -= 10; r.reward = offers(r); r.phase = "reward"; return true; }
      else return false;
    } else if (r.phase === "shop") {
      if (action !== "leave") {
        if (!r.reward.includes(action) || r.coins < 30 || !addRelic(r, action)) return false;
        r.coins -= 30;
      }
    } else return false;
    advance(r); return true;
  }
  function abandon(state) {
    if (!state.run || ["won", "lost"].includes(state.run.phase)) return false;
    state.run.phase = "lost"; state.run.abandoned = true; return true;
  }
  function restore(value, direction, validWordIds) {
    const clean = empty(direction), valid = new Set(validWordIds);
    if (!value || value.version !== VERSION || value.direction !== clean.direction) return { state: clean, rejected: Boolean(value) };
    const m = value.meta || {};
    clean.meta = { xp: finite(m.xp, 0, 120000), wins: finite(m.wins, 0, 10000), runs: finite(m.runs, 0, 100000), discoveries: Array.isArray(m.discoveries) ? [...new Set(m.discoveries.filter(id => [...ENEMIES, "lantern"].includes(id)||root.HUILAISHI_ROGUE_WORLD?.enemy(id)))] : [], sentencePractice:finite(m.sentencePractice,0,1000000),sentenceCorrect:Math.min(finite(m.sentenceCorrect,0,1000000),finite(m.sentencePractice,0,1000000)) };
    if (!value.run) return { state: clean, rejected: false };
    const r = value.run;
    try {
      const profile=r.profile||'primer',p=root.HUILAISHI_ROGUE_WORLD?.profile(profile);
      if(profile!=='primer'&&!p)throw 0;
      if(p?.direction&&p.direction!==direction)throw 0;
      if(r.kind&&!['words','sentences'].includes(r.kind))throw 0;
      if(r.difficulty!==undefined&&r.difficulty!==(p?.level||1))throw 0;
      if(profile!=='primer'){
        const allowed=new Set(root.HUILAISHI_ROGUE_WORLD.pool(profile,r.kind||'words').map(w=>w.id));
        if(!Array.isArray(r.pool)||r.pool.some(id=>!allowed.has(id)))throw 0;
      }
      if (!Number.isInteger(r.seed) || r.seed < 0 || r.seed > 4294967295 || !Number.isInteger(r.rng) || typeof r.id !== "string" || r.id.length > 80) throw 0;
      if (!["map", "prepare", "battle", "feedback", "reward", "rest", "shop", "event", "won", "lost"].includes(r.phase)) throw 0;
      for (const [field, min, max] of [["floor",0,8],["hp",0,130],["maxHp",100,130],["shield",0,20],["coins",0,1000],["answers",0,1000],["correct",0,1000],["combo",0,1000],["bestCombo",0,1000],["xp",0,1000]]) if (!Number.isInteger(r[field]) || r[field] < min || r[field] > max) throw 0;
      if (r.hp > r.maxHp || r.correct > r.answers || !Array.isArray(r.pool) || r.pool.length < 6 || r.pool.length > 30) throw 0;
      for (const field of ["pool", "review", "taught", "correctIds", "wrongIds"]) if (!Array.isArray(r[field]) || r[field].some(id => !valid.has(id) || !r.pool.includes(id)) || new Set(r[field]).size !== r[field].length) throw 0;
      if (!Array.isArray(r.visited) || r.visited.some((id, i) => !route(r.seed,r.profile)[i]?.some(n => n.id === id)) || r.visited.length !== (r.phase === "won" ? 9 : r.floor)) throw 0;
      if (!Array.isArray(r.relics) || r.relics.length > 12 || new Set(r.relics).size !== r.relics.length || r.relics.some(id => !RELICS.some(x => x.id === id))) throw 0;
      if (!Array.isArray(r.reward) || r.reward.length > 3 || new Set(r.reward).size !== r.reward.length || r.reward.some(id => has(r,id) || !RELICS.some(x => x.id === id))) throw 0;
      const node = getNode(r);
      if (r.phase !== "map" && r.phase !== "lost" && !node) throw 0;
      if (["battle","prepare","feedback","won"].includes(r.phase)) {
        if (!r.enemy || node.enemy !== r.enemy.id || !Number.isInteger(r.enemy.turn) || r.enemy.turn < 0 || r.enemy.turn > 1000 || ![1,2].includes(r.enemy.phase)) throw 0;
        for (const f of ["hp","maxHp","shield"]) if (!Number.isFinite(r.enemy[f]) || r.enemy[f] < 0 || r.enemy[f] > 500) throw 0;
        if (r.enemy.hp > r.enemy.maxHp || !Array.isArray(r.lesson) || r.lesson.length < 3 || r.lesson.some(id => !r.pool.includes(id))) throw 0;
        if(root.XULONG_EXPEDITION_THEMES&&!root.XULONG_EXPEDITION_THEMES.valid(r.enemy))throw 0;
      }
      if (["battle", "feedback"].includes(r.phase)) {
        const q = r.question;
        if (!q || q.id !== `${r.id}:${r.node}:${r.enemy.turn}` || !r.lesson.includes(q.target) || !["read","recall","listen"].includes(q.mode) || !Array.isArray(q.options) || q.options.length < 3 || q.options.length > 4 || !q.options.includes(q.target) || new Set(q.options).size !== q.options.length || q.options.some(id => !r.taught.includes(id))) throw 0;
      }
      if (r.phase === "feedback" && (!r.feedback || r.feedback.word !== r.question.target || typeof r.feedback.correct !== "boolean")) throw 0;
      if (r.pendingLearning && (!r.pool.includes(r.pendingLearning.word) || typeof r.pendingLearning.correct !== "boolean" || typeof r.pendingLearning.id !== "string" || !r.pendingLearning.id.startsWith(`${r.id}:`) || r.pendingLearning.id.length > 150)) throw 0;
      if (["rest","shop","event"].includes(r.phase) && node.type !== r.phase) throw 0;
      if (r.phase === "reward" && !r.reward.length) throw 0;
      if (r.phase === "won" && (node.type !== "boss" || r.enemy.hp !== 0 || r.hp === 0)) throw 0;
      clean.run = clone(r);
      // A reload must not restart the speed bonus window.
      if (clean.run.question) clean.run.question.speedEligible = false;
      return { state: clean, rejected: false };
    } catch (_) { return { state: clean, rejected: true }; }
  }
  function setTarget(state,target){
    const r=state.run,s=r?.enemy?.special;
    if(r?.phase!=="battle"||s?.kind!=="satellites"||!["body","guards"].includes(target)||(target==="guards"&&!s.guards))return false;
    s.target=target;return true;
  }
  root.HUILAISHI_ROGUE = Object.freeze({ version: VERSION, reviewStatus: "native-review-pending", relics: Object.freeze(RELICS), enemyIds: Object.freeze(ENEMIES), empty, start, route, getNode, prepare, enter, intent, answer, next, chooseReward, roomAction, abandon, restore, level, setTarget });
})(globalThis);
