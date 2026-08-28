import { copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(SCRIPT_DIRECTORY, "..");
const WEB_DIRECTORY = path.join(REPOSITORY_ROOT, "native-www");
const CAPACITOR_CONFIG = path.join(REPOSITORY_ROOT, "capacitor.config.json");
const ANDROID_DIRECTORY = path.join(REPOSITORY_ROOT, "android");
const ANDROID_MANIFEST = path.join(ANDROID_DIRECTORY, "app", "src", "main", "AndroidManifest.xml");
const APP_GRADLE = path.join(ANDROID_DIRECTORY, "app", "build.gradle");
const ANDROID_STRINGS = path.join(ANDROID_DIRECTORY, "app", "src", "main", "res", "values", "strings.xml");
const NATIVE_TEMPLATE_DIRECTORY = path.join(REPOSITORY_ROOT, "android-native");
const PACKAGED_WEB_DIRECTORY = path.join(ANDROID_DIRECTORY, "app", "src", "main", "assets", "public");

const ANDROID_VARIANT = String(process.env.HUILAISHI_ANDROID_VARIANT || "standard").toLowerCase();
const IS_SAMSUNG_VARIANT = ANDROID_VARIANT === "samsung";
const APP_ID = IS_SAMSUNG_VARIANT ? "com.huilaishi.app.samsung" : "com.huilaishi.app";
const APP_NAME = "萨瓦迪卡";
const VERSION_CODE = 120603;
const VERSION_NAME = IS_SAMSUNG_VARIANT ? "12.6.3-samsung.1" : "12.6.3";
const MINIMUM_WEBVIEW_VERSION = 80;
const EXPECTED_CORE_AUDIO_COUNT = 696;
const EXPECTED_CORE_AUDIO_BYTES = 23_320_920;
const BUNDLED_L1_DIRECTIONS = ["zh-th", "th-zh"];
const EXPECTED_BUNDLED_L1_WORD_AUDIO_COUNT = 1_000;
const EXPECTED_BUNDLED_L1_WORD_AUDIO_BYTES = 10_472_904;
const REQUIRED_PERMISSIONS = [
  "android.permission.RECORD_AUDIO",
  "android.permission.MODIFY_AUDIO_SETTINGS",
];

const ROOT_RUNTIME_FILES = [
  "styles.css",
  "vocab.css",
  "arcade.css",
  "battle.css",
  "speech-engine.css",
  "pronunciation-course.css",
  "pronunciation-score.css",
  "voice-pack-ui.css",
  "partner-live.css",
  "product-tour.css",
  "open-ui.css",
  "offline-data.js",
  "vocab-l1-l2.js",
  "vocab-l3-l4.js",
  "vocab-l5-l6.js",
  "vocab-expansion-l1-l3.js",
  "vocab-expansion-l4-l6.js",
  "vocab-review-candidates.js",
  "register-pack.js",
  "thai-phonetic.js",
  "pronunciation-audio-map.js",
  "cute-audio-map.js",
  "voice-pack-manager.js",
  "voice-pack-ui.js",
  "partner-config.js",
  "partner-live.js",
  "speech-engine.js",
  "pronunciation-course.js",
  "pronunciation-score.js",
  "app.js",
  "vocab-ui.js",
  "product-tour.js",
  "arcade.js",
  "battle-records.js",
  "battle.js",
  "manifest.webmanifest",
  "PRIVACY.md",
  "SAFETY.md",
  "VOICE_ASSET_PROVENANCE.md",
  "TERMS.md",
];

const SUPPORT_FILES = [
  "assets/art/sawadeeka-sino-thai-background-v1.webp",
  "assets/game/monster-paper-lantern-v1.webp",
  "assets/game/monster-lotus-flame-v1.webp",
  "assets/game/monster-ink-king-v1.webp",
  "partner/manual-peer.js",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-collage.svg",
  "icons/icon-maskable-512.png",
  "icons/icon-source.svg",
  "icons/icon-maskable-source.svg",
  "vendor/driver-1.8.0.css",
  "vendor/pitchy-4.1.0.iife.js",
  "vendor/driver-1.8.0.iife.js",
  "vendor/canvas-confetti-1.9.4.js",
  "vendor/THIRD_PARTY_NOTICES.md",
  "vendor/licenses/canvas-confetti-1.9.4-ISC.txt",
  "vendor/licenses/chinese-open-wordnet-2.0.txt",
  "vendor/licenses/driver.js-1.8.0-MIT.txt",
  "vendor/licenses/fft.js-4.0.4-MIT.txt",
  "vendor/licenses/pitchy-4.1.0-MIT.txt",
  "vendor/licenses/princeton-wordnet-3.0.txt",
  "vendor/licenses/thai-wordnet-2.0.txt",
];

const SOURCE_FRESHNESS_FILES = [
  "index.html",
  "native-bootstrap.js",
  "unsupported-webview.html",
  ...ROOT_RUNTIME_FILES,
  ...SUPPORT_FILES,
].sort();

const ALAI_CUES = ["intro", "correct", "retry", "risk", "level"];
const SUGAR_IDS = [
  "repeat", "make-way", "hurry", "quiet", "boundaries", "leave-alone", "mistake", "decline", "wait", "repay",
  "dont-touch", "too-expensive", "late", "drive-slower", "queue", "disagree", "clean-up", "stop-messaging", "apology", "calm-down",
];
const ROOT_AUDIO_FILES = [
  ...ALAI_CUES.flatMap(cue => [
    `assets/audio/alai-${cue}-zh.mp3`,
    `assets/audio/alai-${cue}-th.mp3`,
  ]),
  "assets/audio/sugarblade-mode-zh.mp3",
  "assets/audio/sugarblade-mode-th.mp3",
  ...SUGAR_IDS.flatMap(id => [
    `assets/audio/sugarblade-s1-${id}-zh.mp3`,
    `assets/audio/sugarblade-s1-${id}-th.mp3`,
  ]),
];

const NATIVE_BOOTSTRAP = `(() => {
  "use strict";
  Object.defineProperty(globalThis, "HUILAISHI_NATIVE_ANDROID", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: true
  });

  // Capacitor already serves every bundled file locally. Do not install a
  // second cache layer inside the WebView; remove registrations left by an
  // earlier package while the native runtime guard prevents new registration.
  const worker = globalThis.navigator?.serviceWorker;
  if (!worker || typeof worker.getRegistrations !== "function") return;
  worker.getRegistrations()
    .then(registrations => Promise.all(registrations.map(registration => registration.unregister())))
    .catch(() => {});
})();
`;

const UNSUPPORTED_WEBVIEW_HTML = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="#5aa6a2" />
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E" />
  <title>萨瓦迪卡 · 请更新系统浏览器</title>
  <style>
    *{box-sizing:border-box}html,body{min-height:100%;margin:0}body{display:grid;place-items:center;padding:28px;background:#f1e4c7;color:#241d19;background-image:radial-gradient(circle at 82% 18%,#b63c32 0 92px,transparent 93px),repeating-linear-gradient(135deg,transparent 0 10px,rgba(40,51,76,.055) 10px 12px);font-family:system-ui,-apple-system,"Noto Sans SC","Noto Sans Thai",sans-serif}.card{width:min(100%,430px);padding:28px 24px;border:2px solid #241d19;border-radius:3px;background:#5aa6a2;box-shadow:6px 7px 0 #28334c}.mark{display:grid;place-items:center;width:54px;height:54px;border:2px solid #241d19;border-radius:3px;background:#b63c32;color:#fff8e7;box-shadow:2px 2px 0 #241d19;font-size:26px;font-weight:800;transform:rotate(-2deg)}h1{margin:22px 0 10px;font-family:Georgia,"Noto Sans SC",serif;font-size:28px;line-height:1.18}p{margin:10px 0;color:#493d34;line-height:1.65}.steps{margin:20px 0;padding:16px 18px;border:1px solid #241d19;border-radius:2px;background:#fff8e7;color:#241d19}.th{padding-top:16px;border-top:2px solid #28334c}a{display:block;margin-top:20px;padding:14px 18px;border:1px solid #241d19;border-radius:2px;background:#b63c32;color:#fff8e7;box-shadow:3px 3px 0 #241d19;text-align:center;text-decoration:none;font-weight:750}</style>
</head>
<body>
  <main class="card" data-android-compatibility-page>
    <div class="mark">萨</div>
    <h1>请先更新系统浏览器组件</h1>
    <p>应用没有损坏。当前手机的 Android System WebView / Chrome 版本太旧，无法安全运行课程和语音。</p>
    <p class="steps">打开手机应用商店或“系统设置 → 应用”，更新并启用 <b>Android System WebView</b> 和 <b>Chrome</b>，然后重新打开萨瓦迪卡。</p>
    <div class="th" lang="th">
      <h1>โปรดอัปเดต WebView ของระบบ</h1>
      <p>อัปเดตและเปิดใช้ Android System WebView กับ Chrome จากร้านแอปหรือการตั้งค่าระบบ แล้วเปิดแอปอีกครั้ง</p>
    </div>
    <a href="https://play.google.com/store/apps/details?id=com.google.android.webview">打开 WebView 更新页</a>
  </main>
</body>
</html>
`;

const CAPACITOR_GENERATED_WEB_FILES = new Set(["cordova.js", "cordova_plugins.js"]);

function fail(message) {
  throw new Error(`[android-package] ${message}`);
}

function nativeSourcePath(fileName) {
  return path.join(
    ANDROID_DIRECTORY,
    "app",
    "src",
    "main",
    "java",
    ...APP_ID.split("."),
    fileName,
  );
}

function normalizeRelativePath(value) {
  const normalized = String(value || "").replaceAll("\\", "/");
  if (!normalized || normalized.startsWith("/") || normalized.includes("\0")) {
    fail(`Invalid relative path: ${value}`);
  }
  const canonical = path.posix.normalize(normalized);
  if (canonical !== normalized || canonical === ".." || canonical.startsWith("../")) {
    fail(`Path escapes package root: ${value}`);
  }
  return normalized;
}

function resolveInside(root, relativePath) {
  const normalized = normalizeRelativePath(relativePath);
  const resolved = path.resolve(root, ...normalized.split("/"));
  const prefix = `${path.resolve(root)}${path.sep}`;
  if (!resolved.startsWith(prefix)) fail(`Resolved path escapes package root: ${relativePath}`);
  return resolved;
}

function assertGeneratedPath(candidate, expectedName) {
  const resolved = path.resolve(candidate);
  if (path.dirname(resolved) !== REPOSITORY_ROOT || path.basename(resolved) !== expectedName) {
    fail(`Refusing to modify unexpected generated path: ${resolved}`);
  }
}

async function fileExists(filePath) {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

function replaceExactly(source, search, replacement, expectedCount, label) {
  const count = source.split(search).length - 1;
  if (count !== expectedCount) {
    fail(`${label}: expected ${expectedCount} source match(es), found ${count}.`);
  }
  return source.split(search).join(replacement);
}

function parseCoreAudioFiles(pronunciationMapSource, cuteMapSource) {
  const pronunciationMatch = pronunciationMapSource.match(/globalThis\.PRONUNCIATION_AUDIO\s*=\s*(\{[\s\S]*?\})\s*;/);
  if (!pronunciationMatch) fail("Could not parse pronunciation audio map.");
  const pronunciationMap = JSON.parse(pronunciationMatch[1]);

  const cuteMatch = cuteMapSource.match(/\/\* CUTE_AUDIO_ENTRIES_START \*\/\s*(\[[\s\S]*?\])\s*\/\* CUTE_AUDIO_ENTRIES_END \*\//);
  if (!cuteMatch) fail("Could not parse cute-content audio map.");
  const cuteEntries = JSON.parse(cuteMatch[1]);

  const files = new Set(ROOT_AUDIO_FILES);
  for (const source of Object.values(pronunciationMap)) files.add(normalizeRelativePath(source));
  for (const entry of cuteEntries) {
    if (!entry?.file) fail("Cute-content audio entry has no file name.");
    files.add(normalizeRelativePath(`assets/audio/cute-content/${entry.file}`));
  }
  const result = [...files].sort();
  if (result.length !== EXPECTED_CORE_AUDIO_COUNT) {
    fail(`Core audio inventory changed: expected ${EXPECTED_CORE_AUDIO_COUNT}, found ${result.length}.`);
  }
  return result;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function buildBundledL1VoiceInventory() {
  const sourceCatalog = JSON.parse(await readFile(resolveInside(REPOSITORY_ROOT, "voice-packs/manifest.json"), "utf8"));
  const audioFiles = [];
  const manifestSources = new Map();
  const packSummaries = [];
  let totalBytes = 0;
  let totalAliases = 0;

  for (const direction of BUNDLED_L1_DIRECTIONS) {
    const packId = `${direction}-l1`;
    const manifestPath = `voice-packs/v11-standard/${direction}/l1/manifest.json`;
    const sourceManifest = JSON.parse(await readFile(resolveInside(REPOSITORY_ROOT, manifestPath), "utf8"));
    if (sourceManifest.packId !== packId || sourceManifest.level !== 1 || sourceManifest.direction !== direction) {
      fail(`Bundled L1 source manifest identity is invalid: ${manifestPath}`);
    }

    const entries = [];
    let packBytes = 0;
    let packAliases = 0;
    for (const sourceEntry of sourceManifest.entries || []) {
      if (!sourceEntry.ready || !sourceEntry.kinds?.includes("word")) continue;
      const aliases = (sourceEntry.aliases || []).filter(alias => /:word:(?:zh|th)$/.test(alias));
      if (!aliases.length) fail(`Bundled L1 word clip has no word alias: ${packId}/${sourceEntry.id}`);
      const relativePath = path.posix.join(path.posix.dirname(manifestPath), sourceEntry.file);
      const audio = await readFile(resolveInside(REPOSITORY_ROOT, relativePath));
      if (audio.byteLength !== sourceEntry.bytes || sha256(audio) !== sourceEntry.sha256) {
        fail(`Bundled L1 source clip failed size/hash validation: ${relativePath}`);
      }
      audioFiles.push(relativePath);
      packBytes += audio.byteLength;
      packAliases += aliases.length;
      totalAliases += aliases.length;
      entries.push({ ...sourceEntry, aliases, kinds: ["word"] });
    }

    if (entries.length !== 500 || packAliases !== 500) {
      fail(`Bundled ${packId} inventory must contain exactly 500 word heads and aliases.`);
    }
    const contentHash = sha256(JSON.stringify(entries.map(entry => ({
      id: entry.id,
      language: entry.language,
      text: entry.text,
      aliases: entry.aliases,
      vocabulary: entry.vocabulary,
    }))));
    const assetHash = sha256(JSON.stringify(entries.map(entry => ({
      id: entry.id,
      file: entry.file,
      bytes: entry.bytes,
      sha256: entry.sha256,
    }))));
    const manifest = {
      ...sourceManifest,
      learningUse: "pronunciation-model-word-heads",
      nativeBundledScope: "android-l1-word-heads",
      aliasCount: entries.reduce((sum, entry) => sum + entry.aliases.length, 0),
      clipCount: entries.length,
      readyClipCount: entries.length,
      bytes: packBytes,
      estimatedBytes: packBytes,
      contentHash,
      assetHash,
      entries,
    };
    manifestSources.set(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    const sourceSummary = sourceCatalog.packs?.find(pack => pack.id === packId);
    if (!sourceSummary) fail(`Bundled L1 catalogue summary is missing: ${packId}`);
    packSummaries.push({
      ...sourceSummary,
      aliasCount: manifest.aliasCount,
      clipCount: manifest.clipCount,
      readyClipCount: manifest.readyClipCount,
      bytes: manifest.bytes,
      estimatedBytes: manifest.estimatedBytes,
      contentHash,
      assetHash,
      nativeBundledScope: manifest.nativeBundledScope,
    });
    totalBytes += packBytes;
  }

  const uniqueAudioFiles = [...new Set(audioFiles)].sort();
  if (uniqueAudioFiles.length !== EXPECTED_BUNDLED_L1_WORD_AUDIO_COUNT || totalAliases !== EXPECTED_BUNDLED_L1_WORD_AUDIO_COUNT) {
    fail(`Bundled L1 word inventory changed: expected ${EXPECTED_BUNDLED_L1_WORD_AUDIO_COUNT}, found ${uniqueAudioFiles.length}.`);
  }
  if (totalBytes !== EXPECTED_BUNDLED_L1_WORD_AUDIO_BYTES) {
    fail(`Bundled L1 word audio byte count changed: expected ${EXPECTED_BUNDLED_L1_WORD_AUDIO_BYTES}, found ${totalBytes}.`);
  }

  const nativeCatalog = {
    ...sourceCatalog,
    kind: "bundled-android-l1-word-head-voice-packs",
    learningUse: "pronunciation-model-word-heads",
    installModel: "bundled-with-android-apk",
    cachePolicy: "APK-local assets; no Cache Storage installation required",
    fileProtocol: "served by the Capacitor local asset server",
    totals: {
      vocabularySlots: EXPECTED_BUNDLED_L1_WORD_AUDIO_COUNT,
      aliases: totalAliases,
      clips: uniqueAudioFiles.length,
      readyClips: uniqueAudioFiles.length,
      bytes: totalBytes,
      estimatedBytes: totalBytes,
    },
    packs: packSummaries,
  };
  nativeCatalog.catalogueHash = sha256(JSON.stringify(packSummaries));
  manifestSources.set("voice-packs/manifest.json", `${JSON.stringify(nativeCatalog, null, 2)}\n`);
  return {
    audioFiles: uniqueAudioFiles,
    manifestFiles: [...manifestSources.keys()].sort(),
    manifestSources,
    bytes: totalBytes,
  };
}

function transformIndex(source) {
  let result = replaceExactly(
    source,
    '<script src="pwa-bootstrap.js"></script>',
    '<script src="native-bootstrap.js"></script>',
    1,
    "Android bootstrap replacement",
  );
  result = replaceExactly(
    result,
    "  <title>萨瓦迪卡 · 中泰双向语言学习</title>",
    '  <meta name="huilaishi-runtime" content="capacitor-android" />\n  <title>萨瓦迪卡 · 中泰双向语言学习</title>',
    1,
    "Android runtime marker",
  );
  result = result
    .replaceAll("当前是单文件离线版；", "当前是 Android 离线安装版；")
    .replaceAll("ขณะนี้เป็นไฟล์ออฟไลน์ไฟล์เดียว", "ขณะนี้เป็นแอป Android แบบออฟไลน์");
  if (IS_SAMSUNG_VARIANT) {
    result = replaceExactly(
      result,
      '<small>สวัสดีค่ะ · พูดให้เป็น</small></div></div>',
      '<small>สวัสดีค่ะ · พูดให้เป็น</small><small data-native-samsung-edition style="display:block;margin-top:3px;color:#176f60;font-size:10px;font-weight:800;letter-spacing:.04em">三星安全版 · 12.6.3-R1</small></div></div>',
      1,
      "Samsung native first-screen edition badge",
    );
  }
  if (/(?:src|href)=["']\/(?!\/)/i.test(result)) fail("index.html contains a root-absolute asset path.");
  return result;
}

function transformApp(source) {
  let result = replaceExactly(
    source,
    'Boolean(window.SINGLE_FILE_BUILD) || location.protocol === "file:"',
    'Boolean(window.HUILAISHI_NATIVE_ANDROID) || Boolean(window.SINGLE_FILE_BUILD) || location.protocol === "file:"',
    2,
    "Native packaged-mode Boolean guards",
  );
  result = replaceExactly(
    result,
    'window.SINGLE_FILE_BUILD || location.protocol === "file:"',
    'window.HUILAISHI_NATIVE_ANDROID || window.SINGLE_FILE_BUILD || location.protocol === "file:"',
    2,
    "Native packaged-mode guards",
  );
  result = replaceExactly(
    result,
    'const standalone = window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;',
    'const standalone = Boolean(window.HUILAISHI_NATIVE_ANDROID) || window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;',
    1,
    "Native installed-state guard",
  );
  result = replaceExactly(
    result,
    'serviceWorkerRegistration = await navigator.serviceWorker.register("./service-worker.js", { updateViaCache: "none" });',
    'throw new Error("Service Worker is disabled in the Android native shell.");',
    1,
    "Native Service Worker hard-disable",
  );
  result = replaceExactly(
    result,
    'options.appVersion || "12.6.3"',
    `options.appVersion || "${VERSION_NAME}"`,
    1,
    "Android export-version default",
  );
  result = replaceExactly(
    result,
    '{ appVersion: "12.6.3" }',
    `{ appVersion: "${VERSION_NAME}" }`,
    1,
    "Android export version",
  );
  return result
    .replaceAll("当前是单文件离线版；", "当前是 Android 离线安装版；")
    .replaceAll("ขณะนี้เป็นไฟล์ออฟไลน์ไฟล์เดียว", "ขณะนี้เป็นแอป Android แบบออฟไลน์")
    .replaceAll("核心语音已经写入当前单文件离线版，不需要再次缓存。", "核心语音已经内置在 Android 安装包中，不需要再次缓存。")
    .replaceAll("รวมเสียงหลักไว้ในไฟล์ออฟไลน์นี้แล้ว ไม่ต้องบันทึกซ้ำ", "รวมเสียงหลักไว้ในแอป Android แล้ว ไม่ต้องบันทึกซ้ำ")
    .replaceAll("此 HTML 可离线使用文字、核心语音和录音回放；要安装到主屏幕，请用 Chrome 打开 HTTPS 地址。语音识别取决于设备", "当前已经是 Android 离线安装版，可离线使用文字、核心语音和录音回放；语音识别取决于设备")
    .replaceAll("ไฟล์นี้ใช้ข้อความ เสียงหลัก และฟังเสียงอัดแบบออฟไลน์ได้ หากต้องการติดตั้ง โปรดเปิด HTTPS ใน Chrome การรู้จำเสียงขึ้นอยู่กับอุปกรณ์", "ขณะนี้เป็นแอป Android แบบออฟไลน์ ใช้ข้อความ เสียงหลัก และฟังเสียงอัดแบบออฟไลน์ได้ การรู้จำเสียงขึ้นอยู่กับอุปกรณ์")
    .replaceAll("单文件内置语音属于应用文件本身，不是可清除的设备缓存", "Android 安装包内置语音属于应用本身，不是可清除的设备缓存")
    .replaceAll("เสียงที่ฝังในไฟล์เดี่ยวเป็นส่วนหนึ่งของไฟล์แอป ไม่ใช่แคชอุปกรณ์ที่ล้างได้", "เสียงที่รวมในแอป Android เป็นส่วนหนึ่งของแอป ไม่ใช่แคชอุปกรณ์ที่ล้างได้");
}

function transformOfflineData(source) {
  return source
    .replaceAll('offlineFileReady: "单文件离线版可用"', 'offlineFileReady: "Android 离线版可用"')
    .replaceAll('offlineFileReady: "ไฟล์ออฟไลน์พร้อมใช้"', 'offlineFileReady: "แอป Android ออฟไลน์พร้อมใช้"');
}

function transformVoicePackManager(source) {
  let result = replaceExactly(
    source,
    'return !isFileProtocol() && typeof root.fetch === "function" && "caches" in root && Boolean(root.crypto?.subtle);',
    'return !root.HUILAISHI_NATIVE_ANDROID && !isFileProtocol() && typeof root.fetch === "function" && "caches" in root && Boolean(root.crypto?.subtle);',
    1,
    "Native voice-pack download guard",
  );
  result = replaceExactly(
    result,
    "    if (isFileProtocol()) return null;\n    if (\"caches\" in root) {",
    "    if (root.HUILAISHI_NATIVE_ANDROID) return found.url;\n    if (isFileProtocol()) return null;\n    if (\"caches\" in root) {",
    1,
    "Native bundled voice-pack resolver",
  );
  return result;
}

function transformVoicePackUi(source) {
  let result = replaceExactly(
    source,
    "const isStandaloneBuild = () => Boolean(window.SINGLE_FILE_BUILD)",
    "const isStandaloneBuild = () => Boolean(window.HUILAISHI_NATIVE_ANDROID) || Boolean(window.SINGLE_FILE_BUILD)",
    1,
    "Native voice-pack UI guard",
  );
  result = replaceExactly(
    result,
    "const disabled = item.state !== \"ready\" && !item.installed;",
    "const disabled = isStandaloneBuild() || (item.state !== \"ready\" && !item.installed);",
    1,
    "Native voice-pack action guard",
  );
  result = replaceExactly(
    result,
    "const action = item.installing ? c.cancel : item.installed ? c.delete : item.state === \"ready\" ? c.install : c.planned;",
    "const action = isStandaloneBuild() ? c.offlineAction : item.installing ? c.cancel : item.installed ? c.delete : item.state === \"ready\" ? c.install : c.planned;",
    1,
    "Native voice-pack action copy",
  );
  return result
    .replaceAll('unavailable: "仅在线版/PWA 可安装", offlineAction: "仅在线版"', 'unavailable: "L1 词头示范音已随 APK 内置", offlineAction: "L1 已内置"')
    .replaceAll('unavailable: "ใช้ได้ในเวอร์ชันออนไลน์/PWA เท่านั้น", offlineAction: "ออนไลน์เท่านั้น"', 'unavailable: "รวมเสียงคำศัพท์ L1 ไว้ใน APK แล้ว", offlineAction: "มี L1 แล้ว"');
}

async function transformedRuntimeFile(relativePath) {
  const source = await readFile(resolveInside(REPOSITORY_ROOT, relativePath), "utf8");
  if (relativePath === "app.js") return transformApp(source);
  if (relativePath === "offline-data.js") return transformOfflineData(source);
  if (relativePath === "voice-pack-manager.js") return transformVoicePackManager(source);
  if (relativePath === "voice-pack-ui.js") return transformVoicePackUi(source);
  return null;
}

async function expectedNativeBytes(relativePath) {
  if (relativePath === "index.html") {
    const source = await readFile(resolveInside(REPOSITORY_ROOT, relativePath), "utf8");
    return Buffer.from(transformIndex(source), "utf8");
  }
  if (relativePath === "native-bootstrap.js") return Buffer.from(NATIVE_BOOTSTRAP, "utf8");
  if (relativePath === "unsupported-webview.html") return Buffer.from(UNSUPPORTED_WEBVIEW_HTML, "utf8");

  const transformed = await transformedRuntimeFile(relativePath);
  if (transformed !== null) return Buffer.from(transformed, "utf8");
  return readFile(resolveInside(REPOSITORY_ROOT, relativePath));
}

async function verifySourceFreshness(directory) {
  for (const relativePath of SOURCE_FRESHNESS_FILES) {
    const expected = await expectedNativeBytes(relativePath);
    const actual = await readFile(resolveInside(directory, relativePath));
    if (sha256(actual) !== sha256(expected)) {
      fail(`Android native runtime is stale against current source: ${relativePath} in ${directory}`);
    }
  }
}

async function copyRelative(relativePath) {
  const source = resolveInside(REPOSITORY_ROOT, relativePath);
  const destination = resolveInside(WEB_DIRECTORY, relativePath);
  if (!(await fileExists(source))) fail(`Required Android web resource is missing: ${relativePath}`);
  await mkdir(path.dirname(destination), { recursive: true });
  const transformed = await transformedRuntimeFile(relativePath);
  if (transformed === null) await copyFile(source, destination);
  else await writeFile(destination, transformed, "utf8");
}

async function listRelativeFiles(root, current = root) {
  const entries = await readdir(current, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(current, entry.name);
    if (entry.isDirectory()) files.push(...await listRelativeFiles(root, absolute));
    else if (entry.isFile()) files.push(path.relative(root, absolute).replaceAll("\\", "/"));
  }
  return files.sort();
}

async function expectedInventory() {
  const pronunciationSource = await readFile(resolveInside(REPOSITORY_ROOT, "pronunciation-audio-map.js"), "utf8");
  const cuteSource = await readFile(resolveInside(REPOSITORY_ROOT, "cute-audio-map.js"), "utf8");
  const audioFiles = parseCoreAudioFiles(pronunciationSource, cuteSource);
  const bundledVoice = await buildBundledL1VoiceInventory();
  return {
    audioFiles,
    bundledVoice,
    files: [
      "index.html",
      "native-bootstrap.js",
      "unsupported-webview.html",
      ...ROOT_RUNTIME_FILES,
      ...SUPPORT_FILES,
      ...audioFiles,
      ...bundledVoice.manifestFiles,
      ...bundledVoice.audioFiles,
    ].sort(),
  };
}

async function verifyCapacitorConfig() {
  const config = JSON.parse(await readFile(CAPACITOR_CONFIG, "utf8"));
  if (config.appId !== APP_ID || config.appName !== APP_NAME || config.webDir !== "native-www") {
    fail("Capacitor appId or webDir does not match the Android package.");
  }
  if (config.server?.errorPath !== "unsupported-webview.html") {
    fail("Capacitor must route unsupported WebViews to unsupported-webview.html.");
  }
  if (config.android?.minWebViewVersion !== MINIMUM_WEBVIEW_VERSION) {
    fail(`Android minimum WebView version must be ${MINIMUM_WEBVIEW_VERSION}.`);
  }
}

async function prepareAndroidVariant() {
  if (ANDROID_VARIANT !== "standard" && ANDROID_VARIANT !== "samsung") {
    fail(`Unsupported HUILAISHI_ANDROID_VARIANT: ${ANDROID_VARIANT}`);
  }
  const config = JSON.parse(await readFile(CAPACITOR_CONFIG, "utf8"));
  config.appId = APP_ID;
  config.appName = APP_NAME;
  await writeFile(CAPACITOR_CONFIG, `${JSON.stringify(config, null, 2)}\n`, "utf8");
  await verifyCapacitorConfig();
  console.log(`[android-package] Prepared ${ANDROID_VARIANT} variant: ${APP_ID} / ${APP_NAME}.`);
}

async function assertDirectoryInventory(directory, expectedFiles, allowedExtraFiles = new Set()) {
  const actualFiles = await listRelativeFiles(directory).catch(() => []);
  const expected = new Set(expectedFiles);
  const missing = expectedFiles.filter(file => !actualFiles.includes(file));
  const unexpected = actualFiles.filter(file => !expected.has(file) && !allowedExtraFiles.has(file));
  if (missing.length || unexpected.length) {
    fail(`Web inventory mismatch in ${directory}; missing=[${missing.join(", ")}], unexpected=[${unexpected.join(", ")}].`);
  }
  return actualFiles;
}

async function directoryStats(directory, files) {
  let bytes = 0;
  for (const relativePath of files) bytes += (await stat(resolveInside(directory, relativePath))).size;
  return { files: files.length, bytes, mebibytes: Number((bytes / 1024 / 1024).toFixed(2)) };
}

async function validateLocalIndexReferences(directory) {
  const index = await readFile(resolveInside(directory, "index.html"), "utf8");
  const localReferences = [...index.matchAll(/(?:src|href)=["']([^"']+)["']/gi)]
    .map(match => match[1])
    .filter(reference => !/^(?:#|data:|https?:|mailto:|tel:)/i.test(reference));
  for (const reference of localReferences) {
    const rawPath = decodeURIComponent(reference.split(/[?#]/, 1)[0]);
    const relativePath = rawPath === "./" || rawPath === "." ? "index.html" : rawPath;
    if (!(await fileExists(resolveInside(directory, relativePath)))) {
      fail(`index.html points to a missing local resource: ${reference}`);
    }
  }
}

async function validateNestedLocalReferences(directory) {
  const manifest = JSON.parse(await readFile(resolveInside(directory, "manifest.webmanifest"), "utf8"));
  for (const field of ["start_url", "scope"]) {
    const value = String(manifest[field] || "");
    if (!value.startsWith("./") || value.startsWith("/")) fail(`Manifest ${field} must remain relative: ${value}`);
  }
  for (const icon of manifest.icons || []) {
    const source = String(icon?.src || "").split(/[?#]/, 1)[0];
    if (!source || source.startsWith("/") || !(await fileExists(resolveInside(directory, source)))) {
      fail(`Manifest points to a missing or absolute icon: ${icon?.src || "(empty)"}`);
    }
  }

  const cssFiles = [...ROOT_RUNTIME_FILES, ...SUPPORT_FILES].filter(file => file.endsWith(".css"));
  for (const cssFile of cssFiles) {
    const css = await readFile(resolveInside(directory, cssFile), "utf8");
    for (const match of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) {
      const reference = match[1];
      if (/^(?:#|%23|data:|https?:)/i.test(reference)) continue;
      if (reference.startsWith("/")) fail(`${cssFile} contains a root-absolute URL: ${reference}`);
      const nestedPath = path.posix.normalize(path.posix.join(path.posix.dirname(cssFile), reference.split(/[?#]/, 1)[0]));
      if (!(await fileExists(resolveInside(directory, nestedPath)))) fail(`${cssFile} points to a missing resource: ${reference}`);
    }
  }

  const partnerConfig = await readFile(resolveInside(directory, "partner-config.js"), "utf8");
  const peerMatch = partnerConfig.match(/p2pModule:\s*["']([^"']+)["']/);
  if (!peerMatch || !(await fileExists(resolveInside(directory, peerMatch[1])))) {
    fail("partner-config.js points to a missing peer module.");
  }
}

async function verifyBundledL1VoiceAssets(directory, expected) {
  const catalogPath = "voice-packs/manifest.json";
  for (const [relativePath, expectedSource] of expected.manifestSources) {
    const actualSource = await readFile(resolveInside(directory, relativePath), "utf8");
    if (actualSource !== expectedSource) fail(`Android bundled voice manifest is not the curated L1 word-only form: ${relativePath}`);
  }

  const catalog = JSON.parse(await readFile(resolveInside(directory, catalogPath), "utf8"));
  const expectedPackIds = BUNDLED_L1_DIRECTIONS.map(direction => `${direction}-l1`).sort();
  const actualPackIds = (catalog.packs || []).map(pack => pack.id).sort();
  if (JSON.stringify(actualPackIds) !== JSON.stringify(expectedPackIds)
      || catalog.installModel !== "bundled-with-android-apk") {
    fail("Android voice catalogue must expose only the two bundled L1 word-head packs.");
  }

  const referencedAudio = new Set();
  let clipCount = 0;
  let audioBytes = 0;
  for (const summary of catalog.packs) {
    const manifestPath = path.posix.join("voice-packs", summary.manifest);
    const manifest = JSON.parse(await readFile(resolveInside(directory, manifestPath), "utf8"));
    if (manifest.level !== 1 || manifest.packId !== summary.id || manifest.entries.length !== 500
        || manifest.nativeBundledScope !== "android-l1-word-heads") {
      fail(`Android bundled voice manifest has an invalid L1 scope: ${manifestPath}`);
    }
    for (const entry of manifest.entries) {
      if (!entry.ready || JSON.stringify(entry.kinds) !== '["word"]'
          || !entry.aliases?.length || entry.aliases.some(alias => !/:word:(?:zh|th)$/.test(alias))) {
        fail(`Android bundled voice entry is not a ready word head: ${manifest.packId}/${entry.id}`);
      }
      const relativePath = path.posix.join(path.posix.dirname(manifestPath), entry.file);
      if (referencedAudio.has(relativePath)) fail(`Android bundled voice clip is referenced twice: ${relativePath}`);
      const audio = await readFile(resolveInside(directory, relativePath));
      if (audio.byteLength !== entry.bytes || sha256(audio) !== entry.sha256) {
        fail(`Android bundled voice clip failed packaged size/hash validation: ${relativePath}`);
      }
      referencedAudio.add(relativePath);
      clipCount += 1;
      audioBytes += audio.byteLength;
    }
  }

  if (clipCount !== EXPECTED_BUNDLED_L1_WORD_AUDIO_COUNT
      || audioBytes !== EXPECTED_BUNDLED_L1_WORD_AUDIO_BYTES
      || JSON.stringify([...referencedAudio].sort()) !== JSON.stringify(expected.audioFiles)) {
    fail(`Android bundled L1 voice inventory mismatch: ${clipCount} clips / ${audioBytes} bytes.`);
  }
  return { files: clipCount, bytes: audioBytes };
}

async function verifyNativeWeb(directory, { packaged = false } = {}) {
  const { audioFiles, bundledVoice, files } = await expectedInventory();
  const actualFiles = await assertDirectoryInventory(
    directory,
    files,
    packaged ? CAPACITOR_GENERATED_WEB_FILES : new Set(),
  );
  const index = await readFile(resolveInside(directory, "index.html"), "utf8");
  const bootstrap = await readFile(resolveInside(directory, "native-bootstrap.js"), "utf8");
  const compatibilityPage = await readFile(resolveInside(directory, "unsupported-webview.html"), "utf8");
  const app = await readFile(resolveInside(directory, "app.js"), "utf8");
  const voicePackManager = await readFile(resolveInside(directory, "voice-pack-manager.js"), "utf8");

  if (Buffer.byteLength(index, "utf8") >= 256 * 1024) fail("Native index.html is unexpectedly large or inlined.");
  if (!index.includes('content="capacitor-android"') || !index.includes('src="native-bootstrap.js"')) {
    fail("Native index.html is missing the Android runtime bootstrap.");
  }
  const hasSamsungBadge = index.includes("data-native-samsung-edition")
    && index.includes("三星安全版 · 12.6.3-R1");
  if (IS_SAMSUNG_VARIANT !== hasSamsungBadge) {
    fail("Native first-screen Samsung edition badge does not match the selected Android variant.");
  }
  if (index.includes("pwa-bootstrap.js") || actualFiles.includes("pwa-bootstrap.js") || actualFiles.includes("service-worker.js")) {
    fail("Service Worker resources must not be packaged in the native shell.");
  }
  if (index.indexOf('src="native-bootstrap.js"') > index.indexOf('src="app.js"')) {
    fail("Native bootstrap must run before app.js.");
  }
  if (!bootstrap.includes("HUILAISHI_NATIVE_ANDROID") || !bootstrap.includes("registration.unregister()")) {
    fail("Native bootstrap does not disable legacy Service Worker registrations.");
  }
  if (!app.includes('if (window.HUILAISHI_NATIVE_ANDROID || window.SINGLE_FILE_BUILD || location.protocol === "file:")')) {
    fail("Staged app.js does not bypass Service Worker setup for Android.");
  }
  if (!app.includes(`options.appVersion || "${VERSION_NAME}"`) || !app.includes(`{ appVersion: "${VERSION_NAME}" }`)) {
    fail(`Staged app.js does not report Android version ${VERSION_NAME}.`);
  }
  if (!compatibilityPage.includes("data-android-compatibility-page") || /<script\b/i.test(compatibilityPage)) {
    fail("Unsupported-WebView page must remain script-free and expose its diagnostic marker.");
  }
  if (app.includes("serviceWorker.register(") || app.includes("service-worker.js")) {
    fail("Staged app.js still contains Service Worker registration code.");
  }
  if (!voicePackManager.includes("if (root.HUILAISHI_NATIVE_ANDROID) return found.url;")
      || !voicePackManager.includes("return !root.HUILAISHI_NATIVE_ANDROID && !isFileProtocol()")) {
    fail("Staged voice-pack manager does not resolve bundled Android assets while blocking pack downloads.");
  }

  await verifySourceFreshness(directory);
  await validateLocalIndexReferences(directory);
  await validateNestedLocalReferences(directory);
  const audioStats = await directoryStats(directory, audioFiles);
  if (audioStats.bytes !== EXPECTED_CORE_AUDIO_BYTES) {
    fail(`Core audio byte count changed: expected ${EXPECTED_CORE_AUDIO_BYTES}, found ${audioStats.bytes}.`);
  }
  const bundledVoiceStats = await verifyBundledL1VoiceAssets(directory, bundledVoice);
  const stats = await directoryStats(directory, actualFiles);
  return {
    ...stats,
    coreAudioFiles: audioStats.files,
    coreAudioBytes: audioStats.bytes,
    bundledVoiceFiles: bundledVoiceStats.files,
    bundledVoiceBytes: bundledVoiceStats.bytes,
  };
}

async function stageNativeWeb() {
  assertGeneratedPath(WEB_DIRECTORY, "native-www");
  await verifyCapacitorConfig();
  const { audioFiles, bundledVoice } = await expectedInventory();
  const indexSource = await readFile(resolveInside(REPOSITORY_ROOT, "index.html"), "utf8");

  await rm(WEB_DIRECTORY, { recursive: true, force: true });
  await mkdir(WEB_DIRECTORY, { recursive: true });
  await writeFile(resolveInside(WEB_DIRECTORY, "index.html"), transformIndex(indexSource), "utf8");
  await writeFile(resolveInside(WEB_DIRECTORY, "native-bootstrap.js"), NATIVE_BOOTSTRAP, "utf8");
  await writeFile(resolveInside(WEB_DIRECTORY, "unsupported-webview.html"), UNSUPPORTED_WEBVIEW_HTML, "utf8");
  for (const relativePath of [...ROOT_RUNTIME_FILES, ...SUPPORT_FILES, ...audioFiles, ...bundledVoice.audioFiles]) {
    await copyRelative(relativePath);
  }
  for (const [relativePath, source] of bundledVoice.manifestSources) {
    const destination = resolveInside(WEB_DIRECTORY, relativePath);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, source, "utf8");
  }

  const stats = await verifyNativeWeb(WEB_DIRECTORY);
  console.log(`[android-package] Staged ${stats.files} files, ${stats.mebibytes} MiB; core audio ${stats.coreAudioFiles} files / ${stats.coreAudioBytes} bytes; bundled L1 word audio ${stats.bundledVoiceFiles} files / ${stats.bundledVoiceBytes} bytes.`);
}

function addPermissions(manifest) {
  let updated = manifest;
  for (const permission of REQUIRED_PERMISSIONS) {
    if (updated.includes(`android:name=\"${permission}\"`)) continue;
    const applicationMatch = /^([ \t]*)<application\b/m.exec(updated);
    if (!applicationMatch || applicationMatch.index === undefined) fail("Android manifest has no <application> element.");
    const declaration = `${applicationMatch[1]}<uses-permission android:name=\"${permission}\" />\n`;
    updated = `${updated.slice(0, applicationMatch.index)}${declaration}${updated.slice(applicationMatch.index)}`;
  }
  return updated;
}

function setActivityAttributes(activity, attributes) {
  const openingMatch = /<(?:activity|provider|service)\b[^>]*>/m.exec(activity);
  if (!openingMatch || openingMatch.index === undefined) fail("Malformed Android component declaration.");
  let opening = openingMatch[0];
  for (const [name, value] of Object.entries(attributes)) {
    const pattern = new RegExp(`\\bandroid:${name}\\s*=\\s*["'][^"']*["']`);
    if (pattern.test(opening)) {
      opening = opening.replace(pattern, `android:${name}="${value}"`);
    } else {
      opening = opening.replace(/>$/, `\n            android:${name}="${value}">`);
    }
  }
  return `${activity.slice(0, openingMatch.index)}${opening}${activity.slice(openingMatch.index + openingMatch[0].length)}`;
}

function configureNativeApplication(manifest) {
  const applicationMatch = /<application\b[^>]*>/m.exec(manifest);
  if (!applicationMatch || applicationMatch.index === undefined) {
    fail("Android manifest has no <application> element.");
  }

  let application = applicationMatch[0];
  if (/\bandroid:hardwareAccelerated\s*=/.test(application)) {
    application = application.replace(
      /\bandroid:hardwareAccelerated\s*=\s*["'][^"']*["']/,
      'android:hardwareAccelerated="true"',
    );
  } else {
    application = application.replace(/>$/, '\n        android:hardwareAccelerated="true">');
  }

  let updated = `${manifest.slice(0, applicationMatch.index)}${application}${manifest.slice(applicationMatch.index + applicationMatch[0].length)}`;

  const existingLauncher = /\n?[ \t]*<activity\b(?=[^>]*\bandroid:name\s*=\s*["']\.LauncherActivity["'])[^>]*>[\s\S]*?<\/activity>\s*/m;
  updated = updated.replace(existingLauncher, "\n");
  const existingCourse = /\n?[ \t]*<activity\b(?=[^>]*\bandroid:name\s*=\s*["']\.CourseActivity["'])(?:[^>]*?\/>|[^>]*>[\s\S]*?<\/activity>)\s*/m;
  updated = updated.replace(existingCourse, "\n");
  const existingCourseWatch = /\n?[ \t]*<service\b(?=[^>]*\bandroid:name\s*=\s*["']\.CourseProcessWatchService["'])(?:[^>]*?\/>|[^>]*>[\s\S]*?<\/service>)\s*/m;
  updated = updated.replace(existingCourseWatch, "\n");
  const existingStartupProvider = /\n?[ \t]*<provider\b(?=[^>]*\bandroid:name\s*=\s*["']androidx\.startup\.InitializationProvider["'])(?:[^>]*?\/>|[^>]*>[\s\S]*?<\/provider>)\s*/m;
  updated = updated.replace(existingStartupProvider, "\n");
  const mainPattern = /<activity\b(?=[^>]*\bandroid:name\s*=\s*["']\.MainActivity["'])[^>]*>[\s\S]*?<\/activity>/m;
  const mainMatch = mainPattern.exec(updated);
  if (!mainMatch || mainMatch.index === undefined) fail("Android manifest has no .MainActivity declaration.");

  let mainActivity = mainMatch[0]
    .replace(/\s*<intent-filter>[\s\S]*?<\/intent-filter>\s*/g, "\n")
    .replace(
      /\bandroid:theme\s*=\s*["'][^"']*["']/,
      'android:theme="@android:style/Theme.Material.Light.NoActionBar"',
    );
  mainActivity = setActivityAttributes(mainActivity, {
    exported: "false",
    launchMode: "standard",
    process: APP_ID,
    taskAffinity: APP_ID,
    hardwareAccelerated: "false",
    noHistory: "true",
    excludeFromRecents: "true",
  });
  const courseActivity = `
        <activity
            android:name=".CourseActivity"
            android:label="@string/title_activity_main"
            android:theme="@style/AppTheme.NoActionBar"
            android:launchMode="standard"
            android:process=":course"
            android:taskAffinity="${APP_ID}.safe"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode|navigation|density"
            android:screenOrientation="portrait"
            android:hardwareAccelerated="true"
            android:exported="false" />`;
  const launcherActivity = `
        <activity
            android:name=".LauncherActivity"
            android:label="@string/title_activity_main"
            android:theme="@android:style/Theme.Material.Light.NoActionBar"
            android:launchMode="singleTask"
            android:taskAffinity="${APP_ID}.safe"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode|navigation|density"
            android:screenOrientation="portrait"
            android:hardwareAccelerated="false"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>`;
  const courseWatchService = `
        <service
            android:name=".CourseProcessWatchService"
            android:process=":course"
            android:exported="false"
            android:stopWithTask="true" />`;
  const startupProvider = `
        <provider
            android:name="androidx.startup.InitializationProvider"
            android:authorities="${APP_ID}.androidx-startup"
            android:process=":course"
            android:exported="false" />`;
  const replacement = `${mainActivity}\n${courseActivity}\n${launcherActivity}\n${courseWatchService}\n${startupProvider}`;
  updated = `${updated.slice(0, mainMatch.index)}${replacement}${updated.slice(mainMatch.index + mainMatch[0].length)}`;

  const fileProviderMatch = /<provider\b(?=[^>]*\bandroid:name\s*=\s*["']androidx\.core\.content\.FileProvider["'])[^>]*>/m.exec(updated);
  if (!fileProviderMatch || fileProviderMatch.index === undefined) fail("Android manifest has no FileProvider declaration.");
  const isolatedFileProvider = setActivityAttributes(fileProviderMatch[0], { process: ":course" });
  return `${updated.slice(0, fileProviderMatch.index)}${isolatedFileProvider}${updated.slice(fileProviderMatch.index + fileProviderMatch[0].length)}`;
}

async function installNativeCrashGuard() {
  for (const fileName of ["LauncherActivity.java", "MainActivity.java", "CourseActivity.java", "CourseProcessWatchService.java", "ExitInfoApi30.java"]) {
    const templatePath = path.join(NATIVE_TEMPLATE_DIRECTORY, fileName);
    if (!(await fileExists(templatePath))) {
      fail(`Tracked Android native template is missing: ${fileName}`);
    }
    const destination = nativeSourcePath(fileName);
    const template = await readFile(templatePath, "utf8");
    const source = replaceExactly(
      template,
      "__ANDROID_PACKAGE__",
      APP_ID,
      1,
      `${fileName} package substitution`,
    );
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, source, "utf8");
  }
}

function setAndroidVersionAndIdentity(gradle) {
  if (!/\bversionCode\s*(?:=\s*)?\d+/.test(gradle)) fail("Could not find versionCode in app/build.gradle.");
  if (!/\bversionName\s*(?:=\s*)?[\"'][^\"']*[\"']/.test(gradle)) fail("Could not find versionName in app/build.gradle.");
  if (!/\bnamespace\s*(?:=\s*)?[\"'][^\"']*[\"']/.test(gradle)) fail("Could not find namespace in app/build.gradle.");
  if (!/\bapplicationId\s*(?:=\s*)?[\"'][^\"']*[\"']/.test(gradle)) fail("Could not find applicationId in app/build.gradle.");
  let updated = gradle
    .replace(/\bnamespace\s*(?:=\s*)?[\"'][^\"']*[\"']/, `namespace = "${APP_ID}"`)
    .replace(/\bapplicationId\s*(?:=\s*)?[\"'][^\"']*[\"']/, `applicationId "${APP_ID}"`)
    .replace(/\bversionCode\s*(?:=\s*)?\d+/, `versionCode = ${VERSION_CODE}`)
    .replace(/\bversionName\s*(?:=\s*)?[\"'][^\"']*[\"']/, `versionName = \"${VERSION_NAME}\"`);
  const webkitDependency = 'implementation "androidx.webkit:webkit:$androidxWebkitVersion"';
  if (!updated.includes(webkitDependency)) {
    updated = replaceExactly(
      updated,
      "dependencies {",
      `dependencies {\n    ${webkitDependency}`,
      1,
      "AndroidX WebKit app compile dependency",
    );
  }
  return updated;
}

function setAndroidStrings(strings) {
  const replacements = {
    app_name: APP_NAME,
    title_activity_main: APP_NAME,
    package_name: APP_ID,
    custom_url_scheme: APP_ID,
  };
  let updated = strings;
  for (const [name, value] of Object.entries(replacements)) {
    const pattern = new RegExp(`(<string\\s+name=["']${name}["']>)[\\s\\S]*?(<\\/string>)`);
    if (!pattern.test(updated)) fail(`Android strings.xml has no ${name}.`);
    updated = updated.replace(pattern, `$1${value}$2`);
  }
  return updated;
}

async function configureAndroid() {
  if (!(await fileExists(ANDROID_MANIFEST)) || !(await fileExists(APP_GRADLE)) || !(await fileExists(ANDROID_STRINGS))) {
    fail("Generated Android project is missing. Run `cap add android` first.");
  }
  await verifyCapacitorConfig();
  const manifest = await readFile(ANDROID_MANIFEST, "utf8");
  await writeFile(ANDROID_MANIFEST, configureNativeApplication(addPermissions(manifest)), "utf8");
  await writeFile(APP_GRADLE, setAndroidVersionAndIdentity(await readFile(APP_GRADLE, "utf8")), "utf8");
  await writeFile(ANDROID_STRINGS, setAndroidStrings(await readFile(ANDROID_STRINGS, "utf8")), "utf8");
  await installNativeCrashGuard();
  await verifyAndroid();
  console.log(`[android-package] Configured Android ${VERSION_NAME} (${VERSION_CODE}).`);
}

async function verifyAndroid() {
  await verifyCapacitorConfig();
  const stagedStats = await verifyNativeWeb(WEB_DIRECTORY);
  const manifest = await readFile(ANDROID_MANIFEST, "utf8");
  for (const permission of REQUIRED_PERMISSIONS) {
    const occurrences = manifest.split(`android:name=\"${permission}\"`).length - 1;
    if (occurrences !== 1) fail(`Expected exactly one ${permission} declaration; found ${occurrences}.`);
  }
  if (!/<application\b[^>]*\bandroid:hardwareAccelerated\s*=\s*["']true["'][^>]*>/m.test(manifest)) {
    fail("Application default must remain explicit while native and course activities override hardware acceleration.");
  }
  const launcherActivityManifest = /<activity\b(?=[^>]*\bandroid:name\s*=\s*["']\.LauncherActivity["'])[^>]*>[\s\S]*?<\/activity>/m.exec(manifest)?.[0] || "";
  if (!/\bandroid:exported\s*=\s*["']true["']/.test(launcherActivityManifest)
      || !/\bandroid:launchMode\s*=\s*["']singleTask["']/.test(launcherActivityManifest)
      || !/\bandroid:screenOrientation\s*=\s*["']portrait["']/.test(launcherActivityManifest)
      || !/\bandroid:hardwareAccelerated\s*=\s*["']false["']/.test(launcherActivityManifest)
      || !/\bandroid:theme\s*=\s*["']@android:style\/Theme\.Material\.Light\.NoActionBar["']/.test(launcherActivityManifest)
      || !new RegExp(`\\bandroid:taskAffinity\\s*=\\s*["']${APP_ID.replaceAll(".", "\\.")}\\.safe["']`).test(launcherActivityManifest)
      || /\bandroid:process\s*=/.test(launcherActivityManifest)
      || !/android.intent.category.LAUNCHER/.test(launcherActivityManifest)) {
    fail("LauncherActivity must be the exported portrait launcher crash-loop guard.");
  }
  const mainActivityManifest = /<activity\b(?=[^>]*\bandroid:name\s*=\s*["']\.MainActivity["'])[^>]*>[\s\S]*?<\/activity>/m.exec(manifest)?.[0] || "";
  if (!/\bandroid:exported\s*=\s*["']false["']/.test(mainActivityManifest)
      || !new RegExp(`\\bandroid:process\\s*=\\s*["']${APP_ID.replaceAll(".", "\\.")}["']`).test(mainActivityManifest)
      || !new RegExp(`\\bandroid:taskAffinity\\s*=\\s*["']${APP_ID.replaceAll(".", "\\.")}["']`).test(mainActivityManifest)
      || !/\bandroid:launchMode\s*=\s*["']standard["']/.test(mainActivityManifest)
      || !/\bandroid:hardwareAccelerated\s*=\s*["']false["']/.test(mainActivityManifest)
      || !/\bandroid:noHistory\s*=\s*["']true["']/.test(mainActivityManifest)
      || !/\bandroid:excludeFromRecents\s*=\s*["']true["']/.test(mainActivityManifest)
      || !/\bandroid:theme\s*=\s*["']@android:style\/Theme\.Material\.Light\.NoActionBar["']/.test(mainActivityManifest)
      || /android.intent.category.LAUNCHER/.test(mainActivityManifest)) {
    fail("MainActivity must remain a WebView-free migration component in the historical process and task.");
  }
  const courseActivityManifest = /<activity\b(?=[^>]*\bandroid:name\s*=\s*["']\.CourseActivity["'])[^>]*\/>/m.exec(manifest)?.[0] || "";
  if (!/\bandroid:exported\s*=\s*["']false["']/.test(courseActivityManifest)
      || !/\bandroid:process\s*=\s*["']:course["']/.test(courseActivityManifest)
      || !/\bandroid:launchMode\s*=\s*["']standard["']/.test(courseActivityManifest)
      || !/\bandroid:screenOrientation\s*=\s*["']portrait["']/.test(courseActivityManifest)
      || !/\bandroid:hardwareAccelerated\s*=\s*["']true["']/.test(courseActivityManifest)
      || !new RegExp(`\\bandroid:taskAffinity\\s*=\\s*["']${APP_ID.replaceAll(".", "\\.")}\\.safe["']`).test(courseActivityManifest)
      || /android.intent.category.LAUNCHER/.test(courseActivityManifest)) {
    fail("CourseActivity must be the private hardware-capable host in :course and the portrait-locked safe task.");
  }
  const courseWatchManifest = /<service\b(?=[^>]*\bandroid:name\s*=\s*["']\.CourseProcessWatchService["'])[^>]*\/>/m.exec(manifest)?.[0] || "";
  if (!/\bandroid:exported\s*=\s*["']false["']/.test(courseWatchManifest)
      || !/\bandroid:process\s*=\s*["']:course["']/.test(courseWatchManifest)
      || !/\bandroid:stopWithTask\s*=\s*["']true["']/.test(courseWatchManifest)) {
    fail("CourseProcessWatchService must be a private :course Binder heartbeat.");
  }
  const startupProviderManifest = /<provider\b(?=[^>]*\bandroid:name\s*=\s*["']androidx\.startup\.InitializationProvider["'])[^>]*\/>/m.exec(manifest)?.[0] || "";
  const fileProviderManifest = /<provider\b(?=[^>]*\bandroid:name\s*=\s*["']androidx\.core\.content\.FileProvider["'])[^>]*>/m.exec(manifest)?.[0] || "";
  if (!/\bandroid:process\s*=\s*["']:course["']/.test(startupProviderManifest)
      || !/\bandroid:process\s*=\s*["']:course["']/.test(fileProviderManifest)) {
    fail("AndroidX Startup and FileProvider must not initialize in the native launcher process.");
  }
  const gradle = await readFile(APP_GRADLE, "utf8");
  if (!new RegExp(`\\bversionCode\\s*=\\s*${VERSION_CODE}\\b`).test(gradle)) fail(`versionCode is not ${VERSION_CODE}.`);
  if (!new RegExp(`\\bversionName\\s*=\\s*[\"']${VERSION_NAME.replaceAll(".", "\\.")}[\"']`).test(gradle)) fail(`versionName is not ${VERSION_NAME}.`);
  const escapedAppId = APP_ID.replaceAll(".", "\\.");
  if (!new RegExp(`\\bnamespace\\s*=\\s*["']${escapedAppId}["']`).test(gradle)
      || !new RegExp(`\\bapplicationId\\s*["']${escapedAppId}["']`).test(gradle)) {
    fail(`Gradle namespace/applicationId is not ${APP_ID}.`);
  }
  if (!gradle.includes('implementation "androidx.webkit:webkit:$androidxWebkitVersion"')) {
    fail("App must directly compile against AndroidX WebKit for provider diagnostics.");
  }

  const strings = await readFile(ANDROID_STRINGS, "utf8");
  if (!strings.includes(`<string name="app_name">${APP_NAME}</string>`)
      || !strings.includes(`<string name="package_name">${APP_ID}</string>`)) {
    fail("Android label or package strings do not match the selected variant.");
  }

  const courseActivity = await readFile(nativeSourcePath("CourseActivity.java"), "utf8").catch(() => "");
  const requiredCrashGuardMarkers = [
    'GUARD_REVISION = "12.2.7-stale-task-guard-3"',
    "bridgeBuilder.addWebViewListener",
    "onRenderProcessGone",
    "return handleRendererGone",
    "webView.destroy()",
    "PREF_START_PENDING",
    "returnToLauncher",
    'setResult(RESULT_OK, courseResult("PAGE_VISIBLE"',
    "View.LAYER_TYPE_SOFTWARE",
    'WebView.setDataDirectorySuffix("huilaishi_course")',
    "setRendererPriorityPolicy",
    'TAG = "HuilaishiCourse"',
    "FORCE_RENDERER_CRASH",
    "FORCE_COURSE_PROCESS_DEATH",
    "catch (Throwable startupFailure)",
  ];
  for (const marker of requiredCrashGuardMarkers) {
    if (!courseActivity.includes(marker)) fail(`CourseActivity native crash guard is missing marker: ${marker}`);
  }
  const mainActivity = await readFile(nativeSourcePath("MainActivity.java"), "utf8").catch(() => "");
  for (const marker of ["extends Activity", "STALE_UPGRADE_TASK_REDIRECT", "FLAG_ACTIVITY_CLEAR_TASK", "ActivityManager.AppTask", "finishAndRemoveTask", "getApplicationContext().startActivity", '".LauncherActivity"']) {
    if (!mainActivity.includes(marker)) fail(`MainActivity migration redirect is missing marker: ${marker}`);
  }
  for (const forbidden of ["android.webkit", "androidx.webkit", "BridgeActivity", "Capacitor", "new WebView"]) {
    if (mainActivity.includes(forbidden)) fail(`MainActivity migration redirect must remain WebView-free: ${forbidden}`);
  }
  const launcherActivity = await readFile(nativeSourcePath("LauncherActivity.java"), "utf8").catch(() => "");
  for (const marker of [
    "previousStartIncomplete",
    "PREF_START_PENDING",
    "showRecovery",
    "startActivityForResult",
    'setClassName(getPackageName(), getPackageName() + ".CourseActivity")',
    "huilaishi-native-landing",
    "huilaishi-native-recovery",
    "huilaishi-enter-course",
    "CourseProcessWatchService",
    "bindService",
    "COURSE_BIND_TIMEOUT_MS",
    "postDelayed(courseBindTimeout, COURSE_BIND_TIMEOUT_MS)",
    "CI_FORCE_STALE_TASK_MIGRATION",
    "maybeRunHistoricalTaskMigrationTest",
    "onServiceDisconnected",
    "FLAG_ACTIVITY_CLEAR_TOP",
    "复制诊断信息",
  ]) {
    if (!launcherActivity.includes(marker)) fail(`LauncherActivity startup guard is missing marker: ${marker}`);
  }
  for (const forbidden of ["android.webkit", "androidx.webkit", "WebViewCompat", "CourseActivity.class", "new WebView"]) {
    if (launcherActivity.includes(forbidden)) fail(`LauncherActivity must remain WebView-free: ${forbidden}`);
  }
  const exitInfoHelper = await readFile(nativeSourcePath("ExitInfoApi30.java"), "utf8").catch(() => "");
  if (!exitInfoHelper.includes("ApplicationExitInfo")
      || !exitInfoHelper.includes("getHistoricalProcessExitReasons")
      || launcherActivity.includes("ApplicationExitInfo")) {
    fail("API 30 exit diagnostics must be isolated from the launcher class verifier.");
  }
  const courseWatchService = await readFile(nativeSourcePath("CourseProcessWatchService.java"), "utf8").catch(() => "");
  for (const marker of ["extends Service", "new Binder()", "return heartbeat"]) {
    if (!courseWatchService.includes(marker)) fail(`Course Binder heartbeat is missing marker: ${marker}`);
  }
  for (const forbidden of ["android.webkit", "androidx.webkit", "WebViewCompat", "new WebView"]) {
    if (courseWatchService.includes(forbidden)) fail(`Course Binder heartbeat must remain WebView-free: ${forbidden}`);
  }

  const packagedStats = await verifyNativeWeb(PACKAGED_WEB_DIRECTORY, { packaged: true });
  console.log(`[android-package] Verification passed; staged ${stagedStats.mebibytes} MiB, packaged web ${packagedStats.mebibytes} MiB.`);
}

const command = process.argv[2];
if (command === "prepare") await prepareAndroidVariant();
else if (command === "stage") await stageNativeWeb();
else if (command === "configure") await configureAndroid();
else if (command === "verify") await verifyAndroid();
else fail("Usage: node scripts/configure-android.mjs <prepare|stage|configure|verify>");
