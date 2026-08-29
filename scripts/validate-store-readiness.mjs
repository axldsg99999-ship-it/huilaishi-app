import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const strict = process.argv.includes("--strict");
const jsonOutput = process.argv.includes("--json");
const errors = [];
const blockers = [];
const passed = [];

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function requireCheck(condition, success, failure) {
  if (condition) passed.push(success);
  else errors.push(failure);
}

function pending(condition, code, message) {
  if (!condition) blockers.push({ code, message });
}

const packageJson = readJson("package.json");
const androidBuilder = read("scripts/configure-android.mjs");
const iosBuilder = read("scripts/configure-ios.mjs");
const androidWorkflow = read(".github/workflows/android-apk.yml");
const index = read("index.html");
const privacy = read("privacy.html");
const support = read("support.html");
const terms = read("terms.html");
const publisher = readJson("store/compliance/publisher.json");
const voice = readJson("store/compliance/voice-rights.json");
const language = readJson("store/compliance/language-review.json");
const devices = readJson("store/compliance/device-qa.json");

requireCheck(/^\d+\.\d+\.\d+$/.test(packageJson.version), "应用版本号有效", "package.json 版本号无效");
requireCheck(/ANDROID_PLATFORM:\s*"36"/.test(androidWorkflow), "Android 构建平台 API 36", "Android 构建平台必须为 API 36");
requireCheck(/\[\["allowBackup", "false"\], \["fullBackupContent", "false"\]\]/.test(androidBuilder) && /Application backups must remain disabled/.test(androidBuilder), "Android 应用备份由生成器强制关闭", "Android 本机数据备份尚未由生成器关闭");
requireCheck(/HUILAISHI_DISTRIBUTION/.test(androidBuilder) && /STORE_EXCLUDED_FILES/.test(androidBuilder), "Android 商店渠道隔离已实现", "Android 缺少商店渠道隔离");
requireCheck(/HUILAISHI_DISTRIBUTION/.test(iosBuilder) && /STORE_EXCLUDED_FILES/.test(iosBuilder), "iOS 商店渠道隔离已实现", "iOS 缺少商店渠道隔离");
requireCheck(/privacy\.html/.test(index) && /support\.html/.test(index) && /terms\.html/.test(index), "应用内隐私、支持和条款入口完整", "应用内缺少隐私、支持或条款入口");
requireCheck(/原生商店版不提供真人语伴直连/.test(privacy) && /商店版.*不提供真人(?:语伴)?直连/.test(terms), "商店版真人直连边界已披露", "商店版真人直连边界披露不完整");
requireCheck(/github\.com\/axldsg99999-ship-it\/huilaishi-app\/issues/.test(support), "公开支持渠道可用", "支持页没有可操作的联系渠道");

pending(publisher.status === "ready" && publisher.legalName.trim().length > 1, "PUBLISHER_IDENTITY", "填写并核对商店运营主体名称");
pending(publisher.status === "ready" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(publisher.supportEmail), "SUPPORT_EMAIL", "填写可收信的公开支持邮箱");
pending(voice.status === "approved" && voice.adultSpeakerConfirmed === true && voice.recordingConsentSigned === true && voice.commercialDistributionGranted === true && Boolean(voice.releaseDocument), "VOICE_RIGHTS", "归档成年录音者同意书与商业分发授权，或替换为可证明商用再分发的声音包");
pending(language.status === "approved" && language.chineseReviewer && language.thaiReviewer && language.report, "NATIVE_REVIEW", "完成中泰母语教师对正式词库、语域、罗马音和录音脚本的终审归档");
pending(devices.status === "passed" && devices.android.tested === true && devices.android.devices.length >= 2, "ANDROID_DEVICE_QA", "完成至少两台真实 Android 设备测试，其中包含三星 A57");
pending(devices.status === "passed" && devices.ios.tested === true && devices.ios.devices.length >= 1, "IOS_DEVICE_QA", "完成至少一台真实 iPhone 测试");

const report = {
  generatedAt: new Date().toISOString(),
  version: packageJson.version,
  mode: strict ? "production" : "candidate",
  codeReady: errors.length === 0,
  productionReady: errors.length === 0 && blockers.length === 0,
  passed,
  errors,
  blockers,
};

if (jsonOutput) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
else {
  console.log(`[store-readiness] ${report.codeReady ? "代码门禁通过" : "代码门禁失败"}; ${blockers.length} 项发布前人工门禁。`);
  passed.forEach(item => console.log(`  ✓ ${item}`));
  errors.forEach(item => console.error(`  ✗ ${item}`));
  blockers.forEach(item => console.log(`  ○ ${item.code}: ${item.message}`));
}

if (errors.length || (strict && blockers.length)) process.exitCode = 1;
