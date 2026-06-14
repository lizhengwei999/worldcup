/**
 * 咪咕球员排名入库脚本。
 * 来源与 statType 映射见 docs/migu-player-rankings-sync.md
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";
import pg from "pg";

const { Client } = pg;
const rootDir = resolve(import.meta.dirname, "..");

const seasonId = process.env.MIGU_PLAYER_RANK_SEASON_ID ?? "110000005666";
const apiBase =
  process.env.MIGU_PLAYER_RANK_API_BASE ??
  "https://webapi.miguvideo.com/gateway/oes-sport-static/300/football/figures/ranking";

const categories = [
  { statType: 29, key: "goals", label: "射手榜", columnLabel: "进球", showPercent: false, categoryOrder: 1 },
  { statType: 30, key: "assists", label: "助攻榜", columnLabel: "助攻", showPercent: false, categoryOrder: 2 },
  { statType: 33, key: "shots", label: "射门", columnLabel: "射门", showPercent: false, categoryOrder: 3 },
  { statType: 34, key: "shots_on_target", label: "射正", columnLabel: "射正", showPercent: false, categoryOrder: 4 },
  { statType: 35, key: "passes", label: "传球", columnLabel: "传球", showPercent: false, categoryOrder: 5 },
  { statType: 36, key: "key_passes", label: "关键传球", columnLabel: "关键传球", showPercent: false, categoryOrder: 6 },
  {
    statType: 37,
    key: "pass_accuracy",
    label: "传球成功率",
    columnLabel: "传球成功率",
    showPercent: true,
    categoryOrder: 7
  },
  { statType: 38, key: "tackles", label: "抢断", columnLabel: "抢断", showPercent: false, categoryOrder: 8 },
  { statType: 39, key: "interceptions", label: "拦截", columnLabel: "拦截", showPercent: false, categoryOrder: 9 },
  { statType: 41, key: "clearances", label: "解围", columnLabel: "解围", showPercent: false, categoryOrder: 10 },
  { statType: 42, key: "saves", label: "扑救", columnLabel: "扑救", showPercent: false, categoryOrder: 11 },
  { statType: 0, key: "offsides", label: "越位", columnLabel: "越位", showPercent: false, categoryOrder: 12 },
  { statType: 31, key: "yellow_cards", label: "黄牌", columnLabel: "黄牌", showPercent: false, categoryOrder: 13 },
  { statType: 32, key: "red_cards", label: "红牌", columnLabel: "红牌", showPercent: false, categoryOrder: 14 },
  { statType: 43, key: "fouls", label: "犯规", columnLabel: "犯规", showPercent: false, categoryOrder: 15 },
  { statType: 44, key: "fouls_suffered", label: "被犯规", columnLabel: "被犯规", showPercent: false, categoryOrder: 16 },
  { statType: 27, key: "appearances", label: "出场", columnLabel: "出场", showPercent: false, categoryOrder: 17 },
  { statType: 28, key: "starts", label: "首发", columnLabel: "首发", showPercent: false, categoryOrder: 18 },
  { statType: 45, key: "minutes", label: "出场时间", columnLabel: "出场时间", showPercent: false, categoryOrder: 19 },
  { statType: 40, key: "dribbles", label: "过人成功", columnLabel: "过人成功", showPercent: false, categoryOrder: 20 }
];

function cleanEnvValue(value) {
  return value?.trim().replace(/^["']|["']$/g, "");
}

async function loadEnvFile() {
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

function getDatabaseUrl() {
  const databaseUrl = [
    process.env.SUPABASE_DB_URL,
    process.env.DATABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ]
    .map(cleanEnvValue)
    .find((value) => value?.startsWith("postgres"));

  if (!databaseUrl) {
    return databaseUrl;
  }

  const url = new URL(databaseUrl);
  url.searchParams.delete("sslmode");
  url.searchParams.delete("sslrootcert");

  if (url.hostname.includes("pooler.supabase.com") && url.username.includes(".")) {
    const projectRef = url.username.split(".")[1];
    if (projectRef) {
      url.hostname = `db.${projectRef}.supabase.co`;
      url.username = "postgres";
      url.port = "5432";
    }
  }

  return url.toString();
}

async function fetchRanking(statType) {
  const url = `${apiBase}/${seasonId}/${statType}`;
  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      referer: "https://www.miguvideo.com/",
      "user-agent": "Mozilla/5.0"
    }
  });

  const text = await response.text();
  if (!text.startsWith("{")) {
    return [];
  }

  const payload = JSON.parse(text);
  if (payload.code !== 200 && payload.code !== "200") {
    return [];
  }

  return payload.data?.football ?? [];
}

function toInt(value, fallback = 0) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function applySchema(client) {
  const schemaPath = resolve(rootDir, "supabase/player-rankings.sql");
  const schemaSql = await readFile(schemaPath, "utf8");
  await client.query(schemaSql);
}

async function main() {
  await loadEnvFile();

  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) {
    throw new Error("Missing SUPABASE_DB_URL or DATABASE_URL for seeding player rankings.");
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  await applySchema(client);

  let totalRows = 0;

  for (const category of categories) {
    if (!category.statType) {
      console.log(`skip ${category.label}: no Migu stat type`);
      continue;
    }

    const players = await fetchRanking(category.statType);
    await client.query("delete from public.worldcup_player_rankings where stat_type = $1", [
      category.statType
    ]);

    if (!players.length) {
      console.log(`empty ${category.label} (${category.statType})`);
      continue;
    }

    for (const player of players) {
      const figureId = String(player.figureIdFK ?? player.figureId ?? "");
      if (!figureId) {
        continue;
      }

      await client.query(
        `
          insert into public.worldcup_player_rankings (
            stat_type,
            rank,
            figure_id,
            player_name,
            player_image_url,
            team_name,
            team_logo_url,
            matches_played,
            stat_value,
            stat_key,
            stat_label,
            column_label,
            show_percent,
            category_order,
            updated_at
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, now())
          on conflict (stat_type, figure_id) do update set
            rank = excluded.rank,
            player_name = excluded.player_name,
            player_image_url = excluded.player_image_url,
            team_name = excluded.team_name,
            team_logo_url = excluded.team_logo_url,
            matches_played = excluded.matches_played,
            stat_value = excluded.stat_value,
            stat_key = excluded.stat_key,
            stat_label = excluded.stat_label,
            column_label = excluded.column_label,
            show_percent = excluded.show_percent,
            category_order = excluded.category_order,
            updated_at = now()
        `,
        [
          category.statType,
          toInt(player.rank, 0),
          figureId,
          player.figureName ?? player.figureNickName ?? "未知球员",
          player.imgUrl ?? null,
          player.teamName ?? player.teamShortName ?? "未知球队",
          player.teamImgUrl ?? player.teamCountryLogo ?? null,
          toInt(player.appearances, 0),
          String(player.score ?? ""),
          category.key,
          category.label,
          category.columnLabel,
          category.showPercent,
          category.categoryOrder
        ]
      );
      totalRows += 1;
    }

    console.log(`seeded ${category.label}: ${players.length} players`);
  }

  await client.end();
  console.log(`Done. Upserted ${totalRows} player ranking rows for season ${seasonId}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
