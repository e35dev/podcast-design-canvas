"use strict";

// Guards canvas layout safety check routing (#583 #989): the two safety-critical
// checks in canvas-layer-controls open the screen that owns each fix.
// Run with: `node prototype/canvas-layer-controls-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const dir = __dirname;
const html = fs.readFileSync(path.join(dir, "canvas-layer-controls.html"), "utf8");

// Guard 1: style-nav.js is loaded for preview shell connectivity.
assert.ok(html.includes("style-nav.js"), "canvas layer controls loads style-nav.js");

// Guard 2: both safety checks declare their owning fix screen.
const fixScreens = [...html.matchAll(/fixScreen:\s*"([a-z0-9-]+\.html)"/g)].map((m) => m[1]);
assert.ok(
  fixScreens.includes("layout-safe-areas.html"),
  "captions-covered check routes to layout-safe-areas.html",
);
assert.ok(
  fixScreens.includes("speaker-framing-safety.html"),
  "hidden-speaker check routes to speaker-framing-safety.html",
);

// Guard 3: every declared fix screen exists as a real prototype file.
for (const file of fixScreens) {
  assert.ok(fs.existsSync(path.join(dir, file)), `fix screen exists: ${file}`);
}

// Guard 4: the check renderer builds a navigable link with the fix-link class.
assert.ok(html.includes("link.href = c.fixScreen"), "check renderer sets href from fixScreen");
assert.ok(html.includes('"fix-link"'), "check renderer applies fix-link class to the link");

console.log(`canvas layer controls: ${fixScreens.length} safety checks route to their fix screens`);
