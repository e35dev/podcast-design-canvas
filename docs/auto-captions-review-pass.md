# Auto-Captions Review Pass

A guided walkthrough that helps a creator confirm and correct auto-generated captions across an hour-plus episode before publishing.

## User Goal

A creator should be able to review every flagged caption line, apply glossary corrections, and mark the episode's captions as reviewed without scrubbing through the full timeline by hand.

## When To Start

The review pass becomes available after:

- auto-generated captions are ready for the episode
- the transcript glossary from `docs/transcript-glossary.md` has been loaded

The pass should pre-apply approved glossary spellings so the creator reviews only what the system could not resolve on its own.

## Flagged Lines

The pass surfaces lines that need creator attention:

- low-confidence words or phrases
- proper nouns not found in the glossary
- cross-talk segments with missing or overlapping text
- lines that exceed readable length after style placement
- timestamps where speaker attribution is uncertain

Each flagged line should show the surrounding audio context and let the creator play, correct, or confirm in place.

## Creator Controls

Use simple controls:

- play the flagged moment with a few seconds of surrounding audio
- accept the suggested caption as correct
- edit the text and optionally add the correction to the glossary
- skip a flag to return to it later — skipped flags remain unresolved
- mark a section as reviewed

Avoid exposing confidence scores, alignment timecodes, language-model internals, or raw transcript diffs.

## Review Progress

Track the creator's position through the episode:

- not started
- in progress — with a count of remaining flags
- has skips — all flags visited but some were skipped
- reviewed — every flag accepted, corrected, or waived
- done — creator has confirmed the pass is complete

A flag can be resolved by accepting it, correcting it, or explicitly waiving it. Skipped flags do not count as resolved. The pass cannot reach reviewed until every skipped flag has been revisited and resolved or waived.

Progress should persist across sessions so a creator can pause and resume a long episode.

## Publish Readiness

When the pass reaches done, the captions-reviewed item in `docs/publish-checklist.md` should reflect that status. If the pass is in has skips, the publish checklist should show captions as needs review and link back to the remaining skipped flags.

If new captions are regenerated or the glossary changes after the pass, the status should return to needs review so the creator can re-check affected lines.
