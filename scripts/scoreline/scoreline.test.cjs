const fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const {database,createRound,transition,roundView,potential,matchesById}=require('../../src/lib/scoreline/engine.ts');
const {sign,verify}=require('../../src/lib/scoreline/session.ts');
function rng(seed){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
function round(seed=1){return createRound('test-round',[],rng(seed));}

test('200 unique real fixtures; 100 club / 100 international; 40 classics / 160 modern',()=>{
 assert.equal(database.matches.length,200);assert.equal(new Set(database.matches.map(m=>m.id)).size,200);
 assert.equal(database.matches.filter(m=>m.kind==='club').length,100);assert.equal(database.matches.filter(m=>m.kind==='international').length,100);
 assert.equal(database.matches.filter(m=>m.date<'2000-01-01').length,40);
 assert.equal(Object.keys(database.competitions).length,9);
 for(const m of database.matches){assert.ok(database.teams[m.homeTeam]);assert.ok(database.teams[m.awayTeam]);assert.equal(m.hints.length,3);assert.ok(m.sources.every(s=>s.startsWith('https://')));assert.ok(Number.isInteger(m.score.home)&&Number.isInteger(m.score.away));}
});
test('every emblem and every competition banner is a real local file',()=>{
 for(const t of Object.values(database.teams))assert.ok(fs.existsSync(path.join(__dirname,'../../public',t.emblem)),t.emblem);
 const banners=Object.values(database.competitions).map(c=>c.banner);assert.equal(new Set(banners).size,9);
 for(const banner of banners)assert.ok(fs.existsSync(path.join(__dirname,'../../public',banner)),banner);
});
test('hints never contain a scoreline and leave multiple possible score allocations',()=>{
 for(const m of database.matches){
  for(const hint of m.hints)assert.ok(!/\b\d{1,2}\s*[-–:]\s*\d{1,2}\b/.test(hint),m.id+': '+hint);
  const e=m.scorerEvidence,c=m.finalHintConstraint;let candidates=0;
  for(let h=0;h<=99;h++)for(let a=0;a<=99;a++){
   if((e.team===m.homeTeam?h:a)<e.minimumGoals)continue;
   if(c.type==='total'&&h+a!==c.value)continue;
   if(c.type==='draw'&&h!==a)continue;
   if(c.type==='winner'&&(c.team===m.homeTeam?h<=a:a<=h))continue;
   candidates++;
  }
  assert.ok(candidates>=2,m.id+' reveals the exact score through hint constraints');
  assert.ok((e.team===m.homeTeam?m.score.home:m.score.away)>=e.minimumGoals,m.id+' invalid scorer evidence');
 }
});
test('500 sampled rounds have no duplicates and maintain era, category and competition variety',()=>{
 for(let seed=1;seed<=500;seed++){
  const r=round(seed),ms=r.matchIds.map(id=>matchesById.get(id));
  assert.equal(new Set(r.matchIds).size,10);
  for(const kind of ['club','international']){assert.equal(ms.filter(m=>m.kind===kind).length,5);assert.equal(ms.filter(m=>m.kind===kind&&m.era==='classic').length,1);}
  assert.ok(ms.some(m=>m.kind==='club'&&!['ucl','europa'].includes(m.competition)));
  assert.ok(new Set(ms.map(m=>m.competition)).size>=5);
  assert.ok(Object.values(ms.reduce((a,m)=>(a[m.competition]=(a[m.competition]||0)+1,a),{})).every(n=>n<=3));
 }
});
test('recent fixtures are avoided when equally eligible alternatives exist',()=>{
 const a=round(19),b=createRound('second',a.matchIds,rng(19));assert.ok(b.matchIds.every(id=>!a.matchIds.includes(id)));
});
test('hint costs are additive, work independently, and cannot be charged twice',()=>{
 assert.equal(potential([]),10);assert.equal(potential([0]),9);assert.equal(potential([1]),8);assert.equal(potential([2]),6);assert.equal(potential([0,1]),7);assert.equal(potential([0,1,2]),3);
 let r=round();r=transition(r,{type:'hint',hint:0});r=transition(r,{type:'hint',hint:0});assert.equal(potential(r.hints),9);assert.deepEqual(r.hints,[0]);
 assert.throws(()=>transition(r,{type:'hint',hint:3}));
});
test('exact scores earn the remaining points, wrong scores earn zero, duplicate submissions are ignored',()=>{
 let r=round(),m=matchesById.get(r.matchIds[0]);r=transition(r,{type:'hint',hint:0});r=transition(r,{type:'hint',hint:1});r=transition(r,{type:'submit',...m.score});assert.equal(r.answers[0].points,7);
 const duplicate=transition(r,{type:'submit',...m.score});assert.equal(duplicate.answers.length,1);
 assert.throws(()=>transition(r,{type:'hint',hint:2}));
 const wrong=transition(round(),{type:'submit',home:99,away:99});assert.equal(wrong.answers[0].points,0);
 assert.throws(()=>transition(round(),{type:'submit',home:-1,away:0}));assert.throws(()=>transition(round(),{type:'submit',home:1.5,away:0}));
});
test('three skips consume three matches, score zero, and a fourth is refused',()=>{
 let r=round();for(let i=0;i<3;i++)r=transition(r,{type:'skip'});
 assert.equal(r.skips,3);assert.equal(r.index,3);assert.equal(r.answers.length,3);assert.ok(r.answers.every(a=>a.points===0&&a.skipped));assert.throws(()=>transition(r,{type:'skip'}));
});
test('a complete ten-match round scores at most 100 and produces a complete review',()=>{
 let r=round();for(let i=0;i<10;i++){const m=matchesById.get(r.matchIds[r.index]);r=transition(r,{type:'submit',...m.score});r=transition(r,{type:'next'});}
 assert.equal(r.complete,true);const v=roundView(r,'token');assert.equal(v.score,100);assert.equal(v.review.length,10);assert.equal(v.match,null);assert.ok(v.progress.every(p=>p==='correct'));assert.throws(()=>transition(r,{type:'submit',home:0,away:0}));
});
test('public responses omit future scores, scorer evidence and locked hint text',()=>{
 const r=round(),v=roundView(r,'token');assert.ok(!('score' in v.match));assert.ok(!('scorerEvidence' in v.match));assert.ok(v.match.hints.every(h=>h.text===null));assert.deepEqual(v.review,[]);
 const revealed=roundView(transition(r,{type:'hint',hint:1}),'token');assert.equal(typeof revealed.match.hints[1].text,'string');assert.equal(revealed.match.hints[0].text,null);assert.equal(revealed.potential,8);
});
test('round tokens survive serialization and reject tampering or expiry',()=>{
 const r=round();assert.deepEqual(verify(sign(r)),r);assert.throws(()=>verify(sign(r)+'x'));assert.throws(()=>verify(sign({...r,createdAt:0})));
});
