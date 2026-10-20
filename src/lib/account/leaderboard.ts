export interface RankingEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string | null;
  score: number;
  level?: number;
  games?: number;
}

export function isRankingEntries(input: unknown): input is RankingEntry[] {
  if (!Array.isArray(input)) return false;
  const seen = new Set<string>();
  return input.every(entry => {
    if (!entry || typeof entry !== 'object' || typeof entry.userId !== 'string' || !entry.userId.trim() || seen.has(entry.userId)
      || typeof entry.name !== 'string' || !entry.name.trim() || !Number.isSafeInteger(entry.rank) || entry.rank < 1
      || typeof entry.score !== 'number' || !Number.isFinite(entry.score) || entry.score < 0
      || !(entry.avatar === null || (typeof entry.avatar === 'string' && /^(?:\/(?!\/)|https:\/\/)/.test(entry.avatar)))
      || (entry.games !== undefined && (!Number.isSafeInteger(entry.games) || entry.games < 0))
      || (entry.level !== undefined && (!Number.isSafeInteger(entry.level) || entry.level < 1))) return false;
    seen.add(entry.userId);
    return true;
  });
}

export function rankingUnit(mode: string) {
  return mode === 'combined' ? 'XP' : mode === 'matrix' ? 'cells' : mode === 'higher-lower' ? 'picks' : 'pts';
}

export function readRankingRows(input: unknown, combined: boolean): RankingEntry[] {
  if (!Array.isArray(input)) throw new Error('Invalid ranking data');
  return input.map((row, index) => {
    const rawScore = combined ? row?.total_xp : row?.best_score;
    const score = rawScore === null ? 0 : rawScore;
    const userId = combined ? row?.id : row?.user_id;
    const rank = combined ? index + 1 : Number(row?.rank);
    if (typeof userId !== 'string' || typeof score !== 'number' || !Number.isFinite(score) || score < 0 || !Number.isSafeInteger(rank) || rank < 1) {
      throw new Error('Invalid ranking entry');
    }
    const avatar = typeof row.avatar_url === 'string' && /^(?:\/(?!\/)|https:\/\/)/.test(row.avatar_url) ? row.avatar_url : null;
    return {
      rank, userId, name: typeof row.username === 'string' && row.username.trim() ? row.username : 'Football fan', avatar, score,
      ...(combined ? { level: Math.floor(score / 200) + 1 } : { games: Math.max(0, Number(row.games_played) || 0) }),
    };
  });
}
