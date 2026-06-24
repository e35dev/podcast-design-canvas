"use strict";

// Verifies that an explicitly ignored publish checklist warning stays visible in
// the summary but does not block "ready to export" (docs/publish-checklist.md:
// ignored items "record the publishing consequence... without treating the
// underlying review work as resolved", and docs/export-readiness-review.md:
// "required warnings... resolved or explicitly ignored... enable export").
// Run with: `node prototype/publish-checklist-readiness.test.js`

const fs = require("fs");
const vm = require("vm");
const path = require("path");
const assert = require("assert");

function makeNode() {
  const node = {
    _children: [],
    style: {},
    dataset: {},
    textContent: "",
    value: "",
    hidden: false,
    disabled: false,
    set innerHTML(v) { this._html = v; },
    get innerHTML() { return this._html; },
    set className(v) { this._cls = v; },
    get className() { return this._cls; },
    setAttribute() {},
    getAttribute() { return null; },
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

function load() {
  const html = fs.readFileSync(path.join(__dirname, "publish-checklist.html"), "utf8");
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const roots = {};
  ["#destinations", "#destinationNotice", "#checklist", "#status", "#warnings", "#nextAction"].forEach(
    (s) => (roots[s] = makeNode()),
  );
  const document = { createElement: () => makeNode(), querySelector: (s) => roots[s] || makeNode() };
  const sandbox = { document, module: { exports: {} } };
  vm.createContext(sandbox);
  vm.runInContext(script, sandbox); // runs render() once for the default destination — must not throw
  return sandbox.module.exports;
}

const M = load();
const { items, destinations, summarizeWarnings } = M;

assert.ok(items.length >= 5, "checklist declares its items");
assert.ok(Object.keys(destinations).length >= 2, "checklist declares destinations");

const relevantItems = items.filter((item) => item.requiredFor.includes("youtube"));
assert.ok(relevantItems.length >= 3, "youtube destination has multiple required items");

// 1. All ready -> ready, no ignored count.
const allReady = {};
for (const item of relevantItems) allReady[item.id] = "ready";
const readySummary = summarizeWarnings(relevantItems, allReady);
assert.strictEqual(readySummary.status, "ready", "all-ready items reach ready status");
assert.strictEqual(readySummary.ignoredCount, 0, "no ignored items counted when none are ignored");

// 2. One ignored item, rest ready -> still ready, ignored item stays visible as a warning.
const oneIgnored = { ...allReady, [relevantItems[0].id]: "ignored" };
const ignoredSummary = summarizeWarnings(relevantItems, oneIgnored);
assert.strictEqual(
  ignoredSummary.status,
  "ready",
  "an explicitly ignored item does not block ready-to-export status",
);
assert.strictEqual(ignoredSummary.ignoredCount, 1, "the ignored item is counted");
assert.ok(
  ignoredSummary.warnings.some((w) => w.item.id === relevantItems[0].id && w.state === "ignored"),
  "the ignored item remains visible in the warning summary",
);

// 3. A real "review" item still blocks readiness.
const oneReview = { ...allReady, [relevantItems[1].id]: "review" };
const reviewSummary = summarizeWarnings(relevantItems, oneReview);
assert.strictEqual(reviewSummary.status, "review", "an unresolved review item keeps the checklist in review");

// 4. A "blocked" item always wins, even alongside an ignored item.
const blockedAndIgnored = { ...allReady, [relevantItems[0].id]: "ignored", [relevantItems[1].id]: "blocked" };
const blockedSummary = summarizeWarnings(relevantItems, blockedAndIgnored);
assert.strictEqual(blockedSummary.status, "blocked", "a blocked item overrides an ignored item");

console.log("publish checklist: ignored warnings stay visible without blocking export readiness");
