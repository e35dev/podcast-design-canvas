# Contributing

This repo is curated by its maintainers for **Podcast Design Canvas**. A technically working change is not enough: it must move this product toward the captured vision and fit the taste rules for this repo.

## What To Build
- Create a new episode by importing a Riverside link or uploading separate synced video files for each speaker, then assign each file to clear speaker buckets such as Host, Guest 1, and Guest 2.
- Add host and guest social links during setup so the product can understand names, topics, references, brands, and likely transcript spellings before generating the edit.
- Choose a preset visual style with layout and pacing options, preview how the episode will look, and apply it without needing to manually position every element.
- Open a canvas editor to build or customize a reusable podcast layout by dragging and layering speaker video frames, shapes, backgrounds, captions, title elements, b-roll areas, and overlays.
- Clean and balance episode audio with simple controls for noise reduction, leveling, enhancement, and speech clarity, presented as creator-facing quality choices rather than technical audio settings.
- Use contextual editing tools to add captions, b-roll overlays, visual callouts, title moments, and short-form-style engagement patterns at key moments across a full-length episode.
- Save a finished layout or style as a reusable show template so future episodes can keep the same identity while still adapting to each episode's speakers and topics.
- Export a polished long-form video episode that feels deliberately edited, visually coherent, accurately captioned, and ready to publish.

## What To Avoid
- Do not make the normal user think about internal production mechanics or technical pipeline details.
- Do not force a single visual house style across all podcasts.
- Do not bury simple users in a blank-canvas editor before offering strong preset choices.
- Do not make social research feel invasive: use it to improve accuracy and relevance, not to surface unrelated personal details.
- Do not overproduce every moment with constant effects, b-roll, or captions that distract from the conversation.
- Do not create outputs that only work for short clips; the core product must handle hour-plus podcast episodes.

## Pull Request Standard

Submit one focused product improvement at a time. The maintainers prefer small, complete, verifiable changes over broad speculative rewrites.

A PR should include:
- the user-facing improvement
- the workflow or taste rule it advances
- verification performed
- screenshots or preview notes when the change affects UI

## Maintainer Policy

The default policy is merge or close. If work is not mergeable now, maintainers close it with guidance for a cleaner future submission instead of leaving long requested-change queues open.

Maintainers merge work that:
- Merge clean PRs that pass CI, match the Vision Model, and improve an accepted workflow or quality bar.
- Prefer small coherent changes that can ship immediately over broad speculative rewrites.
- Treat product taste and user workflow fit as first-class acceptance criteria.
- Summarize merged work as product progress, not as raw PR activity.

Maintainers close work that:
- Close PRs that are incomplete, off-vision, overlapping, stale, or likely to create product drift.
- Do not leave requested-change queues by default. Close with clear resubmission guidance.
- Close technically correct PRs when they solve the wrong problem or move the product away from the captured vision.
- If a PR is promising but messy, explain the clean smaller PR that should be submitted next.

## Labels

Use labels that match this repo. They are part of the maintainer policy and should not be treated as generic tags.

| Label | Multiplier | Meaning |
| --- | ---: | --- |
| `episode-ingest` | 3 | Improves importing, uploading, syncing, or assigning podcast episode source tracks and speakers. |
| `preset-styles` | 2.5 | Improves preset visual styles, layout choices, pacing choices, or first-preview quality. |
| `canvas-editor` | 2.5 | Improves reusable canvas editing for podcast layouts, layers, frames, overlays, and direct manipulation. |
| `audio-captions` | 2 | Improves audio cleanup, leveling, speech clarity, transcripts, captions, or text accuracy. |
| `contextual-visuals` | 2 | Improves context-aware b-roll, title moments, callouts, references, social context, or visual moments. |
| `template-system` | 1.75 | Improves saving, reusing, adapting, or managing show templates and reusable visual identity. |
| `export-publish` | 1.75 | Improves long-form episode export, publish readiness, rendering, or final delivery quality. |
| `product-polish` | 1.5 | Improves Podcast Design Canvas's feel, usability, clarity, or taste fit. |
| `bugfix` | 1 | Fixes broken behavior that blocks Podcast Design Canvas's captured product direction. |
| `infrastructure` | 0.5 | Improves checks, deployment, or repo operations without directly advancing product behavior. |
| `off-vision` | 0 | Technically plausible work that does not help Podcast Design Canvas converge on the captured vision. |

## Branches

Target `main` unless the maintainers explicitly publish another branch policy for this repo.

## Checks
- Keep `typecheck` passing or explain why it does not apply.
- Keep `lint` passing or explain why it does not apply.
- Keep `test` passing or explain why it does not apply.
- Keep `preview-build` passing or explain why it does not apply.
