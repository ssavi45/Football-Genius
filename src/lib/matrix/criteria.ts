import clubBadges from '../../../public/img/higher-lower/club-badges.json';
import type { Criterion } from './types';

const badges = clubBadges as Record<string, string>;
const club = (value: string, label: string): Criterion => ({ id: `club-${value}`, type: 'club', value, label, badgeUrl: badges[value] });
const nation = (value: string, label: string, flag: string): Criterion => ({ id: `nation-${value}`, type: 'nation', value, label, badgeUrl: `/img/country/${flag}.png` });

/** Senior appearances, rather than citizenship or transfer registrations, qualify. */
export const clubCriteria: Criterion[] = [
  club('418', 'Real Madrid'), club('131', 'Barcelona'), club('27', 'Bayern Munich'),
  club('31', 'Liverpool'), club('11', 'Arsenal'), club('631', 'Chelsea'),
  club('506', 'Juventus'), club('281', 'Manchester City'), club('16', 'Dortmund'),
  club('46', 'Inter Milan'), club('583', 'PSG'), club('5', 'AC Milan'),
  club('13', 'Atlético Madrid'), club('148', 'Tottenham'), club('610', 'Ajax'),
];
export const nationCriteria: Criterion[] = [
  nation('3439', 'Brazil', 'brazil'), nation('3437', 'Argentina', 'argentina'),
  nation('3377', 'France', 'france'), nation('3262', 'Germany', 'germany'),
  nation('3375', 'Spain', 'spain'), nation('3376', 'Italy', 'italy'),
  nation('3299', 'England', 'england'), nation('3300', 'Portugal', 'portugal'),
  nation('3379', 'Netherlands', 'netherlands'), nation('3449', 'Uruguay', 'uruguay'),
  nation('3382', 'Belgium', 'belgium'), nation('3556', 'Croatia', 'croatia'),
  nation('3575', 'Morocco', 'morocco'), nation('3499', 'Senegal', 'senegal'),
  nation('3444', 'Nigeria', 'nigeria'),
];

/** Missing statistical evidence remains unknown, never an inferred achievement.
 * Numeric fields come from the versioned Matrix snapshot and its evidence index.
 * uclAllTimeRank must be an externally verified global rank, not a rank of this roster.
 */
export const milestoneCriteria: Criterion[] = [
  { id: 'career-goals-400', type: 'stat', value: 'goals', minimum: 400, label: 'Scored 400+ career goals' },
  { id: 'ucl-titles-3', type: 'stat', value: 'uclTitles', minimum: 3, label: 'Won 3+ Champions League titles' },
  { id: 'world_cup', type: 'trophy', value: 'world_cup', label: 'Won the World Cup' },
  { id: 'ballon_dor', type: 'trophy', value: 'ballon_dor', label: 'Won the Ballon d’Or' },
  { id: 'season-goals-50', type: 'stat', value: 'maxSeasonGoals', minimum: 50, label: 'Scored 50+ goals in a season' },
  { id: 'ucl-top-15', type: 'stat', value: 'uclAllTimeRank', minimum: 1, maximum: 15, label: 'UCL all-time top 15 scorer' },
  { id: 'national-captain', type: 'stat', value: 'seniorCaptainAppearances', minimum: 1, label: 'Captained their national team' },
  { id: 'league-titles-5', type: 'stat', value: 'leagueTitles', minimum: 5, label: 'Won 5+ league titles' },
  { id: 'top-five-clubs-3', type: 'stat', value: 'topFiveLeagueClubs', minimum: 3, label: 'Played for 3+ top-five-league clubs' },
  { id: 'career-assists-200', type: 'stat', value: 'assists', minimum: 200, label: 'Provided 200+ career assists' },
  // Retain existing evidence-backed conditions to support varied, solvable boards.
  { id: 'ucl', type: 'trophy', value: 'ucl', label: 'Won the Champions League' },
  { id: 'copa-america', type: 'trophy', value: 'copa_america', label: 'Won the Copa América' },
  { id: 'career-goals-100', type: 'stat', value: 'goals', minimum: 100, label: 'Scored 100+ career goals' },
  { id: 'senior-caps-100', type: 'stat', value: 'caps', minimum: 100, label: '100+ senior international caps' },
  { id: 'pl-goals-100', type: 'stat', value: 'plGoals', minimum: 100, label: '100+ Premier League goals' },
  { id: 'ucl-goals-50', type: 'stat', value: 'uclGoals', minimum: 50, label: '50+ Champions League goals' },
];
// Clubs/nations retain their badges; statistical and trophy criteria use text only.
export const criteriaCatalog: Criterion[] = [...clubCriteria, ...nationCriteria, ...milestoneCriteria];
