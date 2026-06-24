"use strict";

// Guards contextual title card hand-off links (#583): low-confidence context reviews
// open the screen that owns the underlying social context fix.
// Run with: `node prototype/contextual-title-cards-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const dir = __dirname;
const html = fs.readFileSync(path.join(dir, "contextual-title-cards.html"), "utf8");

assert.ok(html.includes('openLink = document.createElement("a")'), "title card issues render an open-fix-screen link");
assert.ok(html.includes("openLink.href = issue.fixScreen"), "open link routes to the owning fix screen");

const fixScreens = [...html.matchAll(/fixScreen:\s*"([a-z0-9-]+\.html)"/g)].map((m) => m[1]);
assert.ok(fixScreens.length >= 1, "title card issues declare fix screens");
for (const file of fixScreens) {
  assert.ok(fs.existsSync(path.join(dir, file)), `fix screen exists: ${file}`);
}

assert.ok(
  fixScreens.includes("social-context-intake.html"),
  "weak-context title reviews route to social context intake",
);

console.log(`contextual title cards: ${fixScreens.length} issue paths open their owning fix screen`);
