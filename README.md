# Podcast Design Canvas

Repository: `customer/podcast-design-canvas`

Create a self-serve visual podcast production workspace where creators transform synced multi-speaker raw recordings into polished, personalized, publishable video episodes without needing a traditional editor.

This repository is maintained against the product direction below. The maintainers use this document, `VISION.md`, and `CONTRIBUTING.md` as the standard for accepting or closing work.

## Who It Serves
- Podcast creators who record with Riverside-style separate synced speaker tracks
- Solo hosts who want professional results without learning a complex editing suite
- Podcast teams and agencies producing repeatable show formats for multiple episodes or clients
- Power users who want to design, save, reuse, and eventually monetize custom podcast layouts

## Product Workflows
- Create a new episode by importing a Riverside link or uploading separate synced video files for each speaker, then assign each file to clear speaker buckets such as Host, Guest 1, and Guest 2.
- Add host and guest social links during setup so the product can understand names, topics, references, brands, and likely transcript spellings before generating the edit.
- Choose a preset visual style with layout and pacing options, preview how the episode will look, and apply it without needing to manually position every element.
- Open a canvas editor to build or customize a reusable podcast layout by dragging and layering speaker video frames, shapes, backgrounds, captions, title elements, b-roll areas, and overlays.
- Clean and balance episode audio with simple controls for noise reduction, leveling, enhancement, and speech clarity, presented as creator-facing quality choices rather than technical audio settings.
- Use contextual editing tools to add captions, b-roll overlays, visual callouts, title moments, and short-form-style engagement patterns at key moments across a full-length episode.
- Save a finished layout or style as a reusable show template so future episodes can keep the same identity while still adapting to each episode's speakers and topics.
- Export a polished long-form video episode that feels deliberately edited, visually coherent, accurately captioned, and ready to publish.

## Intended End State

A creator can go from raw synced podcast tracks and a few social links to a finished, professional-looking long-form episode with clean audio, accurate text, personalized context, engaging visual moments, and a reusable visual identity for the show.

## Product Taste
- The product should feel like Canva adapted to podcast production: visual, direct manipulation, simple defaults, and creative freedom for advanced users.
- The default experience should emphasize preset quality: users should be able to get a polished result by choosing from clear style, layout, and pacing options.
- The pro experience should expose flexible canvas controls for custom layouts, layered shapes, branded frames, captions, overlays, and reusable templates.
- The system should support many podcast identities rather than a single house look: every show should be able to feel distinct.
- Visual edits should feel professional and intentional: clean framing, coherent layouts, readable captions, tasteful overlays, and rhythm that keeps a long episode engaging.
- Social context should make the edit smarter: better transcript spellings, relevant b-roll choices, more accurate references, better on-screen context, and captions or titles that fit the people speaking.

## Accept Work That
- Merge clean PRs that pass CI, match the Vision Model, and improve an accepted workflow or quality bar.
- Prefer small coherent changes that can ship immediately over broad speculative rewrites.
- Treat product taste and user workflow fit as first-class acceptance criteria.
- Summarize merged work as product progress, not as raw PR activity.

## Close Work That
- Close PRs that are incomplete, off-vision, overlapping, stale, or likely to create product drift.
- Do not leave requested-change queues by default. Close with clear resubmission guidance.
- Close technically correct PRs when they solve the wrong problem or move the product away from the captured vision.
- If a PR is promising but messy, explain the clean smaller PR that should be submitted next.

## Repo Labels

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

## Verification
- Run or preserve `typecheck` before submitting product work.
- Run or preserve `lint` before submitting product work.
- Run or preserve `test` before submitting product work.
- Run or preserve `preview-build` before submitting product work.
