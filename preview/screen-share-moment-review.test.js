"use strict";

// Behavior test for screen-share-moment-review logic (#583 / #584).
// Validates moment summary, export readiness gating, and status labels without DOM.

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(
  path.join(__dirname, "..", "prototype", "screen-share-moment-review.html"),
  "utf8",
);

const match = html.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(match, "prototype contains an inline script block");

const mockEl = {
  addEventListener: function () {},
  setAttribute: function () {},
  getAttribute: function () { return null; },
  appendChild: function () {},
  get innerHTML() { return ""; },
  set innerHTML(_) {},
  get textContent() { return ""; },
  set textContent(_) {},
  get style() { return { cssText: "" }; },
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

const fn = new Function("document", "module", match[1]);
fn(mockDoc, mockMod);

const { episode, LAYOUTS, INITIAL_MOMENTS, statusLabel, momentSummary, isReadyForExport } = mockMod.exports;

// 1. Episode context is grounded.
assert.ok(episode.show, "episode has a show name");
assert.ok(episode.host, "episode has a host");
assert.ok(episode.guests.length >= 2, "episode has at least two guests");

// 2. Layouts are defined.
assert.strictEqual(LAYOUTS.length, 3, "three layout choices");
assert.ok(LAYOUTS.find(function (l) { return l.id === "featured"; }), "featured layout exists");
assert.ok(LAYOUTS.find(function (l) { return l.id === "side-by-side"; }), "side-by-side layout exists");
assert.ok(LAYOUTS.find(function (l) { return l.id === "speaker-only"; }), "speaker-only layout exists");

// 3. Moments are realistic.
assert.ok(INITIAL_MOMENTS.length >= 4, "at least 4 screen share moments");
for (var i = 0; i < INITIAL_MOMENTS.length; i++) {
  var m = INITIAL_MOMENTS[i];
  assert.ok(m.time, "moment has a time: " + m.id);
  assert.ok(m.description, "moment has a description: " + m.id);
  assert.ok(m.speaker, "moment has a speaker: " + m.id);
  assert.ok(m.layout, "moment has a layout: " + m.id);
}

// 4. statusLabel returns human-readable labels.
assert.strictEqual(statusLabel("ready"), "Ready");
assert.strictEqual(statusLabel("needs-focus"), "Needs focus");
assert.strictEqual(statusLabel("unreadable"), "Screen unreadable");
assert.strictEqual(statusLabel("hidden"), "Private frame hidden");
assert.strictEqual(statusLabel("skipped"), "Skipped");

// 5. momentSummary counts correctly.
var summary = momentSummary(INITIAL_MOMENTS);
assert.strictEqual(summary.total, INITIAL_MOMENTS.length);
assert.ok(summary.ready >= 1, "at least one resolved moment");
assert.ok(summary.issues >= 1, "at least one issue moment");

// 6. isReadyForExport gates on unreadable moments.
assert.strictEqual(isReadyForExport(INITIAL_MOMENTS), false, "not ready when unreadable moments exist");

var allReady = INITIAL_MOMENTS.map(function (m) {
  return Object.assign({}, m, { status: "ready" });
});
assert.strictEqual(isReadyForExport(allReady), true, "ready when all moments are resolved");

// Hidden/skipped don't block.
var hiddenOnly = [{ id: "x", status: "hidden" }, { id: "y", status: "skipped" }];
assert.strictEqual(isReadyForExport(hiddenOnly), true, "hidden and skipped moments do not block export");

console.log("screen-share-moment-review: all behavior tests passed");
