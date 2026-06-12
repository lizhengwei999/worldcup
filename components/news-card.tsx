import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { NewsItem } from "@/lib/worldcup-data";

export function NewsCard({ item, priority = false }: { item: NewsItem; priority?: boolean }) {
  return (
    <Link
      className="group grid gap-3 border-b border-ink/10 py-5 md:grid-cols-[180px_1fr]"
      href={`/${item.section}/${item.slug}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-ink/10">
        <Image
          alt={item.title}
          className="object-cover transition duration-500 group-hover:scale-105"
          fill
          priority={priority}
          sizes="(min-width: 768px) 180px, 100vw"
          src={item.image}
        />
      </div>
      <article className="flex min-w-0 flex-col justify-center">
        <div className="mb-2 flex items-center gap-2 text-xs font-bold text-pitch">
          <span>{item.eyebrow}</span>
          <span className="h-1 w-1 rounded-full bg-trophy" />
          <span>{item.publishedAt}</span>
        </div>
        <h3 className="font-serifcn text-xl font-black leading-tight text-ink group-hover:text-pitch">
          {item.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink/68">{item.summary}</p>
        <div className="mt-3 flex items-center gap-2 text-xs font-bold text-alert">
          <ArrowUpRight aria-hidden className="h-4 w-4" />
          查看详情
        </div>
      </article>
    </Link>
  );
}
