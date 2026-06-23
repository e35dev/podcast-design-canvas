# Speaker Switch Framing

The layout should adapt naturally when the active speaker changes so long-form conversations feel like an intentional production, not a static grid.

## User Goal

A creator should be able to control how the episode layout responds to speaker changes without manually cutting every transition across an hour-plus conversation.

## Switch Modes

Offer preset-friendly framing modes:

- spotlight: enlarge the active speaker, keep others small
- equal panel: keep all speakers the same size regardless of who talks
- gradual shift: slowly emphasize the active speaker over a few seconds
- cut to speaker: hard switch to a close-up of whoever is talking
- picture in picture: active speaker fills frame, previous speaker in a corner

Each mode should preview on a real multi-speaker moment from the current episode.

## Creator Controls

Use simple controls:

- choose a default switch mode for the episode
- override the mode for specific moments or segments
- set a minimum hold time before the layout reacts to a new speaker
- soften or strengthen transition energy
- lock a segment to a fixed layout when switching is unwanted

Avoid exposing keyframe timelines, automation curves, or per-frame layout editing in this path.

## Awareness Rules

Speaker switching should respect the episode context:

- hold the current framing during brief interjections
- wait for a natural pause before switching during cross-talk
- follow segment pacing from `docs/preset-pacing-controls.md`
- stay within safe areas defined in `docs/layout-safe-areas.md`
- preserve approved speaker positions from `docs/canvas-layer-controls.md`

## Review States

Use simple states:

- ready
- needs review
- override applied

These states should appear in `docs/long-form-navigation.md` Speaker lane only when a switch feels abrupt or conflicts with other visual elements.

## Template Reuse

A creator's switch mode and overrides should save into the show template alongside other layout choices from `docs/show-template-adaptation.md`, so recurring shows keep a consistent feel across episodes.
