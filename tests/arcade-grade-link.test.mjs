import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(TEST_DIR, "..");

function loadArcade({ direction = "zh-th", mode = null } = {}) {
  const values = new Map();
  if (mode !== null) values.set(`thai-vibe-mode-${direction}`, String(mode));
  const world = {
    __HUILAISHI_TEST__: true,
    HUILAISHI_STORAGE: {
      getItem(key) { return values.has(key) ? values.get(key) : null; },
      setItem(key, value) { values.set(key, String(value)); }
    },
    document: {
      readyState: "loading",
      addEventListener() {},
      body: { classList: { contains(name) { return direction === "th-zh" && name === "dir-th-zh"; } } },
      querySelector() { return null; }
    }
  };
  world.window = world;
  world.globalThis = world;
  const sandbox = vm.createContext(world);
  for (const filename of ["register-pack.js", "arcade.js"]) {
    vm.runInContext(fs.readFileSync(path.join(PROJECT_ROOT, filename), "utf8"), sandbox, { filename });
  }
  return sandbox.__HUILAISHI_ARCADE_TEST__;
}

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

test("arcade recommendation follows the committed register grade gamePolicy", () => {
  const expected = [
    { mode: 0, grade: "S5", recommendedGame: "audio", allowedGames: ["match", "grade-lock", "audio", "scene-listen", "speed", "register-shift"] },
    { mode: 1, grade: "S4", recommendedGame: "audio", allowedGames: ["match", "grade-lock", "audio", "scene-listen", "speed", "register-shift"] },
    { mode: 2, grade: "S3", recommendedGame: "audio", allowedGames: ["match", "grade-lock", "audio", "scene-listen", "speed", "register-shift"] },
    { mode: 3, grade: "S2", recommendedGame: "polish", allowedGames: ["tone", "grade-lock", "scene-listen", "polish", "register-shift"] },
    { mode: 4, grade: "S1", recommendedGame: "tone", allowedGames: ["match", "grade-lock", "tone", "scene-listen", "polish", "register-shift"] }
  ];

  for (const item of expected) {
    const helpers = loadArcade({ mode: item.mode });
    const state = plain(helpers.activeGameLink());
    assert.equal(state.grade, item.grade);
    assert.equal(state.recommendedGame, item.recommendedGame);
    assert.deepEqual(state.allowedGames, item.allowedGames);
  }
});

test("arcade falls back to the guide default grade when no mode has been saved", () => {
  assert.equal(loadArcade().activeRegisterGrade(), "S4");
  assert.equal(loadArcade({ direction: "th-zh", mode: 4 }).activeRegisterGrade(), "S1");
});

test("the current grade recommendation is the first game in visual and reading order", () => {
  const expectedFirst = ["audio", "audio", "audio", "polish", "tone"];
  expectedFirst.forEach((game, mode) => {
    const order = plain(loadArcade({ mode }).orderedGameIds());
    assert.equal(order[0], game);
    assert.equal(new Set(order).size, 8);
  });
});

test("arcade exposes eight distinct games including three register-linked additions", () => {
  const ids = plain(loadArcade().gameIds());
  assert.equal(ids.length, 8);
  assert.equal(new Set(ids).size, 8);
  assert.deepEqual(ids.slice(-3), ["grade-lock", "scene-listen", "register-shift"]);
});

test("tone radar devotes sixty percent of a round to the current grade and keeps comparisons", () => {
  for (const grade of ["S5", "S4", "S3", "S2", "S1"]) {
    const plan = plain(loadArcade().buildToneGradePlan(10, grade));
    assert.equal(plan.length, 10);
    assert.equal(plan.filter(item => item === grade).length, 6);
    assert.equal(new Set(plan).size, 5);
  }
});

test("listen-by-scene uses the committed grade and four unique audited scenarios", () => {
  for (const [mode, grade] of ["S5", "S4", "S3", "S2", "S1"].entries()) {
    const items = plain(loadArcade({ mode }).buildSceneListenItems(8, grade));
    assert.equal(items.length, 8);
    for (const item of items) {
      assert.equal(item.variant.grade, grade);
      assert.equal(item.options.length, 4);
      assert.equal(new Set(item.options.map(option => option.pack.id)).size, 4);
      assert.equal(item.options.filter(option => option.correct).length, 1);
      assert.equal(item.options.find(option => option.correct).pack.id, item.pack.id);
    }
  }
});

test("grade lock never leaks another register into the selected-grade round", () => {
  for (const [mode, grade] of ["S5", "S4", "S3", "S2", "S1"].entries()) {
    const items = plain(loadArcade({ mode }).buildGradeLockItems(8, grade));
    assert.equal(items.length, 8);
    for (const item of items) {
      assert.equal(item.variant.grade, grade);
      assert.equal(item.options.length, 4);
      assert.equal(new Set(item.options.map(option => option.pack.id)).size, 4);
      assert.ok(item.options.every(option => option.variant.grade === grade));
      assert.equal(item.options.filter(option => option.correct).length, 1);
      assert.equal(item.options.find(option => option.correct).pack.id, item.pack.id);
    }
  }
});

test("register shifting starts at the committed grade and targets each scenario recommendation", () => {
  for (const [mode, grade] of ["S5", "S4", "S3", "S2", "S1"].entries()) {
    const items = plain(loadArcade({ mode }).buildRegisterShiftItems(8, grade));
    assert.equal(items.length, 8);
    for (const item of items) {
      assert.equal(item.source.grade, grade);
      assert.equal(item.target.id, item.pack.recommendedVariantId);
      assert.equal(item.target.grade, item.pack.recommendedGrade);
      assert.equal(item.options.length, 3);
      assert.equal(item.options.filter(option => option.correct).length, 1);
      assert.equal(item.options.find(option => option.correct).variant.id, item.target.id);
      if (["S5", "S4", "S3"].includes(grade)) {
        assert.ok(item.options.every(option => ["S5", "S4", "S3"].includes(option.variant.grade)));
      }
    }
  }
});

test("register-game option audition is a separate keyboard-accessible control", () => {
  const helpers = loadArcade({ mode: 1 });
  const [item] = helpers.buildGradeLockItems(1, "S4");
  const markup = helpers.registerOptionMarkup(item.options[0].pack, item.options[0], 0, "grade-lock");
  assert.equal((markup.match(/<button\b/gu) || []).length, 2);
  assert.match(markup, /data-grade-lock="0"[^>]*aria-keyshortcuts="A 1"/u);
  assert.match(markup, /data-register-option-audio="0"[^>]*data-speech-policy="native"[^>]*aria-keyshortcuts="Shift\+A"/u);
  assert.ok(markup.indexOf('data-grade-lock="0"') < markup.indexOf('data-register-option-audio="0"'));

  const source = fs.readFileSync(path.join(PROJECT_ROOT, "arcade.js"), "utf8");
  const styles = fs.readFileSync(path.join(PROJECT_ROOT, "arcade.css"), "utf8");
  assert.match(source, /function playRegisterOption\([\s\S]*?playRegisterVariant\(option\.pack \|\| game\.current\?\.pack, option\.variant\);/u);
  assert.match(source, /const registerOptionAudio = event\.target\.closest\("\[data-register-option-audio\]"\)/u);
  assert.match(styles, /\.register-option-audio \{[^}]*min-width:44px;[^}]*min-height:44px;/u);
});

test("listen-by-scene keeps replay and answer selection as distinct controls", () => {
  const source = fs.readFileSync(path.join(PROJECT_ROOT, "arcade.js"), "utf8");
  const render = source.match(/function renderSceneListenQuestion\(\) \{[\s\S]*?\n  \}/u)?.[0] || "";
  assert.match(render, /data-register-audio/u);
  assert.match(render, /data-scene-listen/u);
  assert.doesNotMatch(render, /data-speak-text|data-speak-lang/u);
  assert.match(source, /点上方播放键可重复听；点下方情境即作答。/u);
});
