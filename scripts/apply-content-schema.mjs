import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import pg from "pg";
import { getDatabaseUrl, loadEnvFile } from "./db-url.mjs";

const { Client } = pg;
const rootDir = resolve(import.meta.dirname, "..");

async function main() {
  await loadEnvFile();

  const connectionString = getDatabaseUrl();
  if (!connectionString) {
    throw new Error("Missing Postgres connection string. Set SUPABASE_DB_URL or DATABASE_URL.");
  }

  const schema = await readFile(resolve(rootDir, "supabase", "content.sql"), "utf8");
  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 30000,
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
