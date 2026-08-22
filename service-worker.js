importScripts("./pronunciation-audio-map.js");
importScripts("./cute-audio-map.js");

const CACHE_NAME = "huilaishi-offline-v27";
const SUGAR_IDS = ["repeat","make-way","hurry","quiet","boundaries","leave-alone","mistake","decline","wait","repay","dont-touch","too-expensive","late","drive-slower","queue","disagree","clean-up","stop-messaging","apology","calm-down"];
const SUGAR_AUDIO = ["./assets/audio/sugarblade-mode-zh.mp3","./assets/audio/sugarblade-mode-th.mp3"]
  .concat(SUGAR_IDS.flatMap(id => [`./assets/audio/sugarblade-s1-${id}-zh.mp3`,`./assets/audio/sugarblade-s1-${id}-th.mp3`]));
const PRONUNCIATION_AUDIO = [...new Set(Object.values(globalThis.PRONUNCIATION_AUDIO || {}))]
  .map(source => `./${String(source).replace(/^\.\//, "")}`);
const CUTE_CONTENT_AUDIO = (globalThis.HUILAISHI_CUTE_AUDIO?.sources?.() || [])
  .map(source => `./${String(source).replace(/^\.\//, "")}`);
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./vocab.css",
  "./arcade.css",
  "./speech-engine.css",
  "./pronunciation-course.css",
  "./pronunciation-score.css",
  "./voice-pack-ui.css",
  "./partner-live.css",
  "./offline-data.js",
  "./vocab-l1-l2.js",
  "./vocab-l3-l4.js",
  "./vocab-l5-l6.js",
  "./vocab-expansion-l1-l3.js",
  "./vocab-expansion-l4-l6.js",
  "./register-pack.js",
  "./thai-phonetic.js",
  "./pronunciation-audio-map.js",
  "./cute-audio-map.js",
  "./voice-pack-manager.js",
  "./voice-pack-ui.js",
  "./partner-config.js",
  "./partner-live.js",
  "./partner/manual-peer.js",
  "./speech-engine.js",
  "./pronunciation-course.js",
  "./pronunciation-score.js",
  "./app.js",
  "./vocab-ui.js",
  "./arcade.js",
  "./manifest.webmanifest",
  "./voice-packs/manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./assets/audio/alai-intro-zh.mp3",
  "./assets/audio/alai-intro-th.mp3",
  "./assets/audio/alai-correct-zh.mp3",
  "./assets/audio/alai-correct-th.mp3",
  "./assets/audio/alai-retry-zh.mp3",
  "./assets/audio/alai-retry-th.mp3",
  "./assets/audio/alai-risk-zh.mp3",
  "./assets/audio/alai-risk-th.mp3",
  "./assets/audio/alai-level-zh.mp3",
  "./assets/audio/alai-level-th.mp3",
  ...SUGAR_AUDIO,
  ...PRONUNCIATION_AUDIO,
  ...CUTE_CONTENT_AUDIO
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // V11 app shell includes 696 runtime audio masters: 550 core
    // (365 STANDARD + 60 CHARACTER + 125 NAVIGATION), 94 pronunciation,
    // 42 SugarBlade, and 10 Alai cues. Optional 11,395-clip vocabulary packs
    // stay outside the app shell; small batches protect mobile installation.
    for (let index = 0; index < APP_SHELL.length; index += 36) {
      await cache.addAll(APP_SHELL.slice(index, index + 36));
    }
  })());
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key.startsWith("huilaishi-offline-") && key !== CACHE_NAME)
        .map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (/\/voice-packs\/.+\/audio\/[^/]+\.mp3$/i.test(url.pathname)) {
    event.respondWith(request.cache === "no-store"
      ? fetch(request)
      : caches.match(request).then(cached => cached || fetch(request)));
    return;
  }

  if (/\/voice-packs\/(?:manifest|.+\/manifest)\.json$/i.test(url.pathname)) {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }
        return response;
      } catch (_) {
        return caches.match(request);
      }
    })());
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }
        return response;
      } catch (_) {
        return (await caches.match(request)) || caches.match("./index.html");
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  })());
});
