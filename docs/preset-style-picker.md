# Preset Style Picker

The first editing path should let a creator choose a strong podcast visual style before they ever open a blank canvas.

## User Goal

A creator with synced host and guest recordings should be able to preview a polished long-form episode direction by choosing a preset, adjusting a few plain-language options, and applying it to the episode.

## Preset Cards

Each preset card should show:

- the layout structure for host, guest, captions, title moments, and b-roll zones
- the pacing style, such as calm interview, punchy commentary, or teaching-focused
- the best-fit show type, such as solo host, two-person interview, panel, or agency client show
- a short preview state that uses the current episode speakers where available

## Controls

Keep the controls creator-facing:

- layout density: simple, balanced, layered
- caption presence: minimal, standard, high-emphasis
- visual moments: restrained, balanced, energetic
- branding strength: neutral, show-branded, sponsor-ready

Caption presence choices should open the caption style preset path described in `docs/audio-caption-quality-review.md` Caption Style Presets.

Avoid exposing internal rendering, tracking, or timeline mechanics in this first path.

## Maintainer Acceptance Notes

Accept implementation work that makes preset selection feel visual, direct, and immediately previewable. Close work that turns the preset step into a generic settings form or forces users into manual canvas editing before they can see a polished direction.
