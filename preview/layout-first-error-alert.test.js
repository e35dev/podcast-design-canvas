"use strict";

// The layout-first placement error card must carry alert semantics so assistive tech announces
// a rejected placement, matching the already-live readiness summary (#1131 / #1026). This is a
// structural one-attribute change, so it gets a small structural assertion — the whole opening
// tag is matched so the check does not depend on attribute order.
// Run: `node preview/layout-first-error-alert.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const html = fs.readFileSync(path.join(__dirname, "layout-first.html"), "utf8");

const errorTag = html.match(/<[a-z]+\b[^>]*\bid="layout-error-card"[^>]*>/i);
assert.ok(errorTag, "the layout-first error card element exists");
assert.match(errorTag[0], /\brole="alert"/, "the error card is announced as an alert");

const statusTag = html.match(/<[a-z]+\b[^>]*\bid="layout-slot-status"[^>]*>/i);
assert.ok(statusTag && /\baria-live=/.test(statusTag[0]), "the readiness summary stays a live region");

console.log("layout-first error card carries role=alert; readiness summary stays a live region");
