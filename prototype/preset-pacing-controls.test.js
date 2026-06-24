"use strict";

// Dependency-free verification for the preset pacing controls prototype.
// Run with: node prototype/preset-pacing-controls.test.js
//
// A tiny DOM stub lets the page script run to its module.exports block, then we
// check the pure effect-level and timeline helpers behave as the spec implies.

const fs = require("fs");
const vm = require("vm");
const path = require("path");
const assert = require("assert");

function makeNode(tag) {
  return {
    tagName: tag, id: "", _children: [], style: {}, dataset: {},
    textContent: "", value: "", checked: false, disabled: false,
    set className(v) { this._cls = v; }, get className() { return this._cls; },
    get children() { return this._children; },
    setAttribute() {}, getAttribute() { return null; },
    addEventListener() {},
    appendChild(c) { this._children.push(c); return c; },
    append() {}, replaceChildren() { this._children = []; },
    querySelector() { return makeNode(); },
    querySelectorAll() { return []; },
  };
}

function load() {
  const html = fs.readFileSync(path.join(__dirname, "preset-pacing-controls.html"), "utf8");
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const ids = ["#options", "#moment", "#timeline", "#effects", "#note", "#applied", "#apply", "#reset"];
  const roots = {};
  ids.forEach((s) => (roots[s] = makeNode()));
  const document = { createElement: (t) => makeNode(t), querySelector: (s) => roots[s] || makeNode() };
  const sandbox = { document: document, Math: Math, module: { exports: {} } };
  vm.createContext(sandbox);
  vm.runInContext(script, sandbox); // runs render() for the sample — must not throw
  return sandbox.module.exports;
}

const M = load();
assert.ok(typeof M.effectLevels === "function", "exports effectLevels()");
assert.ok(typeof M.timelineHeights === "function", "exports timelineHeights()");

// Every pacing feel sets all six effects on a 0-3 scale.
const keys = ["title", "broll", "caption", "transition", "pause", "chapter"];
Object.keys(M.PACING).forEach((p) => {
  const fx = M.effectLevels(p);
  keys.forEach((k) => {
    assert.ok(typeof fx[k] === "number" && fx[k] >= 0 && fx[k] <= 3, p + " sets " + k + " on a 0-3 scale");
  });
});

// Punchy commentary is more energetic than a calm interview.
assert.ok(M.effectLevels("punchy").broll > M.effectLevels("calm").broll, "punchy has stronger b-roll than calm");
assert.ok(M.effectLevels("punchy").title > M.effectLevels("calm").title, "punchy has more title moments than calm");

// The energy timeline is an 8-bar curve clamped to a visible range, and it changes
// with the previewed moment so one feel is shown across the episode, not one clip.
const open = M.timelineHeights("balanced", "opening");
const quiet = M.timelineHeights("balanced", "quiet");
assert.strictEqual(open.length, 8, "timeline has eight bars");
assert.ok(open.every((h) => h >= 12 && h <= 100), "timeline bars stay within the visible range");
assert.notDeepStrictEqual(open, quiet, "different preview moments produce different energy curves");

console.log("preset pacing controls: effect levels and energy timeline behave per spec");
