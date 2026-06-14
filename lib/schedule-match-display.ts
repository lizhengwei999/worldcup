import type { ScheduleMatch } from "@/lib/schedule-data";
import type { ScheduleMatchDetail } from "@/lib/schedule-service";

export const MIGU_VIDEO_LABEL = "咪咕视频";
export const MATCH_REPORT_LABEL = "比赛战报";
export const MIGU_LIVE_HOME_URL = "https://www.miguvideo.com/p/home";
export const TOURNAMENT_YEAR = 2026;
export const LIVE_DURATION_MS = 2 * 60 * 60 * 1000;

export type ResolvedScheduleMatchDisplay = {
  isFinished: boolean;
  isLive: boolean;
  isUpcoming: boolean;
  liveLabel: string;
  statusLabel: string;
};

function parseKickTimeInBeijing(dayId: string, kickTime: string) {
  const dayParts = dayId.split("-").map(Number);
  const timeParts = kickTime.trim().split(":").map(Number);

  if (dayParts.length !== 2 || timeParts.length < 2) {
    return null;
  }

  const [month, day] = dayParts;
  const [hour, minute] = timeParts;

  if (!month || !day || Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }

  const iso = `${TOURNAMENT_YEAR}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+08:00`;
  const date = new Date(iso);

  return Number.isNaN(date.getTime()) ? null : date;
}

function hasRecordedScore(value?: string | null) {
  return value != null && value !== "-" && value !== "—" && value.trim() !== "";
}

export function normalizeScheduleLiveLabel(liveLabel?: string | null, finished = false) {
  if (finished) {
    return MATCH_REPORT_LABEL;
  }

  if (!liveLabel) {
    return MIGU_VIDEO_LABEL;
  }

  if (/雷速|动画/.test(liveLabel)) {
    return MIGU_VIDEO_LABEL;
  }

  return liveLabel;
}

function isDbFinished(match: Pick<ScheduleMatch, "statusLabel" | "homeScore" | "awayScore">) {
  if (match.statusLabel === "已结束") {
    return true;
  }

  return hasRecordedScore(match.homeScore) && hasRecordedScore(match.awayScore);
}

export function resolveScheduleMatchDisplay(
  match: ScheduleMatch,
  dayId: string,
  now = new Date()
): ResolvedScheduleMatchDisplay {
  const dbLiveLabel = match.liveLabel ?? "";

  if (isDbFinished(match)) {
    return {
      isFinished: true,
      isLive: false,
      isUpcoming: false,
      liveLabel: normalizeScheduleLiveLabel(dbLiveLabel, true),
      statusLabel: "已结束"
    };
  }

  const kickAt = parseKickTimeInBeijing(dayId, match.time);
  if (!kickAt) {
    const upcoming = (match.statusLabel ?? "未开赛") === "未开赛";
    return {
      isFinished: false,
      isLive: false,
      isUpcoming: upcoming,
      liveLabel: normalizeScheduleLiveLabel(dbLiveLabel, false),
      statusLabel: match.statusLabel ?? "未开赛"
    };
  }

  const endAt = kickAt.getTime() + LIVE_DURATION_MS;
  const nowMs = now.getTime();

  if (nowMs < kickAt.getTime()) {
    return {
      isFinished: false,
      isLive: false,
      isUpcoming: true,
      liveLabel: MIGU_VIDEO_LABEL,
      statusLabel: "未开赛"
    };
  }

  if (nowMs < endAt) {
    return {
      isFinished: false,
      isLive: true,
      isUpcoming: false,
      liveLabel: MIGU_VIDEO_LABEL,
      statusLabel: "正在直播"
    };
  }

  return {
    isFinished: true,
    isLive: false,
    isUpcoming: false,
    liveLabel: MATCH_REPORT_LABEL,
    statusLabel: "已结束"
  };
}

export function resolveScheduleDetailDisplay(
  detail: ScheduleMatchDetail,
  now = new Date()
): ResolvedScheduleMatchDisplay {
  const kickLabel = detail.kickLabel?.trim() ?? "";
  const kickParts = kickLabel.match(/^(\d{2}-\d{2})\s+(\d{1,2}:\d{2})/);

  if (!kickParts) {
    const finished = detail.statusText === "已结束" || hasRecordedScore(detail.homeScore) && hasRecordedScore(detail.awayScore);
    return {
      isFinished: finished,
      isLive: detail.statusText === "正在直播",
      isUpcoming: !finished && detail.statusText === "未开赛",
      liveLabel: finished ? MATCH_REPORT_LABEL : MIGU_VIDEO_LABEL,
      statusLabel: detail.statusText
    };
  }

  return resolveScheduleMatchDisplay(
    {
      away: { name: detail.awayName },
      awayScore: detail.awayScore,
      group: detail.matchStage,
      home: { name: detail.homeName },
      homeScore: detail.homeScore,
      id: detail.slug,
      liveLabel: detail.reportUrl ? MATCH_REPORT_LABEL : MIGU_VIDEO_LABEL,
      slug: detail.slug,
      statusLabel: detail.statusText,
      time: kickParts[2]
    },
    kickParts[1],
    now
  );
}
