// Apply explicit researched corrections, retaining original evidence for audit.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const write = (name, data) => fs.writeFileSync(path.join(root, name), JSON.stringify(data, null, 2) + '\n');
const data = read('src/data/journeyman-careers.json');
const catalog = read('src/data/journeyman-clubs.json');
const corrections = read('scripts/journeyman/career-corrections.json');
const evidence = read('tmp/journeyman/career-evidence.json');
const changed = [];
for (const player of data.players) {
  const patch = corrections.players[player.id];
  if (patch) {
    player.clubs = structuredClone(patch.clubs);
    player.sourceIds = [...new Set([...player.sourceIds, ...patch.sources.map(s => s.id)])];
    changed.push(player.id);
    const record = evidence.players.find(p => p.id === player.id);
    record.sourceIds = player.sourceIds;
    record.researchedCorrection = { note: patch.note, sourceIds: patch.sources.map(s => s.id) };
    for (const source of patch.sources) if (!evidence.sources.some(s => s.id === source.id)) evidence.sources.push({ ...source, description: patch.note });
  }
  for (const stint of player.clubs) {
    if (!catalog[stint.clubId]) throw Error(`Missing club ${stint.clubId}`);
    stint.logo = catalog[stint.clubId].badge;
  }
}
data.stats.totalStints = data.players.reduce((total, p) => total + p.clubs.length, 0);
data.stats.distinctClubs = new Set(data.players.flatMap(p => p.clubs.map(c => c.clubId))).size;
write('src/data/journeyman-careers.json', data);
write('tmp/journeyman/career-evidence.json', evidence);
console.log(`Applied ${changed.length} researched career corrections and synchronized crest references.`);
