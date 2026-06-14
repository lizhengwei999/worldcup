"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { ModuleNavShell, moduleTabClass } from "@/components/module-nav";
import { useState } from "react";

export const VIDEOS_PAGE_SIZE = 12;

export type VideoItem = {
  duration: string;
  externalUrl?: string | null;
  id: string;
  image: string;
  slug: string;
  title: string;
  videoUrl?: string | null;
};

export type VideoSection = {
  id: string;
  items: VideoItem[];
  label: string;
};

export const videoSections: VideoSection[] = [
  {
    id: "focus",
    label: "聚焦世界杯",
    items: [
      {
        duration: "01:07",
        id: "focus-1",
        image: "https://gips1.baidu.com/it/u=2180998198,871578849&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f780_664",
        slug: "korea-vs-czech-preview",
        title: "日本足协官员：远藤航因伤无缘世界杯"
      },
      {
        duration: "00:44",
        id: "focus-2",
        image: "https://gips1.baidu.com/it/u=2474749557,2580811232&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f780_664",
        slug: "opening-match-preview",
        title: "洪明甫：次战墨西哥至关重要"
      },
      {
        duration: "00:49",
        id: "focus-3",
        image: "https://gips1.baidu.com/it/u=4263244788,2722555532&fm=3028&app=3028&f=JPEG&fmt=auto&q=100&size=f780_664",
        slug: "training-ground-report",
        title: "法国队临时更换训练基地闭门谢客"
      },
      {
        duration: "01:39",
        id: "focus-4",
        image: "https://gips1.baidu.com/it/u=3800703011,329851806&fm=3028&app=3028&f=PNG&fmt=auto&q=94&size=f780_664",
        slug: "who-is-champion-live",
        title: "体育明星看世界杯 哪只球队能夺冠"
      },
      {
        duration: "00:37",
        id: "focus-5",
        image: "https://gips1.baidu.com/it/u=4245554549,3004444901&fm=3028&app=3028&f=JPEG&fmt=auto&q=100&size=f780_664",
        slug: "haaland-song-highlight",
        title: "韩国队逆转功臣吴贤揆：赛前发烧到38度"
      },
      {
        duration: "06:57",
        id: "focus-6",
        image: "https://gips0.baidu.com/it/u=3074594233,3873578268&fm=3028&app=3028&f=JPEG&fmt=auto&q=100&size=f780_664",
        slug: "world-cup-hat-trick-records",
        title: "《詹前顾后》第1期：日本摩洛哥能否再爆冷"
      }
    ]
  },
  {
    id: "teams",
    label: "48队巡礼",
    items: [
      {
        duration: "00:41",
        id: "teams-1",
        image: "https://gips1.baidu.com/it/u=2474749557,2580811232&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f780_664",
        slug: "opening-match-preview",
        title: "墨西哥队巡礼：东道主迎来揭幕战"
      },
      {
        duration: "00:53",
        id: "teams-2",
        image: "https://gips1.baidu.com/it/u=2180998198,871578849&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f780_664",
        slug: "korea-vs-czech-preview",
        title: "韩国队巡礼：亚洲劲旅再冲淘汰赛"
      },
      {
        duration: "01:12",
        id: "teams-3",
        image: "https://gips1.baidu.com/it/u=3800703011,329851806&fm=3028&app=3028&f=PNG&fmt=auto&q=94&size=f780_664",
        slug: "training-ground-report",
        title: "法国队巡礼：卫冕热门阵容解析"
      },
      {
        duration: "01:36",
        id: "teams-4",
        image: "https://gips0.baidu.com/it/u=3074594233,3873578268&fm=3028&app=3028&f=JPEG&fmt=auto&q=100&size=f780_664",
        slug: "opening-day-highlights",
        title: "巴西队巡礼：桑巴军团剑指冠军"
      },
      {
        duration: "01:08",
        id: "teams-5",
        image: "https://gips1.baidu.com/it/u=4263244788,2722555532&fm=3028&app=3028&f=JPEG&fmt=auto&q=100&size=f780_664",
        slug: "first-weekend-focus",
        title: "英格兰队巡礼：三狮军团强势出征"
      },
      {
        duration: "01:25",
        id: "teams-6",
        image: "https://gips0.baidu.com/it/u=3074594233,3873578268&fm=3028&app=3028&f=JPEG&fmt=auto&q=100&size=f780_664",
        slug: "world-cup-hat-trick-records",
        title: "阿根廷队巡礼：卫冕冠军再度起航"
      }
    ]
  },
  {
    id: "stars",
    label: "星耀美加墨",
    items: [
      {
        duration: "01:39",
        id: "stars-1",
        image: "https://gips1.baidu.com/it/u=2474749557,2580811232&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f780_664",
        slug: "world-cup-hat-trick-records",
        title: "梅西美加墨前瞻：传奇仍是焦点"
      },
      {
        duration: "04:00",
        id: "stars-2",
        image: "https://gips0.baidu.com/it/u=3074594233,3873578268&fm=3028&app=3028&f=JPEG&fmt=auto&q=100&size=f780_664",
        slug: "world-cup-hat-trick-records",
        title: "世界杯历史最年轻与最年长帽子戏法"
      },
      {
        duration: "00:58",
        id: "stars-3",
        image: "https://gips1.baidu.com/it/u=4245554549,3004444901&fm=3028&app=3028&f=JPEG&fmt=auto&q=100&size=f780_664",
        slug: "haaland-song-highlight",
        title: "哈兰德之歌太洗脑了"
      },
      {
        duration: "02:16",
        id: "stars-4",
        image: "https://gips1.baidu.com/it/u=2180998198,871578849&fm=3028&app=3028&f=PNG&fmt=auto&q=100&size=f780_664",
        slug: "training-ground-report",
        title: "姆巴佩领衔群星冲击金靴"
      },
      {
        duration: "01:22",
        id: "stars-5",
        image: "https://gips1.baidu.com/it/u=3800703011,329851806&fm=3028&app=3028&f=PNG&fmt=auto&q=94&size=f780_664",
        slug: "opening-day-highlights",
        title: "新星闪耀：亚马尔开启世界杯之旅"
      },
      {
        duration: "01:48",
        id: "stars-6",
        image: "https://gips1.baidu.com/it/u=4263244788,2722555532&fm=3028&app=3028&f=JPEG&fmt=auto&q=100&size=f780_664",
        slug: "first-weekend-focus",
        title: "贝林厄姆领衔新一代核心"
      }
    ]
  }
] as const;

/** @deprecated 使用 videoSections */
export const videoTabs = videoSections;

function VideoCard({ item }: { item: VideoItem }) {
  return (
    <Link className="min-w-0" href={`/videos/${item.slug}`}>
      <div className="relative aspect-[1.55] overflow-hidden rounded-[7px] bg-ink">
        <Image alt={item.title} className="object-cover" fill sizes="130px" src={item.image} unoptimized />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/45 to-transparent" />
        <span className="font-display absolute bottom-1 right-1.5 text-[11px] font-semibold tabular-nums leading-none text-paper">
          {item.duration}
        </span>
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-paper/95 text-[#0B55D9]">
            <Play aria-hidden className="ml-0.5 h-3.5 w-3.5 fill-current" strokeWidth={3} />
          </span>
        </span>
      </div>
      <h3 className="mt-1.5 line-clamp-2 text-[13px] font-medium leading-[18px] text-paper/95">{item.title}</h3>
    </Link>
  );
}

function VideoSectionTitle({
  label,
  onPrev,
  onNext,
  page,
  totalPages
}: {
  label: string;
  onPrev?: () => void;
  onNext?: () => void;
  page?: number;
  totalPages?: number;
}) {
  const showPagination = totalPages !== undefined && totalPages > 1 && page !== undefined;

  return (
    <div className="flex items-center justify-between gap-3 px-5">
      <h2 className="text-[17px] font-bold tracking-[0.04em] text-[#BDFD38]">{label}</h2>
      {showPagination ? (
        <div className="flex items-center gap-1 text-sm font-medium text-paper/80">
          <button
            aria-label="上一页"
            className="flex h-7 w-7 items-center justify-center rounded-md transition enabled:hover:bg-paper/10 disabled:opacity-35"
            disabled={page <= 1}
            onClick={onPrev}
            type="button"
          >
            <ChevronLeft aria-hidden className="h-4 w-4" />
          </button>
          <span className="min-w-[2.5rem] text-center tabular-nums">{page}/{totalPages}</span>
          <button
            aria-label="下一页"
            className="flex h-7 w-7 items-center justify-center rounded-md transition enabled:hover:bg-paper/10 disabled:opacity-35"
            disabled={page >= totalPages}
            onClick={onNext}
            type="button"
          >
            <ChevronRight aria-hidden className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function PaginatedVideoSection({ section }: { section: VideoSection }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(section.items.length / VIDEOS_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = section.items.slice(
    (safePage - 1) * VIDEOS_PAGE_SIZE,
    safePage * VIDEOS_PAGE_SIZE
  );

  return (
    <section>
      <VideoSectionTitle
        label={section.label}
        onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
        onPrev={() => setPage((current) => Math.max(1, current - 1))}
        page={safePage}
        totalPages={totalPages}
      />
      <div className="mx-5 mt-3 grid grid-cols-3 gap-x-3 gap-y-4 sm:grid-cols-3">
        {pageItems.map((item) => (
          <VideoCard item={item} key={item.id} />
        ))}
      </div>
    </section>
  );
}

export function VideoBoard({
  sections = videoSections,
  variant = "tabs"
}: {
  sections?: VideoSection[];
  variant?: "tabs" | "sections";
}) {
  const [activeTabId, setActiveTabId] = useState(sections[0]?.id ?? videoSections[0].id);
  const activeTab = sections.find((tab) => tab.id === activeTabId) ?? sections[0] ?? videoSections[0];

  if (variant === "sections") {
    return (
      <div className="space-y-6 pb-2">
        {sections.map((section, sectionIndex) => (
          <div key={section.id}>
            <PaginatedVideoSection section={section} />
            {sectionIndex < sections.length - 1 ? (
              <div className="mx-5 mt-6 border-t border-paper/10" />
            ) : null}
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <ModuleNavShell className="grid grid-cols-3 text-center">
        {sections.map((tab) => (
          <button
            aria-pressed={activeTabId === tab.id}
            className={`whitespace-nowrap py-2.5 transition ${moduleTabClass(activeTabId === tab.id)}`}
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </ModuleNavShell>

      <div className="mx-5 mt-4 grid grid-cols-3 gap-x-4 gap-y-4">
        {activeTab.items.map((item) => (
          <VideoCard item={item} key={item.id} />
        ))}
      </div>
    </>
  );
}
