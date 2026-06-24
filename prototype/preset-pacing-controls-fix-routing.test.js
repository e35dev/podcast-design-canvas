"use strict";

// Smoke test: preset-pacing-controls must route each pacing issue to the screen that owns the fix (#583).
// Each flagged condition routes to a real prototype that owns the fix, so a
// connected hand-off never becomes a dead end. Run with:
//   node prototype/preset-pacing-controls-fix-routing.test.js

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "prototype", "preset-pacing-controls.html"), "utf8");

// Each flagged condition declares the owning fix screen it routes to.
const routes = [
  { key: "surface", file: "contextual-title-cards.html" },
  { key: "surface", file: "contextual-broll-moments.html" },
  { key: "surface", file: "audio-caption-quality-review.html" },
  { key: "surface", file: "speaker-framing-safety.html" },
  { key: "surface", file: "pause-crosstalk-cleanup.html" },
  { key: "surface", file: "episode-chapter-markers.html" },
];

for (const { key, file } of routes) {
  assert.ok(source.includes(`${key}: "${file}"`), `preset-pacing-controls routes ${key} to ${file}`);
  assert.ok(fs.existsSync(path.join(root, "prototype", file)), `fix screen ${file} exists as a real prototype`);
}

const targets = [...new Set(routes.map((r) => r.file))];
assert.strictEqual(targets.length, 6, "each fix screen is listed once");

// The hand-off is a navigable link, not just a status note.
assert.ok(source.includes("createElement(\"a\")"), "hand-off renders a navigable link");

console.log("preset-pacing-controls: " + routes.length + " flagged conditions route to " + targets.length + " owning fix screens");
