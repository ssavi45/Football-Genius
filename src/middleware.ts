import { createServerClient,type CookieOptions } from '@supabase/ssr';
import { NextResponse,type NextRequest } from 'next/server';
import { supabaseConfigured,supabasePublicKey,supabaseUrl } from '@/lib/supabase/config';

export async function middleware(request:NextRequest) {
  let response=NextResponse.next({request});
  if(!supabaseConfigured || !request.cookies.getAll().some(cookie=>cookie.name.startsWith('sb-')))return response;
  const client=createServerClient(supabaseUrl,supabasePublicKey,{cookies:{getAll:()=>request.cookies.getAll(),setAll:(values:Array<{name:string;value:string;options:CookieOptions}>)=>{
    values.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});values.forEach(({name,value,options})=>response.cookies.set(name,value,options));
  }}});
  try{await client.auth.getClaims();}catch{/* Preserve guest play if the auth service is temporarily unavailable. */}
  response.headers.set('Cache-Control','private, no-store');return response;
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico|img/|branding/|.*\\.(?:png|jpg|jpeg|webp|svg|woff2)$).*)']};
