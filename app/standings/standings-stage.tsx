"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Info } from "lucide-react";
import { useMemo, useState } from "react";
import { KnockoutBracketView } from "@/components/knockout-bracket-view";
import { PlayerRankingsBoard } from "@/components/player-rankings-board";
import { ModuleNavShell, moduleTabClass } from "@/components/module-nav";
import type { PlayerRankCategory } from "@/lib/player-rankings-service";
import type { KnockoutRoundId } from "@/lib/knockout-data";
import type { StandingGroup } from "@/lib/worldcup-data";
import {
  standingCardClass,
  standingCardHeaderClass,
  standingGroupTitleClass,
  standingLabelClass,
  standingRowSurface
} from "@/lib/standing-ui";

export type RankingPanel = "matchUp" | "teamRank" | "playerRank";
type BoardMode = "groups" | "knockout";

const rankTone = ["text-alert", "text-[#FFB12B]", "text-[#FFD83D]", "text-paper"];

function GroupStandings({ groups }: { groups: StandingGroup[] }) {
  return (
    <>
      <section className="mt-3 space-y-3">
        {groups.map((group) => (
          <article className={`${standingCardClass} overflow-hidden`} key={group.group}>
            <div className={`${standingCardHeaderClass} px-3 pt-3 pb-2`}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className={standingGroupTitleClass}>{group.group}</h2>
                <span className={standingLabelClass}>赛程</span>
              </div>

              <div
                className={`grid grid-cols-[1fr_42px_68px_50px_38px] pb-1 tracking-wide ${standingLabelClass}`}
              >
                <span>球队</span>
                <span className="text-center">场次</span>
                <span className="text-center">胜/平/负</span>
                <span className="text-center">进/失</span>
                <span className="text-right">积分</span>
              </div>
            </div>

            <div className="space-y-0.5 pb-3">
              {group.teams.map((team, index) => {
                const promoteLabel = team.rank <= 2 ? "晋级32强" : team.rank === 3 ? "晋级待定" : "";

                return (
                  <Link
                    className={`grid grid-cols-[1fr_42px_68px_50px_38px] items-center px-3 py-2.5 text-sm font-medium transition hover:bg-paper/12 ${standingRowSurface(index)}`}
                    href={`/standings/${team.slug}`}
                    key={team.id}
                  >
                    <div className="min-w-0">
                      {promoteLabel ? (
                        <p
                          className={`mb-1 text-[10px] font-bold ${team.rank <= 2 ? "text-[#BFE7FF]" : "text-paper/55"}`}
                        >
                          {promoteLabel}
                        </p>
                      ) : null}
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span
                          className={`font-display w-4 shrink-0 text-center text-base font-bold tabular-nums ${rankTone[team.rank - 1] ?? "text-paper"}`}
                        >
                          {team.rank}
                        </span>
                        <span className="relative h-3 w-[18px] shrink-0 overflow-hidden">
                          <Image alt={`${team.team}队旗`} className="object-cover" fill sizes="18px" src={team.logo} />
                        </span>
                        <span className="min-w-0 truncate font-medium">{team.team}</span>
                      </div>
                    </div>
                    <span className="font-display text-center font-semibold tabular-nums">{team.played}</span>
                    <span className="font-display text-center font-semibold tabular-nums">
                      {team.win}/{team.draw}/{team.loss}
                    </span>
                    <span className="font-display text-center font-semibold tabular-nums">
                      {team.goals}/{team.against}
                    </span>
                    <span className="font-display text-right font-bold tabular-nums">{team.points}</span>
                  </Link>
                );
              })}
            </div>
          </article>
        ))}
      </section>

      <section className={`mt-4 px-3 py-4 ${standingCardClass}`}>
        <h2 className="flex items-center gap-2 text-base font-black">
          <Info aria-hidden className="h-4 w-4" strokeWidth={3} />
          赛制说明
        </h2>
        <div className="mt-3 space-y-2 text-sm font-medium leading-6 text-paper/75">
          <p>2026年世界杯于北京时间2026年6月12日至7月20日进行，由美国、加拿大、墨西哥联合主办。</p>
          <p>48支球队分为12组，每组4队。小组赛结束后，每组前2名和8支成绩最好的小组第3名晋级32强。</p>
          <p>积分规则：胜一场得3分，平一场得1分，负一场得0分；同分时依次比较相互积分、净胜球、进球数、公平竞赛积分和FIFA排名。</p>
        </div>
        <Link className="mt-2 flex items-center justify-center gap-1 text-sm font-medium text-paper/88" href="/">
          返回首页
          <ChevronRight aria-hidden className="h-4 w-4" />
        </Link>
      </section>
    </>
  );
}

function TeamRankBoard({ groups }: { groups: StandingGroup[] }) {
  const teams = useMemo(
    () =>
      groups
        .flatMap((group) => group.teams)
        .slice()
        .sort((left, right) => {
          if (right.points !== left.points) {
            return right.points - left.points;
          }
          if (right.goalDiff !== left.goalDiff) {
            return right.goalDiff - left.goalDiff;
          }
          if (right.goals !== left.goals) {
            return right.goals - left.goals;
          }
          return left.team.localeCompare(right.team, "zh-Hans-CN");
        })
        .map((team, index) => ({ ...team, overallRank: index + 1 })),
    [groups]
  );

  const totals = useMemo(
    () =>
      teams.reduce(
        (summary, team) => ({
          goals: summary.goals + team.goals,
          matches: summary.matches + team.played,
          teams: summary.teams + 1
        }),
        { goals: 0, matches: 0, teams: 0 }
      ),
    [teams]
  );

  return (
    <section className={`mt-3 overflow-hidden py-3 ${standingCardClass}`}>
      <div className="px-3">
        <h2 className="text-lg font-black">球队榜</h2>
        <p className="mt-1 text-xs font-medium text-paper/55">按照积分、净胜球、进球数统计全部参赛球队</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-[6px] bg-paper/14 px-2 py-2">
          <p className="font-display text-lg font-bold tabular-nums">{totals.teams}</p>
          <p className="text-[11px] font-medium text-paper/55">球队</p>
        </div>
        <div className="rounded-[6px] bg-paper/14 px-2 py-2">
          <p className="font-display text-lg font-bold tabular-nums">{totals.matches}</p>
          <p className="text-[11px] font-medium text-paper/55">已赛</p>
        </div>
        <div className="rounded-[6px] bg-paper/14 px-2 py-2">
          <p className="font-display text-lg font-bold tabular-nums">{totals.goals}</p>
          <p className="text-[11px] font-medium text-paper/55">进球</p>
        </div>
        </div>
      </div>

      <div
        className={`mt-3 grid grid-cols-[38px_1fr_38px_54px_42px_42px] px-3 pb-1 tracking-wide ${standingLabelClass}`}
      >
        <span>排名</span>
        <span>球队</span>
        <span className="text-center">场次</span>
        <span className="text-center">进/失</span>
        <span className="text-center">净胜</span>
        <span className="text-right">积分</span>
      </div>

      <div className="space-y-0.5">
        {teams.map((team, index) => (
          <Link
            className={`grid grid-cols-[38px_1fr_38px_54px_42px_42px] items-center px-3 py-2.5 text-sm font-medium transition hover:bg-paper/12 ${standingRowSurface(index)}`}
            href={`/standings/${team.slug}`}
            key={team.id}
          >
            <span
              className={`font-display text-base font-bold tabular-nums ${rankTone[(team.overallRank - 1) % rankTone.length] ?? "text-paper"}`}
            >
              {team.overallRank}
            </span>
            <span className="flex min-w-0 items-center gap-2">
              <span className="relative h-3.5 w-5 shrink-0 overflow-hidden">
                <Image alt={`${team.team}队旗`} className="object-cover" fill sizes="20px" src={team.logo} />
              </span>
              <span className="min-w-0 truncate">{team.team}</span>
              <span className="shrink-0 rounded bg-paper/15 px-1.5 py-0.5 text-[10px] font-bold text-paper/70">
                {team.group}
              </span>
            </span>
            <span className="font-display text-center font-semibold tabular-nums">{team.played}</span>
            <span className="font-display text-center font-semibold tabular-nums">
              {team.goals}/{team.against}
            </span>
            <span className="font-display text-center font-semibold tabular-nums">{team.goalDiff}</span>
            <span className="font-display text-right font-bold tabular-nums">{team.points}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function StandingsStage({
  groups,
  initialPanel = "matchUp",
  playerRankCategories = []
}: {
  groups: StandingGroup[];
  initialPanel?: RankingPanel;
  playerRankCategories?: PlayerRankCategory[];
}) {
  const [panel, setPanel] = useState<RankingPanel>(initialPanel);
  const [mode, setMode] = useState<BoardMode>("groups");
  const [activeRoundId, setActiveRoundId] = useState<KnockoutRoundId>("round32");

  return (
    <>
      <ModuleNavShell className="text-center">
        <div className="grid grid-cols-3">
          <button
            aria-pressed={panel === "matchUp"}
            className={`py-2.5 transition ${moduleTabClass(panel === "matchUp")}`}
            onClick={() => setPanel("matchUp")}
            type="button"
          >
            积分榜
          </button>
          <button
            aria-pressed={panel === "teamRank"}
            className={`py-2.5 transition ${moduleTabClass(panel === "teamRank")}`}
            onClick={() => setPanel("teamRank")}
            type="button"
          >
            球队榜
          </button>
          <button
            aria-pressed={panel === "playerRank"}
            className={`py-2.5 transition ${moduleTabClass(panel === "playerRank")}`}
            onClick={() => setPanel("playerRank")}
            type="button"
          >
            球员排名
          </button>
        </div>
      </ModuleNavShell>

      {panel === "playerRank" ? (
        <PlayerRankingsBoard categories={playerRankCategories} />
      ) : panel === "teamRank" ? (
        <TeamRankBoard groups={groups} />
      ) : (
        <>
          <ModuleNavShell className="mt-3 text-center">
            <div className="grid grid-cols-2">
              <button
                aria-pressed={mode === "groups"}
                className={`py-2.5 transition ${moduleTabClass(mode === "groups")}`}
                onClick={() => setMode("groups")}
                type="button"
              >
                小组赛
              </button>
              <button
                aria-pressed={mode === "knockout"}
                className={`py-2.5 transition ${moduleTabClass(mode === "knockout")}`}
                onClick={() => setMode("knockout")}
                type="button"
              >
                淘汰赛
              </button>
            </div>
          </ModuleNavShell>

          {mode === "groups" ? (
            <GroupStandings groups={groups} />
          ) : (
            <KnockoutBracketView activeRoundId={activeRoundId} onRoundChange={setActiveRoundId} />
          )}
        </>
      )}
    </>
  );
}
