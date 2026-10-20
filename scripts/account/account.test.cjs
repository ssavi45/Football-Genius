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

test('all 50 selectable portraits exist and avatar lookup requires an exact catalog path', () => {
  const { FOOTBALLER_AVATARS, findAvatarByUrl } = load('src/data/avatar-catalog.ts');
  assert.equal(FOOTBALLER_AVATARS.length, 50);
  assert.equal(new Set(FOOTBALLER_AVATARS.map(item => item.id)).size, 50);
  assert.equal(new Set(FOOTBALLER_AVATARS.map(item => item.avatarUrl)).size, 50);
  for (const avatar of FOOTBALLER_AVATARS) {
    assert(fs.existsSync(path.join(root, 'public', avatar.avatarUrl)), avatar.avatarUrl);
    assert.equal(findAvatarByUrl(avatar.avatarUrl).id, avatar.id);
  }
  for (const invalid of ['/', 'messi.jpg', '/MESSI.JPG', 'https://example.test/messi.jpg', '//example.test/image.jpg', '/img/players/missing.jpg', '']) {
    assert.equal(findAvatarByUrl(invalid), undefined, invalid);
  }
});

test('ranking client preserves empty boards and real scores while rejecting corrupt responses', async () => {
  const { isRankingEntries, rankingUnit } = load('src/lib/account/leaderboard.ts');
  const entry = { rank: 4, userId: 'actual-user', name: 'Real Scout', avatar: null, score: 0, games: 2 };
  assert.equal(isRankingEntries([entry]), true);
  assert.equal(isRankingEntries([{ ...entry, score: 8.5 }]), true);
  for (const invalid of [null, [null], [{ ...entry, score: -1 }], [{ ...entry, score: '4' }], [{ ...entry, avatar: 'javascript:bad' }], [{ ...entry, rank: 0 }], [entry, entry]]) assert.equal(isRankingEntries(invalid), false);
  for (const [mode, unit] of [['matrix', 'cells'], ['higher-lower', 'picks'], ['journeyman', 'pts'], ['combined', 'XP']]) assert.equal(rankingUnit(mode), unit);
  let response = { ok: true, json: async () => ({ entries: [entry] }) };
  let called;
  const client = loader({ fetch: async (url, options) => { called = { url, options }; return response; } })('src/lib/account/fetchRankings.ts');
  const signal = new AbortController().signal;
  assert.equal((await client.fetchRankings('matrix', signal))[0].rank, 4);
  assert.equal(called.url, '/api/leaderboard?mode=matrix'); assert.equal(called.options.signal, signal); assert.equal(called.options.cache, 'no-store');
  response = { ok: true, json: async () => ({ entries: [] }) };
  assert.equal((await client.fetchRankings('higher-lower', signal)).length, 0);
  for (const bad of [{ ok: false, json: async () => ({ error: 'Unavailable' }) }, { ok: true, json: async () => ({}) }, { ok: true, json: async () => ({ entries: [{ ...entry, score: null }] }) }]) {
    response = bad; await assert.rejects(client.fetchRankings('journeyman', signal), /unavailable/);
  }
});

test('avatar picker renders 50 portrait-only choices with accessible names and no default selection', () => {
  const React = require('react'); const { renderToStaticMarkup } = require('react-dom/server');
  const icons = new Proxy({}, { get: () => () => React.createElement('svg') });
  const Picker = loader({}, { 'lucide-react': icons, 'next/image': { __esModule: true, default: () => React.createElement('img', { alt: '' }) } })('src/components/account/AvatarPickerModal.tsx').default;
  const html = renderToStaticMarkup(React.createElement(Picker, { isOpen: true, onClose() {}, onSaveAvatar: async () => {} }));
  assert.equal((html.match(/aria-label="Select /g) || []).length, 50);
  assert.equal((html.match(/aria-pressed="true"/g) || []).length, 0);
  assert(html.includes('role="dialog"')); assert(html.includes('aria-label="Select Lionel Messi"'));
  const visibleText = html.replace(/<[^>]+>/g, '');
  for (const removed of ['Lionel Messi', 'Forward', 'Legend', 'Modern', '50 FOOTBALL']) assert(!visibleText.includes(removed), removed);
  const selected = renderToStaticMarkup(React.createElement(Picker, { isOpen: true, currentAvatarUrl: '/img/players/messi.jpg', onClose() {}, onSaveAvatar: async () => {} }));
  assert.equal((selected.match(/aria-pressed="true"/g) || []).length, 1);
  assert.equal(renderToStaticMarkup(React.createElement(Picker, { isOpen: false })), '');
});

function hookHarness() {
  const React = require('react');
  const states = [], refs = [], effects = [];
  let cursor = 0, refCursor = 0, effectCursor = 0, pending = [];
  const api = {
    ...React,
    useState(initial) { const i = cursor++; if (!(i in states)) states[i] = typeof initial === 'function' ? initial() : initial; return [states[i], value => { states[i] = typeof value === 'function' ? value(states[i]) : value; }]; },
    useRef(value) { const i = refCursor++; return refs[i] ||= { current: value }; },
    useCallback(fn) { return fn; },
    useEffect(fn, deps) { const i = effectCursor++; if (!effects[i] || deps.some((value, j) => !Object.is(value, effects[i].deps[j]))) pending.push(() => { effects[i]?.cleanup?.(); effects[i] = { deps, cleanup: fn() }; }); },
  };
  return { api, states, refs, render(fn) { cursor = refCursor = effectCursor = 0; const result = fn(); const tasks = pending; pending = []; tasks.forEach(task => task()); return result; }, dispose() { effects.forEach(effect => effect.cleanup?.()); } };
}

test('guest and signed-in avatars persist, and failed writes leave the previous portrait intact', async () => {
  const { FOOTBALLER_AVATARS } = load('src/data/avatar-catalog.ts');
  const avatar = FOOTBALLER_AVATARS[0].avatarUrl;
  for (const isGuest of [true, false]) {
    const harness = hookHarness(); const saved = new Map(); const writes = [];
    let failure = false, storageBlocked = false;
    const profile = { id: isGuest ? 'guest-1' : 'account-1', username: 'Scout', is_guest: isGuest, avatar_url: undefined };
    harness.states[0] = profile;
    const supabase = { from(table) { assert.equal(table, 'profiles'); return { update(values) { return { eq(key, id) { writes.push({ values, key, id }); return { select() { return { single: async () => ({ error: failure ? Error('Offline') : null }) }; } }; } }; } }; } };
    const Provider = loader({ localStorage: { setItem(key, value) { if (storageBlocked) throw Error('Blocked'); saved.set(key, JSON.parse(value)); } } }, { react: harness.api, '@/lib/supabase/client': { supabase }, '@/lib/supabase/config': { supabaseConfigured: true } })('src/context/auth-context.tsx').AuthProvider;
    // Provider effects initialize auth; exercise its mutation callbacks without mounting those effects.
    harness.api.useEffect = () => {};
    let context = harness.render(() => Provider({ children: null })).props.value;
    await assert.rejects(context.updateAvatar('/'), /collection/);
    await context.updateAvatar(avatar);
    context = harness.render(() => Provider({ children: null })).props.value;
    assert.equal(context.profile.avatar_url, avatar);
    if (isGuest) { assert.equal(writes.length, 0); assert.equal([...saved.values()][0].avatar_url, avatar); storageBlocked = true; }
    else { assert.equal(writes[0].id, 'account-1'); assert.equal(writes[0].values.avatar_url, avatar); failure = true; }
    await assert.rejects(context.updateAvatar(FOOTBALLER_AVATARS[1].avatarUrl), /Could not save/);
    context = harness.render(() => Provider({ children: null })).props.value;
    assert.equal(context.profile.avatar_url, avatar);
  }
});

test('rankings refresh on committed results and profile changes without fetching after every awarded XP', async () => {
  const harness = hookHarness(); const calls = [];
  let profile = { id: 'member', is_guest: false, games_played: 2, total_xp: 40, username: 'Scout', avatar_url: undefined };
  const use = loader({ AbortController, fetch: async (url, options) => { calls.push({ url, options }); return { ok: true, json: async () => ({ entries: [] }) }; } }, { react: harness.api, '@/context/auth-context': { useAuth: () => ({ profile }) } })('src/lib/account/useModeLeaderboard.ts').useModeLeaderboard;
  const settle = () => new Promise(resolve => setImmediate(resolve));
  harness.render(() => use('matrix')); await settle();
  assert.equal(calls.length, 1);
  profile = { ...profile, total_xp: 80 }; harness.render(() => use('matrix')); await settle(); assert.equal(calls.length, 1);
  profile = { ...profile, games_played: 3 }; harness.render(() => use('matrix')); await settle(); assert.equal(calls.length, 2);
  assert.equal(calls[0].options.signal.aborted, true);
  profile = { ...profile, avatar_url: '/img/players/messi.jpg' }; let state = harness.render(() => use('matrix')); await settle(); assert.equal(calls.length, 3);
  state.retry(); harness.render(() => use('matrix')); await settle(); assert.equal(calls.length, 4);
  harness.dispose(); assert.equal(calls.at(-1).options.signal.aborted, true);
});

test('avatar picker keeps keyboard focus stable and blocks duplicate saves or dismissal while saving', async () => {
  const React = require('react'); const harness = hookHarness();
  const listeners = new Map(); let focusRestored = 0, listenerAdds = 0, closed = 0, writes = 0, resolveSave;
  class Element { constructor() { this.isConnected = true; } focus() { focusRestored++; } }
  const previous = new Element();
  const dialog = { querySelector: () => null, focus() {}, querySelectorAll: () => [] };
  harness.refs[0] = { current: dialog };
  const document = { body: { style: { overflow: 'auto' } }, activeElement: previous, addEventListener(type, fn) { listenerAdds++; listeners.set(type, fn); }, removeEventListener(type) { listeners.delete(type); } };
  const Picker = loader({ document, HTMLElement: Element }, { react: harness.api, 'lucide-react': new Proxy({}, { get: () => () => React.createElement('svg') }) })('src/components/account/AvatarPickerModal.tsx').default;
  const save = () => { writes++; return new Promise(resolve => { resolveSave = resolve; }); };
  const render = () => harness.render(() => { const inner = Picker({ isOpen: true, onClose: () => closed++, onSaveAvatar: save }); return inner.type(inner.props); });
  const nodes = node => !node || typeof node !== 'object' ? [] : [node, ...React.Children.toArray(node.props?.children).flatMap(nodes)];
  let tree = render();
  assert.equal(document.body.style.overflow, 'hidden'); assert.equal(listenerAdds, 1);
  nodes(tree).find(node => node.props?.['aria-label'] === 'Select Lionel Messi').props.onClick();
  tree = render(); assert.equal(listenerAdds, 1); assert.equal(focusRestored, 0, 'Selecting a portrait must not return focus to the opener');
  const apply = nodes(tree).find(node => node.props?.className === 'account-primary-button avatar-save-button');
  apply.props.onClick(); apply.props.onClick(); assert.equal(writes, 1);
  tree = render(); assert.equal(nodes(tree).find(node => node.props?.className === 'account-primary-button avatar-save-button').props.disabled, true);
  listeners.get('keydown')({ key: 'Escape', preventDefault() {}, stopPropagation() {} }); assert.equal(closed, 0);
  resolveSave(); await new Promise(resolve => setImmediate(resolve)); assert.equal(closed, 1);
  harness.dispose(); assert.equal(document.body.style.overflow, 'auto'); assert.equal(focusRestored, 1);
});

test('mode links open individual standings with the corresponding score unit', () => {
  const React = require('react'); const { renderToStaticMarkup } = require('react-dom/server');
  const icons = new Proxy({}, { get: () => () => React.createElement('svg') });
  for (const [mode, unit, title] of [['matrix', 'cells', 'Football Matrix'], ['higher-lower', 'picks', 'Higher or Lower'], ['journeyman', 'pts', 'The Journeyman']]) {
    let fetchedMode;
    const Page = loader({}, {
      'lucide-react': icons,
      'next/navigation': { useSearchParams: () => new URLSearchParams({ mode }) },
      'next/link': { __esModule: true, default: ({ children, ...props }) => React.createElement('a', props, children) },
      'next/image': { __esModule: true, default: () => null },
      '@/context/auth-context': { useAuth: () => ({ profile: { id: 'guest', is_guest: true, username: 'Scout', total_xp: 0, level: 1 } }) },
      '@/lib/account/useModeLeaderboard': { useModeLeaderboard: value => { fetchedMode = value; return { loading: false, error: null, entries: [{ rank: 1, userId: 'actual-user', name: 'Recorded Scout', avatar: null, score: 4, games: 1 }], retry() {} }; } },
    })('src/components/account/LeaderboardPage.tsx').default;
    const html = renderToStaticMarkup(React.createElement(Page));
    assert.equal(fetchedMode, mode); assert(html.includes(title)); assert(html.includes(`<small>${unit}</small>`)); assert(html.includes('Recorded Scout'));
  }
});

test('new guests receive a random catalog portrait that survives a fresh page load', () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
  const last = Object.create(Math); last.random = () => 0.999;
  const first = Object.create(Math); first.random = () => 0;
  const initial = loader({ localStorage: storage, crypto: { randomUUID: () => 'new-guest-1234' }, Math: last })('src/lib/account/guest-profile.ts').readGuest();
  assert.equal(initial.id, 'guest_new-guest-1234'); assert.equal(initial.username, 'Scout_1234'); assert.equal(initial.avatar_url, '/img/players/yamal.jpg');
  const reloaded = loader({ localStorage: storage, crypto: { randomUUID() { throw Error('Must reuse guest'); } }, Math: first })('src/lib/account/guest-profile.ts').readGuest();
  assert.equal(reloaded.id, initial.id); assert.equal(reloaded.avatar_url, initial.avatar_url); assert.equal(reloaded.created_at, initial.created_at);
});

test('existing guests keep names, results, and selected portraits when their defaults are migrated', () => {
  const saved = { id: 'guest-old', is_guest: true, username: 'My Scout', total_xp: 450, games_played: 12, games_won: 8, avatar_url: undefined };
  let stored = JSON.stringify(saved);
  const guest = loader({ localStorage: { getItem: () => stored, setItem: (_, value) => { stored = value; } }, crypto: { randomUUID() { throw Error('Must keep account'); } } })('src/lib/account/guest-profile.ts');
  const migrated = guest.readGuest();
  assert.equal(migrated.username, saved.username); assert.equal(migrated.total_xp, 450); assert.equal(migrated.games_played, 12); assert.equal(migrated.games_won, 8);
  const selected = '/img/players/zidane.jpg'; stored = JSON.stringify({ ...migrated, avatar_url: selected });
  assert.equal(guest.readGuest().avatar_url, selected);
  const blocked = loader({ localStorage: { getItem: () => JSON.stringify(saved), setItem() { throw Error('Read only'); } } })('src/lib/account/guest-profile.ts').readGuest();
  assert.equal(blocked.total_xp, 450); assert(blocked.avatar_url);
});

test('navbar shows guest portrait and name before Sign In and removes Play Now for every account', () => {
  const React = require('react'); const { renderToStaticMarkup } = require('react-dom/server');
  for (const isGuest of [true, false]) {
    const profile = { id: 'scout', username: isGuest ? 'Guest Scout' : 'Member Scout', is_guest: isGuest, avatar_url: '/img/players/yamal.jpg' };
    const Nav = loader({}, {
      'lucide-react': new Proxy({}, { get: () => () => React.createElement('svg') }),
      'next/navigation': { usePathname: () => '/games/scouts-duel' },
      'next/link': { __esModule: true, default: ({ children, ...props }) => React.createElement('a', props, children) },
      'next/image': { __esModule: true, default: ({ src }) => React.createElement('img', { alt: '', src }) },
      '@/lib/utils/sound': { sound: {} },
      '@/context/auth-context': { useAuth: () => ({ profile, isLoading: false }) },
    })('src/components/navigation/TopBar.tsx').default;
    const html = renderToStaticMarkup(React.createElement(Nav));
    assert(!html.includes('Play Now')); assert(html.includes(profile.username)); assert(html.includes(profile.avatar_url));
    assert.equal(html.includes('class="sign-in"'), isGuest);
    if (isGuest) assert(html.indexOf('class="navbar-profile-name"') < html.indexOf('class="sign-in"'));
  }
});
