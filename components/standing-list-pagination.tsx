"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export function StandingListPagination({
  page,
  totalPages,
  onPrev,
  onNext
}: {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-1 py-3 text-sm font-medium text-paper/80">
      <button
        aria-label="上一页"
        className="flex h-7 w-7 items-center justify-center rounded-md transition enabled:hover:bg-paper/10 disabled:opacity-35"
        disabled={page <= 1}
        onClick={onPrev}
        type="button"
      >
        <ChevronLeft aria-hidden className="h-4 w-4" />
      </button>
      <span className="min-w-[2.5rem] text-center tabular-nums">{page}/{totalPages}</span>
      <button
        aria-label="下一页"
        className="flex h-7 w-7 items-center justify-center rounded-md transition enabled:hover:bg-paper/10 disabled:opacity-35"
        disabled={page >= totalPages}
        onClick={onNext}
        type="button"
      >
        <ChevronRight aria-hidden className="h-4 w-4" />
      </button>
    </div>
  );
}
