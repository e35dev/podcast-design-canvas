"use strict";

// Guards preview nav scripts against ambiguous duplicate path= query params (#583).
// Catches the failure mode from PR #903: naive `&path=` appends when the
// destination already carries a different path value.
// Run with: `node preview/nav-query-merge.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const previewDir = __dirname;

function assertCanonicalPathMerge(navFile, shellPath, conflictingFile, expected) {
  const source = fs.readFileSync(path.join(previewDir, navFile), "utf8");
  assert.match(
    source,
    /mergeRouteSearch\s*\(|URLSearchParams[\s\S]{0,200}\.set\(\s*["']path["']/,
    `${navFile} merges path context with URLSearchParams.set`,
  );

  function hrefWithPathFor(file, search) {
    const window = { location: { pathname: "/prototype/screen.html", search } };
    const sandbox = {
      document: { readyState: "loading", addEventListener() {} },
      window,
      URLSearchParams,
    };
    vm.runInNewContext(
      `${source}\nglobalThis.result = hrefWithPath(${JSON.stringify(file)});`,
      sandbox,
    );
    return sandbox.result;
  }

  const merged = hrefWithPathFor(conflictingFile, shellPath);
  assert.equal(merged, expected, `${navFile} replaces conflicting path values canonically`);
  assert.equal((merged.match(/path=/g) || []).length, 1, `${navFile} emits one path query param`);
}

assertCanonicalPathMerge(
  "ingest-nav.js",
  "?path=ingest",
  "speaker-role-mapping.html?path=episode&draft=roles",
  "speaker-role-mapping.html?path=ingest&draft=roles",
);

assertCanonicalPathMerge(
  "publish-nav.js",
  "?path=publish",
  "episode-metadata-publishing.html?path=episode&draft=notes",
  "episode-metadata-publishing.html?path=publish&draft=notes",
);

assertCanonicalPathMerge(
  "speaker-setup-nav.js",
  "?path=episode",
  "speaker-role-mapping.html?path=ingest&draft=roles",
  "speaker-role-mapping.html?path=episode&draft=roles",
);

assertCanonicalPathMerge(
  "reuse-nav.js",
  "?path=reuse",
  "show-segment-system.html?path=episode&draft=segments",
  "show-segment-system.html?path=reuse&draft=segments",
);

assertCanonicalPathMerge(
  "style-nav.js",
  "?path=style",
  "preset-style-picker.html?path=episode&draft=preset",
  "preset-style-picker.html?path=style&draft=preset",
);

assertCanonicalPathMerge(
  "visuals-nav.js",
  "?path=episode",
  "show-segment-system.html?path=reuse&draft=segments",
  "show-segment-system.html?path=episode&draft=segments",
);

assertCanonicalPathMerge(
  "cleanup-nav.js",
  "?path=publish",
  "transcript-glossary.html?path=episode&draft=terms",
  "transcript-glossary.html?path=publish&draft=terms",
);

assertCanonicalPathMerge(
  "episode-flow-nav.js",
  "?path=episode",
  "audio-caption-quality-review.html?path=ingest&draft=notes",
  "audio-caption-quality-review.html?path=episode&draft=notes",
);

const ingestSource = fs.readFileSync(path.join(previewDir, "ingest-nav.js"), "utf8");
function ingestHrefWithPathFor(file, search) {
  const window = { location: { pathname: "/prototype/episode-readiness.html", search } };
  const sandbox = {
    document: { readyState: "loading", addEventListener() {} },
    window,
    URLSearchParams,
  };
  vm.runInNewContext(
    `${ingestSource}\nglobalThis.result = hrefWithPath(${JSON.stringify(file)});`,
    sandbox,
  );
  return sandbox.result;
}

const withHash = ingestHrefWithPathFor("social-context-intake.html?draft=links#review", "?path=ingest");
assert.equal(
  withHash,
  "social-context-intake.html?draft=links&path=ingest#review",
  "ingest nav preserves unrelated flags and hash segments when merging path context",
);

const speakerSetupSource = fs.readFileSync(path.join(previewDir, "speaker-setup-nav.js"), "utf8");
function speakerSetupHrefWithPathFor(file, search) {
  const window = { location: { pathname: "/prototype/guest-profile-reuse.html", search } };
  const sandbox = {
    document: { readyState: "loading", addEventListener() {} },
    window,
    URLSearchParams,
  };
  vm.runInNewContext(
    `${speakerSetupSource}\nglobalThis.result = hrefWithPath(${JSON.stringify(file)});`,
    sandbox,
  );
  return sandbox.result;
}

const setupWithHash = speakerSetupHrefWithPathFor(
  "speaker-attribution-review.html?draft=attribution#review",
  "?path=episode",
);
assert.equal(
  setupWithHash,
  "speaker-attribution-review.html?draft=attribution&path=episode#review",
  "speaker setup nav preserves unrelated flags and hash segments when merging path context",
);

const reuseSource = fs.readFileSync(path.join(previewDir, "reuse-nav.js"), "utf8");
function reuseHrefWithPathFor(file, search) {
  const window = { location: { pathname: "/prototype/show-template-adaptation.html", search } };
  const sandbox = {
    document: { readyState: "loading", addEventListener() {} },
    window,
    URLSearchParams,
  };
  vm.runInNewContext(
    `${reuseSource}\nglobalThis.result = hrefWithPath(${JSON.stringify(file)});`,
    sandbox,
  );
  return sandbox.result;
}

const reuseWithHash = reuseHrefWithPathFor(
  "intro-outro-builder.html?draft=intro#review",
  "?path=episode",
);
assert.equal(
  reuseWithHash,
  "intro-outro-builder.html?draft=intro&path=episode#review",
  "reuse nav preserves unrelated flags and hash segments when merging path context",
);

function reuseResolveFor(file, search) {
  const window = { location: { pathname: "/prototype/episode-runtime-shaping.html", search } };
  const sandbox = {
    document: { readyState: "loading", addEventListener() {} },
    window,
    URLSearchParams,
  };
  vm.runInNewContext(
    `${reuseSource}\nglobalThis.result = resolveReuseLink(${JSON.stringify(file)});`,
    sandbox,
  );
  return sandbox.result;
}

assert.equal(
  reuseResolveFor("episode-watch-through-preview.html", "?path=episode"),
  "episode-watch-through-preview.html?path=publish",
  "reuse nav promotes watch-through handoff links to the publish path",
);
assert.equal(
  reuseResolveFor("episode-watch-through-preview.html?path=episode&draft=watch", "?path=reuse"),
  "episode-watch-through-preview.html?path=publish&draft=watch",
  "reuse nav replaces conflicting path values on watch-through handoff links",
);
assert.equal(
  (reuseResolveFor("episode-watch-through-preview.html?path=episode", "").match(/path=/g) || []).length,
  1,
  "reuse handoff emits one canonical path query param",
);

const styleSource = fs.readFileSync(path.join(previewDir, "style-nav.js"), "utf8");
function styleHrefWithPathFor(file, search) {
  const window = { location: { pathname: "/prototype/layout-safe-areas.html", search } };
  const sandbox = {
    document: { readyState: "loading", addEventListener() {} },
    window,
    URLSearchParams,
  };
  vm.runInNewContext(
    `${styleSource}\nglobalThis.result = hrefWithPath(${JSON.stringify(file)});`,
    sandbox,
  );
  return sandbox.result;
}

const styleWithHash = styleHrefWithPathFor(
  "contextual-broll-moments.html?from=style#moment",
  "?path=episode",
);
assert.equal(
  styleWithHash,
  "contextual-broll-moments.html?from=style&path=episode#moment",
  "style nav preserves from=style and hash segments when merging path context",
);

const visualsSource = fs.readFileSync(path.join(previewDir, "visuals-nav.js"), "utf8");
function visualsHrefWithPathFor(file, search) {
  const window = { location: { pathname: "/prototype/sensitive-moment-review.html", search } };
  const sandbox = {
    document: { readyState: "loading", addEventListener() {} },
    window,
    URLSearchParams,
  };
  vm.runInNewContext(
    `${visualsSource}\nglobalThis.result = hrefWithPath(${JSON.stringify(file)});`,
    sandbox,
  );
  return sandbox.result;
}

const visualsWithHash = visualsHrefWithPathFor(
  "on-screen-correction-note.html?from=cleanup#note",
  "?path=episode",
);
assert.equal(
  visualsWithHash,
  "on-screen-correction-note.html?from=cleanup&path=episode#note",
  "visuals nav preserves from=cleanup and hash segments when merging path context",
);

const cleanupSource = fs.readFileSync(path.join(previewDir, "cleanup-nav.js"), "utf8");
function cleanupHrefWithPathFor(file, search) {
  const window = { location: { pathname: "/prototype/on-screen-correction-note.html", search } };
  const sandbox = {
    document: { readyState: "loading", addEventListener() {} },
    window,
    URLSearchParams,
  };
  vm.runInNewContext(
    `${cleanupSource}\nglobalThis.result = hrefWithPath(${JSON.stringify(file)});`,
    sandbox,
  );
  return sandbox.result;
}

function cleanupFlowContextFor(file, search) {
  const window = { location: { pathname: "/prototype/transcript-glossary.html", search } };
  const sandbox = {
    document: { readyState: "loading", addEventListener() {} },
    window,
    URLSearchParams,
  };
  vm.runInNewContext(
    `${cleanupSource}\nglobalThis.result = withCleanupFlowContext(${JSON.stringify(file)});`,
    sandbox,
  );
  return sandbox.result;
}

const cleanupWithHash = cleanupHrefWithPathFor(
  "contextual-broll-moments.html?from=cleanup#moment",
  "?path=publish",
);
assert.equal(
  cleanupWithHash,
  "contextual-broll-moments.html?from=cleanup&path=publish#moment",
  "cleanup nav preserves from=cleanup and hash segments when merging path context",
);

const cleanupFlowWithHash = cleanupFlowContextFor(
  "transcript-glossary.html?draft=terms#review",
  "?path=publish&from=cleanup",
);
assert.equal(
  cleanupFlowWithHash,
  "transcript-glossary.html?draft=terms&from=cleanup&path=publish#review",
  "cleanup nav preserves unrelated flags and hash segments when merging cleanup flow context",
);

const episodeFlowSource = fs.readFileSync(path.join(previewDir, "episode-flow-nav.js"), "utf8");
function episodeFlowHrefWithPathFor(file, search) {
  const window = { location: { pathname: "/prototype/export-readiness-review.html", search } };
  const sandbox = {
    document: { readyState: "loading", addEventListener() {} },
    window,
    URLSearchParams,
  };
  vm.runInNewContext(
    `${episodeFlowSource}\nglobalThis.result = hrefWithPath(${JSON.stringify(file)});`,
    sandbox,
  );
  return sandbox.result;
}

const episodeFlowWithHash = episodeFlowHrefWithPathFor(
  "music-cue-setup.html?draft=intro#review",
  "?path=episode",
);
assert.equal(
  episodeFlowWithHash,
  "music-cue-setup.html?draft=intro&path=episode#review",
  "episode flow nav preserves unrelated flags and hash segments when merging path context",
);

console.log("nav query merge: ingest, publish, speaker setup, reuse, style, visuals, cleanup, and episode flow path merges are canonical and non-ambiguous");
