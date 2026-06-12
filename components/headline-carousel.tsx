"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { NewsItem } from "@/lib/worldcup-data";

function getCircularIndex(index: number, length: number): number {
  return (index + length) % length;
}

export function HeadlineCarousel({ items }: { items: NewsItem[] }) {
  const slides = useMemo(() => {
    if (items.length > 0) {
      return items;
    }

    return [];
  }, [items]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => getCircularIndex(current + 1, slides.length));
    }, 4200);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) {
    return null;
  }

  const active = slides[activeIndex];
  return (
    <div className="relative h-[292px] overflow-hidden">
      <button
        aria-label="上一条头条"
        className="absolute left-2 top-[116px] z-20 flex h-9 w-9 items-center justify-center rounded-full bg-paper text-[#0B55D9] shadow-score"
        onClick={() => setActiveIndex((current) => getCircularIndex(current - 1, slides.length))}
        type="button"
      >
        <ChevronLeft aria-hidden className="h-5 w-5" />
      </button>
      <button
        aria-label="下一条头条"
        className="absolute right-2 top-[116px] z-20 flex h-9 w-9 items-center justify-center rounded-full bg-paper text-[#0B55D9] shadow-score"
        onClick={() => setActiveIndex((current) => getCircularIndex(current + 1, slides.length))}
        type="button"
      >
        <ChevronRight aria-hidden className="h-5 w-5" />
      </button>

      <Link
        className="absolute inset-x-0 top-0 z-10 block h-[262px] overflow-hidden rounded-[18px] bg-ink shadow-score"
        href={`/${active.section}/${active.slug}`}
      >
        <Image alt={active.title} className="object-cover" fill priority sizes="360px" src={active.image} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/82 via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="mb-2 inline-flex rounded-full bg-alert px-3 py-1 text-xs font-black text-paper">
            {active.eyebrow}
          </p>
          <h1 className="line-clamp-2 font-serifcn text-lg font-black leading-snug text-paper">
            {active.title}
          </h1>
        </div>
      </Link>

      <div className="absolute inset-x-0 bottom-4 z-20 flex justify-center gap-1.5">
        {slides.map((slide, index) => (
          <button
            aria-label={`切换到：${slide.title}`}
            className={`h-1.5 rounded-full transition-all ${
              index === activeIndex ? "w-3 bg-paper" : "w-1.5 bg-paper/55"
            }`}
            key={slide.id}
            onClick={() => setActiveIndex(index)}
            type="button"
          />
        ))}
      </div>
    </div>
  );
}
