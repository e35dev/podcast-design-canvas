"use strict";

// Keeps the preview shell publish-prep list aligned with publish-nav.js (#583 / #584).
// Run with: `node preview/publish-path-consistency.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const shellHtml = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const publishSource = fs.readFileSync(path.join(__dirname, "publish-nav.js"), "utf8");

function parsePublishFlow(source) {
  const match = source.match(/const PUBLISH_FLOW = \[([\s\S]*?)\];/);
  assert.ok(match, "PUBLISH_FLOW must be declared");
  const files = [];
  const filePattern = /file:\s*"([^"]+)"/g;
  let entry;
  while ((entry = filePattern.exec(match[1])) !== null) {
    files.push(entry[1]);
  }
  return files;
}

const flowFiles = parsePublishFlow(publishSource);
assert.deepStrictEqual(
  flowFiles,
  [
    "episode-watch-through-preview.html",
    "export-package-handoff.html",
    "publish-checklist.html",
  ],
  "publish flow order is stable for shell consistency checks",
);

const publishSection = shellHtml.split("Publish prep after export")[1]?.split("<h2 class=\"tools-title\">More tools</h2>")[0] || "";
assert.ok(publishSection, "preview shell must include a publish prep section");

for (const file of flowFiles) {
  assert.ok(
    publishSection.includes(`../prototype/${file}`),
    `preview shell publish prep section must link to ${file}`,
  );
}

console.log("publish path consistency: shell publish prep list matches publish-nav.js");
