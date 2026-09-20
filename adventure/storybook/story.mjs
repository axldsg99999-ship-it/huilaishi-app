import { ASSET } from "./runtime/content.mjs";
import { speak, stopAudio } from "./runtime/voice.mjs";
import { loadArt, PierScene } from "./scene.mjs";
import {RUN_KEY,createRun,readRun,NODES,POWERS,nodeById,availableNodes,enterNode,makeRouteBattle,applyRouteAnswer,settleBattle,choosePower,skipShop,restChoice,eventChoice} from './assets/expedition.mjs';
import {routeMapHTML,routeStageHTML,routeEndingHTML} from './assets/route-view.mjs';
import {
  PROFILE_KEY,
  DECK,
  freshProfile,
  readProfile,
  claimReward,
  createPetSupport,
  chargePetSupport,
  takePetSupport,
  questionFor,
  createBattle,
  preparePrompt,
  chooseStance,
  advance,
  progress,
  resolveAnswer,
  nextRound,
  summary,
  BEATS,
  STANCES,
} from "./model.mjs";

const root = document.querySelector("#experience"),
  folio = document.querySelector("#folio");
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const $ = (s) => root.querySelector(s);
const names = { attack: "进攻", break: "破势", guard: "守势" };
const paths = {
  tea: '<path d="M3 9h14v7a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5ZM17 10h2a3 3 0 0 1 0 6h-2M7 2v3m5-3v3M2 22h18"/>',
  sound:
    '<path d="M3 9h4l5-4v14l-5-4H3zM16 8c3 2 3 6 0 8m3-11c5 4 5 10 0 14"/>',
  book: '<path d="M12 5v16M2 3c4-1 7 0 10 2 3-2 6-3 10-2v16c-4-1-7 0-10 2-3-2-6-3-10-2z"/>',
  leaf: '<path d="M20 3C8 1 1 8 5 16c8 5 16-1 15-13ZM3 21 16 7"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  back: '<path d="m15 5-7 7 7 7"/>',
  gear: '<path d="m9 3-1 3-3 1-2 5 2 5 3 1 1 3h6l1-3 3-1 2-5-2-5-3-1-1-3Z"/><circle cx="12" cy="12" r="4"/>',
  paw: '<ellipse cx="12" cy="16" rx="6" ry="5"/><ellipse cx="4" cy="9" rx="2" ry="3"/><ellipse cx="9" cy="5" rx="2" ry="3"/><ellipse cx="15" cy="5" rx="2" ry="3"/><ellipse cx="20" cy="9" rx="2" ry="3"/>',
  mail: '<path d="M2 5h20v14H2zM2 5l10 8L22 5"/>',
  coin: '<path d="m12 2 9 5v10l-9 5-9-5V7zM8 7h8v10H8z"/>',
  attack: '<path d="m4 21 5-7m-3-3 8 6M9 14l3-7 9-5-3 10-6 5M11 11l5-5"/>',
  break: '<path d="m13 2-5 9h5l-2 11 8-13h-6zM2 7l4 2m-3 8 4-2m13-11 2-2"/>',
  guard:
    '<path d="M12 2c3 3 6 4 9 4v7c-1 5-5 7-9 9-4-2-8-4-9-9V6c3 0 6-1 9-4ZM12 6v11"/>',
  shirt: '<path d="m8 3-6 5 4 4 2-2v11h8V10l2 2 4-4-6-5c0 5-8 5-8 0Z"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  check: '<path d="m4 13 5 5L21 5"/>',
};
const icon = (name) =>
  '<svg class="glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  (paths[name] || paths.leaf) +
  "</svg>";
const btn = (action, content, cls = "", attrs = "") =>
  '<button type="button" data-action="' +
  action +
  '" class="' +
  cls +
  '" ' +
  attrs +
  ">" +
  content +
  "</button>";
const soundButton = (action, label) =>
  btn(action, icon("sound"), "sound", 'aria-label="' + esc(label) + '"');
const asset = (name) => new URL("./assets/" + name, import.meta.url).href;
let profile = freshProfile(),
  storageOK = true;
try {
  profile = readProfile(localStorage.getItem(PROFILE_KEY));
} catch {
  storageOK = false;
}
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
let art,
  scene,
  screen,
  view = "loading",
  battle = null,
  question = null,
  pet = null,
  revealed = false,
  eliminated = null,
  mediaEpoch = 0,
  mediaBusy = false,
  paused = false,
  hiddenPause = false,
  lastReward = null,
  talkTimer = 0,
  toastTimer = 0;
const motion = () => profile.motion && !reduced.matches;
let expedition=null,routeMode=false,routeSelected=null,routeSaveAt=0;
try { expedition=readRun(localStorage.getItem(RUN_KEY)); } catch {}
function saveExpedition(){
  if(!expedition)return;
  try{localStorage.setItem(RUN_KEY,JSON.stringify(expedition));}
  catch{notify('这次远行暂时不能保存；关掉页面后可能无法继续。');}
}
function routeMap(){
  if(!expedition){expedition=createRun();saveExpedition();}
  routeMode=false;
  setView('map',routeMapHTML(expedition,routeSelected,{btn,icon,esc}));
}
function routeStage(){
  routeMode=false;saveExpedition();
  if(expedition.stage==='battle'){startBattle(true);return;}
  if(expedition.stage==='map'){routeSelected=availableNodes(expedition)[0]||null;routeMap();return;}
  if(expedition.stage==='ending')setView('route-end',routeEndingHTML(expedition,{btn,icon,esc}));
  else setView('route',routeStageHTML(expedition,{btn,icon,esc}));
}
function routePowers(){
  openFolio('这次远行的印记','<p>强化只对本次远行生效，不改变正式角色。体力 '+expedition.hp+'/100 · 纸币 '+expedition.coins+'</p>'+
    (Object.entries(expedition.powers).length?Object.entries(expedition.powers).map(([id,level])=>{
      const p=POWERS.find(p=>p.id===id);return '<p><b>'+esc(p.name)+' · '+level+' 级</b><br>'+esc(p.text)+'</p>';
    }).join(''):'<p>还没有印记。战斗获胜、研习和奇遇都可能带来新的力量。</p>'),btn('close','收好印记','main-action'));
}
function saveProfile() {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    storageOK = false;
    notify("当前无法保存。你仍可以完成这次旅途，关闭后进度可能丢失。");
  }
}
function notify(message) {
  root.querySelector(".status-toast")?.remove();
  clearTimeout(toastTimer);
  const el = document.createElement("div");
  el.className = "status-toast";
  el.setAttribute("role", "status");
  el.textContent = message;
  root.append(el);
  toastTimer = setTimeout(() => el.remove(), 4200);
}
function cancelAudio() {
  mediaEpoch++;
  mediaBusy = false;
  stopAudio();
  if (battle)
    battle.paused =
      paused || hiddenPause || folio.open || innerHeight > innerWidth;
}
function header() {
  return (
    '<header class="topbar"><div class="wordmark">XULONG <i>pasa</i><small>课后的另一场冒险</small></div><nav class="top-tools" aria-label="旅途设置"><span class="quiet-button mini">泰语旅途</span><span class="coins">' +
    icon("coin") +
    profile.coins +
    "</span>" +
    btn("settings", icon("gear"), "round-tool", 'aria-label="旅途设置"') +
    '<a class="round-tool" href="../index.html" aria-label="返回原游戏">' +
    icon("back") +
    "</a></nav></header>"
  );
}
function setView(next, html) {
  cancelAudio();
  clearTimeout(talkTimer);
  if (folio.open) folio.close();
  paused = false;
  hiddenPause = document.hidden;
  view = next;
  scene.setView(next);
  screen.innerHTML = html;
  screen.className = "screen screen-enter " + next + "-screen";
  screen.dataset.view = next;
  scene.charm = profile.charmEquipped;
  scene.motion = motion();
  document.documentElement.dataset.motion = String(motion());
  syncPause();
}
function home() {
  routeMode=false;
  battle = null;
  question = null;
  setView(
    "home",
    header() +
      '<section class="home-copy"><div class="chapter-number">散页之城 · 河畔</div><h1>河畔的<br>未寄信</h1><p>' +
      (profile.completed
        ? "她曾在这里停留。<br>这一次，你听见了留下的话。"
        : "她的信留在了这里。<br>只是，守信者还听不懂你。") +
      '</p><p class="margin-note">' +
      (profile.completed
        ? "一页记忆，已经收进手册。"
        : "先学会一句话，再靠近一点。") +
      '</p></section><nav class="entry-signs" aria-label="开始旅途">' +
      btn(
        "begin",
        "<b>" +
          (profile.completed ? "重返这次相遇" : "拾起她的来信") +
          "</b><small>" +
          (profile.completed
            ? "再与兰螳说几句话"
            : "听懂兰螳，找回失落的地址") +
          "</small>" +
          icon("arrow"),
        "paper-sign",
      ) +
      btn(
        "pet",
        "<b>阿笺，在你身边</b><small>" +
          (profile.charm ? "给它试试新衣服" : "摸摸它，听听它的小心事") +
          "</small>" +
          icon("paw"),
        "paper-sign secondary",
      ) +
      "</nav>" +
      btn("greet", "", "actor-touch", 'aria-label="和小艾打招呼"') +
      btn("pet-touch", "", "pet-touch", 'aria-label="摸摸阿笺"') +
      (profile.completed
        ? btn(
            "memory",
            '<img src="./runtime/assets/field-envelope-v2.webp" alt="">',
            "harbor-letter",
            'aria-label="重看未寄信的记忆"',
          )
        : "") +
      '<nav class="home-nav" aria-label="随身物品">' +
      btn('route-open',icon('leaf')+(expedition&&!expedition.finished&&!expedition.failed?'继续远行':'展开地图'))+
      btn("begin", icon("mail") + "来信") +
      btn("pet", icon("paw") + "伙伴") +
      btn("wardrobe", icon("shirt") + "衣橱") +
      btn("journal", icon("book") + "手册") +
      '</nav><small class="edition">河畔来信 · 新篇试玩</small>',
  );
  scene.act(profile.completed ? "wave" : "idle", 1800);
  if (!storageOK) notify("当前浏览器无法保存试玩进度。");
}
function petTalk(text) {
  clearTimeout(talkTimer);
  root.querySelector(".pet-talk")?.remove();
  const el = document.createElement("p");
  el.className = "pet-talk";
  el.setAttribute("role", "status");
  el.textContent = text;
  screen.append(el);
  talkTimer = setTimeout(() => el.remove(), 4200);
}
function openFolio(title, body, footer = "") {
  cancelAudio();
  folio.innerHTML =
    '<header class="folio-head"><h2>' +
    title +
    "</h2>" +
    btn("close", icon("close"), "", 'aria-label="合上手册"') +
    '</header><div class="folio-body">' +
    body +
    "</div>" +
    (footer ? '<footer class="folio-footer">' + footer + "</footer>" : "");
  if (!folio.open) folio.showModal();
  syncPause();
}
function begin() {
  openFolio(
    "她把信，交给了谁？",
    '<p class="eyebrow">河畔的未寄信 / 01</p><p>阿笺在台阶上嗅到熟悉的信纸味。兰螳抱着一封画着梅花的信，向你说了一句话。</p><p>先点它身边的小喇叭听一听，再选一种应对，点出你脑海中正确的意思。</p><p><b>进攻克破势 · 破势克守势 · 守势克进攻</b></p><p>答对两次，阿笺可以帮你排除一个错误想法。' +
      (profile.calm
        ? "当前是从容模式：时机往复流动，错过也可以等下一次。"
        : "当前是快节奏模式：每轮有时间限制，先听完再开始。") +
      "</p>",
    btn("close", "再看一会儿", "text-button") +
      btn("start", icon("arrow") + "去见兰螳", "main-action"),
  );
}
function startBattle(onRoute=false) {
  routeMode=onRoute;
  battle = onRoute ? makeRouteBattle(expedition) : createBattle({
    kind: "normal",
    world: "th",
    relaxed: true,
    seed: 0,
  });
  pet = onRoute && battle.routePet ? battle.routePet : createPetSupport();
  if(onRoute&&!battle.routePet){pet.charge=Math.min(2,expedition.powers.pet||0);battle.routePet=pet;}
  setView(
    "battle",
    '<header class="combat-top"><div class="player-hud">' +
      btn(
        "pause",
        '<img src="' +
          art.battle.portrait +
          '" alt="小艾"><span aria-hidden="true">Ⅱ</span>',
        "avatar",
        'aria-label="小艾 · 暂停战斗"',
      ) +
      '<div class="health"><b>小艾</b><div class="health-track"><i id="hero-health"></i></div><small id="hero-hp">100 / 100</small></div></div><div class="combat-title">河畔切磋<small id="round-title">听懂它，再靠近一点</small></div><div class="enemy-hud"><div class="health"><b>绣风兰螳</b><div class="health-track"><i id="enemy-health"></i></div><small id="enemy-hp"></small></div><img class="enemy-portrait" src="'+art.battle.enemyPortrait+'" alt="绣风兰螳"></div></header><div class="intro-thought"><span>先听它<br>说什么，再想一想。</span></div><p class="thinking-cue">选一个想法，回应它</p><div class="thoughts"></div><p class="enemy-intent"></p><section class="enemy-thought" aria-label="兰螳的话"></section><p class="combat-help" role="status" aria-live="polite"></p><div class="resolve-copy" hidden aria-live="polite"></div>' +
      btn(
        "pet-help",
        icon("paw") + "<span>阿笺 0/2</span>",
        "pet-support",
        'disabled aria-label="阿笺帮助，答对两次后可用"',
      ) +
      '<footer class="battle-controls"><nav class="stances" aria-label="选择应对姿态">' +
      STANCES.map((s, i) =>
        btn(
          "stance:" + s,
          '<span class="stance-icon"><img alt="" draggable="false" src="' +
            art.battle.paper[5+i] + '">' +
            "</span><b>" +
            names[s] +
            "</b><small>克制" +
            names[BEATS[s]] +
            "</small>",
          "stance",
          'style="--tint:' +
            ["#a74b35", "#3b8578", "#ac8243"][i] +
            '" aria-pressed="false" disabled',
        ),
      ).join("") +
      '</nav><section class="timing"><div class="timing-head"><span id="timing-title">先听它说，再选择姿态</span><span id="timing-mode">' +
      (profile.calm ? "从容 · 往复" : "快节奏 · 7.2秒") +
      '</span></div><div class="timing-track" role="meter" aria-label="出招时机" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i class="good-zone"></i><i class="perfect-zone"></i><i class="time-cursor"></i></div><div class="timing-labels"><span>常规</span><span>玉色 · 良机　金色 · 精准</span></div></section>' +
      btn("next", "接下一句话 " + icon("arrow"), "next-turn", "hidden") +
      '</footer><section class="paused-cover" hidden><h2>风还在，等你回来。</h2><p>时间、声音和动作已暂停。</p>' +
      btn("resume", "继续这次相遇") +
      btn("leave", "回到码头") +
      '</section><span class="battle-edition">独立试玩 · 不影响正式存档</span>' +
      btn('leave','回到码头 '+icon('arrow'),'battle-exit'),
  );
  ['fan','cloud','scroll','orchid','banner'].forEach((name,i)=>
    screen.style.setProperty('--art-'+name,'url("'+art.battle.paper[i]+'")'));
  renderRound();
  if(onRoute){
    $('.combat-title').firstChild.textContent=nodeById(expedition.active).name;
    $('.battle-edition').textContent='远行 '+expedition.path.length+'/5 · 印记 '+Object.values(expedition.powers).reduce((a,b)=>a+b,0);
    $('.battle-exit').innerHTML='暂回地图 '+icon('arrow');
    if(battle.phase==='resolved')presentAnswer(battle.last,battle.last?.selectedId);
    if(battle.phase==='complete'){settleBattle(expedition);routeStage();return;}
    saveExpedition();
  }
  scene.act("listen", 1600);
  scene.enemyAct(14, 1600);
}
function status(text) {
  const el = $(".combat-help");
  if (el) el.textContent = text;
}
function renderRound() {
  question = questionFor(battle.round+(routeMode?expedition.path.length*2:0));
  revealed = false;
  eliminated = null;
  $(".time-cursor").style.left = "0%";
  $(".timing-track").setAttribute("aria-valuenow", "0");
  $("#timing-title").textContent = "先听它说，再选择姿态";
  $(".resolve-copy").hidden = true;
  $("[data-action=next]").hidden = true;
  $(".thoughts").innerHTML = question.options
    .map(
      (u,i) =>
        '<div class="thought" data-id="' +
        u.id +
        '" data-locked="true"><img class="paper-surface" alt="" draggable="false" src="'+art.battle.paper[i]+'">' +
        btn("answer:" + u.id, esc(u.zh), "answer", "disabled") +
        soundButton("option:" + u.id, "试听：" + u.zh) +
        "</div>",
    )
    .join("");
  $(".enemy-intent").textContent = "它正准备：" + names[battle.enemyStance];
  $("#round-title").textContent =
    "第 " +
    (battle.round + 1) +
    " 次交锋 · " +
    (profile.calm ? "慢慢听，慢慢想" : "听懂后再把握时机");
  renderPrompt();
  updateControls();
  updateHealth();
  scene.act("think", 1500);
  status("点兰螳身边的小喇叭。听完再选择应对姿态。");
}
function renderPrompt() {
  const voice=$(".enemy-thought");
  // The guardian does not expose thoughts. This is only a voice/replay control;
  // an explicitly requested accessibility caption goes in the subtitle area.
  voice.classList.add('voice-only');
  voice.setAttribute('aria-label','兰螳的声音');
  voice.dataset.speaking=String(mediaBusy);
  voice.innerHTML=btn('hear',icon('sound')+'<span>'+(mediaBusy?'听着呢…':battle.promptReady?'再听一遍':'听它说话')+'</span>','guardian-voice',
    'aria-label="'+(mediaBusy?'停止当前声音':'听兰螳说话')+'"')+
    btn('reveal',revealed?'字幕已展开':'文字辅助','hint');
  screen.querySelector('.spoken-caption')?.remove();
  if(revealed) {
    const caption=document.createElement('p');caption.className='spoken-caption';caption.lang='th';
    caption.setAttribute('aria-label','它说的话');caption.textContent='“'+question.unit.th+'”';screen.append(caption);
  }
}
function updateHealth() {
  if (!battle) return;
  $("#hero-health").style.width = battle.hp + "%";
  $("#enemy-health").style.width =
    (battle.enemyHp / battle.enemyMax) * 100 + "%";
  $("#hero-hp").textContent = battle.hp + " / 100";
  $("#enemy-hp").textContent = battle.enemyHp + " / " + battle.enemyMax;
}
function updateControls() {
  if (view !== "battle") return;
  screen.dataset.promptReady=String(battle.promptReady);
  screen.dataset.phase=battle.phase;
  const canAct = !battle.paused && !mediaBusy;
  for (const b of root.querySelectorAll('[data-action^="stance:"]')) {
    const s = b.dataset.action.split(":")[1];
    b.disabled =
      !canAct ||
      !battle.promptReady ||
      !["prepare", "active"].includes(battle.phase) ||
      (battle.phase === "active" && progress(battle) >= 0.6);
    b.setAttribute("aria-pressed", String(s === battle.stance));
  }
  for (const b of root.querySelectorAll(".answer"))
    b.disabled = !canAct || battle.phase !== "active";
  for (const el of root.querySelectorAll(".thought"))
    el.dataset.locked = String(battle.phase !== "active");
  const support = $("[data-action=pet-help]");
  support.disabled =
    !canAct || battle.phase !== "prepare" || pet.used || pet.charge < 2;
  support.querySelector("span").textContent = pet.used
    ? "已帮过你"
    : "阿笺 " + pet.charge + "/2";
  support.setAttribute(
    "aria-label",
    pet.used
      ? "阿笺本场已经帮过你"
      : pet.charge === 2
        ? "请阿笺排除一个错误想法"
        : "阿笺帮助，答对两次后可用",
  );
}
async function play(text, lang, { prompt = false, dialogue = false } = {}) {
  if (
    !dialogue &&
    view === "battle" &&
    (paused || hiddenPause || folio.open || battle.phase === "resolved")
  )
    return;
  cancelAudio();
  const token = mediaEpoch,
    activeBattle = battle,
    activeView = view;
  mediaBusy = true;
  if (activeView === "battle" && !dialogue) {
    battle.paused = true;
    scene.act(prompt ? "listen" : "think", 5000);
    if (prompt) scene.enemyAct(12, 5000);
    renderPrompt();
    updateControls();
    status("正在听，出招时间已停下。");
  }
  let ok = false;
  try {
    ok = await speak(text, lang);
  } catch {}
  if (token !== mediaEpoch || view !== activeView || battle !== activeBattle)
    return;
  mediaBusy = false;
  if (dialogue) {
    const note = folio.querySelector(".audio-note") || document.createElement("p");
    note.className = "audio-note mini";
    note.setAttribute("role", "status");
    note.textContent = ok ? "这一句，听完了。" : "声音暂时无法播放，可以再试一次。";
    if (!note.parentNode) folio.querySelector(".folio-body").append(note);
  } else if (activeView === "battle") {
    battle.paused =
      paused || hiddenPause || folio.open || innerHeight > innerWidth;
    if (prompt && ok) preparePrompt(battle, false);
    if (!ok) status("这段声音暂时没能播放。可重试，或点文字提示继续。");
    else
      status(
        battle.phase === "prepare"
          ? "听完了。看它准备的招式，选一种应对。"
          : "接住这个意思，点正确想法出招。",
      );
    scene.act("think", 1100);
    scene.enemyAct(11, 1000);
    renderPrompt();
    updateControls();
  }
}
function choose(s) {
  if (!chooseStance(battle, s)) return;
  scene.act(s === "guard" ? "guard" : "think", 900);
  updateControls();
  status("点正确的想法出招。金色时机能让回应更有力。");
  if(routeMode)saveExpedition();
}
function answer(id) {
  const result = resolveAnswer(battle, question, id);
  if (!result) return;
  if(routeMode)applyRouteAnswer(expedition,battle,result);
  cancelAudio();
  chargePetSupport(pet, result.correct);
  if(routeMode)saveExpedition();
  presentAnswer(result,id);
}
function presentAnswer(result,id) {
  if(!result)return;
  updateHealth();
  updateControls();
  const el = $('.thought[data-id="' + id + '"]');
  if (el) el.dataset.result = result.correct ? "correct" : "wrong";
  const right = $('.thought[data-id="' + question.unit.id + '"]');
  if (right) right.dataset.result = "correct";
  const feedback = $(".resolve-copy");
  feedback.hidden = false;
  feedback.innerHTML =
    "<b>" +
    (result.correct
      ? result.timing === "perfect"
        ? "心意相通"
        : result.tactical === "counter"
          ? "漂亮破招"
          : "听懂了"
      : "再听一次") +
    '</b><span class="damage">' +
    (result.correct ? "−" + result.dealt : "−" + result.taken) +
    "</span><p>" +
    esc(question.unit.th) +
    " · " +
    esc(question.unit.zh) +
    "</p>";
  if (result.correct) {
    scene.act(battle.stance === "guard" ? "guard" : "strike", 1100);
    scene.enemyAct(8, 900);
    scene.petAct(3, 1100);
    scene.burst(result.timing === "perfect" ? "perfect" : "correct");
  } else {
    scene.act("hit", 1050);
    scene.enemyAct(6, 850);
    scene.burst("wrong", 0.31, 0.65);
  }
  status(
    result.correct
      ? pet.charge === 2 && !pet.used
        ? "阿笺记住了！下一轮可以请它帮忙。"
        : "这一句，已经靠近了它。"
      : result.timedOut
        ? "时间到了。这句是“" + question.unit.zh + "”。"
        : "这句的意思是“" + question.unit.zh + "”。记住它，再试一回。",
  );
  if (profile.sound) playFeedback(result.correct);
  if(routeMode&&(result.routeBonus||result.routeBlocked||result.routeHeal)) {
    status('印记回响：'+[result.routeBonus?'伤害 +'+result.routeBonus:'',result.routeBlocked?'减伤 '+result.routeBlocked:'',result.routeHeal?'回复 '+result.routeHeal:''].filter(Boolean).join(' · '));
  }
  const next = $("[data-action=next]");
  next.hidden = false;
  next.textContent =
    battle.outcome === "win"
      ? routeMode?'领取旅途回馈 →':"接过它的信 →"
      : battle.outcome === "lose"
        ? "回到台阶休息 →"
        : "接下一句话 →";
}
function next() {
  if (!nextRound(battle)) return;
  if(routeMode){
    if(battle.phase==='complete'){settleBattle(expedition);routeStage();return;}
    saveExpedition();
  }
  if (battle.phase === "complete") {
    if (battle.outcome === "win") reward();
    else defeat();
  } else renderRound();
}
function tick(dt) {
  if(routeMode&&performance.now()-routeSaveAt>1500){routeSaveAt=performance.now();saveExpedition();}
  if (
    view !== "battle" ||
    !battle ||
    battle.paused ||
    mediaBusy ||
    battle.phase !== "active"
  )
    return;
  const due = advance(battle, dt);
  if (due) {
    if (profile.calm) battle.elapsed %= battle.duration;
    else {
      answer(null);
      return;
    }
  }
  const p = progress(battle),
    cursor = $(".time-cursor");
  if (cursor) cursor.style.left = p * 100 + "%";
  $(".timing-track")?.setAttribute(
    "aria-valuenow",
    String(Math.round(p * 100)),
  );
  const title = $("#timing-title");
  if (title)
    title.textContent =
      p >= 0.72 && p <= 0.81
        ? "金色 · 现在是精准时机"
        : p >= 0.6 && p <= 0.89
          ? "玉色 · 好机会"
          : "听懂意思，等待你的时机";
  updateControls();
}
function reward() {
  const report = summary(battle);
  lastReward = claimReward(profile, battle);
  saveProfile();
  setView(
    "reward",
    header() +
      '<section class="reward-copy"><p class="eyebrow">一封信，找到了下一位收信人</p><h1>原来，她来过。</h1><p>兰螳终于松开花瓣般的手。<br>信上的梅花，和你衣襟上的针脚很像。</p><div class="reward-items"><div><b>' +
      (lastReward.granted ? "+36" : "已收藏") +
      "</b><small>旅途纸币</small></div><div><b>" +
      report.correct +
      "</b><small>本次听懂</small></div><div><b>" +
      report.perfect +
      "</b><small>精准回应</small></div></div><p>" +
      (lastReward.granted
        ? "阿笺获得了「梅笺小褂」，亲密度 +12。"
        : "再次相遇，已收藏的奖励不会重复领取。") +
      "</p>" +
      btn("memory", icon("book") + "展开这一页记忆", "main-action") +
      btn("home", "带回码头，稍后再看", "text-button") +
      '</section><p class="reward-label">阿笺把这一天，认真地记住了。</p>',
  );
  scene.act("victory", 2400);
  scene.petAct(3, 2600);
  scene.enemyAct(14, 2500);
  scene.burst("reward", 0.44, 0.54);
}
function defeat() {
  const wrong = [
    ...new Set(battle.records.filter((r) => !r.correct).map((r) => r.unitId)),
  ]
    .map((id) => DECK.find((u) => u.id === id))
    .filter(Boolean);
  openFolio(
    "先在台阶上，歇一会儿",
    "<p>阿笺靠过来碰了碰你的手。这封信还在，它会等你。</p><p>再听听刚才没听清的话：</p>" +
      wordList(wrong),
    btn("home", "回到码头", "text-button") +
      btn("start", "重新相遇", "main-action"),
  );
}
function memory() {
  if (!profile.completed) {
    notify("听懂兰螳的话后，这一页记忆才会展开。");
    return;
  }
  setView(
    "memory",
    '<article class="memory-sheet"><header class="memory-head"><div><small>散页之城 · 记忆 01</small><h1>她留下的，不只有一封信。</h1></div>' +
      btn("home", icon("close"), "", 'aria-label="收好记忆，回到码头"') +
      '</header><div class="memory-art"><img src="' +
      asset("memory-letter-v1.png") +
      '" alt="三格记忆漫画：CHANINDA托付来信，风吹走地址，兰螳把信交给汉服小艾。"></div><section class="memory-captions"><p><b>01 · 托付</b>离开前，CHANINDA把梅花信交给兰螳：请等一个从另一岸来的人。</p><p><b>02 · 等待</b>风吹走了地址。兰螳守着信，反复练习她教过的那几句话。</p><p><b>03 · 相认</b>小艾听懂了“朋友”和“谢谢”。兰螳终于知道，它等的人到了。</p></section><footer class="memory-footer"><p>下一条痕迹：信纸背面，画着学院钟楼。<br>这一段旅途先到这里，把记忆带回家。</p>' +
      btn("home", icon("mail") + "收进手册 · 回到码头", "main-action") +
      "</footer></article>",
  );
}
function spriteData(atlas, frame, width = 420, height = 420) {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const ctx = c.getContext("2d"),
    f = atlas.frames[frame],
    s = Math.min(width / f.w, height / f.h) * 0.94;
  ctx.drawImage(
    atlas.canvas,
    f.x,
    f.y,
    f.w,
    f.h,
    (width - f.w * s) / 2,
    height - f.h * s,
    f.w * s,
    f.h * s,
  );
  return c.toDataURL();
}
function petRoom() {
  openFolio(
    "阿笺的小角落",
    '<div class="pet-folio"><img class="pet-portrait" src="' +
      spriteData(art.pet, profile.charmEquipped ? 8 : 0) +
      '" alt="阿笺，一只带着信袋的小猫"><div><p class="eyebrow">随行伙伴 / 阿笺</p><h3>今天也陪你，一点点学会。</h3><p>亲密度 ' +
      profile.closeness +
      " · " +
      (profile.completed ? "已经一起找回一封信" : "刚刚开始的旅途") +
      '</p><p id="pet-note">' +
      (profile.words.length
        ? "我记住啦：" +
          esc(DECK.find((u) => u.id === profile.words[0])?.th || "") +
          "　(=^･ω･^=)"
        : "信里有你熟悉的味道。我们一起去看看？") +
      '</p><div class="pet-choices">' +
      btn("pet-stroke", "摸摸头") +
      btn("pet-feed", "喂一口点心") +
      btn(
        "pet-dress:plain",
        "旅行信袋",
        "",
        'aria-pressed="' + !profile.charmEquipped + '"',
      ) +
      btn(
        "pet-dress:flower",
        "梅笺小褂" + (profile.charm ? "" : " · 通关解锁"),
        "",
        'aria-pressed="' +
          profile.charmEquipped +
          '" ' +
          (!profile.charm ? "disabled" : ""),
      ) +
      '</div></div></div><p class="mini">交锋中答对两次，阿笺就能帮你排除一个错误想法，每场一次。</p>',
    btn("close", "一起回去", "main-action"),
  );
}
function wordList(units) {
  return (
    '<div class="journal-words">' +
    units
      .map(
        (u) =>
          '<div class="journal-word"><div><b lang="th">' +
          esc(u.th) +
          "</b><small>" +
          esc(u.zh) +
          "</small></div>" +
          soundButton("word:" + u.id, "播放泰语：" + u.th) +
          "</div>",
      )
      .join("") +
    "</div>"
  );
}
function journal() {
  const units = profile.words
    .map((id) => DECK.find((u) => u.id === id))
    .filter(Boolean);
  openFolio(
    "随身手册",
    '<p class="eyebrow">河畔的未寄信 / 旅途收藏</p>' +
      (profile.completed
        ? "<p>一页记忆，一封梅花信，一起听懂的几句话。</p>" +
          btn("memory", icon("book") + "重看这一页记忆", "main-action")
        : "<p>手册还是空的。先去听听兰螳说什么。</p>") +
      wordList(units) +
      '<p class="mini">这里记录本次试玩听懂的词，不代表已经长期掌握。可以随时回来再听。</p>',
    btn("close", "收好手册", "main-action"),
  );
}
function wardrobe() {
  openFolio(
    "青竹寄信",
    '<p class="eyebrow">小艾 · 旅途汉服</p><p>墨青竹纹、月白交领、朱砂里襟。玉佩旁，挂着一封还没寄出的信。</p><img class="wardrobe-art" src="' +
      spriteData(art.hero, 0, 420, 500) +
      '" alt="小艾的青竹寄信汉服"><nav class="pose-controls" aria-label="预览完整人物姿态">' +
      ["站立", "思考", "听音", "开口", "进攻", "守势", "受击", "胜利"]
        .map((x, i) => btn("pose:" + i, x))
        .join("") +
      "</nav>",
    btn("close", "穿着它，去河畔", "main-action"),
  );
}
function settings() {
  const row = (key, title, note) =>
    '<div class="setting"><div><b>' +
    title +
    "</b><small>" +
    note +
    "</small></div>" +
    btn(
      "setting:" + key,
      profile[key] ? "已开启" : "已关闭",
      "",
      'aria-pressed="' + profile[key] + '"',
    ) +
    "</div>";
  openFolio(
    "旅途设置",
    row("calm", "从容模式", "时机往复流动，错过不扣血。关闭后每轮限时。") +
      row("motion", "场景与动作", "人物姿态、河面光点和纸片反馈。") +
      row("sound", "交锋反馈音", "答题时的轻音效；词句由小喇叭单独播放。") +
      '<p class="mini">河畔来信是独立试玩，收藏保存在这台设备。当前片段为小艾学泰语。</p>',
    btn("close", "收好设置", "main-action"),
  );
}
function syncPause() {
  const block = paused || hiddenPause || folio.open || innerHeight > innerWidth;
  if (battle) battle.paused = block || mediaBusy;
  scene?.setPaused(block);
  const cover = $(".paused-cover");
  if (cover) cover.hidden = !paused;
  if (view === "battle") {
    for (const node of screen.children)
      if (!node.classList.contains("paused-cover"))
        node.inert = paused || innerHeight > innerWidth;
    updateControls();
  }
}
let audioContext;
function playFeedback(correct) {
  if (!profile.sound) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    audioContext.resume();
    const t = audioContext.currentTime;
    for (let i = 0; i < 2; i++) {
      const osc = audioContext.createOscillator(),
        gain = audioContext.createGain();
      osc.type = "sine";
      osc.frequency.value = correct ? [587, 880][i] : [294, 262][i];
      gain.gain.setValueAtTime(0, t + i * 0.07);
      gain.gain.linearRampToValueAtTime(0.035, t + i * 0.07 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.07 + 0.35);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(t + i * 0.07);
      osc.stop(t + i * 0.07 + 0.36);
    }
  } catch {}
}
async function action(value) {
  const [key, arg] = value.split(":");
  switch (key) {
    case "home":
      home();
      break;
    case "begin":
      begin();
      break;
    case "start":
      startBattle();
      break;
    case "greet":
      scene.act("wave", 2200);
      petTalk("这一次，我想亲口对她说：我听懂了。");
      break;
    case "pet-touch":
      scene.petAct(3, 2200);
      scene.act("speak", 1600);
      petTalk(
        profile.completed
          ? "信收好啦！下一段路，也带上我呀。 ฅ^•ﻌ•^ฅ"
          : "喵～我闻到信纸的味道了。 (๑•̀ㅅ•́)و",
      );
      break;
    case "pet":
      petRoom();
      break;
    case "journal":
      journal();
      break;
    case "wardrobe":
      wardrobe();
      break;
    case "settings":
      settings();
      break;
    case "close":
      cancelAudio();
      folio.close();
      break;
    case "setting":
      if (["calm", "motion", "sound"].includes(arg)) {
        profile[arg] = !profile[arg];
        saveProfile();
        scene.motion = motion();
        document.documentElement.dataset.motion = String(motion());
        settings();
      }
      break;
    case "pose":
      {
        const img = folio.querySelector(".wardrobe-art");
        if (img && Number(arg) >= 0 && Number(arg) < 8) {
          img.src = spriteData(art.hero, Number(arg), 500, 500);
          img.alt =
            ["站立", "思考", "听音", "开口", "进攻", "守势", "受击", "胜利"][
              Number(arg)
            ] + "姿态";
        }
      }
      break;
    case "pet-stroke":
    case "pet-feed":
      {
        const img = folio.querySelector(".pet-portrait");
        if (img)
          img.src = spriteData(
            art.pet,
            (profile.charmEquipped ? 8 : 0) + (key === "pet-feed" ? 1 : 3),
          );
        const note = folio.querySelector("#pet-note");
        if (note)
          note.textContent =
            key === "pet-feed"
              ? "啊呜～给你留一小口！ (๑´ڡ`๑)"
              : "呼噜呼噜……手别拿开嘛。 (=^･ω･^=)";
      }
      break;
    case "pet-dress":
      if (arg === "plain" || profile.charm) {
        profile.charmEquipped = arg === "flower";
        scene.charm = profile.charmEquipped;
        saveProfile();
        petRoom();
      }
      break;
    case "word":
      {
        const u = DECK.find((x) => x.id === arg);
        if (u) await play(u.th, "th", { dialogue: true });
      }
      break;
    case "memory":
      memory();
      break;
    case "pause":
      paused = true;
      cancelAudio();
      syncPause();
      $("[data-action=resume]")?.focus();
      break;
    case "resume":
      if (innerWidth >= innerHeight) {
        paused = false;
        hiddenPause = false;
        syncPause();
      }
      break;
    case "leave":
      if(routeMode){saveExpedition();routeSelected=expedition.active;routeMap();}
      else home();
      break;
    case 'route-open':
      if(expedition?.finished||expedition?.failed){routeStage();}
      else routeMap();
      break;
    case 'route-map': routeMap();break;
    case 'route-peek': routeSelected=arg;routeMap();break;
    case 'route-go': if(enterNode(expedition,arg))routeStage();break;
    case 'route-continue': routeStage();break;
    case 'route-new': expedition=createRun();routeSelected=null;saveExpedition();routeMap();break;
    case 'route-powers': routePowers();break;
    case 'route-take': if(choosePower(expedition,arg))routeStage();break;
    case 'route-skip': if(skipShop(expedition))routeStage();break;
    case 'route-rest': if(restChoice(expedition,arg))routeStage();break;
    case 'route-event': if(eventChoice(expedition,arg))routeStage();break;
    case "hear":
      if (view === "battle") {
        if (mediaBusy) {
          cancelAudio();
          syncPause();
          renderPrompt();
          status("声音已停止，可再听一次。");
        } else await play(question.unit.th, "th", { prompt: true });
      }
      break;
    case "option":
      {
        const u = question?.options.find((x) => x.id === arg);
        if (u && view === "battle") await play(u.zh, "zh");
      }
      break;
    case "reveal":
      if (view === "battle" && !paused) {
        cancelAudio();
        revealed = true;
        preparePrompt(battle, true);
        renderPrompt();
        updateControls();
        status("文字辅助已展开。读清楚后选一种应对。");
      }
      break;
    case "stance":
      if (view === "battle") choose(arg);
      break;
    case "answer":
      if (view === "battle") answer(arg);
      break;
    case "next":
      if (view === "battle") next();
      break;
    case "pet-help":
      if (view === "battle" && takePetSupport(pet, battle)) {
        battle.assisted = true;
        eliminated = question.options.find((u) => u.id !== question.unit.id).id;
        $('.thought[data-id="' + eliminated + '"]').dataset.eliminated = "true";
        scene.petAct(2, 1800);
        scene.act("speak", 1300);
        status("阿笺轻轻碰掉一个念头：“这句不是哦！”");
        updateControls();
      }
      break;
  }
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-action]");
  if (b && !b.disabled && !b.closest("[inert]")) {
    Promise.resolve(action(b.dataset.action)).catch((error) => {
      console.error(error);
      notify("这一步没能完成，请再试一次。");
    });
  }
});
folio.addEventListener("close", () => {
  cancelAudio();
  syncPause();
});
folio.addEventListener("cancel", () => cancelAudio());
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && view === "battle" && !folio.open) {
    e.preventDefault();
    paused = !paused;
    cancelAudio();
    syncPause();
  }
});
document.addEventListener("visibilitychange", () => {
  if(expedition)saveExpedition();
  hiddenPause = document.hidden;
  if (document.hidden) {
    cancelAudio();
    if (view === "battle") paused = true;
  }
  syncPause();
});
window.addEventListener("resize", () => {
  if (innerHeight > innerWidth && view === "battle") {
    paused = true;
    cancelAudio();
  }
  syncPause();
});
reduced.addEventListener("change", () => {
  if (scene) scene.motion = motion();
  document.documentElement.dataset.motion = String(motion());
});
window.addEventListener("pagehide", () => {
  if(expedition)saveExpedition();
  cancelAudio();
  scene?.destroy();
  audioContext?.close();
});
try {
  art = await loadArt();
  root.innerHTML =
    '<canvas class="world-canvas" aria-hidden="true"></canvas><div class="screen"></div>';
  screen = $(".screen");
  scene = new PierScene($(".world-canvas"), art, {
    motion: motion(),
    onTick: tick,
  });
  if(new URLSearchParams(location.search).has('map')) routeMap();
  else if(new URLSearchParams(location.search).has('battle')) startBattle();
  else home();
} catch (error) {
  console.error(error);
  $("#load-note").textContent =
    "有一张画面还没加载好。请检查网络，再刷新试试。";
  root
    .querySelector(".loading")
    .insertAdjacentHTML(
      "beforeend",
      '<a href="./index.html">重新展开</a><a href="../index.html">返回原游戏</a>',
    );
}
