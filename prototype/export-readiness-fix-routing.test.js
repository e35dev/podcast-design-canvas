"use strict";

// Guards export readiness hand-off links (#583): each blocked or needs-review area
// opens the screen that owns the fix, including music cues on music cue setup.
// Run with: `node prototype/export-readiness-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(__dirname, "export-readiness-review.html"), "utf8");
const shell = fs.readFileSync(path.join(root, "preview", "index.html"), "utf8");
const episodeFlowNav = fs.readFileSync(path.join(root, "preview", "episode-flow-nav.js"), "utf8");
const musicNav = fs.readFileSync(path.join(root, "preview", "music-nav.js"), "utf8");
const publishNav = fs.readFileSync(path.join(root, "preview", "publish-nav.js"), "utf8");

const expectedRoutes = {
  framing: "speaker-framing-safety.html",
  captions: "audio-caption-quality-review.html",
  audio: "audio-cleanup-controls.html",
  visuals: "contextual-broll-moments.html",
  brand: "layout-safe-areas.html",
  metadata: "episode-chapter-markers.html",
  music: "music-cue-setup.html",
  thumbnail: "thumbnail-cover-frame.html",
};

assert.ok(
  shell.includes("../prototype/export-readiness-review.html"),
  "export readiness review is reachable from the preview shell",
);
assert.ok(
  episodeFlowNav.includes("export-readiness-review.html"),
  "export readiness review is part of the connected episode flow path",
);
assert.ok(html.includes("openLink.href = issue.fixScreen"), "export readiness fix links use the issue fix screen");
assert.ok(html.includes('openLink.className = "fix-link"'), "export readiness fix links are class-tagged");

const checkListBlock = html.match(/const checkList = \[([\s\S]*?)\];/);
assert.ok(checkListBlock, "export readiness checks are declared");

for (const [id, file] of Object.entries(expectedRoutes)) {
  assert.ok(
    checkListBlock[1].includes(`id: "${id}"`) && checkListBlock[1].includes(`fixScreen: "${file}"`),
    `export readiness check "${id}" routes to ${file}`,
  );
  assert.ok(
    shell.includes(`../prototype/${file}`),
    `${file} is reachable from the preview shell`,
  );
  assert.ok(
    fs.existsSync(path.join(__dirname, file)),
    `${file} exists as a real screen`,
  );
}

assert.ok(
  musicNav.includes('id: "music-cue-setup"'),
  "music cue setup is part of the connected music path",
);
assert.ok(
  publishNav.includes('id: "thumbnail-cover-frame"'),
  "thumbnail cover frame is part of the connected publish path",
);
assert.ok(
  episodeFlowNav.includes("EXPORT_READINESS_FIX_PATHS"),
  "episode flow nav preserves path context on export readiness fix links",
);
assert.ok(
  episodeFlowNav.includes('"music-cue-setup.html": "episode"'),
  "music cue fix links keep episode path context",
);
assert.ok(
  episodeFlowNav.includes('"thumbnail-cover-frame.html": "publish"'),
  "thumbnail fix links use publish path context",
);
assert.ok(
  !episodeFlowNav.includes("normalizeExportReadinessFixLinkClick"),
  "export readiness fix links normalize at init without document click delegation",
);

console.log(`export readiness review: ${Object.keys(expectedRoutes).length} readiness areas open their owning fix screen`);
