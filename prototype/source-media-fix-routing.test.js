"use strict";

// Smoke test: source media health must route its visual/audio issues to real
// fix screens (#582). The spec hands quiet/caption tracks to audio cleanup and
// dark tracks to visual match, so a flagged track should render a navigable
// link to that screen, and every fix surface must be a real prototype. Run with:
//   `node prototype/source-media-fix-routing.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "prototype", "source-media-health.html"), "utf8");

// Fix surfaces the source screen hands issues off to. Each is also a filename.
// A sideways (portrait) track that won't fill a widescreen layout is a framing
// problem, so it routes to the speaker framing safety screen.
const fixSurfaces = ["speaker-visual-match", "audio-cleanup-controls", "speaker-framing-safety"];

for (const surface of fixSurfaces) {
  assert.ok(
    source.includes(`fixSurface: "${surface}"`),
    `source media declares a fix surface for ${surface}`,
  );
  assert.ok(
    fs.existsSync(path.join(root, "prototype", `${surface}.html`)),
    `fix surface ${surface}.html exists as a real screen`,
  );
}

// The routed action is a navigable link, not a dead status note.
assert.ok(
  source.includes('action = document.createElement("a")'),
  "routed issue renders an anchor element",
);
assert.ok(
  source.includes("action.href = `${issue.fixSurface}.html`"),
  "routed issue links to its fix surface screen",
);
assert.ok(
  source.includes('action.className = "routed-link"'),
  "routed link is class-tagged for styling",
);

// The routed link reuses the creator-facing action copy that names the fix screen.
assert.ok(
  source.includes("in audio cleanup") && source.includes("Open visual match"),
  "routed copy names the fix screen in creator-facing language",
);

// The sideways (portrait) track names the framing fix screen in its routed copy.
assert.ok(
  source.includes("Open speaker framing safety"),
  "portrait routed copy names the speaker framing safety screen",
);

const script = source.match(/<script>([\s\S]*?)<\/script>/)[1];
const harnessScript = script.replace(
  /\n\s*render\(\);\s*$/,
  `
      module.exports = {
        sampleSpeakers,
        evaluate,
        summarizeBatch,
        renderBatchSummary,
      };
`,
);

function createElement(tagName) {
  return {
    tagName,
    attributes: {},
    children: [],
    className: "",
    dataset: {},
    disabled: false,
    hidden: false,
    href: "",
    style: {},
    textContent: "",
    type: "",
    value: "",
    append(...children) {
      this.children.push(...children);
    },
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    replaceChildren(...children) {
      this.children = children;
    },
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
    removeAttribute(name) {
      delete this.attributes[name];
    },
    addEventListener(event, handler) {
      this[`on${event}`] = handler;
    },
  };
}

function flatten(node) {
  return [node, ...node.children.flatMap(flatten)];
}

const roots = {
  "#speakers": createElement("section"),
  "#status": createElement("span"),
  "#issues": createElement("div"),
  "#batchImport": createElement("div"),
  "#batchStatus": createElement("span"),
  "#batchDetail": createElement("p"),
  "#batchToolbar": createElement("div"),
  "#batchLinks": createElement("div"),
  "#batchConditionTags": createElement("div"),
  "#batchFilterNote": createElement("p"),
  "#addSpeaker": createElement("button"),
  "#reset": createElement("button"),
};

const context = {
  document: {
    createElement,
    querySelector(selector) {
      return roots[selector] || createElement("div");
    },
  },
  module: { exports: {} },
  structuredClone,
  window: { setTimeout() {} },
};

vm.runInNewContext(harnessScript, context);
const api = context.module.exports;

function renderBatchFor(list) {
  const evaluation = api.evaluate(list);
  api.renderBatchSummary(api.summarizeBatch(evaluation.results), evaluation.results);
}

function actionFor(speakerName) {
  const row = roots["#batchLinks"].children.find((item) =>
    flatten(item).some((node) => node.textContent === speakerName)
  );
  assert.ok(row, `rendered batch row for ${speakerName}`);
  return row.children[1];
}

renderBatchFor(api.sampleSpeakers);

let action = actionFor("Guest 1 — Marcus Lee");
assert.equal(action.tagName, "a", "dark video batch row opens the owning screen directly");
assert.equal(action.href, "speaker-visual-match.html", "dark video batch row opens visual match");
assert.equal(action.textContent, "Open visual match for Guest 1", "dark video batch action names the fix screen");

action = actionFor("Guest 3 — Alex Kim");
assert.equal(action.tagName, "a", "quiet audio batch row opens the owning screen directly");
assert.equal(action.href, "audio-cleanup-controls.html", "quiet audio batch row opens audio cleanup");
assert.equal(action.textContent, "Open audio cleanup for Guest 3", "quiet audio batch action names the fix screen");

action = actionFor("Guest 2 — Priya Shah");
assert.equal(action.tagName, "button", "replacement-only batch row stays a local jump");
assert.equal(action.textContent, "Open Guest 2 · No file", "replacement-only batch row keeps the local speaker action");

renderBatchFor([
  { id: "portrait", role: "Guest 4", name: "Guest 4 — Jules", condition: "portrait", disposition: "keep" },
]);
action = actionFor("Guest 4 — Jules");
assert.equal(action.tagName, "a", "portrait batch row opens the owning screen directly");
assert.equal(action.href, "speaker-framing-safety.html", "portrait batch row opens speaker framing safety");
assert.equal(action.textContent, "Open speaker framing safety for Guest 4", "portrait batch action names the fix screen");

console.log("source media health: routed issues and batch actions link to their fix screens");
