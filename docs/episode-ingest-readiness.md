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

## Maintainer Acceptance Notes

Accept work that makes import, upload, sync confidence, and speaker assignment feel obvious before editing starts. Close work that turns ingest into a technical diagnostics page or blocks creators on issues that do not affect the visible final episode.
