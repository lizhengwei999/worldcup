create table if not exists public.worldcup_schedule_match_previews (
  match_id text primary key references public.worldcup_schedule_matches(id) on delete cascade,
  slug text not null unique,
  match_stage text not null,
  kick_label text not null,
  home_name text not null,
  home_logo_url text,
  away_name text not null,
  away_logo_url text,
  summary text not null,
  home_intro jsonb not null default '[]'::jsonb,
  away_intro jsonb not null default '[]'::jsonb,
  baidu_search_url text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists worldcup_schedule_match_previews_slug_idx
  on public.worldcup_schedule_match_previews(slug);

create index if not exists worldcup_schedule_match_previews_active_idx
  on public.worldcup_schedule_match_previews(is_active);
