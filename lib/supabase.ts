import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { SectionKey } from "./worldcup-data";

export type WorldCupRow = {
  id: string;
  section: SectionKey;
  title: string;
  summary: string;
  slug: string;
  image_url: string | null;
  source: string | null;
  published_at: string | null;
  tags: string[] | null;
  body: string[] | null;
};

type Database = {
  public: {
    Tables: {
      worldcup_items: {
        Row: WorldCupRow;
        Insert: Omit<WorldCupRow, "id"> & { id?: string };
        Update: Partial<WorldCupRow>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

let cachedClient: SupabaseClient<Database> | null = null;

export function getSupabaseClient(): SupabaseClient<Database> | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  if (!cachedClient) {
    cachedClient = createClient<Database>(url, anonKey);
  }

  return cachedClient;
}
