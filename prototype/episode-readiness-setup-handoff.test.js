"use strict";

// Guards that episode readiness surfaces the guided setup handoff the same way it surfaces
// the layout-first start: a complete setup reveals a "From episode setup" summary naming the
// source path and carried speakers, while no/incomplete setup leaves the summary hidden.
// Run with: `node prototype/episode-readiness-setup-handoff.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const html = fs.readFileSync(path.join(__dirname, "episode-readiness.html"), "utf8");
const handoff = require("../preview/episode-setup-handoff.js");

assert.ok(
  html.includes("../preview/episode-setup-handoff.js"),
  "episode readiness loads the shared episode-setup handoff helper",
);
assert.match(
  html,
  /id="setup-handoff" class="layout-handoff" hidden/,
  "episode readiness reserves a hidden episode-setup summary",
);
assert.ok(
  html.includes("setupHandoffApi.load(setupHandoffStorage(), window.location.search)"),
  "episode readiness reads the carried setup from the URL and stored state",
);
assert.doesNotMatch(html, /setupHandoffElement\.innerHTML/, "setup summary is not rendered with innerHTML");

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

function runReadiness(search) {
  const roots = {};
  ["#tracks", "#status", "#issues", "#continue", "#continueNote", "#addGuest", "#reset",
    "#layout-handoff", "#setup-handoff"].forEach((sel) => {
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
  const sandbox = { document: documentStub, window: windowStub, structuredClone: globalThis.structuredClone, console };
  vm.createContext(sandbox);
  vm.runInContext(script, sandbox); // runs render() + renderSetupHandoff() — must not throw
  return roots;
}

// 1) A complete carried setup reveals the summary and names the source + speakers.
const state = handoff.normalize({
  sourceType: "link",
  speakers: [
    { name: "Dana Brooks", role: "host", social: "https://x.com/danabrooks" },
    { name: "Marcus Lee", role: "guest-1", social: "" },
  ],
});
const ready = runReadiness("?" + handoff.queryForState(state));
const summary = ready["#setup-handoff"];
assert.strictEqual(summary.hidden, false, "a carried setup reveals the episode-setup summary");
assert.strictEqual(summary._children.length, 2, "the summary renders a heading and a copy line");
assert.match(summary._children[0].textContent, /Recording link/, "the summary names the carried source path");
assert.match(summary._children[1].textContent, /Dana Brooks/, "the summary lists the carried host name");
assert.match(summary._children[1].textContent, /Marcus Lee/, "the summary lists the carried guest name");
assert.match(summary._children[1].textContent, /Host/, "the summary labels speakers by their assigned role");
// The carried setup is also consumed — readiness seeds its tracks from it, not the sample.
assert.strictEqual(ready["#tracks"]._children.length, 2, "readiness seeds one track per carried speaker");

// 2) With no carried setup, the summary stays hidden.
const empty = runReadiness("");
assert.notStrictEqual(empty["#setup-handoff"].hidden, false, "no carried setup leaves the summary hidden");
assert.strictEqual(empty["#setup-handoff"]._children.length, 0, "no carried setup renders no summary content");

// 3) An incomplete setup (a speaker missing a name) is treated as no handoff.
const incomplete = runReadiness('?source=link&setup=' + encodeURIComponent('[{"name":"","role":"host"}]'));
assert.notStrictEqual(incomplete["#setup-handoff"].hidden, false, "an incomplete setup never surfaces as carried");
assert.strictEqual(incomplete["#setup-handoff"]._children.length, 0, "an incomplete setup renders no summary content");

console.log("episode readiness: episode-setup handoff summary surfaces and seeds carried speakers");
