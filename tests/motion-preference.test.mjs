import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = file => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const html = read("index.html");
const app = read("app.js");
const arcade = read("arcade.js");
const arcadeCss = read("arcade.css");
const openUi = read("open-ui.css");

test("profile exposes an honest bilingual motion preference", () => {
  assert.match(html, /class="motion-setting"[^>]*aria-labelledby="motion-setting-label"/u);
  assert.match(html, /data-motion-preference="system"[\s\S]*?data-motion-preference="reduced"/u);
  assert.match(app, /const MOTION_PREFERENCE_KEY = "huilaishi-motion-preference-v1"/u);
  assert.match(app, /ภาพเคลื่อนไหวคั่นฉาก/u);
  assert.match(app, /document\.documentElement\.dataset\.motionEffective = shouldReduceMotion\(\) \? "reduced" : "standard"/u);
  assert.match(app, /globalThis\.HUILAISHI_MOTION = Object\.freeze/u);
});

test("reduced motion skips game intermissions instead of merely hiding animation", () => {
  assert.match(arcade, /globalThis\.HUILAISHI_MOTION\?\.shouldReduce\?\.\(\)/u);
  assert.match(arcade, /if \(shouldReduceMotion\(\)\) \{\s*schedule\(callback, 0\);\s*return;/u);
  assert.match(arcade, /if \(shouldReduceMotion\(\)\) return;\s*globalThis\.confetti/u);
  assert.match(openUi, /html\[data-motion-effective="reduced"\] \*/u);
});

test("full intermissions keep a visible tap-to-skip time rail", () => {
  assert.match(arcade, /--arcade-transition-duration:\$\{duration\}ms/u);
  assert.match(arcade, /<span><b>\$\{esc\(copy\(\)\.skipTransition\)\}<\/b><i aria-hidden="true"><\/i><\/span>/u);
  assert.match(arcadeCss, /@keyframes arcade-transition-drain/u);
  assert.match(arcadeCss, /animation:arcade-transition-drain var\(--arcade-transition-duration,760ms\) linear forwards/u);
});

test("unplayed games invite a first action without displaying a fake best score", () => {
  assert.match(arcade, /notPlayed: "未挑战", start: "开练"/u);
  assert.match(arcade, /best > 0 \? best\.toLocaleString\(\) : esc\(c\.start\)/u);
  assert.match(openUi, /\.arcade-card-score\.is-empty b/u);
  const legacyTwoColumnRule = arcadeCss.indexOf("grid-template-columns:repeat(2,minmax(0,1fr))");
  const finalOneColumnRule = arcadeCss.lastIndexOf("grid-template-columns:minmax(0,1fr)");
  assert.ok(finalOneColumnRule > legacyTwoColumnRule, "the final dynamic stylesheet must preserve the readable one-column hall");
});

test("profile exposes persistent bilingual day and night campus themes", () => {
  assert.match(html, /class="campus-theme-setting"[^>]*aria-labelledby="campus-theme-label"/u);
  assert.match(html, /data-campus-theme="day"[\s\S]*?data-campus-theme="night"/u);
  assert.match(app, /const CAMPUS_THEME_KEY = "huilaishi-campus-theme-v1"/u);
  assert.match(app, /document\.documentElement\.dataset\.campusTheme = campusTheme/u);
  assert.match(app, /ธีมสมุดโรงเรียน/u);
  assert.match(app, /campus-page-enter/u);
});
