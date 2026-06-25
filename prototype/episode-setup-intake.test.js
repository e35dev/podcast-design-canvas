"use strict";

// Smoke tests for the guided episode setup intake screen (#1326 / #584).
// Covers the structural wiring plus, via a small DOM stub, the three behaviours the active
// step calls out: incomplete setup is gated, role assignment unlocks continue, and a complete
// setup hands the chosen source + speakers forward to episode readiness.
// Run with: `node prototype/episode-setup-intake.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const root = path.join(__dirname, "..");
const htmlPath = path.join(__dirname, "episode-setup-intake.html");
const html = fs.readFileSync(htmlPath, "utf8");

// --- structural wiring ---------------------------------------------------------------------

assert.ok(html.includes("../preview/ingest-nav.js"), "intake screen loads ingest navigation");
assert.ok(html.includes("../preview/episode-setup-handoff.js"), "intake screen loads the setup handoff helper");
assert.ok(!html.includes("../preview/tools-nav.js"), "intake screen uses ingest nav instead of tools nav");
assert.ok(
  html.includes('data-ingest-step="episode-setup-intake"'),
  "intake screen declares its ingest step",
);
assert.ok(html.includes('id: "recording-link"'), "intake offers the recording-link source path");
assert.ok(html.includes('id: "uploaded-files"'), "intake offers the multi-file upload source path");
assert.ok(html.includes('role="radiogroup"'), "intake presents the source paths as a radio group");
assert.ok(html.includes('id="continue"'), "intake has a continue control");
assert.ok(/aria-disabled="true"/.test(html), "the continue control starts gated");
assert.ok(!/innerHTML/.test(html), "intake builds the DOM without innerHTML");

// --- inline script parses ------------------------------------------------------------------

const inlineScript = html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(inlineScript);

// --- DOM stub ------------------------------------------------------------------------------

function makeNode(tagName) {
  return {
    tagName: (tagName || "").toUpperCase(),
    className: "",
    value: "",
    textContent: "",
    placeholder: "",
    type: "",
    name: "",
    checked: false,
    href: "",
    children: [],
    dataset: {},
    attributes: {},
    handlers: {},
    append(...nodes) {
      this.children.push(...nodes);
    },
    replaceChildren(...nodes) {
      this.children = nodes;
    },
    addEventListener(type, handler) {
      this.handlers[type] = handler;
    },
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
    removeAttribute(name) {
      delete this.attributes[name];
      if (name === "href") this.href = "";
    },
    getAttribute(name) {
      if (name === "href") return this.href || null;
      return Object.prototype.hasOwnProperty.call(this.attributes, name) ? this.attributes[name] : null;
    },
    querySelector(selector) {
      const className = selector.replace(/^\./, "");
      const stack = [...this.children];
      while (stack.length) {
        const node = stack.shift();
        if (node && typeof node.className === "string" && node.className.split(" ").includes(className)) {
          return node;
        }
        if (node && node.children) {
          stack.push(...node.children);
        }
      }
      return null;
    },
  };
}

function runScreen(search = "") {
  const ids = ["source-types", "tracks", "status", "needs", "continue", "addTrack", "reset"];
  const byId = {};
  ids.forEach((id) => {
    byId[id] = makeNode("div");
  });

  const store = new Map();
  const sandbox = {
    document: {
      createElement: (tag) => makeNode(tag),
      createTextNode: (text) => ({ textContent: text, children: [] }),
      querySelector(selector) {
        return byId[selector.replace(/^#/, "")] || null;
      },
    },
    window: {
      location: { search },
      sessionStorage: {
        getItem: (key) => (store.has(key) ? store.get(key) : null),
        setItem: (key, value) => store.set(key, String(value)),
        removeItem: (key) => store.delete(key),
      },
      PodcastEpisodeSetupHandoff: require("../preview/episode-setup-handoff.js"),
    },
    URLSearchParams,
    Object,
    Array,
  };
  sandbox.window.window = sandbox.window;

  vm.runInNewContext(inlineScript, sandbox);
  return { nodes: byId };
}

function changeField(article, field, value, tagName) {
  article.handlers.change({ target: { dataset: { field }, value, tagName: tagName || "SELECT" } });
}

// 1) The seeded sample is a complete setup, so continue is enabled and carries the handoff.
const screen = runScreen("?path=ingest");
assert.equal(
  screen.nodes.continue.getAttribute("aria-disabled"),
  "false",
  "a complete sample setup enables continue",
);
const continueHref = screen.nodes.continue.getAttribute("href");
assert.ok(continueHref.startsWith("episode-readiness.html?path=ingest"), "continue targets episode readiness with path context");
assert.ok(continueHref.includes("source=uploaded-files"), "continue carries the chosen source type forward");
const carried = new URLSearchParams(continueHref.split("?")[1]);
const carriedSpeakers = JSON.parse(carried.get("speakers"));
assert.equal(carriedSpeakers.length, 2, "continue carries every speaker forward");
assert.ok(carriedSpeakers.some((s) => s.role === "host" && s.name === "Dana Brooks"), "the host is carried with name and role");

// 2) Incomplete setup is gated: adding an empty speaker disables continue and names the gap.
screen.nodes.addTrack.handlers.click();
assert.equal(
  screen.nodes.continue.getAttribute("aria-disabled"),
  "true",
  "an unnamed, unassigned new speaker re-gates continue",
);
assert.equal(screen.nodes.continue.getAttribute("href"), null, "a gated continue exposes no destination");
assert.ok(screen.nodes.needs.children.length > 0, "the readiness panel lists what still needs doing");
assert.ok(
  screen.nodes.needs.children.some((li) => /name/i.test(li.textContent)),
  "the readiness panel asks for the missing speaker name",
);

// 3) Role assignment gating: clearing a seeded speaker's role gates continue; restoring unlocks it.
const reset = runScreen("?path=ingest");
const firstArticle = reset.nodes.tracks.children[0];
changeField(firstArticle, "role", "");
assert.equal(
  reset.nodes.continue.getAttribute("aria-disabled"),
  "true",
  "removing a speaker's role gates continue",
);
const restored = reset.nodes.tracks.children[0];
changeField(restored, "role", "host");
assert.equal(
  reset.nodes.continue.getAttribute("aria-disabled"),
  "false",
  "re-assigning the role unlocks continue",
);

// 4) Duplicate roles are not a complete setup.
const dup = runScreen("?path=ingest");
changeField(dup.nodes.tracks.children[1], "role", "host");
assert.equal(
  dup.nodes.continue.getAttribute("aria-disabled"),
  "true",
  "two speakers sharing a role keeps continue gated",
);
assert.ok(
  dup.nodes.needs.children.some((li) => /different role/i.test(li.textContent)),
  "the readiness panel flags the duplicate role",
);

// 5) The episode path carries its shell context instead of the ingest default.
const episode = runScreen("?path=episode");
assert.ok(
  episode.nodes.continue.getAttribute("href").startsWith("episode-readiness.html?path=episode"),
  "the episode shell path is preserved into the handoff link",
);

console.log("episode setup intake: source paths, gated continue, role assignment, and handoff verified");
