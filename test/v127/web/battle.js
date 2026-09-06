(function (root) {
  "use strict";

  const GRADES = ["S5", "S4", "S3", "S2", "S1"];
  const DIRECTIONS = ["zh-th", "th-zh"];
  const QUESTION_TYPES = ["meaning", "listen", "tone"];
  const ALL_QUESTION_TYPES = ["voice", ...QUESTION_TYPES];
  const DEFAULT_MODE = "voice";
  const BATTLE_PREF_VERSION = "voice-battle-v1";
  const BATTLE_MODES = Object.freeze({
    voice: Object.freeze({ id: "voice", rounds: 8, turnMs: 15000, voice: true, counts: Object.freeze({ meaning: 0, listen: 0, tone: 0 }) }),
    standard: Object.freeze({ id: "standard", rounds: 12, turnMs: 12000, counts: Object.freeze({ meaning: 2, listen: 2, tone: 2 }) }),
    blitz: Object.freeze({ id: "blitz", rounds: 8, turnMs: 8000, counts: Object.freeze({ meaning: 1, listen: 1, tone: 2 }) }),
    register: Object.freeze({ id: "register", rounds: 12, turnMs: 10000, counts: Object.freeze({ meaning: 1, listen: 2, tone: 3 }) })
  });
  const MODE_IDS = new Set(Object.keys(BATTLE_MODES));
  const COMMERCE_FREE_MODES = new Set(["voice", "standard"]);
  const canUseMode = mode => root.SawadeekaCommerce?.canAccess?.(`duel:${mode}`) !== false;
  function requestPremiumMode(mode) {
    root.SawadeekaCommerce?.openPaywall?.(`duel:${mode}`);
  }
  const MODE_TO_GRADE = ["S5", "S4", "S3", "S2", "S1"];
  const TONE_BOUNDARIES = {
    S5: ["S4"],
    S4: ["S5", "S3"],
    S3: ["S4"],
    S2: ["S3"],
    S1: ["S2"]
  };
  const GRADE_LABELS = {
    zh: { S5: "正式体面", S4: "日常礼貌", S3: "熟人随口", S2: "直接表达", S1: "冲突降级" },
    th: { S5: "สุภาพเป็นทางการ", S4: "สุภาพในชีวิตประจำวัน", S3: "กันเอง", S2: "พูดตรง", S1: "คลี่คลายความขัดแย้ง" }
  };
  const COPY = {
    zh: {
      eyebrow: "面对面 · 同机对战", title: "抢麦开打，说对就攻击", subtitle: "推荐开口格斗：两个人抢同一个词，谁先抢到麦并说对，谁就发动攻击；其他轮流玩法仍可选择。",
      direction: "玩家 A 学习方向", opposite: "玩家 B 自动学习相反方向", grade: "本局场景语气", mode: "本局玩法", current: "沿用当前", playerA: "玩家 A", playerB: "玩家 B", nameA: "玩家 A 名称", nameB: "玩家 B 名称",
      modeNames: { voice: "开口格斗", standard: "均衡赛", blitz: "闪电赛", register: "语气擂台" },
      modeDescriptions: { voice: "8 回合 · 抢麦说词 · 生命值对战", standard: "12 回合 · 三类题均衡", blitz: "8 回合 · 8 秒快答", register: "12 回合 · 语气题加量" },
      start: rounds => `开始 ${rounds} 回合对战`, close: "关闭双人对战", rules: counts => `词义 × ${counts.meaning * 2} · 听音 × ${counts.listen * 2} · 语气 × ${counts.tone * 2}`, safety: "五档都只使用可安全练习的表达。", boundaryRule: "语气题同时覆盖当前档与相邻边界；S2 练直接边界，S1 练冲突降级。对战统一使用内置学习示范音；听音题固定 100 分，只比准确。", backgroundRule: "公平规则：答题或播放示范音时切到后台，本回合按超时处理。",
      handoff: "把手机交给", hidden: "题目已遮住", ready: name => `${name}，准备抢分`, turn: name => `${name} 的回合`, round: (n, total) => `第 ${n}/${total} 回合`,
      meaningType: "中泰词义", meaningPrompt: value => `“${value}”对应哪一个？`, listenType: "听音辨义", listenPrompt: grade => `听 ${grade} 档表达，选出它的意思`,
      toneType: "语气雷达", tonePrompt: "结合人物关系与场景，判断这句话属于哪一档", replay: "再听一次", seconds: value => `${value} 秒`, listenStarting: seconds => `示范音播完后开始 ${seconds} 秒计时`, listenFallbackType: "文字替补题",
      correct: "命中！", wrong: "这题失分", timeout: "时间到", answer: "正确答案", speed: value => `速度加成 ${value}`, listenNoSpeed: "听音题只计准确", points: value => `+${value} 分`,
      passNext: name => `交给 ${name}`, result: "对战结果", tie: "平局！再来一局分胜负", wins: name => `${name} 获胜`, accuracy: "正确率", avg: "平均用时", streak: "最长连击", rematch: rounds => `交换先手，再战 ${rounds} 回合`, settings: "返回设置",
      badgePerfect: "全题命中", badgeRadar: "语气雷达", badgeFast: "闪电反应", records: "本机战绩", recordLine: (matches, wins, winRate) => `${matches} 局 · ${wins} 胜 · 胜率 ${winRate}%`, noRecords: "本机还没有历史对局",
      leaveConfirm: "当前对战还没结束，退出会丢失本局进度。确定退出吗？",
      accessChanged: "完整版权益已更新，本局已停止。可恢复购买，或选择免费玩法重新开始。",
      dataError: "真实词库或场景语气内容尚未加载完整，暂时不能开局。", audioError: "当前学习示范音无法播放。", audioUnavailable: "当前示范音无法播放。", audioTextFallback: "固定示范音不可用，已显示文字；本题不计算速度加成。", review: "词汇、译义和固定示范音仍待母语教师终审；对战用于练习，不作发音认证。",
      zhTh: "中文 → ไทย", thZh: "ไทย → 中文", learnsThai: "学泰语", learnsChinese: "学中文", focus: grade => `${grade} 重点`, vocabFocus: "核心词汇", toneFocus: grade => `${grade} + 相邻边界`, noAnswer: "未作答",
      voiceDirection: "双方共同抢说方向", voiceSameDirection: "两个人看同一提示、说同一目标语言", voiceRules: rounds => `${rounds} 个词 · 初始生命 100 · 识别命中后攻击 · 未命中反伤`, voiceStart: rounds => `检查麦克风并开始 ${rounds} 回合`, voiceNote: "开口格斗只使用普通词汇和安全表达。设备只比较最终第一候选转写与目标词；文字匹配度达到 78 才命中，不等于声调、音素或母语发音认证。",
      voicePreflightTitle: "先检查这台手机", voicePreflightChecking: "正在检查本地识别与麦克风…", voicePreflightLocalMissing: "这台设备没有可用的本地识别包。可以明确允许本局使用系统联网识别，或改玩不需要麦克风的均衡赛。", voicePreflightDenied: "麦克风权限未开启。请在浏览器或系统设置中允许后重试，也可以改玩均衡赛。", voicePreflightMissing: "没有检测到可用麦克风。可以连接麦克风后重试，或改玩均衡赛。", voicePreflightBusy: "麦克风正被其他应用占用。关闭占用后重试，或改玩均衡赛。", voicePreflightUnavailable: "当前浏览器无法进行语音识别。请使用 HTTPS 的 Chrome 或 Safari，或改玩均衡赛。", voicePreflightNetwork: "允许本局联网识别", voicePreflightRetry: "重新检查麦克风", voicePreflightFallback: "改玩均衡赛",
      voiceRound: (n, total) => `第 ${n}/${total} 词`, voicePromptThai: "看中文，抢说泰语", voicePromptChinese: "ดูภาษาไทย แล้วรีบพูดภาษาจีน", voiceReady: "两边都可以抢麦；先点到的人先回答", voiceReadyTitle: "两位都看好屏幕了吗？", voiceReadyCopy: "点开始后才会显示题目并启动倒计时；进入页面和准备麦克风都不扣时间。", voiceReadyStart: "揭题，开始抢麦", voiceBuzz: name => `${name} 抢麦`, voiceListening: name => `正在听 ${name}…`, voiceMissed: "转写未命中 · 等待反击", voiceNetwork: "允许本次联网识别", voiceLocalMissing: "本机没有离线识别包；可允许系统语音服务联网识别本次抢答。", voiceUnavailable: "这台设备不能进行语音识别，请使用 Chrome 或 Safari 的 HTTPS 版本。", voiceHeard: value => `设备转写：${value}`, voiceHit: (name, damage) => `${name} 识别命中！造成 ${damage} 伤害`, voiceRecoil: (name, damage) => `${name} 转写未命中，反伤 ${damage}`, voiceBothMiss: "双方转写都未命中，本词未造成攻击", voiceTimeout: "倒计时结束，本词无人命中", voiceAnswer: "目标词", voiceNext: "下一词继续开打", voiceKO: "击倒！查看战果", health: "生命"
    },
    th: {
      eyebrow: "PASS & PLAY · เล่นสองคน", title: "แย่งไมค์ พูดถูกแล้วโจมตี", subtitle: "แนะนำโหมดดวลพูด ทั้งสองคนแย่งตอบคำเดียวกัน คนที่กดแย่งไมค์ก่อนและพูดถูกจะโจมตี อีกสามโหมดยังเลือกได้",
      direction: "ทิศทางของผู้เล่น A", opposite: "ผู้เล่น B เรียนอีกทิศทางโดยอัตโนมัติ", grade: "ระดับภาษารอบนี้", mode: "รูปแบบการแข่งขัน", current: "ใช้ค่าปัจจุบัน", playerA: "ผู้เล่น A", playerB: "ผู้เล่น B", nameA: "ชื่อผู้เล่น A", nameB: "ชื่อผู้เล่น B",
      modeNames: { voice: "ดวลพูด", standard: "รอบสมดุล", blitz: "ดวลสายฟ้า", register: "เวทีระดับภาษา" },
      modeDescriptions: { voice: "8 รอบ · แย่งไมค์ · สู้ด้วยพลังชีวิต", standard: "12 รอบ · ครบ 3 แบบ", blitz: "8 รอบ · 8 วินาที", register: "12 รอบ · เน้นระดับ" },
      start: rounds => `เริ่มแข่ง ${rounds} รอบ`, close: "ปิดเกมสองคน", rules: counts => `ความหมาย × ${counts.meaning * 2} · ฟังเสียง × ${counts.listen * 2} · ระดับภาษา × ${counts.tone * 2}`, safety: "ทั้งห้าระดับใช้ถ้อยคำที่ฝึกได้อย่างปลอดภัย", boundaryRule: "โจทย์ระดับภาษาครอบคลุมระดับที่เลือกและขอบเขตใกล้เคียง S2 ฝึกพูดตรงและตั้งขอบเขต ส่วน S1 ฝึกลดความขัดแย้ง ใช้เสียงตัวอย่างเพื่อเรียนชุดเดียวกัน และข้อฟังคิด 100 คะแนนจากความแม่นยำเท่านั้น", backgroundRule: "กติกาความยุติธรรม: หากสลับออกจากแอประหว่างโจทย์หรือเสียงตัวอย่าง รอบนั้นจะนับว่าหมดเวลา",
      handoff: "ส่งโทรศัพท์ให้", hidden: "ซ่อนคำถามไว้แล้ว", ready: name => `${name} พร้อมชิงคะแนน`, turn: name => `รอบของ ${name}`, round: (n, total) => `รอบ ${n}/${total}`,
      meaningType: "ความหมายจีน–ไทย", meaningPrompt: value => `“${value}” ตรงกับข้อใด`, listenType: "ฟังแล้วเลือกความหมาย", listenPrompt: grade => `ฟังสำนวนระดับ ${grade} แล้วเลือกความหมาย`,
      toneType: "เรดาร์ระดับภาษา", tonePrompt: "ดูความสัมพันธ์และสถานการณ์ แล้วเลือกระดับภาษาของประโยคนี้", replay: "ฟังอีกครั้ง", seconds: value => `${value} วิ`, listenStarting: seconds => `เริ่มจับเวลา ${seconds} วินาทีหลังเสียงตัวอย่างจบ`, listenFallbackType: "โจทย์ข้อความสำรอง",
      correct: "ถูกต้อง!", wrong: "ข้อนี้ไม่ได้คะแนน", timeout: "หมดเวลา", answer: "คำตอบที่ถูก", speed: value => `โบนัสความเร็ว ${value}`, listenNoSpeed: "ข้อฟังคิดเฉพาะความแม่นยำ", points: value => `+${value} คะแนน`,
      passNext: name => `ส่งให้ ${name}`, result: "ผลการแข่งขัน", tie: "เสมอกัน! เล่นอีกครั้งเพื่อตัดสิน", wins: name => `${name} ชนะ`, accuracy: "ความแม่นยำ", avg: "เวลาเฉลี่ย", streak: "คอมโบสูงสุด", rematch: rounds => `สลับคนเริ่ม แล้วแข่ง ${rounds} รอบ`, settings: "กลับไปตั้งค่า",
      badgePerfect: "ตอบถูกทุกข้อ", badgeRadar: "เรดาร์ระดับภาษา", badgeFast: "ตอบไว", records: "สถิติในเครื่อง", recordLine: (matches, wins, winRate) => `${matches} เกม · ชนะ ${wins} · อัตราชนะ ${winRate}%`, noRecords: "ยังไม่มีประวัติการแข่งขันในเครื่อง",
      leaveConfirm: "การแข่งขันยังไม่จบ หากออกตอนนี้ความคืบหน้ารอบนี้จะหายไป ต้องการออกหรือไม่",
      accessChanged: "สิทธิ์เวอร์ชันเต็มเปลี่ยนแล้ว เกมนี้หยุดลง สามารถกู้คืนการซื้อหรือเริ่มเกมฟรีใหม่ได้",
      dataError: "คลังคำหรือชุดระดับภาษายังโหลดไม่ครบ จึงเริ่มเกมไม่ได้", audioError: "ไม่สามารถเล่นเสียงตัวอย่างเพื่อเรียนได้", audioUnavailable: "ไม่สามารถเล่นเสียงตัวอย่างนี้ได้", audioTextFallback: "เสียงตัวอย่างแบบติดตั้งใช้ไม่ได้ จึงแสดงข้อความแทนและไม่นับโบนัสความเร็ว", review: "คำศัพท์ คำแปล และเสียงตัวอย่างแบบติดตั้งยังรอครูเจ้าของภาษาตรวจขั้นสุดท้าย เกมนี้ใช้เพื่อฝึก ไม่ใช่การรับรองการออกเสียง",
      zhTh: "中文 → ไทย", thZh: "ไทย → 中文", learnsThai: "เรียนไทย", learnsChinese: "เรียนจีน", focus: grade => `เน้น ${grade}`, vocabFocus: "คำศัพท์หลัก", toneFocus: grade => `${grade} + ขอบเขตใกล้เคียง`, noAnswer: "ไม่ได้ตอบ",
      voiceDirection: "ภาษาที่ทั้งสองคนต้องแย่งพูด", voiceSameDirection: "เห็นคำใบ้เดียวกันและพูดภาษาเป้าหมายเดียวกัน", voiceRules: rounds => `${rounds} คำ · พลังชีวิต 100 · ระบบรู้จำตรงจึงโจมตี · ไม่ตรงเสียพลัง`, voiceStart: rounds => `ตรวจไมค์แล้วเริ่ม ${rounds} รอบ`, voiceNote: "โหมดดวลพูดใช้เฉพาะคำทั่วไปและถ้อยคำที่ปลอดภัย ระบบเปรียบเทียบเฉพาะคำถอดเสียงอันดับแรกที่เป็นผลสุดท้ายกับคำเป้าหมาย ต้องตรงอย่างน้อย 78 คะแนน และไม่ใช่การรับรองวรรณยุกต์ หน่วยเสียง หรือสำเนียงเจ้าของภาษา",
      voicePreflightTitle: "ตรวจโทรศัพท์เครื่องนี้ก่อน", voicePreflightChecking: "กำลังตรวจการรู้จำในเครื่องและไมโครโฟน…", voicePreflightLocalMissing: "เครื่องนี้ไม่มีชุดรู้จำแบบออฟไลน์ สามารถอนุญาตการรู้จำออนไลน์ของระบบเฉพาะเกมนี้ หรือเปลี่ยนเป็นรอบสมดุลที่ไม่ใช้ไมค์", voicePreflightDenied: "ยังไม่ได้อนุญาตไมโครโฟน เปิดสิทธิ์ในเบราว์เซอร์หรือการตั้งค่าระบบแล้วลองใหม่ หรือเปลี่ยนเป็นรอบสมดุล", voicePreflightMissing: "ไม่พบไมโครโฟนที่ใช้งานได้ เชื่อมต่อไมค์แล้วลองใหม่ หรือเปลี่ยนเป็นรอบสมดุล", voicePreflightBusy: "ไมโครโฟนกำลังถูกแอปอื่นใช้งาน ปิดแอปนั้นแล้วลองใหม่ หรือเปลี่ยนเป็นรอบสมดุล", voicePreflightUnavailable: "เบราว์เซอร์นี้ใช้การรู้จำเสียงไม่ได้ โปรดใช้ Chrome หรือ Safari ผ่าน HTTPS หรือเปลี่ยนเป็นรอบสมดุล", voicePreflightNetwork: "อนุญาตรู้จำออนไลน์ในเกมนี้", voicePreflightRetry: "ตรวจไมโครโฟนอีกครั้ง", voicePreflightFallback: "เปลี่ยนเป็นรอบสมดุล",
      voiceRound: (n, total) => `คำที่ ${n}/${total}`, voicePromptThai: "ดูภาษาจีน แล้วรีบพูดภาษาไทย", voicePromptChinese: "ดูภาษาไทย แล้วรีบพูดภาษาจีน", voiceReady: "ทั้งสองฝ่ายแย่งไมค์ได้ คนที่แตะก่อนตอบก่อน", voiceReadyTitle: "ทั้งสองคนมองหน้าจอพร้อมหรือยัง?", voiceReadyCopy: "โจทย์และเวลาจะเริ่มหลังแตะปุ่มเท่านั้น เวลาที่ใช้เข้าหน้าจอหรือเตรียมไมค์จะไม่ถูกหัก", voiceReadyStart: "เปิดโจทย์และเริ่มแย่งไมค์", voiceBuzz: name => `${name} แย่งไมค์`, voiceListening: name => `กำลังฟัง ${name}…`, voiceMissed: "คำถอดเสียงไม่ตรง · รออีกฝ่ายสวนกลับ", voiceNetwork: "อนุญาตรู้จำออนไลน์ครั้งนี้", voiceLocalMissing: "เครื่องไม่มีชุดรู้จำออฟไลน์ อนุญาตบริการเสียงของระบบออนไลน์เฉพาะครั้งนี้ได้", voiceUnavailable: "อุปกรณ์นี้ใช้การรู้จำเสียงไม่ได้ โปรดใช้ Chrome หรือ Safari ผ่าน HTTPS", voiceHeard: value => `คำถอดเสียง: ${value}`, voiceHit: (name, damage) => `${name} ระบบรู้จำตรง! ทำดาเมจ ${damage}`, voiceRecoil: (name, damage) => `${name} คำถอดเสียงไม่ตรง เสียพลัง ${damage}`, voiceBothMiss: "คำถอดเสียงของทั้งสองฝ่ายไม่ตรง คำนี้ไม่มีการโจมตี", voiceTimeout: "หมดเวลา ยังไม่มีใครโจมตีโดน", voiceAnswer: "คำเป้าหมาย", voiceNext: "คำต่อไป", voiceKO: "น็อกเอาต์! ดูผล", health: "พลังชีวิต"
    }
  };

  let host = null;
  let options = {};
  let timerId = 0;
  let matchSerial = 0;
  let preflightSerial = 0;
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
    voiceMisses: [],
    voiceStatus: "",
    voiceTranscript: "",
    voiceNetworkPlayer: -1,
    voiceKnockout: false,
    voiceAttemptSerial: 0,
    voiceNetworkPermit: false,
    voicePreflight: null,
    voicePreparing: false,
    players: [
      { name: "玩家 A", score: 0, hp: 100, correct: 0, answered: 0, totalMs: 0, streak: 0, maxStreak: 0 },
      { name: "玩家 B", score: 0, hp: 100, correct: 0, answered: 0, totalMs: 0, streak: 0, maxStreak: 0 }
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
  const playerDirection = index => state.mode === "voice" ? state.direction : (index === 0 ? state.direction : oppositeDirection(state.direction));
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
    if (MODE_IDS.has(supplied) && canUseMode(supplied)) return supplied;
    if (readStorage("huilaishi-battle-mode-version") !== BATTLE_PREF_VERSION) return DEFAULT_MODE;
    return MODE_IDS.has(stored) && canUseMode(stored) ? stored : DEFAULT_MODE;
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
    // Competitive rounds use one shared source form so both players receive
    // the same prompt and scoring conditions.
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
      voiceLang: zhToTh ? "th-TH" : "zh-CN",
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

  function voiceQuestions(count, words, direction) {
    const savedLevel = Number(readStorage(`huilaishi-vocab-level-${direction}`) || 1);
    const levelWords = words.filter(word => Number(word.level) === savedLevel);
    const source = levelWords.length >= count ? levelWords : words;
    return shuffle(source).slice(0, count).map(word => {
      const view = wordSide(word, direction);
      return {
        id: `voice:${direction}:${word.id}`,
        wordId: word.id,
        type: "voice",
        direction,
        prompt: view.source,
        promptLang: view.sourceLang,
        target: view.target,
        targetLang: view.targetLang,
        voiceLang: view.voiceLang,
        reading: view.reading
      };
    });
  }

  function buildQuestionBank() {
    const words = corpus();
    const config = modeConfig();
    if (config.voice) {
      if (words.length < config.rounds) throw new Error("battle-data-incomplete");
      const questions = voiceQuestions(config.rounds, words, state.direction);
      if (questions.length !== config.rounds) throw new Error("battle-question-build-failed");
      return questions;
    }
    const packs = validRegisterPacks();
    if (words.length < 16 || packs.length < 8) throw new Error("battle-data-incomplete");
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
  }

  function setAudioStatus(message, error = false) {
    const node = host?.querySelector?.("[data-duel-audio-status]");
    if (!node) return;
    node.textContent = message || "";
    node.dataset.state = error ? "error" : "ready";
  }

  function playQuestionAudio(callbacks = {}) {
    const question = state.questions[state.round];
    const audio = question?.audio;
    if (!audio) return false;
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
    const modeButtons = Object.values(BATTLE_MODES).map((mode, index) => `<button type="button" class="${mode.voice ? "is-featured" : ""}" data-duel-mode="${mode.id}" ${COMMERCE_FREE_MODES.has(mode.id) ? "" : `data-premium-feature="duel:${mode.id}"`} aria-pressed="${state.mode === mode.id}"><span>0${index + 1}</span><b>${esc(c.modeNames[mode.id])}</b><small>${esc(c.modeDescriptions[mode.id])}</small></button>`).join("");
    const recordSummary = battleRecordSummary();
    const recordMarkup = recordSummary.matches > 0
      ? `<div class="hls-duel-record-line"><span>${esc(c.records)}</span><b>${esc(c.recordLine(recordSummary.matches, recordSummary.wins, recordSummary.winRate))}</b></div>`
      : "";
    const directionLegend = config.voice ? c.voiceDirection : c.direction;
    const directionNote = config.voice ? `${c.voiceSameDirection} · ${directionLabel(state.direction)}` : `${c.opposite} · B ${directionLabel(oppositeDirection(state.direction))}`;
    const gradeField = config.voice ? "" : `<fieldset><legend>${esc(c.grade)}</legend><div class="hls-duel-grades">${gradeButtons}</div><small class="hls-duel-grade-selection"><b>${esc(state.grade)}</b> · ${esc(gradeLabel(state.grade))}</small></fieldset>`;
    const rules = config.voice ? c.voiceRules(config.rounds) : c.rules(config.counts);
    const startLabel = config.voice ? c.voiceStart(config.rounds) : c.start(config.rounds);
    const safetyNote = config.voice ? c.voiceNote : (state.grade === "S1" ? c.safety : "");
    const reviewNote = config.voice ? c.review : `${c.boundaryRule}<br>${c.backgroundRule}<br>${c.review}`;
    const preflight = config.voice ? state.voicePreflight : null;
    const preflightMarkup = preflight
      ? `<div class="hls-duel-preflight" data-duel-preflight data-kind="${esc(preflight.kind)}" role="status" tabindex="-1"><b>${esc(c.voicePreflightTitle)}</b><p>${esc(preflight.message)}</p></div>`
      : "";
    const actionMarkup = preflight
      ? `<button type="button" class="hls-duel-primary" data-duel-action="${preflight.kind === "consent" ? "preflight-network" : "preflight-retry"}">${esc(preflight.kind === "consent" ? c.voicePreflightNetwork : c.voicePreflightRetry)}</button><button type="button" class="hls-duel-secondary" data-duel-action="preflight-fallback">${esc(c.voicePreflightFallback)}</button>`
      : `<button type="button" class="hls-duel-primary" data-duel-action="start">${esc(startLabel)}</button>`;
    const content = `<div class="hls-duel-setup"><p class="hls-duel-subtitle">${esc(c.subtitle)}</p>${error ? `<div class="hls-duel-error" data-duel-error role="alert" tabindex="-1">${esc(error)}</div>` : ""}<fieldset><legend>${esc(c.mode)}</legend><div class="hls-duel-modes">${modeButtons}</div><div class="hls-duel-rule"><b>${config.rounds}</b><span>${esc(rules)}</span></div></fieldset><fieldset><legend>${esc(directionLegend)}</legend><div class="hls-duel-direction">${directionButtons}</div><small class="hls-duel-opposite">${esc(directionNote)}</small></fieldset>${gradeField}<div class="hls-duel-names"><label><span>A</span><input data-duel-name="0" maxlength="18" value="${esc(playerName(0))}" aria-label="${esc(c.nameA)}"></label><label><span>B</span><input data-duel-name="1" maxlength="18" value="${esc(playerName(1))}" aria-label="${esc(c.nameB)}"></label></div>${recordMarkup}${safetyNote ? `<p class="hls-duel-safety" role="note">${esc(safetyNote)}</p>` : ""}${preflightMarkup}<div class="hls-duel-setup-action ${preflight ? "is-split" : ""}">${actionMarkup}</div><p class="hls-duel-review" role="note">${reviewNote}</p></div>`;
    host.innerHTML = shell(content);
    const action = host.querySelector?.(".hls-duel-setup-action");
    const recordLine = host.querySelector?.(".hls-duel-record-line");
    if (action && recordLine) action.insertAdjacentElement?.("afterend", recordLine);
    if (preflight) {
      const revealPreflight = () => {
        const panel = host?.querySelector?.("[data-duel-preflight]");
        try { panel?.scrollIntoView?.({ block: "center", behavior: "auto" }); } catch (_) {}
        focusTarget("[data-duel-preflight]");
      };
      if (typeof root.requestAnimationFrame === "function") root.requestAnimationFrame(revealPreflight);
      else revealPreflight();
    } else focusTarget(focusSelector);
  }

  function scoreMarkup() {
    if (modeConfig().voice) {
      return `<div class="hls-duel-hp-board" aria-label="${esc(copy().voiceRound(state.round + 1, totalRounds()))}">${state.players.map((player, index) => `<div class="player-${index === 0 ? "a" : "b"} ${state.activePlayer === index ? "is-active" : ""}"><span><b>${index === 0 ? "A" : "B"}</b>${esc(player.name)}</span><div><i style="width:${Math.max(0, player.hp)}%"></i></div><strong>${Math.max(0, player.hp)} <small>HP</small></strong></div>`).join("")}</div>`;
    }
    return `<div class="hls-duel-scoreboard" aria-label="${esc(copy().round(state.round + 1, totalRounds()))}">${state.players.map((player, index) => `<div class="${state.activePlayer === index ? "is-active" : ""}"><span>${index === 0 ? "A" : "B"} · ${esc(player.name)} · ${esc(directionLabel(playerDirection(index)))}</span><b>${player.score}${player.streak >= 2 ? `<small aria-label="${esc(copy().streak)} ${player.streak}">×${player.streak}</small>` : ""}</b></div>`).join("")}</div>`;
  }

  function renderHandoff() {
    if (modeConfig().voice) return startVoiceRound();
    stopTimer(); stopAudio(); state.phase = "handoff";
    state.activePlayer = (state.startingPlayer + state.round) % 2;
    const c = copy(); const name = playerName(state.activePlayer);
    const content = `${scoreMarkup()}<div class="hls-duel-handoff"><div class="hls-duel-turn-token">${state.activePlayer === 0 ? "A" : "B"}</div><p>${esc(c.handoff)}</p><h3>${esc(name)}</h3><strong class="hls-duel-route">${esc(directionLabel(playerDirection(state.activePlayer)))}</strong><span>${esc(c.hidden)} · ${esc(c.round(state.round + 1, totalRounds()))}</span><button type="button" class="hls-duel-primary" data-duel-action="reveal">${esc(c.ready(name))}</button></div>`;
    host.innerHTML = shell(content);
    focusTarget("[data-duel-action='reveal']");
  }

  function renderVoiceRound(feedback = null) {
    const question = state.questions[state.round];
    if (!question) return finishMatch();
    const c = copy();
    if (state.phase === "voice-ready") {
      const content = `${scoreMarkup()}<div class="hls-duel-voice-arena is-ready"><div class="hls-duel-question-meta"><span>${esc(c.modeNames.voice)}</span><b>${esc(c.voiceRound(state.round + 1, totalRounds()))}</b></div><div class="hls-duel-timer" aria-hidden="true"><i data-duel-timer-fill style="width:100%"></i></div><div class="hls-duel-clock" data-duel-clock>${esc(c.seconds(turnSeconds()))}</div><div class="hls-duel-voice-ready"><span aria-hidden="true">A × B</span><h3>${esc(c.voiceReadyTitle)}</h3><p>${esc(c.voiceReadyCopy)}</p><button type="button" class="hls-duel-primary" data-duel-action="voice-go">${esc(c.voiceReadyStart)}</button></div></div>`;
      host.innerHTML = shell(content, "polite");
      focusTarget("[data-duel-action='voice-go']");
      return;
    }
    const listening = state.phase === "voice-listening";
    const finished = state.phase === "voice-feedback";
    const prompt = state.direction === "zh-th" ? c.voicePromptThai : c.voicePromptChinese;
    const fighters = state.players.map((player, index) => {
      const missed = state.voiceMisses.includes(index);
      const disabled = listening || finished || missed || state.voiceNetworkPlayer >= 0;
      const label = missed ? c.voiceMissed : c.voiceBuzz(player.name);
      return `<button type="button" class="hls-duel-voice-fighter fighter-${index === 0 ? "a" : "b"} ${state.activePlayer === index ? "is-active" : ""} ${missed ? "is-missed" : ""}" data-duel-voice="${index}" ${disabled ? "disabled" : ""}><span>${index === 0 ? "A" : "B"}</span><b>${esc(player.name)}</b><small>${esc(label)}</small><i aria-hidden="true">●</i></button>`;
    }).join("");
    const network = state.voiceNetworkPlayer >= 0 && !finished
      ? `<button type="button" class="hls-duel-voice-network" data-duel-action="voice-network" data-player="${state.voiceNetworkPlayer}">${esc(c.voiceNetwork)}</button>`
      : "";
    const feedbackMarkup = feedback ? `<div class="hls-duel-voice-impact ${feedback.correct ? "is-hit" : "is-miss"}" role="status"><strong>${esc(state.voiceStatus)}</strong><span>${esc(c.voiceAnswer)} · <b lang="${esc(question.targetLang)}">${esc(question.target)}</b></span>${question.reading ? `<small>${esc(question.reading)}</small>` : ""}${state.voiceTranscript ? `<em>${esc(c.voiceHeard(state.voiceTranscript))}</em>` : ""}</div><button type="button" class="hls-duel-primary" data-duel-action="next">${esc(state.voiceKnockout || state.round + 1 >= totalRounds() ? c.voiceKO : c.voiceNext)}</button>` : "";
    const clock = Math.max(0, Math.ceil(state.remainingMs / 1000));
    const content = `${scoreMarkup()}<div class="hls-duel-voice-arena ${listening ? "is-listening" : ""} ${feedback?.correct ? "is-hit" : ""}"><div class="hls-duel-question-meta"><span>${esc(c.modeNames.voice)}</span><b>${esc(c.voiceRound(state.round + 1, totalRounds()))}</b></div><div class="hls-duel-timer" aria-hidden="true"><i data-duel-timer-fill style="width:${finished ? 0 : state.remainingMs / turnMs() * 100}%"></i></div><div class="hls-duel-clock" data-duel-clock>${esc(c.seconds(clock))}</div><p class="hls-duel-voice-prompt">${esc(prompt)}</p><h3 lang="${esc(question.promptLang)}">${esc(question.prompt)}</h3><p class="hls-duel-voice-status" data-duel-voice-status role="status" aria-live="polite">${esc(state.voiceStatus || c.voiceReady)}</p>${feedback ? "" : `<div class="hls-duel-voice-fighters">${fighters}</div>${network}`}${feedbackMarkup}</div>`;
    host.innerHTML = shell(content, feedback ? "polite" : "off");
    if (feedback) focusTarget("[data-duel-action='next']");
    else if (state.voiceNetworkPlayer >= 0) focusTarget("[data-duel-action='voice-network']");
    else if (!listening) focusTarget("[data-duel-voice]:not(:disabled)");
  }

  function updateVoiceTimer() {
    if (state.phase !== "voice-question") return;
    const duration = turnMs();
    state.remainingMs = Math.max(0, duration - (Date.now() - state.questionStartedAt));
    const fill = host?.querySelector?.("[data-duel-timer-fill]");
    const clock = host?.querySelector?.("[data-duel-clock]");
    if (fill) fill.style.width = `${state.remainingMs / duration * 100}%`;
    if (clock) clock.textContent = copy().seconds(Math.ceil(state.remainingMs / 1000));
    if (state.remainingMs <= 0) settleVoiceTimeout();
  }

  function startVoiceRound() {
    stopTimer(); stopAudio();
    root.PronunciationScorer?.cancelChallenge?.();
    if (!state.questions[state.round]) return finishMatch();
    state.phase = "voice-ready";
    state.activePlayer = -1;
    state.voiceMisses = [];
    state.voiceStatus = "";
    state.voiceTranscript = "";
    state.voiceNetworkPlayer = -1;
    state.lastAnswer = null;
    state.remainingMs = turnMs();
    state.questionStartedAt = 0;
    renderVoiceRound();
  }

  function beginVoiceRound() {
    if (state.phase !== "voice-ready") return;
    state.phase = "voice-question";
    state.remainingMs = turnMs();
    state.questionStartedAt = Date.now();
    renderVoiceRound();
    timerId = setInterval(updateVoiceTimer, 100);
  }

  function resumeVoiceRound() {
    if (state.phase === "voice-feedback") return;
    state.phase = "voice-question";
    state.questionStartedAt = Date.now() - (turnMs() - state.remainingMs);
    renderVoiceRound();
    stopTimer();
    timerId = setInterval(updateVoiceTimer, 100);
  }

  function settleVoiceTimeout() {
    if (!["voice-question", "voice-listening"].includes(state.phase)) return;
    stopTimer();
    root.PronunciationScorer?.cancelChallenge?.();
    state.voiceAttemptSerial += 1;
    state.remainingMs = 0;
    state.voiceStatus = copy().voiceTimeout;
    state.lastAnswer = { correct: false, timedOut: true, points: 0, damage: 0 };
    state.roundResults.push({ round: state.round + 1, playerIndex: -1, type: "voice", correct: false, timedOut: true, elapsedMs: turnMs(), points: 0, damage: 0 });
    state.phase = "voice-feedback";
    renderVoiceRound(state.lastAnswer);
  }

  function finishVoiceAttempt(playerIndex, result, elapsedMs) {
    const c = copy();
    const player = state.players[playerIndex];
    const opponentIndex = 1 - playerIndex;
    const opponent = state.players[opponentIndex];
    state.voiceTranscript = result.transcript || "";
    player.answered += 1;
    player.totalMs += elapsedMs;
    if (result.passed) {
      const speedDamage = Math.round(10 * Math.max(0, state.remainingMs) / turnMs());
      const damage = Math.min(40, 24 + speedDamage + Math.min(6, player.streak * 2));
      player.correct += 1;
      player.streak += 1;
      player.maxStreak = Math.max(player.maxStreak, player.streak);
      player.score += damage * 10;
      opponent.hp = Math.max(0, opponent.hp - damage);
      state.activePlayer = playerIndex;
      state.voiceStatus = c.voiceHit(player.name, damage);
      state.voiceKnockout = opponent.hp <= 0;
      state.lastAnswer = { correct: true, playerIndex, score: result.score, damage, points: damage * 10, elapsedMs };
      state.roundResults.push({ round: state.round + 1, playerIndex, type: "voice", correct: true, timedOut: false, elapsedMs, points: damage * 10, damage, score: result.score });
      state.phase = "voice-feedback";
      renderVoiceRound(state.lastAnswer);
      try { root.navigator?.vibrate?.([18, 28, 35]); } catch (_) {}
      return;
    }
    const recoil = 8;
    player.hp = Math.max(0, player.hp - recoil);
    player.streak = 0;
    state.activePlayer = playerIndex;
    state.voiceMisses = [...new Set([...state.voiceMisses, playerIndex])];
    state.voiceStatus = c.voiceRecoil(player.name, recoil);
    state.roundResults.push({ round: state.round + 1, playerIndex, type: "voice", correct: false, timedOut: false, elapsedMs, points: 0, damage: -recoil, score: result.score || 0 });
    if (player.hp <= 0) {
      state.voiceKnockout = true;
      state.lastAnswer = { correct: false, playerIndex, recoil, score: result.score || 0, elapsedMs };
      state.phase = "voice-feedback";
      renderVoiceRound(state.lastAnswer);
      return;
    }
    if (state.voiceMisses.length >= 2) {
      state.voiceStatus = c.voiceBothMiss;
      state.lastAnswer = { correct: false, playerIndex, recoil, score: result.score || 0, elapsedMs };
      state.phase = "voice-feedback";
      renderVoiceRound(state.lastAnswer);
      return;
    }
    resumeVoiceRound();
    try { root.navigator?.vibrate?.([16, 40, 16]); } catch (_) {}
  }

  async function attemptVoiceAnswer(playerIndex, allowNetwork = false) {
    if (state.phase !== "voice-question" || ![0, 1].includes(playerIndex) || state.voiceMisses.includes(playerIndex)) return;
    const scorer = root.PronunciationScorer;
    const question = state.questions[state.round];
    if (!scorer?.recognizeTarget || !question?.target) {
      state.voiceStatus = copy().voiceUnavailable;
      renderVoiceRound();
      return;
    }
    const resumesConsent = allowNetwork && state.voiceNetworkPlayer === playerIndex;
    if (resumesConsent) state.questionStartedAt = Date.now() - (turnMs() - state.remainingMs);
    else updateVoiceTimer();
    if (state.phase !== "voice-question") return;
    stopTimer();
    const serial = ++state.voiceAttemptSerial;
    let startedAt = 0;
    state.phase = "voice-listening";
    state.activePlayer = playerIndex;
    state.voiceNetworkPlayer = -1;
    state.voiceStatus = copy().voiceListening(playerName(playerIndex));
    state.voiceTranscript = "";
    renderVoiceRound();
    const result = await scorer.recognizeTarget({
      target: question.target,
      lang: question.voiceLang,
      threshold: 78,
      maxMs: 7000,
      allowNetwork: allowNetwork || state.voiceNetworkPermit,
      onStatus: value => { if (value === "listening" && !startedAt) startedAt = Date.now(); }
    });
    if (serial !== state.voiceAttemptSerial || state.phase !== "voice-listening") return;
    const elapsedMs = startedAt ? Math.min(turnMs(), Math.max(0, Date.now() - startedAt)) : 0;
    if (["local-missing", "network-consent"].includes(result.status)) {
      state.voiceNetworkPlayer = playerIndex;
      state.voiceStatus = copy().voiceLocalMissing;
      state.phase = "voice-question";
      renderVoiceRound();
      return;
    }
    if (["none", "insecure", "start-failed", "not-allowed", "service-not-allowed"].includes(result.status)) {
      state.voiceStatus = copy().voiceUnavailable;
      resumeVoiceRound();
      return;
    }
    finishVoiceAttempt(playerIndex, result, elapsedMs);
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
    if (state.phase === "voice-feedback") {
      if (state.voiceKnockout || state.round + 1 >= totalRounds()) return finishMatch();
      state.round += 1;
      state.lastAnswer = null;
      startVoiceRound();
      return;
    }
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
    stopTimer(); stopAudio(); root.PronunciationScorer?.cancelChallenge?.(); state.voiceAttemptSerial += 1; state.phase = "result";
    const c = copy();
    const [first, second] = state.players;
    const winner = modeConfig().voice
      ? (first.hp === second.hp ? (first.score === second.score ? -1 : (first.score > second.score ? 0 : 1)) : (first.hp > second.hp ? 0 : 1))
      : (first.score === second.score ? -1 : (first.score > second.score ? 0 : 1));
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
      return `<article class="${winner === index ? "is-winner" : ""}"><span>${index === 0 ? "A" : "B"}</span><h3>${esc(player.name)}</h3><strong>${modeConfig().voice ? `${Math.max(0, player.hp)} HP` : player.score}</strong><div class="hls-duel-metrics"><b>${stat.accuracy}%</b><small>${esc(c.accuracy)}</small><b>${stat.average}s</b><small>${esc(c.avg)}</small><b>×${player.maxStreak}</b><small>${esc(c.streak)}</small></div>${badges ? `<div class="hls-duel-badges">${badges}</div>` : ""}${recordMarkup}</article>`;
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
      player.score = 0; player.hp = 100; player.correct = 0; player.answered = 0; player.totalMs = 0; player.streak = 0; player.maxStreak = 0;
    });
  }

  function preflightMessage(status, c = copy()) {
    if (["local-missing", "network-consent"].includes(status)) return c.voicePreflightLocalMissing;
    if (status === "not-allowed") return c.voicePreflightDenied;
    if (status === "microphone-missing") return c.voicePreflightMissing;
    if (status === "microphone-busy") return c.voicePreflightBusy;
    return c.voicePreflightUnavailable;
  }

  function clearVoicePreflight() {
    preflightSerial += 1;
    state.voicePreparing = false;
    state.voicePreflight = null;
    state.voiceNetworkPermit = false;
  }

  async function prepareVoiceMatch(allowNetwork = false) {
    if (!modeConfig().voice) return startMatch();
    if (state.voicePreparing) return false;
    syncSetupNames();
    const scorer = root.PronunciationScorer;
    if (!scorer?.prepareChallenge) {
      state.voicePreflight = { kind: "error", status: "none", message: copy().voicePreflightUnavailable };
      renderSetup("", "[data-duel-action='preflight-retry']");
      return false;
    }
    const serial = ++preflightSerial;
    const preparedDirection = state.direction;
    state.voicePreparing = true;
    const action = host?.querySelector?.("[data-duel-action='start'], [data-duel-action='preflight-network'], [data-duel-action='preflight-retry']");
    if (action) {
      action.disabled = true;
      action.setAttribute("aria-busy", "true");
      action.textContent = copy().voicePreflightChecking;
    }
    let result;
    try {
      result = await scorer.prepareChallenge({
        lang: preparedDirection === "zh-th" ? "th-TH" : "zh-CN",
        allowNetwork,
        requestMicrophone: true
      });
    } catch (_) {
      result = { ready: false, status: "microphone-error", mode: "none" };
    }
    if (serial !== preflightSerial || state.phase !== "setup" || state.direction !== preparedDirection || !modeConfig().voice) return false;
    state.voicePreparing = false;
    if (result?.ready) {
      state.voicePreflight = null;
      state.voiceNetworkPermit = result.mode === "network";
      return startMatch();
    }
    const status = String(result?.status || "none");
    state.voiceNetworkPermit = false;
    state.voicePreflight = {
      kind: ["local-missing", "network-consent"].includes(status) ? "consent" : "error",
      status,
      message: preflightMessage(status)
    };
    renderSetup("", `[data-duel-action='${state.voicePreflight.kind === "consent" ? "preflight-network" : "preflight-retry"}']`);
    return false;
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
    state.voiceMisses = [];
    state.voiceStatus = "";
    state.voiceTranscript = "";
    state.voiceNetworkPlayer = -1;
    state.voiceKnockout = false;
    state.voiceAttemptSerial += 1;
    matchSerial += 1;
    if (modeConfig().voice) startVoiceRound(); else renderHandoff();
    return true;
  }

  function matchInProgress() {
    return ["handoff", "preroll", "question", "feedback", "voice-ready", "voice-question", "voice-listening", "voice-feedback"].includes(state.phase);
  }

  function confirmMatchExit(force = false) {
    if (force || !matchInProgress()) return true;
    try { return typeof root.confirm === "function" && root.confirm(copy().leaveConfirm); }
    catch (_) { return false; }
  }

  function handleClick(event) {
    // Most actions redraw this host synchronously. Stop here so the global
    // tap-to-speak listener never receives a now-detached target and mistakes
    // battle text for standard page narration.
    event.stopPropagation?.();
    const voice = event.target.closest?.("[data-duel-voice]");
    if (voice && !voice.disabled) { attemptVoiceAnswer(Number(voice.dataset.duelVoice)); return; }
    const answer = event.target.closest?.("[data-duel-answer]");
    if (answer && !answer.disabled) { answerQuestion(Number(answer.dataset.duelAnswer)); return; }
    const direction = event.target.closest?.("[data-duel-direction]");
    if (direction) {
      syncSetupNames(); clearVoicePreflight(); state.direction = direction.dataset.duelDirection; localizeAutomaticPlayerNames(); state.grade = currentGrade(state.direction); renderSetup("", "[data-duel-direction][aria-pressed='true']"); return;
    }
    const grade = event.target.closest?.("[data-duel-grade]");
    if (grade) { syncSetupNames(); state.grade = grade.dataset.duelGrade; renderSetup("", "[data-duel-grade][aria-pressed='true']"); return; }
    const mode = event.target.closest?.("[data-duel-mode]");
    if (mode && MODE_IDS.has(mode.dataset.duelMode)) {
      if (!canUseMode(mode.dataset.duelMode)) { requestPremiumMode(mode.dataset.duelMode); return; }
      syncSetupNames(); clearVoicePreflight(); state.mode = mode.dataset.duelMode; writeStorage("huilaishi-battle-mode-v1", state.mode); writeStorage("huilaishi-battle-mode-version", BATTLE_PREF_VERSION); renderSetup("", "[data-duel-mode][aria-pressed='true']"); return;
    }
    const actionNode = event.target.closest?.("[data-duel-action]");
    if (actionNode?.disabled || actionNode?.getAttribute?.("aria-disabled") === "true") return;
    const action = actionNode?.dataset.duelAction;
    if (action === "start") { if (modeConfig().voice) void prepareVoiceMatch(false); else startMatch(); }
    if (action === "preflight-network") void prepareVoiceMatch(true);
    if (action === "preflight-retry") void prepareVoiceMatch(false);
    if (action === "preflight-fallback") {
      clearVoicePreflight();
      state.mode = "standard";
      writeStorage("huilaishi-battle-mode-v1", state.mode);
      writeStorage("huilaishi-battle-mode-version", BATTLE_PREF_VERSION);
      renderSetup("", "[data-duel-mode='standard']");
    }
    if (action === "reveal") startTurn();
    if (action === "voice-go") beginVoiceRound();
    if (action === "audio" && state.phase !== "preroll") playQuestionAudio();
    if (action === "voice-network") attemptVoiceAnswer(Number(actionNode.dataset.player), true);
    if (action === "next") nextRound();
    if (action === "rematch") { state.startingPlayer = 1 - state.startingPlayer; startMatch(); }
    if (action === "settings") { state.startingPlayer = 0; clearVoicePreflight(); renderSetup(); }
    if (action === "close") API.close();
  }

  function handleInput(event) {
    const index = Number(event.target?.dataset?.duelName);
    if (!Number.isInteger(index) || !state.players[index]) return;
    state.players[index].name = String(event.target.value || "").slice(0, 18);
  }

  function forfeitActiveTurn() {
    if (["voice-question", "voice-listening"].includes(state.phase)) { settleVoiceTimeout(); return; }
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
    if (["preroll", "question", "voice-question", "voice-listening"].includes(state.phase)) forfeitActiveTurn();
    else { stopTimer(); stopAudio(); }
  }

  function handleVisibilityChange() {
    if (root.document?.hidden) coverActiveTurn();
  }

  function handlePageShow(event) {
    if (event?.persisted && ["preroll", "question", "voice-question", "voice-listening"].includes(state.phase)) forfeitActiveTurn();
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
    if (state.phase === "voice-question" && (key === "A" || key === "B")) {
      event.preventDefault(); attemptVoiceAnswer(key === "A" ? 0 : 1); return;
    }
    if (state.phase === "voice-ready" && (key === "ENTER" || key === " ")) { event.preventDefault(); beginVoiceRound(); return; }
    if (state.phase === "voice-feedback" && (key === "ENTER" || key === "N")) { event.preventDefault(); nextRound(); return; }
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

  function handleEntitlementChange() {
    if (canUseMode(state.mode)) return;
    const wasOpen = host && !["closed", "idle"].includes(state.phase);
    stopTimer(); stopAudio();
    root.PronunciationScorer?.cancelChallenge?.();
    state.voiceAttemptSerial += 1;
    clearVoicePreflight();
    state.questions = [];
    state.mode = DEFAULT_MODE;
    writeStorage("huilaishi-battle-mode-v1", state.mode);
    if (wasOpen) renderSetup(copyForDirection(state.direction).accessChanged, "[data-duel-error]");
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
      clearVoicePreflight();
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
      root.document?.addEventListener?.("sawadeeka:entitlement-change", handleEntitlementChange);
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
      state.mode = MODE_IDS.has(config.mode) && canUseMode(config.mode) ? config.mode : currentBattleMode();
      clearVoicePreflight();
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
      if (MODE_IDS.has(config.mode)) {
        if (!canUseMode(config.mode)) { requestPremiumMode(config.mode); return false; }
        state.mode = config.mode;
      }
      if (!canUseMode(state.mode)) { requestPremiumMode(state.mode); return false; }
      if (Array.isArray(config.players)) config.players.slice(0, 2).forEach((name, index) => { state.players[index].name = String(name || playerName(index)).slice(0, 18); });
      return modeConfig().voice ? prepareVoiceMatch(Boolean(config.allowNetwork)) : startMatch();
    },
    close(config = {}) {
      const force = config === true || config?.force === true;
      if (!confirmMatchExit(force)) return false;
      stopTimer(); stopAudio(); root.PronunciationScorer?.cancelChallenge?.(); state.voiceAttemptSerial += 1; clearVoicePreflight();
      if (host) { host.hidden = true; host.setAttribute("aria-hidden", "true"); }
      state.phase = "closed";
      try { options.onClose?.(publicState()); } catch (_) {}
      return true;
    },
    destroy() {
      stopTimer(); stopAudio(); root.PronunciationScorer?.cancelChallenge?.(); state.voiceAttemptSerial += 1; clearVoicePreflight();
      root.document?.removeEventListener?.("visibilitychange", handleVisibilityChange);
      root.document?.removeEventListener?.("sawadeeka:entitlement-change", handleEntitlementChange);
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
        wordCount: corpus().length, registerPackCount: validRegisterPacks().length, questionTypes: [...ALL_QUESTION_TYPES], matchSerial
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
      recordSummary(name) {
        return battleRecordSummary(name);
      },
      constants: Object.freeze({
        totalRounds: BATTLE_MODES[DEFAULT_MODE].rounds,
        turnMs: BATTLE_MODES[DEFAULT_MODE].turnMs,
        defaultMode: DEFAULT_MODE,
        modes: Object.values(BATTLE_MODES).map(config => ({ id: config.id, rounds: config.rounds, turnMs: config.turnMs, counts: { ...config.counts } })),
        questionTypes: [...ALL_QUESTION_TYPES]
      })
    });
  }

  root.HUILAISHI_LOCAL_BATTLE = API;
})(typeof window !== "undefined" ? window : globalThis);
