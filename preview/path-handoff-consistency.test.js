"use strict";

// Cross-section handoff guard for connected path nav scripts (#583 / #584).
// Each secondary shell section should hand off to the next section listed in
// preview/index.html, except publish prep which intentionally finishes at the shell.
// Run with: `node preview/path-handoff-consistency.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const previewDir = __dirname;

const expectedHandoffs = [
  {
    script: "ingest-nav.js",
    href: "setIngestHandoffLink(start)",
    text: "Continue: Source media health",
    note: "ingest setup hands off to the episode path",
  },
  {
    script: "speaker-setup-nav.js",
    href: 'start.href = "preset-style-picker.html"',
    text: "Continue: Pick a preset style",
    note: "speaker setup hands off to visual direction",
  },
  {
    script: "style-nav.js",
    href: 'STYLE_HANDOFF = { file: "contextual-broll-moments.html"',
    text: 'label: "Contextual b-roll moments"',
    note: "visual direction hands off to contextual visuals",
  },
  {
    script: "publish-nav.js",
    href: 'finish.href = "../preview/"',
    text: "Finish: back to the preview shell",
    note: "publish prep finishes at the preview shell",
  },
  {
    script: "cleanup-nav.js",
    href: 'setCleanupScreenLink(start, "contextual-broll-moments.html?from=cleanup")',
    text: "Continue: Contextual b-roll moments",
    note: "cleanup helpers hand off to contextual visuals",
  },
  {
    script: "visuals-nav.js",
    href: 'start.href = "show-segment-system.html"',
    text: "Continue: Show segment system",
    note: "contextual visuals hand off to reuse",
  },
  {
    script: "reuse-nav.js",
    href: 'REUSE_HANDOFF = { file: "episode-watch-through-preview.html"',
    text: 'label: "Episode watch-through"',
    note: "reuse path hands off to publish review",
  },
];

for (const { script, href, text, note } of expectedHandoffs) {
  const source = fs.readFileSync(path.join(previewDir, script), "utf8");
  assert.ok(source.includes(href), `${script} ${note} (${href})`);
  assert.ok(source.includes(text), `${script} exposes creator-facing handoff copy (${text})`);
}

const expectedEntryBacklinks = [
  {
    script: "cleanup-nav.js",
    href: 'prep.href = "publish-checklist.html"',
    text: "Previous: Publish checklist",
    note: "cleanup helpers link back to publish prep",
  },
  {
    script: "reuse-nav.js",
    href: 'REUSE_ENTRY = { file: "sensitive-moment-review.html"',
    text: 'label: "Sensitive moment review"',
    note: "reuse path links back to contextual visuals",
  },
  {
    script: "visuals-nav.js",
    href: 'VISUALS_STYLE_ENTRY = { file: "canvas-layer-controls.html"',
    text: 'label: "Canvas layer controls"',
    note: "contextual visuals link back to visual direction by default",
  },
  {
    script: "visuals-nav.js",
    href: 'cleanup.href = "on-screen-correction-note.html"',
    text: "Previous: On-screen correction note",
    note: "contextual visuals link back to cleanup helpers when entered from cleanup",
  },
];

for (const { script, href, text, note } of expectedEntryBacklinks) {
  const source = fs.readFileSync(path.join(previewDir, script), "utf8");
  assert.ok(source.includes(href), `${script} ${note} (${href})`);
  assert.ok(source.includes(text), `${script} exposes creator-facing back-link copy (${text})`);
}

console.log(
  `path handoff consistency: ${expectedHandoffs.length} cross-section handoffs and ${expectedEntryBacklinks.length} entry back-links verified`,
);
