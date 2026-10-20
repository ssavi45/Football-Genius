import Image from 'next/image';
import { Check, X } from 'lucide-react';
import type { ScoutPlayer } from '@/lib/scouts-duel/types';
import ScoutPlayerDetails from './ScoutPlayerDetails';
export default function ScoutBoard({players,remaining,selected,onSelect,disabled=false,selection=false,forcedOut=[]}:{players:ScoutPlayer[];remaining:string[];selected?:string|null;onSelect:(id:string)=>void;disabled?:boolean;selection?:boolean;forcedOut?:string[]}){
  return <div className={`scout-board ${selection?'is-selecting':''}`} aria-label={selection?'Select your secret footballer':'Your deduction board'}>{players.map((player,index)=>{
    const active=remaining.includes(player.id),picked=selected===player.id;
    return <button type="button" key={player.id} className={`scout-player ${!active?'is-eliminated':''} ${picked?'is-selected':''}`} onClick={()=>onSelect(player.id)} disabled={disabled||forcedOut.includes(player.id)} aria-label={selection?`Select ${player.name}`:`${active?'Rule out':'Restore'} ${player.name}`} aria-pressed={selection?picked:!active}>
      <span className="scout-player-photo"><Image src={player.image} alt="" fill sizes="(max-width:640px) 80px, 130px" loading={index<8?'eager':'lazy'}/>{!active&&<span className="scout-player-out"><X size={27}/></span>}{picked&&<span className="scout-player-picked"><Check size={15}/></span>}</span>
      <span className="scout-player-name">{player.name}</span>
      <ScoutPlayerDetails player={player}/>
    </button>;
  })}</div>;
}
