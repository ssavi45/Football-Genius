import type { NextRequest } from 'next/server';
import { scoutJSON, scoutError, scoutBody } from '@/lib/scouts-duel/http';
import { checkScoutOrigin, createOrJoinScout, publicView, SCOUT_COOKIE, scoutSession } from '@/lib/scouts-duel/service';
import { scoutStoreKind } from '@/lib/scouts-duel/store';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(){return scoutJSON({available:scoutStoreKind!=='unavailable',store:scoutStoreKind,gemini:!!(process.env.GEMINI_API_KEY&&process.env.SCOUT_GEMINI_MODEL)});}
export async function POST(request:NextRequest){
  try{
    checkScoutOrigin(request);const session=scoutSession(request,true);
    const room=await createOrJoinScout(request,await scoutBody(request),session.hash);
    const response=scoutJSON({match:await publicView(room,session.hash)});
    response.cookies.set(SCOUT_COOKIE,session.token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:86400});return response;
  }catch(error){return scoutError(error);}
}
