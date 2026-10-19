'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import HeroMatchCard from '@/components/dashboard/HeroMatchCard';
import RightPanelWidgets from '@/components/dashboard/RightPanelWidgets';
import ScorelineRoundSummary from '@/components/dashboard/ScorelineRoundSummary';
import { useAuth } from '@/context/auth-context';
import { sound } from '@/lib/utils/sound';
import type { Action, RoundView } from '@/lib/scoreline/types';
import './scoreline.css';

const HISTORY_KEY = 'footygen_scoreline_history_v1';
function readStorage(key: string) { try { return localStorage.getItem(key); } catch { return null; } }
function writeStorage(key: string,value: string) { try { localStorage.setItem(key,value); } catch { /* Play normally if storage is unavailable. */ } }
function history(): string[] { try { const data=JSON.parse(readStorage(HISTORY_KEY)||'[]'); return Array.isArray(data) ? data.filter(id=>typeof id==='string').slice(-200) : []; } catch { return []; } }

export default function ScorelineHeroPage() {
  const { profile, isLoading, addXP, recordGameResult,refreshProfile } = useAuth();
  const [round,setRound] = useState<RoundView|null>(null);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState<string|null>(null);
  const current = useRef<RoundView|null>(null);
  const pending = useRef(false);
  const loadedProfile = useRef('');
  const storageKey = `footygen_scoreline_round_v1:${profile.id}`;

  const request = useCallback(async (action: Action['type']|'start'|'resume', fields: Record<string,unknown> = {}) => {
    if (pending.current) return;
    pending.current=true;setBusy(true);setError(null);
    try {
      const response=await fetch('/api/scoreline',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,requestId:crypto.randomUUID(),runId:current.current?.id,cloudRevision:current.current?.cloudRevision,token:current.current?.token,recent:action==='start'?history():undefined,...fields})});
      const data=await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load this round.');
      const view=data as RoundView;
      current.current=view;setRound(view);writeStorage(storageKey,view.token);
      if (view.match) writeStorage(HISTORY_KEY,JSON.stringify([...history().filter(id=>id!==view.match!.id),view.match.id].slice(-200)));
      if (action==='submit' && view.feedback && view.feedback.points>0) { sound.playSuccess(); confetti({particleCount:60,spread:60,origin:{y:.6},colors:['#0866ff','#00bd86','#ffc035'],disableForReducedMotion:true}); }
    } catch (err) { setError(err instanceof Error ? err.message : 'Connection interrupted. Please try again.'); }
    finally { pending.current=false;setBusy(false); }
  },[storageKey]);

  useEffect(() => {
    if (isLoading || loadedProfile.current===profile.id) return;
    loadedProfile.current=profile.id;
    current.current=null;setRound(null);
    const saved=readStorage(storageKey);
    void request(saved ? 'resume' : 'start',saved?{token:saved}:{});
  },[isLoading,profile.id,storageKey,request]);

  useEffect(() => {
    if (!round?.complete) return;
    if(round.rewardOnServer){void refreshProfile().catch(()=>{});return;}
    const claimKey=`footygen_scoreline_claimed_v1:${profile.id}`;
    let claimed:string[]=[];
    try { const stored=JSON.parse(readStorage(claimKey)||'[]'); claimed=Array.isArray(stored)?stored:[]; } catch { /* Start fresh after invalid local data. */ }
    if (claimed.includes(round.id)) return;
    writeStorage(claimKey,JSON.stringify([...claimed,round.id].slice(-200)));
    void addXP(round.score,'Scoreline Hero round');
    void recordGameResult('scoreline',round.review.every(answer=>answer.points>0),round.score);
  },[round,profile.id,addXP,recordGameResult,refreshProfile]);

  const onAction = (action:Action) => { const {type,...fields}=action;void request(type,fields); };
  const freshRound = () => { sound.playClick();void request('start',{force:true}); };
  if (!round) return <div className="scoreline-loading" role="status"><Trophy size={40} /><h1>{error ? 'Your round needs a fresh start' : 'Setting up your next ten matches…'}</h1><p>{error || 'A balanced mix of club classics and international memories.'}</p>{error && <button onClick={freshRound} disabled={busy}>Start a New Round</button>}</div>;

  return <div className="scoreline-dashboard">
    <div className="scoreline-main">
      {error && <div className="scoreline-error" role="alert">{error}<button onClick={() => void request('resume')} disabled={busy}>Retry</button><button onClick={freshRound} disabled={busy}>New Round</button></div>}
      {round.complete ? <ScorelineRoundSummary round={round} busy={busy} onRestart={freshRound} /> : round.match && <HeroMatchCard key={`${round.id}:${round.match.id}`} match={round.match} feedback={round.feedback} potential={round.potential} skipsLeft={round.skipsLeft} question={round.currentQuestion} busy={busy} onAction={onAction} />}
    </div>
    <RightPanelWidgets currentQuestion={round.currentQuestion} totalQuestions={round.totalQuestions} roundScore={round.score} potentialPoints={round.potential} skipsLeft={round.skipsLeft} progress={round.progress} complete={round.complete} />
  </div>;
}
