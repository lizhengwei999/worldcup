"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { KnockoutBracketView } from "@/components/knockout-bracket-view";
import type { KnockoutRoundId } from "@/lib/knockout-data";
import {
  MODULE_NAV_ARROW,
  ModuleNavShell,
  ModulePillShell,
  modulePillClass,
  moduleTabClass
} from "@/components/module-nav";
import type { StandingGroup } from "@/lib/worldcup-data";
import { standingLabelClass, standingRowSurface } from "@/lib/standing-ui";

const groupPages = [
  ["A组", "B组", "C组", "D组", "E组", "F组", "G组"],
  ["G组", "H组", "I组", "J组", "K组", "L组"]
];

const rankTone = ["text-alert", "text-[#FFB12B]", "text-[#FFD83D]", "text-paper"];

type StandingsBoardProps = {
  groups: StandingGroup[];
};

type BoardMode = "groups" | "knockout";

export function StandingsBoard({ groups }: StandingsBoardProps) {
  const [mode, setMode] = useState<BoardMode>("groups");
  const [activeGroup, setActiveGroup] = useState("H组");
  const [pageIndex, setPageIndex] = useState(1);
  const [activeRoundId, setActiveRoundId] = useState<KnockoutRoundId>("round32");

  const currentTabs = groupPages[pageIndex];
  const activeTable = useMemo(
    () => groups.find((group) => group.group === activeGroup) ?? groups[0],
    [activeGroup, groups]
  );
  function switchPage(nextPage: number) {
    const boundedPage = Math.max(0, Math.min(groupPages.length - 1, nextPage));
    const nextTabs = groupPages[boundedPage];

    setPageIndex(boundedPage);
    if (!nextTabs.includes(activeGroup)) {
      setActiveGroup(nextTabs[0]);
    }
  }

  return (
    <>
      <ModuleNavShell className="text-center">
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
        <>
          <ModulePillShell className="grid grid-cols-[24px_1fr_24px] items-center text-sm">
            <button
              aria-label="上一组分组"
              className={`flex h-6 w-6 items-center justify-center ${MODULE_NAV_ARROW}`}
              disabled={pageIndex === 0}
              onClick={() => switchPage(pageIndex - 1)}
              type="button"
            >
              <ChevronLeft aria-hidden className="h-4 w-4" strokeWidth={3} />
            </button>

            <div className="flex items-center justify-between gap-1">
              {currentTabs.map((group) => (
                <button
                  aria-pressed={activeGroup === group}
                  className={`min-w-8 whitespace-nowrap px-1.5 py-1 text-center transition ${modulePillClass(activeGroup === group)}`}
                  key={group}
                  onClick={() => setActiveGroup(group)}
                  type="button"
                >
                  {group}
                </button>
              ))}
            </div>

            <button
              aria-label="下一组分组"
              className={`flex h-6 w-6 items-center justify-center ${MODULE_NAV_ARROW}`}
              disabled={pageIndex === groupPages.length - 1}
              onClick={() => switchPage(pageIndex + 1)}
              type="button"
            >
              <ChevronRight aria-hidden className="h-4 w-4" strokeWidth={3} />
            </button>
          </ModulePillShell>

          <div className="mt-3">
            <div className={`grid grid-cols-[1fr_68px_54px_36px] px-3 pb-1 tracking-wide ${standingLabelClass}`}>
              <span>球队名称</span>
              <span className="text-center">胜/平/负</span>
              <span className="text-center">进/失</span>
              <span className="text-right">积分</span>
            </div>

            <div className="mt-1 space-y-0.5">
              {activeTable.teams.map((team, index) => (
                <div
                  className={`grid grid-cols-[1fr_68px_54px_36px] items-center px-3 py-2 text-[15px] text-paper ${standingRowSurface(index)}`}
                  key={team.id}
                >
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span
                      className={`font-display w-4 shrink-0 text-center text-lg font-bold tabular-nums ${rankTone[team.rank - 1] ?? "text-paper"}`}
                    >
                      {team.rank}
                    </span>
                    <span className="relative h-3 w-[18px] shrink-0 overflow-hidden">
                      <Image
                        alt={`${team.team}队旗`}
                        className="object-cover"
                        fill
                        sizes="18px"
                        src={team.logo}
                      />
                    </span>
                    <span className="min-w-0 truncate font-medium">{team.team}</span>
                  </div>
                  <span className="font-display text-center font-semibold tabular-nums">
                    {team.win}/{team.draw}/{team.loss}
                  </span>
                  <span className="font-display text-center font-semibold tabular-nums">
                    {team.goals}/{team.against}
                  </span>
                  <span className="font-display text-right font-bold tabular-nums">{team.points}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <KnockoutBracketView activeRoundId={activeRoundId} onRoundChange={setActiveRoundId} />
      )}
    </>
  );
}
