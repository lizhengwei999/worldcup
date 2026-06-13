create table if not exists public.worldcup_items (
  id text primary key,
  section text not null check (section in ('headlines', 'videos')),
  title text not null,
  eyebrow text not null default '资讯',
  summary text not null,
  slug text not null unique,
  image_url text,
  source text,
  published_at timestamptz not null default now(),
  content_type text not null default 'article' check (content_type in ('article', 'video', 'live')),
  video_url text,
  external_url text,
  video_category text,
  duration text,
  display_order integer not null default 0,
  tags text[] not null default '{}',
  body text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.worldcup_items
  add column if not exists eyebrow text not null default '资讯',
  add column if not exists content_type text not null default 'article',
  add column if not exists video_url text,
  add column if not exists external_url text,
  add column if not exists video_category text,
  add column if not exists duration text,
  add column if not exists display_order integer not null default 0,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create index if not exists worldcup_items_section_published_idx
  on public.worldcup_items(section, published_at desc);

create index if not exists worldcup_items_slug_idx
  on public.worldcup_items(slug);

create index if not exists worldcup_items_video_category_order_idx
  on public.worldcup_items(video_category, display_order)
  where section = 'videos';
