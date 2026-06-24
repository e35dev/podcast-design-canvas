"use strict";

// Keyboard focus-visibility guard for the preview shell (#581), screen
// catalog entry (linked from the shell), and shared path navigation scripts.
// Run with: `node preview/shell-focus-visible.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const previewDir = __dirname;
const shellFiles = [
  path.join(previewDir, "..", "index.html"),
  ...fs
    .readdirSync(previewDir)
    .filter((name) => name.endsWith(".html") || name.endsWith("-nav.js"))
    .map((name) => path.join(previewDir, name)),
];

assert.ok(shellFiles.length > 0, "preview shell and path-nav files exist for focus guard");

const ruleBlock = /([^{}]+)\{([^{}]*)\}/g;

let checkedFocusRules = 0;

for (const filePath of shellFiles) {
  const css = fs.readFileSync(filePath, "utf8");
  const name = path.relative(path.join(previewDir, ".."), filePath);
  let match;
  while ((match = ruleBlock.exec(css)) !== null) {
    const selector = match[1];
    const body = match[2];
    if (!selector.includes(":focus-visible")) {
      continue;
    }
    checkedFocusRules += 1;

    const stripsOutline = /outline\s*:\s*none/i.test(body);
    assert.ok(
      !stripsOutline,
      `${name}: a :focus-visible rule sets "outline: none", removing the keyboard focus ring (${selector.trim()})`,
    );

    const hasVisibleOutline = /outline\s*:\s*[^;]*\b\d/i.test(body);
    assert.ok(
      hasVisibleOutline,
      `${name}: a :focus-visible rule must declare a visible outline (${selector.trim()})`,
    );
  }
}

assert.ok(checkedFocusRules > 0, "found :focus-visible rules to verify in the shell and path nav");

console.log(`shell focus-visible guard: ${checkedFocusRules} focus rules verified across catalog, shell, and path nav`);
