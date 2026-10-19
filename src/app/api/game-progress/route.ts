import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { adminSupabase,checkSameOrigin,requestUser } from '@/lib/supabase/server';
import { gameVariant,initialCloudState,transitionCloudState,type CloudMode } from '@/lib/backend/games';

export const runtime='nodejs';
export async function POST(request:Request) {
  try {
    checkSameOrigin(request);
    if(Number(request.headers.get('content-length')||0)>24000)return NextResponse.json({error:'Request is too large.'},{status:413});
    const user=await requestUser(request);if(!user)return NextResponse.json({error:'Please sign in to sync your progress.'},{status:401});
    const body=await request.json();
    if(!['matrix','journeyman','higher-lower'].includes(body.mode)||typeof body.requestId!=='string'||!/^[a-f0-9-]{36}$/i.test(body.requestId))throw new Error('Invalid game request.');
    const mode=body.mode as CloudMode,variant=gameVariant(mode,body.variant),slot=`${mode}:${variant}`,admin=adminSupabase();
    let {data:saved,error}=await admin.from('game_progress').select('*').eq('user_id',user.id).eq('slot',slot).maybeSingle();
    if(error)throw new Error('Game progress is unavailable. Please retry.');
    if(!saved){
      const state=await initialCloudState(mode,variant);
      const {error:insertError}=await admin.from('game_progress').upsert({user_id:user.id,slot,game_mode:mode,run_id:randomUUID(),state},{onConflict:'user_id,slot',ignoreDuplicates:true});
      if(insertError)throw new Error('Could not initialize your saved game.');
      const fresh=await admin.from('game_progress').select('*').eq('user_id',user.id).eq('slot',slot).single();saved=fresh.data;if(!saved)throw new Error('Could not load your saved game.');
    }
    if(body.action==='resume'||body.action==='start'||saved.requests.includes(body.requestId))return NextResponse.json({runId:saved.run_id,revision:saved.revision,state:saved.state},{headers:{'Cache-Control':'private, no-store'}});
    if(body.revision!==saved.revision||body.runId!==saved.run_id)return NextResponse.json({error:'This game changed in another tab. Reload to continue.'},{status:409});
    const restart=body.action==='restart';
    const next=restart?{state:await initialCloudState(mode,variant,saved.state),events:[]}:await transitionCloudState(mode,saved.state,saved.run_id,body.action,body);
    const runId=restart?randomUUID():saved.run_id;
    const committed=await admin.rpc('apply_game_progress',{p_user:user.id,p_slot:slot,p_revision:saved.revision,p_run:runId,p_state:next.state,p_request:body.requestId,p_events:next.events});
    if(committed.error)throw new Error('Could not save this action. Please retry.');
    if(!committed.data)return NextResponse.json({error:'This game changed in another tab. Reload to continue.'},{status:409});
    return NextResponse.json({runId:committed.data.run_id,revision:committed.data.revision,state:committed.data.state},{headers:{'Cache-Control':'private, no-store'}});
  }catch(cause){return NextResponse.json({error:cause instanceof Error?cause.message:'Could not sync your game.'},{status:400});}
}
