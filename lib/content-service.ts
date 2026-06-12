import {
  allNewsItems,
  headlineItems,
  type NewsItem,
  type SectionKey,
  videoItems
} from "./worldcup-data";
import { getSupabaseClient } from "./supabase";

function toNewsItem(row: {
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
}): NewsItem {
  return {
    id: row.id,
    section: row.section,
    title: row.title,
    eyebrow: row.section === "videos" ? "精彩视频" : "世界杯头条",
    summary: row.summary,
    source: row.source ?? "Supabase 内容库",
    publishedAt: row.published_at ?? "2026-06-12",
    slug: row.slug,
    image:
      row.image_url ??
      "https://gips1.baidu.com/it/u=4263244788,2722555532&fm=3028&app=3028&f=JPEG&fmt=auto&q=100&size=f780_664",
    tags: row.tags ?? ["世界杯"],
    body:
      row.body ??
      [
        "这条内容来自 Supabase，可通过后台任务从百度动态源同步标题、摘要和正文模板。",
        "页面会继续保留百度动态检索链接，方便用户跳转查看实时结果。"
      ]
  };
}

export async function getNewsItems(section: SectionKey): Promise<NewsItem[]> {
  const fallback = section === "videos" ? videoItems : headlineItems;
  const supabase = getSupabaseClient();

  if (!supabase || (section !== "headlines" && section !== "videos")) {
    return fallback;
  }

  const { data, error } = await supabase
    .from("worldcup_items")
    .select("*")
    .eq("section", section)
    .order("published_at", { ascending: false })
    .limit(20);

  if (error || !data || data.length === 0) {
    return fallback;
  }

  return data.map(toNewsItem);
}

export async function getAllDynamicNewsItems(): Promise<NewsItem[]> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return allNewsItems;
  }

  const { data, error } = await supabase
    .from("worldcup_items")
    .select("*")
    .in("section", ["headlines", "videos"])
    .order("published_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return allNewsItems;
  }

  return data.map(toNewsItem);
}
