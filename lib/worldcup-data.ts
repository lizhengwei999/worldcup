import {
  CalendarDays,
  Clapperboard,
  Newspaper,
  Table2,
  Trophy
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { buildBaiduSearchUrl } from "./baidu";

export type SectionKey = "headlines" | "videos" | "schedule" | "standings";

export type NewsItem = {
  id: string;
  section: SectionKey;
  title: string;
  eyebrow: string;
  summary: string;
  source: string;
  publishedAt: string;
  slug: string;
  image: string;
  tags: string[];
  body: string[];
  contentType?: "article" | "video" | "live";
  externalUrl?: string | null;
  videoUrl?: string | null;
};

export type MatchItem = {
  id: string;
  title: string;
  stage: string;
  date: string;
  venue: string;
  status: "upcoming" | "live" | "finished";
  slug: string;
};

export type StandingItem = {
  id: string;
  rank: number;
  team: string;
  group: string;
  logo: string;
  win: number;
  draw: number;
  loss: number;
  goals: number;
  against: number;
  played: number;
  points: number;
  goalDiff: number;
  slug: string;
};

export type StandingGroup = {
  group: string;
  teams: StandingItem[];
};

export type SectionDefinition = {
  key: SectionKey;
  href: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: LucideIcon;
};

export const sections: SectionDefinition[] = [
  {
    key: "headlines",
    href: "/headlines",
    title: "世界杯头条",
    shortTitle: "头条",
    description: "聚合百度搜索页里的热点标题、官方动态与赛前焦点。",
    icon: Newspaper
  },
  {
    key: "standings",
    href: "/standings",
    title: "积分排名",
    shortTitle: "积分",
    description: "展示小组积分、净胜球与晋级线索，支持后续实时同步。",
    icon: Table2
  },
  {
    key: "schedule",
    href: "/schedule",
    title: "全部赛程",
    shortTitle: "赛程",
    description: "按比赛日组织开球时间、场馆、状态和详情链接。",
    icon: CalendarDays
  },
  {
    key: "videos",
    href: "/videos",
    title: "精彩视频",
    shortTitle: "视频",
    description: "用短视频入口承接集锦、发布会、训练和球星花絮。",
    icon: Clapperboard
  }
];

export const headlineItems: NewsItem[] = [
  {
    id: "h1",
    section: "headlines",
    title: "墨西哥vs南非",
    eyebrow: "直播预告",
    summary:
      "百度世界杯头条轮播首屏赛事入口，聚焦揭幕日墨西哥与南非的赛前动态和直播信息。",
    source: "百度世界杯头条",
    publishedAt: "2026-06-12",
    slug: "mexico-vs-south-africa-live",
    image:
      "https://gips1.baidu.com/it/u=4263244788,2722555532&fm=3028&app=3028&f=JPEG&fmt=auto&q=100&size=f780_664",
    tags: ["直播预告", "墨西哥", "南非"],
    body: [
      "这条内容来自百度“美加墨世界杯”搜索页顶部世界杯头条轮播，首页使用百度原始轮播图保持视觉一致。",
      "详情页保留动态百度入口，方便后续按同一标题承接最新资讯、直播和战报内容。",
      "后续接入 Supabase 后，可继续把百度轮播标题、封面和跳转链接作为运营数据维护。"
    ]
  },
  {
    id: "h2",
    section: "headlines",
    title: "揭幕战墨西哥vs南非前瞻",
    eyebrow: "资讯",
    summary:
      "围绕揭幕战双方阵容、比赛节奏和主场氛围，为用户提供赛前快速阅读入口。",
    source: "百度世界杯头条",
    publishedAt: "2026-06-12",
    slug: "opening-match-preview",
    image:
      "https://gips1.baidu.com/it/u=2474749557,2580811232&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f780_664",
    tags: ["揭幕战", "前瞻", "赛程"],
    body: [
      "百度轮播图中的前瞻内容适合作为首页头条第二屏，点击后进入详情模板承接延展阅读。",
      "移动端首页只保留关键标题和封面，更多内容通过详情页与百度动态结果承接。",
      "这类赛前内容后续可按比赛日自动更新，保证小程序首页常看常新。"
    ]
  },
  {
    id: "h3",
    section: "headlines",
    title: "小组赛韩国vs捷克前瞻",
    eyebrow: "资讯",
    summary:
      "围绕韩国与捷克的小组赛交锋，聚合双方阵容、赛程阶段和看点信息。",
    source: "百度世界杯头条",
    publishedAt: "2026-06-12",
    slug: "korea-vs-czech-preview",
    image:
      "https://gips1.baidu.com/it/u=2180998198,871578849&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f780_664",
    tags: ["韩国", "捷克", "小组赛"],
    body: [
      "这条内容来自百度头条轮播第三屏，适合承接小组赛球队对比和赛前预测。",
      "详情页模板会围绕标题自动生成百度动态检索入口，让用户进入最新公开结果。",
      "首页轮播保持 6 张固定来源图，避免不同数据源导致视觉和内容不一致。"
    ]
  },
  {
    id: "h4",
    section: "headlines",
    title: "世界杯历史最年轻与最年长帽子戏法",
    eyebrow: "资讯",
    summary:
      "以世界杯历史纪录为切口，补充赛事知识、球星故事和经典瞬间。",
    source: "百度世界杯头条",
    publishedAt: "2026-06-12",
    slug: "world-cup-hat-trick-records",
    image:
      "https://gips0.baidu.com/it/u=3074594233,3873578268&fm=3028&app=3028&f=JPEG&fmt=auto&q=100&size=f780_664",
    tags: ["世界杯历史", "帽子戏法", "纪录"],
    body: [
      "纪录类内容可以丰富首页头条轮播，不只覆盖当日赛程，也覆盖历史与球星知识。",
      "移动端展示以大图和短标题为主，详情页再承接更完整的背景内容。",
      "后续可以将此类内容按知识科普、赛事前瞻、直播回放等标签分组。"
    ]
  },
  {
    id: "h5",
    section: "headlines",
    title: "哈兰德之歌太洗脑了",
    eyebrow: "资讯",
    summary:
      "围绕热门球星和球迷文化的轻内容，增强世界杯首页的娱乐性和传播感。",
    source: "百度世界杯头条",
    publishedAt: "2026-06-12",
    slug: "haaland-song-highlight",
    image:
      "https://gips1.baidu.com/it/u=4245554549,3004444901&fm=3028&app=3028&f=JPEG&fmt=auto&q=100&size=f780_664",
    tags: ["哈兰德", "球迷文化", "热点"],
    body: [
      "球迷文化类内容适合穿插在赛程前瞻之间，让首页节奏更轻快。",
      "百度原始轮播图保留了对应主题的视觉信息，能够和截图中的头条模块保持一致。",
      "详情页仍然用动态链接承接实时搜索结果，避免内容过时。"
    ]
  },
  {
    id: "h6",
    section: "headlines",
    title: "《谁是冠军》开播 一起预测世界杯冠军",
    eyebrow: "直播回放",
    summary:
      "百度头条轮播中的直播回放内容，聚焦冠军预测和世界杯主题节目。",
    source: "百度世界杯头条",
    publishedAt: "2026-06-12",
    slug: "who-is-champion-live",
    image:
      "https://gips1.baidu.com/it/u=3800703011,329851806&fm=3028&app=3028&f=PNG&fmt=auto&q=94&size=f780_664",
    tags: ["直播回放", "冠军预测", "世界杯节目"],
    body: [
      "这张图对应你截图里的《谁是冠军》轮播卡，是百度页面中的第六条头条轮播数据。",
      "首页轮播会动态切换这 6 条内容，标题、标签、图片都保持同一数据来源。",
      "详情页用于展示摘要和相关动态入口，后续可进一步接入百度或 Supabase 的实时内容。"
    ]
  }
];

export const videoItems: NewsItem[] = [
  {
    id: "v1",
    section: "videos",
    title: "开幕日高光：主办国氛围、球迷入场与赛前仪式",
    eyebrow: "视频精选",
    summary: "以短视频卡片承载高光、仪式和球迷现场，适合首页露出 2-3 条。",
    source: "百度动态检索",
    publishedAt: "2026-06-12",
    slug: "opening-day-highlights",
    image:
      "https://gips1.baidu.com/it/u=4263244788,2722555532&fm=3028&app=3028&f=JPEG&fmt=auto&q=100&size=f780_664",
    tags: ["开幕日", "高光", "球迷"],
    body: [
      "视频详情页保留图文摘要和外部搜索入口，避免在没有授权素材时直接搬运视频内容。",
      "后续可以在 Supabase 中存储视频平台 URL、封面图、时长和版权来源。",
      "首页视频区采用横向可扫读样式，适合移动端快速浏览。"
    ]
  },
  {
    id: "v2",
    section: "videos",
    title: "训练场直击：热门球队适应北美节奏",
    eyebrow: "训练花絮",
    summary: "训练、发布会和球员采访可以作为赛前内容的重要补充。",
    source: "百度动态检索",
    publishedAt: "2026-06-12",
    slug: "training-ground-report",
    image:
      "https://gips1.baidu.com/it/u=2180998198,871578849&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f780_664",
    tags: ["训练", "发布会", "球队"],
    body: [
      "视频栏目页会比首页展示更完整的列表，方便用户按发布时间浏览。",
      "每个标题都会生成百度检索链接，这样在赛事期间可以自动连接最新的视频搜索结果。",
      "落地页先完成可用信息架构，后续只需要替换数据源即可扩展。"
    ]
  }
];

export const scheduleItems: MatchItem[] = [
  {
    id: "s1",
    title: "揭幕战专题",
    stage: "小组赛",
    date: "2026-06-11",
    venue: "墨西哥城",
    status: "finished",
    slug: "opening-match"
  },
  {
    id: "s2",
    title: "首个周末焦点战",
    stage: "小组赛",
    date: "2026-06-13",
    venue: "北美赛区",
    status: "upcoming",
    slug: "first-weekend-focus"
  },
  {
    id: "s3",
    title: "跨城连续比赛日",
    stage: "小组赛",
    date: "2026-06-16",
    venue: "多城市",
    status: "upcoming",
    slug: "multi-city-matchday"
  },
  {
    id: "s4",
    title: "淘汰赛路径观察",
    stage: "淘汰赛",
    date: "2026-06-28",
    venue: "待定",
    status: "upcoming",
    slug: "knockout-path"
  }
];

type StandingSeed = Pick<
  StandingItem,
  "id" | "rank" | "team" | "logo" | "win" | "draw" | "loss" | "goals" | "against" | "points"
>;

function makeStandingGroup(group: string, teams: StandingSeed[]): StandingGroup {
  return {
    group,
    teams: teams.map((team) => ({
      ...team,
      group,
      played: team.win + team.draw + team.loss,
      goalDiff: team.goals - team.against,
      slug: `${group.toLowerCase().replace("组", "")}-${team.id.slice(0, 8)}`
    }))
  };
}

export const standingGroups: StandingGroup[] = [
  makeStandingGroup("A组", [
    { id: "9c24b86859123a6a7218b5600e65680e", rank: 1, team: "墨西哥", logo: "https://gips0.baidu.com/it/u=3513621783,780965864&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f960_640", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 },
    { id: "dc7f9fdc795728d06adc20867070e73b", rank: 2, team: "南非", logo: "https://gips2.baidu.com/it/u=1871870758,2630787962&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f960_641", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 },
    { id: "e350aa265bc58bf922eb6ec5d3b705f3", rank: 3, team: "韩国", logo: "https://gips3.baidu.com/it/u=605950860,946410169&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f768_512", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 },
    { id: "bd0c6be1d4f081864fd88755b05c4f49", rank: 4, team: "捷克", logo: "https://gips3.baidu.com/it/u=2347456389,963830118&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f250_167", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 }
  ]),
  makeStandingGroup("B组", [
    { id: "35779c25e9dec553f154e9d6286925e6", rank: 1, team: "加拿大", logo: "https://gips0.baidu.com/it/u=3884888979,3662831454&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f960_640", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 },
    { id: "ef7a8c508595fd9083ec6e7ee93820ba", rank: 2, team: "波黑", logo: "https://gips0.baidu.com/it/u=3830983373,3705682793&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f960_640", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 },
    { id: "1d55f57a5cdc344f0944d2fba5e82f0a", rank: 3, team: "卡塔尔", logo: "https://gips0.baidu.com/it/u=3059663808,1376137081&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f960_640", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 },
    { id: "1692195abf8c7835f4212113975b49a6", rank: 4, team: "瑞士", logo: "https://gips0.baidu.com/it/u=2000814313,3030023231&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f960_640", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 }
  ]),
  makeStandingGroup("C组", [
    { id: "b92535372efd0c6bc7df7b84b9c7b577", rank: 1, team: "巴西", logo: "https://gips3.baidu.com/it/u=355604936,887753579&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f960_672", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 },
    { id: "b16a9fdf450c58c762b49202c4d13efe", rank: 2, team: "摩洛哥", logo: "https://gips1.baidu.com/it/u=307857087,1341230857&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f960_640", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 },
    { id: "a57cdc7e5410f79bf70d8636b03a3985", rank: 3, team: "海地", logo: "https://gips0.baidu.com/it/u=3022133310,4147072328&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f960_576", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 },
    { id: "bd630ae14342fe2fa1b7376b8c467a36", rank: 4, team: "苏格兰", logo: "https://gips2.baidu.com/it/u=1420506569,2365976840&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f960_577", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 }
  ]),
  makeStandingGroup("D组", [
    { id: "a09c0a1b5f939e899c2c90239c3061f2", rank: 1, team: "美国", logo: "https://gips3.baidu.com/it/u=1781592653,3525276581&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f960_640", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 },
    { id: "13aeb5d36078e7d9a8b2d8ea3c63cd84", rank: 2, team: "巴拉圭", logo: "https://gips3.baidu.com/it/u=3760688783,1707410407&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f800_480", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 },
    { id: "ad002317be38a25026110feccea14ed1", rank: 3, team: "澳大利亚", logo: "https://gips1.baidu.com/it/u=881279696,563558583&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f960_640", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 },
    { id: "11cf940dfd3e5766a4108da1968f8c65", rank: 4, team: "土耳其", logo: "https://gips1.baidu.com/it/u=2016570423,1611718430&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f960_640", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 }
  ]),
  makeStandingGroup("E组", [
    { id: "d885ec68c7b46dbfd4a8f6e41d577ba0", rank: 1, team: "德国", logo: "https://gips0.baidu.com/it/u=3385173656,3729238093&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f960_640", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 },
    { id: "f304b118f59fd0087bde4807de418c56", rank: 2, team: "库拉索", logo: "https://gips2.baidu.com/it/u=679323160,945026181&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f960_640", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 },
    { id: "122c4a5024a4a2395071b27ae3c96a9c", rank: 3, team: "科特迪瓦", logo: "https://gips3.baidu.com/it/u=1808223794,1513368769&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f250_167", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 },
    { id: "e03d262a641690d6021146f8a1960c55", rank: 4, team: "厄瓜多尔", logo: "https://gips0.baidu.com/it/u=3201164360,1349725635&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f1440_960", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 }
  ]),
  makeStandingGroup("F组", [
    { id: "e37f589321ffb8ced53d4fb4de96e5ff", rank: 1, team: "荷兰", logo: "https://gips3.baidu.com/it/u=2119182311,3807665715&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f960_640", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 },
    { id: "017ebd53c335a35f3ff9c611be8cc5c8", rank: 2, team: "日本", logo: "https://gips3.baidu.com/it/u=4137355855,3402199761&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f1000_667", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 },
    { id: "b2eb99748b34be973dbd98415cb0a3c7", rank: 3, team: "瑞典", logo: "https://gips1.baidu.com/it/u=682750643,731361458&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f250_157", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 },
    { id: "18c8a8c7502910e966a80fb74b4274b5", rank: 4, team: "突尼斯", logo: "https://gips1.baidu.com/it/u=1345869971,3631117184&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f250_167", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 }
  ]),
  makeStandingGroup("G组", [
    { id: "265243e3f2e8dd1261e98f372183240f", rank: 1, team: "比利时", logo: "https://gips2.baidu.com/it/u=221920988,830115528&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f330_220", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 },
    { id: "5482e10c7389489cb9f4c912ff822c04", rank: 2, team: "埃及", logo: "https://gips2.baidu.com/it/u=1428867663,3798869747&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f250_167", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 },
    { id: "a57d0fd569253f6bfd9486dd6db9d484", rank: 3, team: "伊朗", logo: "https://gips0.baidu.com/it/u=753662895,4140935039&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f960_640", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 },
    { id: "606320b6c012a17a7a96eba0a95b8e79", rank: 4, team: "新西兰", logo: "https://gips3.baidu.com/it/u=2587017666,4252778874&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f960_640", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 }
  ]),
  makeStandingGroup("H组", [
    { id: "ca0f779e8db617a828a1c886d6beb530", rank: 1, team: "西班牙", logo: "https://gips3.baidu.com/it/u=736617024,2651977279&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f960_640", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 },
    { id: "3cecc3c32bea4f6662753aaedd32cf90", rank: 2, team: "佛得角", logo: "https://gips2.baidu.com/it/u=31201770,586471821&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f960_640", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 },
    { id: "71193d502f1a0147c8d13f3f78eb1729", rank: 3, team: "沙特阿拉伯", logo: "https://gips1.baidu.com/it/u=190709705,802629465&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f960_640", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 },
    { id: "7582d690648eb69085503eb2a08b5b39", rank: 4, team: "乌拉圭", logo: "https://gips1.baidu.com/it/u=812322409,583765920&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f960_640", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 }
  ]),
  makeStandingGroup("I组", [
    { id: "396c35d0620914f054cdb72e46a5f174", rank: 1, team: "法国", logo: "https://gips1.baidu.com/it/u=4219907651,3493380724&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f900_600", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 },
    { id: "023fb7a8de59b54f288308c180e292fa", rank: 2, team: "塞内加尔", logo: "https://gips3.baidu.com/it/u=2958280367,58297920&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f960_640", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 },
    { id: "e44c88e683e0aa9a3c500dc75033dad2", rank: 3, team: "伊拉克", logo: "https://gips2.baidu.com/it/u=2054611559,1157324030&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f960_638", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 },
    { id: "71738605c250e55a12624947da9bd247", rank: 4, team: "挪威", logo: "https://gips3.baidu.com/it/u=2181445520,380601708&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f297_216", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 }
  ]),
  makeStandingGroup("J组", [
    { id: "3d9f26830ac65f2297cc3c1d20487154", rank: 1, team: "阿根廷", logo: "https://gips0.baidu.com/it/u=4113397992,1815373732&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f960_640", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 },
    { id: "36ad997d444aae1f0166dfdcb777493a", rank: 2, team: "阿尔及利亚", logo: "https://gips2.baidu.com/it/u=2012997553,63486358&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f250_167", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 },
    { id: "87d2f6f08a43085d31f09472e19edee6", rank: 3, team: "奥地利", logo: "https://gips3.baidu.com/it/u=382238338,199982098&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f960_642", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 },
    { id: "eb9a7c8d47d75b02bb4156c4f87f17a7", rank: 4, team: "约旦", logo: "https://gips1.baidu.com/it/u=316212214,1375467802&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f960_640", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 }
  ]),
  makeStandingGroup("K组", [
    { id: "cd3b2deb45caa7373a08831e7de0f5ac", rank: 1, team: "葡萄牙", logo: "https://gips0.baidu.com/it/u=4013679695,544786619&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f900_600", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 },
    { id: "92a326ca035e2eb1a7af17e3e70ffafd", rank: 2, team: "刚果民主共和国", logo: "https://gips1.baidu.com/it/u=2877569789,3862138018&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f960_641", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 },
    { id: "1291c7890d5108afd39df6db09c7d85a", rank: 3, team: "乌兹别克斯坦", logo: "https://gips1.baidu.com/it/u=2431519932,4043854434&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f960_640", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 },
    { id: "c1d483bf3bbaf3040980088edde8560f", rank: 4, team: "哥伦比亚", logo: "https://gips2.baidu.com/it/u=2473030750,1303890097&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f960_637", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 }
  ]),
  makeStandingGroup("L组", [
    { id: "b78be5f1faa30defec36cef442b11431", rank: 1, team: "英格兰", logo: "https://gips3.baidu.com/it/u=1732514233,74342686&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f800_480", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 },
    { id: "785dab5ff819d718c38cbb2a0b877a69", rank: 2, team: "克罗地亚", logo: "https://gips0.baidu.com/it/u=653577520,931309583&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f960_640", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 },
    { id: "e00c50535a28cf7807621db0085a8382", rank: 3, team: "加纳", logo: "https://gips3.baidu.com/it/u=3250937723,1647931843&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f536_357", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 },
    { id: "90a5daeba664af01a6f9aeebe3491178", rank: 4, team: "巴拿马", logo: "https://gips2.baidu.com/it/u=2155601987,2886013313&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f960_641", win: 0, draw: 0, loss: 0, goals: 0, against: 0, points: 0 }
  ])
];

export const standingItems: StandingItem[] = standingGroups.flatMap((group) => group.teams);

export const allNewsItems = [...headlineItems, ...videoItems];

export function getSection(key: SectionKey): SectionDefinition {
  return sections.find((section) => section.key === key) ?? sections[0];
}

export function getSectionItems(key: SectionKey): NewsItem[] {
  if (key === "headlines") {
    return headlineItems;
  }

  if (key === "videos") {
    return videoItems;
  }

  return [];
}

export function getDetailItem(section: string, slug: string): NewsItem | undefined {
  if (section === "headlines" || section === "videos") {
    return allNewsItems.find((item) => item.section === section && item.slug === slug);
  }

  if (section === "schedule") {
    const match = scheduleItems.find((item) => item.slug === slug);
    if (!match) {
      return undefined;
    }

    return {
      id: match.id,
      section: "schedule",
      title: match.title,
      eyebrow: match.stage,
      summary: `${match.date} · ${match.venue} · ${match.status === "finished" ? "已结束" : "待开赛"}`,
      source: "赛程动态检索",
      publishedAt: match.date,
      slug: match.slug,
      image:
        "https://gips1.baidu.com/it/u=2474749557,2580811232&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f780_664",
      tags: [match.stage, match.venue, match.status === "finished" ? "已结束" : "待开赛"],
      body: [
        "赛程详情页按照百度资讯详情思路呈现：先给出标题和摘要，再提供比赛背景、状态和相关动态入口。",
        "正式接入数据源后，这里可以展示双方阵容、技术统计、直播间、战报和赛后集锦。",
        "当前页面会根据标题自动生成百度检索链接，用于拉起最新公开信息。"
      ]
    };
  }

  if (section === "standings") {
    const standing = standingItems.find((item) => item.slug === slug);
    if (!standing) {
      return undefined;
    }

    return {
      id: standing.id,
      section: "standings",
      title: `${standing.team}积分走势`,
      eyebrow: standing.group,
      summary: `已赛 ${standing.played} 场，积分 ${standing.points}，净胜球 ${standing.goalDiff}。`,
      source: "积分动态检索",
      publishedAt: "2026-06-12",
      slug: standing.slug,
      image:
        "https://gips0.baidu.com/it/u=3074594233,3873578268&fm=3028&app=3028&f=JPEG&fmt=auto&q=100&size=f780_664",
      tags: [standing.group, "积分", "排名"],
      body: [
        "积分详情页用于解释排名变化、出线形势和关键赛程。",
        "落地阶段先以专题视角占位，避免在没有实时接口时展示不准确的小组排名。",
        "Supabase 表接入后，可用 group、team、points、goal_diff 等字段直接驱动此页。"
      ]
    };
  }

  return undefined;
}

export function getRelatedItems(currentId: string): NewsItem[] {
  return allNewsItems.filter((item) => item.id !== currentId).slice(0, 3);
}

export function getBaiduUrlForTitle(title: string): string {
  return buildBaiduSearchUrl(`美加墨世界杯 ${title}`);
}

export const trophyIcon = Trophy;
