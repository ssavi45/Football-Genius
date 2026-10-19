import { generateScoutBoard } from './board';
import { evaluateScoutQuestion, scoutQuestions } from './questions';
import type { Difficulty, ScoutAction, ScoutMember, ScoutOptions, ScoutPlayer, ScoutRoom, ScoutView, Seat } from './types';

const other = (seat: Seat): Seat => seat === 0 ? 1 : 0;
export class ScoutRuleError extends Error {}
function requireRule(value: unknown, message: string): asserts value { if (!value) throw new ScoutRuleError(message); }
export function createScoutMember(name: string, tokenHash: string, now: number, userId: string | null = null, bot = false): ScoutMember {
  return { name:name.trim().slice(0,30) || 'Scout', tokenHash,userId,bot,secretId:null,remaining:[],deductions:[],forcedOut:[],questions:[],turns:0,misses:0,shootBlockedUntil:0,lastSeen:now,shootoutGuess:null };
}
export function createScoutRoom(id: string, code: string, seed: string, mode: ScoutRoom['mode'], member: ScoutMember, options: ScoutOptions, players: ScoutPlayer[], version: string, now: number, random: () => number): ScoutRoom {
  const board = generateScoutBoard(players,seed);
  const ids = board.map(p=>p.id);
  const opponent = mode === 'ai' ? createScoutMember('Tactical Scout','bot',now,null,true) : null;
  member.remaining=[...ids]; member.deductions=[...ids];
  if(opponent) { opponent.remaining=[...ids]; opponent.deductions=[...ids]; opponent.secretId=ids[Math.floor(random()*ids.length)]; }
  return { id,code,seed,mode,version:0,datasetVersion:version,boardIds:ids,options,status:opponent?'selecting':'waiting',members:[member,opponent],activeSeat:random()<.5?0:1,deadline:now+30000,winner:null,reason:null,logs:[],processed:[],createdAt:now,updatedAt:now,aiDue:null,pause:null };
}
export function joinScoutRoom(room: ScoutRoom, member: ScoutMember, now: number) {
  requireRule(room.status==='waiting'&&!room.members[1],'This room already has an opponent.');
  member.remaining=[...room.boardIds]; member.deductions=[...room.boardIds]; room.members[1]=member;
  room.status='selecting'; room.deadline=now+30000;
}
function finish(room: ScoutRoom, winner: Seat | null, reason: string) { room.status='completed';room.winner=winner;room.reason=reason;room.aiDue=null;room.pause=null; }
function scheduleAI(room: ScoutRoom, now: number) {
  const delays: Record<Difficulty,number> = { rookie:2500,tactician:1800,'world-class':1200 };
  room.aiDue = room.members[room.activeSeat]?.bot ? now+delays[room.options.difficulty] : null;
}
function start(room: ScoutRoom, now: number) { room.status='active';room.deadline=now+room.options.turnSeconds*1000;scheduleAI(room,now); }
function pass(room: ScoutRoom, seat: Seat, now: number) {
  room.members[seat]!.turns++;
  room.activeSeat=other(seat); room.deadline=now+room.options.turnSeconds*1000;scheduleAI(room,now);
}
function log(room: ScoutRoom, seat: Seat, kind: ScoutRoom['logs'][number]['kind'], text: string, answer: boolean | null, now: number) { room.logs.push({id:room.logs.length+1,seat,kind,text,answer,at:now}); }
// Resume rooms saved by the previous capped-turn rules without revealing secrets.
function resumeLegacyShootout(room: ScoutRoom, now: number) {
  if(room.status!=='shootout')return;
  room.members.forEach(member=>{if(member)member.shootoutGuess=null;});
  room.activeSeat=other(room.activeSeat);
  if(room.pause)room.pause.remainingMs=room.options.turnSeconds*1000;
  start(room,now);
}
export function applyScoutAction(room: ScoutRoom, seat: Seat, action: ScoutAction, players: ScoutPlayer[], now: number): void {
  const me=room.members[seat],opponent=room.members[other(seat)];
  requireRule(me,'Player not found.'); requireRule(room.status!=='completed','The duel has finished.');
  resumeLegacyShootout(room,now);
  if(action.type==='RESIGN') { if(opponent)finish(room,other(seat),'OPPONENT_RESIGNED');else finish(room,null,'CANCELLED');return; }
  if(action.type==='LOCK_IN_PLAYER') {
    requireRule(room.status==='selecting'&&!me.secretId,'Selection is already locked.');
    requireRule(room.boardIds.includes(action.playerId),'Choose a player on this board.');
    me.secretId=action.playerId;
    if(room.members.every(m=>m?.secretId))start(room,now);
    return;
  }
  requireRule(opponent?.secretId&&me.secretId,'Both scouts must lock in first.');
  requireRule(!room.pause,'The opponent is reconnecting.');
  if(action.type==='UPDATE_BOARD_STATE') {
    requireRule(room.status==='active'&&!room.options.assistance,'Manual elimination is disabled for this match.');
    requireRule(room.boardIds.includes(action.playerId)&&!me.forcedOut.includes(action.playerId),'This card cannot be restored.');
    if(me.remaining.includes(action.playerId)) { requireRule(me.remaining.length>1,'Keep at least one candidate.');me.remaining=me.remaining.filter(id=>id!==action.playerId); }
    else me.remaining.push(action.playerId);
    return;
  }
  requireRule(room.status==='active'&&room.activeSeat===seat,'Wait for your turn.');
  requireRule(now<room.deadline,'Your turn has expired.');
  if(action.type==='ASK_QUESTION') {
    requireRule(!me.questions.includes(action.questionId),'You already asked this question.');
    const board=players.filter(p=>room.boardIds.includes(p.id));
    const question=scoutQuestions(board).find(q=>q.id===action.questionId);
    requireRule(question,'This question is not supported by the board data.');
    const target=board.find(p=>p.id===opponent.secretId)!;
    const answer=evaluateScoutQuestion(target,question);
    requireRule(answer!==null,'That fact is unknown. Ask another question.');
    me.questions.push(question.id);
    me.deductions=me.deductions.filter(id=>evaluateScoutQuestion(board.find(p=>p.id===id)!,question)===answer);
    if(room.options.assistance||me.bot)me.remaining=[...me.deductions];
    log(room,seat,'question',question.text,answer,now);pass(room,seat,now);return;
  }
  requireRule(action.type==='SHOOT_GUESS','Unknown action.');
  requireRule(me.turns>=me.shootBlockedUntil,'Ask a question this turn before shooting again.');
  requireRule(me.remaining.includes(action.playerId),'Choose a remaining candidate.');
  const hit=action.playerId===opponent.secretId;
  const player=players.find(p=>p.id===action.playerId)!;
  log(room,seat,'shoot',`Shoot: ${player.name}`,hit,now);
  if(hit) { me.turns++;finish(room,seat,'CORRECT_SHOOT');return; }
  me.misses++; me.forcedOut.push(action.playerId);
  me.remaining=me.remaining.filter(id=>id!==action.playerId);me.deductions=me.deductions.filter(id=>id!==action.playerId);
  me.shootBlockedUntil=me.turns+2;pass(room,seat,now);
}

// The AI policy receives candidate identities and public evidence only. The
// caller cannot pass a hidden target through this interface.
export function chooseScoutAI(candidates: ScoutPlayer[], questions: ReturnType<typeof scoutQuestions>, used: string[], difficulty: Difficulty, shootAllowed: boolean, random: () => number = Math.random): ScoutAction {
  if(!candidates.length)throw Error('AI has no candidates');
  const available=questions.filter(q=>!used.includes(q.id)).map(q=>({q,yes:candidates.filter(p=>evaluateScoutQuestion(p,q)===true).length})).filter(q=>q.yes>0&&q.yes<candidates.length);
  const threshold=difficulty==='rookie'?1:difficulty==='tactician'?2:3;
  if(shootAllowed&&(candidates.length===1||!available.length||(candidates.length<=threshold&&random()<.5)))return {type:'SHOOT_GUESS',playerId:candidates[Math.floor(random()*candidates.length)].id};
  available.sort((a,b)=>Math.abs(a.yes/candidates.length-.5)-Math.abs(b.yes/candidates.length-.5)||a.q.id.localeCompare(b.q.id));
  if(available.length) {
    const index=difficulty==='rookie'?Math.floor(random()*available.length):difficulty==='tactician'&&random()<.12?Math.min(available.length-1,2):0;
    return {type:'ASK_QUESTION',questionId:available[index].q.id};
  }
  const fallback=questions.find(q=>!used.includes(q.id));
  if(fallback)return {type:'ASK_QUESTION',questionId:fallback.id};
  return {type:'SHOOT_GUESS',playerId:candidates[0].id};
}
export function tickScoutRoom(room: ScoutRoom, players: ScoutPlayer[], now: number, random: () => number = Math.random) {
  if(room.status==='completed'||room.status==='waiting')return;
  resumeLegacyShootout(room,now);
  if(room.status==='selecting') {
    if(now>=room.deadline) { for(const m of room.members)if(m&&!m.secretId)m.secretId=room.boardIds[Math.floor(random()*24)];start(room,now); }
    return;
  }
  if(room.mode!=='ai') {
    const absent=room.members.map(m=>!!m&&!m.bot&&now-m.lastSeen>53000);
    if(absent.every(Boolean)){finish(room,null,'ABANDONED');return;}
    if(absent.some(Boolean)){finish(room,absent[0]?1:0,'DISCONNECTED');return;}
  }
  if(room.pause) {
    const paused=room.pause;
    if(now-paused.since>=45000) { finish(room,other(paused.seat),'DISCONNECTED');return; }
    if(now-room.members[paused.seat]!.lastSeen<6000) { room.deadline=now+paused.remainingMs;room.pause=null;scheduleAI(room,now); }
    else return;
  }
  const disconnected=room.members.findIndex(m=>m&&!m.bot&&now-m.lastSeen>8000);
  if(disconnected>=0&&room.mode!=='ai') { room.pause={seat:disconnected as Seat,since:room.members[disconnected]!.lastSeen+8000,remainingMs:Math.max(0,room.deadline-(room.members[disconnected]!.lastSeen+8000))};return; }
  if(now>=room.deadline) { log(room,room.activeSeat,'timeout','Turn timed out',null,now);pass(room,room.activeSeat,now);return; }
  if(room.aiDue!==null&&now>=room.aiDue) {
    const me=room.members[room.activeSeat]!;
    const board=players.filter(p=>room.boardIds.includes(p.id));
    const action=chooseScoutAI(board.filter(p=>me.deductions.includes(p.id)),scoutQuestions(board),me.questions,room.options.difficulty,me.turns>=me.shootBlockedUntil,random);
    // If all questions are exhausted during a shot cooldown, let the timer
    // finish the turn rather than throwing and blocking room synchronization.
    if(action.type==='SHOOT_GUESS'&&me.turns<me.shootBlockedUntil){room.aiDue=null;return;}
    applyScoutAction(room,room.activeSeat,action,players,now);
  }
}
export function scoutView(room: ScoutRoom, seat: Seat, players: ScoutPlayer[], now: number): ScoutView {
  const me=room.members[seat]!,opponent=room.members[other(seat)];
  const find=(id: string | null | undefined)=>players.find(p=>p.id===id)||null;
  return {id:room.id,code:room.code,mode:room.mode,version:room.version,datasetVersion:room.datasetVersion,seed:room.seed,status:room.status,board:room.boardIds.map(id=>find(id)!),options:room.options,seat,activeSeat:room.activeSeat,deadline:room.deadline,serverNow:now,mySecret:find(me.secretId),opponentLocked:!!opponent?.secretId,opponentName:opponent?.name||'Waiting for a scout',opponentRemaining:opponent?.remaining.length??24,remaining:me.remaining,forcedOut:me.forcedOut,questionCount:me.questions.length,askedIds:me.questions,turn:me.turns+1,shootAllowed:room.status==='active'&&room.activeSeat===seat&&me.turns>=me.shootBlockedUntil,misses:me.misses,logs:room.logs,winner:room.winner,reason:room.reason,secrets:room.status==='completed'?[find(room.members[0].secretId),find(room.members[1]?.secretId)]:null,pause:room.pause?{seat:room.pause.seat,until:room.pause.since+45000}:null,shootoutSubmitted:false,earnedXp:room.status==='completed'&&room.winner===seat?200:0,rewardOnServer:false};
}
