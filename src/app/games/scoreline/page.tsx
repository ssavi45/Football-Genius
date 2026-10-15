'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/auth-context';
import {
  ArrowLeft,
  Calendar,
  Sparkles,
  HelpCircle,
  Trophy,
  Share2,
  RotateCcw,
  Plus,
  Minus,
  CheckCircle2,
  Quote,
  Eye,
  Info,
} from 'lucide-react';

interface MatchChallenge {
  id: string;
  date: string;
  competition: string;
  venue: string;
  homeTeam: {
    name: string;
    logo: string;
    code: string;
  };
  awayTeam: {
    name: string;
    logo: string;
    code: string;
  };
  actualScore: {
    home: number;
    away: number;
  };
  hints: {
    halfTime: string;
    stage: string;
    keyFact: string;
    commentaryQuote: string;
  };
  recap: string;
}

const HISTORIC_MATCHES: MatchChallenge[] = [
  {
    id: 'ucl-barca-liverpool-2019',
    date: '1 May 2019',
    competition: 'UEFA Champions League • Semi-Final 1st Leg',
    venue: 'Camp Nou, Barcelona',
    homeTeam: {
      name: 'FC Barcelona',
      logo: '/img/teams/barca.png',
      code: 'BAR',
    },
    awayTeam: {
      name: 'Liverpool',
      logo: '/img/teams/liverpool.png',
      code: 'LIV',
    },
    actualScore: { home: 3, away: 0 },
    hints: {
      stage: 'Semi-Final 1st Leg under the Camp Nou floodlights',
      halfTime: 'Half-time score was 1 - 0 to the home team',
      keyFact: 'Former Liverpool striker opened the scoring, before a legendary #10 struck twice including an iconic 30-yard free-kick into the top corner',
      commentaryQuote: '"It is a special, special stadium for a special, special talent! He has struck it into the top corner!"',
    },
    recap: 'Lionel Messi scored twice including an astonishing 35-yard free kick past Alisson, alongside Luis Suarez\'s first-half opener to give Barcelona a stunning 3-0 lead.',
  },
  {
    id: 'wc-final-2022',
    date: '18 Dec 2022',
    competition: 'FIFA World Cup Final',
    venue: 'Lusail Iconic Stadium, Qatar',
    homeTeam: {
      name: 'Argentina',
      logo: '/img/countries/argentina.png',
      code: 'ARG',
    },
    awayTeam: {
      name: 'France',
      logo: '/img/countries/france.png',
      code: 'FRA',
    },
    actualScore: { home: 3, away: 3 },
    hints: {
      stage: 'The greatest World Cup Final in football history (After Extra Time)',
      halfTime: 'Half-time was 2 - 0 to the South American champions',
      keyFact: 'A young French sensation scored a World Cup final hat-trick, while the maestro scored twice to take it to penalties',
      commentaryQuote: '"Messi has conquered his final peak! Argentina will be crowned world champions once again!"',
    },
    recap: 'An all-time epic ending 3-3 after extra time with Kylian Mbappé scoring a hat-trick and Lionel Messi scoring twice, before Argentina triumphed 4-2 on penalties.',
  },
];

export default function ScorelineHeroPage() {
  const { addXP, recordGameResult } = useAuth();
  const [matchIndex, setMatchIndex] = useState(0);
  const match = HISTORIC_MATCHES[matchIndex];

  const [predictedHome, setPredictedHome] = useState(2);
  const [predictedAway, setPredictedAway] = useState(1);
  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleHint = (index: number) => {
    if (!revealedHints.includes(index)) {
      setRevealedHints([...revealedHints, index]);
    }
  };

  const handleSubmit = async () => {
    if (submitted) return;
    setSubmitted(true);

    const isExact =
      predictedHome === match.actualScore.home &&
      predictedAway === match.actualScore.away;

    const correctOutcome =
      (predictedHome > predictedAway && match.actualScore.home > match.actualScore.away) ||
      (predictedHome < predictedAway && match.actualScore.home < match.actualScore.away) ||
      (predictedHome === predictedAway && match.actualScore.home === match.actualScore.away);

    let earnedXP = 40;
    if (isExact) {
      earnedXP = 150;
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#2EFD72', '#FFC72C', '#00FF87', '#FFFFFF'],
      });
    } else if (correctOutcome) {
      earnedXP = 85;
    }

    await addXP(earnedXP, 'Scoreline Hero');
    await recordGameResult('scoreline', isExact || correctOutcome, earnedXP);
  };

  const handleNextMatch = () => {
    const nextIdx = (matchIndex + 1) % HISTORIC_MATCHES.length;
    setMatchIndex(nextIdx);
    setPredictedHome(2);
    setPredictedAway(1);
    setRevealedHints([]);
    setSubmitted(false);
  };

  const isExact =
    submitted &&
    predictedHome === match.actualScore.home &&
    predictedAway === match.actualScore.away;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fadeIn">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-white transition px-3 py-2 rounded-xl bg-pitch-card border border-white/5"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Arena
        </Link>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-black bg-neon-green/10 text-neon-green border border-neon-green/30">
            Daily Match #{matchIndex + 1}
          </span>
        </div>
      </div>

      {/* Match Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-pitch-card to-pitch-dark p-6 sm:p-8 shadow-2xl text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-text-secondary mb-4">
          <Calendar className="h-3.5 w-3.5 text-trophy-gold" />
          <span>{match.competition} • {match.date}</span>
        </div>

        <p className="text-xs text-text-muted font-medium mb-6">
          Venue: {match.venue}
        </p>

        {/* Teams and Score Dials */}
        <div className="grid grid-cols-3 items-center gap-4 max-w-xl mx-auto">
          {/* Home Team */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white/5 p-2 border border-white/10">
              <Image
                src={match.homeTeam.logo}
                alt={match.homeTeam.name}
                fill
                className="object-contain p-1"
              />
            </div>
            <h2 className="text-sm sm:text-base font-extrabold text-white text-center">
              {match.homeTeam.name}
            </h2>

            {/* Home Score Stepper */}
            {!submitted ? (
              <div className="flex items-center gap-2 bg-pitch-black p-1.5 rounded-2xl border border-white/10">
                <button
                  onClick={() => setPredictedHome(Math.max(0, predictedHome - 1))}
                  className="h-8 w-8 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-white transition active:scale-95"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-2xl font-black font-orbitron text-neon-green text-center">
                  {predictedHome}
                </span>
                <button
                  onClick={() => setPredictedHome(Math.min(9, predictedHome + 1))}
                  className="h-8 w-8 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-white transition active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="text-3xl sm:text-4xl font-black font-orbitron text-white">
                {predictedHome}
              </div>
            )}
          </div>

          {/* Versus / Actual Score Divider */}
          <div className="flex flex-col items-center justify-center">
            {submitted ? (
              <div className="space-y-1 text-center">
                <span className="text-[10px] uppercase font-black tracking-widest text-text-muted">
                  Full Time
                </span>
                <div className="text-3xl sm:text-4xl font-black font-orbitron text-trophy-gold">
                  {match.actualScore.home} - {match.actualScore.away}
                </div>
                <span
                  className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full ${
                    isExact
                      ? 'bg-neon-green text-pitch-black'
                      : 'bg-white/10 text-white'
                  }`}
                >
                  {isExact ? 'EXACT MATCH! (+150 XP)' : 'RESULT REVEALED'}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-2xl font-black font-orbitron text-text-muted">VS</span>
                <span className="text-[10px] font-bold text-text-secondary mt-1">
                  Adjust dials
                </span>
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white/5 p-2 border border-white/10">
              <Image
                src={match.awayTeam.logo}
                alt={match.awayTeam.name}
                fill
                className="object-contain p-1"
              />
            </div>
            <h2 className="text-sm sm:text-base font-extrabold text-white text-center">
              {match.awayTeam.name}
            </h2>

            {/* Away Score Stepper */}
            {!submitted ? (
              <div className="flex items-center gap-2 bg-pitch-black p-1.5 rounded-2xl border border-white/10">
                <button
                  onClick={() => setPredictedAway(Math.max(0, predictedAway - 1))}
                  className="h-8 w-8 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-white transition active:scale-95"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-2xl font-black font-orbitron text-neon-green text-center">
                  {predictedAway}
                </span>
                <button
                  onClick={() => setPredictedAway(Math.min(9, predictedAway + 1))}
                  className="h-8 w-8 rounded-xl bg-white/5 hover:bg-white/15 flex items-center justify-center text-white transition active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="text-3xl sm:text-4xl font-black font-orbitron text-white">
                {predictedAway}
              </div>
            )}
          </div>
        </div>

        {/* Submit Prediction Button */}
        {!submitted ? (
          <div className="mt-8">
            <button
              onClick={handleSubmit}
              className="px-8 py-3.5 rounded-xl bg-neon-green hover:bg-neon-green/90 text-pitch-black font-black font-outfit text-sm transition shadow-neon active:scale-95"
            >
              LOCK IN PREDICTION ({predictedHome} - {predictedAway})
            </button>
          </div>
        ) : (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleNextMatch}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition"
            >
              <RotateCcw className="h-4 w-4" /> Try Another Historic Match
            </button>
          </div>
        )}
      </div>

      {/* Tiered Hints Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-wider text-text-secondary flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-neon-green" /> Tactical Match Clues ({revealedHints.length}/3)
          </h3>
          <span className="text-xs text-text-muted">Unlock clues before submitting</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Hint 1: Half-Time */}
          <div
            onClick={() => toggleHint(1)}
            className={`cursor-pointer rounded-2xl p-4 border transition ${
              revealedHints.includes(1)
                ? 'bg-pitch-card border-neon-green/30'
                : 'bg-pitch-dark/80 border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-text-secondary">Clue #1: Half-Time</span>
              {revealedHints.includes(1) ? (
                <CheckCircle2 className="h-4 w-4 text-neon-green" />
              ) : (
                <Eye className="h-4 w-4 text-text-muted" />
              )}
            </div>
            {revealedHints.includes(1) ? (
              <p className="text-xs text-white font-medium">{match.hints.halfTime}</p>
            ) : (
              <p className="text-xs text-text-muted italic">Click to reveal half-time scoreline</p>
            )}
          </div>

          {/* Hint 2: Key Match Fact */}
          <div
            onClick={() => toggleHint(2)}
            className={`cursor-pointer rounded-2xl p-4 border transition ${
              revealedHints.includes(2)
                ? 'bg-pitch-card border-neon-green/30'
                : 'bg-pitch-dark/80 border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-text-secondary">Clue #2: Match Event</span>
              {revealedHints.includes(2) ? (
                <CheckCircle2 className="h-4 w-4 text-neon-green" />
              ) : (
                <Eye className="h-4 w-4 text-text-muted" />
              )}
            </div>
            {revealedHints.includes(2) ? (
              <p className="text-xs text-white font-medium">{match.hints.keyFact}</p>
            ) : (
              <p className="text-xs text-text-muted italic">Click to reveal key tactical turning point</p>
            )}
          </div>

          {/* Hint 3: Commentary Quote */}
          <div
            onClick={() => toggleHint(3)}
            className={`cursor-pointer rounded-2xl p-4 border transition ${
              revealedHints.includes(3)
                ? 'bg-pitch-card border-neon-green/30'
                : 'bg-pitch-dark/80 border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-text-secondary">Clue #3: Commentary</span>
              {revealedHints.includes(3) ? (
                <CheckCircle2 className="h-4 w-4 text-neon-green" />
              ) : (
                <Quote className="h-4 w-4 text-text-muted" />
              )}
            </div>
            {revealedHints.includes(3) ? (
              <p className="text-xs text-trophy-gold font-medium italic">{match.hints.commentaryQuote}</p>
            ) : (
              <p className="text-xs text-text-muted italic">Click to reveal iconic commentary quote</p>
            )}
          </div>
        </div>
      </div>

      {/* Recap & Drama card if submitted */}
      {submitted && (
        <div className="p-5 rounded-2xl bg-pitch-card border border-white/10 animate-fadeIn">
          <div className="flex items-center gap-2 text-trophy-gold text-xs font-bold uppercase tracking-wider mb-2">
            <Info className="h-4 w-4" /> Match Story & Significance
          </div>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            {match.recap}
          </p>
        </div>
      )}
    </div>
  );
}

