// Production HTTP checks; this does not replace visual/browser gameplay testing.
const assert = require('node:assert/strict');
const base = process.argv[2] || 'http://127.0.0.1:3107';
(async () => {
  for (const page of ['/', '/game-modes']) {
    const html = await (await fetch(base + page)).text();
    assert(html.includes('href="/games/the-decoy"')); console.log(page + ' links to The Decoy');
  }
  const response = await fetch(base + '/games/the-decoy'); assert.equal(response.status, 200);
  const html = await response.text();
  for (const text of ['The Decoy', 'Kick off', 'Learn the Decoy', 'Break the Mark', 'The Final Run', 'Practice pitch', 'Sprint', 'Feint']) assert(html.includes(text), text);
  const urls = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m => m[1].replaceAll('&amp;', '&')).filter(u => u.startsWith('/_next/') || u.startsWith('/img/'));
  for (const url of new Set(urls)) assert.equal((await fetch(base + url)).status, 200, url);
  for (const url of ['/img/game-modes/the-decoy.webp', '/social/the-decoy.jpg']) assert.equal((await fetch(base + url)).status, 200);
  assert((await (await fetch(base + '/sitemap.xml')).text()).includes('/games/the-decoy'));
  console.log('Controls, discovery links, static chunks, artwork, share image and sitemap verified.');
})().catch(error => { console.error(error); process.exitCode = 1; });
