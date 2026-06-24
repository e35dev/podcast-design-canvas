"use strict";

// Minimal, dependency-free verification for the "Mark intentional" gate in the
// speaker sync repair prototype.
// Run with: `node prototype/speaker-sync-repair.test.js` (Node built-ins only).
//
// The prototype is browser-only, so the test supplies a tiny DOM stub that lets the
// page script run to its `module.exports` block. It then renders individual track
// cards and inspects which action buttons appear, plus checks evaluate()'s states.

const fs = require("fs");
const vm = require("vm");
const path = require("path");
const assert = require("assert");

function makeNode(tag) {
  const node = {
    tagName: tag, id: "", _children: [], style: {}, dataset: {},
    textContent: "", value: "", selected: false,
    set innerHTML(v) { this._html = v; }, get innerHTML() { return this._html; },
    set className(v) { this._cls = v; }, get className() { return this._cls; },
    classList: { add() {}, remove() {}, toggle() {} },
    setAttribute() {}, getAttribute() { return null; },
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
  const html = fs.readFileSync(path.join(__dirname, "speaker-sync-repair.html"), "utf8");
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const roots = {};
  ["#tracks", "#trackRollup", "#status", "#issues", "#reset"].forEach((s) => (roots[s] = makeNode()));
  const document = { createElement: (t) => makeNode(t), querySelector: (s) => roots[s] || makeNode() };
  const sandbox = { document, structuredClone: globalThis.structuredClone, module: { exports: {} } };
  vm.createContext(sandbox);
  vm.runInContext(script, sandbox); // runs render() for the sample — must not throw
  return sandbox.module.exports;
}

const M = load();

// Collect every textContent in a rendered node tree (button labels included).
function allText(node, out = []) {
  if (!node) return out;
  if (typeof node.textContent === "string" && node.textContent) out.push(node.textContent);
  (node._children || []).forEach((c) => allText(c, out));
  return out;
}

function buttonsFor(issueKey) {
  const track = { id: "t", name: "Guest 1 — Marcus Lee", issue: issueKey, proposedRepair: "", resolution: null, previewMoment: "episode-start" };
  const result = M.evaluate([track]).results[0];
  return allText(M.renderTrack(track, 0, result));
}

// 1. Data contract the gate relies on: the two blocking issues omit "intentional";
//    the issues where deliberate timing is plausible include it.
assert.ok(M.issues["ends-early"].blocksExport === true && !M.issues["ends-early"].repairs.includes("intentional"),
  "ends-early blocks export and does not list 'intentional'");
assert.ok(M.issues["duplicate"].blocksExport === true && !M.issues["duplicate"].repairs.includes("intentional"),
  "duplicate blocks export and does not list 'intentional'");
["video-late", "audio-early", "drift", "attribution"].forEach((k) => {
  assert.ok(M.issues[k].repairs.includes("intentional"), k + " lists 'intentional'");
});

// 2. The gate at render time: no "Mark intentional" button on the blocking issues,
//    but the row still offers its real resolutions.
["ends-early", "duplicate"].forEach((k) => {
  const labels = buttonsFor(k);
  assert.ok(!labels.includes("Mark intentional"), k + ": no 'Mark intentional' button");
  assert.ok(labels.includes("Confirm repair"), k + ": still offers 'Confirm repair'");
  assert.ok(labels.includes("Ignore for episode"), k + ": still offers 'Ignore for episode'");
});

// 3. Where it IS valid, the button stays.
["video-late", "drift", "attribution"].forEach((k) => {
  assert.ok(buttonsFor(k).includes("Mark intentional"), k + ": keeps 'Mark intentional'");
});

// 4. The hazard the gate prevents: an unresolved blocking issue blocks export, and
//    "accepted" (what the button used to do) is non-blocking — so without the gate the
//    button would silently clear a real export blocker.
const endsEarly = { id: "x", name: "Guest", issue: "ends-early", proposedRepair: "replace", resolution: null, previewMoment: "episode-start" };
assert.strictEqual(M.evaluate([endsEarly]).overall, "blocked", "ends-early blocks export while unresolved");
assert.strictEqual(M.evaluate([{ ...endsEarly, resolution: "accepted" }]).results[0].state, "accepted",
  "'accepted' is non-blocking — which is exactly why the button must be gated off here");

console.log("speaker-sync-repair (Mark intentional gate): all assertions passed");
