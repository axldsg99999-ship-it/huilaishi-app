# Android APK build

The Android package is generated from the standalone offline HTML. The full PWA
tree is intentionally not copied into the APK: `native-www` must contain exactly
one file named `index.html`.

## GitHub Actions

Run the **Android APK** workflow manually from the Actions tab. Every run:

1. builds `../会来事-手机离线单文件.html` with `build-offline.ps1`;
2. stages it as `native-www/index.html`;
3. generates a fresh Capacitor 8.5 Android project;
4. applies microphone permissions and Android version `12.2.3` / `120203`;
5. uploads an installable debug APK and its SHA-256 checksum.

The artifact is named `huilaishi-android-v12.2.3`. Android users must allow the
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
`huilaishi-android-v12.2.3-release.apk`. A partially configured set fails the
build. The workflow never prints the passwords, uploads the keystore, or creates
a signing key. Keep the same release keystore permanently: Android will reject
future updates signed by a different key.

## Equivalent local sequence

Local Android compilation requires Node 22+, JDK 21, Android SDK platform 36,
and Android build tools 36.0.0.

```powershell
.\build-offline.ps1
node scripts/configure-android.mjs stage
npm install --no-save --package-lock=false `
  @capacitor/core@8.5.0 @capacitor/cli@8.5.0 @capacitor/android@8.5.0
npx cap add android
node scripts/configure-android.mjs configure
npx cap sync android
node scripts/configure-android.mjs verify
Set-Location android
.\gradlew.bat assembleDebug
```

The local debug APK is written to
`android/app/build/outputs/apk/debug/app-debug.apk`.
