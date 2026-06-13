import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, MapPin } from "lucide-react";
import { moduleSurfaceClass } from "@/lib/page-theme";
import type { ScheduleMatchDetail } from "@/lib/schedule-service";

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

function scoreText(value: string | null) {
  return value && value !== "-" ? value : "0";
}

function getIncidentIcon(iconType: string) {
  if (/进球/.test(iconType)) {
    return "⚽";
  }
  if (/射正/.test(iconType)) {
    return "◉";
  }
  if (/射偏/.test(iconType)) {
    return "🎯";
  }
  if (/黄牌/.test(iconType)) {
    return "▰";
  }
  if (/红牌/.test(iconType)) {
    return "▰";
  }
  if (/换人/.test(iconType)) {
    return "↕";
  }
  if (/角球/.test(iconType)) {
    return "◢";
  }
  if (/VAR/.test(iconType)) {
    return "▣";
  }
  if (/结束/.test(iconType)) {
    return "●";
  }

  return "•";
}

function getIncidentTone(iconType: string) {
  if (/红牌/.test(iconType)) {
    return "text-[#FF3B30]";
  }
  if (/黄牌/.test(iconType)) {
    return "text-[#FFB12B]";
  }
  if (/换人/.test(iconType)) {
    return "text-[#32D27D]";
  }
  if (/进球|结束/.test(iconType)) {
    return "text-[#BDFD38]";
  }
  if (/VAR/.test(iconType)) {
    return "text-[#FF6B7A]";
  }

  return "text-paper/72";
}

function cleanIncidentWord(word: string) {
  return word.replace(/^\d+(?:\+\d+)?'\s*-\s*/, "").trim();
}

function IncidentCard({
  align,
  iconType,
  word
}: {
  align: "left" | "right";
  iconType: string;
  word: string;
}) {
  return (
    <div
      className={`rounded-[10px] bg-paper/[0.07] px-3 py-2 text-sm font-bold leading-5 ring-1 ring-inset ring-paper/8 ${
        align === "left" ? "text-right" : "text-left"
      }`}
    >
      <span className={`mr-1.5 inline-block font-black ${getIncidentTone(iconType)}`}>
        {getIncidentIcon(iconType)}
      </span>
      {cleanIncidentWord(word)}
    </div>
  );
}

const incidentLegend = [
  ["⚽", "进球"],
  ["◉", "射正"],
  ["🎯", "射偏"],
  ["◢", "角球"],
  ["▰", "黄牌"],
  ["▰", "红牌"],
  ["↕", "换人"],
  ["▣", "VAR"]
];

export function ScheduleDetailView({ detail }: { detail: ScheduleMatchDetail }) {
  const importantIncidents = detail.incidents.filter((item) =>
    /进球|红牌|黄牌|换人|结束/.test(item.iconType)
  );
  const visibleIncidents = (importantIncidents.length > 0 ? importantIncidents : detail.incidents).slice(0, 28);

  return (
    <main className="min-h-dvh pb-2 text-paper">
      <Link
        className="mb-4 inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-paper/22 px-3 py-2 text-sm font-bold text-paper/85 transition hover:border-paper/40 hover:text-paper"
        href="/schedule"
      >
        <ArrowLeft aria-hidden className="h-4 w-4 shrink-0" />
        返回全部赛程
      </Link>

      <article className="space-y-4">
        <section className={`rounded-[14px] px-4 py-5 ${moduleSurfaceClass}`}>
          <p className="text-center text-xs font-black tracking-wide text-[#BDFD38]">{detail.matchStage}</p>
          <p className="mt-1 text-center text-xs font-medium text-paper/62">{detail.kickLabel}</p>

          <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className="min-w-0 text-center">
              <div className="flex justify-center">
                <TeamLogo logoUrl={detail.homeLogoUrl} name={detail.homeName} />
              </div>
              <h1 className="mt-2 truncate text-base font-black">{detail.homeName}</h1>
              {detail.homeRankText ? <p className="mt-1 text-xs text-paper/55">{detail.homeRankText}</p> : null}
            </div>

            <div className="font-display text-center">
              <p className="text-[40px] font-black leading-none tabular-nums">
                {scoreText(detail.homeScore)}
                <span className="mx-2 text-paper/45">-</span>
                {scoreText(detail.awayScore)}
              </p>
              <p className="mt-2 rounded-full bg-paper/12 px-3 py-1 text-xs font-bold text-[#BDFD38]">
                {detail.statusText}
              </p>
            </div>

            <div className="min-w-0 text-center">
              <div className="flex justify-center">
                <TeamLogo logoUrl={detail.awayLogoUrl} name={detail.awayName} />
              </div>
              <h2 className="mt-2 truncate text-base font-black">{detail.awayName}</h2>
              {detail.awayRankText ? <p className="mt-1 text-xs text-paper/55">{detail.awayRankText}</p> : null}
            </div>
          </div>

          {detail.venue || detail.attendance ? (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-paper/68">
              <MapPin aria-hidden className="h-3.5 w-3.5 text-[#BDFD38]" />
              {detail.venue ? <span>{detail.venue}</span> : null}
              {detail.attendance ? <span>{detail.attendance}人</span> : null}
            </div>
          ) : null}
        </section>

        <section className={`rounded-[14px] px-4 py-5 ${moduleSurfaceClass}`}>
          <h2 className="text-[17px] font-black tracking-wide text-[#BDFD38]">赛事事件</h2>
          {visibleIncidents.length > 0 ? (
            <div className="relative mt-4 overflow-hidden rounded-[12px] bg-paper/[0.03] px-1 py-3">
              <div className="absolute left-1/2 top-3 h-[calc(100%-1.5rem)] w-px -translate-x-1/2 bg-[#5A7CFF]/75" />
              {visibleIncidents.map((item, index) => (
                <div
                  className="relative grid grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)] items-center gap-2 py-1.5"
                  key={`${item.time}-${item.word}-${index}`}
                >
                  <div>
                    {item.position === "1" ? (
                      <IncidentCard align="left" iconType={item.iconType} word={item.word} />
                    ) : null}
                  </div>

                  <div className="relative z-10 flex flex-col items-center gap-1">
                    {item.position === "0" && cleanIncidentWord(item.word) ? (
                      <span className="max-w-[5rem] text-center text-[11px] font-bold leading-4 text-[#BDFD38]">
                        {cleanIncidentWord(item.word)}
                      </span>
                    ) : null}
                    <span className="font-display inline-flex min-h-7 min-w-7 items-center justify-center rounded-full bg-[#5573FF] px-1.5 text-xs font-black tabular-nums text-paper shadow-[0_0_0_3px_rgba(24,96,210,0.8)]">
                      {item.time || "●"}
                    </span>
                  </div>

                  <div>
                    {item.position === "2" ? (
                      <IncidentCard align="right" iconType={item.iconType} word={item.word} />
                    ) : null}
                  </div>
                </div>
              ))}

              <div className="mt-4 border-t border-paper/10 pt-3">
                <div className="grid grid-cols-4 gap-x-2 gap-y-2 text-[11px] font-bold text-paper/70">
                  {incidentLegend.map(([icon, label]) => (
                    <span className="inline-flex items-center gap-1.5" key={label}>
                      <span className={getIncidentTone(label)}>{icon}</span>
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm font-medium text-paper/62">暂无赛事事件。</p>
          )}
        </section>

        {detail.sourceUrl ? (
          <Link
            className="flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-paper/22 bg-paper/8 px-4 py-3 text-sm font-bold text-paper/88 transition hover:border-paper/40 hover:bg-paper/12"
            href={detail.sourceUrl}
            target="_blank"
          >
            <ExternalLink aria-hidden className="h-4 w-4" />
            前往百度查看完整赛况
          </Link>
        ) : null}
      </article>
    </main>
  );
}
