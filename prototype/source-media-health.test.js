"use strict";

// Verifies the source-media health "trim to fit" next step for a track that
// starts late or runs long (docs/source-media-health.md → Creator Controls).
// Run with: `node prototype/source-media-health.test.js` (Node built-ins only).
//
// The prototype is browser-only, so a tiny DOM stub lets the page script run to
// its `module.exports` block, then we exercise evaluate() directly.

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
    setAttribute() {}, getAttribute() { return null; }, removeAttribute() {},
    addEventListener() {},
    appendChild(c) { this._children.push(c); return c; },
    append(...cs) { this._children.push(...cs); },
    prepend(...cs) { this._children.unshift(...cs); },
    replaceChildren(...cs) { this._children = cs; },
    querySelector() { return makeNode(); },
    querySelectorAll() { return []; },
    get children() { return this._children; },
    remove() {},
    closest() { return null; },
  };
  return node;
}

function load() {
  const html = fs.readFileSync(path.join(__dirname, "source-media-health.html"), "utf8");
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const head = makeNode("head");
  const body = makeNode("body");
  const document = {
    createElement: (t) => makeNode(t),
    querySelector: () => makeNode(),
    head,
    body,
  };
  const sandbox = { document, structuredClone: globalThis.structuredClone, module: { exports: {} } };
  vm.createContext(sandbox);
  vm.runInContext(script, sandbox); // runs render() for the sample — must not throw
  return sandbox.module.exports;
}

const M = load();

// 1. The timing condition exists, is non-blocking, and offers a "trim" next step.
assert.ok(M.conditions.timing, "a timing condition is defined");
assert.strictEqual(M.conditions.timing.natural, "review suggested", "timing is a non-blocking review state");
assert.ok(M.conditions.timing.steps.includes("trim"), "timing offers a trim next step");
assert.strictEqual(M.dispositions.trim, "Trim to fit the episode", "trim disposition is labelled for creators");

// 2. A timing track left undecided asks for review; trimming it resolves to ready.
const undecided = [{ id: "t", name: "Guest — Sam", role: "Guest", condition: "timing", disposition: "keep" }];
assert.strictEqual(M.evaluate(undecided).results[0].state, "review suggested",
  "an undecided timing track stays in review suggested");

const trimmed = [{ id: "t", name: "Guest — Sam", role: "Guest", condition: "timing", disposition: "trim" }];
const trimmedResult = M.evaluate(trimmed).results[0];
assert.strictEqual(trimmedResult.state, "ready", "trimming a timing track makes it ready");
assert.ok(/trimmed to fit/i.test(trimmedResult.issue.title || ""), "trim explains its effect on the episode");

// 3. Trim never resolves a missing/corrupted file — those still need replacement.
const corruptTrimmed = [{ id: "c", name: "Guest — A", role: "Guest", condition: "incomplete", disposition: "trim" }];
assert.strictEqual(M.evaluate(corruptTrimmed).results[0].state, "unavailable",
  "trim is ignored for a condition that does not offer it (stays unavailable)");

console.log("source-media-health (trim to fit): all assertions passed");
