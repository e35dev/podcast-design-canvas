# Music Ducking Under Speech

Music ducking should protect spoken podcast moments after a cue has already been added, approved, and placed through the music cue setup flow.

## User Goal

A creator should be able to keep intro, outro, transition, sponsor, and chapter music present without making hosts or guests harder to understand.

## Relationship To Cue Setup

This review starts from placed cues defined in `docs/music-cue-setup.md`:

- the cue has a source
- usage approval is known
- the cue is attached to an intro, outro, segment transition, sponsor read, title moment, or chapter bumper
- the product can preview the cue against the current episode audio

Ducking should not introduce a separate music timeline or ask creators to manage raw audio lanes.

## When To Flag

Flag only overlaps that affect the finished episode:

- music continues under the first spoken line
- outro music starts before the final sentence ends
- segment transition music covers the next speaker
- sponsor music competes with the read
- title moment accent masks an important phrase
- chapter bumper runs under a guest answer
- template cue balance no longer fits a new episode

Short intentional overlaps can stay quiet when speech remains clear.

## Preview Contexts

Creators should judge ducking on episode moments where speech clarity is easiest to lose:

- the first spoken line after intro music
- a guest answer under a chapter bumper
- a sponsor read with bed music active
- a transition where one speaker starts before the cue fully fades
- an outro where the final sign-off overlaps the closing music

These previews should let the creator hear the spoken line and the cue in the same context, not as detached volume controls.

Useful ducking previews should also:

- keep the same spoken line while the creator compares featured music versus lowered music
- preserve nearby captions so the creator can tell when the cue makes speech less trustworthy to read
- make the before-and-after timing difference obvious on the same episode moment
- keep the listener focused on one decision: whether the words stay easy to follow

## Review States

Use creator-facing states:

- clear
- review overlap
- speech hard to hear
- music intentionally featured
- template balance needs review

Each state should describe what a viewer would notice, such as "Guest answer is hard to hear under the chapter bumper."

## Creator Controls

Offer simple actions:

- lower music during speech
- keep music featured
- fade out sooner
- start after this line
- apply to matching cue moments
- save balance to template

Avoid compressor settings, sidechain routing, decibel thresholds, waveform editing, and automatic ducking across the full episode without review.

## Publish Readiness

Ducking issues should appear in `docs/export-readiness-review.md` Placed Cue Warnings when music makes speech or captions less trustworthy. They should block publish readiness only when the overlapped spoken moment is necessary for viewers to understand the episode, sponsor message, or chapter transition.

## Maintainer Acceptance Notes

Accept work that keeps placed music present while protecting spoken clarity, offered as simple creator-facing choices reviewed on real episode moments. Close work that introduces a separate music timeline, exposes compressor, sidechain, decibel, or waveform controls, or auto-ducks the whole episode without creator review.
