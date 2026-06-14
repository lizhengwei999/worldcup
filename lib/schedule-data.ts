import { standingGroups } from "@/lib/worldcup-data";

export type TeamRef = {
  flag?: string;
  name: string;
};

export type ScheduleMatch = {
  away: TeamRef;
  awayScore?: string | null;
  group: string;
  home: TeamRef;
  homeScore?: string | null;
  id: string;
  liveLabel?: string;
  slug: string;
  status?: "upcoming";
  statusLabel?: string;
  time: string;
};

export type ScheduleDay = {
  id: string;
  label: string;
  matches: ScheduleMatch[];
};

type RoundKey = "round1" | "round2" | "round3";

const teamLookup = new Map(standingGroups.flatMap((group) => group.teams.map((team) => [team.team, team.logo])));

const groupTeams = Object.fromEntries(
  standingGroups.map((group) => [group.group, group.teams.map((team) => team.team)])
) as Record<string, string[]>;

const labels = {
  "06-12": "06-12/周五",
  "06-13": "06-13/周六",
  "06-14": "06-14/周日",
  "06-15": "06-15/周一",
  "06-16": "06-16/周二",
  "06-17": "06-17/周三",
  "06-18": "06-18/周四",
  "06-19": "06-19/周五",
  "06-20": "06-20/周六",
  "06-21": "06-21/周日",
  "06-22": "06-22/周一",
  "06-23": "06-23/周二",
  "06-24": "06-24/周三",
  "06-25": "06-25/周四",
  "06-26": "06-26/周五",
  "06-27": "06-27/周六",
  "06-28": "06-28/周日",
  "06-29": "06-29/周一",
  "06-30": "06-30/周二",
  "07-01": "07-01/周三",
  "07-02": "07-02/周四",
  "07-03": "07-03/周五",
  "07-04": "07-04/周六",
  "07-05": "07-05/周日",
  "07-06": "07-06/周一",
  "07-07": "07-07/周二",
  "07-08": "07-08/周三",
  "07-10": "07-10/周五",
  "07-11": "07-11/周六",
  "07-12": "07-12/周日",
  "07-15": "07-15/周三",
  "07-16": "07-16/周四",
  "07-19": "07-19/周日",
  "07-20": "07-20/周一"
} as const;

function team(name: string): TeamRef {
  return {
    flag: teamLookup.get(name),
    name
  };
}

function placeholder(name: string): TeamRef {
  return { name };
}

function matchup(group: string, round: RoundKey, pairIndex: 0 | 1): [string, string] {
  const teams = groupTeams[group];
  if (round === "round1") {
    return pairIndex === 0 ? [teams[0], teams[1]] : [teams[2], teams[3]];
  }
  if (round === "round2") {
    return pairIndex === 0 ? [teams[0], teams[2]] : [teams[3], teams[1]];
  }
  return pairIndex === 0 ? [teams[3], teams[0]] : [teams[1], teams[2]];
}

function groupMatch({
  date,
  group,
  index,
  pairIndex,
  round,
  time
}: {
  date: keyof typeof labels;
  group: string;
  index: number;
  pairIndex: 0 | 1;
  round: RoundKey;
  time: string;
}): ScheduleMatch {
  const [home, away] = matchup(group, round, pairIndex);
  return {
    away: team(away),
    group: `小组赛${group}第${round === "round1" ? 1 : round === "round2" ? 2 : 3}轮`,
    home: team(home),
    id: `${date}-${group}-${round}-${index}`,
    slug: index % 2 === 0 ? "first-weekend-focus" : "multi-city-matchday",
    time
  };
}

function knockoutMatch(date: keyof typeof labels, index: number, time: string, group: string): ScheduleMatch {
  return {
    away: placeholder(`第${index * 2}场胜者`),
    group,
    home: placeholder(`第${index * 2 - 1}场胜者`),
    id: `${date}-knockout-${index}`,
    slug: "knockout-path",
    time
  };
}

function makeDay(id: keyof typeof labels, matches: ScheduleMatch[]): ScheduleDay {
  return {
    id,
    label: labels[id],
    matches
  };
}

export const scheduleDays: ScheduleDay[] = [
  makeDay("06-12", [
    groupMatch({ date: "06-12", group: "A组", index: 1, pairIndex: 0, round: "round1", time: "03:00" }),
    groupMatch({ date: "06-12", group: "A组", index: 2, pairIndex: 1, round: "round1", time: "10:00" })
  ]),
  makeDay("06-13", [
    groupMatch({ date: "06-13", group: "B组", index: 1, pairIndex: 0, round: "round1", time: "03:00" }),
    groupMatch({ date: "06-13", group: "B组", index: 2, pairIndex: 1, round: "round1", time: "06:00" }),
    groupMatch({ date: "06-13", group: "D组", index: 3, pairIndex: 0, round: "round1", time: "09:00" }),
    groupMatch({ date: "06-13", group: "D组", index: 4, pairIndex: 1, round: "round1", time: "23:00" })
  ]),
  makeDay("06-14", [
    groupMatch({ date: "06-14", group: "C组", index: 1, pairIndex: 0, round: "round1", time: "03:00" }),
    groupMatch({ date: "06-14", group: "C组", index: 2, pairIndex: 1, round: "round1", time: "06:00" }),
    groupMatch({ date: "06-14", group: "E组", index: 3, pairIndex: 0, round: "round1", time: "09:00" }),
    groupMatch({ date: "06-14", group: "E组", index: 4, pairIndex: 1, round: "round1", time: "23:00" })
  ]),
  makeDay("06-15", [
    groupMatch({ date: "06-15", group: "F组", index: 1, pairIndex: 0, round: "round1", time: "03:00" }),
    groupMatch({ date: "06-15", group: "F组", index: 2, pairIndex: 1, round: "round1", time: "06:00" }),
    groupMatch({ date: "06-15", group: "G组", index: 3, pairIndex: 0, round: "round1", time: "09:00" }),
    groupMatch({ date: "06-15", group: "G组", index: 4, pairIndex: 1, round: "round1", time: "23:00" })
  ]),
  makeDay("06-16", [
    groupMatch({ date: "06-16", group: "H组", index: 1, pairIndex: 0, round: "round1", time: "03:00" }),
    groupMatch({ date: "06-16", group: "H组", index: 2, pairIndex: 1, round: "round1", time: "06:00" }),
    groupMatch({ date: "06-16", group: "I组", index: 3, pairIndex: 0, round: "round1", time: "09:00" }),
    groupMatch({ date: "06-16", group: "I组", index: 4, pairIndex: 1, round: "round1", time: "23:00" })
  ]),
  makeDay("06-17", [
    groupMatch({ date: "06-17", group: "J组", index: 1, pairIndex: 0, round: "round1", time: "03:00" }),
    groupMatch({ date: "06-17", group: "J组", index: 2, pairIndex: 1, round: "round1", time: "06:00" }),
    groupMatch({ date: "06-17", group: "K组", index: 3, pairIndex: 0, round: "round1", time: "09:00" }),
    groupMatch({ date: "06-17", group: "K组", index: 4, pairIndex: 1, round: "round1", time: "23:00" })
  ]),
  makeDay("06-18", [
    groupMatch({ date: "06-18", group: "L组", index: 1, pairIndex: 0, round: "round1", time: "03:00" }),
    groupMatch({ date: "06-18", group: "L组", index: 2, pairIndex: 1, round: "round1", time: "06:00" })
  ]),
  makeDay("06-19", [
    groupMatch({ date: "06-19", group: "A组", index: 1, pairIndex: 0, round: "round2", time: "03:00" }),
    groupMatch({ date: "06-19", group: "A组", index: 2, pairIndex: 1, round: "round2", time: "06:00" }),
    groupMatch({ date: "06-19", group: "B组", index: 3, pairIndex: 0, round: "round2", time: "09:00" }),
    groupMatch({ date: "06-19", group: "B组", index: 4, pairIndex: 1, round: "round2", time: "23:00" })
  ]),
  makeDay("06-20", [
    groupMatch({ date: "06-20", group: "C组", index: 1, pairIndex: 0, round: "round2", time: "03:00" }),
    groupMatch({ date: "06-20", group: "C组", index: 2, pairIndex: 1, round: "round2", time: "06:00" }),
    groupMatch({ date: "06-20", group: "D组", index: 3, pairIndex: 0, round: "round2", time: "09:00" }),
    groupMatch({ date: "06-20", group: "D组", index: 4, pairIndex: 1, round: "round2", time: "23:00" })
  ]),
  makeDay("06-21", [
    groupMatch({ date: "06-21", group: "E组", index: 1, pairIndex: 0, round: "round2", time: "03:00" }),
    groupMatch({ date: "06-21", group: "E组", index: 2, pairIndex: 1, round: "round2", time: "06:00" }),
    groupMatch({ date: "06-21", group: "F组", index: 3, pairIndex: 0, round: "round2", time: "09:00" }),
    groupMatch({ date: "06-21", group: "F组", index: 4, pairIndex: 1, round: "round2", time: "23:00" })
  ]),
  makeDay("06-22", [
    groupMatch({ date: "06-22", group: "G组", index: 1, pairIndex: 0, round: "round2", time: "03:00" }),
    groupMatch({ date: "06-22", group: "G组", index: 2, pairIndex: 1, round: "round2", time: "06:00" }),
    groupMatch({ date: "06-22", group: "H组", index: 3, pairIndex: 0, round: "round2", time: "09:00" }),
    groupMatch({ date: "06-22", group: "H组", index: 4, pairIndex: 1, round: "round2", time: "23:00" })
  ]),
  makeDay("06-23", [
    groupMatch({ date: "06-23", group: "I组", index: 1, pairIndex: 0, round: "round2", time: "03:00" }),
    groupMatch({ date: "06-23", group: "I组", index: 2, pairIndex: 1, round: "round2", time: "06:00" }),
    groupMatch({ date: "06-23", group: "J组", index: 3, pairIndex: 0, round: "round2", time: "09:00" }),
    groupMatch({ date: "06-23", group: "J组", index: 4, pairIndex: 1, round: "round2", time: "23:00" })
  ]),
  makeDay("06-24", [
    groupMatch({ date: "06-24", group: "K组", index: 1, pairIndex: 0, round: "round2", time: "01:00" }),
    groupMatch({ date: "06-24", group: "L组", index: 2, pairIndex: 0, round: "round2", time: "04:00" }),
    groupMatch({ date: "06-24", group: "L组", index: 3, pairIndex: 1, round: "round2", time: "07:00" }),
    groupMatch({ date: "06-24", group: "K组", index: 4, pairIndex: 1, round: "round2", time: "10:00" })
  ]),
  makeDay("06-25", [
    groupMatch({ date: "06-25", group: "A组", index: 1, pairIndex: 0, round: "round3", time: "01:00" }),
    groupMatch({ date: "06-25", group: "A组", index: 2, pairIndex: 1, round: "round3", time: "01:00" }),
    groupMatch({ date: "06-25", group: "B组", index: 3, pairIndex: 1, round: "round3", time: "03:00" }),
    groupMatch({ date: "06-25", group: "B组", index: 4, pairIndex: 0, round: "round3", time: "03:00" }),
    groupMatch({ date: "06-25", group: "C组", index: 5, pairIndex: 0, round: "round3", time: "06:00" }),
    groupMatch({ date: "06-25", group: "C组", index: 6, pairIndex: 1, round: "round3", time: "06:00" })
  ]),
  makeDay("06-26", [
    groupMatch({ date: "06-26", group: "D组", index: 1, pairIndex: 0, round: "round3", time: "01:00" }),
    groupMatch({ date: "06-26", group: "D组", index: 2, pairIndex: 1, round: "round3", time: "01:00" }),
    groupMatch({ date: "06-26", group: "E组", index: 3, pairIndex: 0, round: "round3", time: "04:00" }),
    groupMatch({ date: "06-26", group: "E组", index: 4, pairIndex: 1, round: "round3", time: "04:00" }),
    groupMatch({ date: "06-26", group: "F组", index: 5, pairIndex: 0, round: "round3", time: "07:00" }),
    groupMatch({ date: "06-26", group: "F组", index: 6, pairIndex: 1, round: "round3", time: "07:00" })
  ]),
  makeDay("06-27", [
    groupMatch({ date: "06-27", group: "G组", index: 1, pairIndex: 0, round: "round3", time: "01:00" }),
    groupMatch({ date: "06-27", group: "G组", index: 2, pairIndex: 1, round: "round3", time: "01:00" }),
    groupMatch({ date: "06-27", group: "I组", index: 3, pairIndex: 0, round: "round3", time: "03:00" }),
    groupMatch({ date: "06-27", group: "I组", index: 4, pairIndex: 1, round: "round3", time: "03:00" }),
    groupMatch({ date: "06-27", group: "H组", index: 5, pairIndex: 1, round: "round3", time: "08:00" }),
    groupMatch({ date: "06-27", group: "H组", index: 6, pairIndex: 0, round: "round3", time: "08:00" })
  ]),
  makeDay("06-28", [
    groupMatch({ date: "06-28", group: "J组", index: 1, pairIndex: 0, round: "round3", time: "01:00" }),
    groupMatch({ date: "06-28", group: "J组", index: 2, pairIndex: 1, round: "round3", time: "01:00" }),
    groupMatch({ date: "06-28", group: "K组", index: 3, pairIndex: 0, round: "round3", time: "04:00" }),
    groupMatch({ date: "06-28", group: "K组", index: 4, pairIndex: 1, round: "round3", time: "04:00" }),
    groupMatch({ date: "06-28", group: "L组", index: 5, pairIndex: 0, round: "round3", time: "07:00" }),
    groupMatch({ date: "06-28", group: "L组", index: 6, pairIndex: 1, round: "round3", time: "07:00" })
  ]),
  ...[
    ["06-29", 1, 3],
    ["06-30", 4, 3],
    ["07-01", 7, 3],
    ["07-02", 10, 3],
    ["07-03", 13, 2],
    ["07-04", 15, 2]
  ].map(([date, start, count]) =>
    makeDay(
      date as keyof typeof labels,
      Array.from({ length: count as number }, (_, index) =>
        knockoutMatch(
          date as keyof typeof labels,
          (start as number) + index,
          `${index % 2 === 0 ? "03" : index % 3 === 0 ? "10" : "07"}:00`,
          "1/16决赛"
        )
      )
    )
  ),
  ...[
    ["07-05", 1, 2],
    ["07-06", 3, 2],
    ["07-07", 5, 2],
    ["07-08", 7, 2]
  ].map(([date, start, count]) =>
    makeDay(
      date as keyof typeof labels,
      Array.from({ length: count as number }, (_, index) =>
        knockoutMatch(
          date as keyof typeof labels,
          (start as number) + index,
          index === 0 ? "03:00" : "07:00",
          "1/8决赛"
        )
      )
    )
  ),
  ...[
    ["07-10", 1, 2],
    ["07-11", 3, 1],
    ["07-12", 4, 1]
  ].map(([date, start, count]) =>
    makeDay(
      date as keyof typeof labels,
      Array.from({ length: count as number }, (_, index) =>
        knockoutMatch(
          date as keyof typeof labels,
          (start as number) + index,
          index === 0 ? "03:00" : "07:00",
          "1/4决赛"
        )
      )
    )
  ),
  makeDay("07-15", [knockoutMatch("07-15", 1, "08:00", "半决赛")]),
  makeDay("07-16", [knockoutMatch("07-16", 2, "03:00", "半决赛")]),
  makeDay("07-19", [knockoutMatch("07-19", 1, "03:00", "季军赛")]),
  makeDay("07-20", [
    {
      away: placeholder("第2场半决赛胜者"),
      group: "决赛",
      home: placeholder("第1场半决赛胜者"),
      id: "07-20-final",
      slug: "knockout-path",
      time: "03:00"
    }
  ])
];

export function getScheduleCountryNames(days = scheduleDays) {
  const names = new Set<string>();
  days.forEach((day) => {
    day.matches.forEach((match) => {
      names.add(match.home.name);
      names.add(match.away.name);
    });
  });
  return [...new Set(names)].sort((left, right) => left.localeCompare(right, "zh-Hans-CN"));
}

export function getAllScheduleTeamNames(days = scheduleDays) {
  const names = new Set<string>();
  days.forEach((day) => {
    day.matches.forEach((match) => {
      names.add(match.home.name);
      names.add(match.away.name);
    });
  });
  return [...names].sort((left, right) => left.localeCompare(right, "zh-Hans-CN"));
}
