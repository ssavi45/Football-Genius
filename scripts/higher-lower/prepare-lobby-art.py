"""Package independently generated lobby artwork; never reads the reference image."""
import hashlib
import json
from pathlib import Path
import sys
from PIL import Image

root = Path(__file__).resolve().parents[2]
items = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
provenance = []
for item in items:
    source = Path(item['source'])
    target = root / item['output']
    target.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as image:
        image = image.convert('RGB')
        width = 1536 if item['name'] == 'hero' else 1024 if item['name'] != 'turf' else 768
        image.thumbnail((width, width * 3), Image.Resampling.LANCZOS)
        image.save(target, 'WEBP', quality=91, method=6)
        size = image.size
    provenance.append({'asset': item['output'], 'generator': 'built-in image_gen',
        'referenceImagesUsed': False, 'prompt': item['prompt'],
        'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
        'packaging': 'Aspect-preserving downscale and WebP encoding; no cropping or compositing.',
        'size': size, 'bytes': target.stat().st_size})
    print(f'{target.relative_to(root)}: {size}, {target.stat().st_size} bytes')
(root / 'docs/higher-lower-lobby-art.json').write_text(json.dumps(provenance, indent=2) + '\n', encoding='utf-8')
