import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import path from "node:path";
import vm from "node:vm";
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
  assert.match(shell, /height:\s*100vh\s*;[\s\S]*height:\s*100dvh\s*;/u);
  assert.doesNotMatch(shell, /min\(900px/u, "mobile shells must use the full viewport height");
  assert.match(desktop, /height:\s*calc\(100vh\s*-\s*28px\)\s*;[\s\S]*height:\s*min\(900px,\s*calc\(100vh\s*-\s*28px\)\)\s*;[\s\S]*height:\s*min\(900px,\s*calc\(100dvh\s*-\s*28px\)\)\s*;/u);
  assert.match(html, /id="android-viewport-fallback"[\s\S]*\.phone-shell\s*\{\s*height:\s*100vh\s*;/u);
  assert.match(html, /@media \(max-width:\s*430px\)[^]*?\.phone-shell\s*\{[^]*?position:\s*fixed\s*!important;[^]*?bottom:\s*0\s*!important;[^]*?height:\s*auto\s*!important;/u);
  assert.ok(html.indexOf('id="android-viewport-fallback"') < html.indexOf('href="styles.css"'), "the cache-safe fallback must precede the external stylesheet");
});

test("secondary Android layouts keep vh fallbacks for dvh sizing", () => {
  const partner = fs.readFileSync(path.join(PROJECT_ROOT, "partner-live.css"), "utf8");
  const pronunciation = fs.readFileSync(path.join(PROJECT_ROOT, "pronunciation-course.css"), "utf8");

  assert.match(partner, /max-height:\s*34vh\s*;\s*max-height:\s*34dvh\s*;/u);
  assert.match(pronunciation, /height:\s*calc\(100vh\s*-\s*117px\)\s*;\s*height:\s*calc\(100dvh\s*-\s*117px\)\s*;/u);
  assert.match(pronunciation, /height:\s*calc\(100vh\s*-\s*97px\)\s*;\s*height:\s*calc\(100dvh\s*-\s*97px\)\s*;/u);
});

test("critical full-screen layers keep pre-inset WebView fallbacks", () => {
  const styles = fs.readFileSync(path.join(PROJECT_ROOT, "styles.css"), "utf8");
  const battleCss = fs.readFileSync(path.join(PROJECT_ROOT, "battle.css"), "utf8");
  const pronunciationCourseCss = fs.readFileSync(path.join(PROJECT_ROOT, "pronunciation-course.css"), "utf8");
  assert.match(styles, /\.screen \{ position: absolute; top: 0; right: 0; bottom: 0; left: 0; inset: 0; \}/u);
  assert.match(styles, /\.modal-backdrop \{ position: absolute; top: 0; right: 0; bottom: 0; left: 0; inset: 0;/u);
  assert.match(styles, /\.frame-guard\.embedded-notice \{\s*top: auto;\s*right: 12px;\s*bottom: max\(12px, var\(--app-safe-bottom\)\);\s*left: 12px;/u);
  assert.match(battleCss, /position:absolute; top:0; right:0; bottom:0; left:0; inset:0;/u);
  assert.match(pronunciationCourseCss, /position: fixed; top: 0; right: 0; bottom: 0; left: 0; inset: 0;/u);
});

test("Capacitor and CSS env safe areas share one normalized contract", () => {
  const cssFiles = [
    "styles.css", "arcade.css", "battle.css", "partner-live.css", "open-ui.css",
    "speech-engine.css", "vocab.css", "voice-pack-ui.css",
  ];
  const styles = fs.readFileSync(path.join(PROJECT_ROOT, "styles.css"), "utf8");
  assert.match(styles, /--app-safe-top:\s*var\(--safe-area-inset-top,\s*env\(safe-area-inset-top,\s*0px\)\)/u);
  assert.match(styles, /--app-safe-right:\s*var\(--safe-area-inset-right,\s*env\(safe-area-inset-right,\s*0px\)\)/u);
  assert.match(styles, /--app-safe-bottom:\s*var\(--safe-area-inset-bottom,\s*env\(safe-area-inset-bottom,\s*0px\)\)/u);
  assert.match(styles, /--app-safe-left:\s*var\(--safe-area-inset-left,\s*env\(safe-area-inset-left,\s*0px\)\)/u);

  for (const filename of cssFiles) {
    const source = fs.readFileSync(path.join(PROJECT_ROOT, filename), "utf8");
    const consumersOnly = source.split(/\r?\n/u)
      .filter((line) => !/^\s*--app-safe-(?:top|right|bottom|left):/u.test(line))
      .join("\n");
    assert.doesNotMatch(consumersOnly, /env\(safe-area-inset-/u, `${filename} must consume --app-safe-* variables`);
  }
});

test("audited mobile controls keep readable inputs and usable touch targets", () => {
  const styles = fs.readFileSync(path.join(PROJECT_ROOT, "styles.css"), "utf8");
  const vocab = fs.readFileSync(path.join(PROJECT_ROOT, "vocab.css"), "utf8");
  const partner = fs.readFileSync(path.join(PROJECT_ROOT, "partner-live.css"), "utf8");
  const voicePacks = fs.readFileSync(path.join(PROJECT_ROOT, "voice-pack-ui.css"), "utf8");

  assert.match(styles, /\.link-btn\s*\{[^}]*min-height:\s*44px/u);
  assert.match(vocab, /\.home-vocab-bottom button\s*\{[^}]*min-height:\s*44px/u);
  assert.match(vocab, /#view-library \.vocab-search input,\s*#view-library \.vocab-category-wrap select\s*\{\s*font-size:\s*16px/u);
  assert.match(partner, /\.partner-mode-tabs button\s*\{[^}]*min-height:\s*44px/u);
  assert.match(partner, /\.partner-live-open\s*\{[^}]*min-height:\s*48px/u);
  assert.match(partner, /\.partner-code textarea, \.partner-code-input textarea\s*\{[^}]*font:\s*16px/u);
  assert.match(partner, /\.partner-composer textarea\s*\{[^}]*font-size:\s*16px/u);
  assert.match(partner, /\.partner-correction-box input\s*\{[^}]*min-height:\s*44px[^}]*font-size:\s*16px/u);
  assert.match(partner, /\.partner-safety-actions button\s*\{[^}]*min-height:\s*44px/u);
  assert.match(voicePacks, /\.voice-pack-row button\s*\{[^}]*min-height:\s*44px/u);
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

test("Android entry is light and direction choice returns to the main menu", () => {
  const css = fs.readFileSync(path.join(PROJECT_ROOT, "styles.css"), "utf8");
  const html = fs.readFileSync(path.join(PROJECT_ROOT, "index.html"), "utf8");
  const manifest = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, "manifest.webmanifest"), "utf8"));
  const app = fs.readFileSync(path.join(PROJECT_ROOT, "app.js"), "utf8");

  assert.match(html, /name="theme-color"\s+content="#5aa6a2"/u);
  assert.equal(manifest.background_color, "#f1e4c7");
  assert.equal(manifest.theme_color, "#5aa6a2");
  assert.match(css, /V12\.2\.2[^]*?\.direction-screen\s*\{[^}]*#f8f4eb/u);
  assert.match(css, /\.direction-continue\s*\{\s*display:\s*none;/u);
  assert.match(app, /function\s+enterSelectedDirection\([^)]*\)[^]*?navigate\("home", \{ history: "replace" \}\);/u);
  assert.match(app, /#direction-cards[^]*?enterSelectedDirection\(card\.dataset\.direction\)/u);
});

test("a fresh offline PWA explains lazy modules without issuing doomed requests", () => {
  const app = fs.readFileSync(path.join(PROJECT_ROOT, "app.js"), "utf8");
  const css = fs.readFileSync(path.join(PROJECT_ROOT, "open-ui.css"), "utf8");

  assert.match(app, /async function featureBundleReachable\(name\)/);
  assert.match(app, /await window\.caches\.match\(url\)\.catch\(\(\) => null\)/);
  assert.match(app, /await window\.fetch\(url, \{ cache: "force-cache" \}\)/);
  assert.match(app, /navigator\.onLine is frequently stale in embedded Android browsers/);
  assert.match(app, /if \(!await featureBundleReachable\(name\)\) throw new Error/);
  assert.match(app, /首次使用这个模块需要联网/);
  assert.match(css, /\.runtime-feature-unavailable/);
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
  assert.match(css, /@media\s*\(max-width:\s*430px\)\s*and\s*\(max-height:\s*700px\)[^]*?\.confirm-actions\s*\{[^}]*position:\s*relative;[^}]*bottom:\s*auto;/u);
  assert.match(shortScreen, /\.npc-scene\s*\{[^}]*min-height:\s*150px;/u);
  assert.match(shortScreen, /\.lesson-scroll-hint\s*\{[^}]*display:\s*flex;/u);
  assert.match(css, /#onboarding-select-step \.onboarding-bottom\s*\{[^}]*position:\s*relative;[^}]*bottom:\s*auto;/u);
  assert.match(css, /@media\s*\(max-width:\s*430px\)\s*and\s*\(max-height:\s*700px\)[^]*?#onboarding-select-step \.onboarding-bottom\s*\{[^}]*position:\s*relative;[^}]*bottom:\s*auto;/u);
  assert.match(html, /id="lesson-scroll-hint"[^>]*>[^<]*<span[^>]*>↓<\/span>\s*上滑查看全部 3 个答案/u);
});

test("new register controls keep Samsung touch targets and speech feedback accessible", () => {
  const css = fs.readFileSync(path.join(PROJECT_ROOT, "styles.css"), "utf8");
  const speech = fs.readFileSync(path.join(PROJECT_ROOT, "speech-engine.js"), "utf8");
  const commitButton = css.match(/\.vibe-preview-commit button\s*\{([^}]*)\}/u)?.[1] || "";
  const previewButton = css.match(/\.tone-preview-actions button\s*\{([^}]*)\}/u)?.[1] || "";

  assert.match(commitButton, /min-height:\s*44px/u);
  assert.match(previewButton, /min-width:\s*44px/u);
  assert.match(previewButton, /height:\s*44px/u);
  assert.match(speech, /node\.setAttribute\("role", "group"\)[^]*?node\.setAttribute\("aria-live", "off"\)/u);
  assert.match(speech, /speech-error-announcer[^]*?node\.setAttribute\("role", "status"\)[^]*?node\.setAttribute\("aria-live", "polite"\)/u);
});

test("a controlled old PWA reloads exactly once when the new shell takes control", () => {
  const bootstrap = fs.readFileSync(path.join(PROJECT_ROOT, "pwa-bootstrap.js"), "utf8");
  const html = fs.readFileSync(path.join(PROJECT_ROOT, "index.html"), "utf8");
  const worker = fs.readFileSync(path.join(PROJECT_ROOT, "service-worker.js"), "utf8");
  const build = fs.readFileSync(path.join(PROJECT_ROOT, "build-offline.ps1"), "utf8");
  const storage = new Map();
  let controllerChange = null;
  let reloads = 0;
  let registered = 0;
  const context = {
    document: {
      documentElement: { classList: { remove() {}, add() {} }, dataset: {} },
      readyState: "loading",
      addEventListener() {},
    },
    navigator: { serviceWorker: {
      controller: {},
      register() { registered += 1; return Promise.resolve({}); },
      addEventListener(type, handler) { if (type === "controllerchange") controllerChange = handler; },
    }, userAgent: "SamsungBrowser", platform: "Linux", maxTouchPoints: 5 },
    sessionStorage: {
      getItem(key) { return storage.get(key) || null; },
      setItem(key, value) { storage.set(key, value); },
    },
    location: { protocol: "https:", search: "", reload() { reloads += 1; } },
  };

  vm.runInNewContext(bootstrap, context);
  assert.equal(registered, 1);
  assert.equal(typeof controllerChange, "function");
  controllerChange();
  controllerChange();
  assert.equal(reloads, 1);
  assert.equal(storage.get("huilaishi-shell-refresh:huilaishi-offline-v68"), "1");
  assert.ok(html.indexOf('src="pwa-bootstrap.js"') < html.indexOf('href="styles.css"'));
  assert.ok(bootstrap.indexOf('serviceWorker.register("./service-worker.js"') < bootstrap.indexOf('!navigator.serviceWorker.controller'));
  assert.match(bootstrap, /boot-recovery-action/u);
  assert.match(fs.readFileSync(path.join(PROJECT_ROOT, "app.js"), "utf8"), /dataset\.appReady\s*=\s*"true"/u);
  assert.match(worker, /"\.\/pwa-bootstrap\.js"/u);
  assert.match(worker, /request\.destination\s*===\s*"script"[^]*request\.destination\s*===\s*"style"/u);
  assert.match(build, /pwa-bootstrap\.js/u);
});

test("the Samsung stable entry stays in the current page and reveals only a painted worker-free app", () => {
  const safePage = fs.readFileSync(path.join(PROJECT_ROOT, "samsung-v60.html"), "utf8");
  const bootstrap = fs.readFileSync(path.join(PROJECT_ROOT, "pwa-bootstrap.js"), "utf8");
  const app = fs.readFileSync(path.join(PROJECT_ROOT, "app.js"), "utf8");

  assert.doesNotMatch(safePage, /<script[^>]+src=/u);
  assert.doesNotMatch(safePage, /<link[^>]+rel=["']stylesheet/u);
  assert.doesNotMatch(safePage, /\bdvh\b/u);
  assert.match(safePage, /\.safe-shell\s*\{[^]*?position:\s*fixed;[^]*?top:\s*0;[^]*?bottom:\s*0;/u);
  assert.match(safePage, /registration\.scope\.indexOf\("\/huilaishi-app\/"\)/u);
  assert.match(safePage, /key\.indexOf\("huilaishi-"\)\s*===\s*0/u);
  assert.match(safePage, /document\.createElement\("iframe"\)/u);
  assert.match(safePage, /\.\/\?nosw=1&build=v60&from=samsung-current/u);
  assert.match(safePage, /frameIsPainted\(\)[^]*?data-app-ready[^]*?getBoundingClientRect/u);
  assert.match(safePage, /\.frame-stage iframe[^]*?opacity:\s*0;[^]*?visibility:\s*hidden/u);
  assert.match(safePage, /\.frame-stage\.ready iframe[^]*?opacity:\s*1;[^]*?visibility:\s*visible/u);
  assert.doesNotMatch(safePage, /target["'],\s*["']_blank/u);
  assert.doesNotMatch(safePage, /window\.open\(/u);
  assert.match(safePage, /不跳转，[^]*?不再留下空白页/u);
  assert.match(bootstrap, /noServiceWorker[^]*?!noServiceWorker[^]*?serviceWorker\.register/u);
  assert.match(app, /nosw=1[^]*?setOfflineCacheState\("unavailable"/u);
  assert.match(app, /samsungStableEntry[^]*?historyRoute\s*=\s*samsungStableEntry\s*\?\s*null[^]*?defaultRoute\s*=\s*"home"/u);
});

function markedSource(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  assert.ok(start >= 0 && end > start, `${startMarker} block must exist`);
  return source.slice(start, end + endMarker.length);
}

test("Android WebViews with denied localStorage fall back to memory through first-run routing", () => {
  const app = fs.readFileSync(path.join(PROJECT_ROOT, "app.js"), "utf8");
  const deniedStorage = {
    get length() { throw new DOMException("Access denied", "SecurityError"); },
    key() { throw new DOMException("Access denied", "SecurityError"); },
    getItem() { throw new DOMException("Access denied", "SecurityError"); },
    setItem() { throw new DOMException("Access denied", "SecurityError"); },
    removeItem() { throw new DOMException("Access denied", "SecurityError"); }
  };
  const calls = [];
  const context = vm.createContext({ localStorage: deniedStorage, DOMException });
  vm.runInContext(markedSource(app, "// SAFE_STORAGE_START", "// SAFE_STORAGE_END"), context);
  const storage = context.HUILAISHI_STORAGE;

  assert.equal(storage.persistent, false);
  assert.doesNotThrow(() => storage.setItem("learningDirection", "zh-th"));
  assert.equal(storage.getItem("learningDirection"), "zh-th");

  Object.assign(context, {
    product: { "zh-th": {} },
    pendingDirection: null,
    selectDirection: direction => calls.push(`select:${direction}`),
    applyDirection: direction => {
      calls.push(`apply:${direction}`);
      storage.setItem("learningDirection", direction);
    },
    navigate: view => calls.push(`navigate:${view}`),
    showToast: () => calls.push("toast")
  });
  const routeStart = app.indexOf("function enterSelectedDirection");
  const routeEnd = app.indexOf("\nfunction showDirection", routeStart);
  assert.ok(routeStart >= 0 && routeEnd > routeStart);
  vm.runInContext(app.slice(routeStart, routeEnd), context);

  assert.doesNotThrow(() => vm.runInContext('enterSelectedDirection("zh-th")', context));
  assert.deepEqual(calls, ["select:zh-th", "apply:zh-th", "navigate:home", "toast"]);
});

test("embedded Android browsers retain an interactive app instead of a full-screen guard", () => {
  const app = fs.readFileSync(path.join(PROJECT_ROOT, "app.js"), "utf8");
  const css = fs.readFileSync(path.join(PROJECT_ROOT, "styles.css"), "utf8");
  const guardStart = app.indexOf("function enforceTopLevelContext");
  const guardEnd = app.indexOf("\nfunction init", guardStart);
  const guardSource = app.slice(guardStart, guardEnd);
  const classes = new Set(["hidden"]);
  const pointerHandlers = {};
  const guard = {
    classList: {
      add: value => classes.add(value),
      remove: value => classes.delete(value)
    },
    setAttribute() {},
    removeAttribute() {}
  };
  const appNode = { addEventListener: (type, handler) => { pointerHandlers[type] = handler; } };
  const link = { href: "" };
  const context = vm.createContext({
    window: { top: {}, self: {} },
    location: { href: "https://example.test/app/" },
    $: selector => ({ "#frame-guard": guard, "#frame-guard-link": link, "#app": appNode })[selector]
  });

  vm.runInContext(guardSource, context);
  assert.equal(vm.runInContext("enforceTopLevelContext()", context), false);
  assert.equal(classes.has("embedded-notice"), true);
  assert.equal(classes.has("hidden"), false);
  assert.equal("inert" in appNode, false);
  assert.equal(typeof pointerHandlers.pointerdown, "function");
  pointerHandlers.pointerdown();
  assert.equal(classes.has("hidden"), true);
  classes.delete("embedded-notice");
  context.location.search = "?nosw=1&from=samsung-current";
  assert.equal(vm.runInContext("enforceTopLevelContext()", context), false);
  assert.equal(classes.has("embedded-notice"), false);
  assert.equal(classes.has("hidden"), true);
  assert.doesNotMatch(guardSource, /\.inert\s*=|aria-hidden/u);
  assert.match(app, /function init\(\)\s*\{\s*enforceTopLevelContext\(\);\s*bindEvents\(\);/u);
  assert.match(css, /\.frame-guard\.embedded-notice\s*\{[^}]*inset:\s*auto[^}]*background:\s*transparent[^}]*pointer-events:\s*none;/u);
});
