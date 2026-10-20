'use client';

import { useCallback, useEffect, useState } from 'react';
import type { RankingEntry } from './leaderboard';
import type { GameModeId } from '@/lib/types/games';
import { useAuth } from '@/context/auth-context';
import { fetchRankings } from './fetchRankings';

export interface UseModeLeaderboardResult {
  entries: RankingEntry[];
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function useModeLeaderboard(mode: GameModeId | 'combined', limit = 5): UseModeLeaderboardResult {
  const { profile } = useAuth();
  // Refresh after the server commits a result, rather than on an optimistic game update.
  const accountId = profile.is_guest ? null : profile.id;
  const recordedGames = profile.is_guest ? 0 : profile.games_played;
  const avatar = profile.is_guest ? null : profile.avatar_url;
  const username = profile.is_guest ? null : profile.username;
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const retry = useCallback(() => {
    setReloadKey(k => k + 1);
  }, []);

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setEntries([]);

    void (async () => {
      try {
        const list = await fetchRankings(mode, controller.signal);
        if (active) {
          setEntries(list.slice(0, limit));
          setLoading(false);
        }
      } catch (cause) {
        if (active && !controller.signal.aborted) {
          setError(cause instanceof Error ? cause.message : 'Leaderboard is currently unavailable.');
          setEntries([]);
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
      controller.abort();
    };
  }, [mode, limit, reloadKey, accountId, recordedGames, avatar, username]);

  return { entries, loading, error, retry };
}

