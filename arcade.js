(function () {
  "use strict";

  const GRADES = ["S5", "S4", "S3", "S2", "S1"];
  const GAME_COLORS = { match: "#b9ed55", audio: "#26c7b8", speed: "#ffb62f", tone: "#8d8fff", polish: "#ff5967" };
  const COPY = {
    zh: {
      eyebrow: "5 GAMES · 离线可玩", title: "今晚练到脱口而出", subtitle: "词义、听力和语气分开练，战绩只保存在本机。", total: "最佳总分",
      safety: "S1粗口、S2冲硬表达仅用于听懂、避坑和剧情识别；不包含针对受保护群体的仇恨词。", score: "分", ready: "准备开始", next: "下一题", finish: "看战绩",
      games: {
        match: ["GAME 01 · 60 秒", "闪电配对", "连对 6 组双语词，越快分越高。", "配"],
        audio: ["GAME 02 · 8 题", "听音狙击", "只听声音锁定意思，训练真实反应。", "听"],
        speed: ["GAME 03 · 45 秒", "限时选义", "不停题，连击会把分数越推越高。", "快"],
        tone: ["GAME 04 · S5—S1", "素质雷达", "判断一句话到底体面、随意还是冒犯。", "测"],
        polish: ["GAME 05 · 改写", "体面改写", "把冲硬表达和粗口改成高素质表达。", "改"]
      },
      best: "最佳", round: (n, total) => `第 ${n}/${total} 题`, pairs: (n, total) => `已配对 ${n}/${total}`, time: n => `${n} 秒`,
      tapPair: "从两边各选一张，配出同一个意思", matchTarget: "泰语", matchMeaning: "中文意思", listenPrompt: "先听声音，再锁定正确意思", listenHint: "点按钮可重复播放", playSentence: "播放当前句子", close: "关闭游戏",
      speedPrompt: "选出正确意思", tonePrompt: "这句话属于哪个素质档位？", polishPrompt: "同一个意思，哪句最体面？", sourceRisk: "待改写 · S1粗口 / S2冲硬表达",
      correct: "判断正确", wrong: "再看一次", toneCorrect: grade => `正解是 ${grade}`, toneWrong: grade => `这句实际是 ${grade}`,
      polishCorrect: "改得漂亮", polishWrong: "这句还不够体面", riskTag: "只识别，不建议模仿",
      grades: { S5: ["S5", "体面"], S4: ["S4", "懂事"], S3: ["S3", "熟人"], S2: ["S2", "冲硬表达"], S1: ["S1", "粗口"] },
      done: "本局完成", newBest: "刷新本机最佳！", keep: "再练一局，反应会更快。", statScore: "本局得分", statRight: "答对", statCombo: "最高连击", replay: "再来一局",
      noData: "语气训练包正在校验，稍后开放。", wordFallback: "词库加载中，请稍后再试。", answerLetters: ["A", "B", "C", "D", "E"]
    },
    th: {
      eyebrow: "5 GAMES · เล่นออฟไลน์", title: "ฝึกคืนนี้ให้ตอบได้ทันที", subtitle: "แยกฝึกความหมาย การฟัง และระดับภาษา สถิติเก็บไว้ในเครื่องเท่านั้น", total: "คะแนนดีที่สุดรวม",
      safety: "คำหยาบระดับ S1 และถ้อยคำห้วนแข็งระดับ S2 มีไว้เพื่อฟังให้รู้ทัน หลีกเลี่ยงปัญหา และเข้าใจบริบทเท่านั้น โดยไม่ใช้ถ้อยคำเกลียดชังต่อกลุ่มบุคคล", score: "แต้ม", ready: "พร้อมเริ่ม", next: "ข้อต่อไป", finish: "ดูผลงาน",
      games: {
        match: ["GAME 01 · 60 วิ", "จับคู่สายฟ้า", "จับคู่คำสองภาษา 6 คู่ ยิ่งไวแต้มยิ่งสูง", "คู่"],
        audio: ["GAME 02 · 8 ข้อ", "ล็อกเป้าจากเสียง", "ฟังอย่างเดียวแล้วเลือกความหมาย ฝึกตอบสนองจริง", "ฟัง"],
        speed: ["GAME 03 · 45 วิ", "เลือกความหมายทันใจ", "คำถามต่อเนื่อง ยิ่งคอมโบสูงยิ่งได้แต้มมาก", "ไว"],
        tone: ["GAME 04 · S5—S1", "เรดาร์ระดับภาษา", "แยกว่าแต่ละประโยคสุภาพ กันเอง หรือหยาบคาย", "วัด"],
        polish: ["GAME 05 · ปรับคำ", "พูดให้ดูดี", "เปลี่ยนถ้อยคำห้วนแข็งและคำหยาบให้เป็นภาษาสุภาพ", "ปรับ"]
      },
      best: "ดีที่สุด", round: (n, total) => `ข้อ ${n}/${total}`, pairs: (n, total) => `จับคู่แล้ว ${n}/${total}`, time: n => `${n} วิ`,
      tapPair: "เลือกฝั่งละหนึ่งใบให้มีความหมายตรงกัน", matchTarget: "ภาษาจีน", matchMeaning: "ความหมายภาษาไทย", listenPrompt: "ฟังก่อน แล้วเลือกความหมายที่ถูก", listenHint: "แตะปุ่มเพื่อฟังซ้ำ", playSentence: "ฟังประโยคนี้", close: "ปิดเกม",
      speedPrompt: "เลือกความหมายที่ถูก", tonePrompt: "ประโยคนี้อยู่ระดับภาษาไหน?", polishPrompt: "ความหมายเดิม ประโยคไหนสุภาพที่สุด?", sourceRisk: "ก่อนปรับ · S1 คำหยาบ / S2 ถ้อยคำห้วนแข็ง",
      correct: "ถูกต้อง", wrong: "ลองดูอีกครั้ง", toneCorrect: grade => `คำตอบคือ ${grade}`, toneWrong: grade => `ประโยคนี้จริง ๆ คือ ${grade}`,
      polishCorrect: "ปรับได้ดีมาก", polishWrong: "ประโยคนี้ยังไม่สุภาพที่สุด", riskTag: "เรียนเพื่อรู้ทัน ไม่แนะนำให้เลียนแบบ",
      grades: { S5: ["S5", "สุภาพมาก"], S4: ["S4", "สุภาพ"], S3: ["S3", "กันเอง"], S2: ["S2", "ถ้อยคำห้วนแข็ง"], S1: ["S1", "คำหยาบ"] },
      done: "จบเกมแล้ว", newBest: "ทำสถิติใหม่ในเครื่อง!", keep: "เล่นอีกครั้งแล้วจะตอบได้ไวขึ้น", statScore: "คะแนนรอบนี้", statRight: "ตอบถูก", statCombo: "คอมโบสูงสุด", replay: "เล่นอีกครั้ง",
      noData: "ชุดฝึกระดับภาษากำลังตรวจสอบ แล้วจะเปิดให้เล่น", wordFallback: "กำลังโหลดคลังคำศัพท์ ลองใหม่อีกครั้ง", answerLetters: ["A", "B", "C", "D", "E"]
    }
  };

  let game = null;
  let timerId = 0;
  const pendingIds = new Set();
  let voiceAudio = null;

  const q = selector => document.querySelector(selector);
  const esc = value => String(value == null ? "" : value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  const direction = () => document.body.classList.contains("dir-th-zh") ? "th-zh" : "zh-th";
  const locale = () => direction() === "zh-th" ? "zh" : "th";
  const copy = () => COPY[locale()];
  const vibrate = pattern => { try { navigator.vibrate && navigator.vibrate(pattern); } catch (_) {} };

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
    return (window.HUILAISHI_REGISTER_PACK || []).filter(pack => pack && Array.isArray(pack.variants) && GRADES.every(grade => pack.variants.some(item => item.grade === grade)));
  }

  function activeLevel() {
    const saved = Number(localStorage.getItem(`huilaishi-vocab-level-${direction()}`));
    return Number.isInteger(saved) && saved >= 1 && saved <= 6 ? saved : 1;
  }

  function wordView(word) {
    const zhToTh = direction() === "zh-th";
    return {
      id: word.id,
      target: zhToTh ? word.th : word.zh,
      reading: zhToTh ? (word.thReading?.romanTone || word.ro) : word.py,
      phoneticHint: zhToTh ? (word.thReading?.zhHint || word.thReadingZhHint || "") : "",
      meaning: zhToTh ? word.zh : word.th,
      lang: zhToTh ? "th" : "zh-CN",
      voiceLang: zhToTh ? "th-TH" : "zh-CN"
    };
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

  function phoneticHintMarkup(value) {
    const hint = direction() === "zh-th" ? String(value || "").trim() : "";
    if (!hint) return "";
    return `<span class="thai-phonetic-hint"><small class="thai-phonetic-label">中文近音·仅助记</small><span class="thai-phonetic-value">${esc(hint)}</span></span>`;
  }

  function pickWords(count) {
    const level = activeLevel();
    let pool = corpus().filter(item => Number(item.level) === level);
    if (pool.length < count) pool = corpus();
    const seenTarget = new Set();
    const seenMeaning = new Set();
    return shuffle(pool).filter(item => {
      const view = wordView(item);
      if (seenTarget.has(view.target) || seenMeaning.has(view.meaning)) return false;
      seenTarget.add(view.target); seenMeaning.add(view.meaning); return true;
    }).slice(0, count);
  }

  function statsKey() { return `huilaishi-arcade-stats-${direction()}`; }
  function readStats() {
    try {
      const value = JSON.parse(localStorage.getItem(statsKey()));
      return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    } catch (_) { return {}; }
  }
  function writeStats(value) { try { localStorage.setItem(statsKey(), JSON.stringify(value)); } catch (_) {} }

  function schedule(callback, delay) {
    const id = setTimeout(() => { pendingIds.delete(id); callback(); }, delay);
    pendingIds.add(id);
    return id;
  }

  function renderHall() {
    const c = copy();
    q("#arcade-eyebrow").textContent = c.eyebrow;
    q("#arcade-title").textContent = c.title;
    q("#arcade-subtitle").textContent = c.subtitle;
    q("#arcade-total-label").textContent = c.total;
    q("#arcade-safety").querySelector("span").textContent = c.safety;
    const stats = readStats();
    const total = Object.values(stats).reduce((sum, item) => sum + Number(item.best || 0), 0);
    q("#arcade-total-score").textContent = total.toLocaleString();
    const hasRegister = registerPacks().length > 0;
    q("#arcade-grid").innerHTML = Object.entries(c.games).map(([id, item]) => {
      const locked = (id === "tone" || id === "polish") && !hasRegister;
      const best = Number(stats[id]?.best || 0);
      return `<button class="arcade-card ${locked ? "locked" : ""}" data-game="${id}" style="--game:${GAME_COLORS[id]}" ${locked ? "disabled" : ""} aria-label="${esc(item[1])}">
        <span class="arcade-game-icon">${esc(item[3])}</span>
        <span class="arcade-game-copy"><span>${esc(item[0])}</span><b>${esc(item[1])}</b><small>${esc(locked ? c.noData : item[2])}</small></span>
        <span class="arcade-card-score">${esc(c.best)}<b>${best.toLocaleString()}</b></span>
      </button>`;
    }).join("");
  }

  function clearTimers() {
    clearInterval(timerId); timerId = 0;
    pendingIds.forEach(id => clearTimeout(id)); pendingIds.clear();
    if (voiceAudio) { voiceAudio.pause(); voiceAudio.currentTime = 0; voiceAudio = null; }
    try { window.speechSynthesis?.cancel?.(); } catch (_) {}
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
    game = null;
    if (!copy().games[type]) return;
    const packs = registerPacks();
    if ((type === "tone" || type === "polish") && !packs.length) return;
    setSheetMeta(type);
    if (typeof openSheet === "function") openSheet("arcade-sheet");
    else { q("#modal-backdrop").classList.remove("hidden"); q("#arcade-sheet").classList.remove("hidden"); }
    const base = { type, score: 0, correct: 0, streak: 0, bestStreak: 0, answered: false, round: 0, startedAt: Date.now() };
    if (type === "match") startMatch(base);
    if (type === "audio") startWordQuiz({ ...base, total: 8, words: pickWords(12) });
    if (type === "speed") startSpeed({ ...base, words: pickWords(80), seconds: 45 });
    if (type === "tone") { const items = buildToneItems(10); startTone({ ...base, total: items.length, items }); }
    if (type === "polish") { const items = shuffle(packs).slice(0, 8); startPolish({ ...base, total: items.length, items }); }
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

  function speak(value, lang) {
    if (!value) return;
    try {
      if (typeof speakText === "function") { speakText(value, lang, .78); return; }
      if (!window.speechSynthesis) return;
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(value); utterance.lang = lang; utterance.rate = .78; speechSynthesis.speak(utterance);
    } catch (_) {}
  }

  function playRegisterVoice() {
    if (!game || !["tone", "polish"].includes(game.type)) return;
    const pack = game.type === "tone" ? game.current.pack : game.current.pack;
    const variant = game.type === "tone" ? game.current.variant : game.current.source;
    const view = packView(variant);
    if (variant.grade !== "S1") { speak(view.target, view.voiceLang); return; }
    if (voiceAudio) { voiceAudio.pause(); voiceAudio.currentTime = 0; }
    const language = direction() === "zh-th" ? "th" : "zh";
    const key = `s1-${pack.id}-${language}`;
    const source = window.SUGAR_AUDIO?.[key] || `assets/audio/sugarblade-${key}.mp3`;
    const audio = new Audio(source);
    voiceAudio = audio;
    audio.preload = "auto";
    audio.volume = .9;
    audio.setAttribute("playsinline", "");
    audio.addEventListener("ended", () => { if (voiceAudio === audio) voiceAudio = null; }, { once: true });
    audio.play()?.catch(() => { if (voiceAudio === audio) voiceAudio = null; });
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
    game = { ...base, words, tiles, pairs: 0, selected: null, seconds: 60 };
    renderMatch();
    timerId = setInterval(() => {
      if (!game || game.type !== "match") return;
      game.seconds -= 1;
      q("#arcade-timer").textContent = copy().time(game.seconds);
      setProgress((60 - game.seconds) / 60 * 100);
      if (game.seconds <= 0) finishGame();
    }, 1000);
  }

  function renderMatch() {
    const c = copy();
    q("#arcade-round").textContent = c.pairs(game.pairs, 6);
    q("#arcade-timer").textContent = c.time(game.seconds);
    const column = (side, label) => `<div class="match-column"><span>${esc(label)}</span>${game.tiles.map((tile, index) => ({ tile, index })).filter(item => item.tile.side === side).map(({ tile, index }) => `<button class="match-tile" data-match-index="${index}" data-side="${tile.side}" lang="${tile.lang}">${esc(tile.text)}</button>`).join("")}</div>`;
    q("#arcade-stage").innerHTML = `<div class="arcade-prompt"><span class="game-chip">L${activeLevel()} · MATCH</span><h3>${esc(c.tapPair)}</h3></div><div class="match-board">${column("target", c.matchTarget)}${column("meaning", c.matchMeaning)}</div>`;
  }

  function chooseMatch(button) {
    if (!game || game.type !== "match" || button.disabled) return;
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
      q("#arcade-round").textContent = copy().pairs(game.pairs, 6); vibrate(12);
      if (game.pairs === 6) { game.score += game.seconds * 20; setScore(game.score); schedule(finishGame, 350); }
    } else {
      first.button.classList.remove("selected"); first.button.classList.add("miss"); button.classList.add("miss"); game.selected = null; game.streak = 0; vibrate([18, 45, 18]);
      schedule(() => { first.button.classList.remove("miss"); button.classList.remove("miss"); }, 320);
    }
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
    q("#arcade-stage").innerHTML = `<div class="arcade-prompt"><span class="game-chip">L${activeLevel()} · AUDIO</span><h3>${esc(c.listenPrompt)}</h3><button class="arcade-audio-orb" id="arcade-play-audio" aria-label="${esc(c.listenHint)}"><svg><use href="#i-volume"></use></svg></button><span class="meaning-hint">${esc(c.listenHint)}</span></div><div class="arcade-options">${game.options.map((option, index) => `<button class="arcade-option" data-answer="${index}"><span>${c.answerLetters[index]}</span><span class="arcade-option-copy"><b>${esc(option.view.meaning)}</b></span></button>`).join("")}</div>`;
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

  function buildToneItems(count) {
    const packs = shuffle(registerPacks());
    if (!packs.length) return [];
    return Array.from({ length: count }, (_, index) => {
      const pack = packs[index % packs.length];
      const grade = GRADES[index % GRADES.length];
      return { pack, variant: pack.variants.find(item => item.grade === grade) };
    }).sort(() => Math.random() - .5);
  }

  function startTone(base) { if (!base.items.length) return showEmpty("register"); game = base; renderToneQuestion(); }
  function renderToneQuestion() {
    hideFeedback(); game.answered = false;
    const c = copy(); const item = game.items[game.round]; const view = packView(item.variant); game.current = item;
    q("#arcade-round").textContent = c.round(game.round + 1, game.total); q("#arcade-timer").textContent = `${game.streak}×`; setProgress(game.round / game.total * 100);
    q("#arcade-stage").innerHTML = `<div class="arcade-prompt"><span class="game-chip">TONE RADAR · ${esc(item.pack.cat || "SOCIAL")}</span><button class="arcade-register-audio" data-register-audio aria-label="${esc(c.playSentence)}"><svg><use href="#i-volume"></use></svg></button><h3 lang="${view.lang}">${esc(view.target)}</h3><p>${esc(view.reading)}</p>${phoneticHintMarkup(view.phoneticHint)}<span class="meaning-hint">${esc(view.meaning)}<br>${esc(c.tonePrompt)}</span><div class="tone-scale">${GRADES.map((grade, i) => `<i style="--tone:${["#37a66f","#26c7b8","#ffb62f","#ff7a59","#ff5967"][i]}"></i>`).join("")}</div></div><div class="arcade-options tone-grade-options">${GRADES.map((grade, index) => `<button class="arcade-option" data-grade="${grade}"><span>${grade}</span><small>${esc(c.grades[grade][1])}</small></button>`).join("")}</div>`;
  }

  function startPolish(base) { if (!base.items.length) return showEmpty("register"); game = base; renderPolishQuestion(); }
  function renderPolishQuestion() {
    hideFeedback(); game.answered = false;
    const c = copy(); const pack = game.items[game.round]; const sourceGrade = game.round % 2 ? "S2" : "S1"; const source = pack.variants.find(item => item.grade === sourceGrade); const sourceView = packView(source);
    const candidates = shuffle(["S5", "S4", "S3"].map(grade => ({ grade, variant: pack.variants.find(item => item.grade === grade) })));
    game.current = { pack, source, sourceGrade }; game.options = candidates;
    q("#arcade-round").textContent = c.round(game.round + 1, game.total); q("#arcade-timer").textContent = `${game.streak}×`; setProgress(game.round / game.total * 100);
    q("#arcade-stage").innerHTML = `<div class="arcade-prompt"><span class="game-chip">${esc(c.sourceRisk)}</span><button class="arcade-register-audio" data-register-audio aria-label="${esc(c.playSentence)}"><svg><use href="#i-volume"></use></svg></button><h3 lang="${sourceView.lang}">${esc(sourceView.target)}</h3><p>${esc(sourceView.reading)}</p>${phoneticHintMarkup(sourceView.phoneticHint)}<span class="meaning-hint">${esc(sourceView.meaning)}<br>${esc(c.polishPrompt)}</span></div><div class="arcade-options">${candidates.map((option, index) => { const view = packView(option.variant); return `<button class="arcade-option" data-polish="${index}"><span>${c.answerLetters[index]}</span><span class="arcade-option-copy"><b lang="${view.lang}">${esc(view.target)}</b><small>${esc(view.reading)}</small>${phoneticHintMarkup(view.phoneticHint)}</span></button>`; }).join("")}</div>`;
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
    setScore(game.score); const variantView = packView(game.current.variant);
    showFeedback(correct ? copy().toneCorrect(actual) : copy().toneWrong(actual), `${variantView.note || variantView.meaning}${["S1","S2"].includes(actual) ? ` · ${copy().riskTag}` : ""}`, ["S1","S2"].includes(actual));
    q("#arcade-next").textContent = game.round + 1 >= game.total ? copy().finish : copy().next; q("#arcade-next").classList.remove("hidden");
  }

  function choosePolish(index) {
    if (!game || game.type !== "polish" || game.answered) return;
    game.answered = true; const option = game.options[index]; const correctIndex = game.options.findIndex(item => item.grade === "S5"); const correct = option?.grade === "S5"; markButtons("#arcade-stage [data-polish]", index, correctIndex);
    if (correct) { game.correct += 1; game.streak += 1; game.bestStreak = Math.max(game.bestStreak, game.streak); game.score += 150 + game.streak * 15; vibrate(12); } else { game.streak = 0; vibrate([18,45,18]); }
    setScore(game.score); const best = packView(game.options[correctIndex].variant);
    showFeedback(correct ? copy().polishCorrect : copy().polishWrong, `${best.target} · ${best.reading} — ${best.note || best.meaning}`, false);
    q("#arcade-next").textContent = game.round + 1 >= game.total ? copy().finish : copy().next; q("#arcade-next").classList.remove("hidden");
  }

  function nextRound() {
    if (!game) return;
    game.round += 1;
    if (game.round >= game.total) return finishGame();
    if (game.type === "audio") renderWordQuestion();
    if (game.type === "tone") renderToneQuestion();
    if (game.type === "polish") renderPolishQuestion();
  }

  function finishGame() {
    if (!game) return; clearTimers();
    const c = copy(); const finished = game; const score = Math.max(0, Math.round(game.score)); const stats = readStats(); const previous = Number(stats[game.type]?.best || 0); const isBest = score > previous;
    stats[game.type] = { best: Math.max(previous, score), plays: Number(stats[game.type]?.plays || 0) + 1, updatedAt: Date.now() }; writeStats(stats);
    const attempts = game.type === "match" ? 6 : (game.type === "speed" ? Math.max(game.round, game.correct) : game.total);
    q("#arcade-round").textContent = c.done; q("#arcade-timer").textContent = "✓"; setProgress(100); setScore(score); hideFeedback();
    q("#arcade-stage").innerHTML = `<div class="arcade-result"><div class="arcade-result-mark">${score >= 900 ? "S" : score >= 600 ? "A" : score >= 350 ? "B" : "C"}</div><h3>${esc(c.done)}</h3><p>${esc(isBest ? c.newBest : c.keep)}</p><div class="arcade-result-stats"><span><b>${score.toLocaleString()}</b><small>${esc(c.statScore)}</small></span><span><b>${finished.correct}/${attempts}</b><small>${esc(c.statRight)}</small></span><span><b>${finished.bestStreak}×</b><small>${esc(c.statCombo)}</small></span></div><button id="arcade-replay">${esc(c.replay)}</button></div>`;
    renderHall(); vibrate([15,55,15]);
  }

  function showEmpty(kind = "words") {
    clearTimers(); game = null;
    const message = kind === "register" ? copy().noData : copy().wordFallback;
    q("#arcade-stage").innerHTML = `<div class="arcade-result"><div class="arcade-result-mark">…</div><h3>${esc(message)}</h3></div>`;
  }

  function closeGame() { clearTimers(); game = null; }

  function bindEvents() {
    q("#arcade-grid").addEventListener("click", event => { const button = event.target.closest("[data-game]"); if (button && !button.disabled) openGame(button.dataset.game); });
    q("#arcade-stage").addEventListener("click", event => {
      const match = event.target.closest("[data-match-index]"); if (match) return chooseMatch(match);
      const audio = event.target.closest("#arcade-play-audio"); if (audio && game?.current) { const view = wordView(game.current); speak(view.target, view.voiceLang); return; }
      const registerAudio = event.target.closest("[data-register-audio]"); if (registerAudio) return playRegisterVoice();
      const answer = event.target.closest("[data-answer]"); if (answer) return chooseWordAnswer(Number(answer.dataset.answer));
      const grade = event.target.closest("[data-grade]"); if (grade) return chooseTone(grade.dataset.grade);
      const polish = event.target.closest("[data-polish]"); if (polish) return choosePolish(Number(polish.dataset.polish));
      const replay = event.target.closest("#arcade-replay"); if (replay && game) return openGame(game.type);
    });
    q("#arcade-next").addEventListener("click", nextRound);
    q("#arcade-close").addEventListener("click", closeGame);
    q("#modal-backdrop").addEventListener("click", closeGame);
  }

  function init() { if (!q("#arcade-hall")) return; renderHall(); bindEvents(); }
  window.ArcadeUI = { render: renderHall, onDirectionChange() { closeGame(); renderHall(); } };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
