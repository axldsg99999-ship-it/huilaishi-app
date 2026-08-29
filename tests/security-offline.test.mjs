import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

import { ManualPeerSession } from "../partner/manual-peer.js";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(TEST_DIR, "..");
const SCOPE = "https://example.test/huilaishi/";

class FakePeerConnection extends EventTarget {
  constructor() {
    super();
    this.connectionState = "new";
    this.iceGatheringState = "complete";
  }

  close() {
    this.connectionState = "closed";
  }
}

class FakeDataChannel extends EventTarget {
  constructor() {
    super();
    this.readyState = "open";
    this.bufferedAmount = 0;
    this.bufferedAmountLowThreshold = 64 * 1024;
    this.sent = [];
  }

  send(value) {
    if (this.readyState !== "open") throw new Error("channel_closed");
    this.sent.push(value);
  }

  close() {
    if (this.readyState === "closed") return;
    this.readyState = "closed";
    this.dispatchEvent(new Event("close"));
  }
}

globalThis.RTCPeerConnection = FakePeerConnection;

function connectedSession(options = {}) {
  const session = new ManualPeerSession(options);
  session.state = "connected";
  session.channel = new FakeDataChannel();
  return session;
}

async function gzipInvitePayload(payload) {
  const source = new TextEncoder().encode(JSON.stringify(payload));
  const compressed = await new Response(
    new Blob([source]).stream().pipeThrough(new CompressionStream("gzip")),
  ).arrayBuffer();
  return `HZ1G.${Buffer.from(compressed).toString("base64url")}`;
}

test("compressed invitation is rejected before a high-ratio payload is materialized", async () => {
  const code = await gzipInvitePayload({
    v: 1,
    kind: "offer",
    expiresAt: Date.now() + 60000,
    description: { type: "offer", sdp: "A".repeat(400000) },
  });
  assert.ok(code.length < 100000, "the compressed attack must pass the input-size gate");
  await assert.rejects(
    ManualPeerSession.acceptOffer(code),
    /invite_(?:payload_too_large|expansion_limit_exceeded)/u,
  );
});

test("manual peer enforces the combined message and voice budgets", async () => {
  const messageSession = connectedSession({ maxSessionMessages: 2 });
  messageSession.sendText("one");
  messageSession.sendText("two");
  assert.throws(() => messageSession.sendText("three"), /session_message_limit_exceeded/u);

  const voiceSession = connectedSession({
    chunkBytes: 1024,
    maxVoiceBytes: 1024,
    maxSessionMessages: 10,
    maxSessionVoiceBytes: 2048,
  });
  const voice = new Blob([new Uint8Array(1024)], { type: "audio/webm" });
  await voiceSession.sendVoice(voice, { durationMs: 1000 });
  await voiceSession.sendVoice(voice, { durationMs: 1000 });
  await assert.rejects(
    voiceSession.sendVoice(voice, { durationMs: 1000 }),
    /session_voice_limit_exceeded/u,
  );
});

test("manual peer closes a session when inbound envelope rate is exceeded", async () => {
  const session = connectedSession({ maxEnvelopesPerWindow: 2, rateWindowMs: 60000 });
  const errors = [];
  session.addEventListener("protocol-error", event => errors.push(event.detail.code));
  const ping = JSON.stringify({ v: 1, type: "ping", at: Date.now() });
  await session.handleChannelMessage(ping);
  await session.handleChannelMessage(ping);
  await session.handleChannelMessage(ping);
  assert.equal(session.state, "closed");
  assert.equal(errors.at(-1), "peer_rate_limit_exceeded");
});

class MemoryCache {
  constructor(scope) {
    this.scope = scope;
    this.entries = new Map();
  }

  key(input) {
    return input instanceof Request ? input.url : new URL(String(input), this.scope).href;
  }

  async match(input) {
    return this.entries.get(this.key(input))?.clone();
  }

  async put(input, response) {
    this.entries.set(this.key(input), response.clone());
  }

  async delete(input) {
    return this.entries.delete(this.key(input));
  }

  async keys() {
    return [...this.entries.keys()].map(url => new Request(url));
  }
}

class MemoryCacheStorage {
  constructor(scope) {
    this.scope = scope;
    this.caches = new Map();
  }

  async open(name) {
    if (!this.caches.has(name)) this.caches.set(name, new MemoryCache(this.scope));
    return this.caches.get(name);
  }

  async keys() {
    return [...this.caches.keys()];
  }

  async delete(name) {
    return this.caches.delete(name);
  }
}

function serviceWorkerHarness({ failingPath = "" } = {}) {
  const source = fs.readFileSync(path.join(PROJECT_ROOT, "service-worker.js"), "utf8");
  const handlers = new Map();
  const cacheStorage = new MemoryCacheStorage(SCOPE);
  const state = { skipped: false, claimed: false };
  const worker = {
    registration: { scope: SCOPE },
    location: new URL(SCOPE),
    clients: {
      async matchAll() { return []; },
      async claim() { state.claimed = true; },
    },
    addEventListener(type, handler) { handlers.set(type, handler); },
    async skipWaiting() { state.skipped = true; },
  };
  const fetchAsset = async request => {
    const url = request instanceof Request ? request.url : String(request);
    if (failingPath && new URL(url).pathname.endsWith(failingPath)) {
      return new Response("temporary failure", { status: 503 });
    }
    return new Response(`asset:${url}`, {
      status: 200,
      headers: { "Content-Type": "application/octet-stream", "Content-Length": "12" },
    });
  };
  const context = vm.createContext({
    self: worker,
    caches: cacheStorage,
    fetch: fetchAsset,
    importScripts() {},
    PRONUNCIATION_AUDIO: {},
    HUILAISHI_CUTE_AUDIO: { sources: () => [] },
    Request,
    Response,
    Headers,
    URL,
    Blob,
    AbortController,
    TextEncoder,
    TextDecoder,
    Set,
    Map,
    Promise,
    Date,
    console,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
  });
  vm.runInContext(source, context, { filename: "service-worker.js" });
  return { cacheStorage, handlers, state };
}

function eventPromise(handler, event = {}) {
  let pending = null;
  handler({
    ...event,
    waitUntil(value) { pending = Promise.resolve(value); },
  });
  assert.ok(pending, "handler must extend event lifetime");
  return pending;
}

async function seedReadyLegacyShell(cacheStorage) {
  const legacy = await cacheStorage.open("huilaishi-offline-v31");
  await legacy.put(`${SCOPE}__huilaishi_base_ready_v31__`, new Response(JSON.stringify({
    phase: "base-ready",
    updatedAt: 1,
  }), { headers: { "Content-Type": "application/json" } }));
  await legacy.put(`${SCOPE}index.html`, new Response("verified legacy shell"));
  await legacy.put(`${SCOPE}app.js`, new Response("verified legacy app"));
  return legacy;
}

test("failed shell staging rejects install and preserves the verified legacy fallback", async () => {
  const harness = serviceWorkerHarness({ failingPath: "/styles.css" });
  await seedReadyLegacyShell(harness.cacheStorage);
  await assert.rejects(
    eventPromise(harness.handlers.get("install")),
    /offline_shell_fetch_failed/u,
  );
  assert.equal(harness.state.skipped, false);
  assert.equal((await harness.cacheStorage.keys()).includes("huilaishi-offline-v31"), true);
  assert.equal((await harness.cacheStorage.keys()).includes("huilaishi-offline-v71"), false);
  assert.equal((await harness.cacheStorage.keys()).includes("huilaishi-offline-v71-installing"), false);

  let fallbackPromise;
  harness.handlers.get("fetch")({
    request: new Request(`${SCOPE}app.js`),
    respondWith(value) { fallbackPromise = Promise.resolve(value); },
  });
  assert.equal(await (await fallbackPromise).text(), "verified legacy app");
});

test("successful shell staging commits readiness before taking control", async () => {
  const harness = serviceWorkerHarness();
  await eventPromise(harness.handlers.get("install"));
  const current = await harness.cacheStorage.open("huilaishi-offline-v71");
  const marker = await current.match(`${SCOPE}__huilaishi_base_ready_v71__`);
  assert.equal((await marker.json()).phase, "base-ready");
  assert.equal(harness.state.skipped, true);
  assert.equal((await harness.cacheStorage.keys()).includes("huilaishi-offline-v71-installing"), false);
});

test("CLEAR_CORE_AUDIO pauses the job and removes current and legacy audio copies", async () => {
  const harness = serviceWorkerHarness();
  const current = await harness.cacheStorage.open("huilaishi-offline-v71");
  await current.put(`${SCOPE}__huilaishi_base_ready_v71__`, new Response(JSON.stringify({ phase: "base-ready" })));
  const legacy = await seedReadyLegacyShell(harness.cacheStorage);
  const runtime = await harness.cacheStorage.open("huilaishi-runtime-v71");
  const audioUrl = `${SCOPE}assets/audio/alai-intro-zh.mp3`;
  await runtime.put(audioUrl, new Response("current audio"));
  await legacy.put(audioUrl, new Response("legacy audio"));
  let reply = null;
  await eventPromise(harness.handlers.get("message"), {
    data: { type: "CLEAR_CORE_AUDIO" },
    ports: [{ postMessage(value) { reply = value; } }],
  });
  assert.equal(await runtime.match(audioUrl), undefined);
  assert.equal(await legacy.match(audioUrl), undefined);
  assert.equal(reply.type, "OFFLINE_STATUS");
  assert.equal(reply.paused, true);
  assert.equal(reply.coreCompleted, 0);
});

test("a resume requested during CLEAR waits for deletion and wins without stale cache writes", async () => {
  const harness = serviceWorkerHarness();
  const current = await harness.cacheStorage.open("huilaishi-offline-v71");
  await current.put(`${SCOPE}__huilaishi_base_ready_v71__`, new Response(JSON.stringify({ phase: "base-ready" })));
  const dispatch = type => {
    let reply = null;
    const pending = eventPromise(harness.handlers.get("message"), {
      data: { type },
      ports: [{ postMessage(value) { reply = value; } }],
    });
    return { pending, reply: () => reply };
  };
  const initial = dispatch("CACHE_CORE_AUDIO");
  const clear = dispatch("CLEAR_CORE_AUDIO");
  const resume = dispatch("CACHE_CORE_AUDIO");
  await Promise.all([initial.pending, clear.pending, resume.pending]);
  assert.equal(resume.reply().paused, false);
  assert.equal(resume.reply().fullReady, true);
  assert.equal(resume.reply().coreCompleted, resume.reply().coreTotal);
  const runtime = await harness.cacheStorage.open("huilaishi-runtime-v71");
  assert.ok(await runtime.match(`${SCOPE}assets/audio/alai-intro-zh.mp3`));
});

test("standalone builder carries all four complete license grants", () => {
  const build = fs.readFileSync(path.join(PROJECT_ROOT, "build-offline.ps1"), "utf8");
  for (const filename of [
    "driver.js-1.8.0-MIT.txt",
    "canvas-confetti-1.9.4-ISC.txt",
    "pitchy-4.1.0-MIT.txt",
    "fft.js-4.0.4-MIT.txt",
  ]) {
    assert.match(build, new RegExp(filename.replaceAll(".", "\\."), "u"));
    assert.ok(fs.readFileSync(path.join(PROJECT_ROOT, "vendor", "licenses", filename), "utf8").length > 500);
  }
  assert.match(build, /huilaishi-third-party-licenses/u);
  assert.match(build, /WebUtility\]::HtmlEncode/u);
});

test("standalone builder embeds the starter game voices instead of leaving a script or audio dependency", () => {
  const build = fs.readFileSync(path.join(PROJECT_ROOT, "build-offline.ps1"), "utf8");
  assert.match(build, /\$StarterVocabAudioMapSource\s*=\s*Get-Content/u);
  assert.match(build, /\$StarterVocabPaths\s*=\s*\[regex\]::Matches/u);
  assert.match(build, /data:audio\/mpeg;base64/u);
  assert.match(build, /<script src="starter-vocab-audio-map\.js"><\/script>/u);
  assert.match(build, /\$StarterVocabAudioDataSource/u);
});

test("browser and backend manual-peer transports remain byte-identical", () => {
  const browser = fs.readFileSync(path.join(PROJECT_ROOT, "partner", "manual-peer.js"));
  const backend = fs.readFileSync(path.join(PROJECT_ROOT, "backend", "p2p", "manual-peer.js"));
  assert.deepEqual(backend, browser);
});

test("partner UI bounds retained messages and revokes evicted voice URLs", () => {
  const ui = fs.readFileSync(path.join(PROJECT_ROOT, "partner-live.js"), "utf8");
  assert.match(ui, /const MAX_SESSION_MESSAGES = 200/u);
  assert.match(ui, /releaseVoiceUrl\(state\.messages\.shift\(\)\?\.url\)/u);
  assert.match(ui, /URL\.revokeObjectURL\(url\)/u);
  assert.match(ui, /function messageMarkup\(message, messageIndex\)/u);
});
