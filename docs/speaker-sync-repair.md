# Speaker Sync Repair

Sync repair should help creators fix visible speaker timing problems without exposing them to timeline engineering.

## User Goal

A creator should be able to notice when separate speaker tracks are out of sync, understand the viewer-facing problem, and apply a simple repair before styling or export.

## Relationship To Episode Setup

Sync repair should connect to the ingest and caption path:

- speaker buckets from `docs/episode-ingest-readiness.md`
- speaker roles from `docs/speaker-role-mapping.md`
- source file health from `docs/source-media-health.md`
- speaker attribution from `docs/speaker-attribution-review.md`
- caption review from `docs/audio-caption-quality-review.md`
- publish checklist from `docs/publish-checklist.md`
- export warnings in `docs/export-readiness-review.md`

## Repair Approach

Sync repair is moment first: creators should understand the visible or audible problem, preview the repair on a real moment, and trust a small set of review checkpoints—not scrub the full timeline or read raw timecode data.

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

The product should use sync status to drive repair and export readiness:

- **flagged** — show the affected speaker bucket and moment with a plain-language description of the problem
- **repaired** — apply the chosen repair and refresh attribution or caption confidence only for the affected span through the owning review surface
- **accepted** — keep the current timing when the creator marks the sync difference as intentional; do not clear unrelated caption or attribution warnings
- **needs attribution review** — when sync drift changes who appears to be speaking, hand off to `docs/speaker-attribution-review.md` before treating captions as ready
- **ignored for episode** — keep the track unchanged and stop surfacing the sync suggestion when the creator marks it as not relevant; do not clear unrelated caption or attribution warnings
- **blocked for export** — when visible sync drift would affect the finished episode, keep the item in export readiness until repaired, replaced, or explicitly ignored with consequence shown

Each state should describe what happens to playback, captions, and export readiness—not internal timing labels.

## Creator Controls

Offer simple actions:

- align to host
- trim leading silence
- add visible gap
- replace track
- mark as audio-only
- preview repair at episode start, first guest response, midpoint, final exchange, or a detected drift point
- mark timing as intentional
- ignore for this episode

The product should preview the repair on a real moment before applying it across the episode. Creators should not need to manually scrub the full timeline to trust the repair.

Avoid raw timecode diagnostics, waveform alignment tools, or manual per-track engineering as the default path.

## Maintainer Acceptance Notes

Accept work that makes speaker sync issues understandable and fixable during ingest. Close work that surfaces raw timecode diagnostics, hides sync problems until export, requires creators to manually align every track, or clears unrelated caption or attribution warnings when a sync issue is ignored.
