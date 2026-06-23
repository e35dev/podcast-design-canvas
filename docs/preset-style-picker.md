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
- speaker focus: steady panel, active-speaker emphasis, gentle handoff
- caption presence: minimal, standard, high-emphasis
- caption style: clean lower third, centered emphasis, speaker-labeled, title-safe
- visual moments: restrained, balanced, energetic
- branding strength: neutral, show-branded, sponsor-ready

Avoid exposing internal rendering, tracking, or timeline mechanics in this first path.

## Speaker Switch Framing

Speaker switch framing should stay inside the preset choice instead of becoming a separate camera-editing workflow.
The preview in `docs/preset-preview-on-real-tracks.md` should show how the selected speaker focus behaves on a real moment where the conversation moves between confirmed speakers.

Speaker focus choices should stay preset-safe:

- keep host and guest roles stable while the active speaker changes
- hold a steady panel during quick back-and-forth or cross-talk
- keep faces and captions inside destination-safe areas when emphasis changes
- carry the selected speaker focus with the applied preset so the creator does not cut every transition by hand

Avoid keyframes, face-tracking controls, shot lists, or per-speaker camera automation in the preset picker.

## Caption Style Controls

Caption styling should live inside the preset picker rather than a separate caption-design surface.
The preview in `docs/preset-preview-on-real-tracks.md` should show the chosen caption style on the creator's real transcript sample before the preset is applied.

Caption style choices should stay preset-safe:

- use readable long-form caption sizes before decorative treatments
- keep captions inside destination-safe areas for desktop, square, and vertical crops
- preserve speaker labels only when confirmed speaker names are available
- carry the selected caption style with the applied preset so the creator does not rebuild it on a blank canvas

Avoid font panels, animation timelines, manual coordinates, or caption styling that looks polished in the card but cannot survive the real-track preview.
