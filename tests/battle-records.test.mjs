import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(TEST_DIR, "..");
const SOURCE = fs.readFileSync(path.join(PROJECT_ROOT, "battle-records.js"), "utf8");
const KEY = "huilaishi-battle-records-v1";

class MemoryStorage {
  constructor(initial = {}) {
    this.values = new Map(Object.entries(initial).map(([key, value]) => [String(key), String(value)]));
  }

  getItem(key) { return this.values.has(String(key)) ? this.values.get(String(key)) : null; }
  setItem(key, value) { this.values.set(String(key), String(value)); }
  removeItem(key) { this.values.delete(String(key)); }
}

function loadRecords({ storage, localStorage, localStorageGetter } = {}) {
  const world = {};
  if (storage !== undefined) world.HUILAISHI_STORAGE = storage;
  if (localStorageGetter) Object.defineProperty(world, "localStorage", { configurable: true, get: localStorageGetter });
  else if (localStorage !== undefined) world.localStorage = localStorage;
  world.window = world;
  world.globalThis = world;
  vm.runInContext(SOURCE, vm.createContext(world), { filename: "battle-records.js" });
  return { api: world.HUILAISHI_BATTLE_RECORDS, world };
}

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function match({
  mode = "local-battle",
  grade = "S4",
  direction = "zh-th",
  playedAt = 1000,
  winnerIndex,
  a = { name: "Alice", score: 200, correct: 5, answered: 6, totalMs: 12000 },
  b = { name: "Bob", score: 100, correct: 4, answered: 6, totalMs: 16000 }
} = {}) {
  return { mode, grade, direction, playedAt, winnerIndex, players: [a, b] };
}

test("exposes a frozen IIFE API and supports discovered or injected storage", () => {
  const discovered = new MemoryStorage();
  const injected = new MemoryStorage();
  const { api } = loadRecords({ storage: discovered });

  assert.ok(Object.isFrozen(api));
  for (const method of ["init", "recordMatch", "getSummary", "getRecent", "clear", "inspect"]) {
    assert.equal(typeof api[method], "function", method);
  }
  assert.deepEqual(plain(api.inspect()), {
    key: KEY,
    version: 1,
    maxRecords: 30,
    defaultRecentLimit: 10,
    storageSource: "HUILAISHI_STORAGE",
    storageAvailable: true,
    count: 0,
    lastError: null
  });

  api.init({ storage: injected });
  assert.ok(api.recordMatch(match()));
  assert.equal(discovered.getItem(KEY), null);
  assert.ok(injected.getItem(KEY));
  assert.equal(api.inspect().storageSource, "injected");

  api.init();
  assert.ok(api.recordMatch(match({ playedAt: 2000 })));
  assert.ok(discovered.getItem(KEY));
  assert.equal(api.inspect().storageSource, "HUILAISHI_STORAGE");

  const local = new MemoryStorage();
  const localApi = loadRecords({ localStorage: local }).api;
  assert.ok(localApi.recordMatch(match()));
  assert.equal(localApi.inspect().storageSource, "localStorage");
});

test("recordMatch strictly normalizes fields, derives the result, and stores schema v1", () => {
  const storage = new MemoryStorage();
  const { api } = loadRecords({ storage });
  const longName = `  \u0000 Alice     ${"好".repeat(30)} `;
  const playedAt = "2026-08-24T06:00:00.000Z";
  const recorded = plain(api.recordMatch(match({
    mode: `  custom\u0007 mode ${"x".repeat(40)}  `,
    grade: "s1",
    direction: "TH-ZH",
    playedAt,
    a: { name: longName, score: "12.9", correct: 99, answered: "3.8", totalMs: -4 },
    b: { name: "", score: Infinity, correct: -2, answered: 2, totalMs: 999999999 }
  })));

  assert.equal(recorded.grade, "S1");
  assert.equal(recorded.direction, "th-zh");
  assert.equal(recorded.playedAt, Date.parse(playedAt));
  assert.equal([...recorded.mode].length, 24);
  assert.doesNotMatch(recorded.mode, /[\u0000-\u001f]/u);
  assert.equal([...recorded.players[0].name].length, 18);
  assert.equal(recorded.players[0].score, 12);
  assert.equal(recorded.players[0].answered, 3);
  assert.equal(recorded.players[0].correct, 3);
  assert.equal(recorded.players[0].totalMs, 0);
  assert.equal(recorded.players[1].name, "玩家 B");
  assert.equal(recorded.players[1].score, 0);
  assert.equal(recorded.players[1].correct, 0);
  assert.equal(recorded.players[1].totalMs, 86400000);
  assert.equal(recorded.winner, 0);
  assert.equal(recorded.winnerName, recorded.players[0].name);
  assert.equal(recorded.tie, false);

  const payload = JSON.parse(storage.getItem(KEY));
  assert.equal(payload.version, 1);
  assert.equal(payload.records.length, 1);
  assert.deepEqual(payload.records[0], recorded);

  const defaults = plain(api.recordMatch(match({ grade: "S0", direction: "javascript:", a: { name: "", score: 1 }, b: { name: "", score: 1 } })));
  assert.equal(defaults.grade, "S4");
  assert.equal(defaults.direction, "zh-th");
  assert.equal(defaults.players[0].name, "玩家 A");
  assert.equal(defaults.players[1].name, "ผู้เล่น B");
  assert.equal(defaults.winner, null);
  assert.equal(defaults.winnerName, "");
  assert.equal(defaults.tie, true);

  const numericTime = api.recordMatch(match({ playedAt: "12345" }));
  assert.equal(numericTime.playedAt, 12345);
});

test("recordMatch preserves an explicit HP winner even when statistical scores differ", () => {
  const storage = new MemoryStorage();
  const { api } = loadRecords({ storage });
  const recorded = api.recordMatch(match({
    mode: "voice",
    winnerIndex: 1,
    a: { name: "A", score: 500, correct: 2, answered: 3, totalMs: 4000 },
    b: { name: "B", score: 300, correct: 1, answered: 2, totalMs: 3000 }
  }));
  assert.equal(recorded.winner, 1);
  assert.equal(recorded.winnerName, "B");
  assert.equal(recorded.tie, false);

  const reloaded = loadRecords({ storage }).api.getSummary("B", 1);
  assert.equal(reloaded.recent[0].result, "win");
});

test("rejects malformed or inherited match shapes without prototype pollution", () => {
  const storage = new MemoryStorage();
  const { api } = loadRecords({ storage });
  const validPlayers = match().players;
  const inherited = Object.create({ players: validPlayers, direction: "th-zh" });
  const throwing = {};
  Object.defineProperty(throwing, "players", { get() { throw new Error("hostile getter"); } });

  for (const value of [null, [], {}, { players: [] }, { players: [validPlayers[0]] }, { players: ["A", "B"] }, inherited, throwing]) {
    assert.doesNotThrow(() => api.recordMatch(value));
    assert.equal(api.recordMatch(value), null);
  }
  assert.equal(storage.getItem(KEY), null);

  const malicious = JSON.parse('{"mode":"__proto__","grade":"S4","direction":"zh-th","players":[{"name":"__proto__","score":2,"answered":1,"correct":1,"__proto__":{"polluted":true}},{"name":"constructor","score":1,"answered":1,"correct":1}],"__proto__":{"polluted":true}}');
  assert.ok(api.recordMatch(malicious));
  assert.equal(Object.prototype.polluted, undefined);
  assert.equal(({}).polluted, undefined);
  assert.equal(api.getRecent(1)[0].players[0].name, "__proto__");
});

test("keeps only 30 matches and returns defensive newest-first recent records", () => {
  const storage = new MemoryStorage();
  const { api } = loadRecords({ storage });
  for (let index = 0; index < 35; index += 1) {
    assert.ok(api.recordMatch(match({ playedAt: index, a: { name: "A", score: index }, b: { name: "B", score: 0 } })));
  }

  const all = plain(api.getRecent(999));
  assert.equal(all.length, 30);
  assert.equal(all[0].playedAt, 34);
  assert.equal(all.at(-1).playedAt, 5);
  assert.equal(api.getRecent().length, 10);
  assert.deepEqual(plain(api.getRecent(0)), []);
  assert.deepEqual(plain(api.getRecent(-4)), []);
  assert.equal(JSON.parse(storage.getItem(KEY)).records.length, 30);

  all[0].players[0].name = "mutated";
  all[0].players[0].score = 0;
  const reread = api.getRecent(1)[0];
  assert.equal(reread.players[0].name, "A");
  assert.equal(reread.players[0].score, 34);
});

test("summarizes a named player and defaults to the player-A seat", () => {
  const storage = new MemoryStorage();
  const { api } = loadRecords({ storage });
  api.recordMatch(match({ playedAt: 1, a: { name: "Alice", score: 100 }, b: { name: "Bob", score: 50 } }));
  api.recordMatch(match({ playedAt: 2, a: { name: "Cara", score: 110 }, b: { name: "ALICE", score: 80 } }));
  api.recordMatch(match({ playedAt: 3, a: { name: " alice ", score: 70 }, b: { name: "Dan", score: 70 } }));
  api.recordMatch(match({ playedAt: 4, a: { name: "Eve", score: 20 }, b: { name: "Frank", score: 40 } }));

  const alice = plain(api.getSummary("  ALICE "));
  assert.equal(alice.scope, "player");
  assert.equal(alice.total, 3);
  assert.equal(alice.wins, 1);
  assert.equal(alice.losses, 1);
  assert.equal(alice.ties, 1);
  assert.equal(alice.winRate, 33.3);
  assert.equal(alice.bestScore, 100);
  assert.deepEqual(alice.recent.map(item => item.result), ["tie", "loss", "win"]);
  assert.deepEqual(alice.recent.map(item => item.opponent), ["Dan", "Cara", "Bob"]);

  const playerA = plain(api.getSummary());
  assert.equal(playerA.playerName, null);
  assert.equal(playerA.scope, "player-a");
  assert.equal(playerA.total, 4);
  assert.equal(playerA.wins, 2);
  assert.equal(playerA.losses, 1);
  assert.equal(playerA.ties, 1);
  assert.equal(playerA.winRate, 50);
  assert.equal(playerA.bestScore, 110);

  assert.deepEqual(plain(api.getSummary("Nobody")), {
    playerName: "Nobody", scope: "player", total: 0, wins: 0, losses: 0, ties: 0,
    winRate: 0, bestScore: 0, recent: []
  });

  const sameNameStorage = new MemoryStorage();
  const sameNameApi = loadRecords({ storage: sameNameStorage }).api;
  sameNameApi.recordMatch(match({
    a: { name: "Sam", score: 200 },
    b: { name: "Sam", score: 100 }
  }));
  assert.equal(sameNameApi.getSummary("Sam", 0).wins, 1);
  assert.equal(sameNameApi.getSummary("Sam", 1).losses, 1);
});

test("recovers from bad JSON and sanitizes stored records", () => {
  const storage = new MemoryStorage({ [KEY]: "{bad-json" });
  const { api } = loadRecords({ storage });
  assert.deepEqual(plain(api.getRecent()), []);
  assert.equal(api.inspect().lastError, "invalid-json");
  assert.ok(api.recordMatch(match({ playedAt: 9 })));
  assert.equal(api.getRecent(1)[0].playedAt, 9);

  storage.setItem(KEY, JSON.stringify({
    version: 1,
    records: [
      { direction: "TH-ZH", grade: "s2", mode: "stored", playedAt: 10, players: [{ name: "A", score: -2 }, { name: "B", score: 5 }] },
      { players: ["invalid", "record"] },
      { __proto__: { polluted: true }, players: [] }
    ]
  }));
  const recent = plain(api.getRecent(30));
  assert.equal(recent.length, 1);
  assert.equal(recent[0].direction, "th-zh");
  assert.equal(recent[0].grade, "S2");
  assert.equal(recent[0].winner, 1);
  assert.equal(Object.prototype.polluted, undefined);

  storage.setItem(KEY, JSON.stringify({ version: 99, records: [match()] }));
  assert.deepEqual(plain(api.getRecent()), []);
  assert.equal(api.inspect().lastError, "invalid-payload");
});

test("storage read, write, property-access, discovery, and clear failures never escape", () => {
  const readFailure = {
    getItem() { throw new Error("blocked"); },
    setItem() { throw new Error("blocked"); },
    removeItem() { throw new Error("blocked"); }
  };
  const readApi = loadRecords({ storage: readFailure }).api;
  assert.doesNotThrow(() => readApi.getRecent());
  assert.deepEqual(plain(readApi.getRecent()), []);
  assert.deepEqual(plain(readApi.getSummary()).recent, []);
  assert.equal(readApi.recordMatch(match()), null);
  assert.equal(readApi.clear(), false);
  assert.equal(readApi.inspect().storageAvailable, false);

  const quota = new MemoryStorage();
  quota.setItem(KEY, JSON.stringify({ version: 1, records: [] }));
  quota.setItem = () => { throw new Error("QuotaExceededError"); };
  const quotaApi = loadRecords({ storage: quota }).api;
  assert.doesNotThrow(() => quotaApi.recordMatch(match()));
  assert.equal(quotaApi.recordMatch(match()), null);
  assert.equal(JSON.parse(quota.getItem(KEY)).records.length, 0);

  const methodGetterFailure = {};
  Object.defineProperty(methodGetterFailure, "getItem", { get() { throw new Error("denied"); } });
  const getterApi = loadRecords({ storage: methodGetterFailure }).api;
  assert.doesNotThrow(() => getterApi.getRecent());
  assert.deepEqual(plain(getterApi.getRecent()), []);
  assert.equal(getterApi.recordMatch(match()), null);

  const discoveryApi = loadRecords({ localStorageGetter() { throw new Error("SecurityError"); } }).api;
  assert.doesNotThrow(() => discoveryApi.inspect());
  assert.equal(discoveryApi.inspect().storageAvailable, false);
  assert.equal(discoveryApi.recordMatch(match()), null);
});

test("clear removes records and falls back to an empty payload without removeItem", () => {
  const storage = new MemoryStorage();
  const { api } = loadRecords({ storage });
  api.recordMatch(match());
  assert.equal(api.clear(), true);
  assert.equal(storage.getItem(KEY), null);
  assert.deepEqual(plain(api.getRecent()), []);

  const values = new Map();
  const noRemove = {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, value); }
  };
  const fallbackApi = loadRecords({ storage: noRemove }).api;
  fallbackApi.recordMatch(match());
  assert.equal(fallbackApi.clear(), true);
  assert.deepEqual(JSON.parse(values.get(KEY)), { version: 1, records: [] });
  assert.deepEqual(plain(fallbackApi.getRecent()), []);
});
