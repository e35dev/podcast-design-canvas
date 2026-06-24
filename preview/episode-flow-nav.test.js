"use strict";

const fs = require("fs");
const assert = require("assert");
const vm = require("vm");

const navScript = fs.readFileSync(__dirname + "/episode-flow-nav.js", "utf8");

new vm.Script(navScript);
assert.ok(navScript.includes("app.html"), "episode flow nav links to the preview app");
