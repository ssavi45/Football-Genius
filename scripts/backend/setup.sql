-- Football Genius: fresh-project backend setup
-- Run in the Supabase SQL Editor for project bcghsiwettjrjxgzbtvu.
-- Includes migration history; safe to rerun the identical setup.
-- No API keys or passwords are included.
begin;
create table if not exists public.football_genius_migrations(name text primary key,sha256 text not null,applied_at timestamptz not null default now());
alter table public.football_genius_migrations enable row level security;
revoke all on public.football_genius_migrations from anon,authenticated;
grant all on public.football_genius_migrations to service_role;

-- 202610150000_core_backend.sql
do $fg_migration$
begin
  if exists(select 1 from public.football_genius_migrations where name='202610150000_core_backend.sql' and sha256<>'da80050d24cf294ff573cf5ac6689038f69daedf65ea1320f647837ebfb91da2') then raise exception 'Migration changed after application: 202610150000_core_backend.sql'; end if;
  if not exists(select 1 from public.football_genius_migrations where name='202610150000_core_backend.sql') then
    execute $fg_sql_da80050d24cf294f$
-- Shared account, progress and results schema. Apply before game-specific migrations.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null check (char_length(trim(username)) between 1 and 32),
  avatar_url text,
  total_xp bigint not null default 0 check (total_xp >= 0),
  coins bigint not null default 0 check (coins >= 0),
  games_played integer not null default 0,
  games_won integer not null default 0,
  streak_days integer not null default 0,
  best_streak integer not null default 0,
  last_played_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant update(username,avatar_url) on public.profiles to authenticated;
grant all on public.profiles to service_role;
create policy profiles_public_read on public.profiles for select using (true);
create policy profiles_owner_edit on public.profiles for update to authenticated using ((select auth.uid())=id) with check ((select auth.uid())=id);

create or replace function public.initialize_football_profile()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
  insert into public.profiles(id,username,avatar_url)
  values(new.id,left(coalesce(nullif(trim(new.raw_user_meta_data->>'name'),''),nullif(split_part(new.email,'@',1),''),'Scout_'||left(new.id::text,8)),32),new.raw_user_meta_data->>'avatar_url')
  on conflict(id) do nothing;
  return new;
end $$;
revoke all on function public.initialize_football_profile() from public,anon,authenticated;
drop trigger if exists initialize_football_profile on auth.users;
create trigger initialize_football_profile after insert on auth.users for each row execute function public.initialize_football_profile();
insert into public.profiles(id,username,avatar_url)
select id,left(coalesce(nullif(trim(raw_user_meta_data->>'name'),''),nullif(split_part(email,'@',1),''),'Scout_'||left(id::text,8)),32),raw_user_meta_data->>'avatar_url' from auth.users on conflict(id) do nothing;

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  sound_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.user_preferences enable row level security;
revoke all on public.user_preferences from anon,authenticated;
grant select,insert,update on public.user_preferences to authenticated;
grant all on public.user_preferences to service_role;
create policy preferences_owner on public.user_preferences for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_mode text not null check(game_mode in ('scoreline','matrix','scouts-duel','journeyman','higher-lower','tunnel-talk','scramble','pixel-pitch')),
  source_id text not null,
  score numeric(12,2) not null check(score>=0),
  xp integer not null check(xp>=0),
  won boolean not null,
  created_at timestamptz not null default now(),
  unique(user_id,game_mode,source_id)
);
alter table public.game_sessions enable row level security;
revoke all on public.game_sessions from anon,authenticated;
grant select on public.game_sessions to authenticated;
grant all on public.game_sessions to service_role;
create policy sessions_owner_read on public.game_sessions for select to authenticated using ((select auth.uid())=user_id);
create index if not exists game_sessions_user_recent on public.game_sessions(user_id,created_at desc);
create index if not exists game_sessions_mode_rank on public.game_sessions(game_mode,score desc);

create table if not exists public.xp_ledger (
  user_id uuid not null references auth.users(id) on delete cascade,
  game_mode text not null,
  source_id text not null,
  xp integer not null check(xp between 0 and 10000),
  created_at timestamptz not null default now(),
  primary key(user_id,game_mode,source_id)
);
alter table public.xp_ledger enable row level security;
revoke all on public.xp_ledger from anon,authenticated;
grant select on public.xp_ledger to authenticated;
grant all on public.xp_ledger to service_role;
create policy xp_owner_read on public.xp_ledger for select to authenticated using ((select auth.uid())=user_id);

create table if not exists public.game_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  slot text not null check(char_length(slot) between 1 and 80),
  game_mode text not null,
  run_id uuid not null,
  revision bigint not null default 0,
  state jsonb not null,
  requests jsonb not null default '[]',
  updated_at timestamptz not null default now(),
  primary key(user_id,slot)
);
alter table public.game_progress enable row level security;
revoke all on public.game_progress from anon,authenticated;
grant all on public.game_progress to service_role;

-- Only the trusted application server can credit a verified event. Retries are safe.
create or replace function public.credit_game_result(p_user uuid,p_mode text,p_source text,p_score numeric,p_xp integer,p_won boolean,p_counts_game boolean default true)
returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare inserted integer;
begin
  if auth.role() is distinct from 'service_role' then raise exception 'Server only'; end if;
  if p_mode not in ('scoreline','matrix','scouts-duel','journeyman','higher-lower') or p_score<0 or p_xp<0 or p_xp>10000 or length(p_source)>200 then raise exception 'Invalid game result'; end if;
  insert into public.xp_ledger(user_id,game_mode,source_id,xp) values(p_user,p_mode,p_source,p_xp) on conflict do nothing;
  get diagnostics inserted=row_count;
  if inserted=0 then return false; end if;
  if p_counts_game then
    insert into public.game_sessions(user_id,game_mode,source_id,score,xp,won) values(p_user,p_mode,p_source,p_score,p_xp,p_won) on conflict do nothing;
  end if;
  update public.profiles set total_xp=total_xp+p_xp,coins=coins+floor(p_xp/5.0)::integer,
    games_played=games_played+case when p_counts_game then 1 else 0 end,
    games_won=games_won+case when p_counts_game and p_won then 1 else 0 end,
    best_streak=greatest(best_streak,case when p_counts_game and p_won then streak_days+1 else streak_days end),
    streak_days=case when not p_counts_game then streak_days when p_won then streak_days+1 else 0 end,
    last_played_at=now(),updated_at=now() where id=p_user;
  if not found then raise exception 'Profile not initialized'; end if;
  return true;
end $$;
revoke all on function public.credit_game_result(uuid,text,text,numeric,integer,boolean,boolean) from public,anon,authenticated;
grant execute on function public.credit_game_result(uuid,text,text,numeric,integer,boolean,boolean) to service_role;

-- Compare-and-swap progress and its reward are committed in the same transaction.
create or replace function public.apply_game_progress(p_user uuid,p_slot text,p_revision bigint,p_run uuid,p_state jsonb,p_request text,p_events jsonb default '[]')
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare saved public.game_progress; event jsonb; mode text;
begin
  if auth.role() is distinct from 'service_role' then raise exception 'Server only'; end if;
  select * into saved from public.game_progress where user_id=p_user and slot=p_slot for update;
  if not found then raise exception 'Progress not initialized'; end if;
  if saved.requests ? p_request then return to_jsonb(saved); end if;
  if saved.revision<>p_revision then return null; end if;
  mode:=saved.game_mode;
  for event in select value from jsonb_array_elements(p_events) loop
    perform public.credit_game_result(p_user,mode,event->>'source',(event->>'score')::numeric,(event->>'xp')::integer,(event->>'won')::boolean,coalesce((event->>'countsGame')::boolean,true));
  end loop;
  update public.game_progress set run_id=p_run,state=p_state,revision=revision+1,
    requests=(select coalesce(jsonb_agg(value order by n),'[]') from (select value,n from jsonb_array_elements(saved.requests||jsonb_build_array(p_request)) with ordinality x(value,n) order by n desc limit 100) retained),updated_at=now()
    where user_id=p_user and slot=p_slot returning * into saved;
  return to_jsonb(saved);
end $$;
revoke all on function public.apply_game_progress(uuid,text,bigint,uuid,jsonb,text,jsonb) from public,anon,authenticated;
grant execute on function public.apply_game_progress(uuid,text,bigint,uuid,jsonb,text,jsonb) to service_role;

create or replace function public.get_leaderboard(p_mode text default null,p_period text default 'all',p_limit integer default 50)
returns table(rank bigint,user_id uuid,username text,avatar_url text,best_score numeric,games_played bigint)
language sql stable security definer set search_path=public,pg_temp as $$
  with mode as (select case p_mode when 'grid' then 'matrix' when 'guess' then 'scouts-duel' when 'transfer' then 'journeyman' when 'higherlower' then 'higher-lower' when 'whosaidit' then 'tunnel-talk' when 'unscramble' then 'scramble' else p_mode end as id),
  aggregated as (
    select s.user_id,max(s.score) best_score,count(*) games_played from public.game_sessions s,mode m
    where (m.id is null or s.game_mode=m.id) and (p_period='all' or (p_period='daily' and s.created_at>=now()-interval '1 day') or (p_period='weekly' and s.created_at>=now()-interval '7 days')) group by s.user_id
  )
  select row_number() over(order by a.best_score desc,a.games_played desc,a.user_id),a.user_id,p.username,p.avatar_url,a.best_score,a.games_played
  from aggregated a join public.profiles p on p.id=a.user_id order by a.best_score desc,a.games_played desc,a.user_id limit least(greatest(coalesce(p_limit,50),1),100);
$$;
revoke all on function public.get_leaderboard(text,text,integer) from public;
grant execute on function public.get_leaderboard(text,text,integer) to anon,authenticated,service_role;

$fg_sql_da80050d24cf294f$;
    insert into public.football_genius_migrations(name,sha256) values('202610150000_core_backend.sql','da80050d24cf294ff573cf5ac6689038f69daedf65ea1320f647837ebfb91da2');
  end if;
end $fg_migration$;

-- 202610160001_higher_lower_snapshots.sql
do $fg_migration$
begin
  if exists(select 1 from public.football_genius_migrations where name='202610160001_higher_lower_snapshots.sql' and sha256<>'456dbfc6c67d1a98d53d0d88be897e67d500e5b30ceb1a5cf01a9c5563470516') then raise exception 'Migration changed after application: 202610160001_higher_lower_snapshots.sql'; end if;
  if not exists(select 1 from public.football_genius_migrations where name='202610160001_higher_lower_snapshots.sql') then
    execute $fg_sql_456dbfc6c67d1a98$
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

$fg_sql_456dbfc6c67d1a98$;
    insert into public.football_genius_migrations(name,sha256) values('202610160001_higher_lower_snapshots.sql','456dbfc6c67d1a98d53d0d88be897e67d500e5b30ceb1a5cf01a9c5563470516');
  end if;
end $fg_migration$;

-- 202610160002_higher_lower_transfer_questions.sql
do $fg_migration$
begin
  if exists(select 1 from public.football_genius_migrations where name='202610160002_higher_lower_transfer_questions.sql' and sha256<>'ca15e22f5bf5ab0b907279d5c0ed4d816fa4d51fcbbdcb40611ee4e77bf0744d') then raise exception 'Migration changed after application: 202610160002_higher_lower_transfer_questions.sql'; end if;
  if not exists(select 1 from public.football_genius_migrations where name='202610160002_higher_lower_transfer_questions.sql') then
    execute $fg_sql_ca15e22f5bf5ab0b$
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

$fg_sql_ca15e22f5bf5ab0b$;
    insert into public.football_genius_migrations(name,sha256) values('202610160002_higher_lower_transfer_questions.sql','ca15e22f5bf5ab0b907279d5c0ed4d816fa4d51fcbbdcb40611ee4e77bf0744d');
  end if;
end $fg_migration$;

-- 202610160003_higher_lower_career_totals.sql
do $fg_migration$
begin
  if exists(select 1 from public.football_genius_migrations where name='202610160003_higher_lower_career_totals.sql' and sha256<>'15616a6413795955aad71b19ef8a15f759e12aaec4c5f38fd4ec21357053defc') then raise exception 'Migration changed after application: 202610160003_higher_lower_career_totals.sql'; end if;
  if not exists(select 1 from public.football_genius_migrations where name='202610160003_higher_lower_career_totals.sql') then
    execute $fg_sql_15616a6413795955$
-- Schema v3: senior career goals/assists with auditable club + international totals.
-- Rejects older club-only publications; existing snapshots remain immutable.
create or replace function public.publish_higher_lower_snapshot(payload jsonb)
returns text language plpgsql security definer set search_path = public, pg_temp as $$
declare
  snapshot_version text := payload->>'version';
  category text;
  item jsonb;
  move jsonb;
  club jsonb;
  coverage jsonb;
  part jsonb;
  part_name text;
  missing_key text;
  missing_total bigint;
begin
  if payload->>'schemaVersion' is distinct from '3'
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
    coverage := item->'coverage';
    if coverage->>'scope' is distinct from 'recorded-senior-career-matches'
      or coalesce(coverage->>'appearances','') !~ '^\d+$'
      or (coverage->>'appearances')::bigint < 1 then
      raise exception 'Missing senior career coverage';
    end if;
    foreach part_name in array array['club','international'] loop
      part := coverage->part_name;
      if jsonb_typeof(part) is distinct from 'object'
        or coalesce(part->>'appearances','') !~ '^\d+$' then
        raise exception 'Invalid career appearance breakdown';
      end if;
      foreach category in array array['goals','assists'] loop
        missing_key := case category when 'goals' then 'missingGoals' else 'missingAssists' end;
        if coalesce(part->>missing_key,'') !~ '^\d+$'
          or (part->>missing_key)::bigint > (part->>'appearances')::bigint then
          raise exception 'Invalid career missing-value count';
        end if;
        if (part->>missing_key)::bigint > 0 then
          if jsonb_typeof(part->category) is distinct from 'null' then
            raise exception 'Incomplete career statistics must stay unknown';
          end if;
        elsif jsonb_typeof(part->category) is distinct from 'number'
          or coalesce(part->>category,'') !~ '^\d+$'
          or ((part->>'appearances')::bigint = 0 and (part->>category)::bigint <> 0) then
          raise exception 'Invalid career component statistic';
        end if;
      end loop;
    end loop;
    if (coverage->>'appearances')::bigint <> (coverage->'club'->>'appearances')::bigint
      + (coverage->'international'->>'appearances')::bigint then
      raise exception 'Career appearances must equal club + international';
    end if;
    foreach category in array array['goals','assists'] loop
      missing_key := case category when 'goals' then 'missingGoals' else 'missingAssists' end;
      missing_total := (coverage->'club'->>missing_key)::bigint + (coverage->'international'->>missing_key)::bigint;
      if coalesce(coverage->>missing_key,'') !~ '^\d+$'
        or (coverage->>missing_key)::bigint <> missing_total then
        raise exception 'Career missing-value breakdown does not add up';
      end if;
      if missing_total > 0 then
        if jsonb_typeof(item->'stats'->category) is distinct from 'null' then
          raise exception 'Incomplete career totals must stay unknown';
        end if;
      elsif (item->'stats'->>category)::bigint is distinct from
        (coverage->'club'->>category)::bigint + (coverage->'international'->>category)::bigint then
        raise exception 'Career statistics must equal club + international';
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

$fg_sql_15616a6413795955$;
    insert into public.football_genius_migrations(name,sha256) values('202610160003_higher_lower_career_totals.sql','15616a6413795955aad71b19ef8a15f759e12aaec4c5f38fd4ec21357053defc');
  end if;
end $fg_migration$;

-- 202610160004_higher_lower_500_players.sql
do $fg_migration$
begin
  if exists(select 1 from public.football_genius_migrations where name='202610160004_higher_lower_500_players.sql' and sha256<>'8766d38e7fd05a6ba4b7123e555956455516bd65107e84211319b4c9678bb141') then raise exception 'Migration changed after application: 202610160004_higher_lower_500_players.sql'; end if;
  if not exists(select 1 from public.football_genius_migrations where name='202610160004_higher_lower_500_players.sql') then
    execute $fg_sql_8766d38e7fd05a6b$
-- Schema v3 expansion: expand snapshot from 100 to 500 players.
-- Retains historical 100-player snapshots while enforcing 500 players for new publications.

alter table public.higher_lower_snapshots drop constraint if exists higher_lower_snapshots_player_count_check;
alter table public.higher_lower_snapshots add constraint higher_lower_snapshots_player_count_check check (player_count in (100, 500));

alter table public.higher_lower_snapshots drop constraint if exists higher_lower_snapshots_payload_check;
alter table public.higher_lower_snapshots add constraint higher_lower_snapshots_payload_check check (
  jsonb_typeof(payload->'players') is not distinct from 'array'
  and jsonb_array_length(payload->'players') = player_count
  and jsonb_typeof(payload->'playerCount') is not distinct from 'number'
  and payload->>'playerCount' is not distinct from player_count::text
);

create or replace function public.publish_higher_lower_snapshot(payload jsonb)
returns text language plpgsql security definer set search_path = public, pg_temp as $$
declare
  snapshot_version text := payload->>'version';
  category text;
  item jsonb;
  move jsonb;
  club jsonb;
  coverage jsonb;
  part jsonb;
  part_name text;
  missing_key text;
  missing_total bigint;
begin
  if payload->>'schemaVersion' is distinct from '3'
    or payload->>'playerCount' is distinct from '500'
    or snapshot_version is null or length(snapshot_version) > 100
    or jsonb_typeof(payload->'players') is distinct from 'array'
    or jsonb_array_length(payload->'players') <> 500 then
    raise exception 'Expected a complete Higher Lower snapshot of 500 players';
  end if;
  if (select count(distinct p->>'id') from jsonb_array_elements(payload->'players') p) <> 500
    or (select count(distinct p->>'transfermarktId') from jsonb_array_elements(payload->'players') p) <> 500 then
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
    coverage := item->'coverage';
    if coverage->>'scope' is distinct from 'recorded-senior-career-matches'
      or coalesce(coverage->>'appearances','') !~ '^\d+$'
      or (coverage->>'appearances')::bigint < 1 then
      raise exception 'Missing senior career coverage';
    end if;
    foreach part_name in array array['club','international'] loop
      part := coverage->part_name;
      if jsonb_typeof(part) is distinct from 'object'
        or coalesce(part->>'appearances','') !~ '^\d+$' then
        raise exception 'Invalid career appearance breakdown';
      end if;
      foreach category in array array['goals','assists'] loop
        missing_key := case category when 'goals' then 'missingGoals' else 'missingAssists' end;
        if coalesce(part->>missing_key,'') !~ '^\d+$'
          or (part->>missing_key)::bigint > (part->>'appearances')::bigint then
          raise exception 'Invalid career missing-value count';
        end if;
        if (part->>missing_key)::bigint > 0 then
          if jsonb_typeof(part->category) is distinct from 'null' then
            raise exception 'Incomplete career statistics must stay unknown';
          end if;
        elsif jsonb_typeof(part->category) is distinct from 'number'
          or coalesce(part->>category,'') !~ '^\d+$'
          or ((part->>'appearances')::bigint = 0 and (part->>category)::bigint <> 0) then
          raise exception 'Invalid career component statistic';
        end if;
      end loop;
    end loop;
    if (coverage->>'appearances')::bigint <> (coverage->'club'->>'appearances')::bigint
      + (coverage->'international'->>'appearances')::bigint then
      raise exception 'Career appearances must equal club + international';
    end if;
    foreach category in array array['goals','assists'] loop
      missing_key := case category when 'goals' then 'missingGoals' else 'missingAssists' end;
      missing_total := (coverage->'club'->>missing_key)::bigint + (coverage->'international'->>missing_key)::bigint;
      if coalesce(coverage->>missing_key,'') !~ '^\d+$'
        or (coverage->>missing_key)::bigint <> missing_total then
        raise exception 'Career missing-value breakdown does not add up';
      end if;
      if missing_total > 0 then
        if jsonb_typeof(item->'stats'->category) is distinct from 'null' then
          raise exception 'Incomplete career totals must stay unknown';
        end if;
      elsif (item->'stats'->>category)::bigint is distinct from
        (coverage->'club'->>category)::bigint + (coverage->'international'->>category)::bigint then
        raise exception 'Career statistics must equal club + international';
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
    values (snapshot_version, (payload->>'createdAt')::timestamptz, 500, payload)
    on conflict (version) do nothing;
  if exists(select 1 from public.higher_lower_snapshots s where s.version = snapshot_version and s.payload <> $1) then
    raise exception 'Snapshot versions are immutable';
  end if;
  insert into public.higher_lower_current(id, version) values (true, snapshot_version)
    on conflict (id) do update set version = excluded.version, published_at = now();
  return snapshot_version;
end;
$$;

revoke all on function public.publish_higher_lower_snapshot(jsonb) from public, anon, authenticated;
grant execute on function public.publish_higher_lower_snapshot(jsonb) to service_role;


$fg_sql_8766d38e7fd05a6b$;
    insert into public.football_genius_migrations(name,sha256) values('202610160004_higher_lower_500_players.sql','8766d38e7fd05a6ba4b7123e555956455516bd65107e84211319b4c9678bb141');
  end if;
end $fg_migration$;

-- 202610180001_scouts_duel.sql
do $fg_migration$
begin
  if exists(select 1 from public.football_genius_migrations where name='202610180001_scouts_duel.sql' and sha256<>'f90174720116aeb4d696c2935017f92e8b89d8b029b654b1f5efdbe3b8898f6a') then raise exception 'Migration changed after application: 202610180001_scouts_duel.sql'; end if;
  if not exists(select 1 from public.football_genius_migrations where name='202610180001_scouts_duel.sql') then
    execute $fg_sql_f90174720116aeb4$
-- Private authoritative state. Clients receive a filtered HTTP view only.
alter table public.profiles add column if not exists total_xp integer not null default 0;
alter table public.profiles add column if not exists games_played integer not null default 0;
alter table public.profiles add column if not exists games_won integer not null default 0;
create table if not exists public.scout_duel_rooms (
  id uuid primary key, code text not null unique check (code ~ '^[A-Z2-9]{6}$'),
  mode text not null, status text not null, version bigint not null default 0,
  state jsonb not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.scout_duel_rooms enable row level security;
revoke all on public.scout_duel_rooms from anon, authenticated;
grant all on public.scout_duel_rooms to service_role;
create index if not exists scout_duel_queue on public.scout_duel_rooms(mode,status,created_at);

-- Realtime carries an opaque room UUID and revision, never names or secrets.
create table if not exists public.scout_duel_signals (
  room_id uuid primary key references public.scout_duel_rooms(id) on delete cascade,
  revision bigint not null default 0
);
alter table public.scout_duel_signals enable row level security;
revoke all on public.scout_duel_signals from anon, authenticated;
grant select on public.scout_duel_signals to anon, authenticated;
grant all on public.scout_duel_signals to service_role;
create policy scout_signal_read on public.scout_duel_signals for select to anon, authenticated using (true);
do $$ begin
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and tablename='scout_duel_signals') then
    alter publication supabase_realtime add table public.scout_duel_signals;
  end if;
end $$;

create or replace function public.scout_duel_compare_and_swap(p_id uuid,p_version bigint,p_state jsonb,p_notify boolean)
returns boolean language plpgsql security invoker set search_path=public,pg_temp as $$
begin
  update public.scout_duel_rooms set state=p_state,version=p_version+1,status=p_state->>'status',updated_at=now()
    where id=p_id and version=p_version;
  if not found then return false; end if;
  if p_notify then
    insert into public.scout_duel_signals(room_id,revision) values(p_id,p_version+1)
      on conflict(room_id) do update set revision=excluded.revision;
  end if;
  return true;
end $$;
revoke all on function public.scout_duel_compare_and_swap(uuid,bigint,jsonb,boolean) from public,anon,authenticated;
grant execute on function public.scout_duel_compare_and_swap(uuid,bigint,jsonb,boolean) to service_role;

-- One queue transaction covers finding an opponent and creating/joining a room.
create or replace function public.scout_duel_matchmake(p_state jsonb)
returns jsonb language plpgsql security invoker set search_path=public,pg_temp as $$
declare waiting public.scout_duel_rooms%rowtype; member jsonb; joined jsonb; stamp bigint;
begin
  perform pg_advisory_xact_lock(731041928);
  member := p_state#>'{members,0}';
  select * into waiting from public.scout_duel_rooms
    where mode='online' and status='waiting' and updated_at>now()-interval '60 seconds'
      and state->>'datasetVersion'=p_state->>'datasetVersion'
      and state#>>'{members,0,tokenHash}'=member->>'tokenHash'
    order by created_at limit 1;
  if found then return waiting.state; end if;
  select * into waiting from public.scout_duel_rooms
    where mode='online' and status='waiting' and updated_at>now()-interval '60 seconds'
      and state->>'datasetVersion'=p_state->>'datasetVersion'
      and state#>>'{members,0,tokenHash}'<>member->>'tokenHash'
      and (member->>'userId' is null or state#>>'{members,0,userId}' is distinct from member->>'userId')
      and state#>'{options,assistance}'=p_state#>'{options,assistance}'
      and state#>'{options,hardcore}'=p_state#>'{options,hardcore}'
    order by created_at limit 1 for update;
  if not found then
    insert into public.scout_duel_rooms(id,code,mode,status,version,state)
      values((p_state->>'id')::uuid,p_state->>'code','online','waiting',0,p_state);
    return p_state;
  end if;
  stamp := floor(extract(epoch from clock_timestamp())*1000)::bigint;
  member := member||jsonb_build_object('remaining',waiting.state->'boardIds','deductions',waiting.state->'boardIds','lastSeen',stamp);
  joined := jsonb_set(waiting.state,'{members,1}',member)||jsonb_build_object('status','selecting','deadline',stamp+30000,'version',waiting.version+1,'updatedAt',stamp);
  update public.scout_duel_rooms set state=joined,status='selecting',version=waiting.version+1,updated_at=now() where id=waiting.id;
  insert into public.scout_duel_signals(room_id,revision) values(waiting.id,waiting.version+1)
    on conflict(room_id) do update set revision=excluded.revision;
  return joined;
end $$;
revoke all on function public.scout_duel_matchmake(jsonb) from public,anon,authenticated;
grant execute on function public.scout_duel_matchmake(jsonb) to service_role;

create table if not exists public.scout_duel_rewards (
  room_id uuid references public.scout_duel_rooms(id), user_id uuid references auth.users(id),
  xp integer not null, created_at timestamptz not null default now(), primary key(room_id,user_id)
);
alter table public.scout_duel_rewards enable row level security;
revoke all on public.scout_duel_rewards from anon,authenticated;
grant all on public.scout_duel_rewards to service_role;
create or replace function public.scout_duel_credit_match(p_id uuid,p_user uuid)
returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare match jsonb; seat integer; points integer; inserted integer;
begin
  if auth.role() <> 'service_role' then raise exception 'Server only'; end if;
  select state into match from public.scout_duel_rooms where id=p_id;
  if match->>'status' <> 'completed' or match->>'reason'='CANCELLED' then return false; end if;
  select ordinality-1 into seat from jsonb_array_elements(match->'members') with ordinality
    where value->>'userId'=p_user::text;
  if seat is null then return false; end if;
  -- Do not claim the ledger entry before a newly signed-in profile exists.
  if not exists(select 1 from public.profiles where id=p_user) then
    raise exception 'Profile is still being initialized. Retry the reward.';
  end if;
  points := case when match->>'winner'=seat::text then 200 else 0 end;
  insert into public.scout_duel_rewards(room_id,user_id,xp) values(p_id,p_user,points) on conflict do nothing;
  get diagnostics inserted = row_count;
  if inserted=1 then
    update public.profiles set total_xp=coalesce(total_xp,0)+points,
      games_played=coalesce(games_played,0)+1,games_won=coalesce(games_won,0)+case when points=200 then 1 else 0 end
      where id=p_user;
  end if;
  return true;
end $$;
revoke all on function public.scout_duel_credit_match(uuid,uuid) from public,anon,authenticated;
grant execute on function public.scout_duel_credit_match(uuid,uuid) to service_role;

$fg_sql_f90174720116aeb4$;
    insert into public.football_genius_migrations(name,sha256) values('202610180001_scouts_duel.sql','f90174720116aeb4d696c2935017f92e8b89d8b029b654b1f5efdbe3b8898f6a');
  end if;
end $fg_migration$;

-- 202610190001_scout_unified_rewards.sql
do $fg_migration$
begin
  if exists(select 1 from public.football_genius_migrations where name='202610190001_scout_unified_rewards.sql' and sha256<>'b6c8ab770677e186abb0dc4781b32af7b6a3923993bb80593d99d99539789469') then raise exception 'Migration changed after application: 202610190001_scout_unified_rewards.sql'; end if;
  if not exists(select 1 from public.football_genius_migrations where name='202610190001_scout_unified_rewards.sql') then
    execute $fg_sql_b6c8ab770677e186$
-- Match rewards, account stats and leaderboard history share one idempotent ledger.
create or replace function public.can_read_scout_signal(p_room uuid)
returns boolean language sql stable security definer set search_path=public,pg_temp as $$
  select exists(select 1 from public.scout_duel_rooms r where r.id=p_room and exists(select 1 from jsonb_array_elements(r.state->'members') m where m->>'userId'=(select auth.uid())::text));
$$;
revoke all on function public.can_read_scout_signal(uuid) from public,anon;
grant execute on function public.can_read_scout_signal(uuid) to authenticated,service_role;
drop policy if exists scout_signal_read on public.scout_duel_signals;
create policy scout_signal_read on public.scout_duel_signals for select to authenticated using (public.can_read_scout_signal(room_id));
revoke select on public.scout_duel_signals from anon;

create or replace function public.scout_duel_credit_match(p_id uuid,p_user uuid)
returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare match jsonb; seat integer; points integer;
begin
  if auth.role() is distinct from 'service_role' then raise exception 'Server only'; end if;
  select state into match from public.scout_duel_rooms where id=p_id;
  if match->>'status' is distinct from 'completed' or match->>'reason'='CANCELLED' then return false; end if;
  select ordinality-1 into seat from jsonb_array_elements(match->'members') with ordinality where value->>'userId'=p_user::text;
  if seat is null then return false; end if;
  points:=case when match->>'winner'=seat::text then 200 else 0 end;
  perform public.credit_game_result(p_user,'scouts-duel',p_id::text,case when points=200 then 1 else 0 end,points,points=200,true);
  insert into public.scout_duel_rewards(room_id,user_id,xp) values(p_id,p_user,points) on conflict do nothing;
  return true;
end $$;
revoke all on function public.scout_duel_credit_match(uuid,uuid) from public,anon,authenticated;
grant execute on function public.scout_duel_credit_match(uuid,uuid) to service_role;

$fg_sql_b6c8ab770677e186$;
    insert into public.football_genius_migrations(name,sha256) values('202610190001_scout_unified_rewards.sql','b6c8ab770677e186abb0dc4781b32af7b6a3923993bb80593d99d99539789469');
  end if;
end $fg_migration$;

commit;
