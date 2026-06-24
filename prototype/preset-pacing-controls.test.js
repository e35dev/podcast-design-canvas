"use strict";

// Dependency-free verification for the preset pacing controls prototype.
// Run with: `node prototype/preset-pacing-controls.test.js` (Node built-ins only).
//
// The page script is browser-only and calls render() on load, so the test supplies a
// tiny DOM stub that lets it run to its `module.exports` block, then checks the pure
// pacing logic: which sampled moments a feel flags, and that "ready to apply" is honest.

const fs = require("fs");
const vm = require("vm");
const path = require("path");
const assert = require("assert");

function makeNode(tag) {
  return {
    tagName: tag, id: "", _children: [], dataset: {}, style: {},
    textContent: "", value: "", checked: false, disabled: false, type: "", href: "", target: "", className: "",
    classList: { add() {}, remove() {}, toggle() {} },
    setAttribute() {}, getAttribute() { return null; }, addEventListener() {},
    appendChild(c) { this._children.push(c); return c; },
    append(...cs) { this._children.push(...cs); },
    replaceChildren(...cs) { this._children = cs; },
    get children() { return this._children; },
  };
}

function load() {
  const html = fs.readFileSync(path.join(__dirname, "preset-pacing-controls.html"), "utf8");
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const document = {
    createElement: (t) => makeNode(t),
    createTextNode: (t) => ({ textContent: t }),
    querySelector: () => makeNode(),
  };
  const sandbox = { document, module: { exports: {} } };
  vm.createContext(sandbox);
  vm.runInContext(script, sandbox);
  return sandbox.module.exports;
}

const { feels, moments, energyFor, evaluatePacing } = load();

// The six named pacing feels from the spec are present.
assert.equal(feels.length, 6, "six pacing feels");
for (const id of ["calm-interview", "balanced-conversation", "punchy-commentary", "sponsor-friendly"]) {
  assert.ok(feels.some((f) => f.id === id), `feel present: ${id}`);
}

// Intensity nudge clamps to the 1..6 band and never escapes the preset.
assert.equal(energyFor("calm-interview", -5), 1, "energy clamps at 1");
assert.equal(energyFor("punchy-commentary", 5), 6, "energy clamps at 6");

// A balanced feel fits every sampled moment, so it is ready to apply.
const balanced = evaluatePacing("balanced-conversation", 0);
assert.ok(balanced.ready, "balanced conversation fits all sampled moments");
assert.equal(balanced.flagged.length, 0, "balanced conversation flags nothing");

// Punchy commentary is honestly too aggressive on the quiet explanation and sponsor read.
const punchy = evaluatePacing("punchy-commentary", 0);
assert.ok(!punchy.ready, "punchy commentary is not ready to apply as-is");
assert.ok(punchy.flagged.includes("quiet"), "punchy commentary flags the quiet explanation");
assert.ok(punchy.flagged.includes("sponsor"), "punchy commentary flags the sponsor read");

// Calm interview is too calm for the high-energy exchange.
const calm = evaluatePacing("calm-interview", 0);
assert.ok(calm.flagged.includes("high-energy"), "calm interview flags the high-energy exchange");

// Holding the flagged moments at their current pacing makes the choice honestly applyable.
const punchyHeld = evaluatePacing("punchy-commentary", 0, ["quiet", "sponsor"]);
assert.ok(punchyHeld.ready, "holding the flagged moments makes punchy commentary ready");
assert.ok(
  moments.every((m) => typeof m.at === "string" && /\d/.test(m.at)),
  "every sampled moment is grounded at a real episode timestamp",
);

console.log("preset pacing controls: pacing feels evaluate honestly across grounded episode moments");
