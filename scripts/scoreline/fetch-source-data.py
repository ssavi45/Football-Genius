"""Fetch raw historical sources used by build-dataset.py. No runtime network dependency."""
import json,time,urllib.request
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
ROOT=Path(__file__).resolve().parents[2]
CACHE=ROOT/'tmp/scoreline';CACHE.mkdir(parents=True,exist_ok=True)
HERE=Path(__file__).resolve().parent
files={
 'international-results.csv':'https://raw.githubusercontent.com/martj42/international_results/master/results.csv',
 'international-goals.csv':'https://raw.githubusercontent.com/martj42/international_results/master/goalscorers.csv',
 'international-shootouts.csv':'https://raw.githubusercontent.com/martj42/international_results/master/shootouts.csv',
}
leagues={'ucl':'uefa.champions','epl':'eng.1','laliga':'esp.1','bundesliga':'ger.1','fa-cup':'eng.fa','europa':'uefa.europa'}
for line in (HERE/'club-modern-curation.txt').read_text(encoding='utf-8-sig').splitlines():
 date,comp,*_=line.split('|');files[f'{comp}-{date}.json']=f'https://site.api.espn.com/apis/site/v2/sports/soccer/{leagues[comp]}/scoreboard?dates={date.replace("-", "")}&limit=100'
def fetch(pair):
 name,url=pair;target=CACHE/name
 if target.exists():return name+' cached'
 for attempt in range(3):
  try:target.write_bytes(urllib.request.urlopen(url,timeout=40).read());return name+' downloaded'
  except Exception:
   if attempt==2:raise
   time.sleep(1)
for result in ThreadPoolExecutor(8).map(fetch,files.items()):print(result)
