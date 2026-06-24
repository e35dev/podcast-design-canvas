"use strict";

// Behavioral guard (#583): a low-confidence glossary correction (picked up "by ear")
// routes to the caption quality review screen, where the creator can confirm the
// spelling in real captions before it spreads. Settled/approved entries do not route.
// Runs evaluate() rather than matching source text. Run with:
//   `node prototype/transcript-glossary-fix-routing.test.js`

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
  const html = fs.readFileSync(path.join(__dirname, "transcript-glossary.html"), "utf8");
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const document = { createElement: () => makeNode(), querySelector: () => makeNode() };
  const sandbox = {
    document: document, window: { addEventListener() {} },
    structuredClone: globalThis.structuredClone, module: { exports: {} },
  };
  vm.createContext(sandbox);
  vm.runInContext(script, sandbox); // runs render() for the sample — must not throw
  return sandbox.module.exports;
}

const M = load();
assert.ok(typeof M.evaluate === "function", "prototype exports evaluate()");

// A heard-by-ear (low-confidence) correction asks to be checked in caption review.
const weak = M.evaluate([
  { id: "t", term: "Anika", spelling: "Annika", scope: "captions", source: "heard", decision: "suggested" },
]).results[0].issue;
assert.ok(weak, "a low-confidence entry produces a review issue");
assert.strictEqual(weak.fixScreen, "audio-caption-quality-review.html", "a low-confidence spelling routes to caption quality review");

// A trusted/suggested entry stays in the glossary — it does not route out.
const trusted = M.evaluate([
  { id: "t", term: "Kubernetes", spelling: "Kubernetes", scope: "captions", source: "manual", decision: "suggested" },
]).results[0].issue;
assert.ok(!(trusted && trusted.fixScreen), "a trusted suggestion is settled in the glossary, not routed");

assert.ok(
  fs.existsSync(path.join(__dirname, "audio-caption-quality-review.html")),
  "the caption review hand-off target exists",
);

const src = fs.readFileSync(path.join(__dirname, "transcript-glossary.html"), "utf8");
assert.ok(src.includes("openLink.href = issue.fixScreen"), "renderIssue opens the owning fix screen");

console.log("transcript-glossary: low-confidence corrections route to caption quality review");
