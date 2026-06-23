# Publish Destination Presets

Destination presets should translate export settings into publishing outcomes creators understand.

## User Goal

A creator should be able to choose where the episode is going and get sensible defaults for video, audio, captions, metadata, and thumbnail packaging.

## Relationship To Export Flow

Destination choice should shape defaults across:

- metadata fields in `docs/episode-metadata-publishing.md`
- thumbnail requirement in `docs/thumbnail-cover-frame.md`
- caption behavior in `docs/audio-caption-quality-review.md`
- review watermark in `docs/client-review-copy-flow.md`
- sponsor disclosure in `docs/sponsor-placement-review.md`
- final readiness in `docs/publish-checklist.md` and `docs/export-readiness-review.md`
- package delivery in `docs/export-package-handoff.md`

Presets should describe publishing outcomes, not encoder menus.

## Destinations

Support common long-form podcast destinations:

- YouTube full episode
- private client review
- archive master
- audio-only podcast backup
- sponsor approval copy
- internal team review

Each destination should describe what will be included in the final package.

## Preset Effects

Destination presets can set:

- video size
- audio mix target
- caption behavior
- thumbnail requirement
- metadata fields
- watermark or review label
- file naming
- export readiness checks

Advanced settings can be available, but the default flow should not require render expertise.

## Review States

Before export, show what differs from the recommended preset:

- missing thumbnail
- captions excluded
- metadata incomplete
- review watermark disabled
- sponsor disclosure missing
- archive quality reduced

Each state should explain the publishing consequence, such as "YouTube export will ship without chapter metadata" rather than listing setting names.

## Maintainer Acceptance Notes

Accept work that makes export choices map to real publishing destinations. Close work that exposes raw encoder menus as the primary experience or treats every destination like the same generic download.
