# Speaker Visual Match

When podcast speakers record from different locations, the product should help their video look like one cohesive episode before any preset or canvas choices are applied.

## User Goal

A creator should be able to preview all speaker tracks side by side and quickly bring them into visual harmony so the finished episode feels like a single production.

## Match Signals

Flag mismatches that a viewer would notice:

- one speaker is noticeably darker or brighter than others
- color temperature differs across speakers (warm versus cool)
- one speaker's background is distractingly different in tone
- a guest's video appears washed out next to the host
- lighting changes within a single speaker's track over time

Signals should use plain language and thumbnail comparisons, not histograms or color values.

## Creator Controls

Use simple controls:

- match brightness across speakers
- warm or cool a speaker's look
- soften a distracting background difference
- preview the match against the chosen preset
- reset a speaker to original

Avoid exposing white balance sliders, color curves, LUTs, or per-channel adjustments in the default path.

## Review States

Use simple states:

- matched
- needs review
- skipped

These states should appear in `docs/export-readiness-review.md` Speaker Framing Warnings only when a visual mismatch would be noticeable in the finished episode.

## Connection to Preset and Canvas

Visual match adjustments should apply before the preset style layer so that brand colors, overlays, and lower-thirds look consistent across all speakers. Changes saved here should carry into `docs/show-template-adaptation.md` Template Contents when the creator reuses the same recording setup.

Source media issues that affect individual tracks before matching should surface in `docs/source-media-health.md` Health Checks.
