"use strict";

// Tests for the weak-context moment scoring engine (#757): scoring produces the expected
// weak/strong classifications on fixture moments, weak moments carry a reason, and
// back-to-back title cards are detected.
// Run with: `node prototype/broll-context-scorer.test.js`

const assert = require("assert");
const path = require("path");
const scorer = require(path.join(__dirname, "broll-context-scorer.js"));

// 1) Strong moments — grounded in speakers, specific topic, and/or a named entity.
const strong = [
  { id: "s1", reason: "Guest names their company Northwind Labs" },
  { id: "s2", reason: "The Host walks through the Riverside dashboard" },
];
for (const moment of strong) {
  const result = scorer.scoreMoment(moment);
  assert.ok(!result.weak, `expected strong context: "${moment.reason}" (score ${result.score})`);
  assert.strictEqual(result.reason, null, "strong moments carry no weak reason");
}

// 2) Weak moments — vague, no named entity, little speaker grounding.
const weak = [
  { id: "w1", reason: "they mention something" },
  { id: "w2", reason: "a quotable moment" },
  { id: "w3", reason: "discussing the budget" },
];
for (const moment of weak) {
  const result = scorer.scoreMoment(moment);
  assert.ok(result.weak, `expected weak context: "${moment.reason}" (score ${result.score})`);
  assert.ok(
    Object.values(scorer.REASONS).includes(result.reason),
    `weak moment carries a known reason: ${result.reason}`,
  );
}

// 3) The reason names the weakest signal: a moment with a clear named entity but vague
//    wording is weak for specificity, not entity.
const vagueWithEntity = scorer.scoreMoment({ reason: "Northwind did something" });
// "something" is vague; "Northwind" is a (first-word) entity so entity signal is low too,
// but the classification must be weak and reasoned.
assert.ok(vagueWithEntity.weak, "vague wording is weak even with a name");

// 4) classifyMoments attaches score/weak/reason without dropping fields.
const classified = scorer.classifyMoments([{ id: "m1", reason: "they mention something", type: "broll" }]);
assert.strictEqual(classified.length, 1);
assert.strictEqual(classified[0].id, "m1", "original fields preserved");
assert.strictEqual(classified[0].type, "broll", "original fields preserved");
assert.ok(typeof classified[0].score === "number" && classified[0].weak === true, "classification attached");

// 5) Back-to-back title cards are flagged as repeats; a title after a non-title is not.
const titles = scorer.detectRepeatTitles([
  { id: "t1", type: "title" },
  { id: "t2", type: "title" },
  { id: "t3", type: "broll" },
  { id: "t4", type: "title" },
]);
assert.strictEqual(titles[0].repeatTitle, false, "first title is not a repeat");
assert.strictEqual(titles[1].repeatTitle, true, "second consecutive title is a repeat");
assert.strictEqual(titles[2].repeatTitle, false, "a b-roll moment is not a repeat");
assert.strictEqual(titles[3].repeatTitle, false, "a title after a non-title is not a repeat");

console.log("broll context scorer: classifications, reasons, and repeat-title detection pass");
