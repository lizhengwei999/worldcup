/**
 * 咪咕球员排名 statType 配置。
 * 更新球员排名数据前请先读 docs/migu-player-rankings-sync.md
 */
export type MiguPlayerRankCategory = {
  categoryOrder: number;
  columnLabel: string;
  key: string;
  label: string;
  showPercent: boolean;
  statType: number;
};

/** Migu oes-sport-static figures ranking types for season 110000005666 */
export const MIGU_PLAYER_RANK_CATEGORIES: MiguPlayerRankCategory[] = [
  { statType: 29, key: "goals", label: "射手榜", columnLabel: "进球", showPercent: false, categoryOrder: 1 },
  { statType: 30, key: "assists", label: "助攻榜", columnLabel: "助攻", showPercent: false, categoryOrder: 2 },
  { statType: 33, key: "shots", label: "射门", columnLabel: "射门", showPercent: false, categoryOrder: 3 },
  { statType: 34, key: "shots_on_target", label: "射正", columnLabel: "射正", showPercent: false, categoryOrder: 4 },
  { statType: 35, key: "passes", label: "传球", columnLabel: "传球", showPercent: false, categoryOrder: 5 },
  { statType: 36, key: "key_passes", label: "关键传球", columnLabel: "关键传球", showPercent: false, categoryOrder: 6 },
  {
    statType: 37,
    key: "pass_accuracy",
    label: "传球成功率",
    columnLabel: "传球成功率",
    showPercent: true,
    categoryOrder: 7
  },
  { statType: 38, key: "tackles", label: "抢断", columnLabel: "抢断", showPercent: false, categoryOrder: 8 },
  { statType: 39, key: "interceptions", label: "拦截", columnLabel: "拦截", showPercent: false, categoryOrder: 9 },
  { statType: 41, key: "clearances", label: "解围", columnLabel: "解围", showPercent: false, categoryOrder: 10 },
  { statType: 42, key: "saves", label: "扑救", columnLabel: "扑救", showPercent: false, categoryOrder: 11 },
  { statType: 0, key: "offsides", label: "越位", columnLabel: "越位", showPercent: false, categoryOrder: 12 },
  { statType: 31, key: "yellow_cards", label: "黄牌", columnLabel: "黄牌", showPercent: false, categoryOrder: 13 },
  { statType: 32, key: "red_cards", label: "红牌", columnLabel: "红牌", showPercent: false, categoryOrder: 14 },
  { statType: 43, key: "fouls", label: "犯规", columnLabel: "犯规", showPercent: false, categoryOrder: 15 },
  { statType: 44, key: "fouls_suffered", label: "被犯规", columnLabel: "被犯规", showPercent: false, categoryOrder: 16 },
  { statType: 27, key: "appearances", label: "出场", columnLabel: "出场", showPercent: false, categoryOrder: 17 },
  { statType: 28, key: "starts", label: "首发", columnLabel: "首发", showPercent: false, categoryOrder: 18 },
  { statType: 45, key: "minutes", label: "出场时间", columnLabel: "出场时间", showPercent: false, categoryOrder: 19 },
  { statType: 40, key: "dribbles", label: "过人成功", columnLabel: "过人成功", showPercent: false, categoryOrder: 20 }
];

export const MIGU_PLAYER_RANK_SEASON_ID = "110000005666";
export const MIGU_PLAYER_RANK_COMPETITION_ID = "100000000991";
export const MIGU_PLAYER_RANK_API_BASE =
  "https://webapi.miguvideo.com/gateway/oes-sport-static/300/football/figures/ranking";
