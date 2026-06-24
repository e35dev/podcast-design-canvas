"use strict";

// Guards destination crop preview hand-off links (#583): each flagged crop issue
// opens the screen that owns the underlying fix.
// Run with: `node prototype/destination-crop-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const dir = __dirname;
const html = fs.readFileSync(path.join(dir, "destination-crop-preview.html"), "utf8");

assert.ok(html.includes('openLink = document.createElement("a")'), "crop issues render an open-fix-screen link");
assert.ok(html.includes("openLink.href = issue.fixScreen"), "open link routes to the owning fix screen");

const checkBlock = html.match(/const checks = \{([\s\S]*?)\};/);
assert.ok(checkBlock, "destination crop checks are declared");
const fixScreens = [...checkBlock[1].matchAll(/fixScreen:\s*"([a-z0-9-]+\.html)"/g)].map((m) => m[1]);
assert.ok(fixScreens.length >= 4, "crop issues declare fix screens");
for (const file of fixScreens) {
  assert.ok(fs.existsSync(path.join(dir, file)), `fix screen exists: ${file}`);
}

assert.ok(
  fixScreens.includes("speaker-framing-safety.html"),
  "cropped guest frame routes to speaker framing safety",
);
assert.ok(
  fixScreens.includes("thumbnail-cover-frame.html"),
  "thumbnail title issue routes to thumbnail cover frame",
);

console.log(`destination crop preview: ${fixScreens.length} crop issues open their owning fix screen`);
