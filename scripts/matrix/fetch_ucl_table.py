"""Export the reviewed, scoped UEFA top-15 registry; never mix European Cup eras.

This supersedes the former unscoped Wikipedia scraper. Updating the ranking
requires reviewing the official source in verified-records.json, including
players outside the app roster. No network scraping or gameplay writes occur.
"""
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
if __name__ == '__main__':
    records = json.loads((ROOT / 'scripts/matrix/verified-records.json').read_text(encoding='utf8'))
    rows = records['uclScorers']
    result = {'sourceUrl': records['sources']['uclScorers'], 'asOf': records['uclScorersEffectiveDate'],
              'scope': records['uclScorersScope'], 'players': [dict(row, uclAllTimeRank=1 + sum(other['goals'] > row['goals'] for other in rows)) for row in rows]}
    output = ROOT / 'tmp/matrix/all_ucl_scorers.json'
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, indent=2) + '\n', encoding='utf8')
    print(str(output))
