"use strict";

// Regression tests for music cue → layout-first placement handoff (#583).
// Run with: `node preview/music-nav-layout-placement.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const handoffScript = fs.readFileSync(path.join(__dirname, "music-layout-placement-handoff.js"), "utf8");
const navScript = fs.readFileSync(path.join(__dirname, "music-nav.js"), "utf8");

function makeHandoff(search = "") {
  const sandbox = { module: { exports: {} }, exports: {}, URLSearchParams };
  vm.runInNewContext(handoffScript, sandbox);
  const { createMusicLayoutPlacementHandoff } = sandbox.module.exports;
  const targets = [];
  return createMusicLayoutPlacementHandoff({
    readSearch: () => search,
    setTopTarget(link) {
      link.target = "_top";
      targets.push(link);
    },
  });
}

const defaultHandoff = makeHandoff();
assert.equal(
  defaultHandoff.layoutFirstPlacementHref(),
  "../preview/layout-first.html?from=music",
  "music path links to layout-first with music context",
);
assert.ok(defaultHandoff.shouldOfferOnStep("music-cue-setup"), "placement is offered on music cue setup");
assert.ok(!defaultHandoff.shouldOfferOnStep("music-ducking-under-speech"), "placement is not offered on ducking step");

const episodeHandoff = makeHandoff("?path=episode");
assert.equal(
  episodeHandoff.layoutFirstPlacementHref(),
  "../preview/layout-first.html?path=episode&from=music",
  "episode shell path is preserved on the layout-first placement link",
);

const link = { href: "", target: "" };
defaultHandoff.applyPlacementLink(link);
assert.equal(link.href, "../preview/layout-first.html?from=music", "applyPlacementLink sets href");
assert.equal(link.target, "_top", "applyPlacementLink sets embedded top target");

assert.ok(navScript.includes("createMusicLayoutPlacementHandoff"), "music nav uses the shared placement handoff helper");
assert.ok(navScript.includes("Place videos in layout"), "music nav surfaces layout-first placement on cue setup");

const cueHtml = fs.readFileSync(path.join(__dirname, "..", "prototype", "music-cue-setup.html"), "utf8");
assert.ok(
  cueHtml.includes("music-layout-placement-handoff.js"),
  "music cue setup loads the placement handoff helper before music-nav",
);

console.log("music nav layout placement: music cue setup links into layout-first slots");
