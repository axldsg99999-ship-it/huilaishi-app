#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = path.resolve(SCRIPT_DIR, "..");
const GRADES = ["S5", "S4", "S3", "S2", "S1"];
const DATA_FILES = [
  "vocab-l1-l2.js",
  "vocab-l3-l4.js",
  "vocab-l5-l6.js",
  "vocab-expansion-l1-l3.js",
  "vocab-expansion-l4-l6.js",
  "register-pack.js",
  "offline-data.js",
  "thai-phonetic.js"
];

function issue(severity, code, source, message, detail = {}) {
  return { severity, code, source, message, ...detail };
}

export function isQuestionWithFullStop(value, language = "zh") {
  const text = String(value || "").trim();
  if (!/[。.\uFF0E]$/u.test(text)) return false;
  const body = text.replace(/[。.\uFF0E]+$/u, "").trim();
  if (language === "th") return /(?:ไหม|มั้ย|หรือ|เหรอ|หรือเปล่า|ใช่ไหม)$/u.test(body);
  if (/(?:吗|呢)$/u.test(body)) return true;
  if (/^(?:请问[，,]?)?(?:谁|什么|怎么|为什么|多少钱|多少|哪里|哪儿|哪些|几时|几点)/u.test(body)) return true;
  if (/^(?:能否|可否)/u.test(body)) return true;
  if (/^(?:你|您|我们|这|这个|这项|相关信息).*(?:叫什么|从哪里|是什么意思|由谁|谁承担|谁会|该怎么办|是否)/u.test(body)) return true;
  if (/如果.*该怎么办$/u.test(body)) return true;
  return false;
}

export function thaiTemplateProblems(value) {
  const text = String(value || "").trim();
  const problems = [];
  if (!text) return problems;
  if (text.includes("เห็นได้ว่าเห็น")) problems.push("重复模板片段“เห็นได้ว่าเห็น”");
  const helpCount = text.split("ช่วยให้").length - 1;
  if (helpCount > 1) problems.push(`模板片段“ช่วยให้”重复 ${helpCount} 次`);
  const adjacent = text.match(/([\p{Script=Thai}]{3,})(?:\s+\1)(?![\p{Script=Thai}])/u);
  if (adjacent) problems.push(`相邻泰文片段“${adjacent[1]}”重复`);
  return [...new Set(problems)];
}

export function vocabularySemanticProblems(word) {
  const problems = [];
  const zh = String(word?.zh || "");
  const thai = String(word?.th || "");
  if (!/年/u.test(zh) && /ประจำปี/u.test(thai)) {
    problems.push("泰文词头无依据增加了“年度/每年”语义");
  }
  return problems;
}

function stripRomanMarks(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/gu, "")
    .toLowerCase()
    .replaceAll("ʉ", "ue")
    .replaceAll("ɯ", "ue");
}

function countMatches(value, expression) {
  return [...String(value || "").matchAll(expression)].length;
}

function politeParticleCounts(thai, roman) {
  const maleThai = countMatches(thai, /ครับ(?![\u0E00-\u0E7F])/gu);
  const femaleThai = countMatches(thai, /(?:ค่ะ|คะ)(?![\u0E00-\u0E7F])/gu);
  const tokens = stripRomanMarks(roman).match(/[a-z]+/gu) || [];
  const maleRoman = tokens.filter(token => /^(?:khrap|krap|khap|krab)$/u.test(token)).length;
  const femaleRoman = tokens.filter(token => /^(?:kha|ka)$/u.test(token)).length;
  return { maleThai, femaleThai, maleRoman, femaleRoman };
}

export function politeParticleProblems(thai, roman) {
  const counts = politeParticleCounts(thai, roman);
  const problems = [];
  if (counts.maleThai > counts.maleRoman) problems.push(`泰文有 ${counts.maleThai} 个ครับ，罗马音仅有 ${counts.maleRoman} 个 khráp/krap`);
  if (counts.femaleThai > counts.femaleRoman) problems.push(`泰文有 ${counts.femaleThai} 个ค่ะ/คะ，罗马音仅有 ${counts.femaleRoman} 个 khâ/khá`);
  return problems;
}

export function hasRomanToneMarks(value) {
  return /[àèìòùâêîôûáéíóúǎěǐǒǔɛ̀ɛ̂ɛ́ɛ̌ɔ̀ɔ̂ɔ́ɔ̌ʉ̀ʉ̂ʉ́ʉ̌]/iu.test(String(value || ""));
}

function normalizeLexeme(value) {
  return String(value || "").normalize("NFC").trim().replace(/\s+/gu, " ");
}

function normalizeRomanForComparison(value) {
  return stripRomanMarks(value)
    .normalize("NFC")
    .replace(/[^\p{L}\p{N}]/gu, "");
}

export function analyzeVocabularyCorpus(words) {
  const ids = new Set();
  const zhHeads = new Set();
  const thHeads = new Set();
  const pairCounts = new Map();
  const levelCounts = Object.fromEntries(Array.from({ length: 6 }, (_, index) => [index + 1, 0]));
  const duplicateIds = [];
  for (const word of words || []) {
    if (ids.has(word.id)) duplicateIds.push(word.id);
    ids.add(word.id);
    const zh = normalizeLexeme(word.zh);
    const th = normalizeLexeme(word.th);
    zhHeads.add(zh);
    thHeads.add(th);
    const pair = `${zh}\u0000${th}`;
    pairCounts.set(pair, (pairCounts.get(pair) || 0) + 1);
    if (levelCounts[word.level] != null) levelCounts[word.level] += 1;
  }
  const repeatedGroups = [...pairCounts.values()].filter(count => count > 1);
  return {
    trainingCards: words?.length || 0,
    distinctChineseHeads: zhHeads.size,
    distinctThaiHeads: thHeads.size,
    distinctPairs: pairCounts.size,
    reviewCards: (words?.length || 0) - pairCounts.size,
    duplicatePairGroups: repeatedGroups.length,
    cardsInDuplicatePairGroups: repeatedGroups.reduce((sum, count) => sum + count, 0),
    duplicateIds,
    levelCounts
  };
}

export function findRomanizationConflicts(words, thaiField = "th", romanField = "ro") {
  const byThai = new Map();
  for (const word of words || []) {
    const thai = normalizeLexeme(word?.[thaiField]);
    const roman = normalizeRomanForComparison(word?.[romanField]);
    if (!thai || !roman) continue;
    if (!byThai.has(thai)) byThai.set(thai, new Map());
    const forms = byThai.get(thai);
    if (!forms.has(roman)) forms.set(roman, []);
    forms.get(roman).push({ id: word.id || "unknown", value: String(word[romanField] || "") });
  }
  return [...byThai.entries()]
    .filter(([, forms]) => forms.size > 1)
    .map(([thai, forms]) => ({ thai, forms: [...forms.values()] }));
}

export function validateRegisterPack(pack) {
  const issues = [];
  for (const entry of pack || []) {
    const source = `register:${entry?.id || "unknown"}`;
    const context = entry?.decisionContext;
    const missingContextFields = ["settingZh", "settingTh", "relationshipZh", "relationshipTh", "familiarity", "powerDistance", "urgency", "recommendedGrade"]
      .filter(field => !context?.[field]);
    if (missingContextFields.length || !entry?.contextComplete || !entry?.uniqueGradeJudgment) {
      issues.push(issue("error", "REGISTER_CONTEXT_MISSING", source, "语域题缺少完整人物关系或具体场景，不得判唯一等级。", { fields: missingContextFields }));
    }
    if (!GRADES.includes(entry?.recommendedGrade)) {
      issues.push(issue("error", "REGISTER_RECOMMENDATION_MISSING", source, "缺少有效 recommendedGrade。"));
    }
    const recommended = entry?.variants?.find(variant => variant.id === entry?.recommendedVariantId);
    if (!recommended || recommended.grade !== entry?.recommendedGrade) {
      issues.push(issue("error", "REGISTER_RECOMMENDED_VARIANT_INVALID", source, "recommendedVariantId 与场景推荐档不一致。"));
    }
    for (const grade of GRADES) {
      const variant = entry?.variants?.find(item => item.grade === grade);
      if (!variant) {
        issues.push(issue("error", "REGISTER_GRADE_MISSING", source, `缺少 ${grade} 变体。`));
        continue;
      }
      const variantSource = variant.id || `${source}:${grade}`;
      const required = ["id", "grade", "zh", "py", "th", "ro", "contentReviewStatus", "romanToneStatus"];
      const missing = required.filter(field => variant[field] == null || String(variant[field]).trim() === "");
      if (missing.length) issues.push(issue("error", "REGISTER_FIELD_MISSING", variantSource, `缺少字段：${missing.join(", ")}`, { fields: missing }));
      if (!hasRomanToneMarks(variant.ro)) {
        if (variant.romanToneStatus === "pending-native-review" && variant.romanToneReviewed === false) {
          issues.push(issue("warning", "REGISTER_ROMAN_TONE_PENDING", variantSource, "泰语罗马音没有声调标记，已明确标为母语审核待完成。"));
        } else {
          issues.push(issue("error", "REGISTER_ROMAN_TONE_UNMARKED", variantSource, "泰语罗马音没有声调标记，也没有明确的待审核状态。"));
        }
      } else if (variant.romanToneReviewed !== true) {
        issues.push(issue("warning", "REGISTER_ROMAN_TONE_UNVERIFIED", variantSource, "罗马音含调号，但尚未记录母语审核通过。"));
      }
      if (variant.contentReviewStatus !== "native-approved") {
        if (!/native-review-pending/u.test(String(variant.contentReviewStatus || ""))) {
          issues.push(issue("error", "REGISTER_REVIEW_STATUS_AMBIGUOUS", variantSource, "未通过母语审核的内容必须明确标为 native-review-pending。"));
        }
      }
      if (["S5", "S4"].includes(grade)) {
        for (const profile of ["female", "male"]) {
          const form = variant.speakerForms?.[profile];
          const formSource = `${variantSource}:speaker:${profile}`;
          const formMissing = ["th", "ro", "contentReviewStatus", "romanToneStatus"].filter(field => !String(form?.[field] || "").trim());
          if (formMissing.length) {
            issues.push(issue("error", "REGISTER_SPEAKER_FORM_MISSING", formSource, `安全档缺少${profile === "female" ? "女性" : "男性"}说话者形式：${formMissing.join(", ")}`));
            continue;
          }
          if (form.contentReviewStatus !== "native-review-pending" || form.nativeReviewed !== false) {
            issues.push(issue("error", "REGISTER_SPEAKER_REVIEW_STATUS_INVALID", formSource, "说话者形式必须明确标为母语审核待完成。"));
          }
        }
        const male = variant.speakerForms?.male;
        if (male && /(?:ดิฉัน|ฉัน|ค่ะ|คะ)/u.test(male.th)) {
          issues.push(issue("error", "REGISTER_MALE_FORM_CONTAINS_FEMALE_MARKER", `${variantSource}:speaker:male`, `男性形式仍含女性人称或句尾：${male.th}`));
        }
        if (male && /(?:ค่ะ|คะ)/u.test(variant.th) && !/ครับ/u.test(male.th)) {
          issues.push(issue("error", "REGISTER_MALE_POLITE_PARTICLE_MISSING", `${variantSource}:speaker:male`, `女性原句含礼貌句尾，但男性形式缺少ครับ：${male.th}`));
        }
      }
    }
  }
  return issues;
}

function evaluateFile(rootDir, filename, sandbox) {
  const filepath = path.join(rootDir, filename);
  const source = fs.readFileSync(filepath, "utf8");
  vm.runInContext(source, sandbox, { filename: filepath, displayErrors: true });
}

function loadData(rootDir) {
  const world = { console };
  world.window = world;
  world.globalThis = world;
  const sandbox = vm.createContext(world);
  for (const filename of DATA_FILES) evaluateFile(rootDir, filename, sandbox);
  const words = [
    ...(sandbox.HUILAISHI_VOCAB_L12 || []),
    ...(sandbox.HUILAISHI_VOCAB_L34 || []),
    ...(sandbox.HUILAISHI_VOCAB_L56 || []),
    ...(sandbox.HUILAISHI_VOCAB_EXPANSION_L13 || []),
    ...(sandbox.HUILAISHI_VOCAB_EXPANSION_L46 || [])
  ];
  return {
    words,
    register: sandbox.HUILAISHI_REGISTER_PACK || [],
    offline: sandbox.OFFLINE_APP_CONTENT || {},
    phonetic: sandbox.HUILAISHI_THAI_PHONETIC || null
  };
}

function collectThaiRomanPairs(value, source, output, seen = new WeakSet(), trail = "") {
  if (!value || typeof value !== "object" || seen.has(value)) return;
  seen.add(value);
  const add = (thai, roman, kind) => {
    if (/[\u0E00-\u0E7F]/u.test(String(thai || ""))) output.push({ thai: String(thai), roman: String(roman || ""), source: `${source}${trail}:${kind}` });
  };
  add(value.th, value.ro, "th/ro");
  add(value.exTh, value.exRo, "exTh/exRo");
  add(value.target, value.roman, "target/roman");
  add(value.npc, value.npcRoman, "npc/npcRoman");
  for (const [key, child] of Object.entries(value)) collectThaiRomanPairs(child, source, output, seen, `${trail}.${key}`);
}

function decodeJsString(raw) {
  try { return JSON.parse(`"${raw}"`); }
  catch (_) { return raw.replaceAll("\\\"", "\"").replaceAll("\\n", "\n"); }
}

function collectStaticAppPairs(rootDir) {
  const filename = path.join(rootDir, "app.js");
  const source = fs.readFileSync(filename, "utf8");
  const pairs = [];
  const expression = /\b(target|npc)\s*:\s*"((?:\\.|[^"\\])*)"\s*,\s*(roman|npcRoman)\s*:\s*"((?:\\.|[^"\\])*)"/gu;
  for (const match of source.matchAll(expression)) {
    const thai = decodeJsString(match[2]);
    if (!/[\u0E00-\u0E7F]/u.test(thai)) continue;
    const line = source.slice(0, match.index).split(/\r?\n/u).length;
    pairs.push({ thai, roman: decodeJsString(match[4]), source: `app.js:${line}:${match[1]}/${match[3]}` });
  }
  return pairs;
}

function addVocabularyIssues(words, issues, phonetic) {
  const corpus = analyzeVocabularyCorpus(words);
  if (corpus.trainingCards !== 3000) {
    issues.push(issue("error", "VOCAB_CARD_COUNT_INCOMPLETE", "vocabulary-corpus", `应有 3000 张训练卡，实际 ${corpus.trainingCards}。`));
  }
  for (let level = 1; level <= 6; level += 1) {
    if (corpus.levelCounts[level] !== 500) issues.push(issue("error", "VOCAB_LEVEL_COUNT_INCOMPLETE", `vocabulary:L${level}`, `L${level} 应有 500 张训练卡，实际 ${corpus.levelCounts[level]}。`));
  }
  if (corpus.duplicateIds.length) {
    issues.push(issue("error", "VOCAB_ID_DUPLICATED", "vocabulary-corpus", `发现 ${corpus.duplicateIds.length} 个重复训练卡 ID。`, { ids: corpus.duplicateIds }));
  }
  if (corpus.reviewCards) {
    issues.push(issue("warning", "VOCAB_REVIEW_CARDS_PRESENT", "vocabulary-corpus", `${corpus.trainingCards} 张训练卡包含 ${corpus.distinctPairs} 组独立中泰词对；${corpus.reviewCards} 张为复现训练卡，必须按训练卡而非新词对展示。`, corpus));
  }
  for (const conflict of findRomanizationConflicts(words)) {
    issues.push(issue("error", "VOCAB_ROMANIZATION_CONFLICT", `vocabulary:thai:${conflict.thai}`, `同一泰文词头存在冲突罗马音：${conflict.forms.flat().map(item => `${item.id}=${item.value}`).join("；")}`, { conflict }));
  }
  let blockedExamples = 0;
  const blockedExampleIds = [];
  const phoneticQuality = { "curated-core": 0, "dictionary-assisted": 0, "generated-approximate": 0 };
  const toneCoverage = { full: 0, partial: 0, none: 0 };
  for (const word of words) {
    const source = `vocab:${word.id || "unknown"}`;
    for (const problem of vocabularySemanticProblems(word)) {
      issues.push(issue("error", "VOCAB_SEMANTIC_SCOPE_MISMATCH", source, `${problem}；中文：${word.zh}；泰文：${word.th}`));
    }
    if (isQuestionWithFullStop(word.exZh, "zh")) {
      issues.push(issue("error", "QUESTION_ENDS_WITH_FULL_STOP", `${source}:exZh`, `疑问句以句号结尾：${word.exZh}`));
    }
    if (isQuestionWithFullStop(word.exTh, "th")) {
      issues.push(issue("error", "QUESTION_ENDS_WITH_FULL_STOP", `${source}:exTh`, `泰语疑问句以句号结尾：${word.exTh}`));
    }
    for (const [field, value] of [["th", word.th], ["exTh", word.exTh]]) {
      for (const problem of thaiTemplateProblems(value)) {
        issues.push(issue("error", "THAI_TEMPLATE_FRAGMENT_REPEATED", `${source}:${field}`, `${problem}：${value}`));
      }
    }
    const assessment = phonetic?.classifyVocabularyExample?.(word);
    if (assessment?.codes?.length) {
      blockedExamples += 1;
      blockedExampleIds.push(word.id);
      if (word.exampleDisplayStatus !== "blocked-editorial-review") {
        issues.push(issue("error", "VOCAB_INVALID_EXAMPLE_NOT_BLOCKED", source, `未通过最低完整性门禁的例句仍未阻断：${assessment.codes.join(", ")}`));
      }
    }
    const reading = word.thReading;
    if (!reading || !Object.hasOwn(phoneticQuality, reading.quality) || !Object.hasOwn(toneCoverage, reading.toneCoverage)) {
      issues.push(issue("error", "VOCAB_PHONETIC_METADATA_MISSING", source, "词头缺少近音来源、声调覆盖或审核状态元数据。"));
    } else {
      phoneticQuality[reading.quality] += 1;
      toneCoverage[reading.toneCoverage] += 1;
      if (reading.nativeReviewed !== false || reading.nativeReviewStatus !== "pending") {
        issues.push(issue("error", "VOCAB_PHONETIC_REVIEW_STATUS_INVALID", source, "未获母语审核的近音必须明确显示待审。"));
      }
    }
  }
  if (blockedExamples) issues.push(issue("warning", "VOCAB_EXAMPLES_BLOCKED", "vocabulary-corpus", `${blockedExamples}/${words.length} 条例句未通过最低完整性门禁，成品必须停止展示和跟读。`, { count: blockedExamples, total: words.length, ids: blockedExampleIds }));
  const automatic = phoneticQuality["dictionary-assisted"] + phoneticQuality["generated-approximate"];
  if (automatic) issues.push(issue("warning", "VOCAB_NEAR_SOUND_AUTOMATIC", "vocabulary-corpus", `${automatic}/${words.length} 个词头的中文近音由字典辅助或算法近似生成，必须展示来源且不得冒充标准音标。`, phoneticQuality));
  const incompleteTone = toneCoverage.none + toneCoverage.partial;
  if (incompleteTone) issues.push(issue("warning", "VOCAB_TONE_COVERAGE_INCOMPLETE", "vocabulary-corpus", `${incompleteTone}/${words.length} 个词头的罗马音声调不完整，必须明确提示跟音频并等待母语复核。`, toneCoverage));
  const approved = words.filter(word => word.contentReviewStatus === "native-approved").length;
  const pending = words.length - approved;
  if (pending) {
    issues.push(issue("warning", "VOCAB_NATIVE_REVIEW_PENDING", "vocabulary-corpus", `${pending}/${words.length} 个词条没有母语教师批准记录；自动校验不等于人工终审。`, { count: pending, total: words.length }));
  }
}

function addPoliteParticleIssues(pairs, issues) {
  const seen = new Set();
  for (const pair of pairs) {
    const key = `${pair.source}\0${pair.thai}\0${pair.roman}`;
    if (seen.has(key)) continue;
    seen.add(key);
    for (const problem of politeParticleProblems(pair.thai, pair.roman)) {
      issues.push(issue("error", "ROMAN_POLITE_PARTICLE_MISSING", pair.source, `${problem}；泰文：${pair.thai}；罗马音：${pair.roman || "（空）"}`));
    }
  }
}

export function auditProject(rootDir = DEFAULT_ROOT) {
  const root = path.resolve(rootDir);
  const data = loadData(root);
  const issues = [];
  addVocabularyIssues(data.words, issues, data.phonetic);
  issues.push(...validateRegisterPack(data.register));
  const pairs = [];
  collectThaiRomanPairs(data.words, "vocab", pairs);
  collectThaiRomanPairs(data.register, "register", pairs);
  collectThaiRomanPairs(data.offline, "offline", pairs);
  pairs.push(...collectStaticAppPairs(root));
  addPoliteParticleIssues(pairs, issues);
  const errors = issues.filter(item => item.severity === "error");
  const warnings = issues.filter(item => item.severity === "warning");
  const byCode = Object.fromEntries([...new Set(issues.map(item => item.code))].sort().map(code => [code, issues.filter(item => item.code === code).length]));
  const contextReady = data.register.filter(entry => entry.contextComplete && entry.uniqueGradeJudgment && entry.recommendedVariantId).length;
  const corpus = analyzeVocabularyCorpus(data.words);
  const blockedExamples = data.words.filter(word => word.exampleDisplayStatus === "blocked-editorial-review").length;
  const blockedExampleIds = data.words.filter(word => word.exampleDisplayStatus === "blocked-editorial-review").map(word => word.id);
  const toneCoverage = Object.fromEntries(["full", "partial", "none"].map(key => [key, data.words.filter(word => word.thReading?.toneCoverage === key).length]));
  const phoneticQuality = Object.fromEntries(["curated-core", "dictionary-assisted", "generated-approximate"].map(key => [key, data.words.filter(word => word.thReading?.quality === key).length]));
  return {
    ok: errors.length === 0,
    root,
    stats: {
      words: data.words.length,
      trainingCards: corpus.trainingCards,
      distinctPairs: corpus.distinctPairs,
      distinctChineseHeads: corpus.distinctChineseHeads,
      distinctThaiHeads: corpus.distinctThaiHeads,
      reviewCards: corpus.reviewCards,
      duplicatePairGroups: corpus.duplicatePairGroups,
      levelCounts: corpus.levelCounts,
      blockedExamples,
      blockedExampleIds,
      toneCoverage,
      phoneticQuality,
      registerIntents: data.register.length,
      registerVariants: data.register.reduce((sum, entry) => sum + (entry.variants?.length || 0), 0),
      contextualRegisterIntents: contextReady,
      thaiRomanPairs: pairs.length,
      errors: errors.length,
      warnings: warnings.length,
      byCode
    },
    errors,
    warnings,
    issues
  };
}

function printReport(report) {
  const { stats } = report;
  console.log(`CONTENT GATE: ${report.ok ? "PASS" : "FAIL"}`);
  console.log(`训练卡 ${stats.trainingCards} · 独立中泰词对 ${stats.distinctPairs} · 复现训练卡 ${stats.reviewCards} · 语域意图 ${stats.contextualRegisterIntents}/${stats.registerIntents} · 语域变体 ${stats.registerVariants}`);
  console.log(`例句阻断 ${stats.blockedExamples} · 词头声调 full/partial/none ${stats.toneCoverage.full}/${stats.toneCoverage.partial}/${stats.toneCoverage.none} · 泰文/罗马音对 ${stats.thaiRomanPairs}`);
  console.log(`errors ${stats.errors} · native-review warnings ${stats.warnings}`);
  for (const [code, count] of Object.entries(stats.byCode)) console.log(`${code}: ${count}`);
  const important = [...report.errors, ...report.warnings].slice(0, 50);
  for (const item of important) console.log(`[${item.severity.toUpperCase()}] ${item.code} ${item.source} — ${item.message}`);
  if (report.issues.length > important.length) console.log(`其余 ${report.issues.length - important.length} 项已省略；使用 --json 查看完整报告。`);
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  const rootArg = process.argv.slice(2).find(arg => !arg.startsWith("--"));
  const report = auditProject(rootArg || DEFAULT_ROOT);
  if (args.has("--json")) console.log(JSON.stringify(report, null, 2));
  else printReport(report);
  if (!args.has("--report-only") && !report.ok) process.exitCode = 1;
}
