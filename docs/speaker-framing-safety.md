# Speaker Framing Safety

Speaker framing checks should prevent polished layouts from hiding faces, gestures, or important on-camera context.

## User Goal

A creator should be able to apply presets, brand elements, captions, and b-roll without accidentally covering the speaker who matters in that moment.

## Relationship To Layout Review

Framing review should start from episode context already in the workspace:

- speaker roles and layout fit from `docs/speaker-role-mapping.md`
- preset layouts from `docs/preset-style-picker.md`
- safe areas and overlap rules from `docs/layout-safe-areas.md`
- destination crops from `docs/destination-crop-previews.md`
- contextual visuals from `docs/contextual-broll-moments.md`
- readability checks from `docs/accessibility-readability-checks.md`
- export warnings in `docs/export-readiness-review.md`

## Checks

Flag visible layout problems:

- face cropped too tightly
- active speaker covered by captions
- lower-third covers hands or important prop
- b-roll obscures the speaker during a reaction
- sponsor mark competes with the speaker frame
- panel layout makes one speaker unreadable
- mobile crop cuts off a guest

## Framing Approach

Framing review is moment first: creators preview the active speaker, current layout, destination crop, and approved visuals together at the timestamp where the issue appears.

## Review States

The product should use framing status to drive layout review and export readiness:

- **flagged** — show the issue on the affected moment and preview size; link directly to the timestamp without opening a separate crop editor
- **fixed** — apply the chosen layout change and refresh destination and mobile previews for that moment
- **applied broadly** — carry the same fix to similar moments after the creator confirms the pattern
- **accepted** — keep the current framing when the creator marks the overlap or crop as intentional and clear the related export warning
- **blocked for export** — when the chosen destination would hide the active speaker or key guest, keep the item in export readiness until the creator fixes or explicitly ignores it with the publishing consequence shown

Each state should describe what happens in preview, export warnings, and the next creator action—not only the label on the issue.

## Creator Controls

Offer direct fixes:

- recenter speaker
- widen frame
- move captions
- use alternate lower-third position
- reduce overlay size
- switch layout for this moment
- apply fix across similar moments
- mark framing as intentional

Avoid treating framing as a static crop tool or hiding mobile and destination previews from the default review path.

## Maintainer Acceptance Notes

Accept work that protects speaker visibility across presets, canvas edits, captions, overlays, and exports. Close work that treats framing as a static crop or ignores mobile and destination previews.
