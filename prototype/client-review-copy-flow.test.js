"use strict";

// Guards the client review copy publish-prep screen (#583).
// Run with: `node prototype/client-review-copy-flow.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(__dirname, "client-review-copy-flow.html"), "utf8");
const publishNav = fs.readFileSync(path.join(root, "preview", "publish-nav.js"), "utf8");
const shell = fs.readFileSync(path.join(root, "preview", "index.html"), "utf8");

const inlineScript = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map((match) => match[1])
  .find((source) => source.includes("function evaluateReviewCopy"));

assert.ok(inlineScript, "client review screen has an inline behavior model");
new vm.Script(inlineScript);

assert.ok(html.includes('../preview/publish-nav.js"'), "client review screen loads publish navigation");
assert.ok(html.includes('data-publish-step="client-review-copy-flow"'), "client review screen declares its publish step");
assert.ok(publishNav.includes('id: "client-review-copy-flow"'), "publish nav includes client review copy");
assert.ok(shell.includes("../prototype/client-review-copy-flow.html"), "preview shell links to client review copy");

for (const fn of [
  "evaluateReviewCopy",
  "sendReviewCopy",
  "sendNewReviewRound",
  "supersedeReviewCopy",
  "toggleOption",
  "setFeedbackState",
  "renderFeedback",
]) {
  assert.ok(inlineScript.includes(`function ${fn}`), `client review flow defines ${fn}()`);
}

for (const state of ["draft", "awaiting feedback", "changes requested", "ready to publish", "superseded"]) {
  assert.ok(inlineScript.includes(`"${state}"`), `review copy supports ${state} state`);
}

assert.ok(inlineScript.includes("review.feedback = []"), "new review rounds wait for fresh feedback");

for (const owner of [
  "audio-caption-quality-review.html",
  "contextual-broll-moments.html",
  "thumbnail-cover-frame.html",
]) {
  assert.ok(inlineScript.includes(owner), `feedback can open ${owner}`);
  assert.ok(fs.existsSync(path.join(__dirname, owner)), `fix screen exists: ${owner}`);
}

assert.ok(!/<textarea\b/i.test(html), "client review copy avoids free-text areas");
assert.ok(!/<input[^>]+type="text"/i.test(html), "client review copy avoids text inputs");
assert.ok(!/innerHTML/.test(inlineScript), "client review script builds dynamic UI without innerHTML");

console.log("client review copy flow: connected publish-prep behavior is guarded");
