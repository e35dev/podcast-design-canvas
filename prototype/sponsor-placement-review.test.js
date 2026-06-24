"use strict";

// Dependency-free verification for the sponsor placement review prototype.
// Run with: `node prototype/sponsor-placement-review.test.js` (Node built-ins only).
//
// The prototype is browser-only, so this supplies a tiny DOM stub that lets the page
// script run to its module.exports block, then checks evaluate()'s review states and
// badge mapping against the spec (placed / needs review / approved for export /
// conflict flagged).

const fs = require("fs");
const vm = require("vm");
const path = require("path");
const assert = require("assert");

function makeNode(tag) {
  return {
    tagName: tag, id: "", _children: [], style: {}, dataset: {},
    textContent: "", value: "", disabled: false,
    set className(v) { this._cls = v; }, get className() { return this._cls; },
    setAttribute() {}, getAttribute() { return null; },
    addEventListener() {},
    appendChild(c) { this._children.push(c); return c; },
    append(...cs) { this._children.push(...cs); },
    replaceChildren(...cs) { this._children = cs; },
    querySelector() { return makeNode(); },
    querySelectorAll() { return []; },
  };
}

function load() {
  const html = fs.readFileSync(path.join(__dirname, "sponsor-placement-review.html"), "utf8");
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const roots = {};
  ["#elements", "#status", "#issues", "#counts", "#addElement", "#reset"].forEach((s) => (roots[s] = makeNode()));
  const document = { createElement: (t) => makeNode(t), createTextNode: (t) => ({ textContent: t }), querySelector: (s) => roots[s] || makeNode() };
  const sandbox = { document: document, structuredClone: globalThis.structuredClone, module: { exports: {} } };
  vm.createContext(sandbox);
  vm.runInContext(script, sandbox); // runs render() for the sample — must not throw
  return sandbox.module.exports;
}

const M = load();
assert.ok(typeof M.evaluate === "function", "prototype exports evaluate()");
assert.ok(typeof M.badgeClass === "function", "prototype exports badgeClass()");

function state(el) {
  return M.evaluate([el]).results[0].state;
}

// An approved element with a disclosure and no conflict is export-ready.
assert.strictEqual(
  state({ conflict: "none", disclosure: "Paid partnership", approved: true }),
  "approved for export",
  "approved + disclosed + no conflict => approved for export",
);

// A placed element still needs approval before export.
assert.strictEqual(
  state({ conflict: "none", disclosure: "Paid partnership", approved: false }),
  "placed",
  "disclosed but not yet approved => placed",
);

// Missing disclosure blocks approval.
assert.strictEqual(
  state({ conflict: "none", disclosure: "", approved: true }),
  "needs review",
  "missing disclosure => needs review even if approved flag is set",
);
assert.strictEqual(
  state({ conflict: "none", disclosure: "   ", approved: false }),
  "needs review",
  "whitespace-only disclosure counts as missing",
);

// A flagged conflict outranks everything and blocks export.
assert.strictEqual(
  state({ conflict: "covers-face", disclosure: "Paid partnership", approved: true }),
  "conflict flagged",
  "a detected conflict flags the element regardless of approval",
);

// Overall status reflects the worst element, and an empty episode is never blocked.
assert.strictEqual(M.evaluate([]).overall, "ready", "no sponsor elements => ready (never blocked)");
assert.strictEqual(
  M.evaluate([{ conflict: "none", disclosure: "x", approved: true }]).overall,
  "ready",
  "all approved => ready",
);
assert.strictEqual(
  M.evaluate([
    { conflict: "none", disclosure: "x", approved: true },
    { conflict: "none", disclosure: "x", approved: false },
  ]).overall,
  "review",
  "a placed element keeps the episode in review",
);
assert.strictEqual(
  M.evaluate([
    { conflict: "none", disclosure: "x", approved: true },
    { conflict: "sensitive", disclosure: "x", approved: true },
  ]).overall,
  "blocked",
  "any conflict blocks the export",
);

// Badge classes map each state to its visual style.
assert.strictEqual(M.badgeClass("conflict flagged"), "conflict", "conflict badge");
assert.strictEqual(M.badgeClass("needs review"), "review", "review badge");
assert.strictEqual(M.badgeClass("approved for export"), "approved", "approved badge");
assert.strictEqual(M.badgeClass("placed"), "placed", "placed badge");

// A conflict issue carries a viewer-facing title and a concrete fix.
const issue = M.buildIssue(
  { name: "BrightCo host-read", conflict: "covers-face", disclosure: "x", approved: false },
  { state: "conflict flagged", hasConflict: true, needsDisclosure: false },
);
assert.ok(issue && /covers the active speaker face/.test(issue.title), "conflict issue names the viewer problem");
assert.strictEqual(issue.tone, "blocker", "conflict issue is a blocker");

console.log("sponsor placement review: review states, status roll-up, and badges verified");
