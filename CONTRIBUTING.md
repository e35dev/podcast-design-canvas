<!-- builderloops:contributing -->
## How to contribute to this repository

This product is built one step at a time by an automated maintainer that turns the product vision into a working product through your contributions. Read this before opening a pull request.

### Currently accepted
Current accepted work: **#1326 Build the guided episode setup intake**. A PR must complete that issue's Acceptance through the normal product workflow.

Only implementation PRs that complete the current active step are accepted. Docs-only, planning-only, off-step, speculative, demo-only, mock-only, and unrelated PRs are closed even when the work is technically good.

### Work the one active step
At any moment there is exactly **one** open issue labeled `bl:active-step`. That issue is the only work being accepted right now. It describes what to build and a clear **Acceptance** (definition of done). Find it in this repo's Issues filtered by the `bl:active-step` label.

The maintainer acts like a hands-on product lead: it keeps the current goal focused, verifies behavior in the running product, and may replace a step with a prerequisite if repeated PRs show the target was missing a foundation.

### Open a pull request that completes that step
- Your PR must fully satisfy the active step's Acceptance, and reference it (for example, "Closes #<number>").
- Keep it focused: do that step and nothing unrelated.
- **One PR per contributor per step.** You may have only one open pull request for the active step, so put your best work into it. If you open a second PR for the same step, it is closed automatically. To revise your submission, push to your existing PR's branch (it is re-reviewed automatically) instead of opening another.

### Your PR is run, not just read
Every PR is checked out and executed in a sandbox: it must build, the existing tests must still pass, and the repo's acceptance checks (see `.builderloops/verify.json` if present) must pass. A PR that does not build, breaks tests, or fails acceptance is closed automatically. Make sure it genuinely works.

### What gets merged, what gets closed
- The best PR that completes the active step and passes review and execution is merged. When it merges, the step closes and the maintainer opens the next step.
- PRs that do something other than the active step are closed, even if the work is good. Wait until that work becomes the active step.
- A PR is merged only when it clearly completes the step and its benefit outweighs the added complexity; otherwise it is closed with a specific reason.

### Labels
This repo does not require Gittensor scoring labels on merged PRs. The maintainer may use operational labels such as active-step labels only for workflow control.
<!-- /builderloops:contributing -->

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

## Active Build Targets

This repo is now in preview-first product assembly mode. The maintainer is prioritizing a cohesive runnable product over more isolated prototype fragments.

Current targets:
- #581 P0: Browser preview shell
- #582 P0: One complete episode production flow
- #583 P1: Convert isolated prototypes into connected preview screens
- #584 P1: Preview smoke tests and regression guard

PRs should clearly advance one of these targets or fix a blocker in the current preview/product path. Standalone prototype files, scattered micro-features, or useful-but-unconnected additions are closed by default until the preview shell and core episode flow are real.

Every accepted product PR should either improve the runnable preview or preserve it with tests. The current preview contract is:
- run `npm run preview`
- open `/preview/`
- keep `npm test` passing
- keep the connected flow at `/preview/episode-flow.html` usable

## Pull Request Standard

Submit one focused product improvement at a time. The maintainers prefer small, complete, verifiable changes over broad speculative rewrites.

## Current Contribution Focus

This repo is currently accepting implementation work only, focused on the active build targets above.

Accepted PRs should ship or directly verify product behavior through code, prototypes, tests, workflows, configuration, or implementation changes, and should clearly move the browser preview or complete episode flow forward.

Docs-only, spec-only, planning-only, README/CONTRIBUTING/VISION-only, Markdown-only, typo-only, and stale-reference PRs are closed by default. They do not receive positive labels or score.

A PR should include:
- the user-facing improvement
- the workflow or taste rule it advances
- verification performed
- screenshots or preview notes when the change affects UI

## Maintainer Policy

The default policy is merge or close. There is no long requested-changes queue.

Merge requires unanimous maintainer approval. A PR is merged only when it is ready now, aligned with the Vision Model, and clearly improves the product more than the complexity, code, dependencies, abstractions, surface area, or maintenance burden it adds.

Maintainers merge work that:
- Merge clean PRs that pass CI, match the Vision Model, and improve an accepted workflow or quality bar.
- Prefer small coherent changes that can ship immediately over broad speculative rewrites.
- Treat product taste and user workflow fit as first-class acceptance criteria.
- Summarize merged work as product progress, not as raw PR activity.

Maintainers close work that:
- Close PRs that are incomplete, off-vision, overlapping, stale, docs-only, spec-only, planning-only, too small to matter, reward-farming, or likely to create product drift.
- Close technically plausible PRs when the benefit is not clearly greater than the complexity or surface area added.
- Close technically correct PRs when they solve the wrong problem or move the product away from the captured vision.
- Closed comments explain why the PR was closed. They are not an invitation to keep revising the same PR unless the maintainer explicitly says so.

## Labels

Labels are economic scoring signals, not generic tags. Positive labels are only applied to accepted code, prototype, test, workflow, configuration, or implementation changes.

Docs-only, spec-only, planning-only, README/CONTRIBUTING/VISION-only, Markdown-only, typo-only, and stale-reference PRs receive no positive labels, even when directionally useful.

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
- Keep `npm test` passing.
- Keep `typecheck` passing or explain why it does not apply.
- Keep `lint` passing or explain why it does not apply.
- Keep `preview-build` passing or explain why it does not apply.
- Include preview notes or screenshots when the PR changes the browser experience.
