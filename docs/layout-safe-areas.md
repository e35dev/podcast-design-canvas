# Layout Safe Areas

Safe areas should help creators place captions, lower-thirds, logos, and sponsor marks where viewers can actually read them.

## User Goal

A creator should be able to design a podcast layout and see which regions are safe for text, speaker faces, brand marks, and visual moments.

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

Layout conflicts that would affect the chosen export destination should surface in `docs/export-readiness-review.md` Readability Warnings.

## Review States

Use simple creator-facing states:

- flagged — show the overlap on the affected moment and destination preview
- fixed — apply reposition or resize and refresh previews for that moment
- applied broadly — carry the same adjustment to similar moments after confirmation
- accepted — creator marks overlap as intentional and clears the related export warning
- blocked for export — destination would hide captions, logos, or sponsor marks until fixed or ignored with consequence shown

Each state should describe what happens in preview, export warnings, and the next creator action.

## Template Behavior

Safe areas should be saved with templates where appropriate, but each episode should re-check them against its actual speaker count, brand kit, and export destination.

## Creator Controls

Safe areas should be adjustable while staying tied to real episode content. The creator should be able to:

- show or hide individual safe-area guides while designing the layout
- resolve a flagged conflict by moving the caption, lower-third, logo, or sponsor mark out of the affected area
- switch to an alternate layout for a destination crop when an element cannot fit safely
- adjust a safe-area region for the current episode or save the change to the show template
- re-check safe areas against a different export destination, speaker count, or brand kit
- keep a deliberate overlap when the creator confirms it stays readable

A safe-area change should re-check the affected moment and destination rather than applying a static guide everywhere.

## Maintainer Acceptance Notes

Accept work that makes layout safety visible and reusable across presets, canvas editing, thumbnails, and exports. Close work that adds static guides without checking real episode content.
