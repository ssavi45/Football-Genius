"""
Helpers and declarative models for constructing verified Journeyman player records.
"""
from typing import List, Optional, Dict, Any

def stint(
    order: int,
    club_id: str,
    label: str,
    from_date: Optional[str],
    to_date: Optional[str],
    from_precision: str = "year",
    to_precision: str = "year",
    stint_type: str = "permanent",
    appearances: Optional[int] = None,
    verified: bool = True,
    sources: Optional[List[str]] = None
) -> Dict[str, Any]:
    raw_date = f"{from_date or '?'}-{to_date or 'present'}"
    return {
        "order": order,
        "clubId": club_id,
        "label": label,
        "logo": f"img/journeyman/clubs/{club_id}.webp",
        "from": from_date,
        "to": to_date,
        "fromPrecision": from_precision,
        "toPrecision": to_precision,
        "rawDateText": raw_date,
        "stintType": stint_type,
        "seniorCompetitiveAppearances": appearances,
        "hasVerifiedAppearance": verified,
        "sourceIds": sources or ["src-transfermarkt", "src-wikipedia-archive"]
    }

def player(
    player_id: str,
    name: str,
    full_name: Optional[str],
    aliases: List[str],
    dob: Optional[str],
    nationality: List[str],
    status: str,
    clubs: List[Dict[str, Any]],
    provider_ids: Optional[Dict[str, str]] = None,
    career_complete: bool = True,
    verified_at: str = "2026-10-18T04:31:25Z",
    sources: Optional[List[str]] = None,
    exclusions: Optional[List[Dict[str, str]]] = None,
    conflict_resolutions: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    return {
        "id": player_id,
        "name": name,
        "fullName": full_name,
        "aliases": aliases,
        "dateOfBirth": dob,
        "nationality": nationality,
        "status": status,
        "providerIds": provider_ids or {},
        "verifiedAt": verified_at,
        "sourceIds": sources or ["src-transfermarkt", "src-wikipedia-archive"],
        "careerComplete": career_complete,
        "puzzleEligible": len(clubs) >= 3,
        "ineligibleReason": None if len(clubs) >= 3 else "fewer-than-three-stints",
        "ambiguityGroup": None,
        "clubs": clubs,
        "_exclusions": exclusions or [],
        "_conflictResolutions": conflict_resolutions or []
    }

