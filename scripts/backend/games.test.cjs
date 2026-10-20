const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('typescript');
const root=path.resolve(__dirname,'../..'),cache=new Map();
const bundled=require('../../src/data/higher-lower-snapshot.json');
function load(file){
  if(file==='server-only')return {};
  if(file==='@/lib/higher-lower/snapshot-store')return {getHigherLowerSnapshot:async()=>bundled};
  if(file==='@/lib/supabase/server')return {adminSupabase(){throw Error('Unexpected database request');}};
  if(file.startsWith('@/'))file=path.join(root,'src',file.slice(2));
  if(!path.isAbsolute(file))return require(file);
  if(!path.extname(file))file+='.ts';
  if(cache.has(file))return cache.get(file);
  if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
  const exports={};cache.set(file,exports);
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
  vm.runInNewContext(code,{exports,Intl,Date,URL,require(name){return load(name.startsWith('.')?path.resolve(path.dirname(file),name):name);}},{filename:file});return exports;
}
const games=load(path.join(root,'src/lib/backend/games.ts'));
const matrix=load(path.join(root,'src/lib/matrix/engine.ts'));
const data=load(path.join(root,'src/lib/matrix/data.ts'));
const journey=load(path.join(root,'src/lib/journeyman.ts'));
const players=journey.journeyQuestionPool(require('../../src/data/transfer-players.json'));
const higher=load(path.join(root,'src/lib/higher-lower.ts'));

test('Matrix scores the issued board on the server and ignores client-supplied XP',async()=>{
  const state=await games.initialCloudState('matrix','easy');
  const solution=matrix.findSolution(state.puzzle,data.matrixPlayers);
  assert(solution);const result=await games.transitionCloudState('matrix',state,'matrix-run','save',{puzzleId:state.puzzle.id,answers:solution,submitted:true,xp:999999,score:999999});
  assert.equal(result.events.length,1);assert.equal(result.events[0].score,9);assert.equal(result.events[0].xp,325);assert.equal(result.events[0].won,true);
  assert.equal((await games.transitionCloudState('matrix',result.state,'matrix-run','save',{puzzleId:state.puzzle.id,answers:solution,submitted:true})).events.length,0);
});
test('Matrix drafts award nothing and reject different grids, unknown identities and duplicates',async()=>{
  const state=await games.initialCloudState('matrix','medium');const answers=Array(9).fill(null);
  assert.equal((await games.transitionCloudState('matrix',state,'run','save',{puzzleId:state.puzzle.id,answers,submitted:false})).events.length,0);
  await assert.rejects(games.transitionCloudState('matrix',state,'run','save',{puzzleId:'forged',answers}),/grid changed/i);
  await assert.rejects(games.transitionCloudState('matrix',state,'run','save',{puzzleId:state.puzzle.id,answers:['invented',...answers.slice(1)]}),/Unknown grid player/);
  answers[0]=answers[1]=data.matrixPlayers[0].id;
  await assert.rejects(games.transitionCloudState('matrix',state,'run','save',{puzzleId:state.puzzle.id,answers}),/each footballer once/);
});
test('Journeyman reveal costs and rewards are derived from the stored question',async()=>{
  let state=await games.initialCloudState('journeyman','default');
  state=(await games.transitionCloudState('journeyman',state,'journey-run','play',{move:{type:'reveal',method:'next'}})).state;
  const player=players[state.deck[state.question]],expected=journey.potentialPoints(player.clubs.length,state.reveals);
  const result=await games.transitionCloudState('journeyman',state,'journey-run','play',{move:{type:'guess',name:player.name},score:1000,xp:10000});
  assert.equal(result.events[0].score,expected);assert.equal(result.events[0].xp,80);assert.equal(result.events[0].source,'journey-run:0');
  assert.equal((await games.transitionCloudState('journeyman',result.state,'journey-run','play',{move:{type:'guess',name:player.name}})).events.length,0);
});
test('Journeyman does not award XP for failed attempts or permit skips after a reveal',async()=>{
  const initial=await games.initialCloudState('journeyman','default');
  const first=await games.transitionCloudState('journeyman',initial,'run','play',{move:{type:'guess',name:'Not a real answer'}});assert.equal(first.events.length,0);
  const failed=await games.transitionCloudState('journeyman',first.state,'run','play',{move:{type:'guess',name:'Still not a real answer'}});assert.equal(failed.events[0].xp,0);assert.equal(failed.events[0].score,0);
  const revealed=await games.transitionCloudState('journeyman',initial,'run','play',{move:{type:'reveal',method:'random'}});
  const skipped=await games.transitionCloudState('journeyman',revealed.state,'run','play',{move:{type:'skip'}});assert.equal(JSON.stringify(skipped.state.deck),JSON.stringify(revealed.state.deck));
});
test('Higher or Lower verifies each pick, grants 15 XP, and records the actual streak on a miss',async()=>{
  let state=await games.initialCloudState('higher-lower','marketValue');let credited=0;
  for(let count=0;count<5;count++){
    const left=higher.comparisonValue(state.left,state.category),right=higher.comparisonValue(state.right,state.category),side=left>=right?'left':'right';
    const result=await games.transitionCloudState('higher-lower',state,'higher-run','pick',{side,score:999999,xp:999999});state=result.state;credited+=result.events[0].xp;assert.equal(result.events[0].countsGame,false);
  }
  assert.equal(state.score,5);assert.equal(credited,75);
  while(higher.comparisonValue(state.left,state.category)===higher.comparisonValue(state.right,state.category)){state=(await games.transitionCloudState('higher-lower',state,'higher-run','pick',{side:'left'})).state;}
  const before=state.score,left=higher.comparisonValue(state.left,state.category),right=higher.comparisonValue(state.right,state.category);
  const loss=await games.transitionCloudState('higher-lower',state,'higher-run','pick',{side:left<right?'left':'right',score:999999});
  assert.equal(loss.state.gameOver,true);assert.equal(loss.events[0].score,before);assert.equal(loss.events[0].xp,0);
  assert.equal((await games.transitionCloudState('higher-lower',loss.state,'higher-run','pick',{side:'left'})).events.length,0);
});

test('Higher or Lower reserves the next card before a pick and exposes only its media',async()=>{
  for(const category of ['marketValue','goals','assists','transfer']){
    const state=await games.initialCloudState('higher-lower',category),queued=state.queuedPlayer;
    assert(queued);assert(![state.left.id,state.right.id].includes(queued.id));
    const publicState=games.publicCloudState('higher-lower',state);
    assert.equal(publicState.queuedPlayer,undefined);
    assert.equal(publicState.upcomingImages[0],queued.portrait);
    assert(publicState.upcomingImages.every(src=>typeof src==='string'));
    const left=higher.comparisonValue(state.left,category),right=higher.comparisonValue(state.right,category);
    const rotation=higher.resolveComparisonPick(left,right,left>=right?'left':'right',state.roundsPlayed);
    const result=await games.transitionCloudState('higher-lower',state,'queued-run','pick',{side:left>=right?'left':'right',queuedPlayer:state.left});
    assert.equal(result.state[rotation.replace].id,queued.id);
    assert.equal(result.state[rotation.replace].selectedTransfer?.id,queued.selectedTransfer?.id);
    assert(![result.state.left.id,result.state.right.id].includes(result.state.queuedPlayer.id));
  }
});

test('Higher or Lower can continue old saved streaks without a queued portrait',async()=>{
  const state=await games.initialCloudState('higher-lower','marketValue');delete state.queuedPlayer;
  assert.equal(games.publicCloudState('higher-lower',state).upcomingImages.length,0);
  const left=higher.comparisonValue(state.left,state.category),right=higher.comparisonValue(state.right,state.category);
  const result=await games.transitionCloudState('higher-lower',state,'legacy-run','pick',{side:left>=right?'left':'right'});
  assert.equal(result.state.score,1);assert(result.state.queuedPlayer);
  assert.equal(games.publicCloudState('higher-lower',{...result.state,gameOver:true}).upcomingImages.length,0);
});

test('Higher or Lower API keeps the queued card in storage across resume, pick and replay',async()=>{
  let saved=null;
  const admin={from(){
    const query={select(){return query;},eq(){return query;},async maybeSingle(){return {data:saved,error:null};},async single(){return {data:saved,error:null};},async upsert(row){saved={...row,revision:0,requests:[]};return {error:null};}};
    return query;
  },async rpc(name,input){
    assert.equal(name,'apply_game_progress');assert.equal(input.p_revision,saved.revision);
    saved={...saved,state:input.p_state,run_id:input.p_run,revision:saved.revision+1,requests:[...saved.requests,input.p_request]};
    return {data:saved,error:null};
  }};
  const route=path.join(root,'src/app/api/game-progress/route.ts'),exports={};
  const source=ts.transpileModule(fs.readFileSync(route,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
  vm.runInNewContext(source,{exports,require(name){
    if(name==='next/server')return {NextResponse:{json:(value,init)=>Response.json(value,init)}};
    if(name==='@/lib/supabase/server')return {adminSupabase:()=>admin,checkSameOrigin(){},requestUser:async()=>({id:'portrait-test'})};
    if(name==='@/lib/backend/games')return games;
    return require(name);
  }});
  async function send(action,view,fields={}){
    const response=await exports.POST(new Request('https://football.test/api/game-progress',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:'higher-lower',variant:'transfer',action,requestId:require('node:crypto').randomUUID(),runId:view?.runId,revision:view?.revision,...fields})}));
    assert.equal(response.status,200);const value=await response.json();assert(!('queuedPlayer' in value.state));
    assert.equal(value.state.upcomingImages[0],saved.state.queuedPlayer.portrait);return value;
  }
  const initial=await send('resume'),queued=saved.state.queuedPlayer;
  const resumed=await send('resume',initial);assert.equal(resumed.state.upcomingImages[0],queued.portrait);
  const left=higher.comparisonValue(initial.state.left,'transfer'),right=higher.comparisonValue(initial.state.right,'transfer');
  const requestId=require('node:crypto').randomUUID(),fields={side:left>=right?'left':'right',requestId};
  const picked=await send('pick',initial,fields);
  assert([picked.state.left.id,picked.state.right.id].includes(queued.id));
  const replay=await send('pick',initial,fields);assert.equal(replay.revision,picked.revision);
  await send('restart',picked);
});
test('OAuth return URLs cannot redirect to another origin',()=>{
  const {safeAuthReturnPath}=load(path.join(root,'src/lib/supabase/redirect.ts'));
  assert.equal(safeAuthReturnPath('/profile#settings','https://football.test'),'/profile#settings');
  for(const input of ['//evil.test','/\\evil.test','/\n/evil.test','https://evil.test',null])assert.equal(safeAuthReturnPath(input,'https://football.test'),'/profile');
});

test('game requests use the browser Host when Next exposes its internal bind address',()=>{
  const {checkSameOrigin}=load(path.join(root,'src/lib/http/origin.ts'));
  const request=(url,origin,host)=>new Request(url,{headers:{...(origin?{Origin:origin}:{}),...(host?{Host:host}:{})}});
  assert.doesNotThrow(()=>checkSameOrigin(request('http://0.0.0.0:3000/api/scoreline','http://localhost:3000','localhost:3000'),true));
  assert.doesNotThrow(()=>checkSameOrigin(request('http://internal:3000/api/scoreline','https://football.test','football.test'),false));
  assert.doesNotThrow(()=>checkSameOrigin(request('http://127.0.0.1:3000/api/scoreline','http://localhost:3000'),true));
  assert.doesNotThrow(()=>checkSameOrigin(request('https://football.test/api/scoreline','https://football.test'),false));
  assert.doesNotThrow(()=>checkSameOrigin(request('http://localhost:3000/api/scoreline'),true));
  for(const [origin,host,development] of [['https://evil.test','localhost:3000',true],['http://localhost:3001','localhost:3000',true],['http://localhost:3000','127.0.0.1:3000',false],['null','localhost:3000',true]]){
    assert.throws(()=>checkSameOrigin(request('http://0.0.0.0:3000/api/scoreline',origin,host),development),/must come from Football Genius/);
  }
});
