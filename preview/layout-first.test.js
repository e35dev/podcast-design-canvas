"use strict";

// Behavior tests for the layout-first landing (#1026).
// Run with: `node preview/layout-first.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const { createLayoutFirstController, isVideoFile } = require("./layout-first.js");

const html = fs.readFileSync(path.join(__dirname, "layout-first.html"), "utf8");
const app = fs.readFileSync(path.join(__dirname, "app.html"), "utf8");
const root = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

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
  querySelector(selector) {
    return findAll(this, selector)[0] || null;
  }
}

function findAll(rootNode, selector) {
  const nodes = [];
  function visit(node) {
    if (matches(node, selector)) nodes.push(node);
    node.children.forEach(visit);
  }
  visit(rootNode);
  return nodes;
}

function matches(node, selector) {
  if (selector === ".drop-zone[data-slot]") {
    return node.classList.contains("drop-zone") && Boolean(node.dataset.slot);
  }
  if (selector === "[data-layout]") return Boolean(node.dataset.layout);
  if (selector === "[data-layout-label]") return Object.prototype.hasOwnProperty.call(node.dataset, "layoutLabel");
  if (selector === "[data-file-input]") return Boolean(node.dataset.fileInput);
  if (selector === ".placed-video") return node.className === "placed-video";
  return false;
}

function makeLayoutButton(layout, label) {
  const button = new Element("button", { dataset: { layout } });
  const strong = new Element("strong", { dataset: { layoutLabel: "" }, textContent: label });
  button.appendChild(strong);
  return button;
}

function makeZone(slot, className = "drop-zone") {
  const zone = new Element("div", { className, dataset: { slot } });
  const input = new Element("input", { dataset: { fileInput: slot } });
  zone.appendChild(input);
  return zone;
}

const elementsById = {
  "layout-scene-label": new Element("span", { textContent: "Interview scene" }),
  "layout-runtime-label": new Element("span", { textContent: "Host + guest" }),
  "speaker-row": new Element("div", { className: "speaker-row" }),
  "layout-slot-status": new Element("p"),
  "layout-reset": new Element("button"),
  "layout-continue": new Element("a", { className: "continue-btn is-disabled" }),
  "layout-error-card": new Element("div", { hidden: true }),
  "layout-error": new Element("p"),
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
  createElement(tagName) { return new Element(tagName); },
  getElementById(id) { return elementsById[id] || null; },
  querySelectorAll(selector) {
    if (selector === "[data-layout]") return layoutButtons;
    if (selector === ".drop-zone[data-slot]") return zones;
    return [];
  },
};

const createdUrls = [];
const revokedUrls = [];
const urlApi = {
  createObjectURL(file) {
    const url = `blob:${file.name}`;
    createdUrls.push(url);
    return url;
  },
  revokeObjectURL(url) {
    revokedUrls.push(url);
  },
};

function video(name) {
  return { name, type: "video/mp4" };
}

const controller = createLayoutFirstController(documentStub, { URL: urlApi });
elementsById["layout-continue"].dataset.readyHref = "./app.html#speaker-role-mapping?path=episode";

assert.match(html, /Start with a podcast layout/, "layout-first landing opens with layout selection");
assert.match(html, /data-layout="interview"/, "layout-first offers an interview layout");
assert.match(html, /data-layout="solo"/, "layout-first offers a solo layout");
assert.match(html, /data-layout="panel"/, "layout-first offers a panel layout");
assert.match(html, /data-slot="broll" data-optional="true"/, "layout-first marks b-roll as optional");
assert.match(html, /Continue to production workspace/, "layout-first has a production workspace handoff");
assert.match(html, /data-ready-href=".\/app.html#speaker-role-mapping\?path=episode"/, "layout-first stores the ready handoff target separately");
assert.doesNotMatch(html, /id="layout-continue"[^>]* href=/, "disabled Continue has no initial href");
assert.match(html, /type="file" accept="video\/\*"/, "layout-first supports choosing video files");
assert.match(html, /script src=".\/layout-first.js"/, "layout-first uses source-backed behavior");
assert.ok(app.includes("layout-first.html"), "preview app links back to the layout-first start");
assert.ok(root.includes("preview/layout-first.html"), "root catalog leads with the layout-first landing");
assert.equal(isVideoFile(video("host.mp4")), true, "video files are accepted");
assert.equal(isVideoFile({ name: "notes.txt", type: "text/plain" }), false, "non-video files are rejected");

assert.equal(controller.requiredSlots().length, 2, "interview requires host and guest only");
assert.equal(elementsById["layout-continue"].href, "", "disabled Continue starts without a navigation target");
let preventedDisabledContinue = false;
elementsById["layout-continue"].listeners.click({
  preventDefault() {
    preventedDisabledContinue = true;
  },
});
assert.equal(preventedDisabledContinue, true, "disabled Continue prevents activation");
controller.placeVideoFile(controller.zonesBySlot.host, video("host.mp4"));
assert.equal(
  elementsById["layout-continue"].attributes["aria-disabled"],
  "true",
  "interview does not continue after host alone",
);
controller.placeVideoFile(controller.zonesBySlot.guest, video("guest.mp4"));
assert.equal(
  elementsById["layout-continue"].attributes["aria-disabled"],
  "false",
  "interview continues after host and guest without b-roll",
);
assert.equal(
  elementsById["layout-continue"].href,
  "./app.html#speaker-role-mapping?path=episode",
  "enabled Continue restores the production workspace target",
);
assert.match(
  elementsById["layout-slot-status"].textContent,
  /Optional b-roll can be added later/,
  "readiness copy says b-roll is optional",
);
assert.equal(controller.zonesBySlot.broll.classList.contains("filled"), false, "b-roll remains empty and optional");

// Per-slot remove: a creator can clear one wrong video without resetting the layout.
const jsSource = fs.readFileSync(path.join(__dirname, "layout-first.js"), "utf8");
assert.match(jsSource, /placed-remove/, "placed videos expose a per-slot remove control");
assert.match(jsSource, /aria-label", "Remove the/, "the remove control is labelled per slot");

controller.removeVideo(controller.zonesBySlot.guest);
assert.equal(
  controller.zonesBySlot.guest.classList.contains("filled"),
  false,
  "removing a slot clears just that video",
);
assert.equal(
  controller.zonesBySlot.host.classList.contains("filled"),
  true,
  "removing one slot leaves the other placed videos intact",
);
assert.equal(
  elementsById["layout-continue"].attributes["aria-disabled"],
  "true",
  "Continue re-gates after a required video is removed",
);
assert.ok(revokedUrls.includes("blob:guest.mp4"), "removing a slot revokes its object URL");
// Re-filling the cleared slot restores readiness.
controller.placeVideoFile(controller.zonesBySlot.guest, video("guest.mp4"));
assert.equal(
  elementsById["layout-continue"].attributes["aria-disabled"],
  "false",
  "re-filling the removed slot restores the continue handoff",
);

controller.applyLayout("solo");
assert.equal(controller.requiredSlots().length, 1, "solo requires only the host video");
controller.placeVideoFile(controller.zonesBySlot.host, video("solo.mp4"));
assert.equal(
  elementsById["layout-continue"].attributes["aria-disabled"],
  "false",
  "solo continues after the host slot is filled",
);

controller.applyLayout("panel");
assert.equal(controller.requiredSlots().length, 3, "panel requires host and two guest videos");
controller.placeVideoFile(controller.zonesBySlot.host, video("panel-host.mp4"));
controller.placeVideoFile(controller.zonesBySlot.guest, video("panel-guest-a.mp4"));
assert.equal(
  elementsById["layout-continue"].attributes["aria-disabled"],
  "true",
  "panel does not continue until the second guest is filled",
);
controller.placeVideoFile(controller.zonesBySlot["guest-b"], video("panel-guest-b.mp4"));
assert.equal(
  elementsById["layout-continue"].attributes["aria-disabled"],
  "false",
  "panel continues after all required speaker videos are filled",
);

controller.placeVideoFile(controller.zonesBySlot.host, { name: "notes.txt", type: "text/plain" });
assert.equal(elementsById["layout-error-card"].hidden, false, "non-video drops show a visible error");
assert.match(elementsById["layout-error"].textContent, /video/, "non-video error stays creator-facing");
elementsById["layout-reset"].listeners.click();
assert.equal(controller.filledRequiredSlots().length, 0, "reset clears filled required slots");
assert.ok(revokedUrls.length > 0 && createdUrls.length > 0, "reset revokes created object URLs");

console.log("layout-first landing: required speaker readiness, optional b-roll, and handoff behavior verified");
