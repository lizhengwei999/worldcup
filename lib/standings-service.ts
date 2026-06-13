import "server-only";
import { unstable_noStore as noStore } from "next/cache";
import { getPgPool } from "@/lib/postgres";
import { getCachedServerData } from "@/lib/server-cache";
import {
  standingGroups,
  standingItems,
  type NewsItem,
  type StandingGroup,
  type StandingItem
} from "@/lib/worldcup-data";

type StandingRow = {
  draws: number;
  goals_against: number;
  goals_for: number;
  goal_diff: number;
  group_code: string;
  group_display_order: number;
  group_rank: number;
  logo_url: string;
  losses: number;
  played: number;
  points: number;
  slug: string;
  team_id: string;
  team_name: string;
  wins: number;
};

function rowsToGroups(rows: StandingRow[]): StandingGroup[] {
  const groupMap = new Map<string, StandingGroup>();

  rows.forEach((row) => {
    if (!groupMap.has(row.group_code)) {
      groupMap.set(row.group_code, {
        group: row.group_code,
        teams: []
      });
    }

    groupMap.get(row.group_code)?.teams.push({
      against: row.goals_against,
      draw: row.draws,
      goals: row.goals_for,
      goalDiff: row.goal_diff,
      group: row.group_code,
      id: row.team_id,
      logo: row.logo_url,
      loss: row.losses,
      played: row.played,
      points: row.points,
      rank: row.group_rank,
      slug: row.slug,
      team: row.team_name,
      win: row.wins
    });
  });

  return [...groupMap.values()].map((group) => ({
    ...group,
    teams: group.teams.sort((left, right) => left.rank - right.rank)
  }));
}

function getPromotionText(rank: number) {
  if (rank <= 2) {
    return "当前处于小组直接晋级32强位置。";
  }

  if (rank === 3) {
    return "当前处于小组第三，仍需比较各组第三成绩争取晋级。";
  }

  return "当前暂列小组第四，需要后续比赛抢分提升排名。";
}

function standingsDetailFromTeam(team: StandingItem, group?: StandingGroup): NewsItem {
  const groupOpponents =
    group?.teams
      .filter((item) => item.id !== team.id)
      .sort((left, right) => left.rank - right.rank)
      .map((item) => `${item.team}${item.points}分`)
      .join("、") ?? "";

  return {
    body: [
      `${team.team}目前位列${team.group}第${team.rank}，已赛${team.played}场，战绩为${team.win}胜${team.draw}平${team.loss}负，进${team.goals}球、失${team.against}球，净胜球${team.goalDiff}。`,
      getPromotionText(team.rank),
      groupOpponents
        ? `${team.group}同组主要排名情况：${groupOpponents}。后续排名会根据积分、净胜球、进球数等规则继续变化。`
        : "后续排名会根据积分、净胜球、进球数等规则继续变化。",
      "本页数据来自 Supabase 积分表，积分榜从百度体育排名页同步后会自动更新这里的球队详情。"
    ],
    eyebrow: team.group,
    id: team.id,
    image: team.logo,
    publishedAt: "2026-06-13",
    section: "standings",
    slug: team.slug,
    source: "Supabase 积分表",
    summary: `排名第${team.rank}，已赛${team.played}场，${team.win}胜${team.draw}平${team.loss}负，进${team.goals}失${team.against}，净胜球${team.goalDiff}，积分${team.points}。`,
    tags: [team.group, "积分", `第${team.rank}名`, `${team.points}分`],
    title: `${team.team}积分走势`
  };
}

export async function getStandingGroups(): Promise<StandingGroup[]> {
  noStore();

  const pool = getPgPool();

  if (!pool) {
    return standingGroups;
  }

  try {
    return await getCachedServerData("standings:groups", async () => {
      const { rows } = await pool.query<StandingRow>(`
        select
          group_code,
          group_display_order,
          team_id,
          team_name,
          logo_url,
          slug,
          group_rank,
          played,
          wins,
          draws,
          losses,
          goals_for,
          goals_against,
          goal_diff,
          points
        from public.worldcup_group_standings
        order by group_display_order asc, group_rank asc
      `);

      return rows.length > 0 ? rowsToGroups(rows) : standingGroups;
    });
  } catch (error) {
    console.warn("Failed to load standings from Supabase; using fallback data.", error);
    return standingGroups;
  }
}

export async function getStandingItemBySlug(slug: string): Promise<NewsItem | undefined> {
  noStore();

  const groups = await getStandingGroups();
  const group = groups.find((entry) => entry.teams.some((team) => team.slug === slug));
  const team = group?.teams.find((entry) => entry.slug === slug);

  if (team) {
    return standingsDetailFromTeam(team, group);
  }

  const fallbackTeam = standingItems.find((item) => item.slug === slug);
  if (!fallbackTeam) {
    return undefined;
  }

  const fallbackGroup = standingGroups.find((entry) => entry.group === fallbackTeam.group);
  return standingsDetailFromTeam(fallbackTeam, fallbackGroup);
}
