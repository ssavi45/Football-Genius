import copy
from datetime import datetime, timezone
import json
from pathlib import Path
import unittest

from normalize import SCHEMA_VERSION, career_totals, transfer_history, normalize_player, identity, integer, make_snapshot, money, validate_continuity, validate_players

NOW = datetime(2026, 10, 16, tzinfo=timezone.utc)
CLUBS = {
    "1": {"name": "First Team FC", "baseDetails": {"clubTypeId": 1}},
    "2": {"name": "First Team FC II", "baseDetails": {"clubTypeId": 2}},
    "3": {"name": "First Team FC U21", "baseDetails": {"clubTypeId": 1}},
    "4": {"name": "England", "baseDetails": {"clubTypeId": 1, "isNationalTeam": True}},
    "5": {"name": "England U21", "baseDetails": {"clubTypeId": 3, "isNationalTeam": True}},
    "6": {"name": "England Olympic Team", "baseDetails": {"clubTypeId": 14, "isNationalTeam": True}},
    "7": {"name": "Republic of Ireland", "baseDetails": {"clubTypeId": 1, "isNationalTeam": True}},
}


def appearance(game_id="1", goals=1, assists=0, club="1", competition_type=1, **info):
    return {"gameInformation": {"gameId": game_id, "competitionId": "TEST", "competitionTypeId": competition_type,
             "seasonId": 2026, "gameState": "regularly_terminated", "date": {"dateTimeUTC": "2026-10-15T18:00:00+00:00"}, **info},
            "clubsInformation": {"club": {"clubId": club}},
            "statistics": {"generalStatistics": {"participationState": "played"},
                           "goalStatistics": {"goalsScoredTotal": goals, "assists": assists}}}


class TotalsTests(unittest.TestCase):
    def test_duplicate_captures_never_add_a_match_twice(self):
        match = appearance(goals=3, assists=2)
        totals = career_totals([match, copy.deepcopy(match), appearance("2", goals=0, assists=1)], CLUBS, NOW)
        self.assertEqual((totals["goals"], totals["assists"], totals["coverage"]["appearances"]), (3, 3, 2))

    def test_only_completed_senior_first_team_club_matches_count(self):
        excluded = [appearance(str(kind), competition_type=kind) for kind in [7, 11, 15, 16, 17, 18, 19, 20, 23]]
        excluded += [appearance("reserve", club="2"), appearance("u21", club="3"),
                     appearance("live", isLiveGame=True), appearance("cancelled", gameState="cancelled"),
                     appearance("unknown", gameState=None), appearance("future", date={"dateTimeUTC": "2026-11-01T18:00:00+00:00"})]
        totals = career_totals([appearance("valid", goals=2, assists=1), *excluded], CLUBS, NOW)
        self.assertEqual((totals["goals"], totals["assists"], totals["coverage"]["appearances"]), (2, 1, 1))

    def test_unknown_assists_are_not_zero_and_do_not_corrupt_known_goals(self):
        totals = career_totals([appearance(assists=None), appearance("2", goals=2, assists=1)], CLUBS, NOW)
        self.assertEqual(totals["goals"], 3)
        self.assertIsNone(totals["assists"])
        self.assertEqual(totals["coverage"]["missingAssists"], 1)
        self.assertEqual(career_totals([appearance(goals=0, assists=0)], CLUBS, NOW)["assists"], 0)

    def test_no_recorded_matches_is_unknown(self):
        totals = career_totals([], CLUBS, NOW)
        self.assertIsNone(totals["goals"])
        self.assertIsNone(totals["assists"])

    def test_career_combines_club_full_a_qualifiers_and_international_friendlies(self):
        matches = [appearance("club", goals=10, assists=4),
                   appearance("finals", goals=2, assists=1, club="4", competition_type=11, isNationalGame=True),
                   appearance("qualifier", goals=1, assists=2, club="4", competition_type=19, isNationalGame=True),
                   appearance("friendly", goals=3, assists=1, club="4", competition_type=11, isNationalGame=True)]
        totals = career_totals(matches, CLUBS, NOW)
        self.assertEqual((totals["goals"], totals["assists"]), (16, 8))
        self.assertEqual(totals["coverage"]["club"]["goals"], 10)
        self.assertEqual(totals["coverage"]["international"]["goals"], 6)
        self.assertEqual(totals["coverage"]["international"]["appearances"], 3)
        self.assertEqual(totals["coverage"]["scope"], "recorded-senior-career-matches")

    def test_youth_olympic_unclassified_and_inconsistent_national_records_are_excluded(self):
        excluded = [appearance("youth", club="5", competition_type=11, isNationalGame=True),
                    appearance("olympic", club="6", competition_type=11, isNationalGame=True),
                    appearance("unknown", club="999", isNationalGame=True),
                    appearance("club-as-country", club="1", isNationalGame=True),
                    appearance("country-as-club", club="4", isNationalGame=False)]
        totals = career_totals([appearance("club", goals=2), *excluded], CLUBS, NOW)
        self.assertEqual(totals["goals"], 2)
        self.assertEqual(totals["coverage"]["international"]["appearances"], 0)

    def test_counts_all_senior_nationalities_once_without_bench_or_duplicate_matches(self):
        ireland = appearance("ireland", goals=1, assists=2, club="7", competition_type=11, isNationalGame=True)
        bench = appearance("bench", club="4", isNationalGame=True)
        bench["statistics"]["generalStatistics"]["participationState"] = "on_bench"
        totals = career_totals([ireland, copy.deepcopy(ireland), bench,
                               appearance("england", goals=2, club="4", competition_type=19, isNationalGame=True)], CLUBS, NOW)
        self.assertEqual((totals["goals"], totals["assists"], totals["coverage"]["appearances"]), (3, 2, 2))
        self.assertEqual(totals["coverage"]["excluded"]["duplicate"], 1)

    def test_missing_international_statistics_invalidate_only_the_affected_career_metric(self):
        totals = career_totals([appearance(goals=10, assists=5),
                               appearance("country", goals=2, assists=None, club="4", isNationalGame=True)], CLUBS, NOW)
        self.assertEqual(totals["goals"], 12)
        self.assertIsNone(totals["assists"])
        self.assertEqual(totals["coverage"]["club"]["assists"], 5)
        self.assertIsNone(totals["coverage"]["international"]["assists"])
        self.assertEqual(totals["coverage"]["missingAssists"], 1)

    def test_completed_extra_time_and_shootouts_count_without_shootout_kicks(self):
        final = appearance("final", goals=2, assists=0, club="4", competition_type=11,
                           isNationalGame=True, gameState="penalty_shootout", isGameReportCreated=True)
        final["statistics"]["goalStatistics"]["penaltyShooterGoalsScored"] = 1
        extra = appearance("extra", goals=1, assists=1, gameState="extra_time", isGameReportCreated=True)
        live = appearance("live-extra", goals=1, gameState="extra_time", isGameReportCreated=True, isLiveGame=True)
        unconfirmed = appearance("no-report", gameState="extra_time", isGameReportCreated=False)
        totals = career_totals([final, extra, live, unconfirmed], CLUBS, NOW)
        self.assertEqual((totals["goals"], totals["assists"], totals["coverage"]["appearances"]), (3, 1, 2))
        self.assertEqual(totals["coverage"]["international"]["goals"], 2)

    def test_club_only_or_inconsistent_career_breakdowns_cannot_publish(self):
        source = Path(__file__).resolve().parents[2] / 'src/data/higher-lower-snapshot.json'
        original = json.loads(source.read_text(encoding='utf-8'))['players']
        for mutate in [lambda p: p['coverage'].update(scope='recorded-senior-club-matches'),
                       lambda p: p['stats'].update(goals=p['stats']['goals'] + 1),
                       lambda p: p['coverage']['international'].update(appearances=-1),
                       lambda p: p['coverage']['club'].update(missingAssists=1)]:
            players = copy.deepcopy(original)
            mutate(players[0])
            with self.assertRaises(ValueError):
                validate_players(players)

    def test_currency_units_and_name_diacritics(self):
        self.assertEqual(money({"value": 1_500_000, "currency": "EUR"}), 1_500_000)
        self.assertIsNone(money({"value": 1_500_000, "currency": "GBP"}))
        self.assertIsNone(integer(True))
        self.assertEqual(identity("Martin Ødegaard"), identity("Martin Odegaard"))
        self.assertEqual(identity("João Neves"), identity("Joao Neves"))

    def test_specific_transfers_preserve_routes_and_fees_without_loans_unknown_or_duplicates(self):
        clubs = {str(i): {"name": f"Club {i}", "crestUrl": f"https://example.org/{i}.png", "baseDetails": {"clubTypeId": 1}} for i in [1, 2, 3]}
        def move(id, fee, source="1", destination="2", **extra):
            return {"id": id, "fee": fee, "date": "2020-01-01", "season": "19/20", "transferType": "transfer",
                    "clubFrom": {"id": source, "name": f"Club {source}"}, "clubTo": {"id": destination, "name": f"Club {destination}"}, **extra}
        moves = [move("first", 10), move("second", 20, "2", "3"), move("duplicate", 10),
                 move("loan", 50, transferType="loan"), move("unknown", None), move("future", 40, date="2099-01-01"),
                 move("free", None, "3", "1", transferType="freeTransfer"), move("no-club", 0, "515"), move("internal", 0, "1", "1")]
        history = transfer_history(moves, clubs, "2026-10-16")
        self.assertEqual([t["fee"] for t in history], [10, 20, 0])
        self.assertEqual(history[1]["from"]["id"], "2")
        self.assertEqual(history[1]["to"]["id"], "3")
        self.assertEqual(history[0]["season"], "19/20")

    def test_normalization_uses_current_valuation_and_excludes_retired_or_unvalued(self):
        data = {"profile": {"id": "1", "name": "Test", "club": {"id": "1", "name": "Club"}, "isRetired": False, "position": {}},
                "rawPlayer": {"marketValueDetails": {"highest": {"value": 100_000_000, "currency": "EUR"}, "current": {"value": 10_000_000, "currency": "EUR", "determined": "2026-10-01"}}},
                "performance": [], "transfers": [], "clubs": {}, "competitions": {}, "fetchedAt": "2026-10-16T00:00:00Z"}
        seed = {"id": "test", "name": "Test", "image": "img/test.png", "nationality": "Test", "nationalityFlag": "img/flag.png"}
        player = normalize_player(seed, data)
        self.assertEqual(player["stats"]["marketValue"], 10_000_000)
        self.assertEqual(player["marketValueDate"], "2026-10-01")
        data["profile"]["isRetired"] = True
        self.assertIsNone(normalize_player(seed, data)["stats"]["marketValue"])
        data["profile"]["isRetired"] = False
        data["rawPlayer"]["marketValueDetails"]["current"]["value"] = 0
        self.assertIsNone(normalize_player(seed, data)["stats"]["marketValue"])

    def test_incomplete_and_duplicate_rosters_cannot_publish(self):
        with self.assertRaises(ValueError):
            validate_players([])
        player = {"id": "one", "transfermarktId": "1", "name": "One", "sourceUrl": "https://example.org",
                  "coverage": {"appearances": 1}, "stats": {key: 1 for key in ["goals", "assists", "marketValue", "transfer"]},
                  "isRetired": False}
        with self.assertRaises(ValueError):
            validate_players([player, player], expected_count=2)

    def test_replaying_the_same_captures_keeps_the_immutable_snapshot_identical(self):
        source = Path(__file__).resolve().parents[2] / 'src/data/higher-lower-snapshot.json'
        snapshot = json.loads(source.read_text(encoding='utf-8'))
        self.assertEqual(make_snapshot(snapshot['players']), snapshot)

    def test_truncated_history_is_rejected_but_small_corrections_are_allowed(self):
        old = {'schemaVersion': SCHEMA_VERSION, 'players': [{'name': 'Player', 'transfermarktId': '1',
               'coverage': {'appearances': 500}, 'stats': {'goals': 200, 'assists': 100}}]}
        changed = copy.deepcopy(old)
        changed['players'][0]['stats']['goals'] = 199
        validate_continuity(changed, old)
        changed['players'][0]['coverage']['appearances'] = 100
        with self.assertRaises(ValueError):
            validate_continuity(changed, old)
        changed = copy.deepcopy(old)
        changed['players'][0]['stats']['assists'] = 0
        with self.assertRaises(ValueError):
            validate_continuity(changed, old)


if __name__ == "__main__":
    unittest.main()
