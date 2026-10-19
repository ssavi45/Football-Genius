import { accountMode } from './modes';
import type { GameModeId, UserProfile } from '@/lib/types/games';

export interface AccountGameResult { id: string; mode: GameModeId; score: number; won: boolean | null; createdAt: string }
export const HISTORY_UPDATED = 'football-genius-history-updated';
const historyKey = (id: string) => `football_genius_game_history_v1:${id}`;

export function readLocalHistory(id: string): AccountGameResult[] {
  try { return normalizeHistory(JSON.parse(localStorage.getItem(historyKey(id)) || '[]'), true); } catch { return []; }
}

export function appendLocalHistory(id: string, mode: string, won: boolean, score: number) {
  if (!accountMode(mode) || !Number.isFinite(score) || score < 0) return;
  try {
    const item = { id: crypto.randomUUID(), mode, score, won, createdAt: new Date().toISOString() };
    localStorage.setItem(historyKey(id), JSON.stringify([item, ...readLocalHistory(id)].slice(0, 500)));
    window.dispatchEvent(new Event(HISTORY_UPDATED));
  } catch { /* Game results must remain playable if device storage is unavailable. */ }
}

export function normalizeHistory(input: unknown, local = false): AccountGameResult[] {
  if (!Array.isArray(input)) return [];
  return input.flatMap(row => {
    const mode = accountMode(local ? row?.mode : row?.game_mode ?? row?.mode);
    const createdAt = local ? row?.createdAt : row?.created_at;
    if (!mode || !['string', 'number'].includes(typeof row?.id) || !String(row.id).trim() || typeof row?.score !== 'number' || !Number.isFinite(row.score) || row.score < 0 || typeof createdAt !== 'string' || !Number.isFinite(Date.parse(createdAt))) return [];
    return [{ id: String(row.id), mode: mode.id, score: row.score, won: typeof row.won === 'boolean' ? row.won : null, createdAt }];
  }).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function careerAchievements(profile: UserProfile) {
  return [
    { id: 'debut', title: 'First whistle', description: 'Complete your first game.', current: profile.games_played, target: 1, icon: 'game', color: 'blue' },
    { id: 'first-win', title: 'Off the mark', description: 'Win your first game.', current: profile.games_won, target: 1, icon: 'target', color: 'green' },
    { id: 'three-wins', title: 'Hat-trick', description: 'Celebrate three victories.', current: profile.games_won, target: 3, icon: 'trophy', color: 'gold' },
    { id: 'five-streak', title: 'On fire', description: 'Reach a best streak of five.', current: profile.best_streak, target: 5, icon: 'flame', color: 'orange' },
    { id: 'xp-1000', title: 'Football scholar', description: 'Earn 1,000 career XP.', current: profile.total_xp, target: 1000, icon: 'zap', color: 'purple' },
    { id: '25-games', title: 'Matchday regular', description: 'Complete 25 games.', current: profile.games_played, target: 25, icon: 'calendar', color: 'blue' },
    { id: '10-wins', title: 'Winning mentality', description: 'Record ten victories.', current: profile.games_won, target: 10, icon: 'medal', color: 'green' },
    { id: '10-level', title: 'Elite scout', description: 'Reach career level ten.', current: profile.level, target: 10, icon: 'shield', color: 'purple' },
    { id: '100-games', title: 'Club legend', description: 'Complete a century of games.', current: profile.games_played, target: 100, icon: 'crown', color: 'gold' },
  ];
}
