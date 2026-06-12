"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { usePathname } from "next/navigation";
import { isTabBlueRoute, TAB_PAGE_SHELL_CLASS } from "@/lib/tab-routes";
import { sections } from "@/lib/worldcup-data";

const tabs = [
  {
    href: "/",
    label: "首页",
    icon: Home
  },
  ...sections
    .filter((section) => section.key !== "headlines")
    .map((section) => ({
      href: section.href,
      label: section.shortTitle,
      icon: section.icon
    }))
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const tabBlueBackground = isTabBlueRoute(pathname);

  return (
    <div className="min-h-dvh bg-ink/95 text-ink">
      <div className="app-phone-shell mx-auto min-h-dvh w-full max-w-[430px] bg-paper pb-[calc(5rem+env(safe-area-inset-bottom))] shadow-2xl">
        {tabBlueBackground ? <div className={TAB_PAGE_SHELL_CLASS}>{children}</div> : children}
      </div>
      <nav
        className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 border-t border-white/10 bg-[#0B55D9] pb-[env(safe-area-inset-bottom)] shadow-[0_-12px_28px_rgba(0,35,120,0.35)]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-[#0B55D9] via-[#0B55D9]/55 to-transparent"
        />
        <div className="absolute inset-x-0 top-0 h-px bg-white/10" aria-hidden />
        <div className="relative grid grid-cols-4 px-2 pt-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              tab.href === "/" ? pathname === "/" : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={`relative flex h-[68px] min-w-0 flex-col items-center justify-center gap-1 rounded-lg text-[11px] transition ${
                  isActive ? "text-[#BDFD38]" : "text-white"
                }`}
                href={tab.href}
                key={tab.href}
              >
                <span
                  aria-hidden
                  className={`flex h-8 w-8 items-center justify-center rounded-[9px] transition ${
                    isActive ? "bg-[#BDFD38]/15 text-[#BDFD38]" : "bg-transparent text-white"
                  }`}
                >
                  <Icon className="h-[19px] w-[19px]" strokeWidth={isActive ? 2.8 : 2.35} />
                </span>
                <span className={`max-w-full truncate px-1 leading-none ${isActive ? "font-black" : "font-bold"}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
