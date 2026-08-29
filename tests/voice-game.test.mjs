import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(TEST_DIR, "..");
const read = filename => fs.readFileSync(path.join(PROJECT_ROOT, filename), "utf8");

function loadScorer({ transcript = "สวัสดี", local = true, events = null, getUserMedia = null } = {}) {
  class Recognition {
    static async available() { return local ? "available" : "unavailable"; }
    constructor() { this.processLocally = false; }
    start() {
      queueMicrotask(() => {
        this.onstart?.();
        const plans = events || [{ final: true, alternatives: [{ transcript, confidence: .94 }] }];
        plans.forEach(plan => {
          const alternatives = plan.alternatives || [];
          const result = { length: alternatives.length, isFinal: Boolean(plan.final) };
          alternatives.forEach((alternative, index) => { result[index] = alternative; });
          this.onresult?.({ resultIndex: 0, results: [result] });
        });
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
  if (getUserMedia) world.navigator = { mediaDevices: { getUserMedia } };
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

test("speech judge never passes a stale interim hypothesis over the final transcript", async () => {
  const scorer = loadScorer({
    events: [
      { final: false, alternatives: [{ transcript: "สวัสดี", confidence: .91 }] },
      { final: true, alternatives: [{ transcript: "ขอบคุณ", confidence: .88 }] }
    ]
  });
  const result = await scorer.recognizeTarget({ target: "สวัสดี", lang: "th-TH", threshold: 78 });
  assert.equal(result.passed, false);
  assert.equal(result.status, "result");
  assert.equal(result.transcript, "ขอบคุณ");
});

test("speech judge uses only the recognizer's primary final hypothesis", async () => {
  const scorer = loadScorer({
    events: [{
      final: true,
      alternatives: [
        { transcript: "ขอบคุณ", confidence: .72 },
        { transcript: "สวัสดี", confidence: .25 }
      ]
    }]
  });
  const result = await scorer.recognizeTarget({ target: "สวัสดี", lang: "th-TH", threshold: 78 });
  assert.equal(result.passed, false);
  assert.equal(result.transcript, "ขอบคุณ");
  assert.equal(result.metric, "primary-final-transcript-match");
});

test("voice challenge preflight checks the microphone and maps a denied permission", async () => {
  let stopped = false;
  const readyScorer = loadScorer({
    getUserMedia: async () => ({ getTracks: () => [{ stop() { stopped = true; } }] })
  });
  const ready = await readyScorer.prepareChallenge({ lang: "th-TH", requestMicrophone: true });
  assert.equal(ready.ready, true);
  assert.equal(ready.status, "ready");
  assert.equal(ready.microphone, "ready");
  assert.equal(stopped, true);

  const deniedScorer = loadScorer({
    getUserMedia: async () => { const error = new Error("denied"); error.name = "NotAllowedError"; throw error; }
  });
  const denied = await deniedScorer.prepareChallenge({ lang: "th-TH", requestMicrophone: true });
  assert.equal(denied.ready, false);
  assert.equal(denied.status, "not-allowed");
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

test("missing device transcription never pretends that meaning or pronunciation was correct", () => {
  const app = read("app.js");
  assert.match(app, /"speech-unavailable": \["当前无法评分"/u);
  assert.match(app, /\["local-missing", "network-consent"\][\s\S]*?updateLessonVoiceResult\(\{ \.\.\.result, unscored: true \}\)[\s\S]*?setLessonInteractionPhase\("speech-unavailable"\)/u);
  assert.doesNotMatch(app, /意思对了，发音再清楚一点/u);
});

test("offline speech-pack installation has a bounded wait and a usable fallback", () => {
  const app = read("app.js");
  assert.match(app, /const LOCAL_SPEECH_INSTALL_TIMEOUT_MS = 45000/u);
  assert.match(app, /Promise\.race\(\[/u);
  assert.match(app, /local-speech-install-timeout/u);
  assert.match(app, /可稍后重试或继续用选句和打字/u);
});

test("arcade voice gate replaces the listening state with an explicit pass result", () => {
  const arcade = read("arcade.js");
  assert.match(arcade, /q\("\[data-voice-status\]"\)\.textContent = c\.voicePass\(result\.score\)/u);
  assert.match(arcade, /q\("#arcade-next"\)\.classList\.remove\("hidden"\)/u);
  assert.match(arcade, /function hasBundledWordVoice\(word\)/u);
  assert.match(arcade, /pickWords\(12, \{ learningAudio: true \}\)/u);
});

test("first-install audio games use a real bilingual starter vocabulary pack", () => {
  const starter = read("starter-vocab-audio-map.js");
  const speech = read("speech-engine.js");
  const arcade = read("arcade.js");
  const html = read("index.html");
  const worker = read("service-worker.js");
  const thaiEntries = [...starter.matchAll(/"vocab:l1-\d{3}:word:th"/gu)];
  const chineseEntries = [...starter.matchAll(/"vocab:l1-\d{3}:word:zh"/gu)];
  assert.ok(thaiEntries.length >= 40);
  assert.equal(chineseEntries.length, thaiEntries.length);
  assert.match(speech, /HUILAISHI_STARTER_VOCAB_AUDIO/u);
  assert.match(arcade, /HUILAISHI_STARTER_VOCAB_AUDIO\?\.lookup/u);
  assert.match(arcade, /HUILAISHI_VOICE_PACKS\?\.resolveSync/u);
  assert.match(html, /<script src="starter-vocab-audio-map\.js"><\/script>/u);
  assert.match(worker, /\.\.\.STARTER_VOCAB_AUDIO/u);
});

test("monster battle waits for consent and uses final transcription match as the primary attack", () => {
  const arcade = read("arcade.js");
  const css = read("arcade.css");
  assert.match(arcade, /function renderMonsterReady\(\)/u);
  assert.match(arcade, /data-monster-start/u);
  assert.match(arcade, /data-monster-arm/u);
  assert.match(arcade, /function startMonsterTimer\(audioFailed = false\)/u);
  assert.match(arcade, /game\.timerActive = true/u);
  assert.match(arcade, /function attemptMonsterVoice\(allowNetwork = false\)/u);
  assert.match(arcade, /recognizeTarget\(\{\s*target: view\.target,[\s\S]*?threshold: 78/u);
  assert.match(arcade, /settleMonsterAnswer\(correctIndex, false, \{ voice: true, passed: true/u);
  assert.match(css, /\.arcade-monster-attack > button\[data-monster-voice\]/u);
  assert.match(css, /\.arcade-monster-world\[data-monster-state="listening"\]/u);
});

test("timed arcade intermissions can be skipped by tapping without click-through", () => {
  const arcade = read("arcade.js");
  const css = read("arcade.css");
  assert.match(arcade, /skipTransition: "轻触跳过"/u);
  assert.match(arcade, /skipTransition: "แตะเพื่อข้าม"/u);
  assert.match(arcade, /function completeSkippableTransition\(\)/u);
  assert.match(arcade, /beginSkippableTransition\(finishCountdown, 3000\)/u);
  assert.match(arcade, /beginSkippableTransition\(continueAfterImpact, monsterWasDefeated \? 1050 : 760\)/u);
  assert.match(arcade, /event\.preventDefault\(\);\s*event\.stopPropagation\(\);\s*return;/u);
  assert.match(css, /\.arcade-transition-skip \{[\s\S]*?position:absolute;[\s\S]*?inset:0;[\s\S]*?touch-action:manipulation;/u);
});

test("voice battle implements shared-target buzzing, hit damage, recoil and knockout", () => {
  const battle = read("battle.js");
  const css = read("battle.css");
  assert.match(battle, /voice: Object\.freeze\(\{ id: "voice", rounds: 8, turnMs: 15000/u);
  assert.match(battle, /recognizeTarget\(\{\s*target: question\.target,\s*lang: question\.voiceLang,\s*threshold: 78/u);
  assert.match(battle, /state\.phase = "voice-ready"/u);
  assert.match(battle, /function beginVoiceRound\(\)/u);
  assert.match(battle, /opponent\.hp = Math\.max\(0, opponent\.hp - damage\)/u);
  assert.match(battle, /const recoil = 8/u);
  assert.match(battle, /state\.voiceKnockout = opponent\.hp <= 0/u);
  assert.match(css, /\.hls-duel-hp-board/u);
  assert.match(css, /\.hls-duel-voice-fighter/u);
});

test("voice battle preflights speech capability and offers a non-microphone fallback", () => {
  const battle = read("battle.js");
  const css = read("battle.css");
  assert.match(battle, /async function prepareVoiceMatch\(allowNetwork = false\)/u);
  assert.match(battle, /scorer\.prepareChallenge\(\{\s*lang:[\s\S]*?requestMicrophone: true/u);
  assert.match(battle, /data-duel-action="preflight-fallback"/u);
  assert.match(battle, /state\.mode = "standard"/u);
  assert.match(battle, /allowNetwork: allowNetwork \|\| state\.voiceNetworkPermit/u);
  assert.match(battle, /最终第一候选转写/u);
  assert.match(battle, /modeConfig\(\)\.voice \? prepareVoiceMatch/u);
  assert.match(battle, /data-duel-preflight[^>]*tabindex="-1"/u);
  assert.match(battle, /panel\?\.scrollIntoView\?\.\(\{ block: "center"/u);
  assert.match(css, /\.hls-duel-setup-action\.is-split/u);
});
