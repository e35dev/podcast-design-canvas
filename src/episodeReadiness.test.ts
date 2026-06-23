import assert from "node:assert/strict";
import test from "node:test";
import { evaluateEpisodeReadiness, type SpeakerTrack } from "./episodeReadiness.js";

const baseTrack: SpeakerTrack = {
  id: "host",
  speakerName: "Host",
  role: "host",
  durationSeconds: 3600,
  audioFingerprint: "host-audio",
  hasVideo: true,
  hasAudio: true,
  transcriptStatus: "ready",
};

test("returns ready when required tracks are healthy", () => {
  const readiness = evaluateEpisodeReadiness([baseTrack]);

  assert.equal(readiness.status, "ready");
  assert.deepEqual(readiness.issues, []);
});

test("blocks when a required speaker role is missing", () => {
  const readiness = evaluateEpisodeReadiness([], { requiredRoles: ["host"] });

  assert.equal(readiness.status, "blocked");
  assert.equal(readiness.issues[0]?.code, "missing-speaker");
});

test("flags duplicate audio fingerprints for review", () => {
  const readiness = evaluateEpisodeReadiness([
    baseTrack,
    {
      ...baseTrack,
      id: "guest",
      speakerName: "Guest",
      role: "guest",
      audioFingerprint: "host-audio",
    },
  ]);

  assert.equal(readiness.status, "review");
  assert.equal(readiness.issues.find((issue) => issue.code === "duplicate-audio")?.speakerTrackIds.length, 2);
});

test("flags tracks that are much shorter than the longest track", () => {
  const readiness = evaluateEpisodeReadiness([
    baseTrack,
    {
      ...baseTrack,
      id: "guest",
      speakerName: "Guest",
      role: "guest",
      durationSeconds: 3200,
      audioFingerprint: "guest-audio",
    },
  ]);

  assert.equal(readiness.status, "review");
  assert.equal(readiness.issues.find((issue) => issue.code === "duration-mismatch")?.severity, "review");
});

test("flags unavailable transcripts without blocking ingest", () => {
  const readiness = evaluateEpisodeReadiness([{ ...baseTrack, transcriptStatus: "failed" }]);

  assert.equal(readiness.status, "review");
  assert.equal(readiness.issues[0]?.code, "transcript-unavailable");
});
