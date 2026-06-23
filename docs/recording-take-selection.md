# Recording Take Selection

When an import includes restarts, pickups, or backup recordings, the creator should choose the take that belongs in the episode before styling begins.

## User Goal

A creator should be able to compare usable recording takes, choose the one that will become the long-form episode, and keep alternates out of export unless deliberately selected.

## When This Applies

Use take selection when the workspace sees more than one plausible recording for the same episode material:

- a full conversation plus a restarted take
- a host pickup recorded after the main session
- a guest backup file that overlaps the primary recording
- a copied draft from `docs/start-from-previous-episode.md` with new media attached

## Relationship To Ingest

Take selection happens before speaker buckets are marked ready in `docs/episode-ingest-readiness.md`. Source damage stays in `docs/source-media-health.md`, track alignment stays in `docs/speaker-sync-repair.md`, and creative checkpoints after editing starts stay in `docs/episode-version-history.md`.

## Take Cards

Each take should appear as a creator-facing card with:

- speaker buckets present
- plain-language duration such as full conversation, short restart, or pickup
- first visible speaking moment
- source warnings from `docs/source-media-health.md`
- transcript or segment preview when available

## Creator Controls

Use simple controls:

- choose this take for the episode
- keep an alternate as reference only
- remove a test or wrong take from this episode
- open source health when the chosen take is damaged
- open sync repair when the take's speaker files do not line up

Avoid exposing edit decision lists, raw file trees, timecode math, waveform splice points, or version-control language in the default path.

## Review States

- chosen
- needs choice
- kept as alternate
- removed from episode

These states should appear in ingest readiness only while a take choice affects the finished episode. They should not clear source media, sync, caption, or metadata warnings owned by other review surfaces.

## Publish Readiness

The chosen take should feed `docs/show-segment-system.md`, `docs/episode-metadata-publishing.md`, and `docs/publish-checklist.md` as the episode source. Alternates stay out of export readiness unless the creator replaces the chosen take, in which case affected ingest, transcript, segment, and publish checks reopen.
