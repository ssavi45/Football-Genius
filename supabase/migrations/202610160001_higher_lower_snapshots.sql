-- Publish an entire validated dataset atomically. Game sessions pin its immutable version.
create table if not exists public.higher_lower_snapshots (
  version text primary key,
  created_at timestamptz not null,
  player_count integer not null check (player_count = 100),
  payload jsonb not null check (jsonb_typeof(payload->'players') = 'array' and jsonb_array_length(payload->'players') = 100)
);

create table if not exists public.higher_lower_current (
  id boolean primary key default true check (id),
  version text not null references public.higher_lower_snapshots(version),
  published_at timestamptz not null default now()
);

alter table public.higher_lower_snapshots enable row level security;
alter table public.higher_lower_current enable row level security;
create policy "Public can read Higher Lower snapshots" on public.higher_lower_snapshots for select to anon, authenticated using (true);
create policy "Public can read current Higher Lower version" on public.higher_lower_current for select to anon, authenticated using (true);
grant select on public.higher_lower_snapshots, public.higher_lower_current to anon, authenticated;

create or replace function public.publish_higher_lower_snapshot(payload jsonb)
returns text language plpgsql security definer set search_path = public, pg_temp as $$
declare
  snapshot_version text := payload->>'version';
  category text;
  item jsonb;
begin
  if payload->>'schemaVersion' is distinct from '1'
    or payload->>'playerCount' is distinct from '100'
    or snapshot_version is null or length(snapshot_version) > 100
    or jsonb_typeof(payload->'players') is distinct from 'array'
    or jsonb_array_length(payload->'players') <> 100 then
    raise exception 'Expected a complete Higher Lower snapshot of 100 players';
  end if;
  if (select count(distinct p->>'id') from jsonb_array_elements(payload->'players') p) <> 100
    or (select count(distinct p->>'transfermarktId') from jsonb_array_elements(payload->'players') p) <> 100 then
    raise exception 'Duplicate or missing player identity';
  end if;
  for item in select * from jsonb_array_elements(payload->'players') loop
    if coalesce(item->>'name', '') = '' or item->>'transfermarktId' !~ '^\d+$'
      or item->>'fetchedAt' is null or jsonb_typeof(item->'isRetired') is distinct from 'boolean' then
      raise exception 'Invalid player profile';
    end if;
    foreach category in array array['goals','assists','marketValue','transfer'] loop
      if item->'stats'->category is null
        or (jsonb_typeof(item->'stats'->category) <> 'null' and
          (jsonb_typeof(item->'stats'->category) <> 'number' or (item->'stats'->>category) !~ '^\d+$')) then
        raise exception 'Missing or invalid statistic %', category;
      end if;
    end loop;
  end loop;
  foreach category in array array['goals','assists','marketValue','transfer'] loop
    if (select count(*) from jsonb_array_elements(payload->'players') p where jsonb_typeof(p->'stats'->category) = 'number') < 20 then
      raise exception 'Not enough eligible players for %', category;
    end if;
  end loop;
  if not exists(select 1 from jsonb_array_elements(payload->'players') p where p->>'isRetired' = 'true')
    or not exists(select 1 from jsonb_array_elements(payload->'players') p where p->>'isRetired' = 'false') then
    raise exception 'Include active and retired players';
  end if;
  insert into public.higher_lower_snapshots(version, created_at, player_count, payload)
    values (snapshot_version, (payload->>'createdAt')::timestamptz, 100, payload)
    on conflict (version) do nothing;
  if exists(select 1 from public.higher_lower_snapshots s where s.version = snapshot_version and s.payload <> $1) then
    raise exception 'Snapshot versions are immutable';
  end if;
  -- One transaction: the pointer moves only after every validation and the full insert succeeds.
  insert into public.higher_lower_current(id, version) values (true, snapshot_version)
    on conflict (id) do update set version = excluded.version, published_at = now();
  return snapshot_version;
end;
$$;

revoke all on function public.publish_higher_lower_snapshot(jsonb) from public, anon, authenticated;
grant execute on function public.publish_higher_lower_snapshot(jsonb) to service_role;
