import { NextRequest, NextResponse } from 'next/server';
import { accountMode } from '@/lib/account/modes';
import { readRankingRows } from '@/lib/account/leaderboard';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const selected = request.nextUrl.searchParams.get('mode') || 'combined';
  const mode = accountMode(selected);
  if (selected !== 'combined' && !mode) return NextResponse.json({ error: 'Unknown game mode.' }, { status: 400 });
  if (mode?.comingSoon) return NextResponse.json({ entries: [], comingSoon: true });
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ error: 'Rankings are unavailable right now.' }, { status: 503 });
  try {
    const combined = selected === 'combined';
    const endpoint = combined
      ? '/rest/v1/profiles?select=id,username,avatar_url,total_xp&order=total_xp.desc.nullslast,id.asc&limit=50'
      : '/rest/v1/rpc/get_leaderboard';
    const response = await fetch(`${url.replace(/\/$/, '')}${endpoint}`, {
      method: combined ? 'GET' : 'POST',
      headers: { apikey: key, ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}), 'Content-Type': 'application/json' },
      ...(combined ? {} : { body: JSON.stringify({ p_mode: mode!.legacy, p_period: 'all', p_limit: 50 }) }),
      signal: AbortSignal.timeout(5000), cache: 'no-store',
    });
    if (!response.ok) throw new Error('Ranking service unavailable');
    return NextResponse.json({ entries: readRankingRows(await response.json(), combined), comingSoon: false });
  } catch {
    return NextResponse.json({ error: 'Rankings are unavailable right now. Please try again.' }, { status: 503 });
  }
}
