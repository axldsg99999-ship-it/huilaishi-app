import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = file => fs.readFileSync(path.join(ROOT, file), "utf8");

test("the learning IA promotes pronunciation and face-to-face battle without exposing review tools", () => {
  const html = read("index.html");
  assert.ok(html.indexOf('id="pronunciation-tab"') < html.indexOf('id="candidate-tab"'));
  assert.match(html, /class="hidden"[^>]*id="candidate-tab"|id="candidate-tab"[^>]*class="hidden"/u);
  assert.ok(html.indexOf('id="pass-phone"') < html.indexOf('id="arcade-hall"'));
  assert.match(html, /id="global-offline-chip"[^>]*role="status"/u);
});

test("the first L1 page follows a practical survival progression before optional shuffling", () => {
  const source = read("vocab-ui.js");
  const sequence = /const L1_SURVIVAL_FIRST = Object\.freeze\(\[([^]*?)\]\);/u.exec(source)?.[1] || "";
  const ids = [...sequence.matchAll(/"([^"]+)"/gu)].map(match => match[1]);
  assert.deepEqual(ids.slice(0, 6), ["l1-206", "l1-207", "l1-209", "l1-211", "l1-001", "l1-002"]);
  assert.equal(ids.length, 30);
  assert.match(source, /activeLevel === 1[^]*shuffleSalt === 0[^]*L1_SURVIVAL_RANK/u);
});

test("vocabulary search accepts the Chinese near-sound learners actually type", () => {
  const source = read("vocab-ui.js");
  assert.match(source, /拼音、罗马音或中文近音/u);
  assert.match(source, /reading\?\.quality === "curated-core"/u);
  assert.match(source, /\.map\(reading => reading\.zhHint\)/u);
  assert.match(source, /compactNeedle\.replace\(\/\(\?:卡普\|卡\)\$\/u/u);
  assert.match(source, /“萨瓦迪卡” find สวัสดี/u);
});

test("public copy describes expression levels and uses readable promoted battle text", () => {
  const app = read("app.js");
  const arcade = read("arcade.js");
  const css = read("styles.css");
  assert.doesNotMatch(`${app}\n${read("index.html")}`, /算了，做个体面人|当前人格|当前人设|用这个人设/u);
  assert.match(app, /对陌生店员会显得太随便/u);
  assert.match(app, /在这个场景风险极高/u);
  assert.match(app, /option\.roman \|\| option\.reading \|\| ""/u);
  assert.match(app, /近音待核\|母语待审\|算法近似/u);
  assert.match(arcade, /近音待核\|母语待审\|算法近似/u);
  assert.doesNotMatch(arcade, /8 GAMES|GAME 0[1-8]/u);
  assert.match(css, /#view-battle > \.pass-phone-card b \{ font-size: 14px/u);
  assert.match(css, /#view-battle > \.pass-phone-card small \{[^}]*font-size: 12px/u);
});
