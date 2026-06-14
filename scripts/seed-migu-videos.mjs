import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";
import { createHash } from "node:crypto";
import pg from "pg";

const { Client } = pg;
const rootDir = resolve(import.meta.dirname, "..");
const miguVideoUrl =
  process.env.MIGU_VIDEO_URL ?? "https://www.miguvideo.com/p/home/7a04ba680afd4b49a31913c5b36e4557";

const categories = [
  {
    id: "focus",
    label: "聚焦世界杯",
    markers: ["最新资讯"],
    groupNames: ["世界杯最新资讯"]
  },
  {
    id: "teams",
    label: "48队巡礼",
    markers: ["逐鹿美加墨", "世界杯48队巡礼"],
    groupNames: ["逐鹿美加墨"]
  },
  {
    id: "stars",
    label: "星耀美加墨",
    markers: ["星耀美加墨", "世界杯20大球星"],
    groupNames: ["星耀美加墨"]
  }
];

const blockedTitlePattern =
  /咪咕视频|高版本浏览器|客户端|下载|登录|该节目可卡bug|熊猫频道|更多>>|^直播$/;

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
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function absoluteUrl(value, baseUrl = miguVideoUrl) {
  if (!value) {
    return "";
  }

  const decoded = decodeJsonString(String(value)).replace(/\\\//g, "/").replace(/&amp;/g, "&");
  if (decoded.startsWith("//")) {
    return `https:${decoded}`;
  }
  if (decoded.startsWith("http")) {
    return decoded;
  }
  return new URL(decoded, baseUrl).toString();
}

function slugify(categoryId, title, index) {
  const hash = createHash("sha1").update(`${categoryId}:${title}`).digest("hex").slice(0, 12);
  return `migu-${categoryId}-${String(index + 1).padStart(2, "0")}-${hash}`;
}

function isValidVideo(item) {
  return (
    item.title &&
    item.title.length >= 4 &&
    item.title.length <= 80 &&
    /^https?:\/\//.test(item.imageUrl) &&
    !blockedTitlePattern.test(item.title)
  );
}

function parseInitialGroupsState(html) {
  const marker = "window.__INITIAL_GROUPS_STATE__ = ";
  const start = html.indexOf(marker);
  if (start < 0) {
    return null;
  }

  let index = start + marker.length;
  if (html[index] !== "[") {
    return null;
  }

  let depth = 0;
  let end = index;
  for (; end < html.length; end += 1) {
    const char = html[end];
    if (char === "[") {
      depth += 1;
    }
    if (char === "]") {
      depth -= 1;
      if (depth === 0) {
        break;
      }
    }
  }

  try {
    return JSON.parse(html.slice(index, end + 1));
  } catch {
    return null;
  }
}

function countGroupDataItems(groupBody) {
  return (groupBody?.components ?? []).reduce((total, component) => total + (component.data?.length ?? 0), 0);
}

function matchesCategoryGroup(groupBody, category) {
  const name = groupBody?.name ?? "";
  if (category.groupNames?.some((groupName) => name === groupName || name.includes(groupName))) {
    return true;
  }

  return category.markers.some((marker) => name.includes(marker));
}

function pickMiguImage(item) {
  const pics = item.h5pics ?? item.pics ?? {};
  return absoluteUrl(
    pics.lowResolutionH ||
      pics.highResolutionH ||
      pics.lowResolutionV ||
      pics.highResolutionV ||
      pics.lowResolutionV34 ||
      pics.highResolutionV34 ||
      item.picUrl ||
      ""
  );
}

function videoUrlFromPid(item) {
  const pid =
    item.pID ||
    item.contentID ||
    item.action?.params?.contentID ||
    item.actions?.defaultAction?.params?.contentID;

  if (pid) {
    return `https://www.miguvideo.com/p/detail/${pid}`;
  }

  return findUrlField(item);
}

function parseMiguPublishTime(raw) {
  const value = raw.publishTime || raw.updateTime || raw.createTime;
  if (!value || typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().replace(/-/g, "/");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function mapMiguDataItem(raw, categoryId) {
  return {
    categoryId,
    duration: raw.duration || findDurationField(raw),
    imageUrl: pickMiguImage(raw),
    publishedAt: parseMiguPublishTime(raw),
    title: cleanText(raw.name || raw.title || ""),
    url: videoUrlFromPid(raw)
  };
}

function extractVideosFromGroupState(groupsState, category) {
  const candidates = groupsState
    .map((entry) => entry?.body)
    .filter((groupBody) => groupBody && matchesCategoryGroup(groupBody, category))
    .sort((left, right) => countGroupDataItems(right) - countGroupDataItems(left));

  const groupBody = candidates[0];
  if (!groupBody) {
    return [];
  }

  const seenTitles = new Set();
  const videos = [];
  const components = [...(groupBody.components ?? [])]
    .filter((component) => {
      if (component.compType === "LABEL" || component.compStyle?.startsWith("LABEL")) {
        return false;
      }

      if (component.name === "标题" || component.name?.includes("副本-标题")) {
        return false;
      }

      return (component.data?.length ?? 0) > 0;
    })
    .sort((left, right) => Number(left.sortValue ?? 0) - Number(right.sortValue ?? 0));

  for (const component of components) {
    for (const raw of component.data ?? []) {
      if (raw.programTypeV2 === "LIVE" || raw.videoType === "LIVE") {
        continue;
      }

      const item = mapMiguDataItem(raw, category.id);
      if (!isValidVideo(item) || seenTitles.has(item.title)) {
        continue;
      }

      seenTitles.add(item.title);
      videos.push(item);
    }
  }

  return videos;
}

async function withRetries(task, { attempts = 4, delayMs = 1500, label = "task" } = {}) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      const retryable =
        error?.code === "ECONNRESET" ||
        error?.code === "ETIMEDOUT" ||
        error?.code === "ENOTFOUND" ||
        error?.code === "ECONNREFUSED";

      if (!retryable || attempt === attempts) {
        throw error;
      }

      console.warn(`${label} failed (${error.code ?? error.message}); retrying ${attempt}/${attempts - 1}...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }

  throw lastError;
}

async function connectDatabase(connectionString) {
  return withRetries(async () => {
    const client = new Client({
      connectionString,
      connectionTimeoutMillis: 10000,
      ssl: {
        rejectUnauthorized: false
      }
    });

    await client.connect();
    return client;
  }, { label: "Database connect" });
}

async function fetchMiguHtml() {
  if (process.env.MIGU_VIDEO_HTML_PATH) {
    return readFile(resolve(rootDir, process.env.MIGU_VIDEO_HTML_PATH), "utf8");
  }

  return withRetries(async () => {
    const response = await fetch(miguVideoUrl, {
      headers: {
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "zh-CN,zh;q=0.9",
        "cache-control": "no-cache",
        pragma: "no-cache",
        referer: "https://www.miguvideo.com/",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
      }
    });

    if (!response.ok) {
      throw new Error(`Migu request failed with HTTP ${response.status}`);
    }

    return response.text();
  }, { label: "Migu page fetch" });
}

function getSectionBlock(html, category) {
  const starts = category.markers.map((marker) => html.indexOf(marker)).filter((index) => index >= 0);
  if (starts.length === 0) {
    return "";
  }

  const start = Math.min(...starts);
  const laterSectionStarts = categories
    .flatMap((item) => item.markers)
    .map((marker) => html.indexOf(marker, start + 1))
    .filter((index) => index > start);
  const end = laterSectionStarts.length > 0 ? Math.min(...laterSectionStarts) : html.length;

  return html.slice(start, end);
}

function getAttr(block, names) {
  for (const name of names) {
    const match = block.match(new RegExp(`${name}=["']([^"']+)["']`, "i"));
    if (match?.[1]) {
      return match[1];
    }
  }

  return "";
}

function extractCardsFromHtml(block, categoryId) {
  const cards = [];
  const seenTitles = new Set();
  const anchorPattern = /<a\b[\s\S]*?<\/a>/gi;
  let match;

  while ((match = anchorPattern.exec(block)) && cards.length < 80) {
    const anchor = match[0];
    const href = getAttr(anchor, ["href", "data-href"]);
    const imageUrl = absoluteUrl(getAttr(anchor, ["data-src", "src", "poster", "data-original"]));
    const duration = anchor.match(/\b\d{1,2}:\d{2}(?::\d{2})?\b/)?.[0] ?? "";
    const attrTitle = getAttr(anchor, ["title", "alt", "data-title"]);
    const textTitle = cleanText(anchor).replace(duration, "").trim();
    const title = cleanText(attrTitle || textTitle);

    if (seenTitles.has(title)) {
      continue;
    }

    const item = {
      duration,
      imageUrl,
      title,
      url: absoluteUrl(href || miguVideoUrl)
    };

    if (isValidVideo(item)) {
      seenTitles.add(title);
      cards.push({
        ...item,
        categoryId
      });
    }
  }

  return cards;
}

function findImageField(value) {
  const keys = ["image", "img", "pic", "poster", "cover", "coverUrl", "picUrl", "vPic", "vPicUrl", "verticalPic"];
  for (const key of keys) {
    if (typeof value?.[key] === "string" && /^https?:|\/\//.test(value[key])) {
      return absoluteUrl(value[key]);
    }
  }
  return "";
}

function findTitleField(value) {
  const keys = ["title", "name", "programName", "contentName", "videoName", "pName"];
  for (const key of keys) {
    if (typeof value?.[key] === "string") {
      return cleanText(value[key]);
    }
  }
  return "";
}

function findDurationField(value) {
  const keys = ["duration", "durationText", "time", "playLength", "length"];
  for (const key of keys) {
    if (typeof value?.[key] === "string" && /\d/.test(value[key])) {
      return value[key].match(/\d{1,2}:\d{2}(?::\d{2})?/)?.[0] ?? value[key];
    }
  }
  return "";
}

function findUrlField(value) {
  const keys = ["url", "href", "playUrl", "link", "shareUrl"];
  for (const key of keys) {
    if (typeof value?.[key] === "string") {
      return absoluteUrl(value[key]);
    }
  }
  if (typeof value?.contentId === "string") {
    return absoluteUrl(`/p/detail/${value.contentId}`);
  }
  if (typeof value?.cid === "string") {
    return absoluteUrl(`/p/detail/${value.cid}`);
  }
  return miguVideoUrl;
}

function collectJsonVideos(value, categoryId, push) {
  if (!value || typeof value !== "object") {
    return;
  }

  const title = findTitleField(value);
  const imageUrl = findImageField(value);
  if (title && imageUrl) {
    push({
      categoryId,
      duration: findDurationField(value),
      imageUrl,
      title,
      url: findUrlField(value)
    });
  }

  Object.values(value).forEach((child) => {
    if (Array.isArray(child)) {
      child.forEach((item) => collectJsonVideos(item, categoryId, push));
    } else if (child && typeof child === "object") {
      collectJsonVideos(child, categoryId, push);
    }
  });
}

function extractJsonVideos(block, categoryId) {
  const videos = [];
  const seen = new Set();
  const scriptPattern = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let match;

  function push(item) {
    if (!isValidVideo(item) || seen.has(item.title)) {
      return;
    }
    seen.add(item.title);
    videos.push(item);
  }

  while ((match = scriptPattern.exec(block))) {
    const script = match[1].trim();
    const candidates = [
      script.match(/=\s*(\{[\s\S]*\})\s*;?\s*$/)?.[1],
      script.match(/=\s*(\[[\s\S]*\])\s*;?\s*$/)?.[1],
      script
    ].filter(Boolean);

    for (const candidate of candidates) {
      try {
        collectJsonVideos(JSON.parse(candidate), categoryId, push);
      } catch {
        // Most scripts are executable JS rather than standalone JSON.
      }
    }
  }

  return videos;
}

function extractMiguVideos(html) {
  const groupsState = parseInitialGroupsState(html);

  return categories.map((category) => {
    const stateItems = groupsState ? extractVideosFromGroupState(groupsState, category) : [];
    if (stateItems.length > 0) {
      return {
        ...category,
        items: stateItems
      };
    }

    const block = getSectionBlock(html, category);
    const items = [...extractCardsFromHtml(block, category.id), ...extractJsonVideos(block, category.id)];
    const seenTitles = new Set();
    const uniqueItems = [];

    for (const item of items) {
      if (seenTitles.has(item.title)) {
        continue;
      }

      seenTitles.add(item.title);
      uniqueItems.push(item);
    }

    return {
      ...category,
      items: uniqueItems
    };
  });
}

function toDbRows(sections) {
  return sections.flatMap((section) => {
    const datedItems = section.items.filter((item) => item.publishedAt);
    const latestPublishedAt = datedItems.reduce((latest, item) => {
      const time = new Date(item.publishedAt).getTime();
      return time > latest ? time : latest;
    }, 0);

    return section.items.map((item, index) => {
      const publishedAt = item.publishedAt
        ? item.publishedAt
        : new Date(latestPublishedAt > 0 ? latestPublishedAt + (section.items.length - index) * 1000 : Date.now() - index * 60 * 1000).toISOString();

      return {
        body: [`视频来源于咪咕视频「${section.markers[0]}」栏目。点击播放按钮可前往咪咕查看完整视频。`],
        content_type: "video",
        display_order: index + 1,
        duration: item.duration,
        eyebrow: section.label,
        external_url: item.url,
        id: `migu-${section.id}-${createHash("sha1").update(item.title).digest("hex").slice(0, 12)}`,
        image_url: item.imageUrl,
        published_at: publishedAt,
        section: "videos",
        slug: slugify(section.id, item.title, index),
        source: "咪咕视频",
        summary: `${section.label}：${item.title}`,
        tags: ["世界杯", "咪咕视频", section.label],
        title: item.title,
        video_category: section.id,
        video_url: item.url
      };
    });
  });
}

async function seed() {
  await loadEnvFile();

  if (process.env.MIGU_VIDEO_DRY_RUN === "1") {
    const html = await fetchMiguHtml();
    const sections = extractMiguVideos(html);
    console.log(
      sections.map((section) => `${section.label}: ${section.items.length}`).join(", ")
    );
    if (process.env.MIGU_VIDEO_EXPORT_PATH) {
      await writeFile(
        resolve(rootDir, process.env.MIGU_VIDEO_EXPORT_PATH),
        JSON.stringify(sections, null, 2),
        "utf8"
      );
      console.log(`Exported to ${process.env.MIGU_VIDEO_EXPORT_PATH}`);
    }
    return;
  }

  const connectionString = getDatabaseUrl();
  if (!connectionString) {
    throw new Error("Missing Postgres connection string. Set SUPABASE_DB_URL or DATABASE_URL.");
  }

  const html = await fetchMiguHtml();
  const sections = extractMiguVideos(html);
  const missingSections = sections.filter((section) => section.items.length === 0).map((section) => section.label);

  if (missingSections.length > 0) {
    throw new Error(
      `Migu video extraction did not find videos for: ${missingSections.join("、")}. ` +
        "If the website blocks server access, save the page HTML and set MIGU_VIDEO_HTML_PATH."
    );
  }

  const rows = toDbRows(sections);
  const schema = await readFile(resolve(rootDir, "supabase", "content.sql"), "utf8");
  const client = await connectDatabase(connectionString);

  try {
    await client.query("begin");
    await client.query(schema);

    let upserted = 0;
    for (const item of rows) {
      await client.query(
        `
          insert into public.worldcup_items (
            id,
            section,
            title,
            eyebrow,
            summary,
            slug,
            image_url,
            source,
            published_at,
            content_type,
            video_url,
            external_url,
            video_category,
            duration,
            display_order,
            tags,
            body,
            updated_at
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, now())
          on conflict (id)
          do update set
            section = excluded.section,
            title = excluded.title,
            eyebrow = excluded.eyebrow,
            summary = excluded.summary,
            slug = excluded.slug,
            image_url = excluded.image_url,
            source = excluded.source,
            published_at = excluded.published_at,
            content_type = excluded.content_type,
            video_url = excluded.video_url,
            external_url = excluded.external_url,
            video_category = excluded.video_category,
            duration = excluded.duration,
            display_order = excluded.display_order,
            tags = excluded.tags,
            body = excluded.body,
            updated_at = now()
        `,
        [
          item.id,
          item.section,
          item.title,
          item.eyebrow,
          item.summary,
          item.slug,
          item.image_url,
          item.source,
          item.published_at,
          item.content_type,
          item.video_url,
          item.external_url,
          item.video_category,
          item.duration,
          item.display_order,
          item.tags,
          item.body
        ]
      );
      upserted += 1;
    }

    const totals = await client.query(`
      select video_category, count(*)::int as count
      from public.worldcup_items
      where section = 'videos'
      group by video_category
      order by video_category
    `);

    await client.query("commit");
    for (const section of sections) {
      const preview = section.items
        .slice(0, 3)
        .map((item) => item.title)
        .join(" | ");
      console.log(`${section.label} preview: ${preview}`);
    }
    console.log(`Upserted ${upserted} Migu videos (existing records kept).`);
    console.log(
      `Database totals: ${totals.rows.map((row) => `${row.video_category} ${row.count}`).join(", ")}`
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
