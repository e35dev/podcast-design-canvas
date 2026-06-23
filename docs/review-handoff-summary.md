# Review Handoff Summary

A review handoff should tell collaborators what needs attention without making them inspect the whole production workspace.

## User Goal

A creator should be able to send a client, teammate, or producer a concise review summary that points to the right episode moments and decisions.

## Relationship To Review Flow

The handoff should summarize open decisions from:

- caption, speaker attribution, and spelling review in `docs/audio-caption-quality-review.md`, `docs/speaker-attribution-review.md`, and `docs/transcript-glossary.md`
- contextual visuals in `docs/contextual-broll-moments.md` and `docs/sponsor-placement-review.md`
- metadata readiness from `docs/episode-metadata-publishing.md`
- thumbnail candidates from `docs/thumbnail-cover-frame.md`
- export warnings from `docs/export-readiness-review.md`
- checklist approvals from `docs/publish-checklist.md`
- client review setup from `docs/client-review-copy-flow.md`

The summary should focus on decisions the reviewer can make, not internal production status.

## Summary Contents

Include:

- episode title and duration
- template and preset used
- review copy status
- unresolved warnings
- moments needing approval
- caption or spelling decisions
- speaker attribution decisions
- sponsor placement status
- metadata readiness
- requested decision deadline

## Moment Links

Every review item should link to the relevant moment:

- caption issue
- speaker attribution fix
- b-roll approval
- sponsor placement
- lower-third question
- chapter title
- thumbnail candidate
- audio concern

Reviewers should not need to search the timeline manually.

## Review States

Use reviewer-facing states:

- ready to approve
- needs decision
- blocked
- already approved
- not relevant for this reviewer

Each state should describe what the reviewer needs to do, such as "Confirm sponsor read timing" or "Choose between two thumbnail candidates."

## Creator Controls

Offer simple actions:

- choose reviewer audience
- add decision note
- set deadline
- send review copy
- resend updated summary
- mark item resolved
- open publish checklist

Avoid exposing encoder settings, render logs, or unrelated workspace tools in the default handoff.

## Audience Fit

Different reviewers need different summaries:

- client approver
- internal producer
- host
- guest
- sponsor reviewer

The product should avoid exposing production details that are not relevant to the selected reviewer.

## Team Checkpoints

When more than one reviewer receives a handoff, the summary should stay readable instead of turning into a generic status report:

- show which reviewer still needs to decide in plain language, not a raw account ID
- keep review items grouped by episode moment and decision type, not by who was notified last
- make a final approver's pending items safe from being hidden by unrelated production status
- let any collaborator resend an updated summary without losing prior reviewer context

Solo creators should never see team attribution clutter; show it only when a handoff actually has more than one reviewer. Client review copy setup stays in `docs/client-review-copy-flow.md` — this summary only attributes the meaningful decisions it already links to episode moments.

## Maintainer Acceptance Notes

Accept work that makes episode review easier to hand off and complete. Close work that creates generic status reports, exposes internal pipeline logs, or disconnects review decisions from video moments.
