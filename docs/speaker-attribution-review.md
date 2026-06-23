# Speaker Attribution Review

Speaker attribution should help creators trust who is speaking in captions, search, and publish checks without exposing raw transcript mechanics.

## User Goal

A creator should be able to confirm that host, guest, panelist, and off-camera voices are attached to the right moments before captions and metadata are marked ready for export.

## When To Flag

Flag attribution issues that affect the finished episode:

- a caption line names the wrong speaker
- a host or guest exchange is unlabeled after cross-talk
- an off-camera voice is shown as an on-camera guest
- transcript speaker changes no longer match video after sync repair
- repeated speaker labels conflict with the roles in `docs/speaker-role-mapping.md`

## Creator Controls

Use simple controls:

- assign a line or section to a speaker bucket
- split a back-and-forth exchange into two speakers
- mark a voice as off-camera or narrator
- apply the same speaker fix to nearby repeated lines
- open sync repair when timing is the likely cause
- reset attribution to the current role mapping

Avoid diarization scores, word-level timing grids, model logs, waveform alignment, or speaker embeddings in the default path.

## Preview Contexts

Creators should check attribution where the speaker is hardest to confirm:

- a fast back-and-forth exchange between two speakers
- a moment where speakers talk over each other
- an off-camera or audio-only speaker's line
- a caption that names or quotes a guest
- a handoff between host and guest

These previews should play the real moment with the active speaker shown so the creator can confirm the line is attached to the right person before it reaches captions or chapters.

## Review States

Use simple states:

- ready
- needs speaker
- speaker mismatch
- sync repair needed
- not in exported episode

These states should appear in caption review and long-form navigation only when they affect visible captions, search results, or publish readiness.

## Bulk Re-Attribution

Sometimes a single fix is not enough: one speaker was mislabeled across the whole episode, two labels turn out to be the same person, or one label quietly captured two people. Give the creator episode-wide actions instead of forcing line-by-line repair:

- reassign every line of one speaker to a different speaker in one action
- merge two labels that are the same person into a single speaker
- split one label into two when it captured two different people
- preview how many caption lines and transcript moments each action will change before it is applied
- undo a bulk action as a single step, not line by line

A split should hand the creator a quick way to separate the captured lines between the two people, usually by exchange or by section, rather than leaving every line ambiguous. A merge should keep the clearer of the two names and carry both sets of lines forward.

Each bulk action should report one outcome state, and only one at a time:

- not started
- previewing changes
- applied
- reverted

Independent of that state, a bulk action may also surface either flag when it applies:

- leaves some lines still unassigned
- conflicts with the confirmed roles, which the creator resolves where the speakers are defined

Bulk re-attribution changes who is named in captions and search, not who the speakers are at the role level. When a fix really means a track was mapped to the wrong person, point the creator back to where roles are confirmed rather than rewriting every label here.

## Flow Connections

Attribution review starts from the speaker buckets and roles confirmed in `docs/episode-ingest-readiness.md` and `docs/speaker-role-mapping.md`. If the wrong speaker appears because the tracks drifted, hand the moment to `docs/speaker-sync-repair.md` instead of asking the creator to relabel every caption.

Caption wording, style, and confidence stay owned by `docs/audio-caption-quality-review.md`. Corrected speaker labels should also improve transcript jumps in `docs/transcript-search-navigation.md`, so a creator can find the right person and moment during long-form review.

## Publish Readiness

Speaker attribution should clear the `captions reviewed` item in `docs/publish-checklist.md` only when exported captions and searchable transcript moments point to the right speaker. Export readiness should surface unresolved attribution only when it affects the finished episode, then link back to this review or `docs/speaker-sync-repair.md` for the fix.

## Maintainer Acceptance Notes

Accept work that helps creators confirm the right speaker in captions, search, and publish checks using the show's existing roles and speaker buckets. Close work that exposes diarization scores, speaker embeddings, or word-level timing grids, or that asks creators to relabel every caption instead of routing timing problems to sync repair.
