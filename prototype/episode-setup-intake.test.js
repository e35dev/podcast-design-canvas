"use strict";

// Guards the guided episode setup intake screen: it wires in the shared handoff helper and
// ingest nav, gates Continue until the setup is complete, flags incomplete/duplicate-role
// setups, and carries the chosen source + speakers into the next step.
// Run with: `node prototype/episode-setup-intake.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const html = fs.readFileSync(path.join(__dirname, "episode-setup-intake.html"), "utf8");
const handoff = require("../preview/episode-setup-handoff.js");

// --- Static wiring guards ----------------------------------------------------
assert.ok(html.includes("../preview/ingest-nav.js"), "intake loads the shared ingest navigation");
assert.ok(html.includes("../preview/episode-setup-handoff.js"), "intake loads the shared setup handoff helper");
assert.ok(html.includes('data-ingest-step="episode-setup-intake"'), "intake declares its ingest step");
assert.ok(!html.includes("../preview/tools-nav.js"), "intake uses ingest nav, not the generic tools nav");
assert.match(html, /role="radiogroup"/, "intake offers the source path as a radio group");
assert.doesNotMatch(html, /innerHTML/, "intake builds its DOM without innerHTML");

// --- Behavioral run of the page's inline script ------------------------------
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

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

function runIntake(seed) {
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
    location: { search: "" },
    sessionStorage: undefined,
  };
  if (seed) {
    windowStub.__SETUP_SEED__ = seed;
  }
  const sandbox = { document: documentStub, window: windowStub, URLSearchParams, console };
  vm.createContext(sandbox);
  vm.runInContext(script, sandbox); // runs render() — must not throw
  return roots;
}

function issueText(roots) {
  return roots["#issues"]._children.map((child) => child.textContent);
}

// 1) The seeded sample is complete, so Continue is enabled and carries the setup forward.
const ready = runIntake(null);
assert.strictEqual(ready["#continue"].dataset.ready, "true", "the seeded sample setup enables Continue");
assert.ok(ready["#continue"].href.includes("setup="), "the Continue link carries the speaker payload");
assert.ok(ready["#continue"].href.includes("source=link"), "the Continue link carries the chosen source");
assert.strictEqual(ready["#tracks"]._children.length, 2, "each seeded source renders as a speaker track");
assert.strictEqual(issueText(ready).length, 0, "a complete setup lists no blocking issues");
assert.strictEqual(ready["#readyNote"].hidden, false, "a complete setup reveals the ready note");

// 2) Clearing a required speaker name re-gates Continue and explains why.
const missingName = runIntake({
  sourceType: "link",
  speakers: [
    { sourceName: "host-cam.mp4", name: "", role: "host", social: "" },
    { sourceName: "guest-cam.mp4", name: "Marcus Lee", role: "guest-1", social: "" },
  ],
});
assert.strictEqual(missingName["#continue"].dataset.ready, "false", "a missing speaker name keeps Continue gated");
assert.ok(!missingName["#continue"].href, "a gated Continue has no destination");
assert.ok(
  issueText(missingName).some((text) => /name/i.test(text)),
  "the summary explains a speaker still needs a name",
);

// 3) Assigning two speakers the same role is flagged and blocks Continue.
const duplicateRole = runIntake({
  sourceType: "link",
  speakers: [
    { sourceName: "a", name: "Dana Brooks", role: "host", social: "" },
    { sourceName: "b", name: "Marcus Lee", role: "host", social: "" },
  ],
});
assert.strictEqual(duplicateRole["#continue"].dataset.ready, "false", "a duplicate role keeps Continue gated");
assert.ok(
  issueText(duplicateRole).some((text) => /more than one/i.test(text)),
  "the summary flags the duplicated role",
);

// 4) A third guest can be assigned Guest 3 and completes (no role-cap bug).
const threeSpeakers = runIntake({
  sourceType: "upload",
  speakers: [
    { sourceName: "a.mp4", name: "Dana Brooks", role: "host", social: "" },
    { sourceName: "b.mp4", name: "Marcus Lee", role: "guest-1", social: "" },
    { sourceName: "c.mp4", name: "Priya Anand", role: "guest-3", social: "" },
  ],
});
assert.strictEqual(threeSpeakers["#continue"].dataset.ready, "true", "a third guest can complete the setup");
assert.strictEqual(threeSpeakers["#tracks"]._children.length, 3, "every uploaded file renders as its own track");

console.log("episode setup intake: source choice, role assignment gating, and handoff carry verified");
