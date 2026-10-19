import 'server-only';
import { createServerClient,type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { supabaseUrl, supabasePublicKey, supabaseConfigured } from './config';

export async function serverSupabase() {
  const jar = await cookies();
  return createServerClient(supabaseUrl,supabasePublicKey,{ cookies:{getAll:()=>jar.getAll(),setAll:(values:Array<{name:string;value:string;options:CookieOptions}>)=>{try{values.forEach(({name,value,options})=>jar.set(name,value,options));}catch{/* Server Components cannot write cookies; middleware refreshes them. */}}} });
}
export function adminSupabase() {
  const key=process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!key || !supabaseConfigured)throw new Error('The backend connection is not configured.');
  return createClient(process.env.SUPABASE_URL || supabaseUrl,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
export async function requestUser(request?:Request) {
  const bearer=request?.headers.get('authorization')?.replace(/^Bearer\s+/i,'');
  const client=bearer?createClient(supabaseUrl,supabasePublicKey,{auth:{persistSession:false,autoRefreshToken:false}}):await serverSupabase();
  // getClaims verifies the JWT against cached public keys; getUser makes a
  // remote Auth request on every move. Symmetric projects still use Auth.
  const {data,error}=await client.auth.getClaims(bearer||undefined);
  const claims=data?.claims;
  if(error||!claims||claims.role!=='authenticated'||claims.iss!==`${supabaseUrl.replace(/\/$/,'')}/auth/v1`
    ||!claims.sub||!(Array.isArray(claims.aud)?claims.aud.includes('authenticated'):claims.aud==='authenticated'))return null;
  return {id:claims.sub};
}
export { checkSameOrigin } from '@/lib/http/origin';
