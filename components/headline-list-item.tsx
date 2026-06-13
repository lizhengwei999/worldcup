import Image from "next/image";
import Link from "next/link";
import type { NewsItem } from "@/lib/worldcup-data";
import { standingRowSurface } from "@/lib/standing-ui";

export function HeadlineListItem({ index, item }: { index: number; item: NewsItem }) {
  return (
    <Link
      className={`flex gap-3 px-5 py-4 transition hover:bg-paper/10 ${standingRowSurface(index)}`}
      href={`/${item.section}/${item.slug}`}
    >
      <div className="relative aspect-[16/10] w-[6.75rem] shrink-0 overflow-hidden rounded-md bg-[#0B3D9F]/70">
        <Image
          alt={item.title}
          className="object-cover"
          fill
          sizes="108px"
          src={item.image}
        />
      </div>
      <article className="min-w-0 flex-1">
        <p className="text-xs font-medium text-paper/55">
          {item.eyebrow}
          <span className="mx-1.5 text-paper/30">·</span>
          {item.publishedAt}
        </p>
        <h3 className="mt-1 line-clamp-2 text-[15px] font-bold leading-snug text-paper">
          {item.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-paper/62">{item.summary}</p>
      </article>
    </Link>
  );
}
