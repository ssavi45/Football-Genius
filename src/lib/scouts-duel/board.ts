import type { ScoutPlayer } from './types';

// A hex string preserves all 64 seed bits across JSON and JavaScript clients.
export function seededRandom(seed: string) {
  if (!/^[a-f\d]{16}$/i.test(seed)) throw Error('Invalid board seed');
  let state = BigInt(`0x${seed}`) || 1n;
  const mask = (1n << 64n) - 1n;
  return () => { state ^= state << 13n; state ^= state >> 7n; state ^= state << 17n; state &= mask; return Number(state >> 11n) / 2 ** 53; };
}
function shuffle<T>(items: T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; }
  return copy;
}
export function generateScoutBoard(players: ScoutPlayer[], seed: string): ScoutPlayer[] {
  const random = seededRandom(seed);
  const quota = { GK: 2, DF: 7, MF: 7, FW: 8 };
  if (new Set(players.map(p => p.id)).size !== players.length) throw Error('Duplicate player identities');
  for (const [position, count] of Object.entries(quota)) if (players.filter(p => p.position === position).length < count) throw Error(`Insufficient ${position} coverage`);
  for (let attempt = 0; attempt < 2000; attempt++) {
    const board: ScoutPlayer[] = [];
    const clubs = new Map<string, number>(), leagues = new Map<string, number>();
    for (const [position, count] of Object.entries(quota)) {
      for (const p of shuffle(players.filter(p => p.position === position), random)) {
        if (board.filter(q => q.position === position).length === count) break;
        const club = p.isRetired ? null : p.club;
        if ((club && (clubs.get(club) || 0) >= 5) || (p.league && (leagues.get(p.league) || 0) >= 7)) continue;
        board.push(p);
        if (club) clubs.set(club, (clubs.get(club) || 0) + 1);
        if (p.league) leagues.set(p.league, (leagues.get(p.league) || 0) + 1);
      }
    }
    if (board.length === 24 && new Set(board.map(p => p.continent)).size >= 4) return shuffle(board, random);
  }
  throw Error('This dataset cannot produce a balanced board. No quotas were relaxed.');
}
