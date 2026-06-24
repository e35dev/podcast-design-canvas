"use strict";

// Guards the audio cleanup controls prototype (#583): the screen should surface
// a cleanup rollup, route suggested speakers to meaningful preview moments, and
// apply cleanup across suggested tracks without exposing low-level audio tools.
// Run with: `node prototype/audio-cleanup-controls.test.js`

const fs = require("fs");
const vm = require("vm");
const path = require("path");
const assert = require("assert");

function makeNode() {
  const node = {
    _children: [],
    _listeners: {},
    _html: "",
    attributes: {},
    dataset: {},
    style: {},
    className: "",
    id: "",
    href: "",
    target: "",
    textContent: "",
    value: "",
    checked: false,
    type: "",
    parentNode: null,
    classList: {
      add(...names) {
        const set = new Set((node.className || "").split(/\s+/).filter(Boolean));
        names.forEach((name) => set.add(name));
        node.className = [...set].join(" ");
      },
      remove(...names) {
        const set = new Set((node.className || "").split(/\s+/).filter(Boolean));
        names.forEach((name) => set.delete(name));
        node.className = [...set].join(" ");
      },
      contains(name) {
        return (node.className || "").split(/\s+/).includes(name);
      },
    },
    set innerHTML(value) {
      this._html = value;
    },
    get innerHTML() {
      return this._html;
    },
    setAttribute(name, value) {
      this.attributes[name] = value;
      if (name === "id") this.id = value;
      if (name === "class") this.className = value;
    },
    getAttribute(name) {
      return this.attributes[name] || null;
    },
    addEventListener(type, listener) {
      this._listeners[type] = listener;
    },
    appendChild(child) {
      child.parentNode = this;
      this._children.push(child);
      return child;
    },
    append(...children) {
      children.forEach((child) => {
        child.parentNode = this;
        this._children.push(child);
      });
    },
    replaceChildren(...children) {
      this._children = [];
      this.append(...children);
    },
    get childElementCount() {
      return this._children.length;
    },
    scrollIntoView() {},
  };
  return node;
}

function flatten(node) {
  return [node, ...node._children.flatMap(flatten)];
}

function load() {
  const html = fs.readFileSync(path.join(__dirname, "audio-cleanup-controls.html"), "utf8");
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1] + `
module.exports = {
  choices,
  previewMoments,
  sampleSpeakers,
  buildSummary,
  buildRollup,
  rollupPreviewMomentForSpeaker,
  suggestedMoments,
  applyChoice,
  buildCleanedPreview,
  compareContextCopy,
  render,
  getPreview: () => preview,
  setPreview: (value) => { preview = value; },
  getEnabled: () => Array.from(enabled),
  setEnabled: (values) => { enabled = new Set(values); },
  getSpeakers: () => speakers,
  setSpeakers: (values) => { speakers = values; },
};
`;

  const roots = {};
  [
    "#controls",
    "#moments",
    "#compare-section",
    "#speakers",
    "#cleanupRollup",
    "#status",
    "#summary",
    "#moment-hint",
    "#preview-now",
    "#preview-tradeoff",
    "#apply",
  ].forEach((selector) => {
    roots[selector] = makeNode();
  });

  const document = {
    createElement: () => makeNode(),
    querySelector(selector) {
      if (roots[selector]) return roots[selector];
      if (selector.startsWith("#")) {
        const id = selector.slice(1);
        for (const root of Object.values(roots)) {
          const match = flatten(root).find((node) => node.id === id);
          if (match) return match;
        }
      }
      return makeNode();
    },
  };

  const sandbox = {
    document,
    structuredClone: globalThis.structuredClone,
    window: { setTimeout(fn) { fn(); } },
    module: { exports: {} },
  };
  vm.createContext(sandbox);
  vm.runInContext(script, sandbox);
  return { api: sandbox.module.exports, roots };
}

function texts(node) {
  return flatten(node).map((item) => item.textContent).filter(Boolean);
}

const { api, roots } = load();

assert.strictEqual(api.buildRollup().status, "Cleanup suggested", "cleanup starts in suggested state");
assert.strictEqual(api.buildRollup().needsWork.length, 2, "two speaker buckets need review initially");

const suggested = Array.from(api.suggestedMoments()).sort();
assert.deepStrictEqual(suggested, ["exchange", "quiet-guest"], "active cleanup choices suggest the right preview moments");

const guestMoment = api.rollupPreviewMomentForSpeaker(api.getSpeakers()[1]);
assert.strictEqual(guestMoment.id, "quiet-guest", "quiet guest review points to the quiet guest preview");

const cleaned = api.buildCleanedPreview([18, 22, 26, 24, 20]);
assert.notDeepStrictEqual(cleaned, [18, 22, 26, 24, 20], "cleanup choices alter the preview waveform");

assert.strictEqual(roots["#status"].textContent, "Cleanup suggested", "rendered status matches the rollup state");
assert.ok(
  roots["#summary"].textContent.includes("Compare original and cleaned audio"),
  "summary asks the creator to preview before applying",
);
assert.ok(
  roots["#moment-hint"].textContent.includes("reduce background noise on noisy room stretch") === false,
  "moment hint reflects only currently enabled cleanup choices",
);
assert.ok(
  roots["#moment-hint"].textContent.includes("balance loudness between speakers on host and guest exchange"),
  "moment hint includes the enabled balance choice",
);

const rollupTexts = texts(roots["#cleanupRollup"]);
assert.ok(rollupTexts.includes("Show speakers that need review (2)"), "rollup exposes a review-only filter");
assert.ok(
  rollupTexts.some((text) => text.includes("Open Guest 1")),
  "rollup exposes a direct jump action for Guest 1",
);
assert.ok(
  rollupTexts.some((text) => text.includes("Open Guest 2")),
  "rollup exposes a direct jump action for Guest 2",
);

roots["#apply"]._listeners.click();
assert.ok(
  api.getSpeakers().every((speaker) => speaker.state !== "suggested"),
  "apply action promotes suggested cleanup to applied",
);
assert.strictEqual(roots["#status"].textContent, "Sounds ready", "status updates after apply");
assert.ok(
  roots["#summary"].textContent.includes("Applied 2 cleanup choices"),
  "summary reflects the applied cleanup result",
);

console.log("audio-cleanup-controls: cleanup rollup and apply behavior are wired correctly");
