# Destination Crop Previews

Destination crop previews should show creators how the same episode design will look across publishing surfaces before export.

## User Goal

A creator should be able to check whether speakers, captions, logos, thumbnails, and sponsor elements still work when the episode is prepared for different destinations.

## Relationship To Export Flow

Destination crop review should start from episode context already in the workspace:

- publish destination defaults from `docs/publish-destination-presets.md`
- safe areas from `docs/layout-safe-areas.md`
- speaker framing from `docs/speaker-framing-safety.md`
- caption placement from `docs/audio-caption-quality-review.md`
- thumbnail selection from `docs/thumbnail-cover-frame.md`
- brand and sponsor placement from `docs/show-brand-kit-setup.md`
- export readiness summary from `docs/export-readiness-review.md`

Destination crop issues that would affect the chosen export destination should surface in `docs/export-readiness-review.md` Readability Warnings and Speaker Framing Warnings.

## Preview Surfaces

Support previews for:

- wide full episode
- mobile vertical crop
- square social preview
- thumbnail or cover frame
- client review copy
- archive master

The default export path can still prioritize long-form video, but the creator should see when another surface would crop or hide important content.

## Checks

Flag visible issues:

- active speaker is cropped
- captions fall outside safe area
- logo is cut off
- lower-third is unreadable
- sponsor mark conflicts with crop
- title text is too small in thumbnail view

Each issue should link to the affected preview surface and moment.

## Preview Approach

Crop review is surface first: creators compare the same episode moment across destinations side by side, then fix the layout once rather than tuning each crop in isolation.

## Review States

The product should use crop status to drive preview review and export readiness:

- **ready** — the chosen destination crop preserves speakers, captions, and brand marks without changes
- **needs review** — a crop hides content the creator may want to keep; show the affected preview surface and moment
- **fixed** — apply the chosen crop-safe layout change and refresh other destination previews
- **accepted** — keep the current crop when the creator marks the tradeoff as intentional and clear the related export warning
- **blocked for export** — when the chosen destination would crop out the active speaker or unreadable captions, keep the item in export readiness until the creator fixes or explicitly ignores it with the publishing consequence shown

Each state should describe what happens in preview, export warnings, and the next creator action—not only the label on the crop issue.

## Fixes

Offer direct fixes:

- use alternate crop
- move captions for this destination
- simplify thumbnail text
- use safer logo position
- switch layout for cropped output
- export only the long-form master

Avoid treating destination previews as a separate short-form editor that overrides the core long-form episode layout without the creator's confirmation.

## Maintainer Acceptance Notes

Accept work that helps creators trust destination-specific framing before export. Close work that treats every destination as identical or prioritizes short-form crops over the core long-form episode.
