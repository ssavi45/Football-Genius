import json,urllib.request,shutil,time
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
root=Path(__file__).resolve().parents[2];cache=root/'tmp/scoreline/assets';cache.mkdir(exist_ok=True)
items=json.loads((root/'tmp/scoreline/asset-downloads.json').read_text(encoding='utf-8'))
def fetch(pair):
 target,url=pair;path=cache/(Path(target).parent.name+'-'+Path(target).name)
 if path.exists():return
 try:
  if url.startswith('local:'):shutil.copyfile(root/url[6:],path)
  else:
   request=urllib.request.Request(url,headers={'User-Agent':'FootballGenius/1.0 (asset preparation)'})
   path.write_bytes(urllib.request.urlopen(request,timeout=35).read())
 except Exception as e:print('FAILED',target,url,str(e))
list(ThreadPoolExecutor(8).map(fetch,items.items()))
print('Downloaded',len(list(cache.glob('*.png'))),'assets')
