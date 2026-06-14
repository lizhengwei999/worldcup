import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { NewsDetailView } from "@/components/news-detail-view";
import { ScheduleDetailView } from "@/components/schedule-detail-view";
import { SchedulePreviewView } from "@/components/schedule-preview-view";
import { getNewsItemBySlug, getRelatedNewsItems } from "@/lib/content-service";
import { MIGU_LIVE_HOME_URL, resolveScheduleMatchDisplay } from "@/lib/schedule-match-display";
import {
  getScheduleMatchBySlug,
  getScheduleMatchPreviewBySlug
} from "@/lib/schedule-preview-service";
import { getScheduleMatchDetailBySlug } from "@/lib/schedule-service";
import { getStandingItemBySlug } from "@/lib/standings-service";
import {
  allNewsItems,
  getDetailItem,
  getRelatedItems,
  scheduleItems,
  sections,
  standingItems
} from "@/lib/worldcup-data";

type DetailPageProps = {
  params: Promise<{
    section: string;
    slug: string;
  }>;
};

export function generateStaticParams() {
  const newsParams = allNewsItems.map((item) => ({
    section: item.section,
    slug: item.slug
  }));
  const scheduleParams = scheduleItems.map((item) => ({
    section: "schedule",
    slug: item.slug
  }));
  const standingParams = standingItems.map((item) => ({
    section: "standings",
    slug: item.slug
  }));

  return [...newsParams, ...scheduleParams, ...standingParams];
}

export default async function DetailPage({ params }: DetailPageProps) {
  const { section, slug } = await params;

  if (section === "schedule") {
    const matchEntry = await getScheduleMatchBySlug(slug);
    const scheduleDetail = await getScheduleMatchDetailBySlug(slug);

    if (matchEntry) {
      const display = resolveScheduleMatchDisplay(matchEntry.match, matchEntry.dayId);

      if (display.isLive) {
        redirect(MIGU_LIVE_HOME_URL);
      }

      if (display.isFinished && scheduleDetail) {
        return <ScheduleDetailView detail={scheduleDetail} />;
      }

      if (display.isUpcoming) {
        const preview = await getScheduleMatchPreviewBySlug(slug);
        if (preview) {
          return <SchedulePreviewView preview={preview} />;
        }

        return (
          <SchedulePreviewView
            preview={{
              awayIntro: [],
              awayLogoUrl: matchEntry.match.away.flag ?? null,
              awayName: matchEntry.match.away.name,
              baiduSearchUrl: `https://www.baidu.com/s?ie=utf-8&wd=${encodeURIComponent(
                `${matchEntry.match.home.name} ${matchEntry.match.away.name} 世界杯`
              )}`,
              homeIntro: [],
              homeLogoUrl: matchEntry.match.home.flag ?? null,
              homeName: matchEntry.match.home.name,
              kickLabel: `${matchEntry.dayId} ${matchEntry.match.time}`,
              matchId: matchEntry.match.id,
              matchStage: matchEntry.match.group,
              slug,
              summary: ""
            }}
          />
        );
      }
    }

    if (scheduleDetail) {
      return <ScheduleDetailView detail={scheduleDetail} />;
    }
  }

  const isNewsSection = section === "headlines" || section === "videos";
  const item = isNewsSection
    ? await getNewsItemBySlug(section, slug)
    : section === "standings"
      ? await getStandingItemBySlug(slug)
      : getDetailItem(section, slug);

  if (!item) {
    notFound();
  }

  const sectionInfo = sections.find((entry) => entry.key === item.section);
  const relatedItems = isNewsSection ? await getRelatedNewsItems(item) : getRelatedItems(item.id);
  const isNewsDetail = item.section === "headlines" || item.section === "videos";

  if (isNewsDetail) {
    return (
      <NewsDetailView
        item={item}
        relatedItems={relatedItems}
        sectionInfo={sectionInfo ? { href: sectionInfo.href, title: sectionInfo.title } : undefined}
      />
    );
  }

  return (
    <main className="min-h-dvh pb-2 text-paper">
      <Link
        className="mb-4 inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-paper/22 px-3 py-2 text-sm font-bold text-paper/85 transition hover:border-paper/40 hover:text-paper"
        href={sectionInfo?.href ?? "/"}
      >
        <ArrowLeft aria-hidden className="h-4 w-4 shrink-0" />
        返回{sectionInfo?.title ?? "首页"}
      </Link>

      <article className="overflow-hidden rounded-[14px] bg-gradient-to-b from-[#1668D6] to-[#125AC4] p-5 shadow-[0_10px_28px_rgba(0,35,120,0.24)] ring-1 ring-inset ring-paper/12">
        <p className="text-xs font-black tracking-wide text-[#BDFD38]">{item.eyebrow}</p>
        <h1 className="mt-2 font-serifcn text-2xl font-black leading-snug text-paper">{item.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-paper/70">
          <CalendarDays aria-hidden className="h-4 w-4 text-[#BDFD38]" />
          <span>{item.publishedAt}</span>
          <span className="text-paper/40">·</span>
          <span>{item.source}</span>
        </div>
        <p className="mt-5 border-l-[3px] border-[#BDFD38] pl-4 text-[15px] leading-7 text-paper/88">
          {item.summary}
        </p>
        <div className="mt-5 space-y-4 text-[15px] leading-[1.8] text-paper/82">
          {item.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>
    </main>
  );
}
