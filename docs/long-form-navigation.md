# Long-Form Episode Navigation

The editor should make hour-plus podcast episodes easy to scan, review, and refine without forcing creators to scrub blindly through a long timeline.

## User Goal

A creator should be able to jump between meaningful episode moments, inspect quality issues, and keep context while reviewing a full-length episode.

## Navigation Lanes

Use creator-facing lanes that map to real review tasks:

- chapters
- speakers
- captions
- speaker attribution
- b-roll and callouts
- title moments
- audio warnings
- export readiness warnings
- comments or review notes

The default view should stay calm. Lanes can collapse when they are not relevant to the current task.

## Moment Cards

Important moments should appear as compact cards with:

- timestamp
- speaker or chapter context
- short reason for the moment
- visible status
- quick action

Examples include "Guest introduces launch story," "Caption confidence is low," or "Sponsor mark appears near lower-third."

Attribution-related moments should route to `docs/speaker-attribution-review.md` when the issue is who is speaking, not what the caption text says.

## Moment Actions

A creator scanning a long episode should be able to act on a moment without leaving the review flow. Each moment card should carry a clear status:

- new — surfaced but not yet looked at
- reviewed — the creator has seen it and it is fine
- fixed — the underlying issue was resolved
- ignored — not relevant for this episode
- snoozed — deferred until a later review pass

Keep the per-moment actions quick:

- jump to the moment with playback context
- mark reviewed, fixed, or ignored in one action
- open the owning review surface to fix the issue
- add a short review note for a collaborator
- snooze a moment to revisit later
- restore a snoozed or ignored moment

Acting on a moment should update its status in place and keep the creator's position in the episode, so a full-length review can move forward without re-scanning handled moments. Resolved and ignored moments should drop out of the default view but stay recoverable.

## Playback Continuity

When moving across review items, the product should preserve context:

- keep the current preview layout
- jump with a short lead-in
- remember playback speed
- show the active speaker
- return to the previous moment after checking an issue

The user should not lose their place just because they checked a warning or approved a b-roll moment.

## Scale Rules

Long-form navigation should handle dense episodes:

- group repeated warnings
- show counts before expanding lists
- filter by speaker or issue type
- let creators mark sections reviewed
- avoid generating hundreds of equal-priority items

## Maintainer Acceptance Notes

Accept work that makes full-length podcast review faster and more understandable. Close work that optimizes only for short clips, hides review context in a raw timeline, or makes every generated moment feel equally urgent.
