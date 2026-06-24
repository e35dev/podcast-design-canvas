"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const html = fs.readFileSync(path.join(__dirname, "music-cue-setup.html"), "utf8");
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
  "#placements": makeNode(),
  "#summary": makeNode(),
  "#readiness": makeNode(),
  "#approve-ready": makeNode(),
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

const { SAMPLE_PLACEMENTS, evaluate, issuesFor, placementSummary } = sandbox.module.exports;

assert.strictEqual(evaluate(SAMPLE_PLACEMENTS).overall, "blocked");
assert.strictEqual(evaluate(SAMPLE_PLACEMENTS).review, true);

const allReady = SAMPLE_PLACEMENTS.map((item) => ({ ...item, state: "ready", approval: "approved" }));
assert.strictEqual(evaluate(allReady).overall, "ready");

const overlapOnly = SAMPLE_PLACEMENTS.map((item) => (
  item.state === "overlap-speech"
    ? item
    : { ...item, state: "ready", approval: "approved" }
));
assert.strictEqual(evaluate(overlapOnly).overall, "review");

const overlapIssues = issuesFor(evaluate(overlapOnly), overlapOnly);
assert.ok(
  overlapIssues.some((issue) => issue.fixScreen === "music-ducking-under-speech.html"),
  "overlap placements route to ducking review",
);

const summary = placementSummary(SAMPLE_PLACEMENTS);
assert.strictEqual(summary.total, SAMPLE_PLACEMENTS.length);
assert.ok(summary.blocked >= 1, "sample episode includes blocked placements");

assert.ok(html.includes("../preview/music-nav.js"), "music cue setup loads music navigation");
assert.ok(html.includes('data-music-step="music-cue-setup"'), "music cue setup declares its step");

console.log("music-cue-setup: placement states and ducking hand-off evaluate cleanly");
