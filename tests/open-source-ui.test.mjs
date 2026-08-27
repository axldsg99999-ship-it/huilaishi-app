import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const file = relative => readFile(new URL(`../${relative}`, import.meta.url));
const text = async relative => (await file(relative)).toString("utf8");
const sha256 = buffer => createHash("sha256")
  .update(buffer.toString("utf8").replaceAll("\r\n", "\n"))
  .digest("hex")
  .toUpperCase();

test("Framework7 is pinned locally and isolated from the production document", async () => {
  const [production, lab, notice, license, css, js] = await Promise.all([
    text("index.html"),
    text("ui-framework7-lab.html"),
    text("vendor/THIRD_PARTY_NOTICES.md"),
    text("vendor/licenses/framework7-9.1.2-MIT.txt"),
    file("vendor/framework7-9.1.2-bundle.min.css"),
    file("vendor/framework7-9.1.2-bundle.min.js"),
  ]);

  assert.doesNotMatch(production, /framework7-9\.1\.2/u);
  assert.match(lab, /href="vendor\/framework7-9\.1\.2-bundle\.min\.css"/u);
  assert.match(lab, /src="vendor\/framework7-9\.1\.2-bundle\.min\.js"/u);
  assert.doesNotMatch(lab, /(?:src|href)="https?:/u);
  assert.match(notice, /Framework7 Core 9\.1\.2/u);
  assert.match(license, /The MIT License/u);
  assert.equal(sha256(css), "AEDB019F9E6CE8E06997DB46F84C9E4AE13FBFB497ECC2FF61CC8E1DDFFC6C90");
  assert.equal(sha256(js), "9D3C8C660DAACB4855677617F34D294A1BA5AB62A4585B7CCBBBA9403FDD0ACB");
});

test("the lab uses real Framework7 page, tabbar, list and sheet contracts", async () => {
  const [lab, script] = await Promise.all([
    text("ui-framework7-lab.html"),
    text("ui-framework7-lab.js"),
  ]);

  assert.match(lab, /class="view view-main view-init"/u);
  assert.match(lab, /class="toolbar tabbar tabbar-icons toolbar-bottom"/u);
  assert.match(lab, /class="sheet-modal demo-register-sheet"/u);
  assert.match(lab, /class="list strong inset/u);
  assert.match(script, /new Framework7\(/u);
  assert.match(script, /app\.sheet\.open/u);
  assert.match(script, /app\.toast\.create/u);
});
