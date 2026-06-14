"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { ScheduleMatchRow } from "@/components/schedule-match-row";
import { MODULE_NAV_ARROW, ModuleNavShell, moduleTabClass } from "@/components/module-nav";
import type { ScheduleDay, ScheduleMatch, TeamRef } from "@/lib/schedule-data";

export type { ScheduleMatch, ScheduleDay, TeamRef };

function visibleDays(days: ScheduleDay[], activeDayIndex: number) {
  if (activeDayIndex === 0) {
    return days.slice(0, 3);
  }
  if (activeDayIndex >= days.length - 2) {
    return days.slice(-3);
  }
  return days.slice(activeDayIndex - 1, activeDayIndex + 2);
}

function getDefaultDayIndex(days: ScheduleDay[]) {
  const preferredIndex = days.findIndex((day) => day.id === "06-14");
  return preferredIndex >= 0 ? preferredIndex : 0;
}

export function ScheduleBoard({ scheduleDays }: { scheduleDays: ScheduleDay[] }) {
  const defaultDayIndex = getDefaultDayIndex(scheduleDays);
  const [activeDayIndex, setActiveDayIndex] = useState(defaultDayIndex);
  const activeDay = scheduleDays[activeDayIndex];
  const currentVisibleDays = useMemo(
    () => visibleDays(scheduleDays, activeDayIndex),
    [activeDayIndex, scheduleDays]
  );

  if (!activeDay) {
    return <p className="py-8 text-center text-sm text-paper/55">暂时没有更新，休息一下吧</p>;
  }

  function switchDay(nextIndex: number) {
    setActiveDayIndex(Math.max(0, Math.min(scheduleDays.length - 1, nextIndex)));
  }

  return (
    <>
      <ModuleNavShell className="grid grid-cols-[24px_1fr_1fr_1fr_24px] text-center">
        <button
          aria-label="前一比赛日"
          className={`flex items-center justify-center ${MODULE_NAV_ARROW}`}
          disabled={activeDayIndex === 0}
          onClick={() => switchDay(activeDayIndex - 1)}
          type="button"
        >
          <ChevronLeft aria-hidden className="h-4 w-4" strokeWidth={3} />
        </button>
        {currentVisibleDays.map((day) => (
          <button
            aria-pressed={activeDay.id === day.id}
            className={`whitespace-nowrap py-2.5 transition ${moduleTabClass(activeDay.id === day.id)}`}
            key={day.id}
            onClick={() => setActiveDayIndex(scheduleDays.findIndex((item) => item.id === day.id))}
            type="button"
          >
            {day.label}
          </button>
        ))}
        <button
          aria-label="后一比赛日"
          className={`flex items-center justify-center ${MODULE_NAV_ARROW}`}
          disabled={activeDayIndex === scheduleDays.length - 1}
          onClick={() => switchDay(activeDayIndex + 1)}
          type="button"
        >
          <ChevronRight aria-hidden className="h-4 w-4" strokeWidth={3} />
        </button>
      </ModuleNavShell>

      <div className="mx-5 mt-4 space-y-4">
        {activeDay.matches.map((match) => (
          <ScheduleMatchRow
            dayId={activeDay.id}
            href={`/schedule/${match.slug}`}
            key={match.id}
            match={match}
          />
        ))}
      </div>
    </>
  );
}
