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
    this.attributes = new Map();
    this.children = new Map();
    this.textContent = "";
    this.id = "";
  }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  querySelector(selector) {
    if (!this.children.has(selector)) this.children.set(selector, new FakeNode(this.registry));
    return this.children.get(selector);
  }
  appendChild(node) {
    if (node.id) this.registry.set(node.id, node);
    return node;
  }
}

function createWorld() {
  const registry = new Map();
  const body = new FakeNode(registry);
  let deviceSpeechCalls = 0;
  class RejectingAudio {
    constructor() { this.listeners = new Map(); this.currentTime = 0; }
    setAttribute() {}
    addEventListener(type, listener) { this.listeners.set(type, listener); }
    pause() {}
    play() { return Promise.reject(new Error("blocked-media")); }
  }
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
    Audio: RejectingAudio,
    SpeechSynthesisUtterance: class { constructor(text) { this.text = text; } },
    speechSynthesis: {
      cancel() {},
      speak() { deviceSpeechCalls += 1; },
      getVoices() { return []; },
      addEventListener() {}
    },
    setTimeout,
    clearTimeout,
    addEventListener() {},
    navigator: {}
  };
  world.window = world;
  world.globalThis = world;
  vm.runInContext(source, vm.createContext(world), { filename: "speech-engine.js" });
  return { world, registry, deviceSpeechCalls: () => deviceSpeechCalls };
}

test("missing or rejected character media never invokes device speech synthesis", async () => {
  const { world, registry, deviceSpeechCalls } = createWorld();

  const missing = world.HUILAISHI_SPEECH.speak("มึง", { lang: "th-TH", track: "character" });
  assert.equal(missing, false);
  assert.equal(deviceSpeechCalls(), 0);

  world.HUILAISHI_CUTE_AUDIO = {
    lookup() { return { source: "fixed-character.mp3", track: "character" }; }
  };
  const rejected = world.HUILAISHI_SPEECH.speak("มึง", { lang: "th-TH", track: "character" });
  assert.equal(rejected.source, "fixed-character.mp3");
  await Promise.resolve();
  await Promise.resolve();

  assert.equal(deviceSpeechCalls(), 0);
  assert.match(registry.get("speech-status").querySelector("small").textContent, /未改用设备机器声/u);
});
