"use strict";

// Smoke test: speaker visual match must hand off to the visual direction path
// (#583). After the guest match is settled, the primary continue control should
// open preset-style-picker — the first screen in the shell's visual direction
// path — instead of a dead button that only toggles local state.
// Run with: `node prototype/speaker-visual-match-handoff.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "prototype", "speaker-visual-match.html"), "utf8");
const nextVisualSurface = "preset-style-picker.html";
const comparisonSurface = "preset-comparison-preview.html";

assert.ok(
  fs.existsSync(path.join(root, "prototype", nextVisualSurface)),
  "next visual direction screen exists as a real screen",
);
assert.ok(
  fs.existsSync(path.join(root, "prototype", comparisonSurface)),
  "preset comparison preview exists as a real screen",
);
assert.ok(
  source.includes(`const nextVisualSurface = "${nextVisualSurface}"`),
  "speaker visual match declares the visual direction handoff target",
);
assert.ok(
  source.includes(`const presetComparisonSurface = "${comparisonSurface}"`),
  "speaker visual match declares the preset comparison review target",
);
assert.ok(
  source.includes('<a class="continue-link" id="continuePreset"'),
  "preset handoff uses a continue link instead of a dead button",
);
assert.ok(
  source.includes("function updateContinueHandoff()"),
  "speaker visual match updates the continue link from match state",
);
assert.ok(
  source.includes("continuePresetLink.href = nextVisualSurface"),
  "ready continue action links to the visual direction screen",
);
assert.ok(
  source.includes('continuePresetLink.removeAttribute("href")'),
  "blocked continue action removes navigation",
);
assert.ok(
  source.includes('continuePresetLink.setAttribute("aria-disabled", String(!ready))'),
  "blocked continue action is exposed as disabled",
);
assert.ok(
  !source.includes("presetReady"),
  "preset handoff no longer relies on a local-only ready flag",
);

const script = source.match(/<script>([\s\S]*?)<\/script>/)[1];
const vm = require("vm");
new vm.Script(script);

function createElement(tagName) {
  return {
    tagName,
    attributes: {},
    children: [],
    className: "",
    disabled: false,
    href: "",
    style: {},
    textContent: "",
    append(...children) {
      this.children.push(...children);
    },
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    replaceChildren(...children) {
      this.children = children;
    },
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
    removeAttribute(name) {
      delete this.attributes[name];
      if (name === "href") {
        this.href = "";
      }
    },
    addEventListener(event, handler) {
      this[`on${event}`] = handler;
    },
    click() {
      if (!this.disabled && this.onclick) {
        this.onclick({ target: this });
      }
    },
  };
}

function flatten(node) {
  return [node, ...node.children.flatMap(flatten)];
}

function runScreen() {
  const roots = {
    "#trackList": createElement("div"),
    "#statusBadge": createElement("span"),
    "#presetList": createElement("div"),
    "#presetPreview": createElement("div"),
    "#summaryGrid": createElement("div"),
    "#issues": createElement("div"),
    "#resetSample": createElement("button"),
    "#continuePreset": createElement("a"),
  };
  const document = {
    createElement,
    querySelector(selector) {
      return roots[selector] || null;
    },
  };
  vm.runInNewContext(script, { document });
  return roots;
}

function linkWithText(root, text) {
  const link = flatten(root).find((node) => node.tagName === "a" && node.textContent === text);
  assert.ok(link, `Missing link: ${text}`);
  return link;
}

function buttonWithText(root, text) {
  const button = flatten(root).find((node) => node.tagName === "button" && node.textContent === text);
  assert.ok(button, `Missing button: ${text}`);
  return button;
}

function links(root) {
  return flatten(root).filter((node) => node.tagName === "a");
}

const screen = runScreen();
assert.equal(
  linkWithText(screen["#issues"], "Open preset comparison").href,
  comparisonSurface,
  "initial mismatched guest review opens preset comparison preview",
);
assert.equal(
  screen["#continuePreset"].href,
  "",
  "unresolved visual match keeps the preset styling handoff disabled",
);

buttonWithText(screen["#trackList"], "Keep automatic match").click();
assert.equal(
  links(screen["#issues"]).length,
  1,
  "settled speaker match shows the preset styling fix link on the ready card",
);
assert.equal(
  linkWithText(screen["#issues"], "Open preset styling").href,
  nextVisualSurface,
  "preset-ready card links directly to preset-style-picker",
);
assert.equal(
  screen["#continuePreset"].href,
  nextVisualSurface,
  "settled speaker match keeps the primary preset styling handoff",
);

screen["#resetSample"].click();
buttonWithText(screen["#trackList"], "Try stronger match").click();
assert.equal(
  links(screen["#issues"]).length,
  1,
  "limit warning is local but preset-ready card still links to preset styling",
);

console.log("speaker visual match: preset handoff links to the visual direction screen");
