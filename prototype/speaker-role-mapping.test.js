"use strict";

// Dependency-free verification for the speaker role-mapping prototype (#1277).
// Run with: `node prototype/speaker-role-mapping.test.js` (Node built-ins only).
//
// Regression guard: editing the Speaker name must NOT rebuild the track rows, or the
// <input> being typed into is destroyed and focus is lost after one character. A name
// edit refreshes only the summary; a role/decision change still rebuilds the rows.

const fs = require("fs");
const vm = require("vm");
const path = require("path");
const assert = require("assert");

// A tiny DOM node stub. Tracks replaceChildren calls (rebuildCount) so the test can tell
// whether a row container was rebuilt, and resolves data-field lookups to a stable per-field
// stub so a simulated edit event carries the right field.
function makeEl(tag) {
  return {
    tagName: String(tag || "").toUpperCase(),
    _children: [],
    _handlers: {},
    _fields: {},
    dataset: {},
    style: {},
    _cls: "",
    _html: "",
    textContent: "",
    value: "",
    hidden: false,
    rebuildCount: 0,
    set className(v) { this._cls = v; },
    get className() { return this._cls; },
    set innerHTML(v) { this._html = v; },
    get innerHTML() { return this._html; },
    setAttribute() {},
    getAttribute() { return null; },
    addEventListener(type, fn) { this._handlers[type] = fn; },
    appendChild(c) { this._children.push(c); return c; },
    append(...cs) { this._children.push(...cs); },
    replaceChildren(...cs) { this.rebuildCount += 1; this._children = cs; },
    querySelector(sel) {
      const m = /data-field="([^"]+)"/.exec(sel || "");
      const field = m ? m[1] : "_";
      if (!this._fields[field]) {
        this._fields[field] = { dataset: { field }, value: "", focused: false, focus() { this.focused = true; } };
      }
      return this._fields[field];
    },
    querySelectorAll() { return []; },
  };
}

function load() {
  const html = fs.readFileSync(path.join(__dirname, "speaker-role-mapping.html"), "utf8");
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const roots = {};
  ["#tracks", "#status", "#issues", "#layout-handoff", "#addTrack", "#reset"].forEach((id) => {
    roots[id] = makeEl();
  });
  const document = {
    createElement: (t) => makeEl(t),
    createTextNode: (t) => ({ textContent: t }),
    // Unknown ids resolve to a throwaway node so an extra control never throws at load.
    querySelector: (s) => roots[s] || makeEl(),
  };
  const window = { PodcastLayoutHandoff: undefined, location: { search: "" }, sessionStorage: undefined };
  const sandbox = { document, window, structuredClone: globalThis.structuredClone, console };
  vm.createContext(sandbox);
  vm.runInContext(script, sandbox); // runs render() for the sample — must not throw
  return roots;
}

const roots = load();
const tracksEl = roots["#tracks"];
const issuesEl = roots["#issues"];

// The sample seeds four tracks, rendered once at load.
assert.strictEqual(tracksEl.rebuildCount, 1, "track rows render once at load");
assert.strictEqual(tracksEl._children.length, 4, "the sample seeds four track rows");
assert.ok(issuesEl.rebuildCount >= 1, "the summary renders at load");

const firstRow = tracksEl._children[0];
assert.ok(firstRow && typeof firstRow._handlers.input === "function", "a track row listens for input");

// Typing a Speaker name: the row must NOT be rebuilt (so the focused input survives), while
// the summary is refreshed to reflect the new name in its copy.
const rowsRebuildBefore = tracksEl.rebuildCount;
const summaryRebuildBefore = issuesEl.rebuildCount;
const nameInput = firstRow.querySelector('[data-field="name"]');
nameInput.value = "D";
firstRow._handlers.input({ target: nameInput });

assert.strictEqual(tracksEl.rebuildCount, rowsRebuildBefore, "typing a name does not rebuild the track rows");
assert.strictEqual(tracksEl._children[0], firstRow, "the row being edited is the same element after a name keystroke");
assert.ok(issuesEl.rebuildCount > summaryRebuildBefore, "typing a name refreshes the summary");

// A second keystroke must also leave the row intact — the heart of the bug was that only the
// first character landed before the input was replaced.
const rowsRebuildAfterFirst = tracksEl.rebuildCount;
nameInput.value = "Da";
firstRow._handlers.input({ target: nameInput });
assert.strictEqual(tracksEl.rebuildCount, rowsRebuildAfterFirst, "a second name keystroke still does not rebuild the rows");
assert.strictEqual(tracksEl._children[0], firstRow, "the edited row survives repeated typing");

// A role change still rebuilds the rows — badges and the readiness gate depend on it.
const rowsRebuildBeforeRole = tracksEl.rebuildCount;
const roleSelect = firstRow.querySelector('[data-field="role"]');
roleSelect.value = "guest";
firstRow._handlers.change({ target: roleSelect });
assert.ok(tracksEl.rebuildCount > rowsRebuildBeforeRole, "changing a role rebuilds the track rows");

console.log("speaker role mapping: name edits keep focus (no row rebuild); role edits rebuild — verified");
