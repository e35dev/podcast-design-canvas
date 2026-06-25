"use strict";

// Guards the shared episode-setup handoff helper: the single completeness gate (source +
// every speaker named and uniquely roled), the sessionStorage + query-string carry, and the
// creator-facing summaries the next step renders.
// Run with: `node preview/episode-setup-handoff.test.js`

const assert = require("assert");

const handoff = require("../preview/episode-setup-handoff.js");

function fakeStorage() {
  const map = {};
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(map, key) ? map[key] : null;
    },
    setItem(key, value) {
      map[key] = String(value);
    },
    removeItem(key) {
      delete map[key];
    },
  };
}

const complete = {
  sourceType: "link",
  speakers: [
    { name: "Dana Brooks", role: "host", social: "https://x.com/danabrooks" },
    { name: "Marcus Lee", role: "guest-1", social: "" },
  ],
};

// --- Incomplete-setup gating -------------------------------------------------
assert.strictEqual(handoff.normalize(null), null, "null setup is incomplete");
assert.strictEqual(
  handoff.normalize({ sourceType: "", speakers: complete.speakers }),
  null,
  "a setup with no chosen source path is incomplete",
);
assert.strictEqual(
  handoff.normalize({ sourceType: "nonsense", speakers: complete.speakers }),
  null,
  "an unknown source type is rejected",
);
assert.strictEqual(
  handoff.normalize({ sourceType: "link", speakers: [] }),
  null,
  "a setup with no speakers is incomplete",
);
assert.strictEqual(
  handoff.normalize({ sourceType: "link", speakers: [{ name: "", role: "host" }] }),
  null,
  "a speaker without a name keeps the setup incomplete",
);
assert.strictEqual(
  handoff.normalize({ sourceType: "link", speakers: [{ name: "Dana", role: "" }] }),
  null,
  "a speaker without a role keeps the setup incomplete",
);

// --- Role assignment / duplicates --------------------------------------------
assert.strictEqual(
  handoff.normalize({
    sourceType: "link",
    speakers: [
      { name: "Dana", role: "host" },
      { name: "Marcus", role: "host" },
    ],
  }),
  null,
  "two speakers in the same role keep the setup incomplete",
);
assert.ok(
  handoff.normalize({
    sourceType: "upload",
    speakers: [
      { name: "Dana", role: "host" },
      { name: "Marcus", role: "guest-1" },
      { name: "Priya", role: "guest-3" },
    ],
  }),
  "a third guest can be assigned a real Guest 3 role (no role-cap bug)",
);
assert.strictEqual(handoff.isComplete(complete), true, "a fully filled setup is complete");
assert.strictEqual(
  handoff.isComplete({ sourceType: "link", speakers: [{ name: "", role: "host" }] }),
  false,
  "isComplete mirrors the normalize gate",
);

// --- Query-string round-trip -------------------------------------------------
const query = handoff.queryForState(complete);
assert.ok(query.includes("source=link"), "query carries the source type");
assert.ok(query.includes("setup="), "query carries the speaker payload");
const fromQuery = handoff.load(null, "?" + query);
assert.ok(fromQuery, "a complete setup round-trips back from the query string");
assert.strictEqual(fromQuery.sourceType, "link", "source type survives the round-trip");
assert.strictEqual(fromQuery.speakers.length, 2, "every speaker survives the round-trip");
assert.strictEqual(fromQuery.speakers[0].name, "Dana Brooks", "speaker names survive the round-trip");
assert.strictEqual(fromQuery.speakers[0].role, "host", "speaker roles survive the round-trip");
assert.strictEqual(
  fromQuery.speakers[0].social,
  "https://x.com/danabrooks",
  "social links survive the round-trip",
);
assert.strictEqual(handoff.queryForState({ sourceType: "link", speakers: [] }), "", "an incomplete setup has no carry query");

// --- sessionStorage carry ----------------------------------------------------
const storage = fakeStorage();
handoff.save(storage, complete);
const stored = handoff.load(storage, "");
assert.ok(stored, "a saved setup loads back from storage when the URL has none");
assert.strictEqual(stored.speakers[1].name, "Marcus Lee", "stored speakers carry their names");
handoff.save(storage, { sourceType: "link", speakers: [{ name: "", role: "host" }] });
assert.ok(
  handoff.load(storage, ""),
  "an incomplete save never overwrites a previously complete setup",
);
handoff.clear(storage);
assert.strictEqual(handoff.load(storage, ""), null, "clearing storage drops the carried setup");

// --- Creator-facing summaries ------------------------------------------------
assert.strictEqual(handoff.sourceLabel(complete), "Recording link", "sourceLabel resolves the chosen path");
const summary = handoff.sourceSummary(complete);
assert.ok(summary.includes("Recording link"), "source summary names the source path");
assert.ok(summary.includes("2 speakers"), "source summary counts the speakers");
assert.ok(summary.includes("1 with a social link"), "source summary counts attached social links");
const lines = handoff.speakerLines(complete);
assert.deepStrictEqual(
  lines,
  ["Host: Dana Brooks · link", "Guest 1: Marcus Lee"],
  "speaker lines label each speaker by role and flag attached links",
);

console.log("episode setup handoff: completeness gate, query/storage carry, and summaries verified");
