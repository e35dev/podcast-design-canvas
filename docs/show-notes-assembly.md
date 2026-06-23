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

## Creator Controls

Use simple controls:

- include or hide the chapter list
- edit the guest and link block
- add a short episode summary
- remove optional sections for destinations that do not need them
- copy notes into metadata or the export package

Avoid exposing raw transcript exports, HTML fields, SEO scoring, feed tags, or destination API settings in this path.

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
