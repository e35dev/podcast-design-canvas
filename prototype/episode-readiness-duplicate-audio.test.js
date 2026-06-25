"use strict";

// Regression guard: a creator who acknowledges a "speakers appear to share audio"
// review must keep that acknowledgement when the shared-recording group changes
// (a third sharing track is added, or one leaves). The acknowledgement is tracked by
// the issue's `key`; readiness prunes any handed-off key that is no longer active
// (episode-readiness.html, "activeKeys" pruning). If the duplicate-audio key were
// derived from the member-track list, changing the group would change the key and
// silently drop the acknowledgement, re-gating Continue on a duplicate the creator
// already reviewed. Key it on the shared recording instead, so identity is stable.
// Run with: `node prototype/episode-readiness-duplicate-audio.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "prototype", "episode-readiness.html"), "utf8");

// Pull the duplicate-audio issue's key expression out of the source.
const keyMatch = source.match(/key:\s*`duplicate-audio:([^`]*)`/);
assert.ok(keyMatch, "episode readiness still raises a duplicate-audio issue with a key");
const keyExpr = keyMatch[1];

// The key must be the shared recording's identity (audioKey), so it is stable as the
// group grows or shrinks.
assert.ok(
  /\$\{audioKey\}/.test(keyExpr),
  "duplicate-audio issue is keyed on the shared recording (audioKey) for a stable identity",
);

// It must NOT be derived from the member tracks, which changes whenever the group does.
assert.ok(
  !/matches\.map/.test(keyExpr) && !/\.id\b/.test(keyExpr),
  "duplicate-audio key does not depend on the member-track list (which changes with the group)",
);

// The grouping still keys tracks by their shared recording, and the pruning step that
// drops stale acknowledgements is still present — the behaviour this guard relies on.
assert.ok(
  source.includes("fingerprints.set(track.audioKey"),
  "tracks are still grouped by their shared recording (audioKey)",
);
assert.ok(
  /activeKeys\.has\(key\)/.test(source) && /handedOff\.delete\(key\)/.test(source),
  "readiness still prunes acknowledgements whose issue key is no longer active",
);

// The displayed title should still name the current members, so the message stays
// accurate even though the key is stable.
assert.ok(
  /title:\s*`\$\{matches\.map\(\(track\) => track\.name\)\.join\(" and "\)\} appear to share audio`/.test(source),
  "duplicate-audio title still names the current members of the shared-recording group",
);

console.log("episode readiness: duplicate-audio acknowledgement survives shared-recording group changes");
