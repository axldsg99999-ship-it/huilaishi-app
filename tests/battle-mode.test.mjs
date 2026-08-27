import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(TEST_DIR, "..");
const read = filename => fs.readFileSync(path.join(PROJECT_ROOT, filename), "utf8");

function loadBattleWorld() {
  const values = new Map();
  const world = {
    __HUILAISHI_TEST__: true,
    HUILAISHI_STORAGE: {
      getItem(key) { return values.has(key) ? values.get(key) : null; },
      setItem(key, value) { values.set(String(key), String(value)); }
    },
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval
  };
  world.window = world;
  world.globalThis = world;
  const sandbox = vm.createContext(world);
  for (const filename of [
    "vocab-l1-l2.js",
    "vocab-l3-l4.js",
    "vocab-l5-l6.js",
    "vocab-expansion-l1-l3.js",
    "vocab-expansion-l4-l6.js",
    "register-pack.js",
    "cute-audio-map.js",
    "battle-records.js",
    "battle.js"
  ]) vm.runInContext(read(filename), sandbox, { filename });
  return sandbox;
}

function loadBattle() { return loadBattleWorld().HUILAISHI_LOCAL_BATTLE; }

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

test("local battle builds a balanced bilingual match for every S5-S1 grade", () => {
  const battle = loadBattle();
  const opposite = direction => direction === "zh-th" ? "th-zh" : "zh-th";
  for (const direction of ["zh-th", "th-zh"]) {
    for (const grade of ["S5", "S4", "S3", "S2", "S1"]) {
      const questions = plain(battle.__test.buildQuestions({ direction, grade }));
      assert.equal(questions.length, 12);
      questions.forEach((question, index) => {
        assert.equal(question.direction, index % 2 === 0 ? direction : opposite(direction));
        assert.ok(["meaning", "listen", "tone"].includes(question.type));
        assert.equal(question.options.length, question.type === "tone" ? 5 : 4);
        assert.equal(question.options.filter(option => option.correct).length, 1);
        if (question.direction === "th-zh") {
          assert.match(question.prompt, /[\u0E00-\u0E7F]/u);
          if (question.type === "tone") assert.ok(question.options.every(option => /[\u0E00-\u0E7F]/u.test(option.sub)));
        } else {
          assert.match(question.prompt, /[\u3400-\u9FFF]/u);
          if (question.type === "tone") assert.ok(question.options.every(option => /[\u3400-\u9FFF]/u.test(option.sub)));
        }
      });
      for (const playerDirection of [direction, opposite(direction)]) {
        const playerQuestions = questions.filter(question => question.direction === playerDirection);
        assert.equal(playerQuestions.length, 6);
        for (const type of ["meaning", "listen", "tone"]) {
          assert.equal(playerQuestions.filter(question => question.type === type).length, 2);
        }
        assert.ok(playerQuestions.filter(question => question.type === "listen")
          .every(question => question.audio.grade === grade));
        const toneGrades = playerQuestions.filter(question => question.type === "tone").map(question => question.audio.grade);
        assert.ok(toneGrades.includes(grade));
        if (grade !== "S1") assert.ok(toneGrades.every(toneGrade => toneGrade !== "S1"));
      }
      const comparisonByPlayer = [direction, opposite(direction)].map(playerDirection => questions
        .filter(question => question.direction === playerDirection && question.type === "tone")
        .map(question => question.audio.grade)
        .find(toneGrade => toneGrade !== grade));
      assert.equal(comparisonByPlayer[0], comparisonByPlayer[1]);
    }
  }
});

test("all three battle modes keep equal bilingual schedules and the same register boundary", () => {
  const battle = loadBattle();
  const expectedModes = {
    standard: { rounds: 12, turnMs: 12000, counts: { meaning: 2, listen: 2, tone: 2 } },
    blitz: { rounds: 8, turnMs: 8000, counts: { meaning: 1, listen: 1, tone: 2 } },
    register: { rounds: 12, turnMs: 10000, counts: { meaning: 1, listen: 2, tone: 3 } }
  };
  assert.deepEqual(Object.fromEntries(plain(battle.inspect().modes).map(mode => [mode.id, {
    rounds: mode.rounds, turnMs: mode.turnMs, counts: mode.counts
  }])), expectedModes);

  for (const [mode, config] of Object.entries(expectedModes)) {
    for (const direction of ["zh-th", "th-zh"]) {
      for (const grade of ["S5", "S4", "S3", "S2", "S1"]) {
        const questions = plain(battle.__test.buildQuestions({ direction, grade, mode }));
        assert.equal(questions.length, config.rounds, `${mode}/${direction}/${grade} round count`);
        const registerPackIds = questions.filter(question => question.audio).map(question => question.audio.packId);
        assert.equal(new Set(registerPackIds).size, registerPackIds.length, `${mode}/${direction}/${grade} register prompts are globally unique`);
        const meaningWordIds = questions.filter(question => question.type === "meaning").map(question => question.wordId);
        assert.equal(new Set(meaningWordIds).size, meaningWordIds.length, `${mode}/${direction}/${grade} meaning prompts are globally unique`);
        const opposite = direction === "zh-th" ? "th-zh" : "zh-th";
        for (const playerDirection of [direction, opposite]) {
          const playerQuestions = questions.filter(question => question.direction === playerDirection);
          assert.equal(playerQuestions.length, config.rounds / 2);
          for (const type of ["meaning", "listen", "tone"]) {
            assert.equal(playerQuestions.filter(question => question.type === type).length, config.counts[type]);
          }
          assert.ok(playerQuestions.filter(question => question.type === "listen")
            .every(question => question.audio.grade === grade));
          const toneGrades = playerQuestions.filter(question => question.type === "tone").map(question => question.audio.grade);
          assert.ok(toneGrades.includes(grade));
          assert.equal(toneGrades.filter(value => value !== grade).length, 1);
          if (grade !== "S1") assert.ok(toneGrades.every(value => value !== "S1"));
        }
        const comparisons = [direction, opposite].map(playerDirection => questions
          .filter(question => question.direction === playerDirection && question.type === "tone")
          .map(question => question.audio.grade)
          .find(value => value !== grade));
        assert.ok(comparisons[0]);
        assert.equal(comparisons[0], comparisons[1]);
      }
    }
  }
  assert.equal(battle.__test.buildQuestions({ mode: "constructor" }).length, 12);
  assert.equal(battle.__test.buildQuestions({ mode: "__proto__" }).length, 12);
});

test("battle reads the persisted record schema using its public total and ties fields", () => {
  const world = loadBattleWorld();
  const detail = {
    mode: "blitz", grade: "S3", direction: "zh-th", playedAt: 123,
    players: [
      { name: "Alice", score: 300, correct: 3, answered: 4, totalMs: 10000 },
      { name: "Mint", score: 200, correct: 2, answered: 4, totalMs: 12000 }
    ]
  };
  assert.ok(world.HUILAISHI_BATTLE_RECORDS.recordMatch(detail));
  const summary = plain(world.HUILAISHI_LOCAL_BATTLE.__test.recordSummary("Alice"));
  assert.equal(summary.matches, 1);
  assert.equal(summary.wins, 1);
  assert.equal(summary.draws, 0);
  assert.equal(summary.winRate, 100);
});

test("battle samples only the audited training corpus and keeps the fixed rules public", () => {
  const battle = loadBattle();
  const inspection = plain(battle.inspect());
  assert.equal(inspection.wordCount, 2875);
  assert.equal(inspection.registerPackCount, 20);
  assert.equal(inspection.rounds, 12);
  assert.equal(inspection.turnMs, 12000);
  assert.deepEqual(inspection.questionTypes, ["meaning", "listen", "tone"]);
  const source = read("battle.js");
  assert.match(source, /word\.reviewVariant \|\| word\.trainingAllowed === false/u);
  assert.match(source, /Math\.max\(20, count \* 6\)/u);
  assert.match(source, /TONE_BOUNDARIES/u);
  assert.match(source, /getVariant\?\.\(pack\.id, grade, "source"\)/u);
  assert.doesNotMatch(source, /HUILAISHI_VOCAB_REVIEW_CANDIDATES/u);
});

test("every non-S1 register prompt used in battle has the same fixed source-form audio for both players", () => {
  const world = loadBattleWorld();
  for (const pack of world.HUILAISHI_REGISTER_PACK) {
    for (const grade of ["S5", "S4", "S3", "S2"]) {
      const variant = world.HUILAISHI_REGISTER_GUIDE.getVariant(pack.id, grade, "source");
      for (const direction of ["zh-th", "th-zh"]) {
        const family = direction === "zh-th" ? "th" : "zh";
        const text = direction === "zh-th" ? variant.th : variant.zh;
        const lang = direction === "zh-th" ? "th-TH" : "zh-CN";
        const key = `register:${pack.id}:${grade}:${family}`;
        assert.ok(world.HUILAISHI_CUTE_AUDIO.lookup({ text, lang, track: "standard", key }), `${key} has exact packaged audio`);
      }
    }
  }
});

test("battle audio never falls back to device TTS and passive S1 text is not globally spoken", () => {
  const source = read("battle.js");
  const index = read("index.html");
  const speech = read("speech-engine.js");
  const characterPlayer = source.match(/function playCharacterAudio\([^]*?\n  \}/u)?.[0] || "";
  assert.match(characterPlayer, /new root\.Audio\(source\)/u);
  assert.doesNotMatch(characterPlayer, /\.speak\(|speechSynthesis|SpeechSynthesisUtterance/u);
  assert.match(source, /track: "standard",\s*fallback: "none"/u);
  assert.match(index, /id="local-battle-root"[^>]*data-speech-policy="none"/u);
  assert.match(source, /host\.setAttribute\("data-speech-policy", "none"\)/u);
  assert.match(source, /function handleClick\(event\) \{\s*\/\/[^]*event\.stopPropagation\?\.\(\);/u);
  assert.match(speech, /track === "character"\) return reportPlaybackError/u);
  assert.match(speech, /options\.fallback !== "none" && track !== "character"/u);
});

test("listen timing, background cover and modal lifecycle protect both players", () => {
  const source = read("battle.js");
  const app = read("app.js");
  const css = read("battle.css");
  assert.match(source, /state\.phase = "preroll";[^]*playQuestionAudio\(\{ onEnd, onError \}\)/u);
  assert.match(source, /function activateQuestionTimer\([^]*state\.questionStartedAt = Date\.now\(\)/u);
  assert.match(source, /const replayLocked = state\.phase === "preroll"[^]*replayLocked \? "disabled/u);
  assert.match(source, /actionNode\?\.disabled[^]*state\.phase !== "preroll"/u);
  assert.match(source, /turnMatch = matchSerial[^]*turnRound = state\.round[^]*isCurrentPreroll/u);
  assert.match(source, /waitingForAudio \? `role="status" aria-live="polite" tabindex="0"`/u);
  assert.match(source, /waitingForAudio\) focusTarget\("\[data-duel-clock\]"\)/u);
  assert.match(source, /try \{ player = new root\.Audio\(source\); \}[^]*callbacks\.onError/u);
  assert.match(source, /try \{[^]*result = speech\.speak\([^]*catch \(_\) \{[^]*callbacks\.onError/u);
  assert.match(source, /question\.type !== "listen" && !question\.audioFallback/u);
  assert.match(source, /question\.type === "listen" \? c\.listenNoSpeed/u);
  assert.match(source, /audioTextFallback/u);
  assert.match(source, /visibilitychange[^]*handleVisibilityChange/u);
  assert.match(source, /pagehide[^]*coverActiveTurn/u);
  assert.match(source, /pageshow[^]*handlePageShow/u);
  assert.match(source, /function forfeitActiveTurn\(\)[^]*answerQuestion\(-1, true\)/u);
  assert.match(source, /function coverActiveTurn\(\)[^]*forfeitActiveTurn\(\)/u);
  assert.doesNotMatch(source.match(/function coverActiveTurn\(\)[^]*?\n  \}/u)?.[0] || "", /renderHandoff\(/u);
  assert.match(source, /event\.key === "Escape"[^]*API\.close\(\)/u);
  assert.match(source, /event\.key === "Tab"[^]*focusable/u);
  assert.match(source, /id="hls-duel-question-prompt"[^]*role="group" aria-labelledby="hls-duel-question-prompt"/u);
  assert.match(source, /renderSetup\("", "\[data-duel-mode\]\[aria-pressed='true'\]"\)/u);
  assert.match(source, /renderSetup\("", "\[data-duel-direction\]\[aria-pressed='true'\]"\)/u);
  assert.match(source, /renderSetup\("", "\[data-duel-grade\]\[aria-pressed='true'\]"\)/u);
  assert.match(source, /renderSetup\(copy\(\)\.dataError, "\[data-duel-error\]"\)/u);
  assert.match(source, /function confirmMatchExit\([^]*root\.confirm\(copy\(\)\.leaveConfirm\)/u);
  assert.match(source, /close\(config = \{\}\)[^]*if \(!confirmMatchExit\(force\)\) return false/u);
  assert.match(source, /class="\$\{optionClass\}" role="group"/u);
  assert.match(source, /insertAdjacentElement\?\.\("afterend", recordLine\)/u);
  assert.match(app, /handleLocalBattlePopState\(\)[^]*closed === false[^]*\[APP_HISTORY_STATE_KEY\]: activeAppRoute \|\| "battle"/u);
  assert.match(css, /\.hls-duel-options\.is-tone \{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/u);
  assert.match(css, /\.hls-duel-options\.is-tone \.hls-duel-option \{[^}]*min-height:48px !important/u);
  assert.match(app, /setSheetBackgroundInert\(host\)/u);
  assert.ok(app.includes('history.pushState({ ...(history.state || {}), [APP_HISTORY_STATE_KEY]: activeAppRoute || "battle", huilaishiLocalBattle: true }, "", location.href)'));
  assert.match(app, /function handleApplicationPopState\(event\)[^]*handleLocalBattlePopState\(\)/u);
  assert.match(app, /window\.addEventListener\("popstate", handleApplicationPopState\)/u);
  assert.match(css, /\.hls-duel-host \{[^}]*position:absolute;[^}]*overflow-y:auto;/u);
  assert.match(css, /\.hls-duel \{[^}]*min-height:100vh;\s*min-height:100dvh;[^}]*var\(--app-safe-top\)/u);
  assert.match(css, /\.hls-duel-names input \{[^}]*font-size:16px;/u);
});

test("battle is included by every web, standalone, Android and iOS dependency path", () => {
  const index = read("index.html");
  const worker = read("service-worker.js");
  const standalone = read("build-offline.ps1");
  const android = read("scripts/configure-android.mjs");
  const ios = read("scripts/configure-ios.mjs");
  assert.match(index, /href="battle\.css"/u);
  assert.match(index, /src="battle\.js"/u);
  assert.ok(index.indexOf('src="register-pack.js"') < index.indexOf('src="battle.js"'));
  assert.match(worker, /"\.\/battle\.css"/u);
  assert.match(worker, /"\.\/battle\.js"/u);
  assert.match(worker, /"\.\/battle-records\.js"/u);
  assert.match(standalone, /battle\.css/u);
  assert.match(standalone, /battle\.js/u);
  assert.match(standalone, /battle-records\.js/u);
  assert.match(android, /"battle\.css"/u);
  assert.match(android, /"battle\.js"/u);
  assert.match(android, /"battle-records\.js"/u);
  assert.match(ios, /runtimeFiles\(indexSource\)/u);
  assert.ok(index.indexOf('src="battle-records.js"') < index.indexOf('src="battle.js"'));
  assert.match(read("app.js"), /"huilaishi-battle-records-v1"/u);
});
