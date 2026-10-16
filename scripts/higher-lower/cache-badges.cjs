/** Cache the seed snapshot's club crests locally; future unfamiliar clubs retain their source URL. */
const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');

async function main() {
  const snapshot = JSON.parse(await fs.readFile(path.join(root, 'src/data/higher-lower-snapshot.json'), 'utf8'));
  const manifestPath = path.join(root, 'public/img/higher-lower/club-badges.json');
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const clubs = new Map(snapshot.players.filter(p => p.clubId && p.clubBadge).map(p => [p.clubId, p.clubBadge]));
  for (const player of snapshot.players) for (const move of player.transfers) {
    for (const club of [move.from, move.to]) clubs.set(club.id, club.crest);
  }
  const directory = path.join(root, 'public/img/higher-lower/clubs');
  await fs.mkdir(directory, { recursive: true });
  for (const [id, source] of clubs) {
    if (!/^\d+$/.test(id)) throw new Error('Invalid club ID');
    if (manifest[id]) {
      try { await fs.access(path.join(directory, `${id}.png`)); continue; } catch { /* Cache missing. */ }
    }
    const url = new URL(source);
    if (url.protocol !== 'https:' || !['img.a.transfermarkt.technology', 'img.a.transfermarkt.com', 'tmssl.akamaized.net'].includes(url.hostname)) continue;
    const response = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!response.ok) throw new Error(`Club ${id}: HTTP ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > 1_000_000 || !buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) throw new Error(`Club ${id}: invalid PNG`);
    await fs.writeFile(path.join(directory, `${id}.png`), buffer);
    manifest[id] = `/img/higher-lower/clubs/${id}.png`;
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`Cached ${clubs.size} source crests for the 500-player seed snapshot.`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
