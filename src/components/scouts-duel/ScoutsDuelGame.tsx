'use client';
import { useCallback,useEffect,useRef,useState } from 'react';
import Image from 'next/image';
import scoutTitle from '../../../public/img/scouts-duel/title-tactical.webp';
import confetti from 'canvas-confetti';
import { BookOpen,Check,Crosshair,Flag,History,RotateCcw,Swords,Trophy,Users,Zap } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase/client';
import type { ScoutAction,ScoutOptions,ScoutRoom,ScoutView } from '@/lib/scouts-duel/types';
import ScoutsDuelLobby from './ScoutsDuelLobby';
import ScoutBoard from './ScoutBoard';
import ScoutMatchHud from './ScoutMatchHud';
import ScoutDialog from './ScoutDialog';
import PlayerSelectionModal from './PlayerSelectionModal';
import QuestionConsole from './QuestionConsole';
import ShootModal from './ShootModal';
import QuestionLogDrawer,{ScoutLogList} from './QuestionLogDrawer';

export default function ScoutsDuelGame(){
  const {profile,addXP,recordGameResult,soundEnabled,refreshProfile}=useAuth();
  const [match,setMatch]=useState<ScoutView|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[networkError,setNetworkError]=useState('');
  const [capabilities,setCapabilities]=useState<{available:boolean;store:string}|null>(null),[restoring,setRestoring]=useState(true);
  const [shootOpen,setShootOpen]=useState(false),[logOpen,setLogOpen]=useState(false),[resignOpen,setResignOpen]=useState(false),[now,setNow]=useState(Date.now());
  const resultHandled=useRef(new Set<string>()),audio=useRef<AudioContext|null>(null),lastLog=useRef(''),offset=useRef(0);
  const accept=useCallback((next:ScoutView)=>setMatch(current=>current&&current.id===next.id&&current.version>next.version?current:next),[]);
  useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),250);return()=>clearInterval(timer);},[]);
  useEffect(()=>{if(match)offset.current=match.serverNow-Date.now();},[match?.serverNow]);
  useEffect(()=>{if(match?.status==='active'&&match.activeSeat!==match.seat)setShootOpen(false);if(match?.status==='completed'){setShootOpen(false);setLogOpen(false);setResignOpen(false);}},[match?.activeSeat,match?.status,match?.seat]);
  useEffect(()=>{let active=true;void(async()=>{
    try{const cap=await fetch('/api/games/scouts-duel').then(r=>r.json());if(active)setCapabilities(cap);
      const saved=localStorage.getItem('scouts_duel_room');if(saved){const response=await fetch(`/api/games/scouts-duel/rooms/${saved}`);if(response.ok){const data=await response.json();if(active)accept(data.match);}else localStorage.removeItem('scouts_duel_room');}
    }catch{if(active)setNetworkError('Could not connect to the match service. Refresh to try again.');}finally{if(active)setRestoring(false);}
  })();return()=>{active=false;};},[accept]);
  useEffect(()=>{
    if(!match||match.status==='completed')return;let active=true,running=false;
    const controller=new AbortController();
    const refresh=async()=>{if(running)return;running=true;try{const response=await fetch(`/api/games/scouts-duel/rooms/${match.id}`,{cache:'no-store',signal:controller.signal});const data=await response.json();if(!response.ok){if(active&&[401,403,404,409].includes(response.status)){lobby();setError(data.error);return;}throw Error(data.error);}if(active){accept(data.match);setNetworkError('');}}catch(e){if(active&&!controller.signal.aborted)setNetworkError(e instanceof Error?e.message:'Reconnecting…');}finally{running=false;}};
    const timer=setInterval(refresh,1000);
    const channel=capabilities?.store==='supabase'?supabase.channel(`scout-${match.id}`).on('postgres_changes',{event:'*',schema:'public',table:'scout_duel_signals',filter:`room_id=eq.${match.id}`},()=>void refresh()).subscribe():null;
    return()=>{active=false;controller.abort();clearInterval(timer);if(channel)void supabase.removeChannel(channel);};
  },[match?.id,match?.status==='completed',capabilities?.store,accept]);
  function sound(yes:boolean){if(!soundEnabled)return;try{const context=audio.current||new AudioContext();audio.current=context;void context.resume();const oscillator=context.createOscillator(),gain=context.createGain();oscillator.connect(gain);gain.connect(context.destination);oscillator.frequency.value=yes?660:180;gain.gain.setValueAtTime(.025,context.currentTime);gain.gain.exponentialRampToValueAtTime(.001,context.currentTime+.15);oscillator.start();oscillator.stop(context.currentTime+.16);}catch{/* Audio is optional. */}}
  useEffect(()=>{const log=match?.logs.at(-1);if(!match||!log)return;const key=`${match.id}:${log.id}`;if(lastLog.current===key)return;lastLog.current=key;sound(log.answer===true);},[match?.logs.length,match?.id,soundEnabled]);
  useEffect(()=>{
    if(!match||match.status!=='completed'||resultHandled.current.has(match.id)||match.reason==='CANCELLED')return;
    resultHandled.current.add(match.id);const won=match.winner===match.seat;
    if(won)confetti({particleCount:110,spread:80,origin:{y:.6},colors:['#087aff','#13c98d','#ffcf55'],disableForReducedMotion:true});
    if(match.rewardOnServer){void refreshProfile().catch(()=>{});}else{
      const key=`scouts_duel_result_${match.id}`;
      try{if(localStorage.getItem(key))return;localStorage.setItem(key,'claimed');}catch{/* Keep the in-memory claim guard. */}
      void(async()=>{if(won)await addXP(200,'Scout’s Duel victory');await recordGameResult('scouts-duel',won,won?200:0);})().catch(()=>{});
    }
  },[match,addXP,recordGameResult,refreshProfile]);
  async function start(mode:ScoutRoom['mode'],options?:ScoutOptions,joinCode?:string){
    setBusy(true);setError('');sound(true);
    try{const {data:{session}}=await supabase.auth.getSession();const response=await fetch('/api/games/scouts-duel',{method:'POST',headers:{'Content-Type':'application/json',...(session?.access_token?{Authorization:`Bearer ${session.access_token}`}:{})},body:JSON.stringify({mode,name:profile.username,...options,joinCode})});const data=await response.json();if(!response.ok)throw Error(data.error);accept(data.match);localStorage.setItem('scouts_duel_room',data.match.id);}catch(e){setError(e instanceof Error?e.message:'Could not start the duel.');}finally{setBusy(false);}
  }
  async function act(action:ScoutAction){
    if(!match||busy)return;setBusy(true);setError('');
    try{const response=await fetch(`/api/games/scouts-duel/rooms/${match.id}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({requestId:crypto.randomUUID(),action})});const data=await response.json();if(!response.ok)throw Error(data.error);accept(data.match);if(action.type==='SHOOT_GUESS')setShootOpen(false);setResignOpen(false);}catch(e){setError(e instanceof Error?e.message:'Your action could not be sent.');}finally{setBusy(false);}
  }
  function lobby(){setMatch(null);setError('');setNetworkError('');setShootOpen(false);setLogOpen(false);setResignOpen(false);localStorage.removeItem('scouts_duel_room');}
  const remainingSeconds=match?Math.max(0,Math.ceil((match.deadline-now-offset.current)/1000)):0;
  const active=!!match&&match.status==='active'&&match.activeSeat===match.seat&&!match.pause&&!networkError;
  const won=!!match&&match.winner===match.seat;
  return <div className={`scout-game ${match&&match.status!=='waiting'?'has-match':''}`}>
    {!restoring&&(!match||match.status==='waiting')&&<section className="scout-hero" aria-labelledby="scout-game-title">
      <picture className="scout-hero-visual" aria-hidden="true">
        <source media="(max-width: 700px)" srcSet="/img/scouts-duel/hero-mobile-v3.webp" />
        <source media="(max-width: 1440px) and (max-aspect-ratio: 2/1)" srcSet="/img/scouts-duel/hero-tablet-v3.webp" />
        <img className="scout-hero-art" src="/img/scouts-duel/hero-desktop-v3.webp" width={2172} height={395} alt="" fetchPriority="high" decoding="async" />
      </picture>
      <div className="scout-hero-copy">
        <h1 id="scout-game-title"><Image className="scout-title-art" src={scoutTitle} alt="Scout’s Duel" sizes="(max-width: 700px) 245px, 380px" priority/></h1>
        <p className="scout-hero-tagline">Find their player before they find yours.</p>
        <p className="scout-hero-description">24 footballers. Ask questions, rule out suspects, and take your shot.</p>
        <div className="scout-hero-pills"><span><Users size={21}/>1 vs 1</span><span><Zap size={21}/>Instant answers</span><span><Trophy size={21}/>+200 XP</span></div>
      </div>
    </section>}
    {(error||networkError)&&<div className="scout-alert" role="alert">{error||networkError}</div>}
    {capabilities&&!capabilities.available&&<div className="scout-alert">Match hosting is not configured for this deployment yet.</div>}
    {restoring?<section className="scout-panel scout-loading">Connecting to the scouting room…</section>:!match||match.status==='waiting'?<ScoutsDuelLobby busy={busy} available={!!capabilities?.available} onStart={start} onJoin={code=>void start('custom',undefined,code)} waiting={match?.status==='waiting'?match:null} onCancel={()=>void act({type:'RESIGN'})}/>:<>
      <ScoutMatchHud key="unlimited-match-hud" match={match} active={active} seconds={match.pause?Math.max(0,Math.ceil((match.pause.until-now-offset.current)/1000)):remainingSeconds} reconnecting={!!networkError}/>
      <div className="scout-match-layout"><div className="scout-board-column"><section className="scout-panel scout-roster-panel"><div className="scout-board-caption"><h2>Your scout board</h2><span>{match.options.assistance?'Auto-assist on':'Tap a card to rule out or restore'}</span></div><ScoutBoard players={match.board} remaining={match.remaining} forcedOut={match.forcedOut} onSelect={id=>void act({type:'UPDATE_BOARD_STATE',playerId:id})} disabled={busy||match.options.assistance||match.status!=='active'||!!match.pause}/></section><div className="scout-board-actions"><button className="scout-secondary" onClick={()=>setLogOpen(true)}><History size={17}/>Question history</button><button className="scout-text-button" onClick={()=>setResignOpen(true)} disabled={match.status==='completed'}><Flag size={15}/>Resign duel</button></div></div>
      <aside className="scout-side"><QuestionConsole key="unlimited-match-console" match={match} disabled={!active||busy} onAsk={id=>void act({type:'ASK_QUESTION',questionId:id})} onShoot={()=>setShootOpen(true)}/><section className="scout-panel scout-recent"><div className="scout-section-title"><h2>Latest clues</h2><History size={17}/></div><ScoutLogList match={{...match,logs:match.logs.slice(-3)}}/></section><section className="scout-panel scout-howto"><h2><span><BookOpen size={20}/></span>How to Play</h2><ol>{['Lock in a secret player from the shared board.','Ask one Yes/No question on each turn.','Rule out suspects, then Shoot to identify the player.','A correct shot wins the duel and earns 200 XP.'].map((text,i)=><li key={text}><span>{i+1}</span><p>{text}</p></li>)}</ol></section></aside></div>
      {match.status==='selecting'&&<PlayerSelectionModal match={match} seconds={remainingSeconds} busy={busy} error={error||networkError} onLock={id=>void act({type:'LOCK_IN_PLAYER',playerId:id})}/>}
      {shootOpen&&match.status!=='completed'&&<ShootModal match={match} busy={busy} error={error||networkError} onConfirm={id=>void act({type:'SHOOT_GUESS',playerId:id})} onClose={()=>setShootOpen(false)}/>}
      {logOpen&&match.status!=='completed'&&<QuestionLogDrawer match={match} onClose={()=>setLogOpen(false)}/>}
      {resignOpen&&match.status!=='completed'&&<ScoutDialog title="Resign this duel?" onClose={()=>setResignOpen(false)}><p className="scout-modal-copy">Your opponent will win this match.</p>{error&&<div className="scout-alert" role="alert">{error}</div>}<button className="scout-primary is-shoot" disabled={busy} onClick={()=>void act({type:'RESIGN'})}>Resign duel</button></ScoutDialog>}
      {match.status==='completed'&&<ScoutDialog title={match.reason==='CANCELLED'?'Search cancelled':match.winner===null?'Duel drawn':won?'You won the duel':'Duel lost'}><div className={`scout-result ${won?'is-win':''}`}><span className="scout-result-icon">{won?<Trophy size={38}/>:match.winner===null?<Swords size={38}/>:<Crosshair size={38}/>}</span><p>{match.reason==='CORRECT_SHOOT'?'The secret player was identified.':match.reason==='DISCONNECTED'?'The reconnect window expired.':match.reason==='OPPONENT_RESIGNED'?'A scout resigned from the duel.':match.reason==='DRAW'?'Both scouts finished with equal deductions.':'The duel has ended.'}</p><div className="scout-result-players">{match.secrets?.map((player,i)=>player&&<div key={i}><small>{i===match.seat?'YOUR SECRET':'OPPONENT’S SECRET'}</small><Image src={player.image} width={100} height={106} alt=""/><strong>{player.name}</strong><span><Image src={player.nationalityFlag} width={24} height={16} alt=""/>{player.nationality}</span></div>)}</div>{won&&<strong className="scout-result-xp"><Check size={18}/>+200 XP earned</strong>}<button className="scout-primary" onClick={lobby}><RotateCcw size={17}/>Back to lobby</button></div></ScoutDialog>}
    </>}
  </div>;
}
