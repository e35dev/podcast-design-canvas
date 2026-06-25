"use strict";

// Guards that episode readiness surfaces the guided episode setup handoff (#1326): the source
// type and speakers chosen on the setup intake are visibly carried into the next step.
// Run with: `node prototype/episode-readiness-setup-handoff.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const html = fs.readFileSync(path.join(__dirname, "episode-readiness.html"), "utf8");
const layoutHandoff = require("../preview/layout-handoff.js");
const setupHandoff = require("../preview/episode-setup-handoff.js");

// --- structural wiring ---------------------------------------------------------------------

assert.ok(
  html.includes("../preview/episode-setup-handoff.js"),
  "episode readiness loads the shared episode setup handoff helper",
);
assert.match(
  html,
  /id="setup-handoff" class="layout-handoff" hidden/,
  "episode readiness reserves a hidden setup summary",
);
assert.ok(
  html.includes("setupHandoffApi.load(layoutHandoffStorage(), window.location.search)"),
  "episode readiness reads the setup handoff from the URL and stored state",
);
assert.ok(
  html.includes("setupHandoffApi.summaryLines(setup)"),
  "episode readiness summarizes the carried source and speakers",
);
assert.doesNotMatch(
  html,
  /setupHandoffElement\.innerHTML/,
  "the setup handoff summary is not rendered with innerHTML",
);

// --- behavioral: run the inline script with a setup handoff in the URL ----------------------

const setupSearch = "?" + setupHandoff.queryForState({
  sourceType: "uploaded-files",
  speakers: [
    { role: "host", name: "Dana Brooks", social: "https://example.com/dana" },
    { role: "guest-1", name: "Marcus Lee" },
  ],
});

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

const roots = {};
["#tracks", "#status", "#issues", "#continue", "#continueNote", "#addGuest", "#reset", "#layout-handoff", "#setup-handoff"].forEach((sel) => {
  roots[sel] = makeNode();
});
const documentStub = {
  createElement: (tag) => makeNode(tag),
  createTextNode: (text) => ({ textContent: text }),
  querySelector: (sel) => roots[sel] || makeNode(),
};
const windowStub = {
  PodcastLayoutHandoff: layoutHandoff,
  PodcastEpisodeSetupHandoff: setupHandoff,
  location: { search: setupSearch },
  sessionStorage: undefined,
};
const sandbox = { document: documentStub, window: windowStub, structuredClone: globalThis.structuredClone, console };
vm.createContext(sandbox);
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
vm.runInContext(script, sandbox); // runs render() + renderLayoutHandoff() + renderSetupHandoff() — must not throw

const summary = roots["#setup-handoff"];
assert.strictEqual(summary.hidden, false, "the setup summary is revealed when a handoff is present");
assert.match(summary._children[0].textContent, /Carried from episode setup/, "the summary is labelled as carried setup");
const text = summary._children.map((child) => child.textContent).join("\n");
assert.match(text, /Source: Uploaded speaker files/, "the summary names the chosen source type");
assert.match(text, /Host: Dana Brooks/, "the summary names the host carried from setup");
assert.match(text, /https:\/\/example\.com\/dana/, "the summary carries the host's social link");
assert.match(text, /Guest 1: Marcus Lee/, "the summary names the guest carried from setup");

// No handoff present → the summary stays hidden.
const emptyRoots = {};
["#tracks", "#status", "#issues", "#continue", "#continueNote", "#addGuest", "#reset", "#layout-handoff", "#setup-handoff"].forEach((sel) => {
  emptyRoots[sel] = makeNode();
});
const emptySandbox = {
  document: {
    createElement: (tag) => makeNode(tag),
    createTextNode: (text) => ({ textContent: text }),
    querySelector: (sel) => emptyRoots[sel] || makeNode(),
  },
  window: {
    PodcastLayoutHandoff: layoutHandoff,
    PodcastEpisodeSetupHandoff: setupHandoff,
    location: { search: "?path=ingest" },
    sessionStorage: undefined,
  },
  structuredClone: globalThis.structuredClone,
  console,
};
vm.createContext(emptySandbox);
vm.runInContext(script, emptySandbox);
assert.notStrictEqual(emptyRoots["#setup-handoff"].hidden, false, "the setup summary stays hidden without a handoff");

console.log("episode readiness: episode setup handoff summary surfaces the carried source and speakers");
