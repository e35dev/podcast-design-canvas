"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const html = fs.readFileSync(path.join(__dirname, "episode-asset-library.html"), "utf8");
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

function makeNode() {
  return {
    className: "",
    textContent: "",
    href: "",
    children: [],
    append(...items) {
      this.children.push(...items);
      return items[items.length - 1];
    },
    appendChild(item) {
      this.children.push(item);
      return item;
    },
    replaceChildren(...items) {
      this.children = items;
    },
    setAttribute() {},
    addEventListener() {},
  };
}

const nodes = {
  "#assets": makeNode(),
  "#filters": makeNode(),
  "#status": makeNode(),
  "#issues": makeNode(),
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
  module: { exports: {} },
};

vm.runInNewContext(script, sandbox);

const { assets, filterAssets, summaryFor, issueFor, availability } = sandbox.module.exports;

assert.equal(assets.length, 5, "asset library ships with representative sample assets");
assert.equal(filterAssets(assets, "available").length, 1, "only approved non-archived assets are available for new use");
assert.equal(filterAssets(assets, "in-use").length, 2, "in-use filter keeps active assets visible");
assert.equal(filterAssets(assets, "needs-decision").length, 3, "needs-decision filter surfaces review and rejected assets");
assert.equal(filterAssets(assets, "archived").length, 1, "archived filter isolates retired reusable assets");

assert.equal(availability(assets[1]), true, "approved suggested assets stay available");
assert.equal(availability(assets[2]), false, "rejected assets are held back from new placements");

const reviewIssue = issueFor(assets[0]);
assert.ok(reviewIssue, "review-state assets surface an issue");
assert.equal(reviewIssue.fixScreen, "guest-profile-reuse.html");
assert.equal(reviewIssue.fixLabel, "guest profile reuse");

const blockedIssue = issueFor(assets[2]);
assert.equal(blockedIssue.tone, "block", "rejected assets surface blocking issues");
assert.equal(blockedIssue.fixScreen, "layout-safe-areas.html");

const summary = summaryFor(filterAssets(assets, "needs-decision"));
assert.equal(summary.overall, "review", "pending approvals keep the library in review");
assert.equal(summary.issueCount, 3, "summary counts all unresolved assets in the filtered set");

assert.ok(html.includes("../preview/reuse-nav.js"), "asset library loads reuse navigation");
assert.ok(html.includes('data-reuse-step="episode-asset-library"'), "asset library declares its reuse step");
assert.ok(html.includes("openLink.href = issue.fixScreen"), "asset library opens owning screens for unresolved assets");

console.log("episode-asset-library: lifecycle and approval states evaluate cleanly");
