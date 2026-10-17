"""Validate Matrix using the actual TypeScript catalog and game generator."""
import argparse
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[2]
if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--rounds', type=int, default=1000, help='Actual runtime rounds per difficulty (default 1000)')
    args = parser.parse_args()
    subprocess.run(['node', str(ROOT / 'scripts/matrix/validate-runtime.cjs'), '--rounds', str(args.rounds)], cwd=ROOT, check=True)
