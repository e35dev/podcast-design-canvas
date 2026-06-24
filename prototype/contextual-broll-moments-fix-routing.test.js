"use strict";

// Smoke test: contextual-broll-moments must route each b-roll gap to the screen that owns the fix (#583).
// Each flagged condition routes to a real prototype that owns the fix, so a
// connected hand-off never becomes a dead end. Run with:
//   node prototype/contextual-broll-moments-fix-routing.test.js

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "prototype", "contextual-broll-moments.html"), "utf8");

assert.ok(
  source.includes('fixScreen: "contextual-title-cards.html"'),
  "contextual-broll-moments routes repeated title cards to contextual-title-cards.html",
);
assert.ok(
  source.includes("contextScorer.socialContextHref(moment)"),
  "contextual-broll-moments builds a moment-specific social-context handoff",
);
assert.ok(
  source.includes('"social-context-intake.html"'),
  "contextual-broll-moments keeps a social-context fallback route",
);

const targets = ["contextual-title-cards.html", "social-context-intake.html"];
for (const file of targets) {
  assert.ok(fs.existsSync(path.join(root, "prototype", file)), `fix screen ${file} exists as a real prototype`);
}

assert.strictEqual(targets.length, 2, "each fix screen is listed once");

// The hand-off is a navigable link, not just a status note.
assert.ok(source.includes("createElement(\"a\")"), "hand-off renders a navigable link");

console.log("contextual-broll-moments: weak-context and repeat reviews route to " + targets.length + " owning fix screens");
