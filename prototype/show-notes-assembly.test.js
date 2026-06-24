"use strict";

// Guards the show-notes hand-off links (#583): a section that needs confirmed source
// opens the screen that owns it — chapters -> episode chapter markers, guest links ->
// guest profile reuse.
// Run with: `node prototype/show-notes-assembly.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const dir = __dirname;
const html = fs.readFileSync(path.join(dir, "show-notes-assembly.html"), "utf8");

// The issue renderer opens the owning source screen via a real link.
assert.ok(html.includes('openLink = document.createElement("a")'), "needs-source issues render an open link");
assert.ok(html.includes("openLink.href = issue.fixScreen"), "open link routes to the owning screen");
assert.ok(html.includes("issue.fixScreen = section.fixScreen") || /fixScreen: section\.fixScreen/.test(html), "needs-source issue carries the section's fix screen");

// Each declared fix screen resolves to a real sibling screen.
const fixScreens = [...html.matchAll(/fixScreen:\s*"([a-z0-9-]+\.html)"/g)].map((m) => m[1]);
assert.ok(fixScreens.includes("episode-chapter-markers.html"), "chapters route to episode chapter markers");
assert.ok(fixScreens.length >= 2, "at least the chapters and guests sections name a source screen");
for (const file of fixScreens) {
  assert.ok(fs.existsSync(path.join(dir, file)), `source screen exists: ${file}`);
}

console.log(`show notes: ${fixScreens.length} sections open their owning source screen`);
