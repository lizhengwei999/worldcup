create table if not exists public.worldcup_player_rankings (
  stat_type integer not null,
  rank integer not null check (rank > 0),
  figure_id text not null,
  player_name text not null,
  player_image_url text,
  team_name text not null,
  team_logo_url text,
  matches_played integer not null default 0 check (matches_played >= 0),
  stat_value text not null,
  stat_key text not null,
  stat_label text not null,
  column_label text not null,
  show_percent boolean not null default false,
  category_order integer not null,
  updated_at timestamptz not null default now(),
  primary key (stat_type, figure_id)
);

create index if not exists worldcup_player_rankings_category_idx
  on public.worldcup_player_rankings (category_order, rank);

create index if not exists worldcup_player_rankings_stat_type_rank_idx
  on public.worldcup_player_rankings (stat_type, rank);
