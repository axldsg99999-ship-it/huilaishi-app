(function () {
  "use strict";

  const GRADES = ["S5", "S4", "S3", "S2", "S1"];
  const GAME_COLORS = { match: "#b9ed55", audio: "#26c7b8", speed: "#ffb62f", tone: "#8d8fff", polish: "#ff5967" };
  const POLICY_GAME_MAP = Object.freeze({
    "meaning-match": "match",
    "listen-pick": "audio",
    "guided-response": "speed",
    "tone-compare": "tone",
    "boundary-roleplay": "tone",
    "risk-spot": "tone",
    "safe-rewrite": "polish"
  });
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
      gradePick: grade => `${grade} · 当前档位推荐`, gradeFocus: grade => `${grade} 重点`,
      best: "最佳", round: (n, total) => `第 ${n}/${total} 题`, pairs: (n, total) => `已配对 ${n}/${total}`, time: n => `${n} 秒`,
      tapPair: "从两边各选一张，配出同一个意思", matchTarget: "泰语", matchMeaning: "中文意思", listenPrompt: "先听声音，再锁定正确意思", listenHint: "点按钮可重复播放", playSentence: "播放当前句子", close: "关闭游戏",
      speedPrompt: "选出正确意思", tonePrompt: "结合人物关系与场景，这句话呈现哪个语域？", polishPrompt: "同一个意思，哪句在这个关系与场合最合适？", sourceRisk: "待改写 · S1粗口 / S2冲硬表达",
      correct: "判断正确", wrong: "再看一次", toneCorrect: grade => `正解是 ${grade}`, toneWrong: grade => `这句实际是 ${grade}`,
      polishCorrect: "选得合适", polishWrong: "这句不适合当前关系与场景", riskTag: "只识别，不建议模仿",
      contextSetting: "场景", contextRelationship: "关系", contextMissing: "缺少关系或场景，不能判定唯一合适档位。",
      recommendation: (grade, why) => `本场景推荐 ${grade}：${why}`,
      audioLoading: "正在查找本机学习声包…", audioUnavailable: level => `L${level} 学习声包尚未安装，无法保证清晰示范音。`, audioFailed: "音频加载失败，请检查声包后重试。",
      installPack: level => `安装 L${level} 声包`, useText: "先用文字模式", textPrompt: "看词选出正确意思", textFallbackReady: "已切换为看词选义，本题仍可完成。",
      characterAudioFailed: "S1 角色音频未能加载；没有退回标准音或设备机器声，请点播放重试。",
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
      gradePick: grade => `${grade} · แนะนำสำหรับระดับปัจจุบัน`, gradeFocus: grade => `เน้น ${grade}`,
      best: "ดีที่สุด", round: (n, total) => `ข้อ ${n}/${total}`, pairs: (n, total) => `จับคู่แล้ว ${n}/${total}`, time: n => `${n} วิ`,
      tapPair: "เลือกฝั่งละหนึ่งใบให้มีความหมายตรงกัน", matchTarget: "ภาษาจีน", matchMeaning: "ความหมายภาษาไทย", listenPrompt: "ฟังก่อน แล้วเลือกความหมายที่ถูก", listenHint: "แตะปุ่มเพื่อฟังซ้ำ", playSentence: "ฟังประโยคนี้", close: "ปิดเกม",
      speedPrompt: "เลือกความหมายที่ถูก", tonePrompt: "เมื่อดูความสัมพันธ์และสถานการณ์ ประโยคนี้แสดงระดับภาษาใด?", polishPrompt: "ความหมายเดิม ประโยคไหนเหมาะกับความสัมพันธ์และสถานการณ์นี้ที่สุด?", sourceRisk: "ก่อนปรับ · S1 คำหยาบ / S2 ถ้อยคำห้วนแข็ง",
      correct: "ถูกต้อง", wrong: "ลองดูอีกครั้ง", toneCorrect: grade => `คำตอบคือ ${grade}`, toneWrong: grade => `ประโยคนี้จริง ๆ คือ ${grade}`,
      polishCorrect: "เลือกได้เหมาะสม", polishWrong: "ประโยคนี้ไม่เหมาะกับความสัมพันธ์และสถานการณ์ปัจจุบัน", riskTag: "เรียนเพื่อรู้ทัน ไม่แนะนำให้เลียนแบบ",
      contextSetting: "สถานการณ์", contextRelationship: "ความสัมพันธ์", contextMissing: "หากไม่มีความสัมพันธ์หรือสถานการณ์ จะตัดสินระดับที่เหมาะสมเพียงระดับเดียวไม่ได้",
      recommendation: (grade, why) => `สถานการณ์นี้แนะนำ ${grade}: ${why}`,
      audioLoading: "กำลังค้นหาชุดเสียงเพื่อเรียนในเครื่อง…", audioUnavailable: level => `ยังไม่ได้ติดตั้งชุดเสียงเพื่อเรียน L${level} จึงเปิดเสียงตัวอย่างชัดเจนไม่ได้`, audioFailed: "โหลดเสียงไม่สำเร็จ โปรดตรวจชุดเสียงแล้วลองอีกครั้ง",
      installPack: level => `ติดตั้งชุดเสียง L${level}`, useText: "ใช้โหมดข้อความก่อน", textPrompt: "ดูคำแล้วเลือกความหมายที่ถูก", textFallbackReady: "เปลี่ยนเป็นโหมดดูคำแล้ว ข้อนี้ยังเล่นต่อได้",
      characterAudioFailed: "โหลดเสียงตัวละคร S1 ไม่สำเร็จ ระบบไม่ได้เปลี่ยนไปใช้เสียงมาตรฐานหรือเสียงเครื่อง โปรดแตะเล่นอีกครั้ง",
      grades: { S5: ["S5", "สุภาพมาก"], S4: ["S4", "สุภาพ"], S3: ["S3", "กันเอง"], S2: ["S2", "ถ้อยคำห้วนแข็ง"], S1: ["S1", "คำหยาบ"] },
      done: "จบเกมแล้ว", newBest: "ทำสถิติใหม่ในเครื่อง!", keep: "เล่นอีกครั้งแล้วจะตอบได้ไวขึ้น", statScore: "คะแนนรอบนี้", statRight: "ตอบถูก", statCombo: "คอมโบสูงสุด", replay: "เล่นอีกครั้ง",
      noData: "ชุดฝึกระดับภาษากำลังตรวจสอบ แล้วจะเปิดให้เล่น", wordFallback: "กำลังโหลดคลังคำศัพท์ ลองใหม่อีกครั้ง", answerLetters: ["A", "B", "C", "D", "E"]
    }
  };

  let game = null;
  let timerId = 0;
  const pendingIds = new Set();
  let voiceAudio = null;
  let wordAudioRequest = 0;

  const q = selector => document.querySelector(selector);
  const esc = value => String(value == null ? "" : value).replace(/&/gu, "&amp;").replace(/</gu, "&lt;").replace(/>/gu, "&gt;").replace(/"/gu, "&quot;").replace(/'/gu, "&#039;");
  const direction = () => document.body.classList.contains("dir-th-zh") ? "th-zh" : "zh-th";
  const locale = () => direction() === "zh-th" ? "zh" : "th";
  const copy = () => COPY[locale()];
  const vibrate = pattern => { try { navigator.vibrate && navigator.vibrate(pattern); } catch (_) {} };

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
    const allowedGames = [...new Set((policy.allowed || []).map(item => POLICY_GAME_MAP[item]).filter(Boolean))];
    let recommendedGame = "match";
    if (policy.requireSafeRewrite && allowedGames.includes("polish")) recommendedGame = "polish";
    else if (policy.allowSpeak === false && allowedGames.includes("tone")) recommendedGame = "tone";
    else if (allowedGames.includes("audio")) recommendedGame = "audio";
    else if (allowedGames.length) [recommendedGame] = allowedGames;
    return { grade, policy, allowedGames, recommendedGame };
  }

  function celebrate({ isBest, score, streak }) {
    if (typeof globalThis.confetti !== "function" || score < 250 || (!isBest && score < 900)) return;
    const reduced = globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduced) return;
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
      const value = JSON.parse(globalThis.HUILAISHI_STORAGE?.getItem(statsKey()));
      return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    } catch (_) { return {}; }
  }
  function writeStats(value) { try { globalThis.HUILAISHI_STORAGE?.setItem(statsKey(), JSON.stringify(value)); } catch (_) {} }

  function schedule(callback, delay) {
    const id = setTimeout(() => { pendingIds.delete(id); callback(); }, delay);
    pendingIds.add(id);
    return id;
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
    const hasRegister = registerPacks().length > 0;
    q("#arcade-grid").innerHTML = orderedGameEntries(gameLink, c).map(([id, item]) => {
      const locked = (id === "tone" || id === "polish") && !hasRegister;
      const recommended = id === gameLink.recommendedGame && !locked;
      const best = Number(stats[id]?.best || 0);
      const kicker = recommended ? `${item[0]} · ${c.gradePick(gameLink.grade)}` : item[0];
      return `<button class="arcade-card ${locked ? "locked" : ""} ${recommended ? "recommended" : ""}" data-game="${id}" data-current-grade="${gameLink.grade}" style="--game:${GAME_COLORS[id]}" ${locked ? "disabled" : ""}>
        <span class="arcade-game-icon">${esc(item[3])}</span>
        <span class="arcade-game-copy"><span>${esc(kicker)}</span><b>${esc(item[1])}</b><small>${esc(locked ? c.noData : item[2])}</small></span>
        <span class="arcade-card-score">${esc(c.best)}<b>${best.toLocaleString()}</b></span>
      </button>`;
    }).join("");
  }

  function clearTimers() {
    clearInterval(timerId); timerId = 0;
    wordAudioRequest += 1;
    pendingIds.forEach(id => clearTimeout(id)); pendingIds.clear();
    stopVoiceAudio();
    try { window.HUILAISHI_SPEECH?.stop?.(); } catch (_) {}
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
    const gameLink = activeGameLink();
    const packs = gradePracticePacks(gameLink.grade);
    if ((type === "tone" || type === "polish") && !packs.length) return;
    setSheetMeta(type);
    if (typeof openSheet === "function") openSheet("arcade-sheet");
    else { q("#modal-backdrop").classList.remove("hidden"); q("#arcade-sheet").classList.remove("hidden"); }
    const base = { type, grade: gameLink.grade, gamePolicy: gameLink.policy, score: 0, correct: 0, streak: 0, bestStreak: 0, answered: false, round: 0, startedAt: Date.now() };
    if (type === "match") startMatch(base);
    if (type === "audio") startWordQuiz({ ...base, total: 8, words: pickWords(12) });
    if (type === "speed") startSpeed({ ...base, words: pickWords(80), seconds: 45 });
    if (type === "tone") { const items = buildToneItems(10, gameLink.grade, packs); startTone({ ...base, total: items.length, items }); }
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
    if (!game || game.type !== "audio") return;
    game.audioFallback = true;
    wordAudioRequest += 1;
    renderWordQuestion();
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

  async function playWordVoice(word) {
    if (!word) return;
    const c = copy();
    const view = wordView(word);
    const options = wordVoiceOptions(word);
    const requestId = ++wordAudioRequest;
    setAudioStatus(c.audioLoading);
    try {
      const engine = window.HUILAISHI_SPEECH;
      if (!engine?.speak) throw new Error("speech-engine-unavailable");
      const bundled = window.HUILAISHI_CUTE_AUDIO?.lookup?.({ text: view.target, lang: view.voiceLang, track: "standard", key: options.audioKey });
      if (bundled) {
        if (requestId !== wordAudioRequest || game?.current !== word) return;
        setAudioStatus();
        engine.speak(view.target, { ...options, lang: view.voiceLang, rate: .78 });
        return;
      }
      const manager = window.HUILAISHI_VOICE_PACKS;
      if (!manager) throw new Error("voice-pack-manager-unavailable");
      const request = { text: view.target, lang: view.voiceLang, level: options.voicePackLevel, direction: options.direction, key: options.audioKey };
      const source = manager.resolveSync?.(request) || await manager.resolve?.(request);
      if (requestId !== wordAudioRequest || game?.current !== word) return;
      if (!source) {
        setAudioStatus(c.audioUnavailable(view.level), true, { installLevel: view.level, allowFallback: true });
        return;
      }
      setAudioStatus();
      engine.speak(view.target, { ...options, lang: view.voiceLang, rate: .78 });
    } catch (_) {
      if (requestId === wordAudioRequest && game?.current === word) setAudioStatus(c.audioFailed, true, { installLevel: view.level, allowFallback: true });
    }
  }

  function playRegisterVoice() {
    if (!game || !["tone", "polish"].includes(game.type)) return;
    const pack = game.type === "tone" ? game.current.pack : game.current.pack;
    const variant = game.type === "tone" ? game.current.variant : game.current.source;
    const view = packView(variant);
    if (variant.grade !== "S1") { setAudioStatus(); speak(view.target, view.voiceLang, { audioKey: `register:${pack.id}:${variant.grade}:${direction() === "zh-th" ? "th" : "zh"}`, track: "standard" }); return; }
    window.HUILAISHI_SPEECH?.stop?.();
    window.stopAlaiVoice?.();
    window.PronunciationCourse?.stopAudio?.();
    stopVoiceAudio();
    const language = direction() === "zh-th" ? "th" : "zh";
    const key = `s1-${pack.id}-${language}`;
    const source = window.SUGAR_AUDIO?.[key] || `assets/audio/sugarblade-${key}.mp3`;
    const audio = new Audio(source);
    voiceAudio = audio;
    audio.preload = "auto";
    audio.volume = .9;
    audio.setAttribute("playsinline", "");
    audio.addEventListener("ended", () => { if (voiceAudio === audio) voiceAudio = null; }, { once: true });
    audio.addEventListener("error", () => {
      if (voiceAudio === audio) voiceAudio = null;
      setAudioStatus(copy().characterAudioFailed, true);
    }, { once: true });
    setAudioStatus();
    audio.play()?.catch(() => {
      if (voiceAudio === audio) voiceAudio = null;
      setAudioStatus(copy().characterAudioFailed, true);
    });
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
    const fallback = Boolean(game.audioFallback);
    const prompt = fallback
      ? `<h3>${esc(c.textPrompt)}</h3><p lang="${view.lang}">${esc(view.target)}</p><span class="meaning-hint">${esc(view.reading)}</span>`
      : `<h3>${esc(c.listenPrompt)}</h3><button class="arcade-audio-orb" id="arcade-play-audio" aria-label="${esc(c.listenHint)}"><svg><use href="#i-volume"></use></svg></button><span class="meaning-hint">${esc(c.listenHint)}</span>`;
    q("#arcade-stage").innerHTML = `<div class="arcade-prompt"><span class="game-chip">L${activeLevel()} · ${fallback ? "TEXT" : "AUDIO"}</span>${prompt}<small id="arcade-audio-status" role="status" aria-live="polite"></small></div><div class="arcade-options">${game.options.map((option, index) => `<button class="arcade-option" data-answer="${index}"><span>${c.answerLetters[index]}</span><span class="arcade-option-copy"><b>${esc(option.view.meaning)}</b></span></button>`).join("")}</div>`;
    if (fallback) setAudioStatus(c.textFallbackReady, false, { installLevel: view.level });
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
    celebrate({ isBest, score, streak: finished.bestStreak });
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
      const audio = event.target.closest("#arcade-play-audio"); if (audio && game?.current) { playWordVoice(game.current); return; }
      const install = event.target.closest("[data-audio-install]"); if (install) { openVoicePackInstaller(Number(install.dataset.audioInstall)); return; }
      const fallback = event.target.closest("[data-audio-fallback]"); if (fallback) { enableAudioFallback(); return; }
      const registerAudio = event.target.closest("[data-register-audio]"); if (registerAudio) return playRegisterVoice();
      const answer = event.target.closest("[data-answer]"); if (answer) return chooseWordAnswer(Number(answer.dataset.answer));
      const grade = event.target.closest("[data-grade]"); if (grade) return chooseTone(grade.dataset.grade);
      const polish = event.target.closest("[data-polish]"); if (polish) return choosePolish(Number(polish.dataset.polish));
      const replay = event.target.closest("#arcade-replay"); if (replay && game) return openGame(game.type);
    });
    q("#arcade-next").addEventListener("click", nextRound);
    q("#arcade-close").addEventListener("click", closeGame);
    q("#modal-backdrop").addEventListener("click", closeGame);
    document.querySelector('[data-nav="battle"]')?.addEventListener("click", renderHall);
    window.addEventListener?.("storage", event => {
      if (event.key === `thai-vibe-mode-${direction()}`) renderHall();
    });
  }

  function init() { if (!q("#arcade-hall")) return; renderHall(); bindEvents(); }
  window.ArcadeUI = {
    render: renderHall,
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
      orderedGameIds: () => orderedGameEntries().map(([id]) => id)
    };
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
