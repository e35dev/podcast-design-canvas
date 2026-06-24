"use strict";

// Guards ingest prototype navigation and creator-facing copy (#582 / #584).
// Run with: `node preview/ingest-nav.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const root = path.join(__dirname, "..");
const navScript = fs.readFileSync(path.join(__dirname, "ingest-nav.js"), "utf8");

new vm.Script(navScript);
assert.ok(navScript.includes('home.href = "../preview/"'), "ingest nav links back to the preview shell");
assert.ok(navScript.includes("episode-flow.html"), "ingest nav links to the guided episode flow");
assert.ok(navScript.includes("source-media-health.html"), "ingest nav hands off to source media health");
assert.ok(!/innerHTML/.test(navScript), "ingest nav builds the DOM without innerHTML");

const ingestScreens = [
  "episode-readiness.html",
  "speaker-role-mapping.html",
  "social-context-intake.html",
];

const forbidden = [
  /which surface owns/i,
  /owning surface/i,
  /opens the surface/i,
  /surface that owns/i,
  /\bpipeline\b/i,
];

for (const file of ingestScreens) {
  const html = fs.readFileSync(path.join(root, "prototype", file), "utf8");
  assert.ok(html.includes("../preview/ingest-nav.js"), `${file} loads ingest navigation`);
  assert.ok(!html.includes("../preview/tools-nav.js"), `${file} uses ingest nav instead of tools nav`);
  assert.ok(html.includes("data-ingest-step="), `${file} declares its ingest step`);

  for (const pattern of forbidden) {
    const match = html.match(pattern);
    assert.ok(!match, `${file} must not include internal copy: ${match && match[0]}`);
  }
}

console.log("ingest nav: ingest screens connected with creator-facing copy");
