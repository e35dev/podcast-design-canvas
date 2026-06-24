"use strict";

// Guards speaker framing safety hand-off links (#583): each flagged framing check
// opens the screen that owns the underlying fix.
// Run with: `node prototype/speaker-framing-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const dir = __dirname;
const html = fs.readFileSync(path.join(dir, "speaker-framing-safety.html"), "utf8");

assert.ok(html.includes('openLink = document.createElement("a")'), "framing issues render an open-fix-screen link");
assert.ok(html.includes("openLink.href = issue.fixScreen"), "open link routes to the owning fix screen");

const checkBlock = html.match(/const checks = \{([\s\S]*?)\};/);
assert.ok(checkBlock, "speaker framing checks are declared");
const fixScreens = [...checkBlock[1].matchAll(/fixScreen:\s*"([a-z0-9-]+\.html)"/g)].map((m) => m[1]);
assert.ok(fixScreens.length >= 4, "framing checks declare fix screens");
for (const file of fixScreens) {
  assert.ok(fs.existsSync(path.join(dir, file)), `fix screen exists: ${file}`);
}

assert.ok(
  fixScreens.includes("layout-safe-areas.html"),
  "caption overlap routes to layout safe areas",
);
assert.ok(
  fixScreens.includes("destination-crop-preview.html"),
  "crop framing issues route to destination crop preview",
);
assert.ok(
  fixScreens.includes("contextual-broll-moments.html"),
  "b-roll overlap routes to contextual B-roll moments",
);

console.log(`speaker framing safety: ${fixScreens.length} framing checks open their owning fix screen`);
