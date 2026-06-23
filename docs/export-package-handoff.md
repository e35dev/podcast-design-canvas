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

## Re-Delivery

When a creator re-exports after the client already received a package, the product should re-deliver without confusing which version is current.

Each delivered package should carry a single delivery status, and never more than one delivery is current at a time:

- current — the latest delivery the creator stands behind; the version recipients should download, publish, or review against
- superseded — an earlier delivery the creator replaced with a newer one; it stays visible for reference but is never presented as the version to act on
- withdrawn — a delivery the creator pulled back; it is no longer offered for download or review

Promoting a new delivery to current should mark the prior current delivery as superseded in the same action, so the statuses stay mutually exclusive and two deliveries are never current at once.

Withdrawing is allowed even when it leaves no current delivery. If the creator withdraws the only current version without promoting a replacement, the package simply has no current delivery: recipients are told it was pulled back and given nothing to act on until the creator promotes a superseded delivery back to current or delivers a new one. "At most one current" is the rule, not "always exactly one."

Separate from that status, each delivery should record plain delivery facts—what changed since the last version, when it was delivered, and whether the recipient has opened it—so the creator can see history without those facts changing which version is current.

When a creator re-delivers, the product should:

- carry forward the labeled contents and recorded ignored warnings so the new version is understood the same way as the first
- show what changed since the prior delivery rather than presenting an unexplained second download
- keep the person who receives the package pointed at the current version, even if they still hold a link to a superseded one

Re-delivery should reuse the destination and readiness decisions already completed for the episode, not restart the handoff from an unlabeled folder.

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
