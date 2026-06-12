import { CalendarDays } from "lucide-react";
import { HomeModule } from "@/components/home-module";
import { SchedulePageList } from "@/components/schedule-page-list";
import { pageHeroClass } from "@/lib/page-theme";

export default function SchedulePage() {
  return (
    <main className="min-h-dvh">
      <section className={pageHeroClass}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black text-[#BDFD38]">美加墨世界杯</p>
            <h1 className="mt-1 text-3xl font-black leading-none">全部赛程</h1>
            <p className="mt-3 text-sm font-bold text-paper/80">北京时间：6月12日-7月20日</p>
          </div>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-paper/15 text-[#BDFD38]">
            <CalendarDays aria-hidden className="h-7 w-7" strokeWidth={2.6} />
          </span>
        </div>
      </section>

      <HomeModule className="mt-4 pb-4">
        <SchedulePageList />
      </HomeModule>
    </main>
  );
}
