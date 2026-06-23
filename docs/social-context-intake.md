# Social Context Intake

The episode setup flow should use host and guest social links to improve the edit while keeping the experience respectful and obviously useful.

## User Goal

A creator should be able to add public links for the people in an episode and get better transcript spellings, on-screen names, b-roll suggestions, title moments, and reference handling without feeling like the product is doing unrelated background research.

## Relationship To Episode Setup

Social context intake should start from episode context already captured in the workspace:

- speaker buckets from episode ingest and `docs/speaker-role-mapping.md`
- ingest readiness from `docs/episode-ingest-readiness.md`
- guest reuse from `docs/guest-profile-reuse.md`
- glossary spellings from `docs/transcript-glossary.md`
- caption review from `docs/audio-caption-quality-review.md`
- contextual visuals from `docs/contextual-broll-moments.md` and `docs/contextual-title-cards.md`
- metadata and thumbnails from `docs/episode-metadata-publishing.md` and `docs/thumbnail-cover-frame.md`

## Intake Approach

Social context is setup input, not a second approval screen: links should improve visible episode quality through the specs that own each output, while staying respectful, speaker-scoped, and obviously useful to the creator.

## Accepted Inputs

Keep the input model lightweight:

- personal or show website
- X, LinkedIn, Instagram, YouTube, TikTok, or podcast profile
- company or project page
- optional spelling notes for names, brands, products, and recurring terms

Every link should attach to a speaker bucket from episode ingest. If a link cannot be matched to a speaker, ask the creator to assign it rather than silently applying it across the episode.

## Context Uses

Social context should improve visible episode quality in these areas:

- speaker display names, titles, handles, and lower-thirds
- proper noun spellings in transcripts and captions
- likely topic names, company names, and project references
- tasteful b-roll and visual callout candidates
- title moments that fit the speaker and show context

The product should show a short "used for" summary so creators understand why a link is being requested.

## Context Routing

Social context is an input, not an output surface. Each context use should flow to the spec that owns how it appears and gets approved, so corrections happen in one place per concern rather than on this intake screen:

| Context use | Owning spec | Relevant section |
| --- | --- | --- |
| display names, titles, handles, and lower-thirds | `docs/guest-profile-reuse.md` | Reusable Details, Matching |
| proper-noun spellings and recurring terms | `docs/transcript-glossary.md` | Glossary Entries, Application |
| caption accuracy review | `docs/audio-caption-quality-review.md` | Caption Confidence |
| b-roll and visual callout candidates | `docs/contextual-broll-moments.md` | Moment Sources, Review States |
| title moments | `docs/contextual-title-cards.md` | Sources, Review States |

Intake should hand each link's derived suggestions to these specs already attached to the right speaker bucket, and let the owning review surface make the final visible decision. This screen should not become a second place to approve captions, b-roll, or titles.

## Privacy And Taste Boundaries

Do not surface unrelated personal details or sensitive inferred information. The product should use public context to make the episode more accurate and relevant, not to create a dossier on the guest.

Avoid attention-grabbing overlays that make a serious interview feel like a gossip feed. Contextual visuals should support the conversation and the show's identity.

## Review States

The product should use social-context status to drive setup and handoff behavior:

- **linked to speaker** — attach the input to a speaker bucket and route derived suggestions to the owning spec in Context Routing
- **spelling suggested** — send proposed spellings to `docs/transcript-glossary.md`; do not treat them as approved captions or metadata until glossary review completes
- **display details pinned** — carry confirmed names, titles, or handles into `docs/guest-profile-reuse.md` for this episode and future reuse
- **suggestion rejected** — stop offering that derived visual or title idea without clearing unrelated caption or glossary warnings
- **topic or link blocked** — exclude the topic or source from b-roll, title cards, and on-screen references while keeping other speaker context intact

Each state should describe what gets handed off, not final approval in the intake screen itself.

## Creator Controls

Keep intake about managing the inputs, not approving the visible output. The creator should be able to:

- add a public link and attach it to a speaker bucket from episode ingest
- assign an unmatched link to the right speaker instead of applying it episode-wide
- add or correct spelling notes for names, brands, products, and recurring terms
- see the "used for" summary before a link's suggestions are applied
- pin guest display details such as names, titles, or handles
- reject a derived suggestion, jumping to the owning review surface when needed
- block a link, topic, or detail that should not appear on screen
- jump to the relevant review panel — captions, b-roll, titles, or lower-thirds — to approve how a suggestion actually appears
- save recurring people, brands, and segment terms to the show template

Keep two boundaries explicit: avoid turning this screen into a second place to approve captions, b-roll, titles, or lower-thirds; and avoid unrelated background research, dossier-style summaries, or surfacing unrelated personal details. Each control should manage an input or boundary and let the review panel where a suggestion appears make the final visible decision.

## Maintainer Acceptance Notes

Accept work that turns social links into better captions, titles, b-roll, lower-thirds, and reference accuracy. Close work that makes social context feel invasive, unrelated to the visible episode, detached from speaker buckets, or treats intake approval as final publish-ready sign-off for captions or visuals owned elsewhere.
