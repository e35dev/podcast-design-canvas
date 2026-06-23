# Episode Ingest Readiness

The first setup screen should make separate podcast recordings feel organized before any visual design choices happen.

## User Goal

A creator importing Riverside-style synced recordings should be able to confirm every speaker track, fix obvious assignment issues, and continue with confidence that the episode is ready for styling and editing.

## Import Sources

Support clear source choices without exposing production mechanics:

- paste a Riverside share link
- upload separate synced host and guest video files
- add a missing speaker file before continuing
- replace a mismatched track without restarting the setup

The setup should describe sources in creator language: speaker video, episode audio, transcript, and social links. Avoid asking users to reason about manifests, encoders, timecodes, or pipeline stages.

## Speaker Buckets

Every imported track should resolve into a visible speaker bucket:

- Host
- Guest 1
- Guest 2
- Co-host
- Producer or off-camera voice

Each bucket should show the speaker name when known, a thumbnail or waveform preview, and a short confidence state such as ready, needs name, duplicate audio, or missing video.

## Readiness Checks

Before the user picks a preset style, the product should flag only issues that would affect the finished episode:

- one or more speaker buckets are empty
- two buckets appear to contain the same recording
- a track has audio but no video
- the episode has a major duration mismatch across speaker files
- transcript generation has not started or has failed

Warnings should include the next creator action, not an internal error. For example: "Guest 1 looks 12 minutes shorter than Host. Replace the file or continue with a visible gap."

## Issue Resolution Mapping

Ingest readiness should point creators to where each flagged issue is actually fixed instead of resolving media, sync, or context problems inside the setup screen. This keeps the first screen focused on assignment confidence and avoids turning ingest into a separate diagnostics queue.

Each readiness check maps to the spec that owns the fix:

| Readiness issue | Where the creator fixes it | Relevant section |
| --- | --- | --- |
| empty speaker bucket | `docs/source-media-health.md` | Health Checks, Readiness Summary |
| two buckets share the same recording | `docs/speaker-sync-repair.md` | Detected Issues, Repair Actions |
| track has audio but no video | `docs/source-media-health.md` | Health Checks, Readiness Summary |
| duration mismatch across speaker files | `docs/speaker-sync-repair.md` | Detected Issues, Repair Actions |
| transcript not started or failed | `docs/source-media-health.md` | Health Checks |
| speaker bucket still needs a name or link | `docs/social-context-intake.md` | Accepted Inputs, Review States |

Each warning should hand off to the owning surface with the creator action attached, such as replace the file, align the track, or assign a missing link. Issues that do not affect the visible final episode should not block continuing to preset styling.

## Maintainer Acceptance Notes

Accept work that makes import, upload, sync confidence, and speaker assignment feel obvious before editing starts. Close work that turns ingest into a technical diagnostics page or blocks creators on issues that do not affect the visible final episode.
