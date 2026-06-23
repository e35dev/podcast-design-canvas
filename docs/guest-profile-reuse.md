# Guest Profile Reuse

Recurring guest information should be reusable across episodes while staying easy to review and correct.

## User Goal

A creator should be able to recognize a returning guest and reuse approved names, links, title spellings, headshots, and lower-third preferences.

## Relationship To Episode Setup

Guest profile reuse should start from episode context already in the workspace:

- social links and spelling notes from `docs/social-context-intake.md`
- speaker buckets from `docs/speaker-role-mapping.md`
- metadata fields from `docs/episode-metadata-publishing.md`
- show notes assembly from `docs/show-notes-assembly.md`
- glossary spellings from `docs/transcript-glossary.md`
- approved assets from `docs/episode-asset-library.md`
- lower-thirds and layout from `docs/canvas-layer-controls.md`
- title cards from `docs/contextual-title-cards.md`

## Reuse Approach

Guest reuse is confirm first: suggested matches and changed details should require creator confirmation before they affect the current episode, and durable guest details should stay separate from episode-only overrides.

## Reusable Details

Store creator-approved details:

- display name
- pronunciation or spelling note
- title or role
- public links
- approved headshot
- common company or project names
- lower-third preference
- blocked topics or links

The product should distinguish durable guest details from episode-specific context.

## Matching

Guest profile suggestions can use:

- speaker name
- social links
- uploaded file names
- prior show template usage
- creator search

Suggested matches should require confirmation before applying to a new episode.
Rejected matches should stay out of the current episode unless the creator explicitly searches again.

## Episode Review

When a profile is reused, show what changed since the last appearance:

- title changed
- link changed
- new spelling suggestion
- headshot missing
- blocked item still active

Creators should be able to update the profile or apply changes only to the current episode.

## Review States

The product should use guest profile status to drive reuse and handoff behavior:

- **ready to reuse** — attach approved details to the matched speaker and route them through Reuse Routing without treating them as final in metadata, captions, or layout until the owning spec confirms them
- **confirm changed details** — show what changed since the last appearance and require confirmation before reuse affects this episode
- **missing approved asset** — keep the profile reusable but link to `docs/episode-asset-library.md` for the missing headshot or image
- **keep episode-only override** — apply the change to this episode only without updating the durable guest profile
- **not the same guest** — reject the suggested match and stop reusing stale details for the current speaker bucket

Each state should describe what gets handed off to the owning review surface—not final publish approval on the guest profile screen itself.

## Creator Controls

Offer simple actions:

- confirm suggested match
- preview last approved lower-third and headshot
- reuse approved details
- keep this title or link only for this episode
- update the reusable profile
- remove stale guest detail
- mark as not the same guest

## Reuse Routing

Guest profile reuse is a durable input, not a second review surface for metadata, captions, assets, or layouts. Reused details should route to the spec that already owns how the creator confirms them in the current episode.

| Reused detail | Owning spec | Relevant section |
| --- | --- | --- |
| display name, title, and public links | `docs/episode-metadata-publishing.md` | Metadata Fields, Review States |
| pronunciation note and common company or project names | `docs/transcript-glossary.md` | Glossary Entries, Application |
| approved headshot | `docs/episode-asset-library.md` | Asset Types, Safety Rules |
| lower-third preference | `docs/canvas-layer-controls.md` | Speaker And Moment Awareness, Reuse Requirements |
| blocked topics or links | `docs/social-context-intake.md` | Privacy And Taste Boundaries, Review States |

Profile reuse should attach approved details to the matched speaker and let the owning review surface handle the episode-specific decision. This screen should not become a second place to approve lower-thirds, metadata, captions, or guest-facing context.

## Maintainer Acceptance Notes

Accept work that makes recurring guest context accurate and reusable without feeling invasive. Close work that silently applies stale guest data, mixes guest profiles across shows, stores inferred personal details unrelated to episode quality, or treats guest profile confirmation as final approval for metadata, captions, or layout owned elsewhere.
