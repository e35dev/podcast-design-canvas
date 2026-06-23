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

Keep sync status simple and creator-facing:

- needs review — the product flagged a likely sync problem to look at
- fixed — the creator applied a repair and confirmed it on a real moment
- accepted — the creator kept the current timing on purpose

Each state should point to a clear next step, not a raw timing offset.

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
