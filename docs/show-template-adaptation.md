# Show Template Adaptation

Reusable templates should preserve a show's identity while adapting cleanly to each new episode's speakers, topics, and publishing needs.

## User Goal

A creator or agency should be able to save a polished episode layout as a show template, apply it to the next episode, and review only the parts that need episode-specific decisions.

## Template Contents

A show template should capture reusable creative choices:

- layout structure for common speaker counts
- caption style and placement
- title moment treatment
- lower-third style
- b-roll zones and visual callout rules
- brand colors, logo placement, and sponsor-safe areas
- audio and caption quality preferences
- export defaults for the show's main publishing destination

Templates should not hard-code guest names, one-off b-roll, or episode-specific titles unless the creator explicitly pins them.

## Adaptation Flow

When applying a template to a new episode, the product should ask only for decisions that affect the result:

- map new speaker buckets to template roles
- choose fallback layout when the speaker count changes
- confirm guest lower-thirds and social context
- review title moment suggestions
- approve sponsor or brand placements if the show uses them
- keep or update export destination defaults

The product should preview the adapted layout before the creator commits it to the episode.

## Agency And Multi-Show Use

For teams managing multiple shows, templates should remain clearly scoped:

- show templates stay separate from client templates
- brand assets are visible before applying a template
- recent exports show which template was used
- template changes can apply to future episodes without rewriting finished exports

## Versioning

Template edits should avoid surprising users:

- save as a new template
- update this template for future episodes
- apply changes only to the current episode

Creators should be able to see when an episode has diverged from its original template. Those episode-versus-template differences should also stay understandable in `docs/episode-version-history.md`, so a creator can compare template application, later layout edits, and episode-only overrides before restoring anything.

Template reuse issues that would affect the chosen export destination should surface in `docs/export-readiness-review.md` Sponsor Placement Warnings.

## Maintainer Acceptance Notes

Accept work that makes reusable podcast identity practical across episodes and clients. Close work that treats templates as static files, hard-codes one episode's guests into future episodes, or ignores speaker-count adaptation.
