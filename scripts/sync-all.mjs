#!/usr/bin/env node
/**
 * 全站 Supabase 数据同步（按记忆文件中的采集地址依次执行）。
 * 用于本地手动更新与 GitHub Actions 定时任务。
 */
import { spawn } from "node:child_process";
import { resolve } from "node:path";

const rootDir = resolve(import.meta.dirname, "..");

const steps = [
  "db:schema:content",
  "db:seed:standings",
  "db:seed:schedule",
  "db:seed:headlines",
  "db:seed:match-details",
  "db:seed:schedule-previews",
  "db:seed:migu-videos",
  "db:seed:migu-player-rankings"
];

const failures = [];
let hadFailure = false;

for (const step of steps) {
  if (hadFailure) {
    console.log(`\n>>> Skipping ${step} because a previous step failed`);
    failures.push({ step, code: "skipped" });
    continue;
  }

  console.log(`\n>>> Running npm run ${step}`);
  const code = await new Promise((resolvePromise) => {
    const child = spawn("npm", ["run", step], {
      cwd: rootDir,
      env: process.env,
      shell: true,
      stdio: "inherit"
    });

    child.on("close", (exitCode) => resolvePromise(exitCode ?? 1));
  });

  if (code !== 0) {
    console.error(`>>> ${step} failed with exit code ${code}`);
    failures.push({ step, code });
    hadFailure = true;
  }
}

if (failures.length > 0) {
  console.error("\nSync completed with errors:");
  failures.forEach(({ step, code }) => console.error(`  - ${step}: exit ${code}`));
  process.exit(1);
}

console.log("\nAll site data sync steps completed successfully.");
