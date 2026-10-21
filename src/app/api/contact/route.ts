import { NextResponse } from 'next/server';
import { checkSameOrigin } from '@/lib/http/origin';
import { allowContact, contactBody, contactMessage, ContactError, CONTACT_UNAVAILABLE, sendContact } from '@/lib/contact';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'no-store' };

export async function POST(request: Request) {
  try { checkSameOrigin(request); } catch { return NextResponse.json({ error: 'Please submit the form from Football Genius.' }, { status: 403, headers }); }
  try {
    const message = contactMessage(await contactBody(request));
    if (!message) return NextResponse.json({ ok: true }, { headers });
    const key = process.env.RESEND_API_KEY;
    const from = process.env.CONTACT_FROM_EMAIL;
    if (!key || !from || /[\r\n]/.test(from)) throw new ContactError(CONTACT_UNAVAILABLE, 503);
    const address = request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-forwarded-for') || 'unknown';
    if (!allowContact(address.split(',')[0].trim().slice(0, 128))) return NextResponse.json({ error: 'Too many messages. Please try again in 15 minutes.' }, { status: 429, headers: { ...headers, 'Retry-After': '900' } });
    await sendContact(message, key, from);
    return NextResponse.json({ ok: true }, { headers });
  } catch (error) {
    return NextResponse.json({ error: error instanceof ContactError ? error.message : CONTACT_UNAVAILABLE }, { status: error instanceof ContactError ? error.status : 502, headers });
  }
}
