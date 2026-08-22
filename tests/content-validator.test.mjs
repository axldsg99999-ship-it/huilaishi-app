import assert from "node:assert/strict";
import test from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  auditProject,
  hasRomanToneMarks,
  isQuestionWithFullStop,
  politeParticleProblems,
  thaiTemplateProblems,
  validateRegisterPack
} from "../scripts/validate-content.mjs";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(TEST_DIR, "..");

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

test("polite-particle check compares every spoken particle", () => {
  assert.equal(politeParticleProblems("ขออภัยครับ ช่วยพูดอีกครั้งได้ไหมครับ", "kho aphai, chuai phut ik khrang dai mai").length, 1);
  assert.deepEqual(politeParticleProblems("ขออภัยครับ ช่วยพูดอีกครั้งได้ไหมครับ", "khɔ̌ɔ à-phai khráp, chûai phûut ìik khráng dâi mái khráp"), []);
  assert.deepEqual(politeParticleProblems("ไปไหมคะ", "pai mái khá"), []);
});

test("tone marks are distinguished from plain RTGS", () => {
  assert.equal(hasRomanToneMarks("sà-wàt-dii khráp"), true);
  assert.equal(hasRomanToneMarks("sawatdi khrap"), false);
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
    romanToneReviewed: false
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

test("live corpus exposes all contextual register decisions without claiming native approval", () => {
  const report = auditProject(PROJECT_ROOT);
  assert.equal(report.stats.words, 3000);
  assert.equal(report.stats.registerIntents, 20);
  assert.equal(report.stats.contextualRegisterIntents, 20);
  assert.equal(report.stats.registerVariants, 100);
  assert.equal(report.stats.byCode.REGISTER_CONTEXT_MISSING || 0, 0);
  assert.equal(report.stats.byCode.REGISTER_RECOMMENDED_VARIANT_INVALID || 0, 0);
  assert.equal(report.stats.byCode.REGISTER_ROMAN_TONE_PENDING, 100);
  assert.equal(report.stats.byCode.VOCAB_NATIVE_REVIEW_PENDING, 1);
});
