import { execFile as execFileCallback } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);
const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(SCRIPT_DIRECTORY, "..");
const WEB_DIRECTORY = path.join(REPOSITORY_ROOT, "native-www");
const IOS_DIRECTORY = path.join(REPOSITORY_ROOT, "ios");
const IOS_APP_DIRECTORY = path.join(IOS_DIRECTORY, "App", "App");
const IOS_PUBLIC_DIRECTORY = path.join(IOS_APP_DIRECTORY, "public");
const IOS_PROJECT = path.join(IOS_DIRECTORY, "App", "App.xcodeproj", "project.pbxproj");
const IOS_INFO_PLIST = path.join(IOS_APP_DIRECTORY, "Info.plist");
const IOS_PRIVACY_MANIFEST = path.join(IOS_APP_DIRECTORY, "PrivacyInfo.xcprivacy");
const IOS_LAUNCH_SCREEN = path.join(IOS_APP_DIRECTORY, "Base.lproj", "LaunchScreen.storyboard");
const IOS_APP_ICON = path.join(IOS_APP_DIRECTORY, "Assets.xcassets", "AppIcon.appiconset", "AppIcon-512@2x.png");
const CAPACITOR_CONFIG = path.join(REPOSITORY_ROOT, "capacitor.config.json");
const PACKAGE = JSON.parse(await readFile(path.join(REPOSITORY_ROOT, "package.json"), "utf8"));

const APP_ID = "com.huilaishi.app";
const APP_NAME = "会来事";
const VERSION_NAME = String(PACKAGE.version);
const versionParts = VERSION_NAME.split(".").map(Number);
if (versionParts.length !== 3 || versionParts.some(part => !Number.isInteger(part) || part < 0)) {
  throw new Error(`[ios-package] package.json version must be major.minor.patch; found ${VERSION_NAME}.`);
}
const DEFAULT_BUILD_NUMBER = versionParts[0] * 10000 + versionParts[1] * 100 + versionParts[2];
const BUILD_NUMBER = String(process.env.HUILAISHI_IOS_BUILD_NUMBER || DEFAULT_BUILD_NUMBER);
if (!/^[1-9]\d*$/.test(BUILD_NUMBER)) {
  throw new Error(`[ios-package] HUILAISHI_IOS_BUILD_NUMBER must be a positive integer; found ${BUILD_NUMBER}.`);
}

const EXPECTED_CORE_AUDIO_COUNT = 696;
const EXPECTED_CORE_AUDIO_BYTES = 23_320_920;
const EXPECTED_L1_AUDIO_COUNT = 1_000;
const EXPECTED_L1_AUDIO_BYTES = 10_472_904;
const BUNDLED_DIRECTIONS = ["zh-th", "th-zh"];
const CAPACITOR_GENERATED_WEB_FILES = new Set(["cordova.js", "cordova_plugins.js"]);

const POLICY_AND_SUPPORT_FILES = [
  "PRIVACY.md",
  "SAFETY.md",
  "TERMS.md",
  "VOICE_ASSET_PROVENANCE.md",
  "partner/manual-peer.js",
  "vendor/THIRD_PARTY_NOTICES.md",
  "vendor/licenses/canvas-confetti-1.9.4-ISC.txt",
  "vendor/licenses/chinese-open-wordnet-2.0.txt",
  "vendor/licenses/driver.js-1.8.0-MIT.txt",
  "vendor/licenses/fft.js-4.0.4-MIT.txt",
  "vendor/licenses/pitchy-4.1.0-MIT.txt",
  "vendor/licenses/princeton-wordnet-3.0.txt",
  "vendor/licenses/thai-wordnet-2.0.txt",
];

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
  Object.defineProperty(globalThis, "HUILAISHI_NATIVE_IOS", {
    configurable: false,
    enumerable: true,
    writable: false,
    value: true
  });

  // Capacitor serves every bundled file from its local asset server. Remove a
  // registration left by an older web install and never add a second cache
  // layer inside the native WKWebView.
  const worker = globalThis.navigator?.serviceWorker;
  if (!worker || typeof worker.getRegistrations !== "function") return;
  worker.getRegistrations()
    .then(registrations => Promise.all(registrations.map(registration => registration.unregister())))
    .catch(() => {});
})();
`;

const NATIVE_ERROR_HTML = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="#f6f1e7" />
  <title>会来事 · 启动恢复</title>
  <style>*{box-sizing:border-box}html,body{min-height:100%;margin:0}body{display:grid;place-items:center;padding:28px;background:#f6f1e7;color:#173b34;font-family:system-ui,-apple-system,"Noto Sans SC","Noto Sans Thai",sans-serif}.card{width:min(100%,430px);padding:28px 24px;border:1px solid #c8d3cc;border-radius:26px;background:#fffdf8;box-shadow:0 18px 48px rgba(23,59,52,.12)}.mark{display:grid;place-items:center;width:54px;height:54px;border-radius:18px;background:#176f60;color:white;font-size:26px;font-weight:800}h1{margin:22px 0 10px;font-size:28px;line-height:1.18}p{margin:10px 0;color:#526660;line-height:1.65}.th{margin-top:18px;padding-top:18px;border-top:1px solid #dfe7e2}</style>
</head>
<body><main class="card" data-ios-recovery-page><div class="mark">来</div><h1>课程暂时没有载入</h1><p>请彻底关闭会来事后重新打开。学习进度只保存在本机，不会因为重启应用而清除。</p><div class="th" lang="th"><h1>ยังเปิดบทเรียนไม่ได้</h1><p>โปรดปิดแอปให้สนิทแล้วเปิดใหม่ ความคืบหน้ายังคงอยู่ในอุปกรณ์</p></div></main></body>
</html>
`;

const INFO_PLIST = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CAPACITOR_DEBUG</key>
  <string>$(CAPACITOR_DEBUG)</string>
  <key>CFBundleDevelopmentRegion</key>
  <string>zh_CN</string>
  <key>CFBundleDisplayName</key>
  <string>会来事</string>
  <key>CFBundleExecutable</key>
  <string>$(EXECUTABLE_NAME)</string>
  <key>CFBundleIdentifier</key>
  <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
  <key>CFBundleInfoDictionaryVersion</key>
  <string>6.0</string>
  <key>CFBundleName</key>
  <string>$(PRODUCT_NAME)</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>CFBundleShortVersionString</key>
  <string>$(MARKETING_VERSION)</string>
  <key>CFBundleVersion</key>
  <string>$(CURRENT_PROJECT_VERSION)</string>
  <key>LSRequiresIPhoneOS</key>
  <true/>
  <key>NSMicrophoneUsageDescription</key>
  <string>用于在本机录制跟读和语伴语音；发送前可预听，应用不会自动上传。 / ใช้บันทึกเสียงฝึกพูดและข้อความเสียงบนอุปกรณ์ โดยฟังก่อนส่งได้และแอปจะไม่อัปโหลดเอง</string>
  <key>NSSpeechRecognitionUsageDescription</key>
  <string>用于你主动开始的发音识别练习；是否离线由设备能力决定，应用不会静默启动识别。 / ใช้เฉพาะเมื่อคุณเริ่มฝึกการรู้จำเสียง และแอปจะไม่เปิดการรู้จำเอง</string>
  <key>UIApplicationSceneManifest</key>
  <dict>
    <key>UIApplicationSupportsMultipleScenes</key>
    <false/>
    <key>UISceneConfigurations</key>
    <dict>
      <key>UIWindowSceneSessionRoleApplication</key>
      <array>
        <dict>
          <key>UISceneConfigurationName</key>
          <string>Default Configuration</string>
          <key>UISceneDelegateClassName</key>
          <string>$(PRODUCT_MODULE_NAME).SceneDelegate</string>
          <key>UISceneStoryboardFile</key>
          <string>Main</string>
        </dict>
      </array>
    </dict>
  </dict>
  <key>UILaunchStoryboardName</key>
  <string>LaunchScreen</string>
  <key>UIMainStoryboardFile</key>
  <string>Main</string>
  <key>UISupportedInterfaceOrientations</key>
  <array><string>UIInterfaceOrientationPortrait</string></array>
  <key>UISupportedInterfaceOrientations~ipad</key>
  <array><string>UIInterfaceOrientationPortrait</string><string>UIInterfaceOrientationPortraitUpsideDown</string></array>
  <key>UIDesignRequiresCompatibility</key>
  <true/>
  <key>UIViewControllerBasedStatusBarAppearance</key>
  <true/>
</dict>
</plist>
`;

const PRIVACY_MANIFEST = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>NSPrivacyTracking</key>
  <false/>
  <key>NSPrivacyTrackingDomains</key>
  <array/>
  <key>NSPrivacyCollectedDataTypes</key>
  <array/>
  <key>NSPrivacyAccessedAPITypes</key>
  <array/>
</dict>
</plist>
`;

const LAUNCH_SCREEN = `<?xml version="1.0" encoding="UTF-8"?>
<document type="com.apple.InterfaceBuilder3.CocoaTouch.Storyboard.XIB" version="3.0" toolsVersion="23096" targetRuntime="iOS.CocoaTouch" propertyAccessControl="none" useAutolayout="YES" launchScreen="YES" useTraitCollections="YES" useSafeAreas="YES" colorMatched="YES" initialViewController="launch-controller">
  <device id="retina6_12" orientation="portrait" appearance="light"/>
  <dependencies><plugIn identifier="com.apple.InterfaceBuilder.IBCocoaTouchPlugin" version="23084"/><capability name="Safe area layout guides" minToolsVersion="9.0"/><capability name="System colors in document resources" minToolsVersion="11.0"/><capability name="documents saved in the Xcode 8 format" minToolsVersion="8.0"/></dependencies>
  <scenes>
    <scene sceneID="launch-scene">
      <objects>
        <viewController id="launch-controller" sceneMemberID="viewController">
          <view key="view" contentMode="scaleToFill" id="launch-view">
            <rect key="frame" x="0.0" y="0.0" width="393" height="852"/>
            <autoresizingMask key="autoresizingMask" widthSizable="YES" heightSizable="YES"/>
            <subviews>
              <label opaque="NO" userInteractionEnabled="NO" contentMode="left" text="来" textAlignment="center" lineBreakMode="tailTruncation" translatesAutoresizingMaskIntoConstraints="NO" id="launch-mark">
                <rect key="frame" x="159" y="337" width="75" height="75"/>
                <color key="backgroundColor" red="0.784" green="1" blue="0.290" alpha="1" colorSpace="custom" customColorSpace="sRGB"/>
                <fontDescription key="fontDescription" type="boldSystem" pointSize="38"/>
                <color key="textColor" red="0.043" green="0.063" blue="0.125" alpha="1" colorSpace="custom" customColorSpace="sRGB"/>
              </label>
              <label opaque="NO" userInteractionEnabled="NO" contentMode="left" text="会来事" textAlignment="center" translatesAutoresizingMaskIntoConstraints="NO" id="launch-title"><rect key="frame" x="139" y="433" width="115" height="39"/><fontDescription key="fontDescription" type="boldSystem" pointSize="30"/><color key="textColor" red="0.090" green="0.200" blue="0.180" alpha="1" colorSpace="custom" customColorSpace="sRGB"/></label>
              <label opaque="NO" userInteractionEnabled="NO" contentMode="left" text="พูดให้เป็น · 中泰双向学习" textAlignment="center" translatesAutoresizingMaskIntoConstraints="NO" id="launch-subtitle"><rect key="frame" x="110" y="481" width="173" height="21"/><fontDescription key="fontDescription" type="system" pointSize="14"/><color key="textColor" red="0.322" green="0.400" blue="0.376" alpha="1" colorSpace="custom" customColorSpace="sRGB"/></label>
            </subviews>
            <viewLayoutGuide key="safeArea" id="launch-safe"/>
            <color key="backgroundColor" red="0.965" green="0.945" blue="0.906" alpha="1" colorSpace="custom" customColorSpace="sRGB"/>
            <constraints>
              <constraint firstItem="launch-mark" firstAttribute="centerX" secondItem="launch-view" secondAttribute="centerX" id="mark-x"/><constraint firstItem="launch-mark" firstAttribute="centerY" secondItem="launch-view" secondAttribute="centerY" constant="-52" id="mark-y"/><constraint firstItem="launch-mark" firstAttribute="width" constant="75" id="mark-w"/><constraint firstItem="launch-mark" firstAttribute="height" constant="75" id="mark-h"/>
              <constraint firstItem="launch-title" firstAttribute="top" secondItem="launch-mark" secondAttribute="bottom" constant="21" id="title-y"/><constraint firstItem="launch-title" firstAttribute="centerX" secondItem="launch-view" secondAttribute="centerX" id="title-x"/>
              <constraint firstItem="launch-subtitle" firstAttribute="top" secondItem="launch-title" secondAttribute="bottom" constant="8" id="subtitle-y"/><constraint firstItem="launch-subtitle" firstAttribute="centerX" secondItem="launch-view" secondAttribute="centerX" id="subtitle-x"/>
            </constraints>
          </view>
        </viewController>
        <placeholder placeholderIdentifier="IBFirstResponder" id="launch-responder" sceneMemberID="firstResponder"/>
      </objects>
    </scene>
  </scenes>
</document>
`;

function fail(message) {
  throw new Error(`[ios-package] ${message}`);
}

function normalizeRelativePath(value) {
  const normalized = String(value || "").replaceAll("\\", "/").replace(/^\.\//, "");
  if (!normalized || normalized.startsWith("/") || normalized.includes("\0")) fail(`Invalid relative path: ${value}`);
  const canonical = path.posix.normalize(normalized);
  if (canonical !== normalized || canonical === ".." || canonical.startsWith("../")) fail(`Path escapes package root: ${value}`);
  return normalized;
}

function resolveInside(root, relativePath) {
  const normalized = normalizeRelativePath(relativePath);
  const resolved = path.resolve(root, ...normalized.split("/"));
  if (!resolved.startsWith(`${path.resolve(root)}${path.sep}`)) fail(`Resolved path escapes package root: ${relativePath}`);
  return resolved;
}

function assertGeneratedPath(candidate, expectedName) {
  const resolved = path.resolve(candidate);
  if (path.dirname(resolved) !== REPOSITORY_ROOT || path.basename(resolved) !== expectedName) {
    fail(`Refusing to modify unexpected generated path: ${resolved}`);
  }
}

async function isFile(filePath) {
  try { return (await stat(filePath)).isFile(); } catch { return false; }
}

function replaceExactly(source, search, replacement, expectedCount, label) {
  const count = source.split(search).length - 1;
  if (count !== expectedCount) fail(`${label}: expected ${expectedCount} match(es), found ${count}.`);
  return source.split(search).join(replacement);
}

function replacePatternExactly(source, pattern, replacement, expectedCount, label) {
  const matches = [...source.matchAll(pattern)];
  if (matches.length !== expectedCount) fail(`${label}: expected ${expectedCount} match(es), found ${matches.length}.`);
  return source.replace(pattern, replacement);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function verifyCapacitorConfig() {
  const config = JSON.parse(await readFile(CAPACITOR_CONFIG, "utf8"));
  if (config.appId !== APP_ID || config.appName !== APP_NAME || config.webDir !== "native-www") {
    fail(`Capacitor config must use ${APP_ID}, ${APP_NAME}, and native-www.`);
  }
  if (config.server?.errorPath !== "unsupported-webview.html") fail("Capacitor errorPath must remain packaged and relative.");
  if (config.ios?.backgroundColor !== "#f6f1e7" || config.ios?.contentInset !== "automatic") {
    fail("Capacitor iOS backgroundColor/contentInset are missing.");
  }
}

function parseCoreAudioFiles(pronunciationSource, cuteSource) {
  const pronunciationMatch = pronunciationSource.match(/globalThis\.PRONUNCIATION_AUDIO\s*=\s*(\{[\s\S]*?\})\s*;/);
  const cuteMatch = cuteSource.match(/\/\* CUTE_AUDIO_ENTRIES_START \*\/\s*(\[[\s\S]*?\])\s*\/\* CUTE_AUDIO_ENTRIES_END \*\//);
  if (!pronunciationMatch || !cuteMatch) fail("Could not parse the core audio maps.");
  const files = new Set(ROOT_AUDIO_FILES);
  for (const source of Object.values(JSON.parse(pronunciationMatch[1]))) files.add(normalizeRelativePath(source));
  for (const entry of JSON.parse(cuteMatch[1])) files.add(normalizeRelativePath(`assets/audio/cute-content/${entry.file}`));
  const result = [...files].sort();
  if (result.length !== EXPECTED_CORE_AUDIO_COUNT) fail(`Expected ${EXPECTED_CORE_AUDIO_COUNT} core audio files; found ${result.length}.`);
  return result;
}

async function runtimeFiles(indexSource) {
  const files = new Set(POLICY_AND_SUPPORT_FILES);
  for (const match of indexSource.matchAll(/(?:src|href)=["']([^"']+)["']/gi)) {
    const reference = match[1].split(/[?#]/, 1)[0];
    if (!reference || /^(?:#|data:|https?:|mailto:|tel:)/i.test(reference) || reference === "./" || reference === ".") continue;
    const relativePath = normalizeRelativePath(decodeURIComponent(reference));
    if (relativePath !== "pwa-bootstrap.js") files.add(relativePath);
  }
  const manifest = JSON.parse(await readFile(resolveInside(REPOSITORY_ROOT, "manifest.webmanifest"), "utf8"));
  for (const icon of manifest.icons || []) files.add(normalizeRelativePath(icon.src));
  return [...files].sort();
}

async function buildBundledL1Inventory() {
  const sourceCatalog = JSON.parse(await readFile(resolveInside(REPOSITORY_ROOT, "voice-packs/manifest.json"), "utf8"));
  const audioFiles = [];
  const manifestSources = new Map();
  const packSummaries = [];
  let totalBytes = 0;

  for (const direction of BUNDLED_DIRECTIONS) {
    const packId = `${direction}-l1`;
    const manifestPath = `voice-packs/v11-standard/${direction}/l1/manifest.json`;
    const sourceManifest = JSON.parse(await readFile(resolveInside(REPOSITORY_ROOT, manifestPath), "utf8"));
    const entries = [];
    let packBytes = 0;
    for (const sourceEntry of sourceManifest.entries || []) {
      if (!sourceEntry.ready || !sourceEntry.kinds?.includes("word")) continue;
      const aliases = (sourceEntry.aliases || []).filter(alias => /:word:(?:zh|th)$/.test(alias));
      if (!aliases.length) fail(`Bundled iOS word clip has no word alias: ${packId}/${sourceEntry.id}`);
      const relativePath = path.posix.join(path.posix.dirname(manifestPath), sourceEntry.file);
      const audio = await readFile(resolveInside(REPOSITORY_ROOT, relativePath));
      if (audio.byteLength !== sourceEntry.bytes || sha256(audio) !== sourceEntry.sha256) fail(`L1 audio hash mismatch: ${relativePath}`);
      audioFiles.push(relativePath);
      packBytes += audio.byteLength;
      entries.push({ ...sourceEntry, aliases, kinds: ["word"] });
    }
    if (entries.length !== 500) fail(`${packId} must contain exactly 500 ready word heads.`);
    const manifest = {
      ...sourceManifest,
      learningUse: "pronunciation-model-word-heads",
      nativeBundledScope: "ios-l1-word-heads",
      aliasCount: entries.reduce((sum, entry) => sum + entry.aliases.length, 0),
      clipCount: entries.length,
      readyClipCount: entries.length,
      bytes: packBytes,
      estimatedBytes: packBytes,
      contentHash: sha256(JSON.stringify(entries.map(entry => ({ id: entry.id, text: entry.text, aliases: entry.aliases })))),
      assetHash: sha256(JSON.stringify(entries.map(entry => ({ id: entry.id, file: entry.file, bytes: entry.bytes, sha256: entry.sha256 })))),
      entries,
    };
    manifestSources.set(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    const summary = sourceCatalog.packs?.find(pack => pack.id === packId);
    if (!summary) fail(`Voice catalogue is missing ${packId}.`);
    packSummaries.push({ ...summary, aliasCount: manifest.aliasCount, clipCount: 500, readyClipCount: 500, bytes: packBytes, estimatedBytes: packBytes, nativeBundledScope: manifest.nativeBundledScope });
    totalBytes += packBytes;
  }

  const uniqueAudioFiles = [...new Set(audioFiles)].sort();
  if (uniqueAudioFiles.length !== EXPECTED_L1_AUDIO_COUNT || totalBytes !== EXPECTED_L1_AUDIO_BYTES) {
    fail(`Bundled L1 inventory changed: ${uniqueAudioFiles.length} clips / ${totalBytes} bytes.`);
  }
  const nativeCatalog = {
    ...sourceCatalog,
    kind: "bundled-ios-l1-word-head-voice-packs",
    learningUse: "pronunciation-model-word-heads",
    installModel: "bundled-with-ios-app",
    cachePolicy: "app-bundle local assets; no Cache Storage installation required",
    fileProtocol: "served by the Capacitor local asset server",
    totals: { vocabularySlots: 1000, aliases: 1000, clips: 1000, readyClips: 1000, bytes: totalBytes, estimatedBytes: totalBytes },
    packs: packSummaries,
  };
  nativeCatalog.catalogueHash = sha256(JSON.stringify(packSummaries));
  manifestSources.set("voice-packs/manifest.json", `${JSON.stringify(nativeCatalog, null, 2)}\n`);
  return { audioFiles: uniqueAudioFiles, manifestSources, manifestFiles: [...manifestSources.keys()].sort() };
}

function transformIndex(source) {
  let result = replaceExactly(source, '<script src="pwa-bootstrap.js"></script>', '<script src="native-bootstrap.js"></script>', 1, "iOS bootstrap replacement");
  result = replaceExactly(result, "  <title>会来事 · 中泰双向语言学习</title>", '  <meta name="huilaishi-runtime" content="capacitor-ios" />\n  <title>会来事 · 中泰双向语言学习</title>', 1, "iOS runtime marker");
  if (/(?:src|href)=["']\/(?!\/)/i.test(result)) fail("index.html contains a root-absolute asset path.");
  return result;
}

function transformApp(source) {
  let result = replaceExactly(source, 'Boolean(window.SINGLE_FILE_BUILD) || location.protocol === "file:"', 'Boolean(window.HUILAISHI_NATIVE_IOS) || Boolean(window.SINGLE_FILE_BUILD) || location.protocol === "file:"', 2, "iOS packaged Boolean guards");
  result = replaceExactly(result, 'window.SINGLE_FILE_BUILD || location.protocol === "file:"', 'window.HUILAISHI_NATIVE_IOS || window.SINGLE_FILE_BUILD || location.protocol === "file:"', 2, "iOS packaged guards");
  result = replaceExactly(result, 'const standalone = window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;', 'const standalone = Boolean(window.HUILAISHI_NATIVE_IOS) || window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;', 1, "iOS installed-state guard");
  result = replaceExactly(result, 'serviceWorkerRegistration = await navigator.serviceWorker.register("./service-worker.js", { updateViaCache: "none" });', 'throw new Error("Service Worker is disabled in the iOS native shell.");', 1, "iOS Service Worker hard-disable");
  result = replacePatternExactly(result, /options\.appVersion \|\| "\d+\.\d+\.\d+"/g, `options.appVersion || "${VERSION_NAME}"`, 1, "iOS export version default");
  result = replacePatternExactly(result, /\{ appVersion: "\d+\.\d+\.\d+" \}/g, `{ appVersion: "${VERSION_NAME}" }`, 1, "iOS export version");
  return result
    .replaceAll("当前是单文件离线版；", "当前是 iPhone / iPad 离线安装版；")
    .replaceAll("ขณะนี้เป็นไฟล์ออฟไลน์ไฟล์เดียว", "ขณะนี้เป็นแอป iPhone / iPad แบบออฟไลน์")
    .replaceAll("核心语音已经写入当前单文件离线版，不需要再次缓存。", "核心语音已经内置在 iOS 应用中，不需要再次缓存。")
    .replaceAll("รวมเสียงหลักไว้ในไฟล์ออฟไลน์นี้แล้ว ไม่ต้องบันทึกซ้ำ", "รวมเสียงหลักไว้ในแอป iOS แล้ว ไม่ต้องบันทึกซ้ำ")
    .replaceAll("单文件内置语音属于应用文件本身，不是可清除的设备缓存", "iOS 应用内置语音属于应用本身，不是可清除的设备缓存")
    .replaceAll("เสียงที่ฝังในไฟล์เดี่ยวเป็นส่วนหนึ่งของไฟล์แอป ไม่ใช่แคชอุปกรณ์ที่ล้างได้", "เสียงที่รวมในแอป iOS เป็นส่วนหนึ่งของแอป ไม่ใช่แคชอุปกรณ์ที่ล้างได้");
}

function transformOfflineData(source) {
  return source
    .replaceAll('offlineFileReady: "单文件离线版可用"', 'offlineFileReady: "iOS 离线版可用"')
    .replaceAll('offlineFileReady: "ไฟล์ออฟไลน์พร้อมใช้"', 'offlineFileReady: "แอป iOS ออฟไลน์พร้อมใช้"');
}

function transformVoicePackManager(source) {
  let result = replaceExactly(source, 'return !isFileProtocol() && typeof root.fetch === "function" && "caches" in root && Boolean(root.crypto?.subtle);', 'return !root.HUILAISHI_NATIVE_IOS && !isFileProtocol() && typeof root.fetch === "function" && "caches" in root && Boolean(root.crypto?.subtle);', 1, "iOS voice-pack download guard");
  result = replaceExactly(result, '    if (isFileProtocol()) return null;\n    if ("caches" in root) {', '    if (root.HUILAISHI_NATIVE_IOS) return found.url;\n    if (isFileProtocol()) return null;\n    if ("caches" in root) {', 1, "iOS bundled voice resolver");
  return result;
}

function transformVoicePackUi(source) {
  let result = replaceExactly(source, "const isStandaloneBuild = () => Boolean(window.SINGLE_FILE_BUILD)", "const isStandaloneBuild = () => Boolean(window.HUILAISHI_NATIVE_IOS) || Boolean(window.SINGLE_FILE_BUILD)", 1, "iOS voice UI guard");
  result = replaceExactly(result, 'const disabled = item.state !== "ready" && !item.installed;', 'const disabled = isStandaloneBuild() || (item.state !== "ready" && !item.installed);', 1, "iOS voice action guard");
  result = replaceExactly(result, 'const action = item.installing ? c.cancel : item.installed ? c.delete : item.state === "ready" ? c.install : c.planned;', 'const action = isStandaloneBuild() ? c.offlineAction : item.installing ? c.cancel : item.installed ? c.delete : item.state === "ready" ? c.install : c.planned;', 1, "iOS voice action copy");
  return result
    .replaceAll('unavailable: "仅在线版/PWA 可安装", offlineAction: "仅在线版"', 'unavailable: "L1 词头示范音已随 iOS 应用内置", offlineAction: "L1 已内置"')
    .replaceAll('unavailable: "ใช้ได้ในเวอร์ชันออนไลน์/PWA เท่านั้น", offlineAction: "ออนไลน์เท่านั้น"', 'unavailable: "รวมเสียงคำศัพท์ L1 ไว้ในแอป iOS แล้ว", offlineAction: "มี L1 แล้ว"');
}

async function transformedSource(relativePath) {
  const source = await readFile(resolveInside(REPOSITORY_ROOT, relativePath), "utf8");
  if (relativePath === "app.js") return transformApp(source);
  if (relativePath === "offline-data.js") return transformOfflineData(source);
  if (relativePath === "voice-pack-manager.js") return transformVoicePackManager(source);
  if (relativePath === "voice-pack-ui.js") return transformVoicePackUi(source);
  return null;
}

async function copyRuntimeFile(relativePath) {
  const source = resolveInside(REPOSITORY_ROOT, relativePath);
  const destination = resolveInside(WEB_DIRECTORY, relativePath);
  if (!(await isFile(source))) fail(`Required iOS web resource is missing: ${relativePath}`);
  await mkdir(path.dirname(destination), { recursive: true });
  const transformed = await transformedSource(relativePath);
  if (transformed === null) await copyFile(source, destination);
  else await writeFile(destination, transformed, "utf8");
}

async function listFiles(root, current = root) {
  const entries = await readdir(current, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const absolute = path.join(current, entry.name);
    if (entry.isDirectory()) result.push(...await listFiles(root, absolute));
    else if (entry.isFile()) result.push(path.relative(root, absolute).replaceAll("\\", "/"));
  }
  return result.sort();
}

async function expectedInventory() {
  const indexSource = await readFile(resolveInside(REPOSITORY_ROOT, "index.html"), "utf8");
  const coreAudio = parseCoreAudioFiles(
    await readFile(resolveInside(REPOSITORY_ROOT, "pronunciation-audio-map.js"), "utf8"),
    await readFile(resolveInside(REPOSITORY_ROOT, "cute-audio-map.js"), "utf8"),
  );
  const l1 = await buildBundledL1Inventory();
  const runtime = await runtimeFiles(indexSource);
  return {
    indexSource,
    coreAudio,
    l1,
    runtime,
    files: ["index.html", "native-bootstrap.js", "unsupported-webview.html", ...runtime, ...coreAudio, ...l1.manifestFiles, ...l1.audioFiles].sort(),
  };
}

async function directoryStats(directory, files) {
  let bytes = 0;
  for (const file of files) bytes += (await stat(resolveInside(directory, file))).size;
  return { files: files.length, bytes, mebibytes: Number((bytes / 1024 / 1024).toFixed(2)) };
}

async function verifyWebDirectory(directory, { packaged = false } = {}) {
  const expected = await expectedInventory();
  const actual = await listFiles(directory).catch(() => []);
  const expectedSet = new Set(expected.files);
  const missing = expected.files.filter(file => !actual.includes(file));
  const unexpected = actual.filter(file => !expectedSet.has(file) && !(packaged && CAPACITOR_GENERATED_WEB_FILES.has(file)));
  if (missing.length || unexpected.length) fail(`iOS web inventory mismatch; missing=[${missing.join(", ")}], unexpected=[${unexpected.join(", ")}].`);

  const index = await readFile(resolveInside(directory, "index.html"), "utf8");
  const app = await readFile(resolveInside(directory, "app.js"), "utf8");
  const manager = await readFile(resolveInside(directory, "voice-pack-manager.js"), "utf8");
  if (!index.includes('content="capacitor-ios"') || !index.includes('src="native-bootstrap.js"') || index.includes("pwa-bootstrap.js")) fail("Native iOS index markers are invalid.");
  if (!app.includes("HUILAISHI_NATIVE_IOS") || app.includes("serviceWorker.register(") || app.includes("service-worker.js")) fail("Native iOS app.js still exposes the PWA cache path.");
  if (!manager.includes("if (root.HUILAISHI_NATIVE_IOS) return found.url;")) fail("Native iOS L1 audio resolver is missing.");

  let coreBytes = 0;
  for (const file of expected.coreAudio) coreBytes += (await stat(resolveInside(directory, file))).size;
  if (coreBytes !== EXPECTED_CORE_AUDIO_BYTES) fail(`Core audio byte count changed: ${coreBytes}.`);
  let l1Bytes = 0;
  for (const file of expected.l1.audioFiles) l1Bytes += (await stat(resolveInside(directory, file))).size;
  if (l1Bytes !== EXPECTED_L1_AUDIO_BYTES) fail(`L1 audio byte count changed: ${l1Bytes}.`);
  return directoryStats(directory, actual);
}

async function stage() {
  assertGeneratedPath(WEB_DIRECTORY, "native-www");
  await verifyCapacitorConfig();
  const expected = await expectedInventory();
  await rm(WEB_DIRECTORY, { recursive: true, force: true });
  await mkdir(WEB_DIRECTORY, { recursive: true });
  await writeFile(resolveInside(WEB_DIRECTORY, "index.html"), transformIndex(expected.indexSource), "utf8");
  await writeFile(resolveInside(WEB_DIRECTORY, "native-bootstrap.js"), NATIVE_BOOTSTRAP, "utf8");
  await writeFile(resolveInside(WEB_DIRECTORY, "unsupported-webview.html"), NATIVE_ERROR_HTML, "utf8");
  for (const file of [...expected.runtime, ...expected.coreAudio, ...expected.l1.audioFiles]) await copyRuntimeFile(file);
  for (const [file, source] of expected.l1.manifestSources) {
    const destination = resolveInside(WEB_DIRECTORY, file);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, source, "utf8");
  }
  const stats = await verifyWebDirectory(WEB_DIRECTORY);
  console.log(`[ios-package] Staged ${stats.files} files / ${stats.mebibytes} MiB for iOS ${VERSION_NAME}.`);
}

function addPrivacyManifestToProject(project) {
  if (project.includes("PrivacyInfo.xcprivacy in Resources")) return project;
  let result = replaceExactly(project, "/* End PBXBuildFile section */", "\t\tA10F00000000000000000001 /* PrivacyInfo.xcprivacy in Resources */ = {isa = PBXBuildFile; fileRef = A10F00000000000000000002 /* PrivacyInfo.xcprivacy */; };\n/* End PBXBuildFile section */", 1, "Privacy build file");
  result = replaceExactly(result, "/* End PBXFileReference section */", "\t\tA10F00000000000000000002 /* PrivacyInfo.xcprivacy */ = {isa = PBXFileReference; lastKnownFileType = text.xml; path = PrivacyInfo.xcprivacy; sourceTree = \"<group>\"; };\n/* End PBXFileReference section */", 1, "Privacy file reference");
  result = replaceExactly(result, "\t\t\t\t504EC3131FED79650016851F /* Info.plist */,", "\t\t\t\t504EC3131FED79650016851F /* Info.plist */,\n\t\t\t\tA10F00000000000000000002 /* PrivacyInfo.xcprivacy */,", 1, "Privacy group member");
  result = replaceExactly(result, "\t\t\t\t504EC3121FED79650016851F /* LaunchScreen.storyboard in Resources */,", "\t\t\t\t504EC3121FED79650016851F /* LaunchScreen.storyboard in Resources */,\n\t\t\t\tA10F00000000000000000001 /* PrivacyInfo.xcprivacy in Resources */,", 1, "Privacy resource member");
  return result;
}

function configureProject(source) {
  let result = addPrivacyManifestToProject(source);
  result = replacePatternExactly(result, /CURRENT_PROJECT_VERSION = \d+;/g, `CURRENT_PROJECT_VERSION = ${BUILD_NUMBER};`, 2, "iOS build number");
  result = replacePatternExactly(result, /MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${VERSION_NAME};`, 2, "iOS marketing version");
  result = replacePatternExactly(result, /PRODUCT_BUNDLE_IDENTIFIER = [^;]+;/g, `PRODUCT_BUNDLE_IDENTIFIER = ${APP_ID};`, 2, "iOS bundle identifier");
  return result;
}

async function installBrandedIcon() {
  if (process.platform !== "darwin") {
    const existing = await readFile(IOS_APP_ICON);
    if (existing.readUInt32BE(16) !== 1024 || existing.readUInt32BE(20) !== 1024) fail("A 1024×1024 generated iOS icon is required on non-macOS hosts.");
    return;
  }
  await execFile("sips", ["-z", "1024", "1024", path.join(REPOSITORY_ROOT, "icons", "icon-512.png"), "--out", IOS_APP_ICON]);
  const icon = await readFile(IOS_APP_ICON);
  if (icon.readUInt32BE(16) !== 1024 || icon.readUInt32BE(20) !== 1024) fail("Branded iOS icon is not 1024×1024.");
}

async function configure() {
  assertGeneratedPath(IOS_DIRECTORY, "ios");
  await verifyCapacitorConfig();
  for (const file of [IOS_PROJECT, IOS_INFO_PLIST, IOS_LAUNCH_SCREEN, IOS_APP_ICON]) if (!(await isFile(file))) fail("Generated iOS project is missing. Run `npx cap add ios` first.");
  await writeFile(IOS_PROJECT, configureProject(await readFile(IOS_PROJECT, "utf8")), "utf8");
  await writeFile(IOS_INFO_PLIST, INFO_PLIST, "utf8");
  await writeFile(IOS_PRIVACY_MANIFEST, PRIVACY_MANIFEST, "utf8");
  await writeFile(IOS_LAUNCH_SCREEN, LAUNCH_SCREEN, "utf8");
  await installBrandedIcon();
  await verify();
  console.log(`[ios-package] Configured ${APP_ID} ${VERSION_NAME} (${BUILD_NUMBER}).`);
}

async function verify() {
  await verifyCapacitorConfig();
  const staged = await verifyWebDirectory(WEB_DIRECTORY);
  const packaged = await verifyWebDirectory(IOS_PUBLIC_DIRECTORY, { packaged: true });
  const expected = await expectedInventory();
  for (const file of expected.files) {
    const stagedBytes = await readFile(resolveInside(WEB_DIRECTORY, file));
    const packagedBytes = await readFile(resolveInside(IOS_PUBLIC_DIRECTORY, file));
    if (sha256(stagedBytes) !== sha256(packagedBytes)) fail(`Capacitor packaged a stale iOS web resource: ${file}`);
  }
  const project = await readFile(IOS_PROJECT, "utf8");
  const info = await readFile(IOS_INFO_PLIST, "utf8");
  const privacy = await readFile(IOS_PRIVACY_MANIFEST, "utf8");
  if (!project.includes("PrivacyInfo.xcprivacy in Resources") || !project.includes(`MARKETING_VERSION = ${VERSION_NAME};`) || !project.includes(`CURRENT_PROJECT_VERSION = ${BUILD_NUMBER};`) || !project.includes(`PRODUCT_BUNDLE_IDENTIFIER = ${APP_ID};`)) fail("Generated Xcode identity/privacy resources are incomplete.");
  for (const key of ["NSMicrophoneUsageDescription", "NSSpeechRecognitionUsageDescription", "UIDesignRequiresCompatibility"]) if (!info.includes(`<key>${key}</key>`)) fail(`Info.plist is missing ${key}.`);
  if (!privacy.includes("<key>NSPrivacyTracking</key>") || !privacy.includes("<false/>") || !privacy.includes("<key>NSPrivacyAccessedAPITypes</key>")) fail("PrivacyInfo.xcprivacy is not the reviewed minimal manifest.");
  console.log(`[ios-package] Verification passed; staged ${staged.mebibytes} MiB, packaged ${packaged.mebibytes} MiB.`);
}

const command = process.argv[2];
if (command === "stage") await stage();
else if (command === "configure") await configure();
else if (command === "verify") await verify();
else fail("Usage: node scripts/configure-ios.mjs <stage|configure|verify>");
