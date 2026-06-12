import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeading({
  title,
  description,
  href,
  variant = "default"
}: {
  title: string;
  description: string;
  href?: string;
  variant?: "default" | "onBlue";
}) {
  const onBlue = variant === "onBlue";

  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-alert">World Cup 2026</p>
        <h2
          className={`mt-1 font-serifcn text-[24px] font-black leading-tight ${onBlue ? "text-paper" : "text-ink"}`}
        >
          {title}
        </h2>
        <p className={`mt-1 text-sm leading-6 ${onBlue ? "text-paper/70" : "text-ink/64"}`}>{description}</p>
      </div>
      {href ? (
        <Link
          className={`mt-1 inline-flex h-9 shrink-0 items-center justify-center gap-1 rounded-lg border px-3 text-sm font-bold transition ${
            onBlue
              ? "border-paper/25 text-paper/85 hover:border-paper/45 hover:text-paper"
              : "border-ink/15 text-ink hover:border-pitch hover:text-pitch"
          }`}
          href={href}
          aria-label={`查看更多${title}`}
        >
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}
