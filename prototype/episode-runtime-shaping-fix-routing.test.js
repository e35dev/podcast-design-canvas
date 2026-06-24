"use strict";

// Smoke test: episode-runtime-shaping must route each runtime issue to the screen that owns the fix (#583).
// Each flagged condition routes to a real prototype that owns the fix, so a
// connected hand-off never becomes a dead end. Run with:
//   node prototype/episode-runtime-shaping-fix-routing.test.js

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "prototype", "episode-runtime-shaping.html"), "utf8");

// Each flagged condition declares the owning fix screen it routes to.
const routes = [
  { key: "route", file: "pause-crosstalk-cleanup.html" },
  { key: "route", file: "show-segment-system.html" },
  { key: "route", file: "intro-outro-builder.html" },
  { key: "route", file: "transcript-search-navigation.html" },
];

for (const { key, file } of routes) {
  assert.ok(source.includes(`${key}: "${file}"`), `episode-runtime-shaping routes ${key} to ${file}`);
  assert.ok(fs.existsSync(path.join(root, "prototype", file)), `fix screen ${file} exists as a real prototype`);
}

const targets = [...new Set(routes.map((r) => r.file))];
assert.strictEqual(targets.length, 4, "each fix screen is listed once");

// The hand-off is a navigable link, not just a status note.
assert.ok(source.includes("createElement(\"a\")"), "hand-off renders a navigable link");

console.log("episode-runtime-shaping: " + routes.length + " flagged conditions route to " + targets.length + " owning fix screens");
