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

function runWithWindow(windowValue) {
  const testNodes = {
    "#placements": makeNode(),
    "#summary": makeNode(),
    "#readiness": makeNode(),
    "#approve-ready": makeNode(),
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
  SAMPLE_PLACEMENTS,
  evaluate,
  issuesFor,
  placementSummary,
  screenIdFromFile,
  musicActionHref,
  navigateToMusicAction,
} = sandbox.module.exports;

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
assert.equal(
  screenIdFromFile("music-ducking-under-speech.html?moment=transition#review"),
  "music-ducking-under-speech",
  "music cue action routing extracts screen ids safely",
);
assert.equal(
  musicActionHref("music-ducking-under-speech.html"),
  "music-ducking-under-speech.html",
  "standalone music cue action keeps the direct ducking link",
);
navigateToMusicAction("music-ducking-under-speech.html");
assert.equal(
  sandbox.window.location.href,
  "music-ducking-under-speech.html",
  "standalone review-ducking button navigates to the ducking prototype",
);

const embeddedWindow = { location: { pathname: "/prototype/music-cue-setup.html", href: "" } };
embeddedWindow.self = {};
embeddedWindow.top = { location: { pathname: "/preview/app.html", href: "" } };
const embedded = runWithWindow(embeddedWindow);
assert.equal(
  embedded.module.exports.musicActionHref("music-ducking-under-speech.html"),
  "../preview/app.html#music-ducking-under-speech",
  "embedded music cue action resolves to the parent preview app route",
);
embedded.module.exports.navigateToMusicAction("music-ducking-under-speech.html");
assert.equal(
  embeddedWindow.top.location.href,
  "../preview/app.html#music-ducking-under-speech",
  "embedded review-ducking button navigates the parent preview app",
);
assert.equal(embeddedWindow.location.href, "", "embedded music cue action does not navigate only the iframe");

console.log("music-cue-setup: placement states and ducking hand-off evaluate cleanly");
