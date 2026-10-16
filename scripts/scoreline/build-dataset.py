import csv,json,re,unicodedata,collections
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
CACHE=ROOT/'tmp/scoreline'
HERE=Path(__file__).resolve().parent

def norm(x):
 x=unicodedata.normalize('NFKD',x).encode('ascii','ignore').decode().lower()
 for a,b in [('as monaco','monaco'),('fc porto','porto'),('atletico de madrid','atletico madrid'),('ajax amsterdam','ajax'),('mainz 05','mainz'),('deportivo alaves','alaves'),('deportivo la coruna','deportivo')]: x=x.replace(a,b)
 return re.sub('[^a-z0-9]','',x)
def slug(x):return re.sub('[^a-z0-9]+','-',unicodedata.normalize('NFKD',x).encode('ascii','ignore').decode().lower()).strip('-')
competitions={k:{'id':k,'name':name,'kind':kind,'banner':'/img/backgrounds/ucl_wembley_banner.png' if k=='ucl' else f'/img/scoreline/banners/{k}.webp'} for k,name,kind in [
 ('ucl','UEFA Champions League','club'),('epl','Premier League','club'),('laliga','La Liga','club'),('bundesliga','Bundesliga','club'),('fa-cup','FA Cup','club'),('europa','UEFA Europa League','club'),('world-cup','FIFA World Cup','international'),('euro','UEFA European Championship','international'),('copa-america','Copa America','international')]}
existing={'Real Madrid':'rmcf','Barcelona':'fcb','Manchester United':'manu','Manchester City':'mancity','Liverpool':'lfc','Arsenal':'afc','Chelsea':'cfc','Tottenham Hotspur':'spurs','Everton':'efc','Bayern Munich':'bayern','Bayer Leverkusen':'leverkusen','Borussia Dortmund':'bvb','Eintracht Frankfurt':'frankfruit','AC Milan':'acmilan','Internazionale':'inter','AS Roma':'asroma','Juventus':'juve','Ajax':'ajax','FC Porto':'porto','AS Monaco':'monaco','Atletico Madrid':'atletico','Atalanta':'atalanta','Aston Villa':'aston_villa','Celtic':'celtic','Marseille':'marseille','Benfica':'benfica','Paris Saint-Germain':'psg','Crystal Palace':'palace','Queens Park Rangers':'qpr','West Ham United':'whu'}
extra_ids={'Reims':'3243','Sampdoria':'2734','Steaua Bucharest':'484'}
team_ids={}
for path in CACHE.glob('*.json'):
 for e in json.loads(path.read_text(encoding='utf-8')).get('events',[]):
  for c in e['competitions'][0]['competitors']:team_ids[norm(c['team']['displayName'])]=c['team']['id']
team_ids.update({norm(k):v for k,v in extra_ids.items()})
iso={'Algeria':'dz','Argentina':'ar','Belgium':'be','Brazil':'br','Chile':'cl','Colombia':'co','Croatia':'hr','Czech Republic':'cz','Denmark':'dk','England':'gb-eng','France':'fr','Germany':'de','Ghana':'gh','Greece':'gr','Honduras':'hn','Hungary':'hu','Iceland':'is','Italy':'it','Japan':'jp','Mexico':'mx','Morocco':'ma','Netherlands':'nl','Nigeria':'ng','Paraguay':'py','Peru':'pe','Portugal':'pt','Romania':'ro','Russia':'ru','Saudi Arabia':'sa','Senegal':'sn','Serbia':'rs','Slovakia':'sk','South Korea':'kr','Spain':'es','Sweden':'se','Switzerland':'ch','Turkey':'tr','Uruguay':'uy','Wales':'gb-wls'}
teams={};downloads={}
def team(name,kind):
 key=slug(name)
 if key in teams:return key
 if kind=='international':
  emblem=f'/img/scoreline/flags/{iso[name]}.png';downloads[emblem]='https://flagcdn.com/w320/'+iso[name]+'.png'
 else:
  emblem=f'/img/scoreline/teams/{key}.png'
  if name in existing:downloads[emblem]='local:public/img/teams/'+existing[name]+'.png'
  else:
   tid=team_ids.get(norm(name));assert tid,('No club ID',name)
   downloads[emblem]='https://a.espncdn.com/i/teamlogos/soccer/500/'+tid+'.png'
 teams[key]={'id':key,'name':name,'kind':kind,'emblem':emblem}
 return key

def scorer_hint(scorers,total):
 counts=collections.Counter((name,side) for name,side in scorers)
 assert counts,'No scoring evidence'
 (name,side),count=counts.most_common(1)[0]
 suffix={2:'scored a brace',3:'scored a hat-trick',4:'scored four times',5:'scored five times'}.get(count,'was among the goalscorers') if count<total else 'was among the goalscorers'
 text=f'{name} {suffix}. This is only part of the scoring story.'
 return text,{'name':name,'team':side,'minimumGoals':count if count<total else 1}

def add(date,comp,stage,home,away,hs,aws,fact,scorers,venue,source,extra=False,shootout=None):
 kind=competitions[comp]['kind'];h=team(home,kind);a=team(away,kind);total=hs+aws
 h2,evidence=scorer_hint([(n, h if t==home else a) for n,t in scorers],total)
 # Total-goal clues are used only when several score allocations remain possible.
 if total>=4 and evidence['minimumGoals']<total:
  h3=f'There were {total} goals in the match, excluding any penalty shoot-out.';constraint={'type':'total','value':total}
 elif hs==aws:
  h3='The teams were level before any penalty shoot-out.';constraint={'type':'draw'}
 else:
  winner=home if hs>aws else away
  h3=f'{winner} finished ahead on the scoreboard before any shoot-out.';constraint={'type':'winner','team':h if hs>aws else a}
 year=int(date[:4]);label='European Cup' if comp=='ucl' and year<1993 else 'UEFA Cup' if comp=='europa' and year<2010 else competitions[comp]['name']
 matches.append({'id':f'{date}-{comp}-{h}-{a}','date':date,'competition':comp,'competitionLabel':label,'kind':kind,'era':'classic' if year<2000 else 'modern','stage':stage,'homeTeam':h,'awayTeam':a,'venue':venue,'score':{'home':hs,'away':aws},'extraTime':extra,'shootoutWinner':shootout,'hints':[fact,h2,h3],'scorerEvidence':evidence,'finalHintConstraint':constraint,'sources':source})

matches=[]
results=list(csv.DictReader(open(CACHE/'international-results.csv',encoding='utf-8')))
goals=list(csv.DictReader(open(CACHE/'international-goals.csv',encoding='utf-8')))
shootouts=list(csv.DictReader(open(CACHE/'international-shootouts.csv',encoding='utf-8')))
goal_index=collections.defaultdict(list)
for g in goals:goal_index[(g['date'],g['home_team'],g['away_team'])].append(g)
shoot_index={(r['date'],r['home_team'],r['away_team']):r['winner'] for r in shootouts}
for line in (HERE/'international-curation.txt').read_text(encoding='utf-8-sig').splitlines():
 year,comp,a,b,stage,fact=line.split('|')
 if b=='Yugoslavia':b='Serbia'
 hits=[r for r in results if r['date'].startswith(year) and set([r['home_team'],r['away_team']])==set([a,b]) and (r['tournament']=='FIFA World Cup' if comp=='world-cup' else r['tournament']=='UEFA Euro' if comp=='euro' else r['tournament'].startswith('Copa Am'))]
 r=sorted(hits,key=lambda r:r['date'])[-1];key=(r['date'],r['home_team'],r['away_team'])
 gs=goal_index[key]
 names=[(g['scorer'],g['team']) for g in gs if g['own_goal']=='FALSE' and g['scorer']]
 assert len(gs)==int(r['home_score'])+int(r['away_score']),('International goal tally mismatch',key)
 extra=any(float(g['minute'])>90 for g in gs if g['minute']) or (key in shoot_index and comp!='copa-america')
 add(r['date'],comp,stage,r['home_team'],r['away_team'],int(r['home_score']),int(r['away_score']),fact,names,r['city']+', '+r['country'],['https://github.com/martj42/international_results'],extra,shoot_index.get(key))
 # Historical team names retain the source's canonical IDs but get period-correct display data.
 if r['date']=='2000-06-25':
  teams['yugoslavia']={'id':'yugoslavia','name':'Yugoslavia','kind':'international','emblem':'/img/scoreline/flags/yugoslavia.svg'}
  m=matches[-1]
  for k in ['homeTeam','awayTeam']:
   if m[k]=='serbia':m[k]='yugoslavia'
  if m['scorerEvidence']['team']=='serbia':m['scorerEvidence']['team']='yugoslavia'
  if m['finalHintConstraint'].get('team')=='serbia':m['finalHintConstraint']['team']='yugoslavia'
 for key2 in ['homeTeam','awayTeam']:
  if matches[-1][key2]=='germany' and int(year)<1991:
   teams['west-germany']={**teams['germany'],'id':'west-germany','name':'West Germany'}
   matches[-1][key2]='west-germany'
   if matches[-1]['scorerEvidence']['team']=='germany':matches[-1]['scorerEvidence']['team']='west-germany'
   if matches[-1]['finalHintConstraint'].get('team')=='germany':matches[-1]['finalHintConstraint']['team']='west-germany'
   matches[-1]['hints'][2]=matches[-1]['hints'][2].replace('Germany','West Germany')

for line in (HERE/'club-classic-curation.txt').read_text(encoding='utf-8-sig').splitlines():
 date,h,a,hs,aws,scorer,count,venue,fact=line.split('|')
 # Only one named scorer is used. It is intentionally a subset of the score sheet.
 add(date,'ucl','Final replay' if date=='1974-05-17' else 'Final',h,a,int(hs),int(aws),fact,[(scorer,h)]*int(count),venue,['https://www.uefa.com/uefachampionsleague/history/seasons/'+str(int(date[:4])-1)+'/matches/'],date[:4] in ['1968','1992'])

manual={
 '2000-05-24':(3,0,'Stade de France, Saint-Denis',[('Fernando Morientes','Real Madrid')],False,None,['https://www.uefa.com/uefachampionsleague/news/0250-0c50f0fdc7d5-05a4f8a460bd-1000--1999-2000-madrid-on-top-of-spain-and-europe/']),
 '2001-05-23':(1,1,'San Siro, Milan',[('Gaizka Mendieta','Valencia')],True,'Bayern Munich',['https://www.uefa.com/uefachampionsleague/match/67752--bayern-vs-valencia/']),
 '2001-02-25':(6,1,'Old Trafford, Manchester',[('Dwight Yorke','Manchester United')]*3+[('Thierry Henry','Arsenal')],False,None,['https://www.manutd.com/en/mutv/videos/detail/man-utd-6-arsenal-1-extended-highlights-premier-league-2000-01']),
 '2001-05-12':(1,2,'Millennium Stadium, Cardiff',[('Michael Owen','Liverpool')]*2+[('Freddie Ljungberg','Arsenal')],False,None,['https://www.liverpoolfc.com/news/first-team/185092-on-this-day-owen-wins-the-fa-cup']),
 '2001-05-16':(5,4,'Westfalenstadion, Dortmund',[('Javi Moreno','Alaves')]*2+[('Steven Gerrard','Liverpool')],True,None,['https://www.uefa.com/uefaeuropaleague/match/67741/']),
}
for line in (HERE/'club-modern-curation.txt').read_text(encoding='utf-8-sig').splitlines():
 date,comp,a,b,stage,fact=line.split('|')
 if date in manual:
  hs,aws,venue,scorers,extra,shoot,source=manual[date];add(date,comp,stage,a,b,hs,aws,fact,scorers,venue,source,extra,shoot);continue
 events=json.loads((CACHE/f'{comp}-{date}.json').read_text(encoding='utf-8'))['events']
 hits=[e for e in events if set(norm(t['team']['displayName']) for t in e['competitions'][0]['competitors'])==set([norm(a),norm(b)])]
 assert len(hits)==1,('Missing event',date,a,b)
 e=hits[0];c=e['competitions'][0];home=next(t for t in c['competitors'] if t['homeAway']=='home');away=next(t for t in c['competitors'] if t['homeAway']=='away')
 h=a if norm(home['team']['displayName'])==norm(a) else b;aw=b if h==a else a
 details=[d for d in c.get('details',[]) if d.get('scoringPlay') and not d.get('shootout')]
 hs=int(home['score']);aws=int(away['score'])
 assert len(details)==hs+aws,('Club goal tally mismatch',date,len(details),hs,aws)
 scorers=[(d['athletesInvolved'][0]['displayName'],h if d['team']['id']==home['id'] else aw) for d in details if not d.get('ownGoal') and d.get('athletesInvolved')]
 venue=c.get('venue',{});address=venue.get('address',{});location=venue.get('fullName',address.get('city',''))
 if address.get('city') and address['city'] not in location:location+=', '+address['city']
 extra='extra' in c['status']['type'].get('description','').lower() or 'extra' in c['status']['type'].get('detail','').lower() or c['status'].get('period',2)>2
 shoot=next((h if t['homeAway']=='home' else aw for t in c['competitors'] if t.get('winner') and hs==aws),None)
 add(date,comp,stage,h,aw,hs,aws,fact,scorers,location,[f'https://www.espn.com/soccer/match/_/gameId/{e["id"]}'],extra,shoot)
assert len(matches)==200,len(matches)
assert len({m['id'] for m in matches})==200
out={'schemaVersion':1,'scoreConvention':'Final score after extra time; penalty shoot-outs excluded.','competitions':competitions,'teams':teams,'matches':sorted(matches,key=lambda m:m['date'])}
(ROOT/'src/data/scoreline-matches.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(CACHE/'asset-downloads.json').write_text(json.dumps(downloads,indent=2),encoding='utf-8')
print('Matches',len(matches),'Kinds',dict(collections.Counter(m['kind'] for m in matches)),'Eras',dict(collections.Counter(m['era'] for m in matches)))
print('Competitions',dict(collections.Counter(m['competition'] for m in matches)))
print('Asset downloads',len(downloads))
