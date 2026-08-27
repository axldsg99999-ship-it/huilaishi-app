import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const speechSource = readFileSync(new URL("../speech-engine.js", import.meta.url), "utf8");
const vocabSource = readFileSync(new URL("../vocab-ui.js", import.meta.url), "utf8");
const registerSource = readFileSync(new URL("../register-pack.js", import.meta.url), "utf8");

function speechWorld() {
  class FakeElement {}
  const document = {
    documentElement: { lang: "zh-CN" },
    body: { appendChild() {} },
    activeElement: null,
    createElement() { return { id: "", className: "", classList: { add() {}, remove() {} }, setAttribute() {}, querySelector() { return { textContent: "" }; } }; },
    querySelector() { return null; },
    addEventListener() {}
  };
  const world = {
    document,
    Element: FakeElement,
    Audio: class {},
    SpeechSynthesisUtterance: class {},
    speechSynthesis: { cancel() {}, speak() {}, getVoices() { return []; }, addEventListener() {} },
    setTimeout,
    clearTimeout,
    addEventListener() {},
    navigator: {}
  };
  world.window = world;
  world.globalThis = world;
  vm.runInContext(registerSource, vm.createContext(world), { filename: "register-pack.js" });
  vm.runInContext(speechSource, vm.createContext(world), { filename: "speech-engine.js" });
  return world;
}

test("global tap speech protects every dedicated learning and role-play surface", () => {
  const source = speechSource.match(/const DEDICATED_PLAYBACK_SCOPE = \[[\s\S]*?\]\.join/u)?.[0] || "";
  for (const selector of [
    "#setup-tone-preview", "#vibe-card", ".conversation-card", "#lesson",
    ".phrase-card", ".recognition-source", "#vocab-pane", "#vocab-quiz-sheet",
    "#pronunciation-pane", "#arcade-stage", "#local-battle-root"
  ]) assert.match(source, new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "u"));
  assert.match(speechSource, /raw\.closest\(DEDICATED_PLAYBACK_SCOPE\)/u);
  assert.match(speechSource, /\[data-speech-track='character'\]/u);
  assert.doesNotMatch(speechSource.match(/const INTERACTIVE = .*;/u)?.[0] || "", /\[lang\]|h1|h2|h3|h4|\bp\b|strong|\bb\b/u);
});

test("downloaded voice packs are primed before iOS tap playback", () => {
  assert.match(speechSource, /function prime\(value, options = \{\}\)/u);
  assert.match(speechSource, /manager\.prime\?\.\(request\)/u);
  assert.match(speechSource, /speakSequence,\s*prime,/u);
  assert.match(vocabSource, /primeVisibleWordVoices\(words\.slice\(0, visibleCount\)\)/u);
});

test("every S1 register line is rejected by the global tap safety gate", () => {
  const world = speechWorld();
  const safety = world.HUILAISHI_SPEECH.safety;
  const s1 = world.HUILAISHI_REGISTER_PACK.flatMap(entry => entry.variants.filter(variant => variant.grade === "S1"));
  assert.equal(s1.length, 20);
  for (const line of s1) {
    assert.equal(safety.blocksRecognitionOnlyText(line.zh), true, line.id);
    assert.equal(safety.blocksRecognitionOnlyText(line.th), true, line.id);
    assert.equal(safety.blocksRecognitionOnlyText(`A ${line.th} 仅用于识别`), true, line.id);
  }
  assert.equal(safety.blocksRecognitionOnlyText("麻烦再说一遍，可以吗？"), false);
});

test("ordinary vocabulary UI hides editorial audit labels unless internal review is explicit", () => {
  assert.match(vocabSource, /const INTERNAL_REVIEW_KEY/u);
  assert.match(vocabSource, /query\.get\("review"\)/u);
  assert.match(vocabSource, /if \(!internalReviewMode\(\) \|\| !details\) return ""/u);
  assert.match(vocabSource, /<details class="internal-review-details"[^>]*data-speech-skip[^>]*data-speech-policy="none"/u);
  assert.match(vocabSource, /HUILAISHI_VOCAB_INTERNAL_REVIEW/u);
  assert.match(vocabSource, /场景例句/u);
  assert.doesNotMatch(vocabSource, /中文近音仅用于助记，不替代泰语标准发音/u);
});

test("review-only vocabulary tab requires an explicit internal mode and stays out of keyboard navigation", () => {
  assert.match(vocabSource, /tab\.hidden = !enabled/u);
  assert.match(vocabSource, /pane\.hidden = true/u);
  assert.match(vocabSource, /if \(!internalReviewMode\(\)\) \{[\s\S]*?candidate-list[\s\S]*?return;/u);
  assert.match(vocabSource, /qa\("\[data-library-pane\]"\)\.filter\(button => !button\.hidden && !button\.classList\.contains\("hidden"\)\)/u);
  assert.doesNotMatch(vocabSource, /CURRENT DECK|LEVEL MAP|TODAY'S WORDS/u);
  assert.doesNotMatch(vocabSource.match(/function renderSummary\(\)[\s\S]*?\n  function renderHomeDeck/u)?.[0] || "", /待审|รอตรวจ/u);
});

test("register guide describes expression levels rather than learner personas", () => {
  assert.match(registerSource, /“表达档位”描述/u);
  assert.match(registerSource, /说话分寸和社会效果/u);
  assert.doesNotMatch(registerSource, /\bpersona\s*:/u);
});
