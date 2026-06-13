import { Newspaper } from "lucide-react";
import { HeadlineCarousel } from "@/components/headline-carousel";
import { HeadlineListItem } from "@/components/headline-list-item";
import { HomeModule } from "@/components/home-module";
import { pageHeroClass } from "@/lib/page-theme";
import { getNewsItems } from "@/lib/content-service";
import { getSection } from "@/lib/worldcup-data";

export default async function HeadlinesPage() {
  const section = getSection("headlines");
  const items = await getNewsItems("headlines", 12);
  const carouselItems = items.slice(0, 6);

  return (
    <main className="min-h-dvh">
      <section className={pageHeroClass}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black text-[#BDFD38]">美加墨世界杯</p>
            <h1 className="mt-1 text-3xl font-black leading-none">{section.title}</h1>
            <p className="mt-3 text-sm font-bold text-paper/80">{section.description}</p>
          </div>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-paper/15 text-[#BDFD38]">
            <Newspaper aria-hidden className="h-7 w-7" strokeWidth={2.6} />
          </span>
        </div>
      </section>

      <section
        className="mt-4 overflow-hidden rounded-[14px] shadow-[0_10px_28px_rgba(0,35,120,0.28)] ring-1 ring-inset ring-paper/14"
      >
        <HeadlineCarousel items={carouselItems} navigateToHeadlines={false} />
      </section>

      <HomeModule className="mt-4 pb-2">
        <div className="mb-1 flex items-center justify-center px-5 text-paper">
          <span className="inline-flex items-center gap-1.5 text-[17px] font-bold tracking-[0.04em]">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-paper text-[#0B55D9]">
              <Newspaper aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
            最新头条
          </span>
        </div>
        <div className="divide-y divide-paper/8">
          {items.map((item, index) => (
            <HeadlineListItem index={index} item={item} key={item.id} />
          ))}
        </div>
      </HomeModule>
    </main>
  );
}
