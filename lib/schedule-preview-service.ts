import "server-only";
import { unstable_noStore as noStore } from "next/cache";
import { getPgPool } from "@/lib/postgres";
import {
  resolveScheduleMatchDisplay,
  type ResolvedScheduleMatchDisplay
} from "@/lib/schedule-match-display";
import { getServerSupabaseClient } from "@/lib/supabase-server";
import type { ScheduleMatch } from "@/lib/schedule-data";

export type ScheduleMatchPreview = {
  awayIntro: string[];
  awayLogoUrl: string | null;
  awayName: string;
  baiduSearchUrl: string;
  homeIntro: string[];
  homeLogoUrl: string | null;
  homeName: string;
  kickLabel: string;
  matchId: string;
  matchStage: string;
  slug: string;
  summary: string;
};

type PreviewRow = {
  away_intro: string[];
  away_logo_url: string | null;
  away_name: string;
  baidu_search_url: string;
  home_intro: string[];
  home_logo_url: string | null;
  home_name: string;
  kick_label: string;
  match_id: string;
  match_stage: string;
  slug: string;
  summary: string;
};

type ScheduleMatchRow = {
  away_logo_url: string | null;
  away_name: string;
  away_score: string | null;
  day_id: string;
  home_logo_url: string | null;
  home_name: string;
  home_score: string | null;
  kick_time: string;
  live_text: string;
  match_id: string;
  match_stage: string;
  slug: string;
  status_text: string;
};

function rowToPreview(row: PreviewRow): ScheduleMatchPreview {
  return {
    awayIntro: row.away_intro ?? [],
    awayLogoUrl: row.away_logo_url,
    awayName: row.away_name,
    baiduSearchUrl: row.baidu_search_url,
    homeIntro: row.home_intro ?? [],
    homeLogoUrl: row.home_logo_url,
    homeName: row.home_name,
    kickLabel: row.kick_label,
    matchId: row.match_id,
    matchStage: row.match_stage,
    slug: row.slug,
    summary: row.summary
  };
}

function rowToScheduleMatch(row: ScheduleMatchRow): ScheduleMatch {
  return {
    away: {
      flag: row.away_logo_url ?? undefined,
      name: row.away_name
    },
    awayScore: row.away_score,
    group: row.match_stage,
    home: {
      flag: row.home_logo_url ?? undefined,
      name: row.home_name
    },
    homeScore: row.home_score,
    id: row.match_id,
    liveLabel: row.live_text,
    slug: row.slug,
    statusLabel: row.status_text,
    time: row.kick_time
  };
}

export function getScheduleMatchDisplay(
  match: ScheduleMatch,
  dayId: string,
  now = new Date()
): ResolvedScheduleMatchDisplay {
  return resolveScheduleMatchDisplay(match, dayId, now);
}

async function deletePreviewBySlug(slug: string) {
  const supabase = getServerSupabaseClient();
  if (supabase) {
    const { error } = await supabase.from("worldcup_schedule_match_previews").delete().eq("slug", slug);
    if (!error) {
      return;
    }
  }

  const pool = getPgPool();
  if (!pool) {
    return;
  }

  await pool.query("delete from public.worldcup_schedule_match_previews where slug = $1", [slug]);
}

async function loadPreviewRow(slug: string) {
  const supabase = getServerSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("worldcup_schedule_match_previews")
      .select(
        "match_id, slug, match_stage, kick_label, home_name, home_logo_url, away_name, away_logo_url, summary, home_intro, away_intro, baidu_search_url"
      )
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (!error && data) {
      return data as PreviewRow;
    }
  }

  const pool = getPgPool();
  if (!pool) {
    return null;
  }

  const { rows } = await pool.query<PreviewRow>(
    `
      select
        match_id,
        slug,
        match_stage,
        kick_label,
        home_name,
        home_logo_url,
        away_name,
        away_logo_url,
        summary,
        home_intro,
        away_intro,
        baidu_search_url
      from public.worldcup_schedule_match_previews
      where slug = $1 and is_active = true
      limit 1
    `,
    [slug]
  );

  return rows[0] ?? null;
}

async function loadScheduleMatchRow(slug: string) {
  const supabase = getServerSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("worldcup_schedule_view")
      .select(
        "match_id, slug, day_id, kick_time, match_stage, home_name, home_logo_url, home_score, away_name, away_logo_url, away_score, status_text, live_text"
      )
      .eq("slug", slug)
      .maybeSingle();

    if (!error && data) {
      return data as ScheduleMatchRow;
    }
  }

  const pool = getPgPool();
  if (!pool) {
    return null;
  }

  const { rows } = await pool.query<ScheduleMatchRow>(
    `
      select
        match_id,
        slug,
        day_id,
        kick_time,
        match_stage,
        home_name,
        home_logo_url,
        home_score,
        away_name,
        away_logo_url,
        away_score,
        status_text,
        live_text
      from public.worldcup_schedule_view
      where slug = $1
      limit 1
    `,
    [slug]
  );

  return rows[0] ?? null;
}

export async function getScheduleMatchBySlug(slug: string) {
  noStore();

  const row = await loadScheduleMatchRow(slug);
  if (!row) {
    return null;
  }

  return {
    dayId: row.day_id,
    match: rowToScheduleMatch(row)
  };
}

export async function getScheduleMatchPreviewBySlug(slug: string) {
  noStore();

  const matchRow = await loadScheduleMatchRow(slug);
  if (!matchRow) {
    return null;
  }

  const match = rowToScheduleMatch(matchRow);
  const display = resolveScheduleMatchDisplay(match, matchRow.day_id);

  if (display.isLive || display.isFinished) {
    await deletePreviewBySlug(slug);
    return null;
  }

  if (!display.isUpcoming) {
    return null;
  }

  const previewRow = await loadPreviewRow(slug);
  return previewRow ? rowToPreview(previewRow) : null;
}

export async function purgeInactiveSchedulePreviews() {
  noStore();

  const pool = getPgPool();
  if (!pool) {
    return 0;
  }

  const { rows } = await pool.query<ScheduleMatchRow>(
    `
      select
        match_id,
        slug,
        day_id,
        kick_time,
        match_stage,
        home_name,
        home_logo_url,
        home_score,
        away_name,
        away_logo_url,
        away_score,
        status_text,
        live_text
      from public.worldcup_schedule_view
    `
  );

  const staleSlugs = rows
    .filter((row) => {
      const display = resolveScheduleMatchDisplay(rowToScheduleMatch(row), row.day_id);
      return display.isLive || display.isFinished;
    })
    .map((row) => row.slug);

  if (staleSlugs.length === 0) {
    return 0;
  }

  await pool.query(
    "delete from public.worldcup_schedule_match_previews where slug = any($1::text[])",
    [staleSlugs]
  );

  return staleSlugs.length;
}
