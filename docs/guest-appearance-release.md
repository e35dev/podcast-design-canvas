# Guest Appearance Release

Before a long-form episode publishes, the creator should be able to confirm that each guest is cleared to appear and that any agreement made with them is respected in the finished episode.

## User Goal

A creator should be able to record that a guest has agreed to be published, capture any simple conditions the guest asked for, and trust that those conditions hold through export without managing a separate legal tool.

## When This Applies

This is a creator-facing clearance pass, not a contract system:

- a guest who agreed to appear and wants to confirm before it goes live
- a guest who asked to hold publishing until a certain date
- a segment a guest asked to keep out of the published episode
- a participant who agreed to audio-only and not on-camera publishing
- a returning guest whose standing agreement should carry forward

It records the creator's confirmation of an agreement; it does not generate, store, or interpret legal paperwork.

## Clearance Inputs

Keep the inputs lightweight and plain-language:

- guest cleared to appear in the published episode
- hold-until date when publishing should wait
- a segment or moment the guest asked to exclude
- audio-only condition for a participant who declined camera
- a short note recording what the guest agreed to

Inputs should attach to a speaker bucket so it is always clear which person an agreement covers.

## Review Approach

Appearance review is confirm-in-context: the creator sees the guest at the real moments they appear and confirms clearance there, rather than filling a detached consent form. A guest with no special conditions should clear in a single action.

## Creator Controls

Confirming a guest's clearance should stay a quick, respectful step:

- mark a guest cleared to appear in this episode
- set a hold-until date for publishing
- flag a segment the guest asked to keep out of the published cut
- record an audio-only condition that routes presence to the off-camera presence treatment
- save a standing agreement to the guest profile for recurring guests
- reuse or update a returning guest's prior agreement for this episode

Avoid exposing contract templates, signature workflows, or rights-management dashboards in the default path.

## Review States

The product should show appearance clearance as a quiet readiness signal on the publish review surface, surfaced as a calm badge that becomes a clear blocker only when a guest condition would be violated at export, with one status at a time:

- **cleared** — the guest agreed to appear with no outstanding conditions for this episode
- **needs confirmation** — the creator has not yet confirmed the guest is cleared to publish
- **conditional** — the guest agreed with a condition, such as a held segment or hold-until date, that the export must respect
- **on hold** — a hold-until date or unresolved condition means this guest is not yet cleared for this publish
- **not applicable** — the participant does not require appearance clearance for this episode

Each state should describe what it means for publishing the episode, and a conditional or on-hold state should block only the publishing action it actually affects, with the consequence shown.

## Connections

Appearance release should reuse decisions the workspace already owns rather than redefining them:

- guest identity, links, and blocked topics come from `docs/guest-profile-reuse.md` (Reusable Details) and `docs/social-context-intake.md` (Privacy And Taste Boundaries)
- audio-only presentation is owned by `docs/off-camera-speaker-presence.md` (Presence Styles)
- a held segment routes to `docs/show-segment-system.md` (Creator Controls) so it can be skipped for this episode
- unresolved clearance that affects publishing should surface in `docs/export-readiness-review.md` and `docs/publish-checklist.md`

The creator should record an agreement once and let these surfaces honor it, not re-enter it on every screen.

## Maintainer Acceptance Notes

Accept work that helps creators confirm guests are cleared to appear and respects simple agreements through export. Close work that turns clearance into a generic legal or signature tool, duplicates sponsor disclosure, stores sensitive personal data unrelated to publishing the episode, or blocks export for guests who have no outstanding conditions.
