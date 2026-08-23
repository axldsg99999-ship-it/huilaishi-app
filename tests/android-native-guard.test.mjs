import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = relativePath => readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");

test("Android launcher is a persistent WebView-free native task root", async () => {
  const launcher = await read("android-native/LauncherActivity.java");
  const heartbeat = await read("android-native/CourseProcessWatchService.java");
  const guardCommit = launcher.indexOf("boolean persisted = startupPrefs.edit()");
  const heartbeatBind = launcher.indexOf("bindService(");
  const courseStart = launcher.indexOf("startActivityForResult(course, COURSE_REQUEST)");

  assert.match(launcher, /class LauncherActivity extends Activity/);
  assert.match(launcher, /showNativeHome\(\)/);
  assert.match(launcher, /进入课程（稳定模式）/);
  assert.match(launcher, /huilaishi-native-landing/);
  assert.match(launcher, /huilaishi-native-recovery/);
  assert.match(launcher, /huilaishi-enter-course/);
  assert.match(launcher, /enter\.setContentDescription\("进入课程，三星稳定模式"\)/);
  assert.doesNotMatch(launcher, /scroll\.setContentDescription\(/, "page containers must not hide child controls from accessibility");
  assert.match(launcher, /pendingPageRoot = scroll;[\s\S]*?setContentView\(pageRoot\)/, "complete native pages must be attached in one layout pass");
  assert.match(launcher, /setClassName\(getPackageName\(\), getPackageName\(\) \+ "\.MainActivity"\)/);
  assert.ok(guardCommit >= 0 && guardCommit < courseStart, "pending marker must commit before course launch");
  assert.ok(heartbeatBind >= 0 && heartbeatBind < courseStart, "Binder heartbeat must connect before risky course startup");
  assert.match(launcher, /onServiceDisconnected[\s\S]*?handleCourseProcessDeath/);
  assert.match(launcher, /handleCourseProcessDeath[\s\S]*?FLAG_ACTIVITY_CLEAR_TOP/);
  assert.doesNotMatch(launcher, /MainActivity\.class/);
  assert.doesNotMatch(launcher, /androidx?\.webkit|WebViewCompat|new WebView/);
  assert.doesNotMatch(launcher, /\bfinish\s*\(/, "native launcher must stay below the course");
  assert.match(launcher, /复制诊断信息/);
  assert.match(launcher, /getHistoricalProcessExitReasons/);
  assert.match(launcher, /CRASH_NATIVE/);
  assert.match(heartbeat, /class CourseProcessWatchService extends Service/);
  assert.match(heartbeat, /return heartbeat/);
  assert.doesNotMatch(heartbeat, /android\.webkit|new WebView|Capacitor/);
});

test("Android course host returns failures to Launcher and clears pending only after first paint", async () => {
  const main = await read("android-native/MainActivity.java");
  const listenerIndex = main.indexOf("bridgeBuilder.addWebViewListener");
  const bridgeStartIndex = main.indexOf("super.onCreate(savedInstanceState)");
  const pageVisibleMethod = /private void markStartupHealthy[\s\S]*?\n    }/.exec(main)?.[0] || "";
  const onStopMethod = /public void onStop\(\)[\s\S]*?\n    }/.exec(main)?.[0] || "";
  const onNewIntentMethod = /protected void onNewIntent\(Intent intent\)[\s\S]*?\n    }/.exec(main)?.[0] || "";

  assert.ok(listenerIndex >= 0 && listenerIndex < bridgeStartIndex, "listener registration intent must precede bridge startup");
  assert.match(main, /catch \(Throwable startupFailure\)[\s\S]*?returnToLauncher\("MAIN_ON_CREATE"/);
  assert.match(main, /returnToLauncher\("RENDERER_GONE"/);
  assert.match(main, /bridge\.onDestroy\(\);[\s\S]*?finally \{\s*bridge = null;/);
  assert.match(main, /webView\.destroy\(\)/);
  assert.match(main, /getPackageName\(\)\.endsWith\("\.samsung"\)/);
  assert.match(main, /View\.LAYER_TYPE_SOFTWARE/);
  assert.match(main, /WebView\.setDataDirectorySuffix\("huilaishi_course"\)/);
  assert.match(main, /setRendererPriorityPolicy/);
  assert.match(main, /setResult\(RESULT_OK, courseResult\("PAGE_VISIBLE"/);
  assert.match(pageVisibleMethod, /putBoolean\(PREF_START_PENDING, false\)[\s\S]*?\.commit\(\)/);
  assert.doesNotMatch(onStopMethod, /putBoolean\(PREF_START_PENDING, false\)|clearPendingStart/);
  assert.doesNotMatch(onNewIntentMethod, /putBoolean\(PREF_START_PENDING, false\)|clearPendingStart/);
  assert.doesNotMatch(main, /FLAG_ACTIVITY_CLEAR_TASK|showNativeSafeMode|restartWithMode/);
  assert.match(main, /FLAG_DEBUGGABLE/);
  assert.match(main, /chrome:\/\/crash/);
  assert.match(main, /CI_FORCE_COURSE_PROCESS_DEATH/);
  assert.match(main, /Process\.killProcess\(android\.os\.Process\.myPid\(\)\)/);
});

test("Android generator isolates course and disables activity-level hardware acceleration", async () => {
  const generator = await read("scripts/configure-android.mjs");

  assert.match(generator, /process: ":course"/);
  assert.match(generator, /launchMode: "standard"/);
  assert.match(generator, /hardwareAccelerated: "false"/);
  assert.match(generator, /android:launchMode="singleTask"/);
  assert.match(generator, /android:hardwareAccelerated="false"/);
  assert.match(generator, /android:theme="@style\/AppTheme\.NoActionBar"/);
  assert.doesNotMatch(generator, /LauncherActivity[\s\S]{0,300}AppTheme\.NoActionBarLaunch/, "native controls must not inherit the bitmap splash background");
  assert.match(generator, /android:name="\.CourseProcessWatchService"/);
  assert.match(generator, /CourseProcessWatchService must be a private :course Binder heartbeat/);
  assert.match(generator, /MainActivity must be a private software-rendered standard activity in :course/);
  assert.match(generator, /LauncherActivity must remain WebView-free/);
});

test("Android R2 identity and visible badge stay aligned", async () => {
  const generator = await read("scripts/configure-android.mjs");

  assert.match(generator, /com\.huilaishi\.app\.samsung/);
  assert.match(generator, /会来事·三星安全版/);
  assert.match(generator, /const VERSION_CODE = 120206/);
  assert.match(generator, /12\.2\.6-samsung\.2/);
  assert.match(generator, /三星安全版 · 12\.2\.6-R2/);
  assert.match(generator, /androidx\.webkit:webkit:\$androidxWebkitVersion/);
});
