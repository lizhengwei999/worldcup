import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, ExternalLink, Link2 } from "lucide-react";
import { BaiduLink } from "@/components/baidu-link";
import {
  allNewsItems,
  getBaiduUrlForTitle,
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
  const item = getDetailItem(section, slug);

  if (!item) {
    notFound();
  }

  const sectionInfo = sections.find((entry) => entry.key === item.section);
  const relatedItems = getRelatedItems(item.id);
  const onTabBlueBackground =
    item.section === "videos" || item.section === "schedule" || item.section === "standings";

  return (
    <main>
      <Link
        className={`mb-5 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold transition ${
          onTabBlueBackground
            ? "border-paper/22 text-paper/82 hover:border-paper/40 hover:text-paper"
            : "border-ink/15 text-ink/72 hover:border-pitch hover:text-pitch"
        }`}
        href={sectionInfo?.href ?? "/"}
      >
        <ArrowLeft aria-hidden className="h-4 w-4" />
        返回{sectionInfo?.title ?? "首页"}
      </Link>

      <article className="overflow-hidden rounded-lg border border-ink/10 bg-paper shadow-score">
        <div className="relative min-h-[300px] bg-ink text-paper md:min-h-[420px]">
          <Image
            alt={item.title}
            className="object-cover opacity-72"
            fill
            priority
            sizes="(min-width: 768px) 960px, 100vw"
            src={item.image}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/45 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-trophy">
              {item.eyebrow}
            </p>
            <h1 className="mt-3 max-w-4xl font-serifcn text-3xl font-black leading-tight md:text-5xl">
              {item.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-paper/74">
              <span className="inline-flex items-center gap-2">
                <CalendarDays aria-hidden className="h-4 w-4 text-trophy" />
                {item.publishedAt}
              </span>
              <span>{item.source}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-8 p-5 md:grid-cols-[1fr_300px] md:p-8">
          <div>
            <p className="border-l-4 border-alert pl-4 text-lg font-bold leading-8 text-ink/80">
              {item.summary}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <Link
                  className="rounded-lg border border-ink/12 px-3 py-1 text-xs font-bold text-ink/70 transition hover:border-pitch hover:text-pitch"
                  href={getBaiduUrlForTitle(`美加墨世界杯 ${tag}`)}
                  key={tag}
                  target="_blank"
                >
                  {tag}
                </Link>
              ))}
            </div>
            <div className="mt-8 space-y-5 text-base leading-8 text-ink/76">
              {item.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <BaiduLink title={item.title} />
              <Link
                className="inline-flex items-center gap-2 rounded-lg border border-ink/15 px-4 py-3 text-sm font-bold text-ink transition hover:border-pitch hover:text-pitch"
                href={getBaiduUrlForTitle(item.title)}
                target="_blank"
              >
                <Link2 aria-hidden className="h-4 w-4" />
                标题检索链接
              </Link>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-lg bg-ink p-5 text-paper">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-trophy">
                Dynamic Template
              </p>
              <h2 className="mt-2 font-serifcn text-2xl font-black">百度式详情承接</h2>
              <p className="mt-3 text-sm leading-6 text-paper/70">
                标题、摘要、正文和标签来自同一数据模型；外部按钮根据标题自动生成百度动态结果链接。
              </p>
            </div>

            <div className="rounded-lg border border-ink/10 p-5">
              <h2 className="font-serifcn text-xl font-black">相关内容</h2>
              <div className="mt-3 space-y-3">
                {relatedItems.map((related) => (
                  <Link
                    className="block rounded-lg border border-ink/10 p-3 transition hover:border-pitch hover:text-pitch"
                    href={`/${related.section}/${related.slug}`}
                    key={related.id}
                  >
                    <p className="text-xs font-black text-alert">{related.eyebrow}</p>
                    <h3 className="mt-1 text-sm font-black leading-5">{related.title}</h3>
                  </Link>
                ))}
              </div>
            </div>

            <Link
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-pitch px-4 py-3 text-sm font-black text-paper transition hover:bg-ink"
              href={getBaiduUrlForTitle(item.title)}
              target="_blank"
            >
              <ExternalLink aria-hidden className="h-4 w-4" />
              前往百度看实时内容
            </Link>
          </aside>
        </div>
      </article>
    </main>
  );
}
