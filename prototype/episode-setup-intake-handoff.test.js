"use strict";

// Guards the active guided episode setup intake (#1326): the first step creates
// tracks from either a recording link or synced speaker files, blocks incomplete
// setup, and carries source/role/name/social context into speaker role mapping.
// Run with: `node prototype/episode-setup-intake-handoff.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");
const vm = require("vm");

const dir = __dirname;
const readinessHtml = fs.readFileSync(path.join(dir, "episode-readiness.html"), "utf8");
const roleMappingHtml = fs.readFileSync(path.join(dir, "speaker-role-mapping.html"), "utf8");

const recordingLink = "https://riverside.fm/studio/product-roundtable";

const readiness = loadPrototype(readinessHtml, {
  search: "?path=episode",
  roots: [
    "#tracks",
    "#status",
    "#issues",
    "#continue",
    "#continueNote",
    "#addGuest",
    "#reset",
    "#layout-handoff",
    "#setupStatus",
    "#recordingMode",
    "#fileMode",
    "#recordingControls",
    "#fileControls",
    "#recordingLink",
    "#speakerFiles",
    "#loadRecording",
    "#loadFiles",
  ],
});

assert.strictEqual(typeof readiness.sandbox.createTracksFromRecordingLink, "function", "recording-link setup creates tracks");
assert.strictEqual(typeof readiness.sandbox.createTracksFromFiles, "function", "multi-file setup creates tracks");
assert.strictEqual(typeof readiness.sandbox.evaluateSetup, "function", "setup has a single evaluator");
assert.strictEqual(typeof readiness.sandbox.nextSetupHref, "function", "setup can build the next-step handoff URL");

const emptySetup = readiness.sandbox.evaluateSetup([], {
  sourceType: "recording-link",
  recordingLink: "",
  fileNames: [],
});
assert.strictEqual(emptySetup.complete, false, "empty setup is not complete");
assert.ok(emptySetup.issues.some((issue) => issue.key === "missing-recording-link"), "empty recording setup asks for a link");
assert.ok(emptySetup.issues.some((issue) => issue.key === "missing-tracks"), "empty recording setup asks for tracks");

const recordingTracks = readiness.sandbox.createTracksFromRecordingLink(recordingLink);
assert.deepEqual(
  recordingTracks.map((track) => track.role),
  ["host", "guest"],
  "a recording link creates host and guest setup tracks",
);
assert.strictEqual(
  readiness.sandbox.evaluateSetup(recordingTracks, {
    sourceType: "recording-link",
    recordingLink,
    fileNames: [],
  }).complete,
  false,
  "recording-link tracks still require speaker names before continuing",
);

recordingTracks[0].speakerName = "Dana Brooks";
recordingTracks[0].socialLink = "https://www.linkedin.com/in/danabrooks";
recordingTracks[1].speakerName = "Marcus Lee";
recordingTracks[1].socialLink = "https://x.com/marcuslee";

const completeRecording = readiness.sandbox.evaluateSetup(recordingTracks, {
  sourceType: "recording-link",
  recordingLink,
  fileNames: [],
});
assert.strictEqual(completeRecording.complete, true, "named recording-link tracks complete setup");

const speakerFiles = readiness.sandbox.createTracksFromFiles([
  { name: "dana-host.mp4", size: 10, lastModified: 1 },
  { name: "marcus-guest.mp4", size: 11, lastModified: 2 },
  { name: "priya-guest.mp4", size: 12, lastModified: 3 },
]);
assert.deepEqual(
  speakerFiles.map((track) => track.role),
  ["host", "guest", "guest-2"],
  "three speaker files map to Host, Guest 1, and Guest 2 buckets",
);
assert.deepEqual(
  speakerFiles.map((track) => track.speakerName),
  ["Dana", "Marcus", "Priya"],
  "speaker files derive creator-readable names",
);

const missingRole = speakerFiles.map((track) => ({ ...track }));
missingRole[1].role = "";
const missingRoleEval = readiness.sandbox.evaluateSetup(missingRole, {
  sourceType: "speaker-files",
  recordingLink: "",
  fileNames: missingRole.map((track) => track.sourceName),
});
assert.strictEqual(missingRoleEval.complete, false, "file setup blocks a source with no bucket");
assert.ok(missingRoleEval.issues.some((issue) => issue.key === "missing-role:file-2"), "missing bucket is reported per track");
assert.ok(missingRoleEval.issues.some((issue) => issue.key === "missing-guest"), "required Guest 1 bucket must be filled");

speakerFiles[0].socialLink = "https://www.linkedin.com/in/danabrooks";
speakerFiles[1].socialLink = "https://x.com/marcuslee";
speakerFiles[2].socialLink = "https://www.linkedin.com/in/priya";

const href = readiness.sandbox.nextSetupHref(speakerFiles, {
  sourceType: "speaker-files",
  recordingLink: "",
  fileNames: speakerFiles.map((track) => track.sourceName),
});
const parsedHref = new URL(href, "https://example.com/prototype/");
assert.strictEqual(parsedHref.pathname, "/prototype/speaker-role-mapping.html", "complete setup continues to speaker role mapping");
assert.strictEqual(parsedHref.searchParams.get("path"), "episode", "setup handoff preserves the episode path");

const payload = JSON.parse(parsedHref.searchParams.get("setup"));
assert.strictEqual(payload.sourceType, "speaker-files", "handoff carries the chosen source type");
assert.deepEqual(
  payload.tracks.map((track) => track.roleLabel),
  ["Host", "Guest 1", "Guest 2"],
  "handoff carries the assigned speaker buckets",
);
assert.deepEqual(
  payload.tracks.map((track) => track.socialLink),
  ["https://www.linkedin.com/in/danabrooks", "https://x.com/marcuslee", "https://www.linkedin.com/in/priya"],
  "handoff carries optional social links",
);

const roleMapping = loadPrototype(roleMappingHtml, {
  search: `?path=episode&setup=${encodeURIComponent(JSON.stringify(payload))}`,
  roots: [
    "#tracks",
    "#status",
    "#issues",
    "#layout-handoff",
    "#setup-handoff",
    "#addTrack",
    "#reset",
  ],
});

assert.strictEqual(typeof roleMapping.sandbox.readSetupHandoff, "function", "role mapping can read setup handoff state");
assert.strictEqual(typeof roleMapping.sandbox.setupTracksFromHandoff, "function", "role mapping can seed tracks from setup state");

const mapped = roleMapping.sandbox.setupTracksFromHandoff(payload);
assert.deepEqual(
  mapped.map((track) => track.role),
  ["host", "guest", "guest"],
  "role mapping receives Host and both guest buckets as product roles",
);
assert.deepEqual(
  mapped.map((track) => track.name),
  ["Dana", "Marcus", "Priya"],
  "role mapping receives speaker names from setup",
);

const summary = roleMapping.roots["#setup-handoff"];
assert.strictEqual(summary.hidden, false, "role mapping reveals the setup carry-forward summary");
assert.match(summary._children[0].textContent, /From episode setup: Speaker files/, "setup summary names the source type");
assert.match(summary._children[1].textContent, /3 speaker files carried forward/, "setup summary counts carried files");
assert.match(summary._children[2].textContent, /Guest 2: Priya/, "setup summary names the carried Guest 2 speaker");
assert.match(summary._children[2].textContent, /linkedin\.com\/in\/priya/, "setup summary shows carried social links");

assert.ok(!/innerHTML/.test(readinessHtml), "episode readiness keeps dynamic setup rendering out of innerHTML");

console.log("episode setup intake: recording link, speaker files, gating, and role-mapping handoff verified");

function loadPrototype(html, { search, roots }) {
  function makeNode(tag = "div") {
    return {
      tagName: tag,
      id: "",
      _children: [],
      style: {},
      dataset: {},
      hidden: false,
      href: "",
      textContent: "",
      value: "",
      checked: false,
      disabled: false,
      files: [],
      set className(value) { this._className = value; },
      get className() { return this._className; },
      setAttribute(name, value) { this[name] = value; },
      getAttribute(name) { return this[name] || null; },
      removeAttribute(name) { delete this[name]; },
      addEventListener() {},
      append(...children) { this._children.push(...children); },
      appendChild(child) { this._children.push(child); return child; },
      replaceChildren(...children) { this._children = children; },
      insertBefore(child) { this._children.unshift(child); return child; },
      remove() {},
      querySelector() { return makeNode(); },
      querySelectorAll() { return []; },
    };
  }

  const rootNodes = {};
  roots.forEach((selector) => {
    rootNodes[selector] = makeNode();
  });

  const documentStub = {
    createElement: (tag) => makeNode(tag),
    createTextNode: (text) => ({ textContent: text }),
    querySelector: (selector) => rootNodes[selector] || makeNode(),
  };
  const sandbox = {
    document: documentStub,
    window: {
      PodcastLayoutHandoff: null,
      location: { search },
      sessionStorage: undefined,
    },
    structuredClone: globalThis.structuredClone,
    URL,
    URLSearchParams,
    console,
  };
  vm.createContext(sandbox);
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  vm.runInContext(script, sandbox);
  return { sandbox, roots: rootNodes };
}
