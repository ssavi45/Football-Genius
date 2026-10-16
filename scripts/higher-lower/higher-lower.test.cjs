const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createHash } = require('node:crypto');
const ts = require('typescript');
const root = path.resolve(__dirname, '../..');
const snapshot = JSON.parse(fs.readFileSync(path.join(root, 'src/data/higher-lower-snapshot.json'), 'utf8'));

function loadTs(filename, globals = {}) {
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file);
    if (file.endsWith('.json')) return JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!path.extname(file)) file += '.ts';
    const exports = {};
    cache.set(file, exports);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    vm.runInNewContext(code, {
      exports, console: { warn() {} }, process: { env: {} }, AbortSignal,
      require(name) {
        if (name === 'server-only') return {};
        return load(name.startsWith('@/') ? path.join(root, 'src', name.slice(2)) : path.resolve(path.dirname(file), name));
      }, ...globals,
    }, { filename: file });
    return exports;
  }
  return load(path.join(root, filename));
}

const rules = loadTs('src/lib/higher-lower.ts');
const { isHigherLowerSnapshot } = loadTs('src/lib/higher-lower/validation.ts');

test('seed is exactly 100 distinct sourced identities with active and retired players', () => {
  assert(isHigherLowerSnapshot(snapshot));
  assert.equal(new Set(snapshot.players.map(p => p.transfermarktId)).size, 100);
  assert(snapshot.players.some(p => p.isRetired));
  assert(snapshot.players.some(p => !p.isRetired));
  const original = JSON.parse(fs.readFileSync(path.join(root, 'src/data/players.json'), 'utf8'));
  const aliases = { vandijk: 'van_dijk', bernardo: 'silva', joaoneves: 'joao_neves' };
  const ids = new Set(snapshot.players.map(p => p.id));
  for (const player of original) {
    const id = player.id.replace(/\d+$/, '');
    assert(ids.has(aliases[id] || id), `Original player missing: ${player.name}`);
  }
  for (const player of rules.playersFromSnapshot(snapshot)) {
    for (const asset of [player.image, player.portrait, player.nationalityFlag, player.clubBadge].filter(Boolean)) {
      if (asset.startsWith('/')) assert(fs.existsSync(path.join(root, 'public', asset.split('?')[0])), asset);
    }
  }
});

test('unknown values are excluded per category, while known zeros remain playable', () => {
  const players = rules.playersFromSnapshot(snapshot);
  for (const category of ['goals', 'assists', 'marketValue', 'transfer']) {
    const pool = rules.comparisonPool(category, players);
    assert(pool.length >= 20);
    assert(pool.every(p => category === 'transfer' ? p.transfers.length > 0 : p.stats[category] !== null));
  }
  assert(rules.comparisonPool('goals', players).some(p => p.stats.goals === 0));
  assert(rules.comparisonPool('transfer', players).some(p => p.transfers.some(t => t.fee === 0)));
  assert(!rules.comparisonPool('assists', players).some(p => p.id === 'cafu'));
});

test('career comparisons include senior club and international goals/assists', () => {
  assert.equal(snapshot.schemaVersion, 3);
  assert.equal(rules.comparisonLabels.goals.label, 'Career Goals');
  assert.equal(rules.comparisonLabels.assists.label, 'Career Assists');
  for (const player of snapshot.players) {
    const { club, international } = player.coverage;
    assert.equal(player.coverage.scope, 'recorded-senior-career-matches');
    assert(international.appearances > 0, `${player.name}: senior international history missing`);
    assert.equal(player.coverage.appearances, club.appearances + international.appearances);
    for (const [key, missing] of [['goals', 'missingGoals'], ['assists', 'missingAssists']]) {
      assert.equal(player.stats[key], club[missing] + international[missing] > 0 ? null : club[key] + international[key]);
    }
  }
  const messi = snapshot.players.find(p => p.id === 'messi');
  assert(messi.coverage.international.goals > 100);
  assert(messi.stats.goals > messi.coverage.club.goals);
  assert(messi.stats.assists > messi.coverage.club.assists);
});

test('all 100 players have distinct transparent headshots with one presentation and no match-photo fallback', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'public/img/higher-lower/asset-sources.json'), 'utf8'));
  assert.equal(manifest.portraits.length, 100);
  assert.equal(new Set(manifest.portraits.map(p => p.id)).size, 100);
  const players = rules.playersFromSnapshot(snapshot);
  assert.equal(players.length, 100);
  const hashes = new Set();
  for (const player of players) {
    assert.equal(player.cutout, true);
    assert(player.portrait.startsWith('/img/higher-lower/players/'));
    const portraitPath = player.portrait.split('?')[0];
    const name = path.basename(portraitPath, '.png');
    const source = manifest.portraits.find(p => p.name === name);
    assert.equal(source.alpha, true);
    assert(source.width >= 120 && source.height >= 120);
    assert(source.url.startsWith('https://'));
    assert.equal(player.portrait.split('?')[1], `v=${source.sha256.slice(0,12)}`, 'Replaced portraits must invalidate browser caches');
    const bytes = fs.readFileSync(path.join(root, 'public', portraitPath));
    assert(bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])));
    assert.equal(bytes.readUInt32BE(16), source.width);
    assert.equal(bytes.readUInt32BE(20), source.height);
    let transparent = [4, 6].includes(bytes[25]);
    for (let offset=8; offset+12<=bytes.length;) {
      if (bytes.toString('ascii',offset+4,offset+8) === 'tRNS') transparent = true;
      offset += bytes.readUInt32BE(offset) + 12;
    }
    assert(transparent, `${player.name}: an opaque photo cannot replace a headshot`);
    const digest = createHash('sha256').update(bytes).digest('hex');
    assert.equal(digest, source.sha256, `${player.name}: reviewed portrait was replaced`);
    hashes.add(digest);
  }
  assert.equal(hashes.size, 100, 'Different players must not share a wrongly mapped portrait');
  assert.equal(manifest.portraits.find(p => p.name === 'lampard').id, 5471);
  assert.equal(manifest.portraits.find(p => p.name === 'casillas').id, 5479);
  const robertoCarlos = manifest.portraits.find(p => p.name === 'roberto_carlos');
  assert.equal(robertoCarlos.id, 238430, '1041 is Javier Zanetti, not Roberto Carlos');
  assert.equal(robertoCarlos.identitySourceName, 'Roberto Carlos');
  assert(robertoCarlos.url.endsWith('/238430.png'));
  const uncurated = structuredClone(snapshot);
  uncurated.players[0].id = 'not_curated';
  assert(!rules.playersFromSnapshot(uncurated).some(p => p.id === 'not_curated'));
});

test('market value includes only active players with their current valuation', () => {
  const players = rules.playersFromSnapshot(snapshot);
  const pool = rules.comparisonPool('marketValue', players);
  assert(pool.length >= 20 && pool.length < 100);
  for (const player of pool) {
    assert.equal(player.isRetired, false);
    assert(player.stats.marketValue > 0);
    assert.equal(rules.comparisonValue(player, 'marketValue'), player.stats.marketValue);
  }
  const active = pool[0];
  assert.equal(rules.comparisonPool('marketValue', [{ ...active, isRetired: true }]).length, 0);
  assert.equal(rules.comparisonPool('marketValue', [{ ...active, stats: { ...active.stats, marketValue: null } }]).length, 0);
  assert.equal(rules.comparisonPool('marketValue', [{ ...active, stats: { ...active.stats, marketValue: 0 } }]).length, 0);
});

test('a transfer question selects one actual move, including non-peak moves, and keeps it on the surviving card', () => {
  const players = rules.playersFromSnapshot(snapshot);
  const ronaldo = players.find(p => p.id === 'ronaldo');
  const neymar = players.find(p => p.id === 'neymar');
  assert(neymar.transfers.some(t => t.from.id === '131' && t.to.id === '583' && t.fee === 222_000_000));
  assert(ronaldo.transfers.some(t => t.from.id === '985' && t.to.id === '418' && t.fee === 94_000_000));
  assert(ronaldo.transfers.some(t => t.from.id === '418' && t.to.id === '506' && t.fee === 117_000_000));
  const seen = new Set();
  for (let index = 0; index < ronaldo.transfers.length; index++) {
    let calls = 0;
    const card = rules.chooseComparisonPlayer('transfer', [ronaldo], [], () => calls++ === 0 ? 0 : (index + .1) / ronaldo.transfers.length);
    const before = card.selectedTransfer;
    assert.equal(rules.comparisonValue(card, 'transfer'), ronaldo.transfers[index].fee);
    seen.add(before.id);
    const replacement = rules.chooseComparisonPlayer('transfer', players, [card.id], () => 0);
    assert.notEqual(replacement.id, card.id);
    assert.equal(card.selectedTransfer, before);
    for (const club of [before.from, before.to]) assert(fs.existsSync(path.join(root, 'public', club.crest)));
  }
  assert.equal(seen.size, ronaldo.transfers.length);
  assert.equal(rules.comparisonValue(ronaldo, 'transfer'), null, 'Never fall back to a maximum fee');
  assert(rules.comparisonPool('transfer', players).some(p => p.isRetired));
  for (const player of players) for (const move of player.transfers) for (const club of [move.from, move.to]) {
    assert(club.crest.startsWith('/img/'), 'Seed transfer crests are cached locally');
    assert(fs.existsSync(path.join(root, 'public', club.crest)), club.crest);
  }
});

test('euros are stored in whole euros and formatted without changing comparison precision', () => {
  assert.equal(rules.formatComparison(1_500_000, 'marketValue'), '€1.5M');
  assert.equal(rules.formatComparison(950_000, 'transfer'), '€950K');
  assert.equal(rules.formatComparison(0, 'transfer'), '€0');
  assert.equal(rules.formatComparison(1234, 'assists'), '1,234');
  assert.equal(rules.formatComparison(null, 'goals'), 'Unavailable');
  assert(rules.isCorrectComparison(5, 5, 'higher'));
  assert(rules.isCorrectComparison(5, 5, 'lower'));
  assert(!rules.isCorrectComparison(1_004_000, 1_003_000, 'higher'));
});

test('first-match higher picks and ties are scored correctly on either side', () => {
  for (const [left, right, pick, correct, survivor, replace] of [
    [20, 10, 'left', true, 'left', 'right'],
    [10, 20, 'right', true, 'right', 'left'],
    [20, 10, 'right', false, 'left', 'right'],
    [10, 20, 'left', false, 'right', 'left'],
    [10, 10, 'left', true, 'left', 'right'],
    [10, 10, 'right', true, 'right', 'left'],
    [0, 0, 'right', true, 'right', 'left'],
  ]) {
    const result = rules.resolveComparisonPick(left, right, pick);
    assert.equal(result.correct, correct);
    assert.equal(result.survivor, survivor);
    assert.equal(result.replace, replace);
  }
});

test('a card retires after its second matchup even when it wins, preserving correct-pick scoring', () => {
  // Rice beats Rashford on the opening pick and stays on the left.
  const opening = rules.resolveComparisonPick(100, 50, 'left');
  assert.equal(opening.correct, true);
  assert.equal(opening.survivor, 'left');
  assert.equal(opening.roundsPlayed.left, 1);
  assert.equal(opening.roundsPlayed.right, 0);
  // Rice beats the new Martinelli card, but has now played twice and must leave.
  const second = rules.resolveComparisonPick(100, 65, 'left', opening.roundsPlayed);
  assert.equal(second.correct, true);
  assert.equal(second.winner, 'left');
  assert.equal(second.survivor, 'right');
  assert.equal(second.replace, 'left');
  assert.equal(second.roundsPlayed.right, 1);
  assert.equal(second.roundsPlayed.left, 0);
  // The same cap applies on the opposite side, even for equal values.
  const mirrored = rules.resolveComparisonPick(30, 100, 'right', { left: 0, right: 1 });
  assert.equal(mirrored.correct, true);
  assert.equal(mirrored.survivor, 'left');
  for (const pick of ['left', 'right']) {
    const tied = rules.resolveComparisonPick(50, 50, pick, { left: 1, right: 0 });
    assert.equal(tied.correct, true);
    assert.equal(tied.survivor, 'right');
  }
  const wrong = rules.resolveComparisonPick(100, 65, 'right', opening.roundsPlayed);
  assert.equal(wrong.correct, false, 'Retaining the lower card must never make a lower guess correct');
});

test('no card can appear in three consecutive matchups throughout a long run', () => {
  let roundsPlayed = { left: 0, right: 0 };
  const cards = { left: 'opening-left', right: 'opening-right' };
  const appearances = new Map();
  for (let round = 0; round < 100; round++) {
    for (const id of Object.values(cards)) {
      appearances.set(id, (appearances.get(id) || 0) + 1);
      assert(appearances.get(id) <= 2, `${id} stayed longer than two matchups`);
    }
    const left = round % 3 === 0 ? 50 : 100;
    const right = round % 3 === 2 ? 100 : 50;
    const pick = left >= right ? 'left' : 'right';
    const result = rules.resolveComparisonPick(left, right, pick, roundsPlayed);
    assert.equal(result.correct, true);
    const retained = cards[result.survivor];
    cards[result.replace] = `new-${round}`;
    assert.equal(cards[result.survivor], retained);
    roundsPlayed = result.roundsPlayed;
  }
});

test('partial, duplicate, malformed and negative publications are rejected', () => {
  for (const mutate of [
    s => s.players.pop(),
    s => { s.players[1].transfermarktId = s.players[0].transfermarktId; },
    s => { s.players[0].stats.assists = -1; },
    s => { s.players[0].stats.goals = undefined; },
    s => { s.players[0].stats.marketValue = 1.5; },
    s => { s.createdAt = 'invalid'; },
    s => { s.schemaVersion = 1; },
    s => { s.schemaVersion = 2; },
    s => { s.players[0].coverage.scope = 'recorded-senior-club-matches'; },
    s => { s.players[0].coverage.international = undefined; },
    s => { s.players[0].coverage.international.appearances = -1; },
    s => { s.players[0].coverage.international.goals += 1; },
    s => { s.players[0].coverage.club.missingAssists += 1; },
    s => { const p = s.players.find(p => p.id === 'messi'); p.stats.goals = p.coverage.club.goals; },
    s => { s.players.find(p => p.isRetired).stats.marketValue = 10_000_000; },
    s => { s.players.find(p => p.transfers.length).transfers[0].fee = -1; },
    s => { s.players.find(p => p.transfers.length).transfers[0].from.crest = null; },
    s => { const p = s.players.find(p => p.transfers.length); p.transfers.push(p.transfers[0]); },
    s => { s.players.find(p => p.transfers.length).transfers[0].date = '2099-01-01'; },
  ]) {
    const changed = structuredClone(snapshot);
    mutate(changed);
    assert(!isHigherLowerSnapshot(changed));
  }
});

test('server uses the bundled snapshot without contacting an unconfigured backend', async () => {
  const store = loadTs('src/lib/higher-lower/snapshot-store.ts', { fetch() { throw new Error('Unexpected network request'); } });
  assert.equal((await store.getHigherLowerSnapshot()).version, snapshot.version);
});

test('server retains its last valid dataset across outages, corrupt publications and older versions', async () => {
  let now = Date.now();
  let fail = false;
  let candidate = structuredClone(snapshot);
  candidate.version += '-new';
  candidate.createdAt = new Date(Date.parse(snapshot.createdAt) + 60_000).toISOString();
  const expected = candidate.version;
  class Clock extends Date { static now() { return now; } }
  const store = loadTs('src/lib/higher-lower/snapshot-store.ts', {
    Date: Clock,
    process: { env: { HIGHER_LOWER_USE_SUPABASE: 'true', SUPABASE_URL: 'https://example.invalid', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test' } },
    fetch: async () => {
      if (fail) throw new Error('Offline');
      return { ok: true, json: async () => [{ snapshot: { payload: structuredClone(candidate) } }] };
    },
  });
  assert.equal((await store.getHigherLowerSnapshot()).version, expected);
  fail = true; now += 61_000;
  assert.equal((await store.getHigherLowerSnapshot()).version, expected);
  fail = false; candidate.players.pop(); now += 61_000;
  assert.equal((await store.getHigherLowerSnapshot()).version, expected);
  candidate = structuredClone(snapshot); now += 61_000;
  assert.equal((await store.getHigherLowerSnapshot()).version, expected);
});

test('optional leaderboard stays empty without backend configuration or when fetching fails', async () => {
  const unconfigured = loadTs('src/lib/higher-lower/leaderboard-store.ts', { fetch() { throw new Error('Must not contact an unconfigured backend'); } });
  assert.equal((await unconfigured.getHigherLowerLeaderboard()).length, 0);
  for (const fetch of [
    async () => { throw new TypeError('Failed to fetch'); },
    async () => ({ ok: false, status: 503 }),
    async () => ({ ok: true, json: async () => { throw new SyntaxError('Invalid JSON'); } }),
    async () => ({ ok: true, json: async () => ({ message: 'Backend error' }) }),
  ]) {
    const store = loadTs('src/lib/higher-lower/leaderboard-store.ts', {
      process: { env: { SUPABASE_URL: 'https://example.invalid', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-public-key' } }, fetch,
    });
    assert.equal((await store.getHigherLowerLeaderboard()).length, 0);
  }
});

test('leaderboard shares concurrent reads, caches public results, and retains them during outages', async () => {
  let now = Date.now(), calls = 0, response = 'valid';
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  class Clock extends Date { static now() { return now; } }
  const store = loadTs('src/lib/higher-lower/leaderboard-store.ts', {
    Date: Clock,
    process: { env: { SUPABASE_URL: 'https://example.invalid', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-public-key' } },
    fetch: async (url, options) => {
      calls++;
      assert(url.includes('/rest/v1/profiles?'));
      assert(url.includes('limit=5'));
      assert.equal(options.headers.apikey, 'test-public-key');
      assert(options.signal instanceof AbortSignal);
      await gate;
      if (response === 'offline') throw new TypeError('Failed to fetch');
      if (response === 'invalid') return { ok: true, json: async () => [{ username: 'Bad', total_xp: -1 }] };
      return { ok: true, json: async () => [{ username: 'Top Player', avatar_url: null, total_xp: 1500 }] };
    },
  });
  const first = store.getHigherLowerLeaderboard();
  const concurrent = store.getHigherLowerLeaderboard();
  assert.equal(calls, 1);
  release();
  assert.equal((await first)[0].name, 'Top Player');
  assert.equal((await concurrent)[0].xp, 1500);
  assert.equal((await store.getHigherLowerLeaderboard())[0].avatar, '/img/players/bellingham.jpg');
  assert.equal(calls, 1);
  response = 'offline'; now += 61_000;
  assert.equal((await store.getHigherLowerLeaderboard())[0].name, 'Top Player');
  response = 'invalid'; now += 61_000;
  assert.equal((await store.getHigherLowerLeaderboard())[0].xp, 1500);
  assert.equal(calls, 3);
});

test('leaderboard widget accepts valid public entries and rejects malformed responses', () => {
  const { isLeaderboardEntries } = loadTs('src/lib/higher-lower/leaderboard.ts');
  const valid = [{ name: 'Player', avatar: '/img/players/messi.jpg', xp: 0 }];
  assert(isLeaderboardEntries(valid));
  assert(isLeaderboardEntries([]));
  for (const value of [null, {}, [{ ...valid[0], xp: -1 }], [{ ...valid[0], xp: '100' }],
    [{ ...valid[0], name: '' }], [{ ...valid[0], avatar: 'javascript:alert(1)' }], Array(6).fill(valid[0])]) {
    assert(!isLeaderboardEntries(value));
  }
});
