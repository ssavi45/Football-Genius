import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { matchesById } from './engine';
import type { Round } from './types';
const globals = globalThis as typeof globalThis & { scorelineDevSecret?: string };
const secret = process.env.SCORELINE_SESSION_SECRET || (globals.scorelineDevSecret ??= randomBytes(32).toString('hex'));
function encode(value: unknown): string {
  const payload = Buffer.from(JSON.stringify(value)).toString('base64url');
  return `${payload}.${createHmac('sha256',secret).update(payload).digest('base64url')}`;
}
function decode(token: unknown): unknown {
  if (typeof token !== 'string' || token.length > 16000) throw new Error('Your saved round is unavailable. Start a new round.');
  const [payload,signature,...rest] = token.split('.');
  const expected = createHmac('sha256',secret).update(payload || '').digest('base64url');
  if (rest.length || !signature || signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature),Buffer.from(expected))) throw new Error('Your saved round is unavailable. Start a new round.');
  return JSON.parse(Buffer.from(payload,'base64url').toString());
}
function validRound(round: Round): Round {
  if (round?.version !== 1 || !Array.isArray(round.matchIds) || round.matchIds.length !== 10 || round.matchIds.some(id=>!matchesById.has(id)) || Date.now()-round.createdAt > 7*24*60*60*1000) throw new Error('This saved round has expired. Start a new round.');
  return round;
}
export const sign = (round: Round): string => encode(round);
export const verify = (token: unknown): Round => validRound(decode(token) as Round);

export function signCloudRound(round: Round, userId: string, revision: number): string {
  return encode({purpose:'scoreline-cloud',userId,revision,round});
}
export function verifyCloudRound(token: unknown, userId: string, revision: unknown, runId: unknown): Round {
  const saved=decode(token) as {purpose?:string;userId?:string;revision?:number;round?:Round};
  if(saved?.purpose!=='scoreline-cloud'||saved.userId!==userId||saved.revision!==revision||!saved.round||saved.round.id!==runId)
    throw new Error('Your saved round changed. Reload to continue.');
  return validRound(saved.round);
}
