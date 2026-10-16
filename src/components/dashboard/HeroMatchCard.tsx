'use client';

import { useState } from 'react';
import Image from 'next/image';
import DigitalScoreboard from '@/components/scoreboard/DigitalScoreboard';
import TeamEmblem from '@/components/dashboard/TeamEmblem';
import { ArrowRight, Calendar, ChevronRight, FastForward, Lightbulb, Lock, MapPin, Search, Target, Unlock, Volleyball } from 'lucide-react';
import { sound } from '@/lib/utils/sound';
import type { Action, PublicMatch, Review } from '@/lib/scoreline/types';

interface Props { match: PublicMatch; feedback: Review | null; potential: number; skipsLeft: number; question: number; busy: boolean; onAction: (action: Action) => void; }
const HINT_ICONS = [Lightbulb, Search, Target];
const HINT_DESCRIPTIONS = ['A subtle fact about this match.', 'Part of the goalscoring story.', 'A stronger clue, without the final score.'];

export default function HeroMatchCard({ match, feedback, potential, skipsLeft, question, busy, onAction }: Props) {
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const resolved = feedback !== null;
  const locked = busy || resolved;
  const submit = () => { sound.playClick(); onAction({type:'submit',home:homeScore,away:awayScore}); };
  return <section className="scoreline-stage" aria-labelledby="scoreline-title">
    <div className="scoreline-banner" aria-hidden="true"><Image key={match.competition.id} src={match.competition.banner} alt="" fill priority sizes="(max-width: 1000px) 100vw, 65vw" /></div>
    <header className="match-intro">
      <div className="match-breadcrumb"><Volleyball size={25} /><span>{match.competitionLabel}</span><ChevronRight size={18} /><span>{match.stage}</span></div>
      <h1 id="scoreline-title">Scoreline <span>Hero</span></h1>
      <p>Predict the final score. How well do you remember this match?</p>
      <div className="match-meta"><span><Calendar />{new Date(match.date+'T12:00:00Z').toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'})}</span><i /><span><MapPin />{match.venue}</span></div>
    </header>
    <div className="prediction-panel">
      <div className="round-match-caption"><span>Match {question} of 10</span><span>{potential} points available</span></div>
      <div className="match-teams">
        <div className="match-team team-home"><TeamEmblem name={match.homeTeam.name} emblem={match.homeTeam.emblem} national={match.kind === 'international'} /><h2>{match.homeTeam.name}</h2></div>
        <DigitalScoreboard disabled={locked} homeScore={homeScore} awayScore={awayScore} onHomeChange={setHomeScore} onAwayChange={setAwayScore} />
        <div className="match-team team-away"><TeamEmblem name={match.awayTeam.name} emblem={match.awayTeam.emblem} national={match.kind === 'international'} /><h2>{match.awayTeam.name}</h2></div>
      </div>
      <p className="score-convention">Final score including extra time. Penalty shoot-outs do not count.</p>
      {feedback && <div className={`prediction-result ${feedback.points > 0 ? 'prediction-correct' : ''}`} role="status"><strong>{feedback.points > 0 ? `Perfect prediction! +${feedback.points} points` : 'Not quite — 0 points this time.'}</strong><span>{match.homeTeam.name} {feedback.score.home} – {feedback.score.away} {match.awayTeam.name}</span><a href={feedback.sources[0]} target="_blank" rel="noreferrer">Match record ↗</a></div>}
      <div className="prediction-actions">{!resolved ? <><button className="prediction-submit" onClick={submit} disabled={busy}>Submit Prediction<ArrowRight /></button><button className="prediction-skip" disabled={busy || skipsLeft === 0} onClick={() => { sound.playClick(); onAction({type:'skip'}); }}>Skip ({skipsLeft} left)<FastForward size={21} /></button></> : <button className="prediction-submit" disabled={busy} onClick={() => { sound.playClick(); onAction({type:'next'}); }}>{question === 10 ? 'View Round Results' : 'Next Match'}<ArrowRight size={21} /></button>}</div>
    </div>
    <div className="match-hints">{match.hints.map((hint,index) => {const Icon = HINT_ICONS[index]; const revealed = hint.text !== null;return <article className={`match-hint hint-${index+1}`} key={index}><div className="hint-heading"><span className="hint-icon"><Icon /></span><div><h2>Hint {index+1}</h2><p id={`hint-description-${index}`}>{hint.text || HINT_DESCRIPTIONS[index]}</p></div></div><div className="hint-action"><button onClick={() => { sound.playClick(); onAction({type:'hint',hint:index}); }} aria-label={`${revealed ? 'Unlocked' : 'Reveal'} Hint ${index+1}`} aria-expanded={revealed} aria-describedby={`hint-description-${index}`} disabled={revealed || locked}>{revealed ? <Unlock size={19} /> : <Lock size={19} />}{revealed ? 'Unlocked' : 'Reveal'}</button><strong>−{hint.cost} {hint.cost === 1 ? 'point' : 'points'}</strong></div></article>;})}</div>
  </section>;
}
