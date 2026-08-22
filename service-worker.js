importScripts("./pronunciation-audio-map.js");
importScripts("./cute-audio-map.js");

const CACHE_NAME = "huilaishi-offline-v30";
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
  "./vendor/driver-1.8.0.css",
  "./product-tour.css",
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
  "./vendor/pitchy-4.1.0.iife.js",
  "./pronunciation-score.js",
  "./app.js",
  "./vocab-ui.js",
  "./vendor/driver-1.8.0.iife.js",
  "./product-tour.js",
  "./vendor/canvas-confetti-1.9.4.js",
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
    // V12 app shell includes 696 runtime audio masters: 550 core
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

async function cachedResponseFor(request) {
  const cached = (await caches.match(request, { ignoreVary: true })) ||
    (await caches.match(request.url, { ignoreVary: true }));
  const rangeHeader = request.headers.get("range");
  if (!cached || !rangeHeader || cached.status === 206) return cached;

  // Chromium requests cached MP3 files with a byte range. A plain cached 200
  // response can be rejected by the media pipeline while offline, so return a
  // standards-compliant 206 slice from the already cached full audio file.
  const match = /^bytes=(\d*)-(\d*)$/i.exec(rangeHeader.trim());
  if (!match || (!match[1] && !match[2])) return cached;
  const buffer = await cached.arrayBuffer();
  const size = buffer.byteLength;
  let start;
  let end;
  if (!match[1]) {
    const suffixLength = Number(match[2]);
    if (!Number.isFinite(suffixLength) || suffixLength <= 0) return cached;
    start = Math.max(0, size - suffixLength);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  }
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || start >= size || end < start) {
    return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
  }
  const headers = new Headers(cached.headers);
  headers.delete("Content-Encoding");
  headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Length", String(end - start + 1));
  headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
  return new Response(buffer.slice(start, end + 1), { status: 206, statusText: "Partial Content", headers });
}

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (/\/voice-packs\/.+\/audio\/[^/]+\.mp3$/i.test(url.pathname)) {
    event.respondWith(request.cache === "no-store"
      ? fetch(request)
      : cachedResponseFor(request).then(cached => cached || fetch(request)));
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
    const cached = await cachedResponseFor(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  })());
});
