"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { PlayerRankCategory } from "@/lib/player-rankings-service";
import {
  standingCardClass,
  standingLabelClass,
  standingRowSurface
} from "@/lib/standing-ui";

const rankToneTop10 = ["text-[#FFB12B]", "text-[#FFD83D]", "text-[#BFE7FF]"];

function getRankColorClass(rank: number) {
  if (rank > 10) {
    return "text-paper";
  }

  return rankToneTop10[(rank - 1) % rankToneTop10.length] ?? "text-paper";
}
const playerPlaceholder =
  "https://img.cmvideo.cn/publish/noms/2022/10/20/1O3VJ291GIALM.png";
const teamPlaceholder =
  "https://img.cmvideo.cn/publish/noms/2022/10/20/1O3VJ291GIALM.png";

const rowGridClass =
  "grid grid-cols-[28px_minmax(0,1.35fr)_minmax(0,1fr)_32px_36px] items-center gap-x-2";

export function PlayerRankingsBoard({ categories }: { categories: PlayerRankCategory[] }) {
  const initialKey = categories.find((category) => category.players.length > 0)?.key ?? categories[0]?.key;
  const [activeKey, setActiveKey] = useState(initialKey);

  const activeCategory = useMemo(
    () => categories.find((category) => category.key === activeKey) ?? categories[0],
    [activeKey, categories]
  );

  if (!activeCategory) {
    return null;
  }

  return (
    <section className={`mt-3 overflow-hidden ${standingCardClass}`}>
      <div className="flex">
        <aside className="w-[76px] shrink-0 border-r border-paper/10 bg-black/20 py-2">
          {categories.map((category) => {
            const active = category.key === activeKey;

            return (
              <button
                aria-pressed={active}
                className={`block w-full px-1.5 py-2 text-left text-[11px] font-bold leading-4 transition ${
                  active
                    ? "bg-[#1f6fff] text-paper"
                    : "text-paper/72 hover:bg-paper/10 hover:text-paper"
                }`}
                key={category.key}
                onClick={() => setActiveKey(category.key)}
                type="button"
              >
                {category.label}
              </button>
            );
          })}
        </aside>

        <div className="min-w-0 flex-1 py-3 pl-2 pr-3">
          <div className={`${rowGridClass} pb-2 tracking-wide ${standingLabelClass}`}>
            <span className="text-center">排名</span>
            <span>球员</span>
            <span>球队</span>
            <span className="text-center">场次</span>
            <span className="text-center">{activeCategory.columnLabel}</span>
          </div>

          {activeCategory.players.length === 0 ? (
            <p className="py-10 text-center text-sm font-medium text-paper/55">暂无排名数据</p>
          ) : (
            <div className="space-y-0.5">
              {activeCategory.players.map((player, index) => (
                <div
                  className={`${rowGridClass} py-2 text-xs font-medium ${standingRowSurface(index)}`}
                  key={player.figureId}
                >
                  <span
                    className={`font-display text-center text-sm font-bold tabular-nums ${getRankColorClass(player.rank)}`}
                  >
                    {player.rank}
                  </span>
                  <span className="flex items-start gap-1.5">
                    <span className="relative mt-0.5 h-6 w-6 shrink-0 overflow-hidden rounded-full bg-paper/10">
                      <Image
                        alt={`${player.playerName}头像`}
                        className="object-cover"
                        fill
                        sizes="24px"
                        src={player.playerImageUrl || playerPlaceholder}
                      />
                    </span>
                    <span className="break-words leading-4">{player.playerName}</span>
                  </span>
                  <span className="flex items-start gap-1.5">
                    <span className="relative mt-0.5 h-3 w-[18px] shrink-0 overflow-hidden">
                      <Image
                        alt={`${player.teamName}队旗`}
                        className="object-cover"
                        fill
                        sizes="18px"
                        src={player.teamLogoUrl || teamPlaceholder}
                      />
                    </span>
                    <span className="break-words leading-4">{player.teamName}</span>
                  </span>
                  <span className="font-display text-center text-sm font-semibold tabular-nums">
                    {player.matchesPlayed}
                  </span>
                  <span className="font-display text-center text-sm font-bold tabular-nums">
                    {player.statValue}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
