create extension if not exists pgcrypto;

create table if not exists public.worldcup_schedule_days (
  id text primary key,
  date_text text not null,
  weekday text,
  display_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.worldcup_schedule_matches (
  id text primary key,
  day_id text not null references public.worldcup_schedule_days(id) on delete cascade,
  match_order integer not null,
  kick_time text not null,
  start_time timestamptz,
  match_name text not null,
  match_stage text not null,
  home_name text not null,
  home_logo_url text,
  home_score text,
  away_name text not null,
  away_logo_url text,
  away_score text,
  status_code text,
  status_text text not null default '未开赛',
  live_text text not null default '动画直播',
  source_url text,
  slug text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (day_id, match_order)
);

create index if not exists worldcup_schedule_matches_day_order_idx
  on public.worldcup_schedule_matches(day_id, match_order);

create table if not exists public.worldcup_schedule_match_details (
  match_id text primary key references public.worldcup_schedule_matches(id) on delete cascade,
  slug text not null unique,
  title text not null,
  match_stage text not null,
  kick_label text,
  home_name text not null,
  home_logo_url text,
  home_rank_text text,
  home_score text,
  away_name text not null,
  away_logo_url text,
  away_rank_text text,
  away_score text,
  status_text text not null default '未开赛',
  winner text,
  report_title text,
  report_provider text,
  report_url text,
  report_image_url text,
  focus_items jsonb not null default '[]'::jsonb,
  incidents jsonb not null default '[]'::jsonb,
  venue text,
  attendance text,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists worldcup_schedule_match_details_slug_idx
  on public.worldcup_schedule_match_details(slug);

create or replace view public.worldcup_schedule_view as
select
  d.id as day_id,
  d.date_text,
  d.weekday,
  d.display_order as day_display_order,
  m.id as match_id,
  m.match_order,
  m.kick_time,
  m.start_time,
  m.match_name,
  m.match_stage,
  m.home_name,
  m.home_logo_url,
  m.home_score,
  m.away_name,
  m.away_logo_url,
  m.away_score,
  m.status_code,
  m.status_text,
  m.live_text,
  m.source_url,
  m.slug,
  m.updated_at
from public.worldcup_schedule_days d
join public.worldcup_schedule_matches m on m.day_id = d.id;
