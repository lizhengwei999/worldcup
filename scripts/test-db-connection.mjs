#!/usr/bin/env node
import pg from "pg";
import { getDatabaseUrl, loadEnvFile } from "./db-url.mjs";

const { Client } = pg;

await loadEnvFile();

const connectionString = getDatabaseUrl();
if (!connectionString) {
  console.error("Missing SUPABASE_DB_URL.");
  process.exit(1);
}

const client = new Client({
  connectionString,
  connectionTimeoutMillis: 30000,
  ssl: {
    rejectUnauthorized: false
  }
});

try {
  await client.connect();
  const { rows } = await client.query("select current_database() as db, now() as ts");
  console.log(`Connected to ${rows[0].db} at ${rows[0].ts}`);
} catch (error) {
  console.error("Database connection failed:", error instanceof Error ? error.message : error);
  process.exit(1);
} finally {
  await client.end().catch(() => undefined);
}
