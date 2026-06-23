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

## Checklist Item Mapping

Each checklist item below maps to an existing spec section:

| Checklist item | Source spec | Relevant section |
| --- | --- | --- |
| source media ready | `docs/episode-ingest-readiness.md` | Readiness Checks |
| source media ready | `docs/source-media-health.md` | Health Checks, Readiness Summary |
| captions reviewed | `docs/audio-caption-quality-review.md` | Caption Confidence, Caption Style Presets, Review Flow |
| glossary corrections applied | `docs/transcript-glossary.md` | Application |
| thumbnail selected | `docs/thumbnail-cover-frame.md` | Review Criteria, Export Connection |
| metadata complete | `docs/episode-metadata-publishing.md` | Metadata Fields, Readiness Checks |
| sponsor disclosure confirmed | `docs/sponsor-placement-review.md` | Conflict Checks |
| destination preset selected | `docs/publish-destination-presets.md` | Destinations, Review |
| export warnings resolved or ignored | `docs/export-readiness-review.md` | Review Summary, Timeline Checks |
| final package generated | `docs/export-package-handoff.md` | Package Contents, Summary |

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
