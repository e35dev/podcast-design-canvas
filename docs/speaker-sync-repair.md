# Speaker Sync Repair

Sync repair should help creators fix visible speaker timing problems without exposing them to timeline engineering.

## User Goal

A creator should be able to notice when separate speaker tracks are out of sync, understand the viewer-facing problem, and apply a simple repair before styling or export.

## Detected Issues

Flag issues that affect the finished episode:

- speaker video starts late
- speaker audio starts before video
- one track drifts over time
- a guest track ends early
- duplicate audio appears in two tracks
- transcript speaker attribution no longer matches the video

Warnings should describe the visible or audible problem, not internal timing data.

## Review States

Use simple, creator-facing states so sync issues stay clear during ingest:

- detected — the product found a likely sync problem on a track or moment
- previewed — the creator has seen the proposed repair on a real moment
- applied — the repair is in place for this episode
- applied broadly — the same repair was carried to similar moments after the creator confirmed the pattern
- accepted — the creator kept the current timing and marked the difference as intentional
- ignored — not relevant for this episode

States should describe what the creator sees in preview and what happens next, not raw timing offsets. Issues that would still affect the finished episode should remain visible until the creator applies, accepts, or ignores them.

## Repair Actions

Use simple actions:

- align to host
- trim leading silence
- add visible gap
- replace track
- mark as audio-only
- ignore for this episode

The product should preview the repair on a real moment before applying it across the episode.

## Review Points

After repair, show a small set of checkpoints:

- episode start
- first guest response
- midpoint
- final speaker exchange
- any detected drift point

Creators should not need to manually scrub the full timeline to trust the repair.

Sync issues that would affect the chosen export destination should surface in `docs/export-readiness-review.md` Speaker Sync Warnings.

## Maintainer Acceptance Notes

Accept work that makes speaker sync issues understandable and fixable during ingest. Close work that surfaces raw timecode diagnostics, hides sync problems until export, or requires creators to manually align every track.
