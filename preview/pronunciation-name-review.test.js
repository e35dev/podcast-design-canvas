"use strict";

// Behavior test for pronunciation-name-review logic (#583 / #584).
// Validates entry summary, readiness gating, and status labels without DOM.

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(
  path.join(__dirname, "..", "prototype", "pronunciation-name-review.html"),
  "utf8",
);

const match = html.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(match, "prototype contains an inline script block");

// Minimal DOM mock — the script uses var declarations and getElementById at
// top level, so we mock just enough for module.exports to be reachable.
const mockEl = {
  addEventListener: function () {},
  setAttribute: function () {},
  getAttribute: function () { return null; },
  appendChild: function () {},
  get innerHTML() { return ""; },
  set innerHTML(_) {},
  get textContent() { return ""; },
  set textContent(_) {},
  get style() { return {}; },
  get dataset() { return {}; },
  get className() { return ""; },
  set className(_) {},
};
const mockDoc = {
  getElementById: function () { return Object.create(mockEl); },
  querySelector: function () { return null; },
  createElement: function () { return Object.create(mockEl); },
};
const mockMod = { exports: {} };

// The script uses `var` so runs in function scope fine.
const fn = new Function("document", "module", match[1]);
fn(mockDoc, mockMod);

const { episode, INITIAL_ENTRIES, statusLabel, entrySummary, isReadyForPublish } = mockMod.exports;

// 1. Episode context is grounded.
assert.ok(episode.show, "episode has a show name");
assert.ok(episode.host, "episode has a host");
assert.ok(episode.guests.length >= 2, "episode has at least two guests");

// 2. Entries are realistic and non-empty.
assert.ok(INITIAL_ENTRIES.length >= 4, "at least 4 pronunciation entries");
for (const e of INITIAL_ENTRIES) {
  assert.ok(e.term, "entry has a term: " + e.id);
  assert.ok(e.guide, "entry has a guide: " + e.id);
  assert.ok(e.source, "entry has a source: " + e.id);
}

// 3. statusLabel returns human-readable labels.
assert.strictEqual(statusLabel("confirmed"), "Confirmed");
assert.strictEqual(statusLabel("needs-review"), "Needs review");
assert.strictEqual(statusLabel("guest-preferred"), "Guest preferred");
assert.strictEqual(statusLabel("not-spoken"), "Not spoken in episode");

// 4. entrySummary counts correctly.
const summary = entrySummary(INITIAL_ENTRIES);
assert.strictEqual(summary.total, INITIAL_ENTRIES.length);
assert.ok(summary.confirmed >= 1, "at least one confirmed/guest-preferred entry");
assert.ok(summary.needsReview >= 1, "at least one entry needing review");

// 5. isReadyForPublish gates on needs-review spoken entries.
assert.strictEqual(isReadyForPublish(INITIAL_ENTRIES), false, "not ready when spoken entries need review");

// All confirmed: should be ready.
const allConfirmed = INITIAL_ENTRIES.map(function (e) {
  return Object.assign({}, e, { status: "confirmed" });
});
assert.strictEqual(isReadyForPublish(allConfirmed), true, "ready when all are confirmed");

// Not-spoken entries don't block readiness.
const onlyUnspoken = [{ id: "x", term: "X", guide: "x", source: "s", status: "needs-review", spokenInEpisode: false }];
assert.strictEqual(isReadyForPublish(onlyUnspoken), true, "unspoken entries do not block readiness");

console.log("pronunciation-name-review: all behavior tests passed");
