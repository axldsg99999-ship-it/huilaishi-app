import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = relativePath => readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");

test("Android launcher breaks an incomplete-start crash loop without creating a WebView", async () => {
  const launcher = await read("android-native/LauncherActivity.java");

  assert.match(launcher, /class LauncherActivity extends Activity/);
  assert.match(launcher, /previousStartIncomplete/);
  assert.match(launcher, /PREF_START_PENDING/);
  assert.match(launcher, /showRecovery\(reason\)/);
  assert.doesNotMatch(launcher, /new WebView|extends BridgeActivity/);
  assert.match(launcher, /WebViewCompat\.getCurrentWebViewPackage/);
});

test("Android MainActivity handles renderer loss and offers Samsung software recovery", async () => {
  const main = await read("android-native/MainActivity.java");
  const listenerIndex = main.indexOf("bridgeBuilder.addWebViewListener");
  const bridgeStartIndex = main.indexOf("super.onCreate(savedInstanceState)");

  assert.ok(listenerIndex >= 0 && listenerIndex < bridgeStartIndex, "renderer listener must be registered before bridge startup");
  assert.match(main, /catch \(Throwable startupFailure\)/);
  assert.match(main, /recordStartupFailure\("MAIN_ON_CREATE", startupFailure\);\s*disposePartiallyCreatedBridge\(\);/);
  assert.match(main, /bridge\.onDestroy\(\);[\s\S]*?finally \{\s*bridge = null;/);
  assert.match(main, /return handleRendererGone\(webView, detail\)/);
  assert.match(main, /webView\.destroy\(\)/);
  assert.match(main, /return true;/);
  assert.match(main, /"samsung"\.equalsIgnoreCase\(Build\.MANUFACTURER\)/);
  assert.match(main, /devices use software WebView compositing from their first start/);
  assert.match(main, /View\.LAYER_TYPE_SOFTWARE/);
  assert.match(main, /setRendererPriorityPolicy/);
  assert.match(main, /FLAG_DEBUGGABLE/);
  assert.match(main, /chrome:\/\/crash/);
});

test("Android generator installs the native guard, private MainActivity, and visible Samsung badge", async () => {
  const generator = await read("scripts/configure-android.mjs");

  assert.match(generator, /com\.huilaishi\.app\.samsung/);
  assert.match(generator, /会来事·三星版/);
  assert.match(generator, /12\.2\.5-samsung\.1/);
  assert.match(generator, /LauncherActivity\.java/);
  assert.match(generator, /android:hardwareAccelerated="true"/);
  assert.match(generator, /android:exported="false"/);
  assert.match(generator, /三星修复版 · 12\.2\.5-S1/);
  assert.match(generator, /Native first-screen Samsung edition badge/);
});
