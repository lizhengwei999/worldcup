import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import process from "node:process";
import { createHash } from "node:crypto";
import pg from "pg";

const { Client } = pg;
const rootDir = resolve(import.meta.dirname, "..");

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

const baiduWorldCupUrl =
  process.env.BAIDU_WORLDCUP_URL ??
  "https://www.baidu.com/s?ie=utf-8&f=8&rsv_bp=1&rsv_idx=1&tn=baidu&wd=%E4%B8%96%E7%95%8C%E6%9D%AF&fenlei=256&rqlang=en&rsv_enter=1&rsv_dl=tb_click&rsv_btype=i";

const headlineItems = [
  {
    id: "headline-20260613-001",
    title: "韩国2-1逆转捷克 亚洲队首胜",
    eyebrow: "资讯",
    summary: "韩国队在小组赛中完成逆转，凭借下半场连续冲击拿到亚洲球队本届赛事首胜。",
    slug: "korea-2-1-czech-asian-first-win",
    image_url:
      "https://gips1.baidu.com/it/u=2180998198,871578849&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f780_664",
    published_at: "2026-06-13T12:00:00+08:00",
    content_type: "article",
    tags: ["韩国", "捷克", "小组赛", "战报"],
    body: [
      "韩国队在比赛开局阶段一度承压，但中前场提速后逐渐掌握主动，边路推进和二点球争夺成为逆转关键。",
      "捷克队上半场依靠身体对抗制造威胁，不过韩国队在下半场通过换人调整提升了前场压迫质量。",
      "这场胜利让亚洲球队在小组赛阶段拿到重要开局，也为后续出线形势增加了更多看点。"
    ]
  },
  {
    id: "headline-20260613-002",
    title: "揭幕战墨西哥vs南非前瞻",
    eyebrow: "直播预告",
    summary: "揭幕战聚焦东道主墨西哥与南非的节奏对抗，赛前阵容和直播入口热度持续升高。",
    slug: "mexico-vs-south-africa-live",
    image_url:
      "https://gips1.baidu.com/it/u=4263244788,2722555532&fm=3028&app=3028&f=JPEG&fmt=auto&q=100&size=f780_664",
    published_at: "2026-06-13T11:40:00+08:00",
    content_type: "live",
    tags: ["直播预告", "墨西哥", "南非"],
    body: [
      "揭幕战是世界杯首页头条最重要的入口之一，用户通常会关注开球时间、首发阵容和直播信息。",
      "墨西哥坐拥东道主氛围，南非则希望通过高强度跑动制造反击空间。",
      "页面保留百度动态检索入口，便于用户继续查看实时阵容、直播信号和赛后战报。"
    ]
  },
  {
    id: "headline-20260613-003",
    title: "小组赛韩国vs捷克前瞻",
    eyebrow: "资讯",
    summary: "围绕韩国与捷克的小组赛交锋，聚合双方阵容、赛程阶段和重点球员状态。",
    slug: "korea-vs-czech-preview",
    image_url:
      "https://gips1.baidu.com/it/u=2474749557,2580811232&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f780_664",
    published_at: "2026-06-13T11:20:00+08:00",
    content_type: "article",
    tags: ["韩国", "捷克", "前瞻"],
    body: [
      "韩国队需要在攻防转换中保持速度，捷克队则更依赖中后场对抗和定位球质量。",
      "比赛的胜负手可能出现在边路推进与禁区前沿的第二落点争夺。",
      "该条内容适合作为赛前阅读入口，帮助用户快速理解双方对阵背景。"
    ]
  },
  {
    id: "headline-20260613-004",
    title: "世界杯历史最年轻与最年长帽子戏法",
    eyebrow: "资讯",
    summary: "从历史纪录切入，回顾世界杯舞台上最年轻和最年长帽子戏法的经典时刻。",
    slug: "world-cup-hat-trick-records",
    image_url:
      "https://gips0.baidu.com/it/u=3074594233,3873578268&fm=3028&app=3028&f=JPEG&fmt=auto&q=100&size=f780_664",
    published_at: "2026-06-13T10:55:00+08:00",
    content_type: "article",
    tags: ["世界杯历史", "帽子戏法", "纪录"],
    body: [
      "纪录类内容能补充即时赛程之外的阅读层次，也适合在比赛日之间提升头条模块的信息密度。",
      "帽子戏法代表球员在单场比赛中的绝对统治力，是世界杯历史中最容易被记住的个人高光。",
      "在详情页中，用户可以继续通过动态检索查看不同年代的纪录背景和数据整理。"
    ]
  },
  {
    id: "headline-20260613-005",
    title: "哈兰德之歌太洗脑了",
    eyebrow: "视频",
    summary: "围绕热门球星和球迷文化的轻内容持续发酵，短视频话题带动世界杯社交热度。",
    slug: "haaland-song-highlight",
    image_url:
      "https://gips1.baidu.com/it/u=4245554549,3004444901&fm=3028&app=3028&f=JPEG&fmt=auto&q=100&size=f780_664",
    published_at: "2026-06-13T10:30:00+08:00",
    content_type: "video",
    tags: ["哈兰德", "视频", "球迷文化"],
    body: [
      "世界杯期间，球迷歌曲、看台文化和球星二创内容往往会与赛场表现一同出圈。",
      "这类内容适合以短视频或图文摘要形式进入头条流，增强页面的轻松氛围。",
      "后续可在数据库中补充视频地址字段，用于承接授权视频平台播放页。"
    ]
  },
  {
    id: "headline-20260613-006",
    title: "《谁是冠军》开播 一起预测世界杯冠军",
    eyebrow: "直播回放",
    summary: "世界杯主题节目上线，嘉宾围绕夺冠热门、黑马球队和赛程路径进行预测。",
    slug: "who-is-champion-live",
    image_url:
      "https://gips1.baidu.com/it/u=3800703011,329851806&fm=3028&app=3028&f=PNG&fmt=auto&q=94&size=f780_664",
    published_at: "2026-06-13T10:05:00+08:00",
    content_type: "video",
    tags: ["直播回放", "冠军预测", "世界杯节目"],
    body: [
      "冠军预测类节目适合在首页轮播中露出，能够承接用户对夺冠热门和淘汰赛路径的讨论。",
      "节目内容通常结合球队阵容、历史战绩和分组形势，为用户提供赛前观点参考。",
      "页面仍保留百度动态结果入口，方便追踪节目相关讨论和后续更新。"
    ]
  },
  {
    id: "headline-20260613-007",
    title: "西班牙小组赛首战即将打响",
    eyebrow: "赛前",
    summary: "西班牙队进入最后备战阶段，控球体系与锋线效率成为小组赛首战关注点。",
    slug: "spain-group-opener-preview",
    image_url:
      "https://gips3.baidu.com/it/u=736617024,2651977279&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f960_640",
    published_at: "2026-06-13T09:40:00+08:00",
    content_type: "article",
    tags: ["西班牙", "小组赛", "赛前"],
    body: [
      "西班牙队的传控体系依旧是小组赛的重要看点，球队需要在高控球率下提升最后一传质量。",
      "首战对手预计会采用更紧凑的防守结构，西班牙边路和肋部配合将直接影响比赛走势。",
      "积分榜和赛程页会同步承接球队后续比赛信息。"
    ]
  },
  {
    id: "headline-20260613-008",
    title: "阿根廷卫冕之路从J组起步",
    eyebrow: "前瞻",
    summary: "阿根廷所在小组赛程正式进入关注周期，卫冕冠军的阵容轮换和核心状态备受期待。",
    slug: "argentina-title-defense-group-j",
    image_url:
      "https://gips0.baidu.com/it/u=4113397992,1815373732&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f960_640",
    published_at: "2026-06-13T09:20:00+08:00",
    content_type: "article",
    tags: ["阿根廷", "卫冕冠军", "J组"],
    body: [
      "作为卫冕冠军，阿根廷在小组赛阶段需要兼顾结果与主力球员消耗。",
      "J组对手特点各不相同，球队在不同比赛中的中场配置和锋线搭配会成为持续看点。",
      "用户可通过赛程筛选阿根廷，查看该队完整小组赛安排。"
    ]
  },
  {
    id: "headline-20260613-009",
    title: "法国队训练基地临时调整",
    eyebrow: "动态",
    summary: "法国队根据备战节奏调整训练安排，部分训练环节改为封闭进行。",
    slug: "france-training-ground-report",
    image_url:
      "https://gips1.baidu.com/it/u=3800703011,329851806&fm=3028&app=3028&f=PNG&fmt=auto&q=94&size=f780_664",
    published_at: "2026-06-13T09:00:00+08:00",
    content_type: "article",
    tags: ["法国", "训练", "球队动态"],
    body: [
      "大赛期间训练安排变化往往与球员恢复、技战术演练和媒体开放节奏有关。",
      "法国队阵容深度充足，但如何平衡高强度比赛和核心球员身体状态仍是关键。",
      "训练动态类内容适合以短摘要进入头条列表，详情页再承接完整背景。"
    ]
  },
  {
    id: "headline-20260613-010",
    title: "葡萄牙公布小组赛备战重点",
    eyebrow: "资讯",
    summary: "葡萄牙队强调前场压迫与定位球效率，球队希望在小组赛阶段快速建立优势。",
    slug: "portugal-group-stage-preparation",
    image_url:
      "https://gips0.baidu.com/it/u=4013679695,544786619&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f900_600",
    published_at: "2026-06-13T08:40:00+08:00",
    content_type: "article",
    tags: ["葡萄牙", "小组赛", "备战"],
    body: [
      "葡萄牙队在前场拥有丰富选择，小组赛阶段的人员组合将影响球队进入淘汰赛后的上限。",
      "定位球和反抢效率是教练组近期强调的重点，也是面对不同风格对手时的重要武器。",
      "积分榜数据写入数据库后，可以随着比赛结果持续更新。"
    ]
  },
  {
    id: "headline-20260613-011",
    title: "英格兰新一代核心迎来大赛考验",
    eyebrow: "焦点",
    summary: "英格兰队多名年轻核心进入世界杯周期，阵容厚度与关键战处理能力成为焦点。",
    slug: "england-new-core-world-cup-test",
    image_url:
      "https://gips3.baidu.com/it/u=1732514233,74342686&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f800_480",
    published_at: "2026-06-13T08:20:00+08:00",
    content_type: "article",
    tags: ["英格兰", "年轻核心", "世界杯"],
    body: [
      "英格兰队阵容结构年轻且富有冲击力，但大赛淘汰赛中的临场处理仍将决定球队高度。",
      "小组赛阶段既是抢分过程，也是教练组测试不同中前场组合的重要窗口。",
      "相关球队信息会在积分榜和球队榜中继续呈现。"
    ]
  },
  {
    id: "headline-20260613-012",
    title: "巴西队巡礼：桑巴军团剑指冠军",
    eyebrow: "巡礼",
    summary: "巴西队继续以强大的前场个人能力吸引关注，攻防平衡是本届赛事的关键命题。",
    slug: "brazil-team-profile-title-ambition",
    image_url:
      "https://gips3.baidu.com/it/u=355604936,887753579&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f960_672",
    published_at: "2026-06-13T08:00:00+08:00",
    content_type: "article",
    tags: ["巴西", "球队巡礼", "夺冠热门"],
    body: [
      "巴西队的前场天赋依旧突出，如何把个人能力转化为稳定的团队压制是争冠关键。",
      "在长赛程中，阵容轮换和防线稳定性同样重要。",
      "球队巡礼内容可以与视频页的 48 队巡礼模块形成互相跳转。"
    ]
  }
].map((item) => ({
  ...item,
  section: "headlines",
  source: "百度世界杯头条",
  external_url: baiduWorldCupUrl,
  video_url: item.content_type === "video" ? baiduWorldCupUrl : null
}));

function decodeJsonString(value) {
  try {
    return JSON.parse(`"${value}"`);
  } catch {
    return value;
  }
}

function cleanText(value) {
  return decodeJsonString(value)
    .replace(/\\u[0-9a-fA-F]{4}/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/&#x?[0-9a-fA-F]+;/g, "")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function absoluteBaiduUrl(url) {
  const decoded = decodeJsonString(url);

  if (decoded.startsWith("http")) {
    return decoded.replace(/&amp;/g, "&");
  }

  return new URL(decoded, "https://www.baidu.com").toString();
}

function slugify(title, index) {
  const hash = createHash("sha1").update(title).digest("hex").slice(0, 10);
  return `baidu-worldcup-${String(index + 1).padStart(2, "0")}-${hash}`;
}

function guessContentType(title, url) {
  const text = `${title} ${url}`;

  if (/video|videolanding|视频|时长|\[世界杯\]/i.test(text)) {
    return "video";
  }

  if (/直播/.test(text)) {
    return "live";
  }

  return "article";
}

function buildSummary(title, contentType) {
  if (contentType === "video") {
    return `百度世界杯动态视频：${title}，适合在首页头条与详情页中承接视频热点。`;
  }

  if (contentType === "live") {
    return `百度世界杯直播相关动态：${title}，聚合赛程、球队和实时入口信息。`;
  }

  return `百度世界杯搜索页动态：${title}，用于同步展示最新世界杯头条信息。`;
}

function buildBody(title, summary, contentType) {
  const cleanSummary = cleanText(summary);

  if (cleanSummary) {
    return [cleanSummary];
  }

  return [buildSummary(title, contentType)];
}

function stripHtmlBlocks(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
    .replace(/<svg[\s\S]*?<\/svg>/gi, "");
}

function isReadableParagraph(text, title) {
  return (
    text.length >= 18 &&
    text.length <= 260 &&
    !text.includes(title) &&
    !/责任编辑|打开APP|下载百度|百度安全验证|网络不给力|返回首页|问题反馈|版权所有|广告|举报|登录/.test(text) &&
    !/^https?:\/\//.test(text)
  );
}

function uniqueParagraphs(paragraphs) {
  const seen = new Set();
  const result = [];

  for (const paragraph of paragraphs) {
    const normalized = cleanText(paragraph);

    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    result.push(normalized);
  }

  return result;
}

function extractArticleBody(html, title) {
  const cleanHtml = stripHtmlBlocks(html);
  const paragraphs = [];

  const articleBodyMatch = cleanHtml.match(/"articleBody"\s*:\s*"((?:\\.|[^"\\]){80,})"/i);
  if (articleBodyMatch?.[1]) {
    paragraphs.push(...decodeJsonString(articleBodyMatch[1]).split(/(?:\\n|\n|。(?=\S))/));
  }

  const contentBlocks = [
    /<article[\s\S]*?<\/article>/gi,
    /<div[^>]+class=["'][^"']*(?:article|content|detail|main|text|rich_text|news)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,
    /<section[^>]+class=["'][^"']*(?:article|content|detail|main|text|rich_text|news)[^"']*["'][^>]*>[\s\S]*?<\/section>/gi
  ];

  for (const blockPattern of contentBlocks) {
    const blocks = cleanHtml.match(blockPattern) ?? [];

    for (const block of blocks) {
      const paragraphPattern = /<p[^>]*>([\s\S]*?)<\/p>/gi;
      let paragraphMatch;

      while ((paragraphMatch = paragraphPattern.exec(block))) {
        paragraphs.push(paragraphMatch[1]);
      }
    }
  }

  const fallbackParagraphPattern = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let fallbackMatch;

  while ((fallbackMatch = fallbackParagraphPattern.exec(cleanHtml)) && paragraphs.length < 24) {
    paragraphs.push(fallbackMatch[1]);
  }

  const readable = uniqueParagraphs(paragraphs)
    .filter((paragraph) => isReadableParagraph(paragraph, title))
    .slice(0, 6);

  if (readable.length > 0) {
    return readable;
  }

  const metaDescription =
    cleanHtml.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
    cleanHtml.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
    "";

  return uniqueParagraphs([metaDescription]).filter((paragraph) => isReadableParagraph(paragraph, title));
}

async function fetchArticleBody(url, title) {
  try {
    const response = await fetch(url, {
      headers: {
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "zh-CN,zh;q=0.9",
        referer: "https://www.baidu.com/",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
      },
      redirect: "follow"
    });

    if (!response.ok) {
      return [];
    }

    const html = await response.text();

    if (/百度安全验证|网络不给力|verify/.test(html)) {
      return [];
    }

    return extractArticleBody(html, title);
  } catch {
    return [];
  }
}

function findImageUrl(value) {
  if (!value || typeof value !== "object") {
    return "";
  }

  const imageKeys = ["largeImg", "img", "miniImg", "pic", "poster", "imgUri"];

  for (const key of imageKeys) {
    if (typeof value[key] === "string" && /^https?:/.test(value[key])) {
      return value[key];
    }
  }

  if (typeof value.video?.poster === "string") {
    return value.video.poster;
  }

  if (typeof value.videoInfo?.poster === "string") {
    return value.videoInfo.poster;
  }

  if (typeof value.source?.img === "string") {
    return value.source.img;
  }

  return "";
}

function findSummary(value) {
  if (!value || typeof value !== "object") {
    return "";
  }

  const summaryCandidates = [
    value.abstract,
    value.desc,
    value.brief,
    value.content,
    value.mainInfo?.brief,
    value.abstractInfo?.text,
    value.ariaData?.ariaBrief
  ];

  return summaryCandidates.find((item) => typeof item === "string" && cleanText(item).length > 10) ?? "";
}

function collectStructuredItems(value, pushCandidate) {
  if (!value || typeof value !== "object") {
    return;
  }

  const title = typeof value.title === "string" ? value.title : value.titleInfo?.title;
  const url = typeof value.url === "string" ? value.url : value.source?.url;
  const imageUrl = findImageUrl(value);

  if (typeof title === "string" && typeof url === "string" && imageUrl) {
    pushCandidate(url, title, imageUrl, findSummary(value));
  }

  Object.values(value).forEach((child) => {
    if (Array.isArray(child)) {
      child.forEach((item) => collectStructuredItems(item, pushCandidate));
    } else if (child && typeof child === "object") {
      collectStructuredItems(child, pushCandidate);
    }
  });
}

function extractStructuredBaiduItems(html, pushCandidate) {
  const dataPattern = /<!--s-data:([\s\S]*?)-->/g;
  let match;

  while ((match = dataPattern.exec(html))) {
    try {
      collectStructuredItems(JSON.parse(match[1]), pushCandidate);
    } catch {
      // Some Baidu comments are not valid standalone JSON; regex extraction still covers them.
    }
  }
}

function extractBaiduItems(html) {
  const candidates = [];
  const seenTitles = new Set();
  const seenImages = new Set();
  const objectPattern =
    /"url":"([^"]+)","title":"([^"]+)"[\s\S]{0,1800}?"(?:largeImg|img|miniImg|pic|poster)":"([^"]+)"[\s\S]{0,1200}?(?:"(?:brief|desc|summary|text)":"([^"]+)")?/g;
  const cardPattern =
    /href="([^"]+)"[^>]*data-module="title"[\s\S]{0,1200}?<!--s-text-->([\s\S]*?)<!--\/s-text-->[\s\S]{0,3600}?background-image:\s*url\((https?:[^)]+)\)[\s\S]{0,1800}?(?:<!--s-text-->([\s\S]*?)<!--\/s-text-->)?/g;
  let match;

  function pushCandidate(rawUrl, rawTitle, rawImageUrl, rawSummary = "") {
    const title = cleanText(rawTitle).replace(/^\[世界杯\]/, "").trim();
    const imageUrl = decodeJsonString(rawImageUrl).replace(/\\\//g, "/").replace(/&amp;/g, "&");
    const externalUrl = absoluteBaiduUrl(rawUrl);
    const summary = cleanText(rawSummary);

    if (
      !title ||
      title.length < 6 ||
      title.length > 64 ||
      /^&?#?x?[0-9a-fA-F]+;?$/.test(title) ||
      /^[\uE000-\uF8FF]+$/.test(title) ||
      seenTitles.has(title) ||
      seenImages.has(imageUrl) ||
      !imageUrl.startsWith("http") ||
      /百度百科|2034年国际足联世界杯|国际足联世界杯$|相关搜索|大家还在搜|澳门|乒乓/.test(title)
    ) {
      return;
    }

    seenTitles.add(title);
    seenImages.add(imageUrl);
    candidates.push({
      externalUrl,
      imageUrl,
      summary,
      title
    });
  }

  while ((match = objectPattern.exec(html)) && candidates.length < 24) {
    pushCandidate(match[1], match[2], match[3], match[4]);
  }

  extractStructuredBaiduItems(html, pushCandidate);

  while ((match = cardPattern.exec(html)) && candidates.length < 24) {
    pushCandidate(match[1], match[2], match[3], match[4]);
  }

  return candidates;
}

function extractBaiduItemsLegacy(html) {
  const candidates = [];
  const seenTitles = new Set();
  const objectPattern =
    /"url":"([^"]+)","title":"([^"]+)"[\s\S]{0,1200}?"(?:largeImg|img|miniImg)":"([^"]+)"/g;
  let match;

  while ((match = objectPattern.exec(html)) && candidates.length < 24) {
    const title = cleanText(match[2]);
    const imageUrl = decodeJsonString(match[3]);
    const externalUrl = absoluteBaiduUrl(match[1]);

    if (
      !title ||
      seenTitles.has(title) ||
      !imageUrl.startsWith("http") ||
      /百度百科|2034年国际足联世界杯|国际足联世界杯$/.test(title)
    ) {
      continue;
    }

    seenTitles.add(title);
    candidates.push({
      externalUrl,
      imageUrl,
      title
    });
  }

  return candidates;
}

function isValidHeadlineTitle(title) {
  return (
    title &&
    title.length >= 6 &&
    title.length <= 64 &&
    !/^&?#?x?[0-9a-fA-F]+;?$/.test(title) &&
    !/^[\uE000-\uF8FF]+$/.test(title) &&
    !/百度百科|2034年国际足联世界杯|国际足联世界杯$|相关搜索|大家还在搜|澳门|乒乓/.test(title)
  );
}

function extractTextOnlyItems(html) {
  const items = [];
  const seenTitles = new Set();
  const textPattern =
    /href="([^"]+)"[^>]*data-module="title"[\s\S]{0,1200}?<!--s-text-->([\s\S]*?)<!--\/s-text-->[\s\S]{0,2200}?(?:<!--s-text-->([\s\S]*?)<!--\/s-text-->)?/g;
  let match;

  while ((match = textPattern.exec(html)) && items.length < 24) {
    const title = cleanText(match[2]).replace(/^\[世界杯\]/, "").trim();
    const summary = cleanText(match[3] ?? "");

    if (!isValidHeadlineTitle(title) || seenTitles.has(title)) {
      continue;
    }

    seenTitles.add(title);
    items.push({
      externalUrl: absoluteBaiduUrl(match[1]),
      summary,
      title
    });
  }

  return items;
}

async function fetchRemoteImage(url) {
  try {
    const response = await fetch(url, {
      headers: {
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "zh-CN,zh;q=0.9",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
      },
      redirect: "follow"
    });

    if (!response.ok) {
      return "";
    }

    const html = await response.text();
    const imagePatterns = [
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
      /<img[^>]+src=["'](https?:\/\/[^"']+)["']/i
    ];

    for (const pattern of imagePatterns) {
      const match = html.match(pattern);
      if (match?.[1]) {
        return new URL(match[1].replace(/&amp;/g, "&"), response.url).toString();
      }
    }
  } catch {
    return "";
  }

  return "";
}

async function enrichWithRemoteImages(html, items) {
  if (items.length >= 12) {
    return items;
  }

  const seenTitles = new Set(items.map((item) => item.title));
  const seenImages = new Set(items.map((item) => item.imageUrl));
  const textOnlyItems = extractTextOnlyItems(html);

  for (const item of textOnlyItems) {
    if (items.length >= 12) {
      break;
    }

    if (seenTitles.has(item.title)) {
      continue;
    }

    const imageUrl = await fetchRemoteImage(item.externalUrl);

    if (!imageUrl || seenImages.has(imageUrl)) {
      continue;
    }

    seenTitles.add(item.title);
    seenImages.add(imageUrl);
    items.push({
      ...item,
      imageUrl
    });
  }

  return items;
}

async function fetchBaiduHeadlineItems() {
  const response = await fetch(baiduWorldCupUrl, {
    headers: {
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "accept-language": "zh-CN,zh;q=0.9",
      "cache-control": "no-cache",
      pragma: "no-cache",
      referer: "https://www.baidu.com/",
      "upgrade-insecure-requests": "1",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
    }
  });

  if (!response.ok) {
    throw new Error(`Baidu request failed with HTTP ${response.status}`);
  }

  const html = await response.text();

  if (/百度安全验证|网络不给力/.test(html)) {
    throw new Error("Baidu returned a security verification page instead of World Cup data.");
  }

  const extractedItems = (await enrichWithRemoteImages(html, extractBaiduItems(html))).slice(0, 12);

  if (extractedItems.length < 6) {
    throw new Error(`Only extracted ${extractedItems.length} Baidu headline items; aborting database update.`);
  }

  const now = Date.now();

  return Promise.all(extractedItems.map(async (item, index) => {
    const contentType = guessContentType(item.title, item.externalUrl);
    const summary = item.summary || buildSummary(item.title, contentType);
    const articleBody =
      contentType === "video" ? [] : await fetchArticleBody(item.externalUrl, item.title);

    return {
      body: articleBody.length > 0 ? articleBody : buildBody(item.title, summary, contentType),
      content_type: contentType,
      eyebrow: contentType === "video" ? "视频" : contentType === "live" ? "直播" : "资讯",
      external_url: item.externalUrl,
      id: `baidu-headline-${createHash("sha1").update(item.title).digest("hex").slice(0, 12)}`,
      image_url: item.imageUrl,
      published_at: new Date(now - index * 5 * 60 * 1000).toISOString(),
      section: "headlines",
      slug: slugify(item.title, index),
      source: "百度世界杯搜索页",
      summary,
      tags: ["世界杯", contentType === "video" ? "视频" : "资讯"],
      title: item.title,
      video_url: contentType === "video" ? item.externalUrl : null
    };
  }));
}

async function seed() {
  await loadEnvFile();

  const connectionString = getDatabaseUrl();
  if (!connectionString) {
    throw new Error("Missing Postgres connection string. Set SUPABASE_DB_URL or DATABASE_URL.");
  }

  const itemsToSeed = await fetchBaiduHeadlineItems();
  const schema = await readFile(resolve(rootDir, "supabase", "content.sql"), "utf8");
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
    await client.query("delete from public.worldcup_items where section = 'headlines'");

    for (const item of itemsToSeed) {
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
            tags,
            body,
            updated_at
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, now())
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
          item.tags,
          item.body
        ]
      );
    }

    await client.query("commit");
    console.log(`Seeded ${itemsToSeed.length} headline items from Baidu page.`);
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
