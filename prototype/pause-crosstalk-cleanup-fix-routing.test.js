"use strict";

// Smoke test: pause & cross-talk cleanup must hand its caption-risk moments off to the
// screen that owns the fix (#582 / #583), the same connected hand-off pattern guarded for
// transcript-search-navigation. A caption-risk condition routes to a real
// audio-caption-quality-review screen through a navigable "Open ..." link — so a future edit
// can't silently rename the fix target, drop the hand-off, or point it at a screen that no
// longer exists without this test failing.
// Run with: `node prototype/pause-crosstalk-cleanup-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "prototype", "pause-crosstalk-cleanup.html"), "utf8");

// The caption-risk hand-off routes to the screen that owns the fix; the value is a real prototype.
const fixScreen = "audio-caption-quality-review.html";
assert.ok(
  source.includes(`fixScreen: "${fixScreen}"`),
  `pause & cross-talk cleanup routes its caption-risk fix to ${fixScreen}`,
);
assert.ok(
  fs.existsSync(path.join(root, "prototype", fixScreen)),
  `fix screen ${fixScreen} exists as a real screen`,
);

// The hand-off is a navigable link to the fix screen, not just a status-setting button.
assert.ok(
  source.includes('document.createElement("a")'),
  "hand-off renders an anchor element",
);
assert.ok(
  source.includes("openLink.href = issue.fixScreen"),
  "hand-off link points at the fix screen that owns the fix",
);
assert.ok(
  source.includes('openLink.className = "fix-link"'),
  "hand-off link is class-tagged for styling",
);

// The caption-risk condition is what carries a moment into caption quality review.
assert.ok(
  source.includes('fixLabel: "caption quality review"'),
  "the caption-risk hand-off is labelled for caption quality review",
);

console.log("pause & cross-talk cleanup: caption-risk moments open the screen that owns the fix");
