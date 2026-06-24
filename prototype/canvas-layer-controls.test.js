"use strict";

// Dependency-free verification for the canvas layer controls prototype.
// Run with: `node prototype/canvas-layer-controls.test.js` (Node built-ins only).
//
// Supplies a tiny DOM stub so the page script runs to its module.exports block,
// then checks evaluate()'s layout guardrails: captions covered by a higher frame,
// unlocked brand elements, and hidden speakers.

const fs = require("fs");
const vm = require("vm");
const path = require("path");
const assert = require("assert");

function makeNode(tag) {
  return {
    tagName: tag, id: "", _children: [], style: {}, dataset: {},
    textContent: "", value: "", checked: false, disabled: false,
    set className(v) { this._cls = v; }, get className() { return this._cls; },
    setAttribute() {}, getAttribute() { return null; },
    addEventListener() {},
    appendChild(c) { this._children.push(c); return c; },
    append(...cs) { this._children.push(...cs); },
    replaceChildren(...cs) { this._children = cs; },
    querySelector() { return makeNode(); },
    querySelectorAll() { return []; },
  };
}

function load() {
  const html = fs.readFileSync(path.join(__dirname, "canvas-layer-controls.html"), "utf8");
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const ids = ["#layers", "#stage", "#status", "#checks", "#reuse", "#addType", "#addLayer", "#reset"];
  const roots = {};
  ids.forEach((s) => (roots[s] = makeNode()));
  const document = {
    createElement: (t) => makeNode(t),
    createTextNode: (t) => ({ textContent: t }),
    querySelector: (s) => roots[s] || makeNode(),
  };
  const sandbox = { document: document, structuredClone: globalThis.structuredClone, module: { exports: {} } };
  vm.createContext(sandbox);
  vm.runInContext(script, sandbox); // runs render() for the sample — must not throw
  return sandbox.module.exports;
}

const M = load();
assert.ok(typeof M.evaluate === "function", "prototype exports evaluate()");

function titles(list) {
  return M.evaluate(list).checks.map((c) => c.title);
}

// Top of the list draws on top. A speaker above captions covers them.
const covered = M.evaluate([
  { id: "a", type: "speaker", visible: true, locked: false },
  { id: "b", type: "captions", visible: true, locked: false },
]);
assert.ok(covered.checks.some((c) => /Captions may be covered/.test(c.title)), "speaker above captions => covered warning");
assert.strictEqual(covered.overall, "review", "a covered-captions conflict needs review");

// Captions above the speaker frame is fine.
const okOrder = M.evaluate([
  { id: "b", type: "captions", visible: true, locked: false },
  { id: "a", type: "speaker", visible: true, locked: false },
]);
assert.ok(!okOrder.checks.some((c) => /Captions may be covered/.test(c.title)), "captions above speaker is fine");

// A visible, unlocked brand layer should be flagged to lock.
assert.ok(
  M.evaluate([{ id: "x", type: "brand", visible: true, locked: false }]).checks.some((c) => /unlocked/i.test(c.title)),
  "unlocked brand element is flagged",
);
// Locking it clears the warning.
assert.ok(
  !M.evaluate([{ id: "x", type: "brand", visible: true, locked: true }]).checks.some((c) => /unlocked/i.test(c.title)),
  "locked brand element is not flagged",
);

// A hidden speaker frame is surfaced as info (not a blocker).
const hiddenSpeaker = M.evaluate([
  { id: "c", type: "captions", visible: true, locked: false },
  { id: "a", type: "speaker", visible: false, locked: false },
]);
assert.ok(hiddenSpeaker.checks.some((c) => /hidden/i.test(c.title) && c.tone === "info"), "hidden speaker is info");

// The regression the first version missed: a hidden speaker must be flagged even
// when another speaker frame is still visible (Host visible, Guest 1 hidden).
const mixedSpeakers = M.evaluate([
  { id: "host", type: "speaker", visible: true, locked: false },
  { id: "guest", type: "speaker", visible: false, locked: false },
]);
assert.ok(
  mixedSpeakers.checks.some((c) => /hidden/i.test(c.title)),
  "a hidden speaker is flagged even when another speaker is visible",
);

// A clean stack is ready to save.
const clean = M.evaluate([
  { id: "b", type: "captions", visible: true, locked: false },
  { id: "a", type: "speaker", visible: true, locked: false },
  { id: "g", type: "brand", visible: true, locked: true },
]);
assert.strictEqual(clean.overall, "ready", "a clean, locked-brand layout is ready to save");

// The saved-layout signature must change when EITHER the layers or the "adapts when
// reused" choices change, so saving then toggling a reuse option marks it unsaved.
if (typeof M.layoutSignature === "function") {
  const layersA = [{ id: "a", type: "speaker", visible: true, locked: false }];
  const reuseA = [{ id: "roles", label: "Speaker count and roles", on: true }];
  const reuseB = [{ id: "roles", label: "Speaker count and roles", on: false }];
  assert.notStrictEqual(
    M.layoutSignature(layersA, reuseA),
    M.layoutSignature(layersA, reuseB),
    "changing a reuse option changes the saved-layout signature",
  );
  const layersB = [{ id: "a", type: "speaker", visible: false, locked: false }];
  assert.notStrictEqual(
    M.layoutSignature(layersA, reuseA),
    M.layoutSignature(layersB, reuseA),
    "changing a layer changes the saved-layout signature",
  );
}

console.log("canvas layer controls: stack guardrails (cover, lock, hidden speaker) verified");
