# Audio And Caption Quality Review

Audio cleanup and captions should feel like one creator-facing quality pass, not two separate technical tools.

## User Goal

A creator should be able to make speech clearer, keep speaker volume balanced, and trust the captions before publishing a long-form episode.

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

## Speaker Awareness

The product should keep audio and caption fixes tied to speaker buckets:

- show which speaker has the issue
- let creators preview only that speaker's track when useful
- preserve host and guest naming from ingest and social context
- avoid applying one guest's spelling corrections to another guest unless confirmed

## Review Flow

The default review path should group issues by likely publishing impact:

- must fix before export
- worth reviewing
- informational

Creators should be able to jump from an issue to the affected moment, play the surrounding context, and mark it fixed or ignored.

## Maintainer Acceptance Notes

Accept work that makes speech clarity and caption accuracy easier to review before export. Close work that exposes audio engineering internals, treats captions as a raw transcript editor, or ignores speaker buckets and long-form review needs.
