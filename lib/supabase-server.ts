import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

declare global {
  // eslint-disable-next-line no-var
  var __worldcupSupabaseServerClient: SupabaseClient | undefined;
}

function cleanEnvValue(value: string | undefined) {
  return value?.trim().replace(/^["']|["']$/g, "");
}

export function getServerSupabaseClient(): SupabaseClient | null {
  const url = cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key =
    cleanEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY) ??
    cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ??
    cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

  if (!url || !key) {
    return null;
  }

  if (!globalThis.__worldcupSupabaseServerClient) {
    globalThis.__worldcupSupabaseServerClient = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  return globalThis.__worldcupSupabaseServerClient;
}
