package __ANDROID_PACKAGE__;

import android.app.ActivityManager;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebView;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.webkit.WebViewCompat;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WebViewListener;

/**
 * Native crash guard for the offline Capacitor shell.
 *
 * A WebView renderer that has exited must never be reused. This activity
 * consumes the renderer-gone callback, destroys that WebView, and replaces it
 * with an Android-native recovery screen. A pending-start marker also catches
 * process deaths that happen before WebView can report the renderer failure.
 */
public class MainActivity extends BridgeActivity {

    private static final String TAG = "HuilaishiNative";
    private static final String GUARD_REVISION = "12.2.5-native-guard-1";
    private static final String PREFS_NAME = "huilaishi_native_startup_guard";
    private static final String PREF_GUARD_REVISION = "guard_revision";
    private static final String PREF_START_PENDING = "start_pending";
    private static final String PREF_LAST_START_AT = "last_start_at";
    private static final String PREF_FAILURES = "startup_failures";
    private static final String PREF_FORCE_SOFTWARE = "force_software_compositor";
    private static final String EXTRA_RETRY = "com.huilaishi.app.extra.NATIVE_RETRY";
    private static final String EXTRA_SHOW_SAFE_MODE = "com.huilaishi.app.extra.SHOW_SAFE_MODE";
    private static final String EXTRA_FORCE_RENDERER_CRASH = "com.huilaishi.app.extra.FORCE_RENDERER_CRASH";

    private SharedPreferences startupPrefs;
    private boolean showSafeModeAtLaunch;
    private boolean retryRequested;
    private boolean forceSoftwareCompositor;
    private boolean rendererFailureHandled;
    private boolean rendererCrashTestTriggered;
    private String safeModeReason = "检测到上次启动没有完成";

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        startupPrefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        retryRequested = getIntent() != null && getIntent().getBooleanExtra(EXTRA_RETRY, false);
        prepareStartupGuard();

        // Register before BridgeActivity creates and starts loading the bridge.
        // This closes the small startup window in which a renderer can exit.
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
            try {
                showNativeSafeMode("Android 网页组件初始化失败");
            } catch (Throwable recoveryFailure) {
                Log.e(TAG, "Native recovery screen failed", recoveryFailure);
                Intent recovery = new Intent(this, LauncherActivity.class);
                recovery.putExtra(EXTRA_SHOW_SAFE_MODE, true);
                recovery.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                startActivity(recovery);
                finish();
            }
        }
    }

    @Override
    protected void load() {
        if (showSafeModeAtLaunch && !retryRequested) {
            clearPendingStart();
            Log.w(TAG, diagnosticLine("SAFE_MODE_AT_LAUNCH", safeModeReason));
            showNativeSafeMode(safeModeReason);
            return;
        }

        WebView webView = findViewById(com.getcapacitor.android.R.id.webview);
        if (webView != null) {
            configureRendererPolicy(webView);
        }
        Log.i(TAG, diagnosticLine("START", forceSoftwareCompositor ? "software" : "hardware"));
        super.load();
    }

    private void prepareStartupGuard() {
        String storedRevision = startupPrefs.getString(PREF_GUARD_REVISION, "");
        if (!GUARD_REVISION.equals(storedRevision)) {
            startupPrefs.edit().clear().putString(PREF_GUARD_REVISION, GUARD_REVISION).apply();
        }

        boolean samsungDefault = "samsung".equalsIgnoreCase(Build.MANUFACTURER);
        forceSoftwareCompositor = startupPrefs.contains(PREF_FORCE_SOFTWARE)
            ? startupPrefs.getBoolean(PREF_FORCE_SOFTWARE, samsungDefault)
            : samsungDefault;
        showSafeModeAtLaunch = getIntent() != null
            && getIntent().getBooleanExtra(EXTRA_SHOW_SAFE_MODE, false);
        if (showSafeModeAtLaunch) {
            safeModeReason = "上次启动在界面出现前意外中断";
        } else if (!startupPrefs.getBoolean(PREF_START_PENDING, false)) {
            startupPrefs.edit()
                .putBoolean(PREF_START_PENDING, true)
                .putLong(PREF_LAST_START_AT, System.currentTimeMillis())
                .apply();
        }
    }

    private void configureRendererPolicy(WebView webView) {
        if (forceSoftwareCompositor) {
            // The application window remains hardware accelerated. Samsung
            // devices use software WebView compositing from their first start;
            // other devices can opt into the same mode from recovery.
            webView.setLayerType(View.LAYER_TYPE_SOFTWARE, null);
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            webView.setRendererPriorityPolicy(WebView.RENDERER_PRIORITY_IMPORTANT, true);
        }
    }

    private boolean handleRendererGone(WebView webView, RenderProcessGoneDetail detail) {
        if (rendererFailureHandled) {
            return true;
        }
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
        String reason = didCrash ? "系统网页渲染组件发生异常" : "手机内存不足，系统关闭了网页渲染组件";
        Log.e(TAG, diagnosticLine(
            "RENDERER_GONE",
            "didCrash=" + didCrash + ",priority=" + priority
        ));

        startupPrefs.edit()
            .putBoolean(PREF_START_PENDING, true)
            .putLong(PREF_LAST_START_AT, System.currentTimeMillis())
            .putInt(PREF_FAILURES, 1)
            .apply();

        runOnUiThread(() -> {
            // Android requires every affected WebView to be removed and destroyed.
            // Retaining or reloading it can terminate the whole application.
            if (bridge != null) {
                try {
                    bridge.onDestroy();
                } catch (Throwable cleanupError) {
                    Log.w(TAG, "Bridge cleanup after renderer exit failed", cleanupError);
                }
                bridge = null;
            }
            ViewParentCompat.removeFromParent(webView);
            try {
                webView.destroy();
            } catch (Throwable cleanupError) {
                Log.w(TAG, "WebView cleanup after renderer exit failed", cleanupError);
            }
            try {
                showNativeSafeMode(reason);
            } catch (Throwable recoveryFailure) {
                Log.e(TAG, "Renderer recovery screen failed", recoveryFailure);
                Intent recovery = new Intent(this, LauncherActivity.class);
                recovery.putExtra(EXTRA_SHOW_SAFE_MODE, true);
                recovery.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                startActivity(recovery);
                finish();
            }
        });
        return true;
    }

    private void markStartupHealthy(WebView webView, String url) {
        startupPrefs.edit()
            .putBoolean(PREF_START_PENDING, false)
            .putInt(PREF_FAILURES, 0)
            .apply();
        Log.i(TAG, diagnosticLine("PAGE_VISIBLE", redactUrl(url)));

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
        super.onNewIntent(intent);
        setIntent(intent);
        clearPendingStart();
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
            .apply();
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
            try {
                bridge.onDestroy();
            } catch (Throwable cleanupFailure) {
                Log.w(TAG, "Partially created Bridge cleanup failed", cleanupFailure);
            } finally {
                bridge = null;
            }
        }
        if (partialWebView == null) {
            try {
                partialWebView = findViewById(com.getcapacitor.android.R.id.webview);
            } catch (Throwable lookupFailure) {
                Log.w(TAG, "Partial WebView view lookup failed", lookupFailure);
            }
        }
        if (partialWebView != null) {
            ViewParentCompat.removeFromParent(partialWebView);
            try {
                partialWebView.destroy();
            } catch (Throwable cleanupFailure) {
                Log.w(TAG, "Partially created WebView cleanup failed", cleanupFailure);
            }
        }
    }

    private void clearPendingStart() {
        startupPrefs.edit().putBoolean(PREF_START_PENDING, false).apply();
    }

    @Override
    public void onStop() {
        // A normal background/close before first paint is not a crash.
        if (!rendererFailureHandled) {
            clearPendingStart();
        }
        super.onStop();
    }

    @Override
    public void onTrimMemory(int level) {
        Log.w(TAG, diagnosticLine("TRIM_MEMORY", "level=" + level));
        super.onTrimMemory(level);
    }

    private void showNativeSafeMode(String reason) {
        setContentView(buildSafeModeView(reason));
    }

    private View buildSafeModeView(String reason) {
        int horizontalPadding = dp(22);
        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        scroll.setBackgroundColor(Color.rgb(246, 241, 231));

        LinearLayout page = new LinearLayout(this);
        page.setOrientation(LinearLayout.VERTICAL);
        page.setGravity(Gravity.CENTER_HORIZONTAL);
        page.setPadding(horizontalPadding, dp(34), horizontalPadding, dp(34));
        scroll.addView(page, new ScrollView.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        ));

        LinearLayout card = new LinearLayout(this);
        card.setOrientation(LinearLayout.VERTICAL);
        card.setPadding(dp(22), dp(24), dp(22), dp(24));
        card.setBackground(roundedBackground(Color.rgb(255, 253, 248), 26, Color.rgb(200, 211, 204)));
        LinearLayout.LayoutParams cardParams = new LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.WRAP_CONTENT
        );
        cardParams.width = Math.min(getResources().getDisplayMetrics().widthPixels - dp(44), dp(440));
        page.addView(card, cardParams);

        TextView mark = text("来", 25, Color.WHITE, Typeface.BOLD);
        mark.setGravity(Gravity.CENTER);
        mark.setBackground(roundedBackground(Color.rgb(23, 111, 96), 17, Color.TRANSPARENT));
        card.addView(mark, new LinearLayout.LayoutParams(dp(54), dp(54)));

        TextView title = text("已进入安全模式", 27, Color.rgb(23, 59, 52), Typeface.BOLD);
        title.setPadding(0, dp(20), 0, dp(8));
        card.addView(title);

        TextView body = text(
            "应用没有损坏。" + reason + "。\n\n先点“轻量模式重试”；它会避开部分三星机型的图形渲染兼容问题，课程、录音和离线语音仍可使用。",
            16,
            Color.rgb(67, 91, 84),
            Typeface.NORMAL
        );
        body.setLineSpacing(0f, 1.25f);
        card.addView(body);

        Button safeRetry = actionButton("轻量模式重试（推荐）", true);
        safeRetry.setOnClickListener(view -> restartWithMode(true));
        card.addView(safeRetry, buttonLayoutParams(22));

        Button updateWebView = actionButton("更新 WebView / Chrome", false);
        updateWebView.setOnClickListener(view -> openWebViewSettings());
        card.addView(updateWebView, buttonLayoutParams(10));

        Button normalRetry = actionButton("恢复正常模式重试", false);
        normalRetry.setOnClickListener(view -> restartWithMode(false));
        card.addView(normalRetry, buttonLayoutParams(10));

        TextView thai = text(
            "โหมดปลอดภัย\nแตะ “ลองใหม่แบบเบา” ก่อน แอปจะใช้โหมดแสดงผลที่เข้ากับอุปกรณ์ Samsung บางรุ่นได้ดีกว่า",
            14,
            Color.rgb(82, 102, 96),
            Typeface.NORMAL
        );
        thai.setPadding(0, dp(22), 0, dp(8));
        thai.setLineSpacing(0f, 1.2f);
        card.addView(thai);

        final String diagnostics = diagnosticLine("SAFE_MODE", reason);
        TextView diagnosticView = text(diagnostics, 12, Color.rgb(94, 112, 106), Typeface.MONOSPACE.getStyle());
        diagnosticView.setTypeface(Typeface.MONOSPACE);
        diagnosticView.setTextIsSelectable(true);
        diagnosticView.setPadding(0, dp(14), 0, 0);
        diagnosticView.setOnClickListener(view -> copyDiagnostics(diagnostics));
        diagnosticView.setContentDescription("诊断信息，点按复制");
        card.addView(diagnosticView);

        TextView hint = text("点按上方诊断信息即可复制并发给客服", 12, Color.rgb(111, 128, 122), Typeface.NORMAL);
        hint.setPadding(0, dp(6), 0, 0);
        card.addView(hint);
        return scroll;
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

    private LinearLayout.LayoutParams buttonLayoutParams(int topMargin) {
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
        if (strokeColor != Color.TRANSPARENT) {
            drawable.setStroke(dp(1), strokeColor);
        }
        return drawable;
    }

    private void restartWithMode(boolean software) {
        startupPrefs.edit()
            .putBoolean(PREF_FORCE_SOFTWARE, software)
            .putBoolean(PREF_START_PENDING, false)
            .putInt(PREF_FAILURES, 0)
            .apply();

        Intent restart = new Intent(this, MainActivity.class);
        restart.putExtra(EXTRA_RETRY, true);
        restart.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(restart);
        finish();
    }

    private void openWebViewSettings() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                startActivity(new Intent(Settings.ACTION_WEBVIEW_SETTINGS));
                return;
            }
        } catch (RuntimeException ignored) {
            // Fall through to the store page on devices without this settings screen.
        }

        Intent store = new Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=com.google.android.webview"));
        try {
            startActivity(store);
        } catch (RuntimeException storeUnavailable) {
            startActivity(new Intent(
                Intent.ACTION_VIEW,
                Uri.parse("https://play.google.com/store/apps/details?id=com.google.android.webview")
            ));
        }
    }

    private void copyDiagnostics(String diagnostics) {
        ClipboardManager clipboard = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
        if (clipboard != null) {
            clipboard.setPrimaryClip(ClipData.newPlainText("会来事 Android 诊断信息", diagnostics));
            Toast.makeText(this, "诊断信息已复制", Toast.LENGTH_SHORT).show();
        }
    }

    private String diagnosticLine(String event, String detail) {
        ActivityManager activityManager = (ActivityManager) getSystemService(Context.ACTIVITY_SERVICE);
        boolean lowRam = activityManager != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT
            && activityManager.isLowRamDevice();
        return "event=" + event
            + " | app=" + appVersion()
            + " | guard=" + GUARD_REVISION
            + " | device=" + Build.MANUFACTURER + "/" + Build.MODEL
            + " | sdk=" + Build.VERSION.SDK_INT
            + " | webview=" + webViewVersion()
            + " | lowRam=" + lowRam
            + " | compositor=" + (forceSoftwareCompositor ? "software" : "hardware")
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

    private static String redactUrl(String url) {
        if (url == null) return "null";
        Uri parsed = Uri.parse(url);
        return parsed.getScheme() + "://" + parsed.getHost() + parsed.getPath();
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }

    /** Small API-neutral helper kept separate to make the destroy requirement explicit. */
    private static final class ViewParentCompat {
        private ViewParentCompat() {}

        static void removeFromParent(View view) {
            if (view != null && view.getParent() instanceof ViewGroup) {
                ((ViewGroup) view.getParent()).removeView(view);
            }
        }
    }
}
