import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = file => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const html = read("index.html");
const app = read("app.js");
const arcade = read("arcade.js");
const openUi = read("open-ui.css");
const speechUi = read("speech-engine.css");

test("home opens as a four-choice menu and keeps the long feed opt-in", () => {
  const menuEnd = html.indexOf("</section>", html.indexOf('class="home-main-menu"'));
  const more = html.indexOf('id="home-more"');
  assert.ok(menuEnd > -1 && more > menuEnd);
  assert.match(html, /<details class="home-more" id="home-more">/u);
  assert.doesNotMatch(html, /<details class="home-more" id="home-more" open/u);
  assert.match(app, /home-more-summary/u);
});

test("game centre reveals one recommendation before optional catalogue and daily challenge", () => {
  assert.match(html, /id="arcade-expand"[^>]*aria-expanded="false"/u);
  assert.match(html, /<details class="daily-battle" id="daily-battle">/u);
  assert.match(openUi, /\.arcade-grid:not\(\.is-expanded\) \.arcade-card:nth-child\(n\+5\)/u);
  assert.match(arcade, /grid\.classList\.toggle\("is-expanded", hallExpanded\)/u);
});

test("main navigation resets immediately and lesson actions appear only after a choice", () => {
  const navigate = app.match(/function navigate\(view, options = \{\}\) \{[\s\S]*?\n\}/u)?.[0] || "";
  assert.match(navigate, /appScroll\.scrollTop = 0/u);
  assert.doesNotMatch(navigate, /behavior:\s*"smooth"/u);
  assert.match(app, /classList\.add\("awaiting-answer"\)/u);
  assert.match(app, /classList\.remove\("awaiting-answer"\)/u);
  assert.match(openUi, /#lesson\.awaiting-answer \.lesson-footer \{ display:none; \}/u);
});

test("small-phone visual system contains horizontal overflow and avoids template labels", () => {
  assert.match(openUi, /#view-live \.scenario-strip \{ width:100%; max-width:100%; margin:0 0 14px;/u);
  assert.match(openUi, /#view-profile \.settings-row \{ box-sizing:border-box; grid-template-columns:minmax\(0,1fr\) auto 25px;/u);
  assert.match(openUi, /中泰当代编辑风/u);
  assert.match(speechUi, /data-track="navigation"/u);
  assert.doesNotMatch(app, /GAME CENTER|MAIN MENU/u);
  assert.doesNotMatch(arcade, />PLAYER</u);
});
