# Publish Checklist

The publish checklist should give creators one final, understandable pass before a finished episode leaves the workspace.

## User Goal

A creator should be able to confirm that the episode, metadata, thumbnail, captions, sponsor details, and export package are ready for the chosen destination.

## Relationship To Export Flow

The checklist should summarize readiness from work already captured in the workspace:

- source and sync confidence from `docs/episode-ingest-readiness.md` and `docs/source-media-health.md`
- captions and glossary from `docs/audio-caption-quality-review.md` and `docs/transcript-glossary.md`
- thumbnail selection from `docs/thumbnail-cover-frame.md`
- metadata from `docs/episode-metadata-publishing.md`
- sponsor details from `docs/sponsor-placement-review.md`
- destination defaults from `docs/publish-destination-presets.md`
- unresolved warnings from `docs/export-readiness-review.md`
- review approvals from `docs/review-handoff-summary.md`

The checklist should not duplicate full review screens. Each item should link to the place where the creator can fix it.

## Checklist Items

Include creator-facing checks:

- source media ready
- captions reviewed
- glossary corrections applied
- thumbnail selected
- metadata complete
- sponsor disclosure confirmed
- destination preset selected
- export warnings resolved or ignored
- review approvals complete
- final package generated

Each item should explain why it matters for the selected destination and open the relevant review surface.

## Status

Use simple states:

- ready
- needs review
- blocked
- ignored
- not needed

The checklist should explain why an item matters for the selected destination. Optional items must not block every show.

## Completion

When the checklist is complete, the product should show the next best action:

- export final package
- publish to destination
- send review copy
- download archive
- start next episode

Completed exports should hand off to `docs/export-package-handoff.md`.

## Maintainer Acceptance Notes

Accept work that gives creators confidence before final publishing. Close work that duplicates raw pipeline status, hides ignored warnings, or makes optional items feel mandatory for every show.
