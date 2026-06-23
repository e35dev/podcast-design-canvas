# Publish Checklist

The publish checklist should give creators one final, understandable pass before a finished episode leaves the workspace.

## User Goal

A creator should be able to confirm that the episode, metadata, thumbnail, captions, sponsor details, and export package are ready for the chosen destination.

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

Each item should link to the place where it can be fixed.

## Review Approvals

When `review approvals complete` appears on the checklist, it should summarize sign-off from the review flows already defined elsewhere rather than introducing a separate approval queue.

Track only the areas that affect the chosen destination:

- host or producer review from `docs/client-review-copy-flow.md`
- guest name and link accuracy from `docs/episode-metadata-publishing.md`
- caption and glossary corrections from `docs/transcript-glossary.md`
- sponsor placement and disclosure from `docs/sponsor-placement-review.md`
- b-roll, overlays, and title moments from `docs/contextual-broll-moments.md`
- thumbnail or cover frame from `docs/thumbnail-cover-frame.md`
- chapter markers and metadata from `docs/episode-metadata-publishing.md`

Use simple team-facing states:

- not requested
- waiting
- changes requested
- approved
- skipped

Each approval should show who changed the state, when it changed, and any short note left with the decision. Teams and agencies can require approvals before final export; solo-host workflows should be able to skip areas that do not apply without extra project management.

Unresolved approvals should link back to the exact moment, metadata field, or review copy described in `docs/review-handoff-summary.md`.

## Status

Use simple states:

- ready
- needs review
- blocked
- ignored
- not needed

The checklist should explain why an item matters for the selected destination.

## Completion

When the checklist is complete, the product should show the next best action:

- export final package
- publish to destination
- send review copy
- download archive
- start next episode

## Maintainer Acceptance Notes

Accept work that gives creators confidence before final publishing. Close work that duplicates raw pipeline status, hides ignored warnings, or makes optional items feel mandatory for every show.
