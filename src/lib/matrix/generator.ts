import { combinationKey, matchCandidates, satisfies } from './engine';
import type { Criterion, MatrixDifficulty, MatrixPlayer, MatrixPuzzle } from './types';

const overlapTargets: Record<MatrixDifficulty, [number, number]> = {
  easy: [10, Infinity], medium: [3, 8], hard: [1, 3],
};
function seededRandom(seed: string): () => number {
  let state = 2166136261;
  for (let i = 0; i < seed.length; i++) state = Math.imul(state ^ seed.charCodeAt(i), 16777619);
  return () => {
    state += 0x6D2B79F5;
    let value = Math.imul(state ^ state >>> 15, 1 | state);
    value ^= value + Math.imul(value ^ value >>> 7, 61 | value);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}
function shuffle<T>(values: T[], random: () => number): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function triples(criteria: Criterion[]): Criterion[][] {
  const result: Criterion[][] = [];
  for (let a = 0; a < criteria.length - 2; a++)
    for (let b = a + 1; b < criteria.length - 1; b++)
      for (let c = b + 1; c < criteria.length; c++) {
        const triple = [criteria[a], criteria[b], criteria[c]];
        // Avoid redundant thresholds for the same statistic on one axis.
        if (new Set(triple.map(x => `${x.type}:${x.value}`)).size === 3) result.push(triple);
      }
  return result;
}

/** Build from the catalog, never from a predefined board pattern.
 * Exact axis rules and a nine-player matching are mandatory. Overlap bands are
 * preferences: the current evidence may not yet support all requested bands.
 */
export function createPuzzleGenerator(players: MatrixPlayer[], catalog: Criterion[], version: string) {
  const eligible = new Map(catalog.map(c => [c.id, new Set(players.filter(p => satisfies(p, c)).map(p => p.id))]));
  const available = catalog.filter(c => eligible.get(c.id)!.size > 0);
  const intersections = new Map<string, string[]>();
  const key = (a: Criterion, b: Criterion) => [a.id, b.id].sort().join('|');
  for (let i = 0; i < available.length; i++) for (let j = i + 1; j < available.length; j++) {
    const a = available[i], b = available[j];
    intersections.set(key(a, b), [...eligible.get(a.id)!].filter(id => eligible.get(b.id)!.has(id)));
  }
  const clubs = available.filter(c => c.type === 'club');
  const nations = available.filter(c => c.type === 'nation');
  const milestones = available.filter(c => c.type === 'stat' || c.type === 'trophy');
  const clubTriples = triples(clubs), nationTriples = triples(nations), milestoneTriples = triples(milestones);
  const cache = new Map<string, MatrixPuzzle>();
  return (seed: string, difficulty: MatrixDifficulty, number: number, history: string[] = []): MatrixPuzzle => {
    const excluded = new Set(history);
    const cacheKey = `${seed}:${difficulty}:${number}:${history.join(';')}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;
    const random = seededRandom(`${version}:${seed}:${difficulty}`);
    const rows = shuffle(difficulty === 'hard' ? milestoneTriples : clubTriples, random);
    const cols = shuffle(difficulty === 'easy' ? nationTriples : milestoneTriples, random);
    const [minimum, maximum] = overlapTargets[difficulty];
    let best: { rows: Criterion[]; cols: Criterion[]; score: number } | null = null;
    outer: for (const row of rows) for (const col of cols) {
      if (new Set([...row, ...col].map(c => c.id)).size !== 6) continue;
      if (excluded.has(combinationKey({ rowCriteria: row as MatrixPuzzle['rowCriteria'], colCriteria: col as MatrixPuzzle['colCriteria'], difficulty }))) continue;
      const candidates = row.flatMap(a => col.map(b => intersections.get(key(a, b)) || []));
      if (candidates.some(ids => !ids.length)) continue;
      const penalty = candidates.reduce((sum, ids) => sum + Math.max(0, minimum - ids.length) ** 2 + Math.max(0, ids.length - maximum) ** 2, 0);
      // Seeded jitter gives different rounds varied near-target boards when the
      // exact overlap bands cannot yet be met by the bundled player database.
      const score = penalty + random() * 12;
      if (best && score >= best.score) continue;
      if (!matchCandidates(candidates)) continue;
      best = { rows: row, cols: col, score };
      if (penalty === 0) break outer;
    }
    if (!best) throw new Error(`No solvable ${difficulty} Matrix board exists in the current catalog.`);
    const rowCriteria = shuffle(best.rows, random) as MatrixPuzzle['rowCriteria'];
    const colCriteria = shuffle(best.cols, random) as MatrixPuzzle['colCriteria'];
    const puzzle: MatrixPuzzle = {
      id: `matrix-${seed}-${difficulty}`, number, difficulty, rowCriteria, colCriteria,
      signature: `${version}|${difficulty}|${[...rowCriteria, ...colCriteria].map(c => c.id).join('|')}`,
    };
    // Bound cache growth across unlimited rounds and difficulty selections.
    if (cache.size >= 96) cache.delete(cache.keys().next().value!);
    cache.set(cacheKey, puzzle);
    return puzzle;
  };
}
