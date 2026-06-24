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

console.log("nav query merge: ingest, publish, speaker setup, and reuse path merges are canonical and non-ambiguous");
