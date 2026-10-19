import Image from 'next/image';
import { Bot, Crosshair, LockKeyhole, ShieldCheck, Users } from 'lucide-react';
import type { ScoutView } from '@/lib/scouts-duel/types';
import ScoutPlayerDetails from './ScoutPlayerDetails';

export default function ScoutMatchHud({match,active,seconds,reconnecting}:{match:ScoutView;active:boolean;seconds:number;reconnecting:boolean}) {
  const finished=match.status==='completed';
  const status=finished?'Duel complete':match.pause||reconnecting?'Reconnecting':match.status==='selecting'?'Choose your secret':active?'Your turn':"Opponent’s turn";
  const duration=match.pause?45:match.status==='selecting'?30:match.options.turnSeconds;
  const progress=Math.min(1,Math.max(0,seconds/duration));
  const urgent=!finished&&!match.pause&&!reconnecting&&seconds<=10;
  return <section className={`scout-hud ${active?'is-yours':''} ${urgent?'is-urgent':''}`} aria-label="Match overview">
    <h1 className="sr-only">Scout&rsquo;s Duel</h1>
    <div className="scout-secret">
      <span className="scout-secret-portrait">
        {match.mySecret?<Image src={match.mySecret.image} width={60} height={68} alt=""/>:<ShieldCheck size={32}/>}
        <span className="scout-secret-lock"><LockKeyhole size={11}/></span>
      </span>
      <div className="scout-secret-info"><small>YOUR SECRET PLAYER</small><strong>{match.mySecret?.name||'Choose your player'}</strong>{match.mySecret&&<ScoutPlayerDetails player={match.mySecret}/>}</div>
    </div>
    <div className="scout-hud-turn">
      <div className="scout-turn-label"><span className="scout-turn-emblem"><Crosshair size={23}/></span><div className="scout-turn-copy"><strong role="status">{status}</strong></div></div>
      <div className="scout-hud-remaining"><small>REMAINING</small><strong>{match.remaining.length}<em> / {match.board.length}</em></strong></div>
      {!finished&&<div className="scout-turn-clock" role="timer" aria-label={`${seconds} seconds ${match.pause?'to reconnect':'remaining'}`}>
        <svg viewBox="0 0 52 52" aria-hidden="true"><circle className="scout-clock-track" cx="26" cy="26" r="22"/><circle className="scout-clock-progress" cx="26" cy="26" r="22" pathLength="100" strokeDasharray="100" strokeDashoffset={100*(1-progress)}/></svg>
        <span>{seconds}<small>SEC</small></span>
      </div>}
    </div>

    <div className="scout-opponent"><span className="scout-opponent-avatar">{match.mode==='ai'?<Bot size={24}/>:<Users size={24}/>}</span><div><strong>{match.opponentName}</strong><small>{match.opponentRemaining} remaining</small></div></div>
  </section>;
}
