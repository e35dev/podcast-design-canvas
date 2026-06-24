"use strict";

// Guards the contextual B-roll context scorer used by the connected prototype.
// Run with: `node prototype/broll-context-scorer.test.js`

const assert = require("assert");
const scorer = require("./broll-context-scorer.js");

const classified = scorer.classifySegments([
  {
    id: "strong",
    timestamp: "03:12",
    speaker: "Priya",
    topic: "Priya explains Northwind Labs launch",
    transcript: "Priya explains how Northwind Labs launched the migration dashboard.",
  },
  {
    id: "weak",
    timestamp: "14:22",
    topic: "Guest mentions that thing",
    transcript: "That thing from earlier probably matters here.",
  },
]);

assert.equal(classified[0].source, "transcript", "specific speaker/topic segments stay normal transcript moments");
assert.equal(classified[1].source, "weak-transcript", "vague transcript segments are marked for context review");
assert.ok(
  classified[1].contextReason.includes("speaker reference"),
  "weak-context reason explains what social context should fill in",
);
assert.equal(
  scorer.socialContextHref(classified[1]),
  "social-context-intake.html?moment=14%3A22&reason=speaker+reference%2Cnamed+entity",
  "weak-context handoff carries the moment timestamp and missing context reason",
);

const repeats = scorer.titleRepeatFlags([
  { type: "title", decision: "approved" },
  { type: "title", decision: "adjusted" },
  { type: "quote", decision: "approved" },
]);
assert.deepEqual(repeats, [false, true, false], "adjacent live title cards are flagged as repeats");

console.log("broll context scorer: weak context and title repeats are classified");
