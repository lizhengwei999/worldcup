import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";
import pg from "pg";

const { Client } = pg;
const rootDir = resolve(import.meta.dirname, "..");

function cleanEnvValue(value) {
  return value?.trim().replace(/^["']|["']$/g, "");
}

async function loadEnvFile() {
  const envPath = resolve(rootDir, ".env");

  try {
    const envContent = await readFile(envPath, "utf8");

    envContent.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        return;
      }

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) {
        return;
      }

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

function getSlug(groupCode, teamId) {
  return `${groupCode.toLowerCase().replace("组", "")}-${teamId.slice(0, 8)}`;
}

function getJsonArrayAfterMarker(html, marker) {
  const markerIndex = html.indexOf(marker);
  if (markerIndex === -1) {
    throw new Error(`Cannot find marker: ${marker}`);
  }

  const startIndex = html.indexOf("[", markerIndex + marker.length);
  if (startIndex === -1) {
    throw new Error("Cannot find standings data array start.");
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = startIndex; index < html.length; index += 1) {
    const charCode = html.charCodeAt(index);

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (charCode === 92) {
        escaped = true;
      } else if (charCode === 34) {
        inString = false;
      }
      continue;
    }

    if (charCode === 34) {
      inString = true;
      continue;
    }

    if (charCode === 91) {
      depth += 1;
    } else if (charCode === 93) {
      depth -= 1;
      if (depth === 0) {
        return html.slice(startIndex, index + 1);
      }
    }
  }

  throw new Error("Cannot find standings data array end.");
}

function parseTriple(value) {
  const [first = "0", second = "0", third = "0"] = String(value).split("/");
  return [Number(first), Number(second), Number(third)];
}

function parseBaiduStandingGroups(html) {
  const tabList = JSON.parse(getJsonArrayAfterMarker(html, "\"tabList\":"));
  const groupRankTab = tabList.find((tab) => Array.isArray(tab.data) && tab.data.some((group) => /^A组$/.test(group.title)));

  if (!groupRankTab) {
    throw new Error("Cannot find Baidu group standings tab data.");
  }

  return groupRankTab.data.map((group) => ({
    group: group.title,
    teams: group.list.map((teamRow) => {
      const [teamInfo, played, record, goalsRecord, points] = teamRow.record;
      const [win, draw, loss] = parseTriple(record);
      const [goals, against] = parseTriple(goalsRecord);

      return {
        against,
        draw,
        goals,
        id: teamRow.teamId,
        logo: teamInfo.logo,
        loss,
        played: Number(played),
        points: Number(points),
        rank: Number(teamInfo.rank),
        slug: getSlug(group.title, teamRow.teamId),
        team: teamInfo.name,
        win
      };
    })
  }));
}

async function loadStandingGroups() {
  const standingsUrl =
    process.env.BAIDU_STANDINGS_URL ??
    "https://tiyu.baidu.com/al/match?match=%E4%B8%96%E7%95%8C%E6%9D%AF&tab=%E6%8E%92%E5%90%8D&rankChildTab=teamRank";
  const response = await fetch(standingsUrl, {
    headers: {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-language": "zh-CN,zh;q=0.9",
      referer: "https://www.baidu.com/",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
    }
  });

  if (!response.ok) {
    throw new Error(`Baidu standings request failed with HTTP ${response.status}`);
  }

  const html = await response.text();
  if (/百度安全验证|网络不给力/.test(html)) {
    throw new Error("Baidu returned a security verification page instead of standings data.");
  }

  const groups = parseBaiduStandingGroups(html);

  if (groups.length < 12 || groups.some((group) => group.teams.length < 4)) {
    throw new Error(`Only extracted ${groups.length} complete Baidu standings groups; aborting database update.`);
  }

  return groups;
}

async function seed() {
  await loadEnvFile();

  const connectionString = getDatabaseUrl();
  if (!connectionString) {
    throw new Error("Missing Postgres connection string. Set SUPABASE_DB_URL or DATABASE_URL.");
  }

  const schema = await readFile(resolve(rootDir, "supabase", "standings.sql"), "utf8");
  const groups = await loadStandingGroups();
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
    await client.query("delete from public.worldcup_standings");

    for (const [groupIndex, group] of groups.entries()) {
      const groupResult = await client.query(
        `
          insert into public.worldcup_groups (group_code, name, display_order, updated_at)
          values ($1, $2, $3, now())
          on conflict (group_code)
          do update set
            name = excluded.name,
            display_order = excluded.display_order,
            updated_at = now()
          returning id
        `,
        [group.group, group.group, groupIndex + 1]
      );
      const groupId = groupResult.rows[0].id;

      for (const team of group.teams) {
        await client.query(
          `
            insert into public.worldcup_teams (id, name, logo_url, slug, updated_at)
            values ($1, $2, $3, $4, now())
            on conflict (id)
            do update set
              name = excluded.name,
              logo_url = excluded.logo_url,
              slug = excluded.slug,
              updated_at = now()
          `,
          [team.id, team.team, team.logo, team.slug]
        );

        await client.query(
          `
            insert into public.worldcup_standings (
              group_id,
              team_id,
              group_rank,
              played,
              wins,
              draws,
              losses,
              goals_for,
              goals_against,
              points,
              updated_at
            )
            values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now())
            on conflict (group_id, team_id)
            do update set
              group_rank = excluded.group_rank,
              played = excluded.played,
              wins = excluded.wins,
              draws = excluded.draws,
              losses = excluded.losses,
              goals_for = excluded.goals_for,
              goals_against = excluded.goals_against,
              points = excluded.points,
              updated_at = now()
          `,
          [
            groupId,
            team.id,
            team.rank,
            team.played,
            team.win,
            team.draw,
            team.loss,
            team.goals,
            team.against,
            team.points
          ]
        );
      }
    }

    await client.query("commit");
    console.log(`Seeded ${groups.length} groups and ${groups.reduce((count, group) => count + group.teams.length, 0)} teams.`);
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
