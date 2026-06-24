"use strict";

// Regression guard: path nav scripts must not double-inject nav bars (#584).
// Run with: `node preview/nav-idempotency.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const previewDir = __dirname;

const navGuards = [
  { file: "publish-nav.js", className: "publish-nav" },
  { file: "style-nav.js", className: "style-nav" },
  { file: "visuals-nav.js", className: "visuals-nav" },
  { file: "reuse-nav.js", className: "reuse-nav" },
  { file: "tools-nav.js", className: "tools-nav" },
];

for (const { file, className } of navGuards) {
  const source = fs.readFileSync(path.join(previewDir, file), "utf8");
  assert.match(
    source,
    new RegExp(`document\\.querySelector\\("\\.${className}"\\)`),
    `${file} guards against double render of .${className}`,
  );
}

console.log("nav idempotency: path nav scripts guard against double injection");
