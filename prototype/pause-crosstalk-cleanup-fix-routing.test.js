"use strict";

// Guards caption-risk cross-talk routing to caption quality review (#583 #584 #1305).
// A future PR touching evaluate() or kinds could silently break this hand-off without
// this guard catching it in CI.
// Run with: `node prototype/pause-crosstalk-cleanup-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(__dirname, "pause-crosstalk-cleanup.html"), "utf8");
const cleanupNav = fs.readFileSync(path.join(root, "preview", "cleanup-nav.js"), "utf8");
const shell = fs.readFileSync(path.join(root, "preview", "index.html"), "utf8");

// Guard 1: cleanup-nav.js is loaded and pause-crosstalk-cleanup is registered in CLEANUP_FLOW.
assert.ok(
  html.includes("cleanup-nav.js"),
  "pause-crosstalk-cleanup loads cleanup-nav.js",
);
assert.ok(
  cleanupNav.includes('id: "pause-crosstalk-cleanup"'),
  "pause-crosstalk-cleanup is registered in CLEANUP_FLOW",
);

// Guard 2: caption-risk cross-talk declares the owning fix screen and names it in creator-facing copy.
assert.ok(
  html.includes('fixScreen: "audio-caption-quality-review.html"'),
  "caption-risk cross-talk declares audio-caption-quality-review.html as fix screen",
);
assert.ok(
  html.includes('fixLabel: "caption quality review"'),
  "caption-risk cross-talk names the fix screen in creator-facing copy",
);

// Guard 3: the fix screen exists on disk and is reachable from the preview shell.
assert.ok(
  fs.existsSync(path.join(__dirname, "audio-caption-quality-review.html")),
  "audio-caption-quality-review.html exists as a real screen",
);
assert.ok(
  shell.includes("../prototype/audio-caption-quality-review.html"),
  "audio-caption-quality-review.html is reachable from the preview shell",
);

// Guard 4: the link-rendering code opens the fix screen as a navigable link, not a dead status note.
assert.ok(
  html.includes("openLink.href = issue.fixScreen"),
  "renderIssue opens the owning fix screen as a navigable link",
);
assert.ok(
  html.includes('openLink.className = "fix-link"'),
  "fix link uses the shared fix-link class",
);

console.log("pause-crosstalk-cleanup: caption-risk cross-talk routes to caption quality review");
