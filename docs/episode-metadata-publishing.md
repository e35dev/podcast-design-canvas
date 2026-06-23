# Episode Metadata Publishing

Publishing metadata should be prepared alongside the finished video so creators can export with a complete episode package.

## User Goal

A creator should be able to confirm the title, description, chapters, guest links, and destination-specific details before downloading or publishing a long-form episode.

## Relationship To Export Flow

This review starts from episode context already captured in the workspace:

- speaker roles and names from episode ingest
- guest links and spelling notes from `docs/social-context-intake.md`
- glossary terms from `docs/transcript-glossary.md`
- chapter and segment structure from `docs/show-segment-system.md`
- sponsor details from `docs/sponsor-placement-review.md`
- thumbnail selection from `docs/thumbnail-cover-frame.md`
- destination defaults from `docs/publish-destination-presets.md`

Metadata editing should not feel like a separate CMS. Fields should stay tied to the episode the creator just finished reviewing.

## Metadata Fields

The product should support:

- episode title
- show name and episode number
- short description
- full description
- guest names and links
- chapter markers
- sponsor disclosure
- publish destination
- thumbnail or cover frame

Fields should start from episode context where possible, but creators must be able to edit them before export.

## Chapter Workflow

Chapters should be generated from meaningful conversation transitions, not arbitrary time blocks. The creator should be able to:

- rename a chapter
- merge weak chapters
- remove spoilers or sensitive references
- jump from a chapter to the timeline
- use chapter titles as title card candidates

Chapters should remain useful for hour-plus episodes with many topic shifts.

## Destination Fit

Destination choices should shape defaults defined in `docs/publish-destination-presets.md`:

- YouTube full episode
- private client review
- archive master
- audio-only podcast backup
- sponsor approval copy
- internal team review

The product should surface only the metadata required or useful for the chosen destination. Advanced fields can be tucked behind a secondary control.

## Review States

Use creator-facing states:

- complete
- needs review
- missing
- low confidence
- not needed for destination

Each state should describe what a publisher would notice, such as "Guest link still points to the wrong profile" or "Chapter title may spoil the ending."

## Creator Controls

Offer simple actions:

- edit title or description
- apply glossary spelling
- confirm guest link
- rename or merge chapter
- add sponsor disclosure
- choose thumbnail frame
- copy metadata for another destination
- reset field to episode default

Avoid exposing feed schemas, platform API fields, or bulk metadata import as the default workflow.

## Readiness Checks

Before final export, flag:

- missing title
- missing or weak description
- unreviewed guest links
- chapter markers with low confidence
- thumbnail frame not selected
- sponsor disclosure missing when sponsor visuals are present

Metadata issues that would affect the chosen export destination should surface in `docs/export-readiness-review.md` Metadata Warnings.

These checks should appear in `docs/publish-checklist.md` with a direct link back to the field that needs attention.

## Maintainer Acceptance Notes

Accept work that makes the finished episode easier to publish with complete, editable metadata. Close work that turns metadata into generic CMS fields or ignores the long-form podcast export flow.
