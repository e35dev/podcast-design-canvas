"use strict";

// Smoke test for the connected episode flow (#582 / #584).
// Run with: `node preview/episode-flow.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const flowPath = path.join(__dirname, "episode-flow.html");
const shellPath = path.join(__dirname, "index.html");
const flow = fs.readFileSync(flowPath, "utf8");
const shell = fs.readFileSync(shellPath, "utf8");

// The shell routes to the connected flow.
assert.ok(shell.includes("episode-flow.html"), "preview shell links to the episode flow");

// The flow is a single page with the product title and a landmark.
assert.match(flow, /<title>Podcast Design Canvas — Episode flow<\/title>/, "flow has product title");
assert.match(flow, /aria-label="Podcast Design Canvas episode flow"/, "flow exposes a landmark label");

// All seven connected steps are present, in order, as one coherent path.
const stepTitles = [
  "Episode readiness",
  "Speaker roles",
  "Source media health",
  "Speaker sync",
  "Audio cleanup",
  "Caption review",
  "Export readiness",
];
let lastIndex = -1;
for (const title of stepTitles) {
  const at = flow.indexOf(title);
  assert.ok(at !== -1, `flow includes step: ${title}`);
  assert.ok(at > lastIndex, `flow keeps step order: ${title}`);
  lastIndex = at;
}

// The flow shares one episode model and ends in an export action (the outcome).
assert.ok(/const episode = \{/.test(flow), "flow uses one shared episode model");
assert.ok(flow.includes("Export episode"), "flow ends in an export action");

// Editable caption text is never interpolated into innerHTML (XSS-safe rendering).
assert.ok(!/innerHTML/.test(flow), "flow builds the DOM without innerHTML");

// The script parses without throwing.
const script = flow.match(/<script>([\s\S]*?)<\/script>/)[1];
const vm = require("vm");
new vm.Script(script);

assert.ok(fs.existsSync(path.join(root, "preview", "episode-flow.html")), "flow page exists for routing");

console.log("episode flow (connected path smoke): all assertions passed");
