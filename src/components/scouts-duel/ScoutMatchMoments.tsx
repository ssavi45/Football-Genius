'use client';
import { useState } from 'react';
import Image from 'next/image';
import { ArrowRight,Bot,Check,Copy,Crosshair,Globe,LoaderCircle,LockKeyhole,ShieldCheck,Sparkles,Swords,Timer,UserRound,Users,X } from 'lucide-react';
import type { ScoutMoment } from '@/lib/scouts-duel/feedback';
import type { ScoutRoom,ScoutView } from '@/lib/scouts-duel/types';
import ScoutDialog from './ScoutDialog';
import ScoutPlayerDetails from './ScoutPlayerDetails';

function Radar({target=false}:{target?:boolean}){
  return <div className={`scout-moment-radar ${target?'is-target':''}`} aria-hidden="true"><i/><i/><i/><span/>{target?<Crosshair size={55} strokeWidth={1.3}/>:<Globe size={50} strokeWidth={1.2}/>}<b/><b/><b/></div>;
}

export function ScoutReadySeats({match,myName}:{match:ScoutView;myName?:string}){
  return <div className="scout-ready-seats" role="group" aria-label="Selection status">
    <div className={match.mySecret?'is-ready':''}><span><UserRound size={20}/></span><div><strong>{myName||'You'}</strong><small>{match.mySecret?'Selection locked':'Choosing a player'}</small></div>{match.mySecret?<Check size={18}/>:<LoaderCircle className="scout-spinner" size={17}/>}</div>
    <i/>
    <div className={match.opponentLocked?'is-ready':''}><span>{match.mode==='ai'?<Bot size={20}/>:<UserRound size={20}/>}</span><div><strong>{match.opponentName}</strong><small>{match.opponentLocked?'Selection locked':'Choosing a player'}</small></div>{match.opponentLocked?<Check size={18}/>:<LoaderCircle className="scout-spinner" size={17}/>}</div>
  </div>;
}

export function ScoutWaitingScreen({match,mode,busy,error,onCancel}:{match?:ScoutView|null;mode:ScoutRoom['mode'];busy:boolean;error?:string;onCancel?:()=>void}){
  const [copied,setCopied]=useState(false);
  const custom=mode==='custom',ai=mode==='ai';
  const title=ai?'Preparing your duel':custom?(match?'Your scouting room is ready':'Opening your scouting room'):'Finding your next rival';
  return <ScoutDialog title={title} className="scout-moment-modal"><div className="scout-moment-content">
    <span className="scout-moment-eyebrow">{ai?<Bot size={14}/>:custom?<Users size={14}/>:<Globe size={14}/>} {ai?'TACTICAL SCOUT':custom?'PRIVATE DUEL':'ONLINE MATCHMAKING'}</span>
    <Radar/>
    <h2>{title}</h2><p>{ai?'The tactical scout is getting the board ready.':custom?(match?'Share your room code. Your friend can join straight from the lobby.':'Setting up a private duel. You’ll meet your opponent here.'):'Searching for a scout ready to test your football knowledge.'}</p>
    {custom&&match&&<button className="scout-moment-code" aria-label={`${copied?'Copied':'Copy'} room code ${match.code}`} onClick={async()=>{try{await navigator.clipboard.writeText(match.code);setCopied(true);}catch{setCopied(false);}}}><span><small>ROOM CODE</small><strong>{match.code}</strong></span>{copied?<Check size={21}/>:<Copy size={21}/>}</button>}
    {!ai&&<div className="scout-moment-pair"><span><UserRound size={23}/><small>You</small><b><Check size={12}/></b></span><i><Swords size={24}/></i><span className="is-searching"><Users size={23}/><small>{custom?'Your friend':'Opponent'}</small><b><LoaderCircle className="scout-spinner" size={12}/></b></span></div>}
    <div className="scout-moment-live" role="status"><span/>{match?(custom?'Waiting for your friend to join…':'Search is live. Keep this window open.'):'Connecting to the scouting room…'}</div>
    {error&&<div className="scout-alert" role="alert">{error}</div>}
    {onCancel&&<button className="scout-secondary scout-moment-cancel" disabled={busy} onClick={onCancel}>{busy?'Cancelling…':custom?'Close room':'Cancel search'}</button>}
    <small className="scout-moment-footnote">24 footballers. One secret. Let the scouting begin.</small>
  </div></ScoutDialog>;
}

export function ScoutShotProgress({match,error}:{match:ScoutView;error?:string}){
  const mine=match.shot?.seat===match.seat;
  return <ScoutDialog title={mine?'Your shot is locked in':'Incoming shot'} className="scout-moment-modal is-shot"><div className="scout-moment-content" role="status">
    <span className="scout-moment-eyebrow"><Crosshair size={14}/> {mine?'SHOT LOCKED IN':'INCOMING GUESS'}</span><Radar target/>
    <h2>{mine?'Taking your shot…':`${match.opponentName} is taking a shot`}</h2>
    <p>{mine?'You’ve made your call. Let’s see if you’ve cracked the mystery.':"They’ve made their choice. Is your secret still safe?"}</p>
    <div className="scout-shot-sequence"><span/><span/><span/></div>
    <div className="scout-moment-live"><ShieldCheck size={16}/>{match.pause?'Waiting for your opponent to reconnect…':'Revealing the result…'}</div>
    {error&&<div className="scout-alert" role="alert">{error}</div>}
  </div></ScoutDialog>;
}

export function ScoutMomentDialog({match,moment,onContinue}:{match:ScoutView;moment:ScoutMoment;onContinue:()=>void}){
  if(moment.kind==='incoming')return <ScoutShotProgress match={{...match,shot:{seat:moment.log!.seat,resolveAt:match.serverNow}}}/>;
  const matched=moment.kind==='matched',ready=moment.kind==='ready',setup=matched||ready;
  const mine=moment.log?.seat===match.seat,hit=moment.log?.answer===true;
  const player=moment.log&&(match.board.find(player=>player.id===moment.log?.playerId)||match.board.find(player=>`Shoot: ${player.name}`===moment.log?.text));
  const title=matched?'Rival found. Game on.':ready?'Both scouts are ready':hit?(mine?'What a read!':'Your cover is blown'):(mine?'Just wide of the mark':'Your secret stays safe');
  const copy=matched?`You’re up against ${match.opponentName}. Choose a secret footballer from your shared board.`:ready?(match.activeSeat===match.seat?'It’s your turn. Ask a question or take your shot.':`It’s ${match.opponentName}’s turn. Keep an eye on the clues.`):hit?(mine?'You identified the secret footballer. A brilliant piece of scouting.':`${match.opponentName} correctly identified your secret footballer.`):(mine?'That wasn’t their secret player. The card is ruled out and the turn passes.':`${match.opponentName} guessed wrong. Their turn is over — your move.`);
  return <ScoutDialog title={title} className={`scout-moment-modal ${setup?'is-matched':hit?'is-hit':'is-miss'} ${!mine&&!setup?'is-opponent':''}`}><div className="scout-moment-content">
    <span className="scout-moment-eyebrow">{setup?<Swords size={14}/>:hit?<Sparkles size={14}/>:<ShieldCheck size={14}/>} {matched?'MATCH FOUND':ready?'DUEL READY':mine?'YOUR GUESS':`${match.opponentName}’S GUESS`}</span>
    {setup?<div className="scout-moment-matchup" aria-hidden="true"><span><UserRound size={38}/><b><Check size={14}/></b></span><i><Swords size={32}/></i><span>{match.mode==='ai'?<Bot size={38}/>:<UserRound size={38}/>}<b><Check size={14}/></b></span></div>:<div className="scout-shot-reveal"><span className="scout-shot-result-badge">{hit?<Check size={22}/>:<X size={22}/>}</span>{player?<Image src={player.image} alt={player.name} width={170} height={170} priority/>:<Crosshair size={70}/>}<span className="scout-shot-verdict">{hit?'CORRECT GUESS':'WRONG GUESS'}</span></div>}
    <h2>{title}</h2><p>{copy}</p>
    {player&&<div className="scout-guessed-player"><strong>{player.name}</strong><ScoutPlayerDetails player={player}/></div>}
    {setup&&<div className="scout-moment-rules"><span><Users size={15}/>1 vs 1</span><span><LockKeyhole size={15}/>Secret identities</span><span><Timer size={15}/>{matched?`${Math.max(0,Math.ceil((match.deadline-match.serverNow)/1000))}s to lock in`:`${match.options.turnSeconds}s per turn`}</span></div>}
    <button className="scout-primary scout-moment-continue" onClick={onContinue}>{matched?'Choose my secret':ready?'Let’s play':match.status==='completed'?'See duel result':'Back to the board'}<ArrowRight size={18}/></button>
    <small className="scout-moment-footnote">Continuing automatically…</small>
  </div></ScoutDialog>;
}
