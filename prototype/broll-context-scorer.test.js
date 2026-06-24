"use strict";

// Guards the context scorer that drives weak-context B-roll review (#757).
// Run with: `node prototype/broll-context-scorer.test.js`

const assert = require("assert");

const scorer = require("./broll-context-scorer.js");

const strong = scorer.scoreContext("Guest Marcus walks through the Acme product launch workflow and customer demo.");
assert.equal(strong.weak, false, "named speaker, topic, and company context is strong enough");
assert.ok(strong.score >= 42, "strong context clears the review threshold");

const weak = scorer.scoreContext("They mention it briefly and move on.");
assert.equal(weak.weak, true, "generic transcript snippets are weak context");
assert.match(weak.reason, /speaker, topic, or named reference/, "weak reason tells the creator what to add");

const annotated = scorer.annotateMoments(
  [
    { id: "m1", timecode: "08:15", reason: "Product launch" },
    { id: "m2", timecode: "18:42", reason: "Guest names their company" },
  ],
  {
    m1: "Host Dana introduces the product launch demo.",
    m2: "They mention it briefly.",
  },
);
assert.equal(annotated[0].contextWeak, false, "annotated moments keep strong context");
assert.equal(annotated[1].contextWeak, true, "annotated moments flag weak context");

const href = scorer.socialContextHref(annotated[1]);
assert.ok(href.startsWith("social-context-intake.html?"), "weak context routes to social context intake");
assert.ok(href.includes("moment=18%3A42"), "handoff carries the moment timestamp");
assert.ok(href.includes("reason="), "handoff carries the creator-facing reason");

console.log("broll context scorer: weak-context classification and handoff payload verified");
