import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join } from "node:path";

const testDirs = ["preview", "prototype"];

const testFiles = testDirs.flatMap((dir) =>
  readdirSync(dir)
    .filter((file) => file.endsWith(".test.js"))
    .sort()
    .map((file) => join(dir, file)),
);

if (testFiles.length === 0) {
  console.error("No smoke tests found.");
  process.exit(1);
}

for (const file of testFiles) {
  console.log(`\n> node ${file}`);
  const result = spawnSync("node", [file], { stdio: "inherit" });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log(`\n${testFiles.length} smoke test files passed.`);
