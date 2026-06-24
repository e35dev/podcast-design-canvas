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
assert.equal(
  handoff.hrefWithState("./app.html#speaker-role-mapping?path=episode", interview),
  "./app.html#speaker-role-mapping?path=episode&layout=interview&slots=host%2Cguest&broll=placed",
  "handoff href flags optional b-roll without adding it to required slots",
);
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
const queryOnlyBroll = handoff.load(null, "?path=episode&layout=interview&slots=host,guest&broll=placed");
assert.deepEqual(
  queryOnlyBroll.optionalBroll,
  { slot: "broll", label: "Optional b-roll", name: "", sig: "" },
  "the URL broll flag is preserved when storage is unavailable",
);
assert.equal(
  handoff.placementList(queryOnlyBroll),
  "Host, Guest, Optional b-roll",
  "query-only layout handoff still tells role mapping that optional b-roll was placed",
);
assert.equal(
  handoff.queryForState(queryOnlyBroll),
  "layout=interview&slots=host%2Cguest&broll=placed",
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
