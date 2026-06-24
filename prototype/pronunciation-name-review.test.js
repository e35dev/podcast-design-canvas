"use strict";

// Behavior test for pronunciation-name-review logic (#583 / #584).
// Validates readiness math so suggested spoken names cannot be treated as ready.

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(
  path.join(__dirname, "pronunciation-name-review.html"),
  "utf8",
);

const match = html.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(match, "prototype contains an inline script block");

const mockEl = {
  dataset: {},
  addEventListener: function () {},
  replaceChildren: function () {},
  append: function () {},
  appendChild: function () {},
  get textContent() { return ""; },
  set textContent(_) {},
  get className() { return ""; },
  set className(_) {},
};
const mockDoc = {
  getElementById: function () { return Object.create(mockEl); },
  createElement: function () { return Object.create(mockEl); },
};
const mockMod = { exports: {} };

const fn = new Function("document", "module", match[1]);
fn(mockDoc, mockMod);

const { INITIAL_ENTRIES, statusLabel, entrySummary, isReadyForPublish } = mockMod.exports;

assert.strictEqual(statusLabel("confirmed"), "Confirmed");
assert.strictEqual(statusLabel("suggested"), "Suggested");
assert.strictEqual(statusLabel("needs-review"), "Needs review");
assert.strictEqual(statusLabel("guest-preferred"), "Guest preferred");
assert.strictEqual(statusLabel("not-spoken"), "Not spoken in episode");

const summary = entrySummary(INITIAL_ENTRIES);
assert.strictEqual(summary.total, INITIAL_ENTRIES.length);
assert.strictEqual(summary.needsReview, 2, "suggested and needs-review spoken names both count as review work");
assert.strictEqual(summary.notSpoken, 1, "text-only term stays informational");

assert.strictEqual(
  isReadyForPublish(INITIAL_ENTRIES),
  false,
  "publish is not ready while suggested or needs-review spoken names remain",
);

const resolved = INITIAL_ENTRIES.map((entry) => (
  entry.spoken ? Object.assign({}, entry, { status: "confirmed" }) : entry
));
assert.strictEqual(isReadyForPublish(resolved), true, "confirmed spoken names clear readiness");

const preferred = INITIAL_ENTRIES.map((entry) => (
  entry.spoken ? Object.assign({}, entry, { status: "guest-preferred" }) : entry
));
assert.strictEqual(isReadyForPublish(preferred), true, "guest-preferred spoken names clear readiness");

console.log("pronunciation-name-review: readiness logic treats suggested spoken names consistently");
