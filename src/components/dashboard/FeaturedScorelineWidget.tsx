'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { sound } from '@/lib/utils/sound';
import { Play, Sparkles, Clock, ShieldCheck, ChevronRight, Plus, Minus } from 'lucide-react';

export default function FeaturedScorelineWidget() {
  const [homeScore, setHomeScore] = useState(3);
  const [awayScore, setAwayScore] = useState(0);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-neon-green/30 bg-gradient-to-br from-pitch-card via-pitch-dark to-pitch-black p-6 sm:p-8 shadow-2xl shadow-neon-green/5 group transition-all duration-300">
      {/* Stadium ambient floodlights */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-neon-green/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-trophy-gold/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-4 max-w-2xl">
          {/* Header Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-green/10 border border-neon-green/30 text-neon-green text-xs font-black uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Today&apos;s Featured Match Drama</span>
            <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-ping" />
          </div>

          {/* Title */}
          <div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black font-orbitron tracking-tight text-white leading-none">
              SCORELINE <span className="text-neon-green">HERO</span>
            </h2>
            <p className="text-sm sm:text-base text-text-secondary mt-2 font-medium leading-relaxed">
              Predict the iconic 2019 UEFA Champions League semifinal scoreline using dynamic hints, team lineups & dramatic commentary quotes.
            </p>
          </div>

          {/* Interactive Match Scoreboard Teaser */}
          <div className="inline-flex flex-wrap items-center gap-4 p-3.5 rounded-2xl bg-pitch-black/80 border border-white/10 backdrop-blur-md">
            {/* Home Team */}
            <div className="flex items-center gap-2.5">
              <div className="relative h-8 w-8">
                <Image src="/img/teams/barca.png" alt="FC Barcelona" fill className="object-contain" />
              </div>
              <span className="text-sm font-bold text-white">FC Barcelona</span>
              <div className="flex items-center bg-white/5 rounded-xl border border-white/10 px-2 py-0.5">
                <span className="text-lg font-black font-orbitron text-neon-green">{homeScore}</span>
              </div>
            </div>

            <span className="text-xs font-black px-2 py-0.5 rounded bg-white/10 text-text-muted font-orbitron">
              VS
            </span>

            {/* Away Team */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center bg-white/5 rounded-xl border border-white/10 px-2 py-0.5">
                <span className="text-lg font-black font-orbitron text-neon-green">{awayScore}</span>
              </div>
              <span className="text-sm font-bold text-white">Liverpool</span>
              <div className="relative h-8 w-8">
                <Image src="/img/teams/liverpool.png" alt="Liverpool" fill className="object-contain" />
              </div>
            </div>
          </div>

          {/* CTA & Expiry info */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <Link
              href="/games/scoreline"
              onMouseEnter={() => sound.playHover()}
              onClick={() => sound.playClick()}
              className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-neon-green hover:bg-neon-green/90 text-pitch-black font-black font-outfit text-sm transition-all shadow-neon hover:shadow-neon-lg active:scale-95"
            >
              <Play className="h-4 w-4 fill-pitch-black" />
              CONTINUE PREDICTION
            </Link>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
              <Clock className="h-4 w-4 text-trophy-gold" />
              <span>Expires in 08h 24m • +150 XP</span>
            </div>
          </div>
        </div>

        {/* Right Artwork Banner */}
        <div className="relative w-full lg:w-80 h-64 lg:h-72 rounded-2xl overflow-hidden border border-white/10 shadow-2xl group shrink-0">
          <Image
            src="/img/cards/scoreline_hero_art.png"
            alt="Scoreline Hero Match Art"
            fill
            priority
            className="object-cover group-hover:scale-105 transition duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-pitch-black via-pitch-black/20 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-bold text-white">
            <span className="px-2.5 py-1 rounded-lg bg-pitch-black/80 backdrop-blur-md border border-white/10">
              12,410 Predictions
            </span>
            <span className="text-neon-green flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" /> Official UCL
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

