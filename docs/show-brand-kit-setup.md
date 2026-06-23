# Show Brand Kit Setup

Brand setup should help each podcast feel distinct without forcing creators to design every visual element from scratch.

## User Goal

A creator should be able to add show branding once, preview how it affects presets and canvas layouts, and reuse it across future episodes.

## Relationship To Show Identity

Brand kit setup should connect to the surfaces where show identity appears:

- preset selection from `docs/preset-style-picker.md`
- caption emphasis from `docs/audio-caption-quality-review.md`
- canvas layers from `docs/canvas-layer-controls.md`
- thumbnails from `docs/thumbnail-cover-frame.md`
- intros and outros from `docs/intro-outro-builder.md`
- sponsor-safe placement from `docs/sponsor-placement-review.md`
- reusable templates from `docs/show-template-adaptation.md`
- export warnings in `docs/export-readiness-review.md`

## Brand Approach

Brand setup is distinct, not mandatory: creators should start from strong defaults, preview branding on real episode content, and refine the kit over time without being blocked from editing when inputs are incomplete.

## Brand Inputs

The setup should support:

- logo
- show colors
- type style preference
- lower-third style
- caption emphasis level
- background texture or image
- sponsor placement rules
- thumbnail or cover treatment

Inputs should remain optional. A creator should be able to start from strong defaults and refine the brand kit over time.

## Preview Surfaces

Brand choices should preview in the places they actually appear:

- preset cards
- speaker frames
- captions
- title moments
- lower-thirds
- b-roll callouts
- export thumbnail

The preview should use real episode speakers when available, not generic placeholder content.

## Guardrails

Branding should not reduce viewer clarity:

- captions stay readable
- speaker faces remain unobstructed
- sponsor marks do not crowd lower-thirds
- color contrast works for long-form viewing
- layouts still adapt to different speaker counts

When a brand choice creates a readability problem, the product should suggest a fix rather than silently rejecting it.

## Resolving Brand Conflicts

When a brand choice trips a guardrail, the creator should stay in control of the trade-off instead of having the choice silently changed or rejected. For each flagged conflict, the product should:

- show the specific readability problem and where it appears in the episode
- offer a suggested fix the creator can accept in one action
- let the creator keep the original brand choice with a visible readability warning
- let the creator adjust the underlying brand input rather than only the single instance
- apply the resolution to the current episode only or save it back to the show template
- preview the fix against real episode content before it is applied

A brand kit should never block a creator from previewing an episode. Unresolved conflicts should remain visible warnings the creator can revisit, not hard stops.

## Review States

The product should use brand kit status to drive preview and reuse behavior:

- **using defaults** — apply strong preset defaults when brand inputs are incomplete; do not block episode preview or editing
- **previewing** — show brand choices on real episode speakers across Preview Surfaces
- **conflict flagged** — surface the readability or overlap issue with a suggested fix; keep preview available
- **adjusted** — apply the chosen fix and refresh previews for the affected surface
- **accepted with warning** — keep the original brand choice with the publishing consequence visible; do not clear unrelated caption, framing, or sponsor warnings
- **saved to template** — carry approved brand inputs into `docs/show-template-adaptation.md` for future episodes without rewriting already exported episodes

Each state should describe what happens in preview, templates, and export readiness—not only the label on the brand input.

## Creator Controls

Offer simple actions:

- add or edit logo, colors, type style, and placement rules
- preview brand choices on preset cards, captions, lower-thirds, and thumbnails
- accept a suggested readability fix
- keep the original brand choice with a visible warning
- adjust the underlying brand input instead of only one instance
- apply a resolution to this episode or save it back to the show template

Avoid making brand setup mandatory before preview or forcing one house style across every podcast.

## Reuse

A brand kit should attach to a show template but remain editable. Teams should be able to update future episodes without changing already exported episodes.

## Maintainer Acceptance Notes

Accept work that makes show identity reusable across presets, canvas edits, and exports. Close work that creates a single house style for every podcast, makes brand setup mandatory before creators can preview an episode, or clears unrelated publish-readiness warnings when a brand conflict is accepted with warning.
