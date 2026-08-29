import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = relativePath => readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");

test("native store packages exclude the unmoderated human partner room", async () => {
  const [android, ios, partner, androidWorkflow, iosWorkflow] = await Promise.all([
    read("scripts/configure-android.mjs"),
    read("scripts/configure-ios.mjs"),
    read("partner-live.js"),
    read(".github/workflows/android-apk.yml"),
    read(".github/workflows/ios-build.yml"),
  ]);
  for (const builder of [android, ios]) {
    assert.match(builder, /HUILAISHI_DISTRIBUTION/u);
    assert.match(builder, /STORE_EXCLUDED_FILES/u);
    assert.match(builder, /"partner-live\.js"/u);
    assert.match(builder, /"partner\/manual-peer\.js"/u);
    assert.match(builder, /Native partner-room inventory|Native iOS partner-room inventory/u);
  }
  assert.match(partner, /HUILAISHI_DISTRIBUTION\?\.livePartner === false/u);
  assert.match(androidWorkflow, /HUILAISHI_DISTRIBUTION: "direct"/u);
  assert.match(iosWorkflow, /HUILAISHI_DISTRIBUTION: "store"/u);
});

test("store policy pages are public, local, bilingual, and linked in-app", async () => {
  const [index, privacy, support, terms, worker] = await Promise.all([
    read("index.html"),
    read("privacy.html"),
    read("support.html"),
    read("terms.html"),
    read("service-worker.js"),
  ]);
  for (const file of ["privacy.html", "support.html", "terms.html"]) {
    assert.match(index, new RegExp(`href="${file.replace(".", "\\.")}"`, "u"));
    assert.match(worker, new RegExp(`"\\./${file.replace(".", "\\.")}"`, "u"));
  }
  for (const page of [privacy, support, terms]) {
    assert.match(page, /lang="th"/u);
    assert.match(page, /legal\.css/u);
    assert.doesNotMatch(page, /TODO|example\.com|待填写/u);
  }
  assert.match(privacy, /原生商店版不提供真人语伴直连/u);
  assert.match(support, /huilaishi-app\/issues\/new/u);
});

test("Android disables app backup and the store preflight preserves explicit human gates", async () => {
  const [builder, validator, voice, language, devices] = await Promise.all([
    read("scripts/configure-android.mjs"),
    read("scripts/validate-store-readiness.mjs"),
    read("store/compliance/voice-rights.json"),
    read("store/compliance/language-review.json"),
    read("store/compliance/device-qa.json"),
  ]);
  assert.match(builder, /\[\["allowBackup", "false"\], \["fullBackupContent", "false"\]\]/u);
  assert.match(builder, /Application backups must remain disabled/u);
  assert.match(validator, /--strict/u);
  assert.match(validator, /VOICE_RIGHTS/u);
  assert.match(validator, /NATIVE_REVIEW/u);
  assert.equal(JSON.parse(voice).status, "pending");
  assert.equal(JSON.parse(language).status, "pending");
  assert.equal(JSON.parse(devices).status, "pending");
});
