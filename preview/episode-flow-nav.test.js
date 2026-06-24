"use strict";

const fs = require("fs");
const nav = fs.readFileSync(`${__dirname}/episode-flow-nav.js`, "utf8");
require("assert").ok(nav.includes('app.textContent = "Preview app"'));
console.log("episode flow nav: preview app link verified");
