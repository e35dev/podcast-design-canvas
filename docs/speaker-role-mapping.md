# Speaker Role Mapping

Speaker roles should make imported tracks behave predictably across presets, canvas layouts, captions, and templates.

## User Goal

A creator should be able to map each imported track to a clear podcast role, then trust the product to place and label each speaker correctly throughout the episode.

## Relationship To Episode Setup

Speaker role mapping should stay connected to the creator-facing workflow that already uses those roles:

- imported speaker buckets from `docs/episode-ingest-readiness.md`
- social context and names from `docs/social-context-intake.md`
- preset preview and first-look layout decisions from `docs/preset-style-picker.md`
- speaker labels in captions from `docs/speaker-attribution-review.md`
- sync-driven relabeling from `docs/speaker-sync-repair.md`
- off-camera presence from `docs/off-camera-speaker-presence.md`
- reusable role behavior in future episodes from `docs/show-template-adaptation.md`
- export warnings in `docs/export-readiness-review.md`

Role confirmation should happen before presets, captions, or template adaptation depend on the wrong speaker identity.

## Role Approach

Speaker roles are identity first: every track should map to a clear podcast role with visible suggestions and live preview of framing, lower-thirds, and caption attribution—not anonymous file assignment.

## Core Roles

Use simple role options:

- host
- co-host
- guest
- panelist
- producer or off-camera voice
- narrator or voiceover

Roles should remain editable after ingest. Changing a role should update layouts, lower-thirds, captions, and template adaptation previews where appropriate.

## Role Signals

The product can suggest roles from:

- file names
- speaker names
- Riverside track labels
- social links
- transcript introductions
- recurring show template settings

Suggestions should be reversible and visible. Do not silently assign a guest as a host just because they speak first.

## Layout Effects

Roles should influence:

- default frame prominence
- lower-third priority
- caption attribution
- title card wording
- b-roll and callout placement
- host-only or guest-only visual treatments

The product should avoid treating every speaker equally when the show format clearly has a host-led structure.

Role-based layout issues that would affect the chosen export destination should surface in `docs/export-readiness-review.md` Speaker Framing Warnings.

## Edge Cases

Support common podcast setups:

- solo host
- two-person interview
- rotating co-hosts
- panel episodes
- producer voice without camera
- guest joins late or leaves early

## Preview Contexts

Role confirmation should be checked on episode moments where the assignment is easiest to judge:

- a host introduction where names and speaker order are obvious
- a host-and-guest exchange with both lower-thirds visible
- a captioned moment where attribution would look wrong if the role is wrong
- an off-camera or producer interruption
- a late guest join or early exit

These previews should show what the creator would actually notice in the episode, such as the wrong speaker getting host framing, the wrong lower-third, or a guest line attributed like a host line.

Role previews should preserve the same episode moment while the creator checks speaker framing, lower-third naming, caption attribution, and host-versus-guest emphasis in the same visible layout.

## Review States

The product should use role status to drive setup and layout behavior:

- **confirmed** — apply the role to framing, lower-thirds, and caption attribution in the live preview; clear only role-mapping warnings for that speaker bucket
- **suggested** — show the proposed role with visible reasoning; do not treat layouts or captions as final until the creator confirms
- **needs review** — surface low-confidence or conflicting signals and keep preset- or caption-dependent steps blocked until the role is resolved
- **unassigned** — prevent styling that depends on role mapping until the creator chooses a role from the short podcast role list

Each state should describe what happens in preview, attribution, and export readiness—not only the label on the track.

## Creator Controls

Offer simple actions:

- accept a suggested role in one action
- change a role from the short list of podcast roles
- swap two speakers' roles when tracks were mixed up
- mark a track as off-camera or voiceover
- set a guest who joins late or leaves early without breaking the layout
- reset a track to its suggested role

Confirming a role should update that speaker's framing, lower-third, and caption attribution in the live preview before the creator moves on. A track should never be silently locked into a role the creator has not seen.

## Maintainer Acceptance Notes

Accept work that makes speaker roles durable across ingest, presets, canvas editing, captions, and templates. Close work that treats tracks as anonymous media files, hard-codes one show format for every podcast, or clears unrelated sync or attribution warnings when a role is confirmed.
