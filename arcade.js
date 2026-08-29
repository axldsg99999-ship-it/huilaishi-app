(function () {
  "use strict";

  const GRADES = ["S5", "S4", "S3", "S2", "S1"];
  const REGISTER_GAMES = new Set(["tone", "polish", "grade-lock", "scene-listen", "register-shift"]);
  const MONSTER_TURN_MS = 10000;
  const MONSTER_PLAYER_MAX_HP = 100;
  const MONSTER_CONFIGS = Object.freeze([
    Object.freeze({ id: "lantern", zh: "纸灯兽", th: "อสูรโคมกระดาษ", hp: 90, art: "./assets/game/monster-paper-lantern-v3.webp", color: "#365a67", accent: "#d5a84f", scene: "#47717a", ground: "#1d3033" }),
    Object.freeze({ id: "lotus", zh: "莲火兽", th: "อสูรเพลิงบัว", hp: 120, art: "./assets/game/monster-lotus-flame-v3.webp", color: "#c45f58", accent: "#d6ad61", scene: "#825f58", ground: "#2e302d" }),
    Object.freeze({ id: "ink-king", zh: "金翅墨王", th: "ราชาหมึกปีกทอง", hp: 170, art: "./assets/game/monster-ink-king-v3.webp", color: "#b18b43", accent: "#e1ca91", scene: "#343d46", ground: "#121618", boss: true })
  ]);
  const MONSTER_ART_PRELOADS = [];
  const GAME_COLORS = {
    voice: "#ff6b7a", monster: "#f06474", match: "#b9ed55", audio: "#26c7b8", speed: "#ffb62f", tone: "#8d8fff",
    polish: "#ff5967", "grade-lock": "#67d8ff", "scene-listen": "#ff8ec7", "register-shift": "#f6d45c"
  };
  const POLICY_GAME_MAP = Object.freeze({
    "meaning-match": ["monster", "match", "grade-lock"],
    "listen-pick": ["audio", "scene-listen"],
    "guided-response": ["voice", "monster", "speed", "grade-lock", "register-shift"],
    "tone-compare": ["tone", "grade-lock"],
    "boundary-roleplay": ["scene-listen"],
    "risk-spot": ["tone", "scene-listen", "grade-lock"],
    "safe-rewrite": ["polish", "register-shift"]
  });
  const COPY = {
    zh: {
      eyebrow: "单人闯关 · 10 种玩法", title: "挑一个弱项，开局练到会", subtitle: "当前档位的推荐排在最前；其余按开口、听力、词义和语气展开。", total: "最佳总分", showAll: "查看全部 10 种玩法", showLess: "收起其他玩法",
      safety: "S1粗口、S2冲硬表达仅用于听懂、避坑和剧情识别；不包含针对受保护群体的仇恨词。", score: "分", ready: "准备开始", next: "下一题", finish: "看战绩", skipTransition: "轻触跳过",
      games: {
        voice: ["01 · 6 关", "开口破门", "设备识别成目标词即可击碎关门；失误可重试，不靠蒙选项。", "说"],
        monster: ["02 · 三怪含 Boss", "极速打怪", "答得越快伤害越高；答错会被反击，最后挑战关底 Boss。", "打"],
        match: ["03 · 60 秒", "闪电配对", "连对 6 组双语词，越快分越高。", "配"],
        audio: ["04 · 8 题", "听音狙击", "只听声音锁定意思，训练真实反应。", "听"],
        speed: ["05 · 45 秒", "限时选义", "不停题，连击会把分数越推越高。", "快"],
        tone: ["06 · S5—S1", "分寸雷达", "判断一句话到底正式、随意还是冒犯。", "测"],
        polish: ["07 · 改写", "安全改写", "把冲硬表达和粗口改成适合当前场合的表达。", "改"],
        "grade-lock": ["08 · 当前档", "档位锁定", "四句都在当前档，锁定与情境意思完全对应的一句。", "锁"],
        "scene-listen": ["09 · 听情境", "听声寻景", "听当前档位的一句话，找出对应意思与场景。", "寻"],
        "register-shift": ["10 · 换挡", "情境变档", "从当前档切到场景推荐档，意思保持不变。", "换"]
      },
      gradePick: grade => `${grade} · 当前档位推荐`, gradeFocus: grade => `${grade} 重点`,
      best: "最佳", notPlayed: "未挑战", start: "开练", round: (n, total) => `第 ${n}/${total} 题`, pairs: (n, total) => `已配对 ${n}/${total}`, time: n => `${n} 秒`,
      tapPair: "从两边各选一张，配出同一个意思", matchTarget: "泰语", matchMeaning: "中文意思", matchReadyTitle: "先看规则，再开始计时", matchReadyCopy: "两边各选一张，配出 6 组相同意思。开始后说明会收起，短屏不用边读规则边倒计时。", matchStart: "我准备好了，开始 60 秒", matchCountdown: n => `${n} 秒后开始`, listenPrompt: "先听声音，再锁定正确意思", listenHint: "点按钮可重复播放", playSentence: "播放当前句子", close: "关闭游戏",
      speedPrompt: "选出正确意思", tonePrompt: "结合人物关系与场景，这句话属于哪个表达档位？", polishPrompt: "同一个意思，哪句在这个关系与场合最合适？", sourceRisk: "待改写 · S1粗口 / S2冲硬表达",
      correct: "判断正确", wrong: "再看一次", toneCorrect: grade => `正解是 ${grade}`, toneWrong: grade => `这句实际是 ${grade}`,
      polishCorrect: "选得合适", polishWrong: "这句不适合当前关系与场景", riskTag: "只识别，不建议模仿",
      contextSetting: "场景", contextRelationship: "关系", contextMissing: "缺少关系或场景，不能判定唯一合适档位。",
      recommendation: (grade, why) => `本场景推荐 ${grade}：${why}`,
      audioLoading: "正在查找本机学习声包…", audioUnavailable: level => `L${level} 学习声包尚未安装，无法保证清晰示范音。`, audioFailed: "音频加载失败，请检查声包后重试。",
      installPack: level => `安装 L${level} 声包`, useText: "先用文字模式", textPrompt: "看词选出正确意思", textFallbackReady: "已切换为看词选义，本题仍可完成。",
      characterAudioFailed: "S1 角色音频未能加载；没有退回学习示范音或设备机器声，请点播放重试。",
      gradeLockPrompt: grade => `哪句用 ${grade} 档准确表达上面的意思？`, gradeLockCorrect: grade => `锁定 ${grade}`,
      sceneListenPrompt: grade => `先听 ${grade} 档表达，再选择它在说什么`, sceneListenHint: "点上方播放键可重复听；点下方情境即作答。", sceneCorrect: "情境命中",
      shiftPrompt: (from, to) => `从 ${from} 切到本场景推荐的 ${to}`, shiftCorrect: grade => `已切到 ${grade}`,
      voicePrompt: "看意思，直接说出目标词", voiceHint: "先听学习示范音，再点麦克风完整说出；设备最终转写匹配度达到 78 才破门。", voiceDemo: "听学习示范音", voiceStart: "开始说", voiceListening: "正在听…", voicePass: score => `识别命中 · 匹配度 ${score}`, voiceRetry: score => `匹配度 ${score} · 再清楚一点`, voiceNetwork: "允许本次联网识别", voiceLocalMissing: "本机没有离线识别包，可允许系统语音服务联网识别本次答案。", voiceUnavailable: "当前设备不能生成转写匹配度，请换 Chrome/Safari HTTPS 版完成本关。", voiceHeard: value => `设备转写：${value}`,
      monsterStage: (n, total) => `第 ${n}/${total} 战`, monsterPlayer: "你的生命", monsterCrest: "勇气护符", monsterEnemy: "怪物生命", monsterBoss: "关底 BOSS", monsterPrompt: "说出目标词，发动攻击", monsterRule: "10 秒内开口 · 越快伤害越高", monsterPower: value => `当前伤害 ${value}`, monsterReady: "点开口攻击：设备识别正确、说得快，伤害才高", monsterHear: "听目标词", monsterTime: value => `${value} 秒`,
      monsterVoice: "开口攻击", monsterVoiceHint: "转写匹配 + 速度 = 伤害", monsterListening: "正在听你说…", monsterJudging: value => value ? `设备转写：${value} · 正在核对` : "正在核对转写…", monsterVoicePass: score => `识别命中 · 匹配度 ${score}`, monsterVoiceFail: score => `匹配度 ${score} · 怪物反击`, monsterNetwork: "允许本次联网识别", monsterFallback: "麦克风不可用时，可点下方意思继续战斗", monsterUnavailable: "这台设备暂时不能进行语音识别，请用下方文字招式继续。", monsterLocalMissing: "本机没有离线识别包；可允许系统语音服务仅联网识别这一次。",
      monsterReadyTitle: "声音就是你的武器", monsterReadyCopy: "每题先点“听题并开始”。学习示范音播完才开始 10 秒计时，麦克风准备时间不扣伤害。设备仅比较最终第一候选转写，不代替母语发音评测。", monsterReadyRules: ["识别成目标词才命中", "越快伤害越高", "答错怪物会反击"], monsterStart: "进入第一战",
      monsterArm: "听题并开始 10 秒", monsterCuePlaying: "正在播放学习示范音；播放结束后才开始计时", monsterCueFailed: "示范音未能播放，已切到文字题；现在开始计时", monsterGo: "计时开始，点“开口攻击”说出目标词",
      monsterHit: (damage, seconds, critical, combo) => `${seconds} 秒 · ${critical ? "暴击" : "命中"} ${damage} 伤害${combo ? ` · 连击 +${combo}` : ""}`, monsterCounter: damage => `答错！怪物反击 ${damage}`, monsterTimeout: damage => `超时！怪物反击 ${damage}`, monsterReveal: (target, meaning) => `正确答案：${target} · ${meaning}`, monsterDown: (name, bonus) => `${name} 被击败！奖励 ${bonus} 分`, monsterVictory: "三怪全破！", monsterDefeat: "体力耗尽", monsterVictoryCopy: "速度和准确率都顶住了，关底 Boss 已倒下。", monsterDefeatCopy: "先把易错词练熟，再回来用速度打出高伤害。",
      currentRegister: grade => `当前 ${grade}`, targetRegister: grade => `目标 ${grade}`, tapToHear: "点右侧声音键试听，点句子作答", previewOption: letter => `试听选项 ${letter}`,
      grades: { S5: ["S5", "体面"], S4: ["S4", "懂事"], S3: ["S3", "熟人"], S2: ["S2", "冲硬表达"], S1: ["S1", "粗口"] },
      done: "本局完成", newBest: "刷新本机最佳！", keep: "再练一局，反应会更快。", statScore: "本局得分", statRight: "答对", statCombo: "最高连击", replay: "再来一局",
      noData: "语气训练包正在校验，稍后开放。", wordFallback: "词库加载中，请稍后再试。", answerLetters: ["A", "B", "C", "D", "E"]
    },
    th: {
      eyebrow: "ตะลุยเดี่ยว · 10 เกม", title: "เลือกจุดอ่อน แล้วฝึกให้คล่องในเกม", subtitle: "เกมที่เหมาะกับระดับปัจจุบันอยู่หน้าแรก ที่เหลือแยกตามการพูด ฟัง ความหมาย และกาลเทศะ", total: "คะแนนดีที่สุดรวม", showAll: "ดูเกมทั้งหมด 10 แบบ", showLess: "ย่อเกมอื่น",
      safety: "คำหยาบระดับ S1 และถ้อยคำห้วนแข็งระดับ S2 มีไว้เพื่อฟังให้รู้ทัน หลีกเลี่ยงปัญหา และเข้าใจบริบทเท่านั้น โดยไม่ใช้ถ้อยคำเกลียดชังต่อกลุ่มบุคคล", score: "แต้ม", ready: "พร้อมเริ่ม", next: "ข้อต่อไป", finish: "ดูผลงาน", skipTransition: "แตะเพื่อข้าม",
      games: {
        voice: ["01 · 6 ด่าน", "พูดพังประตู", "ระบบรู้จำเป็นคำเป้าหมายจึงพังประตูได้ ผิดแล้วลองใหม่ ไม่ต้องเดา", "พูด"],
        monster: ["02 · 3 ตัวรวมบอส", "ล่ามอนสเตอร์สายฟ้า", "ยิ่งตอบเร็ว ยิ่งสร้างความเสียหายมาก ตอบผิดจะถูกสวนกลับ และมีบอสท้ายด่าน", "ล่า"],
        match: ["03 · 60 วิ", "จับคู่สายฟ้า", "จับคู่คำสองภาษา 6 คู่ ยิ่งไวแต้มยิ่งสูง", "คู่"],
        audio: ["04 · 8 ข้อ", "ล็อกเป้าจากเสียง", "ฟังอย่างเดียวแล้วเลือกความหมาย ฝึกตอบสนองจริง", "ฟัง"],
        speed: ["05 · 45 วิ", "เลือกความหมายทันใจ", "คำถามต่อเนื่อง ยิ่งคอมโบสูงยิ่งได้แต้มมาก", "ไว"],
        tone: ["06 · S5—S1", "เรดาร์ระดับภาษา", "แยกว่าแต่ละประโยคสุภาพ กันเอง หรือหยาบคาย", "วัด"],
        polish: ["07 · ปรับคำ", "พูดให้ดูดี", "เปลี่ยนถ้อยคำห้วนแข็งและคำหยาบให้เป็นภาษาสุภาพ", "ปรับ"],
        "grade-lock": ["08 · ระดับที่เลือก", "ล็อกระดับภาษา", "ทั้งสี่ประโยคอยู่ในระดับปัจจุบัน เลือกประโยคที่ตรงกับความหมายและสถานการณ์", "ล็อก"],
        "scene-listen": ["09 · ฟังสถานการณ์", "ฟังเสียงหาฉาก", "ฟังหนึ่งประโยคในระดับปัจจุบัน แล้วเลือกความหมายและสถานการณ์ให้ตรง", "หา"],
        "register-shift": ["10 · เปลี่ยนระดับ", "เปลี่ยนเกียร์ภาษา", "เปลี่ยนจากระดับปัจจุบันไปเป็นระดับที่เหมาะกับสถานการณ์ โดยคงความหมายเดิม", "เปลี่ยน"]
      },
      gradePick: grade => `${grade} · แนะนำสำหรับระดับปัจจุบัน`, gradeFocus: grade => `เน้น ${grade}`,
      best: "ดีที่สุด", notPlayed: "ยังไม่เล่น", start: "เริ่ม", round: (n, total) => `ข้อ ${n}/${total}`, pairs: (n, total) => `จับคู่แล้ว ${n}/${total}`, time: n => `${n} วิ`,
      tapPair: "เลือกฝั่งละหนึ่งใบให้มีความหมายตรงกัน", matchTarget: "ภาษาจีน", matchMeaning: "ความหมายภาษาไทย", matchReadyTitle: "อ่านกติกาก่อน แล้วค่อยเริ่มจับเวลา", matchReadyCopy: "เลือกฝั่งละหนึ่งใบให้ครบ 6 คู่ เมื่อเริ่มแล้วคำอธิบายจะหายไป เพื่อให้จอสั้นเห็นกระดานได้มากขึ้น", matchStart: "พร้อมแล้ว เริ่ม 60 วินาที", matchCountdown: n => `เริ่มใน ${n} วินาที`, listenPrompt: "ฟังก่อน แล้วเลือกความหมายที่ถูก", listenHint: "แตะปุ่มเพื่อฟังซ้ำ", playSentence: "ฟังประโยคนี้", close: "ปิดเกม",
      speedPrompt: "เลือกความหมายที่ถูก", tonePrompt: "เมื่อดูความสัมพันธ์และสถานการณ์ ประโยคนี้แสดงระดับภาษาใด?", polishPrompt: "ความหมายเดิม ประโยคไหนเหมาะกับความสัมพันธ์และสถานการณ์นี้ที่สุด?", sourceRisk: "ก่อนปรับ · S1 คำหยาบ / S2 ถ้อยคำห้วนแข็ง",
      correct: "ถูกต้อง", wrong: "ลองดูอีกครั้ง", toneCorrect: grade => `คำตอบคือ ${grade}`, toneWrong: grade => `ประโยคนี้จริง ๆ คือ ${grade}`,
      polishCorrect: "เลือกได้เหมาะสม", polishWrong: "ประโยคนี้ไม่เหมาะกับความสัมพันธ์และสถานการณ์ปัจจุบัน", riskTag: "เรียนเพื่อรู้ทัน ไม่แนะนำให้เลียนแบบ",
      contextSetting: "สถานการณ์", contextRelationship: "ความสัมพันธ์", contextMissing: "หากไม่มีความสัมพันธ์หรือสถานการณ์ จะตัดสินระดับที่เหมาะสมเพียงระดับเดียวไม่ได้",
      recommendation: (grade, why) => `สถานการณ์นี้แนะนำ ${grade}: ${why}`,
      audioLoading: "กำลังค้นหาชุดเสียงเพื่อเรียนในเครื่อง…", audioUnavailable: level => `ยังไม่ได้ติดตั้งชุดเสียงเพื่อเรียน L${level} จึงเปิดเสียงตัวอย่างชัดเจนไม่ได้`, audioFailed: "โหลดเสียงไม่สำเร็จ โปรดตรวจชุดเสียงแล้วลองอีกครั้ง",
      installPack: level => `ติดตั้งชุดเสียง L${level}`, useText: "ใช้โหมดข้อความก่อน", textPrompt: "ดูคำแล้วเลือกความหมายที่ถูก", textFallbackReady: "เปลี่ยนเป็นโหมดดูคำแล้ว ข้อนี้ยังเล่นต่อได้",
      characterAudioFailed: "โหลดเสียงตัวละคร S1 ไม่สำเร็จ ระบบไม่ได้เปลี่ยนไปใช้เสียงตัวอย่างเพื่อเรียนหรือเสียงเครื่อง โปรดแตะเล่นอีกครั้ง",
      gradeLockPrompt: grade => `ประโยคใดใช้ระดับ ${grade} และสื่อความหมายด้านบนได้ตรง?`, gradeLockCorrect: grade => `ล็อก ${grade} แล้ว`,
      sceneListenPrompt: grade => `ฟังสำนวนระดับ ${grade} แล้วเลือกว่ากำลังสื่ออะไร`, sceneListenHint: "แตะปุ่มเล่นด้านบนเพื่อฟังซ้ำ แล้วแตะสถานการณ์ด้านล่างเพื่อตอบ", sceneCorrect: "เลือกสถานการณ์ถูกแล้ว",
      shiftPrompt: (from, to) => `เปลี่ยนจาก ${from} ไปเป็น ${to} ที่เหมาะกับสถานการณ์นี้`, shiftCorrect: grade => `เปลี่ยนเป็น ${grade} แล้ว`,
      voicePrompt: "ดูความหมาย แล้วพูดคำเป้าหมาย", voiceHint: "ฟังเสียงตัวอย่างก่อน แตะไมค์แล้วพูดให้ครบ ความตรงของคำถอดเสียงสุดท้ายต้องถึง 78 จึงพังประตู", voiceDemo: "ฟังเสียงตัวอย่างเพื่อเรียน", voiceStart: "เริ่มพูด", voiceListening: "กำลังฟัง…", voicePass: score => `ระบบรู้จำตรง · ${score} คะแนน`, voiceRetry: score => `ตรง ${score} คะแนน · ลองให้ชัดขึ้น`, voiceNetwork: "อนุญาตรู้จำออนไลน์ครั้งนี้", voiceLocalMissing: "เครื่องไม่มีชุดรู้จำออฟไลน์ อนุญาตบริการเสียงของระบบออนไลน์เฉพาะครั้งนี้ได้", voiceUnavailable: "อุปกรณ์นี้สร้างคะแนนความตรงของคำถอดเสียงไม่ได้ โปรดใช้ Chrome/Safari ผ่าน HTTPS", voiceHeard: value => `คำถอดเสียง: ${value}`,
      monsterStage: (n, total) => `ตัวที่ ${n}/${total}`, monsterPlayer: "พลังของคุณ", monsterCrest: "ยันต์ใจกล้า", monsterEnemy: "พลังมอนสเตอร์", monsterBoss: "บอสท้ายด่าน", monsterPrompt: "พูดคำเป้าหมายเพื่อโจมตี", monsterRule: "พูดภายใน 10 วิ · ยิ่งเร็ว ดาเมจยิ่งแรง", monsterPower: value => `ดาเมจตอนนี้ ${value}`, monsterReady: "แตะโจมตีด้วยเสียง ระบบรู้จำถูกและตอบไว ดาเมจจึงสูง", monsterHear: "ฟังคำเป้าหมาย", monsterTime: value => `${value} วิ`,
      monsterVoice: "โจมตีด้วยเสียง", monsterVoiceHint: "คำถอดเสียงตรง + ความเร็ว = ดาเมจ", monsterListening: "กำลังฟังคุณพูด…", monsterJudging: value => value ? `คำถอดเสียง: ${value} · กำลังเทียบ` : "กำลังเทียบคำถอดเสียง…", monsterVoicePass: score => `ระบบรู้จำตรง · ${score} คะแนน`, monsterVoiceFail: score => `ตรง ${score} คะแนน · มอนสเตอร์สวนกลับ`, monsterNetwork: "อนุญาตรู้จำออนไลน์ครั้งนี้", monsterFallback: "ถ้าใช้ไมค์ไม่ได้ แตะความหมายด้านล่างเพื่อสู้ต่อ", monsterUnavailable: "อุปกรณ์นี้ยังใช้การรู้จำเสียงไม่ได้ ใช้ท่าคำศัพท์ด้านล่างต่อได้", monsterLocalMissing: "เครื่องไม่มีชุดรู้จำออฟไลน์ อนุญาตบริการเสียงของระบบออนไลน์เฉพาะครั้งนี้ได้",
      monsterReadyTitle: "เสียงคืออาวุธของคุณ", monsterReadyCopy: "แต่ละข้อให้แตะ “ฟังโจทย์แล้วเริ่ม” ระบบจะเริ่มจับเวลา 10 วินาทีหลังเสียงตัวอย่างจบ และไม่หักดาเมจระหว่างเตรียมไมค์ ระบบเทียบเฉพาะคำถอดเสียงอันดับแรกที่เป็นผลสุดท้าย ไม่แทนการประเมินการออกเสียงโดยครู", monsterReadyRules: ["ระบบรู้จำเป็นคำเป้าหมายจึงโดน", "ยิ่งไว ดาเมจยิ่งแรง", "ตอบผิดจะถูกสวน"], monsterStart: "เข้าสู่ศึกแรก",
      monsterArm: "ฟังโจทย์แล้วเริ่ม 10 วิ", monsterCuePlaying: "กำลังเล่นเสียงตัวอย่างเพื่อเรียน จะเริ่มจับเวลาหลังเสียงจบ", monsterCueFailed: "เล่นเสียงตัวอย่างไม่ได้ เปลี่ยนเป็นโจทย์ข้อความและเริ่มจับเวลาแล้ว", monsterGo: "เริ่มจับเวลาแล้ว แตะ “โจมตีด้วยเสียง” แล้วพูดคำเป้าหมาย",
      monsterHit: (damage, seconds, critical, combo) => `${seconds} วิ · ${critical ? "คริติคอล" : "โจมตีโดน"} ${damage} ดาเมจ${combo ? ` · คอมโบ +${combo}` : ""}`, monsterCounter: damage => `ตอบผิด! มอนสเตอร์สวนกลับ ${damage}`, monsterTimeout: damage => `หมดเวลา! มอนสเตอร์สวนกลับ ${damage}`, monsterReveal: (target, meaning) => `คำตอบที่ถูก: ${target} · ${meaning}`, monsterDown: (name, bonus) => `ปราบ ${name} แล้ว! โบนัส ${bonus} คะแนน`, monsterVictory: "ปราบครบทั้งสามตัว!", monsterDefeat: "พลังหมด", monsterVictoryCopy: "ทั้งความเร็วและความแม่นยำผ่านด่าน บอสท้ายด่านล้มแล้ว", monsterDefeatCopy: "ฝึกคำที่พลาดให้คล่อง แล้วกลับมาทำดาเมจด้วยความเร็วอีกครั้ง",
      currentRegister: grade => `ระดับปัจจุบัน ${grade}`, targetRegister: grade => `ระดับเป้าหมาย ${grade}`, tapToHear: "แตะปุ่มเสียงด้านขวาเพื่อฟัง แล้วแตะประโยคเพื่อตอบ", previewOption: letter => `ฟังตัวเลือก ${letter}`,
      grades: { S5: ["S5", "สุภาพมาก"], S4: ["S4", "สุภาพ"], S3: ["S3", "กันเอง"], S2: ["S2", "ถ้อยคำห้วนแข็ง"], S1: ["S1", "คำหยาบ"] },
      done: "จบเกมแล้ว", newBest: "ทำสถิติใหม่ในเครื่อง!", keep: "เล่นอีกครั้งแล้วจะตอบได้ไวขึ้น", statScore: "คะแนนรอบนี้", statRight: "ตอบถูก", statCombo: "คอมโบสูงสุด", replay: "เล่นอีกครั้ง",
      noData: "ชุดฝึกระดับภาษากำลังตรวจสอบ แล้วจะเปิดให้เล่น", wordFallback: "กำลังโหลดคลังคำศัพท์ ลองใหม่อีกครั้ง", answerLetters: ["A", "B", "C", "D", "E"]
    }
  };

  let game = null;
  let timerId = 0;
  let activeTransition = null;
  let hallExpanded = false;
  const pendingIds = new Set();
  let voiceAudio = null;
  let wordAudioRequest = 0;

  const q = selector => document.querySelector(selector);
  const esc = value => String(value == null ? "" : value).replace(/&/gu, "&amp;").replace(/</gu, "&lt;").replace(/>/gu, "&gt;").replace(/"/gu, "&quot;").replace(/'/gu, "&#039;");
  const direction = () => document.body.classList.contains("dir-th-zh") ? "th-zh" : "zh-th";
  const locale = () => direction() === "zh-th" ? "zh" : "th";
  const copy = () => COPY[locale()];
  const vibrate = pattern => { try { navigator.vibrate && navigator.vibrate(pattern); } catch (_) {} };
  const shouldReduceMotion = () => {
    try {
      if (globalThis.HUILAISHI_MOTION?.shouldReduce?.()) return true;
      return Boolean(globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
    } catch (_) { return false; }
  };

  function monsterDamage(remainingMs, streak = 0) {
    const remainingRatio = Math.max(0, Math.min(1, (Number(remainingMs) || 0) / MONSTER_TURN_MS));
    const speedDamage = 18 + Math.round(remainingRatio * 30);
    const comboDamage = Math.min(12, Math.max(0, Math.floor(Number(streak) || 0)) * 3);
    return speedDamage + comboDamage;
  }

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
    const allowedGames = [...new Set((policy.allowed || []).flatMap(item => POLICY_GAME_MAP[item] || []))];
    let recommendedGame = "match";
    if (policy.requireSafeRewrite && allowedGames.includes("polish")) recommendedGame = "polish";
    else if (policy.allowSpeak === false && allowedGames.includes("tone")) recommendedGame = "tone";
    else if (allowedGames.includes("voice")) recommendedGame = "voice";
    else if (allowedGames.includes("audio")) recommendedGame = "audio";
    else if (allowedGames.length) [recommendedGame] = allowedGames;
    return { grade, policy, allowedGames, recommendedGame };
  }

  function celebrate({ isBest, score, streak }) {
    if (typeof globalThis.confetti !== "function" || score < 250 || (!isBest && score < 900)) return;
    if (shouldReduceMotion()) return;
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

  function primeWordVoice(word) {
    const engine = window.HUILAISHI_SPEECH;
    if (!word || !engine?.prime) return;
    const view = wordView(word);
    void engine.prime(view.target, { ...wordVoiceOptions(word), lang: view.voiceLang });
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

  function sceneView(pack) {
    const zh = locale() === "zh";
    return {
      intent: zh ? pack.intentZh : pack.intentTh,
      context: zh ? pack.contextZh : pack.contextTh,
      lang: zh ? "zh-CN" : "th"
    };
  }

  function choiceShortcutAttrs(index) {
    const letter = copy().answerLetters[index] || String(index + 1);
    return `aria-keyshortcuts="${esc(letter)} ${index + 1}"`;
  }

  function phoneticHintMarkup(value) {
    const hint = direction() === "zh-th" ? String(value || "").trim() : "";
    if (!hint || /近音待核|母语待审|算法近似/u.test(hint)) return "";
    return `<span class="thai-phonetic-hint"><small class="thai-phonetic-label">中文近音·仅助记</small><span class="thai-phonetic-value">${esc(hint)}</span></span>`;
  }

  function hasBundledWordVoice(word) {
    const view = wordView(word);
    const options = wordVoiceOptions(word);
    const request = {
      text: view.target,
      lang: view.voiceLang,
      track: "standard",
      key: options.audioKey
    };
    const installed = window.HUILAISHI_VOICE_PACKS?.resolveSync?.({
      text: view.target,
      lang: view.voiceLang,
      level: options.voicePackLevel,
      direction: options.direction,
      key: options.audioKey
    });
    return Boolean(
      window.HUILAISHI_STARTER_VOCAB_AUDIO?.lookup?.(request)
      || window.HUILAISHI_CUTE_AUDIO?.lookup?.(request)
      || installed
    );
  }

  function pickWords(count, options = {}) {
    const level = activeLevel();
    let pool = corpus().filter(item => Number(item.level) === level);
    if (pool.length < count) pool = corpus();
    if (options.learningAudio) {
      const levelAudio = pool.filter(hasBundledWordVoice);
      const allAudio = levelAudio.length >= count ? levelAudio : corpus().filter(hasBundledWordVoice);
      if (allAudio.length >= Math.min(count, 6)) pool = allAudio;
    }
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

  function cancelSkippableTransition() {
    const transition = activeTransition;
    if (!transition) return;
    activeTransition = null;
    clearTimeout(transition.timeoutId);
    pendingIds.delete(transition.timeoutId);
    q("#arcade-stage [data-arcade-transition]")?.remove?.();
  }

  function completeSkippableTransition() {
    const transition = activeTransition;
    if (!transition) return false;
    activeTransition = null;
    clearTimeout(transition.timeoutId);
    pendingIds.delete(transition.timeoutId);
    q("#arcade-stage [data-arcade-transition]")?.remove?.();
    transition.callback();
    return true;
  }

  function beginSkippableTransition(callback, delay) {
    cancelSkippableTransition();
    const duration = Math.max(0, Number(delay) || 0);
    if (shouldReduceMotion()) {
      schedule(callback, 0);
      return;
    }
    const transition = { callback, timeoutId: 0, duration };
    activeTransition = transition;
    transition.timeoutId = schedule(() => {
      if (activeTransition === transition) completeSkippableTransition();
    }, duration);
  }

  function mountTransitionSkip() {
    const stage = q("#arcade-stage");
    if (!activeTransition || !stage || stage.querySelector?.("[data-arcade-transition]")) return;
    const duration = Math.max(1, Number(activeTransition.duration) || 1);
    stage.insertAdjacentHTML?.("beforeend", `<button type="button" class="arcade-transition-skip" data-arcade-transition aria-label="${esc(copy().skipTransition)}" style="--arcade-transition-duration:${duration}ms"><span><b>${esc(copy().skipTransition)}</b><i aria-hidden="true"></i></span></button>`);
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
      const gradeLinked = REGISTER_GAMES.has(id);
      const locked = gradeLinked && !hasRegister;
      const recommended = id === gameLink.recommendedGame && !locked;
      const best = Number(stats[id]?.best || 0);
      const kicker = recommended ? `${item[0]} · ${c.gradePick(gameLink.grade)}` : (gradeLinked ? `${item[0]} · ${c.gradeFocus(gameLink.grade)}` : item[0]);
      return `<button class="arcade-card ${locked ? "locked" : ""} ${recommended ? "recommended" : ""}" data-game="${id}" data-current-grade="${gameLink.grade}" data-speak-text="${esc(item[1])}" data-speech-track="navigation" style="--game:${GAME_COLORS[id]}" ${locked ? "disabled" : ""}>
        <span class="arcade-game-icon">${esc(item[3])}</span>
        <span class="arcade-game-copy"><span>${esc(kicker)}</span><b>${esc(item[1])}</b><small>${esc(locked ? c.noData : item[2])}</small></span>
        <span class="arcade-card-score ${best > 0 ? "" : "is-empty"}"><b>${best > 0 ? best.toLocaleString() : esc(c.start)}</b><small>${esc(best > 0 ? c.best : c.notPlayed)}</small></span>
      </button>`;
    }).join("");
    syncHallExpansion();
  }

  function syncHallExpansion() {
    const grid = q("#arcade-grid");
    const button = q("#arcade-expand");
    if (!grid || !button) return;
    grid.classList.toggle("is-expanded", hallExpanded);
    button.setAttribute("aria-expanded", String(hallExpanded));
    button.querySelector("span").textContent = hallExpanded ? copy().showLess : copy().showAll;
    button.dataset.speakText = hallExpanded ? copy().showLess : copy().showAll;
    button.dataset.speakLang = direction() === "zh-th" ? "zh-CN" : "th-TH";
  }

  function clearTimers() {
    cancelSkippableTransition();
    clearInterval(timerId); timerId = 0;
    wordAudioRequest += 1;
    pendingIds.forEach(id => clearTimeout(id)); pendingIds.clear();
    stopVoiceAudio();
    try { window.HUILAISHI_SPEECH?.stop?.(); } catch (_) {}
    try { window.PronunciationScorer?.cancelChallenge?.(); } catch (_) {}
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
    document.body?.classList?.remove?.("arcade-monster-active");
    game = null;
    if (!copy().games[type]) return;
    const gameLink = activeGameLink();
    const packs = gradePracticePacks(gameLink.grade);
    if (REGISTER_GAMES.has(type) && !packs.length) return;
    setSheetMeta(type);
    if (typeof openSheet === "function") openSheet("arcade-sheet");
    else { q("#modal-backdrop").classList.remove("hidden"); q("#arcade-sheet").classList.remove("hidden"); }
    const base = { type, grade: gameLink.grade, gamePolicy: gameLink.policy, score: 0, correct: 0, streak: 0, bestStreak: 0, answered: false, round: 0, startedAt: Date.now() };
    if (type === "voice") startVoiceGate({ ...base, total: 6, words: pickWords(12, { learningAudio: true }) });
    if (type === "monster") startMonsterBattle({ ...base, words: pickWords(80, { learningAudio: true }) });
    if (type === "match") startMatch(base);
    if (type === "audio") startWordQuiz({ ...base, total: 8, words: pickWords(12, { learningAudio: true }) });
    if (type === "speed") startSpeed({ ...base, words: pickWords(80), seconds: 45 });
    if (type === "tone") { const items = buildToneItems(10, gameLink.grade, packs); startTone({ ...base, total: items.length, items }); }
    if (type === "polish") { const items = shuffle(packs).slice(0, 8); startPolish({ ...base, total: items.length, items }); }
    if (type === "grade-lock") { const items = buildGradeLockItems(8, gameLink.grade, packs); startGradeLock({ ...base, total: items.length, items }); }
    if (type === "scene-listen") { const items = buildSceneListenItems(8, gameLink.grade, packs); startSceneListen({ ...base, total: items.length, items }); }
    if (type === "register-shift") { const items = buildRegisterShiftItems(8, gameLink.grade, packs); startRegisterShift({ ...base, total: items.length, items }); }
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

  async function playWordVoice(word, playback = {}) {
    if (!word) return;
    const c = copy();
    const view = wordView(word);
    const options = wordVoiceOptions(word);
    const requestId = ++wordAudioRequest;
    setAudioStatus(c.audioLoading);
    try {
      const engine = window.HUILAISHI_SPEECH;
      if (!engine?.speak) throw new Error("speech-engine-unavailable");
      const catalogRequest = { text: view.target, lang: view.voiceLang, track: "standard", key: options.audioKey };
      const bundled = window.HUILAISHI_STARTER_VOCAB_AUDIO?.lookup?.(catalogRequest)
        || window.HUILAISHI_CUTE_AUDIO?.lookup?.(catalogRequest);
      if (bundled) {
        if (requestId !== wordAudioRequest || game?.current !== word) return;
        setAudioStatus();
        engine.speak(view.target, { ...options, lang: view.voiceLang, rate: .78, onEnd: playback.onEnd, onError: playback.onError });
        return true;
      }
      const manager = window.HUILAISHI_VOICE_PACKS;
      if (!manager) throw new Error("voice-pack-manager-unavailable");
      const request = { text: view.target, lang: view.voiceLang, level: options.voicePackLevel, direction: options.direction, key: options.audioKey };
      const source = manager.resolveSync?.(request) || await manager.resolve?.(request);
      if (requestId !== wordAudioRequest || game?.current !== word) return;
      if (!source) {
        setAudioStatus(c.audioUnavailable(view.level), true, { installLevel: view.level, allowFallback: true });
        try { playback.onError?.({ reason: "learning-audio-unavailable" }); } catch (_) {}
        return false;
      }
      setAudioStatus();
      engine.speak(view.target, { ...options, lang: view.voiceLang, rate: .78, onEnd: playback.onEnd, onError: playback.onError });
      return true;
    } catch (_) {
      if (requestId === wordAudioRequest && game?.current === word) setAudioStatus(c.audioFailed, true, { installLevel: view.level, allowFallback: true });
      try { playback.onError?.({ reason: "learning-audio-failed" }); } catch (_) {}
      return false;
    }
  }

  function playRegisterVariant(pack, variant) {
    if (!pack || !variant) return;
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

  function playRegisterVoice() {
    if (!game || !REGISTER_GAMES.has(game.type) || !game.current) return;
    const pack = game.current.pack;
    const variant = game.current.variant || game.current.source;
    playRegisterVariant(pack, variant);
  }

  function playRegisterOption(index) {
    if (!game || !["grade-lock", "register-shift"].includes(game.type)) return;
    const option = game.options?.[index];
    if (!option?.variant) return;
    playRegisterVariant(option.pack || game.current?.pack, option.variant);
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
    game = { ...base, words, tiles, pairs: 0, selected: null, seconds: 60, phase: "ready", startedAt: 0, endsAt: 0 };
    renderMatchReady();
  }

  function renderMatchReady() {
    if (!game || game.type !== "match") return;
    const c = copy();
    const sheet = q("#arcade-sheet");
    if (sheet) sheet.dataset.arcadePhase = "match-ready";
    q("#arcade-round").textContent = c.ready;
    q("#arcade-timer").textContent = c.time(60);
    setProgress(0);
    q("#arcade-stage").innerHTML = `<div class="arcade-prompt match-ready" role="group" aria-labelledby="arcade-match-ready-title"><span class="game-chip">L${activeLevel()} · MATCH</span><h3 id="arcade-match-ready-title">${esc(c.matchReadyTitle)}</h3><p>${esc(c.tapPair)}</p><span class="meaning-hint">${esc(c.matchReadyCopy)}</span><button type="button" id="arcade-match-start" data-match-start>${esc(c.matchStart)}</button></div>`;
    globalThis.requestAnimationFrame?.(() => q("#arcade-match-start")?.focus?.({ preventScroll: true }));
  }

  function beginMatchCountdown() {
    if (!game || game.type !== "match" || game.phase !== "ready") return;
    game.phase = "countdown";
    let remaining = 3;
    const renderCountdown = () => {
      if (!game || game.type !== "match" || game.phase !== "countdown") return;
      q("#arcade-round").textContent = copy().matchCountdown(remaining);
      q("#arcade-timer").textContent = String(remaining);
      q("#arcade-stage").innerHTML = `<div class="arcade-prompt match-countdown" role="status" aria-live="assertive"><span class="game-chip">${esc(copy().matchCountdown(remaining))}</span><h3>${remaining}</h3></div>`;
      mountTransitionSkip();
    };
    const finishCountdown = () => {
      clearInterval(timerId); timerId = 0;
      startMatchTimer();
    };
    beginSkippableTransition(finishCountdown, 3000);
    renderCountdown();
    timerId = setInterval(() => {
      if (!game || game.type !== "match" || game.phase !== "countdown") return;
      remaining = Math.max(1, remaining - 1);
      renderCountdown();
    }, 1000);
  }

  function startMatchTimer() {
    if (!game || game.type !== "match" || game.phase !== "countdown") return;
    game.phase = "playing";
    game.startedAt = Date.now();
    game.endsAt = game.startedAt + 60_000;
    renderMatch();
    const updateTimer = () => {
      if (!game || game.type !== "match" || game.phase !== "playing") return;
      game.seconds = Math.max(0, Math.ceil((game.endsAt - Date.now()) / 1000));
      q("#arcade-timer").textContent = copy().time(game.seconds);
      setProgress((60 - game.seconds) / 60 * 100);
      if (game.seconds <= 0) finishGame();
    };
    updateTimer();
    timerId = setInterval(() => {
      updateTimer();
    }, 250);
  }

  function renderMatch() {
    const c = copy();
    const sheet = q("#arcade-sheet");
    if (sheet) sheet.dataset.arcadePhase = "match-playing";
    q("#arcade-round").textContent = c.pairs(game.pairs, 6);
    q("#arcade-timer").textContent = c.time(game.seconds);
    const column = (side, label) => `<div class="match-column"><span>${esc(label)}</span>${game.tiles.map((tile, index) => ({ tile, index })).filter(item => item.tile.side === side).map(({ tile, index }) => `<button class="match-tile" data-match-index="${index}" data-side="${tile.side}" lang="${tile.lang}">${esc(tile.text)}</button>`).join("")}</div>`;
    q("#arcade-stage").innerHTML = `<div class="match-board" role="group" aria-label="${esc(c.tapPair)}">${column("target", c.matchTarget)}${column("meaning", c.matchMeaning)}</div>`;
    try { sheet?.scrollTo?.({ top: 0, behavior: "auto" }); } catch (_) {}
    globalThis.requestAnimationFrame?.(() => q("#arcade-stage [data-match-index]")?.focus?.({ preventScroll: true }));
  }

  function chooseMatch(button) {
    if (!game || game.type !== "match" || game.phase !== "playing" || button.disabled) return;
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
    if (!fallback) primeWordVoice(word);
    if (fallback) setAudioStatus(c.textFallbackReady, false, { installLevel: view.level });
  }

  function startVoiceGate(base) {
    if (base.words.length < 6) return showEmpty();
    game = { ...base, words: base.words.slice(0, 6), voiceAttempts: 0, busy: false, networkPermit: false };
    renderVoiceGateQuestion();
  }

  function renderVoiceGateQuestion() {
    if (!game || game.type !== "voice") return;
    hideFeedback();
    game.answered = false;
    game.busy = false;
    game.voiceAttempts = 0;
    const c = copy();
    const word = game.words[game.round];
    const view = wordView(word);
    game.current = word;
    q("#arcade-round").textContent = c.round(game.round + 1, game.total);
    q("#arcade-timer").textContent = `${game.streak}×`;
    setProgress(game.round / game.total * 100);
    q("#arcade-stage").innerHTML = `<div class="arcade-prompt arcade-voice-gate" data-voice-gate-state="ready">
      <span class="game-chip">L${activeLevel()} · SPEAK TO UNLOCK</span>
      <div class="arcade-voice-door" aria-hidden="true"><i></i><b>${game.round + 1}</b><i></i></div>
      <h3>${esc(c.voicePrompt)}</h3>
      <p class="arcade-voice-meaning">${esc(view.meaning)}</p>
      ${phoneticHintMarkup(view.phoneticHint)}
      <span class="meaning-hint">${esc(c.voiceHint)}</span>
      <div class="arcade-voice-meter"><i style="width:0%"></i><b data-voice-score>--</b><span>/100</span></div>
      <p class="arcade-voice-status" data-voice-status role="status" aria-live="polite">${esc(c.voiceHint)}</p>
      <p class="arcade-voice-heard" data-voice-heard hidden></p>
      <div class="arcade-voice-actions"><button type="button" data-voice-demo><svg><use href="#i-volume"></use></svg>${esc(c.voiceDemo)}</button><button type="button" class="arcade-voice-mic" data-voice-start><span aria-hidden="true">●</span>${esc(c.voiceStart)}</button><button type="button" data-voice-network hidden>${esc(c.voiceNetwork)}</button></div>
    </div>`;
    primeWordVoice(word);
  }

  function updateVoiceGateResult(result = {}) {
    const score = Math.max(0, Math.min(100, Number(result.score) || 0));
    const meter = q(".arcade-voice-meter i");
    const scoreNode = q("[data-voice-score]");
    const heard = q("[data-voice-heard]");
    if (meter) meter.style.width = `${score}%`;
    if (scoreNode) scoreNode.textContent = String(score || 0);
    if (heard && result.transcript) { heard.hidden = false; heard.textContent = copy().voiceHeard(result.transcript); }
  }

  async function attemptVoiceGate(allowNetwork = false) {
    if (!game || game.type !== "voice" || game.busy || game.answered) return;
    const active = game;
    const round = game.round;
    const c = copy();
    const view = wordView(game.current);
    const scorer = window.PronunciationScorer;
    const gate = q(".arcade-voice-gate");
    const start = q("[data-voice-start]");
    const network = q("[data-voice-network]");
    if (!scorer?.recognizeTarget) {
      if (gate) gate.dataset.voiceGateState = "unavailable";
      q("[data-voice-status]").textContent = copy().voiceUnavailable;
      return;
    }
    active.busy = true;
    if (gate) gate.dataset.voiceGateState = "listening";
    if (start) start.disabled = true;
    if (network) network.hidden = true;
    q("[data-voice-status]").textContent = copy().voiceListening;
    const result = await scorer.recognizeTarget({
      target: view.target,
      lang: view.voiceLang,
      threshold: 78,
      maxMs: 7500,
      allowNetwork: allowNetwork || active.networkPermit,
      onInterim: interim => {
        if (game !== active || game.round !== round) return;
        updateVoiceGateResult(interim);
      }
    });
    if (game !== active || game.round !== round) return;
    active.busy = false;
    updateVoiceGateResult(result);
    if (result.passed) {
      active.answered = true;
      active.correct += 1;
      active.streak += 1;
      active.bestStreak = Math.max(active.bestStreak, active.streak);
      active.score += Math.max(70, 170 - active.voiceAttempts * 35) + active.streak * 15;
      setScore(active.score);
      if (gate) gate.dataset.voiceGateState = "passed";
      q("[data-voice-status]").textContent = c.voicePass(result.score);
      showFeedback(c.voicePass(result.score), `${view.target} · ${view.reading}${view.phoneticHint ? ` · 中文近音·仅助记：${view.phoneticHint}` : ""} · ${view.meaning}`, false);
      q("#arcade-next").textContent = active.round + 1 >= active.total ? c.finish : c.next;
      q("#arcade-next").classList.remove("hidden");
      vibrate([12, 32, 18]);
      celebrate({ isBest: false, score: active.score, streak: active.streak });
      return;
    }
    if (["local-missing", "network-consent"].includes(result.status)) {
      q("[data-voice-status]").textContent = c.voiceLocalMissing;
      if (network) network.hidden = false;
    } else if (["none", "insecure", "start-failed", "not-allowed", "service-not-allowed"].includes(result.status)) {
      q("[data-voice-status]").textContent = c.voiceUnavailable;
      if (gate) gate.dataset.voiceGateState = "unavailable";
    } else {
      active.voiceAttempts += 1;
      active.streak = 0;
      q("[data-voice-status]").textContent = c.voiceRetry(result.score || 0);
      if (gate) gate.dataset.voiceGateState = "retry";
      vibrate([18, 45, 18]);
    }
    if (start) start.disabled = false;
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

  function currentMonster() {
    return MONSTER_CONFIGS[Math.max(0, Math.min(MONSTER_CONFIGS.length - 1, Number(game?.monsterIndex) || 0))];
  }

  function monsterName(monster = currentMonster()) {
    return locale() === "zh" ? monster.zh : monster.th;
  }

  function monsterProgress() {
    if (!game || game.type !== "monster") return 0;
    const defeatedPart = game.monsterMaxHp > 0 ? 1 - game.monsterHp / game.monsterMaxHp : 0;
    return (game.monsterIndex + Math.max(0, Math.min(1, defeatedPart))) / MONSTER_CONFIGS.length * 100;
  }

  function primeMonsterArt() {
    if (MONSTER_ART_PRELOADS.length || typeof Image !== "function") return;
    for (const monster of MONSTER_CONFIGS) {
      const image = new Image();
      image.decoding = "async";
      image.src = monster.art;
      MONSTER_ART_PRELOADS.push(image);
    }
  }

  function startMonsterBattle(base) {
    if (base.words.length < 16) return showEmpty();
    primeMonsterArt();
    const monster = MONSTER_CONFIGS[0];
    game = {
      ...base,
      playerHp: MONSTER_PLAYER_MAX_HP,
      monsterIndex: 0,
      monsterHp: monster.hp,
      monsterMaxHp: monster.hp,
      answeredCount: 0,
      monstersDefeated: 0,
      remainingMs: MONSTER_TURN_MS,
      timerActive: false,
      monsterVictory: false,
      monsterEntering: true,
      busy: false,
      networkPermit: false
    };
    const sheet = q("#arcade-sheet");
    if (sheet) sheet.dataset.arcadePhase = "monster-ready";
    document.body?.classList?.add?.("arcade-monster-active");
    renderMonsterReady();
  }

  function renderMonsterReady() {
    if (!game || game.type !== "monster") return;
    clearInterval(timerId); timerId = 0;
    hideFeedback();
    const c = copy();
    const monster = currentMonster();
    q("#arcade-round").textContent = locale() === "zh" ? "战前准备" : "เตรียมต่อสู้";
    q("#arcade-timer").textContent = "10.0";
    setProgress(0);
    q("#arcade-stage").innerHTML = `<section class="arcade-monster-ready" aria-labelledby="monster-ready-title">
      <div class="arcade-monster-ready-art ${monster.boss ? "is-boss" : ""}" data-monster-id="${monster.id}" style="--monster:${monster.color};--monster-accent:${monster.accent};--monster-scene:${monster.scene};--monster-ground:${monster.ground}"><span>${esc(monsterName(monster))}</span><img src="${esc(monster.art)}" alt="" draggable="false" decoding="async" /></div>
      <p>${esc(c.monsterStage(1, MONSTER_CONFIGS.length))}</p>
      <h3 id="monster-ready-title">${esc(c.monsterReadyTitle)}</h3>
      <div class="arcade-monster-ready-copy">${esc(c.monsterReadyCopy)}</div>
      <div class="arcade-monster-ready-rules">${c.monsterReadyRules.map((rule, index) => `<span><i>${index + 1}</i><b>${esc(rule)}</b></span>`).join("")}</div>
      <button type="button" data-monster-start><span>${esc(c.monsterStart)}</span><b>→</b></button>
    </section>`;
    globalThis.requestAnimationFrame?.(() => q("[data-monster-start]")?.focus?.({ preventScroll: true }));
  }

  function updateMonsterHud() {
    if (!game || game.type !== "monster") return;
    const playerHp = Math.max(0, game.playerHp);
    const monsterHp = Math.max(0, game.monsterHp);
    const playerBar = q("[data-monster-player-bar]");
    const monsterBar = q("[data-monster-enemy-bar]");
    const playerValue = q("[data-monster-player-hp]");
    const monsterValue = q("[data-monster-enemy-hp]");
    const playerHealth = q(".arcade-monster-health.is-player");
    const monsterHealth = q(".arcade-monster-health.is-enemy");
    if (playerBar) playerBar.style.width = `${playerHp / MONSTER_PLAYER_MAX_HP * 100}%`;
    if (monsterBar) monsterBar.style.width = `${game.monsterMaxHp > 0 ? monsterHp / game.monsterMaxHp * 100 : 0}%`;
    if (playerValue) playerValue.textContent = `${playerHp}/${MONSTER_PLAYER_MAX_HP}`;
    if (monsterValue) monsterValue.textContent = `${monsterHp}/${game.monsterMaxHp}`;
    if (playerHealth) playerHealth.setAttribute("aria-label", `${copy().monsterPlayer} ${playerHp}/${MONSTER_PLAYER_MAX_HP}`);
    if (monsterHealth) monsterHealth.setAttribute("aria-label", `${currentMonster().boss ? copy().monsterBoss : copy().monsterEnemy} ${monsterHp}/${game.monsterMaxHp}`);
    setProgress(monsterProgress());
  }

  function updateMonsterTimer() {
    if (!game || game.type !== "monster" || game.answered || !game.timerActive) return;
    game.remainingMs = Math.max(0, MONSTER_TURN_MS - (Date.now() - game.questionStartedAt));
    const seconds = (game.remainingMs / 1000).toFixed(1);
    const bar = q("[data-monster-time-bar]");
    if (bar) bar.style.width = `${game.remainingMs / MONSTER_TURN_MS * 100}%`;
    const power = q("[data-monster-power]");
    if (power) power.textContent = copy().monsterPower(monsterDamage(game.remainingMs, game.streak));
    q("#arcade-timer").textContent = copy().monsterTime(seconds);
    if (game.remainingMs <= 0) settleMonsterAnswer(-1, true);
  }

  function renderMonsterQuestion() {
    if (!game || game.type !== "monster") return;
    clearInterval(timerId); timerId = 0;
    hideFeedback();
    game.answered = false;
    game.busy = false;
    game.remainingMs = MONSTER_TURN_MS;
    game.timerActive = false;
    const c = copy();
    const monster = currentMonster();
    const monsterEntering = Boolean(game.monsterEntering);
    const word = game.words[game.round % game.words.length];
    const view = wordView(word);
    game.current = word;
    game.options = makeWordOptions(word);
    game.questionStartedAt = 0;
    const sheet = q("#arcade-sheet");
    if (sheet) sheet.dataset.arcadePhase = "monster-playing";
    q("#arcade-round").textContent = c.monsterStage(game.monsterIndex + 1, MONSTER_CONFIGS.length);
    q("#arcade-timer").textContent = c.monsterTime("10.0");
    setProgress(monsterProgress());
    q("#arcade-stage").innerHTML = `<div class="arcade-monster-world ${monster.boss ? "is-boss" : ""}" data-monster-id="${monster.id}" data-monster-state="${monsterEntering ? "enter" : "ready"}" style="--monster:${monster.color};--monster-accent:${monster.accent};--monster-scene:${monster.scene};--monster-ground:${monster.ground}">
      <div class="arcade-monster-hud">
        <div class="arcade-monster-health is-player" aria-label="${esc(c.monsterPlayer)} ${game.playerHp}"><span><b>${esc(c.monsterPlayer)}</b><strong data-monster-player-hp>${game.playerHp}/${MONSTER_PLAYER_MAX_HP}</strong></span><i><em data-monster-player-bar style="width:${game.playerHp}%"></em></i></div>
        <div class="arcade-monster-health is-enemy" aria-label="${esc(c.monsterEnemy)} ${game.monsterHp}"><span><b>${esc(monster.boss ? c.monsterBoss : c.monsterEnemy)}</b><strong data-monster-enemy-hp>${game.monsterHp}/${game.monsterMaxHp}</strong></span><i><em data-monster-enemy-bar style="width:${game.monsterMaxHp > 0 ? game.monsterHp / game.monsterMaxHp * 100 : 0}%"></em></i></div>
      </div>
      <div class="arcade-monster-battlefield">
        <div class="arcade-monster-scenery" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="arcade-player-avatar" aria-hidden="true"><i></i><span>勇</span><small>${esc(c.monsterCrest)}</small></div>
        <div class="arcade-monster-aura" aria-hidden="true"></div>
        <div class="arcade-monster-avatar" aria-hidden="true"><span class="arcade-monster-shadow"></span><img class="arcade-monster-echo" src="${esc(monster.art)}" alt="" draggable="false" decoding="async" /><img class="arcade-monster-sprite" src="${esc(monster.art)}" alt="" draggable="false" decoding="async" /><i class="arcade-monster-shard shard-one"></i><i class="arcade-monster-shard shard-two"></i><i class="arcade-monster-shard shard-three"></i></div>
        <div class="arcade-monster-strike" aria-hidden="true"><i></i><i></i><i></i></div>
        <strong class="arcade-monster-impact" data-monster-impact hidden></strong>
        <div class="arcade-monster-name"><small>${esc(monster.boss ? c.monsterBoss : c.monsterStage(game.monsterIndex + 1, MONSTER_CONFIGS.length))}</small><b>${esc(monsterName(monster))}</b></div>
      </div>
      <div class="arcade-monster-time"><i><em data-monster-time-bar style="width:100%"></em></i><b><span>${esc(c.monsterRule)}</span><strong data-monster-power>${esc(c.monsterPower(monsterDamage(MONSTER_TURN_MS, game.streak)))}</strong></b></div>
      <p class="arcade-monster-status" data-monster-status role="status" aria-live="assertive">${esc(c.monsterReady)}</p>
    </div>
    <div class="arcade-monster-question"><span class="game-chip">L${activeLevel()} · ${locale() === "zh" ? "声音攻击" : "โจมตีด้วยเสียง"}</span><div class="arcade-monster-word"><button type="button" data-monster-audio disabled aria-label="${esc(c.monsterHear)}"><svg><use href="#i-volume"></use></svg></button><div><h3 lang="${view.lang}">${esc(view.target)}</h3><p>${esc(view.reading)}</p></div></div>${phoneticHintMarkup(view.phoneticHint)}<span class="meaning-hint">${esc(c.monsterPrompt)}</span></div>
    <div class="arcade-monster-cue"><button type="button" data-monster-arm><svg><use href="#i-volume"></use></svg><span>${esc(c.monsterArm)}</span></button></div>
    <div class="arcade-monster-attack"><button type="button" data-monster-voice disabled><span class="arcade-monster-wave" aria-hidden="true"><i></i><i></i><i></i><i></i></span><b>${esc(c.monsterVoice)}</b><small>${esc(c.monsterVoiceHint)}</small></button><button type="button" data-monster-network hidden>${esc(c.monsterNetwork)}</button><p>${esc(c.monsterFallback)}</p></div>
    <div class="arcade-options arcade-monster-options">${game.options.map((option, index) => `<button type="button" class="arcade-option" data-monster-answer="${index}" disabled ${choiceShortcutAttrs(index)}><span>${c.answerLetters[index]}</span><span class="arcade-option-copy"><b>${esc(option.view.meaning)}</b></span></button>`).join("")}</div>`;
    primeWordVoice(word);
    if (monsterEntering) {
      game.monsterEntering = false;
      const enteringIndex = game.monsterIndex;
      schedule(() => {
        if (!game || game.type !== "monster" || game.monsterIndex !== enteringIndex) return;
        const world = q(".arcade-monster-world");
        if (world?.dataset.monsterState === "enter") world.dataset.monsterState = "ready";
      }, 760);
    }
    globalThis.requestAnimationFrame?.(() => q("#arcade-stage [data-monster-arm]")?.focus?.({ preventScroll: true }));
  }

  function startMonsterTimer(audioFailed = false) {
    if (!game || game.type !== "monster" || game.answered || game.timerActive) return;
    game.busy = false;
    game.timerActive = true;
    game.remainingMs = MONSTER_TURN_MS;
    game.questionStartedAt = Date.now();
    const arm = q("[data-monster-arm]");
    if (arm) arm.closest(".arcade-monster-cue").hidden = true;
    setMonsterControlsDisabled(false);
    const world = q(".arcade-monster-world");
    if (world) world.dataset.monsterState = "ready";
    const status = q("[data-monster-status]");
    if (status) status.textContent = audioFailed ? copy().monsterCueFailed : copy().monsterGo;
    clearInterval(timerId);
    timerId = setInterval(updateMonsterTimer, 100);
    updateMonsterTimer();
    q("[data-monster-voice]")?.focus?.({ preventScroll: true });
  }

  function beginMonsterTurn() {
    if (!game || game.type !== "monster" || game.answered || game.timerActive || game.busy) return;
    const active = game;
    const round = game.round;
    game.busy = true;
    const arm = q("[data-monster-arm]");
    if (arm) arm.disabled = true;
    const world = q(".arcade-monster-world");
    if (world) world.dataset.monsterState = "cue";
    const status = q("[data-monster-status]");
    if (status) status.textContent = copy().monsterCuePlaying;
    let completed = false;
    const finish = audioFailed => {
      if (completed || game !== active || game.round !== round || game.answered) return;
      completed = true;
      startMonsterTimer(Boolean(audioFailed));
    };
    schedule(() => finish(true), 7000);
    void playWordVoice(game.current, { onEnd: () => finish(false), onError: () => finish(true) });
  }

  function setMonsterControlsDisabled(disabled) {
    [...document.querySelectorAll("#arcade-stage [data-monster-answer], #arcade-stage [data-monster-voice], #arcade-stage [data-monster-audio]")].forEach(button => {
      button.disabled = Boolean(disabled);
    });
  }

  function resumeMonsterTimer(remainingMs) {
    if (!game || game.type !== "monster" || game.answered) return;
    const safeRemaining = Math.max(250, Math.min(MONSTER_TURN_MS, Number(remainingMs) || 0));
    game.questionStartedAt = Date.now() - (MONSTER_TURN_MS - safeRemaining);
    game.remainingMs = safeRemaining;
    game.timerActive = true;
    clearInterval(timerId);
    timerId = setInterval(updateMonsterTimer, 100);
    updateMonsterTimer();
  }

  async function attemptMonsterVoice(allowNetwork = false) {
    if (!game || game.type !== "monster" || game.answered || game.busy || !game.timerActive) return;
    const active = game;
    const round = game.round;
    const scorer = window.PronunciationScorer;
    const c = copy();
    const view = wordView(game.current);
    const world = q(".arcade-monster-world");
    const status = q("[data-monster-status]");
    const voiceButton = q("[data-monster-voice]");
    const networkButton = q("[data-monster-network]");
    if (!scorer?.recognizeTarget) {
      if (status) status.textContent = c.monsterUnavailable;
      return;
    }
    game.busy = true;
    const remainingAtSpeechStart = Math.max(300, game.remainingMs);
    let speechStartedAt = 0;
    clearInterval(timerId); timerId = 0;
    setMonsterControlsDisabled(true);
    if (networkButton) networkButton.hidden = true;
    if (voiceButton) voiceButton.setAttribute("aria-busy", "true");
    if (world) world.dataset.monsterState = "listening";
    if (status) status.textContent = c.monsterListening;
    const result = await scorer.recognizeTarget({
      target: view.target,
      lang: view.voiceLang,
      threshold: 78,
      maxMs: 7000,
      allowNetwork: allowNetwork || active.networkPermit,
      onStatus: value => { if (value === "listening" && !speechStartedAt) speechStartedAt = Date.now(); },
      onInterim: interim => {
        if (game !== active || game.round !== round || game.answered) return;
        if (status) status.textContent = c.monsterJudging(interim.transcript || "");
      }
    });
    if (game !== active || game.round !== round || game.answered) return;
    game.busy = false;
    if (voiceButton) voiceButton.removeAttribute("aria-busy");
    const speechElapsed = speechStartedAt ? Math.min(2500, Math.max(450, Date.now() - speechStartedAt)) : 450;
    const judgedRemaining = Math.max(250, remainingAtSpeechStart - speechElapsed);
    if (result.passed) {
      game.questionStartedAt = Date.now() - (MONSTER_TURN_MS - judgedRemaining);
      game.remainingMs = judgedRemaining;
      const correctIndex = game.options.findIndex(item => item.correct);
      return settleMonsterAnswer(correctIndex, false, { voice: true, passed: true, score: result.score || 0 });
    }
    if (["local-missing", "network-consent"].includes(result.status)) {
      if (world) world.dataset.monsterState = "ready";
      if (status) status.textContent = c.monsterLocalMissing;
      if (networkButton) networkButton.hidden = false;
      setMonsterControlsDisabled(false);
      resumeMonsterTimer(judgedRemaining);
      return;
    }
    if (["none", "insecure", "start-failed", "not-allowed", "service-not-allowed"].includes(result.status)) {
      if (world) world.dataset.monsterState = "ready";
      if (status) status.textContent = c.monsterUnavailable;
      setMonsterControlsDisabled(false);
      resumeMonsterTimer(judgedRemaining);
      return;
    }
    game.questionStartedAt = Date.now() - (MONSTER_TURN_MS - judgedRemaining);
    game.remainingMs = judgedRemaining;
    return settleMonsterAnswer(-1, false, { voice: true, passed: false, score: result.score || 0 });
  }

  function finishMonsterBattle(victory) {
    if (!game || game.type !== "monster") return;
    document.body?.classList?.remove?.("arcade-monster-active");
    game.monsterVictory = Boolean(victory);
    game.total = Math.max(1, game.answeredCount);
    if (victory) game.score += 500 + Math.max(0, game.playerHp) * 5;
    finishGame();
  }

  function settleMonsterAnswer(index, timedOut = false, answerMeta = {}) {
    if (!game || game.type !== "monster" || game.answered || !game.timerActive) return;
    const active = game;
    const option = index >= 0 ? game.options[index] : null;
    if (!timedOut && !option && !answerMeta.voice) return;
    game.answered = true;
    game.timerActive = false;
    clearInterval(timerId); timerId = 0;
    game.remainingMs = Math.max(0, MONSTER_TURN_MS - (Date.now() - game.questionStartedAt));
    const correctIndex = game.options.findIndex(item => item.correct);
    const correct = !timedOut && (answerMeta.voice ? Boolean(answerMeta.passed) : Boolean(option?.correct));
    const view = wordView(game.current);
    const world = q(".arcade-monster-world");
    const status = q("[data-monster-status]");
    const impact = q("[data-monster-impact]");
    markButtons("#arcade-stage [data-monster-answer]", timedOut ? -1 : index, correctIndex);
    game.answeredCount += 1;
    game.round += 1;

    if (correct) {
      const comboBonus = Math.min(12, game.streak * 3);
      const damage = monsterDamage(game.remainingMs, game.streak);
      const seconds = ((MONSTER_TURN_MS - game.remainingMs) / 1000).toFixed(1);
      const critical = game.remainingMs >= MONSTER_TURN_MS * .72;
      game.correct += 1;
      game.streak += 1;
      game.bestStreak = Math.max(game.bestStreak, game.streak);
      game.monsterHp = Math.max(0, game.monsterHp - damage);
      game.score += damage * 10;
      const defeated = game.monsterHp <= 0;
      let message = `${answerMeta.voice ? `${copy().monsterVoicePass(answerMeta.score || 0)} · ` : ""}${copy().monsterHit(damage, seconds, critical, comboBonus)}`;
      if (defeated) {
        const bonus = 200 + game.monsterIndex * 100;
        game.score += bonus;
        game.monstersDefeated += 1;
        message = `${message} · ${copy().monsterDown(monsterName(), bonus)}`;
      }
      if (world) world.dataset.monsterState = defeated ? "down" : "hit";
      if (impact) { impact.hidden = false; impact.textContent = `-${damage}`; }
      if (status) status.textContent = message;
      vibrate(critical ? [18, 22, 34] : [14, 24, 18]);
    } else {
      const counterDamage = timedOut ? 16 : 12;
      game.playerHp = Math.max(0, game.playerHp - counterDamage);
      game.streak = 0;
      if (world) world.dataset.monsterState = "counter";
      if (impact) { impact.hidden = false; impact.textContent = `-${counterDamage} HP`; }
      if (status) status.textContent = `${timedOut ? copy().monsterTimeout(counterDamage) : answerMeta.voice ? copy().monsterVoiceFail(answerMeta.score || 0) : copy().monsterCounter(counterDamage)} · ${copy().monsterReveal(view.target, view.meaning)}`;
      vibrate([22, 45, 22]);
    }

    setScore(game.score);
    updateMonsterHud();
    const monsterWasDefeated = correct && game.monsterHp <= 0;
    const continueAfterImpact = () => {
      if (game !== active || game.type !== "monster") return;
      if (game.playerHp <= 0) return finishMonsterBattle(false);
      if (monsterWasDefeated) {
        if (game.monsterIndex + 1 >= MONSTER_CONFIGS.length) return finishMonsterBattle(true);
        game.monsterIndex += 1;
        const next = currentMonster();
        game.monsterHp = next.hp;
        game.monsterMaxHp = next.hp;
        game.monsterEntering = true;
      }
      renderMonsterQuestion();
    };
    beginSkippableTransition(continueAfterImpact, monsterWasDefeated ? 1050 : 760);
    mountTransitionSkip();
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

  function buildGradeLockItems(count, focusGrade = activeRegisterGrade(), sourcePacks = gradePracticePacks(focusGrade)) {
    const packs = shuffle(sourcePacks).filter(pack => pack.variants.some(variant => variant.grade === focusGrade));
    return packs.slice(0, Math.max(0, Number(count) || 0)).map(pack => {
      const distractors = shuffle(packs.filter(candidate => candidate.id !== pack.id)).slice(0, 3);
      const optionPacks = [pack, ...distractors];
      return {
        pack,
        variant: pack.variants.find(candidate => candidate.grade === focusGrade),
        options: shuffle(optionPacks.map(candidate => ({
          pack: candidate,
          variant: candidate.variants.find(variant => variant.grade === focusGrade),
          correct: candidate.id === pack.id
        })))
      };
    }).filter(item => item.options.length >= 4 && item.options.every(option => option.variant));
  }

  function buildSceneListenItems(count, focusGrade = activeRegisterGrade(), sourcePacks = gradePracticePacks(focusGrade)) {
    const packs = shuffle(sourcePacks).filter(pack => pack.variants.some(variant => variant.grade === focusGrade));
    return packs.slice(0, Math.max(0, Number(count) || 0)).map(pack => {
      const distractors = shuffle(packs.filter(candidate => candidate.id !== pack.id)).slice(0, 3);
      return {
        pack,
        variant: pack.variants.find(candidate => candidate.grade === focusGrade),
        options: shuffle([{ pack, correct: true }, ...distractors.map(candidate => ({ pack: candidate, correct: false }))])
      };
    }).filter(item => item.options.length >= 4);
  }

  function buildRegisterShiftOptions(pack, focusGrade) {
    const target = pack.variants.find(variant => variant.id === pack.recommendedVariantId);
    const source = pack.variants.find(variant => variant.grade === focusGrade);
    if (!target || !source) return [];
    const safeGrades = ["S5", "S4", "S3"];
    const comparisonGrades = [focusGrade, ...safeGrades].filter((grade, index, rows) => rows.indexOf(grade) === index);
    const comparisons = comparisonGrades
      .map(grade => pack.variants.find(variant => variant.grade === grade))
      .filter(variant => variant && variant.id !== target.id && variant.id !== source.id);
    const variants = [target];
    if (source.id !== target.id) variants.push(source);
    variants.push(...shuffle(comparisons));
    return shuffle(variants.slice(0, 3).map(variant => ({ variant, correct: variant.id === target.id })));
  }

  function buildRegisterShiftItems(count, focusGrade = activeRegisterGrade(), sourcePacks = gradePracticePacks(focusGrade)) {
    const preferred = shuffle(sourcePacks).filter(pack => pack.recommendedGrade !== focusGrade);
    const fallback = shuffle(sourcePacks).filter(pack => pack.recommendedGrade === focusGrade);
    return [...preferred, ...fallback].map(pack => ({
      pack,
      source: pack.variants.find(variant => variant.grade === focusGrade),
      target: pack.variants.find(variant => variant.id === pack.recommendedVariantId),
      options: buildRegisterShiftOptions(pack, focusGrade)
    })).filter(item => item.source && item.target && item.options.length >= 3).slice(0, Math.max(0, Number(count) || 0));
  }

  function registerOptionMarkup(pack, option, index, dataName) {
    const c = copy();
    const view = packView(option.variant);
    const letter = c.answerLetters[index];
    const risk = ["S1", "S2"].includes(option.variant.grade) ? " risk-choice" : "";
    return `<div class="register-choice-row${risk}"><button type="button" class="arcade-option register-choice${risk}" data-${dataName}="${index}" ${choiceShortcutAttrs(index)}><span>${letter}</span><span class="arcade-option-copy"><b lang="${view.lang}">${esc(view.target)}</b><small>${esc(view.reading)}</small>${phoneticHintMarkup(view.phoneticHint)}</span></button><button type="button" class="register-option-audio${risk}" data-register-option-audio="${index}" data-speech-policy="native" aria-label="${esc(c.previewOption(letter))}" aria-keyshortcuts="Shift+${letter}"><svg aria-hidden="true"><use href="#i-volume"></use></svg></button></div>`;
  }

  function startGradeLock(base) {
    if (!base.items.length) return showEmpty("register");
    game = base;
    renderGradeLockQuestion();
  }

  function renderGradeLockQuestion() {
    hideFeedback(); game.answered = false;
    const c = copy(); const item = game.items[game.round]; const pack = item.pack; const variant = item.variant;
    if (!variant) return showEmpty("register");
    game.current = item; game.options = item.options;
    q("#arcade-round").textContent = c.round(game.round + 1, game.total); q("#arcade-timer").textContent = `${game.streak}×`; setProgress(game.round / game.total * 100);
    const scene = sceneView(pack);
    q("#arcade-stage").innerHTML = `<div class="arcade-prompt compact-register-prompt"><span class="game-chip">${esc(c.currentRegister(game.grade))}</span>${contextMarkup(pack)}<h3>${esc(c.gradeLockPrompt(game.grade))}</h3><p lang="${scene.lang}">${esc(scene.intent)}</p><span class="meaning-hint">${esc(scene.context)} · ${esc(c.tapToHear)}</span><small id="arcade-audio-status" role="status" aria-live="polite"></small></div><div class="arcade-options register-choice-options">${game.options.map((option, index) => registerOptionMarkup(option.pack, option, index, "grade-lock")).join("")}</div>`;
  }

  function startSceneListen(base) {
    if (!base.items.length) return showEmpty("register");
    game = base;
    renderSceneListenQuestion();
  }

  function renderSceneListenQuestion() {
    hideFeedback(); game.answered = false;
    const c = copy(); const item = game.items[game.round]; game.current = item; game.options = item.options;
    q("#arcade-round").textContent = c.round(game.round + 1, game.total); q("#arcade-timer").textContent = `${game.streak}×`; setProgress(game.round / game.total * 100);
    q("#arcade-stage").innerHTML = `<div class="arcade-prompt compact-register-prompt"><span class="game-chip">${esc(c.currentRegister(game.grade))} · LISTEN</span><h3>${esc(c.sceneListenPrompt(game.grade))}</h3><button class="arcade-audio-orb" data-register-audio aria-label="${esc(c.playSentence)}"><svg><use href="#i-volume"></use></svg></button><span class="meaning-hint">${esc(c.sceneListenHint)}</span><small id="arcade-audio-status" role="status" aria-live="polite"></small></div><div class="arcade-options scene-choice-options">${game.options.map((option, index) => { const scene = sceneView(option.pack); return `<button type="button" class="arcade-option scene-choice" data-scene-listen="${index}" ${choiceShortcutAttrs(index)}><span>${c.answerLetters[index]}</span><span class="arcade-option-copy"><b lang="${scene.lang}">${esc(scene.intent)}</b><small>${esc(scene.context)}</small></span></button>`; }).join("")}</div>`;
  }

  function startRegisterShift(base) {
    if (!base.items.length) return showEmpty("register");
    game = base;
    renderRegisterShiftQuestion();
  }

  function renderRegisterShiftQuestion() {
    hideFeedback(); game.answered = false;
    const c = copy(); const item = game.items[game.round]; const sourceView = packView(item.source); game.current = item; game.options = item.options;
    q("#arcade-round").textContent = c.round(game.round + 1, game.total); q("#arcade-timer").textContent = `${game.streak}×`; setProgress(game.round / game.total * 100);
    q("#arcade-stage").innerHTML = `<div class="arcade-prompt compact-register-prompt"><span class="game-chip">${esc(c.currentRegister(game.grade))} → ${esc(c.targetRegister(item.target.grade))}</span>${contextMarkup(item.pack)}<button class="arcade-register-audio" data-register-audio aria-label="${esc(c.playSentence)}"><svg><use href="#i-volume"></use></svg></button><small id="arcade-audio-status" role="status" aria-live="polite"></small><h3 lang="${sourceView.lang}">${esc(sourceView.target)}</h3><p>${esc(sourceView.reading)}</p>${phoneticHintMarkup(sourceView.phoneticHint)}<span class="meaning-hint">${esc(c.shiftPrompt(game.grade, item.target.grade))}<br>${esc(c.tapToHear)}</span></div><div class="arcade-options register-choice-options">${game.options.map((option, index) => registerOptionMarkup(item.pack, option, index, "register-shift")).join("")}</div>`;
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

  function chooseRegisterGameAnswer(type, index) {
    if (!game || game.type !== type || game.answered) return;
    const option = game.options[index];
    if (!option) return;
    game.answered = true;
    const selectors = {
      "grade-lock": "#arcade-stage [data-grade-lock]",
      "scene-listen": "#arcade-stage [data-scene-listen]",
      "register-shift": "#arcade-stage [data-register-shift]"
    };
    const correctIndex = game.options.findIndex(item => item.correct);
    const correct = Boolean(option.correct);
    markButtons(selectors[type], index, correctIndex);
    if (option.variant?.grade === "S1") playRegisterVariant(option.pack || game.current.pack, option.variant);
    if (correct) {
      game.correct += 1; game.streak += 1; game.bestStreak = Math.max(game.bestStreak, game.streak);
      game.score += (type === "register-shift" ? 160 : type === "scene-listen" ? 140 : 130) + game.streak * 14;
      vibrate(12);
    } else { game.streak = 0; vibrate([18,45,18]); }
    setScore(game.score);
    const c = copy();
    let title = correct ? c.correct : c.wrong;
    let body = "";
    let risk = false;
    if (type === "grade-lock") {
      const actual = game.current.variant; const view = packView(actual);
      title = correct ? c.gradeLockCorrect(actual.grade) : c.toneWrong(actual.grade);
      body = `${view.target} · ${view.reading} — ${view.note || view.meaning}${["S1", "S2"].includes(actual.grade) ? ` · ${c.riskTag}` : ""}`;
      risk = ["S1", "S2"].includes(actual.grade);
    }
    if (type === "scene-listen") {
      const item = game.current; const view = packView(item.variant); const context = contextView(item.pack);
      title = correct ? c.sceneCorrect : c.wrong;
      body = `${view.target} · ${view.reading} — ${view.meaning}${context ? ` · ${c.contextSetting}: ${context.setting} · ${c.contextRelationship}: ${context.relationship}` : ""}${["S1", "S2"].includes(item.variant.grade) ? ` · ${c.riskTag}` : ""}`;
      risk = ["S1", "S2"].includes(item.variant.grade);
    }
    if (type === "register-shift") {
      const item = game.current; const view = packView(item.target); const context = contextView(item.pack);
      title = correct ? c.shiftCorrect(item.target.grade) : c.polishWrong;
      body = `${view.target} · ${view.reading} — ${context ? c.recommendation(context.recommendedGrade, context.why) : c.contextMissing}`;
    }
    showFeedback(title, body, risk);
    q("#arcade-next").textContent = game.round + 1 >= game.total ? c.finish : c.next;
    q("#arcade-next").classList.remove("hidden");
  }

  function nextRound() {
    if (!game) return;
    game.round += 1;
    if (game.round >= game.total) return finishGame();
    if (game.type === "voice") renderVoiceGateQuestion();
    if (game.type === "audio") renderWordQuestion();
    if (game.type === "tone") renderToneQuestion();
    if (game.type === "polish") renderPolishQuestion();
    if (game.type === "grade-lock") renderGradeLockQuestion();
    if (game.type === "scene-listen") renderSceneListenQuestion();
    if (game.type === "register-shift") renderRegisterShiftQuestion();
  }

  function finishGame() {
    if (!game) return; clearTimers();
    const c = copy(); const finished = game; const score = Math.max(0, Math.round(game.score)); const stats = readStats(); const previous = Number(stats[game.type]?.best || 0); const isBest = score > previous;
    stats[game.type] = { best: Math.max(previous, score), plays: Number(stats[game.type]?.plays || 0) + 1, updatedAt: Date.now() }; writeStats(stats);
    const attempts = game.type === "match" ? 6 : (game.type === "speed" ? Math.max(game.round, game.correct) : (game.type === "monster" ? Math.max(1, game.answeredCount) : game.total));
    const monsterResult = game.type === "monster";
    const resultTitle = monsterResult ? (finished.monsterVictory ? c.monsterVictory : c.monsterDefeat) : c.done;
    const resultCopy = monsterResult ? (finished.monsterVictory ? c.monsterVictoryCopy : c.monsterDefeatCopy) : (isBest ? c.newBest : c.keep);
    const resultMark = monsterResult ? (finished.monsterVictory ? "✓" : "↻") : (score >= 900 ? "S" : score >= 600 ? "A" : score >= 350 ? "B" : "C");
    const accuracy = Math.round(finished.correct / Math.max(1, attempts) * 100);
    const monsterCoach = monsterResult
      ? (locale() === "zh"
        ? `本局命中率 ${accuracy}% · ${accuracy >= 80 ? "设备识别和反应都稳住了，可以继续冲更快伤害。" : "先慢听易错词，再战时会更容易打出连击。"}`
        : `ความแม่นยำรอบนี้ ${accuracy}% · ${accuracy >= 80 ? "ทั้งเสียงและปฏิกิริยานิ่งแล้ว ลองเร่งดาเมจให้สูงขึ้น" : "ฟังคำที่พลาดแบบช้า ๆ แล้วกลับมาสร้างคอมโบอีกครั้ง"}`)
      : "";
    const monsterPath = monsterResult
      ? `<div class="arcade-monster-result-path" aria-label="${locale() === "zh" ? "怪物进度" : "ความคืบหน้ามอนสเตอร์"}">${MONSTER_CONFIGS.map((monster, index) => `<span class="${index < finished.monstersDefeated ? "is-down" : ""}"><i>${index < finished.monstersDefeated ? "✓" : index + 1}</i><b>${esc(monsterName(monster))}</b></span>`).join("")}</div><p class="arcade-result-coach">${esc(monsterCoach)}</p>`
      : "";
    q("#arcade-round").textContent = resultTitle; q("#arcade-timer").textContent = "✓"; setProgress(100); setScore(score); hideFeedback();
    q("#arcade-stage").innerHTML = `<div class="arcade-result ${monsterResult ? "arcade-monster-result" : ""}"><div class="arcade-result-mark">${resultMark}</div><h3>${esc(resultTitle)}</h3><p>${esc(resultCopy)}</p>${monsterPath}<div class="arcade-result-stats"><span><b>${score.toLocaleString()}</b><small>${esc(c.statScore)}</small></span><span><b>${finished.correct}/${attempts}</b><small>${esc(c.statRight)}</small></span><span><b>${finished.bestStreak}×</b><small>${esc(c.statCombo)}</small></span></div><div class="arcade-result-actions"><button id="arcade-replay">${esc(c.replay)}</button>${monsterResult ? `<button type="button" data-arcade-exit>${locale() === "zh" ? "回练习场" : "กลับสนามฝึก"}</button>` : ""}</div></div>`;
    celebrate({ isBest, score, streak: finished.bestStreak });
    renderHall(); vibrate([15,55,15]);
  }

  function showEmpty(kind = "words") {
    clearTimers(); game = null;
    const message = kind === "register" ? copy().noData : copy().wordFallback;
    q("#arcade-stage").innerHTML = `<div class="arcade-result"><div class="arcade-result-mark">…</div><h3>${esc(message)}</h3></div>`;
  }

  function closeGame() {
    clearTimers();
    document.body?.classList?.remove?.("arcade-monster-active");
    game = null;
    const sheet = q("#arcade-sheet");
    if (sheet) delete sheet.dataset.arcadePhase;
  }

  function handleGameKeydown(event) {
    if (!game || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target?.closest?.("input, textarea, select, [contenteditable='true']")) return;
    const sheet = q("#arcade-sheet");
    if (!sheet || sheet.classList.contains("hidden")) return;
    const key = String(event.key || "").toUpperCase();
    const byLetter = copy().answerLetters.indexOf(key);
    const byNumber = /^[1-5]$/.test(key) ? Number(key) - 1 : -1;
    const index = byLetter >= 0 ? byLetter : byNumber;
    if (index >= 0) {
      if (event.shiftKey) {
        const previews = [...document.querySelectorAll("#arcade-stage [data-register-option-audio]")].filter(button => !button.disabled);
        if (previews[index]) { event.preventDefault(); previews[index].click(); }
        return;
      }
      const options = [...document.querySelectorAll("#arcade-stage [data-monster-answer], #arcade-stage [data-answer], #arcade-stage [data-grade], #arcade-stage [data-polish], #arcade-stage [data-grade-lock], #arcade-stage [data-scene-listen], #arcade-stage [data-register-shift]")].filter(button => !button.disabled);
      if (options[index]) { event.preventDefault(); options[index].click(); }
      return;
    }
    if (key === "R") {
      const replay = q("#arcade-stage [data-register-audio], #arcade-stage #arcade-play-audio");
      if (replay) { event.preventDefault(); replay.click(); }
      return;
    }
    if (key === "N" && !q("#arcade-next")?.classList.contains("hidden")) {
      event.preventDefault(); q("#arcade-next").click();
    }
  }

  function bindEvents() {
    q("#arcade-grid").addEventListener("click", event => { const button = event.target.closest("[data-game]"); if (button && !button.disabled) openGame(button.dataset.game); });
    q("#arcade-expand")?.addEventListener("click", () => { hallExpanded = !hallExpanded; syncHallExpansion(); });
    q("#arcade-stage").addEventListener("click", event => {
      const transition = event.target.closest("[data-arcade-transition]");
      if (transition && completeSkippableTransition()) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      const monsterStart = event.target.closest("[data-monster-start]"); if (monsterStart) return renderMonsterQuestion();
      const monsterArm = event.target.closest("[data-monster-arm]"); if (monsterArm) return beginMonsterTurn();
      const matchStart = event.target.closest("[data-match-start]"); if (matchStart) return beginMatchCountdown();
      const match = event.target.closest("[data-match-index]"); if (match) return chooseMatch(match);
      const audio = event.target.closest("#arcade-play-audio"); if (audio && game?.current) { playWordVoice(game.current); return; }
      const voiceDemo = event.target.closest("[data-voice-demo]"); if (voiceDemo && game?.type === "voice" && game.current) { playWordVoice(game.current); return; }
      const voiceStart = event.target.closest("[data-voice-start]"); if (voiceStart) { attemptVoiceGate(false); return; }
      const voiceNetwork = event.target.closest("[data-voice-network]"); if (voiceNetwork) { if (game) game.networkPermit = true; attemptVoiceGate(true); return; }
      const monsterAudio = event.target.closest("[data-monster-audio]"); if (monsterAudio && game?.type === "monster" && game.current) { playWordVoice(game.current); return; }
      const monsterVoice = event.target.closest("[data-monster-voice]"); if (monsterVoice) { attemptMonsterVoice(false); return; }
      const monsterNetwork = event.target.closest("[data-monster-network]"); if (monsterNetwork) { if (game) game.networkPermit = true; attemptMonsterVoice(true); return; }
      const monsterAnswer = event.target.closest("[data-monster-answer]"); if (monsterAnswer) return settleMonsterAnswer(Number(monsterAnswer.dataset.monsterAnswer));
      const install = event.target.closest("[data-audio-install]"); if (install) { openVoicePackInstaller(Number(install.dataset.audioInstall)); return; }
      const fallback = event.target.closest("[data-audio-fallback]"); if (fallback) { enableAudioFallback(); return; }
      const registerAudio = event.target.closest("[data-register-audio]"); if (registerAudio) return playRegisterVoice();
      const registerOptionAudio = event.target.closest("[data-register-option-audio]"); if (registerOptionAudio) return playRegisterOption(Number(registerOptionAudio.dataset.registerOptionAudio));
      const answer = event.target.closest("[data-answer]"); if (answer) return chooseWordAnswer(Number(answer.dataset.answer));
      const grade = event.target.closest("[data-grade]"); if (grade) return chooseTone(grade.dataset.grade);
      const polish = event.target.closest("[data-polish]"); if (polish) return choosePolish(Number(polish.dataset.polish));
      const gradeLock = event.target.closest("[data-grade-lock]"); if (gradeLock) return chooseRegisterGameAnswer("grade-lock", Number(gradeLock.dataset.gradeLock));
      const sceneListen = event.target.closest("[data-scene-listen]"); if (sceneListen) return chooseRegisterGameAnswer("scene-listen", Number(sceneListen.dataset.sceneListen));
      const registerShift = event.target.closest("[data-register-shift]"); if (registerShift) return chooseRegisterGameAnswer("register-shift", Number(registerShift.dataset.registerShift));
      const replay = event.target.closest("#arcade-replay"); if (replay && game) return openGame(game.type);
      const exit = event.target.closest("[data-arcade-exit]"); if (exit) return q("#arcade-close")?.click();
    });
    q("#arcade-next").addEventListener("click", nextRound);
    q("#arcade-close").addEventListener("click", closeGame);
    q("#modal-backdrop").addEventListener("click", closeGame);
    document.querySelector('[data-nav="battle"]')?.addEventListener("click", renderHall);
    document.addEventListener("keydown", handleGameKeydown);
    window.addEventListener?.("storage", event => {
      if (event.key === `thai-vibe-mode-${direction()}`) renderHall();
    });
  }

  function init() { if (!q("#arcade-hall")) return; renderHall(); bindEvents(); }
  window.ArcadeUI = {
    render: renderHall,
    close: closeGame,
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
      buildGradeLockItems,
      buildSceneListenItems,
      buildRegisterShiftItems,
      monsterDamage,
      monsterConfigs: () => MONSTER_CONFIGS.map(item => ({ ...item })),
      registerOptionMarkup,
      orderedGameIds: () => orderedGameEntries().map(([id]) => id),
      gameIds: () => Object.keys(copy().games)
    };
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
