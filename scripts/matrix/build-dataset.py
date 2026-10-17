"""Rebuild Matrix from captured senior appearances, honours and reviewed records.

No network calls and no writes to Higher or Lower data. Unknown values stay null.
"""
import argparse
from collections import Counter, defaultdict
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'scripts/higher-lower'))
from normalize import EXCLUDED_COMPETITION_TYPES, YOUTH_OR_RESERVE, career_totals, integer

CACHE = ROOT / 'tmp/matrix/honours'
OUTPUT_DIR = ROOT / 'tmp/matrix'
TOP5_LEAGUES = {'GB1', 'ES1', 'L1', 'IT1', 'FR1'}
TOP_FLIGHT_LEAGUE_ACHIEVEMENTS = {
    'Spanish champion', 'English Champion', 'German Champion', 'Italian champion',
    'French champion', 'Portuguese champion', 'Dutch champion', 'Croatian champion',
    'Turkish champion', 'Belgian champion', 'Austrian champion', 'Russian champion',
    'Ukrainian champion', 'Scottish champion', 'Swiss champion', 'Greek champion',
    'Danish champion', 'Polish champion', 'Czech champion', 'Serbian champion',
    'Slovak champion', 'Norwegian champion', 'Brazilian champion', 'Argentinian champion',
    'MLS Cup Champion', 'Saudi Arabian champion', 'Qatari champion', 'Chinese champion',
    'Japanese champion', 'South Korean champion', 'Mexican Champion Apertura',
    'Mexican Clausura champion', 'Colombian Champion', 'Ecuadorian champion',
    'Uruguayan champion', 'Moroccan champion', 'Armenian champion', 'Israeli champion',
}


def read(path):
    return json.loads(path.read_text(encoding='utf-8'))


def moment(value):
    return datetime.fromisoformat(value.replace('Z', '+00:00'))


def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + '.tmp')
    temp.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    temp.replace(path)


def load_catalog():
    return json.loads(subprocess.check_output(
        ['node', str(ROOT / 'scripts/matrix/export-catalog.cjs')], cwd=ROOT, text=True, encoding='utf-8'))


def played_matches(source, cutoff):
    """One shared filter for league-season discovery and published appearance facts."""
    captured = min(moment(source['fetchedAt']), cutoff)
    seen = set()
    for row in source.get('performance', []):
        info = row['gameInformation']
        if row['statistics']['generalStatistics'].get('participationState') != 'played':
            continue
        team_id = str(row['clubsInformation']['club']['clubId'])
        team = source.get('clubs', {}).get(team_id, {})
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
        game_id = info.get('gameId')
        if (not completed or info.get('isLiveGame') or info.get('isGamePostponed')
                or not date or moment(date) > captured or game_id is None):
            continue
        key = str(game_id)
        if key in seen:
            continue
        seen.add(key)
        yield row, team_id, national, team


def award_year(award):
    """seasonId is a season START, not necessarily the award's calendar year."""
    cyclical = str(award.get('season', {}).get('cyclicalName', ''))
    if cyclical.isdigit() and len(cyclical) == 4:
        return int(cyclical)
    display = str(award.get('season', {}).get('display', ''))
    if display.isdigit() and len(display) == 4:
        return int(display)
    return None


def collect_honours(capture, player_id, provider_id, records, cutoff):
    if str(capture.get('playerId')) != str(provider_id):
        raise ValueError('Honours identity mismatch: ' + player_id)
    honours, ucl, leagues, details, rejected = set(), {}, {}, defaultdict(list), []
    for award in capture.get('data', {}).get('achievements', []):
        info = award.get('details', {})
        if info.get('playerId') and str(info['playerId']) != str(provider_id):
            raise ValueError('Achievement belongs to a different player: ' + player_id)
        name, start = award.get('name', ''), award.get('seasonId')
        team_id = str(info.get('clubId'))
        year = award_year(award)
        if year is not None and year > cutoff.year:
            rejected.append({'name': name, 'seasonId': start, 'reason': 'future award year'})
            continue
        if name == 'UEFA Champions League winner':
            expected = records['uclWinningClubsBySeasonStart'].get(str(start))
            if expected == team_id and isinstance(start, int) and start >= 1992:
                # All reviewed winning editions in this registry finished before the cutoff.
                ucl[start] = team_id
                honours.add('ucl')
                details['ucl'].append(award)
            else:
                rejected.append({'name': name, 'seasonId': start, 'teamId': team_id, 'reason': 'winner/edition not verified by registry'})
        elif name == 'World Cup winner':
            editions = [year] if year else [start, start + 1 if isinstance(start, int) else None]
            edition = next((edition for edition in editions if records['worldCupWinningTeamsByEdition'].get(str(edition)) == team_id), None)
            if edition:
                honours.add('world_cup')
                details['world_cup'].append({'edition': edition, 'award': award})
            else:
                rejected.append({'name': name, 'seasonId': start, 'reason': 'winning national team/edition not verified'})
        elif name == "Winner Ballon d'Or":
            if year in records['ballonDorWinnerYearsByPlayer'].get(player_id, []):
                honours.add('ballon_dor')
                details['ballon_dor'].append({'year': year, 'award': award})
            else:
                rejected.append({'name': name, 'seasonId': start, 'reason': 'individual winner/year not verified'})
        elif name == 'Copa Am\u00e9rica winner':
            if year is not None and year <= cutoff.year and info.get('competitionId') in {'COPA', 'CA16'}:
                honours.add('copa_america')
                details['copa_america'].append(award)
        if name in TOP_FLIGHT_LEAGUE_ACHIEVEMENTS and isinstance(start, int) and start <= cutoff.year:
            # Different competitions/clubs can award separate titles in the same year.
            key = (name, info.get('competitionId'), start, team_id)
            leagues[key] = award
    return honours, ucl, list(leagues.values()), dict(details), rejected


def satisfies_criterion(player, criterion):
    kind, value = criterion['type'], criterion['value']
    if kind == 'club':
        return value in player['clubs']
    if kind == 'nation':
        return value in player['nations']
    if kind == 'trophy':
        return value in player['honours']
    number = player['stats'].get(value)
    return integer(number) is not None and criterion.get('minimum', 0) <= number <= criterion.get('maximum', float('inf'))


def compute_eligibility(dataset, players):
    catalog = load_catalog()
    groups = {kind: [c for c in catalog if c['type'] == kind] for kind in ['club', 'nation']}
    milestones = [c for c in catalog if c['type'] in {'stat', 'trophy'}]
    eligible = {c['id']: {p['id'] for p in players if satisfies_criterion(p, c)} for c in catalog}
    standalone = {c['id']: {'label': c['label'], 'type': c['type'],
        'count': len(eligible[c['id']]), 'candidates': sorted(eligible[c['id']])} for c in catalog}
    def pairs(first, second, same=False):
        result = {}
        for i, a in enumerate(first):
            for j, b in enumerate(second):
                if same and j <= i:
                    continue
                candidates = sorted(eligible[a['id']] & eligible[b['id']])
                result[a['id'] + '|' + b['id']] = {'count': len(candidates), 'candidates': candidates}
        return result
    index = {'version': dataset['version'], 'totalPlayers': len(players), 'criteria': catalog,
        'standalone': standalone, 'clubNationPairs': pairs(groups['club'], groups['nation']),
        'clubMilestonePairs': pairs(groups['club'], milestones), 'milestonePairs': pairs(milestones, milestones, True)}
    write(OUTPUT_DIR / 'matrix-eligibility.json', index)
    return index


def build():
    snapshot = read(ROOT / 'src/data/higher-lower-snapshot.json')
    cutoff = moment(snapshot['createdAt'])
    records = read(ROOT / 'scripts/matrix/verified-records.json')
    # Discover top-flight club-seasons using ONLY completed, played senior league matches.
    top5_seasons = {}
    for player in snapshot['players']:
        source = read(ROOT / 'tmp/higher-lower/source' / (player['id'] + '.json'))
        for row, team_id, national, _ in played_matches(source, cutoff):
            info = row['gameInformation']
            if not national and info.get('competitionId') in TOP5_LEAGUES:
                top5_seasons[(team_id, info.get('seasonId'))] = {
                    'gameId': str(info['gameId']), 'competition': info['competitionId'],
                    'date': info['date']['dateTimeUTC']}
    ranking = {row['id']: 1 + sum(other['goals'] > row['goals'] for other in records['uclScorers'])
               for row in records['uclScorers']}
    ranked_goals = {row['id']: row['goals'] for row in records['uclScorers']}
    players, teams, evidence = [], {}, {}
    captures = [snapshot['createdAt']]
    for index, player in enumerate(snapshot['players'], 1):
        pid = player['id']
        source = read(ROOT / 'tmp/higher-lower/source' / (pid + '.json'))
        if str(source['profile']['id']) != str(player['transfermarktId']):
            raise ValueError('Appearance identity mismatch: ' + pid)
        captures.append(source['fetchedAt'])
        career = career_totals(source['performance'], source['clubs'], min(cutoff, moment(source['fetchedAt'])))
        clubs, nations, top5 = set(), set(), {}
        competitions, missing_competitions = Counter(), set()
        seasons, breakdown = Counter(), defaultdict(Counter)
        missing_season_goals = 0
        captain_count, captain_unknown, captain_games = 0, 0, []
        club_evidence, nation_evidence = defaultdict(list), defaultdict(list)
        for row, team_id, national, team in played_matches(source, cutoff):
            info, stats = row['gameInformation'], row['statistics']
            comp, season = info.get('competitionId'), info.get('seasonId')
            goal = integer(stats.get('goalStatistics', {}).get('goalsScoredTotal'))
            match = {'gameId': str(info['gameId']), 'date': info['date']['dateTimeUTC'],
                     'competition': comp, 'seasonId': season}
            teams[team_id] = {'name': team['name'], 'badge': team.get('crestUrl'), 'national': national}
            if national:
                nations.add(team_id); nation_evidence[team_id].append(match)
                captain = stats['generalStatistics'].get('isCaptain')
                if captain is True:
                    captain_count += 1; captain_games.append({**match, 'teamId': team_id})
                elif captain is not False:
                    captain_unknown += 1
            else:
                clubs.add(team_id); club_evidence[team_id].append(match)
                if goal is None:
                    missing_season_goals += 1
                else:
                    seasons[(team_id, season)] += goal
                    breakdown[(team_id, season)][comp] += goal
                if (team_id, season) in top5_seasons:
                    top5[team_id] = {'seasonId': season, 'appearance': match,
                                    'leagueEvidence': top5_seasons[(team_id, season)]}
                if comp in {'CL', 'GB1'} and isinstance(season, int) and season >= 1992:
                    if goal is None:
                        missing_competitions.add(comp)
                    else:
                        competitions[comp] += goal
        best_key = max(seasons, key=seasons.get) if seasons else None
        best = {'clubId': best_key[0], 'seasonId': best_key[1], 'totalGoals': seasons[best_key],
                'competitions': dict(breakdown[best_key])} if best_key else None
        honours_capture = read(CACHE / (pid + '.json'))
        captures.append(honours_capture['fetchedAt'])
        honours, ucl, league_awards, honour_evidence, rejected = collect_honours(
            honours_capture, pid, player['transfermarktId'], records, cutoff)
        statistics = {
            'goals': career['goals'], 'assists': career['assists'],
            'caps': career['coverage']['international']['appearances'],
            'uclGoals': None if 'CL' in missing_competitions else competitions['CL'],
            'plGoals': None if 'GB1' in missing_competitions else competitions['GB1'],
            'uclTitles': len(ucl), 'maxSeasonGoals': None if missing_season_goals else seasons[best_key] if best_key else None,
            'uclAllTimeRank': ranking.get(pid),
            'seniorCaptainAppearances': None if captain_unknown else captain_count,
            'leagueTitles': len(league_awards), 'topFiveLeagueClubs': len(top5),
        }
        # Prefer an explicit scoped global UEFA total over an incomplete career match list.
        if pid in ranked_goals:
            statistics['uclGoals'] = ranked_goals[pid]
        players.append({'id': pid, 'name': player['name'], 'sourceName': player['sourceName'],
            'nationality': player['nationality'], 'nationalityFlag': player['nationalityFlag'],
            'club': 'Retired' if player['isRetired'] else player['club'],
            'clubs': sorted(clubs), 'nations': sorted(nations), 'honours': sorted(honours),
            'stats': statistics, 'sourceUrl': player['sourceUrl']})
        evidence[pid] = {
            'identity': {'id': pid, 'name': player['name'], 'transfermarktId': player['transfermarktId'],
                         'dateOfBirth': source['profile'].get('dateOfBirth'), 'sourceUrl': player['sourceUrl']},
            'fetchedAt': {'appearances': source['fetchedAt'], 'honours': honours_capture['fetchedAt']},
            'scope': 'Recorded completed senior competitive club + full-A matches; not an independent certification of complete career coverage.',
            'coverage': career['coverage'], 'clubsEvidence': dict(club_evidence),
            'nationsEvidence': dict(nation_evidence), 'honoursEvidence': honour_evidence,
            'rejectedAchievements': rejected, 'leagueTitlesEvidence': league_awards,
            'statsEvidence': {
                'goals': {'value': statistics['goals'], 'scope': 'Recorded senior club + full-A internationals', 'sourceUrl': player['sourceUrl']},
                'assists': {'value': statistics['assists'], 'scope': 'Recorded senior club + full-A internationals', 'sourceUrl': player['sourceUrl']},
                'caps': {'value': statistics['caps'], 'scope': 'Recorded full-A appearances', 'sourceUrl': player['sourceUrl']},
                'uclTitles': {'value': statistics['uclTitles'], 'seasons': sorted(ucl), 'sourceUrl': player['sourceUrl']},
                'leagueTitles': {'value': statistics['leagueTitles'], 'editionCount': len(league_awards), 'sourceUrl': player['sourceUrl']},
                'plGoals': {'value': statistics['plGoals'], 'scope': 'GB1 main league, seasons starting 1992 onwards', 'sourceUrl': player['sourceUrl']},
                'maxSeasonGoals': {'value': statistics['maxSeasonGoals'], 'bestRecordedSeason': best,
                                  'missingClubGoalRows': missing_season_goals},
                'seniorCaptainAppearances': {'value': statistics['seniorCaptainAppearances'],
                    'missingCaptainRows': captain_unknown, 'matches': captain_games, 'scope': 'Count across recorded full-A appearances'},
                'topFiveLeagueClubs': {'value': len(top5), 'clubs': top5},
                'uclAllTimeRank': {'value': ranking.get(pid), 'sourceUrl': records['sources']['uclScorers'],
                    'asOf': records['uclScorersEffectiveDate'], 'scope': records['uclScorersScope'],
                    'knownOutsideTop15': pid not in ranking},
                'uclGoals': {'value': statistics['uclGoals'], 'method': 'UEFA global table' if pid in ranked_goals else 'Recorded CL main-competition matches'},
            }}
        if index % 100 == 0:
            print('Processed Matrix players: ' + str(index), flush=True)
    payload = {'teams': teams, 'players': players}
    digest = hashlib.sha256(json.dumps(payload, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()).hexdigest()[:12]
    updated = max(moment(t) for t in captures).isoformat().replace('+00:00', 'Z')
    dataset = {'version': 'matrix-' + digest, 'updatedAt': updated,
        'source': {'name': 'Transfermarkt captured records, with reviewed UEFA/FIFA corrections',
            'adapter': snapshot['source']['adapter'], 'url': snapshot['source']['url'],
            'asOf': snapshot['createdAt'], 'uclRankingAsOf': records['uclScorersEffectiveDate'],
            'coverage': 'Recorded source history; unknowns preserved; see Matrix evidence and audit notes.'},
        **payload}
    # Prepare evidence and eligibility successfully before replacing the gameplay snapshot.
    compute_eligibility(dataset, players)
    write(OUTPUT_DIR / 'matrix-evidence.json', {'version': dataset['version'], 'snapshotCutoff': snapshot['createdAt'],
        'sources': records['sources'], 'players': evidence})
    write(ROOT / 'src/data/matrix-players.json', dataset)
    print('Matrix rebuilt: ' + dataset['version'] + ', ' + str(len(players)) + ' players', flush=True)
    return dataset


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args()
    build()
