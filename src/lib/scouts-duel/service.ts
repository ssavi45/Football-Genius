import { createHash, randomBytes, randomInt } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { scoutPlayers, SCOUT_DATASET_VERSION } from './data';
import { applyScoutAction, createScoutMember, createScoutRoom, joinScoutRoom, ScoutRuleError, scoutView, tickScoutRoom } from './engine';
import { findScoutRoom, matchmakeScout, loadScoutRoom, mutateScoutRoom, newScoutIdentity, saveNewScoutRoom, scoutAdmin } from './store';
import type { ScoutAction, ScoutOptions, ScoutRoom, Seat } from './types';
import { requestUser } from '@/lib/supabase/server';

export const SCOUT_COOKIE='scouts_duel_session';
const random=()=>randomInt(0,2**32)/2**32;
const rate=new Map<string,{at:number;count:number}>();
export function scoutSession(request:NextRequest,create=false) {
  const saved=request.cookies.get(SCOUT_COOKIE)?.value;
  const token=saved&&/^[a-zA-Z0-9_-]{43}$/.test(saved)?saved:create?randomBytes(32).toString('base64url'):null;
  if(!token)throw new ScoutRuleError('Your scout session has expired. Start or join a match.');
  const hash=createHash('sha256').update(token).digest('hex');
  const current=rate.get(hash),now=Date.now();
  if(current&&now-current.at<60000){if(++current.count>180)throw new ScoutRuleError('Too many requests. Please wait a moment.');}else rate.set(hash,{at:now,count:1});
  if(rate.size>5000)for(const [key,value]of rate)if(now-value.at>60000)rate.delete(key);
  return {token,hash};
}
export function scoutSeat(room:ScoutRoom,hash:string):Seat {
  const index=room.members.findIndex(m=>m?.tokenHash===hash);
  if(index<0)throw new ScoutRuleError('You are not a participant in this room.');return index as Seat;
}
export function checkScoutOrigin(request:NextRequest) {
  const origin=request.headers.get('origin');
  if(!origin)return;
  const source=new URL(origin);
  const allowed=[request.nextUrl.host,request.headers.get('host')];
  const loopback=['localhost','127.0.0.1','0.0.0.0','[::1]'];
  const localDevelopment=process.env.NODE_ENV!=='production'&&loopback.includes(source.hostname)&&loopback.includes(request.nextUrl.hostname);
  if(!allowed.includes(source.host)&&!localDevelopment)throw new ScoutRuleError('This action must come from the game page.');
}
async function userId(request:NextRequest) {
  if(!scoutAdmin)return null;
  return (await requestUser(request))?.id||null;
}
export async function restoreScoutAccount(request:NextRequest,hash:string) {
  const id=await userId(request);if(!id||!scoutAdmin)return null;
  const {data,error}=await scoutAdmin.from('scout_duel_rooms').select('id').contains('state',{members:[{userId:id}]}).in('status',['waiting','selecting','active']).order('updated_at',{ascending:false}).limit(1).maybeSingle();
  if(error)throw Error('Could not restore your active duel. Please retry.');if(!data)return null;
  const room=await mutateScoutRoom(data.id,current=>{const member=current.members.find(item=>item?.userId===id);if(!member)throw Error('This duel belongs to another account.');member.tokenHash=hash;member.lastSeen=Date.now();});
  return publicView(room,hash);
}
function options(body:Record<string,unknown>):ScoutOptions {
  return {difficulty:['rookie','tactician','world-class'].includes(String(body.difficulty))?body.difficulty as ScoutOptions['difficulty']:'tactician',assistance:body.assistance===true,hardcore:false,turnSeconds:body.turnSeconds===60?60:45};
}
export async function createOrJoinScout(request:NextRequest,body:Record<string,unknown>,hash:string) {
  const name=typeof body.name==='string'?body.name:'Scout';
  const member=createScoutMember(name,hash,Date.now(),await userId(request));
  if(body.joinCode){const room=await findScoutRoom(String(body.joinCode).trim().toUpperCase());if(!room)throw new ScoutRuleError('No room found for that code.');return mutateScoutRoom(room.id,r=>{if(r.members.some(m=>m?.tokenHash===hash))return;if(member.userId&&r.members.some(m=>m?.userId===member.userId))throw new ScoutRuleError('Use two different accounts to play each other.');if(r.datasetVersion!==SCOUT_DATASET_VERSION)throw new ScoutRuleError('The roster was updated. Ask the host to create a new room.');joinScoutRoom(r,member,Date.now());});}
  const mode=['ai','online','custom'].includes(String(body.mode))?body.mode as ScoutRoom['mode']:'ai';
  const settings=options(body);if(mode!=='custom')settings.turnSeconds=45;
  const identity=newScoutIdentity();const room=createScoutRoom(identity.id,identity.code,identity.seed,mode,member,settings,scoutPlayers,SCOUT_DATASET_VERSION,Date.now(),random);
  if(mode==='online')return matchmakeScout(room);
  await saveNewScoutRoom(room);return room;
}
export async function readScoutView(id:string,hash:string) {
  const room=await mutateScoutRoom(id,r=>{
    const seat=scoutSeat(r,hash);
    if(r.datasetVersion!==SCOUT_DATASET_VERSION)throw new ScoutRuleError('The roster was updated. Start a new duel.');
    tickScoutRoom(r,scoutPlayers,Date.now(),random);r.members[seat]!.lastSeen=Date.now();tickScoutRoom(r,scoutPlayers,Date.now(),random);
  });
  return publicView(room,hash);
}
export async function publicView(room:ScoutRoom,hash:string) {
  const seat=scoutSeat(room,hash),view=scoutView(room,seat,scoutPlayers,Date.now());
  if(room.status==='completed'&&room.members[seat]?.userId&&scoutAdmin){
    view.rewardOnServer=true;
    const {error}=await scoutAdmin.rpc('scout_duel_credit_match',{p_id:room.id,p_user:room.members[seat]!.userId});
    if(error)throw Error('Your result is saved. Refresh to collect the match reward.');
  }
  return view;
}
function parseAction(value:Record<string,unknown>):ScoutAction {
  if(['LOCK_IN_PLAYER','SHOOT_GUESS','UPDATE_BOARD_STATE'].includes(String(value.type))&&typeof value.playerId==='string'&&value.playerId.length<80)return {type:value.type as 'LOCK_IN_PLAYER',playerId:value.playerId};
  if(value.type==='ASK_QUESTION'&&typeof value.questionId==='string'&&value.questionId.length<180)return {type:'ASK_QUESTION',questionId:value.questionId};
  if(value.type==='RESIGN')return {type:'RESIGN'};
  throw new ScoutRuleError('Invalid game action.');
}
export async function actScout(id:string,hash:string,input:Record<string,unknown>) {
  const action=parseAction(input.action as Record<string,unknown>||{});
  if(typeof input.requestId!=='string'||!/^[a-f0-9-]{36}$/i.test(input.requestId))throw new ScoutRuleError('Missing action identifier.');
  let rejection:ScoutRuleError|null=null;
  const room=await mutateScoutRoom(id,r=>{
    rejection=null;
    const seat=scoutSeat(r,hash),requestKey=`${seat}:${input.requestId}`;
    if(r.datasetVersion!==SCOUT_DATASET_VERSION)throw new ScoutRuleError('The roster was updated. Start a new duel.');
    if(r.processed.includes(requestKey))return;
    const now=Date.now();tickScoutRoom(r,scoutPlayers,now,random);r.members[seat]!.lastSeen=now;tickScoutRoom(r,scoutPlayers,now,random);
    // Persist elapsed timers even when the submitted action is now too late.
    try{applyScoutAction(r,seat,action,scoutPlayers,now);}catch(error){if(!(error instanceof ScoutRuleError))throw error;rejection=error;return;}
    r.processed=[...r.processed.slice(-59),requestKey];
  });
  if(rejection)throw rejection;
  return publicView(room,hash);
}
export async function authorizedScoutRoom(id:string,hash:string){const room=await loadScoutRoom(id);if(!room)throw new ScoutRuleError('Room not found.');scoutSeat(room,hash);return room;}
