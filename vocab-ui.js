(function () {
  "use strict";

  const LEVEL_COLORS = ["#595cff", "#26c7b8", "#8aae32", "#ffb62f", "#ff7a59", "#ff5967"];
  const DAY = 86_400_000;
  const PAGE_SIZE = 30;
  const SRS_DAYS = [0, 1, 3, 7, 14, 30];
  const EXPECTED_TRAINING_CARDS = 3000;
  const EXPECTED_CARDS_PER_LEVEL = 500;
  const CATEGORY_ORDER = ["all", "people", "daily", "food", "travel", "shopping", "time", "work", "study", "social", "health", "emergency", "culture"];
  const POS_LABELS = {
    zh: { pron: "代词", n: "名词", v: "动词", adj: "形容词", adv: "副词", num: "数词", clf: "量词", prep: "介词", conj: "连词", particle: "助词", phrase: "固定表达" },
    th: { pron: "สรรพนาม", n: "นาม", v: "กริยา", adj: "คุณศัพท์", adv: "วิเศษณ์", num: "จำนวน", clf: "ลักษณนาม", prep: "บุพบท", conj: "สันธาน", particle: "คำช่วย", phrase: "วลี" }
  };
  const COPY = {
    zh: {
      eyebrow: "6 LEVELS · 双向核心词库", title: "把词汇练成<br><em>开口反应</em>", subtitle: "不孤立背单词：读音、例句、场合和复习节奏一起学。",
      currentDeck: "CURRENT DECK", total: "张训练卡", current: "当前词阶", mastered: "已掌握", due: "今日待复习", start: "开始 10 词闯关",
      tabVocab: "分级词汇", tabPhrases: "场景句卡", tabPronunciation: "发音课", mapEyebrow: "LEVEL MAP", mapTitle: "六级词汇地图", perLevel: "每级 500 张训练卡",
      search: "搜泰文、中文、拼音或罗马音", category: "场景", states: ["全部", "未学", "待复习", "收藏", "错词"], shuffle: "换一组", words: "张训练卡", more: "再看 30 张",
      emptyTitle: "这一组暂时没有词", emptyCopy: "换个等级、筛选条件或搜索词试试。", audio: "听发音", slowAudio: "慢听", star: "收藏", starred: "已收藏", known: "已掌握", markKnown: "标为掌握",
      quizKicker: "选出正确意思", quizNext: "下一词", quizFinish: "看成绩", correct: "稳！意思和场合都对。", wrong: "差一点，看看例句再记一次。",
      resultTitle: "本轮闯关完成", resultCopy: score => `答对 ${score}/10。答错的词已进入错词本，并安排今天再次复习。`, restart: "再来 10 词", nav: "词库",
      categories: { all: "全部场景", people: "人物", daily: "日常", food: "饮食", travel: "出行", shopping: "购物", time: "时间", work: "工作", study: "学习", social: "社交", health: "健康", emergency: "紧急", culture: "文化" },
      levels: [
        ["生存开口", "吃住行与求助"], ["日常基础", "生活高频反应"], ["旅行社交", "出门交朋友"],
        ["工作生活", "办事与协作"], ["观点表达", "解释与讨论"], ["文化进阶", "理解社会语境"]
      ]
    },
    th: {
      eyebrow: "6 LEVELS · คลังคำศัพท์สองภาษา", title: "จำคำศัพท์ให้<br><em>ตอบได้ทันที</em>", subtitle: "เรียนทั้งเสียง ตัวอย่าง สถานการณ์ และรอบทบทวน ไม่ท่องคำเดี่ยว ๆ",
      currentDeck: "CURRENT DECK", total: "การ์ดฝึก", current: "ระดับปัจจุบัน", mastered: "จำได้แล้ว", due: "ต้องทบทวนวันนี้", start: "ลุยด่าน 10 คำ",
      tabVocab: "คำศัพท์ตามระดับ", tabPhrases: "ประโยคสถานการณ์", tabPronunciation: "ฝึกเสียง", mapEyebrow: "LEVEL MAP", mapTitle: "แผนที่คำศัพท์ 6 ระดับ", perLevel: "ระดับละ 500 การ์ดฝึก",
      search: "ค้นหาจีน ไทย พินอิน หรือคำอ่าน", category: "สถานการณ์", states: ["ทั้งหมด", "ยังไม่เรียน", "ถึงเวลาทบทวน", "รายการโปรด", "คำที่พลาด"], shuffle: "สลับชุด", words: "การ์ดฝึก", more: "ดูเพิ่ม 30 การ์ด",
      emptyTitle: "ยังไม่มีคำในชุดนี้", emptyCopy: "ลองเปลี่ยนระดับ ตัวกรอง หรือคำค้นหา", audio: "ฟังเสียง", slowAudio: "ฟังช้า", star: "บันทึก", starred: "บันทึกแล้ว", known: "จำได้แล้ว", markKnown: "ทำเครื่องหมายว่าจำได้",
      quizKicker: "เลือกความหมายที่ถูก", quizNext: "คำถัดไป", quizFinish: "ดูคะแนน", correct: "เป๊ะ! ทั้งความหมายและกาลเทศะ", wrong: "เกือบแล้ว ดูตัวอย่างแล้วจำอีกครั้งนะ",
      resultTitle: "จบด่านคำศัพท์แล้ว", resultCopy: score => `ตอบถูก ${score}/10 คำที่พลาดถูกเก็บไว้และจะกลับมาทบทวนวันนี้`, restart: "ลุยอีก 10 คำ", nav: "คำศัพท์",
      categories: { all: "ทุกสถานการณ์", people: "ผู้คน", daily: "ชีวิตประจำวัน", food: "อาหาร", travel: "เดินทาง", shopping: "ซื้อของ", time: "เวลา", work: "งาน", study: "เรียน", social: "สังคม", health: "สุขภาพ", emergency: "ฉุกเฉิน", culture: "วัฒนธรรม" },
      levels: [
        ["เอาตัวรอด", "กิน อยู่ เดินทาง ขอความช่วยเหลือ"], ["ชีวิตประจำวัน", "คำตอบที่ใช้บ่อยทุกวัน"], ["เที่ยวและเข้าสังคม", "เดินทางและรู้จักเพื่อน"],
        ["งานและชีวิต", "จัดการธุระและร่วมงาน"], ["แสดงความคิดเห็น", "อธิบายและแลกเปลี่ยน"], ["ภาษาและวัฒนธรรม", "เข้าใจบริบททางสังคม"]
      ]
    }
  };

  let activeLevel = 1;
  let activeCategory = "all";
  let activeState = "all";
  let visibleCount = PAGE_SIZE;
  let shuffleSalt = 0;
  let expandedId = null;
  let quiz = null;
  let quizStageTemplate = "";
  let initialized = false;
  let vocabCorpusCache = null;
  let vocabSourceSignature = "";

  const q = selector => document.querySelector(selector);
  const qa = selector => [...document.querySelectorAll(selector)];
  const esc = value => String(value ?? "").replace(/&/gu, "&amp;").replace(/</gu, "&lt;").replace(/>/gu, "&gt;").replace(/"/gu, "&quot;").replace(/'/gu, "&#039;");
  const storage = () => globalThis.HUILAISHI_STORAGE;
  const direction = () => document.body.classList.contains("dir-th-zh") ? "th-zh" : "zh-th";
  const locale = () => direction() === "zh-th" ? "zh" : "th";
  const copy = () => COPY[locale()];
  function allWords() {
    const source = [
      ...(window.HUILAISHI_VOCAB_L12 || []),
      ...(window.HUILAISHI_VOCAB_L34 || []),
      ...(window.HUILAISHI_VOCAB_L56 || []),
      ...(window.HUILAISHI_VOCAB_EXPANSION_L13 || []),
      ...(window.HUILAISHI_VOCAB_EXPANSION_L46 || [])
    ].filter(word => word && word.id && word.level >= 1 && word.level <= 6);
    const signature = `${source.length}:${source[0]?.id || ""}:${source[source.length - 1]?.id || ""}`;
    if (vocabCorpusCache && vocabSourceSignature === signature) return vocabCorpusCache;
    const firstByPair = new Map();
    vocabCorpusCache = source.map(word => {
      const pairKey = lexicalKey(word.zh, word.th);
      const first = firstByPair.get(pairKey);
      if (!first) {
        firstByPair.set(pairKey, word);
        return word;
      }
      return { ...word, reviewVariant: true, reviewOfId: first.id };
    });
    vocabSourceSignature = signature;
    return vocabCorpusCache;
  }

  function normalizeLexeme(value) {
    return String(value || "").normalize("NFC").trim().replace(/\s+/gu, " ");
  }

  function lexicalKey(zh, th) {
    return `${normalizeLexeme(zh)}\u0000${normalizeLexeme(th)}`;
  }

  function corpusMetrics(words = allWords()) {
    const ids = new Set();
    const pairs = new Set();
    const levelCounts = Object.fromEntries(Array.from({ length: 6 }, (_, index) => [index + 1, 0]));
    let duplicateIds = 0;
    for (const word of words) {
      if (ids.has(word.id)) duplicateIds += 1;
      ids.add(word.id);
      pairs.add(lexicalKey(word.zh, word.th));
      if (levelCounts[word.level] != null) levelCounts[word.level] += 1;
    }
    return {
      trainingCards: words.length,
      distinctPairs: pairs.size,
      reviewCards: words.length - pairs.size,
      duplicateIds,
      levelCounts,
      complete: words.length === EXPECTED_TRAINING_CARDS
        && duplicateIds === 0
        && Object.values(levelCounts).every(count => count === EXPECTED_CARDS_PER_LEVEL)
    };
  }

  function readJson(key, fallback) {
    try { return JSON.parse(storage()?.getItem(key)) ?? fallback; } catch { return fallback; }
  }
  function writeJson(key, value) { storage()?.setItem(key, JSON.stringify(value)); }
  function key(name) { return `huilaishi-vocab-${name}-${direction()}`; }
  function getSet(name) { return new Set(readJson(key(name), [])); }
  function setSet(name, value) { writeJson(key(name), [...value]); }
  function getSrs() { return readJson(key("srs"), {}); }
  function setSrs(value) { writeJson(key("srs"), value); }
  function levelMeta(level) {
    const [name, description] = copy().levels[level - 1];
    return { level, name, description, color: LEVEL_COLORS[level - 1] };
  }
  function view(word) {
    const zhToTh = direction() === "zh-th";
    const exampleAvailable = word.exampleDisplayStatus !== "blocked-editorial-review";
    return {
      target: zhToTh ? word.th : word.zh,
      reading: zhToTh ? (word.thReading?.romanTone || word.ro) : word.py,
      phonetic: zhToTh ? (word.thReading || null) : null,
      meaning: zhToTh ? word.zh : word.th,
      example: zhToTh ? word.exTh : word.exZh,
      exampleReading: zhToTh ? (word.exThReading?.romanTone || word.exRo) : word.exPy,
      examplePhonetic: zhToTh ? (word.exThReading || null) : null,
      exampleMeaning: zhToTh ? word.exZh : word.exTh,
      exampleAvailable,
      note: zhToTh ? word.noteZh : word.noteTh,
      lang: zhToTh ? "th" : "zh-CN",
      voiceLang: zhToTh ? "th-TH" : "zh-CN"
    };
  }
  function voicePackOptions(word, kind = "word") {
    const family = direction() === "zh-th" ? "th" : "zh";
    return { voicePackLevel: word.level, direction: direction(), audioKey: `vocab:${word.id}:${kind}:${family}` };
  }
  function voicePackAttrs(word, kind = "word") {
    const options = voicePackOptions(word, kind);
    return `data-voice-pack-level="${options.voicePackLevel}" data-voice-pack-direction="${options.direction}" data-voice-pack-key="${esc(options.audioKey)}"`;
  }
  function phoneticHintMarkup(reading) {
    const hint = direction() === "zh-th" ? String(reading?.zhHint || "").trim() : "";
    if (!hint) return "";
    const quality = reading.quality === "curated-core" ? "人工助记" : (reading.quality === "dictionary-assisted" ? "字典辅助近音" : "算法近似");
    const tone = reading.toneCoverage === "full" ? "声调完整" : (reading.toneCoverage === "partial" ? "部分声调" : "未标声调");
    const review = reading.nativeReviewed === true ? "母语已审" : "母语待审";
    const details = `${quality} · ${tone} · ${review}`;
    return `<span class="thai-phonetic-hint" title="${esc(reading.disclaimerZh || "中文近音仅用于助记，不替代泰语标准发音。")}"><small class="thai-phonetic-label">中文近音·仅助记</small><span class="thai-phonetic-value">${esc(hint)}</span><small class="thai-phonetic-label">${esc(details)}</small></span>`;
  }

  function exampleMarkup(word, item) {
    if (!item.exampleAvailable) {
      const title = locale() === "zh" ? "例句暂不展示" : "งดแสดงตัวอย่างชั่วคราว";
      const reason = locale() === "zh"
        ? "未通过最低完整性门禁，等待编辑修订与母语教师终审。"
        : "ตัวอย่างยังไม่ผ่านเกณฑ์ความสมบูรณ์ขั้นต่ำ รอการแก้ไขและตรวจโดยเจ้าของภาษา";
      return `<div class="vocab-example"><strong>${esc(title)}</strong><p>${esc(reason)}</p></div>`;
    }
    const review = locale() === "zh" ? "例句草稿 · 母语待审" : "ตัวอย่างฉบับร่าง · รอเจ้าของภาษาตรวจ";
    return `<div class="vocab-example" role="button" tabindex="0" data-tap-speak data-speak-text="${esc(item.example)}" data-speak-lang="${item.voiceLang}" ${voicePackAttrs(word, "example")}><small class="thai-phonetic-label">${esc(review)}</small><strong lang="${item.lang}">${esc(item.example)}</strong><span>${esc(item.exampleReading)}</span>${phoneticHintMarkup(item.examplePhonetic)}<p>${esc(item.exampleMeaning)}</p></div>`;
  }
  function hash(value) {
    let result = 2166136261;
    for (let i = 0; i < value.length; i += 1) result = Math.imul(result ^ value.charCodeAt(i), 16777619);
    return result >>> 0;
  }
  function shuffled(list, salt = shuffleSalt) { return [...list].sort((a, b) => hash(`${a.id}-${salt}`) - hash(`${b.id}-${salt}`)); }
  function isDue(item, now = Date.now()) { return item && item.seen > 0 && Number(item.due || 0) <= now; }

  function loadRouteState() {
    const saved = Number(storage()?.getItem(key("level")));
    activeLevel = Number.isInteger(saved) && saved >= 1 && saved <= 6 ? saved : 1;
    activeCategory = "all";
    activeState = "all";
    visibleCount = PAGE_SIZE;
    expandedId = null;
    const input = q("#vocab-search");
    if (input) input.value = "";
  }

  function filteredWords() {
    const known = getSet("known");
    const stars = getSet("stars");
    const wrong = getSet("wrong");
    const srs = getSrs();
    const needle = q("#vocab-search")?.value.trim().toLocaleLowerCase() || "";
    const result = allWords().filter(word => {
      if (word.level !== activeLevel) return false;
      if (activeCategory !== "all" && word.cat !== activeCategory) return false;
      if (needle && ![word.zh, word.py, word.th, word.ro, word.exZh, word.exTh].some(value => String(value || "").toLocaleLowerCase().includes(needle))) return false;
      if (activeState === "new" && (known.has(word.id) || srs[word.id]?.seen)) return false;
      if (activeState === "due" && !isDue(srs[word.id])) return false;
      if (activeState === "star" && !stars.has(word.id)) return false;
      if (activeState === "wrong" && !wrong.has(word.id)) return false;
      return true;
    });
    return shuffled(result);
  }

  function renderShellCopy() {
    const c = copy();
    q("#vocab-eyebrow").textContent = c.eyebrow;
    q("#vocab-title").innerHTML = c.title;
    q("#vocab-subtitle").textContent = c.subtitle;
    q("#vocab-tab").textContent = c.tabVocab;
    q("#phrases-tab").textContent = c.tabPhrases;
    q("#pronunciation-tab").textContent = c.tabPronunciation;
    q("#vocab-levels-eyebrow").textContent = c.mapEyebrow;
    q("#vocab-levels-title").textContent = c.mapTitle;
    q("#vocab-route-count").textContent = c.perLevel;
    q("#vocab-search").placeholder = c.search;
    q("#vocab-search").setAttribute("aria-label", c.search);
    q("#vocab-search-clear").setAttribute("aria-label", locale() === "zh" ? "清空搜索" : "ล้างคำค้นหา");
    q(".library-mode-tabs").setAttribute("aria-label", locale() === "zh" ? "词库模式" : "โหมดคลังคำศัพท์");
    q("#vocab-quiz-audio").setAttribute("aria-label", locale() === "zh" ? "播放词汇" : "ฟังคำศัพท์");
    q("#vocab-category-label").textContent = c.category;
    ["all", "new", "due", "star", "wrong"].forEach((state, index) => { q(`#vocab-state-${state}`).textContent = c.states[index]; });
    q("#vocab-shuffle-label").textContent = c.shuffle;
    q("#vocab-load-more").textContent = c.more;
    q("#start-vocab-label").textContent = c.start;
    q("#vocab-known-unit").textContent = c.mastered;
    q("#vocab-due-label").textContent = c.due;
    q("#nav-library").textContent = c.nav;
    q("#vocab-category").innerHTML = CATEGORY_ORDER.map(category => `<option value="${category}">${esc(c.categories[category])}</option>`).join("");
    q("#vocab-category").value = activeCategory;
  }

  function renderSummary() {
    const c = copy();
    const meta = levelMeta(activeLevel);
    const words = allWords();
    const metrics = corpusMetrics(words);
    const levelWords = words.filter(word => word.level === activeLevel);
    const known = getSet("known");
    const srs = getSrs();
    const mastered = levelWords.filter(word => known.has(word.id)).length;
    const due = levelWords.filter(word => isDue(srs[word.id])).length;
    const progress = levelWords.length ? mastered / levelWords.length : 0;
    q("#vocab-level-kicker").textContent = `${c.currentDeck} · L${activeLevel}`;
    q("#vocab-total-badge").textContent = locale() === "zh"
      ? `${metrics.trainingCards.toLocaleString()} ${c.total} · ${metrics.distinctPairs.toLocaleString()} 独立词对`
      : `${metrics.trainingCards.toLocaleString()} ${c.total} · ${metrics.distinctPairs.toLocaleString()} คู่คำไม่ซ้ำ`;
    q("#vocab-level-label").textContent = c.current;
    q("#vocab-level-name").textContent = meta.name;
    q("#vocab-level-copy").textContent = meta.description;
    q("#vocab-known-count").textContent = mastered;
    q("#vocab-due-count").textContent = due;
    q("#vocab-ring").style.setProperty("--vocab-progress", `${Math.round(progress * 360)}deg`);
    q("#vocab-progress-fill").style.width = `${Math.round(progress * 100)}%`;
    const allMastered = words.filter(word => known.has(word.id)).length;
    const profileValue = q(".achievement-row > div:nth-child(3) > span");
    if (profileValue) profileValue.textContent = allMastered;
    const profileLabel = q("#achievement-2");
    if (profileLabel) profileLabel.textContent = locale() === "zh" ? "已掌握训练卡" : "การ์ดฝึกที่จำได้";
    const offlineCopy = q("#offline-capability-copy");
    if (offlineCopy) offlineCopy.textContent = locale() === "zh"
      ? `${metrics.trainingCards.toLocaleString()} 张训练卡（${metrics.distinctPairs.toLocaleString()} 组独立中泰词对）、场景句卡与本地对话无需登录`
      : `${metrics.trainingCards.toLocaleString()} การ์ดฝึก (${metrics.distinctPairs.toLocaleString()} คู่คำจีน–ไทยไม่ซ้ำ) ประโยคสถานการณ์ และบทสนทนาใช้ได้โดยไม่ต้องล็อกอิน`;
    renderHomeDeck(words, known, srs);
  }

  function renderHomeDeck(words, known, srs) {
    const home = q("#home-vocab-card");
    if (!home) return;
    const zh = locale() === "zh";
    q("#home-vocab-eyebrow").textContent = zh ? "TODAY'S WORDS · 今日词包" : "TODAY'S WORDS · คำศัพท์วันนี้";
    q("#home-vocab-title").textContent = zh ? "12 词开口热身" : "วอร์มปากด้วย 12 คำ";
    q("#home-vocab-due-label").textContent = zh ? "待复习" : "ทบทวน";
    q("#home-vocab-action").textContent = zh ? "打开六级词库" : "เปิดคลัง 6 ระดับ";
    const routeWords = words.filter(word => word.level === activeLevel);
    const dueWords = routeWords.filter(word => isDue(srs[word.id]));
    const newWords = routeWords.filter(word => !srs[word.id]?.seen && !known.has(word.id));
    const deck = [...dueWords, ...newWords, ...routeWords].filter((word, index, list) => list.findIndex(item => item.id === word.id) === index).slice(0, 12);
    q("#home-vocab-due").textContent = dueWords.length;
    q("#home-vocab-preview").innerHTML = deck.slice(0, 3).map(word => { const item = view(word); return `<button type="button" data-home-vocab="${word.id}" data-speak-text="${esc(item.target)}" data-speak-lang="${item.voiceLang}" ${voicePackAttrs(word)}><b lang="${item.lang}">${esc(item.target)}</b><small>${esc(item.meaning)}</small></button>`; }).join("");
    const learned = routeWords.filter(word => srs[word.id]?.seen || known.has(word.id)).length;
    q("#home-vocab-progress").style.width = `${routeWords.length ? Math.round(learned / routeWords.length * 100) : 0}%`;
  }

  function renderLevels() {
    const known = getSet("known");
    q("#vocab-level-grid").innerHTML = Array.from({ length: 6 }, (_, index) => {
      const level = index + 1;
      const meta = levelMeta(level);
      const words = allWords().filter(word => word.level === level);
      const mastered = words.filter(word => known.has(word.id)).length;
      const progress = words.length ? Math.round(mastered / words.length * 100) : 0;
      return `<button class="vocab-level-card ${level === activeLevel ? "active" : ""}" data-vocab-level="${level}" data-level="${level}" style="--level-color:${meta.color};--level-progress:${progress}%"><span>L${level}</span><b>${esc(meta.name)}</b><small>${words.length || 0} ${esc(copy().words)}</small><i></i></button>`;
    }).join("");
  }

  function renderCards() {
    const c = copy();
    const meta = levelMeta(activeLevel);
    const words = filteredWords();
    const known = getSet("known");
    const stars = getSet("stars");
    const wrong = getSet("wrong");
    const srs = getSrs();
    q("#vocab-list-title").textContent = `L${activeLevel} · ${meta.name}`;
    q("#vocab-result-count").textContent = `${words.length} ${c.words}`;
    q("#vocab-search-clear").classList.toggle("hidden", !(q("#vocab-search").value || "").length);
    if (!words.length) {
      q("#vocab-list").innerHTML = `<div class="vocab-empty"><b>${esc(c.emptyTitle)}</b><p>${esc(c.emptyCopy)}</p></div>`;
      q("#vocab-load-more").classList.add("hidden");
      return;
    }
    q("#vocab-list").innerHTML = words.slice(0, visibleCount).map((word, index) => {
      const item = view(word);
      const mastered = known.has(word.id);
      const isWrong = wrong.has(word.id);
      const starred = stars.has(word.id);
      const due = isDue(srs[word.id]);
      const reviewNote = word.reviewVariant ? (locale() === "zh" ? "复现训练卡：这一中泰词对曾出现过，本卡用于间隔复习，不计为新的独立词对。" : "การ์ดทบทวน: คู่คำจีน–ไทยนี้เคยปรากฏแล้ว การ์ดนี้ใช้ทบทวนและไม่นับเป็นคู่คำใหม่") : "";
      const noteText = [item.note, reviewNote].filter(Boolean).join(" · ");
      const note = noteText ? `<p class="vocab-note">${esc(noteText)}</p>` : "";
      return `<article class="vocab-card ${expandedId === word.id ? "expanded" : ""} ${mastered ? "mastered" : ""} ${isWrong ? "wrong" : ""}" data-vocab-id="${word.id}" style="--level-color:${meta.color}">
        <button class="vocab-card-main" data-vocab-expand="${word.id}" data-speak-text="${esc(item.target)}" data-speak-lang="${item.voiceLang}" ${voicePackAttrs(word)} aria-expanded="${expandedId === word.id}"><span class="vocab-index">${String(index + 1).padStart(2, "0")}</span><span class="vocab-word-copy"><h3 lang="${item.lang}">${esc(item.target)}</h3><span>${esc(item.reading)}</span>${phoneticHintMarkup(item.phonetic)}<p>${esc(item.meaning)}</p></span><span class="vocab-card-badges"><i>${esc(POS_LABELS[locale()][word.pos] || word.pos)}</i>${word.reviewVariant ? `<i>${locale() === "zh" ? "复现" : "ทบทวน"}</i>` : ""}${due ? "<b>↻</b>" : mastered ? "<b>✓</b>" : ""}</span></button>
        <div class="vocab-card-extra">${exampleMarkup(word, item)}${note}<div class="vocab-actions">
          <button data-vocab-audio="${word.id}"><svg><use href="#i-volume"></use></svg>${esc(c.audio)}</button>
          <button data-vocab-slow-audio="${word.id}"><svg><use href="#i-volume"></use></svg>${esc(c.slowAudio)}</button>
          <button class="${starred ? "active" : ""}" data-vocab-star="${word.id}"><svg><use href="#i-spark"></use></svg>${esc(starred ? c.starred : c.star)}</button>
          <button class="known ${mastered ? "active" : ""}" data-vocab-known="${word.id}"><svg><use href="#i-shield"></use></svg>${esc(mastered ? c.known : c.markKnown)}</button>
        </div></div>
      </article>`;
    }).join("");
    q("#vocab-load-more").classList.toggle("hidden", words.length <= visibleCount);
  }

  function renderAll() {
    if (!q("#vocab-pane")) return;
    renderShellCopy();
    const integrity = corpusMetrics();
    if (!integrity.complete) {
      renderIncompleteCorpus(integrity);
      return;
    }
    q("#start-vocab-quiz").disabled = false;
    renderSummary();
    renderLevels();
    renderCards();
  }

  function renderIncompleteCorpus(metrics) {
    const zh = locale() === "zh";
    q("#vocab-total-badge").textContent = zh ? "资源未完整加载" : "โหลดทรัพยากรไม่ครบ";
    q("#vocab-level-name").textContent = zh ? "词库暂不可用" : "คลังคำศัพท์ยังใช้ไม่ได้";
    q("#vocab-level-copy").textContent = zh
      ? `仅收到 ${metrics.trainingCards}/3000 张训练卡。为避免把残缺词库冒充完整内容，学习与测验已暂停。`
      : `ได้รับเพียง ${metrics.trainingCards}/3000 การ์ดฝึก ระบบจึงหยุดการเรียนและแบบทดสอบเพื่อไม่แสดงคลังที่ไม่ครบเป็นคลังสมบูรณ์`;
    q("#vocab-known-count").textContent = "—";
    q("#vocab-due-count").textContent = "—";
    q("#vocab-ring").style.setProperty("--vocab-progress", "0deg");
    q("#vocab-progress-fill").style.width = "0%";
    q("#vocab-level-grid").innerHTML = "";
    q("#vocab-list-title").textContent = zh ? "资源完整性检查未通过" : "การตรวจความครบถ้วนไม่ผ่าน";
    q("#vocab-result-count").textContent = `${metrics.trainingCards}/${EXPECTED_TRAINING_CARDS}`;
    q("#vocab-list").innerHTML = `<div class="vocab-empty"><b>${zh ? "请重新加载完整资源" : "โปรดโหลดทรัพยากรใหม่"}</b><p>${zh ? "请检查网络后重新加载；离线时请先恢复到已完整安装的版本。" : "ตรวจสอบเครือข่ายแล้วโหลดใหม่ หากออฟไลน์ให้กลับไปใช้เวอร์ชันที่ติดตั้งครบแล้ว"}</p><button type="button" class="primary-btn" data-vocab-reload>${zh ? "重新加载" : "โหลดใหม่"}</button></div>`;
    q("#vocab-load-more").classList.add("hidden");
    q("#start-vocab-quiz").disabled = true;
  }

  function toggleSet(name, id) {
    const set = getSet(name);
    if (set.has(id)) set.delete(id); else set.add(id);
    setSet(name, set);
    return set.has(id);
  }

  function markKnown(id) {
    const active = toggleSet("known", id);
    const srs = getSrs();
    if (active) srs[id] = { box: Math.max(2, Number(srs[id]?.box || 0)), seen: Number(srs[id]?.seen || 0) + 1, due: Date.now() + 3 * DAY };
    setSrs(srs);
    renderAll();
  }

  function updateSrs(id, correct) {
    const srs = getSrs();
    const current = srs[id] || { box: 0, seen: 0, due: 0 };
    const box = correct ? Math.min(5, current.box + 1) : 1;
    srs[id] = { box, seen: current.seen + 1, due: correct ? Date.now() + SRS_DAYS[box] * DAY : Date.now() };
    setSrs(srs);
    const wrong = getSet("wrong");
    if (correct && box >= 2) wrong.delete(id); else if (!correct) wrong.add(id);
    setSet("wrong", wrong);
    if (correct && box >= 2) { const known = getSet("known"); known.add(id); setSet("known", known); }
  }

  function pickQuizWords() {
    const pool = allWords().filter(word => word.level === activeLevel);
    const srs = getSrs();
    const wrong = getSet("wrong");
    const known = getSet("known");
    const groups = [
      pool.filter(word => isDue(srs[word.id])),
      pool.filter(word => wrong.has(word.id)),
      pool.filter(word => !srs[word.id]?.seen && !known.has(word.id)),
      pool
    ];
    const result = [];
    const seen = new Set();
    groups.forEach((group, groupIndex) => shuffled(group, Date.now() + groupIndex).forEach(word => { if (result.length < 10 && !seen.has(word.id)) { seen.add(word.id); result.push(word); } }));
    return result;
  }

  function restoreQuizStage() {
    q("#vocab-quiz-stage").innerHTML = quizStageTemplate;
    q("#vocab-quiz-next").classList.add("hidden");
  }

  function startQuiz() {
    if (!corpusMetrics().complete) {
      if (typeof showToast === "function") showToast(locale() === "zh" ? "词库资源未完整加载，请先重新加载" : "โหลดคลังคำศัพท์ไม่ครบ โปรดโหลดใหม่ก่อน");
      return;
    }
    const words = pickQuizWords();
    if (words.length < 4) {
      if (typeof showToast === "function") showToast(locale() === "zh" ? "这个等级的词还在装入，请稍后再试" : "กำลังโหลดคำศัพท์ระดับนี้ ลองอีกครั้งสักครู่");
      return;
    }
    quiz = { words, index: 0, score: 0, answered: false, options: [] };
    restoreQuizStage();
    if (typeof openSheet === "function") openSheet("vocab-quiz-sheet");
    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    if (!quiz || quiz.index >= quiz.words.length) return renderQuizResult();
    const c = copy();
    const word = quiz.words[quiz.index];
    const item = view(word);
    const distractorPool = allWords().filter(candidate => candidate.level === activeLevel && candidate.id !== word.id && view(candidate).meaning !== item.meaning);
    const sameCategory = distractorPool.filter(candidate => candidate.cat === word.cat);
    const distractors = [];
    shuffled([...sameCategory, ...distractorPool], quiz.index + Date.now()).forEach(candidate => {
      if (distractors.length < 3 && !distractors.some(value => view(value).meaning === view(candidate).meaning)) distractors.push(candidate);
    });
    quiz.options = shuffled([word, ...distractors], quiz.index + 9001);
    quiz.answered = false;
    q("#vocab-quiz-counter").textContent = `${quiz.index + 1}/${quiz.words.length}`;
    q("#vocab-quiz-progress").style.width = `${(quiz.index + 1) / quiz.words.length * 100}%`;
    q("#vocab-quiz-kicker").textContent = `L${activeLevel} · ${c.quizKicker}`;
    q("#vocab-quiz-title").textContent = item.target;
    q("#vocab-quiz-title").lang = item.lang;
    q("#vocab-quiz-title").dataset.voicePackLevel = String(word.level);
    q("#vocab-quiz-title").dataset.voicePackDirection = direction();
    q("#vocab-quiz-title").dataset.voicePackKey = voicePackOptions(word).audioKey;
    q("#vocab-quiz-reading").textContent = item.reading;
    q("#vocab-quiz-stage > .thai-phonetic-hint")?.remove();
    const quizPhoneticHint = phoneticHintMarkup(item.phonetic);
    if (quizPhoneticHint) q("#vocab-quiz-reading").insertAdjacentHTML("afterend", quizPhoneticHint);
    q("#vocab-quiz-options").innerHTML = quiz.options.map((option, index) => `<button class="vocab-quiz-option" data-vocab-answer="${option.id}"><span>${String.fromCharCode(65 + index)}</span><b>${esc(view(option).meaning)}</b></button>`).join("");
    q("#vocab-quiz-feedback").classList.add("hidden");
    q("#vocab-quiz-feedback").innerHTML = "";
    q("#vocab-quiz-next").textContent = quiz.index === quiz.words.length - 1 ? c.quizFinish : c.quizNext;
    q("#vocab-quiz-next").classList.add("hidden");
  }

  function answerQuiz(id) {
    if (!quiz || quiz.answered) return;
    quiz.answered = true;
    const c = copy();
    const word = quiz.words[quiz.index];
    const item = view(word);
    const correct = id === word.id;
    if (correct) quiz.score += 1;
    updateSrs(word.id, correct);
    qa("[data-vocab-answer]").forEach(button => {
      button.disabled = true;
      if (button.dataset.vocabAnswer === word.id) button.classList.add("correct");
      else if (button.dataset.vocabAnswer === id) button.classList.add("wrong");
    });
    q("#vocab-quiz-feedback").innerHTML = item.exampleAvailable
      ? `<strong>${esc(correct ? c.correct : c.wrong)}</strong><small>${locale() === "zh" ? "例句草稿 · 母语待审" : "ตัวอย่างฉบับร่าง · รอเจ้าของภาษาตรวจ"}</small><span lang="${item.lang}" data-tap-speak data-speak-text="${esc(item.example)}" data-speak-lang="${item.voiceLang}" ${voicePackAttrs(word, "example")}>${esc(item.example)}</span>${phoneticHintMarkup(item.examplePhonetic)}<span>${esc(item.exampleMeaning)}</span>`
      : `<strong>${esc(correct ? c.correct : c.wrong)}</strong><span>${locale() === "zh" ? "该例句未通过最低完整性门禁，已停止展示和跟读。" : "ตัวอย่างนี้ไม่ผ่านเกณฑ์ความสมบูรณ์ขั้นต่ำ จึงงดแสดงและงดฝึกพูด"}</span>`;
    q("#vocab-quiz-feedback").classList.remove("hidden");
    q("#vocab-quiz-next").classList.remove("hidden");
  }

  function renderQuizResult() {
    const c = copy();
    q("#vocab-quiz-counter").textContent = `${quiz.score}/${quiz.words.length}`;
    q("#vocab-quiz-progress").style.width = "100%";
    q("#vocab-quiz-stage").innerHTML = `<div class="vocab-quiz-result"><span>${quiz.score}</span><h2>${esc(c.resultTitle)}</h2><p>${esc(c.resultCopy(quiz.score))}</p><button class="primary-btn" id="restart-vocab-quiz">${esc(c.restart)}</button></div>`;
    q("#vocab-quiz-next").classList.add("hidden");
    renderAll();
    if (quiz.score >= 8 && typeof playAlaiVoice === "function") playAlaiVoice("level");
  }

  function nextQuiz() {
    if (!quiz?.answered) return;
    quiz.index += 1;
    renderQuizQuestion();
  }

  function setPane(pane, focusTab = false) {
    const tabs = qa("[data-library-pane]");
    const normalizedPane = tabs.some(button => button.dataset.libraryPane === pane) ? pane : "vocab";
    tabs.forEach(button => {
      const active = button.dataset.libraryPane === normalizedPane;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", String(active));
      button.tabIndex = active ? 0 : -1;
      const panel = q(`#${button.getAttribute("aria-controls")}`);
      if (panel) {
        panel.setAttribute("role", "tabpanel");
        panel.setAttribute("aria-labelledby", button.id);
        panel.classList.toggle("hidden", !active);
        panel.hidden = !active;
      }
      if (active && focusTab) button.focus();
    });
    q(".vocab-page-title").classList.toggle("hidden", normalizedPane !== "vocab");
    q(".vocab-hero").classList.toggle("hidden", normalizedPane !== "vocab");
    if (normalizedPane === "pronunciation") window.PronunciationCourse?.onDirectionChange?.(direction());
  }

  function bindEvents() {
    q("#view-library").addEventListener("click", event => {
      if (event.target.closest("[data-vocab-reload]")) {
        window.location.reload();
        return;
      }
      const pane = event.target.closest("[data-library-pane]");
      if (pane) return setPane(pane.dataset.libraryPane);
      const level = event.target.closest("[data-vocab-level]");
      if (level) {
        activeLevel = Number(level.dataset.vocabLevel);
        storage()?.setItem(key("level"), String(activeLevel));
        activeCategory = "all"; activeState = "all"; visibleCount = PAGE_SIZE; expandedId = null;
        q("#vocab-category").value = "all";
        qa("[data-vocab-state]").forEach(button => button.classList.toggle("active", button.dataset.vocabState === "all"));
        renderAll();
        return;
      }
      const state = event.target.closest("[data-vocab-state]");
      if (state) {
        activeState = state.dataset.vocabState; visibleCount = PAGE_SIZE;
        qa("[data-vocab-state]").forEach(button => button.classList.toggle("active", button === state));
        renderCards(); return;
      }
      const expand = event.target.closest("[data-vocab-expand]");
      if (expand) { expandedId = expandedId === expand.dataset.vocabExpand ? null : expand.dataset.vocabExpand; renderCards(); return; }
      const audio = event.target.closest("[data-vocab-audio]");
      if (audio) { const word = allWords().find(item => item.id === audio.dataset.vocabAudio); if (word && typeof speakText === "function") { const item = view(word); speakText(item.target, item.voiceLang, .78, voicePackOptions(word)); } return; }
      const slowAudio = event.target.closest("[data-vocab-slow-audio]");
      if (slowAudio) { const word = allWords().find(item => item.id === slowAudio.dataset.vocabSlowAudio); if (word && typeof speakText === "function") { const item = view(word); speakText(item.target, item.voiceLang, .64, voicePackOptions(word)); } return; }
      const star = event.target.closest("[data-vocab-star]");
      if (star) { toggleSet("stars", star.dataset.vocabStar); renderCards(); return; }
      const known = event.target.closest("[data-vocab-known]");
      if (known) { markKnown(known.dataset.vocabKnown); return; }
    });
    q(".library-mode-tabs").addEventListener("keydown", event => {
      const current = event.target.closest("[data-library-pane]");
      if (!current) return;
      const tabs = qa("[data-library-pane]");
      const index = tabs.indexOf(current);
      let next = null;
      if (event.key === "ArrowRight") next = tabs[(index + 1) % tabs.length];
      else if (event.key === "ArrowLeft") next = tabs[(index - 1 + tabs.length) % tabs.length];
      else if (event.key === "Home") next = tabs[0];
      else if (event.key === "End") next = tabs[tabs.length - 1];
      if (!next) return;
      event.preventDefault();
      setPane(next.dataset.libraryPane, true);
    });
    q("#vocab-search").addEventListener("input", () => { visibleCount = PAGE_SIZE; renderCards(); });
    q("#vocab-search-clear").addEventListener("click", () => { q("#vocab-search").value = ""; renderCards(); q("#vocab-search").focus(); });
    q("#vocab-category").addEventListener("change", event => { activeCategory = event.target.value; visibleCount = PAGE_SIZE; renderCards(); });
    q("#vocab-load-more").addEventListener("click", () => { visibleCount += PAGE_SIZE; renderCards(); });
    q("#vocab-shuffle").addEventListener("click", () => { shuffleSalt += 1; renderCards(); });
    q("#start-vocab-quiz").addEventListener("click", startQuiz);
    q("#vocab-quiz-sheet").addEventListener("click", event => {
      const answer = event.target.closest("[data-vocab-answer]");
      if (answer) return answerQuiz(answer.dataset.vocabAnswer);
      if (event.target.closest("#vocab-quiz-audio") && quiz) { const word = quiz.words[quiz.index]; const item = view(word); if (typeof speakText === "function") speakText(item.target, item.voiceLang, .76, voicePackOptions(word)); return; }
      if (event.target.closest("#restart-vocab-quiz")) startQuiz();
    });
    q("#vocab-quiz-next").addEventListener("click", nextQuiz);
  }

  function init() {
    if (initialized || !q("#vocab-pane")) return;
    initialized = true;
    quizStageTemplate = q("#vocab-quiz-stage").innerHTML;
    loadRouteState();
    bindEvents();
    setPane("vocab");
    renderAll();
  }

  function onDirectionChange() {
    if (!q("#vocab-pane")) return;
    loadRouteState();
    renderAll();
  }

  window.VocabUI = { init, render: renderAll, onDirectionChange, startQuiz };
  document.addEventListener("DOMContentLoaded", init);
})();
