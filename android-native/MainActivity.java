package __ANDROID_PACKAGE__;

import android.app.ActivityManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebView;

import androidx.annotation.Nullable;
import androidx.webkit.WebViewCompat;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WebViewListener;

/**
 * Capacitor course host. AndroidManifest places this activity in :course, so
 * provider, Chromium, V8, and course failures cannot terminate the native task
 * root. Recovery UI intentionally lives only in LauncherActivity.
 */
public class MainActivity extends BridgeActivity {

    private static final String TAG = "HuilaishiCourse";
    private static final String GUARD_REVISION = "12.2.6-process-isolation-2";
    private static final String PREFS_NAME = "huilaishi_native_startup_guard";
    private static final String PREF_START_PENDING = "start_pending";
    private static final String PREF_LAST_START_AT = "last_start_at";
    private static final String PREF_FAILURES = "startup_failures";
    private static final String EXTRA_SOFTWARE_MODE = "com.huilaishi.app.extra.SOFTWARE_MODE";
    private static final String EXTRA_FORCE_RENDERER_CRASH = "com.huilaishi.app.extra.FORCE_RENDERER_CRASH";
    private static final String EXTRA_FORCE_COURSE_PROCESS_DEATH = "com.huilaishi.app.extra.FORCE_COURSE_PROCESS_DEATH";
    private static final String EXTRA_COURSE_EVENT = "com.huilaishi.app.extra.COURSE_EVENT";
    private static final String EXTRA_COURSE_DETAIL = "com.huilaishi.app.extra.COURSE_DETAIL";
    private static final String EXTRA_PAGE_VISIBLE = "com.huilaishi.app.extra.PAGE_VISIBLE";

    private SharedPreferences startupPrefs;
    private boolean forceSoftwareCompositor;
    private boolean rendererFailureHandled;
    private boolean rendererCrashTestTriggered;
    private boolean pageVisible;
    private boolean returningToLauncher;
    private static boolean dataDirectoryConfigured;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        Intent intent = getIntent();
        if (isDebuggable()
            && intent != null
            && intent.getBooleanExtra(EXTRA_FORCE_COURSE_PROCESS_DEATH, false)) {
            Log.e(TAG, "event=CI_FORCE_COURSE_PROCESS_DEATH | process=course | stage=before_webview");
            // Deliberately use an uncatchable early death. The launcher's
            // Binder heartbeat must recover even when Android would otherwise
            // recreate this unfinished top Activity indefinitely.
            android.os.Process.killProcess(android.os.Process.myPid());
            return;
        }

        configureWebViewDataDirectory();
        startupPrefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        boolean samsungRecoveryPackage = getPackageName().endsWith(".samsung");
        forceSoftwareCompositor = intent == null
            ? samsungRecoveryPackage
            : intent.getBooleanExtra(EXTRA_SOFTWARE_MODE, samsungRecoveryPackage);

        // Capacitor attaches this listener after it creates the Bridge/WebView.
        // It handles later renderer exits; the isolated :course process is the
        // protection for provider/Bridge failures that happen before attachment.
        bridgeBuilder.addWebViewListener(new WebViewListener() {
            @Override
            public boolean onRenderProcessGone(WebView webView, RenderProcessGoneDetail detail) {
                return handleRendererGone(webView, detail);
            }

            @Override
            public void onPageCommitVisible(WebView webView, String url) {
                markStartupHealthy(webView, url);
            }
        });

        try {
            super.onCreate(savedInstanceState);
        } catch (Throwable startupFailure) {
            recordStartupFailure("MAIN_ON_CREATE", startupFailure);
            disposePartiallyCreatedBridge();
            returnToLauncher("MAIN_ON_CREATE", startupFailure.getClass().getName());
        }
    }

    private void configureWebViewDataDirectory() {
        if (dataDirectoryConfigured || Build.VERSION.SDK_INT < Build.VERSION_CODES.P) return;
        dataDirectoryConfigured = true;
        try {
            // R2 uses a fresh, stable profile instead of inheriting a possibly
            // corrupt provider cache created by the earlier same-process shell.
            WebView.setDataDirectorySuffix("huilaishi_course");
        } catch (Throwable suffixFailure) {
            Log.w(TAG, "Course WebView data directory was already initialized", suffixFailure);
        }
    }

    @Override
    protected void load() {
        WebView webView = findViewById(com.getcapacitor.android.R.id.webview);
        if (webView != null) configureRendererPolicy(webView);
        Log.i(TAG, diagnosticLine("START", forceSoftwareCompositor ? "software" : "normal"));
        super.load();
    }

    private void configureRendererPolicy(WebView webView) {
        // The activity is software-rendered at manifest level as protection
        // against Samsung HWUI/GLES faults. Keep this WebView policy explicit
        // as a second guard and for builds whose manifest is inspected later.
        if (forceSoftwareCompositor || getPackageName().endsWith(".samsung")) {
            webView.setLayerType(View.LAYER_TYPE_SOFTWARE, null);
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            webView.setRendererPriorityPolicy(WebView.RENDERER_PRIORITY_IMPORTANT, true);
        }
    }

    private boolean handleRendererGone(WebView webView, RenderProcessGoneDetail detail) {
        if (rendererFailureHandled) return true;
        rendererFailureHandled = true;

        boolean didCrash = false;
        int priority = -1;
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && detail != null) {
                didCrash = detail.didCrash();
                priority = detail.rendererPriorityAtExit();
            }
        } catch (Throwable detailFailure) {
            Log.w(TAG, "Renderer exit detail unavailable", detailFailure);
        }
        String detailText = "didCrash=" + didCrash + ",priority=" + priority;
        Log.e(TAG, diagnosticLine("RENDERER_GONE", detailText));

        startupPrefs.edit()
            .putBoolean(PREF_START_PENDING, true)
            .putLong(PREF_LAST_START_AT, System.currentTimeMillis())
            .putInt(PREF_FAILURES, 1)
            .commit();

        runOnUiThread(() -> {
            // Android requires a dead WebView to be removed and destroyed.
            disposeBridgeAndWebView(webView);
            returnToLauncher("RENDERER_GONE", detailText);
        });
        return true;
    }

    private void markStartupHealthy(WebView webView, String url) {
        pageVisible = true;
        // This is the only successful-start path that clears the pending bit.
        // commit() makes the disk handshake visible to the launcher process.
        startupPrefs.edit()
            .putBoolean(PREF_START_PENDING, false)
            .putInt(PREF_FAILURES, 0)
            .commit();
        String visibleUrl = redactUrl(url);
        setResult(RESULT_OK, courseResult("PAGE_VISIBLE", visibleUrl, true));
        Log.i(TAG, diagnosticLine("PAGE_VISIBLE", visibleUrl));
        maybeTriggerRendererCrash(webView);
    }

    private void maybeTriggerRendererCrash(WebView webView) {
        if (!rendererCrashTestTriggered
            && getIntent() != null
            && getIntent().getBooleanExtra(EXTRA_FORCE_RENDERER_CRASH, false)
            && (getApplicationInfo().flags & android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0) {
            rendererCrashTestTriggered = true;
            Log.w(TAG, diagnosticLine("CI_FORCE_RENDERER_CRASH", "chrome://crash"));
            webView.postDelayed(() -> webView.loadUrl("chrome://crash"), 750L);
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        // BridgeActivity.load() may dispatch the initial Intent through this
        // virtual method. Never clear the startup marker here.
        super.onNewIntent(intent);
        setIntent(intent);
        if (bridge != null && bridge.getWebView() != null) {
            maybeTriggerRendererCrash(bridge.getWebView());
        }
    }

    private void recordStartupFailure(String event, Throwable failure) {
        rendererFailureHandled = true;
        startupPrefs.edit()
            .putBoolean(PREF_START_PENDING, true)
            .putLong(PREF_LAST_START_AT, System.currentTimeMillis())
            .putInt(PREF_FAILURES, 1)
            .commit();
        Log.e(TAG, diagnosticLine(event, failure.getClass().getName()), failure);
    }

    private void disposePartiallyCreatedBridge() {
        WebView partialWebView = null;
        if (bridge != null) {
            try {
                partialWebView = bridge.getWebView();
            } catch (Throwable lookupFailure) {
                Log.w(TAG, "Partially created WebView lookup failed", lookupFailure);
            }
        }
        disposeBridgeAndWebView(partialWebView);
    }

    private void disposeBridgeAndWebView(WebView webView) {
        if (bridge != null) {
            try {
                bridge.onDestroy();
            } catch (Throwable cleanupFailure) {
                Log.w(TAG, "Bridge cleanup failed", cleanupFailure);
            } finally {
                bridge = null;
            }
        }
        if (webView == null) {
            try {
                webView = findViewById(com.getcapacitor.android.R.id.webview);
            } catch (Throwable lookupFailure) {
                Log.w(TAG, "WebView view lookup failed", lookupFailure);
            }
        }
        if (webView == null) return;
        ViewParentCompat.removeFromParent(webView);
        try {
            webView.destroy();
        } catch (Throwable cleanupFailure) {
            Log.w(TAG, "WebView cleanup failed", cleanupFailure);
        }
    }

    private void returnToLauncher(String event, String detail) {
        if (returningToLauncher) return;
        returningToLauncher = true;
        setResult(RESULT_OK, courseResult(event, detail, pageVisible));
        Log.w(TAG, diagnosticLine("RETURN_TO_LAUNCHER", event + ":" + detail));
        runOnUiThread(this::finish);
    }

    private Intent courseResult(String event, String detail, boolean wasPageVisible) {
        Intent result = new Intent();
        result.putExtra(EXTRA_COURSE_EVENT, event);
        result.putExtra(EXTRA_COURSE_DETAIL, detail);
        result.putExtra(EXTRA_PAGE_VISIBLE, wasPageVisible);
        return result;
    }

    @Override
    public void onStop() {
        // Do not clear PREF_START_PENDING here. Permission UI, Home, task
        // switching, and provider startup can all call onStop before first paint.
        super.onStop();
    }

    @Override
    public void onTrimMemory(int level) {
        Log.w(TAG, diagnosticLine("TRIM_MEMORY", "level=" + level));
        super.onTrimMemory(level);
    }

    private String diagnosticLine(String event, String detail) {
        ActivityManager activityManager = (ActivityManager) getSystemService(Context.ACTIVITY_SERVICE);
        boolean lowRam = activityManager != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT
            && activityManager.isLowRamDevice();
        return "event=" + event
            + " | app=" + appVersion()
            + " | guard=" + GUARD_REVISION
            + " | process=course"
            + " | device=" + Build.MANUFACTURER + "/" + Build.MODEL
            + " | sdk=" + Build.VERSION.SDK_INT
            + " | webview=" + webViewVersion()
            + " | lowRam=" + lowRam
            + " | compositor=" + (forceSoftwareCompositor ? "software" : "normal")
            + " | detail=" + detail;
    }

    private String appVersion() {
        try {
            return getPackageManager().getPackageInfo(getPackageName(), 0).versionName;
        } catch (Exception ignored) {
            return "unknown";
        }
    }

    private String webViewVersion() {
        try {
            android.content.pm.PackageInfo info = WebViewCompat.getCurrentWebViewPackage(this);
            return info == null ? "unavailable" : info.packageName + "/" + info.versionName;
        } catch (Throwable ignored) {
            return "unavailable";
        }
    }

    private boolean isDebuggable() {
        return (getApplicationInfo().flags & android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0;
    }

    private static String redactUrl(String url) {
        if (url == null) return "null";
        Uri parsed = Uri.parse(url);
        return parsed.getScheme() + "://" + parsed.getHost() + parsed.getPath();
    }

    /** Small API-neutral helper kept separate to make destroy requirements explicit. */
    private static final class ViewParentCompat {
        private ViewParentCompat() {}

        static void removeFromParent(View view) {
            if (view != null && view.getParent() instanceof ViewGroup) {
                ((ViewGroup) view.getParent()).removeView(view);
            }
        }
    }
}
