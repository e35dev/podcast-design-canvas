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
const episodeFlowMatch = navJs.match(/const EPISODE_FLOW = \[([\s\S]*?)\];/);
assert.ok(episodeFlowMatch, "nav script declares EPISODE_FLOW");
const navFlow = [...episodeFlowMatch[1].matchAll(/file:\s*"([a-z0-9-]+\.html)"/g)].map((m) => m[1]);
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

// 6) Export readiness hands forward into publish prep across nav and guided flow (#689).
const handoffMatch = navJs.match(/const EPISODE_HANDOFF = \{([^}]+)\};/);
assert.ok(handoffMatch, "nav script declares EPISODE_HANDOFF");
const handoffFile = handoffMatch[1].match(/file:\s*"([a-z0-9-]+\.html)"/)?.[1];
assert.equal(
  handoffFile,
  "episode-watch-through-preview.html",
  "episode flow nav publish handoff opens watch-through preview",
);
assert.ok(
  navJs.includes("EPISODE_HANDOFF.label"),
  "episode flow nav builds publish prep handoff copy from EPISODE_HANDOFF",
);
assert.ok(
  handoffMatch[1].includes('label: "Watch-through preview"'),
  "episode flow nav publish handoff uses watch-through preview label",
);

const publishPrepBlock = flowPage.match(/const publishPrepHandoff = \{([\s\S]*?)\};/);
assert.ok(publishPrepBlock, "guided flow declares publish prep handoff");
const flowHandoffFile = publishPrepBlock[1].match(/file:\s*"\.\.\/prototype\/([a-z0-9-]+\.html)"/)?.[1];
assert.equal(
  flowHandoffFile,
  handoffFile,
  "guided flow and nav script share the same publish prep target",
);
assert.ok(
  fs.existsSync(path.join(root, "prototype", handoffFile)),
  "publish prep handoff target exists",
);

console.log(`flow consistency: ${navFlow.length} core steps aligned across shell, nav, and flow page`);
