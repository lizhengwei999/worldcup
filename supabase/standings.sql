create extension if not exists pgcrypto;

create table if not exists public.worldcup_groups (
  id uuid primary key default gen_random_uuid(),
  group_code text not null unique,
  name text not null,
  display_order integer not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.worldcup_teams (
  id text primary key,
  name text not null unique,
  logo_url text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.worldcup_standings (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.worldcup_groups(id) on delete cascade,
  team_id text not null references public.worldcup_teams(id) on delete cascade,
  group_rank integer not null check (group_rank > 0),
  played integer not null default 0 check (played >= 0),
  wins integer not null default 0 check (wins >= 0),
  draws integer not null default 0 check (draws >= 0),
  losses integer not null default 0 check (losses >= 0),
  goals_for integer not null default 0 check (goals_for >= 0),
  goals_against integer not null default 0 check (goals_against >= 0),
  goal_diff integer generated always as (goals_for - goals_against) stored,
  points integer not null default 0 check (points >= 0),
  updated_at timestamptz not null default now(),
  unique (group_id, team_id),
  unique (group_id, group_rank)
);

create index if not exists worldcup_standings_group_rank_idx
  on public.worldcup_standings(group_id, group_rank);

create or replace view public.worldcup_group_standings as
select
  g.group_code,
  g.name as group_name,
  g.display_order as group_display_order,
  t.id as team_id,
  t.name as team_name,
  t.logo_url,
  t.slug,
  s.group_rank,
  s.played,
  s.wins,
  s.draws,
  s.losses,
  s.goals_for,
  s.goals_against,
  s.goal_diff,
  s.points,
  s.updated_at
from public.worldcup_standings s
join public.worldcup_groups g on g.id = s.group_id
join public.worldcup_teams t on t.id = s.team_id;
