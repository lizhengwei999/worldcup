#!/usr/bin/env node
import { getDatabaseUrl, loadEnvFile } from "./db-url.mjs";

await loadEnvFile();

const databaseUrl = getDatabaseUrl();

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
