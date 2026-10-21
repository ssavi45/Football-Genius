const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const sharp = require('sharp');
const root = path.resolve(__dirname, '../..');
function loader(globals = {}, mocks = {}) {
  const cache = new Map();
  const load = file => {
    if (mocks[file]) return mocks[file];
    if (file.startsWith('@/')) file = path.join(root, 'src', file.slice(2));
    if (!path.isAbsolute(file)) return require(file);
    if (!path.extname(file)) file += fs.existsSync(file + '.ts') ? '.ts' : '.tsx';
    if (file.endsWith('.css')) return {};
    if (file.endsWith('.json')) return JSON.parse(fs.readFileSync(file, 'utf8'));
    if (cache.has(file)) return cache.get(file);
    const exports = {}; cache.set(file, exports);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, resolveJsonModule: true } }).outputText;
    vm.runInNewContext(code, { exports, process: { env: { NODE_ENV: 'production' } }, URL, Date, TextDecoder, AbortSignal, console, ...globals, require: name => load(name.startsWith('.') ? path.resolve(path.dirname(file), name) : name) }, { filename: file });
    return exports;
  };
  return file => load(path.join(root, file));
}
const load = loader();
const { SEO_PAGES, SITE_URL, pageMetadata } = load('src/lib/seo/metadata.ts');
test('every public page has a unique title, description, canonical and valid share card', async () => {
  const titles = new Set(), descriptions = new Set();
  for (const page of SEO_PAGES) {
    const metadata = pageMetadata(page.path);
    assert(!titles.has(metadata.title.absolute)); titles.add(metadata.title.absolute);
    assert(!descriptions.has(metadata.description)); descriptions.add(metadata.description);
    assert(!metadata.title.absolute.includes(' ? ')); assert(metadata.description.length >= 80);
    assert.equal(metadata.alternates.canonical, SITE_URL + (page.path === '/' ? '' : page.path));
    assert.equal(metadata.twitter.card, 'summary_large_image'); assert.equal(metadata.robots.index, page.index);
    const image = metadata.openGraph.images[0]; assert(image.alt.length > 20);
    const info = await sharp(path.join(root, 'public', new URL(image.url).pathname)).metadata();
    assert.equal(info.width, 1200); assert.equal(info.height, 630); assert.equal(info.format, 'jpeg');
  }
  const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(item => item.isDirectory() ? walk(path.join(dir, item.name)) : item.name === 'page.tsx' ? [path.relative(path.join(root, 'src/app'), path.dirname(path.join(dir, item.name))).replaceAll('\\', '/')] : []);
  for (const route of walk(path.join(root, 'src/app')).filter(route => !route.includes('['))) assert(SEO_PAGES.some(page => page.path === (route ? '/' + route : '/')), route);
});
test('sitemap and robots expose canonical public routes without private or unfinished pages', () => {
  const sitemap = load('src/app/sitemap.ts').default();
  assert(sitemap.some(page => page.url === SITE_URL)); assert(sitemap.some(page => page.url === SITE_URL + '/contact'));
  assert.equal(sitemap.length, SEO_PAGES.filter(page => page.index).length);
  assert(!sitemap.some(page => /profile|tunnel-talk|pixel-pitch|scramble|api|auth|\?/.test(page.url)));
  const robots = load('src/app/robots.ts').default(); assert.equal(robots.sitemap, SITE_URL + '/sitemap.xml'); assert(robots.rules.disallow.includes('/api/'));
});
const body = { name: 'A Scout', email: 'scout@example.com', topic: 'Bug report', message: 'The next question did not load.', consent: true, website: '', submissionId: 'a1111111-1111-4111-8111-111111111111' };
test('contact validation rejects injection, missing consent, unsupported topics and oversized messages', () => {
  const { contactMessage } = load('src/lib/contact.ts');
  assert.equal(contactMessage(body).email, body.email); assert.equal(contactMessage({ ...body, website: 'bot' }), null);
  for (const patch of [{ email: 'a@b.com\r\nBcc: other@example.com' }, { name: 'Scout\nInjected' }, { consent: false }, { topic: 'Arbitrary subject' }, { message: 'a'.repeat(4001) }, { message: 'tiny' }, { submissionId: 'not-an-id' }]) assert.throws(() => contactMessage({ ...body, ...patch }));
  assert.equal(contactMessage({ ...body, to: 'attacker@example.com' }).to, undefined);
});
test('contact JSON reader enforces the actual streamed body size', async () => {
  const { contactBody, CONTACT_MAX_BYTES } = load('src/lib/contact.ts');
  const request = input => new Request('https://www.footygen.online/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: input });
  assert.equal((await contactBody(request(JSON.stringify(body)))).name, body.name);
  await assert.rejects(contactBody(request('bad JSON')), error => error.status === 400);
  await assert.rejects(contactBody(request(JSON.stringify({ message: 'x'.repeat(CONTACT_MAX_BYTES) }))), error => error.status === 413);
});
test('contact email fixes the destination, uses reply-to, and deduplicates retries', async () => {
  let called;
  const send = loader({ fetch: async (url, options) => { called = { url, options }; return { ok: true, json: async () => ({ id: 'provider-message' }) }; } })('src/lib/contact.ts').sendContact;
  await send(body, 'test-key', 'Football Genius <contact@footygen.online>');
  const sent = JSON.parse(called.options.body);
  assert.equal(called.url, 'https://api.resend.com/emails'); assert.deepEqual(sent.to, ['football.genius.site@gmail.com']); assert.equal(sent.reply_to, body.email);
  assert.equal(sent.from, 'Football Genius <contact@footygen.online>'); assert.equal(called.options.headers['Idempotency-Key'], 'contact-' + body.submissionId); assert.equal(sent.html, undefined);
});
function route(env = {}, fetch = () => { throw Error('Unexpected email send'); }) {
  return loader({ fetch, process: { env: { NODE_ENV: 'production', ...env } } }, { 'next/server': { NextResponse: { json: (value, options) => Response.json(value, options) } } })('src/app/api/contact/route.ts').POST;
}
function request(value = body, origin = 'https://www.footygen.online') { return new Request('https://www.footygen.online/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin, 'x-vercel-forwarded-for': '192.0.2.3' }, body: JSON.stringify(value) }); }
test('contact endpoint reports unavailable delivery honestly and rejects cross-origin requests', async () => {
  const post = route();
  assert.equal((await post(request())).status, 503); assert.equal((await post(request(body, 'https://attacker.test'))).status, 403);
  assert.equal((await post(request({ ...body, consent: false }))).status, 400); assert.equal((await post(request({ website: 'honeypot' }))).status, 200);
});
test('provider acceptance is required before the contact endpoint reports success', async () => {
  const env = { RESEND_API_KEY: 'test-key', CONTACT_FROM_EMAIL: 'contact@footygen.online' };
  const good = route(env, async () => ({ ok: true, json: async () => ({ id: 'sent-message' }) }));
  const response = await good(request()); assert.equal(response.status, 200); assert.equal((await response.json()).ok, true);
  for (const fetch of [async () => ({ ok: false }), async () => ({ ok: true, json: async () => ({}) }), async () => { throw Error('private provider details'); }]) {
    const response = await route(env, fetch)(request()); assert.equal(response.status, 502); assert(!(await response.text()).includes('private provider details'));
  }
});
test('contact throttle has a bounded window and responds with a retry interval', async () => {
  const { allowContact } = loader()('src/lib/contact.ts');
  for (let i = 0; i < 5; i++) assert.equal(allowContact('ip', 0), true);
  assert.equal(allowContact('ip', 1), false); assert.equal(allowContact('ip', 15 * 60_000), true);
  const post = route({ RESEND_API_KEY: 'test', CONTACT_FROM_EMAIL: 'contact@footygen.online' }, async () => ({ ok: true, json: async () => ({ id: 'sent' }) }));
  for (let i = 0; i < 5; i++) assert.equal((await post(request())).status, 200);
  const response = await post(request()); assert.equal(response.status, 429); assert.equal(response.headers.get('Retry-After'), '900');
});
