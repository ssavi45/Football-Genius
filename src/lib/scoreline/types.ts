export type MatchKind = 'club' | 'international';
export interface Team { id: string; name: string; kind: MatchKind; emblem: string; }
export interface Competition { id: string; name: string; kind: MatchKind; banner: string; }
export interface Match {
  id: string; date: string; competition: string; competitionLabel: string; kind: MatchKind;
  era: 'classic' | 'modern'; stage: string; homeTeam: string; awayTeam: string; venue: string;
  score: { home: number; away: number }; extraTime: boolean; shootoutWinner: string | null;
  hints: string[]; sources: string[];
}
export interface Database { schemaVersion: number; scoreConvention: string; competitions: Record<string, Competition>; teams: Record<string, Team>; matches: Match[]; }
export interface Answer { matchId: string; home: number | null; away: number | null; hints: number[]; points: number; skipped: boolean; }
export interface Round {
  version: 1; id: string; matchIds: string[]; index: number; hints: number[];
  answers: Answer[]; skips: number; complete: boolean; createdAt: number;
}
export interface PublicMatch {
  id: string; date: string; kind: MatchKind; competition: Competition; competitionLabel: string;
  stage: string; homeTeam: Team; awayTeam: Team; venue: string;
  hints: { cost: number; text: string | null }[];
}
export interface Review extends Answer { homeTeam: Team; awayTeam: Team; score: Match['score']; date: string; competition: string; sources: string[]; }
export interface RoundView {
  token: string; id: string; currentQuestion: number; totalQuestions: number; score: number;
  potential: number; skipsLeft: number; complete: boolean; match: PublicMatch | null;
  feedback: Review | null; progress: ('pending' | 'correct' | 'incorrect' | 'skipped')[];
  review: Review[];
}
export type Action = { type: 'hint'; hint: number } | { type: 'submit'; home: number; away: number } | { type: 'skip' } | { type: 'next' };
