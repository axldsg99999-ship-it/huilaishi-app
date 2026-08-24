import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = relativePath => readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");

test("Android launcher is a persistent WebView-free native task root", async () => {
  const launcher = await read("android-native/LauncherActivity.java");
  const heartbeat = await read("android-native/CourseProcessWatchService.java");
  const exitInfo = await read("android-native/ExitInfoApi30.java");
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
  assert.match(launcher, /setClassName\(getPackageName\(\), getPackageName\(\) \+ "\.CourseActivity"\)/);
  assert.ok(guardCommit >= 0 && guardCommit < courseStart, "pending marker must commit before course launch");
  assert.ok(heartbeatBind >= 0 && heartbeatBind < courseStart, "Binder heartbeat must connect before risky course startup");
  assert.match(launcher, /onServiceDisconnected[\s\S]*?handleCourseProcessDeath/);
  assert.match(launcher, /COURSE_BIND_TIMEOUT_MS = 15_000L/);
  assert.match(launcher, /postDelayed\(courseBindTimeout, COURSE_BIND_TIMEOUT_MS\)/);
  assert.match(launcher, /removeCallbacks\(courseBindTimeout\)/);
  assert.match(launcher, /CI_FORCE_STALE_TASK_MIGRATION/);
  assert.match(launcher, /maybeRunHistoricalTaskMigrationTest/);
  assert.match(launcher, /handleCourseProcessDeath[\s\S]*?FLAG_ACTIVITY_CLEAR_TOP/);
  assert.doesNotMatch(launcher, /CourseActivity\.class/);
  assert.doesNotMatch(launcher, /androidx?\.webkit|WebViewCompat|new WebView/);
  assert.doesNotMatch(launcher, /\bfinish\s*\(/, "native launcher must stay below the course");
  assert.match(launcher, /复制诊断信息/);
  assert.doesNotMatch(launcher, /ApplicationExitInfo/);
  assert.match(exitInfo, /getHistoricalProcessExitReasons/);
  assert.match(exitInfo, /CRASH_NATIVE/);
  assert.match(heartbeat, /class CourseProcessWatchService extends Service/);
  assert.match(heartbeat, /return heartbeat/);
  assert.doesNotMatch(heartbeat, /android\.webkit|new WebView|Capacitor/);
});

test("Android course host returns failures to Launcher and clears pending only after first paint", async () => {
  const course = await read("android-native/CourseActivity.java");
  const listenerIndex = course.indexOf("bridgeBuilder.addWebViewListener");
  const bridgeStartIndex = course.indexOf("super.onCreate(savedInstanceState)");
  const pageVisibleMethod = /private void markStartupHealthy[\s\S]*?\n    }/.exec(course)?.[0] || "";
  const onStopMethod = /public void onStop\(\)[\s\S]*?\n    }/.exec(course)?.[0] || "";
  const onNewIntentMethod = /protected void onNewIntent\(Intent intent\)[\s\S]*?\n    }/.exec(course)?.[0] || "";

  assert.ok(listenerIndex >= 0 && listenerIndex < bridgeStartIndex, "listener registration intent must precede bridge startup");
  assert.match(course, /catch \(Throwable startupFailure\)[\s\S]*?returnToLauncher\("MAIN_ON_CREATE"/);
  assert.match(course, /returnToLauncher\("RENDERER_GONE"/);
  assert.match(course, /bridge\.onDestroy\(\);[\s\S]*?finally \{\s*bridge = null;/);
  assert.match(course, /webView\.destroy\(\)/);
  assert.match(course, /getPackageName\(\)\.endsWith\("\.samsung"\)/);
  assert.match(course, /View\.LAYER_TYPE_SOFTWARE/);
  assert.match(course, /WebView\.setDataDirectorySuffix\("huilaishi_course"\)/);
  assert.match(course, /setRendererPriorityPolicy/);
  assert.match(course, /setResult\(RESULT_OK, courseResult\("PAGE_VISIBLE"/);
  assert.match(pageVisibleMethod, /putBoolean\(PREF_START_PENDING, false\)[\s\S]*?\.commit\(\)/);
  assert.doesNotMatch(onStopMethod, /putBoolean\(PREF_START_PENDING, false\)|clearPendingStart/);
  assert.doesNotMatch(onNewIntentMethod, /putBoolean\(PREF_START_PENDING, false\)|clearPendingStart/);
  assert.doesNotMatch(course, /FLAG_ACTIVITY_CLEAR_TASK|showNativeSafeMode|restartWithMode/);
  assert.match(course, /FLAG_DEBUGGABLE/);
  assert.match(course, /chrome:\/\/crash/);
  assert.match(course, /CI_FORCE_COURSE_PROCESS_DEATH/);
  assert.match(course, /Process\.killProcess\(android\.os\.Process\.myPid\(\)\)/);
});

test("historical MainActivity is a WebView-free upgrade-task redirect", async () => {
  const main = await read("android-native/MainActivity.java");

  assert.match(main, /class MainActivity extends Activity/);
  assert.match(main, /STALE_UPGRADE_TASK_REDIRECT/);
  assert.match(main, /FLAG_ACTIVITY_NEW_TASK/);
  assert.match(main, /FLAG_ACTIVITY_CLEAR_TASK/);
  assert.match(main, /ActivityManager\.AppTask/);
  assert.match(main, /finishAndRemoveTask\(\)/);
  assert.match(main, /\.LauncherActivity/);
  assert.doesNotMatch(main, /BridgeActivity|android\.webkit|androidx\.webkit|new WebView/);
});

test("Android generator isolates course and disables activity-level hardware acceleration", async () => {
  const generator = await read("scripts/configure-android.mjs");

  assert.match(generator, /process: ":course"/);
  assert.match(generator, /launchMode: "standard"/);
  assert.match(generator, /hardwareAccelerated: "false"/);
  assert.match(generator, /android:launchMode="singleTask"/);
  assert.match(generator, /android:hardwareAccelerated="false"/);
  assert.match(generator, /android:theme="@android:style\/Theme\.Material\.Light\.NoActionBar"/);
  assert.match(generator, /android:name="\.CourseActivity"/);
  assert.match(generator, /android:name="androidx\.startup\.InitializationProvider"/);
  assert.match(generator, /AndroidX Startup and FileProvider must not initialize in the native launcher process/);
  assert.doesNotMatch(generator, /LauncherActivity[\s\S]{0,300}AppTheme\.NoActionBarLaunch/, "native controls must not inherit the bitmap splash background");
  assert.match(generator, /android:name="\.CourseProcessWatchService"/);
  assert.match(generator, /CourseProcessWatchService must be a private :course Binder heartbeat/);
  assert.match(generator, /MainActivity must remain a WebView-free migration component/);
  assert.match(generator, /CourseActivity must be the private software-rendered host in :course/);
  assert.match(generator, /LauncherActivity must remain WebView-free/);
});

test("Android 12.6 R1 identity and visible badge stay aligned", async () => {
  const [generator, launcher] = await Promise.all([
    read("scripts/configure-android.mjs"),
    read("android-native/LauncherActivity.java"),
  ]);

  assert.match(generator, /com\.huilaishi\.app\.samsung/);
  assert.match(generator, /会来事·三星安全版/);
  assert.match(generator, /const VERSION_CODE = 120600/);
  assert.match(generator, /12\.6\.0-samsung\.1/);
  assert.match(generator, /三星安全版 · 12\.6-R1/);
  assert.match(launcher, /三星安全版 · 12\.6-R1/);
  assert.match(generator, /androidx\.webkit:webkit:\$androidxWebkitVersion/);
});

test("Android package curates and verifies both L1 word-head voice packs", async () => {
  const generator = await read("scripts/configure-android.mjs");
  let clips = 0;
  let bytes = 0;

  for (const direction of ["zh-th", "th-zh"]) {
    const manifestUrl = new URL(`../voice-packs/v11-standard/${direction}/l1/manifest.json`, import.meta.url);
    const manifest = JSON.parse(await readFile(manifestUrl, "utf8"));
    const entries = manifest.entries.filter(entry => entry.ready && entry.kinds?.includes("word"));
    assert.equal(entries.length, 500, `${direction} must provide 500 ready L1 word heads`);
    for (const entry of entries) {
      assert.ok(entry.aliases.some(alias => /:word:(?:zh|th)$/.test(alias)), `${direction}/${entry.id} must expose a word alias`);
      const audio = await readFile(new URL(entry.file, manifestUrl));
      assert.equal(audio.byteLength, entry.bytes, `${direction}/${entry.id} byte count`);
      assert.equal(createHash("sha256").update(audio).digest("hex"), entry.sha256, `${direction}/${entry.id} hash`);
      clips += 1;
      bytes += audio.byteLength;
    }
  }

  assert.equal(clips, 1_000);
  assert.equal(bytes, 10_472_904);
  assert.match(generator, /EXPECTED_BUNDLED_L1_WORD_AUDIO_COUNT = 1_000/);
  assert.match(generator, /EXPECTED_BUNDLED_L1_WORD_AUDIO_BYTES = 10_472_904/);
  assert.match(generator, /if \(root\.HUILAISHI_NATIVE_ANDROID\) return found\.url/);
  assert.match(generator, /return !root\.HUILAISHI_NATIVE_ANDROID && !isFileProtocol\(\)/);
  assert.match(generator, /Android bundled voice clip failed packaged size\/hash validation/);
  assert.match(generator, /L1 词头示范音已随 APK 内置/);
});

test("Android release and signed-upgrade workflows cover the public 12.6 package", async () => {
  const buildWorkflow = await read(".github/workflows/android-apk.yml");
  const diagnosticWorkflow = await read(".github/workflows/android-launch-diagnostics.yml");
  const launchScript = await read("scripts/android-launch-diagnostics.sh");
  const upgradeScript = await read("scripts/android-upgrade-diagnostics.sh");
  const downloadPage = await read("download.html");

  assert.match(buildWorkflow, /sha256sum \*\.apk > SHA256SUMS-ARTIFACT\.txt/);
  assert.match(buildWorkflow, /sha256sum \*-release\.apk > SHA256SUMS\.txt/);
  assert.match(buildWorkflow, /huilaishi-samsung-12\.6\.0-r1-release\.apk/);
  assert.match(buildWorkflow, /versionCode='120600' versionName='12\.6\.0-samsung\.1'/);
  assert.match(diagnosticWorkflow, /huilaishi-samsung-android-v12\.6\.0-r1/);
  assert.match(diagnosticWorkflow, /android-signed-upgrade-\$\{\{ matrix\.from \}\}-to-12\.6-R1/);
  assert.match(diagnosticWorkflow, /v12\.2\.7-samsung\.3\/huilaishi-samsung-12\.2\.7-r3-release\.apk/);
  assert.match(diagnosticWorkflow, /from: R3\s+old_mode: course/);
  assert.match(diagnosticWorkflow, /v12\.3\.0-samsung\.1\/huilaishi-samsung-12\.3\.0-r1-release\.apk/);
  assert.match(diagnosticWorkflow, /from: 12\.3-R1\s+old_mode: course/);
  assert.match(diagnosticWorkflow, /v12\.4\.0-samsung\.1\/huilaishi-samsung-12\.4\.0-r1-release\.apk/);
  assert.match(diagnosticWorkflow, /from: 12\.4-R1\s+old_mode: course/);
  assert.match(diagnosticWorkflow, /v12\.5\.0-samsung\.1\/huilaishi-samsung-12\.5\.0-r1-release\.apk/);
  assert.match(diagnosticWorkflow, /from: 12\.5-R1\s+old_mode: course/);
  assert.match(diagnosticWorkflow, /matrix\.apk-kind == 'debug' && inputs\.build_run_id == ''/);
  assert.match(launchScript, /adb shell pidof "\$\{wanted\}"/);
  assert.match(launchScript, /pid_exact_retry\(\)/);
  assert.match(launchScript, /pid_exact_retry "\$\{package_name\}" \| grep -Eq/);
  assert.match(upgradeScript, /expected_old_component="CourseActivity"/);
  assert.match(upgradeScript, /retained-course-task-resumed/);
  assert.match(upgradeScript, /HuilaishiCourse: event=PAGE_VISIBLE/);
  assert.match(upgradeScript, /desktop_entry_marker=""/);
  assert.match(upgradeScript, /text="课程已安全退出"/);
  assert.match(upgradeScript, /content-desc="稳定模式重试，推荐"/);
  assert.match(upgradeScript, /tap_marker "\$\{desktop_entry_marker\}" "desktop-enter"/);
  assert.match(downloadPage, /PUBLIC BETA · V12\.6/);
  assert.match(downloadPage, /v12\.6\.0-samsung\.1\/huilaishi-samsung-12\.6\.0-r1-release\.apk/);
  assert.doesNotMatch(downloadPage, /huilaishi-latest-offline\.html/);
});
