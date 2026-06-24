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
assert.ok(html.includes("issue.fixScreen") && html.includes("issue.fixQuery"), "open link routes to the owning fix screen, with an optional payload");

// #757: weak-context classification is driven by the scoring engine, not a static stub,
// and the social-context route carries the moment timestamp + reason as a payload.
assert.ok(html.includes("BrollContextScorer.scoreMoment"), "weak context comes from the scoring engine");
assert.ok(html.includes("broll-context-scorer.js"), "the scoring engine is loaded");
assert.ok(/moment=\$\{encodeURIComponent/.test(html), "weak route carries the moment timestamp");
assert.ok(/reason=\$\{encodeURIComponent/.test(html), "weak route carries the weak-context reason");

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

console.log(`contextual B-roll: ${fixScreens.length} issue paths open their owning fix screen`);
