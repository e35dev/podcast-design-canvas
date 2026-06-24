"use strict";

// Guards transcript glossary hand-off links (#583): low-confidence spelling reviews
// open the screen that owns caption quality fixes.
// Run with: `node prototype/transcript-glossary-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const dir = __dirname;
const html = fs.readFileSync(path.join(dir, "transcript-glossary.html"), "utf8");

assert.ok(html.includes('openLink = document.createElement("a")'), "glossary issues render an open-fix-screen link");
assert.ok(html.includes("openLink.href = issue.fixScreen"), "open link routes to the owning fix screen");

const fixScreens = [...html.matchAll(/fixScreen:\s*"([a-z0-9-]+\.html)"/g)].map((m) => m[1]);
assert.ok(fixScreens.length >= 1, "glossary issues declare fix screens");
for (const file of fixScreens) {
  assert.ok(fs.existsSync(path.join(dir, file)), `fix screen exists: ${file}`);
}

assert.ok(
  fixScreens.includes("audio-caption-quality-review.html"),
  "low-confidence spelling review routes to caption quality review",
);

console.log(`transcript glossary: ${fixScreens.length} issue paths open their owning fix screen`);
