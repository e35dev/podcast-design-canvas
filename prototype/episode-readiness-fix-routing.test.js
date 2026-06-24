"use strict";

// Smoke test: episode readiness must route each resolved issue to a real fix
// screen (#582). The screen's lede promises "each flagged issue links to the
// right fix", so a routed issue should render an anchor to its fix surface, and
// every fix surface must be a real prototype screen. Run with:
//   `node prototype/episode-readiness-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "prototype", "episode-readiness.html"), "utf8");
const nextSetupSurface = "speaker-role-mapping.html";

// Fix surfaces the readiness screen hands issues off to. Each key is also the
// fix screen's filename (without extension).
const fixSurfaces = ["source-media-health", "speaker-sync-repair", "social-context-intake"];

for (const surface of fixSurfaces) {
  assert.ok(
    source.includes(`"${surface}"`),
    `episode readiness declares a fix surface for ${surface}`,
  );
  assert.ok(
    fs.existsSync(path.join(root, "prototype", `${surface}.html`)),
    `fix surface ${surface}.html exists as a real screen`,
  );
}

// The routed confirmation is a navigable link, not a dead status note.
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
assert.ok(
  source.includes("fixSurfaces[issue.fixSurface].routed"),
  "routed link uses the creator-facing routed copy",
);

// The ready-state primary action should open the next setup screen instead
// of becoming an enabled button with no navigation.
assert.ok(
  fs.existsSync(path.join(root, "prototype", nextSetupSurface)),
  "next setup screen exists as a real screen",
);
assert.ok(
  source.includes(`const nextSetupSurface = "${nextSetupSurface}"`),
  "episode readiness declares the next setup handoff target",
);
assert.ok(
  source.includes("function updateContinueLink(readiness)"),
  "episode readiness updates the primary continue link from readiness state",
);
assert.ok(
  source.includes("continueLink.href = nextSetupSurface"),
  "ready continue action links to the next setup screen",
);
assert.ok(
  source.includes('continueLink.removeAttribute("href")'),
  "blocked or review continue action removes navigation",
);
assert.ok(
  source.includes('continueLink.setAttribute("aria-disabled", String(!ready))'),
  "blocked or review continue action is exposed as disabled",
);

// Keep the DOM built without innerHTML, consistent with the other prototypes.
assert.ok(!/innerHTML/.test(source), "episode readiness builds the DOM without innerHTML");

console.log("episode readiness: routed issues and setup handoff link to real screens");
