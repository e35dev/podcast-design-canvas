"use strict";

// Logic test for the contextual b-roll review screen wired to the weak-context scorer
// (#757). Run with: `node prototype/contextual-broll-moments.test.js` (Node built-ins).
//
// The screen is browser-only and now depends on BrollContextScorer (loaded via a
// separate <script src>). The vm extraction only sees the inline <script>, so we run
// the scorer module in the same sandbox first to provide the global, then exercise the
// page's exported evaluate() over its own sample transcripts.

const fs = require("fs");
const vm = require("vm");
const path = require("path");
const assert = require("assert");

function makeNode() {
  const node = {
    _children: [], style: {}, dataset: {}, textContent: "", value: "",
    set innerHTML(v) { this._html = v; }, get innerHTML() { return this._html; },
    set className(v) { this._cls = v; }, get className() { return this._cls; },
    setAttribute() {}, getAttribute() { return null; },
    addEventListener() {},
    appendChild(c) { this._children.push(c); return c; },
    append(...cs) { this._children.push(...cs); },
    replaceChildren(...cs) { this._children = cs; },
    querySelector() { return makeNode(); },
    querySelectorAll() { return []; },
    get children() { return this._children; },
  };
  return node;
}

function loadScreen() {
  const dir = __dirname;
  const scorerSrc = fs.readFileSync(path.join(dir, "broll-context-scorer.js"), "utf8");
  const html = fs.readFileSync(path.join(dir, "contextual-broll-moments.html"), "utf8");
  const inline = html.match(/<script>([\s\S]*?)<\/script>/)[1];

  const roots = {};
  ["#moments", "#status", "#issues", "#addMoment", "#reset"].forEach((s) => (roots[s] = makeNode()));
  const document = { createElement: () => makeNode(), querySelector: (s) => roots[s] || makeNode() };
  const sandbox = {
    document,
    structuredClone: globalThis.structuredClone,
    URLSearchParams: globalThis.URLSearchParams,
    console,
  };
  vm.createContext(sandbox);
  // 1) Scorer module: no `module` in scope yet, so it installs the global.
  vm.runInContext(scorerSrc, sandbox);
  assert.ok(sandbox.BrollContextScorer, "scorer global is installed for the page");
  // 2) Page inline script: provide `module` so it exports; render() must not throw.
  sandbox.module = { exports: {} };
  vm.runInContext(inline, sandbox);
  return sandbox.module.exports;
}

const M = loadScreen();
const idx = (id) => M.sampleMoments.findIndex((m) => m.id === id);
const results = M.evaluate(M.sampleMoments).results;

// m3 is a suggested moment with a vague transcript -> weak context -> review, routed to
// social context intake with the timestamp + reason carried as a query payload.
const m3 = results[idx("m3")];
assert.strictEqual(m3.state, "review", "vague suggested moment needs review");
assert.strictEqual(m3.issue.fixScreen, "social-context-intake.html", "weak context routes to intake");
assert.ok(m3.issue.fixQuery, "weak-context issue carries a routing payload");
assert.ok(m3.issue.fixQuery.includes("from=broll"), "payload marks the b-roll source");
assert.ok(m3.issue.fixQuery.includes("at=00%3A21%3A37"), "payload carries the moment timestamp");
assert.ok(/reason=/.test(m3.issue.fixQuery), "payload carries the weak-context reason");

// m1 has a concrete transcript (named brands) and is already approved -> no weak review.
const m1 = results[idx("m1")];
assert.notStrictEqual(m1.state, "review", "well-grounded approved moment is not flagged weak");

// A back-to-back pair of title cards routes the repeat to the title-cards screen.
const titlePair = M.evaluate([
  { id: "t1", reason: "Intro card", type: "title", strength: "standard", source: "manual", decision: "approved", transcript: "Welcome to the show." },
  { id: "t2", reason: "Second card", type: "title", strength: "standard", source: "manual", decision: "approved", transcript: "Now our next guest." },
]).results;
assert.strictEqual(titlePair[1].state, "review", "second adjacent title card needs review");
assert.strictEqual(titlePair[1].issue.fixScreen, "contextual-title-cards.html", "title repeat routes to title cards");

// The intake screen pre-populates from the payload: a from=broll request seeds an
// unassigned link tagged with the moment it resolves.
const intakeHtml = fs.readFileSync(path.join(__dirname, "social-context-intake.html"), "utf8");
const intakeInline = intakeHtml.match(/<script>([\s\S]*?)<\/script>/)[1];
const intakeSandbox = {
  document: { createElement: () => makeNode(), querySelector: () => makeNode() },
  structuredClone: globalThis.structuredClone,
  URLSearchParams: globalThis.URLSearchParams,
  console,
};
vm.createContext(intakeSandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, "broll-context-scorer.js"), "utf8"), intakeSandbox);
intakeSandbox.module = { exports: {} };
vm.runInContext(intakeInline, intakeSandbox);
const Intake = intakeSandbox.module.exports;

const seeded = Intake.applyContextRequest(
  [{ id: "k1", handle: "@dana", platform: "x", bucket: "host", visibility: "screen" }],
  { from: "broll", at: "00:21:37", reason: "no clear names or brands", moment: "m3" },
);
assert.strictEqual(seeded.length, 2, "a from=broll request seeds one extra link");
assert.strictEqual(seeded[0].id, "ctx-broll", "the seeded link is prepended");
assert.strictEqual(seeded[0].bucket, "", "the seeded link is unassigned so it enters the assign flow");
assert.ok(seeded[0].note.includes("00:21:37"), "the seeded link is tagged with the moment timestamp");

// A normal visit (no b-roll request) does not seed anything.
const untouched = Intake.applyContextRequest([{ id: "k1" }], { from: "", reason: "" });
assert.strictEqual(untouched.length, 1, "no request -> no seeded link");

console.log("contextual-broll-moments: weak-context routing, title-repeat routing, and intake pre-populate pass");
