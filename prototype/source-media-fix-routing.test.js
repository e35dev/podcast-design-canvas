"use strict";

// Smoke test: source media health must route its visual/audio issues to real
// fix screens (#582). The spec hands quiet/caption tracks to audio cleanup and
// dark tracks to visual match, so a flagged track should render a navigable
// link to that screen, and every fix surface must be a real prototype. Run with:
//   `node prototype/source-media-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "prototype", "source-media-health.html"), "utf8");

// Fix surfaces the source screen hands issues off to. Each is also a filename.
const fixSurfaces = ["speaker-visual-match", "audio-cleanup-controls"];

for (const surface of fixSurfaces) {
  assert.ok(
    source.includes(`fixSurface: "${surface}"`),
    `source media declares a fix surface for ${surface}`,
  );
  assert.ok(
    fs.existsSync(path.join(root, "prototype", `${surface}.html`)),
    `fix surface ${surface}.html exists as a real screen`,
  );
}

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

// The routed link reuses the creator-facing action copy that names the fix screen.
assert.ok(
  source.includes("in audio cleanup") && source.includes("Open visual match"),
  "routed copy names the fix screen in creator-facing language",
);

console.log("source media health: routed issues link to their fix screens");
