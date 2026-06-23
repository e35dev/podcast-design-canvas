# Episode Reference Links

Reference links should help creators confirm resources mentioned in a long-form conversation before they appear in show notes, contextual cards, or publish metadata.

## User Goal

A creator should be able to review links and named resources mentioned in the episode, keep the useful ones attached to moments, and publish notes without chasing every transcript mention.

## Link Sources

Suggestions can come from:
- creator-pinned transcript moments from `docs/transcript-search-navigation.md`
- guest and profile links from `docs/guest-profile-reuse.md` and `docs/social-context-intake.md`
- product, company, book, or tool names caught by `docs/transcript-glossary.md`
- chapter and segment context from `docs/episode-chapter-markers.md` and `docs/show-segment-system.md`
- draft show notes from `docs/show-notes-assembly.md`

The product should show why a link was suggested, such as "Guest mentions the launch page" or "Host pins this book title."

## Creator Controls

Use simple controls:
- confirm or edit the link target
- attach a link to a speaker or chapter moment
- send a confirmed link to show notes
- use the link as a contextual visual card
- hide a link from the exported package
- keep a recurring show link in the template

Avoid exposing web crawlers, SEO scoring, affiliate tags, raw transcript scraping, or platform API fields in this path.

## Review States

Use simple states: ready, needs link, needs title, speaker mismatch, visual only, omitted.
These states should appear in navigation, show notes, or export review only when the link affects the finished episode package.

Confirmed links should flow into `docs/show-notes-assembly.md` when they help viewers follow the episode. Links used as on-screen cards stay with `docs/contextual-broll-moments.md` Approval Flow, so the creator previews them on the real episode frame before export.

Reusable host, guest, sponsor, or show links can start from `docs/guest-profile-reuse.md` and save back through `docs/show-template-adaptation.md` only when the creator confirms they should recur. Episode-only links should not become reusable template data by default.

## Publish Readiness

Before export, unresolved reference links should block only when the chosen destination requires notes, metadata, or a visual card that uses the link.

Flag only issues that affect the exported package:

- show notes include a reference with no confirmed link
- a visual card points to the wrong resource
- a guest or resource title conflicts with social context
- a package link was omitted from the selected destination

Issues should surface through `docs/publish-checklist.md` and `docs/export-readiness-review.md`, not a separate link-management queue.
