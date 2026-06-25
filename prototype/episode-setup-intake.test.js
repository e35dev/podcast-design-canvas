"use strict";

// Focused coverage for the guided episode setup intake (#1326): incomplete-setup
// gating, speaker-role assignment rules, and the handoff that carries the setup into
// the next preview step. The gate and handoff are pure functions in the shared module,
// so they are tested directly; the screen and the receiving readiness screen are
// checked statically for the wiring that makes the flow real in the browser.
// Run with: `node prototype/episode-setup-intake.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const setup = require("../preview/episode-setup-handoff.js");

function makeStorage() {
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

const issuesOf = (input) => setup.evaluateSetup(input).issues;

// 1) Incomplete setup — the gate blocks until each requirement is met.
assert.deepStrictEqual(
  setup.evaluateSetup({}).complete,
  false,
  "an empty setup cannot continue",
);
assert.ok(issuesOf({}).includes("choose-source"), "no chosen source type is flagged");

assert.ok(
  issuesOf({ sourceType: "recording-link", tracks: [{ bucket: "host", name: "Dana" }] }).includes("recording-link"),
  "a recording-link source needs the link pasted",
);

assert.ok(
  issuesOf({ sourceType: "separate-files", tracks: [] }).includes("no-sources"),
  "at least one source is required",
);

assert.ok(
  issuesOf({
    sourceType: "separate-files",
    tracks: [{ bucket: "", name: "Dana" }],
  }).includes("unassigned-source"),
  "every source must be assigned a speaker role",
);

assert.ok(
  issuesOf({
    sourceType: "separate-files",
    tracks: [{ bucket: "guest-1", name: "Marcus" }],
  }).includes("no-host"),
  "a host must be assigned before continuing",
);

assert.ok(
  issuesOf({
    sourceType: "separate-files",
    tracks: [{ bucket: "host", name: "" }],
  }).includes("missing-name"),
  "every assigned speaker needs a name",
);

// 2) Role assignment — a bucket is single-use, and a valid assignment clears the gate.
assert.ok(
  issuesOf({
    sourceType: "separate-files",
    tracks: [
      { bucket: "host", name: "Dana" },
      { bucket: "host", name: "Priya" },
    ],
  }).includes("duplicate-bucket"),
  "the same speaker role cannot be used twice",
);

const completeInput = {
  sourceType: "separate-files",
  recordingLink: "",
  tracks: [
    { bucket: "host", name: "Dana Brooks", social: "https://example.com/dana" },
    { bucket: "guest-1", name: "Marcus Lee", social: "" },
  ],
};
assert.deepStrictEqual(
  setup.evaluateSetup(completeInput),
  { complete: true, issues: [] },
  "a host plus a named, assigned guest completes the setup",
);

// A recording-link path is complete once the link and a host are present.
assert.ok(
  setup.evaluateSetup({
    sourceType: "recording-link",
    recordingLink: "https://riverside.fm/studio/ep-1",
    tracks: [{ bucket: "host", name: "Dana" }],
  }).complete,
  "a recording-link setup completes with a link and a named host",
);

// 3) Handoff into the next step — the setup persists and reloads with names + links,
// and unassigned sources never leak into the carried speakers.
const handoff = setup.toHandoffState(completeInput);
assert.strictEqual(handoff.speakers.length, 2, "assigned sources become carried speakers");

const storage = makeStorage();
setup.save(storage, handoff);
const reloaded = setup.load(storage, "");
assert.strictEqual(reloaded.sourceType, "separate-files", "source type carries forward");
assert.deepStrictEqual(
  reloaded.speakers.map((s) => `${s.bucket}:${s.name}`),
  ["host:Dana Brooks", "guest-1:Marcus Lee"],
  "speaker roles and names carry forward in order",
);

// The compact query string is an equal-fidelity fallback when storage is unavailable.
const query = setup.queryForState(handoff);
const fromQuery = setup.load(null, `?${query}`);
assert.deepStrictEqual(fromQuery, handoff, "the query fallback round-trips the same setup");

// An unassigned source is dropped from the carried handoff entirely.
const withUnassigned = setup.toHandoffState({
  sourceType: "separate-files",
  tracks: [
    { bucket: "host", name: "Dana" },
    { bucket: "", name: "Side channel" },
  ],
});
assert.strictEqual(withUnassigned.speakers.length, 1, "unassigned sources are not carried forward");

// The human summary names the source type, the assigned speakers, and the social count.
const summary = setup.summary(handoff);
assert.match(summary, /Separate synced files/, "summary names the source type");
assert.match(summary, /Host Dana Brooks/, "summary names the host");
assert.match(summary, /1 social link/, "summary counts the optional social links");

// 4) The intake screen wires the pieces together in the browser.
const intakeHtml = fs.readFileSync(path.join(__dirname, "episode-setup-intake.html"), "utf8");
assert.ok(intakeHtml.includes("episode-setup-handoff.js"), "intake loads the shared setup handoff module");
assert.ok(intakeHtml.includes('"recording-link"') && intakeHtml.includes('"separate-files"'), "intake offers both source paths");
assert.ok(intakeHtml.includes("evaluateSetup"), "intake gates Continue on the shared setup evaluation");
assert.ok(intakeHtml.includes("toHandoffState") && intakeHtml.includes(".save("), "intake persists the setup on continue");
assert.ok(intakeHtml.includes('id="continue"') && intakeHtml.includes("episode-readiness"), "intake continues into episode readiness");
assert.ok(!/innerHTML/.test(intakeHtml), "intake builds its DOM without innerHTML");

// 5) The receiving readiness screen visibly renders the carried setup.
const readinessHtml = fs.readFileSync(path.join(__dirname, "episode-readiness.html"), "utf8");
assert.ok(readinessHtml.includes("episode-setup-handoff.js"), "readiness loads the setup handoff module");
assert.ok(readinessHtml.includes("renderEpisodeSetupHandoff"), "readiness renders the carried setup summary");
assert.ok(readinessHtml.includes('id="episode-setup-handoff"'), "readiness has a slot for the carried setup");

console.log("episode setup intake: gating, role assignment, handoff persistence, and screen wiring verified");
