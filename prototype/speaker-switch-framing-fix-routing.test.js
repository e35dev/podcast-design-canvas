"use strict";

// Guards speaker switch framing hand-off links (#583): b-roll and sponsor
// overlaps route to long-form episode navigation, and static-stretch review
// states route to the preset style picker.
// Run with: `node prototype/speaker-switch-framing-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(__dirname, "speaker-switch-framing.html"), "utf8");
const shell = fs.readFileSync(path.join(root, "preview", "index.html"), "utf8");
const styleNav = fs.readFileSync(path.join(root, "preview", "style-nav.js"), "utf8");
const publishNav = fs.readFileSync(path.join(root, "preview", "publish-nav.js"), "utf8");

assert.ok(
  shell.includes("../prototype/speaker-switch-framing.html"),
  "speaker switch framing is reachable from the preview shell",
);
assert.ok(
  styleNav.includes('id: "speaker-switch-framing"'),
  "speaker switch framing is part of the connected style path",
);

assert.ok(
  shell.includes("../prototype/long-form-navigation.html"),
  "long-form episode navigation is reachable from the preview shell",
);
assert.ok(
  publishNav.includes("long-form-navigation.html"),
  "long-form episode navigation is part of the connected publish path",
);
assert.ok(
  html.includes('fixScreen: "long-form-navigation.html"'),
  "b-roll and sponsor overlap conflicts route to long-form episode navigation",
);
assert.ok(
  html.includes('fixLabel: "long-form episode navigation"'),
  "long-form navigation route names the fix screen in creator-facing copy",
);
assert.ok(
  fs.existsSync(path.join(__dirname, "long-form-navigation.html")),
  "long-form episode navigation exists as a real screen",
);

assert.ok(
  shell.includes("../prototype/preset-style-picker.html"),
  "preset style picker is reachable from the preview shell",
);
assert.ok(
  html.includes('fixScreen: "preset-style-picker.html"'),
  "static-stretch review state routes to the preset style picker",
);
assert.ok(
  html.includes('fixLabel: "preset style picker"'),
  "preset style picker route names the fix screen in creator-facing copy",
);
assert.ok(
  fs.existsSync(path.join(__dirname, "preset-style-picker.html")),
  "preset style picker exists as a real screen",
);

assert.ok(html.includes('action.className = "fix-link"'), "speaker switch framing renders fix links with shared styling");
assert.ok(html.includes("issue.fixScreen && issue.fixLabel"), "fix link rendering requires target and label");
assert.ok(html.includes("action.href = issue.fixScreen"), "fix link points to the owning fix screen");

console.log("speaker switch framing: b-roll/sponsor overlap opens long-form episode navigation");
console.log("speaker switch framing: static stretch opens preset style picker");
