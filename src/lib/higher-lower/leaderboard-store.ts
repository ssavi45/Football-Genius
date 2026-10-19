import 'server-only';
import { isLeaderboardEntries, type LeaderboardEntry } from './leaderboard';

let lastGood: LeaderboardEntry[] = [];
let checkedAt = 0;
let pending: Promise<LeaderboardEntry[]> | null = null;

async function refresh(): Promise<LeaderboardEntry[]> {
  checkedAt = Date.now();
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return lastGood;
  try {
    // Public read only. No browser SDK request or privileged database key is needed.
    const endpoint = `${url.replace(/\/$/, '')}/rest/v1/profiles?select=username,avatar_url,total_xp&order=total_xp.desc.nullslast&limit=5`;
    const response = await fetch(endpoint, {
      headers: { apikey: key, ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}) },
      cache: 'no-store', signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return lastGood;
    const rows: unknown = await response.json();
    if (!Array.isArray(rows) || rows.length > 5) return lastGood;
    const entries = rows.map(row => ({
      name: row?.username == null ? 'Football Fan' : row.username,
      avatar: typeof row?.avatar_url === 'string' && /^(?:\/(?!\/)|https:\/\/)/.test(row.avatar_url)
        ? row.avatar_url : '/img/players/bellingham.jpg',
      xp: row?.total_xp,
    }));
    if (isLeaderboardEntries(entries)) lastGood = entries;
  } catch {
    // An optional leaderboard outage must not produce a browser runtime error.
  }
  return lastGood;
}

export async function getHigherLowerLeaderboard(): Promise<LeaderboardEntry[]> {
  if (pending) return pending;
  if (Date.now() - checkedAt < 60_000) return lastGood;
  if (!pending) pending = refresh().finally(() => { pending = null; });
  return pending;
}
