'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/auth-context';
import { GAME_MODES, QUICK_PLAY_MODES } from '@/lib/constants/game-modes';
import { GameCategory } from '@/lib/types/games';
import {
  Flame,
  Zap,
  Trophy,
  ArrowRight,
  Play,
  Swords,
  Sparkles,
  Grid3X3,
  PlaneTakeoff,
  TrendingUp,
  MessageSquareQuote,
  Shuffle,
  Eye,
  LayoutGrid,
  List,
  Calendar,
  Clock,
  ShieldCheck,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  Grid3X3,
  Swords,
  PlaneTakeoff,
  TrendingUp,
  MessageSquareQuote,
  Shuffle,
  Eye,
};

export default function HomeArenaPage() {
  const { profile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('all');
  // Defaulting to grid mode as requested by user
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredModes = GAME_MODES.filter(mode => {
    if (selectedCategory === 'all') return true;
    return mode.category === selectedCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fadeIn">
      {/* 1. Gamification Ribbon */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Streak */}
        <div className="glass-card rounded-2xl p-4 flex items-center gap-3 border border-white/5 shadow-card hover:border-amber-500/30 transition">
          <div className="h-11 w-11 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
            <Flame className="h-6 w-6 fill-amber-400" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
              Daily Streak
            </div>
            <div className="text-xl font-black font-outfit text-white">
              {profile.current_streak} <span className="text-xs font-semibold text-text-muted">Days</span>
            </div>
          </div>
        </div>

        {/* Level / Total XP */}
        <div className="glass-card rounded-2xl p-4 flex items-center gap-3 border border-white/5 shadow-card hover:border-neon-green/30 transition">
          <div className="h-11 w-11 rounded-xl bg-neon-green/10 border border-neon-green/25 flex items-center justify-center text-neon-green">
            <Zap className="h-6 w-6 fill-neon-green" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
              Scout Level {profile.level}
            </div>
            <div className="text-xl font-black font-outfit text-white">
              {profile.total_xp} <span className="text-xs font-semibold text-text-muted">XP</span>
            </div>
          </div>
        </div>

        {/* Win Rate */}
        <div className="glass-card rounded-2xl p-4 flex items-center gap-3 border border-white/5 shadow-card hover:border-sky-500/30 transition">
          <div className="h-11 w-11 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
              Matches Won
            </div>
            <div className="text-xl font-black font-outfit text-white">
              {profile.games_won}{' '}
              <span className="text-xs font-semibold text-text-muted">/ {profile.games_played}</span>
            </div>
          </div>
        </div>

        {/* Arena Coins */}
        <div className="glass-card rounded-2xl p-4 flex items-center gap-3 border border-white/5 shadow-card hover:border-trophy-gold/30 transition">
          <div className="h-11 w-11 rounded-xl bg-trophy-gold/10 border border-trophy-gold/25 flex items-center justify-center text-trophy-gold font-black font-outfit text-lg">
            🪙
          </div>
          <div>
            <div className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">
              Arena Coins
            </div>
            <div className="text-xl font-black font-outfit text-trophy-gold">
              {profile.coins}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Challenge Card: Scoreline Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-pitch-card via-pitch-dark to-pitch-black p-6 sm:p-8 shadow-2xl shadow-neon-green/5">
        {/* Stadium ambient light overlay */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-neon-green/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-trophy-gold/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            {/* Kicker tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-green/10 border border-neon-green/30 text-neon-green text-xs font-black uppercase tracking-wider">
              <Calendar className="h-3.5 w-3.5" />
              <span>Today&apos;s Featured Match Drama</span>
              <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-ping" />
            </div>

            {/* Title (Enlarged per user request: "make the scoreline hero text bigger") */}
            <div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-orbitron tracking-tight text-white leading-none">
                SCORELINE <span className="text-neon-green">HERO</span>
              </h1>
              <p className="text-base sm:text-lg text-text-secondary mt-2 font-medium">
                Predict the historic 2019 UEFA Champions League semifinal scoreline using dynamic hints, team lineups & match drama quotes.
              </p>
            </div>

            {/* Match Teaser Pill */}
            <div className="inline-flex items-center gap-4 p-3 rounded-2xl bg-pitch-black/60 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="relative h-7 w-7">
                  <Image src="/img/teams/barca.png" alt="Barcelona" fill className="object-contain" />
                </div>
                <span className="text-sm font-bold text-white">FC Barcelona</span>
              </div>
              <span className="text-xs font-black px-2 py-0.5 rounded bg-white/10 text-text-secondary font-orbitron">
                VS
              </span>
              <div className="flex items-center gap-2">
                <div className="relative h-7 w-7">
                  <Image src="/img/teams/liverpool.png" alt="Liverpool" fill className="object-contain" />
                </div>
                <span className="text-sm font-bold text-white">Liverpool</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/games/scoreline"
                className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-neon-green hover:bg-neon-green/90 text-pitch-black font-black font-outfit text-sm transition-all shadow-neon hover:shadow-neon-lg active:scale-95"
              >
                <Play className="h-4 w-4 fill-pitch-black" />
                CONTINUE PREDICTION
              </Link>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary px-3 py-2">
                <Clock className="h-4 w-4 text-trophy-gold" />
                <span>Expires in 08h 24m • +150 XP</span>
              </div>
            </div>
          </div>

          {/* Right Visual artwork / 3D Badge */}
          <div className="relative w-full lg:w-80 h-64 lg:h-72 rounded-2xl overflow-hidden border border-white/10 shadow-2xl group shrink-0">
            <Image
              src="/img/cards/scoreline_hero_art.png"
              alt="Scoreline Hero Featured"
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
      </section>

      {/* 3. Quick Play Section */}
      {/* Subtext removed per user request: "remove the subtext ply a game, anytime after quick play" */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black font-outfit text-white tracking-tight">
              Quick Play
            </h2>
          </div>
          <a
            href="#arena-modes"
            className="flex items-center gap-1 text-xs font-bold text-text-secondary hover:text-neon-green transition"
          >
            See all modes <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Square Cards with Full-Bleed Artwork and Frosted Bottom Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {QUICK_PLAY_MODES.map(mode => (
            <Link
              key={mode.id}
              href={mode.route}
              className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-pitch-card shadow-card hover:border-neon-green/40 hover:shadow-neon transition-all"
            >
              {/* Full-bleed card art */}
              <Image
                src={mode.cardArt}
                alt={mode.title}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition duration-500"
              />

              {/* Frosted Glass Bottom Overlay Strip */}
              <div className="absolute inset-x-0 bottom-0 p-3 bg-pitch-black/75 backdrop-blur-md border-t border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold font-outfit text-white group-hover:text-neon-green transition-colors leading-tight">
                    {mode.title}
                  </h3>
                  <span className="text-[10px] text-text-muted font-medium block">
                    {mode.dailyReward}
                  </span>
                </div>
                <div className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-neon-green group-hover:text-pitch-black transition">
                  <Play className="h-3 w-3 fill-current ml-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Scout's Duel PvP Matchmaking Callout Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-pitch-dark to-pitch-black p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
            <Swords className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase tracking-wider">
                Multiplayer Duel
              </span>
              <span className="text-xs text-text-muted">Live Matchmaking</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-outfit text-white">
              Scout&apos;s Duel: 1v1 Tactical Showdown
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-xl">
              Create a custom room with a 6-digit code or duel against our AI Manager. Who will guess the secret player first?
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/games/scouts-duel"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-black font-outfit text-xs transition shadow-lg shadow-rose-500/20 active:scale-95"
          >
            <Swords className="h-4 w-4" />
            ENTER DUEL ARENA
          </Link>
        </div>
      </section>

      {/* 5. All Game Modes (Defaulting to Grid Mode per user request) */}
      <section id="arena-modes" className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {/* User request: "remove text footygen arena" */}
            <h2 className="text-2xl font-black font-outfit text-white tracking-tight">
              Game Modes
            </h2>
            <p className="text-xs text-text-secondary">
              Select a challenge to build your scout rating and climb the leaderboards
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Category Filter Pills */}
            <div className="flex items-center bg-pitch-card p-1 rounded-xl border border-white/10 text-xs font-bold">
              {(['all', 'daily', 'trivia', 'pvp'] as GameCategory[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg capitalize transition ${
                    selectedCategory === cat
                      ? 'bg-neon-green text-pitch-black font-black'
                      : 'text-text-secondary hover:text-white'
                  }`}
                >
                  {cat === 'all' ? 'All (8)' : cat}
                </button>
              ))}
            </div>

            {/* Grid / List View Toggle */}
            <div className="flex items-center bg-pitch-card p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'grid' ? 'bg-white/15 text-white' : 'text-text-muted hover:text-white'
                }`}
                title="Grid Mode (Default)"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'list' ? 'bg-white/15 text-white' : 'text-text-muted hover:text-white'
                }`}
                title="List Mode"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Game Mode Cards in Grid Layout (Default) */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredModes.map(mode => {
              const Icon = ICON_MAP[mode.iconName] || Sparkles;
              return (
                <Link
                  key={mode.id}
                  href={mode.route}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-pitch-card/90 hover:border-neon-green/40 hover:shadow-neon transition-all duration-300"
                >
                  {/* Card Image Banner */}
                  <div className="relative w-full h-40 overflow-hidden bg-pitch-dark">
                    <Image
                      src={mode.cardArt}
                      alt={mode.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-pitch-card via-transparent to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-md font-black tracking-wider ${
                          mode.badge === 'DAILY'
                            ? 'bg-neon-green text-pitch-black'
                            : mode.badge === 'PVP'
                            ? 'bg-rose-500 text-white'
                            : mode.badge === 'HOT'
                            ? 'bg-amber-400 text-pitch-black'
                            : 'bg-white/20 text-white backdrop-blur-md'
                        }`}
                      >
                        {mode.badge}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-4 w-4" style={{ color: mode.accentColor }} />
                        <h3 className="text-base font-extrabold font-outfit text-white group-hover:text-neon-green transition-colors">
                          {mode.title}
                        </h3>
                      </div>
                      <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                        {mode.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                      <span className="font-bold text-neon-green">{mode.dailyReward}</span>
                      <span className="text-text-muted text-[11px] group-hover:text-white transition flex items-center gap-1 font-semibold">
                        Play now <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* List Mode */
          <div className="space-y-2">
            {filteredModes.map(mode => {
              const Icon = ICON_MAP[mode.iconName] || Sparkles;
              return (
                <Link
                  key={mode.id}
                  href={mode.route}
                  className="group flex items-center justify-between p-4 rounded-xl border border-white/10 bg-pitch-card hover:border-neon-green/40 hover:bg-pitch-cardHover transition"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative h-12 w-12 rounded-xl overflow-hidden shrink-0">
                      <Image
                        src={mode.cardArt}
                        alt={mode.title}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold font-outfit text-white truncate group-hover:text-neon-green transition">
                          {mode.title}
                        </h3>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-text-secondary font-black">
                          {mode.badge}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary truncate max-w-xl">
                        {mode.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 pl-4">
                    <span className="text-xs font-bold text-neon-green hidden sm:inline">
                      {mode.dailyReward}
                    </span>
                    <div className="p-2 rounded-lg bg-white/10 group-hover:bg-neon-green group-hover:text-pitch-black text-white transition">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

