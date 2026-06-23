# Show Template Adaptation

Reusable templates should preserve a show's identity while adapting cleanly to each new episode's speakers, topics, and publishing needs.

## User Goal

A creator or agency should be able to save a polished episode layout as a show template, apply it to the next episode, and review only the parts that need episode-specific decisions.

## Relationship To Episode And Show Identity

Template adaptation should connect to the surfaces a saved layout affects:

- preset and layout choices from `docs/preset-style-picker.md`
- fast draft reuse from `docs/start-from-previous-episode.md`
- brand kit defaults from `docs/show-brand-kit-setup.md`
- intro and outro structure from `docs/intro-outro-builder.md`
- caption and audio preferences from `docs/audio-caption-quality-review.md`
- contextual visuals from `docs/contextual-broll-moments.md` and `docs/contextual-title-cards.md`
- music cues from `docs/music-cue-setup.md` and `docs/music-sound-cues.md`
- sponsor rules from `docs/sponsor-placement-review.md`
- episode divergence tracking in `docs/episode-version-history.md`
- export defaults from `docs/publish-destination-presets.md`

## Adaptation Approach

Template adaptation is adapt, not freeze: reusable structure should carry show identity forward while episode-specific names, guests, sponsors, and one-off visuals stay editable until the creator confirms them.

When a creator wants the last episode as a shortcut instead of the curated show template as the main starting point, that handoff should route through `docs/start-from-previous-episode.md` and then return here only for changes meant to become durable show identity.

## Template Contents

A show template should capture reusable creative choices:

- layout structure for common speaker counts
- intro and outro structure, branding, and default visibility
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
- keep, shorten, or skip the saved intro and outro for this episode
- choose fallback layout when the speaker count changes
- confirm guest lower-thirds and social context
- review title moment suggestions
- approve sponsor or brand placements if the show uses them
- keep or update export destination defaults

The product should preview the adapted layout before the creator commits it to the episode.

Opening and closing changes should stay connected to `docs/intro-outro-builder.md` Template Behavior and Creator Controls, so a creator can adapt the current episode without accidentally overwriting the reusable show template.

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

## Creator Controls

Applying and maintaining a template should stay a creator-facing arranging step, not a file-management chore:

- save the current episode's look as a new show template
- apply a template to the next episode and review only the episode-specific decisions
- map new speaker buckets to template roles in one pass
- choose the fallback layout when the speaker count changes
- pin or unpin episode-specific details such as guest, topic, or sponsor
- keep an episode change local or push it to the template for future episodes
- compare an episode against its template and restore a part without rebuilding the whole layout

Avoid asking creators to edit raw template files, manage layer trees, or resolve template internals in the default path.

## Review States

Template adaptation status should describe what the creator still needs to decide, in plain creator-facing terms:

- **ready to apply** — the template matches the new episode's speaker count and needs no extra decisions before preview
- **needs role mapping** — new speaker buckets are not yet mapped to template roles; take the creator to the speaker role step before styling
- **needs fallback layout** — the speaker count differs from the template, so the creator must confirm a fallback before applying
- **episode override** — keep the change local to this episode and show it as a difference against the template; do not clear unrelated caption, sponsor, or export-readiness warnings
- **template updated** — push the change to the template for future episodes without rewriting finished exports
- **diverged** — show the difference in `docs/episode-version-history.md` so the creator can compare or restore without rebuilding the whole layout

Each state should describe what the creator decides next and which editing or review surface they land on, not only the label on the template.

## Maintainer Acceptance Notes

Accept work that makes reusable podcast identity practical across episodes and clients. Close work that treats templates as static files, hard-codes one episode's guests into future episodes, ignores speaker-count adaptation, or clears unrelated publish-readiness warnings when an episode override is kept local.
