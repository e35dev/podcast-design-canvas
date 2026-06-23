# Speaker Role Mapping

Speaker roles should make imported tracks behave predictably across presets, canvas layouts, captions, and templates.

## User Goal

A creator should be able to map each imported track to a clear podcast role, then trust the product to place and label each speaker correctly throughout the episode.

## Core Roles

Use simple role options:

- host
- co-host
- guest
- panelist
- producer or off-camera voice
- narrator or voiceover

Roles should remain editable after ingest. Changing a role should update layouts, lower-thirds, captions, and template adaptation previews where appropriate.

## Role Signals

The product can suggest roles from:

- file names
- speaker names
- Riverside track labels
- social links
- transcript introductions
- recurring show template settings

Suggestions should be reversible and visible. Do not silently assign a guest as a host just because they speak first.

## Layout Effects

Roles should influence:

- default frame prominence
- lower-third priority
- caption attribution
- title card wording
- b-roll and callout placement
- host-only or guest-only visual treatments

The product should avoid treating every speaker equally when the show format clearly has a host-led structure.

## Edge Cases

Support common podcast setups:

- solo host
- two-person interview
- rotating co-hosts
- panel episodes
- producer voice without camera
- guest joins late or leaves early

## Creator Controls

Mapping roles should stay a quick, reversible review step rather than a one-time guess locked in at ingest. The creator should be able to:

- confirm or reject each suggested role before it affects the episode
- reassign any track to a different role at any point after ingest
- preview how a role change updates frame prominence, lower-thirds, and caption attribution before applying it
- apply a role to this episode only or save it to the show template for recurring speakers
- mark a track as producer or off-camera voice so it stays out of speaker layouts
- set when a late-joining or early-leaving speaker appears, without forcing them into the full-episode layout
- keep the original suggestion visible so any change can be undone

A role change should never silently restyle the whole episode. The creator should see what will change across layout, captions, and template previews and choose to apply it.

## Maintainer Acceptance Notes

Accept work that makes speaker roles durable across ingest, presets, canvas editing, captions, and templates. Close work that treats tracks as anonymous media files or hard-codes one show format for every podcast.
