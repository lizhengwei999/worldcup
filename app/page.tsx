import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  ListVideo,
  Sparkle
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { HomeModule } from "@/components/home-module";
import { HeadlineCarousel } from "@/components/headline-carousel";
import { ScheduleBoard } from "@/components/schedule-board";
import { StandingsBoard } from "@/components/standings-board";
import { VideoBoard } from "@/components/video-board";
import { WorldCupHeader } from "@/components/worldcup-header";
import { getNewsItems } from "@/lib/content-service";
import { getScheduleDays } from "@/lib/schedule-service";
import { getStandingGroups } from "@/lib/standings-service";
import { getVideoSections } from "@/lib/video-service";

function ModuleTitle({ title, icon: Icon }: { title: string; icon: LucideIcon }) {
  return (
    <div className="mb-3 flex items-center justify-center px-5 text-paper">
      <span className="inline-flex items-center gap-1.5 text-[17px] font-bold tracking-[0.04em]">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-paper text-[#0B55D9]">
          <Icon aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
        {title}
      </span>
    </div>
  );
}

function MoreLink({ href }: { href: string }) {
  return (
    <Link
      className="mx-8 mt-2 flex items-center justify-center gap-1 text-sm font-medium text-paper/88"
      href={href}
    >
      查看更多
      <ChevronRight aria-hidden className="h-4 w-4" />
    </Link>
  );
}

export default async function HomePage() {
  const [standingGroups, carouselItems, scheduleDays, videoSections] = await Promise.all([
    getStandingGroups(),
    getNewsItems("headlines", 6),
    getScheduleDays(),
    getVideoSections(6)
  ]);

  return (
    <main className="min-h-dvh">
      <WorldCupHeader />

      <section
        className="mt-5 overflow-hidden rounded-[14px] shadow-[0_10px_28px_rgba(0,35,120,0.28)] ring-1 ring-inset ring-paper/14"
      >
        <HeadlineCarousel items={carouselItems} />
      </section>

      <div className="mt-4 space-y-4">
        <HomeModule>
          <ModuleTitle icon={Sparkle} title="积分排名" />
          <StandingsBoard groups={standingGroups} />
          <MoreLink href="/standings" />
        </HomeModule>

        <HomeModule>
          <ModuleTitle icon={CalendarDays} title="全部赛程" />
          <ScheduleBoard scheduleDays={scheduleDays} />
          <MoreLink href="/schedule" />
        </HomeModule>

        <HomeModule>
          <ModuleTitle icon={ListVideo} title="精彩视频" />
          <VideoBoard sections={videoSections} />
          <MoreLink href="/videos" />
        </HomeModule>
      </div>
    </main>
  );
}
