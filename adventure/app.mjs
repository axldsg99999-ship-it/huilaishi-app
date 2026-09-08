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
  normalized,
} from "./core.mjs";
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
} from "./content.mjs";
import { Stage } from "./renderer.mjs";
import {
  speak,
  stopAudio,
  startVoice,
  stopVoice,
  cancelVoice,
} from "./voice.mjs";

const root = document.querySelector("#app"),
  panel = document.querySelector("#panel");
let storage;
try {
  storage = localStorage;
} catch {}
let save = storage ? loadSave(storage) : freshSave(),
  route = "",
  stages = [],
  epoch = 0,
  battle = null,
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
function cleanup() {
  epoch++;
  timers.forEach(clearTimeout);
  timers.clear();
  stages.forEach((s) => s.destroy());
  stages = [];
  stopAudio();
  cancelVoice();
  if (battle?.timer) clearInterval(battle.timer);
  battle = null;
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
function scenery(src) {
  return (
    '<img class="backdrop" src="' +
    esc(src) +
    '" alt="" draggable="false"><canvas class="actors" aria-hidden="true"></canvas>'
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
  cancelVoice();
  if (battle?.phase === "voice") battle.phase = "ready";
  const previous = panelReturn;
  panelReturn = null;
  previous?.();
  panelReturn = onClose;
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
  if (panel.open) panel.close();
}
panel.addEventListener("close", () => {
  const fn = panelReturn;
  panelReturn = null;
  fn?.();
  resumeBattle();
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
  if (!save.settings.music) return;
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
            scenery(ASSET(w === "th" ? "river-home.png" : "cn-home.png")) +
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
      scenery(ASSET(page === 1 ? "clock-canal.png" : "river-home.png")) +
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
  mount(
    '<main class="scene">' +
      scenery(chapterScene(save.world, 0)) +
      hud(
        tx("河风来信", "จดหมายในสายลม"),
        tx("一封信，通向另一座城市", "จดหมายหนึ่งฉบับนำไปสู่อีกเมือง"),
        "worlds",
      ) +
      '<div class="home-hint">' +
      tx(
        "按住方向键走走。信箱里，也许有另一座城市的消息。",
        "กดทิศทางค้างเพื่อเดิน อาจมีจดหมายจากอีกเมืองรออยู่",
      ) +
      '</div><button class="hotspot" style="left:16%;top:46%" data-action="wardrobe">' +
      icon("shirt") +
      tx("课后衣橱", "ตู้เสื้อผ้า") +
      '</button><button class="hotspot" style="left:49%;top:56%" data-action="letters">' +
      icon("mail") +
      tx("河畔信箱", "ตู้จดหมาย") +
      '</button><button class="hotspot" style="left:77%;top:39%" data-action="arena">' +
      icon("sword") +
      tx("校园声斗赛", "ลานประลองเสียง") +
      '</button><div class="bottom-bar"><div class="cluster">' +
      ib("map", tx("旅途地图", "แผนที่"), "map") +
      ib("journal", tx("随身手记", "สมุดบันทึก"), "book") +
      ib("bestiary", tx("遇见它们", "เรื่องของมอนสเตอร์"), "leaf") +
      '<button class="icon-btn move-btn" data-move="-1" aria-label="' +
      tx("向左走", "เดินซ้าย") +
      '">' +
      icon("left") +
      '</button><button class="icon-btn move-btn" data-move="1" aria-label="' +
      tx("向右走", "เดินขวา") +
      '">' +
      icon("right") +
      '</button></div><div class="destination"><small>' +
      esc(nameOf(c)) +
      "</small>" +
      button(
        "continue",
        campaignComplete(save,save.world) ? tx("重看结局", "ชมตอนจบอีกครั้ง") : tx("继续冒险", "ผจญภัยต่อ"),
        "primary large",
        "arrow",
      ) +
      "</div></div></main>",
    "home",
  );
  sceneStage("");
  bindWalking();
}
function bindWalking() {
  root.onpointerdown = (e) => {
    const b = e.target.closest("[data-move]");
    if (!b) return;
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
    '<main class="scene">' +
      scenery(chapterScene(save.world, c)) +
      hud(
        nameOf(CHAPTERS[c]),
        tx("走近它，听一段未说完的故事", "เดินเข้าไปฟังเรื่องที่ยังเล่าไม่จบ"),
      ) +
      '<button class="hotspot" style="left:70%;top:35%" data-action="brief:' +
      c +
      ":" +
      s +
      '">' +
      icon("mail") +
      esc(nameOf(m)) +
      '</button><div class="home-hint">' +
      esc(tx(m.traitZh, m.traitTh)) +
      '</div><div class="bottom-bar"><div class="cluster"><button class="icon-btn" data-move="-1" aria-label="' +
      tx("向左走", "เดินซ้าย") +
      '">' +
      icon("left") +
      '</button><button class="icon-btn" data-move="1" aria-label="' +
      tx("向右走", "เดินขวา") +
      '">' +
      icon("right") +
      "</button></div>" +
      button(
        "brief:" + c + ":" + s,
        tx("和它说说话", "คุยกับมัน"),
        "primary",
        "mail",
      ) +
      "</div></main>",
    "explore",
  );
  const st = sceneStage(chapterScene(save.world, c));
  st.opponent(m, s);
  bindWalking();
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
      "</p>",
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
    units = seen.map(findUnit).filter(Boolean);
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
      "</p>" +
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
    '<main class="scene">' +
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
            icon("shirt") +
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
      '</div><div class="wardrobe-actions">' +
      ib("pose-attack", tx("看看出招", "ดูท่าโจมตี"), "sword") +
      ib("pose-victory", tx("庆祝动作", "ท่าดีใจ"), "check") +
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
    large: true,
    ground: 0.95,
  });
  s.heroX = 0.5;
  s.equip(selected.sheet);
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
function bestiary() {
  openPanel(
    tx("不是每一个阻拦，都是敌意", "ไม่ใช่ทุกการขวางทางจะเป็นศัตรู"),
    '<p class="muted">' +
      tx(
        "30位守信者 · 每个世界都有自己的相遇。点开可看故事与出招。",
        "ผู้เฝ้าจดหมาย 30 ตน แต่ละโลกมีเรื่องต่างกัน แตะเพื่อดูเรื่องราวและท่าโจมตี",
      ) +
      '</p><div class="bestiary-grid">' +
      MONSTERS.map(
        (m) =>
          '<button class="outfit" data-action="monster:' +
          m.id +
          '"><strong>' +
          esc(nameOf(m)) +
          "</strong><small>" +
          esc(tx(m.traitZh, m.traitTh)) +
          "</small><span>" +
          tx(
            m.world === "th" ? "泰国世界" : "中国世界",
            m.world === "th" ? "โลกไทย" : "โลกจีน",
          ) +
          " · " +
          tx(
            ["普通", "精英", "首领"][m.rank],
            ["ทั่วไป", "ชั้นยอด", "บอส"][m.rank],
          ) +
          "</span></button>",
      ).join("") +
      "</div>",
  );
}
function monsterDetail(id) {
  const m = MONSTERS.find((x) => x.id === id);
  if (!m) return;
  openPanel(
    nameOf(m),
    '<div class="monster-detail"><canvas class="codex-actor" aria-hidden="true"></canvas><section><p class="paper-letter">' +
      esc(tx(m.loreZh, m.loreTh)) +
      "</p><h3>" +
      tx("看懂它的动作", "อ่านท่าทางของมัน") +
      "</h3><p>" +
      esc(tx(m.tellZh, m.tellTh)) +
      "</p><p>" +
      esc(tx(m.counterZh, m.counterTh)) +
      "</p></section></div>",
    button("bestiary", tx("返回图鉴", "กลับสมุดมอนสเตอร์"), "quiet") +
      button("codex-pose", tx("看它出招", "ดูท่าโจมตี"), "primary"),
    () => {
      codex?.destroy();
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
    '<main class="scene battle-scene">' +
      scenery(chapterScene(save.world, chapter)) +
      '<header class="hud battle-hud"><div class="hud-left">' +
      ib("pause-battle", tx("暂停战斗", "พักการต่อสู้"), "pause") +
      '<div class="health"><strong>' +
      esc(HEROES[save.world].name) +
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
      button("microphone", tx("开口回答", "ตอบด้วยเสียง"), "dark", "mic") +
      "</div></div></main>",
    "battle",
  );
  const stage = sceneStage(chapterScene(save.world, chapter));
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
  $("#battle-status").textContent = tx(
    "连击 " +
      b.combo +
      " · " +
      (b.rank === 0 ? "相遇" : b.rank === 1 ? "精英" : "首领"),
    "ต่อเนื่อง " + b.combo + " · " + ["พบกัน", "ชั้นยอด", "บอส"][b.rank],
  );
}
function newQuestion() {
  if (!battle) return;
  const b = battle;
  stopAudio();
  cancelVoice();
  clearInterval(b.timer);
  b.turn++;
  b.unit = b.queue[(b.turn - 1) % b.queue.length];
  b.phase = "waiting";
  b.assisted = false;
  b.speechAnswer = false;
  b.revealed = false;
  b.elapsed = 0;
  b.remaining = b.stats.time;
  b.order = [];
  b.paused = false;
  b.recognition = null;
  b.qToken = (b.qToken || 0) + 1;
  b.sequence =
    b.rank === 2 &&
    b.enemyHp <= b.stats.enemyHp / 2 &&
    b.unit.segments[save.world].length > 1;
  b.stage.phase = b.rank === 2 && b.enemyHp <= b.stats.enemyHp / 2;
  $("#mic-status").textContent = "";
  $("#time-fill").style.width = "100%";
  renderQuestion();
  updateHealth();
}
function renderQuestion() {
  const b = battle;
  if (!b) return;
  const u = b.unit,
    seq = b.sequence,
    main = b.revealed
      ? targetOf(u)
      : tx("听见它想说什么", "ฟังว่ามันอยากพูดอะไร");
  $("#question-bubble").innerHTML =
    "<small>" +
    esc(tx(b.monster.traitZh, b.monster.traitTh)) +
    '</small><div class="bubble-main ' +
    (main.length > 22 ? "long" : "") +
    '" lang="' +
    (b.revealed ? lang() : "") +
    '">' +
    (b.revealed
      ? esc(main)
      : '<button class="voice-source" data-action="listen" aria-label="' +
        tx("听怪物的声音", "ฟังเสียงมอนสเตอร์") +
        '">' +
        icon("sound") +
        "</button>") +
    '</div><button class="bubble-hint" data-action="reveal">' +
    (b.revealed
      ? tx("已显示文字 · 不计速度加成", "แสดงข้อความแล้ว · ไม่มีโบนัสความเร็ว")
      : tx("需要文字提示？", "ต้องการคำใบ้ตัวอักษร?")) +
    "</button>";
  const zone = $("#question-zone");
  zone.classList.toggle("sequence", seq);
  if (seq) {
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
    zone.innerHTML =
      '<div class="thought-trail" aria-hidden="true"><i></i><i></i><i></i></div><div class="answers ' +
      (b.chapter >= 6
        ? "sentence"
        : b.choices.some((x) => sourceOf(x).length > 20)
          ? "long"
          : "") +
      '">' +
      b.choices
        .map(
          (x, i) =>
            '<button class="answer" data-answer="' +
            i +
            '" ' +
            (!["ready", "voice"].includes(b.phase) ? "disabled" : "") +
            "><small>" +
            String(i + 1).padStart(2, "0") +
            "</small><span>" +
            esc(x.choice ? nameOf(x.choice) : sourceOf(x)) +
            "</span></button>",
        )
        .join("") +
      "</div>";
  }
  setControlState();
}
function setControlState() {
  const b = battle;
  if (!b) return;
  const listen = $('.mic-group [data-action="listen"]'),
    mic = $('[data-action="microphone"]');
  const busy = ["resolving", "ended"].includes(b.phase);
  if (listen) {
    listen.disabled = busy || b.phase === "voice";
    listen.querySelector("span").textContent =
      b.phase === "audio"
        ? tx("播放中…", "กำลังเล่น…")
        : b.phase === "waiting"
          ? tx("听题 · 开始", "ฟังโจทย์ · เริ่ม")
          : tx("再听一次", "ฟังอีกครั้ง");
  }
  if (mic) {
    mic.disabled = busy || b.phase === "audio";
    mic.querySelector("span").textContent =
      b.phase === "voice"
        ? tx("说完了", "พูดเสร็จแล้ว")
        : tx("开口回答", "ตอบด้วยเสียง");
  }
  root.querySelectorAll("[data-stance]").forEach((el) => {
    el.disabled = busy;
    el.setAttribute("aria-pressed", String(el.dataset.stance === b.stance));
  });
}
function startTimer() {
  const b = battle;
  if (!b || b.paused || b.phase !== "ready" || document.hidden) return;
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
    $("#time-fill").style.width = (100 * b.remaining) / b.stats.time + "%";
    if (b.remaining <= 0) resolveAnswer(false, "timeout");
  }, 80);
}
function pauseBattle() {
  if (battle) {
    battle.paused = true;
    clearInterval(battle.timer);
    if (battle.phase === "audio") {
      battle.playToken = (battle.playToken || 0) + 1;
      battle.phase = "waiting";
      stopAudio();
      setControlState();
    }
    battle.stage.moving = 0;
  }
}
function resumeBattle() {
  if (!battle || panel.open || document.hidden) return;
  battle.paused = false;
  startTimer();
}
async function listen() {
  const b = battle;
  if (!b || ["resolving", "ended", "voice"].includes(b.phase)) return;
  const q = b.qToken;
  const playToken = (b.playToken = (b.playToken || 0) + 1);
  clearInterval(b.timer);
  b.phase = "audio";
  setControlState();
  duck(true);
  const ok = await speak(targetOf(b.unit), lang(), {
    rate: save.settings.speechRate,
  });
  duck(false);
  if (
    b !== battle ||
    q !== b.qToken ||
    playToken !== b.playToken ||
    b.phase !== "audio"
  )
    return;
  b.phase = "ready";
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
  if (!panel.open) startTimer();
}
function reveal() {
  const b = battle;
  if (!b || ["resolving", "ended", "voice"].includes(b.phase)) return;
  b.assisted = true;
  b.revealed = true;
  if (b.phase === "waiting") {
    b.phase = "ready";
    startTimer();
  }
  renderQuestion();
}
function chooseAnswer(index) {
  const b = battle;
  if (!b || b.phase !== "ready" || b.paused) return;
  const correct = b.choices[Number(index)]?.id === b.unit.id;
  const el = root.querySelector('[data-answer="' + index + '"]');
  el?.classList.add(correct ? "correct" : "wrong");
  resolveAnswer(correct);
}
function resolveAnswer(correct, reason = "answer") {
  const b = battle;
  if (!b || b.phase !== "ready" || b.paused) return;
  b.phase = "resolving";
  clearInterval(b.timer);
  stopAudio();
  cancelVoice();
  noteAnswer(save, save.world, b.unit.id, correct, b.assisted);
  commit();
  root
    .querySelectorAll("[data-answer],[data-fragment]")
    .forEach((el) => (el.disabled = true));
  setControlState();
  const interrupted = !correct && b.rank === 0 && b.interruptReady;
  if (interrupted) b.interruptReady = false;
  b.combo = correct ? b.combo + 1 : 0;
  if (correct && b.rank === 0 && b.combo % 3 === 0) b.interruptReady = true;
  let amount = 0;
  if (correct) {
    b.correct++;
    if(!b.assisted)b.independent++;
    if(!b.assisted)b.independentIds.add(b.unit.id);
    amount = damageFor({
      chapter: b.chapter,
      combo: b.combo,
      elapsed: b.elapsed,
      limit: b.stats.time,
      assisted: b.assisted || b.speechAnswer,
      stance: b.stance,
    });
    b.stage.swing("hero", b.combo >= 3);
  } else {
    b.mistakes.set(b.unit.id,b.unit);
    if (!interrupted) b.stage.swing("enemy");
  }
  later(() => {
    if (b !== battle) return;
    if (correct) {
      let absorbed = Math.min(b.shield, amount);
      if (b.rank === 1 && b.shield > 0) {
        b.armorStreak = (b.armorStreak || 0) + 1;
        absorbed = amount;
        b.shield = b.armorStreak >= 2 ? 0 : b.stats.shield;
      } else b.shield -= absorbed;
      b.enemyHp = Math.max(b.practice && b.turn<8?1:0, b.enemyHp - (amount - absorbed));
      b.stage.hitText(
        absorbed === amount
          ? tx("破甲", "เกราะแตก")
          : "−" + (amount - absorbed),
      );
      const meaning = b.unit.choice ? nameOf(b.unit.choice) : sourceOf(b.unit);
      $("#mic-status").textContent = tx("听懂了 · ", "เข้าใจแล้ว · ") + meaning;
    } else {
      if (b.rank === 1 && b.shield > 0) b.armorStreak = 0;
      const penalty = interrupted
        ? 0
        : Math.round(
            (reason === "timeout" ? b.stats.penalty + 3 : b.stats.penalty) *
              (b.stance === "guard" ? 0.6 : 1),
          );
      b.hp = Math.max(0, b.hp - penalty);
      b.stage.hitText(
        interrupted ? tx("挡住了", "ป้องกันได้") : "−" + penalty,
        false,
      );
      $("#mic-status").textContent = tx(
        (reason === "timeout" ? "时间到了。" : "这次听错了。") +
          " " +
          (b.unit.choice ? nameOf(b.unit.choice) : sourceOf(b.unit)),
        (reason === "timeout" ? "หมดเวลาแล้ว " : "ครั้งนี้ฟังผิด ") +
          " " +
          (b.unit.choice ? nameOf(b.unit.choice) : sourceOf(b.unit)),
      );
    }
    if (save.settings.motion) {
      $(".scene").classList.remove("impact");
      void $(".scene").offsetWidth;
      $(".scene").classList.add("impact");
    }
    updateHealth();
  }, 260);
  later(
    () => {
      if (b !== battle) return;
      if (b.enemyHp <= 0) return finishBattle(true);
      if (b.hp <= 0) return finishBattle(false);
      b.choices = null;
      b.fragments = null;
      newQuestion();
    },
    correct ? 1500 : 2800,
  );
}
function finishBattle(won) {
  const b = battle;
  if (!b) return;
  b.phase = "ended";
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
      '</p><div class="cluster">' +
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
function microphone() {
  const b = battle;
  if (!b || ["audio", "resolving", "ended"].includes(b.phase)) return;
  if (b.phase === "voice") {
    stopVoice();
    return;
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
  stopAudio();
  b.phase = "voice";
  b.voiceToken = (b.voiceToken || 0) + 1;
  const token = b.voiceToken;
  setControlState();
  $("#mic-status").textContent = tx("正在准备麦克风…", "กำลังเตรียมไมโครโฟน…");
  startVoice(lang(), {
    allowNetwork: save.settings.networkVoice,
    maxMs: Math.min(40000, 12000 + b.chapter * 4000),
    onState: (state) => {
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
      b.phase = "ready";
      b.remaining = Math.max(b.remaining, 5);
      $("#mic-status").textContent = tx(
        "没有得到可用的语音结果。请检查麦克风权限后重试；这次不扣血。",
        "ยังไม่ได้ผลเสียงที่ใช้ได้ ตรวจสิทธิ์ไมโครโฟนแล้วลองใหม่ ครั้งนี้ไม่เสียพลัง",
      );
      renderQuestion();
    },
    onResult: (text) => {
      if (b !== battle || token !== b.voiceToken) return;
      b.phase = "ready";
      const result = matchSpeech(text, targetOf(b.unit));
      $("#mic-status").textContent = tx(
        "识别文字：“" + text + "” · 不是口音评分",
        "ข้อความที่รู้จำ: “" + text + "” · ไม่ใช่คะแนนสำเนียง",
      );
      if (result.matched) {
        b.speechAnswer = true;
        resolveAnswer(true, "speech");
      } else {
        b.revealed = true;
        b.assisted = true;
        b.remaining = Math.max(b.remaining, 8);
        renderQuestion();
        toast(
          tx(
            "听到的文字不一致，不代表你一定读错了。可听示范后再试，这次不扣血。",
            "ข้อความไม่ตรง ไม่ได้แปลว่าออกเสียงผิดแน่นอน ฟังตัวอย่างแล้วลองใหม่ ครั้งนี้ไม่เสียพลัง",
          ),
        );
      }
    },
  });
}
async function playUnit(unit) {
  if (!unit) return;
  const context = epoch;
  duck(true);
  const ok = await speak(targetOf(unit), lang(), {
    rate: save.settings.speechRate,
  });
  duck(false);
  if (context === epoch && !ok)
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
    case "bestiary":
      bestiary();
      break;
    case "monster":
      monsterDetail(a);
      break;
    case "codex-pose":
      window.__codexStage?.swing("enemy");
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
    case "reveal":
      reveal();
      break;
    case "microphone":
      microphone();
      break;
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
    setControlState();
    return;
  }
  const audio = e.target.closest("[data-audio]");
  if (audio) playUnit(findUnit(audio.dataset.audio));
});
document.addEventListener("change", (e) => {
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
  stages.forEach((s) => (s.moving = 0));
  pauseBattle();
});
window.addEventListener("focus", () => resumeBattle());
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    pauseBattle();
    cancelVoice();
    if (battle?.phase === "voice") {
      battle.phase = "ready";
      setControlState();
    }
    music?.pause();
  } else {
    resumeBattle();
    initMusic();
  }
});
window.addEventListener("pagehide", () => {
  commit();
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
          question: battle.unit?.id,
        }
      : null,
  }),
};
if (save.intro) home();
else worlds();
