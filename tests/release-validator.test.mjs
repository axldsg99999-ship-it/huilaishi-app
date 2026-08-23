import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

import { appShellAssets, auditRelease, referencedDocumentAssets } from "../scripts/validate-release.mjs";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(TEST_DIR, "..");

test("document dependency parser ignores remote and data URLs", () => {
  const html = '<link href="app.css" rel="stylesheet"><script src="./app.js"></script><script src="https://example.com/x.js"></script><link href="data:text/css,x">';
  assert.deepEqual(referencedDocumentAssets(html), ["app.css", "app.js"]);
});

test("service worker shell parser extracts local entries", () => {
  const worker = 'const APP_SHELL = ["./", "./index.html", "./app.js"];';
  assert.deepEqual(appShellAssets(worker), ["index.html", "app.js"]);
});

test("live project has parseable scripts and a complete offline shell", () => {
  const report = auditRelease(PROJECT_ROOT);
  assert.deepEqual(report.errors, []);
  assert.equal(report.ok, true);
  assert.ok(report.stats.scripts >= 25);
  assert.ok(report.stats.documentAssets >= 20);
});

test("bundled audio aliases never override mismatched displayed text", () => {
  const source = fs.readFileSync(path.join(PROJECT_ROOT, "cute-audio-map.js"), "utf8");
  const sandbox = { globalThis: {} };
  vm.runInNewContext(source, sandbox, { filename: "cute-audio-map.js" });
  const catalog = sandbox.globalThis.HUILAISHI_CUTE_AUDIO;
  const female = catalog.lookup({
    key: "register:quiet:S4:th",
    text: "ช่วยเบาเสียงหน่อยค่ะ",
    lang: "th-TH",
    track: "standard",
  });
  assert.ok(female, "the exact bundled female form should resolve");
  const mismatchedMale = catalog.lookup({
    key: "register:quiet:S4:th",
    text: "ช่วยเบาเสียงหน่อยครับ",
    lang: "th-TH",
    track: "standard",
  });
  assert.equal(mismatchedMale, null, "a female clip must not play for male wording");
});

test("downloaded vocabulary audio aliases require the displayed text to match", async () => {
  const source = fs.readFileSync(path.join(PROJECT_ROOT, "voice-pack-manager.js"), "utf8");
  const root = {
    URL,
    console,
    location: { href: "https://example.test/app/", protocol: "https:" },
    document: { baseURI: "https://example.test/app/" },
  };
  root.globalThis = root;
  vm.runInNewContext(source, root, { filename: "voice-pack-manager.js" });
  const manager = root.HUILAISHI_VOICE_PACKS;
  manager.configure({
    schemaVersion: 1,
    packs: [{ id: "zh-th-l3", direction: "zh-th", level: 3, manifest: "packs/l3.json" }],
  }, {
    catalogUrl: "https://example.test/app/voice-packs/manifest.json",
    packManifests: {
      "zh-th-l3": {
        schemaVersion: 1,
        packId: "zh-th-l3",
        entries: [{
          id: "clip-old",
          language: "th",
          text: "คำเก่า",
          aliases: ["vocab:l3-001:word:th"],
          file: "audio/old.mp3",
          ready: true,
        }],
      },
    },
  });

  const exact = await manager.lookup({
    key: "vocab:l3-001:word:th",
    text: "คำเก่า",
    lang: "th-TH",
    level: 3,
    direction: "zh-th",
  });
  assert.equal(exact?.entry?.id, "clip-old");

  const staleAlias = await manager.lookup({
    key: "vocab:l3-001:word:th",
    text: "คำใหม่",
    lang: "th-TH",
    level: 3,
    direction: "zh-th",
  });
  assert.equal(staleAlias, null, "an old id alias must not play audio for replacement text");
});
