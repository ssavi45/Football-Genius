import { randomBytes, randomUUID } from 'node:crypto';
import { mkdir, readFile, readdir, rename, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import type { ScoutRoom } from './types';
import { joinScoutRoom, ScoutRuleError } from './engine';

const url=process.env.SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL;
const key=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
export const scoutStoreKind = url&&key ? 'supabase' : process.env.NODE_ENV!=='production' ? 'local' : 'unavailable';
export const scoutAdmin = url&&key ? createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}}) : null;
const root=path.join(process.cwd(),'tmp','scouts-duel');
const signalKey=(r:ScoutRoom)=>JSON.stringify({...r,version:0,updatedAt:0,processed:[],members:r.members.map(m=>m?{...m,lastSeen:0}:null)});
export const validRoomId=(id:string)=>/^[a-f0-9-]{36}$/i.test(id);
function requireStore() { if(scoutStoreKind==='unavailable')throw Error('Configure the Scout’s Duel Supabase migration and service-role key before hosting matches.'); }
async function readLocal(id:string):Promise<ScoutRoom|null> { try{return JSON.parse(await readFile(path.join(root,`${id}.json`),'utf8'));}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return null;throw e;} }
export async function loadScoutRoom(id:string):Promise<ScoutRoom|null> {
  requireStore();if(!validRoomId(id))return null;
  if(scoutAdmin){const {data,error}=await scoutAdmin.from('scout_duel_rooms').select('state').eq('id',id).maybeSingle();if(error)throw Error('Scout’s Duel storage is not ready. Apply its migration.');return data?.state||null;}
  return readLocal(id);
}
async function listRooms():Promise<ScoutRoom[]> {
  await mkdir(root,{recursive:true});const files=(await readdir(root)).filter(f=>f.endsWith('.json')&&validRoomId(f.slice(0,-5)));
  return (await Promise.all(files.map(f=>readLocal(f.slice(0,-5))))).filter((r):r is ScoutRoom=>!!r);
}
export async function findScoutRoom(code:string):Promise<ScoutRoom|null> {
  requireStore();if(!/^[A-Z2-9]{6}$/.test(code))return null;
  if(scoutAdmin){const {data,error}=await scoutAdmin.from('scout_duel_rooms').select('state').eq('code',code).maybeSingle();if(error)throw error;return data?.state||null;}
  return (await listRooms()).find(r=>r.code===code)||null;
}
// Serialize queue selection and insertion, so simultaneous entrants pair up.
export async function matchmakeScout(proposed:ScoutRoom):Promise<ScoutRoom> {
  requireStore();
  if(scoutAdmin){const {data,error}=await scoutAdmin.rpc('scout_duel_matchmake',{p_state:proposed});if(error)throw Error('Scout matchmaking is not ready. Apply its migration.');return data as ScoutRoom;}
  return localLock('matchmaking',async()=>{
    const member=proposed.members[0];
    const waiting=(await listRooms()).filter(r=>r.mode==='online'&&r.status==='waiting'&&Date.now()-r.updatedAt<60000&&r.datasetVersion===proposed.datasetVersion).sort((a,b)=>a.createdAt-b.createdAt);
    const own=waiting.find(r=>r.members[0].tokenHash===member.tokenHash);
    if(own)return own;
    const match=waiting.find(r=>r.options.assistance===proposed.options.assistance&&r.options.hardcore===proposed.options.hardcore&&(!member.userId||r.members[0].userId!==member.userId));
    if(match)return mutateScoutRoom(match.id,r=>joinScoutRoom(r,member,Date.now()));
    await saveNewScoutRoom(proposed);return proposed;
  });
}
async function localLock<T>(id:string,action:()=>Promise<T>):Promise<T> {
  await mkdir(root,{recursive:true});const lock=path.join(root,`${id}.lock`);
  for(let i=0;i<80;i++){
    try{await writeFile(lock,String(Date.now()),{flag:'wx'});}
    catch(e){if((e as NodeJS.ErrnoException).code!=='EEXIST')throw e;const age=Number(await readFile(lock,'utf8').catch(()=>String(Date.now())));if(Date.now()-age>30000)await unlink(lock).catch(()=>{});await new Promise(r=>setTimeout(r,25));continue;}
    try{return await action();}finally{await unlink(lock).catch(()=>{});}
  }
  throw Error('The room is busy. Try again.');
}
export async function saveNewScoutRoom(room:ScoutRoom) {
  requireStore();
  if(scoutAdmin){const {error}=await scoutAdmin.from('scout_duel_rooms').insert({id:room.id,code:room.code,mode:room.mode,status:room.status,version:room.version,state:room});if(error)throw error;return;}
  await mkdir(root,{recursive:true});await writeFile(path.join(root,`${room.id}.json`),JSON.stringify(room),{flag:'wx',mode:0o600});
}
export async function mutateScoutRoom(id:string,mutate:(room:ScoutRoom)=>void):Promise<ScoutRoom> {
  requireStore();if(!validRoomId(id))throw new ScoutRuleError('Room not found. Start a new duel.');
  if(!scoutAdmin)return localLock(id,async()=>{
    const room=await loadScoutRoom(id);if(!room)throw new ScoutRuleError('Room not found. Start a new duel.');
    mutate(room);room.version++;room.updatedAt=Date.now();
    const temporary=path.join(root,`${id}.${randomUUID()}.tmp`);
    await writeFile(temporary,JSON.stringify(room),{mode:0o600});await rename(temporary,path.join(root,`${id}.json`));return room;
  });
  for(let retry=0;retry<8;retry++){
    const room=await loadScoutRoom(id);if(!room)throw new ScoutRuleError('Room not found. Start a new duel.');const before=room.version,signalBefore=signalKey(room);
    mutate(room);room.version++;room.updatedAt=Date.now();
    const {data,error}=await scoutAdmin.rpc('scout_duel_compare_and_swap',{p_id:id,p_version:before,p_state:room,p_notify:signalBefore!==signalKey(room)});
    if(error)throw Error('Scout’s Duel storage could not save the action.');if(data)return room;
  }
  throw Error('The room changed. Refresh and try again.');
}
export function newScoutIdentity(){return {id:randomUUID(),code:Array.from(randomBytes(6),n=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[n%32]).join(''),seed:randomBytes(8).toString('hex')};}
