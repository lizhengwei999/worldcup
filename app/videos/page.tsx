import { Clapperboard } from "lucide-react";
import { HomeModule } from "@/components/home-module";
import { VideoBoard } from "@/components/video-board";
import { pageHeroClass } from "@/lib/page-theme";
import { getVideoSections } from "@/lib/video-service";
import { getSection } from "@/lib/worldcup-data";

export default async function VideosPage() {
  const section = getSection("videos");
  const videoSections = await getVideoSections();

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
            <Clapperboard aria-hidden className="h-7 w-7" strokeWidth={2.6} />
          </span>
        </div>
      </section>

      <HomeModule className="mt-4 pb-3">
        <VideoBoard sections={videoSections} variant="sections" />
      </HomeModule>
    </main>
  );
}
