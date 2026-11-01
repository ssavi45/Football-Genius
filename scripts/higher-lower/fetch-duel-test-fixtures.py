"""Fetch reviewed identity images from the game's media manifest for visual tests."""
import hashlib
import json
from pathlib import Path
import urllib.parse
import urllib.request

root = Path(__file__).resolve().parents[2]
snapshot = json.loads((root / 'assets/data/higher_lower_snapshot.json').read_text(encoding='utf-8'))
media = json.loads((root / 'assets/data/higher_lower_media.json').read_text(encoding='utf-8'))
target = root / 'test/fixtures/higher_lower'
target.mkdir(parents=True, exist_ok=True)
entries = []
for player in snapshot['players']:
    if player['id'] not in ('guerreiro', 'dembele'):
        continue
    sources = [('portrait', media['portraits'][player['id']]), ('flag', player['nationalityFlag'])]
    if player['id'] == 'dembele':
        sources.append(('club', media['clubBadges'].get(player['clubId'], player['clubBadge'])))
    for kind, source in sources:
        path = source.split('?')[0]
        optimized = media['optimized'].get(path)
        width = 512 if kind == 'portrait' else 96
        if optimized:
            sizes = optimized[1]
            size = next((value for value in sizes if value >= width), sizes[-1])
            url = f'https://www.footygen.online/img/optimized/{optimized[0]}-{size}.webp'
        else:
            url = urllib.parse.urljoin('https://www.footygen.online', source)
        suffix = Path(urllib.parse.urlparse(url).path).suffix
        filename = f'{player["id"]}_{kind}{suffix}'
        with urllib.request.urlopen(url, timeout=20) as response:
            content = response.read()
        (target / filename).write_bytes(content)
        entries.append({'source': path, 'fixture': filename, 'url': url,
            'sha256': hashlib.sha256(content).hexdigest(), 'bytes': len(content)})
(target / 'provenance.json').write_text(json.dumps(entries, indent=2) + '\n', encoding='utf-8')
print(f'Downloaded {len(entries)} reviewed identity fixtures; no screenshot assets used.')
