# 全站自动数据同步

本文件记录世界杯站点 **Supabase 全量数据定时更新** 与 **GitHub 自动推送** 规则。维护采集脚本或定时任务时**必须先读此文件**。

## 授权说明（无需确认）

用户已授权：

- 按下列时间表自动执行全站数据同步
- 直接写入 Supabase 生产数据库
- 同步成功后自动 `git commit` 并 `git push` 到 `main`
- 本地或 CI 执行同步命令时 **不需要再次向用户确认**

## 北京时间执行时刻（共 18 次/日）

| 时刻 |
|------|
| 00:00、01:00、03:00、04:00、04:30、05:00、06:00、07:00、07:30 |
| 08:00、08:30、09:00、09:30、10:00、11:00、12:00、13:00、14:00 |

由 GitHub Actions 工作流 `.github/workflows/data-sync.yml` 在对应 UTC 时刻触发。

## 采集来源（记忆文件中的固定网址）

### 百度体育 / 搜索

| 模块 | 采集地址 | 脚本 | npm 命令 |
|------|----------|------|----------|
| 积分排名 | https://tiyu.baidu.com/al/match?match=世界杯&tab=排名&rankChildTab=teamRank | `scripts/seed-standings.mjs` | `db:seed:standings` |
| 全部赛程 | https://tiyu.baidu.com/al/match?match=世界杯&tab=赛程 | `scripts/seed-schedule.mjs` | `db:seed:schedule` |
| 头条 | https://www.baidu.com/s?wd=世界杯（世界杯搜索页） | `scripts/seed-headlines.mjs` | `db:seed:headlines` |
| 比赛详情 / 战报 | 赛程各场 `source_url`（百度体育赛况页） | `scripts/seed-match-details.mjs` | `db:seed:match-details` |
| 赛前预览 | 百度搜索（主客队 + 世界杯） | `scripts/seed-schedule-previews.mjs` | `db:seed:schedule-previews` |

### 咪咕视频

| 模块 | 采集地址 | 脚本 | npm 命令 |
|------|----------|------|----------|
| 精彩视频 | https://www.miguvideo.com/p/home/7a04ba680afd4b49a31913c5b36e4557 | `scripts/seed-migu-videos.mjs` | `db:seed:migu-videos` |
| 球员排名 | API: `https://webapi.miguvideo.com/gateway/oes-sport-static/300/football/figures/ranking/110000005666/{statType}` | `scripts/seed-migu-player-rankings.mjs` | `db:seed:migu-player-rankings` |

详细栏目映射见：

- `docs/migu-video-sync.md`
- `docs/migu-player-rankings-sync.md`
- `.cursor/rules/migu-video-sync.mdc`
- `.cursor/rules/migu-player-rankings-sync.mdc`

## 全站同步命令

```powershell
npm run db:sync:all
```

执行顺序（`scripts/sync-all.mjs`）：

1. `db:schema:content` — 应用内容表结构
2. `db:seed:standings` — 积分
3. `db:seed:schedule` — 赛程
4. `db:seed:headlines` — 头条
5. `db:seed:match-details` — 已结束比赛战报
6. `db:seed:schedule-previews` — 未开赛赛前介绍
7. `db:seed:migu-videos` — 咪咕视频三栏目
8. `db:seed:migu-player-rankings` — 球员排名

百度子集（不含咪咕、不含赛前预览）仍可用：

```powershell
npm run db:seed:baidu-all
```

## GitHub Actions

- **工作流**：`.github/workflows/data-sync.yml`
- **手动触发**：仓库 Actions → Scheduled Data Sync → Run workflow
- **同步记录**：`data/sync-last-run.json`（每次成功同步后更新并推送）

### 所需 Secrets（仓库 Settings → Secrets and variables → Actions）

| Secret | 说明 |
|--------|------|
| `SUPABASE_DB_URL` | Supabase Postgres 连接串（推荐） |
| `DATABASE_URL` | 同上，备用 |
| `MIGU_VIDEO_URL` | 可选，覆盖咪咕专题页 |
| `MIGU_PLAYER_RANK_SEASON_ID` | 可选 |
| `MIGU_PLAYER_RANK_API_BASE` | 可选 |

`GITHUB_TOKEN` 默认具备 `contents: write`，用于推送 `sync-last-run.json`。

## 注意事项

- 同步主要更新 **Supabase**；GitHub 推送用于记录同步时间与触发部署流水线。
- 单场脚本失败时 `db:sync:all` 会继续其余步骤，最后汇总错误并 exit 1。
- 服务端约有 5 分钟缓存，更新后前端可能需等待或强制刷新。
