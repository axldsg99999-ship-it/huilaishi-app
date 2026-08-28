import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(TEST_DIR, "..");
const read = filename => fs.readFileSync(path.join(PROJECT_ROOT, filename), "utf8");

function loadScorer({ transcript = "สวัสดี", local = true } = {}) {
  class Recognition {
    static async available() { return local ? "available" : "unavailable"; }
    constructor() { this.processLocally = false; }
    start() {
      queueMicrotask(() => {
        this.onstart?.();
        const alternative = { transcript, confidence: .94 };
        const result = { 0: alternative, length: 1, isFinal: true };
        this.onresult?.({ resultIndex: 0, results: [result] });
        this.onend?.();
      });
    }
    abort() {}
    stop() { this.onend?.(); }
  }
  const world = {
    SpeechRecognition: Recognition,
    isSecureContext: true,
    document: { body: { classList: { contains() { return false; } } } },
    setTimeout,
    clearTimeout,
    queueMicrotask,
    performance,
    console
  };
  world.window = world;
  world.globalThis = world;
  const sandbox = vm.createContext(world);
  vm.runInContext(read("pronunciation-score.js"), sandbox, { filename: "pronunciation-score.js" });
  return sandbox.PronunciationScorer;
}

test("shared speech judge accepts a clearly recognized target at the configured threshold", async () => {
  const scorer = loadScorer();
  const result = await scorer.recognizeTarget({ target: "สวัสดี", lang: "th-TH", threshold: 78 });
  assert.equal(result.status, "passed");
  assert.equal(result.passed, true);
  assert.equal(result.score, 100);
  assert.equal(result.transcript, "สวัสดี");
});

test("shared speech judge rejects a different word and keeps language-specific scoring", async () => {
  const scorer = loadScorer({ transcript: "ขอบคุณ" });
  const result = await scorer.recognizeTarget({ target: "สวัสดี", lang: "th-TH", threshold: 78 });
  assert.equal(result.passed, false);
  assert.ok(result.score < 78);
  assert.equal(scorer.scoreText("你好", "你好", "zh-CN").accuracy, 100);
});

test("lesson progression is gated by speech while S1 remains recognition-only", () => {
  const app = read("app.js");
  const css = read("open-ui.css");
  assert.match(app, /const LESSON_VOICE_THRESHOLD = 78/u);
  assert.match(app, /correctAnswer\.target && correctAnswer\.grade !== "S1"/u);
  assert.match(app, /mountLessonVoiceGate\(feedback, correctAnswer\)/u);
  assert.match(app, /if \(lessonVoiceGate && !lessonVoiceGate\.passed\) return/u);
  assert.match(app, /lessonNeedsRetry = true/u);
  assert.match(css, /\.lesson-voice-gate\[data-state="passed"\]/u);
});

test("arcade voice gate replaces the listening state with an explicit pass result", () => {
  const arcade = read("arcade.js");
  assert.match(arcade, /q\("\[data-voice-status\]"\)\.textContent = c\.voicePass\(result\.score\)/u);
  assert.match(arcade, /q\("#arcade-next"\)\.classList\.remove\("hidden"\)/u);
});

test("voice battle implements shared-target buzzing, hit damage, recoil and knockout", () => {
  const battle = read("battle.js");
  const css = read("battle.css");
  assert.match(battle, /voice: Object\.freeze\(\{ id: "voice", rounds: 8, turnMs: 15000/u);
  assert.match(battle, /recognizeTarget\(\{ target: question\.target, lang: question\.voiceLang, threshold: 78/u);
  assert.match(battle, /opponent\.hp = Math\.max\(0, opponent\.hp - damage\)/u);
  assert.match(battle, /const recoil = 8/u);
  assert.match(battle, /state\.voiceKnockout = opponent\.hp <= 0/u);
  assert.match(css, /\.hls-duel-hp-board/u);
  assert.match(css, /\.hls-duel-voice-fighter/u);
});
