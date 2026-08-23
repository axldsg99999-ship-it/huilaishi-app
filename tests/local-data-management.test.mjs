import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const appSource = readFileSync(new URL("../app.js", import.meta.url), "utf8");

function loadPolicy() {
  const startMarker = "// LOCAL_DATA_POLICY_START";
  const endMarker = "// LOCAL_DATA_POLICY_END";
  const start = appSource.indexOf(startMarker);
  const end = appSource.indexOf(endMarker);
  assert.ok(start >= 0 && end > start, "app.js must expose a testable local-data policy block");
  const context = vm.createContext({ window: {} });
  vm.runInContext(appSource.slice(start, end + endMarker.length), context, { filename: "app.js#local-data-policy" });
  return context.window.HUILAISHI_LOCAL_DATA_POLICY;
}

class FakeStorage {
  constructor(entries = {}) { this.values = new Map(Object.entries(entries).map(([key, value]) => [key, String(value)])); }
  get length() { return this.values.size; }
  key(index) { return [...this.values.keys()][index] ?? null; }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(String(key), String(value)); }
  removeItem(key) { this.values.delete(String(key)); }
}

test("local-data whitelist recognizes every current app storage family without using a broad huilaishi prefix", () => {
  const policy = loadPolicy();
  const owned = [
    "learningDirection",
    "huilaishi-core-audio-consent-v1",
    "huilaishi-thai-speaker-profile-v1",
    "huilaishi-partner-adult",
    "huilaishi-onboarded-zh-th",
    "huilaishi-vocab-known-th-zh",
    "huilaishi-arcade-stats-zh-th",
    "huilaishi-guide-v12:home:zh-th:S4",
    "huilaishi-pronunciation-best:th:hello",
    "thai-vibe-mode-zh-th",
    "register-route-complete-zh-th-S5",
    "register-battle-index-th-zh-S1",
    "partner-relay-zh-th",
    "offline-scene-th-zh",
    "offline-turns-zh-th"
  ];
  for (const key of owned) assert.equal(policy.ownsKey(key), true, key);

  const unrelated = [
    "other-project-session",
    "huilaishi-other-project",
    "huilaishi-microphone-recording",
    "huilaishi-guide-video-editor",
    "thai-vibe-other-app",
    "register-route-different-project",
    "recorded-audio"
  ];
  for (const key of unrelated) assert.equal(policy.ownsKey(key), false, key);
});

test("clear removes only snapshotted app keys and preserves unrelated same-origin data", () => {
  const policy = loadPolicy();
  const storage = new FakeStorage({
    learningDirection: "zh-th",
    "huilaishi-vocab-known-zh-th": "[\"v1\"]",
    "offline-turns-zh-th": "4",
    "other-project-session": "keep-me",
    "huilaishi-other-project": "also-keep-me",
    "recorded-audio": "never-owned"
  });

  const result = policy.clear(storage);
  assert.deepEqual([...result.removedKeys], ["huilaishi-vocab-known-zh-th", "learningDirection", "offline-turns-zh-th"]);
  assert.deepEqual([...result.failedKeys], []);
  assert.equal(storage.getItem("other-project-session"), "keep-me");
  assert.equal(storage.getItem("huilaishi-other-project"), "also-keep-me");
  assert.equal(storage.getItem("recorded-audio"), "never-owned");
});

test("JSON export contains only app localStorage plus version, time and per-direction statistics", () => {
  const policy = loadPolicy();
  const storage = new FakeStorage({
    learningDirection: "zh-th",
    "register-route-complete-zh-th-S5": "1",
    "register-route-complete-zh-th-S4": "1",
    "register-battle-index-zh-th-S5": "3",
    "offline-turns-zh-th": "4",
    "huilaishi-vocab-known-zh-th": "[\"v1\",\"v1\",\"v2\"]",
    "huilaishi-arcade-stats-zh-th": JSON.stringify({ match: { plays: 2 }, tone: { plays: 3 } }),
    "other-project-session": "private-other-app-value",
    "huilaishi-microphone-recording": "audio-must-not-export"
  });

  const payload = policy.buildExport(storage, { appVersion: "12.2.0-test", now: "2026-08-22T01:02:03.000Z" });
  assert.equal(payload.format, "huilaishi-local-learning-data");
  assert.equal(payload.schemaVersion, 1);
  assert.equal(payload.appVersion, "12.2.0-test");
  assert.equal(payload.exportedAt, "2026-08-22T01:02:03.000Z");
  assert.equal(payload.activeDirection, "zh-th");
  assert.equal(payload.localStorage.learningDirection, "zh-th");
  assert.equal(payload.localStorage["other-project-session"], undefined);
  assert.equal(payload.localStorage["huilaishi-microphone-recording"], undefined);
  assert.deepEqual({ ...payload.directionStats["zh-th"] }, {
    storedKeyCount: 6,
    completedRegisterRoutes: 2,
    registerBattleAttempts: 3,
    offlineDialogueTurns: 4,
    knownVocabulary: 2,
    arcadePlays: 5
  });
  assert.equal(JSON.stringify(payload).includes("audio-must-not-export"), false);
  assert.equal(JSON.stringify(payload).includes("private-other-app-value"), false);
});

test("profile markup and handler use a modal confirmation and both managed cache deletion APIs", () => {
  const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");
  assert.match(html, /id="export-learning-data"/);
  assert.match(html, /id="clear-learning-data"[^>]*aria-haspopup="dialog"/);
  assert.match(html, /id="data-clear-sheet"[^>]*role="dialog"[^>]*aria-modal="true"/);
  assert.match(html, /id="confirm-clear-learning-data"[^>]*data-speak-text="确认清除"/);
  assert.match(html, /id="cancel-clear-learning-data"[^>]*aria-label="取消并保留学习数据"/);
  assert.match(appSource, /HUILAISHI_VOICE_PACKS[\s\S]{0,500}deleteAll/);
  assert.match(appSource, /type:\s*"CLEAR_CORE_AUDIO"/);
  assert.match(css, /\.data-clear-sheet\s+\.text-btn\s*\{[^}]*color:\s*#5b6560/i,
    "the cancel action must remain visible on the white confirmation sheet");
});
