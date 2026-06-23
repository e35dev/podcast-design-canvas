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

Show notes should stay tied to this metadata flow through `docs/show-notes-assembly.md` when a destination needs a companion description, chapter list, guest links, or sponsor text beyond the core title and description fields.

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

## Review Approach

Metadata review should stay publish first:

- start with the selected destination and show only the fields that matter there
- preview the title, description, chapters, links, and disclosure text as they would appear to the final audience
- keep helpful episode defaults visible so the creator can confirm them instead of rewriting everything
- surface missing or low-confidence fields as clear publishing decisions, not generic form errors

Creators should feel like they are checking a publish-ready episode package, not filling out a detached CMS screen.

Useful metadata previews include:

- the long-form destination page with title, description, and thumbnail together
- a chapter list preview for destinations that expose timestamps or sections
- a sponsor disclosure preview where required by the chosen destination
- a copyable client-review or sponsor-approval preview when the destination is not the public publish target
- the guest-link and title pairing exactly as it will appear beside the final episode art

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
- open show notes assembly
- copy metadata for another destination
- reset field to episode default

Avoid exposing feed schemas, platform API fields, or bulk metadata import as the default workflow.

## Show Defaults

Some metadata stays the same from episode to episode. A creator should be able to save a few show-level defaults once and have each new episode start already filled in, so they confirm rather than retype.

Let creators save defaults for steady fields:

- show name and episode number pattern
- default short description opening or sign-off line
- standard sponsor disclosure wording
- preferred thumbnail or cover frame style
- usual publish destination for a new episode

These defaults should prefill a new episode the moment it opens, and every prefilled field stays fully editable. Editing a prefilled field changes only that episode and never the saved show default. Changing a saved show default applies going forward and never reaches back into episodes already in review.

Each show default carries one of two states, and a field is always in exactly one of them:

- saved — the value is remembered and will prefill the next new episode
- not yet saved — nothing is remembered yet, so this field starts empty for a new episode

When a field has been prefilled from a saved default and the creator then edits it, show a quiet inline marker beside that single field, such as "Different from your show default." When the episode matches the saved defaults, show nothing. Surface this as one calm inline note on the field itself, never a banner and never a running list.

Offer two simple actions where defaults appear:

- save the current value as the show default
- restore this field to the saved show default

Show defaults should make starting the next episode feel like a head start, not another setup screen.

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
