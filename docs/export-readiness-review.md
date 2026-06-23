# Export Readiness Review

The final step should help creators catch obvious publishing problems before rendering a long-form episode.

## User Goal

A creator should be able to review a finished episode, understand whether it is ready to publish, and export the right long-form file without learning technical render settings.

## Review Summary

Before export, show a compact readiness summary across the parts that matter to a viewer:

- speaker framing and visible layout consistency
- caption coverage and proper noun confidence
- audio clarity, loudness balance, and noise cleanup
- b-roll, overlays, and title moments that still need approval
- brand elements, sponsor placements, and show template consistency
- placed intro, outro, sponsor, transition, or chapter music that affects the export
- missing metadata such as title, episode number, or publish destination

The summary should prioritize creator decisions. Do not turn the screen into a render diagnostics report.

## Placed Cue Warnings

When music cues from `docs/music-cue-setup.md` are included in the finished episode, readiness should treat them as part of audio, sponsor, and template review rather than as a separate music-management queue.

Flag only cue issues that affect the exported episode:

- cue file unavailable for render
- music covers speech that viewers need to understand
- sponsor cue appears outside the sponsor read, transition, or acknowledgement it belongs to
- placed cue still needs creator confirmation before this export
- draft cue is still included in the final export
- template expects an intro, outro, transition, or chapter cue that is missing from the episode

Each warning should link back to the place where the creator can fix it, such as cue setup, speech ducking review, sponsor placement review, or template adaptation. Unused library music and draft cues that are not present in the export should not affect readiness.

## Timeline Checks

For hour-plus episodes, the product should make review scalable:

- group warnings by severity
- jump directly to the affected moment
- mark an issue as fixed, ignored, or not relevant
- show repeated issues as a pattern instead of flooding the list
- keep playback context when moving between warnings

Warnings should describe the viewer-facing problem: "Captions are missing for 00:42:10-00:43:05" is better than "caption segment generation failed."

## Export Choices

Export options should stay tied to publishing outcomes:

- full episode for YouTube
- audio-only podcast backup
- archive-quality master
- sponsor or client review copy

Advanced settings can exist, but the default path should choose sensible resolution, frame rate, audio level, and caption behavior based on the current episode and destination.

## Completion State

After export, the product should show:

- final file name and destination
- duration and file size
- caption and audio status
- template used
- any ignored warnings
- next action such as download, publish, duplicate as template, or create clips

## Maintainer Acceptance Notes

Accept work that makes export feel like a publishing readiness step for long-form podcast episodes. Close work that focuses only on raw encoder settings, short-clip export, or hidden pipeline status without improving creator confidence in the final episode.
