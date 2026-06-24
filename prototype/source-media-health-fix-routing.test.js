"use strict";

// Smoke test: source media health must route each flagged condition to a real
// fix screen (#583). Every fixSurface must resolve to an existing prototype
// and the hand-off must render a navigable anchor. Run with:
//   `node prototype/source-media-health-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "prototype", "source-media-health.html"), "utf8");
const shell = fs.readFileSync(path.join(root, "preview", "index.html"), "utf8");

const fixSurfaces = [
  "speaker-visual-match",
  "audio-cleanup-controls",
  "speaker-framing-safety",
];

assert.ok(
  shell.includes("../prototype/source-media-health.html"),
  "source media health is reachable from the preview shell",
);

for (const surface of fixSurfaces) {
  assert.ok(
    source.includes(`"${surface}"`),
    `source media health declares a fix surface for ${surface}`,
  );
  assert.ok(
    fs.existsSync(path.join(root, "prototype", `${surface}.html`)),
    `fix surface ${surface}.html exists as a real screen`,
  );
}

assert.ok(
  source.includes('action = document.createElement("a")'),
  "routed issue renders an anchor element",
);
assert.ok(
  source.includes('action.className = "routed-link"'),
  "routed link is class-tagged for styling",
);
assert.ok(
  source.includes("action.href = `${issue.fixSurface}.html`"),
  "routed link href points to the fix surface screen",
);

console.log("source media health: fix surfaces resolve to real screens and render navigable links");
