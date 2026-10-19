export interface RankingEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string | null;
  score: number;
  level?: number;
  games?: number;
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
