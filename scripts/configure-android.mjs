import { copyFile, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(SCRIPT_DIRECTORY, "..");
const WEB_DIRECTORY = path.join(REPOSITORY_ROOT, "native-www");
const STANDALONE_FILE = path.resolve(REPOSITORY_ROOT, "..", "会来事-手机离线单文件.html");
const ANDROID_DIRECTORY = path.join(REPOSITORY_ROOT, "android");
const ANDROID_MANIFEST = path.join(ANDROID_DIRECTORY, "app", "src", "main", "AndroidManifest.xml");
const APP_GRADLE = path.join(ANDROID_DIRECTORY, "app", "build.gradle");
const PACKAGED_WEB_DIRECTORY = path.join(ANDROID_DIRECTORY, "app", "src", "main", "assets", "public");

const VERSION_CODE = 120203;
const VERSION_NAME = "12.2.3";
const REQUIRED_PERMISSIONS = [
  "android.permission.RECORD_AUDIO",
  "android.permission.MODIFY_AUDIO_SETTINGS",
];

function fail(message) {
  throw new Error(`[android-package] ${message}`);
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

async function stageStandalone() {
  assertGeneratedPath(WEB_DIRECTORY, "native-www");
  if (!(await fileExists(STANDALONE_FILE))) {
    fail(`Standalone build not found: ${STANDALONE_FILE}. Run build-offline.ps1 first.`);
  }

  const standalone = await readFile(STANDALONE_FILE, "utf8");
  if (!standalone.includes("window.SINGLE_FILE_BUILD = true")) {
    fail("Standalone marker is missing; refusing to package a partial web build.");
  }
  if (/<script\b[^>]*\bsrc\s*=/i.test(standalone)) {
    fail("Standalone build still contains an external script reference.");
  }
  if (/<link\b[^>]*\brel\s*=\s*[\"']?stylesheet/i.test(standalone)) {
    fail("Standalone build still contains an external stylesheet reference.");
  }

  await rm(WEB_DIRECTORY, { recursive: true, force: true });
  await mkdir(WEB_DIRECTORY, { recursive: true });
  await copyFile(STANDALONE_FILE, path.join(WEB_DIRECTORY, "index.html"));

  const entries = await readdir(WEB_DIRECTORY, { withFileTypes: true });
  if (entries.length !== 1 || !entries[0].isFile() || entries[0].name !== "index.html") {
    fail("native-www must contain only index.html.");
  }
  console.log(`[android-package] Staged standalone HTML (${standalone.length} UTF-8 characters).`);
}

function addPermissions(manifest) {
  let updated = manifest;
  for (const permission of REQUIRED_PERMISSIONS) {
    if (updated.includes(`android:name=\"${permission}\"`)) continue;
    const applicationMatch = /^([ \t]*)<application\b/m.exec(updated);
    if (!applicationMatch || applicationMatch.index === undefined) {
      fail("Android manifest has no <application> element.");
    }
    const declaration = `${applicationMatch[1]}<uses-permission android:name=\"${permission}\" />\n`;
    updated = `${updated.slice(0, applicationMatch.index)}${declaration}${updated.slice(applicationMatch.index)}`;
  }
  return updated;
}

function setAndroidVersion(gradle) {
  if (!/\bversionCode\s*(?:=\s*)?\d+/.test(gradle)) {
    fail("Could not find versionCode in app/build.gradle.");
  }
  if (!/\bversionName\s*(?:=\s*)?[\"'][^\"']*[\"']/.test(gradle)) {
    fail("Could not find versionName in app/build.gradle.");
  }
  return gradle
    .replace(/\bversionCode\s*(?:=\s*)?\d+/, `versionCode = ${VERSION_CODE}`)
    .replace(/\bversionName\s*(?:=\s*)?[\"'][^\"']*[\"']/, `versionName = \"${VERSION_NAME}\"`);
}

async function configureAndroid() {
  if (!(await fileExists(ANDROID_MANIFEST)) || !(await fileExists(APP_GRADLE))) {
    fail("Generated Android project is missing. Run `npx cap add android` first.");
  }

  const manifest = addPermissions(await readFile(ANDROID_MANIFEST, "utf8"));
  const gradle = setAndroidVersion(await readFile(APP_GRADLE, "utf8"));
  await writeFile(ANDROID_MANIFEST, manifest, "utf8");
  await writeFile(APP_GRADLE, gradle, "utf8");
  await verifyAndroid();
  console.log(`[android-package] Configured Android ${VERSION_NAME} (${VERSION_CODE}).`);
}

async function verifyAndroid() {
  const webEntries = await readdir(WEB_DIRECTORY, { withFileTypes: true }).catch(() => []);
  if (webEntries.length !== 1 || webEntries[0].name !== "index.html" || !webEntries[0].isFile()) {
    fail("native-www must contain exactly one file named index.html.");
  }

  const packagedHtml = await readFile(path.join(WEB_DIRECTORY, "index.html"), "utf8");
  if (!packagedHtml.includes("window.SINGLE_FILE_BUILD = true")) {
    fail("Packaged index.html is not the standalone build.");
  }

  const manifest = await readFile(ANDROID_MANIFEST, "utf8");
  for (const permission of REQUIRED_PERMISSIONS) {
    const occurrences = manifest.split(`android:name=\"${permission}\"`).length - 1;
    if (occurrences !== 1) fail(`Expected exactly one ${permission} declaration; found ${occurrences}.`);
  }

  const gradle = await readFile(APP_GRADLE, "utf8");
  if (!new RegExp(`\\bversionCode\\s*=\\s*${VERSION_CODE}\\b`).test(gradle)) {
    fail(`versionCode is not ${VERSION_CODE}.`);
  }
  if (!new RegExp(`\\bversionName\\s*=\\s*[\"']${VERSION_NAME.replaceAll(".", "\\.")}[\"']`).test(gradle)) {
    fail(`versionName is not ${VERSION_NAME}.`);
  }

  const nativeEntries = await readdir(PACKAGED_WEB_DIRECTORY, { withFileTypes: true }).catch(() => []);
  if (nativeEntries.length !== 1 || nativeEntries[0].name !== "index.html" || !nativeEntries[0].isFile()) {
    fail("Generated Android public assets must contain exactly one index.html file.");
  }
  const nativeHtml = await readFile(path.join(PACKAGED_WEB_DIRECTORY, "index.html"), "utf8");
  if (!nativeHtml.includes("window.SINGLE_FILE_BUILD = true")) {
    fail("Generated Android public/index.html is not the standalone build.");
  }
  console.log("[android-package] Verification passed.");
}

const command = process.argv[2];
if (command === "stage") {
  await stageStandalone();
} else if (command === "configure") {
  await configureAndroid();
} else if (command === "verify") {
  await verifyAndroid();
} else {
  fail("Usage: node scripts/configure-android.mjs <stage|configure|verify>");
}
