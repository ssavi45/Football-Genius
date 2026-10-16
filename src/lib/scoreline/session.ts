import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { matchesById } from './engine';
import type { Round } from './types';
const globals = globalThis as typeof globalThis & { scorelineDevSecret?: string };
const secret = process.env.SCORELINE_SESSION_SECRET || (globals.scorelineDevSecret ??= randomBytes(32).toString('hex'));
export function sign(round: Round): string {
  const payload = Buffer.from(JSON.stringify(round)).toString('base64url');
  return `${payload}.${createHmac('sha256',secret).update(payload).digest('base64url')}`;
}
export function verify(token: unknown): Round {
  if (typeof token !== 'string' || token.length > 16000) throw new Error('Your saved round is unavailable. Start a new round.');
  const [payload,signature,...rest] = token.split('.');
  const expected = createHmac('sha256',secret).update(payload || '').digest('base64url');
  if (rest.length || !signature || signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature),Buffer.from(expected))) throw new Error('Your saved round is unavailable. Start a new round.');
  const round = JSON.parse(Buffer.from(payload,'base64url').toString()) as Round;
  if (round.version !== 1 || round.matchIds.length !== 10 || round.matchIds.some(id=>!matchesById.has(id)) || Date.now()-round.createdAt > 7*24*60*60*1000) throw new Error('This saved round has expired. Start a new round.');
  return round;
}
