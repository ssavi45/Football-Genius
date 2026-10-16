'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { sound } from '@/lib/utils/sound';
import PixelScoreboardArtwork, { CONTROLS, type ScoreControl } from './PixelScoreboardArtwork';
import './DigitalScoreboard.css';

interface DigitalScoreboardProps {
  disabled?: boolean;
  homeScore: number;
  awayScore: number;
  onHomeChange: (newScore: number) => void;
  onAwayChange: (newScore: number) => void;
}

const MIN_SCORE = 0;
// The supplied artwork supports two-digit scores.
const MAX_SCORE = 99;
const HOLD_DELAY = 450;
const HOLD_RATE = 85;

export default function DigitalScoreboard({ disabled = false, homeScore, awayScore, onHomeChange, onAwayChange }: DigitalScoreboardProps) {
  const prefix = useId().replace(/:/g, '');
  const [pressed, setPressed] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const live = useRef({ disabled, homeScore, awayScore, onHomeChange, onAwayChange });
  live.current = { disabled, homeScore, awayScore, onHomeChange, onAwayChange };

  const clearTimer = () => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
  };
  const release = () => { clearTimer(); setPressed(null); };

  useEffect(() => {
    if (disabled) { clearTimer(); setPressed(null); }
    return clearTimer;
  }, [disabled]);

  const step = (control: ScoreControl) => {
    const current = live.current;
    if (current.disabled) return false;
    const value = control.side === 'L' ? current.homeScore : current.awayScore;
    const next = Math.min(MAX_SCORE, Math.max(MIN_SCORE, value + control.step));
    if (value === next) return false;
    if (control.side === 'L') { current.homeScore = next; current.onHomeChange(next); }
    else { current.awayScore = next; current.onAwayChange(next); }
    return true;
  };

  const repeat = (control: ScoreControl) => {
    if (step(control)) timer.current = setTimeout(() => repeat(control), HOLD_RATE);
    else release();
  };

  return <div className="digital-scoreboard pixel-scoreboard" role="group" aria-label="Match score prediction">
    <PixelScoreboardArtwork homeScore={homeScore} awayScore={awayScore} prefix={prefix} pressed={pressed} />
    {CONTROLS.map(control => {
      const value = control.side === 'L' ? homeScore : awayScore;
      const isDisabled = disabled || (control.step === 1 ? value >= MAX_SCORE : value <= MIN_SCORE);
      return <button key={control.id} type="button" className="pixel-scoreboard-control" aria-label={control.label} disabled={isDisabled}
        style={{ left: `${(control.cx - 38) / 887 * 100}%`, top: `${285 / 443 * 100}%`, width: `${76 / 887 * 100}%`, height: `${76 / 443 * 100}%` }}
        onPointerDown={event => {
          if (event.pointerType === 'mouse' && event.button !== 0) return;
          clearTimer();
          event.currentTarget.setPointerCapture(event.pointerId);
          setPressed(control.id);
          if (step(control)) { sound.playClick(); timer.current = setTimeout(() => repeat(control), HOLD_DELAY); }
        }}
        onPointerUp={release} onPointerCancel={release} onLostPointerCapture={release} onBlur={release}
        onClick={event => { if (event.detail === 0 && step(control)) sound.playClick(); }}
        onContextMenu={event => event.preventDefault()}
      />;
    })}
    <span className="sr-only" role="status" aria-live="polite">Home {homeScore}, Away {awayScore}</span>
  </div>;
}
