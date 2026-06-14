# 咪咕精彩视频同步说明

本文件记录首页「精彩视频」与 `/videos` 页面与咪咕视频的数据对应关系。更新视频数据时**必须先读此文件**。

## 咪咕来源页面

- **专题 URL（固定）**：https://www.miguvideo.com/p/home/7a04ba680afd4b49a31913c5b36e4557
- 可通过环境变量覆盖：`MIGU_VIDEO_URL`
- 若服务端无法直接访问，可将页面 HTML 保存到项目根目录并设置：`MIGU_VIDEO_HTML_PATH=文件名.html`

## 栏目对应关系（不可改名）

| 本站 Tab / 栏目 | `video_category` | 咪咕页面区块 | 咪咕 group 名称 |
|----------------|------------------|-------------|----------------|
| **聚焦世界杯** | `focus` | 最新资讯 | `世界杯最新资讯` |
| **48队巡礼** | `teams` | 逐鹿美加墨·世界杯48队巡礼 | `逐鹿美加墨` |
| **星耀美加墨** | `stars` | 星耀美加墨·世界杯20大球星 | `星耀美加墨` |

## 数据库

- **表**：`public.worldcup_items`
- **筛选**：`section = 'videos'`
- **栏目字段**：`video_category`（`focus` / `teams` / `stars`）
- **排序**：`published_at` 降序（最新在前），其次 `display_order`
- **展示**：
  - 首页：每栏目最多 6 条（`getVideoSections(6)`）
  - `/videos`：每栏目全部条目，**每页 12 条**分页展示

## 更新命令

```powershell
npm run db:seed:migu-videos
```

脚本会：

1. 拉取咪咕专题页 HTML
2. 解析 `window.__INITIAL_GROUPS_STATE__`
3. 按上表三个 group 提取视频（封面、时长、标题、详情链接）
4. 使用咪咕 `publishTime` 作为 `published_at`
5. **增量 upsert**：保留历史视频，新视频写入，同标题则更新元数据（不整表删除）

## 采集脚本

- `scripts/seed-migu-videos.mjs`

## 前端读取

- `lib/video-service.ts` → `getVideoSections()`
- `components/video-board.tsx`

## 注意事项

- 视频详情链接格式：`https://www.miguvideo.com/p/detail/{pID}`
- 不要与百度头条数据混淆：`section = 'headlines'` 来自百度，与咪咕视频无关
- 更新后 Vercel 约有 5 分钟服务端缓存，可强制刷新或等待缓存过期
