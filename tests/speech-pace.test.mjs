import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const source = readFileSync(new URL("../speech-engine.js", import.meta.url), "utf8");

class FakeClassList {
  add() {}
  remove() {}
  toggle() {}
}

class FakeNode {
  constructor(registry) {
    this.registry = registry;
    this.classList = new FakeClassList();
    this.dataset = {};
    this.children = new Map();
    this.textContent = "";
    this.id = "";
  }
  setAttribute() {}
  querySelector(selector) {
    if (!this.children.has(selector)) this.children.set(selector, new FakeNode(this.registry));
    return this.children.get(selector);
  }
  appendChild(node) {
    if (node.id) this.registry.set(node.id, node);
    return node;
  }
}

function createWorld({ online = true, cacheHit = false } = {}) {
  const registry = new Map();
  const audios = [];
  let deviceSpeechCalls = 0;
  class FakeAudio {
    constructor(sourceValue) {
      this.sourceValue = sourceValue;
      this.currentTime = 0;
      this.preservesPitch = false;
      this.listeners = new Map();
      audios.push(this);
    }
    setAttribute() {}
    addEventListener(type, listener) { this.listeners.set(type, listener); }
    pause() {}
    play() { return Promise.resolve(); }
  }
  const body = new FakeNode(registry);
  const document = {
    documentElement: { lang: "zh-CN" },
    body,
    activeElement: null,
    createElement() { return new FakeNode(registry); },
    querySelector(selector) { return selector.startsWith("#") ? registry.get(selector.slice(1)) || null : null; },
    addEventListener() {}
  };
  const world = {
    document,
    Audio: FakeAudio,
    SpeechSynthesisUtterance: class { constructor(text) { this.text = text; } },
    speechSynthesis: { cancel() {}, speak() { deviceSpeechCalls += 1; }, getVoices() { return []; }, addEventListener() {} },
    setTimeout,
    clearTimeout,
    addEventListener() {},
    navigator: { onLine: online },
    caches: { match() { return Promise.resolve(cacheHit ? {} : undefined); } },
    HUILAISHI_CUTE_AUDIO: {
      lookup({ track }) { return { source: `${track}.mp3`, track }; }
    }
  };
  world.window = world;
  world.globalThis = world;
  vm.runInContext(source, vm.createContext(world), { filename: "speech-engine.js" });
  return { world, audios, deviceSpeechCalls: () => deviceSpeechCalls };
}

test("ordinary prerecorded learning audio follows the selected pace without changing pitch", () => {
  const { world, audios } = createWorld();
  const speech = world.HUILAISHI_SPEECH;

  assert.equal(speech.getPace(), "clear");
  speech.speak("สวัสดีค่ะ", { lang: "th-TH", track: "standard" });
  assert.equal(audios.at(-1).playbackRate, .88);
  assert.equal(audios.at(-1).preservesPitch, true);

  assert.equal(speech.setPace("natural"), "natural");
  speech.speak("สวัสดีค่ะ", { lang: "th-TH", track: "standard" });
  assert.equal(audios.at(-1).playbackRate, .98);

  assert.equal(speech.setPace("slow"), "slow");
  speech.speak("你好", { lang: "zh-CN", track: "standard" });
  assert.equal(audios.at(-1).playbackRate, .78);
});

test("explicit training speeds and navigation timing stay independent of the profile", () => {
  const { world, audios } = createWorld();
  const speech = world.HUILAISHI_SPEECH;

  speech.setPace("slow");
  speech.speak("สวัสดีค่ะ", { lang: "th-TH", track: "standard", rate: .82 });
  assert.equal(audios.at(-1).playbackRate, .82);

  speech.speak("返回主菜单", { lang: "zh-CN", track: "navigation" });
  assert.equal(audios.at(-1).playbackRate, .97);

  assert.equal(speech.setPace("unknown"), "clear");
  assert.equal(speech.inspect().pace, "clear");
});

test("offline optional audio probes Cache Storage before falling back without a failed media request", async () => {
  const missing = createWorld({ online: false, cacheHit: false });
  const pending = missing.world.HUILAISHI_SPEECH.speak("返回主菜单", { lang: "zh-CN", track: "navigation" });
  assert.equal(pending.pending, true);
  await pending.ready;
  assert.equal(missing.audios.length, 0);
  assert.equal(missing.deviceSpeechCalls(), 1);

  const cached = createWorld({ online: false, cacheHit: true });
  const cachedPending = cached.world.HUILAISHI_SPEECH.speak("返回主菜单", { lang: "zh-CN", track: "navigation" });
  await cachedPending.ready;
  assert.equal(cached.audios.length, 1);
  assert.equal(cached.deviceSpeechCalls(), 0);
});
