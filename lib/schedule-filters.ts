import type { ScheduleDay, ScheduleMatch } from "@/lib/schedule-data";

export const SCHEDULE_ALL_TIME = "all";
export const SCHEDULE_ALL_COUNTRIES = "all";

export function matchIncludesTeam(match: ScheduleMatch, teamName: string) {
  return match.home.name === teamName || match.away.name === teamName;
}

export function filterScheduleDays({
  days: sourceDays,
  timeFilter,
  countryFilter,
  visibleFromIndex
}: {
  days: ScheduleDay[];
  timeFilter: string;
  countryFilter: string;
  visibleFromIndex: number;
}): ScheduleDay[] {
  const countryActive = countryFilter !== SCHEDULE_ALL_COUNTRIES;
  const timeActive = timeFilter !== SCHEDULE_ALL_TIME;

  let days: ScheduleDay[];

  if (timeActive) {
    days = sourceDays.filter((day) => day.id === timeFilter);
  } else if (countryActive) {
    days = sourceDays;
  } else {
    days = sourceDays.slice(visibleFromIndex);
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
