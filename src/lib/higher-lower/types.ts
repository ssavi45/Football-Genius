export type Comparison = 'marketValue' | 'goals' | 'assists' | 'transfer';

export interface PlayerTransfer {
  id: string;
  date: string;
  season: string | null;
  fee: number;
  from: { id: string; name: string; crest: string };
  to: { id: string; name: string; crest: string };
}

export interface CareerTotals {
  appearances: number;
  goals: number | null;
  assists: number | null;
  missingGoals: number;
  missingAssists: number;
}

export interface DatasetPlayer {
  id: string;
  transfermarktId: string;
  name: string;
  sourceName: string;
  sourceUrl: string;
  image: string;
  nationality: string;
  nationalityFlag: string;
  clubId: string | null;
  club: string | null;
  clubBadge: string | null;
  league: string | null;
  position: string | null;
  dateOfBirth: string | null;
  age: number | null;
  isRetired: boolean;
  stats: Record<Exclude<Comparison, 'transfer'>, number | null>;
  marketValueDate: string | null;
  transfers: PlayerTransfer[];
  coverage: {
    scope: 'recorded-senior-career-matches';
    appearances: number;
    club: CareerTotals;
    international: CareerTotals;
    firstSeason: number | null;
    lastSeason: number | null;
    lastMatchAt: string | null;
    missingGoals: number;
    missingAssists: number;
    excluded: Record<string, number>;
  };
  fetchedAt: string;
}

export interface ComparisonPlayer extends DatasetPlayer {
  portrait: string;
  cutout: true;
  selectedTransfer?: PlayerTransfer;
}

export interface HigherLowerSnapshot {
  schemaVersion: 3;
  version: string;
  createdAt: string;
  playerCount: number;
  source: { name: string; adapter: string; url: string };
  scope: Record<Comparison, string>;
  players: DatasetPlayer[];
}
