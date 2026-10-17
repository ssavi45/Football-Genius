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
  const key = (a: Criterion, b: Criterion) => a.id < b.id ? a.id + '|' + b.id : b.id + '|' + a.id;
  for (let i = 0; i < available.length; i++) for (let j = i + 1; j < available.length; j++) {
    const a = available[i], b = available[j];
    intersections.set(key(a, b), [...eligible.get(a.id)!].filter(id => eligible.get(b.id)!.has(id)));
  }
  const clubTriples = triples(available.filter(c => c.type === 'club'));
  const nationTriples = triples(available.filter(c => c.type === 'nation'));
  const milestoneTriples = triples(available.filter(c => c.type === 'stat' || c.type === 'trophy'));
  type Option = { rows: Criterion[]; cols: Criterion[]; penalty: number; combination: string; solvable?: boolean };
  const pools = new Map<MatrixDifficulty, Option[]>();
  const candidatesFor = (rows: Criterion[], cols: Criterion[]) =>
    rows.flatMap(a => cols.map(b => intersections.get(key(a, b)) || []));
  function poolFor(difficulty: MatrixDifficulty): Option[] {
    const cached = pools.get(difficulty);
    if (cached) return cached;
    const rows = difficulty === 'hard' ? milestoneTriples : clubTriples;
    const cols = difficulty === 'easy' ? nationTriples : milestoneTriples;
    const [minimum, maximum] = overlapTargets[difficulty];
    const options: Option[] = [];
    for (let r = 0; r < rows.length; r++) for (let c = difficulty === 'hard' ? r + 1 : 0; c < cols.length; c++) {
      const row = rows[r], col = cols[c];
      if (row.some(a => col.some(b => a.id === b.id))) continue;
      const candidates = candidatesFor(row, col);
      if (candidates.some(ids => !ids.length)) continue;
      const penalty = candidates.reduce((sum, ids) => sum + Math.max(0, minimum - ids.length) ** 2 + Math.max(0, ids.length - maximum) ** 2, 0);
      options.push({ rows: row, cols: col, penalty,
        combination: combinationKey({ rowCriteria: row as MatrixPuzzle['rowCriteria'], colCriteria: col as MatrixPuzzle['colCriteria'], difficulty }) });
    }
    options.sort((a, b) => a.penalty - b.penalty);
    pools.set(difficulty, options);
    return options;
  }
  const cache = new Map<string, MatrixPuzzle>();
  return (seed: string, difficulty: MatrixDifficulty, number: number, history: string[] = []): MatrixPuzzle => {
    const cacheKey = `${seed}:${difficulty}:${number}:${history.join(';')}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;
    const random = seededRandom(`${version}:${seed}:${difficulty}`);
    const excluded = new Set(history);
    const options = poolFor(difficulty);
    let best: Option | null = null, start = 0;
    // Precompute immutable intersections/penalties once per dataset rather than
    // re-enumerating the expanded catalog on every unlimited-round request.
    while (!best && start < options.length) {
      while (start < options.length && (options[start].solvable === false || excluded.has(options[start].combination))) start++;
      if (start === options.length) break;
      const floor = options[start].penalty;
      const ceiling = floor === 0 ? 0 : floor + 12;
      let end = start;
      const choices: Option[] = [];
      while (end < options.length && options[end].penalty <= ceiling) {
        const option = options[end++];
        if (option.solvable !== false && !excluded.has(option.combination)) choices.push(option);
      }
      // Seeded sampling keeps near-target boards varied. Every selected option
      // must still pass the complete nine-distinct-player matching check.
      const offset = Math.floor(random() * choices.length);
      for (let index = 0; index < choices.length; index++) {
        const option = choices[(index + offset) % choices.length];
        if (option.solvable === undefined) option.solvable = Boolean(matchCandidates(candidatesFor(option.rows, option.cols)));
        if (option.solvable) { best = option; break; }
      }
      start = end;
    }
    if (!best) throw new Error(`No solvable ${difficulty} Matrix board exists in the current catalog.`);
    const swap = difficulty === 'hard' && random() < .5;
    const rowCriteria = shuffle(swap ? best.cols : best.rows, random) as MatrixPuzzle['rowCriteria'];
    const colCriteria = shuffle(swap ? best.rows : best.cols, random) as MatrixPuzzle['colCriteria'];
    const puzzle: MatrixPuzzle = {
      id: `matrix-${seed}-${difficulty}`, number, difficulty, rowCriteria, colCriteria,
      signature: `${version}|${difficulty}|${[...rowCriteria, ...colCriteria].map(c => c.id).join('|')}`,
    };
    if (cache.size >= 96) cache.delete(cache.keys().next().value!);
    cache.set(cacheKey, puzzle);
    return puzzle;
  };
}
