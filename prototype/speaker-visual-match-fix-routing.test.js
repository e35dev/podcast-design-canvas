"use strict";

// Guards the speaker-visual-match routes into the preset preview surfaces (#583 / #584).
// Run with: `node prototype/speaker-visual-match-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(__dirname, "speaker-visual-match.html"), "utf8");
const shell = fs.readFileSync(path.join(root, "preview", "index.html"), "utf8");
const nav = fs.readFileSync(path.join(root, "preview", "speaker-setup-nav.js"), "utf8");

assert.ok(
  nav.includes('"speaker-visual-match.html"'),
  "speaker setup nav keeps speaker visual match in the connected flow",
);
assert.ok(
  source.includes('fixScreen: presetComparisonSurface'),
  "speaker visual match routes the review state into preset comparison",
);
assert.ok(
  source.includes('fixScreen: nextVisualSurface'),
  "speaker visual match routes the ready state into preset styling",
);
assert.ok(
  fs.existsSync(path.join(__dirname, "preset-comparison-preview.html")),
  "preset comparison preview exists",
);
assert.ok(
  fs.existsSync(path.join(__dirname, "preset-style-picker.html")),
  "preset style picker exists",
);
assert.ok(
  shell.includes("../prototype/preset-comparison-preview.html"),
  "preview shell links to preset comparison preview",
);
assert.ok(
  shell.includes("../prototype/preset-style-picker.html"),
  "preview shell links to preset style picker",
);
assert.ok(
  source.includes("openLink.href = issue.fixScreen"),
  "speaker visual match renders fix links from issue.fixScreen",
);
assert.ok(
  source.includes("openLink.textContent = `Open ${issue.fixLabel}`"),
  "speaker visual match renders creator-facing fix labels",
);

console.log("speaker visual match: preset handoff routes stay connected");
