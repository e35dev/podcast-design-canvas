# Layout Safe Areas

Safe areas should help creators place captions, lower-thirds, logos, and sponsor marks where viewers can actually read them.

## User Goal

A creator should be able to design a podcast layout and see which regions are safe for text, speaker faces, brand marks, and visual moments.

## Relationship To Layout Review

Safe area review should start from episode context already in the workspace:

- speaker roles and frame prominence from `docs/speaker-role-mapping.md`
- preset layouts from `docs/preset-style-picker.md`
- brand placement rules from `docs/show-brand-kit-setup.md`
- destination crops from `docs/destination-crop-previews.md`
- caption style from `docs/audio-caption-quality-review.md`
- speaker framing checks from `docs/speaker-framing-safety.md`
- readability checks from `docs/accessibility-readability-checks.md`

Layout conflicts that would affect the chosen export destination should surface in `docs/export-readiness-review.md` Readability Warnings.

## Safe Area Types

Show guidance for:

- speaker face area
- caption area
- lower-third area
- logo area
- sponsor area
- thumbnail title area
- mobile crop area
- review watermark area

Guides should appear when useful and stay out of the way during normal preview.

## Checks

Flag layout conflicts:

- caption overlaps lower-third
- sponsor mark enters speaker face area
- logo is outside destination crop
- title card text sits under review watermark
- b-roll covers important speaker gesture

The product should link conflicts to the affected moment and destination.

## Safe Area Approach

Safe area review is destination aware: creators preview overlap problems at the timestamp and export size where the conflict would appear, not through a detached grid editor.

## Review States

The product should use safe area status to drive layout review and export readiness:

- **flagged** — show the overlap on the affected moment and destination preview; link directly to the timestamp
- **fixed** — apply the chosen reposition or resize and refresh mobile and destination previews for that moment
- **applied broadly** — carry the same safe area adjustment to similar moments after the creator confirms the pattern
- **accepted** — keep the current placement when the creator marks the overlap as intentional and clear the related export warning
- **blocked for export** — when the chosen destination would hide captions, logos, or sponsor marks, keep the item in export readiness until the creator fixes or explicitly ignores it with the publishing consequence shown

Each state should describe what happens in preview, export warnings, and the next creator action—not only the label on the conflict.

## Creator Controls

Offer direct fixes:

- move captions to a safer zone
- shrink or reposition lower-thirds
- move logo or sponsor mark
- switch layout for this destination
- apply fix across similar moments
- mark overlap as intentional

Avoid treating safe areas as static overlay templates that ignore real episode speakers, brand kit choices, or destination crops.

## Template Behavior

Safe areas should be saved with templates where appropriate, but each episode should re-check them against its actual speaker count, brand kit, and export destination.

## Maintainer Acceptance Notes

Accept work that makes layout safety visible and reusable across presets, canvas editing, thumbnails, and exports. Close work that adds static guides without checking real episode content.
