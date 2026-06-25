"use strict";

// When the creator opens layout-first from the episode-flow placement detour, Continue should
// hand off back into source media health with the placed videos — not the generic production
// workspace (#1131). Run with: `node preview/layout-first-episode-continue.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const { createLayoutFirstController } = require("./layout-first.js");
const jsSource = fs.readFileSync(path.join(__dirname, "layout-first.js"), "utf8");

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
  setAttribute(name, value) {
    this.attributes[name] = value;
    if (name === "href") this.href = value;
    if (name === "data-ready-href") this.dataset.readyHref = value;
  }
  getAttribute(name) { return this.attributes[name]; }
  addEventListener(type, handler) { this.listeners[type] = handler; }
  appendChild(child) { this.children.push(child); this.firstChild = this.children[0] || null; return child; }
  insertBefore(child) { this.children.unshift(child); this.firstChild = this.children[0] || null; return child; }
  querySelector() { return null; }
}

function makeDoc() {
  const back = new Element("a");
  back.setAttribute("href", "./index.html");
  const cont = new Element("a");
  cont.setAttribute("data-ready-href", "./app.html#speaker-role-mapping?path=episode");
  cont.textContent = "Continue to production workspace →";
  const documentStub = {
    back,
    cont,
    createElement(tag) { return new Element(tag); },
    getElementById(id) {
      if (id === "layout-back") return back;
      if (id === "layout-continue") return cont;
      return null;
    },
    addEventListener() {},
    querySelectorAll() { return []; },
  };
  return documentStub;
}

const urlApi = { createObjectURL() { return "blob:1"; }, revokeObjectURL() {} };

function continueAfter(search) {
  const docStub = makeDoc();
  createLayoutFirstController(docStub, { URL: urlApi, location: { search } });
  return docStub.cont;
}

assert.ok(jsSource.includes("applyOriginContinueHref"), "layout-first retargets Continue for episode-flow origins");

const episode = continueAfter("?from=episode");
assert.equal(
  episode.dataset.readyHref,
  "./app.html#source-media-health",
  "episode-flow placement continue targets source media health",
);
assert.match(episode.textContent, /Continue to source media health/, "episode-flow continue names the destination screen");

const episodePath = continueAfter("?from=episode&path=episode");
assert.equal(
  episodePath.dataset.readyHref,
  "./app.html#source-media-health?path=episode",
  "episode-flow placement continue keeps the episode shell path",
);

const visuals = continueAfter("?from=visuals");
assert.equal(
  visuals.dataset.readyHref,
  "./app.html#speaker-role-mapping?path=episode",
  "non-episode origins keep the default production-workspace continue target",
);
assert.match(visuals.textContent, /production workspace/, "non-episode origins keep the default continue label");

console.log("layout-first episode continue: placement detour returns to source media health");
