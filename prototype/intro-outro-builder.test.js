"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const html = fs.readFileSync(path.join(__dirname, "intro-outro-builder.html"), "utf8");
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

function makeNode() {
  return {
    className: "",
    textContent: "",
    replaceChildren() {},
    addEventListener() {},
    append() {},
    querySelector() {
      return { addEventListener() {} };
    },
  };
}

const nodes = {
  "#sequence": makeNode(),
  "#status": makeNode(),
  "#issues": makeNode(),
  "#approve": makeNode(),
  "#skip": makeNode(),
  "#reset": makeNode(),
};

const sandbox = {
  document: {
    querySelector(selector) {
      return nodes[selector] || makeNode();
    },
    createElement() {
      return makeNode();
    },
  },
  structuredClone,
  module: { exports: {} },
};

vm.runInNewContext(script, sandbox);

const { sampleSequence, evaluateSequence, issuesFor } = sandbox.module.exports;

assert.strictEqual(evaluateSequence(sampleSequence), "review");
assert.strictEqual(evaluateSequence(sampleSequence.map((item) => ({ ...item, state: "draft" }))), "draft");
assert.strictEqual(evaluateSequence(sampleSequence.map((item) => ({ ...item, state: "adapted" }))), "adapted");
assert.strictEqual(evaluateSequence(sampleSequence.map((item) => ({ ...item, state: "approved" }))), "approved");
assert.strictEqual(evaluateSequence(sampleSequence.map((item) => ({ ...item, state: "skipped" }))), "skipped");
assert.match(issuesFor("approved", sampleSequence)[0].title, /Ready for final watch-through/);
assert.match(issuesFor("skipped", sampleSequence)[0].detail, /episode/i);

const reviewIssues = issuesFor("review", sampleSequence);
const musicIssue = reviewIssues.find((issue) => issue.title.includes("Intro cue"));
assert.ok(musicIssue, "review state surfaces the music cue issue");
assert.equal(musicIssue.fixScreen, "music-cue-setup.html");
assert.equal(musicIssue.fixLabel, "music cue setup");

assert.ok(html.includes('link.className = "fix-link"'), "intro/outro fix links are class-tagged");

console.log("intro-outro-builder: review states evaluate cleanly");
