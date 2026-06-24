"use strict";

// Guards publish prep prototype navigation (#583 / #584).
// Run with: `node preview/publish-nav.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const root = path.join(__dirname, "..");
const navScript = fs.readFileSync(path.join(__dirname, "publish-nav.js"), "utf8");

new vm.Script(navScript);
assert.ok(navScript.includes('home.href = "../preview/"'), "publish nav links back to the preview shell");
assert.ok(navScript.includes("episode-flow.html"), "publish nav links to the guided episode flow");
assert.ok(navScript.includes('app.textContent = "Preview app"'), "publish nav exposes a preview app link");
assert.ok(navScript.includes("show-notes-assembly.html"), "publish nav includes show notes assembly");
assert.ok(navScript.includes('document.querySelector(".publish-nav")'), "publish nav guards against double render");
assert.ok(!/innerHTML/.test(navScript), "publish nav builds the DOM without innerHTML");

const publishScreens = [
  "episode-watch-through-preview.html",
  "destination-crop-preview.html",
  "thumbnail-cover-frame.html",
  "show-notes-assembly.html",
  "episode-metadata-publishing.html",
  "export-package-handoff.html",
  "clip-candidate-review.html",
  "client-review-copy-flow.html",
  "publish-checklist.html",
];

for (const file of publishScreens) {
  const html = fs.readFileSync(path.join(root, "prototype", file), "utf8");
  assert.ok(html.includes("../preview/publish-nav.js"), `${file} loads publish navigation`);
  assert.ok(!html.includes("../preview/tools-nav.js"), `${file} uses publish nav instead of tools nav`);
  assert.ok(html.includes("data-publish-step="), `${file} declares its publish step`);
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
    getAttribute(name) {
      return this.attributes[name] || "";
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

function renderNavFor(fileName, embedded = false, search = "", staticHrefs = []) {
  const head = createElement("head");
  const body = createElement("body");
  body.dataset = {};
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
    addEventListener() {},
  };

  vm.runInNewContext(navScript, {
    document,
    window: makeWindow(fileName, embedded, search),
    URLSearchParams,
  });

  return flatten(body);
}

function publishNavApi(fileName, search = "") {
  const context = {
    document: {
      readyState: "complete",
      body: { dataset: {} },
      createElement,
      getElementById() {
        return createElement("style");
      },
      querySelector() {
        return createElement("div");
      },
    },
    window: makeWindow(fileName, false, search),
    URLSearchParams,
  };
  vm.runInNewContext(navScript, context);
  return context;
}

function linkWithText(nodes, text) {
  return nodes.find((node) => node.tagName === "a" && node.textContent === text);
}

function normalizePublishClickFor(href, search = "", embedded = false) {
  const link = createElement("a");
  link.href = href;
  link.attributes.href = href;
  link.closest = (selector) => (selector === "a[href]" ? link : null);
  const sandbox = {
    document: { readyState: "loading", addEventListener() {} },
    window: makeWindow("episode-metadata-publishing.html", embedded, search),
    URLSearchParams,
    link,
  };
  vm.runInNewContext(
    `${navScript}\nnormalizePublishLinkClick({ target: link });\nglobalThis.result = { href: link.href, target: link.target };`,
    sandbox,
  );
  return sandbox.result;
}

const firstNav = renderNavFor("episode-watch-through-preview.html");
const exportBackLink = linkWithText(firstNav, "Previous: Export readiness");
assert.ok(exportBackLink, "first publish screen renders export readiness as its previous step");
assert.equal(
  exportBackLink.href,
  "export-readiness-review.html",
  "first publish screen previous link returns to export readiness",
);

const middleNav = renderNavFor("destination-crop-preview.html");
assert.ok(
  linkWithText(middleNav, "Previous: Watch-through preview"),
  "middle publish screen renders the previous publish step",
);
assert.ok(
  !linkWithText(middleNav, "Previous: Export readiness"),
  "middle publish screen does not reuse the export readiness back link",
);

// VM-render the forward path the same way ingest-nav does (#676): prev AND next,
// the finish handoff, and the visible step label — not just the previous link.
assert.ok(
  linkWithText(firstNav, "Next: Destination crop preview"),
  "first publish screen renders the next publish step",
);
const firstStep = firstNav.find(
  (node) => node.textContent === "Publish step 1 of 9 · Watch-through preview",
);
assert.ok(firstStep, "first publish screen renders its visible step label");
assert.equal(firstStep.attributes["aria-current"], "step", "current publish step exposes aria-current");

assert.ok(
  linkWithText(middleNav, "Next: Thumbnail cover frame"),
  "middle publish screen renders the next publish step",
);

const lastNav = renderNavFor("publish-checklist.html");
assert.ok(
  linkWithText(lastNav, "Previous: Client review copy"),
  "last publish screen renders the previous publish step",
);
const finish = linkWithText(lastNav, "Finish: back to the preview shell");
assert.ok(finish, "last publish screen renders the finish handoff");
assert.equal(finish.href, "../preview/", "finish handoff returns to the preview shell");
assert.ok(
  !lastNav.some((node) => node.textContent && node.textContent.startsWith("Next:")),
  "last publish screen does not render a next link",
);

const embeddedFirstNav = renderNavFor("episode-watch-through-preview.html", true);
const embeddedPreviewApp = linkWithText(embeddedFirstNav, "Preview app");
assert.equal(
  embeddedPreviewApp.href,
  "../preview/app.html#episode-watch-through-preview",
  "embedded publish nav opens the current screen in the preview app",
);
assert.equal(embeddedPreviewApp.target, "_top", "embedded preview app link targets the parent app");
const embeddedBackLink = linkWithText(embeddedFirstNav, "Previous: Export readiness");
assert.equal(
  embeddedBackLink.href,
  "../preview/app.html#export-readiness-review",
  "embedded publish nav routes previous through the preview app hash",
);
assert.equal(embeddedBackLink.target, "_top", "embedded previous link targets the parent app");
const embeddedNextLink = linkWithText(embeddedFirstNav, "Next: Destination crop preview");
assert.equal(
  embeddedNextLink.href,
  "../preview/app.html#destination-crop-preview",
  "embedded publish nav routes next through the preview app hash",
);
assert.equal(embeddedNextLink.target, "_top", "embedded next link targets the parent app");

const embeddedLastNav = renderNavFor("publish-checklist.html", true);
const embeddedFinish = linkWithText(embeddedLastNav, "Finish: back to the preview shell");
assert.equal(embeddedFinish.href, "../preview/", "embedded finish still returns to the preview shell");
assert.equal(embeddedFinish.target, "_top", "embedded finish opens the preview shell at top level");

const publishPathNav = renderNavFor("destination-crop-preview.html", true, "?path=publish");
assert.equal(
  linkWithText(publishPathNav, "Preview app").href,
  "../preview/app.html#destination-crop-preview?path=publish",
  "embedded publish nav preserves publish context on the current preview app link",
);
const publishPathPrevious = linkWithText(publishPathNav, "Previous: Watch-through preview");
assert.equal(
  publishPathPrevious.href,
  "../preview/app.html#episode-watch-through-preview?path=publish",
  "embedded publish nav preserves publish path context on previous links",
);
const publishPathNext = linkWithText(publishPathNav, "Next: Thumbnail cover frame");
assert.equal(
  publishPathNext.href,
  "../preview/app.html#thumbnail-cover-frame?path=publish",
  "embedded publish nav preserves publish path context on next links",
);

const standalonePublishPath = renderNavFor("show-notes-assembly.html", false, "?path=publish");
const standaloneNext = linkWithText(standalonePublishPath, "Next: Episode metadata publishing");
assert.equal(
  standaloneNext.href,
  "episode-metadata-publishing.html?path=publish",
  "standalone publish nav keeps publish path context between publish prep screens",
);
const standaloneMetadataLinks = renderNavFor(
  "episode-metadata-publishing.html",
  false,
  "?path=publish",
  ["publish-checklist.html", "show-notes-assembly.html", "#readiness", "https://example.com/publish", "//cdn.example.com/publish-checklist.html"],
);
assert.equal(
  linkWithText(standaloneMetadataLinks, "publish-checklist.html").href,
  "publish-checklist.html?path=publish",
  "standalone publish nav keeps publish context on in-page publish links",
);
assert.equal(
  linkWithText(standaloneMetadataLinks, "show-notes-assembly.html").href,
  "show-notes-assembly.html?path=publish",
  "standalone publish nav keeps publish context on in-page backward publish links",
);
assert.equal(
  linkWithText(standaloneMetadataLinks, "#readiness").href,
  "#readiness",
  "publish nav leaves same-page anchors alone",
);
assert.equal(
  linkWithText(standaloneMetadataLinks, "https://example.com/publish").href,
  "https://example.com/publish",
  "publish nav leaves external links alone",
);
assert.equal(
  linkWithText(standaloneMetadataLinks, "//cdn.example.com/publish-checklist.html").href,
  "//cdn.example.com/publish-checklist.html",
  "publish nav leaves protocol-relative external links alone",
);

const publishApi = publishNavApi("show-notes-assembly.html", "?path=publish");
assert.equal(
  publishApi.hrefWithPath("episode-metadata-publishing.html?draft=notes"),
  "episode-metadata-publishing.html?draft=notes&path=publish",
  "standalone publish nav preserves existing file query while appending publish context",
);
assert.equal(
  publishApi.hrefWithPath("episode-metadata-publishing.html?draft=notes#details"),
  "episode-metadata-publishing.html?draft=notes&path=publish#details",
  "standalone publish nav preserves hash fragments while appending publish context",
);
assert.equal(
  publishApi.hrefWithPath("episode-metadata-publishing.html?path=episode&draft=notes"),
  "episode-metadata-publishing.html?path=publish&draft=notes",
  "publish nav replaces conflicting path values with the shell publish context",
);
assert.equal(
  (publishApi.hrefWithPath("show-notes-assembly.html?path=episode").match(/path=/g) || []).length,
  1,
  "publish nav emits one canonical path query param after merge",
);

const embeddedExplicitPublishPath = renderNavFor(
  "episode-watch-through-preview.html",
  true,
  "?draft=notes&path=publish",
);
assert.equal(
  linkWithText(embeddedExplicitPublishPath, "Next: Destination crop preview").href,
  "../preview/app.html#destination-crop-preview?path=publish",
  "embedded publish nav reads publish context with URLSearchParams instead of positional parsing",
);
const embeddedMetadataLinks = renderNavFor(
  "episode-metadata-publishing.html",
  true,
  "?path=publish",
  ["publish-checklist.html", "show-notes-assembly.html"],
);
const embeddedChecklistLink = linkWithText(embeddedMetadataLinks, "publish-checklist.html");
assert.equal(
  embeddedChecklistLink.href,
  "../preview/app.html#publish-checklist?path=publish",
  "embedded publish nav routes in-page publish links through the preview app with publish context",
);
assert.equal(embeddedChecklistLink.target, "_top", "embedded in-page publish links target the parent app");
assert.equal(
  linkWithText(embeddedMetadataLinks, "show-notes-assembly.html").href,
  "../preview/app.html#show-notes-assembly?path=publish",
  "embedded publish nav routes in-page backward publish links through the preview app with publish context",
);

const dynamicChecklistLink = normalizePublishClickFor("publish-checklist.html", "?path=publish", true);
assert.equal(
  dynamicChecklistLink.href,
  "../preview/app.html#publish-checklist?path=publish",
  "embedded publish nav normalizes dynamically rendered publish links before navigation",
);
assert.equal(dynamicChecklistLink.target, "_top", "dynamic embedded publish links target the parent app");

const dynamicStandaloneLink = normalizePublishClickFor("show-notes-assembly.html", "?path=publish");
assert.equal(
  dynamicStandaloneLink.href,
  "show-notes-assembly.html?path=publish",
  "standalone publish nav preserves publish context on dynamically rendered publish links",
);

const dynamicExternalLink = normalizePublishClickFor("https://example.com/publish", "?path=publish", true);
assert.equal(
  dynamicExternalLink.href,
  "https://example.com/publish",
  "publish nav leaves dynamic external links unchanged",
);
assert.equal(dynamicExternalLink.target, "", "publish nav does not retarget dynamic external links");

const clipReviewLinks = renderNavFor(
  "clip-candidate-review.html",
  false,
  "?path=publish",
  ["export-package-handoff.html", "destination-crop-preview.html", "transcript-search-navigation.html"],
);
assert.equal(
  linkWithText(clipReviewLinks, "export-package-handoff.html").href,
  "export-package-handoff.html?path=publish",
  "publish nav keeps publish context on clip review export handoffs",
);
assert.equal(
  linkWithText(clipReviewLinks, "destination-crop-preview.html").href,
  "destination-crop-preview.html?path=publish",
  "publish nav keeps publish context on clip review crop handoffs",
);
const transcriptParams = new URLSearchParams(
  linkWithText(clipReviewLinks, "transcript-search-navigation.html").href.split("?")[1] || "",
);
assert.equal(transcriptParams.get("from"), "cleanup", "clip review transcript handoff keeps cleanup entry context");
assert.equal(transcriptParams.get("path"), "publish", "clip review transcript handoff keeps publish path context");

const embeddedClipLinks = renderNavFor(
  "clip-candidate-review.html",
  true,
  "?path=publish",
  ["transcript-search-navigation.html"],
);
const embeddedTranscriptLink = linkWithText(embeddedClipLinks, "transcript-search-navigation.html");
assert.equal(
  embeddedTranscriptLink.href,
  "../preview/app.html#transcript-search-navigation?from=cleanup&path=publish",
  "embedded publish nav routes clip review transcript handoffs through the preview app",
);
assert.equal(embeddedTranscriptLink.target, "_top", "embedded transcript handoff links target the parent app");

const dynamicTranscriptLink = normalizePublishClickFor(
  "transcript-search-navigation.html",
  "?path=publish",
  true,
);
assert.equal(
  dynamicTranscriptLink.href,
  "../preview/app.html#transcript-search-navigation?from=cleanup&path=publish",
  "embedded publish nav normalizes dynamic clip review transcript handoffs before navigation",
);

// Other cross-stage fix hand-offs from publish-prep screens (the publish checklist's
// readiness fixes, metadata's chapter/social links, the export package's framing
// owners) route the same way: publish context standalone, through the app embedded.
const checklistFixLinks = renderNavFor(
  "publish-checklist.html",
  false,
  "?path=publish",
  ["audio-caption-quality-review.html", "source-media-health.html", "episode-chapter-markers.html"],
);
assert.equal(
  linkWithText(checklistFixLinks, "audio-caption-quality-review.html").href,
  "audio-caption-quality-review.html?path=publish",
  "publish nav keeps publish context on checklist caption fix hand-offs",
);
assert.equal(
  linkWithText(checklistFixLinks, "source-media-health.html").href,
  "source-media-health.html?path=publish",
  "publish nav keeps publish context on checklist source media fix hand-offs",
);

const embeddedChecklistFixLinks = renderNavFor(
  "publish-checklist.html",
  true,
  "?path=publish",
  ["audio-caption-quality-review.html", "episode-chapter-markers.html"],
);
const embeddedCaptionFix = linkWithText(embeddedChecklistFixLinks, "audio-caption-quality-review.html");
assert.equal(
  embeddedCaptionFix.href,
  "../preview/app.html#audio-caption-quality-review?path=publish",
  "embedded publish nav routes checklist caption fix hand-offs through the preview app",
);
assert.equal(embeddedCaptionFix.target, "_top", "embedded cross-stage fix hand-offs target the parent app");
assert.equal(
  linkWithText(embeddedChecklistFixLinks, "episode-chapter-markers.html").href,
  "../preview/app.html#episode-chapter-markers?path=publish",
  "embedded publish nav routes checklist chapter fix hand-offs through the preview app",
);

const embeddedMetadataSocial = renderNavFor(
  "episode-metadata-publishing.html",
  true,
  "?path=publish",
  ["social-context-intake.html"],
);
assert.equal(
  linkWithText(embeddedMetadataSocial, "social-context-intake.html").href,
  "../preview/app.html#social-context-intake?path=publish",
  "embedded publish nav routes metadata social-context hand-offs through the preview app",
);

const dynamicCrossStageFix = normalizePublishClickFor("speaker-framing-safety.html", "?path=publish", true);
assert.equal(
  dynamicCrossStageFix.href,
  "../preview/app.html#speaker-framing-safety?path=publish",
  "embedded publish nav normalizes dynamic cross-stage fix hand-offs before navigation",
);
assert.equal(dynamicCrossStageFix.target, "_top", "dynamic embedded cross-stage fix hand-offs target the parent app");

// Rendering twice must still leave a single nav (matches the script's guard).
const head = createElement("head");
const body = createElement("body");
body.dataset = {};
const ctx = {
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
const win = makeWindow("destination-crop-preview.html");
vm.runInNewContext(navScript, { document: ctx, window: win, URLSearchParams });
vm.runInNewContext(navScript, { document: ctx, window: win, URLSearchParams });
assert.equal(
  flatten(body).filter((node) => node.className === "publish-nav").length,
  1,
  "publish nav renders once if the script runs twice",
);

console.log("publish nav: publish prep screens connected with prev/next, finish, and step labels");
