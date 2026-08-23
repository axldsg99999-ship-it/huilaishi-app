# Android APK build

The Android package uses a curated, multi-file copy of the normal PWA runtime.
It does not embed the 33 MB standalone HTML and it does not copy the complete
256 MB optional voice-pack tree.

`native-www` contains the application HTML, separate CSS and JavaScript files,
game and partner runtime files, icons, notices, and all 696 core pronunciation,
navigation, and character clips. `index.html` remains about 60 KB, so Android's
WebView can parse and display the shell without first decoding a giant inline
document. Capacitor adds its two generated `cordova*.js` compatibility shims
only inside the native project.

The staging script replaces `pwa-bootstrap.js` with an Android-only bootstrap.
It prevents Service Worker registration, unregisters a legacy worker if one is
present, and leaves Capacitor's local asset server as the only offline layer.
Neither `service-worker.js` nor `pwa-bootstrap.js` is packaged.

## GitHub Actions

Run the **Android APK** workflow manually from the Actions tab. Every run:

1. derives a clean `native-www` tree from the checked-out PWA resources;
2. validates every local HTML reference and the exact core-audio inventory;
3. generates a fresh Capacitor 8.5 Android project;
4. applies microphone permissions and Android version `12.2.4` / `120204`;
5. verifies the copied Android assets and the Service Worker exclusion;
6. uploads an installable debug APK and its SHA-256 checksum.

The artifact is named `huilaishi-android-v12.2.4`. Android users must allow the
browser or file manager to install applications from unknown sources before
sideloading it.

## Optional release signing

The workflow builds only the debug APK unless all of these GitHub Actions
repository secrets are present:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

When all four are present, the workflow additionally produces and verifies
`huilaishi-android-v12.2.4-release.apk`. A partially configured set fails the
build. The workflow never prints the passwords, uploads the keystore, or creates
a signing key. Keep the same release keystore permanently: Android will reject
future updates signed by a different key.

## Equivalent local sequence

Local Android compilation requires Node 22+, JDK 21, Android SDK platform 36,
and Android build tools 36.0.0.

```powershell
npm install --no-save --package-lock=false `
  @capacitor/core@8.5.0 @capacitor/cli@8.5.0 @capacitor/android@8.5.0
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

The optional `voice-packs/` directory is intentionally excluded because it is
about 256 MB. Its management UI reports that those large level packs are
available only from the online/PWA distribution. `alai-sonic-mark.mp3` is a
design-source marker rather than runtime audio and is also excluded.

## WebView compatibility

The native wrapper requires Android System WebView 80 or newer. This remains
compatible with Android 7 devices whose System WebView or Chrome has been kept
updated. Older engines cannot parse the application's modern JavaScript, so
they are routed to a small script-free Chinese/Thai update page instead of a
static, non-interactive shell or an unexplained exit.
