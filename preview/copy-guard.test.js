"use strict";

// Creator-facing copy guard for preview shell and prototype screens (#584).
// Run with: `node preview/copy-guard.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const previewDir = __dirname;
const previewForbidden = [
  /which surface owns/i,
  /owning surface/i,
  /\bpipeline\b/i,
  /\bmanifest\b/i,
  /\bencoder\b/i,
  /\btimecode/i,
  /internal production mechanics/i,
  /opens the surface/i,
  /surface that owns/i,
];

const prototypeForbidden = [
  /which surface owns/i,
  /owning surface/i,
  /opens the surface/i,
  /surface that owns/i,
  /internal production mechanics/i,
];

const previewTargets = fs
  .readdirSync(previewDir)
  .filter((name) => name.endsWith(".html"))
  .map((name) => path.join(previewDir, name));

const prototypeTargets = fs
  .readdirSync(path.join(previewDir, "..", "prototype"))
  .filter((name) => name.endsWith(".html"))
  .map((name) => path.join(previewDir, "..", "prototype", name));

assert.ok(previewTargets.length > 0, "preview html files exist for copy guard");

for (const filePath of previewTargets) {
  const html = fs.readFileSync(filePath, "utf8");
  const name = path.basename(filePath);
  for (const pattern of previewForbidden) {
    const match = html.match(pattern);
    assert.ok(!match, `${name} must not include internal copy: ${match && match[0]}`);
  }
}

for (const filePath of prototypeTargets) {
  const html = fs.readFileSync(filePath, "utf8");
  const name = `prototype/${path.basename(filePath)}`;
  for (const pattern of prototypeForbidden) {
    const match = html.match(pattern);
    assert.ok(!match, `${name} must not include internal copy: ${match && match[0]}`);
  }
}

console.log("preview copy guard: all assertions passed");
