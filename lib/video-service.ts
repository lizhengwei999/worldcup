import "server-only";
import { unstable_noStore as noStore } from "next/cache";
import type { VideoSection } from "@/components/video-board";
import { getPgPool } from "@/lib/postgres";
import { getCachedServerData } from "@/lib/server-cache";
import { getServerSupabaseClient } from "@/lib/supabase-server";

const VIDEO_CATEGORIES = [
  { id: "focus", label: "聚焦世界杯" },
  { id: "teams", label: "48队巡礼" },
  { id: "stars", label: "星耀美加墨" }
] as const;

type VideoRow = {
  duration: string | null;
  external_url: string | null;
  id: string;
  image_url: string | null;
  slug: string;
  title: string;
  video_category: string | null;
  video_url: string | null;
};

const videoColumns =
  "id, title, slug, image_url, video_url, external_url, video_category, duration";

function fallbackSections(): VideoSection[] {
  return VIDEO_CATEGORIES.map((category) => ({
    id: category.id,
    items: [],
    label: category.label
  }));
}

function rowsToSections(rows: VideoRow[], limit?: number): VideoSection[] {
  return VIDEO_CATEGORIES.map((category) => {
    const items = rows
      .filter((row) => row.video_category === category.id)
      .slice(0, limit)
      .map((row) => ({
        duration: row.duration ?? "",
        externalUrl: row.external_url,
        id: row.id,
        image:
          row.image_url ??
          "https://gips1.baidu.com/it/u=4263244788,2722555532&fm=3028&app=3028&f=JPEG&fmt=auto&q=100&size=f780_664",
        slug: row.slug,
        title: row.title,
        videoUrl: row.video_url
      }));

    return {
      id: category.id,
      items,
      label: category.label
    };
  });
}

async function loadVideoRows() {
  const supabase = getServerSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("worldcup_items")
      .select(videoColumns)
      .eq("section", "videos")
      .not("video_category", "is", null)
      .order("video_category", { ascending: true })
      .order("published_at", { ascending: false })
      .order("display_order", { ascending: true });

    if (!error && data?.length) {
      return data as VideoRow[];
    }

    if (error) {
      console.warn("Supabase REST query failed for videos; trying Postgres.", error);
    }
  }

  const pool = getPgPool();
  if (!pool) {
    return [];
  }

  const { rows } = await pool.query<VideoRow>(`
    select ${videoColumns}
    from public.worldcup_items
    where section = 'videos'
      and video_category is not null
    order by video_category asc, published_at desc, display_order asc
  `);

  return rows;
}

export async function getVideoSections(limit?: number): Promise<VideoSection[]> {
  noStore();

  try {
    return await getCachedServerData(`videos:sections:${limit ?? "all"}`, async () => {
      const rows = await loadVideoRows();
      const sections = rowsToSections(rows, limit);
      return sections.every((section) => section.items.length > 0) ? sections : fallbackSections();
    });
  } catch (error) {
    console.warn("Failed to load videos from Supabase; using fallback sections.", error);
    return fallbackSections();
  }
}
