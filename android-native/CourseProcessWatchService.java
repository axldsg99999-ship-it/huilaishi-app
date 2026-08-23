package __ANDROID_PACKAGE__;

import android.app.Service;
import android.content.Intent;
import android.os.Binder;
import android.os.IBinder;

/**
 * WebView-free Binder heartbeat hosted in the same :course process as
 * CourseActivity. LauncherActivity keeps this binding while a course is open;
 * Binder death therefore reaches the persistent native process even when the
 * course dies before Activity lifecycle callbacks can return a result.
 */
public final class CourseProcessWatchService extends Service {

    private final IBinder heartbeat = new Binder();

    @Override
    public IBinder onBind(Intent intent) {
        return heartbeat;
    }
}
