import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";
import pg from "pg";

const { Client } = pg;
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
    // The script also supports regular shell environment variables.
  }
}

function getDatabaseUrl() {
  const databaseUrl = [
    process.env.SUPABASE_DB_URL,
    process.env.DATABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ]
    .map(cleanEnvValue)
    .find((value) => value?.startsWith("postgres"));

  if (!databaseUrl) {
    return databaseUrl;
  }

  const url = new URL(databaseUrl);
  url.searchParams.delete("sslmode");
  url.searchParams.delete("sslrootcert");

  return url.toString();
}

async function main() {
  await loadEnvFile();

  const connectionString = getDatabaseUrl();
  if (!connectionString) {
    throw new Error("Missing Postgres connection string. Set SUPABASE_DB_URL or DATABASE_URL.");
  }

  const schema = await readFile(resolve(rootDir, "supabase", "content.sql"), "utf8");
  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 10000,
    ssl: {
      rejectUnauthorized: false
    }
  });

  await client.connect();

  try {
    await client.query(schema);
    const { rows } = await client.query(`
      select column_name
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'worldcup_items'
        and column_name in ('video_category', 'duration', 'display_order')
      order by column_name
    `);
    console.log(`Content schema applied. Columns: ${rows.map((row) => row.column_name).join(", ")}`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
