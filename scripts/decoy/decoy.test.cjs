const {test} = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load.cjs');
const {DecoySimulation} = load('./src/lib/decoy/simulation.ts');
const {FIELD,TUNE} = load('./src/lib/decoy/config.ts');
const {laneClearance} = load('./src/lib/decoy/ai.ts');
const {run} = require('./tune.cjs');
const idle = {x:0,y:0,sprint:false,feint:false};
function start(level=0, seed=42) {const s=new DecoySimulation(level,seed);s.start();for(let i=0;i<181;i++)s.step(idle);return s;}

for(let level=0;level<3;level++) {
  test(`challenge ${level+1}: a real decoy run wins the fixed campaign seed`,()=>{
    const s=run(level,42,[.3,680,450,.55]);
    assert.equal(s.phase,'goal');assert.equal(s.stars,3);
    for(const name of ['drawn','lane','feint','assist','pass','shot','goal'])assert(s.events.some(e=>e.type===name),name);
    assert(s.ball.x>=FIELD.right);assert.equal(s.ball.owner,null);
    assert(s.elapsed>2);assert(s.score>700&&s.score<1100);
  });
  test(`challenge ${level+1}: doing nothing loses; defenders do not blindly follow`,()=>{
    const s=start(level);for(let i=0;i<2500;i++)s.step(idle);
    assert.equal(s.phase,'failure');assert.match(s.reason,/Time expired/);assert.equal(s.score,0);
    assert(s.defenders.some(d=>d.state==='screen lane'));assert.equal(s.ball.owner,8);
  });
}
test('same seed and inputs produce identical trajectories, scores and results',()=>{
  const a=run(2,42,[.3,680,450,.55]),b=run(2,42,[.3,680,450,.55]);
  assert.deepEqual(a.snapshot(),b.snapshot());assert.deepEqual(a.actors,b.actors);assert.deepEqual(a.ball,b.ball);
});
test('interception, keeper save and missed shot arise in unmodified scenarios',()=>{
  const fixtures=[{l:0,seed:1,r:[.9,620,90,1.2],reason:/Intercepted/},{l:1,seed:1,r:[.9,790,500,1.2],reason:/Saved/},{l:1,seed:3,r:[.9,620,90,1.2],reason:/Just wide/}];
  for(const f of fixtures){const s=run(f.l,f.seed,f.r);assert.equal(s.phase,'failure');assert.match(s.reason,f.reason);assert(!s.awarded.has('goal'));}
});
test('pause freezes countdown, timers, movement, ball and stamina; resume continues',()=>{
  const s=new DecoySimulation();s.start();s.step(idle);s.pause();let before=s.snapshot();for(let i=0;i<180;i++)s.step({...idle,x:1,sprint:true,feint:true});assert.deepEqual(s.snapshot(),before);
  s.resume();assert.equal(s.phase,'countdown');for(let i=0;i<185;i++)s.step(idle);assert.equal(s.phase,'playing');
  s.pause();before=s.snapshot();const ball={...s.ball};s.step({...idle,x:1});assert.deepEqual(s.snapshot(),before);assert.deepEqual(s.ball,ball);s.resume();s.step({...idle,x:1});assert(s.player.vx>0);
});
test('movement accelerates, diagonal speed is bounded, players stay on pitch',()=>{
  const s=start();s.step({...idle,x:-1,y:-1});assert(Math.hypot(s.player.vx,s.player.vy)<TUNE.walk);
  for(let i=0;i<650;i++){s.step({...idle,x:-1,y:-1});assert(Math.hypot(s.player.vx,s.player.vy)<=TUNE.walk+.001);assert(s.player.x>=FIELD.left+14);assert(s.player.y>=FIELD.top+17);}
  for(const a of s.actors)assert(Number.isFinite(a.x)&&Number.isFinite(a.y));
});
test('sprint depletes stamina and exhaustion prevents permanent full-speed running',()=>{
  const s=start();for(let i=0;i<205;i++)s.step({...idle,x:-1,sprint:true});assert(s.stamina<10);assert(s.exhausted);
  for(let i=0;i<150;i++)s.step(idle);assert(s.stamina>=25);assert(!s.exhausted);
});
test('feint works during sprint but cannot bypass cooldown or stamina cost',()=>{
  const s=start();s.step({...idle,x:1,y:1,sprint:true,feint:true});assert(s.feintTime>0);assert(s.cooldown>3);assert(s.stamina<85);
  for(let i=0;i<20;i++)s.step({...idle,x:1,feint:true});assert(s.cooldown<3&&s.cooldown>2);assert(s.stamina>80);
});
test('scores cannot be farmed by repeating the same event or finishing twice',()=>{
  const s=run(0,42,[.3,680,450,.55]),score=s.score;
  for(let i=0;i<50;i++){s.award('drawn','Defender drawn','drawn');s.award('lane','Passing lane open','lane');s.finish('Again',true);s.step({...idle,x:1,feint:true});}
  assert.equal(s.score,score);assert.equal(s.awards.filter(a=>a.label==='Team goal').length,1);
});
test('swept ball collision catches interceptions between two frame positions',()=>{
  const s=start();const defender=s.defenders[0];defender.x=600;defender.y=250;
  Object.assign(s.ball,{x:560,y:250,vx:6000,vy:0,owner:null,flight:'pass',age:0});s.step(idle);assert.equal(s.phase,'failure');assert.match(s.reason,/Intercepted/);
});
test('out-of-play ball terminates the attack; possession tackle is a loss',()=>{
  let s=start();Object.assign(s.ball,{x:500,y:66,vx:0,vy:-300,owner:null,flight:'pass',age:0});s.step(idle);assert.match(s.reason,/out of play/);
  s=start();s.ball.age=2;s.defenders[0].x=s.carrier.x+28;s.defenders[0].y=s.carrier.y+4;s.step(idle);assert.match(s.reason,/Tackled/);
});
test('No.10 never receives the ball; open lane evaluation considers actual defenders',()=>{
  const s=start();Object.assign(s.ball,{x:s.player.x-30,y:s.player.y,vx:430,vy:0,owner:null,flight:'pass',age:0});for(let i=0;i<5;i++)s.step(idle);assert.notEqual(s.ball.owner,10);
  assert.equal(laneClearance({x:100,y:100},{x:300,y:100},[{x:200,y:100}]),0);
  assert(laneClearance({x:100,y:100},{x:300,y:100},[{x:200,y:160}])>50);
});
test('final victory can complete campaign, and fresh instances reset every mutable state',()=>{
  const win=run(2,42,[.3,680,450,.55]);win.complete();assert.equal(win.phase,'complete');
  const fresh=new DecoySimulation(2,42);assert.equal(fresh.phase,'ready');assert.equal(fresh.score,0);assert.equal(fresh.events.length,0);assert.equal(fresh.cooldown,0);assert.equal(fresh.stamina,100);assert.equal(fresh.ball.owner,8);
});
test('fixed timestep produces same result with 30, 60 and 144Hz render schedules',()=>{
  function schedule(hz){const s=new DecoySimulation();s.start();let acc=0;for(let f=0;f<hz*7;f++){acc+=1/hz;while(acc>=TUNE.step-1e-10){const t=s.elapsed,target=t<.3?{x:700,y:300}:{x:680,y:450};s.step({x:target.x-s.player.x,y:target.y-s.player.y,sprint:true,feint:t>.55&&t<.567});acc-=TUNE.step;}}return s.snapshot();}
  assert.deepEqual(schedule(30),schedule(60));assert.deepEqual(schedule(144),schedule(60));
});
test('random practice scenarios remain bounded and always terminate',()=>{
  for(let l=0;l<3;l++)for(let seed=1;seed<=20;seed++){const s=run(l,seed,[.3,680,450,.55]);assert(['goal','failure'].includes(s.phase));for(const a of s.actors){assert(Number.isFinite(a.x)&&Number.isFinite(a.y));assert(a.x>=FIELD.left&&a.x<=FIELD.right);assert(a.y>=FIELD.top&&a.y<=FIELD.bottom);}}
});
test('runtime releases controls on focus loss and removes listeners/RAF on every unmount',()=>{
  const originals=new Map(); const install=(key,value)=>{originals.set(key,global[key]);global[key]=value;};
  const events=()=>({listeners:new Map(),addEventListener(k,f){if(!this.listeners.has(k))this.listeners.set(k,new Set());this.listeners.get(k).add(f);},removeEventListener(k,f){this.listeners.get(k)?.delete(f);},fire(k,e={}){for(const f of this.listeners.get(k)||[])f(e);}});
  let frameId=0,disconnects=0;const frames=new Map();
  const ctx=new Proxy({createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get(o,k){return k in o?o[k]:()=>{};}});
  const win=events(),doc=Object.assign(events(),{hidden:false,createElement:()=>({getContext:()=>ctx})});
  install('window',win);install('document',doc);install('matchMedia',()=>({matches:true}));install('devicePixelRatio',1);
  install('ResizeObserver',class{observe(){}disconnect(){disconnects++;}});
  install('requestAnimationFrame',f=>{frames.set(++frameId,f);return frameId;});install('cancelAnimationFrame',id=>frames.delete(id));
  try {
    const {DecoyRuntime}=load('./src/lib/decoy/runtime.ts');
    for(let attempt=0;attempt<5;attempt++) {
      const canvas=Object.assign(events(),{getContext:()=>ctx,getBoundingClientRect:()=>({width:1000}),focus(){},width:1000,height:620});ctx.canvas=canvas;
      const r=new DecoyRuntime(canvas,()=>{});r.start();
      canvas.fire('keydown',{code:'KeyD',repeat:false,preventDefault(){}});
      for(let f=0;f<240;f++){const [id,callback]=frames.entries().next().value;frames.delete(id);callback(f*1000/60);}
      assert(r.sim.player.x>560);r.touch.sprint=true;r.touch.x=1;win.fire('blur');
      assert.equal(r.sim.phase,'paused');assert.deepEqual(r.touch,idle);r.togglePause();assert.equal(r.sim.phase,'playing');
      doc.hidden=true;doc.fire('visibilitychange');assert.equal(r.sim.phase,'paused');doc.hidden=false;
      r.restart();assert.equal(r.sim.phase,'countdown');assert.equal(r.sim.score,0);r.dispose();
      assert.equal(frames.size,0);assert([...canvas.listeners.values()].every(s=>s.size===0));assert([...win.listeners.values()].every(s=>s.size===0));assert([...doc.listeners.values()].every(s=>s.size===0));
    }
    assert.equal(disconnects,5);
  } finally {for(const [key,value]of originals){if(value===undefined)delete global[key];else global[key]=value;}}
});
test('best-score storage tolerates blocked/corrupt storage and preserves the better result',()=>{
  const previous=global.localStorage;let data='invalid';global.localStorage={getItem:()=>data,setItem:(_key,value)=>{data=value;}};
  try{const {readBest,saveBest}=load('./src/lib/decoy/progress.ts');assert.deepEqual(readBest(),{});saveBest(0,800,3);saveBest(0,400,1);assert.deepEqual(readBest(),{'0':{score:800,stars:3}});data='{"0":{"score":999999,"stars":100}}';assert.deepEqual(readBest(),{});global.localStorage.getItem=()=>{throw Error('blocked');};assert.deepEqual(readBest(),{});}finally{global.localStorage=previous;}
});
