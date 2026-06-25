"use strict";

const assert = require("assert");
const setup = require("./episode-setup-state.js");

const blank = setup.createDefaultState();
assert.equal(blank.sourceLoaded, false, "default setup starts unloaded");
assert.equal(setup.isComplete(blank), false, "default setup is incomplete before any source is loaded");

const loaded = setup.applySourceSample(blank, "recording-link");
assert.equal(loaded.sourceLoaded, true, "loading a source marks the setup as loaded");
assert.equal(setup.isComplete(loaded), true, "the sample recording-link path is complete after import");

const duplicate = setup.normalize(loaded);
duplicate.tracks[1].bucket = "host";
assert.equal(
  setup.isComplete(duplicate),
  false,
  "duplicating a required speaker bucket blocks continuing",
);
assert.ok(
  setup.issues(duplicate).some((issue) => /assigned twice/.test(issue.title)),
  "duplicate speaker-bucket assignments surface a creator-facing issue",
);

const summary = setup.summary(loaded);
assert.equal(summary.sourceLabel, "Riverside recording link", "summary exposes the selected source path");
assert.equal(summary.trackCount, 3, "summary counts the carried setup tracks");
assert.equal(summary.socialCount, 2, "summary counts attached social links");

const fallback = [
  {
    id: "fallback",
    name: "Host",
    speakerName: "Fallback Host",
    role: "host",
    duration: 120,
    audioKey: "host-audio",
    hasVideo: true,
    transcript: "ready",
    socialLink: "",
    sourceLabel: "",
  },
];
const readinessTracks = setup.readinessTracksFromState(loaded, fallback);
assert.deepEqual(
  readinessTracks.map((track) => track.name),
  ["Host", "Guest 1", "Guest 2"],
  "episode readiness inherits the speaker buckets from setup",
);
assert.equal(
  readinessTracks[0].socialLink,
  "https://x.com/danabrooks",
  "episode readiness carries social links from setup",
);
assert.equal(
  readinessTracks[0].sourceLabel,
  "Dana_Brooks_Host.mov",
  "episode readiness carries the imported source label from setup",
);

console.log("episode setup state: source loading, gating, and readiness handoff verified");
