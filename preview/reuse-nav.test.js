"use strict";

// Guards "make it reusable" prototype navigation (#583).
// Run with: `node preview/reuse-nav.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const root = path.join(__dirname, "..");
const navScript = fs.readFileSync(path.join(__dirname, "reuse-nav.js"), "utf8");

new vm.Script(navScript);
assert.ok(navScript.includes('home.href = "../preview/"'), "reuse nav links back to the preview shell");
assert.ok(navScript.includes("episode-flow.html"), "reuse nav links to the guided episode flow");
assert.ok(navScript.includes("app.html"), "reuse nav links to the preview app");
assert.ok(navScript.includes("episode-watch-through-preview.html"), "reuse nav hands off to the review stage");
assert.ok(navScript.includes('document.querySelector(".reuse-nav")'), "reuse nav guards against double render");
assert.ok(!/innerHTML/.test(navScript), "reuse nav builds the DOM without innerHTML");

const reuseScreens = [
  "show-segment-system.html",
  "show-template-adaptation.html",
  "start-from-previous-episode.html",
  "episode-chapter-markers.html",
  "intro-outro-builder.html",
  "episode-runtime-shaping.html",
];

const reuseFlowMatch = navScript.match(/const REUSE_FLOW = \[([\s\S]*?)\];/);
assert.ok(reuseFlowMatch, "reuse nav declares REUSE_FLOW");
const flowFiles = [...reuseFlowMatch[1].matchAll(/file:\s*"([a-z0-9-]+\.html)"/g)].map((m) => m[1]);
assert.deepStrictEqual(flowFiles, reuseScreens, "reuse nav path is the reuse screens, in order");

for (const file of reuseScreens) {
  const html = fs.readFileSync(path.join(root, "prototype", file), "utf8");
  assert.ok(html.includes("../preview/reuse-nav.js"), `${file} loads reuse navigation`);
  assert.ok(!html.includes("../preview/tools-nav.js"), `${file} uses reuse nav instead of tools nav`);
  assert.ok(html.includes("data-reuse-step="), `${file} declares its reuse step`);
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

function renderNavFor(fileName, reuseStep, embedded = false) {
  const head = createElement("head");
  const body = createElement("body");
  if (reuseStep) {
    body.dataset = { reuseStep };
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
    URLSearchParams,
  });

  return flatten(body);
}

function linkWithText(nodes, text) {
  const link = nodes.find((node) => node.tagName === "a" && node.textContent === text);
  assert.ok(link, `Missing link: ${text}`);
  return link;
}

const firstNav = renderNavFor("show-segment-system.html", "show-segment-system");
const visualsBackLink = linkWithText(firstNav, "Previous: Sensitive moment review");
assert.ok(visualsBackLink, "first reuse screen renders sensitive moment review as its previous step");
assert.equal(
  visualsBackLink.href,
  "sensitive-moment-review.html",
  "first reuse screen previous link returns to sensitive moment review",
);

const middleNav = renderNavFor("show-template-adaptation.html", "show-template-adaptation");
assert.ok(
  linkWithText(middleNav, "Previous: Show segment system"),
  "middle reuse screen renders the previous reuse step",
);
assert.ok(
  !middleNav.some((node) => node.tagName === "a" && node.textContent === "Previous: Sensitive moment review"),
  "middle reuse screen does not reuse the sensitive moment review back link",
);

const chapterNav = renderNavFor("episode-chapter-markers.html", "episode-chapter-markers");
assert.equal(
  linkWithText(chapterNav, "Next: Intro & outro builder").href,
  "intro-outro-builder.html",
  "chapter markers advances to intro and outro builder",
);

const lastNav = renderNavFor("episode-runtime-shaping.html", "episode-runtime-shaping");
const publishHandoff = linkWithText(lastNav, "Continue: Episode watch-through");
assert.equal(
  publishHandoff.href,
  "episode-watch-through-preview.html",
  "last reuse screen hands off to episode watch-through",
);

const embeddedFirstNav = renderNavFor("show-segment-system.html", "show-segment-system", true);
const embeddedHome = linkWithText(embeddedFirstNav, "← Preview shell");
assert.equal(embeddedHome.href, "../preview/", "embedded reuse nav keeps the shell-home href");
assert.equal(embeddedHome.target, "_top", "embedded shell-home link targets the parent app");
const embeddedVisualsBack = linkWithText(embeddedFirstNav, "Previous: Sensitive moment review");
assert.equal(
  embeddedVisualsBack.href,
  "../preview/app.html#sensitive-moment-review",
  "embedded reuse nav routes the contextual-visuals back-link through the preview app hash",
);
assert.equal(embeddedVisualsBack.target, "_top", "embedded contextual-visuals back-link targets the parent app");
const embeddedNext = linkWithText(embeddedFirstNav, "Next: Show template adaptation");
assert.equal(
  embeddedNext.href,
  "../preview/app.html#show-template-adaptation",
  "embedded reuse nav routes next reuse steps through the preview app hash",
);
assert.equal(embeddedNext.target, "_top", "embedded reuse next link targets the parent app");

const embeddedMiddleNav = renderNavFor("start-from-previous-episode.html", "start-from-previous-episode", true);
assert.equal(
  linkWithText(embeddedMiddleNav, "Previous: Show template adaptation").href,
  "../preview/app.html#show-template-adaptation",
  "embedded reuse nav routes previous reuse steps through the preview app hash",
);
assert.equal(
  linkWithText(embeddedMiddleNav, "Next: Episode chapter markers").href,
  "../preview/app.html#episode-chapter-markers",
  "embedded reuse nav routes middle next steps through the preview app hash",
);

const embeddedChapterNav = renderNavFor("episode-chapter-markers.html", "episode-chapter-markers", true);
assert.equal(
  linkWithText(embeddedChapterNav, "Next: Intro & outro builder").href,
  "../preview/app.html#intro-outro-builder",
  "embedded reuse nav routes the intro and outro step through the preview app hash",
);

const embeddedLastNav = renderNavFor("episode-runtime-shaping.html", "episode-runtime-shaping", true);
const embeddedHandoff = linkWithText(embeddedLastNav, "Continue: Episode watch-through");
assert.equal(
  embeddedHandoff.href,
  "../preview/app.html#episode-watch-through-preview",
  "embedded reuse nav routes the publish handoff through the preview app hash",
);
assert.equal(embeddedHandoff.target, "_top", "embedded reuse handoff targets the parent app");

// Path context: a creator who entered reuse on the guided episode path keeps the
// ?path=episode context on reuse navigation, matching the other flow navs.
function renderNavWithSearch(fileName, reuseStep, search) {
  const head = createElement("head");
  const body = createElement("body");
  if (reuseStep) { body.dataset = { reuseStep }; }
  const document = {
    readyState: "complete", head, body, createElement,
    getElementById(id) { return [...flatten(head), ...flatten(body)].find((node) => node.id === id) || null; },
    querySelector(selector) {
      if (!selector.startsWith(".")) return null;
      const className = selector.slice(1);
      return flatten(body).find((node) => node.className.split(" ").includes(className)) || null;
    },
  };
  const window = { location: { pathname: "/prototype/" + fileName, search: search } };
  window.self = window; window.top = window;
  vm.runInNewContext(navScript, { document, window, URLSearchParams });
  return flatten(body);
}

const pathNav = renderNavWithSearch("show-template-adaptation.html", "show-template-adaptation", "?path=episode");
assert.ok(
  linkWithText(pathNav, "Previous: Show segment system").href.includes("?path=episode"),
  "reuse nav keeps the episode path context on the previous link",
);
assert.ok(
  linkWithText(pathNav, "Next: Start from previous episode").href.includes("?path=episode"),
  "reuse nav keeps the episode path context on the next link",
);
const noPathNav = renderNavWithSearch("show-template-adaptation.html", "show-template-adaptation", "");
assert.ok(
  !linkWithText(noPathNav, "Previous: Show segment system").href.includes("?path="),
  "reuse nav adds no path suffix when there is no path context",
);

const conflictingPathNav = renderNavWithSearch("show-segment-system.html", "show-segment-system", "?path=episode");
assert.equal(
  linkWithText(conflictingPathNav, "Previous: Sensitive moment review").href,
  "sensitive-moment-review.html?path=episode",
  "reuse nav replaces conflicting path values when linking back to sensitive moment review",
);


assert.ok(navScript.includes("currentPreviewAppHref"), "reuse nav builds preview app href from the active step");

function renderNavWithInPageLinks(fileName, reuseStep, embedded, search, hrefs) {
  const head = createElement("head");
  const body = createElement("body");
  if (reuseStep) { body.dataset = { reuseStep }; }
  const listeners = { click: null };
  const allNodes = () => [...flatten(head), ...flatten(body)];
  const document = {
    readyState: "complete",
    head,
    body,
    createElement,
    getElementById(id) { return allNodes().find((node) => node.id === id) || null; },
    querySelector(selector) {
      if (!selector.startsWith(".")) return null;
      const className = selector.slice(1);
      return flatten(body).find((node) => node.className.split(" ").includes(className)) || null;
    },
    querySelectorAll(selector) {
      if (selector === "a[href]") {
        return allNodes().filter((node) => node.tagName === "a" && node.attributes.href);
      }
      return [];
    },
    addEventListener(name, handler) {
      if (name === "click") listeners.click = handler;
    },
  };
  for (const href of hrefs) {
    const link = createElement("a");
    link.setAttribute("href", href);
    link.getAttribute = function(name) { return this.attributes[name]; };
    link.textContent = href;
    body.appendChild(link);
  }
  const window = { location: { pathname: "/prototype/" + fileName, search: search || "" } };
  window.self = window;
  window.top = embedded ? { location: { pathname: "/preview/app.html" } } : window;
  vm.runInNewContext(navScript, { document, window, URLSearchParams });
  return { nodes: flatten(body), listeners };
}

const inPageReuseLinks = renderNavWithInPageLinks(
  "intro-outro-builder.html",
  "intro-outro-builder",
  false,
  "?path=episode",
  ["show-segment-system.html", "social-context-intake.html"],
);
assert.equal(
  linkWithText(inPageReuseLinks.nodes, "show-segment-system.html").href,
  "show-segment-system.html?path=episode",
  "reuse nav keeps episode path context on in-page reuse links",
);
assert.equal(
  linkWithText(inPageReuseLinks.nodes, "social-context-intake.html").href,
  "social-context-intake.html?path=episode",
  "reuse nav keeps episode path context on in-page fix links",
);

const musicFixLink = renderNavWithInPageLinks(
  "intro-outro-builder.html",
  "intro-outro-builder",
  false,
  "?path=episode",
  ["music-cue-setup.html"],
);
assert.equal(
  linkWithText(musicFixLink.nodes, "music-cue-setup.html").href,
  "music-cue-setup.html?path=episode",
  "intro/outro music cue fix links keep episode path context",
);

const embeddedMusicFix = renderNavWithInPageLinks(
  "intro-outro-builder.html",
  "intro-outro-builder",
  true,
  "?path=episode",
  ["music-cue-setup.html"],
);
const embeddedMusic = linkWithText(embeddedMusicFix.nodes, "music-cue-setup.html");
assert.equal(
  embeddedMusic.href,
  "../preview/app.html#music-cue-setup?path=episode",
  "embedded reuse fix links route through the preview app",
);
assert.equal(embeddedMusic.target, "_top", "embedded reuse fix links target the parent app");

const dynamicFix = renderNavWithInPageLinks(
  "episode-runtime-shaping.html",
  "episode-runtime-shaping",
  true,
  "?path=episode",
  [],
);
const dynamicLink = createElement("a");
dynamicLink.setAttribute("href", "pause-crosstalk-cleanup.html");
dynamicLink.getAttribute = function(name) { return this.attributes[name]; };
dynamicLink.closest = function(selector) { return selector === "a[href]" ? this : null; };
dynamicFix.nodes[0].appendChild(dynamicLink);
dynamicFix.listeners.click({ target: dynamicLink });
assert.equal(
  dynamicLink.href,
  "../preview/app.html#pause-crosstalk-cleanup?path=episode",
  "embedded reuse nav normalizes dynamically rendered fix links before navigation",
);

const embeddedPreviewApp = renderNavWithInPageLinks(
  "intro-outro-builder.html",
  "intro-outro-builder",
  true,
  "?path=episode",
  [],
);
assert.equal(
  linkWithText(embeddedPreviewApp.nodes, "Preview app").href,
  "../preview/app.html#intro-outro-builder?path=episode",
  "embedded reuse nav keeps the current screen in the preview app href",
);

const templateRoleFix = renderNavWithInPageLinks(
  "show-template-adaptation.html",
  "show-template-adaptation",
  false,
  "?path=episode",
  ["speaker-role-mapping.html"],
);
assert.equal(
  linkWithText(templateRoleFix.nodes, "speaker-role-mapping.html").href,
  "speaker-role-mapping.html?path=episode",
  "template adaptation role fix links keep episode path context",
);

const templateLayoutFix = renderNavWithInPageLinks(
  "show-template-adaptation.html",
  "show-template-adaptation",
  false,
  "?path=episode",
  ["layout-safe-areas.html"],
);
assert.equal(
  linkWithText(templateLayoutFix.nodes, "layout-safe-areas.html").href,
  "layout-safe-areas.html?path=episode",
  "template adaptation layout fix links keep episode path context",
);

const embeddedTemplateLayout = renderNavWithInPageLinks(
  "show-template-adaptation.html",
  "show-template-adaptation",
  true,
  "?path=episode",
  ["layout-safe-areas.html"],
);
const embeddedLayout = linkWithText(embeddedTemplateLayout.nodes, "layout-safe-areas.html");
assert.equal(
  embeddedLayout.href,
  "../preview/app.html#layout-safe-areas?path=episode",
  "embedded reuse fix links route layout safe areas through the preview app",
);
assert.equal(embeddedLayout.target, "_top", "embedded layout fix links target the parent app");

const previousEpisodeRoleFix = renderNavWithInPageLinks(
  "start-from-previous-episode.html",
  "start-from-previous-episode",
  false,
  "?path=episode",
  ["speaker-role-mapping.html?path=ingest"],
);
assert.equal(
  linkWithText(previousEpisodeRoleFix.nodes, "speaker-role-mapping.html?path=ingest").href,
  "speaker-role-mapping.html?path=ingest",
  "reuse nav preserves explicit ingest path on start-from-previous role fixes",
);

const embeddedPreviousRoleFix = renderNavWithInPageLinks(
  "start-from-previous-episode.html",
  "start-from-previous-episode",
  true,
  "?path=episode",
  ["speaker-role-mapping.html?path=ingest"],
);
assert.equal(
  linkWithText(embeddedPreviousRoleFix.nodes, "speaker-role-mapping.html?path=ingest").href,
  "../preview/app.html#speaker-role-mapping?path=ingest",
  "embedded reuse nav routes ingest-path role fixes through the preview app",
);

console.log("reuse nav: make-it-reusable screens connected into one path");
