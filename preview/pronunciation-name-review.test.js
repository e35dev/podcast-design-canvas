"use strict";

// Guards the pronunciation/name review prototype: suggested spoken names must block
// publish readiness until the creator confirms them or saves the guest preference.
// Run with: `node preview/pronunciation-name-review.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "prototype", "pronunciation-name-review.html"), "utf8");

assert.ok(html.includes("../preview/cleanup-nav.js"), "prototype loads cleanup navigation");
assert.ok(html.includes('data-cleanup-step="pronunciation-name-review"'), "prototype declares its cleanup step");
assert.ok(!/innerHTML/.test(html), "prototype renders dynamic text without innerHTML");

const script = html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/);
assert.ok(script, "prototype exposes one inline model script");
new vm.Script(script[1]);

const sandboxModule = { exports: {} };
vm.runInNewContext(script[1], { module: sandboxModule });

const review = sandboxModule.exports;
const initialSummary = review.entrySummary(review.INITIAL_ENTRIES);
assert.strictEqual(initialSummary.total, 5, "sample set covers five names and terms");
assert.strictEqual(initialSummary.confirmed, 2, "confirmed rollup includes confirmed and guest-preferred entries");
assert.strictEqual(initialSummary.needsReview, 2, "suggested and needs-review spoken entries both need review");
assert.strictEqual(review.isReadyForPublish(review.INITIAL_ENTRIES), false, "initial suggested spoken entry blocks readiness");

const explicitReviewFixed = review.updateEntryStatus(review.INITIAL_ENTRIES, "turborepo", "confirmed");
assert.strictEqual(
  review.isReadyForPublish(explicitReviewFixed),
  false,
  "fixing the explicit needs-review entry does not hide a remaining suggested spoken entry",
);

const allSpokenResolved = review.updateEntryStatus(explicitReviewFixed, "dev-anand", "guest-preferred");
assert.strictEqual(
  review.isReadyForPublish(allSpokenResolved),
  true,
  "publish readiness opens after every spoken suggested or flagged term is resolved",
);

const unspokenEntry = review.INITIAL_ENTRIES.find((entry) => entry.id === "supabase");
assert.strictEqual(review.needsPronunciationReview(unspokenEntry), false, "unspoken reused terms do not block readiness");
assert.strictEqual(review.statusLabel("guest-preferred"), "Guest preferred", "status labels stay creator-facing");

const updatedGuide = review.updateEntryGuide(review.INITIAL_ENTRIES, "dev-anand", " dayv uh-NUND ");
assert.strictEqual(
  updatedGuide.find((entry) => entry.id === "dev-anand").guide,
  "dayv uh-NUND",
  "guide edits are trimmed before rendering",
);

const unchangedGuide = review.updateEntryGuide(review.INITIAL_ENTRIES, "dev-anand", " ");
assert.strictEqual(
  unchangedGuide.find((entry) => entry.id === "dev-anand").guide,
  "DAYV ah-NUND",
  "blank guide edits keep the previous pronunciation",
);

console.log("pronunciation name review: suggested spoken entries block readiness until resolved");
