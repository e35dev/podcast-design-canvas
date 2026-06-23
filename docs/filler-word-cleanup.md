# Filler Word Cleanup

Tightening filler words should make speech feel cleaner without making the conversation sound unnatural.

## User Goal

A creator should be able to reduce ums, uhs, and false starts across a long episode with simple choices, not manual waveform editing.

## What It Targets

- verbal fillers such as um, uh, and er
- repeated false starts like "I— I think we should"
- long trailing "you know" or "like" runs, off by default

The goal is cleaner delivery, never changing what a speaker meant.

## Relationship To Speech Review

Filler cleanup only tightens delivery. Pauses and cross-talk stay in `docs/pause-crosstalk-cleanup.md`, transcript and caption accuracy stay in `docs/transcript-glossary.md` and `docs/audio-caption-quality-review.md`, and audio quality such as noise and leveling stays in `docs/audio-cleanup-controls.md`.

## Cleanup Approach

- the product suggests removable fillers; the creator approves them in batches
- preview the tightened moment before applying
- keep natural rhythm and breaths rather than producing choppy cuts

## Creator Controls

The creator should be able to:

- accept all suggested filler removals, or review them per speaker or section
- choose a light or balanced amount of cleanup
- exclude a speaker whose style relies on natural cadence
- restore any removed filler
- save the preference to the show template for future episodes

## Quality Rules

Cleanup should protect the conversation:

- never cut real words or change meaning
- keep natural pauses and breaths
- avoid audible jump cuts; smooth each edit
- leave intentional emphasis or comedic timing alone

## Maintainer Acceptance Notes

Accept work that tightens filler words as a simple creator-facing choice for long-form episodes. Close work that exposes waveform editing, over-cuts speech into choppy audio, or changes what was said.
