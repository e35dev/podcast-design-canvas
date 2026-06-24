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

const styleEntryWithExtraParams = runApp("#contextual-broll-moments?moment=42&from=style");
assert.equal(
  styleEntryWithExtraParams.nodes.frame.src,
  "../prototype/contextual-broll-moments.html?from=style",
  "style entry context survives extra query params in the preview app route",
);
assert.equal(
  styleEntryWithExtraParams.nodes.nextStep.href,
  "#contextual-title-cards?from=style",
  "preview app strips extra query params while preserving the visuals entry context",
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

const episodeRoles = runApp("#speaker-role-mapping?path=episode");
assert.equal(
  episodeRoles.nodes.frame.src,
  "../prototype/speaker-role-mapping.html?path=episode",
  "episode path context loads role mapping with its route context",
);
assert.equal(
  episodeRoles.nodes.prevStep.href,
  "#episode-readiness?path=episode",
  "episode path context steps back to episode readiness",
);
assert.equal(
  episodeRoles.nodes.nextStep.href,
  "#source-media-health?path=episode",
  "episode path context steps forward to source media health",
);

episodeRoles.reroute("#source-media-health?path=episode");
assert.equal(
  episodeRoles.nodes.frame.src,
  "../prototype/source-media-health.html?path=episode",
  "source media health can carry episode path context in the preview app",
);
assert.equal(
  episodeRoles.nodes.prevStep.href,
  "#speaker-role-mapping?path=episode",
  "episode path source media step returns to role mapping",
);
assert.equal(
  episodeRoles.nodes.nextStep.href,
  "#speaker-sync-repair",
  "episode path source media step continues to speaker sync",
);

const ingestRoles = runApp("#speaker-role-mapping?path=ingest");
assert.equal(
  ingestRoles.nodes.frame.src,
  "../prototype/speaker-role-mapping.html?path=ingest",
  "ingest path context loads role mapping with its route context",
);
assert.equal(
  ingestRoles.nodes.prevStep.href,
  "#episode-readiness?path=ingest",
  "ingest path context steps back to episode readiness",
);
assert.equal(
  ingestRoles.nodes.nextStep.href,
  "#social-context-intake?path=ingest",
  "ingest path context steps forward to social context",
);

ingestRoles.reroute("#social-context-intake?path=ingest");
assert.equal(
  ingestRoles.nodes.frame.src,
  "../prototype/social-context-intake.html?path=ingest",
  "ingest path context loads social context with its route context",
);
assert.equal(
  ingestRoles.nodes.prevStep.href,
  "#speaker-role-mapping?path=ingest",
  "ingest social context step returns to role mapping",
);
assert.equal(
  ingestRoles.nodes.nextStep.href,
  "#source-media-health?path=episode",
  "ingest social context step hands into the episode source-media path",
);

ingestRoles.reroute("#speaker-visual-match?path=episode");
assert.equal(
  ingestRoles.nodes.frame.src,
  "../prototype/speaker-visual-match.html",
  "non-ingest screens discard ingest route context",
);

const publishPath = runApp("#episode-watch-through-preview?path=publish");
assert.equal(
  publishPath.nodes.frame.src,
  "../prototype/episode-watch-through-preview.html?path=publish",
  "publish path context loads watch-through preview with its route context",
);
assert.equal(
  publishPath.nodes.nextStep.href,
  "#destination-crop-preview?path=publish",
  "publish path context steps forward inside publish prep",
);

publishPath.reroute("#destination-crop-preview?path=publish");
assert.equal(
  publishPath.nodes.frame.src,
  "../prototype/destination-crop-preview.html?path=publish",
  "publish path context loads middle publish prep screens with its route context",
);
assert.equal(
  publishPath.nodes.prevStep.href,
  "#episode-watch-through-preview?path=publish",
  "publish path context is preserved when stepping back inside publish prep",
);
assert.equal(
  publishPath.nodes.nextStep.href,
  "#thumbnail-cover-frame?path=publish",
  "publish path context is preserved when stepping forward inside publish prep",
);

publishPath.reroute("#export-readiness-review?path=publish");
assert.equal(
  publishPath.nodes.frame.src,
  "../prototype/export-readiness-review.html",
  "non-publish screens discard publish route context",
);

styleEntry.reroute("#missing-screen?from=style");
assert.equal(
  styleEntry.nodes.frame.src,
  "../prototype/source-media-health.html",
  "unknown route hashes fall back to the first known screen without route context",
);

console.log("preview app route context: contextual visuals and ingest path context are preserved safely");
