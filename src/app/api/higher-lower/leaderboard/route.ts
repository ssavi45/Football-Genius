import { NextResponse } from 'next/server';
import { getHigherLowerLeaderboard } from '@/lib/higher-lower/leaderboard-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ entries: await getHigherLowerLeaderboard() }, { headers: { 'Cache-Control': 'no-store' } });
}
