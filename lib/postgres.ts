import "server-only";
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __worldcupPgPool: Pool | undefined;
}

function cleanEnvValue(value: string | undefined) {
  return value?.trim().replace(/^["']|["']$/g, "");
}

export function getDatabaseUrl() {
  const databaseUrl = [
    process.env.SUPABASE_DB_URL,
    process.env.DATABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ];

  const candidate = databaseUrl.map(cleanEnvValue).find((value) => value?.startsWith("postgres"));

  if (!candidate) {
    return null;
  }

  const url = new URL(candidate);
  url.searchParams.delete("sslmode");
  url.searchParams.delete("sslrootcert");

  if (url.hostname.includes("pooler.supabase.com") && url.username.includes(".") && process.env.VERCEL !== "1") {
    const projectRef = url.username.split(".")[1];
    if (projectRef) {
      url.hostname = `db.${projectRef}.supabase.co`;
      url.username = "postgres";
      url.port = "5432";
    }
  }

  return url.toString();
}

export function getPgPool() {
  const connectionString = getDatabaseUrl();

  if (!connectionString) {
    return null;
  }

  if (!globalThis.__worldcupPgPool) {
    globalThis.__worldcupPgPool = new Pool({
      connectionString,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      max: 5,
      ssl: {
        rejectUnauthorized: false
      }
    });

    globalThis.__worldcupPgPool.on("error", (error) => {
      console.warn("Postgres idle client error; the pool will recover on the next query.", error);
    });
  }

  return globalThis.__worldcupPgPool;
}
