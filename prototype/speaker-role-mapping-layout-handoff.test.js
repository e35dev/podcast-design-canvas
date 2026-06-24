"use strict";

// Guards that speaker role mapping receives the layout-first start handoff.
// Run with: `node prototype/speaker-role-mapping-layout-handoff.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const html = fs.readFileSync(path.join(__dirname, "speaker-role-mapping.html"), "utf8");
const handoff = require("../preview/layout-handoff.js");

assert.ok(
  html.includes("../preview/layout-handoff.js"),
  "speaker role mapping loads the shared layout handoff helper",
);
assert.match(
  html,
  /id="layout-handoff" class="layout-handoff" hidden/,
  "speaker role mapping reserves a hidden layout-start summary",
);
assert.ok(
  html.includes("layoutHandoffApi.load(layoutHandoffStorage(), window.location.search)"),
  "speaker role mapping reads fresh URL handoff state and stored layout-start state",
);
assert.ok(
  html.includes("function layoutHandoffStorage()"),
  "speaker role mapping guards session storage access for static preview contexts",
);
assert.ok(
  html.includes("layoutHandoffApi.tracksFromState(layoutHandoff, sampleTracks)"),
  "speaker role mapping seeds its tracks from the selected layout when available",
);
assert.ok(
  html.includes("tracks = structuredClone(initialTracks);"),
  "reset returns to the current layout-start handoff instead of the generic sample",
);
assert.doesNotMatch(
  html,
  /layoutHandoffElement\.innerHTML/,
  "layout handoff summary is not rendered with innerHTML",
);
assert.ok(
  html.includes("layoutHandoffApi.placementList(layoutHandoff)"),
  "speaker role mapping summarizes placed videos with their carried file names",
);

const handoffState = handoff.stateFromSlots("interview", [{ slot: "host" }, { slot: "guest" }]);
const seeded = handoff.tracksFromState(handoffState, []);
assert.deepEqual(
  seeded.map((track) => track.role),
  ["host", "guest"],
  "layout handoff creates role rows that match the placed speaker slots",
);

// The handoff carries each placed recording's identity (sig), so production can tell
// whether two speaker slots hold the SAME source recording (#1026/#1131).
const SIG = "name:rec.mp4|size:10|mtime:5";
const dupTracks = handoff.tracksFromState(
  handoff.stateFromSlots("interview", [
    { slot: "host", name: "rec.mp4", sig: SIG },
    { slot: "guest", name: "rec.mp4", sig: SIG },
  ]),
  [],
);
assert.ok(
  dupTracks.length === 2 && dupTracks.every((track) => track.sig === SIG),
  "the handoff carries each recording's identity (sig) into role-mapping tracks",
);
const distinctTracks = handoff.tracksFromState(
  handoff.stateFromSlots("interview", [
    { slot: "host", name: "a.mp4", sig: "name:a.mp4|size:1|mtime:1" },
    { slot: "guest", name: "b.mp4", sig: "name:b.mp4|size:2|mtime:2" },
  ]),
  [],
);
assert.notStrictEqual(distinctTracks[0].sig, distinctTracks[1].sig, "distinct recordings carry distinct identities");
const noSigTracks = handoff.tracksFromState(handoff.stateFromSlots("interview", [{ slot: "host" }, { slot: "guest" }]), []);
assert.ok(noSigTracks.every((track) => track.sig === ""), "tracks placed without a carried identity have an empty sig");

// evaluate() flips the production gate to "review" when two speakers share one recording,
// keying ONLY on the carried sig (never on names). Driven through the real page logic.
const evaluate = loadEvaluate();
const dupEval = evaluate([
  { id: "h", name: "rec.mp4", role: "host", sig: SIG, signal: "file-name", decision: "confirmed" },
  { id: "g", name: "rec.mp4", role: "guest", sig: SIG, signal: "file-name", decision: "confirmed" },
]);
assert.strictEqual(dupEval.overall, "review", "the same recording in two speaker slots flips the gate to review");
assert.ok(
  dupEval.results.some((result) => result.issue && /same recording/i.test(result.issue.title)),
  "role mapping surfaces a same-recording issue",
);
const okEval = evaluate([
  { id: "h", name: "a.mp4", role: "host", sig: "name:a.mp4|size:1|mtime:1", signal: "file-name", decision: "confirmed" },
  { id: "g", name: "b.mp4", role: "guest", sig: "name:b.mp4|size:2|mtime:2", signal: "file-name", decision: "confirmed" },
]);
assert.ok(
  !okEval.results.some((result) => result.issue && /same recording/i.test(result.issue.title)),
  "two distinct recordings are not flagged as the same recording",
);
const emptySigEval = evaluate([
  { id: "h", name: "Host", role: "host", sig: "", signal: "track-label", decision: "confirmed" },
  { id: "g", name: "Guest", role: "guest", sig: "", signal: "track-label", decision: "confirmed" },
]);
assert.ok(
  !emptySigEval.results.some((result) => result.issue && /same recording/i.test(result.issue.title)),
  "tracks without a carried identity never trigger the same-recording flag",
);

console.log("speaker role mapping: layout-first handoff hook + same-recording gate verified");

// Extract the page's evaluate() by running its inline script against a tiny DOM/window stub,
// the same dependency-free approach used by the other prototype behavior tests.
function loadEvaluate() {
  const vm = require("vm");
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  function makeNode(tag) {
    return {
      tagName: tag, id: "", _children: [], style: {}, dataset: {},
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
  const roots = {};
  ["#tracks", "#status", "#issues", "#layout-handoff", "#addTrack", "#reset"].forEach((sel) => {
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
  vm.runInContext(script, sandbox); // runs render() on the sample tracks — must not throw
  assert.strictEqual(typeof sandbox.evaluate, "function", "extracted evaluate() from speaker-role-mapping.html");
  return sandbox.evaluate;
}
