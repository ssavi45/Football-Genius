"""Pure normalization rules for the Higher or Lower Transfermarkt snapshot."""

from datetime import datetime, timezone
import hashlib
import json
import re
import unicodedata

SCHEMA_VERSION = 3
EXCLUDED_COMPETITION_TYPES = {7, 11, 15, 16, 17, 18, 19, 20, 23}
YOUTH_OR_RESERVE = re.compile(r"(?:\bU\s?-?\d{2}\b|\bUnder.?\d{2}\b|\b(?:II|III|B|C|Youth|Reserves|Primavera|Juvenil)\s*$)", re.I)


def identity(value):
    text = (value or "").translate(str.maketrans({"ø": "o", "Ø": "O", "ł": "l", "Ł": "L", "ß": "ss", "đ": "d", "Đ": "D"}))
    text = unicodedata.normalize("NFKD", text)
    return " ".join(sorted(re.findall(r"[a-z0-9]+", text.encode("ascii", "ignore").decode().lower())))


def integer(value):
    return value if isinstance(value, int) and not isinstance(value, bool) and value >= 0 else None


def career_totals(performance, clubs, now):
    """Senior club + full-A internationals, including senior international friendlies.

    Team metadata distinguishes senior national teams from youth and Olympic teams;
    competition type alone cannot distinguish their international friendlies.
    """
    seen = set()
    rows = []
    exclusions = {"excludedClubCompetition": 0, "youthReserveOrUnclassifiedTeam": 0, "unfinished": 0, "duplicate": 0}
    for match in performance:
        info = match["gameInformation"]
        stats = match["statistics"]
        if stats["generalStatistics"].get("participationState") != "played":
            continue
        club_id = str(match["clubsInformation"]["club"]["clubId"])
        club = clubs.get(club_id)
        national = bool(info.get("isNationalGame"))
        if (not club or club.get("baseDetails", {}).get("clubTypeId") != 1
                or bool(club.get("baseDetails", {}).get("isNationalTeam")) != national
                or YOUTH_OR_RESERVE.search(club.get("name", ""))):
            exclusions["youthReserveOrUnclassifiedTeam"] += 1
            continue
        if not national and info.get("competitionTypeId") in EXCLUDED_COMPETITION_TYPES:
            exclusions["excludedClubCompetition"] += 1
            continue
        match_date = info.get("date", {}).get("dateTimeUTC")
        played_at = datetime.fromisoformat(match_date) if match_date else None
        state = info.get("gameState") or ""
        completed = state in {"regularly_terminated", "finished", "completed"} or (
            state in {"extra_time", "penalty_shootout"} and info.get("isGameReportCreated") is True)
        if (info.get("isLiveGame") or info.get("isGamePostponed") or not played_at
                or played_at > now or not completed):
            exclusions["unfinished"] += 1
            continue
        game_id = str(info["gameId"])
        if game_id in seen:
            exclusions["duplicate"] += 1
            continue
        seen.add(game_id)
        goals = stats.get("goalStatistics", {})
        rows.append({"season": int(info["seasonId"]), "date": match_date,
                     "teamType": "international" if national else "club",
                     "goals": integer(goals.get("goalsScoredTotal")),
                     "assists": integer(goals.get("assists"))})
    def summarize(appearances):
        missing_goals = sum(row["goals"] is None for row in appearances)
        missing_assists = sum(row["assists"] is None for row in appearances)
        return {"appearances": len(appearances),
                "goals": sum(row["goals"] for row in appearances) if not missing_goals else None,
                "assists": sum(row["assists"] for row in appearances) if not missing_assists else None,
                "missingGoals": missing_goals, "missingAssists": missing_assists}

    total = summarize(rows)
    return {
        "goals": total["goals"] if rows else None,
        "assists": total["assists"] if rows else None,
        "coverage": {"scope": "recorded-senior-career-matches", "appearances": len(rows),
                     "club": summarize([row for row in rows if row["teamType"] == "club"]),
                     "international": summarize([row for row in rows if row["teamType"] == "international"]),
                     "firstSeason": min((row["season"] for row in rows), default=None),
                     "lastSeason": max((row["season"] for row in rows), default=None),
                     "lastMatchAt": max((row["date"] for row in rows), default=None),
                     "missingGoals": total["missingGoals"], "missingAssists": total["missingAssists"],
                     "excluded": exclusions},
    }


def transfer_history(transfers, clubs, today):
    """Individual completed senior club moves; never infer an undisclosed fee as zero."""
    result, seen = [], set()
    for item in transfers:
        fee = 0 if item.get("transferType") == "freeTransfer" and item.get("fee") is None else integer(item.get("fee"))
        if (fee is None or item.get("upcoming") or not item.get("date") or item["date"] > today
                or item.get("transferType") not in {"transfer", "freeTransfer"}):
            continue
        route = []
        for key in ["clubFrom", "clubTo"]:
            source = item.get(key) or {}
            club_id = str(source.get("id", ""))
            club = clubs.get(club_id, {})
            if (not club_id.isdigit() or club.get("baseDetails", {}).get("clubTypeId") != 1
                    or club.get("baseDetails", {}).get("isNationalTeam")
                    or YOUTH_OR_RESERVE.search(club.get("name", "")) or not club.get("crestUrl")):
                break
            route.append({"id": club_id, "name": source.get("name") or club["name"], "crest": club["crestUrl"]})
        if len(route) != 2 or route[0]["id"] == route[1]["id"]:
            continue
        key = (item["date"], route[0]["id"], route[1]["id"])
        if key in seen:
            continue
        seen.add(key)
        result.append({"id": str(item.get("id") or "-".join(key)), "date": item["date"],
                       "season": item.get("season"), "fee": fee, "from": route[0], "to": route[1]})
    return result


def money(value):
    if not value or value.get("currency") != "EUR":
        return None
    return integer(value.get("value"))


def normalize_player(seed, data):
    profile, raw = data["profile"], data["rawPlayer"]
    now = datetime.fromisoformat(data["fetchedAt"].replace("Z", "+00:00"))
    totals = career_totals(data["performance"], data["clubs"], now)
    transfers = transfer_history(data["transfers"], data["clubs"], now.date().isoformat())
    club_id = profile["club"].get("lastClubId") if profile["isRetired"] else profile["club"].get("id")
    club = data["clubs"].get(str(club_id), {})
    league_id = club.get("baseDetails", {}).get("primaryCompetitionId") or club.get("relevantCompetitionId")
    league = data["competitions"].get(str(league_id), {}).get("name")
    values = raw.get("marketValueDetails") or {}
    current_value = money(values.get("current")) if not profile["isRetired"] else None
    if current_value == 0:
        current_value = None
    return {
        "id": seed["id"], "transfermarktId": str(profile["id"]), "name": seed["name"],
        "sourceName": profile["name"], "sourceUrl": profile.get("url"),
        "image": "/" + seed["image"], "nationality": seed["nationality"],
        "nationalityFlag": "/" + seed["nationalityFlag"],
        "clubId": str(club_id) if club_id else None,
        "club": (profile["club"].get("lastClubName") if profile["isRetired"] else profile["club"].get("name")),
        "clubBadge": club.get("crestUrl"), "league": league,
        "position": raw.get("attributes", {}).get("position", {}).get("shortName") or profile["position"].get("main"),
        "dateOfBirth": profile.get("dateOfBirth"), "age": profile.get("age"), "isRetired": profile["isRetired"],
        "stats": {"goals": totals["goals"], "assists": totals["assists"],
                  "marketValue": current_value},
        "marketValueDate": (values.get("current") or {}).get("determined"),
        "transfers": transfers,
        "coverage": totals["coverage"], "fetchedAt": data["fetchedAt"],
    }


def validate_players(players, expected_count=100):
    if len(players) != expected_count:
        raise ValueError(f"Expected {expected_count} players; received {len(players)}. Last good snapshot retained.")
    for key in ["id", "transfermarktId"]:
        if len({player[key] for player in players}) != expected_count:
            raise ValueError(f"Duplicate {key} in snapshot")
    for player in players:
        if not player["name"] or not player["sourceUrl"] or not player["coverage"]["appearances"]:
            raise ValueError(f"Incomplete source/profile for {player['id']}")
        for key in ["goals", "assists", "marketValue"]:
            value = player["stats"][key]
            if value is not None and integer(value) is None:
                raise ValueError(f"Invalid {key} for {player['id']}")
        coverage = player["coverage"]
        if (coverage.get("scope") != "recorded-senior-career-matches"
                or any(not isinstance(coverage.get(part), dict) for part in ["club", "international"])):
            raise ValueError(f"Missing career breakdown for {player['id']}")
        parts = [coverage["club"], coverage["international"]]
        for part in parts:
            if integer(part.get("appearances")) is None:
                raise ValueError("Invalid career appearances")
            for key, missing in [("goals", "missingGoals"), ("assists", "missingAssists")]:
                if (integer(part.get(missing)) is None or part[missing] > part["appearances"]
                        or (part[missing] > 0 and part.get(key) is not None)
                        or (part[missing] == 0 and integer(part.get(key)) is None)
                        or (part["appearances"] == 0 and part.get(key) != 0)):
                    raise ValueError(f"Invalid career {key} coverage")
        if coverage["appearances"] != sum(p["appearances"] for p in parts):
            raise ValueError("Career appearance breakdown does not add up")
        for key, missing in [("goals", "missingGoals"), ("assists", "missingAssists")]:
            unknown = sum(p[missing] for p in parts)
            expected = None if unknown else sum(p[key] for p in parts)
            if coverage[missing] != unknown or player["stats"][key] != expected:
                raise ValueError(f"Career {key} must equal club + international totals")
        if player["isRetired"] and player["stats"]["marketValue"] is not None:
            raise ValueError("Retired players cannot have a playable current market value")
        seen = set()
        for move in player["transfers"]:
            if (not move["id"] or move["id"] in seen or integer(move["fee"]) is None
                    or move["from"]["id"] == move["to"]["id"]
                    or any(not club["id"].isdigit() or not club["name"] or not club["crest"] for club in [move["from"], move["to"]])):
                raise ValueError(f"Invalid transfer for {player['id']}")
            seen.add(move["id"])
    if expected_count >= 20 and not (any(p["isRetired"] for p in players) and any(not p["isRetired"] for p in players)):
        raise ValueError("Snapshot must include active and retired players")
    minimum_pool = min(20, expected_count)
    for category in ["goals", "assists", "marketValue"]:
        if sum(p["stats"][category] is not None for p in players) < minimum_pool:
            raise ValueError(f"Not enough verified {category} values")
    if sum(bool(p["transfers"]) for p in players) < minimum_pool:
        raise ValueError("Not enough verified transfer histories")


def make_snapshot(players):
    validate_players(players)
    # Replaying the same source captures produces the same immutable version and payload.
    created = max(player["fetchedAt"] for player in players)
    digest = hashlib.sha256(json.dumps(players, sort_keys=True).encode()).hexdigest()[:12]
    return {"schemaVersion": SCHEMA_VERSION, "version": f"tm-{created[:10]}-{digest}",
            "createdAt": created, "playerCount": len(players),
            "source": {"name": "Transfermarkt", "adapter": "felipeall/transfermarkt-api@5.0.0",
                       "url": "https://github.com/felipeall/transfermarkt-api"},
            "scope": {"goals": "Recorded senior career goals: club + full-A internationals",
                      "assists": "Recorded senior career assists: club + full-A internationals",
                      "marketValue": "Current Transfermarkt market value in EUR; active valued players only",
                      "transfer": "Fee of one specified completed permanent senior club transfer in EUR"},
            "players": players}


def validate_continuity(snapshot, previous):
    """Catch truncated upstream history while allowing small retrospective corrections."""
    if not previous or previous.get("schemaVersion") != SCHEMA_VERSION:
        return
    old_players = {p["transfermarktId"]: p for p in previous["players"]}
    for player in snapshot["players"]:
        old = old_players.get(player["transfermarktId"])
        if not old:
            continue
        if player["coverage"]["appearances"] < old["coverage"]["appearances"] * 0.9:
            raise ValueError(f"Recorded history unexpectedly shrank for {player['name']}; last good snapshot retained")
        for part in ["club", "international"]:
            before = old["coverage"].get(part, {}).get("appearances", 0)
            after = player["coverage"].get(part, {}).get("appearances", 0)
            if after < before * 0.9:
                raise ValueError(f"Recorded {part} history unexpectedly shrank for {player['name']}")
        for key in ["goals", "assists"]:
            before, after = old["stats"][key], player["stats"][key]
            if before is not None and after is not None and before - after > max(3, before * 0.05):
                raise ValueError(f"Unexpected {key} decrease for {player['name']}; investigate the source before replacing the snapshot")
