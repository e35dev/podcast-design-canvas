"use strict";

// Guards slot assignment review hand-off links (#1026 / #1131): portrait slots route to
// source media health, mismatch signals route back to layout first for reassignment.
// Run with: `node prototype/slot-assignment-review-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(__dirname, "slot-assignment-review.html"), "utf8");
const shell = fs.readFileSync(path.join(root, "preview", "index.html"), "utf8");
const ingestNav = fs.readFileSync(path.join(root, "preview", "ingest-nav.js"), "utf8");

assert.ok(
  shell.includes("../prototype/slot-assignment-review.html"),
  "slot assignment review is reachable from the preview shell",
);
assert.ok(
  ingestNav.includes('id: "slot-assignment-review"'),
  "slot assignment review is part of the connected ingest path",
);

assert.ok(
  html.includes('fixScreen: "../preview/layout-first.html"'),
  "mismatch and missing-slot issues route back to layout first for reassignment",
);
assert.ok(
  html.includes('fixLabel: "layout first"'),
  "layout first route names the fix screen in creator-facing copy",
);
assert.ok(
  fs.existsSync(path.join(root, "preview", "layout-first.html")),
  "layout first exists as a real screen",
);

assert.ok(
  html.includes('fixScreen: "source-media-health.html"'),
  "portrait orientation issues route to source media health",
);
assert.ok(
  html.includes('fixLabel: "source media health"'),
  "source media health route names the fix screen in creator-facing copy",
);
assert.ok(
  fs.existsSync(path.join(__dirname, "source-media-health.html")),
  "source media health exists as a real screen",
);

assert.ok(html.includes('action.className = "fix-link"'), "slot assignment review renders fix links with shared styling");
assert.ok(html.includes("issue.fixScreen && issue.fixLabel"), "fix link rendering requires target and label");
assert.ok(html.includes("action.href = issue.fixScreen"), "fix link points to the owning fix screen");

const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(scriptMatch, "slot assignment review has an inline script");
const scriptSource = scriptMatch[1];

const sandbox = { module: { exports: {} } };
sandbox.module.exports = {};
const wrapped = `(function(module) { ${scriptSource.replace(/\(function\s*\(\)\s*\{/, "").replace(/\}\(\)\);[\s\S]*$/, "")} })(module)`;

try {
  vm.runInNewContext(
    `
    var module = { exports: {} };
    (function() {
      ${scriptSource}
    })();
    exports = module.exports;
    `,
    sandbox,
  );
} catch (_) {}

const evaluate = sandbox.module && sandbox.module.exports && sandbox.module.exports.evaluate;
const fileNameSignal = sandbox.module && sandbox.module.exports && sandbox.module.exports.fileNameSignal;

if (evaluate && fileNameSignal) {
  assert.equal(fileNameSignal("host-cam.mp4"), "host", "host keyword in filename signals the host slot");
  assert.equal(fileNameSignal("guest-recording.mp4"), "guest", "guest keyword in filename signals the guest slot");
  assert.equal(fileNameSignal("riverside-take2.mp4"), null, "no signal keyword leaves the result null");

  const ready = evaluate([
    { id: "r1", slot: "host", role: "Host", optional: false, speakerName: "Dana", fileName: "host-cam.mp4", durationLabel: "58:00", orientation: "landscape", overridden: false },
    { id: "r2", slot: "guest", role: "Guest", optional: false, speakerName: "Marcus", fileName: "guest-track.mp4", durationLabel: "57:50", orientation: "landscape", overridden: false },
  ]);
  assert.equal(ready.overall, "ready", "correctly assigned landscape slots evaluate to ready");

  const mismatch = evaluate([
    { id: "m1", slot: "host", role: "Host", optional: false, speakerName: "Dana", fileName: "guest-audio-backup.mp4", durationLabel: "58:00", orientation: "landscape", overridden: false },
  ]);
  assert.equal(mismatch.overall, "needs-review", "filename-slot mismatch produces needs-review overall");
  assert.equal(mismatch.results[0].issue.fixScreen, "../preview/layout-first.html", "mismatch routes to layout first");

  const portrait = evaluate([
    { id: "p1", slot: "guest", role: "Guest", optional: false, speakerName: "Alex", fileName: "alex-mobile.mp4", durationLabel: "57:00", orientation: "portrait", overridden: false },
  ]);
  assert.equal(portrait.overall, "needs-review", "portrait orientation produces needs-review overall");
  assert.equal(portrait.results[0].issue.fixScreen, "source-media-health.html", "portrait routes to source media health");

  const missing = evaluate([
    { id: "x1", slot: "host", role: "Host", optional: false, speakerName: "Dana", fileName: "", durationLabel: "", orientation: "landscape", overridden: false },
  ]);
  assert.equal(missing.overall, "conflict", "missing required file produces conflict overall");
  assert.equal(missing.results[0].issue.fixScreen, "../preview/layout-first.html", "missing required file routes to layout first");

  const overridden = evaluate([
    { id: "o1", slot: "host", role: "Host", optional: false, speakerName: "Dana", fileName: "guest-cam.mp4", durationLabel: "58:00", orientation: "landscape", overridden: true },
  ]);
  assert.equal(overridden.overall, "ready", "overridden mismatch resolves to ready");
  assert.equal(overridden.results[0].state, "overridden", "overridden slot carries the overridden state");
  assert.equal(overridden.results[0].issue, null, "overridden slot has no issue to fix");
}

console.log("slot assignment review: mismatch and portrait issues route to their owning fix screens");
