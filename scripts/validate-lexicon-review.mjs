#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, "..");
const DEFAULT_QUEUE = path.join(PROJECT_ROOT, "lexicon-review", "first-pass-125.json");
const VOCAB_FILES = [
  "vocab-l1-l2.js",
  "vocab-l3-l4.js",
  "vocab-l5-l6.js",
  "vocab-expansion-l1-l3.js",
  "vocab-expansion-l4-l6.js"
];
const REQUIRED_SOURCES = ["omw-cmn", "omw-tha", "omw-eng"];

function normalize(value) {
  return String(value ?? "").normalize("NFC").trim().replace(/\s+/gu, " ");
}

function loadVocabulary(rootDir = PROJECT_ROOT) {
  const world = {};
  world.window = world;
  world.globalThis = world;
  const sandbox = vm.createContext(world);
  for (const filename of VOCAB_FILES) {
    vm.runInContext(fs.readFileSync(path.join(rootDir, filename), "utf8"), sandbox, { filename });
  }
  return [
    ...(sandbox.HUILAISHI_VOCAB_L12 || []),
    ...(sandbox.HUILAISHI_VOCAB_L34 || []),
    ...(sandbox.HUILAISHI_VOCAB_L56 || []),
    ...(sandbox.HUILAISHI_VOCAB_EXPANSION_L13 || []),
    ...(sandbox.HUILAISHI_VOCAB_EXPANSION_L46 || [])
  ];
}

function duplicateReplacementIds(words) {
  const groups = new Map();
  for (const word of words) {
    const key = `${normalize(word.zh)}\u0000${normalize(word.th)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(word);
  }
  return new Set([...groups.values()].filter(group => group.length > 1).flatMap(group => group.slice(1).map(word => word.id)));
}

function add(errors, condition, message) {
  if (!condition) errors.push(message);
}

export function validateLexiconReview(queue, words = loadVocabulary()) {
  const errors = [];
  const candidates = Array.isArray(queue?.candidates) ? queue.candidates : [];
  const currentIds = new Map(words.map(word => [word.id, word]));
  const currentZh = new Set(words.map(word => normalize(word.zh)));
  const currentTh = new Set(words.map(word => normalize(word.th)));
  const currentPairs = new Set(words.map(word => `${normalize(word.zh)}\u0000${normalize(word.th)}`));
  const expectedReplacementIds = duplicateReplacementIds(words);
  const seenReplacementIds = new Set();
  const seenZh = new Set();
  const seenTh = new Set();
  const seenPairs = new Set();
  const seenSynsets = new Set();

  add(errors, queue?.decision === "review-only-do-not-import", "queue decision must block import");
  add(errors, queue?.reviewPolicy?.secondSourceConfirmed === false, "top-level second-source flag must be false");
  add(errors, queue?.reviewPolicy?.nativeReviewed === false, "top-level native-review flag must be false");
  add(errors, queue?.reviewPolicy?.importEligible === false, "top-level import flag must be false");
  add(errors, queue?.reviewPolicy?.romanizationGenerated === false, "romanization must remain ungenerated");
  add(errors, queue?.reviewPolicy?.chineseNearSoundGenerated === false, "Chinese near-sound must remain ungenerated");
  add(errors, candidates.length === 125, `expected 125 candidates, found ${candidates.length}`);
  add(errors, queue?.counts?.total === 125, "reported total must be 125");
  add(errors, queue?.counts?.secondSourceConfirmed === 0, "reported second-source count must be zero");
  add(errors, queue?.counts?.nativeReviewed === 0, "reported native-review count must be zero");
  add(errors, queue?.counts?.importEligible === 0, "reported import-eligible count must be zero");
  add(errors, Array.isArray(queue?.validation?.errors) && queue.validation.errors.length === 0, "embedded validation must contain zero errors");

  const serialized = JSON.stringify(queue);
  add(errors, !/(?:[A-Za-z]:\\\\|\/Users\/|\/home\/|AppData[\\/]|[\\/]Temp[\\/])/u.test(serialized), "queue must not contain machine-local absolute paths");

  const catalog = new Map((queue?.sourceCatalog || []).map(source => [source.id, source]));
  for (const sourceId of REQUIRED_SOURCES) {
    const source = catalog.get(sourceId);
    add(errors, Boolean(source), `sourceCatalog is missing ${sourceId}`);
    if (!source) continue;
    add(errors, source.version === "2.0", `${sourceId} must be pinned to version 2.0`);
    add(errors, /^https:\/\/raw\.githubusercontent\.com\/omwn\/omw-data\/v2\.0\//u.test(source.url || ""), `${sourceId} URL must be pinned to OMW v2.0`);
    add(errors, /^[A-F0-9]{64}$/u.test(source.sha256 || ""), `${sourceId} must include a SHA-256`);
    add(errors, Boolean(source.license?.id && source.license?.url && source.license?.localNotice), `${sourceId} must include license provenance`);
  }

  for (const [index, row] of candidates.entries()) {
    const label = `candidate ${index + 1}`;
    const original = row?.originalDuplicateCard || {};
    const candidate = row?.candidate || {};
    const originalWord = currentIds.get(original.id);
    const duplicateOf = currentIds.get(original.duplicateOf);
    const zh = normalize(candidate.zh);
    const th = normalize(candidate.th);
    const pair = `${zh}\u0000${th}`;
    const synset = normalize(candidate.synset);

    add(errors, Boolean(originalWord), `${label}: replacement card id is absent from current corpus`);
    add(errors, expectedReplacementIds.has(original.id), `${label}: ${original.id} is not one of the 125 repeat cards`);
    add(errors, Boolean(duplicateOf), `${label}: duplicateOf id is absent from current corpus`);
    if (originalWord && duplicateOf) {
      add(errors, normalize(originalWord.zh) === normalize(duplicateOf.zh) && normalize(originalWord.th) === normalize(duplicateOf.th), `${label}: duplicate mapping does not identify the same current pair`);
      add(errors, original.level === originalWord.level, `${label}: original level does not match the current card`);
    }
    add(errors, Boolean(zh && th && synset && candidate.pos), `${label}: candidate headword, synset or POS is missing`);
    add(errors, !currentZh.has(zh), `${label}: Chinese headword already exists in current corpus (${zh})`);
    add(errors, !currentTh.has(th), `${label}: Thai headword already exists in current corpus (${th})`);
    add(errors, !currentPairs.has(pair), `${label}: bilingual pair already exists in current corpus`);
    add(errors, !seenReplacementIds.has(original.id), `${label}: replacement card id is repeated`);
    add(errors, !seenZh.has(zh), `${label}: Chinese headword is repeated in the queue (${zh})`);
    add(errors, !seenTh.has(th), `${label}: Thai headword is repeated in the queue (${th})`);
    add(errors, !seenPairs.has(pair), `${label}: bilingual pair is repeated in the queue`);
    add(errors, !seenSynsets.has(synset), `${label}: synset is repeated in the queue (${synset})`);
    seenReplacementIds.add(original.id);
    seenZh.add(zh);
    seenTh.add(th);
    seenPairs.add(pair);
    seenSynsets.add(synset);

    add(errors, row.evidenceLevel === "single-source-risk", `${label}: evidence level must remain single-source-risk`);
    add(errors, row.secondSourceConfirmed === false, `${label}: second-source flag must remain false`);
    add(errors, row.nativeReviewed === false, `${label}: native-review flag must remain false`);
    add(errors, row.importEligible === false, `${label}: import flag must remain false`);
    add(errors, row.status === "native-review-candidate", `${label}: review status is invalid`);
    add(errors, candidate.romanization == null && candidate.chineseNearSound == null, `${label}: unreviewed pronunciation fields must remain null`);

    const records = new Map((row.sourceRecords || []).map(record => [record.sourceId, record]));
    add(errors, records.size === 3, `${label}: expected exactly three OMW source records`);
    for (const sourceId of REQUIRED_SOURCES) {
      const record = records.get(sourceId);
      add(errors, Boolean(record), `${label}: source record ${sourceId} is missing`);
      if (!record) continue;
      add(errors, record.version === "2.0", `${label}: ${sourceId} version is not 2.0`);
      add(errors, record.sameSynset === synset && record.pos === candidate.pos, `${label}: ${sourceId} synset/POS does not match the candidate`);
      add(errors, record.relation === "same-pwn30-synset", `${label}: ${sourceId} relation is not explicit`);
      add(errors, /^[A-F0-9]{64}$/u.test(record.fileSha256 || ""), `${label}: ${sourceId} file hash is missing`);
      add(errors, Boolean(record.url && record.licenseId && record.licenseUrl), `${label}: ${sourceId} provenance is incomplete`);
    }
    add(errors, records.get("omw-cmn")?.selectedLemma === zh, `${label}: selected Chinese lemma is not evidenced`);
    add(errors, records.get("omw-tha")?.selectedLemma === th, `${label}: selected Thai lemma is not evidenced`);
  }

  add(errors, seenReplacementIds.size === expectedReplacementIds.size && [...expectedReplacementIds].every(id => seenReplacementIds.has(id)), "queue does not map all and only the 125 repeat-card ids");
  return errors;
}

function runCli() {
  const requested = process.argv[2] ? path.resolve(process.cwd(), process.argv[2]) : DEFAULT_QUEUE;
  if (!fs.existsSync(requested)) {
    console.error(`LEXICON REVIEW GATE: FAIL\nMissing queue: ${requested}`);
    process.exitCode = 1;
    return;
  }
  let queue;
  try { queue = JSON.parse(fs.readFileSync(requested, "utf8")); }
  catch (error) {
    console.error(`LEXICON REVIEW GATE: FAIL\nInvalid JSON: ${error.message}`);
    process.exitCode = 1;
    return;
  }
  const errors = validateLexiconReview(queue);
  if (errors.length) {
    console.error(`LEXICON REVIEW GATE: FAIL (${errors.length})`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }
  console.log(`LEXICON REVIEW GATE: PASS\n候选 ${queue.candidates.length} · 第二来源 0 · 母语终审 0 · 可导入 0`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) runCli();
