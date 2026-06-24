"use strict";

// Guards that secondary tool screens link back to the preview shell (#583 / #584).
// Run with: `node preview/tools-nav.test.js` (or `npm test`).

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const root = path.join(__dirname, "..");
const navScript = fs.readFileSync(path.join(__dirname, "tools-nav.js"), "utf8");

// The shared script parses and points back to the preview shell.
new vm.Script(navScript);
assert.ok(navScript.includes('home.href = "../preview/"'), "tools nav links back to the preview shell");
assert.ok(!/innerHTML/.test(navScript), "tools nav builds the DOM without innerHTML");

// The five core-flow screens use the richer episode-flow nav instead.
const coreFlow = new Set([
  "source-media-health.html",
  "speaker-sync-repair.html",
  "audio-cleanup-controls.html",
  "audio-caption-quality-review.html",
  "export-readiness-review.html",
]);

const ingestFlow = new Set([
  "episode-readiness.html",
  "speaker-role-mapping.html",
]);

const prototypes = fs
  .readdirSync(path.join(root, "prototype"))
  .filter((name) => name.endsWith(".html"));

let secondaryCount = 0;
for (const file of prototypes) {
  const html = fs.readFileSync(path.join(root, "prototype", file), "utf8");
  if (coreFlow.has(file)) {
    assert.ok(
      html.includes("episode-flow-nav.js"),
      `core-flow screen keeps its flow nav: ${file}`,
    );
    assert.ok(
      !html.includes("tools-nav.js"),
      `core-flow screen does not double up with tools nav: ${file}`,
    );
  } else if (ingestFlow.has(file)) {
    assert.ok(
      html.includes("../preview/ingest-nav.js"),
      `ingest screen uses ingest navigation: ${file}`,
    );
    assert.ok(
      !html.includes("../preview/tools-nav.js"),
      `ingest screen does not double up with tools nav: ${file}`,
    );
  } else {
    // Every secondary screen links back to the shell.
    assert.ok(
      html.includes("../preview/tools-nav.js"),
      `secondary screen links back to the shell: ${file}`,
    );
    secondaryCount += 1;
  }
}

assert.ok(secondaryCount > 0, "found secondary screens to check");

console.log(`tools nav: ${secondaryCount} secondary screens connected back to the preview shell`);
