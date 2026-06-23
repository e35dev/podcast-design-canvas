# Canvas Layer Controls

The canvas editor should let advanced creators customize a podcast layout without losing the structure that makes presets feel polished.

## User Goal

A creator should be able to adjust speaker frames, captions, overlays, title elements, and b-roll zones directly on the canvas, then save those choices as a reusable show layout.

## Core Layers

The layer stack should use podcast-specific objects:

- speaker video frames
- captions
- lower-thirds
- title moments
- b-roll zones
- shapes and backgrounds
- logos, sponsor marks, and show branding
- safe-area guides for publishing destinations

Layer names should match what creators see in the episode. Avoid generic object names like rectangle 12 or media asset 4 in the primary UI.

## Direct Manipulation

Creators should be able to:

- drag and resize speaker frames
- crop a speaker without changing sync
- reorder overlays above or below video
- snap objects to common podcast layouts
- lock brand elements that should not move accidentally
- preview layout changes against real episode moments

When editing a preset, the canvas should preserve the preset's pacing and visual logic unless the creator intentionally changes it.

## Speaker And Moment Awareness

Canvas objects should understand episode context:

- speaker frames stay attached to speaker buckets
- lower-thirds inherit names and handles from social context
- captions avoid covering active speaker faces when possible
- b-roll zones can appear only during approved moments
- title elements can inherit episode metadata

The editor should make context visible enough to guide the creator, without turning the canvas into a timeline engineering tool.

## Reuse Requirements

Before saving a canvas layout as a template, confirm which parts should adapt next time:

- speaker count and roles
- guest names and lower-thirds
- brand colors and logo placement
- caption style
- title moment treatment
- b-roll placement rules

## Maintainer Acceptance Notes

Accept work that makes canvas editing feel visual, structured, and reusable for podcast layouts. Close work that becomes a generic design editor, breaks speaker-track relationships, or removes the strong preset foundation.
