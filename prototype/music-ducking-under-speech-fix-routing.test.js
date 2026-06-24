"use strict";

// Smoke test: music-ducking-under-speech must route each ducking issue to the screen that owns the fix (#583).
// Each flagged condition routes to a real prototype that owns the fix, so a
// connected hand-off never becomes a dead end. Run with:
//   node prototype/music-ducking-under-speech-fix-routing.test.js

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "prototype", "music-ducking-under-speech.html"), "utf8");

// Each flagged condition declares the owning fix screen it routes to.
const routes = [
  { key: "fixScreen", file: "music-cue-setup.html" },
];

for (const { key, file } of routes) {
  assert.ok(source.includes(`${key}: "${file}"`), `music-ducking-under-speech routes ${key} to ${file}`);
  assert.ok(fs.existsSync(path.join(root, "prototype", file)), `fix screen ${file} exists as a real prototype`);
}

const targets = [...new Set(routes.map((r) => r.file))];
assert.strictEqual(targets.length, 1, "each fix screen is listed once");

// The hand-off is a navigable link, not just a status note.
assert.ok(source.includes("routed-link"), "hand-off renders a navigable link");

console.log("music-ducking-under-speech: " + routes.length + " flagged conditions route to " + targets.length + " owning fix screens");
