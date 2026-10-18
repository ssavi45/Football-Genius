// Local rectangular flag assets for national teams absent from the shared set.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const countries = {
  iran: 'ir', zimbabwe: 'zw', paraguay: 'py', peru: 'pe', trinidad_and_tobago: 'tt',
  togo: 'tg', mali: 'ml', northern_ireland: 'gb-nir', liberia: 'lr', romania: 'ro',
};
async function main() {
  const manifestPath = path.join(root, 'public/img/journeyman/flag-sources.json');
  const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : {};
  for (const [name, code] of Object.entries(countries)) {
    const sourceUrl = `https://flagcdn.com/w80/${code}.png`;
    const response = await fetch(sourceUrl, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw Error(`${name}: HTTP ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    const localPath = `img/country/${name}.png`;
    fs.writeFileSync(path.join(root, 'public', localPath), bytes);
    manifest[name] = { sourceUrl, localPath, sha256: crypto.createHash('sha256').update(bytes).digest('hex') };
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
    console.log(name);
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
