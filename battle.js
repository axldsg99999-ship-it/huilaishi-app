(function (root) {
  "use strict";

  const GRADES = ["S5", "S4", "S3", "S2", "S1"];
  const DIRECTIONS = ["zh-th", "th-zh"];
  const QUESTION_TYPES = ["meaning", "listen", "tone"];
  const DEFAULT_MODE = "standard";
  const BATTLE_MODES = Object.freeze({
    standard: Object.freeze({ id: "standard", rounds: 12, turnMs: 12000, counts: Object.freeze({ meaning: 2, listen: 2, tone: 2 }) }),
    blitz: Object.freeze({ id: "blitz", rounds: 8, turnMs: 8000, counts: Object.freeze({ meaning: 1, listen: 1, tone: 2 }) }),
    register: Object.freeze({ id: "register", rounds: 12, turnMs: 10000, counts: Object.freeze({ meaning: 1, listen: 2, tone: 3 }) })
  });
  const MODE_IDS = new Set(Object.keys(BATTLE_MODES));
  const MODE_TO_GRADE = ["S5", "S4", "S3", "S2", "S1"];
  const TONE_BOUNDARIES = {
    S5: ["S4"],
    S4: ["S5", "S3"],
    S3: ["S4"],
    S2: ["S3"],
    S1: ["S2"]
  };
  const GRADE_LABELS = {
    zh: { S5: "正式体面", S4: "日常礼貌", S3: "熟人随口", S2: "冲硬冒犯", S1: "粗口识别" },
    th: { S5: "สุภาพเป็นทางการ", S4: "สุภาพในชีวิตประจำวัน", S3: "กันเอง", S2: "ห้วนและเสี่ยงลบหลู่", S1: "คำหยาบเพื่อการรู้ทัน" }
  };
  const COPY = {
    zh: {
      eyebrow: "面对面 · 同机对战", title: "两个人，轮流抢分", subtitle: "先选玩法，再选本局表达档位；双方题量、档位和计分规则完全对等。",
      direction: "玩家 A 学习方向", opposite: "玩家 B 自动学习相反方向", grade: "本局素质档", mode: "本局玩法", current: "沿用当前", playerA: "玩家 A", playerB: "玩家 B", nameA: "玩家 A 名称", nameB: "玩家 B 名称",
      modeNames: { standard: "均衡赛", blitz: "闪电赛", register: "语气擂台" },
      modeDescriptions: { standard: "12 回合 · 三类题均衡", blitz: "8 回合 · 8 秒快答", register: "12 回合 · 语气题加量" },
      start: rounds => `开始 ${rounds} 回合对战`, close: "关闭双人对战", rules: counts => `词义 × ${counts.meaning * 2} · 听音 × ${counts.listen * 2} · 语气 × ${counts.tone * 2}`, safety: "S1 只训练识别；角色音失败时不会退回系统机器声。", boundaryRule: "语气题同时覆盖当前档与相邻边界；未选 S1 时绝不出现 S1 粗口。对战统一使用内置女声；听音题固定 100 分，只比准确。", backgroundRule: "公平规则：答题或播放示范音时切到后台，本回合按超时处理。",
      handoff: "把手机交给", hidden: "题目已遮住", ready: name => `${name}，准备抢分`, turn: name => `${name} 的回合`, round: (n, total) => `第 ${n}/${total} 回合`,
      meaningType: "中泰词义", meaningPrompt: value => `“${value}”对应哪一个？`, listenType: "听音辨义", listenPrompt: grade => `听 ${grade} 档表达，选出它的意思`,
      toneType: "语气雷达", tonePrompt: "结合人物关系与场景，判断这句话属于哪一档", replay: "再听一次", seconds: value => `${value} 秒`, listenStarting: seconds => `示范音播完后开始 ${seconds} 秒计时`, listenFallbackType: "文字替补题",
      correct: "命中！", wrong: "这题失分", timeout: "时间到", answer: "正确答案", speed: value => `速度加成 ${value}`, listenNoSpeed: "听音题只计准确", points: value => `+${value} 分`,
      passNext: name => `交给 ${name}`, result: "对战结果", tie: "平局！再来一局分胜负", wins: name => `${name} 获胜`, accuracy: "正确率", avg: "平均用时", streak: "最长连击", rematch: rounds => `交换先手，再战 ${rounds} 回合`, settings: "返回设置",
      badgePerfect: "全题命中", badgeRadar: "语气雷达", badgeFast: "闪电反应", records: "本机战绩", recordLine: (matches, wins, winRate) => `${matches} 局 · ${wins} 胜 · 胜率 ${winRate}%`, noRecords: "本机还没有历史对局",
      leaveConfirm: "当前对战还没结束，退出会丢失本局进度。确定退出吗？",
      dataError: "真实词库或表达档位内容尚未加载完整，暂时不能开局。", audioError: "S1 角色音未能加载；没有回退系统机器声。", audioUnavailable: "当前示范音无法播放。", audioTextFallback: "固定示范音不可用，已显示文字；本题不计算速度加成。", review: "词汇、译义和固定示范音仍待母语教师终审；对战用于练习，不作发音认证。",
      zhTh: "中文 → ไทย", thZh: "ไทย → 中文", learnsThai: "学泰语", learnsChinese: "学中文", focus: grade => `${grade} 重点`, vocabFocus: "核心词汇", toneFocus: grade => `${grade} + 相邻边界`, noAnswer: "未作答"
    },
    th: {
      eyebrow: "PASS & PLAY · เล่นสองคน", title: "ผลัดกันทำคะแนนในเครื่องเดียว", subtitle: "เลือกรูปแบบและระดับภาษาก่อนเริ่ม ทั้งสองฝ่ายได้จำนวนข้อ ระดับ และกติกาคะแนนเท่ากัน",
      direction: "ทิศทางของผู้เล่น A", opposite: "ผู้เล่น B เรียนอีกทิศทางโดยอัตโนมัติ", grade: "ระดับภาษารอบนี้", mode: "รูปแบบการแข่งขัน", current: "ใช้ค่าปัจจุบัน", playerA: "ผู้เล่น A", playerB: "ผู้เล่น B", nameA: "ชื่อผู้เล่น A", nameB: "ชื่อผู้เล่น B",
      modeNames: { standard: "รอบสมดุล", blitz: "ดวลสายฟ้า", register: "เวทีระดับภาษา" },
      modeDescriptions: { standard: "12 รอบ · ครบ 3 แบบ", blitz: "8 รอบ · 8 วินาที", register: "12 รอบ · เน้นระดับ" },
      start: rounds => `เริ่มแข่ง ${rounds} รอบ`, close: "ปิดเกมสองคน", rules: counts => `ความหมาย × ${counts.meaning * 2} · ฟังเสียง × ${counts.listen * 2} · ระดับภาษา × ${counts.tone * 2}`, safety: "S1 ใช้เพื่อฟังให้รู้ทันเท่านั้น หากเสียงตัวละครเล่นไม่ได้ ระบบจะไม่ใช้เสียงเครื่องแทน", boundaryRule: "โจทย์ระดับภาษาครอบคลุมระดับที่เลือกและขอบเขตใกล้เคียง หากไม่ได้เลือก S1 จะไม่มีคำหยาบ S1 ใช้เสียงผู้หญิงแบบติดตั้งชุดเดียวกัน และข้อฟังคิด 100 คะแนนจากความแม่นยำเท่านั้น", backgroundRule: "กติกาความยุติธรรม: หากสลับออกจากแอประหว่างโจทย์หรือเสียงตัวอย่าง รอบนั้นจะนับว่าหมดเวลา",
      handoff: "ส่งโทรศัพท์ให้", hidden: "ซ่อนคำถามไว้แล้ว", ready: name => `${name} พร้อมชิงคะแนน`, turn: name => `รอบของ ${name}`, round: (n, total) => `รอบ ${n}/${total}`,
      meaningType: "ความหมายจีน–ไทย", meaningPrompt: value => `“${value}” ตรงกับข้อใด`, listenType: "ฟังแล้วเลือกความหมาย", listenPrompt: grade => `ฟังสำนวนระดับ ${grade} แล้วเลือกความหมาย`,
      toneType: "เรดาร์ระดับภาษา", tonePrompt: "ดูความสัมพันธ์และสถานการณ์ แล้วเลือกระดับภาษาของประโยคนี้", replay: "ฟังอีกครั้ง", seconds: value => `${value} วิ`, listenStarting: seconds => `เริ่มจับเวลา ${seconds} วินาทีหลังเสียงตัวอย่างจบ`, listenFallbackType: "โจทย์ข้อความสำรอง",
      correct: "ถูกต้อง!", wrong: "ข้อนี้ไม่ได้คะแนน", timeout: "หมดเวลา", answer: "คำตอบที่ถูก", speed: value => `โบนัสความเร็ว ${value}`, listenNoSpeed: "ข้อฟังคิดเฉพาะความแม่นยำ", points: value => `+${value} คะแนน`,
      passNext: name => `ส่งให้ ${name}`, result: "ผลการแข่งขัน", tie: "เสมอกัน! เล่นอีกครั้งเพื่อตัดสิน", wins: name => `${name} ชนะ`, accuracy: "ความแม่นยำ", avg: "เวลาเฉลี่ย", streak: "คอมโบสูงสุด", rematch: rounds => `สลับคนเริ่ม แล้วแข่ง ${rounds} รอบ`, settings: "กลับไปตั้งค่า",
      badgePerfect: "ตอบถูกทุกข้อ", badgeRadar: "เรดาร์ระดับภาษา", badgeFast: "ตอบไว", records: "สถิติในเครื่อง", recordLine: (matches, wins, winRate) => `${matches} เกม · ชนะ ${wins} · อัตราชนะ ${winRate}%`, noRecords: "ยังไม่มีประวัติการแข่งขันในเครื่อง",
      leaveConfirm: "การแข่งขันยังไม่จบ หากออกตอนนี้ความคืบหน้ารอบนี้จะหายไป ต้องการออกหรือไม่",
      dataError: "คลังคำหรือชุดระดับภาษายังโหลดไม่ครบ จึงเริ่มเกมไม่ได้", audioError: "เล่นเสียงตัวละคร S1 ไม่สำเร็จ และระบบไม่ได้ใช้เสียงเครื่องแทน", audioUnavailable: "ไม่สามารถเล่นเสียงตัวอย่างนี้ได้", audioTextFallback: "เสียงตัวอย่างแบบติดตั้งใช้ไม่ได้ จึงแสดงข้อความแทนและไม่นับโบนัสความเร็ว", review: "คำศัพท์ คำแปล และเสียงตัวอย่างแบบติดตั้งยังรอครูเจ้าของภาษาตรวจขั้นสุดท้าย เกมนี้ใช้เพื่อฝึก ไม่ใช่การรับรองการออกเสียง",
      zhTh: "中文 → ไทย", thZh: "ไทย → 中文", learnsThai: "เรียนไทย", learnsChinese: "เรียนจีน", focus: grade => `เน้น ${grade}`, vocabFocus: "คำศัพท์หลัก", toneFocus: grade => `${grade} + ขอบเขตใกล้เคียง`, noAnswer: "ไม่ได้ตอบ"
    }
  };

  let host = null;
  let options = {};
  let timerId = 0;
  let activeCharacterAudio = null;
  let matchSerial = 0;
  const state = {
    phase: "idle",
    direction: "zh-th",
    grade: "S4",
    mode: DEFAULT_MODE,
    round: 0,
    startingPlayer: 0,
    activePlayer: 0,
    remainingMs: BATTLE_MODES[DEFAULT_MODE].turnMs,
    questionStartedAt: 0,
    questions: [],
    roundResults: [],
    matchRecorded: false,
    winnerIndex: null,
    lastAnswer: null,
    players: [
      { name: "玩家 A", score: 0, correct: 0, answered: 0, totalMs: 0, streak: 0, maxStreak: 0 },
      { name: "玩家 B", score: 0, correct: 0, answered: 0, totalMs: 0, streak: 0, maxStreak: 0 }
    ]
  };

  const esc = value => String(value == null ? "" : value)
    .replace(/&/gu, "&amp;").replace(/</gu, "&lt;").replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;").replace(/'/gu, "&#039;");
  const turnDirection = () => ["handoff", "preroll", "question", "feedback"].includes(state.phase)
    ? playerDirection(state.activePlayer)
    : state.direction;
  const locale = () => turnDirection() === "zh-th" ? "zh" : "th";
  const copy = () => COPY[locale()];
  const copyForDirection = direction => COPY[direction === "th-zh" ? "th" : "zh"];
  const gradeLabel = (grade, direction = turnDirection()) => GRADE_LABELS[direction === "th-zh" ? "th" : "zh"][grade] || grade;
  const oppositeDirection = direction => direction === "th-zh" ? "zh-th" : "th-zh";
  const playerDirection = index => index === 0 ? state.direction : oppositeDirection(state.direction);
  const directionLabel = direction => direction === "zh-th" ? copy().learnsThai : copy().learnsChinese;
  const defaultPlayerName = (index, direction = playerDirection(index)) => `${direction === "th-zh" ? "ผู้เล่น" : "玩家"} ${index === 0 ? "A" : "B"}`;
  const AUTO_PLAYER_NAMES = new Set(["玩家 A", "玩家 B", "ผู้เล่น A", "ผู้เล่น B"]);

  function localizeAutomaticPlayerNames() {
    state.players.forEach((player, index) => {
      if (!player.name || AUTO_PLAYER_NAMES.has(player.name)) player.name = defaultPlayerName(index);
    });
  }

  function shuffle(items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [result[index], result[swap]] = [result[swap], result[index]];
    }
    return result;
  }

  function storage() {
    if (options.storage) return options.storage;
    if (root.HUILAISHI_STORAGE) return root.HUILAISHI_STORAGE;
    try { return root.localStorage; } catch (_) { return null; }
  }

  function readStorage(key) {
    try { return storage()?.getItem?.(key) ?? null; } catch (_) { return null; }
  }

  function writeStorage(key, value) {
    try { storage()?.setItem?.(key, String(value)); return true; } catch (_) { return false; }
  }

  function currentBattleMode() {
    const supplied = typeof options.getMode === "function" ? options.getMode() : options.mode;
    const stored = readStorage("huilaishi-battle-mode-v1");
    if (MODE_IDS.has(supplied)) return supplied;
    return MODE_IDS.has(stored) ? stored : DEFAULT_MODE;
  }

  function modeConfig() {
    return MODE_IDS.has(state.mode) ? BATTLE_MODES[state.mode] : BATTLE_MODES[DEFAULT_MODE];
  }

  function totalRounds() {
    return modeConfig().rounds;
  }

  function turnMs() {
    return modeConfig().turnMs;
  }

  function turnSeconds() {
    return Math.round(turnMs() / 1000);
  }

  function currentDirection() {
    const supplied = typeof options.getDirection === "function" ? options.getDirection() : options.direction;
    const stored = readStorage("learningDirection");
    return DIRECTIONS.includes(supplied) ? supplied : (DIRECTIONS.includes(stored) ? stored : "zh-th");
  }

  function currentGrade(direction) {
    const supplied = typeof options.getGrade === "function" ? options.getGrade() : options.grade;
    if (GRADES.includes(supplied)) return supplied;
    const rawMode = readStorage(`thai-vibe-mode-${direction}`);
    const savedMode = rawMode === null || rawMode === "" ? NaN : Number(rawMode);
    return (Number.isInteger(savedMode) ? MODE_TO_GRADE[savedMode] : "") || root.HUILAISHI_REGISTER_GUIDE?.defaultGrade || "S4";
  }

  function corpus() {
    const rows = [
      ...(root.HUILAISHI_VOCAB_L12 || []),
      ...(root.HUILAISHI_VOCAB_L34 || []),
      ...(root.HUILAISHI_VOCAB_L56 || []),
      ...(root.HUILAISHI_VOCAB_EXPANSION_L13 || []),
      ...(root.HUILAISHI_VOCAB_EXPANSION_L46 || [])
    ];
    const seen = new Set();
    return rows.filter(word => {
      if (!word?.id || !word.zh || !word.th || word.reviewVariant || word.trainingAllowed === false) return false;
      const identity = `${String(word.zh).trim()}\u001f${String(word.th).trim()}`;
      if (seen.has(identity)) return false;
      seen.add(identity);
      return true;
    });
  }

  function validRegisterPacks() {
    return (root.HUILAISHI_REGISTER_PACK || []).filter(pack => {
      const context = pack?.decisionContext;
      return Boolean(
        pack?.id && pack.contextComplete && pack.uniqueGradeJudgment
        && context?.settingZh && context?.settingTh && context?.relationshipZh && context?.relationshipTh
        && Array.isArray(pack.variants) && GRADES.every(grade => pack.variants.some(variant => variant.grade === grade))
      );
    });
  }

  function resolveVariant(pack, grade, direction = state.direction) {
    // Competitive rounds deliberately use the source/female forms backed by
    // the packaged reference recordings. The wider app can still honour the
    // learner's male form preference, but mixing covered and uncovered forms
    // here would give only one player a text fallback and distort the score.
    return root.HUILAISHI_REGISTER_GUIDE?.getVariant?.(pack.id, grade, "source")
      || pack.variants.find(variant => variant.grade === grade)
      || null;
  }

  function wordSide(word, direction = state.direction) {
    const zhToTh = direction === "zh-th";
    return {
      source: zhToTh ? word.zh : word.th,
      sourceLang: zhToTh ? "zh-CN" : "th",
      target: zhToTh ? word.th : word.zh,
      targetLang: zhToTh ? "th" : "zh-CN",
      reading: zhToTh ? (word.thReading?.romanTone || word.ro || "") : (word.py || "")
    };
  }

  function variantSide(variant, direction = state.direction) {
    const zhToTh = direction === "zh-th";
    return {
      target: zhToTh ? variant.th : variant.zh,
      targetLang: zhToTh ? "th" : "zh-CN",
      voiceLang: zhToTh ? "th-TH" : "zh-CN",
      reading: zhToTh ? (variant.thReading?.romanTone || variant.ro || "") : (variant.py || ""),
      meaning: zhToTh ? variant.zh : variant.th
    };
  }

  function distinctOptions(pool, correct, label, count = 4) {
    const correctLabel = String(label(correct) || "").trim();
    const used = new Set([correctLabel]);
    const distractors = shuffle(pool).filter(item => {
      if (item === correct) return false;
      const value = String(label(item) || "").trim();
      if (!value || used.has(value)) return false;
      used.add(value);
      return true;
    }).slice(0, count - 1);
    return distractors.length === count - 1 ? shuffle([correct, ...distractors]) : [];
  }

  function meaningQuestions(count, words, direction) {
    // Keep low-memory Android devices out of repeated 3,000-row shuffles. A
    // compact per-player sample is enough to build distinct four-way choices.
    const sample = shuffle(words).slice(0, Math.min(words.length, Math.max(20, count * 6)));
    return sample.slice(0, count).map(word => {
      const choiceRows = distinctOptions(sample, word, item => wordSide(item, direction).target);
      if (!choiceRows.length) return null;
      const view = wordSide(word, direction);
      return {
        id: `meaning:${direction}:${word.id}`,
        wordId: word.id,
        type: "meaning",
        direction,
        prompt: copyForDirection(direction).meaningPrompt(view.source),
        promptLang: view.sourceLang,
        options: choiceRows.map(item => {
          const option = wordSide(item, direction);
          return { id: item.id, text: option.target, sub: option.reading, lang: option.targetLang, correct: item.id === word.id };
        })
      };
    }).filter(Boolean);
  }

  function packMeaning(pack, direction) {
    return direction === "zh-th" ? (pack.intentZh || pack.contextZh) : (pack.intentTh || pack.contextTh);
  }

  function questionAudio(pack, variant, direction) {
    const view = variantSide(variant, direction);
    return { packId: pack.id, grade: variant.grade, direction, text: view.target, reading: view.reading, lang: view.voiceLang };
  }

  function listenQuestions(count, packs, direction, assignedPacks = null) {
    const selectedPacks = Array.isArray(assignedPacks) ? assignedPacks.slice(0, count) : shuffle(packs).slice(0, count);
    return selectedPacks.map(pack => {
      const variant = resolveVariant(pack, state.grade, direction);
      const choicePacks = distinctOptions(packs, pack, item => packMeaning(item, direction));
      if (!variant || !choicePacks.length) return null;
      return {
        id: `listen:${direction}:${pack.id}:${state.grade}`,
        type: "listen",
        direction,
        prompt: copyForDirection(direction).listenPrompt(state.grade),
        audio: questionAudio(pack, variant, direction),
        options: choicePacks.map(item => ({
          id: item.id, text: packMeaning(item, direction), sub: "", lang: direction === "zh-th" ? "zh-CN" : "th", correct: item.id === pack.id
        }))
      };
    }).filter(Boolean);
  }

  function localizedContext(pack, direction) {
    const context = pack.decisionContext || {};
    return direction === "zh-th"
      ? `${context.settingZh} · ${context.relationshipZh}`
      : `${context.settingTh} · ${context.relationshipTh}`;
  }

  function toneQuestions(count, packs, direction, comparisonGrade, assignedPacks = null) {
    const gradePlan = shuffle(Array.from({ length: count }, (_, index) => (
      count > 1 && index === count - 1 ? comparisonGrade : state.grade
    )));
    const selectedPacks = Array.isArray(assignedPacks) ? assignedPacks.slice(0, count) : shuffle(packs).slice(0, count);
    return selectedPacks.map((pack, index) => {
      const actualGrade = gradePlan[index] || state.grade;
      const variant = resolveVariant(pack, actualGrade, direction);
      if (!variant) return null;
      const view = variantSide(variant, direction);
      return {
        id: `tone:${direction}:${pack.id}:${actualGrade}`,
        type: "tone",
        direction,
        prompt: copyForDirection(direction).tonePrompt,
        context: localizedContext(pack, direction),
        display: view.target,
        reading: view.reading,
        displayLang: view.targetLang,
        audio: questionAudio(pack, variant, direction),
        options: GRADES.map(grade => ({ id: grade, text: grade, sub: gradeLabel(grade, direction), lang: "", correct: grade === actualGrade }))
      };
    }).filter(Boolean);
  }

  function buildQuestionBank() {
    const words = corpus();
    const packs = validRegisterPacks();
    if (words.length < 16 || packs.length < 8) throw new Error("battle-data-incomplete");
    const config = modeConfig();
    const counts = config.counts;
    const comparisonGrade = shuffle(TONE_BOUNDARIES[state.grade] || [])[0] || state.grade;
    const registerCountPerPlayer = counts.listen + counts.tone;
    const assignedRegisterPacks = shuffle(packs).slice(0, registerCountPerPlayer * 2);
    if (assignedRegisterPacks.length !== registerCountPerPlayer * 2) throw new Error("battle-register-pack-allocation-failed");
    const usedMeaningIds = new Set();
    const sets = [0, 1].map(playerIndex => {
      const direction = playerDirection(playerIndex);
      const byLevel = words.filter(word => Number(word.level) === Number(readStorage(`huilaishi-vocab-level-${direction}`) || 1));
      const preferredPool = byLevel.length >= 16 ? byLevel : words;
      const wordPool = preferredPool.filter(word => !usedMeaningIds.has(word.id));
      const packOffset = playerIndex * registerCountPerPlayer;
      const playerPacks = assignedRegisterPacks.slice(packOffset, packOffset + registerCountPerPlayer);
      const listenPacks = playerPacks.slice(0, counts.listen);
      const tonePacks = playerPacks.slice(counts.listen);
      const buckets = {
        meaning: meaningQuestions(counts.meaning, wordPool, direction),
        listen: listenQuestions(counts.listen, packs, direction, listenPacks),
        tone: toneQuestions(counts.tone, packs, direction, comparisonGrade, tonePacks)
      };
      if (QUESTION_TYPES.some(type => buckets[type].length !== counts[type])) throw new Error("battle-question-build-failed");
      buckets.meaning.forEach(question => usedMeaningIds.add(question.wordId));
      const ordered = [];
      while (ordered.length < config.rounds / 2) {
        QUESTION_TYPES.forEach(type => {
          const next = buckets[type].shift();
          if (next) ordered.push(next);
        });
      }
      return ordered;
    });
    const cursors = [0, 0];
    const questions = Array.from({ length: config.rounds }, (_, round) => {
      const playerIndex = (state.startingPlayer + round) % 2;
      return sets[playerIndex][cursors[playerIndex]++];
    });
    return questions;
  }

  function stopTimer() {
    if (timerId) clearInterval(timerId);
    timerId = 0;
  }

  function stopAudio() {
    try { root.HUILAISHI_SPEECH?.stop?.(); } catch (_) {}
    if (!activeCharacterAudio) return;
    try { activeCharacterAudio.pause(); activeCharacterAudio.currentTime = 0; } catch (_) {}
    activeCharacterAudio = null;
  }

  function setAudioStatus(message, error = false) {
    const node = host?.querySelector?.("[data-duel-audio-status]");
    if (!node) return;
    node.textContent = message || "";
    node.dataset.state = error ? "error" : "ready";
  }

  function playCharacterAudio(audio, callbacks = {}) {
    stopAudio();
    const language = audio.direction === "zh-th" ? "th" : "zh";
    const key = `s1-${audio.packId}-${language}`;
    const source = root.SUGAR_AUDIO?.[key] || `assets/audio/sugarblade-${key}.mp3`;
    if (typeof root.Audio !== "function") {
      setAudioStatus(copy().audioError, true);
      return false;
    }
    let player;
    try { player = new root.Audio(source); }
    catch (_) {
      setAudioStatus(copy().audioError, true);
      try { callbacks.onError?.(); } catch (_) {}
      return false;
    }
    activeCharacterAudio = player;
    player.preload = "auto";
    player.volume = .9;
    player.setAttribute?.("playsinline", "");
    const fail = () => {
      if (activeCharacterAudio !== player) return;
      activeCharacterAudio = null;
      setAudioStatus(copy().audioError, true);
      try { callbacks.onError?.(); } catch (_) {}
    };
    player.addEventListener?.("ended", () => {
      if (activeCharacterAudio !== player) return;
      activeCharacterAudio = null;
      try { callbacks.onEnd?.(); } catch (_) {}
    }, { once: true });
    player.addEventListener?.("error", fail, { once: true });
    setAudioStatus("");
    try {
      const playback = player.play();
      playback?.catch?.(fail);
      return player;
    } catch (_) { fail(); return false; }
  }

  function playQuestionAudio(callbacks = {}) {
    const question = state.questions[state.round];
    const audio = question?.audio;
    if (!audio) return false;
    if (audio.grade === "S1") return playCharacterAudio(audio, callbacks);
    stopAudio();
    const family = audio.direction === "zh-th" ? "th" : "zh";
    const speech = root.HUILAISHI_SPEECH;
    if (!speech?.speak) {
      setAudioStatus(copy().audioUnavailable, true);
      try { callbacks.onError?.(); } catch (_) {}
      return false;
    }
    setAudioStatus("");
    let result;
    try {
      result = speech.speak(audio.text, {
        lang: audio.lang,
        rate: audio.direction === "zh-th" ? .82 : .88,
        audioKey: `register:${audio.packId}:${audio.grade}:${family}`,
        track: "standard",
        fallback: "none",
        onError: callbacks.onError
      });
    } catch (_) {
      setAudioStatus(copy().audioUnavailable, true);
      try { callbacks.onError?.(); } catch (_) {}
      return false;
    }
    const media = result?.audio;
    if (typeof callbacks.onEnd === "function") media?.addEventListener?.("ended", callbacks.onEnd, { once: true });
    if (typeof callbacks.onError === "function") media?.addEventListener?.("error", callbacks.onError, { once: true });
    if (!result) try { callbacks.onError?.(); } catch (_) {}
    return result;
  }

  function playerName(index) {
    return state.players[index]?.name || defaultPlayerName(index);
  }

  function publicState() {
    return {
      phase: state.phase,
      direction: state.direction,
      grade: state.grade,
      mode: state.mode,
      round: state.round,
      totalRounds: totalRounds(),
      turnMs: turnMs(),
      activePlayer: state.activePlayer,
      winnerIndex: state.winnerIndex,
      tie: state.winnerIndex === -1,
      players: state.players.map((player, index) => ({ ...player, direction: playerDirection(index) })),
      roundResults: state.roundResults.map(result => ({ ...result }))
    };
  }

  function focusTarget(selector) {
    const target = host?.querySelector?.(selector);
    if (!target?.focus) return;
    try { target.focus({ preventScroll: true }); }
    catch (_) { try { target.focus(); } catch (_) {} }
  }

  function shell(content, live = "polite") {
    return `<section class="hls-duel" aria-labelledby="hls-duel-title"><header class="hls-duel-head"><div><p>${esc(copy().eyebrow)}</p><h2 id="hls-duel-title">${esc(copy().title)}</h2></div><button type="button" class="hls-duel-close" data-duel-action="close" aria-label="${esc(copy().close)}">×</button></header><div class="hls-duel-live" aria-live="${live}">${content}</div></section>`;
  }

  function syncSetupNames() {
    if (!host || state.phase !== "setup") return;
    [0, 1].forEach(index => {
      const input = host.querySelector(`[data-duel-name="${index}"]`);
      const fallback = defaultPlayerName(index);
      if (input) state.players[index].name = String(input.value || "").trim().slice(0, 18) || fallback;
    });
  }

  function renderSetup(error = "", focusSelector = "[data-duel-mode][aria-pressed='true']") {
    stopTimer(); stopAudio(); state.phase = "setup";
    const c = copy();
    const config = modeConfig();
    const directionButtons = DIRECTIONS.map(direction => `<button type="button" data-duel-direction="${direction}" aria-pressed="${state.direction === direction}"><span>${direction === "zh-th" ? "中" : "ท"}</span><b>${esc(direction === "zh-th" ? c.zhTh : c.thZh)}</b></button>`).join("");
    const gradeButtons = GRADES.map(grade => `<button type="button" data-duel-grade="${grade}" aria-pressed="${state.grade === grade}"><b>${grade}</b><span>${esc(gradeLabel(grade))}</span></button>`).join("");
    const modeButtons = Object.values(BATTLE_MODES).map((mode, index) => `<button type="button" data-duel-mode="${mode.id}" aria-pressed="${state.mode === mode.id}"><span>0${index + 1}</span><b>${esc(c.modeNames[mode.id])}</b><small>${esc(c.modeDescriptions[mode.id])}</small></button>`).join("");
    const recordSummary = battleRecordSummary();
    const recordMarkup = recordSummary.matches > 0
      ? `<div class="hls-duel-record-line"><span>${esc(c.records)}</span><b>${esc(c.recordLine(recordSummary.matches, recordSummary.wins, recordSummary.winRate))}</b></div>`
      : "";
    const content = `<div class="hls-duel-setup"><p class="hls-duel-subtitle">${esc(c.subtitle)}</p>${error ? `<div class="hls-duel-error" data-duel-error role="alert" tabindex="-1">${esc(error)}</div>` : ""}<fieldset><legend>${esc(c.mode)}</legend><div class="hls-duel-modes">${modeButtons}</div><div class="hls-duel-rule"><b>${config.rounds}</b><span>${esc(c.rules(config.counts))}</span></div></fieldset><fieldset><legend>${esc(c.direction)}</legend><div class="hls-duel-direction">${directionButtons}</div><small class="hls-duel-opposite">${esc(c.opposite)} · B ${esc(directionLabel(oppositeDirection(state.direction)))}</small></fieldset><fieldset><legend>${esc(c.grade)}</legend><div class="hls-duel-grades">${gradeButtons}</div><small class="hls-duel-grade-selection"><b>${esc(state.grade)}</b> · ${esc(gradeLabel(state.grade))}</small></fieldset><div class="hls-duel-names"><label><span>A</span><input data-duel-name="0" maxlength="18" value="${esc(playerName(0))}" aria-label="${esc(c.nameA)}"></label><label><span>B</span><input data-duel-name="1" maxlength="18" value="${esc(playerName(1))}" aria-label="${esc(c.nameB)}"></label></div>${recordMarkup}${state.grade === "S1" ? `<p class="hls-duel-safety" role="note">${esc(c.safety)}</p>` : ""}<div class="hls-duel-setup-action"><button type="button" class="hls-duel-primary" data-duel-action="start">${esc(c.start(config.rounds))}</button></div><p class="hls-duel-review" role="note">${esc(c.boundaryRule)}<br>${esc(c.backgroundRule)}</p><p class="hls-duel-review" role="note">${esc(c.review)}</p></div>`;
    host.innerHTML = shell(content);
    const action = host.querySelector?.(".hls-duel-setup-action");
    const recordLine = host.querySelector?.(".hls-duel-record-line");
    if (action && recordLine) action.insertAdjacentElement?.("afterend", recordLine);
    focusTarget(focusSelector);
  }

  function scoreMarkup() {
    return `<div class="hls-duel-scoreboard" aria-label="${esc(copy().round(state.round + 1, totalRounds()))}">${state.players.map((player, index) => `<div class="${state.activePlayer === index ? "is-active" : ""}"><span>${index === 0 ? "A" : "B"} · ${esc(player.name)} · ${esc(directionLabel(playerDirection(index)))}</span><b>${player.score}${player.streak >= 2 ? `<small aria-label="${esc(copy().streak)} ${player.streak}">×${player.streak}</small>` : ""}</b></div>`).join("")}</div>`;
  }

  function renderHandoff() {
    stopTimer(); stopAudio(); state.phase = "handoff";
    state.activePlayer = (state.startingPlayer + state.round) % 2;
    const c = copy(); const name = playerName(state.activePlayer);
    const content = `${scoreMarkup()}<div class="hls-duel-handoff"><div class="hls-duel-turn-token">${state.activePlayer === 0 ? "A" : "B"}</div><p>${esc(c.handoff)}</p><h3>${esc(name)}</h3><strong class="hls-duel-route">${esc(directionLabel(playerDirection(state.activePlayer)))}</strong><span>${esc(c.hidden)} · ${esc(c.round(state.round + 1, totalRounds()))}</span><button type="button" class="hls-duel-primary" data-duel-action="reveal">${esc(c.ready(name))}</button></div>`;
    host.innerHTML = shell(content);
    focusTarget("[data-duel-action='reveal']");
  }

  function typeLabel(question) {
    if (question?.audioFallback) return copy().listenFallbackType;
    if (question?.type === "meaning") return copy().meaningType;
    if (question?.type === "listen") return copy().listenType;
    return copy().toneType;
  }

  function focusLabel(question) {
    if (question?.type === "meaning") return copy().vocabFocus;
    if (question?.type === "tone") return copy().toneFocus(state.grade);
    return copy().focus(state.grade);
  }

  function questionLead(question) {
    if (question.type === "listen") {
      const replayLocked = state.phase === "preroll" && !question.audioFallback;
      const transcript = question.audioFallback
        ? `<div class="hls-duel-expression hls-duel-transcript" lang="${esc(question.audio?.lang || "")}">${esc(question.audio?.text || "")}<small>${esc(question.audio?.reading || "")}</small></div>`
        : "";
      return `${transcript}<button type="button" class="hls-duel-audio" data-duel-action="audio" data-speech-policy="native" aria-label="${esc(copy().replay)}" ${replayLocked ? "disabled aria-disabled=\"true\"" : ""}><span aria-hidden="true">▶</span><b>${esc(copy().replay)}</b></button>`;
    }
    if (question.type === "tone") return `<div class="hls-duel-context">${esc(question.context)}</div><div class="hls-duel-expression" lang="${esc(question.displayLang)}">${esc(question.display)}<small>${esc(question.reading)}</small></div><button type="button" class="hls-duel-audio compact" data-duel-action="audio" data-speech-policy="native" aria-label="${esc(copy().replay)}"><span aria-hidden="true">▶</span><b>${esc(copy().replay)}</b></button>`;
    return "";
  }

  function optionMarkup(option, index, feedback = null, locked = false) {
    const letter = String.fromCharCode(65 + index);
    const selected = feedback?.selectedId === option.id;
    const classes = [option.correct && feedback ? "is-correct" : "", selected && !option.correct ? "is-wrong" : ""].filter(Boolean).join(" ");
    return `<button type="button" class="hls-duel-option ${classes}" data-duel-answer="${index}" ${feedback || locked ? "disabled" : ""} aria-keyshortcuts="${letter} ${index + 1}"><span>${letter}</span><b lang="${esc(option.lang || "")}">${esc(option.text)}</b>${option.sub ? `<small>${esc(option.sub)}</small>` : ""}</button>`;
  }

  function renderQuestion(feedback = null) {
    const question = state.questions[state.round];
    if (!question) return finishMatch();
    const c = copy();
    const elapsed = feedback ? feedback.elapsedMs : 0;
    const waitingForAudio = !feedback && state.phase === "preroll";
    const title = feedback ? (feedback.correct ? c.correct : (feedback.timedOut ? c.timeout : c.wrong)) : c.turn(playerName(state.activePlayer));
    const answer = question.options.find(option => option.correct);
    const scoreDetail = question.type === "listen" ? c.listenNoSpeed : c.speed(feedback?.speedBonus || 0);
    const feedbackMarkup = feedback ? `<div class="hls-duel-feedback ${feedback.correct ? "is-correct" : "is-wrong"}" role="status"><strong>${esc(title)}</strong><span>${esc(c.answer)} · ${esc(answer?.text || c.noAnswer)}</span>${feedback.correct ? `<b>${esc(c.points(feedback.points))} · ${esc(scoreDetail)}</b>` : ""}</div><button type="button" class="hls-duel-primary" data-duel-action="next">${esc(state.round + 1 >= totalRounds() ? c.result : c.passNext(playerName((state.startingPlayer + state.round + 1) % 2)))}</button>` : "";
    const clockCopy = waitingForAudio ? c.listenStarting(turnSeconds()) : c.seconds(feedback ? Math.max(0, Math.ceil((turnMs() - elapsed) / 1000)) : turnSeconds());
    const clockA11y = waitingForAudio ? `role="status" aria-live="polite" tabindex="0"` : `aria-hidden="true"`;
    const optionClass = question.type === "tone" ? "hls-duel-options is-tone" : "hls-duel-options";
    const content = `${scoreMarkup()}<div class="hls-duel-question"><div class="hls-duel-question-meta"><span>${esc(typeLabel(question))}</span><b>${esc(directionLabel(question.direction))} · ${esc(focusLabel(question))}</b></div><div class="hls-duel-timer" aria-hidden="true"><i data-duel-timer-fill style="width:${feedback ? 0 : 100}%"></i></div><div class="hls-duel-clock" data-duel-clock ${clockA11y}>${esc(clockCopy)}</div><h3 id="hls-duel-question-prompt" lang="${esc(question.promptLang || "")}">${esc(question.prompt)}</h3>${questionLead(question)}<div class="${optionClass}" role="group" aria-labelledby="hls-duel-question-prompt">${question.options.map((option, index) => optionMarkup(option, index, feedback, waitingForAudio)).join("")}</div><div class="hls-duel-audio-status" data-duel-audio-status role="status" aria-live="polite"></div>${feedbackMarkup}</div>`;
    host.innerHTML = shell(content, feedback ? "polite" : "off");
    if (feedback) focusTarget("[data-duel-action='next']");
    else if (waitingForAudio) focusTarget("[data-duel-clock]");
    else focusTarget("[data-duel-answer='0']");
  }

  function updateTimer() {
    if (state.phase !== "question") return;
    const duration = turnMs();
    state.remainingMs = Math.max(0, duration - (Date.now() - state.questionStartedAt));
    const fill = host?.querySelector?.("[data-duel-timer-fill]");
    const clock = host?.querySelector?.("[data-duel-clock]");
    if (fill) fill.style.width = `${state.remainingMs / duration * 100}%`;
    if (clock) clock.textContent = copy().seconds(Math.ceil(state.remainingMs / 1000));
    if (state.remainingMs <= 0) answerQuestion(-1, true);
  }

  function activateQuestionTimer(textFallback = false) {
    if (state.phase !== "preroll") return;
    stopTimer();
    const question = state.questions[state.round];
    if (textFallback && question?.type === "listen") question.audioFallback = true;
    state.phase = "question";
    state.remainingMs = turnMs();
    state.questionStartedAt = Date.now();
    renderQuestion();
    if (textFallback) setAudioStatus(copy().audioTextFallback, true);
    timerId = setInterval(updateTimer, 100);
  }

  function startTurn() {
    stopTimer(); stopAudio();
    const question = state.questions[state.round];
    if (question?.type !== "listen") {
      state.phase = "question";
      state.remainingMs = turnMs();
      state.questionStartedAt = Date.now();
      renderQuestion();
      timerId = setInterval(updateTimer, 100);
      return;
    }
    state.phase = "preroll";
    state.remainingMs = turnMs();
    renderQuestion();
    if (question.audioFallback) { activateQuestionTimer(true); return; }
    const turnMatch = matchSerial;
    const turnRound = state.round;
    const isCurrentPreroll = () => matchSerial === turnMatch && state.round === turnRound && state.phase === "preroll";
    const onEnd = () => { if (isCurrentPreroll()) activateQuestionTimer(false); };
    const onError = () => { if (isCurrentPreroll()) { stopAudio(); activateQuestionTimer(true); } };
    const playback = playQuestionAudio({ onEnd, onError });
    if (!playback) { if (state.phase === "preroll") onError(); return; }
    if (state.phase !== "preroll") return;
    // A corrupt or indefinitely stalled media file must never leave the turn
    // locked. It becomes a visible text replacement with no speed bonus.
    timerId = setTimeout(onError, 8000);
  }

  function answerQuestion(index, timedOut = false) {
    if (state.phase !== "question") return;
    stopTimer(); stopAudio();
    const question = state.questions[state.round];
    const selected = question?.options?.[index] || null;
    const correct = Boolean(selected?.correct);
    const duration = turnMs();
    const elapsedMs = Math.min(duration, Math.max(0, Date.now() - state.questionStartedAt));
    const speedBonus = correct && question.type !== "listen" && !question.audioFallback
      ? Math.round(150 * Math.max(0, duration - elapsedMs) / duration)
      : 0;
    const points = correct ? 100 + speedBonus : 0;
    const player = state.players[state.activePlayer];
    player.answered += 1;
    player.totalMs += elapsedMs;
    if (correct) {
      player.correct += 1;
      player.streak += 1;
      player.maxStreak = Math.max(player.maxStreak, player.streak);
    } else player.streak = 0;
    player.score += points;
    state.lastAnswer = { selectedId: selected?.id || "", correct, timedOut, elapsedMs, speedBonus, points };
    state.roundResults.push({
      round: state.round + 1,
      playerIndex: state.activePlayer,
      type: question.type,
      grade: question.audio?.grade || state.grade,
      correct,
      timedOut: Boolean(timedOut),
      elapsedMs,
      points
    });
    state.phase = "feedback";
    renderQuestion(state.lastAnswer);
  }

  function nextRound() {
    if (state.phase !== "feedback") return;
    state.round += 1;
    state.lastAnswer = null;
    if (state.round >= totalRounds()) finishMatch(); else renderHandoff();
  }

  function playerStat(player) {
    const accuracy = player.answered ? Math.round(player.correct / player.answered * 100) : 0;
    const average = player.answered ? (player.totalMs / player.answered / 1000).toFixed(1) : "0.0";
    return { accuracy, average };
  }

  function battleRecordSummary(name = "", seatIndex) {
    const fallback = { matches: 0, wins: 0, losses: 0, draws: 0, winRate: 0, bestScore: 0 };
    try {
      const summary = root.HUILAISHI_BATTLE_RECORDS?.getSummary?.(name, seatIndex);
      if (!summary || typeof summary !== "object") return fallback;
      return {
        ...fallback,
        ...summary,
        matches: Math.max(0, Number(summary.total ?? summary.matches) || 0),
        draws: Math.max(0, Number(summary.ties ?? summary.draws) || 0)
      };
    } catch (_) { return fallback; }
  }

  function recordFinishedMatch(detail) {
    try { root.HUILAISHI_BATTLE_RECORDS?.recordMatch?.(detail); } catch (_) {}
  }

  function playerBadges(player, index, stat) {
    const c = copy();
    const results = state.roundResults.filter(result => result.playerIndex === index);
    const toneResults = results.filter(result => result.type === "tone");
    const badges = [];
    if (player.answered > 0 && player.correct === player.answered) badges.push(c.badgePerfect);
    if (toneResults.length > 0 && toneResults.every(result => result.correct)) badges.push(c.badgeRadar);
    if (player.correct > 0 && Number(stat.average) <= turnSeconds() * .4) badges.push(c.badgeFast);
    return badges.slice(0, 3);
  }

  function finishMatch() {
    stopTimer(); stopAudio(); state.phase = "result";
    const c = copy();
    const [first, second] = state.players;
    const winner = first.score === second.score ? -1 : (first.score > second.score ? 0 : 1);
    state.winnerIndex = winner;
    const firstFinish = !state.matchRecorded;
    state.matchRecorded = true;
    const detail = publicState();
    if (firstFinish) recordFinishedMatch(detail);
    const headline = winner < 0 ? c.tie : c.wins(playerName(winner));
    const cards = state.players.map((player, index) => {
      const stat = playerStat(player);
      const badges = playerBadges(player, index, stat).map(badge => `<small>${esc(badge)}</small>`).join("");
      const record = battleRecordSummary(player.name, index);
      const recordMarkup = record.matches > 0 ? `<p>${esc(c.recordLine(record.matches, record.wins, record.winRate))}</p>` : "";
      return `<article class="${winner === index ? "is-winner" : ""}"><span>${index === 0 ? "A" : "B"}</span><h3>${esc(player.name)}</h3><strong>${player.score}</strong><div class="hls-duel-metrics"><b>${stat.accuracy}%</b><small>${esc(c.accuracy)}</small><b>${stat.average}s</b><small>${esc(c.avg)}</small><b>×${player.maxStreak}</b><small>${esc(c.streak)}</small></div>${badges ? `<div class="hls-duel-badges">${badges}</div>` : ""}${recordMarkup}</article>`;
    }).join("");
    const content = `<div class="hls-duel-result"><p>${esc(c.result)} · ${esc(c.modeNames[state.mode])}</p><h2>${esc(headline)}</h2><div class="hls-duel-result-grid">${cards}</div><button type="button" class="hls-duel-primary" data-duel-action="rematch">${esc(c.rematch(totalRounds()))}</button><button type="button" class="hls-duel-secondary" data-duel-action="settings">${esc(c.settings)}</button></div>`;
    host.innerHTML = shell(content);
    if (firstFinish) {
      try { options.onFinish?.(detail); } catch (_) {}
      try { root.dispatchEvent?.(new root.CustomEvent("huilaishi:local-battle-finish", { detail })); } catch (_) {}
    }
    focusTarget("[data-duel-action='rematch']");
  }

  function resetPlayers() {
    state.players.forEach(player => {
      player.score = 0; player.correct = 0; player.answered = 0; player.totalMs = 0; player.streak = 0; player.maxStreak = 0;
    });
  }

  function startMatch() {
    syncSetupNames();
    try { state.questions = buildQuestionBank(); }
    catch (_) { renderSetup(copy().dataError, "[data-duel-error]"); return false; }
    resetPlayers();
    state.round = 0;
    state.roundResults = [];
    state.matchRecorded = false;
    state.winnerIndex = null;
    state.lastAnswer = null;
    matchSerial += 1;
    renderHandoff();
    return true;
  }

  function matchInProgress() {
    return ["handoff", "preroll", "question", "feedback"].includes(state.phase);
  }

  function confirmMatchExit(force = false) {
    if (force || !matchInProgress()) return true;
    try { return typeof root.confirm === "function" && root.confirm(copy().leaveConfirm); }
    catch (_) { return false; }
  }

  function handleClick(event) {
    // Most actions redraw this host synchronously. Stop here so the global
    // tap-to-speak listener never receives a now-detached target and mistakes
    // battle text (including S1 recognition content) for standard narration.
    event.stopPropagation?.();
    const answer = event.target.closest?.("[data-duel-answer]");
    if (answer && !answer.disabled) { answerQuestion(Number(answer.dataset.duelAnswer)); return; }
    const direction = event.target.closest?.("[data-duel-direction]");
    if (direction) {
      syncSetupNames(); state.direction = direction.dataset.duelDirection; localizeAutomaticPlayerNames(); state.grade = currentGrade(state.direction); renderSetup("", "[data-duel-direction][aria-pressed='true']"); return;
    }
    const grade = event.target.closest?.("[data-duel-grade]");
    if (grade) { syncSetupNames(); state.grade = grade.dataset.duelGrade; renderSetup("", "[data-duel-grade][aria-pressed='true']"); return; }
    const mode = event.target.closest?.("[data-duel-mode]");
    if (mode && MODE_IDS.has(mode.dataset.duelMode)) {
      syncSetupNames(); state.mode = mode.dataset.duelMode; writeStorage("huilaishi-battle-mode-v1", state.mode); renderSetup("", "[data-duel-mode][aria-pressed='true']"); return;
    }
    const actionNode = event.target.closest?.("[data-duel-action]");
    if (actionNode?.disabled || actionNode?.getAttribute?.("aria-disabled") === "true") return;
    const action = actionNode?.dataset.duelAction;
    if (action === "start") startMatch();
    if (action === "reveal") startTurn();
    if (action === "audio" && state.phase !== "preroll") playQuestionAudio();
    if (action === "next") nextRound();
    if (action === "rematch") { state.startingPlayer = 1 - state.startingPlayer; startMatch(); }
    if (action === "settings") { state.startingPlayer = 0; renderSetup(); }
    if (action === "close") API.close();
  }

  function handleInput(event) {
    const index = Number(event.target?.dataset?.duelName);
    if (!Number.isInteger(index) || !state.players[index]) return;
    state.players[index].name = String(event.target.value || "").slice(0, 18);
  }

  function forfeitActiveTurn() {
    if (!['preroll', 'question'].includes(state.phase)) return;
    stopTimer(); stopAudio();
    if (state.phase === "preroll") state.phase = "question";
    state.remainingMs = 0;
    state.questionStartedAt = Date.now() - turnMs();
    answerQuestion(-1, true);
  }

  function coverActiveTurn() {
    if (!host || host.hidden) return;
    // A revealed question must never receive a fresh timer after an app switch.
    // Treat leaving the foreground as a timeout so neither player can preview a
    // prompt or listen to part of the audio and then reset the same round.
    if (["preroll", "question"].includes(state.phase)) forfeitActiveTurn();
    else { stopTimer(); stopAudio(); }
  }

  function handleVisibilityChange() {
    if (root.document?.hidden) coverActiveTurn();
  }

  function handlePageShow(event) {
    if (event?.persisted && ["preroll", "question"].includes(state.phase)) forfeitActiveTurn();
  }

  function handleKeydown(event) {
    if (event.key === "Escape") { event.preventDefault(); API.close(); return; }
    if (event.key === "Tab") {
      const focusable = [...(host?.querySelectorAll?.("button:not(:disabled), input:not(:disabled), [tabindex='0']") || [])]
        .filter(node => node.getClientRects?.().length || node === root.document?.activeElement);
      if (focusable.length) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && root.document?.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && root.document?.activeElement === last) { event.preventDefault(); first.focus(); }
      }
      return;
    }
    if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
    if (event.target?.matches?.("input, textarea, select, [contenteditable='true']")) return;
    const key = String(event.key || "").toUpperCase();
    if (state.phase === "question") {
      const byLetter = ["A", "B", "C", "D", "E"].indexOf(key);
      const byNumber = /^[1-5]$/.test(key) ? Number(key) - 1 : -1;
      const index = byLetter >= 0 ? byLetter : byNumber;
      if (index >= 0 && index < state.questions[state.round].options.length) { event.preventDefault(); answerQuestion(index); return; }
      if (key === "R" && state.questions[state.round]?.audio) { event.preventDefault(); playQuestionAudio(); }
      return;
    }
    if (state.phase === "handoff" && (key === "ENTER" || key === " ")) { event.preventDefault(); startTurn(); return; }
    if (state.phase === "feedback" && (key === "ENTER" || key === "N")) { event.preventDefault(); nextRound(); }
  }

  const API = {
    init(config = {}) {
      API.destroy();
      options = { ...config };
      host = typeof config.root === "string" ? root.document?.querySelector?.(config.root) : config.root;
      if (!host) throw new Error("HUILAISHI_LOCAL_BATTLE.init requires a valid root element or selector");
      state.direction = currentDirection();
      state.grade = currentGrade(state.direction);
      state.mode = currentBattleMode();
      state.startingPlayer = Number(config.startingPlayer) === 1 ? 1 : 0;
      state.players[0].name = String(config.players?.[0] || defaultPlayerName(0)).slice(0, 18);
      state.players[1].name = String(config.players?.[1] || defaultPlayerName(1)).slice(0, 18);
      host.classList.add("hls-duel-host");
      host.setAttribute("role", "dialog");
      host.setAttribute("aria-modal", "true");
      host.setAttribute("aria-labelledby", "hls-duel-title");
      host.setAttribute("data-speech-policy", "none");
      host.removeAttribute("aria-hidden");
      host.hidden = false;
      host.addEventListener("click", handleClick);
      host.addEventListener("input", handleInput);
      host.addEventListener("keydown", handleKeydown);
      root.document?.addEventListener?.("visibilitychange", handleVisibilityChange);
      root.addEventListener?.("pagehide", coverActiveTurn);
      root.addEventListener?.("pageshow", handlePageShow);
      renderSetup();
      return API;
    },
    open(config = {}) {
      if (!host) return API.init(config);
      options = { ...options, ...config };
      state.direction = DIRECTIONS.includes(config.direction) ? config.direction : currentDirection();
      localizeAutomaticPlayerNames();
      state.grade = GRADES.includes(config.grade) ? config.grade : currentGrade(state.direction);
      state.mode = MODE_IDS.has(config.mode) ? config.mode : currentBattleMode();
      state.startingPlayer = Number(config.startingPlayer) === 1 ? 1 : 0;
      host.removeAttribute("aria-hidden");
      host.hidden = false;
      renderSetup();
      return API;
    },
    start(config = {}) {
      if (!host) throw new Error("Initialize HUILAISHI_LOCAL_BATTLE before start");
      if (DIRECTIONS.includes(config.direction)) state.direction = config.direction;
      if (GRADES.includes(config.grade)) state.grade = config.grade;
      if (MODE_IDS.has(config.mode)) state.mode = config.mode;
      if (Array.isArray(config.players)) config.players.slice(0, 2).forEach((name, index) => { state.players[index].name = String(name || playerName(index)).slice(0, 18); });
      return startMatch();
    },
    close(config = {}) {
      const force = config === true || config?.force === true;
      if (!confirmMatchExit(force)) return false;
      stopTimer(); stopAudio();
      if (host) { host.hidden = true; host.setAttribute("aria-hidden", "true"); }
      state.phase = "closed";
      try { options.onClose?.(publicState()); } catch (_) {}
      return true;
    },
    destroy() {
      stopTimer(); stopAudio();
      root.document?.removeEventListener?.("visibilitychange", handleVisibilityChange);
      root.removeEventListener?.("pagehide", coverActiveTurn);
      root.removeEventListener?.("pageshow", handlePageShow);
      if (host) {
        host.removeEventListener("click", handleClick);
        host.removeEventListener("input", handleInput);
        host.removeEventListener("keydown", handleKeydown);
        host.classList.remove("hls-duel-host");
        host.innerHTML = "";
      }
      host = null;
      state.phase = "idle";
      return API;
    },
    getState: publicState,
    inspect() {
      return {
        directions: [...DIRECTIONS], grades: [...GRADES], rounds: totalRounds(), turnMs: turnMs(), mode: state.mode,
        modes: Object.values(BATTLE_MODES).map(config => ({ id: config.id, rounds: config.rounds, turnMs: config.turnMs, counts: { ...config.counts } })),
        wordCount: corpus().length, registerPackCount: validRegisterPacks().length, questionTypes: [...QUESTION_TYPES], matchSerial
      };
    }
  };

  if (root.__HUILAISHI_TEST__) {
    API.__test = Object.freeze({
      buildQuestions({ direction = state.direction, grade = state.grade, mode = state.mode } = {}) {
        const previousDirection = state.direction;
        const previousGrade = state.grade;
        const previousMode = state.mode;
        state.direction = DIRECTIONS.includes(direction) ? direction : previousDirection;
        state.grade = GRADES.includes(grade) ? grade : previousGrade;
        state.mode = MODE_IDS.has(mode) ? mode : previousMode;
        try { return buildQuestionBank(); }
        finally { state.direction = previousDirection; state.grade = previousGrade; state.mode = previousMode; }
      },
      s1Source(packId, direction = state.direction) {
        const language = direction === "th-zh" ? "zh" : "th";
        const key = `s1-${packId}-${language}`;
        return root.SUGAR_AUDIO?.[key] || `assets/audio/sugarblade-${key}.mp3`;
      },
      recordSummary(name) {
        return battleRecordSummary(name);
      },
      constants: Object.freeze({
        totalRounds: BATTLE_MODES[DEFAULT_MODE].rounds,
        turnMs: BATTLE_MODES[DEFAULT_MODE].turnMs,
        defaultMode: DEFAULT_MODE,
        modes: Object.values(BATTLE_MODES).map(config => ({ id: config.id, rounds: config.rounds, turnMs: config.turnMs, counts: { ...config.counts } })),
        questionTypes: [...QUESTION_TYPES]
      })
    });
  }

  root.HUILAISHI_LOCAL_BATTLE = API;
})(typeof window !== "undefined" ? window : globalThis);
