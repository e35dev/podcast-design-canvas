"use strict";

// Behavior test for layout-first placement summary in the preview app shell (#1131).
// Run: `node preview/app-layout-handoff-summary.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const app = fs.readFileSync(path.join(__dirname, "app.html"), "utf8");
const layoutHandoffScript = fs.readFileSync(path.join(__dirname, "layout-handoff.js"), "utf8");
const routeContextScript = fs.readFileSync(path.join(__dirname, "app-route-context.js"), "utf8");
const layoutUiScript = fs.readFileSync(path.join(__dirname, "app-layout-handoff-ui.js"), "utf8");
const appScript = app.match(/<script>\s*([\s\S]*?)<\/script>\s*<\/body>/)[1];

function createElement(tagName) {
  return {
    tagName,
    attributes: {},
    children: [],
    className: "",
    href: "",
    textContent: "",
    title: "",
    hidden: false,
    classList: { toggle() {} },
    setAttribute(name, value) { this.attributes[name] = value; },
    removeAttribute(name) { delete this.attributes[name]; },
    replaceChildren(...children) { this.children = children; },
  };
}

function makeDocument(hash) {
  const rail = createElement("nav");
  rail.replaceChildren = (...children) => { rail.children = children; };
  const frame = createElement("iframe");
  const crumb = createElement("strong");
  const layoutSummary = createElement("span");
  layoutSummary.id = "layout-handoff-summary";
  layoutSummary.hidden = true;
  const openDirect = createElement("a");
  const stepCount = createElement("span");
  const prevStep = createElement("a");
  const nextStep = createElement("a");
  const progress = createElement("span");
  const bySelector = {
    "#rail": rail,
    "#screen": frame,
    "#crumb-label": crumb,
    "#layout-handoff-summary": layoutSummary,
    "#open-direct": openDirect,
    "#step-count": stepCount,
    "#prev-step": prevStep,
    "#next-step": nextStep,
    "#progress": progress,
  };
  let hashchange = null;
  const storage = {};
  const window = {
    location: { hash },
    addEventListener(event, handler) {
      if (event === "hashchange") hashchange = handler;
    },
  };
  return {
    nodes: { frame, crumb, layoutSummary },
    window,
    storage,
    reroute(hashValue) {
      window.location.hash = hashValue;
      hashchange();
    },
    document: {
      createElement,
      querySelector(selector) { return bySelector[selector] || null; },
    },
  };
}

function runApp(hash, seedState) {
  const page = makeDocument(hash);
  const storage = {};
  if (seedState) {
    const handoffApi = require("./layout-handoff.js");
    handoffApi.save({
      setItem(key, value) { storage[key] = value; },
      getItem(key) { return storage[key] || null; },
    }, seedState);
  }
  vm.runInNewContext(`${layoutHandoffScript}\n${routeContextScript}\n${layoutUiScript}\n${appScript}`, {
    document: page.document,
    window: page.window,
    sessionStorage: {
      getItem(key) { return storage[key] || null; },
      setItem(key, value) { storage[key] = value; },
    },
    URLSearchParams,
  });
  return page;
}

assert.match(app, /id="layout-handoff-summary"/, "preview app reserves a layout placement summary line");
assert.ok(app.includes("app-layout-handoff-ui.js"), "preview app loads layout placement summary helper");
assert.ok(app.includes("createLayoutPlacementSummary"), "preview app wires the layout placement summary helper");
assert.ok(app.includes("PodcastLayoutHandoff"), "preview app reads layout handoff state for the summary");

const handoff = require("./layout-handoff.js");
const interview = handoff.stateFromZones("interview", [
  { dataset: { slot: "host", fileName: "host-cam.mp4", fileSig: "h1" }, classList: { contains: (c) => c === "filled" } },
  { dataset: { slot: "guest", fileName: "guest-cam.mp4", fileSig: "g1" }, classList: { contains: (c) => c === "filled" } },
  { dataset: { slot: "broll", fileName: "intro.mp4", fileSig: "b1" }, classList: { contains: (c) => c === "filled" } },
]);

const withLayout = runApp(
  "#speaker-role-mapping?path=episode&layout=interview&slots=host,guest&broll=placed",
  interview,
);
assert.equal(withLayout.nodes.layoutSummary.hidden, false, "role mapping shows the layout placement summary");
assert.match(
  withLayout.nodes.layoutSummary.textContent,
  /Layout placements: Host \(host-cam\.mp4\), Guest \(guest-cam\.mp4\)/,
  "summary lists layout-first speaker placements with carried file names",
);
if (interview.optionalBroll) {
  assert.match(
    withLayout.nodes.layoutSummary.textContent,
    /Optional b-roll \(intro\.mp4\)/,
    "summary includes optional b-roll when the handoff carried it",
  );
}

const withoutLayout = runApp("#source-media-health?path=episode");
assert.equal(withoutLayout.nodes.layoutSummary.hidden, true, "non-role-mapping screens hide the layout summary");

console.log("preview app layout-handoff summary: placements surface on role mapping only");
