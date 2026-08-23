import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { validateLexiconReview } from "../scripts/validate-lexicon-review.mjs";

const queue = JSON.parse(readFileSync(new URL("../lexicon-review/first-pass-125.json", import.meta.url), "utf8"));

test("the 125 replacement candidates pass the review-only provenance gate", () => {
  assert.deepEqual(validateLexiconReview(queue), []);
});

test("the review gate rejects any candidate presented as import-ready", () => {
  const unsafe = structuredClone(queue);
  unsafe.candidates[0].importEligible = true;
  assert.ok(validateLexiconReview(unsafe).some(error => error.includes("import flag must remain false")));
});
