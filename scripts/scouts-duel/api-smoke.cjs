// Run against a development server: SCOUT_TEST_URL defaults to loopback:3000.
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const base = process.env.SCOUT_TEST_URL || 'http://127.0.0.1:3000';
if (!['localhost','127.0.0.1','[::1]'].includes(new URL(base).hostname)) throw Error('Use a local test server.');
function client() {
  let cookie = '';
  return async (path, data) => {
    const response = await fetch(base + '/api/games/scouts-duel' + path, {
      method: data ? 'POST' : 'GET', headers: { ...(cookie ? { Cookie: cookie } : {}), ...(data ? { 'Content-Type': 'application/json' } : {}) },
      ...(data ? { body: JSON.stringify(data) } : {}),
    });
    const saved = response.headers.get('set-cookie');
    if (saved) cookie = saved.split(';')[0];
    return { status: response.status, ...(await response.json()) };
  };
}
async function main() {
  const a = client(), b = client(), intruder = client();
  const created = await a('', { mode: 'custom', name: 'API Scout A', turnSeconds: 60 });
  assert.equal(created.status, 200, JSON.stringify(created));
  const initial = created.match, path = '/rooms/' + initial.id;
  const action = async (c, action, requestId = randomUUID()) => {
    // The real clients poll continuously. Keep the idle test peer connected
    // while cold development compilation or cloud requests take longer.
    await (c === a ? b : a)(path);
    return c(path, { requestId, action });
  };
  const joined = await b('', { joinCode: initial.code, name: 'API Scout B' });
  assert.equal(joined.status, 200); assert.equal(joined.match.options.turnSeconds, 60);
  assert.deepEqual(initial.board.map(p => p.id), joined.match.board.map(p => p.id));
  const secret = [initial.board[0].id, initial.board[23].id];
  const first = await action(a, { type: 'LOCK_IN_PLAYER', playerId: secret[0] });
  assert.equal(first.match.secrets, null); assert(!JSON.stringify(first).includes('tokenHash'));
  await action(b, { type: 'LOCK_IN_PLAYER', playerId: secret[1] });
  const av = await a(path), bv = await b(path);
  assert.equal(av.match.status, 'active'); assert.equal(av.match.mySecret.id, secret[0]); assert.equal(bv.match.mySecret.id, secret[1]); assert.equal(av.match.secrets, null); assert.equal(bv.match.secrets, null);
  const contexts = [a, b], seat = av.match.activeSeat, requestId = randomUUID();
  const invalid = await contexts[seat]('/evaluate-question', { roomId: initial.id, query: 'Was he teammates with Messi and Ronaldo?' });
  assert.equal(invalid.status, 400); assert.equal((await contexts[seat](path)).match.questionCount, 0);
  const asked = await action(contexts[seat], { type: 'ASK_QUESTION', questionId: 'position:FW' }, requestId);
  assert.equal(asked.status, 200, JSON.stringify(asked));
  const actual = initial.board.find(p => p.id === secret[1 - seat]);
  assert.equal(asked.match.logs[0].answer, actual.position === 'FW');
  const replay = await action(contexts[seat], { type: 'ASK_QUESTION', questionId: 'position:FW' }, requestId);
  assert.equal(replay.status, 200); assert.equal(replay.match.logs.length, 1);
  assert.equal((await action(contexts[seat], { type: 'ASK_QUESTION', questionId: 'position:MF' })).status, 400);
  const flipId = initial.board[4].id;
  const flipped = await action(contexts[seat], { type: 'UPDATE_BOARD_STATE', playerId: flipId });
  assert.equal(flipped.match.remaining.length, 23); assert.equal(flipped.match.questionCount, 1);
  assert.equal((await action(contexts[seat], { type: 'UPDATE_BOARD_STATE', playerId: flipId })).match.remaining.length, 24);
  const winner = 1 - seat;
  const win = await action(contexts[winner], { type: 'SHOOT_GUESS', playerId: secret[seat] });
  assert.equal(win.status, 200); assert.equal(win.match.status, 'completed'); assert.equal(win.match.earnedXp, 200);
  const loser = await contexts[seat](path);
  assert.equal(loser.match.earnedXp, 0); assert.equal(loser.match.secrets.filter(Boolean).length, 2);
  await intruder('', { mode: 'ai', name: 'API Intruder' });
  assert.equal((await intruder(path)).status, 403); assert.equal((await client()(path)).status, 401);
  assert.equal((await contexts[winner](path)).match.status, 'completed');
  console.log('PASS custom room, deterministic shared board, hidden secrets, server answers, invalid query, replay protection, manual deduction, result, and access control');

  const q1 = client(), q2 = client();
  const queued = await Promise.all([q1('', { mode: 'online', name: 'Queue A' }), q2('', { mode: 'online', name: 'Queue B' })]);
  assert(queued.every(r => r.status === 200), JSON.stringify(queued));
  assert.equal(queued[0].match.id, queued[1].match.id);
  assert.equal((await q1('/rooms/' + queued[0].match.id)).match.status, 'selecting');
  assert.equal(queued[0].match.options.turnSeconds, 45);
  await q1('/rooms/' + queued[0].match.id, { requestId: randomUUID(), action: { type: 'RESIGN' } });
  console.log('PASS simultaneous matchmaking pairs both entrants');

  const manual = client(), assisted = client();
  const cm = await manual('', { mode: 'online', name: 'Manual', assistance: false, hardcore: true });
  const hm = await assisted('', { mode: 'online', name: 'Assisted', assistance: true });
  assert.equal(cm.status, 200); assert.equal(hm.status, 200); assert.notEqual(cm.match.id, hm.match.id); assert.equal(cm.match.options.hardcore, false);
  await Promise.all([[manual,cm],[assisted,hm]].map(([c,r]) => c('/rooms/' + r.match.id, { requestId: randomUUID(), action: { type: 'RESIGN' } })));
  console.log('PASS incompatible rules use separate queues');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
