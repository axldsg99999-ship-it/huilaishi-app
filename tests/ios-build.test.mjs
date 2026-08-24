import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = relativePath => readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");

test("iPhone PWA install guidance follows current Safari steps without claiming an IPA", async () => {
  const html = await read("index.html");
  const app = await read("app.js");
  const css = await read("styles.css");
  const download = await read("download.html");

  assert.match(html, /id="ios-install-sheet"[^]*?添加到主屏幕[^]*?作为网页 App 打开/u);
  assert.match(html, /TestFlight \/ App Store[^]*?Apple Developer 账号[^]*?Provisioning Profile/u);
  assert.match(app, /function isAppleMobileDevice\(\)[^]*?MacIntel[^]*?maxTouchPoints/u);
  assert.match(app, /function isIosSafariBrowser\(\)[^]*?crios[^]*?fxios/u);
  assert.match(app, /installRequest === "ios"[^]*?openIosInstallGuide/u);
  assert.match(css, /\.ios-install-steps li\s*\{[^}]*min-height:\s*48px/u);
  assert.match(download, /href="\.\/\?install=ios"/u);
  assert.match(download, /PWA[^]*?不是 App Store 包/u);
  assert.match(download, /凭证齐全前不会提供假 IPA/u);
  assert.doesNotMatch(download, /下载(?:原生)?\s*i(?:OS|Phone)[^<]{0,30}IPA/iu);
});

test("iOS generator packages offline assets and a minimal honest privacy manifest", async () => {
  const generator = await read("scripts/configure-ios.mjs");
  const config = JSON.parse(await read("capacitor.config.json"));

  assert.equal(config.appId, "com.huilaishi.app");
  assert.equal(config.webDir, "native-www");
  assert.deepEqual(config.ios, {
    backgroundColor: "#f6f1e7",
    contentInset: "automatic",
    preferredContentMode: "mobile",
    scrollEnabled: true,
    allowsLinkPreview: false,
  });
  assert.match(generator, /EXPECTED_CORE_AUDIO_COUNT = 696/u);
  assert.match(generator, /EXPECTED_L1_AUDIO_COUNT = 1_000/u);
  assert.match(generator, /HUILAISHI_NATIVE_IOS/u);
  assert.match(generator, /NSMicrophoneUsageDescription/u);
  assert.match(generator, /NSSpeechRecognitionUsageDescription/u);
  assert.match(generator, /NSPrivacyTracking[\s\S]*?<false\/>/u);
  assert.match(generator, /NSPrivacyAccessedAPITypes[\s\S]*?<array\/>/u);
  assert.match(generator, /PrivacyInfo\.xcprivacy in Resources/u);
  assert.doesNotMatch(generator, /userDefinedRuntimeAttributes/u, "launch screens reject runtime layer attributes");
  assert.match(generator, /process\.platform !== "darwin"[\s\S]*?1024/u);
});

test("iOS CI pins Xcode 26 and keeps TestFlight behind a complete secret gate", async () => {
  const workflow = await read(".github/workflows/ios-build.yml");
  const docs = await read("IOS_BUILD.md");
  const exportOptions = await read("ios-native/ExportOptions.plist");

  assert.match(workflow, /runs-on: macos-26/g);
  assert.match(workflow, /DEVELOPER_DIR: \/Applications\/Xcode_26\.6\.app\/Contents\/Developer/u);
  assert.match(workflow, /CODE_SIGNING_ALLOWED=NO/u);
  assert.match(workflow, /SIMULATOR ONLY — NOT AN IPA/u);
  assert.match(workflow, /inputs\.upload_to_testflight == true[^\n]*github\.ref == 'refs\/heads\/main'/u);
  assert.match(workflow, /environment: app-store-connect/u);
  const testflightJob = workflow.slice(workflow.indexOf("  testflight-upload:"));
  const testflightJobPreamble = testflightJob.slice(0, testflightJob.indexOf("\n    steps:"));
  const generateStep = testflightJob.slice(
    testflightJob.indexOf("      - name: Generate the native iOS project"),
    testflightJob.indexOf("      - name: Validate secrets and install the distribution identity and profile"),
  );
  const signingStep = testflightJob.slice(
    testflightJob.indexOf("      - name: Validate secrets and install the distribution identity and profile"),
    testflightJob.indexOf("      - name: Archive and export the signed App Store Connect build"),
  );
  assert.doesNotMatch(testflightJobPreamble, /secrets\./u);
  assert.doesNotMatch(generateStep, /secrets\./u);
  for (const secret of [
    "APPLE_TEAM_ID",
    "APPLE_CERTIFICATE_BASE64",
    "APPLE_CERTIFICATE_PASSWORD",
    "APPLE_CERTIFICATE_SHA256",
    "APPLE_PROVISIONING_PROFILE_BASE64",
    "APP_STORE_CONNECT_API_KEY_ID",
    "APP_STORE_CONNECT_ISSUER_ID",
    "APP_STORE_CONNECT_API_PRIVATE_KEY_BASE64",
  ]) {
    assert.match(workflow, new RegExp(`secrets\\.${secret}`));
    assert.match(signingStep, new RegExp(`secrets\\.${secret}`));
    assert.match(docs, new RegExp(`\\b${secret}\\b`));
  }
  assert.match(testflightJob, /Archive and export[^]*?env:\r?\n\s+APPLE_TEAM_ID: \$\{\{ secrets\.APPLE_TEAM_ID \}\}/u);
  assert.match(testflightJob, /Validate and upload[^]*?env:\r?\n\s+APP_STORE_CONNECT_API_KEY_ID: \$\{\{ secrets\.APP_STORE_CONNECT_API_KEY_ID \}\}\r?\n\s+APP_STORE_CONNECT_ISSUER_ID: \$\{\{ secrets\.APP_STORE_CONNECT_ISSUER_ID \}\}/u);
  assert.match(workflow, /application_identifier[^]*?APPLE_TEAM_ID\}\.com\.huilaishi\.app/u);
  assert.match(workflow, /altool --validate-app[^]*?altool --upload-app/u);
  assert.match(exportOptions, /<string>app-store-connect<\/string>/u);
  assert.match(docs, /不能装到真机/u);
  assert.match(docs, /Privacy Report/u);
  assert.match(docs, /2026-04-28/u);
});
