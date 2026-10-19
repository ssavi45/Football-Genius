'use client';
import { useState } from 'react';
import { Crosshair } from 'lucide-react';
import ScoutDialog from './ScoutDialog';
import ScoutBoard from './ScoutBoard';
import type { ScoutView } from '@/lib/scouts-duel/types';
export default function ShootModal({match,busy,error,onConfirm,onClose}:{match:ScoutView;busy:boolean;error?:string;onConfirm:(id:string)=>void;onClose?:()=>void}){
  const [selected,setSelected]=useState<string|null>(null);
  return <ScoutDialog title="Take your shot" onClose={onClose} wide>
    <p className="scout-modal-copy">A correct shot wins. A miss rules out that player, passes the turn, and blocks shooting on your next turn.</p>
    {error&&<div className="scout-alert" role="alert">{error}</div>}
    <ScoutBoard players={match.board.filter(p=>match.remaining.includes(p.id))} remaining={match.remaining} selected={selected} onSelect={setSelected} disabled={busy} selection/>
    <footer className="scout-selection-footer"><p>{selected?match.board.find(p=>p.id===selected)?.name:'Select the player you think your opponent chose.'}</p><button className="scout-primary is-shoot" disabled={!selected||busy||!match.shootAllowed||!!match.pause} onClick={()=>selected&&onConfirm(selected)}><Crosshair size={18}/>Confirm Shot</button></footer>
  </ScoutDialog>;
}
