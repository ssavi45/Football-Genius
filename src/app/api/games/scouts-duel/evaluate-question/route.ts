import type { NextRequest } from 'next/server';
import { scoutJSON, scoutError, scoutBody } from '@/lib/scouts-duel/http';
import { authorizedScoutRoom, checkScoutOrigin, scoutSession } from '@/lib/scouts-duel/service';
import { parseScoutQuestion, scoutQuestions } from '@/lib/scouts-duel/questions';
import { scoutPlayers } from '@/lib/scouts-duel/data';
import { ScoutRuleError } from '@/lib/scouts-duel/engine';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function POST(request:NextRequest){
  try{
    checkScoutOrigin(request);const body=await scoutBody(request);
    if(typeof body.roomId!=='string'||typeof body.query!=='string'||body.query.length>200)throw new ScoutRuleError('Enter a question of up to 200 characters.');
    const room=await authorizedScoutRoom(body.roomId,scoutSession(request).hash);
    const questions=scoutQuestions(scoutPlayers.filter(p=>room.boardIds.includes(p.id)));
    const deterministic=parseScoutQuestion(body.query,questions);
    if(deterministic)return scoutJSON({question:deterministic,mappedBy:'rules'});
    const key=process.env.GEMINI_API_KEY,model=process.env.SCOUT_GEMINI_MODEL;
    if(room.mode==='ai'&&key&&model){
      // Translate intent only. No target, secret, player roster or YES/NO answer
      // is sent to Gemini. The player confirms the canonical question in the UI.
      const response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,{
        method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},signal:AbortSignal.timeout(10000),
        body:JSON.stringify({contents:[{parts:[{text:JSON.stringify({task:'Map the user question to exactly one semantically equivalent catalog question. Return null if unsupported, ambiguous, compound, or unrelated. Never answer the football question.',query:body.query,catalog:questions.map(q=>({id:q.id,text:q.text}))})}]}],generationConfig:{temperature:0,responseMimeType:'application/json',responseJsonSchema:{type:'object',properties:{questionId:{type:['string','null']}},required:['questionId'],additionalProperties:false}}}),
      });
      if(response.ok){const data=await response.json();try{const parsed=JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text||'{}');const question=questions.find(q=>q.id===parsed.questionId);if(question)return scoutJSON({question,mappedBy:'gemini',requiresConfirmation:true});}catch{/* Reject unstructured output. */}}
    }
    throw new ScoutRuleError('Ask a specific position, nationality, league, status, trophy or footedness question supported by this board.');
  }catch(error){return scoutError(error);}
}
