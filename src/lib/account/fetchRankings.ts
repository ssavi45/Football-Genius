import type { GameModeId } from '@/lib/types/games';
import { isRankingEntries, type RankingEntry } from './leaderboard';

export async function fetchRankings(mode: GameModeId | 'combined', signal: AbortSignal): Promise<RankingEntry[]> {
  const response = await fetch(`/api/leaderboard?mode=${encodeURIComponent(mode)}`, { signal, cache: 'no-store' });
  const result: unknown = await response.json();
  if (!response.ok || !result || typeof result !== 'object' || !('entries' in result) || !isRankingEntries(result.entries)) {
    throw new Error('Rankings are unavailable right now. Please try again.');
  }
  return result.entries;
}
