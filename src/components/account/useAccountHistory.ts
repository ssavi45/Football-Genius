'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { HISTORY_UPDATED, normalizeHistory, readLocalHistory, type AccountGameResult } from '@/lib/account/history';

export function useAccountHistory(id: string, guest: boolean, authLoading: boolean) {
  const [history, setHistory] = useState<AccountGameResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    if (authLoading) return;
    let active = true;
    setLoading(true); setError(false); setHistory([]);
    if (guest) {
      const read = () => { setHistory(readLocalHistory(id)); setLoading(false); };
      read(); window.addEventListener(HISTORY_UPDATED, read); window.addEventListener('storage', read);
      return () => { window.removeEventListener(HISTORY_UPDATED, read); window.removeEventListener('storage', read); };
    }
    void (async () => {
      try {
        const sessions = await supabase.from('game_sessions').select('id,game_mode,score,won,created_at').eq('user_id', id).order('created_at', { ascending: false }).limit(200).abortSignal(AbortSignal.timeout(7000));
        if (!sessions.error && sessions.data?.length) { if (active) setHistory(normalizeHistory(sessions.data)); return; }
        const scores = await supabase.from('scores').select('id,mode,score,created_at').eq('user_id', id).order('created_at', { ascending: false }).limit(200).abortSignal(AbortSignal.timeout(7000));
        if (scores.error && sessions.error) throw new Error('History unavailable');
        if (active) setHistory(normalizeHistory(scores.data || sessions.data || []));
      } catch { if (active) setError(true); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [id, guest, authLoading, refresh]);
  return { history, loading, error, retry: () => setRefresh(value => value + 1) };
}
