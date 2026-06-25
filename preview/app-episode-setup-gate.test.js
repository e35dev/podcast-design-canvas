"use strict";

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const appHtml = fs.readFileSync(path.join(__dirname, "app.html"), "utf8");
const appScript = appHtml.match(/<script>([\s\S]*?)<\/script>/)[1];
const routeContextScript = fs.readFileSync(path.join(__dirname, "app-route-context.js"), "utf8");
const setupStateScript = fs.readFileSync(path.join(__dirname, "episode-setup-state.js"), "utf8");

function createElement(tagName) {
  return {
    tagName,
    children: [],
    attributes: {},
    dataset: {},
    className: "",
    href: "",
    src: "",
    title: "",
    textContent: "",
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    replaceChildren(...children) {
      this.children = children;
    },
    setAttribute(name, value) {
      this.attributes[name] = value;
      if (name === "href") this.href = value;
    },
    removeAttribute(name) {
      delete this.attributes[name];
      if (name === "href") this.href = "";
    },
    classList: {
      toggle() {},
    },
  };
}

function flatten(node) {
  return [node, ...node.children.flatMap(flatten)];
}

function runApp(initialHash = "") {
  const roots = {
    "#rail": createElement("nav"),
    "#screen": createElement("iframe"),
    "#crumb-label": createElement("strong"),
    "#open-direct": createElement("a"),
    "#step-count": createElement("span"),
    "#prev-step": createElement("a"),
    "#next-step": createElement("a"),
    "#progress": createElement("span"),
  };
  const document = {
    createElement,
    querySelector(selector) {
      return roots[selector] || null;
    },
  };
  const listeners = {};
  const sessionData = new Map();
  const sessionStorage = {
    getItem(key) {
      return sessionData.has(key) ? sessionData.get(key) : null;
    },
    setItem(key, value) {
      sessionData.set(key, value);
    },
    removeItem(key) {
      sessionData.delete(key);
    },
  };
  const window = {
    location: { hash: initialHash, pathname: "/preview/app.html" },
    top: null,
    self: null,
    addEventListener(type, handler) {
      listeners[type] = handler;
    },
  };
  window.top = window;
  window.self = window;

  const sandbox = {
    document,
    window,
    sessionStorage,
    URLSearchParams,
  };
  vm.runInNewContext(routeContextScript, sandbox);
  vm.runInNewContext(setupStateScript, sandbox);
  sandbox.window.PodcastEpisodeSetupState = sandbox.PodcastEpisodeSetupState;
  vm.runInNewContext(appScript, sandbox);
  return { roots, window, listeners, sessionStorage };
}

const blocked = runApp("");
assert.equal(
  blocked.roots["#screen"].src,
  "../prototype/episode-setup-intake.html",
  "the preview app opens on the guided episode setup intake by default",
);
assert.equal(
  blocked.roots["#next-step"].attributes["aria-disabled"],
  "true",
  "the shell next-step control is disabled while the intake is incomplete",
);

const readinessRailLink = flatten(blocked.roots["#rail"]).find(
  (node) => node.tagName === "a" && node.textContent === "Episode Readiness",
);
assert.ok(readinessRailLink, "the rail includes the next setup screen");
assert.equal(
  readinessRailLink.attributes["aria-disabled"],
  "true",
  "the visible rail path to later screens is disabled while the intake is incomplete",
);
assert.equal(
  readinessRailLink.href,
  "#episode-setup-intake",
  "disabled rail links loop back to the gated setup start while intake is incomplete",
);

blocked.listeners.message({ data: { type: "pdc-episode-setup-state", complete: true } });
assert.equal(
  readinessRailLink.attributes["aria-disabled"],
  undefined,
  "the rail unlocks after the intake reports completion",
);
assert.equal(
  readinessRailLink.href,
  "#episode-readiness",
  "the rail restores the true next-step target after intake completion",
);
blocked.window.location.hash = "#episode-readiness";
blocked.listeners.hashchange();
assert.equal(
  blocked.roots["#screen"].src,
  "../prototype/episode-readiness.html",
  "after the intake reports completion, the next preview step becomes reachable",
);
assert.notEqual(
  blocked.roots["#next-step"].attributes["aria-disabled"],
  "true",
  "the shell next-step control re-enables after setup completion",
);

console.log("preview app: guided episode setup gates later screens until the intake is complete");
