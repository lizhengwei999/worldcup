"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { saveReturnPath } from "@/lib/navigation-history";

export function NavigationTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previousPathRef = useRef<string | null>(null);

  const currentPath =
    pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");

  useEffect(() => {
    const previousPath = previousPathRef.current;

    if (previousPath && previousPath !== currentPath) {
      saveReturnPath(currentPath, previousPath);
    }

    previousPathRef.current = currentPath;
  }, [currentPath]);

  return null;
}
