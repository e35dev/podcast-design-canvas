"use strict";

// Smoke test: speaker-attribution-review must route each attribution problem to the surface that owns the fix (#583).
// Each flagged condition declares a `fixSurface` that resolves to a real prototype,
// rendered as a navigable `${fixSurface}.html` hand-off so the connected flow never
// dead-ends. Run with:
//   node prototype/speaker-attribution-review-fix-routing.test.js

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "prototype", "speaker-attribution-review.html"), "utf8");

// Every fix surface this screen routes to must resolve to a real prototype file.
const surfaces = [
  "speaker-sync-repair",
  "speaker-role-mapping",
];

for (const surface of surfaces) {
  assert.ok(source.includes(`fixSurface: "${surface}"`), `speaker-attribution-review routes to ${surface}`);
  assert.ok(fs.existsSync(path.join(root, "prototype", surface + ".html")), `fix surface ${surface}.html exists as a real prototype`);
}

// The hand-off is rendered as a navigable link, not just a status note.
assert.ok(/fixSurface\}\.html/.test(source) || /\.href\s*=/.test(source), "hand-off renders a navigable ${fixSurface}.html link");

console.log("speaker-attribution-review: " + surfaces.length + " fix surfaces resolve to real prototypes");
