// Apply researched crest sources. No generated artwork or unrelated-club fallback.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');
const root = path.resolve(__dirname, '../..');
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const write = (p, value) => fs.writeFileSync(path.join(root, p), JSON.stringify(value, null, 2) + '\n');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

// Remove only an edge-connected opaque backdrop; retain enclosed white artwork.
async function transparentSource(bytes) {
  const { data, info } = await sharp(bytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const corners = [0, info.width - 1, (info.height - 1) * info.width, info.height * info.width - 1];
  if (corners.some(i => data[i * 4 + 3] < 200)) return { data, info };
  const background = [0, 1, 2].map(channel => Math.round(corners.reduce((sum, i) => sum + data[i * 4 + channel], 0) / 4));
  // Avoid erasing an artwork whose edge is not a uniform light backdrop.
  if (Math.min(...background) < 140 || corners.some(i => background.some((v, c) => Math.abs(v - data[i * 4 + c]) > 35))) return { data, info };
  const visited = new Uint8Array(info.width * info.height);
  const queue = [];
  const add = i => {
    if (i < 0 || i >= visited.length || visited[i]) return;
    visited[i] = 1;
    if (background.some((v, c) => Math.abs(v - data[i * 4 + c]) > 35)) return;
    data[i * 4 + 3] = 0; queue.push(i);
  };
  for (let x = 0; x < info.width; x++) { add(x); add((info.height - 1) * info.width + x); }
  for (let y = 0; y < info.height; y++) { add(y * info.width); add(y * info.width + info.width - 1); }
  for (let index = 0; index < queue.length; index++) {
    const i = queue[index];
    if (i % info.width) add(i - 1);
    if ((i + 1) % info.width) add(i + 1);
    add(i - info.width); add(i + info.width);
  }
  return { data, info };
}

async function main() {
  const corrections = read('scripts/journeyman/badge-corrections.json');
  const catalog = read('src/data/journeyman-clubs.json');
  const manifest = read('public/img/journeyman/asset-sources.json');
  const review = read('scripts/journeyman/import-review.json');
  review.resolvedClubBadges ||= {};
  review.unavailableClubBadges ||= {};
  for (const [id, item] of Object.entries(corrections)) {
    if (!/^[a-z0-9_-]+$/.test(id)) throw Error(`Invalid club identifier: ${id}`);
    const club = catalog[id] ||= { id, canonicalName: item.label, displayName: item.label, country: null, providerIds: {} };
    // Old IDs included demonstrably unrelated clubs; don't carry them forward.
    club.providerIds = {};
    if (!item.image) {
      club.badge = null;
      club.badgeUnavailable = true;
      club.badgeProvenance = { clubId: id, source: 'No reliable crest located; render the club name as text', sourceUrl: item.pageUrl, unavailable: true, researchNote: item.note };
      manifest[id] = { ...club.badgeProvenance, localPath: null };
      review.unavailableClubBadges[id] = { supportingPageUrl: item.pageUrl, note: item.note };
      const fabricatedAsset = path.join(root, 'public/img/journeyman/clubs', `${id}.webp`);
      if (fs.existsSync(fabricatedAsset)) fs.unlinkSync(fabricatedAsset);
      continue;
    }
    const cache = path.join(root, 'tmp/journeyman/corrections', item.rawFile);
    let bytes;
    if (fs.existsSync(cache)) bytes = fs.readFileSync(cache);
    else {
      const response = await fetch(item.image, { signal: AbortSignal.timeout(25000) });
      if (!response.ok) throw Error(`${id}: HTTP ${response.status}`);
      bytes = Buffer.from(await response.arrayBuffer());
    }
    if (hash(bytes) !== item.sourceSha256) throw Error(`${id}: researched source bytes changed; review before replacing`);
    const original = await sharp(bytes).metadata();
    const { data, info } = await transparentSource(bytes);
    const art = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).trim().resize(164, 164, { fit: 'inside' }).png().toBuffer();
    const bounds = await sharp(art).metadata();
    const output = await sharp({ create: { width: 180, height: 180, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: art, left: Math.floor((180 - bounds.width) / 2), top: Math.floor((180 - bounds.height) / 2) }]).webp({ quality: 92, alphaQuality: 100 }).toBuffer();
    club.badge = `img/journeyman/clubs/${id}.webp`;
    delete club.badgeUnavailable;
    club.badgeProvenance = {
      clubId: id, label: club.displayName, source: item.source,
      sourceUrl: item.image, supportingPageUrl: item.pageUrl, sourceSha256: item.sourceSha256,
      originalWidth: original.width, originalHeight: original.height, originalFormat: original.format,
      finalWidth: 180, finalHeight: 180, artworkWidth: bounds.width, artworkHeight: bounds.height,
      byteSize: output.length, sha256: hash(output), ...(item.note ? { note: item.note } : {}),
    };
    fs.writeFileSync(path.join(root, 'public', club.badge), output);
    manifest[id] = { ...club.badgeProvenance, localPath: club.badge };
    review.resolvedClubBadges[id] = { sha256: hash(output), sourceUrl: item.image, supportingPageUrl: item.pageUrl };
  }
  write('src/data/journeyman-clubs.json', catalog);
  write('public/img/journeyman/asset-sources.json', manifest);
  write('scripts/journeyman/import-review.json', review);
  console.log(`${Object.values(corrections).filter(c => c.image).length} sourced crest assets normalized; unavailable historical crests use explicit text.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
