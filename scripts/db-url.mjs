import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";

export function cleanEnvValue(value) {
  return value?.trim().replace(/^["']|["']$/g, "");
}

export function resolveEnv(name, fallback = "") {
  const value = cleanEnvValue(process.env[name]);
  return value || fallback;
}

export async function loadEnvFile(rootDir = resolve(import.meta.dirname, "..")) {
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

export function shouldRewritePoolerToDirect() {
  if (process.env.SUPABASE_USE_POOLER === "1") {
    return false;
  }

  if (process.env.SUPABASE_FORCE_DIRECT === "1") {
    return true;
  }

  // CI / serverless environments should keep the IPv4-friendly pooler URL.
  if (process.env.GITHUB_ACTIONS === "true" || process.env.CI === "true" || process.env.VERCEL === "1") {
    return false;
  }

  return true;
}

export function normalizeDatabaseUrl(databaseUrl) {
  if (!databaseUrl) {
    return databaseUrl;
  }

  const url = new URL(databaseUrl);
  url.searchParams.delete("sslmode");
  url.searchParams.delete("sslrootcert");

  if (
    shouldRewritePoolerToDirect() &&
    url.hostname.includes("pooler.supabase.com") &&
    url.username.includes(".")
  ) {
    const projectRef = url.username.split(".")[1];
    if (projectRef) {
      url.hostname = `db.${projectRef}.supabase.co`;
      url.username = "postgres";
      url.port = "5432";
    }
  }

  return url.toString();
}

export function getDatabaseUrl() {
  const databaseUrl = [process.env.SUPABASE_DB_URL, process.env.DATABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY]
    .map(cleanEnvValue)
    .find((value) => value?.startsWith("postgres"));

  return normalizeDatabaseUrl(databaseUrl);
}
