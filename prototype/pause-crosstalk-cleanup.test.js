"use strict";

// Minimal, dependency-free verification for the "Apply to similar" batch control
// added to the pause and cross-talk cleanup prototype.
// Run with: `node prototype/pause-crosstalk-cleanup.test.js` (Node built-ins only).
//
// The prototype is browser-only, so the test supplies a tiny DOM stub that lets the
// page script run to its `module.exports` block and also confirms the render path
// does not throw. The assertions then exercise the pure batch-apply helpers.

const fs = require("fs");
const vm = require("vm");
const path = require("path");
const assert = require("assert");

function makeNode() {
  const node = {
    _children: [], style: {}, dataset: {}, textContent: "", value: "",
    set innerHTML(v) { this._html = v; }, get innerHTML() { return this._html; },
    set className(v) { this._cls = v; }, get className() { return this._cls; },
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
  const html = fs.readFileSync(path.join(__dirname, "pause-crosstalk-cleanup.html"), "utf8");
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const roots = {};
  ["#moments", "#status", "#issues", "#addMoment", "#reset"].forEach((s) => (roots[s] = makeNode()));
  const document = { createElement: () => makeNode(), querySelector: (s) => roots[s] || makeNode() };
  // vm contexts do not inherit Node globals; the prototype uses structuredClone, which
  // exists natively in the browser, so provide it here.
  const sandbox = { document, structuredClone: globalThis.structuredClone, module: { exports: {} } };
  vm.createContext(sandbox);
  vm.runInContext(script, sandbox); // runs render() for the sample — must not throw
  return sandbox.module.exports;
}

const M = load();
const sample = M.sampleMoments;
const idx = (id) => sample.findIndex((m) => m.id === id);
const p1 = idx("p1"); // dead-air, shorten
const p5 = idx("p5"); // dead-air, review  (the same-kind pair)
const p2 = idx("p2"); // crosstalk, review (unique kind)

// 1. The control is offered only from a RESOLVED card with a differing same-kind peer.
assert.strictEqual(M.canApplySimilar(p1, sample), true, "p1 (dead-air, shorten) offers Apply to similar");
assert.strictEqual(M.countSimilar(p1, sample), 1, "exactly one other dead-air differs");
// p5 is the same kind as p1 but still undecided (review): it must NOT offer the
// control, because spreading "decide later" would undo p1's real cleanup decision.
assert.strictEqual(M.canApplySimilar(p5, sample), false, "p5 is undecided (review) -> no batch control");
assert.strictEqual(M.canApplySimilar(p2, sample), false, "crosstalk is unique -> no control");

// 2. Applying propagates a real decision, then the control disappears (never a no-op).
const after = M.applySimilar(p1, sample);
assert.strictEqual(after[p5].choice, "shorten", "p5 takes p1's shorten");
assert.strictEqual(after[p1].choice, "shorten", "p1 is unchanged");
assert.strictEqual(M.canApplySimilar(p1, after), false, "control gone once all dead-air match");
assert.strictEqual(M.countSimilar(p1, after), 0);

// 3. Other kinds are never touched.
assert.strictEqual(after[p2].choice, sample[p2].choice, "crosstalk moment untouched");

// 4. The count never overstates: 2 already match, 1 differs => 1.
const three = [
  { id: "a", kind: "dead-air", choice: "shorten" },
  { id: "b", kind: "dead-air", choice: "shorten" },
  { id: "c", kind: "dead-air", choice: "review" },
];
assert.strictEqual(M.countSimilar(0, three), 1, "already-matching moments are not counted");
const t2 = M.applySimilar(0, three);
assert.strictEqual(t2[1].choice, "shorten", "already-matching moment stays");
assert.strictEqual(t2[2].choice, "shorten", "the differing moment is updated (resolved -> applied)");
// The resolved source (a) offers the control; the undecided source (c) does not,
// even though it has differing same-kind peers — it would only spread "review".
assert.strictEqual(M.canApplySimilar(0, three), true, "resolved 'shorten' source offers the control");
assert.strictEqual(M.canApplySimilar(2, three), false, "undecided 'review' source never offers it");

// 5. A propagated choice is valid for the kind and evaluates normally.
assert.strictEqual(M.evaluate(after).results[p5].state, "cleaned", "shortened dead-air reads as cleaned");

console.log("pause-crosstalk-cleanup (Apply to similar): all assertions passed");
