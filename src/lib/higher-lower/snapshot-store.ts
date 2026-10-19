import 'server-only';
import bundled from '@/data/higher-lower-snapshot.json';
import type { HigherLowerSnapshot } from './types';
import { isHigherLowerSnapshot } from './validation';

if (!isHigherLowerSnapshot(bundled)) throw new Error('The bundled Higher or Lower snapshot is invalid.');

let lastGood: HigherLowerSnapshot = bundled;
let checkedAt = 0;
let pending: Promise<HigherLowerSnapshot> | null = null;

async function refresh(): Promise<HigherLowerSnapshot> {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  checkedAt = Date.now();
  if (!url || !key || process.env.HIGHER_LOWER_USE_SUPABASE !== 'true') return lastGood;
  try {
    const endpoint = `${url.replace(/\/$/, '')}/rest/v1/higher_lower_current?id=eq.true&select=snapshot:higher_lower_snapshots(payload)&limit=1`;
    const response = await fetch(endpoint, { headers: { apikey: key, ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}) }, cache: 'no-store', signal: AbortSignal.timeout(3000) });
    if (!response.ok) throw new Error('Snapshot store unavailable');
    const data = await response.json();
    const candidate: unknown = data?.[0]?.snapshot?.payload;
    if (!isHigherLowerSnapshot(candidate)) throw new Error('Invalid published snapshot');
    if (Date.parse(candidate.createdAt) >= Date.parse(lastGood.createdAt)) lastGood = candidate;
  } catch {
    console.warn('Higher or Lower: keeping the last validated snapshot because the latest publication could not be read.');
  }
  return lastGood;
}

export async function getHigherLowerSnapshot(): Promise<HigherLowerSnapshot> {
  if (Date.now() - checkedAt < 60_000) return lastGood;
  if (!pending) pending = refresh().finally(() => { pending = null; });
  return pending;
}
