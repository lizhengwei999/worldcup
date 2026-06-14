#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";

const rootDir = resolve(import.meta.dirname, "..");

function cleanEnvValue(value) {
  return value?.trim().replace(/^["']|["']$/g, "");
}

async function loadEnvFile() {
  try {
    const envContent = await readFile(resolve(rootDir, ".env"), "utf8");

    envContent.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
        return;
      }

      const separatorIndex = trimmed.indexOf("=");
      const key = trimmed.slice(0, separatorIndex).trim();
      const value = cleanEnvValue(trimmed.slice(separatorIndex + 1));

      if (key && value && !process.env[key]) {
        process.env[key] = value;
      }
    });
  } catch {
    // Shell environment variables are also supported.
  }
}

await loadEnvFile();

const databaseUrl = [process.env.SUPABASE_DB_URL, process.env.DATABASE_URL]
  .map(cleanEnvValue)
  .find((value) => value);

if (!databaseUrl) {
  console.error(
    "Missing SUPABASE_DB_URL. Add a Repository secret named SUPABASE_DB_URL with your Supabase Postgres URI (postgresql://...)."
  );
  process.exit(1);
}

if (!databaseUrl.startsWith("postgres://") && !databaseUrl.startsWith("postgresql://")) {
  console.error(
    "Invalid SUPABASE_DB_URL format. Expected postgresql://postgres:PASSWORD@HOST:5432/postgres"
  );
  console.error("Do not use https://...supabase.co or the anon key (eyJ...).");
  process.exit(1);
}

console.log("Database URL secret is present and format looks valid.");
