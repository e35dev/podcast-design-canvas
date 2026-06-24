"use strict";

// Behavior test for show-brand-kit-setup logic (#583 / #584).
// Validates kit status computation, conflict detection, and status labels without DOM.

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(
  path.join(__dirname, "..", "prototype", "show-brand-kit-setup.html"),
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
  get style() { return { cssText: "", background: "" }; },
  get className() { return ""; },
  set className(_) {},
  get hidden() { return false; },
  set hidden(_) {},
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
  episode, BRAND_INPUTS, PREVIEW_SURFACES, INITIAL_CONFLICTS,
  kitStatusLabel, hasUnresolvedConflicts, computeKitStatus,
} = mockMod.exports;

// 1. Episode context is grounded.
assert.ok(episode.show, "episode has a show name");
assert.ok(episode.host, "episode has a host");

// 2. Brand inputs are realistic.
assert.ok(BRAND_INPUTS.length >= 6, "at least 6 brand inputs");
for (var i = 0; i < BRAND_INPUTS.length; i++) {
  assert.ok(BRAND_INPUTS[i].label, "input has a label: " + BRAND_INPUTS[i].id);
  assert.ok(BRAND_INPUTS[i].value, "input has a value: " + BRAND_INPUTS[i].id);
}

// 3. Preview surfaces route to real owning screens.
assert.ok(PREVIEW_SURFACES.length >= 5, "at least 5 preview surfaces");

// 4. kitStatusLabel returns human-readable labels.
assert.strictEqual(kitStatusLabel("defaults"), "Using defaults");
assert.strictEqual(kitStatusLabel("previewing"), "Previewing");
assert.strictEqual(kitStatusLabel("conflict-flagged"), "Conflict flagged");
assert.strictEqual(kitStatusLabel("saved"), "Saved to template");

// 5. hasUnresolvedConflicts detects flagged conflicts.
assert.strictEqual(hasUnresolvedConflicts(INITIAL_CONFLICTS), true, "initial conflicts have unresolved items");
assert.strictEqual(hasUnresolvedConflicts([{ status: "adjusted" }]), false, "adjusted conflicts are resolved");
assert.strictEqual(hasUnresolvedConflicts([]), false, "empty conflicts are resolved");

// 6. computeKitStatus returns correct state.
var defaultsState = {
  inputs: BRAND_INPUTS.map(function (inp) { return { id: inp.id, value: inp.value, set: false }; }),
  conflicts: [],
  savedToTemplate: false,
};
assert.strictEqual(computeKitStatus(defaultsState), "defaults", "unset inputs produce defaults status");

var previewingState = {
  inputs: BRAND_INPUTS.map(function (inp) { return { id: inp.id, value: inp.value, set: true }; }),
  conflicts: [],
  savedToTemplate: false,
};
assert.strictEqual(computeKitStatus(previewingState), "previewing", "set inputs with no conflicts produce previewing");

var conflictState = {
  inputs: BRAND_INPUTS.map(function (inp) { return { id: inp.id, value: inp.value, set: true }; }),
  conflicts: [{ status: "flagged" }],
  savedToTemplate: false,
};
assert.strictEqual(computeKitStatus(conflictState), "conflict-flagged", "flagged conflicts produce conflict-flagged");

var savedState = {
  inputs: BRAND_INPUTS.map(function (inp) { return { id: inp.id, value: inp.value, set: true }; }),
  conflicts: [],
  savedToTemplate: true,
};
assert.strictEqual(computeKitStatus(savedState), "saved", "savedToTemplate produces saved");

console.log("show-brand-kit-setup: all behavior tests passed");
