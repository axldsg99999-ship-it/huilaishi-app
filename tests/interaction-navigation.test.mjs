import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(TEST_DIR, "..");
const appSource = fs.readFileSync(path.join(PROJECT_ROOT, "app.js"), "utf8");
const arcadeSource = fs.readFileSync(path.join(PROJECT_ROOT, "arcade.js"), "utf8");
const htmlSource = fs.readFileSync(path.join(PROJECT_ROOT, "index.html"), "utf8");
const openUiSource = fs.readFileSync(path.join(PROJECT_ROOT, "open-ui.css"), "utf8");

function loadRouteHelpers() {
  const start = appSource.indexOf('const APP_HISTORY_STATE_KEY = "huilaishiAppRoute";');
  const end = appSource.indexOf("// SAFE_STORAGE_START");
  assert.ok(start >= 0 && end > start, "route helper block must stay before storage initialization");
  const stack = [];
  const sessionValues = new Map();
  const sandbox = {
    document: { querySelector() { return null; }, querySelectorAll() { return []; } },
    location: { href: "https://example.test/app/" },
    performance: { getEntriesByType() { return [{ type: "reload" }]; } },
    sessionStorage: {
      getItem(key) { return sessionValues.get(key) ?? null; },
      setItem(key, value) { sessionValues.set(String(key), String(value)); }
    },
    history: {
      state: null,
      replaceState(state) { this.state = structuredClone(state); stack.push({ kind: "replace", state: this.state }); },
      pushState(state) { this.state = structuredClone(state); stack.push({ kind: "push", state: this.state }); },
      back() { stack.push({ kind: "back" }); }
    },
    restoreApplicationRoute() { return "home"; }
  };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(`${appSource.slice(start, end)}\n;globalThis.__routeHelpers = { normalizeAppRoute, rememberAppRoute, readSessionAppRoute, shouldRestoreSessionRoute };`, sandbox);
  return { helpers: sandbox.__routeHelpers, history: sandbox.history, stack, sessionValues };
}

test("application routes create one in-app history entry per real view change", () => {
  const { helpers, history, stack } = loadRouteHelpers();
  assert.equal(helpers.rememberAppRoute("home", "replace"), true);
  assert.deepEqual(JSON.parse(JSON.stringify(history.state)), { huilaishiAppRoute: "home", huilaishiAppDepth: 0 });

  assert.equal(helpers.rememberAppRoute("library"), true);
  assert.equal(history.state.huilaishiAppRoute, "library");
  assert.equal(history.state.huilaishiAppDepth, 1);
  assert.equal(stack.at(-1).kind, "push");

  helpers.rememberAppRoute("library");
  assert.equal(stack.at(-1).kind, "replace", "tapping the active tab must not create a duplicate Back step");
  assert.equal(history.state.huilaishiAppDepth, 1);
  assert.equal(helpers.rememberAppRoute("javascript:"), false);

  assert.equal(helpers.rememberAppRoute("home", "root"), true);
  assert.equal(history.state.huilaishiAppRoute, "home");
  assert.equal(history.state.huilaishiAppDepth, 0, "finishing first-run setup must establish a clean in-app root");
  assert.equal(stack.at(-1).kind, "replace");
});

test("reload restoration only accepts allow-listed app routes", () => {
  const { helpers, sessionValues } = loadRouteHelpers();
  sessionValues.set("huilaishi-app-route-v1", "battle");
  assert.equal(helpers.shouldRestoreSessionRoute(), true);
  assert.equal(helpers.readSessionAppRoute(), "battle");
  sessionValues.set("huilaishi-app-route-v1", "https://evil.example/");
  assert.equal(helpers.readSessionAppRoute(), null);
  assert.equal(helpers.normalizeAppRoute("lesson"), "lesson");
  assert.equal(helpers.normalizeAppRoute("about:blank"), null);
});

test("popstate restoration coexists with the local-battle exit guard", () => {
  assert.match(appSource, /window\.addEventListener\("popstate", handleApplicationPopState\)/u);
  assert.match(appSource, /function handleApplicationPopState\(event\) \{\s*if \(localBattleOpen\) \{\s*handleLocalBattlePopState\(\);\s*return;/u);
  assert.match(appSource, /history\.pushState\(\{ \.\.\.\(history\.state \|\| \{\}\), \[APP_HISTORY_STATE_KEY\]: activeAppRoute \|\| "battle", huilaishiLocalBattle: true \}/u);
  assert.match(appSource, /const defaultRoute = "home";\s*const requestedRoute = historyRoute \|\| reloadRoute \|\| defaultRoute;/u);
  assert.match(appSource, /const restoredRoute = restoreApplicationRoute\(requestedRoute\);\s*rememberAppRoute\(restoredRoute, "replace"\);/u);
});

test("system Back dismisses ordinary sheets and arcade before leaving the app route", () => {
  assert.match(appSource, /const visibleSheet = \$\$\("\.bottom-sheet"\)\.find\(node => !node\.classList\.contains\("hidden"\)\);/u);
  assert.match(appSource, /if \(visibleSheet\) \{[\s\S]*?closeSheets\(\);[\s\S]*?rememberAppRoute\(routeToKeep, "push"\);[\s\S]*?return;/u);
  assert.match(appSource, /const arcadeWasOpen = !\$\("#arcade-sheet"\)\?\.classList\.contains\("hidden"\);/u);
  assert.match(appSource, /if \(arcadeWasOpen\) globalThis\.ArcadeUI\?\.close\?\.\(\);/u);
  assert.match(arcadeSource, /window\.ArcadeUI = \{\s*render: renderHall,\s*close: closeGame,/u);
});

test("home is the stable root while guided register setup remains optional", () => {
  assert.match(appSource, /function enterSelectedDirection\([^)]*\)[\s\S]*?navigate\("home", \{ history: "replace" \}\);/u);
  assert.match(appSource, /setOnboardingStage\("confirm", true, onboardingIsFirstRun \? "replace" : "push"\);/u);
  assert.match(appSource, /#confirm-start-task[\s\S]*?safeStorage\.setItem\(onboardingKey\(\), "1"\);[\s\S]*?rememberAppRoute\("home", "root"\);[\s\S]*?startLesson\(\);/u);
});

test("a fresh launch presents a real four-option main menu before learning content", () => {
  assert.match(htmlSource, /class="home-main-menu"[\s\S]*?id="main-menu-lesson"[\s\S]*?data-nav="library"[\s\S]*?data-nav="live"[\s\S]*?data-nav="battle"/u);
  assert.match(htmlSource, /id="main-menu-direction"[\s\S]*?id="main-menu-mode"/u);
  assert.match(appSource, /#main-menu-lesson"\)\.addEventListener\("click", startLesson\)/u);
  assert.match(appSource, /#main-menu-direction"\)\.addEventListener\("click", showDirection\)/u);
  assert.match(appSource, /#home-change-mode"\)\.addEventListener\("click", \(\) => openSheet\("mode-sheet"\)\)/u);
  assert.match(openUiSource, /\.main-menu-card\s*\{[^}]*min-height:\s*98px/u);
  assert.match(openUiSource, /\.home-main-menu-settings button\s*\{[^}]*min-height:\s*48px/u);
});

test("direction settings have an explicit compact-phone exit", () => {
  assert.match(htmlSource, /id="close-direction"[^>]*aria-label="返回上一页"/u);
  assert.match(appSource, /#close-direction"\)\.addEventListener\("click", \(\) => returnToPreviousAppRoute\("home"\)\)/u);
  assert.match(appSource, /function showDirection[\s\S]*?#close-direction"\)\.classList\.remove\("hidden"\)/u);
  assert.match(openUiSource, /\.direction-close\s*\{[^}]*width:\s*44px;[^}]*height:\s*44px/u);
});

test("flash matching has an untimed rules screen and a compact timed board", () => {
  const startMatch = arcadeSource.match(/function startMatch\(base\) \{[\s\S]*?\n  \}/u)?.[0] || "";
  const countdown = arcadeSource.match(/function beginMatchCountdown\(\) \{[\s\S]*?\n  \}/u)?.[0] || "";
  const startTimer = arcadeSource.match(/function startMatchTimer\(\) \{[\s\S]*?\n  \}/u)?.[0] || "";
  const renderMatch = arcadeSource.match(/function renderMatch\(\) \{[\s\S]*?\n  \}/u)?.[0] || "";

  assert.match(startMatch, /phase: "ready"/u);
  assert.match(startMatch, /renderMatchReady\(\)/u);
  assert.doesNotMatch(startMatch, /setInterval/u, "opening the game must not start its clock");
  assert.match(countdown, /game\.phase !== "ready"/u);
  assert.match(countdown, /let remaining = 3/u);
  assert.match(countdown, /schedule\(startMatchTimer, 1000\)/u);
  assert.match(startTimer, /game\.endsAt = game\.startedAt \+ 60_000/u);
  assert.match(startTimer, /setInterval/u);
  assert.match(renderMatch, /class="match-board" role="group"/u);
  assert.doesNotMatch(renderMatch, /class="arcade-prompt"/u, "timed short-screen board must not retain the large rules prompt");
  assert.match(arcadeSource, /const matchStart = event\.target\.closest\("\[data-match-start\]"\); if \(matchStart\) return beginMatchCountdown\(\);/u);
});

test("game labels no longer pretend every game lasts ten seconds or use template-English numbering", () => {
  assert.doesNotMatch(appSource, /10 秒一局|รอบละ 10 วินาที|CURRENT REGISTER|当前人设|人设话术库/u);
  assert.match(appSource, /battleEyebrow: "场景语气挑战"/u);
  assert.doesNotMatch(arcadeSource, /GAME 0[1-8]/u);
  assert.match(arcadeSource, /match: \["01 · 60 秒"/u);
  assert.match(arcadeSource, /audio: \["02 · 8 题"/u);
});
