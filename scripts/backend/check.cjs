const {createClient}=require('@supabase/supabase-js');
const {loadEnv}=require('./env.cjs');
const env=loadEnv(),url=env.NEXT_PUBLIC_SUPABASE_URL,key=env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
async function main(){
  if(!url||!key)throw Error('Add the project URL and publishable key to .env.local.');
  console.log('Project:',new URL(url).hostname);
  const settings=await fetch(url+'/auth/v1/settings',{headers:{apikey:key},signal:AbortSignal.timeout(8000)});
  if(!settings.ok)throw Error('Project URL or publishable key is invalid.');
  const providers=await settings.json();console.log('Public connection: OK');console.log('Google sign-in:',providers.external?.google?'enabled':'not enabled');
  const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const profiles=await client.from('profiles').select('id,username,avatar_url,total_xp,coins,games_played,games_won,streak_days,best_streak,last_played_at,created_at,updated_at').limit(0);
  if(profiles.error)throw Error('Database schema is missing. Run scripts/backend/setup.sql in the Supabase SQL Editor.');
  console.log('Profiles schema: OK');
  const rankings=await client.rpc('get_leaderboard',{p_mode:'scoreline',p_limit:1});if(rankings.error)throw Error('Leaderboard function is missing or unavailable.');console.log('Leaderboard function: OK');
  const secret=env.SUPABASE_SECRET_KEY||env.SUPABASE_SERVICE_ROLE_KEY;
  if(!secret)throw Error('Add SUPABASE_SECRET_KEY to .env.local for trusted game storage and rewards.');
  const admin=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
  for(const table of ['game_progress','game_sessions','xp_ledger','scout_duel_rooms','scout_duel_signals']){
    const response=await admin.from(table).select('*').limit(0);if(response.error)throw Error(`Server access to ${table} failed. Check the secret key and migrations.`);console.log(`${table}: OK`);
  }
  if(!providers.external?.google){process.exitCode=1;console.log('Remaining: configure Authentication > Sign In / Providers > Google.');}
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
