import { moduleCardClass, moduleCardHeaderClass } from "@/lib/page-theme";

/** 积分榜蓝底卡片（亮于页面底） */
export const standingCardClass = moduleCardClass;

/** 组卡片标题区渐变 */
export const standingCardHeaderClass = moduleCardHeaderClass;

/** 与页头「美加墨」一致的强调色 */
export const standingAccentClass = "text-[#BDFD38]";

/** 积分榜组名标题 */
export const standingGroupTitleClass = `text-base font-black ${standingAccentClass}`;

/** 积分榜次要标签：赛程、表头列等 */
export const standingLabelClass = `text-xs font-medium ${standingAccentClass}`;

/** 蓝底卡片内行间交替底色，色差柔和 */
export function standingRowSurface(index: number) {
  return index % 2 === 0 ? "bg-paper/[0.09]" : "bg-black/[0.07]";
}
