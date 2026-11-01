// Import data and factual identity mappings, never the web game's UI artwork.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const ref = process.argv[2] || 'web-nextjs';
if (!/^[\w./-]+$/.test(ref) || ref.startsWith('-')) throw Error('Invalid source ref');
const read = file => JSON.parse(execFileSync('git', ['show', `${ref}:${file}`], { cwd: root, encoding: 'utf8', maxBuffer: 20_000_000 }));
const snapshot = read('src/data/higher-lower-snapshot.json');
const portraits = read('public/img/higher-lower/asset-sources.json').portraits;
const clubBadges = read('public/img/higher-lower/club-badges.json');
const images = read('src/data/image-assets.json');
const aliases = { van_dijk: 'vandijk', silva: 'bernardo', joao_neves: 'joaoneves' };
const portraitByName = new Map(portraits.filter(p => p.alpha && !p.error).map(p => [p.name, p]));
const identityPortraits = {};
const used = new Set(Object.values(clubBadges));
for (const player of snapshot.players) {
  const name = aliases[player.id] || player.id;
  const portrait = portraitByName.get(name);
  if (!portrait) throw Error(`Missing reviewed portrait: ${player.id}`);
  const file = `/img/higher-lower/players/${name}.png`;
  identityPortraits[player.id] = `${file}?v=${portrait.sha256.slice(0, 12)}`;
  used.add(file); used.add(player.nationalityFlag);
}
const optimized = Object.fromEntries(Object.entries(images).filter(([src]) => used.has(src)));
const revision = execFileSync('git', ['rev-parse', ref], { cwd: root, encoding: 'utf8' }).trim();
const output = path.join(root, 'assets/data');
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(path.join(output, 'higher_lower_snapshot.json'), JSON.stringify(snapshot));
fs.writeFileSync(path.join(output, 'higher_lower_media.json'), JSON.stringify({ sourceRevision: revision, portraits: identityPortraits, clubBadges, optimized }));
console.log(`Imported ${snapshot.players.length} players, ${Object.keys(identityPortraits).length} portraits and ${Object.keys(optimized).length} optimized identity mappings from ${revision}.`);
