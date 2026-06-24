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
// A sideways (portrait) track that won't fill a widescreen layout is a framing
// problem, so it routes to the speaker framing safety screen.
const fixSurfaces = ["speaker-visual-match", "audio-cleanup-controls", "speaker-framing-safety"];

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

// The sideways (portrait) track names the framing fix screen in its routed copy.
assert.ok(
  source.includes("Open speaker framing safety"),
  "portrait routed copy names the speaker framing safety screen",
);

assert.ok(
  source.includes('action: "Open visual match to compare a sharper recording'),
  "soft video routes to and names the visual match screen",
);
assert.ok(
  source.includes('action: "Open visual match to compare a sharper take'),
  "out-of-focus video routes to and names the visual match screen",
);

console.log("source media health: routed issues link to their fix screens");
