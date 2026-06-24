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
assert.ok(navScript.includes("canvas-layer-controls.html"), "visuals nav links back to the visual direction path by default");
assert.ok(navScript.includes("on-screen-correction-note.html"), "visuals nav links back to the cleanup path when entered from cleanup");
assert.ok(navScript.includes("isCleanupPathEntry"), "visuals nav chooses the entry back-link from the handoff context");
assert.ok(navScript.includes('document.querySelector(".visuals-nav")'), "visuals nav guards against double render");
assert.ok(!/innerHTML/.test(navScript), "visuals nav builds the DOM without innerHTML");

const visualsScreens = [
  "contextual-broll-moments.html",
  "contextual-title-cards.html",
  "sensitive-moment-review.html",
];

// The nav declares its path in order, and every screen in it exists.
const flowMatch = navScript.match(/const VISUALS_FLOW = \[([\s\S]*?)\];/);
assert.ok(flowMatch, "visuals nav declares VISUALS_FLOW");
const flowFiles = [...flowMatch[1].matchAll(/file:\s*"([a-z0-9-]+\.html)"/g)].map((m) => m[1]);
assert.deepStrictEqual(flowFiles, visualsScreens, "visuals nav path is the three contextual-visuals screens, in order");

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

function makeWindow(fileName, embedded = false, search = "") {
  const window = { location: { pathname: `/prototype/${fileName}`, search } };
  window.self = window;
  window.top = embedded ? { location: { pathname: "/preview/app.html" } } : window;
  return window;
}

function renderNavFor(fileName, visualsStep, embedded = false, search = "") {
  const head = createElement("head");
  const body = createElement("body");
  if (visualsStep) {
    body.dataset = { visualsStep };
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
    window: makeWindow(fileName, embedded, search),
    URLSearchParams,
  });

  return flatten(body);
}

function linkWithText(nodes, text) {
  const link = nodes.find((node) => node.tagName === "a" && node.textContent === text);
  assert.ok(link, `Missing link: ${text}`);
  return link;
}

const styleEntryNav = renderNavFor("contextual-broll-moments.html", "contextual-broll-moments", false, "?from=style");
const styleBackLink = linkWithText(styleEntryNav, "Previous: Canvas layer controls");
assert.equal(
  styleBackLink.href,
  "canvas-layer-controls.html",
  "visuals entered from style path link back to canvas layer controls",
);

const cleanupEntryNav = renderNavFor("contextual-broll-moments.html", "contextual-broll-moments", false, "?from=cleanup");
const cleanupBackLink = linkWithText(cleanupEntryNav, "Previous: On-screen correction note");
assert.equal(
  cleanupBackLink.href,
  "on-screen-correction-note.html",
  "visuals entered from cleanup path link back to on-screen correction note",
);

const defaultEntryNav = renderNavFor("contextual-broll-moments.html", "contextual-broll-moments");
const defaultBackLink = linkWithText(defaultEntryNav, "Previous: Canvas layer controls");
assert.equal(
  defaultBackLink.href,
  "canvas-layer-controls.html",
  "visuals opened directly default to the visual direction back-link",
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
const embeddedCleanupEntryNav = renderNavFor("contextual-broll-moments.html", "contextual-broll-moments", true, "?from=cleanup");
const embeddedCleanupBack = linkWithText(embeddedCleanupEntryNav, "Previous: On-screen correction note");
assert.equal(
  embeddedCleanupBack.href,
  "../preview/app.html#on-screen-correction-note",
  "embedded visuals nav routes the cleanup back-link through the preview app hash",
);
assert.equal(embeddedCleanupBack.target, "_top", "embedded cleanup back-link targets the parent app");

const embeddedStyleEntryNav = renderNavFor("contextual-broll-moments.html", "contextual-broll-moments", true, "?from=style");
const embeddedStyleBack = linkWithText(embeddedStyleEntryNav, "Previous: Canvas layer controls");
assert.equal(
  embeddedStyleBack.href,
  "../preview/app.html#canvas-layer-controls",
  "embedded visuals nav routes the style back-link through the preview app hash",
);
assert.equal(embeddedStyleBack.target, "_top", "embedded style back-link targets the parent app");
const embeddedNext = linkWithText(embeddedFirstNav, "Next: Contextual title cards");
assert.equal(
  embeddedNext.href,
  "../preview/app.html#contextual-title-cards",
  "embedded visuals nav routes next visuals steps through the preview app hash",
);
assert.equal(embeddedNext.target, "_top", "embedded visuals next link targets the parent app");

const embeddedMiddleNav = renderNavFor("contextual-title-cards.html", "contextual-title-cards", true);
assert.equal(
  linkWithText(embeddedMiddleNav, "Previous: Contextual b-roll moments").href,
  "../preview/app.html#contextual-broll-moments",
  "embedded visuals nav routes previous visuals steps through the preview app hash",
);
assert.equal(
  linkWithText(embeddedMiddleNav, "Next: Sensitive moment review").href,
  "../preview/app.html#sensitive-moment-review",
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

console.log("visuals nav: contextual-visuals screens connected into one path");
