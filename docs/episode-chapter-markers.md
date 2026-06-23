# Episode Chapter Markers

Chapter markers should give a long-form episode a clear table of contents that creators can review quickly and carry straight into export and publishing.

## User Goal

A creator should be able to confirm where each chapter starts, give it a plain-language title, and trust those chapters in the finished player without hand-editing a timeline.

## Relationship To Episode Review

Chapter review should connect to the surfaces chapters affect:

- segment structure from `docs/show-segment-system.md`
- long-form navigation from `docs/long-form-navigation.md`
- transcript search from `docs/transcript-search-navigation.md`
- title cards from `docs/contextual-title-cards.md`
- metadata and publishing from `docs/episode-metadata-publishing.md`
- show notes from `docs/show-notes-assembly.md`
- export warnings in `docs/export-readiness-review.md`

## Chapter Approach

Chapter review is outline first: creators work with named conversation transitions and a calm chapter list—not timecode tracks or marker-encoding tools.

## Where Chapters Come From

Chapters should start from context the workspace already has:

- segment structure from `docs/show-segment-system.md`
- speaker and topic shifts surfaced during review
- title moments from `docs/long-form-navigation.md`
- guest introductions and sponsor reads
- the creator's own added marks

Suggested chapters are a starting point. The creator stays in control of which ones appear.

## Creator Controls

Use simple controls:

- add a chapter at the current moment
- rename a chapter in plain language
- merge two chapters that are too short
- remove a suggested chapter
- nudge a start point earlier or later

Avoid exposing timecode formats, marker tracks, or chapter encoding details. The creator works with named moments, not technical markers.

## Review States

The product should use chapter status to drive review and export readiness:

- **ready** — include the chapter in metadata, show notes, and export package; clear only chapter-related warnings for that marker
- **needs a title** — keep the chapter in review until the creator adds a plain-language title
- **starts mid-sentence** — surface the boundary issue and let the creator nudge the start point with playback context
- **too short to keep** — suggest merge with the neighboring chapter without removing unrelated metadata warnings
- **overlaps the next chapter** — block export for chapter-dependent destinations until the overlap is resolved or ignored with consequence shown
- **removed for export** — omit a suggested chapter from the export package without clearing unrelated caption or sponsor warnings

Each state should describe what happens in metadata, navigation, and export readiness—not only the label on the chapter.

## Scale Rules

Chapters should stay readable on hour-plus episodes:

- keep a calm default count rather than a chapter every minute
- show the chapter list as a short outline first
- preserve titles when an episode is re-rendered

## Publish Readiness

Confirmed chapters flow forward into the publish path: they populate the chapter fields in `docs/episode-metadata-publishing.md`, appear in `docs/publish-checklist.md` Checklist Item Mapping and Review Approvals, and surface in `docs/export-readiness-review.md` Chapter Marker Warnings when chapter issues would affect export.

## Maintainer Acceptance Notes

Accept work that turns existing episode structure into a calm, reviewable chapter outline creators can carry straight into export and publishing. Close work that exposes timecode or marker mechanics, floods an hour-plus episode with a chapter every minute, rebuilds a separate timeline editor, or clears unrelated publish-readiness warnings when a suggested chapter is removed.
