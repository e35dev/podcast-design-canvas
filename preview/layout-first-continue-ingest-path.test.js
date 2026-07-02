"use strict";

// Guards the ingest-path round trip through the layout-first placement detour (#1131 / #1026).
// The ingest path's "Place videos in layout" link opens layout-first with path=ingest&from=ingest.
// The back link already returns to the ingest path; Continue must do the same instead of silently
// switching the creator onto the episode path, and the preview app must keep the layout handoff
// params alive on that ingest route so role mapping still sees the placed slots.
// Run with: `node preview/layout-first-continue-ingest-path.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const { createLayoutFirstController } = require("./layout-first.js");
const layoutHandoff = require("./layout-handoff.js");

class ClassList {
  constructor(initial = "") {
    this.classes = new Set(initial.split(/\s+/).filter(Boolean));
  }

  add(name) { this.classes.add(name); }
  remove(name) { this.classes.delete(name); }
  contains(name) { return this.classes.has(name); }
  toggle(name, force) {
    const shouldAdd = force === undefined ? !this.classes.has(name) : Boolean(force);
    if (shouldAdd) this.classes.add(name);
    else this.classes.delete(name);
    return shouldAdd;
  }
}

class Element {
  constructor(tagName, options = {}) {
    this.tagName = tagName;
    this.id = options.id || "";
    this.dataset = options.dataset || {};
    this.className = options.className || "";
    this.classList = new ClassList(options.className || "");
    this.children = [];
    this.firstChild = null;
    this.textContent = options.textContent || "";
    this.hidden = Boolean(options.hidden);
    this.attributes = {};
    this.listeners = {};
    this.files = null;
    this.value = "";
    this.href = options.href || "";
  }

  focus() {}
  setAttribute(name, value) { this.attributes[name] = value; }
  getAttribute(name) { return this.attributes[name]; }
  removeAttribute(name) {
    delete this.attributes[name];
    if (name === "href") this.href = "";
  }
  addEventListener(type, handler) { this.listeners[type] = handler; }
  appendChild(child) {
    this.children.push(child);
    this.firstChild = this.children[0] || null;
    child.parentNode = this;
    return child;
  }
  insertBefore(child, before) {
    const index = this.children.indexOf(before);
    if (index === -1) this.children.unshift(child);
    else this.children.splice(index, 0, child);
    this.firstChild = this.children[0] || null;
    child.parentNode = this;
    return child;
  }
  remove() {
    if (!this.parentNode) return;
    this.parentNode.children = this.parentNode.children.filter((child) => child !== this);
    this.parentNode.firstChild = this.parentNode.children[0] || null;
  }
  querySelector() { return null; }
}

function makeLayoutButton(layout, label) {
  const button = new Element("button", { dataset: { layout } });
  button.appendChild(new Element("strong", { dataset: { layoutLabel: "" }, textContent: label }));
  return button;
}

function makeZone(slot, className = "drop-zone") {
  const zone = new Element("div", { className, dataset: { slot } });
  zone.appendChild(new Element("input", { dataset: { fileInput: slot } }));
  return zone;
}

// Drives layout-first with the given location search, places the two required interview
// videos, and returns the enabled Continue link.
function continueAfterPlacement(search) {
  const elementsById = {
    "layout-scene-label": new Element("span"),
    "layout-runtime-label": new Element("span"),
    "speaker-row": new Element("div", { className: "speaker-row" }),
    "layout-slot-status": new Element("p"),
    "layout-reset": new Element("button"),
    "layout-continue": new Element("a", { className: "continue-btn is-disabled" }),
    "layout-error-card": new Element("div", { hidden: true }),
    "layout-error": new Element("p"),
    "layout-canvas": new Element("div"),
    "layout-action-status": new Element("p"),
    "layout-back": new Element("a"),
  };
  const layoutButtons = [
    makeLayoutButton("interview", "Using interview"),
    makeLayoutButton("solo", "Use solo"),
    makeLayoutButton("panel", "Use panel"),
  ];
  const zones = [
    makeZone("host"),
    makeZone("guest"),
    makeZone("guest-b", "drop-zone is-hidden"),
    makeZone("broll"),
  ];
  const documentStub = {
    addEventListener() {},
    createElement(tagName) { return new Element(tagName); },
    getElementById(id) { return elementsById[id] || null; },
    querySelectorAll(selector) {
      if (selector === "[data-layout]") return layoutButtons;
      if (selector === ".drop-zone[data-slot]") return zones;
      return [];
    },
  };
  const urlApi = { createObjectURL(file) { return `blob:${file.name}`; }, revokeObjectURL() {} };
  const stored = {};
  const storage = {
    setItem(key, value) { stored[key] = value; },
    getItem(key) { return stored[key] || null; },
    removeItem(key) { delete stored[key]; },
  };
  const controller = createLayoutFirstController(documentStub, {
    URL: urlApi,
    handoff: layoutHandoff,
    storage,
    location: { search },
  });
  elementsById["layout-continue"].dataset.readyHref = "./app.html#speaker-role-mapping?path=episode";
  controller.placeVideoFile(controller.zonesBySlot.host, { name: "host.mp4", type: "video/mp4" });
  controller.placeVideoFile(controller.zonesBySlot.guest, { name: "guest.mp4", type: "video/mp4" });
  const link = elementsById["layout-continue"];
  assert.equal(link.attributes["aria-disabled"], "false", "Continue enables after host and guest are placed");
  return link;
}

function hashParams(href) {
  return new URLSearchParams(href.split("#")[1].split("?")[1] || "");
}

// Arriving from the ingest path, Continue keeps the creator on the ingest path and still
// carries the full layout handoff.
const ingestContinue = continueAfterPlacement("?path=ingest&from=ingest");
assert.equal(ingestContinue.href.split("#")[0], "./app.html", "Continue still targets the preview app");
const ingestParams = hashParams(ingestContinue.href);
assert.equal(ingestParams.get("path"), "ingest", "Continue keeps the incoming ingest path");
assert.equal(ingestParams.get("layout"), "interview", "Continue still carries the selected layout");
assert.equal(ingestParams.get("slots"), "host,guest", "Continue still carries the placed required slots");

// The default entry (no query) and the episode-path entry keep the episode path unchanged.
assert.equal(hashParams(continueAfterPlacement("").href).get("path"), "episode", "no query keeps the episode path");
assert.equal(
  hashParams(continueAfterPlacement("?path=episode&from=ingest").href).get("path"),
  "episode",
  "an episode-path entry keeps the episode path",
);

// Unknown path values do not leak into the Continue target.
assert.equal(
  hashParams(continueAfterPlacement("?path=style&from=style").href).get("path"),
  "episode",
  "an unrecognized path falls back to the episode path",
);

// The preview app keeps the layout handoff params on the ingest route, so role mapping on the
// ingest path still receives the placed layout instead of falling back to generic names.
const appHtml = fs.readFileSync(path.join(__dirname, "app.html"), "utf8");
const appScript = appHtml.match(/<script>([\s\S]*?)<\/script>/)[1];
const routeContextScript = fs.readFileSync(path.join(__dirname, "app-route-context.js"), "utf8");
const layoutHandoffScript = fs.readFileSync(path.join(__dirname, "layout-handoff.js"), "utf8");

function runApp(hash) {
  const frame = { attributes: {}, setAttribute() {}, removeAttribute() {}, classList: { toggle() {} } };
  const rail = { children: [], classList: { toggle() {} }, setAttribute() {}, removeAttribute() {} };
  rail.replaceChildren = (...children) => { rail.children = children; };
  const generic = () => ({
    attributes: {},
    classList: { toggle() {} },
    setAttribute(name, value) { this.attributes[name] = value; },
    removeAttribute(name) { delete this.attributes[name]; },
    href: "",
    textContent: "",
    title: "",
  });
  const bySelector = {
    "#rail": rail,
    "#screen": frame,
    "#crumb-label": generic(),
    "#open-direct": generic(),
    "#step-count": generic(),
    "#prev-step": generic(),
    "#next-step": generic(),
    "#progress": generic(),
  };
  const windowStub = { location: { hash }, addEventListener() {} };
  vm.runInNewContext(`${layoutHandoffScript}\n${routeContextScript}\n${appScript}`, {
    document: {
      createElement(tagName) {
        const node = generic();
        node.tagName = tagName;
        node.children = [];
        return node;
      },
      querySelector(selector) { return bySelector[selector] || null; },
    },
    window: windowStub,
    sessionStorage: { getItem() { return "[]"; }, setItem() {} },
    URLSearchParams,
  });
  return frame;
}

const ingestRoles = runApp("#speaker-role-mapping?path=ingest&layout=interview&slots=host,guest");
assert.equal(
  ingestRoles.src,
  "../prototype/speaker-role-mapping.html?path=ingest&layout=interview&slots=host%2Cguest",
  "the ingest-path role mapping route keeps the layout handoff params",
);

console.log("layout-first-continue-ingest-path.test.js passed");
