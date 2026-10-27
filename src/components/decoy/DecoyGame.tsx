'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, AudioLines, Flag, Footprints, Maximize2, Pause, Play, RotateCcw, Shield, Sparkles, Star, Target, Timer, VolumeX, Zap } from 'lucide-react';
import { LEVELS, TUNE } from '@/lib/decoy/config';
import { DecoyRuntime } from '@/lib/decoy/runtime';
import { readBest, saveBest, type DecoyBest } from '@/lib/decoy/progress';
import type { Snapshot } from '@/lib/decoy/types';
import './decoy.css';

const INSTRUCTIONS = ['Move No. 10 with WASD / arrows or the joystick. Your teammates play the ball.', 'Run toward the screen defender, then pull into either channel.', 'Change direction + Space / Feint to wrong-foot a following defender.', 'The lane is open. No. 8 will find No. 9 if the opening lasts.'];
const initial: Snapshot = { phase: 'ready', level: 0, remaining: 38, score: 0, stars: 0, stamina: 100, cooldown: 0, countdown: 3, reason: '', feedback: '', tutorial: 0, awards: [], seed: 42, practice: false };

export default function DecoyGame() {
  const canvas = useRef<HTMLCanvasElement>(null), surface = useRef<HTMLDivElement>(null), runtime = useRef<DecoyRuntime | null>(null);
  const stick = useRef<number | null>(null), sprintPointer = useRef<number | null>(null), saved = useRef('');
  const [state, setState] = useState<Snapshot>(initial), [best, setBest] = useState<Record<string, DecoyBest>>({});
  const [muted, setMuted] = useState(false), [error, setError] = useState(''), [knob, setKnob] = useState({ x: 0, y: 0 });
  useEffect(() => {
    setBest(readBest());
    try {
      const game = new DecoyRuntime(canvas.current!, setState); runtime.current = game;
      try { game.audio.enabled = localStorage.getItem('footygen_sound_enabled') !== 'false'; setMuted(!game.audio.enabled); } catch { /* Defaults to sound on. */ }
      return () => { game.dispose(); runtime.current = null; };
    } catch (err) { setError(err instanceof Error ? err.message : 'The pitch could not load. Please refresh.'); }
  }, []);
  useEffect(() => {
    if (state.phase !== 'goal') { if (state.phase === 'countdown') saved.current = ''; return; }
    const key = `${state.level}:${state.seed}:${state.score}`;
    if (saved.current !== key) { saved.current = key; setBest(saveBest(state.level, state.score, state.stars)); }
  }, [state.phase, state.level, state.seed, state.score, state.stars]);
  useEffect(() => { if (state.phase !== 'playing') { stick.current = null; sprintPointer.current = null; setKnob({ x: 0, y: 0 }); } }, [state.phase]);
  function joystick(event: PointerEvent<HTMLDivElement>) {
    if (stick.current !== event.pointerId) return;
    const rect = event.currentTarget.getBoundingClientRect(), dx = event.clientX - rect.left - rect.width / 2, dy = event.clientY - rect.top - rect.height / 2;
    const radius = rect.width * .32, length = Math.hypot(dx, dy), scale = Math.max(radius, length);
    const x = length < 6 ? 0 : dx / scale, y = length < 6 ? 0 : dy / scale;
    if (runtime.current) { runtime.current.touch.x = x; runtime.current.touch.y = y; }
    setKnob({ x: x * radius, y: y * radius });
  }
  function release(event: PointerEvent<HTMLDivElement>) { if (event.pointerId === stick.current) { stick.current = null; setKnob({ x: 0, y: 0 }); if (runtime.current) { runtime.current.touch.x = 0; runtime.current.touch.y = 0; } } }
  const game = () => runtime.current;
  const terminal = state.phase === 'goal' || state.phase === 'failure' || state.phase === 'complete';
  const isGoal = state.phase === 'goal' || state.phase === 'complete';
  return <section className="decoy-page" aria-labelledby="decoy-title">
    <header className="decoy-header">
      <div><Link href="/game-modes" className="decoy-back"><ArrowLeft size={14} /> Game modes</Link><p className="decoy-eyebrow">FOOTYGEN ORIGINAL · INTERACTIVE / STRATEGY</p><h1 id="decoy-title">The <span>Decoy</span><span className="decoy-live">PLAYABLE</span></h1><p>Outsmart defenders. Create space. Win without touching the ball.</p></div>
      <div className="decoy-emblem" aria-hidden="true"><Footprints size={36} /><span>10</span></div>
    </header>
    <div className="decoy-layout">
      <div className="decoy-arena" ref={surface}>
        <div className="decoy-scoreboard">
          <div><span className="decoy-live-dot" />{state.practice ? 'PRACTICE' : `CHALLENGE 0${state.level + 1}`}<strong>{LEVELS[state.level].name}</strong></div>
          <div className={`decoy-clock ${state.remaining < 10 ? 'is-urgent' : ''}`}><Timer size={19} /><strong>{Math.ceil(state.remaining).toString().padStart(2, '0')}<small>s</small></strong></div>
          <div className="decoy-score"><span>TACTICAL SCORE</span><strong>{state.score.toLocaleString()}</strong></div>
          <div className="decoy-toolbar">
            <button aria-label={muted ? 'Enable game sound' : 'Mute game sound'} aria-pressed={!muted} onClick={() => { const r = game(); if (r) { r.audio.enabled = muted; r.audio.unlock(); r.focus(); } try { localStorage.setItem('footygen_sound_enabled', String(muted)); } catch {} setMuted(!muted); }}>{muted ? <VolumeX size={18} /> : <AudioLines size={18} />}</button>
            <button aria-label="Restart challenge" onClick={() => game()?.restart()}><RotateCcw size={18} /></button>
            <button aria-label={state.phase === 'paused' ? 'Resume game' : 'Pause game'} disabled={!['playing', 'paused', 'countdown'].includes(state.phase)} onClick={() => game()?.togglePause()}>{state.phase === 'paused' ? <Play size={18} /> : <Pause size={18} />}</button>
            <button aria-label="Expand game to fullscreen" className="decoy-fullscreen" onClick={() => { if (document.fullscreenElement) void document.exitFullscreen().catch(() => {}); else void surface.current?.requestFullscreen?.().catch(() => {}); }}><Maximize2 size={18} /></button>
          </div>
        </div>
        <div className="decoy-field">
          <canvas ref={canvas} width={1000} height={620} tabIndex={0} aria-label="The Decoy football pitch. Control blue No. 10 with WASD or arrows, Shift to sprint, Space to feint, P to pause, R to restart." aria-describedby="decoy-controls-help" onPointerDown={() => game()?.focus()} />
          {state.phase === 'playing' && state.feedback && <div className="decoy-feedback" aria-hidden="true"><Sparkles size={13} />{state.feedback}</div>}
          {error && <div className="decoy-overlay"><div className="decoy-dialog" role="alert"><h2>Unable to open the pitch</h2><p>{error}</p><Link href="/game-modes">Back to game modes</Link></div></div>}
          {!error && state.phase === 'ready' && <div className="decoy-overlay"><div className="decoy-dialog">
            <span className="decoy-dialog-icon"><Footprints size={30} /></span><p className="decoy-eyebrow">YOU ARE THE DIFFERENCE</p><h2>Win without the ball.</h2><p>You control <b>blue No. 10</b>. Draw a defender out of shape so No. 8 can find No. 9. Your teammates handle the finish.</p>
            <div className="decoy-mini-steps"><span>01 <b>Sell the run</b></span><span>02 <b>Pull wide</b></span><span>03 <b>Create space</b></span></div>
            <button className="decoy-primary" onClick={() => game()?.start()}>Kick off <ArrowRight size={18} /></button><small>Move with WASD / arrows or the joystick below.</small>
          </div></div>}
          {state.phase === 'countdown' && <div className="decoy-countdown" aria-live="polite"><span>FIND YOUR SPACE</span><strong>{Math.ceil(state.countdown)}</strong></div>}
          {state.phase === 'paused' && <div className="decoy-overlay"><div className="decoy-dialog" role="dialog" aria-modal="false" aria-label="Game paused"><Pause className="decoy-dialog-icon" /><h2>Take a breath.</h2><p>The clock is stopped. Look for the space behind the screen defender.</p><button className="decoy-primary" onClick={() => game()?.togglePause()}>Resume play <Play size={17} /></button><button className="decoy-secondary" onClick={() => game()?.restart()}>Restart this challenge</button></div></div>}
          {terminal && <div className="decoy-overlay"><div className={`decoy-dialog decoy-result ${isGoal ? 'is-goal' : ''}`} role="dialog" aria-label={isGoal ? 'Challenge won' : 'Attack ended'}>
            <span className="decoy-dialog-icon">{isGoal ? <Flag size={28} /> : <Shield size={28} />}</span><p className="decoy-eyebrow">{state.phase === 'complete' ? 'ALL THREE CHALLENGES COMPLETE' : isGoal ? 'THE RUN. THE SPACE. THE FINISH.' : 'READ IT. RESET. GO AGAIN.'}</p><h2>{state.phase === 'complete' ? 'Master of movement.' : isGoal ? 'Made by you.' : 'Attack ended.'}</h2><p>{state.reason}</p>
            {isGoal && <div className="decoy-stars" aria-label={`${state.stars} of 3 stars`}>{[1, 2, 3].map(n => <Star key={n} size={28} fill={state.stars >= n ? 'currentColor' : 'none'} opacity={state.stars >= n ? 1 : .3} />)}</div>}
            <div className="decoy-result-score">{state.score}<span>TACTICAL POINTS</span></div>
            <div className="decoy-breakdown">{state.awards.map(a => <div key={a.label}><span>{a.label}</span><b>+{a.points}</b></div>)}</div>
            {isGoal && !state.practice && state.phase !== 'complete' && <button className="decoy-primary" onClick={() => { if (state.level < 2) game()?.restart(state.level + 1, 42, false); else { game()?.sim.complete(); setState(game()!.sim.snapshot()); } }}>{state.level < 2 ? 'Next challenge' : 'Finish campaign'}<ArrowRight size={17} /></button>}
            <button className={isGoal ? 'decoy-secondary' : 'decoy-primary'} onClick={() => game()?.restart()}>Retry same scenario <RotateCcw size={16} /></button>
            <div className="decoy-result-links"><button onClick={() => game()?.restart(state.level, (Date.now() >>> 0), true)}>New practice setup</button><Link href="/game-modes">Game modes</Link></div>
          </div></div>}
        </div>
        <div className="decoy-instruments">
          <div><Zap size={15} /><span>STAMINA</span><meter min={0} max={100} value={state.stamina} aria-label="Sprint stamina" /><b>{Math.round(state.stamina)}%</b></div>
          <div><Sparkles size={15} /><span>FEINT</span><meter min={0} max={TUNE.feintCooldown} value={TUNE.feintCooldown - state.cooldown} aria-label="Feint readiness" /><b>{state.cooldown > 0 ? `${state.cooldown.toFixed(1)}s` : 'READY'}</b></div>
        </div>
        <div className="decoy-touch-controls" id="decoy-controls-help">
          <div className="decoy-joystick" aria-label="Movement joystick" onPointerDown={e => { e.preventDefault(); if (stick.current !== null) return; stick.current = e.pointerId; e.currentTarget.setPointerCapture(e.pointerId); game()?.focus(); game()?.audio.unlock(); joystick(e); }} onPointerMove={joystick} onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release}><span style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} /><Footprints size={15} /></div>
          <p><b>Move to make the difference.</b><span><kbd>WASD</kbd> / arrows · <kbd>Shift</kbd> sprint · <kbd>Space</kbd> feint · <kbd>P</kbd> pause</span><small>On touch: drag the stick and hold Sprint. Change direction as you tap Feint.</small></p>
          <button className="decoy-sprint" aria-label="Hold to sprint" onPointerDown={e => { e.preventDefault(); if (sprintPointer.current !== null) return; sprintPointer.current = e.pointerId; e.currentTarget.setPointerCapture(e.pointerId); if (game()) game()!.touch.sprint = true; }} onPointerUp={e => { if (sprintPointer.current === e.pointerId) { sprintPointer.current = null; if (game()) game()!.touch.sprint = false; } }} onPointerCancel={() => { sprintPointer.current = null; if (game()) game()!.touch.sprint = false; }} onLostPointerCapture={() => { sprintPointer.current = null; if (game()) game()!.touch.sprint = false; }}><Zap size={22} />Sprint<small>HOLD</small></button>
          <button className="decoy-feint" aria-label="Perform feint" disabled={state.cooldown > 0 || state.stamina < 16} onPointerDown={e => { e.preventDefault(); if (game()) game()!.touch.feint = true; }} onClick={e => { if (e.detail === 0 && game()) game()!.touch.feint = true; }}><Sparkles size={22} />Feint<small>{state.cooldown > 0 ? `${state.cooldown.toFixed(1)}s` : 'TAP'}</small></button>
        </div>
        <p className="decoy-orientation">For a wider view, turn your phone sideways or expand the pitch.</p>
      </div>
      <aside className="decoy-tactics">
        <div className="decoy-coach"><span className="decoy-panel-label"><Target size={18} /> THE GAME PLAN</span><h2>Make them follow.<br /><span>Leave space behind.</span></h2><p>{LEVELS[state.level].brief}</p><div className="decoy-coach-note" aria-live="polite">{state.feedback || INSTRUCTIONS[state.tutorial]}</div><ol>{['Move into a threatening position', 'Draw a defender out of shape', 'Open the pass to No. 9'].map((text, i) => <li key={text} className={state.tutorial > i ? 'is-done' : ''}><span>{i + 1}</span>{text}</li>)}</ol></div>
        <div className="decoy-levels"><span className="decoy-panel-label">YOUR CHALLENGES</span>{LEVELS.map((level, i) => <button key={level.name} className={state.level === i && !state.practice ? 'is-selected' : ''} onClick={() => game()?.choose(i, false)}><span>0{i + 1}</span><div><b>{level.name}</b><small>{best[i] ? `${best[i].stars}/3 stars · best ${best[i].score}` : `${level.seconds}s · ${level.defenders} defenders`}</small></div><ArrowRight size={16} /></button>)}<button className={state.practice ? 'is-selected' : ''} onClick={() => game()?.choose(state.level, true)}><RotateCcw size={19} /><div><b>Practice pitch</b><small>Fresh setup · instant retries</small></div><ArrowRight size={16} /></button></div>
        <details className="decoy-scoring"><summary>How tactical points work</summary><p>Draw a defender: 80. Open the lane: 120. Deceive a following defender: 80. Create a completed pass: 180. Goal: 300. Time left: 4 points per second.</p><p>Each action scores once per attempt. One star for a goal; two for a goal after creating a lane; three for doing both within {LEVELS[state.level].par} seconds.</p><p>Scores and best stars stay on this device. They do not award account XP or enter the global leaderboard.</p><p>Scenario seed: {state.seed}. Retry keeps this setup; Practice creates a new one.</p></details>
      </aside>
    </div>
  </section>;
}
