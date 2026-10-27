"""Resize original generated artwork, never the reference screenshot.
One-time preparation; Pillow is not an application dependency.
"""
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[2]
manifest_path = root / 'assets/images/home/provenance.json'
manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
sizes = {'scoreline': (1200, 706), 'portrait': (256, 256),
         'scouts-duel': (1200, 334), 'scorecard-frame': (720, 320)}
for asset in manifest['assets']:
    source = Path(asset['source'])
    output = root / asset['output']
    image = Image.open(source).convert('RGBA' if asset['name'] == 'scorecard-frame' else 'RGB')
    size = sizes.get(asset['name'], (512, 512))
    image = ImageOps.fit(image, size, Image.Resampling.LANCZOS,
                        centering=(.5, .12) if asset['name'] == 'scouts-duel' else (.5, .5))
    image.save(output, 'WEBP', quality=92, method=6)
    asset.update(width=size[0], height=size[1], bytes=output.stat().st_size,
                 sourceSha256=hashlib.sha256(source.read_bytes()).hexdigest(),
                 sha256=hashlib.sha256(output.read_bytes()).hexdigest())
    print(output.relative_to(root), size, output.stat().st_size)
manifest_path.write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
