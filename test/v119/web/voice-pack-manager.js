(function (root) {
  "use strict";

  const API_VERSION = 1;
  const DEFAULT_CATALOG = "voice-packs/manifest.json";
  const CACHE_PREFIX = "huilaishi-voice-pack-";
  const ZERO_WIDTH = /[\u200B-\u200D\uFEFF]/g;
  const memorySources = new Map();
  const memoryIdentitySources = new Map();
  const packManifests = new Map();
  const activeInstalls = new Map();
  let configuredCatalog = null;
  let catalogPromise = null;

  class VoicePackError extends Error {
    constructor(code, message, details) {
      super(message);
      this.name = "VoicePackError";
      this.code = code;
      this.details = details || null;
    }
  }

  function normalizeLanguage(value) {
    const language = String(value || "").toLowerCase();
    if (language.startsWith("zh")) return "zh";
    if (language.startsWith("th")) return "th";
    return "";
  }

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFKC")
      .replace(ZERO_WIDTH, "")
      .replace(/[\p{P}\p{S}]+/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function identity(text, language) {
    const family = normalizeLanguage(language);
    const normalized = normalizeText(text);
    return family && normalized ? `${family}\u001f${normalized}` : "";
  }

  function isFileProtocol() {
    // The downloadable single-file build can also be previewed over HTTP.
    // It intentionally excludes the large optional packs, so never probe a
    // relative catalogue just because that standalone file has an HTTP URL.
    return Boolean(root.SINGLE_FILE_BUILD) || root.location?.protocol === "file:";
  }

  function supportsDownload() {
    return !root.HUILAISHI_NATIVE_IOS && !isFileProtocol() && typeof root.fetch === "function" && "caches" in root && Boolean(root.crypto?.subtle);
  }

  function absoluteUrl(value, base) {
    return new URL(value, base || root.document?.baseURI || root.location?.href).href;
  }

  function catalogUrl() {
    return absoluteUrl(DEFAULT_CATALOG);
  }

  function manifestUrl(summary) {
    const base = configuredCatalog?.__url || catalogUrl();
    return absoluteUrl(summary.manifest, base);
  }

  function assetUrl(pack, entry) {
    return absoluteUrl(entry.file, pack.__url || manifestUrl({ manifest: `${pack.direction}/l${pack.level}/manifest.json` }));
  }

  function assertCatalog(value) {
    if (!value || value.schemaVersion !== 1 || !Array.isArray(value.packs)) {
      throw new VoicePackError("INVALID_CATALOG", "声音包目录格式无效。", { schemaVersion: value?.schemaVersion });
    }
    const ids = new Set();
    for (const pack of value.packs) {
      if (!pack?.id || ids.has(pack.id) || !pack.manifest) {
        throw new VoicePackError("INVALID_CATALOG", "声音包目录含缺失或重复的包。", { packId: pack?.id });
      }
      ids.add(pack.id);
    }
    return value;
  }

  function assertPack(value, expectedId) {
    if (!value || value.schemaVersion !== 1 || value.packId !== expectedId || !Array.isArray(value.entries)) {
      throw new VoicePackError("INVALID_PACK_MANIFEST", "声音包清单格式或身份不正确。", { expectedId, actualId: value?.packId });
    }
    return value;
  }

  async function fetchJson(url, signal) {
    const response = await fetch(url, { cache: "no-store", credentials: "same-origin", signal });
    if (!response.ok) throw new VoicePackError("DOWNLOAD_FAILED", `无法下载声音包清单（HTTP ${response.status}）。`, { url });
    return response.json();
  }

  function configure(catalog, options = {}) {
    dispose();
    configuredCatalog = assertCatalog(catalog);
    Object.defineProperty(configuredCatalog, "__url", {
      configurable: true,
      enumerable: false,
      value: options.catalogUrl ? absoluteUrl(options.catalogUrl) : catalogUrl()
    });
    catalogPromise = Promise.resolve(configuredCatalog);
    packManifests.clear();
    const embedded = options.packManifests || {};
    for (const [packId, manifest] of Object.entries(embedded)) {
      const checked = assertPack(manifest, packId);
      Object.defineProperty(checked, "__url", {
        configurable: true,
        enumerable: false,
        value: options.packManifestUrls?.[packId] ? absoluteUrl(options.packManifestUrls[packId]) : manifestUrl(configuredCatalog.packs.find(item => item.id === packId))
      });
      packManifests.set(packId, Promise.resolve(checked));
    }
    return api;
  }

  async function loadCatalog(options = {}) {
    if (configuredCatalog && !options.force) return configuredCatalog;
    if (isFileProtocol() && !root.HUILAISHI_VOICE_PACK_MANIFEST) {
      throw new VoicePackError(
        "FILE_PROTOCOL_MANIFEST_REQUIRED",
        "本地 HTML 不能下载扩展声音包；请使用在线安装版，或在单文件版中嵌入声音包清单。"
      );
    }
    if (root.HUILAISHI_VOICE_PACK_MANIFEST && !options.force) {
      return configure(root.HUILAISHI_VOICE_PACK_MANIFEST, {
        catalogUrl: root.HUILAISHI_VOICE_PACK_MANIFEST_URL || catalogUrl(),
        packManifests: root.HUILAISHI_VOICE_PACK_EMBEDDED || {}
      }).catalog();
    }
    if (!catalogPromise || options.force) {
      if (options.force) {
        dispose();
        packManifests.clear();
      }
      const url = catalogUrl();
      catalogPromise = fetchJson(url, options.signal)
        .then(value => {
          configuredCatalog = assertCatalog(value);
          Object.defineProperty(configuredCatalog, "__url", { configurable: true, enumerable: false, value: url });
          return configuredCatalog;
        })
        .catch(error => {
          catalogPromise = null;
          throw error;
        });
    }
    return catalogPromise;
  }

  async function loadPackManifest(packId, options = {}) {
    const catalog = await loadCatalog(options);
    const summary = catalog.packs.find(pack => pack.id === packId);
    if (!summary) throw new VoicePackError("PACK_NOT_FOUND", `不存在声音包 ${packId}。`, { packId });
    if (!packManifests.has(packId) || options.force) {
      if (isFileProtocol()) {
        throw new VoicePackError(
          "FILE_PROTOCOL_PACK_REQUIRED",
          `本地版没有嵌入 ${packId} 清单；请改用在线安装版下载，或把该包随文件一起发布。`,
          { packId }
        );
      }
      const url = manifestUrl(summary);
      const loading = fetchJson(url, options.signal)
        .then(value => {
          const manifest = assertPack(value, packId);
          Object.defineProperty(manifest, "__url", { configurable: true, enumerable: false, value: url });
          return manifest;
        })
        .catch(error => {
          packManifests.delete(packId);
          throw error;
        });
      packManifests.set(packId, loading);
    }
    return packManifests.get(packId);
  }

  function packIdFor(options = {}) {
    if (options.packId) return String(options.packId);
    const level = Number(options.level);
    if (!Number.isInteger(level) || level < 1 || level > 6) return "";
    let direction = String(options.direction || "");
    if (!direction) {
      const language = normalizeLanguage(options.lang || options.language);
      direction = language === "th" ? "zh-th" : language === "zh" ? "th-zh" : "";
    }
    return /^(zh-th|th-zh)$/.test(direction) ? `${direction}-l${level}` : "";
  }

  function findEntryInPack(pack, textOrOptions, language) {
    const options = textOrOptions && typeof textOrOptions === "object" ? textOrOptions : { text: textOrOptions, lang: language };
    if (options.key) {
      const aliased = pack.entries.find(entry => entry.aliases?.includes(options.key)) || null;
      if (!aliased) return null;
      // Card ids are stable across catalogue revisions, but the displayed word
      // may change. Never let an old alias play audio for different text.
      const requested = identity(options.text, options.lang || options.language || language);
      return !requested || identity(aliased.text, aliased.language) === requested ? aliased : null;
    }
    const wanted = identity(options.text, options.lang || options.language || language);
    if (!wanted) return null;
    return pack.entries.find(entry => identity(entry.text, entry.language) === wanted) || null;
  }

  async function lookup(textOrOptions, language, options = {}) {
    const input = textOrOptions && typeof textOrOptions === "object" ? { ...textOrOptions } : { text: textOrOptions, lang: language };
    const merged = { ...options, ...input };
    const explicitPack = packIdFor(merged);
    if (explicitPack) {
      const pack = await loadPackManifest(explicitPack, merged);
      const entry = findEntryInPack(pack, merged, language);
      return entry ? { pack, entry, packId: explicitPack, url: assetUrl(pack, entry) } : null;
    }

    const family = normalizeLanguage(merged.lang || merged.language || language);
    if (!family) return null;
    const direction = family === "th" ? "zh-th" : "th-zh";
    const catalog = await loadCatalog(merged);
    const summaries = catalog.packs.filter(pack => pack.direction === direction);
    const manifests = await Promise.all(summaries.map(pack => loadPackManifest(pack.id, merged)));
    for (const pack of manifests) {
      const entry = findEntryInPack(pack, merged, language);
      if (entry) return { pack, entry, packId: pack.packId, url: assetUrl(pack, entry) };
    }
    return null;
  }

  function cacheName(pack) {
    const revision = pack.assetHash || pack.contentHash;
    return `${CACHE_PREFIX}${String(pack.version).replace(/[^a-z0-9._-]+/gi, "-")}-${pack.packId}-${revision.slice(0, 12)}`;
  }

  function readyMarkerRequest(pack) {
    const url = new URL(pack.__url || catalogUrl());
    url.searchParams.set("__huilaishi_voice_pack_ready", String(pack.assetHash || pack.contentHash || ""));
    return new Request(url.href, { credentials: "same-origin" });
  }

  async function readyMarkerIsValid(cache, pack) {
    const response = await cache.match(readyMarkerRequest(pack));
    return Boolean(response
      && response.headers.get("X-Huilaishi-Asset-Hash") === pack.assetHash
      && Number(response.headers.get("X-Huilaishi-Clip-Count")) === pack.clipCount);
  }

  async function digestHex(buffer) {
    if (!root.crypto?.subtle) throw new VoicePackError("INTEGRITY_UNAVAILABLE", "此浏览器不能校验声音包完整性，已停止安装。免责占位音不会被写入。");
    const digest = await root.crypto.subtle.digest("SHA-256", buffer);
    return [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, "0")).join("");
  }

  function emit(type, detail) {
    if (typeof root.dispatchEvent === "function" && typeof root.CustomEvent === "function") {
      root.dispatchEvent(new root.CustomEvent(`huilaishi:voicepack:${type}`, { detail }));
    }
  }

  async function storageEstimate(packId) {
    const catalog = await loadCatalog();
    const summary = packId ? catalog.packs.find(pack => pack.id === packId) : null;
    const estimate = await root.navigator?.storage?.estimate?.().catch(() => null);
    const requiredBytes = Number(summary?.bytes || summary?.estimatedBytes || 0);
    const quota = Number(estimate?.quota || 0);
    const usage = Number(estimate?.usage || 0);
    return {
      packId: packId || null,
      requiredBytes,
      estimatedMiB: Number((requiredBytes / 1048576).toFixed(1)),
      quota: quota || null,
      usage: usage || null,
      availableBytes: quota ? Math.max(0, quota - usage) : null,
      fits: quota ? requiredBytes <= Math.max(0, quota - usage) : null
    };
  }

  async function cachedResponseIsValid(cache, request, entry) {
    const response = await cache.match(request);
    if (!response) return false;
    const taggedHash = response.headers.get("X-Huilaishi-SHA256");
    const taggedBytes = Number(response.headers.get("X-Huilaishi-Bytes"));
    return taggedHash === entry.sha256 && taggedBytes === entry.bytes;
  }

  async function removeObsoleteCaches(packId, keepName = "") {
    if (!("caches" in root)) return 0;
    const marker = `-${packId}-`;
    const names = await caches.keys();
    const obsolete = names.filter(name => name.startsWith(CACHE_PREFIX) && name.includes(marker) && name !== keepName);
    const removed = await Promise.all(obsolete.map(name => caches.delete(name)));
    return removed.filter(Boolean).length;
  }

  async function performInstall(packId, options = {}) {
    if (!supportsDownload()) {
      throw new VoicePackError(
        isFileProtocol() ? "FILE_PROTOCOL_DOWNLOAD_UNAVAILABLE" : "PACK_STORAGE_UNAVAILABLE",
        isFileProtocol()
          ? "本地 HTML 无法安全下载扩展声音包，请用 Safari/Chrome 打开在线安装版。"
          : "此浏览器缺少缓存或完整性校验能力，不能安装离线声音包。",
        { packId }
      );
    }
    const pack = await loadPackManifest(packId, options);
    if (pack.state !== "ready" || pack.readyClipCount !== pack.clipCount) {
      throw new VoicePackError("PACK_NOT_PUBLISHED", `${packId} 尚未生成完整且经过哈希登记的真实音频。`, {
        packId,
        state: pack.state,
        readyClipCount: pack.readyClipCount,
        clipCount: pack.clipCount
      });
    }
    if (!/^[a-f0-9]{64}$/i.test(pack.assetHash || "")) {
      throw new VoicePackError("PACK_NOT_PUBLISHED", `${packId} 缺少整包音频版本哈希，已停止安装。`, { packId });
    }
    for (const entry of pack.entries) {
      if (!entry.ready || !entry.bytes || !/^[a-f0-9]{64}$/i.test(entry.sha256 || "")) {
        throw new VoicePackError("PACK_NOT_PUBLISHED", `${packId} 含未完成音频，已停止安装。`, { entryId: entry.id });
      }
    }

    const space = await storageEstimate(packId);
    if (space.fits === false && !options.ignoreQuotaWarning) {
      throw new VoicePackError("INSUFFICIENT_STORAGE", `剩余空间不足以安装 ${packId}。`, space);
    }

    const name = cacheName(pack);
    const cache = await caches.open(name);
    const totalBytes = pack.entries.reduce((sum, entry) => sum + entry.bytes, 0);
    let completedBytes = 0;
    let completedClips = 0;
    const pending = [];
    for (const entry of pack.entries) {
      const request = new Request(assetUrl(pack, entry), { credentials: "same-origin" });
      if (await cachedResponseIsValid(cache, request, entry)) {
        completedBytes += entry.bytes;
        completedClips += 1;
      } else {
        pending.push({ entry, request });
      }
    }

    const report = () => {
      const detail = { packId, completedClips, totalClips: pack.clipCount, completedBytes, totalBytes };
      options.onProgress?.(detail);
      emit("progress", detail);
    };
    report();
    let cursor = 0;
    const worker = async () => {
      while (cursor < pending.length) {
        if (options.signal?.aborted) throw new DOMException("Voice-pack install aborted", "AbortError");
        const job = pending[cursor++];
        const response = await fetch(job.request, { cache: "no-store", signal: options.signal });
        if (!response.ok) throw new VoicePackError("DOWNLOAD_FAILED", `声音文件下载失败（HTTP ${response.status}）。`, { packId, entryId: job.entry.id });
        const buffer = await response.arrayBuffer();
        if (buffer.byteLength !== job.entry.bytes) {
          throw new VoicePackError("INTEGRITY_FAILED", "声音文件大小与清单不一致，未写入缓存。", { packId, entryId: job.entry.id });
        }
        const hash = await digestHex(buffer);
        if (hash !== job.entry.sha256) {
          throw new VoicePackError("INTEGRITY_FAILED", "声音文件哈希与清单不一致，未写入缓存。", { packId, entryId: job.entry.id });
        }
        const headers = new Headers(response.headers);
        headers.set("Content-Type", "audio/mpeg");
        headers.set("Content-Length", String(buffer.byteLength));
        headers.set("X-Huilaishi-SHA256", hash);
        headers.set("X-Huilaishi-Bytes", String(buffer.byteLength));
        await cache.put(job.request, new Response(buffer, { status: 200, headers }));
        completedBytes += buffer.byteLength;
        completedClips += 1;
        report();
      }
    };
    const concurrency = Math.max(1, Math.min(6, Number(options.concurrency) || 3));
    await Promise.all(Array.from({ length: Math.min(concurrency, pending.length || 1) }, worker));
    if (completedClips !== pack.clipCount || completedBytes !== totalBytes) {
      throw new VoicePackError("INTEGRITY_FAILED", "声音包未完整写入，未标记为可用。", { packId, completedClips, completedBytes });
    }
    await cache.put(readyMarkerRequest(pack), new Response(JSON.stringify({
      packId,
      version: pack.version,
      assetHash: pack.assetHash,
      clipCount: pack.clipCount,
      bytes: totalBytes,
      installedAt: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "X-Huilaishi-Asset-Hash": pack.assetHash,
        "X-Huilaishi-Clip-Count": String(pack.clipCount)
      }
    }));
    await removeObsoleteCaches(packId, name);
    const detail = { packId, installed: true, clips: completedClips, bytes: completedBytes, cacheName: name };
    emit("installed", detail);
    return detail;
  }

  function installPack(packId, options = {}) {
    if (activeInstalls.has(packId)) return activeInstalls.get(packId);
    const task = performInstall(packId, options).finally(() => activeInstalls.delete(packId));
    activeInstalls.set(packId, task);
    return task;
  }

  async function packStatus(packId) {
    const catalog = await loadCatalog();
    const summary = catalog.packs.find(pack => pack.id === packId);
    if (!summary) throw new VoicePackError("PACK_NOT_FOUND", `不存在声音包 ${packId}。`, { packId });
    if (!("caches" in root)) return { ...summary, installed: false, cachedClips: 0, cachedBytes: 0, supported: false };
    if (summary.state === "planned" && !summary.readyClipCount) {
      return { ...summary, installed: false, cachedClips: 0, cachedBytes: 0, supported: supportsDownload() };
    }
    const cacheNames = await caches.keys();
    const hasPackCache = cacheNames.some(name => name.startsWith(CACHE_PREFIX) && name.includes(`-${packId}-`));
    if (!hasPackCache) {
      return { ...summary, installed: false, partial: false, cachedClips: 0, cachedBytes: 0, supported: supportsDownload() };
    }
    let pack;
    try { pack = await loadPackManifest(packId); }
    catch { return { ...summary, installed: false, cachedClips: 0, cachedBytes: 0, supported: supportsDownload() }; }
    const name = cacheName(pack);
    if (!cacheNames.includes(name)) {
      return { ...summary, installed: false, partial: false, cachedClips: 0, cachedBytes: 0, supported: supportsDownload() };
    }
    const cache = await caches.open(name);
    const readyMarker = await readyMarkerIsValid(cache, pack);
    let cachedClips = 0;
    let cachedBytes = 0;
    for (const entry of pack.entries.filter(item => item.ready)) {
      if (await cachedResponseIsValid(cache, new Request(assetUrl(pack, entry), { credentials: "same-origin" }), entry)) {
        cachedClips += 1;
        cachedBytes += entry.bytes;
      }
    }
    return {
      ...summary,
      installed: pack.state === "ready" && readyMarker && cachedClips === pack.clipCount,
      partial: cachedClips > 0 && cachedClips < pack.clipCount,
      cachedClips,
      cachedBytes,
      supported: supportsDownload()
    };
  }

  async function listPacks(options = {}) {
    const catalog = await loadCatalog(options);
    if (!options.withStatus) return catalog.packs.map(pack => ({ ...pack }));
    return Promise.all(catalog.packs.map(pack => packStatus(pack.id)));
  }

  async function resolve(textOrOptions, language, options = {}) {
    const found = await lookup(textOrOptions, language, options);
    if (!found || !found.entry.ready) return null;
    const key = `${found.packId}/${found.entry.id}`;
    if (memorySources.has(key)) return memorySources.get(key);
    if (root.HUILAISHI_PUBLIC_TEST || root.HUILAISHI_NATIVE_IOS) return found.url;
    if (isFileProtocol()) return null;
    if ("caches" in root) {
      const name = cacheName(found.pack);
      if (!(await caches.keys()).includes(name)) return null;
      const cache = await caches.open(name);
      if (!(await readyMarkerIsValid(cache, found.pack))) return null;
      const request = new Request(found.url, { credentials: "same-origin" });
      const response = await cache.match(request);
      if (response && await cachedResponseIsValid(cache, request, found.entry)) {
        const objectUrl = URL.createObjectURL(await response.blob());
        memorySources.set(key, objectUrl);
        const entryIdentity = identity(found.entry.text, found.entry.language);
        memoryIdentitySources.set(`${found.packId}|${entryIdentity}`, objectUrl);
        for (const alias of found.entry.aliases || []) {
          memoryIdentitySources.set(`${found.packId}|alias:${alias}`, objectUrl);
          memoryIdentitySources.set(`${found.packId}|alias:${alias}|${entryIdentity}`, objectUrl);
        }
        return objectUrl;
      }
    }
    return null;
  }

  function resolveSync(textOrOptions, language, options = {}) {
    const input = textOrOptions && typeof textOrOptions === "object" ? { ...textOrOptions } : { text: textOrOptions, lang: language };
    const packId = packIdFor({ ...options, ...input });
    if (!packId) return null;
    if (input.entryId) return memorySources.get(`${packId}/${input.entryId}`) || null;
    const wanted = identity(input.text, input.lang || input.language || language);
    if (input.key) {
      return wanted
        ? memoryIdentitySources.get(`${packId}|alias:${input.key}|${wanted}`) || null
        : memoryIdentitySources.get(`${packId}|alias:${input.key}`) || null;
    }
    return wanted ? memoryIdentitySources.get(`${packId}|${wanted}`) || null : null;
  }

  async function prime(textOrOptions, language, options = {}) {
    return resolve(textOrOptions, language, options);
  }

  async function deletePack(packId) {
    const catalog = await loadCatalog().catch(() => null);
    const known = catalog?.packs.some(pack => pack.id === packId);
    if (!known) throw new VoicePackError("PACK_NOT_FOUND", `不存在声音包 ${packId}。`, { packId });
    const removedCaches = await removeObsoleteCaches(packId);
    for (const [key, source] of [...memorySources]) {
      if (!key.startsWith(`${packId}/`)) continue;
      if (String(source).startsWith("blob:")) URL.revokeObjectURL(source);
      memorySources.delete(key);
    }
    for (const key of [...memoryIdentitySources.keys()]) if (key.startsWith(`${packId}|`)) memoryIdentitySources.delete(key);
    const detail = { packId, removedCaches };
    emit("deleted", detail);
    return detail;
  }

  async function deleteAll() {
    let removedCaches = 0;
    if ("caches" in root) {
      const names = await caches.keys();
      const results = await Promise.all(names.filter(name => name.startsWith(CACHE_PREFIX)).map(name => caches.delete(name)));
      removedCaches = results.filter(Boolean).length;
    }
    for (const source of memorySources.values()) if (String(source).startsWith("blob:")) URL.revokeObjectURL(source);
    memorySources.clear();
    memoryIdentitySources.clear();
    const detail = { removedCaches };
    emit("deleted-all", detail);
    return detail;
  }

  function dispose() {
    for (const source of memorySources.values()) if (String(source).startsWith("blob:")) URL.revokeObjectURL(source);
    memorySources.clear();
    memoryIdentitySources.clear();
  }

  const api = Object.freeze({
    apiVersion: API_VERSION,
    VoicePackError,
    normalizeLanguage,
    normalizeText,
    identity,
    packIdFor,
    supportsDownload,
    isFileProtocol,
    configure,
    catalog: loadCatalog,
    loadPackManifest,
    lookup,
    resolve,
    resolveSync,
    prime,
    installPack,
    packStatus,
    listPacks,
    storageEstimate,
    deletePack,
    deleteAll,
    dispose
  });

  root.HUILAISHI_VOICE_PACKS = api;
  root.addEventListener?.("pagehide", dispose, { once: true });
})(globalThis);
