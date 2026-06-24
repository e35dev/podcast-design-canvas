"use strict";

// Keyboard focus guard for connected routing hand-off links (#583).
// Screens that route creators to a fix screen must keep a visible focus
// ring on :focus-visible — the same rule enforced for source-media-health
// in #702 and for preview shell links in #716 / #724.
// Run with: `node prototype/routing-link-focus-visible.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const prototypeDir = __dirname;
const linkClassPattern = /(?:routed-link|fix-link|handoff-link)/;
const ruleBlock = /([^{}]+)\{([^{}]*)\}/g;

const targets = fs
  .readdirSync(prototypeDir)
  .filter((name) => name.endsWith(".html"))
  .map((name) => path.join(prototypeDir, name))
  .filter((filePath) => {
    const html = fs.readFileSync(filePath, "utf8");
    return linkClassPattern.test(html);
  });

assert.ok(targets.length > 0, "prototype screens with routing links exist for focus guard");

let checkedFocusRules = 0;

for (const filePath of targets) {
  const css = fs.readFileSync(filePath, "utf8");
  const name = path.basename(filePath);
  let match;
  while ((match = ruleBlock.exec(css)) !== null) {
    const selector = match[1];
    const body = match[2];
    if (!selector.includes(":focus-visible") || !linkClassPattern.test(selector)) {
      continue;
    }
    checkedFocusRules += 1;

    const stripsOutline = /outline\s*:\s*none/i.test(body);
    assert.ok(
      !stripsOutline,
      `${name}: a routing-link :focus-visible rule sets "outline: none" (${selector.trim()})`,
    );

    const hasVisibleOutline = /outline\s*:\s*[^;]*\b\d/i.test(body);
    assert.ok(
      hasVisibleOutline,
      `${name}: a routing-link :focus-visible rule must declare a visible outline (${selector.trim()})`,
    );
  }
}

assert.ok(checkedFocusRules > 0, "found routing-link :focus-visible rules to verify");

console.log(`routing-link focus-visible guard: ${checkedFocusRules} focus rules verified`);
