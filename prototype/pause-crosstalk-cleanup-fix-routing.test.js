"use strict";

// Guards the caption-risk cross-talk hand-off (#583 connected screens / #584 regression guard):
// a cross-talk moment that makes captions unreliable is NOT resolved by silencing a speaker —
// it routes the creator to caption quality review, where they review the actual caption lines.
// The routing is already implemented but unguarded; this pins it so a future refactor of
// evaluate()/kinds can't silently drop the hand-off link without a CI failure.
// Run with: `node prototype/pause-crosstalk-cleanup-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const dir = __dirname;
const html = fs.readFileSync(path.join(dir, "pause-crosstalk-cleanup.html"), "utf8");
const nav = fs.readFileSync(path.join(dir, "..", "preview", "cleanup-nav.js"), "utf8");
const shell = fs.readFileSync(path.join(dir, "..", "preview", "index.html"), "utf8");

// 1. The screen is part of the connected cleanup flow: it loads cleanup-nav.js and is a
//    CLEANUP_FLOW step, so its hand-offs are reachable from the preview shell.
assert.ok(html.includes("../preview/cleanup-nav.js"), "pause-crosstalk-cleanup loads cleanup-nav.js");
assert.ok(/"pause-crosstalk-cleanup\.html"/.test(nav), "pause-crosstalk-cleanup is a CLEANUP_FLOW step");

// 2. A caption-risk cross-talk moment routes to caption quality review — the screen that owns
//    the caption fix. Anchor on the captionRisk branch and read a window after it (the branch
//    body holds template literals with braces, so a brace-matched regex would misfire).
const anchor = html.indexOf("kind.captionRisk");
assert.notStrictEqual(anchor, -1, "evaluate() handles a caption-risk cross-talk moment");
const branch = html.slice(anchor, anchor + 500);
assert.ok(
  /fixScreen:\s*"audio-caption-quality-review\.html"/.test(branch),
  "caption-risk cross-talk routes to caption quality review",
);
assert.ok(
  /fixLabel:\s*"caption quality review"/.test(branch),
  "the caption-risk hand-off is labelled caption quality review",
);

// 3. The hand-off target exists and is reachable from the preview shell.
assert.ok(
  fs.existsSync(path.join(dir, "audio-caption-quality-review.html")),
  "the caption quality review screen exists",
);
assert.ok(
  shell.includes("audio-caption-quality-review.html"),
  "the preview shell links to caption quality review",
);

// 4. The rendered open-fix link actually points at the declared fix screen.
assert.ok(
  html.includes("openLink.href = issue.fixScreen"),
  "the open-fix link routes to the declared fix screen",
);

console.log("pause-crosstalk-cleanup: caption-risk cross-talk routes to caption quality review");
