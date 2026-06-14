import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import pg from "pg";
import { getDatabaseUrl, loadEnvFile } from "./db-url.mjs";

const { Client } = pg;
const rootDir = resolve(import.meta.dirname, "..");

function decodeJsonString(value) {
  try {
    return JSON.parse(`"${value}"`);
  } catch {
    return value;
  }
}

function cleanText(value = "") {
  return decodeJsonString(String(value))
    .replace(/\\u[0-9a-fA-F]{4}/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getSaferUrl(value, baseUrl) {
  if (!value) {
    return null;
  }

  return new URL(decodeJsonString(value).replace(/&amp;/g, "&"), baseUrl).toString();
}

function isUsableImageUrl(value) {
  return Boolean(value && /^https?:\/\//.test(value) && !/blank|placeholder|transparent/i.test(value));
}

function getMatchDetailUrl(sourceUrl) {
  const url = new URL(sourceUrl);
  url.searchParams.set("tab", "赛况");
  return url.toString();
}

function extractSData(html) {
  const match = html.match(/<!--s-data:([\s\S]*?)-->/);
  if (!match?.[1]) {
    throw new Error("Cannot find Baidu match detail s-data.");
  }

  return JSON.parse(match[1]);
}

function extractReport(html, baseUrl) {
  const match = html.match(
    /<a class="report-card[^"]*" href="([^"]+)"[\s\S]*?<img[^>]+src="([^"]+)"[\s\S]*?<p[^>]*report-title-text[^>]*>([\s\S]*?)<\/p>[\s\S]*?<div[^>]*report-provider[^>]*>([\s\S]*?)<\/div>/
  );

  if (!match) {
    return {};
  }

  return {
    reportImageUrl: getSaferUrl(match[2], baseUrl),
    reportProvider: cleanText(match[4]),
    reportTitle: cleanText(match[3]),
    reportUrl: getSaferUrl(match[1], baseUrl)
  };
}

function extractFocusItems(html, baseUrl) {
  const focusItems = [];
  const focusPattern =
    /<a target="_blank" href="([^"]+)" class="focus-item[\s\S]*?<img[^>]+src="([^"]+)"[\s\S]*?(?:<div class="focus-duration[^"]*">([\s\S]*?)<\/div>)?[\s\S]*?<p[^>]*focus-title-text[^>]*>([\s\S]*?)<\/p>[\s\S]*?<div[^>]*focus-provider[^>]*>([\s\S]*?)<\/div>/g;
  let match;

  while ((match = focusPattern.exec(html)) && focusItems.length < 8) {
    focusItems.push({
      duration: cleanText(match[3] ?? ""),
      imageUrl: getSaferUrl(match[2], baseUrl),
      provider: cleanText(match[5]),
      title: cleanText(match[4]),
      url: getSaferUrl(match[1], baseUrl)
    });
  }

  return focusItems;
}

async function fetchRemoteImage(url) {
  if (!url) {
    return null;
  }

  try {
    const response = await fetch(url, {
      headers: {
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "zh-CN,zh;q=0.9",
        referer: "https://tiyu.baidu.com/",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
      },
      redirect: "follow"
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    const patterns = [
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
      /<img[^>]+src=["'](https?:\/\/[^"']+)["']/i
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) {
        return getSaferUrl(match[1], response.url);
      }
    }
  } catch {
    return null;
  }

  return null;
}

async function enrichDetailImages(detail) {
  const reportImageUrl = isUsableImageUrl(detail.reportImageUrl)
    ? detail.reportImageUrl
    : await fetchRemoteImage(detail.reportUrl);
  const focusItems = [];

  for (const item of detail.focusItems) {
    const imageUrl = isUsableImageUrl(item.imageUrl) ? item.imageUrl : await fetchRemoteImage(item.url);
    focusItems.push({
      ...item,
      imageUrl
    });
  }

  return {
    ...detail,
    focusItems,
    reportImageUrl
  };
}

function toIncident(item) {
  return {
    iconType: item.icon_type ?? "",
    position: item.position ?? "0",
    teamName: item.teamName ?? "",
    time: item.time ?? "",
    word: item.word ?? ""
  };
}

function parseDetail(html, matchRow, sourceUrl) {
  const data = extractSData(html).data;
  const header = data.header;
  const situationTab = data.tabsList?.find((tab) => tab.title === "赛况");
  const analysisTab = data.tabsList?.find((tab) => tab.title === "分析");
  const eventData = situationTab?.data ?? analysisTab?.data ?? {};
  const incidents =
    eventData.graphic_incidents?.graphic?.map(toIncident) ??
    eventData.importantIncidents?.map(toIncident) ??
    [];
  const venue = eventData.venue;
  const report = extractReport(html, sourceUrl);
  const focusItems = extractFocusItems(html, sourceUrl);

  return {
    attendance: venue?.capacity ?? null,
    awayLogoUrl: header.rightLogo?.logo ?? matchRow.away_logo_url,
    awayName: header.rightLogo?.name ?? matchRow.away_name,
    awayRankText: header.rightLogo?.rankInfo1?.text ?? null,
    awayScore: header.rightGoal ?? matchRow.away_score,
    focusItems,
    homeLogoUrl: header.leftLogo?.logo ?? matchRow.home_logo_url,
    homeName: header.leftLogo?.name ?? matchRow.home_name,
    homeRankText: header.leftLogo?.rankInfo1?.text ?? null,
    homeScore: header.leftGoal ?? matchRow.home_score,
    incidents,
    kickLabel: `${header.dateFormat ?? matchRow.day_id} ${header.time ?? matchRow.kick_time}`.trim(),
    matchStage: header.matchStage ?? matchRow.match_stage,
    matchTitle: `${header.leftLogo?.name ?? matchRow.home_name} vs ${header.rightLogo?.name ?? matchRow.away_name}`,
    reportImageUrl: report.reportImageUrl ?? null,
    reportProvider: report.reportProvider ?? null,
    reportTitle: report.reportTitle ?? null,
    reportUrl: report.reportUrl ?? null,
    statusText: header.matchStatusText ?? matchRow.status_text,
    venue: venue?.name ?? null,
    winner: header.winner ?? null
  };
}

async function fetchDetail(matchRow) {
  const sourceUrl = getMatchDetailUrl(matchRow.source_url);
  const response = await fetch(sourceUrl, {
    headers: {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-language": "zh-CN,zh;q=0.9",
      referer: "https://tiyu.baidu.com/",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
    }
  });

  if (!response.ok) {
    throw new Error(`Baidu match detail request failed with HTTP ${response.status}`);
  }

  const html = await response.text();
  if (/百度安全验证|网络不给力/.test(html)) {
    throw new Error("Baidu returned a security verification page instead of match detail data.");
  }

  return {
    ...(await enrichDetailImages(parseDetail(html, matchRow, sourceUrl))),
    sourceUrl
  };
}

async function seed() {
  await loadEnvFile();

  const connectionString = getDatabaseUrl();
  if (!connectionString) {
    throw new Error("Missing Postgres connection string. Set SUPABASE_DB_URL or DATABASE_URL.");
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
    await client.query(schema);
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
        m.status_text,
        m.source_url
      from public.worldcup_schedule_matches m
      where m.source_url is not null
        and m.status_text = '已结束'
      order by m.day_id asc, m.match_order asc
    `);

    let detailCount = 0;

    for (const match of matches) {
      const detail = await fetchDetail(match);

      await client.query(
        `
          insert into public.worldcup_schedule_match_details (
            match_id,
            slug,
            title,
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
            source_url,
            updated_at
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20::jsonb, $21::jsonb, $22, $23, $24, now())
          on conflict (match_id)
          do update set
            slug = excluded.slug,
            title = excluded.title,
            match_stage = excluded.match_stage,
            kick_label = excluded.kick_label,
            home_name = excluded.home_name,
            home_logo_url = excluded.home_logo_url,
            home_rank_text = excluded.home_rank_text,
            home_score = excluded.home_score,
            away_name = excluded.away_name,
            away_logo_url = excluded.away_logo_url,
            away_rank_text = excluded.away_rank_text,
            away_score = excluded.away_score,
            status_text = excluded.status_text,
            winner = excluded.winner,
            report_title = excluded.report_title,
            report_provider = excluded.report_provider,
            report_url = excluded.report_url,
            report_image_url = excluded.report_image_url,
            focus_items = excluded.focus_items,
            incidents = excluded.incidents,
            venue = excluded.venue,
            attendance = excluded.attendance,
            source_url = excluded.source_url,
            updated_at = now()
        `,
        [
          match.id,
          match.slug,
          detail.matchTitle,
          detail.matchStage,
          detail.kickLabel,
          detail.homeName,
          detail.homeLogoUrl,
          detail.homeRankText,
          detail.homeScore,
          detail.awayName,
          detail.awayLogoUrl,
          detail.awayRankText,
          detail.awayScore,
          detail.statusText,
          detail.winner,
          detail.reportTitle,
          detail.reportProvider,
          detail.reportUrl,
          detail.reportImageUrl,
          JSON.stringify(detail.focusItems),
          JSON.stringify(detail.incidents),
          detail.venue,
          detail.attendance,
          detail.sourceUrl
        ]
      );

      detailCount += 1;
    }

    console.log(`Seeded ${detailCount} match detail pages from Baidu Sports.`);
  } finally {
    await client.end();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
