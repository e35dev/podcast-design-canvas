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

Ducking overlaps from placed cues should appear with these warnings rather than as a separate audio engineering queue:

| Warning type | Source spec | Relevant section |
| --- | --- | --- |
| speech overlap under placed cue | `docs/music-ducking-under-speech.md` | When To Flag, Review States |
| cue placement context | `docs/music-cue-setup.md` | Placement Flow, Review States |

Flag ducking only when overlapped speech is necessary for viewers to understand the episode, sponsor message, or chapter transition. Short intentional overlaps can stay quiet when speech remains clear.

## Chapter Marker Warnings

When chapters from `docs/episode-chapter-markers.md` are included in the finished episode, readiness should treat them as part of metadata and navigation review rather than as a separate marker-editing queue.

| Warning type | Source spec | Relevant section |
| --- | --- | --- |
| chapter title and timing issues | `docs/episode-chapter-markers.md` | Review States, Creator Controls |
| export metadata gaps | `docs/episode-metadata-publishing.md` | Chapter Workflow, Readiness Checks |
| checklist blocking | `docs/publish-checklist.md` | Checklist Item Mapping, Review Approvals |

Flag only chapter issues that affect the exported episode:

- chapter has no title
- chapter starts mid-sentence
- chapter is too short to keep
- chapter overlaps the next chapter
- confirmed chapters are missing from export metadata

Each warning should link back to chapter review or the metadata fields where the creator can fix it. Unused suggested chapters that are not in the export should not affect readiness.

## Readability Warnings

When layout, caption, or destination crop issues would affect the exported episode, readiness should surface them as part of caption and layout review rather than as separate compliance queues.

| Warning type | Source spec | Relevant section |
| --- | --- | --- |
| caption contrast, size, and motion | `docs/accessibility-readability-checks.md` | Checks, Creator Controls |
| safe area and overlap conflicts | `docs/layout-safe-areas.md` | Safe Area Types, Checks |
| destination crop issues | `docs/destination-crop-previews.md` | Checks, Fixes |
| caption style conflicts | `docs/audio-caption-quality-review.md` | Caption Style Presets |

Flag only readability issues that affect the exported episode:

- captions have low contrast or are too small for the destination
- captions or overlays cover active speaker faces
- logo, sponsor mark, or lower-third falls outside the destination crop
- title text is unreadable in thumbnail or mobile preview

Each warning should link back to the review surface where the creator can fix it. Informational preview notes that do not affect the chosen export destination should not block readiness.

## Speaker Framing Warnings

When speaker visibility or layout framing would affect the exported episode, readiness should surface framing issues as part of layout review rather than as a separate crop editor.

| Warning type | Source spec | Relevant section |
| --- | --- | --- |
| face and overlay conflicts | `docs/speaker-framing-safety.md` | Checks, Fixes |
| role-based layout fit | `docs/speaker-role-mapping.md` | Layout Effects |
| destination crop impact | `docs/destination-crop-previews.md` | Checks, Fixes |

Flag only framing issues that affect the exported episode:

- active speaker covered by captions, lower-thirds, or b-roll
- face cropped too tightly for the destination
- panel layout makes one speaker unreadable
- mobile crop cuts off a guest

Each warning should link back to the moment and preview surface where the creator can fix it.

## Contextual Visual Warnings

When b-roll, overlays, or title moments would affect the exported episode, readiness should surface visual approval gaps as part of contextual review rather than as a separate effects queue.

| Warning type | Source spec | Relevant section |
| --- | --- | --- |
| b-roll and callout approval | `docs/contextual-broll-moments.md` | Approval Flow, Quality Rules |
| checklist blocking | `docs/publish-checklist.md` | Review Approvals |

Flag only visual issues that affect the exported episode:

- suggested b-roll or callout still needs approval
- visual covers an active speaker face
- repetitive overlays appear in back-to-back moments
- title moment or callout uses low-confidence context
- pinned template visual no longer fits this episode

Each warning should link back to the moment where the creator can approve, replace, or remove the visual. Unused suggestions that are not in the export should not affect readiness.

## Thumbnail Warnings

When the chosen destination requires a thumbnail or cover frame, readiness should treat thumbnail gaps as part of metadata and package review rather than as a separate design tool.

| Warning type | Source spec | Relevant section |
| --- | --- | --- |
| thumbnail selection and quality | `docs/thumbnail-cover-frame.md` | Review Criteria, Export Connection |
| brand and sponsor fit | `docs/show-brand-kit-setup.md` | Preview Surfaces, Guardrails |
| checklist blocking | `docs/publish-checklist.md` | Checklist Item Mapping |
| package delivery | `docs/export-package-handoff.md` | Package Contents, Summary |

Flag only thumbnail issues that affect the exported episode:

- no thumbnail selected when the destination requires one
- guest or show name is inaccurate on the frame
- text is unreadable at small sizes
- sponsor mark or brand placement conflicts with the crop
- frame may spoil sensitive content

Each warning should link back to thumbnail review or the metadata field where the creator can fix it. Destinations that do not require a thumbnail should not block readiness on this item.

## Sponsor Placement Warnings

When sponsor visuals or disclosures are present in the finished episode, readiness should treat sponsor issues as part of brand and placement review rather than as a separate ad-tech queue.

| Warning type | Source spec | Relevant section |
| --- | --- | --- |
| placement and disclosure conflicts | `docs/sponsor-placement-review.md` | Placement Types, Conflict Checks |
| template reuse review | `docs/show-template-adaptation.md` | Adaptation Flow |
| checklist blocking | `docs/publish-checklist.md` | Checklist Item Mapping, Review Approvals |

Flag only sponsor issues that affect the exported episode:

- sponsor mark covers a face
- disclosure text is missing
- sponsor visual appears during an unrelated sensitive moment
- sponsor asset does not meet readability requirements
- sponsor placement still needs episode-specific approval

Each warning should link back to sponsor placement review or the metadata field where the creator can fix it. Episodes without sponsor elements should not block readiness on this item.

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

When export fails after readiness review, recovery should follow `docs/render-failure-recovery.md` and preserve readiness decisions rather than resetting the episode.

## Maintainer Acceptance Notes

Accept work that makes export feel like a publishing readiness step for long-form podcast episodes. Close work that focuses only on raw encoder settings, short-clip export, or hidden pipeline status without improving creator confidence in the final episode.
