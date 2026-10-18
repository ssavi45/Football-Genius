// Build autocomplete index merging all verified identities independently of career question eligibility.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const normalize = name => name.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
const directory = [];
// His senior side was the USSR, rather than the modern country of birth.
// https://www.uefa.com/uefaeuro/history/news/0253-0d7b1eabf36c-e920cc9c9e33-1000--1960-yashin-stars/
const nationalTeams = { levyashin: { nationality: 'Soviet Union', nationalityFlag: 'img/country/soviet_union.png' } };

function flagFor(record, nationality) {
  const supplied = record.nationalityFlag;
  const slug = nationality ? nationality.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '_') : '';
  const candidates = [supplied, `img/country/${slug}.png`, `img/countries/${slug}.png`].filter(Boolean);
  return candidates.map(file => `/${file.replace(/^\//, '')}`).find(file => fs.existsSync(path.join(root, 'public', file.slice(1))));
}

function add(record, prefix) {
  const key = normalize(record.name);
  if (!key) return;
  record = { ...record, ...nationalTeams[key] };
  
  // Exact name match on normalized name (handles accents like Pelé vs Pele, Alexis Sánchez vs Alexis Sanchez)
  const existing = directory.find(p => normalize(p.name) === key);
  const aliases = (record.aliases || []).filter(a => normalize(a) !== key);
  const nationality = Array.isArray(record.nationality) ? record.nationality[0] : record.nationality;
  const nationalityFlag = flagFor(record, nationality);
  
  if (existing) {
    existing.aliases = [...new Set([...existing.aliases, ...aliases])].filter(a => normalize(a) !== key);
    existing.nationality ||= nationality;
    existing.nationalityFlag ||= nationalityFlag;
  } else {
    directory.push({
      id: `${prefix}:${record.id || key}`,
      name: record.name,
      aliases: [...new Set(aliases)],
      ...(nationality ? { nationality } : {}),
      ...(nationalityFlag ? { nationalityFlag } : {})
    });
  }
}

// 1. Seed identities from roster & other game modes
for (const p of read('scripts/higher-lower/roster.json')) add(p, 'roster');
if (fs.existsSync(path.join(root, 'src/data/scouts-duel-players.json'))) {
  for (const p of read('src/data/scouts-duel-players.json')) add(p, 'scouts');
}
for (const p of read('src/data/transfer-players.json')) add(p, 'journey');

// 2. Verified 300 Journeyman identities
if (fs.existsSync(path.join(root, 'src/data/journeyman-careers.json'))) {
  const careers = read('src/data/journeyman-careers.json');
  for (const p of careers.players) add(p, 'career');
}

directory.sort((a, b) => a.name.localeCompare(b.name, 'en'));
const output = { schemaVersion: 1, players: directory };
fs.writeFileSync(path.join(root, 'src/data/journeyman-search-players.json'), `${JSON.stringify(output, null, 2)}\n`);
console.log(`Wrote ${directory.length} searchable identities; career eligibility is independent.`);
