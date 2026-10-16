import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createRound, roundView, transition } from '@/lib/scoreline/engine';
import { sign, verify } from '@/lib/scoreline/session';
import type { Action } from '@/lib/scoreline/types';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    if (Number(request.headers.get('content-length') || 0) > 22000) throw new Error('Request is too large.');
    const body = await request.json();
    const type = body.action;
    if (!['start','resume','hint','submit','skip','next'].includes(type)) throw new Error('Choose a valid game action.');
    let round = type === 'start' ? createRound(randomUUID(),Array.isArray(body.recent) ? body.recent.filter((id:unknown)=>typeof id==='string').slice(-200) : []) : verify(body.token);
    if (!['start','resume'].includes(type)) round = transition(round,{type,hint:body.hint,home:body.home,away:body.away} as Action);
    return NextResponse.json(roundView(round,sign(round)),{headers:{'Cache-Control':'no-store'}});
  } catch (error) {
    return NextResponse.json({error:error instanceof Error ? error.message : 'Unable to load this round. Please try again.'},{status:400,headers:{'Cache-Control':'no-store'}});
  }
}
