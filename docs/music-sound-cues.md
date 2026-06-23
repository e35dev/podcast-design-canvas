# Music And Sound Cues

Music and sound cues should support show identity and episode structure without turning Podcast Design Canvas into a full audio workstation.

## User Goal

A creator should be able to add tasteful music or sound cues to intros, outros, sponsor transitions, and major segment changes.

## Relationship To Cue Setup

Music and sound cues should extend the placement workflow in `docs/music-cue-setup.md` instead of acting like a detached sound library.

- choose cue types that match the episode purpose already defined in setup
- preview the cue against the current episode audio before saving it to the episode or template
- carry usage approval, placement context, and template reuse state through the same review flow
- send speech-overlap follow-up to `docs/music-ducking-under-speech.md` only after a cue is already placed

Cue browsing should help a creator pick the right structural sound, not make them manage a second audio workflow.

## Cue Types

Support simple cue categories:

- intro music
- outro music
- segment transition
- sponsor transition
- title moment accent
- chapter bumper

Each cue should be previewed in context with the current episode audio.

## Controls

Use plain-language controls:

- quieter
- louder
- shorter
- longer fade
- start earlier
- start later
- remove from this episode
- save to template

Avoid exposing detailed mixing tools in the default path.

## Safety Checks

Flag issues that affect publish quality:

- cue covers speech
- cue repeats too often
- cue is missing usage approval
- cue is too loud compared with speakers
- cue conflicts with sponsor or intro branding

These checks should link back to the cue placement and review states in `docs/music-cue-setup.md`, so creators can fix the cue in context rather than debug it as a standalone audio asset.

## Maintainer Acceptance Notes

Accept work that adds reusable, tasteful audio cues for podcast structure and brand identity. Close work that makes creators manage complex audio timelines or encourages constant sound effects throughout the conversation.
