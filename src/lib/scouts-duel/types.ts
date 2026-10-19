export type Seat = 0 | 1;
export type Difficulty = 'rookie' | 'tactician' | 'world-class';
export interface ScoutPlayer {
  id: string; name: string; image: string; nationality: string; nationalityFlag: string;
  continent: string; club: string; clubBadge: string | null; league: string | null;
  position: 'GK' | 'DF' | 'MF' | 'FW'; footedness: 'left' | 'right' | 'both';
  isRetired: boolean; age: number | null; ballonDor: boolean; worldCupWinner: boolean;
  clWinner: boolean; pastClubs: string[] | null;
}
export type Category = 'Position' | 'Region' | 'League' | 'Status' | 'Awards' | 'Physical';
export interface ScoutQuestion { id: string; category: Category; text: string; kind: 'position' | 'nation' | 'continent' | 'league' | 'club' | 'pastClub' | 'status' | 'award' | 'foot' | 'age'; value: string; }
// hardcore is retained for compatibility with saved rooms; shots are unlimited.
export interface ScoutOptions { difficulty: Difficulty; assistance: boolean; hardcore: boolean; turnSeconds: 45 | 60; }
export interface ScoutMember {
  name: string; tokenHash: string; userId: string | null; bot: boolean; secretId: string | null;
  remaining: string[]; deductions: string[]; forcedOut: string[]; questions: string[];
  turns: number; misses: number; shootBlockedUntil: number; lastSeen: number; shootoutGuess: string | null;
}
export interface ScoutLog { id: number; seat: Seat; kind: 'question' | 'shoot' | 'timeout'; text: string; answer: boolean | null; at: number; }
// Private server state. Never serialize this object to a browser or Realtime.
export interface ScoutRoom {
  id: string; code: string; mode: 'ai' | 'online' | 'custom'; version: number; datasetVersion: string;
  // 'shootout' is accepted only to resume rooms saved under the old turn cap.
  seed: string; boardIds: string[]; options: ScoutOptions; status: 'waiting' | 'selecting' | 'active' | 'shootout' | 'completed';
  members: [ScoutMember, ScoutMember | null]; activeSeat: Seat; deadline: number;
  winner: Seat | null; reason: string | null; logs: ScoutLog[]; processed: string[];
  createdAt: number; updatedAt: number; aiDue: number | null;
  pause: { seat: Seat; since: number; remainingMs: number } | null;
}
export interface ScoutView {
  id: string; code: string; mode: ScoutRoom['mode']; version: number; datasetVersion: string; seed: string;
  status: ScoutRoom['status']; board: ScoutPlayer[]; options: ScoutOptions; seat: Seat; activeSeat: Seat;
  deadline: number; serverNow: number; mySecret: ScoutPlayer | null; opponentLocked: boolean;
  opponentName: string; opponentRemaining: number; remaining: string[]; forcedOut: string[];
  questionCount: number; askedIds: string[]; turn: number; shootAllowed: boolean; misses: number;
  logs: ScoutLog[]; winner: Seat | null; reason: string | null; secrets: [ScoutPlayer | null, ScoutPlayer | null] | null;
  pause: { seat: Seat; until: number } | null; shootoutSubmitted: boolean; earnedXp: number; rewardOnServer: boolean;
}
export type ScoutAction = { type: 'LOCK_IN_PLAYER'; playerId: string }
  | { type: 'ASK_QUESTION'; questionId: string }
  | { type: 'SHOOT_GUESS'; playerId: string }
  | { type: 'UPDATE_BOARD_STATE'; playerId: string }
  | { type: 'RESIGN' };
