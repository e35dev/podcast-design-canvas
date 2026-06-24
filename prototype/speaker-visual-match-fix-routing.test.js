"use strict";

// Guards speaker visual match hand-off links (#583): guest track review routes
// to the screen that owns imported media health fixes.
// Run with: `node prototype/speaker-visual-match-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const dir = __dirname;
const html = fs.readFileSync(path.join(dir, "speaker-visual-match.html"), "utf8");

assert.ok(html.includes('openLink = document.createElement("a")'), "speaker match issues render an open-fix-screen link");
assert.ok(html.includes("openLink.href = issue.fixScreen"), "open link routes to the owning fix screen");

const fixScreens = [...html.matchAll(/fixScreen:\s*"([a-z0-9-]+\.html)"/g)].map((m) => m[1]);
assert.ok(fixScreens.length >= 1, "speaker match issues declare fix screens");
for (const file of fixScreens) {
  assert.ok(fs.existsSync(path.join(dir, file)), `fix screen exists: ${file}`);
}

assert.ok(
  fixScreens.includes("source-media-health.html"),
  "mismatched guest track review routes to source media health",
);

console.log(`speaker visual match: ${fixScreens.length} issue paths open their owning fix screen`);
