"use strict";

// Smoke test: speaker attribution review must route its "sync repair needed"
// issue to a real fix screen (#582). A caption moment flagged for timing
// should render a navigable link to the sync repair screen, not a dead status
// note. Run with:
//   `node prototype/speaker-attribution-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "prototype", "speaker-attribution-review.html"), "utf8");

// The fix surface the attribution screen hands timing issues off to.
const fixSurface = "speaker-sync-repair";

assert.ok(
  source.includes(`fixSurface: "${fixSurface}"`),
  `attribution review declares a fix surface for ${fixSurface}`,
);
assert.ok(
  fs.existsSync(path.join(root, "prototype", `${fixSurface}.html`)),
  `fix surface ${fixSurface}.html exists as a real screen`,
);

// The routed action is a navigable link, not a dead status note.
assert.ok(
  source.includes('action = document.createElement("a")'),
  "routed issue renders an anchor element",
);
assert.ok(
  source.includes("action.href = `${issue.fixSurface}.html`"),
  "routed issue links to its fix surface screen",
);
assert.ok(
  source.includes('action.className = "routed-link"'),
  "routed link is class-tagged for styling",
);

// Keep the DOM built without innerHTML, consistent with the other prototypes.
assert.ok(!/innerHTML/.test(source), "attribution review builds the DOM without innerHTML");

console.log("speaker attribution review: routed timing issues link to the sync repair screen");
