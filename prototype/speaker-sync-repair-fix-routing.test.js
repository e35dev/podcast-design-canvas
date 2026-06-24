"use strict";

// Guards speaker sync repair attribution hand-off links (#583): wrong-speaker captions
// route to speaker attribution review; timing repairs stay in place on this screen.
// Run with: `node prototype/speaker-sync-repair-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(__dirname, "speaker-sync-repair.html"), "utf8");
const shell = fs.readFileSync(path.join(root, "preview", "index.html"), "utf8");
const episodeFlowNav = fs.readFileSync(path.join(root, "preview", "episode-flow-nav.js"), "utf8");
const speakerSetupNav = fs.readFileSync(path.join(root, "preview", "speaker-setup-nav.js"), "utf8");

const attributionSurface = "speaker-attribution-review";

function loadExports() {
  const script = source.match(/<script>([\s\S]*?)<\/script>/)[1];
  const sandbox = {
    document: {
      createElement: (tag) => ({
        tagName: tag,
        className: "",
        textContent: "",
        href: "",
        style: {},
        dataset: {},
        setAttribute() {},
        addEventListener() {},
        append() {},
        appendChild() {},
        replaceChildren() {},
        querySelector: () => null,
        querySelectorAll: () => [],
      }),
      querySelector: () => ({
        addEventListener() {},
        replaceChildren() {},
        appendChild() {},
      }),
    },
    structuredClone: globalThis.structuredClone,
    module: { exports: {} },
  };
  vm.createContext(sandbox);
  vm.runInContext(script, sandbox);
  return sandbox.module.exports;
}

assert.ok(
  shell.includes("../prototype/speaker-sync-repair.html"),
  "speaker sync repair is reachable from the preview shell",
);
assert.ok(
  episodeFlowNav.includes("speaker-sync-repair.html"),
  "speaker sync repair is part of the connected episode flow path",
);
assert.ok(
  speakerSetupNav.includes('["speaker-sync-repair", "?path=episode"]'),
  "speaker sync repair is a connected hand-off target from speaker setup",
);
assert.ok(
  shell.includes(`../prototype/${attributionSurface}.html`),
  "speaker attribution review is reachable from the preview shell",
);

assert.ok(
  source.includes(`const attributionReviewSurface = "${attributionSurface}"`),
  "sync repair declares the attribution review surface constant",
);
assert.ok(
  fs.existsSync(path.join(__dirname, `${attributionSurface}.html`)),
  "attribution review surface exists as a real screen",
);

assert.ok(
  source.includes('label: "Captions show wrong speaker"'),
  "sync repair declares the attribution issue type",
);
assert.ok(
  /attribution:\s*\{[\s\S]*?repairs:\s*\[[^\]]*"attribution"/.test(source),
  "attribution issue lists the attribution review hand-off repair",
);

assert.ok(
  source.includes("fixSurface: attributionReviewSurface"),
  "needs attribution review routes through the attribution surface constant",
);
assert.ok(
  source.includes("Open attribution review for the affected span before marking captions ready."),
  "attribution routed copy names the attribution review screen",
);

assert.ok(
  source.includes("attributionLink.href = `${attributionReviewSurface}.html`"),
  "attribution track action links to the attribution review screen",
);
assert.ok(
  source.includes('attributionLink.className = "action-link"'),
  "attribution track action is a styled link",
);
assert.ok(
  source.includes("action.href = `${issue.fixSurface}.html`"),
  "routed issue summaries link to their fix surface screen",
);
assert.ok(
  source.includes('action.className = "routed-link"'),
  "routed issue summaries use the shared routed-link class",
);

const M = loadExports();

const inPlaceIssueKeys = ["video-late", "audio-early", "drift", "ends-early", "duplicate"];
for (const key of inPlaceIssueKeys) {
  assert.ok(M.issues[key], `sync repair declares the ${key} in-place issue`);
  assert.ok(
    !Object.prototype.hasOwnProperty.call(M.issues[key], "fixSurface"),
    `${key} in-place repairs are not declared with a fix surface`,
  );
}

const flaggedDrift = M.evaluate([{
  id: "drift-track",
  name: "Guest 1 — Marcus Lee",
  issue: "drift",
  proposedRepair: "",
  resolution: null,
  previewMoment: "midpoint",
}]).results[0];
assert.equal(flaggedDrift.state, "flagged", "unresolved drift stays flagged in place");
assert.ok(!flaggedDrift.summary.fixSurface, "unresolved drift does not route to attribution review");

const attributionTrack = {
  id: "attr",
  name: "Guest 1 — Marcus Lee",
  issue: "attribution",
  proposedRepair: "align-host",
  resolution: "needs attribution review",
  repairConfirmed: false,
  previewMoment: "drift-point",
};
const driftTrack = {
  id: "drift",
  name: "Guest 1 — Marcus Lee",
  issue: "drift",
  proposedRepair: "align-host",
  resolution: "repaired",
  repairConfirmed: true,
  previewMoment: "midpoint",
};

const attributionResult = M.evaluate([attributionTrack]).results[0];
assert.equal(attributionResult.state, "needs attribution review", "attribution resolution maps to needs attribution review");
assert.equal(
  attributionResult.summary.fixSurface,
  attributionSurface,
  "attribution review summary carries the attribution surface",
);

const driftResult = M.evaluate([driftTrack]).results[0];
assert.equal(driftResult.state, "repaired", "confirmed drift repair stays repaired in place");
assert.ok(!driftResult.summary.fixSurface, "confirmed drift repair does not route to attribution review");

const attributionAction = M.renderIssueAction(attributionResult.summary);
assert.equal(attributionAction.href, `${attributionSurface}.html`, "attribution summary links to attribution review");
assert.equal(attributionAction.className, "routed-link", "attribution summary uses the routed-link class");

const driftAction = M.renderIssueAction(driftResult.summary);
assert.notEqual(driftAction.tagName, "a", "repaired drift summary stays plain copy, not a routed link");

console.log("speaker sync repair: attribution issues open speaker attribution review; timing repairs stay in place");
