"use strict";

// Guards layout safe areas hand-off links (#583): review-watermark overlap reviews
// open the client review copy flow; face-area overlap reviews open speaker framing safety.
// Run with: `node prototype/layout-safe-areas-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(__dirname, "layout-safe-areas.html"), "utf8");
const shell = fs.readFileSync(path.join(root, "preview", "index.html"), "utf8");
const styleNav = fs.readFileSync(path.join(root, "preview", "style-nav.js"), "utf8");
const publishNav = fs.readFileSync(path.join(root, "preview", "publish-nav.js"), "utf8");

assert.ok(
  shell.includes("../prototype/layout-safe-areas.html"),
  "layout safe areas is reachable from the preview shell",
);
assert.ok(
  styleNav.includes('id: "layout-safe-areas"'),
  "layout safe areas is part of the connected visual direction path",
);
assert.ok(
  shell.includes("../prototype/client-review-copy-flow.html"),
  "client review copy flow is reachable from the preview shell",
);
assert.ok(
  publishNav.includes('id: "client-review-copy-flow"'),
  "client review copy flow is part of the connected publish prep path",
);

assert.ok(
  html.includes('fixScreen: "client-review-copy-flow.html"'),
  "review watermark overlap routes to the review copy flow",
);
assert.ok(
  html.includes('fixLabel: "review copy flow"'),
  "review watermark overlap names the fix screen in creator-facing copy",
);
assert.ok(
  shell.includes("../prototype/speaker-framing-safety.html"),
  "speaker framing safety is reachable from the preview shell",
);
assert.ok(
  styleNav.includes('id: "speaker-framing-safety"'),
  "speaker framing safety is part of the connected visual direction path",
);
assert.ok(
  html.includes('fixScreen: "speaker-framing-safety.html"'),
  "face-area overlap routes to speaker framing safety",
);
assert.ok(
  html.includes('fixLabel: "speaker framing safety"'),
  "face-area overlap names the fix screen in creator-facing copy",
);
assert.ok(
  fs.existsSync(path.join(__dirname, "client-review-copy-flow.html")),
  "client review copy flow exists as a real screen",
);
assert.ok(
  fs.existsSync(path.join(__dirname, "speaker-framing-safety.html")),
  "speaker framing safety exists as a real screen",
);
assert.ok(
  html.includes('fixScreen: "accessibility-readability-checks.html"'),
  "too-small (unreadable) elements route to accessibility & readability checks",
);
assert.ok(
  html.includes('fixLabel: "accessibility & readability checks"'),
  "the unreadable route names the fix screen in creator-facing copy",
);
assert.ok(
  fs.existsSync(path.join(__dirname, "accessibility-readability-checks.html")),
  "accessibility & readability checks exists as a real screen",
);
assert.ok(
  shell.includes("../prototype/accessibility-readability-checks.html"),
  "accessibility & readability checks is reachable from the preview shell",
);
assert.ok(
  shell.includes("../prototype/canvas-layer-controls.html"),
  "canvas layer controls is reachable from the preview shell",
);
assert.ok(
  styleNav.includes('id: "canvas-layer-controls"'),
  "canvas layer controls is part of the connected visual direction path",
);
assert.ok(
  html.includes('fixScreen: "canvas-layer-controls.html"'),
  "element overlap routes to canvas layer controls",
);
assert.ok(
  html.includes('fixLabel: "canvas layer controls"'),
  "element overlap names the fix screen in creator-facing copy",
);
assert.ok(
  fs.existsSync(path.join(__dirname, "canvas-layer-controls.html")),
  "canvas layer controls exists as a real screen",
);

assert.ok(html.includes('openLink.className = "fix-link"'), "layout safe areas renders fix links with shared styling");
assert.ok(html.includes("issue.fixScreen && issue.fixLabel"), "fix link rendering requires target and label");

console.log("layout safe areas: review watermark overlap opens the review copy flow");
console.log("layout safe areas: face-area overlap opens speaker framing safety");
console.log("layout safe areas: too-small elements open accessibility & readability checks");
console.log("layout safe areas: element overlap opens canvas layer controls");
