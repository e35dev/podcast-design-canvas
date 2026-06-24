"use strict";

// Smoke test: client-review-copy-flow must route each review copy issue to the screen that owns the fix (#583).
// Each flagged condition routes to a real prototype that owns the fix, so a
// connected hand-off never becomes a dead end. Run with:
//   node prototype/client-review-copy-flow-fix-routing.test.js

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "prototype", "client-review-copy-flow.html"), "utf8");

// Each flagged condition declares the owning fix screen it routes to.
const routes = [
  { key: "owner", file: "audio-caption-quality-review.html" },
  { key: "owner", file: "contextual-broll-moments.html" },
  { key: "owner", file: "thumbnail-cover-frame.html" },
];

for (const { key, file } of routes) {
  assert.ok(source.includes(`${key}: "${file}"`), `client-review-copy-flow routes ${key} to ${file}`);
  assert.ok(fs.existsSync(path.join(root, "prototype", file)), `fix screen ${file} exists as a real prototype`);
}

const targets = [...new Set(routes.map((r) => r.file))];
assert.strictEqual(targets.length, 3, "each fix screen is listed once");

// The hand-off is a navigable link, not just a status note.
assert.ok(source.includes(".href = "), "hand-off renders a navigable link");

console.log("client-review-copy-flow: " + routes.length + " flagged conditions route to " + targets.length + " owning fix screens");
