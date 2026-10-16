export interface LeaderboardEntry { name: string; avatar: string; xp: number; }

export function isLeaderboardEntries(value: unknown): value is LeaderboardEntry[] {
  return Array.isArray(value) && value.length <= 5 && value.every(entry => entry
    && typeof entry.name === 'string' && entry.name.trim().length > 0
    && typeof entry.avatar === 'string' && /^(?:\/(?!\/)|https:\/\/)/.test(entry.avatar)
    && Number.isSafeInteger(entry.xp) && entry.xp >= 0);
}
