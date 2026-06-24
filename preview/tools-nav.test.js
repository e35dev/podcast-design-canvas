"use strict";

// Guards that secondary tool screens link back to the preview shell (#583 / #584).
// Run with: `node preview/tools-nav.test.js` (or `npm test`).

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const root = path.join(__dirname, "..");
const navScript = fs.readFileSync(path.join(__dirname, "tools-nav.js"), "utf8");

// The shared script parses and points back to the preview shell.
new vm.Script(navScript);
assert.ok(navScript.includes('home.href = "../preview/"'), "tools nav links back to the preview shell");
assert.ok(navScript.includes("episode-flow.html"), "tools nav links to the guided episode flow");
assert.ok(navScript.includes("app.html"), "tools nav links to the preview app");
assert.ok(!/innerHTML/.test(navScript), "tools nav builds the DOM without innerHTML");

// Every secondary screen is assigned a workflow stage in the nav's stage map, so a
// connected screen always shows where it fits (and a new screen can't be left unlabelled).
const stageKeys = new Set(
  [...navScript.matchAll(/"([a-z0-9-]+\.html)":\s*"/g)].map((m) => m[1]),
);

// The five core-flow screens use the richer episode-flow nav instead.
const coreFlow = new Set([
  "source-media-health.html",
  "speaker-sync-repair.html",
  "audio-cleanup-controls.html",
  "audio-caption-quality-review.html",
  "export-readiness-review.html",
]);

const ingestFlow = new Set([
  "episode-readiness.html",
  "speaker-role-mapping.html",
  "social-context-intake.html",
]);

const publishFlow = new Set([
  "episode-watch-through-preview.html",
  "destination-crop-preview.html",
  "thumbnail-cover-frame.html",
  "show-notes-assembly.html",
  "export-package-handoff.html",
  "client-review-copy-flow.html",
  "publish-checklist.html",
]);

const styleFlow = new Set([
  "preset-style-picker.html",
  "preset-comparison-preview.html",
  "layout-safe-areas.html",
  "speaker-framing-safety.html",
  "canvas-layer-controls.html",
]);

const visualsFlow = new Set([
  "contextual-broll-moments.html",
  "contextual-title-cards.html",
  "sensitive-moment-review.html",
]);

const reuseFlow = new Set([
  "show-segment-system.html",
  "show-template-adaptation.html",
  "start-from-previous-episode.html",
  "episode-chapter-markers.html",
]);

const speakerSetupFlow = new Set([
  "speaker-attribution-review.html",
  "guest-profile-reuse.html",
  "speaker-visual-match.html",
  "speaker-eye-line-coherence.html",
]);

const cleanupFlow = new Set([
  "pause-crosstalk-cleanup.html",
  "transcript-glossary.html",
  "transcript-search-navigation.html",
  "accessibility-readability-checks.html",
  "line-pickup-insert.html",
  "on-screen-correction-note.html",
]);

const prototypes = fs
  .readdirSync(path.join(root, "prototype"))
  .filter((name) => name.endsWith(".html"));

let secondaryCount = 0;
for (const file of prototypes) {
  const html = fs.readFileSync(path.join(root, "prototype", file), "utf8");
  if (coreFlow.has(file)) {
    assert.ok(
      html.includes("episode-flow-nav.js"),
      `core-flow screen keeps its flow nav: ${file}`,
    );
    assert.ok(
      !html.includes("tools-nav.js"),
      `core-flow screen does not double up with tools nav: ${file}`,
    );
  } else if (ingestFlow.has(file)) {
    assert.ok(
      html.includes("../preview/ingest-nav.js"),
      `ingest screen uses ingest navigation: ${file}`,
    );
    assert.ok(
      !html.includes("../preview/tools-nav.js"),
      `ingest screen does not double up with tools nav: ${file}`,
    );
  } else if (publishFlow.has(file)) {
    assert.ok(
      html.includes("../preview/publish-nav.js"),
      `publish screen uses publish navigation: ${file}`,
    );
    assert.ok(
      !html.includes("../preview/tools-nav.js"),
      `publish screen does not double up with tools nav: ${file}`,
    );
  } else if (styleFlow.has(file)) {
    assert.ok(
      html.includes("../preview/style-nav.js"),
      `style screen uses style navigation: ${file}`,
    );
    assert.ok(
      !html.includes("../preview/tools-nav.js"),
      `style screen does not double up with tools nav: ${file}`,
    );
  } else if (visualsFlow.has(file)) {
    assert.ok(
      html.includes("../preview/visuals-nav.js"),
      `visuals screen uses visuals navigation: ${file}`,
    );
    assert.ok(
      !html.includes("../preview/tools-nav.js"),
      `visuals screen does not double up with tools nav: ${file}`,
    );
  } else if (reuseFlow.has(file)) {
    assert.ok(
      html.includes("../preview/reuse-nav.js"),
      `reuse screen uses reuse navigation: ${file}`,
    );
    assert.ok(
      !html.includes("../preview/tools-nav.js"),
      `reuse screen does not double up with tools nav: ${file}`,
    );
  } else if (speakerSetupFlow.has(file)) {
    assert.ok(
      html.includes("../preview/speaker-setup-nav.js"),
      `speaker setup screen uses speaker setup navigation: ${file}`,
    );
    assert.ok(
      !html.includes("../preview/tools-nav.js"),
      `speaker setup screen does not double up with tools nav: ${file}`,
    );
  } else if (cleanupFlow.has(file)) {
    assert.ok(
      html.includes("../preview/cleanup-nav.js"),
      `cleanup screen uses cleanup navigation: ${file}`,
    );
    assert.ok(
      !html.includes("../preview/tools-nav.js"),
      `cleanup screen does not double up with tools nav: ${file}`,
    );
  } else {
    // Every secondary screen links back to the shell.
    assert.ok(
      html.includes("../preview/tools-nav.js"),
      `secondary screen links back to the shell: ${file}`,
    );
    // ...and has a workflow stage so its nav shows where it fits.
    assert.ok(
      stageKeys.has(file),
      `secondary screen has a workflow stage in tools-nav.js: ${file}`,
    );
    secondaryCount += 1;
  }
}

// With the cleanup stage connected, every prototype now belongs to a dedicated stage
// nav, so the generic tools-nav fallback has no remaining screens. Confirm that end
// state rather than requiring leftover generic screens.
assert.strictEqual(
  secondaryCount,
  0,
  "every prototype is connected to a dedicated stage nav (none left on the generic fallback)",
);

// No stale stage entries pointing at files that no longer exist.
const existing = new Set(prototypes);
for (const key of stageKeys) {
  assert.ok(existing.has(key), `tools-nav.js stage map entry resolves to a real screen: ${key}`);
}

console.log(`tools nav: ${secondaryCount} secondary screens connected, each labelled with its workflow stage`);
