const {createClient}=require('@supabase/supabase-js');
const {loadEnv,root}=require('./env.cjs');
const path=require('node:path');
async function main(){
  const env=loadEnv(),key=env.SUPABASE_SECRET_KEY||env.SUPABASE_SERVICE_ROLE_KEY;
  if(!key)throw Error('Add SUPABASE_SECRET_KEY to .env.local first.');
  const client=createClient(env.SUPABASE_URL||env.NEXT_PUBLIC_SUPABASE_URL,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const snapshot=require(path.join(root,'src/data/higher-lower-snapshot.json'));
  const {data,error}=await client.rpc('publish_higher_lower_snapshot',{payload:snapshot});
  if(error)throw Error(`Snapshot publication failed: ${error.message}`);
  console.log(`Published the verified ${snapshot.playerCount}-player snapshot (${data}).`);
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
