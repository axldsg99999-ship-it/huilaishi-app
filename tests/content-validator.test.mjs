import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

import {
  analyzeVocabularyCorpus,
  auditProject,
  findRomanizationConflicts,
  hasRomanToneMarks,
  isQuestionWithFullStop,
  politeParticleProblems,
  thaiTemplateProblems,
  vocabularySemanticProblems,
  validateRegisterPack
} from "../scripts/validate-content.mjs";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(TEST_DIR, "..");

function loadRegisterGuide() {
  const world = {};
  world.window = world;
  world.globalThis = world;
  const sandbox = vm.createContext(world);
  vm.runInContext(fs.readFileSync(path.join(PROJECT_ROOT, "register-pack.js"), "utf8"), sandbox, { filename: "register-pack.js" });
  return sandbox.HUILAISHI_REGISTER_GUIDE;
}

function loadOfflineContent() {
  const world = {};
  world.window = world;
  world.globalThis = world;
  const sandbox = vm.createContext(world);
  vm.runInContext(fs.readFileSync(path.join(PROJECT_ROOT, "offline-data.js"), "utf8"), sandbox, { filename: "offline-data.js" });
  return sandbox.OFFLINE_APP_CONTENT;
}

test("question punctuation detects direct questions but not reported statements", () => {
  assert.equal(isQuestionWithFullStop("你叫什么名字。"), true);
  assert.equal(isQuestionWithFullStop("能否解释一下。"), true);
  assert.equal(isQuestionWithFullStop("请确认账号是否正常。"), false);
  assert.equal(isQuestionWithFullStop("是否需要申报取决于当时规定。"), false);
  assert.equal(isQuestionWithFullStop("你叫什么名字？"), false);
});

test("Thai template detector catches known generation repetitions", () => {
  assert.deepEqual(thaiTemplateProblems("เห็นได้ว่าเห็นการเปลี่ยนแปลง").length, 1);
  assert.deepEqual(thaiTemplateProblems("เรื่องนี้ช่วยให้ทีมเข้าใจและช่วยให้แผนดีขึ้น").length, 1);
  assert.deepEqual(thaiTemplateProblems("เรื่องนี้ช่วยให้ทีมเข้าใจชัดเจน"), []);
});

test("semantic scope gate catches unsupported annual meaning", () => {
  assert.equal(vocabularySemanticProblems({ zh: "检查身体", th: "ตรวจสุขภาพประจำปี" }).length, 1);
  assert.deepEqual(vocabularySemanticProblems({ zh: "年度体检", th: "ตรวจสุขภาพประจำปี" }), []);
  assert.deepEqual(vocabularySemanticProblems({ zh: "检查身体", th: "ตรวจสุขภาพ" }), []);
});

test("polite-particle check compares every spoken particle", () => {
  assert.equal(politeParticleProblems("ขออภัยครับ ช่วยพูดอีกครั้งได้ไหมครับ", "kho aphai, chuai phut ik khrang dai mai").length, 1);
  assert.deepEqual(politeParticleProblems("ขออภัยครับ ช่วยพูดอีกครั้งได้ไหมครับ", "khɔ̌ɔ à-phai khráp, chûai phûut ìik khráng dâi mái khráp"), []);
  assert.deepEqual(politeParticleProblems("ไปไหมคะ", "pai mái khá"), []);
});

test("tone marks are distinguished from plain RTGS", () => {
  assert.equal(hasRomanToneMarks("sà-wàt-dii khráp"), true);
  assert.equal(hasRomanToneMarks("sawatdi khrap"), false);
});

test("corpus metrics distinguish training cards from unique bilingual pairs", () => {
  const sample = [
    { id: "a", level: 1, zh: "朋友", th: "เพื่อน" },
    { id: "b", level: 2, zh: "朋友", th: "เพื่อน" },
    { id: "c", level: 2, zh: "朋友", th: "มิตร" }
  ];
  const metrics = analyzeVocabularyCorpus(sample);
  assert.equal(metrics.trainingCards, 3);
  assert.equal(metrics.distinctPairs, 2);
  assert.equal(metrics.reviewCards, 1);
  assert.equal(metrics.duplicatePairGroups, 1);
});

test("romanization conflict gate ignores punctuation but catches spelling conflicts", () => {
  assert.deepEqual(findRomanizationConflicts([
    { id: "a", th: "เอกสาร", ro: "Ekasan." },
    { id: "b", th: "เอกสาร", ro: "e-ka-san" }
  ]), []);
  const conflicts = findRomanizationConflicts([
    { id: "a", th: "เอกสาร", ro: "ekkasan" },
    { id: "b", th: "เอกสาร", ro: "ekasan" }
  ]);
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].thai, "เอกสาร");
});

test("register validator requires context and treats acknowledged untoned romanization as warning", () => {
  const variants = ["S5", "S4", "S3", "S2", "S1"].map(grade => ({
    id: `register:test:${grade}`,
    grade,
    zh: "测试",
    py: "cèshì",
    th: "ทดสอบ",
    ro: "thotsop",
    contentReviewStatus: "native-review-pending",
    romanToneStatus: "pending-native-review",
    romanToneReviewed: false,
    speakerForms: ["S5", "S4"].includes(grade) ? {
      female: { th: "ทดสอบค่ะ", ro: "thotsop kha", contentReviewStatus: "native-review-pending", romanToneStatus: "pending-native-review", nativeReviewed: false },
      male: { th: "ทดสอบครับ", ro: "thotsop khrap", contentReviewStatus: "native-review-pending", romanToneStatus: "pending-native-review", nativeReviewed: false }
    } : null
  }));
  const valid = {
    id: "test",
    contextComplete: true,
    uniqueGradeJudgment: true,
    recommendedGrade: "S4",
    recommendedVariantId: "register:test:S4",
    decisionContext: {
      settingZh: "商店", settingTh: "ร้านค้า", relationshipZh: "顾客→店员", relationshipTh: "ลูกค้า→พนักงาน",
      familiarity: "strangers", powerDistance: "service-peer", urgency: "normal", recommendedGrade: "S4"
    },
    variants
  };
  const issues = validateRegisterPack([valid]);
  assert.equal(issues.filter(item => item.severity === "error").length, 0);
  assert.equal(issues.filter(item => item.code === "REGISTER_ROMAN_TONE_PENDING").length, 5);
  const broken = validateRegisterPack([{ ...valid, contextComplete: false, decisionContext: null }]);
  assert.equal(broken.some(item => item.code === "REGISTER_CONTEXT_MISSING" && item.severity === "error"), true);
});

test("safe register variants expose female and male Thai speaker forms", () => {
  const guide = loadRegisterGuide();
  const female = guide.getVariantForSpeaker("repeat", "S4", "female");
  const male = guide.getVariantForSpeaker("repeat", "S4", "male");
  assert.match(female.th, /คะ/u);
  assert.match(male.th, /ครับ/u);
  assert.doesNotMatch(male.th, /(?:ดิฉัน|ฉัน|ค่ะ|คะ)/u);
  assert.equal(male.speakerProfile, "male");
  assert.equal(guide.getRoute("S4", "male").steps[0].answer.th, male.th);
});

test("offline Thai learner replies expose matched female and male S5/S4 forms", () => {
  const offline = loadOfflineContent();
  const safeOptions = offline["zh-th"].scenarios.flatMap(scene =>
    scene.options.filter(option => option.level === 5 || option.level === 4));
  assert.equal(safeOptions.length, 16);
  for (const option of safeOptions) {
    const female = option.speakerForms?.female;
    const male = option.speakerForms?.male;
    assert.ok(female?.target && female?.roman, `${option.meaning}: female form`);
    assert.ok(male?.target && male?.roman, `${option.meaning}: male form`);
    assert.doesNotMatch(female.target, /(?:ครับ|ผม)/u, `${option.meaning}: female markers`);
    assert.doesNotMatch(male.target, /(?:ค่ะ|คะ|ดิฉัน|ฉัน)/u, `${option.meaning}: male markers`);
    assert.deepEqual(politeParticleProblems(female.target, female.roman), []);
    assert.deepEqual(politeParticleProblems(male.target, male.roman), []);
    assert.equal(female.contentReviewStatus, "native-review-pending");
    assert.equal(male.contentReviewStatus, "native-review-pending");
  }
});

test("live corpus exposes all contextual register decisions without claiming native approval", () => {
  const report = auditProject(PROJECT_ROOT);
  assert.equal(report.stats.words, 3000);
  assert.equal(report.stats.trainingCards, 3000);
  assert.equal(report.stats.distinctPairs, 2875);
  assert.equal(report.stats.reviewCards, 125);
  assert.deepEqual(report.stats.levelCounts, { 1: 500, 2: 500, 3: 500, 4: 500, 5: 500, 6: 500 });
  assert.ok(report.stats.blockedExamples >= 300);
  const knownBadExampleIds = [
    "l1-008", "l1-013", "l1-015", "l1-017", "l1-019", "l1-023",
    "l1-056", "l1-064", "l1-091", "l1-174", "l2-177", "l3-151",
    "l3-244", "l4-151", "l4-173"
  ];
  for (const id of knownBadExampleIds) {
    assert.ok(report.stats.blockedExampleIds.includes(id), `${id} 的已知坏例句必须被展示门禁阻断`);
  }
  assert.equal(report.stats.registerIntents, 20);
  assert.equal(report.stats.contextualRegisterIntents, 20);
  assert.equal(report.stats.registerVariants, 100);
  assert.equal(report.stats.byCode.REGISTER_CONTEXT_MISSING || 0, 0);
  assert.equal(report.stats.byCode.REGISTER_RECOMMENDED_VARIANT_INVALID || 0, 0);
  assert.equal(report.stats.byCode.REGISTER_ROMAN_TONE_PENDING, 100);
  assert.equal(report.stats.byCode.VOCAB_NATIVE_REVIEW_PENDING, 1);
  assert.equal(report.stats.byCode.VOCAB_ROMANIZATION_CONFLICT || 0, 0);
  assert.equal(report.stats.byCode.VOCAB_SEMANTIC_SCOPE_MISMATCH || 0, 0);
  assert.equal(report.stats.byCode.VOCAB_REVIEW_CARDS_PRESENT, 1);
  assert.equal(report.stats.byCode.VOCAB_EXAMPLES_BLOCKED, 1);
});
