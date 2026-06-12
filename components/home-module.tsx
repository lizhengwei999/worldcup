import type { ReactNode } from "react";
import { moduleSurfaceClass } from "@/lib/page-theme";

export function HomeModule({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`font-sanscn overflow-hidden rounded-[14px] px-1 pb-3 pt-4 ${moduleSurfaceClass} ${className}`.trim()}
    >
      {children}
    </section>
  );
}
