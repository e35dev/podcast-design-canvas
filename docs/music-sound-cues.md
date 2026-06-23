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

## Structural Routing

Cue choices should stay attached to the episode structure that makes them meaningful.

| Structural moment | Owning spec | Relevant section |
| --- | --- | --- |
| intro and outro cue placeholders | `docs/intro-outro-builder.md` | Intro Elements, Outro Elements, Creator Controls |
| segment transition cues between planned show sections | `docs/show-segment-system.md` | Segment Types, Segment Behavior, Creator Controls |
| template reuse of recurring structural cues | `docs/show-template-adaptation.md` | Template Contents, Adaptation Flow |

The cue browser should send creators back to the owning intro, outro, or segment flow after a choice is made, rather than leaving structural cues as detached audio decisions.

## Cue Types

Support simple cue categories:

- intro music
- outro music
- segment transition
- sponsor transition
- title moment accent
- chapter bumper

Each cue should be previewed in context with the current episode audio.

## Preview Contexts

A structural cue that sounds fine alone can fail once speech and layout are live, so each cue should be checked on real episode moments before it is saved:

- intro music ending before the host's first line
- a segment transition between two planned sections
- sponsor bed under an active read
- a title moment accent over a highlighted phrase
- outro music starting near the final sign-off

Every context should use the current episode audio and the same cue, so the creator judges one honest tradeoff instead of approving a sound that only works in the cue browser.

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

## Review States

Use simple creator-facing states:

- ready — the cue is approved, placed, and does not cover necessary speech
- needs approval — usage approval is missing for a cue that would ship in the export
- needs placement — a template or preset expects this cue but it is not in the episode yet
- speech overlap — the cue makes an important spoken moment hard to hear
- too prominent — the cue repeats or dominates more than the show format allows

Each state should describe what a listener would notice, such as "Intro music still covers the host's first sentence."

## Maintainer Acceptance Notes

Accept work that adds reusable, tasteful audio cues for podcast structure and brand identity. Close work that makes creators manage complex audio timelines or encourages constant sound effects throughout the conversation.
