'use client';
import { useState } from 'react';
import { LockKeyhole,Timer } from 'lucide-react';
import ScoutDialog from './ScoutDialog';
import ScoutBoard from './ScoutBoard';
import type { ScoutView } from '@/lib/scouts-duel/types';
export default function PlayerSelectionModal({match,seconds,busy,error,onLock}:{match:ScoutView;seconds:number;busy:boolean;error?:string;onLock:(id:string)=>void}){
  const [selected,setSelected]=useState<string|null>(null);
  return <ScoutDialog title="Choose your secret player" wide><div className="scout-selection-heading"><p>Your opponent will try to identify this footballer.</p><span><Timer size={17}/>{seconds}s to lock in</span></div>
    {error&&<div className="scout-alert" role="alert">{error}</div>}
    <ScoutBoard players={match.board} remaining={match.board.map(p=>p.id)} selected={match.mySecret?.id||selected} onSelect={setSelected} disabled={!!match.mySecret||busy} selection/>
    <footer className="scout-selection-footer"><p>{match.mySecret?`Locked in: ${match.mySecret.name}. Waiting for your opponent.`:selected?match.board.find(p=>p.id===selected)?.name:'No selection? A player is picked automatically at 0:00.'}</p><button className="scout-primary" disabled={!selected||!!match.mySecret||busy} onClick={()=>selected&&onLock(selected)}><LockKeyhole size={17}/>{match.mySecret?'Selection locked':'Lock In Selection'}</button></footer>
  </ScoutDialog>;
}
