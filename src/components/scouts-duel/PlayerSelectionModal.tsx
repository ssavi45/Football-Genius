'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Check,LockKeyhole,Timer,LoaderCircle } from 'lucide-react';
import ScoutDialog from './ScoutDialog';
import ScoutBoard from './ScoutBoard';
import ScoutPlayerDetails from './ScoutPlayerDetails';
import { ScoutReadySeats } from './ScoutMatchMoments';
import type { ScoutView } from '@/lib/scouts-duel/types';
export default function PlayerSelectionModal({match,seconds,busy,error,onLock}:{match:ScoutView;seconds:number;busy:boolean;error?:string;onLock:(id:string)=>void}){
  const [selected,setSelected]=useState<string|null>(null);
  return <ScoutDialog title={match.mySecret?'Your secret is locked in':'Choose your secret player'} wide={!match.mySecret} className={match.mySecret?'scout-locked-modal':''}><div className="scout-selection-heading"><p>{match.mySecret?'Your identity stays hidden until the duel is decided.':'Your opponent will try to identify this footballer.'}</p><span><Timer size={17}/>{seconds}s to lock in</span></div>
    {error&&<div className="scout-alert" role="alert">{error}</div>}
    <ScoutReadySeats match={match}/>
    {match.opponentLocked&&!match.mySecret&&<p className="scout-opponent-ready" role="status"><Check size={16}/>{match.opponentName} has locked in. Your secret is the final piece.</p>}
    {match.mySecret?<div className="scout-locked-player"><span className="scout-locked-portrait"><Image src={match.mySecret.image} alt={match.mySecret.name} width={160} height={160} priority/><i><LockKeyhole size={19}/></i></span><small>YOUR SECRET FOOTBALLER</small><h3>{match.mySecret.name}</h3><ScoutPlayerDetails player={match.mySecret}/><div className="scout-moment-live" role="status"><LoaderCircle className="scout-spinner" size={16}/>{match.opponentLocked?'Both players are ready. Starting the duel…':`Waiting for ${match.opponentName} to lock in…`}</div><p>The duel starts automatically when both scouts are ready.</p></div>:<>
      <ScoutBoard players={match.board} remaining={match.board.map(p=>p.id)} selected={selected} onSelect={setSelected} disabled={busy} selection/>
      <footer className="scout-selection-footer"><p>{selected?match.board.find(p=>p.id===selected)?.name:'No selection? A player is picked automatically at 0:00.'}</p><button className="scout-primary" disabled={!selected||busy} onClick={()=>selected&&onLock(selected)}><LockKeyhole size={17}/>Lock In Selection</button></footer>
    </>}
  </ScoutDialog>;
}
