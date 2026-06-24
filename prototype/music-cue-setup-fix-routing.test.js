"use strict";

// Guards music cue setup hand-off links (#583): overlap placements route to ducking
// review, and intro/outro music reviews route back into cue setup.
// Run with: `node prototype/music-cue-setup-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(__dirname, "music-cue-setup.html"), "utf8");
const shell = fs.readFileSync(path.join(root, "preview", "index.html"), "utf8");
const musicNav = fs.readFileSync(path.join(root, "preview", "music-nav.js"), "utf8");
const introOutro = fs.readFileSync(path.join(__dirname, "intro-outro-builder.html"), "utf8");

assert.ok(
  shell.includes("../prototype/music-cue-setup.html"),
  "music cue setup is reachable from the preview shell",
);
assert.ok(
  musicNav.includes('id: "music-cue-setup"'),
  "music cue setup is part of the connected music path",
);
assert.ok(
  shell.includes("../prototype/music-ducking-under-speech.html"),
  "music ducking is reachable from the preview shell",
);
assert.ok(
  musicNav.includes('id: "music-ducking-under-speech"'),
  "music ducking is part of the connected music path",
);

assert.ok(
  html.includes('fixScreen: "music-ducking-under-speech.html"'),
  "overlap placements route to music ducking under speech",
);
assert.ok(
  html.includes('fixLabel: "music ducking under speech"'),
  "overlap placements name the ducking screen in creator-facing copy",
);
assert.ok(
  fs.existsSync(path.join(__dirname, "music-ducking-under-speech.html")),
  "music ducking exists as a real screen",
);
assert.ok(html.includes("issue.fixScreen && issue.fixLabel"), "fix link rendering requires target and label");
assert.ok(html.includes('el("a", "fix-link"'), "music cue fix links are class-tagged");

assert.ok(
  introOutro.includes('issue.fixScreen = "music-cue-setup.html"'),
  "intro/outro music reviews route to music cue setup",
);
assert.ok(
  introOutro.includes('issue.fixLabel = "music cue setup"'),
  "intro/outro music reviews name the cue setup screen",
);

console.log("music cue setup: overlap and intro/outro reviews route to the right screens");
