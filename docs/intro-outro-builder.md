# Intro And Outro Builder

Intro and outro sections should help creators frame each episode consistently while still adapting to the specific guest and topic.

## User Goal

A creator should be able to add a polished opening and closing sequence using show branding, episode metadata, and speaker context.

## Relationship To Episode Framing

Intro and outro review should start from episode context already in the workspace:

- show branding from `docs/show-brand-kit-setup.md`
- episode title, guest names, and metadata from `docs/episode-metadata-publishing.md`
- speaker names and context from `docs/social-context-intake.md`
- reusable structure from `docs/show-template-adaptation.md`
- music placement from `docs/music-cue-setup.md`
- sponsor disclosure from `docs/sponsor-placement-review.md`
- export warnings in `docs/export-readiness-review.md`

## Intro Elements

Support:

- show title
- episode title
- host and guest names
- short topic line
- logo or brand treatment
- music or sound cue placeholder
- first speaker frame
- sponsor disclosure when needed

When a creator swaps the music or sound cue placeholder, that choice should route through `docs/music-cue-setup.md` Placement Flow and `docs/music-sound-cues.md` Structural Routing so the cue stays attached to the intro or outro purpose instead of acting like a generic background track.

## Outro Elements

Support:

- closing title
- guest links
- show subscribe prompt
- sponsor acknowledgement
- next episode teaser
- credits
- export destination note

Outro content should be easy to keep, remove, or adapt per episode.

## Framing Approach

Intro and outro editing is episode first: creators preview openings and closings against the episode's real first and last speaker moments, not detached template slides. Defaults should favor a short, branded opening, and creators should be able to shorten or skip an intro for one episode without breaking the saved template.

## Template Behavior

Reusable intros and outros should store structure and brand treatment while replacing episode-specific names, titles, and links for each new episode.

Per-episode edits should not overwrite the reusable template unless the creator chooses to save them back.

Saved intro and outro cue choices should reuse the structural cue behavior described in `docs/music-cue-setup.md` Template Reuse and `docs/show-template-adaptation.md` Template Contents, so future episodes keep the intended opening or closing cue without freezing episode-specific names, links, or sponsor details.

Intro and outro issues that would affect the chosen export destination should surface in `docs/export-readiness-review.md` Intro And Outro Warnings.

## Review States

The product should use intro and outro status to drive framing and export readiness:

- **draft** — show suggested opening and closing structure from the template; do not include unreviewed elements in export metadata or readiness as complete
- **adapted for episode** — pull host, guest, topic, and metadata into the sequence; surface conflicts with social context or sponsor rules before export
- **needs review** — keep the item in `docs/export-readiness-review.md` Intro And Outro Warnings until naming, music overlap, or sponsor disclosure issues are resolved
- **approved for export** — include the opening and closing in the exported episode and clear only intro/outro-related readiness items
- **skipped for episode** — omit the custom intro or outro from this export without clearing unrelated metadata, sponsor, or music warnings

Each state should describe what happens in preview, export readiness, and template reuse—not only the label on the sequence.

## Creator Controls

Offer simple actions:

- reorder or remove intro and outro elements
- shorten or skip the intro for this episode
- pull and edit host, guest, topic, and metadata details
- swap the music or sound cue placeholder for an approved cue
- preview against the episode's first and last speaker moments
- keep, remove, or adapt outro elements for this episode only
- confirm sponsor disclosure or acknowledgement when required
- save changes back to the reusable template

Avoid treating intros and outros as unrelated video assets or forcing a long opening on every episode.

## Maintainer Acceptance Notes

Accept work that makes openings and endings feel consistent, branded, and episode-aware. Close work that hard-codes a single show format, forces long intros on every episode, treats intros and outros as unrelated video assets, or clears unrelated publish-readiness warnings when an intro or outro is skipped.
