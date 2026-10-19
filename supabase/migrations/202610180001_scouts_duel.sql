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
