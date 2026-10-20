import rawData from '../../data/scoreline-matches.json';
import type { Action, Database, Match, Review, Round, RoundView } from './types';

export const database = rawData as Database;
export const HINT_COSTS = [1, 2, 4] as const;
export const ROUND_LENGTH = 10;
export const MAX_SKIPS = 3;
export const matchesById = new Map(database.matches.map(match => [match.id, match]));
const sum = (values: number[]) => values.reduce((a,b) => a+b, 0);
export const potential = (hints: number[]) => 10 - sum([...new Set(hints)].map(index => HINT_COSTS[index]));

function shuffled<T>(items: T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; }
  return copy;
}

/** Five club + five international fixtures, each with one classic and four modern games. */
export function createRound(id: string, recent: string[] = [], random = Math.random): Round {
  const selected: Match[] = [];
  const seen = new Set(recent);
  const take = (kind: Match['kind'], era: Match['era'], predicate: (m: Match) => boolean = () => true) => {
    const pool = shuffled(database.matches.filter(m => m.kind === kind && m.era === era && predicate(m) && !selected.some(s => s.id === m.id)),random);
    const rating = (match: Match) => {
      const competitionCount = selected.filter(s => s.competition === match.competition).length;
      const decade = Math.floor(Number(match.date.slice(0,4)) / 10);
      const decadeCount = selected.filter(s => s.kind === kind && Math.floor(Number(s.date.slice(0,4)) / 10) === decade).length;
      const teamRepeats = selected.filter(s => [s.homeTeam,s.awayTeam].some(t => t === match.homeTeam || t === match.awayTeam)).length;
      return (seen.has(match.id) ? 1000 : 0) + (competitionCount >= 3 ? 500 : competitionCount * 12) + decadeCount * 20 + teamRepeats * 3;
    };
    pool.sort((a,b) => rating(a)-rating(b));
    if (!pool[0]) throw new Error('Not enough matches for a balanced round.');
    selected.push(pool[0]);
  };
  take('club','classic'); take('international','classic');
  take('club','modern', m => !['ucl','europa'].includes(m.competition));
  take('club','modern', m => ['ucl','europa'].includes(m.competition));
  take('club','modern'); take('club','modern');
  take('international','modern',m => m.competition === 'copa-america');
  take('international','modern',m => m.competition === 'euro');
  take('international','modern',m => m.competition === 'world-cup');
  take('international','modern');
  const clubs = shuffled(selected.filter(m => m.kind === 'club'),random);
  const internationals = shuffled(selected.filter(m => m.kind === 'international'),random);
  // Alternate the two categories while varying which one opens the round.
  const pairs = clubs.flatMap((club,i) => random() < .5 ? [club,internationals[i]] : [internationals[i],club]);
  return { version: 1, id, matchIds: pairs.map(m => m.id), index: 0, hints: [], answers: [], skips: 0, complete: false, createdAt: Date.now() };
}

export function transition(round: Round, action: Action): Round {
  if (round.complete) throw new Error('This round is complete. Start a new round to play again.');
  const next: Round = structuredClone(round);
  const answered = next.answers.length > next.index;
  const match = matchesById.get(next.matchIds[next.index]);
  if (!match) throw new Error('This match is unavailable.');
  if (action.type === 'hint') {
    if (answered) throw new Error('This match has already been answered.');
    if (!Number.isInteger(action.hint) || action.hint < 0 || action.hint > 2) throw new Error('Choose a valid hint.');
    if (!next.hints.includes(action.hint)) next.hints.push(action.hint);
  } else if (action.type === 'submit') {
    if (answered) return next;
    if (![action.home,action.away].every(score => Number.isInteger(score) && score >= 0 && score <= 99)) throw new Error('Scores must be whole numbers between 0 and 99.');
    const exact = action.home === match.score.home && action.away === match.score.away;
    next.answers.push({ matchId: match.id, home: action.home, away: action.away, hints: [...next.hints], points: exact ? potential(next.hints) : 0, skipped: false });
  } else if (action.type === 'skip') {
    if (answered) throw new Error('Use Next Match after submitting.');
    if (next.skips >= MAX_SKIPS) throw new Error('You have used all three skips. Submit a prediction to continue.');
    next.skips++;
    next.answers.push({matchId: match.id,home:null,away:null,hints:[...next.hints],points:0,skipped:true});
    advance(next);
  } else if (action.type === 'next') {
    if (!answered) throw new Error('Submit a prediction or use a skip first.');
    advance(next);
  }
  return next;
}
function advance(round: Round) {
  if (round.index === ROUND_LENGTH - 1) round.complete = true;
  else { round.index++; round.hints = []; }
}
function review(round: Round, index: number): Review {
  const answer = round.answers[index], match = matchesById.get(answer.matchId)!;
  return { ...answer, homeTeam: database.teams[match.homeTeam], awayTeam: database.teams[match.awayTeam], score: match.score, date: match.date, competition: match.competitionLabel, sources: match.sources };
}
/** Future scores and locked hint text never enter the public response. */
export function roundView(round: Round, token: string): RoundView {
  const match = matchesById.get(round.matchIds[round.index])!;
  const upcoming=!round.complete?matchesById.get(round.matchIds[round.index+1]):undefined;
  return {
    upcomingImages:upcoming?[database.competitions[upcoming.competition].banner,database.teams[upcoming.homeTeam].emblem,database.teams[upcoming.awayTeam].emblem]:[],
    token,id:round.id,currentQuestion:round.complete ? ROUND_LENGTH : round.index+1,totalQuestions:ROUND_LENGTH,
    score:sum(round.answers.map(a=>a.points)),potential:round.complete ? 0 : potential(round.hints),skipsLeft:MAX_SKIPS-round.skips,complete:round.complete,
    match:round.complete ? null : { id:match.id,date:match.date,kind:match.kind,competition:database.competitions[match.competition],competitionLabel:match.competitionLabel,stage:match.stage,homeTeam:database.teams[match.homeTeam],awayTeam:database.teams[match.awayTeam],venue:match.venue,hints:HINT_COSTS.map((cost,index)=>({cost,text:round.hints.includes(index) ? match.hints[index] : null})) },
    feedback:!round.complete && round.answers.length>round.index ? review(round,round.index) : null,
    progress:round.matchIds.map((_,i)=>{const a=round.answers[i];return !a ? 'pending' : a.skipped ? 'skipped' : a.points>0 ? 'correct' : 'incorrect';}),
    review:round.complete ? round.answers.map((_,index)=>review(round,index)) : [],
  };
}
