"use strict";

// Guards that episode readiness surfaces the guided episode setup intake handoff:
// the source type, speaker roles, names, and optional social links the creator
// confirmed on the setup screen are visibly carried into this next step (#1326).
// Run with: `node prototype/episode-readiness-setup-handoff.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const html = fs.readFileSync(path.join(__dirname, "episode-readiness.html"), "utf8");
const handoff = require("../preview/episode-setup-handoff.js");

// Structural: readiness loads the shared helper and reserves a hidden carry slot.
assert.ok(
  html.includes("../preview/episode-setup-handoff.js"),
  "episode readiness loads the shared episode-setup handoff helper",
);
assert.match(
  html,
  /id="setup-carried"[^>]*hidden/,
  "episode readiness reserves a hidden setup-carry summary",
);
assert.doesNotMatch(
  html,
  /setup-carried-detail[^.]*\.innerHTML/,
  "the setup-carry summary is not rendered with innerHTML",
);

// Behavioral: run the page's inline script against a tiny DOM/window stub, with the
// setup saved in session storage, and confirm the carry summary is populated + shown.
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

function makeStorage(seed) {
  const data = Object.assign({}, seed);
  return {
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => { data[key] = String(value); },
    removeItem: (key) => { delete data[key]; },
  };
}

const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

function runReadiness(storage) {
  const roots = {};
  [
    "#tracks", "#status", "#issues", "#continue", "#continueNote", "#addGuest",
    "#reset", "#layout-handoff", "#setup-carried", "#setup-carried-detail",
  ].forEach((sel) => {
    roots[sel] = makeNode();
  });
  const documentStub = {
    createElement: (tag) => makeNode(tag),
    createTextNode: (text) => ({ textContent: text }),
    querySelector: (sel) => roots[sel] || makeNode(),
  };
  const windowStub = { location: { search: "" }, sessionStorage: storage };
  const sandbox = {
    document: documentStub,
    window: windowStub,
    sessionStorage: storage,
    PodcastEpisodeSetupHandoff: handoff,
    structuredClone: globalThis.structuredClone,
    console,
  };
  vm.createContext(sandbox);
  vm.runInContext(script, sandbox); // runs render() + the setup-carry block — must not throw
  return roots;
}

// A completed setup saved by the intake screen is carried into readiness.
const setup = {
  sourceType: "files",
  speakers: [
    { role: "Host", name: "Sarah Chen", twitter: "@sarahchen" },
    { role: "Guest 1", name: "Devon Park" },
  ],
};
const withSetup = runReadiness(makeStorage({ [handoff.STORAGE_KEY]: JSON.stringify(setup) }));
const carried = withSetup["#setup-carried"];
const detail = withSetup["#setup-carried-detail"];
assert.strictEqual(carried.hidden, false, "the setup-carry summary is revealed when a setup was saved");
assert.match(detail.textContent, /Uploaded speaker files/, "carry summary names the chosen source type");
assert.match(detail.textContent, /Host: Sarah Chen/, "carry summary lists the host role and name");
assert.match(detail.textContent, /Devon Park/, "carry summary lists the carried guest");
assert.match(detail.textContent, /1 social link/, "carry summary counts the carried social link");

// With no setup saved, readiness stays focused and the carry summary is not shown.
const withoutSetup = runReadiness(makeStorage({}));
assert.notStrictEqual(
  withoutSetup["#setup-carried"].hidden,
  false,
  "the setup-carry summary stays hidden when no setup was saved",
);

// An incomplete setup (a speaker missing a name) is treated as no handoff — the
// next step never shows a half-finished intake.
const incomplete = { sourceType: "link", speakers: [{ role: "Host", name: "" }] };
const withIncomplete = runReadiness(makeStorage({ [handoff.STORAGE_KEY]: JSON.stringify(incomplete) }));
assert.notStrictEqual(
  withIncomplete["#setup-carried"].hidden,
  false,
  "an incomplete saved setup does not surface a carry summary",
);

console.log("episode readiness: guided setup intake handoff surfaces source, roles, names, and social links");
