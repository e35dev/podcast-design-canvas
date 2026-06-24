"use strict";

// Smoke tests for the browser preview shell and connected episode flow (#581 / #583 / #584).
// Run with: `node preview/preview.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const shellPath = path.join(__dirname, "index.html");
const navPath = path.join(__dirname, "episode-flow-nav.js");
const html = fs.readFileSync(shellPath, "utf8");
const navSource = fs.readFileSync(navPath, "utf8");

const flowSteps = [
  "prototype/episode-readiness.html",
  "prototype/source-media-health.html",
  "prototype/speaker-role-mapping.html",
  "prototype/speaker-sync-repair.html",
  "prototype/audio-cleanup-controls.html",
  "prototype/audio-caption-quality-review.html",
  "prototype/export-readiness-review.html",
];

assert.match(html, /<title>Podcast Design Canvas — Preview<\/title>/, "preview shell has product title");
assert.match(html, /aria-label="Podcast Design Canvas preview shell"/, "preview shell exposes landmark label");

for (const step of flowSteps) {
  assert.ok(html.includes(step), `preview shell links to ${step}`);
  assert.ok(fs.existsSync(path.join(root, step)), `${step} exists for preview routing`);

  const prototypeHtml = fs.readFileSync(path.join(root, step), "utf8");
  assert.ok(
    prototypeHtml.includes("../preview/episode-flow-nav.js"),
    `${step} loads episode flow navigation`,
  );
}

for (const step of flowSteps) {
  const fileName = path.basename(step);
  assert.ok(navSource.includes(`"${fileName}"`), `episode flow nav lists ${fileName}`);
}

console.log("preview shell (episode flow smoke): all assertions passed");
