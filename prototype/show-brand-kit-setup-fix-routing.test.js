"use strict";

// Guards show brand kit setup hand-off links (#583): low-contrast brand colors
// route to canvas layer controls, and logo-over-face conflicts route to speaker
// framing safety.
// Run with: `node prototype/show-brand-kit-setup-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(__dirname, "show-brand-kit-setup.html"), "utf8");
const shell = fs.readFileSync(path.join(root, "preview", "index.html"), "utf8");
const styleNav = fs.readFileSync(path.join(root, "preview", "style-nav.js"), "utf8");

assert.ok(
  shell.includes("../prototype/show-brand-kit-setup.html"),
  "show brand kit setup is reachable from the preview shell",
);
assert.ok(
  styleNav.includes('id: "show-brand-kit-setup"'),
  "show brand kit setup is part of the connected style path",
);

assert.ok(
  shell.includes("../prototype/canvas-layer-controls.html"),
  "canvas layer controls is reachable from the preview shell",
);
assert.ok(
  styleNav.includes("canvas-layer-controls.html"),
  "canvas layer controls is part of the connected style path",
);
assert.ok(
  html.includes('fixScreen: "canvas-layer-controls.html"'),
  "low-contrast brand color routes to canvas layer controls",
);
assert.ok(
  html.includes('fixLabel: "canvas layer controls"'),
  "canvas layer controls route names the fix screen in creator-facing copy",
);
assert.ok(
  fs.existsSync(path.join(__dirname, "canvas-layer-controls.html")),
  "canvas layer controls exists as a real screen",
);

assert.ok(
  shell.includes("../prototype/speaker-framing-safety.html"),
  "speaker framing safety is reachable from the preview shell",
);
assert.ok(
  styleNav.includes("speaker-framing-safety.html"),
  "speaker framing safety is part of the connected style path",
);
assert.ok(
  html.includes('fixScreen: "speaker-framing-safety.html"'),
  "logo-over-face conflict routes to speaker framing safety",
);
assert.ok(
  html.includes('fixLabel: "speaker framing safety"'),
  "speaker framing safety route names the fix screen in creator-facing copy",
);
assert.ok(
  fs.existsSync(path.join(__dirname, "speaker-framing-safety.html")),
  "speaker framing safety exists as a real screen",
);

assert.ok(html.includes('action.className = "fix-link"'), "show brand kit renders fix links with shared styling");
assert.ok(html.includes("issue.fixScreen && issue.fixLabel"), "fix link rendering requires target and label");
assert.ok(html.includes("action.href = issue.fixScreen"), "fix link points to the owning fix screen");

console.log("show brand kit setup: low-contrast color opens canvas layer controls");
console.log("show brand kit setup: logo-over-face conflict opens speaker framing safety");
