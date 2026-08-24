importScripts("./pronunciation-audio-map.js");
importScripts("./cute-audio-map.js");

const CACHE_NAME = "huilaishi-offline-v39";
const INSTALL_CACHE_NAME = `${CACHE_NAME}-installing`;
const RUNTIME_CACHE_NAME = "huilaishi-runtime-v39";
const BASE_READY_MARKER = "./__huilaishi_base_ready_v39__";
const FULL_READY_MARKER = "./__huilaishi_full_ready_v39__";
const PROGRESS_MARKER = "./__huilaishi_audio_progress_v39__";
const SHELL_PROGRESS_MARKER = "./__huilaishi_shell_progress_v39__";
const AUDIO_PAUSED_MARKER = "./__huilaishi_audio_paused_v39__";
const CORE_AUDIO_TOTAL_BYTES = 23320920;
const SUGAR_IDS = ["repeat","make-way","hurry","quiet","boundaries","leave-alone","mistake","decline","wait","repay","dont-touch","too-expensive","late","drive-slower","queue","disagree","clean-up","stop-messaging","apology","calm-down"];
const SUGAR_AUDIO = ["./assets/audio/sugarblade-mode-zh.mp3","./assets/audio/sugarblade-mode-th.mp3"]
  .concat(SUGAR_IDS.flatMap(id => [`./assets/audio/sugarblade-s1-${id}-zh.mp3`,`./assets/audio/sugarblade-s1-${id}-th.mp3`]));
const ALAI_AUDIO = ["intro", "correct", "retry", "risk", "level"]
  .flatMap(cue => [`./assets/audio/alai-${cue}-zh.mp3`, `./assets/audio/alai-${cue}-th.mp3`]);
const PRONUNCIATION_AUDIO = [...new Set(Object.values(globalThis.PRONUNCIATION_AUDIO || {}))]
  .map(source => `./${String(source).replace(/^\.\//, "")}`);
const CUTE_CONTENT_AUDIO = (globalThis.HUILAISHI_CUTE_AUDIO?.sources?.() || [])
  .map(source => `./${String(source).replace(/^\.\//, "")}`);
const CORE_AUDIO = [...new Set([...ALAI_AUDIO, ...SUGAR_AUDIO, ...PRONUNCIATION_AUDIO, ...CUTE_CONTENT_AUDIO])];

// Keep installation small and dependable. The 696-file core audio pack is
// downloaded only after the controlled page explicitly asks for it.
const APP_SHELL = [
  "./",
  "./index.html",
  "./pwa-bootstrap.js",
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
  "./vocab-review-candidates.js",
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
  "./PRIVACY.md",
  "./SAFETY.md",
  "./VOICE_ASSET_PROVENANCE.md",
  "./TERMS.md",
  "./voice-packs/manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png"
];
const BASE_REQUIRED = ["./", "./index.html", "./pwa-bootstrap.js", "./styles.css", "./offline-data.js", "./app.js"];
const CORE_AUDIO_URLS = new Set(CORE_AUDIO.map(source => new URL(source, self.registration.scope).href));
const APP_SHELL_URLS = new Set(APP_SHELL.map(source => new URL(source, self.registration.scope).href));
let coreAudioJob = null;
let coreAudioClearJob = null;
let coreAudioMarkerJob = Promise.resolve();
let coreAudioAbortController = null;
let shellCacheJob = null;
let coreAudioGeneration = 0;
let coreAudioPaused = false;

function scopedUrl(path) {
  return new URL(path, self.registration.scope).href;
}

function markerResponse(payload) {
  return new Response(JSON.stringify({ version: CACHE_NAME, updatedAt: Date.now(), ...payload }), {
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
  });
}

async function readMarker(cache, marker) {
  const response = await cache.match(scopedUrl(marker));
  if (!response) return null;
  try { return await response.json(); } catch (_) { return null; }
}

async function writeMarker(cache, marker, payload) {
  await cache.put(scopedUrl(marker), markerResponse(payload));
}

async function broadcast(message) {
  const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  clients.forEach(client => client.postMessage(message));
}

async function cacheShellResource(cache, path, { reuse = true } = {}) {
  const request = new Request(scopedUrl(path), { cache: "reload", credentials: "same-origin" });
  if (reuse && await cache.match(request)) return;
  const response = await fetch(request);
  if (!response.ok) throw new Error(`${response.status} ${path}`);
  await cache.put(request, response.clone());
}

async function cacheReadiness(cacheName) {
  if (!/^huilaishi-offline-v\d+$/.test(cacheName)) return null;
  const cache = await caches.open(cacheName);
  const requests = await cache.keys();
  const markerRequest = requests.find(request => /\/__huilaishi_base_ready_v\d+__$/.test(new URL(request.url).pathname));
  if (!markerRequest) return null;
  try {
    const payload = await (await cache.match(markerRequest)).json();
    if (payload?.phase !== "base-ready") return null;
    return { cacheName, updatedAt: Number(payload.updatedAt) || 0 };
  } catch (_) {
    return null;
  }
}

async function readyLegacyShells() {
  const names = (await caches.keys())
    .filter(name => name !== CACHE_NAME && /^huilaishi-offline-v\d+$/.test(name));
  const readiness = (await Promise.all(names.map(cacheReadiness))).filter(Boolean);
  return readiness.sort((left, right) => right.updatedAt - left.updatedAt);
}

async function matchReadyLegacyShell(request) {
  for (const { cacheName } of await readyLegacyShells()) {
    const response = await matchInCache(await caches.open(cacheName), request);
    if (response) return response;
  }
  return null;
}

async function precacheShellAtomically() {
  // The active worker never reads this staging cache. A failed fetch rejects
  // installation, so the previously active worker and its verified cache stay
  // in control.
  await caches.delete(INSTALL_CACHE_NAME);
  const staging = await caches.open(INSTALL_CACHE_NAME);
  let completed = 0;
  let failed = 0;
  try {
    for (let index = 0; index < APP_SHELL.length; index += 8) {
      const results = await Promise.allSettled(APP_SHELL.slice(index, index + 8)
        .map(path => cacheShellResource(staging, path, { reuse: false })));
      completed += results.filter(result => result.status === "fulfilled").length;
      failed += results.filter(result => result.status === "rejected").length;
      await writeMarker(staging, SHELL_PROGRESS_MARKER, {
        phase: "preparing",
        shellCompleted: completed,
        shellTotal: APP_SHELL.length,
        shellFailed: failed
      });
      await broadcast({
        type: "OFFLINE_PROGRESS",
        version: CACHE_NAME,
        phase: "shell",
        completed,
        total: APP_SHELL.length,
        failed,
        paused: false
      });
    }
    if (failed || completed !== APP_SHELL.length) throw new Error("offline_shell_fetch_failed");

    const staged = await Promise.all(APP_SHELL.map(path => staging.match(scopedUrl(path))));
    if (!staged.every(Boolean)) throw new Error("offline_shell_staging_incomplete");

    // CACHE_NAME is release-versioned. Committing only after the isolated
    // staging cache is complete makes activation the atomic hand-off point.
    await caches.delete(CACHE_NAME);
    const target = await caches.open(CACHE_NAME);
    const requests = await staging.keys();
    for (const request of requests) {
      const response = await staging.match(request);
      if (!response) throw new Error("offline_shell_commit_incomplete");
      await target.put(request, response.clone());
    }
    const committed = await Promise.all(APP_SHELL.map(path => target.match(scopedUrl(path))));
    if (!committed.every(Boolean)) throw new Error("offline_shell_commit_incomplete");
    await writeMarker(target, BASE_READY_MARKER, {
      phase: "base-ready",
      shellCompleted: APP_SHELL.length,
      shellFailed: 0
    });
    await caches.delete(INSTALL_CACHE_NAME);
    return { baseReady: true, completed, failed: 0 };
  } catch (error) {
    await caches.delete(INSTALL_CACHE_NAME);
    await caches.delete(CACHE_NAME);
    throw error;
  }
}

async function precacheShell() {
  const cache = await caches.open(CACHE_NAME);
  let completed = 0;
  let failed = 0;
  for (let index = 0; index < APP_SHELL.length; index += 8) {
    const results = await Promise.allSettled(APP_SHELL.slice(index, index + 8).map(path => cacheShellResource(cache, path)));
    completed += results.filter(result => result.status === "fulfilled").length;
    failed += results.filter(result => result.status === "rejected").length;
    await writeMarker(cache, SHELL_PROGRESS_MARKER, {
      phase: "preparing",
      shellCompleted: completed,
      shellTotal: APP_SHELL.length,
      shellFailed: failed
    });
    await broadcast({
      type: "OFFLINE_PROGRESS",
      version: CACHE_NAME,
      phase: "shell",
      completed,
      total: APP_SHELL.length,
      failed
    });
  }
  const required = await Promise.all(BASE_REQUIRED.map(path => cache.match(scopedUrl(path))));
  const baseReady = required.every(Boolean) && failed === 0 && completed === APP_SHELL.length;
  if (baseReady) await writeMarker(cache, BASE_READY_MARKER, { phase: "base-ready", shellCompleted: completed, shellFailed: failed });
  else await cache.delete(scopedUrl(BASE_READY_MARKER));
  return { baseReady, completed, failed };
}

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const result = await precacheShellAtomically();
    if (!result.baseReady) throw new Error("offline_shell_not_ready");
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const current = await caches.open(CACHE_NAME);
    if (!await readMarker(current, BASE_READY_MARKER)) {
      // Defensive guard: never claim pages if this release has no fully
      // committed shell. The browser can continue using its prior worker.
      return;
    }
    const keys = await caches.keys();
    const legacyShells = await readyLegacyShells();
    const retainedLegacyShell = legacyShells[0]?.cacheName || null;
    await Promise.all(keys.filter(key => (
      (key.startsWith("huilaishi-runtime-") && key !== RUNTIME_CACHE_NAME)
      || (key.startsWith("huilaishi-offline-") && key !== CACHE_NAME && key !== retainedLegacyShell)
      || (key.endsWith("-installing") && key !== INSTALL_CACHE_NAME)
    )).map(key => caches.delete(key)));
    await self.clients.claim();
    await broadcast(await offlineStatus());
  })());
});

async function responseByteLength(response) {
  const header = Number(response?.headers?.get("content-length"));
  if (Number.isFinite(header) && header >= 0) return header;
  try { return (await response.clone().blob()).size; } catch (_) { return 0; }
}

async function scanCoreAudio(cache) {
  let completed = 0;
  let bytesCompleted = 0;
  const missing = [];
  for (let index = 0; index < CORE_AUDIO.length; index += 24) {
    const batch = CORE_AUDIO.slice(index, index + 24);
    const responses = await Promise.all(batch.map(path => cache.match(scopedUrl(path))));
    for (let offset = 0; offset < batch.length; offset += 1) {
      const response = responses[offset];
      if (!response) missing.push(batch[offset]);
      else {
        completed += 1;
        bytesCompleted += await responseByteLength(response);
      }
    }
  }
  return { completed, bytesCompleted, missing };
}

async function persistAudioProgress(shellCache, progress) {
  await writeMarker(shellCache, PROGRESS_MARKER, {
    phase: progress.completed === CORE_AUDIO.length && progress.failed === 0 ? "full-ready" : "base-ready",
    coreCompleted: progress.completed,
    coreTotal: CORE_AUDIO.length,
    bytesCompleted: progress.bytesCompleted,
    bytesTotal: CORE_AUDIO_TOTAL_BYTES,
    failed: progress.failed
  });
}

async function setCoreAudioPaused(paused) {
  coreAudioPaused = paused;
  const generation = coreAudioGeneration;
  // Serialize marker writes and discard stale intentions. This prevents a
  // fast pause/resume tap from leaving storage in the opposite state after
  // asynchronous Cache API operations settle out of order.
  coreAudioMarkerJob = coreAudioMarkerJob.catch(() => null).then(async () => {
    if (generation !== coreAudioGeneration || paused !== coreAudioPaused) return;
    const shellCache = await caches.open(CACHE_NAME);
    if (generation !== coreAudioGeneration || paused !== coreAudioPaused) return;
    if (paused) await writeMarker(shellCache, AUDIO_PAUSED_MARKER, { phase: "audio-paused" });
    else await shellCache.delete(scopedUrl(AUDIO_PAUSED_MARKER));
  });
  return coreAudioMarkerJob;
}

async function cacheCoreAudio(generation, signal) {
  const shellCache = await caches.open(CACHE_NAME);
  const baseReady = Boolean(await readMarker(shellCache, BASE_READY_MARKER));
  if (!baseReady) {
    await precacheShell();
    if (!await readMarker(shellCache, BASE_READY_MARKER)) return offlineStatus();
  }

  const cache = await caches.open(RUNTIME_CACHE_NAME);
  const legacyCacheNames = (await caches.keys())
    .filter(name => /^huilaishi-offline-v\d+$/.test(name) && name !== CACHE_NAME);
  const legacyCaches = await Promise.all(legacyCacheNames.map(name => caches.open(name)));
  const scanned = await scanCoreAudio(cache);
  const progress = { completed: scanned.completed, bytesCompleted: scanned.bytesCompleted, failed: 0 };
  let cursor = 0;
  let lastBroadcastAt = 0;
  const cancelled = () => coreAudioPaused || generation !== coreAudioGeneration;

  const report = async (force = false) => {
    if (cancelled()) return;
    const now = Date.now();
    if (!force && progress.completed % 8 !== 0 && now - lastBroadcastAt < 500) return;
    lastBroadcastAt = now;
    await persistAudioProgress(shellCache, progress);
    await broadcast({
      type: "OFFLINE_PROGRESS",
      version: CACHE_NAME,
      phase: "audio",
      completed: progress.completed,
      total: CORE_AUDIO.length,
      bytesCompleted: progress.bytesCompleted,
      bytesTotal: CORE_AUDIO_TOTAL_BYTES,
      failed: progress.failed,
      paused: false
    });
  };

  await report(true);
  const worker = async () => {
    while (cursor < scanned.missing.length && !cancelled()) {
      const path = scanned.missing[cursor];
      cursor += 1;
      try {
        const request = new Request(scopedUrl(path), { cache: "no-cache", credentials: "same-origin" });
        let response = null;
        let legacyCache = null;
        for (const candidate of legacyCaches) {
          response = await candidate.match(request);
          if (response) { legacyCache = candidate; break; }
        }
        if (!response) response = await fetch(request, { signal });
        if (!response.ok || response.status === 206) throw new Error(`${response.status} ${path}`);
        // PAUSE/CLEAR abort network work and invalidate the generation. The
        // post-fetch check also protects responses that won the abort race, so
        // stale requests can never refill a paused or cleared cache.
        if (cancelled()) return;
        const bytes = await responseByteLength(response);
        await cache.put(request, response.clone());
        if (legacyCache) await legacyCache.delete(request);
        progress.completed += 1;
        progress.bytesCompleted += bytes;
      } catch (_) {
        progress.failed += 1;
      }
      await report(false);
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
  if (cancelled()) return offlineStatus();
  await report(true);

  if (progress.completed === CORE_AUDIO.length && progress.failed === 0) {
    await writeMarker(shellCache, FULL_READY_MARKER, {
      phase: "full-ready",
      coreCompleted: progress.completed,
      coreTotal: CORE_AUDIO.length,
      bytesCompleted: progress.bytesCompleted,
      bytesTotal: CORE_AUDIO_TOTAL_BYTES
    });
  } else {
    await shellCache.delete(scopedUrl(FULL_READY_MARKER));
  }
  const status = await offlineStatus();
  await broadcast(status);
  return status;
}

async function offlineStatus() {
  const shellCache = await caches.open(CACHE_NAME);
  const base = await readMarker(shellCache, BASE_READY_MARKER);
  const full = await readMarker(shellCache, FULL_READY_MARKER);
  const progress = await readMarker(shellCache, PROGRESS_MARKER);
  const shellProgress = await readMarker(shellCache, SHELL_PROGRESS_MARKER);
  const pausedMarker = await readMarker(shellCache, AUDIO_PAUSED_MARKER);
  return {
    type: "OFFLINE_STATUS",
    version: CACHE_NAME,
    phase: full ? "full-ready" : base ? "base-ready" : "preparing",
    baseReady: Boolean(base),
    fullReady: Boolean(full),
    shellCompleted: base?.shellCompleted ?? shellProgress?.shellCompleted ?? 0,
    shellTotal: APP_SHELL.length,
    shellFailed: base?.shellFailed ?? shellProgress?.shellFailed ?? 0,
    coreCompleted: full?.coreCompleted ?? progress?.coreCompleted ?? 0,
    coreTotal: CORE_AUDIO.length,
    bytesCompleted: full?.bytesCompleted ?? progress?.bytesCompleted ?? 0,
    bytesTotal: CORE_AUDIO_TOTAL_BYTES,
    failed: progress?.failed || 0,
    paused: coreAudioPaused || Boolean(pausedMarker)
  };
}

async function pauseCoreAudio() {
  coreAudioGeneration += 1;
  coreAudioAbortController?.abort();
  await setCoreAudioPaused(true);
  const activeJob = coreAudioJob;
  if (activeJob) await activeJob.catch(() => null);
  const status = await offlineStatus();
  await broadcast(status);
  return status;
}

async function startCoreAudio() {
  // A resume issued after CLEAR must wait for deletion to finish; otherwise
  // the clear loop could erase newly downloaded files from the newer request.
  const clearing = coreAudioClearJob;
  if (clearing) await clearing.catch(() => null);
  if (coreAudioJob && !coreAudioPaused) return coreAudioJob;
  const previous = coreAudioJob;
  if (previous) await previous.catch(() => null);
  if (coreAudioJob && !coreAudioPaused) return coreAudioJob;
  coreAudioGeneration += 1;
  const generation = coreAudioGeneration;
  const controller = new AbortController();
  coreAudioAbortController = controller;
  const job = setCoreAudioPaused(false)
    .then(() => cacheCoreAudio(generation, controller.signal))
    .finally(() => {
      if (coreAudioJob === job) {
        coreAudioJob = null;
        if (coreAudioAbortController === controller) coreAudioAbortController = null;
      }
    });
  coreAudioJob = job;
  return job;
}

async function clearCoreAudio() {
  // Invalidate first, wait for the at-most-six in-flight requests, then delete.
  // No stale worker can write after deletion because it holds the old generation.
  coreAudioGeneration += 1;
  coreAudioAbortController?.abort();
  await setCoreAudioPaused(true);
  const activeJob = coreAudioJob;
  if (activeJob) await activeJob.catch(() => null);
  const cacheNames = (await caches.keys()).filter(name => (
    name === RUNTIME_CACHE_NAME
    || (/^huilaishi-offline-v\d+$/.test(name) && name !== CACHE_NAME)
  ));
  const audioCaches = await Promise.all(cacheNames.map(name => caches.open(name)));
  for (let index = 0; index < CORE_AUDIO.length; index += 32) {
    await Promise.all(audioCaches.flatMap(cache => CORE_AUDIO.slice(index, index + 32)
      .map(path => cache.delete(scopedUrl(path)))));
  }
  const shell = await caches.open(CACHE_NAME);
  await Promise.all([
    shell.delete(scopedUrl(FULL_READY_MARKER)),
    shell.delete(scopedUrl(PROGRESS_MARKER))
  ]);
  const status = await offlineStatus();
  await broadcast(status);
  return status;
}

self.addEventListener("message", event => {
  const type = event.data?.type;
  const reply = message => {
    if (event.ports?.[0]) event.ports[0].postMessage(message);
    else event.source?.postMessage?.(message);
  };
  if (type === "GET_OFFLINE_STATUS") {
    event.waitUntil(offlineStatus().then(reply));
    return;
  }
  if (type === "PREPARE_OFFLINE_SHELL") {
    if (!shellCacheJob) shellCacheJob = precacheShell().finally(() => { shellCacheJob = null; });
    event.waitUntil(shellCacheJob.then(async () => {
      const status = await offlineStatus();
      reply(status);
      await broadcast(status);
    }));
    return;
  }
  if (type === "CACHE_CORE_AUDIO" || type === "RETRY_CORE_AUDIO") {
    event.waitUntil(startCoreAudio().then(reply));
    return;
  }
  if (type === "PAUSE_CORE_AUDIO") {
    event.waitUntil(pauseCoreAudio().then(reply));
    return;
  }
  if (type === "CLEAR_CORE_AUDIO") {
    if (!coreAudioClearJob) {
      const job = clearCoreAudio().finally(() => {
        if (coreAudioClearJob === job) coreAudioClearJob = null;
      });
      coreAudioClearJob = job;
    }
    event.waitUntil(coreAudioClearJob.then(reply));
  }
});

async function rangeResponseFor(cached, rangeHeader) {
  if (!cached || !rangeHeader || cached.status === 206) return cached;
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

async function matchInCache(cache, request) {
  return (await cache.match(request, { ignoreVary: true })) ||
    (await cache.match(request.url, { ignoreVary: true }));
}

async function matchCurrentResponse(request) {
  const runtime = await caches.open(RUNTIME_CACHE_NAME);
  const runtimeResponse = await matchInCache(runtime, request);
  if (runtimeResponse) return runtimeResponse;
  const shell = await caches.open(CACHE_NAME);
  return matchInCache(shell, request);
}

async function matchCachePrefix(prefix, request) {
  const names = (await caches.keys()).filter(name => name.startsWith(prefix));
  for (const name of names) {
    const response = await matchInCache(await caches.open(name), request);
    if (response) return response;
  }
  return null;
}

async function cachedResponseFor(request, { allowLegacyCore = false, allowVoicePacks = false, allowLegacyShell = false } = {}) {
  let cached = await matchCurrentResponse(request);
  if (!cached && allowVoicePacks) cached = await matchCachePrefix("huilaishi-voice-pack-", request);
  if (!cached && allowLegacyCore && CORE_AUDIO_URLS.has(new URL(request.url).href)) {
    cached = await matchCachePrefix("huilaishi-offline-", request);
  }
  if (!cached && allowLegacyShell && APP_SHELL_URLS.has(new URL(request.url).href)) {
    cached = await matchReadyLegacyShell(request);
  }
  return rangeResponseFor(cached, request.headers.get("range"));
}

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (/\/voice-packs\/.+\/audio\/[^/]+\.mp3$/i.test(url.pathname)) {
    event.respondWith(request.cache === "no-store"
      ? fetch(request)
      : cachedResponseFor(request, { allowVoicePacks: true }).then(cached => cached || fetch(request)));
    return;
  }

  if (/\/voice-packs\/(?:manifest|.+\/manifest)\.json$/i.test(url.pathname)) {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(RUNTIME_CACHE_NAME);
          await cache.put(request, response.clone());
        }
        return response;
      } catch (_) {
        return cachedResponseFor(request, { allowVoicePacks: true });
      }
    })());
    return;
  }

  if (CORE_AUDIO_URLS.has(url.href)) {
    event.respondWith((async () => {
      const cached = await cachedResponseFor(request, { allowLegacyCore: true });
      if (cached) return cached;
      // Range requests cannot be placed in Cache Storage. Fetch and store the
      // full file first, then produce a standards-compliant 206 response.
      const response = await fetch(request.url, { cache: "no-store", credentials: "same-origin" });
      if (!response.ok || response.status === 206) return response;
      const cache = await caches.open(RUNTIME_CACHE_NAME);
      await cache.put(new Request(request.url), response.clone());
      return rangeResponseFor(response, request.headers.get("range"));
    })());
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(RUNTIME_CACHE_NAME);
          await cache.put(request, response.clone());
        }
        return response;
      } catch (_) {
        const current = (await matchCurrentResponse(request))
          || (await matchCurrentResponse(new Request(scopedUrl("./index.html"))));
        if (current) return current;
        return (await matchReadyLegacyShell(request))
          || matchReadyLegacyShell(new Request(scopedUrl("./index.html")));
      }
    })());
    return;
  }

  // Online page assets are network-first. This prevents the active worker
  // from combining a freshly deployed HTML document with its previous cached
  // CSS/JS while the next atomic shell is still installing.
  if (APP_SHELL_URLS.has(url.href) && (request.destination === "script" || request.destination === "style")) {
    event.respondWith((async () => {
      try {
        const response = await fetch(request, { cache: "no-store" });
        if (!response.ok) throw new Error(`shell_asset_${response.status}`);
        return response;
      } catch (_) {
        return cachedResponseFor(request, { allowLegacyShell: true });
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await cachedResponseFor(request, { allowLegacyShell: true });
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok && response.status !== 206) {
      const cache = await caches.open(RUNTIME_CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  })());
});
