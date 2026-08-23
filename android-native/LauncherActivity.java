package __ANDROID_PACKAGE__;

import android.app.Activity;
import android.app.ActivityManager;
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
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

import androidx.webkit.WebViewCompat;

/**
 * Script-free launcher that breaks startup crash loops before a WebView exists.
 */
public class LauncherActivity extends Activity {

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
    private static final long STARTUP_WINDOW_MS = 20L * 60L * 1000L;

    private SharedPreferences startupPrefs;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        startupPrefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);

        String storedRevision = startupPrefs.getString(PREF_GUARD_REVISION, "");
        if (!GUARD_REVISION.equals(storedRevision)) {
            startupPrefs.edit().clear().putString(PREF_GUARD_REVISION, GUARD_REVISION).commit();
        }

        long now = System.currentTimeMillis();
        long lastStartAt = startupPrefs.getLong(PREF_LAST_START_AT, 0L);
        boolean previousStartIncomplete = startupPrefs.getBoolean(PREF_START_PENDING, false)
            && lastStartAt > 0L
            && now - lastStartAt <= STARTUP_WINDOW_MS;
        boolean forcedSafeMode = getIntent() != null
            && getIntent().getBooleanExtra(EXTRA_SHOW_SAFE_MODE, false);

        if (previousStartIncomplete || forcedSafeMode) {
            startupPrefs.edit()
                .putBoolean(PREF_START_PENDING, false)
                .putInt(PREF_FAILURES, startupPrefs.getInt(PREF_FAILURES, 0) + 1)
                .apply();
            String reason = forcedSafeMode
                ? "Android 网页组件初始化失败"
                : "上次启动在界面出现前意外中断";
            Log.w(TAG, diagnosticLine("LAUNCHER_SAFE_MODE", reason));
            showRecovery(reason);
            return;
        }

        launchMain(false);
    }

    private void launchMain(boolean retry) {
        long now = System.currentTimeMillis();
        startupPrefs.edit()
            .putBoolean(PREF_START_PENDING, true)
            .putLong(PREF_LAST_START_AT, now)
            .apply();

        Intent main = new Intent(this, MainActivity.class);
        main.putExtra(EXTRA_RETRY, retry);
        if (isDebuggable()
            && getIntent() != null
            && getIntent().getBooleanExtra(EXTRA_FORCE_RENDERER_CRASH, false)) {
            main.putExtra(EXTRA_FORCE_RENDERER_CRASH, true);
        }
        main.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        startActivity(main);
        finish();
    }

    private void showRecovery(String reason) {
        ScrollView scroll = new ScrollView(this);
        scroll.setFillViewport(true);
        scroll.setBackgroundColor(Color.rgb(246, 241, 231));

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

        TextView mark = text("来", 25, Color.WHITE, Typeface.BOLD);
        mark.setGravity(Gravity.CENTER);
        mark.setBackground(roundedBackground(Color.rgb(23, 111, 96), 17, Color.TRANSPARENT));
        card.addView(mark, new LinearLayout.LayoutParams(dp(54), dp(54)));

        TextView title = text("已阻止重复闪退", 27, Color.rgb(23, 59, 52), Typeface.BOLD);
        title.setPadding(0, dp(20), 0, dp(8));
        card.addView(title);

        TextView body = text(
            "应用没有损坏。" + reason + "。\n\n请用轻量模式启动。三星设备会使用更稳的显示方式，课程、录音和离线语音仍可使用。",
            16,
            Color.rgb(67, 91, 84),
            Typeface.NORMAL
        );
        body.setLineSpacing(0f, 1.25f);
        card.addView(body);

        Button safeStart = actionButton("轻量模式启动（推荐）", true);
        safeStart.setOnClickListener(view -> {
            startupPrefs.edit()
                .putBoolean(PREF_FORCE_SOFTWARE, true)
                .putInt(PREF_FAILURES, 0)
                .apply();
            launchMain(true);
        });
        card.addView(safeStart, buttonParams(22));

        Button update = actionButton("更新 WebView / Chrome", false);
        update.setOnClickListener(view -> openWebViewSettings());
        card.addView(update, buttonParams(10));

        Button normal = actionButton("正常模式启动", false);
        normal.setOnClickListener(view -> {
            startupPrefs.edit()
                .putBoolean(PREF_FORCE_SOFTWARE, false)
                .putInt(PREF_FAILURES, 0)
                .apply();
            launchMain(true);
        });
        card.addView(normal, buttonParams(10));

        TextView thai = text(
            "หยุดการปิดแอปซ้ำแล้ว\nโปรดเริ่มด้วยโหมดเบา ซึ่งเหมาะกับอุปกรณ์ Samsung บางรุ่นมากกว่า",
            14,
            Color.rgb(82, 102, 96),
            Typeface.NORMAL
        );
        thai.setPadding(0, dp(22), 0, dp(8));
        thai.setLineSpacing(0f, 1.2f);
        card.addView(thai);

        TextView diagnostics = text(
            diagnosticLine("RECOVERY", reason),
            12,
            Color.rgb(94, 112, 106),
            Typeface.NORMAL
        );
        diagnostics.setTypeface(Typeface.MONOSPACE);
        diagnostics.setTextIsSelectable(true);
        diagnostics.setPadding(0, dp(14), 0, 0);
        card.addView(diagnostics);
        setContentView(scroll);
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

    private String diagnosticLine(String event, String detail) {
        ActivityManager manager = (ActivityManager) getSystemService(ACTIVITY_SERVICE);
        boolean lowRam = manager != null && manager.isLowRamDevice();
        String webView = "unavailable";
        try {
            android.content.pm.PackageInfo info = WebViewCompat.getCurrentWebViewPackage(this);
            if (info != null) webView = info.packageName + "/" + info.versionName;
        } catch (Throwable ignored) {
            // Diagnostics must never make recovery fail.
        }
        return "event=" + event
            + " | app=12.2.5-samsung.1"
            + " | guard=" + GUARD_REVISION
            + " | device=" + Build.MANUFACTURER + "/" + Build.MODEL
            + " | sdk=" + Build.VERSION.SDK_INT
            + " | webview=" + webView
            + " | lowRam=" + lowRam
            + " | detail=" + detail;
    }

    private boolean isDebuggable() {
        return (getApplicationInfo().flags & android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0;
    }

    private int dp(int value) {
        return Math.round(value * getResources().getDisplayMetrics().density);
    }
}
