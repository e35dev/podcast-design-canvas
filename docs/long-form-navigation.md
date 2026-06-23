# Long-Form Episode Navigation

The editor should make hour-plus podcast episodes easy to scan, review, and refine without forcing creators to scrub blindly through a long timeline.

## User Goal

A creator should be able to jump between meaningful episode moments, inspect quality issues, and keep context while reviewing a full-length episode.

## Relationship To Episode Review

Long-form navigation should connect to the review surfaces it routes creators through:

- chapters from `docs/episode-chapter-markers.md`
- transcript search from `docs/transcript-search-navigation.md`
- captions and audio from `docs/audio-caption-quality-review.md`
- speaker attribution from `docs/speaker-attribution-review.md`
- contextual visuals from `docs/contextual-broll-moments.md`
- export warnings from `docs/export-readiness-review.md`
- review handoff from `docs/review-handoff-summary.md`

## Navigation Approach

Long-form navigation is context first: creators should move between meaningful moments with playback continuity and calm lanes—not scrub a raw timeline where every generated item feels equally urgent.

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

## Review States

The product should use moment status to drive long-form review without replacing owning review surfaces:

- **new** — surface the moment in navigation; do not treat the underlying issue as resolved
- **reviewed** — the creator has seen the moment and confirmed it is fine for this episode; clear only the navigation card when the owning spec agrees
- **fixed** — route to the owning review surface and refresh the moment after the fix is applied
- **ignored** — hide the moment from the default navigation view for this episode; do not clear unrelated export-readiness or checklist warnings owned elsewhere
- **snoozed** — defer the moment to a later review pass while keeping playback position and review context intact

Each state should describe what happens in navigation and which owning surface still owns the fix—not only the label on the card.

## Creator Controls

Offer simple actions:

- jump to the moment with playback context
- mark reviewed, fixed, or ignored in one action
- open the owning review surface to fix the issue
- add a short review note for a collaborator
- snooze a moment to revisit later
- restore a snoozed or ignored moment

Acting on a moment should update its status in place and keep the creator's position in the episode. Resolved and ignored moments should drop out of the default view but stay recoverable.

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

Accept work that makes full-length podcast review faster and more understandable. Close work that optimizes only for short clips, hides review context in a raw timeline, makes every generated moment feel equally urgent, or clears export-readiness warnings just because a moment was ignored in navigation.
