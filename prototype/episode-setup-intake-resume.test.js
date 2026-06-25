"use strict";

// Guards that the guided episode setup intake restores an in-progress setup: a setup carried
// in (via the shared handoff's sessionStorage or query string) is rehydrated as the starting
// state, so a creator who navigates away and back keeps their work instead of losing it.
// Run with: `node prototype/episode-setup-intake-resume.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const html = fs.readFileSync(path.join(__dirname, "episode-setup-intake.html"), "utf8");
const handoff = require("../preview/episode-setup-handoff.js");

assert.ok(
  html.includes("handoffApi.load(handoffStorage(), window.location.search)"),
  "intake reads any in-progress setup from storage and the carried link",
);
assert.ok(html.includes("function seedFromState"), "intake rehydrates its starting state from a carried setup");

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

function runIntake(search) {
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const roots = {};
  ["#sources", "#linkInput", "#linkField", "#addSource", "#tracks", "#sourceSummary",
    "#speakerList", "#issues", "#readyNote", "#continue"].forEach((sel) => {
    roots[sel] = makeNode();
  });
  const documentStub = {
    createElement: (tag) => makeNode(tag),
    createTextNode: (text) => ({ textContent: text }),
    querySelector: (sel) => roots[sel] || makeNode(),
  };
  const windowStub = {
    PodcastEpisodeSetupHandoff: handoff,
    location: { search },
    sessionStorage: undefined,
  };
  const sandbox = { document: documentStub, window: windowStub, URLSearchParams, console };
  vm.createContext(sandbox);
  vm.runInContext(script, sandbox);
  return roots;
}

// A carried three-speaker setup is restored as the starting state (not the two-speaker sample).
const state = handoff.normalize({
  sourceType: "upload",
  speakers: [
    { name: "Dana Brooks", role: "host", social: "https://x.com/danabrooks" },
    { name: "Marcus Lee", role: "guest-1", social: "" },
    { name: "Priya Anand", role: "guest-2", social: "" },
  ],
});
const resumed = runIntake("?" + handoff.queryForState(state));
assert.strictEqual(resumed["#tracks"]._children.length, 3, "the intake restores every carried speaker track");
assert.strictEqual(resumed["#continue"].dataset.ready, "true", "a restored complete setup keeps Continue enabled");

// With nothing carried, the intake starts from its seeded sample.
const fresh = runIntake("");
assert.strictEqual(fresh["#tracks"]._children.length, 2, "the intake starts from the seeded sample when nothing was carried");

console.log("episode setup intake: restores an in-progress setup so work is never lost");
