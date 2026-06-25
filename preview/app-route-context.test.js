"use strict";

// Guards contextual visuals entry context in the unified preview app (#581 / #583).
// Run with: `node preview/app-route-context.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const appHtml = fs.readFileSync(path.join(__dirname, "app.html"), "utf8");
const appScript = appHtml.match(/<script>([\s\S]*?)<\/script>/)[1];
const routeContextScript = fs.readFileSync(path.join(__dirname, "app-route-context.js"), "utf8");
const layoutHandoffScript = fs.readFileSync(path.join(__dirname, "layout-handoff.js"), "utf8");

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
  vm.runInNewContext(`${layoutHandoffScript}\n${routeContextScript}\n${appScript}`, {
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

assert.ok(
  appHtml.indexOf("./layout-handoff.js") < appHtml.indexOf("./app-route-context.js"),
  "preview app loads layout handoff before route context",
);
assert.ok(
  routeContextScript.includes("globalThis.PodcastLayoutHandoff")
    && routeContextScript.includes("window.PodcastLayoutHandoff"),
  "route context uses the shared layout handoff helper explicitly",
);
assert.ok(
  !routeContextScript.includes('interview: ["host", "guest"]'),
  "route context does not duplicate layout slot definitions",
);

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

const layoutStartRoles = runApp("#speaker-role-mapping?path=episode&layout=panel&slots=host,guest,guest-b");
assert.equal(
  layoutStartRoles.nodes.frame.src,
  "../prototype/speaker-role-mapping.html?path=episode&layout=panel&slots=host%2Cguest%2Cguest-b",
  "layout-first handoff keeps the selected layout and required placed slots on role mapping",
);
assert.equal(
  layoutStartRoles.nodes.prevStep.href,
  "#episode-readiness?path=episode&layout=panel&slots=host%2Cguest%2Cguest-b",
  "layout-first handoff survives stepping back to episode readiness",
);
assert.equal(
  layoutStartRoles.nodes.nextStep.href,
  "#source-media-health?path=episode",
  "layout-first handoff does not leak layout params into later episode screens",
);
layoutStartRoles.reroute("#episode-readiness?path=episode&layout=panel&slots=host,guest,guest-b");
assert.equal(
  layoutStartRoles.nodes.frame.src,
  "../prototype/episode-readiness.html?path=episode&layout=panel&slots=host%2Cguest%2Cguest-b",
  "episode readiness keeps the layout-first handoff while the creator checks the previous step",
);
assert.equal(
  layoutStartRoles.nodes.nextStep.href,
  "#speaker-role-mapping?path=episode&layout=panel&slots=host%2Cguest%2Cguest-b",
  "returning from episode readiness restores the layout-first role mapping handoff",
);

const layoutStartRolesWithBroll = runApp("#speaker-role-mapping?path=episode&layout=interview&slots=host,guest&broll=placed");
assert.equal(
  layoutStartRolesWithBroll.nodes.frame.src,
  "../prototype/speaker-role-mapping.html?path=episode&layout=interview&slots=host%2Cguest&broll=placed",
  "layout-first handoff carries the optional b-roll flag through to role mapping",
);
assert.equal(
  layoutStartRolesWithBroll.nodes.prevStep.href,
  "#episode-readiness?path=episode&layout=interview&slots=host%2Cguest&broll=placed",
  "optional b-roll handoff also survives the role-mapping back step",
);

const placementJson = JSON.stringify([
  { slot: "host", name: "100% final, host:cut.mp4", sig: "name:100% final, host:cut.mp4|size:9|mtime:4" },
  { slot: "guest", name: "100% final, guest:cut.mp4", sig: "name:100% final, guest:cut.mp4|size:10|mtime:5" },
]);
const placementSearch = new URLSearchParams({
  path: "episode",
  layout: "interview",
  slots: "host,guest",
  placements: placementJson,
}).toString();
const layoutStartRolesWithPlacements = runApp(`#speaker-role-mapping?${placementSearch}`);
assert.equal(
  new URLSearchParams(layoutStartRolesWithPlacements.nodes.frame.src.split("?")[1]).get("placements"),
  placementJson,
  "layout-first query handoff carries arbitrary recording identities through to role mapping",
);
assert.equal(
  new URLSearchParams(layoutStartRolesWithPlacements.nodes.prevStep.href.split("?")[1]).get("placements"),
  placementJson,
  "layout-first query handoff identities survive stepping back to episode readiness",
);

const invalidLayoutStartRoles = runApp("#speaker-role-mapping?path=episode&layout=panel&slots=host,guest");
assert.equal(
  invalidLayoutStartRoles.nodes.frame.src,
  "../prototype/speaker-role-mapping.html?path=episode",
  "invalid layout-first slot handoff is stripped by the preview app",
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
  "#speaker-sync-repair?path=episode",
  "episode path source media step continues to speaker sync with route context",
);

episodeRoles.reroute("#speaker-sync-repair?path=episode");
assert.equal(
  episodeRoles.nodes.frame.src,
  "../prototype/speaker-sync-repair.html?path=episode",
  "speaker sync repair can carry episode path context in the preview app",
);
assert.equal(
  episodeRoles.nodes.prevStep.href,
  "#source-media-health?path=episode",
  "episode path speaker sync step returns to source media health",
);
assert.equal(
  episodeRoles.nodes.nextStep.href,
  "#audio-cleanup-controls?path=episode",
  "episode path speaker sync step continues to audio cleanup",
);

const setupPath = runApp("#guest-profile-reuse?path=episode");
assert.equal(
  setupPath.nodes.frame.src,
  "../prototype/guest-profile-reuse.html?path=episode",
  "speaker setup screens keep episode path context in the preview app",
);
assert.equal(
  setupPath.nodes.prevStep.href,
  "#speaker-attribution-review?path=episode",
  "episode setup path steps back through speaker attribution",
);
assert.equal(
  setupPath.nodes.nextStep.href,
  "#speaker-visual-match?path=episode",
  "episode setup path follows speaker setup order instead of the raw rail order",
);

setupPath.reroute("#speaker-attribution-review?path=episode");
assert.equal(
  setupPath.nodes.prevStep.href,
  "#speaker-role-mapping?path=episode",
  "speaker setup entry returns to role mapping with episode context",
);

setupPath.reroute("#off-camera-speaker-presence?path=episode");
assert.equal(
  setupPath.nodes.nextStep.href,
  "#preset-style-picker?path=episode",
  "speaker setup handoff keeps episode context when entering style",
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
  "../prototype/speaker-visual-match.html?path=episode",
  "speaker setup hashes emitted by child nav keep episode route context",
);

const stylePath = runApp("#layout-safe-areas?path=episode");
assert.equal(
  stylePath.nodes.frame.src,
  "../prototype/layout-safe-areas.html?path=episode",
  "style screens keep episode path context in the preview app",
);
assert.equal(
  stylePath.nodes.prevStep.href,
  "#preset-pacing-controls?path=episode",
  "episode style path steps back with route context",
);
assert.equal(
  stylePath.nodes.nextStep.href,
  "#speaker-framing-safety?path=episode",
  "episode style path steps forward with route context",
);

stylePath.reroute("#canvas-layer-controls?path=episode");
assert.equal(
  stylePath.nodes.nextStep.href,
  "#contextual-broll-moments?from=style&path=episode",
  "style handoff keeps both style entry and episode path context",
);

const visualsPath = runApp("#contextual-title-cards?from=style&path=episode");
assert.equal(
  visualsPath.nodes.frame.src,
  "../prototype/contextual-title-cards.html?from=style&path=episode",
  "visuals screens keep combined from and episode path context",
);
assert.equal(
  visualsPath.nodes.prevStep.href,
  "#contextual-broll-moments?from=style&path=episode",
  "visuals path keeps combined context when stepping back",
);
assert.equal(
  visualsPath.nodes.nextStep.href,
  "#screen-share-moment-review?from=style&path=episode",
  "visuals path keeps combined context when stepping forward",
);

visualsPath.reroute("#sensitive-moment-review?from=style&path=episode");
assert.equal(
  visualsPath.nodes.nextStep.href,
  "#show-segment-system?path=episode",
  "visuals handoff to reuse keeps episode path context",
);

const reusePath = runApp("#intro-outro-builder?path=episode");
assert.equal(
  reusePath.nodes.frame.src,
  "../prototype/intro-outro-builder.html?path=episode",
  "reuse screens keep episode path context in the preview app",
);
assert.equal(
  reusePath.nodes.prevStep.href,
  "#episode-chapter-markers?path=episode",
  "episode reuse path steps back with route context",
);
assert.equal(
  reusePath.nodes.nextStep.href,
  "#episode-runtime-shaping?path=episode",
  "episode reuse path steps forward with route context",
);

const musicPath = runApp("#music-cue-setup?path=episode");
assert.equal(
  musicPath.nodes.frame.src,
  "../prototype/music-cue-setup.html?path=episode",
  "music screens keep episode path context in the preview app",
);
assert.equal(
  musicPath.nodes.prevStep.href,
  "#audio-cleanup-controls?path=episode",
  "music entry returns to audio cleanup with episode context",
);
assert.equal(
  musicPath.nodes.nextStep.href,
  "#music-ducking-under-speech?path=episode",
  "music path steps forward with episode context",
);

const cleanupPath = runApp("#transcript-glossary?from=cleanup&path=episode");
assert.equal(
  cleanupPath.nodes.frame.src,
  "../prototype/transcript-glossary.html?from=cleanup&path=episode",
  "cleanup screens keep combined entry and episode path context",
);
assert.equal(
  cleanupPath.nodes.prevStep.href,
  "#pause-crosstalk-cleanup?from=cleanup&path=episode",
  "cleanup path keeps combined context when stepping back",
);
assert.equal(
  cleanupPath.nodes.nextStep.href,
  "#transcript-search-navigation?from=cleanup&path=episode",
  "cleanup path keeps combined context when stepping forward",
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

publishPath.reroute("#export-package-handoff?path=publish");
assert.equal(
  publishPath.nodes.frame.src,
  "../prototype/export-package-handoff.html?path=publish",
  "publish path context loads export package handoff with its route context",
);
assert.equal(
  publishPath.nodes.nextStep.href,
  "#clip-candidate-review?path=publish",
  "publish path context is preserved when stepping from export package handoff to clip review",
);

publishPath.reroute("#clip-candidate-review?path=publish");
assert.equal(
  publishPath.nodes.frame.src,
  "../prototype/clip-candidate-review.html?path=publish",
  "publish path context loads clip review with its route context",
);
assert.equal(
  publishPath.nodes.prevStep.href,
  "#export-package-handoff?path=publish",
  "publish path context is preserved when stepping back from clip review",
);
assert.equal(
  publishPath.nodes.nextStep.href,
  "#client-review-copy-flow?path=publish",
  "publish path context is preserved when stepping forward from clip review",
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
  "../prototype/episode-setup-intake.html",
  "unknown route hashes fall back to the first known screen without route context",
);

console.log("preview app route context: contextual visuals and ingest path context are preserved safely");
