"use strict";

// Keeps preview shell connected sub-path lists aligned with path nav scripts (#583 / #584).
// Run with: `node preview/shell-subpath-consistency.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const previewDir = __dirname;
const shellHtml = fs.readFileSync(path.join(previewDir, "index.html"), "utf8");

const subpaths = [
  { section: "Episode ingest setup", script: "ingest-nav.js", flowName: "INGEST_FLOW" },
  { section: "Speaker setup", script: "speaker-setup-nav.js", flowName: "SPEAKER_SETUP_FLOW" },
  { section: "Choose a visual direction", script: "style-nav.js", flowName: "STYLE_FLOW" },
  { section: "Publish prep after export", script: "publish-nav.js", flowName: "PUBLISH_FLOW" },
  { section: "Clean up audio &amp; captions", script: "cleanup-nav.js", flowName: "CLEANUP_FLOW" },
  { section: "Add contextual visuals", script: "visuals-nav.js", flowName: "VISUALS_FLOW" },
  { section: "Make it reusable", script: "reuse-nav.js", flowName: "REUSE_FLOW" },
];

function parseFlowFiles(source, flowName) {
  const match = source.match(new RegExp(`const ${flowName} = \\[([\\s\\S]*?)\\];`));
  assert.ok(match, `${flowName} must be declared`);
  const files = [];
  const entryPattern = /\{\s*id:\s*"[^"]+"[\s\S]*?file:\s*"([^"]+)"/g;
  let entry;
  while ((entry = entryPattern.exec(match[1])) !== null) {
    files.push(entry[1]);
  }
  assert.ok(files.length > 0, `${flowName} must declare connected steps`);
  return files;
}

function shellSection(sectionTitle) {
  const after = shellHtml.split(sectionTitle)[1];
  assert.ok(after, `preview shell must include a ${sectionTitle} section`);
  return after.split(/<h2 class="tools-title">/)[0];
}

for (const { section, script, flowName } of subpaths) {
  const source = fs.readFileSync(path.join(previewDir, script), "utf8");
  const flowFiles = parseFlowFiles(source, flowName);
  const sectionHtml = shellSection(section);

  let lastIndex = -1;
  for (const file of flowFiles) {
    const href = `../prototype/${file}`;
    const index = sectionHtml.indexOf(href);
    assert.ok(index >= 0, `shell ${section} section must link to ${file}`);
    assert.ok(index > lastIndex, `shell ${section} order must match ${script} for ${file}`);
    lastIndex = index;
  }
}

console.log(`shell subpath consistency: ${subpaths.length} shell sections match their path nav scripts`);
