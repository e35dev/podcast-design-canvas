# Transcript Search Navigation

Transcript search should help creators find important moments in long episodes without scrubbing the timeline manually.

## User Goal

A creator should be able to search names, topics, glossary terms, sponsor mentions, and repeated phrases, then jump directly to the relevant episode moments.

## Search Inputs

Support searches for:

- exact words
- approved glossary terms
- speaker names
- sponsor names
- chapter titles
- segment names
- corrected caption text

Search should use the reviewed transcript where available, not only the first machine transcript.

## Results

Each result should show:

- timestamp
- speaker
- short surrounding quote
- chapter or segment context
- caption confidence when relevant
- whether the term has been corrected by the glossary

Results should jump to the episode preview with a small lead-in.

When a creator pins a result as a reusable moment, that pinned item should flow into `docs/clip-candidate-review.md` Candidate Signals and Review Cards without losing the speaker, chapter, or surrounding quote context shown here.

## Filters

Useful filters include:

- speaker
- chapter
- segment
- reviewed or unreviewed
- caption issue present
- visual moment present

## Maintainer Acceptance Notes

Accept work that makes long-form transcript navigation useful for editing, captions, chapters, and visual moments. Close work that treats search as a generic text box disconnected from the episode preview and speaker context.
