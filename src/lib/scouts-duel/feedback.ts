import type { ScoutLog,ScoutView } from './types';

export type ScoutMoment={id:string;kind:'matched'|'ready'|'incoming'|'shot-result';log?:ScoutLog};
export interface ScoutFeedbackState {match:ScoutView|null;moments:ScoutMoment[]}
export type ScoutFeedbackAction={type:'sync';match:ScoutView;silent?:boolean}|{type:'dismiss';id:string}|{type:'clear'};
export const momentDuration=(moment:ScoutMoment)=>moment.kind==='incoming'?1000:moment.kind==='shot-result'?3400:moment.kind==='matched'?2200:1700;

/** Versioned snapshots can arrive through both polling and Realtime. Present each event once. */
export function scoutFeedback(state:ScoutFeedbackState,action:ScoutFeedbackAction):ScoutFeedbackState {
  if(action.type==='clear')return {match:null,moments:[]};
  if(action.type==='dismiss')return {...state,moments:state.moments.filter(moment=>moment.id!==action.id)};
  const next=action.match,previous=state.match,same=previous?.id===next.id;
  if(same&&previous.version>next.version)return state;
  if(action.silent)return {match:next,moments:[]};
  const moments=same?state.moments.filter(moment=>(moment.kind!=='matched'||next.status==='selecting')&&(moment.kind!=='ready'||next.status==='active')):[];
  if(next.mode!=='ai'&&next.status==='selecting'&&(!same||previous.status==='waiting'))moments.push({id:`${next.id}:matched`,kind:'matched'});
  if(same&&previous.status==='selecting'&&next.status==='active')moments.push({id:`${next.id}:ready`,kind:'ready'});
  if(same){
    const last=previous.logs.at(-1)?.id||0;
    for(const log of next.logs.filter(log=>log.id>last&&log.kind==='shoot').slice(-4)){
      // Reconstruct the short reveal if a slow connection skipped its snapshot.
      if(log.seat!==next.seat&&previous.shot?.seat!==log.seat)moments.push({id:`${next.id}:incoming:${log.id}`,kind:'incoming',log});
      moments.push({id:`${next.id}:shot:${log.id}`,kind:'shot-result',log});
    }
  }
  return {match:next,moments:[...new Map(moments.map(moment=>[moment.id,moment])).values()].slice(-8)};
}
