# Music Cue Usage Approval

Music cue approval should make publish-blocking music questions visible before export without turning Podcast Design Canvas into a rights-management system.

## User Goal

A creator should be able to tell whether intro, outro, sponsor, transition, and chapter music can be used in the current episode, then fix missing approval before it blocks publishing.

## Relationship To Cue Setup

This review starts from cues placed through `docs/music-cue-setup.md` and assets organized through `docs/episode-asset-library.md`:

- the cue has a source such as an uploaded file, template cue, preset starter cue, sponsor track, or prior show asset
- the cue is attached to a clear episode purpose
- the product can preview where the cue appears in the current episode
- the cue can appear in publish readiness when approval is missing

Approval should travel with the cue source and current episode use, not with a hidden production file path.

## What Approval Means

Use creator-facing approval states:

- approved for this episode
- approved for this show template
- sponsor provided
- starter cue included with preset
- needs creator confirmation
- missing approval
- rejected for this episode

The product should explain what the creator needs to confirm, such as "This uploaded intro track has not been approved for this episode."

## When To Ask

Ask for approval only when it affects the finished episode:

- a newly uploaded cue is added to an intro, outro, transition, sponsor read, title moment, or chapter bumper
- a saved template cue is reused in a new show, client workspace, or sponsor context
- a sponsor-provided cue is placed outside the sponsor read or acknowledgement it belongs to
- a preset starter cue is replaced with a creator-owned track
- an approved cue is moved into a different episode purpose
- a previously rejected cue is selected again

Do not interrupt creators for unused library files, draft cues that are not placed, or music that has already been approved for the same show and use.

## Creator Controls

Offer direct actions:

- mark approved for this episode
- mark approved for this show
- replace cue
- use preset starter cue
- remove from publish
- ask reviewer to confirm
- keep as draft only

Avoid license fields, contract workflows, legal language, and generic asset-management screens in the default path.

## Review States

Show cue approval where creators already review the episode:

- in cue setup, next to the selected cue
- in the asset library, where the same music is reused
- in audio review, when the cue is present in the finished episode
- in the publish checklist, only when approval blocks export
- in team workspaces, when a cue belongs to another client or show

Warnings should name the viewer-facing use: "Sponsor bed needs approval before publishing this host-read section" is better than "asset permission missing."

## Template Reuse

Show templates may remember which cue source was approved, what episode purpose it served, and whether approval applies to the whole show or only one episode. Future episodes should re-check sponsor context, client workspace, cue source, and placement purpose before treating the cue as ready.

## Publish Readiness

Missing cue approval should block publishing only when the music is present in the exported episode. Draft-only cues, unused alternates, and removed music should stay visible in the library without blocking the final export.
