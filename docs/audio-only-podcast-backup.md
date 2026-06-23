# Audio-Only Podcast Backup

Audio-only backups should let a creator package the finished long-form episode for podcast feeds or archives without making a second edit.

## User Goal

A creator should be able to export a listener-ready audio package that keeps speech, chapters, metadata, and show notes aligned with the reviewed video episode.

## Backup Contents
Use confirmed episode state:

- destination choice from `docs/publish-destination-presets.md`
- speech clarity from `docs/audio-caption-quality-review.md`
- chapter titles from `docs/episode-chapter-markers.md`
- title, description, and guest links from `docs/episode-metadata-publishing.md`
- companion notes from `docs/show-notes-assembly.md`

The backup should reuse the finished episode decisions, not ask the creator to rebuild a parallel audio version.

## Creator Controls
Use simple controls:

- choose audio-only podcast backup as the destination
- preview a few representative moments before export
- include or omit chapters when the destination supports them
- copy confirmed metadata and show notes into the package
- mark video-only warnings as not relevant to this destination
- return to audio or metadata review when a listener-facing issue remains

Avoid codecs, bitrates, loudness targets, waveform lanes, feed schemas, encoder profiles, or render logs in the default path.

## Review States
Use simple creator-facing states:

- ready
- needs audio review
- metadata missing
- chapters need review
- show notes optional
- video-only issue not relevant

These states should appear in `docs/publish-checklist.md` and `docs/export-readiness-review.md` only after the creator chooses the audio-only backup destination.

## Publish Readiness
Block only listener-facing problems:

- speech is hard to understand
- the title or description is missing for the destination
- chapter titles are missing when chapters are included
- guest links or sponsor text in show notes still need review
- the package summary does not show what the audio backup contains

Visual-only issues such as safe areas, thumbnails, speaker framing, or b-roll should stay attached to the video destination and should not block this package when they will not ship.

Completed backups should hand off through `docs/export-package-handoff.md` with the selected destination, included metadata, chapter status, show notes status, and any ignored listener-facing warnings.
