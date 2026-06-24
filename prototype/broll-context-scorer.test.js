"use strict";

// Unit tests for the B-roll context scoring engine.
// Run with: `node prototype/broll-context-scorer.test.js`

const path = require("path");
const assert = require("assert");
const { scoreMomentContext, WEAK_THRESHOLD } = require(path.join(__dirname, "broll-context-scorer.js"));

// WEAK_THRESHOLD is exported and numeric.
assert.strictEqual(typeof WEAK_THRESHOLD, "number", "WEAK_THRESHOLD is exported as a number");

// A transcript with specific names, percentages, and version numbers scores strong.
const strongTranscript =
  "Sarah Chen just said our conversion rate jumped 34% after we shipped version 2.0. Acme Analytics showed 10,000 active users in the first week.";
const strongResult = scoreMomentContext(strongTranscript);
assert.strictEqual(
  strongResult.strength,
  "strong",
  `content-rich transcript should score strong (got score=${strongResult.score}, threshold=${WEAK_THRESHOLD})`,
);

// A vague filler sentence with no names or metrics scores weak.
const weakTranscript = "Okay so let's get into the next part of our conversation here.";
const weakResult = scoreMomentContext(weakTranscript);
assert.strictEqual(
  weakResult.strength,
  "weak",
  `generic filler transcript should score weak (got score=${weakResult.score}, threshold=${WEAK_THRESHOLD})`,
);

// Strong scores higher than weak.
assert.ok(strongResult.score > weakResult.score, "strong transcript outscores weak transcript");

// Empty text always produces weak with score 0.
const emptyResult = scoreMomentContext("");
assert.strictEqual(emptyResult.strength, "weak", "empty transcript is always weak");
assert.strictEqual(emptyResult.score, 0, "empty transcript scores 0");

// Missing transcript argument is handled safely.
const undefinedResult = scoreMomentContext(undefined);
assert.strictEqual(undefinedResult.strength, "weak", "undefined transcript is always weak");

// Known speaker names lift the score above a bare pronounless sentence.
const namedResult = scoreMomentContext("Marcus interviewed Dana Brooks about the project.", {
  speakerNames: ["Marcus", "Dana"],
});
assert.ok(namedResult.score > weakResult.score, "speaker name matches lift the score");

console.log(
  `broll-context-scorer: strong=${strongResult.score} weak=${weakResult.score} names=${namedResult.score} threshold=${WEAK_THRESHOLD}`,
);
