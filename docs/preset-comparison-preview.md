# Preset Comparison Preview

Preset selection should help creators compare polished episode directions before they commit to a design path.

## User Goal

A creator should be able to preview multiple presets against the same real episode moment and choose the one that best fits the show.

## Relationship To Preset Selection

Comparison preview should extend the preset workflow already defined in `docs/preset-style-picker.md` instead of becoming a detached browse mode.

- launch comparison from preset cards or the first full-episode preview
- use the creator's current episode speakers, social-context names, and brand kit where available
- keep the same creator-facing controls for layout density, caption presence, visual moments, and branding strength
- return the chosen preset to `docs/preset-style-picker.md` Apply And Preview so the creator can commit it to the episode immediately

Comparison should help the creator choose between strong directions, not restart setup from scratch.

## Comparison Mode

Comparison should support:

- two to four presets side by side
- the same timestamp across all previews
- current speaker names and roles
- current brand kit where available
- caption and lower-third examples
- b-roll or title moment examples when relevant

The product should not compare presets with generic placeholder content once real episode media exists.

## Decision Signals

Each preset should communicate:

- best-fit show format
- pacing feel
- speaker count support
- caption style
- branding strength
- b-roll intensity
- template reuse fit

This should help creators make a taste decision quickly without opening a blank canvas.

## Preview Controls

Creators should be able to:

- switch the preview moment
- compare calm and energetic pacing
- toggle brand kit preview
- inspect mobile or wide layout framing
- apply a preset to the full episode
- save a preset plus adjustments as a template

## Decision Handoff

Once a creator chooses a direction in comparison preview, the product should keep the decision actionable:

- carry the selected preset back to the full-episode preview
- preserve the creator's current control choices unless the creator changes them
- keep template-save behavior aligned with `docs/show-template-adaptation.md` Template Contents, Adaptation Flow
- avoid requiring the creator to re-pick the same preset after leaving comparison

## Review States

Keep comparison status simple and creator-facing:

- comparing — the creator is previewing two or more presets on the same episode moment
- chosen — the creator selected a preset to carry back to the full-episode preview
- needs another moment — the creator wants to compare presets on a different timestamp before deciding
- saved to template — the creator saved the chosen preset plus adjustments as a reusable show template

Each state should describe what happens next in `docs/preset-style-picker.md`, not a settings table or generic browse mode.

## Maintainer Acceptance Notes

Accept work that makes preset choice visual, comparative, and grounded in the current episode. Close work that turns preset selection into a settings table or uses generic mock previews after episode media is available.
