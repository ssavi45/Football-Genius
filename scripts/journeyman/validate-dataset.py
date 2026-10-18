"""Report full-candidate defects separately from the gated runtime's health.

A successful runtime build does not prove 300 factually researched careers.
Uses the actual import/asset checker and actual gameplay tests, never fixed dates
or successful shape checks as substitutes for factual verification.
"""
from datetime import datetime, timezone
import json
from pathlib import Path
import subprocess
import sys
import unicodedata

ROOT = Path(__file__).resolve().parents[2]


def read(name):
    return json.loads((ROOT / name).read_text(encoding="utf-8-sig"))


def normalized(value):
    return "".join(c for c in unicodedata.normalize("NFKD", value).lower()
                   if c.isalnum() and not unicodedata.combining(c))


def run():
    canonical = read("src/data/journeyman-careers.json")
    players = canonical["players"]
    runtime = read("src/data/transfer-players.json")
    review = read("scripts/journeyman/IMPORT_REPORT.json")
    search = read("src/data/journeyman-search-players.json")["players"]
    evidence = read("tmp/journeyman/career-evidence.json")
    sources = {s["id"]: s for s in evidence.get("sources", [])}
    checks = subprocess.run(["node", "scripts/journeyman/import-dataset.cjs", "--check"], cwd=ROOT, capture_output=True, text=True, encoding="utf-8", errors="replace")
    tests = subprocess.run(["node", "scripts/journeyman/journeyman.test.cjs"], cwd=ROOT, capture_output=True, text=True, encoding="utf-8", errors="replace")
    reasons = [reason for p in review["players"] for reason in p["reasons"]]
    missing_citations = [p["id"] for p in players if not any(
        sources.get(sid, {}).get("url", "").rstrip("/").count("/") >= 3
        for sid in p.get("sourceIds", []))]
    search_names = {normalized(name) for p in search for name in [p["name"], *p.get("aliases", [])]}

    def gate(passed, **details):
        return {"passed": bool(passed), **details}

    gates = {
        "gate1_unique_identities": gate(len(players) == 300 and len({p["id"] for p in players}) == 300, count=len(players)),
        "gate2_ongoing_careers_supported": gate(not any(r == "incomplete-career" for r in reasons) and all(p.get("status") == next(c["status"] for c in players if c["id"] == p["id"]) for p in runtime), note="Active players and careerComplete:false records may be eligible. Retirement is not required."),
        "gate3_valid_stints": gate(not any(r.startswith(("invalid-stint:", "consecutive-duplicate-stint")) for r in reasons), problems=[r for r in reasons if r.startswith(("invalid-stint:", "consecutive-duplicate-stint"))]),
        "gate4_date_structure": gate(not any(r.startswith(("future-stint:", "reversed-stint-dates:")) for r in reasons)),
        "gate5_player_level_citations": gate(not missing_citations, playersWithoutSupportingPageLinks=missing_citations, note="Site homepages do not verify careers; even page-level links require independent factual review."),
        "gate6_nonempty_names": gate(all(normalized(p["name"]) and all(normalized(a) for a in p["aliases"]) for p in players)),
        "gate7_authentic_usable_crests": gate(not review["blockedBadges"], blocked=review["blockedBadges"]),
        "gate8_reproducible_runtime_export": gate(checks.returncode == 0 and len(runtime) == 300, exitCode=checks.returncode, stdout=checks.stdout.strip(), stderr=checks.stderr.strip()),
        "gate9_search_retention": gate(all(normalized(p["name"]) in search_names for p in players), searchableEntries=len(search)),
        "gate10_round_regressions": gate(tests.returncode == 0, note="Includes actual balanced-deck simulations and no-repeat assertions in the executed suite."),
        "gate11_short_careers_withheld": gate(all(not p["puzzleEligible"] for p in runtime if len(p["clubs"]) < 3)),
        "gate12_gameplay_tests": gate(tests.returncode == 0, exitCode=tests.returncode, stdout=tests.stdout, stderr=tests.stderr),
    }
    passed = sum(g["passed"] for g in gates.values())
    report = {
        "validatedAt": datetime.now(timezone.utc).isoformat(),
        "overallStatus": "MECHANICAL_GATES_PASSED_REVIEW_REQUIRED" if passed == len(gates) else "PARTIAL_NOT_FACTUALLY_VERIFIED",
        "factualVerification": review["factualVerification"],
        "runtimeStatus": "CONNECTED_WITH_QUARANTINED_RECORDS" if checks.returncode == 0 and tests.returncode == 0 else "FAILED_CHECKS",
        "gates": gates,
        "summary": {"passedGates": passed, "totalGates": len(gates), "totalPlayers": len(players), "enabledQuestions": review["enabledQuestions"], "withheldQuestions": review["withheldQuestions"]},
        "note": "This validator establishes mechanical checks, not the factual correctness of every career. The previous VERIFIED_CANDIDATE claim is superseded.",
    }
    destination = ROOT / "tmp/journeyman/validation-report.json"
    destination.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Runtime: {report['runtimeStatus']}; {review['enabledQuestions']} enabled questions.")
    print(f"Full candidate: {report['overallStatus']}; {passed}/{len(gates)} mechanical gates pass.")
    print(f"Report: {destination}")
    return 0 if passed == len(gates) else 1


if __name__ == "__main__":
    sys.exit(run())
