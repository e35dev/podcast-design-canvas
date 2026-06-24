"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const html = fs.readFileSync(path.join(__dirname, "music-ducking-under-speech.html"), "utf8");
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

function makeNode() {
  const node = {
    className: "",
    textContent: "",
    href: "",
    _children: [],
    append(...cs) {
      this._children.push(...cs);
      return cs[cs.length - 1];
    },
    appendChild(c) {
      this._children.push(c);
      return c;
    },
    replaceChildren(...cs) {
      this._children = cs;
    },
    get lastChild() {
      return this._children[this._children.length - 1];
    },
    addEventListener() {},
  };
  return node;
}

const nodes = {
  "#moments": makeNode(),
  "#summary": makeNode(),
  "#readiness": makeNode(),
  "#lower-all": makeNode(),
  "#reset": makeNode(),
};

const sandbox = {
  document: {
    querySelector(selector) {
      return nodes[selector] || makeNode();
    },
    getElementById(id) {
      return nodes["#" + id] || makeNode();
    },
    createElement() {
      return makeNode();
    },
  },
  window: { location: { href: "" } },
  module: { exports: {} },
};

vm.runInNewContext(script, sandbox);

const { SAMPLE_MOMENTS, evaluate, issuesFor, momentSummary, applyDuckingAction } = sandbox.module.exports;

assert.strictEqual(evaluate(SAMPLE_MOMENTS).overall, "blocked");
assert.strictEqual(evaluate(SAMPLE_MOMENTS).review, true);

const lowered = SAMPLE_MOMENTS.map((item) => (
  item.state === "speech-hard" || item.state === "review-overlap" || item.state === "template-balance"
    ? { ...item, state: "clear" }
    : item
));
assert.strictEqual(evaluate(lowered).overall, "clear");

const hardIssue = issuesFor(evaluate(SAMPLE_MOMENTS), SAMPLE_MOMENTS).find((issue) => issue.tone === "block");
assert.ok(hardIssue, "speech-hard moments surface blocking issues");
assert.equal(hardIssue.fixScreen, "music-cue-setup.html", "speech-hard issues route back to cue setup");
assert.equal(hardIssue.fixLabel, "music cue setup");

const idx = SAMPLE_MOMENTS.findIndex((item) => item.id === "transition-platform");
const afterLower = applyDuckingAction(SAMPLE_MOMENTS, SAMPLE_MOMENTS[idx].id, "lower");
assert.strictEqual(afterLower[idx].state, "clear");

const summary = momentSummary(SAMPLE_MOMENTS);
assert.strictEqual(summary.total, SAMPLE_MOMENTS.length);
assert.ok(summary.blocked >= 1, "sample episode includes blocked ducking moments");

assert.ok(html.includes("../preview/music-nav.js"), "music ducking loads music navigation");
assert.ok(html.includes('data-music-step="music-ducking-under-speech"'), "music ducking declares its step");

console.log("music-ducking-under-speech: overlap states and cue setup routing evaluate cleanly");
