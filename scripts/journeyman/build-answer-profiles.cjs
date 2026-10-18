// Reuse reviewed local headshots; source missing portraits from the player's
// Wikipedia biography. Keep source links with every downloaded asset.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');
const root = path.resolve(__dirname, '../..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const careers = read('src/data/journeyman-careers.json').players;
const directory = read('src/data/journeyman-search-players.json').players;
const headshots = read('public/img/higher-lower/asset-sources.json').portraits;
const snapshot = read('src/data/higher-lower-snapshot.json').players;
const normalize = s => (s || '').normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
const out = 'public/img/journeyman/portraits';
fs.mkdirSync(path.join(root, out), { recursive: true });
const manifestPath = 'public/img/journeyman/portrait-sources.json';
const sources = fs.existsSync(path.join(root, manifestPath)) ? read(manifestPath) : {};
const profiles = {};
const unresolved = [];
const wikiPages = new Map();
const titles = {
  adriano: 'Adriano (footballer, born 1982)',
  emerson: 'Emerson (footballer, born 1976)',
  dida: 'Dida (footballer, born 1973)',
  juninho_pernambucano: 'Juninho Pernambucano',
  ronaldo_nazario: 'Ronaldo (Brazilian footballer)',
  didi: 'Didi (footballer, born 1928)',
  carlos_alberto: 'Carlos Alberto Torres',
  junior: 'Júnior (footballer, born 1954)',
  gerson: 'Gérson (footballer, born 1941)',
};
let queue = Promise.resolve();
async function get(url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const slot = queue.then(() => new Promise(resolve => setTimeout(resolve, 500)));
    queue = slot;
    await slot;
    const response = await fetch(url, { headers: { 'User-Agent': 'FootballGenius/1.0 (player portrait asset build)' }, signal: AbortSignal.timeout(20000) });
    if (response.ok) return response;
    if (response.status !== 429 || attempt === 3) throw Error(`HTTP ${response.status}`);
    await new Promise(resolve => setTimeout(resolve, 1500 * (attempt + 1)));
  }
}
async function build(p) {
  const entry = directory.find(q => normalize(q.name) === normalize(p.name));
  const profile = { nationality: entry?.nationality || p.nationality[0], nationalityFlag: entry?.nationalityFlag };
  const names = [p.name, p.fullName].map(normalize);
  const knownPlayer = snapshot.find(q => names.includes(normalize(q.name)) || names.includes(normalize(q.sourceName)));
  const portraitAliases = { van_dijk: 'vandijk', silva: 'bernardo', joao_neves: 'joaoneves' };
  const local = headshots.find(q => q.alpha && !q.error && (q.name === (portraitAliases[knownPlayer?.id] || knownPlayer?.id) || [q.identitySourceName, q.sourceName].some(name => name && names.includes(normalize(name)))));
  if (local && fs.existsSync(path.join(root, `public/img/higher-lower/players/${local.name}.png`))) {
    profile.portrait = `/img/higher-lower/players/${local.name}.png`;
    profile.cutout = true;
  } else {
    const file = `${out}/${p.id}.webp`;
    if (!sources[p.id] || !fs.existsSync(path.join(root, file))) {
      let summary = wikiPages.get(normalize(titles[p.id] || p.name)), reason;
      for (const title of summary ? [] : [titles[p.id] || p.name, `${p.name} (footballer)`]) {
        try {
          const candidate = await (await get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replaceAll(' ', '_'))}`)).json();
          if (candidate.type === 'standard' && candidate.thumbnail && /football|soccer/i.test(`${candidate.description} ${candidate.extract}`)) { summary = candidate; break; }
          reason = `${candidate.type}: ${candidate.description}; thumbnail=${!!candidate.thumbnail}`;
        } catch (error) { reason = error.message; }
      }
      if (!summary) { unresolved.push({ id: p.id, name: p.name, reason }); profiles[p.id] = profile; return; }
      try {
        const bytes = Buffer.from(await (await get(summary.thumbnail.source)).arrayBuffer());
        const webp = await sharp(bytes).rotate().resize(320, 400, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 86 }).toBuffer();
        fs.writeFileSync(path.join(root, file), webp);
        sources[p.id] = { name: p.name, articleTitle: summary.title, article: summary.content_urls.desktop.page, image: summary.thumbnail.source, sha256: crypto.createHash('sha256').update(webp).digest('hex') };
      } catch (error) { unresolved.push({ id: p.id, name: p.name, error: error.message }); profiles[p.id] = profile; return; }
    }
    profile.portrait = `/img/journeyman/portraits/${p.id}.webp`;
    profile.cutout = false;
  }
  profiles[p.id] = profile;
}
(async () => {
  const oldProfiles = fs.existsSync(path.join(root, 'src/data/journeyman-profiles.json')) ? read('src/data/journeyman-profiles.json') : {};
  const missing = careers.filter(p => !oldProfiles[p.id]?.portrait);
  // Batch biography thumbnails to avoid making one summary request per player.
  for (let i = 0; i < missing.length; i += 50) {
    const url = new URL('https://en.wikipedia.org/w/api.php');
    url.search = new URLSearchParams({ action: 'query', format: 'json', redirects: '1', prop: 'pageimages|pageprops', piprop: 'thumbnail', pithumbsize: '320', titles: missing.slice(i, i + 50).map(p => titles[p.id] || p.name).join('|') });
    try {
      const result = await (await get(url)).json();
      for (const page of Object.values(result.query?.pages || {})) {
        if (!page.thumbnail || page.pageprops?.disambiguation !== undefined) continue;
        const summary = { title: page.title, thumbnail: page.thumbnail, content_urls: { desktop: { page: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replaceAll(' ', '_'))}` } } };
        wikiPages.set(normalize(page.title), summary);
      }
      for (const redirect of [...(result.query?.redirects || []), ...(result.query?.normalized || [])].reverse()) {
        const page = wikiPages.get(normalize(redirect.to));
        if (page) wikiPages.set(normalize(redirect.from), page);
      }
    } catch { /* Summary lookup remains available for missing batch results. */ }
  }
  let index = 0;
  await Promise.all(Array.from({ length: 2 }, async () => { while (index < careers.length) await build(careers[index++]); }));
  fs.writeFileSync(path.join(root, manifestPath), JSON.stringify(sources, null, 2) + '\n');
  fs.writeFileSync(path.join(root, 'src/data/journeyman-profiles.json'), JSON.stringify(Object.fromEntries(Object.entries(profiles).sort()), null, 2) + '\n');
  console.log(JSON.stringify({ players: careers.length, portraits: Object.values(profiles).filter(p => p.portrait).length, unresolved }, null, 2));
  if (unresolved.length) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
