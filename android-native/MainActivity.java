package __ANDROID_PACKAGE__;

import android.app.Activity;
import android.app.ActivityManager;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

/**
 * Permanent WebView-free migration component for tasks saved by Samsung S1/R2.
 *
 * Older releases left .MainActivity at the top (and sometimes the root) of the
 * recent task. Android may restore that exact component after an APK upgrade,
 * bypassing the new launcher. Keeping this historical class name as a platform
 * Activity lets those records recover without loading the course host or WebView.
 */
public final class MainActivity extends Activity {

    private static final String TAG = "HuilaishiMigration";
    private static final String EXTRA_STALE_TASK_REDIRECT =
        "com.huilaishi.app.extra.STALE_TASK_REDIRECT";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(null);
        Log.w(TAG, "event=STALE_UPGRADE_TASK_REDIRECT | component=MainActivity");

        Intent launcher = new Intent();
        launcher.setClassName(getPackageName(), getPackageName() + ".LauncherActivity");
        launcher.addFlags(
            Intent.FLAG_ACTIVITY_NEW_TASK
                | Intent.FLAG_ACTIVITY_CLEAR_TASK
                | Intent.FLAG_ACTIVITY_SINGLE_TOP
                | Intent.FLAG_ACTIVITY_NO_ANIMATION
        );
        launcher.putExtra(EXTRA_STALE_TASK_REDIRECT, true);
        removeHistoricalTask();
        try {
            getApplicationContext().startActivity(launcher);
        } catch (RuntimeException redirectFailure) {
            Log.e(TAG, "Could not restore the native launcher", redirectFailure);
        }
    }

    private void removeHistoricalTask() {
        try {
            ActivityManager manager =
                (ActivityManager) getSystemService(Context.ACTIVITY_SERVICE);
            int historicalTaskId = getTaskId();
            if (manager != null) {
                for (ActivityManager.AppTask task : manager.getAppTasks()) {
                    ActivityManager.RecentTaskInfo info = task.getTaskInfo();
                    if (info != null && info.id == historicalTaskId) {
                        // Remove the complete S1/R2 task, including an old
                        // LauncherActivity record that may sit below Main.
                        task.finishAndRemoveTask();
                        return;
                    }
                }
            }
        } catch (RuntimeException removalFailure) {
            Log.w(TAG, "Could not remove the complete historical task", removalFailure);
        }
        // Same-affinity S1/R2 activities are still removed if task enumeration
        // is unavailable on an OEM build.
        finishAffinity();
    }
}
