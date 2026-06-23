# Preset Pacing Controls

Preset pacing should let creators shape how energetic an episode feels without manually editing every moment.

## User Goal

A creator should be able to choose a pacing feel that matches the show and preview how it changes speaker framing, visual moments, captions, and transitions.

## Pacing Options

Use plain-language controls:

- calm interview
- balanced conversation
- punchy commentary
- teaching focused
- panel discussion
- sponsor-friendly

Each option should describe what changes visually and rhythmically.

## Effects

Pacing can influence:

- frequency of title moments
- b-roll suggestion intensity
- caption emphasis
- speaker frame changes
- transition strength
- pause trimming recommendations
- chapter density

The product should avoid changing the actual conversation meaning just to make the episode feel faster.

## Speaker Switch Framing

Pacing owns how the layout reframes when the active speaker changes during a multi-speaker episode, so this behavior stays a preset-level choice instead of manual per-cut editing.

Offer plain-language switch modes:

- follow active speaker
- hold a steady wide shot
- split focus between current speakers
- emphasize host on interjections

The chosen pacing feel sets how often and how strongly the frame follows speaker changes: calmer feels switch less and favor wider holds, punchier feels switch more readily. Switches should respect the visibility rules in `docs/speaker-framing-safety.md` and keep any manual frame positions set in `docs/canvas-layer-controls.md`, and the resulting framing should save with the show template.

## Preview

Creators should preview pacing on:

- episode opening
- a high-energy exchange
- a quiet explanation
- an active-speaker handoff between two speakers
- a chapter transition
- a sponsor or metadata-heavy moment

Previewing multiple moments prevents the creator from choosing a pacing style that only works for one clip.

## Maintainer Acceptance Notes

Accept work that makes pacing a simple preset-level creative choice for long-form episodes. Close work that exposes raw edit timing controls too early or optimizes only for short-form clip energy.
