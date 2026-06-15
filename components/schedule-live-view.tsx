import { Radio } from "lucide-react";
import { BackLink } from "@/components/back-link";
import { OpenExternalLink } from "@/components/open-external-link";
import { moduleSurfaceClass } from "@/lib/page-theme";
import { MIGU_LIVE_HOME_URL } from "@/lib/schedule-match-display";

export function ScheduleLiveView({
  awayName,
  homeName,
  kickLabel,
  matchStage
}: {
  awayName: string;
  homeName: string;
  kickLabel: string;
  matchStage: string;
}) {
  return (
    <main className="min-h-dvh pb-2 text-paper">
      <BackLink fallbackHref="/schedule">返回全部赛程</BackLink>

      <article className={`rounded-[14px] px-4 py-5 sm:px-5 ${moduleSurfaceClass}`}>
        <p className="text-xs font-black tracking-wide text-[#BDFD38]">{matchStage}</p>
        <h1 className="mt-2 font-serifcn text-2xl font-black leading-snug text-paper">
          {homeName} vs {awayName}
        </h1>
        <p className="mt-3 text-sm font-medium text-paper/70">{kickLabel}</p>

        <div className="mt-6 rounded-[12px] bg-paper/[0.05] px-4 py-5 ring-1 ring-inset ring-paper/10">
          <p className="inline-flex items-center gap-2 text-sm font-black text-[#BDFD38]">
            <Radio aria-hidden className="h-4 w-4" />
            比赛进行中
          </p>
          <p className="mt-2 text-sm leading-6 text-paper/78">
            直播将在新标签页打开，本页可继续浏览赛程或点击上方返回。
          </p>
          <OpenExternalLink
            className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-[#BDFD38] px-4 py-3 text-sm font-black text-[#0B55D9] transition hover:bg-paper"
            href={MIGU_LIVE_HOME_URL}
          >
            前往咪咕观看直播
          </OpenExternalLink>
        </div>
      </article>
    </main>
  );
}
