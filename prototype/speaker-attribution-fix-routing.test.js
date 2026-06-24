"use strict";

// Guards speaker attribution review hand-off links (#583): timing issues open sync
// repair; unassigned captions and speaker mismatches open role mapping.
// Run with: `node prototype/speaker-attribution-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "prototype", "speaker-attribution-review.html"), "utf8");
const shell = fs.readFileSync(path.join(root, "preview", "index.html"), "utf8");
const speakerSetupNav = fs.readFileSync(path.join(root, "preview", "speaker-setup-nav.js"), "utf8");
const ingestNav = fs.readFileSync(path.join(root, "preview", "ingest-nav.js"), "utf8");

const fixSurfaces = ["speaker-sync-repair", "speaker-role-mapping"];

assert.ok(
  shell.includes("../prototype/speaker-attribution-review.html"),
  "speaker attribution review is reachable from the preview shell",
);
assert.ok(
  speakerSetupNav.includes('id: "speaker-attribution-review"'),
  "speaker attribution review is part of the connected speaker setup path",
);
assert.ok(
  shell.includes("../prototype/speaker-role-mapping.html"),
  "speaker role mapping is reachable from the preview shell",
);
assert.ok(
  ingestNav.includes('id: "speaker-role-mapping"'),
  "speaker role mapping is part of the connected ingest and episode setup path",
);
assert.ok(
  shell.includes("../prototype/speaker-sync-repair.html"),
  "speaker sync repair is reachable from the preview shell",
);

for (const surface of fixSurfaces) {
  assert.ok(
    source.includes(`fixSurface: "${surface}"`),
    `attribution review declares a fix surface for ${surface}`,
  );
  assert.ok(
    fs.existsSync(path.join(root, "prototype", `${surface}.html`)),
    `fix surface ${surface}.html exists as a real screen`,
  );
}

assert.ok(
  source.includes("!moment.assignedSpeaker"),
  "unassigned captions are evaluated as needs speaker",
);
assert.ok(
  source.includes("Open speaker role mapping to assign this line"),
  "needs speaker routed copy names the role mapping screen",
);
assert.ok(
  source.includes("suggestedSpeaker && moment.assignedSpeaker !== moment.suggestedSpeaker"),
  "speaker mismatch reviews are evaluated separately from unassigned captions",
);
assert.ok(
  source.includes("Open speaker role mapping to confirm speaker buckets"),
  "speaker mismatch routed copy names the role mapping screen",
);
assert.ok(
  source.includes("Open sync repair so the visible speaker and caption moment line up."),
  "sync repair routed copy names the sync repair screen",
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

console.log("speaker attribution review: timing issues open sync repair; unassigned and mismatched captions open speaker role mapping");
