# Episode Chapter Markers

Chapter markers should give a long-form episode a clear table of contents that creators can review quickly and carry straight into export and publishing.

## User Goal

A creator should be able to confirm where each chapter starts, give it a plain-language title, and trust those chapters in the finished player without hand-editing a timeline.

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

Use simple, creator-facing states:

- ready
- needs a title
- starts mid-sentence
- too short to keep
- overlaps the next chapter

These states should appear in the long-form review surface only when they would affect the finished episode, and they should group rather than flag every chapter equally.

## Scale Rules

Chapters should stay readable on hour-plus episodes:

- keep a calm default count rather than a chapter every minute
- show the chapter list as a short outline first
- preserve titles when an episode is re-rendered

## Publish Readiness

Confirmed chapters flow forward into the publish path: they populate the chapter fields in `docs/episode-metadata-publishing.md`, appear in `docs/publish-checklist.md`, and surface in `docs/export-readiness-review.md` Chapter Marker Warnings when chapter issues would affect export.
