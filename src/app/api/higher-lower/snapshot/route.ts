import { NextResponse } from 'next/server';
import { getHigherLowerSnapshot } from '@/lib/higher-lower/snapshot-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(await getHigherLowerSnapshot(), { headers: { 'Cache-Control': 'no-store' } });
}
