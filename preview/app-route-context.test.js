"use strict";

// Guards contextual visuals entry context in the unified preview app (#581 / #583).
// Run with: `node preview/app-route-context.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const appHtml = fs.readFileSync(path.join(__dirname, "app.html"), "utf8");
const appScript = appHtml.match(/<script>([\s\S]*?)<\/script>/)[1];

function createElement(tagName) {
  return {
    tagName,
    attributes: {},
    children: [],
    className: "",
    href: "",
    textContent: "",
    title: "",
    classList: {
      toggle() {},
    },
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
    removeAttribute(name) {
      delete this.attributes[name];
    },
  };
}

function makeDocument(hash) {
  const rail = createElement("nav");
  rail.replaceChildren = (...children) => {
    rail.children = children;
  };
  const frame = createElement("iframe");
  const crumb = createElement("strong");
  const openDirect = createElement("a");
  const stepCount = createElement("span");
  const prevStep = createElement("a");
  const nextStep = createElement("a");
  const progress = createElement("span");
  const bySelector = {
    "#rail": rail,
    "#screen": frame,
    "#crumb-label": crumb,
    "#open-direct": openDirect,
    "#step-count": stepCount,
    "#prev-step": prevStep,
    "#next-step": nextStep,
    "#progress": progress,
  };
  let hashchange = null;
  const window = {
    location: { hash },
    addEventListener(event, handler) {
      if (event === "hashchange") {
        hashchange = handler;
      }
    },
  };
  return {
    nodes: { rail, frame, crumb, openDirect, stepCount, prevStep, nextStep, progress },
    window,
    reroute(hashValue) {
      window.location.hash = hashValue;
      hashchange();
    },
    document: {
      createElement,
      querySelector(selector) {
        return bySelector[selector] || null;
      },
    },
  };
}

function runApp(hash) {
  const page = makeDocument(hash);
  vm.runInNewContext(appScript, {
    document: page.document,
    window: page.window,
    sessionStorage: {
      getItem() {
        return "[]";
      },
      setItem() {},
    },
    URLSearchParams,
  });
  return page;
}

const styleEntry = runApp("#contextual-broll-moments?from=style");
assert.equal(
  styleEntry.nodes.frame.src,
  "../prototype/contextual-broll-moments.html?from=style",
  "style entry context loads the first visuals screen with its route context",
);
assert.equal(
  styleEntry.nodes.prevStep.href,
  "#canvas-layer-controls",
  "style entry context steps back to the visual direction finish",
);
assert.equal(
  styleEntry.nodes.nextStep.href,
  "#contextual-title-cards?from=style",
  "style entry context is preserved when stepping deeper into visuals",
);

styleEntry.reroute("#contextual-title-cards?from=cleanup");
assert.equal(
  styleEntry.nodes.frame.src,
  "../prototype/contextual-title-cards.html?from=cleanup",
  "cleanup entry context loads middle visuals screens with its route context",
);
assert.equal(
  styleEntry.nodes.prevStep.href,
  "#contextual-broll-moments?from=cleanup",
  "cleanup entry context is preserved when stepping back inside visuals",
);
assert.equal(
  styleEntry.nodes.nextStep.href,
  "#screen-share-moment-review?from=cleanup",
  "cleanup entry context is preserved when stepping forward inside visuals",
);

styleEntry.reroute("#source-media-health?from=cleanup");
assert.equal(
  styleEntry.nodes.frame.src,
  "../prototype/source-media-health.html",
  "non-visuals screens discard contextual visuals route context",
);

styleEntry.reroute("#missing-screen?from=style");
assert.equal(
  styleEntry.nodes.frame.src,
  "../prototype/source-media-health.html",
  "unknown route hashes fall back to the first known screen without route context",
);

console.log("preview app route context: contextual visuals entry context is preserved safely");
