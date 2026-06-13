import "server-only";
import { unstable_noStore as noStore } from "next/cache";
import { getPgPool } from "@/lib/postgres";
import { getCachedServerData } from "@/lib/server-cache";
import { scheduleDays, type ScheduleDay } from "@/lib/schedule-data";

export type ScheduleMatchDetailFocusItem = {
  duration: string;
  imageUrl: string | null;
  provider: string;
  title: string;
  url: string | null;
};

export type ScheduleMatchDetailIncident = {
  iconType: string;
  position: string;
  teamName: string;
  time: string;
  word: string;
};

export type ScheduleMatchDetail = {
  attendance: string | null;
  awayLogoUrl: string | null;
  awayName: string;
  awayRankText: string | null;
  awayScore: string | null;
  focusItems: ScheduleMatchDetailFocusItem[];
  homeLogoUrl: string | null;
  homeName: string;
  homeRankText: string | null;
  homeScore: string | null;
  incidents: ScheduleMatchDetailIncident[];
  kickLabel: string | null;
  matchStage: string;
  reportImageUrl: string | null;
  reportProvider: string | null;
  reportTitle: string | null;
  reportUrl: string | null;
  slug: string;
  sourceUrl: string | null;
  statusText: string;
  title: string;
  venue: string | null;
  winner: string | null;
};

type ScheduleRow = {
  away_logo_url: string | null;
  away_name: string;
  away_score: string | null;
  date_text: string;
  day_display_order: number;
  day_id: string;
  home_logo_url: string | null;
  home_name: string;
  home_score: string | null;
  kick_time: string;
  live_text: string;
  match_id: string;
  match_order: number;
  match_stage: string;
  slug: string;
  status_text: string;
};

type ScheduleDetailRow = {
  attendance: string | null;
  away_logo_url: string | null;
  away_name: string;
  away_rank_text: string | null;
  away_score: string | null;
  focus_items: ScheduleMatchDetailFocusItem[] | null;
  home_logo_url: string | null;
  home_name: string;
  home_rank_text: string | null;
  home_score: string | null;
  incidents: ScheduleMatchDetailIncident[] | null;
  kick_label: string | null;
  match_stage: string;
  report_image_url: string | null;
  report_provider: string | null;
  report_title: string | null;
  report_url: string | null;
  slug: string;
  source_url: string | null;
  status_text: string;
  title: string;
  venue: string | null;
  winner: string | null;
};

function rowsToScheduleDays(rows: ScheduleRow[]): ScheduleDay[] {
  const dayMap = new Map<string, ScheduleDay>();

  rows.forEach((row) => {
    if (!dayMap.has(row.day_id)) {
      dayMap.set(row.day_id, {
        id: row.day_id,
        label: row.date_text,
        matches: []
      });
    }

    dayMap.get(row.day_id)?.matches.push({
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
    });
  });

  return [...dayMap.values()];
}

function toScheduleMatchDetail(row: ScheduleDetailRow): ScheduleMatchDetail {
  return {
    attendance: row.attendance,
    awayLogoUrl: row.away_logo_url,
    awayName: row.away_name,
    awayRankText: row.away_rank_text,
    awayScore: row.away_score,
    focusItems: row.focus_items ?? [],
    homeLogoUrl: row.home_logo_url,
    homeName: row.home_name,
    homeRankText: row.home_rank_text,
    homeScore: row.home_score,
    incidents: row.incidents ?? [],
    kickLabel: row.kick_label,
    matchStage: row.match_stage,
    reportImageUrl: row.report_image_url,
    reportProvider: row.report_provider,
    reportTitle: row.report_title,
    reportUrl: row.report_url,
    slug: row.slug,
    sourceUrl: row.source_url,
    statusText: row.status_text,
    title: row.title,
    venue: row.venue,
    winner: row.winner
  };
}

export async function getScheduleDays(): Promise<ScheduleDay[]> {
  noStore();

  const pool = getPgPool();

  if (!pool) {
    return scheduleDays;
  }

  try {
    return await getCachedServerData("schedule:days", async () => {
      const { rows } = await pool.query<ScheduleRow>(`
        select
          day_id,
          date_text,
          day_display_order,
          match_id,
          match_order,
          kick_time,
          match_stage,
          home_name,
          home_logo_url,
          home_score,
          away_name,
          away_logo_url,
          away_score,
          status_text,
          live_text,
          slug
        from public.worldcup_schedule_view
        order by day_display_order asc, match_order asc
      `);

      return rows.length > 0 ? rowsToScheduleDays(rows) : scheduleDays;
    });
  } catch (error) {
    console.warn("Failed to load schedule from Supabase; using fallback data.", error);
    return scheduleDays;
  }
}

export async function getScheduleMatchDetailBySlug(slug: string): Promise<ScheduleMatchDetail | null> {
  noStore();

  const pool = getPgPool();
  if (!pool) {
    return null;
  }

  try {
    return await getCachedServerData(`schedule:detail:${slug}`, async () => {
      const { rows } = await pool.query<ScheduleDetailRow>(
        `
          select
            title,
            slug,
            match_stage,
            kick_label,
            home_name,
            home_logo_url,
            home_rank_text,
            home_score,
            away_name,
            away_logo_url,
            away_rank_text,
            away_score,
            status_text,
            winner,
            report_title,
            report_provider,
            report_url,
            report_image_url,
            focus_items,
            incidents,
            venue,
            attendance,
            source_url
          from public.worldcup_schedule_match_details
          where slug = $1
          limit 1
        `,
        [slug]
      );

      return rows[0] ? toScheduleMatchDetail(rows[0]) : null;
    });
  } catch (error) {
    console.warn("Failed to load schedule match detail from Supabase; using fallback data.", error);
    return null;
  }
}
