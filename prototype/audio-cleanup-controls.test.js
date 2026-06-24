"use strict";

// Regression checks for audio cleanup preview copy and rollup hints.
// Run with: `node prototype/audio-cleanup-controls.test.js`

const fs = require("fs");
const vm = require("vm");
const path = require("path");
const assert = require("assert");

function makeNode() {
  const node = {
    _children: [], style: {}, dataset: {}, textContent: "", value: "",
    set innerHTML(v) { this._html = v; }, get innerHTML() { return this._html; },
    set className(v) { this._cls = v; }, get className() { return this._cls; },
    classList: { add() {}, remove() {}, toggle() {} },
    setAttribute() {}, getAttribute() { return null; },
    addEventListener() {},
    appendChild(c) { this._children.push(c); return c; },
    append(...cs) { this._children.push(...cs); },
    replaceChildren(...cs) { this._children = cs; },
    querySelector() { return makeNode(); },
    querySelectorAll() { return []; },
    get children() { return this._children; },
  };
  return node;
}

function load() {
  const html = fs.readFileSync(path.join(__dirname, "audio-cleanup-controls.html"), "utf8");
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const roots = {};
  [
    "#controls", "#moments", "#compare-section", "#speakers", "#cleanupRollup",
    "#status", "#summary", "#moment-hint", "#preview-now", "#preview-tradeoff", "#apply",
  ].forEach((s) => (roots[s] = makeNode()));
  const document = { createElement: () => makeNode(), querySelector: (s) => roots[s] || makeNode() };
  const sandbox = { document, structuredClone: globalThis.structuredClone, module: { exports: {} } };
  vm.createContext(sandbox);
  vm.runInContext(script, sandbox);
  return sandbox.module.exports;
}

const M = load();
const quietGuest = M.previewMoments.find((entry) => entry.id === "quiet-guest");

assert.strictEqual(M.previewTradeoffCopy(0, quietGuest), "", "tradeoff hidden when no choices enabled");
assert.strictEqual(
  M.previewTradeoffCopy(2, quietGuest),
  quietGuest.note,
  "tradeoff shows moment note when choices are enabled",
);
assert.strictEqual(M.previewTradeoffCopy(2, { note: 42 }), "", "tradeoff skips non-string notes");
assert.strictEqual(M.previewCardCaption("How cleanup changes this moment."), "How cleanup changes this moment.");
assert.strictEqual(M.previewCardCaption(null), "", "compare caption falls back for missing note");

const enabled = M.choices.filter((choice) => ["balance", "quiet"].includes(choice.id));
const hints = M.enabledChoiceHints(enabled);
assert.ok(hints.length >= 2, "enabled choices with hints produce rollup hint rows");
assert.ok(hints.every((entry) => entry.label && entry.hint), "rollup hints require label and hint copy");

console.log("audio-cleanup-controls (preview copy regression): all assertions passed");
