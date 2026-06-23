# Music Cue Setup

Music cues should enter an episode as purposeful show assets, not as a hidden technical audio layer.

## User Goal

A creator should be able to add approved music to structural podcast moments, preview it with the current episode, and save useful choices to the show template.

## Cue Sources

Support clear sources:

- uploaded music file
- saved show template cue
- starter cue from a preset style
- sponsor-provided track
- previously used show asset

Every cue should show whether the creator has usage approval before it can be used in a publishable export.

## Usage Approval

Usage approval should confirm the creator allowed this cue in the finished episode, not open a separate rights-management workflow.

| Cue source | Source spec | Relevant section |
| --- | --- | --- |
| uploaded music file or reused show asset | `docs/episode-asset-library.md` | Safety Rules |
| sponsor-provided track | `docs/sponsor-placement-review.md` | Sponsor Inputs |
| saved show template cue | `docs/show-template-adaptation.md` | Template Contents |
| starter cue from a preset style | `docs/preset-style-picker.md` | Preset Cards |

Flag missing approval only when the cue is placed in the export, as described in `docs/export-readiness-review.md` Placed Cue Warnings. Unused library music and draft cues should not block readiness.

## Placement Flow

Place music by episode purpose before exposing timing controls:

- intro starts before the first speaker
- outro starts near the final sign-off
- segment transition sits between two planned sections
- sponsor bed attaches to a sponsor read
- title moment accent supports one highlighted moment
- chapter bumper separates named chapters only when chapters exist

The product should preview each cue against the current episode audio and show the speaker or chapter context around the placement.

## Cue Safety Mapping

`docs/music-sound-cues.md` defines the creator-facing cue types and quality checks that this setup flow should honor once a cue is chosen and placed.

| Cue concern | Source spec | Relevant section |
| --- | --- | --- |
| cue type and episode purpose | `docs/music-sound-cues.md` | Cue Types |
| creator-facing loudness and timing controls | `docs/music-sound-cues.md` | Controls |
| repeated, too-loud, or branding-conflicting cues | `docs/music-sound-cues.md` | Safety Checks |
| speech clarity after placement | `docs/music-ducking-under-speech.md` | Relationship To Cue Setup, When To Flag |

Setup should keep these checks inside the same cue workflow. A creator should not have to re-create the cue in a separate music browser just to understand why it needs review.

## Creator Controls

Use simple controls:

- choose cue
- preview here
- start earlier
- start later
- shorter
- longer fade
- quieter
- remove from episode
- save to template

Avoid asking creators to manage audio lanes, waveform handles, routing, or mixer-style automation in the default path.

## Review States

Useful setup states include:

- ready
- missing usage approval
- cue not placed
- overlaps important speech
- template cue needs review
- unavailable file

These states should appear in audio review and publish readiness only when they affect the finished episode.

## Template Reuse

Show templates may remember cue purpose, chosen asset, relative placement, and simple fade choices. Future episodes should re-check those cues against new chapter timing, speaker volume, sponsor reads, and episode length before treating them as ready.
