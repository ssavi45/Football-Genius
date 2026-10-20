'use client';

import { useCallback, useEffect, useState } from 'react';
import type { RankingEntry } from './leaderboard';

export interface UseModeLeaderboardResult {
  entries: RankingEntry[];
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function useModeLeaderboard(mode: string, limit = 5): UseModeLeaderboardResult {
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

    void (async () => {
      try {
        const response = await fetch(`/api/leaderboard?mode=${encodeURIComponent(mode)}`, {
          signal: controller.signal,
          cache: 'no-store',
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result?.error || 'Leaderboard is currently unavailable.');
        }
        if (active) {
          const list: RankingEntry[] = Array.isArray(result?.entries) ? result.entries : [];
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
  }, [mode, limit, reloadKey]);

  return { entries, loading, error, retry };
}

