# Android APK build

The Android package uses a curated, multi-file copy of the normal PWA runtime.
It does not embed the 33 MB standalone HTML and it does not copy the complete
256 MB optional voice-pack tree. It does bundle the much smaller, immediately
useful L1 word-head subset for both learning directions.

`native-www` contains the application HTML, separate CSS and JavaScript files,
game and partner runtime files, icons, notices, and all 696 core pronunciation,
navigation, and character clips. `index.html` remains about 60 KB, so Android's
WebView can parse and display the shell without first decoding a giant inline
document. Capacitor adds its two generated `cordova*.js` compatibility shims
only inside the native project. The curated voice catalogue also contains 500
L1 Thai word heads for `zh-th` and 500 L1 Chinese word heads for `th-zh`; these
resolve directly from APK-local assets and never require Cache Storage or a
first-run download.

The staging script replaces `pwa-bootstrap.js` with an Android-only bootstrap.
It prevents Service Worker registration, unregisters a legacy worker if one is
present, and leaves Capacitor's local asset server as the only offline layer.
Neither `service-worker.js` nor `pwa-bootstrap.js` is packaged.

## GitHub Actions

Run the **Android APK** workflow manually from the Actions tab. Every run:

1. derives a clean `native-www` tree from the checked-out PWA resources;
2. validates every local HTML reference, the exact core-audio inventory, and
   every bundled L1 clip against its manifest SHA-256 and byte count;
3. generates a fresh Capacitor 8.5 Android project;
4. prepares the side-by-side Samsung identity `com.huilaishi.app.samsung`;
5. installs a WebView-free native launcher, an isolated `:course` process,
   legacy-task migration guards, and Android version `12.4.0-samsung.1` / `120400`;
6. verifies the copied Android assets and the Service Worker exclusion;
7. requires the complete signing-secret set, then uploads installable debug and
   permanently signed release APKs with checksums. `SHA256SUMS.txt` contains
   only the publicly downloadable release APK; `SHA256SUMS-ARTIFACT.txt` covers
   both diagnostic APKs inside the temporary Actions artifact.

The artifact is named `huilaishi-samsung-android-v12.4.0-r1`. Its application
label is **会来事·三星安全版**, so it upgrades the first Samsung build while remaining
installed beside the earlier beta and is
easy to distinguish. Android users must allow the browser or file manager to
install applications from unknown sources before sideloading it.

## Release signing

The publish workflow requires all of these GitHub Actions repository secrets:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`
- `ANDROID_CERT_SHA256`

With all five present, the workflow produces and verifies
`huilaishi-samsung-12.4.0-r1-release.apk`. It normalizes and compares the APK
certificate fingerprint with `ANDROID_CERT_SHA256`; a missing, partial, or
different signer fails the workflow instead of yielding a misleading
debug-only success. The workflow never prints the passwords or uploads the
keystore. Keep the release keystore permanently: Android rejects future updates
signed by a different key.

The Actions artifact is a 14-day diagnostic handoff, not the permanent download
URL. After the signed-upgrade emulator matrix passes, publish the verified
release APK and `SHA256SUMS.txt` on the matching GitHub Release tag; the phone QR
must point to that permanent release attachment.

## Equivalent local sequence

Local Android compilation requires Node 22+, JDK 21, Android SDK platform 36,
and Android build tools 36.0.0.

```powershell
npm install --no-save --package-lock=false `
  @capacitor/core@8.5.0 @capacitor/cli@8.5.0 @capacitor/android@8.5.0
$env:HUILAISHI_ANDROID_VARIANT = "samsung"
node scripts/configure-android.mjs prepare
node scripts/configure-android.mjs stage
npx cap add android
node scripts/configure-android.mjs configure
npx cap sync android
node scripts/configure-android.mjs verify
Set-Location android
.\gradlew.bat assembleDebug
```

The local debug APK is written to
`android/app/build/outputs/apk/debug/app-debug.apk`.

## Packaged and excluded resources

The native package includes the exact audio referenced by
`pronunciation-audio-map.js` and `cute-audio-map.js`, plus the ten Alai cues and
42 Sugarblade cues used by the UI and games. The staging gate currently expects
696 clips totaling 23,320,920 bytes; a changed map or missing clip fails the
build instead of producing silent buttons.

The native package additionally includes only the ready `word` entries from
`voice-packs/v11-standard/{zh-th,th-zh}/l1`: exactly 1,000 clips totaling
10,472,904 bytes. Android staging writes a reduced catalogue and reduced L1
manifests, verifies every packaged clip's SHA-256, and rejects examples, L2-L6,
or any unexpected voice-pack file. The UI identifies the L1 word-head audio as
already included in the APK.

The rest of the optional `voice-packs/` tree remains excluded because the full
set is about 256 MB. `alai-sonic-mark.mp3` is a design-source marker rather than
runtime audio and is also excluded.

## WebView compatibility

The native wrapper requires Android System WebView 80 or newer. This remains
compatible with Android 7 devices whose System WebView or Chrome has been kept
updated. Older engines cannot parse the application's modern JavaScript, so
they are routed to a small script-free Chinese/Thai update page instead of a
static, non-interactive shell or an unexplained exit.

`LauncherActivity` is a persistent, software-rendered native task root. It does
not reference Capacitor or WebView and waits for an explicit “enter course” tap.
Before launching the course it synchronously writes the startup sentinel and
keeps its Activity underneath the course instead of calling `finish()`.

`MainActivity` is now a permanent WebView-free migration component. If Samsung
restores an S1/R2 recent task after an in-place APK update, that historical
component clears the stale task and redirects to the native recovery screen.
It never loads Capacitor, AndroidX Startup, or WebView.

`CourseActivity` runs in the separate `:course` process with activity-level
hardware acceleration disabled. AndroidX Startup and FileProvider are also
isolated there, so the launcher process initializes no support-library provider
before drawing its first native screen. Android 9+ keeps the stable
`huilaishi_course` data-directory suffix, preserving course storage while
avoiding the earlier same-process WebView profile. A provider, Chromium, V8, or
native course-process failure therefore reveals the still-running recovery root
instead of closing the task. The pending sentinel is cleared only by the real
`onPageCommitVisible` handshake, never by `onNewIntent()` or `onStop()`.

Later renderer exits are still consumed by `onRenderProcessGone`; the dead
WebView is removed and destroyed before the course Activity returns to the
launcher. Android 11+ recovery diagnostics include the system-recorded recent
`:course` exit reason. Debug builds expose separate hooks for a renderer crash
and a pre-WebView whole-course-process death; the Android launch workflow must
verify both while confirming that the native launcher PID remains unchanged.

The **Android launch diagnostics** workflow also installs each permanently
signed S1/R2/R3/12.3-R1 release and upgrades it in place to the signed 12.4 R1 artifact.
S1/R2 leave their historical `MainActivity` in Recents and must migrate to the
native recovery screen when Android retains that task. R3 leaves its newer
`LauncherActivity` + `CourseActivity` task and must either repaint the upgraded
course or return explicitly to the WebView-free launcher. Stock AOSP may instead
remove every old Activity record atomically during package replacement, which
is recorded as a separate safe outcome. A debug-only diagnostic also forces the
exact retained `LauncherActivity` + historical `MainActivity` shape through the
real migration component. The run passes only when those paths and a deliberate
course retry reach `CourseActivity` in `:course` without a package crash or ANR.
