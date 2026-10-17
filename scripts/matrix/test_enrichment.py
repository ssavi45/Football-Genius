"""Regression tests for source normalization, independent of network access."""
import copy
import importlib.util
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('matrix_build', ROOT / 'scripts/matrix/build-dataset.py')
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)


class EnrichmentTests(unittest.TestCase):
    def setUp(self):
        self.cutoff = builder.moment('2026-10-16T15:26:04Z')
        self.records = builder.read(ROOT / 'scripts/matrix/verified-records.json')

    def award(self, name, start, club, year=None, competition='CL'):
        return {'name': name, 'seasonId': start, 'season': {'cyclicalName': str(year) if year else '24/25'},
                'details': {'playerId': 1, 'clubId': club, 'competitionId': competition}}

    def collect(self, awards, pid='dembele'):
        return builder.collect_honours({'playerId': 1, 'data': {'achievements': awards}}, pid, 1, self.records, self.cutoff)

    def test_calendar_award_is_not_the_season_start(self):
        award = self.award("Winner Ballon d'Or", 2024, 583, 2025)
        honours, _, _, evidence, rejected = self.collect([award])
        self.assertIn('ballon_dor', honours)
        self.assertEqual(evidence['ballon_dor'][0]['year'], 2025)
        self.assertFalse(rejected)
        award['season']['cyclicalName'] = '2024'
        self.assertNotIn('ballon_dor', self.collect([award])[0])

    def test_recent_ucl_titles_count_once_each_and_invalid_editions_do_not(self):
        a = self.award('UEFA Champions League winner', 2024, 583)
        b = self.award('UEFA Champions League winner', 2025, 583)
        wrong = self.award('UEFA Champions League winner', 2023, 583)
        honours, titles, _, _, rejected = self.collect([a, a, b, wrong])
        self.assertIn('ucl', honours)
        self.assertEqual(len(titles), 2)
        self.assertEqual(len(rejected), 1)

    def test_world_cup_uses_the_actual_edition(self):
        self.assertIn('world_cup', self.collect([self.award('World Cup winner', 2025, 3375, 2026)])[0])
        self.assertNotIn('world_cup', self.collect([self.award('World Cup winner', 2025, 3377, 2026)])[0])
        self.assertNotIn('world_cup', self.collect([self.award('World Cup winner', 2029, 3375, 2030)])[0])

    def test_league_titles_use_competition_club_and_season_not_year_alone(self):
        a = self.award('English Champion', 2025, 31, competition='GB1')
        b = self.award('French champion', 2025, 583, competition='FR1')
        self.assertEqual(len(self.collect([a, a, b])[2]), 2)

    def test_wrong_player_achievement_is_rejected(self):
        award = self.award('World Cup winner', 2025, 3375, 2026)
        award['details']['playerId'] = 2
        with self.assertRaises(ValueError):
            self.collect([award])

    def test_only_played_completed_in_scope_appearances_prove_a_club(self):
        row = {'gameInformation': {'gameId': 1, 'isNationalGame': False,
                'gameState': 'finished', 'date': {'dateTimeUTC': '2026-01-01T00:00:00Z'}},
               'clubsInformation': {'club': {'clubId': 31}},
               'statistics': {'generalStatistics': {'participationState': 'played'}}}
        source = {'fetchedAt': '2026-10-16T15:26:04Z', 'performance': [row],
                  'clubs': {'31': {'name': 'Liverpool', 'baseDetails': {'clubTypeId': 1, 'isNationalTeam': False}}}}
        self.assertEqual(len(list(builder.played_matches(source, self.cutoff))), 1)
        for change in [dict(gameState='not_started'), dict(isLiveGame=True), dict(isGamePostponed=True),
                       dict(date={'dateTimeUTC': '2027-01-01T00:00:00Z'})]:
            changed = copy.deepcopy(source)
            changed['performance'][0]['gameInformation'].update(change)
            self.assertFalse(list(builder.played_matches(changed, self.cutoff)))
        # An invalid duplicate must not hide a later valid row of the same match.
        invalid = copy.deepcopy(row)
        invalid['statistics']['generalStatistics']['participationState'] = 'bench'
        source['performance'] = [invalid, row, row]
        self.assertEqual(len(list(builder.played_matches(source, self.cutoff))), 1)
        source['clubs']['31']['name'] = 'Liverpool U21'
        self.assertFalse(list(builder.played_matches(source, self.cutoff)))


if __name__ == '__main__':
    unittest.main()
