import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";
import { createHash } from "node:crypto";
import pg from "pg";

const { Client } = pg;
const rootDir = resolve(import.meta.dirname, "..");
const defaultScheduleUrl =
  "https://tiyu.baidu.com/al/match?match=%E4%B8%96%E7%95%8C%E6%9D%AF&tab=%E8%B5%9B%E7%A8%8B&from=pc&date_time=2026-06-14";

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

  return url.toString();
}

function getJsonArrayAfterMarker(html, marker) {
  const markerIndex = html.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error(`Cannot find marker: ${marker}`);
  }

  const startIndex = html.indexOf("[", markerIndex + marker.length);
  if (startIndex === -1) {
    throw new Error("Cannot find schedule data array start.");
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = startIndex; index < html.length; index += 1) {
    const char = html[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
      continue;
    }

    if (char === "[") {
      depth += 1;
    } else if (char === "]") {
      depth -= 1;
      if (depth === 0) {
        return html.slice(startIndex, index + 1);
      }
    }
  }

  throw new Error("Cannot find schedule data array end.");
}

function slugifyMatch(dayId, match) {
  const source = `${dayId}-${match.time}-${match.leftLogo?.name ?? ""}-${match.rightLogo?.name ?? ""}`;
  return `schedule-${createHash("sha1").update(source).digest("hex").slice(0, 12)}`;
}

function absoluteSourceUrl(link) {
  if (!link) {
    return defaultScheduleUrl;
  }

  return new URL(link, "https://tiyu.baidu.com").toString();
}

function toLiveText(match) {
  if (match.matchStatusText === "已结束") {
    return match.statusText || "比赛战报";
  }

  if (match.hasFlash || match.pcHasFlash || match.wiseHasFlash) {
    return "动画直播";
  }

  return match.statusText || "动画直播";
}

function getScheduleDateIndex(html) {
  const match = html.match(/"schedule_stat":"((?:\\.|[^"\\])*)"/);
  if (!match) {
    return [];
  }

  try {
    const scheduleStat = JSON.parse(JSON.parse(`"${match[1]}"`));
    return Object.keys(scheduleStat)
      .filter((date) => /^2026-\d{2}-\d{2}$/.test(date))
      .sort();
  } catch {
    return [];
  }
}

function getScheduleUrl(dateTime) {
  const url = new URL(process.env.BAIDU_SCHEDULE_URL ?? defaultScheduleUrl);
  url.searchParams.set("date_time", dateTime);
  return url.toString();
}

async function fetchScheduleHtml(dateTime) {
  const url = getScheduleUrl(dateTime);
  const response = await fetch(url, {
    headers: {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-language": "zh-CN,zh;q=0.9",
      referer: "https://www.baidu.com/",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
    }
  });

  if (!response.ok) {
    throw new Error(`Baidu sports request failed with HTTP ${response.status}`);
  }

  return response.text();
}

function parseScheduleDays(html) {
  if (!html.includes("tabsList") || !html.includes("leftLogo")) {
    throw new Error("Baidu sports page did not include structured schedule data.");
  }

  const rawData = JSON.parse(getJsonArrayAfterMarker(html, '"all":{"data":'));

  return rawData
    .filter((day) => /^2026-/.test(day.time) && Array.isArray(day.list))
    .map((day, dayIndex) => ({
      dateText: day.dateText ?? day.time.slice(5).replace("-", "-"),
      displayOrder: dayIndex + 1,
      id: day.time.slice(5),
      matches: day.list.map((match, matchIndex) => ({
        awayLogoUrl: match.rightLogo?.logo ?? null,
        awayName: match.rightLogo?.name ?? "",
        awayScore: match.rightLogo?.score ?? null,
        homeLogoUrl: match.leftLogo?.logo ?? null,
        homeName: match.leftLogo?.name ?? "",
        homeScore: match.leftLogo?.score ?? null,
        id:
          match.key ??
          createHash("sha1")
            .update(`${day.time}-${matchIndex}-${match.leftLogo?.name}-${match.rightLogo?.name}`)
            .digest("hex"),
        kickTime: match.time,
        liveText: toLiveText(match),
        matchName: match.matchName ?? match.matchStage ?? "世界杯",
        matchOrder: matchIndex + 1,
        matchStage: (match.matchStage ?? match.matchName ?? "世界杯").replace(/^世界杯/, ""),
        slug: slugifyMatch(day.time, match),
        sourceUrl: absoluteSourceUrl(match.link),
        startTime: match.startTime ? `${match.startTime}+08` : null,
        statusCode: match.matchStatus ?? match.status ?? null,
        statusText: match.matchStatusText ?? (match.matchStatus === "2" ? "已结束" : "未开赛")
      })),
      weekday: day.weekday ?? ""
    }))
    .filter((day) => day.matches.length > 0);
}

async function fetchScheduleDays() {
  const initialHtml = await fetchScheduleHtml("2026-06-14");
  const dates = getScheduleDateIndex(initialHtml);
  const dayMap = new Map();

  for (const day of parseScheduleDays(initialHtml)) {
    dayMap.set(day.id, day);
  }

  for (const date of dates) {
    if (dayMap.has(date.slice(5))) {
      continue;
    }

    const html = await fetchScheduleHtml(date);
    for (const day of parseScheduleDays(html)) {
      dayMap.set(day.id, day);
    }
  }

  return [...dayMap.values()]
    .sort((left, right) => left.id.localeCompare(right.id))
    .map((day, index) => ({
      ...day,
      displayOrder: index + 1
    }));
}

async function seed() {
  await loadEnvFile();

  const connectionString = getDatabaseUrl();
  if (!connectionString) {
    throw new Error("Missing Postgres connection string. Set SUPABASE_DB_URL or DATABASE_URL.");
  }

  const scheduleDays = await fetchScheduleDays();
  if (scheduleDays.length === 0) {
    throw new Error("No schedule days extracted from Baidu sports page.");
  }

  const schema = await readFile(resolve(rootDir, "supabase", "schedule.sql"), "utf8");
  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 10000,
    ssl: {
      rejectUnauthorized: false
    }
  });

  await client.connect();

  try {
    await client.query("begin");
    await client.query(schema);
    await client.query("delete from public.worldcup_schedule_matches");
    await client.query("delete from public.worldcup_schedule_days");

    for (const day of scheduleDays) {
      await client.query(
        `
          insert into public.worldcup_schedule_days (id, date_text, weekday, display_order, updated_at)
          values ($1, $2, $3, $4, now())
          on conflict (id)
          do update set
            date_text = excluded.date_text,
            weekday = excluded.weekday,
            display_order = excluded.display_order,
            updated_at = now()
        `,
        [day.id, day.dateText, day.weekday, day.displayOrder]
      );

      for (const match of day.matches) {
        await client.query(
          `
            insert into public.worldcup_schedule_matches (
              id,
              day_id,
              match_order,
              kick_time,
              start_time,
              match_name,
              match_stage,
              home_name,
              home_logo_url,
              home_score,
              away_name,
              away_logo_url,
              away_score,
              status_code,
              status_text,
              live_text,
              source_url,
              slug,
              updated_at
            )
            values ($1, $2, $3, $4, $5::timestamptz, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, now())
            on conflict (id)
            do update set
              day_id = excluded.day_id,
              match_order = excluded.match_order,
              kick_time = excluded.kick_time,
              start_time = excluded.start_time,
              match_name = excluded.match_name,
              match_stage = excluded.match_stage,
              home_name = excluded.home_name,
              home_logo_url = excluded.home_logo_url,
              home_score = excluded.home_score,
              away_name = excluded.away_name,
              away_logo_url = excluded.away_logo_url,
              away_score = excluded.away_score,
              status_code = excluded.status_code,
              status_text = excluded.status_text,
              live_text = excluded.live_text,
              source_url = excluded.source_url,
              slug = excluded.slug,
              updated_at = now()
          `,
          [
            match.id,
            day.id,
            match.matchOrder,
            match.kickTime,
            match.startTime,
            match.matchName,
            match.matchStage,
            match.homeName,
            match.homeLogoUrl,
            match.homeScore,
            match.awayName,
            match.awayLogoUrl,
            match.awayScore,
            match.statusCode,
            match.statusText,
            match.liveText,
            match.sourceUrl,
            match.slug
          ]
        );
      }
    }

    await client.query("commit");
    console.log(
      `Seeded ${scheduleDays.length} schedule days and ${scheduleDays.reduce(
        (count, day) => count + day.matches.length,
        0
      )} matches from Baidu Sports.`
    );
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
