import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createRound, roundView, transition } from '@/lib/scoreline/engine';
import { sign, verify, signCloudRound, verifyCloudRound } from '@/lib/scoreline/session';
import type { Action, Round } from '@/lib/scoreline/types';
import { adminSupabase,checkSameOrigin,requestUser } from '@/lib/supabase/server';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  const timings:string[]=[];
  const measure=async<T,>(name:string,work:()=>PromiseLike<T>):Promise<T>=>{const started=performance.now();try{return await work();}finally{timings.push(`${name};dur=${(performance.now()-started).toFixed(1)}`);}};
  const reply=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{'Cache-Control':'private, no-store','Server-Timing':timings.join(', ')}});
  const cloudView=(state:Round,revision:number,userId:string)=>({...roundView(state,signCloudRound(state,userId,revision)),cloudRevision:revision,rewardOnServer:true});
  try {
    checkSameOrigin(request);
    if (Number(request.headers.get('content-length') || 0) > 22000) throw new Error('Request is too large.');
    const body = await request.json();
    const type = body.action;
    if (!['start','resume','hint','submit','skip','next'].includes(type)) throw new Error('Choose a valid game action.');
    const user=await measure('auth',()=>requestUser(request));
    if(user){
      if(typeof body.requestId!=='string'||!/^[a-f0-9-]{36}$/i.test(body.requestId))throw new Error('Missing action identifier.');
      const admin=adminSupabase(),slot='scoreline:default';
      let saved:{state:Round;run_id:string;revision:number;requests:string[]}|null=null;
      const resuming=type==='resume'||(type==='start'&&!body.force);
      if(!resuming&&Number.isSafeInteger(body.cloudRevision)){
        try {
          // Only server-signed state for this account and revision is accepted.
          // The database still checks the revision and commits rewards atomically.
          const state=verifyCloudRound(body.token,user.id,body.cloudRevision,body.runId);
          saved={state,run_id:state.id,revision:body.cloudRevision,requests:[]};
        } catch { /* Restore older tokens from authoritative storage once. */ }
      }
      if(!saved){
        const loaded=await measure('load',()=>admin.from('game_progress').select('state,run_id,revision,requests').eq('user_id',user.id).eq('slot',slot).maybeSingle());
        if(loaded.error)throw new Error('Could not load your saved round. Please retry.');
        saved=loaded.data;
      }
      if(!saved){
        const state=createRound(randomUUID(),[]);
        const inserted=await measure('initialize',()=>admin.from('game_progress').upsert({user_id:user.id,slot,game_mode:'scoreline',run_id:state.id,state},{onConflict:'user_id,slot',ignoreDuplicates:true}).select('state,run_id,revision,requests').maybeSingle());
        if(inserted.error)throw new Error('Could not initialize your saved round.');
        saved=inserted.data;
        if(!saved)saved=(await measure('load',()=>admin.from('game_progress').select('state,run_id,revision,requests').eq('user_id',user.id).eq('slot',slot).single())).data;
        if(!saved)throw new Error('Could not load your saved round.');
      }
      if(resuming||saved.requests.includes(body.requestId))return reply(cloudView(saved.state,saved.revision,user.id));
      if(type!=='start'&&(body.cloudRevision!==saved.revision||body.runId!==saved.run_id))return reply({error:'This round changed in another tab. Reload to continue.'},409);
      const next=type==='start'?createRound(randomUUID(),Array.isArray(body.recent)?body.recent.slice(-200):[]):transition(saved.state,{type,hint:body.hint,home:body.home,away:body.away} as Action);
      const view=roundView(next,sign(next));
      const events=next.complete?[{source:next.id,score:view.score,xp:view.score,won:view.review.every(answer=>answer.points>0)}]:[];
      const committed=await measure('save',()=>admin.rpc('apply_game_progress',{p_user:user.id,p_slot:slot,p_revision:saved.revision,p_run:next.id,p_state:next,p_request:body.requestId,p_events:events}));
      if(committed.error)throw new Error('Could not save this action. Please retry.');
      if(!committed.data)return reply({error:'This round changed in another tab. Reload to continue.'},409);
      return reply(cloudView(committed.data.state,committed.data.revision,user.id));
    }
    let round = type === 'start' ? createRound(randomUUID(),Array.isArray(body.recent) ? body.recent.filter((id:unknown)=>typeof id==='string').slice(-200) : []) : verify(body.token);
    if (!['start','resume'].includes(type)) round = transition(round,{type,hint:body.hint,home:body.home,away:body.away} as Action);
    return reply(roundView(round,sign(round)));
  } catch (error) {
    return reply({error:error instanceof Error ? error.message : 'Unable to load this round. Please try again.'},400);
  }
}
