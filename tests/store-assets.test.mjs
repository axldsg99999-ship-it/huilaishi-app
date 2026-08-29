import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function pngDimensions(relativePath) {
  const bytes = await readFile(new URL(relativePath, root));
  assert.deepEqual(
    [...bytes.subarray(0, 8)],
    [137, 80, 78, 71, 13, 10, 26, 10],
    `${relativePath} must be a PNG`,
  );
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  };
}

async function assertScreenshotSet(directory, expectedDimensions) {
  const names = (await readdir(new URL(directory, root)))
    .filter(name => name.endsWith(".png"))
    .sort();
  assert.deepEqual(names, [
    "01-home.png",
    "02-vocabulary.png",
    "03-pronunciation.png",
    "04-games.png",
    "05-monster-battle.png",
    "06-local-duel.png",
  ]);
  for (const name of names) {
    assert.deepEqual(
      await pngDimensions(`${directory}${name}`),
      expectedDimensions,
      `${directory}${name} has the wrong store size`,
    );
  }
}

test("Apple and Google screenshot candidates have complete, exact-size sets", async () => {
  await Promise.all([
    assertScreenshotSet("store/assets/apple-1320x2868/", { width: 1320, height: 2868 }),
    assertScreenshotSet("store/assets/google-phone/", { width: 1080, height: 1920 }),
  ]);
});

test("Google Play feature graphic has the required dimensions and local-only source", async () => {
  assert.deepEqual(
    await pngDimensions("store/assets/google-feature-graphic-1024x500.png"),
    { width: 1024, height: 500 },
  );
  const source = await readFile(
    new URL("store/assets/source/google-feature-graphic.html", root),
    "utf8",
  );
  assert.match(source, /3000 词卡/u);
  assert.match(source, /发音课/u);
  assert.match(source, /同机对战/u);
  assert.doesNotMatch(source, /(?:src|href)="https?:\/\//u);
});

