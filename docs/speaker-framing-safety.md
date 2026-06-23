# Speaker Framing Safety

Speaker framing checks should prevent polished layouts from hiding faces, gestures, or important on-camera context.

## User Goal

A creator should be able to apply presets, brand elements, captions, and b-roll without accidentally covering the speaker who matters in that moment.

## Checks

Flag visible layout problems:

- face cropped too tightly
- active speaker covered by captions
- lower-third covers hands or important prop
- b-roll obscures the speaker during a reaction
- sponsor mark competes with the speaker frame
- panel layout makes one speaker unreadable
- mobile crop cuts off a guest

Warnings should link to the exact moment and preview size where the issue appears.

## Fixes

Offer direct fixes:

- recenter speaker
- widen frame
- move captions
- use alternate lower-third position
- reduce overlay size
- switch layout for this moment
- apply fix across similar moments

## Context Awareness

The product should treat the active speaker, current layout, destination crop, and approved visual moments as part of the same framing decision.

## Maintainer Acceptance Notes

Accept work that protects speaker visibility across presets, canvas edits, captions, overlays, and exports. Close work that treats framing as a static crop or ignores mobile and destination previews.
