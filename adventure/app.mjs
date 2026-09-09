import {
  loadSave,
  persistSave,
  freshSave,
  canEnter,
  battleStats,
  damageFor,
  shuffled,
  noteAnswer,
  completeEncounter,
  campaignComplete,
  completeCampaignCount,
  completePractice,
  buyOutfit,
  dueWords,
  matchSpeech,
  awardEcho,
  takeEchoTime,
  normalized,
  makeConnections,
  connectWord,
  makeListeningChain,
  makeCloze,
  selectChallenge,
  craftPhase,
  eliteArmorStep,
  unitForChallenge,
  makeSoundHunt,
  markHuntHeard,
  submitSoundHunt,
  makeProof,
  inspectProof,
  mendProof,
} from "./core.mjs?v=0.3.1";
import {
  ASSET,
  HEROES,
  CHAPTERS,
  LESSONS,
  ALL_LESSONS,
  MONSTERS,
  OUTFITS,
  monsterFor,
  chapterScene,
  SCENE_STAGING,
} from "./content.mjs?v=0.3.1";
import { Stage, atlas, HERO_MOMENTS, INTERACTION_SHEETS } from "./renderer.mjs?v=0.3.1";
import {exchangeState,responseHoldMs,CHALLENGE_LABELS,thoughtSkin,thoughtCue,thoughtLayout} from './battle-presentation.mjs?v=0.3.1';
import {FIELD_NOTES,fieldNote,makeFieldAttempt,answerField,rememberField} from './field-notes.mjs?v=0.3.1';
import {makeReply,selectReply,submitReply,replyReadAllowance} from './replies.mjs?v=0.3.1';
import {voiceIssue, enterVoiceRecovery} from './speech-status.mjs?v=0.3.1';
import {diagnostics, closeDiagnostics, nativeDiagnosticsAvailable} from './voice-check.mjs?v=0.3.1';
import {
  speak,
  stopAudio,
  startVoice,
  stopVoice,
  cancelVoice,
} from "./voice.mjs?v=0.3.1";

const root = document.querySelector("#app"),
  panel = document.querySelector("#panel");
// A missing decorative texture must never remove the native answer or block
// progression. Scope the unframed high-contrast fallback to this battle only.
root.addEventListener('error',e=>{
  if(e.target instanceof HTMLImageElement&&e.target.classList.contains('thought-paint'))
    e.target.closest('.battle-correspondence')?.classList.add('paint-unavailable');
},true);
// Original chroma artwork goes through the same keyed-atlas renderer as the
// actors. Decode once per culture, retain originals, never expose the matte.
const thoughtMaterials=new Map();
function applyThoughtMaterial(scene) {
  const material=scene.dataset.world==='cn'?'chaninda':'xiaoai';
  if(!thoughtMaterials.has(material))thoughtMaterials.set(material,
    atlas('thought-'+material+'-ink-v2.png',true).then(a=>a.canvas.toDataURL('image/png')));
  thoughtMaterials.get(material).then(src=>{
    if(!scene.isConnected)return;
    scene.style.setProperty('--thought-art','url("'+src+'")');
    scene.querySelectorAll('.thought-paint[data-material]').forEach(img=>{if(!img.src)img.src=src;});
    scene.dataset.paintReady='true';
  }).catch(()=>{if(scene.isConnected)scene.classList.add('paint-unavailable');});
}
let storage;
try {
  storage = localStorage;
} catch {}
let save = storage ? loadSave(storage) : freshSave(),
  route = "",
  stages = [],
  epoch = 0,
  battle = null,
  exploration = null,
  timers = new Set(),
  toastTimer,
  dictPromise,
  music = null,
  panelReturn = null;
const $ = (selector) => root.querySelector(selector);
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const tx = (zh, th) => (save.world === "th" ? zh : th);
const nameOf = (o) => (save.world === "th" ? o.zh : o.th);
const targetOf = (o) => (save.world === "th" ? o.th : o.zh);
const sourceOf = (o) => (save.world === "th" ? o.zh : o.th);
const challengeName = mode => tx(...(CHALLENGE_LABELS[mode]||['练习','ฝึก']));
const lang = () => (save.world === "th" ? "th" : "zh");
const progress = () => save.worlds[save.world];
const practiceUnits = new Map();
const findUnit = id => ALL_LESSONS.find(u=>u.id===id)||practiceUnits.get(id);
const loadDictionary = () => dictPromise || (dictPromise=fetch(new URL('./data/dictionary.json',import.meta.url)).then(r=>{if(!r.ok)throw Error('dictionary');return r.json()}).catch(error=>{dictPromise=null;throw error}));
const outfit = () =>
  OUTFITS.find(
    (o) => o.id === save.equipped[save.world] && o.world === save.world,
  ) || OUTFITS.find((o) => o.world === save.world && o.cost === 0);
const iconPaths = {
  arrow: "M4 12h15m-6-6 6 6-6 6",
  left: "m14 5-7 7 7 7",
  right: "m10 5 7 7-7 7",
  close: "m6 6 12 12M18 6 6 18",
  map: "m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Zm6-2v16m6-14v16",
  book: "M12 5C9 2 4 3 2 4v16c3-2 7-2 10 0 3-2 7-2 10 0V4c-3-1-7-2-10 1v15",
  mail: "M3 5h18v14H3V5Zm0 1 9 7 9-7M3 19l6-8m12 8-6-8",
  sound: "m3 9 4 0 5-4v14l-5-4H3V9Zm13-2c3 3 3 7 0 10m3-13c5 5 5 11 0 16",
  mic: "M9 5a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0V5ZM6 10v2a6 6 0 0 0 12 0v-2m-6 8v4m-4 0h8",
  shirt: "m7 3 5 3 5-3 6 5-4 5-2-2v11H7V11l-2 2-4-5 6-5Z",
  settings:
    "m9 3 6 0 1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1 1-3Zm3 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8",
  coin: "m12 2 9 5v10l-9 5-9-5V7l9-5Zm0 4v12m-4-8 4-4 4 4",
  check: "m4 12 5 5L20 6",
  lock: "M6 10h12v11H6V10Zm2 0V6a4 4 0 0 1 8 0v4",
  pause: "M8 5v14m8-14v14",
  play: "m7 3 14 9-14 9V3Z",
  sword: "m4 20 5-5m-3-4 7 7m-4-6L18 3h3v3l-9 9",
  leaf: "M4 21C4 6 12 2 21 3c1 11-4 17-15 16m-1 0L17 7",
  undo: "M8 4 3 9l5 5M3 9h11a6 6 0 0 1 0 12",
  replay: "M4 9a8 8 0 1 1 0 6M4 3v6h6",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm10-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6",
};
function icon(id) {
  return (
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' +
    (iconPaths[id] || iconPaths.book) +
    '"/></svg>'
  );
}
function button(id, label, kind = "", glyph = "") {
  return (
    '<button type="button" class="paper-btn ' +
    kind +
    '" data-action="' +
    id +
    '">' +
    (glyph ? icon(glyph) : "") +
    "<span>" +
    esc(label) +
    "</span></button>"
  );
}
function ib(id, label, glyph) {
  return (
    '<button type="button" class="icon-btn" data-action="' +
    id +
    '" aria-label="' +
    esc(label) +
    '" title="' +
    esc(label) +
    '">' +
    icon(glyph) +
    "</button>"
  );
}
function toast(text) {
  const el = document.querySelector("#toast");
  el.textContent = text;
  el.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("visible"), 4500);
}
function commit() {
  if (!storage || !persistSave(storage, save))
    toast(
      tx(
        "存储不可用：这次进度暂时只保留在当前页面。",
        "บันทึกถาวรไม่ได้ ความคืบหน้านี้จะอยู่เฉพาะหน้านี้",
      ),
    );
}
function later(fn, ms) {
  const e = epoch,
    id = setTimeout(() => {
      timers.delete(id);
      if (e === epoch) fn();
    }, ms);
  timers.add(id);
  return id;
}
// Resolution belongs to battle time, not wall time: dialogs and backgrounding
// freeze both the contact event and the transition to the next question.
function laterBattle(b, fn, ms) {
  let remaining=ms,last=performance.now();
  const step=()=>{
    if(b!==battle)return;
    const now=performance.now();
    if(!b.paused&&!document.hidden)remaining-=Math.min(now-last,80);
    last=now;
    if(remaining<=0)fn();else later(step,40);
  };
  later(step,40);
}
function cleanup() {
  epoch++;
  closeDiagnostics();
  timers.forEach(clearTimeout);
  timers.clear();
  stages.forEach((s) => s.destroy());
  stages = [];
  stopAudio();
  cancelVoice();
  if (battle?.timer) clearInterval(battle.timer);
  battle = null;
  exploration = null;
  if (panel.open) panel.close();
  panelReturn = null;
  root.onpointerdown = root.onpointerup = root.onpointercancel = null;
}
function mount(html, nextRoute) {
  cleanup();
  clearTimeout(toastTimer);
  document.querySelector("#toast").classList.remove("visible");
  route = nextRoute;
  root.innerHTML = html;
  root.querySelectorAll('.scene').forEach(n=>n.dataset.motion=String(save.settings.motion));
  root.querySelectorAll(".hotspot").forEach((b) => {
    const label = document.createElement("span");
    label.append(...b.childNodes);
    b.append(label);
  });
  document.documentElement.lang = save.world === "th" ? "zh-CN" : "th";
  document.documentElement.dataset.appReady = "true";
  root.dataset.route = route;
  window.HUILAISHI_APP_READY = true;
  window.__XULONG_APP_READY__ = true;
  globalThis.HuilaishiNative?.reportStartupStage?.("app-ready");
  globalThis.HuilaishiNative?.setAppLandscape?.(true);
}
function scenery(src, framed = false) {
  return (
    (framed?'<div class="battle-camera">':'')+'<img class="backdrop" src="' +
    esc(src) +
    '" alt="" draggable="false">'+(framed?'</div>':'')+'<canvas class="actors" aria-hidden="true"></canvas>'
  );
}
function stageAt(canvas, options = {}) {
  const s = new Stage(canvas, {
    onError: () =>
      toast(
        tx(
          "部分美术未加载，可返回后重试。",
          "ภาพบางส่วนโหลดไม่ได้ กรุณาลองใหม่",
        ),
      ),
    ...options,
  });
  s.setMotion(save.settings.motion);
  stages.push(s);
  return s;
}
function sceneStage(scene, options = {}) {
  const s = stageAt($(".actors"), {
    ground: scene?.includes("th-archive") ? 0.64 : 0.8,
    ...((options.battle||options.exploration)?{composition:SCENE_STAGING[scene.split('/').pop()],cameraImage:$('.battle-camera .backdrop')}:{}),
    ...options,
  });
  s.equip(outfit().sheet);
  return s;
}
function hud(title = "", sub = "", back = "home") {
  return (
    '<header class="hud"><div class="hud-left">' +
    ib(back, tx("返回", "กลับ"), "left") +
    '<div class="identity"><strong>' +
    esc(HEROES[save.world].name) +
    "</strong><small>" +
    tx("散页之城 · 泰国篇", "เมืองหน้ากระดาษ · โลกจีน") +
    '</small></div></div><div class="hud-title"><strong>' +
    esc(title) +
    "</strong><small>" +
    esc(sub) +
    '</small></div><div class="hud-right"><span class="currency">' +
    icon("coin") +
    "<span data-points>" +
    save.points +
    "</span></span>" +
    ib("settings", tx("设置", "ตั้งค่า"), "settings") +
    "</div></header>"
  );
}
function openPanel(title, body, footer = "", onClose = null) {
  pauseBattle();
  if(['home','wardrobe','explore'].includes(route)&&stages[0]){stages[0].moving=0;stages[0].destination=null;stages[0].setPaused(true);}
  if (battle?.phase === 'voice') {battle.voiceToken++; enterVoiceRecovery(battle,'cancelled');battle.stage.setPose('idle');}
  cancelVoice();
  const previous = panelReturn;
  panelReturn = null;
  previous?.();
  panelReturn = onClose;
  panel.className = root.querySelector('.battle-correspondence') ? 'stage-panel' : '';
  panel.innerHTML =
    '<div class="panel-head"><h2>' +
    esc(title) +
    "</h2>" +
    ib("close-panel", tx("关闭", "ปิด"), "close") +
    '</div><div class="panel-body">' +
    body +
    '</div><div class="panel-foot">' +
    (footer || button("close-panel", tx("知道了", "เข้าใจแล้ว"), "primary")) +
    "</div>";
  if (!panel.open) panel.showModal();
  panel.querySelector(".panel-body").scrollTop = 0;
}
function closePanel() {
  if (!panel.open) return;
  const fn=panelReturn;panelReturn=null;
  panel.close();fn?.();resumeBattle();
  if(['home','wardrobe','explore'].includes(route)&&!panel.open)stages[0]?.setPaused(false);
}
panel.addEventListener("close", () => {
  // A retry can open a new error dialog before the previous close event arrives.
  // Never dispose the new dialog's recorder or resume its paused battle.
  if(panel.open)return;
  const fn = panelReturn;
  panelReturn = null;
  fn?.();
  resumeBattle();
  if(['home','wardrobe','explore'].includes(route))stages[0]?.setPaused(false);
});
function audioWord(unit) {
  return (
    '<button class="icon-btn" data-audio="' +
    esc(unit.id) +
    '" aria-label="' +
    esc(tx("听标准示范", "ฟังตัวอย่างเสียง")) +
    '">' +
    icon("sound") +
    "</button>"
  );
}
function lessonRows(items) {
  return items
    .map(
      (u, i) =>
        '<div class="lesson-row"><small>' +
        String(i + 1).padStart(2, "0") +
        '</small><div><strong lang="' +
        lang() +
        '">' +
        esc(targetOf(u)) +
        "</strong><p>" +
        esc(sourceOf(u)) +
        "</p></div>" +
        audioWord(u) +
        "</div>",
    )
    .join("");
}
function initMusic() {
  if (!save.settings.music || document.hidden || battle?.phase==='voice' || (panel.open && panel.querySelector('.voice-check'))) return;
  if (!music) {
    music = new Audio(
      new URL("./assets/audio/music/after-school-v123.mp3", import.meta.url),
    );
    music.loop = true;
    music.volume = 0.15;
  }
  music.play().catch(() => {});
}
function duck(on) {
  if (music) music.volume = on ? 0.04 : 0.15;
}

function worlds() {
  mount(
    '<main class="worlds">' +
      ["th", "cn"]
        .map(
          (w) =>
            '<section class="world-half">' +
            scenery(chapterScene(w,0)) +
            '<div class="world-pick"><small>' +
            (w === "th"
              ? "小艾 · 前往泰语世界"
              : "CHANINDA · เดินทางสู่โลกภาษาจีน") +
            "</small><h2>" +
            (w === "th" ? "循声，去见你" : "ตามเสียงไปพบเธอ") +
            "</h2>" +
            button(
              "world:" + w,
              w === "th"
                ? "我是中国人 · 学泰语"
                : "ฉันเป็นคนไทย · เรียนภาษาจีน",
              "primary",
              "arrow",
            ) +
            "</div></section>",
        )
        .join("") +
      '<div class="brand"><p>两座城市，一封未寄出的信</p><h1>XULONG <i>pasa</i></h1><span>THE LETTER BETWEEN US</span></div><div class="edition">' +
      tx(
        "冒险 · 独立对比版，不影响旧版进度",
        "เวอร์ชันทดลองแยก บันทึกไม่ทับแอปเดิม",
      ) +
      '</div><div class="portrait-choice">' +
      button("world:th", "学泰语", "primary") +
      button("world:cn", "เรียนจีน", "") +
      "</div></main>",
    "worlds",
  );
  root.querySelectorAll(".actors").forEach((c, i) => {
    const s = stageAt(c);
    s.heroX = 0.5;
    s.equip(HEROES[i ? "cn" : "th"].sheet);
  });
}
function chooseWorld(w) {
  save.world = w;
  commit();
  initMusic();
  if (!save.intro) prologue(0);
  else home();
}
function prologue(page = 0) {
  const texts = [
    [
      "那天，我们把约定写在同一张纸上。",
      "วันนั้น เราเขียนคำสัญญาลงบนกระดาษแผ่นเดียวกัน",
    ],
    [
      "风暴撕开了纸页，也把两个人送进不同的城市。",
      "พายุฉีกกระดาษและพาเราสองคนไปอยู่คนละเมือง",
    ],
    [
      "这里的语言能唤醒信纸。学会说出它们，就能把下一封信送到她／他手中。",
      "ภาษาในโลกนี้ปลุกจดหมายให้มีชีวิต เรียนรู้ที่จะพูด แล้วส่งจดหมายไปถึงคนรัก",
    ],
  ];
  mount(
    '<main class="scene prologue">' +
      scenery(ASSET(page === 1 ? "clock-canal.png" : "th-home-v4.png")) +
      '<div class="prologue-copy"><small>0' +
      (page + 1) +
      " / 03</small><h2>" +
      tx("风把你带到哪里", "สายลมพาเธอไปที่ไหน") +
      "</h2><p>" +
      tx(...texts[page]) +
      '</p></div><div class="bottom-bar">' +
      button("skip-intro", tx("跳过剧情", "ข้ามเรื่องราว"), "quiet") +
      button(
        page === 2 ? "skip-intro" : "intro:" + (page + 1),
        page === 2 ? tx("展开这封信", "เปิดจดหมาย") : tx("继续", "ต่อไป"),
        "primary",
        "arrow",
      ) +
      "</div></main>",
    "intro",
  );
  const s = sceneStage("");
  s.heroX = 0.7;
}
function finishIntro() {
  save.intro = true;
  commit();
  home();
}
function home() {
  const p = progress(),
    c = CHAPTERS[p.chapter];
  const entry=(action,label,sub,glyph,featured=false)=>'<button class="home-entry '+(featured?'featured':'')+'" data-action="'+action+'">'+icon(glyph)+'<span><b>'+esc(label)+'</b><small>'+esc(sub)+'</small></span>'+icon('arrow')+'</button>';
  const utility=(action,label,glyph)=>'<button class="home-utility" data-action="'+action+'">'+icon(glyph)+'<span>'+esc(label)+'</span></button>';
  mount(
    '<main class="scene home-scene">' +
      scenery(chapterScene(save.world, 0)) +
      '<header class="home-header"><div class="home-wordmark">XULONG <i>pasa</i><small>'+tx('课后的另一场冒险','การผจญภัยหลังเลิกเรียน')+'</small></div><div class="home-account">'+
      button('worlds',tx('泰语旅途','เส้นทางภาษาจีน'),'home-world','map')+
      '<span class="currency">'+icon('coin')+'<span data-points>'+save.points+'</span></span>'+ib('settings',tx('设置','ตั้งค่า'),'settings')+'</div></header>'+
      '<section class="home-story"><span class="home-eyebrow">'+tx('散页之城 · 河畔','เมืองหน้ากระดาษ · ริมคลอง')+'</span><h1>'+tx('风把你的声音<br>带到这里。','ให้ลมพาเสียงเธอ<br>มาถึงที่นี่')+'</h1><p class="home-dialogue" aria-live="polite">'+tx('另一座城市，有人在等你的下一封信。','อีกเมืองหนึ่ง มีคนรอจดหมายฉบับต่อไปจากเธอ')+'</p></section>'+
      '<nav class="home-paths" aria-label="'+tx('开始旅途','เริ่มการเดินทาง')+'">'+
      entry('continue',campaignComplete(save,save.world)?tx('重看结局','ชมตอนจบอีกครั้ง'):tx('继续冒险','ผจญภัยต่อ'),nameOf(c)+' · '+tx('本章 ','บทนี้ ')+p.cleared.filter(id=>id.startsWith(save.world+':'+p.chapter+':')).length+'/3','mail',true)+
      entry('arena',tx('校园声斗赛','ลานประลองเสียง'),tx('听懂出招 · 跟读蓄能','ฟังแล้วโจมตี · พูดตามสะสมพลัง'),'sword')+
      entry('map',tx('循声之路','เส้นทางตามเสียง'),tx('八段旅程，慢慢走近彼此','แปดบท ค่อย ๆ เดินเข้าใกล้กัน'),'map')+'</nav>'+
      '<button class="hero-greeting" data-action="hero-greet" aria-label="'+esc(tx('和小艾打招呼','ทักทาย CHANINDA'))+'"><span>'+esc(HEROES[save.world].name)+' · '+tx('打个招呼','ทักทาย')+'</span></button>'+
      '<nav class="home-tools" aria-label="'+tx('随身物品','ของติดตัว')+'">'+utility('wardrobe',tx('衣橱','เสื้อผ้า'),'shirt')+utility('letters',tx('来信','จดหมาย'),'mail')+utility('journal',tx('手记','สมุด'),'book')+utility('bestiary',tx('相遇','มอนสเตอร์'),'leaf')+'</nav>'+
      '<div class="home-walking"><small>'+tx('点地面走走','แตะพื้นเพื่อเดิน')+'</small><div class="cluster"><button class="icon-btn move-btn" data-move="-1" aria-label="'+tx('向左走','เดินซ้าย')+'">'+icon('left')+'</button><button class="icon-btn move-btn" data-move="1" aria-label="'+tx('向右走','เดินขวา')+'">'+icon('right')+'</button></div></div>'+
      '<small class="home-version">0.3.1 · '+tx('两城的颜色','สีสันของสองเมือง')+'</small></main>',
    "home",
  );
  const scene=$('.home-scene'),greet=$('.hero-greeting');
  const s=sceneStage('',{depth:true,ground:.84,foreground:save.world+'-foreground-v3.png',onSpatialUpdate:(x,y,height,motion)=>{
    scene.style.setProperty('--camera-x',((motion?(x-.47)*-14:0).toFixed(2))+'px');
    scene.style.setProperty('--camera-y',((motion?(y-.79)*-18:0).toFixed(2))+'px');
    greet.style.left=(x*100)+'%';greet.style.top=((y-height)*100)+'%';greet.style.height=(height*100)+'%';
  }});
  s.heroX=innerHeight>innerWidth?.25:.47;
  s.perform([{pose:'read',ms:2400},{pose:'idle',ms:700},{pose:'listen',ms:1200}]);
  bindWalking();
}
function greetHero() {
  if(route!=='home'||panel.open)return;
  const s=stages[0],moments=save.world==='th'?[
    ['小艾','她总说我回信太短。下一封，我想把整段河风都写给她。'],
    ['小艾','刚才那句我没听明白。没关系，慢一点，再听一次。'],
    ['小艾','找到她以后，我想和她一起走完这条街。今天先往前一点。'],
  ]:[
    ['CHANINDA','ฉันเก็บจดหมายทุกฉบับไว้ รอวันที่จะอ่านให้小艾ฟังต่อหน้า'],
    ['CHANINDA','ถ้ายังฟังไม่เข้าใจ เราค่อย ๆ ฟังอีกครั้งก็ได้ ไม่ต้องรีบ'],
    ['CHANINDA','พอได้เจอกัน ฉันอยากเดินถนนเส้นนี้กับเขา วันนี้ไปต่ออีกนิดนะ'],
  ];
  const moment=moments[(s.conversationIndex||0)%moments.length];s.conversationIndex=(s.conversationIndex||0)+1;
  $('.home-dialogue').innerHTML='<b>'+esc(moment[0])+'</b>'+esc(moment[1]);
  $('.home-story').classList.add('has-conversation');
  $('.hero-greeting>span').textContent=HEROES[save.world].name+' · '+tx('再聊一句','คุยอีกนิด');
  s.perform([{pose:'wave',ms:750},{pose:'speak',ms:950},{pose:'listen',ms:650},...HERO_MOMENTS[['unfold','respond','offer'][(s.conversationIndex-1)%3]]]);
}
function bindWalking() {
  root.onpointerdown = (e) => {
    if(panel.open)return;
    const b = e.target.closest("[data-move]");
    if (!b) {
      if(['home','explore'].includes(route)&&!e.target.closest('button,nav,header,section')){
        const r=root.getBoundingClientRect(),y=(e.clientY-r.top)/r.height;
        if(y>.6)stages[0]?.walkTo((e.clientX-r.left)/r.width,y);
      }
      return;
    }
    const s = stages[0];
    if (s) {
      s.moving = Number(b.dataset.move);
      b.setPointerCapture(e.pointerId);
    }
  };
  root.onpointerup = root.onpointercancel = () => {
    if (stages[0]) stages[0].moving = 0;
  };
}
function mapScreen() {
  const p = progress();
  mount(
    '<main class="scene map-screen">' +
      scenery(chapterScene(save.world, p.chapter)) +
      hud(tx("循声之路", "เส้นทางตามเสียง")) +
      '<div class="map-intro"><h2>' +
      tx("从一个词，到一封完整的信", "จากคำหนึ่งคำ สู่จดหมายที่สมบูรณ์") +
      "</h2><p>" +
      tx(
        "每章三场相遇 · 听懂、回应，再把故事往前推",
        "สามการพบกันในแต่ละบท ฟัง ตอบ แล้วเดินเรื่องต่อ",
      ) +
      '</p></div><div class="chapter-map">' +
      CHAPTERS.map(
        (c, i) =>
          '<button class="map-node ' +
          (i === p.chapter ? "active" : "") +
          '" data-action="chapter:' +
          i +
          '" ' +
          (canEnter(save, save.world, i) ? "" : "disabled") +
            '><img class="map-thumbnail" src="'+chapterScene(save.world,i)+'" alt="" loading="lazy"><span class="number">' +
          String(i + 1).padStart(2, "0") +
          " " +
          (p.letters.includes(i)
            ? icon("check")
            : i > p.chapter
              ? icon("lock")
              : "") +
          "</span><b>" +
          esc(nameOf(c)) +
          "</b><small>" +
          esc(tx(c.skillZh, c.skillTh)) +
          "</small></button>",
      ).join("") +
      '</div><div class="bottom-bar"><span class="save-note">' +
      tx(
        "已走过 "+completeCampaignCount(save,save.world)+" / 24 场相遇 · 已通关的地方可以重访",
        "ผ่านแล้ว "+completeCampaignCount(save,save.world)+" / 24 ครั้ง · กลับไปเยี่ยมด่านเดิมได้",
      ) +
      "</span>" +
      button(
        "continue",
        tx("回到当前旅程", "กลับสู่บทปัจจุบัน"),
        "primary",
        "arrow",
      ) +
      "</div></main>",
    "map",
  );
}
function chapterMenu(c) {
  if (!canEnter(save, save.world, c)) return;
  openPanel(
    nameOf(CHAPTERS[c]),
    '<p class="muted">' +
      tx(CHAPTERS[c].skillZh, CHAPTERS[c].skillTh) +
      "</p>" +
      [0, 1, 2]
        .map((s) => {
          const m = monsterFor(save.world, s, c);
          return (
            '<div class="lesson-row"><span>' +
            String(s + 1).padStart(2, "0") +
            "</span><div><strong>" +
            esc(nameOf(m)) +
            "</strong><p>" +
            tx(["相遇", "精英", "首领"][s], ["พบกัน", "ชั้นยอด", "บอส"][s]) +
            '</p></div><button class="paper-btn primary" data-action="encounter:' +
            c +
            ":" +
            s +
            '" ' +
            (canEnter(save, save.world, c, s) ? "" : "disabled") +
            ">" +
            tx("前往", "ไป") +
            "</button></div>"
          );
        })
        .join(""),
  );
}
function encounter(c = progress().chapter, s = progress().stage) {
  if (!canEnter(save, save.world, c, s)) {
    toast(tx("先完成前面的相遇。", "ผ่านการพบกันก่อนหน้าก่อน"));
    return;
  }
  const m = monsterFor(save.world, s, c),
    w = progress();
  if (!w.encountered.includes(m.id)) {
    w.encountered.push(m.id);
    commit();
  }
  mount(
    '<main class="scene explore-scene">' +
      scenery(chapterScene(save.world, c),true) +
      hud(
        nameOf(CHAPTERS[c]),
        tx("沿途有些话，值得停一下", "บางข้อความระหว่างทาง คุ้มที่จะหยุดอ่าน"),
      ) +
      '<div class="field-caption"><small>'+tx('沿途拾记','ความทรงจำระหว่างทาง')+'</small><strong>'+esc(tx(...fieldNote(save.world,c).title))+'</strong><span>'+tx('点纸签，走近看看','แตะป้ายกระดาษเพื่อเดินเข้าไปดู')+'</span></div>'+
      '<button class="field-marker" data-action="field-open" aria-label="'+esc(tx('查看线索：','ดูเบาะแส: ')+tx(...fieldNote(save.world,c).title))+'">'+icon(fieldNote(save.world,c).glyph)+'<span>'+tx('拾起一页','เก็บหน้ากระดาษ')+'</span></button>'+
      '<p class="field-after" aria-live="polite" hidden></p>'+
      '<div class="bottom-bar"><div class="cluster"><button class="icon-btn" data-move="-1" aria-label="' +
      tx("向左走", "เดินซ้าย") +
      '">' +
      icon("left") +
      '</button><button class="icon-btn" data-move="1" aria-label="' +
      tx("向右走", "เดินขวา") +
      '">' +
      icon("right") +
      "</button></div>" +button('field-album',tx('沿途拾记','ความทรงจำระหว่างทาง'),'quiet','book')+
      button(
        "brief:" + c + ":" + s,
        tx("和它说说话", "คุยกับมัน"),
        "primary",
        "mail",
      ) +
      "</div></main>",
    "explore",
  );
  exploration={chapter:c,rank:s,note:fieldNote(save.world,c),attempt:makeFieldAttempt(fieldNote(save.world,c)),approaching:false};
  const st = sceneStage(chapterScene(save.world, c),{exploration:true});
  st.opponent(m, s);
  st.heroX=.18;
  refreshField();
  bindWalking();
}
function refreshField(){
  if(!exploration)return;
  const done=progress().discoveries.includes(exploration.note.id),marker=$('.field-marker');
  marker.dataset.found=String(done);
  marker.querySelector('span').textContent=tx(done?'重读这一页':'拾起一页',done?'อ่านหน้านี้อีกครั้ง':'เก็บหน้ากระดาษ');
  $('.field-caption span').textContent=done?tx('这一页已收进拾记','เก็บหน้านี้ในสมุดแล้ว'):tx('点纸签，走近看看','แตะป้ายกระดาษเพื่อเดินเข้าไปดู');
}
function visitField(){
  if(!exploration||route!=='explore'||panel.open)return;
  const e=exploration,s=stages[0];
  if(e.approaching||!s.motion||progress().discoveries.includes(e.note.id)){e.approaching=false;showField();return;}
  e.approaching=true;s.walkTo(.26,s.heroY);
  const arrive=()=>{
    if(exploration!==e||!e.approaching||panel.open)return;
    if(s.destination){later(arrive,50);return;}
    if(!e.picking){e.picking=true;s.previewHero('pickup');}
    if(s.performance){later(arrive,50);return;}
    e.picking=false;e.approaching=false;showField();
  };
  later(arrive,50);
}
function showField(message=''){
  const e=exploration;if(!e||route!=='explore')return;
  const n=e.note,a=e.attempt,done=progress().discoveries.includes(n.id),phase=done?'done':a.phase;
  e.approaching=false;e.picking=false;
  const line='<div class="field-fragment"><span lang="'+lang()+'">'+esc(targetOf(n.lesson))+'</span>'+audioWord(n.lesson)+'</div>';
  const meaning='<p class="field-meaning">'+esc(sourceOf(n.lesson))+'</p>';
  let body='<p class="field-step">'+tx('沿途拾记','ความทรงจำระหว่างทาง')+' / '+String(n.chapter+1).padStart(2,'0')+' <span>'+tx(phase==='read'?'01 · 读懂':phase==='act'?'02 · 行动':'已留在手记里',phase==='read'?'01 · อ่านให้เข้าใจ':phase==='act'?'02 · ลงมือทำ':'เก็บในสมุดแล้ว')+'</span></p>';
  body+='<p class="field-opening">'+esc(tx(...(phase==='done'?n.outcome:n.opening)))+'</p>'+line;
  if(phase!=='read'||a.help)body+=meaning;
  if(phase==='done')body+='<blockquote class="field-reply"><b>'+esc(HEROES[save.world].name)+'</b>'+esc(tx(...n.reply))+'</blockquote>';
  else{
    body+='<h3>'+esc(phase==='read'?tx('纸上写着什么意思？','บนกระดาษเขียนว่าอะไร'):tx(...n.question))+'</h3>';
    body+='<div class="field-choices">'+(phase==='read'?a.words.map(u=>button('field-word:'+u.id,sourceOf(u),'field-choice')):a.choices.map(o=>button('field-act:'+o.id,tx(...o.text),'field-choice'))).join('')+'</div>';
    body+='<p class="field-feedback" role="status">'+esc(message||tx('不用抢答，先把话读完。','ไม่ต้องรีบตอบ อ่านให้จบก่อน'))+'</p>';
  }
  body+='<p class="field-learning-note">'+tx('剧情练习 · 不计时、不扣血，也不计入独立掌握。','ฝึกผ่านเรื่องราว · ไม่จับเวลา ไม่เสียพลัง และไม่นับเป็นการตอบได้ด้วยตัวเอง')+'</p>';
  const footer=(phase==='read'&&!a.help?button('field-help',tx('看中文释义','ดูความหมายภาษาไทย'),'quiet','book'):'')+button('close-panel',tx(phase==='done'?'收好，继续走':'先放一放',phase==='done'?'เก็บไว้ แล้วเดินต่อ':'พักไว้ก่อน'),'primary',phase==='done'?'check':'left');
  openPanel(tx(...n.title),body,footer,()=>{
    stopAudio();
    if(exploration===e&&!panel.open){
      stages[0]?.previewHero(phase==='done'?'respond':'read');
      const after=$('.field-after');if(phase==='done'){after.hidden=false;later(()=>{after.hidden=true;},6500);}
      $('.field-marker')?.focus({preventScroll:true});
    }
  });
  panel.className='field-panel';
  stages[0].setPaused(false);
  stages[0].previewHero(phase==='done'?'offer':phase==='act'?'respond':'unfold');
}
function fieldAnswer(phase,value){
  const e=exploration;if(!e||!panel.classList.contains('field-panel')||!panel.open||progress().discoveries.includes(e.note.id))return;
  const result=answerField(e.attempt,e.note,phase,value);
  if(result==='ignored')return;
  if(result==='done'){
    rememberField(save,e.note);commit();refreshField();
    const after=$('.field-after');after.textContent=HEROES[save.world].name+' · '+tx(...e.note.reply);after.hidden=true;
  }
  showField(result==='wrong'?tx('这和纸上的意思还不一样。再读一遍，或听一次示范。','ยังไม่ตรงกับข้อความ ลองอ่านหรือฟังตัวอย่างอีกครั้ง'):'');
}
function fieldAlbum(){
  const notes=FIELD_NOTES[save.world].filter(n=>progress().discoveries.includes(n.id));
  openPanel(tx('沿途拾记','ความทรงจำระหว่างทาง'),'<p class="muted">'+tx('留下 '+notes.length+' / 8 段记忆。不用赶着收齐，路过时读一页就好。','เก็บแล้ว '+notes.length+' / 8 ความทรงจำ ไม่ต้องรีบเก็บให้ครบ อ่านเมื่อเดินผ่านก็พอ')+'</p>'+notes.map(n=>'<article class="field-keepsake"><small>'+String(n.chapter+1).padStart(2,'0')+'</small><h3>'+esc(tx(...n.title))+'</h3><p>'+esc(tx(...n.outcome))+'</p><div class="field-fragment"><span lang="'+lang()+'">'+esc(targetOf(n.lesson))+'</span>'+audioWord(n.lesson)+'</div><p class="field-meaning">'+esc(sourceOf(n.lesson))+'</p><blockquote>'+esc(tx(...n.reply))+'</blockquote></article>').join(''),'',()=>stopAudio());
}
function encounterActs(m, codex = false) {
  const script=m.boss||m.craft;
  if(!script)return '';
  return '<div class="'+(codex?'codex-acts':'boss-brief')+'">'+script.acts.map((act,i)=>{
    const label=m.boss?tx(i?'第二幕 · 半血后':'第一幕',i?'ช่วงสอง · พลังครึ่งหนึ่ง':'ช่วงแรก'):script.second?tx(i?'破甲后':'护甲阶段',i?'หลังเปิดเกราะ':'ช่วงเกราะ'):tx('它的专属节奏','จังหวะเฉพาะตัว');
    return '<p><small>'+label+'</small><strong>'+esc(tx(...act))+'</strong>'+(codex?'':'<span>'+[...new Set(i?script.second:script.first)].map(challengeName).join(' / ')+'</span>')+'</p>';
  }).join('')+'</div>';
}
function brief(c, s) {
  const m = monsterFor(save.world, s, c);
  openPanel(
    nameOf(m),
    '<p class="paper-letter">' +
      esc(tx(m.loreZh, m.loreTh)) +
      "</p><h3>" +
      tx("先认识这些话", "รู้จักคำเหล่านี้ก่อน") +
      "</h3>" +
      lessonRows(LESSONS[c]) +
      '<p class="muted">' +
      esc(tx(m.counterZh, m.counterTh)) +
      "</p>"+((m.boss||m.craft)?encounterActs(m):m.connection?'<p class="encounter-rule">'+tx('这一场会交替出现听力和双语连线。连线先准备，再手动开始计时；它考的是认字，不需要麦克风。','ด่านนี้สลับฟังเสียงกับจับคู่สองภาษา การจับคู่จะเริ่มจับเวลาเมื่อกดเริ่ม เป็นการฝึกอ่าน ไม่ต้องใช้ไมโครโฟน')+'</p>':''),
    button(
      "start:" + c + ":" + s,
      tx("进入校园声斗赛", "เริ่มประลองเสียง"),
      "primary",
      "sword",
    ),
  );
}

async function journal() {
  const stamp=epoch,wanted=save.world;
  if(Object.keys(progress().mastery).some(id=>!findUnit(id))){
    try{const entries=await loadDictionary();if(stamp!==epoch||wanted!==save.world)return;for(const u of entries)if(progress().mastery[u.id])practiceUnits.set(u.id,u);}catch{}
  }
  const w = progress(),
    seen = Object.keys(w.mastery),
    due = dueWords(save, save.world),
    units = seen.map(findUnit).filter(Boolean),
    skillCount = skill=>Object.values(w.mastery).filter(m=>m.skills?.[skill]?.correct>0).length;
  mount(
    '<main class="scene">' +
      scenery(
        ASSET(save.world === "th" ? "th-archive.png" : "cn-workshop.png"),
      ) +
      hud(tx("随身手记", "สมุดบันทึก")) +
      '<article class="notebook"><section><small>' +
      tx("沿途记下的声音", "เสียงที่จดไว้ระหว่างทาง") +
      "</small><h2>" +
      tx("今天，再听一遍", "วันนี้ ฟังอีกครั้ง") +
      "</h2><p>" +
      tx(
        "遇见 " + seen.length + " 条表达 · " + due.length + " 条等待回顾",
        "พบ " + seen.length + " สำนวน · รอทบทวน " + due.length + " รายการ",
      ) +
      '</p><p class="skill-summary">'+tx('本版独立练习记录：听懂 '+skillCount('listening')+' · 认字 '+skillCount('reading')+' · 句序 '+skillCount('sequence'),'บันทึกการตอบเองในรุ่นนี้: ฟัง '+skillCount('listening')+' · อ่าน '+skillCount('reading')+' · เรียงประโยค '+skillCount('sequence'))+'</p>' +
      lessonRows(
        (due.length
          ? units.filter((u) => due.includes(u.id))
          : LESSONS[0]
        ).slice(0, 3),
      ) +
      "</section><section><small>FIELD NOTES</small><h2>" +
      tx("把话留在身边", "เก็บคำไว้ใกล้ตัว") +
      "</h2><p>" +
      tx(
        "3290 条去重词条，可离线查找。长句独立编写，母语教师终审仍待完成。",
        "ค้นหา 3290 คำแบบออฟไลน์ ประโยคใหม่ยังรอครูเจ้าของภาษาตรวจขั้นสุดท้าย",
      ) +
      "</p>" +
      button(
        "dictionary",
        tx("翻开中泰词库", "เปิดคลังคำจีน–ไทย"),
        "primary",
        "book",
      ) +
      button("letters", tx("读收到的信", "อ่านจดหมาย"), "dark", "mail") +
      button('field-album',tx('翻开沿途拾记','เปิดความทรงจำระหว่างทาง'),'quiet','leaf')+
      '<p class="muted">' +
      tx(
        "听过不等于掌握。只有不看提示独立答对，才推进复习间隔。",
        "ฟังแล้วไม่เท่ากับจำได้ ต้องตอบเองโดยไม่ดูคำใบ้ จึงเพิ่มช่วงทบทวน",
      ) +
      '</p></section></article><div class="bottom-bar">' +
      button("home", tx("收好手记", "เก็บสมุด"), "quiet", "left") +
      "</div></main>",
    "journal",
  );
}
async function dictionary() {
  openPanel(
    tx("中泰随身词库", "คลังคำจีน–ไทย"),
    '<input class="search-input" id="dictionary-search" type="search" placeholder="' +
      tx("搜索中文或泰文", "ค้นหาคำจีนหรือไทย") +
      '" aria-label="' +
      tx("搜索词库", "ค้นหาคำ") +
      '"><p class="muted" id="search-count">' +
      tx("正在翻开词库…", "กำลังเปิดคลังคำ…") +
      '</p><div class="search-results"></div>',
  );
  const mark = panel.querySelector("#dictionary-search");
  try {
    const entries = await loadDictionary();
    if (!mark.isConnected) return;
    function filter() {
      const q = normalized(mark.value);
      const hits = entries.filter(
        (x) =>
          !q || normalized(x.zh).includes(q) || normalized(x.th).includes(q),
      );
      panel.querySelector("#search-count").textContent = tx(
        "找到 " + hits.length + " 条 · 每次显示前 40 条",
        "พบ " + hits.length + " รายการ · แสดง 40 รายการแรก",
      );
      const list = panel.querySelector(".search-results");
      list.innerHTML = hits
        .slice(0, 40)
        .map(
          (u, i) =>
            '<div class="search-row"><div><strong>' +
            esc(targetOf(u)) +
            "</strong><span>" +
            esc(sourceOf(u)) +
            '</span></div><button class="icon-btn" data-dict-index="' +
            i +
            '" aria-label="' +
            tx("播放读音", "ฟังเสียง") +
            '">' +
            icon("sound") +
            "</button></div>",
        )
        .join("");
      list.onclick = (e) => {
        const b = e.target.closest("[data-dict-index]");
        if (b) playUnit(hits[Number(b.dataset.dictIndex)]);
      };
    }
    mark.addEventListener("input", filter);
    filter();
  } catch {
    if (mark.isConnected)
      panel.querySelector("#search-count").textContent = tx(
        "词库暂时没加载成功，请关闭后再试。",
        "โหลดคลังคำไม่ได้ กรุณาลองใหม่",
      );
  }
}
function letters() {
  const letters = progress().letters;
  openPanel(
    tx("另一座城市的来信", "จดหมายจากอีกเมือง"),
    letters.length
      ? letters
          .map(
            (i) =>
              '<article class="paper-letter"><small>' +
              String(i + 1).padStart(2, "0") +
              " · " +
              esc(nameOf(CHAPTERS[i])) +
              "</small><p>" +
              esc(tx(CHAPTERS[i].letterZh, CHAPTERS[i].letterTh)) +
              "</p></article>",
          )
          .join("")
      : '<p class="paper-letter">' +
          tx(
            "“我在另一座城市等你。”<br>完成第一章三场相遇，就能收到第一封完整的回信。",
            "“ฉันรอเธออยู่ในอีกเมือง”<br>ผ่านสามการพบกันในบทแรก เพื่อรับจดหมายตอบฉบับสมบูรณ์",
          ) +
          "</p>",
  );
}
function wardrobe(previewId = save.equipped[save.world]) {
  const selected =
    OUTFITS.find((o) => o.id === previewId && o.world === save.world) ||
    outfit();
  mount(
    '<main class="scene wardrobe-scene">' +
      scenery(
        ASSET(save.world === "th" ? "th-wardrobe.png" : "cn-workshop.png"),
      ) +
      hud(tx("课后衣橱", "ตู้เสื้อผ้าหลังเลิกเรียน")) +
      '<div class="wardrobe-copy"><small>AFTER SCHOOL / ' +
      esc(HEROES[save.world].name) +
      "</small><h2>" +
      esc(nameOf(selected)) +
      "</h2><p>" +
      esc(tx(HEROES[save.world].storyZh, HEROES[save.world].storyTh)) +
      '</p></div><div class="wardrobe-stage"><canvas class="actors" aria-hidden="true"></canvas></div><div class="outfit-list">' +
      OUTFITS.filter((o) => o.world === save.world)
        .map(
          (o) =>
            '<button class="outfit ' +
            (o.id === selected.id ? "selected" : "") +
            '" data-action="outfit-preview:' +
            o.id +
            '" style="--outfit-color:' +
            o.color +
            '">' +
            '<span class="outfit-art"><canvas data-outfit-art="'+o.id+'" aria-hidden="true"></canvas>'+icon('shirt')+'</span>' +
            "<strong>" +
            esc(nameOf(o)) +
            "</strong><small>" +
            (save.outfits.includes(o.id)
              ? save.equipped[save.world] === o.id
                ? tx("正在穿着", "กำลังสวม")
                : tx("已拥有", "มีแล้ว")
              : o.cost + " " + tx("纸币", "เหรียญกระดาษ")) +
            "</small></button>",
        )
        .join("") +
      '</div><div class="wardrobe-actions"><label for="hero-moment">'+tx('看看动作','ดูการเคลื่อนไหว')+'</label><div><select id="hero-moment">'+[
        ['idle','站立','ยืน'],['walk','走路','เดิน'],['greet','打招呼','ทักทาย'],['read','读信','อ่านจดหมาย'],['echo','听与跟读','ฟังและพูดตาม'],
        ['attack','蓄力出招','เตรียมโจมตี'],['guard','防守','ป้องกัน'],['dodge','闪避','หลบ'],['hit','受击恢复','ฟื้นตัว'],['victory','庆祝','ดีใจ'],
        ...(INTERACTION_SHEETS[selected.sheet]?[['pickup','拾起纸页','เก็บกระดาษ'],['unfold','展开信件','คลี่จดหมาย'],['offer','递出信件','ยื่นจดหมาย'],['respond','倾听与回应','ฟังและตอบ']]:[]),
      ].map(([value,zh,th])=>'<option value="'+value+'">'+tx(zh,th)+'</option>').join('')+'</select>'+ib('hero-replay',tx('重播动作','ดูท่าอีกครั้ง'),'replay')+'</div>'+
      '</div><div class="bottom-bar"><span class="save-note">' +
      tx(
        "只用游玩获得的纸币兑换，不出售数值强度。",
        "ใช้เหรียญจากการเล่นเท่านั้น ไม่เพิ่มพลังต่อสู้",
      ) +
      "</span>" +
      button(
        "outfit-buy:" + selected.id,
        save.outfits.includes(selected.id)
          ? tx("穿上这套", "สวมชุดนี้")
          : tx(
              "兑换 · " + selected.cost + " 纸币",
              "แลก · " + selected.cost + " เหรียญ",
            ),
        "primary",
        "shirt",
      ) +
      "</div></main>",
    "wardrobe",
  );
  const background = $(".scene > .actors");
  background?.remove();
  const s = stageAt($(".wardrobe-stage .actors"), {
    heroShowcase: true,
    ground: 0.95,
  });
  s.heroX = 0.5;
  s.equip(selected.sheet);
  $('#hero-moment').addEventListener('change',e=>s.previewHero(e.target.value));
  root.querySelectorAll('[data-outfit-art]').forEach(node=>{
    const item=OUTFITS.find(o=>o.id===node.dataset.outfitArt);
    atlas(item.sheet).then(a=>{
      if(!node.isConnected)return;
      const f=a.frames[0],scale=Math.min(176/f.w,226/f.h);node.width=180;node.height=230;
      node.getContext('2d').drawImage(a.canvas,f.x,f.y,f.w,f.h,(180-f.w*scale)/2,229-f.h*scale,f.w*scale,f.h*scale);
      node.parentElement.dataset.ready='true';
    }).catch(()=>{if(node.isConnected)node.parentElement.dataset.ready='failed'});
  });
}
function purchase(id) {
  const o = OUTFITS.find((x) => x.id === id && x.world === save.world);
  if (!o) return;
  if (!save.outfits.includes(id)) {
    const result = buyOutfit(save, id, o.cost);
    if (!result.ok) {
      toast(
        tx(
          "纸币还不够。通关新相遇可以获得纸币。",
          "เหรียญยังไม่พอ ผ่านการพบกันใหม่เพื่อรับเหรียญ",
        ),
      );
      return;
    }
  }
  save.equipped[save.world] = id;
  commit();
  wardrobe(id);
  toast(
    tx(
      "换好了，下一场也穿这套。",
      "เปลี่ยนแล้ว การต่อสู้ครั้งต่อไปก็ใส่ชุดนี้",
    ),
  );
}
function clearedSpecies(world) {
  return new Set(save.worlds[world].cleared.map(key=>{const [w,c,s]=key.split(':');return w===world?monsterFor(w,Number(s),Number(c))?.id:null}).filter(Boolean));
}
function rosterPortraits() {
  let disposed=false,active=0;const queue=[];const body=panel.querySelector('.panel-body');
  const drain=()=>{while(!disposed&&active<2&&queue.length){const node=queue.shift(),m=MONSTERS.find(m=>m.id===node.dataset.rosterArt);active++;
    atlas(m.sheet).then(a=>{if(disposed||!node.isConnected)return;const f=a.frames[0],scale=Math.min(108/f.w,130/f.h),ctx=node.getContext('2d');node.width=120;node.height=140;ctx.drawImage(a.canvas,f.x,f.y,f.w,f.h,(120-f.w*scale)/2,138-f.h*scale,f.w*scale,f.h*scale);node.dataset.ready='true'}).catch(()=>{node.dataset.ready='failed'}).finally(()=>{active--;drain()});
  }};
  const nodes=[...panel.querySelectorAll('[data-roster-art]')];
  let observer;
  if(globalThis.IntersectionObserver){observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){observer.unobserve(e.target);queue.push(e.target)}drain()},{root:body,rootMargin:'80px'});nodes.forEach(n=>observer.observe(n));}
  else{queue.push(...nodes);drain();}
  return ()=>{disposed=true;queue.length=0;observer?.disconnect()};
}
function bestiary(world = save.world) {
  if(!['th','cn'].includes(world))world=save.world;
  const roster=MONSTERS.filter(m=>m.world===world),cleared=clearedSpecies(world),met=new Set(save.worlds[world].encountered);
  let disposePortraits;
  openPanel(
    tx("不是每一个阻拦，都是敌意", "ไม่ใช่ทุกการขวางทางจะเป็นศัตรู"),
    '<div class="roster-toolbar"><nav class="roster-tabs" aria-label="'+tx('图鉴世界','โลกในสมุด')+'">'+['th','cn'].map(w=>'<button class="paper-btn" data-action="bestiary:'+w+'" aria-pressed="'+(world===w)+'">'+tx(w==='th'?'泰国世界':'中国世界',w==='th'?'โลกไทย':'โลกจีน')+'</button>').join('')+'</nav><p class="roster-progress">'+tx('已和解 ','คืนดีแล้ว ')+cleared.size+' / '+roster.length+' · '+tx('已相遇 ','พบแล้ว ')+new Set([...met,...cleared]).size+'</p></div><p class="muted roster-caption">'+tx('翻阅故事和动作不会改变冒险进度。','ดูเรื่องราวและท่าทางได้ โดยไม่เปลี่ยนความคืบหน้า')+'</p><div class="roster-grid">' +
      roster.map(
        (m) =>
          '<button class="roster-card" data-action="monster:' +
          m.id +
          '"><canvas data-roster-art="'+m.id+'" aria-hidden="true"></canvas><span class="roster-copy"><small>'+tx(['普通','精英','首领'][m.rank],['ทั่วไป','ชั้นยอด','บอส'][m.rank])+'</small><strong>' +
          esc(nameOf(m)) +
          '</strong><em>'+tx(cleared.has(m.id)?'已和解':met.has(m.id)?'已相遇':'尚未相遇',cleared.has(m.id)?'คืนดีแล้ว':met.has(m.id)?'พบแล้ว':'ยังไม่พบ')+'</em></span></button>',
      ).join("") +
      "</div>",'',()=>disposePortraits?.(),
  );
  disposePortraits=rosterPortraits();
}
function monsterDetail(id) {
  const m = MONSTERS.find((x) => x.id === id);
  if (!m) return;
  const poses=m.poseCount===16?[['idle','站姿','ยืน'],['walk','走动','เดิน'],['windup','蓄力','เตรียมโจมตี'],['attack','出招','โจมตี'],['hit','受击','ถูกโจมตี'],['guard','守势','ตั้งรับ'],['dodge','闪避','หลบ'],['listen','倾听','ฟัง'],['skill','专属动作','ท่าเฉพาะ'],['read','查看信物','ดูของสำคัญ'],['greet','问候','ทักทาย'],['defeated','战后','หลังต่อสู้']]:[['idle','站姿','ยืน'],['walk','走动','เดิน'],['windup','蓄力','เตรียมโจมตี'],['attack','出招','โจมตี'],['hit','受击','ถูกโจมตี'],['recover','收招','คืนท่า'],['skill','专属动作','ท่าเฉพาะ']];
  const cleared=clearedSpecies(m.world).has(m.id);
  openPanel(
    nameOf(m),
    '<div class="monster-detail"><div class="codex-visual"><canvas class="codex-actor" aria-hidden="true"></canvas><label class="codex-control">'+tx('动作','ท่าทาง')+'<select data-codex-pose aria-label="'+tx('查看怪物动作','ดูท่ามอนสเตอร์')+'">'+poses.map(([id,zh,th])=>'<option value="'+id+'">'+tx(zh,th)+'</option>').join('')+'</select></label></div><section><p class="paper-letter">' +
      esc(tx(m.loreZh, m.loreTh)) +
      "</p><h3>" +
      tx("看懂它的动作", "อ่านท่าทางของมัน") +
      "</h3><p>" +
      esc(tx(m.tellZh, m.tellTh)) +
      "</p><p>" +
      esc(tx(m.counterZh, m.counterTh)) +
      '</p>'+encounterActs(m,true)+(m.afterZh?'<p class="codex-after">'+(cleared?esc(tx(m.afterZh,m.afterTh)):tx('和它和解后，这里会留下新的回应。','เมื่อคืนดีกัน จะมีคำตอบใหม่ที่นี่'))+'</p>':'')+'</section></div>',
    button("bestiary:"+m.world, tx("返回图鉴", "กลับสมุดมอนสเตอร์"), "quiet") +
      button("codex-pose", tx("看它出招", "ดูท่าโจมตี"), "primary"),
    () => {
      codex?.destroy();
      stages=stages.filter(s=>s!==codex);
      if(window.__codexStage===codex)window.__codexStage=null;
    },
  );
  const codex = stageAt(panel.querySelector("canvas"), { ground: 0.91, codex:true });
  codex.opponent(m, m.rank);
  codex.heroX = 0.5;
  codex.options.codex = true;
  codex.rank = 2;
  window.__codexStage = codex;
}
function settings() {
  openPanel(
    tx("旅途设置", "ตั้งค่าการเดินทาง"),
    '<div class="setting-row"><div><strong>' +
      tx("背景音乐", "ดนตรีพื้นหลัง") +
      "</strong><p>" +
      tx(
        "默认关闭，语音播放时自动降低音量。",
        "ปิดไว้เริ่มต้น และลดเสียงเมื่อฟังบทเรียน",
      ) +
      '</p></div><input aria-label="' +
      tx("背景音乐", "ดนตรีพื้นหลัง") +
      '" type="checkbox" data-setting="music" ' +
      (save.settings.music ? "checked" : "") +
      '></div><div class="setting-row"><div><strong>' +
      tx("动作与镜头反馈", "ภาพเคลื่อนไหว") +
      "</strong><p>" +
      tx("关闭后减少镜头位移与特效。", "ปิดเพื่อลดการเคลื่อนไหวและเอฟเฟกต์") +
      '</p></div><input type="checkbox" data-setting="motion" aria-label="' +
      tx("动作与镜头反馈", "ภาพเคลื่อนไหว") +
      '" ' +
      (save.settings.motion ? "checked" : "") +
      '></div><div class="setting-row"><div><strong>' +
      tx("语音识别可使用网络", "อนุญาตรู้จำเสียงผ่านเครือข่าย") +
      "</strong><p>" +
      tx(
        "启用后，浏览器或系统的语音服务可能上传声音。这里只核对识别文字，不评判口音标准度。",
        "บริการเสียงของระบบหรือเบราว์เซอร์อาจส่งเสียงไปประมวลผล ตรวจเฉพาะข้อความที่รู้จำ ไม่ให้คะแนนสำเนียง",
      ) +
      '</p></div><input type="checkbox" data-setting="networkVoice" aria-label="' +
      tx("语音识别可使用网络", "อนุญาตรู้จำเสียงผ่านเครือข่าย") +
      '" ' +
      (save.settings.networkVoice ? "checked" : "") +
      '></div><p class="muted">' +
      tx(
        "这是独立冒险内测版。新编中泰内容待母语终审；音频商业授权仍需确认。",
        "นี่คือรุ่นทดสอบแยก เนื้อหาใหม่รอครูเจ้าของภาษาตรวจ และต้องยืนยันสิทธิ์เสียงก่อนจำหน่าย",
      ) +
      "</p>",
    button('voice-check',tx('语音自检','ตรวจเสียง'),'quiet','mic') +
    button("worlds", tx("切换世界", "เปลี่ยนโลก"), "quiet", "map") +
      button("close-panel", tx("完成", "เสร็จแล้ว"), "primary"),
  );
}

const practiceTopics=[['people','人物与关系','คนและความสัมพันธ์'],['daily','日常生活','ชีวิตประจำวัน'],['food','饮食','อาหาร'],['travel','出行问路','การเดินทาง'],['shopping','购物','การซื้อของ'],['time','时间','เวลา'],['work','工作','งาน'],['study','校园学习','การเรียน'],['social','交流','การพูดคุย'],['culture','文化','วัฒนธรรม']];
function arenaMenu(){
  openPanel(tx('校园声斗赛','ลานประลองเสียง'),'<p class="paper-letter">'+tx('主线继续送信；自由练习则从词库挑选对手的声音。每场至少回应八次，首次独立答对的词可在胜利后获得纸币，同一个词不重复发奖。','เดินเรื่องเพื่อส่งจดหมาย หรือเลือกหัวข้อจากคลังคำเพื่อฝึกอย่างอิสระ ตอบอย่างน้อยแปดครั้ง เมื่อชนะจะได้เหรียญจากคำที่ตอบเองถูกเป็นครั้งแรก ไม่ให้รางวัลซ้ำคำเดิม')+'</p><div class="bestiary-grid">'+practiceTopics.map(([id,zh,th])=>button('practice:'+id,tx(zh,th),'quiet','sound')).join('')+'</div>',button('continue',campaignComplete(save,save.world)?tx('重看结局','ชมตอนจบ'):tx('继续主线','เดินเรื่องต่อ'),'primary','arrow'));
}
async function practiceBattle(category){
  if(!practiceTopics.some(t=>t[0]===category))return;
  const stamp=epoch,world=save.world;
  try{
    const all=await loadDictionary();
    if(stamp!==epoch||world!==save.world)return;
    const seenSource=new Set(),seenTarget=new Set();
    const choices=shuffled(all.filter(u=>u.cat===category&&u.zh.length<=26&&u.th.length<=75)).filter(u=>{
      const a=normalized(sourceOf(u)),b=normalized(targetOf(u));if(seenSource.has(a)||seenTarget.has(b))return false;seenSource.add(a);seenTarget.add(b);return true;
    }).slice(0,8).map(u=>({...u,segments:{th:[u.th],cn:[u.zh]}}));
    if(choices.length<3)throw Error('insufficient choices');for(const u of choices)practiceUnits.set(u.id,u);
    startBattle(Math.min(progress().chapter,3),0,{category,units:choices});
  }catch{toast(tx('词库暂时没加载好，请重试。','โหลดคลังคำไม่สำเร็จ ลองอีกครั้ง'));}
}
function startBattle(chapter, rank, practice = null) {
  if (!canEnter(save, save.world, chapter, rank)) return;
  const monster = monsterFor(save.world, rank, chapter),
    stats = battleStats(chapter, rank);
  mount(
    '<main class="scene battle-scene battle-letterpress battle-correspondence">' +
      scenery(chapterScene(save.world, chapter),true) +
      '<header class="hud battle-hud"><div class="hud-left">' +
      ib("pause-battle", tx("暂停战斗", "พักการต่อสู้"), "pause") +
      '<div class="health"><strong>' +
      esc(HEROES[save.world].name) +
      (save.world==='th'?'<span class="hero-seal" aria-hidden="true">艾</span>':'') +
      '</strong><div class="health-track"><i id="hero-health"></i></div><small id="hero-hp"></small></div></div><div class="hud-title"><strong>' +
      tx("校园声斗赛", "ลานประลองเสียง") +
      "</strong><small>" +
      esc(practice?tx('词库自由练习','ฝึกคำศัพท์อิสระ'):nameOf(CHAPTERS[chapter])) +
      '</small></div><div class="hud-right"><div class="health enemy"><strong>' +
      esc(nameOf(monster)) +
      '</strong><div class="health-track"><i id="enemy-health"></i></div><small id="enemy-hp"></small></div></div></header><div class="battle-status" id="battle-status"></div><div class="question-bubble" id="question-bubble"></div><div class="question-zone" id="question-zone"></div><div class="mic-status" id="mic-status" role="status" aria-live="polite"></div><div class="battle-telegraph" id="telegraph"></div><div class="battle-timer"><i id="time-fill"></i></div><div class="bottom-bar"><div class="stance" role="group" aria-label="' +
      tx("出招方式", "รูปแบบโจมตี") +
      '">' +
      ["quick", "steady", "guard"]
        .map(
          (k, i) =>
            '<button data-stance="' +
            k +
            '" aria-pressed="' +
            (k === "steady") +
            '">' +
            tx(
              ["速攻", "稳击", "守势"][i],
              ["บุกเร็ว", "มั่นคง", "ตั้งรับ"][i],
            ) +
            "</button>",
        )
        .join("") +
      '</div><div class="mic-group">' +
      button("listen", tx("听题", "ฟังโจทย์"), "primary", "sound") +
      button("microphone", tx("跟读蓄能 +2秒", "พูดตาม +2 วินาที"), "dark", "mic") +
      "</div></div></main>",
    "battle",
  );
  $('.battle-scene').insertAdjacentHTML('beforeend','<section class="battle-reply" id="battle-reply" hidden aria-label="'+tx('本次回应','คำตอบครั้งนี้')+'"></section>');
  $('.battle-scene').dataset.world=save.world;
  applyThoughtMaterial($('.battle-scene'));
  const stage = sceneStage(chapterScene(save.world, chapter),{battle:true});
  stage.heroX = 0.16;
  stage.opponent(monster, rank);
  stage.loadFx();
  const review = dueWords(save, save.world)
    .map((id) => ALL_LESSONS.find((u) => u.id === id))
    .filter((u) => u && u.chapter < chapter)
    .slice(0, 2);
  battle = {
    chapter,
    rank,
    monster,
    stats,
    stage,
    hp: stats.hp,
    enemyHp: stats.enemyHp,
    shield: stats.shield,
    combo: 0,
    correct: 0,
    independent: 0,
    mistakes: new Map(),
    independentIds: new Set(),
    practice,
    turn: 0,
    stance: "steady",
    phase: "waiting",
    paused: false,
    timer: null,
    remaining: stats.time,
    queue: shuffled(practice?practice.units:[...LESSONS[chapter],...review]),
    world: save.world,
    attackTimer: null,
  };
  updateHealth();
  newQuestion();
}
function updateHealth() {
  if (!battle) return;
  const b = battle;
  $("#hero-health").style.width = (100 * b.hp) / b.stats.hp + "%";
  $("#enemy-health").style.width = (100 * b.enemyHp) / b.stats.enemyHp + "%";
  $("#hero-hp").textContent = b.hp + " / " + b.stats.hp;
  $("#enemy-hp").textContent =
    b.enemyHp +
    " / " +
    b.stats.enemyHp +
    (b.shield > 0 ? " · " + tx("护甲 ", "เกราะ ") + b.shield : "");
  $("#telegraph").textContent = b.interruptReady
    ? tx("连击保护 · 可挡下一次失误", "ป้องกันต่อเนื่อง · กันพลาดครั้งถัดไป")
    : tx(b.monster.tellZh, b.monster.tellTh);
  if(b.monster.boss) $('#telegraph').textContent=challengeName(b.mode)+' · '+tx(...b.monster.boss.acts[b.enemyHp<=b.stats.enemyHp/2?1:0]);
  if(b.monster.craft) $('#telegraph').textContent=(b.interruptReady?tx('连击保护 · ','ป้องกันต่อเนื่อง · '):'')+challengeName(b.mode)+' · '+tx(...b.monster.craft.acts[craftPhase(b)]);
  if(b.monster.armorRule==='market-baskets'&&b.shield>0){
    const marks=b.armorMarks||[];
    $('#telegraph').textContent=tx('菜篮锁扣 · 辨义','ตัวล็อกตะกร้า · ความหมาย')+(marks.includes('meaning')?' ✓':' ○')+' · '+tx('接话','ตอบรับ')+(marks.includes('courtesy')?' ✓':' ○');
  }
  $("#battle-status").textContent = tx(
    "连击 " +
      b.combo +
      " · " +
      (b.rank === 0 ? "相遇" : b.rank === 1 ? "精英" : "首领"),
    "ต่อเนื่อง " + b.combo + " · " + ["พบกัน", "ชั้นยอด", "บอส"][b.rank],
  );
  if(b.monster.boss) $('#battle-status').textContent+=' · '+tx(b.enemyHp<=b.stats.enemyHp/2?'第二幕':'第一幕',b.enemyHp<=b.stats.enemyHp/2?'ช่วงสอง':'ช่วงแรก');
  if(b.monster.craft?.second) $('#battle-status').textContent+=' · '+tx(b.shield>0?'解甲':'已破甲',b.shield>0?'เปิดเกราะ':'เกราะเปิดแล้ว');
}
function newQuestion() {
  if (!battle) return;
  const b = battle;
  stopAudio();
  cancelVoice();
  clearInterval(b.timer);
  b.turn++;
  b.response=null;b.heard=false;
  $('.battle-scene').dataset.reply='';
  $('#battle-reply').hidden=true;
  b.unit = b.queue[(b.turn - 1) % b.queue.length];
  b.phase = "waiting";
  b.assisted = false;
  b.speechAnswer = false;
  b.echoPrepared = false;
  b.revealed = false;
  b.elapsed = 0;
  b.timeBonus = takeEchoTime(b);
  b.roundLimit = b.stats.time + b.timeBonus;
  b.remaining = b.roundLimit;
  b.stage.setPose(b.stance==='guard'?'guard':'idle');
  b.order = [];
  b.paused = false;
  b.recognition = null;
  b.voiceIssue = null;
  b.qToken = (b.qToken || 0) + 1;
  b.sequence =
    b.rank === 2 &&
    b.enemyHp <= b.stats.enemyHp / 2 &&
    b.unit.segments[save.world].length > 1;
  const craftAct=b.monster.craft?craftPhase(b):null;
  const craftChanged=craftAct!==null&&b.lastCraftAct!==craftAct;
  if(craftChanged){b.lastCraftAct=craftAct;b.craftStartTurn=Math.max(2,b.turn);}
  b.mode = selectChallenge(b);
  b.unit = unitForChallenge(b.queue,b.turn-1,b.mode,b.world)||b.unit;
  b.reply=b.mode==='reply'?makeReply(b.queue,b.turn-1):null;
  if(b.mode==='reply'&&!b.reply)b.mode='listen';
  if(b.reply){b.unit=b.reply.unit;b.roundLimit+=replyReadAllowance(b.reply,b.world);b.remaining=b.roundLimit;}
  b.proof=b.mode==='proof'?makeProof(LESSONS[b.chapter],b.unit):null;
  if(b.mode==='proof'&&!b.proof)b.mode='listen';
  if(b.mode==='proof'){b.roundLimit+=8;b.remaining=b.roundLimit;}
  b.hunt=b.mode==='hunt'?makeSoundHunt(LESSONS[b.chapter],b.unit):null;
  if(b.mode==='hunt'&&!b.hunt)b.mode='listen';
  b.chain = b.mode==='chain' ? makeListeningChain(b.queue,b.unit) : null;
  b.cloze = b.mode==='cloze' ? makeCloze(b.unit,b.world) : null;
  if(b.mode==='chain'&&!b.chain || b.mode==='cloze'&&!b.cloze || b.mode==='sequence'&&b.unit.segments[b.world].length<2)b.mode='listen';
  if(b.mode==='chain'){b.roundLimit+=8;b.remaining=b.roundLimit;}
  b.audioStep=0;
  b.connections = null;
  b.failedConnection = null;
  // Scripted encounters keep their own sequence. Unscripted letter-sorters
  // retain the every-third-turn routine; neither replaces first listening.
  if (!b.practice && b.monster.connection && ((b.monster.boss||b.monster.craft) ? b.mode==='pairs' : b.turn % 3 === 2)) {
    // Late chapters contain authored long sentences. They must not silently
    // lose the creature's matching mechanic merely because labels get longer.
    const pool = LESSONS[b.chapter];
    const anchor = pool.some(u=>u.id===b.unit.id) ? b.unit : pool[0];
    if (anchor) {
      const board = makeConnections(pool, anchor, b.chapter>=3?2:3);
      if (board.units.length >= 2) {
        b.connections=board;b.mode='pairs';b.sequence=false;
        b.roundLimit += 8;b.remaining=b.roundLimit;
      }
    }
  }
  if(b.mode==='pairs'&&!b.connections)b.mode='listen';
  b.sequence=b.mode==='sequence';
  b.stage.enemyMood=['pairs','cloze','proof','reply'].includes(b.mode)?'read':b.mode==='chain'?'skill':'idle';
  b.stage.phase = b.rank === 2 && b.enemyHp <= b.stats.enemyHp / 2;
  $("#mic-status").textContent = b.timeBonus ? tx('跟读蓄能生效 · 本题 +2秒','พลังพูดตาม · ข้อนี้เพิ่ม 2 วินาที') : '';
  const act=b.enemyHp<=b.stats.enemyHp/2?1:0;
  if(b.monster.boss&&b.lastAct!==act){
    b.lastAct=act;b.stage.enemyMood='skill';
    $('#mic-status').textContent=tx(...b.monster.boss.acts[act]);
  }
  if(craftChanged){
    b.stage.enemyMood='skill';
    $('#mic-status').textContent=tx(...b.monster.craft.acts[craftAct]);
  }
  $("#time-fill").style.width = "100%";
  renderQuestion();
  updateHealth();
}
function renderReply() {
  const b=battle,r=b.reply,ready=b.phase==='ready'&&!b.paused;
  $('.battle-scene').dataset.mode='reply';$('.battle-scene').dataset.longPairs='false';
  $('#question-bubble').hidden=true;$('#question-bubble').innerHTML='';
  $('#question-zone').classList.remove('sequence');
  const waiting=b.phase==='waiting';$('.battle-scene').dataset.replyStep=waiting?'context':'answer';
  if(waiting)b.stage.enemyMood='read';
  $('#question-zone').innerHTML='<div class="reply-heading"><small>'+esc(nameOf(b.monster.replyTitle))+'</small><span>'+tx(waiting?'先看情境 · 不计时':'接一句合适的话 · 3个选项',waiting?'อ่านก่อน · ไม่จับเวลา':'เลือกคำตอบที่เหมาะสม · 3 ตัวเลือก')+'</span></div>'+
   (waiting?'<div class="reply-context" lang="'+(lang()==='th'?'zh':'th')+'">'+esc(nameOf(r.scene))+'</div><div class="reply-controls">'+button('reply-start',tx('看好了，开始接话','อ่านแล้ว เริ่มตอบ'),'primary','book')+'</div>':
   '<div class="reply-options">'+r.choices.map((u,i)=>'<button class="reply-option '+(r.selected===u.id?'selected ':'')+(b.revealed&&u.id===r.unit.id?'hinted':'')+'" data-action="reply-select:'+u.id+'" aria-pressed="'+(r.selected===u.id)+'" '+(!ready?'disabled':'')+'><small aria-hidden="true">'+String(i+1).padStart(2,'0')+'</small><span lang="'+lang()+'">'+esc(targetOf(u))+'</span></button>').join('')+'</div>'+
   '<div class="reply-controls">'+button('reply-context',tx('回看情境','ดูสถานการณ์'),'quiet','book')+button('reveal',tx('释义','คำใบ้'),'quiet')+button('reply-submit',tx('这样回应','ตอบแบบนี้'),'primary','arrow')+'</div>'+
   (b.revealed?'<p class="reply-hint">'+esc(sourceOf(r.unit))+' · '+tx('辅助练习，不计独立掌握','มีตัวช่วย ไม่นับการทำได้ด้วยตนเอง')+'</p>':''));
  setControlState();
}
function renderProof() {
  const b=battle,p=b.proof,mend=p.phase==='mend',ready=b.phase==='ready'&&!b.paused;
  const book=b.monster.proofSkin==='book';
  $('.battle-scene').dataset.mode='proof';
  $('.battle-scene').dataset.longPairs='false';
  $('#question-zone').classList.remove('sequence');
  $('#question-bubble').hidden=true;
  $('#question-bubble').innerHTML='';
  $('#question-zone').innerHTML='<div class="proof-heading"><div><small>'+esc(nameOf(b.monster))+' · '+tx(book?'书页校勘':'错印校勘',book?'ตรวจหน้าหนังสือ':'ตรวจตราที่พิมพ์ผิด')+'</small><h3>'+tx(mend?(book?'把这页的意思补正确':'把正确的意思印回去'):(book?'哪一页的译文装错了？':'哪一枚印，意思错了？'),mend?'ใส่ความหมายที่ถูกกลับไป':book?'หน้าไหนใส่คำแปลผิด?':'ตราไหนมีความหมายผิด?')+'</h3></div><span class="proof-step">'+(mend?'02':'01')+' / 02</span></div>'+
    (mend?'<p class="proof-original '+(sourceOf(b.unit).length<=14?'proof-short':'')+'" lang="'+(lang()==='th'?'zh':'th')+'">'+esc(sourceOf(b.unit))+'</p><div class="proof-choices">'+p.choices.map(u=>'<button class="proof-choice '+(targetOf(u).length<=14?'proof-short ':'')+(b.revealed&&u.id===p.target?'proof-hinted':'')+'" data-action="proof-mend:'+u.id+'" '+(!ready?'disabled':'')+' lang="'+lang()+'">'+esc(targetOf(u))+'</button>').join('')+'</div>':
    '<div class="proof-rows">'+p.rows.map((r,i)=>'<button class="proof-row '+(b.revealed&&r.source.id===p.target?'proof-hinted':'')+'" data-action="proof-inspect:'+i+'" '+(!ready?'disabled':'')+'><i aria-hidden="true">'+String(i+1).padStart(2,'0')+'</i><span lang="'+(lang()==='th'?'zh':'th')+'">'+esc(sourceOf(r.source))+'</span><b aria-hidden="true">↔</b><span lang="'+lang()+'">'+esc(targetOf(r.printed))+'</span></button>').join('')+'</div>')+
    '<div class="proof-foot"><span role="status">'+tx(mend?'找到了。补对意思，才完成这次破招。':book?'两页中有一处错译，先找出它。':'两枚印中有一处错译，先找出它。',mend?'พบแล้ว แก้ความหมายให้ถูกจึงจะโจมตีได้':book?'มีหน้าหนึ่งแปลผิด ลองหาดู':'มีตราหนึ่งแปลผิด ลองหาดู')+'</span>'+button('reveal',b.revealed?tx('已提示','แสดงแล้ว'):tx('看提示','ดูคำใบ้'),'quiet','book')+'</div>';
  setControlState();
}
function renderSoundHunt() {
  const b=battle,h=b.hunt,ended=['resolving','ended'].includes(b.phase),show=b.revealed||ended;
  $('.battle-scene').dataset.mode='hunt';
  $('.battle-scene').classList.remove('has-hint','echo-active');
  $('#question-bubble').hidden=false;
  $('#question-bubble').innerHTML='<div class="voice-caption"><span>'+esc(nameOf(b.monster.hunt))+'</span><small>'+tx('找这个意思','หาความหมายนี้')+'</small></div><button class="hunt-clue" data-action="hunt-clue" aria-label="'+tx('展开意思线索','เปิดเบาะแสความหมาย')+'">'+esc(sourceOf(b.unit))+'</button>';
  const zone=$('#question-zone');zone.classList.remove('sequence','echo-mode');
  zone.innerHTML='<div class="thought-heading"><span>'+tx('哪封信，在这样说？','ฉบับไหนพูดความหมายนี้?')+'</span><small>'+h.heard.length+' / 3</small></div><div class="sound-posts">'+h.choices.map((u,i)=>{
    const chosen=h.selected===i,correct=ended&&u.id===h.target,wrong=ended&&chosen&&!correct,heard=h.heard.includes(i);
    return '<article class="sound-post '+(h.playing===i?'playing ':'')+(chosen?'chosen ':'')+(correct?'correct ':wrong?'wrong ':'')+'"><button class="post-listen" data-action="hunt-listen:'+i+'" aria-label="'+esc(tx('听第'+(i+1)+'封信','ฟังจดหมายฉบับที่ '+(i+1)))+'">'+icon('sound')+'<span>'+String(i+1).padStart(2,'0')+'</span><i aria-hidden="true">'+(heard?'✓':'')+'</i></button><button class="post-select" data-action="hunt-select:'+i+'" aria-pressed="'+chosen+'"><span '+(show?'lang="'+lang()+'"':'')+'>'+esc(show?targetOf(u):tx('选这封','เลือกฉบับนี้'))+'</span><small>'+tx(correct?'正确信件':wrong?'选错了':chosen?'已选择':heard?'已听过':'还没听',correct?'ฉบับที่ถูก':wrong?'เลือกผิด':chosen?'เลือกแล้ว':heard?'ฟังแล้ว':'ยังไม่ได้ฟัง')+'</small></button></article>';
  }).join('')+'</div><div class="post-actions"><span>'+tx(b.assisted?'辅助练习 · 不计独立掌握':b.phase==='audio'?'正在听第 '+(h.playing+1)+' 封 · 不计时':h.heard.length<3?'先听完三封，再确认':'选好后，确认投递',b.assisted?'ฝึกแบบมีตัวช่วย':b.phase==='audio'?'กำลังฟังฉบับที่ '+(h.playing+1)+' · ไม่จับเวลา':h.heard.length<3?'ฟังครบสามฉบับก่อนยืนยัน':'เลือกแล้วกดยืนยัน')+'</span>'+button('reveal',tx('看文字','ดูคำใบ้'),'quiet','book')+button('hunt-submit',tx('就是这封','ยืนยันฉบับนี้'),'primary','mail')+'</div>';
  setControlState();
}
async function listenHunt(index=null) {
  const b=battle;
  if(!b?.hunt||b.mode!=='hunt'||b.paused||!['waiting','ready'].includes(b.phase))return;
  if(index!==null&&(!Number.isInteger(index)||!b.hunt.choices[index]))return;
  const h=b.hunt,q=b.qToken,token=b.playToken=(b.playToken||0)+1;
  let indexes=index===null?h.choices.map((_,i)=>i).filter(i=>!h.heard.includes(i)):[index];
  if(!indexes.length)indexes=h.choices.map((_,i)=>i);
  clearInterval(b.timer);b.phase='audio';h.audioFailed=false;$('#mic-status').textContent='';
  b.stage.setPose('listen');b.stage.enemyMood='skill';duck(true);
  for(const i of indexes){
    h.playing=i;if(h.heard.includes(i))b.assisted=true;renderSoundHunt();
    const ok=await speak(targetOf(h.choices[i]),lang(),{rate:save.settings.speechRate});
    if(b!==battle||q!==b.qToken||token!==b.playToken||b.phase!=='audio')return;
    if(!ok){h.audioFailed=true;$('#mic-status').textContent=tx('第'+(i+1)+'封信没有播放成功。可重试，或看文字辅助；这次不扣血。','จดหมายฉบับที่ '+(i+1)+' เล่นเสียงไม่ได้ ลองใหม่หรือดูคำใบ้ ครั้งนี้ไม่เสียพลัง');break;}
    markHuntHeard(h,i);
  }
  h.playing=null;duck(false);b.phase=(!h.audioFailed&&h.heard.length===h.choices.length)||b.revealed?'ready':'waiting';
  b.stage.setPose(b.stance==='guard'?'guard':'idle');b.stage.enemyMood='idle';renderSoundHunt();
  if(index!==null)$('[data-action="hunt-listen:'+index+'"]')?.focus({preventScroll:true});
  if(!h.audioFailed)startTimer();
}
function renderQuestion() {
  const b = battle;
  if (!b) return;
  if(b.mode==='hunt'){renderSoundHunt();return;}
  if(b.mode==='proof'){renderProof();return;}
  if(b.mode==='reply'){renderReply();return;}
  const u = b.unit,
    seq = b.sequence,
    main = b.revealed
      ? b.chain ? b.chain.units.map(targetOf).join(' / ') : targetOf(u)
      : tx("听见它想说什么", "ฟังว่ามันอยากพูดอะไร");
  $('.battle-scene').dataset.mode=b.mode;
  $('.battle-scene').dataset.longPairs=String(b.mode==='pairs'&&b.connections.units.some(u=>u.zh.length>26||u.th.length>75));
  $('.battle-scene').classList.toggle('has-hint',b.revealed);
  $('#question-bubble').innerHTML =
    '<div class="voice-caption"><span>' + esc(nameOf(b.monster)) +
    '</span><small>' + tx(b.mode==='pairs'?'散页的线索':'它的声音',b.mode==='pairs'?'คำใบ้บนกระดาษ':'เสียงของมัน') +
    '</small></div><div class="bubble-main ' +
    (main.length > 22 ? "long" : "") +
    '" lang="' +
    (b.revealed ? lang() : "") +
    '">' +
    (b.mode==='pairs' ? '<span class="connection-title">'+esc(nameOf(b.monster.connection))+'</span>' : b.mode==='cloze' ? '<span class="cloze-clue">'+tx('哪一页，才接得上？','ส่วนไหนจึงจะต่อกันได้?')+'</span>' : b.revealed
      ? '<button class="transcript-preview" data-action="transcript" aria-label="'+tx('展开完整句子','เปิดประโยคเต็ม')+'">'+esc(main)+'</button>'
      : '<button class="voice-source" data-action="listen" aria-label="' +
        tx("听怪物的声音", "ฟังเสียงมอนสเตอร์") +
        '">' +
        '<span class="voice-seal" aria-hidden="true">'+icon("sound")+'</span><span class="voice-prompt"><strong>'+(b.phase==='audio'?tx('它正在说…','กำลังพูด…'):b.mode==='chain'?tx('听两段声音','ฟังสองเสียง'):tx(b.heard?'再听它说':'听它说一句',b.heard?'ฟังอีกครั้ง':'ฟังสักประโยค'))+'</strong><small>'+tx(b.phase==='audio'?'听完再出招 · 不计时':b.heard?'听清意思，再回应':'点一下，听完再回应',b.phase==='audio'?'ฟังให้จบ · ไม่จับเวลา':b.heard?'ฟังความหมายแล้วตอบ':'แตะฟัง แล้วค่อยตอบ')+'</small></span><span class="voice-meter" aria-hidden="true"><i></i><i></i><i></i></span>' +
        "</button>") +
    '</div>' + (b.mode==='pairs' ? '<small class="connection-hint">'+tx('同一个意思，两种文字','ความหมายเดียวกัน สองภาษา')+'</small>' : b.revealed ? '<small class="transcript-note">'+tx('文字辅助 · 点开查看全文','คำใบ้ตัวอักษร · แตะอ่านเต็ม')+'</small>' : '<button class="bubble-hint" data-action="reveal" aria-label="'+tx('显示文字提示，转为辅助练习','แสดงคำใบ้ตัวอักษรเพื่อฝึกแบบมีตัวช่วย')+'">'+tx('提示','คำใบ้')+'</button>');
  const zone = $("#question-zone");
  // Reading clues live with the sentence. A redundant voice placard on a
  // silent cloze round obscures high-ground enemies and mislabels the skill.
  $('#question-bubble').hidden=['cloze','pairs'].includes(b.mode);
  if(['cloze','pairs'].includes(b.mode))$('#question-bubble').innerHTML='';
  if(b.mode==='chain')$('#question-bubble').insertAdjacentHTML('beforeend','<small class="chain-playback">'+(b.phase==='audio'?tx('正在播放 '+b.audioStep+' / 2 · 播完再答','กำลังเล่น '+b.audioStep+' / 2 · ฟังจบค่อยตอบ'):tx('记住两段声音的顺序','จำลำดับเสียงทั้งสองช่วง'))+'</small>');
  zone.classList.toggle('echo-mode',!!b.echoPrepared);
  $('.battle-scene').classList.toggle('echo-active',!!b.echoPrepared);
  if(b.echoPrepared){
    zone.innerHTML='<section class="echo-coach"><small>'+tx('跟读蓄能 · 不计时','พูดตามสะสมพลัง · ไม่จับเวลา')+'</small><p>'+tx('跟着示范说泰语，不是用中文作答。','พูดภาษาจีนตามตัวอย่าง ไม่ใช่อ่านคำตอบภาษาไทย')+'</p><span>'+tx('文字核对成功：下一题 +2秒。不是发音评分。','เมื่อข้อความตรงกัน ข้อถัดไป +2 วินาที ไม่ใช่คะแนนออกเสียง')+'</span>'+button('echo-options',tx('回到点选','กลับไปเลือกคำตอบ'),'quiet','left')+'</section>';
    setControlState();return;
  }
  zone.classList.toggle("sequence", seq);
  if(b.mode==='chain') {
    zone.innerHTML='<div class="thought-heading"><span>'+tx('把回声接回来','ตอบเสียงกลับตามลำดับ')+'</span><small>'+b.chain.order.length+' / 2</small></div><div class="chain-slots">'+[0,1].map(i=>'<span><small>'+String(i+1).padStart(2,'0')+'</small>'+esc(b.chain.order[i]===undefined?tx('等待回应','รอคำตอบ'):sourceOf(b.chain.choices[b.chain.order[i]]))+'</span>').join('')+'</div><div class="answers '+(b.chapter>=3?'sentence':'')+'">'+b.chain.choices.map((choice,i)=>'<button class="answer '+(b.chain.order.includes(i)?'selected':'')+'" data-chain="'+i+'" '+(b.phase!=='ready'||b.chain.order.includes(i)||b.chain.order.length>=2?'disabled':'')+'><span>'+esc(sourceOf(choice))+'</span></button>').join('')+'</div><div class="chain-actions">'+ib('undo-chain',tx('撤回上一个回应','ย้อนคำตอบล่าสุด'),'undo')+button('submit-chain',tx('接住这两声','ตอบสองเสียงนี้'),'primary','check')+'</div>';
  } else if(b.mode==='cloze') {
    zone.innerHTML='<div class="thought-heading cloze-heading"><div><span>'+tx('把缺页放回原处','เติมหน้ากระดาษที่หาย')+'</span><small>'+tx('按语境补全','เติมตามบริบท')+'</small></div>'+button('reveal',b.revealed?tx('已提示','แสดงแล้ว'):tx('看提示','ดูคำใบ้'),'quiet','book')+'</div><p class="cloze-translation">'+esc(sourceOf(u))+'</p><div class="cloze-sentence" lang="'+lang()+'">'+b.cloze.parts.map((part,i)=>i===b.cloze.missing?'<mark>'+esc(b.revealed?part:'…')+'</mark>':'<span>'+esc(part)+'</span>').join(' ')+'</div><div class="answers sentence">'+b.cloze.choices.map((text,i)=>'<button class="answer" data-cloze="'+i+'" '+(b.phase!=='ready'?'disabled':'')+'><span lang="'+lang()+'">'+esc(text)+'</span></button>').join('')+'</div>';
  } else if (b.mode==='pairs') {
    const board=b.connections;
    zone.innerHTML='<div class="thought-heading"><span>'+tx('把两封信接起来','เชื่อมจดหมายสองภาษา')+'</span><small>'+board.linked.length+' / '+board.units.length+'</small></div><div class="connection-board" style="--pair-count:'+board.units.length+'"><svg class="connection-threads" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">'+board.linked.map(id=>{
      const y1=(board.left.findIndex(u=>u.id===id)+.5)*100/board.units.length;
      const y2=(board.right.findIndex(u=>u.id===id)+.5)*100/board.units.length;
      return '<path d="M41 '+y1+' C50 '+y1+' 50 '+y2+' 59 '+y2+'"/>';
    }).join('')+'</svg>'+['left','right'].map(side=>'<div class="connection-column">'+board[side].map(unit=>{
      const done=board.linked.includes(unit.id),selected=board.selected?.id===unit.id&&board.selected.side===side;
      return '<button class="connection-word '+(done?'linked':'')+'" data-connect="'+esc(unit.id)+'" data-side="'+side+'" aria-pressed="'+selected+'" '+(done||b.phase!=='ready'?'disabled':'')+'><span lang="'+(side==='left'?lang():(lang()==='th'?'zh':'th'))+'">'+esc(side==='left'?targetOf(unit):sourceOf(unit))+'</span><i aria-hidden="true">'+(done?'✓':'')+'</i></button>';
    }).join('')+'</div>').join('')+'</div><p class="connection-instruction">'+tx(b.phase==='waiting'?'准备好再开始，先不计时。':'点一侧的词，再点另一侧对应的意思。',b.phase==='waiting'?'พร้อมแล้วค่อยเริ่ม ยังไม่จับเวลา':'แตะคำด้านหนึ่ง แล้วแตะความหมายที่ตรงกันอีกด้าน')+'</p>';
  } else if (seq) {
    b.fragments ||= shuffled(
      u.segments[save.world].map((text, i) => ({ text, i })),
    );
    zone.innerHTML =
      '<div class="order-built" aria-live="polite">' +
      (b.order.length
        ? b.order
            .map((i) => "<span>" + esc(u.segments[save.world][i]) + "</span>")
            .join("")
        : "<span>" +
          tx("把想法连成完整的话", "เรียงความคิดให้เป็นประโยค") +
          "</span>") +
      '</div><div class="answers long">' +
      b.fragments
        .map(
          (f) =>
            '<button class="answer ' +
            (b.order.includes(f.i) ? "selected" : "") +
            '" data-fragment="' +
            f.i +
            '" ' +
            (b.order.includes(f.i) || !["ready", "voice"].includes(b.phase)
              ? "disabled"
              : "") +
            ">" +
            esc(f.text) +
            "</button>",
        )
        .join("") +
      '</div><div class="order-actions">' +
      ib("undo-order", tx("撤回一个词组", "ย้อนคำล่าสุด"), "undo") +
      button("submit-order", tx("就这样说", "พูดแบบนี้"), "primary", "check") +
      "</div>";
  } else {
    if (!b.choices) {
      const alternatives = (b.practice?b.practice.units:LESSONS[b.chapter]).filter(
        (x) => normalized(sourceOf(x)) !== normalized(sourceOf(u)),
      );
      b.choices = shuffled([u, ...shuffled(alternatives).slice(0, 2)]);
    }
    const layout=thoughtLayout(b.choices.map(x=>x.choice?nameOf(x.choice):sourceOf(x)),save.world,b.chapter);
    zone.closest('.battle-scene').dataset.thoughtLayout=layout;
    zone.innerHTML =
      '<div class="thought-heading listen-heading"><span class="thought-owner">'+esc(HEROES[save.world].name)+'</span><span>'+tx('你想到的是…','นึกถึงความหมายไหน…')+'</span></div><div class="thought-invitation" role="status"><strong>'+tx(b.phase==='audio'?'听完，再回应':'先听它说一句',b.phase==='audio'?'ฟังให้จบ แล้วค่อยตอบ':'ฟังสักประโยคก่อน')+'</strong><span>'+tx(b.phase==='audio'?'声音结束后，想法就会展开':'点怪物头上的声音 · 现在不计时',b.phase==='audio'?'ฟังจบแล้ว ตัวเลือกจะปรากฏ':'แตะเสียงเหนือหัวมอนสเตอร์ · ยังไม่จับเวลา')+'</span></div><div class="answers thought-answers ' +
      (b.chapter >= 3
        ? "sentence"
        : layout==='reading'
          ? "long"
          : "") +
      '">' +
      b.choices
        .map(
          (x, i) =>
            '<button class="answer paper-thought" style="--thought-i:'+i+'" data-answer="' +
            i +
            '" ' +
            (!["ready", "voice"].includes(b.phase) ? "disabled" : "") +
            ' lang="'+(save.world==='th'?'zh-CN':'th')+'">'+thoughtSkin(i,layout==='reading',save.world==='th'?'xiaoai':'chaninda')+'<small aria-hidden="true">' +
            String(i + 1).padStart(2, "0") +
            "</small><span>" +
            esc(x.choice ? nameOf(x.choice) : sourceOf(x)) +
            "</span></button>",
        )
        .join("") +
      "</div>";
  }
  applyThoughtMaterial(zone.closest('.battle-scene'));
  setControlState();
}
function setControlState() {
  const b = battle;
  if (!b) return;
  const view=exchangeState(b),scene=$('.battle-scene');
  scene.dataset.exchange=view.phase;
  scene.dataset.playing=String(view.playing);
  scene.dataset.motion=String(save.settings.motion);
  scene.dataset.paused=String(b.paused);
  scene.dataset.thoughts=thoughtCue(b);
  const listen = $('.mic-group [data-action="listen"]'),
    mic = $('[data-action="microphone"]');
  const busy = ["resolving", "ended"].includes(b.phase);
  if (listen) {
    const purpose=['pairs','cloze','proof','reply'].includes(b.mode)?'reading':'listening';
    if(listen.dataset.purpose!==purpose){
      listen.querySelector('svg').outerHTML=icon(purpose==='reading'?'book':'sound');
      listen.dataset.purpose=purpose;
    }
    listen.hidden=!view.footerAudio||b.mode==='reply';
    listen.disabled = busy || b.phase === "voice";
    listen.querySelector("span").textContent =
      b.phase === "audio"
        ? tx("播放中…", "กำลังเล่น…")
        : b.phase === "waiting"
          ? (b.echoPrepared?tx('先听示范','ฟังตัวอย่าง'):tx("听题 · 开始", "ฟังโจทย์ · เริ่ม"))
          : tx("再听一次", "ฟังอีกครั้ง");
    if(['pairs','cloze'].includes(b.mode)){
      listen.querySelector('span').textContent=b.phase==='waiting'?tx(b.mode==='pairs'?'开始连线':'开始补句',b.mode==='pairs'?'เริ่มจับคู่':'เริ่มเติมคำ'):tx(b.mode==='pairs'?'连对全部词语':'选出缺失的词组',b.mode==='pairs'?'จับคู่ให้ครบ':'เลือกส่วนที่หายไป');
      listen.disabled=busy||b.phase!=='waiting';
    }
    if(b.mode==='hunt'){
      listen.querySelector('span').textContent=b.phase==='audio'?tx('播放中…','กำลังเล่น…'):b.hunt.heard.length<3?tx('听完三封信','ฟังให้ครบสามฉบับ'):tx('再听一轮','ฟังอีกครั้ง');
      listen.disabled=busy||b.phase==='audio';
    }
    if(b.mode==='proof'){
      listen.querySelector('span').textContent=b.phase==='waiting'?tx('开始校勘','เริ่มตรวจ'):tx('找错 → 修正','หาข้อผิด → แก้ไข');
      listen.disabled=b.phase!=='waiting';
    }
    if(b.mode==='reply'){
      listen.querySelector('span').textContent=b.phase==='waiting'?tx('开始接话','เริ่มตอบบท'):tx('选好后确认','เลือกแล้วกดยืนยัน');
      listen.disabled=b.phase!=='waiting';
    }
  }
  if (mic) {
    mic.hidden=!['listen','sequence'].includes(b.mode);
    mic.disabled = busy || b.phase === "audio" || b.echoEarned;
    mic.querySelector("span").textContent =
      b.phase === "voice"
        ? tx("说完了", "พูดเสร็จแล้ว")
        : b.echoEarned ? tx('已蓄能 · 下题+2秒','สะสมแล้ว · ข้อถัดไป +2 วิ') : b.echoPrepared ? tx('开始跟读','เริ่มพูดตาม') : tx('跟读蓄能 +2秒','พูดตาม +2 วินาที');
  }
  root.querySelectorAll("[data-stance]").forEach((el) => {
    el.disabled = busy;
    el.setAttribute("aria-pressed", String(el.dataset.stance === b.stance));
  });
  root.querySelectorAll('.voice-source,[data-action="reveal"],[data-action="transcript"]').forEach(el=>el.disabled=busy||b.phase==='voice');
  if(b.mode==='reply'&&$('[data-action="reply-submit"]'))$('[data-action="reply-submit"]').disabled=b.phase!=='ready'||b.paused||!b.reply.selected;
  if(b.mode==='chain'){
    $('[data-action="submit-chain"]').disabled=b.phase!=='ready'||b.chain.order.length!==2;
    $('[data-action="undo-chain"]').disabled=b.phase!=='ready'||!b.chain.order.length;
  }
  if(b.mode==='hunt'){
    root.querySelectorAll('.post-listen').forEach(el=>el.disabled=busy||b.phase==='audio');
    root.querySelectorAll('.post-select').forEach(el=>el.disabled=b.phase!=='ready');
    $('[data-action="hunt-submit"]').disabled=b.phase!=='ready'||b.hunt.selected===null;
    $('[data-action="hunt-clue"]').disabled=busy||b.phase==='audio';
  }
}
function startTimer() {
  const b = battle;
  if (!b || b.paused || b.phase !== "ready" || document.hidden || b.hunt?.audioFailed) return;
  clearInterval(b.timer);
  b.tickAt = performance.now();
  b.timer = setInterval(() => {
    if (b !== battle || b.paused || b.phase !== "ready" || document.hidden)
      return;
    const t = performance.now(),
      delta = (t - b.tickAt) / 1000;
    b.tickAt = t;
    b.remaining = Math.max(0, b.remaining - delta);
    b.elapsed += delta;
    $("#time-fill").style.width = (100 * b.remaining) / b.roundLimit + "%";
    if (b.remaining <= 0) resolveAnswer(false, "timeout");
  }, 80);
}
function pauseBattle() {
  if (battle) {
    battle.paused = true;
    $('.battle-scene')?.setAttribute('data-paused','true');
    battle.stage.setPaused(true);
    clearInterval(battle.timer);
    if (battle.phase === "audio") {
      battle.playToken = (battle.playToken || 0) + 1;
      battle.phase = "waiting";
      stopAudio();
      duck(false);
      if(battle.mode==='hunt')battle.hunt.playing=null;
      renderQuestion();
    }
    battle.stage.moving = 0;
    battle.stage.destination = null;
  }
}
function resumeBattle() {
  if (!battle || panel.open || document.hidden) return;
  battle.paused = false;
  setControlState();
  battle.stage.setPaused(false);
  if(!battle.echoPrepared)startTimer();
}
async function listen() {
  const b = battle;
  if (!b || ["resolving", "ended", "voice"].includes(b.phase)) return;
  if(b.mode==='hunt'){await listenHunt();return;}
  if(['pairs','cloze','proof','reply'].includes(b.mode)) {
    if(b.paused)return;
    if(b.mode==='reply')b.stage.enemyMood='listen';
    b.phase='ready';
    if(b.mode==='reply')b.stage.perform(HERO_MOMENTS.unfold);
    else b.stage.setPose('read',900);
    renderQuestion();startTimer();return;
  }
  const q = b.qToken;
  const focusWasInVoice=!!$('#question-bubble')?.contains(document.activeElement);
  b.voiceIssue=null;$("#mic-status").textContent='';
  const playToken = (b.playToken = (b.playToken || 0) + 1);
  clearInterval(b.timer);
  b.phase = "audio";
  b.stage.setPose('listen');
  b.stage.enemyMood='skill';
  setControlState();
  duck(true);
  let ok=true;
  const cues=b.chain?.units||[b.unit];
  for(let i=0;i<cues.length;i++){
    if(b!==battle||q!==b.qToken||playToken!==b.playToken||b.phase!=='audio')return;
    b.audioStep=i+1;renderQuestion();
    const played=await speak(targetOf(cues[i]),lang(),{rate:save.settings.speechRate});
    if(b!==battle||q!==b.qToken||playToken!==b.playToken||b.phase!=='audio')return;
    if(!played){ok=false;break;}
    if(i<cues.length-1)await new Promise(resolve=>setTimeout(resolve,320));
  }
  if (
    b !== battle ||
    q !== b.qToken ||
    playToken !== b.playToken ||
    b.phase !== "audio"
  )
    return;
  duck(false);
  b.phase = "ready";
  b.heard=ok;
  b.stage.enemyMood='listen';
  b.stage.setPose(b.stance==='guard'?'guard':'idle');
  if(ok&&!b.echoPrepared&&b.stance!=='guard')b.stage.perform(HERO_MOMENTS.respond);
  if (!ok) {
    b.assisted = true;
    b.revealed = true;
    toast(
      tx(
        "这句暂无可播放语音，已切换认字练习，不计速度加成。",
        "ประโยคนี้ไม่มีเสียง เปลี่ยนเป็นอ่านตัวอักษรโดยไม่มีโบนัสความเร็ว",
      ),
    );
  }
  renderQuestion();
  // Re-rendering the speaking note removes its focused button. Restore a
  // useful next target, but never steal focus from a control used meanwhile.
  if(focusWasInVoice&&document.activeElement===document.body&&!panel.open){
    const target=b.echoPrepared?'[data-action="microphone"]':b.mode==='chain'?'[data-chain]:not(:disabled)':b.mode==='sequence'?'[data-fragment]:not(:disabled)':'[data-answer]:not(:disabled)';
    root.querySelector(target)?.focus({preventScroll:true});
  }
  if (!panel.open && !b.echoPrepared) startTimer();
}
function reveal() {
  const b = battle;
  if (!b || ["resolving", "ended", "voice"].includes(b.phase)) return;
  if(b.mode==='pairs')return;
  if(b.mode==='hunt'){
    b.playToken=(b.playToken||0)+1;stopAudio();duck(false);b.hunt.playing=null;
    b.assisted=true;b.revealed=true;b.phase='ready';b.hunt.audioFailed=false;
    $('#mic-status').textContent=tx('已切到文字辅助 · 不计独立听力和速度加成','ใช้คำใบ้แล้ว · ไม่นับคะแนนฟังด้วยตนเองหรือโบนัสความเร็ว');
    renderQuestion();startTimer();return;
  }
  b.voiceIssue=null;$("#mic-status").textContent='';
  b.assisted = true;
  b.revealed = true;
  b.echoPrepared = false;
  if (b.phase === "waiting") {
    b.phase = "ready";
    startTimer();
  }
  renderQuestion();
}
function chooseAnswer(index) {
  const b = battle;
  if (!b || b.phase !== "ready" || b.paused || !['listen','sequence'].includes(b.mode)) return;
  const correct = b.choices[Number(index)]?.id === b.unit.id;
  const el = root.querySelector('[data-answer="' + index + '"]');
  el?.classList.add(correct ? "correct" : "wrong");
  resolveAnswer(correct);
}
function chooseConnection(side,id) {
  const b=battle;
  if(!b || b.mode!=='pairs' || b.phase!=='ready' || b.paused)return;
  const result=connectWord(b.connections,side,id);
  if(result.kind==='ignored')return;
  if(result.kind==='wrong'){
    b.failedConnection=b.connections.units.find(u=>u.id===result.id);
    renderQuestion();resolveAnswer(false,'connection');return;
  }
  renderQuestion();
  // Preserve keyboard focus after replacing the board's DOM.
  const focus=root.querySelector('[data-connect="'+id+'"][data-side="'+side+'"]');
  if(focus&&!focus.disabled)focus.focus({preventScroll:true});
  else root.querySelector('[data-connect]:not(:disabled)')?.focus({preventScroll:true});
  if(result.kind==='complete')resolveAnswer(true,'connection');
  else if(result.kind==='linked'){
    b.stage.setPose('read',650);
    $('#mic-status').textContent=tx('接上了 · 继续下一组','เชื่อมแล้ว · คู่ต่อไป');
  }
}
function resolveAnswer(correct, reason = "answer") {
  const b = battle;
  if (!b || b.phase !== "ready" || b.paused) return;
  b.phase = "resolving";
  clearInterval(b.timer);
  stopAudio();
  cancelVoice();
  const assessed = b.mode==='pairs' ? (correct ? b.connections.units : [b.failedConnection||b.connections.units.find(u=>!b.connections.linked.includes(u.id))||b.connections.units[0]]) : b.chain ? b.chain.units : [b.unit];
  b.response={correct,units:assessed,assisted:b.assisted,mode:b.mode,effect:''};
  const skill = ['pairs','cloze','proof','reply'].includes(b.mode) ? 'reading' : b.sequence ? 'sequence' : b.revealed ? 'reading' : 'listening';
  for(const unit of assessed)noteAnswer(save, save.world, unit.id, correct, b.assisted, Date.now(),skill);
  commit();
  root
    .querySelectorAll('[data-answer],[data-fragment],[data-connect],[data-chain],[data-cloze],[data-action^="proof-"],[data-action^="reply-"]')
    .forEach((el) => (el.disabled = true));
  setControlState();
  if(b.mode==='hunt')renderSoundHunt();
  const interrupted = !correct && b.rank === 0 && b.interruptReady;
  if (interrupted) b.interruptReady = false;
  b.combo = correct ? b.combo + 1 : 0;
  if (correct && b.rank === 0 && b.combo % 3 === 0) b.interruptReady = true;
  let amount = 0;
  if (correct) {
    b.correct++;
    if(!b.assisted)b.independent++;
    if(!b.assisted)for(const unit of assessed)b.independentIds.add(unit.id);
    amount = damageFor({
      chapter: b.chapter,
      combo: b.combo,
      elapsed: b.elapsed,
      limit: b.roundLimit,
      assisted: b.assisted || b.speechAnswer,
      stance: b.stance,
    });
    b.stage.swing("hero", b.combo >= 3);
  } else {
    for(const unit of assessed)b.mistakes.set(unit.id,unit);
    if (!interrupted) b.stage.swing("enemy");
    else b.stage.setPose('dodge',950);
  }
  laterBattle(b, () => {
    if (b !== battle) return;
    if (correct) {
      let absorbed = Math.min(b.shield, amount);
      if (b.rank === 1 && b.shield > 0) {
        absorbed = amount;
        Object.assign(b,eliteArmorStep(b,true));
      } else b.shield -= absorbed;
      const previousHp=b.enemyHp;
      b.enemyHp = Math.max(b.practice && b.turn<8?1:0, b.enemyHp - (amount - absorbed));
      const dealt=previousHp-b.enemyHp;
      const armorText=b.monster.armorRule==='market-baskets'?tx('篮扣 ','ตะกร้า ')+(b.armorMarks||[]).length+'/2':tx('甲扣松动','เกราะเริ่มคลาย');
      b.response.effect=absorbed===amount?(b.shield===0?tx('破甲','เกราะแตก'):armorText):'−'+dealt;
      b.stage.hitText(
        absorbed === amount
          ? b.shield===0 ? tx("破甲", "เกราะแตก") : armorText
          : "−" + dealt,
      );
      const meaning = b.unit.choice ? nameOf(b.unit.choice) : sourceOf(b.unit);
      $("#mic-status").textContent = b.mode==='pairs'?tx('散页归位 · 连线完成','เชื่อมหน้ากระดาษครบแล้ว'):tx(b.sequence?'句子接好了 · ':b.revealed||['cloze','proof','reply'].includes(b.mode)?'读懂了 · ':"听懂了 · ", "เข้าใจแล้ว · ") + meaning;
      if(b.mode==='chain')$('#mic-status').textContent=tx('两声都接住了 · ','รับทั้งสองเสียงแล้ว · ')+b.chain.units.map(sourceOf).join(' → ');
      if(b.mode==='cloze')$('#mic-status').textContent=tx('缺页归位 · ','เติมครบแล้ว · ')+targetOf(b.unit);
      if(b.mode==='hunt')$('#mic-status').textContent=tx('声音送到了 · ','ส่งเสียงถึงแล้ว · ')+targetOf(b.unit)+' — '+sourceOf(b.unit);
      if(b.mode==='reply')$('#mic-status').textContent=tx('接上这句话了 · ','ตอบได้เหมาะสม · ')+sourceOf(b.unit);
    } else {
      if (b.rank === 1 && b.shield > 0) Object.assign(b,eliteArmorStep(b,false));
      const penalty = interrupted
        ? 0
        : Math.round(
            (reason === "timeout" ? b.stats.penalty + 3 : b.stats.penalty) *
              (b.stance === "guard" ? 0.6 : 1),
          );
      const previousHp=b.hp;
      b.hp = Math.max(0, b.hp - penalty);
      const lost=previousHp-b.hp;
      b.response.effect=interrupted?tx('挡住了','ป้องกันได้'):'−'+lost+' HP';
      b.stage.hitText(
        interrupted ? tx("挡住了", "ป้องกันได้") : "−" + lost,
        false,
      );
      $("#mic-status").textContent = tx(
        (reason === "timeout" ? "时间到了。" : ['pairs','cloze','proof','reply','sequence'].includes(b.mode)||b.revealed ? "再看看这句话。" : "这次听错了。") +
          " " +
          (b.unit.choice ? nameOf(b.unit.choice) : sourceOf(b.unit)),
        (reason === "timeout" ? "หมดเวลาแล้ว " : ['pairs','cloze','proof','reply','sequence'].includes(b.mode)||b.revealed ? "ลองอ่านประโยคนี้อีกครั้ง " : "ครั้งนี้ฟังผิด ") +
          " " +
          (b.unit.choice ? nameOf(b.unit.choice) : sourceOf(b.unit)),
      );
      if(b.mode==='pairs') {
        const u=assessed[0];
        $('#mic-status').textContent=tx(reason==='timeout'?'时间到了 · ':'这组应当连到 · ',reason==='timeout'?'หมดเวลา · ':'คู่นี้ต้องเชื่อมกับ · ')+targetOf(u)+' — '+sourceOf(u);
      }
      if(b.mode==='chain')$('#mic-status').textContent=tx('回声的顺序是 · ','ลำดับเสียงคือ · ')+b.chain.units.map(sourceOf).join(' → ');
      if(b.mode==='cloze')$('#mic-status').textContent=tx('这句完整的话是 · ','ประโยคที่ครบคือ · ')+targetOf(b.unit);
      if(b.mode==='hunt')$('#mic-status').textContent=tx('要找的是第 '+(b.hunt.choices.findIndex(u=>u.id===b.unit.id)+1)+' 封 · ','คำตอบคือฉบับที่ '+(b.hunt.choices.findIndex(u=>u.id===b.unit.id)+1)+' · ')+targetOf(b.unit);
      if(b.mode==='reply')$('#mic-status').textContent=tx(reason==='timeout'?'时间到了。这里可以这样回应：':'这句话不符合情境。可以这样回应：',reason==='timeout'?'หมดเวลา ตอบได้ว่า: ':'ประโยคนี้ไม่ตรงสถานการณ์ ลองตอบว่า: ')+targetOf(b.unit);
    }
    if(['listen','chain','hunt','reply'].includes(b.mode))b.stage.enemyMood=correct?'greet':'read';
    if (save.settings.motion) {
      $(".scene").classList.remove("impact");
      void $(".scene").offsetWidth;
      $(".scene").classList.add("impact");
    }
    updateHealth();
    renderResponse(b);
  }, 260);
  laterBattle(b,
    () => {
      if (b !== battle) return;
      if (b.enemyHp <= 0) return finishBattle(true);
      if (b.hp <= 0) return finishBattle(false);
      b.choices = null;
      b.fragments = null;
      newQuestion();
    },
    responseHoldMs(correct,assessed),
  );
}
function renderResponse(b) {
  if(b!==battle||!b.response)return;
  const r=b.response,box=$('#battle-reply');
  const skill=r.assisted?tx('辅助练习','ฝึกแบบมีตัวช่วย'):['pairs','cloze','proof','reply'].includes(r.mode)?tx('认字与理解','อ่านและเข้าใจ'):r.mode==='sequence'?tx('完整表达','เรียงประโยค'):tx('听声辨义','ฟังความหมาย');
  box.innerHTML='<header><div><small>'+skill+'</small><strong role="status" aria-live="polite">'+tx(r.correct?'这句接住了':'再认清这句话',r.correct?'รับคำตอบได้แล้ว':'มาดูคำนี้อีกครั้ง')+'</strong></div><span class="reply-impact">'+esc(r.effect)+'</span></header><div class="reply-lines">'+r.units.map(u=>'<p><strong class="'+(targetOf(u).length<=14?'short-word':'')+'" lang="'+lang()+'">'+esc(targetOf(u))+'</strong><span class="'+(sourceOf(u).length<=14?'short-word':'')+'" lang="'+(lang()==='th'?'zh':'th')+'">'+esc(sourceOf(u))+'</span></p>').join('')+'</div><footer><span>'+tx(r.correct?'记住它，下一声就来了':'这句会留在错题手记里',r.correct?'จำไว้ เสียงถัดไปกำลังมา':'เก็บคำนี้ไว้ในสมุดทบทวนแล้ว')+'</span>'+button('review-response',tx('听 / 看完整','ฟัง / อ่านเต็ม'),'quiet','book')+'</footer>';
  box.dataset.outcome=r.correct?'correct':'wrong';box.hidden=false;
  $('.battle-scene').dataset.reply='shown';
}
function finishBattle(won) {
  const b = battle;
  if (!b) return;
  b.phase = "ended";
  $('#battle-reply').hidden=true;
  $('.battle-scene').dataset.reply='';
  clearInterval(b.timer);
  stopAudio();
  cancelVoice();
  const reward = won
    ? (b.practice?completePractice(save,save.world,b.independentIds):completeEncounter(save, save.world, b.chapter, b.rank))
    : { points: 0, chapterComplete: false };
  if (won) b.stage.celebrate();
  commit();
  $("#question-zone").innerHTML = "";
  $("#question-bubble").hidden = true;
  $(".bottom-bar").hidden = true;
  $("#mic-status").textContent = "";
  $(".scene").insertAdjacentHTML(
    "beforeend",
    '<section class="result"><small>' +
      tx(
        won ? "一段等待，有了回应" : "这一回，先把声音记住",
        won ? "การรอคอยได้รับคำตอบ" : "ครั้งนี้ จำเสียงไว้ก่อน",
      ) +
      "</small><h2>" +
      tx(
        won ? "信纸又往前飞了一点" : "再听一遍，就更接近了",
        won ? "จดหมายบินไปอีกนิด" : "ฟังอีกครั้ง ก็เข้าใกล้กว่าเดิม",
      ) +
      '</h2><div class="earned">' +
      (won
        ? "＋" + reward.points + " " + tx("纸币", "เหรียญกระดาษ")
        : tx("没有扣除纸币", "ไม่เสียเหรียญ")) +
      "</div><p>" +
      esc(
        won && reward.chapterComplete
          ? tx(CHAPTERS[b.chapter].letterZh, CHAPTERS[b.chapter].letterTh)
          : tx(
              "答对 " + b.correct + " 次，其中独立答对 "+b.independent+" 次。提示过的词会更早回到复习中。",
              "ตอบถูก " + b.correct + " ครั้ง โดยไม่ดูใบ้ "+b.independent+" ครั้ง คำที่ดูใบ้จะกลับมาทบทวนเร็วขึ้น",
            ),
      ) +
      '</p>'+(won&&b.monster.afterZh?'<p class="encounter-aftermath">'+esc(tx(b.monster.afterZh,b.monster.afterTh))+'</p>':'')+'<div class="cluster">' +
      button("home", tx("回到河畔", "กลับริมแม่น้ำ"), "quiet", "left") +
      (b.mistakes.size ? button('review-battle',tx('听一遍错题','ฟังข้อที่พลาด'),'quiet','book'):'')+
      button(
        b.practice?'practice:'+b.practice.category:(won ? (reward.finale?'ending':"continue") : "start:" + b.chapter + ":" + b.rank),
        won
          ? (b.practice?tx('再练一组','ฝึกอีกชุด'):reward.finale?tx('把信交给 CHANINDA','ส่งจดหมายให้小艾'):tx("下一场相遇", "การพบกันครั้งต่อไป"))
          : tx("再试一次", "ลองอีกครั้ง"),
        "primary",
        "arrow",
      ) +
      "</div></section>",
  );
}
function ending() {
  if(!campaignComplete(save,save.world))return home();
  mount('<main class="scene ending-scene">'+scenery(chapterScene(save.world,7))+
    hud(tx('下一封信，当面给你','จดหมายฉบับหน้า ส่งให้เธอด้วยตัวเอง'),tx('终章 · 河风来信','ตอนจบ · จดหมายในสายลม'))+
    '<section class="ending-letter"><small>CHANINDA &amp; 小艾</small><h2>'+tx('终于，听懂了你。','ในที่สุด ก็เข้าใจเธอแล้ว')+'</h2><p>'+tx('信落在桥中央。他们终于不用再隔着一座城市猜测彼此的话。怪物们没有消失，只是从拦路的人，变成了等他们回来的朋友。','จดหมายตกลงกลางสะพาน ในที่สุดทั้งสองก็ไม่ต้องเดาคำพูดของกันและกัน มอนสเตอร์ไม่ได้หายไป แต่กลายเป็นเพื่อนที่รอให้กลับมาเยี่ยม')+'</p><p class="muted">'+tx('这次旅途已经完成。你仍可以重访关卡、复习学过的话，或从另一位主角的视角再出发。','การเดินทางครั้งนี้จบแล้ว กลับไปเยี่ยมด่าน ทบทวนคำ หรือเริ่มจากมุมมองของอีกคนได้')+'</p></section><div class="bottom-bar">'+button('map',tx('重访旅途','กลับไปเยี่ยม'),'quiet','map')+button('worlds',tx('另一座城市','อีกเมืองหนึ่ง'),'primary','mail')+'</div></main>','ending');
  const s=sceneStage('');s.heroX=.64;s.options.enemyX=.81;s.options.ground=.8;s.options.enemyFacing=-1;
  s.opponent(HEROES[save.world==='th'?'cn':'th'].sheet,0);
  s.celebrate();
}
function showVoiceIssue(code,details={}) {
  const b=battle;if(!b||b.phase==='ended')return;
  b.voiceToken=(b.voiceToken||0)+1;
  enterVoiceRecovery(b,code);
  b.stage.setPose('idle');
  initMusic();
  const issue=voiceIssue(code,save.world);
  renderQuestion();
  $('#mic-status').textContent=issue.title+' · '+tx('已暂停计时','หยุดเวลาแล้ว');
  const evidence=details.transcript?'<p class="paper-letter">'+esc(tx('系统听到：','ระบบได้ยิน: ')+details.transcript)+'</p>':'';
  openPanel(issue.title,'<p class="paper-letter">'+esc(issue.message)+'</p>'+evidence+'<p class="muted">'+esc(tx('不计错、不扣血。只有重新听题或主动点选后才继续计时。','ไม่ถือว่าตอบผิดและไม่เสียพลัง เริ่มเวลาเมื่อฟังโจทย์ใหม่หรือเลือกตอบเอง'))+'</p><small class="voice-error-code">'+esc(code)+(Number.isInteger(details.code)?' · '+details.code:'')+'</small>',
    button('voice-check',tx('语音自检','ตรวจเสียง'),'quiet','mic')+button('voice-options',tx('先用点选','ใช้ตัวเลือกก่อน'),'quiet')+
    button(issue.action==='permission'?'voice-permission':issue.action==='network'?'voice-network':'voice-retry',issue.action==='permission'?tx('允许麦克风','อนุญาตไมโครโฟน'):issue.action==='network'?tx('确认联网识别','ยืนยันใช้ออนไลน์'):tx('再试一次','ลองใหม่'),'primary'));
}
function confirmNetworkVoice(){
  openPanel(tx('确认联网识别','ยืนยันการรู้จำออนไลน์'),'<p class="paper-letter">'+tx('系统语音服务可能将你这次跟读的声音发送给服务商处理。仅在你同意并主动开始跟读后使用；随时可在设置关闭。内置播放语音包不包含离线识别模型。','บริการเสียงของระบบอาจส่งเสียงที่พูดตามไปประมวลผล ใช้เมื่อคุณยินยอมและเริ่มพูดตามเท่านั้น ปิดได้ในการตั้งค่า ชุดเสียงตัวอย่างไม่ใช่โมเดลรู้จำออฟไลน์')+'</p>',button('close-panel',tx('暂不使用','ยังไม่ใช้'),'quiet')+button('voice-consent',tx('同意并开始','ยินยอมและเริ่ม'),'primary'));
}
let checkReady=false,checkBusy=false;
function checkEvent(data){
  if(!panel.open||!panel.querySelector('.voice-check'))return;
  const status=panel.querySelector('#check-status'),report=panel.querySelector('#check-report'),meter=panel.querySelector('#check-meter');
  const yes=v=>v?tx('已具备','พร้อม'):tx('未具备','ยังไม่พร้อม');
  if(data.status==='capabilities'){
    checkReady=data.recordingReady===true;
    let text=tx('麦克风授权：','สิทธิ์ไมโครโฟน: ')+yes(data.permissionGranted)+'\n'+tx('系统识别服务：','บริการรู้จำ: ')+yes(data.recognitionAvailable)+'\n'+tx('离线识别引擎：','เอนจินออฟไลน์: ')+yes(data.onDeviceAvailable)+'\n'+tx('当前语言：','ภาษาที่ใช้: ')+data.language;
    if(data.supportState==='reported'){
      text+='\n'+tx('当前语言离线模型：','โมเดลออฟไลน์ภาษานี้: ')+yes(data.localLanguageInstalled);
      if(data.allowNetwork)text+='\n'+tx('服务报告可联网识别：','บริการรายงานว่ารู้จำออนไลน์ได้: ')+yes(data.onlineLanguageAvailable);
      else text+='\n'+tx('联网识别：未授权，不检测。','การรู้จำออนไลน์: ยังไม่อนุญาต จึงไม่ตรวจ');
    }
    else text+='\n'+tx('语言支持：服务尚未报告，不能据此断言支持或不支持。','ภาษา: บริการยังไม่รายงาน จึงยังสรุปว่ารองรับหรือไม่ไม่ได้');
    if(data.lastRecognition?.status&&data.lastRecognition.status!=='idle')text+='\n'+tx('上次识别状态：','สถานะล่าสุด: ')+data.lastRecognition.status+' / '+data.lastRecognition.code;
    report.textContent=text;
    status.textContent=data.permissionGranted?tx('可先录5秒并回放，再判断是录音还是识别服务的问题。','บันทึก 5 วินาทีแล้วฟัง เพื่อแยกปัญหาการบันทึกกับบริการรู้จำ'):tx('请先点“允许麦克风”。授权不会自动开始录音。','แตะอนุญาตไมโครโฟนก่อน การอนุญาตจะไม่เริ่มบันทึกเอง');
  }else if(data.status==='level'){
    meter.value=Math.max(0,Math.min(1,Number(data.level)||0));
    status.textContent=tx('正在本机录音 · ','กำลังบันทึกในเครื่อง · ')+Math.min(5,(Number(data.elapsedMs)||0)/1000).toFixed(1)+' / 5s';
  }else{
    const messages={
      recording:tx('正在本机录5秒，请说一句话…','กำลังบันทึก 5 วินาที พูดหนึ่งประโยค…'),
      recorded:tx('录音已完成。请回放听自己的声音，电平不是发音分数。','บันทึกแล้ว ฟังเสียงตัวเอง ระดับเสียงไม่ใช่คะแนนการออกเสียง'),
      playing:tx('正在回放你的本机录音…','กำลังเล่นเสียงที่บันทึกในเครื่อง…'),
      'playback-ended':tx('回放结束。若能听清自己，录音链路可用；识别仍需系统语音服务。','เล่นจบแล้ว ถ้าฟังตัวเองชัด การบันทึกใช้ได้ แต่การรู้จำยังต้องใช้บริการระบบ'),
      'permission-request':tx('请处理系统授权窗口。授权后再主动开始录音。','ตอบหน้าต่างสิทธิ์ของระบบ แล้วแตะเริ่มบันทึกเอง'),
      'permission-granted':tx('麦克风已获授权。现在可以点“录5秒”；不会自动录音。','อนุญาตไมโครโฟนแล้ว แตะบันทึก 5 วินาทีได้ จะไม่บันทึกเอง'),
      erased:tx('测试录音已从本机删除。','ลบเสียงทดสอบจากเครื่องแล้ว'),
      interrupted:tx('已停止并删除测试录音。返回后可重新检测。','หยุดและลบเสียงทดสอบแล้ว เริ่มตรวจใหม่ได้'),
      copied:tx('诊断信息已复制，不含录音或识别文字。','คัดลอกข้อมูลแล้ว ไม่มีเสียงหรือข้อความที่พูด'),
      unavailable:tx('当前环境没有原生录音自检。安卓请更新到0.2.1；网页版使用浏览器识别能力。','สภาพแวดล้อมนี้ไม่มีการตรวจเสียงแบบแอป แอนดรอยด์ให้อัปเดตเป็น 0.2.1 ส่วนเว็บใช้บริการของเบราว์เซอร์'),
      'no-recording':tx('请先录5秒，再回放。','บันทึก 5 วินาทีก่อนแล้วจึงฟัง'),
      'playback-error':tx('本机回放失败，请重录并检查媒体音量或耳机。','เล่นเสียงไม่ได้ ลองบันทึกใหม่และตรวจระดับเสียงหรือหูฟัง'),
      'settings-opened':tx('返回应用后点击重新检测。','กลับแอปแล้วแตะตรวจอีกครั้ง'),
      'settings-unavailable':tx('系统没有提供该设置入口，可手动进入手机设置。','ระบบไม่มีทางลัดนี้ เปิดการตั้งค่าของโทรศัพท์เองได้'),
      'check-error':tx('自检未完成，请复制诊断信息。','ตรวจไม่สำเร็จ โปรดคัดลอกข้อมูลวินิจฉัย'),
      'copy-failed':tx('复制失败，请截下自检结果。','คัดลอกไม่ได้ โปรดจับภาพผลตรวจ'),
    };
    status.textContent=messages[data.status]||voiceIssue(data.status,save.world).message;
    if(data.status==='recorded')checkReady=true;
    if(['erased','recording','interrupted','audio-capture'].includes(data.status))checkReady=false;
    if(['recording','playing','permission-request'].includes(data.status))checkBusy=data.status;
    else if(!['copied','copy-failed'].includes(data.status))checkBusy=false;
    if(!checkBusy)meter.value=0;
  }
  for(const action of ['record','probe','permission','app-settings','speech-settings']){const b=panel.querySelector('[data-action="diag:'+action+'"]');if(b)b.disabled=checkBusy||!nativeDiagnosticsAvailable();}
  panel.querySelector('[data-action="diag:play"]').disabled=checkBusy||!checkReady;
  panel.querySelector('[data-action="diag:erase"]').disabled=checkBusy||!checkReady;
  panel.querySelector('[data-action="diag:stop"]').disabled=!['recording','playing'].includes(checkBusy);
  if(data.status==='permission-granted')runVoiceCheck('probe');
}
function runVoiceCheck(action){
  stopAudio();
  music?.pause();
  diagnostics(action,{language:lang()==='th'?'th-TH':'zh-CN',allowNetwork:save.settings.networkVoice,onEvent:checkEvent});
}
function openVoiceCheck(){
  checkReady=false;checkBusy=false;
  const body='<section class="voice-check"><p class="check-privacy">'+tx('本机录音，不上传、不评分。离开自检即删除；意外退出则下次打开清理。','บันทึกในเครื่อง ไม่อัปโหลด ไม่ให้คะแนน ออกแล้วลบ หากปิดผิดปกติจะล้างเมื่อเปิดใหม่')+'</p>'+
    '<p id="check-status" role="status"></p><meter id="check-meter" min="0" max="1" value="0" aria-label="'+tx('实际输入电平，不是发音分数','ระดับเสียงเข้า ไม่ใช่คะแนนออกเสียง')+'"></meter>'+
    '<div class="check-actions">'+button('diag:permission',tx('允许麦克风','อนุญาตไมโครโฟน'),'primary')+button('diag:record',tx('录5秒','บันทึก 5 วินาที'),'primary','mic')+button('diag:stop',tx('停止','หยุด'),'quiet')+button('diag:play',tx('回放录音','ฟังเสียงที่บันทึก'),'quiet','play')+button('diag:erase',tx('删除录音','ลบเสียง'),'quiet')+'</div>'+
    '<details class="check-details"><summary>'+tx('设备与识别服务详情','รายละเอียดอุปกรณ์และบริการรู้จำ')+'</summary><pre id="check-report"></pre><div class="check-actions">'+button('diag:probe',tx('重新检测','ตรวจอีกครั้ง'),'quiet')+button('diag:app-settings',tx('本应用权限设置','สิทธิ์ของแอป'),'quiet')+button('diag:speech-settings',tx('系统语音服务','บริการเสียงของระบบ'),'quiet')+'</div></details></section>';
  openPanel(tx('语音自检 · 先确认能录到声音','ตรวจเสียง · ตรวจว่าบันทึกได้ก่อน'),body,
    button('diag:copy',tx('复制诊断信息','คัดลอกข้อมูลวินิจฉัย'),'quiet')+button('close-panel',tx('关闭自检','ปิดการตรวจ'),'primary'),()=>{closeDiagnostics();checkReady=false;checkBusy=false;initMusic();});
  runVoiceCheck('probe');
}
function microphone() {
  const b = battle;
  if(b&&!['listen','sequence'].includes(b.mode))return;
  if (!b || ["audio", "resolving", "ended"].includes(b.phase)) return;
  if (b.phase === "voice") {
    stopVoice();
    return;
  }
  if(b.echoEarned)return;
  if(!b.echoPrepared){
    clearInterval(b.timer);stopAudio();
    b.echoPrepared=true;b.assisted=true;b.revealed=true;b.phase='waiting';
    b.stage.setPose('listen');
    $('#mic-status').textContent='';renderQuestion();return;
  }
  if (!globalThis.XulongNativeVoice && !save.settings.networkVoice) {
    openPanel(
      tx("先确认语音使用方式", "ยืนยันการใช้เสียง"),
      '<p class="paper-letter">' +
        tx(
          "浏览器语音识别可能把录音发送给系统或浏览器服务商。我们不把“识别正确”冒充发音标准分；你也可以一直用听力选项游玩。",
          "บริการรู้จำเสียงของเบราว์เซอร์อาจส่งเสียงไปยังผู้ให้บริการ การรู้จำถูกไม่ใช่คะแนนสำเนียง คุณยังเล่นด้วยตัวเลือกได้เสมอ",
        ) +
        "</p>",
      button("close-panel", tx("先用听力选项", "ใช้ตัวเลือกก่อน"), "quiet") +
        button("voice-consent", tx("允许并开始", "อนุญาตและเริ่ม"), "primary"),
    );
    return;
  }
  clearInterval(b.timer);
  b.voiceIssue=null;
  stopAudio();
  music?.pause();
  b.phase = "voice";
  b.stage.setPose('speak');
  b.voiceToken = (b.voiceToken || 0) + 1;
  const token = b.voiceToken;
  setControlState();
  $("#mic-status").textContent = tx("正在准备麦克风…", "กำลังเตรียมไมโครโฟน…");
  startVoice(lang(), {
    allowNetwork: save.settings.networkVoice,
    maxMs: Math.min(40000, 12000 + b.chapter * 4000),
    onState: (state, details = {}) => {
      if (b !== battle || token !== b.voiceToken || b.phase !== "voice") return;
      const messages = {
        preparing: tx("正在准备麦克风…", "กำลังเตรียมไมโครโฟน…"),
        listening: tx(
          "我在听，说完请点“说完了”。",
          "กำลังฟัง พูดเสร็จแล้วกด “พูดเสร็จแล้ว”",
        ),
        processing: tx("正在核对听到的文字…", "กำลังตรวจข้อความที่ได้ยิน…"),
        interim: tx("继续说，我在听…", "พูดต่อได้ กำลังฟัง…"),
      };
      if (messages[state]) {
        $("#mic-status").textContent = messages[state];
        return;
      }
      if (state === "result") return;
      showVoiceIssue(state,details);
    },
    onResult: (text) => {
      if (b !== battle || token !== b.voiceToken || b.phase!=='voice') return;
      const result = matchSpeech(text, targetOf(b.unit));
      $("#mic-status").textContent = tx(
        "识别文字：“" + text + "” · 不是口音评分",
        "ข้อความที่รู้จำ: “" + text + "” · ไม่ใช่คะแนนสำเนียง",
      );
      if (result.matched && awardEcho(b,text,targetOf(b.unit))) {
        b.phase='ready';b.echoPrepared=false;
        b.remaining=Math.max(5,b.remaining);
        b.stage.setPose('wave',1200);
        renderQuestion();
        $('#mic-status').textContent=tx('跟读文字匹配 · 下一题 +2秒。现在选出意思再出招。','ข้อความตรงกัน · ข้อถัดไป +2 วินาที เลือกความหมายเพื่อโจมตี');
        initMusic();startTimer();
      } else {
        b.revealed = true;
        b.assisted = true;
        showVoiceIssue('text-mismatch',{transcript:text});
      }
    },
  });
}
async function playUnit(unit) {
  if (!unit) return;
  const context = epoch;
  let unavailable=false;
  duck(true);
  const ok = await speak(targetOf(unit), lang(), {
    rate: save.settings.speechRate,
    onState:state=>{if(state==='unavailable')unavailable=true;},
  });
  duck(false);
  if (context === epoch && !ok && unavailable)
    toast(
      tx(
        "这句暂无可用语音；请检查设备是否安装了对应语言语音。",
        "ยังไม่มีเสียงนี้ ตรวจว่าติดตั้งเสียงภาษาที่ตรงกันแล้วหรือไม่",
      ),
    );
}

function action(id) {
  const [key, a, b] = id.split(":");
  switch (key) {
    case "worlds":
      worlds();
      break;
    case "world":
      chooseWorld(a);
      break;
    case "intro":
      prologue(Number(a));
      break;
    case "skip-intro":
      finishIntro();
      break;
    case "home":
      home();
      break;
    case 'hero-greet':
      greetHero();
      break;
    case 'echo-options':
      if(battle){battle.voiceToken=(battle.voiceToken||0)+1;cancelVoice();battle.echoPrepared=false;battle.phase='waiting';battle.stage.setPose('idle');reveal();initMusic();}
      break;
    case "continue":
      if(campaignComplete(save,save.world))ending();else encounter();
      break;
    case "arena":
      arenaMenu();
      break;
    case "practice":
      practiceBattle(a);
      break;
    case "ending":
      ending();
      break;
    case "review-battle":
      if(battle?.phase==='ended')openPanel(tx('先听清，再出发','ฟังให้ชัดก่อนออกเดินทาง'),lessonRows([...battle.mistakes.values()]),button('close-panel',tx('回到结算','กลับหน้าผลลัพธ์'),'primary'));
      break;
    case "map":
      mapScreen();
      break;
    case "chapter":
      chapterMenu(Number(a));
      break;
    case "encounter":
      encounter(Number(a), Number(b));
      break;
    case "brief":
      brief(Number(a), Number(b));
      break;
    case 'field-open': visitField();break;
    case 'field-word': fieldAnswer('read',a);break;
    case 'field-act': fieldAnswer('act',Number(a));break;
    case 'field-help':
      if(exploration&&panel.open&&panel.classList.contains('field-panel')){exploration.attempt.help=true;showField();}
      break;
    case 'field-album': fieldAlbum();break;
    case "start":
      startBattle(Number(a), Number(b));
      break;
    case "journal":
      journal();
      break;
    case "dictionary":
      dictionary();
      break;
    case "letters":
      letters();
      break;
    case "wardrobe":
      wardrobe();
      break;
    case "outfit-preview":
      wardrobe(a);
      break;
    case "outfit-buy":
      purchase(a);
      break;
    case "pose-attack":
      stages[0]?.swing();
      break;
    case "pose-victory":
      stages[0]?.celebrate();
      break;
    case 'hero-replay':
      if(route==='wardrobe')stages[0]?.previewHero($('#hero-moment').value);
      break;
    case "bestiary":
      bestiary(a);
      break;
    case "monster":
      monsterDetail(a);
      break;
    case "codex-pose":
      window.__codexStage?.previewEnemy('attack');
      if(panel.querySelector('[data-codex-pose]'))panel.querySelector('[data-codex-pose]').value='attack';
      break;
    case "settings":
      settings();
      break;
    case "close-panel":
      closePanel();
      break;
    case "listen":
      listen();
      break;
    case 'reply-start':
      if(battle?.mode==='reply'&&battle.phase==='waiting')listen();break;
    case 'reply-context':
      if(battle?.mode==='reply'&&battle.phase==='ready')openPanel(tx('回看情境 · 暂停计时','ดูสถานการณ์ · หยุดเวลา'),'<div class="paper-letter"><p>'+esc(nameOf(battle.reply.scene))+'</p></div>');
      break;
    case 'reply-select':
      if(battle?.mode==='reply'&&battle.phase==='ready'&&!battle.paused&&selectReply(battle.reply,a)){
        renderReply();$('[data-action="reply-select:'+a+'"]')?.focus({preventScroll:true});
      }
      break;
    case 'reply-submit':
      if(battle?.mode==='reply'&&battle.phase==='ready'&&!battle.paused){const r=submitReply(battle.reply);if(r.kind!=='ignored')resolveAnswer(r.kind==='correct','reply');}
      break;
    case 'proof-inspect':
      if(battle?.mode==='proof'&&battle.phase==='ready'&&!battle.paused){
        const r=inspectProof(battle.proof,Number(a));
        if(r.kind==='wrong')resolveAnswer(false,'proof');
        else if(r.kind==='located'){
          battle.stage.setPose('read',700);battle.stage.enemyMood='read';renderProof();
          $('[data-action^="proof-mend:"]')?.focus({preventScroll:true});
        }
      }
      break;
    case 'proof-mend':
      if(battle?.mode==='proof'&&battle.phase==='ready'&&!battle.paused){
        const r=mendProof(battle.proof,a);if(r.kind!=='ignored')resolveAnswer(r.kind==='complete','proof');
      }
      break;
    case 'hunt-listen': listenHunt(Number(a));break;
    case 'hunt-select':
      if(battle?.mode==='hunt'&&battle.phase==='ready'&&!battle.paused&&Number.isInteger(Number(a))&&battle.hunt.choices[Number(a)]){
        battle.hunt.selected=Number(a);renderSoundHunt();$('[data-action="hunt-select:'+a+'"]')?.focus({preventScroll:true});
      }
      break;
    case 'hunt-submit':
      if(battle?.mode==='hunt'&&battle.phase==='ready'&&!battle.paused){const r=submitSoundHunt(battle.hunt,battle.revealed);if(r.valid)resolveAnswer(r.correct,'hunt');}
      break;
    case 'hunt-clue':
      if(battle?.mode==='hunt')openPanel(tx('要寻找的意思','ความหมายที่ต้องหา'),'<div class="paper-letter"><p>'+esc(sourceOf(battle.unit))+'</p></div><p>'+tx('找到表达这个意思的声音。这里只展开线索，不展示目标语言答案。','หาเสียงที่ตรงกับความหมายนี้ หน้านี้แสดงเฉพาะเบาะแส ไม่เปิดคำตอบภาษาที่กำลังเรียน')+'</p>');
      break;
    case "reveal":
      reveal();
      break;
    case 'review-response':
      if(battle?.response&&battle.phase==='resolving'){
        const r=battle.response;
        openPanel(tx('把这句听清、看懂','ฟังและอ่านให้เข้าใจ'),'<p class="muted">'+tx('已暂停出招和下一题。这次复盘不会追加伤害、点数或独立掌握记录。','หยุดการต่อสู้และข้อถัดไปแล้ว การทบทวนนี้ไม่เพิ่มความเสียหาย คะแนน หรือการตอบได้ด้วยตนเอง')+'</p>'+lessonRows(r.units));
      }
      break;
    case 'transcript':
      if(battle?.revealed&&!['resolving','ended','voice'].includes(battle.phase))openPanel(tx('把这句话看完整','อ่านประโยคให้ครบ'),'<p class="muted">'+tx('文字辅助 · 计时已暂停，不计独立听懂。','คำใบ้ตัวอักษร · หยุดเวลาแล้ว ไม่นับว่าฟังได้ด้วยตนเอง')+'</p>'+lessonRows(battle.chain?.units||[battle.unit]));
      break;
    case "microphone":
      microphone();
      break;
    case 'voice-check': openVoiceCheck();break;
    case 'voice-permission': openVoiceCheck();runVoiceCheck('permission');break;
    case 'voice-retry': closePanel();microphone();break;
    case 'voice-options': closePanel();reveal();break;
    case 'voice-network': confirmNetworkVoice();break;
    case 'diag': runVoiceCheck(a);break;
    case "voice-consent":
      save.settings.networkVoice = true;
      commit();
      closePanel();
      microphone();
      break;
    case "pause-battle":
      openPanel(
        tx("旅途暂停", "พักการเดินทาง"),
        "<p>" +
          tx(
            "暂停时不计时、不受伤。当前战斗离开后会重新开始，已获得的进度和纸币保留。",
            "ระหว่างพักไม่จับเวลาและไม่เสียพลัง หากออกจะเริ่มการต่อสู้นี้ใหม่ ความคืบหน้าและเหรียญยังอยู่",
          ) +
          "</p>",
        button("home", tx("离开战斗", "ออกจากการต่อสู้"), "quiet") +
          button("close-panel", tx("继续战斗", "สู้ต่อ"), "primary"),
      );
      break;
    case "undo-chain":
      if(battle?.mode==='chain'&&battle.phase==='ready'&&!battle.paused){battle.chain.order.pop();renderQuestion();}
      break;
    case "submit-chain":
      if(battle?.mode==='chain'&&battle.phase==='ready'&&!battle.paused&&battle.chain.order.length===2)resolveAnswer(battle.chain.order.every((i,n)=>battle.chain.choices[i].id===battle.chain.units[n].id),'chain');
      break;
    case "undo-order":
      if (battle?.phase === "ready") {
        battle.order.pop();
        renderQuestion();
      }
      break;
    case "submit-order":
      if (battle?.phase === "ready") {
        if (battle.order.length !== battle.unit.segments[save.world].length) {
          toast(
            tx("把所有词组连起来，再说出整句话。", "เรียงให้ครบทุกส่วนก่อน"),
          );
          break;
        }
        resolveAnswer(battle.order.every((v, i) => v === i));
      }
      break;
  }
}
document.addEventListener("click", (e) => {
  const chain=e.target.closest('[data-chain]');
  if(chain && !chain.disabled && battle?.mode==='chain' && battle.phase==='ready'&&!battle.paused){battle.chain.order.push(Number(chain.dataset.chain));renderQuestion();return;}
  const cloze=e.target.closest('[data-cloze]');
  if(cloze && !cloze.disabled && battle?.mode==='cloze' && battle.phase==='ready'&&!battle.paused){resolveAnswer(battle.cloze.choices[Number(cloze.dataset.cloze)]===battle.cloze.parts[battle.cloze.missing]);return;}
  const connection=e.target.closest('[data-connect]');
  if(connection && !connection.disabled){chooseConnection(connection.dataset.side,connection.dataset.connect);return;}
  const act = e.target.closest("[data-action]");
  if (act && !act.disabled) {
    action(act.dataset.action);
    return;
  }
  const answer = e.target.closest("[data-answer]");
  if (answer && !answer.disabled) {
    chooseAnswer(answer.dataset.answer);
    return;
  }
  const fragment = e.target.closest("[data-fragment]");
  if (fragment && !fragment.disabled && battle?.phase === "ready") {
    battle.order.push(Number(fragment.dataset.fragment));
    renderQuestion();
    return;
  }
  const stance = e.target.closest("[data-stance]");
  if (stance && battle && !stance.disabled) {
    battle.stance = stance.dataset.stance;
    if(!['voice','audio'].includes(battle.phase))battle.stage.setPose(battle.stance==='guard'?'guard':'idle');
    setControlState();
    return;
  }
  const audio = e.target.closest("[data-audio]");
  if (audio) playUnit(findUnit(audio.dataset.audio));
});
document.addEventListener("change", (e) => {
  if(e.target.matches('[data-codex-pose]')){window.__codexStage?.previewEnemy(e.target.value);return;}
  const key = e.target.dataset.setting;
  if (!["music", "motion", "networkVoice"].includes(key)) return;
  save.settings[key] = e.target.checked;
  commit();
  if (key === "music") {
    if (save.settings.music) initMusic();
    else music?.pause();
  }
  if (key === "motion")
    stages.forEach((s) => s.setMotion(save.settings.motion));
  root.querySelectorAll('.scene').forEach(n=>n.dataset.motion=String(save.settings.motion));
  if (key === "networkVoice" && !save.settings.networkVoice) cancelVoice();
});
document.addEventListener("keydown", (e) => {
  if (panel.open || e.target.matches("input,textarea,select")) return;
  if (
    ["home", "explore"].includes(route) &&
    ["ArrowLeft", "ArrowRight", "a", "d"].includes(e.key)
  ) {
    e.preventDefault();
    stages[0].moving = ["ArrowLeft", "a"].includes(e.key) ? -1 : 1;
  }
});
document.addEventListener("keyup", () => {
  if (["home", "explore"].includes(route) && stages[0]) stages[0].moving = 0;
});
window.addEventListener("blur", () => {
  stages.forEach((s) => {s.moving = 0;s.destination=null;});
  pauseBattle();
});
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',()=>stages.forEach(s=>s.setMotion(save.settings.motion)));
window.addEventListener("focus", () => resumeBattle());
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stages.forEach(s=>{s.moving=0;s.destination=null;});
    pauseBattle();
    if (battle?.phase === "voice") {
      battle.voiceToken++;
      enterVoiceRecovery(battle,'cancelled');
      renderQuestion();
      battle.stage.setPose('idle');
      $("#mic-status").textContent=tx('跟读已中断，计时已暂停。点击开始跟读重试。','การพูดตามถูกขัดจังหวะ หยุดเวลาแล้ว แตะเริ่มพูดตามเพื่อลองใหม่');
    }
    cancelVoice();
    if(panel.querySelector('.voice-check'))runVoiceCheck('background');
    music?.pause();
  } else {
    if(panel.querySelector('.voice-check'))runVoiceCheck('probe');
    resumeBattle();
    initMusic();
  }
});
window.addEventListener("pagehide", () => {
  closeDiagnostics();
  // Progress, settings and purchases are persisted at their action boundary.
  // Unconditionally flushing this tab here can overwrite a newer tab's save.
  // In-progress battle HP/position is intentionally not a resumable save.
  cancelVoice();
  stopAudio();
  music?.pause();
});
window.__XULONG_ADVENTURE__ = {
  snapshot: () => ({
    route,
    world: save.world,
    points: save.points,
    progress: structuredClone(progress()),
    exploration:exploration?{chapter:exploration.chapter,rank:exploration.rank,id:exploration.note.id,phase:exploration.attempt.phase,lesson:exploration.note.lesson.id,approaching:exploration.approaching}:null,
    battle: battle
      ? {
          phase: battle.phase,
          chapter: battle.chapter,
          rank: battle.rank,
          hp: battle.hp,
          enemyHp: battle.enemyHp,
          shield: battle.shield,
          combo: battle.combo,
          remaining: battle.remaining,
          paused: battle.paused,
          sequence: battle.sequence,
          mode: battle.mode,
          craftAct: battle.monster.craft?craftPhase(battle):null,
          armorMarks:[...(battle.armorMarks||[])],
          reply:battle.reply?{scene:battle.reply.scene.id,selected:battle.reply.selected,choices:battle.reply.choices.map(u=>u.id),committed:battle.reply.committed}:null,
          proof: battle.proof?{phase:battle.proof.phase,target:battle.proof.target,rows:battle.proof.rows.map(r=>({source:r.source.id,printed:r.printed.id})),choices:battle.proof.choices.map(u=>u.id),committed:battle.proof.committed}:null,
          hunt: battle.hunt?{ids:battle.hunt.choices.map(u=>u.id),heard:[...battle.hunt.heard],selected:battle.hunt.selected,playing:battle.hunt.playing??null,audioFailed:!!battle.hunt.audioFailed}:null,
          chain: battle.chain?{ids:battle.chain.units.map(u=>u.id),selected:battle.chain.order.length}:null,
          connected: battle.connections?.linked.length||0,
          question: battle.unit?.id,
          echoEarned: !!battle.echoEarned,
          echoPrepared: !!battle.echoPrepared,
          nextTimeBonus: battle.nextTimeBonus||0,
          timeBonus: battle.timeBonus||0,
          roundLimit: battle.roundLimit,
        }
      : null,
  }),
};
if (save.intro) home();
else worlds();
