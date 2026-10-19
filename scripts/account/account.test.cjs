const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { randomUUID } = require('node:crypto');
const ts = require('typescript');
const root = path.resolve(__dirname, '../..');

function loader(globals = {}, mocks = {}) {
  const cache = new Map();
  function load(file) {
    if (mocks[file]) return mocks[file];
    if (file.startsWith('@/')) file = path.join(root, 'src', file.slice(2));
    if (!path.isAbsolute(file)) return require(file);
    if (!path.extname(file)) file += fs.existsSync(file + '.ts') ? '.ts' : '.tsx';
    if (file.endsWith('.css')) return {};
    if (cache.has(file)) return cache.get(file);
    const exports = {}; cache.set(file, exports);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
    vm.runInNewContext(code, { exports, Date, Intl, URL, AbortSignal, Event, console, ...globals, require(name) { return load(name.startsWith('.') ? path.resolve(path.dirname(file), name) : name); } }, { filename: file });
    return exports;
  }
  return file => load(path.join(root, file));
}

const load = loader();
const { readRankingRows } = load('src/lib/account/leaderboard.ts');
const { normalizeHistory, careerAchievements } = load('src/lib/account/history.ts');
const { ACCOUNT_MODES } = load('src/lib/account/modes.ts');

test('combined rankings retain server order, zero XP, and real level boundaries', () => {
  const rows = readRankingRows([{ id: 'a', username: 'A', total_xp: 400 }, { id: 'b', username: 'B', total_xp: 0 }, { id: 'c', total_xp: null }], true);
  assert.equal(rows.length, 3); assert.equal(rows[0].rank, 1); assert.equal(rows[0].level, 3); assert.equal(rows[1].score, 0); assert.equal(rows[2].level, 1);
  assert.equal(readRankingRows([], true).length, 0, 'Empty services never manufacture opponents');
});

test('individual boards preserve authoritative ranks and prevent malformed entries', () => {
  const rows = readRankingRows([{ rank: '4', user_id: 'a', username: 'Scout', best_score: 8.5, games_played: '12', avatar_url: 'javascript:invalid' }], false);
  assert.equal(rows[0].rank, 4); assert.equal(rows[0].score, 8.5); assert.equal(rows[0].games, 12); assert.equal(rows[0].avatar, null);
  for (const score of [NaN, Infinity, -1, undefined, '100']) assert.throws(() => readRankingRows([{ rank: 1, user_id: 'a', best_score: score }], false));
  assert.throws(() => readRankingRows([{ rank: 0, user_id: 'a', best_score: 1 }], false));
});

test('all eight modes have distinct identities and only three are coming soon', () => {
  assert.equal(ACCOUNT_MODES.length, 8); assert.equal(new Set(ACCOUNT_MODES.map(item => item.id)).size, 8);
  assert.equal(ACCOUNT_MODES.filter(item => item.comingSoon).length, 3);
});

test('legacy history is normalized without inventing wins and malformed records are discarded', () => {
  const rows = normalizeHistory([{ id: 1, mode: 'grid', score: 100, created_at: '2026-01-01T00:00:00Z' }, { id: 2, game_mode: 'journeyman', won: false, score: 0, created_at: '2026-02-01T00:00:00Z' }, { id: 3, mode: 'made-up', score: 100, created_at: '2026-01-01T00:00:00Z' }, { id: 4, mode: 'grid', score: -20, created_at: 'bad-date' }]);
  assert.equal(rows.length, 2); assert.equal(rows[0].mode, 'journeyman'); assert.equal(rows[0].won, false); assert.equal(rows[1].mode, 'matrix'); assert.equal(rows[1].won, null);
});

test('guest history stays separated by account, records losses, and survives unavailable storage', () => {
  const storage = new Map(); let events = 0;
  const history = loader({ localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) }, crypto: { randomUUID }, window: { dispatchEvent: () => events++ } })('src/lib/account/history.ts');
  history.appendLocalHistory('guest-a', 'matrix', true, 100);
  history.appendLocalHistory('guest-b', 'journeyman', false, 0);
  assert.equal(history.readLocalHistory('guest-a').length, 1); assert.equal(history.readLocalHistory('guest-a')[0].mode, 'matrix');
  assert.equal(history.readLocalHistory('guest-b')[0].won, false); assert.equal(events, 2);
  history.appendLocalHistory('guest-a', 'invalid', true, 100); assert.equal(history.readLocalHistory('guest-a').length, 1);
  const blocked = loader({ localStorage: { getItem() { throw Error('Blocked'); }, setItem() { throw Error('Blocked'); } } })('src/lib/account/history.ts');
  assert.doesNotThrow(() => blocked.appendLocalHistory('guest', 'matrix', true, 100)); assert.equal(blocked.readLocalHistory('guest').length, 0);
});

test('achievements use career counters without awarding unearned mode-specific badges', () => {
  const blank = { games_played: 0, games_won: 0, best_streak: 0, total_xp: 0, level: 1 };
  assert.equal(careerAchievements(blank).filter(badge => badge.current >= badge.target).length, 0);
  const earned = careerAchievements({ ...blank, games_played: 25, games_won: 10, best_streak: 5, total_xp: 1000, level: 6 }).filter(badge => badge.current >= badge.target);
  assert.equal(earned.length, 7);
});

function route(fetch) {
  return loader({ fetch, process: { env: { SUPABASE_URL: 'https://example.test', SUPABASE_ANON_KEY: 'public-test-key' } } }, { 'next/server': { NextResponse: { json: (body, init) => ({ status: init?.status || 200, body }) } } })('src/app/api/leaderboard/route.ts').GET;
}
const request = mode => ({ nextUrl: new URL(`http://localhost/api/leaderboard?mode=${mode}`) });

test('individual mode requests use the existing mode-specific ranking RPC', async () => {
  let called;
  const get = route(async (url, options) => { called = { url, options }; return { ok: true, json: async () => [{ rank: 1, user_id: 'real-user', username: 'Player', best_score: 100, games_played: 2 }] }; });
  const response = await get(request('matrix'));
  assert.equal(response.status, 200); assert.equal(JSON.parse(called.options.body).p_mode, 'grid'); assert.equal(called.options.method, 'POST'); assert.equal(response.body.entries[0].score, 100);
});

test('combined requests rank total XP across modes and never call a single-mode RPC', async () => {
  let called;
  const get = route(async (url, options) => { called = { url, options }; return { ok: true, json: async () => [{ id: 'real-user', username: 'Player', total_xp: 200 }] }; });
  const response = await get(request('combined'));
  assert.equal(response.status, 200); assert(called.url.includes('order=total_xp.desc')); assert.equal(called.options.method, 'GET'); assert.equal(response.body.entries[0].level, 2);
});

test('unreleased modes, invalid modes, and unavailable backends have distinct honest states', async () => {
  const noFetch = route(() => { throw Error('Must not fetch'); });
  assert.equal((await noFetch(request('pixel-pitch'))).body.comingSoon, true);
  assert.equal((await noFetch(request('invented'))).status, 400);
  const failure = await noFetch(request('combined')); assert.equal(failure.status, 503); assert.equal(failure.body.entries, undefined);
});

test('profile server rendering keeps all three linked sections and accessible sound controls', () => {
  const React = require('react'); const { renderToStaticMarkup } = require('react-dom/server');
  const profile = { id: 'guest', username: 'Test Scout', total_xp: 0, level: 1, current_streak: 0, best_streak: 0, coins: 0, is_guest: true, games_played: 0, games_won: 0, created_at: '2026-01-01T00:00:00Z' };
  const mockAuth = { profile, isLoading: false, soundEnabled: false };
  const icons = new Proxy({}, { get: () => ({ size, strokeWidth, ...props }) => React.createElement('svg', props) });
  const renderLoad = loader({}, { 'lucide-react': icons, '@/context/auth-context': { useAuth: () => mockAuth }, '@/lib/supabase/client': {}, 'next/link': { __esModule: true, default: ({ children, ...props }) => React.createElement('a', props, children) }, 'next/image': { __esModule: true, default: () => null } });
  const Profile = renderLoad('src/components/account/ProfilePage.tsx').default;
  const html = renderToStaticMarkup(React.createElement(Profile));
  for (const id of ['stats', 'badges', 'settings']) assert(html.includes(`id="${id}"`));
  assert(html.includes('role="switch"')); assert(html.includes('aria-checked="false"')); assert(html.includes('Save changes')); assert(!html.includes('Elite Predictor'));
});
