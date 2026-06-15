"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { BackLink } from "@/components/back-link";
import { OpenExternalLink } from "@/components/open-external-link";
import { moduleSurfaceClass } from "@/lib/page-theme";
import type { ScheduleMatchPreview } from "@/lib/schedule-preview-service";

function TeamLogo({ logoUrl, name }: { logoUrl: string | null; name: string }) {
  if (!logoUrl) {
    return (
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-paper/14 text-sm font-black">
        {name.slice(0, 1)}
      </span>
    );
  }

  return (
    <span className="relative h-12 w-12 overflow-hidden rounded-full bg-paper/12">
      <Image alt={`${name}队旗`} className="object-cover" fill sizes="48px" src={logoUrl} />
    </span>
  );
}

function IntroSection({ paragraphs, title }: { paragraphs: string[]; title: string }) {
  if (paragraphs.length === 0) {
    return null;
  }

  return (
    <section className={`rounded-[14px] px-4 py-4 ${moduleSurfaceClass}`}>
      <h2 className="text-[17px] font-black tracking-wide text-[#BDFD38]">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-[1.8] text-paper/82">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}

export function SchedulePreviewView({ preview }: { preview: ScheduleMatchPreview }) {
  const hasContent =
    preview.summary.trim().length > 0 ||
    preview.homeIntro.length > 0 ||
    preview.awayIntro.length > 0;

  return (
    <main className="min-h-dvh pb-2 text-paper">
      <BackLink fallbackHref="/schedule">
        返回全部赛程
      </BackLink>

      <article className="space-y-4">
        <section className={`rounded-[14px] px-4 py-5 ${moduleSurfaceClass}`}>
          <p className="text-center text-xs font-black tracking-wide text-[#BDFD38]">{preview.matchStage}</p>
          <p className="mt-1 text-center text-xs font-medium text-paper/62">{preview.kickLabel}</p>

          <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className="min-w-0 text-center">
              <div className="flex justify-center">
                <TeamLogo logoUrl={preview.homeLogoUrl} name={preview.homeName} />
              </div>
              <h1 className="mt-2 truncate text-base font-black">{preview.homeName}</h1>
            </div>

            <div className="font-display text-center">
              <p className="text-2xl font-black leading-none text-paper/55">VS</p>
              <p className="mt-2 rounded-full bg-paper/12 px-3 py-1 text-xs font-bold text-[#BDFD38]">未开赛</p>
            </div>

            <div className="min-w-0 text-center">
              <div className="flex justify-center">
                <TeamLogo logoUrl={preview.awayLogoUrl} name={preview.awayName} />
              </div>
              <h2 className="mt-2 truncate text-base font-black">{preview.awayName}</h2>
            </div>
          </div>
        </section>

        {preview.summary ? (
          <section className={`rounded-[14px] px-4 py-4 ${moduleSurfaceClass}`}>
            <h2 className="text-[17px] font-black tracking-wide text-[#BDFD38]">赛前看点</h2>
            <p className="mt-3 text-[15px] leading-[1.8] text-paper/82">{preview.summary}</p>
          </section>
        ) : null}

        <IntroSection paragraphs={preview.homeIntro} title={`${preview.homeName}近况`} />
        <IntroSection paragraphs={preview.awayIntro} title={`${preview.awayName}近况`} />

        {!hasContent ? (
          <section className={`rounded-[14px] px-4 py-4 ${moduleSurfaceClass}`}>
            <p className="text-[15px] leading-7 text-paper/72">赛前介绍内容准备中，可前往百度搜索查看更多球队信息。</p>
          </section>
        ) : null}

        <section className={`rounded-[14px] px-4 py-4 ${moduleSurfaceClass}`}>
          <OpenExternalLink
            className="inline-flex min-h-[40px] items-center gap-2 text-sm font-bold text-[#BDFD38] transition hover:text-paper"
            href={preview.baiduSearchUrl}
          >
            <ExternalLink aria-hidden className="h-4 w-4 shrink-0" />
            在百度搜索更多赛前信息
          </OpenExternalLink>
          <p className="mt-2 text-xs text-paper/50">内容来源：百度搜索，仅供赛前参考</p>
        </section>
      </article>
    </main>
  );
}
