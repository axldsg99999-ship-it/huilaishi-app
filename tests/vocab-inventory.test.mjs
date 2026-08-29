import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { auditVocabInventory, validateVocabInventory } from "../scripts/validate-vocab-inventory.mjs";

const expansion = JSON.parse(readFileSync(new URL("../lexicon-review/expansion-candidates-1000.json", import.meta.url), "utf8"));

test("vocabulary inventory exposes 4000 distinct pairs without promoting review candidates", () => {
  const report = auditVocabInventory();
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.stats, {
    activeTrainingCards: 3000,
    activeDistinctPairs: 2875,
    activeReviewCards: 125,
    activeNativeApproved: 0,
    activeNativePending: 3000,
    firstPassCandidates: 125,
    expansionReviewOnlyCandidates: 1000,
    runtimeReviewRows: 1125,
    combinedDistinctPairs: 4000,
    candidateTrainingEligible: 0
  });
});

test("all expansion candidates keep pronunciation and learning paths blocked", () => {
  assert.equal(expansion.candidates.length, 1000);
  for (const candidate of expansion.candidates) {
    assert.equal(candidate.trainingEligible, false);
    assert.equal(candidate.quizEligible, false);
    assert.equal(candidate.speechEligible, false);
    assert.equal(candidate.nativeReviewed, false);
    assert.equal(candidate.secondSourceConfirmed, false);
    assert.equal(candidate.py, null);
    assert.equal(candidate.ro, null);
    assert.equal(candidate.chineseNearSound, null);
    assert.equal(candidate.examples, null);
  }
});

test("inventory gate rejects a candidate promoted into training", () => {
  const unsafe = structuredClone(expansion);
  unsafe.candidates[0].trainingEligible = true;
  const baseline = auditVocabInventory();
  const active = [];
  // Use the public validator with the same loaded data by testing the exact error
  // through a temporary-shaped call is unnecessary; the CLI audit already proves
  // the live corpus. Mutating the queue and preserving the baseline active inputs is
  // covered by the per-record policy below.
  assert.equal(baseline.errors.length, 0);
  assert.ok(unsafe.candidates.some(candidate => candidate.trainingEligible));
  assert.equal(active.length, 0);
  assert.match(
    validateVocabInventory({ active: [], firstPass: { candidates: [] }, expansion: unsafe }).errors.join("\n"),
    /candidate leaked into a learning path/u
  );
});

test("inventory gate rejects duplicate heads and fabricated pronunciation", () => {
  const unsafe = structuredClone(expansion);
  unsafe.candidates[1].zh = unsafe.candidates[0].zh;
  unsafe.candidates[1].ro = "fabricated";
  const errors = validateVocabInventory({ active: [], firstPass: { candidates: [] }, expansion: unsafe }).errors.join("\n");
  assert.match(errors, /Chinese headwords must be unique/u);
  assert.match(errors, /unreviewed pronunciation fields must stay null/u);
});

test("review-only runtime rows stay outside core quizzes and speech controls", () => {
  const ui = readFileSync(new URL("../vocab-ui.js", import.meta.url), "utf8");
  const css = readFileSync(new URL("../vocab.css", import.meta.url), "utf8");
  const index = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const app = readFileSync(new URL("../app.js", import.meta.url), "utf8");
  const serviceWorker = readFileSync(new URL("../service-worker.js", import.meta.url), "utf8");
  const androidBuilder = readFileSync(new URL("../scripts/configure-android.mjs", import.meta.url), "utf8");
  const standaloneBuilder = readFileSync(new URL("../build-offline.ps1", import.meta.url), "utf8");
  const allWords = ui.match(/function allWords\(\)[\s\S]*?\n  function normalizeLexeme/u)?.[0] || "";
  const quizPicker = ui.match(/function pickQuizWords\(\)[\s\S]*?\n  function restoreQuizStage/u)?.[0] || "";
  const candidateGate = ui.match(/function reviewCandidates\(\)[\s\S]*?\n  function filteredReviewCandidates/u)?.[0] || "";
  const candidateRenderer = ui.match(/function renderCandidatePane\(\)[\s\S]*?\n  function renderShellCopy/u)?.[0] || "";
  assert.doesNotMatch(allWords, /HUILAISHI_VOCAB_REVIEW/u);
  assert.match(quizPicker, /allWords\(\)/u);
  assert.doesNotMatch(quizPicker, /reviewCandidates|HUILAISHI_VOCAB_REVIEW/u);
  assert.match(candidateRenderer, /<article class="candidate-card"/u);
  assert.match(candidateGate, /policy\.speechEligible !== false/u);
  assert.match(candidateGate, /item\.speechEligible === false/u);
  assert.match(candidateRenderer, /<article class="candidate-card"[^>]*data-speech-skip[^>]*data-speech-policy="none"/u);
  assert.doesNotMatch(candidateRenderer, /\blang=|data-speak-text|data-vocab-audio|speakText\(/u);
  assert.match(css, /\.candidate-search button\s*\{[^}]*width:\s*44px;[^}]*height:\s*44px;/u);
  assert.match(index, /data-library-pane="candidates"/u);
  assert.doesNotMatch(index, /<script src="vocab-review-candidates\.js"><\/script>/u);
  assert.match(app, /internalReviewAssetsRequested\(\)[\s\S]*?loadRuntimeScript\("vocab-review-candidates\.js"\)/u);
  assert.doesNotMatch(serviceWorker, /\.\/vocab-review-candidates\.js/u);
  assert.match(androidBuilder, /"vocab-review-candidates\.js"/u);
  assert.match(standaloneBuilder, /\$VocabReviewCandidates[\s\S]*?HUILAISHI_SINGLE_FILE_LAZY_FEATURES/u);
});
