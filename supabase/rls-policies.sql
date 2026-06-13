-- Public read policies for Vercel / browser clients using the anon key.

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'worldcup_items',
    'worldcup_groups',
    'worldcup_teams',
    'worldcup_standings',
    'worldcup_schedule_days',
    'worldcup_schedule_matches',
    'worldcup_schedule_match_details'
  ]
  loop
    execute format('grant select on public.%I to anon, authenticated', table_name);
    execute format('drop policy if exists "Public read access" on public.%I', table_name);
    execute format(
      'create policy "Public read access" on public.%I for select to anon, authenticated using (true)',
      table_name
    );
  end loop;
end $$;

grant select on public.worldcup_group_standings to anon, authenticated;
grant select on public.worldcup_schedule_view to anon, authenticated;
