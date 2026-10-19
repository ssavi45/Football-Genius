import { NextResponse, type NextRequest } from 'next/server';
import { ScoutRuleError } from './engine';
export const scoutJSON=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function scoutBody(request:NextRequest):Promise<Record<string,unknown>> {
  const text=await request.text();if(text.length>10000)throw new ScoutRuleError('Request is too large.');
  let body;try{body=JSON.parse(text);}catch{throw new ScoutRuleError('Invalid request.');}
  if(!body||typeof body!=='object'||Array.isArray(body))throw new ScoutRuleError('Invalid request.');return body;
}
export function scoutError(error:unknown) {
  if(error instanceof ScoutRuleError)return scoutJSON({error:error.message},error.message.includes('participant')?403:error.message.includes('session has expired')?401:error.message.includes('roster was updated')?409:error.message.startsWith('Room not found.')?404:400);
  console.error('Scout duel service:',error instanceof Error?error.message:'Unknown error');
  return scoutJSON({error:'The match service is unavailable. Please try again.'},503);
}
