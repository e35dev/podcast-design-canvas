"use strict";

// Guards layout safe-area hand-off links (#583): an element that falls outside
// the destination crop opens the screen that owns the destination crop.
// Run with: `node prototype/layout-safe-areas-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const dir = __dirname;
const html = fs.readFileSync(path.join(dir, "layout-safe-areas.html"), "utf8");

assert.ok(html.includes('openLink = document.createElement("a")'), "safe-area issues render an open-fix-screen link");
assert.ok(html.includes("openLink.href = issue.fixScreen"), "open link routes to the owning fix screen");

const fixScreens = [...html.matchAll(/fixScreen:\s*"([a-z0-9-]+\.html)"/g)].map((m) => m[1]);
assert.ok(fixScreens.length >= 1, "safe-area checks declare fix screens");
for (const file of fixScreens) {
  assert.ok(fs.existsSync(path.join(dir, file)), `fix screen exists: ${file}`);
}

assert.ok(
  fixScreens.includes("destination-crop-preview.html"),
  "outside-the-crop issues route to destination crop preview",
);

console.log(`layout safe areas: ${fixScreens.length} issue paths open their owning fix screen`);
