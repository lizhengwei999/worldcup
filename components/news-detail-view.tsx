import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ExternalLink, Link2, Play } from "lucide-react";
import { BackLink } from "@/components/back-link";
import { BaiduLink } from "@/components/baidu-link";
import { OpenExternalLink } from "@/components/open-external-link";
import { moduleSurfaceClass } from "@/lib/page-theme";
import type { NewsItem } from "@/lib/worldcup-data";
import { getBaiduUrlForTitle } from "@/lib/worldcup-data";

type SectionInfo = {
  href: string;
  title: string;
};

const knownVideoLandingUrls = [
  {
    pattern: /美国4比1巴拉圭/,
    url: "https://mbd.baidu.com/newspage/data/videolanding?nid=sv_12500629894297826336&sourceFrom=share"
  }
];

function getVideoPlaybackUrl(item: NewsItem) {
  const knownUrl = knownVideoLandingUrls.find(({ pattern }) =>
    pattern.test(`${item.title} ${item.summary}`)
  )?.url;

  return item.videoUrl ?? knownUrl ?? item.externalUrl ?? getBaiduUrlForTitle(`${item.title} 视频`);
}

export function NewsDetailView({
  item,
  relatedItems,
  sectionInfo
}: {
  item: NewsItem;
  relatedItems: NewsItem[];
  sectionInfo?: SectionInfo;
}) {
  const isVideo = item.section === "videos" || item.contentType === "video";
  const videoPlaybackUrl = isVideo ? getVideoPlaybackUrl(item) : null;

  return (
    <main className="min-h-dvh pb-2 text-paper">
      <BackLink fallbackHref={sectionInfo?.href ?? "/"}>
        返回{sectionInfo?.title ?? "首页"}
      </BackLink>

      <article className="space-y-4">
        <header
          className="relative overflow-hidden rounded-[14px] shadow-[0_10px_28px_rgba(0,35,120,0.28)] ring-1 ring-inset ring-paper/14"
        >
          <div className="relative aspect-[16/10] w-full min-h-[11rem] bg-ink/40">
            <Image
              alt={item.title}
              className="object-cover"
              fill
              priority
              sizes="(max-width: 430px) 100vw, 430px"
              src={item.image}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B55D9]/95 via-[#0B55D9]/35 to-transparent" />
          </div>
          <div className="relative px-4 pb-4 pt-1">
            <p className="text-xs font-black tracking-wide text-[#BDFD38]">{item.eyebrow}</p>
            <h1 className="mt-2 font-serifcn text-[22px] font-black leading-snug tracking-tight sm:text-2xl">
              {item.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-paper/68">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays aria-hidden className="h-3.5 w-3.5 text-[#BDFD38]" />
                {item.publishedAt}
              </span>
              <span className="text-paper/45">·</span>
              <span>{item.source}</span>
            </div>
          </div>
        </header>

        <section className={`rounded-[14px] px-4 py-5 sm:px-5 ${moduleSurfaceClass}`}>
          <p className="border-l-[3px] border-[#BDFD38] pl-4 text-[15px] font-medium leading-7 text-paper/92">
            {item.summary}
          </p>

          {item.tags.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <OpenExternalLink
                  className="rounded-md border border-paper/18 bg-paper/8 px-2.5 py-1 text-xs font-bold text-paper/78 transition hover:border-[#BDFD38]/40 hover:text-[#BDFD38]"
                  href={getBaiduUrlForTitle(`美加墨世界杯 ${tag}`)}
                  key={tag}
                >
                  {tag}
                </OpenExternalLink>
              ))}
            </div>
          ) : null}

          {videoPlaybackUrl ? (
            <OpenExternalLink
              className="group mt-6 block overflow-hidden rounded-[14px] bg-ink/35 shadow-[0_12px_30px_rgba(0,24,96,0.25)] ring-1 ring-inset ring-paper/14"
              href={videoPlaybackUrl}
            >
              <div className="relative aspect-video min-h-[11rem] w-full">
                <Image
                  alt={`${item.title}视频封面`}
                  className="object-cover transition duration-300 group-hover:scale-[1.03]"
                  fill
                  sizes="(max-width: 430px) 100vw, 430px"
                  src={item.image}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#062A76]/85 via-[#062A76]/18 to-transparent" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#BDFD38] text-[#0B55D9] shadow-[0_10px_24px_rgba(0,0,0,0.28)] transition group-hover:scale-105">
                    <Play aria-hidden className="ml-1 h-7 w-7 fill-current" strokeWidth={3} />
                  </span>
                </span>
                <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-paper/95 px-3 py-1.5 text-xs font-black text-[#0B55D9]">
                  <Play aria-hidden className="h-3.5 w-3.5 fill-current" strokeWidth={3} />
                  播放视频
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <p className="min-w-0 text-sm font-bold leading-snug text-paper/92">
                  {item.title}
                </p>
                <ExternalLink aria-hidden className="h-4 w-4 shrink-0 text-[#BDFD38]" />
              </div>
            </OpenExternalLink>
          ) : null}

          <div className="mt-6 space-y-4 text-[15px] leading-[1.8] text-paper/84">
            {item.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {videoPlaybackUrl ? (
              <OpenExternalLink
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#BDFD38] px-4 py-3 text-sm font-black text-[#0B55D9] transition hover:bg-paper"
                href={videoPlaybackUrl}
              >
                <Play aria-hidden className="h-4 w-4 fill-current" strokeWidth={3} />
                打开视频播放页（新标签页）
              </OpenExternalLink>
            ) : (
              <BaiduLink title={item.title} variant="onBlue" />
            )}
            <OpenExternalLink
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-paper/22 bg-paper/8 px-4 py-3 text-sm font-bold text-paper/88 transition hover:border-paper/40 hover:bg-paper/12"
              href={getBaiduUrlForTitle(item.title)}
            >
              <Link2 aria-hidden className="h-4 w-4 shrink-0" />
              标题检索链接
            </OpenExternalLink>
            <OpenExternalLink
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-paper/22 bg-paper/8 px-4 py-3 text-sm font-bold text-paper/88 transition hover:border-paper/40 hover:bg-paper/12 sm:flex-1"
              href={getBaiduUrlForTitle(item.title)}
            >
              <ExternalLink aria-hidden className="h-4 w-4 shrink-0" />
              前往百度看实时内容
            </OpenExternalLink>
          </div>
        </section>

        {relatedItems.length > 0 ? (
          <section className={`rounded-[14px] px-4 py-5 sm:px-5 ${moduleSurfaceClass}`}>
            <h2 className="text-[17px] font-bold tracking-wide text-paper">相关内容</h2>
            <ul className="mt-4 space-y-2">
              {relatedItems.map((related) => (
                <li key={related.id}>
                  <Link
                    className="block rounded-[10px] bg-black/10 px-4 py-3 ring-1 ring-inset ring-paper/10 transition hover:bg-paper/10"
                    href={`/${related.section}/${related.slug}`}
                  >
                    <p className="text-xs font-bold text-[#BDFD38]">{related.eyebrow}</p>
                    <h3 className="mt-1 text-sm font-bold leading-snug text-paper">{related.title}</h3>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </article>
    </main>
  );
}
