#!/usr/bin/env node
import { spawn } from "node:child_process";
import { resolve } from "node:path";

const rootDir = resolve(import.meta.dirname, "..");
const steps = [
  "db:schema:content",
  "db:seed:standings",
  "db:seed:schedule",
  "db:seed:headlines",
  "db:seed:match-details"
];

for (const step of steps) {
  console.log(`\n>>> Running npm run ${step}`);
  await new Promise((resolvePromise, reject) => {
    const child = spawn("npm", ["run", step], {
      cwd: rootDir,
      env: process.env,
      shell: true,
      stdio: "inherit"
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolvePromise();
      } else {
        reject(new Error(`${step} failed with exit code ${code}`));
      }
    });
  });
}

console.log("\nAll Baidu World Cup database updates completed.");
