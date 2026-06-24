"use strict";

// Guards show template adaptation hand-off links (#583): template decisions that
// need another screen open the owning fix screen.
// Run with: `node prototype/show-template-adaptation-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const dir = __dirname;
const html = fs.readFileSync(path.join(dir, "show-template-adaptation.html"), "utf8");

assert.ok(html.includes("../preview/reuse-nav.js"), "show template adaptation loads reuse path navigation");
assert.ok(html.includes('openLink = document.createElement("a")'), "template issues render an open-fix-screen link");
assert.ok(html.includes("openLink.href = issue.fixScreen"), "open link routes to the owning fix screen");

const areaBlock = html.match(/const areas = \{([\s\S]*?)\};/);
assert.ok(areaBlock, "show template areas are declared");
const fixScreens = [...areaBlock[1].matchAll(/fixScreen:\s*"([a-z0-9-]+\.html)"/g)].map((m) => m[1]);
assert.ok(fixScreens.length >= 2, "template areas declare fix screens");
for (const file of fixScreens) {
  assert.ok(fs.existsSync(path.join(dir, file)), `fix screen exists: ${file}`);
}

assert.ok(
  fixScreens.includes("speaker-role-mapping.html"),
  "speaker role template decision routes to speaker role mapping",
);
assert.ok(
  fixScreens.includes("social-context-intake.html"),
  "lower-third template decision routes to social context intake",
);

console.log(`show template adaptation: ${fixScreens.length} template areas open their owning fix screen`);
