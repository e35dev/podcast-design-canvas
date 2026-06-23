# Retake Selection

When a speaker redoes a line, the product should help the creator keep the best take without hunting through the timeline.

## User Goal

A creator should be able to spot repeated attempts at the same line and keep the preferred one across a long episode.

## How Retakes Are Found

Retake candidates can come from:

- near-identical phrasing repeated close together in the transcript
- a speaker restarting after a stumble
- a creator-marked "use this take"

Suggested retakes are a starting point; the creator decides which take to keep.

## Relationship To Speech Review

Retake selection only chooses between attempts at the same line. Filler words stay in `docs/filler-word-cleanup.md`, pauses and cross-talk stay in `docs/pause-crosstalk-cleanup.md`, and transcript accuracy stays in `docs/transcript-glossary.md`.

## Creator Controls

The creator should be able to:

- review grouped takes with a short preview of each attempt
- keep one take and drop the others for this episode
- keep all takes when the repetition is intentional, such as emphasis
- jump to the moment to confirm before applying
- undo a take choice

## Quality Rules

Retake handling should stay safe and natural:

- never remove a take without creator confirmation
- keep transitions natural between the kept content
- do not change the meaning of what was said

## Maintainer Acceptance Notes

Accept work that helps creators pick the best take of a repeated line in long-form episodes. Close work that auto-removes takes without confirmation, exposes raw timeline editing, or optimizes for short clips.
