"use strict";

// Creator-facing copy guard for preview shell files (#584).
// Blocks internal pipeline language from reaching the primary creator path.
// Run with: `node preview/copy-guard.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const previewDir = __dirname;
const forbidden = [
  /which surface owns/i,
  /owning surface/i,
  /\bpipeline\b/i,
  /\bmanifest\b/i,
  /\bencoder\b/i,
  /\btimecode/i,
  /internal production mechanics/i,
];

const targets = fs
  .readdirSync(previewDir)
  .filter((name) => name.endsWith(".html"))
  .map((name) => path.join(previewDir, name));

assert.ok(targets.length > 0, "preview html files exist for copy guard");

for (const filePath of targets) {
  const html = fs.readFileSync(filePath, "utf8");
  const name = path.basename(filePath);
  for (const pattern of forbidden) {
    const match = html.match(pattern);
    assert.ok(!match, `${name} must not include internal copy: ${match && match[0]}`);
  }
}

console.log("preview copy guard: all assertions passed");
