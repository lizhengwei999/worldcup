# 咪咕球员排名同步说明

本文件记录 `/standings` 页面「球员排名」与咪咕世界杯球员榜的数据对应关系。更新球员排名时**必须先读此文件**。

## 咪咕来源页面

- **球员榜 URL（固定）**：https://www.miguvideo.com/mgs/website/prd/usmcaCup2026MatchData.html?seasonIdFk=110000005666&competitionId=100000000991&tab=player
- **赛季 ID**：`110000005666`（`seasonIdFk`）
- **赛事 ID**：`100000000991`（`competitionId`）

可通过环境变量覆盖：

- `MIGU_PLAYER_RANK_SEASON_ID`
- `MIGU_PLAYER_RANK_API_BASE`

## 实际数据 API（非页面 HTML）

咪咕球员榜页面为 JS 壳，数据来自网关 JSON 接口（非 `player-season-rank`，该路径当前 404）：

```
GET https://webapi.miguvideo.com/gateway/oes-sport-static/300/football/figures/ranking/{seasonIdFk}/{statisticsType}
```

示例（助攻榜）：

```
https://webapi.miguvideo.com/gateway/oes-sport-static/300/football/figures/ranking/110000005666/30
```

响应字段（`data.football[]`）：

| 字段 | 用途 |
|------|------|
| `rank` | 排名 |
| `figureName` / `figureNickName` | 球员名 |
| `imgUrl` | 球员头像 |
| `teamName` / `teamShortName` | 球队 |
| `teamImgUrl` / `teamCountryLogo` | 队旗 |
| `appearances` | 场次 |
| `score` | 统计值 |
| `figureIdFK` / `figureId` | 球员唯一 ID |

## 统计类型对应（侧边栏）

| 本站 Tab | `stat_key` | `statisticsType` | 列名 |
|---------|------------|------------------|------|
| 射手榜 | `goals` | 29 | 进球 |
| 助攻榜 | `assists` | 30 | 助攻 |
| 射门 | `shots` | 33 | 射门 |
| 射正 | `shots_on_target` | 34 | 射正 |
| 传球 | `passes` | 35 | 传球 |
| 关键传球 | `key_passes` | 36 | 关键传球 |
| 传球成功率 | `pass_accuracy` | 37 | 传球成功率（展示加 `%`） |
| 抢断 | `tackles` | 38 | 抢断 |
| 拦截 | `interceptions` | 39 | 拦截 |
| 解围 | `clearances` | 41 | 解围 |
| 扑救 | `saves` | 42 | 扑救 |
| 越位 | `offsides` | — | 暂无 API statType，页面显示空态 |
| 黄牌 | `yellow_cards` | 31 | 黄牌 |
| 红牌 | `red_cards` | 32 | 红牌 |
| 犯规 | `fouls` | 43 | 犯规 |
| 被犯规 | `fouls_suffered` | 44 | 被犯规 |
| 出场 | `appearances` | 27 | 出场 |
| 首发 | `starts` | 28 | 首发 |
| 出场时间 | `minutes` | 45 | 出场时间 |
| 过人成功 | `dribbles` | 40 | 过人成功 |

配置源码：`lib/migu-player-rankings.ts`（`MIGU_PLAYER_RANK_CATEGORIES`）

## 数据库

- **表**：`public.worldcup_player_rankings`
- **Schema**：`supabase/player-rankings.sql`
- **主键**：`(stat_type, figure_id)`
- **策略**：按 `stat_type` 先删后插（每个统计类型全量替换）

## 更新命令

```powershell
npm run db:seed:migu-player-rankings
```

脚本会：

1. 按上表 `statisticsType` 依次请求咪咕 API
2. 写入 `worldcup_player_rankings`
3. 跳过 `statType = 0`（越位）及无数据的类型

## 采集脚本

- `scripts/seed-migu-player-rankings.mjs`

## 前端读取

- `lib/player-rankings-service.ts` → `getPlayerRankCategories()`
- `components/player-rankings-board.tsx`
- `app/standings/standings-stage.tsx`（Tab「球员排名」）
- 直达链接：`/standings?rankChildTab=playerRank`

## 注意事项

- 不要与百度积分榜数据混淆：积分榜来自 `worldcup_standings`，球员排名来自咪咕
- 服务端缓存约 5 分钟（`getCachedServerData`），更新后可等待或重启 dev server
- 生产环境需已执行 `supabase/player-rankings.sql` 与 `supabase/rls-policies.sql`
- Supabase REST 单次默认最多 1000 行；`player-rankings-service` 已分页拉取全部记录（约 2100+ 行），否则「扑救」及之后栏目会显示为空
