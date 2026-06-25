"use strict";

// Unit tests for the preset visual direction handoff helper (preset-styles lane / #584).
// Run with: `node preview/preset-style-handoff.test.js`

const assert = require("assert");
const handoff = require("./preset-style-handoff.js");

const applied = {
  preset: "punchy-commentary",
  density: "layered",
  caption: "high",
  moments: "energetic",
  brand: "show-branded",
};

// --- completeness gate ---------------------------------------------------------------------

assert.ok(handoff.isComplete(applied), "a fully specified direction is complete");
assert.ok(!handoff.isComplete(null), "no direction is not complete");
assert.ok(!handoff.isComplete({ preset: "mystery", density: "layered", caption: "high", moments: "energetic", brand: "neutral" }), "an unknown preset is rejected");
assert.ok(!handoff.isComplete({ preset: "panel", density: "layered", caption: "high", moments: "energetic" }), "a missing control blocks the handoff");
assert.ok(!handoff.isComplete({ preset: "panel", density: "nope", caption: "high", moments: "energetic", brand: "neutral" }), "an unknown control value is rejected");

// --- normalization -------------------------------------------------------------------------

const state = handoff.stateFromRaw(applied);
assert.equal(state.presetLabel, "Punchy commentary", "preset resolves to its label");
assert.equal(state.density, "layered", "controls are preserved");

// --- query round-trip ----------------------------------------------------------------------

const query = handoff.queryForState(applied);
assert.ok(query.includes("preset=punchy-commentary"), "query carries the preset");
assert.ok(query.includes("caption=high"), "query carries each control");
const roundTripped = handoff.stateFromQuery(`?${query}`);
assert.ok(roundTripped, "a complete direction round-trips through the query string");
assert.equal(roundTripped.moments, "energetic", "control values survive the query round-trip");
assert.equal(handoff.queryForState({ preset: "x" }), "", "an incomplete direction makes no query");
assert.equal(handoff.stateFromQuery("?preset=panel"), null, "a query missing controls loads nothing");

const href = handoff.hrefWithState("preset-comparison-preview.html?path=episode", applied);
assert.ok(href.startsWith("preset-comparison-preview.html?path=episode&"), "hrefWithState preserves existing query");
assert.ok(href.includes("preset=punchy-commentary"), "hrefWithState appends the direction handoff");
const hashHref = handoff.hrefWithState("../preview/app.html#preset-comparison-preview?path=episode", applied);
assert.ok(hashHref.startsWith("../preview/app.html#preset-comparison-preview?"), "hrefWithState merges into a hash route");
assert.ok(hashHref.includes("preset=punchy-commentary"), "hash route handoff carries the preset");

// --- storage save / load -------------------------------------------------------------------

function memoryStorage() {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
  };
}

const storage = memoryStorage();
handoff.save(storage, applied);
const stored = handoff.load(storage, "");
assert.ok(stored, "a saved direction loads back from storage");
assert.equal(stored.preset, "punchy-commentary", "stored preset is restored");

handoff.save(storage, { preset: "x" });
assert.ok(handoff.load(storage, ""), "an incomplete save does not overwrite a stored direction");

handoff.clear(storage);
assert.equal(handoff.load(storage, ""), null, "clearing removes the stored direction");

// load prefers the query handoff over storage
handoff.save(storage, applied);
const fromQuery = handoff.load(storage, `?${handoff.queryForState({
  preset: "teaching",
  density: "balanced",
  caption: "high",
  moments: "balanced",
  brand: "neutral",
})}`);
assert.equal(fromQuery.preset, "teaching", "load prefers the query handoff over storage");

// --- summary -------------------------------------------------------------------------------

const lines = handoff.summaryLines(applied);
assert.equal(lines[0], "Applied direction: Punchy commentary", "summary opens with the applied preset");
assert.ok(lines.some((line) => line === "Caption presence: High-emphasis"), "summary names each control with its label");
assert.deepStrictEqual(handoff.summaryLines(null), [], "an incomplete direction has no summary");

console.log("preset style handoff: gate, normalization, query round-trip, storage, and summary verified");
