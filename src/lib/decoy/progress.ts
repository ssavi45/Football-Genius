export interface DecoyBest { score: number; stars: number }
const KEY = 'footygen_decoy_best_v1';
/** Device-only practice results, deliberately separate from verified XP/rankings. */
export function readBest(): Record<string, DecoyBest> {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}'), result: Record<string, DecoyBest> = {};
    for (const level of ['0', '1', '2']) {
      const entry = raw?.[level];
      if (Number.isInteger(entry?.score) && entry.score >= 0 && entry.score <= 2000 && Number.isInteger(entry?.stars) && entry.stars >= 1 && entry.stars <= 3) result[level] = entry;
    }
    return result;
  } catch { return {}; }
}
export function saveBest(level: number, score: number, stars: number) {
  const best = readBest(), previous = best[level];
  best[level] = { score: Math.max(score, previous?.score || 0), stars: Math.max(stars, previous?.stars || 0) };
  try { localStorage.setItem(KEY, JSON.stringify(best)); } catch { /* Play without persistence. */ }
  return best;
}
