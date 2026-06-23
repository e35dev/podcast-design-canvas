# Export Package Handoff

The export handoff should give creators a complete, understandable package for publishing or archiving the finished episode.

## User Goal

A creator should know exactly what files were produced, what they are for, and whether any warnings were ignored before sharing or publishing.

## Relationship To Export Flow

The handoff should reflect the destination and checklist completed in:

- `docs/publish-destination-presets.md`
- `docs/publish-checklist.md`
- `docs/episode-metadata-publishing.md`
- `docs/show-notes-assembly.md`
- `docs/thumbnail-cover-frame.md`
- `docs/export-readiness-review.md`
- `docs/client-review-copy-flow.md`

Each package item should map to a creator-understood publishing outcome, not only a file extension.

## Handoff Approach

Package handoff is delivery first: creators should understand what each file is for, what was ignored, and what still blocks publishing—not receive an unlabeled download folder or render log.

## Package Contents

The handoff can include:

- final video file
- thumbnail or cover frame
- caption file
- audio-only backup
- metadata summary
- show notes text
- chapter list
- review copy link
- ignored warnings report
- template and preset record

The product should label each item by use, not only by file extension.

## Package States

The product should use package status to drive post-export actions:

- **complete** — include every required item for the chosen destination; enable download, publish, and review-copy actions
- **missing optional item** — continue delivery when the destination does not require the item; explain what was omitted, such as show notes or audio-only backup
- **missing required item** — block publish or share actions for that destination; link back to the checklist item or review surface that still needs attention
- **warning ignored** — record the publishing consequence in the ignored warnings report; keep ignored items visible in the summary without treating them as resolved review work
- **ready to share** — when required items are present and ignored warnings are recorded with consequences, enable client review copy or destination publish

Each state should describe what the creator can do next with the package—not only the label on the delivery summary.

## Creator Controls

Offer next actions:

- download package
- copy metadata or show notes
- publish destination package
- create review copy
- duplicate as template
- start next episode

Avoid exposing encoder diagnostics, render queue IDs, or raw file paths as the default handoff experience.

## Summary

After export, show:

- destination preset used
- duration
- file size
- caption status
- thumbnail status
- sponsor disclosure status
- template used
- export time

This gives creators confidence that the package is complete.

Completed exports should preserve readiness decisions from `docs/export-readiness-review.md` rather than resetting ignored warnings or checklist status.

## Maintainer Acceptance Notes

Accept work that makes final episode delivery clear and publish-ready. Close work that leaves creators with only an unlabeled file download, hides ignored warnings after export, or treats optional destination items as blocking errors for every show.
