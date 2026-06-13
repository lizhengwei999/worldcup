import { HomeModule } from "@/components/home-module";
import { pageHeroClass } from "@/lib/page-theme";
import { Trophy } from "lucide-react";
import type { RankingPanel } from "./standings-stage";
import { StandingsStage } from "./standings-stage";
import { getStandingGroups } from "@/lib/standings-service";

type StandingsPageProps = {
  searchParams?: Promise<{
    rankChildTab?: string | string[];
  }>;
};

export default async function StandingsPage({ searchParams }: StandingsPageProps) {
  const params = await searchParams;
  const rankChildTab = Array.isArray(params?.rankChildTab) ? params?.rankChildTab[0] : params?.rankChildTab;
  const initialPanel: RankingPanel = rankChildTab === "teamRank" ? "teamRank" : "matchUp";
  const standingGroups = await getStandingGroups();

  return (
    <main className="min-h-dvh">
      <section className={pageHeroClass}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black text-[#BDFD38]">美加墨世界杯</p>
            <h1 className="mt-1 text-3xl font-black leading-none">积分排名</h1>
            <p className="mt-3 text-sm font-bold text-paper/80">即将于2026年6月12日开赛</p>
          </div>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-paper/15 text-[#BDFD38]">
            <Trophy aria-hidden className="h-7 w-7" strokeWidth={2.6} />
          </span>
        </div>
      </section>

      <HomeModule className="mt-4">
        <StandingsStage groups={standingGroups} initialPanel={initialPanel} />
      </HomeModule>
    </main>
  );
}
