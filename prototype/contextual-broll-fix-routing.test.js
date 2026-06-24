"use strict";

// Guards contextual B-roll hand-off links (#583): weak-context and back-to-back
// title reviews open the screen that owns each fix.
// Run with: `node prototype/contextual-broll-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const dir = __dirname;
const html = fs.readFileSync(path.join(dir, "contextual-broll-moments.html"), "utf8");

assert.ok(html.includes('openLink = document.createElement("a")'), "B-roll issues render an open-fix-screen link");
assert.ok(html.includes("fixUrl.searchParams.set"), "open link carries a routed payload to the fix screen");

const fixScreens = [...html.matchAll(/fixScreen:\s*"([a-z0-9-]+\.html)"/g)].map((m) => m[1]);
assert.ok(fixScreens.length >= 2, "B-roll issues declare fix screens");
for (const file of fixScreens) {
  assert.ok(fs.existsSync(path.join(dir, file)), `fix screen exists: ${file}`);
}

assert.ok(
  fixScreens.includes("social-context-intake.html"),
  "weak-context moments route to social context intake",
);
assert.ok(
  fixScreens.includes("contextual-title-cards.html"),
  "back-to-back title cards route to title cards screen",
);

assert.ok(html.includes("fixPayload"), "weak-context issues carry a fix payload");
assert.ok(html.includes("scoreMomentContext"), "evaluate() integrates the context scorer");
assert.ok(
  fs.existsSync(path.join(dir, "broll-context-scorer.js")),
  "broll-context-scorer.js exists",
);

console.log(`contextual B-roll: ${fixScreens.length} issue paths open their owning fix screen`);
