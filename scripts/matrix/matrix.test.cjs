const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('typescript');
const root=path.resolve(__dirname,'../..');
const cache=new Map();
function load(file){
  if(file.startsWith('@/'))file=path.join(root,'src',file.slice(2));
  if(!path.extname(file))file+='.ts';
  if(cache.has(file))return cache.get(file);
  if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
  const exports={};cache.set(file,exports);
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  vm.runInNewContext(code,{exports,Intl,Date,require(name){return load(name.startsWith('@/')?name:path.resolve(path.dirname(file),name));}},{filename:file});
  return exports;
}
const engine=load(path.join(root,'src/lib/matrix/engine.ts'));
const data=load(path.join(root,'src/lib/matrix/data.ts'));
const {matrixPlayers:players}=data;
const puzzle=data.getMatrixRound('test-start');
const catalog=load(path.join(root,'src/lib/matrix/criteria.ts'));
const solution=engine.findSolution(puzzle,players);

test('500 sourced players have local verified portraits and senior team evidence',()=>{
  assert.equal(players.length,500);assert.equal(new Set(players.map(p=>p.id)).size,500);
  for(const p of players){assert(fs.existsSync(path.join(root,'public',p.photoUrl.split('?')[0])));assert(p.clubs.length>0);assert(p.sourceUrl.startsWith('https://www.transfermarkt.com/'));}
  assert(players.find(p=>p.id==='messi').honours.includes('world_cup'));
  assert(!players.find(p=>p.id==='carvajal').honours.includes('world_cup'),'Old invented World Cup claim must not return');
  assert(!players.find(p=>p.id==='suarez').clubs.includes('46'),'Luis Suarez must not be confused with the Inter namesake');
  assert(!players.find(p=>p.id==='zlatan').honours.includes('ucl'));
  assert(players.find(p=>p.id==='rice').nations.length===2,'Count actual senior appearances for both countries');
});

test('edition parsing retains recent verified honours and globally scoped UCL ranks',()=>{
  const player=id=>players.find(p=>p.id===id);
  assert(player('dembele').honours.includes('ballon_dor'),'The 2025 award uses season start 2024');
  assert.equal(player('dembele').stats.uclTitles,2,'Include the 2024/25 and 2025/26 PSG titles');
  assert.equal(player('hakimi').stats.uclTitles,3);
  assert(player('yamal').honours.includes('world_cup'),'Retain the verified 2026 edition');
  assert.equal(player('messi').stats.uclAllTimeRank,2);
  assert.equal(player('kane').stats.uclAllTimeRank,8,'Ties share the global competition rank');
  assert.equal(player('salah').stats.uclAllTimeRank,11,'Do not rank only the app roster');
  for(const c of catalog.milestoneCriteria)assert(data.matrixCriteriaAvailability.find(x=>x.criterion.id===c.id).eligiblePlayers>0,c.id);
});
test('unlimited rounds follow difficulty rules with new combinations and nine distinct valid answers',()=>{
  for(const difficulty of ['easy','medium','hard']){
    const history=[];
    for(let round=1;round<=12;round++){
      const p=data.getMatrixRound(`test-${difficulty}-${round}`,difficulty,round,history);
      const solved=engine.findSolution(p,players), key=engine.combinationKey(p);
      assert(solved);assert.equal(new Set(solved).size,9);assert(!history.includes(key),'Fresh criteria sets, not only shuffled headers');
      for(let cell=0;cell<9;cell++)assert(players.some(player=>engine.qualifies(player,p,cell)),'Every cell has a valid candidate');
      solved.forEach((id,cell)=>assert(engine.qualifies(players.find(x=>x.id===id),p,cell)));
      assert.equal(p.difficulty,difficulty);assert.equal(p.number,round);assert(!('date' in p));
      assert.equal(new Set([...p.rowCriteria,...p.colCriteria].map(c=>c.id)).size,6);
      const milestone=c=>c.type==='stat'||c.type==='trophy';
      assert(p.rowCriteria.every(c=>difficulty==='hard'?milestone(c):c.type==='club'));
      assert(p.colCriteria.every(c=>difficulty==='easy'?c.type==='nation':milestone(c)));
      assert.equal(JSON.stringify(p),JSON.stringify(data.getMatrixRound(`test-${difficulty}-${round}`,difficulty,round,history)));
      history.push(key);
    }
  }
});

test('catalog includes 15 clubs, 15 nations and all ten requested milestones without invented evidence',()=>{
  const catalog=load(path.join(root,'src/lib/matrix/criteria.ts'));
  assert.equal(catalog.clubCriteria.length,15);assert.equal(catalog.nationCriteria.length,15);
  for(const c of [...catalog.clubCriteria,...catalog.nationCriteria])assert(fs.existsSync(path.join(root,'public',c.badgeUrl)));
  assert.equal(catalog.milestoneCriteria.slice(0,10).length,10);
  for(const id of ['career-goals-400','ucl-titles-3','world_cup','ballon_dor','season-goals-50','ucl-top-15','national-captain','league-titles-5','top-five-clubs-3','career-assists-200'])assert(catalog.milestoneCriteria.some(c=>c.id===id));
  for(const id of ['ucl-titles-3','season-goals-50','ucl-top-15','national-captain','league-titles-5','top-five-clubs-3'])assert(data.matrixCriteriaAvailability.find(x=>x.criterion.id===id).eligiblePlayers > 0);
  const rank=catalog.milestoneCriteria.find(c=>c.id==='ucl-top-15');const p=players[0];
  for(const value of [null,0,16,NaN,Infinity])assert(!engine.satisfies({...p,stats:{uclAllTimeRank:value}},rank));
  for(const value of [1,15])assert(engine.satisfies({...p,stats:{uclAllTimeRank:value}},rank));
});

test('matching rejects individually nonempty cells with too few distinct identities',()=>{
  assert.equal(engine.matchCandidates(Array.from({length:9},()=>['a','b','c'])),null);
  const result=engine.matchCandidates([['a','b'],['a'],...Array.from({length:7},(_,i)=>[`p${i}`])]);
  assert(result);assert.equal(new Set(result).size,9);assert.equal(result[1],'a');assert.equal(result[0],'b');
});

test('draft answers never reveal correctness, end the round or award XP',()=>{
  let state=engine.emptyState(puzzle);
  solution.forEach((id,cell)=>{state=engine.setAnswer(state,players,cell,id);});
  const view=engine.viewState(state,puzzle,players);
  assert.equal(view.filled,9);assert.equal(view.correct,null);assert.equal(view.incorrect,null);
  assert(view.results.every(r=>r===null));assert(!view.finished);assert.equal(view.xp,0);
  assert.equal(engine.shareText(puzzle,view),'');assert.equal(engine.cellReview(state,puzzle,players,0),null);
});

test('drafts allow replacing and removing answers but prevent reuse across cells',()=>{
  let state=engine.setAnswer(engine.emptyState(puzzle),players,0,solution[0]);
  assert.equal(engine.setAnswer(state,players,1,solution[0]),state);
  state=engine.setAnswer(state,players,0,solution[1]);assert.equal(state.answers[0],solution[1]);
  state=engine.setAnswer(state,players,1,solution[0]);assert.equal(state.answers[1],solution[0]);
  state=engine.setAnswer(state,players,0,null);assert.equal(state.answers[0],null);
  for(const [cell,id] of [[-1,solution[1]],[9,solution[1]],[0,'unknown'],[0,undefined]])assert.equal(engine.setAnswer(state,players,cell,id),state);
  const cleared=engine.clearAnswers(state);assert(cleared.answers.every(id=>id===null));assert(cleared.revision>state.revision);
});

test('only submitting the full grid reveals results and awards a perfect 325 XP',()=>{
  let state=engine.emptyState(puzzle);
  solution.forEach((id,cell)=>{state=engine.setAnswer(state,players,cell,id);});
  state=engine.submitGrid(state);
  const view=engine.viewState(state,puzzle,players);
  assert.equal(view.correct,9);assert.equal(view.incorrect,0);assert.equal(view.blank,0);
  assert(view.results.every(r=>r==='correct'));assert(view.finished&&view.won);assert.equal(view.xp,325);
  assert.equal(engine.submitGrid(state),state);assert.equal(engine.clearAnswers(state),state);
  assert.equal(engine.setAnswer(state,players,0,null),state);
});

test('partial grids score correct, incorrect and blank cells only after submission',()=>{
  let state=engine.setAnswer(engine.emptyState(puzzle),players,0,solution[0]);
  const wrong=players.find(p=>p.id!==solution[0]&&!engine.qualifies(p,puzzle,1));
  state=engine.setAnswer(state,players,1,wrong.id);
  state=engine.submitGrid(state);const view=engine.viewState(state,puzzle,players);
  assert.equal(view.correct,1);assert.equal(view.incorrect,1);assert.equal(view.blank,7);assert.equal(view.xp,25);
  assert.equal(view.results[0],'correct');assert.equal(view.results[1],'incorrect');assert.equal(view.results[2],'blank');
  assert.equal(engine.cellReview(state,puzzle,players,2).player,null);
});

test('an entirely blank grid may be submitted and finishes with no XP',()=>{
  const state=engine.submitGrid(engine.emptyState(puzzle));const view=engine.viewState(state,puzzle,players);
  assert(view.finished&&!view.won);assert.equal(view.xp,0);assert.equal(view.blank,9);assert.equal(view.incorrect,0);
  assert(view.results.every(r=>r==='blank'));
});

test('cell reviews distinguish row failure, column failure, both failure and both passing',()=>{
  const tiny={...puzzle,rowCriteria:Array(3).fill(catalog.clubCriteria.find(c=>c.value==='131')),colCriteria:Array(3).fill(catalog.nationCriteria.find(c=>c.value==='3375'))};
  for(const [id,expected] of [['carvajal',[false,true]],['messi',[true,false]],['ronaldo',[false,false]],['xavi',[true,true]]]){
    assert(players.some(p=>p.id===id));
    let state=engine.setAnswer(engine.emptyState(tiny),players,0,id);
    assert.equal(engine.cellReview(state,tiny,players,0),null);
    const review=engine.cellReview(engine.submitGrid(state),tiny,players,0);
    assert.equal(JSON.stringify(review.criteria.map(c=>c.matches)),JSON.stringify(expected));
    assert.equal(review.criteria[0].axis,'Row');assert.equal(review.criteria[1].axis,'Column');
    if(!expected.every(Boolean))assert(review.explanation.length>0);
  }
});

test('round saves retain drafts and submitted results and reject malformed or duplicate answers',()=>{
  const draft=engine.setAnswer(engine.emptyState(puzzle),players,0,solution[0]);
  for(const state of [draft,engine.submitGrid(draft)])assert.equal(JSON.stringify(engine.restoreState(JSON.parse(JSON.stringify(state)),puzzle,players)),JSON.stringify(state));
  for(const changed of [null,{}, {...draft,puzzleId:'other'}, {...draft,signature:'other'}, {...draft,answers:[solution[0]]}, {...draft,answers:[...Array(9).fill(solution[0])]}, {...draft,answers:['unknown',...Array(8).fill(null)]}, {...draft,submitted:'true'}, {...draft,revision:-1}, {...draft,revision:NaN}])assert.equal(engine.restoreState(changed,puzzle,players),null);
});

test('complete sessions restore their board, respect difficulty and use canonical criteria',()=>{
  const state=engine.setAnswer(engine.emptyState(puzzle),players,0,solution[0]);
  const session={puzzle,state,history:[engine.combinationKey(puzzle)]};
  const restore=(value,difficulty=puzzle.difficulty)=>engine.restoreSession(value,players,catalog.criteriaCatalog,data.matrixDatasetVersion,difficulty);
  const restored=restore(JSON.parse(JSON.stringify(session)));assert(restored);assert.equal(restored.puzzle.id,puzzle.id);assert.equal(restored.state.answers[0],solution[0]);
  assert.equal(restore(session,'easy'),null);
  assert.equal(restore({...session,puzzle:{...puzzle,signature:'old-database'}}),null);
  assert.equal(restore({...session,puzzle:{...puzzle,rowCriteria:[]}}),null);
  const tampered=JSON.parse(JSON.stringify(session));tampered.puzzle.rowCriteria[0].value='fake';
  assert.equal(restore(tampered).puzzle.rowCriteria[0].value,puzzle.rowCriteria[0].value,'Never trust saved predicates');
});

test('criteria use actual senior nations, appearance-backed clubs and known numerical thresholds',()=>{
  const p=players.find(p=>p.id==='rice');
  assert(engine.satisfies(p,{type:'nation',value:p.nations[0]}));
  assert(!engine.satisfies({...p,nations:[]},{type:'nation',value:p.nationality}));
  assert(!engine.satisfies({...p,stats:{goals:null}},{type:'stat',value:'goals',minimum:0}));
  assert(engine.satisfies({...p,stats:{goals:0}},{type:'stat',value:'goals',minimum:0}));
});
test('search handles accents and source aliases without exposing valid-answer filters',()=>{
  assert(engine.searchPlayers(players,'Kaka').some(p=>p.id==='kaka'));
  assert(engine.searchPlayers(players,'Mbappe').some(p=>p.id==='mbappe'));
  assert(engine.searchPlayers(players,'Roberto Carlos').some(p=>p.id==='roberto_carlos'));
  assert.equal(engine.searchPlayers(players,'a').length,0);
  assert.equal(engine.searchPlayers(players,'notarealfootballer').length,0);
});
test('sharing distinguishes correct, incorrect and blank without leaking player answers',()=>{
  let state=engine.setAnswer(engine.emptyState(puzzle),players,0,solution[0]);
  const wrong=players.find(p=>p.id!==solution[0]&&!engine.qualifies(p,puzzle,1));
  state=engine.setAnswer(state,players,1,wrong.id);state=engine.submitGrid(state);
  const text=engine.shareText(puzzle,engine.viewState(state,puzzle,players));
  assert(text.includes('Score: 1/9'));assert(text.includes('\u{1f7e9}\u{1f7e5}\u2b1b\n\u2b1b\u2b1b\u2b1b\n\u2b1b\u2b1b\u2b1b'));assert(text.includes('25 XP'));assert(text.includes('Round 1'));assert(!text.includes(players.find(p=>p.id===solution[0]).name));
});
