"use client";

import { useMemo, useState } from "react";
import { HeadlineListItem } from "@/components/headline-list-item";
import { StandingListPagination } from "@/components/standing-list-pagination";
import type { NewsItem } from "@/lib/worldcup-data";

export const HEADLINES_PAGE_SIZE = 4;

export function HeadlinePageList({ items }: { items: NewsItem[] }) {
  const totalPages = Math.max(1, Math.ceil(items.length / HEADLINES_PAGE_SIZE));
  const [page, setPage] = useState(1);
  const safePage = Math.min(page, totalPages);

  const pageItems = useMemo(
    () => items.slice((safePage - 1) * HEADLINES_PAGE_SIZE, safePage * HEADLINES_PAGE_SIZE),
    [items, safePage]
  );

  return (
  <>
    <div className="divide-y divide-paper/8">
      {pageItems.map((item, index) => (
        <HeadlineListItem index={index} item={item} key={item.id} />
      ))}
    </div>

    <StandingListPagination
      page={safePage}
      totalPages={totalPages}
      onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
      onPrev={() => setPage((current) => Math.max(1, current - 1))}
    />
  </>
  );
}
