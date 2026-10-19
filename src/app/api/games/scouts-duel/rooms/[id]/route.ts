import type { NextRequest } from 'next/server';
import { scoutJSON, scoutError, scoutBody } from '@/lib/scouts-duel/http';
import { actScout, checkScoutOrigin, readScoutView, scoutSession } from '@/lib/scouts-duel/service';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(request:NextRequest,{params}:{params:Promise<{id:string}>}){
  try{const {id}=await params;return scoutJSON({match:await readScoutView(id,scoutSession(request).hash)});}catch(error){return scoutError(error);}
}
export async function POST(request:NextRequest,{params}:{params:Promise<{id:string}>}){
  try{checkScoutOrigin(request);const {id}=await params;return scoutJSON({match:await actScout(id,scoutSession(request).hash,await scoutBody(request))});}catch(error){return scoutError(error);}
}
