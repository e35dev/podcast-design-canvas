"use strict";

// Guards music cue prototype navigation (#583).
// Run with: `node preview/music-nav.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const root = path.join(__dirname, "..");
const navScript = fs.readFileSync(path.join(__dirname, "music-nav.js"), "utf8");

new vm.Script(navScript);
assert.ok(navScript.includes('home.href = "../preview/"'), "music nav links back to the preview shell");
assert.ok(navScript.includes("episode-flow.html"), "music nav links to the guided episode flow");
assert.ok(navScript.includes("currentPreviewAppHref"), "music nav builds preview app href from the active step");
assert.ok(
  navScript.includes("setTopTargetWhenEmbedded(app)"),
  "music nav preview app link uses embedded target handling",
);
assert.ok(navScript.includes("audio-cleanup-controls.html"), "music nav entry links to audio cleanup");
assert.ok(navScript.includes("pause-crosstalk-cleanup.html"), "music nav hands off to pause cleanup");
assert.ok(navScript.includes('document.querySelector(".music-nav")'), "music nav guards against double render");
assert.ok(!/innerHTML/.test(navScript), "music nav builds the DOM without innerHTML");

const musicScreens = [
  "music-cue-setup.html",
  "music-ducking-under-speech.html",
];

const musicFlowMatch = navScript.match(/const MUSIC_FLOW = \[([\s\S]*?)\];/);
assert.ok(musicFlowMatch, "music nav declares MUSIC_FLOW");
const flowFiles = [...musicFlowMatch[1].matchAll(/file:\s*"([a-z0-9-]+\.html)"/g)].map((m) => m[1]);
assert.deepStrictEqual(flowFiles, musicScreens, "music nav path is the two music screens, in order");

for (const file of musicScreens) {
  const html = fs.readFileSync(path.join(root, "prototype", file), "utf8");
  assert.ok(html.includes("../preview/music-nav.js"), `${file} loads music navigation`);
  assert.ok(!html.includes("../preview/tools-nav.js"), `${file} uses music nav instead of tools nav`);
  assert.ok(html.includes("data-music-step="), `${file} declares its music step`);
}

function createElement(tagName) {
  return {
    tagName,
    attributes: {},
    children: [],
    className: "",
    href: "",
    id: "",
    target: "",
    textContent: "",
    setAttribute(name, value) {
      this.attributes[name] = value;
      if (name === "id") this.id = value;
      if (name === "class") this.className = value;
    },
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    insertBefore(child, before) {
      const index = this.children.indexOf(before);
      this.children.splice(index === -1 ? 0 : index, 0, child);
      return child;
    },
  };
}

function flatten(node) {
  return [node, ...node.children.flatMap(flatten)];
}

function makeWindow(fileName, embedded = false) {
  const window = { location: { pathname: `/prototype/${fileName}` } };
  window.self = window;
  window.top = embedded ? { location: { pathname: "/preview/app.html" } } : window;
  return window;
}

function renderNavFor(fileName, musicStep, embedded = false) {
  const head = createElement("head");
  const body = createElement("body");
  if (musicStep) {
    body.dataset = { musicStep };
  }
  const document = {
    readyState: "complete",
    head,
    body,
    createElement,
    getElementById(id) {
      return [...flatten(head), ...flatten(body)].find((node) => node.id === id) || null;
    },
    querySelector(selector) {
      if (!selector.startsWith(".")) return null;
      const className = selector.slice(1);
      return flatten(body).find((node) => node.className.split(" ").includes(className)) || null;
    },
  };

  vm.runInNewContext(navScript, {
    document,
    window: makeWindow(fileName, embedded),
  });

  return flatten(body);
}

function linkWithText(nodes, text) {
  const link = nodes.find((node) => node.tagName === "a" && node.textContent === text);
  assert.ok(link, `Missing link: ${text}`);
  return link;
}

const firstNav = renderNavFor("music-cue-setup.html", "music-cue-setup");
const entryLink = linkWithText(firstNav, "Previous: Audio cleanup");
assert.equal(entryLink.href, "audio-cleanup-controls.html", "first music screen returns to audio cleanup");

const secondNav = renderNavFor("music-ducking-under-speech.html", "music-ducking-under-speech");
assert.equal(
  linkWithText(secondNav, "Previous: Music cue setup").href,
  "music-cue-setup.html",
  "ducking screen returns to music cue setup",
);
const handoff = linkWithText(secondNav, "Continue: Pause & cross-talk cleanup");
assert.equal(handoff.href, "pause-crosstalk-cleanup.html", "last music screen hands off to pause cleanup");

const embeddedFirstNav = renderNavFor("music-cue-setup.html", "music-cue-setup", true);
const embeddedHome = linkWithText(embeddedFirstNav, "← Preview shell");
assert.equal(embeddedHome.href, "../preview/", "embedded music nav keeps the shell-home href");
assert.equal(embeddedHome.target, "_top", "embedded shell-home link targets the parent app");
const embeddedPreviewApp = linkWithText(embeddedFirstNav, "Preview app");
assert.equal(
  embeddedPreviewApp.href,
  "../preview/app.html#music-cue-setup",
  "embedded music nav opens the current screen in the preview app",
);
assert.equal(embeddedPreviewApp.target, "_top", "embedded preview app link targets the parent app");
assert.equal(
  linkWithText(embeddedFirstNav, "Previous: Audio cleanup").href,
  "../preview/app.html#audio-cleanup-controls",
  "embedded music nav routes entry back through the preview app hash",
);
assert.equal(
  linkWithText(embeddedFirstNav, "Next: Music ducking under speech").href,
  "../preview/app.html#music-ducking-under-speech",
  "embedded music nav routes next step through the preview app hash",
);

const embeddedSecondNav = renderNavFor("music-ducking-under-speech.html", "music-ducking-under-speech", true);
assert.equal(
  linkWithText(embeddedSecondNav, "Preview app").href,
  "../preview/app.html#music-ducking-under-speech",
  "embedded music nav keeps preview app on the active ducking step",
);

console.log("music nav: two-step music path links audio cleanup to pause cleanup");
