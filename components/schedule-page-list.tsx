"use client";

import { ChevronUp } from "lucide-react";
import { useState } from "react";
import { ScheduleMatchRow } from "@/components/schedule-match-row";
import {
  getScheduleCountryNames,
  scheduleDays,
  schedulePageStartDayId
} from "@/lib/schedule-data";
import {
  filterScheduleDays,
  SCHEDULE_ALL_COUNTRIES,
  SCHEDULE_ALL_TIME
} from "@/lib/schedule-filters";
import { moduleNavShellClass } from "@/lib/page-theme";

const filterSelectClass =
  "relative z-10 w-full cursor-pointer appearance-none rounded-[6px] border border-white/12 bg-[#1A5CC8]/35 py-2 pl-3 pr-8 text-sm text-paper/85 outline-none focus:border-white/25";

const countryOptions = getScheduleCountryNames();

export function SchedulePageList() {
  const pageStartIndex = scheduleDays.findIndex((day) => day.id === schedulePageStartDayId);
  const [visibleFromIndex, setVisibleFromIndex] = useState(pageStartIndex >= 0 ? pageStartIndex : 0);
  const [timeFilter, setTimeFilter] = useState(SCHEDULE_ALL_TIME);
  const [countryFilter, setCountryFilter] = useState(SCHEDULE_ALL_COUNTRIES);

  const visibleDays = filterScheduleDays({
    countryFilter,
    timeFilter,
    visibleFromIndex
  });

  const isFiltering =
    timeFilter !== SCHEDULE_ALL_TIME || countryFilter !== SCHEDULE_ALL_COUNTRIES;
  const canShowEarlier =
    timeFilter === SCHEDULE_ALL_TIME &&
    countryFilter === SCHEDULE_ALL_COUNTRIES &&
    visibleFromIndex > 0;

  return (
    <div className="text-paper">
      <div className={`mx-5 flex gap-2 ${moduleNavShellClass}`}>
        <div className="relative flex-1">
          <select
            aria-label="选择时间"
            className={filterSelectClass}
            onChange={(event) => setTimeFilter(event.currentTarget.value)}
            value={timeFilter}
          >
            <option value={SCHEDULE_ALL_TIME}>全部时间</option>
            {scheduleDays.map((day) => (
              <option key={day.id} value={day.id}>{day.label}</option>
            ))}
          </select>
          <span
            aria-hidden
            className="pointer-events-none absolute right-2.5 top-1/2 z-0 -translate-y-1/2 text-[10px] text-paper/45"
          >
            ▼
          </span>
        </div>

        <div className="relative flex-1">
          <select
            aria-label="选择国家"
            className={filterSelectClass}
            onChange={(event) => setCountryFilter(event.currentTarget.value)}
            value={countryFilter}
          >
            <option value={SCHEDULE_ALL_COUNTRIES}>全部国家</option>
            {countryOptions.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <span
            aria-hidden
            className="pointer-events-none absolute right-2.5 top-1/2 z-0 -translate-y-1/2 text-[10px] text-paper/45"
          >
            ▼
          </span>
        </div>
      </div>

      {visibleDays.length === 0 ? (
        <p className="py-16 text-center text-sm text-paper/45">
          {isFiltering ? "未找到相关比赛" : "暂时没有更新，休息一下吧"}
        </p>
      ) : (
        <div key={`${timeFilter}-${countryFilter}-${visibleFromIndex}`}>
          {visibleDays.map((day, dayIndex) => (
            <section className="mt-3" key={day.id}>
              <div className="bg-black/[0.09] ring-1 ring-inset ring-paper/8">
                {dayIndex === 0 && canShowEarlier ? (
                  <button
                    className="flex w-full items-center justify-center gap-1 border-b border-paper/10 py-2 text-xs text-paper/55 transition hover:text-paper/75"
                    onClick={() => setVisibleFromIndex((index) => Math.max(0, index - 1))}
                    type="button"
                  >
                    更早比赛
                    <ChevronUp aria-hidden className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </button>
                ) : null}
                <div className="flex items-center justify-between px-5 py-2.5 text-sm">
                  <span className="font-medium text-paper/85">{day.label}</span>
                  <span className="text-paper/55">{day.matches.length}场比赛</span>
                </div>
              </div>

              <div className="space-y-0.5">
                {day.matches.map((match, index) => (
                  <ScheduleMatchRow
                    className="px-5 py-3.5"
                    href={`/schedule/${match.slug}`}
                    index={index}
                    key={match.id}
                    match={match}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
