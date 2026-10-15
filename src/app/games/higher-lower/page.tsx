'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/auth-context';
import playersData from '@/data/players.json';
import {
  ArrowLeft,
  Flame,
  Trophy,
  ArrowUpCircle,
  ArrowDownCircle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from 'lucide-react';

interface PlayerItem {
  id: string;
  name: string;
  image: string;
  stats: {
    marketValue: number;
    careerGoals?: number;
    careerTrophies?: number;
  };
}

export default function HigherLowerPage() {
  const { addXP, recordGameResult } = useAuth();
  const validPlayers = (playersData as PlayerItem[]).filter(
    p => p.stats && typeof p.stats.marketValue === 'number' && p.stats.marketValue > 0
  );

  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [leftPlayer, setLeftPlayer] = useState<PlayerItem>(validPlayers[0]);
  const [rightPlayer, setRightPlayer] = useState<PlayerItem>(validPlayers[1]);
  const [revealed, setRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);

  // Initialize game
  useEffect(() => {
    initRound();
  }, []);

  const getRandomPlayer = (excludeIds: string[]): PlayerItem => {
    const candidates = validPlayers.filter(p => !excludeIds.includes(p.id));
    return candidates[Math.floor(Math.random() * candidates.length)] || validPlayers[0];
  };

  const initRound = () => {
    const p1 = validPlayers[Math.floor(Math.random() * validPlayers.length)];
    const p2 = getRandomPlayer([p1.id]);
    setLeftPlayer(p1);
    setRightPlayer(p2);
    setRevealed(false);
    setIsCorrect(null);
    setIsGameOver(false);
    setScore(0);
  };

  const handleGuess = async (guess: 'higher' | 'lower') => {
    if (revealed || isGameOver) return;
    setRevealed(true);

    const valA = leftPlayer.stats.marketValue;
    const valB = rightPlayer.stats.marketValue;

    const correct =
      (guess === 'higher' && valB >= valA) || (guess === 'lower' && valB <= valA);

    setIsCorrect(correct);

    if (correct) {
      const newScore = score + 1;
      setScore(newScore);
      if (newScore > bestScore) setBestScore(newScore);
      await addXP(15, 'Higher or Lower Correct Pick');

      if (newScore % 5 === 0) {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#2EFD72', '#FFC72C'],
        });
      }

      // Next card transition after 1.2s
      setTimeout(() => {
        setLeftPlayer(rightPlayer);
        setRightPlayer(getRandomPlayer([leftPlayer.id, rightPlayer.id]));
        setRevealed(false);
        setIsCorrect(null);
      }, 1200);
    } else {
      setIsGameOver(true);
      await recordGameResult('higher-lower', score >= 3, score * 15);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fadeIn">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-white transition px-3 py-2 rounded-xl bg-pitch-card border border-white/5"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Arena
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black">
            <Flame className="h-4 w-4 fill-amber-400" />
            <span>Streak: {score}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-trophy-gold/10 border border-trophy-gold/30 text-trophy-gold text-xs font-black">
            <Trophy className="h-3.5 w-3.5" />
            <span>Best: {bestScore}</span>
          </div>
        </div>
      </div>

      {/* Game Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black font-orbitron text-white">
          HIGHER <span className="text-neon-green">OR</span> LOWER
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary max-w-xl mx-auto">
          Does the player on the right have a higher or lower transfer market value?
        </p>
      </div>

      {/* VS Matchup Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
        {/* Left Player (Known Value) */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-pitch-card p-6 flex flex-col justify-between items-center text-center min-h-[380px] shadow-2xl">
          <div className="space-y-4">
            <div className="relative h-40 w-40 rounded-2xl overflow-hidden mx-auto border-2 border-white/10 shadow-lg">
              <Image
                src={`/${leftPlayer.image}`}
                alt={leftPlayer.name}
                fill
                sizes="160px"
                className="object-cover"
                priority
              />
            </div>
            <div>
              <h2 className="text-2xl font-black font-outfit text-white">
                {leftPlayer.name}
              </h2>
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Current Market Value
              </span>
            </div>
          </div>

          <div className="text-4xl font-black font-orbitron text-trophy-gold">
            €{leftPlayer.stats.marketValue}M
          </div>
        </div>

        {/* Center VS Badge */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-pitch-black border-2 border-neon-green items-center justify-center font-black font-orbitron text-white text-sm shadow-neon">
          VS
        </div>

        {/* Right Player (Target Guess) */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-pitch-card p-6 flex flex-col justify-between items-center text-center min-h-[380px] shadow-2xl">
          <div className="space-y-4">
            <div className="relative h-40 w-40 rounded-2xl overflow-hidden mx-auto border-2 border-white/10 shadow-lg">
              <Image
                src={`/${rightPlayer.image}`}
                alt={rightPlayer.name}
                fill
                sizes="160px"
                className="object-cover"
                priority
              />
            </div>
            <div>
              <h2 className="text-2xl font-black font-outfit text-white">
                {rightPlayer.name}
              </h2>
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Has a market value
              </span>
            </div>
          </div>

          {/* Value Reveal or Higher/Lower Action Buttons */}
          {revealed ? (
            <div className="space-y-2 animate-fadeIn">
              <div
                className={`text-4xl font-black font-orbitron ${
                  isCorrect ? 'text-neon-green' : 'text-rose-400'
                }`}
              >
                €{rightPlayer.stats.marketValue}M
              </div>
              <span
                className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${
                  isCorrect
                    ? 'bg-neon-green/10 text-neon-green'
                    : 'bg-rose-500/10 text-rose-400'
                }`}
              >
                {isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                {isCorrect ? 'CORRECT! (+15 XP)' : 'INCORRECT!'}
              </span>
            </div>
          ) : (
            <div className="w-full flex gap-3 pt-4">
              <button
                onClick={() => handleGuess('higher')}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-neon-green hover:bg-neon-green/90 text-pitch-black font-black text-xs transition shadow-neon active:scale-95"
              >
                <ArrowUpCircle className="h-4 w-4" /> HIGHER ▲
              </button>
              <button
                onClick={() => handleGuess('lower')}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black text-xs transition shadow-lg active:scale-95"
              >
                <ArrowDownCircle className="h-4 w-4" /> LOWER ▼
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-pitch-card to-pitch-dark border border-white/10 text-center space-y-4 max-w-xl mx-auto shadow-2xl animate-fadeIn">
          <XCircle className="h-10 w-10 text-rose-400 mx-auto" />
          <h2 className="text-2xl font-black font-orbitron text-white">
            STREAK ENDED: {score}
          </h2>
          <p className="text-xs text-text-secondary">
            Your best streak this session: {bestScore}. You earned +{score * 15} XP!
          </p>
          <div>
            <button
              onClick={initRound}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-neon-green text-pitch-black font-black text-xs shadow-neon transition"
            >
              <RotateCcw className="h-4 w-4" /> PLAY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

