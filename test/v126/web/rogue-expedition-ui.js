/* Lazy UI for the expedition. Only the active room's scene and actors are rendered. */
(function (root) {
  "use strict";
  const M = root.HUILAISHI_ROGUE;
  const esc = v => String(v ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
  const ZH = {
    title:"双城远征", sub:"散页之城 · 肉鸽序章", start:"开启一次远征", resume:"继续这次远征", fresh:"重新出发", map:"路线手册", step:"站", back:"保存并离开", level:"冒险等级", xp:"成长经验", coins:"纸币", hp:"生命", shield:"护盾", build:"本局强化", empty:"尚无强化，赢下一战后开始搭配。", prepare:"先认识这组词", prepareNote:"可以反复听。准备好后再战斗，新词不会突然出现在考题里。", ready:"准备好了，进入战斗", listen:"听示范", read:"这个词是什么意思？", recall:"选出对应的原文", hearing:"听声音，选出意思", replay:"播放题目", hint:"看原文 · 不计速度和纯听辨加成", hintShown:"已显示原文，本题无速度与纯听辨加成", loading:"示范音播放中…", audioError:"示范音暂不可用。可重播，或看原文继续，不扣生命。", rush:"速攻", pierce:"破盾", guard:"防守", styleNote:"先看怪物预警，再选招式。答对才发动攻击。", correct:"命中", wrong:"这次没认对", next:"下一回合", claim:"挑选本局强化", rewardNote:"三选一，持续到本次远征结束。刷新不会换掉选项。", defeated:"击破！选择你的强化", lost:"先回校园休整", won:"纸灯舞台，重新亮起", resultNote:"本局强化已结束；冒险成长与词汇练习记录保留。", review:"复习这次错词", practice:"作答", unique:"本局练对词汇", noWrong:"本局没有待复习错词", rest:"课后补给站", restNote:"热茶还温着。休息一下，或带纸币去下一站。", heal:"休息 · 恢复 30 生命", supply:"领取补给 · 24 纸币", shop:"手工社交换铺", shopNote:"每件强化 30 纸币。买一件后出发，也可以直接离开。", leave:"不购买，继续前进", event:"风中的迎新手册", eventNote:"搭档发现一叠卡在栏杆外的散页。你们决定怎么取回它？", help:"一起整理 · 恢复 12 生命，获得 10 纸币", risk:"翻过栏杆 · 消耗 10 生命，选择一件强化", abandon:"结束这次远征", confirm:"结束当前远征？本局强化会清空，已获得的成长和学习记录保留。", saved:"进度自动保存，可以随时离开", volatile:"本机存储不可用，进度仅在当前页面保留。请勿刷新。", damaged:"上次远征存档不完整，已保留可读取的长期成长，请重新出发。", phase2:"第二阶段 · 灯影蓄力！注意防守", elite:"精英", boss:"首领", battle:"战斗", eventLabel:"事件", restLabel:"休整", shopLabel:"商店", routeNote:"同一行任选一站，走过后不再返回。", newNote:"9 站路线 · 随机强化 · 随时续玩", world:"风把迎新手册吹进两座城市。沿途找回声页，用不同的强化搭配唤醒守灯的纸怪。", atEnd:"最后一站", speed:"准确优先，速度最多额外 +4 伤害", pending:"练习记录暂未同步，请保持页面打开后重试。", retrySync:"重试同步", noData:"词汇资源未准备好，请返回后重试。", full:"生命已满", cardKind:{combo:"连击",pierce:"破盾",guard:"防反"}, intents:{shield:"撑盾 · 破盾招式更有效",charge:"蓄力重击 · 防守能减少伤害",rush:"抢先突进 · 速攻命中弱点",confuse:"原文与释义交替 · 看清题目，防守反击",echo:"伞翼回声 · 破盾招式命中弱点",strike:"横扫预警 · 速攻命中弱点"}
  };
  const TH = {
    title:"ผจญภัยสองเมือง", sub:"เมืองหน้ากระดาษ · บทนำโร้กไลต์", start:"เริ่มการผจญภัย", resume:"ผจญภัยต่อ", fresh:"ออกเดินทางอีกครั้ง", map:"สมุดเส้นทาง", step:"จุด", back:"บันทึกและออก", level:"เลเวลผจญภัย", xp:"ค่าประสบการณ์", coins:"เหรียญกระดาษ", hp:"พลังชีวิต", shield:"โล่", build:"พลังเสริมรอบนี้", empty:"ยังไม่มีพลังเสริม ชนะการต่อสู้เพื่อเลือกชุดพลัง", prepare:"รู้จักคำกลุ่มนี้ก่อน", prepareNote:"ฟังซ้ำได้ตามต้องการ พร้อมแล้วค่อยต่อสู้ คำใหม่จะไม่โผล่ในโจทย์โดยไม่สอนก่อน", ready:"พร้อมแล้ว เข้าสู่การต่อสู้", listen:"ฟังตัวอย่าง", read:"คำนี้หมายความว่าอะไร?", recall:"เลือกคำที่ตรงกับความหมาย", hearing:"ฟังเสียง แล้วเลือกความหมาย", replay:"เล่นเสียงโจทย์", hint:"ดูคำ · ไม่รับโบนัสความเร็วและการฟัง", hintShown:"แสดงคำแล้ว ข้อนี้ไม่มีโบนัสความเร็วและการฟัง", loading:"กำลังเล่นเสียงตัวอย่าง…", audioError:"เสียงยังใช้ไม่ได้ ลองเล่นซ้ำหรือดูคำเพื่อเล่นต่อ โดยไม่เสียพลังชีวิต", rush:"บุกเร็ว", pierce:"เจาะโล่", guard:"ตั้งรับ", styleNote:"ดูสัญญาณของมอนสเตอร์แล้วเลือกท่า ตอบถูกจึงโจมตีได้", correct:"โจมตีโดน", wrong:"ข้อนี้ยังไม่ถูก", next:"เทิร์นถัดไป", claim:"เลือกพลังเสริมรอบนี้", rewardNote:"เลือกหนึ่งจากสาม ใช้ได้จนจบการผจญภัย รีเฟรชไม่เปลี่ยนตัวเลือก", defeated:"ปราบสำเร็จ! เลือกพลังเสริม", lost:"กลับไปพักที่โรงเรียนก่อน", won:"เวทีโคมกระดาษสว่างอีกครั้ง", resultNote:"พลังเสริมรอบนี้สิ้นสุด แต่เลเวลผจญภัยและประวัติฝึกคำศัพท์ยังอยู่", review:"ทบทวนคำที่พลาดรอบนี้", practice:"คำตอบ", unique:"คำที่ตอบถูกรอบนี้", noWrong:"รอบนี้ไม่มีคำที่ต้องทบทวน", rest:"จุดพักหลังเลิกเรียน", restNote:"ชายังอุ่นอยู่ พักสักนิดหรือรับเหรียญสำหรับจุดถัดไป", heal:"พัก · ฟื้นพลังชีวิต 30", supply:"รับเสบียง · 24 เหรียญ", shop:"ร้านชมรมงานฝีมือ", shopNote:"พลังเสริมชิ้นละ 30 เหรียญ ซื้อหนึ่งชิ้นแล้วไปต่อ หรือออกได้ทันที", leave:"ไม่ซื้อ เดินทางต่อ", event:"คู่มือต้อนรับกลางสายลม", eventNote:"คู่หูพบหน้ากระดาษติดอยู่นอกรั้ว คุณจะช่วยกันเก็บอย่างไร?", help:"ช่วยกันจัด · ฟื้นชีวิต 12 และรับ 10 เหรียญ", risk:"ข้ามรั้ว · เสียพลังชีวิต 10 เพื่อเลือกพลังเสริม", abandon:"จบการผจญภัยรอบนี้", confirm:"จบรอบนี้หรือไม่? พลังเสริมจะหายไป แต่ค่าประสบการณ์และประวัติการเรียนยังอยู่", saved:"บันทึกอัตโนมัติ ออกได้ทุกเมื่อ", volatile:"พื้นที่เก็บข้อมูลใช้ไม่ได้ เก็บได้เฉพาะหน้านี้ กรุณาอย่ารีเฟรช", damaged:"บันทึกรอบก่อนเสียหาย เก็บค่าประสบการณ์ที่อ่านได้แล้ว กรุณาเริ่มใหม่", phase2:"ช่วงที่สอง · เงาโคมสะสมพลัง! เตรียมตั้งรับ", elite:"ชั้นยอด", boss:"บอส", battle:"ต่อสู้", eventLabel:"เหตุการณ์", restLabel:"พัก", shopLabel:"ร้านค้า", routeNote:"เลือกหนึ่งจุดในแถว เมื่อผ่านแล้วจะย้อนกลับไม่ได้", newNote:"9 จุด · พลังเสริมแบบสุ่ม · บันทึกเล่นต่อได้", world:"ลมพาคู่มือต้อนรับกระจายไปสองเมือง ตามเก็บหน้ากระดาษเสียงและจับคู่พลังเสริมเพื่อปลุกผู้เฝ้าโคม", atEnd:"จุดสุดท้าย", speed:"ความถูกต้องมาก่อน ความเร็วเพิ่มดาเมจไม่เกิน 4", pending:"ยังซิงก์ประวัติฝึกไม่สำเร็จ เปิดหน้านี้ไว้แล้วลองใหม่", retrySync:"ลองซิงก์อีกครั้ง", noData:"คำศัพท์ยังไม่พร้อม กรุณากลับแล้วลองใหม่", full:"พลังชีวิตเต็ม", cardKind:{combo:"คอมโบ",pierce:"เจาะโล่",guard:"สวนกลับ"}, intents:{shield:"ตั้งโล่ · ใช้ท่าเจาะโล่",charge:"สะสมพลังโจมตีหนัก · ตั้งรับเพื่อลดความเสียหาย",rush:"พุ่งเข้าหา · บุกเร็วตรงจุดอ่อน",confuse:"สลับคำกับความหมาย · อ่านโจทย์แล้วตั้งรับ",echo:"เสียงก้องปีกร่ม · ท่าเจาะโล่ตรงจุดอ่อน",strike:"เตรียมกวาดโจมตี · บุกเร็วตรงจุดอ่อน"}
  };
  let active = null;
  const WORLD=root.HUILAISHI_ROGUE_WORLD;
  const P=root.XULONG_EXPEDITION_PRESENTATION;
  const EXTRA={
    zh:{destination:'选择远征区域',vocabulary:'词汇远征',sentences:'长句理解',sentencePrompt:'这句话表达了什么？',sentenceNote:'长句为待母语复核的编辑稿，当前只练阅读理解，尚未配音；不计入词汇掌握或发音成绩。',readingNote:'拼读只作辅助，发音请听示范。',content:'本区题库',wordPairs:'独立词对',sentenceCount:'长句',roster:'怪物配置',difficulty:'语言难度',changeRegion:'选择其他区域',premium:'需完整冒险权限',growth:'每升一级，下次远征初始生命 +2（最高 +18）；本局强化不带入下一局。',clears:'远征通关',maxLevel:'已达等级上限',nextLevel:'距下一级',skillCounter:'克制招式',collection:'探索收藏'},
    th:{destination:'เลือกพื้นที่ผจญภัย',vocabulary:'ฝึกคำศัพท์',sentences:'เข้าใจประโยคยาว',sentencePrompt:'ประโยคนี้สื่อความหมายว่าอย่างไร?',sentenceNote:'ประโยคฉบับรอตรวจโดยเจ้าของภาษา ฝึกอ่านเท่านั้น ยังไม่มีเสียง และไม่รวมในคะแนนจำคำศัพท์หรือการออกเสียง',readingNote:'คำอ่านเป็นตัวช่วย โปรดฟังเสียงตัวอย่าง',content:'คลังโจทย์พื้นที่นี้',wordPairs:'คู่คำไม่ซ้ำ',sentenceCount:'ประโยคยาว',roster:'รูปแบบมอนสเตอร์',difficulty:'ระดับภาษา',changeRegion:'เลือกพื้นที่อื่น',premium:'ต้องมีสิทธิ์ผจญภัยเต็มรูปแบบ',growth:'แต่ละเลเวลเพิ่มชีวิตเริ่มรอบถัดไป 2 (สูงสุด 18) พลังเสริมรอบนี้ไม่ย้ายไปรอบหน้า',clears:'รอบที่ผ่าน',maxLevel:'เลเวลสูงสุดแล้ว',nextLevel:'อีกเท่าไรถึงเลเวลถัดไป',skillCounter:'ท่าแก้ทาง',collection:'สิ่งที่ค้นพบ'}
  };
  const wordText = (s,w,target=true) => w?.[(s.dir === "zh-th") === target ? "th" : "zh"] || "";
  const text = s => {
    const zh=s.dir==='zh-th',c={...(zh?ZH:TH),...EXTRA[zh?'zh':'th']};
    c.won=zh?'这片街区，重新亮起':'ย่านนี้กลับมาสว่างอีกครั้ง';
    c.phase2=zh?'第二阶段 · 首领蓄力！注意防守':'ช่วงที่สอง · บอสสะสมพลัง! เตรียมตั้งรับ';
    if(s.kind==='sentences'){
      c.prepare=zh?'先读懂这组长句':'อ่านประโยคกลุ่มนี้ให้เข้าใจก่อน';c.prepareNote=c.sentenceNote;
      c.unique=zh?'本局理解长句':'ประโยคที่เข้าใจรอบนี้';c.review=zh?'复习本局错句':'ทบทวนประโยคที่พลาด';c.noWrong=zh?'本局没有待复习错句':'รอบนี้ไม่มีประโยคที่ต้องทบทวน';
    }
    return P.copy(s,c);
  };
  const name = (s,item) => item?.[s.dir === "zh-th" ? "zh" : "th"] || "";
  function save(s) {
    if (s.rehearsal) { s.durable = true; return; }
    try { const value = JSON.stringify(s.state); s.storage?.setItem(s.key,value); s.durable = Boolean(s.storage?.persistent !== false && s.storage?.getItem(s.key) === value); }
    catch (_) { s.durable = false; }
  }
  function flushLearning(s) {
    const event = s.state.run?.pendingLearning;
    if (!event) return true;
    try {
      if (!s.rehearsal && !s.learn?.(event.word,event.correct,`rogue:${event.id}`)) return false;
      s.state.run.pendingLearning = null; save(s); return true;
    } catch (_) { return false; }
  }
  function button(action,label,extra="",primary=false) { return `<button type="button" class="rx-button${primary ? " rx-primary" : ""}" data-rx="${action}" ${extra}>${esc(label)}</button>`; }
  function bg(s) {
    const floor = s.state.run?.floor || 0;
    const profile=WORLD?.profile(s.lobby?s.profile:s.state.run?.profile);
    const themed=root.XULONG_EXPEDITION_THEMES?.theme(s.guided?(s.dir==='zh-th'?'theme-th-nightmarket':'theme-cn-bookstreet'):profile?.id);
    if(themed?.scenes?.length)return themed.scenes[Math.min(2,Math.floor(floor/3))];
    const chapter=profile?.sceneChapter||1;
    return root.HUILAISHI_WORLD_ATLAS?.chapter(s.dir,chapter)?.[Math.min(2,Math.floor(floor/3))]?.art || s.journey.art;
  }
  function meter(value,max,label,kind="") { return `<div class="rx-meter ${kind}" role="meter" aria-label="${esc(label)}" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${value}"><i style="width:${Math.min(100,value/max*100)}%"></i></div>`; }
  function header(s) {
    const c=text(s),r=s.lobby&&['won','lost'].includes(s.state.run?.phase)?null:s.state.run;
    return `<header class="rx-hud"><span><small>${c.level}</small><b>Lv.${M.level(s.state.meta)}</b></span>${r ? `<span><small>${c.hp}</small><b>${r.hp}/${r.maxHp}</b>${meter(r.hp,r.maxHp,c.hp)}</span><span><small>${c.coins}</small><b>${r.coins}</b></span>` : `<span><small>${c.xp}</small><b>${s.state.meta.xp}</b></span>`}<span class="rx-save ${s.durable ? "" : "rx-warning"}" role="status">${s.durable ? c.saved : c.volatile}</span></header>`;
  }
  function relicList(s) {
    const c=text(s),r=s.state.run;
    if (!r) return "";
    return `<details class="rx-inventory"><summary>${c.build} · ${r.relics.length}/12</summary><div>${r.relics.length ? r.relics.map(id=>{const relic=M.relics.find(x=>x.id===id);return `<p><b>${esc(name(s,relic))}</b> — ${esc(relic[s.dir==="zh-th"?"descZh":"descTh"])}</p>`;}).join("") : c.empty}</div></details>`;
  }
  function lobby(s) {
    const c=text(s),r=s.state.run,ongoing=r && !["won","lost"].includes(r.phase);
return `<section class="rx-cover" style="--rx-scene:url('${esc(bg(s))}')"><div class="rx-cover-copy"><span class="rx-kicker">${esc(name(s,WORLD?.profile(s.profile)))||c.sub}</span><h3>${c.title}</h3><p>${c.world}</p><small>${c.newNote}</small>${button(ongoing?"resume":"start",ongoing?c.resume:c.start,"",true)}${ongoing?button("abandon",c.abandon):""}</div><img src="${esc(s.hero.art)}" alt="" class="rx-cover-hero" decoding="async"></section>${!ongoing?`<details class="rx-route-settings" ${s.routeSettingsOpen?'open':''}><summary>${c.changeRegion}</summary>${destination(s)}</details>`:''}${P.journal(s)}${P.wardrobe(s)}${P.bestiary(s)}${growth(s)}${s.rejected?`<p class="rx-warning" role="status">${c.damaged}</p>`:""}`;
  }
  function destination(s){
    const c=text(s),p=WORLD.profile(s.profile),data=WORLD.pool(s.profile,s.kind),metrics=WORLD.metrics();
    return `<section class="rx-destination"><label for="rx-region">${c.destination}</label><select id="rx-region" data-rx-region>${WORLD.profiles().filter(p=>!p.direction||p.direction===s.dir).map(p=>`<option value="${p.id}" ${p.id===s.profile?'selected':''}>L${p.level} · ${esc(name(s,p))}${s.canEnter?.(p)===false?` · ${c.premium}`:''}</option>`).join('')}</select><div class="rx-kind">${button('kind',c.vocabulary,`data-value="words" aria-pressed="${s.kind==='words'}"`)}${button('kind',c.sentences,`data-value="sentences" aria-pressed="${s.kind==='sentences'}" ${p.level<3?'disabled':''}`)}</div><p>${c.content} · ${data.length} ${s.kind==='sentences'?c.sentenceCount:c.wordPairs} · ${p.monsterIds.length} ${c.roster}</p><small>${metrics.regions} ${s.dir==='zh-th'?'区域':'พื้นที่'} · ${metrics.monsterConfigurations} ${c.roster}</small>${s.kind==='sentences'?`<p class="rx-warning">${c.sentenceNote}</p>`:''}</section>`;
  }
  function growth(s){const c=text(s),m=s.state.meta,l=M.level(m);return `<section class="rx-growth"><b>Lv.${l} · ${c.clears} ${m.wins} · ${c.collection} ${m.discoveries.length}</b><small>${l===10?c.maxLevel:`${c.nextLevel} ${120-m.xp%120} XP`}</small>${meter(l===10?120:m.xp%120,120,c.xp)}<p>${c.growth}</p></section>`;}
  function intentText(s){const c=text(s),i=M.intent(s.state.run);return i?.kind==='mechanic'?P.intent(s,i):i?.kind==='skill'?`${s.dir==='zh-th'?i.nameZh:i.nameTh} · ${c.skillCounter}：${c[i.weak]}`:c.intents[i?.kind]||'';}
  function mapMarkup(s) {
    const c=text(s),r=s.state.run,rows=M.route(r.seed,r.profile);
    const titles={battle:c.battle,elite:c.elite,boss:c.boss,rest:c.restLabel,shop:c.shopLabel,event:c.eventLabel};
    return `<div class="rx-map-head"><span class="rx-kicker">${esc(name(s,WORLD.profile(s.state.run?.profile||s.profile)))} · ${r.floor+1}/9</span><h3 tabindex="-1" data-rx-focus>${c.map}</h3><p>${c.routeNote}</p></div><ol class="rx-route">${rows.map((row,i)=>`<li class="${i===r.floor?"rx-current":i<r.floor?"rx-passed":"rx-future"}"><span class="rx-stop">${String(i+1).padStart(2,"0")}</span><div class="rx-branches">${row.map(n=>`<button type="button" data-rx="node" data-value="${n.id}" ${i!==r.floor?"disabled":""} class="rx-node rx-${n.type} ${r.visited.includes(n.id)?"rx-chosen":""}"><span class="rx-node-glyph" aria-hidden="true">${({battle:"×",elite:"✦",boss:"♛",event:"?",rest:"＋",shop:"¤"})[n.type]}</span><span><small>${titles[n.type]}${r.visited.includes(n.id)?" ✓":""}</small><b>${esc(n.enemy?name(s,s.monsters.find(m=>m.id===n.enemy)):n.type==="event"?c.event:n.type==="rest"?c.rest:c.shop)}</b></span></button>`).join("")}</div></li>`).join("")}</ol>`;
  }
  function wordsMarkup(s,ids) {
    const c=text(s);
    return `<div class="rx-lesson-words">${ids.map(id=>{const w=s.words.get(id);return `<article class="${w?.kind==='sentence'?'rx-long-lesson':''}"><b lang="${s.dir==="zh-th"?"th":"zh-CN"}">${esc(wordText(s,w))}</b><span>${esc(wordText(s,w,false))}</span><small>${esc(s.dir==="zh-th"?(w?.thReading?.romanTone||w?.ro||""):(w?.py||""))}</small>${w?.kind==='sentence'?'':button("word",c.listen,`data-value="${id}"`)}</article>`;}).join("")}</div><small>${s.kind==='sentences'?c.sentenceNote:c.readingNote}</small><p class="rx-audio-status" role="status"></p>`;
  }
  function preparation(s) {
    const c=text(s),r=s.state.run;
    return `${arena(s)}<section class="rx-paper"><span class="rx-kicker">${c.prepare}</span><h3 tabindex="-1" data-rx-focus>${esc(name(s,s.monsters.find(m=>m.id===r.enemy.id)))}</h3><p>${c.prepareNote}</p>${P.brief(s)}${wordsMarkup(s,r.lesson)}${button("ready",c.ready,"",true)}</section>`;
  }
  function arena(s) {
    const c=text(s),r=s.state.run,e=r?.enemy,foe=s.monsters.find(m=>m.id===e?.id);
    if(!e || !foe)return "";
    const f=r.phase==="feedback"?r.feedback:null;
    const heroPose=f?(f.defeated?"victory":f.correct?"recover":"hit"):"idle",enemyPose=f?(f.correct?"hit":"strike"):"idle";
    return `<section class="rx-arena ${f?(f.correct?"rx-impact":"rx-counter"):""} ${e.special?"rx-themed-arena":""}" style="--rx-scene:url('${esc(bg(s))}')" aria-label="${esc(name(s,foe))}"><div class="rx-enemy-bar"><b>${esc(name(s,foe))}${(e.boss||e.id==="lantern")?` · ${e.phase}/2`:""}</b><span>${Math.ceil(e.hp)}/${e.maxHp}${e.shield?` · ${c.shield} ${e.shield}`:""}</span>${meter(e.hp,e.maxHp,name(s,foe),"rx-enemy-meter")}</div><img class="rx-actor rx-hero" src="${esc(s.hero.frames?.[heroPose]||s.hero.art)}" alt="" decoding="async"><img class="rx-actor rx-foe" src="${esc(foe.frames?.[enemyPose]||foe.art)}" alt="" decoding="async">${P.satellites(s)}${f?`<span class="rx-hit-number ${f.correct?"":"rx-miss"}" aria-hidden="true">${f.correct?`−${f.damage}`:"!"}</span>`:""}<div class="rx-arena-caption">${f?.phaseChanged?esc(e.special?P.phase(s):c.phase2):esc(intentText(s))}</div></section>`;
  }
  function sceneShell(s,prompt,dock) {
    const c=text(s),r=s.state.run;
    return `<div class="rx-cinema" data-enemy="${esc(r.enemy.id)}" data-cast="${s.castSlot||0}">${arena(s)}<div class="rx-scene-hud">${header(s)}</div><section class="rx-scene-prompt">${prompt}</section><div class="rx-scene-targets">${P.targets(s)}</div><section class="rx-scene-dock">${dock}</section></div>`;
  }
  function battleMarkup(s) {
    const c=text(s),r=s.state.run,q=r.question,w=s.words.get(q.target),mode=q.mode;
    const shown=mode!=="listen"||s.assisted;
    const prompt=`<span class="rx-scene-chapter">${s.guided?(s.dir==='zh-th'?'新手引导 · 第一张声页':'คำแนะนำเริ่มต้น · หน้ากระดาษแผ่นแรก'):(s.dir==='zh-th'?'言术':'พลังภาษา')} · ${r.enemy.turn+1}</span><p>${r.kind==='sentences'?c.sentencePrompt:mode==="listen"?c.hearing:mode==="recall"?c.recall:c.read}</p><h3 tabindex="-1" data-rx-focus lang="${mode==="recall"?(s.dir==="zh-th"?"zh-CN":"th"):(s.dir==="zh-th"?"th":"zh-CN")}">${shown?esc(wordText(s,w,mode!=="recall")):"♪"}</h3>${mode==="listen"?`<div class="rx-audio-controls">${button("audio",c.replay)}${!s.assisted?button("hint",s.dir==='zh-th'?'看文字提示':'ดูคำใบ้'):`<small>${c.hintShown}</small>`}</div><p class="rx-audio-status" role="status"></p>`:""}`;
    const dock=`<div class="rx-command-line"><div class="rx-styles" role="group" aria-label="${esc(c.styleNote)}">${["rush","pierce","guard"].map(id=>`<button type="button" data-rx="style" data-value="${id}" aria-pressed="${s.style===id}"><span aria-hidden="true">${P.icon(id)}</span>${c[id]}</button>`).join("")}</div><span class="rx-combo">${r.combo} <small>COMBO</small></span></div><div class="rx-answers rx-voice-pages" aria-label="${s.dir==='zh-th'?'点击声页，施放言术':'เลือกหน้ากระดาษเพื่อใช้พลังภาษา'}">${q.options.map((id,i)=>`<button type="button" class="rx-button rx-voice-page" data-rx="answer" data-slot="${i}" data-value="${id}" data-question="${esc(q.id)}" ${mode==="listen"&&!s.heard&&!s.assisted?"disabled":""}><small aria-hidden="true">0${i+1}</small><span lang="${mode==='recall'?(s.dir==='zh-th'?'th':'zh-CN'):(s.dir==='zh-th'?'zh-CN':'th')}">${esc(wordText(s,s.words.get(id),mode==="recall"))}</span><i aria-hidden="true">↗</i></button>`).join("")}</div><small class="rx-scene-note">${mode==='listen'&&!s.heard&&!s.assisted?(s.dir==='zh-th'?'先播放声音，或看文字提示。不方便听也能继续。':'ฟังเสียงก่อน หรือเปิดคำใบ้เพื่อเล่นต่อได้'):(s.dir==='zh-th'?'点选声页 → 答对发动招式 · 准确优先':'เลือกหน้ากระดาษ → ตอบถูกเพื่อใช้ท่า · ความถูกต้องมาก่อน')}</small>`;
    return sceneShell(s,prompt,dock);
  }
  function feedback(s) {
    const c=text(s),r=s.state.run,f=r.feedback;
    const prompt=`<span class="rx-scene-chapter">${s.dir==='zh-th'?'声页回应':'เสียงตอบรับ'}</span><h3 tabindex="-1" data-rx-focus>${f.defeated?(s.dir==='zh-th'?'封锁解除':'คลายการปิดกั้น'):f.correct?c.correct:c.wrong}</h3><p class="rx-answer-reveal"><b lang="${s.dir==='zh-th'?'th':'zh-CN'}">${esc(wordText(s,s.words.get(f.word)))}</b><span lang="${s.dir==='zh-th'?'zh-CN':'th'}">${esc(wordText(s,s.words.get(f.word),false))}</span></p>`;
    const dock=`<div class="rx-scene-feedback ${f.correct?'rx-good':'rx-retry'}">${P.feedback(s)}<div class="rx-result-numbers"><span>${c.correct} −${f.damage}</span>${f.shieldDamage?`<span>${c.shield} −${f.shieldDamage}</span>`:""}<span>${c.hp} −${f.counter}</span>${f.blocked?`<span>${c.shield} −${f.blocked}</span>`:""}</div><div class="rx-feedback-actions">${r.kind==='sentences'?`<small>${c.sentenceNote}</small>`:button("word",c.listen,`data-value="${f.word}"`)}${button("next",r.hp===0?c.lost:f.defeated?(r.floor===8?c.won:c.claim):c.next,"",true)}</div><p class="rx-audio-status" role="status"></p>${r.pendingLearning?`<p class="rx-warning" role="status">${c.pending}</p>${button("sync",c.retrySync)}`:""}</div>`;
    return sceneShell(s,prompt,dock);
  }
  function reward(s,shop=false) {
    const c=text(s),r=s.state.run;
    return `<section class="rx-paper rx-reward"><span class="rx-kicker">${shop?c.shop:c.claim}</span><h3 tabindex="-1" data-rx-focus>${shop?c.shop:c.defeated}</h3><p>${shop?c.shopNote:c.rewardNote}</p><div class="rx-relics">${r.reward.map(id=>{const x=M.relics.find(v=>v.id===id);return `<button type="button" data-rx="${shop?"room":"reward"}" data-value="${id}" class="rx-relic rx-build-${x.build}" ${shop&&r.coins<30?"disabled":""}><span class="rx-relic-icon" aria-hidden="true">${({combo:"↗",pierce:"◇",guard:"⬡"})[x.build]}</span><small>${c.cardKind[x.build]}</small><b>${esc(name(s,x))}</b><span>${esc(x[s.dir==="zh-th"?"descZh":"descTh"])}</span>${shop?`<em>30 ${c.coins}</em>`:""}</button>`;}).join("")}</div>${shop?button("room",c.leave,'data-value="leave"'):""}</section>`;
  }
  function peaceful(s) {
    const c=text(s),r=s.state.run,event=r.phase==="event";
    return `<section class="rx-rest-scene" style="--rx-scene:url('${esc(bg(s))}')"></section><section class="rx-paper"><span class="rx-kicker">${esc(name(s,WORLD.profile(s.state.run?.profile||s.profile)))}</span><h3 tabindex="-1" data-rx-focus>${event?c.event:c.rest}</h3><p>${event?c.eventNote:c.restNote}</p><div class="rx-room-actions">${event?`${button("room",c.help,'data-value="help"',true)}${button("room",c.risk,`data-value="risk" ${r.hp<=10?"disabled":""}`)}`:`${button("room",c.heal,`data-value="heal" ${r.hp===r.maxHp?"disabled":""}`,true)}${button("room",c.supply,'data-value="supply"')}`}</div></section>`;
  }
  function result(s) {
    const c=text(s),r=s.state.run;
    return `<section class="rx-paper rx-summary"><span class="rx-kicker">${r.phase==="won"?"CHAPTER CLEAR":"TO BE CONTINUED"}</span><h3 tabindex="-1" data-rx-focus>${r.phase==="won"?c.won:c.lost}</h3><p>${c.resultNote}</p><div class="rx-summary-grid"><span><b>+${r.xp}</b>${c.xp}</span><span><b>${r.correct}/${r.answers}</b>${c.practice}</span><span><b>${r.correctIds.length}</b>${c.unique}</span></div>${r.wrongIds.length?`<h4>${c.review}</h4>${wordsMarkup(s,r.wrongIds)}`:`<p>${c.noWrong}</p>`}${growth(s)}${button("destination",c.changeRegion,"",true)}</section>`;
  }
  function render(s,focus=true) {
    if(active!==s||!s.stage.isConnected)return;
    const focused=document.activeElement?.closest?.('[data-rx]');
    const focusAction=focused?.dataset.rx,focusValue=focused?.dataset.value;
    s.routeSettingsOpen=s.stage.querySelector('.rx-route-settings')?.open||false;
    P.cancel(s);
    const c=text(s),r=s.state.run;
    s.hero=root.XULONG_EXPEDITION_THEMES?.hero(s.baseHero,s.guided?(s.dir==='zh-th'?'theme-th-nightmarket':'theme-cn-bookstreet'):s.lobby?s.profile:r?.profile,s.classic)||s.baseHero;
    let content;
    if(s.lobby)content=lobby(s);
    else if(!r)content=lobby(s);
    else if(r.phase==="map")content=mapMarkup(s);
    else if(r.phase==="prepare")content=preparation(s);
    else if(r.phase==="battle")content=battleMarkup(s);
    else if(r.phase==="feedback")content=feedback(s);
    else if(r.phase==="reward"||r.phase==="shop")content=reward(s,r.phase==="shop");
    else if(r.phase==="rest"||r.phase==="event")content=peaceful(s);
    else content=result(s);
    s.sheet.dataset.arcadePhase="rogue";
    s.sheet.dataset.roguePhase=s.lobby?'lobby':r?.phase||'lobby';
    const guidedDone = s.guided && r?.floor >= 1;
    if (guidedDone) content = guideFinished(s);
    if (s.guided && r?.phase==='lost') content = `<section class="rx-paper"><h3 tabindex="-1" data-rx-focus>${s.dir==='zh-th'?'没关系，再练一次':'ไม่เป็นไร ลองฝึกอีกครั้ง'}</h3><p>${s.dir==='zh-th'?'先回顾词义，再试试防守和破盾。没有次数限制，也不会扣除已有的成长。':'ทบทวนความหมายแล้วลองตั้งรับหรือเจาะโล่ ไม่มีจำกัดครั้ง และไม่หักความก้าวหน้าเดิม'}</p>${wordsMarkup(s,r.lesson)}${button('guide-retry',s.dir==='zh-th'?'重新演练第一场':'ลองฉากแรกอีกครั้ง','',true)}</section>`;
    const cinematic=!s.lobby&&!guidedDone&&['battle','feedback'].includes(r?.phase);
    const markup=`<div class="rx-app ${cinematic?'rx-immersive':''}" data-kind="${s.kind}" data-speech-policy="none" data-phase="${guidedDone?"guide-complete":s.lobby?"lobby":r?.phase||"lobby"}">${s.rehearsal?`<p class="rx-tutorial-label">${s.dir==='zh-th'?'新手演练 · 不修改远征与学习记录':'บทฝึกเริ่มต้น · ไม่เปลี่ยนเซฟหรือบันทึกการเรียน'}</p>`:cinematic?'':header(s)}${s.guided&&!guidedDone&&!cinematic?guideRail(s):''}${content}${!s.lobby&&!s.guided?relicList(s):""}<footer class="rx-footer">${button("exit",s.rehearsal?(s.dir==='zh-th'?'结束演练':'จบบทฝึก'):s.guided?(s.dir==='zh-th'?'先退出，下次继续':'ออกก่อน แล้วกลับมาเล่นต่อ'):c.back)}</footer></div>`;
    // Reuse the current arena and decoded actors across question/feedback changes.
    // The data model still settles each answer exactly once before presentation.
    const previous=s.stage.querySelector('.rx-cinema');
    if(cinematic&&previous?.dataset.enemy===r.enemy.id&&document.createElement){
      const template=document.createElement('template');template.innerHTML=markup;
      const next=template.content.querySelector('.rx-arena'),old=previous.querySelector('.rx-arena');
      for(const selector of ['.rx-hero','.rx-foe']){
        const image=old.querySelector(selector),replacement=next.querySelector(selector);
        if(image&&replacement){image.setAttribute('src',replacement.getAttribute('src'));replacement.replaceWith(image);}
      }
      old.className=next.className;old.style.cssText=next.style.cssText;old.replaceChildren(...next.childNodes);next.replaceWith(old);
      s.stage.replaceChildren(template.content);
    }else s.stage.innerHTML=markup;
    fitScene(s);
    P.preload(s);
    if(focus) { s.sheet.scrollTop=0; s.stage.querySelector("[data-rx-focus]")?.focus({preventScroll:true}); }
    else if(focusAction){Array.from(s.stage.querySelectorAll('[data-rx]')).find(b=>b.dataset.rx===focusAction&&b.dataset.value===focusValue)?.focus({preventScroll:true});}
    if(r?.phase==="battle"&&s.lastQuestion!==r.question.id){s.lastQuestion=r.question.id;s.started=performance.now()+240;s.assisted=false;s.heard=false;}
  }
  function fitScene(s){
    const scene=s.stage.querySelector('.rx-cinema'),prompt=scene?.querySelector('.rx-scene-prompt');
    if(scene&&prompt)scene.style.setProperty('--rx-prompt-height',prompt.offsetHeight+'px');
  }
  function guideRail(s) {
    const phase=s.state.run?.phase,zh=s.dir==='zh-th';
    const at=phase==='prepare'?0:phase==='reward'?2:1;
    const steps=zh?['先认 3 个词','答对就能攻击','选一件强化']:['รู้จัก 3 คำ','ตอบถูกเพื่อโจมตี','เลือกพลังเสริม'];
    const tip=at===0?(zh?'可先听示范音。记住意思，再开始；没有倒计时。':'ฟังเสียงตัวอย่างแล้วจำความหมาย ค่อยเริ่มได้ ไม่มีเวลาจำกัด'):at===1?(zh?'看清题目，选择对应意思。听不方便时可以看文字提示。':'อ่านโจทย์แล้วเลือกความหมาย ถ้าฟังไม่สะดวก เปิดคำใบ้ได้'):(zh?'强化影响接下来的战斗，只在本次远征有效。':'พลังเสริมช่วยการต่อสู้ถัดไป มีผลเฉพาะรอบนี้');
    return `<aside class="rx-tutorial" aria-label="${zh?'新手引导':'คำแนะนำเริ่มต้น'}"><ol>${steps.map((label,i)=>`<li ${i===at?'aria-current="step"':''}><b>${i+1}</b>${label}</li>`).join('')}</ol><p>${tip}</p></aside>`;
  }
  function guideFinished(s) {
    const zh=s.dir==='zh-th',r=s.state.run,relic=M.relics.find(x=>x.id===r.relics[r.relics.length-1]);
    return `<section class="rx-paper rx-guide-finished rx-letter-finished"><span class="rx-kicker">${zh?'序章完成 · 声页 01':'ผ่านบทนำ · หน้ากระดาษ 01'}</span><img src="${esc(s.hero.frames?.victory||s.hero.art)}" width="160" height="180" alt=""><h3 tabindex="-1" data-rx-focus>${zh?'第一张声页，到手！':'ได้หน้ากระดาษแผ่นแรกแล้ว!'}</h3><blockquote class="rx-lover-letter"><small>${zh?'来自 CHANINDA':'จาก 小艾'}</small><p>${zh?'「小艾，我也在找你。这里的人说中文，我会学会它。等我们再见面，就没有听不懂的话了。」':'“CHANINDA ฉันก็กำลังตามหาเธอ คนที่นี่พูดภาษาไทย ฉันจะเรียนรู้มัน เมื่อเราพบกันอีก เราจะเข้าใจกันมากขึ้น”'}</p><span>${zh?'另一边的字，终于有了温度。':'ตัวอักษรจากอีกโลกส่งความอบอุ่นมาแล้ว'}</span></blockquote><p>${zh?'你已经学过 3 个词，完成了一场战斗。':'รู้จัก 3 คำและผ่านการต่อสู้ครั้งแรกแล้ว'}</p><p><b>${esc(name(s,relic))}</b> · ${esc(relic?.[zh?'descZh':'descTh']||'')}</p><small>${s.rehearsal?(zh?'这是独立演练，原来的进度没有改变。':'นี่คือบทฝึกแยก ความคืบหน้าเดิมไม่เปลี่ยน'):(s.durable?(zh?'强化和路线已记录；回到营地，随时继续第 2 站。':'บันทึกพลังเสริมและเส้นทางแล้ว กลับฐานแล้วเล่นจุดที่ 2 ต่อได้'):(zh?'本次仅临时保存，关闭页面可能丢失进度。':'รอบนี้บันทึกชั่วคราว ปิดหน้าแล้วความคืบหน้าอาจหาย'))}</small>${button('guide-done',zh?'带着留言，回到营地':'เก็บข้อความแล้วกลับฐาน','',true)}</section>`;
  }
  function resetQuestion(s) { s.lastQuestion=null;s.heard=false;s.assisted=false;s.style="rush";s.audioAttempts=0; }
  function stopAudio(s) { s.audioToken++;clearTimeout(s.audioTimeout);try{root.HUILAISHI_SPEECH?.stop?.();}catch(_){} }
  async function play(s,id,isQuestion=false) {
    stopAudio(s);
    const token=s.audioToken,c=text(s),status=s.stage.querySelector(".rx-audio-status");
    let completed=false;
    if(status)status.textContent=c.loading;
    if(isQuestion){
      s.audioAttempts=(s.audioAttempts||0)+1;
      if(s.audioAttempts>1){s.state.run.question.speedEligible=false;save(s);}
      s.heard=false;s.stage.querySelectorAll('[data-rx="answer"]').forEach(b=>b.disabled=!s.assisted);
    }
    const done=ok=>{
      if(active!==s||s.audioToken!==token||completed)return;
      completed=true;
      clearTimeout(s.audioTimeout);
      if(!ok)stopAudio(s);
      if(status?.isConnected)status.textContent=ok?"":c.audioError;
      if(ok&&isQuestion){s.heard=true;s.started=performance.now();s.stage.querySelectorAll('[data-rx="answer"]').forEach(b=>b.disabled=false);}
    };
    s.audioTimeout=setTimeout(()=>done(false),15000);
    try { const started=await s.play?.(s.words.get(id),{onEnd:()=>done(true),onError:()=>done(false)});if(started===false)done(false); }
    catch(_){done(false);}
  }
  function act(s,event) {
    const b=event.target.closest("[data-rx]");
    if(!b||b.disabled||active!==s||s.busy)return;
    const action=b.dataset.rx,value=b.dataset.value,c=text(s),r=s.state.run;
    if(action==='guide-done' && s.guided && r?.floor>=1){
      if(!s.rehearsal)s.storage?.setItem(`huilaishi-entry-guide-v1-${s.dir}`,'done');
      close();s.onGuideDone?.();return;
    }
    if(action==='guide-retry' && s.guided && r?.phase==='lost') {
      if(!flushLearning(s)){render(s);return;}
      const entropy=new Uint32Array(1);root.crypto.getRandomValues(entropy);
      const pool=WORLD.sample('primer','words',entropy[0]);
      if(M.start(s.state,entropy[0],pool.map(w=>w.id),[],{profile:'primer',kind:'words'})) {
        M.enter(s.state,'0-0');s.lobby=false;s.profile='primer';s.kind='words';resetQuestion(s);save(s);render(s);
      }
      return;
    }
    if(action==="exit"){close();s.onExit?.();return;}
    if(action==="wardrobe"&&s.lobby){s.classic=value==="classic";try{s.storage?.setItem("huilaishi-wardrobe-v125",s.classic?"classic":"scene");}catch(_){}render(s,false);return;}
    if(action==="motion-preview"&&s.lobby){P.animate(s,true);return;}
    if(action==="target"&&M.setTarget(s.state,value)){save(s);render(s,false);return;}
    if(action==="skip-motion"){P.cancel(s);render(s,false);return;}
    if(action==='destination'){s.lobby=true;render(s);return;}
    if(action==='kind'&&s.lobby){if(value==='sentences'&&WORLD.profile(s.profile).level<3)return;s.kind=value==='sentences'?'sentences':'words';render(s,false);return;}
    if(action==="word"){void play(s,value);return;}
    if(action==="audio"&&r?.phase==="battle"){void play(s,r.question.target,true);return;}
    if(action==="style"&&r?.phase==="battle"){
      if(!["rush","pierce","guard"].includes(value))return;
      s.style=value;s.stage.querySelectorAll('[data-rx="style"]').forEach(n=>n.setAttribute("aria-pressed",String(n.dataset.value===value)));return;
    }
    if(action==="hint"&&r?.phase==="battle") {stopAudio(s);s.assisted=true;r.question.speedEligible=false;save(s);render(s,false);return;}
    s.busy=true;
    let changed=false;
    try {
      if(action==="start"){
        if(!flushLearning(s)){render(s);return;}
        const p=WORLD.profile(s.profile);
        if(s.canEnter?.(p)===false){s.requestAccess?.();return;}
        const entropy=new Uint32Array(1);root.crypto.getRandomValues(entropy);
        const pool=WORLD.sample(s.profile,s.kind,entropy[0]);
        const progress=s.progress?.(p.level)||{};
        changed=M.start(s.state,entropy[0],pool.map(w=>w.id),progress.dueIds||[],{profile:s.profile,kind:s.kind,preferredIds:progress.unseenIds||[]});
        if(changed){s.lobby=false;s.rejected=false;}
      } else if(action==="resume"){
        if(s.canEnter?.(WORLD.profile(r.profile||'primer'))===false){s.requestAccess?.();return;}
        s.lobby=false;s.profile=r.profile||'primer';s.kind=r.kind||'words';changed=true;
      }
      else if(action==="node")changed=M.enter(s.state,value);
      else if(action==="ready")changed=M.prepare(s.state);
      else if(action==="answer"){
        if(r?.phase!=='battle'||!r.question)return;
        if(r.question.mode==="listen"&&!s.heard&&!s.assisted)return;
        s.castSlot=Number(b.dataset.slot)||0;
        changed=Boolean(M.answer(s.state,b.dataset.question,value,s.style,Math.max(0,performance.now()-s.started),s.assisted));
      } else if(action==="next"){
        if(!flushLearning(s)){render(s);return;}
        changed=M.next(s.state);
      } else if(action==="reward")changed=M.chooseReward(s.state,value);
      else if(action==="room")changed=M.roomAction(s.state,value);
      else if(action==="sync"){flushLearning(s);changed=true;}
      else if(action==="abandon"&&root.confirm(c.confirm))changed=M.abandon(s.state);
      if(changed){
        stopAudio(s); save(s); flushLearning(s);
        if(action!=="sync")resetQuestion(s);
        render(s);
        if(action==="answer")P.animate(s);
      }
    } finally {s.busy=false;}
  }
  function close() {
    const s=active;if(!s)return;
    delete s.sheet.dataset.roguePhase;
    P.cancel(s);
    if(s.state.run?.question)s.state.run.question.speedEligible=false;
    stopAudio(s);save(s);s.stage.removeEventListener("click",s.click);s.stage.removeEventListener("change",s.change);document.removeEventListener("visibilitychange",s.pause);root.removeEventListener("pagehide",s.pause);root.removeEventListener("resize",s.resize);active=null;
  }
  function open(config) {
    close();
    const dir=config.dir==="th-zh"?"th-zh":"zh-th",key=`huilaishi-rogue-v1-${dir}`;
    const words=new Map(WORLD.entries().map(w=>[w.id,w]));
    let raw=null,rejected=false;
    try{raw=config.rehearsal?null:JSON.parse(config.storage?.getItem(key)||"null");}catch(_){rejected=true;}
    const loaded=M.restore(raw,dir,[...words.keys()]);
    const s={...config,dir,key,words,state:loaded.state,profile:loaded.state.run?.profile||(root.XULONG_EXPEDITION_THEMES?.themes.find(t=>t.direction===dir)?.id)||'primer',kind:loaded.state.run?.kind||'words',rejected:rejected||loaded.rejected,lobby:true,audioToken:0,style:"rush",lastQuestion:null,heard:false,assisted:false,durable:false,busy:false};
    s.baseHero=config.hero;s.monsters=WORLD.monsters?.()||config.monsters;s.motionTimers=[];s.preloaded=new Set();
    try{s.classic=s.storage?.getItem("huilaishi-wardrobe-v125")==="classic";}catch(_){s.classic=false;}
    active=s;
    s.guided = config.guided === true || (!s.rehearsal && config.storage?.getItem(`huilaishi-entry-guide-v1-${dir}`)==='active');
    // A replay gets a fresh in-memory run. It cannot overwrite an active run or farm XP.
    if(s.guided && (!s.state.run || ['won','lost'].includes(s.state.run.phase))) {
      const entropy=new Uint32Array(1); root.crypto.getRandomValues(entropy);
      const pool=WORLD.sample('primer','words',entropy[0]);
      M.start(s.state,entropy[0],pool.map(w=>w.id),[],{profile:'primer',kind:'words'});
      s.profile='primer';s.kind='words';
    }
    if(s.guided && s.state.run?.profile!=='primer') s.guided=false;
    if(s.guided && s.state.run?.floor===0 && s.state.run.phase==='map') M.enter(s.state,'0-0');
    if(s.guided) {
      s.lobby=false;
      if(!s.rehearsal)s.storage?.setItem(`huilaishi-entry-guide-v1-${dir}`,'active');
    } else if(config.direct && s.state.run && !['won','lost'].includes(s.state.run.phase) && s.canEnter?.(WORLD.profile(s.state.run.profile||'primer'))!==false) s.lobby=false;
    s.click=e=>act(s,e);
    s.change=e=>{if(e.target.matches('[data-rx-region]')&&WORLD.profile(e.target.value)){s.profile=e.target.value;if(WORLD.profile(s.profile).level<3)s.kind='words';render(s,false);}};
    // Explicit event argument: no browser-specific global event dependency.
    s.pause=e=>{if(document.hidden||e.type==="pagehide"){P.cancel(s);if(s.state.run?.question)s.state.run.question.speedEligible=false;stopAudio(s);save(s);}};
    s.stage.addEventListener("click",s.click);s.stage.addEventListener("change",s.change);document.addEventListener("visibilitychange",s.pause);root.addEventListener("pagehide",s.pause);
    s.resize=()=>fitScene(s);root.addEventListener('resize',s.resize);
    save(s);flushLearning(s);render(s);
  }
  root.HUILAISHI_ROGUE_UI=Object.freeze({open,close});
})(globalThis);
