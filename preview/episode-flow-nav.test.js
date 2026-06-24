"use strict";

// Guards core episode flow prototype navigation (#581 / #583 / #584).
// Run with: `node preview/episode-flow-nav.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const root = path.join(__dirname, "..");
const navScript = fs.readFileSync(path.join(__dirname, "episode-flow-nav.js"), "utf8");

new vm.Script(navScript);
assert.ok(navScript.includes("../preview/index.html"), "episode flow nav links back to the episode flow home");
assert.ok(navScript.includes("episode-flow.html"), "episode flow nav links to the guided episode flow");
assert.ok(navScript.includes('app.textContent = "Preview app"'), "episode flow nav exposes a preview app link");
assert.ok(navScript.includes("episode-watch-through-preview.html"), "episode flow nav hands off to publish prep");
assert.ok(navScript.includes('document.querySelector(".episode-flow-nav")'), "episode flow nav guards against double render");
assert.ok(!/innerHTML/.test(navScript), "episode flow nav builds the DOM without innerHTML");

const episodeScreens = [
  "source-media-health.html",
  "speaker-sync-repair.html",
  "audio-cleanup-controls.html",
  "audio-caption-quality-review.html",
  "export-readiness-review.html",
];

for (const file of episodeScreens) {
  const html = fs.readFileSync(path.join(root, "prototype", file), "utf8");
  assert.ok(html.includes("../preview/episode-flow-nav.js"), `${file} loads episode flow navigation`);
  assert.ok(!html.includes("../preview/tools-nav.js"), `${file} uses episode flow nav instead of tools nav`);
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

function renderNavFor(fileName, embedded = false, search = "") {
  const head = createElement("head");
  const body = createElement("body");
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
    addEventListener() {},
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

const firstNav = renderNavFor("source-media-health.html");
const previewApp = linkWithText(firstNav, "Preview app");
assert.equal(
  previewApp.href,
  "../preview/app.html#source-media-health",
  "episode flow nav opens the current screen in the unified preview app",
);
assert.ok(
  linkWithText(firstNav, "Previous: Speaker roles"),
  "first episode flow screen links back to speaker roles",
);
assert.ok(
  linkWithText(firstNav, "Next: Speaker sync repair"),
  "first episode flow screen renders the next episode step",
);

const lastNav = renderNavFor("export-readiness-review.html");
const publishHandoff = linkWithText(lastNav, "Continue: Watch-through preview");
assert.equal(
  publishHandoff.href,
  "episode-watch-through-preview.html?path=publish",
  "last episode flow screen hands off to watch-through preview in the publish path context",
);

const embeddedFirstNav = renderNavFor("source-media-health.html", true);
const embeddedPreviewApp = linkWithText(embeddedFirstNav, "Preview app");
assert.equal(
  embeddedPreviewApp.href,
  "../preview/app.html#source-media-health",
  "embedded episode flow nav keeps the current screen in the preview app href",
);
assert.equal(embeddedPreviewApp.target, "_top", "embedded preview app link targets the parent app");
const embeddedHome = linkWithText(embeddedFirstNav, "Episode flow home");
assert.equal(embeddedHome.target, "_top", "embedded episode flow home targets the parent app");
const embeddedPrevious = linkWithText(embeddedFirstNav, "Previous: Speaker roles");
assert.equal(
  embeddedPrevious.href,
  "../preview/app.html#speaker-role-mapping?path=episode",
  "embedded episode flow nav routes previous steps through the preview app hash with episode context",
);
assert.equal(embeddedPrevious.target, "_top", "embedded previous link targets the parent app");

const embeddedLastNav = renderNavFor("export-readiness-review.html", true);
const embeddedHandoff = linkWithText(embeddedLastNav, "Continue: Watch-through preview");
assert.equal(
  embeddedHandoff.href,
  "../preview/app.html#episode-watch-through-preview?path=publish",
  "embedded episode flow nav routes publish prep handoff through the preview app hash with publish context",
);
assert.equal(embeddedHandoff.target, "_top", "embedded publish prep handoff targets the parent app");

const episodePathNav = renderNavFor("speaker-sync-repair.html", true, "?path=episode");
assert.equal(
  linkWithText(episodePathNav, "Preview app").href,
  "../preview/app.html#speaker-sync-repair?path=episode",
  "embedded episode flow nav preserves episode path context on the current preview app link",
);
assert.equal(
  linkWithText(episodePathNav, "Previous: Source media health").href,
  "../preview/app.html#source-media-health?path=episode",
  "embedded episode flow nav preserves episode path context on previous links",
);
assert.equal(
  linkWithText(episodePathNav, "Next: Audio cleanup").href,
  "../preview/app.html#audio-cleanup-controls?path=episode",
  "embedded episode flow nav preserves episode path context on next links",
);

const standaloneEpisodePath = renderNavFor("audio-cleanup-controls.html", false, "?path=episode");
assert.equal(
  linkWithText(standaloneEpisodePath, "Next: Caption quality review").href,
  "audio-caption-quality-review.html?path=episode",
  "standalone episode flow nav keeps episode path context between core flow screens",
);


function episodeFlowHrefWithPath(file, search) {
  const window = makeWindow("export-readiness-review.html", false, search);
  const sandbox = {
    document: { readyState: "loading", addEventListener() {} },
    window,
    URLSearchParams,
  };
  vm.runInNewContext(
    `${navScript}\nglobalThis.result = hrefWithPath(${JSON.stringify(file)});`,
    sandbox,
  );
  return sandbox.result;
}

assert.equal(
  episodeFlowHrefWithPath("audio-caption-quality-review.html?path=ingest&draft=notes", "?path=episode"),
  "audio-caption-quality-review.html?path=episode&draft=notes",
  "episode flow nav replaces conflicting path values with the shell episode context",
);
assert.equal(
  episodeFlowHrefWithPath("export-readiness-review.html?draft=final#checks", "?path=publish"),
  "export-readiness-review.html?draft=final&path=publish#checks",
  "episode flow nav preserves unrelated flags and hash segments when merging publish context",
);

function normalizeExportReadinessFixLink(href, search, embedded = false) {
  const window = makeWindow("export-readiness-review.html", embedded, search);
  const link = createElement("a");
  link.className = "fix-link";
  link.setAttribute("href", href);
  link.getAttribute = function(name) {
    return this.attributes[name];
  };
  const root = createElement("div");
  root.querySelectorAll = function(selector) {
    return selector === "a.fix-link[href]" ? [link] : [];
  };
  const navDefinitions = navScript.replace(/\nif \(document\.readyState[\s\S]*$/m, "");
  vm.runInNewContext(
    `${navDefinitions}\nnormalizeExportReadinessFixLinks(rootNode);`,
    {
      document: { readyState: "complete", addEventListener() {} },
      window,
      URLSearchParams,
      rootNode: root,
    },
  );
  return link;
}

assert.equal(
  normalizeExportReadinessFixLink("music-cue-setup.html", "?path=episode").href,
  "music-cue-setup.html?path=episode",
  "export readiness music cue fix links keep episode path context",
);
assert.equal(
  normalizeExportReadinessFixLink("thumbnail-cover-frame.html", "?path=episode").href,
  "thumbnail-cover-frame.html?path=publish",
  "export readiness thumbnail fix links use publish path context",
);
assert.equal(
  normalizeExportReadinessFixLink("music-cue-setup.html", "?path=episode", true).href,
  "../preview/app.html#music-cue-setup?path=episode",
  "embedded export readiness fix links route through the preview app",
);
assert.equal(
  normalizeExportReadinessFixLink("music-cue-setup.html", "?path=episode", true).target,
  "_top",
  "embedded export readiness fix links target the parent app",
);

function createLink(href) {
  const link = createElement("a");
  link.href = href;
  link.setAttribute("href", href);
  link.getAttribute = function(name) {
    if (name === "href") return this.href;
    return this.attributes[name];
  };
  return link;
}

function normalizeEpisodeHrefFor(href, fileName = "speaker-sync-repair.html", search = "", embedded = false) {
  const link = createLink(href);
  const rootNode = {
    querySelectorAll(selector) {
      return selector === "a[href]" ? [link] : [];
    },
  };
  const window = makeWindow(fileName, embedded, search);
  const navDefinitions = navScript.replace(/\nif \(document\.readyState[\s\S]*$/m, "");
  const sandbox = {
    document: { readyState: "complete", addEventListener() {} },
    window,
    URLSearchParams,
    rootNode,
  };
  vm.runInNewContext(
    `${navDefinitions}\nnormalizeEpisodeScreenLinks(rootNode);\nglobalThis.result = { href: rootNode.querySelectorAll("a[href]")[0].href, target: rootNode.querySelectorAll("a[href]")[0].target };`,
    sandbox,
  );
  return sandbox.result;
}

function normalizeEpisodeClickFor(href, fileName = "speaker-sync-repair.html", search = "", embedded = false) {
  const link = createLink(href);
  link.closest = (selector) => (selector === "a[href]" ? link : null);
  const window = makeWindow(fileName, embedded, search);
  const navDefinitions = navScript.replace(/\nif \(document\.readyState[\s\S]*$/m, "");
  const sandbox = {
    document: { readyState: "complete", addEventListener() {} },
    window,
    URLSearchParams,
    link,
  };
  vm.runInNewContext(
    `${navDefinitions}\nnormalizeEpisodeLinkClick({ target: link });\nglobalThis.result = { href: link.href, target: link.target };`,
    sandbox,
  );
  return sandbox.result;
}

assert.equal(
  normalizeEpisodeHrefFor("speaker-attribution-review.html", "speaker-sync-repair.html", "?path=episode").href,
  "speaker-attribution-review.html?path=episode",
  "episode flow nav keeps episode path context on sync-to-attribution handoffs",
);
assert.equal(
  normalizeEpisodeHrefFor("speaker-attribution-review.html", "speaker-sync-repair.html", "?path=episode", true).href,
  "../preview/app.html#speaker-attribution-review?path=episode",
  "embedded episode flow nav routes sync-to-attribution handoffs through the preview app",
);
assert.equal(
  normalizeEpisodeHrefFor("speaker-attribution-review.html", "speaker-sync-repair.html", "?path=episode", true).target,
  "_top",
  "embedded sync-to-attribution handoffs target the parent app",
);
assert.equal(
  normalizeEpisodeClickFor("speaker-attribution-review.html", "speaker-sync-repair.html", "?path=episode", true).href,
  "../preview/app.html#speaker-attribution-review?path=episode",
  "embedded episode flow nav normalizes dynamic attribution handoffs before navigation",
);

console.log("episode flow nav: core episode screens connected to the preview shell and app");
