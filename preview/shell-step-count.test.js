"use strict";

// Keeps the preview shell episode list aligned with the guided flow (#582 / #584).
// Run with: `node preview/shell-step-count.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const shell = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const flow = fs.readFileSync(path.join(__dirname, "episode-flow.html"), "utf8");

const episodePath = [
  "prototype/episode-readiness.html",
  "prototype/speaker-role-mapping.html",
  "prototype/source-media-health.html",
  "prototype/speaker-sync-repair.html",
  "prototype/audio-cleanup-controls.html",
  "prototype/audio-caption-quality-review.html",
  "prototype/export-readiness-review.html",
];

const shellLinks = [...shell.matchAll(/\.\.\/(prototype\/[a-z0-9-]+\.html)/g)].map((m) => m[1]);
const firstPath = shellLinks.slice(0, episodePath.length);
assert.deepStrictEqual(firstPath, episodePath, "preview shell lists the seven-step episode path in order");

const guidedSteps = [...flow.matchAll(/\{\s*id:\s*"[a-z0-9-]+",\s*title:\s*"([^"]+)"\s*\}/g)].map((m) => m[1]);
assert.strictEqual(guidedSteps.length, 7, "guided flow has seven steps");
assert.ok(shell.includes("seven connected steps"), "preview shell CTA matches the seven-step guided flow");

console.log("preview shell step count: aligned with guided flow");
