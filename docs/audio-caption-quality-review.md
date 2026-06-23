# Audio And Caption Quality Review

Audio cleanup and captions should feel like one creator-facing quality pass, not two separate technical tools.

## User Goal

A creator should be able to make speech clearer, keep speaker volume balanced, and trust the captions before publishing a long-form episode.

## Relationship To Speech And Caption Review

Audio and caption review should start from episode context already in the workspace:

- speaker buckets and roles from `docs/speaker-role-mapping.md`
- names and spellings from `docs/social-context-intake.md` and `docs/transcript-glossary.md`
- cross-talk cleanup from `docs/pause-crosstalk-cleanup.md`
- speaker attribution from `docs/speaker-attribution-review.md`
- caption style from `docs/preset-style-picker.md`
- readability checks from `docs/accessibility-readability-checks.md`
- export warnings in `docs/export-readiness-review.md`

## Review Approach

Audio cleanup and caption review are one quality pass: creators fix speech clarity and caption trust in context, not through separate engineering tools or a raw transcript editor.

## Audio Controls

Use plain-language quality controls:

- reduce room noise
- balance speaker volume
- improve speech clarity
- soften harsh audio
- keep natural voice tone

Each control should preview the result on the current speaker and preserve a simple reset path. Avoid exposing compressor ratios, gates, bitrates, or filter chains in the default workflow.

## Caption Confidence

Caption review should focus attention where corrections matter most:

- low-confidence proper nouns
- names, companies, products, and show-specific phrases
- missing words during cross-talk
- captions that collide with lower-thirds or b-roll
- long lines that become hard to read

Corrections should apply across repeated terms when the creator confirms they are show-specific spellings.

## Caption Style Presets

Caption look and placement should follow the chosen visual preset, not a separate font menu the creator has to assemble by hand.

Style choices should start from the preset path in `docs/preset-style-picker.md` Controls and brand emphasis from `docs/show-brand-kit-setup.md` Brand Inputs. Each style should preview on the current episode's real caption lines.

| Style choice | Source spec | Relevant section |
| --- | --- | --- |
| caption presence and pacing feel | `docs/preset-style-picker.md` | Controls |
| brand emphasis and readability guardrails | `docs/show-brand-kit-setup.md` | Brand Inputs, Guardrails |
| placement and overlap checks | `docs/layout-safe-areas.md` | Safe Area Types, Checks |
| contrast, size, and motion readability | `docs/accessibility-readability-checks.md` | Checks, Creator Controls |
| template reuse | `docs/show-template-adaptation.md` | Template Contents |

Offer ready-to-use looks with plain-language steps:

- size: compact, standard, large
- placement zone: lower third, lower center, top safe band
- emphasis for names, products, and show terms
- motion: static lines, word-by-word reveal, or smooth fade

Use simple controls: choose a style that fits the preset, adjust size and placement with named steps, turn motion up or down, and keep one reset back to the preset default. Avoid keyframes, easing curves, font files, timecode offsets, or per-frame animation editing in this path.

Flag caption style only when it affects the finished episode:

- ready
- needs review
- conflict with lower-thirds, sponsor marks, or speaker faces

These states should surface in caption review and in `docs/publish-checklist.md` captions reviewed when placement or readability would affect export.

## Speaker Awareness

The product should keep audio and caption fixes tied to speaker buckets:

- show which speaker has the issue
- let creators preview only that speaker's track when useful
- preserve host and guest naming from ingest and social context
- avoid applying one guest's spelling corrections to another guest unless confirmed

When a creator trusts the words but not who is attached to them, speaker-label fixes should route to `docs/speaker-attribution-review.md` instead of being treated like a wording or style correction.

## Review Flow

The default review path should group issues by likely publishing impact:

- must fix before export
- worth reviewing
- informational

Creators should be able to jump from an issue to the affected moment, play the surrounding context, and mark it fixed or ignored.

Speaker-name mismatches, unlabeled exchanges, and off-camera voice confusion should open `docs/speaker-attribution-review.md` when the caption problem is really about who is speaking rather than how the text looks.

## Review States

The product should use audio and caption status to drive the quality pass and export readiness:

- **needs review** — surface issues grouped by publishing impact; link to the affected moment and speaker bucket
- **corrected** — apply the wording, audio, or style fix and refresh preview for that span
- **glossary applied** — carry confirmed spellings to repeated captions and linked metadata without clearing unrelated attribution issues
- **attribution handoff** — route speaker-label problems to `docs/speaker-attribution-review.md` or `docs/speaker-sync-repair.md` instead of treating them as caption-style fixes
- **approved for export** — clear only caption and audio checklist items when exported spans are accurate, readable, attributed, and clear enough for the destination
- **ignored for export** — record the publishing consequence for that issue; do not clear unrelated attribution, glossary, or cross-talk caption warnings

Each state should describe what happens to playback, captions, search, and export readiness—not only the label on the issue.

## Creator Controls

Offer simple actions:

- adjust plain-language audio controls per speaker
- edit caption text at the affected moment
- apply glossary spelling to repeated terms
- choose or reset caption style from the preset default
- jump to speaker attribution or sync repair when labels are wrong
- mark an issue fixed or ignored for export

Avoid exposing compressor settings, diarization scores, font files, or raw transcript editors in the default path.

## Maintainer Acceptance Notes

Accept work that makes speech clarity and caption accuracy easier to review before export. Close work that exposes audio engineering internals, treats captions as a raw transcript editor, ignores speaker buckets and long-form review needs, or clears unrelated attribution or glossary warnings when one caption issue is ignored.
