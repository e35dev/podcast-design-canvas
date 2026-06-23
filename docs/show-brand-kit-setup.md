# Show Brand Kit Setup

Brand setup should help each podcast feel distinct without forcing creators to design every visual element from scratch.

## User Goal

A creator should be able to add show branding once, preview how it affects presets and canvas layouts, and reuse it across future episodes.

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

Use simple creator-facing states:

- clear — brand choices read well across captions, speakers, and the export thumbnail
- adjust this surface — one preview surface such as captions or lower-thirds still needs a fix
- keep with warning — the creator accepts a readable tradeoff and the warning stays visible
- blocks export — contrast, overlap, or sponsor placement would ship unreadably unless fixed or ignored with consequence shown

Each state should describe what a viewer would notice, such as "Sponsor mark crowds the lower-third in the mobile preview."

## Export Warning Routing

Brand conflicts should surface in the readiness section that matches the visible problem, not in a single catch-all warning:

| Brand conflict | Export readiness section |
| --- | --- |
| caption contrast, size, lower-third overlap, or motion | Readability Warnings |
| thumbnail logo, title treatment, or cover readability | Thumbnail Warnings |
| sponsor mark placement or disclosure fit | Sponsor Placement Warnings |

## Reuse

A brand kit should attach to a show template but remain editable. Teams should be able to update future episodes without changing already exported episodes.

## Maintainer Acceptance Notes

Accept work that makes show identity reusable across presets, canvas edits, and exports. Close work that creates a single house style for every podcast or makes brand setup mandatory before creators can preview an episode.
