"use strict";

// Validates data-*-step attributes match each path nav FLOW id (#583 / #584).
// Discovered automatically by scripts/run-tests.mjs (npm test).
// Run with: `node preview/path-step-attrs.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");

const pathNavs = [
  { script: "ingest-nav.js", attr: "data-ingest-step", flowName: "INGEST_FLOW" },
  { script: "publish-nav.js", attr: "data-publish-step", flowName: "PUBLISH_FLOW" },
  { script: "style-nav.js", attr: "data-style-step", flowName: "STYLE_FLOW" },
  { script: "visuals-nav.js", attr: "data-visuals-step", flowName: "VISUALS_FLOW" },
  { script: "reuse-nav.js", attr: "data-reuse-step", flowName: "REUSE_FLOW" },
];

function parseFlow(source, flowName) {
  const match = source.match(new RegExp(`const ${flowName} = \\[([\\s\\S]*?)\\];`));
  assert.ok(match, `could not parse ${flowName}`);
  const steps = [];
  const entryPattern = /id:\s*"([^"]+)"[\s\S]*?file:\s*"([^"]+)"/g;
  let entry;
  while ((entry = entryPattern.exec(match[1])) !== null) {
    steps.push({ id: entry[1], file: entry[2] });
  }
  assert.ok(steps.length > 0, `${flowName} must declare at least one step`);
  return steps;
}

for (const { script, attr, flowName } of pathNavs) {
  const source = fs.readFileSync(path.join(__dirname, script), "utf8");
  const steps = parseFlow(source, flowName);

  for (const step of steps) {
    const htmlPath = path.join(root, "prototype", step.file);
    const html = fs.readFileSync(htmlPath, "utf8");
    const expected = `${attr}="${step.id}"`;
    assert.ok(
      html.includes(expected),
      `${step.file} must declare ${expected} for ${script}`,
    );
  }
}

console.log("path step attrs: prototype screens declare matching data-*-step ids");
