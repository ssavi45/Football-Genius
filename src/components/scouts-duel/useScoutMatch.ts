'use client';
import { useCallback,useEffect,useReducer } from 'react';
import { momentDuration,scoutFeedback } from '@/lib/scouts-duel/feedback';
import type { ScoutView } from '@/lib/scouts-duel/types';

export default function useScoutMatch(){
  const [state,dispatch]=useReducer(scoutFeedback,{match:null,moments:[]});
  const accept=useCallback((match:ScoutView,silent=false)=>dispatch({type:'sync',match,silent}),[]);
  const clear=useCallback(()=>dispatch({type:'clear'}),[]);
  const dismiss=useCallback((id:string)=>dispatch({type:'dismiss',id}),[]);
  const moment=state.moments[0]||null;
  useEffect(()=>{if(!moment)return;const timer=setTimeout(()=>dismiss(moment.id),momentDuration(moment));return()=>clearTimeout(timer);},[moment?.id,dismiss]);
  return {match:state.match,moment,accept,clear,dismiss};
}
