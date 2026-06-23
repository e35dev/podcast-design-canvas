# Show Notes Assembly

Show notes should turn the episode's confirmed context into a concise publish companion for viewers, platforms, and handoff packages.

## User Goal

A creator should be able to assemble accurate show notes for a long-form episode from confirmed chapters, guests, links, sponsors, and glossary terms before publishing.

## Sources

- title, description, and destination needs from `docs/episode-metadata-publishing.md`
- chapter titles and order from `docs/episode-chapter-markers.md`
- guest names, links, and reusable details from `docs/guest-profile-reuse.md`
- show-specific spellings from `docs/transcript-glossary.md`
- sponsor disclosures from `docs/sponsor-placement-review.md`

Show notes should stay downstream of metadata review rather than acting like a separate publishing screen. They should extend the creator's confirmed title, description, chapter, guest, and sponsor decisions with a destination-ready notes format.

## Creator Controls

Use simple controls:

- include or hide the chapter list
- edit the guest and link block
- add a short episode summary
- remove optional sections for destinations that do not need them
- copy notes into metadata or the export package

Avoid exposing raw transcript exports, HTML fields, SEO scoring, feed tags, or destination API settings in this path.

## Preview Contexts

Show notes that read well in the editor can fail on the destination where viewers actually see them, so the creator should preview the assembled notes before marking them ready:

- the podcast app listing with title and description together
- the chapter list as viewers will scroll it
- guest links and sponsor disclosure in plain text
- a mobile publish block where line breaks matter
- the copy that will paste into the export package handoff

Every context should use the confirmed chapter, guest, glossary, and sponsor content from this episode, so the creator judges one honest destination-ready format instead of a detached notes editor.

## Review States

Use simple states:

- ready
- needs source
- needs edit
- destination mismatch
- omitted

These states should appear in `docs/publish-checklist.md` only when show notes affect the chosen destination or final export package.

## Publish Readiness

Before export, show notes should:

- keep chapter order aligned with `docs/episode-chapter-markers.md`
- carry confirmed glossary spellings from `docs/transcript-glossary.md`
- preserve sponsor disclosure choices from `docs/sponsor-placement-review.md`
- follow destination requirements from `docs/publish-destination-presets.md`
- appear in the package summary described by `docs/export-package-handoff.md`

If a destination does not need show notes, the item should stay optional and never block publish readiness for a solo creator.

Show templates may remember section order, default link labels, and recurring boilerplate, but episode-specific summaries, chapters, guest links, and sponsor details should refresh before the notes are marked ready.

## Maintainer Acceptance Notes

Accept work that helps creators assemble accurate, destination-ready show notes from confirmed chapters, guests, glossary terms, and sponsor disclosures without opening a separate publishing screen. Close work that exposes raw transcript exports, SEO scoring, feed tags, or destination API settings, or that treats show notes as a detached content editor instead of an extension of confirmed metadata review.
