"use strict";

// Behavioral smoke test for the source media health screen — the first step of the
// episode flow (#582 / #584). The page is browser-only, so a tiny DOM stub lets the
// script run to its module.exports, then we exercise evaluate() directly.
// Run with: `node prototype/source-media-health.test.js` (Node built-ins only).

const fs = require("fs");
const vm = require("vm");
const path = require("path");
const assert = require("assert");

function makeNode(tag) {
  const node = {
    tagName: tag, id: "", _children: [], style: {}, dataset: {},
    textContent: "", value: "", selected: false, checked: false,
    set innerHTML(v) { this._html = v; }, get innerHTML() { return this._html; },
    set className(v) { this._cls = v; }, get className() { return this._cls; },
    classList: { add() {}, remove() {}, toggle() {} },
    setAttribute() {}, getAttribute() { return null; },
    removeAttribute() {}, hasAttribute() { return false; },
    addEventListener() {}, removeEventListener() {},
    appendChild(c) { this._children.push(c); return c; },
    append(...cs) { this._children.push(...cs); },
    prepend(...cs) { this._children.unshift(...cs); },
    insertBefore(c) { this._children.unshift(c); return c; },
    replaceChildren(...cs) { this._children = cs; },
    querySelector() { return makeNode(); },
    querySelectorAll() { return []; },
    get children() { return this._children; },
    remove() {}, closest() { return null; }, contains() { return false; }, focus() {},
  };
  return node;
}

function load() {
  const html = fs.readFileSync(path.join(__dirname, "source-media-health.html"), "utf8");
  // Lazy match grabs only the inline page script, not the external nav <script src>.
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const document = { createElement: (t) => makeNode(t), querySelector: () => makeNode() };
  const sandbox = { document, structuredClone: globalThis.structuredClone, module: { exports: {} } };
  vm.createContext(sandbox);
  vm.runInContext(script, sandbox); // runs render() for the sample — must not throw
  return sandbox.module.exports;
}

const M = load();
const one = (speaker) => M.evaluate([speaker]);
const state = (speaker) => one(speaker).results[0].state;

// 1) A good file is ready, and a lineup of good files is ready overall.
assert.strictEqual(state({ id: "a", role: "Host", name: "Dana", condition: "good", disposition: "keep" }), "ready");
assert.strictEqual(one({ id: "a", role: "Host", name: "Dana", condition: "good", disposition: "keep" }).overall, "ready");

// 2) Conditions the model marks unavailable / needs replacement block export.
assert.strictEqual(state({ id: "b", role: "Guest", name: "Mara", condition: "incomplete", disposition: "keep" }), "unavailable");
assert.strictEqual(one({ id: "b", role: "Guest", name: "Mara", condition: "incomplete", disposition: "keep" }).overall, "blocked");
assert.strictEqual(state({ id: "c", role: "Guest", name: "Sam", condition: "no-audio", disposition: "keep" }), "needs replacement");
assert.strictEqual(one({ id: "c", role: "Guest", name: "Sam", condition: "no-audio", disposition: "keep" }).overall, "blocked");

// 3) A soft/dark review condition is "review suggested" while undecided.
assert.strictEqual(state({ id: "d", role: "Guest", name: "Lee", condition: "dark", disposition: "keep" }), "review suggested");
assert.strictEqual(one({ id: "d", role: "Guest", name: "Lee", condition: "dark", disposition: "keep" }).overall, "review");

// 4) The creator's decision changes the outcome: replacing clears it; audio-only and
//    warn are both non-blocking resolutions.
assert.strictEqual(state({ id: "e", role: "Guest", name: "Lee", condition: "dark", disposition: "replace" }), "ready");
assert.strictEqual(state({ id: "f", role: "Guest", name: "Lee", condition: "dark", disposition: "audio-only" }), "audio-only usable");
assert.strictEqual(state({ id: "g", role: "Guest", name: "Lee", condition: "dark", disposition: "warn" }), "ready");

// 5) A disposition that isn't valid for the condition is ignored (treated as undecided),
//    so the logic can never act on an option the UI wouldn't offer. "quiet" has no
//    audio-only step, so an audio-only value falls back to review-suggested.
assert.ok(!M.conditions.quiet.steps.includes("audio-only"), "guard precondition: quiet has no audio-only step");
assert.strictEqual(state({ id: "h", role: "Guest", name: "Lee", condition: "quiet", disposition: "audio-only" }), "review suggested");

// 6) The shipped sample (good, dark, incomplete, quiet) is blocked by the incomplete file.
const sample = M.evaluate(M.sampleSpeakers);
assert.strictEqual(sample.results.length, 4, "evaluates every sample speaker");
assert.strictEqual(sample.overall, "blocked", "sample is blocked by the incomplete file");

console.log("source-media-health (evaluate states + decision gating): all assertions passed");
