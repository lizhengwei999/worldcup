import "server-only";
import { unstable_noStore as noStore } from "next/cache";
import { getPgPool } from "@/lib/postgres";
import { getCachedServerData } from "@/lib/server-cache";
import { getServerSupabaseClient } from "@/lib/supabase-server";
import {
  allNewsItems,
  getDetailItem,
  headlineItems,
  type NewsItem,
  type SectionKey,
  videoItems
} from "./worldcup-data";

type WorldCupItemRow = {
  body: string[] | null;
  content_type: "article" | "video" | "live" | null;
  eyebrow: string | null;
  external_url: string | null;
  id: string;
  image_url: string | null;
  published_at: Date | string | null;
  section: SectionKey;
  source: string | null;
  slug: string;
  summary: string;
  tags: string[] | null;
  title: string;
  video_url: string | null;
};

const itemColumns =
  "id, section, title, eyebrow, summary, slug, image_url, source, published_at, content_type, video_url, external_url, tags, body";

function formatDate(value: Date | string | null) {
  if (!value) {
    return "2026-06-12";
  }

  if (typeof value === "string") {
    return value.includes("T") ? value.slice(0, 10) : value;
  }

  return value.toISOString().slice(0, 10);
}

function getReadableBody(row: WorldCupItemRow) {
  const blockedPatterns = [
    /这条内容从百度世界杯搜索页实时采集/,
    /采集脚本会保留/,
    /写入 Supabase/,
    /原始采集标题/,
    /百度世界杯搜索页动态/,
    /用于同步展示最新世界杯头条信息/,
    /适合在首页头条与详情页中承接视频热点/
  ];
  const body = (row.body ?? [])
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph && !blockedPatterns.some((pattern) => pattern.test(paragraph)));

  return body.length > 0 ? body : [row.summary];
}

function toNewsItem(row: WorldCupItemRow): NewsItem {
  return {
    id: row.id,
    section: row.section,
    title: row.title,
    eyebrow: row.eyebrow ?? (row.section === "videos" ? "精彩视频" : "资讯"),
    summary: row.summary,
    source: row.source ?? "Supabase 内容库",
    publishedAt: formatDate(row.published_at),
    slug: row.slug,
    image:
      row.image_url ??
      "https://gips1.baidu.com/it/u=4263244788,2722555532&fm=3028&app=3028&f=JPEG&fmt=auto&q=100&size=f780_664",
    tags: row.tags ?? ["世界杯"],
    body: getReadableBody(row),
    contentType: row.content_type ?? "article",
    externalUrl: row.external_url,
    videoUrl: row.video_url
  };
}

function uniqueByImage(items: NewsItem[], limit: number) {
  const seenImages = new Set<string>();
  const uniqueItems: NewsItem[] = [];

  for (const item of items) {
    if (seenImages.has(item.image)) {
      continue;
    }

    seenImages.add(item.image);
    uniqueItems.push(item);

    if (uniqueItems.length >= limit) {
      break;
    }
  }

  return uniqueItems;
}

function fallbackItems(section: SectionKey, limit?: number) {
  const fallback = section === "videos" ? videoItems : headlineItems;
  return limit ? fallback.slice(0, limit) : fallback;
}

async function queryItemsFromSupabase(section: SectionKey, limit: number) {
  const supabase = getServerSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("worldcup_items")
    .select(itemColumns)
    .eq("section", section)
    .order("published_at", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(Math.max(limit * 3, limit));

  if (error) {
    throw error;
  }

  return (data ?? []) as WorldCupItemRow[];
}

async function queryItemsFromPostgres(section: SectionKey, limit: number) {
  const pool = getPgPool();
  if (!pool) {
    return null;
  }

  const { rows } = await pool.query<WorldCupItemRow>(
    `
      select ${itemColumns}
      from public.worldcup_items
      where section = $1
      order by published_at desc, updated_at desc
      limit $2
    `,
    [section, Math.max(limit * 3, limit)]
  );

  return rows;
}

async function loadSectionItems(section: SectionKey, limit: number) {
  const rows =
    (await queryItemsFromSupabase(section, limit).catch((error) => {
      console.warn("Supabase REST query failed for content list; trying Postgres.", error);
      return null;
    })) ?? (await queryItemsFromPostgres(section, limit));

  return rows ?? [];
}

export async function getNewsItems(section: SectionKey, limit = 20): Promise<NewsItem[]> {
  noStore();

  if (section !== "headlines" && section !== "videos") {
    return fallbackItems(section, limit);
  }

  try {
    return await getCachedServerData(`content:list:${section}:${limit}`, async () => {
      const rows = await loadSectionItems(section, limit);
      return rows.length > 0 ? uniqueByImage(rows.map(toNewsItem), limit) : fallbackItems(section, limit);
    });
  } catch (error) {
    console.warn("Failed to load news items from Supabase; using fallback data.", error);
    return fallbackItems(section, limit);
  }
}

export async function getAllDynamicNewsItems(): Promise<NewsItem[]> {
  noStore();

  try {
    return await getCachedServerData("content:all-dynamic", async () => {
      const supabase = getServerSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("worldcup_items")
          .select(itemColumns)
          .in("section", ["headlines", "videos"])
          .order("published_at", { ascending: false })
          .order("updated_at", { ascending: false });

        if (!error && data?.length) {
          return (data as WorldCupItemRow[]).map(toNewsItem);
        }

        if (error) {
          console.warn("Supabase REST query failed for all content; trying Postgres.", error);
        }
      }

      const pool = getPgPool();
      if (!pool) {
        return allNewsItems;
      }

      const { rows } = await pool.query<WorldCupItemRow>(`
        select ${itemColumns}
        from public.worldcup_items
        where section in ('headlines', 'videos')
        order by published_at desc, updated_at desc
      `);

      return rows.length > 0 ? rows.map(toNewsItem) : allNewsItems;
    });
  } catch (error) {
    console.warn("Failed to load all news items from Supabase; using fallback data.", error);
    return allNewsItems;
  }
}

export async function getNewsItemBySlug(section: string, slug: string): Promise<NewsItem | undefined> {
  noStore();

  if (section !== "headlines" && section !== "videos") {
    return getDetailItem(section, slug);
  }

  try {
    return await getCachedServerData(`content:detail:${section}:${slug}`, async () => {
      const supabase = getServerSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("worldcup_items")
          .select(itemColumns)
          .eq("section", section)
          .eq("slug", slug)
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          return toNewsItem(data as WorldCupItemRow);
        }

        if (error) {
          console.warn("Supabase REST query failed for content detail; trying Postgres.", error);
        }
      }

      const pool = getPgPool();
      if (!pool) {
        return getDetailItem(section, slug);
      }

      const { rows } = await pool.query<WorldCupItemRow>(
        `
          select ${itemColumns}
          from public.worldcup_items
          where section = $1 and slug = $2
          limit 1
        `,
        [section, slug]
      );

      return rows[0] ? toNewsItem(rows[0]) : getDetailItem(section, slug);
    });
  } catch (error) {
    console.warn("Failed to load news detail from Supabase; using fallback data.", error);
    return getDetailItem(section, slug);
  }
}

export async function getRelatedNewsItems(item: NewsItem, limit = 4): Promise<NewsItem[]> {
  noStore();

  try {
    return await getCachedServerData(`content:related:${item.section}:${item.id}:${limit}`, async () => {
      const supabase = getServerSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("worldcup_items")
          .select(itemColumns)
          .eq("section", item.section)
          .neq("id", item.id)
          .order("published_at", { ascending: false })
          .order("updated_at", { ascending: false })
          .limit(limit);

        if (!error && data) {
          return (data as WorldCupItemRow[]).map(toNewsItem);
        }

        if (error) {
          console.warn("Supabase REST query failed for related content; trying Postgres.", error);
        }
      }

      const pool = getPgPool();
      if (!pool) {
        return allNewsItems.filter((related) => related.section === item.section && related.id !== item.id).slice(0, limit);
      }

      const { rows } = await pool.query<WorldCupItemRow>(
        `
          select ${itemColumns}
          from public.worldcup_items
          where section = $1 and id <> $2
          order by published_at desc, updated_at desc
          limit $3
        `,
        [item.section, item.id, limit]
      );

      return rows.map(toNewsItem);
    });
  } catch (error) {
    console.warn("Failed to load related news from Supabase; using fallback data.", error);
    return allNewsItems.filter((related) => related.section === item.section && related.id !== item.id).slice(0, limit);
  }
}
