"use strict";

// Guards the round trip for the "Place videos in layout" entry points (#1026 / #583): when a
// path nav sends the creator here with from=<path>, the back link returns to the screen they
// left (carrying the shell path) instead of the generic preview shell. Kept in its own file so
// it does not collide with the frequently-edited layout-first.test.js.
// Run with: `node preview/layout-first-origin-back.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const { createLayoutFirstController } = require("./layout-first.js");
const jsSource = fs.readFileSync(path.join(__dirname, "layout-first.js"), "utf8");
const htmlSource = fs.readFileSync(path.join(__dirname, "layout-first.html"), "utf8");

class Element {
  constructor(tagName) {
    this.tagName = tagName;
    this.dataset = {};
    this.className = "";
    this.children = [];
    this.firstChild = null;
    this.attributes = {};
    this.listeners = {};
    this.href = "";
    this.textContent = "";
  }
  setAttribute(name, value) { this.attributes[name] = value; if (name === "href") this.href = value; }
  getAttribute(name) { return this.attributes[name]; }
  addEventListener(type, handler) { this.listeners[type] = handler; }
  appendChild(child) { this.children.push(child); this.firstChild = this.children[0] || null; return child; }
  insertBefore(child) { this.children.unshift(child); this.firstChild = this.children[0] || null; return child; }
  querySelector() { return null; }
}

function makeDoc() {
  const back = new Element("a");
  back.setAttribute("href", "./index.html");
  back.textContent = "← Preview shell";
  const documentStub = {
    back,
    createElement(tag) { return new Element(tag); },
    getElementById(id) { return id === "layout-back" ? back : null; },
    addEventListener() {},
    querySelectorAll() { return []; },
  };
  return documentStub;
}

const urlApi = { createObjectURL() { return "blob:1"; }, revokeObjectURL() {} };

function backAfter(search) {
  const docStub = makeDoc();
  createLayoutFirstController(docStub, { URL: urlApi, location: { search } });
  return docStub.back;
}

// The markup exposes the back link by id so the controller can retarget it.
assert.ok(/id="layout-back"/.test(htmlSource), "the back link carries an id the controller can find");
assert.ok(jsSource.includes("PLACEMENT_ORIGINS"), "the controller maps from= origins to a return screen");

// Arrived from the contextual visuals path, on the reuse shell path: return to that screen,
// carrying the shell path, with a creator-facing label.
const visuals = backAfter("?from=visuals&path=reuse");
assert.equal(visuals.href, "../prototype/contextual-broll-moments.html?path=reuse", "returns to the visuals origin screen, keeping the shell path");
assert.match(visuals.textContent, /Back to contextual visuals/, "names where the creator is returning to");

// Arrived from the episode flow with no shell path: return to that screen without a path query.
const episode = backAfter("?from=episode");
assert.equal(episode.href, "../prototype/source-media-health.html", "returns to the episode-flow origin screen");
assert.match(episode.textContent, /Back to the episode flow/, "names the episode flow origin");

// A different known origin resolves to its own screen, not a hard-coded one.
const reuse = backAfter("?from=reuse");
assert.equal(reuse.href, "../prototype/start-from-previous-episode.html", "each origin resolves to its own screen");

// No origin, or an unknown one, leaves the default shell link untouched.
const none = backAfter("");
assert.equal(none.href, "./index.html", "no origin keeps the default preview-shell link");
assert.match(none.textContent, /Preview shell/, "default back-link text is preserved");
const unknown = backAfter("?from=somewhere-else");
assert.equal(unknown.href, "./index.html", "an unknown origin keeps the default preview-shell link");

console.log("layout-first origin back: a placement detour returns to where the creator came from");
