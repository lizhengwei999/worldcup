"use client";

import { CircleDot } from "lucide-react";
import { ModulePillShell, modulePillClass } from "@/components/module-nav";
import {
  type KnockoutMatch,
  type KnockoutRoundId,
  getKnockoutVisibleRounds,
  knockoutRoundTabs
} from "@/lib/knockout-data";
import { moduleCardClass } from "@/lib/page-theme";

const cardWidth = 168;
const cardHeight = 96;
const rowHeight = 104;
const columnStep = 208;

type PositionedMatch = KnockoutMatch & { top: number };

function pairCenters(sourceCenters: number[]) {
  return Array.from({ length: sourceCenters.length / 2 }, (_, index) => {
    const first = sourceCenters[index * 2];
    const second = sourceCenters[index * 2 + 1];
    return (first + second) / 2;
  });
}

function layoutBracketColumns(columns: KnockoutMatch[][]) {
  if (columns.length === 0 || columns[0].length === 0) {
    return { columnLayouts: [], centersByColumn: [], totalHeight: cardHeight };
  }

  const columnLayouts: PositionedMatch[][] = [];
  const centersByColumn: number[][] = [];

  let centers = columns[0].map((_, index) => index * rowHeight + cardHeight / 2);
  centersByColumn.push(centers);
  columnLayouts.push(
    columns[0].map((match, index) => ({ ...match, top: centers[index] - cardHeight / 2 }))
  );

  for (let columnIndex = 1; columnIndex < columns.length; columnIndex++) {
    centers = pairCenters(centers);
    centersByColumn.push(centers);
    columnLayouts.push(
      columns[columnIndex].map((match, index) => ({ ...match, top: centers[index] - cardHeight / 2 }))
    );
  }

  const totalHeight = (columns[0].length - 1) * rowHeight + cardHeight;

  return { columnLayouts, centersByColumn, totalHeight };
}

function BracketConnector({
  fromA,
  fromB,
  fromX,
  toX,
  to
}: {
  fromA: number;
  fromB: number;
  fromX: number;
  to: number;
  toX: number;
}) {
  const jointX = fromX + (toX - fromX) / 2;

  return (
    <>
      <span className="absolute h-px bg-paper/18" style={{ left: fromX, top: fromA, width: jointX - fromX }} />
      <span className="absolute h-px bg-paper/18" style={{ left: fromX, top: fromB, width: jointX - fromX }} />
      <span className="absolute w-px bg-paper/18" style={{ height: fromB - fromA, left: jointX, top: fromA }} />
      <span className="absolute h-px bg-paper/18" style={{ left: jointX, top: to, width: toX - jointX }} />
    </>
  );
}

function KnockoutMatchCard({ match }: { match: KnockoutMatch }) {
  const [date, time] = match.date.split(" ");

  return (
    <div className={`h-24 px-3 py-3 shadow-[0_10px_18px_rgba(0,35,120,0.12)] ${moduleCardClass}`}>
      <div className="mb-3 flex items-center justify-between gap-2 text-xs font-black">
        <span className="flex items-center gap-2">
          <span className="text-[#BFE7FF]">{date}</span>
          <span className="text-paper">{time}</span>
        </span>
        <span className="text-[#6EB8FF]">{match.status}</span>
      </div>
      <div className="space-y-2.5 text-sm font-black">
        {[match.home, match.away].map((team, index) => (
          <div className="flex min-w-0 items-center gap-2" key={`${match.id}-${index}`}>
            <CircleDot aria-hidden className="h-3 w-3 shrink-0 fill-paper/75 text-paper/75" strokeWidth={3} />
            <span className="truncate text-paper/82">{team}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function KnockoutBracketView({
  activeRoundId,
  onRoundChange
}: {
  activeRoundId: KnockoutRoundId;
  onRoundChange: (roundId: KnockoutRoundId) => void;
}) {
  const visibleRounds = getKnockoutVisibleRounds(activeRoundId);
  const isSingleMatch = visibleRounds.length === 1 && visibleRounds[0].matches.length === 1;

  const { columnLayouts, centersByColumn, totalHeight } = layoutBracketColumns(
    visibleRounds.map((round) => round.matches)
  );

  const bracketWidth = columnLayouts.length * columnStep + cardWidth;

  return (
    <section className="mt-3">
      <ModulePillShell className="flex items-center justify-between gap-0.5 text-[11px]">
        {knockoutRoundTabs.map((round) => (
          <button
            aria-pressed={activeRoundId === round.id}
            className={`whitespace-nowrap px-0.5 py-1 transition ${modulePillClass(activeRoundId === round.id)}`}
            key={round.id}
            onClick={() => onRoundChange(round.id)}
            type="button"
          >
            {round.label}
          </button>
        ))}
      </ModulePillShell>

      {isSingleMatch ? (
        <div className="mt-3 w-[calc(50%_-_6px)]">
          <KnockoutMatchCard match={visibleRounds[0].matches[0]} />
        </div>
      ) : (
        <div className="mt-3 overflow-x-auto pb-2">
          <div className="relative min-w-full" style={{ width: bracketWidth, height: totalHeight }}>
            {centersByColumn.slice(0, -1).map((fromCenters, columnIndex) => {
              const toCenters = centersByColumn[columnIndex + 1];
              const fromX = columnIndex * columnStep + cardWidth;
              const toX = (columnIndex + 1) * columnStep;

              return pairCenters(fromCenters).map((to, pairIndex) => (
                <BracketConnector
                  fromA={fromCenters[pairIndex * 2]}
                  fromB={fromCenters[pairIndex * 2 + 1]}
                  fromX={fromX}
                  key={`${columnIndex}-${pairIndex}`}
                  to={toCenters[pairIndex]}
                  toX={toX}
                />
              ));
            })}

            {columnLayouts.map((column, columnIndex) => (
              <div
                className="absolute top-0"
                key={visibleRounds[columnIndex]?.id ?? columnIndex}
                style={{ left: columnIndex * columnStep, width: cardWidth }}
              >
                {column.map((match) => (
                  <div
                    className={
                      visibleRounds[columnIndex]?.id === activeRoundId
                        ? "rounded-[7px] ring-1 ring-paper/25"
                        : ""
                    }
                    key={match.id}
                    style={{ position: "absolute", top: match.top, width: cardWidth }}
                  >
                    <KnockoutMatchCard match={match} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
