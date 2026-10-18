const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../..');
const engine = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root, 'src/lib/journeyman.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { exports: engine.exports });
const { advanceJourney, createJourneyDeck, createJourneyState, journeyCanSkip, journeySkipsLeft, journeyHiddenClubs, journeyLastClubLabel, journeyQuestionPool, journeyRevealCost, journeyRevealLimit, journeySearchOptions, normalizeGuess, potentialPoints, roundJourneyPoints, visibleClub } = engine.exports;
const collection = JSON.parse(fs.readFileSync(path.join(root, 'src/data/transfer-players.json'), 'utf8'));
const players = journeyQuestionPool(collection);
const importReport = JSON.parse(fs.readFileSync(path.join(root, 'scripts/journeyman/IMPORT_REPORT.json'), 'utf8'));
const start = () => createJourneyState(players.map((_, i) => i));
const act = (s, a) => advanceJourney(s, a, players);
const directory = JSON.parse(fs.readFileSync(path.join(root, 'src/data/journeyman-search-players.json'), 'utf8')).players;

test('autocomplete includes legends outside the question pool and keeps distinct identities separate', () => {
  assert(directory.length >= 500);
  assert(!players.some(p => normalizeGuess(p.name) === 'pele'));
  assert(journeySearchOptions('Pelé', directory).some(p => normalizeGuess(p.name) === 'pele' && !p.typed));
  const names = journeySearchOptions('Sanchez', directory).map(p => normalizeGuess(p.name));
  assert(names.includes('alexissanchez'));
  assert(names.includes('davinsonsanchez'));
});
test('suggestions never gate free text or reveal whether a name is a career question', () => {
  const text = 'My remembered footballer';
  assert(journeySearchOptions(text, directory).some(p => p.typed && p.name === text));
  assert(!journeySearchOptions('Pele', directory).some(p => p.typed));
  assert.equal(act(start(), { type: 'guess', name: text }).attempts, 1);
  assert.equal(act(start(), { type: 'guess', name: 'Pele' }).attempts, 1);
  assert(journeySearchOptions('بيليه', directory).some(p => p.typed));
  assert.equal(act(start(), { type: 'guess', name: 'بيليه' }).attempts, 1);
  const correct = journeySearchOptions(players[0].name, directory).find(p => normalizeGuess(p.name) === normalizeGuess(players[0].name));
  assert.equal(act(start(), { type: 'guess', name: correct.name }).outcome, 'correct');
});

test('300 career identities are connected; only the reviewed subset enters questions', () => {
  assert.equal(collection.length, 300);
  assert.equal(new Set(collection.map(p => p.id)).size, 300);
  assert.equal(players.length, importReport.enabledQuestions);
  assert(players.length > 20);
  const canonical = JSON.parse(fs.readFileSync(path.join(root, 'src/data/journeyman-careers.json'), 'utf8'));
  for (const p of players) {
    assert.equal(p.puzzleEligible, true);
    assert(p.clubs.length >= 3);
    assert.equal(p.status, canonical.players.find(c => c.id === p.id).status);
    assert.equal(importReport.players.find(c => c.id === p.id).enabled, true);
    for (const c of p.clubs) {
      if (c.logo) assert(fs.existsSync(path.join(root, 'public', c.logo)));
      else assert(importReport.unavailableBadges[c.clubId], `${c.clubId} needs an explicit missing-crest record`);
    }
  }
  assert(!players.some(p => p.clubs.some(c => importReport.blockedBadges[c.clubId])));
  for (const p of collection) assert(journeySearchOptions(p.name, directory).some(s => normalizeGuess(s.name) === normalizeGuess(p.name)));
});

test('every playable answer has a local portrait and national flag', () => {
  const profiles = JSON.parse(fs.readFileSync(path.join(root, 'src/data/journeyman-profiles.json'), 'utf8'));
  for (const player of players) {
    const profile = profiles[player.id];
    assert(profile?.nationality, `${player.name} needs a nationality`);
    for (const field of ['portrait', 'nationalityFlag']) {
      assert(profile[field]?.startsWith('/img/'), `${player.name} needs a local ${field}`);
      assert(fs.existsSync(path.join(root, 'public', profile[field])), `${player.name}: missing ${field}`);
    }
  }
});
test('all fifty corrected players are released; only short careers remain excluded', () => {
  assert.equal(players.length, 269);
  assert.equal(collection.filter(p => !p.puzzleEligible).length, 31);
  assert(importReport.players.filter(p => !p.enabled).every(p => p.reasons.includes('fewer-than-three-stints')));
  assert.equal(Object.keys(importReport.blockedBadges).length, 0);
  const corrections = JSON.parse(fs.readFileSync(path.join(root, 'scripts/journeyman/career-corrections.json'), 'utf8'));
  const canonical = JSON.parse(fs.readFileSync(path.join(root, 'src/data/journeyman-careers.json'), 'utf8'));
  for (const id of Object.keys(corrections.players)) {
    assert(players.some(p => p.id === id), `${id} must be playable after correction`);
    assert(canonical.players.find(p => p.id === id).clubs.every(c => c.seniorCompetitiveAppearances === null || c.seniorCompetitiveAppearances > 0));
  }
  const trail = id => Array.from(players.find(p => p.id === id).clubs, c => c.clubId);
  assert.deepEqual(trail('harry_kane'), ['leyton_orient','tottenham','millwall','tottenham','norwich','leicester','tottenham','bayern']);
  assert.deepEqual(trail('kevin_de_bruyne'), ['genk','werder_bremen','cfc','vfl_wolfsburg','mancity','napoli']);
  assert.equal(trail('luka_modric')[0], 'zrinjski_mostar');
  assert.equal(trail('nemanja_vidic')[0], 'spartak_subotica');
  assert.deepEqual(trail('kyle_walker'), ['northampton','sheffield_united','tottenham','qpr','aston_villa','tottenham','mancity','acmilan','burnley']);
  assert.deepEqual(trail('carlos_alberto').slice(0,6), ['fluminense','santos','botafogo','santos','fluminense','flamengo']);
  assert.deepEqual(trail('jairzinho'), ['botafogo','marseille','cruzeiro','portuguesa_ve','noroeste','fast_clube','nacional_am','jorge_wilstermann','nueve_de_octubre']);
  const ali = players.find(p => p.id === 'ali_daei');
  assert.equal(ali.clubs[0].clubId, 'esteghlal_ardabil');
  assert.equal(ali.clubs[0].logo, null, 'never show a fabricated or unrelated crest');
});
test('active and ongoing careers enter questions without a completion or retirement requirement', () => {
  for (const id of ['cristiano_ronaldo', 'robert_lewandowski', 'alvaro_morata', 'joao_felix']) {
    const player = players.find(p => p.id === id);
    assert(player, `${id} must be eligible despite careerComplete: false`);
    assert.equal(player.status, 'active');
    assert.equal(journeyLastClubLabel(player), 'CURRENT CLUB');
    const index = players.indexOf(player);
    assert.equal(advanceJourney(createJourneyState([index]), { type: 'guess', name: player.name }, players).outcome, 'correct');
  }
  assert(!importReport.players.some(p => p.reasons.includes('incomplete-career')));
  assert.equal(journeyLastClubLabel(players.find(p => p.id === 'toni_kroos')), 'LAST CLUB');
  assert.equal(journeyLastClubLabel({}), 'LAST CLUB');
});
test('ordered club returns survive the runtime export', () => {
  const david = players.find(p => p.id === 'david_beckham');
  assert.deepEqual(Array.from(david.clubs, c => c.clubId), ['manu', 'preston_north_end', 'manu', 'rmcf', 'la_galaxy', 'acmilan', 'la_galaxy', 'acmilan', 'la_galaxy', 'psg']);
  const toni = players.find(p => p.id === 'toni_kroos');
  assert.deepEqual(Array.from(toni.clubs, c => c.clubId), ['bayern', 'leverkusen', 'bayern', 'rmcf']);
});
test('new rounds use ten distinct eligible players and a balanced mix of trail lengths', () => {
  let seed = 49;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; };
  let previous = [];
  for (let sample = 0; sample < 200; sample++) {
    const deck = createJourneyDeck(players, random, previous);
    assert.equal(deck.length, 10);
    assert.equal(new Set(deck).size, 10);
    assert(deck.every(index => players[index].puzzleEligible && !previous.includes(index)));
    const lengths = deck.map(index => players[index].clubs.length);
    assert.equal(lengths.filter(n => n <= 5).length, 4);
    assert.equal(lengths.filter(n => n >= 6 && n <= 8).length, 4);
    assert.equal(lengths.filter(n => n >= 9).length, 2);
    previous = deck;
  }
});
test('deck creation fills sparse difficulty groups without duplicates', () => {
  const smallPool = players.slice(0, 12).map(p => ({ ...p, clubs: p.clubs.slice(0, 3) }));
  assert.equal(new Set(createJourneyDeck(smallPool, () => .4)).size, 10);
  assert.throws(() => createJourneyDeck(smallPool.slice(0, 9)), /ten eligible/);
});
test('only bookends and explicitly revealed positions are visible until the answer', () => {
  const total = 6;
  assert.deepEqual(Array.from({ length: total }, (_, i) => visibleClub(i, total, [], 'playing')), [true, false, false, false, false, true]);
  assert.deepEqual(Array.from({ length: total }, (_, i) => visibleClub(i, total, [{index:4,method:'random'}], 'playing')), [true, false, false, false, true, true]);
  assert(Array.from({ length: total }, (_, i) => visibleClub(i, total, [], 'incorrect')).every(Boolean));
});
const fixture = total => [{...players[0], clubs:Array.from({length:total}, (_,i)=>({label:`Club ${i}`,logo:null}))}];
const log = (count, method) => Array.from({length:count},(_,i)=>({index:i+1,method}));
test('equal proportions of hidden clubs cost the same across trail lengths', () => {
  assert.equal(potentialPoints(6, log(1,'random')),8);
  assert.equal(potentialPoints(10,log(2,'random')),8);
  assert.equal(potentialPoints(6,log(1,'next')),7.5);
  assert.equal(potentialPoints(10,log(2,'next')),7.5);
  assert.equal(potentialPoints(6,[]),10);
  for(let hidden=1;hidden<=9;hidden++) for(const method of ['random','next']) assert.equal(potentialPoints(hidden+2,log(hidden,method)),2);
});
test('random picks only unrevealed interiors; sequential reveals fill the earliest gap', () => {
  const pool=fixture(6);
  let s=createJourneyState([0]);
  s=advanceJourney(s,{type:'reveal',method:'random'},pool,()=>.9999);
  assert.equal(s.reveals[0].index,4);
  s=advanceJourney(s,{type:'reveal',method:'next'},pool,()=>{throw Error('Next must not roll randomness');});
  assert.equal(s.reveals[1].index,1);
  s=advanceJourney(s,{type:'reveal',method:'random'},pool,()=>.9999);
  assert.equal(s.reveals[2].index,3);
  assert.equal(journeyRevealCost(6,s.reveals,'next'),journeyRevealCost(6,s.reveals,'random'));
  s=advanceJourney(s,{type:'reveal',method:'random'},pool,()=>{throw Error('Final club has no random choice');});
  assert.equal(s.reveals[3].index,2);
  assert.equal(s.reveals[3].method,'final');
  assert.equal(new Set(s.reveals.map(r=>r.index)).size,4);
  assert.equal(potentialPoints(6,s.reveals),2);
});
test('reveal limits respect both nine-club cap and number of hidden clubs', () => {
  for(const total of [3,4,6,11,14,20]) {
    const pool=fixture(total);
    let s=createJourneyState([0]);
    for(let i=0;i<15;i++)s=advanceJourney(s,{type:'reveal',method:'random'},pool,()=>.95);
    assert.equal(s.reveals.length,Math.min(9,total-2));
    assert.equal(journeyRevealLimit(total),s.reveals.length);
    assert(s.reveals.every(r=>r.index>0&&r.index<total-1));
    assert.equal(new Set(s.reveals.map(r=>r.index)).size,s.reveals.length);
    assert.equal(journeyHiddenClubs(total,s.reveals).length,total-2-s.reveals.length);
    assert.equal(advanceJourney(s,{type:'reveal',method:'random'},pool,()=>{throw Error('Exhausted reveals must not roll');}),s);
    assert.equal(journeyRevealCost(total,s.reveals,'next'),0);
  }
});
test('three-club trails offer one final reveal for eight points with no random discount', () => {
  const s=createJourneyState([0]);
  assert.equal(journeyRevealCost(3,[],'next'),8);
  assert.equal(journeyRevealCost(3,[],'random'),8);
  for(const method of ['next','random']) {
    const next=advanceJourney(s,{type:'reveal',method},fixture(3));
    assert.equal(next.reveals.length,1);
    assert.equal(next.reveals[0].method,'final');
    assert.equal(potentialPoints(3,next.reveals),2);
  }
});
test('price previews match displayed score changes and mixed reveals never increase potential', () => {
  for(let hidden=1;hidden<=24;hidden++) {
    const total=hidden+2,pool=fixture(total);
    let s=createJourneyState([0]);
    for(let i=0;i<Math.min(9,hidden);i++) {
      assert(journeyRevealCost(total,s.reveals,'next')>=journeyRevealCost(total,s.reveals,'random'));
      const before=potentialPoints(total,s.reveals);
      const method=i%2?'next':'random';
      const quoted=journeyRevealCost(total,s.reveals,method);
      assert(Number.isInteger(quoted*2), 'cost must use half-point steps');
      assert(quoted>=0.5, 'a paid reveal must never become free');
      const next=advanceJourney(s,{type:'reveal',method},pool,()=>.73);
      const after=potentialPoints(total,next.reveals);
      assert(after<=before&&after>=2);
      assert.equal(quoted,roundJourneyPoints(roundJourneyPoints(before)-roundJourneyPoints(after)));
      s=next;
    }
  }
});
test('award half-point scores, preserve clue counts in results, and clear them on next question', () => {
  const pool=fixture(5);
  let s=advanceJourney(createJourneyState([0,0]),{type:'reveal',method:'next'},pool);
  assert.equal(potentialPoints(5,s.reveals),6.5);
  s=advanceJourney(s,{type:'guess',name:pool[0].name},pool);
  s=advanceJourney(s,{type:'next'},pool);
  assert.equal(s.results[0].points,6.5);
  assert.equal(s.results[0].reveals,1);
  assert.equal(s.results[0].nextReveals,1);
  assert.equal(s.reveals.length,0);
  assert.equal(potentialPoints(5,s.reveals),10);
});
test('aliases, accents, case and punctuation are accepted; blank guesses do not consume attempts', () => {
  assert.equal(normalizeGuess('  ÁNGEL Di María! '), 'angeldimaria');
  let s = createJourneyState([0]);
  const sample = [collection.find(p => p.id === 'cristiano_ronaldo')];
  assert.equal(act(s, { type: 'guess', name: '   ' }), s);
  s = advanceJourney(s, { type: 'guess', name: 'cristiano' }, sample);
  assert.equal(s.outcome, 'correct');
  assert.equal(advanceJourney(s, { type: 'guess', name: 'Ronaldo' }, sample), s);
  assert.equal(advanceJourney(s, { type: 'reveal', method:'random' }, sample), s);
});
test('wrong guesses consume the two attempts without awarding points', () => {
  let s = act(start(), { type: 'guess', name: 'Wrong player' });
  assert.equal(s.outcome, 'playing');
  assert.equal(s.attempts, 1);
  s = act(s, { type: 'guess', name: 'Still wrong' });
  assert.equal(s.outcome, 'incorrect');
  s = act(s, { type: 'next' });
  assert.equal(s.results[0].points, 0);
  assert.equal(s.attempts, 0);
  assert.equal(s.question, 1);
});
test('three replacements still require ten answered questions and preserve the full score ceiling', () => {
  let s = start();
  for (let i = 0; i < 10; i++) {
    if ([2,4,9].includes(i)) {
      s=act(s,{type:'skip'});
      assert.equal(s.question,i);
      assert.equal(s.results.length,i);
      assert.equal(s.complete,false, 'a replacement on the last question must not complete the round');
    }
    if (i === 0) s = act(s, { type: 'reveal', method:'next' });
    s = act(s, { type: 'guess', name: players[s.deck[s.question]].name });
    s = act(s, { type: 'next' });
  }
  assert.equal(s.complete, true);
  assert.equal(s.results.length, 10);
  assert(s.results.every(r=>r.outcome==='correct'));
  assert.equal(s.results.reduce((sum, r) => sum + r.points, 0), 97.5);
  assert.equal(journeySkipsLeft(s),0);
  assert.equal(act(s, { type: 'next' }), s);
  assert.equal(act(s, { type: 'skip' }), s);
  assert.equal(start().results.length, 0);
  assert.equal(journeySkipsLeft(start()),3);
});

test('skip replaces the current question at most three times without consuming a result', () => {
  let s=start();
  const originalDeck=Array.from(s.deck);
  const seen=new Set(s.deck);
  const band=n=>n<=5?0:n<=8?1:2;
  assert.equal(journeySkipsLeft(s),3);
  for(let i=0;i<3;i++) {
    assert(journeyCanSkip(s));
    const current=s.deck[s.question];
    s=advanceJourney(s,{type:'skip'},players,()=>.57);
    assert.equal(journeySkipsLeft(s),2-i);
    assert.equal(s.question,0);
    assert.equal(s.results.length,0);
    assert.equal(s.attempts,0);
    assert.equal(s.outcome,'playing');
    assert.equal(s.skippedPlayers[i],current);
    assert(!seen.has(s.deck[0]), 'replacement must exclude the original deck and every discarded player');
    assert.deepEqual(Array.from(s.deck.slice(1)),originalDeck.slice(1), 'upcoming questions stay unchanged');
    assert.equal(band(players[current].clubs.length),band(players[s.deck[0]].clubs.length));
    seen.add(s.deck[0]);
  }
  assert.equal(journeyCanSkip(s),false);
  assert.equal(act(s,{type:'skip'}),s);
  assert.equal(act(s,{type:'next'}),s);
  s=act(s,{type:'guess',name:'Wrong player'});
  s=act(s,{type:'guess',name:'Still wrong'});
  s=act(s,{type:'next'});
  assert.equal(s.question,1, 'normal advancement must still work without skips');
  assert.equal(s.results[0].outcome,'incorrect');
  assert.equal(journeySkipsLeft(s),0);
});

test('every paid reveal locks skipping, but answered questions can always advance', () => {
  for(const total of [3,6,14]) for(const method of ['random','next']) {
    const pool=fixture(total);
    let s=advanceJourney(createJourneyState([0,0]),{type:'reveal',method},pool);
    assert.equal(journeyCanSkip(s),false);
    assert.equal(journeySkipsLeft(s),3);
    assert.equal(advanceJourney(s,{type:'skip'},pool),s);
    assert.equal(advanceJourney(s,{type:'next'},pool),s);
    s=advanceJourney(s,{type:'guess',name:pool[0].name},pool);
    assert.equal(advanceJourney(s,{type:'skip'},pool),s, 'answered questions cannot be replaced');
    s=advanceJourney(s,{type:'next'},pool);
    assert.equal(s.question,1);
    assert.equal(s.results[0].outcome,'correct');
    assert.equal(journeySkipsLeft(s),3);
    assert(journeyCanSkip(s));
  }
  let s=act(start(),{type:'guess',name:'Wrong player'});
  assert(journeyCanSkip(s), 'a wrong guess without a reveal does not lock skipping');
  s=act(s,{type:'skip'});
  assert.equal(journeySkipsLeft(s),2);
  assert.equal(s.attempts,0);
  assert.equal(s.results.length,0);
});

test('skip falls back to another trail length when needed, but never reuses a reserved player', () => {
  const pool=[...fixture(3),...fixture(9)].map((p,i)=>({...p,name:`Player ${i}`}));
  let s=createJourneyState([0]);
  s=advanceJourney(s,{type:'skip'},pool,()=>.5);
  assert.equal(s.deck[0],1);
  assert.equal(s.question,0);
  assert.equal(s.results.length,0);
  assert.equal(journeySkipsLeft(s),2);
  assert.equal(advanceJourney(s,{type:'skip'},pool,()=>{throw Error('no replacement must not roll randomness');}),s);
});
