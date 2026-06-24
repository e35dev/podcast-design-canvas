"use strict";

// Smoke test: speaker sync repair must route its "needs attribution review"
// summary to the real attribution screen (#582 / #583). When a repair leaves
// captions needing a speaker check, the next step should be a navigable link to
// the attribution review screen, not a dead note. Run with:
//   `node prototype/speaker-sync-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "prototype", "speaker-sync-repair.html"), "utf8");

const fixSurface = "speaker-attribution-review";

assert.ok(
  source.includes(`fixSurface: "${fixSurface}"`),
  `sync repair declares a fix surface for ${fixSurface}`,
);
assert.ok(
  fs.existsSync(path.join(root, "prototype", `${fixSurface}.html`)),
  `fix surface ${fixSurface}.html exists as a real screen`,
);

// The routed action is a navigable link, not a dead status note.
assert.ok(
  source.includes('action = document.createElement("a")'),
  "routed summary renders an anchor element",
);
assert.ok(
  source.includes("action.href = `${issue.fixSurface}.html`"),
  "routed summary links to its fix surface screen",
);
assert.ok(
  source.includes('action.className = "routed-link"'),
  "routed link is class-tagged for styling",
);

console.log("speaker sync repair: attribution-review summaries link to the attribution screen");
