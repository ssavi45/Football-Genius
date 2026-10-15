'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { sound } from '@/lib/utils/sound';
import { useAuth } from '@/context/auth-context';
import DigitalScoreboard from '@/components/scoreboard/DigitalScoreboard';
import {
  Calendar,
  MapPin,
  ArrowRight,
  SkipForward,
  Lightbulb,
  Search,
  Target,
  CheckCircle2,
  Trophy,
  RotateCcw,
} from 'lucide-react';

interface MatchData {
  competition: string;
  stage: string;
  title: string;
  date: string;
  venue: string;
  homeTeam: {
    name: string;
    crest: string;
    league: string;
    flag: string;
  };
  awayTeam: {
    name: string;
    crest: string;
    league: string;
    flag: string;
  };
  actualScore: {
    home: number;
    away: number;
  };
  hints: {
    h1: string;
    h2: string;
    h3: string;
  };
}

const CURRENT_MATCH: MatchData = {
  competition: 'UEFA Champions League',
  stage: 'Final',
  title: 'UEFA Champions League Final',
  date: 'May 28, 2011',
  venue: 'Wembley Stadium, London',
  homeTeam: {
    name: 'Barcelona',
    crest: '/img/teams/fcb.png',
    league: 'La Liga',
    flag: '🇪🇸',
  },
  awayTeam: {
    name: 'Manchester United',
    crest: '/img/teams/manu.png',
    league: 'Premier League',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  },
  actualScore: {
    home: 3,
    away: 1,
  },
  hints: {
    h1: 'Half-time score was 1 - 1 with Pedro and Wayne Rooney trading clinical strikes.',
    h2: 'Lionel Messi scored a stunning 20-yard strike in the 54th min to retake the lead.',
    h3: 'David Villa sealed the iconic 3-1 triumph with a sublime 25-yard curling effort into the top corner.',
  },
};

interface HeroMatchCardProps {
  onPredictionSubmitted?: (isExact: boolean, score: number) => void;
}

export default function HeroMatchCard({ onPredictionSubmitted }: HeroMatchCardProps) {
  const { addXP, recordGameResult } = useAuth();

  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const toggleHint = (hintNum: number) => {
    sound.playClick();
    if (!revealedHints.includes(hintNum)) {
      setRevealedHints([...revealedHints, hintNum]);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitted) return;
    sound.playClick();
    setIsSubmitted(true);

    const isExact =
      homeScore === CURRENT_MATCH.actualScore.home &&
      awayScore === CURRENT_MATCH.actualScore.away;

    const correctOutcome =
      (homeScore > awayScore && CURRENT_MATCH.actualScore.home > CURRENT_MATCH.actualScore.away) ||
      (homeScore < awayScore && CURRENT_MATCH.actualScore.home < CURRENT_MATCH.actualScore.away) ||
      (homeScore === awayScore && CURRENT_MATCH.actualScore.home === CURRENT_MATCH.actualScore.away);

    if (isExact) {
      sound.playSuccess();
      setResultMessage('PERFECT PREDICTION! 3 - 1 EXACT MATCH (+150 XP)');
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#0066FF', '#2EFD72', '#FFC72C'],
      });
      await addXP(150, 'UCL Final Exact Score');
      await recordGameResult('scoreline', true, 150);
      onPredictionSubmitted?.(true, 150);
    } else if (correctOutcome) {
      sound.playSuccess();
      setResultMessage(`CORRECT WINNER! Actual was ${CURRENT_MATCH.actualScore.home} - ${CURRENT_MATCH.actualScore.away} (+75 XP)`);
      await addXP(75, 'UCL Final Outcome');
      await recordGameResult('scoreline', true, 75);
      onPredictionSubmitted?.(false, 75);
    } else {
      setResultMessage(`Actual result was ${CURRENT_MATCH.actualScore.home} - ${CURRENT_MATCH.actualScore.away} (+25 XP)`);
      await addXP(25, 'UCL Final Attempt');
      await recordGameResult('scoreline', false, 25);
      onPredictionSubmitted?.(false, 25);
    }
  };

  const handleReset = () => {
    sound.playClick();
    setHomeScore(0);
    setAwayScore(0);
    setRevealedHints([]);
    setIsSubmitted(false);
    setResultMessage(null);
  };

  return (
    <div className="card-white rounded-3xl p-5 sm:p-7 border border-blue-100/90 shadow-xl shadow-blue-900/5 space-y-6 overflow-hidden">
      {/* 1. Header Banner (Matching Wembley Arch + Silver Trophy Mockup) */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-7 border border-blue-100 bg-gradient-to-r from-[#E3EFFF] via-[#EFF6FF] to-[#D9ECFF]">
        {/* Background Trophy & Wembley Banner Image */}
        <div className="absolute inset-0 pointer-events-none">
          <Image
            src="/img/backgrounds/ucl_wembley_banner.png"
            alt="UEFA Champions League Final Banner"
            fill
            priority
            className="object-cover object-right opacity-90 mix-blend-multiply"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#EBF3FC] via-[#EBF3FC]/80 to-transparent" />
        </div>

        {/* Banner Content */}
        <div className="relative z-10 space-y-2 max-w-lg">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <span className="text-sm">⚽</span>
            <span>{CURRENT_MATCH.competition}</span>
            <span className="text-slate-400 font-normal">&gt;</span>
            <span className="text-blue-600 font-semibold">{CURRENT_MATCH.stage}</span>
          </div>

          {/* Main Title */}
          <h2 className="text-2xl sm:text-3xl font-black font-outfit text-slate-900 tracking-tight leading-tight">
            {CURRENT_MATCH.title}
          </h2>

          {/* Date & Venue Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 pt-1">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-blue-600" />
              <span>{CURRENT_MATCH.date}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-blue-600" />
              <span>{CURRENT_MATCH.venue}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Match Prediction Board */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-2">
        {/* Barcelona (Left Team) */}
        <div className="flex flex-col items-center space-y-2.5 text-center min-w-[120px]">
          <div className="relative h-20 w-20 drop-shadow-md transition-transform hover:scale-105">
            <Image
              src={CURRENT_MATCH.homeTeam.crest}
              alt={CURRENT_MATCH.homeTeam.name}
              fill
              className="object-contain"
            />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 font-outfit">
            {CURRENT_MATCH.homeTeam.name}
          </h3>
          <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
            <span>{CURRENT_MATCH.homeTeam.flag}</span>
            <span>{CURRENT_MATCH.homeTeam.league}</span>
          </span>
        </div>

        {/* Center: 3D Metallic Electronic Scoreboard Console */}
        <div className="flex flex-col items-center space-y-3">
          <DigitalScoreboard
            homeScore={homeScore}
            awayScore={awayScore}
            onHomeChange={setHomeScore}
            onAwayChange={setAwayScore}
          />
        </div>

        {/* Manchester United (Right Team) */}
        <div className="flex flex-col items-center space-y-2.5 text-center min-w-[120px]">
          <div className="relative h-20 w-20 drop-shadow-md transition-transform hover:scale-105">
            <Image
              src={CURRENT_MATCH.awayTeam.crest}
              alt={CURRENT_MATCH.awayTeam.name}
              fill
              className="object-contain"
            />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 font-outfit">
            {CURRENT_MATCH.awayTeam.name}
          </h3>
          <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200/80">
            <span>{CURRENT_MATCH.awayTeam.flag}</span>
            <span>{CURRENT_MATCH.awayTeam.league}</span>
          </span>
        </div>
      </div>

      {/* Result feedback if submitted */}
      {resultMessage && (
        <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-center animate-fadeIn">
          <p className="text-sm font-extrabold text-blue-900 font-outfit">
            {resultMessage}
          </p>
        </div>
      )}

      {/* 3. Action Buttons (Submit & Skip) */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
        {!isSubmitted ? (
          <>
            <button
              onClick={handleSubmit}
              onMouseEnter={() => sound.playHover()}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-black text-sm tracking-wide shadow-lg shadow-blue-500/30 transition-all active:scale-95"
            >
              <span>Submit Prediction</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={handleReset}
              onMouseEnter={() => sound.playHover()}
              className="flex items-center gap-1.5 px-6 py-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm border border-slate-200 transition-all active:scale-95"
            >
              <span>Skip / Next</span>
              <SkipForward className="h-4 w-4 text-slate-400" />
            </button>
          </>
        ) : (
          <button
            onClick={handleReset}
            onMouseEnter={() => sound.playHover()}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 font-bold text-xs transition"
          >
            <RotateCcw className="h-4 w-4" /> Play Match Again
          </button>
        )}
      </div>

      {/* 4. Three Bottom Hint Cards (Matching Mockup Colors) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        {/* Hint 1: Amber Card */}
        <div className="rounded-2xl p-4 bg-amber-50/70 border border-amber-200/80 flex flex-col justify-between space-y-3 transition">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                <Lightbulb className="h-4 w-4" />
              </div>
              <span className="text-xs font-black text-slate-900">Hint 1</span>
            </div>

            <button
              onClick={() => toggleHint(1)}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-xs transition active:scale-95 flex items-center gap-1"
            >
              <span>Reveal</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {revealedHints.includes(1) ? (
            <p className="text-xs text-amber-950 font-medium leading-relaxed animate-fadeIn">
              {CURRENT_MATCH.hints.h1}
            </p>
          ) : (
            <p className="text-[11px] text-slate-500 italic">
              Click reveal to view half-time scoreline clue
            </p>
          )}
        </div>

        {/* Hint 2: Blue Card */}
        <div className="rounded-2xl p-4 bg-blue-50/70 border border-blue-200/80 flex flex-col justify-between space-y-3 transition">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                <Search className="h-4 w-4" />
              </div>
              <span className="text-xs font-black text-slate-900">Hint 2</span>
            </div>

            <button
              onClick={() => toggleHint(2)}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-xs transition active:scale-95 flex items-center gap-1"
            >
              <span>Reveal</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {revealedHints.includes(2) ? (
            <p className="text-xs text-blue-950 font-medium leading-relaxed animate-fadeIn">
              {CURRENT_MATCH.hints.h2}
            </p>
          ) : (
            <p className="text-[11px] text-slate-500 italic">
              Click reveal to view key match turning point
            </p>
          )}
        </div>

        {/* Hint 3: Purple Card */}
        <div className="rounded-2xl p-4 bg-purple-50/70 border border-purple-200/80 flex flex-col justify-between space-y-3 transition">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                <Target className="h-4 w-4" />
              </div>
              <span className="text-xs font-black text-slate-900">Hint 3</span>
            </div>

            <button
              onClick={() => toggleHint(3)}
              className="px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-xs transition active:scale-95 flex items-center gap-1"
            >
              <span>Reveal</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {revealedHints.includes(3) ? (
            <p className="text-xs text-purple-950 font-medium leading-relaxed animate-fadeIn">
              {CURRENT_MATCH.hints.h3}
            </p>
          ) : (
            <p className="text-[11px] text-slate-500 italic">
              Click reveal to view final decisive moment clue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

