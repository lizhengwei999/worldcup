"use client";

import Image from "next/image";
import Link from "next/link";
import { Shield } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ScheduleMatch, TeamRef } from "@/lib/schedule-data";
import { MIGU_LIVE_HOME_URL, resolveScheduleMatchDisplay } from "@/lib/schedule-match-display";
import { standingRowSurface } from "@/lib/standing-ui";

/** 时间/轮次列需容纳「小组赛J组第3轮」等文案，避免队旗列重叠 */
export const scheduleMatchGridClass =
  "grid min-h-[54px] grid-cols-[6.75rem_minmax(0,1fr)_1.25rem_minmax(3.25rem,auto)] items-start gap-x-3";

function TeamFlag({ team }: { team: TeamRef }) {
  if (!team.flag) {
    return <Shield aria-hidden className="h-3.5 w-5 shrink-0 fill-paper/85 text-paper/85" strokeWidth={2.5} />;
  }

  return (
    <span className="relative h-3 w-5 shrink-0 overflow-hidden">
      <Image alt={`${team.name}队旗`} className="object-cover" fill sizes="20px" src={team.flag} />
    </span>
  );
}

export function ScheduleMatchRow({
  className = "",
  dayId,
  href,
  index,
  match
}: {
  className?: string;
  dayId: string;
  href: string;
  index?: number;
  match: ScheduleMatch;
}) {
  const [now, setNow] = useState(() => new Date());
  const rowSurface = index !== undefined ? standingRowSurface(index) : "";
  const display = useMemo(() => resolveScheduleMatchDisplay(match, dayId, now), [dayId, match, now]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const homeScore = match.homeScore && match.homeScore !== "-" ? match.homeScore : "—";
  const awayScore = match.awayScore && match.awayScore !== "-" ? match.awayScore : "—";
  const rowHref = display.isLive ? MIGU_LIVE_HOME_URL : href;

  return (
    <Link
      className={`${scheduleMatchGridClass} text-paper transition hover:bg-paper/12 ${rowSurface} ${className}`.trim()}
      href={rowHref}
      rel={display.isLive ? "noopener noreferrer" : undefined}
      target={display.isLive ? "_blank" : undefined}
    >
      <div className="w-[6.75rem] shrink-0">
        <p className="font-display text-lg font-bold leading-none tabular-nums tracking-wide">{match.time}</p>
        <p className="mt-1.5 text-xs font-medium leading-snug text-paper/45">{match.group}</p>
      </div>

      <div className="min-w-0 space-y-1.5 text-sm font-medium leading-5">
        <div className="flex min-w-0 items-center gap-2">
          <TeamFlag team={match.home} />
          <span className="truncate">{match.home.name}</span>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <TeamFlag team={match.away} />
          <span className="truncate">{match.away.name}</span>
        </div>
      </div>

      <div className="font-display space-y-1.5 text-center text-sm font-semibold tabular-nums leading-5 text-paper/55">
        <p>{homeScore}</p>
        <p>{awayScore}</p>
      </div>

      <div className="space-y-1.5 text-right text-sm font-medium leading-5 text-paper/85">
        <p>{display.statusLabel}</p>
        <p className="text-xs text-paper/78">{display.liveLabel}</p>
      </div>
    </Link>
  );
}
