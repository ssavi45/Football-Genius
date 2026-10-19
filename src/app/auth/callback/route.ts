import { NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/supabase/server';
import { safeAuthReturnPath } from '@/lib/supabase/redirect';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = safeAuthReturnPath(searchParams.get('next'),origin);
  if (code) {
    const { error } = await (await serverSupabase()).auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, origin));
  }
  return NextResponse.redirect(new URL('/?auth_error=sign_in_failed', origin));
}
