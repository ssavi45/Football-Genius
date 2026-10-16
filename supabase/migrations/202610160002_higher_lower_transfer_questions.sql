-- Schema v2: active current valuations and individual transfer questions.
create or replace function public.publish_higher_lower_snapshot(payload jsonb)
returns text language plpgsql security definer set search_path = public, pg_temp as $$
declare
  snapshot_version text := payload->>'version';
  category text;
  item jsonb;
  move jsonb;
  club jsonb;
begin
  if payload->>'schemaVersion' is distinct from '2'
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
    foreach category in array array['goals','assists','marketValue'] loop
      if item->'stats'->category is null
        or (jsonb_typeof(item->'stats'->category) <> 'null' and
          (jsonb_typeof(item->'stats'->category) <> 'number' or (item->'stats'->>category) !~ '^\d+$')) then
        raise exception 'Missing or invalid statistic %', category;
      end if;
    end loop;
    if (item->>'isRetired' = 'true' and jsonb_typeof(item->'stats'->'marketValue') <> 'null')
      or item->'stats'->>'marketValue' = '0' then
      raise exception 'Market value requires an active valued player';
    end if;
    if jsonb_typeof(item->'transfers') is distinct from 'array' then
      raise exception 'Missing transfer history';
    end if;
    if (select count(distinct t->>'id') from jsonb_array_elements(item->'transfers') t) <> jsonb_array_length(item->'transfers') then
      raise exception 'Duplicate transfer identity';
    end if;
    for move in select * from jsonb_array_elements(item->'transfers') loop
      if coalesce(move->>'id', '') = '' or jsonb_typeof(move->'fee') is distinct from 'number'
        or (move->>'fee') !~ '^\d+$' or coalesce(move->>'date','') !~ '^\d{4}-\d{2}-\d{2}$'
        or move->'from'->>'id' = move->'to'->>'id' then
        raise exception 'Invalid transfer';
      end if;
      if (move->>'date')::date > (item->>'fetchedAt')::timestamptz::date then
        raise exception 'Future transfer';
      end if;
      foreach category in array array['from','to'] loop
        club := move->category;
        if coalesce(club->>'id','') !~ '^\d+$' or coalesce(club->>'name','') = ''
          or coalesce(club->>'crest','') !~ '^https://' then
          raise exception 'Invalid transfer club';
        end if;
      end loop;
    end loop;
  end loop;
  foreach category in array array['goals','assists','marketValue'] loop
    if (select count(*) from jsonb_array_elements(payload->'players') p where jsonb_typeof(p->'stats'->category) = 'number') < 20 then
      raise exception 'Not enough eligible players for %', category;
    end if;
  end loop;
  if (select count(*) from jsonb_array_elements(payload->'players') p where jsonb_array_length(p->'transfers') > 0) < 20 then
    raise exception 'Not enough eligible transfer players';
  end if;
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
