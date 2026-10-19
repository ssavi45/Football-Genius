const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {PGlite}=require('@electric-sql/pglite');
const root=path.resolve(__dirname,'../..');
const a='00000000-0000-4000-8000-000000000001',b='00000000-0000-4000-8000-000000000002',c='00000000-0000-4000-8000-000000000003';
const run='10000000-0000-4000-8000-000000000001',room='20000000-0000-4000-8000-000000000001';
let db;
async function role(name,id=''){
  await db.exec('reset role');
  await db.query("select set_config('request.jwt.claim.role',$1,false),set_config('request.jwt.claim.sub',$2,false)",[name,id]);
  await db.exec(`set role ${name}`);
}
async function profile(id=a){return (await db.query('select * from public.profiles where id=$1',[id])).rows[0];}
before(async()=>{
  db=new PGlite();
  await db.exec(`create role anon nologin;create role authenticated nologin;create role service_role nologin bypassrls;create schema auth;grant usage on schema auth,public to anon,authenticated,service_role;
    create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb not null default '{}');
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    create function auth.role() returns text language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claim.role',true),''),current_user::text)$$;
    create publication supabase_realtime;`);
  await db.exec(fs.readFileSync(path.join(__dirname,'setup.sql'),'utf8'));
  for(const [id,name] of [[a,'Scout A'],[b,'Scout B'],[c,'Scout C']])await db.query('insert into auth.users(id,email,raw_user_meta_data) values($1,$2,$3)',[id,`${id}@example.test`,JSON.stringify({name})]);
});
after(async()=>{if(db)await db.close();});

test('all seven migrations execute and the setup can be rerun without resetting data',async()=>{
  assert.equal(Number((await db.query('select count(*) from public.football_genius_migrations')).rows[0].count),7);
  await db.exec(fs.readFileSync(path.join(__dirname,'setup.sql'),'utf8'));
  assert.equal((await profile()).username,'Scout A');assert.equal(Number((await profile()).total_xp),0);
});
test('users can edit their names but cannot edit XP or another profile',async()=>{
  await role('authenticated',a);
  await db.query("update public.profiles set username='New name' where id=$1",[a]);
  await assert.rejects(db.query('update public.profiles set total_xp=99999 where id=$1',[a]),/permission denied/i);
  const other=await db.query("update public.profiles set username='Stolen' where id=$1 returning id",[b]);assert.equal(other.rows.length,0);
  await assert.rejects(db.query("insert into public.game_sessions(user_id,game_mode,source_id,score,xp,won) values($1,'matrix','forged',9,325,true)",[a]),/permission denied/i);
  await db.exec('reset role');
});
test('only the trusted server credits results; retries cannot award XP twice',async()=>{
  await role('authenticated',a);await assert.rejects(db.query("select public.credit_game_result($1,'matrix','first',9,325,true,true)",[a]),/permission denied/i);
  await role('service_role');
  const first=await db.query("select public.credit_game_result($1,'matrix','first',9,325,true,true) as credited",[a]);
  const second=await db.query("select public.credit_game_result($1,'matrix','first',9,325,true,true) as credited",[a]);
  assert.equal(first.rows[0].credited,true);assert.equal(second.rows[0].credited,false);assert.equal(Number((await profile()).total_xp),325);assert.equal((await profile()).games_played,1);
  await db.exec('reset role');
});
test('progress revisions, duplicate requests, and rewards are applied atomically',async()=>{
  await role('service_role');
  await db.query("insert into public.game_progress(user_id,slot,game_mode,run_id,state) values($1,'journeyman:default','journeyman',$2,'{}')",[a,run]);
  const events=JSON.stringify([{source:'journey-1',score:8.5,xp:80,won:true}]);
  const apply=(rev,request,values=events)=>db.query("select public.apply_game_progress($1,'journeyman:default',$2,$3,'{\"question\":1}',$4,$5) as saved",[a,rev,run,request,values]);
  assert.equal(Number((await apply(0,'request-1')).rows[0].saved.revision),1);
  assert.equal(Number((await apply(0,'request-1')).rows[0].saved.revision),1);
  assert.equal((await apply(0,'stale-request')).rows[0].saved,null);
  assert.equal(Number((await profile()).total_xp),405);
  const invalid=JSON.stringify([{source:'rollback-first',score:1,xp:20,won:true},{source:'rollback-invalid',score:1,xp:-1,won:true}]);
  await assert.rejects(apply(1,'invalid-transaction',invalid),/Invalid game result/);
  assert.equal(Number((await profile()).total_xp),405);
  assert.equal(Number((await db.query('select revision from public.game_progress where user_id=$1',[a])).rows[0].revision),1);
  await db.exec('reset role');
});
test('private game history stays private while mode rankings expose only public fields',async()=>{
  await role('authenticated',b);assert.equal((await db.query('select * from public.game_sessions')).rows.length,0);
  await assert.rejects(db.query('select * from public.game_progress'),/permission denied/i);
  await role('anon');
  await assert.rejects(db.query('select * from public.game_sessions'),/permission denied/i);
  const board=await db.query("select * from public.get_leaderboard('transfer','all',50)");assert.equal(board.rows.length,1);assert.equal(Number(board.rows[0].best_score),8.5);
  assert.deepEqual(Object.keys(board.rows[0]).sort(),['avatar_url','best_score','games_played','rank','user_id','username'].sort());
  await db.exec('reset role');
});
test('sound preferences are private to the account that owns them',async()=>{
  await role('authenticated',a);await db.query('insert into public.user_preferences(user_id,sound_enabled) values($1,false)',[a]);
  await role('authenticated',b);assert.equal((await db.query('select * from public.user_preferences')).rows.length,0);
  await assert.rejects(db.query('insert into public.user_preferences(user_id,sound_enabled) values($1,true)',[a]),/row-level security/i);
  await db.exec('reset role');
});
test('Scout secrets remain server-only and realtime signals are restricted to room members',async()=>{
  await role('service_role');
  const state={status:'completed',winner:0,reason:'CORRECT_SHOOT',members:[{userId:a,secretId:'private-player'},{userId:b,secretId:'other-secret'}]};
  await db.query("insert into public.scout_duel_rooms(id,code,mode,status,state) values($1,'ABC234','custom','completed',$2)",[room,JSON.stringify(state)]);
  await db.query('insert into public.scout_duel_signals(room_id,revision) values($1,1)',[room]);
  await role('authenticated',a);assert.equal((await db.query('select * from public.scout_duel_signals')).rows.length,1);
  await assert.rejects(db.query('select * from public.scout_duel_rooms'),/permission denied/i);
  await role('authenticated',c);assert.equal((await db.query('select * from public.scout_duel_signals')).rows.length,0);
  await role('anon');await assert.rejects(db.query('select * from public.scout_duel_signals'),/permission denied/i);
  await db.exec('reset role');
});
test('a completed Scout duel creates one reward, one result, and one stats update',async()=>{
  await role('service_role');const before=await profile();
  await db.query('select public.scout_duel_credit_match($1,$2)',[room,a]);await db.query('select public.scout_duel_credit_match($1,$2)',[room,a]);
  const after=await profile();assert.equal(Number(after.total_xp),Number(before.total_xp)+200);assert.equal(after.games_played,before.games_played+1);
  assert.equal((await db.query("select * from public.get_leaderboard('guess','all',50)")).rows.length,1);
  await db.exec('reset role');
});
test('the existing 500-player snapshot passes the database publication checks',async()=>{
  await role('service_role');const snapshot=require(path.join(root,'src/data/higher-lower-snapshot.json'));
  const published=await db.query('select public.publish_higher_lower_snapshot($1) as version',[JSON.stringify(snapshot)]);assert.equal(published.rows[0].version,snapshot.version);
  await db.exec('reset role');
});
