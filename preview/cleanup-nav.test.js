"use strict";

// Guards "clean up audio & captions" prototype navigation (#583).
// Run with: `node preview/cleanup-nav.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const root = path.join(__dirname, "..");
const navScript = fs.readFileSync(path.join(__dirname, "cleanup-nav.js"), "utf8");

new vm.Script(navScript);
assert.ok(navScript.includes('home.href = "../preview/"'), "cleanup nav links back to the preview shell");
assert.ok(navScript.includes("episode-flow.html"), "cleanup nav links to the guided episode flow");
assert.ok(navScript.includes("app.html"), "cleanup nav links to the preview app");
assert.ok(navScript.includes("contextual-broll-moments.html"), "cleanup nav hands off to the visuals stage");
assert.ok(navScript.includes('document.querySelector(".cleanup-nav")'), "cleanup nav guards against double render");
assert.ok(!/innerHTML/.test(navScript), "cleanup nav builds the DOM without innerHTML");

const cleanupScreens = [
  "pause-crosstalk-cleanup.html",
  "transcript-glossary.html",
  "transcript-search-navigation.html",
  "accessibility-readability-checks.html",
  "line-pickup-insert.html",
  "pronunciation-name-review.html",
  "on-screen-correction-note.html",
];

const flowFiles = [...navScript.matchAll(/file:\s*"([a-z0-9-]+\.html)"/g)].map((m) => m[1]);
assert.deepStrictEqual(flowFiles, cleanupScreens, "cleanup nav path is the seven cleanup screens, in order");

for (const file of cleanupScreens) {
  const html = fs.readFileSync(path.join(root, "prototype", file), "utf8");
  assert.ok(html.includes("../preview/cleanup-nav.js"), `${file} loads cleanup navigation`);
  assert.ok(!html.includes("../preview/tools-nav.js"), `${file} uses cleanup nav instead of tools nav`);
  assert.ok(html.includes("data-cleanup-step="), `${file} declares its cleanup step`);
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

function renderNavFor(fileName, cleanupStep, embedded = false, search = "", staticHrefs = []) {
  const head = createElement("head");
  const body = createElement("body");
  const listeners = {};
  if (cleanupStep) {
    body.dataset = { cleanupStep };
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
  const window = makeWindow("on-screen-correction-note.html");
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
  routeSearchFor("contextual-broll-moments.html?moment=42&from=cleanup"),
  "?from=cleanup",
  "cleanup nav preserves cleanup context when extra query params are present",
);
assert.equal(
  routeSearchFor("contextual-broll-moments.html?from=style&moment=42"),
  "?from=style",
  "cleanup nav preserves style context when it is not the only query param",
);
assert.equal(
  routeSearchFor("contextual-broll-moments.html?moment=42&from=unknown"),
  "",
  "cleanup nav strips unsupported handoff context from preview app hashes",
);
assert.equal(
  routeSearchFor("publish-checklist.html?draft=final&path=publish"),
  "?path=publish",
  "cleanup nav preserves publish path context when returning to publish prep",
);

const firstNav = renderNavFor("pause-crosstalk-cleanup.html", "pause-crosstalk-cleanup");
const publishBackLink = linkWithText(firstNav, "Previous: Publish checklist");
assert.ok(publishBackLink, "first cleanup screen renders publish checklist as its previous step");
assert.equal(
  publishBackLink.href,
  "publish-checklist.html?path=publish",
  "first cleanup screen previous link returns to publish checklist with publish path context",
);

const middleNav = renderNavFor("transcript-glossary.html", "transcript-glossary");
assert.ok(
  linkWithText(middleNav, "Previous: Pause & cross-talk cleanup"),
  "middle cleanup screen renders the previous cleanup step",
);
assert.ok(
  !middleNav.some((node) => node.tagName === "a" && node.textContent === "Previous: Publish checklist"),
  "middle cleanup screen does not reuse the publish checklist back link",
);

const lastNav = renderNavFor("on-screen-correction-note.html", "on-screen-correction-note");
const visualsHandoff = linkWithText(lastNav, "Continue: Contextual b-roll moments");
assert.equal(
  visualsHandoff.href,
  "contextual-broll-moments.html?from=cleanup",
  "last cleanup screen hands off to contextual visuals",
);

const embeddedFirstNav = renderNavFor("pause-crosstalk-cleanup.html", "pause-crosstalk-cleanup", true);
const embeddedHome = linkWithText(embeddedFirstNav, "← Preview shell");
assert.equal(embeddedHome.href, "../preview/", "embedded cleanup nav keeps the shell-home href");
assert.equal(embeddedHome.target, "_top", "embedded shell-home link targets the parent app");
const embeddedPreviewApp = linkWithText(embeddedFirstNav, "Preview app");
assert.equal(
  embeddedPreviewApp.href,
  "../preview/app.html#pause-crosstalk-cleanup",
  "embedded cleanup nav opens the current screen in the preview app",
);
assert.equal(embeddedPreviewApp.target, "_top", "embedded preview app link targets the parent app");
const embeddedPublishBack = linkWithText(embeddedFirstNav, "Previous: Publish checklist");
assert.equal(
  embeddedPublishBack.href,
  "../preview/app.html#publish-checklist?path=publish",
  "embedded cleanup nav routes the publish back-link through the preview app hash with publish context",
);
assert.equal(embeddedPublishBack.target, "_top", "embedded publish back-link targets the parent app");
const embeddedNext = linkWithText(embeddedFirstNav, "Next: Transcript glossary");
assert.equal(
  embeddedNext.href,
  "../preview/app.html#transcript-glossary",
  "embedded cleanup nav routes next cleanup steps through the preview app hash",
);
assert.equal(embeddedNext.target, "_top", "embedded cleanup next link targets the parent app");

const embeddedMiddleNav = renderNavFor("line-pickup-insert.html", "line-pickup-insert", true);
assert.equal(
  linkWithText(embeddedMiddleNav, "Previous: Accessibility & readability").href,
  "../preview/app.html#accessibility-readability-checks",
  "embedded cleanup nav routes previous cleanup steps through the preview app hash",
);
assert.equal(
  linkWithText(embeddedMiddleNav, "Next: Pronunciation & name review").href,
  "../preview/app.html#pronunciation-name-review",
  "embedded cleanup nav routes middle next steps through the preview app hash",
);

const embeddedPronunciationNav = renderNavFor("pronunciation-name-review.html", "pronunciation-name-review", true);
assert.equal(
  linkWithText(embeddedPronunciationNav, "Previous: Line pickup insert").href,
  "../preview/app.html#line-pickup-insert",
  "embedded cleanup nav routes pronunciation previous step through the preview app hash",
);
assert.equal(
  linkWithText(embeddedPronunciationNav, "Next: On-screen correction note").href,
  "../preview/app.html#on-screen-correction-note",
  "embedded cleanup nav routes pronunciation next step through the preview app hash",
);

const embeddedLastNav = renderNavFor("on-screen-correction-note.html", "on-screen-correction-note", true);
const embeddedHandoff = linkWithText(embeddedLastNav, "Continue: Contextual b-roll moments");
assert.equal(
  embeddedHandoff.href,
  "../preview/app.html#contextual-broll-moments?from=cleanup",
  "embedded cleanup nav routes the contextual visuals handoff through the preview app hash",
);
assert.equal(embeddedHandoff.target, "_top", "embedded cleanup handoff targets the parent app");

const cleanupContextNav = renderNavFor("transcript-glossary.html", "transcript-glossary", true, "?from=cleanup");
assert.equal(
  linkWithText(cleanupContextNav, "Preview app").href,
  "../preview/app.html#transcript-glossary?from=cleanup",
  "embedded cleanup nav preserves cleanup entry context on the current preview app link",
);

const styleContextNav = renderNavFor("transcript-glossary.html", "transcript-glossary", true, "?from=style");
assert.equal(
  linkWithText(styleContextNav, "Preview app").href,
  "../preview/app.html#transcript-glossary?from=style",
  "embedded cleanup nav preserves style entry context on the current preview app link",
);
assert.equal(
  linkWithText(cleanupContextNav, "Previous: Pause & cross-talk cleanup").href,
  "../preview/app.html#pause-crosstalk-cleanup?from=cleanup",
  "embedded cleanup nav preserves cleanup entry context on previous links",
);
assert.equal(
  linkWithText(cleanupContextNav, "Next: Transcript search").href,
  "../preview/app.html#transcript-search-navigation?from=cleanup",
  "embedded cleanup nav preserves cleanup entry context on next links",
);

const standaloneCleanupContext = renderNavFor("line-pickup-insert.html", "line-pickup-insert", false, "?from=cleanup");
assert.equal(
  linkWithText(standaloneCleanupContext, "Next: Pronunciation & name review").href,
  "pronunciation-name-review.html?from=cleanup",
  "standalone cleanup nav keeps cleanup entry context between cleanup screens",
);

const publishPathNav = renderNavFor("transcript-glossary.html", "transcript-glossary", false, "?path=publish&from=cleanup");
assert.equal(
  linkWithText(publishPathNav, "Previous: Pause & cross-talk cleanup").href,
  "pause-crosstalk-cleanup.html?from=cleanup&path=publish",
  "cleanup nav keeps cleanup context and publish path on previous links",
);
assert.equal(
  linkWithText(publishPathNav, "Next: Transcript search").href,
  "transcript-search-navigation.html?from=cleanup&path=publish",
  "cleanup nav keeps cleanup context and publish path on next links",
);

const publishPathHandoff = renderNavFor("on-screen-correction-note.html", "on-screen-correction-note", false, "?path=publish");
assert.equal(
  linkWithText(publishPathHandoff, "Continue: Contextual b-roll moments").href,
  "contextual-broll-moments.html?from=cleanup&path=publish",
  "cleanup nav merges publish path context onto the contextual visuals handoff",
);

function cleanupFlowContextFor(file, search) {
  const window = makeWindow("transcript-glossary.html", false, search);
  const sandbox = {
    document: { readyState: "loading", addEventListener() {} },
    window,
    URLSearchParams,
  };
  vm.runInNewContext(
    `${navScript}\nglobalThis.result = withCleanupFlowContext(${JSON.stringify(file)});`,
    sandbox,
  );
  return sandbox.result;
}

assert.equal(
  cleanupFlowContextFor("transcript-glossary.html?draft=terms#review", "?path=publish&from=cleanup"),
  "transcript-glossary.html?draft=terms&from=cleanup&path=publish#review",
  "cleanup nav merges cleanup flow context without dropping existing query flags or hash",
);

const standalonePronunciationLinks = renderNavFor(
  "pronunciation-name-review.html",
  "pronunciation-name-review",
  false,
  "?from=cleanup",
  [
    "transcript-glossary.html",
    "guest-profile-reuse.html",
    "#readiness",
    "https://example.com/transcript-glossary.html",
    "//cdn.example.com/transcript-glossary.html",
  ],
);
assert.equal(
  linkWithText(standalonePronunciationLinks, "transcript-glossary.html").href,
  "transcript-glossary.html?from=cleanup",
  "standalone cleanup nav keeps cleanup context on in-page cleanup links",
);
assert.equal(
  linkWithText(standalonePronunciationLinks, "guest-profile-reuse.html").href,
  "guest-profile-reuse.html",
  "cleanup nav leaves non-cleanup in-page links alone",
);
assert.equal(
  linkWithText(standalonePronunciationLinks, "#readiness").href,
  "#readiness",
  "cleanup nav leaves same-page anchors alone",
);
assert.equal(
  linkWithText(standalonePronunciationLinks, "https://example.com/transcript-glossary.html").href,
  "https://example.com/transcript-glossary.html",
  "cleanup nav leaves external links alone",
);
assert.equal(
  linkWithText(standalonePronunciationLinks, "//cdn.example.com/transcript-glossary.html").href,
  "//cdn.example.com/transcript-glossary.html",
  "cleanup nav leaves protocol-relative external links alone",
);

const embeddedPronunciationLinks = renderNavFor(
  "pronunciation-name-review.html",
  "pronunciation-name-review",
  true,
  "?from=cleanup",
  ["transcript-glossary.html"],
);
const embeddedGlossaryLink = linkWithText(embeddedPronunciationLinks, "transcript-glossary.html");
assert.equal(
  embeddedGlossaryLink.href,
  "../preview/app.html#transcript-glossary?from=cleanup",
  "embedded cleanup nav routes in-page cleanup links through the preview app",
);
assert.equal(embeddedGlossaryLink.target, "_top", "embedded in-page cleanup links target the parent app");

const dynamicPronunciationLinks = renderNavFor(
  "pronunciation-name-review.html",
  "pronunciation-name-review",
  true,
  "?path=publish&from=cleanup",
);
const dynamicGlossaryLink = appendStaticLink(
  dynamicPronunciationLinks[0],
  "transcript-glossary.html",
  "Apply in transcript glossary",
);
dynamicPronunciationLinks.listeners.click({ target: dynamicGlossaryLink });
assert.equal(
  dynamicGlossaryLink.href,
  "../preview/app.html#transcript-glossary?from=cleanup&path=publish",
  "embedded cleanup nav normalizes dynamically rendered cleanup links before navigation",
);
assert.equal(dynamicGlossaryLink.target, "_top", "dynamic embedded cleanup links target the parent app");

console.log("cleanup nav: audio & caption cleanup screens connected into one path");
