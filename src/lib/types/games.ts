export type GameModeId =
  | 'the-decoy'
  | 'scoreline'
  | 'scouts-duel'
  | 'matrix'
  | 'journeyman'
  | 'higher-lower'
  | 'tunnel-talk'
  | 'scramble'
  | 'pixel-pitch';

export type GameCategory = 'all' | 'daily' | 'trivia' | 'pvp' | 'strategy';

export interface GameModeInfo {
  id: GameModeId;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  badge: 'DAILY' | 'HOT' | 'PVP' | 'CLASSIC' | 'NEW';
  category: 'daily' | 'trivia' | 'pvp' | 'strategy';
  cardArt: string;
  accentColor: string;
  iconName: string;
  route: string;
  playersCount?: string;
  dailyReward?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  avatar_url?: string;
  total_xp: number;
  level: number;
  current_streak: number;
  best_streak: number;
  coins: number;
  is_guest: boolean;
  games_played: number;
  games_won: number;
  created_at: string;
  last_played_at?: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  avatar_url?: string;
  score: number;
  mode?: string;
  level?: number;
  is_current_user?: boolean;
}

export interface PlayerTransferClub {
  label: string;
  logo: string;
}

export interface TransferPlayer {
  name: string;
  aliases: string[];
  clubs: PlayerTransferClub[];
}

export interface GridPlayer {
  id: string;
  name: string;
  nationality: string;
  clubs: string[];
  achievements?: string[];
  position?: string;
}

export interface HigherLowerPlayer {
  name: string;
  club: string;
  clubLogo: string;
  marketValue: number; // in millions
  marketValueStr: string;
  photoUrl: string;
  nationality: string;
  position: string;
}

export interface QuoteTriviaQuestion {
  quote: string;
  speaker: string;
  context: string;
  year?: string;
  options: string[];
  explanation: string;
}

export interface ScorelineMatch {
  id: string;
  date: string;
  competition: string;
  homeTeam: {
    name: string;
    logo: string;
    code: string;
  };
  awayTeam: {
    name: string;
    logo: string;
    code: string;
  };
  actualScore: {
    home: number;
    away: number;
  };
  hints: {
    competitionStage: string;
    halfTimeScore: string;
    keyFact: string;
    dramaQuote: string;
  };
}

