"use strict";

// Smoke test: canvas layer controls routes its layout guardrails to real fix
// screens (#583). Captions covered by a higher frame -> layout safe areas; a
// hidden speaker -> speaker framing safety. Run with:
//   node prototype/canvas-layer-controls-fix-routing.test.js

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "prototype", "canvas-layer-controls.html"), "utf8");

const fixScreens = ["layout-safe-areas", "speaker-framing-safety"];
for (const screen of fixScreens) {
  assert.ok(html.includes('fixScreen: "' + screen + '.html"'), "canvas declares a fix screen for " + screen);
  assert.ok(fs.existsSync(path.join(root, "prototype", screen + ".html")), "fix screen " + screen + ".html exists as a real screen");
}

// The routed guardrail renders a navigable link, not a dead note.
assert.ok(html.includes('el("a", { class: "fix-link", href: c.fixScreen }'), "routed check renders an anchor to its fix screen");
assert.ok(html.includes('"Open " + c.fixLabel'), "routed link copy names the fix screen");

// Creator-facing copy names both owning screens.
assert.ok(html.includes("layout safe areas") && html.includes("speaker framing safety"), "fix copy names both screens in creator language");

console.log("canvas layer controls: layout guardrails route to their fix screens");
