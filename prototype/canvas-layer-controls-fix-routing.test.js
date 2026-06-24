"use strict";

// Guards canvas layer control hand-off links (#583): caption overlap reviews open
// layout safe areas, where caption and overlay placement is owned.
// Run with: `node prototype/canvas-layer-controls-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(__dirname, "canvas-layer-controls.html"), "utf8");
const shell = fs.readFileSync(path.join(root, "preview", "index.html"), "utf8");
const styleNav = fs.readFileSync(path.join(root, "preview", "style-nav.js"), "utf8");

assert.ok(
  shell.includes("../prototype/canvas-layer-controls.html"),
  "canvas layer controls is reachable from the preview shell",
);
assert.ok(
  styleNav.includes('id: "canvas-layer-controls"'),
  "canvas layer controls is part of the connected visual direction path",
);
assert.ok(
  shell.includes("../prototype/layout-safe-areas.html"),
  "layout safe areas is reachable from the preview shell",
);

assert.ok(html.includes('fixScreen: "layout-safe-areas.html"'), "caption overlap reviews route to layout safe areas");
assert.ok(html.includes('fixLabel: "layout safe areas"'), "caption overlap reviews name the fix screen in creator-facing copy");
assert.ok(
  fs.existsSync(path.join(__dirname, "layout-safe-areas.html")),
  "layout safe areas exists as a real screen",
);
assert.ok(
  html.includes('fixScreen: "speaker-framing-safety.html"'),
  "hidden speaker reviews route to speaker framing safety",
);
assert.ok(
  html.includes('fixLabel: "speaker framing safety"'),
  "hidden speaker reviews name the fix screen in creator-facing copy",
);
assert.ok(
  fs.existsSync(path.join(__dirname, "speaker-framing-safety.html")),
  "speaker framing safety exists as a real screen",
);
assert.ok(html.includes('class: "fix-link"'), "canvas layer controls renders fix links with shared styling");
assert.ok(html.includes("c.fixScreen && c.fixLabel"), "fix link rendering requires target and label");
const brandCheckBlock = html.match(/title: "Brand element is unlocked"[\s\S]*?\}\);/);
assert.ok(brandCheckBlock, "brand element unlocked check is declared");
assert.ok(
  !brandCheckBlock[0].includes("fixScreen"),
  "brand-element-unlocked check stays resolved within the screen",
);

console.log("canvas layer controls: layout safety checks open their owning fix screens");
