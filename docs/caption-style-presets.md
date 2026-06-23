# Caption Style Presets

Caption look and motion should be a preset style choice tied to the chosen visual direction, not a separate font menu the creator has to assemble by hand.

## User Goal

A creator should be able to pick how captions look and move for a long-form episode by choosing a caption style that already fits their preset, then adjust a few plain-language options.

## Style Choices

Offer caption styles as ready-to-use looks that match the episode's visual direction:

- font and weight that read well over speaker faces and b-roll
- caption size step: compact, standard, large
- placement zone: lower third, lower center, top safe band
- emphasis style for key words, names, and show terms
- motion style: static lines, word-by-word reveal, or smooth fade

Each style should preview on the current episode's captions where available, so the creator sees real lines, not sample text.

## Creator Controls

Use simple controls:

- choose a caption style that fits the preset
- adjust size, placement, and emphasis with named steps
- turn motion up or down for calmer or punchier pacing
- keep one safe reset back to the preset default

Avoid exposing keyframes, easing curves, font files, timecode offsets, or per-frame animation editing in this path.

## Review States

Use simple, creator-facing states:

- ready
- needs review
- conflict

A caption style should be flagged when it collides with a lower-third, leaves the caption safe area, or becomes hard to read at the chosen size. These states should surface in caption review only when they affect the finished episode.

## Template Reuse

A chosen caption style should save with the show template so later episodes inherit the same readable look, while each episode re-checks placement against its real speaker count, brand kit, and export crop.

This style sits between `docs/preset-style-picker.md` and `docs/audio-caption-quality-review.md`, and its placement checks should respect `docs/layout-safe-areas.md`.
