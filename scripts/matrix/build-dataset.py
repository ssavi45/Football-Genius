"""Build Matrix evidence from recorded senior appearances and sourced honours.

python scripts/matrix/build-dataset.py --fetch-honours
Source responses are cached separately; never modifies Higher or Lower data.
"""
import argparse
import asyncio
from collections import Counter
from datetime import datetime, timezone
import json
import hashlib
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'scripts/higher-lower'))
from normalize import EXCLUDED_COMPETITION_TYPES, YOUTH_OR_RESERVE

CACHE = ROOT / 'tmp/matrix/honours'
HONOURS = {'World Cup winner': 'world_cup', 'UEFA Champions League winner': 'ucl',
           'Winner Ballon d\'Or': 'ballon_dor', 'Copa América winner': 'copa_america'}


async def collect(players, refresh=False):
    from transfermarkt_api import Transfermarkt
    from sync import PoliteTransport
    CACHE.mkdir(parents=True, exist_ok=True)
    async with Transfermarkt(max_concurrency=1, transport=PoliteTransport(.5), timeout=30) as tm:
        for index, player in enumerate(players, 1):
            path = CACHE / (player['id'] + '.json')
            if refresh or not path.exists():
                data = await tm._client.player_achievements(player['transfermarktId'])
                path.write_text(json.dumps({'playerId': player['transfermarktId'], 'sourceUrl': player['sourceUrl'],
                    'fetchedAt': datetime.now(timezone.utc).isoformat(), 'data': data}, ensure_ascii=False), encoding='utf-8')
            if index % 25 == 0:
                print(f'Honours captured: {index}/{len(players)}', flush=True)


def build(fetch_honours=False, refresh_honours=False):
    snapshot = json.loads((ROOT / 'src/data/higher-lower-snapshot.json').read_text(encoding='utf-8'))
    if fetch_honours or refresh_honours:
        asyncio.run(collect(snapshot['players'], refresh_honours))
    players, teams, captures = [], {}, [snapshot['createdAt']]
    for player in snapshot['players']:
        source = json.loads((ROOT / 'tmp/higher-lower/source' / (player['id'] + '.json')).read_text(encoding='utf-8'))
        if str(source['profile']['id']) != player['transfermarktId']:
            raise ValueError(f'Appearance source identity mismatch for {player["id"]}')
        captured = datetime.fromisoformat(source['fetchedAt'].replace('Z', '+00:00'))
        clubs, nations, competition_goals = set(), set(), Counter()
        unknown_competitions, seen = set(), set()
        for row in source['performance']:
            info = row['gameInformation']
            if row['statistics']['generalStatistics'].get('participationState') != 'played':
                continue
            team_id = str(row['clubsInformation']['club']['clubId'])
            team = source['clubs'].get(team_id, {})
            national = bool(info.get('isNationalGame'))
            details = team.get('baseDetails', {})
            if (details.get('clubTypeId') != 1 or bool(details.get('isNationalTeam')) != national
                    or YOUTH_OR_RESERVE.search(team.get('name', ''))
                    or (not national and info.get('competitionTypeId') in EXCLUDED_COMPETITION_TYPES)):
                continue
            date = info.get('date', {}).get('dateTimeUTC')
            state = info.get('gameState')
            completed = state in {'regularly_terminated', 'finished', 'completed'} or (
                state in {'extra_time', 'penalty_shootout'} and info.get('isGameReportCreated') is True)
            if (not completed or info.get('isLiveGame') or info.get('isGamePostponed') or not date
                    or datetime.fromisoformat(date) > captured or str(info['gameId']) in seen):
                continue
            seen.add(str(info['gameId']))
            (nations if national else clubs).add(team_id)
            teams[team_id] = {'name': team['name'], 'badge': team.get('crestUrl'), 'national': national}
            goals = row['statistics'].get('goalStatistics', {}).get('goalsScoredTotal')
            comp = info['competitionId']
            if goals is None:
                unknown_competitions.add(comp)
            else:
                competition_goals[comp] += goals
        honours_path = CACHE / (player['id'] + '.json')
        if not honours_path.exists():
            raise ValueError(f'Missing honours evidence for {player["id"]}; run --fetch-honours')
        honours_data = json.loads(honours_path.read_text(encoding='utf-8'))
        if honours_data['playerId'] != player['transfermarktId']:
            raise ValueError('Honours identity mismatch')
        captures.append(honours_data['fetchedAt'])
        honours = sorted({HONOURS[a['name']] for a in honours_data['data'].get('achievements', []) if a['name'] in HONOURS})
        players.append({'id': player['id'], 'name': player['name'], 'sourceName': player['sourceName'],
            'nationality': player['nationality'], 'nationalityFlag': player['nationalityFlag'],
            'club': 'Retired' if player['isRetired'] else player['club'],
            'clubs': sorted(clubs), 'nations': sorted(nations), 'honours': honours,
            'stats': {'goals': player['stats']['goals'], 'assists': player['stats']['assists'],
                      'caps': player['coverage']['international']['appearances'],
                      'uclGoals': None if 'CL' in unknown_competitions else competition_goals['CL'],
                      'plGoals': None if 'GB1' in unknown_competitions else competition_goals['GB1']},
            'sourceUrl': player['sourceUrl']})
    digest = hashlib.sha256(json.dumps(players, sort_keys=True).encode()).hexdigest()[:12]
    updated = max(datetime.fromisoformat(t.replace('Z', '+00:00')) for t in captures).isoformat().replace('+00:00', 'Z')
    data = {'version': 'matrix-' + digest, 'updatedAt': updated,
            'source': snapshot['source'], 'teams': teams, 'players': players}
    output = ROOT / 'src/data/matrix-players.json'
    temporary = output.with_suffix('.json.tmp')
    temporary.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    temporary.replace(output)
    print(f'Matrix dataset: {len(players)} players, {len(teams)} teams', flush=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--fetch-honours', action='store_true')
    parser.add_argument('--refresh-honours', action='store_true', help='Fetch new evidence even when a cached capture exists')
    args = parser.parse_args()
    build(args.fetch_honours, args.refresh_honours)
