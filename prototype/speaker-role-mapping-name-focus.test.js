"use strict";

// Behavioral guard for #1277: typing a Speaker name must not rebuild the track rows. The rows
// hold the very <input> being typed in, so rebuilding them on each keystroke (the old behavior)
// dropped focus and the caret after one character. A name edit must refresh ONLY the summary;
// role/signal/decision edits still rebuild the rows. Runs the page script against a small DOM
// stub and counts how often the track list is rebuilt.
// Run with: `node prototype/speaker-role-mapping-name-focus.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");
const handoffApi = require("../preview/layout-handoff.js");

const html = fs.readFileSync(path.join(__dirname, "speaker-role-mapping.html"), "utf8");
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

function makeNode(tag = "div") {
  return {
    tagName: String(tag).toUpperCase(),
    id: "",
    dataset: {},
    style: {},
    textContent: "",
    value: "",
    hidden: false,
    disabled: false,
    innerHTML: "",
    _children: [],
    _replaceCount: 0,
    _cls: "",
    set className(v) { this._cls = v; },
    get className() { return this._cls; },
    setAttribute() {},
    getAttribute() { return null; },
    addEventListener() {},
    appendChild(child) { this._children.push(child); return child; },
    append(...children) { this._children.push(...children); },
    replaceChildren(...children) { this._replaceCount += 1; this._children = children; },
    querySelector() { return makeNode(); },
    querySelectorAll() { return []; },
  };
}

const byId = {
  "#tracks": makeNode(), "#status": makeNode(), "#issues": makeNode(),
  "#layout-handoff": makeNode(), "#addTrack": makeNode(), "#reset": makeNode(),
};
const document = {
  createElement: (tag) => makeNode(tag),
  querySelector: (selector) => byId[selector] || makeNode(),
};
const window = { PodcastLayoutHandoff: handoffApi, location: { search: "" }, sessionStorage: undefined };
const sandbox = { document, window, structuredClone: globalThis.structuredClone, URLSearchParams, console, module: { exports: {} } };
vm.createContext(sandbox);
vm.runInContext(script, sandbox); // runs the initial render against the stub — must not throw

const M = sandbox.module.exports;
assert.equal(typeof M.updateTrack, "function", "the screen exports updateTrack");
assert.equal(typeof M.renderSummary, "function", "the screen splits out a summary-only refresh");

const tracksEl = byId["#tracks"];
const issuesEl = byId["#issues"];
const rebuildsAfterLoad = tracksEl._replaceCount; // the initial render rebuilt the rows once

// Editing the Speaker name must NOT rebuild the track rows, so the focused <input> survives.
const issuesBefore = issuesEl._replaceCount;
M.updateTrack({ target: { dataset: { field: "name" }, value: "Dana Brooks" } }, 0);
assert.equal(tracksEl._replaceCount, rebuildsAfterLoad, "typing a speaker name does not rebuild the track rows");
assert.ok(issuesEl._replaceCount > issuesBefore, "typing a name still refreshes the summary (issue titles use the name)");

// Every further keystroke also leaves the rows intact — the bug dropped focus after the first.
M.updateTrack({ target: { dataset: { field: "name" }, value: "Dana Brooks!" } }, 0);
assert.equal(tracksEl._replaceCount, rebuildsAfterLoad, "each name keystroke leaves the rows (and focus) intact");

// Changing a role DOES rebuild the rows, since its badge and decision options change.
M.updateTrack({ target: { dataset: { field: "role" }, value: "guest" } }, 0);
assert.equal(tracksEl._replaceCount, rebuildsAfterLoad + 1, "changing a role rebuilds the track rows");

console.log("speaker role mapping: editing a name refreshes only the summary; role changes rebuild rows (#1277)");
