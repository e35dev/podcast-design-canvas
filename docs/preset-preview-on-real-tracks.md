# Preset Preview On Real Tracks

Preset preview should show how the selected visual style works with the creator's actual synced episode tracks, not generic sample cards.

## User Goal

A creator should be able to compare preset directions on the same real podcast moment before applying one to the canvas.

## Preview Inputs

Use the current episode setup from `docs/preset-style-picker.md`:

- synced host and guest recordings
- confirmed speaker names and role labels
- available brand colors or neutral defaults
- current caption sample from the episode transcript
- selected destination shape when one has already been chosen

When an input is missing, keep the preview honest by showing a plain missing state instead of inventing a polished speaker or brand.

## Preset Comparison

Each preview should render the same episode moment so differences are visible:

- layout density and speaker framing
- caption presence and placement
- visual moment energy
- branding strength
- b-roll or title-card room
- mobile crop behavior when the destination is vertical

Preset cards should communicate through the preview first and short labels second.

## Real Episode Fit

Preset previews should prove that the choices in `docs/preset-style-picker.md` work on the selected episode rather than on an ideal sample.
A preview is trustworthy only when it:

- uses the speaker count the preset claims to support, including panel presets when three or more confirmed speakers exist
- makes layout, caption style, speaker focus, and branding differences visible before labels explain them
- shows a missing or reduced-fit state when the episode lacks enough confirmed speakers, captions, or brand inputs for that preset
- keeps every comparison on the same episode moment so the creator can judge identity and fit without sample-only data

Avoid inventing extra speakers, sample brands, or polished fallback captions just to make a preset card look complete.

## Creator Controls

Use simple controls:

- choose the episode moment to compare
- switch between preset cards
- preview desktop, square, or vertical crop
- apply the selected preset to the episode
- reset back to the current preset choice

Avoid sample-only speakers, fake brand kits, rendering engines, canvas coordinates, timeline tracks, or manual layout controls in this first decision path.

## Review States

Use creator-facing preview states:

- ready to apply
- missing speaker match
- missing caption sample
- needs crop check
- brand kit unavailable

These states should appear inside the preset picker only when they change whether the preview is trustworthy.

## Apply Behavior

Applying a preset should carry the chosen layout, caption presence, visual moment energy, and branding strength into `docs/preset-style-picker.md` Controls without making the creator rebuild the same choice on a blank canvas.
