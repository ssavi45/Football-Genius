// Download research metadata and original crest sources; never synthesize badges.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const titles = {
  espanyol: 'RCD Espanyol', chester_city: 'Chester City F.C.', brisbane_lions: 'Queensland Lions FC',
  sportul_studentesc: 'FC Sportul Studențesc București', bastia: 'SC Bastia', iwuanyanwu_nationale: 'Heartland F.C.',
  bellmare_hiratsuka: 'Shonan Bellmare', club_america: 'Club América', dallas_burn: 'FC Dallas', junior: 'Atlético Junior',
  cobreandino: 'Trasandino de Los Andes', krylia_sovetov: 'PFC Krylia Sovetov Samara', al_mokawloon: 'Al Mokawloon Al Arab SC',
  inter_zapresic: 'NK Inter Zaprešić', cerezo_osaka: 'Cerezo Osaka', dundee: 'Dundee F.C.', libertad: 'Club Libertad',
  cruz_azul: 'Cruz Azul', south_fl_sun: 'South Florida Sun', miami_sharks: 'Miami Freedom', venezia: 'Venezia FC',
  emelec: 'C.S. Emelec', atletico_nacional: 'Atlético Nacional', america_de_cali: 'América de Cali', racing_paris: 'Racing Club de France Football',
  cortulua: 'Cortuluá', guaros: 'Guaros F.C.', avs: 'AVS Futebol SAD', racing_bafoussam: 'RC Bafoussam', el_jaish: 'El Jaish SC',
  almeria: 'UD Almería', rc_paris: 'Racing Club de France Football', wydad: 'Wydad AC', verdy_kawasaki: 'Tokyo Verdy',
  esteghlal_ardabil: 'Esteghlal Ardabil F.C.', air_force: 'ROK Air Force FC',
  portuguesa_ve: 'Portuguesa F.C.', noroeste: 'Esporte Clube Noroeste', fast_clube: 'Nacional Fast Clube', burnley: 'Burnley F.C.',
  nacional_am: 'Nacional Futebol Clube', nueve_de_octubre: '9 de Octubre F.C.',
};
async function main() {
  const directory = path.join(root, 'tmp/journeyman/corrections');
  fs.mkdirSync(directory, { recursive: true });
  const researchPath = path.join(directory, 'club-research.json');
  const results = fs.existsSync(researchPath) ? JSON.parse(fs.readFileSync(researchPath, 'utf8')) : {};
  const entries = Object.entries(titles);
  for (const [id, title] of entries) {
      if (results[id]?.rawFile) continue;
      try {
        const url = `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replaceAll(' ', '_'))}`;
        const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
        if (!response.ok) throw Error(`HTTP ${response.status}`);
        const html = await response.text();
        fs.writeFileSync(path.join(directory, `${id}.html`), html);
        const infobox = html.match(/<table[^>]*class="[^"]*infobox[\s\S]*?<\/table>/)?.[0] || '';
        const src = infobox.match(/<img[^>]*src="([^"]+)"/)?.[1]?.replaceAll('&amp;', '&');
        const image = src ? (src.startsWith('//') ? `https:${src}` : src) : null;
        results[id] = { title, pageUrl: response.url, image };
        if (image) {
          const asset = await fetch(image, { signal: AbortSignal.timeout(20000) });
          if (!asset.ok) throw Error(`Image HTTP ${asset.status}`);
          const file = `${id}.${new URL(image).pathname.split('.').pop()}`;
          fs.writeFileSync(path.join(directory, file), Buffer.from(await asset.arrayBuffer()));
          results[id].rawFile = file;
        }
      } catch (error) { results[id] = { ...results[id], error: error.message }; }
      fs.writeFileSync(researchPath, JSON.stringify(results, null, 2));
      await new Promise(resolve => setTimeout(resolve, 750));
  }
  for (const [id, data] of Object.entries(results)) console.log(id, data.title, data.rawFile || data.error || 'NO IMAGE');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
