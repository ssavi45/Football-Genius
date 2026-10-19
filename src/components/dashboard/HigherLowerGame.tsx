'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { ArrowBigDown, ArrowBigUp, ArrowLeftRight, ArrowRight, BriefcaseBusiness, CalendarDays, Check, Flame, Footprints, Gift, Hand, Info, RotateCcw, Shirt, Star, Trophy, X } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { sound } from '@/lib/utils/sound';
import { comparisonLabels, playersFromSnapshot, comparisonPool, comparisonValue, chooseComparisonPlayer as choosePlayer, displayLeague, formatComparison, resolveComparisonPick, type Comparison, type ComparisonPlayer, type HigherLowerSnapshot } from '@/lib/higher-lower';
import HigherLowerWidgets from './HigherLowerWidgets';
import { CoinStack, FootballIcon } from './HigherLowerIcons';
import { cloudGame } from '@/lib/backend/client';
import type { CloudRun,HigherLowerRun } from '@/lib/backend/types';

const CATEGORIES = [
  { id: 'marketValue', label: 'Market Value', icon: CoinStack, available: true },
  { id: 'goals', label: 'Goals', icon: FootballIcon, available: true },
  { id: 'assists', label: 'Assists', icon: Footprints, available: true },
  { id: 'caps', label: 'Caps', icon: Shirt, available: false },
  { id: 'transfer', label: 'Transfer Value', icon: ArrowLeftRight, available: true },
  { id: 'ucl', label: 'UCL', icon: FootballIcon, available: false },
  { id: 'rating', label: 'EA Rating', icon: Star, available: false },
] as const;

type CardSide = 'left' | 'right';

function PlayerCard({ player, side, next, opening, mode, hidden, locked, selected, correct, onPick }: {
  player: ComparisonPlayer; side: CardSide; next: boolean; opening: boolean; mode: Comparison; hidden: boolean; locked: boolean;
  selected: boolean; correct: boolean | null; onPick: () => void;
}) {
  const Icon = mode === 'goals' ? FootballIcon : mode === 'assists' ? Footprints : CoinStack;
  const transfer = mode === 'transfer' ? player.selectedTransfer : undefined;
  const clubLabel = player.isRetired ? 'Retired' : player.club || 'Football legend';
  const clubBadge = player.isRetired ? '/img/icons/retired.png' : player.clubBadge;
  return <article data-transfer-id={transfer?.id} className={`hl-player-card ${side === 'right' ? 'hl-next' : 'hl-current'} ${transfer ? 'hl-transfer-card' : ''} ${selected ? correct ? 'hl-picked-correct' : 'hl-picked-wrong' : ''}`}>
    <button type="button" className="hl-card-hit" onClick={onPick} disabled={locked} aria-label={`Choose ${player.name}${transfer ? `, ${transfer.from.name} to ${transfer.to.name}, ${transfer.date}` : ''} as the player with the higher ${comparisonLabels[mode].question}`} />
    <div className="hl-card-background" aria-hidden="true" />
    <Image key={player.id} className="hl-player-photo" src={player.portrait} alt={player.name} width={512} height={512} priority />
    <div className="hl-player-info">
      <span className={`hl-player-tag ${next ? 'is-next' : ''}`}>{opening ? side === 'left' ? 'Player One' : 'Player Two' : next ? 'Next Player' : 'Current Player'}</span>
      <h2>{player.name}</h2>
      {transfer ? <div className="hl-transfer-detail">
        <p className="hl-transfer-date">{new Date(`${transfer.date}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}{transfer.season && <span>Season {transfer.season}</span>}</p>
        <div className="hl-transfer-route" aria-label={`${transfer.from.name} to ${transfer.to.name}`}>
          <div><Image src={transfer.from.crest} alt={`${transfer.from.name} crest`} width={48} height={48} /><span>{transfer.from.name}</span></div>
          <ArrowRight aria-hidden="true" />
          <div><Image src={transfer.to.crest} alt={`${transfer.to.name} crest`} width={48} height={48} /><span>{transfer.to.name}</span></div>
        </div>
      </div> : <><p className="hl-player-club">{clubLabel}</p>
      <div className="hl-player-details">
        <div className="hl-player-badges">{clubBadge && <Image className={player.isRetired ? 'hl-retired-badge' : undefined} src={clubBadge} alt={`${clubLabel} badge`} width={46} height={46} />}{player.nationalityFlag && <Image className="hl-nationality" src={player.nationalityFlag} alt={`${player.nationality} flag`} width={44} height={44} />}</div>
        <dl><div><dt>Position</dt><dd>{player.position || '—'}</dd></div><div><dt>{player.isRetired ? 'Status' : 'Age'}</dt><dd>{player.isRetired ? 'Retired' : player.age ?? '—'}</dd></div><div><dt>{player.isRetired || !player.league ? 'Country' : 'League'}</dt><dd title={player.league || player.nationality}>{player.isRetired || !player.league ? player.nationality : displayLeague(player.league)}</dd></div></dl>
      </div></>}
    </div>
    <div className="hl-player-value"><span className="hl-value-icon"><Icon /></span><div><p>{comparisonLabels[mode].label}</p><strong className={hidden ? 'hl-hidden-value' : ''}>{hidden ? '???' : formatComparison(comparisonValue(player, mode), mode)}</strong></div><span className="hl-tap-icon">{selected && correct !== null ? correct ? <Check /> : <X /> : <Hand />}</span></div>
  </article>;
}

export default function HigherLowerGame({ snapshot }: { snapshot: HigherLowerSnapshot }) {
  const { profile,isLoading,addXP,recordGameResult,refreshProfile } = useAuth();
  const cloud=useRef<CloudRun<HigherLowerRun>|null>(null);
  const [syncError,setSyncError]=useState('');
  const [syncing,setSyncing]=useState(false);
  // A running game keeps its dataset even when a newer snapshot is published.
  const [runSnapshot, setRunSnapshot] = useState(snapshot);
  const players = useMemo(() => playersFromSnapshot(runSnapshot), [runSnapshot]);
  const [mode, setMode] = useState<Comparison>('marketValue');
  const categoryLabel = (mode === 'goals' || mode === 'assists'
    ? comparisonLabels[mode].label : CATEGORIES.find(category => category.id === mode)!.label).toLowerCase();
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [left, setLeft] = useState(() => comparisonPool('marketValue', players)[0]);
  const [right, setRight] = useState(() => comparisonPool('marketValue', players)[1]);
  const [roundsPlayed, setRoundsPlayed] = useState<Record<CardSide, number>>({ left: 0, right: 0 });
  const [currentSide, setCurrentSide] = useState<CardSide | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [picked, setPicked] = useState<CardSide | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const locked = useRef(false);
  const restartButton = useRef<HTMLButtonElement>(null);
  const bestKey = `footygen_higher_lower_best:${profile.id}:${mode}`;
  const winningPlayer = picked === 'left' ? right : left;

  function applyCloud(result:CloudRun<HigherLowerRun>) {
    cloud.current=result;const saved=result.state;
    setRunSnapshot({...snapshot,version:saved.version,createdAt:saved.createdAt});setLeft(saved.left);setRight(saved.right);setScore(saved.score);setBest(saved.best);setRoundsPlayed(saved.roundsPlayed);setCurrentSide(saved.currentSide);setGameOver(saved.gameOver);setRevealed(saved.gameOver);setCorrect(saved.gameOver?false:null);setPicked(saved.gameOver?saved.lastPick??null:null);locked.current=false;
  }
  const reset = async (nextMode: Comparison = mode,resume=false) => {
    if (timer.current) clearTimeout(timer.current);
    if(!profile.is_guest){
      if(isLoading||syncing)return;setSyncing(true);locked.current=true;setSyncError('');
      try{const before=cloud.current;const result=await cloudGame<HigherLowerRun>('higher-lower',nextMode,resume?'resume':'restart',before?{runId:before.runId,revision:before.revision}:{});applyCloud(result);}catch(cause){setSyncError(cause instanceof Error?cause.message:'Could not load your saved streak.');locked.current=false;}finally{setSyncing(false);}
      return;
    }
    locked.current = false;
    const nextPlayers = playersFromSnapshot(snapshot);
    setRunSnapshot(snapshot);
    const first = choosePlayer(nextMode, nextPlayers);
    setLeft(first); setRight(choosePlayer(nextMode, nextPlayers, [first.id]));
    setCurrentSide(null);
    setRoundsPlayed({ left: 0, right: 0 });
    setScore(0); setRevealed(false); setCorrect(null); setGameOver(false); setPicked(null);
  };
  useEffect(() => {
    const first = choosePlayer('marketValue', players);
    setLeft(first); setRight(choosePlayer('marketValue', players, [first.id]));
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, []);
  useEffect(()=>{
    if(isLoading)return;let active=true;cloud.current=null;
    if(profile.is_guest)return;
    locked.current=true;setSyncing(true);setSyncError('');
    void cloudGame<HigherLowerRun>('higher-lower',mode,'resume').then(result=>{if(active)applyCloud(result);}).catch(cause=>{if(active)setSyncError(cause instanceof Error?cause.message:'Could not load your saved streak.');}).finally(()=>{if(active){setSyncing(false);locked.current=false;}});
    return()=>{active=false;if(timer.current)clearTimeout(timer.current);};
  },[profile.id,profile.is_guest,isLoading]);
  useEffect(() => {
    if(profile.is_guest){try { setBest(Number(localStorage.getItem(bestKey)) || 0); } catch { setBest(0); }}
  }, [bestKey,profile.is_guest]);
  useEffect(() => {
    if (gameOver) restartButton.current?.focus({ preventScroll: true });
  }, [gameOver]);

  const guess = async (side: CardSide) => {
    if (isLoading || syncing || locked.current || gameOver) return;
    const leftValue = comparisonValue(left, mode);
    const rightValue = comparisonValue(right, mode);
    if (leftValue === null || rightValue === null) return;
    locked.current = true;
    sound.playClick();
    const result = resolveComparisonPick(leftValue, rightValue, side, roundsPlayed);
    const won = result.correct;
    if(!profile.is_guest){
      const before=cloud.current;if(!before){locked.current=false;setSyncError('Reload this page to reconnect your saved streak.');return;}
      setSyncing(true);setSyncError('');
      try{
        const response=await cloudGame<HigherLowerRun>('higher-lower',mode,'pick',{runId:before.runId,revision:before.revision,side});cloud.current=response;
        const correct=!response.state.gameOver;setPicked(side);setRevealed(true);setCorrect(correct);setScore(response.state.score);setBest(response.state.best);
        if(correct){sound.playSuccess();if(response.state.score%5===0)void confetti({particleCount:80,spread:60,origin:{y:.6},colors:['#0866ff','#11cc86','#ffbc32'],disableForReducedMotion:true});}
        void refreshProfile().catch(()=>{});
        timer.current=setTimeout(()=>applyCloud(response),1200);
      }catch(cause){setSyncError(cause instanceof Error?cause.message:'Could not save your pick. Please retry.');locked.current=false;}finally{setSyncing(false);}
      return;
    }
    setPicked(side); setRevealed(true); setCorrect(won);
    if (won) {
      const nextScore = score + 1;
      setScore(nextScore);
      if (nextScore > best) {
        setBest(nextScore);
        try { localStorage.setItem(bestKey, String(nextScore)); } catch { /* The streak remains playable without storage. */ }
      }
      void addXP(15, 'Higher or Lower Correct Pick');
      sound.playSuccess();
      if (nextScore % 5 === 0) void confetti({ particleCount: 80, spread: 60, origin: { y: .6 }, colors: ['#0866ff', '#11cc86', '#ffbc32'], disableForReducedMotion: true });
      timer.current = setTimeout(() => {
        // Retire a card after its second matchup, even if it wins. Never move the retained card.
        const replacement = choosePlayer(mode, players, [left.id, right.id]);
        if (result.replace === 'left') {
          setLeft(replacement);
        } else {
          setRight(replacement);
        }
        setCurrentSide(result.survivor);
        setRoundsPlayed(result.roundsPlayed);
        setRevealed(false); setCorrect(null); setPicked(null); locked.current = false;
      }, 1200);
    } else {
      // Leave both revealed values visible before showing the end-of-streak panel.
      timer.current = setTimeout(() => setGameOver(true), 1200);
      void recordGameResult('higher-lower', score >= 3, score * 15);
    }
  };

  return <div className="hl-dashboard">
    <div className="hl-main">
      {syncError&&<div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{syncError}<button type="button" className="ml-3 font-bold" onClick={()=>void reset(mode,true)}>Reconnect</button></div>}
      <header className="hl-hero">
        <Image className="hl-hero-art" src="/img/game-modes/higher-lower.webp" alt="" width={800} height={533} priority aria-hidden="true" />
        <h1 className="hl-title"><ArrowBigUp className="hl-title-up" /><span>Higher</span><small>or</small><span>Lower</span><ArrowBigDown className="hl-title-down" /></h1>
        <p>Build the longest streak by guessing whether the next player’s stat is higher or lower.</p>
        <div className="hl-hero-meta"><span title={comparisonLabels[mode].description}><CoinStack />{comparisonLabels[mode].label}</span><i /><span title={`${mode === 'marketValue' ? 'Active players with current valuations only' : mode === 'transfer' ? 'Players with known completed permanent club transfers; one move per card' : 'Active and retired players; missing values are excluded'}.`}><Trophy />{comparisonPool(mode, players).length} Players</span><i /><span title={`Transfermarkt · ${runSnapshot.source.adapter} · Snapshot ${runSnapshot.version}`}><CalendarDays />Updated {new Date(runSnapshot.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}</span></div>
      </header>
      <nav className="hl-categories" aria-label="Comparison category">{CATEGORIES.map(({ id, label, icon: Icon, available }) => <button type="button" key={id} className={id === mode ? 'is-active' : ''} aria-label={available ? label : `${label} (coming soon)`} aria-pressed={id === mode} disabled={!available || syncing} title={available ? comparisonLabels[id as Comparison].description : `${label} is coming soon`} onClick={() => { if (available && id !== mode) { sound.playClick(); setMode(id as Comparison); void reset(id as Comparison,true); } }}><Icon /><span className="hl-category-label">{label}{!available && <small>Coming soon</small>}</span></button>)}</nav>
      <section className="hl-arena" aria-labelledby="hl-instruction">
        <div className="hl-round-meta"><span className="hl-round-count">Round {score + (revealed && correct ? 0 : 1)} of <span className="hl-infinity">∞</span></span><span>Current Streak: <strong>{score}</strong><Flame size={21} /></span></div>
        <div className="hl-instruction"><span><Hand /></span><h2 id="hl-instruction">Tap the card with the <strong>higher {categoryLabel}</strong></h2></div>
        <div className="hl-matchup">
          <PlayerCard player={left} side="left" next={currentSide !== null && currentSide !== 'left'} opening={currentSide === null} mode={mode} hidden={!revealed && currentSide !== 'left'} locked={revealed || gameOver} selected={picked === 'left'} correct={correct} onPick={() => guess('left')} />
          <div className="hl-vs" aria-hidden="true"><span>VS</span></div>
          <PlayerCard player={right} side="right" next={currentSide === null || currentSide !== 'right'} opening={currentSide === null} mode={mode} hidden={!revealed && currentSide !== 'right'} locked={revealed || gameOver} selected={picked === 'right'} correct={correct} onPick={() => guess('right')} />
        </div>
        <p className={`hl-round-help ${correct ? 'is-correct' : ''}`} role="status">{correct ? <><Check size={17} />Correct pick! +15 XP — keep your streak alive.</> : <><Info size={16} />Tap either player card to make your guess!</>}</p>
        {gameOver && <div className="hl-game-over"><div role="status"><span><X /></span><h2>That’s the end of your streak.</h2>{mode === 'transfer' && winningPlayer.selectedTransfer && <p>{winningPlayer.selectedTransfer.from.name} → {winningPlayer.selectedTransfer.to.name} · {winningPlayer.selectedTransfer.date}</p>}<p>{winningPlayer.name}: <strong>{formatComparison(comparisonValue(winningPlayer, mode), mode)}</strong></p><p>{score} correct picks · +{score * 15} XP earned · Personal best: {best}</p><button ref={restartButton} type="button" onClick={() => { sound.playClick(); reset(); }}><RotateCcw size={18} />Play Again</button></div></div>}
      </section>
      <div className="hl-rewards"><article className="hl-reward-green"><span className="hl-reward-icon">XP</span><div><h2>Correct Pick</h2><strong>+15 XP</strong><p>Get it right to keep your streak alive.</p></div></article><article className="hl-reward-gold"><span className="hl-reward-icon"><Flame /></span><div><h2>Streak 5</h2><strong><Gift size={19} />On Fire!</strong><p>Reach a 5-pick streak to celebrate.</p></div></article><article className="hl-reward-purple"><span className="hl-reward-icon"><BriefcaseBusiness /></span><div><h2>Streak 10</h2><strong>Elite Streak</strong><p>Make ten correct picks in a row.</p></div></article></div>
    </div>
    <HigherLowerWidgets score={score} best={best} gameOver={gameOver} />
  </div>;
}
