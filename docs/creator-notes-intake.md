# Creator Notes Intake

Creator notes intake should let a solo podcast creator add rough episode context once, then use it to improve the edit without turning notes into another production workspace.

## User Goal

A creator should be able to add rough notes, attach them to the right speaker or episode moment, and review how they influence transcript spellings, chapters, visuals, metadata, and show notes before export.

## Accepted Notes

Support lightweight notes that help the finished episode:

- episode outline or planned talking points
- guest-provided links or spelling reminders
- topic names, product names, or recurring phrases
- moments the creator wants to revisit after ingest
- references that should help title cards, b-roll, or show notes

Notes should start as context, not visible output. The product should show where a note is used before it changes captions, chapters, visuals, metadata, or the export package.

## Creator Controls

Use simple controls:

- paste or upload a short note list during setup
- attach a note to the whole episode, a speaker bucket, or a marked moment
- turn a note into a glossary suggestion
- turn a note into a chapter or title-card candidate
- hide a note from future suggestions for this episode

Avoid project management tasks, private research files, prompt templates, raw transcript imports, scoring models, or note databases in this path.

## Review States

Use simple creator-facing states:

- imported
- needs match
- suggested
- applied
- hidden

These states should appear only when notes affect the creator's current review task. A note that never becomes visible in the finished episode should not create an export warning.

## Routing To Owning Specs

Creator notes are an input source, not a second place to review captions, visuals, or metadata.

Route each note to the spec that owns the visible outcome:

- spelling and recurring phrase notes flow to `docs/transcript-glossary.md`
- speaker names, links, and public context flow through `docs/social-context-intake.md`
- outline beats and topic shifts become candidates in `docs/episode-chapter-markers.md`
- visual references flow to `docs/contextual-broll-moments.md` or `docs/contextual-title-cards.md`
- title, description, and guest-link hints flow to `docs/episode-metadata-publishing.md`
- publish companion text flows to `docs/show-notes-assembly.md`

The intake surface should show routing in plain language, such as "Used for chapter suggestions" or "Used for glossary spellings," so the creator can remove a note without hunting through downstream screens.

## Publish Readiness

Creator notes should not add a new checklist item in `docs/publish-checklist.md`. Readiness should come from the downstream review surface that used the note: glossary corrections, chapter markers, contextual visuals, metadata, or show notes.

When a note is hidden or left unused, export can continue. When a note generated a visible suggestion, the owning review state decides whether that suggestion is ready, needs review, or should stay out of the exported episode.
