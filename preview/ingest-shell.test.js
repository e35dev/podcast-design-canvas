"use strict";

// Preview shell ingest routing guard (#582 / #583 / #584).
// Run with: `node preview/ingest-shell.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const shell = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const root = path.join(__dirname, "..");

const ingestSteps = [
  "prototype/episode-readiness.html",
  "prototype/speaker-role-mapping.html",
  "prototype/social-context-intake.html",
];

let lastIndex = -1;
for (const step of ingestSteps) {
  const at = shell.indexOf(step);
  assert.ok(at !== -1, `preview shell links to ${step}`);
  assert.ok(at > lastIndex, `preview shell keeps ingest order for ${step}`);
  assert.ok(fs.existsSync(path.join(root, step)), `${step} exists for preview routing`);
  lastIndex = at;

  const html = fs.readFileSync(path.join(root, step), "utf8");
  assert.ok(html.includes("../preview/ingest-nav.js"), `${step} loads ingest navigation`);
}

assert.ok(shell.includes("Ingest setup"), "preview shell labels the ingest setup section");
assert.ok(shell.includes("Core episode path"), "preview shell labels the core episode path");
assert.ok(shell.includes("seven connected steps"), "preview shell matches the guided flow step count");

console.log("preview shell ingest routing: all assertions passed");
