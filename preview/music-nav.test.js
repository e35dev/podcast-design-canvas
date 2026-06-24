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
    getAttribute(name) {
      return this.attributes[name] || "";
    },
    closest(selector) {
      return selector === "a[href]" && this.tagName === "a" && this.getAttribute("href") ? this : null;
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

function appendStaticLink(body, href, text = href) {
  const link = createElement("a");
  link.href = href;
  link.textContent = text;
  link.attributes.href = href;
  body.appendChild(link);
  return link;
}

function makeWindow(fileName, embedded = false, search = "") {
  const window = { location: { pathname: `/prototype/${fileName}`, search } };
  window.self = window;
  window.top = embedded ? { location: { pathname: "/preview/app.html" } } : window;
  return window;
}

function renderNavFor(fileName, musicStep, embedded = false, staticHrefs = [], search = "") {
  const head = createElement("head");
  const body = createElement("body");
  const listeners = {};
  if (musicStep) {
    body.dataset = { musicStep };
  }
  staticHrefs.forEach((href) => appendStaticLink(body, href));
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
    querySelectorAll(selector) {
      if (selector !== "a[href]") return [];
      return flatten(body).filter((node) => node.tagName === "a" && node.getAttribute("href"));
    },
    addEventListener(type, handler) {
      listeners[type] = handler;
    },
  };

  vm.runInNewContext(navScript, {
    document,
    window: makeWindow(fileName, embedded, search),
    URLSearchParams,
  });

  const nodes = flatten(body);
  nodes.listeners = listeners;
  return nodes;
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

const standaloneMusicLinks = renderNavFor(
  "music-cue-setup.html",
  "music-cue-setup",
  false,
  [
    "music-ducking-under-speech.html",
    "social-context-intake.html",
    "#readiness",
    "https://example.com/music-cue-setup.html",
  ],
);
assert.equal(
  linkWithText(standaloneMusicLinks, "music-ducking-under-speech.html").href,
  "music-ducking-under-speech.html",
  "standalone music nav leaves in-page music links as direct prototype links",
);
assert.equal(
  linkWithText(standaloneMusicLinks, "social-context-intake.html").href,
  "social-context-intake.html",
  "music nav leaves unrelated in-page links alone",
);
assert.equal(
  linkWithText(standaloneMusicLinks, "#readiness").href,
  "#readiness",
  "music nav leaves same-page anchors alone",
);
assert.equal(
  linkWithText(standaloneMusicLinks, "https://example.com/music-cue-setup.html").href,
  "https://example.com/music-cue-setup.html",
  "music nav leaves external links alone",
);

const embeddedMusicLinks = renderNavFor(
  "music-cue-setup.html",
  "music-cue-setup",
  true,
  ["music-ducking-under-speech.html", "audio-cleanup-controls.html", "pause-crosstalk-cleanup.html"],
);
assert.equal(
  linkWithText(embeddedMusicLinks, "music-ducking-under-speech.html").href,
  "../preview/app.html#music-ducking-under-speech",
  "embedded music nav routes in-page music links through the preview app",
);
assert.equal(
  linkWithText(embeddedMusicLinks, "audio-cleanup-controls.html").href,
  "../preview/app.html#audio-cleanup-controls",
  "embedded music nav routes entry-screen links through the preview app",
);
assert.equal(
  linkWithText(embeddedMusicLinks, "pause-crosstalk-cleanup.html").href,
  "../preview/app.html#pause-crosstalk-cleanup",
  "embedded music nav routes handoff-screen links through the preview app",
);
assert.equal(
  linkWithText(embeddedMusicLinks, "music-ducking-under-speech.html").target,
  "_top",
  "embedded in-page music links target the parent app",
);

const dynamicMusicLinks = renderNavFor("music-cue-setup.html", "music-cue-setup", true);
const dynamicDuckingLink = appendStaticLink(dynamicMusicLinks[0], "music-ducking-under-speech.html", "Review ducking");
dynamicMusicLinks.listeners.click({ target: dynamicDuckingLink });
assert.equal(
  dynamicDuckingLink.href,
  "../preview/app.html#music-ducking-under-speech",
  "embedded music nav normalizes dynamically rendered music links before navigation",
);
assert.equal(dynamicDuckingLink.target, "_top", "dynamic embedded music links target the parent app");

const pathNav = renderNavFor("music-ducking-under-speech.html", "music-ducking-under-speech", false, [], "?path=episode");
assert.ok(
  linkWithText(pathNav, "Previous: Music cue setup").href.includes("?path=episode"),
  "music nav keeps the episode path context on the previous link",
);
assert.equal(
  linkWithText(pathNav, "Continue: Pause & cross-talk cleanup").href,
  "pause-crosstalk-cleanup.html?path=episode",
  "music nav keeps episode path context on the cleanup handoff",
);
const noPathNav = renderNavFor("music-ducking-under-speech.html", "music-ducking-under-speech", false, [], "");
assert.ok(
  !linkWithText(noPathNav, "Previous: Music cue setup").href.includes("?path="),
  "music nav adds no path suffix when there is no path context",
);

const embeddedPathNav = renderNavFor("music-cue-setup.html", "music-cue-setup", true, [], "?path=episode");
assert.equal(
  linkWithText(embeddedPathNav, "Preview app").href,
  "../preview/app.html#music-cue-setup?path=episode",
  "embedded music nav keeps episode path context on the preview app link",
);

function renderNavWithInPageLinks(fileName, musicStep, embedded, search, hrefs) {
  const head = createElement("head");
  const body = createElement("body");
  const listeners = { click: null };
  if (musicStep) {
    body.dataset = { musicStep };
  }
  const allNodes = () => [...flatten(head), ...flatten(body)];
  const document = {
    readyState: "complete",
    head,
    body,
    createElement,
    getElementById(id) {
      return allNodes().find((node) => node.id === id) || null;
    },
    querySelector(selector) {
      if (!selector.startsWith(".")) return null;
      const className = selector.slice(1);
      return flatten(body).find((node) => node.className.split(" ").includes(className)) || null;
    },
    querySelectorAll(selector) {
      if (selector !== "a[href]") return [];
      return allNodes().filter((node) => node.tagName === "a" && node.getAttribute("href"));
    },
    addEventListener(type, handler) {
      if (type === "click") listeners.click = handler;
    },
  };
  for (const href of hrefs) {
    appendStaticLink(body, href, href);
  }

  vm.runInNewContext(navScript, {
    document,
    window: makeWindow(fileName, embedded, search || ""),
    URLSearchParams,
  });

  return { nodes: flatten(body), listeners };
}

const inPageMusicLinks = renderNavWithInPageLinks(
  "music-cue-setup.html",
  "music-cue-setup",
  false,
  "?path=episode",
  ["music-ducking-under-speech.html", "audio-cleanup-controls.html"],
);
assert.equal(
  linkWithText(inPageMusicLinks.nodes, "music-ducking-under-speech.html").href,
  "music-ducking-under-speech.html?path=episode",
  "music nav keeps episode path context on in-page music links",
);
assert.equal(
  linkWithText(inPageMusicLinks.nodes, "audio-cleanup-controls.html").href,
  "audio-cleanup-controls.html?path=episode",
  "music nav keeps episode path context on in-page entry links",
);

const introOutroFixLink = renderNavWithInPageLinks(
  "music-cue-setup.html",
  "music-cue-setup",
  false,
  "?path=episode",
  ["intro-outro-builder.html"],
);
assert.equal(
  linkWithText(introOutroFixLink.nodes, "intro-outro-builder.html").href,
  "intro-outro-builder.html?path=episode",
  "music cue intro/outro fix links keep episode path context",
);

const publishFixLink = renderNavWithInPageLinks(
  "music-cue-setup.html",
  "music-cue-setup",
  false,
  "?path=episode",
  ["show-notes-assembly.html"],
);
assert.equal(
  linkWithText(publishFixLink.nodes, "show-notes-assembly.html").href,
  "show-notes-assembly.html?path=publish",
  "music cue sponsor-bed fix links route to the publish path",
);

const readinessFixLink = renderNavWithInPageLinks(
  "music-ducking-under-speech.html",
  "music-ducking-under-speech",
  false,
  "?path=episode",
  ["export-readiness-review.html"],
);
assert.equal(
  linkWithText(readinessFixLink.nodes, "export-readiness-review.html").href,
  "export-readiness-review.html?path=episode",
  "music ducking export readiness fix links keep episode path context",
);

const embeddedIntroOutroFix = renderNavWithInPageLinks(
  "music-cue-setup.html",
  "music-cue-setup",
  true,
  "?path=episode",
  ["intro-outro-builder.html"],
);
const embeddedIntroOutro = linkWithText(embeddedIntroOutroFix.nodes, "intro-outro-builder.html");
assert.equal(
  embeddedIntroOutro.href,
  "../preview/app.html#intro-outro-builder?path=episode",
  "embedded music fix links route intro/outro through the preview app",
);
assert.equal(embeddedIntroOutro.target, "_top", "embedded music fix links target the parent app");

const dynamicFix = renderNavWithInPageLinks(
  "music-cue-setup.html",
  "music-cue-setup",
  true,
  "?path=episode",
  [],
);
const dynamicLink = appendStaticLink(dynamicFix.nodes[0], "export-readiness-review.html", "export-readiness-review.html");
dynamicFix.listeners.click({ target: dynamicLink });
assert.equal(
  dynamicLink.href,
  "../preview/app.html#export-readiness-review?path=episode",
  "embedded music nav normalizes dynamically rendered fix links before navigation",
);

console.log("music nav: two-step music path links audio cleanup to pause cleanup");
