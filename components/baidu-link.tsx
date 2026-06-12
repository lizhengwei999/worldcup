import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { getBaiduUrlForTitle } from "@/lib/worldcup-data";

export function BaiduLink({ title }: { title: string }) {
  return (
    <Link
      className="inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-3 text-sm font-bold text-paper transition hover:bg-pitch"
      href={getBaiduUrlForTitle(title)}
      target="_blank"
    >
      <ExternalLink aria-hidden className="h-4 w-4" />
      打开百度动态结果
    </Link>
  );
}
