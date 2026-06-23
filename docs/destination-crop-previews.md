# Destination Crop Previews

Destination crop previews should show creators how the same episode design will look across publishing surfaces before export.

## User Goal

A creator should be able to check whether speakers, captions, logos, thumbnails, and sponsor elements still work when the episode is prepared for different destinations.

## Relationship To Layout Review

Destination crop review should start from episode context already in the workspace:

- safe areas and overlap rules from `docs/layout-safe-areas.md`
- speaker framing from `docs/speaker-framing-safety.md`
- readability checks from `docs/accessibility-readability-checks.md`
- thumbnail framing from `docs/thumbnail-cover-frame.md`
- destination defaults from `docs/publish-destination-presets.md`
- export warnings in `docs/export-readiness-review.md`

## Preview Approach

Crop preview is long-form first: the core episode layout remains primary, and destination surfaces show where crops would hide speakers, captions, logos, or sponsor marks—not replace the editing workflow with short-form-first design.

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

## Review States

The product should use preview-surface status to drive crop review and export readiness:

- **ok** — content stays inside safe framing for a targeted surface; clear only that surface's crop warnings in `docs/export-readiness-review.md`
- **needs attention** — surface a cropped or hidden element on the affected preview; block export only when that surface is required for the chosen destination
- **not targeted** — hide checks for surfaces the creator is not publishing to this episode; do not clear unrelated caption, metadata, or sponsor warnings
- **reviewed** — record that the creator accepted how the surface looks, including any publishing consequence; do not treat acceptance as resolving unrelated readability or caption-accuracy work

Each state should describe what happens for that preview surface at export time—not only the label on the crop preview.

Surface states stay focused on visual framing. The publishing destination itself is still chosen in `docs/publish-destination-presets.md`.

## Creator Controls

Offer direct fixes:

- use alternate crop
- move captions for this destination
- simplify thumbnail text
- use safer logo position
- switch layout for cropped output
- export only the long-form master
- mark which surfaces matter for this episode
- set a surface as not targeted
- mark a surface reviewed
- reopen a surface if the layout or crop changes later

Marking a surface should never alter the long-form master; it only changes which crop previews the creator is actively reviewing.

Avoid treating every destination surface as equally urgent or prioritizing short-form crops over the core long-form episode.

## Maintainer Acceptance Notes

Accept work that helps creators trust destination-specific framing before export. Close work that treats every destination as identical, prioritizes short-form crops over the core long-form episode, or clears unrelated publish-readiness warnings when a surface is marked not targeted or reviewed.
