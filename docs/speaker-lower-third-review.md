# Speaker Lower-Third Review

Speaker lower-third review should help creators confirm on-screen speaker names, titles, handles, and short context before export without turning the canvas into a text-layout form.

## User Goal

A creator should be able to review each visible lower-third against the real episode moment, fix names or titles, and trust speaker identity overlays in the final long-form episode.

## Sources

Lower-third suggestions should come from confirmed episode context:

- speaker buckets and roles from `docs/episode-ingest-readiness.md` and `docs/speaker-role-mapping.md`
- display names, titles, and handles from `docs/social-context-intake.md` and `docs/guest-profile-reuse.md`
- approved spellings from `docs/transcript-glossary.md`
- placement and safe-area signals from `docs/canvas-layer-controls.md` and `docs/layout-safe-areas.md`

The product should show why a label appeared, such as "matched guest profile" or "episode speaker name," before it appears in the finished video.

## Creator Controls

Use simple controls:

- accept a suggested speaker label
- edit the display name, title, or handle
- choose compact or expanded lower-third detail from the current preset
- show, hide, or shorten the label for a specific speaker entrance
- preview the lower-third on the real episode moment
- send a recurring spelling correction to the glossary

Avoid exposing font-file menus, pixel coordinates, keyframes, layer IDs, tracking data, or automatic role inference in this path.

## Review States

Use simple states:

- ready
- needs name
- needs source
- overlaps captions
- wrong speaker
- hidden for this export

These states should appear in canvas and caption review only when the visible lower-third would affect the finished episode.

## Flow Boundaries

Speaker lower-third review owns the on-screen label decision. `docs/social-context-intake.md` and `docs/guest-profile-reuse.md` provide candidate identity data, while `docs/canvas-layer-controls.md` owns direct placement when a creator moves the layer. This screen should not become a second place to approve social links, caption wording, or durable guest profile details.

## Template Reuse And Publish Readiness

Approved lower-third style, entrance timing, and visible fields can save with `docs/show-template-adaptation.md` when they are show-level choices. Episode-specific titles, sponsor labels, and guest handles should refresh before the label is marked ready.

Before export, unresolved lower-third issues should surface in `docs/export-readiness-review.md` only when the visible overlay affects the finished episode. `docs/publish-checklist.md` should treat episodes with no lower-thirds as not needed, not blocked.
