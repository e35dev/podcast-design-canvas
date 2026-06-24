"use strict";

// Guards the export-readiness fix-screen links (#582 / #583): each readiness area that
// can be flagged routes to the screen where it gets fixed, and every target exists.
// Run with: `node prototype/export-readiness-review.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const dir = __dirname;
const html = fs.readFileSync(path.join(dir, "export-readiness-review.html"), "utf8");

// The issue renderer offers a fix link.
assert.ok(html.includes("Fix in ${issue.fix.label}"), "issues render a fix-screen link");
assert.ok(html.includes('fix.href = issue.fix.file'), "fix link routes to the fix screen file");

// Every fix target declared in the check list resolves to a real sibling screen.
const checkBlock = html.match(/const checkList = \[([\s\S]*?)\];/);
assert.ok(checkBlock, "check list is present");
const fixFiles = [...checkBlock[1].matchAll(/fix:\s*\{\s*file:\s*"([a-z0-9-]+\.html)"/g)].map((m) => m[1]);
assert.ok(fixFiles.length >= 5, "most readiness areas point at a fix screen");
for (const file of fixFiles) {
  assert.ok(
    fs.existsSync(path.join(dir, file)),
    `fix screen exists: ${file}`,
  );
}

// The fix link is built with DOM APIs, not injected as markup.
assert.ok(!/innerHTML\s*=\s*`?[^;]*fix-link/.test(html), "fix link is not built via innerHTML");

console.log(`export readiness: ${fixFiles.length} readiness areas routed to existing fix screens`);
