# Show Notes Link Review

Show notes link review should help creators confirm the public links that will ship with a long-form episode before those links appear in metadata, notes, or handoff packages.

## User Goal

A creator should be able to review guest, sponsor, and resource links in one calm pass and trust that destination-ready notes point viewers to the right places.

## Link Sources

Review only links already captured in the episode workspace:

- guest websites, handles, and profile links from `docs/guest-profile-reuse.md` and `docs/social-context-intake.md`
- sponsor disclosure or offer links from `docs/sponsor-placement-review.md`
- destination notes requirements from `docs/publish-destination-presets.md`
- chapter, guest, and resource references from `docs/show-notes-assembly.md`

The link review should not ask creators to research new links during export. Missing or stale links should route back to the source that owns the detail.

## Creator Controls

Use simple controls:

- confirm a link for this episode
- edit the label shown in notes
- remove a link from a destination that does not need it
- replace a stale guest or sponsor link
- copy the confirmed link block into metadata or the export package

Avoid exposing URL crawlers, tracking parameters, feed fields, destination APIs, or validation logs in this path.

## Review States

Use simple states:

- ready
- needs source
- stale label
- destination mismatch
- omitted

These states should appear in `docs/publish-checklist.md` only when a link is visible to viewers or required by the chosen destination.

## Destination Behavior

Destination presets should shape which links matter:

- public video destinations can require guest, sponsor, and resource links in show notes
- private review copies can omit public link blocks unless the creator includes them
- archive packages can keep links in the summary without treating them as viewer-facing requirements
- destination changes should reopen affected link choices instead of carrying forward a stale ready state

The review should explain the viewer consequence, such as "Sponsor link is missing from YouTube notes," not a technical export condition.

## Publish Readiness

Confirmed link blocks should flow into `docs/show-notes-assembly.md`, `docs/episode-metadata-publishing.md`, and `docs/export-package-handoff.md`.

Link issues that would ship as wrong or missing viewer-facing notes should keep the relevant `docs/publish-checklist.md` item in needs review until the creator fixes the source, removes the link, or marks it not needed for the destination.

If a destination does not publish notes or links, the item should stay optional and never block a solo creator from exporting the finished episode.
