import type { ReactNode } from "react";
import {
  moduleNavActiveClass,
  moduleNavArrowClass,
  moduleNavInactiveClass,
  moduleNavShellClass,
  modulePillActiveClass,
  modulePillInactiveClass,
  modulePillShellClass
} from "@/lib/page-theme";

export const MODULE_NAV_SHELL = `mx-5 ${moduleNavShellClass}`;
export const MODULE_NAV_ACTIVE = moduleNavActiveClass;
export const MODULE_NAV_INACTIVE = moduleNavInactiveClass;
export const MODULE_NAV_ARROW = moduleNavArrowClass;
export const MODULE_PILL_ACTIVE = modulePillActiveClass;
export const MODULE_PILL_INACTIVE = modulePillInactiveClass;
export const MODULE_PILL_SHELL = `mx-5 mt-3 ${modulePillShellClass}`;

export function moduleTabClass(active: boolean) {
  return active ? MODULE_NAV_ACTIVE : MODULE_NAV_INACTIVE;
}

export function modulePillClass(active: boolean) {
  return active ? MODULE_PILL_ACTIVE : MODULE_PILL_INACTIVE;
}

export function ModuleNavShell({
  className = "",
  children
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={`${MODULE_NAV_SHELL} ${className}`.trim()}>{children}</div>;
}

export function ModulePillShell({
  className = "",
  children
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={`${MODULE_PILL_SHELL} ${className}`.trim()}>{children}</div>;
}
