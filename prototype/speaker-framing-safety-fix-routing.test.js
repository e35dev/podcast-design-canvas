"use strict";

// Guards speaker framing review issues (#583): unresolved framing opens layout safe areas.
// Run with: `node prototype/speaker-framing-safety-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const html = fs.readFileSync(path.join(__dirname, "speaker-framing-safety.html"), "utf8");

assert.ok(html.includes("../preview/style-nav.js"), "speaker framing safety loads visual direction navigation");
assert.ok(
  html.includes('fixScreen: "layout-safe-areas.html"'),
  "unresolved framing issues route to layout safe areas",
);
assert.ok(
  html.includes('fixLabel: "layout safe areas"'),
  "framing issues name the fix screen in creator-facing copy",
);
assert.ok(html.includes("issue.fixScreen && issue.fixLabel"), "fix link renders only with routing metadata");
assert.ok(html.includes("openLink.href = issue.fixScreen"), "fix link routes to the owning screen");
assert.ok(fs.existsSync(path.join(__dirname, "layout-safe-areas.html")), "layout safe areas exists as a real screen");

console.log("speaker framing safety: unresolved framing opens layout safe areas");
