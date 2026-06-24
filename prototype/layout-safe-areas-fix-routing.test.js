"use strict";

// Behavioral guard (#583): layout safe-area conflicts whose fix lives on another
// screen route to that owning screen — a face overlap to speaker framing safety, a
// crop overflow to destination crop preview — while in-screen conflicts stay here.
// Runs evaluate() rather than matching source text, so reformatting won't false-fail.
// Run with: `node prototype/layout-safe-areas-fix-routing.test.js`

const fs = require("fs");
const vm = require("vm");
const path = require("path");
const assert = require("assert");

function makeNode() {
  return {
    style: {}, dataset: {}, textContent: "", value: "", className: "", _html: "",
    set innerHTML(v) { this._html = v; }, get innerHTML() { return this._html; },
    setAttribute() {}, removeAttribute() {}, addEventListener() {},
    append() {}, appendChild(c) { return c; }, replaceChildren() {},
    querySelector() { return makeNode(); }, querySelectorAll() { return []; },
  };
}

function load() {
  const html = fs.readFileSync(path.join(__dirname, "layout-safe-areas.html"), "utf8");
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const document = { createElement: () => makeNode(), querySelector: () => makeNode() };
  const sandbox = { document: document, window: { addEventListener() {} }, structuredClone: globalThis.structuredClone, module: { exports: {} } };
  vm.createContext(sandbox);
  vm.runInContext(script, sandbox); // runs render() for the sample — must not throw
  return sandbox.module.exports;
}

const M = load();
assert.ok(typeof M.evaluate === "function", "prototype exports evaluate()");

function issueFor(check) {
  return M.evaluate([{ id: "t", element: "sponsor", check: check, fix: "review" }]).results[0].issue;
}

assert.strictEqual(issueFor("face-area").fixScreen, "speaker-framing-safety.html", "a face-area conflict routes to speaker framing safety");
assert.strictEqual(issueFor("outside-crop").fixScreen, "destination-crop-preview.html", "an outside-crop conflict routes to destination crop preview");
assert.ok(!issueFor("overlap").fixScreen, "an in-screen overlap conflict is fixed here, not routed out");

["speaker-framing-safety", "destination-crop-preview"].forEach((screen) =>
  assert.ok(fs.existsSync(path.join(__dirname, screen + ".html")), "routed target exists: " + screen),
);

const src = fs.readFileSync(path.join(__dirname, "layout-safe-areas.html"), "utf8");
assert.ok(src.includes("openLink.href = issue.fixScreen"), "renderIssue opens the owning fix screen");

console.log("layout-safe-areas: face/crop conflicts route to their owning fix screens");
