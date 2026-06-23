# Sensitive Moment Review

Sometimes a guest says something that should not ship — a blurted phone number, an off-the-record aside, or a moment they later ask to cut. The product should let a creator handle these cleanly without opening a raw editor.

## User Goal

A creator should be able to find, mark, and remove or mask a sensitive moment in a long-form episode, preview how the episode reads without it, and trust that it stays out of the export.

## What Counts As Sensitive

This is about content a creator chooses to keep out of the published episode, not conversation rhythm:

- a personal detail said out loud, such as a phone number, address, or private name
- an off-the-record aside or a "don't use that" moment
- a misstatement a guest asked to strike after recording
- a confidentiality or legal concern raised during review
- a brief profanity a creator wants softened for the destination

Awkward pauses, false starts, and cross-talk stay with conversation cleanup; this surface is for content the creator means to remove or mask.

## Handling Choices

Offer a small set of plain-language treatments that preview on the real moment:

- remove the moment and close the gap so the conversation still flows
- mute the audio while keeping the picture
- mask or cover the on-screen detail without cutting the whole moment
- keep the moment but note it for a collaborator to decide

Each choice should preview against the surrounding seconds so the creator confirms the edit does not leave a jarring jump or a caption that references removed words.

## Keeping Captions And Chapters Honest

Removing or masking a moment should keep the rest of the episode consistent: captions for removed words should drop, a chapter boundary near a cut should re-check its start, and any title or b-roll moment attached to removed content should resurface for the creator rather than dangle. The creator works with the visible moment; the connected surfaces update around it.

## Review States

Sensitive-moment status should describe one decision per moment, surfaced as a calm item in long-form review rather than a blocking banner:

- **flagged** — a moment is marked sensitive and shown with surrounding context; nothing is removed until the creator chooses a treatment
- **removed** — the moment is cut from the export and the gap is closed; connected captions and chapters re-check around it
- **masked** — the picture or audio detail is covered or muted while the moment stays in place
- **kept, noted** — the moment stays in the episode with a note left for a collaborator to weigh in
- **cleared** — the creator reviewed the flag and confirmed the moment is fine to publish as recorded

Each state should describe what happens to the export, captions, and chapters, not only the label. A flagged moment the creator has not resolved should appear in export readiness so it is not published by accident, but resolving it should never require leaving this surface for a raw timeline.

## Creator Controls

Keep handling a sensitive moment a quick, contained step:

- jump to a flagged moment with playback context
- choose a treatment — remove, mute, mask, or keep with a note
- preview the surrounding seconds to confirm the edit reads cleanly
- restore a removed moment if the creator changes their mind
- mark a flag cleared when the content is fine as recorded

Avoid exposing waveform surgery, frame-level masking tools, or a separate redaction timeline in the default path.

## Connections

Sensitive-moment review should reuse decisions the workspace already owns rather than redefining them: surrounding context and search come from `docs/transcript-search-navigation.md` (Search, Jump To Moment); caption updates for removed spans route to `docs/audio-caption-quality-review.md` (Review States); a cut near a chapter edge re-checks in `docs/episode-chapter-markers.md` (Where Chapters Come From); and unresolved flags that would reach export surface in `docs/export-readiness-review.md`. Conversation-flow issues stay in `docs/pause-crosstalk-cleanup.md`.

## Maintainer Acceptance Notes

Accept work that helps creators keep private, off-the-record, or struck content out of a long-form episode through calm, previewable choices. Close work that duplicates conversation-flow cleanup, exposes raw editing or masking tools as the default, blocks export trivially, or treats every pause or filler word as something to redact.
