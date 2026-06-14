import "server-only";
import { unstable_noStore as noStore } from "next/cache";
import { MIGU_PLAYER_RANK_CATEGORIES } from "@/lib/migu-player-rankings";
import { getPgPool } from "@/lib/postgres";
import { getCachedServerData } from "@/lib/server-cache";
import { getServerSupabaseClient } from "@/lib/supabase-server";

export type PlayerRankEntry = {
  figureId: string;
  matchesPlayed: number;
  playerImageUrl: string;
  playerName: string;
  rank: number;
  statValue: string;
  teamLogoUrl: string;
  teamName: string;
};

export type PlayerRankCategory = {
  columnLabel: string;
  key: string;
  label: string;
  players: PlayerRankEntry[];
  showPercent: boolean;
  statType: number;
};

type PlayerRankRow = {
  column_label: string;
  figure_id: string;
  matches_played: number;
  player_image_url: string | null;
  player_name: string;
  rank: number;
  show_percent: boolean;
  stat_key: string;
  stat_label: string;
  stat_type: number;
  stat_value: string;
  team_logo_url: string | null;
  team_name: string;
};

function formatStatValue(value: string, showPercent: boolean) {
  if (!showPercent) {
    return value;
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return value;
  }

  return `${numeric}%`;
}

function rowsToCategories(rows: PlayerRankRow[]): PlayerRankCategory[] {
  const grouped = new Map<number, PlayerRankRow[]>();

  rows.forEach((row) => {
    if (!grouped.has(row.stat_type)) {
      grouped.set(row.stat_type, []);
    }
    grouped.get(row.stat_type)?.push(row);
  });

  return MIGU_PLAYER_RANK_CATEGORIES.map((category) => {
    const categoryRows = grouped.get(category.statType) ?? [];

    return {
      columnLabel: category.columnLabel,
      key: category.key,
      label: category.label,
      showPercent: category.showPercent,
      statType: category.statType,
      players: categoryRows
        .sort((left, right) => left.rank - right.rank)
        .map((row) => ({
          figureId: row.figure_id,
          matchesPlayed: row.matches_played,
          playerImageUrl: row.player_image_url ?? "",
          playerName: row.player_name,
          rank: row.rank,
          statValue: formatStatValue(row.stat_value, row.show_percent),
          teamLogoUrl: row.team_logo_url ?? "",
          teamName: row.team_name
        }))
    };
  });
}

function emptyCategories(): PlayerRankCategory[] {
  return MIGU_PLAYER_RANK_CATEGORIES.map((category) => ({
    columnLabel: category.columnLabel,
    key: category.key,
    label: category.label,
    players: [],
    showPercent: category.showPercent,
    statType: category.statType
  }));
}

export async function getPlayerRankCategories(): Promise<PlayerRankCategory[]> {
  noStore();

  try {
    return await getCachedServerData("player-rankings:categories", async () => {
      const supabase = getServerSupabaseClient();
      if (supabase) {
        const { data, error } = await supabase
          .from("worldcup_player_rankings")
          .select(
            "stat_type, stat_key, stat_label, column_label, show_percent, category_order, rank, figure_id, player_name, player_image_url, team_name, team_logo_url, matches_played, stat_value"
          )
          .order("category_order", { ascending: true })
          .order("rank", { ascending: true });

        if (!error && data?.length) {
          return rowsToCategories(data as PlayerRankRow[]);
        }

        if (error) {
          console.warn("Supabase REST query failed for player rankings; trying Postgres.", error);
        }
      }

      const pool = getPgPool();
      if (!pool) {
        return emptyCategories();
      }

      const { rows } = await pool.query<PlayerRankRow>(`
        select
          stat_type,
          stat_key,
          stat_label,
          column_label,
          show_percent,
          rank,
          figure_id,
          player_name,
          player_image_url,
          team_name,
          team_logo_url,
          matches_played,
          stat_value
        from public.worldcup_player_rankings
        order by category_order asc, rank asc
      `);

      return rows.length > 0 ? rowsToCategories(rows) : emptyCategories();
    });
  } catch (error) {
    console.warn("Failed to load player rankings from Supabase.", error);
    return emptyCategories();
  }
}
