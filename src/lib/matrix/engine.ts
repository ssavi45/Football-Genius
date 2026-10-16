import type { Criterion, MatrixDifficulty, MatrixPlayer, MatrixPuzzle, MatrixSession, MatrixState, MatrixView } from './types';

export const MATRIX_CELLS = 9;
export function satisfies(player: MatrixPlayer, criterion: Criterion): boolean {
  switch (criterion.type) {
    case 'club': return player.clubs.includes(criterion.value);
    case 'nation': return player.nations.includes(criterion.value);
    case 'trophy': return player.honours.includes(criterion.value);
    case 'stat': {
      const value = player.stats[criterion.value];
      return typeof value === 'number' && Number.isFinite(value)
        && value >= (criterion.minimum ?? 0) && value <= (criterion.maximum ?? Infinity);
    }
  }
}
export function qualifies(player: MatrixPlayer, puzzle: MatrixPuzzle, cell: number): boolean {
  return Number.isInteger(cell) && cell >= 0 && cell < 9
    && satisfies(player, puzzle.rowCriteria[Math.floor(cell / 3)]) && satisfies(player, puzzle.colCriteria[cell % 3]);
}
export function emptyState(puzzle: MatrixPuzzle): MatrixState {
  return { puzzleId: puzzle.id, signature: puzzle.signature, answers: Array(MATRIX_CELLS).fill(null), submitted: false, revision: 0 };
}
/** Drafts never evaluate criteria, expose result counts, or award XP. */
export function viewState(state: MatrixState, puzzle: MatrixPuzzle, players: MatrixPlayer[]): MatrixView {
  const byId = new Map(players.map(p => [p.id, p]));
  const cells = [...state.answers];
  const results = cells.map((id, cell) => !state.submitted ? null : !id ? 'blank' : qualifies(byId.get(id)!, puzzle, cell) ? 'correct' : 'incorrect');
  const filled = cells.filter(Boolean).length;
  const correct = state.submitted ? results.filter(r => r === 'correct').length : null;
  const incorrect = state.submitted ? results.filter(r => r === 'incorrect').length : null;
  return { cells, usedIds: cells.filter((id): id is string => id !== null), filled, correct, incorrect,
    blank: MATRIX_CELLS - filled, results, won: correct === MATRIX_CELLS, finished: state.submitted,
    xp: (correct ?? 0) * 25 + (correct === MATRIX_CELLS ? 100 : 0) };
}
/** Set, replace or remove a draft answer; each identity occupies at most one cell. */
export function setAnswer(state: MatrixState, players: MatrixPlayer[], cell: number, playerId: string | null): MatrixState {
  if (state.submitted || !Number.isInteger(cell) || cell < 0 || cell >= MATRIX_CELLS
    || state.answers[cell] === playerId || (playerId !== null && (!players.some(p => p.id === playerId)
      || state.answers.some((id, index) => index !== cell && id === playerId)))) return state;
  return { ...state, answers: state.answers.map((id, index) => index === cell ? playerId : id), revision: state.revision + 1 };
}
export function clearAnswers(state: MatrixState): MatrixState {
  return state.submitted || state.answers.every(id => id === null) ? state
    : { ...state, answers: Array(MATRIX_CELLS).fill(null), revision: state.revision + 1 };
}
/** This is the only action that locks the board and reveals its result. Blanks are valid. */
export function submitGrid(state: MatrixState): MatrixState {
  return state.submitted ? state : { ...state, submitted: true, revision: state.revision + 1 };
}
export function restoreState(value: unknown, puzzle: MatrixPuzzle, players: MatrixPlayer[]): MatrixState | null {
  if (!value || typeof value !== 'object') return null;
  const saved = value as MatrixState;
  if (saved.puzzleId !== puzzle.id || saved.signature !== puzzle.signature || typeof saved.submitted !== 'boolean'
    || !Number.isSafeInteger(saved.revision) || saved.revision < 0 || (saved.submitted && saved.revision === 0)
    || !Array.isArray(saved.answers) || saved.answers.length !== MATRIX_CELLS) return null;
  const known = new Set(players.map(p => p.id));
  const used = new Set<string>();
  for (const id of saved.answers) {
    if (id === null) continue;
    if (typeof id !== 'string' || !known.has(id) || used.has(id)) return null;
    used.add(id);
  }
  return { puzzleId: puzzle.id, signature: puzzle.signature, answers: [...saved.answers], submitted: saved.submitted, revision: saved.revision };
}
/** Ignore row/column ordering when avoiding repeated combinations. */
export function combinationKey(puzzle: Pick<MatrixPuzzle, 'rowCriteria' | 'colCriteria' | 'difficulty'>): string {
  const axes = [puzzle.rowCriteria.map(c => c.id).sort().join(','), puzzle.colCriteria.map(c => c.id).sort().join(',')];
  if (puzzle.difficulty === 'hard') axes.sort();
  return axes.join('/');
}
export function restoreSession(value: unknown, players: MatrixPlayer[], catalog: Criterion[], version: string, difficulty: MatrixDifficulty): MatrixSession | null {
  if (!value || typeof value !== 'object') return null;
  const saved = value as MatrixSession, p = saved.puzzle;
  if (!p || p.difficulty !== difficulty || typeof p.id !== 'string' || !/^matrix-[a-zA-Z0-9-]{1,110}$/.test(p.id)
    || !Number.isSafeInteger(p.number) || p.number < 1 || !Array.isArray(p.rowCriteria) || p.rowCriteria.length !== 3
    || !Array.isArray(p.colCriteria) || p.colCriteria.length !== 3) return null;
  const canonical = new Map(catalog.map(c => [c.id, c]));
  const criteria = [...p.rowCriteria, ...p.colCriteria].map(c => c && canonical.get(c.id));
  if (criteria.some(c => !c) || new Set(criteria.map(c => c!.id)).size !== 6) return null;
  const rowCriteria = criteria.slice(0, 3) as MatrixPuzzle['rowCriteria'];
  const colCriteria = criteria.slice(3) as MatrixPuzzle['colCriteria'];
  const milestone = (c: Criterion) => c.type === 'stat' || c.type === 'trophy';
  if (!rowCriteria.every(c => difficulty === 'hard' ? milestone(c) : c.type === 'club')
    || !colCriteria.every(c => difficulty === 'easy' ? c.type === 'nation' : milestone(c))) return null;
  const signature = `${version}|${difficulty}|${criteria.map(c => c!.id).join('|')}`;
  if (p.signature !== signature) return null;
  const puzzle: MatrixPuzzle = { id: p.id, number: p.number, difficulty, signature, rowCriteria, colCriteria };
  const state = restoreState(saved.state, puzzle, players);
  if (!state || !findSolution(puzzle, players)) return null;
  const currentKey = combinationKey(puzzle);
  const history = Array.isArray(saved.history) ? saved.history.filter(k => typeof k === 'string' && k.length < 500 && k !== currentKey).slice(-199) : [];
  return { puzzle, state, history: [...new Set([...history, currentKey])] };
}
/** A cell review is deliberately unavailable until the entire grid is submitted. */
export function cellReview(state: MatrixState, puzzle: MatrixPuzzle, players: MatrixPlayer[], cell: number) {
  if (!state.submitted || !Number.isInteger(cell) || cell < 0 || cell >= MATRIX_CELLS) return null;
  const player = players.find(p => p.id === state.answers[cell]) ?? null;
  return { player, criteria: [puzzle.rowCriteria[Math.floor(cell / 3)], puzzle.colCriteria[cell % 3]].map((criterion, index) => ({
    criterion, axis: index === 0 ? 'Row' : 'Column', matches: player ? satisfies(player, criterion) : null,
  })), explanation: player ? explainMismatch(player, puzzle, cell) : 'No player was selected for this square.' };
}
export function explainMismatch(player: MatrixPlayer, puzzle: MatrixPuzzle, cell: number): string {
  const criteria = [puzzle.rowCriteria[Math.floor(cell / 3)], puzzle.colCriteria[cell % 3]];
  const missing = criteria.filter(c => !satisfies(player, c));
  return missing.map(c => c.type === 'club'
    ? `${player.name} has no recorded senior competitive appearance for ${c.label}.`
    : c.type === 'nation' ? `${player.name} has no recorded senior international appearance for ${c.label}.`
      : c.type === 'trophy' ? `${player.name} has no verified “${c.label}” honour on record.`
        : player.stats[c.value] == null ? `A verified ${c.label.toLowerCase()} total isn't available for ${player.name}.`
          : `${player.name} does not meet “${c.label}”.`).join(' ');
}
export function normalizeSearch(value: string): string {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[’']/g, '').toLowerCase().trim();
}
export function searchPlayers(players: MatrixPlayer[], query: string): MatrixPlayer[] {
  const terms = normalizeSearch(query).split(/\s+/);
  if (normalizeSearch(query).length < 2) return [];
  return players.filter(p => terms.every(term => normalizeSearch(`${p.name} ${p.sourceName}`).includes(term)))
    .sort((a, b) => Number(normalizeSearch(b.name).startsWith(normalizeSearch(query))) - Number(normalizeSearch(a.name).startsWith(normalizeSearch(query))) || a.name.localeCompare(b.name)).slice(0, 30);
}
export function shareText(puzzle: MatrixPuzzle, view: MatrixView): string {
  if (!view.finished) return '';
  const tiles = view.results.map(r => r === 'correct' ? '🟩' : r === 'incorrect' ? '🟥' : '⬛');
  const board = Array.from({ length: 3 }, (_, row) => tiles.slice(row * 3, row * 3 + 3).join('')).join('\n');
  const difficulty = puzzle.difficulty[0].toUpperCase() + puzzle.difficulty.slice(1);
  return `Football Matrix \u26bd\nRound ${puzzle.number} \u00b7 ${difficulty} \u00b7 Score: ${view.correct}/9\n${board}\n${view.incorrect} incorrect \u00b7 ${view.blank} blank \u00b7 ${view.xp} XP\nhttps://footygen.online/games/matrix?difficulty=${puzzle.difficulty}`;
}
/** A matching over all nine cells proves the puzzle allows nine DIFFERENT identities. */
export function findSolution(puzzle: MatrixPuzzle, players: MatrixPlayer[]): string[] | null {
  const candidates = Array.from({ length: 9 }, (_, cell) => players.filter(p => qualifies(p, puzzle, cell)).map(p => p.id));
  return matchCandidates(candidates);
}
/** Augmenting paths also reject nonempty cells that share too few distinct players. */
export function matchCandidates(candidates: string[][]): string[] | null {
  const order = candidates.map((ids, cell) => ({ ids, cell })).sort((a, b) => a.ids.length - b.ids.length);
  const owner = new Map<string, number>();
  function match(cell: number, visited: Set<string>): boolean {
    for (const id of candidates[cell]) if (!visited.has(id)) {
      visited.add(id);
      const previous = owner.get(id);
      if (previous === undefined || match(previous, visited)) {
        owner.set(id, cell); return true;
      }
    }
    return false;
  }
  for (const { cell } of order) if (!match(cell, new Set())) return null;
  const result = Array<string>(candidates.length);
  for (const [id, cell] of owner) result[cell] = id;
  return result;
}
