"use strict";

// Guards pause & cross-talk cleanup hand-off links (#583): overlap reviews that
// need audio leveling open the core audio cleanup screen.
// Run with: `node prototype/pause-crosstalk-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(__dirname, "pause-crosstalk-cleanup.html"), "utf8");
const shell = fs.readFileSync(path.join(root, "preview", "index.html"), "utf8");
const cleanupNav = fs.readFileSync(path.join(root, "preview", "cleanup-nav.js"), "utf8");
const episodeFlowNav = fs.readFileSync(path.join(root, "preview", "episode-flow-nav.js"), "utf8");

assert.ok(
  shell.includes("../prototype/pause-crosstalk-cleanup.html"),
  "pause and cross-talk cleanup is reachable from the preview shell",
);
assert.ok(
  cleanupNav.includes('id: "pause-crosstalk-cleanup"'),
  "pause and cross-talk cleanup is part of the connected cleanup path",
);
assert.ok(
  shell.includes("audio-cleanup-controls.html") || episodeFlowNav.includes("audio-cleanup-controls.html"),
  "audio cleanup is reachable from the preview shell workflow",
);

assert.ok(
  html.includes('fixScreen: "audio-caption-quality-review.html"'),
  "caption-risk cross-talk routes to caption quality review",
);
assert.ok(
  html.includes('fixScreen: "audio-cleanup-controls.html"'),
  "overlap cleanup reviews route to audio cleanup",
);
assert.ok(
  fs.existsSync(path.join(__dirname, "audio-cleanup-controls.html")),
  "audio cleanup exists as a real screen",
);
assert.ok(html.includes("openLink.href = issue.fixScreen"), "pause cleanup opens the owning fix screen");

console.log("pause & cross-talk cleanup: overlap reviews open audio cleanup and caption review");
