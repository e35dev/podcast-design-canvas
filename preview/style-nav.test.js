"use strict";

// Guards visual direction prototype navigation (#583 / #584).
// Run with: `node preview/style-nav.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const root = path.join(__dirname, "..");
const navScript = fs.readFileSync(path.join(__dirname, "style-nav.js"), "utf8");

new vm.Script(navScript);
assert.ok(navScript.includes('home.href = "../preview/"'), "style nav links back to the preview shell");
assert.ok(navScript.includes("episode-flow.html"), "style nav links to the guided episode flow");
assert.ok(navScript.includes("app.html"), "style nav links to the preview app");
assert.ok(navScript.includes("currentPreviewAppHref"), "style nav builds preview app href from the active step");
assert.ok(
  navScript.includes("setTopTargetWhenEmbedded(app)"),
  "style nav preview app link uses embedded target handling",
);
assert.ok(navScript.includes("contextual-broll-moments.html"), "style nav hands off to the contextual visuals path");
assert.ok(navScript.includes("speaker-eye-line-coherence.html"), "style nav links back to speaker setup");
assert.ok(navScript.includes('document.querySelector(".style-nav")'), "style nav guards against double render");
assert.ok(navScript.includes("layout-first.html"), "style nav links to layout-first video placement");
assert.ok(navScript.includes("layoutFirstPlacementSearch"), "style nav builds layout-first placement query with URLSearchParams");
assert.ok(navScript.includes("Place videos in layout"), "style nav offers layout-first placement on canvas layer controls");
assert.ok(!/innerHTML/.test(navScript), "style nav builds the DOM without innerHTML");

const styleScreens = [
  "preset-style-picker.html",
  "preset-comparison-preview.html",
  "preset-pacing-controls.html",
  "layout-safe-areas.html",
  "speaker-framing-safety.html",
  "canvas-layer-controls.html",
];

for (const file of styleScreens) {
  const html = fs.readFileSync(path.join(root, "prototype", file), "utf8");
  assert.ok(html.includes("../preview/style-nav.js"), `${file} loads style navigation`);
  assert.ok(!html.includes("../preview/tools-nav.js"), `${file} uses style nav instead of tools nav`);
  assert.ok(html.includes("data-style-step="), `${file} declares its style step`);
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

function makeWindow(fileName, embedded = false, search = "") {
  const window = { location: { pathname: `/prototype/${fileName}`, search: search } };
  window.self = window;
  window.top = embedded ? { location: { pathname: "/preview/app.html" } } : window;
  return window;
}

function renderNavFor(fileName, styleStep, embedded = false, search = "") {
  const head = createElement("head");
  const body = createElement("body");
  if (styleStep) {
    body.dataset = { styleStep };
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
  };
  vm.runInNewContext(navScript, {
    document,
    window: makeWindow(fileName, embedded, search),
    URLSearchParams,
  });
  return { nodes: [...flatten(head), ...flatten(body)] };
}

function linkWithText(nodes, text) {
  const link = nodes.find((node) => node.tagName === "a" && node.textContent === text);
  assert.ok(link, `Missing link: ${text}`);
  return link;
}

function routeSearchFor(file) {
  const window = makeWindow("canvas-layer-controls.html");
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
  routeSearchFor("contextual-broll-moments.html?moment=42&from=style"),
  "?from=style",
  "style nav preserves style context when extra query params are present",
);
assert.equal(
  routeSearchFor("contextual-broll-moments.html?from=cleanup&moment=42"),
  "?from=cleanup",
  "style nav preserves cleanup context when it is not the only query param",
);
assert.equal(
  routeSearchFor("contextual-broll-moments.html?moment=42&from=unknown"),
  "",
  "style nav strips unsupported handoff context from preview app hashes",
);

const lastNav = renderNavFor("canvas-layer-controls.html", "canvas-layer-controls");
const stylePlacementLink = linkWithText(lastNav.nodes, "Place videos in layout");
assert.equal(
  stylePlacementLink.href,
  "../preview/layout-first.html?from=style",
  "canvas layer controls links to layout-first placement with style context",
);
assert.ok(
  lastNav.nodes.some((node) => node.textContent === "Continue: Contextual b-roll moments"),
  "last visual direction screen hands off to the contextual visuals path",
);
assert.ok(
  lastNav.nodes.some((node) => node.href === "contextual-broll-moments.html?from=style"),
  "last visual direction screen links to contextual b-roll moments",
);

const firstStyleNav = renderNavFor("preset-style-picker.html", "preset-style-picker");
assert.ok(
  !firstStyleNav.nodes.some((node) => node.textContent === "Place videos in layout"),
  "first style screen does not offer layout-first placement before canvas layer controls",
);

const embeddedFirstNav = renderNavFor("preset-style-picker.html", "preset-style-picker", true);
const embeddedHome = linkWithText(embeddedFirstNav.nodes, "← Preview shell");
assert.equal(embeddedHome.href, "../preview/", "embedded style nav keeps the shell-home href");
assert.equal(embeddedHome.target, "_top", "embedded shell-home link targets the parent app");
const embeddedPreviewApp = linkWithText(embeddedFirstNav.nodes, "Preview app");
assert.equal(
  embeddedPreviewApp.href,
  "../preview/app.html#preset-style-picker",
  "embedded style nav opens the current screen in the preview app",
);
assert.equal(embeddedPreviewApp.target, "_top", "embedded preview app link targets the parent app");
const embeddedSetupBack = linkWithText(embeddedFirstNav.nodes, "Previous: Speaker eye-line coherence");
assert.equal(
  embeddedSetupBack.href,
  "../preview/app.html#speaker-eye-line-coherence",
  "embedded style nav routes the setup back-link through the preview app hash",
);
assert.equal(embeddedSetupBack.target, "_top", "embedded setup back-link targets the parent app");
const embeddedStyleNext = linkWithText(embeddedFirstNav.nodes, "Next: Preset comparison");
assert.equal(
  embeddedStyleNext.href,
  "../preview/app.html#preset-comparison-preview",
  "embedded style nav routes next style steps through the preview app hash",
);
assert.equal(embeddedStyleNext.target, "_top", "embedded style next link targets the parent app");

const embeddedPacingNav = renderNavFor("preset-pacing-controls.html", "preset-pacing-controls", true);
assert.equal(
  linkWithText(embeddedPacingNav.nodes, "Previous: Preset comparison").href,
  "../preview/app.html#preset-comparison-preview",
  "embedded style nav routes the pacing step's previous link through the preview app hash",
);
assert.equal(
  linkWithText(embeddedPacingNav.nodes, "Next: Layout safe areas").href,
  "../preview/app.html#layout-safe-areas",
  "embedded style nav routes the pacing step's next link through the preview app hash",
);

const embeddedMiddleNav = renderNavFor("layout-safe-areas.html", "layout-safe-areas", true);
assert.equal(
  linkWithText(embeddedMiddleNav.nodes, "Previous: Preset pacing").href,
  "../preview/app.html#preset-pacing-controls",
  "embedded style nav routes previous style steps through the preview app hash",
);
assert.equal(
  linkWithText(embeddedMiddleNav.nodes, "Next: Speaker framing safety").href,
  "../preview/app.html#speaker-framing-safety",
  "embedded style nav routes middle next steps through the preview app hash",
);

const embeddedLastNav = renderNavFor("canvas-layer-controls.html", "canvas-layer-controls", true);
const embeddedHandoff = linkWithText(embeddedLastNav.nodes, "Continue: Contextual b-roll moments");
assert.equal(
  embeddedHandoff.href,
  "../preview/app.html#contextual-broll-moments?from=style",
  "embedded style nav routes the contextual visuals handoff through the preview app hash",
);
assert.equal(embeddedHandoff.target, "_top", "embedded style handoff targets the parent app");
const embeddedPlacement = linkWithText(embeddedLastNav.nodes, "Place videos in layout");
assert.equal(
  embeddedPlacement.href,
  "../preview/layout-first.html?from=style",
  "embedded style nav opens layout-first placement from canvas layer controls",
);
assert.equal(embeddedPlacement.target, "_top", "embedded layout-first placement link targets the parent app");
assert.equal(
  linkWithText(embeddedLastNav.nodes, "Preview app").href,
  "../preview/app.html#canvas-layer-controls",
  "embedded style nav keeps preview app on the active style step",
);

// Path context: a creator on the guided episode path keeps ?path=episode on style links.
const pathNav = renderNavFor("layout-safe-areas.html", "layout-safe-areas", false, "?path=episode");
assert.ok(
  linkWithText(pathNav.nodes, "Previous: Preset pacing").href.includes("?path=episode"),
  "style nav keeps the episode path context on the previous link",
);
assert.ok(
  linkWithText(pathNav.nodes, "Next: Speaker framing safety").href.includes("?path=episode"),
  "style nav keeps the episode path context on the next link",
);
const noPathNav = renderNavFor("layout-safe-areas.html", "layout-safe-areas", false, "");
assert.ok(
  !linkWithText(noPathNav.nodes, "Previous: Preset pacing").href.includes("?path="),
  "style nav adds no path suffix when there is no path context",
);

const embeddedPathNav = renderNavFor("layout-safe-areas.html", "layout-safe-areas", true, "?path=episode");
assert.equal(
  linkWithText(embeddedPathNav.nodes, "Preview app").href,
  "../preview/app.html#layout-safe-areas?path=episode",
  "embedded style nav keeps episode path context on the preview app link",
);

const handoffPathNav = renderNavFor("canvas-layer-controls.html", "canvas-layer-controls", false, "?path=episode");
assert.equal(
  linkWithText(handoffPathNav.nodes, "Place videos in layout").href,
  "../preview/layout-first.html?path=episode&from=style",
  "style nav keeps episode path context on the layout-first placement link",
);
assert.equal(
  linkWithText(handoffPathNav.nodes, "Continue: Contextual b-roll moments").href,
  "contextual-broll-moments.html?from=style&path=episode",
  "style nav merges episode path context onto the contextual visuals handoff without breaking from=style",
);

function renderNavWithInPageLinks(fileName, styleStep, embedded, search, hrefs) {
  const head = createElement("head");
  const body = createElement("body");
  if (styleStep) { body.dataset = { styleStep }; }
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
      return allNodes().find((node) => node.className.split(" ").includes(className)) || null;
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
  const window = makeWindow(fileName, embedded, search || "");
  vm.runInNewContext(navScript, { document, window, URLSearchParams });
  return { nodes: allNodes(), listeners };
}

const inPageStyleLinks = renderNavWithInPageLinks(
  "layout-safe-areas.html",
  "layout-safe-areas",
  false,
  "?path=episode",
  ["speaker-framing-safety.html", "canvas-layer-controls.html"],
);
assert.equal(
  linkWithText(inPageStyleLinks.nodes, "speaker-framing-safety.html").href,
  "speaker-framing-safety.html?path=episode",
  "style nav keeps episode path context on in-page style links",
);
assert.equal(
  linkWithText(inPageStyleLinks.nodes, "canvas-layer-controls.html").href,
  "canvas-layer-controls.html?path=episode",
  "style nav keeps episode path context on in-page canvas links",
);

const cropFixLink = renderNavWithInPageLinks(
  "layout-safe-areas.html",
  "layout-safe-areas",
  false,
  "?path=episode",
  ["destination-crop-preview.html"],
);
assert.equal(
  linkWithText(cropFixLink.nodes, "destination-crop-preview.html").href,
  "destination-crop-preview.html?path=episode",
  "layout safe area crop fix links keep episode path context",
);

const embeddedCropFix = renderNavWithInPageLinks(
  "speaker-framing-safety.html",
  "speaker-framing-safety",
  true,
  "?path=episode",
  ["destination-crop-preview.html"],
);
const embeddedCrop = linkWithText(embeddedCropFix.nodes, "destination-crop-preview.html");
assert.equal(
  embeddedCrop.href,
  "../preview/app.html#destination-crop-preview?path=episode",
  "embedded style fix links route through the preview app",
);
assert.equal(embeddedCrop.target, "_top", "embedded style fix links target the parent app");

const brollFixLink = renderNavWithInPageLinks(
  "speaker-framing-safety.html",
  "speaker-framing-safety",
  false,
  "?path=episode",
  ["contextual-broll-moments.html"],
);
const brollHref = linkWithText(brollFixLink.nodes, "contextual-broll-moments.html").href;
const brollParams = new URLSearchParams(brollHref.split("?")[1] || "");
assert.equal(brollParams.get("from"), "style", "speaker framing b-roll fix links keep style context");
assert.equal(brollParams.get("path"), "episode", "speaker framing b-roll fix links keep episode path context");

const dynamicFix = renderNavWithInPageLinks(
  "layout-safe-areas.html",
  "layout-safe-areas",
  true,
  "?path=episode",
  [],
);
const dynamicLink = createElement("a");
dynamicLink.setAttribute("href", "accessibility-readability-checks.html");
dynamicLink.getAttribute = function(name) { return this.attributes[name]; };
dynamicLink.closest = function(selector) { return selector === "a[href]" ? this : null; };
dynamicFix.nodes[0].appendChild(dynamicLink);
dynamicFix.listeners.click({ target: dynamicLink });
assert.ok(
  dynamicLink.href.includes("../preview/app.html#accessibility-readability-checks"),
  "embedded style fix links route accessibility checks through the preview app",
);
assert.ok(dynamicLink.href.includes("from=cleanup"), "embedded style fix links keep cleanup context");
assert.ok(dynamicLink.href.includes("path=episode"), "embedded style fix links keep episode path context");

console.log("style nav: visual direction screens connected back to the preview shell");
