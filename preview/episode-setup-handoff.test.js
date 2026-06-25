"use strict";

// Unit tests for the guided episode setup handoff helper (#1326 / #584).
// Run with: `node preview/episode-setup-handoff.test.js`

const assert = require("assert");
const handoff = require("./episode-setup-handoff.js");

const completeRaw = {
  sourceType: "uploaded-files",
  speakers: [
    { role: "host", name: "Dana Brooks", social: "https://example.com/dana" },
    { role: "guest-1", name: "Marcus Lee" },
  ],
};

// --- completeness gate ---------------------------------------------------------------------

assert.ok(handoff.isComplete(completeRaw), "a named, role-assigned setup is complete");

assert.ok(!handoff.isComplete(null), "no setup is not complete");
assert.ok(
  !handoff.isComplete({ sourceType: "uploaded-files", speakers: [] }),
  "a setup with no speakers is not complete",
);
assert.ok(
  !handoff.isComplete({ sourceType: "mystery", speakers: [{ role: "host", name: "Dana" }] }),
  "an unknown source type is not complete",
);
assert.ok(
  !handoff.isComplete({ sourceType: "recording-link", speakers: [{ role: "host", name: "" }] }),
  "an unnamed speaker blocks the handoff",
);
assert.ok(
  !handoff.isComplete({ sourceType: "recording-link", speakers: [{ role: "", name: "Dana" }] }),
  "an unassigned speaker blocks the handoff",
);
assert.ok(
  !handoff.isComplete({
    sourceType: "recording-link",
    speakers: [
      { role: "host", name: "Dana" },
      { role: "host", name: "Marcus" },
    ],
  }),
  "two speakers in the same role is not a complete setup",
);

// --- normalization -------------------------------------------------------------------------

const state = handoff.stateFromRaw(completeRaw);
assert.equal(state.sourceLabel, "Uploaded speaker files", "source type resolves to its label");
assert.equal(state.speakers.length, 2, "complete speakers are kept");
assert.equal(state.speakers[0].role, "host", "speakers are returned in role order (host first)");
assert.equal(state.speakers[0].roleLabel, "Host", "role label is attached");
assert.equal(state.speakers[1].social, undefined, "a speaker with no link carries no social field");

const trimmedState = handoff.stateFromRaw({
  sourceType: "recording-link",
  speakers: [{ role: "guest-1", name: "  Priya Shah  ", social: "  https://x.test/priya  " }],
});
assert.equal(trimmedState.speakers[0].name, "Priya Shah", "speaker names are trimmed");
assert.equal(trimmedState.speakers[0].social, "https://x.test/priya", "social links are trimmed");

const orderState = handoff.stateFromRaw({
  sourceType: "uploaded-files",
  speakers: [
    { role: "guest-2", name: "Priya" },
    { role: "host", name: "Dana" },
    { role: "guest-1", name: "Marcus" },
  ],
});
assert.deepStrictEqual(
  orderState.speakers.map((s) => s.role),
  ["host", "guest-1", "guest-2"],
  "speakers are sorted into host / guest 1 / guest 2 order",
);

// --- query round-trip ----------------------------------------------------------------------

const query = handoff.queryForState(completeRaw);
assert.ok(query.includes("source=uploaded-files"), "query carries the source type");
const roundTripped = handoff.stateFromQuery(`?${query}`);
assert.ok(roundTripped, "a complete setup round-trips through the query string");
assert.equal(roundTripped.speakers[0].name, "Dana Brooks", "speaker names survive the query round-trip");
assert.equal(
  roundTripped.speakers[0].social,
  "https://example.com/dana",
  "social links survive the query round-trip",
);
assert.equal(handoff.queryForState({ sourceType: "x", speakers: [] }), "", "an incomplete setup makes no query");
assert.equal(handoff.stateFromQuery("?source=uploaded-files"), null, "a query with no speakers loads nothing");

const href = handoff.hrefWithState("episode-readiness.html?path=ingest", completeRaw);
assert.ok(href.startsWith("episode-readiness.html?path=ingest&"), "hrefWithState preserves the existing query");
assert.ok(href.includes("source=uploaded-files"), "hrefWithState appends the setup handoff");

const hashHref = handoff.hrefWithState("../preview/app.html#episode-readiness?path=ingest", completeRaw);
assert.ok(
  hashHref.startsWith("../preview/app.html#episode-readiness?"),
  "hrefWithState merges into a hash route",
);
assert.ok(hashHref.includes("source=uploaded-files"), "hash route handoff carries the source type");

// --- storage save / load -------------------------------------------------------------------

function memoryStorage() {
  const map = new Map();
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
    removeItem(key) {
      map.delete(key);
    },
  };
}

const storage = memoryStorage();
handoff.save(storage, completeRaw);
const stored = handoff.load(storage, "");
assert.ok(stored, "a saved complete setup loads back from storage");
assert.equal(stored.speakers.length, 2, "stored speakers are restored");

handoff.save(storage, { sourceType: "x", speakers: [] });
assert.ok(handoff.load(storage, ""), "an incomplete save does not overwrite a stored complete setup");

handoff.clear(storage);
assert.equal(handoff.load(storage, ""), null, "clearing removes the stored setup");

// load prefers the query handoff over stored state
handoff.save(storage, completeRaw);
const fromQuery = handoff.load(storage, `?${handoff.queryForState({
  sourceType: "recording-link",
  speakers: [{ role: "host", name: "Solo Host" }],
})}`);
assert.equal(fromQuery.sourceType, "recording-link", "load prefers the query handoff over storage");
assert.equal(fromQuery.speakers.length, 1, "query handoff speakers win over stored speakers");

// --- summary -------------------------------------------------------------------------------

const lines = handoff.summaryLines(completeRaw);
assert.equal(lines[0], "Source: Uploaded speaker files", "summary opens with the source line");
assert.ok(
  lines.some((line) => line.includes("Host: Dana Brooks") && line.includes("https://example.com/dana")),
  "summary names the host with their social link",
);
assert.ok(
  lines.some((line) => line === "Guest 1: Marcus Lee"),
  "summary names a guest without a link cleanly",
);
assert.deepStrictEqual(handoff.summaryLines(null), [], "an incomplete setup has no summary");

console.log("episode setup handoff: gate, normalization, query round-trip, storage, and summary verified");
