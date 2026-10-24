import { createHash } from 'node:crypto';
import { CONTACT_EMAIL } from './seo/metadata';
import { CONTACT_TOPICS } from './contact-fields';

export const CONTACT_MAX_BYTES = 24_576;
export class ContactError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export interface ContactMessage { name: string; email: string; topic: string; message: string; submissionId: string }
const unavailable = `Your message could not be sent. Please email ${CONTACT_EMAIL} directly.`;

export function contactMessage(input: unknown): ContactMessage | null {
  if (!input || typeof input !== 'object') throw new ContactError('Please complete the contact form.', 400);
  const body = input as Record<string, unknown>;
  if (typeof body.website === 'string' && body.website.trim()) return null;
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!name || name.length > 80 || /[\r\n\x00]/.test(name)) throw new ContactError('Use a name between 1 and 80 characters.', 400);
  if (email.length > 254 || !/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(email)) throw new ContactError('Please enter a valid email address.', 400);
  if (typeof body.topic !== 'string' || !CONTACT_TOPICS.some(topic => topic === body.topic)) throw new ContactError('Please choose a message topic.', 400);
  if (message.length < 10 || message.length > 4000 || message.includes('\0')) throw new ContactError('Write a message between 10 and 4,000 characters.', 400);
  if (body.consent !== true) throw new ContactError('Please acknowledge the privacy policy before sending.', 400);
  if (typeof body.submissionId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.submissionId)) throw new ContactError('Please refresh the page and try again.', 400);
  return { name, email, topic: body.topic, message, submissionId: body.submissionId };
}

export async function contactBody(request: Request): Promise<unknown> {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) throw new ContactError('Send the form as JSON.', 415);
  const reader = request.body?.getReader();
  if (!reader) throw new ContactError('Please complete the contact form.', 400);
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > CONTACT_MAX_BYTES) { await reader.cancel(); throw new ContactError('Your message is too large.', 413); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  } catch (error) {
    if (error instanceof ContactError) throw error;
    throw new ContactError('The contact form could not be read. Please retry.', 400);
  } finally { reader.releaseLock(); }
}

// A bounded, per-instance throttle supplements the honeypot and provider limits.
const recent = new Map<string, { start: number; count: number }>();
export function allowContact(identifier: string, now = Date.now()): boolean {
  const key = createHash('sha256').update(identifier).digest('hex');
  const window = 15 * 60_000;
  for (const [id, value] of recent) if (now - value.start >= window) recent.delete(id);
  const current = recent.get(key);
  if (current) { if (current.count >= 5) return false; current.count++; return true; }
  if (recent.size >= 1000) recent.delete(recent.keys().next().value!);
  recent.set(key, { start: now, count: 1 });
  return true;
}

export async function sendContact(message: ContactMessage, key: string, from: string) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST', signal: AbortSignal.timeout(12_000),
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Idempotency-Key': `contact-${message.submissionId}` },
    body: JSON.stringify({ from, to: [CONTACT_EMAIL], reply_to: message.email, subject: `[FootyGen] ${message.topic}`, text: `Name: ${message.name}\nEmail: ${message.email}\nTopic: ${message.topic}\n\n${message.message}` }),
  });
  if (!response.ok) throw new ContactError(unavailable, 502);
  const result: unknown = await response.json();
  if (!result || typeof result !== 'object' || !('id' in result) || typeof result.id !== 'string' || !result.id) throw new ContactError(unavailable, 502);
}

export const CONTACT_UNAVAILABLE = unavailable;
