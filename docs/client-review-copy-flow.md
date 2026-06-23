# Client Review Copy Flow

Podcast teams and agencies need a way to share reviewable episodes before final publishing without confusing that step with the final export.

## User Goal

A creator should be able to create a client or team review copy, collect decisions around visible episode quality, and keep the final publish export clean.

## Review Copy Defaults

A review copy should make its status obvious:

- visible review watermark or label
- lower export priority than final publish
- optional timecode overlay
- current captions and audio state
- unresolved warnings summary
- template and preset used

Review copies should be easy to generate from the export readiness screen.

## Feedback Anchors

Feedback should attach to episode moments and visible objects:

- speaker framing
- captions
- b-roll or callout
- title moment
- lower-third
- audio issue
- chapter or metadata issue

The product should avoid generic comment threads that are disconnected from the video timeline.

## Resolution States

Keep review status simple:

- open
- accepted
- rejected
- fixed
- not relevant

Resolved feedback should remain available for context but should not keep blocking the final export.

Review-copy creation, reviewer decisions, and marked fixes should remain visible in `docs/episode-version-history.md` as creator-meaningful milestones, so teams can understand what changed between review rounds without reopening every comment thread.

Unresolved feedback that would affect the chosen export destination should surface in `docs/export-readiness-review.md` Review Copy Warnings.

## Creator Controls

Managing a review copy should feel like sending a focused decision pass, not opening a generic approval tool. The creator should be able to:

- create a review copy from the current episode state without disturbing the final export setup
- choose whether to include watermark, timecode overlay, and unresolved warnings summary
- resend an updated review copy after fixes while preserving prior feedback context
- jump from feedback back to the exact episode moment and return to the review thread without losing place
- reopen the publish checklist after reviewer decisions change what is ready to ship
- stop using an outdated review copy once a newer round replaces it

These controls should keep review copy rounds tied to episode moments, visible export consequences, and the final publish workflow instead of turning review into a separate task board.

## Review States

Use simple creator-facing states:

- draft — a review copy is prepared but not sent to reviewers yet
- awaiting feedback — reviewers can watch and comment; the creator waits on decisions
- changes requested — open feedback still blocks some final export items
- ready to publish — blocking feedback is resolved or ignored with consequence shown
- superseded — a newer review round replaced this link but prior feedback stays visible for context

Each state should describe what reviewers and creators can do next, such as "Two caption notes are still open before final export."

## Agency Fit

For teams producing client shows, the flow should preserve:

- client name
- show template
- reviewer list
- final approver
- requested export destination
- date of approval

This information supports repeatable production without making a solo creator do extra project management.

## Maintainer Acceptance Notes

Accept work that helps teams review long-form podcast episodes before final export. Close work that turns review into a generic task board, requires project-management overhead for solo creators, or treats review copies as final publish files.
