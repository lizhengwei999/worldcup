import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { getBaiduUrlForTitle } from "@/lib/worldcup-data";

export function BaiduLink({
  title,
  variant = "default"
}: {
  title: string;
  variant?: "default" | "onBlue";
}) {
  const onBlue = variant === "onBlue";

  return (
    <Link
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold transition ${
        onBlue
          ? "bg-[#BDFD38] text-[#0B55D9] hover:bg-[#d4ff6a]"
          : "bg-ink text-paper hover:bg-pitch"
      }`}
      href={getBaiduUrlForTitle(title)}
      target="_blank"
    >
      <ExternalLink aria-hidden className="h-4 w-4 shrink-0" />
      打开百度动态结果
    </Link>
  );
}
