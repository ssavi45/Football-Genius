export type CriterionType = 'club' | 'nation' | 'trophy' | 'stat';
export type MatrixDifficulty = 'easy' | 'medium' | 'hard';
export interface MatrixPlayer {
  id: string;
  name: string;
  sourceName: string;
  nationality: string;
  nationalityFlag: string;
  club: string | null;
  clubs: string[];
  nations: string[];
  honours: string[];
  stats: Record<string, number | null>;
  photoUrl: string;
  sourceUrl: string;
}
// Serializable definitions: validation functions stay in the game engine.
export interface Criterion {
  id: string;
  type: CriterionType;
  label: string;
  shortLabel?: string;
  value: string;
  minimum?: number;
  maximum?: number;
  badgeUrl?: string;
}
export interface MatrixPuzzle {
  id: string;
  number: number;
  signature: string;
  difficulty: MatrixDifficulty;
  rowCriteria: [Criterion, Criterion, Criterion];
  colCriteria: [Criterion, Criterion, Criterion];
}
export interface MatrixState {
  puzzleId: string;
  signature: string;
  answers: (string | null)[];
  submitted: boolean;
  revision: number;
}
export type MatrixCellResult = 'correct' | 'incorrect' | 'blank' | null;
export interface MatrixView {
  cells: (string | null)[];
  usedIds: string[];
  filled: number;
  correct: number | null;
  incorrect: number | null;
  blank: number;
  results: MatrixCellResult[];
  won: boolean;
  finished: boolean;
  xp: number;
}
export interface MatrixSession {
  puzzle: MatrixPuzzle;
  state: MatrixState;
  history: string[];
}
