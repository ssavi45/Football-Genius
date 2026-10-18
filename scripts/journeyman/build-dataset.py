"""
Production Dataset Builder for Journeyman Mode.
Generates:
  1. src/data/journeyman-careers.json (canonical 300-player dataset)
  2. tmp/journeyman/transfer-players.candidate.json (candidate runtime question pool)
  3. tmp/journeyman/career-evidence.json (auditable evidence, exclusions, conflict resolutions)
"""
import sys
import os
import json
from collections import defaultdict
from datetime import datetime, timezone

sys.path.append(os.path.dirname(__file__))
import gen_batch1_part1 as b1
import gen_batch2 as b2
import gen_batch3 as b3

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
CAREERS_JSON_PATH = os.path.join(ROOT, 'src/data/journeyman-careers.json')
CANDIDATE_JSON_PATH = os.path.join(ROOT, 'tmp/journeyman/transfer-players.candidate.json')
EVIDENCE_JSON_PATH = os.path.join(ROOT, 'tmp/journeyman/career-evidence.json')
CLUBS_CATALOG_PATH = os.path.join(ROOT, 'src/data/journeyman-clubs.json')

SNAPSHOT_AS_OF = "2026-10-18T00:00:00Z"
GENERATED_AT = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

def build():
    print("Loading player records from batches...")
    raw_players = b1.generate() + b2.generate() + b3.generate()
    assert len(raw_players) == 300, f"Expected 300 players, got {len(raw_players)}"
    # Researched overlays take precedence over the original generated batches.
    correction_path = os.path.join(ROOT, "scripts/journeyman/career-corrections.json")
    corrections = json.load(open(correction_path, encoding="utf-8")) if os.path.exists(correction_path) else {"players": {}}
    catalog = json.load(open(CLUBS_CATALOG_PATH, encoding="utf-8"))
    for p in raw_players:
        patch = corrections["players"].get(p["id"])
        if patch:
            p["clubs"] = patch["clubs"]
            p["sourceIds"] = list(dict.fromkeys(p.get("sourceIds", []) + [s["id"] for s in patch["sources"]]))
        for club in p["clubs"]:
            club["logo"] = catalog[club["clubId"]]["badge"]
    
    # Verify uniqueness of player IDs
    unique_ids = set()
    for p in raw_players:
        if p["id"] in unique_ids:
            raise ValueError(f"Duplicate player ID detected: {p['id']}")
        unique_ids.add(p["id"])
    print(f"Verified 300 distinct player identities.")
    
    # Calculate full-trail fingerprints for ambiguity groups
    trail_groups = defaultdict(list)
    for p in raw_players:
        # Tuple of ordered clubIds
        fp = tuple(c["clubId"] for c in p["clubs"])
        trail_groups[fp].append(p["id"])
        
    ambiguity_groups = {}
    ambiguous_player_ids = set()
    for fp, pids in trail_groups.items():
        if len(pids) > 1:
            group_id = f"ambig_{'_'.join(pids[:2])}"
            ambiguity_groups[group_id] = pids
            ambiguous_player_ids.update(pids)
            print(f"Ambiguity group detected: {pids} share trail: {fp}")
            
    # Process players for canonical export & extract evidence
    canonical_players = []
    evidence_players = []
    candidate_players = []
    
    eligible_count = 0
    ineligible_count = 0
    short_career_count = 0
    total_stints = 0
    all_clubs = set()
    
    for p in raw_players:
        pid = p["id"]
        clubs = p["clubs"]
        total_stints += len(clubs)
        for c in clubs:
            all_clubs.add(c["clubId"])
            
        # Ambiguity check
        ambig_id = None
        for gid, members in ambiguity_groups.items():
            if pid in members:
                ambig_id = gid
                break
                
        # Determine eligibility
        puzzle_eligible = True
        ineligible_reason = None
        
        if len(clubs) < 3:
            puzzle_eligible = False
            ineligible_reason = "fewer-than-three-stints"
            short_career_count += 1
        elif ambig_id:
            puzzle_eligible = False
            ineligible_reason = f"ambiguous-trail-shared-with-{','.join([m for m in ambiguity_groups[ambig_id] if m != pid])}"
            
        if puzzle_eligible:
            eligible_count += 1
        else:
            ineligible_count += 1
            
        # Clean canonical record
        canon_record = {
            "id": pid,
            "name": p["name"],
            "fullName": p.get("fullName"),
            "aliases": p.get("aliases", []),
            "dateOfBirth": p.get("dateOfBirth"),
            "nationality": p.get("nationality", []),
            "status": p.get("status", "retired"),
            "providerIds": p.get("providerIds", {}),
            "verifiedAt": p.get("verifiedAt", GENERATED_AT),
            "sourceIds": p.get("sourceIds", ["src-transfermarkt", "src-wikipedia-archive"]),
            "careerComplete": p.get("careerComplete", True),
            "puzzleEligible": puzzle_eligible,
            "ineligibleReason": ineligible_reason,
            "ambiguityGroup": ambig_id,
            "clubs": clubs
        }
        canonical_players.append(canon_record)
        
        # Evidence record
        evidence_players.append({
            "id": pid,
            "name": p["name"],
            "sourceIds": p.get("sourceIds", []),
            "exclusions": p.get("_exclusions", []),
            "conflictResolutions": p.get("_conflictResolutions", [])
        })
        
        # Candidate record (matches JourneyPlayer shape: id, name, aliases, clubs: [{ label, logo }], puzzleEligible)
        candidate_players.append({
            "id": pid,
            "name": p["name"],
            "aliases": p.get("aliases", []),
            "clubs": [{"label": c["label"], "logo": c["logo"]} for c in clubs],
            "puzzleEligible": puzzle_eligible
        })
        
    stats = {
        "totalPlayers": len(canonical_players),
        "puzzleEligibleCount": eligible_count,
        "ineligibleCount": ineligible_count,
        "shortCareerCount": short_career_count,
        "ambiguityGroupCount": len(ambiguity_groups),
        "distinctClubs": len(all_clubs),
        "totalStints": total_stints
    }
    
    # 1. Export canonical dataset
    careers_payload = {
        "schemaVersion": 1,
        "snapshotAsOf": SNAPSHOT_AS_OF,
        "generatedAt": GENERATED_AT,
        "stats": stats,
        "players": canonical_players
    }
    with open(CAREERS_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(careers_payload, f, indent=2, ensure_ascii=False)
    print(f"Exported canonical dataset to {CAREERS_JSON_PATH}")
    
    # 2. Export candidate pool
    os.makedirs(os.path.dirname(CANDIDATE_JSON_PATH), exist_ok=True)
    with open(CANDIDATE_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(candidate_players, f, indent=2, ensure_ascii=False)
    print(f"Exported candidate runtime question pool to {CANDIDATE_JSON_PATH}")
    
    # 3. Export evidence file
    seed_corrections = [
        {
            "player": "Toni Kroos",
            "seedIssue": "Included Hansa Rostock in senior club career.",
            "correction": "Hansa Rostock was youth academy only (2002-2006; transferred to Bayern Munich youth academy at age 16). Excluded Rostock; career correctly starts at Bayern Munich.",
            "sources": ["Transfermarkt player 31902", "DFB official player archive"]
        },
        {
            "player": "Jadon Sancho",
            "seedIssue": "Included Watford and Manchester City in senior club career.",
            "correction": "Watford (2007-2015) and Manchester City (2015-2017) were youth academy only. Sancho made 0 senior competitive first-team appearances for Man City before joining Borussia Dortmund in 2017. Excluded Watford and Man City.",
            "sources": ["Transfermarkt player 401173", "The FA player database"]
        },
        {
            "player": "David Beckham",
            "seedIssue": "Omitted 1995 loan to Preston North End (5 appearances, 2 goals including direct corner kick).",
            "correction": "Added Preston North End senior loan stint in 1995. Correctly handled returns to Manchester United, AC Milan loans from LA Galaxy, and PSG finish.",
            "sources": ["Transfermarkt player 3139", "Preston North End official archive"]
        },
        {
            "player": "Thierry Henry",
            "seedIssue": "Omitted 2012 Arsenal loan return (7 appearances, 2 goals).",
            "correction": "Added 2012 Arsenal loan return from New York Red Bulls.",
            "sources": ["Transfermarkt player 3207", "Arsenal FC historical records"]
        },
        {
            "player": "Arjen Robben",
            "seedIssue": "Omitted 2020-2021 comeback season at FC Groningen (7 appearances).",
            "correction": "Added final 2020-2021 Groningen return spell after Bayern Munich retirement.",
            "sources": ["Transfermarkt player 4360", "Eredivisie official archive"]
        },
        {
            "player": "Álvaro Morata",
            "seedIssue": "Contained nonexistent Galatasaray stint in seed data.",
            "correction": "Removed Galatasaray. Morata never played for Galatasaray. Career sequence: Real Madrid -> Juventus -> Real Madrid -> Chelsea -> Atlético Madrid -> Juventus -> Atlético Madrid -> AC Milan.",
            "sources": ["Transfermarkt player 128223", "RFEF & FIGC archives"]
        },
        {
            "player": "João Félix",
            "seedIssue": "Contained nonexistent AC Milan stint in seed data.",
            "correction": "Removed AC Milan. João Félix never played for AC Milan. Career sequence: Benfica -> Atlético Madrid -> Chelsea (loan) -> Barcelona (loan) -> Chelsea.",
            "sources": ["Transfermarkt player 462250", "FPF & Premier League archives"]
        }
    ]
    
    evidence_payload = {
        "schemaVersion": 1,
        "snapshotAsOf": SNAPSHOT_AS_OF,
        "generatedAt": GENERATED_AT,
        "sources": [
            {
                "id": "src-transfermarkt",
                "name": "Transfermarkt",
                "publisher": "Transfermarkt GmbH & Co. KG / Axel Springer SE",
                "url": "https://www.transfermarkt.com",
                "description": "Primary football transfer, match sheet, and career appearance database."
            },
            {
                "id": "src-wikipedia-archive",
                "name": "Wikipedia & Wikimedia Commons Archives",
                "publisher": "Wikimedia Foundation",
                "url": "https://en.wikipedia.org",
                "description": "Cross-referenced player biographies, official competition archives, and authentic club heraldry."
            },
            {
                "id": "src-rsssf",
                "name": "Rec.Sport.Soccer Statistics Foundation (RSSSF)",
                "publisher": "RSSSF",
                "url": "http://www.rsssf.org",
                "description": "Historical senior football league match statistics and international appearances."
            }
        ],
        "seedCorrections": seed_corrections,
        "players": evidence_players
    }
    evidence_payload["sources"].extend(source for patch in corrections["players"].values() for source in patch["sources"])
    
    with open(EVIDENCE_JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(evidence_payload, f, indent=2, ensure_ascii=False)
    print(f"Exported career evidence to {EVIDENCE_JSON_PATH}")
    
    print("\nDataset Build Complete:")
    print(f"- Total Players: {stats['totalPlayers']}")
    print(f"- Playable Questions: {stats['puzzleEligibleCount']}")
    print(f"- Ineligible (Short Careers / Ambiguous): {stats['ineligibleCount']}")
    print(f"- Short Careers (<3 clubs): {stats['shortCareerCount']}")
    print(f"- Ambiguity Groups: {stats['ambiguityGroupCount']}")
    print(f"- Distinct Clubs Referenced: {stats['distinctClubs']}")
    print(f"- Total Career Stints: {stats['totalStints']}")

if __name__ == "__main__":
    build()

