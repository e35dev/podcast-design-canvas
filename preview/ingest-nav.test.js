"use strict";

// Smoke tests for ingest prototype navigation (#582 / #584).
// Run with: `node preview/ingest-nav.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const root = path.join(__dirname, "..");
const navPath = path.join(__dirname, "ingest-nav.js");
const navSource = fs.readFileSync(navPath, "utf8");

new vm.Script(navSource);
assert.ok(navSource.includes('home.href = "../preview/"'), "ingest nav links back to the preview shell");
assert.ok(navSource.includes("episode-flow.html"), "ingest nav links to the guided episode flow");
assert.ok(navSource.includes("app.html"), "ingest nav links to the preview app");
assert.ok(navSource.includes("isEmbeddedInPreviewApp"), "ingest nav routes through the preview app when embedded");
assert.ok(navSource.includes("source-media-health.html"), "ingest nav hands off to source media health");
assert.ok(navSource.includes("layout-first.html"), "ingest nav links to layout-first video placement");
assert.ok(navSource.includes("layoutFirstPlacementSearch"), "ingest nav builds layout-first placement query with URLSearchParams");
assert.ok(navSource.includes("Place videos in layout"), "ingest nav offers layout-first placement on speaker roles");
assert.ok(navSource.includes('document.querySelector(".ingest-nav")'), "ingest nav guards against double render");
assert.ok(!/innerHTML/.test(navSource), "ingest nav builds the DOM without innerHTML");

const ingestScreens = [
  "episode-setup-intake.html",
  "episode-readiness.html",
  "speaker-role-mapping.html",
  "social-context-intake.html",
];

const forbidden = [
  /which surface owns/i,
  /owning surface/i,
  /opens the surface/i,
  /surface that owns/i,
  /\bpipeline\b/i,
];

for (const file of ingestScreens) {
  const html = fs.readFileSync(path.join(root, "prototype", file), "utf8");
  assert.ok(html.includes("../preview/ingest-nav.js"), `${file} loads ingest navigation`);
  assert.ok(!html.includes("../preview/tools-nav.js"), `${file} uses ingest nav instead of tools nav`);
  assert.ok(html.includes("data-ingest-step="), `${file} declares its ingest step`);

  for (const pattern of forbidden) {
    const match = html.match(pattern);
    assert.ok(!match, `${file} must not include internal copy: ${match && match[0]}`);
  }
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
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    insertBefore(child, before) {
      const index = this.children.indexOf(before);
      if (index === -1) {
        this.children.unshift(child);
      } else {
        this.children.splice(index, 0, child);
      }
      return child;
    },
  };
}

function flatten(node) {
  return [node, ...node.children.flatMap(flatten)];
}

function linkWithText(nodes, text) {
  const link = nodes.find((node) => node.tagName === "a" && node.textContent === text);
  assert.ok(link, `expected ingest nav link: ${text}`);
  return link;
}

function makeWindow(fileName, search = "", embedded = false) {
  const window = { location: { pathname: `/prototype/${fileName}`, search } };
  window.self = window;
  window.top = embedded ? { location: { pathname: "/preview/app.html" } } : window;
  return window;
}

function renderNavFor(fileName, ingestStep, search = "", embedded = false) {
  const head = createElement("head");
  const body = createElement("body");
  if (ingestStep) {
    body.dataset = { ingestStep };
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
      return (
        [...flatten(head), ...flatten(body)].find((node) =>
          node.className.split(" ").includes(className),
        ) || null
      );
    },
    addEventListener() {},
  };

  vm.runInNewContext(navSource, {
    document,
    window: makeWindow(fileName, search, embedded),
    URLSearchParams,
  });

  return { head, body, nodes: flatten(body) };
}

function routeSearchFor(file, search = "") {
  const window = makeWindow("episode-readiness.html", search);
  const sandbox = {
    document: { readyState: "loading", addEventListener() {} },
    window,
    URLSearchParams,
  };
  window.self = window;
  window.top = window;
  vm.runInNewContext(
    `${navSource}\nglobalThis.result = routeSearchFromFile(${JSON.stringify(file)});`,
    sandbox,
  );
  return sandbox.result;
}

function hrefWithPathFor(file, search = "") {
  const window = makeWindow("episode-readiness.html", search);
  const sandbox = {
    document: { readyState: "loading", addEventListener() {} },
    window,
    URLSearchParams,
  };
  window.self = window;
  window.top = window;
  vm.runInNewContext(
    `${navSource}\nglobalThis.result = hrefWithPath(${JSON.stringify(file)});`,
    sandbox,
  );
  return sandbox.result;
}

function normalizeIngestHrefFor(href, search = "", embedded = false) {
  const link = createElement("a");
  link.href = href;
  const rootNode = {
    querySelectorAll(selector) {
      return selector === "a[href]" ? [link] : [];
    },
  };
  const sandbox = {
    document: { readyState: "loading", addEventListener() {} },
    window: makeWindow("episode-readiness.html", search, embedded),
    URLSearchParams,
    rootNode,
  };
  vm.runInNewContext(
    `${navSource}\nnormalizeIngestScreenLinks(rootNode);\nglobalThis.result = { href: rootNode.querySelectorAll("a[href]")[0].href, target: rootNode.querySelectorAll("a[href]")[0].target };`,
    sandbox,
  );
  return sandbox.result;
}

function normalizeIngestClickFor(href, search = "", embedded = false) {
  const link = createElement("a");
  link.href = href;
  link.closest = (selector) => (selector === "a[href]" ? link : null);
  const sandbox = {
    document: { readyState: "loading", addEventListener() {} },
    window: makeWindow("episode-readiness.html", search, embedded),
    URLSearchParams,
    link,
  };
  vm.runInNewContext(
    `${navSource}\nnormalizeIngestLinkClick({ target: link });\nglobalThis.result = { href: link.href, target: link.target };`,
    sandbox,
  );
  return sandbox.result;
}

assert.equal(
  routeSearchFor("speaker-role-mapping.html?draft=roles&path=ingest"),
  "?path=ingest",
  "ingest nav preserves ingest path when extra query params are present",
);
assert.equal(
  hrefWithPathFor("social-context-intake.html?draft=links", "?path=ingest"),
  "social-context-intake.html?draft=links&path=ingest",
  "ingest nav appends ingest path without dropping existing query params",
);
assert.equal(
  hrefWithPathFor("social-context-intake.html?path=ingest", "?path=ingest"),
  "social-context-intake.html?path=ingest",
  "ingest nav does not duplicate ingest path query params",
);
assert.equal(
  hrefWithPathFor("speaker-role-mapping.html?path=episode&draft=roles", "?path=ingest"),
  "speaker-role-mapping.html?path=ingest&draft=roles",
  "ingest nav replaces conflicting path values with the shell ingest context",
);
assert.equal(
  hrefWithPathFor("social-context-intake.html?draft=links#review", "?path=ingest"),
  "social-context-intake.html?draft=links&path=ingest#review",
  "ingest nav preserves unrelated flags and hash segments when merging path context",
);
assert.equal(
  (hrefWithPathFor("speaker-role-mapping.html?path=episode", "?path=ingest").match(/path=/g) || []).length,
  1,
  "ingest nav emits a single canonical path query param",
);

const standaloneRoleLink = normalizeIngestHrefFor("speaker-role-mapping.html", "?path=ingest");
assert.equal(
  standaloneRoleLink.href,
  "speaker-role-mapping.html?path=ingest",
  "ingest nav preserves ingest context on in-page role mapping links",
);
assert.equal(standaloneRoleLink.target, "", "standalone ingest links do not force a top target");

const embeddedRoleLink = normalizeIngestHrefFor("speaker-role-mapping.html", "?path=ingest", true);
assert.equal(
  embeddedRoleLink.href,
  "../preview/app.html#speaker-role-mapping?path=ingest",
  "embedded ingest nav routes in-page role mapping links through the preview app",
);
assert.equal(embeddedRoleLink.target, "_top", "embedded in-page ingest links target the parent app");

const embeddedSourceMediaLink = normalizeIngestHrefFor("source-media-health.html", "?path=ingest", true);
assert.equal(
  embeddedSourceMediaLink.href,
  "../preview/app.html#source-media-health?path=episode",
  "embedded ingest nav routes in-page source media links through the episode handoff context",
);
assert.equal(embeddedSourceMediaLink.target, "_top", "embedded source media handoff links target the parent app");

const standaloneSyncRepairLink = normalizeIngestHrefFor("speaker-sync-repair.html", "?path=ingest");
assert.equal(
  standaloneSyncRepairLink.href,
  "speaker-sync-repair.html?path=episode",
  "ingest nav keeps episode handoff context on readiness-to-sync links",
);

const syncRepairLink = normalizeIngestHrefFor("speaker-sync-repair.html", "?path=ingest", true);
assert.equal(
  syncRepairLink.href,
  "../preview/app.html#speaker-sync-repair?path=episode",
  "embedded ingest nav routes readiness-to-sync handoffs through the preview app",
);
assert.equal(syncRepairLink.target, "_top", "embedded sync repair handoff links target the parent app");

const dynamicSyncRepairLink = normalizeIngestClickFor("speaker-sync-repair.html", "?path=ingest", true);
assert.equal(
  dynamicSyncRepairLink.href,
  "../preview/app.html#speaker-sync-repair?path=episode",
  "embedded ingest nav normalizes dynamic sync repair handoffs before navigation",
);
assert.equal(dynamicSyncRepairLink.target, "_top", "dynamic embedded sync repair handoffs target the parent app");

const dynamicSocialLink = normalizeIngestClickFor("social-context-intake.html", "?path=ingest", true);
assert.equal(
  dynamicSocialLink.href,
  "../preview/app.html#social-context-intake?path=ingest",
  "ingest nav normalizes dynamically rendered ingest links before navigation",
);
assert.equal(dynamicSocialLink.target, "_top", "dynamic embedded ingest links target the parent app");

const firstNav = renderNavFor("episode-setup-intake.html", "episode-setup-intake");
assert.ok(firstNav.nodes.some((node) => node.className === "ingest-nav"), "ingest nav renders on first screen");
assert.ok(
  !firstNav.nodes.some((node) => node.textContent === "Place videos in layout"),
  "first ingest screen does not offer layout-first placement before roles are mapped",
);
assert.ok(
  !firstNav.nodes.some((node) => node.textContent && node.textContent.startsWith("Previous:")),
  "first ingest screen does not render a previous link",
);
assert.ok(
  firstNav.nodes.some((node) => node.textContent === "Next: Episode readiness"),
  "first ingest screen renders next link",
);

// Episode readiness is now a middle step: it links back to setup and on to roles.
const readinessNav = renderNavFor("episode-readiness.html", "episode-readiness", "?path=ingest");
assert.ok(
  readinessNav.nodes.some((node) => node.textContent === "Previous: Episode setup"),
  "episode readiness links back to the setup intake step",
);
assert.ok(
  readinessNav.nodes.some((node) => node.textContent === "Next: Speaker roles"),
  "episode readiness links forward to speaker roles",
);

const middleNav = renderNavFor("speaker-role-mapping.html", "speaker-role-mapping", "?path=ingest");
const layoutPlacementLink = linkWithText(middleNav.nodes, "Place videos in layout");
assert.equal(
  layoutPlacementLink.href,
  "../preview/layout-first.html?path=ingest&from=ingest",
  "ingest path at speaker roles links to layout-first placement with ingest context",
);
assert.ok(
  middleNav.nodes.some((node) => node.textContent === "Previous: Episode readiness"),
  "middle ingest screen renders previous link",
);
assert.ok(
  middleNav.nodes.some((node) => node.textContent === "Next: Social links"),
  "ingest path at speaker roles links forward to social context",
);
const currentStep = middleNav.nodes.find((node) =>
  node.textContent === "Setup step 3 of 4 · Speaker roles",
);
assert.ok(currentStep, "middle ingest screen renders visible step label");
assert.equal(currentStep.attributes["aria-current"], "step", "current ingest step exposes aria-current");

const episodeRoleNav = renderNavFor("speaker-role-mapping.html", "speaker-role-mapping", "?path=episode");
const episodePlacementLink = linkWithText(episodeRoleNav.nodes, "Place videos in layout");
assert.equal(
  episodePlacementLink.href,
  "../preview/layout-first.html?path=episode&from=ingest",
  "episode shell path at speaker roles links to layout-first placement with episode context",
);
assert.ok(
  episodeRoleNav.nodes.some((node) => node.textContent === "Continue: Source media health"),
  "episode shell path at speaker roles skips social context",
);
assert.ok(
  episodeRoleNav.nodes.some((node) => node.href === "source-media-health.html?path=episode"),
  "episode shell path hands off into the episode flow context",
);
assert.ok(
  !episodeRoleNav.nodes.some((node) => node.textContent === "Next: Social links"),
  "episode shell path does not link to social context from speaker roles",
);

const lastNav = renderNavFor("social-context-intake.html", "social-context-intake", "?path=ingest");
assert.ok(
  lastNav.nodes.some((node) => node.textContent === "Continue: Source media health"),
  "last ingest screen hands off to source media health",
);
assert.ok(
  lastNav.nodes.some((node) => node.href === "source-media-health.html?path=episode"),
  "ingest setup hands off into the episode flow context",
);
assert.ok(
  !lastNav.nodes.some((node) => node.textContent && node.textContent.startsWith("Next:")),
  "last ingest screen does not render a next link",
);

const embeddedFirstNav = renderNavFor("episode-readiness.html", "episode-readiness", "", true);
const embeddedHome = linkWithText(embeddedFirstNav.nodes, "← Preview shell");
assert.equal(embeddedHome.href, "../preview/", "embedded ingest nav keeps the shell-home href");
assert.equal(embeddedHome.target, "_top", "embedded shell-home link targets the parent app");
const embeddedPreviewApp = linkWithText(embeddedFirstNav.nodes, "Preview app");
assert.equal(
  embeddedPreviewApp.href,
  "../preview/app.html#episode-readiness",
  "embedded ingest nav opens the current screen in the preview app",
);
assert.equal(embeddedPreviewApp.target, "_top", "embedded preview app link targets the parent app");
const embeddedNext = linkWithText(embeddedFirstNav.nodes, "Next: Speaker roles");
assert.equal(
  embeddedNext.href,
  "../preview/app.html#speaker-role-mapping",
  "embedded ingest nav routes next setup steps through the preview app hash",
);
assert.equal(embeddedNext.target, "_top", "embedded ingest next link targets the parent app");

const embeddedMiddleNav = renderNavFor("speaker-role-mapping.html", "speaker-role-mapping", "?path=ingest", true);
const embeddedPlacement = linkWithText(embeddedMiddleNav.nodes, "Place videos in layout");
assert.equal(
  embeddedPlacement.href,
  "../preview/layout-first.html?path=ingest&from=ingest",
  "embedded ingest nav opens layout-first placement from the speaker-role step",
);
assert.equal(embeddedPlacement.target, "_top", "embedded layout-first placement link targets the parent app");
assert.equal(
  linkWithText(embeddedMiddleNav.nodes, "Preview app").href,
  "../preview/app.html#speaker-role-mapping?path=ingest",
  "embedded ingest nav preserves ingest context on the current preview app link",
);
assert.equal(
  linkWithText(embeddedMiddleNav.nodes, "Previous: Episode readiness").href,
  "../preview/app.html#episode-readiness?path=ingest",
  "embedded ingest nav routes previous setup steps through the preview app hash with ingest context",
);
assert.equal(
  linkWithText(embeddedMiddleNav.nodes, "Next: Social links").href,
  "../preview/app.html#social-context-intake?path=ingest",
  "embedded ingest nav routes middle next steps through the preview app hash with ingest context",
);

const embeddedLastNav = renderNavFor("social-context-intake.html", "social-context-intake", "?path=ingest", true);
const embeddedHandoff = linkWithText(embeddedLastNav.nodes, "Continue: Source media health");
assert.equal(
  embeddedHandoff.href,
  "../preview/app.html#source-media-health?path=episode",
  "embedded ingest nav routes the source media health handoff through the preview app hash with episode context",
);
assert.equal(embeddedHandoff.target, "_top", "embedded ingest handoff targets the parent app");

const duplicateNav = renderNavFor("speaker-role-mapping.html", "speaker-role-mapping");
vm.runInNewContext(navSource, {
  document: {
    readyState: "complete",
    head: duplicateNav.head,
    body: duplicateNav.body,
    createElement,
    getElementById(id) {
      return duplicateNav.nodes.find((node) => node.id === id) || null;
    },
    querySelector(selector) {
      if (!selector.startsWith(".")) return null;
      const className = selector.slice(1);
      return duplicateNav.nodes.find((node) => node.className.split(" ").includes(className)) || null;
    },
    addEventListener() {},
  },
  window: makeWindow("speaker-role-mapping.html"),
  URLSearchParams,
});
assert.equal(
  flatten(duplicateNav.body).filter((node) => node.className === "ingest-nav").length,
  1,
  "ingest nav renders once if the script runs twice",
);

console.log("ingest nav: ingest screens connected with creator-facing copy");
