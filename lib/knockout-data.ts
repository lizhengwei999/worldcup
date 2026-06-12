export type KnockoutRoundId = "round32" | "round16" | "quarter" | "semi" | "final" | "third";

export type KnockoutMatch = {
  away: string;
  date: string;
  home: string;
  id: string;
  status: string;
};

export const knockoutRoundTabs: { id: KnockoutRoundId; label: string }[] = [
  { id: "round32", label: "1/16决赛" },
  { id: "round16", label: "1/8决赛" },
  { id: "quarter", label: "1/4决赛" },
  { id: "semi", label: "半决赛" },
  { id: "final", label: "决赛" },
  { id: "third", label: "季军赛" }
];

const round32Dates = [
  "06.30 04:30",
  "07.01 05:00",
  "06.29 03:00",
  "06.30 09:00",
  "07.03 07:00",
  "07.03 03:00",
  "07.02 09:00",
  "07.02 05:00",
  "06.29 09:00",
  "06.30 01:00",
  "07.01 01:00",
  "07.01 09:00",
  "07.02 01:00",
  "07.03 11:00",
  "07.04 03:00",
  "07.04 07:00"
];

const round16Dates = [
  "07.05 05:00",
  "07.05 01:00",
  "07.07 03:00",
  "07.07 07:00",
  "07.06 03:00",
  "07.06 07:00",
  "07.08 03:00",
  "07.08 07:00"
];

const quarterDates = ["07.10 04:00", "07.11 04:00", "07.10 08:00", "07.12 04:00"];
const semiDates = ["07.15 03:00", "07.16 03:00"];

function makeMatch(id: string, date: string): KnockoutMatch {
  return {
    away: "待定",
    date,
    home: "待定",
    id,
    status: "未开赛"
  };
}

export const knockoutMainChain: KnockoutRoundId[] = ["round32", "round16", "quarter", "semi", "final"];

export const knockoutMatchesByRound: Record<KnockoutRoundId, KnockoutMatch[]> = {
  round32: round32Dates.map((date, index) => makeMatch(`r32-${index + 1}`, date)),
  round16: round16Dates.map((date, index) => makeMatch(`r16-${index + 1}`, date)),
  quarter: quarterDates.map((date, index) => makeMatch(`qf-${index + 1}`, date)),
  semi: semiDates.map((date, index) => makeMatch(`sf-${index + 1}`, date)),
  final: [makeMatch("final", "07.20 03:00")],
  third: [makeMatch("third", "07.19 03:00")]
};

/** 当前导航阶段起，最多展示 4 列对阵（如 1/4 决赛 → 半决赛 → 决赛） */
export function getKnockoutVisibleRounds(activeRoundId: KnockoutRoundId) {
  if (activeRoundId === "third") {
    return [{ id: "third" as const, matches: knockoutMatchesByRound.third }];
  }

  const start = knockoutMainChain.indexOf(activeRoundId);
  return knockoutMainChain.slice(start, start + 4).map((id) => ({
    id,
    matches: knockoutMatchesByRound[id]
  }));
}
