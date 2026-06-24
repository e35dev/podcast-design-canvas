"use strict";

// Consistency guard for the connected episode flow (#582 / #583 / #584).
// The core flow is described in three places — the shell list, the shared nav script,
// and the flow page. This test keeps them from silently drifting apart, and confirms
// each core-flow prototype actually wires in the shared back-to-shell nav.
// Run with: `node preview/flow-consistency.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const read = (rel) => fs.readFileSync(path.join(__dirname, rel), "utf8");

const navJs = read("episode-flow-nav.js");
const shell = read("index.html");

// 1) The ordered core flow as declared by the shared nav script.
const navFlow = [...navJs.matchAll(/file:\s*"([a-z0-9-]+\.html)"/g)].map((m) => m[1]);
assert.ok(navFlow.length >= 4, "nav script declares the core flow steps");

// 2) The ordered core flow as listed in the shell's <ol class="flow"> block.
const flowBlock = shell.match(/<ol class="flow">([\s\S]*?)<\/ol>/);
assert.ok(flowBlock, "shell has a core flow list");
const shellFlow = [...flowBlock[1].matchAll(/\.\.\/prototype\/([a-z0-9-]+\.html)/g)].map((m) => m[1]);

// 3) The shell lists the full guided path; its core tail matches the nav script.
const expectedShellFlow = ["episode-readiness.html", "speaker-role-mapping.html", ...navFlow];
assert.deepStrictEqual(
  shellFlow,
  expectedShellFlow,
  "shell episode path matches ingest setup plus the shared nav order",
);
assert.deepStrictEqual(
  shellFlow.slice(-navFlow.length),
  navFlow,
  "shell core-flow tail matches the shared nav script order",
);

// 4) Every core-flow prototype exists and wires in the shared nav.
for (const file of navFlow) {
  const filePath = path.join(root, "prototype", file);
  assert.ok(fs.existsSync(filePath), `core-flow prototype exists: ${file}`);
  const html = fs.readFileSync(filePath, "utf8");
  assert.ok(
    html.includes("preview/episode-flow-nav.js"),
    `core-flow prototype includes the shared nav: ${file}`,
  );
}

// 5) The guided flow may add ingest preamble steps before the core prototype path.
const flowPage = read("episode-flow.html");
const stepDefs = [...flowPage.matchAll(/\{\s*id:\s*"[a-z0-9-]+",\s*title:\s*"([^"]+)"\s*\}/g)].map((m) => m[1]);
const coreFlow = [
  "Source media health",
  "Speaker sync",
  "Audio cleanup",
  "Caption review",
  "Export readiness",
];
assert.ok(stepDefs.length >= coreFlow.length, "guided flow includes the core prototype path");

let coreIndex = 0;
for (const title of stepDefs) {
  if (title === coreFlow[coreIndex]) {
    coreIndex += 1;
  }
}
assert.strictEqual(
  coreIndex,
  coreFlow.length,
  "guided flow keeps core step order after any ingest preamble",
);

console.log(`flow consistency: ${navFlow.length} core steps aligned across shell, nav, and flow page`);
