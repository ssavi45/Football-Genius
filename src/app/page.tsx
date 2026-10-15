'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { GAME_MODES, QUICK_PLAY_MODES } from '@/lib/constants/game-modes';
import { GameCategory } from '@/lib/types/games';
import { sound } from '@/lib/utils/sound';
import ScoutPassportWidget from '@/components/dashboard/ScoutPassportWidget';
import DailyStreakWidget from '@/components/dashboard/DailyStreakWidget';
import QuickPvPWidget from '@/components/dashboard/QuickPvPWidget';
import FeaturedScorelineWidget from '@/components/dashboard/FeaturedScorelineWidget';
import {
  Sparkles,
  Grid3X3,
  Swords,
  PlaneTakeoff,
  TrendingUp,
  MessageSquareQuote,
  Shuffle,
  Eye,
  ArrowRight,
  Play,
  LayoutGrid,
  List,
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
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('all');
  // Default to grid mode per user specification
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredModes = GAME_MODES.filter(mode => {
    if (selectedCategory === 'all') return true;
    return mode.category === selectedCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fadeIn">
      {/* 1. Modular Stadium Dashboard Top HUD */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ScoutPassportWidget />
        <DailyStreakWidget />
        <QuickPvPWidget />
      </section>

      {/* 2. Featured Matchday Drama (Scoreline Hero) */}
      <section>
        <FeaturedScorelineWidget />
      </section>

      {/* 3. Quick Play Section (No subtext per user request) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black font-outfit text-white tracking-tight">
            Quick Play
          </h2>
          <a
            href="#game-modes"
            onMouseEnter={() => sound.playHover()}
            className="flex items-center gap-1 text-xs font-bold text-text-secondary hover:text-neon-green transition"
          >
            See all modes <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Square Cards with Full-Bleed Artwork and Frosted Glass Bottom Overlay */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {QUICK_PLAY_MODES.map(mode => (
            <Link
              key={mode.id}
              href={mode.route}
              onMouseEnter={() => sound.playHover()}
              onClick={() => sound.playClick()}
              className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-pitch-card shadow-card hover:border-neon-green/50 hover:shadow-neon transition-all duration-300"
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

      {/* 4. All Game Modes (Grid by default, clean header) */}
      <section id="game-modes" className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black font-outfit text-white tracking-tight">
              Game Modes
            </h2>
            <p className="text-xs text-text-secondary">
              Select a challenge to build your scout rating and climb the global ladder
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Pills */}
            <div className="flex items-center bg-pitch-card p-1 rounded-2xl border border-white/10 text-xs font-bold">
              {(['all', 'daily', 'trivia', 'pvp'] as GameCategory[]).map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    sound.playClick();
                    setSelectedCategory(cat);
                  }}
                  onMouseEnter={() => sound.playHover()}
                  className={`px-3.5 py-1.5 rounded-xl capitalize transition ${
                    selectedCategory === cat
                      ? 'bg-neon-green text-pitch-black font-black shadow-neon'
                      : 'text-text-secondary hover:text-white'
                  }`}
                >
                  {cat === 'all' ? 'All (8)' : cat}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-pitch-card p-1 rounded-2xl border border-white/10">
              <button
                onClick={() => {
                  sound.playClick();
                  setViewMode('grid');
                }}
                className={`p-1.5 rounded-xl transition ${
                  viewMode === 'grid' ? 'bg-white/15 text-white' : 'text-text-muted hover:text-white'
                }`}
                title="Grid Mode (Default)"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setViewMode('list');
                }}
                className={`p-1.5 rounded-xl transition ${
                  viewMode === 'list' ? 'bg-white/15 text-white' : 'text-text-muted hover:text-white'
                }`}
                title="List Mode"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Cards Grid (Default) */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredModes.map(mode => {
              const Icon = ICON_MAP[mode.iconName] || Sparkles;
              return (
                <Link
                  key={mode.id}
                  href={mode.route}
                  onMouseEnter={() => sound.playHover()}
                  onClick={() => sound.playClick()}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-pitch-card/90 hover:border-neon-green/50 hover:shadow-neon transition-all duration-300"
                >
                  {/* Card Art Banner */}
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
                  onMouseEnter={() => sound.playHover()}
                  onClick={() => sound.playClick()}
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
