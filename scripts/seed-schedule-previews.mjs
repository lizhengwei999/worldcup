import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";
import pg from "pg";

const { Client } = pg;
const rootDir = resolve(import.meta.dirname, "..");
const TOURNAMENT_YEAR = 2026;
const LIVE_DURATION_MS = 2 * 60 * 60 * 1000;
const FETCH_HEADERS = {
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "accept-language": "zh-CN,zh;q=0.9",
  referer: "https://www.baidu.com/",
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
};

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
    // The script also supports regular shell environment variables.
  }
}

function getDatabaseUrl() {
  const databaseUrl = [process.env.SUPABASE_DB_URL, process.env.DATABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY]
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

function buildBaiduSearchUrl(keyword) {
  const query = new URLSearchParams({ ie: "utf-8", wd: keyword });
  return `https://www.baidu.com/s?${query.toString()}`;
}

function cleanText(value = "") {
  return String(value)
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueParagraphs(values) {
  const seen = new Set();
  const result = [];

  for (const value of values) {
    const text = cleanText(value);
    if (!text || seen.has(text)) {
      continue;
    }
    seen.add(text);
    result.push(text);
  }

  return result;
}

function isReadableParagraph(text, keyword = "") {
  if (text.length < 24 || text.length > 420) {
    return false;
  }

  if (/百度安全验证|网络不给力|查看更多|展开全文|相关搜索/.test(text)) {
    return false;
  }

  if (keyword && !new RegExp(keyword.split(/\s+/).filter(Boolean).join("|")).test(text)) {
    return false;
  }

  return true;
}

function extractSearchSnippets(html, keyword) {
  const fragments = [];
  const patterns = [
    /class="[^"]*c-abstract[^"]*"[^>]*>([\s\S]*?)<\/(?:span|div|p)>/gi,
    /class="[^"]*content-right_[^"]*"[^>]*>([\s\S]*?)<\/span>/gi,
    /<div[^>]*class="[^"]*c-span-last[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    /<span[^>]*class="[^"]*content-right_[^"]*"[^>]*>([\s\S]*?)<\/span>/gi
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(html))) {
      fragments.push(match[1]);
    }
  }

  const keywordTokens = keyword.split(/\s+/).filter((token) => token.length > 1);
  const relaxedKeyword = keywordTokens.slice(0, 2).join("|");

  return uniqueParagraphs(fragments)
    .filter((paragraph) => isReadableParagraph(paragraph, relaxedKeyword))
    .slice(0, 4);
}

async function fetchBaiduSnippets(keyword) {
  const url = buildBaiduSearchUrl(keyword);

  try {
    const response = await fetch(url, { headers: FETCH_HEADERS, redirect: "follow" });
    if (!response.ok) {
      return { paragraphs: [], url };
    }

    const html = await response.text();
    if (/百度安全验证|网络不给力|verify/.test(html)) {
      return { paragraphs: [], url };
    }

    return { paragraphs: extractSearchSnippets(html, keyword), url };
  } catch {
    return { paragraphs: [], url };
  }
}

function parseKickTime(dayId, kickTime) {
  const [month, day] = dayId.split("-").map(Number);
  const [hour, minute] = kickTime.trim().split(":").map(Number);

  if (!month || !day || Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }

  const iso = `${TOURNAMENT_YEAR}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(
    hour
  ).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+08:00`;

  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

function hasRecordedScore(value) {
  return value != null && value !== "-" && value !== "—" && String(value).trim() !== "";
}

function isMatchUpcoming(match, now = new Date()) {
  if (match.status_text === "已结束") {
    return false;
  }

  if (hasRecordedScore(match.home_score) && hasRecordedScore(match.away_score)) {
    return false;
  }

  const kickAt = parseKickTime(match.day_id, match.kick_time);
  if (!kickAt) {
    return match.status_text === "未开赛";
  }

  return now.getTime() < kickAt.getTime();
}

function isMatchStale(match, now = new Date()) {
  const kickAt = parseKickTime(match.day_id, match.kick_time);
  if (!kickAt) {
    return match.status_text === "已结束";
  }

  if (hasRecordedScore(match.home_score) && hasRecordedScore(match.away_score)) {
    return true;
  }

  if (match.status_text === "已结束") {
    return true;
  }

  const endAt = kickAt.getTime() + LIVE_DURATION_MS;
  return now.getTime() >= kickAt.getTime();
}

function sleep(ms) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

async function buildPreviewContent(match) {
  const matchupKeyword = `${match.home_name} ${match.away_name} 世界杯`;
  const homeKeyword = `${match.home_name} 足球队 世界杯`;
  const awayKeyword = `${match.away_name} 足球队 世界杯`;

  const matchup = await fetchBaiduSnippets(matchupKeyword);
  await sleep(400);
  const home = await fetchBaiduSnippets(homeKeyword);
  await sleep(400);
  const away = await fetchBaiduSnippets(awayKeyword);

  const summary = matchup.paragraphs[0] ?? "";
  const homeIntro = home.paragraphs.slice(0, 3);
  const awayIntro = away.paragraphs.slice(0, 3);

  return {
    awayIntro,
    baiduSearchUrl: matchup.url,
    homeIntro,
    summary
  };
}

async function seed() {
  await loadEnvFile();

  const connectionString = getDatabaseUrl();
  if (!connectionString) {
    throw new Error("Missing Postgres connection string. Set SUPABASE_DB_URL or DATABASE_URL.");
  }

  const previewSchema = await readFile(resolve(rootDir, "supabase", "schedule-previews.sql"), "utf8");
  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 10000,
    ssl: {
      rejectUnauthorized: false
    }
  });

  await client.connect();

  try {
    await client.query(previewSchema);

    const { rows: matches } = await client.query(`
      select
        m.id,
        m.slug,
        m.day_id,
        m.kick_time,
        m.match_stage,
        m.home_name,
        m.home_logo_url,
        m.home_score,
        m.away_name,
        m.away_logo_url,
        m.away_score,
        m.status_text
      from public.worldcup_schedule_matches m
      order by m.day_id asc, m.match_order asc
    `);

    const now = new Date();
    const staleSlugs = matches.filter((match) => isMatchStale(match, now)).map((match) => match.slug);

    if (staleSlugs.length > 0) {
      await client.query("delete from public.worldcup_schedule_match_previews where slug = any($1::text[])", [
        staleSlugs
      ]);
      console.log(`Removed ${staleSlugs.length} stale schedule previews (live or finished).`);
    }

    const upcomingMatches = matches.filter((match) => isMatchUpcoming(match, now));
    let previewCount = 0;

    for (const match of upcomingMatches) {
      const content = await buildPreviewContent(match);
      const kickLabel = `${match.day_id} ${match.kick_time}`;

      await client.query(
        `
          insert into public.worldcup_schedule_match_previews (
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
            baidu_search_url,
            is_active,
            updated_at
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11::jsonb, $12, true, now())
          on conflict (match_id)
          do update set
            slug = excluded.slug,
            match_stage = excluded.match_stage,
            kick_label = excluded.kick_label,
            home_name = excluded.home_name,
            home_logo_url = excluded.home_logo_url,
            away_name = excluded.away_name,
            away_logo_url = excluded.away_logo_url,
            summary = excluded.summary,
            home_intro = excluded.home_intro,
            away_intro = excluded.away_intro,
            baidu_search_url = excluded.baidu_search_url,
            is_active = true,
            updated_at = now()
        `,
        [
          match.id,
          match.slug,
          match.match_stage,
          kickLabel,
          match.home_name,
          match.home_logo_url,
          match.away_name,
          match.away_logo_url,
          content.summary,
          JSON.stringify(content.homeIntro),
          JSON.stringify(content.awayIntro),
          content.baiduSearchUrl
        ]
      );

      previewCount += 1;
      await sleep(500);
    }

    console.log(`Seeded ${previewCount} schedule match previews from Baidu Search.`);
  } finally {
    await client.end();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
