# Render Failure Recovery

When preview or export rendering fails, the product should help creators recover without making them debug production infrastructure.

## User Goal

A creator should understand what part of the episode needs attention, retry safely, and keep working without losing edits.

## Failure Messages

Use viewer-facing explanations:

- captions could not be included
- a b-roll asset is missing
- a speaker video file is unavailable
- audio mix could not be prepared
- thumbnail export failed
- final file could not be created

Avoid raw stack traces, worker names, or pipeline logs in the default user view.

## Recovery Actions

Offer direct actions:

- retry export
- replace missing asset
- skip optional visual
- export without captions
- return to issue moment
- create review copy instead
- contact support with diagnostics

Each action should explain the effect on the final episode.

## Recovery Status

A creator who hits a failed render should always know where recovery stands, without watching a progress log. A failed render should sit in exactly one status at a time, moving forward only as the creator acts:

- failed — the render stopped and no recovery action has been chosen yet
- retrying — a chosen recovery action is running again
- needs creator input — the attempt is paused until the creator replaces a missing asset or fixes a readiness issue
- recovered — a retry or fix produced a usable preview or export
- exported around the issue — the creator finished by skipping an optional visual or captions
- set aside — the creator left this export unfinished and kept their edits to return to later

These are sequential stages, not labels that stack: a render is either still failed, actively retrying, waiting on the creator, or resolved in one of the final ways, and never two at once. Keep the status tied to the chosen recovery action rather than infrastructure progress:

- moving from failed to retrying should restate the effect described in Recovery Actions above
- needs creator input should point at the specific missing asset or the relevant warning in `docs/export-readiness-review.md`, not a generic error
- recovered should show the last successful preview or export so the creator can confirm the fix
- set aside should rely on Preservation Rules below so no edits are lost while the export stays unfinished

A status should describe recovery progress only; it should never block the creator from returning to the issue moment or creating a review copy instead, and it should not restate the readiness checks owned by `docs/export-readiness-review.md`.

## Preservation Rules

Failures should not erase:

- canvas edits
- caption corrections
- approved b-roll
- metadata
- comments
- template changes
- export readiness decisions

Failed exports should return creators to the relevant warning surface in `docs/export-readiness-review.md` when recovery requires fixing a readiness issue.

The product should clearly show the last successful preview or export when available.

## Maintainer Acceptance Notes

Accept work that makes render and export failures recoverable for creators. Close work that exposes infrastructure internals, loses episode decisions, or leaves creators with only a generic retry button.
