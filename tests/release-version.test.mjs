import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = relativePath => readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");

test("public release identity stays aligned across web, Android, iOS, downloads, and terms", async () => {
  const packageJson = JSON.parse(await read("package.json"));
  const version = packageJson.version;
  assert.match(version, /^\d+\.\d+\.\d+$/);
  assert.equal(version, "12.6.3");

  const [major, minor, patch] = version.split(".").map(Number);
  const shortVersion = `${major}.${minor}`;
  const versionCode = major * 10_000 + minor * 100 + patch;
  assert.equal(versionCode, 120603);
  const [app, download, terms, readme, qrGenerator, android, ios] = await Promise.all([
    read("app.js"),
    read("download.html"),
    read("TERMS.md"),
    read("README.md"),
    read("make-release-qr.py"),
    read("scripts/configure-android.mjs"),
    read("scripts/configure-ios.mjs")
  ]);

  assert.match(app, new RegExp(`appVersion: String\\(options\\.appVersion \\|\\| "${version.replaceAll(".", "\\.")}"\\)`));
  assert.match(app, new RegExp(`\\{ appVersion: "${version.replaceAll(".", "\\.")}" \\}`));
  assert.ok(download.includes(`PUBLIC BETA · V${shortVersion}`));
  assert.ok(download.includes(`v${version}-samsung.1/huilaishi-samsung-${version}-r1-release.apk`));
  assert.ok(terms.includes(`版本：${version} 公开测试版`));
  assert.ok(readme.includes(`当前仓库版本：**${version} 公开测试版**`));
  assert.ok(qrGenerator.includes(`v${version}-samsung.1/huilaishi-samsung-${version}-r1-release.apk`));
  assert.ok(android.includes(`const VERSION_CODE = ${versionCode};`));
  assert.ok(android.includes(`"${version}-samsung.1"`));
  assert.match(ios, /const PACKAGE = JSON\.parse\(await readFile\(path\.join\(REPOSITORY_ROOT, "package\.json"\)/);
  assert.match(ios, /const VERSION_NAME = String\(PACKAGE\.version\);/);
  assert.match(ios, /const DEFAULT_BUILD_NUMBER = versionParts\[0\] \* 10000 \+ versionParts\[1\] \* 100 \+ versionParts\[2\];/);
  assert.match(ios, /CURRENT_PROJECT_VERSION = \$\{BUILD_NUMBER\};/);
  assert.match(ios, /MARKETING_VERSION = \$\{VERSION_NAME\};/);
});

test("the PWA shell and service worker use one cache generation", async () => {
  const [app, bootstrap, worker] = await Promise.all([
    read("app.js"),
    read("pwa-bootstrap.js"),
    read("service-worker.js")
  ]);
  const appVersion = /OFFLINE_CACHE_VERSION = "([^"]+)"/.exec(app)?.[1];
  const bootstrapVersion = /CACHE_VERSION = "([^"]+)"/.exec(bootstrap)?.[1];
  const workerVersion = /CACHE_NAME = "([^"]+)"/.exec(worker)?.[1];
  assert.ok(appVersion);
  assert.equal(bootstrapVersion, appVersion);
  assert.equal(workerVersion, appVersion);
  const generation = /-v(\d+)$/.exec(appVersion)?.[1];
  assert.ok(generation);
  assert.ok(worker.includes(`huilaishi-runtime-v${generation}`));
  for (const marker of ["base_ready", "full_ready", "audio_progress", "shell_progress", "audio_paused"]) {
    assert.ok(worker.includes(`__huilaishi_${marker}_v${generation}__`));
  }
});
