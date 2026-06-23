# Export Readiness Review

The final step should help creators catch obvious publishing problems before rendering a long-form episode.

## User Goal

A creator should be able to review a finished episode, understand whether it is ready to publish, and export the right long-form file without learning technical render settings.

## Relationship To Export Flow

Readiness review should summarize open issues from work already captured in the workspace:

- destination defaults from `docs/publish-destination-presets.md`
- checklist status from `docs/publish-checklist.md`
- metadata gaps from `docs/episode-metadata-publishing.md`
- thumbnail status from `docs/thumbnail-cover-frame.md`
- review approvals from `docs/review-handoff-summary.md`
- package delivery after export in `docs/export-package-handoff.md`
- failed renders in `docs/render-failure-recovery.md`

## Readiness Approach

Export readiness is publishing first: summarize viewer-facing problems creators can fix before render, not encoder diagnostics, pipeline logs, or render queue status.

## Review Summary

Before export, show a compact readiness summary across the parts that matter to a viewer:

- speaker framing and visible layout consistency
- caption coverage and proper noun confidence
- audio clarity, loudness balance, and noise cleanup
- b-roll, overlays, and title moments that still need approval
- brand elements, sponsor placements, and show template consistency
- placed intro, outro, sponsor, transition, or chapter music that affects the export
- missing metadata such as title, episode number, or publish destination

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
| visual match across speakers | `docs/speaker-visual-match.md` | Match Signals, Review States |
| speaker switch reframing | `docs/speaker-switch-framing.md` | Switch Styles, When to Flag |

Flag only framing issues that affect the exported episode:

- active speaker covered by captions, lower-thirds, or b-roll
- face cropped too tightly for the destination
- panel layout makes one speaker unreadable
- mobile crop cuts off a guest
- one speaker looks noticeably brighter, darker, or cooler than the others
- switch framing stays static across a long multi-speaker stretch
- reframe overlaps a b-roll moment or sponsor placement

Each warning should link back to the moment and preview surface where the creator can fix it.

## Speaker Sync Warnings

When separate speaker tracks would affect timing in the exported episode, readiness should surface sync issues as part of track alignment review rather than as a separate timeline editor.

| Warning type | Source spec | Relevant section |
| --- | --- | --- |
| timing and alignment issues | `docs/speaker-sync-repair.md` | Detected Issues, Repair Actions |
| ingest handoff | `docs/episode-ingest-readiness.md` | Readiness Checks, Issue Resolution Mapping |
| checklist blocking | `docs/publish-checklist.md` | Checklist Item Mapping, Review Approvals |

Flag only sync issues that affect the exported episode:

- speaker video and audio visibly out of sync
- speaker track ends early leaving a visible gap
- duplicate audio appears from two speaker tracks

Each warning should link back to sync repair or the speaker bucket where the creator can align, replace, or mark a track audio-only. Raw timecode data should not appear in readiness.

## Audio Cleanup Warnings

When speech clarity, loudness balance, or conversation cleanup would affect the exported episode, readiness should surface audio issues as part of the existing quality pass rather than as a separate waveform editor.

| Warning type | Source spec | Relevant section |
| --- | --- | --- |
| room noise, loudness balance, and clarity | `docs/audio-caption-quality-review.md` | Audio Controls, Review Flow |
| awkward pauses and heavy cross-talk | `docs/pause-crosstalk-cleanup.md` | Detected Moments, Cleanup Actions |
| checklist blocking | `docs/publish-checklist.md` | Checklist Item Mapping, Review Approvals |

Flag only audio issues that affect the exported episode:

- one speaker is much louder or quieter than the others
- room noise or hum stays loud enough to distract from speech
- cross-talk makes a needed answer hard to understand
- long dead air remains where the conversation stops
- a confirmed clarity or noise fix was not applied before this export

Each warning should link back to the speaker and moment where the creator can fix it, such as audio review or pause and cross-talk cleanup. Source file availability issues stay with Source Media Warnings below. Music that covers speech stays with Placed Cue Warnings above, and natural pauses or intentional silence the creator chose to keep should not affect readiness.

## Source Media Warnings

When raw speaker files would affect the exported episode, readiness should surface source media availability issues as part of track health review rather than as audio cleanup or framing review.

| Warning type | Source spec | Relevant section |
| --- | --- | --- |
| per-speaker file health | `docs/source-media-health.md` | Health Checks, Readiness Summary |
| ingest handoff | `docs/episode-ingest-readiness.md` | Readiness Checks, Issue Resolution Mapping |
| checklist blocking | `docs/publish-checklist.md` | Checklist Item Mapping, Review Approvals |

Flag only source media issues that affect the exported episode:

- source audio missing or too quiet for an exported speaker track
- source video missing where the layout expects video
- source file marked unavailable still included in the export
- source file appears corrupted or incomplete in the export

Each warning should link back to source media health or the speaker bucket where the creator can replace the file or mark a track audio-only. Codec details should not appear in readiness.

## Contextual Visual Warnings

When b-roll, overlays, or title moments would affect the exported episode, readiness should surface visual approval gaps as part of contextual review rather than as a separate effects queue.

| Warning type | Source spec | Relevant section |
| --- | --- | --- |
| b-roll and callout approval | `docs/contextual-broll-moments.md` | Approval Flow, Quality Rules |
| title card review and overlap | `docs/contextual-title-cards.md` | Review States, Creator Controls |
| checklist blocking | `docs/publish-checklist.md` | Review Approvals |

Flag only visual issues that affect the exported episode:

- suggested b-roll or callout still needs approval
- visual covers an active speaker face
- repetitive overlays appear in back-to-back moments
- title moment or callout uses low-confidence context
- pinned template visual no longer fits this episode
- placed title card still needs review
- title card overlaps captions
- title card hides the active speaker frame

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

## Metadata Warnings

When episode fields or destination-specific publishing details would affect the exported episode, readiness should surface metadata issues as part of publishing review rather than as a separate CMS queue.

| Warning type | Source spec | Relevant section |
| --- | --- | --- |
| metadata completeness and confidence | `docs/episode-metadata-publishing.md` | Metadata Fields, Review States, Readiness Checks |
| destination-specific metadata fit | `docs/publish-destination-presets.md` | Relationship To Export Flow, Preset Effects, Review States |

Flag only metadata issues that affect the exported episode:

- title is missing or still reads like a placeholder
- episode number is missing where the show format uses one
- short or full description is missing for the chosen destination
- guest name, title, or link still needs review
- publish destination is not selected
- metadata still matches the wrong destination preset

Each warning should link back to the field or destination preset where the creator can fix it. Thumbnail quality issues, sponsor placement conflicts, and other visual approvals should stay with their own readiness surfaces rather than duplicate here.

## Review Copy Warnings

When a client or team review copy is part of the publishing path, readiness should surface unresolved review feedback as part of handoff review rather than as a separate task board.

| Warning type | Source spec | Relevant section |
| --- | --- | --- |
| open review feedback | `docs/client-review-copy-flow.md` | Resolution States, Feedback Anchors |
| handoff decisions pending | `docs/review-handoff-summary.md` | Summary Contents, Review States |
| checklist blocking | `docs/publish-checklist.md` | Review Approvals |

Flag only review issues that affect the final export:

- open feedback on a moment that ships in this export
- required approver has not accepted the episode
- rejected item was marked fixed but not re-reviewed
- review copy destination does not match the final export destination

Each warning should link back to the review copy moment or handoff item where the creator can resolve it. Solo-host workflows with no review copy requested should not block readiness on this item.

## Glossary Warnings

When proper nouns, names, or show-specific spellings would affect the exported episode, readiness should surface glossary gaps as part of caption and metadata review rather than as a separate transcript editor.

| Warning type | Source spec | Relevant section |
| --- | --- | --- |
| low-confidence proper nouns | `docs/audio-caption-quality-review.md` | Caption Confidence |
| approved spellings not applied | `docs/transcript-glossary.md` | Glossary Entries, Application |
| guest name and link context | `docs/social-context-intake.md` | Context Uses, Accepted Inputs |
| checklist blocking | `docs/publish-checklist.md` | Checklist Item Mapping |

Flag only glossary issues that affect the exported episode:

- repeated proper noun still has low caption confidence
- approved glossary spelling was not applied to captions or metadata
- guest name or company spelling conflicts with social context
- glossary suggestion still needs creator approval before export

Each warning should link back to caption review, glossary application, or the metadata field where the creator can fix it. One-off typos the creator already corrected should not flood readiness.

## Intro And Outro Warnings

When opening or closing sequences would affect the exported episode, readiness should surface intro and outro issues as part of episode framing review rather than as a separate template editor.

| Warning type | Source spec | Relevant section |
| --- | --- | --- |
| opening and closing content | `docs/intro-outro-builder.md` | Intro Elements, Outro Elements, Template Behavior |
| intro or outro music placement | `docs/music-cue-setup.md` | Placement Flow, Review States |
| sponsor disclosure in intro or outro | `docs/sponsor-placement-review.md` | Placement Types, Conflict Checks |
| checklist blocking | `docs/publish-checklist.md` | Checklist Item Mapping, Review Approvals |

Flag only intro and outro issues that affect the exported episode:

- required show branding or episode title missing from the opening
- guest name or topic line conflicts with metadata or social context
- intro or outro music overlaps important speech without approval
- sponsor disclosure missing from intro or outro when required
- template intro or outro was not adapted for this episode

Each warning should link back to intro/outro builder, music cue setup, or sponsor placement review where the creator can fix it. Episodes without custom intros or outros should not block readiness on this item.

## Timeline Checks

For hour-plus episodes, the product should make review scalable:

- group warnings by severity
- jump directly to the affected moment
- mark an issue as fixed, ignored, or not relevant
- show repeated issues as a pattern instead of flooding the list
- keep playback context when moving between warnings

Warnings should describe the viewer-facing problem: "Captions are missing for 00:42:10-00:43:05" is better than "caption segment generation failed."

## Review States

The product should use overall readiness status to drive export and checklist behavior:

- **ready to export** — required warnings for the chosen destination are resolved or explicitly ignored with consequences shown; enable export and clear blocking checklist items in `docs/publish-checklist.md`
- **needs review** — surface unresolved warnings grouped by severity; keep export available only when the destination allows ignored warnings
- **blocked** — stop export when a required item is missing for the destination, such as thumbnail, sponsor disclosure, or unavailable cue file; link directly to the fixing surface
- **warning ignored** — record the publishing consequence, keep the warning visible in the summary, and include it in `docs/export-package-handoff.md`
- **not relevant for destination** — hide warnings that do not affect the chosen export package and mark the related checklist item not needed

Each state should describe what happens at export time, not only the label on the readiness summary.

## Creator Controls

Offer simple actions:

- jump to affected moment
- mark issue fixed, ignored, or not relevant
- open publish checklist
- change destination preset
- start export
- hand off to package delivery

Avoid exposing encoder diagnostics, render queue IDs, or pipeline logs in the default readiness path.

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

Completed exports should hand off to `docs/export-package-handoff.md`. When export fails after readiness review, recovery should follow `docs/render-failure-recovery.md` and preserve readiness decisions rather than resetting the episode.

## Maintainer Acceptance Notes

Accept work that makes export feel like a publishing readiness step for long-form podcast episodes. Close work that focuses only on raw encoder settings, short-clip export, or hidden pipeline status without improving creator confidence in the final episode.
