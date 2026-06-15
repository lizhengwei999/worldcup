"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { getCurrentPath, getReturnPath } from "@/lib/navigation-history";

const defaultClassName =
  "mb-4 inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-paper/22 px-3 py-2 text-sm font-bold text-paper/85 transition hover:border-paper/40 hover:text-paper";

export function BackLink({
  children,
  className = defaultClassName,
  fallbackHref
}: {
  children: ReactNode;
  className?: string;
  fallbackHref: string;
}) {
  const router = useRouter();

  function handleBack() {
    const savedReturnPath = getReturnPath(getCurrentPath());

    if (savedReturnPath) {
      router.push(savedReturnPath);
      return;
    }

    router.push(fallbackHref);
  }

  return (
    <button className={className} onClick={handleBack} type="button">
      <ArrowLeft aria-hidden className="h-4 w-4 shrink-0" />
      {children}
    </button>
  );
}
