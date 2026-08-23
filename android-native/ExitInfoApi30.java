package __ANDROID_PACKAGE__;

import android.app.Activity;
import android.app.ActivityManager;
import android.app.ApplicationExitInfo;

import java.util.List;

/** API 30-only diagnostics isolated from the launcher class verifier. */
final class ExitInfoApi30 {

    private ExitInfoApi30() {}

    static String recentCourseExit(Activity activity) {
        try {
            ActivityManager manager =
                (ActivityManager) activity.getSystemService(Activity.ACTIVITY_SERVICE);
            if (manager == null) return "unavailable";
            List<ApplicationExitInfo> exits = manager.getHistoricalProcessExitReasons(
                activity.getPackageName(),
                0,
                8
            );
            for (ApplicationExitInfo info : exits) {
                String processName = info.getProcessName();
                if (processName != null && processName.endsWith(":course")) {
                    return reasonName(info.getReason())
                        + "/status=" + info.getStatus()
                        + "/at=" + info.getTimestamp();
                }
            }
            return "none";
        } catch (Throwable ignored) {
            return "unavailable";
        }
    }

    private static String reasonName(int reason) {
        switch (reason) {
            case ApplicationExitInfo.REASON_ANR: return "ANR";
            case ApplicationExitInfo.REASON_CRASH: return "CRASH";
            case ApplicationExitInfo.REASON_CRASH_NATIVE: return "CRASH_NATIVE";
            case ApplicationExitInfo.REASON_DEPENDENCY_DIED: return "DEPENDENCY_DIED";
            case ApplicationExitInfo.REASON_EXCESSIVE_RESOURCE_USAGE: return "EXCESSIVE_RESOURCE";
            case ApplicationExitInfo.REASON_EXIT_SELF: return "EXIT_SELF";
            case ApplicationExitInfo.REASON_INITIALIZATION_FAILURE: return "INIT_FAILURE";
            case ApplicationExitInfo.REASON_LOW_MEMORY: return "LOW_MEMORY";
            case ApplicationExitInfo.REASON_PERMISSION_CHANGE: return "PERMISSION_CHANGE";
            case ApplicationExitInfo.REASON_SIGNALED: return "SIGNALED";
            case ApplicationExitInfo.REASON_USER_REQUESTED: return "USER_REQUESTED";
            case ApplicationExitInfo.REASON_USER_STOPPED: return "USER_STOPPED";
            default: return "OTHER_" + reason;
        }
    }
}
