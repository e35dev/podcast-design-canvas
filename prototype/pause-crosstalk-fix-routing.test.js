"use strict";

// Guards pause and cross-talk cleanup hand-off links (#583): review and caption-risk
// issues open the screen that owns each fix.
// Run with: `node prototype/pause-crosstalk-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const dir = __dirname;
const html = fs.readFileSync(path.join(dir, "pause-crosstalk-cleanup.html"), "utf8");

assert.ok(html.includes('openLink = document.createElement("a")'), "cleanup issues render an open-fix-screen link");
assert.ok(html.includes("openLink.href = issue.fixScreen"), "open link routes to the owning fix screen");

const fixScreens = [...html.matchAll(/fixScreen:\s*"([a-z0-9-]+\.html)"/g)].map((m) => m[1]);
assert.ok(fixScreens.length >= 2, "cleanup issues declare fix screens");
for (const file of fixScreens) {
  assert.ok(fs.existsSync(path.join(dir, file)), `fix screen exists: ${file}`);
}

assert.ok(
  fixScreens.includes("audio-caption-quality-review.html"),
  "caption-risk cross-talk routes to caption quality review",
);
assert.ok(
  fixScreens.includes("transcript-search-navigation.html"),
  "review moments route to transcript search",
);

console.log(`pause crosstalk cleanup: ${fixScreens.length} issue paths open their owning fix screen`);
