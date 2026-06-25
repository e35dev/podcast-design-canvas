"use strict";

// Guards that the preset comparison preview surfaces the applied direction carried from the
// preset style picker (preset-styles lane). Run with:
//   `node prototype/preset-comparison-style-handoff.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const html = fs.readFileSync(path.join(__dirname, "preset-comparison-preview.html"), "utf8");
const handoff = require("../preview/preset-style-handoff.js");

// --- structural wiring ---------------------------------------------------------------------

assert.ok(
  html.includes("../preview/preset-style-handoff.js"),
  "preset comparison loads the shared preset style handoff helper",
);
assert.match(
  html,
  /id="preset-handoff" class="preset-handoff" hidden/,
  "preset comparison reserves a hidden carried-direction summary",
);
assert.ok(
  html.includes("presetHandoffApi.load(presetHandoffStorage(), window.location.search)"),
  "preset comparison reads the carried direction from the URL and stored state",
);
assert.ok(
  html.includes("presetHandoffApi.summaryLines(carried)"),
  "preset comparison summarizes the carried direction",
);
assert.doesNotMatch(
  html,
  /presetHandoffElement\.innerHTML/,
  "the carried-direction summary is not rendered with innerHTML",
);

// --- behavioral: run the inline script with an applied direction in the URL -----------------

const search = "?" + handoff.queryForState({
  preset: "punchy-commentary",
  density: "layered",
  caption: "high",
  moments: "energetic",
  brand: "show-branded",
});

function makeNode(tag) {
  return {
    tagName: tag, id: "", _children: [], style: {}, dataset: {}, hidden: undefined,
    textContent: "", value: "", checked: false, disabled: false, innerHTML: "",
    set className(v) { this._cls = v; }, get className() { return this._cls; },
    setAttribute() {}, getAttribute() { return null; }, removeAttribute() {},
    addEventListener() {}, append(...c) { this._children.push(...c); },
    appendChild(c) { this._children.push(c); return c; },
    replaceChildren(...c) { this._children = c; },
    insertBefore(c) { this._children.unshift(c); return c; },
    remove() {}, querySelector() { return makeNode(); }, querySelectorAll() { return []; },
  };
}

function runWith(searchValue) {
  const roots = {};
  ["#grid", "#moment", "#applied", "#apply", "#reset", "#preset-handoff"].forEach((sel) => {
    roots[sel] = makeNode();
  });
  const sandbox = {
    document: {
      createElement: (tag) => makeNode(tag),
      createTextNode: (text) => ({ textContent: text }),
      querySelector: (sel) => roots[sel] || makeNode(),
    },
    window: {
      PodcastPresetStyleHandoff: handoff,
      location: { search: searchValue },
      sessionStorage: undefined,
    },
    console,
  };
  vm.createContext(sandbox);
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  vm.runInContext(script, sandbox); // runs render() + renderPresetHandoff() — must not throw
  return roots;
}

const roots = runWith(search);
const summary = roots["#preset-handoff"];
assert.strictEqual(summary.hidden, false, "the carried-direction summary is revealed when a handoff is present");
assert.match(summary._children[0].textContent, /Carried from the preset picker/, "the summary is labelled as carried from the picker");
const text = summary._children.map((child) => child.textContent).join("\n");
assert.match(text, /Applied direction: Punchy commentary/, "the summary names the applied preset");
assert.match(text, /Caption presence: High-emphasis/, "the summary names a carried control with its label");

// No handoff present → the summary stays hidden.
const empty = runWith("?path=episode");
assert.notStrictEqual(empty["#preset-handoff"].hidden, false, "the carried-direction summary stays hidden without a handoff");

console.log("preset comparison: applied preset direction surfaces as a carried summary");
