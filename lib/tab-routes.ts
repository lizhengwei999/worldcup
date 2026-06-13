export const TAB_BLUE_ROUTE_PREFIXES = ["/headlines", "/videos", "/schedule", "/standings"] as const;

export function isTabBlueRoute(pathname: string): boolean {
  if (pathname === "/") {
    return true;
  }

  return TAB_BLUE_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export const TAB_PAGE_SHELL_CLASS = "min-h-dvh bg-[#0B55D9] text-paper px-3 pb-6 pt-6";
