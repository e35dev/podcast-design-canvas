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
  const filePattern = /\{\s*id:\s*"[^"]+",\s*file:\s*"([^"]+)"/g;
  let entry;
  while ((entry = filePattern.exec(match[1])) !== null) {
    files.push(entry[1]);
  }
  assert.ok(files.length >= 3, "publish flow declares connected publish prep steps");
  return files;
}

const flowFiles = parsePublishFlow(publishSource);

const publishSection = shellHtml.split("Publish prep after export")[1]?.split(/<h2 class="tools-title">/)[0] || "";
assert.ok(publishSection, "preview shell must include a publish prep section");

let lastIndex = -1;
for (const file of flowFiles) {
  const href = `../prototype/${file}`;
  const index = publishSection.indexOf(href);
  assert.ok(index >= 0, `preview shell publish prep section must link to ${file}`);
  assert.ok(index > lastIndex, `preview shell publish prep order must match publish-nav.js for ${file}`);
  lastIndex = index;
}

console.log(`publish path consistency: shell publish prep list matches publish-nav.js (${flowFiles.length} steps)`);
