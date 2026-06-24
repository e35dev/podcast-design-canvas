"use strict";

// Guards contextual-visuals prototype navigation (#583).
// Run with: `node preview/visuals-nav.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const root = path.join(__dirname, "..");
const navScript = fs.readFileSync(path.join(__dirname, "visuals-nav.js"), "utf8");

new vm.Script(navScript);
assert.ok(navScript.includes('home.href = "../preview/"'), "visuals nav links back to the preview shell");
assert.ok(navScript.includes("episode-flow.html"), "visuals nav links to the guided episode flow");
assert.ok(navScript.includes("app.html"), "visuals nav links to the preview app");
assert.ok(navScript.includes("show-segment-system.html"), "visuals nav hands off to the reuse path");
assert.ok(navScript.includes("on-screen-correction-note.html"), "visuals nav links back to the cleanup path");
assert.ok(navScript.includes("canvas-layer-controls.html"), "visuals nav can link back to the visual direction path");
assert.ok(navScript.includes('document.querySelector(".visuals-nav")'), "visuals nav guards against double render");
assert.ok(!/innerHTML/.test(navScript), "visuals nav builds the DOM without innerHTML");

const visualsScreens = [
  "contextual-broll-moments.html",
  "contextual-title-cards.html",
  "screen-share-moment-review.html",
  "sensitive-moment-review.html",
];

// The nav declares its path in order, and every screen in it exists.
const flowFiles = [...navScript.matchAll(/file:\s*"([a-z0-9-]+\.html)"/g)].map((m) => m[1]);
assert.deepStrictEqual(flowFiles, visualsScreens, "visuals nav path is the four contextual-visuals screens, in order");

for (const file of visualsScreens) {
  const html = fs.readFileSync(path.join(root, "prototype", file), "utf8");
  assert.ok(html.includes("../preview/visuals-nav.js"), `${file} loads visuals navigation`);
  assert.ok(!html.includes("../preview/tools-nav.js"), `${file} uses visuals nav instead of tools nav`);
  assert.ok(html.includes("data-visuals-step="), `${file} declares its visuals step`);
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
    getAttribute(name) {
      if (name === "href") return this.href;
      return this.attributes[name] || "";
    },
    setAttribute(name, value) {
      this.attributes[name] = value;
      if (name === "id") this.id = value;
      if (name === "class") this.className = value;
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
  body.appendChild(link);
  return link;
}

function makeWindow(fileName, embedded = false, search = "") {
  const window = { location: { pathname: `/prototype/${fileName}`, search } };
  window.self = window;
  window.top = embedded ? { location: { pathname: "/preview/app.html" } } : window;
  return window;
}

function renderNavFor(fileName, visualsStep, embedded = false, search = "", staticHrefs = []) {
  const head = createElement("head");
  const body = createElement("body");
  const listeners = {};
  if (visualsStep) {
    body.dataset = { visualsStep };
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

function routeSearchFor(file) {
  const window = makeWindow("contextual-broll-moments.html");
  const sandbox = {
    document: { readyState: "loading", addEventListener() {} },
    window,
    URLSearchParams,
  };
  window.self = window;
  window.top = window;
  vm.runInNewContext(
    `${navScript}\nglobalThis.result = routeSearchFromFile(${JSON.stringify(file)});`,
    sandbox,
  );
  return sandbox.result;
}

assert.equal(
  routeSearchFor("contextual-title-cards.html?moment=42&from=style"),
  "?from=style",
  "visuals nav preserves style context when extra query params are present",
);
assert.equal(
  routeSearchFor("contextual-title-cards.html?from=cleanup&moment=42"),
  "?from=cleanup",
  "visuals nav preserves cleanup context when it is not the only query param",
);
assert.equal(
  routeSearchFor("contextual-title-cards.html?moment=42&from=unknown"),
  "",
  "visuals nav strips unsupported handoff context from preview app hashes",
);

const firstNav = renderNavFor("contextual-broll-moments.html", "contextual-broll-moments");
const cleanupBackLink = linkWithText(firstNav, "Previous: On-screen correction note");
assert.equal(
  cleanupBackLink.href,
  "on-screen-correction-note.html?from=cleanup",
  "first visuals screen links back to cleanup with cleanup context",
);
const defaultNextLink = linkWithText(firstNav, "Next: Contextual title cards");
assert.equal(
  defaultNextLink.href,
  "contextual-title-cards.html?from=cleanup",
  "default visuals entry carries cleanup context forward",
);

const styleEntryNav = renderNavFor("contextual-broll-moments.html", "contextual-broll-moments", false, "?from=style");
const styleBackLink = linkWithText(styleEntryNav, "Previous: Canvas layer controls");
assert.equal(
  styleBackLink.href,
  "canvas-layer-controls.html",
  "style-entered visuals link back to visual direction",
);
assert.equal(
  linkWithText(styleEntryNav, "Next: Contextual title cards").href,
  "contextual-title-cards.html?from=style",
  "style-entered visuals carry style context forward",
);

const styleEntryWithExtraNav = renderNavFor(
  "contextual-broll-moments.html",
  "contextual-broll-moments",
  false,
  "?moment=42&from=style",
);
assert.equal(
  linkWithText(styleEntryWithExtraNav, "Previous: Canvas layer controls").href,
  "canvas-layer-controls.html",
  "style-entered visuals still link back to visual direction when extra params are present",
);
assert.equal(
  linkWithText(styleEntryWithExtraNav, "Next: Contextual title cards").href,
  "contextual-title-cards.html?from=style",
  "style-entered visuals strip extra params but keep style context",
);

const cleanupMiddleNav = renderNavFor("contextual-title-cards.html", "contextual-title-cards", false, "?from=cleanup");
assert.equal(
  linkWithText(cleanupMiddleNav, "Previous: Contextual b-roll moments").href,
  "contextual-broll-moments.html?from=cleanup",
  "cleanup-entered visuals carry cleanup context backward inside the visuals path",
);
assert.equal(
  linkWithText(cleanupMiddleNav, "Next: Screen share moment review").href,
  "screen-share-moment-review.html?from=cleanup",
  "cleanup-entered visuals carry cleanup context forward inside the visuals path",
);

const lastNav = renderNavFor("sensitive-moment-review.html", "sensitive-moment-review");
const reuseHandoff = linkWithText(lastNav, "Continue: Show segment system");
assert.equal(
  reuseHandoff.href,
  "show-segment-system.html",
  "last visuals screen hands off to reuse",
);

const embeddedFirstNav = renderNavFor("contextual-broll-moments.html", "contextual-broll-moments", true);
const embeddedHome = linkWithText(embeddedFirstNav, "← Preview shell");
assert.equal(embeddedHome.href, "../preview/", "embedded visuals nav keeps the shell-home href");
assert.equal(embeddedHome.target, "_top", "embedded shell-home link targets the parent app");
const embeddedPreviewApp = linkWithText(embeddedFirstNav, "Preview app");
assert.equal(
  embeddedPreviewApp.href,
  "../preview/app.html#contextual-broll-moments?from=cleanup",
  "embedded visuals nav opens the current screen in the preview app with entry context",
);
assert.equal(embeddedPreviewApp.target, "_top", "embedded preview app link targets the parent app");
const embeddedCleanupBack = linkWithText(embeddedFirstNav, "Previous: On-screen correction note");
assert.equal(
  embeddedCleanupBack.href,
  "../preview/app.html#on-screen-correction-note?from=cleanup",
  "embedded visuals nav routes the cleanup back-link through the preview app hash with cleanup context",
);
assert.equal(embeddedCleanupBack.target, "_top", "embedded cleanup back-link targets the parent app");
const embeddedNext = linkWithText(embeddedFirstNav, "Next: Contextual title cards");
assert.equal(
  embeddedNext.href,
  "../preview/app.html#contextual-title-cards?from=cleanup",
  "embedded visuals nav routes next visuals steps through the preview app hash",
);
assert.equal(embeddedNext.target, "_top", "embedded visuals next link targets the parent app");

const embeddedStyleEntryNav = renderNavFor("contextual-broll-moments.html", "contextual-broll-moments", true, "?from=style");
assert.equal(
  linkWithText(embeddedStyleEntryNav, "Preview app").href,
  "../preview/app.html#contextual-broll-moments?from=style",
  "embedded style-entered visuals nav preserves style context on the current preview app link",
);
const embeddedStyleBack = linkWithText(embeddedStyleEntryNav, "Previous: Canvas layer controls");
assert.equal(
  embeddedStyleBack.href,
  "../preview/app.html#canvas-layer-controls",
  "embedded style-entered visuals route the back-link through the preview app hash",
);
const embeddedStyleNext = linkWithText(embeddedStyleEntryNav, "Next: Contextual title cards");
assert.equal(
  embeddedStyleNext.href,
  "../preview/app.html#contextual-title-cards?from=style",
  "embedded style-entered visuals preserve style context on next",
);

const embeddedMiddleNav = renderNavFor("contextual-title-cards.html", "contextual-title-cards", true, "?from=cleanup");
assert.equal(
  linkWithText(embeddedMiddleNav, "Previous: Contextual b-roll moments").href,
  "../preview/app.html#contextual-broll-moments?from=cleanup",
  "embedded visuals nav routes previous visuals steps through the preview app hash",
);
assert.equal(
  linkWithText(embeddedMiddleNav, "Next: Screen share moment review").href,
  "../preview/app.html#screen-share-moment-review?from=cleanup",
  "embedded visuals nav routes middle next steps through the preview app hash",
);

const embeddedLastNav = renderNavFor("sensitive-moment-review.html", "sensitive-moment-review", true);
const embeddedHandoff = linkWithText(embeddedLastNav, "Continue: Show segment system");
assert.equal(
  embeddedHandoff.href,
  "../preview/app.html#show-segment-system",
  "embedded visuals nav routes the reuse handoff through the preview app hash",
);
assert.equal(embeddedHandoff.target, "_top", "embedded visuals handoff targets the parent app");

const episodePathNav = renderNavFor("contextual-title-cards.html", "contextual-title-cards", false, "?path=episode&from=style");
assert.equal(
  linkWithText(episodePathNav, "Previous: Contextual b-roll moments").href,
  "contextual-broll-moments.html?from=style&path=episode",
  "visuals nav keeps style context and episode path on previous links",
);
assert.equal(
  linkWithText(episodePathNav, "Next: Screen share moment review").href,
  "screen-share-moment-review.html?from=style&path=episode",
  "visuals nav keeps style context and episode path on next links",
);

const episodePathHandoff = renderNavFor("sensitive-moment-review.html", "sensitive-moment-review", false, "?path=episode&from=style");
assert.equal(
  linkWithText(episodePathHandoff, "Continue: Show segment system").href,
  "show-segment-system.html?path=episode",
  "visuals nav merges episode path context onto the reuse handoff",
);

const cleanupPathBacklink = renderNavFor("contextual-broll-moments.html", "contextual-broll-moments", false, "?path=episode");
assert.equal(
  linkWithText(cleanupPathBacklink, "Previous: On-screen correction note").href,
  "on-screen-correction-note.html?from=cleanup&path=episode",
  "visuals nav merges episode path context onto cleanup entry backlinks",
);

const standaloneBrollLinks = renderNavFor(
  "contextual-broll-moments.html",
  "contextual-broll-moments",
  false,
  "?path=episode&from=style",
  [
    "contextual-title-cards.html",
    "social-context-intake.html",
    "#preview",
    "https://example.com/contextual-title-cards.html",
    "//cdn.example.com/contextual-title-cards.html",
  ],
);
assert.equal(
  linkWithText(standaloneBrollLinks, "contextual-title-cards.html").href,
  "contextual-title-cards.html?from=style&path=episode",
  "standalone visuals nav keeps visuals context on in-page visuals links",
);
assert.equal(
  linkWithText(standaloneBrollLinks, "social-context-intake.html").href,
  "social-context-intake.html",
  "visuals nav leaves non-visuals in-page links alone",
);
assert.equal(
  linkWithText(standaloneBrollLinks, "#preview").href,
  "#preview",
  "visuals nav leaves same-page anchors alone",
);
assert.equal(
  linkWithText(standaloneBrollLinks, "https://example.com/contextual-title-cards.html").href,
  "https://example.com/contextual-title-cards.html",
  "visuals nav leaves external links alone",
);
assert.equal(
  linkWithText(standaloneBrollLinks, "//cdn.example.com/contextual-title-cards.html").href,
  "//cdn.example.com/contextual-title-cards.html",
  "visuals nav leaves protocol-relative external links alone",
);

const embeddedBrollLinks = renderNavFor(
  "contextual-broll-moments.html",
  "contextual-broll-moments",
  true,
  "?from=cleanup",
  ["contextual-title-cards.html"],
);
const embeddedTitleLink = linkWithText(embeddedBrollLinks, "contextual-title-cards.html");
assert.equal(
  embeddedTitleLink.href,
  "../preview/app.html#contextual-title-cards?from=cleanup",
  "embedded visuals nav routes in-page visuals links through the preview app",
);
assert.equal(embeddedTitleLink.target, "_top", "embedded in-page visuals links target the parent app");

const dynamicBrollLinks = renderNavFor(
  "contextual-broll-moments.html",
  "contextual-broll-moments",
  true,
  "?path=episode&from=style",
);
const dynamicTitleLink = appendStaticLink(
  dynamicBrollLinks[0],
  "contextual-title-cards.html",
  "Open title cards",
);
dynamicBrollLinks.listeners.click({ target: dynamicTitleLink });
assert.equal(
  dynamicTitleLink.href,
  "../preview/app.html#contextual-title-cards?from=style&path=episode",
  "embedded visuals nav normalizes dynamically rendered visuals links before navigation",
);
assert.equal(dynamicTitleLink.target, "_top", "dynamic embedded visuals links target the parent app");

console.log("visuals nav: contextual-visuals screens connected into one path");
