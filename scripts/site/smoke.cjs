// Run against a built local server: node scripts/site/smoke.cjs http://127.0.0.1:3107
const assert = require('node:assert/strict');
const pages = require('../../src/data/page-seo.json');
const base = process.argv[2] || 'http://127.0.0.1:3107';
const site = 'https://www.footygen.online';
const decode = value => value.replaceAll('&amp;', '&').replaceAll('&#x27;', "'").replaceAll('&#39;', "'").replaceAll('&quot;', '"');
const attr = (tag, key) => decode(tag.match(new RegExp(`\\b${key}="([^"]*)"`))?.[1] || '');
const meta = (html, key) => [...html.matchAll(/<meta\b[^>]*>/g)].map(match => match[0]).filter(tag => attr(tag, 'name') === key || attr(tag, 'property') === key).map(tag => attr(tag, 'content'));
async function main() {
  for (const page of pages) {
    const response = await fetch(base + page.path, { headers: { 'User-Agent': 'facebookexternalhit/1.1' } });
    assert.equal(response.status, 200, page.path);
    const html = await response.text(), head = html.split('</head>')[0];
    const expectedTitle = page.path === '/' ? page.title : page.title + ' | Football Genius';
    assert.equal(decode(html.match(/<title>(.*?)<\/title>/)?.[1] || ''), expectedTitle, page.path);
    assert(meta(head, 'description').includes(page.description), page.path + ' crawler description');
    assert(meta(head, 'og:image').includes(`${site}/social/${page.slug}.jpg`), page.path + ' crawler share image');
    assert(meta(head, 'twitter:card').includes('summary_large_image'));
    assert(html.includes('href="/privacy"') && html.includes('href="/licences"') && html.includes('href="/contact"'), page.path + ' footer links');
    if (!page.index) assert(meta(head, 'robots').some(value => value.includes('noindex')), page.path);
    console.log(`200 ${page.path}: title, description, share image and footer verified`);
  }
  const missing = await fetch(base + '/this-page-does-not-exist');
  const missingHtml = await missing.text(); assert.equal(missing.status, 404); assert(missingHtml.includes('That page is offside.')); assert(meta(missingHtml, 'robots').some(value => value.includes('noindex')));
  assert(decode(missingHtml.match(/<title>(.*?)<\/title>/)?.[1] || '').includes('Page not found'), '404 title');
  const sitemap = await fetch(base + '/sitemap.xml'); assert.equal(sitemap.status, 200); const xml = await sitemap.text(); assert.equal((xml.match(/<loc>/g) || []).length, pages.filter(page => page.index).length); assert(xml.includes(site + '/contact')); assert(!xml.includes('/profile'));
  const robots = await fetch(base + '/robots.txt'); assert((await robots.text()).includes('Sitemap: ' + site + '/sitemap.xml'));
  const image = await fetch(base + '/social/home.jpg'); assert.equal(image.status, 200); assert(image.headers.get('content-type').includes('image/jpeg'));
  const notices = await fetch(base + '/legal/third-party-notices.txt'); assert.equal(notices.status, 200); assert((await notices.text()).includes('MIT License'));
  console.log('404 status/title, sitemap, robots, public preview and licence notices verified. No contact email was sent.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
