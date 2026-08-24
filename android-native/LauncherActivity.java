package __ANDROID_PACKAGE__;

import android.app.Activity;
import android.app.ActivityManager;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.provider.Settings;
import android.util.Log;
import android.view.Gravity;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

/**
 * WebView-free task root for the Samsung recovery build.
 *
 * The course is deliberately launched only after a tap and runs in the
 * manifest-declared :course process. This activity stays underneath it, so a
 * course-process crash reveals a usable native recovery screen instead of the
 * home screen or a repeating app crash.
 */
public class LauncherActivity extends Activity {

    private static final String TAG = "HuilaishiNative";
    private static final String GUARD_REVISION = "12.2.7-stale-task-guard-3";
    private static final String PREFS_NAME = "huilaishi_native_startup_guard";
    private static final String PREF_GUARD_REVISION = "guard_revision";
    private static final String PREF_START_PENDING = "start_pending";
    private static final String PREF_LAST_START_AT = "last_start_at";
    private static final String PREF_FAILURES = "startup_failures";
    private static final String PREF_FORCE_SOFTWARE = "force_software_compositor";
    private static final String EXTRA_RETRY = "com.huilaishi.app.extra.NATIVE_RETRY";
    private static final String EXTRA_SOFTWARE_MODE = "com.huilaishi.app.extra.SOFTWARE_MODE";
    private static final String EXTRA_SHOW_SAFE_MODE = "com.huilaishi.app.extra.SHOW_SAFE_MODE";
    private static final String EXTRA_STALE_TASK_REDIRECT = "com.huilaishi.app.extra.STALE_TASK_REDIRECT";
    private static final String EXTRA_FORCE_STALE_TASK_MIGRATION = "com.huilaishi.app.extra.FORCE_STALE_TASK_MIGRATION";
    private static final String EXTRA_FORCE_RENDERER_CRASH = "com.huilaishi.app.extra.FORCE_RENDERER_CRASH";
    private static final String EXTRA_FORCE_COURSE_PROCESS_DEATH = "com.huilaishi.app.extra.FORCE_COURSE_PROCESS_DEATH";
    private static final String EXTRA_COURSE_EVENT = "com.huilaishi.app.extra.COURSE_EVENT";
    private static final String EXTRA_COURSE_DETAIL = "com.huilaishi.app.extra.COURSE_DETAIL";
    private static final String EXTRA_PAGE_VISIBLE = "com.huilaishi.app.extra.PAGE_VISIBLE";
    private static final String STATE_COURSE_IN_FLIGHT = "course_in_flight";
    private static final String STATE_PAUSED_FOR_COURSE = "paused_for_course";
    private static final int COURSE_REQUEST = 120207;
    private static final long STARTUP_WINDOW_MS = 20L * 60L * 1000L;
    private static final long COURSE_BIND_TIMEOUT_MS = 15_000L;

    private SharedPreferences startupPrefs;
    private ScrollView pendingPageRoot;
    private boolean courseLaunchInFlight;
    private boolean pausedForCourse;
    private boolean courseWatchRegistered;
    private boolean courseProcessDeathHandled;
    private boolean courseActivityStarted;
    private boolean pendingRetry;
    private boolean pendingSoftware;
    private String lastCourseEvent = "NATIVE_HOME";
    private String lastCourseDetail = "课程尚未启动";
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private final Runnable courseBindTimeout = () -> {
        if (courseLaunchInFlight && !courseActivityStarted) {
            handleCourseLaunchFailure(new IllegalStateException("Course heartbeat timed out"));
        }
    };
    private final ServiceConnection courseWatchConnection = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName name, IBinder service) {
            mainHandler.removeCallbacks(courseBindTimeout);
            if (!courseLaunchInFlight || courseProcessDeathHandled) {
                releaseCourseWatch();
                return;
            }
            if (courseActivityStarted) return;
            courseActivityStarted = true;
            startCourseActivity();
        }

        @Override
        public void onServiceDisconnected(ComponentName name) {
            handleCourseProcessDeath("Binder heartbeat disconnected");
        }

        @Override
        public void onBindingDied(ComponentName name) {
            handleCourseProcessDeath("Binder heartbeat died");
        }

        @Override
        public void onNullBinding(ComponentName name) {
            handleCourseProcessDeath("Binder heartbeat returned null");
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        startupPrefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        migrateGuardState();

        if (savedInstanceState != null) {
            courseLaunchInFlight = savedInstanceState.getBoolean(STATE_COURSE_IN_FLIGHT, false);
            pausedForCourse = savedInstanceState.getBoolean(STATE_PAUSED_FOR_COURSE, false);
        }

        long now = System.currentTimeMillis();
        long lastStartAt = startupPrefs.getLong(PREF_LAST_START_AT, 0L);
        boolean previousStartIncomplete = startupPrefs.getBoolean(PREF_START_PENDING, false)
            && lastStartAt > 0L
            && now - lastStartAt <= STARTUP_WINDOW_MS;
        boolean forcedSafeMode = getIntent() != null
            && getIntent().getBooleanExtra(EXTRA_SHOW_SAFE_MODE, false);
        boolean staleTaskRedirect = getIntent() != null
            && getIntent().getBooleanExtra(EXTRA_STALE_TASK_REDIRECT, false);

        if (maybeRunHistoricalTaskMigrationTest(getIntent())) return;

        if (staleTaskRedirect) {
            lastCourseEvent = "STALE_UPGRADE_TASK_REDIRECT";
            lastCourseDetail = "旧版课程任务已由原生迁移入口清除";
            Log.w(TAG, diagnosticLine(lastCourseEvent, lastCourseDetail));
            showRecovery("已自动清理旧版残留的闪退任务");
            return;
        }

        if (previousStartIncomplete || forcedSafeMode || courseLaunchInFlight) {
            courseLaunchInFlight = false;
            pausedForCourse = false;
            startupPrefs.edit()
                .putInt(PREF_FAILURES, startupPrefs.getInt(PREF_FAILURES, 0) + 1)
                .commit();
            String reason = forcedSafeMode
                ? "课程网页组件初始化失败"
                : "课程进程在返回原生首页前意外结束";
            showRecovery(reason);
            return;
        }

        // Do not auto-create a WebView. A native first screen makes startup
        // usable even on devices whose WebView provider crashes immediately.
        showNativeHome();
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        releaseCourseWatch();
        if (maybeRunHistoricalTaskMigrationTest(intent)) return;
        if (intent != null && intent.getBooleanExtra(EXTRA_STALE_TASK_REDIRECT, false)) {
            courseLaunchInFlight = false;
            pausedForCourse = false;
            lastCourseEvent = "STALE_UPGRADE_TASK_REDIRECT";
            lastCourseDetail = "旧版课程任务已由原生迁移入口清除";
            Log.w(TAG, diagnosticLine(lastCourseEvent, lastCourseDetail));
            showRecovery("已自动清理旧版残留的闪退任务");
            return;
        }
        if (courseLaunchInFlight || startupPrefs.getBoolean(PREF_START_PENDING, false)) {
            courseLaunchInFlight = false;
            pausedForCourse = false;
            showRecovery("课程已返回原生安全主页");
        } else {
            showNativeHome();
        }
    }

    @Override
    protected void onPause() {
        if (courseLaunchInFlight) pausedForCourse = true;
        super.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        // onActivityResult normally handles this. The lifecycle fallback is
        // what keeps the native task root useful after an ungraceful process
        // death where no result Intent can be delivered.
        if (courseLaunchInFlight && pausedForCourse) {
            courseLaunchInFlight = false;
            pausedForCourse = false;
            releaseCourseWatch();
            showRecovery("课程进程已退出或被系统回收");
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != COURSE_REQUEST) return;

        releaseCourseWatch();
        courseLaunchInFlight = false;
        pausedForCourse = false;
        boolean pageWasVisible = data != null && data.getBooleanExtra(EXTRA_PAGE_VISIBLE, false);
        lastCourseEvent = data == null
            ? (resultCode == RESULT_CANCELED ? "COURSE_PROCESS_RETURNED" : "COURSE_RETURNED")
            : data.getStringExtra(EXTRA_COURSE_EVENT);
        lastCourseDetail = data == null ? "没有收到课程进程诊断" : data.getStringExtra(EXTRA_COURSE_DETAIL);
        if (lastCourseEvent == null) lastCourseEvent = "COURSE_RETURNED";
        if (lastCourseDetail == null) lastCourseDetail = "无附加信息";
        // PAGE_VISIBLE is an explicit handshake from the course process. Do
        // not erase a failed-start marker merely because Android returned a
        // cancelled activity result after killing that process.
        if (pageWasVisible) clearPendingStart();

        String reason;
        if ("RENDERER_GONE".equals(lastCourseEvent)) {
            reason = "课程渲染组件已被安全隔离";
        } else if ("MAIN_ON_CREATE".equals(lastCourseEvent)) {
            reason = "课程网页组件初始化失败";
        } else if (pageWasVisible) {
            reason = "课程已返回原生安全主页";
        } else {
            reason = "课程进程在首屏出现前退出";
        }
        showRecovery(reason);
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        outState.putBoolean(STATE_COURSE_IN_FLIGHT, courseLaunchInFlight);
        outState.putBoolean(STATE_PAUSED_FOR_COURSE, pausedForCourse);
        super.onSaveInstanceState(outState);
    }

    @Override
    protected void onDestroy() {
        releaseCourseWatch();
        super.onDestroy();
    }

    private void migrateGuardState() {
        String storedRevision = startupPrefs.getString(PREF_GUARD_REVISION, "");
        if (GUARD_REVISION.equals(storedRevision)) return;
        // This preferences file contains only crash-guard metadata. Do not
        // clear application learning progress, downloads, or user settings.
        startupPrefs.edit()
            .putString(PREF_GUARD_REVISION, GUARD_REVISION)
            .remove(PREF_START_PENDING)
            .remove(PREF_LAST_START_AT)
            .remove(PREF_FAILURES)
            .commit();
    }

    private boolean maybeRunHistoricalTaskMigrationTest(Intent intent) {
        if (!isDebuggable()
            || intent == null
            || !intent.getBooleanExtra(EXTRA_FORCE_STALE_TASK_MIGRATION, false)) {
            return false;
        }
        intent.removeExtra(EXTRA_FORCE_STALE_TASK_MIGRATION);
        Log.w(TAG, diagnosticLine(
            "CI_FORCE_STALE_TASK_MIGRATION",
            "launching historical MainActivity inside the current task"
        ));
        Intent migration = new Intent();
        migration.setClassName(getPackageName(), getPackageName() + ".MainActivity");
        migration.addFlags(Intent.FLAG_ACTIVITY_NO_ANIMATION);
        try {
            startActivity(migration);
        } catch (RuntimeException migrationFailure) {
            lastCourseEvent = "CI_STALE_TASK_MIGRATION_FAILED";
            lastCourseDetail = migrationFailure.getClass().getName();
            Log.e(TAG, diagnosticLine(lastCourseEvent, lastCourseDetail), migrationFailure);
            showRecovery("旧任务迁移自检无法启动");
        }
        return true;
    }

    private void launchCourse(boolean retry, boolean software) {
        if (courseLaunchInFlight) return;

        long now = System.currentTimeMillis();
        boolean persisted = startupPrefs.edit()
            .putBoolean(PREF_START_PENDING, true)
            .putLong(PREF_LAST_START_AT, now)
            .putBoolean(PREF_FORCE_SOFTWARE, software)
            .commit();
        if (!persisted) {
            lastCourseEvent = "GUARD_WRITE_FAILED";
            lastCourseDetail = "无法写入启动保护标记";
            showRecovery("手机存储暂时无法建立启动保护");
            return;
        }

        courseLaunchInFlight = true;
        pausedForCourse = false;
        courseProcessDeathHandled = false;
        courseActivityStarted = false;
        pendingRetry = retry;
        pendingSoftware = software;
        showOpeningCourse(software);

        // Establish a WebView-free Binder heartbeat before CourseActivity is
        // allowed to start. Binder death reaches this persistent process even
        // if the course dies before Activity lifecycle callbacks are usable.
        Intent heartbeat = new Intent();
        heartbeat.setClassName(
            getPackageName(),
            getPackageName() + ".CourseProcessWatchService"
        );
        try {
            courseWatchRegistered = bindService(
                heartbeat,
                courseWatchConnection,
                Context.BIND_AUTO_CREATE
            );
            if (!courseWatchRegistered) {
                throw new IllegalStateException("Course heartbeat binding was rejected");
            }
            mainHandler.postDelayed(courseBindTimeout, COURSE_BIND_TIMEOUT_MS);
        } catch (Throwable launchFailure) {
            handleCourseLaunchFailure(launchFailure);
        }
    }

    private void startCourseActivity() {
        // Use a class name string so the persistent launcher never loads or
        // statically links the BridgeActivity subclass in its own process.
        Intent course = new Intent();
        course.setClassName(getPackageName(), getPackageName() + ".CourseActivity");
        course.putExtra(EXTRA_RETRY, pendingRetry);
        course.putExtra(EXTRA_SOFTWARE_MODE, pendingSoftware);
        if (isDebuggable()
            && getIntent() != null
            && getIntent().getBooleanExtra(EXTRA_FORCE_RENDERER_CRASH, false)) {
            course.putExtra(EXTRA_FORCE_RENDERER_CRASH, true);
        }
        if (isDebuggable()
            && getIntent() != null
            && getIntent().getBooleanExtra(EXTRA_FORCE_COURSE_PROCESS_DEATH, false)) {
            course.putExtra(EXTRA_FORCE_COURSE_PROCESS_DEATH, true);
        }
        try {
            startActivityForResult(course, COURSE_REQUEST);
        } catch (Throwable launchFailure) {
            handleCourseLaunchFailure(launchFailure);
        }
    }

    private void handleCourseLaunchFailure(Throwable launchFailure) {
        releaseCourseWatch();
        courseLaunchInFlight = false;
        pausedForCourse = false;
        clearPendingStart();
        lastCourseEvent = "COURSE_LAUNCH_FAILED";
        lastCourseDetail = launchFailure.getClass().getName();
        Log.e(TAG, diagnosticLine(lastCourseEvent, lastCourseDetail), launchFailure);
        showRecovery("课程进程无法启动");
    }

    private void handleCourseProcessDeath(String detail) {
        if (!courseLaunchInFlight || courseProcessDeathHandled) return;
        courseProcessDeathHandled = true;
        releaseCourseWatch();
        courseLaunchInFlight = false;
        pausedForCourse = false;
        lastCourseEvent = "COURSE_PROCESS_DIED";
        lastCourseDetail = detail;
        Log.e(TAG, diagnosticLine(lastCourseEvent, lastCourseDetail));

        // CLEAR_TOP removes Android's still-pending CourseActivity record before
        // it can keep recreating the dead :course process.
        Intent launcher = new Intent();
        launcher.setClassName(getPackageName(), getPackageName() + ".LauncherActivity");
        launcher.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        launcher.putExtra(EXTRA_SHOW_SAFE_MODE, true);
        try {
            startActivity(launcher);
        } catch (RuntimeException recoveryFailure) {
            Log.e(TAG, "Could not promote native recovery Activity", recoveryFailure);
            showRecovery("课程进程已退出，原生恢复页仍可使用");
        }
    }

    private void releaseCourseWatch() {
        mainHandler.removeCallbacks(courseBindTimeout);
        if (!courseWatchRegistered) return;
        courseWatchRegistered = false;
        try {
            unbindService(courseWatchConnection);
        } catch (IllegalArgumentException ignored) {
            // The remote process may have died between callback dispatch and
            // unbind; the binding is already gone in that case.
        }
    }

    private void showNativeHome() {
        lastCourseEvent = "NATIVE_HOME";
        lastCourseDetail = "WebView-free launcher ready";
        LinearLayout card = createPageCard("huilaishi-native-landing");
        addBrand(card);
        addTitleAndBody(
            card,
            "三星稳定入口",
            "原生首页已经正常启动。课程将在独立进程里运行；即使网页组件异常，这个页面也不会一起退出。"
        );

        Button enter = actionButton("进入课程（稳定模式）", true);
        enter.setTag("huilaishi-enter-course");
        enter.setContentDescription("进入课程，三星稳定模式");
        enter.setOnClickListener(view -> launchCourse(false, true));
        card.addView(enter, buttonParams(22));

        Button copy = actionButton("复制设备诊断", false);
        copy.setOnClickListener(view -> copyDiagnostics(diagnosticLine("NATIVE_HOME", "ready")));
        card.addView(copy, buttonParams(10));

        addThai(card, "หน้าหลักแบบปลอดภัย\nแตะเพื่อเปิดบทเรียนในกระบวนการแยกต่างหาก");
        presentPage();
    }

    private void showOpeningCourse(boolean software) {
        LinearLayout card = createPageCard("huilaishi-native-launching");
        addBrand(card);
        addTitleAndBody(
            card,
            "正在打开课程",
            software ? "正在使用三星稳定显示模式。若课程进程退出，会自动回到这里。" : "正在使用正常显示模式。若课程进程退出，会自动回到这里。"
        );
        presentPage();
    }

    private void showRecovery(String reason) {
        Log.w(TAG, diagnosticLine("LAUNCHER_RECOVERY", reason));
        LinearLayout card = createPageCard("huilaishi-native-recovery");
        addBrand(card);
        addTitleAndBody(
            card,
            "课程已安全退出",
            reason + "。\n\n原生入口仍在，应用没有继续闪退。请先用稳定模式重试。"
        );

        Button safeStart = actionButton("稳定模式重试（推荐）", true);
        safeStart.setTag("huilaishi-retry-course");
        safeStart.setContentDescription("稳定模式重试，推荐");
        safeStart.setOnClickListener(view -> launchCourse(true, true));
        card.addView(safeStart, buttonParams(22));

        Button update = actionButton("更新 WebView / Chrome", false);
        update.setOnClickListener(view -> openWebViewSettings());
        card.addView(update, buttonParams(10));

        final String diagnostics = diagnosticLine(lastCourseEvent, lastCourseDetail);
        Button copy = actionButton("复制诊断信息", false);
        copy.setOnClickListener(view -> copyDiagnostics(diagnostics));
        card.addView(copy, buttonParams(10));

        addThai(card, "บทเรียนหยุดอย่างปลอดภัย\nลองเปิดใหม่ด้วยโหมดเสถียรก่อน");

        TextView diagnosticView = text(diagnostics, 12, Color.rgb(94, 112, 106), Typeface.NORMAL);
        diagnosticView.setTypeface(Typeface.MONOSPACE);
        diagnosticView.setTextIsSelectable(true);
        diagnosticView.setPadding(0, dp(14), 0, 0);
        diagnosticView.setOnClickListener(view -> copyDiagnostics(diagnostics));
        diagnosticView.setContentDescription("诊断信息，点按复制");
        card.addView(diagnosticView);
        presentPage();
    }

    private LinearLayout createPageCard(String marker) {
        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        scroll.setBackgroundColor(Color.rgb(246, 241, 231));
        // Keep diagnostic metadata out of the accessibility label. Giving a
        // ViewGroup a content description collapses its child controls into
        // one accessibility node and can hide the course button from TalkBack.
        scroll.setTag(marker);

        LinearLayout page = new LinearLayout(this);
        page.setOrientation(LinearLayout.VERTICAL);
        page.setGravity(Gravity.CENTER);
        page.setPadding(dp(22), dp(34), dp(22), dp(34));
        scroll.addView(page, new ScrollView.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        ));

        LinearLayout card = new LinearLayout(this);
        card.setOrientation(LinearLayout.VERTICAL);
        card.setPadding(dp(22), dp(24), dp(22), dp(24));
        card.setBackground(roundedBackground(Color.rgb(255, 253, 248), 26, Color.rgb(200, 211, 204)));
        LinearLayout.LayoutParams cardParams = new LinearLayout.LayoutParams(
            Math.min(getResources().getDisplayMetrics().widthPixels - dp(44), dp(440)),
            ViewGroup.LayoutParams.WRAP_CONTENT
        );
        page.addView(card, cardParams);
        // Attach only after the complete page has been assembled. Attaching
        // an empty card first can leave later controls below the viewport on
        // some software-rendered Android devices.
        pendingPageRoot = scroll;
        return card;
    }

    private void presentPage() {
        if (pendingPageRoot == null) {
            throw new IllegalStateException("Native page root was not prepared");
        }
        ScrollView pageRoot = pendingPageRoot;
        pendingPageRoot = null;
        setContentView(pageRoot);
    }

    private void addBrand(LinearLayout card) {
        TextView mark = text("来", 25, Color.WHITE, Typeface.BOLD);
        mark.setGravity(Gravity.CENTER);
        mark.setBackground(roundedBackground(Color.rgb(23, 111, 96), 17, Color.TRANSPARENT));
        card.addView(mark, new LinearLayout.LayoutParams(dp(54), dp(54)));

        TextView edition = text("三星安全版 · 12.6-R1", 12, Color.rgb(23, 111, 96), Typeface.BOLD);
        edition.setPadding(0, dp(12), 0, 0);
        card.addView(edition);
    }

    private void addTitleAndBody(LinearLayout card, String titleValue, String bodyValue) {
        TextView title = text(titleValue, 27, Color.rgb(23, 59, 52), Typeface.BOLD);
        title.setPadding(0, dp(12), 0, dp(8));
        card.addView(title);

        TextView body = text(bodyValue, 16, Color.rgb(67, 91, 84), Typeface.NORMAL);
        body.setLineSpacing(0f, 1.25f);
        card.addView(body);
    }

    private void addThai(LinearLayout card, String value) {
        TextView thai = text(value, 14, Color.rgb(82, 102, 96), Typeface.NORMAL);
        thai.setPadding(0, dp(22), 0, dp(8));
        thai.setLineSpacing(0f, 1.2f);
        card.addView(thai);
    }

    private Button actionButton(String label, boolean primary) {
        Button button = new Button(this);
        button.setAllCaps(false);
        button.setText(label);
        button.setTextSize(16);
        button.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        button.setTextColor(primary ? Color.WHITE : Color.rgb(23, 91, 79));
        button.setGravity(Gravity.CENTER);
        button.setMinHeight(dp(52));
        button.setPadding(dp(14), dp(10), dp(14), dp(10));
        button.setBackground(roundedBackground(
            primary ? Color.rgb(23, 111, 96) : Color.rgb(237, 245, 239),
            15,
            primary ? Color.TRANSPARENT : Color.rgb(197, 214, 206)
        ));
        return button;
    }

    private LinearLayout.LayoutParams buttonParams(int topMargin) {
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        );
        params.topMargin = dp(topMargin);
        return params;
    }

    private TextView text(String value, int sp, int color, int style) {
        TextView textView = new TextView(this);
        textView.setText(value);
        textView.setTextSize(sp);
        textView.setTextColor(color);
        textView.setTypeface(Typeface.DEFAULT, style);
        return textView;
    }

    private GradientDrawable roundedBackground(int fillColor, int radiusDp, int strokeColor) {
        GradientDrawable drawable = new GradientDrawable();
        drawable.setColor(fillColor);
        drawable.setCornerRadius(dp(radiusDp));
        if (strokeColor != Color.TRANSPARENT) drawable.setStroke(dp(1), strokeColor);
        return drawable;
    }

    private void openWebViewSettings() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                startActivity(new Intent(Settings.ACTION_WEBVIEW_SETTINGS));
                return;
            }
        } catch (RuntimeException ignored) {
            // Use the store fallback below.
        }
        try {
            startActivity(new Intent(
                Intent.ACTION_VIEW,
                Uri.parse("market://details?id=com.google.android.webview")
            ));
        } catch (RuntimeException ignored) {
            startActivity(new Intent(
                Intent.ACTION_VIEW,
                Uri.parse("https://play.google.com/store/apps/details?id=com.google.android.webview")
            ));
        }
    }

    private void copyDiagnostics(String diagnostics) {
        ClipboardManager clipboard = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
        if (clipboard == null) return;
        clipboard.setPrimaryClip(ClipData.newPlainText("会来事 Android 诊断信息", diagnostics));
        Toast.makeText(this, "诊断信息已复制", Toast.LENGTH_SHORT).show();
    }

    private void clearPendingStart() {
        startupPrefs.edit().putBoolean(PREF_START_PENDING, false).commit();
    }

    private String diagnosticLine(String event, String detail) {
        ActivityManager manager = (ActivityManager) getSystemService(ACTIVITY_SERVICE);
        boolean lowRam = manager != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT
            && manager.isLowRamDevice();
        return "event=" + event
            + " | app=" + appVersion()
            + " | guard=" + GUARD_REVISION
            + " | process=launcher"
            + " | device=" + Build.MANUFACTURER + "/" + Build.MODEL
            + " | sdk=" + Build.VERSION.SDK_INT
            + " | providers=" + providerVersions()
            + " | lowRam=" + lowRam
            + " | lastExit=" + recentCourseExit()
            + " | detail=" + detail;
    }

    private String appVersion() {
        try {
            return getPackageManager().getPackageInfo(getPackageName(), 0).versionName;
        } catch (Exception ignored) {
            return "unknown";
        }
    }

    /** PackageManager-only provider inventory; this never initializes WebView. */
    private String providerVersions() {
        String[] candidates = {
            "com.google.android.webview",
            "com.android.chrome",
            "com.sec.android.app.sbrowser"
        };
        StringBuilder versions = new StringBuilder();
        for (String packageName : candidates) {
            try {
                PackageInfo info = getPackageManager().getPackageInfo(packageName, 0);
                if (versions.length() > 0) versions.append(',');
                versions.append(packageName).append('/').append(info.versionName);
            } catch (Exception ignored) {
                // Missing provider candidate is normal.
            }
        }
        return versions.length() == 0 ? "unavailable" : versions.toString();
    }

    private String recentCourseExit() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) return "unsupported";
        return ExitInfoApi30.recentCourseExit(this);
    }

    private boolean isDebuggable() {
        return (getApplicationInfo().flags & android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0;
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }
}
