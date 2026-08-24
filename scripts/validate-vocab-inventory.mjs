#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, "..");
const VOCAB_FILES = [
  "vocab-l1-l2.js",
  "vocab-l3-l4.js",
  "vocab-l5-l6.js",
  "vocab-expansion-l1-l3.js",
  "vocab-expansion-l4-l6.js",
  "thai-phonetic.js"
];
const ACTIVE_REQUIRED_FIELDS = ["id", "cat", "pos", "zh", "py", "th", "ro", "exZh", "exPy", "exTh", "exRo"];
const EXPECTED_SOURCE_HASHES = Object.freeze({
  "omw-cmn": "379FD2E41D3E1395F9F27CF23A39C6181849FFB4020C14A07ED2A4D4DD651122",
  "omw-tha": "33445C39F9329130012E8013113023B42C630BBCBB61D49434D86BBDB2C710CF",
  "omw-eng": "D1409D88ADDCDB890B1606DD280B558CCA4258B1F33BD580D54ED949DAAD1EDE"
});

function normalize(value) {
  return String(value ?? "").normalize("NFC").trim().replace(/\s+/gu, " ");
}

function pairKey(zh, th) {
  return `${normalize(zh)}\u0000${normalize(th)}`;
}

function add(errors, condition, message) {
  if (!condition) errors.push(message);
}

function countDuplicates(values) {
  const seen = new Set();
  const duplicates = [];
  for (const value of values) {
    if (seen.has(value)) duplicates.push(value);
    seen.add(value);
  }
  return duplicates;
}

function loadActiveVocabulary(rootDir) {
  const world = {};
  world.window = world;
  world.globalThis = world;
  const sandbox = vm.createContext(world);
  for (const filename of VOCAB_FILES) {
    const source = fs.readFileSync(path.join(rootDir, filename), "utf8");
    vm.runInContext(source, sandbox, { filename });
  }
  return [
    ...(sandbox.HUILAISHI_VOCAB_L12 || []),
    ...(sandbox.HUILAISHI_VOCAB_L34 || []),
    ...(sandbox.HUILAISHI_VOCAB_L56 || []),
    ...(sandbox.HUILAISHI_VOCAB_EXPANSION_L13 || []),
    ...(sandbox.HUILAISHI_VOCAB_EXPANSION_L46 || [])
  ];
}

function loadRuntimeReview(rootDir) {
  const world = {};
  world.window = world;
  const sandbox = vm.createContext(world);
  const source = fs.readFileSync(path.join(rootDir, "vocab-review-candidates.js"), "utf8");
  vm.runInContext(source, sandbox, { filename: "vocab-review-candidates.js" });
  return sandbox.window.HUILAISHI_VOCAB_REVIEW || null;
}

export function validateVocabInventory({ active, firstPass, expansion, runtime = null }) {
  const errors = [];
  const firstCandidates = firstPass?.candidates || [];
  const expansionCandidates = expansion?.candidates || [];
  const activeIds = active.map(word => normalize(word.id));
  const activePairs = active.map(word => pairKey(word.zh, word.th));
  const activeZh = new Set(active.map(word => normalize(word.zh)));
  const activeTh = new Set(active.map(word => normalize(word.th)));
  const activePairSet = new Set(activePairs);

  add(errors, active.length === 3000, `active training cards must stay 3000, found ${active.length}`);
  add(errors, activePairSet.size === 2875, `active distinct pairs must stay 2875, found ${activePairSet.size}`);
  add(errors, countDuplicates(activeIds).length === 0, "active card ids must be unique");
  add(errors, active.every(word => Number.isInteger(word.level) && word.level >= 1 && word.level <= 6), "active levels must be integers from 1 to 6");
  for (const word of active) {
    const label = `active ${word?.id || "unknown"}`;
    add(errors, ACTIVE_REQUIRED_FIELDS.every(field => normalize(word?.[field])), `${label}: required bilingual field is missing`);
    add(errors, /\p{Script=Han}/u.test(normalize(word?.zh)), `${label}: Chinese headword has no Han character`);
    add(errors, /\p{Script=Thai}/u.test(normalize(word?.th)), `${label}: Thai headword has no Thai character`);
    add(errors, /[A-Za-z\u00C0-\u024F]/u.test(normalize(word?.py)) && !/[\p{Script=Han}\p{Script=Thai}]/u.test(normalize(word?.py)), `${label}: pinyin field is invalid`);
    add(errors, /[A-Za-z]/u.test(normalize(word?.ro)) && !/[\p{Script=Han}\p{Script=Thai}]/u.test(normalize(word?.ro)), `${label}: Thai romanization field is invalid`);
    add(errors, word.contentReviewStatus === "native-review-pending", `${label}: active content must not imply native approval`);
    add(errors, word.thReading?.nativeReviewed === false && word.thReading?.nativeReviewStatus === "pending", `${label}: Thai reading review status must remain pending`);
  }

  add(errors, firstPass?.decision === "review-only-do-not-import", "first-pass queue must remain review-only");
  add(errors, firstCandidates.length === 125, `first-pass queue must contain 125 candidates, found ${firstCandidates.length}`);
  add(errors, expansion?.decision === "review-only-do-not-train", "expansion queue must remain review-only");
  add(errors, expansionCandidates.length === 1000, `expansion queue must contain 1000 candidates, found ${expansionCandidates.length}`);
  add(errors, expansion?.inventoryPolicy?.activeTrainingCards === 3000, "expansion policy must report 3000 active cards");
  add(errors, expansion?.inventoryPolicy?.totalDistinctPairsIncludingReviewOnly === 4000, "expansion policy must report exactly 4000 distinct inventory pairs");
  add(errors, expansion?.inventoryPolicy?.nativeApprovedPairs === 0, "expansion policy must not claim native-approved pairs");
  add(errors, expansion?.generationPolicy?.independentSecondSourceUsed === false, "expansion policy must disclose that no independent second source was used");
  add(errors, expansion?.generationPolicy?.nativeReviewPerformed === false, "expansion policy must disclose that native review was not performed");

  const firstZh = new Set();
  const firstTh = new Set();
  const firstPairs = new Set();
  for (const row of firstCandidates) {
    const candidate = row?.candidate || {};
    firstZh.add(normalize(candidate.zh));
    firstTh.add(normalize(candidate.th));
    firstPairs.add(pairKey(candidate.zh, candidate.th));
  }
  const expansionIds = [];
  const expansionZh = [];
  const expansionTh = [];
  const expansionPairs = [];
  const expansionSynsets = [];
  let previousFrequency = Number.POSITIVE_INFINITY;
  for (const candidate of expansionCandidates) {
    const label = `expansion ${candidate?.id || "unknown"}`;
    const zh = normalize(candidate?.zh);
    const th = normalize(candidate?.th);
    const pair = pairKey(zh, th);
    expansionIds.push(normalize(candidate?.id));
    expansionZh.push(zh);
    expansionTh.push(th);
    expansionPairs.push(pair);
    expansionSynsets.push(normalize(candidate?.synset));
    add(errors, /^omw-review-\d{4}$/u.test(candidate?.id || ""), `${label}: id is invalid`);
    add(errors, /^\p{Script=Han}{1,6}$/u.test(zh), `${label}: Chinese candidate field is invalid`);
    add(errors, /^[\p{Script=Thai} ]{1,28}$/u.test(th), `${label}: Thai candidate field is invalid`);
    add(errors, /^[0-9]{8}-[nvar]$/u.test(candidate?.synset || ""), `${label}: synset is invalid`);
    add(errors, candidate?.pos === candidate?.synset?.slice(-1), `${label}: POS does not match synset`);
    add(errors, normalize(candidate?.englishSense), `${label}: English sense label is missing`);
    add(errors, Number.isInteger(candidate?.frequencyTagCount) && candidate.frequencyTagCount > 0, `${label}: ranking evidence is invalid`);
    add(errors, candidate?.frequencyTagCount <= previousFrequency, `${label}: candidates are not deterministically frequency-ordered`);
    previousFrequency = candidate?.frequencyTagCount;
    add(errors, candidate?.py === null && candidate?.ro === null && candidate?.chineseNearSound === null, `${label}: unreviewed pronunciation fields must stay null`);
    add(errors, candidate?.examples === null, `${label}: unreviewed examples must stay null`);
    add(errors, candidate?.status === "machine-screened-review-candidate", `${label}: review status is invalid`);
    add(errors, candidate?.trainingEligible === false && candidate?.quizEligible === false && candidate?.speechEligible === false, `${label}: candidate leaked into a learning path`);
    add(errors, candidate?.secondSourceConfirmed === false && candidate?.nativeReviewed === false, `${label}: review claims are unsafe`);
    add(errors, candidate?.pronunciationReady === false && candidate?.examplesReady === false && candidate?.audioReady === false, `${label}: incomplete assets were marked ready`);
    add(errors, candidate?.semanticReviewStatus === "pending-human-review" && candidate?.safetyReviewStatus === "pending-human-review", `${label}: human review status is missing`);
    add(errors, candidate?.evidence?.relation === "same-pwn30-synset", `${label}: relation provenance is missing`);
    add(errors, ["omw-cmn", "omw-tha", "omw-eng"].every(id => candidate?.evidence?.sourceIds?.includes(id)), `${label}: source provenance is incomplete`);
    add(errors, !activeZh.has(zh) && !activeTh.has(th) && !activePairSet.has(pair), `${label}: candidate overlaps the active corpus`);
    add(errors, !firstZh.has(zh) && !firstTh.has(th) && !firstPairs.has(pair), `${label}: candidate overlaps the first-pass queue`);
  }
  add(errors, countDuplicates(expansionIds).length === 0, "expansion ids must be unique");
  add(errors, countDuplicates(expansionZh).length === 0, "expansion Chinese headwords must be unique");
  add(errors, countDuplicates(expansionTh).length === 0, "expansion Thai headwords must be unique");
  add(errors, countDuplicates(expansionPairs).length === 0, "expansion bilingual pairs must be unique");
  add(errors, countDuplicates(expansionSynsets).length === 0, "expansion synsets must be unique");

  const catalog = new Map((expansion?.sourceCatalog || []).map(source => [source.id, source]));
  for (const [sourceId, hash] of Object.entries(EXPECTED_SOURCE_HASHES)) {
    const source = catalog.get(sourceId);
    add(errors, Boolean(source), `source catalog is missing ${sourceId}`);
    add(errors, source?.version === "2.0" && source?.sha256 === hash, `${sourceId} version/hash provenance is invalid`);
    add(errors, Boolean(source?.url && source?.license?.id && source?.license?.url && source?.license?.localNotice), `${sourceId} license provenance is incomplete`);
  }
  const frequencySource = catalog.get("pwn30-semcor-counts");
  add(errors, frequencySource?.version === "3.0", "frequency ranking source is missing or unpinned");
  add(errors, frequencySource?.archiveSha256 === "640DB279C949A88F61F851DD54EBBB22D003F8B90B85267042EF85A3781D3A52", "frequency source archive hash is invalid");
  add(errors, frequencySource?.purpose?.includes("not independent translation evidence"), "frequency source must not be presented as translation evidence");
  add(errors, Boolean(frequencySource?.license?.id && frequencySource?.license?.url && frequencySource?.license?.localNotice), "frequency source license provenance is incomplete");

  const serialized = JSON.stringify(expansion);
  add(errors, !/(?:[A-Za-z]:\\\\|\/Users\/|\/home\/|AppData[\\/]|[\\/]Temp[\\/])/u.test(serialized), "expansion queue contains a machine-local absolute path");
  const inventoryPairs = new Set([...activePairs, ...firstPairs, ...expansionPairs]);
  add(errors, inventoryPairs.size === 4000, `combined inventory must expose 4000 distinct pairs, found ${inventoryPairs.size}`);
  if (runtime) {
    const runtimeItems = runtime.items || [];
    const expectedReviewPairs = new Set([...firstPairs, ...expansionPairs]);
    const runtimePairs = runtimeItems.map(item => pairKey(item.zh, item.th));
    add(errors, runtime?.policy?.defaultVisible === false, "review-only runtime pane must be closed by default");
    add(errors, runtime?.policy?.coreActiveCards === 3000 && runtime?.policy?.reviewOnlyCandidates === 1125, "runtime review counts are invalid");
    add(errors, runtime?.policy?.inventoryDistinctPairs === 4000 && runtime?.policy?.nativeApprovedPairs === 0, "runtime inventory/native-review counts are invalid");
    add(errors, runtimeItems.length === 1125, `runtime review layer must contain 1125 rows, found ${runtimeItems.length}`);
    add(errors, new Set(runtimePairs).size === 1125, "runtime review layer contains duplicate pairs");
    add(errors, runtimePairs.every(pair => expectedReviewPairs.has(pair)) && expectedReviewPairs.size === new Set(runtimePairs).size, "runtime review layer does not exactly mirror the two source queues");
    add(errors, runtimeItems.every(item => item.status === "review-only"
      && item.trainingEligible === false && item.quizEligible === false && item.speechEligible === false
      && item.nativeReviewed === false && item.secondSourceConfirmed === false
      && item.pronunciationReady === false && item.examplesReady === false && item.audioReady === false
      && item.py === null && item.ro === null && item.chineseNearSound === null && item.examples === null), "runtime review row has unsafe learning or pronunciation fields");
  }

  return {
    errors,
    stats: {
      activeTrainingCards: active.length,
      activeDistinctPairs: activePairSet.size,
      activeReviewCards: active.length - activePairSet.size,
      activeNativeApproved: active.filter(word => word.contentReviewStatus === "native-approved").length,
      activeNativePending: active.filter(word => word.contentReviewStatus !== "native-approved").length,
      firstPassCandidates: firstCandidates.length,
      expansionReviewOnlyCandidates: expansionCandidates.length,
      runtimeReviewRows: runtime?.items?.length || 0,
      combinedDistinctPairs: inventoryPairs.size,
      candidateTrainingEligible: expansionCandidates.filter(candidate => candidate.trainingEligible).length
    }
  };
}

export function auditVocabInventory(rootDir = PROJECT_ROOT) {
  const root = path.resolve(rootDir);
  const active = loadActiveVocabulary(root);
  const firstPass = JSON.parse(fs.readFileSync(path.join(root, "lexicon-review", "first-pass-125.json"), "utf8"));
  const expansion = JSON.parse(fs.readFileSync(path.join(root, "lexicon-review", "expansion-candidates-1000.json"), "utf8"));
  const runtime = loadRuntimeReview(root);
  return validateVocabInventory({ active, firstPass, expansion, runtime });
}

function main() {
  const report = auditVocabInventory(process.argv[2] || PROJECT_ROOT);
  if (report.errors.length) {
    console.error(`VOCAB INVENTORY GATE: FAIL (${report.errors.length})`);
    for (const error of report.errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }
  const stats = report.stats;
  console.log("VOCAB INVENTORY GATE: PASS");
  console.log(`训练卡 ${stats.activeTrainingCards} · 正式独立词对 ${stats.activeDistinctPairs} · 复现卡 ${stats.activeReviewCards}`);
  console.log(`待审候选 ${stats.firstPassCandidates + stats.expansionReviewOnlyCandidates} · 总独立词对 ${stats.combinedDistinctPairs}`);
  console.log(`母语已审 ${stats.activeNativeApproved} · 正式待审 ${stats.activeNativePending} · 候选误入训练 ${stats.candidateTrainingEligible}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
