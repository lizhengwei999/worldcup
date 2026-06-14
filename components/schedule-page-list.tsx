"use client";

import { useEffect, useMemo, useState } from "react";
import { ScheduleMatchRow } from "@/components/schedule-match-row";
import { StandingListPagination } from "@/components/standing-list-pagination";
import { getScheduleCountryNames, type ScheduleDay } from "@/lib/schedule-data";
import {
  filterScheduleDays,
  flattenScheduleDays,
  getSchedulePageForDay,
  getScheduleTodayDayId,
  groupScheduleEntries,
  SCHEDULE_ALL_COUNTRIES,
  SCHEDULE_ALL_TIME,
  SCHEDULE_PAGE_SIZE
} from "@/lib/schedule-filters";
import { moduleNavShellClass } from "@/lib/page-theme";

const filterSelectClass =
  "relative z-10 w-full cursor-pointer appearance-none rounded-[6px] border border-white/12 bg-[#1A5CC8]/35 py-2 pl-3 pr-8 text-sm text-paper/85 outline-none focus:border-white/25";

export function SchedulePageList({ scheduleDays }: { scheduleDays: ScheduleDay[] }) {
  const [timeFilter, setTimeFilter] = useState(SCHEDULE_ALL_TIME);
  const [countryFilter, setCountryFilter] = useState(SCHEDULE_ALL_COUNTRIES);
  const countryOptions = useMemo(() => getScheduleCountryNames(scheduleDays), [scheduleDays]);

  const isFiltering =
    timeFilter !== SCHEDULE_ALL_TIME || countryFilter !== SCHEDULE_ALL_COUNTRIES;

  const visibleDays = useMemo(
    () =>
      filterScheduleDays({
        countryFilter,
        days: scheduleDays,
        timeFilter
      }),
    [countryFilter, scheduleDays, timeFilter]
  );

  const flatEntries = useMemo(() => flattenScheduleDays(visibleDays), [visibleDays]);
  const todayDayId = useMemo(() => getScheduleTodayDayId(scheduleDays), [scheduleDays]);
  const totalPages = Math.max(1, Math.ceil(flatEntries.length / SCHEDULE_PAGE_SIZE));
  const [page, setPage] = useState(() => {
    const entries = flattenScheduleDays(
      filterScheduleDays({
        countryFilter: SCHEDULE_ALL_COUNTRIES,
        days: scheduleDays,
        timeFilter: SCHEDULE_ALL_TIME
      })
    );

    return getSchedulePageForDay(entries, getScheduleTodayDayId(scheduleDays));
  });
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (isFiltering) {
      setPage(1);
      return;
    }

    setPage(getSchedulePageForDay(flatEntries, todayDayId));
  }, [flatEntries, isFiltering, todayDayId]);

  const pageGroups = useMemo(() => {
    const pageEntries = flatEntries.slice(
      (safePage - 1) * SCHEDULE_PAGE_SIZE,
      safePage * SCHEDULE_PAGE_SIZE
    );

    return groupScheduleEntries(pageEntries);
  }, [flatEntries, safePage]);

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

      {flatEntries.length === 0 ? (
        <p className="py-16 text-center text-sm text-paper/45">
          {isFiltering ? "未找到相关比赛" : "暂时没有更新，休息一下吧"}
        </p>
      ) : (
        <div key={`${timeFilter}-${countryFilter}-${safePage}`}>
          {pageGroups.map((group) => (
            <section className="mt-3" key={group.day.id}>
              <div className="bg-black/[0.09] ring-1 ring-inset ring-paper/8">
                <div className="flex items-center justify-between px-5 py-2.5 text-sm">
                  <span className="font-medium text-paper/85">{group.day.label}</span>
                  <span className="text-paper/55">{group.day.matches.length}场比赛</span>
                </div>
              </div>

              <div className="space-y-0.5">
                {group.matches.map((match, index) => (
                  <ScheduleMatchRow
                    className="px-5 py-3.5"
                    dayId={group.day.id}
                    href={`/schedule/${match.slug}`}
                    index={index}
                    key={match.id}
                    match={match}
                  />
                ))}
              </div>
            </section>
          ))}

          <StandingListPagination
            page={safePage}
            totalPages={totalPages}
            onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
            onPrev={() => setPage((current) => Math.max(1, current - 1))}
          />
        </div>
      )}
    </div>
  );
}
