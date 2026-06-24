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
    href: 'start.href = "source-media-health.html"',
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
    href: 'STYLE_HANDOFF = { file: "episode-watch-through-preview.html"',
    text: 'label: "Watch the finished episode"',
    note: "visual direction hands off to publish prep",
  },
  {
    script: "publish-nav.js",
    href: 'finish.href = "../preview/"',
    text: "Finish: back to the preview shell",
    note: "publish prep finishes at the preview shell",
  },
  {
    script: "cleanup-nav.js",
    href: 'start.href = "contextual-broll-moments.html"',
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
    href: 'start.href = "episode-watch-through-preview.html"',
    text: "Continue: Episode watch-through",
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
    href: 'review.href = "sensitive-moment-review.html"',
    text: "Previous: Sensitive moment review",
    note: "reuse path links back to contextual visuals",
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
