"""Summarize the versioned captain evidence produced by the canonical builder.

Use build-dataset.py for source normalization and validate-dataset.py for checks.
This avoids applying a second, divergent senior-appearance filter.
"""
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
if __name__ == '__main__':
    data = json.loads((ROOT / 'src/data/matrix-players.json').read_text(encoding='utf8'))
    evidence = json.loads((ROOT / 'tmp/matrix/matrix-evidence.json').read_text(encoding='utf8'))
    assert data['version'] == evidence['version'], 'Rebuild stale evidence first'
    counts = {p['id']: p['stats']['seniorCaptainAppearances'] for p in data['players']}
    print(json.dumps({'datasetVersion': data['version'],
        'eligibleCaptains': sum(v is not None and v > 0 for v in counts.values()),
        'unknown': sum(v is None for v in counts.values()),
        'topRecordedCounts': sorted(((k, v) for k, v in counts.items() if v is not None and v > 0), key=lambda item: -item[1])[:30]}, indent=2))
