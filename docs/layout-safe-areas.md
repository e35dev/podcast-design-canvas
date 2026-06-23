# Layout Safe Areas

Safe areas should help creators place captions, lower-thirds, logos, and sponsor marks where viewers can actually read them.

## User Goal

A creator should be able to design a podcast layout and see which regions are safe for text, speaker faces, brand marks, and visual moments.

## Relationship To Layout Review

Safe area review should start from episode context already in the workspace:

- speaker framing from `docs/speaker-framing-safety.md`
- destination crops from `docs/destination-crop-previews.md`
- readability checks from `docs/accessibility-readability-checks.md`
- preset layouts from `docs/preset-style-picker.md`
- canvas layers from `docs/canvas-layer-controls.md`
- brand placement from `docs/show-brand-kit-setup.md`
- reusable templates from `docs/show-template-adaptation.md`
- export warnings in `docs/export-readiness-review.md`

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

## Layout Approach

Safe area review is moment first on real episode content: guides should help creators see readable placement on the current speakers, captions, and destination crops—not static overlays that ignore the finished layout.

## Checks

Flag layout conflicts:

- caption overlaps lower-third
- sponsor mark enters speaker face area
- logo is outside destination crop
- title card text sits under review watermark
- b-roll covers important speaker gesture

The product should link conflicts to the affected moment and destination.

## Review States

The product should use safe-area status to drive layout review and export readiness:

- **clear** — no overlap conflict for the targeted surface and moment
- **flagged** — show the conflict on the affected moment and preview surface; link directly to the fixing control
- **adjusted** — apply the chosen placement change and refresh destination and mobile previews for that moment
- **accepted** — keep the current overlap when the creator marks it intentional and clear only the related safe-area warning with the publishing consequence shown
- **not relevant for destination** — hide safe-area checks that do not affect the chosen export package

Each state should describe what happens in preview, export readiness, and template reuse—not only the label on the guide.

## Creator Controls

Offer simple actions:

- move captions, lower-thirds, logos, or sponsor marks
- switch to an alternate placement zone
- preview the conflict on mobile or thumbnail crops
- apply a fix across similar moments
- mark an overlap as intentional
- save safe-area defaults to a show template

Avoid static guides that never re-check real episode speakers, captions, or destination crops.

## Template Behavior

Safe areas should be saved with templates where appropriate, but each episode should re-check them against its actual speaker count, brand kit, and export destination.

## Maintainer Acceptance Notes

Accept work that makes layout safety visible and reusable across presets, canvas editing, thumbnails, and exports. Close work that adds static guides without checking real episode content, or clears unrelated caption or framing warnings when a safe-area overlap is marked accepted.
