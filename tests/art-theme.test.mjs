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
  assert.match(theme, /V63 · 中泰纸上街机/u);
  assert.match(theme, /--v63-comic-spark:/u);
  assert.match(theme, /--v63-tape-stripe:/u);
  assert.match(theme, /V70 · 手工拼贴展开/u);
  assert.match(theme, /--v70-burst:\s*url\("\.\/assets\/art\/sawadeeka-collage-burst-v1\.webp"\)/u);
  assert.match(theme, /HANDMADE COLLAGE IN MOTION/u);
  assert.match(theme, /V71 · MICRO LANGUAGE/u);
  assert.match(theme, /\.hls-duel-close/u);
  assert.match(theme, /\.cute-pack-glyph/u);
  assert.match(theme, /\.bottom-sheet\s*\{[\s\S]*?border-radius:0\s*!important/u);
  assert.match(theme, /button:focus-visible/u);
});

test("the youth campus scrapbook theme reaches every core and dynamically loaded surface", async () => {
  const [html, app, theme, arcade, battle, vocab] = await Promise.all([
    read("index.html"),
    read("app.js"),
    read("open-ui.css"),
    read("arcade.css"),
    read("battle.css"),
    read("vocab.css"),
  ]);

  assert.match(html, /<html[^>]+data-campus-theme="day"/u);
  assert.match(html, /class="campus-theme-options"/u);
  assert.match(html, /data-campus-theme="day"[\s\S]*data-campus-theme="night"/u);
  assert.match(app, /CAMPUS_THEME_KEY/u);
  assert.match(app, /campus-theme-changing/u);
  assert.match(app, /campus-page-enter/u);
  assert.match(theme, /V73 · 青春校园纸质拼贴/u);
  assert.match(theme, /html\[data-campus-theme="day"\]/u);
  assert.match(theme, /html\[data-campus-theme="night"\]/u);
  assert.match(theme, /--campus-denim:/u);
  assert.match(theme, /--campus-fold:/u);
  assert.match(theme, /\.home-primary-mission::after/u);
  assert.match(theme, /@keyframes campus-page-collage-in/u);
  assert.match(arcade, /V73 · GAME SHEET/u);
  assert.match(arcade, /html\[data-campus-theme\] #arcade-sheet/u);
  assert.match(battle, /V73\.1 · final override/u);
  assert.match(battle, /html\[data-campus-theme\] \.hls-duel-voice-arena/u);
  assert.match(vocab, /V73 · VOCAB INDEX/u);
  assert.match(vocab, /html\[data-campus-theme\] #view-library \.vocab-list/u);
});

test("the redesigned three-monster set is transparent, lightweight and loaded only with games", async () => {
  const assets = [
    "assets/game/monster-paper-lantern-v2.webp",
    "assets/game/monster-lotus-flame-v2.webp",
    "assets/game/monster-ink-king-v2.webp",
  ];
  const [files, arcade, app, worker, android, ios, builder, provenance] = await Promise.all([
    Promise.all(assets.map(readBinary)),
    read("arcade.js"),
    read("app.js"),
    read("service-worker.js"),
    read("scripts/configure-android.mjs"),
    read("scripts/configure-ios.mjs"),
    read("build-offline.ps1"),
    read("assets/game/ART_PROVENANCE.md"),
  ]);

  for (const [index, asset] of files.entries()) {
    assert.equal(asset.subarray(0, 4).toString("ascii"), "RIFF");
    assert.equal(asset.subarray(8, 12).toString("ascii"), "WEBP");
    assert.ok(asset.byteLength >= 150_000 && asset.byteLength <= 400_000, `${assets[index]} should stay mobile-friendly`);
    const chunks = asset.toString("latin1");
    assert.ok(chunks.includes("ALPH") || chunks.includes("VP8L"), `${assets[index]} should preserve transparency`);
    const escaped = assets[index].replaceAll("/", "\\/");
    assert.match(arcade, new RegExp(`\\.\\/${escaped}`, "u"));
    assert.doesNotMatch(worker, new RegExp(`"\\.\\/${escaped}"`, "u"));
    assert.match(android, new RegExp(`"${escaped}"`, "u"));
    assert.match(ios, new RegExp(`"${escaped}"`, "u"));
    assert.match(builder, new RegExp(assets[index].split("/").at(-1).replaceAll(".", "\\."), "u"));
    assert.match(provenance, new RegExp(assets[index].split("/").at(-1).replaceAll(".", "\\."), "u"));
  }

  assert.doesNotMatch(`${arcade}\n${worker}\n${android}\n${ios}\n${builder}`, /monster-(?:paper-lantern|lotus-flame|ink-king)-v1/u);
  assert.match(app, /games: Object\.freeze\([\s\S]*?"arcade\.js"/u);
  assert.match(arcade, /zh: "纸灯兽"[\s\S]*?zh: "莲火兽"[\s\S]*?zh: "金翅墨王"/u);
  assert.match(provenance, /手工裁纸、旧织物贴花、水墨、金箔纸/u);
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

test("the handmade collage burst stays transparent-ready, lightweight and offline", async () => {
  const assetPath = "assets/art/sawadeeka-collage-burst-v1.webp";
  const [asset, html, theme, worker, android, ios, builder, provenance] = await Promise.all([
    readBinary(assetPath),
    read("index.html"),
    read("open-ui.css"),
    read("service-worker.js"),
    read("scripts/configure-android.mjs"),
    read("scripts/configure-ios.mjs"),
    read("build-offline.ps1"),
    read("assets/art/ART_PROVENANCE.md"),
  ]);

  assert.equal(asset.subarray(0, 4).toString("ascii"), "RIFF");
  assert.equal(asset.subarray(8, 12).toString("ascii"), "WEBP");
  assert.ok(asset.byteLength >= 100_000 && asset.byteLength <= 400_000);
  assert.match(theme, new RegExp(assetPath.replaceAll("/", "\\/"), "u"));
  assert.match(worker, /"\.\/assets\/art\/sawadeeka-collage-burst-v1\.webp"/u);
  assert.match(android, /"assets\/art\/sawadeeka-collage-burst-v1\.webp"/u);
  assert.match(ios, /"assets\/art\/sawadeeka-collage-burst-v1\.webp"/u);
  assert.match(builder, /sawadeeka-collage-burst-v1\.webp/u);
  assert.match(provenance, /built-in image generation tool/u);
  assert.doesNotMatch(html, /轻点一张卡片|点卡即进入/u);
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
  assert.match(html, /name="theme-color"\s+content="#6f96b3"/u);
  assert.match(html, /href="icons\/icon-collage\.svg"/u);
  assert.equal(manifest.background_color, "#eadfce");
  assert.equal(manifest.theme_color, "#6f96b3");
  assert.equal(capacitor.android.backgroundColor, "#eadfce");
  assert.equal(capacitor.ios.backgroundColor, "#eadfce");
  assert.match(android, /background:#eadfce/u);
  assert.match(ios, /background:#eadfce/u);
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
