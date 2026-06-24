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

function runWithWindow(windowValue) {
  const testNodes = {
    "#moments": makeNode(),
    "#summary": makeNode(),
    "#readiness": makeNode(),
    "#lower-all": makeNode(),
    "#reset": makeNode(),
  };
  const testSandbox = {
    document: {
      querySelector(selector) {
        return testNodes[selector] || makeNode();
      },
      getElementById(id) {
        return testNodes["#" + id] || makeNode();
      },
      createElement() {
        return makeNode();
      },
    },
    window: windowValue,
    module: { exports: {} },
  };
  vm.runInNewContext(script, testSandbox);
  return testSandbox;
}

const {
  SAMPLE_MOMENTS,
  evaluate,
  issuesFor,
  momentSummary,
  applyDuckingAction,
  screenIdFromFile,
  musicActionHref,
  navigateToMusicAction,
} = sandbox.module.exports;

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
assert.equal(
  screenIdFromFile("music-cue-setup.html?placement=sponsor#review"),
  "music-cue-setup",
  "music ducking action routing extracts screen ids safely",
);
assert.equal(
  musicActionHref("music-cue-setup.html"),
  "music-cue-setup.html",
  "standalone music ducking action keeps the direct cue setup link",
);
navigateToMusicAction("music-cue-setup.html");
assert.equal(
  sandbox.window.location.href,
  "music-cue-setup.html",
  "standalone adjust-cue button navigates to the cue setup prototype",
);

const embeddedWindow = { location: { pathname: "/prototype/music-ducking-under-speech.html", href: "" } };
embeddedWindow.self = {};
embeddedWindow.top = { location: { pathname: "/preview/app.html", href: "" } };
const embedded = runWithWindow(embeddedWindow);
assert.equal(
  embedded.module.exports.musicActionHref("music-cue-setup.html"),
  "../preview/app.html#music-cue-setup",
  "embedded music ducking action resolves to the parent preview app route",
);
embedded.module.exports.navigateToMusicAction("music-cue-setup.html");
assert.equal(
  embeddedWindow.top.location.href,
  "../preview/app.html#music-cue-setup",
  "embedded adjust-cue button navigates the parent preview app",
);
assert.equal(embeddedWindow.location.href, "", "embedded music ducking action does not navigate only the iframe");

console.log("music-ducking-under-speech: overlap states and cue setup routing evaluate cleanly");
