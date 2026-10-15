'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/auth-context';
import transferData from '@/data/transfer-players.json';
import {
  ArrowLeft,
  PlaneTakeoff,
  Search,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Eye,
} from 'lucide-react';

interface TransferClub {
  label: string;
  logo: string;
}

interface TransferPlayer {
  name: string;
  aliases: string[];
  clubs: TransferClub[];
}

export default function JourneymanPage() {
  const { addXP, recordGameResult } = useAuth();
  const players = transferData as TransferPlayer[];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [guessInput, setGuessInput] = useState('');
  const [revealedClubsCount, setRevealedClubsCount] = useState(3);
  const [isSolved, setIsSolved] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const currentPlayer = players[currentIndex % players.length];

  // Suggestions for autocomplete
  const suggestions = useMemo(() => {
    if (!guessInput.trim() || guessInput.length < 2) return [];
    const q = guessInput.toLowerCase();
    return players
      .filter(p => p.name.toLowerCase().includes(q))
      .slice(0, 5);
  }, [guessInput, players]);

  const handleGuess = async (selectedName?: string) => {
    const nameToTest = (selectedName || guessInput).trim().toLowerCase();
    if (!nameToTest) return;

    const isMatch =
      currentPlayer.name.toLowerCase() === nameToTest ||
      currentPlayer.aliases.some(a => a.toLowerCase() === nameToTest);

    if (isMatch) {
      setIsSolved(true);
      setRevealedClubsCount(currentPlayer.clubs.length);
      await addXP(80, 'The Journeyman Transfer Trail');
      await recordGameResult('journeyman', true, 80);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00E5FF', '#2EFD72', '#FFC72C'],
      });
    } else {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      // Reveal another club as assistance
      if (revealedClubsCount < currentPlayer.clubs.length) {
        setRevealedClubsCount(prev => prev + 1);
      }
      if (nextAttempts >= 4) {
        setIsFailed(true);
        setRevealedClubsCount(currentPlayer.clubs.length);
        await recordGameResult('journeyman', false, 15);
      }
    }
    setGuessInput('');
  };

  const handleNext = () => {
    setCurrentIndex(prev => prev + 1);
    setGuessInput('');
    setRevealedClubsCount(3);
    setIsSolved(false);
    setIsFailed(false);
    setAttempts(0);
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
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-black bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            Player #{currentIndex + 1}
          </span>
        </div>
      </div>

      {/* Game Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black font-orbitron text-white">
          THE <span className="text-cyan-400">JOURNEYMAN</span>
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary max-w-xl mx-auto">
          Identify the globe-trotting football superstar from their chronological career club transfer trail.
        </p>
      </div>

      {/* Career Transfer Trail Card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-pitch-card to-pitch-dark p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between text-xs font-semibold text-text-secondary">
          <span className="flex items-center gap-2">
            <PlaneTakeoff className="h-4 w-4 text-cyan-400" /> Career Club Trail ({currentPlayer.clubs.length} clubs)
          </span>
          <span>{attempts} / 4 Misses</span>
        </div>

        {/* Chronological Club Timeline */}
        <div className="flex flex-wrap items-center justify-center gap-4 py-4">
          {currentPlayer.clubs.map((club, idx) => {
            const isRevealed = idx < revealedClubsCount || isSolved || isFailed;
            return (
              <React.Fragment key={idx}>
                <div
                  className={`flex flex-col items-center space-y-2 p-3 rounded-2xl border transition-all duration-300 ${
                    isRevealed
                      ? 'bg-pitch-black/80 border-cyan-500/30 shadow-lg'
                      : 'bg-white/[0.02] border-white/5 opacity-40'
                  }`}
                >
                  <div className="relative h-14 w-14 sm:h-16 sm:w-16 rounded-xl overflow-hidden p-1 bg-white/5 flex items-center justify-center">
                    {isRevealed ? (
                      <Image
                        src={`/${club.logo}`}
                        alt={club.label}
                        fill
                        className="object-contain p-1"
                      />
                    ) : (
                      <span className="text-lg font-black text-text-muted">?</span>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-white text-center max-w-[80px] truncate">
                    {isRevealed ? club.label : 'Hidden'}
                  </span>
                  <span className="text-[9px] font-semibold text-text-muted">
                    Club #{idx + 1}
                  </span>
                </div>

                {idx < currentPlayer.clubs.length - 1 && (
                  <span className="text-text-muted font-black text-sm">→</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Result Reveal or Guess Box */}
        {isSolved ? (
          <div className="p-6 rounded-2xl bg-neon-green/10 border border-neon-green/30 text-center space-y-3 animate-fadeIn">
            <CheckCircle2 className="h-10 w-10 text-neon-green mx-auto" />
            <h3 className="text-2xl font-black font-orbitron text-white">
              CORRECT: {currentPlayer.name}!
            </h3>
            <p className="text-xs text-text-secondary">+80 XP Awarded to your profile</p>
            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-neon-green text-pitch-black font-black text-xs shadow-neon transition"
            >
              NEXT JOURNEYMAN PLAYER
            </button>
          </div>
        ) : isFailed ? (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-3 animate-fadeIn">
            <XCircle className="h-10 w-10 text-rose-400 mx-auto" />
            <h3 className="text-xl font-black text-white">
              The player was {currentPlayer.name}
            </h3>
            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 transition"
            >
              TRY NEXT PLAYER
            </button>
          </div>
        ) : (
          /* Search & Guess Input */
          <div className="max-w-md mx-auto space-y-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Type footballer name..."
                value={guessInput}
                onChange={e => setGuessInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGuess()}
                className="w-full pl-4 pr-24 py-3 rounded-xl bg-pitch-black border border-white/15 text-white text-sm focus:outline-none focus:border-cyan-400 transition"
              />
              <button
                onClick={() => handleGuess()}
                disabled={!guessInput.trim()}
                className="absolute right-2 top-2 px-4 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-pitch-black font-black text-xs disabled:opacity-40 transition"
              >
                SUBMIT
              </button>
            </div>

            {/* Suggestions dropdown */}
            {suggestions.length > 0 && (
              <div className="rounded-xl bg-pitch-dark border border-white/10 p-1 space-y-1 shadow-xl">
                {suggestions.map(s => (
                  <button
                    key={s.name}
                    onClick={() => handleGuess(s.name)}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-white hover:bg-white/10 transition"
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

