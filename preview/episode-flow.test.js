"use strict";

// Smoke test for the connected episode flow (#582 / #584).
// Run with: `node preview/episode-flow.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const flowPath = path.join(__dirname, "episode-flow.html");
const shellPath = path.join(__dirname, "index.html");
const flow = fs.readFileSync(flowPath, "utf8");
const shell = fs.readFileSync(shellPath, "utf8");

// The shell routes to the connected flow.
assert.ok(shell.includes("episode-flow.html"), "preview shell links to the episode flow");

// The flow is a single page with the product title and a landmark.
assert.match(flow, /<title>Podcast Design Canvas — Episode flow<\/title>/, "flow has product title");
assert.match(flow, /aria-label="Podcast Design Canvas episode flow"/, "flow exposes a landmark label");

// All seven connected steps are present, in order, as one coherent path.
const stepTitles = [
  "Episode readiness",
  "Speaker roles",
  "Source media health",
  "Speaker sync",
  "Audio cleanup",
  "Caption review",
  "Export readiness",
];
let lastIndex = -1;
for (const title of stepTitles) {
  const at = flow.indexOf(title);
  assert.ok(at !== -1, `flow includes step: ${title}`);
  assert.ok(at > lastIndex, `flow keeps step order: ${title}`);
  lastIndex = at;
}

// The flow shares one episode model and ends in an export action (the outcome).
assert.ok(/const episode = \{/.test(flow), "flow uses one shared episode model");
assert.ok(flow.includes("Export episode"), "flow ends in an export action");
assert.ok(flow.includes("Current step"), "stepper exposes the current step in visible text");
assert.ok(flow.includes("Completed step"), "stepper exposes completed steps in visible text");
assert.ok(flow.includes("Locked step"), "stepper exposes locked future steps in visible text");
assert.ok(flow.includes('aria-current", "step"'), "stepper marks the current step with aria-current");
assert.match(flow, /aria-label="Episode flow status"/, "flow exposes a persistent status region");
assert.ok(flow.includes("currentStatus"), "flow renders current-step status text");
assert.ok(flow.includes("readyStatus"), "flow renders ready-count status text");
assert.ok(flow.includes("nextStatus"), "flow renders next-action status text");
assert.ok(flow.includes("Continue to"), "flow explains the next step when ready");
assert.ok(flow.includes("steps ready"), "flow summarizes progress in creator-facing copy");
assert.ok(flow.includes('href="index.html"') || flow.includes('href="./index.html"'), "guided flow links back to the preview shell");
assert.ok(flow.includes('href="app.html"'), "guided flow links to the unified preview app");
assert.ok(flow.includes('href="../index.html"'), "guided flow links to the full screen catalog");

// Each guided step routes into the full prototype screen it summarizes, and every
// target resolves to a real connected screen.
const stepScreensBlock = flow.match(/const stepScreens = \{([\s\S]*?)\};/);
assert.ok(stepScreensBlock, "flow declares a step-to-screen map");
const stepScreenFiles = [...stepScreensBlock[1].matchAll(/\["([a-z0-9-]+)",/g)].map((m) => m[1]);
assert.ok(stepScreenFiles.length >= 5, "flow maps its steps to full screens");
for (const file of stepScreenFiles) {
  assert.ok(
    fs.existsSync(path.join(root, "prototype", `${file}.html`)),
    `step screen target exists: prototype/${file}.html`,
  );
}
assert.ok(flow.includes("Open the full"), "each step offers a link into its full screen");

const publishPrepBlock = flow.match(/const publishPrepHandoff = \{([\s\S]*?)\};/);
assert.ok(publishPrepBlock, "flow declares a post-export publish prep handoff");
const publishPrepFile = publishPrepBlock[1].match(/file:\s*"([^"]+)"/)?.[1];
assert.equal(
  publishPrepFile,
  "app.html#episode-watch-through-preview?path=publish",
  "post-export handoff opens the first publish prep screen in the unified preview app",
);
assert.ok(
  fs.existsSync(path.join(__dirname, "app.html")),
  "post-export publish prep app target exists",
);
assert.ok(
  flow.includes("function renderPublishPrepHandoff()"),
  "flow renders a post-export publish prep handoff",
);
assert.ok(
  flow.includes("link.href = publishPrepHandoff.file"),
  "publish prep handoff uses the declared target",
);
assert.ok(
  flow.includes("Continue to ${publishPrepHandoff.label}"),
  "publish prep handoff exposes creator-facing continue copy",
);
assert.ok(flow.includes('speaker.bucket = "ready"'), "readiness step can resolve a speaker bucket");
assert.ok(flow.includes("Add speaker name"), "readiness exposes a fix action for missing names");
assert.ok(flow.includes("Confirm roles"), "roles step exposes a confirm action");

// Editable caption text is never interpolated into innerHTML (XSS-safe rendering).
assert.ok(!/innerHTML/.test(flow), "flow builds the DOM without innerHTML");

// The script parses without throwing.
const script = flow.match(/<script>([\s\S]*?)<\/script>/)[1];
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

function runFlow() {
  const roots = {
    "#stepper": createElement("ol"),
    "#progress": createElement("i"),
    "#currentStatus": createElement("strong"),
    "#readyStatus": createElement("strong"),
    "#nextStatus": createElement("strong"),
    "#panel": createElement("section"),
    "#back": createElement("button"),
    "#next": createElement("button"),
    "#gate": createElement("span"),
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

function selectWithLabel(root, label) {
  const select = flatten(root).find(
    (node) => node.tagName === "select" && node.attributes["aria-label"] === label,
  );
  assert.ok(select, `Missing select: ${label}`);
  return select;
}

function changeSelect(select, value) {
  select.value = value;
  select.onchange({ target: select });
}

const flowUi = runFlow();
assert.equal(
  linkWithText(flowUi["#panel"], "Open the full Episode readiness screen →").href,
  "../prototype/episode-readiness.html?path=episode",
  "rendered readiness full-screen link keeps the episode path context",
);

buttonWithText(flowUi["#panel"], "Add speaker name").click();
flowUi["#next"].click();
assert.equal(
  linkWithText(flowUi["#panel"], "Open the full Speaker role mapping screen →").href,
  "../prototype/speaker-role-mapping.html?path=episode",
  "rendered role-mapping full-screen link keeps the episode path context",
);

buttonWithText(flowUi["#panel"], "Confirm roles").click();
flowUi["#next"].click();
assert.equal(
  linkWithText(flowUi["#panel"], "Open the full Source media health screen →").href,
  "../prototype/source-media-health.html",
  "rendered source-media full-screen link stays on the normal prototype URL",
);

changeSelect(selectWithLabel(flowUi["#panel"], "Marcus Lee source"), "ready");
flowUi["#next"].click();
flowUi["#next"].click();
buttonWithText(flowUi["#panel"], "Apply audio cleanup").click();
flowUi["#next"].click();
for (const select of flatten(flowUi["#panel"]).filter((node) => node.tagName === "select")) {
  changeSelect(select, "confirm");
}
flowUi["#next"].click();
buttonWithText(flowUi["#panel"], "Export episode").click();
assert.equal(
  linkWithText(flowUi["#panel"], "Continue to watch-through preview").href,
  "app.html#episode-watch-through-preview?path=publish",
  "rendered post-export handoff opens publish prep in the unified preview app with publish context",
);

assert.ok(fs.existsSync(path.join(root, "preview", "episode-flow.html")), "flow page exists for routing");

console.log("episode flow (connected path smoke): all assertions passed");
