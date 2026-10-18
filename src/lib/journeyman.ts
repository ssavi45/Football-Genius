export interface JourneyClub { clubId?: string; label: string; logo: string | null; }
export interface JourneyPlayer { id?: string; name: string; aliases: string[]; clubs: JourneyClub[]; puzzleEligible?: boolean; status?: string; }
export interface JourneySearchPlayer { id: string; name: string; aliases: string[]; nationality?: string; nationalityFlag?: string; }
export interface JourneySearchOption { id: string; name: string; typed: boolean; nationality?: string; nationalityFlag?: string; }
export type JourneyOutcome = 'playing' | 'correct' | 'incorrect';
export type JourneyRevealMethod = 'next' | 'random' | 'final';
export interface JourneyReveal { index: number; method: JourneyRevealMethod; }
export interface JourneyResult { name: string; outcome: JourneyOutcome | 'skipped'; points: number; reveals: number; nextReveals: number; }
export interface JourneyState {
  deck: number[]; question: number; reveals: JourneyReveal[]; attempts: number;
  outcome: JourneyOutcome; results: JourneyResult[]; complete: boolean;
}
export const normalizeGuess = (value: string) => value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
export function journeySearchOptions(input: string, directory: JourneySearchPlayer[]): JourneySearchOption[] {
  const query = normalizeGuess(input);
  if (query.length < 2) return [];
  const ranked = directory.flatMap(player => {
    const names = [player.name, ...player.aliases].map(normalizeGuess);
    const rank = names.some(name => name === query) ? 0 : names.some(name => name.startsWith(query)) ? 1 : names.some(name => name.includes(query)) ? 2 : -1;
    return rank < 0 ? [] : [{ player, rank }];
  }).sort((a, b) => a.rank - b.rank || a.player.name.localeCompare(b.player.name));
  const options: JourneySearchOption[] = ranked.slice(0, 5).map(({ player }) => ({ id: player.id, name: player.name, typed: false, nationality: player.nationality, nationalityFlag: player.nationalityFlag }));
  if (!ranked.some(({ rank }) => rank === 0)) options.push({ id: 'typed-name', name: input.trim(), typed: true });
  return options;
}
export const journeyRevealLimit = (totalClubs: number) => Math.min(9, Math.max(0, totalClubs - 2));
export const JOURNEY_SKIPS_PER_ROUND = 3;
export const journeySkipsLeft = (state: Pick<JourneyState, 'results'>) => Math.max(0, JOURNEY_SKIPS_PER_ROUND - state.results.filter(result => result.outcome === 'skipped').length);
export const journeyCanSkip = (state: JourneyState) => !state.complete && state.outcome === 'playing' && state.reveals.length === 0 && journeySkipsLeft(state) > 0;
export const roundJourneyPoints = (points: number) => Math.round((points + Number.EPSILON) * 100) / 100;
export const formatJourneyPoints = (points: number) => String(roundJourneyPoints(points));
export function potentialPoints(totalClubs: number, reveals: readonly JourneyReveal[]): number {
  const hidden = Math.max(0, totalClubs - 2);
  if (!hidden) return 10;
  let points = 10;
  let sequential = 0;
  for (let i = 0; i < Math.min(reveals.length, hidden); i++) {
    if (reveals[i].method === 'next') sequential++;
    const fraction = (i + 1) / hidden;
    const ideal = 10 - 8 * fraction - 4 * (sequential / hidden) * (1 - fraction);
    // Quantize the cumulative target, preventing per-clue rounding drift.
    // Every paid reveal costs at least 0.5; full disclosure still leaves 2/10.
    points = Math.max(2, Math.min(points - 0.5, Math.round((ideal + Number.EPSILON) * 2) / 2));
  }
  return points;
}
export function journeyHiddenClubs(totalClubs: number, reveals: readonly JourneyReveal[]): number[] {
  const disclosed = new Set(reveals.map(reveal => reveal.index));
  return Array.from({ length: Math.max(0, totalClubs - 2) }, (_, index) => index + 1).filter(index => !disclosed.has(index));
}
export function journeyRevealCost(totalClubs: number, reveals: readonly JourneyReveal[], method: 'next' | 'random'): number {
  if (reveals.length >= journeyRevealLimit(totalClubs)) return 0;
  const hidden = journeyHiddenClubs(totalClubs, reveals);
  if (!hidden.length) return 0;
  const after = [...reveals, { index: hidden[0], method: hidden.length === 1 ? 'final' as const : method }];
  // Price is the exact change between the two displayed potential scores.
  return roundJourneyPoints(roundJourneyPoints(potentialPoints(totalClubs, reveals)) - roundJourneyPoints(potentialPoints(totalClubs, after)));
}
export const journeyLastClubLabel = (player: Pick<JourneyPlayer, 'status'>) => player.status === 'active' ? 'CURRENT CLUB' : 'LAST CLUB';
export const visibleClub = (index: number, total: number, reveals: readonly JourneyReveal[], outcome: JourneyOutcome) => outcome !== 'playing' || index === 0 || index === total - 1 || reveals.some(reveal => reveal.index === index);
export function journeyQuestionPool(players: JourneyPlayer[]): JourneyPlayer[] {
  return players.filter(player => player.puzzleEligible === true && player.clubs.length >= 3);
}
export function createJourneyDeck(players: JourneyPlayer[], random: () => number = Math.random, previous: number[] = []): number[] {
  if (players.length < 10) throw new Error('Journeyman requires ten eligible players.');
  const shuffle = (items: number[]) => {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
    return result;
  };
  const all = players.map((_, index) => index);
  const fresh = all.filter(index => !previous.includes(index));
  const available = fresh.length >= 10 ? fresh : all;
  const groups = [
    available.filter(index => players[index].clubs.length <= 5),
    available.filter(index => players[index].clubs.length >= 6 && players[index].clubs.length <= 8),
    available.filter(index => players[index].clubs.length >= 9),
  ];
  const selected = groups.flatMap((group, index) => shuffle(group).slice(0, [4, 4, 2][index]));
  selected.push(...shuffle(available.filter(index => !selected.includes(index))).slice(0, 10 - selected.length));
  return shuffle(selected);
}
export function createJourneyState(deck: number[]): JourneyState {
  return { deck: deck.slice(0, 10), question: 0, reveals: [], attempts: 0, outcome: 'playing', results: [], complete: false };
}
export type JourneyAction = { type: 'guess'; name: string } | { type: 'reveal'; method: 'next' | 'random' } | { type: 'next' };
export function advanceJourney(state: JourneyState, action: JourneyAction, players: JourneyPlayer[], random: () => number = Math.random): JourneyState {
  if (state.complete) return state;
  const player = players[state.deck[state.question]];
  if (action.type === 'reveal') {
    if (state.outcome !== 'playing' || state.reveals.length >= journeyRevealLimit(player.clubs.length)) return state;
    const hidden = journeyHiddenClubs(player.clubs.length, state.reveals);
    if (!hidden.length) return state;
    const method = hidden.length === 1 ? 'final' : action.method;
    const index = method === 'random' ? hidden[Math.min(hidden.length - 1, Math.max(0, Math.floor(random() * hidden.length)))] : hidden[0];
    return { ...state, reveals: [...state.reveals, { index, method }] };
  }
  if (action.type === 'guess') {
    if (state.outcome !== 'playing' || !normalizeGuess(action.name)) return state;
    const correct = [player.name, ...player.aliases].some(name => normalizeGuess(name) === normalizeGuess(action.name));
    const attempts = state.attempts + 1;
    return { ...state, attempts, outcome: correct ? 'correct' : attempts >= 2 ? 'incorrect' : 'playing' };
  }
  if (state.outcome === 'playing' && !journeyCanSkip(state)) return state;
  const results = [...state.results, { name: player.name, outcome: state.outcome === 'playing' ? 'skipped' as const : state.outcome, points: state.outcome === 'correct' ? roundJourneyPoints(potentialPoints(player.clubs.length, state.reveals)) : 0, reveals: state.reveals.length, nextReveals: state.reveals.filter(reveal => reveal.method === 'next').length }];
  return { ...state, results, complete: state.question === state.deck.length - 1, question: Math.min(state.question + 1, state.deck.length - 1), reveals: [], attempts: 0, outcome: 'playing' };
}
