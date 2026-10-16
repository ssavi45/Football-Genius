/** Rebuild the local, reviewed portrait collection without changing player identities or images. */
const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash } = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const PNG = Buffer.from([137,80,78,71,13,10,26,10]);
function hasAlpha(buffer) {
  if ([4,6].includes(buffer[25])) return true;
  for (let offset=8; offset+12<=buffer.length;) {
    const size=buffer.readUInt32BE(offset);
    if (buffer.toString('ascii',offset+4,offset+8)==='tRNS') return true;
    offset+=size+12;
  }
  return false;
}

async function main() {
  const manifestPath = path.join(root, 'public/img/higher-lower/asset-sources.json');
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const directory = path.join(root, 'public/img/higher-lower/players');
  await fs.mkdir(directory, {recursive:true});
  for (const portrait of manifest.portraits) {
    if (portrait.error || !portrait.url) throw new Error(`Unresolved portrait: ${portrait.name}`);
    if (!/^[a-z_]+$/.test(portrait.name)) throw new Error('Invalid portrait ID');
    const url = new URL(portrait.url);
    if (url.protocol !== 'https:' || !['ratings-images-prod.pulse.ea.com', 'game-assets.fut.gg'].includes(url.hostname)) throw new Error('Unapproved portrait source');
    const target = path.join(directory, `${portrait.name}.png`);
    let buffer;
    try { buffer = await fs.readFile(target); } catch { /* Fetch missing cached portraits. */ }
    const missing = !buffer;
    if (!buffer) {
      const response = await fetch(url, {signal:AbortSignal.timeout(20000)});
      if (!response.ok) throw new Error(`${portrait.name}: HTTP ${response.status}`);
      buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length > 2_000_000 || !buffer.subarray(0,8).equals(PNG)) throw new Error(`${portrait.name}: invalid PNG`);
      await new Promise(r=>setTimeout(r,150));
    }
    if (!buffer.subarray(0,8).equals(PNG)) throw new Error(`${portrait.name}: corrupt cache`);
    const digest = createHash('sha256').update(buffer).digest('hex');
    if (portrait.sha256 && portrait.sha256 !== digest) throw new Error(`${portrait.name}: source/cache changed; review the portrait before replacing it`);
    portrait.sha256 = digest;
    portrait.width = buffer.readUInt32BE(16);
    portrait.height = buffer.readUInt32BE(20);
    if (portrait.width < 120 || portrait.height < 120 || !hasAlpha(buffer)) throw new Error(`${portrait.name}: expected a transparent headshot`);
    portrait.alpha = true;
    if (missing) await fs.writeFile(target,buffer);
  }
  await fs.writeFile(manifestPath, JSON.stringify(manifest,null,2)+'\n');
  console.log(`Verified ${manifest.portraits.length} local transparent portraits.`);
}
main().catch(error=>{console.error(error.message);process.exitCode=1});
