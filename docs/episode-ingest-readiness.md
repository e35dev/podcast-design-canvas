# Episode Ingest Readiness

The first setup screen should make separate podcast recordings feel organized before any visual design choices happen.

## User Goal

A creator importing Riverside-style synced recordings should be able to confirm every speaker track, fix obvious assignment issues, and continue with confidence that the episode is ready for styling and editing.

## Relationship To Episode Setup

Ingest readiness should connect to the next setup surfaces:

- episode drafts started from `docs/start-from-previous-episode.md`
- speaker roles from `docs/speaker-role-mapping.md`
- social links from `docs/social-context-intake.md`
- source file health from `docs/source-media-health.md`
- sync repair from `docs/speaker-sync-repair.md`
- preset styling from `docs/preset-style-picker.md`
- publish checklist from `docs/publish-checklist.md`
- export warnings in `docs/export-readiness-review.md`

## Ingest Approach

Ingest is organize first: creators should confirm speaker buckets and obvious track problems in creator language, then hand off fixes to the owning surface—not stay on a technical diagnostics page.

If the episode started from `docs/start-from-previous-episode.md`, ingest should reuse the carried-forward speaker buckets as a draft starting point, then make the creator confirm that the new files still belong in those buckets before preset styling continues.

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

Issues that remain unfixed at export should surface in `docs/export-readiness-review.md` Source Media Warnings or Speaker Sync Warnings when they would affect the finished episode.

## Resuming A Partial Import

A creator who leaves before every track is confirmed should be able to return and pick up where they stopped, without re-pasting links, re-uploading finished files, or rebuilding speaker buckets.

When a creator reopens an episode that was not fully confirmed, ingest should restore the buckets, names, and previews that were already in place and point only to what still needs attention:

- keep every already-assigned track in its speaker bucket
- keep names and previews that were already confirmed
- show one quiet inline prompt naming the next unfinished step, such as "Pick up where you left off: Guest 1 still needs a file"

An import should carry exactly one resume status, and only one prompt should appear:

- fresh import — no prior progress to restore; start from the standard import path
- resumable import — prior progress exists and is restored; show the single inline pick-up prompt pointing to the first unfinished bucket
- fully assigned import — every required bucket is already confirmed; show nothing and let the creator continue to preset styling

If no buckets remain unfinished, ingest is treated as fully assigned and shows no resume prompt. The pick-up prompt is a non-blocking inline marker that names the next action only; it never stacks multiple reminders or blocks the screen. Confirming the named step clears the prompt and advances the import status normally.

## Review States

The product should use ingest status to drive setup and handoff behavior:

- **bucket ready** — speaker bucket has the expected track assigned with a clear confidence state; allow continuing to preset styling
- **needs assignment** — empty or uncertain bucket; link to replace the file, add a missing speaker, or confirm the bucket mapping
- **handed off to media health** — route missing, corrupted, or audio-only track issues to `docs/source-media-health.md`
- **handed off to sync repair** — route duplicate audio or duration mismatch issues to `docs/speaker-sync-repair.md`
- **handed off to social context** — route missing name or link issues to `docs/social-context-intake.md`
- **ready for preset styling** — required buckets are assigned and only non-blocking issues remain; continuing does not clear export warnings for unfixed problems that would affect the finished episode

Each state should describe the next creator action and owning surface—not internal pipeline status.

## Creator Controls

Offer simple actions:

- paste a Riverside link or upload synced speaker files
- assign or reassign a track to a speaker bucket
- replace a mismatched file
- add a missing speaker before continuing
- open the linked fix surface for a flagged issue
- continue to preset styling when blocking issues are resolved or accepted with consequence shown

Avoid manifests, encoders, timecodes, or pipeline-stage language in the default ingest path.

## Maintainer Acceptance Notes

Accept work that makes import, upload, sync confidence, and speaker assignment feel obvious before editing starts. Close work that turns ingest into a technical diagnostics page, blocks creators on issues that do not affect the visible final episode, or clears export-readiness warnings just because the creator continued to preset styling.
