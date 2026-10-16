"""Fetch and validate a complete 100-player snapshot using felipeall/transfermarkt-api.

No browser requests depend on this worker. A failed/partial import never replaces the last good snapshot.
"""

import argparse
import asyncio
from datetime import datetime, timezone
import json
import os
import sys
from pathlib import Path
import time
import traceback

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

import httpx
from transfermarkt_api import Transfermarkt
from transfermarkt_api.exceptions import NotFound, UpstreamBlocked, UpstreamError, UpstreamTimeout

from normalize import identity, make_snapshot, normalize_player, validate_continuity

ROOT = Path(__file__).resolve().parents[2]
ROSTER = ROOT / "scripts/higher-lower/roster.json"
CACHE = ROOT / "tmp/higher-lower/source"
OUTPUT = ROOT / "src/data/higher-lower-snapshot.json"


class PoliteTransport(httpx.AsyncBaseTransport):
    """Bound every upstream request, including calls made by SDK assembly services."""

    def __init__(self, interval):
        self.inner = httpx.AsyncHTTPTransport()
        self.lock = asyncio.Lock()
        self.last = 0
        self.interval = interval

    async def handle_async_request(self, request):
        async with self.lock:
            await asyncio.sleep(max(0, self.last + self.interval - time.monotonic()))
            self.last = time.monotonic()
            return await self.inner.handle_async_request(request)

    async def aclose(self):
        await self.inner.aclose()


def dump_atomic(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    for attempt in range(5):
        try:
            temporary.replace(path)
            return
        except PermissionError:
            if attempt == 4:
                raise
            time.sleep(0.15 * (attempt + 1))


def matches_identity(seed, profile):
    names = {identity(seed["name"]), *(identity(alias) for alias in seed.get("aliases", []))}
    return bool(names & {identity(profile.name), identity(profile.full_name)}) and (
        not seed.get("birthDate") or str(profile.date_of_birth) == seed["birthDate"])


async def resolve(tm, seed):
    if seed.get("transfermarktId"):
        try:
            profile = await tm.player_profile(str(seed["transfermarktId"]))
            if matches_identity(seed, profile):
                return profile
        except NotFound:
            pass
    result = await tm.search_players(seed.get("searchName", seed["name"]))
    names = {identity(seed["name"]), *(identity(alias) for alias in seed.get("aliases", []))}
    candidates = [player for player in result.results if identity(player.name) in names
                  and (not player.nationalities or seed["nationality"] in player.nationalities)]
    if len(candidates) > 1 and seed.get("birthDate"):
        profiles = [await tm.player_profile(candidate.id) for candidate in candidates]
        verified = [profile for profile in profiles if matches_identity(seed, profile)]
        if len(verified) == 1:
            return verified[0]
    if len(candidates) != 1:
        raise ValueError(f"Ambiguous identity for {seed['name']}; curate its Transfermarkt ID/aliases explicitly")
    profile = await tm.player_profile(candidates[0].id)
    if not matches_identity(seed, profile):
        raise ValueError(f"Provider identity mismatch for {seed['name']}")
    return profile


async def collect(tm, seed):
    profile = await resolve(tm, seed)
    player_id = profile.id
    # Pinned SDK 5.0.0: raw records preserve unknown assists that the public stats aggregator converts to zero.
    upstream = tm._client
    raw = await upstream.player(player_id)
    performance = (await upstream.player_performance_games(player_id))["performance"]
    transfers = (await tm.player_transfers(player_id)).model_dump(mode="json", by_alias=True)["transfers"]
    clubs = await upstream.clubs([
        profile.club.id, profile.club.last_club_id,
        *(game["clubsInformation"]["club"]["clubId"] for game in performance),
        *(item[key]["id"] for item in transfers for key in ["clubFrom", "clubTo"] if item.get(key, {}).get("id")),
    ])
    competition_ids = {game["gameInformation"]["competitionId"] for game in performance}
    competition_ids.update(club.get("relevantCompetitionId") for club in clubs.values())
    competition_ids.update(club.get("baseDetails", {}).get("primaryCompetitionId") for club in clubs.values())
    competitions = await upstream.competitions(competition_ids)
    return {"profile": profile.model_dump(mode="json", by_alias=True), "rawPlayer": raw,
            "performance": performance, "transfers": transfers, "clubs": clubs, "competitions": competitions,
            "fetchedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")}


async def collect_with_retry(tm, seed):
    for attempt in range(3):
        try:
            return await collect(tm, seed)
        except UpstreamBlocked:
            raise
        except (httpx.HTTPError, UpstreamTimeout, UpstreamError):
            if attempt == 2:
                raise
            await asyncio.sleep(2 * (attempt + 1))


async def publish(snapshot):
    url, key = os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise ValueError("Publishing requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. Local snapshot is available.")
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(url.rstrip("/") + "/rest/v1/rpc/publish_higher_lower_snapshot",
                                     headers={"apikey": key, "Authorization": "Bearer " + key},
                                     json={"payload": snapshot})
        if response.is_error:
            raise RuntimeError(f"Supabase publish failed (HTTP {response.status_code}); previous published snapshot remains active")


async def previous_publication():
    url, key = os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(url.rstrip("/") + "/rest/v1/higher_lower_current",
                                    headers={"apikey": key, "Authorization": "Bearer " + key},
                                    params={"id": "eq.true", "select": "snapshot:higher_lower_snapshots(payload)", "limit": "1"})
        if response.is_error:
            raise RuntimeError(f"Cannot read previous publication (HTTP {response.status_code}); verify the migration and project configuration")
        rows = response.json()
        return rows[0]["snapshot"]["payload"] if rows else None


async def run(args):
    if args.publish and not (os.environ.get("SUPABASE_URL") and os.environ.get("SUPABASE_SERVICE_ROLE_KEY")):
        raise ValueError("Publishing requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. Run without --publish for a local snapshot.")
    previous = await previous_publication() if args.publish else (
        json.loads(OUTPUT.read_text(encoding="utf-8")) if OUTPUT.exists() else None)
    roster = json.loads(ROSTER.read_text(encoding="utf-8"))
    if len(roster) != 500 or len({p["id"] for p in roster}) != 500:
        raise ValueError("Curate exactly 500 unique players")
    players, failed = [], []
    transport = PoliteTransport(args.interval)
    async with Transfermarkt(max_concurrency=1, transport=transport, timeout=30) as tm:
        for index, seed in enumerate(roster[:args.limit], 1):
            path = CACHE / (seed["id"] + ".json")
            try:
                if args.resume and path.exists() and time.time() - path.stat().st_mtime < 43200:
                    data = json.loads(path.read_text(encoding="utf-8"))
                    if not matches_identity(seed, type("Profile", (), {"name": data["profile"]["name"], "full_name": data["profile"].get("fullName"), "date_of_birth": data["profile"].get("dateOfBirth")})()):
                        raise ValueError("Cached identity mismatch")
                else:
                    data = await collect_with_retry(tm, seed)
                    dump_atomic(path, data)
                seed["transfermarktId"] = data["profile"]["id"]
                player = normalize_player(seed, data)
                players.append(player)
                if not args.quiet:
                    print(f"[{index}/{args.limit}] {seed['name']}: goals={player['stats']['goals']}, assists={player['stats']['assists']}", flush=True)
            except UpstreamBlocked:
                raise RuntimeError("Transfermarkt declined the request. Stop and retain the last good snapshot; do not bypass the block.")
            except Exception as error:
                failed.append({"id": seed["id"], "error": str(error), "traceback": traceback.format_exc()})
                print(f"[{index}/{args.limit}] FAILED {seed['name']}: {error}", flush=True)
    dump_atomic(ROSTER, roster)
    dump_atomic(ROOT / "tmp/higher-lower/import-report.json", {"loaded": len(players), "failed": failed})
    if failed:
        raise ValueError(f"{len(failed)} players failed validation; last good snapshot retained")
    if args.limit != 500:
        print("Sample validated. A partial sample is never published.")
        return
    snapshot = make_snapshot(players)
    validate_continuity(snapshot, previous)
    dump_atomic(OUTPUT, snapshot)
    dump_atomic(ROOT / "tmp/higher-lower/validated-snapshot.json", snapshot)
    print(f"Saved {snapshot['version']}: {len(players)} validated players; "
          f"{sum(p['isRetired'] for p in players)} retired.")
    if args.publish:
        await publish(snapshot)
        print("Published complete snapshot to Supabase.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--resume", action="store_true", help="Reuse successful source captures from the past 12 hours")
    parser.add_argument("--publish", action="store_true", help="Atomically publish to Supabase after validation")
    parser.add_argument("--quiet", action="store_true", help="Print only errors and the final summary")
    parser.add_argument("--limit", type=int, default=500, choices=range(1, 501), metavar="1..500")
    parser.add_argument("--interval", type=float, default=0.5, help="Minimum seconds between upstream requests")
    options = parser.parse_args()
    if options.interval < 0.25:
        parser.error("Use an upstream request interval of at least 0.25 seconds")
    try:
        asyncio.run(run(options))
    except Exception as error:
        print(f"Import not published: {error}", file=sys.stderr)
        sys.exit(1)
