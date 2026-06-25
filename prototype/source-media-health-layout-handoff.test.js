"use strict";

// Guards that source media health receives the layout-first placement handoff — the episode-flow
// entry screen for "Place videos in layout" (#1131 / #583). Run with:
//   `node prototype/source-media-health-layout-handoff.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const html = fs.readFileSync(path.join(__dirname, "source-media-health.html"), "utf8");
const handoff = require("../preview/layout-handoff.js");
const inlineScript = html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];

assert.ok(
  html.includes("../preview/layout-handoff.js"),
  "source media health loads the shared layout handoff helper",
);
assert.match(
  html,
  /id="layout-handoff" class="layout-handoff" hidden/,
  "source media health reserves a hidden layout-start summary",
);
assert.ok(
  html.includes("layoutHandoffApi.load(layoutHandoffStorage(), window.location.search)"),
  "source media health reads fresh URL handoff state and stored layout-start state",
);
assert.ok(
  html.includes("function layoutHandoffStorage()"),
  "source media health guards session storage access for static preview contexts",
);
assert.ok(
  html.includes("layoutHandoffApi.speakersFromState(layoutHandoff, sampleSpeakers)"),
  "source media health seeds its speaker rows from the selected layout when available",
);
assert.ok(
  html.includes("speakers = structuredClone(initialSpeakers);"),
  "reset returns to the current layout-start handoff instead of the generic sample",
);
assert.ok(
  html.includes("layoutHandoffApi.placementList(layoutHandoff)"),
  "source media health summarizes placed videos with their carried file names",
);
assert.doesNotMatch(
  html,
  /layoutHandoffElement\.innerHTML/,
  "layout handoff summary is not rendered with innerHTML",
);

const SIG = "name:rec.mp4|size:10|mtime:5";
const handoffState = handoff.stateFromSlots("interview", [
  { slot: "host", name: "host-cam.mp4", sig: "name:host-cam.mp4|size:1|mtime:1" },
  { slot: "guest", name: "guest-cam.mp4", sig: "name:guest-cam.mp4|size:2|mtime:2" },
]);
const seeded = handoff.speakersFromState(handoffState, []);
assert.deepEqual(
  seeded.map((speaker) => [speaker.id, speaker.role, speaker.condition]),
  [["host", "Host", "good"], ["guest", "Guest 1", "good"]],
  "layout handoff creates speaker rows that match the placed speaker slots",
);
assert.ok(
  seeded.every((speaker) => speaker.sig),
  "carried recordings bring their identity (sig) into source media health rows",
);

const dupSpeakers = handoff.speakersFromState(
  handoff.stateFromSlots("interview", [
    { slot: "host", name: "rec.mp4", sig: SIG },
    { slot: "guest", name: "rec.mp4", sig: SIG },
  ]),
  [],
);
assert.deepEqual(
  dupSpeakers.map((speaker) => speaker.name),
  ["Host: rec.mp4", "Guest 1: rec.mp4"],
  "duplicate carried file names are labelled by slot before source media health renders them",
);

function makeNode(tag) {
  return {
    tagName: tag, id: "", _children: [], style: {}, dataset: {}, hidden: undefined,
    textContent: "", value: "", checked: false, disabled: false,
    set className(v) { this._cls = v; }, get className() { return this._cls; },
    setAttribute() {}, getAttribute() { return null; }, removeAttribute() {},
    addEventListener() {}, append(...c) { this._children.push(...c); },
    appendChild(c) { this._children.push(c); return c; },
    replaceChildren(...c) { this._children = c; },
    insertBefore(c) { this._children.unshift(c); return c; },
    remove() {}, querySelector() { return makeNode(); }, querySelectorAll() { return []; },
  };
}

function loadEvaluate() {
  const roots = {};
  [
    "#speakers", "#status", "#issues", "#batchImport", "#batchStatus", "#batchDetail",
    "#batchToolbar", "#batchLinks", "#batchConditionTags", "#batchFilterNote", "#layout-handoff",
    "#addSpeaker", "#reset",
  ].forEach((sel) => {
    roots[sel] = makeNode();
  });
  const documentStub = {
    createElement: (tag) => makeNode(tag),
    createTextNode: (text) => ({ textContent: text }),
    querySelector: (sel) => roots[sel] || makeNode(),
  };
  const windowStub = { PodcastLayoutHandoff: handoff, location: { search: "" }, sessionStorage: undefined };
  const sandbox = { document: documentStub, window: windowStub, structuredClone: globalThis.structuredClone, console };
  vm.createContext(sandbox);
  vm.runInContext(inlineScript, sandbox);
  assert.strictEqual(typeof sandbox.evaluate, "function", "extracted evaluate() from source-media-health.html");
  return sandbox.evaluate;
}

const evaluate = loadEvaluate();
const dupEval = evaluate(dupSpeakers);
assert.strictEqual(dupEval.overall, "review", "the same recording in two speaker slots flags review");
const dupIssues = dupEval.results.map((result) => result.issue).filter(Boolean);
assert.ok(
  dupIssues.some((issue) => /shares a recording/i.test(issue.title)),
  "source media health surfaces a same-recording issue per speaker row",
);

const search = "?" + handoff.queryForState(handoffState);
const roots = {};
[
  "#speakers", "#status", "#issues", "#batchImport", "#batchStatus", "#batchDetail",
  "#batchToolbar", "#batchLinks", "#batchConditionTags", "#batchFilterNote", "#layout-handoff",
  "#addSpeaker", "#reset",
].forEach((sel) => {
  roots[sel] = makeNode();
});
const documentStub = {
  createElement: (tag) => makeNode(tag),
  createTextNode: (text) => ({ textContent: text }),
  querySelector: (sel) => roots[sel] || makeNode(),
};
const windowStub = { PodcastLayoutHandoff: handoff, location: { search }, sessionStorage: undefined };
const sandbox = { document: documentStub, window: windowStub, structuredClone: globalThis.structuredClone, console };
vm.createContext(sandbox);
vm.runInContext(inlineScript, sandbox);

const summary = roots["#layout-handoff"];
assert.strictEqual(summary.hidden, false, "the layout-start summary is revealed when a handoff is present");
assert.strictEqual(summary._children.length, 2, "the summary renders a heading and a copy line");
assert.match(summary._children[0].textContent, /Interview layout/i, "the summary names the carried layout");
assert.match(
  summary._children[1].textContent,
  /host-cam\.mp4/,
  "the summary lists the placed host recording carried from layout start",
);

console.log("source media health: layout-first handoff seeds speakers and surfaces placed videos");
