#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = path.resolve(SCRIPT_DIR, "..");
const IGNORED_DIRECTORIES = new Set([".git", ".playwright-cli", "output", "node_modules", "voice-packs", "assets"]);

function localAsset(value) {
  const source = String(value || "").trim();
  if (!source || source.startsWith("#") || /^(?:data:|https?:|blob:|mailto:|tel:)/iu.test(source)) return null;
  return source.replace(/^\.\//u, "").split(/[?#]/u, 1)[0];
}

export function referencedDocumentAssets(html) {
  const assets = [];
  const tagPattern = /<(?:script|link)\b[^>]*(?:src|href)\s*=\s*["']([^"']+)["'][^>]*>/giu;
  for (const match of html.matchAll(tagPattern)) {
    const asset = localAsset(match[1]);
    if (asset) assets.push(asset);
  }
  return [...new Set(assets)];
}

export function appShellAssets(serviceWorkerSource) {
  const block = serviceWorkerSource.match(/const\s+APP_SHELL\s*=\s*\[([\s\S]*?)\]\s*;/u)?.[1] || "";
  return [...block.matchAll(/["'](\.\/[^"']+)["']/gu)].map(match => match[1].slice(2));
}

function walkScripts(root, directory = root, output = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && IGNORED_DIRECTORIES.has(entry.name)) continue;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walkScripts(root, fullPath, output);
    else if (/\.(?:js|mjs)$/iu.test(entry.name)) output.push(path.relative(root, fullPath));
  }
  return output;
}

export function auditRelease(root = DEFAULT_ROOT) {
  const errors = [];
  const warnings = [];
  const requireFile = relativePath => {
    if (!fs.existsSync(path.join(root, relativePath))) errors.push(`缺少文件：${relativePath}`);
  };

  const indexPath = path.join(root, "index.html");
  const workerPath = path.join(root, "service-worker.js");
  const manifestPath = path.join(root, "manifest.webmanifest");
  const voiceManifestPath = path.join(root, "voice-packs", "manifest.json");
  [
    "index.html",
    "service-worker.js",
    "manifest.webmanifest",
    "PRIVACY.md",
    "SAFETY.md",
    "DEPLOYMENT_SECURITY.md",
    "_headers",
    "voice-packs/manifest.json",
    "VOICE_ASSET_PROVENANCE.md",
    "vendor/THIRD_PARTY_NOTICES.md"
  ].forEach(requireFile);
  if (errors.length) return { ok: false, errors, warnings, stats: {} };

  const index = fs.readFileSync(indexPath, "utf8");
  const worker = fs.readFileSync(workerPath, "utf8");
  const documentAssets = referencedDocumentAssets(index);
  documentAssets.forEach(requireFile);

  const shellAssets = appShellAssets(worker);
  shellAssets.filter(asset => asset !== "").forEach(requireFile);
  for (const asset of documentAssets) {
    if (!shellAssets.includes(asset) && asset !== "manifest.webmanifest") {
      errors.push(`页面依赖未进入离线壳：${asset}`);
    }
  }

  let manifest = null;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch (error) {
    errors.push(`manifest.webmanifest 不是有效 JSON：${error.message}`);
  }
  if (manifest) {
    if (manifest.display !== "standalone") errors.push("manifest.display 必须为 standalone");
    if (!Array.isArray(manifest.icons) || manifest.icons.length < 2) errors.push("manifest 至少需要两个应用图标");
    for (const icon of manifest.icons || []) requireFile(localAsset(icon.src));
  }

  try {
    const voiceManifest = JSON.parse(fs.readFileSync(voiceManifestPath, "utf8"));
    const distribution = voiceManifest.commercialDistribution;
    if (typeof distribution?.approved !== "boolean") {
      errors.push("声音包缺少明确的 commercialDistribution.approved 发布状态");
    } else if (!distribution.approved) {
      warnings.push(`声音包不可商业发布：${distribution.status || distribution.reason || "授权证据待补"}`);
    } else if (!distribution.evidenceDocument) {
      errors.push("声音包标记为可商业发布，但没有 evidenceDocument");
    }
  } catch (error) {
    errors.push(`voice-packs/manifest.json 不是有效 JSON：${error.message}`);
  }

  const scripts = walkScripts(root).sort();
  for (const script of scripts) {
    const check = spawnSync(process.execPath, ["--check", path.join(root, script)], { encoding: "utf8" });
    if (check.status !== 0) errors.push(`JavaScript 语法错误：${script}\n${(check.stderr || check.stdout || "").trim()}`);
  }

  if (!/BASE_READY_MARKER/u.test(worker)) warnings.push("Service Worker 没有可识别的基础壳就绪标记");
  if (!/CORE_AUDIO_TOTAL_BYTES/u.test(worker)) warnings.push("Service Worker 没有声明核心音频下载大小");

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    stats: { scripts: scripts.length, documentAssets: documentAssets.length, shellAssets: shellAssets.length }
  };
}

function main() {
  const report = auditRelease(process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_ROOT);
  console.log(`RELEASE GATE: ${report.ok ? "PASS" : "FAIL"}`);
  console.log(`脚本 ${report.stats.scripts || 0} · 页面依赖 ${report.stats.documentAssets || 0} · 离线壳 ${report.stats.shellAssets || 0}`);
  report.errors.forEach(message => console.error(`[ERROR] ${message}`));
  report.warnings.forEach(message => console.warn(`[WARNING] ${message}`));
  if (!report.ok) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
