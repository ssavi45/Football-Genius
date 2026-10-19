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
