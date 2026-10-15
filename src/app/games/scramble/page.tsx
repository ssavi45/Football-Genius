'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/auth-context';
import {
  ArrowLeft,
  Shuffle,
  Clock,
  Flame,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

interface ScramblePlayer {
  name: string;
  club: string;
  nationality: string;
  position: string;
}

const SCRAMBLE_PLAYERS: ScramblePlayer[] = [
  { name: 'ERLING HAALAND', club: 'Manchester City', nationality: 'Norway', position: 'Striker' },
  { name: 'JUDE BELLINGHAM', club: 'Real Madrid', nationality: 'England', position: 'Midfielder' },
  { name: 'KYLIAN MBAPPE', club: 'Real Madrid', nationality: 'France', position: 'Forward' },
  { name: 'LUKA MODRIC', club: 'Real Madrid', nationality: 'Croatia', position: 'Midfielder' },
  { name: 'BUKAYO SAKA', club: 'Arsenal', nationality: 'England', position: 'Winger' },
  { name: 'KEVIN DE BRUYNE', club: 'Manchester City', nationality: 'Belgium', position: 'Playmaker' },
  { name: 'VINICIUS JUNIOR', club: 'Real Madrid', nationality: 'Brazil', position: 'Winger' },
];

function scrambleString(str: string): string {
  const letters = str.replace(/\s+/g, '').split('');
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  return letters.join(' ');
}

export default function BootroomScramblePage() {
  const { addXP, recordGameResult } = useAuth();
  const [index, setIndex] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [scrambled, setScrambled] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [solved, setSolved] = useState(false);
  const [streak, setStreak] = useState(0);

  const current = SCRAMBLE_PLAYERS[index % SCRAMBLE_PLAYERS.length];

  useEffect(() => {
    setScrambled(scrambleString(current.name));
    setInputVal('');
    setShowHint(false);
    setSolved(false);
  }, [index, current.name]);

  const handleCheck = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (solved || !inputVal.trim()) return;

    const normalizedGuess = inputVal.replace(/\s+/g, '').toUpperCase();
    const normalizedTarget = current.name.replace(/\s+/g, '').toUpperCase();

    if (normalizedGuess === normalizedTarget) {
      setSolved(true);
      const newStreak = streak + 1;
      setStreak(newStreak);
      await addXP(30, 'Bootroom Scramble');
      await recordGameResult('scramble', true, 30);
      confetti({
        particleCount: 90,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#A855F7', '#2EFD72'],
      });
    }
  };

  const handleNext = () => {
    setIndex(prev => prev + 1);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fadeIn">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-white transition px-3 py-2 rounded-xl bg-pitch-card border border-white/5"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Arena
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-black">
            <Flame className="h-4 w-4 fill-purple-400" />
            <span>Streak: {streak}</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black font-orbitron text-white">
          BOOTROOM <span className="text-purple-400">SCRAMBLE</span>
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary max-w-xl mx-auto">
          Unscramble the letters to reveal the world-class footballer before time runs out.
        </p>
      </div>

      {/* Scramble Card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-pitch-card p-6 sm:p-10 text-center shadow-2xl space-y-6">
        <div className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
          Player Anagram #{index + 1}
        </div>

        {/* Big Scrambled Letters Display */}
        <div className="text-3xl sm:text-5xl font-black font-orbitron tracking-widest text-purple-400 py-4 select-none">
          {scrambled}
        </div>

        {/* Clues Toggle */}
        <div>
          {showHint ? (
            <div className="p-3 rounded-xl bg-pitch-black/60 border border-white/10 text-xs text-text-secondary max-w-sm mx-auto animate-fadeIn space-y-1">
              <div><span className="font-bold text-purple-400">Club: </span>{current.club}</div>
              <div><span className="font-bold text-purple-400">Nation: </span>{current.nationality}</div>
              <div><span className="font-bold text-purple-400">Position: </span>{current.position}</div>
            </div>
          ) : (
            <button
              onClick={() => setShowHint(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-purple-400 transition"
            >
              <HelpCircle className="h-3.5 w-3.5" /> Need a clue? (Club & Nationality)
            </button>
          )}
        </div>

        {/* Input Form or Success */}
        {solved ? (
          <div className="p-4 rounded-xl bg-neon-green/10 border border-neon-green/30 text-center space-y-3 animate-fadeIn">
            <CheckCircle2 className="h-8 w-8 text-neon-green mx-auto" />
            <div className="text-xl font-black text-white font-outfit">
              {current.name}!
            </div>
            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-neon-green text-pitch-black font-black text-xs shadow-neon transition"
            >
              NEXT SCRAMBLE
            </button>
          </div>
        ) : (
          <form onSubmit={handleCheck} className="flex gap-2 max-w-md mx-auto">
            <input
              type="text"
              autoFocus
              placeholder="Type player name..."
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-pitch-black border border-white/15 text-white text-sm focus:outline-none focus:border-purple-400 uppercase tracking-wider"
            />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-black text-xs disabled:opacity-40 transition shadow-lg"
            >
              SOLVE
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

