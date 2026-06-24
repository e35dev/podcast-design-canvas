"use strict";

// Behavior test for episode-metadata-publishing logic (#583 / #584).
// Validates field status, readiness checks, and destination-based field gating.

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(
  path.join(__dirname, "..", "prototype", "episode-metadata-publishing.html"),
  "utf8",
);

const match = html.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(match, "prototype contains an inline script block");

const mockEl = {
  addEventListener: function () {},
  setAttribute: function () {},
  appendChild: function () {},
  get innerHTML() { return ""; },
  set innerHTML(_) {},
  get textContent() { return ""; },
  set textContent(_) {},
  get style() { return { cssText: "", opacity: "", marginTop: "" }; },
  get className() { return ""; },
  set className(_) {},
  get value() { return ""; },
  set value(_) {},
  get disabled() { return false; },
  set disabled(_) {},
};
const mockDoc = {
  getElementById: function () { return Object.create(mockEl); },
  querySelector: function () { return null; },
  createElement: function () { return Object.create(mockEl); },
};
const mockMod = { exports: {} };

const fn = new Function("document", "module", match[1]);
fn(mockDoc, mockMod);

const {
  episode, DESTINATIONS, DEST_REQUIRED_FIELDS, INITIAL_FIELDS,
  state, fieldStatus, readinessChecks, isReadyForExport, statusLabel,
} = mockMod.exports;

// 1. Episode context is grounded.
assert.ok(episode.show, "episode has a show name");
assert.ok(episode.host, "episode has a host");
assert.ok(episode.guests.length >= 2, "episode has guests");

// 2. Destinations are defined.
assert.ok(DESTINATIONS.length >= 3, "at least 3 destinations");

// 3. Fields are realistic.
assert.ok(INITIAL_FIELDS.length >= 6, "at least 6 metadata fields");
for (var i = 0; i < INITIAL_FIELDS.length; i++) {
  assert.ok(INITIAL_FIELDS[i].label, "field has a label: " + INITIAL_FIELDS[i].id);
  assert.ok(INITIAL_FIELDS[i].value, "field has a value: " + INITIAL_FIELDS[i].id);
}

// 4. statusLabel returns human-readable labels.
assert.strictEqual(statusLabel("complete"), "Complete");
assert.strictEqual(statusLabel("missing"), "Missing");
assert.strictEqual(statusLabel("needs-review"), "Needs review");
assert.strictEqual(statusLabel("not-needed"), "Not needed for destination");

// 5. fieldStatus gates on destination requirements.
assert.strictEqual(fieldStatus("title", "youtube"), "needs-review", "title is required for youtube");
assert.strictEqual(fieldStatus("sponsor", "archive"), "not-needed", "sponsor is not needed for archive");

// 6. readinessChecks returns checks for required fields.
var ytChecks = readinessChecks("youtube");
assert.ok(ytChecks.length >= 4, "youtube has at least 4 required field checks");
var archiveChecks = readinessChecks("archive");
assert.ok(archiveChecks.length <= 3, "archive has fewer required fields");

// 7. isReadyForExport depends on missing fields.
assert.strictEqual(isReadyForExport("youtube"), true, "ready when all required fields have values");

// Simulate missing title.
var origTitle = state.fields[0].value;
state.fields[0].value = "";
assert.strictEqual(isReadyForExport("youtube"), false, "not ready when title is missing");
state.fields[0].value = origTitle;

console.log("episode-metadata-publishing: all behavior tests passed");
