"use strict";

// Guards social context intake hand-off links (#583): unassigned speaker bucket
// reviews open the screen that owns role assignment.
// Run with: `node prototype/social-context-intake-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const dir = __dirname;
const html = fs.readFileSync(path.join(dir, "social-context-intake.html"), "utf8");

assert.ok(html.includes('openLink = document.createElement("a")'), "context intake issues render an open-fix-screen link");
assert.ok(html.includes("openLink.href = issue.fixScreen"), "open link routes to the owning fix screen");

const fixScreens = [...html.matchAll(/fixScreen:\s*"([a-z0-9-]+\.html)"/g)].map((m) => m[1]);
assert.ok(fixScreens.length >= 1, "context intake issues declare fix screens");
for (const file of fixScreens) {
  assert.ok(fs.existsSync(path.join(dir, file)), `fix screen exists: ${file}`);
}

assert.ok(
  fixScreens.includes("speaker-role-mapping.html"),
  "unassigned speaker bucket routes to speaker role mapping",
);

// #757: when routed from a weak-context B-roll moment (?moment=&reason=), the screen
// pre-populates a note explaining which moment to ground.
assert.ok(html.includes("URLSearchParams"), "intake reads the routed payload from the URL");
assert.ok(html.includes('params.get("moment")') && html.includes('params.get("reason")'), "intake reads the moment and reason");
assert.ok(html.includes('id="routedNote"'), "intake shows a routed-context note");
assert.ok(html.includes("function showRoutedContext"), "intake pre-populates from the routed payload");

console.log(`social context intake: ${fixScreens.length} issue paths open their owning fix screen; pre-populates from B-roll routing`);
