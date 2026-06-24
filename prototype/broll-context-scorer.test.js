"use strict";

// Unit tests for the weak-context moment scoring engine (#757).
// Run with: `node prototype/broll-context-scorer.test.js` (Node built-ins only).
//
// The scorer is a real module, so we require() it directly rather than extracting an
// inline <script> from the page. Assertions cover: scoring classifications on fixture
// transcripts, back-to-back title repeat detection, and the intake routing payload.

const assert = require("assert");
const scorer = require("./broll-context-scorer.js");

// --- 1. Scoring classifies fixture transcripts as expected -------------------------

// Concrete moment: multiple named entities + specific topic terms -> strong.
const strong = scorer.scoreMoment({
  at: "00:12:40",
  transcript: "Marcus walked through the Helio API launch they shipped at re:Invent last March.",
});
assert.strictEqual(strong.confidence, "strong", "named brands + specific topic read as strong context");
assert.strictEqual(strong.isWeak, false, "strong moment is not weak");
assert.strictEqual(strong.reason, null, "strong moment has no weak reason");

// Vague filler: no entities, mostly stopwords -> weak.
const weak = scorer.scoreMoment({
  at: "00:03:10",
  transcript: "yeah so anyway um that thing we were kind of talking about earlier you know",
});
assert.strictEqual(weak.confidence, "weak", "filler line reads as weak context");
assert.strictEqual(weak.isWeak, true, "weak moment flagged");
assert.ok(typeof weak.reason === "string" && weak.reason.length > 0, "weak moment carries a human reason label");

// Empty transcript is the weakest possible -> weak with score 0.
const empty = scorer.scoreMoment({ transcript: "" });
assert.strictEqual(empty.score, 0, "empty transcript scores 0");
assert.strictEqual(empty.confidence, "weak");

// Score is bounded and monotonic-ish: strong outscores weak.
assert.ok(strong.score > weak.score, "stronger context scores higher");
assert.ok(strong.score <= 1 && weak.score >= 0, "scores stay within 0..1");

// Reference signal lifts a moderate moment when an approved speaker is named.
const withRef = scorer.scoreMoment(
  { transcript: "Priya explained the metagraph weights in detail during the segment." },
  { references: ["Priya", "Marcus"] },
);
const withoutRef = scorer.scoreMoment({
  transcript: "Priya explained the metagraph weights in detail during the segment.",
});
assert.ok("referenceDensity" in withRef.signals, "reference signal present when references supplied");
assert.ok(!("referenceDensity" in withoutRef.signals), "reference signal omitted when no references supplied");
assert.ok(withRef.score >= withoutRef.score, "an approved-speaker reference does not lower the score");

// classifyConfidence respects the documented thresholds.
assert.strictEqual(scorer.classifyConfidence(0.9), "strong");
assert.strictEqual(scorer.classifyConfidence(0.5), "medium");
assert.strictEqual(scorer.classifyConfidence(0.1), "weak");
assert.strictEqual(scorer.classifyConfidence(scorer.STRONG_THRESHOLD), "strong");
assert.strictEqual(scorer.classifyConfidence(scorer.WEAK_THRESHOLD), "medium");

// --- 2. Back-to-back title repeat detection ----------------------------------------

const repeats = scorer.detectTitleRepeats([
  { id: "a", type: "title" },
  { id: "b", type: "title" },
  { id: "c", type: "broll" },
  { id: "d", type: "title" },
]);
assert.deepStrictEqual(repeats, [false, true, false, false], "only the second of two adjacent title cards is a repeat");

assert.deepStrictEqual(
  scorer.detectTitleRepeats([{ id: "x", type: "title" }]),
  [false],
  "a lone title card is never a repeat",
);
assert.deepStrictEqual(scorer.detectTitleRepeats([]), [], "no moments -> no repeats");

// --- 3. Routing payload to social context intake -----------------------------------

const payload = scorer.buildIntakePayload(
  { id: "m3", at: "00:03:10", reason: "Guest names their company" },
  { reason: "no clear names or brands, no specific topic" },
);
assert.strictEqual(payload.at, "00:03:10", "payload carries the moment timestamp");
assert.strictEqual(payload.reason, "no clear names or brands, no specific topic", "payload carries the scored reason");
assert.strictEqual(payload.moment, "m3", "payload carries the moment id");

const query = scorer.encodeIntakeQuery(payload);
assert.ok(query.includes("from=broll"), "query marks the source screen");
assert.ok(query.includes("at=00%3A03%3A10"), "query escapes the timestamp");
assert.ok(/reason=/.test(query), "query carries the reason");

// Round-trips through parse so the intake screen recovers the same fields.
const parsed = scorer.parseIntakeQuery("?" + query);
assert.strictEqual(parsed.at, "00:03:10", "parsed timestamp matches");
assert.strictEqual(parsed.reason, payload.reason, "parsed reason matches");
assert.strictEqual(parsed.moment, "m3", "parsed moment id matches");
assert.strictEqual(parsed.from, "broll", "parsed source marker matches");

console.log("broll-context-scorer: scoring, title-repeat detection, and intake payload all pass");
