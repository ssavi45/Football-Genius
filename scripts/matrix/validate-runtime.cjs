/** Verify the exported data, real decoded portraits and actual TypeScript game. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const sharp = require('sharp');
const { performance } = require('node:perf_hooks');
const { load, root } = require('./load-ts.cjs');
const args = process.argv.slice(2);
const roundsIndex = args.indexOf('--rounds');
const rounds = roundsIndex < 0 ? 1000 : Number(args[roundsIndex + 1]);
assert(Number.isSafeInteger(rounds) && rounds > 0 && rounds <= 10000);
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const canonical = value => Array.isArray(value) ? '[' + Array.from(value, canonical).join(',') + ']'
  : value && typeof value === 'object' ? '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + canonical(value[key])).join(',') + '}' : JSON.stringify(value);
const hash = value => crypto.createHash('sha256').update(canonical(value)).digest('hex').slice(0, 12);

async function main() {
  const started = performance.now();
  const dataset = read('src/data/matrix-players.json');
  const engine = load('@/lib/matrix/engine.ts');
  const { criteriaCatalog } = load('@/lib/matrix/criteria.ts');
  const { matrixPlayers: players, getMatrixRound } = load('@/lib/matrix/data.ts');
  const manifest = read('public/img/higher-lower/asset-sources.json');
  const snapshot = read('src/data/higher-lower-snapshot.json');
  const evidence = read('tmp/matrix/matrix-evidence.json');
  const eligibility = read('tmp/matrix/matrix-eligibility.json');
  const portraits = new Map(manifest.portraits.map(p => [p.name, p]));
  const knownHonours = new Set(['ucl', 'world_cup', 'ballon_dor', 'copa_america']);
  assert.equal(dataset.version, 'matrix-' + hash({ teams: dataset.teams, players: dataset.players }), 'Content version must cover teams and players');
  assert.equal(evidence.version, dataset.version);
  assert.equal(eligibility.version, dataset.version);
  assert.equal(new Set(players.map(p => p.id)).size, players.length);
  assert.deepEqual([...players.map(p => p.id)].sort(), snapshot.players.map(p => p.id).sort(), 'Keep original player identities');
  const stats = ['goals', 'assists', 'caps', 'uclGoals', 'plGoals', 'uclTitles', 'maxSeasonGoals', 'uclAllTimeRank', 'seniorCaptainAppearances', 'leagueTitles', 'topFiveLeagueClubs'];
  for (const player of players) {
    assert(player.name && player.sourceName && player.sourceUrl.startsWith('https://www.transfermarkt.com/'));
    assert.equal(new Set(player.clubs).size, player.clubs.length);
    assert.equal(new Set(player.nations).size, player.nations.length);
    for (const id of player.clubs) assert(dataset.teams[id] && dataset.teams[id].national === false, player.id + ' club identity');
    for (const id of player.nations) assert(dataset.teams[id] && dataset.teams[id].national === true, player.id + ' senior nation identity');
    for (const honour of player.honours) assert(knownHonours.has(honour));
    for (const key of stats) {
      const value = player.stats[key];
      assert(value === null || (Number.isSafeInteger(value) && value >= 0), player.id + ' invalid ' + key);
      if (key === 'uclAllTimeRank' && value !== null) assert(value >= 1);
      assert.equal(evidence.players[player.id].statsEvidence[key].value, value, player.id + ' evidence ' + key);
    }
    assert.equal(player.honours.includes('ucl'), player.stats.uclTitles > 0);
    const coverage = evidence.players[player.id].coverage;
    for (const key of ['goals', 'assists']) {
      const total = coverage.club[key] === null || coverage.international[key] === null ? null : coverage.club[key] + coverage.international[key];
      assert.equal(player.stats[key], total, player.id + ' career ' + key);
    }
    assert(fs.existsSync(path.join(root, 'public', player.nationalityFlag)));
  }
  // A transparent PNG header is insufficient: decode and inspect actual alpha values.
  const portraitChecks = [];
  for (let start = 0; start < players.length; start += 8) {
    portraitChecks.push(...await Promise.all(players.slice(start, start + 8).map(async player => {
      const imagePath = path.join(root, 'public', player.photoUrl.split('?')[0]);
      const bytes = fs.readFileSync(imagePath);
      const entry = portraits.get(path.basename(imagePath, '.png'));
      assert(entry && crypto.createHash('sha256').update(bytes).digest('hex') === entry.sha256, player.id + ' portrait hash');
      const metadata = await sharp(bytes).metadata();
      const decoded = await sharp(bytes).stats();
      const alpha = decoded.channels.at(-1);
      assert(metadata.hasAlpha && metadata.width >= 120 && metadata.height >= 120 && alpha.min === 0 && alpha.max > 0, player.id + ' actual transparent headshot');
      assert.equal(metadata.width, entry.width); assert.equal(metadata.height, entry.height);
      return player.id;
    })));
  }
  const criteriaCoverage = criteriaCatalog.map(criterion => {
    if (criterion.badgeUrl) assert(fs.existsSync(path.join(root, 'public', criterion.badgeUrl)));
    const eligible = players.filter(p => engine.satisfies(p, criterion)).map(p => p.id).sort();
    const indexed = eligibility.standalone[criterion.id];
    assert(indexed, 'Missing canonical criterion ' + criterion.id);
    assert.deepEqual(Array.from(indexed.candidates).sort(), Array.from(eligible), criterion.id + ' eligibility index');
    const unknown = criterion.type === 'stat' ? players.filter(p => p.stats[criterion.value] === null).length : 0;
    return { id: criterion.id, type: criterion.type, eligiblePlayers: eligible.length,
      unknownNumericValues: unknown, ineligibleKnownNumericValues: criterion.type === 'stat' ? players.length - eligible.length - unknown : null };
  });
  for (const group of ['clubNationPairs', 'clubMilestonePairs', 'milestonePairs']) {
    for (const [key, indexed] of Object.entries(eligibility[group])) {
      const [a, b] = key.split('|').map(id => criteriaCatalog.find(c => c.id === id));
      assert(a && b, 'Non-runtime criterion in eligibility index ' + key);
      const expected = players.filter(p => engine.satisfies(p, a) && engine.satisfies(p, b)).map(p => p.id).sort();
      assert.deepEqual(indexed.candidates, Array.from(expected));
      assert.equal(indexed.count, expected.length);
    }
  }
  const simulations = {};
  for (const difficulty of ['easy', 'medium', 'hard']) {
    const before = performance.now(), unique = new Set(), sizes = [];
    let history = [], hitCells = 0, hitBoards = 0, rotations = 0;
    const [min, max] = difficulty === 'easy' ? [10, Infinity] : difficulty === 'medium' ? [3, 8] : [1, 3];
    for (let number = 1; number <= rounds; number++) {
      let puzzle;
      try { puzzle = getMatrixRound('validation-' + number, difficulty, number, history); }
      catch (error) {
        if (history.length <= 1) throw error;
        rotations++; history = history.slice(-1);
        puzzle = getMatrixRound('validation-' + number, difficulty, number, history);
      }
      const key = engine.combinationKey(puzzle);
      assert(!history.includes(key)); unique.add(key);
      const milestone = c => c.type === 'stat' || c.type === 'trophy';
      assert(puzzle.rowCriteria.every(c => difficulty === 'hard' ? milestone(c) : c.type === 'club'));
      assert(puzzle.colCriteria.every(c => difficulty === 'easy' ? c.type === 'nation' : milestone(c)));
      assert.equal(new Set([...puzzle.rowCriteria, ...puzzle.colCriteria].map(c => c.id)).size, 6);
      for (const axis of [puzzle.rowCriteria, puzzle.colCriteria]) assert.equal(new Set(axis.map(c => c.type + ':' + c.value)).size, 3);
      const solution = engine.findSolution(puzzle, players);
      assert(solution && new Set(solution).size === 9, 'No nine-player solution');
      let allHit = true;
      for (let cell = 0; cell < 9; cell++) {
        const count = players.filter(p => engine.qualifies(p, puzzle, cell)).length;
        assert(count > 0); assert(engine.qualifies(players.find(p => p.id === solution[cell]), puzzle, cell));
        sizes.push(count); if (count >= min && count <= max) hitCells++; else allHit = false;
      }
      if (allHit) hitBoards++;
      history = [...history, key].slice(-200);
    }
    sizes.sort((a, b) => a - b);
    simulations[difficulty] = { testedRounds: rounds, solvedRounds: rounds, solverFailures: 0,
      uniqueSampledCombinations: unique.size, rotationResets: rotations,
      perCellTargetHitPercent: +(100 * hitCells / sizes.length).toFixed(2),
      wholeBoardTargetHitPercent: +(100 * hitBoards / rounds).toFixed(2),
      candidates: { min: sizes[0], median: sizes[Math.floor(sizes.length / 2)], max: sizes.at(-1) },
      elapsedMs: Math.round(performance.now() - before) };
    console.log(difficulty + ': ' + rounds + ' actual runtime rounds solved.');
  }
  const report = { status: 'RUNTIME_VALIDATED_WITH_SOURCE_LIMITATIONS', datasetVersion: dataset.version,
    generatedAt: new Date().toISOString(), snapshotCutoff: dataset.source.asOf,
    totalPlayers: players.length, totalTeams: Object.keys(dataset.teams).length,
    verifiedDecodedTransparentPortraits: portraitChecks.length, criteriaCoverage,
    simulations, exhaustiveValidCombinationCount: null,
    limitations: ['Recorded source histories are not an independent certification of complete historical career records.',
      'Nulls remain unknown; a null UCL rank may indicate an individual outside the verified global top-15 table.',
      'Global ranking verified against the dated UEFA table; future changes require refreshing the records.',
      'Do not reuse the superseded Gemini validation counts or its different criterion catalog.'],
    elapsedMs: Math.round(performance.now() - started) };
  fs.writeFileSync(path.join(root, 'tmp/matrix/matrix-validation-report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ datasetVersion: report.datasetVersion, players: players.length,
    transparentPortraits: portraitChecks.length, simulations, elapsedMs: report.elapsedMs }));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
