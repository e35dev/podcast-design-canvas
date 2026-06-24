"use strict";

// Regression guard: every path nav marks its active step with aria-current (#584).
// Run with: `node preview/path-nav-aria-current.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const navScripts = [
  "ingest-nav.js",
  "speaker-setup-nav.js",
  "style-nav.js",
  "visuals-nav.js",
  "reuse-nav.js",
  "cleanup-nav.js",
  "music-nav.js",
  "publish-nav.js",
  "episode-flow-nav.js",
];

for (const file of navScripts) {
  const source = fs.readFileSync(path.join(__dirname, file), "utf8");
  assert.match(
    source,
    /stepLabel\.setAttribute\("aria-current", "step"\)/,
    `${file} must mark the active step with aria-current`,
  );
}

console.log("path nav aria-current: all path nav scripts mark the active step");
