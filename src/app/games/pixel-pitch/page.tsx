'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/auth-context';
import playersData from '@/data/players.json';
import {
  ArrowLeft,
  Eye,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

interface PlayerData {
  id: string;
  name: string;
  image: string;
}

const PIXEL_ROUNDS = [
  {
    name: 'Lionel Messi',
    club: 'Inter Miami / Barcelona',
    number: '10',
    image: '/img/players/messi.jpg',
    nation: 'Argentina',
  },
  {
    name: 'Cristiano Ronaldo',
    club: 'Al Nassr / Real Madrid',
    number: '7',
    image: '/img/players/ronaldo.jpg',
    nation: 'Portugal',
  },
  {
    name: 'Kylian Mbappé',
    club: 'Real Madrid / PSG',
    number: '9 / 7',
    image: '/img/players/mbappe.jpg',
    nation: 'France',
  },
  {
    name: 'Erling Haaland',
    club: 'Manchester City',
    number: '9',
    image: '/img/players/haaland.jpg',
    nation: 'Norway',
  },
];

export default function PixelPitchPage() {
  const { addXP, recordGameResult } = useAuth();
  const [index, setIndex] = useState(0);
  const [guessInput, setGuessInput] = useState('');
  const [blurLevel, setBlurLevel] = useState(24);
  const [hintsUnlocked, setHintsUnlocked] = useState(0);
  const [solved, setSolved] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const current = PIXEL_ROUNDS[index % PIXEL_ROUNDS.length];

  const handleGuess = async () => {
    if (solved || !guessInput.trim()) return;

    const isMatch =
      guessInput.trim().toLowerCase() === current.name.toLowerCase() ||
      current.name.toLowerCase().includes(guessInput.trim().toLowerCase());

    if (isMatch) {
      setSolved(true);
      setBlurLevel(0);
      await addXP(90, 'Pixel Pitch Identifier');
      await recordGameResult('pixel-pitch', true, 90);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#EC4899', '#2EFD72'],
      });
    } else {
      setAttempts(prev => prev + 1);
      // Reduce blur to make it easier
      setBlurLevel(prev => Math.max(0, prev - 6));
    }
    setGuessInput('');
  };

  const handleNext = () => {
    setIndex(prev => prev + 1);
    setGuessInput('');
    setBlurLevel(24);
    setHintsUnlocked(0);
    setSolved(false);
    setAttempts(0);
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
          <span className="px-3 py-1 rounded-full text-xs font-black bg-pink-500/10 text-pink-400 border border-pink-500/30">
            Silhouette #{index + 1}
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black font-orbitron text-white">
          PIXEL <span className="text-pink-400">PITCH</span>
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary max-w-xl mx-auto">
          Identify the legendary superstar from their pixelated portrait. Each attempt unblurs the image!
        </p>
      </div>

      {/* Game Card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-pitch-card p-6 sm:p-10 text-center shadow-2xl space-y-6">
        {/* Pixel Image Container */}
        <div className="relative h-60 w-60 sm:h-72 sm:w-72 mx-auto rounded-2xl overflow-hidden border-2 border-pink-500/30 bg-pitch-black shadow-2xl">
          <Image
            src={current.image}
            alt="Mystery Footballer"
            fill
            sizes="288px"
            className="object-cover transition-all duration-700"
            style={{
              filter: `blur(${blurLevel}px) contrast(120%)`,
            }}
          />
        </div>

        {/* Hints */}
        <div className="flex justify-center gap-3">
          {hintsUnlocked >= 1 ? (
            <span className="text-xs font-bold text-pink-400 px-3 py-1.5 rounded-xl bg-pink-500/10 border border-pink-500/30">
              Nation: {current.nation}
            </span>
          ) : (
            <button
              onClick={() => {
                setHintsUnlocked(1);
                setBlurLevel(prev => Math.max(0, prev - 4));
              }}
              className="text-xs font-bold text-text-muted hover:text-pink-400 transition"
            >
              Reveal Nation (-4px blur)
            </button>
          )}

          {hintsUnlocked >= 2 ? (
            <span className="text-xs font-bold text-trophy-gold px-3 py-1.5 rounded-xl bg-trophy-gold/10 border border-trophy-gold/30">
              Club: {current.club}
            </span>
          ) : (
            <button
              onClick={() => {
                setHintsUnlocked(2);
                setBlurLevel(prev => Math.max(0, prev - 4));
              }}
              className="text-xs font-bold text-text-muted hover:text-trophy-gold transition"
            >
              Reveal Club (-4px blur)
            </button>
          )}
        </div>

        {/* Solve state or Guess form */}
        {solved ? (
          <div className="p-4 rounded-xl bg-neon-green/10 border border-neon-green/30 text-center space-y-3 animate-fadeIn">
            <CheckCircle2 className="h-8 w-8 text-neon-green mx-auto" />
            <div className="text-2xl font-black text-white font-outfit">
              {current.name}!
            </div>
            <p className="text-xs text-text-secondary">+90 XP Added</p>
            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-neon-green text-pitch-black font-black text-xs shadow-neon transition"
            >
              NEXT PIXEL SILHOUETTE
            </button>
          </div>
        ) : (
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="text"
              placeholder="Type player name..."
              value={guessInput}
              onChange={e => setGuessInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGuess()}
              className="flex-1 px-4 py-3 rounded-xl bg-pitch-black border border-white/15 text-white text-sm focus:outline-none focus:border-pink-400"
            />
            <button
              onClick={handleGuess}
              disabled={!guessInput.trim()}
              className="px-6 py-3 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-black text-xs disabled:opacity-40 transition shadow-lg"
            >
              GUESS
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

