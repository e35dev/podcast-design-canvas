# Publish Checklist

The publish checklist should give creators one final, understandable pass before a finished episode leaves the workspace.

## User Goal

A creator should be able to confirm that the episode, metadata, thumbnail, captions, sponsor details, and export package are ready for the chosen destination.

## Relationship To Export Flow

The checklist should summarize readiness from work already captured in the workspace:

- source and sync confidence from `docs/episode-ingest-readiness.md` and `docs/source-media-health.md`
- captions, speaker attribution, and glossary from `docs/audio-caption-quality-review.md`, `docs/speaker-attribution-review.md`, and `docs/transcript-glossary.md`
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

## Checklist Item Mapping

Each checklist item below maps to an existing spec section:

| Checklist item | Source spec | Relevant section |
| --- | --- | --- |
| source media ready | `docs/episode-ingest-readiness.md`, `docs/source-media-health.md` | Readiness Checks; Health Checks, Readiness Summary |
| captions reviewed | `docs/audio-caption-quality-review.md`, `docs/speaker-attribution-review.md` | Caption Confidence, Caption Style Presets, Review Flow; Review States, Publish Readiness |
| glossary corrections applied | `docs/transcript-glossary.md` | Application |
| thumbnail selected | `docs/thumbnail-cover-frame.md` | Review Criteria, Export Connection |
| metadata complete | `docs/episode-metadata-publishing.md` | Metadata Fields, Readiness Checks |
| sponsor disclosure confirmed | `docs/sponsor-placement-review.md` | Conflict Checks |
| destination preset selected | `docs/publish-destination-presets.md` | Destinations, Preset Effects, Review States |
| export warnings resolved or ignored | `docs/export-readiness-review.md` | Review Summary, Timeline Checks |
| final package generated | `docs/export-package-handoff.md` | Package Contents, Summary |

## Destination Preset Handling

When `destination preset selected` is blocked or needs review, the checklist should send the creator back to `docs/publish-destination-presets.md` and explain the publishing consequence, not a render-setting mismatch.

Common consequences can include:

- thumbnail is now required or no longer required
- metadata fields no longer match the chosen destination
- review watermark behavior is wrong for the delivery type
- sponsor disclosure expectations changed
- final package contents no longer fit the destination

If the creator changes the destination late in the workflow, the checklist should reopen any affected items instead of leaving the previous destination marked ready.

## Review Approvals

When `review approvals complete` appears on the checklist, it should summarize sign-off from the review flows already defined elsewhere rather than introducing a separate approval queue.

Track only the areas that affect the chosen destination. Each area below maps to an existing spec section:

| Approval area | Source spec | Relevant section |
| --- | --- | --- |
| host or producer review | `docs/client-review-copy-flow.md` | Resolution States, Agency Fit |
| guest name and link accuracy | `docs/episode-metadata-publishing.md` | Metadata Fields, Review States |
| caption and glossary corrections | `docs/transcript-glossary.md` | Glossary Entries, Application |
| sponsor placement and disclosure | `docs/sponsor-placement-review.md` | Placement Types, Conflict Checks |
| b-roll, overlays, and title moments | `docs/contextual-broll-moments.md` | Approval Flow |
| thumbnail or cover frame | `docs/thumbnail-cover-frame.md` | Review Criteria, Export Connection |
| chapter markers and metadata | `docs/episode-chapter-markers.md`, `docs/episode-metadata-publishing.md` | Review States, Publish Readiness; Chapter Workflow, Readiness Checks |

Use simple team-facing states:

- not requested
- waiting
- changes requested
- approved
- skipped

Each approval should show who changed the state, when it changed, and any short note left with the decision. Teams and agencies can require approvals before final export; solo-host workflows should be able to skip areas that do not apply without extra project management.

Unresolved approvals should link back to the exact moment, metadata field, or review copy described in `docs/review-handoff-summary.md` Moment Links.

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
