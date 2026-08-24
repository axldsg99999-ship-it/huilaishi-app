#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, "..");
const OUTPUT_FILE = path.join(PROJECT_ROOT, "lexicon-review", "expansion-candidates-1000.json");
const RUNTIME_FILE = path.join(PROJECT_ROOT, "vocab-review-candidates.js");
const REPLACEMENT_QUEUE = path.join(PROJECT_ROOT, "lexicon-review", "first-pass-125.json");
const TARGET_COUNT = 1000;
const VOCAB_FILES = [
  "vocab-l1-l2.js",
  "vocab-l3-l4.js",
  "vocab-l5-l6.js",
  "vocab-expansion-l1-l3.js",
  "vocab-expansion-l4-l6.js"
];
const OMW_FILES = Object.freeze({
  cmn: {
    name: "wn-data-cmn.tab",
    bytes: 2_547_318,
    sha256: "379FD2E41D3E1395F9F27CF23A39C6181849FFB4020C14A07ED2A4D4DD651122"
  },
  tha: {
    name: "wn-data-tha.tab",
    bytes: 5_089_930,
    sha256: "33445C39F9329130012E8013113023B42C630BBCBB61D49434D86BBDB2C710CF"
  },
  eng: {
    name: "wn-data-eng.tab",
    bytes: 5_843_130,
    sha256: "D1409D88ADDCDB890B1606DD280B558CCA4258B1F33BD580D54ED949DAAD1EDE"
  }
});
const WORDNET_FILES = Object.freeze({
  indexSense: {
    relativePath: "WordNet-3.0/dict/index.sense",
    bytes: 7_294_043,
    sha256: "68B3A468CDDFD8E92134B9B0624339A02A1B837159243C297C5F138A3D618392"
  },
  countList: {
    relativePath: "WordNet-3.0/dict/cntlist.rev",
    bytes: 911_244,
    sha256: "A198580B8F705FA02797BBA8B13E5CBE4A9F9F40CB1697E774C7FC6A5865B035"
  }
});

function normalize(value) {
  return String(value ?? "").normalize("NFC").trim().replace(/\s+/gu, " ");
}

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex").toUpperCase();
}

function readPinnedFile(filename, expected) {
  const buffer = fs.readFileSync(filename);
  if (buffer.byteLength !== expected.bytes || sha256(buffer) !== expected.sha256) {
    throw new Error(`Pinned source verification failed: ${filename}`);
  }
  return buffer.toString("utf8");
}

function parseOwmLemmas(source) {
  const bySynset = new Map();
  for (const line of source.split(/\r?\n/u)) {
    if (!line || line.startsWith("#")) continue;
    const [synset, relation, rawLemma] = line.split("\t");
    if (!synset || !relation?.endsWith("lemma") || !rawLemma) continue;
    const lemma = normalize(rawLemma);
    if (!lemma) continue;
    if (!bySynset.has(synset)) bySynset.set(synset, []);
    const lemmas = bySynset.get(synset);
    if (!lemmas.includes(lemma)) lemmas.push(lemma);
  }
  return bySynset;
}

function loadActiveVocabulary() {
  const world = {};
  world.window = world;
  world.globalThis = world;
  const sandbox = vm.createContext(world);
  for (const filename of VOCAB_FILES) {
    const source = fs.readFileSync(path.join(PROJECT_ROOT, filename), "utf8");
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

function buildSynsetFrequency(indexSenseSource, countListSource) {
  const offsetBySenseKey = new Map();
  for (const line of indexSenseSource.split(/\r?\n/u)) {
    const [senseKey, offset] = line.trim().split(/\s+/u);
    if (senseKey && /^\d{8}$/u.test(offset || "")) offsetBySenseKey.set(senseKey, offset);
  }
  const posBySenseType = { 1: "n", 2: "v", 3: "a", 4: "r", 5: "a" };
  const frequency = new Map();
  for (const line of countListSource.split(/\r?\n/u)) {
    const [senseKey, , rawCount] = line.trim().split(/\s+/u);
    const offset = offsetBySenseKey.get(senseKey);
    const senseType = senseKey?.split("%")[1]?.charAt(0);
    const pos = posBySenseType[senseType];
    const count = Number(rawCount || 0);
    if (!offset || !pos || !Number.isInteger(count) || count <= 0) continue;
    const synset = `${offset}-${pos}`;
    frequency.set(synset, (frequency.get(synset) || 0) + count);
  }
  return frequency;
}

function chooseEnglishLemma(lemmas) {
  return [...lemmas]
    .filter(lemma => /^[A-Za-z][A-Za-z -]{0,30}$/u.test(lemma))
    .sort((left, right) => {
      const leftWords = left.split(/[ -]/u).length;
      const rightWords = right.split(/[ -]/u).length;
      return leftWords - rightWords || left.length - right.length || left.localeCompare(right, "en");
    })[0] || null;
}

function collectCandidates({ cmn, tha, eng, frequency, blockedZh, blockedTh, blockedPairs }) {
  const eligible = [];
  for (const [synset, chineseLemmas] of cmn) {
    const thaiLemmas = tha.get(synset);
    const englishLemmas = eng.get(synset);
    if (!thaiLemmas || !englishLemmas) continue;
    // Multiple Chinese/Thai lemmas widen the semantic boundary. They remain outside
    // this machine-screened batch and can only be selected by a human editor.
    if (chineseLemmas.length !== 1 || thaiLemmas.length !== 1) continue;
    const zh = chineseLemmas[0];
    const th = thaiLemmas[0];
    const pair = `${zh}\u0000${th}`;
    const englishSense = chooseEnglishLemma(englishLemmas);
    const tagCount = frequency.get(synset) || 0;
    if (!/^\p{Script=Han}{1,6}$/u.test(zh)) continue;
    if (!/^[\p{Script=Thai} ]{1,28}$/u.test(th)) continue;
    if (!englishSense || tagCount <= 0) continue;
    if (blockedZh.has(zh) || blockedTh.has(th) || blockedPairs.has(pair)) continue;
    eligible.push({ synset, pos: synset.slice(-1), zh, th, englishSense, englishLemmas, tagCount });
  }
  eligible.sort((left, right) => right.tagCount - left.tagCount || left.synset.localeCompare(right.synset, "en"));

  const selected = [];
  const seenZh = new Set();
  const seenTh = new Set();
  for (const item of eligible) {
    if (seenZh.has(item.zh) || seenTh.has(item.th)) continue;
    seenZh.add(item.zh);
    seenTh.add(item.th);
    selected.push(item);
    if (selected.length === TARGET_COUNT) break;
  }
  if (selected.length !== TARGET_COUNT) {
    throw new Error(`Only ${selected.length}/${TARGET_COUNT} candidates met the deterministic review-only screen.`);
  }
  return selected;
}

function sourceCatalog(firstPassQueue) {
  return [
    ...firstPassQueue.sourceCatalog,
    {
      id: "pwn30-semcor-counts",
      label: "Princeton WordNet 3.0 SemCor tag counts",
      version: "3.0",
      purpose: "deterministic candidate ordering only; not independent translation evidence",
      archiveUrl: "https://wordnetcode.princeton.edu/3.0/WordNet-3.0.tar.gz",
      archiveBytes: 11_537_239,
      archiveSha256: "640DB279C949A88F61F851DD54EBBB22D003F8B90B85267042EF85A3781D3A52",
      files: [
        { name: "dict/index.sense", bytes: WORDNET_FILES.indexSense.bytes, sha256: WORDNET_FILES.indexSense.sha256 },
        { name: "dict/cntlist.rev", bytes: WORDNET_FILES.countList.bytes, sha256: WORDNET_FILES.countList.sha256 }
      ],
      license: {
        id: "princeton-wordnet-3.0",
        url: "https://wordnet.princeton.edu/license-and-commercial-use",
        localNotice: "vendor/licenses/princeton-wordnet-3.0.txt"
      }
    }
  ];
}

function buildOutput(selected, firstPassQueue) {
  const candidates = selected.map((item, index) => ({
    id: `omw-review-${String(index + 1).padStart(4, "0")}`,
    zh: item.zh,
    th: item.th,
    englishSense: item.englishSense,
    englishLemmas: item.englishLemmas,
    synset: item.synset,
    pos: item.pos,
    frequencyTagCount: item.tagCount,
    py: null,
    ro: null,
    chineseNearSound: null,
    examples: null,
    status: "machine-screened-review-candidate",
    trainingEligible: false,
    quizEligible: false,
    speechEligible: false,
    secondSourceConfirmed: false,
    nativeReviewed: false,
    pronunciationReady: false,
    examplesReady: false,
    audioReady: false,
    exactHeadScreenedAgainstActiveCorpus: true,
    semanticReviewStatus: "pending-human-review",
    safetyReviewStatus: "pending-human-review",
    evidence: {
      relation: "same-pwn30-synset",
      sourceIds: ["omw-cmn", "omw-tha", "omw-eng"],
      rankingSourceId: "pwn30-semcor-counts"
    },
    riskFlags: [
      "omw-synset-alignment-only",
      "no-independent-second-source",
      "no-native-review",
      "no-pronunciation-or-examples"
    ]
  }));
  const byPos = Object.fromEntries(["n", "v", "a", "r"].map(pos => [pos, candidates.filter(item => item.pos === pos).length]));
  return {
    schemaVersion: "1.0.0",
    generatedDate: "2026-08-24",
    title: "会来事 1000 条词库扩容候选（只读审核层）",
    decision: "review-only-do-not-train",
    disclaimer: "这些中泰词对只由 OMW 2.0 的同一 PWN 3.0 synset 自动对齐，并按 Princeton WordNet 的 SemCor 标注频次排序。它们不是已确认译文，不含拼音、泰语转写、中文近音、例句或音频，禁止进入课程、测验、跟读和语音评分。",
    inventoryPolicy: {
      activeTrainingCards: 3000,
      activeDistinctPairs: 2875,
      manuallyScreenedReplacementCandidates: 125,
      machineScreenedExpansionCandidates: TARGET_COUNT,
      totalDistinctPairsIncludingReviewOnly: 4000,
      nativeApprovedPairs: 0,
      rule: "review-only candidates never count as trainable or native-approved"
    },
    generationPolicy: {
      generator: "scripts/build-vocab-expansion-candidates.mjs",
      exactUnicodeNormalization: "NFC + trim + collapsed whitespace",
      requiresSingleChineseLemma: true,
      requiresSingleThaiLemma: true,
      requiresPositiveSemCorTagCount: true,
      excludesExistingChineseHeads: true,
      excludesExistingThaiHeads: true,
      excludesExistingPairs: true,
      excludesFirstPass125: true,
      independentSecondSourceUsed: false,
      nativeReviewPerformed: false
    },
    counts: {
      total: candidates.length,
      byPos,
      secondSourceConfirmed: 0,
      nativeReviewed: 0,
      trainingEligible: 0,
      pronunciationReady: 0,
      examplesReady: 0,
      audioReady: 0
    },
    sourceCatalog: sourceCatalog(firstPassQueue),
    candidates
  };
}

function buildRuntimeSource(firstPassQueue, output) {
  const firstPassRows = (firstPassQueue.candidates || []).map((row, index) => [
    `review-first-${String(index + 1).padStart(4, "0")}`,
    row.candidate.zh,
    row.candidate.th,
    row.candidate.englishSense,
    row.candidate.synset,
    row.candidate.pos,
    "first-pass-human-screened"
  ]);
  const expansionRows = output.candidates.map(candidate => [
    candidate.id,
    candidate.zh,
    candidate.th,
    candidate.englishSense,
    candidate.synset,
    candidate.pos,
    "machine-screened"
  ]);
  const rows = JSON.stringify([...firstPassRows, ...expansionRows]);
  return `/* Generated by scripts/build-vocab-expansion-candidates.mjs.
 * Review-only inventory: never import these rows into lessons, quizzes, speech or scoring.
 */
(function () {
  "use strict";
  const rows = ${rows};
  const items = rows.map(([id, zh, th, englishSense, synset, pos, reviewTier]) => Object.freeze({
    id, zh, th, englishSense, synset, pos, reviewTier,
    py: null, ro: null, chineseNearSound: null, examples: null,
    status: "review-only", trainingEligible: false, quizEligible: false, speechEligible: false,
    secondSourceConfirmed: false, nativeReviewed: false, pronunciationReady: false,
    examplesReady: false, audioReady: false
  }));
  window.HUILAISHI_VOCAB_REVIEW = Object.freeze({
    policy: Object.freeze({
      coreActiveCards: 3000, coreActiveDistinctPairs: 2875, reviewOnlyCandidates: 1125,
      inventoryDistinctPairs: 4000, nativeApprovedPairs: 0, defaultVisible: false,
      trainingEligible: false, quizEligible: false, speechEligible: false
    }),
    items: Object.freeze(items)
  });
})();
`;
}

function main() {
  const sourceRoot = process.argv[2] ? path.resolve(process.cwd(), process.argv[2]) : null;
  if (!sourceRoot) {
    throw new Error("Usage: node scripts/build-vocab-expansion-candidates.mjs <pinned-source-directory>");
  }
  const firstPassQueue = JSON.parse(fs.readFileSync(REPLACEMENT_QUEUE, "utf8"));
  const active = loadActiveVocabulary();
  const blockedZh = new Set(active.map(word => normalize(word.zh)));
  const blockedTh = new Set(active.map(word => normalize(word.th)));
  const blockedPairs = new Set(active.map(word => `${normalize(word.zh)}\u0000${normalize(word.th)}`));
  for (const row of firstPassQueue.candidates || []) {
    const zh = normalize(row?.candidate?.zh);
    const th = normalize(row?.candidate?.th);
    blockedZh.add(zh);
    blockedTh.add(th);
    blockedPairs.add(`${zh}\u0000${th}`);
  }
  const cmn = parseOwmLemmas(readPinnedFile(path.join(sourceRoot, OMW_FILES.cmn.name), OMW_FILES.cmn));
  const tha = parseOwmLemmas(readPinnedFile(path.join(sourceRoot, OMW_FILES.tha.name), OMW_FILES.tha));
  const eng = parseOwmLemmas(readPinnedFile(path.join(sourceRoot, OMW_FILES.eng.name), OMW_FILES.eng));
  const indexSense = readPinnedFile(path.join(sourceRoot, WORDNET_FILES.indexSense.relativePath), WORDNET_FILES.indexSense);
  const countList = readPinnedFile(path.join(sourceRoot, WORDNET_FILES.countList.relativePath), WORDNET_FILES.countList);
  const frequency = buildSynsetFrequency(indexSense, countList);
  const selected = collectCandidates({ cmn, tha, eng, frequency, blockedZh, blockedTh, blockedPairs });
  const output = buildOutput(selected, firstPassQueue);
  fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  fs.writeFileSync(RUNTIME_FILE, buildRuntimeSource(firstPassQueue, output), "utf8");
  console.log(`Generated ${output.counts.total} review-only candidates: ${OUTPUT_FILE}`);
  console.log(`Generated ${firstPassQueue.candidates.length + output.candidates.length} runtime review rows: ${RUNTIME_FILE}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
