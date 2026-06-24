"use strict";

// Guards export readiness hand-off links (#583): placed music cue warnings open
// intro and outro builder, where intro/outro music and sponsor-safe wording
// are adapted before export.
// Run with: `node prototype/export-readiness-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(__dirname, "export-readiness-review.html"), "utf8");
const shell = fs.readFileSync(path.join(root, "preview", "index.html"), "utf8");
const episodeFlowNav = fs.readFileSync(path.join(root, "preview", "episode-flow-nav.js"), "utf8");
const reuseNav = fs.readFileSync(path.join(root, "preview", "reuse-nav.js"), "utf8");

assert.ok(
  shell.includes("../prototype/export-readiness-review.html"),
  "export readiness review is reachable from the preview shell",
);
assert.ok(
  episodeFlowNav.includes("export-readiness-review.html"),
  "export readiness review is part of the connected episode flow path",
);
assert.ok(
  shell.includes("../prototype/intro-outro-builder.html"),
  "intro and outro builder is reachable from the preview shell",
);
assert.ok(
  reuseNav.includes('id: "intro-outro-builder"'),
  "intro and outro builder is part of the connected reuse path",
);

assert.ok(
  html.includes('id: "music"') && html.includes('fixScreen: "intro-outro-builder.html"'),
  "music cue readiness routes to intro and outro builder",
);
assert.ok(html.includes("openLink.href = issue.fixScreen"), "export readiness fix links use the issue fix screen");
assert.ok(html.includes('openLink.className = "fix-link"'), "export readiness fix links are class-tagged");
assert.ok(
  fs.existsSync(path.join(__dirname, "intro-outro-builder.html")),
  "intro and outro builder exists as a real screen",
);

console.log("export readiness review: music cue warnings open intro and outro builder");
