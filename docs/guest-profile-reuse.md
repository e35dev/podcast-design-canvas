# Guest Profile Reuse

Recurring guest information should be reusable across episodes while staying easy to review and correct.

## User Goal

A creator should be able to recognize a returning guest and reuse approved names, links, title spellings, headshots, and lower-third preferences.

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

## Episode Review

When a profile is reused, show what changed since the last appearance:

- title changed
- link changed
- new spelling suggestion
- headshot missing
- blocked item still active

Creators should be able to update the profile or apply changes only to the current episode.

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

Accept work that makes recurring guest context accurate and reusable without feeling invasive. Close work that silently applies stale guest data, mixes guest profiles across shows, or stores inferred personal details unrelated to episode quality.
