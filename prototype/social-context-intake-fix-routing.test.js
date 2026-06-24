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
assert.ok(html.includes('id="context-request" class="context-request" hidden'), "context intake can show a B-roll context request");
assert.ok(html.includes("const contextRequest = incomingContextRequest();"), "context intake reads B-roll handoff params");
assert.ok(
  html.includes("title.textContent = `B-roll moment ${contextRequest.moment} needs clearer context`;"),
  "context request title is rendered with textContent",
);
assert.ok(
  html.includes("detail.textContent = contextRequest.reason;"),
  "context request reason is rendered with textContent",
);
assert.ok(html.includes("function linksWithContextRequest()"), "context intake preloads a link row from B-roll context");
assert.ok(html.includes('id: "k-broll-context"'), "preloaded context row has a stable id");
assert.ok(html.includes('platform: "company"'), "preloaded context row starts on a source type that can carry company/project context");
assert.ok(html.includes("requestNote.textContent = link.request;"), "preloaded context row renders request text safely");
assert.ok(
  !/contextRequestElement\.innerHTML/.test(html),
  "context request never injects URL params through innerHTML",
);
assert.ok(!/requestNote\.innerHTML/.test(html), "preloaded context row never injects URL params through innerHTML");

const fixScreens = [...html.matchAll(/fixScreen:\s*"([a-z0-9-]+\.html)"/g)].map((m) => m[1]);
assert.ok(fixScreens.length >= 1, "context intake issues declare fix screens");
for (const file of fixScreens) {
  assert.ok(fs.existsSync(path.join(dir, file)), `fix screen exists: ${file}`);
}

assert.ok(
  fixScreens.includes("speaker-role-mapping.html"),
  "unassigned speaker bucket routes to speaker role mapping",
);

console.log(`social context intake: ${fixScreens.length} issue paths open their owning fix screen`);
