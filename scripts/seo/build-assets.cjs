// Generate static social cards and third-party notices without runtime image rendering.
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '../..');
const pages = require(path.join(root, 'src/data/page-seo.json'));
const escape = value => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]);
const svg = content => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">${content}</svg>`);
function wrap(text, max) {
  const lines = [''];
  for (const word of text.split(' ')) {
    if (lines.at(-1).length && lines.at(-1).length + word.length + 1 > max) lines.push(word);
    else lines[lines.length - 1] += (lines.at(-1) ? ' ' : '') + word;
  }
  return lines;
}
async function main() {
  const output = path.join(root, 'public/social');
  await fs.mkdir(output, { recursive: true });
  const logo = await sharp(path.join(root, 'public/branding/footygen-logo.webp')).resize({ width: 260, height: 80, fit: 'inside' }).png().toBuffer();
  for (const page of pages) {
    const layers = [];
    if (page.art) layers.push({ input: await sharp(path.join(root, 'public', page.art)).resize(800, 630, { fit: 'cover', position: 'right' }).png().toBuffer(), left: 400, top: 0 });
    layers.push({ input: svg(`<defs><linearGradient id="wash"><stop offset="0" stop-color="#f7fbff"/><stop offset="0.45" stop-color="#f7fbff"/><stop offset="0.7" stop-color="#f7fbff" stop-opacity=".7"/><stop offset="1" stop-color="#f7fbff" stop-opacity=".15"/></linearGradient></defs><rect width="1200" height="630" fill="url(#wash)"/><circle cx="1150" cy="500" r="250" fill="${page.accent}" opacity=".07"/><path d="M0 621H1200" stroke="${page.accent}" stroke-width="18"/>`) });
    layers.push({ input: logo, left: 64, top: 46 });
    const title = page.path === '/' ? ['Football IQ.', 'Prove yours.'] : wrap(page.title.split(' — ')[0], 22);
    const tagline = wrap(page.tagline, 38);
    layers.push({ input: svg(`<g font-family="Arial, sans-serif"><text x="66" y="182" fill="${page.accent}" font-size="17" font-weight="700" letter-spacing="2">PLAY. THINK. COMPETE.</text>${title.map((line, i) => `<text x="60" y="${266 + i * 73}" fill="${i ? page.accent : '#102345'}" font-size="${title.length > 2 ? 56 : 64}" font-weight="800" letter-spacing="-2">${escape(line)}</text>`).join('')}${tagline.map((line, i) => `<text x="65" y="${title.length > 2 ? 464 + i * 31 : 405 + i * 31}" fill="#526b91" font-size="24">${escape(line)}</text>`).join('')}<text x="65" y="565" fill="#185dd2" font-size="20" font-weight="700">www.footygen.online</text><text x="1135" y="565" fill="#526b91" text-anchor="end" font-size="16">FOOTYGEN</text></g>`) });
    await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#f7fbff' } }).composite(layers).jpeg({ quality: 87, mozjpeg: true }).toFile(path.join(output, `${page.slug}.jpg`));
  }
  const lock = require(path.join(root, 'package-lock.json'));
  const notices = ['FootyGen — third-party software notices', 'Generated from installed production packages and their supplied licence files.', 'These notices do not license FootyGen site artwork, player photographs, club crests or other third-party content.'];
  const packages = [];
  for (const [location, entry] of Object.entries(lock.packages || {})) {
    if (!location || entry.dev) continue;
    let info;
    try { info = JSON.parse(await fs.readFile(path.join(root, location, 'package.json'), 'utf8')); } catch { continue; }
    const files = (await fs.readdir(path.join(root, location))).filter(file => /^(?:licen[cs]e|notice)(?:\.|$)/i.test(file));
    const texts = [];
    for (const file of files) { try { texts.push(await fs.readFile(path.join(root, location, file), 'utf8')); } catch {} }
    notices.push(`\n${'='.repeat(72)}\n${info.name} ${info.version}\nLicence: ${typeof info.license === 'string' ? info.license : JSON.stringify(info.license || 'See package notices')}\n${texts.join('\n\n') || 'See the upstream package for licence terms.'}`);
    packages.push({ name: info.name, version: info.version, licence: typeof info.license === 'string' ? info.license : 'See notices' });
  }
  await fs.mkdir(path.join(root, 'public/legal'), { recursive: true });
  await fs.writeFile(path.join(root, 'public/legal/third-party-notices.txt'), notices.join('\n\n') + '\n');
  const direct = require(path.join(root, 'package.json')).dependencies;
  await fs.writeFile(path.join(root, 'src/data/third-party-packages.json'), JSON.stringify(packages.filter(item => direct[item.name]), null, 2) + '\n');
  console.log(`Social cards: ${pages.length} static JPEGs (1200 × 630). Software notices: ${packages.length} packages.`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
