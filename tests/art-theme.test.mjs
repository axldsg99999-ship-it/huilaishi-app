import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = relative => readFile(new URL(`../${relative}`, import.meta.url), "utf8");
const readBinary = relative => readFile(new URL(`../${relative}`, import.meta.url));

test("the open mobile UI adapter is the final offline and native style layer", async () => {
  const [html, worker, android, theme, bootstrap] = await Promise.all([
    read("index.html"),
    read("service-worker.js"),
    read("scripts/configure-android.mjs"),
    read("open-ui.css"),
    read("pwa-bootstrap.js"),
  ]);

  const themeLink = html.indexOf('href="open-ui.css"');
  assert.ok(themeLink > html.indexOf('href="product-tour.css"'));
  assert.ok(themeLink < html.indexOf("</head>"));
  assert.doesNotMatch(html, /href="art-theme\.css"/u);
  assert.doesNotMatch(html, /href="vendor\/framework7/u);
  assert.match(worker, /"\.\/open-ui\.css"/u);
  assert.match(worker, /BASE_REQUIRED[^\n]+"\.\/open-ui\.css"/u);
  assert.match(android, /"open-ui\.css"/u);
  assert.match(theme, /--f7-theme-color:/u);
  assert.match(theme, /\.bottom-nav\.toolbar/u);
  assert.match(html, /bottom-nav toolbar tabbar tabbar-icons toolbar-bottom/u);
  assert.match(bootstrap, /root\.classList\.add\(isIos \? "ios" : "md"\)/u);
});

test("the collage UI keeps its decoration local and learner controls usable", async () => {
  const theme = await read("open-ui.css");
  assert.doesNotMatch(theme, /url\(["']?https?:/u);
  assert.doesNotMatch(theme, /filter:\s*(?:blur|drop-shadow)/u);
  assert.match(theme, /library-mode-tabs\.segmented[^}]*grid-template-columns:\s*repeat\(3,/u);
  assert.match(theme, /@media \(max-height:\s*700px\)/u);
  assert.match(theme, /@media \(prefers-reduced-motion:\s*reduce\)/u);
  assert.match(theme, /V51 · 中泰艺境/u);
  assert.match(theme, /V52 · 花鸟水墨漫画元素/u);
  assert.match(theme, /V54 · 中泰纹样/u);
  assert.match(theme, /V55 · 中泰当代手帖/u);
  assert.match(theme, /V56 · 手感与秩序/u);
  assert.match(theme, /V57 · 清晰开场与可控听音/u);
  assert.match(theme, /V58 · SAMSUNG BOOT RECOVERY/u);
  assert.match(theme, /--collage-sky:\s*#5aa6a2/u);
  assert.match(theme, /--collage-pink:\s*#c8455e/u);
  assert.match(theme, /--thai-kranok:/u);
  assert.match(theme, /--thai-lotus:/u);
  assert.match(theme, /--cn-ruyi-cloud:/u);
  assert.match(theme, /--cn-window-lattice:/u);
  assert.match(theme, /--collage-halftone:/u);
  assert.match(theme, /\.home-main-menu::before/u);
  assert.match(theme, /--collage-butterfly:/u);
  assert.match(theme, /--cn-peony-scroll:/u);
  assert.match(theme, /--sino-thai-roofline:/u);
  assert.match(theme, /--thai-gable-medallion:/u);
  assert.match(theme, /--atelier-frieze:/u);
  assert.match(theme, /--atelier-peony-line:/u);
  assert.match(theme, /--atelier-jade-deep:/u);
  assert.match(theme, /--sino-thai-weave-soft:/u);
  assert.match(theme, /--art-blossom-branch:\s*var\(--cn-peony-scroll\)/u);
  assert.match(theme, /--art-flying-birds:\s*none/u);
  assert.match(theme, /--art-lotus-etch:/u);
  assert.match(theme, /--art-ink-perspective:\s*var\(--sino-thai-roofline\)/u);
  assert.match(theme, /--comic-impact:\s*none/u);
  assert.match(theme, /\.home-main-menu-head h1::after\s*\{\s*content:\s*none/u);
  assert.match(theme, /\.main-menu-card:nth-child\(4\)[\s\S]*?border-radius:\s*18px/u);
  assert.match(theme, /\.bottom-nav\.toolbar[\s\S]*?backdrop-filter:\s*none/u);
  assert.match(theme, /background-color:\s*#f8f4ea/u);
  assert.match(theme, /#view-library \.vocab-hero::after\s*\{[\s\S]*?content:\s*none/u);
  assert.match(theme, /#mode-sheet:not\(\.hidden\)\s*\{\s*display:\s*flex/u);
  assert.match(theme, /\.speech-pace-options\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3,/u);
  assert.match(theme, /\.direction-header-actions/u);
  assert.match(theme, /V62 · 原创中泰纸境/u);
  assert.match(theme, /--v62-original-backdrop:\s*url\("\.\/assets\/art\/sawadeeka-sino-thai-background-v1\.webp"\)/u);
  assert.match(theme, /button:focus-visible/u);
});

test("the original Sino–Thai background stays lightweight and ships in every build", async () => {
  const assetPath = "assets/art/sawadeeka-sino-thai-background-v1.webp";
  const [asset, theme, worker, android, ios, builder] = await Promise.all([
    readBinary(assetPath),
    read("open-ui.css"),
    read("service-worker.js"),
    read("scripts/configure-android.mjs"),
    read("scripts/configure-ios.mjs"),
    read("build-offline.ps1"),
  ]);

  assert.equal(asset.subarray(0, 4).toString("ascii"), "RIFF");
  assert.equal(asset.subarray(8, 12).toString("ascii"), "WEBP");
  assert.ok(asset.byteLength >= 50_000 && asset.byteLength <= 300_000);
  assert.match(theme, new RegExp(assetPath.replaceAll("/", "\\/"), "u"));
  assert.match(worker, /"\.\/assets\/art\/sawadeeka-sino-thai-background-v1\.webp"/u);
  assert.match(android, /"assets\/art\/sawadeeka-sino-thai-background-v1\.webp"/u);
  assert.match(ios, /"assets\/art\/sawadeeka-sino-thai-background-v1\.webp"/u);
  assert.match(builder, /sawadeeka-sino-thai-background-v1\.webp/u);
  assert.match(builder, /data:image\/webp;base64/u);
});

test("launch, install and download surfaces use the same collage palette", async () => {
  const [html, manifestText, capacitorText, android, ios, download] = await Promise.all([
    read("index.html"),
    read("manifest.webmanifest"),
    read("capacitor.config.json"),
    read("scripts/configure-android.mjs"),
    read("scripts/configure-ios.mjs"),
    read("download.html"),
  ]);
  const manifest = JSON.parse(manifestText);
  const capacitor = JSON.parse(capacitorText);

  assert.match(html, /<title>萨瓦迪卡 · 中泰双向语言学习<\/title>/u);
  assert.match(html, /apple-mobile-web-app-title" content="萨瓦迪卡"/u);
  assert.equal(manifest.name, "萨瓦迪卡 · 中泰双向语言学习");
  assert.equal(manifest.short_name, "萨瓦迪卡");
  assert.equal(capacitor.appName, "萨瓦迪卡");
  assert.match(html, /name="theme-color"\s+content="#5aa6a2"/u);
  assert.match(html, /href="icons\/icon-collage\.svg"/u);
  assert.equal(manifest.background_color, "#f1e4c7");
  assert.equal(manifest.theme_color, "#5aa6a2");
  assert.equal(capacitor.android.backgroundColor, "#f1e4c7");
  assert.equal(capacitor.ios.backgroundColor, "#f1e4c7");
  assert.match(android, /background:#f1e4c7/u);
  assert.match(ios, /background:#f1e4c7/u);
  assert.match(download, /id="collage-download-theme"/u);
  assert.match(download, /萨瓦迪卡 · 手机下载/u);
  assert.match(download, /--brand:#b63c32/u);
  assert.doesNotMatch(download, /#0b1020|#c8ff4a|#25d7c5/u);
});

test("the standalone phone build embeds the final open UI layer", async () => {
  const builder = await read("build-offline.ps1");
  assert.match(builder, /\$OpenUiStyles\s*=\s*Get-Content/u);
  assert.match(builder, /\$OpenUiStyles\.Replace/u);
  assert.match(builder, /href="open-ui\.css"/u);
  assert.match(builder, /data-build-layer=""open-ui""/u);
});
