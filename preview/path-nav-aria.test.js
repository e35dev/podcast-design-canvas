"use strict";

// Path nav scripts must expose the current step with aria-current (#584).
// Run with: `node preview/path-nav-aria.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const previewDir = __dirname;

const pathNavScripts = [
  "episode-flow-nav.js",
  "ingest-nav.js",
  "speaker-setup-nav.js",
  "style-nav.js",
  "publish-nav.js",
  "visuals-nav.js",
  "reuse-nav.js",
  "cleanup-nav.js",
  "music-nav.js",
];

for (const file of pathNavScripts) {
  const source = fs.readFileSync(path.join(previewDir, file), "utf8");
  assert.ok(
    source.includes('setAttribute("aria-current", "step")'),
    `${file} marks the current step with aria-current`,
  );
}

console.log(`path nav aria: ${pathNavScripts.length} path nav scripts expose aria-current on the step label`);
