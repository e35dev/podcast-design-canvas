"use strict";

// Integration test for the B-roll review surface + weak-context scoring engine (#757):
// the screen loads the engine, classifies moments with it (not a static stub), and the
// sample includes a weak-context moment with a timestamp that routes with a payload.
// Run with: `node prototype/contextual-broll-moments.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const scorer = require(path.join(__dirname, "broll-context-scorer.js"));

const dir = __dirname;
const html = fs.readFileSync(path.join(dir, "contextual-broll-moments.html"), "utf8");

// The screen loads and uses the scoring engine for weak-context, not the old source stub.
assert.ok(html.includes("broll-context-scorer.js"), "screen loads the scoring engine");
assert.ok(html.includes("BrollContextScorer.scoreMoment"), "screen scores moments with the engine");
assert.ok(html.includes("context.weak"), "weak-context branch is driven by the engine score");

// The sample moments carry timestamps, and at least one is genuinely weak per the engine
// (so the routing-with-payload path is real, not hypothetical).
const sampleBlock = html.match(/const sampleMoments = \[([\s\S]*?)\];/);
assert.ok(sampleBlock, "sample moments are present");
const reasons = [...sampleBlock[1].matchAll(/reason:\s*"([^"]+)"/g)].map((m) => m[1]);
const ats = [...sampleBlock[1].matchAll(/at:\s*"([^"]+)"/g)].map((m) => m[1]);
assert.ok(ats.length >= reasons.length, "every sample moment has a timestamp");

const weakOnes = reasons.filter((reason) => scorer.scoreMoment({ reason }).weak);
assert.ok(weakOnes.length >= 1, `at least one sample moment is weak context (got ${weakOnes.length})`);

// The route to social context intake carries the moment timestamp and reason.
assert.ok(/moment=\$\{encodeURIComponent/.test(html), "weak route carries the moment timestamp");
assert.ok(/reason=\$\{encodeURIComponent/.test(html), "weak route carries the weak-context reason");
assert.ok(
  html.includes('fixScreen: "social-context-intake.html"'),
  "weak context routes to social context intake",
);

console.log(`contextual B-roll moments: engine-driven weak context (${weakOnes.length} weak in sample), routed with payload`);
