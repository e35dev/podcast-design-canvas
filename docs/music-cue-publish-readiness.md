# Music Cue Publish Readiness

Music cue publish readiness should catch final-export problems for already placed cues without adding a separate asset governance workflow.

## User Goal

A creator should be able to review intro, outro, transition, sponsor, title, and chapter music before publishing and fix only the cue issues that affect the finished episode.

## Starting Point

This review starts from cues placed through `docs/music-cue-setup.md`:

- the cue has a known source
- the cue is attached to an episode purpose
- the cue can be previewed against the current episode
- cue setup already knows whether usage approval is missing
- speech conflicts can be reviewed through `docs/music-ducking-under-speech.md`

Publish readiness should summarize those placed-cue states. It should not ask creators to manage a general music library before they export.

## Readiness Checks

Flag only cue problems that can change the published episode:

- placed music is missing approval for this episode
- a sponsor cue appears outside the sponsor read, transition, or acknowledgement it belongs to
- a template cue is reused in a different show, client workspace, or sponsor context and needs confirmation
- the cue file is unavailable for render
- music overlaps speech that viewers need to understand
- a cue marked draft-only is still present in the export
- an outro, chapter bumper, or transition cue is missing where the template expects one

Unused alternates, draft library files, and removed cues should not block publishing.

## Creator Actions

Offer direct fixes from the readiness item:

- preview cue in episode
- confirm this episode use
- replace cue
- move cue to matching section
- lower music during speech
- remove cue from export
- mark cue not needed for this episode

Avoid license forms, contract storage, global rights audits, waveform editing, and file-management screens in the default publish path.

## Viewer-Facing Language

Warnings should describe what the published episode would expose:

- "Intro music needs confirmation before export"
- "Sponsor bed appears outside the sponsor read"
- "Guest answer is hard to hear under chapter music"
- "Template outro cue is missing from this episode"
- "Draft cue is still included in the export"

Do not surface internal asset IDs, render paths, routing, or legal terminology as the primary message.

## Blocking Rules

Block publish only when the cue is present in the exported episode and one of these is true:

- the creator has not confirmed that the cue can be used in this episode
- the cue conflicts with required sponsor context
- the cue makes important speech or captions unreliable
- the cue is unavailable for render
- the template promises a structural cue that is missing from the finished episode

Everything else should remain a review warning, not a hard stop.

## Template Reuse

Show templates may remember cue purpose, relative placement, source, and prior confirmation. Future episodes should re-check sponsor context, client workspace, speech overlap, and whether the cue is actually present before marking the music portion of the publish checklist ready.
