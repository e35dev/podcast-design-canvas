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
const ingestSource = fs.readFileSync(path.join(previewDir, "ingest-nav.js"), "utf8");

assert.match(
  ingestSource,
  /mergeRouteSearch\s*\(|URLSearchParams[\s\S]{0,200}\.set\(\s*["']path["']/,
  "ingest nav merges path context with URLSearchParams.set",
);

function hrefWithPathFor(file, search) {
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

const conflicting = hrefWithPathFor(
  "speaker-role-mapping.html?path=episode&draft=roles",
  "?path=ingest",
);
assert.equal(
  conflicting,
  "speaker-role-mapping.html?path=ingest&draft=roles",
  "ingest nav replaces conflicting path values with the shell ingest context",
);
assert.equal(
  (conflicting.match(/path=/g) || []).length,
  1,
  "ingest nav emits one canonical path query param after merge",
);

const withHash = hrefWithPathFor("social-context-intake.html?draft=links#review", "?path=ingest");
assert.equal(
  withHash,
  "social-context-intake.html?draft=links&path=ingest#review",
  "ingest nav preserves unrelated flags and hash segments when merging path context",
);

console.log("nav query merge: ingest path merge is canonical and non-ambiguous");
