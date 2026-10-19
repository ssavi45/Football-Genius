const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const load=require('./load-ts.cjs');
const {scoutPlayers:players,SCOUT_DATASET_VERSION}=load('src/lib/scouts-duel/data.ts');
const {generateScoutBoard,seededRandom}=load('src/lib/scouts-duel/board.ts');
const {scoutQuestions,evaluateScoutQuestion,parseScoutQuestion}=load('src/lib/scouts-duel/questions.ts');
const {createScoutRoom,createScoutMember,joinScoutRoom,applyScoutAction:act,tickScoutRoom,scoutView,chooseScoutAI}=load('src/lib/scouts-duel/engine.ts');
const options={difficulty:'tactician',assistance:false,hardcore:false,turnSeconds:45};
function room(ai=false,settings={}){const r=createScoutRoom('test-room','ABC234','1234567890abcdef',ai?'ai':'custom',createScoutMember('You','hash-a',1000),{...options,...settings},players,SCOUT_DATASET_VERSION,1000,()=>.2);if(!ai)joinScoutRoom(r,createScoutMember('Opponent','hash-b',1000),1000);return r;}
function active(settings={}){const r=room(false,settings);act(r,0,{type:'LOCK_IN_PLAYER',playerId:r.boardIds[0]},players,1001);act(r,1,{type:'LOCK_IN_PLAYER',playerId:r.boardIds[1]},players,1002);r.activeSeat=0;return r;}
const question=r=>scoutQuestions(players.filter(p=>r.boardIds.includes(p.id))).find(q=>!r.members[r.activeSeat].questions.includes(q.id));
const ask=(r,seat=r.activeSeat,now=1100)=>act(r,seat,{type:'ASK_QUESTION',questionId:question(r).id},players,now);

test('150 unique player identities have valid positions, flags, portraits, and typed truth fields',()=>{
 assert.equal(players.length,150);assert.equal(new Set(players.map(p=>p.id)).size,150);
 for(const p of players){assert(['GK','DF','MF','FW'].includes(p.position));assert(['left','right','both'].includes(p.footedness));for(const key of ['image','nationalityFlag'])assert(fs.existsSync(path.join(__dirname,'../../public',p[key])),`${p.id}: missing ${key}`);for(const key of ['isRetired','ballonDor','worldCupWinner','clWinner'])assert.equal(typeof p[key],'boolean');if(p.isRetired)assert.equal(p.league,null);}
});

test('every player uses a locally verified transparent portrait with identical framing',async()=>{
 const sharp=require('sharp'),{createHash}=require('node:crypto'),manifest=require('../../public/img/scouts-duel/portrait-sources.json');
 assert.equal(Object.keys(manifest.players).length,players.length);
 for(const player of players){
  const entry=manifest.players[player.id];assert.equal(player.image,entry.path);
  const bytes=fs.readFileSync(path.join(__dirname,'../../public',player.image)),meta=await sharp(bytes).metadata();
  assert.equal(meta.format,'webp');assert.equal(meta.width,256);assert.equal(meta.height,256);assert.equal(meta.hasAlpha,true);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),entry.sha256,player.name);
  const stats=await sharp(bytes).stats();assert.equal(stats.channels[3].min,0,player.name);
 }
});
test('64-bit seeds produce identical 24-player 3x8 boards with strict quotas and diversity',()=>{
 for(let i=0;i<1000;i++){
  const seed=BigInt(i+1).toString(16).padStart(16,'0'),a=generateScoutBoard(players,seed),b=generateScoutBoard(players,seed);
  assert.deepEqual(a.map(p=>p.id),b.map(p=>p.id));assert.equal(a.length,24);assert.equal(new Set(a.map(p=>p.id)).size,24);
  for(const [position,n]of Object.entries({GK:2,DF:7,MF:7,FW:8}))assert.equal(a.filter(p=>p.position===position).length,n);
  for(const p of a){if(!p.isRetired)assert(a.filter(q=>!q.isRetired&&q.club===p.club).length<=5);if(p.league)assert(a.filter(q=>q.league===p.league).length<=7);}
  assert(new Set(a.map(p=>p.continent)).size>=4);
 }
 assert.throws(()=>seededRandom('123'),/seed/);assert.throws(()=>generateScoutBoard(players.filter(p=>p.position!=='GK'),'0000000000000001'),/coverage/);
});
test('secret selection stays private in opponent views, including early lock-in',()=>{
 const r=room();act(r,0,{type:'LOCK_IN_PLAYER',playerId:r.boardIds[0]},players,1001);
 const opponent=scoutView(r,1,players,1002),owner=scoutView(r,0,players,1002);
 assert.equal(opponent.mySecret,null);assert.equal(opponent.secrets,null);assert(!('opponentSecretId'in opponent));assert.equal(owner.mySecret.id,r.boardIds[0]);assert.equal(r.status,'selecting');
 act(r,1,{type:'LOCK_IN_PLAYER',playerId:r.boardIds[1]},players,1003);assert.equal(r.status,'active');
});
test('selection timeout automatically picks actual board players and starts the match',()=>{
 const r=room();tickScoutRoom(r,players,31001,()=>.999);assert.equal(r.status,'active');assert(r.members.every(m=>r.boardIds.includes(m.secretId)));assert.equal(r.deadline,76001);
});
test('questions use server truth and pass exactly one turn; out-of-turn and repeated asks fail',()=>{
 const r=active(),q=question(r),target=players.find(p=>p.id===r.members[1].secretId);
 assert.throws(()=>act(r,1,{type:'ASK_QUESTION',questionId:q.id},players,1100),/turn/);
 act(r,0,{type:'ASK_QUESTION',questionId:q.id},players,1100);assert.equal(r.logs[0].answer,evaluateScoutQuestion(target,q));assert.equal(r.activeSeat,1);assert.equal(r.members[0].turns,1);
 ask(r);assert.throws(()=>act(r,0,{type:'ASK_QUESTION',questionId:q.id},players,1200),/already/);
});
test('manual board changes are reversible and do not consume a turn',()=>{
 const r=active(),id=r.boardIds[3];act(r,0,{type:'UPDATE_BOARD_STATE',playerId:id},players,1100);assert.equal(r.members[0].remaining.length,23);assert.equal(r.members[0].turns,0);act(r,0,{type:'UPDATE_BOARD_STATE',playerId:id},players,1101);assert.equal(r.members[0].remaining.length,24);
});
test('auto-assist eliminates only contradictions and preserves the actual target',()=>{
 const r=active({assistance:true}),q=question(r),target=r.members[1].secretId;act(r,0,{type:'ASK_QUESTION',questionId:q.id},players,1100);
 const answer=r.logs[0].answer;assert(r.members[0].remaining.includes(target));assert(r.members[0].remaining.every(id=>evaluateScoutQuestion(players.find(p=>p.id===id),q)===answer));assert.throws(()=>act(r,0,{type:'UPDATE_BOARD_STATE',playerId:target},players,1101),/disabled/);
});
test('missed shots force elimination and a cooldown without ending the match',()=>{
 const r=active(),wrong=r.boardIds.filter(id=>id!==r.members[1].secretId);
 act(r,0,{type:'SHOOT_GUESS',playerId:wrong[0]},players,1100);assert.equal(r.status,'active');assert.equal(r.activeSeat,1);assert(!r.members[0].remaining.includes(wrong[0]));assert.throws(()=>act(r,0,{type:'UPDATE_BOARD_STATE',playerId:wrong[0]},players,1101),/restored/);
 ask(r);assert.throws(()=>act(r,0,{type:'SHOOT_GUESS',playerId:wrong[1]},players,1200),/question/);ask(r);ask(r);act(r,0,{type:'SHOOT_GUESS',playerId:wrong[1]},players,1300);assert.equal(r.status,'active');assert.equal(r.winner,null);assert.equal(r.members[0].misses,2);
});
test('saved hardcore rooms allow repeated misses; correct shots alone award victory XP',()=>{
 const r=active({hardcore:true}),wrong=r.boardIds.filter(id=>id!==r.members[1].secretId);
 for(let i=0;i<4;i++){
  act(r,0,{type:'SHOOT_GUESS',playerId:wrong[i]},players,r.deadline-1);assert.equal(r.status,'active');assert.equal(r.winner,null);
  // Opponent turn, own cooldown turn, then opponent turn.
  for(let j=0;j<3;j++){const now=r.deadline+1;r.members.forEach(m=>m.lastSeen=now);tickScoutRoom(r,players,now);}
 }
 assert.equal(r.members[0].misses,4);assert.equal(r.activeSeat,0);
 act(r,0,{type:'SHOOT_GUESS',playerId:r.members[1].secretId},players,r.deadline-1);assert.equal(r.reason,'CORRECT_SHOOT');assert.equal(r.winner,0);
 const win=active();act(win,0,{type:'SHOOT_GUESS',playerId:win.members[1].secretId},players,1100);assert.equal(win.winner,0);assert.equal(scoutView(win,0,players,1101).earnedXp,200);assert.equal(scoutView(win,1,players,1101).earnedXp,0);assert(scoutView(win,0,players,1101).secrets.every(Boolean));assert.throws(()=>ask(win),/finished/);
});
test('unsupported custom text does not silently map to false or consume a turn',()=>{
 const r=active(),q=scoutQuestions(players.filter(p=>r.boardIds.includes(p.id)));
 assert.equal(parseScoutQuestion('Was he teammates with Messi?',q),null);assert.equal(parseScoutQuestion('Is he not a forward?',q),null);assert.equal(parseScoutQuestion('Is he a forward and left footed?',q),null);assert.equal(parseScoutQuestion('Is he a striker?',q),null);assert.equal(parseScoutQuestion('is your player a forward?',q).id,'position:FW');assert.equal(r.members[0].turns,0);
});
test('missing age or club-history facts suppress unsupported questions rather than assuming NO',()=>{
 const board=players.slice(0,24).map(p=>({...p,age:null,pastClubs:null}));const q=scoutQuestions(board);assert(!q.some(q=>q.kind==='age'||q.kind==='pastClub'));assert.equal(evaluateScoutQuestion(board[0],{kind:'age',value:'over30'}),null);
});
test('entropy AI decisions depend on the public candidate pool, not the hidden secret',()=>{
 const r=active(),board=players.filter(p=>r.boardIds.includes(p.id)),q=scoutQuestions(board);
 const decision=chooseScoutAI(board,q,[],'world-class',true,()=>.8);assert.equal(decision.type,'ASK_QUESTION');
 const chosen=q.find(q=>q.id===decision.questionId),split=Math.abs(board.filter(p=>evaluateScoutQuestion(p,chosen)).length/24-.5);
 assert(q.every(q=>Math.abs(board.filter(p=>evaluateScoutQuestion(p,q)).length/24-.5)>=split));
 r.members[0].secretId=r.boardIds[8];assert.deepEqual(chooseScoutAI(board,q,[],'world-class',true,()=>.8),decision);
 assert.equal(chooseScoutAI([board[0]],q,[],'rookie',true,()=>.9).playerId,board[0].id);
});
test('turn deadline consumes one action and rejects late actions',()=>{
 const r=active();r.members.forEach(m=>m.lastSeen=47000);assert.throws(()=>ask(r,0,47003),/expired/);tickScoutRoom(r,players,47003,()=>.3);assert.equal(r.logs[0].kind,'timeout');assert.equal(r.activeSeat,1);assert.equal(r.members[0].turns,1);
});
test('disconnect pauses the timer, reconnect restores it, and grace expiry forfeits',()=>{
 const r=active();r.members[0].lastSeen=9500;r.members[1].lastSeen=1000;tickScoutRoom(r,players,9500);assert.equal(r.pause.seat,1);const time=r.pause.remainingMs;r.members[1].lastSeen=11000;r.members[0].lastSeen=11000;tickScoutRoom(r,players,11000);assert.equal(r.pause,null);assert.equal(r.deadline,11000+time);
 r.members[0].lastSeen=70000;r.members[1].lastSeen=11000;tickScoutRoom(r,players,70000);assert.equal(r.status,'completed');assert.equal(r.winner,0);
});
test('questions and timeouts continue past the former turn cap until a correct shot',()=>{
 const r=active();r.members.forEach(m=>m.turns=14);ask(r);ask(r);assert.equal(r.status,'active');
 for(let i=0;i<80;i++){
  const now=r.deadline+1,seat=r.activeSeat;r.members.forEach(m=>m.lastSeen=now);tickScoutRoom(r,players,now);
  assert.equal(r.status,'active');assert.equal(r.activeSeat,1-seat);assert.equal(r.winner,null);
 }
 const seat=r.activeSeat,now=r.deadline-1000;
 ask(r,seat,now);assert.equal(r.status,'active');assert(r.members.every(m=>m.turns>15));assert.equal(scoutView(r,seat,players,now).secrets,null);
 const shooter=r.activeSeat;act(r,shooter,{type:'SHOOT_GUESS',playerId:r.members[1-shooter].secretId},players,now+1);
 assert.equal(r.status,'completed');assert.equal(r.winner,shooter);assert.equal(r.reason,'CORRECT_SHOOT');
});

test('saved final-shootout rooms resume normal alternating play with their secrets hidden',()=>{
 const r=active();r.status='shootout';r.members.forEach(m=>{m.turns=15;m.shootoutGuess=r.boardIds[4];m.lastSeen=2000;});
 tickScoutRoom(r,players,2000);assert.equal(r.status,'active');assert.equal(r.activeSeat,1);assert.equal(r.deadline,47000);
 assert(r.members.every(m=>m.shootoutGuess===null));assert.equal(scoutView(r,0,players,2001).secrets,null);
 ask(r,1,2002);assert.equal(r.activeSeat,0);assert.equal(r.status,'active');
});
test('an empty manually narrowed board reports zero and can restore another candidate after a missed shot',()=>{
 const r=active(),wrong=r.boardIds[2];r.members[0].remaining=[wrong];act(r,0,{type:'SHOOT_GUESS',playerId:wrong},players,1100);
 assert.equal(scoutView(r,1,players,1101).opponentRemaining,0);
 act(r,0,{type:'UPDATE_BOARD_STATE',playerId:r.boardIds[1]},players,1102);assert.equal(r.members[0].remaining.length,1);
});
test('exhausted AI questions during a shot cooldown do not block room synchronization',()=>{
 const r=room(true);act(r,0,{type:'LOCK_IN_PLAYER',playerId:r.boardIds[0]},players,1001);r.activeSeat=1;r.aiDue=1100;
 const bot=r.members[1];bot.questions=scoutQuestions(players.filter(p=>r.boardIds.includes(p.id))).map(q=>q.id);bot.shootBlockedUntil=2;
 assert.doesNotThrow(()=>tickScoutRoom(r,players,1100));assert.equal(r.aiDue,null);assert.equal(r.status,'active');
});
test('AI games across difficulties reach valid results with both targets retained by logical deductions',()=>{
 for(let i=1;i<=30;i++){
  const random=seededRandom(BigInt(i).toString(16).padStart(16,'0'));
  const settings={...options,difficulty:['rookie','tactician','world-class'][i%3],assistance:true};
  const r=createScoutRoom('simulation','SIM234',BigInt(i).toString(16).padStart(16,'0'),'ai',createScoutMember('You','hash',1000),settings,players,SCOUT_DATASET_VERSION,1000,random);
  act(r,0,{type:'LOCK_IN_PLAYER',playerId:r.boardIds[i%24]},players,1001);
  let now=1100;
  for(let step=0;step<80&&r.status!=='completed';step++){
   for(const seat of [0,1])assert(r.members[seat].deductions.includes(r.members[1-seat].secretId));
   if(r.activeSeat===1){now=Math.max(now,r.aiDue||now);tickScoutRoom(r,players,now,random);}
   else {const me=r.members[0],board=players.filter(p=>r.boardIds.includes(p.id));const decision=chooseScoutAI(board.filter(p=>me.deductions.includes(p.id)),scoutQuestions(board),me.questions,settings.difficulty,me.turns>=me.shootBlockedUntil,random);act(r,0,decision,players,now);}
   now+=100;
  }
  assert.equal(r.status,'completed',`simulation ${i}`);assert([0,1,null].includes(r.winner));
 }
});
