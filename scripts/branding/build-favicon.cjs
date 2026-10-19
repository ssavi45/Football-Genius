/** Build browser and touch icons from the supplied square artwork.
 * Usage: node scripts/branding/build-favicon.cjs <source-image>
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');
const root = path.resolve(__dirname, '../..');
const input = process.argv[2];
if (!input) throw new Error('Provide the source image path.');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

(async () => {
  const original = fs.readFileSync(path.resolve(input));
  const sourceVersion = hash(original).slice(0, 12);
  const version = hash(Buffer.from(sourceVersion + ':rounded-corners-22-v1')).slice(0, 12);
  const dir = path.join(root, 'public/branding');
  const archive = path.join(root, 'tmp/branding');
  fs.mkdirSync(dir, { recursive: true });
  fs.mkdirSync(archive, { recursive: true });
  fs.writeFileSync(path.join(archive, 'favicon-' + sourceVersion + '.png'), original);
  // Mask before downsampling so small icons retain smooth transparent corners.
  const square = await sharp(original).autoOrient()
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const rounded = await sharp(square).composite([{
    input: Buffer.from('<svg width="512" height="512"><rect width="512" height="512" rx="113" fill="white"/></svg>'),
    blend: 'dest-in',
  }]).png().toBuffer();
  const render = size => sharp(rounded)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 }).toBuffer();
  const frames = await Promise.all([16, 32, 48].map(render));
  const header = Buffer.alloc(6 + 16 * frames.length);
  header.writeUInt16LE(1, 2); header.writeUInt16LE(frames.length, 4);
  let offset = header.length;
  frames.forEach((frame, i) => {
    const entry = 6 + 16 * i, size = [16, 32, 48][i];
    header[entry] = size; header[entry + 1] = size;
    header.writeUInt16LE(1, entry + 4); header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(frame.length, entry + 8); header.writeUInt32LE(offset, entry + 12);
    offset += frame.length;
  });
  const ico = Buffer.concat([header, ...frames]);
  fs.writeFileSync(path.join(root, 'public/favicon.ico'), ico);
  const icons = [{ url: '/favicon.ico', type: 'image/x-icon', sizes: '16x16 32x32 48x48', bytes: ico.length, sha256: hash(ico) }];
  for (const [i, size] of [16, 32].entries()) {
    const url = `/branding/favicon-${size}x${size}.png`;
    fs.writeFileSync(path.join(root, 'public', url), frames[i]);
    icons.push({ url, type: 'image/png', sizes: `${size}x${size}`, bytes: frames[i].length, sha256: hash(frames[i]) });
  }
  const touch = await render(180), touchUrl = '/branding/apple-touch-icon.png';
  fs.writeFileSync(path.join(root, 'public', touchUrl), touch);
  const manifest = { version, source: `User-supplied ${path.basename(input)}`, cornerRadius: '22%',
    icon: icons, apple: { url: touchUrl, type: 'image/png', sizes: '180x180', bytes: touch.length, sha256: hash(touch) } };
  fs.writeFileSync(path.join(dir, 'favicon-assets.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(JSON.stringify(manifest, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
