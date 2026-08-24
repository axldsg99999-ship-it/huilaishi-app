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
    { mode: 0, grade: "S5", recommendedGame: "audio", allowedGames: ["match", "audio", "speed"] },
    { mode: 1, grade: "S4", recommendedGame: "audio", allowedGames: ["match", "audio", "speed"] },
    { mode: 2, grade: "S3", recommendedGame: "audio", allowedGames: ["match", "audio", "speed"] },
    { mode: 3, grade: "S2", recommendedGame: "polish", allowedGames: ["tone", "polish"] },
    { mode: 4, grade: "S1", recommendedGame: "tone", allowedGames: ["match", "tone", "polish"] }
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
    assert.equal(new Set(order).size, 5);
  });
});

test("tone radar devotes sixty percent of a round to the current grade and keeps comparisons", () => {
  for (const grade of ["S5", "S4", "S3", "S2", "S1"]) {
    const plan = plain(loadArcade().buildToneGradePlan(10, grade));
    assert.equal(plan.length, 10);
    assert.equal(plan.filter(item => item === grade).length, 6);
    assert.equal(new Set(plan).size, 5);
  }
});
