"use strict";

// Guards the layout-first handoff state shared by the start page and role mapping.
// Run with: `node preview/layout-handoff.test.js`

const assert = require("assert");

const handoff = require("./layout-handoff.js");

function zone(slot, name, filled = true, sig = "") {
  return {
    dataset: { slot, fileName: name, fileSig: sig },
    classList: {
      contains(className) {
        return className === "filled" && filled;
      },
    },
  };
}

const interview = handoff.stateFromZones("interview", [
  zone("host", "host-cam.mp4"),
  zone("guest", "guest-cam.mp4"),
  zone("broll", "intro-card.mp4"),
]);

assert.deepEqual(
  interview.slots.map((slot) => [slot.slot, slot.name, slot.role]),
  [
    ["host", "host-cam.mp4", "host"],
    ["guest", "guest-cam.mp4", "guest"],
  ],
  "interview handoff keeps required speaker slots separate from optional b-roll",
);
assert.equal(interview.optionalBroll.name, "intro-card.mp4", "optional b-roll is carried beside required slots");
const interviewHref = handoff.hrefWithState("./app.html#speaker-role-mapping?path=episode", interview);
const interviewParams = new URLSearchParams(interviewHref.split("?")[1]);
assert.equal(interviewHref.split("?")[0], "./app.html#speaker-role-mapping", "handoff keeps the role-mapping target");
assert.equal(interviewParams.get("path"), "episode", "handoff keeps the episode path");
assert.equal(interviewParams.get("layout"), "interview", "handoff keeps the selected layout");
assert.equal(interviewParams.get("slots"), "host,guest", "handoff keeps required slots separate from optional b-roll");
assert.equal(interviewParams.get("broll"), "placed", "handoff href flags optional b-roll without adding it to required slots");
assert.equal(
  handoff.completeSlotQueryForLayout("interview", "host,guest,broll"),
  "host,guest",
  "shared route validation keeps required slots and excludes optional b-roll",
);
assert.equal(
  handoff.completeSlotQueryForLayout("panel", "host,guest"),
  "",
  "shared route validation rejects incomplete layout-start handoffs",
);

const stored = {};
const storage = {
  setItem(key, value) {
    stored[key] = value;
  },
  getItem(key) {
    return stored[key] || null;
  },
  removeItem(key) {
    delete stored[key];
  },
};
handoff.save(storage, interview);
assert.equal(
  handoff.load(storage, "?path=episode&layout=interview&slots=host,guest&broll=placed").slots[0].name,
  "host-cam.mp4",
  "matching stored handoff restores the placed file names for the current layout-start URL",
);
assert.equal(
  handoff.load(storage, "?path=episode&layout=interview&slots=host,guest&broll=placed").optionalBroll.name,
  "intro-card.mp4",
  "stored optional b-roll is restored when the URL carries broll=placed",
);
const queryOnlyBroll = handoff.load(null, `?path=episode&${handoff.queryForState(interview)}`);
assert.deepEqual(
  queryOnlyBroll.optionalBroll,
  { slot: "broll", label: "Optional b-roll", name: "intro-card.mp4", sig: "" },
  "the query-only handoff preserves the optional b-roll file name when storage is unavailable",
);
assert.equal(
  handoff.placementList(queryOnlyBroll),
  "Host (host-cam.mp4), Guest (guest-cam.mp4), Optional b-roll (intro-card.mp4)",
  "query-only layout handoff keeps the full placed-video summary, including optional b-roll",
);
assert.equal(
  new URLSearchParams(handoff.queryForState(queryOnlyBroll)).get("broll"),
  "placed",
  "query-only optional b-roll state can round-trip through handoff URLs",
);
handoff.clear(storage);
assert.equal(
  handoff.load(storage, "?path=episode&layout=interview&slots=host,guest").slots[0].name,
  "Host video",
  "cleared storage no longer restores stale file names for the same layout-start URL",
);
assert.equal(storage.getItem(handoff.STORAGE_KEY), null, "clear removes the stored layout handoff");
handoff.save(storage, interview);
assert.equal(
  handoff.load(storage, "?path=episode&layout=solo&slots=host").layout,
  "solo",
  "fresh query handoff wins when stored state is for another layout",
);
assert.equal(
  handoff.load(storage, "?path=episode"),
  null,
  "stored handoff is not reused for a generic episode-flow role mapping URL",
);
assert.equal(
  handoff.load(storage, "?path=episode&layout=panel&slots=host,guest"),
  null,
  "invalid query slots are rejected instead of falling back to stale stored state",
);
assert.equal(
  handoff.placementList(handoff.load(storage, "?path=episode&layout=panel&slots=host,guest,guest-b&broll=placed")),
  "Host, Guest, Guest 2, Optional b-roll",
  "a stale stored layout does not erase the URL's placed optional b-roll flag",
);

const reorderedPlacement = handoff.stateFromZones("interview", [
  zone("guest", "guest-cam.mp4"),
  zone("host", "host-cam.mp4"),
]);
handoff.save(storage, reorderedPlacement);
assert.equal(
  handoff.load(storage, "?path=episode&layout=interview&slots=host,guest").slots.find((slot) => slot.slot === "host").name,
  "host-cam.mp4",
  "stored placement is restored even when the URL lists the same slots in a different order",
);
handoff.clear(storage);

const punctuationSig = "name:100% final, guest:cut.mp4|size:10|mtime:5";
const punctuationState = handoff.stateFromSlots("interview", [
  { slot: "host", name: "100% final, host:cut.mp4", sig: "name:100% final, host:cut.mp4|size:9|mtime:4" },
  { slot: "guest", name: "100% final, guest:cut.mp4", sig: punctuationSig },
]);
const punctuationQuery = handoff.queryForState(punctuationState);
const punctuationParams = new URLSearchParams(punctuationQuery);
assert.ok(
  punctuationParams.get("placements").includes("100% final, guest:cut.mp4"),
  "placement identities are stored as decoded JSON, not delimiter-split fields",
);
const punctuationRoundTrip = handoff.load(null, `?path=episode&${punctuationQuery}`);
assert.equal(
  punctuationRoundTrip.slots.find((slot) => slot.slot === "guest").sig,
  punctuationSig,
  "query-only handoff preserves recording identity with percent, comma, and colon characters",
);
assert.equal(
  punctuationRoundTrip.slots.find((slot) => slot.slot === "host").name,
  "100% final, host:cut.mp4",
  "query-only handoff preserves carried file names without session storage",
);
assert.equal(
  handoff.load(null, "?path=episode&layout=interview&slots=host,guest&placements=%E0%A4%A").slots[0].sig,
  "",
  "malformed placement JSON falls back to slot-only handoff instead of throwing",
);

handoff.save(storage, interview);
const fresherQueryState = handoff.stateFromZones("interview", [
  zone("host", "fresh-host.mp4", true, "name:fresh-host.mp4|size:5|mtime:1"),
  zone("guest", "fresh-guest.mp4", true, "name:fresh-guest.mp4|size:6|mtime:2"),
  zone("broll", "fresh-intro.mp4", true, "name:fresh-intro.mp4|size:7|mtime:3"),
]);
const fresherQuery = handoff.queryForState(fresherQueryState);
const fresherLoad = handoff.load(storage, `?path=episode&${fresherQuery}`);
assert.equal(
  fresherLoad.slots.find((slot) => slot.slot === "host").name,
  "fresh-host.mp4",
  "query-carried placement names win over stale stored handoff data for the same layout slots",
);
assert.equal(
  fresherLoad.optionalBroll.name,
  "fresh-intro.mp4",
  "query-carried optional b-roll identity wins over stale stored handoff data",
);

const panelTracks = handoff.tracksFromState(
  handoff.stateFromSlots("panel", [{ slot: "host" }, { slot: "guest" }, { slot: "guest-b" }]),
  [],
);
assert.deepEqual(
  panelTracks.map((track) => [track.name, track.role]),
  [
    ["Host video", "host"],
    ["Guest video", "guest"],
    ["Guest 2 video", "guest"],
  ],
  "role mapping can seed tracks from the selected layout slots",
);
// Carried tracks must start unconfirmed so the role-mapping gate can't read "ready" before the
// creator reviews anything — the host is no longer auto-confirmed.
assert.ok(
  panelTracks.every((track) => track.decision === "suggested"),
  "every carried track (host included) starts as a suggestion, not auto-confirmed",
);
const soloTracks = handoff.tracksFromState(handoff.stateFromSlots("solo", [{ slot: "host" }]), []);
assert.equal(
  soloTracks[0].decision,
  "suggested",
  "a solo layout's host track is suggested, so role mapping cannot auto-pass with zero review",
);
assert.deepEqual(
  handoff.assignedSourceCounts([
    { name: "Host", role: "host", sig: "same" },
    { name: "Unmapped", role: "", sig: "same" },
    { name: "Mystery", role: "unknown", sig: "same" },
    { name: "Guest", role: "guest", sig: "other" },
  ], (track) => ["host", "guest"].includes(track.role)),
  { same: 1, other: 1 },
  "source counting can ignore unassigned or invalid role rows before duplicate checks",
);
assert.deepEqual(
  handoff.assignedSourceNames([
    { name: "Host", role: "host", sig: "same" },
    { name: "Unmapped", role: "", sig: "same" },
    { name: "Guest", role: "guest", sig: "same" },
  ], "same", (track) => ["host", "guest"].includes(track.role)),
  ["Host", "Guest"],
  "source name rollups only list assigned speaker rows that share the recording",
);

assert.equal(handoff.stateFromSlots("panel", [{ slot: "host" }, { slot: "guest" }]), null);
assert.equal(handoff.stateFromSlots("unknown", [{ slot: "host" }]), null);

assert.equal(
  handoff.placementList(interview),
  "Host (host-cam.mp4), Guest (guest-cam.mp4), Optional b-roll (intro-card.mp4)",
  "placement list shows optional b-roll when the creator placed it on the layout-first canvas",
);
assert.equal(
  handoff.placementList(handoff.stateFromSlots("panel", [{ slot: "host" }, { slot: "guest" }, { slot: "guest-b" }])),
  "Host, Guest, Guest 2",
  "placement list falls back to slot labels when no real file name carried over",
);
assert.equal(handoff.placementList(null), "", "placement list is empty without handoff state");

console.log("layout handoff: state, URL, storage, and role-track mapping verified");
