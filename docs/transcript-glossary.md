# Transcript Glossary

A show glossary should make recurring names, brands, and phrases accurate across captions, metadata, title cards, and templates.

## User Goal

A creator should be able to approve important spellings once and have those corrections improve future episodes without editing every caption by hand.

## Relationship To Caption And Metadata Review

Glossary review should start from episode context already in the workspace:

- names and spelling notes from `docs/social-context-intake.md`
- caption confidence from `docs/audio-caption-quality-review.md`
- guest reuse details from `docs/guest-profile-reuse.md`
- metadata and show notes from `docs/episode-metadata-publishing.md` and `docs/show-notes-assembly.md`
- title cards and lower-thirds from contextual visual specs
- searchable transcript moments from `docs/transcript-search-navigation.md`
- export warnings in `docs/export-readiness-review.md`

## Glossary Entries

Support entries for:

- host and guest names
- company names
- product names
- sponsor names
- show segments
- recurring jargon
- acronyms
- common misspellings

Entries should include the approved spelling, optional pronunciation note, and where the term should be used.

## Glossary Approach

Glossary review is approve once, apply visibly: creators confirm spellings on real caption or metadata lines, and approved terms improve visible episode outputs without silently rewriting speaker intent.

## Sources

The product can suggest glossary entries from:

- social context
- repeated transcript corrections
- show templates
- episode metadata
- sponsor kits
- creator notes

Suggestions should require creator approval before they become reusable.

## Preview Contexts

Creators should preview glossary corrections on the surfaces where the term will actually appear:

- a real caption line with the corrected term in context
- a chapter title or metadata line that reuses the same wording
- a lower-third or title card where the approved spelling changes visible on-screen text
- a transcript search result where the corrected term should become easier to find

Previewing the correction on more than one surface helps creators confirm that the approved spelling improves the episode package instead of only fixing one caption line.

Useful glossary previews should also:

- keep the original wording visible alongside the corrected version before approval
- show when the same correction would update more than one repeated instance in the episode
- make it obvious which surfaces change now versus which ones become reusable for later episodes after confirmation
- keep the creator focused on whether the corrected term improves the visible episode package
- preserve the same caption or metadata moment while switching between original and corrected text

## Application

Approved glossary entries should improve:

- captions
- transcript search
- title cards
- chapter titles
- lower-thirds
- descriptions
- thumbnails

The product should show when a correction was applied across repeated instances.

## Review States

The product should use glossary entry status to drive spelling review and export readiness:

- **suggested** — show the proposed spelling with its source; do not apply it until the creator approves
- **needs review** — surface conflicting spellings or low-confidence sources; keep related glossary warnings in export readiness until resolved
- **approved** — apply the spelling to the chosen surfaces for this episode and future show reuse after confirmation; clear only glossary-related checklist items when applied spans are satisfied
- **declined** — stop offering the suggestion without clearing unrelated caption or attribution warnings
- **applied across episode** — show which moments changed and allow undo before the correction becomes reusable show-wide

Each state should describe what happens to captions, metadata, search, and export readiness—not only the label on the entry.

## Creator Controls

Offer simple actions:

- approve a suggested entry in one action
- edit the approved spelling or pronunciation note
- choose where a term applies, such as captions, titles, or descriptions
- merge duplicate entries for the same term
- decline a suggestion
- preview the change on a real caption line before spreading it
- undo a correction that was applied across the episode

New entries should default to the current episode and become reusable for the show only after the creator confirms them.

Avoid silently changing speaker words, storing sensitive inferred details, or separating glossary corrections from visible episode outputs.

## Maintainer Acceptance Notes

Accept work that improves transcript and caption accuracy through reusable creator-approved spellings. Close work that silently changes speaker words, stores sensitive inferred details, separates glossary corrections from visible episode outputs, or clears unrelated attribution or caption warnings when a glossary entry is declined or approved.
