const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const {randomUUID}=require('node:crypto');
const root=path.resolve(__dirname,'../..');

function harness(){
  const rows=new Map(),calls=[],rewards=[],cache=new Map();
  const admin={
    from(table){
      assert.equal(table,'game_progress');let user,insert;
      const query={select(){return query;},eq(key,value){if(key==='user_id')user=value;return query;},upsert(value){insert=value;return query;},async maybeSingle(){
        calls.push(insert?'initialize':'load');
        if(insert){if(rows.has(insert.user_id))return {data:null,error:null};user=insert.user_id;rows.set(user,{...insert,revision:0,requests:[]});}
        return {data:structuredClone(rows.get(user)||null),error:null};
      },single(){return query.maybeSingle();}};
      return query;
    },
    async rpc(name,args){
      calls.push('save');assert.equal(name,'apply_game_progress');const saved=rows.get(args.p_user);
      if(saved.requests.includes(args.p_request))return {data:structuredClone(saved),error:null};
      if(saved.revision!==args.p_revision)return {data:null,error:null};
      const next={...saved,state:args.p_state,run_id:args.p_run,revision:saved.revision+1,requests:[...saved.requests,args.p_request]};
      rewards.push(...args.p_events);rows.set(args.p_user,next);return {data:structuredClone(next),error:null};
    },
  };
  function load(file){
    if(file==='next/server')return {NextResponse:{json:(value,init)=>Response.json(value,init)}};
    if(file==='@/lib/supabase/server')return {adminSupabase:()=>admin,checkSameOrigin(){},async requestUser(request){const id=request.headers.get('X-Test-Account');return id?{id}:null;}};
    if(file.startsWith('@/'))file=path.join(root,'src',file.slice(2));
    if(!path.isAbsolute(file))return require(file);
    if(!path.extname(file))file+='.ts';
    if(cache.has(file))return cache.get(file);
    if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
    const exports={};cache.set(file,exports);
    const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
    vm.runInNewContext(code,{exports,Buffer,process,performance,Date,structuredClone,require:name=>load(name.startsWith('.')?path.resolve(path.dirname(file),name):name)},{filename:file});return exports;
  }
  const {POST}=load(path.join(root,'src/app/api/scoreline/route.ts'));
  async function send(action,view=null,fields={},account='account-a'){
    const response=await POST(new Request('http://localhost/api/scoreline',{method:'POST',headers:{'Content-Type':'application/json',...(account?{'X-Test-Account':account}:{})},body:JSON.stringify({action,requestId:randomUUID(),token:view?.token,runId:view?.id,cloudRevision:view?.cloudRevision,...fields})}));
    return {status:response.status,view:await response.json(),timing:response.headers.get('Server-Timing')};
  }
  return {send,rows,calls,rewards,load};
}

test('cloud initialization returns its inserted row without a second database read',async()=>{
  const h=harness(),result=await h.send('start');assert.equal(result.status,200);assert.equal(result.view.totalQuestions,10);
  assert.deepEqual(h.calls,['load','initialize']);assert.match(result.timing,/initialize;dur=/);
  h.calls.length=0;const resumed=await h.send('resume',result.view);assert.equal(resumed.status,200);assert.deepEqual(h.calls,['load']);
});

test('signed hints, submissions and next-match actions need only one atomic database request each',async()=>{
  const h=harness();let {view}=await h.send('start');
  for(const [action,fields] of [['hint',{hint:0}],['submit',{home:1,away:0}],['next',{}]]){
    h.calls.length=0;const result=await h.send(action,view,fields);assert.equal(result.status,200,JSON.stringify(result.view));
    assert.deepEqual(h.calls,['save']);assert.match(result.timing,/save;dur=/);assert(!result.timing.includes('load;'));view=result.view;
  }
  assert.equal(view.currentQuestion,2);
});

test('the faster action path still rejects stale tabs and makes request replays idempotent',async()=>{
  const h=harness(),{view}=await h.send('start'),requestId=randomUUID();
  const first=await h.send('hint',view,{hint:0,requestId});assert.equal(first.status,200);
  const retry=await h.send('hint',view,{hint:0,requestId});assert.equal(retry.status,200);assert.equal(retry.view.cloudRevision,first.view.cloudRevision);
  const stale=await h.send('hint',view,{hint:1});assert.equal(stale.status,409);
  assert.equal(h.rows.get('account-a').state.hints.length,1);
});

test('foreign and tampered state never bypass authoritative storage',async()=>{
  const h=harness(),a=await h.send('start'),b=await h.send('start',null,{},'account-b');h.calls.length=0;
  const foreign=await h.send('submit',a.view,{home:99,away:99},'account-b');assert.equal(foreign.status,409);assert.deepEqual(h.calls,['load']);
  const tampered=a.view.token.slice(0,-1)+'!';h.calls.length=0;
  const restored=await h.send('hint',{...a.view,token:tampered},{hint:0});assert.equal(restored.status,200);assert.deepEqual(h.calls,['load','save']);
  assert.equal(h.rows.get('account-b').state.answers.length,0);assert.equal(b.view.score,0);
});

test('completing a cloud round credits the actual result once, including a final-action retry',async()=>{
  const h=harness(),engine=h.load(path.join(root,'src/lib/scoreline/engine.ts'));let {view}=await h.send('start');
  for(let i=0;i<10;i++){
    const match=engine.matchesById.get(view.match.id);const submitted=await h.send('submit',view,match.score);assert.equal(submitted.status,200);view=submitted.view;
    const requestId=randomUUID(),before=view,result=await h.send('next',before,{requestId});assert.equal(result.status,200);view=result.view;
    if(i===9){const retried=await h.send('next',before,{requestId});assert.equal(retried.status,200);assert.equal(retried.view.cloudRevision,view.cloudRevision);}
  }
  assert.equal(view.complete,true);assert.equal(view.score,100);assert.equal(h.rewards.length,1);assert.equal(h.rewards[0].xp,100);
});

test('guest rounds still start and submit without database requests',async()=>{
  const h=harness(),started=await h.send('start',null,{},null),submitted=await h.send('submit',started.view,{home:0,away:0},null);
  assert.equal(submitted.status,200);assert(submitted.view.feedback);assert.deepEqual(h.calls,[]);
});
