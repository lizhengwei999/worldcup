# 美加墨世界杯小程序落地页

技术栈：Next.js App Router、Supabase、Tailwind CSS、Lucide React。

## 页面规划

- `/`：首页，聚合世界杯头条、精彩视频、全部赛程、积分排名。
- `/headlines`：世界杯头条列表。
- `/videos`：精彩视频列表。
- `/schedule`：全部赛程列表。
- `/standings`：积分排名列表。
- `/:section/:slug`：动态详情页，承接头条、视频、赛程和积分专题。

## 百度动态链接规则

每个详情页都会根据标题生成百度搜索链接：

```text
https://www.baidu.com/s?ie=utf-8&wd=美加墨世界杯 + 标题
```

这样页面本身保持统一模板，实时内容由百度搜索结果页承接。后续如果要自动生产正文，可以让定时任务把百度结果摘要写入 Supabase 的 `worldcup_items` 表。

## Supabase 表建议

```sql
create table public.worldcup_items (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('headlines', 'videos')),
  title text not null,
  summary text not null,
  slug text not null unique,
  image_url text,
  source text,
  published_at timestamptz default now(),
  tags text[] default '{}',
  body text[] default '{}'
);
```

配置 `.env.local`：

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

未配置 Supabase 时，页面会使用本地种子数据，方便直接预览和部署。

## 本地运行

```bash
npm install
npm run dev
```
