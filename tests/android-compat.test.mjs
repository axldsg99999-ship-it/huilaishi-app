import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(TEST_DIR, "..");

test("the full-screen shell keeps a vh fallback before every dvh height", () => {
  const css = fs.readFileSync(path.join(PROJECT_ROOT, "styles.css"), "utf8");
  const html = fs.readFileSync(path.join(PROJECT_ROOT, "index.html"), "utf8");
  const body = css.match(/(?:^|\n)body\s*\{([\s\S]*?)\}/u)?.[1] || "";
  const shell = css.match(/\.phone-shell\s*\{([\s\S]*?)\}/u)?.[1] || "";
  const desktop = css.match(/@media\s*\(min-width:\s*431px\)\s*\{\s*\.phone-shell\s*\{([\s\S]*?)\}/u)?.[1] || "";

  assert.match(body, /min-height:\s*100vh\s*;[\s\S]*min-height:\s*100dvh\s*;/u);
  assert.match(shell, /height:\s*100vh\s*;[\s\S]*height:\s*min\(900px,\s*100vh\)\s*;[\s\S]*height:\s*min\(900px,\s*100dvh\)\s*;/u);
  assert.match(desktop, /height:\s*calc\(100vh\s*-\s*28px\)\s*;[\s\S]*height:\s*min\(900px,\s*calc\(100vh\s*-\s*28px\)\)\s*;[\s\S]*height:\s*min\(900px,\s*calc\(100dvh\s*-\s*28px\)\)\s*;/u);
  assert.match(html, /id="android-viewport-fallback"[\s\S]*\.phone-shell\s*\{\s*height:\s*100vh\s*;/u);
  assert.ok(html.indexOf('id="android-viewport-fallback"') < html.indexOf('href="styles.css"'), "the cache-safe fallback must precede the external stylesheet");
});

test("secondary Android layouts keep vh fallbacks for dvh sizing", () => {
  const partner = fs.readFileSync(path.join(PROJECT_ROOT, "partner-live.css"), "utf8");
  const pronunciation = fs.readFileSync(path.join(PROJECT_ROOT, "pronunciation-course.css"), "utf8");

  assert.match(partner, /max-height:\s*34vh\s*;\s*max-height:\s*34dvh\s*;/u);
  assert.match(pronunciation, /height:\s*calc\(100vh\s*-\s*117px\)\s*;\s*height:\s*calc\(100dvh\s*-\s*117px\)\s*;/u);
  assert.match(pronunciation, /height:\s*calc\(100vh\s*-\s*97px\)\s*;\s*height:\s*calc\(100dvh\s*-\s*97px\)\s*;/u);
});

test("startup scripts avoid post-Chrome-80 Array.at and String.replaceAll dependencies", () => {
  for (const filename of ["app.js", "arcade.js", "partner-live.js", "thai-phonetic.js", "vocab-ui.js", "voice-pack-ui.js"]) {
    const source = fs.readFileSync(path.join(PROJECT_ROOT, filename), "utf8");
    assert.doesNotMatch(source, /\.at\s*\(/u, `${filename} must not require Array.prototype.at`);
    assert.doesNotMatch(source, /\.replaceAll\s*\(/u, `${filename} must not require String.prototype.replaceAll`);
  }
});

test("manual peer has a secure UUID fallback for Android Chrome before 92", () => {
  const browserPeer = fs.readFileSync(path.join(PROJECT_ROOT, "partner", "manual-peer.js"), "utf8");
  const backendPeer = fs.readFileSync(path.join(PROJECT_ROOT, "backend", "p2p", "manual-peer.js"), "utf8");
  assert.equal(browserPeer, backendPeer);
  assert.match(browserPeer, /typeof\s+crypto\.randomUUID\s*===\s*"function"/u);
  assert.match(browserPeer, /crypto\.getRandomValues\(new Uint8Array\(16\)\)/u);
  assert.doesNotMatch(browserPeer, /id:\s*crypto\.randomUUID\(\)/u);
});

test("Android entry is light and a route card enters without a second continue tap", () => {
  const css = fs.readFileSync(path.join(PROJECT_ROOT, "styles.css"), "utf8");
  const html = fs.readFileSync(path.join(PROJECT_ROOT, "index.html"), "utf8");
  const manifest = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, "manifest.webmanifest"), "utf8"));
  const app = fs.readFileSync(path.join(PROJECT_ROOT, "app.js"), "utf8");

  assert.match(html, /name="theme-color"\s+content="#f6f1e7"/u);
  assert.equal(manifest.background_color, "#f6f1e7");
  assert.equal(manifest.theme_color, "#f6f1e7");
  assert.match(css, /V12\.2\.2[^]*?\.direction-screen\s*\{[^}]*#f8f4eb/u);
  assert.match(css, /\.direction-continue\s*\{\s*display:\s*none;/u);
  assert.match(app, /function\s+enterSelectedDirection\([^)]*\)[^]*?showOnboarding\(\);/u);
  assert.match(app, /#direction-cards[^]*?enterSelectedDirection\(card\.dataset\.direction\)/u);
});

test("lesson guidance opens only from the explicit help button", () => {
  const tour = fs.readFileSync(path.join(PROJECT_ROOT, "product-tour.js"), "utf8");

  assert.match(tour, /#lesson-guide[^\n]*addEventListener\("click"[^\n]*launch\("lesson"\)/u);
  assert.doesNotMatch(tour, /addEventListener\("huilaishi:lesson-start"/u);
});

test("short Android screens keep onboarding actions reachable and expose lesson overflow", () => {
  const css = fs.readFileSync(path.join(PROJECT_ROOT, "styles.css"), "utf8");
  const html = fs.readFileSync(path.join(PROJECT_ROOT, "index.html"), "utf8");

  const shortScreen = css.match(/@media\s*\(max-width:\s*430px\)\s*and\s*\(max-height:\s*700px\)\s*\{([^]*?)\n\}/u)?.[1] || "";
  assert.match(shortScreen, /#onboarding-confirm-step\s*\{[^}]*padding-bottom:/u);
  assert.match(shortScreen, /\.confirm-actions\s*\{[^}]*position:\s*fixed;[^}]*bottom:\s*0;/u);
  assert.match(shortScreen, /\.npc-scene\s*\{[^}]*min-height:\s*150px;/u);
  assert.match(shortScreen, /\.lesson-scroll-hint\s*\{[^}]*display:\s*flex;/u);
  assert.match(html, /id="lesson-scroll-hint"[^>]*>[^<]*<span[^>]*>↓<\/span>\s*上滑查看全部 3 个答案/u);
});
