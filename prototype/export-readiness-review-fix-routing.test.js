"use strict";

// Smoke test: export-readiness-review must route each export-readiness issue to the screen that owns the fix (#583).
// Each flagged condition routes to a real prototype that owns the fix, so a
// connected hand-off never becomes a dead end. Run with:
//   node prototype/export-readiness-review-fix-routing.test.js

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "prototype", "export-readiness-review.html"), "utf8");

// Each flagged condition declares the owning fix screen it routes to.
const routes = [
  { key: "fixScreen", file: "speaker-framing-safety.html" },
  { key: "fixScreen", file: "audio-caption-quality-review.html" },
  { key: "fixScreen", file: "audio-cleanup-controls.html" },
  { key: "fixScreen", file: "contextual-broll-moments.html" },
  { key: "fixScreen", file: "layout-safe-areas.html" },
  { key: "fixScreen", file: "episode-chapter-markers.html" },
  { key: "fixScreen", file: "intro-outro-builder.html" },
  { key: "fixScreen", file: "thumbnail-cover-frame.html" },
];

for (const { key, file } of routes) {
  assert.ok(source.includes(`${key}: "${file}"`), `export-readiness-review routes ${key} to ${file}`);
  assert.ok(fs.existsSync(path.join(root, "prototype", file)), `fix screen ${file} exists as a real prototype`);
}

const targets = [...new Set(routes.map((r) => r.file))];
assert.strictEqual(targets.length, 8, "each fix screen is listed once");

// The hand-off is a navigable link, not just a status note.
assert.ok(source.includes("createElement(\"a\")"), "hand-off renders a navigable link");

console.log("export-readiness-review: " + routes.length + " flagged conditions route to " + targets.length + " owning fix screens");
