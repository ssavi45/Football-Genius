"""Encode original generated game-screen art; never reads a reference screenshot."""
import hashlib
import json
from pathlib import Path
import sys
from PIL import Image

root = Path(__file__).resolve().parents[2]
provenance = []
for asset in json.loads(Path(sys.argv[1]).read_text(encoding='utf-8')):
    source = Path(asset['source'])
    target = root / asset['output']
    with Image.open(source) as image:
        image = image.convert('RGB')
        image.thumbnail((1536, 1024), Image.Resampling.LANCZOS)
        image.save(target, 'WEBP', quality=91, method=6)
        size = image.size
    provenance.append({'asset': asset['output'], 'generator': 'built-in image_gen',
        'referenceImagesUsed': False, 'prompt': asset['prompt'], 'size': size,
        'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
        'bytes': target.stat().st_size, 'packaging': 'Aspect-preserving downscale and WebP encoding; no cropping.'})
    print(f'{asset["output"]}: {size}, {target.stat().st_size} bytes')
(root / 'docs/higher-lower-duel-art.json').write_text(json.dumps(provenance, indent=2) + '\n', encoding='utf-8')
