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
