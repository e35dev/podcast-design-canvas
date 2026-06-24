"use strict";

// Guards speaker-setup prototype navigation (#582 / #583 / #584).
// Run with: `node preview/speaker-setup-nav.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const root = path.join(__dirname, "..");
const navScript = fs.readFileSync(path.join(__dirname, "speaker-setup-nav.js"), "utf8");

new vm.Script(navScript);
assert.ok(navScript.includes('home.href = "../preview/"'), "speaker setup nav links back to the preview shell");
assert.ok(navScript.includes("episode-flow.html"), "speaker setup nav links to the guided episode flow");
assert.ok(navScript.includes("app.html"), "speaker setup nav links to the preview app");
assert.ok(navScript.includes("preset-style-picker.html"), "speaker setup nav hands off to the visual direction path");
assert.ok(navScript.includes("speaker-role-mapping.html"), "speaker setup nav links back to speaker roles");
assert.ok(navScript.includes('document.querySelector(".speaker-setup-nav")'), "speaker setup nav guards against double render");
assert.ok(!/innerHTML/.test(navScript), "speaker setup nav builds the DOM without innerHTML");

const setupScreens = [
  "speaker-attribution-review.html",
  "guest-profile-reuse.html",
  "speaker-visual-match.html",
  "speaker-eye-line-coherence.html",
];

for (const file of setupScreens) {
  const html = fs.readFileSync(path.join(root, "prototype", file), "utf8");
  assert.ok(html.includes("../preview/speaker-setup-nav.js"), `${file} loads speaker setup navigation`);
  assert.ok(!html.includes("../preview/tools-nav.js"), `${file} uses speaker setup nav instead of tools nav`);
  assert.ok(html.includes("data-setup-step="), `${file} declares its speaker setup step`);
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
  const window = { location: { pathname: `/prototype/${fileName}`, search } };
  window.self = window;
  window.top = embedded ? { location: { pathname: "/preview/app.html" } } : window;
  return window;
}

function renderNavFor(fileName, setupStep, embedded = false, search = "") {
  const head = createElement("head");
  const body = createElement("body");
  if (setupStep) {
    body.dataset = { setupStep };
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

const firstNav = renderNavFor("speaker-attribution-review.html", "speaker-attribution-review");
assert.equal(
  linkWithText(firstNav.nodes, "Previous: Speaker roles").href,
  "speaker-role-mapping.html?path=episode",
  "first speaker setup screen links back to speaker roles",
);
assert.equal(
  linkWithText(firstNav.nodes, "Next: Guest profile reuse").href,
  "guest-profile-reuse.html",
  "first speaker setup screen links to the next setup step",
);

const lastNav = renderNavFor("speaker-eye-line-coherence.html", "speaker-eye-line-coherence");
assert.ok(
  lastNav.nodes.some((node) => node.textContent === "Continue: Pick a preset style"),
  "last speaker setup screen hands off to the visual direction path",
);
assert.ok(
  lastNav.nodes.some((node) => node.href === "preset-style-picker.html"),
  "last speaker setup screen links to preset style picker",
);
assert.ok(
  !lastNav.nodes.some((node) => node.textContent && node.textContent.startsWith("Next:")),
  "last speaker setup screen does not render a next link",
);

const embeddedFirstNav = renderNavFor("speaker-attribution-review.html", "speaker-attribution-review", true);
const embeddedHome = linkWithText(embeddedFirstNav.nodes, "← Preview shell");
assert.equal(embeddedHome.href, "../preview/", "embedded speaker setup nav keeps the shell-home href");
assert.equal(embeddedHome.target, "_top", "embedded shell-home link targets the parent app");
const embeddedGuided = linkWithText(embeddedFirstNav.nodes, "Guided episode flow");
assert.equal(embeddedGuided.target, "_top", "embedded guided-flow link targets the parent app");
const embeddedPreviewApp = linkWithText(embeddedFirstNav.nodes, "Preview app");
assert.equal(embeddedPreviewApp.href, "../preview/app.html", "embedded speaker setup nav keeps the preview app href");
assert.equal(embeddedPreviewApp.target, "_top", "embedded preview app link targets the parent app");
const embeddedRolesBack = linkWithText(embeddedFirstNav.nodes, "Previous: Speaker roles");
assert.equal(
  embeddedRolesBack.href,
  "../preview/app.html#speaker-role-mapping?path=episode",
  "embedded speaker setup nav routes the roles back-link through the preview app hash with episode context",
);
assert.equal(embeddedRolesBack.target, "_top", "embedded roles back-link targets the parent app");
const embeddedNext = linkWithText(embeddedFirstNav.nodes, "Next: Guest profile reuse");
assert.equal(
  embeddedNext.href,
  "../preview/app.html#guest-profile-reuse",
  "embedded speaker setup nav routes next setup steps through the preview app hash",
);
assert.equal(embeddedNext.target, "_top", "embedded speaker setup next link targets the parent app");

const embeddedMiddleNav = renderNavFor("guest-profile-reuse.html", "guest-profile-reuse", true);
assert.equal(
  linkWithText(embeddedMiddleNav.nodes, "Previous: Speaker attribution review").href,
  "../preview/app.html#speaker-attribution-review",
  "embedded speaker setup nav routes previous setup steps through the preview app hash",
);
assert.equal(
  linkWithText(embeddedMiddleNav.nodes, "Next: Speaker visual match").href,
  "../preview/app.html#speaker-visual-match",
  "embedded speaker setup nav routes middle next steps through the preview app hash",
);

const embeddedLastNav = renderNavFor("speaker-eye-line-coherence.html", "speaker-eye-line-coherence", true);
const embeddedHandoff = linkWithText(embeddedLastNav.nodes, "Continue: Pick a preset style");
assert.equal(
  embeddedHandoff.href,
  "../preview/app.html#preset-style-picker",
  "embedded speaker setup nav routes the style handoff through the preview app hash",
);
assert.equal(embeddedHandoff.target, "_top", "embedded speaker setup handoff targets the parent app");

const episodePathNav = renderNavFor("guest-profile-reuse.html", "guest-profile-reuse", true, "?path=episode");
assert.equal(
  linkWithText(episodePathNav.nodes, "Previous: Speaker attribution review").href,
  "../preview/app.html#speaker-attribution-review?path=episode",
  "embedded speaker setup nav preserves episode path context on previous links",
);
assert.equal(
  linkWithText(episodePathNav.nodes, "Next: Speaker visual match").href,
  "../preview/app.html#speaker-visual-match?path=episode",
  "embedded speaker setup nav preserves episode path context on next links",
);

const standaloneEpisodePath = renderNavFor("speaker-visual-match.html", "speaker-visual-match", false, "?path=episode");
assert.equal(
  linkWithText(standaloneEpisodePath.nodes, "Next: Speaker eye-line coherence").href,
  "speaker-eye-line-coherence.html?path=episode",
  "standalone speaker setup nav keeps episode path context between setup screens",
);

console.log("speaker setup nav: speaker-setup screens connected back to the preview shell");
