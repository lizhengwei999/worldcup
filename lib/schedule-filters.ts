import type { ScheduleDay, ScheduleMatch } from "@/lib/schedule-data";

export const SCHEDULE_ALL_TIME = "all";
export const SCHEDULE_ALL_COUNTRIES = "all";
export const SCHEDULE_PAGE_SIZE = 4;

export type ScheduleFlatEntry = {
  day: ScheduleDay;
  match: ScheduleMatch;
};

export function matchIncludesTeam(match: ScheduleMatch, teamName: string) {
  return match.home.name === teamName || match.away.name === teamName;
}

export function getScheduleTodayDayId(days: ScheduleDay[]) {
  const byLabel = days.find((day) => day.label.includes("今天"));
  if (byLabel) {
    return byLabel.id;
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());

  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  const dayId = `${month}-${day}`;

  return days.find((entry) => entry.id === dayId)?.id;
}

export function flattenScheduleDays(days: ScheduleDay[]): ScheduleFlatEntry[] {
  return days.flatMap((day) => day.matches.map((match) => ({ day, match })));
}

export function getSchedulePageForDay(
  entries: ScheduleFlatEntry[],
  dayId?: string,
  pageSize = SCHEDULE_PAGE_SIZE
) {
  if (!dayId || entries.length === 0) {
    return 1;
  }

  const index = entries.findIndex((entry) => entry.day.id === dayId);
  if (index < 0) {
    return 1;
  }

  return Math.floor(index / pageSize) + 1;
}

export function filterScheduleDays({
  days: sourceDays,
  timeFilter,
  countryFilter
}: {
  days: ScheduleDay[];
  timeFilter: string;
  countryFilter: string;
}): ScheduleDay[] {
  const countryActive = countryFilter !== SCHEDULE_ALL_COUNTRIES;
  const timeActive = timeFilter !== SCHEDULE_ALL_TIME;

  let days: ScheduleDay[];

  if (timeActive) {
    days = sourceDays.filter((day) => day.id === timeFilter);
  } else {
    days = sourceDays;
  }

  if (countryActive) {
    days = days
      .map((day) => ({
        ...day,
        matches: day.matches.filter((match) => matchIncludesTeam(match, countryFilter))
      }))
      .filter((day) => day.matches.length > 0);
  }

  return days;
}

export function groupScheduleEntries(entries: ScheduleFlatEntry[]) {
  const groups: Array<{ day: ScheduleDay; matches: ScheduleMatch[] }> = [];

  entries.forEach((entry) => {
    const lastGroup = groups.at(-1);
    if (lastGroup?.day.id === entry.day.id) {
      lastGroup.matches.push(entry.match);
      return;
    }

    groups.push({ day: entry.day, matches: [entry.match] });
  });

  return groups;
}
